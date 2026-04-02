// Copyright (c) 2013-2016 CoolGames

(function() {
/******************************************************************************
 * Spine Runtimes Software License
 * Version 2.3
 * 
 * Copyright (c) 2013-2015, Esoteric Software
 * All rights reserved.
 * 
 * You are granted a perpetual, non-exclusive, non-sublicensable and
 * non-transferable license to use, install, execute and perform the Spine
 * Runtimes Software (the "Software") and derivative works solely for personal
 * or internal use. Without the written permission of Esoteric Software (see
 * Section 2 of the Spine Software License Agreement), you may not (a) modify,
 * translate, adapt or otherwise create derivative works, improvements of the
 * Software or develop new applications using the Software or (b) remove,
 * delete, alter or obscure any trademarks or any copyright, trademark, patent
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 * 
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

var spine = {
	radDeg: 180 / Math.PI,
	degRad: Math.PI / 180,
	temp: [],
    Float32Array: (typeof(Float32Array) === 'undefined') ? Array : Float32Array,
    Uint16Array: (typeof(Uint16Array) === 'undefined') ? Array : Uint16Array
};

spine.BoneData = function (name, parent) {
	this.name = name;
	this.parent = parent;
};
spine.BoneData.prototype = {
	length: 0,
	x: 0, y: 0,
	rotation: 0,
	scaleX: 1, scaleY: 1,
	inheritScale: true,
	inheritRotation: true,
	flipX: false, flipY: false
};

spine.BlendMode = {
	normal: 0,
	additive: 1,
	multiply: 2,
	screen: 3
};

spine.SlotData = function (name, boneData) {
	this.name = name;
	this.boneData = boneData;
};
spine.SlotData.prototype = {
	r: 1, g: 1, b: 1, a: 1,
	attachmentName: null,
	blendMode: spine.BlendMode.normal
};

spine.IkConstraintData = function (name) {
	this.name = name;
	this.bones = [];
};
spine.IkConstraintData.prototype = {
	target: null,
	bendDirection: 1,
	mix: 1
};

spine.Bone = function (boneData, skeleton, parent) {
	this.data = boneData;
	this.skeleton = skeleton;
	this.parent = parent;
	this.setToSetupPose();
};
spine.Bone.yDown = false;
spine.Bone.prototype = {
	x: 0, y: 0,
	rotation: 0, rotationIK: 0,
	scaleX: 1, scaleY: 1,
	flipX: false, flipY: false,
	m00: 0, m01: 0, worldX: 0, // a b x
	m10: 0, m11: 0, worldY: 0, // c d y
	worldRotation: 0,
	worldScaleX: 1, worldScaleY: 1,
	worldFlipX: false, worldFlipY: false,
	updateWorldTransform: function () {
		var parent = this.parent;
		if (parent) {
			this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
			this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
			if (this.data.inheritScale) {
				this.worldScaleX = parent.worldScaleX * this.scaleX;
				this.worldScaleY = parent.worldScaleY * this.scaleY;
			} else {
				this.worldScaleX = this.scaleX;
				this.worldScaleY = this.scaleY;
			}
			this.worldRotation = this.data.inheritRotation ? (parent.worldRotation + this.rotationIK) : this.rotationIK;
			this.worldFlipX = parent.worldFlipX != this.flipX;
			this.worldFlipY = parent.worldFlipY != this.flipY;
		} else {
			var skeletonFlipX = this.skeleton.flipX, skeletonFlipY = this.skeleton.flipY;
			this.worldX = skeletonFlipX ? -this.x : this.x;
			this.worldY = (skeletonFlipY != spine.Bone.yDown) ? -this.y : this.y;
			this.worldScaleX = this.scaleX;
			this.worldScaleY = this.scaleY;
			this.worldRotation = this.rotationIK;
			this.worldFlipX = skeletonFlipX != this.flipX;
			this.worldFlipY = skeletonFlipY != this.flipY;
		}
		var radians = this.worldRotation * spine.degRad;
		var cos = Math.cos(radians);
		var sin = Math.sin(radians);
		if (this.worldFlipX) {
			this.m00 = -cos * this.worldScaleX;
			this.m01 = sin * this.worldScaleY;
		} else {
			this.m00 = cos * this.worldScaleX;
			this.m01 = -sin * this.worldScaleY;
		}
		if (this.worldFlipY != spine.Bone.yDown) {
			this.m10 = -sin * this.worldScaleX;
			this.m11 = -cos * this.worldScaleY;
		} else {
			this.m10 = sin * this.worldScaleX;
			this.m11 = cos * this.worldScaleY;
		}
	},
	setToSetupPose: function () {
		var data = this.data;
		this.x = data.x;
		this.y = data.y;
		this.rotation = data.rotation;
		this.rotationIK = this.rotation;
		this.scaleX = data.scaleX;
		this.scaleY = data.scaleY;
		this.flipX = data.flipX;
		this.flipY = data.flipY;
	},
	worldToLocal: function (world) {
		var dx = world[0] - this.worldX, dy = world[1] - this.worldY;
		var m00 = this.m00, m10 = this.m10, m01 = this.m01, m11 = this.m11;
		if (this.worldFlipX != (this.worldFlipY != spine.Bone.yDown)) {
			m00 = -m00;
			m11 = -m11;
		}
		var invDet = 1 / (m00 * m11 - m01 * m10);
		world[0] = dx * m00 * invDet - dy * m01 * invDet;
		world[1] = dy * m11 * invDet - dx * m10 * invDet;
	},
	localToWorld: function (local) {
		var localX = local[0], localY = local[1];
		local[0] = localX * this.m00 + localY * this.m01 + this.worldX;
		local[1] = localX * this.m10 + localY * this.m11 + this.worldY;
	}
};

spine.Slot = function (slotData, bone) {
	this.data = slotData;
	this.bone = bone;
	this.setToSetupPose();
};
spine.Slot.prototype = {
	r: 1, g: 1, b: 1, a: 1,
	_attachmentTime: 0,
	attachment: null,
	attachmentVertices: [],
	setAttachment: function (attachment) {
		if (this.attachment == attachment) return;
		this.attachment = attachment;
		this._attachmentTime = this.bone.skeleton.time;
		this.attachmentVertices.length = 0;
	},
	setAttachmentTime: function (time) {
		this._attachmentTime = this.bone.skeleton.time - time;
	},
	getAttachmentTime: function () {
		return this.bone.skeleton.time - this._attachmentTime;
	},
	setToSetupPose: function () {
		var data = this.data;
		this.r = data.r;
		this.g = data.g;
		this.b = data.b;
		this.a = data.a;

		if (!data.attachmentName)
			this.setAttachment(null);
		else {
			var slotDatas = this.bone.skeleton.data.slots;
			for (var i = 0, n = slotDatas.length; i < n; i++) {
				if (slotDatas[i] == data) {
					this.attachment = null;
					this.setAttachment(this.bone.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
					break;
				}
			}
		}
	}
};

spine.IkConstraint = function (data, skeleton) {
	this.data = data;
	this.mix = data.mix;
	this.bendDirection = data.bendDirection;

	this.bones = [];
	for (var i = 0, n = data.bones.length; i < n; i++)
		this.bones.push(skeleton.findBone(data.bones[i].name));
	this.target = skeleton.findBone(data.target.name);
};
spine.IkConstraint.prototype = {
	apply: function () {
		var target = this.target;
		var bones = this.bones;
		switch (bones.length) {
		case 1:
			spine.IkConstraint.apply1(bones[0], target.worldX, target.worldY, this.mix);
			break;
		case 2:
			spine.IkConstraint.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.mix);
			break;
		}
	}
};
/** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
 * coordinate system. */
spine.IkConstraint.apply1 = function (bone, targetX, targetY, alpha) {
	var parentRotation = (!bone.data.inheritRotation || !bone.parent) ? 0 : bone.parent.worldRotation;
	var rotation = bone.rotation;
	var rotationIK = Math.atan2(targetY - bone.worldY, targetX - bone.worldX) * spine.radDeg;
	if (bone.worldFlipX != (bone.worldFlipY != spine.Bone.yDown)) rotationIK = -rotationIK;
	rotationIK -= parentRotation;
	bone.rotationIK = rotation + (rotationIK - rotation) * alpha;
};
/** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
 * target is specified in the world coordinate system.
 * @param child Any descendant bone of the parent. */
spine.IkConstraint.apply2 = function (parent, child, targetX, targetY, bendDirection, alpha) {
	var childRotation = child.rotation, parentRotation = parent.rotation;
	if (!alpha) {
		child.rotationIK = childRotation;
		parent.rotationIK = parentRotation;
		return;
	}
	var positionX, positionY, tempPosition = spine.temp;
	var parentParent = parent.parent;
	if (parentParent) {
		tempPosition[0] = targetX;
		tempPosition[1] = targetY;
		parentParent.worldToLocal(tempPosition);
		targetX = (tempPosition[0] - parent.x) * parentParent.worldScaleX;
		targetY = (tempPosition[1] - parent.y) * parentParent.worldScaleY;
	} else {
		targetX -= parent.x;
		targetY -= parent.y;
	}
	if (child.parent == parent) {
		positionX = child.x;
		positionY = child.y;
	} else {
		tempPosition[0] = child.x;
		tempPosition[1] = child.y;
		child.parent.localToWorld(tempPosition);
		parent.worldToLocal(tempPosition);
		positionX = tempPosition[0];
		positionY = tempPosition[1];
	}
	var childX = positionX * parent.worldScaleX, childY = positionY * parent.worldScaleY;
	var offset = Math.atan2(childY, childX);
	var len1 = Math.sqrt(childX * childX + childY * childY), len2 = child.data.length * child.worldScaleX;
	// Based on code by Ryan Juckett with permission: Copyright (c) 2008-2009 Ryan Juckett, http://www.ryanjuckett.com/
	var cosDenom = 2 * len1 * len2;
	if (cosDenom < 0.0001) {
		child.rotationIK = childRotation + (Math.atan2(targetY, targetX) * spine.radDeg - parentRotation - childRotation) * alpha;
		return;
	}
	var cos = (targetX * targetX + targetY * targetY - len1 * len1 - len2 * len2) / cosDenom;
	if (cos < -1)
		cos = -1;
	else if (cos > 1)
		cos = 1;
	var childAngle = Math.acos(cos) * bendDirection;
	var adjacent = len1 + len2 * cos, opposite = len2 * Math.sin(childAngle);
	var parentAngle = Math.atan2(targetY * adjacent - targetX * opposite, targetX * adjacent + targetY * opposite);
	var rotation = (parentAngle - offset) * spine.radDeg - parentRotation;
	if (rotation > 180)
		rotation -= 360;
	else if (rotation < -180) //
		rotation += 360;
	parent.rotationIK = parentRotation + rotation * alpha;
	rotation = (childAngle + offset) * spine.radDeg - childRotation;
	if (rotation > 180)
		rotation -= 360;
	else if (rotation < -180) //
		rotation += 360;
	child.rotationIK = childRotation + (rotation + parent.worldRotation - child.parent.worldRotation) * alpha;
};

spine.Skin = function (name) {
	this.name = name;
	this.attachments = {};
};
spine.Skin.prototype = {
	addAttachment: function (slotIndex, name, attachment) {
		this.attachments[slotIndex + ":" + name] = attachment;
	},
	getAttachment: function (slotIndex, name) {
		return this.attachments[slotIndex + ":" + name];
	},
	_attachAll: function (skeleton, oldSkin) {
		for (var key in oldSkin.attachments) {
			var colon = key.indexOf(":");
			var slotIndex = parseInt(key.substring(0, colon));
			var name = key.substring(colon + 1);
			var slot = skeleton.slots[slotIndex];
			if (slot.attachment && slot.attachment.name == name) {
				var attachment = this.getAttachment(slotIndex, name);
				if (attachment) slot.setAttachment(attachment);
			}
		}
	}
};

spine.Animation = function (name, timelines, duration) {
	this.name = name;
	this.timelines = timelines;
	this.duration = duration;
};
spine.Animation.prototype = {
	apply: function (skeleton, lastTime, time, loop, events) {
		if (loop && this.duration != 0) {
			time %= this.duration;
			lastTime %= this.duration;
		}
		var timelines = this.timelines;
		for (var i = 0, n = timelines.length; i < n; i++)
			timelines[i].apply(skeleton, lastTime, time, events, 1);
	},
	mix: function (skeleton, lastTime, time, loop, events, alpha) {
		if (loop && this.duration != 0) {
			time %= this.duration;
			lastTime %= this.duration;
		}
		var timelines = this.timelines;
		for (var i = 0, n = timelines.length; i < n; i++)
			timelines[i].apply(skeleton, lastTime, time, events, alpha);
	}
};
spine.Animation.binarySearch = function (values, target, step) {
	var low = 0;
	var high = Math.floor(values.length / step) - 2;
	if (!high) return step;
	var current = high >>> 1;
	while (true) {
		if (values[(current + 1) * step] <= target)
			low = current + 1;
		else
			high = current;
		if (low == high) return (low + 1) * step;
		current = (low + high) >>> 1;
	}
};
spine.Animation.binarySearch1 = function (values, target) {
	var low = 0;
	var high = values.length - 2;
	if (!high) return 1;
	var current = high >>> 1;
	while (true) {
		if (values[current + 1] <= target)
			low = current + 1;
		else
			high = current;
		if (low == high) return low + 1;
		current = (low + high) >>> 1;
	}
};
spine.Animation.linearSearch = function (values, target, step) {
	for (var i = 0, last = values.length - step; i <= last; i += step)
		if (values[i] > target) return i;
	return -1;
};

spine.Curves = function (frameCount) {
	this.curves = []; // type, x, y, ...
	//this.curves.length = (frameCount - 1) * 19/*BEZIER_SIZE*/;
};
spine.Curves.prototype = {
	setLinear: function (frameIndex) {
		this.curves[frameIndex * 19/*BEZIER_SIZE*/] = 0/*LINEAR*/;
	},
	setStepped: function (frameIndex) {
		this.curves[frameIndex * 19/*BEZIER_SIZE*/] = 1/*STEPPED*/;
	},
	/** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
	 * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
	 * the difference between the keyframe's values. */
	setCurve: function (frameIndex, cx1, cy1, cx2, cy2) {
		var subdiv1 = 1 / 10/*BEZIER_SEGMENTS*/, subdiv2 = subdiv1 * subdiv1, subdiv3 = subdiv2 * subdiv1;
		var pre1 = 3 * subdiv1, pre2 = 3 * subdiv2, pre4 = 6 * subdiv2, pre5 = 6 * subdiv3;
		var tmp1x = -cx1 * 2 + cx2, tmp1y = -cy1 * 2 + cy2, tmp2x = (cx1 - cx2) * 3 + 1, tmp2y = (cy1 - cy2) * 3 + 1;
		var dfx = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv3, dfy = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv3;
		var ddfx = tmp1x * pre4 + tmp2x * pre5, ddfy = tmp1y * pre4 + tmp2y * pre5;
		var dddfx = tmp2x * pre5, dddfy = tmp2y * pre5;

		var i = frameIndex * 19/*BEZIER_SIZE*/;
		var curves = this.curves;
		curves[i++] = 2/*BEZIER*/;
		
		var x = dfx, y = dfy;
		for (var n = i + 19/*BEZIER_SIZE*/ - 1; i < n; i += 2) {
			curves[i] = x;
			curves[i + 1] = y;
			dfx += ddfx;
			dfy += ddfy;
			ddfx += dddfx;
			ddfy += dddfy;
			x += dfx;
			y += dfy;
		}
	},
	getCurvePercent: function (frameIndex, percent) {
		percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);
		var curves = this.curves;
		var i = frameIndex * 19/*BEZIER_SIZE*/;
		var type = curves[i];
		if (type === 0/*LINEAR*/) return percent;
		if (type == 1/*STEPPED*/) return 0;
		i++;
		var x = 0;
		for (var start = i, n = i + 19/*BEZIER_SIZE*/ - 1; i < n; i += 2) {
			x = curves[i];
			if (x >= percent) {
				var prevX, prevY;
				if (i == start) {
					prevX = 0;
					prevY = 0;
				} else {
					prevX = curves[i - 2];
					prevY = curves[i - 1];
				}
				return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
			}
		}
		var y = curves[i - 1];
		return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
	}
};

spine.RotateTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, angle, ...
	this.frames.length = frameCount * 2;
};
spine.RotateTimeline.prototype = {
	boneIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 2;
	},
	setFrame: function (frameIndex, time, angle) {
		frameIndex *= 2;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = angle;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var bone = skeleton.bones[this.boneIndex];

		if (time >= frames[frames.length - 2]) { // Time is after last frame.
			var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
			while (amount > 180)
				amount -= 360;
			while (amount < -180)
				amount += 360;
			bone.rotation += amount * alpha;
			return;
		}

		// Interpolate between the previous frame and the current frame.
		var frameIndex = spine.Animation.binarySearch(frames, time, 2);
		var prevFrameValue = frames[frameIndex - 1];
		var frameTime = frames[frameIndex];
		var percent = 1 - (time - frameTime) / (frames[frameIndex - 2/*PREV_FRAME_TIME*/] - frameTime);
		percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);

		var amount = frames[frameIndex + 1/*FRAME_VALUE*/] - prevFrameValue;
		while (amount > 180)
			amount -= 360;
		while (amount < -180)
			amount += 360;
		amount = bone.data.rotation + (prevFrameValue + amount * percent) - bone.rotation;
		while (amount > 180)
			amount -= 360;
		while (amount < -180)
			amount += 360;
		bone.rotation += amount * alpha;
	}
};

spine.TranslateTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, x, y, ...
	this.frames.length = frameCount * 3;
};
spine.TranslateTimeline.prototype = {
	boneIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 3;
	},
	setFrame: function (frameIndex, time, x, y) {
		frameIndex *= 3;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = x;
		this.frames[frameIndex + 2] = y;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var bone = skeleton.bones[this.boneIndex];

		if (time >= frames[frames.length - 3]) { // Time is after last frame.
			bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
			bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
			return;
		}

		// Interpolate between the previous frame and the current frame.
		var frameIndex = spine.Animation.binarySearch(frames, time, 3);
		var prevFrameX = frames[frameIndex - 2];
		var prevFrameY = frames[frameIndex - 1];
		var frameTime = frames[frameIndex];
		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);
		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

		bone.x += (bone.data.x + prevFrameX + (frames[frameIndex + 1/*FRAME_X*/] - prevFrameX) * percent - bone.x) * alpha;
		bone.y += (bone.data.y + prevFrameY + (frames[frameIndex + 2/*FRAME_Y*/] - prevFrameY) * percent - bone.y) * alpha;
	}
};

spine.ScaleTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, x, y, ...
	this.frames.length = frameCount * 3;
};
spine.ScaleTimeline.prototype = {
	boneIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 3;
	},
	setFrame: function (frameIndex, time, x, y) {
		frameIndex *= 3;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = x;
		this.frames[frameIndex + 2] = y;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var bone = skeleton.bones[this.boneIndex];

		if (time >= frames[frames.length - 3]) { // Time is after last frame.
			bone.scaleX += (bone.data.scaleX * frames[frames.length - 2] - bone.scaleX) * alpha;
			bone.scaleY += (bone.data.scaleY * frames[frames.length - 1] - bone.scaleY) * alpha;
			return;
		}

		// Interpolate between the previous frame and the current frame.
		var frameIndex = spine.Animation.binarySearch(frames, time, 3);
		var prevFrameX = frames[frameIndex - 2];
		var prevFrameY = frames[frameIndex - 1];
		var frameTime = frames[frameIndex];
		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);
		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

		bone.scaleX += (bone.data.scaleX * (prevFrameX + (frames[frameIndex + 1/*FRAME_X*/] - prevFrameX) * percent) - bone.scaleX) * alpha;
		bone.scaleY += (bone.data.scaleY * (prevFrameY + (frames[frameIndex + 2/*FRAME_Y*/] - prevFrameY) * percent) - bone.scaleY) * alpha;
	}
};

spine.ColorTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, r, g, b, a, ...
	this.frames.length = frameCount * 5;
};
spine.ColorTimeline.prototype = {
	slotIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 5;
	},
	setFrame: function (frameIndex, time, r, g, b, a) {
		frameIndex *= 5;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = r;
		this.frames[frameIndex + 2] = g;
		this.frames[frameIndex + 3] = b;
		this.frames[frameIndex + 4] = a;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var r, g, b, a;
		if (time >= frames[frames.length - 5]) {
			// Time is after last frame.
			var i = frames.length - 1;
			r = frames[i - 3];
			g = frames[i - 2];
			b = frames[i - 1];
			a = frames[i];
		} else {
			// Interpolate between the previous frame and the current frame.
			var frameIndex = spine.Animation.binarySearch(frames, time, 5);
			var prevFrameR = frames[frameIndex - 4];
			var prevFrameG = frames[frameIndex - 3];
			var prevFrameB = frames[frameIndex - 2];
			var prevFrameA = frames[frameIndex - 1];
			var frameTime = frames[frameIndex];
			var percent = 1 - (time - frameTime) / (frames[frameIndex - 5/*PREV_FRAME_TIME*/] - frameTime);
			percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);

			r = prevFrameR + (frames[frameIndex + 1/*FRAME_R*/] - prevFrameR) * percent;
			g = prevFrameG + (frames[frameIndex + 2/*FRAME_G*/] - prevFrameG) * percent;
			b = prevFrameB + (frames[frameIndex + 3/*FRAME_B*/] - prevFrameB) * percent;
			a = prevFrameA + (frames[frameIndex + 4/*FRAME_A*/] - prevFrameA) * percent;
		}
		var slot = skeleton.slots[this.slotIndex];
		if (alpha < 1) {
			slot.r += (r - slot.r) * alpha;
			slot.g += (g - slot.g) * alpha;
			slot.b += (b - slot.b) * alpha;
			slot.a += (a - slot.a) * alpha;
		} else {
			slot.r = r;
			slot.g = g;
			slot.b = b;
			slot.a = a;
		}
	}
};

spine.AttachmentTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, ...
	this.frames.length = frameCount;
	this.attachmentNames = [];
	this.attachmentNames.length = frameCount;
};
spine.AttachmentTimeline.prototype = {
	slotIndex: 0,
	getFrameCount: function () {
		return this.frames.length;
	},
	setFrame: function (frameIndex, time, attachmentName) {
		this.frames[frameIndex] = time;
		this.attachmentNames[frameIndex] = attachmentName;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) {
			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
			return;
		} else if (lastTime > time) //
			lastTime = -1;

		var frameIndex = time >= frames[frames.length - 1] ? frames.length - 1 : spine.Animation.binarySearch1(frames, time) - 1;
		if (frames[frameIndex] < lastTime) return;

		var attachmentName = this.attachmentNames[frameIndex];
		skeleton.slots[this.slotIndex].setAttachment(
			!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
	}
};

spine.EventTimeline = function (frameCount) {
	this.frames = []; // time, ...
	this.frames.length = frameCount;
	this.events = [];
	this.events.length = frameCount;
};
spine.EventTimeline.prototype = {
	getFrameCount: function () {
		return this.frames.length;
	},
	setFrame: function (frameIndex, time, event) {
		this.frames[frameIndex] = time;
		this.events[frameIndex] = event;
	},
	/** Fires events for frames > lastTime and <= time. */
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		if (!firedEvents) return;

		var frames = this.frames;
		var frameCount = frames.length;

		if (lastTime > time) { // Fire events after last time for looped animations.
			this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);
			lastTime = -1;
		} else if (lastTime >= frames[frameCount - 1]) // Last time is after last frame.
			return;
		if (time < frames[0]) return; // Time is before first frame.

		var frameIndex;
		if (lastTime < frames[0])
			frameIndex = 0;
		else {
			frameIndex = spine.Animation.binarySearch1(frames, lastTime);
			var frame = frames[frameIndex];
			while (frameIndex > 0) { // Fire multiple events with the same frame.
				if (frames[frameIndex - 1] != frame) break;
				frameIndex--;
			}
		}
		var events = this.events;
		for (; frameIndex < frameCount && time >= frames[frameIndex]; frameIndex++)
			firedEvents.push(events[frameIndex]);
	}
};

spine.DrawOrderTimeline = function (frameCount) {
	this.frames = []; // time, ...
	this.frames.length = frameCount;
	this.drawOrders = [];
	this.drawOrders.length = frameCount;
};
spine.DrawOrderTimeline.prototype = {
	getFrameCount: function () {
		return this.frames.length;
	},
	setFrame: function (frameIndex, time, drawOrder) {
		this.frames[frameIndex] = time;
		this.drawOrders[frameIndex] = drawOrder;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var frameIndex;
		if (time >= frames[frames.length - 1]) // Time is after last frame.
			frameIndex = frames.length - 1;
		else
			frameIndex = spine.Animation.binarySearch1(frames, time) - 1;

		var drawOrder = skeleton.drawOrder;
		var slots = skeleton.slots;
		var drawOrderToSetupIndex = this.drawOrders[frameIndex];
		if (!drawOrderToSetupIndex) {
			for (var i = 0, n = slots.length; i < n; i++)
				drawOrder[i] = slots[i];
		} else {
			for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
				drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];
		}

	}
};

spine.FfdTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = [];
	this.frames.length = frameCount;
	this.frameVertices = [];
	this.frameVertices.length = frameCount;
};
spine.FfdTimeline.prototype = {
	slotIndex: 0,
	attachment: 0,
	getFrameCount: function () {
		return this.frames.length;
	},
	setFrame: function (frameIndex, time, vertices) {
		this.frames[frameIndex] = time;
		this.frameVertices[frameIndex] = vertices;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var slot = skeleton.slots[this.slotIndex];
		if (slot.attachment != this.attachment) return;

		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var frameVertices = this.frameVertices;
		var vertexCount = frameVertices[0].length;

		var vertices = slot.attachmentVertices;
		if (vertices.length != vertexCount) alpha = 1;
		vertices.length = vertexCount;

		if (time >= frames[frames.length - 1]) { // Time is after last frame.
			var lastVertices = frameVertices[frames.length - 1];
			if (alpha < 1) {
				for (var i = 0; i < vertexCount; i++)
					vertices[i] += (lastVertices[i] - vertices[i]) * alpha;
			} else {
				for (var i = 0; i < vertexCount; i++)
					vertices[i] = lastVertices[i];
			}
			return;
		}

		// Interpolate between the previous frame and the current frame.
		var frameIndex = spine.Animation.binarySearch1(frames, time);
		var frameTime = frames[frameIndex];
		var percent = 1 - (time - frameTime) / (frames[frameIndex - 1] - frameTime);
		percent = this.curves.getCurvePercent(frameIndex - 1, percent < 0 ? 0 : (percent > 1 ? 1 : percent));

		var prevVertices = frameVertices[frameIndex - 1];
		var nextVertices = frameVertices[frameIndex];

		if (alpha < 1) {
			for (var i = 0; i < vertexCount; i++) {
				var prev = prevVertices[i];
				vertices[i] += (prev + (nextVertices[i] - prev) * percent - vertices[i]) * alpha;
			}
		} else {
			for (var i = 0; i < vertexCount; i++) {
				var prev = prevVertices[i];
				vertices[i] = prev + (nextVertices[i] - prev) * percent;
			}
		}
	}
};

spine.IkConstraintTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, mix, bendDirection, ...
	this.frames.length = frameCount * 3;
};
spine.IkConstraintTimeline.prototype = {
	ikConstraintIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 3;
	},
	setFrame: function (frameIndex, time, mix, bendDirection) {
		frameIndex *= 3;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = mix;
		this.frames[frameIndex + 2] = bendDirection;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) return; // Time is before first frame.

		var ikConstraint = skeleton.ikConstraints[this.ikConstraintIndex];

		if (time >= frames[frames.length - 3]) { // Time is after last frame.
			ikConstraint.mix += (frames[frames.length - 2] - ikConstraint.mix) * alpha;
			ikConstraint.bendDirection = frames[frames.length - 1];
			return;
		}

		// Interpolate between the previous frame and the current frame.
		var frameIndex = spine.Animation.binarySearch(frames, time, 3);
		var prevFrameMix = frames[frameIndex + -2/*PREV_FRAME_MIX*/];
		var frameTime = frames[frameIndex];
		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);
		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

		var mix = prevFrameMix + (frames[frameIndex + 1/*FRAME_MIX*/] - prevFrameMix) * percent;
		ikConstraint.mix += (mix - ikConstraint.mix) * alpha;
		ikConstraint.bendDirection = frames[frameIndex + -1/*PREV_FRAME_BEND_DIRECTION*/];
	}
};

spine.FlipXTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, flip, ...
	this.frames.length = frameCount * 2;
};
spine.FlipXTimeline.prototype = {
	boneIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 2;
	},
	setFrame: function (frameIndex, time, flip) {
		frameIndex *= 2;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = flip ? 1 : 0;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) {
			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
			return;
		} else if (lastTime > time) //
			lastTime = -1;
		var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;
		if (frames[frameIndex] < lastTime) return;
		skeleton.bones[this.boneIndex].flipX = frames[frameIndex + 1] != 0;
	}
};

spine.FlipYTimeline = function (frameCount) {
	this.curves = new spine.Curves(frameCount);
	this.frames = []; // time, flip, ...
	this.frames.length = frameCount * 2;
};
spine.FlipYTimeline.prototype = {
	boneIndex: 0,
	getFrameCount: function () {
		return this.frames.length / 2;
	},
	setFrame: function (frameIndex, time, flip) {
		frameIndex *= 2;
		this.frames[frameIndex] = time;
		this.frames[frameIndex + 1] = flip ? 1 : 0;
	},
	apply: function (skeleton, lastTime, time, firedEvents, alpha) {
		var frames = this.frames;
		if (time < frames[0]) {
			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
			return;
		} else if (lastTime > time) //
			lastTime = -1;
		var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;
		if (frames[frameIndex] < lastTime) return;
		skeleton.bones[this.boneIndex].flipY = frames[frameIndex + 1] != 0;
	}
};

spine.SkeletonData = function () {
	this.bones = [];
	this.slots = [];
	this.skins = [];
	this.events = [];
	this.animations = [];
	this.ikConstraints = [];
};
spine.SkeletonData.prototype = {
	name: null,
	defaultSkin: null,
	width: 0, height: 0,
	version: null, hash: null,
	/** @return May be null. */
	findBone: function (boneName) {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++)
			if (bones[i].name == boneName) return bones[i];
		return null;
	},
	/** @return -1 if the bone was not found. */
	findBoneIndex: function (boneName) {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++)
			if (bones[i].name == boneName) return i;
		return -1;
	},
	/** @return May be null. */
	findSlot: function (slotName) {
		var slots = this.slots;
		for (var i = 0, n = slots.length; i < n; i++) {
			if (slots[i].name == slotName) return slot[i];
		}
		return null;
	},
	/** @return -1 if the bone was not found. */
	findSlotIndex: function (slotName) {
		var slots = this.slots;
		for (var i = 0, n = slots.length; i < n; i++)
			if (slots[i].name == slotName) return i;
		return -1;
	},
	/** @return May be null. */
	findSkin: function (skinName) {
		var skins = this.skins;
		for (var i = 0, n = skins.length; i < n; i++)
			if (skins[i].name == skinName) return skins[i];
		return null;
	},
	/** @return May be null. */
	findEvent: function (eventName) {
		var events = this.events;
		for (var i = 0, n = events.length; i < n; i++)
			if (events[i].name == eventName) return events[i];
		return null;
	},
	/** @return May be null. */
	findAnimation: function (animationName) {
		var animations = this.animations;
		for (var i = 0, n = animations.length; i < n; i++)
			if (animations[i].name == animationName) return animations[i];
		return null;
	},
	/** @return May be null. */
	findIkConstraint: function (ikConstraintName) {
		var ikConstraints = this.ikConstraints;
		for (var i = 0, n = ikConstraints.length; i < n; i++)
			if (ikConstraints[i].name == ikConstraintName) return ikConstraints[i];
		return null;
	}
};

spine.Skeleton = function (skeletonData) {
	this.data = skeletonData;

	this.bones = [];
	for (var i = 0, n = skeletonData.bones.length; i < n; i++) {
		var boneData = skeletonData.bones[i];
		var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
		this.bones.push(new spine.Bone(boneData, this, parent));
	}

	this.slots = [];
	this.drawOrder = [];
	for (var i = 0, n = skeletonData.slots.length; i < n; i++) {
		var slotData = skeletonData.slots[i];
		var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
		var slot = new spine.Slot(slotData, bone);
		this.slots.push(slot);
		this.drawOrder.push(slot);
	}
	
	this.ikConstraints = [];
	for (var i = 0, n = skeletonData.ikConstraints.length; i < n; i++)
		this.ikConstraints.push(new spine.IkConstraint(skeletonData.ikConstraints[i], this));

	this.boneCache = [];
	this.updateCache();
};
spine.Skeleton.prototype = {
	x: 0, y: 0,
	skin: null,
	r: 1, g: 1, b: 1, a: 1,
	time: 0,
	flipX: false, flipY: false,
	/** Caches information about bones and IK constraints. Must be called if bones or IK constraints are added or removed. */
	updateCache: function () {
		var ikConstraints = this.ikConstraints;
		var ikConstraintsCount = ikConstraints.length;

		var arrayCount = ikConstraintsCount + 1;
		var boneCache = this.boneCache;
		if (boneCache.length > arrayCount) boneCache.length = arrayCount;
		for (var i = 0, n = boneCache.length; i < n; i++)
			boneCache[i].length = 0;
		while (boneCache.length < arrayCount)
			boneCache[boneCache.length] = [];

		var nonIkBones = boneCache[0];
		var bones = this.bones;

		outer:
		for (var i = 0, n = bones.length; i < n; i++) {
			var bone = bones[i];
			var current = bone;
			do {
				for (var ii = 0; ii < ikConstraintsCount; ii++) {
					var ikConstraint = ikConstraints[ii];
					var parent = ikConstraint.bones[0];
					var child= ikConstraint.bones[ikConstraint.bones.length - 1];
					while (true) {
						if (current == child) {
							boneCache[ii].push(bone);
							boneCache[ii + 1].push(bone);
							continue outer;
						}
						if (child == parent) break;
						child = child.parent;
					}
				}
				current = current.parent;
			} while (current);
			nonIkBones[nonIkBones.length] = bone;
		}
	},
	/** Updates the world transform for each bone. */
	updateWorldTransform: function () {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++) {
			var bone = bones[i];
			bone.rotationIK = bone.rotation;
		}
		var i = 0, last = this.boneCache.length - 1;
		while (true) {
			var cacheBones = this.boneCache[i];
			for (var ii = 0, nn = cacheBones.length; ii < nn; ii++)
				cacheBones[ii].updateWorldTransform();
			if (i == last) break;
			this.ikConstraints[i].apply();
			i++;
		}
	},
	/** Sets the bones and slots to their setup pose values. */
	setToSetupPose: function () {
		this.setBonesToSetupPose();
		this.setSlotsToSetupPose();
	},
	setBonesToSetupPose: function () {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++)
			bones[i].setToSetupPose();

		var ikConstraints = this.ikConstraints;
		for (var i = 0, n = ikConstraints.length; i < n; i++) {
			var ikConstraint = ikConstraints[i];
			ikConstraint.bendDirection = ikConstraint.data.bendDirection;
			ikConstraint.mix = ikConstraint.data.mix;
		}
	},
	setSlotsToSetupPose: function () {
		var slots = this.slots;
		var drawOrder = this.drawOrder;
		for (var i = 0, n = slots.length; i < n; i++) {
			drawOrder[i] = slots[i];
			slots[i].setToSetupPose(i);
		}
	},
	/** @return May return null. */
	getRootBone: function () {
		return this.bones.length ? this.bones[0] : null;
	},
	/** @return May be null. */
	findBone: function (boneName) {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++)
			if (bones[i].data.name == boneName) return bones[i];
		return null;
	},
	/** @return -1 if the bone was not found. */
	findBoneIndex: function (boneName) {
		var bones = this.bones;
		for (var i = 0, n = bones.length; i < n; i++)
			if (bones[i].data.name == boneName) return i;
		return -1;
	},
	/** @return May be null. */
	findSlot: function (slotName) {
		var slots = this.slots;
		for (var i = 0, n = slots.length; i < n; i++)
			if (slots[i].data.name == slotName) return slots[i];
		return null;
	},
	/** @return -1 if the bone was not found. */
	findSlotIndex: function (slotName) {
		var slots = this.slots;
		for (var i = 0, n = slots.length; i < n; i++)
			if (slots[i].data.name == slotName) return i;
		return -1;
	},
	setSkinByName: function (skinName) {
		var skin = this.data.findSkin(skinName);
		if (!skin) throw "Skin not found: " + skinName;
		this.setSkin(skin);
	},
	/** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}. 
	 * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was 
	 * no old skin, each slot's setup mode attachment is attached from the new skin.
	 * @param newSkin May be null. */
	setSkin: function (newSkin) {
		if (newSkin) {
			if (this.skin)
				newSkin._attachAll(this, this.skin);
			else {
				var slots = this.slots;
				for (var i = 0, n = slots.length; i < n; i++) {
					var slot = slots[i];
					var name = slot.data.attachmentName;
					if (name) {
						var attachment = newSkin.getAttachment(i, name);
						if (attachment) slot.setAttachment(attachment);
					}
				}
			}
		}
		this.skin = newSkin;
	},
	/** @return May be null. */
	getAttachmentBySlotName: function (slotName, attachmentName) {
		return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
	},
	/** @return May be null. */
	getAttachmentBySlotIndex: function (slotIndex, attachmentName) {
		if (this.skin) {
			var attachment = this.skin.getAttachment(slotIndex, attachmentName);
			if (attachment) return attachment;
		}
		if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
		return null;
	},
	/** @param attachmentName May be null. */
	setAttachment: function (slotName, attachmentName) {
		var slots = this.slots;
		for (var i = 0, n = slots.length; i < n; i++) {
			var slot = slots[i];
			if (slot.data.name == slotName) {
				var attachment = null;
				if (attachmentName) {
					attachment = this.getAttachmentBySlotIndex(i, attachmentName);
					if (!attachment) throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
				}
				slot.setAttachment(attachment);
				return;
			}
		}
		throw "Slot not found: " + slotName;
	},
	/** @return May be null. */
	findIkConstraint: function (ikConstraintName) {
		var ikConstraints = this.ikConstraints;
		for (var i = 0, n = ikConstraints.length; i < n; i++)
			if (ikConstraints[i].data.name == ikConstraintName) return ikConstraints[i];
		return null;
	},
	update: function (delta) {
		this.time += delta;
	}
};

spine.EventData = function (name) {
	this.name = name;
};
spine.EventData.prototype = {
	intValue: 0,
	floatValue: 0,
	stringValue: null
};

spine.Event = function (data) {
	this.data = data;
};
spine.Event.prototype = {
	intValue: 0,
	floatValue: 0,
	stringValue: null
};

spine.AttachmentType = {
	region: 0,
	boundingbox: 1,
	mesh: 2,
	skinnedmesh: 3
};

spine.RegionAttachment = function (name) {
	this.name = name;
	this.offset = [];
	this.offset.length = 8;
	this.uvs = [];
	this.uvs.length = 8;
};
spine.RegionAttachment.prototype = {
	type: spine.AttachmentType.region,
	x: 0, y: 0,
	rotation: 0,
	scaleX: 1, scaleY: 1,
	width: 0, height: 0,
	r: 1, g: 1, b: 1, a: 1,
	path: null,
	rendererObject: null,
	regionOffsetX: 0, regionOffsetY: 0,
	regionWidth: 0, regionHeight: 0,
	regionOriginalWidth: 0, regionOriginalHeight: 0,
	setUVs: function (u, v, u2, v2, rotate) {
		var uvs = this.uvs;
		if (rotate) {
			uvs[2/*X2*/] = u;
			uvs[3/*Y2*/] = v2;
			uvs[4/*X3*/] = u;
			uvs[5/*Y3*/] = v;
			uvs[6/*X4*/] = u2;
			uvs[7/*Y4*/] = v;
			uvs[0/*X1*/] = u2;
			uvs[1/*Y1*/] = v2;
		} else {
			uvs[0/*X1*/] = u;
			uvs[1/*Y1*/] = v2;
			uvs[2/*X2*/] = u;
			uvs[3/*Y2*/] = v;
			uvs[4/*X3*/] = u2;
			uvs[5/*Y3*/] = v;
			uvs[6/*X4*/] = u2;
			uvs[7/*Y4*/] = v2;
		}
	},
	updateOffset: function () {
		var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
		var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
		var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
		var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
		var localX2 = localX + this.regionWidth * regionScaleX;
		var localY2 = localY + this.regionHeight * regionScaleY;
		var radians = this.rotation * spine.degRad;
		var cos = Math.cos(radians);
		var sin = Math.sin(radians);
		var localXCos = localX * cos + this.x;
		var localXSin = localX * sin;
		var localYCos = localY * cos + this.y;
		var localYSin = localY * sin;
		var localX2Cos = localX2 * cos + this.x;
		var localX2Sin = localX2 * sin;
		var localY2Cos = localY2 * cos + this.y;
		var localY2Sin = localY2 * sin;
		var offset = this.offset;
		offset[0/*X1*/] = localXCos - localYSin;
		offset[1/*Y1*/] = localYCos + localXSin;
		offset[2/*X2*/] = localXCos - localY2Sin;
		offset[3/*Y2*/] = localY2Cos + localXSin;
		offset[4/*X3*/] = localX2Cos - localY2Sin;
		offset[5/*Y3*/] = localY2Cos + localX2Sin;
		offset[6/*X4*/] = localX2Cos - localYSin;
		offset[7/*Y4*/] = localYCos + localX2Sin;
	},
	computeVertices: function (x, y, bone, vertices) {
		x += bone.worldX;
		y += bone.worldY;
		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
		var offset = this.offset;
		vertices[0/*X1*/] = offset[0/*X1*/] * m00 + offset[1/*Y1*/] * m01 + x;
		vertices[1/*Y1*/] = offset[0/*X1*/] * m10 + offset[1/*Y1*/] * m11 + y;
		vertices[2/*X2*/] = offset[2/*X2*/] * m00 + offset[3/*Y2*/] * m01 + x;
		vertices[3/*Y2*/] = offset[2/*X2*/] * m10 + offset[3/*Y2*/] * m11 + y;
		vertices[4/*X3*/] = offset[4/*X3*/] * m00 + offset[5/*X3*/] * m01 + x;
		vertices[5/*X3*/] = offset[4/*X3*/] * m10 + offset[5/*X3*/] * m11 + y;
		vertices[6/*X4*/] = offset[6/*X4*/] * m00 + offset[7/*Y4*/] * m01 + x;
		vertices[7/*Y4*/] = offset[6/*X4*/] * m10 + offset[7/*Y4*/] * m11 + y;
	}
};

spine.MeshAttachment = function (name) {
	this.name = name;
};
spine.MeshAttachment.prototype = {
	type: spine.AttachmentType.mesh,
	vertices: null,
	uvs: null,
	regionUVs: null,
	triangles: null,
	hullLength: 0,
	r: 1, g: 1, b: 1, a: 1,
	path: null,
	rendererObject: null,
	regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,
	regionOffsetX: 0, regionOffsetY: 0,
	regionWidth: 0, regionHeight: 0,
	regionOriginalWidth: 0, regionOriginalHeight: 0,
	edges: null,
	width: 0, height: 0,
	updateUVs: function () {
		var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;
		var n = this.regionUVs.length;
		if (!this.uvs || this.uvs.length != n) {
            this.uvs = new spine.Float32Array(n);
		}
		if (this.regionRotate) {
			for (var i = 0; i < n; i += 2) {
                this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;
                this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;
			}
		} else {
			for (var i = 0; i < n; i += 2) {
                this.uvs[i] = this.regionU + this.regionUVs[i] * width;
                this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;
			}
		}
	},
	computeWorldVertices: function (x, y, slot, worldVertices) {
		var bone = slot.bone;
		x += bone.worldX;
		y += bone.worldY;
		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
		var vertices = this.vertices;
		var verticesCount = vertices.length;
		if (slot.attachmentVertices.length == verticesCount) vertices = slot.attachmentVertices;
		for (var i = 0; i < verticesCount; i += 2) {
			var vx = vertices[i];
			var vy = vertices[i + 1];
			worldVertices[i] = vx * m00 + vy * m01 + x;
			worldVertices[i + 1] = vx * m10 + vy * m11 + y;
		}
	}
};

spine.SkinnedMeshAttachment = function (name) {
	this.name = name;
};
spine.SkinnedMeshAttachment.prototype = {
	type: spine.AttachmentType.skinnedmesh,
	bones: null,
	weights: null,
	uvs: null,
	regionUVs: null,
	triangles: null,
	hullLength: 0,
	r: 1, g: 1, b: 1, a: 1,
	path: null,
	rendererObject: null,
	regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,
	regionOffsetX: 0, regionOffsetY: 0,
	regionWidth: 0, regionHeight: 0,
	regionOriginalWidth: 0, regionOriginalHeight: 0,
	edges: null,
	width: 0, height: 0,
	updateUVs: function (u, v, u2, v2, rotate) {
		var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;
		var n = this.regionUVs.length;
		if (!this.uvs || this.uvs.length != n) {
            this.uvs = new spine.Float32Array(n);
		}
		if (this.regionRotate) {
			for (var i = 0; i < n; i += 2) {
                this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;
                this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;
			}
		} else {
			for (var i = 0; i < n; i += 2) {
                this.uvs[i] = this.regionU + this.regionUVs[i] * width;
                this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;
			}
		}
	},
	computeWorldVertices: function (x, y, slot, worldVertices) {
		var skeletonBones = slot.bone.skeleton.bones;
		var weights = this.weights;
		var bones = this.bones;

		var w = 0, v = 0, b = 0, f = 0, n = bones.length, nn;
		var wx, wy, bone, vx, vy, weight;
		if (!slot.attachmentVertices.length) {
			for (; v < n; w += 2) {
				wx = 0;
				wy = 0;
				nn = bones[v++] + v;
				for (; v < nn; v++, b += 3) {
					bone = skeletonBones[bones[v]];
					vx = weights[b];
					vy = weights[b + 1];
					weight = weights[b + 2];
					wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;
					wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;
				}
				worldVertices[w] = wx + x;
				worldVertices[w + 1] = wy + y;
			}
		} else {
			var ffd = slot.attachmentVertices;
			for (; v < n; w += 2) {
				wx = 0;
				wy = 0;
				nn = bones[v++] + v;
				for (; v < nn; v++, b += 3, f += 2) {
					bone = skeletonBones[bones[v]];
					vx = weights[b] + ffd[f];
					vy = weights[b + 1] + ffd[f + 1];
					weight = weights[b + 2];
					wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;
					wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;
				}
				worldVertices[w] = wx + x;
				worldVertices[w + 1] = wy + y;
			}
		}
	}
};

spine.BoundingBoxAttachment = function (name) {
	this.name = name;
	this.vertices = [];
};
spine.BoundingBoxAttachment.prototype = {
	type: spine.AttachmentType.boundingbox,
	computeWorldVertices: function (x, y, bone, worldVertices) {
		x += bone.worldX;
		y += bone.worldY;
		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
		var vertices = this.vertices;
		for (var i = 0, n = vertices.length; i < n; i += 2) {
			var px = vertices[i];
			var py = vertices[i + 1];
			worldVertices[i] = px * m00 + py * m01 + x;
			worldVertices[i + 1] = px * m10 + py * m11 + y;
		}
	}
};

spine.AnimationStateData = function (skeletonData) {
	this.skeletonData = skeletonData;
	this.animationToMixTime = {};
};
spine.AnimationStateData.prototype = {
	defaultMix: 0,
	setMixByName: function (fromName, toName, duration) {
		var from = this.skeletonData.findAnimation(fromName);
		if (!from) throw "Animation not found: " + fromName;
		var to = this.skeletonData.findAnimation(toName);
		if (!to) throw "Animation not found: " + toName;
		this.setMix(from, to, duration);
	},
	setMix: function (from, to, duration) {
		this.animationToMixTime[from.name + ":" + to.name] = duration;
	},
	getMix: function (from, to) {
		var key = from.name + ":" + to.name;
		return this.animationToMixTime.hasOwnProperty(key) ? this.animationToMixTime[key] : this.defaultMix;
	}
};

spine.TrackEntry = function () {};
spine.TrackEntry.prototype = {
	next: null, previous: null,
	animation: null,
	loop: false,
	delay: 0, time: 0, lastTime: -1, endTime: 0,
	timeScale: 1,
	mixTime: 0, mixDuration: 0, mix: 1,
	onStart: null, onEnd: null, onComplete: null, onEvent: null
};

spine.AnimationState = function (stateData) {
	this.data = stateData;
	this.tracks = [];
	this.events = [];
};
spine.AnimationState.prototype = {
	onStart: null,
	onEnd: null,
	onComplete: null,
	onEvent: null,
	timeScale: 1,
	update: function (delta) {
		delta *= this.timeScale;
		for (var i = 0; i < this.tracks.length; i++) {
			var current = this.tracks[i];
			if (!current) continue;

			current.time += delta * current.timeScale;
			if (current.previous) {
				var previousDelta = delta * current.previous.timeScale;
				current.previous.time += previousDelta;
				current.mixTime += previousDelta;
			}

			var next = current.next;
			if (next) {
				next.time = current.lastTime - next.delay;
				if (next.time >= 0) this.setCurrent(i, next);
			} else {
				// End non-looping animation when it reaches its end time and there is no next entry.
				if (!current.loop && current.lastTime >= current.endTime) this.clearTrack(i);
			}
		}
	},
	apply: function (skeleton) {
		for (var i = 0; i < this.tracks.length; i++) {
			var current = this.tracks[i];
			if (!current) continue;

			this.events.length = 0;

			var time = current.time;
			var lastTime = current.lastTime;
			var endTime = current.endTime;
			var loop = current.loop;
			if (!loop && time > endTime) time = endTime;

			var previous = current.previous;
			if (!previous) {
				if (current.mix == 1)
					current.animation.apply(skeleton, current.lastTime, time, loop, this.events);
				else
					current.animation.mix(skeleton, current.lastTime, time, loop, this.events, current.mix);
			} else {
				var previousTime = previous.time;
				if (!previous.loop && previousTime > previous.endTime) previousTime = previous.endTime;
				previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);

				var alpha = current.mixTime / current.mixDuration * current.mix;
				if (alpha >= 1) {
					alpha = 1;
					current.previous = null;
				}
				current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);
			}

			for (var ii = 0, nn = this.events.length; ii < nn; ii++) {
				var event = this.events[ii];
				if (current.onEvent) current.onEvent(i, event);
				if (this.onEvent) this.onEvent(i, event);
			}

			// Check if completed the animation or a loop iteration.
			if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
				var count = Math.floor(time / endTime);
				if (current.onComplete) current.onComplete(i, count);
				if (this.onComplete) this.onComplete(i, count);
			}

			current.lastTime = current.time;
		}
	},
	clearTracks: function () {
		for (var i = 0, n = this.tracks.length; i < n; i++)
			this.clearTrack(i);
		this.tracks.length = 0; 
	},
	clearTrack: function (trackIndex) {
		if (trackIndex >= this.tracks.length) return;
		var current = this.tracks[trackIndex];
		if (!current) return;

		if (current.onEnd) current.onEnd(trackIndex);
		if (this.onEnd) this.onEnd(trackIndex);

		this.tracks[trackIndex] = null;
	},
	_expandToIndex: function (index) {
		if (index < this.tracks.length) return this.tracks[index];
		while (index >= this.tracks.length)
			this.tracks.push(null);
		return null;
	},
	setCurrent: function (index, entry) {
		var current = this._expandToIndex(index);
		if (current) {
			var previous = current.previous;
			current.previous = null;

			if (current.onEnd) current.onEnd(index);
			if (this.onEnd) this.onEnd(index);

			entry.mixDuration = this.data.getMix(current.animation, entry.animation);
			if (entry.mixDuration > 0) {
				entry.mixTime = 0;
				// If a mix is in progress, mix from the closest animation.
				if (previous && current.mixTime / current.mixDuration < 0.5)
					entry.previous = previous;
				else
					entry.previous = current;
			}
		}

		this.tracks[index] = entry;

		if (entry.onStart) entry.onStart(index);
		if (this.onStart) this.onStart(index);
	},
	setAnimationByName: function (trackIndex, animationName, loop) {
		var animation = this.data.skeletonData.findAnimation(animationName);
		if (!animation) throw "Animation not found: " + animationName;
		return this.setAnimation(trackIndex, animation, loop);
	},
	/** Set the current animation. Any queued animations are cleared. */
	setAnimation: function (trackIndex, animation, loop) {
		var entry = new spine.TrackEntry();
		entry.animation = animation;
		entry.loop = loop;
		entry.endTime = animation.duration;
		this.setCurrent(trackIndex, entry);
		return entry;
	},
	addAnimationByName: function (trackIndex, animationName, loop, delay) {
		var animation = this.data.skeletonData.findAnimation(animationName);
		if (!animation) throw "Animation not found: " + animationName;
		return this.addAnimation(trackIndex, animation, loop, delay);
	},
	/** Adds an animation to be played delay seconds after the current or last queued animation.
	 * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
	addAnimation: function (trackIndex, animation, loop, delay) {
		var entry = new spine.TrackEntry();
		entry.animation = animation;
		entry.loop = loop;
		entry.endTime = animation.duration;

		var last = this._expandToIndex(trackIndex);
		if (last) {
			while (last.next)
				last = last.next;
			last.next = entry;
		} else
			this.tracks[trackIndex] = entry;

		if (delay <= 0) {
			if (last)
				delay += last.endTime - this.data.getMix(last.animation, animation);
			else
				delay = 0;
		}
		entry.delay = delay;

		return entry;
	},
	/** May be null. */
	getCurrent: function (trackIndex) {
		if (trackIndex >= this.tracks.length) return null;
		return this.tracks[trackIndex];
	}
};

spine.SkeletonJson = function (attachmentLoader) {
	this.attachmentLoader = attachmentLoader;
};
spine.SkeletonJson.prototype = {
	scale: 1,
	readSkeletonData: function (root, name) {
		var skeletonData = new spine.SkeletonData();
		skeletonData.name = name;

		// Skeleton.
		var skeletonMap = root["skeleton"];
		if (skeletonMap) {
			skeletonData.hash = skeletonMap["hash"];
			skeletonData.version = skeletonMap["spine"];
			skeletonData.width = skeletonMap["width"] || 0;
			skeletonData.height = skeletonMap["height"] || 0;
		}

		// Bones.
		var bones = root["bones"];
		for (var i = 0, n = bones.length; i < n; i++) {
			var boneMap = bones[i];
			var parent = null;
			if (boneMap["parent"]) {
				parent = skeletonData.findBone(boneMap["parent"]);
				if (!parent) throw "Parent bone not found: " + boneMap["parent"];
			}
			var boneData = new spine.BoneData(boneMap["name"], parent);
			boneData.length = (boneMap["length"] || 0) * this.scale;
			boneData.x = (boneMap["x"] || 0) * this.scale;
			boneData.y = (boneMap["y"] || 0) * this.scale;
			boneData.rotation = (boneMap["rotation"] || 0);
			boneData.scaleX = boneMap.hasOwnProperty("scaleX") ? boneMap["scaleX"] : 1;
			boneData.scaleY = boneMap.hasOwnProperty("scaleY") ? boneMap["scaleY"] : 1;
			boneData.inheritScale = boneMap.hasOwnProperty("inheritScale") ? boneMap["inheritScale"] : true;
			boneData.inheritRotation = boneMap.hasOwnProperty("inheritRotation") ? boneMap["inheritRotation"] : true;
			skeletonData.bones.push(boneData);
		}

		// IK constraints.
		var ik = root["ik"];
		if (ik) {
			for (var i = 0, n = ik.length; i < n; i++) {
				var ikMap = ik[i];
				var ikConstraintData = new spine.IkConstraintData(ikMap["name"]);

				var bones = ikMap["bones"];
				for (var ii = 0, nn = bones.length; ii < nn; ii++) {
					var bone = skeletonData.findBone(bones[ii]);
					if (!bone) throw "IK bone not found: " + bones[ii];
					ikConstraintData.bones.push(bone);
				}

				ikConstraintData.target = skeletonData.findBone(ikMap["target"]);
				if (!ikConstraintData.target) throw "Target bone not found: " + ikMap["target"];

				ikConstraintData.bendDirection = (!ikMap.hasOwnProperty("bendPositive") || ikMap["bendPositive"]) ? 1 : -1;
				ikConstraintData.mix = ikMap.hasOwnProperty("mix") ? ikMap["mix"] : 1;

				skeletonData.ikConstraints.push(ikConstraintData);
			}
		}

		// Slots.
		var slots = root["slots"];
		for (var i = 0, n = slots.length; i < n; i++) {
			var slotMap = slots[i];
			var boneData = skeletonData.findBone(slotMap["bone"]);
			if (!boneData) throw "Slot bone not found: " + slotMap["bone"];
			var slotData = new spine.SlotData(slotMap["name"], boneData);

			var color = slotMap["color"];
			if (color) {
				slotData.r = this.toColor(color, 0);
				slotData.g = this.toColor(color, 1);
				slotData.b = this.toColor(color, 2);
				slotData.a = this.toColor(color, 3);
			}

			slotData.attachmentName = slotMap["attachment"];
			slotData.blendMode = spine.BlendMode[slotMap["blend"] || "normal"];

			skeletonData.slots.push(slotData);
		}

		// Skins.
		var skins = root["skins"];
		for (var skinName in skins) {
			if (!skins.hasOwnProperty(skinName)) continue;
			var skinMap = skins[skinName];
			var skin = new spine.Skin(skinName);
			for (var slotName in skinMap) {
				if (!skinMap.hasOwnProperty(slotName)) continue;
				var slotIndex = skeletonData.findSlotIndex(slotName);
				var slotEntry = skinMap[slotName];
				for (var attachmentName in slotEntry) {
					if (!slotEntry.hasOwnProperty(attachmentName)) continue;
					var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
					if (attachment) skin.addAttachment(slotIndex, attachmentName, attachment);
				}
			}
			skeletonData.skins.push(skin);
			if (skin.name == "default") skeletonData.defaultSkin = skin;
		}

		// Events.
		var events = root["events"];
		for (var eventName in events) {
			if (!events.hasOwnProperty(eventName)) continue;
			var eventMap = events[eventName];
			var eventData = new spine.EventData(eventName);
			eventData.intValue = eventMap["int"] || 0;
			eventData.floatValue = eventMap["float"] || 0;
			eventData.stringValue = eventMap["string"] || null;
			skeletonData.events.push(eventData);
		}

		// Animations.
		var animations = root["animations"];
		for (var animationName in animations) {
			if (!animations.hasOwnProperty(animationName)) continue;
			this.readAnimation(animationName, animations[animationName], skeletonData);
		}

		return skeletonData;
	},
	readAttachment: function (skin, name, map) {
		name = map["name"] || name;

		var type = spine.AttachmentType[map["type"] || "region"];
		var path = map["path"] || name;
		
		var scale = this.scale;
		if (type == spine.AttachmentType.region) {
			var region = this.attachmentLoader.newRegionAttachment(skin, name, path);
			if (!region) return null;
			region.path = path;
			region.x = (map["x"] || 0) * scale;
			region.y = (map["y"] || 0) * scale;
			region.scaleX = map.hasOwnProperty("scaleX") ? map["scaleX"] : 1;
			region.scaleY = map.hasOwnProperty("scaleY") ? map["scaleY"] : 1;
			region.rotation = map["rotation"] || 0;
			region.width = (map["width"] || 0) * scale;
			region.height = (map["height"] || 0) * scale;

			var color = map["color"];
			if (color) {
				region.r = this.toColor(color, 0);
				region.g = this.toColor(color, 1);
				region.b = this.toColor(color, 2);
				region.a = this.toColor(color, 3);
			}

			region.updateOffset();
			return region;
		} else if (type == spine.AttachmentType.mesh) {
			var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
			if (!mesh) return null;
			mesh.path = path; 
			mesh.vertices = this.getFloatArray(map, "vertices", scale);
			mesh.triangles = this.getIntArray(map, "triangles");
			mesh.regionUVs = this.getFloatArray(map, "uvs", 1);
			mesh.updateUVs();

			color = map["color"];
			if (color) {
				mesh.r = this.toColor(color, 0);
				mesh.g = this.toColor(color, 1);
				mesh.b = this.toColor(color, 2);
				mesh.a = this.toColor(color, 3);
			}

			mesh.hullLength = (map["hull"] || 0) * 2;
			if (map["edges"]) mesh.edges = this.getIntArray(map, "edges");
			mesh.width = (map["width"] || 0) * scale;
			mesh.height = (map["height"] || 0) * scale;
			return mesh;
		} else if (type == spine.AttachmentType.skinnedmesh) {
			var mesh = this.attachmentLoader.newSkinnedMeshAttachment(skin, name, path);
			if (!mesh) return null;
			mesh.path = path;

			var uvs = this.getFloatArray(map, "uvs", 1);
			var vertices = this.getFloatArray(map, "vertices", 1);
			var weights = [];
			var bones = [];
			for (var i = 0, n = vertices.length; i < n; ) {
				var boneCount = vertices[i++] | 0;
				bones[bones.length] = boneCount;
				for (var nn = i + boneCount * 4; i < nn; ) {
					bones[bones.length] = vertices[i];
					weights[weights.length] = vertices[i + 1] * scale;
					weights[weights.length] = vertices[i + 2] * scale;
					weights[weights.length] = vertices[i + 3];
					i += 4;
				}
			}
			mesh.bones = bones;
			mesh.weights = weights;
			mesh.triangles = this.getIntArray(map, "triangles");
			mesh.regionUVs = uvs;
			mesh.updateUVs();
			
			color = map["color"];
			if (color) {
				mesh.r = this.toColor(color, 0);
				mesh.g = this.toColor(color, 1);
				mesh.b = this.toColor(color, 2);
				mesh.a = this.toColor(color, 3);
			}
			
			mesh.hullLength = (map["hull"] || 0) * 2;
			if (map["edges"]) mesh.edges = this.getIntArray(map, "edges");
			mesh.width = (map["width"] || 0) * scale;
			mesh.height = (map["height"] || 0) * scale;
			return mesh;
		} else if (type == spine.AttachmentType.boundingbox) {
			var attachment = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
			var vertices = map["vertices"];
			for (var i = 0, n = vertices.length; i < n; i++)
				attachment.vertices.push(vertices[i] * scale);
			return attachment;
		}
		throw "Unknown attachment type: " + type;
	},
	readAnimation: function (name, map, skeletonData) {
		var timelines = [];
		var duration = 0;

		var slots = map["slots"];
		for (var slotName in slots) {
			if (!slots.hasOwnProperty(slotName)) continue;
			var slotMap = slots[slotName];
			var slotIndex = skeletonData.findSlotIndex(slotName);

			for (var timelineName in slotMap) {
				if (!slotMap.hasOwnProperty(timelineName)) continue;
				var values = slotMap[timelineName];
				if (timelineName == "color") {
					var timeline = new spine.ColorTimeline(values.length);
					timeline.slotIndex = slotIndex;

					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						var color = valueMap["color"];
						var r = this.toColor(color, 0);
						var g = this.toColor(color, 1);
						var b = this.toColor(color, 2);
						var a = this.toColor(color, 3);
						timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
						this.readCurve(timeline, frameIndex, valueMap);
						frameIndex++;
					}
					timelines.push(timeline);
					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);

				} else if (timelineName == "attachment") {
					var timeline = new spine.AttachmentTimeline(values.length);
					timeline.slotIndex = slotIndex;

					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
					}
					timelines.push(timeline);
					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);

				} else
					throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
			}
		}

		var bones = map["bones"];
		for (var boneName in bones) {
			if (!bones.hasOwnProperty(boneName)) continue;
			var boneIndex = skeletonData.findBoneIndex(boneName);
			if (boneIndex == -1) throw "Bone not found: " + boneName;
			var boneMap = bones[boneName];

			for (var timelineName in boneMap) {
				if (!boneMap.hasOwnProperty(timelineName)) continue;
				var values = boneMap[timelineName];
				if (timelineName == "rotate") {
					var timeline = new spine.RotateTimeline(values.length);
					timeline.boneIndex = boneIndex;

					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
						this.readCurve(timeline, frameIndex, valueMap);
						frameIndex++;
					}
					timelines.push(timeline);
					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);

				} else if (timelineName == "translate" || timelineName == "scale") {
					var timeline;
					var timelineScale = 1;
					if (timelineName == "scale")
						timeline = new spine.ScaleTimeline(values.length);
					else {
						timeline = new spine.TranslateTimeline(values.length);
						timelineScale = this.scale;
					}
					timeline.boneIndex = boneIndex;

					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						var x = (valueMap["x"] || 0) * timelineScale;
						var y = (valueMap["y"] || 0) * timelineScale;
						timeline.setFrame(frameIndex, valueMap["time"], x, y);
						this.readCurve(timeline, frameIndex, valueMap);
						frameIndex++;
					}
					timelines.push(timeline);
					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);

				} else if (timelineName == "flipX" || timelineName == "flipY") {
					var x = timelineName == "flipX";
					var timeline = x ? new spine.FlipXTimeline(values.length) : new spine.FlipYTimeline(values.length);
					timeline.boneIndex = boneIndex;

					var field = x ? "x" : "y";
					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						timeline.setFrame(frameIndex, valueMap["time"], valueMap[field] || false);
						frameIndex++;
					}
					timelines.push(timeline);
					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
				} else
					throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
			}
		}

		var ikMap = map["ik"];
		for (var ikConstraintName in ikMap) {
			if (!ikMap.hasOwnProperty(ikConstraintName)) continue;
			var ikConstraint = skeletonData.findIkConstraint(ikConstraintName);
			var values = ikMap[ikConstraintName];
			var timeline = new spine.IkConstraintTimeline(values.length);
			timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(ikConstraint);
			var frameIndex = 0;
			for (var i = 0, n = values.length; i < n; i++) {
				var valueMap = values[i];
				var mix = valueMap.hasOwnProperty("mix") ? valueMap["mix"] : 1;
				var bendDirection = (!valueMap.hasOwnProperty("bendPositive") || valueMap["bendPositive"]) ? 1 : -1;
				timeline.setFrame(frameIndex, valueMap["time"], mix, bendDirection);
				this.readCurve(timeline, frameIndex, valueMap);
				frameIndex++;
			}
			timelines.push(timeline);
			duration = Math.max(duration, timeline.frames[timeline.frameCount * 3 - 3]);
		}

		var ffd = map["ffd"];
		for (var skinName in ffd) {
			var skin = skeletonData.findSkin(skinName);
			var slotMap = ffd[skinName];
			for (slotName in slotMap) {
				var slotIndex = skeletonData.findSlotIndex(slotName);
				var meshMap = slotMap[slotName];
				for (var meshName in meshMap) {
					var values = meshMap[meshName];
					var timeline = new spine.FfdTimeline(values.length);
					var attachment = skin.getAttachment(slotIndex, meshName);
					if (!attachment) throw "FFD attachment not found: " + meshName;
					timeline.slotIndex = slotIndex;
					timeline.attachment = attachment;
					
					var isMesh = attachment.type == spine.AttachmentType.mesh;
					var vertexCount;
					if (isMesh)
						vertexCount = attachment.vertices.length;
					else
						vertexCount = attachment.weights.length / 3 * 2;

					var frameIndex = 0;
					for (var i = 0, n = values.length; i < n; i++) {
						var valueMap = values[i];
						var vertices;
						if (!valueMap["vertices"]) {
							if (isMesh)
								vertices = attachment.vertices;
							else {
								vertices = [];
								vertices.length = vertexCount;
							}
						} else {
							var verticesValue = valueMap["vertices"];
							var vertices = [];
							vertices.length = vertexCount;
							var start = valueMap["offset"] || 0;
							var nn = verticesValue.length;
							if (this.scale == 1) {
								for (var ii = 0; ii < nn; ii++)
									vertices[ii + start] = verticesValue[ii];
							} else {
								for (var ii = 0; ii < nn; ii++)
									vertices[ii + start] = verticesValue[ii] * this.scale;
							}
							if (isMesh) {
								var meshVertices = attachment.vertices;
								for (var ii = 0, nn = vertices.length; ii < nn; ii++)
									vertices[ii] += meshVertices[ii];
							}
						}
						
						timeline.setFrame(frameIndex, valueMap["time"], vertices);
						this.readCurve(timeline, frameIndex, valueMap);
						frameIndex++;
					}
					timelines[timelines.length] = timeline;
					duration = Math.max(duration, timeline.frames[timeline.frameCount - 1]);
				}
			}
		}

		var drawOrderValues = map["drawOrder"];
		if (!drawOrderValues) drawOrderValues = map["draworder"];
		if (drawOrderValues) {
			var timeline = new spine.DrawOrderTimeline(drawOrderValues.length);
			var slotCount = skeletonData.slots.length;
			var frameIndex = 0;
			for (var i = 0, n = drawOrderValues.length; i < n; i++) {
				var drawOrderMap = drawOrderValues[i];
				var drawOrder = null;
				if (drawOrderMap["offsets"]) {
					drawOrder = [];
					drawOrder.length = slotCount;
					for (var ii = slotCount - 1; ii >= 0; ii--)
						drawOrder[ii] = -1;
					var offsets = drawOrderMap["offsets"];
					var unchanged = [];
					unchanged.length = slotCount - offsets.length;
					var originalIndex = 0, unchangedIndex = 0;
					for (var ii = 0, nn = offsets.length; ii < nn; ii++) {
						var offsetMap = offsets[ii];
						var slotIndex = skeletonData.findSlotIndex(offsetMap["slot"]);
						if (slotIndex == -1) throw "Slot not found: " + offsetMap["slot"];
						// Collect unchanged items.
						while (originalIndex != slotIndex)
							unchanged[unchangedIndex++] = originalIndex++;
						// Set changed items.
						drawOrder[originalIndex + offsetMap["offset"]] = originalIndex++;
					}
					// Collect remaining unchanged items.
					while (originalIndex < slotCount)
						unchanged[unchangedIndex++] = originalIndex++;
					// Fill in unchanged items.
					for (var ii = slotCount - 1; ii >= 0; ii--)
						if (drawOrder[ii] == -1) drawOrder[ii] = unchanged[--unchangedIndex];
				}
				timeline.setFrame(frameIndex++, drawOrderMap["time"], drawOrder);
			}
			timelines.push(timeline);
			duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
		}

		var events = map["events"];
		if (events) {
			var timeline = new spine.EventTimeline(events.length);
			var frameIndex = 0;
			for (var i = 0, n = events.length; i < n; i++) {
				var eventMap = events[i];
				var eventData = skeletonData.findEvent(eventMap["name"]);
				if (!eventData) throw "Event not found: " + eventMap["name"];
				var event = new spine.Event(eventData);
				event.intValue = eventMap.hasOwnProperty("int") ? eventMap["int"] : eventData.intValue;
				event.floatValue = eventMap.hasOwnProperty("float") ? eventMap["float"] : eventData.floatValue;
				event.stringValue = eventMap.hasOwnProperty("string") ? eventMap["string"] : eventData.stringValue;
				timeline.setFrame(frameIndex++, eventMap["time"], event);
			}
			timelines.push(timeline);
			duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
		}

		skeletonData.animations.push(new spine.Animation(name, timelines, duration));
	},
	readCurve: function (timeline, frameIndex, valueMap) {
		var curve = valueMap["curve"];
		if (!curve) 
			timeline.curves.setLinear(frameIndex);
		else if (curve == "stepped")
			timeline.curves.setStepped(frameIndex);
		else if (curve instanceof Array)
			timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
	},
	toColor: function (hexString, colorIndex) {
		if (hexString.length != 8) throw "Color hexidecimal length must be 8, recieved: " + hexString;
		return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;
	},
	getFloatArray: function (map, name, scale) {
		var list = map[name];
		var values = new spine.Float32Array(list.length);
		var i = 0, n = list.length;
		if (scale == 1) {
			for (; i < n; i++)
				values[i] = list[i];
		} else {
			for (; i < n; i++)
				values[i] = list[i] * scale;
		}
		return values;
	},
	getIntArray: function (map, name) {
		var list = map[name];
		var values = new spine.Uint16Array(list.length);
		for (var i = 0, n = list.length; i < n; i++)
			values[i] = list[i] | 0;
		return values;
	}
};

spine.Atlas = function (atlasText, textureLoader) {
	this.textureLoader = textureLoader;
	this.pages = [];
	this.regions = [];

	var reader = new spine.AtlasReader(atlasText);
	var tuple = [];
	tuple.length = 4;
	var page = null;
	while (true) {
		var line = reader.readLine();
		if (line === null) break;
		line = reader.trim(line);
		if (!line.length)
			page = null;
		else if (!page) {
			page = new spine.AtlasPage();
			page.name = line;

			if (reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.
				page.width = parseInt(tuple[0]);
				page.height = parseInt(tuple[1]);
				reader.readTuple(tuple);
			}
			page.format = spine.Atlas.Format[tuple[0]];

			reader.readTuple(tuple);
			page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
			page.magFilter = spine.Atlas.TextureFilter[tuple[1]];

			var direction = reader.readValue();
			page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
			page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
			if (direction == "x")
				page.uWrap = spine.Atlas.TextureWrap.repeat;
			else if (direction == "y")
				page.vWrap = spine.Atlas.TextureWrap.repeat;
			else if (direction == "xy")
				page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;

			textureLoader.load(page, line, this);

			this.pages.push(page);

		} else {
			var region = new spine.AtlasRegion();
			region.name = line;
			region.page = page;

			region.rotate = reader.readValue() == "true";

			reader.readTuple(tuple);
			var x = parseInt(tuple[0]);
			var y = parseInt(tuple[1]);

			reader.readTuple(tuple);
			var width = parseInt(tuple[0]);
			var height = parseInt(tuple[1]);

			region.u = x / page.width;
			region.v = y / page.height;
			if (region.rotate) {
				region.u2 = (x + height) / page.width;
				region.v2 = (y + width) / page.height;
			} else {
				region.u2 = (x + width) / page.width;
				region.v2 = (y + height) / page.height;
			}
			region.x = x;
			region.y = y;
			region.width = Math.abs(width);
			region.height = Math.abs(height);

			if (reader.readTuple(tuple) == 4) { // split is optional
				region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

				if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
					region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

					reader.readTuple(tuple);
				}
			}

			region.originalWidth = parseInt(tuple[0]);
			region.originalHeight = parseInt(tuple[1]);

			reader.readTuple(tuple);
			region.offsetX = parseInt(tuple[0]);
			region.offsetY = parseInt(tuple[1]);

			region.index = parseInt(reader.readValue());

			this.regions.push(region);
		}
	}
};
spine.Atlas.prototype = {
	findRegion: function (name) {
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++)
			if (regions[i].name == name) return regions[i];
		return null;
	},
	dispose: function () {
		var pages = this.pages;
		for (var i = 0, n = pages.length; i < n; i++)
			this.textureLoader.unload(pages[i].rendererObject);
	},
	updateUVs: function (page) {
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++) {
			var region = regions[i];
			if (region.page != page) continue;
			region.u = region.x / page.width;
			region.v = region.y / page.height;
			if (region.rotate) {
				region.u2 = (region.x + region.height) / page.width;
				region.v2 = (region.y + region.width) / page.height;
			} else {
				region.u2 = (region.x + region.width) / page.width;
				region.v2 = (region.y + region.height) / page.height;
			}
		}
	}
};

spine.Atlas.Format = {
	alpha: 0,
	intensity: 1,
	luminanceAlpha: 2,
	rgb565: 3,
	rgba4444: 4,
	rgb888: 5,
	rgba8888: 6
};

spine.Atlas.TextureFilter = {
	nearest: 0,
	linear: 1,
	mipMap: 2,
	mipMapNearestNearest: 3,
	mipMapLinearNearest: 4,
	mipMapNearestLinear: 5,
	mipMapLinearLinear: 6
};

spine.Atlas.TextureWrap = {
	mirroredRepeat: 0,
	clampToEdge: 1,
	repeat: 2
};

spine.AtlasPage = function () {};
spine.AtlasPage.prototype = {
	name: null,
	format: null,
	minFilter: null,
	magFilter: null,
	uWrap: null,
	vWrap: null,
	rendererObject: null,
	width: 0,
	height: 0
};

spine.AtlasRegion = function () {};
spine.AtlasRegion.prototype = {
	page: null,
	name: null,
	x: 0, y: 0,
	width: 0, height: 0,
	u: 0, v: 0, u2: 0, v2: 0,
	offsetX: 0, offsetY: 0,
	originalWidth: 0, originalHeight: 0,
	index: 0,
	rotate: false,
	splits: null,
	pads: null
};

spine.AtlasReader = function (text) {
	this.lines = text.split(/\r\n|\r|\n/);
};
spine.AtlasReader.prototype = {
	index: 0,
	trim: function (value) {
		return value.replace(/^\s+|\s+$/g, "");
	},
	readLine: function () {
		if (this.index >= this.lines.length) return null;
		return this.lines[this.index++];
	},
	readValue: function () {
		var line = this.readLine();
		var colon = line.indexOf(":");
		if (colon == -1) throw "Invalid line: " + line;
		return this.trim(line.substring(colon + 1));
	},
	/** Returns the number of tuple values read (1, 2 or 4). */
	readTuple: function (tuple) {
		var line = this.readLine();
		var colon = line.indexOf(":");
		if (colon == -1) throw "Invalid line: " + line;
		var i = 0, lastMatch = colon + 1;
		for (; i < 3; i++) {
			var comma = line.indexOf(",", lastMatch);
			if (comma == -1) break;
			tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
			lastMatch = comma + 1;
		}
		tuple[i] = this.trim(line.substring(lastMatch));
		return i + 1;
	}
};

spine.AtlasAttachmentLoader = function (atlas) {
	this.atlas = atlas;
};
spine.AtlasAttachmentLoader.prototype = {
	newRegionAttachment: function (skin, name, path) {
		var region = this.atlas.findRegion(path);
		if (!region) throw "Region not found in atlas: " + path + " (region attachment: " + name + ")";
		var attachment = new spine.RegionAttachment(name);
		attachment.rendererObject = region;
		attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
		attachment.regionOffsetX = region.offsetX;
		attachment.regionOffsetY = region.offsetY;
		attachment.regionWidth = region.width;
		attachment.regionHeight = region.height;
		attachment.regionOriginalWidth = region.originalWidth;
		attachment.regionOriginalHeight = region.originalHeight;
		return attachment;
	},
	newMeshAttachment: function (skin, name, path) {
		var region = this.atlas.findRegion(path);
		if (!region) throw "Region not found in atlas: " + path + " (mesh attachment: " + name + ")";
		var attachment = new spine.MeshAttachment(name);
		attachment.rendererObject = region;
		attachment.regionU = region.u;
		attachment.regionV = region.v;
		attachment.regionU2 = region.u2;
		attachment.regionV2 = region.v2;
		attachment.regionRotate = region.rotate;
		attachment.regionOffsetX = region.offsetX;
		attachment.regionOffsetY = region.offsetY;
		attachment.regionWidth = region.width;
		attachment.regionHeight = region.height;
		attachment.regionOriginalWidth = region.originalWidth;
		attachment.regionOriginalHeight = region.originalHeight;
		return attachment;
	},
	newSkinnedMeshAttachment: function (skin, name, path) {
		var region = this.atlas.findRegion(path);
		if (!region) throw "Region not found in atlas: " + path + " (skinned mesh attachment: " + name + ")";
		var attachment = new spine.SkinnedMeshAttachment(name);
		attachment.rendererObject = region;
		attachment.regionU = region.u;
		attachment.regionV = region.v;
		attachment.regionU2 = region.u2;
		attachment.regionV2 = region.v2;
		attachment.regionRotate = region.rotate;
		attachment.regionOffsetX = region.offsetX;
		attachment.regionOffsetY = region.offsetY;
		attachment.regionWidth = region.width;
		attachment.regionHeight = region.height;
		attachment.regionOriginalWidth = region.originalWidth;
		attachment.regionOriginalHeight = region.originalHeight;
		return attachment;
	},
	newBoundingBoxAttachment: function (skin, name) {
		return new spine.BoundingBoxAttachment(name);
	}
};

spine.SkeletonBounds = function () {
	this.polygonPool = [];
	this.polygons = [];
	this.boundingBoxes = [];
};
spine.SkeletonBounds.prototype = {
	minX: 0, minY: 0, maxX: 0, maxY: 0,
	update: function (skeleton, updateAabb) {
		var slots = skeleton.slots;
		var slotCount = slots.length;
		var x = skeleton.x, y = skeleton.y;
		var boundingBoxes = this.boundingBoxes;
		var polygonPool = this.polygonPool;
		var polygons = this.polygons;

		boundingBoxes.length = 0;
		for (var i = 0, n = polygons.length; i < n; i++)
			polygonPool.push(polygons[i]);
		polygons.length = 0;

		for (var i = 0; i < slotCount; i++) {
			var slot = slots[i];
			var boundingBox = slot.attachment;
			if (boundingBox.type != spine.AttachmentType.boundingbox) continue;
			boundingBoxes.push(boundingBox);

			var poolCount = polygonPool.length, polygon;
			if (poolCount > 0) {
				polygon = polygonPool[poolCount - 1];
				polygonPool.splice(poolCount - 1, 1);
			} else
				polygon = [];
			polygons.push(polygon);

			polygon.length = boundingBox.vertices.length;
			boundingBox.computeWorldVertices(x, y, slot.bone, polygon);
		}

		if (updateAabb) this.aabbCompute();
	},
	aabbCompute: function () {
		var polygons = this.polygons;
		var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
		for (var i = 0, n = polygons.length; i < n; i++) {
			var vertices = polygons[i];
			for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
				var x = vertices[ii];
				var y = vertices[ii + 1];
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x);
				maxY = Math.max(maxY, y);
			}
		}
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
	},
	/** Returns true if the axis aligned bounding box contains the point. */
	aabbContainsPoint: function (x, y) {
		return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
	},
	/** Returns true if the axis aligned bounding box intersects the line segment. */
	aabbIntersectsSegment: function (x1, y1, x2, y2) {
		var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
		if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
			return false;
		var m = (y2 - y1) / (x2 - x1);
		var y = m * (minX - x1) + y1;
		if (y > minY && y < maxY) return true;
		y = m * (maxX - x1) + y1;
		if (y > minY && y < maxY) return true;
		var x = (minY - y1) / m + x1;
		if (x > minX && x < maxX) return true;
		x = (maxY - y1) / m + x1;
		if (x > minX && x < maxX) return true;
		return false;
	},
	/** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
	aabbIntersectsSkeleton: function (bounds) {
		return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
	},
	/** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
	 * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
	containsPoint: function (x, y) {
		var polygons = this.polygons;
		for (var i = 0, n = polygons.length; i < n; i++)
			if (this.polygonContainsPoint(polygons[i], x, y)) return this.boundingBoxes[i];
		return null;
	},
	/** Returns the first bounding box attachment that contains the line segment, or null. When doing many checks, it is usually
	 * more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns true. */
	intersectsSegment: function (x1, y1, x2, y2) {
		var polygons = this.polygons;
		for (var i = 0, n = polygons.length; i < n; i++)
			if (polygons[i].intersectsSegment(x1, y1, x2, y2)) return this.boundingBoxes[i];
		return null;
	},
	/** Returns true if the polygon contains the point. */
	polygonContainsPoint: function (polygon, x, y) {
		var nn = polygon.length;
		var prevIndex = nn - 2;
		var inside = false;
		for (var ii = 0; ii < nn; ii += 2) {
			var vertexY = polygon[ii + 1];
			var prevY = polygon[prevIndex + 1];
			if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
				var vertexX = polygon[ii];
				if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x) inside = !inside;
			}
			prevIndex = ii;
		}
		return inside;
	},
	/** Returns true if the polygon contains the line segment. */
	polygonIntersectsSegment: function (polygon, x1, y1, x2, y2) {
		var nn = polygon.length;
		var width12 = x1 - x2, height12 = y1 - y2;
		var det1 = x1 * y2 - y1 * x2;
		var x3 = polygon[nn - 2], y3 = polygon[nn - 1];
		for (var ii = 0; ii < nn; ii += 2) {
			var x4 = polygon[ii], y4 = polygon[ii + 1];
			var det2 = x3 * y4 - y3 * x4;
			var width34 = x3 - x4, height34 = y3 - y4;
			var det3 = width12 * height34 - height12 * width34;
			var x = (det1 * width34 - width12 * det2) / det3;
			if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
				var y = (det1 * height34 - height12 * det2) / det3;
				if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1))) return true;
			}
			x3 = x4;
			y3 = y4;
		}
		return false;
	},
	getPolygon: function (attachment) {
		var index = this.boundingBoxes.indexOf(attachment);
		return index == -1 ? null : this.polygons[index];
	},
	getWidth: function () {
		return this.maxX - this.minX;
	},
	getHeight: function () {
		return this.maxY - this.minY;
	}
};
// *********************************
// CoolGames Builder JavaScript file
// *********************************

/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
        /**
         * CryptoJS namespace.
         */
        var C = {};

        /**
         * Library namespace.
         */
        var C_lib = C.lib = {};

        /**
         * Base object for prototypal inheritance.
         */
        var Base = C_lib.Base = (function () {
            function F() {}

            return {
                /**
                 * Creates a new object that inherits from this object.
                 *
                 * @param {Object} overrides Properties to copy into the new object.
                 *
                 * @return {Object} The new object.
                 *
                 * @static
                 *
                 * @example
                 *
                 *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
                 */
                extend: function (overrides) {
                    // Spawn
                    F.prototype = this;
                    var subtype = new F();

                    // Augment
                    if (overrides) {
                        subtype.mixIn(overrides);
                    }

                    // Create default initializer
                    if (!subtype.hasOwnProperty('init')) {
                        subtype.init = function () {
                            subtype.$super.init.apply(this, arguments);
                        };
                    }

                    // Initializer's prototype is the subtype object
                    subtype.init.prototype = subtype;

                    // Reference supertype
                    subtype.$super = this;

                    return subtype;
                },

                /**
                 * Extends this object and runs the init method.
                 * Arguments to create() will be passed to init().
                 *
                 * @return {Object} The new object.
                 *
                 * @static
                 *
                 * @example
                 *
                 *     var instance = MyType.create();
                 */
                create: function () {
                    var instance = this.extend();
                    instance.init.apply(instance, arguments);

                    return instance;
                },

                /**
                 * Initializes a newly created object.
                 * Override this method to add some logic when your objects are created.
                 *
                 * @example
                 *
                 *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
                 */
                init: function () {
                },

                /**
                 * Copies properties into this object.
                 *
                 * @param {Object} properties The properties to mix in.
                 *
                 * @example
                 *
                 *     MyType.mixIn({
             *         field: 'value'
             *     });
                 */
                mixIn: function (properties) {
                    for (var propertyName in properties) {
                        if (properties.hasOwnProperty(propertyName)) {
                            this[propertyName] = properties[propertyName];
                        }
                    }

                    // IE won't copy toString using the loop above
                    if (properties.hasOwnProperty('toString')) {
                        this.toString = properties.toString;
                    }
                },

                /**
                 * Creates a copy of this object.
                 *
                 * @return {Object} The clone.
                 *
                 * @example
                 *
                 *     var clone = instance.clone();
                 */
                clone: function () {
                    return this.init.prototype.extend(this);
                }
            };
        }());

        /**
         * An array of 32-bit words.
         *
         * @property {Array} words The array of 32-bit words.
         * @property {number} sigBytes The number of significant bytes in this word array.
         */
        var WordArray = C_lib.WordArray = Base.extend({
            /**
             * Initializes a newly created word array.
             *
             * @param {Array} words (Optional) An array of 32-bit words.
             * @param {number} sigBytes (Optional) The number of significant bytes in the words.
             *
             * @example
             *
             *     var wordArray = CryptoJS.lib.WordArray.create();
             *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
             *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
             */
            init: function (words, sigBytes) {
                words = this.words = words || [];

                if (sigBytes != undefined) {
                    this.sigBytes = sigBytes;
                } else {
                    this.sigBytes = words.length * 4;
                }
            },

            /**
             * Converts this word array to a string.
             *
             * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
             *
             * @return {string} The stringified word array.
             *
             * @example
             *
             *     var string = wordArray + '';
             *     var string = wordArray.toString();
             *     var string = wordArray.toString(CryptoJS.enc.Utf8);
             */
            toString: function (encoder) {
                return (encoder || Hex).stringify(this);
            },

            /**
             * Concatenates a word array to this word array.
             *
             * @param {WordArray} wordArray The word array to append.
             *
             * @return {WordArray} This word array.
             *
             * @example
             *
             *     wordArray1.concat(wordArray2);
             */
            concat: function (wordArray) {
                // Shortcuts
                var thisWords = this.words;
                var thatWords = wordArray.words;
                var thisSigBytes = this.sigBytes;
                var thatSigBytes = wordArray.sigBytes;

                // Clamp excess bits
                this.clamp();

                // Concat
                if (thisSigBytes % 4) {
                    // Copy one byte at a time
                    for (var i = 0; i < thatSigBytes; i++) {
                        var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                        thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                    }
                } else if (thatWords.length > 0xffff) {
                    // Copy one word at a time
                    for (var i = 0; i < thatSigBytes; i += 4) {
                        thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                    }
                } else {
                    // Copy all words at once
                    thisWords.push.apply(thisWords, thatWords);
                }
                this.sigBytes += thatSigBytes;

                // Chainable
                return this;
            },

            /**
             * Removes insignificant bits.
             *
             * @example
             *
             *     wordArray.clamp();
             */
            clamp: function () {
                // Shortcuts
                var words = this.words;
                var sigBytes = this.sigBytes;

                // Clamp
                words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
                words.length = Math.ceil(sigBytes / 4);
            },

            /**
             * Creates a copy of this word array.
             *
             * @return {WordArray} The clone.
             *
             * @example
             *
             *     var clone = wordArray.clone();
             */
            clone: function () {
                var clone = Base.clone.call(this);
                clone.words = this.words.slice(0);

                return clone;
            },

            /**
             * Creates a word array filled with random bytes.
             *
             * @param {number} nBytes The number of random bytes to generate.
             *
             * @return {WordArray} The random word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.lib.WordArray.random(16);
             */
            random: function (nBytes) {
                var words = [];
                for (var i = 0; i < nBytes; i += 4) {
                    words.push((Math.random() * 0x100000000) | 0);
                }

                return new WordArray.init(words, nBytes);
            }
        });

        /**
         * Encoder namespace.
         */
        var C_enc = C.enc = {};

        /**
         * Hex encoding strategy.
         */
        var Hex = C_enc.Hex = {
            /**
             * Converts a word array to a hex string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The hex string.
             *
             * @static
             *
             * @example
             *
             *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var hexChars = [];
                for (var i = 0; i < sigBytes; i++) {
                    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    hexChars.push((bite >>> 4).toString(16));
                    hexChars.push((bite & 0x0f).toString(16));
                }

                return hexChars.join('');
            },

            /**
             * Converts a hex string to a word array.
             *
             * @param {string} hexStr The hex string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
             */
            parse: function (hexStr) {
                // Shortcut
                var hexStrLength = hexStr.length;

                // Convert
                var words = [];
                for (var i = 0; i < hexStrLength; i += 2) {
                    words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
                }

                return new WordArray.init(words, hexStrLength / 2);
            }
        };

        /**
         * Latin1 encoding strategy.
         */
        var Latin1 = C_enc.Latin1 = {
            /**
             * Converts a word array to a Latin1 string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The Latin1 string.
             *
             * @static
             *
             * @example
             *
             *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var latin1Chars = [];
                for (var i = 0; i < sigBytes; i++) {
                    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    latin1Chars.push(String.fromCharCode(bite));
                }

                return latin1Chars.join('');
            },

            /**
             * Converts a Latin1 string to a word array.
             *
             * @param {string} latin1Str The Latin1 string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
             */
            parse: function (latin1Str) {
                // Shortcut
                var latin1StrLength = latin1Str.length;

                // Convert
                var words = [];
                for (var i = 0; i < latin1StrLength; i++) {
                    words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
                }

                return new WordArray.init(words, latin1StrLength);
            }
        };

        /**
         * UTF-8 encoding strategy.
         */
        var Utf8 = C_enc.Utf8 = {
            /**
             * Converts a word array to a UTF-8 string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The UTF-8 string.
             *
             * @static
             *
             * @example
             *
             *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
             */
            stringify: function (wordArray) {
                try {
                    return decodeURIComponent(escape(Latin1.stringify(wordArray)));
                } catch (e) {
                    throw new Error('Malformed UTF-8 data');
                }
            },

            /**
             * Converts a UTF-8 string to a word array.
             *
             * @param {string} utf8Str The UTF-8 string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
             */
            parse: function (utf8Str) {
                return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
            }
        };

        /**
         * Abstract buffered block algorithm template.
         *
         * The property blockSize must be implemented in a concrete subtype.
         *
         * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
         */
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
            /**
             * Resets this block algorithm's data buffer to its initial state.
             *
             * @example
             *
             *     bufferedBlockAlgorithm.reset();
             */
            reset: function () {
                // Initial values
                this._data = new WordArray.init();
                this._nDataBytes = 0;
            },

            /**
             * Adds new data to this block algorithm's buffer.
             *
             * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
             *
             * @example
             *
             *     bufferedBlockAlgorithm._append('data');
             *     bufferedBlockAlgorithm._append(wordArray);
             */
            _append: function (data) {
                // Convert string to WordArray, else assume WordArray already
                if (typeof data == 'string') {
                    data = Utf8.parse(data);
                }

                // Append
                this._data.concat(data);
                this._nDataBytes += data.sigBytes;
            },

            /**
             * Processes available data blocks.
             *
             * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
             *
             * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
             *
             * @return {WordArray} The processed data.
             *
             * @example
             *
             *     var processedData = bufferedBlockAlgorithm._process();
             *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
             */
            _process: function (doFlush) {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;
                var dataSigBytes = data.sigBytes;
                var blockSize = this.blockSize;
                var blockSizeBytes = blockSize * 4;

                // Count blocks ready
                var nBlocksReady = dataSigBytes / blockSizeBytes;
                if (doFlush) {
                    // Round up to include partial blocks
                    nBlocksReady = Math.ceil(nBlocksReady);
                } else {
                    // Round down to include only full blocks,
                    // less the number of blocks that must remain in the buffer
                    nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
                }

                // Count words ready
                var nWordsReady = nBlocksReady * blockSize;

                // Count bytes ready
                var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

                // Process blocks
                if (nWordsReady) {
                    for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                        // Perform concrete-algorithm logic
                        this._doProcessBlock(dataWords, offset);
                    }

                    // Remove processed words
                    var processedWords = dataWords.splice(0, nWordsReady);
                    data.sigBytes -= nBytesReady;
                }

                // Return processed words
                return new WordArray.init(processedWords, nBytesReady);
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = bufferedBlockAlgorithm.clone();
             */
            clone: function () {
                var clone = Base.clone.call(this);
                clone._data = this._data.clone();

                return clone;
            },

            _minBufferSize: 0
        });

        /**
         * Abstract hasher template.
         *
         * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
         */
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
            /**
             * Configuration options.
             */
            cfg: Base.extend(),

            /**
             * Initializes a newly created hasher.
             *
             * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
             *
             * @example
             *
             *     var hasher = CryptoJS.algo.SHA256.create();
             */
            init: function (cfg) {
                // Apply config defaults
                this.cfg = this.cfg.extend(cfg);

                // Set initial values
                this.reset();
            },

            /**
             * Resets this hasher to its initial state.
             *
             * @example
             *
             *     hasher.reset();
             */
            reset: function () {
                // Reset data buffer
                BufferedBlockAlgorithm.reset.call(this);

                // Perform concrete-hasher logic
                this._doReset();
            },

            /**
             * Updates this hasher with a message.
             *
             * @param {WordArray|string} messageUpdate The message to append.
             *
             * @return {Hasher} This hasher.
             *
             * @example
             *
             *     hasher.update('message');
             *     hasher.update(wordArray);
             */
            update: function (messageUpdate) {
                // Append
                this._append(messageUpdate);

                // Update the hash
                this._process();

                // Chainable
                return this;
            },

            /**
             * Finalizes the hash computation.
             * Note that the finalize operation is effectively a destructive, read-once operation.
             *
             * @param {WordArray|string} messageUpdate (Optional) A final message update.
             *
             * @return {WordArray} The hash.
             *
             * @example
             *
             *     var hash = hasher.finalize();
             *     var hash = hasher.finalize('message');
             *     var hash = hasher.finalize(wordArray);
             */
            finalize: function (messageUpdate) {
                // Final message update
                if (messageUpdate) {
                    this._append(messageUpdate);
                }

                // Perform concrete-hasher logic
                var hash = this._doFinalize();

                return hash;
            },

            blockSize: 512/32,

            /**
             * Creates a shortcut function to a hasher's object interface.
             *
             * @param {Hasher} hasher The hasher to create a helper for.
             *
             * @return {Function} The shortcut function.
             *
             * @static
             *
             * @example
             *
             *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
             */
            _createHelper: function (hasher) {
                return function (message, cfg) {
                    return new hasher.init(cfg).finalize(message);
                };
            },

            /**
             * Creates a shortcut function to the HMAC's object interface.
             *
             * @param {Hasher} hasher The hasher to use in this HMAC helper.
             *
             * @return {Function} The shortcut function.
             *
             * @static
             *
             * @example
             *
             *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
             */
            _createHmacHelper: function (hasher) {
                return function (message, key) {
                    return new C_algo.HMAC.init(hasher, key).finalize(message);
                };
            }
        });

        /**
         * Algorithm namespace.
         */
        var C_algo = C.algo = {};

        return C;
    }(Math));

window["Crypto"] = CryptoJS;

/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = new hasher.init();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clamp excess bits
            key.clamp();

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());

/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                        ((gamma0x << 14) | (gamma0x >>> 18)) ^
                        (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                        ((gamma1x << 13) | (gamma1x >>> 19)) ^
                        (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());
(function(scope){
var CryptoJS=CryptoJS||function(e,n){var t={},i=t.lib={},r=function(){},s=i.Base={extend:function(e){r.prototype=this;var n=new r;return e&&n.mixIn(e),n.hasOwnProperty("init")||(n.init=function(){n.$super.init.apply(this,arguments)}),n.init.prototype=n,n.$super=this,n},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var n in e)e.hasOwnProperty(n)&&(this[n]=e[n]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},o=i.WordArray=s.extend({init:function(e,n){e=this.words=e||[],this.sigBytes=void 0!=n?n:4*e.length},toString:function(e){return(e||u).stringify(this)},concat:function(e){var n=this.words,t=e.words,i=this.sigBytes;if(e=e.sigBytes,this.clamp(),i%4)for(var r=0;r<e;r++)n[i+r>>>2]|=(t[r>>>2]>>>24-r%4*8&255)<<24-(i+r)%4*8;else if(65535<t.length)for(r=0;r<e;r+=4)n[i+r>>>2]=t[r>>>2];else n.push.apply(n,t);return this.sigBytes+=e,this},clamp:function(){var n=this.words,t=this.sigBytes;n[t>>>2]&=4294967295<<32-t%4*8,n.length=e.ceil(t/4)},clone:function(){var e=s.clone.call(this);return e.words=this.words.slice(0),e},random:function(n){for(var t=[],i=0;i<n;i+=4)t.push(4294967296*e.random()|0);return new o.init(t,n)}}),a=t.enc={},u=a.Hex={stringify:function(e){var n=e.words;e=e.sigBytes;for(var t=[],i=0;i<e;i++){var r=n[i>>>2]>>>24-i%4*8&255;t.push((r>>>4).toString(16)),t.push((15&r).toString(16))}return t.join("")},parse:function(e){for(var n=e.length,t=[],i=0;i<n;i+=2)t[i>>>3]|=parseInt(e.substr(i,2),16)<<24-i%8*4;return new o.init(t,n/2)}},c=a.Latin1={stringify:function(e){var n=e.words;e=e.sigBytes;for(var t=[],i=0;i<e;i++)t.push(String.fromCharCode(n[i>>>2]>>>24-i%4*8&255));return t.join("")},parse:function(e){for(var n=e.length,t=[],i=0;i<n;i++)t[i>>>2]|=(255&e.charCodeAt(i))<<24-i%4*8;return new o.init(t,n)}},d=a.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},l=i.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=d.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(n){var t=this._data,i=t.words,r=t.sigBytes,s=this.blockSize,a=r/(4*s),a=n?e.ceil(a):e.max((0|a)-this._minBufferSize,0);if(n=a*s,r=e.min(4*n,r),n){for(var u=0;u<n;u+=s)this._doProcessBlock(i,u);u=i.splice(0,n),t.sigBytes-=r}return new o.init(u,r)},clone:function(){var e=s.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});i.Hasher=l.extend({cfg:s.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){l.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(n,t){return new e.init(t).finalize(n)}},_createHmacHelper:function(e){return function(n,t){return new f.HMAC.init(e,t).finalize(n)}}});var f=t.algo={};return t}(Math);!function(e){for(var n=CryptoJS,t=n.lib,i=t.WordArray,r=t.Hasher,t=n.algo,s=[],o=[],a=function(e){return 4294967296*(e-(0|e))|0},u=2,c=0;64>c;){var d;e:{d=u;for(var l=e.sqrt(d),f=2;f<=l;f++)if(!(d%f)){d=!1;break e}d=!0}d&&(8>c&&(s[c]=a(e.pow(u,.5))),o[c]=a(e.pow(u,1/3)),c++),u++}var v=[],t=t.SHA256=r.extend({_doReset:function(){this._hash=new i.init(s.slice(0))},_doProcessBlock:function(e,n){for(var t=this._hash.words,i=t[0],r=t[1],s=t[2],a=t[3],u=t[4],c=t[5],d=t[6],l=t[7],f=0;64>f;f++){if(16>f)v[f]=0|e[n+f];else{var g=v[f-15],m=v[f-2];v[f]=((g<<25|g>>>7)^(g<<14|g>>>18)^g>>>3)+v[f-7]+((m<<15|m>>>17)^(m<<13|m>>>19)^m>>>10)+v[f-16]}g=l+((u<<26|u>>>6)^(u<<21|u>>>11)^(u<<7|u>>>25))+(u&c^~u&d)+o[f]+v[f],m=((i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22))+(i&r^i&s^r&s),l=d,d=c,c=u,u=a+g|0,a=s,s=r,r=i,i=g+m|0}t[0]=t[0]+i|0,t[1]=t[1]+r|0,t[2]=t[2]+s|0,t[3]=t[3]+a|0,t[4]=t[4]+u|0,t[5]=t[5]+c|0,t[6]=t[6]+d|0,t[7]=t[7]+l|0},_doFinalize:function(){var n=this._data,t=n.words,i=8*this._nDataBytes,r=8*n.sigBytes;return t[r>>>5]|=128<<24-r%32,t[14+(r+64>>>9<<4)]=e.floor(i/4294967296),t[15+(r+64>>>9<<4)]=i,n.sigBytes=4*t.length,this._process(),this._hash},clone:function(){var e=r.clone.call(this);return e._hash=this._hash.clone(),e}});n.SHA256=r._createHelper(t),n.HmacSHA256=r._createHmacHelper(t)}(Math),function(){var e=CryptoJS,n=e.enc.Utf8;e.algo.HMAC=e.lib.Base.extend({init:function(e,t){e=this._hasher=new e.init,"string"==typeof t&&(t=n.parse(t));var i=e.blockSize,r=4*i;t.sigBytes>r&&(t=e.finalize(t)),t.clamp();for(var s=this._oKey=t.clone(),o=this._iKey=t.clone(),a=s.words,u=o.words,c=0;c<i;c++)a[c]^=1549556828,u[c]^=909522486;s.sigBytes=o.sigBytes=r,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var n=this._hasher;return e=n.finalize(e),n.reset(),n.finalize(this._oKey.clone().concat(e))}})}(),function(){var e=CryptoJS,n=e.lib.WordArray;e.enc.Base64={stringify:function(e){var n=e.words,t=e.sigBytes,i=this._map;e.clamp(),e=[];for(var r=0;r<t;r+=3)for(var s=(n[r>>>2]>>>24-r%4*8&255)<<16|(n[r+1>>>2]>>>24-(r+1)%4*8&255)<<8|n[r+2>>>2]>>>24-(r+2)%4*8&255,o=0;4>o&&r+.75*o<t;o++)e.push(i.charAt(s>>>6*(3-o)&63));if(n=i.charAt(64))for(;e.length%4;)e.push(n);return e.join("")},parse:function(e){var t=e.length,i=this._map,r=i.charAt(64);r&&-1!=(r=e.indexOf(r))&&(t=r);for(var r=[],s=0,o=0;o<t;o++)if(o%4){var a=i.indexOf(e.charAt(o-1))<<o%4*2,u=i.indexOf(e.charAt(o))>>>6-o%4*2;r[s>>>2]|=(a|u)<<24-s%4*8,s++}return n.create(r,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}();var gameanalytics;!function(e){!function(e){e[e.Undefined=0]="Undefined",e[e.Debug=1]="Debug",e[e.Info=2]="Info",e[e.Warning=3]="Warning",e[e.Error=4]="Error",e[e.Critical=5]="Critical"}(e.EGAErrorSeverity||(e.EGAErrorSeverity={}));!function(e){e[e.Undefined=0]="Undefined",e[e.Male=1]="Male",e[e.Female=2]="Female"}(e.EGAGender||(e.EGAGender={}));!function(e){e[e.Undefined=0]="Undefined",e[e.Start=1]="Start",e[e.Complete=2]="Complete",e[e.Fail=3]="Fail"}(e.EGAProgressionStatus||(e.EGAProgressionStatus={}));!function(e){e[e.Undefined=0]="Undefined",e[e.Source=1]="Source",e[e.Sink=2]="Sink"}(e.EGAResourceFlowType||(e.EGAResourceFlowType={}));!function(e){!function(e){e[e.Undefined=0]="Undefined",e[e.Rejected=1]="Rejected"}(e.EGASdkErrorType||(e.EGASdkErrorType={}));!function(e){e[e.NoResponse=0]="NoResponse",e[e.BadResponse=1]="BadResponse",e[e.RequestTimeout=2]="RequestTimeout",e[e.JsonEncodeFailed=3]="JsonEncodeFailed",e[e.JsonDecodeFailed=4]="JsonDecodeFailed",e[e.InternalServerError=5]="InternalServerError",e[e.BadRequest=6]="BadRequest",e[e.Unauthorized=7]="Unauthorized",e[e.UnknownResponseCode=8]="UnknownResponseCode",e[e.Ok=9]="Ok"}(e.EGAHTTPApiResponse||(e.EGAHTTPApiResponse={}))}(e.http||(e.http={}))}(gameanalytics||(gameanalytics={}));var EGAErrorSeverity=gameanalytics.EGAErrorSeverity,EGAGender=gameanalytics.EGAGender,EGAProgressionStatus=gameanalytics.EGAProgressionStatus,EGAResourceFlowType=gameanalytics.EGAResourceFlowType,gameanalytics;!function(e){!function(e){var n;!function(e){e[e.Error=0]="Error",e[e.Warning=1]="Warning",e[e.Info=2]="Info",e[e.Debug=3]="Debug"}(n||(n={}));var t=function(){function e(){e.debugEnabled=!1}return e.setInfoLog=function(n){e.instance.infoLogEnabled=n},e.setVerboseLog=function(n){e.instance.infoLogVerboseEnabled=n},e.i=function(t){if(e.instance.infoLogEnabled){var i="Info/"+e.Tag+": "+t;e.instance.sendNotificationMessage(i,n.Info)}},e.w=function(t){var i="Warning/"+e.Tag+": "+t;e.instance.sendNotificationMessage(i,n.Warning)},e.e=function(t){var i="Error/"+e.Tag+": "+t;e.instance.sendNotificationMessage(i,n.Error)},e.ii=function(t){if(e.instance.infoLogVerboseEnabled){var i="Verbose/"+e.Tag+": "+t;e.instance.sendNotificationMessage(i,n.Info)}},e.d=function(t){if(e.debugEnabled){var i="Debug/"+e.Tag+": "+t;e.instance.sendNotificationMessage(i,n.Debug)}},e.prototype.sendNotificationMessage=function(e,t){switch(t){case n.Error:console.error(e);break;case n.Warning:console.warn(e);break;case n.Debug:"function"==typeof console.debug?console.debug(e):console.log(e);break;case n.Info:console.log(e)}},e}();t.instance=new t,t.Tag="GameAnalytics",e.GALogger=t}(e.logging||(e.logging={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.logging.GALogger,i=function(){function e(){}return e.getHmac=function(e,n){var t=CryptoJS.HmacSHA256(n,e);return CryptoJS.enc.Base64.stringify(t)},e.stringMatch=function(e,n){return!(!e||!n)&&n.test(e)},e.joinStringArray=function(e,n){for(var t="",i=0,r=e.length;i<r;i++)i>0&&(t+=n),t+=e[i];return t},e.stringArrayContainsString=function(e,n){if(0===e.length)return!1;for(var t in e)if(e[t]===n)return!0;return!1},e.encode64=function(n){n=encodeURI(n);var t,i,r,s,o,a="",u=0,c=0,d=0;do{t=n.charCodeAt(d++),i=n.charCodeAt(d++),u=n.charCodeAt(d++),r=t>>2,s=(3&t)<<4|i>>4,o=(15&i)<<2|u>>6,c=63&u,isNaN(i)?o=c=64:isNaN(u)&&(c=64),a=a+e.keyStr.charAt(r)+e.keyStr.charAt(s)+e.keyStr.charAt(o)+e.keyStr.charAt(c),t=i=u=0,r=s=o=c=0}while(d<n.length);return a},e.decode64=function(n){var i,r,s,o,a,u="",c=0,d=0,l=0;/[^A-Za-z0-9\+\/\=]/g.exec(n)&&t.w("There were invalid base64 characters in the input text. Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='. Expect errors in decoding."),n=n.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{s=e.keyStr.indexOf(n.charAt(l++)),o=e.keyStr.indexOf(n.charAt(l++)),a=e.keyStr.indexOf(n.charAt(l++)),d=e.keyStr.indexOf(n.charAt(l++)),i=s<<2|o>>4,r=(15&o)<<4|a>>2,c=(3&a)<<6|d,u+=String.fromCharCode(i),64!=a&&(u+=String.fromCharCode(r)),64!=d&&(u+=String.fromCharCode(c)),i=r=c=0,s=o=a=d=0}while(l<n.length);return decodeURI(u)},e.timeIntervalSince1970=function(){var e=new Date;return Math.round(e.getTime()/1e3)},e.createGuid=function(){return(e.s4()+e.s4()+"-"+e.s4()+"-4"+e.s4().substr(0,3)+"-"+e.s4()+"-"+e.s4()+e.s4()+e.s4()).toLowerCase()},e.s4=function(){return(65536*(1+Math.random())|0).toString(16).substring(1)},e}();i.keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n.GAUtilities=i}(e.utilities||(e.utilities={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.logging.GALogger,i=e.http.EGASdkErrorType,r=e.utilities.GAUtilities,s=function(){function n(){}return n.validateBusinessEvent=function(e,i,r,s,o){return n.validateCurrency(e)?n.validateShortString(r,!0)?n.validateEventPartLength(s,!1)?n.validateEventPartCharacters(s)?n.validateEventPartLength(o,!1)?!!n.validateEventPartCharacters(o)||(t.i("Validation fail - business event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+o),!1):(t.i("Validation fail - business event - itemId. Cannot be (null), empty or above 64 characters. String: "+o),!1):(t.i("Validation fail - business event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+s),!1):(t.i("Validation fail - business event - itemType: Cannot be (null), empty or above 64 characters. String: "+s),!1):(t.i("Validation fail - business event - cartType. Cannot be above 32 length. String: "+r),!1):(t.i("Validation fail - business event - currency: Cannot be (null) and need to be A-Z, 3 characters and in the standard at openexchangerates.org. Failed currency: "+e),!1)},n.validateResourceEvent=function(i,s,o,a,u,c,d){return i==e.EGAResourceFlowType.Undefined?(t.i("Validation fail - resource event - flowType: Invalid flow type."),!1):s?r.stringArrayContainsString(c,s)?o>0?a?n.validateEventPartLength(a,!1)?n.validateEventPartCharacters(a)?r.stringArrayContainsString(d,a)?n.validateEventPartLength(u,!1)?!!n.validateEventPartCharacters(u)||(t.i("Validation fail - resource event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+u),!1):(t.i("Validation fail - resource event - itemId: Cannot be (null), empty or above 64 characters. String: "+u),!1):(t.i("Validation fail - resource event - itemType: Not found in list of pre-defined available resource itemTypes. String: "+a),!1):(t.i("Validation fail - resource event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+a),!1):(t.i("Validation fail - resource event - itemType: Cannot be (null), empty or above 64 characters. String: "+a),!1):(t.i("Validation fail - resource event - itemType: Cannot be (null)"),!1):(t.i("Validation fail - resource event - amount: Float amount cannot be 0 or negative. Value: "+o),!1):(t.i("Validation fail - resource event - currency: Not found in list of pre-defined available resource currencies. String: "+s),!1):(t.i("Validation fail - resource event - currency: Cannot be (null)"),!1)},n.validateProgressionEvent=function(i,r,s,o){if(i==e.EGAProgressionStatus.Undefined)return t.i("Validation fail - progression event: Invalid progression status."),!1;if(o&&!s&&r)return t.i("Validation fail - progression event: 03 found but 01+02 are invalid. Progression must be set as either 01, 01+02 or 01+02+03."),!1;if(s&&!r)return t.i("Validation fail - progression event: 02 found but not 01. Progression must be set as either 01, 01+02 or 01+02+03"),!1;if(!r)return t.i("Validation fail - progression event: progression01 not valid. Progressions must be set as either 01, 01+02 or 01+02+03"),!1;if(!n.validateEventPartLength(r,!1))return t.i("Validation fail - progression event - progression01: Cannot be (null), empty or above 64 characters. String: "+r),!1;if(!n.validateEventPartCharacters(r))return t.i("Validation fail - progression event - progression01: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+r),!1;if(s){if(!n.validateEventPartLength(s,!0))return t.i("Validation fail - progression event - progression02: Cannot be empty or above 64 characters. String: "+s),!1;if(!n.validateEventPartCharacters(s))return t.i("Validation fail - progression event - progression02: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+s),!1}if(o){if(!n.validateEventPartLength(o,!0))return t.i("Validation fail - progression event - progression03: Cannot be empty or above 64 characters. String: "+o),!1;if(!n.validateEventPartCharacters(o))return t.i("Validation fail - progression event - progression03: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: "+o),!1}return!0},n.validateDesignEvent=function(e,i){return n.validateEventIdLength(e)?!!n.validateEventIdCharacters(e)||(t.i("Validation fail - design event - eventId: Non valid characters. Only allowed A-z, 0-9, -_., ()!?. String: "+e),!1):(t.i("Validation fail - design event - eventId: Cannot be (null) or empty. Only 5 event parts allowed seperated by :. Each part need to be 32 characters or less. String: "+e),!1)},n.validateErrorEvent=function(i,r){return i==e.EGAErrorSeverity.Undefined?(t.i("Validation fail - error event - severity: Severity was unsupported value."),!1):!!n.validateLongString(r,!0)||(t.i("Validation fail - error event - message: Message cannot be above 8192 characters."),!1)},n.validateSdkErrorEvent=function(e,r,s){return!!n.validateKeys(e,r)&&(s!==i.Undefined||(t.i("Validation fail - sdk error event - type: Type was unsupported value."),!1))},n.validateKeys=function(e,n){return!(!r.stringMatch(e,/^[A-z0-9]{32}$/)||!r.stringMatch(n,/^[A-z0-9]{40}$/))},n.validateCurrency=function(e){return!!e&&!!r.stringMatch(e,/^[A-Z]{3}$/)},n.validateEventPartLength=function(e,n){return!(!n||e)||!!e&&!(e.length>64)},n.validateEventPartCharacters=function(e){return!!r.stringMatch(e,/^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}$/)},n.validateEventIdLength=function(e){return!!e&&!!r.stringMatch(e,/^[^:]{1,64}(?::[^:]{1,64}){0,4}$/)},n.validateEventIdCharacters=function(e){return!!e&&!!r.stringMatch(e,/^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}(:[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}){0,4}$/)},n.validateAndCleanInitRequestResponse=function(e){if(null==e)return t.w("validateInitRequestResponse failed - no response dictionary."),null;var n={};try{n.enabled=e.enabled}catch(e){return t.w("validateInitRequestResponse failed - invalid type in 'enabled' field."),null}try{var i=e.server_ts;if(!(i>0))return t.w("validateInitRequestResponse failed - invalid value in 'server_ts' field."),null;n.server_ts=i}catch(n){return t.w("validateInitRequestResponse failed - invalid type in 'server_ts' field. type="+typeof e.server_ts+", value="+e.server_ts+", "+n),null}return n},n.validateBuild=function(e){return!!n.validateShortString(e,!1)},n.validateSdkWrapperVersion=function(e){return!!r.stringMatch(e,/^(unity|unreal|gamemaker|cocos2d|construct) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/)},n.validateEngineVersion=function(e){return!(!e||!r.stringMatch(e,/^(unity|unreal|gamemaker|cocos2d|construct) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/))},n.validateUserId=function(e){return!!n.validateString(e,!1)||(t.i("Validation fail - user id: id cannot be (null), empty or above 64 characters."),!1)},n.validateShortString=function(e,n){return!(!n||e)||!(!e||e.length>32)},n.validateString=function(e,n){return!(!n||e)||!(!e||e.length>64)},n.validateLongString=function(e,n){return!(!n||e)||!(!e||e.length>8192)},n.validateConnectionType=function(e){return r.stringMatch(e,/^(wwan|wifi|lan|offline)$/)},n.validateCustomDimensions=function(e){return n.validateArrayOfStrings(20,32,!1,"custom dimensions",e)},n.validateResourceCurrencies=function(e){if(!n.validateArrayOfStrings(20,64,!1,"resource currencies",e))return!1;for(var i=0;i<e.length;++i)if(!r.stringMatch(e[i],/^[A-Za-z]+$/))return t.i("resource currencies validation failed: a resource currency can only be A-Z, a-z. String was: "+e[i]),!1;return!0},n.validateResourceItemTypes=function(e){if(!n.validateArrayOfStrings(20,32,!1,"resource item types",e))return!1;for(var i=0;i<e.length;++i)if(!n.validateEventPartCharacters(e[i]))return t.i("resource item types validation failed: a resource item type cannot contain other characters than A-z, 0-9, -_., ()!?. String was: "+e[i]),!1;return!0},n.validateDimension01=function(e,n){return!e||!!r.stringArrayContainsString(n,e)},n.validateDimension02=function(e,n){return!e||!!r.stringArrayContainsString(n,e)},n.validateDimension03=function(e,n){return!e||!!r.stringArrayContainsString(n,e)},n.validateArrayOfStrings=function(e,n,i,r,s){var o=r;if(o||(o="Array"),!s)return t.i(o+" validation failed: array cannot be null. "),!1;if(0==i&&0==s.length)return t.i(o+" validation failed: array cannot be empty. "),!1;if(e>0&&s.length>e)return t.i(o+" validation failed: array cannot exceed "+e+" values. It has "+s.length+" values."),!1;for(var a=0;a<s.length;++a){var u=s[a]?s[a].length:0;if(0===u)return t.i(o+" validation failed: contained an empty string. Array="+JSON.stringify(s)),!1;if(n>0&&u>n)return t.i(o+" validation failed: a string exceeded max allowed length (which is: "+n+"). String was: "+s[a]),!1}return!0},n.validateFacebookId=function(e){return!!n.validateString(e,!1)||(t.i("Validation fail - facebook id: id cannot be (null), empty or above 64 characters."),!1)},n.validateGender=function(n){if(isNaN(Number(e.EGAGender[n]))){if(n==e.EGAGender.Undefined||n!=e.EGAGender.Male&&n!=e.EGAGender.Female)return t.i("Validation fail - gender: Has to be 'male' or 'female'. Was: "+n),!1}else if(n==e.EGAGender[e.EGAGender.Undefined]||n!=e.EGAGender[e.EGAGender.Male]&&n!=e.EGAGender[e.EGAGender.Female])return t.i("Validation fail - gender: Has to be 'male' or 'female'. Was: "+n),!1;return!0},n.validateBirthyear=function(e){return!(e<0||e>9999)||(t.i("Validation fail - birthYear: Cannot be (null) or invalid range."),!1)},n.validateClientTs=function(e){return!(e<-4294967294||e>4294967294)},n}();n.GAValidator=s}(e.validators||(e.validators={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(e){var n=function(){function e(e,n,t){this.name=e,this.value=n,this.version=t}return e}();e.NameValueVersion=n;var t=function(){function e(e,n){this.name=e,this.version=n}return e}();e.NameVersion=t;var i=function(){function e(){}return e.touch=function(){},e.getRelevantSdkVersion=function(){return e.sdkGameEngineVersion?e.sdkGameEngineVersion:e.sdkWrapperVersion},e.getConnectionType=function(){return e.connectionType},e.updateConnectionType=function(){navigator.onLine?"ios"===e.buildPlatform||"android"===e.buildPlatform?e.connectionType="wwan":e.connectionType="lan":e.connectionType="offline"},e.getOSVersionString=function(){return e.buildPlatform+" "+e.osVersionPair.version},e.runtimePlatformToString=function(){return e.osVersionPair.name},e.getBrowserVersionString=function(){var e,n=navigator.userAgent,t=n.match(/(opera|chrome|safari|firefox|ubrowser|msie|trident(?=\/))\/?\s*(\d+)/i)||[];if(/trident/i.test(t[1]))return e=/\brv[ :]+(\d+)/g.exec(n)||[],"IE "+(e[1]||"");if("Chrome"===t[1]&&null!=(e=n.match(/\b(OPR|Edge|UBrowser)\/(\d+)/)))return e.slice(1).join(" ").replace("OPR","Opera").replace("UBrowser","UC").toLowerCase();var i=t[2]?[t[1],t[2]]:[navigator.appName,navigator.appVersion,"-?"];return null!=(e=n.match(/version\/(\d+)/i))&&i.splice(1,1,e[1]),i.join(" ").toLowerCase()},e.getDeviceModel=function(){return"unknown"},e.getDeviceManufacturer=function(){return"unknown"},e.matchItem=function(e,n){var i,r,s,o,a,u=new t("unknown","0.0.0"),c=0,d=0;for(c=0;c<n.length;c+=1)if(i=new RegExp(n[c].value,"i"),i.test(e)){if(r=new RegExp(n[c].version+"[- /:;]([\\d._]+)","i"),s=e.match(r),a="",s&&s[1]&&(o=s[1]),o){var l=o.split(/[._]+/);for(d=0;d<Math.min(l.length,3);d+=1)a+=l[d]+(d<Math.min(l.length,3)-1?".":"")}else a="0.0.0";return u.name=n[c].name,u.version=a,u}return u},e}();i.sdkWrapperVersion="javascript 2.1.0",i.osVersionPair=i.matchItem([navigator.platform,navigator.userAgent,navigator.appVersion,navigator.vendor,window.opera].join(" "),[new n("windows_phone","Windows Phone","OS"),new n("windows","Win","NT"),new n("ios","iPhone","OS"),new n("ios","iPad","OS"),new n("ios","iPod","OS"),new n("android","Android","Android"),new n("blackBerry","BlackBerry","/"),new n("mac_osx","Mac","OS X"),new n("tizen","Tizen","Tizen"),new n("linux","Linux","rv")]),i.buildPlatform=i.runtimePlatformToString(),i.deviceModel=i.getDeviceModel(),i.deviceManufacturer=i.getDeviceManufacturer(),i.osVersion=i.getOSVersionString(),i.browserVersion=i.getBrowserVersionString(),i.maxSafeInteger=Math.pow(2,53)-1,e.GADevice=i}(e.device||(e.device={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(e){var n=function(){function e(n){this.deadline=n,this.ignore=!1,this.async=!1,this.running=!1,this.id=++e.idCounter}return e}();n.idCounter=0,e.TimedBlock=n}(e.threading||(e.threading={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(e){var n=function(){function e(e){this.comparer=e,this._subQueues={},this._sortedKeys=[]}return e.prototype.enqueue=function(e,n){-1===this._sortedKeys.indexOf(e)&&this.addQueueOfPriority(e),this._subQueues[e].push(n)},e.prototype.addQueueOfPriority=function(e){var n=this;this._sortedKeys.push(e),this._sortedKeys.sort(function(e,t){return n.comparer.compare(e,t)}),this._subQueues[e]=[]},e.prototype.peek=function(){if(this.hasItems())return this._subQueues[this._sortedKeys[0]][0];throw new Error("The queue is empty")},e.prototype.hasItems=function(){return this._sortedKeys.length>0},e.prototype.dequeue=function(){if(this.hasItems())return this.dequeueFromHighPriorityQueue();throw new Error("The queue is empty")},e.prototype.dequeueFromHighPriorityQueue=function(){var e=this._sortedKeys[0],n=this._subQueues[e].shift();return 0===this._subQueues[e].length&&(this._sortedKeys.shift(),delete this._subQueues[e]),n},e}();e.PriorityQueue=n}(e.threading||(e.threading={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t,i=e.logging.GALogger;!function(e){e[e.Equal=0]="Equal",e[e.LessOrEqual=1]="LessOrEqual",e[e.NotEqual=2]="NotEqual"}(t=n.EGAStoreArgsOperator||(n.EGAStoreArgsOperator={}));var r;!function(e){e[e.Events=0]="Events",e[e.Sessions=1]="Sessions",e[e.Progression=2]="Progression"}(r=n.EGAStore||(n.EGAStore={}));var s=function(){function e(){this.eventsStore=[],this.sessionsStore=[],this.progressionStore=[],this.storeItems={};try{"object"==typeof localStorage?(localStorage.setItem("testingLocalStorage","yes"),localStorage.removeItem("testingLocalStorage"),e.storageAvailable=!0):e.storageAvailable=!1}catch(e){}}return e.isStorageAvailable=function(){return e.storageAvailable},e.isStoreTooLargeForEvents=function(){return e.instance.eventsStore.length+e.instance.sessionsStore.length>e.MaxNumberOfEntries},e.select=function(n,i,r,s){void 0===i&&(i=[]),void 0===r&&(r=!1),void 0===s&&(s=0);var o=e.getStore(n);if(!o)return null;for(var a=[],u=0;u<o.length;++u){for(var c=o[u],d=!0,l=0;l<i.length;++l){var f=i[l];if(c[f[0]])switch(f[1]){case t.Equal:d=c[f[0]]==f[2];break;case t.LessOrEqual:d=c[f[0]]<=f[2];break;case t.NotEqual:d=c[f[0]]!=f[2];break;default:d=!1}else d=!1;if(!d)break}d&&a.push(c)}return r&&a.sort(function(e,n){return e.client_ts-n.client_ts}),s>0&&a.length>s&&(a=a.slice(0,s+1)),a},e.update=function(n,i,r){void 0===r&&(r=[]);var s=e.getStore(n);if(!s)return!1;for(var o=0;o<s.length;++o){for(var a=s[o],u=!0,c=0;c<r.length;++c){var d=r[c];if(a[d[0]])switch(d[1]){case t.Equal:u=a[d[0]]==d[2];break;case t.LessOrEqual:u=a[d[0]]<=d[2];break;case t.NotEqual:u=a[d[0]]!=d[2];break;default:u=!1}else u=!1;if(!u)break}if(u)for(var c=0;c<i.length;++c){var l=i[c];a[l[0]]=l[1]}}return!0},e.delete=function(n,i){var r=e.getStore(n);if(r)for(var s=0;s<r.length;++s){for(var o=r[s],a=!0,u=0;u<i.length;++u){var c=i[u];if(o[c[0]])switch(c[1]){case t.Equal:a=o[c[0]]==c[2];break;case t.LessOrEqual:a=o[c[0]]<=c[2];break;case t.NotEqual:a=o[c[0]]!=c[2];break;default:a=!1}else a=!1;if(!a)break}a&&(r.splice(s,1),--s)}},e.insert=function(n,t,i,r){void 0===i&&(i=!1),void 0===r&&(r=null);var s=e.getStore(n);if(s)if(i){if(!r)return;for(var o=!1,a=0;a<s.length;++a){var u=s[a];if(u[r]==t[r]){for(var c in t)u[c]=t[c];o=!0;break}}o||s.push(t)}else s.push(t)},e.save=function(){if(!e.isStorageAvailable())return void i.w("Storage is not available, cannot save.");localStorage.setItem(e.KeyPrefix+e.EventsStoreKey,JSON.stringify(e.instance.eventsStore)),localStorage.setItem(e.KeyPrefix+e.SessionsStoreKey,JSON.stringify(e.instance.sessionsStore)),localStorage.setItem(e.KeyPrefix+e.ProgressionStoreKey,JSON.stringify(e.instance.progressionStore)),localStorage.setItem(e.KeyPrefix+e.ItemsStoreKey,JSON.stringify(e.instance.storeItems))},e.load=function(){if(!e.isStorageAvailable())return void i.w("Storage is not available, cannot load.");try{e.instance.eventsStore=JSON.parse(localStorage.getItem(e.KeyPrefix+e.EventsStoreKey)),e.instance.eventsStore||(e.instance.eventsStore=[])}catch(n){i.w("Load failed for 'events' store. Using empty store."),e.instance.eventsStore=[]}try{e.instance.sessionsStore=JSON.parse(localStorage.getItem(e.KeyPrefix+e.SessionsStoreKey)),e.instance.sessionsStore||(e.instance.sessionsStore=[])}catch(n){i.w("Load failed for 'sessions' store. Using empty store."),e.instance.sessionsStore=[]}try{e.instance.progressionStore=JSON.parse(localStorage.getItem(e.KeyPrefix+e.ProgressionStoreKey)),e.instance.progressionStore||(e.instance.progressionStore=[])}catch(n){i.w("Load failed for 'progression' store. Using empty store."),e.instance.progressionStore=[]}try{e.instance.storeItems=JSON.parse(localStorage.getItem(e.KeyPrefix+e.ItemsStoreKey)),e.instance.storeItems||(e.instance.storeItems={})}catch(n){i.w("Load failed for 'items' store. Using empty store."),e.instance.progressionStore=[]}},e.setItem=function(n,t){var i=e.KeyPrefix+n;t?e.instance.storeItems[i]=t:i in e.instance.storeItems&&delete e.instance.storeItems[i]},e.getItem=function(n){var t=e.KeyPrefix+n;return t in e.instance.storeItems?e.instance.storeItems[t]:null},e.getStore=function(n){switch(n){case r.Events:return e.instance.eventsStore;case r.Sessions:return e.instance.sessionsStore;case r.Progression:return e.instance.progressionStore;default:return i.w("GAStore.getStore(): Cannot find store: "+n),null}},e}();s.instance=new s,s.MaxNumberOfEntries=2e3,s.KeyPrefix="GA::",s.EventsStoreKey="ga_event",s.SessionsStoreKey="ga_session",s.ProgressionStoreKey="ga_progression",s.ItemsStoreKey="ga_items",n.GAStore=s}(e.store||(e.store={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.validators.GAValidator,i=e.utilities.GAUtilities,r=e.logging.GALogger,s=e.store.GAStore,o=e.device.GADevice,a=e.store.EGAStore,u=e.store.EGAStoreArgsOperator,c=function(){function n(){this.availableCustomDimensions01=[],this.availableCustomDimensions02=[],this.availableCustomDimensions03=[],this.availableResourceCurrencies=[],this.availableResourceItemTypes=[],this.sdkConfigDefault={},this.sdkConfig={},this.progressionTries={}}return n.setUserId=function(e){n.instance.userId=e,n.cacheIdentifier()},n.getIdentifier=function(){return n.instance.identifier},n.isInitialized=function(){return n.instance.initialized},n.setInitialized=function(e){n.instance.initialized=e},n.getSessionStart=function(){return n.instance.sessionStart},n.getSessionNum=function(){return n.instance.sessionNum},n.getTransactionNum=function(){return n.instance.transactionNum},n.getSessionId=function(){return n.instance.sessionId},n.getCurrentCustomDimension01=function(){return n.instance.currentCustomDimension01},n.getCurrentCustomDimension02=function(){return n.instance.currentCustomDimension02},n.getCurrentCustomDimension03=function(){return n.instance.currentCustomDimension03},n.getGameKey=function(){return n.instance.gameKey},n.getGameSecret=function(){return n.instance.gameSecret},n.getAvailableCustomDimensions01=function(){return n.instance.availableCustomDimensions01},n.setAvailableCustomDimensions01=function(e){t.validateCustomDimensions(e)&&(n.instance.availableCustomDimensions01=e,n.validateAndFixCurrentDimensions(),r.i("Set available custom01 dimension values: ("+i.joinStringArray(e,", ")+")"))},n.getAvailableCustomDimensions02=function(){return n.instance.availableCustomDimensions02},n.setAvailableCustomDimensions02=function(e){t.validateCustomDimensions(e)&&(n.instance.availableCustomDimensions02=e,n.validateAndFixCurrentDimensions(),r.i("Set available custom02 dimension values: ("+i.joinStringArray(e,", ")+")"))},n.getAvailableCustomDimensions03=function(){return n.instance.availableCustomDimensions03},n.setAvailableCustomDimensions03=function(e){t.validateCustomDimensions(e)&&(n.instance.availableCustomDimensions03=e,n.validateAndFixCurrentDimensions(),r.i("Set available custom03 dimension values: ("+i.joinStringArray(e,", ")+")"))},n.getAvailableResourceCurrencies=function(){return n.instance.availableResourceCurrencies},n.setAvailableResourceCurrencies=function(e){t.validateResourceCurrencies(e)&&(n.instance.availableResourceCurrencies=e,r.i("Set available resource currencies: ("+i.joinStringArray(e,", ")+")"))},n.getAvailableResourceItemTypes=function(){return n.instance.availableResourceItemTypes},n.setAvailableResourceItemTypes=function(e){t.validateResourceItemTypes(e)&&(n.instance.availableResourceItemTypes=e,r.i("Set available resource item types: ("+i.joinStringArray(e,", ")+")"))},n.getBuild=function(){return n.instance.build},n.setBuild=function(e){n.instance.build=e,r.i("Set build version: "+e)},n.getUseManualSessionHandling=function(){return n.instance.useManualSessionHandling},n.prototype.setDefaultId=function(e){this.defaultUserId=e||"",n.cacheIdentifier()},n.getDefaultId=function(){return n.instance.defaultUserId},n.getSdkConfig=function(){var e,t=0;for(var i in n.instance.sdkConfig)0===t&&(e=i),++t;if(e&&t>0)return n.instance.sdkConfig;var e,t=0;for(var i in n.instance.sdkConfigCached)0===t&&(e=i),++t;return e&&t>0?n.instance.sdkConfigCached:n.instance.sdkConfigDefault},n.isEnabled=function(){var e=n.getSdkConfig()
;return(!e.enabled||"false"!=e.enabled)&&!!n.instance.initAuthorized},n.setCustomDimension01=function(e){n.instance.currentCustomDimension01=e,s.setItem(n.Dimension01Key,e),r.i("Set custom01 dimension value: "+e)},n.setCustomDimension02=function(e){n.instance.currentCustomDimension02=e,s.setItem(n.Dimension02Key,e),r.i("Set custom02 dimension value: "+e)},n.setCustomDimension03=function(e){n.instance.currentCustomDimension03=e,s.setItem(n.Dimension03Key,e),r.i("Set custom03 dimension value: "+e)},n.setFacebookId=function(e){n.instance.facebookId=e,s.setItem(n.FacebookIdKey,e),r.i("Set facebook id: "+e)},n.setGender=function(t){n.instance.gender=isNaN(Number(e.EGAGender[t]))?e.EGAGender[t].toString().toLowerCase():e.EGAGender[e.EGAGender[t]].toString().toLowerCase(),s.setItem(n.GenderKey,n.instance.gender),r.i("Set gender: "+n.instance.gender)},n.setBirthYear=function(e){n.instance.birthYear=e,s.setItem(n.BirthYearKey,e.toString()),r.i("Set birth year: "+e)},n.incrementSessionNum=function(){var e=n.getSessionNum()+1;n.instance.sessionNum=e},n.incrementTransactionNum=function(){var e=n.getTransactionNum()+1;n.instance.transactionNum=e},n.incrementProgressionTries=function(e){var t=n.getProgressionTries(e)+1;n.instance.progressionTries[e]=t;var i={};i.progression=e,i.tries=t,s.insert(a.Progression,i,!0,"progression")},n.getProgressionTries=function(e){return e in n.instance.progressionTries?n.instance.progressionTries[e]:0},n.clearProgressionTries=function(e){e in n.instance.progressionTries&&delete n.instance.progressionTries[e];var t=[];t.push(["progression",u.Equal,e]),s.delete(a.Progression,t)},n.setKeys=function(e,t){n.instance.gameKey=e,n.instance.gameSecret=t},n.setManualSessionHandling=function(e){n.instance.useManualSessionHandling=e,r.i("Use manual session handling: "+e)},n.getEventAnnotations=function(){var e={};e.v=2,e.user_id=n.instance.identifier,e.client_ts=n.getClientTsAdjusted(),e.sdk_version=o.getRelevantSdkVersion(),e.os_version=o.osVersion,e.manufacturer=o.deviceManufacturer,e.device=o.deviceModel,e.browser_version=o.browserVersion,e.platform=o.buildPlatform,e.session_id=n.instance.sessionId,e[n.SessionNumKey]=n.instance.sessionNum;var i=o.getConnectionType();return t.validateConnectionType(i)&&(e.connection_type=i),o.gameEngineVersion&&(e.engine_version=o.gameEngineVersion),n.instance.build&&(e.build=n.instance.build),n.instance.facebookId&&(e[n.FacebookIdKey]=n.instance.facebookId),n.instance.gender&&(e[n.GenderKey]=n.instance.gender),0!=n.instance.birthYear&&(e[n.BirthYearKey]=n.instance.birthYear),e},n.getSdkErrorEventAnnotations=function(){var e={};e.v=2,e.category=n.CategorySdkError,e.sdk_version=o.getRelevantSdkVersion(),e.os_version=o.osVersion,e.manufacturer=o.deviceManufacturer,e.device=o.deviceModel,e.platform=o.buildPlatform;var i=o.getConnectionType();return t.validateConnectionType(i)&&(e.connection_type=i),o.gameEngineVersion&&(e.engine_version=o.gameEngineVersion),e},n.getInitAnnotations=function(){var e={};return e.sdk_version=o.getRelevantSdkVersion(),e.os_version=o.osVersion,e.platform=o.buildPlatform,e},n.getClientTsAdjusted=function(){var e=i.timeIntervalSince1970(),r=e+n.instance.clientServerTimeOffset;return t.validateClientTs(r)?r:e},n.sessionIsStarted=function(){return 0!=n.instance.sessionStart},n.cacheIdentifier=function(){n.instance.userId?n.instance.identifier=n.instance.userId:n.instance.defaultUserId&&(n.instance.identifier=n.instance.defaultUserId)},n.ensurePersistedStates=function(){s.isStorageAvailable()&&s.load();var e=n.instance;e.setDefaultId(null!=s.getItem(n.DefaultUserIdKey)?s.getItem(n.DefaultUserIdKey):i.createGuid()),e.sessionNum=null!=s.getItem(n.SessionNumKey)?Number(s.getItem(n.SessionNumKey)):0,e.transactionNum=null!=s.getItem(n.TransactionNumKey)?Number(s.getItem(n.TransactionNumKey)):0,e.facebookId?s.setItem(n.FacebookIdKey,e.facebookId):(e.facebookId=null!=s.getItem(n.FacebookIdKey)?s.getItem(n.FacebookIdKey):"",e.facebookId),e.gender?s.setItem(n.GenderKey,e.gender):(e.gender=null!=s.getItem(n.GenderKey)?s.getItem(n.GenderKey):"",e.gender),e.birthYear&&0!=e.birthYear?s.setItem(n.BirthYearKey,e.birthYear.toString()):(e.birthYear=null!=s.getItem(n.BirthYearKey)?Number(s.getItem(n.BirthYearKey)):0,e.birthYear),e.currentCustomDimension01?s.setItem(n.Dimension01Key,e.currentCustomDimension01):(e.currentCustomDimension01=null!=s.getItem(n.Dimension01Key)?s.getItem(n.Dimension01Key):"",e.currentCustomDimension01),e.currentCustomDimension02?s.setItem(n.Dimension02Key,e.currentCustomDimension02):(e.currentCustomDimension02=null!=s.getItem(n.Dimension02Key)?s.getItem(n.Dimension02Key):"",e.currentCustomDimension02),e.currentCustomDimension03?s.setItem(n.Dimension03Key,e.currentCustomDimension03):(e.currentCustomDimension03=null!=s.getItem(n.Dimension03Key)?s.getItem(n.Dimension03Key):"",e.currentCustomDimension03);var t=null!=s.getItem(n.SdkConfigCachedKey)?s.getItem(n.SdkConfigCachedKey):"";if(t){var r=JSON.parse(i.decode64(t));r&&(e.sdkConfigCached=r)}var o=s.select(a.Progression);if(o)for(var u=0;u<o.length;++u){var c=o[u];c&&(e.progressionTries[c.progression]=c.tries)}},n.calculateServerTimeOffset=function(e){return e-i.timeIntervalSince1970()},n.validateAndFixCurrentDimensions=function(){t.validateDimension01(n.getCurrentCustomDimension01(),n.getAvailableCustomDimensions01())||n.setCustomDimension01(""),t.validateDimension02(n.getCurrentCustomDimension02(),n.getAvailableCustomDimensions02())||n.setCustomDimension02(""),t.validateDimension03(n.getCurrentCustomDimension03(),n.getAvailableCustomDimensions03())||n.setCustomDimension03("")},n}();c.CategorySdkError="sdk_error",c.instance=new c,c.DefaultUserIdKey="default_user_id",c.SessionNumKey="session_num",c.TransactionNumKey="transaction_num",c.FacebookIdKey="facebook_id",c.GenderKey="gender",c.BirthYearKey="birth_year",c.Dimension01Key="dimension01",c.Dimension02Key="dimension02",c.Dimension03Key="dimension03",c.SdkConfigCachedKey="sdk_config_cached",n.GAState=c}(e.state||(e.state={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.utilities.GAUtilities,i=e.logging.GALogger,r=function(){function e(){}return e.execute=function(n,r,s,o){if(e.countMap[r]||(e.countMap[r]=0),!(e.countMap[r]>=e.MaxCount)){var a=t.getHmac(o,s),u=new XMLHttpRequest;u.onreadystatechange=function(){if(4===u.readyState){if(!u.responseText)return;if(200!=u.status)return void i.w("sdk error failed. response code not 200. status code: "+u.status+", description: "+u.statusText+", body: "+u.responseText);e.countMap[r]=e.countMap[r]+1}},u.open("POST",n,!0),u.setRequestHeader("Content-Type","application/json"),u.setRequestHeader("Authorization",a);try{u.send(s)}catch(e){console.error(e)}}},e}();r.MaxCount=10,r.countMap={},n.SdkErrorTask=r}(e.tasks||(e.tasks={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.state.GAState,i=e.logging.GALogger,r=e.utilities.GAUtilities,s=e.validators.GAValidator,o=e.tasks.SdkErrorTask,a=function(){function e(){this.protocol="https",this.hostName="api.gameanalytics.com",this.version="v2",this.baseUrl=this.protocol+"://"+this.hostName+"/"+this.version,this.initializeUrlPath="init",this.eventsUrlPath="events",this.useGzip=!1}return e.prototype.requestInit=function(i){var r=t.getGameKey(),s=this.baseUrl+"/"+r+"/"+this.initializeUrlPath,o=t.getInitAnnotations(),a=JSON.stringify(o);if(!a)return void i(n.EGAHTTPApiResponse.JsonEncodeFailed,null);var u=this.createPayloadData(a,this.useGzip),c=[];c.push(a),e.sendRequest(s,u,c,this.useGzip,e.initRequestCallback,i)},e.prototype.sendEventsInArray=function(i,r,s){if(0!=i.length){var o=t.getGameKey(),a=this.baseUrl+"/"+o+"/"+this.eventsUrlPath,u=JSON.stringify(i);if(!u)return void s(n.EGAHTTPApiResponse.JsonEncodeFailed,null,r,i.length);var c=this.createPayloadData(u,this.useGzip),d=[];d.push(u),d.push(r),d.push(i.length.toString()),e.sendRequest(a,c,d,this.useGzip,e.sendEventInArrayRequestCallback,s)}},e.prototype.sendSdkErrorEvent=function(n){var r=t.getGameKey(),a=t.getGameSecret();if(s.validateSdkErrorEvent(r,a,n)){var u=this.baseUrl+"/"+r+"/"+this.eventsUrlPath,c="",d=t.getSdkErrorEventAnnotations(),l=e.sdkErrorTypeToString(n);d.type=l;var f=[];if(f.push(d),!(c=JSON.stringify(f)))return void i.w("sendSdkErrorEvent: JSON encoding failed.");o.execute(u,n,c,a)}},e.sendEventInArrayRequestCallback=function(t,i,r,s){void 0===s&&(s=null);var o=(s[0],s[1],s[2]),a=parseInt(s[3]),u="",c=0;u=t.responseText,c=t.status;var d=e.instance.processRequestResponse(c,t.statusText,u,"Events");if(d!=n.EGAHTTPApiResponse.Ok&&d!=n.EGAHTTPApiResponse.BadRequest)return void r(d,null,o,a);var l=u?JSON.parse(u):{};if(null==l)return void r(n.EGAHTTPApiResponse.JsonDecodeFailed,null,o,a);n.EGAHTTPApiResponse.BadRequest,r(d,l,o,a)},e.sendRequest=function(e,n,i,s,o,a){var u=new XMLHttpRequest,c=t.getGameSecret(),d=r.getHmac(c,n),l=[];l.push(d);for(var f in i)l.push(i[f]);if(u.onreadystatechange=function(){4===u.readyState&&o(u,e,a,l)},u.open("POST",e,!0),u.setRequestHeader("Content-Type","text/plain"),u.setRequestHeader("Authorization",d),s)throw new Error("gzip not supported");try{u.send(n)}catch(e){console.error(e.stack)}},e.initRequestCallback=function(t,i,r,o){void 0===o&&(o=null);var a=(o[0],o[1],""),u=0;a=t.responseText,u=t.status;var c=a?JSON.parse(a):{},d=e.instance.processRequestResponse(u,t.statusText,a,"Init");if(d!=n.EGAHTTPApiResponse.Ok&&d!=n.EGAHTTPApiResponse.BadRequest)return void r(d,null);if(null==c)return void r(n.EGAHTTPApiResponse.JsonDecodeFailed,null);if(d===n.EGAHTTPApiResponse.BadRequest)return void r(d,null);var l=s.validateAndCleanInitRequestResponse(c);if(!l)return void r(n.EGAHTTPApiResponse.BadResponse,null);r(n.EGAHTTPApiResponse.Ok,l)},e.prototype.createPayloadData=function(e,n){if(n)throw new Error("gzip not supported");return e},e.prototype.processRequestResponse=function(e,t,i,r){return i?200===e?n.EGAHTTPApiResponse.Ok:0===e||401===e?n.EGAHTTPApiResponse.Unauthorized:400===e?n.EGAHTTPApiResponse.BadRequest:500===e?n.EGAHTTPApiResponse.InternalServerError:n.EGAHTTPApiResponse.UnknownResponseCode:n.EGAHTTPApiResponse.NoResponse},e.sdkErrorTypeToString=function(e){switch(e){case n.EGASdkErrorType.Rejected:return"rejected";default:return""}},e}();a.instance=new a,n.GAHTTPApi=a}(e.http||(e.http={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.store.GAStore,i=e.store.EGAStore,r=e.store.EGAStoreArgsOperator,s=e.state.GAState,o=e.logging.GALogger,a=e.utilities.GAUtilities,u=e.http.EGAHTTPApiResponse,c=e.http.GAHTTPApi,d=e.validators.GAValidator,l=e.http.EGASdkErrorType,f=function(){function n(){}return n.addSessionStartEvent=function(){var e={};e.category=n.CategorySessionStart,s.incrementSessionNum(),t.setItem(s.SessionNumKey,s.getSessionNum().toString()),n.addDimensionsToEvent(e),n.addEventToStore(e),o.i("Add SESSION START event"),n.processEvents(n.CategorySessionStart,!1)},n.addSessionEndEvent=function(){var e=s.getSessionStart(),t=s.getClientTsAdjusted(),i=t-e;i<0&&(o.w("Session length was calculated to be less then 0. Should not be possible. Resetting to 0."),i=0);var r={};r.category=n.CategorySessionEnd,r.length=i,n.addDimensionsToEvent(r),n.addEventToStore(r),o.i("Add SESSION END event."),n.processEvents("",!1)},n.addBusinessEvent=function(e,i,r,a,u){if(void 0===u&&(u=null),!d.validateBusinessEvent(e,i,u,r,a))return void c.instance.sendSdkErrorEvent(l.Rejected);var f={};s.incrementTransactionNum(),t.setItem(s.TransactionNumKey,s.getTransactionNum().toString()),f.event_id=r+":"+a,f.category=n.CategoryBusiness,f.currency=e,f.amount=i,f[s.TransactionNumKey]=s.getTransactionNum(),u&&(f.cart_type=u),n.addDimensionsToEvent(f),o.i("Add BUSINESS event: {currency:"+e+", amount:"+i+", itemType:"+r+", itemId:"+a+", cartType:"+u+"}"),n.addEventToStore(f)},n.addResourceEvent=function(t,i,r,a,u){if(!d.validateResourceEvent(t,i,r,a,u,s.getAvailableResourceCurrencies(),s.getAvailableResourceItemTypes()))return void c.instance.sendSdkErrorEvent(l.Rejected);t===e.EGAResourceFlowType.Sink&&(r*=-1);var f={},v=n.resourceFlowTypeToString(t);f.event_id=v+":"+i+":"+a+":"+u,f.category=n.CategoryResource,f.amount=r,n.addDimensionsToEvent(f),o.i("Add RESOURCE event: {currency:"+i+", amount:"+r+", itemType:"+a+", itemId:"+u+"}"),n.addEventToStore(f)},n.addProgressionEvent=function(t,i,r,a,u,f){var v=n.progressionStatusToString(t);if(!d.validateProgressionEvent(t,i,r,a))return void c.instance.sendSdkErrorEvent(l.Rejected);var g,m={};g=r?a?i+":"+r+":"+a:i+":"+r:i,m.category=n.CategoryProgression,m.event_id=v+":"+g;var p=0;f&&t!=e.EGAProgressionStatus.Start&&(m.score=u),t===e.EGAProgressionStatus.Fail&&s.incrementProgressionTries(g),t===e.EGAProgressionStatus.Complete&&(s.incrementProgressionTries(g),p=s.getProgressionTries(g),m.attempt_num=p,s.clearProgressionTries(g)),n.addDimensionsToEvent(m),o.i("Add PROGRESSION event: {status:"+v+", progression01:"+i+", progression02:"+r+", progression03:"+a+", score:"+u+", attempt:"+p+"}"),n.addEventToStore(m)},n.addDesignEvent=function(e,t,i){if(!d.validateDesignEvent(e,t))return void c.instance.sendSdkErrorEvent(l.Rejected);var r={};r.category=n.CategoryDesign,r.event_id=e,i&&(r.value=t),o.i("Add DESIGN event: {eventId:"+e+", value:"+t+"}"),n.addEventToStore(r)},n.addErrorEvent=function(e,t){var i=n.errorSeverityToString(e);if(!d.validateErrorEvent(e,t))return void c.instance.sendSdkErrorEvent(l.Rejected);var r={};r.category=n.CategoryError,r.severity=i,r.message=t,o.i("Add ERROR event: {severity:"+i+", message:"+t+"}"),n.addEventToStore(r)},n.processEvents=function(e,s){try{var u=a.createGuid();s&&(n.cleanupEvents(),n.fixMissingSessionEndEvents());var d=[];d.push(["status",r.Equal,"new"]);var l=[];l.push(["status",r.Equal,"new"]),e&&(d.push(["category",r.Equal,e]),l.push(["category",r.Equal,e]));var f=[];f.push(["status",u]);var v=t.select(i.Events,d);if(!v||0==v.length)return void o.i("Event queue: No events to send");if(v.length>n.MaxEventCount){if(!(v=t.select(i.Events,d,!0,n.MaxEventCount)))return;var g=v[v.length-1],m=g.client_ts;if(d.push(["client_ts",r.LessOrEqual,m]),!(v=t.select(i.Events,d)))return;l.push(["client_ts",r.LessOrEqual,m])}if(o.i("Event queue: Sending "+v.length+" events."),!t.update(i.Events,f,l))return;for(var p=[],h=0;h<v.length;++h){var y=v[h],S=JSON.parse(a.decode64(y.event));0!=S.length&&p.push(S)}c.instance.sendEventsInArray(p,u,n.processEventsCallback)}catch(e){o.e("Error during ProcessEvents(): "+e.stack)}},n.processEventsCallback=function(e,s,a,c){var d=[];if(d.push(["status",r.Equal,a]),e===u.Ok)t.delete(i.Events,d),o.i("Event queue: "+c+" events sent.");else if(e===u.NoResponse){var l=[];l.push(["status","new"]),o.w("Event queue: Failed to send events to collector - Retrying next time"),t.update(i.Events,l,d)}else{if(s){var f,v=0;for(var g in s)0==v&&(f=s[g]),++v;e===u.BadRequest&&f.constructor===Array?o.w("Event queue: "+c+" events sent. "+v+" events failed GA server validation."):o.w("Event queue: Failed to send events.")}else o.w("Event queue: Failed to send events.");t.delete(i.Events,d)}n.updateSessionStore()},n.cleanupEvents=function(){t.update(i.Events,[["status","new"]])},n.fixMissingSessionEndEvents=function(){var e=[];e.push(["session_id",r.NotEqual,s.getSessionId()]);var u=t.select(i.Sessions,e);if(u&&0!=u.length){o.i(u.length+" session(s) located with missing session_end event.");for(var c=0;c<u.length;++c){var d=JSON.parse(a.decode64(u[c].event)),l=d.client_ts,f=u[c].timestamp,v=l-f;v=Math.max(0,v),d.category=n.CategorySessionEnd,d.length=v,n.addEventToStore(d)}}},n.addEventToStore=function(e){if(!s.isInitialized())return void o.w("Could not add event: SDK is not initialized");try{if(t.isStoreTooLargeForEvents()&&!a.stringMatch(e.category,/^(user|session_end|business)$/))return void o.w("Database too large. Event has been blocked.");var u=s.getEventAnnotations(),c=a.encode64(JSON.stringify(u));for(var d in e)u[d]=e[d];var l=JSON.stringify(u);o.ii("Event added to queue: "+l);var f={};f.status="new",f.category=u.category,f.session_id=u.session_id,f.client_ts=u.client_ts,f.event=a.encode64(JSON.stringify(u)),t.insert(i.Events,f),e.category==n.CategorySessionEnd?t.delete(i.Sessions,[["session_id",r.Equal,u.session_id]]):(f={},f.session_id=u.session_id,f.timestamp=s.getSessionStart(),f.event=c,t.insert(i.Sessions,f,!0,"session_id")),t.isStorageAvailable()&&t.save()}catch(d){o.e("addEventToStore: error"),o.e(d.stack)}},n.updateSessionStore=function(){if(s.sessionIsStarted()){var e={};e.session_id=s.instance.sessionId,e.timestamp=s.getSessionStart(),e.event=a.encode64(JSON.stringify(s.getEventAnnotations())),t.insert(i.Sessions,e,!0,"session_id"),t.isStorageAvailable()&&t.save()}},n.addDimensionsToEvent=function(e){e&&(s.getCurrentCustomDimension01()&&(e.custom_01=s.getCurrentCustomDimension01()),s.getCurrentCustomDimension02()&&(e.custom_02=s.getCurrentCustomDimension02()),s.getCurrentCustomDimension03()&&(e.custom_03=s.getCurrentCustomDimension03()))},n.resourceFlowTypeToString=function(n){return n==e.EGAResourceFlowType.Source||n==e.EGAResourceFlowType[e.EGAResourceFlowType.Source]?"Source":n==e.EGAResourceFlowType.Sink||n==e.EGAResourceFlowType[e.EGAResourceFlowType.Sink]?"Sink":""},n.progressionStatusToString=function(n){return n==e.EGAProgressionStatus.Start||n==e.EGAProgressionStatus[e.EGAProgressionStatus.Start]?"Start":n==e.EGAProgressionStatus.Complete||n==e.EGAProgressionStatus[e.EGAProgressionStatus.Complete]?"Complete":n==e.EGAProgressionStatus.Fail||n==e.EGAProgressionStatus[e.EGAProgressionStatus.Fail]?"Fail":""},n.errorSeverityToString=function(n){return n==e.EGAErrorSeverity.Debug||n==e.EGAErrorSeverity[e.EGAErrorSeverity.Debug]?"debug":n==e.EGAErrorSeverity.Info||n==e.EGAErrorSeverity[e.EGAErrorSeverity.Info]?"info":n==e.EGAErrorSeverity.Warning||n==e.EGAErrorSeverity[e.EGAErrorSeverity.Warning]?"warning":n==e.EGAErrorSeverity.Error||n==e.EGAErrorSeverity[e.EGAErrorSeverity.Error]?"error":n==e.EGAErrorSeverity.Critical||n==e.EGAErrorSeverity[e.EGAErrorSeverity.Critical]?"critical":""},n}();f.instance=new f,f.CategorySessionStart="user",f.CategorySessionEnd="session_end",f.CategoryDesign="design",f.CategoryBusiness="business",f.CategoryProgression="progression",f.CategoryResource="resource",f.CategoryError="error",f.MaxEventCount=500,n.GAEvents=f}(e.events||(e.events={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){!function(n){var t=e.logging.GALogger,i=e.state.GAState,r=e.events.GAEvents,s=function(){function e(){this.blocks=new n.PriorityQueue({compare:function(e,n){return e-n}}),this.id2TimedBlockMap={},e.startThread()}return e.createTimedBlock=function(e){void 0===e&&(e=0);var t=new Date;return t.setSeconds(t.getSeconds()+e),new n.TimedBlock(t)},e.performTaskOnGAThread=function(t,i){void 0===i&&(i=0);var r=new Date;r.setSeconds(r.getSeconds()+i);var s=new n.TimedBlock(r);s.block=t,e.instance.id2TimedBlockMap[s.id]=s,e.instance.addTimedBlock(s)},e.performTimedBlockOnGAThread=function(n){e.instance.id2TimedBlockMap[n.id]=n,e.instance.addTimedBlock(n)},e.scheduleTimer=function(t,i){var r=new Date;r.setSeconds(r.getSeconds()+t);var s=new n.TimedBlock(r);return s.block=i,e.instance.id2TimedBlockMap[s.id]=s,e.instance.addTimedBlock(s),s.id},e.getTimedBlockById=function(n){return n in e.instance.id2TimedBlockMap?e.instance.id2TimedBlockMap[n]:null},e.ensureEventQueueIsRunning=function(){e.instance.keepRunning=!0,e.instance.isRunning||(e.instance.isRunning=!0,e.scheduleTimer(e.ProcessEventsIntervalInSeconds,e.processEventQueue))},e.endSessionAndStopQueue=function(){i.isInitialized()&&(t.i("Ending session."),e.stopEventQueue(),i.isEnabled()&&i.sessionIsStarted()&&(r.addSessionEndEvent(),i.instance.sessionStart=0))},e.stopEventQueue=function(){e.instance.keepRunning=!1},e.ignoreTimer=function(n){n in e.instance.id2TimedBlockMap&&(e.instance.id2TimedBlockMap[n].ignore=!0)},e.setEventProcessInterval=function(n){n>0&&(e.ProcessEventsIntervalInSeconds=n)},e.prototype.addTimedBlock=function(e){this.blocks.enqueue(e.deadline.getTime(),e)},e.run=function(){clearTimeout(e.runTimeoutId);try{for(var n;n=e.getNextBlock();)if(!n.ignore)if(n.async){if(!n.running){n.running=!0,n.block();break}}else n.block();return void(e.runTimeoutId=setTimeout(e.run,e.ThreadWaitTimeInMs))}catch(e){t.e("Error on GA thread"),t.e(e.stack)}},e.startThread=function(){e.runTimeoutId=setTimeout(e.run,0)},e.getNextBlock=function(){var n=new Date;return e.instance.blocks.hasItems()&&e.instance.blocks.peek().deadline.getTime()<=n.getTime()?e.instance.blocks.peek().async&&e.instance.blocks.peek().running?e.instance.blocks.peek():e.instance.blocks.dequeue():null},e.processEventQueue=function(){r.processEvents("",!0),e.instance.keepRunning?e.scheduleTimer(e.ProcessEventsIntervalInSeconds,e.processEventQueue):e.instance.isRunning=!1},e}();s.instance=new s,s.ThreadWaitTimeInMs=1e3,s.ProcessEventsIntervalInSeconds=8,n.GAThreading=s}(e.threading||(e.threading={}))}(gameanalytics||(gameanalytics={}));var gameanalytics;!function(e){var n=e.threading.GAThreading,t=e.logging.GALogger,i=e.store.GAStore,r=e.state.GAState,s=e.http.GAHTTPApi,o=e.device.GADevice,a=e.validators.GAValidator,u=e.http.EGAHTTPApiResponse,c=e.utilities.GAUtilities,d=e.events.GAEvents,l=function(){function l(){}return l.init=function(){if(o.touch(),l.methodMap.configureAvailableCustomDimensions01=l.configureAvailableCustomDimensions01,l.methodMap.configureAvailableCustomDimensions02=l.configureAvailableCustomDimensions02,l.methodMap.configureAvailableCustomDimensions03=l.configureAvailableCustomDimensions03,l.methodMap.configureAvailableResourceCurrencies=l.configureAvailableResourceCurrencies,l.methodMap.configureAvailableResourceItemTypes=l.configureAvailableResourceItemTypes,l.methodMap.configureBuild=l.configureBuild,l.methodMap.configureSdkGameEngineVersion=l.configureSdkGameEngineVersion,l.methodMap.configureGameEngineVersion=l.configureGameEngineVersion,l.methodMap.configureUserId=l.configureUserId,l.methodMap.initialize=l.initialize,l.methodMap.addBusinessEvent=l.addBusinessEvent,l.methodMap.addResourceEvent=l.addResourceEvent,l.methodMap.addProgressionEvent=l.addProgressionEvent,l.methodMap.addDesignEvent=l.addDesignEvent,l.methodMap.addErrorEvent=l.addErrorEvent,l.methodMap.addErrorEvent=l.addErrorEvent,l.methodMap.setEnabledInfoLog=l.setEnabledInfoLog,l.methodMap.setEnabledVerboseLog=l.setEnabledVerboseLog,l.methodMap.setEnabledManualSessionHandling=l.setEnabledManualSessionHandling,l.methodMap.setCustomDimension01=l.setCustomDimension01,l.methodMap.setCustomDimension02=l.setCustomDimension02,l.methodMap.setCustomDimension03=l.setCustomDimension03,l.methodMap.setFacebookId=l.setFacebookId,l.methodMap.setGender=l.setGender,l.methodMap.setBirthYear=l.setBirthYear,l.methodMap.setEventProcessInterval=l.setEventProcessInterval,l.methodMap.startSession=l.startSession,l.methodMap.endSession=l.endSession,l.methodMap.onStop=l.onStop,l.methodMap.onResume=l.onResume,"undefined"!=typeof window&&void 0!==window.GameAnalytics&&void 0!==window.GameAnalytics.q){var e=window.GameAnalytics.q;for(var n in e)l.gaCommand.apply(null,e[n])}},l.gaCommand=function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];n.length>0&&n[0]in e.GameAnalytics.methodMap&&(n.length>1?e.GameAnalytics.methodMap[n[0]].apply(null,Array.prototype.slice.call(n,1)):e.GameAnalytics.methodMap[n[0]]())},l.configureAvailableCustomDimensions01=function(e){void 0===e&&(e=[]),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!1))return void t.w("Available custom dimensions must be set before SDK is initialized");r.setAvailableCustomDimensions01(e)})},l.configureAvailableCustomDimensions02=function(e){void 0===e&&(e=[]),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!1))return void t.w("Available custom dimensions must be set before SDK is initialized");r.setAvailableCustomDimensions02(e)})},l.configureAvailableCustomDimensions03=function(e){void 0===e&&(e=[]),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!1))return void t.w("Available custom dimensions must be set before SDK is initialized");r.setAvailableCustomDimensions03(e)})},l.configureAvailableResourceCurrencies=function(e){void 0===e&&(e=[]),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!1))return void t.w("Available resource currencies must be set before SDK is initialized");r.setAvailableResourceCurrencies(e)})},l.configureAvailableResourceItemTypes=function(e){void 0===e&&(e=[]),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!1))return void t.w("Available resource item types must be set before SDK is initialized");r.setAvailableResourceItemTypes(e)})},l.configureBuild=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){return l.isSdkReady(!0,!1)?void t.w("Build version must be set before SDK is initialized."):a.validateBuild(e)?void r.setBuild(e):void t.i("Validation fail - configure build: Cannot be null, empty or above 32 length. String: "+e)})},l.configureSdkGameEngineVersion=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){if(!l.isSdkReady(!0,!1))return a.validateSdkWrapperVersion(e)?void(o.sdkGameEngineVersion=e):void t.i("Validation fail - configure sdk version: Sdk version not supported. String: "+e)})},l.configureGameEngineVersion=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){if(!l.isSdkReady(!0,!1))return a.validateEngineVersion(e)?void(o.gameEngineVersion=e):void t.i("Validation fail - configure game engine version: Game engine version not supported. String: "+e)})},l.configureUserId=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){return l.isSdkReady(!0,!1)?void t.w("A custom user id must be set before SDK is initialized."):a.validateUserId(e)?void r.setUserId(e):void t.i("Validation fail - configure user_id: Cannot be null, empty or above 64 length. Will use default user_id method. Used string: "+e)})},l.initialize=function(e,i){void 0===e&&(e=""),void 0===i&&(i=""),o.updateConnectionType();var s=n.createTimedBlock();s.async=!0,l.initTimedBlockId=s.id,s.block=function(){return l.isSdkReady(!0,!1)?void t.w("SDK already initialized. Can only be called once."):a.validateKeys(e,i)?(r.setKeys(e,i),void l.internalInitialize()):void t.w("SDK failed initialize. Game key or secret key is invalid. Can only contain characters A-z 0-9, gameKey is 32 length, gameSecret is 40 length. Failed keys - gameKey: "+e+", secretKey: "+i)},n.performTimedBlockOnGAThread(s)},l.addBusinessEvent=function(e,t,i,r,s){void 0===e&&(e=""),void 0===t&&(t=0),void 0===i&&(i=""),void 0===r&&(r=""),void 0===s&&(s=""),o.updateConnectionType(),n.performTaskOnGAThread(function(){l.isSdkReady(!0,!0,"Could not add business event")&&d.addBusinessEvent(e,t,i,r,s)})},l.addResourceEvent=function(t,i,r,s,a){void 0===t&&(t=e.EGAResourceFlowType.Undefined),void 0===i&&(i=""),void 0===r&&(r=0),void 0===s&&(s=""),void 0===a&&(a=""),o.updateConnectionType(),n.performTaskOnGAThread(function(){l.isSdkReady(!0,!0,"Could not add resource event")&&d.addResourceEvent(t,i,r,s,a)})},l.addProgressionEvent=function(t,i,r,s,a){void 0===t&&(t=e.EGAProgressionStatus.Undefined),void 0===i&&(i=""),void 0===r&&(r=""),void 0===s&&(s=""),o.updateConnectionType(),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!0,"Could not add progression event")){var e=void 0!==a;d.addProgressionEvent(t,i,r,s,e?a:0,e)}})},l.addDesignEvent=function(e,t){o.updateConnectionType(),n.performTaskOnGAThread(function(){if(l.isSdkReady(!0,!0,"Could not add design event")){var n=void 0!==t;d.addDesignEvent(e,n?t:0,n)}})},l.addErrorEvent=function(t,i){void 0===t&&(t=e.EGAErrorSeverity.Undefined),void 0===i&&(i=""),o.updateConnectionType(),n.performTaskOnGAThread(function(){l.isSdkReady(!0,!0,"Could not add error event")&&d.addErrorEvent(t,i)})},l.setEnabledInfoLog=function(e){void 0===e&&(e=!1),n.performTaskOnGAThread(function(){e?(t.setInfoLog(e),t.i("Info logging enabled")):(t.i("Info logging disabled"),t.setInfoLog(e))})},l.setEnabledVerboseLog=function(e){void 0===e&&(e=!1),n.performTaskOnGAThread(function(){e?(t.setVerboseLog(e),t.i("Verbose logging enabled")):(t.i("Verbose logging disabled"),t.setVerboseLog(e))})},l.setEnabledManualSessionHandling=function(e){void 0===e&&(e=!1),n.performTaskOnGAThread(function(){r.setManualSessionHandling(e)})},l.setCustomDimension01=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){if(!a.validateDimension01(e,r.getAvailableCustomDimensions01()))return void t.w("Could not set custom01 dimension value to '"+e+"'. Value not found in available custom01 dimension values");r.setCustomDimension01(e)})},l.setCustomDimension02=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){if(!a.validateDimension02(e,r.getAvailableCustomDimensions02()))return void t.w("Could not set custom02 dimension value to '"+e+"'. Value not found in available custom02 dimension values");r.setCustomDimension02(e)})},l.setCustomDimension03=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){if(!a.validateDimension03(e,r.getAvailableCustomDimensions03()))return void t.w("Could not set custom03 dimension value to '"+e+"'. Value not found in available custom03 dimension values");r.setCustomDimension03(e)})},l.setFacebookId=function(e){void 0===e&&(e=""),n.performTaskOnGAThread(function(){a.validateFacebookId(e)&&r.setFacebookId(e)})},l.setGender=function(t){void 0===t&&(t=e.EGAGender.Undefined),n.performTaskOnGAThread(function(){a.validateGender(t)&&r.setGender(t)})},l.setBirthYear=function(e){void 0===e&&(e=0),n.performTaskOnGAThread(function(){a.validateBirthyear(e)&&r.setBirthYear(e)})},l.setEventProcessInterval=function(e){n.performTaskOnGAThread(function(){n.setEventProcessInterval(e)})},l.startSession=function(){if(r.getUseManualSessionHandling()){if(!r.isInitialized())return;var e=n.createTimedBlock();e.async=!0,l.initTimedBlockId=e.id,e.block=function(){r.isEnabled()&&r.sessionIsStarted()&&n.endSessionAndStopQueue(),l.resumeSessionAndStartQueue()},n.performTimedBlockOnGAThread(e)}},l.endSession=function(){r.getUseManualSessionHandling()&&l.onStop()},l.onStop=function(){n.performTaskOnGAThread(function(){try{n.endSessionAndStopQueue()}catch(e){}})},l.onResume=function(){var e=n.createTimedBlock();e.async=!0,l.initTimedBlockId=e.id,e.block=function(){l.resumeSessionAndStartQueue()},n.performTimedBlockOnGAThread(e)},l.internalInitialize=function(){r.ensurePersistedStates(),i.setItem(r.DefaultUserIdKey,r.getDefaultId()),r.setInitialized(!0),l.newSession(),r.isEnabled()&&n.ensureEventQueueIsRunning()},l.newSession=function(){t.i("Starting a new session."),r.validateAndFixCurrentDimensions(),s.instance.requestInit(l.startNewSessionCallback)},l.startNewSessionCallback=function(e,s){if(e===u.Ok&&s){var o=0;if(s.server_ts){var a=s.server_ts;o=r.calculateServerTimeOffset(a)}s.time_offset=o,i.setItem(r.SdkConfigCachedKey,c.encode64(JSON.stringify(s))),r.instance.sdkConfigCached=s,r.instance.sdkConfig=s,r.instance.initAuthorized=!0}else e==u.Unauthorized?(t.w("Initialize SDK failed - Unauthorized"),r.instance.initAuthorized=!1):(e===u.NoResponse||e===u.RequestTimeout?t.i("Init call (session start) failed - no response. Could be offline or timeout."):e===u.BadResponse||e===u.JsonEncodeFailed||e===u.JsonDecodeFailed?t.i("Init call (session start) failed - bad response. Could be bad response from proxy or GA servers."):e!==u.BadRequest&&e!==u.UnknownResponseCode||t.i("Init call (session start) failed - bad request or unknown response."),null==r.instance.sdkConfig?null!=r.instance.sdkConfigCached?(t.i("Init call (session start) failed - using cached init values."),r.instance.sdkConfig=r.instance.sdkConfigCached):(t.i("Init call (session start) failed - using default init values."),r.instance.sdkConfig=r.instance.sdkConfigDefault):t.i("Init call (session start) failed - using cached init values."),r.instance.initAuthorized=!0)
;if(r.instance.clientServerTimeOffset=r.instance.sdkConfig.time_offset?r.instance.sdkConfig.time_offset:0,!r.isEnabled())return t.w("Could not start session: SDK is disabled."),void n.stopEventQueue();n.ensureEventQueueIsRunning();var f=c.createGuid();r.instance.sessionId=f,r.instance.sessionStart=r.getClientTsAdjusted(),d.addSessionStartEvent(),n.getTimedBlockById(l.initTimedBlockId).running=!1,l.initTimedBlockId=-1},l.resumeSessionAndStartQueue=function(){r.isInitialized()&&(t.i("Resuming session."),r.sessionIsStarted()||l.newSession())},l.isSdkReady=function(e,n,i){return void 0===n&&(n=!0),void 0===i&&(i=""),i&&(i+=": "),e&&!r.isInitialized()?(n&&t.w(i+"SDK is not initialized"),!1):!(e&&!r.isEnabled())||(n&&t.w(i+"SDK is disabled"),!1)},l}();l.initTimedBlockId=-1,l.methodMap={},e.GameAnalytics=l}(gameanalytics||(gameanalytics={})),gameanalytics.GameAnalytics.init();var GameAnalytics=gameanalytics.GameAnalytics.gaCommand;
scope.gameanalytics=gameanalytics;
scope.GameAnalytics=GameAnalytics;
})(this);
/* global define, module, require */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['crypto-js', 'ws'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Export.
        module.exports = factory(require('crypto-js'), require('ws'));
    } else {
        // Browser globals (root is window)
        root.GameSparks = factory(root.Crypto, root.WebSocket || root.MozWebSocket);
    }
}(this, function(CryptoJS, WebSocket) {

    var GameSparks = function() {};

    GameSparks.prototype = {

        init: function(options) {
            this.options = options;
            this.socketUrl = options.url;

            this.pendingRequests = {};
            this.requestCounter = 0;

            this.connect();
        },

        initPreview: function(options) {
            options.url = 'wss://preview.gamesparks.net/ws/' + options.key;
            this.init(options);
        },

        initLive: function(options) {
            options.url = 'wss://service.gamesparks.net/ws/' + options.key;
            this.init(options);
        },

        reset: function() {
            this.initialised = false;
            this.connected = false;
            this.error = false;
            this.disconnected = false;

            if (this.webSocket != null){
                this.webSocket.onclose = null;
                this.webSocket.close();
            }
        },

        connect: function() {
            this.reset();

            try {
                this.webSocket = new WebSocket(this.socketUrl);
                this.webSocket.onopen = this.onWebSocketOpen.bind(this);
                this.webSocket.onclose = this.onWebSocketClose.bind(this);
                this.webSocket.onerror = this.onWebSocketError.bind(this);
                this.webSocket.onmessage = this.onWebSocketMessage.bind(this);
            } catch(e) {
                this.log(e.message);
            }
        },

        disconnect: function() {
            if (this.webSocket && this.connected) {
                this.disconnected = true;
                this.webSocket.close();
            }
        },

        onWebSocketOpen: function(ev) {
            this.log('WebSocket onOpen');

            if (this.options.onOpen) {
                this.options.onOpen(ev);
            }

            this.connected = true;
        },

        onWebSocketClose: function(ev) {
            this.log('WebSocket onClose');

            if (this.options.onClose) {
                this.options.onClose(ev);
            }

            this.connected = false;

            // Attemp a re-connection if not in error state or deliberately disconnected.
            if (!this.error && !this.disconnected) {
                this.connect();
            }
        },

        onWebSocketError: function(ev) {

            this.log('WebSocket onError: Sorry, but there is some problem with your socket or the server is down');

            if (this.options.onError) {
                this.options.onError(ev);
            }

            // Reset the socketUrl to the original.
            this.socketUrl = this.options.url;

            this.error = true;
        },

        onWebSocketMessage: function(message) {
            this.log('WebSocket onMessage: ' + message.data);

            var result;
            try {
                result = JSON.parse(message.data);
            } catch (e) {
                this.log('An error ocurred while parsing the JSON Data: ' + message + '; Error: ' + e);
                return;
            }

            if (this.options.onMessage) {
                this.options.onMessage(result);
            }

            // Extract any auth token.
            if (result['authToken']) {
                this.authToken = result['authToken'];
                delete result['authToken'];
            }

            if (result['connectUrl']) {
                // Any time a connectUrl is in the response we should update and reconnect.
                this.socketUrl = result['connectUrl'];
                this.connect();
            }

            var resultType = result['@class'];

            if (resultType === '.AuthenticatedConnectResponse') {
                this.handshake(result);
            } else if (resultType.match(/Response$/)){
                if (result['requestId']) {
                    var requestId = result['requestId'];
                    delete result['requestId'];

                    if (this.pendingRequests[requestId]) {
                        this.pendingRequests[requestId](result);
                        this.pendingRequests[requestId] = null;
                    }
                }
            }

        },

        handshake: function(result) {

            if (result['nonce']) {

                var hmac;

                if (this.options["onNonce"]) {
                    hmac = this.options.onNonce(result['nonce']);
                } else {
                    hmac = window.Crypto.enc.Base64.stringify(window.Crypto.HmacSHA256(result['nonce'], this.options.secret));
                }

                var toSend = {
                    '@class' : '.AuthenticatedConnectRequest',
                    hmac : hmac
                };

                if (this.authToken) {
                    toSend.authToken = this.authToken;
                }

                if (this.sessionId) {
                    toSend.sessionId = this.sessionId;
                }

                const browserData = this.getBrowserData();
                toSend.platform = browserData.browser;
                toSend.os = browserData.operatingSystem;

                this.webSocketSend(toSend);

            } else if (result['sessionId']) {
                this.sessionId = result['sessionId'];
                this.initialised = true;

                if (this.options.onInit) {
                    this.options.onInit();
                }

                this.keepAliveInterval = window.setInterval(this.keepAlive.bind(this), 30000);
            }
        },

        keepAlive: function() {
            if (this.initialised && this.connected) {
                this.webSocket.send(' ');
            }
        },

        send: function(requestType, onResponse){
            this.sendWithData(requestType, {}, onResponse);
        },

        sendWithData: function(requestType, json, onResponse) {
            if (!this.initialised) {
                onResponse({ error: 'NOT_INITIALISED' });
                return;
            }

            // Ensure requestType starts with a dot.
            if (requestType.indexOf('.') !== 0) {
                requestType = '.' + requestType;
            }

            json['@class'] = requestType;

            json.requestId = (new Date()).getTime() + "_" + (++this.requestCounter);

            if (onResponse != null) {
                this.pendingRequests[json.requestId] = onResponse;
                // Time out handler.
                setTimeout((function() {
                    if (this.pendingRequests[json.requestId]) {
                        this.pendingRequests[json.requestId]({ error: 'NO_RESPONSE' });
                    }
                }).bind(this), 32000);
            }

            this.webSocketSend(json);
        },

        webSocketSend: function(data) {

            if (this.options.onSend) {
                this.options.onSend(data);
            }

            var requestString = JSON.stringify(data);
            this.log('WebSocket send: ' + requestString);
            this.webSocket.send(requestString);
        },

        getSocketUrl: function() {
            return this.socketUrl;
        },

        getSessionId: function() {
            return this.sessionId;
        },

        getAuthToken: function() {
            return this.authToken;
        },

        setAuthToken: function(authToken) {
            this.authToken = authToken;
        },

        isConnected: function() {
            return this.connected;
        },

        log: function(message) {
            if (this.options.logger) {
                this.options.logger(message);
            }
        },

        getBrowserData: function() {

            var browsers = [
                {
                    string: navigator.userAgent,
                    subString: 'Chrome',
                    identity: 'Chrome'
                },
                {   string: navigator.userAgent,
                    subString: 'OmniWeb',
                    versionSearch: 'OmniWeb/',
                    identity: 'OmniWeb'
                },
                {
                    string: navigator.vendor,
                    subString: 'Apple',
                    identity: 'Safari',
                    versionSearch: 'Version'
                },
                {
                    prop: window.opera,
                    identity: 'Opera',
                    versionSearch: 'Version'
                },
                {
                    string: navigator.vendor,
                    subString: 'iCab',
                    identity: 'iCab'
                },
                {
                    string: navigator.vendor,
                    subString: 'KDE',
                    identity: 'Konqueror'
                },
                {
                    string: navigator.userAgent,
                    subString: 'Firefox',
                    identity: 'Firefox'
                },
                {
                    string: navigator.vendor,
                    subString: 'Camino',
                    identity: 'Camino'
                },
                {
                    string: navigator.userAgent,
                    subString: 'Netscape',
                    identity: 'Netscape'
                },
                {
                    string: navigator.userAgent,
                    subString: 'MSIE',
                    identity: 'Explorer',
                    versionSearch: 'MSIE'
                },
                {
                    string: navigator.userAgent,
                    subString: 'Gecko',
                    identity: 'Mozilla',
                    versionSearch: 'rv'
                },
                {
                    string: navigator.userAgent,
                    subString: 'Mozilla',
                    identity: 'Netscape',
                    versionSearch: 'Mozilla'
                }
            ];

            var operatingSystems = [
                {
                    string: navigator.platform,
                    subString: 'Win',
                    identity: 'Windows'
                },
                {
                    string: navigator.platform,
                    subString: 'Mac',
                    identity: 'Mac'
                },
                {
                    string: navigator.userAgent,
                    subString: 'iPhone',
                    identity: 'iPhone/iPod'
                },
                {
                    string: navigator.platform,
                    subString: 'Linux',
                    identity: 'Linux'
                }
            ];

            function searchForIdentity(data) {
                for (var i = 0; i < data.length; i++) {
                    var string = data[i].string;
                    var prop = data[i].prop;

                    if (string) {
                        // Look for the sub string in the string.
                        if (string.indexOf(data[i].subString) !== -1) {
                            return data[i].identity;
                        }
                    } else if (prop) {
                        return data[i].identity;
                    }
                }
            }

            return {
                browser: searchForIdentity(browsers),
                operatingSystem: searchForIdentity(operatingSystems)
            };
        }
    };

    return GameSparks;

}));

//var GameSparks = function() {};
GameSparks.prototype.acceptChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("AcceptChallengeRequest", request, onResponse);
}
GameSparks.prototype.accountDetailsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("AccountDetailsRequest", request, onResponse);
}
GameSparks.prototype.analyticsRequest = function(data, end, key, start, onResponse )
{
    var request = {};
    request["data"] = data;
    request["end"] = end;
    request["key"] = key;
    request["start"] = start;
    gamesparks.sendWithData("AnalyticsRequest", request, onResponse);
}
GameSparks.prototype.aroundMeLeaderboardRequest = function(count, friendIds, leaderboardShortCode, social, onResponse )
{
    var request = {};
    request["count"] = count;
    request["friendIds"] = friendIds;
    request["leaderboardShortCode"] = leaderboardShortCode;
    request["social"] = social;
    gamesparks.sendWithData("AroundMeLeaderboardRequest", request, onResponse);
}
GameSparks.prototype.authenticationRequest = function(password, userName, onResponse )
{
    var request = {};
    request["password"] = password;
    request["userName"] = userName;
    gamesparks.sendWithData("AuthenticationRequest", request, onResponse);
}
GameSparks.prototype.buyVirtualGoodsRequest = function(currencyType, quantity, shortCode, onResponse )
{
    var request = {};
    request["currencyType"] = currencyType;
    request["quantity"] = quantity;
    request["shortCode"] = shortCode;
    gamesparks.sendWithData("BuyVirtualGoodsRequest", request, onResponse);
}
GameSparks.prototype.changeUserDetailsRequest = function(displayName, onResponse )
{
    var request = {};
    request["displayName"] = displayName;
    gamesparks.sendWithData("ChangeUserDetailsRequest", request, onResponse);
}
GameSparks.prototype.chatOnChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("ChatOnChallengeRequest", request, onResponse);
}
GameSparks.prototype.consumeVirtualGoodRequest = function(quantity, shortCode, onResponse )
{
    var request = {};
    request["quantity"] = quantity;
    request["shortCode"] = shortCode;
    gamesparks.sendWithData("ConsumeVirtualGoodRequest", request, onResponse);
}
GameSparks.prototype.createChallengeRequest = function(accessType, challengeMessage, challengeShortCode, currency1Wager, currency2Wager, currency3Wager, currency4Wager, currency5Wager, currency6Wager, endTime, expiryTime, maxAttempts, maxPlayers, minPlayers, silent, startTime, usersToChallenge, onResponse )
{
    var request = {};
    request["accessType"] = accessType;
    request["challengeMessage"] = challengeMessage;
    request["challengeShortCode"] = challengeShortCode;
    request["currency1Wager"] = currency1Wager;
    request["currency2Wager"] = currency2Wager;
    request["currency3Wager"] = currency3Wager;
    request["currency4Wager"] = currency4Wager;
    request["currency5Wager"] = currency5Wager;
    request["currency6Wager"] = currency6Wager;
    request["endTime"] = endTime;
    request["expiryTime"] = expiryTime;
    request["maxAttempts"] = maxAttempts;
    request["maxPlayers"] = maxPlayers;
    request["minPlayers"] = minPlayers;
    request["silent"] = silent;
    request["startTime"] = startTime;
    request["usersToChallenge"] = usersToChallenge;
    gamesparks.sendWithData("CreateChallengeRequest", request, onResponse);
}
GameSparks.prototype.declineChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("DeclineChallengeRequest", request, onResponse);
}
GameSparks.prototype.deviceAuthenticationRequest = function(deviceId, deviceModel, deviceName, deviceOS, deviceType, operatingSystem, onResponse )
{
    var request = {};
    request["deviceId"] = deviceId;
    request["deviceModel"] = deviceModel;
    request["deviceName"] = deviceName;
    request["deviceOS"] = deviceOS;
    request["deviceType"] = deviceType;
    request["operatingSystem"] = operatingSystem;
    gamesparks.sendWithData("DeviceAuthenticationRequest", request, onResponse);
}
GameSparks.prototype.dismissMessageRequest = function(messageId, onResponse )
{
    var request = {};
    request["messageId"] = messageId;
    gamesparks.sendWithData("DismissMessageRequest", request, onResponse);
}
GameSparks.prototype.endSessionRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("EndSessionRequest", request, onResponse);
}
GameSparks.prototype.facebookConnectRequest = function(accessToken, code, onResponse )
{
    var request = {};
    request["accessToken"] = accessToken;
    request["code"] = code;
    gamesparks.sendWithData("FacebookConnectRequest", request, onResponse);
}
GameSparks.prototype.findChallengeRequest = function(accessType, count, offset, onResponse )
{
    var request = {};
    request["accessType"] = accessType;
    request["count"] = count;
    request["offset"] = offset;
    gamesparks.sendWithData("FindChallengeRequest", request, onResponse);
}
GameSparks.prototype.getChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("GetChallengeRequest", request, onResponse);
}
GameSparks.prototype.getDownloadableRequest = function(shortCode, onResponse )
{
    var request = {};
    request["shortCode"] = shortCode;
    gamesparks.sendWithData("GetDownloadableRequest", request, onResponse);
}
GameSparks.prototype.getMessageRequest = function(messageId, onResponse )
{
    var request = {};
    request["messageId"] = messageId;
    gamesparks.sendWithData("GetMessageRequest", request, onResponse);
}
GameSparks.prototype.getRunningTotalsRequest = function(friendIds, shortCode, onResponse )
{
    var request = {};
    request["friendIds"] = friendIds;
    request["shortCode"] = shortCode;
    gamesparks.sendWithData("GetRunningTotalsRequest", request, onResponse);
}
GameSparks.prototype.getUploadUrlRequest = function(uploadData, onResponse )
{
    var request = {};
    request["uploadData"] = uploadData;
    gamesparks.sendWithData("GetUploadUrlRequest", request, onResponse);
}
GameSparks.prototype.getUploadedRequest = function(uploadId, onResponse )
{
    var request = {};
    request["uploadId"] = uploadId;
    gamesparks.sendWithData("GetUploadedRequest", request, onResponse);
}
GameSparks.prototype.googlePlayBuyGoodsRequest = function(currencyCode, signature, signedData, subUnitPrice, onResponse )
{
    var request = {};
    request["currencyCode"] = currencyCode;
    request["signature"] = signature;
    request["signedData"] = signedData;
    request["subUnitPrice"] = subUnitPrice;
    gamesparks.sendWithData("GooglePlayBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.iOSBuyGoodsRequest = function(currencyCode, receipt, sandbox, subUnitPrice, onResponse )
{
    var request = {};
    request["currencyCode"] = currencyCode;
    request["receipt"] = receipt;
    request["sandbox"] = sandbox;
    request["subUnitPrice"] = subUnitPrice;
    gamesparks.sendWithData("IOSBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.joinChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("JoinChallengeRequest", request, onResponse);
}
GameSparks.prototype.leaderboardDataRequest = function(challengeInstanceId, entryCount, friendIds, leaderboardShortCode, offset, social, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["entryCount"] = entryCount;
    request["friendIds"] = friendIds;
    request["leaderboardShortCode"] = leaderboardShortCode;
    request["offset"] = offset;
    request["social"] = social;
    gamesparks.sendWithData("LeaderboardDataRequest", request, onResponse);
}
GameSparks.prototype.listAchievementsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListAchievementsRequest", request, onResponse);
}
GameSparks.prototype.listChallengeRequest = function(entryCount, offset, shortCode, state, onResponse )
{
    var request = {};
    request["entryCount"] = entryCount;
    request["offset"] = offset;
    request["shortCode"] = shortCode;
    request["state"] = state;
    gamesparks.sendWithData("ListChallengeRequest", request, onResponse);
}
GameSparks.prototype.listChallengeTypeRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListChallengeTypeRequest", request, onResponse);
}
GameSparks.prototype.listGameFriendsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListGameFriendsRequest", request, onResponse);
}
GameSparks.prototype.listInviteFriendsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListInviteFriendsRequest", request, onResponse);
}
GameSparks.prototype.listLeaderboardsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListLeaderboardsRequest", request, onResponse);
}
GameSparks.prototype.listMessageRequest = function(entryCount, offset, onResponse )
{
    var request = {};
    request["entryCount"] = entryCount;
    request["offset"] = offset;
    gamesparks.sendWithData("ListMessageRequest", request, onResponse);
}
GameSparks.prototype.listMessageSummaryRequest = function(entryCount, offset, onResponse )
{
    var request = {};
    request["entryCount"] = entryCount;
    request["offset"] = offset;
    gamesparks.sendWithData("ListMessageSummaryRequest", request, onResponse);
}
GameSparks.prototype.listVirtualGoodsRequest = function(onResponse )
{
    var request = {};
    gamesparks.sendWithData("ListVirtualGoodsRequest", request, onResponse);
}
GameSparks.prototype.logChallengeEventRequest = function(challengeInstanceId, eventKey, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["eventKey"] = eventKey;
    gamesparks.sendWithData("LogChallengeEventRequest", request, onResponse);
}
GameSparks.prototype.logEventRequest = function(eventKey, onResponse )
{
    var request = {};
    request["eventKey"] = eventKey;
    gamesparks.sendWithData("LogEventRequest", request, onResponse);
}
GameSparks.prototype.pushRegistrationRequest = function(deviceOS, pushId, onResponse )
{
    var request = {};
    request["deviceOS"] = deviceOS;
    request["pushId"] = pushId;
    gamesparks.sendWithData("PushRegistrationRequest", request, onResponse);
}
GameSparks.prototype.registrationRequest = function(displayName, password, userName, onResponse )
{
    var request = {};
    request["displayName"] = displayName;
    request["password"] = password;
    request["userName"] = userName;
    gamesparks.sendWithData("RegistrationRequest", request, onResponse);
}
GameSparks.prototype.sendFriendMessageRequest = function(friendIds, message, onResponse )
{
    var request = {};
    request["friendIds"] = friendIds;
    request["message"] = message;
    gamesparks.sendWithData("SendFriendMessageRequest", request, onResponse);
}
GameSparks.prototype.socialLeaderboardDataRequest = function(challengeInstanceId, entryCount, friendIds, leaderboardShortCode, offset, social, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["entryCount"] = entryCount;
    request["friendIds"] = friendIds;
    request["leaderboardShortCode"] = leaderboardShortCode;
    request["offset"] = offset;
    request["social"] = social;
    gamesparks.sendWithData("SocialLeaderboardDataRequest", request, onResponse);
}
GameSparks.prototype.twitterConnectRequest = function(accessSecret, accessToken, onResponse )
{
    var request = {};
    request["accessSecret"] = accessSecret;
    request["accessToken"] = accessToken;
    gamesparks.sendWithData("TwitterConnectRequest", request, onResponse);
}
GameSparks.prototype.windowsBuyGoodsRequest = function(currencyCode, receipt, subUnitPrice, onResponse )
{
    var request = {};
    request["currencyCode"] = currencyCode;
    request["receipt"] = receipt;
    request["subUnitPrice"] = subUnitPrice;
    gamesparks.sendWithData("WindowsBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.withdrawChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
    request["challengeInstanceId"] = challengeInstanceId;
    request["message"] = message;
    gamesparks.sendWithData("WithdrawChallengeRequest", request, onResponse);
}
var e,aa=document.getElementById("canvasBackground"),ba="big game_blaster gameui_endless endscreen_endless theme_littlewitch final poki_api".split(" ");function ca(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var da=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=ca(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=ca(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.u={};this.Oa={};this.pg={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.u.opera=!0,this.u.version=c||ca(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Oa.Gq=!0,this.u.tm=!0,this.u.version=ca(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.u.tm=!0,this.u.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.u.AB=!0,this.u.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.u.chrome=!0,this.u.version=ca(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.u.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.u.HC=!0,this.u.version=ca(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.u.IC=!0,this.u.version=ca(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.u.js=!0,this.u.version=ca(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Oa.HB=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.u.eu=!0,this.u.version=ca(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.u.ji=!0,this.u.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.u.oC=!0,this.u.version=ca(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.u.sr=!0,this.u.version=
c||ca(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.u.pv=!0,this.u.version=c||ca(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.pg.YC=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.u.pr=!0,this.u.version=ca(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.u.BA=!0,this.u.version=ca(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&
(this.name="Safari",this.u.Vp=!0,this.u.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.u.bD=!0,!this.u.version&&c&&(this.u.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.u.SB=!0,this.u.version=this.u.version||ca(this,/gecko\/(\d+(\.\d+)?)/i));b||this.eu?this.Oa.YA=!0:a&&(this.Oa.dm=!0);c="";a?(c=ca(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=ca(this,/android[ \/-](\d+(\.\d+)*)/i):this.Gq?
c=ca(this,/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.pv?c=ca(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.sr?c=ca(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.pr?c=ca(this,/bada\/(\d+(\.\d+)*)/i):this.BA&&(c=ca(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Oa.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.eu)this.pg.Hu=!0;else if(g||"iphone"==a||"ipod"==a||b||this.sr||this.pv||this.pr)this.pg.At=!0;this.of={Qi:!1,ej:!1,x:!1};this.tm&&10<=this.u.version||this.chrome&&20<=this.u.version||
this.js&&20<=this.u.version||this.Vp&&6<=this.u.version||this.opera&&10<=this.u.version||this.dm&&this.Oa.version&&6<=this.Oa.version.split(".")[0]?this.of.Qi=!0:this.tm&&10>this.u.version||this.chrome&&20>this.u.version||this.js&&20>this.u.version||this.Vp&&6>this.u.version||this.opera&&10>this.u.version||this.dm&&this.Oa.version&&6>this.Oa.version.split(".")[0]?this.of.ej=!0:this.of.x=!0;try{this.u.Xe=this.u.version?parseFloat(this.u.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.u.Xe=0}try{this.Oa.Xe=
this.Oa.version?parseFloat(this.Oa.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Oa.Xe=0}};function ea(){}var fa=new ea;function f(a,b){this.x=a;this.y=b}function ga(a,b){return new f(b*Math.cos(Math.PI*a/180),-b*Math.sin(Math.PI*a/180))}e=f.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.I=function(){return new f(this.x,this.y)};e.add=function(a){return new f(this.x+a.x,this.y+a.y)};function ha(a,b){return new f(a.x-b.x,a.y-b.y)}
e.scale=function(a){return new f(a*this.x,a*this.y)};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new f(a*this.x+b*this.y,-b*this.x+a*this.y)};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new f(0,0):new f(this.x/a,this.y/a)};function ja(a){return(new f(a.y,-a.x)).normalize()}
e.oc=function(a,b,c){var d=Math.min(8,this.length()/4),g=ha(this,this.normalize().scale(2*d)),h=g.add(ja(this).scale(d)),d=g.add(ja(this).scale(-d)),k=m.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function ka(a){this.Sj=4294967296;this.Qi=1664525;this.ej=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Sj-1)):a}
ka.prototype.I=function(){var a=new ka;a.Sj=this.Sj;a.Qi=this.Qi;a.ej=this.ej;a.state=this.state;return a};ka.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Qi*this.state+this.ej)%this.Sj;return this.state/this.Sj*b};function la(a,b){var c=1;void 0!==b&&(c=b);return Math.floor(a.random(c+1))}new ka;function na(){this.af="";this.wn=[];this.Pi=[];this.Wf=[];this.lh=[];this.Tc=[];this.pa("start");this.pa("load");this.pa("game")}
function oa(a){var b=pa;b.af=a;""!==b.af&&"/"!==b.af[b.af.length-1]&&(b.af+="/")}e=na.prototype;e.pa=function(a){this.Tc[a]||(this.Pi[a]=0,this.Wf[a]=0,this.lh[a]=0,this.Tc[a]=[],this.wn[a]=!1)};e.loaded=function(a){return this.Tc[a]?this.Wf[a]:0};e.gd=function(a){return this.Tc[a]?this.lh[a]:0};e.complete=function(a){return this.Tc[a]?this.Wf[a]+this.lh[a]===this.Pi[a]:!0};function ra(a){var b=pa;return b.Tc[a]?100*(b.Wf[a]+b.lh[a])/b.Pi[a]:100}
function sa(a){var b=pa;b.Wf[a]+=1;b.complete(a)&&ta("Load Complete",{Ya:a})}function ua(a){var b=pa;b.lh[a]+=1;ta("Load Failed",{Ya:a})}function va(a,b,c){var d=pa;d.Tc[b]||d.pa(b);d.Tc[b].push(a);d.Pi[b]+=c}e.ge=function(a){var b;if(!this.wn[a])if(this.wn[a]=!0,this.Tc[a]&&0!==this.Tc[a].length)for(b=0;b<this.Tc[a].length;b+=1)this.Tc[a][b].ge(a,this.af);else ta("Load Complete",{Ya:a})};var pa=new na;function wa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.Kb(a)}
wa.prototype.Kb=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};wa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function xa(a,b,c,d,g,h){var k=m;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ya(a,b,c,d){var g=m;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,d);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
wa.prototype.Hc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};wa.prototype.da=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var m=new wa(aa);function za(a,b,c){this.name=a;this.G=b;this.xx=c;this.Wc=[];this.qo=[];va(this,this.xx,this.G)}za.prototype.ge=function(a,b){function c(){ua(a)}function d(){sa(a)}var g,h;for(g=0;g<this.Wc.length;g+=1)h=this.qo[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.Wc[g].src=h,this.Wc[g].addEventListener("load",d,!1),this.Wc[g].addEventListener("error",c,!1)};
za.prototype.complete=function(){var a;for(a=0;a<this.Wc.length;a+=1)if(!this.Wc[a].complete||0===this.Wc[a].width)return!1;return!0};function Aa(a,b,c){0<=b&&b<a.G&&(a.Wc[b]=new Image,a.qo[b]=c)}za.prototype.f=function(a,b){0<=a&&a<this.G&&(this.Wc[a]=b,this.qo[a]="")};za.prototype.xa=function(a,b,c,d,g,h,k,l,n){this.Wc[a]&&this.Wc[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&m.context.drawImage(this.Wc[a],b,c,d,g,h,k,l,n))};
function p(a,b,c,d,g,h,k,l,n,q){this.name=a;this.Pf=b;this.G=c;this.width=d;this.height=g;this.Nb=h;this.Ob=k;this.gj=l;this.Ah=n;this.Th=q;this.Lf=[];this.Mf=[];this.Nf=[];this.Se=[];this.Re=[];this.Te=[];this.Ue=[]}e=p.prototype;e.f=function(a,b,c,d,g,h,k,l){0<=a&&a<this.G&&(this.Lf[a]=b,this.Mf[a]=c,this.Nf[a]=d,this.Se[a]=g,this.Re[a]=h,this.Te[a]=k,this.Ue[a]=l)};e.complete=function(){return this.Pf.complete()};
e.p=function(a,b,c){a=(Math.round(a)%this.G+this.G)%this.G;this.Pf.xa(this.Lf[a],this.Mf[a],this.Nf[a],this.Se[a],this.Re[a],b-this.Nb+this.Te[a],c-this.Ob+this.Ue[a])};e.pc=function(a,b,c,d){var g=m.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.G+this.G)%this.G;this.Pf.xa(this.Lf[a],this.Mf[a],this.Nf[a],this.Se[a],this.Re[a],b-this.Nb+this.Te[a],c-this.Ob+this.Ue[a]);g.globalAlpha=h};
e.$=function(a,b,c,d,g,h,k){var l=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.G+this.G)%this.G,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,g),l.globalAlpha=k,this.Pf.xa(this.Lf[a],this.Mf[a],this.Nf[a],this.Se[a],this.Re[a],this.Te[a]-this.Nb,this.Ue[a]-this.Ob),l.restore())};
e.xa=function(a,b,c,d,g,h,k,l){var n=m.context,q=n.globalAlpha,t,A,B,r;a=(Math.round(a)%this.G+this.G)%this.G;t=this.Te[a];A=this.Ue[a];B=this.Se[a];r=this.Re[a];b-=t;c-=A;0>=b+d||0>=c+g||b>=B||c>=r||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>B&&(d=B-b),c+g>r&&(g=r-c),n.globalAlpha=l,this.Pf.xa(this.Lf[a],this.Mf[a]+b,this.Nf[a]+c,d,g,h,k),n.globalAlpha=q)};
e.fo=function(a,b,c,d,g,h,k,l,n,q,t,A){var B,r,s,u,v,R,qa,ia,ma,Ja;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),B=Math.ceil((q-b)/h),r=Math.ceil((t-c)/k),b+=l,c+=n,ma=0;ma<B;ma+=1)for(Ja=0;Ja<r;Ja+=1)v=d,R=g,qa=h,ia=k,s=b+ma*h,u=c+Ja*k,s<l&&(v+=l-s,qa-=l-s,s=l),s+qa>=l+q&&(qa=l+q-s),u<n&&(R+=n-u,ia-=n-u,u=n),u+ia>=n+t&&(ia=n+t-u),0<qa&&0<ia&&this.xa(a,v,R,qa,ia,s,u,A)};e.vl=function(a,b,c,d,g,h,k,l,n,q){this.fo(a,0,0,b,c,d,g,h,k,l,n,q)};
e.ul=function(a,b,c,d,g,h,k,l,n,q){var t=m.context,A=t.globalAlpha,B,r,s,u,v,R;a=(Math.round(a)%this.G+this.G)%this.G;B=l/d;r=n/g;s=this.Te[a];u=this.Ue[a];v=this.Se[a];R=this.Re[a];b-=s;c-=u;0>=b+d||0>=c+g||b>=v||c>=R||(0>b&&(d+=b,l+=B*b,h-=B*b,b=0),0>c&&(g+=c,n+=r*c,k-=r*c,c=0),b+d>v&&(l-=B*(d-v+b),d=v-b),c+g>R&&(n-=r*(g-R+c),g=R-c),t.globalAlpha=q,this.Pf.xa(this.Lf[a],this.Mf[a]+b,this.Nf[a]+c,d,g,h,k,l,n),t.globalAlpha=A)};
function Ba(a,b,c){var d,g,h;for(d=0;d<a.G;d+=1)g=b+d%a.Th*a.width,h=c+a.height*Math.floor(d/a.Th),a.Pf.xa(a.Lf[d],a.Mf[d],a.Nf[d],a.Se[d],a.Re[d],g-a.Nb+a.Te[d],h-a.Ob+a.Ue[d])}function w(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Ob=this.Nb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.um=void 0}e=w.prototype;
e.I=function(){var a=new w(this.width,this.height);a.Nb=this.Nb;a.Ob=this.Ob;x(a);this.p(0,0);y(a);return a};function x(a){a.um=m.canvas;m.Kb(a.canvas)}function y(a){m.canvas===a.canvas&&void 0!==a.um&&(m.Kb(a.um),a.um=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.p=function(a,b){m.context.drawImage(this.canvas,a-this.Nb,b-this.Ob)};
e.pc=function(a,b,c){var d=m.context,g=d.globalAlpha;d.globalAlpha=c;m.context.drawImage(this.canvas,a-this.Nb,b-this.Ob);d.globalAlpha=g};e.$=function(a,b,c,d,g,h){var k=m.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,m.context.drawImage(this.canvas,-this.Nb,-this.Ob),k.restore())};
e.xa=function(a,b,c,d,g,h,k){var l=m.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,m.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),l.globalAlpha=n)};
e.fo=function(a,b,c,d,g,h,k,l,n,q,t){var A,B,r,s,u,v,R,qa,ia,ma;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),A=Math.ceil((n-a)/g),B=Math.ceil((q-b)/h),a+=k,b+=l,ia=0;ia<A;ia+=1)for(ma=0;ma<B;ma+=1)u=c,v=d,R=g,qa=h,r=a+ia*g,s=b+ma*h,r<k&&(u+=k-r,R-=k-r,r=k),r+R>=k+n&&(R=k+n-r),s<l&&(v+=l-s,qa-=l-s,s=l),s+qa>=l+q&&(qa=l+q-s),0<R&&0<qa&&this.xa(u,v,R,qa,r,s,t)};
e.vl=function(a,b,c,d,g,h,k,l,n){this.fo(0,0,a,b,c,d,g,h,k,l,n)};e.ul=function(a,b,c,d,g,h,k,l,n){var q=m.context,t=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,m.context.drawImage(this.canvas,a,b,c,d,g,h,k,l),q.globalAlpha=t))};
function Ca(a,b,c,d){this.n=a;this.RA=b;this.DA=c;this.Fk=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.Du=!1;va(this,d,1)}function Da(a,b,c){m.context.save();m.context.font="250pt "+a+", "+b;a=m.context.measureText(c).width;m.context.restore();return a}
function Ea(a){var b,c,d;for(b=0;b<a.Fk.length;b+=1)if(c=a.Fk[b],d=Da(a.n,c.font,c.text),c.width!==d){sa(a.wx);document.body.removeChild(a.Ye);a.Du=!0;return}window.setTimeout(function(){Ea(a)},33)}
Ca.prototype.ge=function(a,b){var c="@font-face {font-family: "+this.n+";src: url('"+b+this.RA+"') format('woff'), url('"+b+this.DA+"') format('truetype');}",d=document.createElement("style");d.id=this.n+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.Ye=document.createElement("span");this.Ye.style.position="absolute";this.Ye.style.left="-9999px";this.Ye.style.top="-9999px";this.Ye.style.visibility=
"hidden";this.Ye.style.fontSize="250pt";this.Ye.id=this.n+"_loader";document.body.appendChild(this.Ye);for(c=0;c<this.Fk.length;c+=1)d=this.Fk[c],d.width=Da(d.font,d.font,d.text);this.wx=a;Ea(this)};Ca.prototype.complete=function(){return this.Du};
function z(a,b){this.n=a;this.uj=b;this.fontWeight=this.fontStyle="";this.Eh="normal";this.fontSize=12;this.fill=!0;this.qg=1;this.hd=0;this.fillColor="black";this.zd={e:void 0,Lb:0,Rp:!0,Sp:!0};this.Wa={xk:!0,G:3,ml:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Zg=1;this.ki=0;this.strokeColor="black";this.strokeStyle=void 0;this.rd=1;this.Qe=!1;this.$g="miter";this.P={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.i="top";
this.rb=this.yf=0}e=z.prototype;
e.I=function(){var a=new z(this.n,this.uj);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.Eh=this.Eh;a.fontSize=this.fontSize;a.fill=this.fill;a.qg=this.qg;a.hd=this.hd;a.fillColor=this.fillColor;a.zd={e:this.zd.e,Rp:this.zd.Rp,Sp:this.zd.Sp};a.Wa={xk:this.Wa.xk,G:this.Wa.G,ml:this.Wa.ml.slice(0),size:this.Wa.size,offset:this.Wa.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Zg=this.Zg;a.ki=this.ki;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.rd=this.rd;a.Qe=
this.Qe;a.$g=this.$g;a.P={h:this.P.h,color:this.P.color,offsetX:this.P.offsetX,offsetY:this.P.offsetY,blur:this.P.blur};a.align=this.align;a.i=this.i;a.yf=this.yf;a.rb=this.rb;return a};
function C(a,b){void 0!==b.n&&(a.n=b.n);void 0!==b.uj&&(a.uj=b.uj);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.Eh&&(a.Eh=b.Eh);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.qg&&(a.qg=b.qg);void 0!==b.fillColor&&(a.hd=0,a.fillColor=b.fillColor);void 0!==b.zd&&(a.hd=1,a.zd=b.zd);void 0!==b.Wa&&(a.hd=2,a.Wa=b.Wa);void 0!==b.fillStyle&&(a.hd=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Zg&&(a.Zg=b.Zg);void 0!==b.strokeColor&&(a.ki=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.ki=3,a.strokeStyle=b.strokeStyle);void 0!==b.rd&&(a.rd=b.rd);void 0!==b.Qe&&(a.Qe=b.Qe);void 0!==b.$g&&(a.$g=b.$g);void 0!==b.P&&(a.P=b.P);void 0!==b.align&&(a.align=b.align);void 0!==b.i&&(a.i=b.i);void 0!==b.yf&&(a.yf=b.yf);void 0!==b.rb&&(a.rb=b.rb)}function Fa(a,b){a.fontWeight=void 0===b?"":b}function D(a,b){a.fontSize=void 0===b?12:b}function E(a){a.fill=!0}
function F(a,b){a.qg=void 0===b?1:b}e.setFillColor=function(a){this.hd=0;this.fillColor=void 0===a?"black":a};function Ga(a,b,c,d,g){a.hd=2;a.Wa.xk=!0;a.Wa.G=b;a.Wa.ml=c.slice(0);a.Wa.size=void 0===d?.6:d;a.Wa.offset=void 0===g?0:g}function Ha(a,b){a.stroke=void 0===b?!1:b}function Ia(a,b){a.Zg=void 0===b?1:b}e.setStrokeColor=function(a){this.ki=0;this.strokeColor=void 0===a?"black":a};function Ka(a,b){a.rd=void 0===b?1:b}function La(a,b){a.Qe=void 0===b?!1:b}
function Ma(a,b){a.$g=void 0===b?"miter":b}function Na(a,b,c,d,g,h){void 0===b?a.P={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1}:b instanceof Object?a.P={h:b.h,color:b.color,offsetX:b.offsetX,offsetY:b.offsetY,blur:b.blur}:void 0===c?a.P.h=b:a.P={h:b,color:c,offsetX:d,offsetY:g,blur:h}}function Oa(a){return{h:a.P.h,color:a.P.color,offsetX:a.P.offsetX,offsetY:a.P.offsetY,blur:a.P.blur}}function G(a,b){a.align=void 0===b?"left":b}function H(a,b){a.i=void 0===b?"top":b}
function Pa(a){a.yf=0}function Qa(a){a.rb=0}function Ra(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.n+", "+a.uj}function Sa(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Ta(a,b){return a.fontSize*b.length+a.rb*(b.length-1)}
function Ua(a,b,c){var d,g,h,k,l,n,q=[],t=m.context;t.font=Ra(a);switch(a.Eh){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:t.measureText(n[a]).width});return q}n=b.split("\n");h=t.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];l=t.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=t.measureText(g[b]).width,l+h+k<c?(d+=" "+g[b],l+=h+k):(q.push({text:d,width:l}),d=g[b],l=k);
q.push({text:d,width:l})}return q}e.da=function(a,b){var c;m.context.save();c=Sa(Ua(this,a,b));m.context.restore();return c};e.W=function(a,b){var c;m.context.save();c=Ta(this,Ua(this,a,b));m.context.restore();return c};function Va(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?Ua(a,c,d):Ua(a,c);d=Sa(b)<=d&&Ta(a,b)<=g;a.fontSize=k;return d}
function Wa(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(m.context.save();Va(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Va(a,h+k,b,c,d,g)&&(h+=k);m.context.restore();return Math.max(4,h)}function Xa(a,b,c,d,g){var h=Math.max(.01,a.Wa.size),k=a.Wa.offset;a.Wa.xk?(k=g/2+k*g,h=.5*h*g,b=m.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=m.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.Wa.G-1);for(d=0;d<a.Wa.G;d+=1)b.addColorStop(d*c,a.Wa.ml[d]);return b}
function Ya(a,b,c,d,g,h,k){var l,n;!a.fill&&a.P.h?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Zg;switch(a.ki){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.rd;b.lineJoin=a.$g;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.rb*k;b.strokeText(c[k].text,d+l,g+n)}}
function Za(a,b,c,d,g,h,k){c=Ua(a,c,k);k=Sa(c);var l=Ta(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.i){case "base":case "bottom":g+=-l+Math.round(a.yf*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.yf*a.fontSize/2)}b.font=Ra(a);a.stroke&&a.Qe&&Ya(a,b,c,d,g,k,h);if(a.fill){var n=d,q=g,t,A;a.P.h?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.qg;switch(a.hd){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.zd.e;A=new w(l.width,l.height);var B=a.zd.Rp,r=a.zd.Sp;B&&r?t="repeat":B&&!r?t="repeat-x":!B&&r?t="repeat-y":B||r||(t="no-repeat");x(A);l.p(a.zd.Lb,0,0);y(A);t=m.context.createPattern(A.canvas,t);b.fillStyle=t;break;case 2:b.fillStyle=Xa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(t=0;t<c.length;t+=1){l=0;switch(a.align){case "right":l=
k-c[t].width;break;case "center":l=(k-c[t].width)/2}A=a.fontSize*(t+1)+a.rb*t;2===a.hd&&a.Wa.xk&&(b.fillStyle=Xa(a,n,q+A-a.fontSize,k,a.fontSize));b.fillText(c[t].text,n+l,q+A)}}a.stroke&&!a.Qe&&Ya(a,b,c,d,g,k,h)}e.p=function(a,b,c,d){var g=m.context;this.fill&&1===this.hd?this.$(a,b,c,1,1,0,1,d):(g.save(),Za(this,g,a,b,c,1,d),g.restore())};e.pc=function(a,b,c,d,g){var h=m.context;this.fill&&1===this.hd?this.$(a,b,c,1,1,0,d,g):(h.save(),Za(this,h,a,b,c,d,g),h.restore())};
e.$=function(a,b,c,d,g,h,k,l){var n=m.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Za(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function ab(){this.Nx=10;this.Kk=-1;this.Fv="stop_lowest_prio";this.mr=this.Sa=this.$a=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.$a=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Sa=!0)}catch(d){}this.mr=this.$a||this.Sa;this.Sa&&da.u.ji&&(this.Kk=1);if(this.mr)try{a=new Audio,this.Tq={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),
mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Tq={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.ic=
[];this.Vf={};this.Ta={};this.Dc={};this.me=[];this.Cc=0;this.$a?(this.le=new c,this.Uq="function"===typeof this.le.createGain?function(){return b.le.createGain()}:"function"===typeof this.le.createGainNode?function(){return b.le.createGainNode()}:function(){},this.ne={},this.Jk=this.Uq(),void 0===this.Jk?(this.Sa=!0,this.Bi=ab.prototype.vn):(this.Jk.connect(this.le.destination),this.ne.master=this.Jk,this.Bi=ab.prototype.Ev)):this.Bi=this.Sa?ab.prototype.vn:function(){}}
function bb(a){var b=I,c,d,g,h,k;for(c=0;c<b.ic.length;c+=1)if((d=b.ic[c])&&0===d.mo)if(d.paused)d.Yq&&(d.xn+=a,d.xn>=d.Yq&&b.bk(d.id));else if(d.yn+=a,d.kh&&d.yn>=d.ou)d.kh=!1,cb(b,d,d.pe);else if(d.be&&b.Sa&&b.Jo(d.id)>=d.duration)if(d.mp)try{d.H.pause(),d.H.currentTime=d.pe/1E3,4===d.H.readyState?d.H.play():(g=function(){var a=d;return{ready:function(){a.H.play();a.H.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.H.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else d.H.pause(),
db(d);for(c=b.me.length-1;0<=c;c-=1)h=b.me[c],b.Qs(h.id)||0!==h.mo||(h.k+=a,h.k>=h.duration?(I.de(h.id,h.lk),void 0!==b.Dc[h.id]&&(b.Dc[h.id]=h.lk),h.Yb&&h.Yb(),b.me.splice(c,1)):(k=h.Qa(h.k,h.start,h.lk-h.start,h.duration),I.de(h.id,k),void 0!==b.Dc[h.id]&&(b.Dc[h.id]=k)))}function eb(a,b){a.Vf[b.yb.s.name]?a.Vf[b.yb.s.name].length<a.Nx&&a.Vf[b.yb.s.name].push(b.H):a.Vf[b.yb.s.name]=[b.H]}
function fb(a,b){var c,d,g;g=[];for(c=0;c<a.ic.length;c+=1)(d=a.ic[c])&&0<=d.ta.indexOf(b)&&g.push(d);return g}function gb(a,b){if(0<a.Kk&&a.Cc>=a.Kk)switch(a.Fv){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.ic.length;c+=1)(d=a.ic[c])&&d.be&&!d.paused&&(void 0===g||g.Gm<d.Gm)&&(g=d);if(g.Gm>b.Li){a.stop(g.id);break}return!1}return!0}
function hb(a,b){var c,d=1;for(c=0;c<b.ta.length;c+=1)void 0!==I.Ta[b.ta[c]]&&(d*=I.Ta[b.ta[c]]);c=a.Uq();c.gain.value=d;c.connect(a.Jk);a.ne[b.id]=c;b.H.connect(c)}function ib(a,b){b.H.disconnect(0);a.ne[b.id]&&(a.ne[b.id].disconnect(0),delete a.ne[b.id])}function jb(a,b){var c;if(b.s&&b.s.Wb){if(a.$a)return c=a.le.createBufferSource(),c.buffer=b.s.Wb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Sa)return c=b.s.Wb.cloneNode(!0),c.volume=0,c}}
function kb(a,b){var c,d;if(a.$a)(c=jb(a,b))&&(d=new lb(b,c));else if(a.Sa){c=a.Vf[b.s.name];if(!c)return;0<c.length?d=new lb(b,c.pop()):(c=jb(a,b))&&(d=new lb(b,c))}if(d){a.$a&&hb(a,d);for(c=0;c<a.ic.length;c+=1)if(void 0===a.ic[c])return a.ic[c]=d;a.ic.push(d)}return d}function mb(a){var b=I,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Tq[d])return a[c];return!1}e=ab.prototype;
e.vn=function(a,b,c){function d(){var b;a.loaded=!0;sa(c);a.duration=Math.ceil(1E3*a.Wb.duration);a.Wb.removeEventListener("canplaythrough",d,!1);a.Wb.removeEventListener("error",g,!1);b=a.Wb.cloneNode(!0);I.Vf[a.name].push(b)}function g(){ua(c)}(b=mb(b))?(a.Wb=new Audio,a.Wb.src=b,a.Wb.autoplay=!1,a.Wb.qC="auto",a.Wb.addEventListener("canplaythrough",d,!1),a.Wb.addEventListener("error",g,!1),a.Wb.load()):g()};
e.Ev=function(a,b,c){var d=mb(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){I.le.decodeAudioData(g.response,function(b){b&&(a.Wb=b,a.duration=1E3*b.duration,a.loaded=!0,sa(c))},function(){ua(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(I.$a=!1,I.Sa=!0,I.Bi=ab.prototype.vn,I.Bi(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof J){if(gb(this,a)){a=kb(this,a);if(!a)return-1;a.ou=b||0;a.kh=0<b;a.rc=c||0;a.Be=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.kh||cb(this,a,a.pe);return a.id}return-1}};
function cb(a,b,c){var d;"number"!==typeof c&&(c=0);nb(a,b.id);0<b.rc&&(d=ob(a,b.id),a.de(b.id,0),pb(a,b.id,d,b.rc,b.Be),b.rc=0,b.Be=void 0);if(a.$a){d=c-b.pe;b.Gv=1E3*a.le.currentTime-d;b.H.onended=function(){db(b)};try{b.H.start?b.H.start(0,c/1E3,(b.duration-d)/1E3):b.H.noteGrainOn&&b.H.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.Nd=!0,b.be=!0,a.Cc+=1,b.H.loop=b.mp}catch(g){}}else if(a.Sa){if(4!==b.H.readyState){var h=function(){return{ready:function(){b.H.currentTime=c/1E3;b.H.play();b.Nd=!0;b.H.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.H.addEventListener("canplaythrough",h.ready,!1)}else b.H.currentTime=c/1E3,b.H.play(),b.Nd=!0;b.be=!0;a.Cc+=1}}
e.bk=function(a,b,c,d){var g,h,k,l,n=fb(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.be)&&!d||!h.paused&&d){if(!d){for(g=this.me.length-1;0<=g;g-=1)if(a=this.me[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.rc=b||0;h.Be=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.zi&&(void 0===b&&(h.rc=h.zi.duration),void 0===c&&(h.Be=h.zi.Qa),k=h.zi.gain,h.zi=void 0)}this.$a&&(a=jb(this,h.yb))&&(h.H=a,hb(this,h));void 0!==k&&I.de(h.id,k);cb(this,h,h.pe+(h.Lk||0));void 0!==l&&
(I.de(h.id,l.Qa(l.k,l.start,l.lk-l.start,l.duration)),pb(I,h.id,l.lk,l.duration-l.k,l.Qa,l.Yb))}};
e.pause=function(a,b,c,d,g){var h,k,l=fb(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.rc=c||0,0<h.rc)h.Be=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.zi={gain:qb(h.id),duration:h.rc,Qa:h.Be},pb(I,h.id,0,h.rc,h.Be,function(){I.pause(h.id,b)});else if(k=this.Jo(h.id),h.Lk=k,g||(h.paused=!0,h.xn=0,h.Yq=b,this.Cc-=1),this.$a){h.H.onended=function(){};if(h.be&&h.Nd){try{h.H.stop?h.H.stop(0):h.H.noteOff&&h.H.noteOff(0)}catch(n){}h.Nd=!1}ib(this,h)}else this.Sa&&h.H.pause()};
function db(a){var b=I;b.Ta[a.id]&&delete b.Ta[a.id];a.paused||(b.Cc-=1);b.$a?(a.Nd=!1,a.be=!1,ib(b,a)):b.Sa&&eb(b,a);b.ic[b.ic.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=fb(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.rc=b||0,0<d.rc)d.Be=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},pb(I,d.id,0,d.rc,d.Be,function(){I.stop(d.id)});else{this.Ta[d.id]&&delete this.Ta[d.id];d.be&&!d.paused&&(this.Cc-=1);if(this.$a){if(d.be&&!d.paused&&!d.kh){if(d.Nd){try{d.H.stop?d.H.stop(0):d.H.noteOff&&d.H.noteOff(0)}catch(h){}d.Nd=!1}ib(this,d)}}else this.Sa&&(d.kh||d.H.pause(),eb(this,d));this.ic[this.ic.indexOf(d)]=void 0;d.be=!1}};
function pb(a,b,c,d,g,h){var k;for(k=0;k<a.me.length;k+=1)if(a.me[k].id===b){a.me.splice(k,1);break}a.me.push({id:b,lk:c,Qa:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,k:0,start:ob(a,b),Yb:h,mo:0})}function rb(a){var b=I,c;void 0===b.Dc[a]&&(c=void 0!==b.Ta[a]?b.Ta[a]:1,b.de(a,0),b.Dc[a]=c)}function sb(a){var b=I;void 0!==b.Dc[a]&&(b.de(a,b.Dc[a]),delete b.Dc[a])}
e.position=function(a,b){var c,d,g,h,k=fb(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.$a)if(d.paused)d.Lk=b;else{d.H.onended=function(){};if(d.Nd){try{d.H.stop?d.H.stop(0):d.H.noteOff&&d.H.noteOff(0)}catch(l){}d.Nd=!1}ib(this,d);this.Cc-=1;if(g=jb(this,d.yb))d.H=g,hb(this,d),cb(this,d,d.pe+b)}else this.Sa&&(4===d.H.readyState?d.H.currentTime=(d.pe+b)/1E3:(h=function(){var a=d,c=b;return{xs:function(){a.H.currentTime=(a.pe+c)/1E3;a.H.removeEventListener("canplaythrough",
h.xs,!1)}}}(),d.H.addEventListener("canplaythrough",h.xs,!1)))};e.Up=function(a){I.position(a,0)};e.Zt=function(a,b){var c,d=fb(this,a);for(c=0;c<d.length;c+=1)d[c].mp=b,this.$a&&(d[c].H.loop=b)};function ob(a,b){return void 0!==a.Ta[b]?a.Ta[b]:1}function qb(a){var b=I,c=1,d=fb(b,a)[0];if(d)for(a=0;a<d.ta.length;a+=1)void 0!==b.Ta[d.ta[a]]&&(c*=b.Ta[d.ta[a]]);return Math.round(100*c)/100}
e.de=function(a,b){var c,d,g,h=1,k=fb(this,a);this.Ta[a]=b;this.Dc[a]&&delete this.Dc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ta.indexOf(a)){for(g=0;g<d.ta.length;g+=1)void 0!==this.Ta[d.ta[g]]&&(h*=this.Ta[d.ta[g]]);h=Math.round(100*h)/100;this.$a?this.ne[d.id].gain.value=h:this.Sa&&(d.H.volume=h)}};
function nb(a,b){var c,d,g,h=1,k=fb(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.ta.length;g+=1)void 0!==a.Ta[d.ta[g]]&&(h*=a.Ta[d.ta[g]]);h=Math.round(100*h)/100;a.$a?a.ne[d.id].gain.value=h:a.Sa&&(d.H.volume=h)}}e.er=function(a,b){var c,d,g,h=fb(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.ta.indexOf(b[g])&&d.ta.push(b[g]);nb(this,a)};e.Qs=function(a){if(a=fb(this,a)[0])return a.paused};e.Yo=function(a){return fb(this,a)[0]?!0:!1};
e.Jo=function(a){if(a=fb(this,a)[0]){if(this.$a)return a.paused?a.Lk:(1E3*I.le.currentTime-a.Gv)%a.duration;if(I.Sa)return Math.ceil(1E3*a.H.currentTime-a.pe)}};var I=new ab;function tb(a,b,c,d){this.name=a;this.ry=b;this.Hy=c;this.Nc=d;this.loaded=!1;this.Wb=null;va(this,this.Nc,1)}
tb.prototype.ge=function(a,b){var c,d;c=this.ry;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Hy;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);I.Vf[this.name]=[];I.Bi(this,[d,c],a)};tb.prototype.complete=function(){return this.loaded};
function J(a,b,c,d,g,h,k){this.name=a;this.s=b;this.startOffset=c;this.duration=d;I.de(this.name,void 0!==g?g:1);this.Li=void 0!==h?h:10;this.ta=[];k&&(this.ta=this.ta.concat(k));0>this.ta.indexOf(this.name)&&this.ta.push(this.name)}J.prototype.complete=function(){return this.s.complete()};J.prototype.Gm=function(a){void 0!==a&&(this.Li=a);return this.Li};J.prototype.er=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.ta.indexOf(a[b])&&this.ta.push(a[b])};
function lb(a,b){this.yb=a;this.pe=this.yb.startOffset;this.H=b;this.duration=this.yb.duration;this.$e()}lb.prototype.$e=function(){this.id=Math.round(Date.now()*Math.random())+"";this.ta=["master",this.id].concat(this.yb.ta);this.Gm=void 0!==this.yb.Li?this.yb.Li:10;this.paused=this.be=this.mp=!1;this.yn=this.mo=0;this.Nd=this.kh=!1;this.ou=this.Lk=0;var a,b=1;for(a=0;a<this.ta.length;a+=1)void 0!==I.Ta[this.ta[a]]&&(b*=I.Ta[this.ta[a]]);!I.$a&&I.Sa&&(this.H.volume=b)};
function ub(a,b){this.name=a;this.fileName=b;this.info=void 0}function vb(a){this.name=a;this.text="";this.gd=this.complete=!1}vb.prototype.Wf=function(a){4===a.readyState&&(this.complete=!0,(this.gd=200!==a.status)?ta("Get Failed",{name:this.name}):(this.text=a.responseText,ta("Get Complete",{name:this.name})))};
function wb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.gd=200!==c.status,a.gd?ta("Post Failed",{name:a.name}):ta("Post Complete",{name:a.name}))};c.send(a.text)}function xb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.gd=200!==c.status;if(a.gd)return!1;a.text=c.responseText;return!0}
function yb(a){a&&(this.Ie=a);this.clear();this.Ii=this.nh=this.ud=this.Hi=this.Gi=this.Ki=this.Di=this.Ji=this.oe=this.Fi=this.Ei=0;zb(this,this);Ab(this,this);Bb(this,this);this.Ze=[];this.vi=[];this.Ni=[];this.N=0;this.Zq=!1;this.fm=this.startTime=Date.now();this.Yg=this.Ol=0;this.Ox=200;this.Nc="";window.Ck(window.Qq)}yb.prototype.clear=function(){this.F=[];this.Oi=!1;this.Vb=[];this.tn=!1};
function zb(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.Ie&&!(0<b.N)&&(d=b.Ie,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.jh.x=h,b.jh.y=d,b.xi.push({x:b.jh.x,y:b.jh.y}),0<b.Hi))for(a=b.F.length-1;0<=a&&!((h=b.F[a])&&h.h&&0>=h.N&&h.Oo&&(h=h.Oo(b.jh.x,b.jh.y),!0===h));a-=1);},!1);Cb(a)}function Cb(a){a.jh={x:0,y:0};a.xi=[]}
function Ab(a,b){window.addEventListener("mousedown",function(a){0<b.N||(a.preventDefault(),window.focus(),b.Xq>=Date.now()-1E3||(Db(b,0,a.clientX,a.clientY),Eb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.N||(a.preventDefault(),b.Ik>=Date.now()-1E3||(Db(b,0,a.clientX,a.clientY),Fb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.N||(a.preventDefault(),Db(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Xq=Date.now();
if(!(0<b.N))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Eb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.Ik=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.Ik=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.Ik=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){Gb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){Gb(b,a)},!1);Hb(a);a.Xq=0;a.Ik=0}function Hb(a){var b;a.ma=[];for(b=0;16>b;b+=1)a.ma[b]={id:-1,vb:!1,x:0,y:0};a.Yf=[]}function Ib(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.ma[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.ma[d].vb){c=d;a.ma[d].id=b;break}return c}
function Db(a,b,c,d){var g,h;void 0!==a.Ie&&(b=Ib(a,b),-1!==b&&(g=a.Ie,h=g.getBoundingClientRect(),a.ma[b].x=g.width/h.width*(c-h.left),a.ma[b].y=g.height/h.height*(d-h.top)))}function Eb(a,b){var c=Ib(a,b),d,g;if(-1!==c&&!a.ma[c].vb&&(a.Yf.push({rg:c,x:a.ma[c].x,y:a.ma[c].y,vb:!0}),a.ma[c].vb=!0,0<a.ud))for(d=a.F.length-1;0<=d&&!((g=a.F[d])&&g.h&&0>=g.N&&g.Jh&&(g=g.Jh(c,a.ma[c].x,a.ma[c].y),!0===g));d-=1);}
function Fb(a,b){var c=Ib(a,b),d,g;if(-1!==c&&a.ma[c].vb&&(a.Yf.push({rg:c,x:a.ma[c].x,y:a.ma[c].y,vb:!1}),a.ma[c].vb=!1,0<a.ud))for(d=a.F.length-1;0<=d&&!((g=a.F[d])&&g.h&&0>=g.N&&g.Kh&&(g=g.Kh(c,a.ma[c].x,a.ma[c].y),!0===g));d-=1);}
function Gb(a,b){var c;if(!(0<a.N)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.Yf.push({rg:0,x:a.ma[0].x,y:a.ma[0].y,wheelDelta:c});if(0<a.ud)for(d=a.F.length-1;0<=d&&!((g=a.F[d])&&g.h&&0>=g.N&&g.Ro&&(g=g.Ro(c,a.ma[0].x,a.ma[0].y),!0===g));d-=1);}}
function Bb(a,b){window.addEventListener("keydown",function(a){0<b.N||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Jb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.N||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Kb(b,a.keyCode))},!1);Lb(a)}function Lb(a){var b;a.Ai=[];for(b=0;256>b;b+=1)a.Ai[b]=!1;a.mh=[]}
function Jb(a,b){var c,d;if(!a.Ai[b]&&(a.mh.push({key:b,vb:!0}),a.Ai[b]=!0,0<a.nh))for(c=0;c<a.F.length&&!((d=a.F[c])&&d.h&&0>=d.N&&d.Po&&(d=d.Po(b),!0===d));c+=1);}function Kb(a,b){var c,d;if(a.Ai[b]&&(a.mh.push({key:b,vb:!1}),a.Ai[b]=!1,0<a.nh))for(c=0;c<a.F.length&&!((d=a.F[c])&&d.h&&0>=d.N&&d.Qo&&(d=d.Qo(b),!0===d));c+=1);}function Mb(){var a=K,b;for(b=0;b<a.Ze.length;b+=1)a.Ze[b].paused+=1}
function ta(a,b){var c,d=K,g,h;void 0===c&&(c=null);d.Ni.push({id:a,Kv:b,qi:c});if(0<d.Ii)for(g=0;g<d.F.length&&(!((h=d.F[g])&&h.h&&0>=h.N&&h.So)||null!==c&&c!==h||(h=h.So(a,b),!0!==h));g+=1);}
function Nb(a,b){var c=a.Vb[b];c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.Kb(c.canvas),!1!==m.canvas.T||!0===c.wb)&&(0===c.Wq&&(0>=c.N&&(c.Lb+=c.Jv*a.Yg/1E3),1===c.nn&&1===c.on&&0===c.Z?1===c.alpha?c.e.p(c.Lb,c.x,c.y):c.e.pc(c.Lb,c.x,c.y,c.alpha):c.e.$(c.Lb,c.x,c.y,c.nn,c.on,c.Z,c.alpha)),1===c.Wq&&(1===c.nn&&1===c.on&&0===c.Z?1===c.alpha?c.font.p(c.text,c.x,c.y):c.font.pc(c.text,c.x,c.y,c.alpha):c.font.$(c.text,c.x,c.y,c.nn,c.on,c.Z,c.alpha)))}
function Ob(a,b){var c=a.F[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.Kb(c.canvas),(!1!==m.canvas.T||!0===c.wb)&&c.qa))return c.qa()}function Pb(a){for(var b=0,c=0;b<a.F.length||c<a.Vb.length;)if(c===a.Vb.length){if(!0===Ob(a,b))break;b+=1}else if(b===a.F.length)Nb(a,c),c+=1;else if(a.Vb[c].Ea>a.F[b].Ea||a.Vb[c].Ea===a.F[b].Ea&&a.Vb[c].depth>a.F[b].depth)Nb(a,c),c+=1;else{if(!0===Ob(a,b))break;b+=1}}yb.prototype.pause=function(a){this.N+=1;void 0===a&&(a=!1);this.Zq=a};
yb.prototype.bk=function(){0!==this.N&&(this.fm=Date.now(),this.N-=1)};yb.prototype.Qs=function(){return 0<this.N};window.rn=0;window.qn=0;window.Rq=0;window.xv=0;window.Sq=0;window.zv=60;window.Av=0;window.yv=!1;
window.Qq=function(){window.rn=Date.now();window.xv=window.rn-window.qn;var a=K,b;if(0<a.N)a.Zq&&(Qb(a),Pb(a));else{b=Date.now();"number"!==typeof b&&(b=a.fm);a.Yg=Math.min(a.Ox,b-a.fm);a.Ol+=a.Yg;""===a.Nc&&(a.Nc="start",pa.ge(a.Nc));"start"===a.Nc&&pa.complete(a.Nc)&&(a.Nc="load",pa.ge(a.Nc));"load"===a.Nc&&pa.complete(a.Nc)&&(a.Nc="game",pa.ge(a.Nc));"undefined"!==typeof I&&bb(a.Yg);var c,d;if(0<a.Ei)for(c=0;c<a.F.length&&!((d=a.F[c])&&d.V&&d.h&&0>=d.N&&!0===d.V(a.Yg));c+=1);var g,h;if(0!==a.xi.length){if(0<
a.Fi)for(d=a.F.length-1;0<=d;d-=1)if((g=a.F[d])&&g.h&&0>=g.N&&g.No)for(c=0;c<a.xi.length;c+=1)h=a.xi[c],!0!==h.kd&&(h.kd=g.No(h.x,h.y));a.xi=[]}if(0!==a.Yf.length){if(0<a.oe)for(d=a.F.length-1;0<=d;d-=1)if((g=a.F[d])&&g.h&&0>=g.N&&(g.cb||g.Db||g.Vl))for(c=0;c<a.Yf.length;c+=1)h=a.Yf[c],!0!==h.kd&&(void 0!==h.wheelDelta&&g.Vl?h.kd=g.Vl(h.wheelDelta,h.x,h.y):h.vb&&g.cb?h.kd=g.cb(h.rg,h.x,h.y):void 0!==h.vb&&!h.vb&&g.Db&&(h.kd=g.Db(h.rg,h.x,h.y)));a.Yf=[]}if(0!==a.mh.length){if(0<a.Ji)for(d=0;d<a.F.length;d+=
1)if((g=a.F[d])&&g.h&&0>=g.N&&(g.Ej||g.pf))for(c=0;c<a.mh.length;c+=1)h=a.mh[c],!0!==h.kd&&(h.vb&&g.Ej?h.kd=void 0:!h.vb&&g.pf&&(h.kd=g.pf(h.key)));a.mh=[]}c=a.Yg;for(d=a.vi.length=0;d<a.Ze.length;d+=1)g=a.Ze[d],void 0!==g.id&&0===g.paused&&(0<g.ni||0<g.Tp)&&(g.ni-=c,0>=g.ni&&(a.vi.push({id:g.id,qi:g.qi}),0<g.Tp?(g.Tp-=1,g.ni+=g.time):g.ni=0));if(0<a.Di&&0<a.vi.length)for(c=0;c<a.F.length;c+=1)if((d=a.F[c])&&d.Mo&&d.h)for(g=0;g<a.vi.length;g+=1)h=a.vi[g],!0===h.kd||null!==h.qi&&h.qi!==d||(h.kd=void 0);
if(0<a.Ki&&0<a.Ni.length)for(c=0;c<a.F.length;c+=1)if((g=a.F[c])&&g.jd&&g.h&&0>=g.N)for(d=0;d<a.Ni.length;d+=1)h=a.Ni[d],!0===h.kd||null!==h.qi&&h.qi!==g||(h.kd=g.jd(h.id,h.Kv));a.Ni.length=0;if(0<a.Gi)for(c=0;c<a.F.length&&!((d=a.F[c])&&d.Xd&&d.h&&0>=d.N&&!0===d.Xd(a.Yg));c+=1);Qb(a);Pb(a);a.fm=b}window.qn=Date.now();window.Rq=window.qn-window.rn;window.Sq=Math.max(window.Av,1E3/window.zv-window.Rq);window.Ck(window.Qq)};window.Ck=function(a){window.setTimeout(a,window.Sq)};
window.yv||(window.Ck=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.Ck);
function Qb(a){function b(a,b){return a.Ea===b.Ea?b.depth-a.depth:a.Ea>b.Ea?-1:1}var c,d;for(c=d=0;c<a.F.length;c+=1)a.F[c]&&(a.F[c].sn&&(a.F[c].sn=!1,a.F[c].h=!0),a.F[d]=a.F[c],d+=1);a.F.length=d;a.Oi&&a.F.sort(b);a.Oi=!1;for(c=d=0;c<a.Vb.length;c+=1)a.Vb[c]&&(a.Vb[d]=a.Vb[c],d+=1);a.Vb.length=d;a.tn&&a.Vb.sort(b);a.tn=!1}
function L(a,b){var c=K;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.h&&(a.h=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ea&&(a.Ea=0);void 0===a.N&&(a.N=0);void 0===a.cf&&(a.cf=[]);a.sn=!1;void 0!==b&&!1===b&&(a.sn=!0,a.h=!1);c.F.push(a);c.Oi=!0;a.V&&(c.Ei+=1);a.No&&(c.Fi+=1);if(a.cb||a.Db)c.oe+=1;a.Vl&&(c.oe+=1);if(a.Ej||a.pf)c.Ji+=1;a.Mo&&(c.Di+=1);a.jd&&(c.Ki+=1);a.Xd&&(c.Gi+=1);a.Oo&&(c.Hi+=1);if(a.Jh||a.Kh)c.ud+=1;a.Ro&&(c.ud+=1);if(a.Po||a.Qo)c.nh+=1;a.So&&(c.Ii+=
1);a.cc&&a.cc()}function Rb(a,b){var c=K;a.depth!==b&&(c.Oi=!0);a.depth=b}function Sb(a,b){var c;b=[].concat(b);void 0===a.cf&&(a.cf=[]);for(c=b.length-1;0<=c;c-=1)0>a.cf.indexOf(b[c])&&a.cf.push(b[c])}
function Tb(a,b){var c=[],d,g;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.F.length;d+=1)g=a.F[d],void 0!==g&&c.push(g);else if("function"===typeof b)for(d=0;d<a.F.length;d+=1)g=a.F[d],void 0!==g&&b(g)&&c.push(g);else for(d=0;d<a.F.length;d+=1)g=a.F[d],void 0!==g&&0<=g.cf.indexOf(b)&&c.push(g);return c}function Ub(a){var b=Tb(K,a);for(a=0;a<b.length;a+=1){var c=b[a];c.N+=1}}function Vb(a){var b=Tb(K,a);for(a=0;a<b.length;a+=1){var c=b[a];c.N=Math.max(0,c.N-1)}}
function M(a,b){var c=a.F.indexOf(b);if(!(0>c)){a.F[c].kb&&a.F[c].kb();var d=a.F[c];d.V&&(a.Ei-=1);d.No&&(a.Fi-=1);if(d.cb||d.Db)a.oe-=1;d.Vl&&(a.oe-=1);if(d.Ej||d.pf)a.Ji-=1;d.Mo&&(a.Di-=1);d.jd&&(a.Ki-=1);d.Xd&&(a.Gi-=1);d.Oo&&(a.Hi-=1);if(d.Jh||d.Kh)a.ud-=1;d.Ro&&(a.ud-=1);if(d.Po||d.Qo)a.nh-=1;d.So&&(a.Ii-=1);a.F[c]=void 0}}
yb.prototype.f=function(a,b,c,d,g,h,k){void 0===k&&(k=0);this.Vb.push({Wq:0,e:a,Lb:b,Jv:c,visible:!0,x:d,y:g,nn:1,on:1,Z:0,alpha:1,depth:h,Ea:k,N:0,cf:[]});this.tn=!0;return this.Vb[this.Vb.length-1]};var K=new yb(aa);
function Wb(a,b){var c;this.kind=a;this.B=null;switch(this.kind){case 0:this.B={x:[b.x],y:[b.y]};this.Ia=b.x;this.Ua=b.y;this.ab=b.x;this.Bb=b.y;break;case 2:this.B={x:[b.x,b.x+b.hc-1,b.x+b.hc-1,b.x,b.x],y:[b.y,b.y,b.y+b.sc-1,b.y+b.sc-1,b.y]};this.Ia=b.x;this.Ua=b.y;this.ab=b.x+b.hc-1;this.Bb=b.y+b.sc-1;break;case 3:this.B={x:[],y:[]};this.Ia=b.x-b.Jm;this.Ua=b.y-b.Jm;this.ab=b.x+b.Jm;this.Bb=b.y+b.Jm;break;case 1:this.B={x:[b.Kq,b.Lq],y:[b.Mq,b.Nq]};this.Ia=Math.min(b.Kq,b.Lq);this.Ua=Math.min(b.Mq,
b.Nq);this.ab=Math.max(b.Kq,b.Lq);this.Bb=Math.max(b.Mq,b.Nq);break;case 4:this.B={x:[],y:[]};this.Ia=b.x[0];this.Ua=b.y[0];this.ab=b.x[0];this.Bb=b.y[0];for(c=0;c<b.x.length;c+=1)this.B.x.push(b.x[c]),this.B.y.push(b.y[c]),this.Ia=Math.min(this.Ia,b.x[c]),this.Ua=Math.min(this.Ua,b.y[c]),this.ab=Math.max(this.ab,b.x[c]),this.Bb=Math.max(this.Bb,b.y[c]);this.B.x.push(b.x[0]);this.B.y.push(b.y[0]);break;default:this.Ua=this.Ia=0,this.Bb=this.ab=-1}}
function Xb(a,b,c,d){return new Wb(2,{x:a,y:b,hc:c,sc:d})}function Yb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.G;h+=1)k=a.Te[h]-a.Nb,l=k+a.Se[h]-1,n=a.Ue[h]-a.Ob,q=n+a.Re[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>g&&(g=q);return new Wb(2,{x:b,y:d,hc:c-b+1,sc:g-d+1})}e=Wb.prototype;
e.I=function(){var a=new Wb(-1,{}),b;a.kind=this.kind;a.Ia=this.Ia;a.ab=this.ab;a.Ua=this.Ua;a.Bb=this.Bb;a.B={x:[],y:[]};for(b=0;b<this.B.x.length;b+=1)a.B.x[b]=this.B.x[b];for(b=0;b<this.B.y.length;b+=1)a.B.y[b]=this.B.y[b];return a};e.translate=function(a,b){var c=this.I(),d;c.Ia+=a;c.ab+=a;c.Ua+=b;c.Bb+=b;for(d=0;d<c.B.x.length;d+=1)c.B.x[d]+=a;for(d=0;d<c.B.y.length;d+=1)c.B.y[d]+=b;return c};
e.scale=function(a){var b=this.I(),c;b.Ia*=a;b.ab*=a;b.Ua*=a;b.Bb*=a;for(c=0;c<b.B.x.length;c+=1)b.B.x[c]*=a;for(c=0;c<b.B.y.length;c+=1)b.B.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new f(this.B.x[0],this.B.y[0]),b=b.rotate(a),new Wb(0,{x:b.x,y:b.y});case 1:return b=new f(this.B.x[0],this.B.y[0]),b=b.rotate(a),c=new f(this.B.x[1],this.B.y[1]),c=c.rotate(a),new Wb(1,{Kq:b.x,Mq:b.y,Lq:c.x,Nq:c.y});case 3:return b=(this.ab-this.Ia)/2,c=new f(this.Ia+b,this.Ua+b),c=c.rotate(a),new Wb(3,{x:c.x,y:c.y,Jm:b});default:c=[];d=[];for(g=0;g<this.B.x.length-1;g+=1)b=new f(this.B.x[g],this.B.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Wb(4,{x:c,y:d})}};
function Zb(a,b,c,d,g){var h,k,l,n,q;if(d<b+a.Ia||d>b+a.ab||g<c+a.Ua||g>c+a.Bb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return l=(a.ab-a.Ia)/2,d-=b+a.Ia+l,g-=c+a.Ua+l,d*d+g*g<=l*l;case 1:return l=b+a.B.x[0],n=c+a.B.y[0],b+=a.B.x[1],a=c+a.B.y[1],d===l?g===n:d===b?g===a:1>Math.abs(n+(d-l)*(a-n)/(b-l)-g);case 4:n=new f(0,0);q=new f(0,0);l=[];for(k=0;k<a.B.x.length-1;k+=1)n.x=a.B.x[k],n.y=a.B.y[k],q.x=a.B.x[k+1],q.y=a.B.y[k+1],l.push(ja(ha(n,q)));for(n=0;n<l.length;n+=1){q=new f(d,g);k=l[n];
q=q.x*k.x+q.y*k.y;h=a;var t=b,A=c,B=l[n],r=new f(0,0),s=void 0,u=1E9;k=-1E10;for(var v=void 0,v=0;v<h.B.x.length;v+=1)r.x=t+h.B.x[v],r.y=A+h.B.y[v],s=r.x*B.x+r.y*B.y,u=Math.min(u,s),k=Math.max(k,s);h=u;if(q<h||k<q)return!1}return!0;default:return!1}}
e.oc=function(a,b,c){var d=m.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.Ia-1,b+this.Ua-1,3,3);break;case 2:d.fillRect(a+this.Ia,b+this.Ua,this.ab-this.Ia+1,this.Bb-this.Ua+1);break;case 3:c=(this.ab-this.Ia)/2;d.beginPath();d.arc(a+this.Ia+c,b+this.Ua+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.B.x[0],b+this.B.y[0]);d.lineTo(a+this.B.x[1],b+this.B.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.B.x[0],b+this.B.y[0]);
for(c=1;c<this.B.x.length-1;c+=1)d.lineTo(a+this.B.x[c],b+this.B.y[c]);d.closePath();d.fill()}};function ac(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.oa=[];this.Ci=this.N=this.Mi=!1;this.bf=1;this.lc=-1;this.ua=-1E6}e=ac.prototype;e.I=function(){var a=new ac,b;for(b=0;b<this.oa.length;b+=1)a.oa.push({Ya:this.oa[b].Ya,action:this.oa[b].action});a.Ci=this.Ci;return a};
e.pa=function(a,b){var c,d;if(0===this.oa.length||this.oa[this.oa.length-1].Ya<=a)this.oa.push({Ya:a,action:b});else{for(c=0;this.oa[c].Ya<=a;)c+=1;for(d=this.oa.length;d>c;d-=1)this.oa[d]=this.oa[d-1];this.oa[c]={Ya:a,action:b}}this.ua=-1E6};e.start=function(){this.Mi=!0;this.N=!1;this.lc=0>this.bf&&0<this.oa.length?this.oa[this.oa.length-1].Ya+1:-1;this.ua=-1E6;M(K,this);L(this)};
e.Up=function(){if(0>this.bf&&0<this.oa.length){var a=this.oa[this.oa.length-1].Ya;this.lc=0>this.bf?a+1:a-1}else this.lc=0>this.bf?1:-1;this.ua=-1E6};e.stop=function(){this.Mi=!1;M(K,this)};e.Ne=function(){return this.Mi};e.pause=function(){this.N=!0;M(K,this)};e.bk=function(){this.N=!1;M(K,this);L(this)};e.paused=function(){return this.Mi&&this.N};e.Zt=function(a){this.Ci=a};
e.V=function(a){if(this.Mi&&!this.N&&0!==this.bf)if(0<this.bf){0>this.ua&&(this.ua=0);for(;this.ua<this.oa.length&&this.oa[this.ua].Ya<=this.lc;)this.ua+=1;for(this.lc+=this.bf*a;0<=this.ua&&this.ua<this.oa.length&&this.oa[this.ua].Ya<=this.lc;)this.oa[this.ua].action(this.oa[this.ua].Ya,this),this.ua+=1;this.ua>=this.oa.length&&(this.Ci?this.Up():this.stop())}else{0>this.ua&&(this.ua=this.oa.length-1);for(;0<=this.ua&&this.oa[this.ua].Ya>=this.lc;)this.ua-=1;for(this.lc+=this.bf*a;0<=this.ua&&this.oa[this.ua].Ya>=
this.lc;)this.oa[this.ua].action(this.oa[this.ua].Ya,this),this.ua-=1;0>this.ua&&0>=this.lc&&(this.Ci?this.Up():this.stop())}};function bc(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.Ub=[];this.Uf=[];this.clear();this.Oz=!1;L(this)}e=bc.prototype;e.V=function(){var a,b,c,d,g;if(this.Oz)for(a=0;16>a;a+=1)K.ma[a].vb&&(b=K.ma[a].x,c=K.ma[a].y,d=this.Uf[a],g=this.Ub[d],!(0<=d&&g&&g.selected)||g&&Zb(g.ld,0,0,b,c)||(Kb(K,g.keyCode),g.selected=!1,this.Uf[a]=-1),this.cb(a,b,c))};
e.cb=function(a,b,c){var d;if(!(0<=this.Uf[a]))for(d=0;d<this.Ub.length;d+=1){var g;if(g=this.Ub[d])g=(g=this.Ub[d])?Zb(g.ld,0,0,b,c):!1;if(g&&!this.Ub[d].selected){Jb(K,this.Ub[d].keyCode);this.Ub[d].selected=!0;this.Uf[a]=d;break}}};e.Db=function(a){var b=this.Uf[a];0<=b&&this.Ub[b]&&this.Ub[b].selected&&(Kb(K,this.Ub[b].keyCode),this.Ub[b].selected=!1);this.Uf[a]=-1};function cc(a,b,c,d,g,h,k){c=Xb(c,d,g,h);a.Ub.push({keyCode:k,ld:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.Ub.length=0;16>a;a+=1)this.Uf[a]=-1};e.oc=function(a,b,c){var d,g,h,k;for(d=0;d<this.Ub.length;d+=1)if(g=this.Ub[d])g.selected?g.ld.oc(0,0,b):g.ld.oc(0,0,a),h=(g.ld.Ia+g.ld.ab)/2,k=(g.ld.Ua+g.ld.Bb)/2,m.Hc("id: "+g.id,h-20,k-10,c,"16px Arial"),m.Hc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new ka;function N(a,b){return b}function O(a,b,c,d){return b+a/d*c}function dc(a,b,c,d,g){void 0===g&&(g=3);return b+c*Math.pow(a/d,g)}
function ec(a,b,c,d,g){return b+c*dc(d-a,1,-1,d,g)}function fc(a,b,c,d){return dc(a,b,c,d,2)}function gc(a,b,c,d){return dc(a,b,c,d,3)}function hc(a,b,c,d){return ec(a,b,c,d,3)}function ic(a,b,c,d){return b+c*(a<d/2?dc(a,0,.5,d/2,3):dc(d-a,1,-.5,d/2,3))}function jc(a,b,c,d){return ec(a,b,c,d,4)}function kc(a,b,c,d){return b+c*(1-Math.sqrt(1-Math.pow(a/d,2)))}function lc(a,b,c,d){return b+c*kc(d-a,1,-1,d)}
function mc(a,b,c,d,g,h){a=d-a;var k=h;void 0===g&&(g=3);void 0===k&&(k=8);h=Math.sin(2*(1-a/d)*Math.PI*g+Math.PI/2);g=k;void 0===g&&(g=8);k=Math.pow(2,-g);h*=0+(Math.pow(2,g*a/d-g)-k)/(1-k)*1;return b+c*(1+-1*h)}function nc(a,b,c,d,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2))}function P(a,b,c,d,g){return b+c*nc(d-a,1,-1,d,g)}
function oc(a){switch(1){case 0:return function(b,c,d,g,h,k,l){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,l)};case 1:return function(b,c,d,g,h,k,l){return a(b-Math.floor(b/g)*g,c,d,g,h,k,l)};case 2:return function(b,c,d,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*b};case 3:return function(b,c,d,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+d*(n+b)};default:return function(b,c,d,g,h,k,l){return a(b,c,d,g,h,k,l)}}}
function Q(a,b,c){var d,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),g=a[d]===N?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,t,A,B,r,s){var u,v;u=a.length-1;for(v=0;v<a.length;v+=1)if(d/A<=l[v+1]){u=v;break}d=a[u](d/A-l[u],0,1,c[u],B,r,s);b[u]&&(d=-d);return g+(k[u]+d)*t/h}}
var S=window.TG_InitSettings||{};S.size=void 0!==S.size?S.size:"big";S.hv=S.usesFullScreen;S.Wp="big"===S.size?1:.5;S.ug=20;S.zj=10;S.Hh=0;S.Pl=-10;S.mf=-20;S.jb=-30;S.De=-40;
function T(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(S.Wp*a);break a;case "round":c=Math.round(S.Wp*a);break a;default:c=S.Wp*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=T(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=T(a[c],b));return a}}function U(a){return"big"===S.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}var V=V||{};V["nl-nl"]=V["nl-nl"]||{};
V["nl-nl"].TutorialText_0="#touch{Klik groepen van drie of meer objecten van dezelfde kleur aan.}{Tik groepen van drie of meer objecten van dezelfde kleur aan.}  ";V["nl-nl"].TutorialText_1="#touch{Je verzamelt punten door groepen aan te klikken en ze te verwijderen.}{Je verzamelt punten door groepen aan te tikken en ze te verwijderen.}";V["nl-nl"].TutorialText_3="Dit is een vertragingsbonus, die verschijnt als je bijna af bent. #touch{Klik erop en alles vertraagt, zodat je meer tijd hebt om objecten te verwijderen.}{Tik erop en alles vertraagt, zodat je meer tijd hebt om objecten te verwijderen.}";
V["nl-nl"].TutorialText_4="Dit is een bom. #touch{Klik hem aan om omringende objecten op te blazen.}{Tik hem aan om omringende objecten op te blazen.}";V["nl-nl"].TutorialText_5="Dit zijn kleurenbommen. #touch{Klik ze aan om alle objecten met dezelfde kleur te verwijderen.}{Tik ze aan om alle objecten met dezelfde kleur te verwijderen.}";V["nl-nl"].TutorialText_6="Dit is een schudbonus. #touch{Klik hem aan om alle objecten in grotere groepen te ordenen.}{Tik hem aan om alle objecten in grotere groepen te ordenen.}";
V["nl-nl"].TutorialTitle_0="Speluitleg";V["nl-nl"].TutorialTitle_1="Voortgang";V["nl-nl"].TutorialTitle_3="Bonussen";V["nl-nl"].TutorialTitle_4="Bonussen";V["nl-nl"].TutorialTitle_5="Bonussen";V["nl-nl"].TutorialTitle_6="Bonussen";V["nl-nl"].bl_assignment_header="Klaar?";V["nl-nl"].bl_assignment="#touch{Klik groepjes van 3 blokken weg}{Tik groepjes van 3 blokken weg}";V["nl-nl"].bl_stage="Level";V["nl-nl"].bl_nice="Mooi!";V["nl-nl"].bl_great="Geweldig!";V["nl-nl"].bl_awesome="Fantastisch!";
V["nl-nl"].bl_gameover="Helaas";V["nl-nl"].bl_screencleared="Scherm leeg!";V["nl-nl"].TutorialText_2="#touch{Om een nieuwe rij te forceren klik je op de rij in wording of druk je op de spatiebalk.}{Om een nieuwe rij te forceren tik je op de rij in wording.}";V["nl-nl"].TutorialTitle_2="Nieuwe rij";V["en-us"]=V["en-us"]||{};V["en-us"].TutorialText_0="#touch{Click on groups of 3 or more objects of the same colour.}{Tap groups of 3 or more objects of the same colour.}";V["en-us"].TutorialText_1="#touch{Removing groups by clicking on them will earn you points.}{Removing groups by tapping on them will earn you points.}";
V["en-us"].TutorialText_3="This is a freeze boost, which appears when the game is nearly over. #touch{Click on it to slow time, giving you a chance to remove more objects.}{Tap on it to slow time, giving you a chance to remove more objects.}";V["en-us"].TutorialText_4="This is a bomb. #touch{Click the bomb to blast away surrounding objects.}{Tap the bomb to blast away surrounding objects.}";V["en-us"].TutorialText_5="These are color bombs. #touch{Click a color bomb to remove all objects of the same color.}{Tap a color bomb to remove all objects of the same color.}";
V["en-us"].TutorialText_6="This is a shuffle boost. #touch{Click the shuffle boost to sort the objects into bigger groups.}{Tap the shuffle boost to sort the objects into bigger groups.}";V["en-us"].TutorialTitle_0="How to play";V["en-us"].TutorialTitle_1="Progression";V["en-us"].TutorialTitle_3="Boosts";V["en-us"].TutorialTitle_4="Boosts";V["en-us"].TutorialTitle_5="Boosts";V["en-us"].TutorialTitle_6="Boosts";V["en-us"].bl_assignment_header="Ready?";V["en-us"].bl_assignment="#touch{Click on groups of 3 to remove them}{Tap groups of 3 to remove them}";
V["en-us"].bl_stage="Stage";V["en-us"].bl_nice="Nice!";V["en-us"].bl_great="Great!";V["en-us"].bl_awesome="Awesome!";V["en-us"].bl_gameover="Game over";V["en-us"].bl_screencleared="Screen cleared!";V["en-us"].TutorialText_2="#touch{To force a new row, click on it or press the spacebar.}{To force a new row, tap on it .}";V["en-us"].TutorialTitle_2="New row";V["en-gb"]=V["en-gb"]||{};V["en-gb"].TutorialText_0="#touch{Click on groups of 3 or more objects of the same colour.}{Tap groups of 3 or more objects of the same colour.}";
V["en-gb"].TutorialText_1="#touch{Removing groups by clicking on them will earn you points.}{Removing groups by tapping on them will earn you points.}";V["en-gb"].TutorialText_3="This is a freeze boost, which appears when the game is nearly over. #touch{Click on it to slow time, giving you a chance to remove more objects.}{Tap on it to slow time, giving you a chance to remove more objects.}";V["en-gb"].TutorialText_4="This is a bomb. #touch{Click the bomb to blast away surrounding objects.}{Tap the bomb to blast away surrounding objects.}";
V["en-gb"].TutorialText_5="These are colour bombs. #touch{Click a colour bomb to remove all objects of the same colour.}{Tap a colour bomb to remove all objects of the same colour.}";V["en-gb"].TutorialText_6="This is a shuffle boost. #touch{Click the shuffle boost to sort the objects into bigger groups.}{Tap the shuffle boost to sort the objects into bigger groups.}";V["en-gb"].TutorialTitle_0="How to play";V["en-gb"].TutorialTitle_1="Progression";V["en-gb"].TutorialTitle_3="Boosts";
V["en-gb"].TutorialTitle_4="Boosts";V["en-gb"].TutorialTitle_5="Boosts";V["en-gb"].TutorialTitle_6="Boosts";V["en-gb"].bl_assignment_header="Ready?";V["en-gb"].bl_assignment="#touch{Click on groups of 3 to remove them}{Tap groups of 3 to remove them}";V["en-gb"].bl_stage="Stage";V["en-gb"].bl_nice="Nice!";V["en-gb"].bl_great="Great!";V["en-gb"].bl_awesome="Awesome!";V["en-gb"].bl_gameover="Game over";V["en-gb"].bl_screencleared="Screen cleared!";V["en-gb"].TutorialText_2="#touch{To force a new row, click on it or press the spacebar.}{To force a new row, tap on it .}";
V["en-gb"].TutorialTitle_2="New row";V["de-de"]=V["de-de"]||{};V["de-de"].TutorialText_0="#touch{Klicke auf Gruppen aus mindestens drei Objekten gleicher Farbe.}{Tippe auf Gruppen aus mindestens drei Objekten gleicher Farbe.}";V["de-de"].TutorialText_1="#touch{Klicke auf Gruppen, um sie zu entfernen. Das bringt dir Punkte ein.}{Tippe auf Gruppen, um sie zu entfernen. Das bringt dir Punkte ein.}";V["de-de"].TutorialText_3="Das ist ein Frost-Extra. Es erscheint, wenn das Spiel fast vorbei ist. #touch{Klicke drauf, um die Zeit zu verlangsamen und noch mehr Objekte zu entfernen.}{Tippe drauf, um die Zeit zu verlangsamen und noch mehr Objekte zu entfernen.}";
V["de-de"].TutorialText_4="Das ist eine Bombe. #touch{Klicke auf die Bombe, um Objekte in ihrem Umkreis wegzusprengen.}{Tippe auf die Bombe, um Objekte in ihrem Umkreis wegzusprengen.}";V["de-de"].TutorialText_5="Das sind Farbbomben. #touch{Klicke auf eine Farbbombe, um alle Objekte dieser Farbe zu entfernen.}{Tippe auf eine Farbbombe, um alle Objekte dieser Farbe zu entfernen.}";V["de-de"].TutorialText_6="Das ist ein Mischer-Extra. #touch{Klicke auf das Mischer-Extra, um Objekte in gr\u00f6\u00dfere Gruppen zusammenzufassen.}{Tippe auf das Mischer-Extra, um Objekte in gr\u00f6\u00dfere Gruppen zusammenzufassen.}";
V["de-de"].TutorialTitle_0="So wird gespielt";V["de-de"].TutorialTitle_1="Entwicklung";V["de-de"].TutorialTitle_3="Extras";V["de-de"].TutorialTitle_4="Extras";V["de-de"].TutorialTitle_5="Extras";V["de-de"].TutorialTitle_6="Extras";V["de-de"].bl_assignment_header="Bereit?";V["de-de"].bl_assignment="#touch{Klicke auf Dreiergruppen, um sie zu entfernen.}{Tippe auf Dreiergruppen, um sie zu entfernen.}";V["de-de"].bl_stage="Stufe";V["de-de"].bl_nice="Toll!";V["de-de"].bl_great="Super!";
V["de-de"].bl_awesome="Fantastisch!";V["de-de"].bl_gameover="ENDE!";V["de-de"].bl_screencleared="GESCHAFFT!";V["de-de"].TutorialText_2="#touch{Um eine neue Reihe zu erzwingen, kannst du draufklicken oder die Leertaste dr\u00fccken.}{Um eine neue Reihe zu erzwingen, tippst du darauf.}";V["de-de"].TutorialTitle_2="Neue Reihe";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].TutorialText_0="#touch{Cliquez sur les groupes d'au moins 3 objets de la m\u00eame couleur.}{Touchez les groupes d'au moins 3 objets de la m\u00eame couleur.}";
V["fr-fr"].TutorialText_1="#touch{En cliquant sur les groupes de couleur, vous les faites dispara\u00eetre et gagnez des points.}{En touchant les groupes de couleur, vous les faites dispara\u00eetre et gagnez des points.}";V["fr-fr"].TutorialText_3="Ceci est un bonus de ralentissement : il appara\u00eet lorsque vous \u00eates sur le point de perdre. #touch{En cliquant dessus, le temps est ralenti. Vous pouvez alors supprimer plus d'objets.}{En le touchant, le temps est ralenti. Vous pouvez alors supprimer plus d'objets.]";
V["fr-fr"].TutorialText_4="Ceci est une bombe. #touch{Cliquez sur la bombe pour faire exploser tous les objets alentour.}{Touchez la bombe pour faire exploser tous les objets alentour.}";V["fr-fr"].TutorialText_5="Voici des bombes de couleur. #touch{Cliquez sur une bombe de couleur pour supprimer tous les objets de la couleur correspondante.}{Touchez une bombe de couleur pour supprimer tous les objets de la couleur correspondante.}";V["fr-fr"].TutorialText_6="Ceci est un bonus de tri. #touch{Cliquez sur le bonus de tri pour cr\u00e9er de gros groupes de m\u00eame couleur.}{Touchez le bonus de tri pour cr\u00e9er de gros groupes de m\u00eame couleur.}";
V["fr-fr"].TutorialTitle_0="Comment jouer";V["fr-fr"].TutorialTitle_1="Progression";V["fr-fr"].TutorialTitle_3="Bonus";V["fr-fr"].TutorialTitle_4="Bonus";V["fr-fr"].TutorialTitle_5="Bonus";V["fr-fr"].TutorialTitle_6="Bonus";V["fr-fr"].bl_assignment_header="Pr\u00eat ?";V["fr-fr"].bl_assignment="#touch{Cliquez sur les groupes de 3 pour les supprimer.}{Touchez les groupes de 3 pour les supprimer.}";V["fr-fr"].bl_stage="Sc\u00e8ne";V["fr-fr"].bl_nice="Joli !";V["fr-fr"].bl_great="G\u00e9nial !";
V["fr-fr"].bl_awesome="Excellent !";V["fr-fr"].bl_gameover="Partie termin\u00e9e";V["fr-fr"].bl_screencleared="\u00c9cran nettoy\u00e9 !";V["fr-fr"].TutorialText_2="#touch{Pour forcer l'apparition d'une nouvelle ligne, cliquez dessus ou appuyez sur Espace.}{Pour forcer l'apparition d'une nouvelle ligne, touchez-la.}";V["fr-fr"].TutorialTitle_2="Nouvelle ligne";V["pt-br"]=V["pt-br"]||{};V["pt-br"].TutorialText_0="#touch{Clique em grupos de 3 ou mais objetos da mesma cor.}{Toque em grupos de 3 ou mais objetos da mesma cor.}";
V["pt-br"].TutorialText_1="#touch{Fa\u00e7a pontos clicando em grupos, para remov\u00ea-los.}{Fa\u00e7a pontos tocando em grupos, para remov\u00ea-los.}";V["pt-br"].TutorialText_3="Este \u00e9 o refor\u00e7o de congelamento, que aparece quando a partida est\u00e1 pr\u00f3xima do fim. #touch{Clique nele para desacelerar o tempo, podendo remover mais objetos.}{Toque nele, para desacelerar o tempo, podendo remover mais objetos.}";V["pt-br"].TutorialText_4="Esta \u00e9 a bomba. #touch{Clique na bomba para explodir os objetos ao redor dela.}{Toque na bomba para explodir os objetos ao redor dela.}";
V["pt-br"].TutorialText_5="Estas s\u00e3o bombas de cor. #touch{Clique na bomba de cor para remover todos os objetos da mesma cor.}{Toque na bomba de cor para remover todos os objetos da mesma cor.}";V["pt-br"].TutorialText_6="Este \u00e9 o refor\u00e7o de mistura. #touch{Clique no refor\u00e7o de mistura para embaralhar os objetos em grupos maiores.}{Toque no refor\u00e7o de mistura para embaralhar os objetos em grupos maiores.}";V["pt-br"].TutorialTitle_0="Como jogar";
V["pt-br"].TutorialTitle_1="Progresso";V["pt-br"].TutorialTitle_3="Refor\u00e7os";V["pt-br"].TutorialTitle_4="Refor\u00e7os";V["pt-br"].TutorialTitle_5="Refor\u00e7os";V["pt-br"].TutorialTitle_6="Refor\u00e7os";V["pt-br"].bl_assignment_header="Pronto?";V["pt-br"].bl_assignment="#touch{Clique em grupos de 3 para remov\u00ea-los.}{Toque em grupos de 3 para remov\u00ea-los.}";V["pt-br"].bl_stage="Fase";V["pt-br"].bl_nice="Legal!";V["pt-br"].bl_great="\u00d3timo!";V["pt-br"].bl_awesome="Incr\u00edvel!";
V["pt-br"].bl_gameover="Fim do jogo";V["pt-br"].bl_screencleared="Voc\u00ea detonou a tela!";V["pt-br"].TutorialText_2="#touch{Para for\u00e7ar uma nova linha, clique nela ou pressione a barra de espa\u00e7o.}{Toque na linha para for\u00e7ar uma nova.}";V["pt-br"].TutorialTitle_2="Nova linha";V["es-es"]=V["es-es"]||{};V["es-es"].TutorialText_0="#touch{Haz clic en grupos de 3 objetos del mismo color o m\u00e1s.}{Toca grupos de 3 objetos del mismo color o m\u00e1s.}";V["es-es"].TutorialText_1="#touch{Al eliminar grupos haciendo clic en ellos ganas puntos.}{Al eliminar grupos toc\u00e1ndolos ganas puntos.}";
V["es-es"].TutorialText_3="Este potenciador congelante aparece cuando el juego casi ha terminado. #touch{Haz clic en \u00e9l para ralentizar el tiempo y as\u00ed poder eliminar m\u00e1s objetos.}{T\u00f3calo para ralentizar el tiempo y as\u00ed poder eliminar m\u00e1s objetos.}";V["es-es"].TutorialText_4="Esto es una bomba. #touch{Haz clic en ella para volar los objetos que la rodean.}{T\u00f3cala para volar los objetos que la rodean.}";V["es-es"].TutorialText_5="Estas son bombas de color. #touch{Haz clic en una para eliminar todos los objetos de ese color.}{Toca una para eliminar todos los objetos de ese color.}";
V["es-es"].TutorialText_6="Esto es un mezclador. #touch{Haz clic en \u00e9l para ordenar los objetos en grupos grandes.}{T\u00f3calo para ordenar los objetos en grupos grandes.}";V["es-es"].TutorialTitle_0="C\u00f3mo jugar";V["es-es"].TutorialTitle_1="Progreso";V["es-es"].TutorialTitle_3="Potenciadores";V["es-es"].TutorialTitle_4="Potenciadores";V["es-es"].TutorialTitle_5="Potenciadores";V["es-es"].TutorialTitle_6="Potenciadores";V["es-es"].bl_assignment_header="\u00bfListos?";
V["es-es"].bl_assignment="#touch{Haz clic en grupos de 3 para eliminarlos.}{Toca grupos de 3 para eliminarlos.}";V["es-es"].bl_stage="Fase";V["es-es"].bl_nice="\u00a1Mola!";V["es-es"].bl_great="\u00a1Genial!";V["es-es"].bl_awesome="\u00a1Qu\u00e9 pasada!";V["es-es"].bl_gameover="Fin del juego";V["es-es"].bl_screencleared="\u00a1Nivel superado!";V["es-es"].TutorialText_2="#touch{Para forzar una nueva l\u00ednea, haz clic en ella o pulsa espacio.}{Para forzar una nueva l\u00ednea, t\u00f3cala.}";
V["es-es"].TutorialTitle_2="Nueva fila";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].TutorialText_0="#touch{Ayn\u0131 renkten 3 veya daha fazla objeye t\u0131kla.}{Ayn\u0131 renkten 3 veya daha fazla objeye dokun.}";V["tr-tr"].TutorialText_1="#touch{Gruplar\u0131 \u00fcstlerine t\u0131klayarak kald\u0131rmak puan kazand\u0131r\u0131r.}{Gruplar\u0131 \u00fcstlerine dokunarak kald\u0131rmak puan kazand\u0131r\u0131r.}";V["tr-tr"].TutorialText_3="Bu bir donma deste\u011fi ve oyun bitmek \u00fczereyken \u00e7\u0131kar. #touch{Daha fazla obje kald\u0131rma \u015fans\u0131d\u0131r ve zaman\u0131 yava\u015flatmak i\u00e7in \u00fcst\u00fcne t\u0131kla.}{Daha fazla obje kald\u0131rma \u015fans\u0131d\u0131r ve zaman\u0131 yava\u015flatmak i\u00e7in \u00fcst\u00fcne dokun.}";
V["tr-tr"].TutorialText_4="Bu bir bombad\u0131r. #touch{Etraf\u0131ndaki objeleri patlatmak i\u00e7in bombaya t\u0131kla.}{Etraf\u0131ndaki objeleri patlatmak i\u00e7in bombaya dokun.}";V["tr-tr"].TutorialText_5="Bunlar renkli bombalard\u0131r. #touch{Ayn\u0131 renkten objeleri kald\u0131rmak i\u00e7in renk bombas\u0131na t\u0131kla.}{Ayn\u0131 renkten objeleri kald\u0131rmak i\u00e7in renk bombas\u0131na dokun.}";V["tr-tr"].TutorialText_6="Bu kar\u0131\u015ft\u0131rma deste\u011fidir. #touch{Objeleri daha b\u00fcy\u00fck gruplar halinde d\u00fczenlemek i\u00e7in kar\u0131\u015ft\u0131rma deste\u011fine t\u0131kla.}{Objeleri daha b\u00fcy\u00fck gruplar halinde d\u00fczenlemek i\u00e7in kar\u0131\u015ft\u0131rma deste\u011fine dokun.}";
V["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";V["tr-tr"].TutorialTitle_1="\u0130lerleme";V["tr-tr"].TutorialTitle_3="Destekler";V["tr-tr"].TutorialTitle_4="Destekler";V["tr-tr"].TutorialTitle_5="Destekler";V["tr-tr"].TutorialTitle_6="Destekler";V["tr-tr"].bl_assignment_header="Haz\u0131r m\u0131s\u0131n?";V["tr-tr"].bl_assignment="#touch{Kald\u0131rmak i\u00e7in 3'l\u00fc gruplara t\u0131kla}{Kald\u0131rmak i\u00e7in 3'l\u00fc gruplara dokun}";V["tr-tr"].bl_stage="B\u00f6l\u00fcm";
V["tr-tr"].bl_nice="G\u00fczel!";V["tr-tr"].bl_great="Harika!";V["tr-tr"].bl_awesome="Muhte\u015fem!";V["tr-tr"].bl_gameover="Oyun bitti";V["tr-tr"].bl_screencleared="Ekran temizlendi!";V["tr-tr"].TutorialText_2="#touch{Bir s\u0131ray\u0131 zorlamak i\u00e7in \u00fcst\u00fcne t\u0131kla ya da bo\u015fluk tu\u015funa bas.}{Yeni s\u0131ray\u0131 zorlamak i\u00e7in \u00fcst\u00fcne dokun.}";V["tr-tr"].TutorialTitle_2="Yeni s\u0131ra";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].TutorialText_0="#touch{\u0429\u0435\u043b\u043a\u0430\u0439\u0442\u0435 \u043f\u043e \u0433\u0440\u0443\u043f\u043f\u0430\u043c \u0438\u0437 3 \u0438\u043b\u0438 \u0431\u043e\u043b\u0435\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430.}{\u041a\u0430\u0441\u0430\u0439\u0442\u0435\u0441\u044c \u0433\u0440\u0443\u043f\u043f \u0438\u0437 3 \u0438\u043b\u0438 \u0431\u043e\u043b\u0435\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430.}";
V["ru-ru"].TutorialText_1="#touch{\u0423\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0433\u0440\u0443\u043f\u043f\u044b \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432, \u0449\u0435\u043b\u043a\u0430\u044f \u043f\u043e \u043d\u0438\u043c, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043e\u0447\u043a\u0438.}{\u0423\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0433\u0440\u0443\u043f\u043f\u044b \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432, \u043a\u0430\u0441\u0430\u044f\u0441\u044c \u0438\u0445, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043e\u0447\u043a\u0438.}";
V["ru-ru"].TutorialText_3="\u042d\u0442\u043e \u0437\u0430\u043c\u043e\u0440\u043e\u0437\u043a\u0430, \u043e\u043d\u0430 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043f\u0435\u0440\u0435\u0434 \u0441\u0430\u043c\u044b\u043c \u043a\u043e\u043d\u0446\u043e\u043c \u0438\u0433\u0440\u044b. #touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u043c\u0435\u0434\u043b\u0438\u0442\u044c \u0432\u0440\u0435\u043c\u044f \u0438 \u0443\u0431\u0440\u0430\u0442\u044c \u043f\u043e\u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432.}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0435\u0435, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u043c\u0435\u0434\u043b\u0438\u0442\u044c \u0432\u0440\u0435\u043c\u044f \u0438 \u0443\u0431\u0440\u0430\u0442\u044c \u043f\u043e\u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432.}";
V["ru-ru"].TutorialText_4="\u042d\u0442\u043e \u0431\u043e\u043c\u0431\u0430. #touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u0432\u0437\u043e\u0440\u0432\u0430\u0442\u044c \u0441\u043e\u0441\u0435\u0434\u043d\u0438\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0435\u0435, \u0447\u0442\u043e\u0431\u044b \u0432\u0437\u043e\u0440\u0432\u0430\u0442\u044c \u0441\u043e\u0441\u0435\u0434\u043d\u0438\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.}";
V["ru-ru"].TutorialText_5="\u042d\u0442\u043e \u0446\u0432\u0435\u0442\u043d\u044b\u0435 \u0431\u043e\u043c\u0431\u044b. #touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u0446\u0432\u0435\u0442\u043d\u043e\u0439 \u0431\u043e\u043c\u0431\u0435, \u0447\u0442\u043e\u0431\u044b \u0443\u0431\u0440\u0430\u0442\u044c \u0432\u0441\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u0442\u043e\u0433\u043e \u0436\u0435 \u0446\u0432\u0435\u0442\u0430.}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0446\u0432\u0435\u0442\u043d\u043e\u0439 \u0431\u043e\u043c\u0431\u044b, \u0447\u0442\u043e\u0431\u044b \u0443\u0431\u0440\u0430\u0442\u044c \u0432\u0441\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u0442\u043e\u0433\u043e \u0436\u0435 \u0446\u0432\u0435\u0442\u0430.}";
V["ru-ru"].TutorialText_6="\u042d\u0442\u043e \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u043a\u0430. #touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u043e\u0431\u044a\u0435\u0434\u0438\u043d\u0438\u0442\u044c \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u0432 \u0431\u043e\u043b\u0435\u0435 \u043a\u0440\u0443\u043f\u043d\u044b\u0435 \u0433\u0440\u0443\u043f\u043f\u044b.}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0435\u0435, \u0447\u0442\u043e\u0431\u044b \u043e\u0431\u044a\u0435\u0434\u0438\u043d\u0438\u0442\u044c \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u0432 \u0431\u043e\u043b\u0435\u0435 \u043a\u0440\u0443\u043f\u043d\u044b\u0435 \u0433\u0440\u0443\u043f\u043f\u044b.}";
V["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";V["ru-ru"].TutorialTitle_1="\u0425\u043e\u0434 \u0438\u0433\u0440\u044b";V["ru-ru"].TutorialTitle_3="\u0411\u043e\u043d\u0443\u0441\u044b";V["ru-ru"].TutorialTitle_4="\u0411\u043e\u043d\u0443\u0441\u044b";V["ru-ru"].TutorialTitle_5="\u0411\u043e\u043d\u0443\u0441\u044b";V["ru-ru"].TutorialTitle_6="\u0411\u043e\u043d\u0443\u0441\u044b";V["ru-ru"].bl_assignment_header="\u0413\u043e\u0442\u043e\u0432\u044b?";
V["ru-ru"].bl_assignment="#touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u0433\u0440\u0443\u043f\u043f\u0435 \u0438\u0437 3 \u043e\u0431\u044a\u0435\u043a\u0442\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u0435\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0433\u0440\u0443\u043f\u043f\u044b \u0438\u0437 3 \u043e\u0431\u044a\u0435\u043a\u0442\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u0435\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c}";
V["ru-ru"].bl_stage="\u042d\u0442\u0430\u043f";V["ru-ru"].bl_nice="\u0417\u0434\u043e\u0440\u043e\u0432\u043e!";V["ru-ru"].bl_great="\u041e\u0442\u043b\u0438\u0447\u043d\u043e!";V["ru-ru"].bl_awesome="\u041a\u0440\u0443\u0442\u043e!";V["ru-ru"].bl_gameover="\u041a\u043e\u043d\u0435\u0446 \u0438\u0433\u0440\u044b";V["ru-ru"].bl_screencleared="\u0413\u043e\u0442\u043e\u0432\u043e!";V["ru-ru"].TutorialText_2="#touch{\u0427\u0442\u043e\u0431\u044b \u0432\u044b\u0432\u0435\u0441\u0442\u0438 \u043d\u043e\u0432\u044b\u0439 \u0440\u044f\u0434, \u0449\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043f\u043e \u043d\u0435\u043c\u0443 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u0435\u043b.}{\u0427\u0442\u043e\u0431\u044b \u0432\u044b\u0432\u0435\u0441\u0442\u0438 \u043d\u043e\u0432\u044b\u0439 \u0440\u044f\u0434, \u043a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c \u0435\u0433\u043e.}";
V["ru-ru"].TutorialTitle_2="\u041d\u043e\u0432\u044b\u0439 \u0440\u044f\u0434";V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].TutorialText_0="#touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b\u0629 \u0643\u0627\u0626\u0646\u0627\u062a \u0623\u0648 \u0623\u0643\u062b\u0631 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.}{\u0627\u0644\u0645\u0633 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b\u0629 \u0643\u0627\u0626\u0646\u0627\u062a \u0623\u0648 \u0623\u0643\u062b\u0631 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.}";
V["ar-eg"].TutorialText_1="#touch{\u0633\u062a\u0633\u0627\u0639\u062f\u0643 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0639\u0646 \u0637\u0631\u064a\u0642 \u0627\u0644\u0646\u0642\u0631 \u0641\u0648\u0642\u0647\u0627 \u0639\u0644\u0649 \u0643\u0633\u0628 \u0646\u0642\u0627\u0637.}{\u0633\u062a\u0633\u0627\u0639\u062f\u0643 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0639\u0646 \u0637\u0631\u064a\u0642 \u0644\u0645\u0633\u0647\u0627 \u0639\u0644\u0649 \u0643\u0633\u0628 \u0646\u0642\u0627\u0637.}";
V["ar-eg"].TutorialText_3="\u0647\u0630\u0647 \u0645\u064a\u0632\u0629 \u0627\u0644\u062a\u062c\u0645\u064a\u062f \u0627\u0644\u0645\u0639\u0632\u0632\u0629, \u0648\u0627\u0644\u062a\u064a \u062a\u0638\u0647\u0631 \u0639\u0646\u062f\u0645\u0627 \u062a\u0648\u0634\u0643 \u0627\u0644\u0644\u0639\u0628\u0629 \u0639\u0644\u0649 \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621. #touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642\u0647\u0627 \u0644\u0625\u0628\u0637\u0627\u0621 \u0627\u0644\u0648\u0642\u062a\u060c \u0645\u0645\u0627 \u064a\u0639\u0637\u064a\u0643 \u0641\u0631\u0635\u0629\u064b \u0644\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a.}{\u0627\u0644\u0645\u0633\u0647\u0627 \u0644\u0625\u0628\u0637\u0627\u0621 \u0627\u0644\u0648\u0642\u062a\u060c \u0645\u0645\u0627 \u064a\u0639\u0637\u064a\u0643 \u0641\u0631\u0635\u0629\u064b \u0644\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a.}";
V["ar-eg"].TutorialText_4="\u0647\u0630\u0647 \u0642\u0646\u0628\u0644\u0629. #touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0627\u0644\u0642\u0646\u0628\u0644\u0629 \u0644\u062a\u0641\u062c\u064a\u0631 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0645\u062d\u064a\u0637\u0629.}{\u0627\u0644\u0645\u0633 \u0627\u0644\u0642\u0646\u0628\u0644\u0629 \u0644\u062a\u0641\u062c\u064a\u0631 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0645\u062d\u064a\u0637\u0629.}";
V["ar-eg"].TutorialText_5="\u0647\u0630\u0647 \u0642\u0646\u0627\u0628\u0644 \u0627\u0644\u0644\u0648\u0646. #touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0642\u0646\u0628\u0644\u0629 \u0627\u0644\u0644\u0648\u0646 \u0644\u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u0644\u0647\u0627 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.}{\u0627\u0644\u0645\u0633 \u0642\u0646\u0628\u0644\u0629 \u0627\u0644\u0644\u0648\u0646 \u0644\u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u0644\u0647\u0627 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.}";
V["ar-eg"].TutorialText_6="\u0647\u0630\u0647 \u0645\u064a\u0632\u0629 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0645\u0639\u0632\u0632\u0629. #touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0645\u064a\u0632\u0629 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0644\u0641\u0631\u0632 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0641\u064a \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0623\u0643\u0628\u0631.}{\u0627\u0644\u0645\u0633 \u0645\u064a\u0632\u0629 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0644\u0641\u0631\u0632 \u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0641\u064a \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0623\u0643\u0628\u0631.}";
V["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";V["ar-eg"].TutorialTitle_1="\u0627\u0644\u062a\u0642\u062f\u0645";V["ar-eg"].TutorialTitle_3="\u0645\u064a\u0632\u0627\u062a";V["ar-eg"].TutorialTitle_4="\u0645\u064a\u0632\u0627\u062a";V["ar-eg"].TutorialTitle_5="\u0645\u064a\u0632\u0627\u062a";V["ar-eg"].TutorialTitle_6="\u0645\u064a\u0632\u0627\u062a";V["ar-eg"].bl_assignment_header="\u062c\u0627\u0647\u0632\u061f";V["ar-eg"].bl_assignment="#touch{\u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b \u0641\u0642\u0627\u0639\u0627\u062a \u0644\u0625\u0632\u0627\u0644\u062a\u0647\u0627}{\u0627\u0644\u0645\u0633 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b \u0641\u0642\u0627\u0639\u0627\u062a \u0644\u0625\u0632\u0627\u0644\u062a\u0647\u0627}";
V["ar-eg"].bl_stage="\u0627\u0644\u0645\u0631\u062d\u0644\u0629";V["ar-eg"].bl_nice="\u062c\u064a\u062f!";V["ar-eg"].bl_great="\u0639\u0638\u064a\u0645!";V["ar-eg"].bl_awesome="\u0631\u0627\u0626\u0639!";V["ar-eg"].bl_gameover="\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u0644\u0639\u0628\u0629";V["ar-eg"].bl_screencleared="\u062a\u0645 \u0625\u062e\u0644\u0627\u0621 \u0627\u0644\u0634\u0627\u0634\u0629!";V["ar-eg"].TutorialText_2="#touch{\u0644\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0635\u0641 \u062c\u062f\u064a\u062f, \u0627\u0646\u0642\u0631 \u0641\u0648\u0642\u0647 \u0623\u0648 \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0645\u0633\u0627\u0641\u0629.}{\u0644\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0635\u0641 \u062c\u062f\u064a\u062f, \u0627\u0644\u0645\u0633\u0647 .}";
V["ar-eg"].TutorialTitle_2="\u0635\u0641 \u062c\u062f\u064a\u062f";V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].TutorialText_0="#touch{\uac19\uc740 \uc0c9\uc744 3\uac1c \uc774\uc0c1 \uadf8\ub8f9\uc73c\ub85c \ud074\ub9ad\ud569\ub2c8\ub2e4.}{\uac19\uc740 \uc0c9\uc744 3\uac1c \uc774\uc0c1 \uadf8\ub8f9\uc73c\ub85c \ud0ed\ud569\ub2c8\ub2e4.}";V["ko-kr"].TutorialText_1="#touch{\uadf8\ub8f9\uc744 \ud074\ub9ad\ud574 \uc81c\uac70\ud558\uba74 \uc810\uc218\ub97c \ud68d\ub4dd\ud569\ub2c8\ub2e4.}{\uadf8\ub8f9\uc744 \ub20c\ub7ec \uc81c\uac70\ud558\uba74 \uc810\uc218\ub97c \ud68d\ub4dd\ud569\ub2c8\ub2e4.}";
V["ko-kr"].TutorialText_3="\uac8c\uc784\uc774 \uac70\uc758 \ub05d\ub0a0 \ub54c \ub098\ud0c0\ub098\ub294 \uace0\uc815 \ubd80\uc2a4\ud2b8\uc785\ub2c8\ub2e4. #touch{\ubd80\uc2a4\ud2b8\ub97c \ud074\ub9ad\ud558\uba74 \uc2dc\uac04\uc774 \ub290\ub9ac\uac8c \ud758\ub7ec \ub354 \ub9ce\uc774 \uc81c\uac70\ud560 \uc218 \uc788\uac8c \ud569\ub2c8\ub2e4.}{\ubd80\uc2a4\ud2b8\ub97c \ub204\ub974\uba74 \uc2dc\uac04\uc774 \ub290\ub9ac\uac8c \ud758\ub7ec \ub354 \ub9ce\uc774 \uc81c\uac70\ud560 \uc218 \uc788\uac8c \ud569\ub2c8\ub2e4}";
V["ko-kr"].TutorialText_4="\ud3ed\ud0c4\uc785\ub2c8\ub2e4. #touch{\ud3ed\ud0c4\uc744 \ud074\ub9ad\ud558\uba74 \uc8fc\uc704\ub97c \ud3ed\ud30c\uc2dc\ud0b5\ub2c8\ub2e4.}{\ud3ed\ud0c4\uc744 \ub204\ub974\uba74 \uc8fc\uc704\ub97c \ud3ed\ud30c\uc2dc\uc2ed\ub2c8\ub2e4.}";V["ko-kr"].TutorialText_5="\uc0c9\uae54 \ud3ed\ud0c4\uc785\ub2c8\ub2e4. #touch{\uc0c9\uae54 \ud3ed\ud0c4\uc744 \ud074\ub9ad\ud558\uba74 \uac19\uc740 \uc0c9\uc744 \ubaa8\ub450 \uc81c\uac70\ud569\ub2c8\ub2e4.}{\uc0c9\uae54 \ud3ed\ud0c4\uc744 \ub204\ub974\uba74 \uac19\uc740 \uc0c9\uc744 \ubaa8\ub450 \uc81c\uac70\ud569\ub2c8\ub2e4.}";
V["ko-kr"].TutorialText_6="\uc154\ud50c \ubd80\uc2a4\ud2b8\uc785\ub2c8\ub2e4. #touch{\uc154\ud50c \ubd80\uc2a4\ud2b8\ub97c \ud074\ub9ad\ud558\uba74 \ub354 \ud070 \uadf8\ub8f9\uc73c\ub85c \uc815\ub82c\ud569\ub2c8\ub2e4.}{\uc154\ud50c \ubd80\uc2a4\ud2b8\ub97c \ub204\ub974\uba74 \ub354 \ud070 \uadf8\ub8f9\uc73c\ub85c \uc815\ub82c\ud569\ub2c8\ub2e4.}";V["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";V["ko-kr"].TutorialTitle_1="\uc9c4\ud589";V["ko-kr"].TutorialTitle_3="\ubd80\uc2a4\ud2b8";
V["ko-kr"].TutorialTitle_4="\ubd80\uc2a4\ud2b8";V["ko-kr"].TutorialTitle_5="\ubd80\uc2a4\ud2b8";V["ko-kr"].TutorialTitle_6="\ubd80\uc2a4\ud2b8";V["ko-kr"].bl_assignment_header="\uc900\ube44\ub410\ub098\uc694?";V["ko-kr"].bl_assignment="#touch{3\uac1c \uadf8\ub8f9\uc744 \ud074\ub9ad\ud558\uc5ec \uc81c\uac70\ud569\ub2c8\ub2e4}{3\uac1c \uadf8\ub8f9\uc744 \ub20c\ub7ec \uc81c\uac70\ud569\ub2c8\ub2e4}";V["ko-kr"].bl_stage="Stage";V["ko-kr"].bl_nice="\uc88b\uc544\uc694!";V["ko-kr"].bl_great="\ud6cc\ub96d\ud574\uc694!";
V["ko-kr"].bl_awesome="\uba4b\uc9c0\uad70\uc694!";V["ko-kr"].bl_gameover="Game over";V["ko-kr"].bl_screencleared="\ud654\uba74 \uc815\ub9ac \uc644\ub8cc!";V["ko-kr"].TutorialText_2="#touch{\uc0c8 \ud589\uc744 \uac15\uc81c \uc2e4\ud589\ud558\ub824\uba74 \ud589\uc744 \ud074\ub9ad\ud558\uac70\ub098 \uc2a4\ud398\uc774\uc2a4 \ubc14\ub97c \ub204\ub974\uc138\uc694.}{\uc0c8 \ud589\uc744 \uac15\uc81c \uc2e4\ud589\ud558\ub824\uba74 \ud589\uc744 \ub204\ub974\uc138\uc694.}";V["ko-kr"].TutorialTitle_2="\uc0c8\ub85c\uc6b4 \ud589";
V["jp-jp"]=V["jp-jp"]||{};V["jp-jp"].TutorialText_0="#touch{3\u3064\u4ee5\u4e0a\u30de\u30c3\u30c1\u3057\u305f\u30d6\u30ed\u30c3\u30af\u3092 \u30af\u30ea\u30c3\u30af\u3057\u3066\u306d\u3002}{3\u3064\u4ee5\u4e0a\u30de\u30c3\u30c1\u3057\u305f\u30d6\u30ed\u30c3\u30af\u3092 \u30bf\u30c3\u30d7\u3057\u3066\u306d\u3002}";V["jp-jp"].TutorialText_1="#touch{\u30af\u30ea\u30c3\u30af\u3057\u3066\u30d6\u30ed\u30c3\u30af\u3092\u6d88\u3059\u3068 \u30dd\u30a4\u30f3\u30c8\u30b2\u30c3\u30c8\u3002}{\u30bf\u30c3\u30d7\u3057\u3066\u30d6\u30ed\u30c3\u30af\u3092\u6d88\u3059\u3068 \u30dd\u30a4\u30f3\u30c8\u30b2\u30c3\u30c8\u3002}";
V["jp-jp"].TutorialText_3="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc\u304c\u8fd1\u304f\u306a\u308b\u3068 \u51fa\u73fe\u3059\u308b\u30d5\u30ea\u30fc\u30ba\u30d6\u30ed\u30c3\u30af\u3002  #touch{\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068 \u30b2\u30fc\u30e0\u306e\u30b9\u30d4\u30fc\u30c9\u304c\u9045\u304f\u306a\u308a\u307e\u3059\u3002}{\u30bf\u30c3\u30d7\u3059\u308b\u3068 \u30b2\u30fc\u30e0\u306e\u30b9\u30d4\u30fc\u30c9\u304c\u9045\u304f\u306a\u308a\u307e\u3059\u3002}";V["jp-jp"].TutorialText_4="\u7206\u5f3e\u30d6\u30ed\u30c3\u30af\u3002  #touch{\u30af\u30ea\u30c3\u30af\u3057\u3066 \u307e\u308f\u308a\u306e\u30d6\u30ed\u30c3\u30af\u3092\u5439\u304d\u98db\u3070\u305b\uff01}{\u30bf\u30c3\u30d7\u3057\u3066 \u307e\u308f\u308a\u306e\u30d6\u30ed\u30c3\u30af\u3092\u5439\u304d\u98db\u3070\u305b\uff01}";
V["jp-jp"].TutorialText_5="\u30ab\u30e9\u30d5\u30eb\u7206\u5f3e\u30d6\u30ed\u30c3\u30af\u3002  #touch{\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068 \u540c\u3058\u8272\u306e\u30d6\u30ed\u30c3\u30af\u3092\u3059\u3079\u3066\u6d88\u305b\u307e\u3059\u3002}{\u30bf\u30c3\u30d7\u3059\u308b\u3068 \u540c\u3058\u8272\u306e\u30d6\u30ed\u30c3\u30af\u3092\u3059\u3079\u3066\u6d88\u305b\u307e\u3059\u3002}";V["jp-jp"].TutorialText_6="\u30b7\u30e3\u30c3\u30d5\u30eb\u30d6\u30ed\u30c3\u30af\u3002  #touch{\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068 \u30d6\u30ed\u30c3\u30af\u3092\u6d88\u3057\u3084\u3059\u3044\u3088\u3046\u306b \u4e26\u3073\u66ff\u3048\u307e\u3059\u3002}{\u30bf\u30c3\u30d7\u3059\u308b\u3068 \u30d6\u30ed\u30c3\u30af\u3092\u6d88\u3057\u3084\u3059\u3044\u3088\u3046\u306b \u4e26\u3073\u66ff\u3048\u307e\u3059\u3002}";
V["jp-jp"].TutorialTitle_0="\u3042\u305d\u3073\u65b9";V["jp-jp"].TutorialTitle_1="\u30dd\u30a4\u30f3\u30c8";V["jp-jp"].TutorialTitle_3="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";V["jp-jp"].TutorialTitle_4="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";V["jp-jp"].TutorialTitle_5="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";V["jp-jp"].TutorialTitle_6="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";V["jp-jp"].bl_assignment_header="\u6e96\u5099\u306f\u3044\u3044\uff1f";V["jp-jp"].bl_assignment="#touch{3\u3064\u4ee5\u4e0a\u30de\u30c3\u30c1\u3057\u305f\u30d6\u30ed\u30c3\u30af\u3092 \u30af\u30ea\u30c3\u30af\u3057\u3066\u6d88\u3057\u3066\u306d\u3002}{3\u3064\u4ee5\u4e0a\u30de\u30c3\u30c1\u3057\u305f\u30d6\u30ed\u30c3\u30af\u3092 \u30bf\u30c3\u30d7\u3057\u3066\u6d88\u3057\u3066\u306d\u3002}";
V["jp-jp"].bl_stage="\u30b9\u30c6\u30fc\u30b8";V["jp-jp"].bl_nice="Nice!";V["jp-jp"].bl_great="Great!";V["jp-jp"].bl_awesome="Awesome!";V["jp-jp"].bl_gameover="Game over";V["jp-jp"].bl_screencleared="Screen cleared!";V["jp-jp"].TutorialText_2="#touch{\u65e9\u304f\u65b0\u3057\u3044\u5217\u3092\u51fa\u73fe\u3055\u305b\u305f\u3044\u3068\u304d\u306f \u4e00\u756a\u4e0b\u306e\u5217\u3092\u30af\u30ea\u30c3\u30af\u304b \u30b9\u30da\u30fc\u30b9\u30d0\u30fc\u3092\u62bc\u3057\u307e\u3059\u3002}{\u65e9\u304f\u65b0\u3057\u3044\u5217\u3092\u51fa\u73fe\u3055\u305b\u305f\u3044\u3068\u304d\u306f \u4e00\u756a\u4e0b\u306e\u5217\u3092\u30bf\u30c3\u30d7\u3002}";
V["jp-jp"].TutorialTitle_2="\u65b0\u3057\u3044\u5217";window.throbber=new ub("throbber","media/throbber.png");window.TG_StartScreenLogo=new ub("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");var qc=new za("StartTexture",1,"start");window.StartTexture=qc;Aa(qc,0,"media/StartTexture0.png");var rc=new za("StartScreenTexture",1,"load");window.StartScreenTexture=rc;Aa(rc,0,"media/StartScreenTexture0.png");var sc=new za("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=sc;Aa(sc,0,"media/LevelMapScreenTexture0.png");
var tc=new za("LevelEndTexture",2,"load");window.LevelEndTexture=tc;Aa(tc,0,"media/LevelEndTexture0.png");Aa(tc,1,"media/LevelEndTexture1.png");var W=new za("MenuTexture",2,"load");window.MenuTexture=W;Aa(W,0,"media/MenuTexture0.png");Aa(W,1,"media/MenuTexture1.png");var uc=new za("GameTexture",1,"load");window.GameTexture=uc;Aa(uc,0,"media/GameTexture0.png");var vc=new za("GameStaticTexture",2,"load");window.GameStaticTexture=vc;Aa(vc,0,"media/GameStaticTexture0.png");Aa(vc,1,"media/GameStaticTexture1.png");
var wc=new p("s_loadingbar_background",rc,1,42,32,0,0,42,32,1);window.s_loadingbar_background=wc;wc.f(0,0,905,1,42,32,0,0);var xc=new p("s_level_0",sc,1,125,140,0,0,125,140,1);window.s_level_0=xc;xc.f(0,0,129,1,125,140,0,0);var yc=new p("s_level_1",sc,1,125,140,0,0,125,140,1);window.s_level_1=yc;yc.f(0,0,257,1,125,140,0,0);var zc=new p("s_level_2",sc,1,125,140,0,0,125,140,1);window.s_level_2=zc;zc.f(0,0,1,1,125,140,0,0);var Ac=new p("s_level_3",sc,1,125,140,0,0,125,140,1);window.s_level_3=Ac;
Ac.f(0,0,385,1,125,140,0,0);var Bc=new p("s_level_lock",sc,1,48,70,0,0,48,70,1);window.s_level_lock=Bc;Bc.f(0,0,777,113,48,69,0,1);var Cc=new p("s_level_stars",sc,1,126,46,0,0,126,46,1);window.s_level_stars=Cc;Cc.f(0,0,513,1,126,45,0,1);var Dc=new p("s_level2_0",sc,1,84,87,0,0,84,87,1);window.s_level2_0=Dc;Dc.f(0,0,897,97,84,87,0,0);var Ec=new p("s_level2_1",sc,1,84,87,0,0,84,87,1);window.s_level2_1=Ec;Ec.f(0,0,897,1,84,87,0,0);var Fc=new p("s_level2_2",sc,1,84,87,0,0,84,87,1);window.s_level2_2=Fc;
Fc.f(0,0,601,113,84,87,0,0);var Gc=new p("s_level2_3",sc,1,84,87,0,0,84,87,1);window.s_level2_3=Gc;Gc.f(0,0,513,49,84,87,0,0);var Hc=new p("s_level2_arrow_right",sc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=Hc;Hc.f(0,0,833,1,60,108,0,0);Hc.f(1,0,641,1,60,108,0,0);var Ic=new p("s_level2_arrow_left",sc,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=Ic;Ic.f(0,0,705,1,60,108,0,0);Ic.f(1,0,769,1,60,108,0,0);var Jc=new p("s_level2_lock",sc,1,84,87,0,0,84,87,1);window.s_level2_lock=Jc;
Jc.f(0,0,689,113,84,87,0,0);var Kc=new p("s_pop_medal",tc,8,378,378,189,189,3024,378,8);window.s_pop_medal=Kc;Kc.f(0,0,601,1,349,241,3,69);Kc.f(1,0,601,529,346,267,5,54);Kc.f(2,0,601,249,348,276,20,56);Kc.f(3,1,1,1,342,288,26,50);Kc.f(4,1,689,1,319,292,22,46);Kc.f(5,1,1,297,337,304,14,41);Kc.f(6,0,1,681,343,305,12,41);Kc.f(7,1,345,1,341,304,13,41);var Lc=new p("s_medal_shadow",tc,1,195,208,0,0,195,208,1);window.s_medal_shadow=Lc;Lc.f(0,1,745,513,189,204,3,1);
var Mc=new p("s_medal_shine",tc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Mc;Mc.f(0,1,545,513,193,207,1,1);Mc.f(1,1,345,313,193,207,1,1);Mc.f(2,0,353,681,193,207,1,1);Mc.f(3,1,689,297,193,207,1,1);Mc.f(4,0,553,801,193,207,1,1);Mc.f(5,0,753,801,193,207,1,1);var Nc=new p("s_icon_toggle_hard",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Nc;Nc.f(0,0,945,345,67,67,0,0);var Oc=new p("s_icon_toggle_medium",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Oc;Oc.f(0,0,945,417,67,67,0,0);
var Pc=new p("s_icon_toggle_easy",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Pc;Pc.f(0,0,929,489,67,67,0,0);var Qc=new p("s_flagIcon_us",W,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Qc;Qc.f(0,0,929,753,48,36,0,6);var Rc=new p("s_flagIcon_gb",W,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=Rc;Rc.f(0,0,969,673,48,36,0,6);var Sc=new p("s_flagIcon_nl",W,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Sc;Sc.f(0,0,929,713,48,36,0,6);var Tc=new p("s_flagIcon_tr",W,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Tc;
Tc.f(0,0,969,633,48,36,0,6);var Uc=new p("s_flagIcon_de",W,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Uc;Uc.f(0,0,929,793,48,36,0,6);var Vc=new p("s_flagIcon_fr",W,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Vc;Vc.f(0,0,545,809,48,36,0,6);var Wc=new p("s_flagIcon_br",W,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Wc;Wc.f(0,0,769,809,48,36,0,6);var Xc=new p("s_flagIcon_es",W,1,48,48,0,0,48,48,1);window.s_flagIcon_es=Xc;Xc.f(0,0,937,833,48,36,0,6);var Yc=new p("s_flagIcon_jp",W,1,48,48,0,0,48,48,1);
window.s_flagIcon_jp=Yc;Yc.f(0,0,881,833,48,36,0,6);var Zc=new p("s_flagIcon_ru",W,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=Zc;Zc.f(0,0,825,809,48,36,0,6);var $c=new p("s_flagIcon_ar",W,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=$c;$c.f(0,0,713,809,48,36,0,6);var ad=new p("s_flagIcon_kr",W,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=ad;ad.f(0,0,657,809,48,36,0,6);var bd=new p("s_flagIcon_it",W,1,48,48,0,0,48,48,1);window.s_flagIcon_it=bd;bd.f(0,0,601,809,48,36,0,6);
var cd=new p("s_tutorialButton_close",W,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=cd;cd.f(0,0,897,633,65,65,0,0);var dd=new p("s_tutorialButton_next",W,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=dd;dd.f(0,0,929,561,66,65,0,0);var ed=new p("s_tutorialButton_previous",W,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=ed;ed.f(0,0,825,633,66,65,0,0);var fd=new p("s_logo_tinglygames",W,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=fd;fd.f(0,0,593,177,240,240,0,0);
var gd=new p("s_logo_coolgames",W,1,240,240,0,0,240,240,1);window.s_logo_coolgames=gd;gd.f(0,0,593,1,240,167,0,36);var hd=new p("s_logo_tinglygames_start",rc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=hd;hd.f(0,0,585,1,156,53,0,0);var id=new p("s_logo_coolgames_start",rc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=id;id.f(0,0,745,161,150,104,75,0);var jd=new p("s_ui_cup_highscore",uc,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=jd;jd.f(0,0,977,489,32,28,0,0);
var kd=new p("s_ui_cup_score",uc,1,28,24,0,0,28,24,1);window.s_ui_cup_score=kd;kd.f(0,0,993,257,28,24,0,0);var ld=new p("s_ui_endless_progress",uc,1,408,12,0,0,408,12,1);window.s_ui_endless_progress=ld;ld.f(0,0,1,321,408,10,0,1);var md=new p("s_ui_endless_background",uc,1,640,118,0,0,640,118,1);window.s_ui_endless_background=md;md.f(0,0,1,1,640,118,0,0);var nd=new p("s_ui_endless_progress_bonus",uc,1,408,12,0,0,408,12,1);window.s_ui_endless_progress_bonus=nd;nd.f(0,0,1,337,408,10,0,1);
var od=new p("s_ui_heart",uc,1,28,24,0,0,28,24,1);window.s_ui_heart=od;od.f(0,0,993,321,26,23,1,1);var pd=new p("s_ui_crown",uc,1,24,20,0,0,24,20,1);window.s_ui_crown=pd;pd.f(0,0,993,353,24,20,0,0);var qd=new p("s_ui_background_blank",vc,1,640,118,0,0,640,118,1);window.s_ui_background_blank=qd;qd.f(0,1,1,1,640,117,0,0);var rd=new p("s_ui_highscore",vc,1,26,36,13,12,26,36,1);window.s_ui_highscore=rd;rd.f(0,0,905,473,26,36,0,0);var sd=new p("s_circleEffect",uc,1,200,200,100,100,200,200,1);
window.s_circleEffect=sd;sd.f(0,0,801,257,188,188,7,4);var td=new p("s_hinter",uc,1,52,52,26,26,52,52,1);window.s_hinter=td;td.f(0,0,585,433,52,52,0,0);var ud=new p("s_specials",uc,9,56,56,28,28,504,56,9);window.s_specials=ud;ud.f(0,0,745,889,56,56,0,0);ud.f(1,0,809,889,56,56,0,0);ud.f(2,0,65,881,56,56,0,0);ud.f(3,0,417,897,56,56,0,0);ud.f(4,0,881,873,56,56,0,0);ud.f(5,0,945,873,56,56,0,0);ud.f(6,0,161,873,56,56,0,0);ud.f(7,0,1,881,56,56,0,0);ud.f(8,0,681,889,56,56,0,0);
var vd=new p("tutorial_01",vc,1,350,190,0,0,350,190,1);window.tutorial_01=vd;vd.f(0,0,649,353,250,151,48,16);var wd=new p("tutorial_02",vc,1,350,190,0,0,350,190,1);window.tutorial_02=wd;wd.f(0,0,649,185,260,161,48,12);var xd=new p("tutorial_03",vc,1,350,190,0,0,350,190,1);window.tutorial_03=xd;xd.f(0,0,649,1,350,177,0,11);var yd=new p("tutorial_04",vc,1,350,190,0,0,350,190,1);window.tutorial_04=yd;yd.f(0,0,905,377,90,90,130,50);var zd=new p("tutorial_06",vc,1,350,190,0,0,350,190,1);
window.tutorial_06=zd;zd.f(0,0,649,513,173,149,88,22);var Ad=new p("tutorial_05",vc,1,350,190,0,0,350,190,1);window.tutorial_05=Ad;Ad.f(0,0,913,185,91,91,129,49);var Bd=new p("tutorial_07",vc,1,350,190,0,0,350,190,1);window.tutorial_07=Bd;Bd.f(0,0,913,281,91,91,129,49);var Cd=new p("s_effect_blast",uc,7,150,150,75,75,1050,150,7);window.s_effect_blast=Cd;Cd.f(0,0,529,569,141,141,4,4);Cd.f(1,0,169,529,141,141,5,5);Cd.f(2,0,449,713,117,117,17,17);Cd.f(3,0,369,753,71,71,40,40);
Cd.f(4,0,89,809,63,63,44,44);Cd.f(5,0,353,353,69,69,41,41);Cd.f(6,0,993,289,27,27,62,62);var Dd=new p("s_ruby_explosion",uc,6,134,134,67,67,804,134,6);window.s_ruby_explosion=Dd;Dd.f(0,0,449,617,72,72,31,31);Dd.f(1,0,137,673,127,128,4,6);Dd.f(2,0,1,649,134,134,0,0);Dd.f(3,0,809,593,134,134,0,0);Dd.f(4,0,673,593,134,134,0,0);Dd.f(5,0,313,617,134,134,0,0);var Ed=new p("s_effect_drop",uc,6,100,100,50,50,600,100,6);window.s_effect_drop=Ed;Ed.f(0,0,529,489,91,36,5,49);Ed.f(1,0,897,761,88,34,6,51);
Ed.f(2,0,529,529,90,34,5,50);Ed.f(3,0,273,753,90,30,5,47);Ed.f(4,0,897,729,90,29,5,41);Ed.f(5,0,1,785,83,24,9,36);var Fd=new p("s_stars",uc,4,85,85,42,42,340,85,4);window.s_stars=Fd;Fd.f(0,0,897,801,71,69,7,8);Fd.f(1,0,945,593,75,73,5,6);Fd.f(2,0,585,305,61,55,12,15);Fd.f(3,0,481,897,47,47,19,19);var Gd=new p("s_slowmo_frame_t",uc,1,421,70,0,0,421,70,1);window.s_slowmo_frame_t=Gd;Gd.f(0,0,1,121,421,70,0,0);var Hd=new p("s_slowmo_frame_b",uc,1,421,119,0,0,421,119,1);window.s_slowmo_frame_b=Hd;
Hd.f(0,0,1,193,421,119,0,0);var Id=new p("s_slowmo_frame_l",uc,1,51,560,0,0,51,560,1);window.s_slowmo_frame_l=Id;Id.f(0,0,745,1,51,560,0,0);var Jd=new p("s_slowmo_frame_r",uc,1,88,560,0,0,88,560,1);window.s_slowmo_frame_r=Jd;Jd.f(0,0,649,1,88,560,0,0);var Kd=new p("s_effect_floater",uc,12,254,280,127,151,3048,280,12);window.s_effect_floater=Kd;Kd.f(0,0,425,121,201,177,45,62);Kd.f(1,0,1,353,176,146,49,80);Kd.f(2,0,185,353,165,168,53,82);Kd.f(3,0,801,1,207,247,3,33);Kd.f(4,0,425,305,156,177,42,57);
Kd.f(5,0,1,505,166,141,29,91);Kd.f(6,0,353,489,167,121,47,96);Kd.f(7,0,801,449,168,135,23,67);Kd.f(8,0,569,729,112,98,68,93);Kd.f(9,0,273,785,81,76,85,114);Kd.f(10,0,945,673,51,51,103,126);Kd.f(11,0,977,449,37,37,110,133);var Ld=new p("s_icon_toggle_sfx_on",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=Ld;Ld.f(0,0,961,281,49,31,7,17);var Md=new p("s_icon_toggle_sfx_off",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=Md;Md.f(0,0,969,193,53,31,7,17);
var Od=new p("s_icon_toggle_music_on",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=Od;Od.f(0,0,985,713,38,41,13,16);var Pd=new p("s_icon_toggle_music_off",W,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=Pd;Pd.f(0,0,969,233,51,41,8,16);var Qd=new p("s_btn_small_exit",W,2,100,92,0,0,200,92,2);window.s_btn_small_exit=Qd;Qd.f(0,0,233,801,100,92,0,0);Qd.f(1,0,841,345,100,92,0,0);var Rd=new p("s_btn_small_pause",uc,2,100,92,0,0,200,92,2);window.s_btn_small_pause=Rd;
Rd.f(0,0,689,729,100,92,0,0);Rd.f(1,0,793,729,100,92,0,0);var Td=new p("s_btn_small_options",W,2,100,92,0,0,200,92,2);window.s_btn_small_options=Td;Td.f(0,0,825,441,100,92,0,0);Td.f(1,0,825,537,100,92,0,0);var Ud=new p("s_btn_small_retry",tc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=Ud;Ud.f(0,0,353,897,100,92,0,0);Ud.f(1,1,889,297,100,92,0,0);var Vd=new p("s_btn_standard",W,2,96,92,0,0,192,92,2);window.s_btn_standard=Vd;Vd.f(0,0,337,801,96,92,0,0);Vd.f(1,0,441,809,96,92,0,0);
var Wd=new p("s_btn_toggle",W,2,162,92,0,0,324,92,2);window.s_btn_toggle=Wd;Wd.f(0,0,841,97,162,92,0,0);Wd.f(1,0,841,1,162,92,0,0);var Xd=new p("s_icon_toggle_fxoff",W,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=Xd;Xd.f(0,0,593,425,227,92,0,0);Xd.f(1,0,233,705,227,92,0,0);var Yd=new p("s_icon_toggle_fxon",W,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=Yd;Yd.f(0,0,593,521,227,92,0,0);Yd.f(1,0,593,617,227,92,0,0);var Zd=new p("s_icon_toggle_musicoff",W,2,227,92,0,0,454,92,2);
window.s_icon_toggle_musicoff=Zd;Zd.f(0,0,1,705,227,92,0,0);Zd.f(1,0,465,713,227,92,0,0);var $d=new p("s_icon_toggle_musicon",W,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=$d;$d.f(0,0,697,713,227,92,0,0);$d.f(1,0,1,801,227,92,0,0);var ae=new p("s_btn_big_start",tc,2,154,152,0,0,308,152,2);window.s_btn_big_start=ae;ae.f(0,1,321,689,154,152,0,0);ae.f(1,1,161,609,154,152,0,0);var be=new p("s_btn_bigtext",rc,2,153,152,0,0,306,152,2);window.s_btn_bigtext=be;be.f(0,0,745,1,153,152,0,0);
be.f(1,0,585,57,153,152,0,0);var ce=new p("s_btn_big_restart",tc,2,154,152,0,0,308,152,2);window.s_btn_big_restart=ce;ce.f(0,1,345,529,154,152,0,0);ce.f(1,1,1,609,154,152,0,0);var de=new p("s_overlay_assignment",vc,1,575,629,0,0,575,629,1);window.s_overlay_assignment=de;de.f(0,1,1,121,575,629,0,0);var ee=new p("s_overlay_options",W,1,583,702,0,0,583,702,1);window.s_overlay_options=ee;ee.f(0,0,1,1,583,702,0,0);var fe=new p("s_screen_start",qc,1,640,960,0,0,640,960,1);window.s_screen_start=fe;
fe.f(0,0,1,1,640,960,0,0);var ge=new p("s_tutorial",W,1,524,562,0,0,524,562,1);window.s_tutorial=ge;ge.f(0,1,1,1,524,562,0,0);var he=new p("s_overlay_endless",tc,1,592,678,0,0,592,678,1);window.s_overlay_endless=he;he.f(0,0,1,1,592,678,0,0);var ie=new p("s_background",vc,1,640,960,0,0,640,960,1);window.s_background=ie;ie.f(0,0,1,1,640,960,0,0);var je=new p("s_logo",rc,1,580,380,0,0,580,380,1);window.s_logo=je;je.f(0,0,1,1,577,364,1,8);var ke=new p("s_rubygreen",uc,3,56,56,28,28,168,56,3);
window.s_rubygreen=ke;ke.f(0,0,585,369,56,56,0,0);ke.f(1,0,425,833,56,56,0,0);ke.f(2,0,489,833,56,56,0,0);var le=new p("s_rubyblue",uc,3,56,56,28,28,168,56,3);window.s_rubyblue=le;le.f(0,0,289,865,56,56,0,0);le.f(1,0,553,833,56,56,0,0);le.f(2,0,617,833,56,56,0,0);var me=new p("s_rubypurple",uc,3,56,56,28,28,168,56,3);window.s_rubypurple=me;me.f(0,0,225,865,56,56,0,0);me.f(1,0,361,833,56,56,0,0);me.f(2,0,817,825,56,56,0,0);var ne=new p("s_rubyred",uc,3,56,56,28,28,168,56,3);window.s_rubyred=ne;
ne.f(0,0,161,809,56,56,0,0);ne.f(1,0,353,425,56,56,0,0);ne.f(2,0,1,817,56,56,0,0);var oe=new p("s_rubyyellow",uc,3,56,56,28,28,168,56,3);window.s_rubyyellow=oe;oe.f(0,0,689,825,56,56,0,0);oe.f(1,0,753,825,56,56,0,0);oe.f(2,0,353,897,56,56,0,0);var pe=new p("s_logo_preload_tinglygames",qc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=pe;pe.f(0,0,649,1,320,54,0,0);var qe=new p("s_loadingbar_bg",qc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=qe;qe.f(0,0,977,1,38,20,0,0);
var re=new p("s_loadingbar_fill",qc,1,30,12,0,0,30,12,1);window.s_loadingbar_fill=re;re.f(0,0,977,25,30,12,0,0);var se=new p("s_logo_about",W,1,121,121,0,0,121,121,1);window.s_logo_about=se;se.f(0,0,841,257,117,80,2,21);var te=new p("s_logo_poki_about",W,1,123,58,0,0,123,58,1);window.s_logo_poki_about=te;te.f(0,0,841,193,123,58,0,0);var ue=new p("s_logo_poki_start",qc,1,120,60,0,0,120,60,1);window.s_logo_poki_start=ue;ue.f(0,0,857,57,119,59,1,1);
var ve=new p("s_ads_background",qc,1,200,200,100,100,200,200,1);window.s_ads_background=ve;ve.f(0,0,649,57,200,200,0,0);var we=new Ca("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=we;var X=new z("f_default","Arial");window.f_default=X;D(X,12);E(X);X.setFillColor("Black");F(X,1);Ha(X,!1);X.setStrokeColor("Black");Ka(X,1);Ma(X,"miter");Ia(X,1);La(X,!1);G(X,"left");H(X,"top");Pa(X);Qa(X);
var xe=new Ca("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=xe;var ye=new Ca("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=ye;var ze=new Ca("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");window.floaterFontFaceLoader=ze;
var Ae=new Ca("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Ae;var Be=new z("floaterFontFace","Arial");window.floaterFontText1=Be;D(Be,24);Fa(Be,"normal");E(Be);Be.setFillColor("#FFDE00");F(Be,1);Ha(Be,!0);Be.setStrokeColor("#6F1F00");Ka(Be,4);Ma(Be,"miter");Ia(Be,1);La(Be,!0);Na(Be,!0,"rgba(57,0,0,0.46)",0,4,2);G(Be,"left");H(Be,"top");Pa(Be);Qa(Be);var Ce=new z("floaterFontFace","Arial");
window.floaterFontText2=Ce;D(Ce,28);Fa(Ce,"normal");E(Ce);Ga(Ce,2,["#FFF600","#00DB48","blue"],.65,.02);F(Ce,1);Ha(Ce,!0);Ce.setStrokeColor("#073400");Ka(Ce,4);Ma(Ce,"miter");Ia(Ce,1);La(Ce,!0);Na(Ce,!0,"rgba(0,57,43,0.47)",0,4,2);G(Ce,"left");H(Ce,"top");Pa(Ce);Qa(Ce);var De=new z("floaterFontFace","Arial");window.floaterFontText3=De;D(De,30);Fa(De,"normal");E(De);Ga(De,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);F(De,1);Ha(De,!0);De.setStrokeColor("#4F0027");Ka(De,4);Ma(De,"miter");Ia(De,1);
La(De,!0);Na(De,!0,"rgba(41,0,0,0.48)",0,5,2);G(De,"left");H(De,"top");Pa(De);Qa(De);var Ee=new z("floaterFontFace","Arial");window.floaterFontText4=Ee;D(Ee,34);Fa(Ee,"normal");E(Ee);Ga(Ee,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);F(Ee,1);Ha(Ee,!0);Ee.setStrokeColor("#001637");Ka(Ee,4);Ma(Ee,"miter");Ia(Ee,1);La(Ee,!0);Na(Ee,!0,"rgba(0,35,75,0.49)",0,6,2);G(Ee,"left");H(Ee,"top");Pa(Ee);Qa(Ee);var Fe=new z("floaterNumberFontFace","Arial");window.floaterFontNumberPositive=Fe;D(Fe,30);E(Fe);Fe.setFillColor("White");
F(Fe,1);Ha(Fe,!0);Fe.setStrokeColor("#00106F");Ka(Fe,2);Ma(Fe,"miter");Ia(Fe,1);La(Fe,!1);Na(Fe,!0,"rgba(0,4,57,0.51)",0,4,2);G(Fe,"left");H(Fe,"top");Pa(Fe);Qa(Fe);var Ge=new z("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=Ge;D(Ge,30);Fa(Ge,"normal");E(Ge);Ge.setFillColor("#FF1E00");F(Ge,1);Ha(Ge,!0);Ge.setStrokeColor("#3F0000");Ka(Ge,2);Ma(Ge,"miter");Ia(Ge,1);La(Ge,!1);Na(Ge,!0,"rgba(57,0,0,0.49)",0,4,2);G(Ge,"left");H(Ge,"top");Pa(Ge);Qa(Ge);
var He=new z("ff_opensans_bold","Arial");window.f_game_ui_tiny=He;D(He,11);E(He);He.setFillColor("#799EC5");F(He,1);Ha(He,!1);He.setStrokeColor("White");Ka(He,1);Ma(He,"miter");Ia(He,1);La(He,!1);G(He,"center");H(He,"middle");Pa(He);Qa(He);var Ie=new z("ff_opensans_bold","Arial");window.f_game_ui=Ie;D(Ie,23);E(Ie);Ie.setFillColor("#799EC5");F(Ie,1);Ha(Ie,!1);Ie.setStrokeColor("Black");Ka(Ie,1);Ma(Ie,"miter");Ia(Ie,1);La(Ie,!1);G(Ie,"center");H(Ie,"middle");Pa(Ie);Qa(Ie);
var Je=new z("ff_opensans_bolditalic","Arial");window.f_game_ui_large=Je;D(Je,52);E(Je);Je.setFillColor("#172348");F(Je,1);Ha(Je,!1);Je.setStrokeColor("Black");Ka(Je,1);Ma(Je,"miter");Ia(Je,1);La(Je,!1);G(Je,"center");H(Je,"middle");Pa(Je);Qa(Je);var Ke=new Ca("ff_opensans","fonts/ff_opensans.woff","fonts/ff_opensans.ttf","load");window.ff_opensansLoader=Ke;var Le=new z("ff_opensans","Arial");window.ff_opensans=Le;D(Le,12);E(Le);Le.setFillColor("Black");F(Le,1);Ha(Le,!1);Le.setStrokeColor("Black");
Ka(Le,1);Ma(Le,"miter");Ia(Le,1);La(Le,!1);G(Le,"left");H(Le,"top");Pa(Le);Qa(Le);var Me=new Ca("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","load");window.ff_opensans_boldLoader=Me;var Ne=new Ca("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","load");window.ff_opensans_bolditalicLoader=Ne;var Oe=new Ca("ff_risque","fonts/ff_risque.woff","fonts/ff_risque.ttf","load");window.ff_risqueLoader=Oe;
var Pe=new z("ff_risque","Arial");window.ff_risque=Pe;D(Pe,12);E(Pe);Pe.setFillColor("Black");F(Pe,1);Ha(Pe,!1);Pe.setStrokeColor("Black");Ka(Pe,1);Ma(Pe,"miter");Ia(Pe,1);La(Pe,!1);G(Pe,"left");H(Pe,"top");Pa(Pe);Qa(Pe);var Qe=new z("ff_opensans_bold","Arial");window.f_announcement=Qe;D(Qe,70);E(Qe);Qe.setFillColor("White");F(Qe,1);Ha(Qe,!0);Qe.setStrokeColor("#2C2C2C");Ka(Qe,6);Ma(Qe,"round");Ia(Qe,1);La(Qe,!0);Na(Qe,!0,"rgba(0,0,0,0.53)",0,5,2);G(Qe,"center");H(Qe,"top");Pa(Qe);Qa(Qe);
var Re=new z("ff_opensans_bolditalic","script");window.f_newstage=Re;D(Re,80);Re.fontStyle="normal";Fa(Re,"normal");E(Re);Ga(Re,3,["#FFCD1D","#FFCD1D","#FCF8CE"],1,-.5);F(Re,1);Ha(Re,!0);Re.setStrokeColor("#6F2181");Ka(Re,10);Ma(Re,"miter");Ia(Re,1);La(Re,!0);Na(Re,!0,"rgba(111,19,32,0.89)",3,3,10);G(Re,"center");H(Re,"top");Pa(Re);Qa(Re);var Se=new z("ff_opensans_bold","script");window.f_gameover=Se;D(Se,70);Se.fontStyle="normal";Fa(Se,"normal");E(Se);
Ga(Se,2,["#FFCD1D","#FFFF80","#FF8000"],.69,-.22);F(Se,1);Ha(Se,!0);Se.setStrokeColor("#6F2181");Ka(Se,8);Ma(Se,"miter");Ia(Se,1);La(Se,!0);Na(Se,!0,"rgba(111,19,32,0.89)",3,3,10);G(Se,"center");H(Se,"top");Pa(Se);Qa(Se);var Te=new z("ff_opensans_bolditalic","Arial");window.f_awesome=Te;D(Te,50);Fa(Te,"normal");E(Te);Ga(Te,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);F(Te,1);Ha(Te,!0);Te.setStrokeColor("#001637");Ka(Te,8);Ma(Te,"round");Ia(Te,1);La(Te,!0);Na(Te,!0,"rgba(0,35,75,0.49)",0,6,2);
G(Te,"left");H(Te,"top");Pa(Te);Qa(Te);var Ue=new z("ff_opensans_bold","Arial");window.f_points=Ue;D(Ue,32);E(Ue);Ue.setFillColor("White");F(Ue,1);Ha(Ue,!0);Ue.setStrokeColor("Black");Ka(Ue,8);Ma(Ue,"round");Ia(Ue,1);La(Ue,!0);G(Ue,"left");H(Ue,"top");Pa(Ue);Qa(Ue);var Ve=new z("ff_opensans_bold","Arial");window.f_points_negative=Ve;D(Ve,32);E(Ve);Ve.setFillColor("Red");F(Ve,1);Ha(Ve,!0);Ve.setStrokeColor("Black");Ka(Ve,8);Ma(Ve,"round");Ia(Ve,1);La(Ve,!0);G(Ve,"left");H(Ve,"top");Pa(Ve);Qa(Ve);
var We=new z("ff_opensans_bolditalic","Arial");window.f_great=We;D(We,48);Fa(We,"normal");E(We);Ga(We,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);F(We,1);Ha(We,!0);We.setStrokeColor("#4F0027");Ka(We,7);Ma(We,"round");Ia(We,1);La(We,!0);Na(We,!0,"rgba(41,0,0,0.48)",0,5,2);G(We,"left");H(We,"top");Pa(We);Qa(We);var Xe=new z("ff_opensans_bolditalic","Arial");window.f_nice=Xe;D(Xe,46);Fa(Xe,"normal");E(Xe);Ga(Xe,2,["#FFF600","#00DB48","blue"],.65,.02);F(Xe,1);Ha(Xe,!0);Xe.setStrokeColor("#073400");
Ka(Xe,7);Ma(Xe,"round");Ia(Xe,1);La(Xe,!0);Na(Xe,!0,"rgba(0,57,43,0.47)",0,4,2);G(Xe,"left");H(Xe,"top");Pa(Xe);Qa(Xe);var Ye=new z("ff_opensans_bolditalic","Arial");window.f_screencleared=Ye;D(Ye,50);E(Ye);Ga(Ye,2,["#4DA7E0","#13276D","#13276D"],.6,0);F(Ye,1);Ha(Ye,!0);Ye.setStrokeColor("#E0EBFF");Ka(Ye,4);Ma(Ye,"round");Ia(Ye,1);La(Ye,!0);G(Ye,"left");H(Ye,"top");Pa(Ye);Qa(Ye);var Ze=new Ca("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");
window.f_themeDefaultLoader=Ze;var Y=new z("f_themeDefault","Arial");window.f_themeDefault=Y;D(Y,12);E(Y);Y.setFillColor("Black");F(Y,1);Ha(Y,!1);Y.setStrokeColor("White");Ka(Y,5);Ma(Y,"miter");Ia(Y,1);La(Y,!0);G(Y,"left");H(Y,"top");Pa(Y);Qa(Y);var $e=new z("Arial","Arial");window.f_tap_to_play=$e;D($e,28);Fa($e,"bold");E($e);$e.setFillColor("#1b2b34");F($e,1);Ha($e,!1);$e.setStrokeColor("Black");Ka($e,28);Ma($e,"round");Ia($e,.55);La($e,!1);G($e,"center");H($e,"middle");Pa($e);Qa($e);
var af=new z("Arial","Arial");window.f_adblocker=af;D(af,28);Fa(af,"normal");E(af);af.setFillColor("White");F(af,1);Ha(af,!1);af.setStrokeColor("Black");Ka(af,28);Ma(af,"round");Ia(af,.55);La(af,!1);G(af,"center");H(af,"middle");Pa(af);Qa(af);var bf=new z("Arial","Arial");window.f_copyright=bf;D(bf,22);Fa(bf,"bold");E(bf);bf.setFillColor("#1b2b34");F(bf,1);Ha(bf,!1);bf.setStrokeColor("Black");Ka(bf,28);Ma(bf,"round");Ia(bf,.55);La(bf,!1);G(bf,"left");H(bf,"middle");Pa(bf);Qa(bf);
var cf=new z("Arial","Arial");window.f_thankyou=cf;D(cf,50);Fa(cf,"bold");E(cf);cf.setFillColor("#1b2b34");F(cf,1);Ha(cf,!1);cf.setStrokeColor("Black");Ka(cf,28);Ma(cf,"round");Ia(cf,.55);La(cf,!1);G(cf,"center");H(cf,"middle");Pa(cf);Qa(cf);var df=new z("Arial","Arial");window.f_loading_game=df;D(df,20);Fa(df,"bold");E(df);df.setFillColor("#1b2b34");F(df,1);Ha(df,!1);df.setStrokeColor("Black");Ka(df,28);Ma(df,"round");Ia(df,.55);La(df,!1);G(df,"left");H(df,"middle");Pa(df);Qa(df);
var ef=new z("Arial","Arial");window.f_interstitial=ef;D(ef,20);Fa(ef,"bold");E(ef);ef.setFillColor("#1b2b34");F(ef,.38);Ha(ef,!1);ef.setStrokeColor("Black");Ka(ef,28);Ma(ef,"round");Ia(ef,.55);La(ef,!1);G(ef,"center");H(ef,"middle");Pa(ef);Qa(ef);var ff=new tb("as_music","audio/as_music.mp3","audio/as_music.ogg","audio_music");window.as_music=ff;var gf=new tb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=gf;var hf=new J("a_music",ff,0,33391,1,1,["music"]);
window.a_music=hf;var jf=new J("a_bomb",gf,0,1636,1,10,["game"]);window.a_bomb=jf;var kf=new J("a_boostCreation",gf,3E3,483,1,10,["game"]);window.a_boostCreation=kf;var lf=new J("a_colorBomb",gf,5E3,1450,1,10,["game"]);window.a_colorBomb=lf;var mf=new J("a_match_large",gf,8E3,754,1,10,["game"]);window.a_match_large=mf;var nf=new J("a_match_medium",gf,1E4,480,1,10,["game"]);window.a_match_medium=nf;var of=new J("a_match_small",gf,12E3,417,1,10,["game"]);window.a_match_small=of;
var pf=new J("a_swap",gf,14E3,777,1,10,["game"]);window.a_swap=pf;var qf=new J("a_floater_1",gf,16E3,891,1,10,["game"]);window.a_floater_1=qf;var rf=new J("a_floater_2",gf,18E3,1071,1,10,["game"]);window.a_floater_2=rf;var sf=new J("a_floater_3",gf,21E3,956,1,10,["game"]);window.a_floater_3=sf;var tf=new J("a_floater_4",gf,23E3,1117,1,10,["game"]);window.a_floater_4=tf;var uf=new J("a_fallingRubies",gf,26E3,1478,1,10,["game"]);window.a_fallingRubies=uf;
var vf=new J("a_falseMatch",gf,29E3,467,1,10,["game"]);window.a_falseMatch=vf;var wf=new J("a_newstage",gf,31E3,1628,1,10,["game"]);window.a_newstage=wf;var xf=new J("a_awesome",gf,34E3,1225,1,10,["game"]);window.a_awesome=xf;var yf=new J("a_great",gf,37E3,730,1,10,["game"]);window.a_great=yf;var zf=new J("a_nice",gf,39E3,678,1,10,["game"]);window.a_nice=zf;var Af=new J("a_levelStart",gf,41E3,1002,1,10,["sfx"]);window.a_levelStart=Af;var Bf=new J("a_levelComplete",gf,44E3,1002,1,10,["sfx"]);
window.a_levelComplete=Bf;var Cf=new J("a_mouseDown",gf,47E3,471,1,10,["sfx"]);window.a_mouseDown=Cf;var Df=new J("a_levelend_star_01",gf,49E3,1161,1,10,["sfx"]);window.a_levelend_star_01=Df;var Ef=new J("a_levelend_star_02",gf,52E3,1070,1,10,["sfx"]);window.a_levelend_star_02=Ef;var Ff=new J("a_levelend_star_03",gf,55E3,1039,1,10,["sfx"]);window.a_levelend_star_03=Ff;var Gf=new J("a_levelend_fail",gf,58E3,1572,1,10,["sfx"]);window.a_levelend_fail=Gf;
var Hf=new J("a_levelend_score_counter",gf,61E3,54,1,10,["sfx"]);window.a_levelend_score_counter=Hf;var If=new J("a_levelend_score_end",gf,63E3,888,1,10,["sfx"]);window.a_levelend_score_end=If;var Jf=new J("a_medal",gf,65E3,1225,1,10,["sfx"]);window.a_medal=Jf;V=V||{};V["nl-nl"]=V["nl-nl"]||{};V["nl-nl"].loadingScreenLoading="Laden...";V["nl-nl"].startScreenPlay="SPELEN";V["nl-nl"].levelMapScreenTotalScore="Totale score";V["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";
V["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";V["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";V["nl-nl"].levelEndScreenTotalScore="Totale score";V["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";V["nl-nl"].levelEndScreenTimeLeft="Tijd over";V["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";V["nl-nl"].levelEndScreenHighScore="High score";V["nl-nl"].optionsStartScreen="Hoofdmenu";V["nl-nl"].optionsQuit="Stop";V["nl-nl"].optionsResume="Terug naar spel";
V["nl-nl"].optionsTutorial="Speluitleg";V["nl-nl"].optionsHighScore="High scores";V["nl-nl"].optionsMoreGames="Meer Spellen";V["nl-nl"].optionsDifficulty_easy="Makkelijk";V["nl-nl"].optionsDifficulty_medium="Gemiddeld";V["nl-nl"].optionsDifficulty_hard="Moeilijk";V["nl-nl"].optionsMusic_on="Aan";V["nl-nl"].optionsMusic_off="Uit";V["nl-nl"].optionsSFX_on="Aan";V["nl-nl"].optionsSFX_off="Uit";V["nl-nl"]["optionsLang_en-us"]="Engels (US)";V["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";
V["nl-nl"]["optionsLang_nl-nl"]="Nederlands";V["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";V["nl-nl"].gameEndScreenBtnText="Ga verder";V["nl-nl"].optionsTitle="Instellingen";V["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";V["nl-nl"].optionsQuitConfirmBtn_No="Nee";V["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";V["nl-nl"].levelMapScreenTitle="Kies een level";
V["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";V["nl-nl"].optionsRestart="Herstart";V["nl-nl"].optionsSFXBig_on="Geluid aan";V["nl-nl"].optionsSFXBig_off="Geluid uit";V["nl-nl"].optionsAbout_title="Over ons";V["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";V["nl-nl"].optionsAbout_backBtn="Terug";V["nl-nl"].optionsAbout_version="versie:";
V["nl-nl"].optionsAbout="Over ons";V["nl-nl"].levelEndScreenMedal="VERBETERD!";V["nl-nl"].startScreenQuestionaire="Wat vind jij?";V["nl-nl"].levelMapScreenWorld_0="Kies een level";V["nl-nl"].startScreenByTinglyGames="door: CoolGames";V["nl-nl"]["optionsLang_de-de"]="Duits";V["nl-nl"]["optionsLang_tr-tr"]="Turks";V["nl-nl"].optionsAbout_header="Ontwikkeld door:";V["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";V["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";
V["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";V["nl-nl"].challengeStartTextScore="Punten van <NAME>:";V["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";V["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";V["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";V["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";V["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";
V["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";V["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";V["nl-nl"].challengeCancelConfirmBtn_yes="Ja";V["nl-nl"].challengeCancelConfirmBtn_no="Nee";V["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";V["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";
V["nl-nl"].challengeEndScreenName_you="Jij";V["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";V["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";V["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";V["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";
V["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";V["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";V["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";V["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";V["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";
V["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";V["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";V["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";V["nl-nl"].challengeForfeitConfirmBtn_no="Nee";V["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";V["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";
V["nl-nl"].optionsChallengeForfeit="Geef op";V["nl-nl"].optionsChallengeCancel="Stop";V["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";V["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";V["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";V["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";V["nl-nl"]["optionsLang_fr-fr"]="Frans";V["nl-nl"]["optionsLang_ko-kr"]="Koreaans";
V["nl-nl"]["optionsLang_ar-eg"]="Arabisch";V["nl-nl"]["optionsLang_es-es"]="Spaans";V["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";V["nl-nl"]["optionsLang_ru-ru"]="Russisch";V["nl-nl"].optionsExit="Stoppen";V["nl-nl"].levelEndScreenTotalScore_number="Totale score:";V["nl-nl"].levelEndScreenHighScore_number="Topscore:";V["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";
V["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";V["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";V["nl-nl"].optionsAbout_header_publisher="Published by:";V["nl-nl"]["optionsLang_jp-jp"]="Japans";V["nl-nl"]["optionsLang_it-it"]="Italiaans";V["en-us"]=V["en-us"]||{};V["en-us"].loadingScreenLoading="Loading...";V["en-us"].startScreenPlay="PLAY";
V["en-us"].levelMapScreenTotalScore="Total score";V["en-us"].levelEndScreenTitle_level="Level <VALUE>";V["en-us"].levelEndScreenTitle_difficulty="Well done!";V["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";V["en-us"].levelEndScreenTotalScore="Total score";V["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";V["en-us"].levelEndScreenTimeLeft="Time remaining";V["en-us"].levelEndScreenTimeBonus="Time bonus";V["en-us"].levelEndScreenHighScore="High score";
V["en-us"].optionsStartScreen="Main menu";V["en-us"].optionsQuit="Quit";V["en-us"].optionsResume="Resume";V["en-us"].optionsTutorial="How to play";V["en-us"].optionsHighScore="High scores";V["en-us"].optionsMoreGames="More Games";V["en-us"].optionsDifficulty_easy="Easy";V["en-us"].optionsDifficulty_medium="Medium";V["en-us"].optionsDifficulty_hard="Difficult";V["en-us"].optionsMusic_on="On";V["en-us"].optionsMusic_off="Off";V["en-us"].optionsSFX_on="On";V["en-us"].optionsSFX_off="Off";
V["en-us"]["optionsLang_en-us"]="English (US)";V["en-us"]["optionsLang_en-gb"]="English (GB)";V["en-us"]["optionsLang_nl-nl"]="Dutch";V["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";V["en-us"].gameEndScreenBtnText="Continue";V["en-us"].optionsTitle="Settings";V["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";V["en-us"].optionsQuitConfirmBtn_No="No";
V["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";V["en-us"].levelMapScreenTitle="Select a level";V["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";V["en-us"].optionsRestart="Restart";V["en-us"].optionsSFXBig_on="Sound on";V["en-us"].optionsSFXBig_off="Sound off";V["en-us"].optionsAbout_title="About";V["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
V["en-us"].optionsAbout_backBtn="Back";V["en-us"].optionsAbout_version="version:";V["en-us"].optionsAbout="About";V["en-us"].levelEndScreenMedal="IMPROVED!";V["en-us"].startScreenQuestionaire="What do you think?";V["en-us"].levelMapScreenWorld_0="Select a level";V["en-us"].startScreenByTinglyGames="by: CoolGames";V["en-us"]["optionsLang_de-de"]="German";V["en-us"]["optionsLang_tr-tr"]="Turkish";V["en-us"].optionsAbout_header="Developed by:";V["en-us"].levelEndScreenViewHighscoreBtn="View scores";
V["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";V["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["en-us"].challengeStartTextScore="<NAME>'s score:";V["en-us"].challengeStartTextTime="<NAME>'s time:";V["en-us"].challengeStartScreenToWin="Amount to win:";V["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
V["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["en-us"].challengeCancelConfirmBtn_yes="Yes";V["en-us"].challengeCancelConfirmBtn_no="No";V["en-us"].challengeEndScreensBtn_submit="Submit challenge";
V["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";V["en-us"].challengeEndScreenName_you="You";V["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";
V["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";
V["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";V["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["en-us"].challengeForfeitConfirmBtn_yes="Yes";V["en-us"].challengeForfeitConfirmBtn_no="No";V["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";V["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["en-us"].optionsChallengeForfeit="Forfeit";V["en-us"].optionsChallengeCancel="Quit";V["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["en-us"].levelEndScreenHighScore_time="Best time:";V["en-us"].levelEndScreenTotalScore_time="Total time:";V["en-us"]["optionsLang_fr-fr"]="French";V["en-us"]["optionsLang_ko-kr"]="Korean";V["en-us"]["optionsLang_ar-eg"]="Arabic";
V["en-us"]["optionsLang_es-es"]="Spanish";V["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["en-us"]["optionsLang_ru-ru"]="Russian";V["en-us"].optionsExit="Exit";V["en-us"].levelEndScreenTotalScore_number="Total score:";V["en-us"].levelEndScreenHighScore_number="High score:";V["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["en-us"].optionsAbout_header_publisher="Published by:";V["en-us"]["optionsLang_jp-jp"]="Japanese";V["en-us"]["optionsLang_it-it"]="Italian";V["en-gb"]=V["en-gb"]||{};V["en-gb"].loadingScreenLoading="Loading...";
V["en-gb"].startScreenPlay="PLAY";V["en-gb"].levelMapScreenTotalScore="Total score";V["en-gb"].levelEndScreenTitle_level="Level <VALUE>";V["en-gb"].levelEndScreenTitle_difficulty="Well done!";V["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";V["en-gb"].levelEndScreenTotalScore="Total score";V["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";V["en-gb"].levelEndScreenTimeLeft="Time remaining";V["en-gb"].levelEndScreenTimeBonus="Time bonus";V["en-gb"].levelEndScreenHighScore="High score";
V["en-gb"].optionsStartScreen="Main menu";V["en-gb"].optionsQuit="Quit";V["en-gb"].optionsResume="Resume";V["en-gb"].optionsTutorial="How to play";V["en-gb"].optionsHighScore="High scores";V["en-gb"].optionsMoreGames="More Games";V["en-gb"].optionsDifficulty_easy="Easy";V["en-gb"].optionsDifficulty_medium="Medium";V["en-gb"].optionsDifficulty_hard="Difficult";V["en-gb"].optionsMusic_on="On";V["en-gb"].optionsMusic_off="Off";V["en-gb"].optionsSFX_on="On";V["en-gb"].optionsSFX_off="Off";
V["en-gb"]["optionsLang_en-us"]="English (US)";V["en-gb"]["optionsLang_en-gb"]="English (GB)";V["en-gb"]["optionsLang_nl-nl"]="Dutch";V["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";V["en-gb"].gameEndScreenBtnText="Continue";V["en-gb"].optionsTitle="Settings";V["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";V["en-gb"].optionsQuitConfirmBtn_No="No";
V["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";V["en-gb"].levelMapScreenTitle="Select a level";V["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";V["en-gb"].optionsRestart="Restart";V["en-gb"].optionsSFXBig_on="Sound on";V["en-gb"].optionsSFXBig_off="Sound off";V["en-gb"].optionsAbout_title="About";V["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
V["en-gb"].optionsAbout_backBtn="Back";V["en-gb"].optionsAbout_version="version:";V["en-gb"].optionsAbout="About";V["en-gb"].levelEndScreenMedal="IMPROVED!";V["en-gb"].startScreenQuestionaire="What do you think?";V["en-gb"].levelMapScreenWorld_0="Select a level";V["en-gb"].startScreenByTinglyGames="by: CoolGames";V["en-gb"]["optionsLang_de-de"]="German";V["en-gb"]["optionsLang_tr-tr"]="Turkish";V["en-gb"].optionsAbout_header="Developed by:";V["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
V["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";V["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["en-gb"].challengeStartTextScore="<NAME>'s score:";V["en-gb"].challengeStartTextTime="<NAME>'s time:";V["en-gb"].challengeStartScreenToWin="Amount to win:";V["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
V["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["en-gb"].challengeCancelConfirmBtn_yes="Yes";V["en-gb"].challengeCancelConfirmBtn_no="No";V["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
V["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";V["en-gb"].challengeEndScreenName_you="You";V["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
V["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
V["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";V["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";V["en-gb"].challengeForfeitConfirmBtn_yes="Yes";V["en-gb"].challengeForfeitConfirmBtn_no="No";V["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";V["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["en-gb"].optionsChallengeForfeit="Forfeit";V["en-gb"].optionsChallengeCancel="Quit";V["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["en-gb"].levelEndScreenHighScore_time="Best time:";V["en-gb"].levelEndScreenTotalScore_time="Total time:";V["en-gb"]["optionsLang_fr-fr"]="French";V["en-gb"]["optionsLang_ko-kr"]="Korean";V["en-gb"]["optionsLang_ar-eg"]="Arabic";
V["en-gb"]["optionsLang_es-es"]="Spanish";V["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["en-gb"]["optionsLang_ru-ru"]="Russian";V["en-gb"].optionsExit="Exit";V["en-gb"].levelEndScreenTotalScore_number="Total score:";V["en-gb"].levelEndScreenHighScore_number="High score:";V["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["en-gb"].optionsAbout_header_publisher="Published by:";V["en-gb"]["optionsLang_jp-jp"]="Japanese";V["en-gb"]["optionsLang_it-it"]="Italian";V["de-de"]=V["de-de"]||{};V["de-de"].loadingScreenLoading="Laden ...";
V["de-de"].startScreenPlay="SPIELEN";V["de-de"].levelMapScreenTotalScore="Gesamtpunkte";V["de-de"].levelEndScreenTitle_level="Level <VALUE>";V["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";V["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";V["de-de"].levelEndScreenTotalScore="Gesamtpunkte";V["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";V["de-de"].levelEndScreenTimeLeft="Restzeit";V["de-de"].levelEndScreenTimeBonus="Zeitbonus";V["de-de"].levelEndScreenHighScore="Highscore";
V["de-de"].optionsStartScreen="Hauptmen\u00fc";V["de-de"].optionsQuit="Beenden";V["de-de"].optionsResume="Weiterspielen";V["de-de"].optionsTutorial="So wird gespielt";V["de-de"].optionsHighScore="Highscores";V["de-de"].optionsMoreGames="Weitere Spiele";V["de-de"].optionsDifficulty_easy="Einfach";V["de-de"].optionsDifficulty_medium="Mittel";V["de-de"].optionsDifficulty_hard="Schwer";V["de-de"].optionsMusic_on="EIN";V["de-de"].optionsMusic_off="AUS";V["de-de"].optionsSFX_on="EIN";
V["de-de"].optionsSFX_off="AUS";V["de-de"]["optionsLang_en-us"]="Englisch (US)";V["de-de"]["optionsLang_en-gb"]="Englisch (GB)";V["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";V["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";V["de-de"].gameEndScreenBtnText="Weiter";V["de-de"].optionsTitle="Einstellungen";V["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
V["de-de"].optionsQuitConfirmBtn_No="NEIN";V["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";V["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";V["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";V["de-de"].optionsRestart="Neustart";V["de-de"].optionsSFXBig_on="Sound EIN";V["de-de"].optionsSFXBig_off="Sound AUS";V["de-de"].optionsAbout_title="\u00dcber";
V["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["de-de"].optionsAbout_backBtn="Zur\u00fcck";V["de-de"].optionsAbout_version="Version:";V["de-de"].optionsAbout="\u00dcber";V["de-de"].levelEndScreenMedal="VERBESSERT!";V["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";V["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";V["de-de"].startScreenByTinglyGames="von: CoolGames";V["de-de"]["optionsLang_de-de"]="Deutsch";V["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
V["de-de"].optionsAbout_header="Entwickelt von:";V["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";V["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";V["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";V["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";V["de-de"].challengeStartTextTime="Zeit von <NAME>:";V["de-de"].challengeStartScreenToWin="Einsatz:";V["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
V["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";V["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";V["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";V["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";V["de-de"].challengeCancelConfirmBtn_yes="Ja";V["de-de"].challengeCancelConfirmBtn_no="Nein";
V["de-de"].challengeEndScreensBtn_submit="Herausfordern";V["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";V["de-de"].challengeEndScreenName_you="Du";V["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";V["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";V["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
V["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";V["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";V["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";V["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";V["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";V["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";V["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";V["de-de"].challengeForfeitConfirmBtn_yes="Ja";V["de-de"].challengeForfeitConfirmBtn_no="Nein";V["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";V["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
V["de-de"].optionsChallengeForfeit="Aufgeben";V["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";V["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";V["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";V["de-de"].levelEndScreenHighScore_time="Bestzeit:";V["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
V["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";V["de-de"]["optionsLang_ko-kr"]="Koreanisch";V["de-de"]["optionsLang_ar-eg"]="Arabisch";V["de-de"]["optionsLang_es-es"]="Spanisch";V["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";V["de-de"]["optionsLang_ru-ru"]="Russisch";V["de-de"].optionsExit="Verlassen";V["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";V["de-de"].levelEndScreenHighScore_number="Highscore:";V["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
V["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";V["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["de-de"].optionsAbout_header_publisher="Published by:";V["de-de"]["optionsLang_jp-jp"]="Japanese";V["de-de"]["optionsLang_it-it"]="Italian";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].loadingScreenLoading="Chargement...";
V["fr-fr"].startScreenPlay="JOUER";V["fr-fr"].levelMapScreenTotalScore="Score total";V["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";V["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";V["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";V["fr-fr"].levelEndScreenTotalScore="Score total";V["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";V["fr-fr"].levelEndScreenTimeLeft="Temps restant";V["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
V["fr-fr"].levelEndScreenHighScore="Meilleur score";V["fr-fr"].optionsStartScreen="Menu principal";V["fr-fr"].optionsQuit="Quitter";V["fr-fr"].optionsResume="Reprendre";V["fr-fr"].optionsTutorial="Comment jouer";V["fr-fr"].optionsHighScore="Meilleurs scores";V["fr-fr"].optionsMoreGames="Plus de jeux";V["fr-fr"].optionsDifficulty_easy="Facile";V["fr-fr"].optionsDifficulty_medium="Moyen";V["fr-fr"].optionsDifficulty_hard="Difficile";V["fr-fr"].optionsMusic_on="Avec";V["fr-fr"].optionsMusic_off="Sans";
V["fr-fr"].optionsSFX_on="Avec";V["fr-fr"].optionsSFX_off="Sans";V["fr-fr"]["optionsLang_en-us"]="Anglais (US)";V["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";V["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";V["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";V["fr-fr"].gameEndScreenBtnText="Continuer";V["fr-fr"].optionsTitle="Param\u00e8tres";V["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
V["fr-fr"].optionsQuitConfirmBtn_No="Non";V["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";V["fr-fr"].levelMapScreenTitle="Choisir un niveau";V["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";V["fr-fr"].optionsRestart="Recommencer";V["fr-fr"].optionsSFXBig_on="Avec son";V["fr-fr"].optionsSFXBig_off="Sans son";V["fr-fr"].optionsAbout_title="\u00c0 propos";
V["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["fr-fr"].optionsAbout_backBtn="Retour";V["fr-fr"].optionsAbout_version="Version :";V["fr-fr"].optionsAbout="\u00c0 propos";V["fr-fr"].levelEndScreenMedal="RECORD BATTU !";V["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";V["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";V["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";V["fr-fr"]["optionsLang_de-de"]="Allemand";V["fr-fr"]["optionsLang_tr-tr"]="Turc";
V["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";V["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";V["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";V["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";V["fr-fr"].challengeStartTextScore="Son score :";V["fr-fr"].challengeStartTextTime="Son temps\u00a0:";V["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";V["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
V["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";V["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";V["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";V["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";V["fr-fr"].challengeCancelConfirmBtn_yes="Oui";V["fr-fr"].challengeCancelConfirmBtn_no="Non";V["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
V["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";V["fr-fr"].challengeEndScreenName_you="Moi";V["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";V["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
V["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";V["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";V["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";V["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
V["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";V["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";V["fr-fr"].challengeForfeitConfirmBtn_no="Non";V["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";V["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].optionsChallengeForfeit="Abandonner";V["fr-fr"].optionsChallengeCancel="Annuler";V["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
V["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";V["fr-fr"].levelEndScreenTotalScore_time="Temps total :";V["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";V["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";V["fr-fr"]["optionsLang_ar-eg"]="Arabe";V["fr-fr"]["optionsLang_es-es"]="Espagnol";V["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
V["fr-fr"]["optionsLang_ru-ru"]="Russe";V["fr-fr"].optionsExit="Quitter";V["fr-fr"].levelEndScreenTotalScore_number="Score total :";V["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";V["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";V["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
V["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["fr-fr"].optionsAbout_header_publisher="Published by:";V["fr-fr"]["optionsLang_jp-jp"]="Japanese";V["fr-fr"]["optionsLang_it-it"]="Italian";V["pt-br"]=V["pt-br"]||{};V["pt-br"].loadingScreenLoading="Carregando...";V["pt-br"].startScreenPlay="JOGAR";V["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";V["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";V["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
V["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";V["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";V["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";V["pt-br"].levelEndScreenTimeLeft="Tempo restante";V["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";V["pt-br"].levelEndScreenHighScore="Recorde";V["pt-br"].optionsStartScreen="Menu principal";V["pt-br"].optionsQuit="Sair";V["pt-br"].optionsResume="Continuar";V["pt-br"].optionsTutorial="Como jogar";
V["pt-br"].optionsHighScore="Recordes";V["pt-br"].optionsMoreGames="Mais jogos";V["pt-br"].optionsDifficulty_easy="F\u00e1cil";V["pt-br"].optionsDifficulty_medium="M\u00e9dio";V["pt-br"].optionsDifficulty_hard="Dif\u00edcil";V["pt-br"].optionsMusic_on="Sim";V["pt-br"].optionsMusic_off="N\u00e3o";V["pt-br"].optionsSFX_on="Sim";V["pt-br"].optionsSFX_off="N\u00e3o";V["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";V["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";V["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
V["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";V["pt-br"].gameEndScreenBtnText="Continuar";V["pt-br"].optionsTitle="Configura\u00e7\u00f5es";V["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";V["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";V["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";V["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
V["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";V["pt-br"].optionsRestart="Reiniciar";V["pt-br"].optionsSFXBig_on="Com som";V["pt-br"].optionsSFXBig_off="Sem som";V["pt-br"].optionsAbout_title="Sobre";V["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["pt-br"].optionsAbout_backBtn="Voltar";V["pt-br"].optionsAbout_version="vers\u00e3o:";
V["pt-br"].optionsAbout="Sobre";V["pt-br"].levelEndScreenMedal="MELHOROU!";V["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";V["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";V["pt-br"].startScreenByTinglyGames="da: CoolGames";V["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";V["pt-br"]["optionsLang_tr-tr"]="Turco";V["pt-br"].optionsAbout_header="Desenvolvido por:";V["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";V["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
V["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["pt-br"].challengeStartTextScore="<NAME>'s score:";V["pt-br"].challengeStartTextTime="<NAME>'s time:";V["pt-br"].challengeStartScreenToWin="Amount to win:";V["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
V["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["pt-br"].challengeCancelConfirmBtn_yes="Yes";V["pt-br"].challengeCancelConfirmBtn_no="No";V["pt-br"].challengeEndScreensBtn_submit="Submit challenge";V["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";V["pt-br"].challengeEndScreenName_you="You";
V["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";V["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
V["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";V["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";V["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
V["pt-br"].challengeForfeitConfirmBtn_yes="Yes";V["pt-br"].challengeForfeitConfirmBtn_no="No";V["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";V["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["pt-br"].optionsChallengeForfeit="Desistir";V["pt-br"].optionsChallengeCancel="Sair do Jogo";V["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
V["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";V["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";V["pt-br"].levelEndScreenTotalScore_time="Tempo total:";V["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";V["pt-br"]["optionsLang_ko-kr"]="Coreano";V["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";V["pt-br"]["optionsLang_es-es"]="Espanhol";V["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
V["pt-br"]["optionsLang_ru-ru"]="Russo";V["pt-br"].optionsExit="Sa\u00edda";V["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";V["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";V["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["pt-br"].optionsAbout_header_publisher="Published by:";V["pt-br"]["optionsLang_jp-jp"]="Japanese";V["pt-br"]["optionsLang_it-it"]="Italian";V["es-es"]=V["es-es"]||{};V["es-es"].loadingScreenLoading="Cargando...";
V["es-es"].startScreenPlay="JUGAR";V["es-es"].levelMapScreenTotalScore="Punt. total";V["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";V["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";V["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";V["es-es"].levelEndScreenTotalScore="Punt. total";V["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";V["es-es"].levelEndScreenTimeLeft="Tiempo restante";V["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
V["es-es"].levelEndScreenHighScore="R\u00e9cord";V["es-es"].optionsStartScreen="Men\u00fa principal";V["es-es"].optionsQuit="Salir";V["es-es"].optionsResume="Seguir";V["es-es"].optionsTutorial="C\u00f3mo jugar";V["es-es"].optionsHighScore="R\u00e9cords";V["es-es"].optionsMoreGames="M\u00e1s juegos";V["es-es"].optionsDifficulty_easy="F\u00e1cil";V["es-es"].optionsDifficulty_medium="Normal";V["es-es"].optionsDifficulty_hard="Dif\u00edcil";V["es-es"].optionsMusic_on="S\u00ed";
V["es-es"].optionsMusic_off="No";V["es-es"].optionsSFX_on="S\u00ed";V["es-es"].optionsSFX_off="No";V["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";V["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";V["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";V["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";V["es-es"].gameEndScreenBtnText="Continuar";V["es-es"].optionsTitle="Ajustes";V["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
V["es-es"].optionsQuitConfirmBtn_No="No";V["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";V["es-es"].levelMapScreenTitle="Elige un nivel";V["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";V["es-es"].optionsRestart="Reiniciar";V["es-es"].optionsSFXBig_on="Sonido s\u00ed";V["es-es"].optionsSFXBig_off="Sonido no";V["es-es"].optionsAbout_title="Acerca de";
V["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["es-es"].optionsAbout_backBtn="Atr\u00e1s";V["es-es"].optionsAbout_version="versi\u00f3n:";V["es-es"].optionsAbout="Acerca de";V["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";V["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";V["es-es"].levelMapScreenWorld_0="Elige un nivel";V["es-es"].startScreenByTinglyGames="de: CoolGames";V["es-es"]["optionsLang_de-de"]="Alem\u00e1n";V["es-es"]["optionsLang_tr-tr"]="Turco";
V["es-es"].optionsAbout_header="Desarrollado por:";V["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";V["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";V["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["es-es"].challengeStartTextScore="<NAME>'s score:";V["es-es"].challengeStartTextTime="<NAME>'s time:";V["es-es"].challengeStartScreenToWin="Amount to win:";V["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
V["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["es-es"].challengeCancelConfirmBtn_yes="Yes";V["es-es"].challengeCancelConfirmBtn_no="No";
V["es-es"].challengeEndScreensBtn_submit="Submit challenge";V["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";V["es-es"].challengeEndScreenName_you="You";V["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
V["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";V["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";V["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";V["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["es-es"].challengeForfeitConfirmBtn_yes="Yes";V["es-es"].challengeForfeitConfirmBtn_no="No";V["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";V["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["es-es"].optionsChallengeForfeit="Rendirse";V["es-es"].optionsChallengeCancel="Abandonar";V["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";V["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";V["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";V["es-es"].levelEndScreenTotalScore_time="Tiempo total:";V["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";V["es-es"]["optionsLang_ko-kr"]="Coreano";
V["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";V["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";V["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";V["es-es"]["optionsLang_ru-ru"]="Ruso";V["es-es"].optionsExit="Salir";V["es-es"].levelEndScreenTotalScore_number="Puntos totales:";V["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";V["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["es-es"].optionsAbout_header_publisher="Published by:";V["es-es"]["optionsLang_jp-jp"]="Japanese";V["es-es"]["optionsLang_it-it"]="Italian";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
V["tr-tr"].startScreenPlay="OYNA";V["tr-tr"].levelMapScreenTotalScore="Toplam skor";V["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";V["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";V["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";V["tr-tr"].levelEndScreenTotalScore="Toplam skor";V["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";V["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";V["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
V["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";V["tr-tr"].optionsStartScreen="Ana men\u00fc";V["tr-tr"].optionsQuit="\u00c7\u0131k";V["tr-tr"].optionsResume="Devam et";V["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";V["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";V["tr-tr"].optionsMoreGames="Daha Fazla Oyun";V["tr-tr"].optionsDifficulty_easy="Kolay";V["tr-tr"].optionsDifficulty_medium="Orta";V["tr-tr"].optionsDifficulty_hard="Zorluk";V["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
V["tr-tr"].optionsMusic_off="Kapal\u0131";V["tr-tr"].optionsSFX_on="A\u00e7\u0131k";V["tr-tr"].optionsSFX_off="Kapal\u0131";V["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";V["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";V["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";V["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";V["tr-tr"].gameEndScreenBtnText="Devam";V["tr-tr"].optionsTitle="Ayarlar";V["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
V["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";V["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";V["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";V["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";V["tr-tr"].optionsRestart="Tekrar ba\u015flat";V["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";V["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
V["tr-tr"].optionsAbout_title="Hakk\u0131nda";V["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["tr-tr"].optionsAbout_backBtn="Geri";V["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";V["tr-tr"].optionsAbout="Hakk\u0131nda";V["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";V["tr-tr"].startScreenQuestionaire="Ne dersin?";V["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";V["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
V["tr-tr"]["optionsLang_de-de"]="Almanca";V["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";V["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";V["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";V["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";V["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["tr-tr"].challengeStartTextScore="<NAME>'s score:";V["tr-tr"].challengeStartTextTime="<NAME>'s time:";
V["tr-tr"].challengeStartScreenToWin="Amount to win:";V["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["tr-tr"].challengeCancelConfirmBtn_yes="Yes";V["tr-tr"].challengeCancelConfirmBtn_no="No";V["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";V["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";V["tr-tr"].challengeEndScreenName_you="You";V["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";V["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";V["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";V["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";V["tr-tr"].challengeForfeitConfirmBtn_no="No";V["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";V["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";V["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";V["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
V["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";V["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";V["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";V["tr-tr"]["optionsLang_ko-kr"]="Korece";V["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";V["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";V["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";V["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";V["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";V["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
V["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";V["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";V["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
V["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["tr-tr"].optionsAbout_header_publisher="Published by:";V["tr-tr"]["optionsLang_jp-jp"]="Japanese";V["tr-tr"]["optionsLang_it-it"]="Italian";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";V["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";V["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
V["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";V["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";V["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";V["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";V["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
V["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";V["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";V["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";V["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";V["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
V["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";V["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";V["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";V["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";V["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";V["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
V["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";V["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";V["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";V["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";V["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";V["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";V["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
V["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";V["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";V["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";V["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
V["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
V["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";V["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";V["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";V["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
V["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";V["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";V["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";V["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";V["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";V["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";V["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
V["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";V["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";V["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";V["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";V["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
V["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";V["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";V["ru-ru"].optionsAbout_header="Developed by:";V["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";V["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ru-ru"].challengeStartTextScore="<NAME>'s score:";
V["ru-ru"].challengeStartTextTime="<NAME>'s time:";V["ru-ru"].challengeStartScreenToWin="Amount to win:";V["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ru-ru"].challengeCancelConfirmBtn_yes="Yes";V["ru-ru"].challengeCancelConfirmBtn_no="No";V["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";V["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";V["ru-ru"].challengeEndScreenName_you="You";V["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";V["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";V["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";V["ru-ru"].challengeForfeitConfirmBtn_no="No";V["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ru-ru"].optionsChallengeForfeit="Forfeit";V["ru-ru"].optionsChallengeCancel="Quit";V["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ru-ru"].levelEndScreenHighScore_time="Best time:";V["ru-ru"].levelEndScreenTotalScore_time="Total time:";
V["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
V["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";V["ru-ru"].optionsExit="Exit";V["ru-ru"].levelEndScreenTotalScore_number="Total score:";V["ru-ru"].levelEndScreenHighScore_number="High score:";V["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ru-ru"].optionsAbout_header_publisher="Published by:";V["ru-ru"]["optionsLang_jp-jp"]="Japanese";V["ru-ru"]["optionsLang_it-it"]="Italian";V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
V["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";V["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";V["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";V["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";V["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";V["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
V["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";V["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";V["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";V["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
V["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";V["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";V["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";V["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";V["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
V["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";V["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";V["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";V["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";V["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";V["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
V["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";V["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";V["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
V["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";V["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";V["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";V["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
V["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";V["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
V["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";V["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";V["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";V["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
V["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";V["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";V["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";V["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";V["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
V["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";V["ar-eg"].optionsAbout="\u062d\u0648\u0644";V["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";V["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";V["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";V["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
V["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";V["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";V["ar-eg"].optionsAbout_header="Developed by:";V["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";V["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ar-eg"].challengeStartTextScore="<NAME>'s score:";
V["ar-eg"].challengeStartTextTime="<NAME>'s time:";V["ar-eg"].challengeStartScreenToWin="Amount to win:";V["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ar-eg"].challengeCancelConfirmBtn_yes="Yes";V["ar-eg"].challengeCancelConfirmBtn_no="No";V["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";V["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";V["ar-eg"].challengeEndScreenName_you="You";V["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";V["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";V["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";V["ar-eg"].challengeForfeitConfirmBtn_no="No";V["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ar-eg"].optionsChallengeForfeit="Forfeit";V["ar-eg"].optionsChallengeCancel="Quit";V["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ar-eg"].levelEndScreenHighScore_time="Best time:";V["ar-eg"].levelEndScreenTotalScore_time="Total time:";
V["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";V["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";V["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";V["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";V["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
V["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";V["ar-eg"].optionsExit="Exit";V["ar-eg"].levelEndScreenTotalScore_number="Total score:";V["ar-eg"].levelEndScreenHighScore_number="High score:";V["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ar-eg"].optionsAbout_header_publisher="Published by:";V["ar-eg"]["optionsLang_jp-jp"]="Japanese";V["ar-eg"]["optionsLang_it-it"]="Italian";V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
V["ko-kr"].startScreenPlay="PLAY";V["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";V["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";V["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";V["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";V["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";V["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";V["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
V["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";V["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";V["ko-kr"].optionsQuit="\uc885\ub8cc";V["ko-kr"].optionsResume="\uacc4\uc18d";V["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";V["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";V["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
V["ko-kr"].optionsDifficulty_medium="\uc911";V["ko-kr"].optionsDifficulty_hard="\uc0c1";V["ko-kr"].optionsMusic_on="\ucf1c\uae30";V["ko-kr"].optionsMusic_off="\ub044\uae30";V["ko-kr"].optionsSFX_on="\ucf1c\uae30";V["ko-kr"].optionsSFX_off="\ub044\uae30";V["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";V["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";V["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";V["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
V["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";V["ko-kr"].optionsTitle="\uc124\uc815";V["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";V["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";V["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
V["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";V["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";V["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";V["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";V["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
V["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";V["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";V["ko-kr"].optionsAbout_version="\ubc84\uc804:";V["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";V["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";V["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";V["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
V["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";V["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";V["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";V["ko-kr"].optionsAbout_header="Developed by:";V["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";V["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ko-kr"].challengeStartTextScore="<NAME>'s score:";
V["ko-kr"].challengeStartTextTime="<NAME>'s time:";V["ko-kr"].challengeStartScreenToWin="Amount to win:";V["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ko-kr"].challengeCancelConfirmBtn_yes="Yes";V["ko-kr"].challengeCancelConfirmBtn_no="No";V["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";V["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";V["ko-kr"].challengeEndScreenName_you="You";V["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";V["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";V["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";V["ko-kr"].challengeForfeitConfirmBtn_no="No";V["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ko-kr"].optionsChallengeForfeit="Forfeit";V["ko-kr"].optionsChallengeCancel="Quit";V["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ko-kr"].levelEndScreenHighScore_time="Best time:";V["ko-kr"].levelEndScreenTotalScore_time="Total time:";
V["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";V["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";V["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";V["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";V["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";V["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";V["ko-kr"].optionsExit="Exit";V["ko-kr"].levelEndScreenTotalScore_number="Total score:";
V["ko-kr"].levelEndScreenHighScore_number="High score:";V["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";V["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
V["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ko-kr"].optionsAbout_header_publisher="Published by:";V["ko-kr"]["optionsLang_jp-jp"]="Japanese";V["ko-kr"]["optionsLang_it-it"]="Italian";V["jp-jp"]=V["jp-jp"]||{};V["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";V["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";V["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";V["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
V["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";V["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";V["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";V["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";V["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";V["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";V["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
V["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";V["jp-jp"].optionsQuit="\u3084\u3081\u308b";V["jp-jp"].optionsResume="\u518d\u958b";V["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";V["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";V["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";V["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";V["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";V["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
V["jp-jp"].optionsMusic_on="\u30aa\u30f3";V["jp-jp"].optionsMusic_off="\u30aa\u30d5";V["jp-jp"].optionsSFX_on="\u30aa\u30f3";V["jp-jp"].optionsSFX_off="\u30aa\u30d5";V["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";V["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";V["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";V["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
V["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";V["jp-jp"].optionsTitle="\u8a2d\u5b9a";V["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";V["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";V["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
V["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";V["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";V["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";V["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";V["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
V["jp-jp"].optionsAbout_title="About";V["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";V["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";V["jp-jp"].optionsAbout_version="version";V["jp-jp"].optionsAbout="About";V["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";V["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";V["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";V["jp-jp"].startScreenByTinglyGames="by: CoolGames";
V["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";V["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";V["jp-jp"].optionsAbout_header="Developed by";V["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";V["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";V["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";V["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
V["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";V["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";V["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";V["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";V["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["jp-jp"].challengeCancelConfirmBtn_yes="Yes";V["jp-jp"].challengeCancelConfirmBtn_no="No";V["jp-jp"].challengeEndScreensBtn_submit="\u3042";V["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";V["jp-jp"].challengeEndScreenName_you="You";V["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
V["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";V["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";V["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";V["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";V["jp-jp"].challengeForfeitConfirmBtn_no="No";V["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";V["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["jp-jp"].optionsChallengeForfeit="Forfeit";V["jp-jp"].optionsChallengeCancel="Quit";V["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["jp-jp"].levelEndScreenHighScore_time="Best time:";V["jp-jp"].levelEndScreenTotalScore_time="Total time:";V["jp-jp"]["optionsLang_fr-fr"]="French";V["jp-jp"]["optionsLang_ko-kr"]="Korean";V["jp-jp"]["optionsLang_ar-eg"]="Arabic";
V["jp-jp"]["optionsLang_es-es"]="Spanish";V["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["jp-jp"]["optionsLang_ru-ru"]="Russian";V["jp-jp"].optionsExit="Exit";V["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";V["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";V["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["jp-jp"].optionsAbout_header_publisher="Published by:";V["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";V["jp-jp"]["optionsLang_it-it"]="Italian";V["it-it"]=V["it-it"]||{};V["it-it"].loadingScreenLoading="Caricamento...";
V["it-it"].startScreenPlay="GIOCA";V["it-it"].levelMapScreenTotalScore="Punteggio totale";V["it-it"].levelEndScreenTitle_level="Livello <VALUE>";V["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";V["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";V["it-it"].levelEndScreenTotalScore="Punteggio totale";V["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";V["it-it"].levelEndScreenTimeLeft="Tempo rimanente";V["it-it"].levelEndScreenTimeBonus="Tempo bonus";
V["it-it"].levelEndScreenHighScore="Record";V["it-it"].optionsStartScreen="Menu principale";V["it-it"].optionsQuit="Esci";V["it-it"].optionsResume="Riprendi";V["it-it"].optionsTutorial="Come si gioca";V["it-it"].optionsHighScore="Record";V["it-it"].optionsMoreGames="Altri giochi";V["it-it"].optionsDifficulty_easy="Facile";V["it-it"].optionsDifficulty_medium="Media";V["it-it"].optionsDifficulty_hard="Difficile";V["it-it"].optionsMusic_on="S\u00ec";V["it-it"].optionsMusic_off="No";
V["it-it"].optionsSFX_on="S\u00ec";V["it-it"].optionsSFX_off="No";V["it-it"]["optionsLang_en-us"]="Inglese (US)";V["it-it"]["optionsLang_en-gb"]="Inglese (UK)";V["it-it"]["optionsLang_nl-nl"]="Olandese";V["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";V["it-it"].gameEndScreenBtnText="Continua";V["it-it"].optionsTitle="Impostazioni";V["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
V["it-it"].optionsQuitConfirmBtn_No="No";V["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";V["it-it"].levelMapScreenTitle="Scegli un livello";V["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";V["it-it"].optionsRestart="Riavvia";V["it-it"].optionsSFXBig_on="Audio S\u00cc";V["it-it"].optionsSFXBig_off="Audio NO";V["it-it"].optionsAbout_title="Informazioni";V["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
V["it-it"].optionsAbout_backBtn="Indietro";V["it-it"].optionsAbout_version="versione:";V["it-it"].optionsAbout="Informazioni";V["it-it"].levelEndScreenMedal="MIGLIORATO!";V["it-it"].startScreenQuestionaire="Che ne pensi?";V["it-it"].levelMapScreenWorld_0="Scegli un livello";V["it-it"].startScreenByTinglyGames="di: CoolGames";V["it-it"]["optionsLang_de-de"]="Tedesco";V["it-it"]["optionsLang_tr-tr"]="Turco";V["it-it"].optionsAbout_header="Sviluppato da:";V["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
V["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";V["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";V["it-it"].challengeStartTextScore="punteggio di <NAME>:";V["it-it"].challengeStartTextTime="tempo di <NAME>:";V["it-it"].challengeStartScreenToWin="Necessario per vincere:";V["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";V["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
V["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";V["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";V["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";V["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";V["it-it"].challengeCancelConfirmBtn_no="No";V["it-it"].challengeEndScreensBtn_submit="Invia la sfida";V["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
V["it-it"].challengeEndScreenName_you="Tu";V["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";V["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";V["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";V["it-it"].challengeCancelMessage_success="Sfida annullata.";V["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
V["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";V["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";V["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";V["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";V["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";V["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
V["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";V["it-it"].challengeForfeitConfirmBtn_no="No";V["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";V["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";V["it-it"].optionsChallengeForfeit="Abbandona";V["it-it"].optionsChallengeCancel="Esci";V["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";V["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
V["it-it"].levelEndScreenHighScore_time="Miglior tempo:";V["it-it"].levelEndScreenTotalScore_time="Tempo totale:";V["it-it"]["optionsLang_fr-fr"]="Francese";V["it-it"]["optionsLang_ko-kr"]="Coreano";V["it-it"]["optionsLang_ar-eg"]="Arabo";V["it-it"]["optionsLang_es-es"]="Spagnolo";V["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";V["it-it"]["optionsLang_ru-ru"]="Russo";V["it-it"].optionsExit="Esci";V["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
V["it-it"].levelEndScreenHighScore_number="Record:";V["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";V["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
V["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";V["it-it"].optionsAbout_header_publisher="Distribuito da:";V["it-it"]["optionsLang_jp-jp"]="Giapponese";V["it-it"]["optionsLang_it-it"]="Italiano";V=V||{};V["nl-nl"]=V["nl-nl"]||{};V["nl-nl"].game_ui_SCORE="SCORE";V["nl-nl"].game_ui_STAGE="LEVEL";V["nl-nl"].game_ui_LIVES="LEVENS";V["nl-nl"].game_ui_TIME="TIJD";V["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";V["nl-nl"].game_ui_LEVEL="LEVEL";V["nl-nl"].game_ui_time_left="Resterende tijd";
V["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";V["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";V["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["en-us"]=V["en-us"]||{};V["en-us"].game_ui_SCORE="SCORE";V["en-us"].game_ui_STAGE="STAGE";V["en-us"].game_ui_LIVES="LIVES";V["en-us"].game_ui_TIME="TIME";V["en-us"].game_ui_HIGHSCORE="HIGH SCORE";V["en-us"].game_ui_LEVEL="LEVEL";V["en-us"].game_ui_time_left="Time left";V["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
V["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["en-gb"]=V["en-gb"]||{};V["en-gb"].game_ui_SCORE="SCORE";V["en-gb"].game_ui_STAGE="STAGE";V["en-gb"].game_ui_LIVES="LIVES";V["en-gb"].game_ui_TIME="TIME";V["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";V["en-gb"].game_ui_LEVEL="LEVEL";V["en-gb"].game_ui_time_left="Time left";V["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["de-de"]=V["de-de"]||{};
V["de-de"].game_ui_SCORE="PUNKTE";V["de-de"].game_ui_STAGE="STUFE";V["de-de"].game_ui_LIVES="LEBEN";V["de-de"].game_ui_TIME="ZEIT";V["de-de"].game_ui_HIGHSCORE="HIGHSCORE";V["de-de"].game_ui_LEVEL="LEVEL";V["de-de"].game_ui_time_left="Restzeit";V["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";V["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";V["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].game_ui_SCORE="SCORE";V["fr-fr"].game_ui_STAGE="SC\u00c8NE";
V["fr-fr"].game_ui_LIVES="VIES";V["fr-fr"].game_ui_TIME="TEMPS";V["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";V["fr-fr"].game_ui_LEVEL="NIVEAU";V["fr-fr"].game_ui_time_left="Temps restant";V["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";V["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";V["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";V["pt-br"]=V["pt-br"]||{};V["pt-br"].game_ui_SCORE="PONTOS";V["pt-br"].game_ui_STAGE="FASE";V["pt-br"].game_ui_LIVES="VIDAS";V["pt-br"].game_ui_TIME="TEMPO";
V["pt-br"].game_ui_HIGHSCORE="RECORDE";V["pt-br"].game_ui_LEVEL="N\u00cdVEL";V["pt-br"].game_ui_time_left="Tempo restante";V["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";V["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";V["pt-br"].game_ui_HIGHSCORE_break="RECORDE";V["es-es"]=V["es-es"]||{};V["es-es"].game_ui_SCORE="PUNTOS";V["es-es"].game_ui_STAGE="FASE";V["es-es"].game_ui_LIVES="VIDAS";V["es-es"].game_ui_TIME="TIEMPO";V["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
V["es-es"].game_ui_LEVEL="NIVEL";V["es-es"].game_ui_time_left="Tiempo restante";V["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";V["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";V["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].game_ui_SCORE="SKOR";V["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";V["tr-tr"].game_ui_LIVES="HAYATLAR";V["tr-tr"].game_ui_TIME="S\u00dcRE";V["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";V["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
V["tr-tr"].game_ui_time_left="Kalan zaman";V["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";V["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";V["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";V["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";V["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";V["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
V["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";V["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";V["ru-ru"].game_ui_time_left="Time left";V["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";V["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
V["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";V["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";V["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";V["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";V["ar-eg"].game_ui_time_left="Time left";V["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].game_ui_SCORE="\uc810\uc218";V["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";V["ko-kr"].game_ui_LIVES="\uae30\ud68c";V["ko-kr"].game_ui_TIME="\uc2dc\uac04";V["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].game_ui_LEVEL="\ub808\ubca8";V["ko-kr"].game_ui_time_left="Time left";V["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
V["jp-jp"]=V["jp-jp"]||{};V["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";V["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";V["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";V["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";V["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";V["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";V["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";V["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";V["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
V["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";V["it-it"]=V["it-it"]||{};V["it-it"].game_ui_SCORE="PUNTEGGIO";V["it-it"].game_ui_STAGE="FASE";V["it-it"].game_ui_LIVES="VITE";V["it-it"].game_ui_TIME="TEMPO";V["it-it"].game_ui_HIGHSCORE="RECORD";V["it-it"].game_ui_LEVEL="LIVELLO";V["it-it"].game_ui_time_left="TEMPO RIMANENTE";V["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";V["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";V["it-it"].game_ui_HIGHSCORE_break="RECORD";
var Kf={};
function Mf(){Kf={He:{am:"en-us",Vk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},te:{ad:T(1040),Qr:T(960),Zb:T(640),Bh:T(640),mg:T(0),rm:T(-80),lg:0,minHeight:T(780),Sn:{id:"canvasBackground",depth:50},wd:{id:"canvasGame",depth:100,top:T(200,"round"),left:T(40,"round"),width:T(560,"round"),height:T(560,"round")},Xc:{id:"canvasGameUI",depth:150,top:0,left:0,height:T(120,"round")},gg:{id:"canvasMain",depth:200}},Tn:{ad:T(640),Qr:T(640),Zb:T(1152),Bh:T(1152),
mg:T(0),rm:T(0),lg:0,minHeight:T(640),minWidth:T(850),Sn:{id:"canvasBackground",depth:50},wd:{id:"canvasGame",depth:100,top:T(40,"round"),left:T(296,"round"),width:T(560,"round"),height:T(560,"round")},Xc:{id:"canvasGameUI",depth:150,top:0,left:T(151),width:T(140)},gg:{id:"canvasMain",depth:200}},Xb:{bigPlay:{type:"text",s:be,ya:T(38),qb:T(99),font:{align:"center",i:"middle",fontSize:U({big:46,small:30}),fillColor:"#01198a",P:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},sd:2,td:T(30),fontSize:U({big:46,
small:30})},difficulty_toggle:{type:"toggleText",s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"0",s:Pc,L:"optionsDifficulty_easy"},{id:"1",s:Oc,L:"optionsDifficulty_medium"},{id:"2",s:Nc,L:"optionsDifficulty_hard"}],oi:T(30),pi:T(12),ah:T(10),sd:2,td:T(30),fontSize:U({big:40,small:20})},music_toggle:{type:"toggle",s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,
small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"on",s:$d,L:"optionsMusic_on"},{id:"off",s:Zd,L:"optionsMusic_off"}],oi:T(30),pi:T(12),ah:0,sd:2,td:T(30)},sfx_toggle:{type:"toggle",s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"on",s:Yd,L:"optionsSFX_on"},{id:"off",s:Xd,L:"optionsSFX_off"}],oi:T(30),pi:T(12),ah:0,sd:2,td:T(30)},music_big_toggle:{type:"toggleText",
s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"on",s:"undefined"!==typeof Od?Od:void 0,L:"optionsMusic_on"},{id:"off",s:"undefined"!==typeof Pd?Pd:void 0,L:"optionsMusic_off"}],oi:T(28,"round"),pi:T(10),ah:T(10),sd:2,td:T(30),fontSize:U({big:40,small:20})},sfx_big_toggle:{type:"toggleText",s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",
P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"on",s:"undefined"!==typeof Ld?Ld:void 0,L:"optionsSFXBig_on"},{id:"off",s:"undefined"!==typeof Md?Md:void 0,L:"optionsSFXBig_off"}],oi:T(33,"round"),pi:T(12),ah:T(10),sd:2,td:T(30),fontSize:U({big:40,small:20})},language_toggle:{type:"toggleText",s:Wd,ya:T(106),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},X:[{id:"en-us",s:Qc,L:"optionsLang_en-us"},
{id:"en-gb",s:Rc,L:"optionsLang_en-gb"},{id:"nl-nl",s:Sc,L:"optionsLang_nl-nl"},{id:"de-de",s:Uc,L:"optionsLang_de-de"},{id:"fr-fr",s:Vc,L:"optionsLang_fr-fr"},{id:"pt-br",s:Wc,L:"optionsLang_pt-br"},{id:"es-es",s:Xc,L:"optionsLang_es-es"},{id:"ru-ru",s:Zc,L:"optionsLang_ru-ru"},{id:"it-it",s:bd,L:"optionsLang_it-it"},{id:"ar-eg",s:$c,L:"optionsLang_ar-eg"},{id:"ko-kr",s:ad,L:"optionsLang_ko-kr"},{id:"tr-tr",s:Tc,L:"optionsLang_tr-tr"},{id:"jp-jp",s:Yc,L:"optionsLang_jp-jp"}],oi:T(40),pi:T(20),ah:T(10),
sd:2,td:T(30),fontSize:U({big:40,small:20})},default_text:{type:"text",s:Vd,ya:T(40),qb:T(40),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},sd:2,td:T(30),fontSize:U({big:40,small:20})},default_image:{type:"image",s:Vd,ya:T(40),qb:T(40),td:T(6)},options:{type:"image",s:Td}},Qn:{bigPlay:{type:"text",s:be,ya:T(40),qb:T(76),font:{align:"center",i:"middle",fontSize:U({big:40,small:20}),fillColor:"#01198a",P:{h:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},sd:2,td:T(30),fontSize:U({big:40,small:20})}},fl:{green:{font:{align:"center",i:"middle",fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",i:"middle",fillColor:"#01198a",P:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",i:"middle",fillColor:"#004f89",P:{h:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",i:"middle",fillColor:"#9a1900",P:{h:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",i:"middle",fillColor:"#8d2501",P:{h:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",i:"middle",fillColor:"#c6258f",P:{h:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",i:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",i:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",i:"middle",fillColor:"#ffffff",P:{h:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",i:"middle",fillColor:"#ffffff",P:{h:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ha:{zA:20},Bd:{backgroundImage:"undefined"!==typeof fe?fe:void 0,jy:0,Pv:500,lm:5E3,Px:5E3,hu:-1,wA:12,vA:100,Ve:T(78),rq:{align:"center"},cn:T(560),Mh:T(400),Nh:{align:"center"},Fg:T(680),uf:T(16),fp:T(18),Oj:T(8),kt:T(8),lt:T(9),mt:T(9),mk:{align:"center",fillColor:"#3B0057",fontSize:T(24)},Lu:{align:"center"},
Mu:T(620),bn:T(500),Pj:"center",Hg:T(500),Rj:T(60),Eb:{align:"center"},Oc:{align:"bottom",offset:T(20)},kp:T(806),ip:500,Ex:T(20)},hp:{Pj:"right",cn:T(280),Fg:T(430),Hg:T(340),Eb:{align:"right",offset:T(32)},Oc:T(560),kp:T(560)},Um:{On:T(860),backgroundImage:void 0!==typeof fe?fe:void 0,Iw:700,Ht:1800,ay:700,Wy:2600,Ih:void 0!==typeof fe?je:void 0,Ad:700,Bj:{align:"center"},Ll:{align:"center"},Cj:void 0!==typeof je?-je.height:0,Aj:{align:"top",offset:T(20)},Co:1,qs:1,Do:1,rs:1,Bo:1,ps:1,Mw:O,Nw:P,
Kw:O,Lw:O,Jw:O,Vy:{align:"center"},Dm:T(656),Yj:T(300),Bm:700,Uy:700,Tr:T(368),tl:T(796),lj:T(440),Sr:700,rp:T(36),pm:T(750),$x:500,Pj:"center",Hg:T(500),Rj:T(60),Eb:{align:"center"},Oc:{align:"bottom",offset:T(20)},kp:T(806),ip:500,Ex:T(20)},jq:{On:T(0),Dm:T(456),Yj:T(320),Tr:{align:"center"},tl:T(346),lj:T(460),rp:{align:"left",offset:T(32)},pm:T(528),Pj:"right",Hg:T(340),Eb:{align:"right",offset:T(32)},Oc:T(560),kp:T(560)},Cg:{Ky:{align:"center",offset:T(-230)},Ap:{align:"top",offset:T(576)},Jy:"options",
gc:{i:"bottom"},Qf:{align:"center"},zc:{align:"top",offset:T(35,"round")},Ld:T(232),We:T(98),TA:{align:"center",offset:T(-206)},Jq:{align:"top",offset:T(30)},SA:{align:"center",offset:T(206)},Iq:{align:"top",offset:T(30)},type:"grid",Fy:3,jC:3,Gy:5,kC:4,Wr:!0,tw:!0,Lo:T(78),us:{align:"top",offset:T(140)},ws:{align:"top",offset:T(140)},vs:T(20),Uw:T(18),Vw:T(18),tx:{Go:{fontSize:U({big:60,small:30}),fillColor:"#3F4F5E",align:"center",i:"middle",P:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:T(6),blur:0}}},
ux:{Go:{fontSize:U({big:32,small:16}),fillColor:"#3F4F5E",align:"center",i:"middle",P:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:T(2),blur:0}}},et:T(438),ft:T(438),Xs:{align:"center"},Ys:{align:"center"},ot:{align:"center"},pt:{align:"center",offset:T(-22)},at:{align:"center"},bt:{align:"center",offset:T(-10)},Vz:{align:"center",offset:T(216)},mu:{align:"top",offset:T(574)},lu:{fontSize:U({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},nu:T(10),Ip:{fontSize:U({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},Mt:{align:"center"},Nt:{align:"top",offset:T(588)},Zy:T(160),Yy:T(40),backgroundImage:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,nA:T(10),oA:200,mA:T(200),dC:T(600),oy:800,ny:500},Zs:{Jq:{align:"top",offset:T(20)},Iq:{align:"top",offset:T(20)},zc:{align:"top",offset:T(25,"round")},Lo:T(234),us:{align:"top",offset:T(110)},ws:{align:"top",offset:T(110)},mu:{align:"top",offset:T(536)},Nt:{align:"top",offset:T(550)},Ap:{align:"top",offset:T(538)}},gm:{Pc:"undefined"!==
typeof de?de:void 0,Dp:{align:"center"},Xj:"undefined"!==typeof de?-de.height:void 0,Wj:[{type:"y",za:0,duration:800,end:{align:"center",offset:T(-142)},Qa:P,yb:Af}],ym:[{type:"y",za:0,duration:600,end:"undefined"!==typeof de?-de.height:void 0,Qa:nc,cl:!0}],ir:{align:"center",i:"middle"},jr:{align:"center"},kr:0,Zi:T(500),En:T(80),ys:{align:"center",i:"middle"},As:{align:"center"},Bs:0,Wl:T(560),zs:T(80),Ep:3500},dp:{Wj:[{type:"y",za:0,duration:800,end:{align:"center"},Qa:P,yb:Af}]},kl:{Pc:"undefined"!==
typeof s_overlay_challenge_start?s_overlay_challenge_start:void 0,Dp:{align:"center"},Xj:T(56),Mg:0,Rh:0,gc:{align:"center",i:"top"},Ld:T(500),We:T(100),Qf:{align:"center"},zc:T(90),Dt:{align:"center",i:"middle"},wy:T(500),vy:T(80),zy:{align:"center"},Ay:T(250),St:{align:"center",i:"top"},rz:T(500),qz:T(40),sz:{align:"center"},Tt:T(348),Rt:{align:"center",i:"top"},vz:T(500),uz:T(50),zz:{align:"center"},Ut:T(388),rv:{align:"center",i:"top"},IA:T(500),HA:T(40),JA:{align:"center"},sv:T(442),fD:0,gD:0,
qv:{align:"center",i:"top"},LA:T(500),KA:T(50),MA:{align:"center"},tv:T(482),eD:T(10),cD:0,dD:0,ef:800,Rk:P,Sk:600,Tk:nc,Ep:3500},jl:{gr:500,ef:800,Dy:1500,vp:500,xz:2500,Yp:500,Az:3200,Bz:800,qm:4200,Ph:300,dw:4500,Py:{align:"center"},Qy:T(-800),Qh:{align:"center"},zf:T(52),Mg:0,Rh:0,rj:.8,po:"#000000",Ig:{align:"center",i:"middle"},tp:T(360),xt:T(120),cy:T(4),dy:T(4),hy:{align:"center"},iy:T(340),eA:{align:"center"},Au:T(600),mq:T(500),zu:T(120),dA:{align:"center",i:"middle"},zk:{align:"center",
i:"middle"},Hq:T(360),uv:T(60),NA:T(4),OA:T(4),PA:{align:"center"},QA:T(480),$m:T(460),iA:{align:"center"},Cu:T(400),ew:{align:"center"},Gr:T(500),up:{align:"center",i:"middle"},Cy:T(75,"round"),By:T(48),Ey:T(120),Ft:T(214,"round"),Et:T(40),ty:T(4),uy:T(4),xy:0,yy:0,ho:{align:"center",i:"middle"},zw:T(220),yw:T(180),$r:T(80),Zr:T(4),xw:T(4)},ra:{zm:{bo:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,Aw:"undefined"!==typeof he?he:void 0,vx:"undefined"!==typeof s_overlay_level_win?
s_overlay_level_win:void 0,sx:"undefined"!==typeof s_overlay_level_fail?s_overlay_level_fail:void 0},uA:500,ef:800,Rk:P,Sk:800,Tk:gc,Pb:{align:"center"},Hb:0,gc:{align:"center",i:"middle",fontSize:U({big:26,small:13})},Qf:{align:"center"},zc:T(58),Ld:T(500),We:T(100),fA:{align:"center",i:"middle",fontSize:U({big:56,small:28})},gA:{align:"center"},hA:T(236),io:{align:"center",i:"top",fontSize:U({big:24,small:12})},as:{align:"center"},jo:T(144),qj:{align:"center",i:"top",fontSize:U({big:56,small:28})},
Cl:{align:"center"},Dh:T(176),Bl:T(200),Al:T(60),jk:{align:"center",i:"top",fontSize:U({big:24,small:12})},If:{align:"center"},Jf:T(286),vu:T(0),ms:!1,Jd:T(14),Wm:T(10),Xg:{align:"center",i:"top",fontSize:U({big:24,small:12})},gi:T(10),hi:T(4),ii:T(200),SC:T(50),Nv:{align:"center",offset:T(12)},nr:T(549),Hw:{align:"center",offset:T(162)},ns:T(489),fj:{align:"center",offset:T(250)},zh:T(10),yh:T(90),jg:T(90),dq:{align:"center",offset:T(-177,"round")},eq:T(120),fq:{align:"center"},gq:T(96),hq:{align:"center",
offset:T(179,"round")},iq:T(120),QC:200,Rz:500,iu:800,ku:0,Uz:0,Tz:300,Sz:200,ju:300,rj:.8,rc:800,po:"#000000",pp:T(508),om:T(394),st:T(96),tt:T(74),mm:3,Oh:400,Qx:2500,iC:0,Tx:T(100),ut:1.5,Yx:{align:"center"},Zx:T(76),nm:T(180),Xx:T(36),vt:{align:"center",i:"middle",fontSize:U({big:22,small:12}),n:"ff_opensans_extrabold",fillColor:"#1d347f",P:{h:!0,color:"#68cbfa",offsetY:T(2)}},rt:500,Rx:500,Sx:T(-30),Vx:500,Ux:0,Wx:4E3,gn:600,CA:1500,yr:500,th:750,cx:{align:"center"},dx:T(290),Fs:T(350),ly:1E3,
type:{level:{Zk:"level",md:!0,ci:!0,nk:"title_level",Kf:"totalScore",Wk:"retry",Il:"next"},failed:{Zk:"failed",md:!1,ci:!1,nk:"title_level",Bu:"subtitle_failed",Wk:"exit",Il:"retry"},endless:{Zk:"endless",md:!1,ci:!0,nk:"title_endless",ko:"totalScore",Kf:"highScore",Wk:"exit",Il:"retry"},difficulty:{Zk:"difficulty",md:!1,ci:!0,nk:"title_difficulty",ko:"timeLeft",Kf:["totalScore","timeBonus"],Wk:"exit",Il:"retry"}}},Ws:{zh:T(0),zc:T(30),jo:T(114),Dh:T(146),Jf:T(266),nr:T(488),ns:T(428),pp:{align:"center",
offset:T(220)},om:T(260)},Lj:{backgroundImage:"undefined"!==typeof ie?ie:void 0},options:{backgroundImage:ee,Pb:{align:"center"},Hb:0,gc:{},Qf:{align:"center"},zc:T(58),Ld:T(500),We:T(100),hl:T(460,"round"),gl:{align:"center"},dj:{align:"center",offset:T(36)},Rd:T(10,"round"),fj:T(510),zh:T(10),yh:T(130),jg:T(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",
["music","sfx"],"moreGames","quit"]},Uj:800,Vj:P,wm:600,xm:gc,Mr:{align:"center"},Yn:T(260),nl:T(460),Xn:T(300),Lr:{align:"center"},Vn:T(460),Kr:{align:"center"},Un:T(560,"round"),hj:T(460,"round"),Im:{},Md:"undefined"!==typeof ge?ge:void 0,jn:{align:"center"},Rf:T(84,"round"),tk:{align:"center",i:"top"},kn:T(480),yq:T(46),av:{align:"center"},zq:T(110,"round"),Yu:{align:"center"},wq:T(160,"round"),$u:{align:"center"},xq:T(446,"round"),sk:{i:"middle",align:"center",fontSize:U({big:36,small:18})},ri:T(480),
Zu:T(160),Xu:{align:"center",offset:T(-80,"round")},vq:T(556,"round"),Wu:{align:"center",offset:T(80,"round")},uq:T(556,"round"),Mk:{align:"center",i:"top",fillColor:"#3C0058",fontSize:U({big:26,small:13}),rb:T(6)},Nk:T(480),$q:T(50),Ok:{align:"center"},Ti:T(106,"round"),Vi:{align:"center",i:"top",fillColor:"#3C0058",fontSize:U({big:26,small:13}),rb:T(6)},Zf:T(480),Wi:T(110),oh:{align:"center"},Xi:T(396,"round"),Ui:{align:"center"},Pk:T(140),zn:{align:"center"},Ri:T(500),Si:T(480),An:{align:"center",
i:"top",fillColor:"#808080",fontSize:U({big:12,small:8})},cr:{align:"center"},Bn:T(610),br:T(440),ar:T(20),ph:T(200),Qk:T(200),lv:T(80),mv:T(140),kv:T(10)},Ly:{zc:T(12),dj:{align:"center",offset:T(16)},Yn:T(200),Xn:T(300),Vn:T(400),Un:T(500,"round"),Rf:T(60,"round"),zq:T(80,"round"),wq:T(134,"round"),xq:T(410,"round"),vq:T(500,"round"),uq:T(500,"round"),Ti:T(86,"round"),Pk:T(126),Xi:T(392,"round"),Ri:T(490),Bn:T(590)},Bp:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:
ee,Pb:{align:"center"},Hb:T(120),gc:{},Qf:{align:"center"},zc:T(200),hl:T(460,"round"),gl:{align:"center"},dj:{align:"center",offset:T(140)},Rd:T(10,"round"),fj:T(510),zh:T(10),yh:T(130),jg:T(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},Uj:800,Vj:P,wm:600,xm:gc,Im:{},AC:{align:"center"},BC:T(360),zC:T(460),yC:T(300),uC:"default_text",
vC:{align:"center"},wC:T(630),rC:"default_text",sC:{align:"center"},tC:T(730,"round"),xC:T(460,"round"),Wn:{},Mr:{align:"center"},Yn:T(200),nl:T(460),Xn:T(250),Lr:{align:"center"},Vn:T(520),Kr:{align:"center"},Un:T(620,"round"),hj:T(460,"round"),Ig:{},fy:{align:"center"},gy:T(200),sp:T(460),ey:T(300),Md:"undefined"!==typeof ge?ge:void 0,jn:{align:"center"},Rf:T(0,"round"),tk:{align:"center",i:"top"},kn:T(480),yq:T(50),av:{align:"center"},zq:T(20,"round"),Yu:{align:"center"},wq:T(70,"round"),$u:{align:"center"},
xq:T(356,"round"),sk:{i:"middle",align:"center",fontSize:U({big:36,small:18})},ri:T(480),Zu:T(150),Xu:T(224,"round"),vq:T(636,"round"),Wu:T(350,"round"),uq:T(636,"round"),Mk:{align:"center",i:"top",fillColor:"#3C0058",fontSize:U({big:26,small:13}),rb:T(6)},Nk:T(480),$q:T(50),Ok:{align:"center"},Ti:T(26,"round"),Vi:{align:"center",i:"top",fillColor:"#3C0058",fontSize:U({big:26,small:13}),rb:T(6)},Zf:T(480),Wi:T(110),oh:{align:"center"},Xi:T(316,"round"),Ui:{align:"center"},Pk:T(60),zn:{align:"center"},
Ri:T(420),Si:T(480),An:{align:"center",i:"top",fillColor:"#808080",fontSize:U({big:12,small:8})},cr:{align:"center"},Bn:T(530),br:T(440),ar:T(20),ph:T(200),Qk:T(200),lv:T(80),mv:T(100),kv:T(10)},rl:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:ee,Pb:{align:"center"},Hb:T(120),hl:T(460,"round"),gl:{align:"center"},dj:{align:"bottom",offset:T(20)},Rd:T(10,"round"),fj:T(510),zh:T(10),yh:T(130),jg:T(90),Uj:800,Vj:P,wm:600,xm:gc,Lp:{},gz:{align:"center"},hz:{align:"center",offset:T(40)},
Np:T(460),Mp:T(300),nq:{},ez:{align:"center"},fz:{align:"center",offset:T(160)},dz:T(460),cz:T(200)},Jl:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,Lu:{align:"center"},Mu:T(152),bn:T(560),qA:T(560),font:{align:"center",i:"middle",fontSize:U({big:52,small:26}),fillColor:"#FFFFFF"},bw:{align:"center"},Cr:T(600),Br:T(460),Ar:"default_text"},wo:{Cr:T(520)}}}
var Nf={az:"poki",fk:{Cx:!1,co:[]},He:{am:"en-us",Vk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},rr:{show:!1}},Of=Of||{};Of.yj={Kl:"5f3842d8fe949324dd4d359be98fa398",Om:"da05479b7f994fba60dcdd839f0870836a27df66"};var Pf=null;
function Qf(){Pf={bj:{tc:800},ls:{pz:1E3,wz:50,yz:T(-25),pA:2E3,rA:50,sA:T(-25),tA:T(0)},sg:{xo:"Blaster",Wd:"endless"},Tw:{Cn:100,Zv:100,sh:3,kw:100,lw:10,zt:4E3,rows:9,oq:500,lA:3,yc:T(56)},zg:{ex:.3,fx:1},Zh:{wl:300,es:300,og:35,Ce:300,gs:300,du:200,Sm:200},rx:{hw:250,Fw:50,Kx:[10,20,30],qt:[5,10],Jp:[[20,5],[30,15],[45,50],[77,125],[100,250]]},bC:10,ep:[{name:"level_1",xb:{xc:1},Qc:{ce:500},o:{Uc:300},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.5,.4,.1,0,0],
null,[.5,.35,.15,0,0],null,[.5,.3,.2,0,0],null,null,null,null,null]},Ec:{hb:["bomb","swap","colorbomb"],Xa:[[0,0,0],null,null,[.2,0,0],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!0,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_2",xb:{xc:2},Qc:{ce:500},o:{Uc:270},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.5,.4,.1,0,0],null,[.5,.35,.15,
0,0],null,[.5,.3,.2,0,0],null,null,null,null,null]},Ec:{hb:["bomb","swap","colorbomb"],Xa:[[0,0,0],null,null,[.2,0,0],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!0,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_3",xb:{xc:3},Qc:{ce:500},o:{Uc:260},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.5,.3,.2,0,0],null,[.4,.3,.3,0,0],null,[.35,.35,
.3,0,0],null,null,null,null,null]},Ec:{hb:["bomb","swap","colorbomb"],Xa:[[0,0,0],null,null,[.2,0,0],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!0,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_4",xb:{xc:4},Qc:{ce:500},o:{Uc:250},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.5,.3,.1,.1,0],null,[.45,.25,.15,.15,0],null,[.45,.25,.2,.1,0],null,
null,null,null,null]},Ec:{hb:["bomb","swap","colorbomb"],Xa:[[.2,0,0],null,null,[.1,0,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!0],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_5",xb:{xc:5},Qc:{ce:500},o:{Uc:240},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.4,.3,.15,.15,0],null,[.4,.3,.15,.15,0],null,[.4,.2,.2,.2,0],null,null,null,
null,null]},Ec:{hb:["bomb","swap","colorbomb"],Xa:[[.2,0,0],null,null,[.1,0,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!0],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_6",xb:{xc:6},Qc:{ce:500},o:{Uc:230},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.4,.3,.2,.1,0],null,[.4,.25,.2,.15,0],null,[.4,.2,.2,.2,0],null,null,null,null,null]},
Ec:{hb:["bomb","swap","colorbomb"],Xa:[[.2,0,0],null,null,[.1,0,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!0],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_7",xb:{xc:7},Qc:{ce:500},o:{Uc:220},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.35,.3,.2,.1,.05],null,[.35,.25,.2,.15,.05],null,[.25,.2,.2,.2,.15],null,null,null,null,null]},Ec:{hb:["bomb",
"swap","colorbomb"],Xa:[[.1,0,.08],null,null,[.1,.1,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!0,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_8",xb:{xc:8},Qc:{ce:500},o:{Uc:210},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.3,.3,.2,.15,.05],null,[.3,.3,.2,.15,.05],null,[.3,.25,.25,.15,.05],null,null,null,null,null]},Ec:{hb:["bomb",
"swap","colorbomb"],Xa:[[.1,0,.08],null,null,[.1,.1,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!0,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_9",xb:{xc:9},Qc:{ce:500},o:{Uc:200},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.3,.3,.2,.1,.1],null,[.25,.25,.2,.15,.15],null,[.25,.2,.2,.2,.15],null,null,null,null,null]},Ec:{hb:["bomb","swap",
"colorbomb"],Xa:[[.1,0,.08],null,null,[.1,.1,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!0,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}},{name:"level_10",xb:{xc:30},Qc:{ce:500},o:{Uc:100},Ge:{je:1E4,ke:5E3,Yd:5E3},Rb:{Me:["purple","red","yellow","green","blue"],Xa:[[.3,.3,.2,.1,.1],null,[.25,.25,.2,.15,.15],null,[.25,.2,.2,.2,.15],null,null,null,null,null]},Ec:{hb:["bomb","swap",
"colorbomb"],Xa:[[.1,0,.08],null,null,[.1,.1,.08],null,null,null,null,null,null]},Vd:{hb:["bomb","swap","colorbomb"],Pd:[[!1,!1,!1],[!1,!1,!1],[!1,!0,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1],[!1,!1,!1]]},qd:{va:2,ee:5E3,fe:.9}}]}}var Rf={};
function Sf(){Rf={MB:"CutePuzzleWitch",buttons:{default_color:"green",bigPlay:"blue"},fc:{Kn:.2},Um:{Qv:[{s:fe,x:0,y:0},{s:"undefined"!==typeof je?je:void 0,y:T(20,"round"),x:{align:"center"}}]},Cg:{Qv:[{s:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,x:0,y:0}],gc:{n:Y.n,align:"center",i:"middle",fillColor:"#a7e7fb",fontSize:U({big:36,small:18})},lu:{n:Y.n,fontSize:U({big:34,small:18}),fillColor:"#1c2689",align:"center"},Ip:{n:Y.n,fontSize:U({big:34,small:18}),fillColor:"#1c2689",
align:"center"}},gm:{Xj:-de.height,ir:{n:Y.n,align:"center",i:"top",fontSize:U({big:26,small:13}),fillColor:"#435999"},jr:{align:"center"},kr:T(492,"round"),Zi:T(500),En:T(80),ys:{n:Y.n,fontSize:U({big:50,small:25}),fillColor:"#ff5800",align:"center",i:"middle"},As:{align:"center"},Bs:T(450,"round")},ra:{Pb:{align:"center"},Hb:T(14),Xj:"undefined"!==typeof he?-he.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof s_overlay_level_win?-s_overlay_level_win.height:
0,Wj:[{type:"y",za:0,duration:800,end:T(14),Qa:P,cl:!0}],ym:[{type:"y",za:0,duration:600,end:"undefined"!==typeof he?-he.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof s_overlay_level_win?-s_overlay_level_win.height:0,Qa:gc,cl:!0}],gc:{n:Y.n,align:"center",i:"middle",fontSize:U({big:44,small:22}),fillColor:"#ffd8ea"},XC:!0,zc:T(65),io:{n:Y.n,align:"center",i:"top",fillColor:"#346c26",fontSize:U({big:36,small:18})},Dh:T(186),qj:{n:Y.n,align:"center",
i:"top",fillColor:"#ff6600",fontSize:U({big:72,small:36})},jk:{n:Y.n,i:"bottom",fillColor:"#0c6a70",fontSize:U({big:36,small:18})},Jf:T(322),Jd:T(4),Xg:{n:Y.n,i:"bottom",fillColor:"#0c6a70",fontSize:U({big:30,small:15})},EB:{n:Y.n,align:"center",i:"middle",fontSize:U({big:72,small:36}),fillColor:"#83681f"}},options:{Hb:T(14),Uj:800,Vj:P,wm:600,xm:gc,Im:{align:"center",i:"middle",fontSize:U({big:26,small:13}),fillColor:"#ff6600"},gc:{n:Y.n,align:"center",i:"middle",fontSize:U({big:44,small:22}),fillColor:"#83681f"},
sk:{i:"middle",align:"center",fontSize:U({big:26,small:13}),fillColor:"#004f5d"},tk:{align:"center",i:"top",fontSize:U({big:36,small:18}),fillColor:"#004f5d"}},Jl:{font:{n:Y.n,align:"center",i:"middle",fontSize:U({big:72,small:36}),fillColor:"#037564",stroke:!0,rd:T(5,"round"),strokeColor:"#ffffff",Qe:!0}},rl:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:ee,Lp:{n:Y.n,align:"center",i:"middle",fontSize:T(30),fillColor:"#83681F",rb:T(6),fontWeight:"bold"},
nq:{n:Y.n,align:"center",i:"middle",fontSize:T(24),fillColor:"#435999",rb:T(6),fontWeight:"bold"}},kl:{gc:{n:Y.n,align:"center",i:"top",fillColor:"#FF5800",fontSize:T(44),fontWeight:"bold"},Dt:{n:Y.n,align:"center",i:"middle",fillColor:"#435999",fontSize:T(34),fontWeight:"bold"},St:{n:Y.n,align:"center",i:"top",fontSize:T(30),fillColor:"#0C6A70",fontWeight:"bold"},Rt:{n:Y.n,align:"center",i:"top",fontSize:T(34),fillColor:"#8D331C",fontWeight:"bold"},rv:{n:Y.n,align:"center",i:"top",fontSize:T(30),
fillColor:"#0C6A70",fontWeight:"bold"},qv:{n:Y.n,fontSize:T(34),fillColor:"#FF5800",fontWeight:"bold"},sv:T(420),tv:T(460),Tt:T(328),Ut:T(368)},jl:{Ig:{n:Y.n,align:"center",i:"middle",fillColor:"#FF5800",fontSize:T(40),rb:T(6),fontWeight:"bold"},up:{n:Y.n,align:"center",i:"middle",fontSize:T(26),fillColor:"#435999",fontWeight:"bold"},ho:{n:Y.n,align:"center",i:"middle",fontSize:T(30),fillColor:"#0C6A70",fontWeight:"bold"},zk:{n:Y.n,align:"center",i:"middle",fontSize:T(30),fillColor:"#0C6A70",fontWeight:"bold"},
zf:T(66),Cu:T(350),Gr:T(450),dA:{n:Y.n,align:"center",i:"middle",fillColor:"#FF5800",fontSize:T(32),rb:T(6),fontWeight:"bold"},Au:T(480)},Bp:{Wn:{n:Y.n,align:"center",i:"middle",fontSize:T(30),fillColor:"#83681F",rb:T(6),fontWeight:"bold"},Ig:{n:Y.n,align:"center",i:"middle",fontSize:T(30),fillColor:"#83681F",rb:T(6),fontWeight:"bold"},gc:{n:Y.n,align:"center",i:"middle",fontSize:T(38),fillColor:"#83681F",fontWeight:"bold"},sk:{i:"middle",align:"center",fontSize:U({big:26,small:13}),fillColor:"#004f5d",
fontWeight:"bold"},tk:{align:"center",i:"top",fontSize:U({big:36,small:18}),fillColor:"#004f5d",fontWeight:"bold"},zc:T(180)}}}S.l=S.l||{};S.l.Ww=function(){var a=S.Wz;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};S.l.Tl=function(){S.b.Zc()};S.l.$B=function(){};S.l.jm=function(){};S.l.Ul=function(){S.b.Zc()};S.l.XB=function(){};S.l.WB=function(){};S.l.ZB=function(){};S.l.Ms=function(){};S.l.Ks=function(){};S.l.Ls=function(){};S.l.YB=function(){};S.l.Yw=function(){S.b.Zc()};
S.l.Zw=function(){S.b.Zc()};S.l.Lh=function(){S.b.Zc()};S.l.Xw=function(){S.b.Zc()};S.l.ss=function(a,b){void 0===S.b.Ke&&(S.b.Ke=new Tf(!0));return Uf(a,b)};S.l.Aq=function(a){void 0===S.b.Ke&&(S.b.Ke=new Tf(!0));return Vf(a)};S.l.Cd=function(a){window.open(a)};S.l.Dj=function(){return[{e:id,url:S.A.Hs}]};S.l.kx=function(){};S.Od=S.Od||{};S.Od.Tl=function(){S.b.yk=!1};S.Od.jm=function(){};S.Od.Ul=function(){S.b.yk=!1};S.Od.Lh=function(){S.b.yk=!1};
function Wf(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function Xf(a,b,c,d){this.fn=this.Gh=a;this.mw=b;this.duration=1;this.Ir=d;this.cd=c;this.il=null;this.eb=0}function Yf(a,b){a.eb+=b;a.eb>a.duration&&a.il&&(a.il(),a.il=null)}Xf.prototype.J=function(){if(this.eb>=this.duration)return this.cd(this.duration,this.Gh,this.fn-this.Gh,this.duration);var a=this.cd(this.eb,this.Gh,this.fn-this.Gh,this.duration);this.Ir&&(a=this.Ir(a));return a};
function Zf(a,b){a.Gh=a.J();a.fn=b;a.duration=a.mw;a.il=void 0;a.eb=0}S.Bw=void 0!==S.environment?S.environment:"development";S.XA=void 0!==S.ga?S.ga:S.Bw;"undefined"!==typeof S.mediaUrl?oa(S.mediaUrl):oa(S.size);S.Mv="backButton";S.Bg="languageSet";S.Cf="resizeEvent";S.version={builder:"1.8.3.0","build-time":"11:40:42","build-date":"02-05-2020",audio:I.$a?"web audio api":I.Sa?"html5 audio":"no audio"};
S.iB=new function(){this.of=this.Lx=3;da.u.ji&&(this.of=3>da.Oa.Xe?1:4.4>da.Oa.Xe?2:3);da.Oa.dm&&(this.of=7>da.Oa.Xe?2:3);da.Oa.Gq&&(this.of=8>da.Oa.Xe?2:3);S.version.browser_name=da.name;S.version.browser_version=da.u.version;S.version.os_version=da.Oa.version;S.version.browser_grade=this.of};S.a={};"function"===typeof Mf&&Mf();"function"===typeof Qf&&Qf();"function"===typeof Sf&&Sf();"function"===typeof initGameThemeSettings&&initGameThemeSettings();S.a.w="undefined"!==typeof Kf?Kf:{};
S.a.K="undefined"!==typeof Pf?Pf:{};S.a.R="undefined"!==typeof Rf?Rf:{};S.a.OB="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};S.Wh=window.publisherSettings;S.A="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof Nf&&(S.A=Nf);if("undefined"!==typeof Of)for(var $f in Of)S.A[$f]=Of[$f];
(function(){var a,b,c,d,g;S.j={};S.j.Vq="undefined"!==typeof V?V:{};S.j.gb=void 0!==S.A.He&&void 0!==S.A.He.Vk?S.A.He.Vk:S.a.w.He.Vk;g=[];for(b=0;b<S.j.gb.length;b++)g.push(S.j.gb[b]);if(S.A.jA)for(b=S.j.gb.length-1;0<=b;b--)0>S.A.jA.indexOf(S.j.gb[b])&&S.j.gb.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=S.j.gb.length-1;0<=
b;b--)0>c.indexOf(S.j.gb[b])&&S.j.gb.splice(b,1)}catch(h){}0===S.j.gb.length&&(0<g.length?S.j.gb=g:S.j.gb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<S.j.gb.length;d++)if(0<=S.j.gb[d].search(g)){a=S.j.gb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==S.A.He&&void 0!==S.A.He.am?S.A.He.am:S.a.w.He.am);S.j.un=0<=S.j.gb.indexOf(a)?a:S.j.gb[0];S.j.Hk=S.j.Vq[S.j.un];
if(void 0!==S.a.w.Xb.language_toggle&&void 0!==S.a.w.Xb.language_toggle.X){a=S.a.w.Xb.language_toggle.X;c=[];for(b=0;b<a.length;b++)0<=S.j.gb.indexOf(a[b].id)&&c.push(a[b]);S.a.w.Xb.language_toggle.X=c}S.j.q=function(a,b){var c,d,g,h;if(void 0!==S.j.Hk&&void 0!==S.j.Hk[a]){c=S.j.Hk[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=da.pg.Hu||da.pg.At)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};S.j.Yt=function(a){S.j.un=
a;S.j.Hk=S.j.Vq[a];ta(S.Bg,a)};S.j.Io=function(){return S.j.un};S.j.Ow=function(){return S.j.gb};S.j.px=function(a){return 0<=S.j.gb.indexOf(a)}})();S.rw={Oa:"",Ny:"",mC:"",ao:""};S.c={};
S.c.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};S.c.sq=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
S.c.Mj=function(a){function b(){}b.prototype=ag.prototype;a.prototype=new b};S.c.Fz=function(a,b,c,d,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));S.te.push(l);return l};
(function(){var a,b,c,d,g,h,k;S.Ts=0;S.Us=0;S.Nm=!1;S.GA=da.u.ji&&da.u.Xe&&4<=da.u.Xe;S.Ak=!1;S.hv=da.pg.Hu||da.pg.At;S.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===S.orientation?S.a.w.Tn:S.a.w.te;h="landscape"===S.orientation?S.a.K.Tn:S.a.K.te;if(void 0!==h){if(void 0!==h.wd)for(a in h.wd)k.wd[a]=h.wd[a];if(void 0!==h.Xc)for(a in h.Xc)k.Xc[a]=h.Xc[a]}b=function(){var a,b,c,d;if(S.GA&&!S.Ak){S.Ak=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){S.Ak=!1;return}b=document.createEvent("Event");b.nC=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);S.Ak=!1},100)}};c=function(){var a,c,d,g,h,B,r,s,u;"landscape"===S.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.Bh,k.ad],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.ad,k.Zb],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];B=d/c[1];h<g?(h=h<B?Math.floor(a[0]/B):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));r=h/c[1];!S.hv&&1<r&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),r=1);a="landscape"===S.orientation?g:h;c="landscape"===S.orientation?h:g;u=s=0;window.innerHeight<Math.floor(k.ad*r)&&(s=Math.max(k.rm,window.innerHeight-Math.floor(k.ad*r)));window.innerWidth<Math.floor(k.Zb*r)&&(u=Math.floor(Math.max(k.Bh-k.Zb,(window.innerWidth-Math.floor(k.Zb*r))/r)),window.innerWidth<Math.floor(k.Zb*r)+u*r&&(u+=Math.floor(Math.max((d-k.Bh)/2,(window.innerWidth-(k.Zb*r+u*r))/2/r))));S.$k=k.ad-k.Qr;S.Rv=k.Zb-k.Bh;S.ja=s;S.kB=u;S.jB=Math.min(S.Rv,-1*S.lB);S.nf=(k.Xc.top||
k.mg)-S.ja;S.ba={top:-1*s,left:-1*u,height:Math.min(k.ad,Math.round(Math.min(c,window.innerHeight)/r)),width:Math.min(k.Zb,Math.round(Math.min(a,window.innerWidth)/r))};S.GC="landscape"===S.orientation?{top:0,left:Math.floor((k.Bh-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.rm),left:k.lg,width:k.Zb,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===S.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,l,n;g=void 0!==b.top?b.top:k.mg;h=void 0!==b.left?b.left:k.lg;l=void 0!==b.width?b.width:k.Zb;n=void 0!==b.height?b.height:k.ad;a.xB=Math.floor(r*g);a.wB=Math.floor(r*h);a.yB=Math.floor(r*l);a.vB=Math.floor(r*
n);!1!==c&&(g+=s);!1!==d&&(h+=u);a.setAttribute("style","position:absolute; left:"+Math.floor(r*h)+"px; top:"+Math.floor(r*g)+"px; width:"+Math.floor(r*l)+"px; height:"+Math.floor(r*n)+"px; z-index: "+b.depth)};d(S.In,k.Sn);d(S.vo,k.wd);d(S.Fo,k.Xc,!1,!0);d(S.Ie,k.gg);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);ta(S.Cf)};a=function(){if(S.Ts===window.innerHeight&&S.Us===window.innerWidth||S.Nm)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;S.Nm=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,da.u.ji?1:0);g--;if((da.u.ji?0:window.innerHeight>d)||0>g)S.Us=window.innerWidth,S.Ts=window.innerHeight,clearInterval(S.Nm),S.Nm=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};S.$b=k.wd.left||k.lg;S.ac=k.wd.top||k.mg;S.Ql=k.wd.width||k.Zb;S.vg=k.wd.height||k.ad;S.wg=k.Xc.left||k.lg;S.nf=k.Xc.top||k.mg;S.QB=k.Xc.width||k.Zb;
S.PB=k.Xc.height||k.ad;S.Gx=k.gg.left||k.lg;S.Hx=k.gg.top||k.mg;S.Ix=k.gg.width||k.Zb;S.Fx=k.gg.height||k.ad;h=function(a){return S.c.Fz(a.id,a.depth,void 0!==a.top?a.top:k.mg,void 0!==a.left?a.left:k.lg,void 0!==a.width?a.width:k.Zb,void 0!==a.height?a.height:k.ad)};S.te=[];S.In=h(k.Sn);S.vo=h(k.wd);S.Fo=h(k.Xc);S.Ie=h(k.gg);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);S.Mc={};S.Mc[S.zj]=S.In;S.Mc[S.Hh]=S.vo;S.Mc[S.Pl]=S.Fo;S.Mc[S.mf]=S.Ie;S.Mc[S.ug]=S.In;S.Mc[S.jb]=S.Ie;S.Mc[S.De]=S.Ie})();
S.c.Hv=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=pa.af+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),S.Tv=!0,S.aj=!0,b=function(a){S.Tv&&S.aj&&(S.l.Cd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){S.aj&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){S.aj&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};S.c.MC=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";S.aj=!0}};
S.c.VB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";S.aj=!1}};S.c.Ho=function(a){return a===S.vo?{x:S.$b,y:S.ac}:a===S.Fo?{x:S.wg,y:S.nf}:{x:S.Gx,y:S.Hx}};S.c.xg=function(a){return S.Mc[a]};S.c.Kb=function(a){return S.Mc[a]?(m.canvas!==S.Mc[a]&&m.Kb(S.Mc[a]),!0):!1};S.c.Ga=function(a,b){if(S.Mc[b]){var c=K;a.Ea!==b&&(c.Oi=!0);a.Ea=b;a.canvas=S.Mc[b]}};
S.c.g=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
S.c.ka=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};S.c.pB=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};S.ia=S.ia||{};S.ia.Jz=!1;S.ia.Os=function(a){a instanceof Array&&(this.Kl=a[0],this.Om=a[1],this.Uv="https://api.gameanalytics.com/v2/"+this.Kl,this.Ps=!0)};
S.ia.Xf=function(a,b){var c,d=JSON.stringify(b),g=window.Crypto.HmacSHA256(d,this.Om),g=window.Crypto.enc.Base64.stringify(g),h=this.Uv+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.Jz&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
S.ia.Ac={Pq:"user",Oq:"session_end",vv:"business",wv:"resource",Bk:"progression",pn:"design",ERROR:"error"};S.ia.Tf=function(){return{user_id:this.Eq,session_id:this.Dz,build:this.cw,device:this.ao,platform:this.platform,os_version:this.Oy,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
S.ia.lb=function(a,b,c,d,g,h,k){this.Dz=a;h&&"object"===typeof h&&(this.Eq=h.Eq);this.cw=g;this.h=!0;this.Ps&&(this.ao=k.ao,this.platform=k.Oa,this.Oy=k.Ny);this.Xf("init",this.Tf())};S.ia.aA=function(a){var b=this.Tf(),c=[];b.category=a;c.push(b);this.Xf("events",c)};S.ia.lo=function(a,b,c,d){a=[];b=this.Tf();b.length=Math.floor(c);b.category=d;a.push(b);this.Xf("events",a)};
S.ia.Va=function(a,b,c,d){var g=[],h=!1;if(this.h&&this.Ps){if(d)switch(d){case S.ia.Ac.Pq:this.aA(d);h=!0;break;case S.ia.Ac.Oq:this.lo(0,0,c,d);h=!0;break;case S.ia.Ac.vv:h=!0;break;case S.ia.Ac.wv:h=!0;break;case S.ia.Ac.Bk:this.Ew(a,b,c,d);h=!0;break;case S.ia.Ac.pn:this.Cw(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.Tf(),b.event_id=d+":"+a,b.value=c,g.push(b),this.Xf("design",g))}};S.ia.FC=function(a,b,c){this.Va(a,b,c)};S.ia.CB=function(){};
S.ia.DB=function(){};S.ia.Ew=function(a,b,c,d){var g=[],h=this.Tf();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}g.push(h);this.Xf("events",g)};S.ia.Cw=function(a,b,c,d){var g=[],h=this.Tf();h.category=d;h.event_id=a+b;h.value=c;g.push(h);this.Xf("events",g)};S.ia.Ot=function(a,b){var c=[],d=this.Tf();d.category="error";d.message=a;d.severity=b;c.push(d);this.Xf("events",c)};
function bg(){this.Ea=this.depth=0;this.visible=!1;this.h=!0;this.a=S.a.w.Ha;this.$y=this.a.zA;L(this);Sb(this,"system")}function cg(){var a=dg("userId","");""===a&&(a=eg(),fg("userId",a));return a}function eg(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=bg.prototype;e.start=function(a){S.ia.Os(a);S.ia.lb(eg(),S.a.K.sg.xo,S.a.R.id,S.A.az,gg(),{Eq:cg()},S.rw)};e.Va=function(a,b,c,d){S.ia.Va(a,b,c,d)};
function hg(a,b,c,d){var g,h;for(g=0;g<a.ea.length;g++)void 0!==a.ea[g]&&a.ea[g].tag===b&&(h=a.ea[g],a.Va(c,d,h.k/1E3,S.ia.Ac.Oq),h.h=!1)}function ig(){var a=S.Ha,b=S.b.eh,c;for(c=0;c<a.ea.length;c++)void 0!==a.ea[c]&&a.ea[c].tag===b&&(a.ea[c].paused+=1)}e.Ot=function(a,b){S.ia.Ot(a,b)};e.cc=function(){this.ea=[]};
e.V=function(a){var b,c=0;for(b=0;b<this.ea.length;b++)this.ea[b].h&&(0===this.ea[b].paused&&(this.ea[b].k+=a),c=b);c<this.ea.length-1&&(a=this.ea.length-Math.max(this.$y,c+1),0<a&&this.ea.splice(this.ea.length-a,a))};
function Tf(a,b,c){this.nt=a||!1;this.host=b||"http://localhost:8080";this.Cz=c||this.host+"/services/storage/gamestate";this.Eu="undefined"!==typeof window.localStorage;this.Xo=this.Cq=!1;var d=this;window.parent!==window&&(da.u.Vp||da.Oa.dm)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.Cq="ok"===a.result:"getItem"===b&&d.Rl&&("ok"===a.result?d.Rl(a.value):d.Rl(a.defaultValue))},!1),this.Rl=null,window.parent.postMessage({command:"init"},"*"));this.Tj=[];
window.setTimeout(function(){d.Xo=!0;for(var a=0;a<d.Tj.length;++a)d.Tj[a]();d.Tj=[]},2E3)}function jg(){return"string"===typeof S.A.xu&&""!==S.A.xu?S.A.xu:void 0!==S.a.K.sg&&void 0!==S.a.K.sg.xo?S.a.K.sg.xo:"0"}function Uf(a,b){var c=S.b.Ke;"function"===typeof b&&(c.Xo?kg(c,a,b):c.Tj.push(function(){kg(c,a,b)}))}function Vf(a){var b=S.b.Ke;b.Xo?lg(b,a):b.Tj.push(function(){lg(b,a)})}
function lg(a,b){var c=null,d=jg();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.Cq)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.Eu)try{window.localStorage.setItem(d,c)}catch(h){}a.nt||(c=new vb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),wb(c,a.Cz+"/my_ip/"+d))}}
function kg(a,b,c){var d=null,g=null,h=jg();if(a.Cq)a.Rl=function(a){var g;try{d=JSON.parse(a),g=JSON.parse(d.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.Eu)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.nt||(a=new vb("gameState_"+h),g=null,xb(a,Tf.DC+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(g&&Date.parse(g.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(d.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(l){c(b);return}c(b)}}
function mg(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.wb=this.visible=!1!==c;this.h=!0;S.c.Ga(this,S.jb);var d;this.a=S.a.w.Bd;if("landscape"===S.orientation&&S.a.w.hp)for(d in S.a.w.hp)this.a[d]=S.a.w.hp[d];for(d in S.a.R.Bd)this.a[d]=S.a.R.Bd[d];if(S.A.Bd)for(d in S.A.Bd)this.a[d]=S.A.Bd[d];this.Yb=a;this.Fr=b;this.Ur=!1;this.$i=0;this.Jn=!1;this.Yk=0;this.Xk=
this.a.Pv;this.Op=!0;this.Bx=.6/Math.log(this.a.lm+1);this.ov=void 0!==S.A.Ax?S.A.Ax:this.a.jy;this.Mx=this.ov+this.a.Px;L(this)}e=mg.prototype;e.aq=function(a){var b;S.c.Kb(S.ug);xa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=X.I();(S.A.Bd&&S.A.Bd.mk||this.a.mk)&&C(b,S.A.Bd&&S.A.Bd.mk?S.A.Bd.mk:this.a.mk);a=S.j.q(a,"<"+a.toUpperCase()+">");b.p(a,this.canvas.width/2,this.canvas.height/2,this.a.bn);this.error=!0;this.visible=this.wb=!1;this.canvas.T=!0};
e.Le=function(){this.sa&&(this.Eb=S.c.g(this.a.Eb,S.ba.width,this.sa.width)+S.ba.left,this.Oc=S.c.g(this.a.Oc,S.ba.height,this.sa.height)+S.ba.top)};
e.Zn=function(){var a,b,c,d,g,h;if("function"===typeof S.l.Dj&&(h=this.a.Hg,(this.Fa=S.l.Dj())&&0<this.Fa.length)){this.sa?this.sa.clear():this.sa=new w(this.a.Hg,this.a.Rj);x(this.sa);h/=this.Fa.length;for(c=0;c<this.Fa.length;c++)try{g=this.Fa[c].e,d=Math.min(1,Math.min((h-20)/g.width,this.a.Rj/g.height)),a="center"===this.a.Pj?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.sa.height-g.height*d,g instanceof p?g.$(0,a,b,d,d,0,1):m.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}y(this.sa);this.km=0;this.jp=!0;this.Qj=0;this.Gg=Xb(0,0,this.sa.width,this.sa.height);this.Le()}};
e.Ka=function(){var a,b,c,d;this.Op?m.clear():S.c.Kb(S.ug);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(S.ja),1<d.G){c=(m.canvas.height-a)/d.Ah;b=-(d.gj*c-m.canvas.width)/2;c=m.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.$i;for(h=0;h<d.G;h+=1)k=b+h%d.Th*d.width,l=a+d.height*Math.floor(h/d.Th),d.Pf.xa(d.Lf[h],d.Mf[h],d.Nf[h],d.Se[h],d.Re[h],k-d.Nb+d.Te[h],l-d.Ob+d.Ue[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof p?d.$(0,b,a,c,c,0,this.$i):d instanceof w&&d.$(b,a,c,c,0,this.$i);d=this.a.uf+this.a.fp+this.a.Mh;b=wc.height;a=wc.width-(this.a.uf+this.a.fp);this.Nh=S.c.g(this.a.Nh,m.canvas.width,d);this.Fg=S.c.g(this.a.Fg,m.canvas.height,b);wc.xa(0,0,0,this.a.uf,b,this.Nh,this.Fg,1);wc.vl(0,this.a.uf,0,a,b,this.Nh+this.a.uf,this.Fg,this.a.Mh,b,1);wc.xa(0,this.a.uf+a,0,this.a.fp,b,this.Nh+this.a.uf+this.a.Mh,this.Fg,1)};
function ng(a){a.Op&&(a.Jn=!0);a.visible&&(a.Ka(),a.Zn(),"function"===typeof S.l.Ko&&(a.Pe=S.l.Ko(),a.Pe instanceof w&&(a.fi=!0,a.fu=Math.floor((a.canvas.width-a.Pe.width)/2),a.gu=Math.floor((a.canvas.height-a.Pe.height)/2))));S.b.im&&pa.ge("audio");S.b.hm&&pa.ge("audio_music");pa.ge("fonts")}
e.cc=function(){var a,b=!1;if(void 0!==S.A.fk)if(!1===S.A.fk.Cx)b=!0;else{if(void 0!==S.A.fk.co)for(a=0;a<S.A.fk.co.length;a++){var c;a:{c=S.A.fk.co[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===og("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,og(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof S.A.xA&&(new Date).getTime()>S.A.xA&&(b=!1);b?(this.wh=[],this.error=!1,this.Ou=this.to=this.Uk=this.k=0,this.ready=this.fi=!1,this.yx=void 0!==this.a.lt?this.a.lt:this.a.uf-this.a.Oj,this.zx=void 0!==this.a.mt?this.a.mt:Math.floor((wc.height-re.height)/2),this.gp=re.width-(this.a.Oj+this.a.kt),this.so=this.Ct=this.lr=!1,(this.ik=pa.complete("start"))&&ng(this),this.jt=pa.complete("load"),this.visible&&(this.Pu=document.getElementById("throbber_image"),
this.Ve=this.a.Ve,this.rq=S.c.g(this.a.rq,this.canvas.width,this.Ve),this.cn=S.c.g(this.a.cn,this.canvas.height,this.Ve))):K.pause()};
e.V=function(a){this.k+=a;"function"===typeof S.l.Ko&&void 0===this.Pe&&(this.Pe=S.l.Ko(),this.Pe instanceof w&&(this.fi=!0,this.fu=Math.floor((this.canvas.width-this.Pe.width)/2),this.gu=Math.floor((this.canvas.height-this.Pe.height)/2)));this.fi&&0<=this.a.hu&&this.k>=this.a.hu&&(this.fi=!1);this.Jn&&(this.Yk+=a,this.Yk>=this.Xk?(this.Jn=!1,this.$i=1):this.$i=gc(this.Yk,0,1,this.Xk));this.ik&&(this.Uk+=a,this.to+=a);this.Ou=Math.round(this.k/this.a.vA%(this.a.wA-1));this.jp&&(this.km=0+this.Qj/
this.a.ip*1,this.Qj+=a,this.Qj>=this.a.ip&&(this.jp=!1,this.km=1));"function"===typeof this.Fr&&this.Fr(Math.round((ra("load")+ra("audio")+ra("audio_music"))/2));!this.ready&&this.jt&&(this.so||this.to>=this.a.lm)&&(!S.b.im||this.lr||I.Sa&&this.Uk>=this.a.lm)&&(!S.b.hm||this.Ct||I.Sa&&this.Uk>=this.a.lm)&&(this.ready=!0);if(a=!this.Ur&&!this.error&&this.ready&&this.k>=this.ov)a=S.b,a=(a.Fc&&a.bb&&!a.bb.ox()?!1:!0)||this.k>=this.Mx;a&&(this.Ur=!0,this.Yb())};
e.Jh=function(a,b,c){!this.fi&&this.Gg&&Zb(this.Gg,this.Eb,this.Oc,b,c)&&(this.mb=Math.floor((b-this.Eb)/(this.sa.width/this.Fa.length)))};e.Kh=function(a,b,c){void 0!==this.mb&&(this.Fa[this.mb].url||this.Fa[this.mb].action)&&Zb(this.Gg,this.Eb,this.Oc,b,c)&&(b-=this.Eb,b>=this.sa.width/this.Fa.length*this.mb&&b<this.sa.width/this.Fa.length*(this.mb+1)&&(this.Fa[this.mb].url?S.l.Cd(this.Fa[this.mb].url):this.Fa[this.mb].action()));this.mb=void 0};
e.jd=function(a,b){"Load Complete"===a&&"start"===b.Ya?(this.ik=!0,ng(this)):"Load Complete"===a&&"load"===b.Ya?this.jt=!0:"Load Complete"===a&&"audio"===b.Ya?this.lr=!0:"Load Complete"===a&&"audio_music"===b.Ya?this.Ct=!0:"Load Complete"===a&&"fonts"===b.Ya&&(this.so=!0);a===S.Cf&&this.Le()};
e.qa=function(){if(!this.error){this.Op&&this.ik?this.Ka():m.clear();try{this.Pu&&m.context.drawImage(this.Pu,this.Ve*this.Ou,0,this.Ve,this.Ve,this.rq,this.cn,this.Ve,this.Ve)}catch(a){}if(this.ik){var b=0,c=this.Nh+this.yx,d=this.Fg+this.zx,g=re.height;re.xa(0,b,0,this.a.Oj,g,c,d,1);b+=this.a.Oj;c+=this.a.Oj;this.ready?(re.vl(0,b,0,this.gp,g,c,d,this.a.Mh,g,1),b+=this.gp,c+=this.a.Mh,re.xa(0,b,0,this.a.kt,g,c,d,1)):re.vl(0,b,0,this.gp,g,c,d,Math.floor(Math.min((ra("load")+ra("audio"))/500+this.Bx*
Math.log(this.k+1),1)*this.a.Mh),g,1);this.sa&&this.sa.pc(this.Eb,this.Oc,this.km)}this.fi&&this.Pe.p(this.fu,this.gu)}};
function pg(){var a,b;b=this;this.depth=100;this.h=this.visible=!0;S.c.Ga(this,S.jb);this.a=S.a.w.Um;if("landscape"===S.orientation&&S.a.w.jq)for(a in S.a.w.jq)this.a[a]=S.a.w.jq[a];this.Xb=S.a.w.Xb;if("landscape"===S.orientation&&S.a.w.Qn)for(a in S.a.w.Qn)this.Xb[a]=S.a.w.Qn[a];for(a in S.a.R.Um)this.a[a]=S.a.R.Um[a];this.wh=[];a=qg(S.b);this.Hr=void 0!==a&&null!==a;this.Y=new ac;this.Y.pa(this.a.Iw,function(){b.pu.call(b)});this.Y.pa(this.a.Ht,function(){b.ru.call(b)});this.Y.pa(S.m.Rm&&!this.Hr?
this.a.Wy:this.a.Ht,function(){b.su.call(b)});this.Y.pa(this.a.ay,function(){b.qu.call(b)});L(this,!1)}e=pg.prototype;e.pu=function(){this.Ml=!0;this.a.Ih&&(this.Bj=S.c.g(this.a.Bj,this.canvas.width,je.width),this.Ll=S.c.g(this.a.Ll,this.canvas.width,je.width),this.Cj=S.c.g(this.a.Cj,this.canvas.height,je.height),this.Aj=S.c.g(this.a.Aj,this.canvas.height,je.height),this.Eo=this.Bj,this.Nl=this.Cj,this.zo=this.a.Co,this.Ao=this.a.Do,this.yo=this.a.Bo,this.Kc=0,this.Le())};
e.ru=function(a){function b(a,b,c,d){return mc(a,b,c,d,3,15)}var c,d;S.m.Rm&&!this.Hr&&(c=S.c.g(this.a.Tr,this.canvas.width,this.a.lj,Math.floor(this.a.lj/2)),d=S.c.g(this.a.tl,this.canvas.height,Wd.height,Math.floor(Wd.height/2)),c=new rg("difficulty_toggle",c,d,this.depth-20,sg()+"",this.a.lj,{S:function(a){tg(parseInt(a,10));return!0},dc:!0}),c.uc=Math.floor(this.a.lj/2),c.vc=Math.floor(Wd.height/2),!1!==a&&(ug(c,"xScale",b,0,1,this.a.Sr),ug(c,"yScale",b,0,1,this.a.Sr)),this.sl=c,this.tl=c.y,this.wh.push(c),
this.Le())};
e.su=function(a){function b(a,b,c,d){return mc(a,b,c,d,3,15)}var c,d=this;this.Hp=!0;c=new vg("bigPlay",S.c.g(this.a.Vy,this.canvas.width,this.a.Yj,Math.floor(this.a.Yj/2)),S.c.g(this.a.Dm,this.canvas.height,be.height,Math.floor(be.height/2)),this.depth-20,"startScreenPlay",this.a.Yj,{S:function(){M(K,d);var a=S.b,b,c,l;void 0===S.b.fc&&(void 0!==S.a.R.fc&&(void 0!==S.a.R.fc.Sv&&(b=S.a.R.fc.Sv),void 0!==S.a.R.fc.Kn&&(I.de("music",S.a.R.fc.Kn),a.Ng()||rb("music"),S.b.sy=S.a.R.fc.Kn),c=void 0!==S.a.R.fc.Ov?
S.a.R.fc.Ov:0,l=void 0!==S.a.R.fc.Xk?S.a.R.fc.Xk:0),void 0===b&&"undefined"!==typeof hf&&(b=hf),void 0!==b&&(S.b.fc=I.play(b,c,l),S.b.fc&&(I.er(S.b.fc,"music"),I.Zt(S.b.fc,!0))));S.m.bi&&!a.Fc?a.screen=new wg:xg(a,0);return!0},dc:!0});c.uc=Math.floor(this.a.Yj/2);c.vc=Math.floor(be.height/2);!1!==a?(ug(c,"xScale",b,0,1,this.a.Bm),ug(c,"yScale",b,0,1,this.a.Bm),this.Cm=0):this.Cm=this.a.Bm;this.Am=c;this.Dm=c.y;this.wh.push(c);this.Le()};
function yg(a){var b=Q([P,function(a,b,g,h){return mc(a,b,g,h,3,2)},N],[!0,!1,!1],[.02,.1,.88]);a.Lt=!0;ug(a.Am,"xScale",oc(b),1,.25,4E3);ug(a.Am,"yScale",oc(b),1,-.1,4E3)}e.qu=function(a){var b;this.wt=!0;b=new ag(S.c.g(this.a.rp,this.canvas.width,Td.width),S.c.g(this.a.pm,this.canvas.height,Td.height),this.depth-20,new Yb(Td),[Td],{S:S.b.Oe,dc:!0});!1!==a&&ug(b,"alpha",O,0,1,this.a.$x);this.qp=b;this.pm=b.y;this.wh.push(b);this.Le()};
e.Ka=function(){var a,b,c,d;if(a=this.a.backgroundImage)S.c.Kb(S.ug),c=Math.abs(S.ja),1<a.G?(b=(m.canvas.height-c)/a.Ah,d=-(a.gj*b-m.canvas.width)/2,Ba(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.$(0,d,c,b,b,0,1))};
e.Zn=function(){var a,b,c,d,g,h;if("function"===typeof S.l.Dj&&(h=this.a.Hg,(this.Fa=S.l.Dj())&&0<this.Fa.length)){this.sa?this.sa.clear():this.sa=new w(this.a.Hg,this.a.Rj);x(this.sa);h/=this.Fa.length;for(c in this.Fa)try{g=this.Fa[c].e,d=Math.min(1,Math.min((h-20)/g.width,this.a.Rj/g.height)),a="center"===this.a.Pj?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.sa.height-g.height*d,g instanceof p?g.$(0,a,b,d,d,0,1):m.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}y(this.sa);
this.km=0;this.jp=!0;this.Qj=0;this.Gg=Xb(0,0,this.sa.width,this.sa.height);this.Le()}};e.Le=function(){var a;a=0;S.ba.height<this.a.On&&(a=this.a.On-S.ba.height);this.Hp&&(this.Am.y=this.Dm-a);this.wt&&(this.qp.y=this.pm-a,this.qp.x=S.c.g(this.a.rp,S.ba.width,Td.width)+S.ba.left);this.sl&&(this.sl.y=this.tl-a);this.Ml&&this.Kc>=this.a.Ad&&(this.Nl=this.Aj-S.ja);this.sa&&(this.Eb=S.c.g(this.a.Eb,S.ba.width,this.sa.width)+S.ba.left,this.Oc=S.c.g(this.a.Oc,S.ba.height,this.sa.height)+S.ba.top)};
e.cc=function(){this.Ka();this.a.Ih&&(S.c.Kb(S.jb),this.a.Ih.p(0,0,-this.a.Ih.height-10));this.Zn();this.Y.start()};e.kb=function(){var a;for(a=0;a<this.wh.length;a++)M(K,this.wh[a])};
e.V=function(a){this.canvas.T=!0;this.Ml&&this.Kc<this.a.Ad&&(this.Eo=this.a.Mw(this.Kc,this.Bj,this.Ll-this.Bj,this.a.Ad),this.Nl=this.a.Nw(this.Kc,this.Cj,this.Aj-this.Cj,this.a.Ad)-S.ja,this.zo=this.a.Kw(this.Kc,this.a.Co,this.a.qs-this.a.Co,this.a.Ad),this.Ao=this.a.Lw(this.Kc,this.a.Do,this.a.rs-this.a.Do,this.a.Ad),this.yo=this.a.Jw(this.Kc,this.a.Bo,this.a.ps-this.a.Bo,this.a.Ad),this.Kc+=a,this.Kc>=this.a.Ad&&(this.Eo=this.Ll,this.Nl=this.Aj-S.ja,this.zo=this.a.qs,this.Ao=this.a.rs,this.yo=
this.a.ps));this.Hp&&(!this.Lt&&this.Cm>=this.a.Bm+this.a.Uy&&yg(this),this.Cm+=a)};e.Jh=function(a,b,c){this.Gg&&Zb(this.Gg,this.Eb,this.Oc,b,c)&&(this.mb=Math.floor((b-this.Eb)/(this.sa.width/this.Fa.length)))};
e.Kh=function(a,b,c){void 0!==this.mb&&(this.Fa[this.mb].url||this.Fa[this.mb].action)&&Zb(this.Gg,this.Eb,this.Oc,b,c)&&(b-=this.Eb,b>=this.sa.width/this.Fa.length*this.mb&&b<this.sa.width/this.Fa.length*(this.mb+1)&&(this.Fa[this.mb].url?S.l.Cd(this.Fa[this.mb].url):this.Fa[this.mb].action()));this.mb=void 0};e.cb=function(){this.vb=!0};
e.Db=function(){this.vb&&(this.Y.stop(),this.Ml?this.Kc<this.a.Ad&&(this.Kc=this.a.Ad-1):(this.pu(),this.Kc=this.a.Ad-1),this.sl?zg(this.sl):this.ru(!1),this.wt?zg(this.qp):this.qu(!1),this.Hp?(zg(this.Am),this.Lt&&yg(this)):this.su(!1),this.vb=!1)};e.jd=function(a){a===S.Cf&&(this.Ka(),this.Le())};e.qa=function(){this.Ml&&this.a.Ih&&this.a.Ih.$(0,this.Eo,this.Nl,this.zo,this.Ao,0,this.yo);this.sa&&this.sa.p(this.Eb,this.Oc);this.wb=!1};
function wg(){this.depth=100;this.h=this.visible=!0;S.c.Ga(this,S.jb);var a;this.a=S.a.w.Cg;if("landscape"===S.orientation)for(a in S.a.w.Zs)this.a[a]=S.a.w.Zs[a];this.Ca=S.a.K.cC;if(S.a.K.Cg)for(a in S.a.K.Cg)this.a[a]=S.a.K.Cg[a];this.nc=S.a.w.Xb;for(var b in S.a.R.Cg)this.a[b]=S.a.R.Cg[b];this.Eg=-1;this.Ma=0;this.ep=[];L(this)}e=wg.prototype;
e.Ka=function(){var a,b,c,d;S.c.Kb(S.ug);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(S.ja),1<a.G?(b=(m.canvas.height-c)/a.Ah,d=-(a.gj*b-m.canvas.width)/2,Ba(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.$(0,d,c,b,b,0,1));var g;b=S.a.w.ra.type[S.m.Wd].md;S.a.K.ra&&S.a.K.ra.type&&S.a.K.ra.type[S.m.Wd]&&S.a.K.ra.type[S.m.Wd]&&(b=!1===S.a.K.ra.type[S.m.Wd].md?!1:b);void 0!==this.Ca&&void 0!==this.Ca.md&&(b=this.Ca.md);c=S.c.g(this.a.Vz,
this.canvas.width,Cc.width);a=S.c.g(this.a.mu,S.ba.height,Cc.height)+S.ba.top;b&&(Cc.p(0,c,a),b=X.I(),C(b,this.a.lu),G(b,"center"),b.p(this.M+" / "+this.tq,c+Math.floor(Cc.width/2),a+Cc.height+this.a.nu));if(void 0!==this.Ca&&void 0!==this.Ca.Mz?this.Ca.Mz:1)b=X.I(),void 0!==this.a.Xy?C(b,this.a.Xy):C(b,this.a.Ip),c=S.j.q("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Wa(b,c,this.a.Zy,this.a.Yy),d<b.fontSize&&D(b,d),d=S.c.ka(this.a.Mt,this.canvas.width,b.da(c),b.align),g=S.c.ka(this.a.Nt,S.ba.height,
b.W(c),b.i)+S.ba.top,b.p(c,d,g),c=""+this.Fm,C(b,this.a.Ip),d=S.c.ka(this.a.Mt,this.canvas.width,b.da(c),b.align),b.p(c,d,a+Cc.height+this.a.nu)};
function Ag(a){if("grid"===a.a.type){x(a.Nj);m.clear();a.Dg=[];var b;b=function(b,d,g){var h,k,l,n,q,t,A,B,r,s,u,v,R,qa,ia,ma,Ja,$a,Nd,pc,Sd,$b,Lf;k=S.m.ha[b];Nd=a.Tb?a.a.Uw:a.a.Vw;pc=a.a.Lo;Sd=Nd;if(a.a.jw)h=a.a.jw[b];else{$a=a.Tb?a.a.Fy:a.a.Gy;for($b=Math.floor(k/$a);1<Math.abs($b-$a);)$a-=1,$b=Math.floor(k/$a);for(h=[];0<k;)h.push(Math.min($a,k)),k-=$a}$b=h.length;Ja=Math.round(((a.Tb?a.a.et:a.a.ft)-($b+1)*Nd)/$b);Lf=a.a.fw?a.a.fw:!1;if(!Lf){$a=1;for(k=0;k<$b;k++)$a=Math.max(h[k],$a);ma=Math.round((a.canvas.width-
2*pc)/$a)}for(k=n=0;k<$b;k++){$a=h[k];Lf&&(ma=Math.round((a.canvas.width-2*pc)/$a));for(l=0;l<$a;l++){r=a.a.Wr;R=a.a.tw;u=S.m.kj||"locked";v=0;q=Bg(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(u=q.state),"object"===typeof q.stats&&null!==q.stats&&(v=q.stats.stars||0));qa="locked"===u;"function"===typeof S.K.Pw&&(t=S.K.Pw(Cg(S.b,b,n),b,n,u))&&(R=qa=r=!1);q=pc+d;B=Sd;ia=s=1;if(!1!==R){A=a.Tb?xc:Dc;if("played"===u)switch(v){case 1:A=a.Tb?yc:Ec;break;case 2:A=a.Tb?zc:Fc;break;
case 3:A=a.Tb?Ac:Gc}else a.Tb||"locked"!==u||(A=Jc);A.width>ma&&(ia=ma/A.width);A.height>Ja&&(ia=Math.min(s,Ja/A.height));q+=Math.round((ma-A.width*ia)/2);B+=Math.round((Ja-A.height*ia)/2);A.$(0,q,B,ia,ia,0,1);g&&(a.Dg[n]={x:q,y:B})}t&&(t.width>ma&&(s=ma/t.width),t.height>Ja&&(s=Math.min(s,Ja/t.height)),void 0!==A?(v=S.c.g(a.a.Xs,A.width*ia,t.width*s),R=S.c.g(a.a.Ys,A.height*ia,t.height*s)):(v=S.c.g(a.a.Xs,ma,t.width*s),R=S.c.g(a.a.Ys,Ja,t.height*s),g&&(a.Dg[n]={x:q+v,y:B+R})),t instanceof w?t.$(q+
v,B+R,s,s,0,1):t.$(0,q+v,B+R,s,s,0,1));!1===r||qa||(r=""+(S.m.vk?n+1:Cg(S.b,b,n)+1),s=a.fonts.Go,"locked"===u&&void 0!==a.fonts.Dx?s=a.fonts.Dx:"unlocked"===u&&void 0!==a.fonts.FA?s=a.fonts.FA:"played"===u&&void 0!==a.fonts.played&&(s=a.fonts.played),void 0!==A?(v=S.c.ka(a.a.at,A.width*ia,s.da(r),s.align),R=S.c.ka(a.a.bt,A.height*ia,s.W(r),s.i)):(v=S.c.ka(a.a.at,ma,s.da(r),s.align),R=S.c.ka(a.a.bt,Ja,s.W(r),s.i)),s.p(r,q+v,B+R));a.Tb&&qa&&(void 0!==A?(v=S.c.g(a.a.ot,A.width*ia,Bc.width),R=S.c.g(a.a.pt,
A.height*ia,Bc.height)):(v=S.c.g(a.a.ot,ma,Bc.width),R=S.c.g(a.a.pt,Ja,Bc.height)),Bc.p(0,q+v,B+R));pc+=ma;n++}pc=a.a.Lo;Sd+=Ja+Nd}};a.Ij&&b(a.D-1,0);b(a.D,a.canvas.width,!0);a.Hj&&b(a.D+1,2*a.canvas.width);y(a.Nj)}}function Dg(a,b){switch(b-a.D){case 0:a.wp=0;break;case 1:a.wp=-a.canvas.width;break;case -1:a.wp=a.canvas.width}a.Za=!0;a.sm=0;a.moveStart=a.Ma;a.Bt=a.wp-a.Ma;a.tc=Math.min(a.a.oy-a.mi,Math.round(Math.abs(a.Bt)/(a.Ym/1E3)));a.tc=Math.max(a.a.ny,a.tc)}
function Eg(a){if(1<S.m.ha.length){var b,c;b=S.c.g(a.a.TA,a.canvas.width,Ic.width);c=S.c.g(a.a.Jq,S.ba.height,Ic.height)+S.ba.top;a.Af=new ag(b,c,a.depth-20,new Yb(Ic),[Ic],function(){a.ie="previous";Dg(a,a.D-1);return!0});b=S.c.g(a.a.SA,a.canvas.width,Hc.width);c=S.c.g(a.a.Iq,S.ba.height,Hc.height)+S.ba.top;a.xf=new ag(b,c,a.depth-20,new Yb(Hc),[Hc],function(){a.ie="next";Dg(a,a.D+1);return!0});Fg(a)}else a.tf-=a.a.vs}
function Fg(a){if(1<S.m.ha.length){var b;a.Ij?(b=[Ic],a.Af.ib=!0):(b=[new w(Ic.width,Ic.height)],x(b[0]),Ic.p(1,0,0),y(b[0]),a.Af.ib=!1);Gg(a.Af,b);a.Hj?(b=[Hc],a.xf.ib=!0):(b=[new w(Hc.width,Hc.height)],x(b[0]),Hc.p(1,0,0),y(b[0]),a.xf.ib=!1);Gg(a.xf,b)}}
function Hg(a){var b,c,d;x(a.fh);m.clear();b=X.I();a.a.gc&&C(b,a.a.gc);G(b,"center");H(b,"middle");c=S.j.q("levelMapScreenWorld_"+a.D,"<LEVELMAPSCREENWORLD_"+a.D+">");d=Wa(b,c,a.a.Ld-(b.stroke?b.rd:0),a.a.We-(b.stroke?b.rd:0),!1);d<b.fontSize&&D(b,d);b.p(c,a.fh.width/2,a.fh.height/2);y(a.fh);a.canvas.T=!0}
e.cc=function(){var a,b,c,d=this;this.Tb=this.a.Tb?!0:!1;if(!this.Tb){for(a=0;a<S.m.ha.length;a++)if(9<S.m.ha[a]){b=!0;break}b||(this.Tb=!0)}this.Nj=new w(3*this.canvas.width,this.Tb?this.a.et:this.a.ft);this.ct=-this.canvas.width;this.dt=this.Tb?this.a.us:this.a.ws;this.tf=S.c.g(this.dt,S.ba.height,this.Nj.height)+S.ba.top;this.fh=new w(this.a.Ld,this.a.We);this.AA=S.c.g(this.a.Qf,this.canvas.width,this.a.Ld);this.Su=S.c.g(this.a.zc,S.ba.height,this.fh.height)+S.ba.top;this.$s="undefined"!==typeof s_level_mask?
s_level_mask:this.Tb?Yb(xc):Yb(Dc);this.a.Wr&&(this.fonts={},a=function(a){var b,c;for(b in a)c=X.I(),C(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.Go=X,this.Tb?a(this.a.tx):a(this.a.ux));this.D=S.b.D;this.ha=S.m.ha[this.D];this.Zm=!1;this.Ym=this.pq=this.mi=0;this.qq=this.ct;this.Ma=0;this.Ij=0<this.D;this.Hj=this.D<S.m.ha.length-1;for(b=this.tq=this.Fm=this.M=0;b<S.m.ha.length;b++)for(a=0;a<S.m.ha[b];a++)c=Ig(void 0,a,b),this.tq+=3,"object"===typeof c&&null!==c&&(this.M+=void 0!==c.stars?c.stars:
0,this.Fm+=void 0!==c.highScore?c.highScore:0);S.K.Rw&&(this.Fm=S.K.Rw());this.Ka();a=this.nc[this.a.Jy];this.zp=new ag(S.c.g(this.a.Ky,this.canvas.width,a.s.width),S.c.g(this.a.Ap,S.ba.height,a.s.height)+S.ba.top,this.depth-20,new Yb(a.s),[a.s],{S:S.b.Oe,fa:this});Eg(this);Ag(this);Hg(this);this.wb=!0};e.kb=function(){this.Af&&M(K,this.Af);this.xf&&M(K,this.xf);M(K,this.zp)};
e.cb=function(a,b,c){if(!this.Za)for(a=0;a<this.Dg.length;a++)if(Zb(this.$s,this.Dg[a].x-this.canvas.width,this.Dg[a].y+this.tf,b,c)){this.Eg=a;break}this.Za=!1;1<S.m.ha.length&&(this.Zm=!0,this.mi=0,this.Gu=this.qq=b,this.Ym=this.pq=0)};
e.Db=function(a,b,c){if(!this.Za&&-1!==this.Eg&&Zb(this.$s,this.Dg[this.Eg].x-this.canvas.width,this.Dg[this.Eg].y+this.tf,b,c)&&(a=S.m.kj||"locked",b=Bg(this.D,this.Eg,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return M(K,this),xg(S.b,this.Eg,this.D),!0;this.Eg=-1;this.Zm=!1;1<S.m.ha.length&&(Math.abs(this.Ma)>=this.a.nA&&(this.Ym>=this.a.oA||Math.abs(this.Ma)>=this.a.mA)?"previous"===this.ie?this.Ij&&0<=this.Ma&&this.Ma<=this.canvas.width/2?Dg(this,
this.D-1):(0>this.Ma||(this.ie="next"),Dg(this,this.D)):"next"===this.ie&&(this.Hj&&0>=this.Ma&&this.Ma>=-this.canvas.width/2?Dg(this,this.D+1):(0<this.Ma||(this.ie="previous"),Dg(this,this.D))):0<Math.abs(this.Ma)&&(this.ie="next"===this.ie?"previous":"next",Dg(this,this.D)));return!0};
e.jd=function(a){if(a===S.Bg||a===S.Cf)this.canvas.T=!0,this.Ka(),a===S.Cf?(this.Su=S.c.g(this.a.zc,S.ba.height,this.fh.height)+S.ba.top,this.tf=S.c.g(this.dt,S.ba.height,this.Nj.height)+S.ba.top,this.zp.y=S.c.g(this.a.Ap,S.ba.height,this.zp.images[0].height)+S.ba.top,this.Af&&(this.Af.y=S.c.g(this.a.Jq,S.ba.height,Ic.height)+S.ba.top),this.xf&&(this.xf.y=S.c.g(this.a.Iq,S.ba.height,Hc.height)+S.ba.top),void 0===this.xf&&void 0===this.Af&&(this.tf-=this.a.vs)):(Hg(this),Ag(this))};
e.Xd=function(a){var b=K.ma[0].x;this.Zm&&(this.pq=Math.abs(this.qq-b),0<this.mi&&(this.Ym=this.pq/(this.mi/1E3)),this.ie=b>this.qq?"previous":"next",this.mi+=a,this.Ma+=b-this.Gu,this.Gu=b,this.canvas.T=!0);this.Za&&(this.Ma=ec(this.sm,this.moveStart,this.Bt,this.tc,2),this.sm>=this.tc&&(this.Za=!1,this.Ma=0),this.sm+=a,this.canvas.T=!0);if(this.Za||this.Zm)"previous"===this.ie&&this.Ma>=this.canvas.width/2?0<=this.D-1?(this.D-=1,this.ha=S.m.ha[this.D],this.Ij=0<this.D,this.Hj=this.D<S.m.ha.length-
1,Fg(this),this.Ma-=this.canvas.width,Hg(this),Ag(this),this.canvas.T=!0,this.moveStart-=this.canvas.width):this.Ma=Math.round(this.canvas.width/2):"next"===this.ie&&this.Ma<=-this.canvas.width/2&&(this.D+1<S.m.ha.length?(this.D+=1,this.ha=S.m.ha[this.D],this.Ij=0<this.D,this.Hj=this.D<S.m.ha.length-1,Fg(this),this.Ma+=this.canvas.width,Hg(this),Ag(this),this.canvas.T=!0,this.moveStart+=this.canvas.width):this.Ma=Math.round(-this.canvas.width/2))};
e.qa=function(){this.fh.p(this.AA,this.Su);this.Nj.p(Math.round(this.ct+this.Ma),this.tf);this.wb=!1};
function Jg(a,b,c,d){this.depth=10;this.h=this.visible=!0;S.c.Ga(this,S.jb);var g;this.type=b.failed?"failed":a;this.a=S.a.w.ra;this.Ca=this.a.type[this.type];if("landscape"===S.orientation)for(g in S.a.w.Ws)this.a[g]=S.a.w.Ws[g];for(g in S.a.R.ra)this.a[g]=S.a.R.ra[g];if(S.a.R.ra&&S.a.R.ra.type&&S.a.R.ra.type[this.type])for(g in S.a.R.ra.type[this.type])this.a[g]=S.a.R.ra.type[this.type][g];if("failed"===this.type){if(void 0!==S.a.K.ra&&S.a.K.ra.type&&void 0!==S.a.K.ra.type.failed)for(g in S.a.K.ra.type[this.type])this.Ca[g]=
S.a.K.ra.type[this.type][g]}else{if(void 0!==S.a.K.ra&&void 0!==S.a.K.ra.type)for(g in S.a.K.ra.type[this.type])this.Ca[g]=S.a.K.ra.type[this.type][g];for(g in S.a.K.ra)this.Ca[g]=S.a.K.ra[g]}this.wa=b;this.S=c;this.fa=d;this.Qz=[Df,Ef,Ff];this.eg=[];this.Y=new ac;this.Y.parent=this;L(this,!1)}
function Kg(a){var b;for(b=0;b<a.M.length;b++)Lg(a.M[b]);for(b=0;b<a.Vg.length;b++)M(K,a.Vg[b]);a.Vg=[];a.La&&Lg(a.La);a.La=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].ib=!1;a.Y.stop();a.Y=void 0;Mg(a)}
function Ng(a,b){var c;switch(b){case "title_level":c=S.j.q("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.wa.level);break;case "title_endless":c=S.j.q("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.wa.stage);break;case "title_difficulty":c=S.j.q("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.Hc(a.a.gc,c,a.a.Qf,a.a.zc,a.a.Ld,a.a.We)}
function Og(a,b){var c;switch(b){case "subtitle_failed":c=S.j.q("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.Hc(a.a.fA,c,a.a.gA,a.a.hA)}
function Pg(a,b,c){var d,g,h,k,l;g=S.j.q(b.key,"<"+b.key.toUpperCase()+">");d=b.ff?b.toString(b.Wg):b.toString(b.Ic);h=a.a.jk;h.align="left";h.i="top";l=X.I();C(l,h);c?(H(l,"bottom"),h=a.a.Xg,h.align="left",h.i="bottom",c=X.I(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Wm),void 0!==d&&(h+=c.da(d)),h=S.c.g(a.a.If,a.canvas.width,h)-a.d.x,void 0!==g&&(l.p(g,h,a.Kd+l.fontSize),h+=l.da(g)+a.a.Wm,k+=l.W(g)),void 0!==d&&(b.ff?(d=c.W(d),l=a.Kd+l.fontSize-d,b.jj=new Qg(h,l,a.a.ii,d,a.depth-100,b.Wg,c,a.a.gi,
a.a.hi,a.d,b.toString),k=Math.max(k,d)):(c.p(d,h,a.Kd+l.fontSize+a.a.vu),k=Math.max(k,c.W(d)))),0<k&&(a.Kd+=k+a.a.Jd)):(void 0!==g&&(a.Hc(h,g,a.a.If,a.a.Jf),k=a.a.Jf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Jd:a.a.Jd,k.offset+=l.W(g)):"number"===typeof k&&(k+=a.a.Jd+l.W(g))),void 0!==d&&(h=a.a.Xg,h.i="top",b.ff?(c=X.I(),h.align="center",C(c,h),g=S.c.g(a.a.If,a.canvas.width,a.a.ii)-a.d.x,l=k-a.d.y,b.jj=new Qg(g,l,a.a.ii,c.W(d),a.depth-100,b.Wg,c,a.a.gi,a.a.hi,a.d,b.toString)):a.Hc(h,
d,a.a.If,k)))}
function Rg(a,b,c){var d,g,h,k,l,n;switch(b){case "totalScore":d=""+a.wa.totalScore;g=S.j.q("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=S.j.q("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.wa.highScore;break;case "timeLeft":g=S.j.q("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.wa.timeLeft;break;case "timeBonus":g=S.j.q("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.wa.timeBonus,n=a.wa.timeBonus}h=a.a.jk;h.align=
"left";h.i="top";l=X.I();C(l,h);c?(H(l,"bottom"),h=a.a.Xg,h.align="left",h.i="bottom",c=X.I(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Wm),void 0!==d&&(h+=c.da(d)),h=S.c.g(a.a.If,a.canvas.width,h)-a.d.x,void 0!==g&&(l.p(g,h,a.Kd+l.fontSize),h+=l.da(g)+a.a.Wm,k+=l.W(g)),void 0!==d&&(void 0!==n?(d=c.W(d),l=a.Kd+l.fontSize-d,n=new Qg(h,l,a.a.ii,d,a.depth-100,n,c,a.a.gi,a.a.hi,a.d),k=Math.max(k,d)):(c.p(d,h,a.Kd+l.fontSize+a.a.vu),k=Math.max(k,c.W(d)))),0<k&&(a.Kd+=k+a.a.Jd)):(void 0!==g&&(a.Hc(h,g,a.a.If,
a.a.Jf),k=a.a.Jf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Jd:a.a.Jd,k.offset+=l.W(g)):"number"===typeof k&&(k+=a.a.Jd+l.W(g))),void 0!==d&&(h=a.a.Xg,h.i="top",void 0!==n?(c=X.I(),h.align="center",C(c,h),g=S.c.g(a.a.If,a.canvas.width,a.a.ii)-a.d.x,l=k-a.d.y,n=new Qg(g,l,a.a.ii,c.W(d),a.depth-100,n,c,a.a.gi,a.a.hi,a.d)):a.Hc(h,d,a.a.If,k)));n instanceof Qg&&("totalScore"===b?a.hh=n:a.eg.push(n))}
function Sg(a,b){var c,d,g;c=S.j.q(b.key,"<"+b.key.toUpperCase()+">");d=b.ff?b.toString(b.Wg):b.toString(b.Ic);void 0!==c&&a.Hc(a.a.io,c,a.a.as,a.a.jo);void 0!==d&&(b.ff?(c=X.I(),d=a.a.qj,a.a.BB||(d.align="center"),C(c,d),d=S.c.g(a.a.Cl,a.canvas.width,a.a.Bl)-a.d.x,g=S.c.g(a.a.Dh,a.canvas.height,a.a.Al)-a.d.y,b.jj=new Qg(d,g,a.a.Bl,a.a.Al,a.depth-100,b.Wg,c,a.a.gi,a.a.hi,a.d,b.toString)):a.Hc(a.a.qj,d,a.a.Cl,a.a.Dh))}
function Tg(a,b){var c,d,g,h;switch(b){case "totalScore":c=S.j.q("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.wa.totalScore;g=0;break;case "timeLeft":c=S.j.q("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.wa.timeLeft}void 0!==c&&a.Hc(a.a.io,c,a.a.as,a.a.jo);void 0!==d&&(void 0!==g?(c=X.I(),d=a.a.qj,d.align="center",C(c,d),d=S.c.g(a.a.Cl,a.canvas.width,a.a.Bl)-a.d.x,h=S.c.g(a.a.Dh,a.canvas.height,a.a.Al)-a.d.y,g=new Qg(d,h,a.a.Bl,a.a.Al,a.depth-100,g,c,a.a.gi,a.a.hi,
a.d)):a.Hc(a.a.qj,d,a.a.Cl,a.a.Dh));g instanceof Qg&&("totalScore"===b?a.hh=g:a.eg.push(g))}e=Jg.prototype;e.Hc=function(a,b,c,d,g,h){var k=X.I();C(k,a);void 0!==g&&void 0!==h&&(a=Wa(k,b,g,h,g),k.fontSize>a&&D(k,a));a=k.da(b);h=k.W(b);k.p(b,S.c.ka(c,this.canvas.width,a,k.align)-this.d.x,S.c.ka(d,this.canvas.height,h,k.i)-this.d.y,g)};
function Ug(a,b){var c,d,g,h;switch(b){case "retry":c=Ud;d=function(){a.jf="retry";Kg(a)};break;case "exit":c=Qd,d=function(){a.jf="exit";Kg(a)}}void 0!==c&&(g=S.c.g(a.a.Nv,a.canvas.width,c.width)-a.d.x,h=S.c.g(a.a.nr,a.canvas.height,c.height)-a.d.y,a.buttons.push(new ag(g,h,a.depth-20,new Yb(c),[c],d,a.d)))}
function Vg(a,b){var c,d,g,h;switch(b){case "retry":c=ce;d=function(){a.jf="retry";Kg(a)};break;case "exit":c=ae;d=function(){a.jf="exit";Kg(a)};break;case "next":c=ae,d=function(){a.jf="next";Kg(a)}}void 0!==c&&(g=S.c.g(a.a.Hw,a.canvas.width,c.width)-a.d.x,h=S.c.g(a.a.ns,a.canvas.height,c.height)-a.d.y,a.buttons.push(new ag(g,h,a.depth-20,new Yb(c),[c],d,a.d)))}
e.cc=function(){this.k=0;this.M=[];this.Vg=[];this.buttons=[];this.canvas.T=!0;this.jf="";this.gd=this.wa.failed?!0:!1;this.md=this.Ca.md&&!this.gd;this.ci=this.Ca.ci&&!this.gd&&this.wa.Js;this.Dn=this.alpha=this.uh=0;Wg(this);var a,b,c,d,g,h,k=this;switch(this.Ca.Zk){case "failed":this.e=this.a.zm.sx;break;case "level":this.e=this.a.zm.vx;break;case "difficulty":this.e=this.a.zm.bo;break;case "endless":this.e=this.a.zm.Aw}this.d=new Xg(this.depth-10,this.Ea,new w(this.e.width,this.e.height));this.d.x=
S.c.g(this.a.Pb,this.canvas.width,this.e.width);this.d.y=S.c.g(this.a.Hb,this.canvas.height,this.e.height);x(this.d.e);this.e.p(0,0,0);!this.gd&&this.md&&(b=S.c.g(this.a.dq,this.canvas.width,0)-this.d.x,a=S.c.g(this.a.eq,this.canvas.height,s_star01_fill.height)-this.d.y+Math.round(s_star01_empty.height/2),s_star01_empty.p(0,b,a),b=S.c.g(this.a.fq,this.canvas.width,0)-this.d.x,a=S.c.g(this.a.gq,this.canvas.height,s_star02_fill.height)-this.d.y+Math.round(s_star02_empty.height/2),s_star02_empty.p(0,
b,a),b=S.c.g(this.a.hq,this.canvas.width,0)-this.d.x,a=S.c.g(this.a.iq,this.canvas.height,s_star03_fill.height)-this.d.y+Math.round(s_star03_empty.height/2),s_star03_empty.p(0,b,a));void 0!==this.Ca.nk&&Ng(this,this.Ca.nk);void 0!==this.Ca.Bu&&Og(this,this.Ca.Bu);this.zb={};void 0!==this.wa.Sd?(c=this.wa.Sd,c.visible&&Sg(this,c),this.zb[c.id]=c):void 0!==this.Ca.ko&&Tg(this,this.Ca.ko);if(void 0!==this.wa.zb)for(a=this.wa.zb.length,b=X.I(),C(b,this.a.jk),c=X.I(),C(c,this.a.Xg),b=Math.max(b.W("g"),
c.W("g"))*a+this.a.Jd*(a-1),this.Kd=S.c.g(this.a.Jf,this.canvas.height,b)-this.d.y,b=0;b<a;b++)c=this.wa.zb[b],c.visible&&Pg(this,this.wa.zb[b],1<a),this.zb[c.id]=c;else if(void 0!==this.Ca.Kf)if("string"===typeof this.Ca.Kf)Rg(this,this.Ca.Kf,this.a.ms);else if(this.Ca.Kf instanceof Array)for(a=this.Ca.Kf.length,b=X.I(),C(b,this.a.jk),c=X.I(),C(c,this.a.Xg),b=Math.max(b.W("g"),c.W("g"))*a+this.a.Jd*(a-1),this.Kd=S.c.g(this.a.Jf,this.canvas.height,b)-this.d.y,b=0;b<a;b++)Rg(this,this.Ca.Kf[b],1<a||
this.a.ms);y(this.d.e);Ug(this,this.Ca.Wk);Vg(this,this.Ca.Il);S.b.dv&&(b=S.c.g(k.a.cx,k.canvas.width,k.a.Fs)-this.d.x,a=S.c.g(this.a.dx,this.canvas.height,this.a.jg)-this.d.y,this.Es=new vg("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.Fs,{S:function(){void 0!==Yg?S.l.Cd(S.A.Yl.url+"submit/"+Yg+"/"+k.wa.totalScore):S.l.Cd(S.A.Yl.url+"submit/")},dc:!0},k.d),this.buttons.push(this.Es),b=function(a){a&&(k.Es.Bq("levelEndScreenSubmitHighscoreBtn"),k.aC=a)},Zg(this.wa.totalScore,
b));b=S.c.g(this.a.fj,this.canvas.width,this.a.yh)-this.d.x;a=S.c.g(this.a.zh,this.canvas.height,this.a.jg)-this.d.y;this.buttons.push(new ag(b,a,this.depth-20,new Xb(0,0,this.a.yh,this.a.jg),void 0,function(){k.jf="exit";Kg(k)},this.d));for(b=0;b<this.buttons.length;b++)this.buttons[b].ib=!1;this.d.y=-this.d.height;a=this.a.uA;this.Y.pa(a,this.$z);a+=this.a.ef;g=0;d=this.a.CA;this.md&&(d=Math.max(d,this.a.ju+this.a.iu*this.wa.stars));if(this.hh&&(this.Y.pa(a+this.a.gn,function(a,b){$g(b.parent.hh,
b.parent.wa.totalScore,d)}),g=a+this.a.gn+d,0<this.eg.length)){h=function(a,b){var c=b.parent,d=c.eg[c.uh];$g(c.hh,c.hh.value+d.value,c.a.th);$g(d,0,c.a.th);c.uh+=1};for(b=0;b<this.eg.length;b++)g+=this.a.yr,this.Y.pa(g,h);g+=this.a.th}if(void 0!==this.zb&&(g=a,h=function(a,b){var c=b.parent,d=c.lq[c.uh||0],g=c.zb[d.Vm];void 0!==d.Sf&&(g.visible&&g.ff?$g(g.jj,d.Sf(g.jj.value),c.a.th):g.Ic=d.Sf(g.Ic));d.visible&&d.ff&&$g(d.jj,d.Ic,c.a.th);c.uh+=1},this.lq=[],void 0!==this.wa.Sd&&void 0!==this.wa.Sd.Sf&&
(this.Y.pa(a+this.a.gn,h),this.lq.push(this.wa.Sd),g+=this.a.gn+bonusCounterDuration),void 0!==this.wa.zb))for(b=0;b<this.wa.zb.length;b++)c=this.wa.zb[b],void 0!==c.Sf&&(g+=this.a.yr,this.Y.pa(g,h),this.lq.push(c),g+=this.a.th);if(this.md){for(b=0;b<this.wa.stars;b++)a+=this.a.iu,this.Y.pa(a,this.bA),this.Y.pa(a,this.cA);a+=this.a.ju}a=Math.max(a,g);this.ci&&(a+=this.a.Qx,this.Y.pa(a,this.Zz),this.Y.pa(a,this.Xz),this.Y.pa(a+this.a.Rx,this.Yz));a+=500;this.Y.pa(a,function(){S.l.jx&&S.l.jx()});this.Y.pa(a+
this.a.ly,S.l.Ks);S.l.Ls(this.wa);this.Y.start();this.gd?I.play(Gf):I.play(Bf)};e.V=function(a){this.alpha=this.a.rj*this.Dn/this.a.rc;this.Dn+=a;this.alpha>=this.a.rj&&(this.alpha=this.a.rj,this.h=!1);this.canvas.T=!0};
e.$z=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].ib=!0}var d=b.parent,g,h;switch(d.a.ZA){case "fromLeft":h="horizontal";g=S.c.g(d.a.Pb,d.canvas.width,d.d.width);d.d.x=-d.d.width;d.d.y=S.c.g(d.a.Hb,d.canvas.height,d.d.height)+Math.abs(S.ja);break;case "fromRight":h="horizontal";g=S.c.g(d.a.Pb,d.canvas.width,d.d.width);d.d.x=d.canvas.width;d.d.y=S.c.g(this.parent.a.Hb,d.canvas.height,selft.d.height)+Math.abs(S.ja);break;case "fromBottom":h="vertical";g=S.c.g(d.a.Hb,
d.canvas.height,d.d.height)+Math.abs(S.ja);d.d.x=S.c.g(d.a.Pb,d.canvas.width,d.d.width);d.d.y=d.canvas.height+d.d.height;break;default:h="vertical",g=S.c.g(d.a.Hb,d.canvas.height,d.d.height)+Math.abs(S.ja),d.d.x=S.c.g(d.a.Pb,d.canvas.width,d.d.width),d.d.y=-d.d.height}"vertical"===h?Z(d.d,"y",g,d.a.ef,d.a.Rk,c):Z(d.d,"x",g,d.a.ef,d.a.Rk,c)};
function Mg(a){function b(){M(K,a);a.fa?a.S.call(a.fa,a.jf):a.S(a.jf)}var c,d;switch(a.a.$A){case "toLeft":d="horizontal";c=-a.d.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.d.height;break;default:d="vertical",c=-a.d.height}"vertical"===d?Z(a.d,"y",c,a.a.Sk,a.a.Tk,b):Z(a.d,"x",c,a.a.Sk,a.a.Tk,b)}
e.bA=function(a,b){var c,d=b.parent,g=Math.abs(S.ja);if(d.M.length<d.wa.stars){switch(d.M.length+1){case 1:c=new Xg(d.depth-30,S.De,s_star01_fill);c.x=S.c.g(d.a.dq,d.canvas.width,0);c.y=S.c.g(d.a.eq,d.canvas.height,s_star01_fill.height)+g+Math.round(s_star01_empty.height/2);break;case 2:c=new Xg(d.depth-30,S.De,s_star02_fill);c.x=S.c.g(d.a.fq,d.canvas.width,0);c.y=S.c.g(d.a.gq,d.canvas.height,s_star02_fill.height)+g+Math.round(s_star02_empty.height/2);break;case 3:c=new Xg(d.depth-30,S.De,s_star03_fill),
c.x=S.c.g(d.a.hq,d.canvas.width,0),c.y=S.c.g(d.a.iq,d.canvas.height,s_star03_fill.height)+g+Math.round(s_star03_empty.height/2)}c.Aa=d.a.ku;c.Na=d.a.ku;c.alpha=d.a.Uz;Z(c,"scale",1,d.a.Tz,P,function(){var a=d.M.length,b,c,n;x(d.d.e);switch(a){case 1:n=s_star01_fill;b=S.c.g(d.a.dq,d.canvas.width,0)-d.d.x;c=S.c.g(d.a.eq,d.canvas.height,s_star01_fill.height)-d.d.y+g+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=S.c.g(d.a.fq,d.canvas.width,0)-d.d.x;c=S.c.g(d.a.gq,d.canvas.height,
s_star01_fill.height)-d.d.y+g+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=S.c.g(d.a.hq,d.canvas.width,0)-d.d.x,c=S.c.g(d.a.iq,d.canvas.height,s_star01_fill.height)-d.d.y+g+Math.round(s_star03_empty.height/2)}n.p(0,b,c);y(d.d.e);d.d.wb=!0;M(K,d.M[a-1])});Z(c,"alpha",1,d.a.Sz,fc);d.M.push(c);I.play(d.Qz[d.M.length-1])}};
e.cA=function(a,b){var c=b.parent,d,g;d=c.M[c.Vg.length];g=new Xg(c.depth-50,S.De,s_sfx_star);g.x=d.x;g.y=d.y;Z(g,"subImage",s_sfx_star.G-1,c.a.Rz,void 0,function(){M(K,g)});c.Vg.push(g)};
e.Xz=function(a,b){var c=b.parent,d,g,h,k,l,n,q;d=[];h=X.I();k=S.j.q("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.vt&&C(h,c.a.vt);g=Wa(h,k,c.a.nm,c.a.Xx,!0);g<h.fontSize&&D(h,g);l=S.c.ka(c.a.Yx,Mc.width,h.da(k,c.a.nm),h.align);n=S.c.ka(c.a.Zx,Mc.height,h.W(k,c.a.nm),h.i);for(q=0;q<Mc.G;q++)g=new w(Mc.width,Mc.height),x(g),Mc.p(q,0,0),h.p(k,l,n,c.a.nm),y(g),d.push(g);c.La=new Xg(c.depth-120,S.De,d);c.La.uc=c.a.st;c.La.vc=c.a.tt;c.La.x=S.c.g({align:"center"},c.d.canvas.width,c.La.width)-c.d.x;
c.La.y=S.c.g(c.a.om,c.La.canvas.height,c.La.height)-c.d.y+Math.abs(S.ja);l=S.c.g(c.a.pp,c.La.canvas.width,c.La.width)-c.d.x;c.La.Aa=c.a.mm;c.La.Na=c.a.mm;c.La.parent=c.d;c.La.alpha=0;c.La.mB=!0;Z(c.La,"scale",1,c.a.Oh,fc,function(){M(K,c.nb);c.nb=void 0});Z(c.La,"x",l,c.a.Oh,fc);Z(c.La,"alpha",1,0,fc);Z(c.La,"subImage",Mc.G,c.a.Vx,fc,void 0,c.a.Oh+c.a.rt+c.a.Ux,!0,c.a.Wx)};
e.Zz=function(a,b){var c,d=b.parent;d.nb=new Xg(d.depth-110,S.De,Lc);d.nb.y=S.c.g(d.a.om,d.nb.canvas.height,Lc.height)-d.d.y+d.a.Tx;d.nb.uc=d.a.st;d.nb.vc=d.a.tt;d.nb.x=S.c.g(d.a.pp,d.nb.canvas.width,d.nb.width)-d.d.x;c=S.c.g(d.a.om,d.nb.canvas.height,Lc.height)-d.d.y+Math.abs(S.ja);d.nb.Aa=d.a.mm*d.a.ut;d.nb.Na=d.a.mm*d.a.ut;d.nb.alpha=0;d.nb.parent=d.d;Z(d.nb,"y",c,d.a.Oh,fc);Z(d.nb,"scale",1,d.a.Oh,fc);Z(d.nb,"alpha",1,d.a.Oh,fc)};
e.Yz=function(a,b){var c=b.parent;c.vf=new Xg(c.depth-130,S.De,Kc);c.vf.parent=c.d;c.vf.x=c.La.x;c.vf.y=c.La.y+c.a.Sx;Z(c.vf,"subImage",Kc.G-1,c.a.rt,void 0,function(){M(K,c.vf);c.vf=void 0});I.play(Jf)};
e.kb=function(){var a;for(a=0;a<this.buttons.length;a++)M(K,this.buttons[a]);for(a=0;a<this.M.length;a++)M(K,this.M[a]);for(a=0;a<this.Vg.length;a++)M(K,this.Vg[a]);this.La&&(M(K,this.La),this.vf&&M(K,this.vf),this.nb&&M(K,this.nb));M(K,this.d);this.Y&&this.Y.stop();this.hh&&M(K,this.hh);for(a=0;a<this.eg.length;a++)M(K,this.eg[a]);ah()};e.qa=function(){var a=m.context.globalAlpha;m.context.globalAlpha=this.alpha;xa(0,0,m.canvas.width,m.canvas.height,this.a.po,!1);m.context.globalAlpha=a};
function bh(a,b,c){this.depth=10;this.visible=!0;this.h=!1;S.c.Ga(this,S.jb);this.a=S.a.w.jl;for(var d in S.a.R.jl)this.a[d]=S.a.R.jl[d];this.Xm=b;this.Rn=c;this.na=qg(S.b);this.na.Uh[this.na.$c]=a;this.Y=new ac;this.Y.parent=this;this.buttons=[];L(this,!1)}e=bh.prototype;
e.Hd=function(a){var b,c,d=this;c=function(){Z(d.message,"xScale",1,d.a.Ph,P);Z(d.message,"yScale",1,d.a.Ph,P);Z(d.message,"alpha",1,d.a.Ph,O)};void 0===this.message&&(b=new w(this.a.tp+2*this.a.cy,this.a.xt+2*this.a.dy),this.message=new Xg(this.depth-20,S.jb,b),this.message.Aa=0,this.message.Na=0,this.message.alpha=0,this.message.uc=Math.floor(b.width/2),this.message.vc=Math.floor(b.height/2),this.message.x=S.c.g(this.a.hy,this.canvas.width,0)-this.Qh,this.message.y=S.c.g(this.a.iy,this.canvas.height,
b.height)+Math.floor(b.height/2)-this.zf,this.message.parent=this.d,this.Y.lc>=this.a.qm?c():this.Y.pa(this.a.qm,c));x(this.message.e);m.clear();b=X.I();void 0!==this.a.Ig&&C(b,this.a.Ig);G(b,"center");H(b,"middle");c=Wa(b,a,this.a.tp,this.a.xt,!0);c<b.fontSize&&D(b,c);b.p(a,Math.floor(this.message.width/2),Math.floor(this.message.height/2),this.a.tp);y(this.message.e);0<this.message.Aa&&(this.message.wb=!0)};
function ch(a,b){var c,d,g;c=X.I();void 0!==a.a.zk&&C(c,a.a.zk);d=Wa(c,b,a.a.mq,a.a.zu,!0);d<c.fontSize&&D(c,d);d=S.c.ka(a.a.eA,a.d.width,a.a.mq,c.align);g=S.c.ka(a.a.Au,a.d.height,a.a.zu,c.i);x(a.d.e);c.p(b,d,g,a.a.mq);y(a.d.e)}
function dh(a){var b,c,d;c=function(){Z(a.Mb,"xScale",1,a.a.Ph,P);Z(a.Mb,"yScale",1,a.a.Ph,P);Z(a.Mb,"alpha",1,a.a.Ph,O)};b=new w(a.a.Hq+2*a.a.NA,a.a.uv+2*a.a.OA);a.Mb=new Xg(a.depth-20,S.jb,b);a.Mb.Aa=0;a.Mb.Na=0;a.Mb.alpha=0;a.Mb.uc=Math.floor(b.width/2);a.Mb.vc=Math.floor(b.height/2);a.Mb.x=S.c.g(a.a.PA,a.canvas.width,0)-a.Qh;a.Mb.y=S.c.g(a.a.QA,a.canvas.height,b.height)+Math.floor(b.height/2)-a.zf;a.Mb.parent=a.d;a.Y.lc>=a.a.qm?c():a.Y.pa(a.a.qm,c);b=S.j.q("challengeEndScreenWinnings","CHALLENGEENDSCREENWINNINGS");
b=b.replace("<AMOUNT>",a.na.nv);x(a.Mb.e);c=X.I();void 0!==a.a.zk&&C(c,a.a.zk);G(c,"center");H(c,"middle");d=Wa(c,b,a.a.Hq,a.a.uv,!0);d<c.fontSize&&D(c,d);c.p(b,Math.floor(a.Mb.width/2),Math.floor(a.Mb.height/2),a.a.Hq);y(a.Mb.e);0<a.Mb.Aa&&(a.Mb.wb=!0)}e.bv=function(a){if("string"===typeof a){var b=S.j.q("challengeEndScreenOutcomeMessage_"+a,"<CHALLENGEENDSCREEN_CHALLENGE"+a.toUpperCase()+">");this.Hd(b);"WON"===a&&dh(this)}};
function eh(a){var b,c;b=S.c.g(a.a.iA,a.d.width,a.a.$m);c=S.c.g(a.a.Cu,a.d.height,0);a.buttons.push(new vg("default_text",b,c,a.depth-20,"challengeEndScreensBtn_submit",a.a.$m,function(){var b;a.Xm();for(b=0;b<a.buttons.length;b++)M(K,a.buttons[b]);return!0},a.d));b=S.c.g(a.a.ew,a.d.width,a.a.$m);c=S.c.g(a.a.Gr,a.d.height,0);a.buttons.push(new vg("default_text",b,c,a.depth-20,"challengeEndScreenBtn_cancel",a.a.$m,function(){var b,c;b=new fh(S.j.q("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),
[{L:"challengeCancelConfirmBtn_yes",S:function(){b.close();a.Rn();for(c=0;c<a.buttons.length;c++)M(K,a.buttons[c]);return!0}},{L:"challengeCancelConfirmBtn_no",S:function(){b.close()}}],!0)},a.d))}
e.cc=function(){function a(a){a.Aa=0;a.Na=0;a.uc=Math.floor(a.e.width/2);a.vc=Math.floor(a.e.height/2)}var b,c,d,g,h,k,l=this;Wg(this);"undefined"!==typeof s_overlay_challenge_end?(b=new w(s_overlay_challenge_end.width,s_overlay_challenge_end.height),x(b),s_overlay_challenge_end.p(0,0,0),y(b)):b=new w(T(560),T(560));this.d=new Xg(this.depth-10,S.jb,b);this.d.x=S.c.g(this.a.Py,this.canvas.width,this.d.width)+this.a.Mg;this.d.y=S.c.g(this.a.Qy,this.canvas.height,this.d.height)+S.$k+this.a.Rh;this.Qh=
S.c.g(this.a.Qh,this.canvas.width,this.d.width)+this.a.Mg;this.zf=S.c.g(this.a.zf,this.canvas.height,this.d.height)+this.a.Rh;h=Array(this.na.Dd.length);c=0;k=[];for(b=0;b<this.na.Dd.length;b++)b!==this.na.$c&&(void 0!==this.na.Uh[b]?(h[b]=c,c++):k.push(b));h[this.na.$c]=c;c++;for(b=0;b<k.length;b++)h[k[b]]=c,c++;c=X.I();void 0!==this.a.up&&C(c,this.a.up);G(c,"center");H(c,"middle");k=[];for(b=0;b<this.na.Dd.length;b++)d=b===this.na.$c?S.j.q("challengeEndScreenName_you","<YOU>"):this.na.Dd[b],13<
d.length&&(d=d.substr(0,10)+"..."),k.push(d);d=c.fontSize;for(b=0;b<k.length;b++)d=Math.min(d,Wa(c,k[b],this.a.Ft,this.a.Et,!1));d<c.fontSize&&D(c,d);this.Je=[];for(b=0;b<k.length;b++)d=k[b],g=new w(this.a.Ft+2*this.a.ty,this.a.Et+2*this.a.uy),x(g),c.p(d,Math.floor(g.width/2)+this.a.xy,Math.floor(g.height/2)+this.a.yy),y(g),d=new Xg(this.depth-20,this.Ea,g),d.alpha=0,a(d),d.x=this.a.Cy+h[b]*(g.width+this.a.By)+Math.floor(g.width/2)-this.Qh,d.y=S.c.g(this.a.Ey,this.canvas.height,g.height)+Math.floor(g.height/
2)-this.zf,d.parent=this.d,this.Je.push(d);this.ng=[];c=X.I();void 0!==this.a.ho&&C(c,this.a.ho);G(c,"center");H(c,"middle");for(b=0;b<this.na.Dd.length;b++)d=void 0!==this.na.Uh[b]?new TG_StatObject("player_"+b,S.m.Rg,"",this.na.Uh[b]):new TG_StatObject("player_"+b,"text","","?"),h=this.Je[b].x+this.a.Zr,k=S.c.g(this.a.zw,this.canvas.height,this.a.$r)+Math.floor(g.height/2)-this.zf,h=new Qg(h,k,this.a.yw,this.a.$r,this.depth-18,b===this.na.$c?0:d.Ic,c,this.a.Zr,this.a.xw,this.d,d.toString),a(h.vd),
h.vd.alpha=0,this.ng.push(h);this.k=0;this.Y.pa(this.a.gr,function(){Z(l.d,"x",l.Qh,l.a.ef,P);Z(l.d,"y",l.zf+S.$k,l.a.ef,P)});this.Y.pa(this.a.Dy,function(){var a;for(a=0;a<l.Je.length;a++)Z(l.Je[a],"xScale",1,l.a.vp,P),Z(l.Je[a],"yScale",1,l.a.vp,P),Z(l.Je[a],"alpha",1,l.a.vp,O)});this.Y.pa(this.a.xz,function(){var a;for(a=0;a<l.Je.length;a++)Z(l.ng[a].vd,"xScale",1,l.a.Yp,P),Z(l.ng[a].vd,"yScale",1,l.a.Yp,P),Z(l.ng[a].vd,"alpha",1,l.a.Yp,O)});this.Y.pa(this.a.Az,function(){$g(l.ng[l.na.$c],l.na.Uh[l.na.$c],
l.a.Bz)});"function"===typeof this.Xm&&"function"===typeof this.Rn&&this.Y.pa(l.a.dw,function(){eh(l)});this.Y.pa(this.a.gr,S.l.Ks);this.Y.start();"function"===typeof this.Xm&&"function"!==typeof this.Rn&&this.Xm()};e.kb=function(){var a;this.message&&M(K,this.message);for(a=0;a<this.buttons.length;a++)M(K,this.buttons[a]);for(a=0;a<this.Je.length;a++)M(K,this.Je[a]);for(a=0;a<this.ng.length;a++)M(K,this.ng[a]);ah()};
e.qa=function(){var a=m.context.globalAlpha;m.context.globalAlpha=this.a.rj;xa(0,0,m.canvas.width,m.canvas.height,this.a.po,!1);m.context.globalAlpha=a};
function gh(a,b,c,d){this.depth=-100;this.visible=!1;this.h=!0;S.c.Ga(this,S.jb);var g,h;this.a=c?S.a.w.Bp:S.a.w.options;if("landscape"===S.orientation)for(g in h=c?S.a.w.lC:S.a.w.Ly,h)this.a[g]=h[g];this.nc=S.a.w.Xb;h=c?S.a.R.Bp:S.a.R.options;for(g in h)this.a[g]=h[g];if(S.A.options&&S.A.options.buttons)for(g in S.A.options.buttons)this.a.buttons[g]=S.A.options.buttons[g];this.type=a;this.EA=b;this.Fc=c;this.Qm=!1!==d;L(this)}e=gh.prototype;
e.Yi=function(a,b,c,d,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,t=void 0;switch(a){case "music":h="music_toggle";n=this.Uu;l=S.b.Ng()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.Uu;l=S.b.Ng()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.Vu;l=S.b.Em()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.Vu;l=S.b.Em()?"on":"off";break;case "language":h="language_toggle";n=this.Tu;l=S.b.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.di;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.Wt;this.Pn=this.Kz;break;case "moreGames":void 0!==S.A.ky?(h="default_image",t=S.A.ky):(h="default_text",k="optionsMoreGames");n=this.Lz;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=S.Wh.customFunctions&&"function"===typeof S.Wh.customFunctions.exit?S.Wh.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.iz;break;
case "restart":h="default_text";k="optionsRestart";n=this.nz;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.Wt;this.Pn=this.Nz;break;case "about":h="default_text";k="optionsAbout";n=this.Iz;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.xj;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.xh}void 0!==h&&void 0!==n&&("image"===this.nc[h].type?this.buttons.push(new hh(h,b,c,this.depth-20,t,d,{S:n,fa:this,dc:q},
this.d)):"toggleText"===this.nc[h].type?this.buttons.push(new rg(h,b,c,this.depth-20,l,d,{S:n,fa:this,dc:q},this.d)):"text"===this.nc[h].type?this.buttons.push(new vg(h,b,c,this.depth-20,k,d,{S:n,fa:this,dc:q},this.d)):"toggle"===this.nc[h].type&&this.buttons.push(new ih(h,b,c,this.depth-20,l,{S:n,fa:this,dc:q},this.d)),this.buttons[this.buttons.length-1].ib=g||!1)};
e.Wt=function(){var a=this;Z(a.d,"y","inGame"!==this.type?-this.d.e.height:this.canvas.height,this.a.wm,this.a.xm,function(){M(K,a);void 0!==a.Pn&&a.Pn.call(a)});return!0};
e.Ka=function(a,b){var c,d,g,h;x(this.d.e);m.clear();this.a.backgroundImage.p(0,0,0);c=S.j.q("optionsTitle","<OPTIONS_TITLE>");d=X.I();this.a.gc&&C(d,this.a.gc);void 0!==this.a.Ld&&void 0!==this.a.We&&(g=Wa(d,c,this.a.Ld,this.a.We,this.a.Ld),d.fontSize>g&&D(d,g));g=S.c.ka(this.a.Qf,this.canvas.width,d.da(c),d.align)-a;h=S.c.ka(this.a.zc,this.canvas.height,d.W(c,d.i))-b+-1*S.ja;d.p(c,g,h);y(this.d.e)};
e.$f=function(a,b,c){var d,g,h,k,l,n,q;h=!1;var t=this.a.buttons[this.type];"inGame"===this.type&&S.a.K.sg.by&&(t=S.a.K.sg.by);if("function"!==typeof jh())for(d=0;d<t.length;d++){if("string"===typeof t[d]&&"moreGames"===t[d]){t.splice(d,1);break}for(g=0;g<t[d].length;g++)if("moreGames"===t[d][g]){t[d].splice(g,1);break}}if(!1===S.A.Ng||!1===S.b.hm)for(d=0;d<t.length;d++)if(t[d]instanceof Array){for(g=0;g<t[d].length;g++)if("music"===t[d][g]){S.b.im?t[d]="sfx_big":t.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
t[d]){t.splice(d,1);break}if(!S.b.im)for(d=0;d<t.length;d++)if(t[d]instanceof Array){for(g=0;g<t[d].length;g++)if("sfx"===t[d][g]){!1!==S.A.Ng&&S.b.hm?t[d]="music_big":t.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===t[d]){t.splice(d,1);break}if(1===S.j.Ow().length)for(d=0;d<t.length;d++)if("language"===t[d]){t.splice(d,1);break}h=this.nc.default_text.s.height;k=this.a.hl;a=S.c.g(this.a.gl,this.canvas.width,k)-a;n=S.c.g(this.a.dj,this.d.e.height,h*t.length+this.a.Rd*(t.length-1))-b+-1*S.ja;
for(d=0;d<t.length;d++){l=a;q=k;if("string"===typeof t[d])this.Yi(t[d],l,n,q,c);else for(b=t[d],q=(k-(b.length-1)*this.a.Rd)/b.length,g=0;g<b.length;g++)this.Yi(b[g],l,n,q,c),l+=q+this.a.Rd;n+=h+this.a.Rd}};e.Uu=function(a){var b=!0;"off"===a?(b=!1,S.Ha.Va("off","options:music")):S.Ha.Va("on","options:music");S.b.Ng(b);return!0};e.Vu=function(a){var b=!0;"off"===a?(b=!1,S.Ha.Va("off","options:sfx")):S.Ha.Va("on","options:sfx");S.b.Em(b);return!0};
e.Tu=function(a){S.j.Yt(a);S.Ha.Va(a,"options:language");return!0};
e.di=function(){function a(){l.Sc+=1;l.di();return!0}function b(){l.Sc-=1;l.di();return!0}function c(){var a;l.Ka(n,q);l.ig.ib=!0;for(a=0;a<l.buttons.length;a++)M(K,l.buttons[a]);l.buttons=[];l.$f(n,q,!0)}var d,g,h,k,l=this,n=S.c.g(l.a.Pb,l.canvas.width,l.a.backgroundImage.width),q=S.c.g(l.a.Hb,l.canvas.height,l.a.backgroundImage.height)+-1*S.ja;void 0===l.Sc&&(l.Sc=0);l.rk=void 0!==S.K.ts?S.K.ts():[];S.Ha.Va((10>l.Sc?"0":"")+l.Sc,"options:tutorial");for(d=0;d<l.buttons.length;d++)M(K,l.buttons[d]);
l.buttons=[];this.Fc?(x(l.d.e),m.clear(),l.ig.ib=!1):l.Ka(n,q);x(l.d.e);void 0!==l.a.Md&&(d=S.c.g(l.a.jn,l.d.e.width,l.a.Md.width),g=S.c.g(l.a.Rf,l.d.e.height,l.a.Md.height),l.a.Md.p(0,d,g));k=l.rk[l.Sc].title;void 0!==k&&""!==k&&(h=X.I(),l.a.tk&&C(h,l.a.tk),d=Wa(h,k,l.a.kn,l.a.yq,l.a.kn),h.fontSize>d&&D(h,d),d=S.c.ka(l.a.av,l.d.e.width,h.da(k,l.a.kn),h.align),g=S.c.ka(l.a.zq,l.d.e.height,h.W(k,l.a.yq),h.i),h.p(k,d,g));l.Sc<l.rk.length&&(h=l.rk[l.Sc].e,d=S.c.g(l.a.Yu,l.d.e.width,h.width),g=S.c.g(l.a.wq,
l.d.e.height,h.height),h.p(0,d,g),k=l.rk[l.Sc].text,h=X.I(),l.a.sk&&C(h,l.a.sk),d=Wa(h,k,l.a.ri,l.a.Zu,l.a.ri),h.fontSize>d&&D(h,d),d=S.c.ka(l.a.$u,l.d.e.width,h.da(k,l.a.ri),h.align),g=S.c.ka(l.a.xq,l.d.e.height,h.W(k,l.a.ri),h.i),h.p(k,d,g,l.a.ri));y(l.d.e);h=ed;d=S.c.g(l.a.Xu,l.canvas.width,h.width)-l.d.x;g=S.c.g(l.a.vq,l.canvas.height,h.height)-l.d.y-S.ja;0<=l.Sc-1?l.buttons.push(new ag(d,g,l.depth-20,new Yb(h),[h],{S:b,fa:l},l.d)):(h=cd,l.buttons.push(new ag(d,g,l.depth-20,new Yb(h),[h],{S:c,
fa:l},l.d)));h=dd;d=S.c.g(this.a.Wu,l.canvas.width,h.width)-l.d.x;g=S.c.g(this.a.uq,l.canvas.height,h.height)-l.d.y-S.ja;l.Sc+1<l.rk.length?l.buttons.push(new ag(d,g,l.depth-20,new Yb(h),[h],{S:a,fa:l},l.d)):(h=cd,l.buttons.push(new ag(d,g,l.depth-20,new Yb(h),[h],{S:c,fa:l},l.d)));return!0};
e.Iz=function(){function a(a,b,c,g,h,k){var l;l=X.I();b&&C(l,b);b=Wa(l,a,h,k,h);l.fontSize>b&&D(l,b);c=S.c.ka(c,d.d.e.width,l.da(a,h),l.align);g=S.c.ka(g,d.d.e.height,l.W(a,k),l.i);l.p(a,c,g,h);return g+k}function b(a,b,c){b=S.c.g(b,d.d.e.width,a.width);c=S.c.g(c,d.d.e.height,a.height);a.p(0,b,c);return c+a.height}var c,d=this,g=S.c.g(d.a.Pb,d.canvas.width,d.a.backgroundImage.width),h=S.c.g(d.a.Hb,d.canvas.height,d.a.backgroundImage.height)+-1*S.ja;S.Ha.Va("about","options");for(c=0;c<d.buttons.length;c++)M(K,
d.buttons[c]);d.buttons=[];this.Fc?(x(d.d.e),m.clear(),d.ig.ib=!1):d.Ka(g,h);x(d.d.e);void 0!==d.a.Md&&b(d.a.Md,d.a.jn,d.a.Rf);var k=null;"function"===typeof S.l.Vr?k=S.l.Vr(d.a,a,b,d.d.e):(c=S.j.q("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.Mk,d.a.Ok,d.a.Ti,d.a.Nk,d.a.$q),b(gd,d.a.Ui,d.a.Pk),c=S.j.q("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.Vi,d.a.oh,d.a.Xi,d.a.Zf,d.a.Wi));a(S.j.q("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+gg()+("big"===S.size?"b":"s"),d.a.An,d.a.cr,
d.a.Bn,d.a.br,d.a.ar);y(d.d.e);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new ag(l.x,l.y,d.depth-10,Xb(0,0,l.width,l.height),null,{S:function(a){return function(){S.l.Cd(a)}}(l.url),dc:!0},d.d))}else void 0!==S.A.Hs&&(c=S.c.g(d.a.Ui,d.d.e.width,gd.width),k=S.c.g(d.a.Pk,d.d.e.height,gd.height),c=Math.min(c,S.c.g(d.a.oh,d.d.e.width,d.a.Zf)),k=Math.min(k,S.c.g(d.a.Xi,d.d.e.height,d.a.Wi)),l=Math.max(d.a.Zf,gd.width),d.buttons.push(new ag(c,k,d.depth-10,Xb(0,0,l,S.c.g(d.a.Xi,d.d.e.height,
d.a.Wi)+d.a.Wi-k),null,{S:function(){S.l.Cd(S.A.Hs)},dc:!0},d.d)));d.buttons.push(new vg("default_text",S.c.g(d.a.zn,d.d.e.width,d.a.Si),d.a.Ri,d.depth-20,"optionsAbout_backBtn",d.a.Si,{S:function(){var a;d.Ka(g,h);d.ig.ib=!0;for(a=0;a<d.buttons.length;a++)M(K,d.buttons[a]);d.buttons=[];d.$f(g,h,!0);d.cu=!1},fa:d},d.d));return this.cu=!0};
function kh(a){var b,c,d,g,h,k=S.c.g(a.a.Pb,a.canvas.width,a.a.backgroundImage.width),l=S.c.g(a.a.Hb,a.canvas.height,a.a.backgroundImage.height)+-1*S.ja;S.Ha.Va("versions","options");for(b=0;b<a.buttons.length;b++)M(K,a.buttons[b]);a.buttons=[];a.Ka(k,l);x(a.d.e);void 0!==a.a.Md&&a.a.Md.p(0,S.c.g(a.a.jn,a.d.width,a.a.Md.width),S.c.g(a.a.Rf,a.d.height,a.a.Md.height));h=X.I();C(h,a.a.An);G(h,"left");c=a.a.lv;d=a.a.mv;for(b in S.version)g=b+": "+S.version[b],h.p(g,c,d),d+=h.W(g)+a.a.kv;c=S.c.g(a.a.zn,
a.d.e.width,a.a.Si);d=a.a.Ri;a.buttons.push(new vg("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Si,{S:function(){var b;a.Ka(k,l);for(b=0;b<a.buttons.length;b++)M(K,a.buttons[b]);a.buttons=[];a.$f(k,l,!0)},fa:a},a.d))}e.Kz=function(){return!0};e.Lz=function(){S.Ha.Va("moreGames","options");var a=jh();"function"===typeof a&&a();return!0};
e.iz=function(){var a=this;lh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){S.Ha.Va("confirm_yes","options:quit");M(K,a);hg(S.Ha,S.b.eh,mh(S.b),"progression:levelQuit:"+nh());oh();ph(S.b);return!0})};
e.nz=function(){var a=this;lh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){S.Ha.Va("confirm_yes","options:restart");M(K,a);var b=S.b;b.state="LEVEL_END";hg(S.Ha,S.b.eh,mh(S.b),"progression:levelRestart:"+nh());b=S.m.vk?b.ub+1:Cg(b)+1;S.b.ra=!0;S.b.Vs="retry";qh(S.b,!0);b={failed:!0,level:b,restart:!0};S.l.Lh(b);S.Od.Lh(b);return!0})};
e.xj=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";b.Hd(S.j.q(d,"<"+d.toUpperCase()+">"));a&&(b.ig.ib=!1,b.Qm||Wg())};lh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){S.b.xj(a);return!0})};
e.xh=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";b.Hd(S.j.q(d,"<"+d.toUpperCase()+">"));a&&(b.ig.ib=!1,b.Qm||Wg())};lh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){S.b.xh(a);return!0})};
function lh(a,b,c,d,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)M(K,a.buttons[h]);a.buttons=[];b=S.j.q(b,"<"+b.toUpperCase()+">");h=X.I();a.a.Wn?C(h,a.a.Wn):a.a.Im&&C(h,a.a.Im);k=Wa(h,b,a.a.nl,a.a.Xn,!0);k<h.fontSize&&D(h,k);n=h.da(b,a.a.nl)+10;l=h.W(b,a.a.nl)+10;k=S.c.ka(a.a.Mr,a.d.e.width,n,h.align);l=S.c.ka(a.a.Yn,a.d.e.height,l,h.i);x(a.d.e);h.p(b,k,l,n);y(a.d.e);k=S.c.g(a.a.Kr,a.canvas.width,a.a.hj)-a.d.x;l=S.c.g(a.a.Un,a.canvas.height,a.nc.default_text.s.height)-a.d.y-S.ja;a.buttons.push(new vg("default_text",
k,l,a.depth-20,d,a.a.hj,{S:function(){var b,c,d;c=S.c.g(a.a.Pb,a.canvas.width,a.a.backgroundImage.width);d=S.c.g(a.a.Hb,a.canvas.height,a.a.backgroundImage.height)+-1*S.ja;a.Ka(c,d);for(b=0;b<a.buttons.length;b++)M(K,a.buttons[b]);a.buttons=[];a.$f(c,d,!0);return!0},fa:a},a.d));k=S.c.g(a.a.Lr,a.canvas.width,a.a.hj)-a.d.x;l=S.c.g(a.a.Vn,a.canvas.height,a.nc.default_text.s.height)-a.d.y-S.ja;a.buttons.push(new vg("default_text",k,l,a.depth-20,c,a.a.hj,{S:function(){return"function"===typeof g?g():!0},
fa:a},a.d))}
e.Hd=function(a){var b,c,d,g;for(b=0;b<this.buttons.length;b++)M(K,this.buttons[b]);this.buttons=[];c=S.c.g(this.a.Pb,this.canvas.width,this.a.backgroundImage.width);d=S.c.g(this.a.Hb,this.canvas.height,this.a.backgroundImage.height)+-1*S.ja;this.Ka(c,d);b=X.I();this.a.Ig&&C(b,this.a.Ig);c=Wa(b,a,this.a.sp,this.a.ey,!0);c<b.fontSize&&D(b,c);g=b.da(a,this.a.sp)+10;d=b.W(a,this.a.sp)+10;c=S.c.ka(this.a.fy,this.d.e.width,g,b.align);d=S.c.ka(this.a.gy,this.d.e.height,d,b.i);x(this.d.e);b.p(a,c,d,g);y(this.d.e)};
e.Nz=function(){S.Ha.Va("startScreen","options");ph(S.b);return!0};e.close=function(){M(K,this);return this.canvas.T=!0};
e.cc=function(){var a,b;this.Qm&&Wg(this);S.b.re=this;this.is=this.hs=!1;a=this.a.backgroundImage;this.d=new Xg(this.depth-10,this.Ea,new w(a.width,a.height));this.d.x=S.c.g(this.a.Pb,this.canvas.width,a.width);a=S.c.g(this.a.Hb,this.canvas.height,a.height)+-1*S.ja;this.d.y=a;this.Ka(this.d.x,this.d.y);this.buttons=[];this.EA?this.di():this.$f(this.d.x,this.d.y);this.ig=new ag(this.a.fj,this.a.zh,this.depth-20,new Xb(0,0,this.a.yh,this.a.jg),void 0,{S:this.close,fa:this},this.d);this.ui="versions";
this.bg=new bc;S.c.Ga(this.bg,S.jb);Rb(this.bg,this.depth-1);cc(this.bg,"keyAreaLeft",this.d.x,this.d.y+this.a.Rf,this.a.ph,this.a.Qk,76);cc(this.bg,"keyAreaRight",this.d.x+this.d.width-this.a.ph,this.d.y+this.a.Rf,this.a.ph,this.a.Qk,82);cc(this.bg,"keyAreaCentre",S.Ix/2-this.a.ph/2,this.d.y+this.a.Rf,this.a.ph,this.a.Qk,67);b=this;this.d.y="inGame"!==this.type?this.canvas.height:-this.d.e.height;Z(this.d,"y",a,this.a.Uj,this.a.Vj,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].ib=!0})};
e.kb=function(){var a;this.Qm&&ah();this.hs&&ta(S.Bg,S.j.Io());this.is&&ta(S.Cf);for(a=0;a<this.buttons.length;a++)M(K,this.buttons[a]);this.bg.clear();M(K,this.bg);M(K,this.ig);M(K,this.d);S.b.re=null};e.Db=function(){return!0};e.cb=function(){return!0};e.pf=function(a){this.cu&&(67===a?this.ui="":76===a?this.ui+="l":82===a&&(this.ui+="r"),"lrl"===this.ui&&kh(this))};e.jd=function(a){a===S.Bg?(this.Ka(this.d.x,this.d.y),this.hs=!0):a===S.Cf?this.is=!0:a===S.Mv&&this.close()};
function rh(){this.depth=-200;this.h=this.visible=!0;S.c.Ga(this,S.ug);var a;this.a=S.a.w.Jl;if("landscape"===S.orientation&&S.a.w.wo)for(a in S.a.w.wo)this.a[a]=S.a.w.wo[a];this.nc=S.a.w.Xb;for(a in S.a.R.Jl)this.a[a]=S.a.R.Jl[a];L(this)}
rh.prototype.Ka=function(){var a,b,c,d;c=this.a.backgroundImage;d=(S.Fx-Math.abs(S.ja))/c.Ah;this.d.e=new w(d*c.gj,d*c.Ah);x(this.d.e);this.d.y=Math.abs(S.ja);a=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,Ba(c,0,0),a.restore());c=X.I();C(c,this.a.font);d=S.j.q("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Wa(c,d,this.a.bn-(c.stroke?c.rd:0),this.a.qA-(c.stroke?c.rd:0),!0);a<c.fontSize&&D(c,a);a=S.c.ka(this.a.Lu,this.canvas.width,
c.da(d),c.align);b=S.c.ka(this.a.Mu,this.canvas.height,c.W(d),c.i);c.p(d,a,b,this.a.bn);y(this.d.e);this.d.canvas.T=!0};rh.prototype.cc=function(){var a=this,b=this.a.backgroundImage,b=new w(b.width,b.height);this.d=new Xg(this.depth,S.jb,b);this.d.x=0;this.d.y=Math.abs(S.ja);this.Ka();this.button=new vg(this.a.Ar,S.c.g(this.a.bw,this.canvas.width,this.a.Br),S.c.g(this.a.Cr,this.canvas.height,this.nc[this.a.Ar].s.height),this.depth-10,"gameEndScreenBtnText",this.a.Br,function(){M(K,a);ph(S.b)},this.d)};
rh.prototype.kb=function(){M(K,this.d);M(K,this.button)};rh.prototype.jd=function(a){a!==S.Bg&&a!==S.Cf||this.Ka()};
function ag(a,b,c,d,g,h,k){function l(a,b,c){var d,g;g=S.c.Ho(q.canvas);a=Math.round(q.x+q.parent.x-q.uc*q.Aa);d=Math.round(q.y+q.parent.y-q.vc*q.Na);if(q.images&&0<q.Da||0<q.kk)q.Da=0,q.kk=0,q.canvas.T=!0;if(q.Zj&&q.ib&&Zb(q.ld,a,d,b-g.x,c-g.y))return q.Zj=!1,void 0!==q.fa?q.vm.call(q.fa,q):q.vm(q)}function n(a,b,c){var d,g,h;h=S.c.Ho(q.canvas);d=Math.round(q.x+q.parent.x-q.uc*q.Aa);g=Math.round(q.y+q.parent.y-q.vc*q.Na);if(q.ib&&Zb(q.ld,d,g,b-h.x,c-h.y))return q.Zj=!0,q.images&&(1<q.images.length?
(q.Da=1,q.canvas.T=!0):1<q.images[0].G&&(q.kk=1,q.canvas.T=!0)),void 0!==typeof Cf&&I.play(Cf),q.rg=a,!0}this.depth=c;this.h=this.visible=!0;this.group="TG_Token";S.c.Ga(this,S.jb);this.vc=this.uc=0;this.x=a;this.y=b;this.width=g?g[0].width:d.ab-d.Ia;this.height=g?g[0].height:d.Bb-d.Ua;this.alpha=this.Na=this.Aa=1;this.Z=0;this.ld=d;this.images=g;this.kk=this.Da=0;this.Zj=!1;this.ib=!0;this.parent=void 0!==k?k:{x:0,y:0};this.Mm=this.Lm=0;this.wb=!0;this.vm=function(){};this.dc=!1;"object"===typeof h?
(this.vm=h.S,this.fa=h.fa,this.dc=h.dc):"function"===typeof h&&(this.vm=h);var q=this;this.dc?(this.Jh=n,this.Kh=l):(this.cb=n,this.Db=l);L(this)}function ug(a,b,c,d,g,h){void 0===a.gf&&(a.gf=[]);a.gf.push({type:b,start:d,Yc:g,Qa:c,duration:h,k:0})}
function zg(a){var b,c;if(void 0!==a.gf){for(b=0;b<a.gf.length;b++)if(c=a.gf[b],c.h){switch(c.type){case "xScale":a.Aa=c.start+c.Yc;break;case "yScale":a.Na=c.start+c.Yc;break;case "alpha":a.alpha=c.start+c.Yc;break;case "angle":a.Z=c.start+c.Yc;break;case "x":a.x=c.start+c.Yc;break;case "y":a.y=c.start+c.Yc}c.h=!1}a.canvas.T=!0}}function Gg(a,b){a.images=b;a.canvas.T=!0}e=ag.prototype;e.$t=function(a){this.visible=this.h=a};e.kb=function(){this.images&&(this.canvas.T=!0)};
e.V=function(a){var b,c;if(void 0!==this.gf){for(b=0;b<this.gf.length;b++)switch(c=this.gf[b],c.k+=a,c.type){case "xScale":var d=this.Aa,g=this.Lm;this.Aa=c.Qa(c.k,c.start,c.Yc,c.duration);this.Lm=-(this.images[0].width*this.Aa-this.images[0].width*c.start)/2;if(isNaN(this.Aa)||isNaN(this.Lm))this.Aa=d,this.Lm=g;break;case "yScale":d=this.Na;g=this.Mm;this.Na=c.Qa(c.k,c.start,c.Yc,c.duration);this.Mm=-(this.images[0].height*this.Na-this.images[0].height*c.start)/2;if(isNaN(this.Na)||isNaN(this.Mm))this.Na=
d,this.Mm=g;break;case "alpha":this.alpha=c.Qa(c.k,c.start,c.Yc,c.duration);break;case "angle":this.Z=c.Qa(c.k,c.start,c.Yc,c.duration);break;case "x":d=this.x;this.x=c.Qa(c.k,c.start,c.Yc,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.Qa(c.k,c.start,c.Yc,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.T=!0}};
e.Xd=function(){var a,b,c;c=S.c.Ho(this.canvas);a=Math.round(this.x+this.parent.x-this.uc*this.Aa);b=Math.round(this.y+this.parent.y-this.vc*this.Na);this.Zj&&!Zb(this.ld,a,b,K.ma[this.rg].x-c.x,K.ma[this.rg].y-c.y)&&(this.images&&(this.kk=this.Da=0,this.canvas.T=!0),this.Zj=!1)};
e.qa=function(){var a,b;a=Math.round(this.x+this.parent.x-this.uc*this.Aa);b=Math.round(this.y+this.parent.y-this.vc*this.Na);this.images&&(this.images[this.Da]instanceof w?this.images[this.Da].$(a,b,this.Aa,this.Na,this.Z,this.alpha):this.images[this.Da].$(this.kk,a,b,this.Aa,this.Na,this.Z,this.alpha));this.wb=!1};
function vg(a,b,c,d,g,h,k,l){this.aa=S.a.w.Xb[a];a=void 0!==S.a.R.buttons?S.a.w.fl[S.a.R.buttons[a]||S.a.R.buttons.default_color]:S.a.w.fl[S.a.w.buttons.default_color];this.font=X.I();a.font&&C(this.font,a.font);this.aa.fontSize&&D(this.font,this.aa.fontSize);this.L=g;this.text=S.j.q(this.L,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.aa.s.height;this.e={source:this.aa.s,ya:this.aa.ya,qb:this.aa.qb};g=this.ve(this.e);h=new Xb(0,0,g[0].width,g[0].height);ag.call(this,b,c,d,
h,g,k,l)}S.c.Mj(vg);e=vg.prototype;e.Km=function(a){this.text=S.j.q(this.L,"<"+this.L.toUpperCase()+">");a&&C(this.font,a);Gg(this,this.ve(this.e))};e.Bq=function(a,b){this.L=a;this.Km(b)};e.uk=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof p?this.e.source=a:void 0!==a.ya&&void 0!==a.qb&&void 0!==a.source&&(this.e=a);Gg(this,this.ve(this.e))};
e.ve=function(a){var b,c,d,g,h,k,l=a.ya+a.qb;d=this.height-(this.aa.td||0);var n=a.source;c=this.font.da(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Wa(this.font,this.text,b,d,!0);c<this.aa.fontSize?D(this.font,c):D(this.font,this.aa.fontSize);c=a.ya;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.aa.sd&&(d+=this.aa.sd);h=[];for(g=0;g<n.G;g++)k=new w(b+l,this.height),x(k),n.xa(g,0,0,a.ya,this.height,0,0,1),n.ul(g,a.ya,0,n.width-l,this.height,a.ya,0,b,this.height,1),n.xa(g,a.ya+n.width-l,0,a.qb,this.height,a.ya+b,0,1),this.font.p(this.text,c,d,b),y(k),h.push(k);return h};e.jd=function(a){a===S.Bg&&this.Km()};
function hh(a,b,c,d,g,h,k,l){this.aa=S.a.w.Xb[a];void 0!==h&&(this.width=h);this.height=this.aa.s.height;this.Qd={source:this.aa.s,ya:this.aa.ya,qb:this.aa.qb};this.e=g;a=this.ve();g=new Xb(0,0,a[0].width,a[0].height);ag.call(this,b,c,d,g,a,k,l)}S.c.Mj(hh);
hh.prototype.ve=function(){var a,b,c,d,g,h,k,l=this.Qd.ya+this.Qd.qb;b=this.height-(this.aa.td||0);var n=this.Qd.source;void 0===this.width?a=this.e.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.e.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.e.width))));k=Math.min(a/this.e.width,b/this.e.height);k=Math.min(k,1);g=Math.round(this.Qd.ya+
(a-this.e.width*k)/2);h=Math.round((b-this.e.height*k)/2);c=[];for(b=0;b<n.G;b++){d=new w(a+l,this.height);x(d);n.xa(b,0,0,this.Qd.ya,this.height,0,0,1);n.ul(b,this.Qd.ya,0,n.width-l,this.height,this.Qd.ya,0,a,this.height,1);n.xa(b,this.Qd.ya+n.width-l,0,this.Qd.qb,this.height,this.Qd.ya+a,0,1);try{m.context.drawImage(this.e,g,h,this.e.width*k,this.e.height*k)}catch(q){}y(d);c.push(d)}return c};S.c.Mj(function(a,b,c,d,g,h,k){ag.call(this,a,b,c,g,d,h,k)});
function rg(a,b,c,d,g,h,k,l){var n;this.aa=S.a.w.Xb[a];a=void 0!==S.a.R.buttons?S.a.w.fl[S.a.R.buttons[a]||S.a.R.buttons.default_color]:S.a.w.fl[S.a.w.buttons.default_color];this.font=X.I();a.font&&C(this.font,a.font);this.aa.fontSize&&D(this.font,this.aa.fontSize);void 0!==h&&(this.width=h);this.height=this.aa.s.height;this.X=this.aa.X;if(this.X.length){for(h=0;h<this.X.length;h++)if(this.X[h].id===g){this.Ja=h;break}void 0===this.Ja&&(this.Ja=0);this.text=S.j.q(this.X[this.Ja].L,"<"+this.X[this.Ja].id.toUpperCase()+
">");this.gh=this.X[this.Ja].s;h=this.ve();a=new Xb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Sg();return k(n.X[n.Ja].id)}:"object"===typeof k?(g={},g.dc=k.dc,g.fa=this,g.S=function(){n.Sg();return k.S.call(k.fa,n.X[n.Ja].id)}):g=function(){n.Sg()};ag.call(this,b,c,d,a,h,g,l)}}S.c.Mj(rg);e=rg.prototype;
e.Sg=function(a){var b;if(void 0===a)this.Ja=(this.Ja+1)%this.X.length;else for(b=0;b<this.X.length;b++)if(this.X[b].id===a){this.Ja=b;break}this.uk(this.X[this.Ja].s,S.j.q(this.X[this.Ja].L,"<"+this.X[this.Ja].id.toUpperCase()+">"))};e.Km=function(a){a&&C(this.font,a);this.text=S.j.q(this.X[this.Ja].L,"<"+this.X[this.Ja].id.toUpperCase()+">");Gg(this,this.ve())};e.uk=function(a,b,c){this.text=b;this.gh=a;c&&C(this.font,c);Gg(this,this.ve())};
e.ve=function(){var a,b,c,d,g,h,k=this.aa.ya,l=this.aa.qb,n=k+l;g=Math.abs(k-l);d=this.height-(this.aa.td||0);var q=this.aa.s,t=this.font.I();b=t.da(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Wa(t,this.text,a,d,!0);d<t.fontSize&&D(t,d);b=t.da(this.text,
a);d=k;c=t.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.aa.ah+Math.round(b/2)):"left"===c?d+=this.aa.ah:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.aa.sd&&(g+=this.aa.sd);c=[];for(b=0;b<q.G;b++)h=new w(a+n,this.height),x(h),q.xa(b,0,0,k,this.height,0,0,1),q.ul(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.xa(b,k+q.width-n,0,l,this.height,k+a,0,1),this.gh.p(0,this.aa.oi,this.aa.pi),t.p(this.text,d,g,a),y(h),c.push(h);return c};e.jd=function(a){a===S.Bg&&this.Km()};
function ih(a,b,c,d,g,h,k){var l;this.X=S.a.w.Xb[a].X;if(this.X.length){for(a=0;a<this.X.length;a++)if(this.X[a].id===g){this.Ja=a;break}void 0===this.Ja&&(this.Ja=0);this.gh=this.X[this.Ja].s;a=new Yb(this.gh);l=this;g="function"===typeof h?function(){l.Sg();return h(l.X[l.Ja].id)}:"object"===typeof h?{fa:this,S:function(){l.Sg();return h.S.call(h.fa,l.X[l.Ja].id)}}:function(){l.Sg()};ag.call(this,b,c,d,a,[this.gh],g,k)}}S.c.Mj(ih);
ih.prototype.Sg=function(a){var b;if(void 0===a)this.Ja=(this.Ja+1)%this.X.length;else for(b=0;b<this.X.length;b++)if(this.X[b].id===a){this.Ja=b;break}this.uk(this.X[this.Ja].s)};ih.prototype.uk=function(a){this.gh=a;Gg(this,[].concat(this.gh))};
function sh(a,b,c,d){this.depth=10;this.visible=!1;this.h=!0;S.c.Ga(this,S.jb);var g;this.a=S.a.w.gm;if("landscape"===S.orientation&&S.a.w.dp)for(g in S.a.w.dp)this.a[g]=S.a.w.dp[g];for(g in S.a.R.gm)this.a[g]=S.a.R.gm[g];this.Vo=a;this.Fn=b;this.S=c;this.fa=d;this.ae="entering";this.pk=!1;L(this,!1);Sb(this,"LevelStartDialog")}e=sh.prototype;
e.ck=function(){var a,b,c,d,g,h=this;if("leaving"!==this.ae){this.ae="leaving";this.dg=0;a=function(){M(K,h);h.fa?h.S.call(h.fa):h.S&&h.S()};if(void 0!==this.a.ym)for(b=0;b<this.a.ym.length;b++)c=this.a.ym[b],d=void 0,c.cl&&(this.dg++,d=a),g=c.end,"x"===c.type?g=S.c.g(g,this.canvas.width,this.d.e.width):"y"===c.type&&(g=S.c.g(g,this.canvas.height,this.d.e.height)+Math.abs(S.ja)),Z(this.d,c.type,g,c.duration,c.Qa,d,c.za,c.loop,c.lp);0===this.dg&&a()}};
e.cc=function(){var a,b,c,d,g,h,k=this;a=this.a.Pc;b=a.width;g=a.height;this.d=new Xg(this.depth+10,this.Ea,new w(b,g));x(this.d.e);a.p(0,0,0);""!==this.Fn&&(c=S.c.g(this.a.jr,b,0),d=S.c.g(this.a.kr,g,0),a=X.I(),C(a,this.a.ir),void 0!==this.a.Zi&&void 0!==this.a.En&&(h=Wa(a,this.Fn,this.a.Zi,this.a.En,this.a.Zi),a.fontSize>h&&D(a,h)),a.p(this.Fn,c,d,this.a.Zi));""!==this.Vo&&(c=S.c.g(this.a.As,b,0),d=S.c.g(this.a.Bs,g,0),a=X.I(),C(a,this.a.ys),void 0!==this.a.Wl&&void 0!==this.a.zs&&(h=Wa(a,this.Vo,
this.a.Wl,this.a.zs,this.a.Wl),a.fontSize>h&&D(a,h)),a.p(this.Vo,c,d,this.a.Wl));y(this.d.e);this.d.x=S.c.g(this.a.Dp,this.canvas.width,b);this.d.y=S.c.g(this.a.Xj,this.canvas.height,g)+Math.abs(S.ja);this.dg=0;a=function(){k.dg--;0===k.dg&&(k.ae="paused")};if(void 0!==this.a.Wj)for(b=0;b<this.a.Wj.length;b++)g=this.a.Wj[b],c=void 0,g.cl&&(this.dg++,c=a),d=g.end,"x"===g.type?d=S.c.g(d,this.canvas.width,this.d.e.width):"y"===g.type&&(d=S.c.g(d,this.canvas.height,this.d.e.height)+Math.abs(S.ja)),Z(this.d,
g.type,d,g.duration,g.Qa,c,g.za,g.loop,g.lp),void 0!==g.yb&&I.play(g.yb);0===this.dg&&(this.ae="paused");this.k=0};e.kb=function(){M(K,this.d)};e.V=function(a){"paused"!==this.state&&(this.k+=a,this.k>=this.a.Ep&&this.ck())};e.cb=function(){return this.pk=!0};e.Db=function(){this.pk&&"paused"===this.ae&&this.ck();return!0};
function th(a,b,c){this.depth=10;this.visible=!1;this.h=!0;S.c.Ga(this,S.jb);this.a=S.a.w.kl;for(var d in S.a.R.kl)this.a[d]=S.a.R.kl[d];this.L=a;this.S=b;this.fa=c;this.ae="entering";this.pk=!1;this.na=qg(S.b);this.na.$c===this.na.kf&&(this.ll=!0);L(this,!1);Sb(this,"LevelStartDialog")}e=th.prototype;e.ck=function(){var a=this;"leaving"!==this.ae&&(this.ae="leaving",Z(this.d,"y",-this.d.height,this.a.Sk,this.a.Tk,function(){M(K,a);a.fa?a.S.call(a.fa):a.S&&a.S()}))};
e.cc=function(){var a,b,c,d,g,h,k;a=this;b=this.a.Pc;c=void 0!==b?b.width:T(600);d=void 0!==b?b.height:T(700);g=function(a,b,g,h,k,B,r){var s;s=X.I();void 0!==b&&C(s,b);b=Wa(s,a,g,h,k);s.fontSize>b&&D(s,b);B=S.c.ka(B,c,s.da(a,k),s.align);r=S.c.ka(r,d,s.W(a,k),s.align);s.p(a,B,r,k?g:void 0)};this.d=new Xg(this.depth+10,this.Ea,new w(c,d));x(this.d.e);void 0!==b&&b.p(0,0,0);b=this.ll?this.na.yu?S.j.q("challengeStartScreenTitle_challenger_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):S.j.q("challengeStartScreenTitle_challenger_friend",
"<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):this.na.yu?S.j.q("challengeStartScreenTitle_challengee_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>"):S.j.q("challengeStartScreenTitle_challengee_friend","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>");g(b,this.a.gc,this.a.Ld,this.a.We,!0,this.a.Qf,this.a.zc);if(this.ll)for(b="",h=1;h<this.na.Dd.length;h++)k=this.na.Dd[h],b=13<k.length?b+(k.substr(0,10)+"..."):b+k,h+1<this.na.Dd.length&&(b+=", ");else k=this.na.Dd[this.na.kf],b=13<k.length?k.substr(0,10)+"...":
k;g(b,this.a.Dt,this.a.wy,this.a.vy,!1,this.a.zy,this.a.Ay);this.ll?b=S.j.q(this.L+"_challenger","<"+this.L.toUpperCase()+"_CHALLENGER>"):(b=S.j.q(this.L,"<"+this.L.toUpperCase()+">"),k=this.na.Dd[this.na.kf],b=b.replace("<NAME>",13<k.length?k.substr(0,10)+"...":k));g(b,this.a.St,this.a.rz,this.a.qz,!1,this.a.sz,this.a.Tt);this.ll||(b=uh(this.na.Uh[0]),g(b,this.a.Rt,this.a.vz,this.a.uz,!1,this.a.zz,this.a.Ut));b=S.j.q("challengeStartScreenToWin","<CHALLENGESTARTSCREENTOWIN>");g(b,this.a.rv,this.a.IA,
this.a.HA,!0,this.a.JA,this.a.sv);b=this.na.nv+"";g(b,this.a.qv,this.a.LA,this.a.KA,!1,this.a.MA,this.a.tv);y(this.d.e);this.d.x=S.c.g(this.a.Dp,this.canvas.width,c)+this.a.Mg;this.d.y=-this.d.height;Z(this.d,"y",S.c.g(this.a.Xj,this.canvas.height,this.d.e.height)+Math.abs(S.ja),this.a.ef,this.a.Rk,function(){a.ae="paused"});I.play(Af);this.k=0};e.kb=function(){M(K,this.d)};e.V=function(a){"paused"!==this.state&&(this.k+=a,this.k>=this.a.Ep&&this.ck())};e.cb=function(){return this.pk=!0};
e.Db=function(){this.pk&&"paused"===this.ae&&this.ck();return!0};function Xg(a,b,c){this.depth=a;this.h=this.visible=!0;S.c.Ga(this,b);this.e=c;this.Lb=0;this.width=c.width;this.height=c.height;this.vc=this.uc=this.y=this.x=0;this.Na=this.Aa=1;this.Z=0;this.alpha=1;this.tb=[];this.hr=0;this.parent={x:0,y:0};this.wb=!0;L(this,!1)}
function Z(a,b,c,d,g,h,k,l,n){var q,t=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.Aa;break;case "yScale":q=a.Na;break;case "scale":b="xScale";q=a.Aa;Z(a,"yScale",c,d,g,void 0,k,l,n);break;case "angle":q=a.Z;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.tb.push({id:a.hr,k:0,h:!0,ql:t,type:b,start:q,end:c,Yb:h,duration:d,Qa:g,za:k,loop:l,lp:n});a.hr++}
function Lg(a){var b;for(b=a.tb.length-1;0<=b;b--){switch(a.tb[b].type){case "x":a.x=a.tb[b].end;break;case "y":a.y=a.tb[b].end;break;case "xScale":a.Aa=a.tb[b].end;break;case "yScale":a.Na=a.tb[b].end;break;case "angle":a.Z=a.tb[b].end;break;case "alpha":a.alpha=a.tb[b].end;break;case "subImage":a.Lb=a.tb[b].end}"function"===typeof a.tb[b].Yb&&a.tb[b].Yb.call(a)}}
Xg.prototype.V=function(a){var b,c,d;for(b=0;b<this.tb.length;b++)if(c=this.tb[b],c.h&&(c.k+=a,c.ql&&c.k>=c.za&&(c.k%=c.za,c.ql=!1),!c.ql)){c.k>=c.duration?(d=c.end,c.loop?(c.ql=!0,c.za=c.lp,c.k%=c.duration):("function"===typeof c.Yb&&c.Yb.call(this),this.tb[b]=void 0)):"subImage"===c.type?(d=this.e instanceof Array?this.e.length:this.e.G,d=Math.floor(c.k*d/c.duration)):d=c.Qa(c.k,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.Aa=
d;break;case "yScale":this.Na=d;break;case "angle":this.Z=d;break;case "alpha":this.alpha=d;break;case "subImage":this.Lb=d}this.canvas.T=!0}for(b=this.tb.length-1;0<=b;b--)void 0===this.tb[b]&&this.tb.splice(b,1)};
Xg.prototype.qa=function(){var a,b,c;b=Math.round(this.x-this.Aa*this.uc)+this.parent.x;c=Math.round(this.y-this.Na*this.vc)+this.parent.y;a=this.e;a instanceof Array&&(a=this.e[this.Lb%this.e.length]);a instanceof w?a.$(b,c,this.Aa,this.Na,this.Z,this.alpha):a.$(this.Lb,b,c,this.Aa,this.Na,this.Z,this.alpha);this.wb=!1};
function Qg(a,b,c,d,g,h,k,l,n,q,t){this.depth=g;this.visible=!0;this.h=!1;S.c.Ga(this,S.jb);this.x=a;this.y=b;this.np=l;this.op="object"===typeof n?n.top:n;this.Jx="object"===typeof n?n.bottom:n;this.da=c;this.W=d;this.width=this.da+2*this.np;this.height=this.W+this.op+this.Jx;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof t?t:function(a){return a+""};this.alpha=1;this.Jb=this.Ib=this.vc=this.uc=0;c=new w(this.width,this.height);this.vd=new Xg(this.depth,this.Ea,
c);this.vd.x=a-this.np;this.vd.y=b-this.op;this.vd.parent=q;this.U=this.vd.e;this.Bf();L(this)}Qg.prototype.kb=function(){M(K,this.vd)};function $g(a,b,c){a.h=!0;a.Ln=a.value;a.value=a.Ln;a.end=b;a.duration=c;a.Qa=O;a.k=0}
Qg.prototype.Bf=function(){var a,b;a=this.font.align;b=this.font.i;var c=this.np,d=this.op;this.or||(this.U.clear(),this.canvas.T=!0);x(this.U);this.or&&this.or.xa(0,this.dB,this.eB,this.cB,this.bB,0,0,1);"center"===a?c+=Math.round(this.da/2):"right"===a&&(c+=this.da);"middle"===b?d+=Math.round(this.W/2):"bottom"===b&&(d+=this.W);b=this.toString(this.value);a=Wa(this.font,b,this.da,this.W,!0);a<this.font.fontSize&&D(this.font,a);this.font.p(b,c,d,this.da);y(this.U);this.vd.wb=!0};
Qg.prototype.V=function(a){var b;b=Math.round(this.Qa(this.k,this.Ln,this.end-this.Ln,this.duration));this.k>=this.duration?(this.value=this.end,this.h=!1,this.Bf()):b!==this.value&&(this.value=b,this.Bf());this.k+=a};function fh(a,b,c){this.depth=-100;this.visible=!1;this.h=!0;this.bz=a;S.c.Ga(this,S.jb);this.a=S.a.w.rl;this.nc=S.a.w.Xb;this.Dr=b;for(var d in S.a.R.rl)this.a[d]=S.a.R.rl[d];this.Gp=!1!==c;L(this)}e=fh.prototype;e.Tu=function(){};
e.Yi=function(a,b,c,d,g){b=new vg("default_text",b,c,this.depth-20,a.L||"NO_TEXT_KEY_GIVEN",d,{S:function(){a.S&&(a.fa?a.S.call(a.fa,a):a.S(a))},fa:this},this.d);this.buttons.push(b);a.text&&b.uk(b.e,a.text);this.buttons[this.buttons.length-1].ib=g||!1};
e.Ka=function(a,b,c){x(this.d.e);m.clear();this.a.backgroundImage.p(0,0,0);a=c?c:this.bz;b=X.I();this.a.Lp&&C(b,this.a.Lp);c=Wa(b,a,this.a.Np,this.a.Mp,!0);c<b.fontSize&&D(b,c);c=b.da(a,this.a.Np)+10;var d=b.W(a,this.a.Mp)+10;b.p(a,S.c.ka(this.a.gz,this.d.e.width,c,b.align),S.c.ka(this.a.hz,this.d.e.height-vh(this),d,b.i),c);y(this.d.e)};function vh(a){var b=a.Dr;return S.c.g(a.a.dj,a.d.e.height,a.nc.default_text.s.height*b.length+a.a.Rd*(b.length-1))}
e.$f=function(a,b){var c,d,g,h,k,l,n,q,t,A=[],A=this.Dr;g=this.nc.default_text.s.height;h=this.a.hl;k=S.c.g(this.a.gl,this.canvas.width,h)-a;q=vh(this);for(c=A.length-1;0<=c;c--){n=k;t=h;if("object"===typeof A[c]&&A[c].hasOwnProperty("length")&&A[c].length)for(l=A[c],t=(h-(l.length-1)*this.a.Rd)/l.length,d=0;d<l.length;d++)this.Yi(l[d],n,q,t,b),n+=t+this.a.Rd;else this.Yi(A[c],n,q,t,b);q-=g+this.a.Rd}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.$t(!0);this.d.visible=!0};e.close=function(){M(K,this);return this.canvas.T=!0};function wh(a){var b=S.b.df;b.Ka(b.d.x,b.d.y,a);for(a=0;a<b.buttons.length;a++)M(K,b.buttons[a]);b.canvas.T=!0}
e.cc=function(){var a,b;this.Gp&&Wg(this);a=this.a.backgroundImage;this.d=new Xg(this.depth-10,this.Ea,new w(a.width,a.height));this.d.x=S.c.g(this.a.Pb,this.canvas.width,a.width);a=S.c.g(this.a.Hb,this.canvas.height,a.height)+-1*("landscape"===S.orientation?S.a.w.Tn:S.a.w.te).rm;this.d.y=a;this.Ka(this.d.x,this.d.y);this.buttons=[];this.$f(this.d.x);b=this;this.d.y=-this.d.e.height;Z(this.d,"y",a,this.a.Uj,this.a.Vj,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].ib=!0})};
e.kb=function(){var a;this.Gp&&ah();for(a=0;a<this.buttons.length;a++)M(K,this.buttons[a]);M(K,this.d);S.b.re===this&&(S.b.re=null)};e.Db=function(){return!0};e.cb=function(){return!0};
function xh(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function og(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,l){a=k(a,k(k(c^(b|~d),g),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,l){a=k(a,k(k(b^c^d,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,l){a=k(a,k(k(b&d|c&~d,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,l){a=k(a,k(k(b&c|~b&d,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,t,A,B,r,s,u,v;a=xh(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);r=1732584193;s=4023233417;u=2562383102;v=271733878;a=l.length;for(n=0;n<a;n+=16)q=r,t=s,A=u,B=v,r=h(r,s,u,v,l[n+
0],7,3614090360),v=h(v,r,s,u,l[n+1],12,3905402710),u=h(u,v,r,s,l[n+2],17,606105819),s=h(s,u,v,r,l[n+3],22,3250441966),r=h(r,s,u,v,l[n+4],7,4118548399),v=h(v,r,s,u,l[n+5],12,1200080426),u=h(u,v,r,s,l[n+6],17,2821735955),s=h(s,u,v,r,l[n+7],22,4249261313),r=h(r,s,u,v,l[n+8],7,1770035416),v=h(v,r,s,u,l[n+9],12,2336552879),u=h(u,v,r,s,l[n+10],17,4294925233),s=h(s,u,v,r,l[n+11],22,2304563134),r=h(r,s,u,v,l[n+12],7,1804603682),v=h(v,r,s,u,l[n+13],12,4254626195),u=h(u,v,r,s,l[n+14],17,2792965006),s=h(s,u,
v,r,l[n+15],22,1236535329),r=g(r,s,u,v,l[n+1],5,4129170786),v=g(v,r,s,u,l[n+6],9,3225465664),u=g(u,v,r,s,l[n+11],14,643717713),s=g(s,u,v,r,l[n+0],20,3921069994),r=g(r,s,u,v,l[n+5],5,3593408605),v=g(v,r,s,u,l[n+10],9,38016083),u=g(u,v,r,s,l[n+15],14,3634488961),s=g(s,u,v,r,l[n+4],20,3889429448),r=g(r,s,u,v,l[n+9],5,568446438),v=g(v,r,s,u,l[n+14],9,3275163606),u=g(u,v,r,s,l[n+3],14,4107603335),s=g(s,u,v,r,l[n+8],20,1163531501),r=g(r,s,u,v,l[n+13],5,2850285829),v=g(v,r,s,u,l[n+2],9,4243563512),u=g(u,
v,r,s,l[n+7],14,1735328473),s=g(s,u,v,r,l[n+12],20,2368359562),r=d(r,s,u,v,l[n+5],4,4294588738),v=d(v,r,s,u,l[n+8],11,2272392833),u=d(u,v,r,s,l[n+11],16,1839030562),s=d(s,u,v,r,l[n+14],23,4259657740),r=d(r,s,u,v,l[n+1],4,2763975236),v=d(v,r,s,u,l[n+4],11,1272893353),u=d(u,v,r,s,l[n+7],16,4139469664),s=d(s,u,v,r,l[n+10],23,3200236656),r=d(r,s,u,v,l[n+13],4,681279174),v=d(v,r,s,u,l[n+0],11,3936430074),u=d(u,v,r,s,l[n+3],16,3572445317),s=d(s,u,v,r,l[n+6],23,76029189),r=d(r,s,u,v,l[n+9],4,3654602809),
v=d(v,r,s,u,l[n+12],11,3873151461),u=d(u,v,r,s,l[n+15],16,530742520),s=d(s,u,v,r,l[n+2],23,3299628645),r=c(r,s,u,v,l[n+0],6,4096336452),v=c(v,r,s,u,l[n+7],10,1126891415),u=c(u,v,r,s,l[n+14],15,2878612391),s=c(s,u,v,r,l[n+5],21,4237533241),r=c(r,s,u,v,l[n+12],6,1700485571),v=c(v,r,s,u,l[n+3],10,2399980690),u=c(u,v,r,s,l[n+10],15,4293915773),s=c(s,u,v,r,l[n+1],21,2240044497),r=c(r,s,u,v,l[n+8],6,1873313359),v=c(v,r,s,u,l[n+15],10,4264355552),u=c(u,v,r,s,l[n+6],15,2734768916),s=c(s,u,v,r,l[n+13],21,
1309151649),r=c(r,s,u,v,l[n+4],6,4149444226),v=c(v,r,s,u,l[n+11],10,3174756917),u=c(u,v,r,s,l[n+2],15,718787259),s=c(s,u,v,r,l[n+9],21,3951481745),r=k(r,q),s=k(s,t),u=k(u,A),v=k(v,B);return(b(r)+b(s)+b(u)+b(v)).toLowerCase()}var Yg;
function yh(a,b){var c=S.A.Yl.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function zh(a){yh("call=api_is_valid",function(b){a(b.is_valid)})}
function Zg(a,b){yh("call=is_highscore&score="+a,function(a){0<=a.position?(Yg=a.code,b(void 0!==Yg)):b(!1)})}
TG_StatObjectFactory={uB:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},sB:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,Ah(),Ah(),!0)},rB:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===S.m.kg?function(a){return a+d}:function(a){return a-d})},tB:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===S.m.kg?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.Ic=d;this.Wg=void 0!==g?g:this.Ic;this.visible=void 0!==h?h:!0;this.ff=void 0!==k?k:this.Ic!==this.Wg;this.Sf=l;this.Vm=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return S.c.sq(1E3*a)}}};
TG_StatObject.prototype.I=function(){return new TG_StatObject(this.id,this.type,this.key,this.Ic,this.Wg,this.visible,this.ff,this.Sf,this.Vm)};S.version=S.version||{};S.version.tg="2.13.0";
var $={an:{},Iu:{},Ju:{},Ku:{},xp:{},yp:{},kA:{},gx:{},Dv:function(){$.an={lb:$.pl,update:$.ye,oc:$.we,end:$.xe,font:Be,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.Iu={lb:$.pl,update:$.ye,oc:$.we,end:$.xe,font:Ce,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.Ju={lb:$.pl,update:$.ye,oc:$.we,end:$.xe,font:De,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.Ku={lb:$.pl,update:$.ye,oc:$.we,end:$.xe,font:Ee,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,
.1])};$.xp={lb:$.ow,update:$.ye,oc:$.we,end:$.xe,wj:Fe,vj:Ge,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.yp={lb:$.pw,update:$.ye,oc:$.we,end:$.xe,wj:Fe,vj:Ge,margin:20,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.kA={lb:$.qw,update:$.ye,oc:$.we,end:$.xe,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])};$.gx={lb:$.nw,update:$.ye,oc:$.we,end:$.xe,dd:O,ed:O,bd:Q([hc,N,hc],[!1,!1,!0],[.1,.8,.1])}},Jr:function(a){function b(a){var d,g={};for(d in a)g[d]="object"===typeof a[d]&&null!==
a[d]?b(a[d]):a[d];return g}return b(a)},KC:function(a){$.an.font.n=a;$.Iu.font.n=a;$.Ju.font.n=a;$.Ku.font.n=a},JC:function(a){$.xp.wj.n=a;$.xp.vj.n=a;$.yp.wj.n=a;$.yp.vj.n=a},wi:!1,jc:[],Ez:function(a){$.wi=a},TB:function(){return $.wi},mz:function(a){var b,c;for(b=0;b<$.jc.length;b+=1)c=$.jc[b],void 0===c||void 0!==a&&c.kind!==a||0<c.Yh||($.jc[b]=void 0)},Cv:function(){$.wi=!1;$.jc=[]},yi:function(a,b,c,d){var g,h,k;void 0===d&&(d=$.wi);if(d)for(h=0;h<$.jc.length;h+=1)if(g=$.jc[h],void 0!==g&&g.sf&&
g.kind===a&&g.font===b&&g.text===c)return g.Yh+=1,h;g={kind:a,font:b,text:c,Yh:1,sf:d};h=b.align;k=b.i;G(b,"center");H(b,"middle");d=b.da(c)+2*a.margin;a=b.W(c)+2*a.margin;g.U=new w(d,a);x(g.U);b.p(c,d/2,a/2);y(g.U);G(b,h);H(b,k);for(h=0;h<$.jc.length;h+=1)if(void 0===$.jc[h])return $.jc[h]=g,h;$.jc.push(g);return $.jc.length-1},Bv:function(a){var b=$.jc[a];b.Yh-=1;0>=b.Yh&&!b.sf&&($.jc[a]=void 0)},pl:function(a){a.buffer=$.yi(a.kind,a.kind.font,a.value,a.sf)},ow:function(a){var b=a.value.toString();
a.buffer=0<=a.value?$.yi(a.kind,a.kind.wj,b,a.sf):$.yi(a.kind,a.kind.vj,b,a.sf)},pw:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?$.yi(a.kind,a.kind.wj,b,a.sf):$.yi(a.kind,a.kind.vj,b,a.sf)},qw:function(a){a.U=a.value},nw:function(a){a.e=a.value;a.Lb=0},ye:function(a){a.x=void 0!==a.kind.dd?a.kind.dd(a.time,a.nd,a.Jc-a.nd,a.duration):a.nd+a.time/a.duration*(a.Jc-a.nd);a.y=void 0!==a.kind.ed?a.kind.ed(a.time,a.od,a.qc-a.od,a.duration):a.od+a.time/a.duration*(a.qc-a.od);
void 0!==a.kind.yl&&(a.Ib=a.kind.yl(a.time,0,1,a.duration));void 0!==a.kind.zl&&(a.Jb=a.kind.zl(a.time,0,1,a.duration));void 0!==a.kind.bd&&(a.alpha=a.kind.bd(a.time,0,1,a.duration));void 0!==a.kind.ww&&(a.Z=a.kind.ww(a.time,0,360,a.duration)%360);void 0!==a.e&&(a.Lb=a.time*a.e.G/a.duration)},we:function(a){var b=m.context,c;void 0!==a.e&&null!==a.images?1===a.Ib&&1===a.Jb&&0===a.Z?a.e.pc(Math.floor(a.Lb),a.x,a.y,a.alpha):a.e.$(Math.floor(a.Lb),a.x,a.y,a.Ib,a.Jb,a.Z,a.alpha):(c=void 0!==a.U&&null!==
a.U?a.U:$.jc[a.buffer].U,1===a.Ib&&1===a.Jb&&0===a.Z?c.pc(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Ib)||1E-4>Math.abs(a.Jb)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.Z*Math.PI/180),b.scale(a.Ib,a.Jb),c.pc(-c.width/2,-c.height/2,a.alpha),b.restore()))},xe:function(a){void 0!==a.buffer&&$.Bv(a.buffer)},Xd:function(a){var b,c,d=!1;for(b=0;b<$.Ab.length;b+=1)c=$.Ab[b],void 0!==c&&(0<c.za?(c.za-=a,0>c.za&&(c.time+=-c.za,c.za=0)):c.time+=a,0<c.za||(c.time>=c.duration?(c.kind.end(c),$.Ab[b]=
void 0):c.kind.update(c),d=!0));d&&($.canvas.T=!0)},qa:function(){var a,b;for(a=0;a<$.Ab.length;a+=1)b=$.Ab[a],void 0!==b&&(0<b.za||b.kind.oc(b))},Ab:[],mx:function(a,b,c){$.bs();void 0===a&&(a=S.mf);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);$.visible=!0;$.h=!0;S.c.Ga($,a);$.depth=b;L($);Sb($,c);$.Cv();$.Dv()},dr:function(a,b,c,d,g,h,k,l,n){void 0===l&&(l=void 0!==a.za?a.za:0);void 0===n&&(n=$.wi);void 0===g&&void 0!==a.py&&(g=c+a.py);void 0===h&&void 0!==a.qy&&(h=d+a.qy);void 0===k&&void 0!==
a.duration&&(k=a.duration);a={kind:a,value:b,nd:c,od:d,Jc:g,qc:h,x:c,y:d,Ib:1,Jb:1,alpha:1,Z:0,time:0,duration:k,za:l,sf:n};a.kind.lb(a);for(b=0;b<$.Ab.length;b+=1)if(void 0===$.Ab[b])return $.Ab[b]=a,b;$.Ab.push(a);return $.Ab.length-1},EC:function(a){var b;0>a||a>=$.Ab.length||(b=$.Ab[a],void 0!==b&&(b.kind.end(b),$.Ab[a]=void 0))},lz:function(){var a,b;for(a=0;a<$.Ab.length;a+=1)b=$.Ab[a],void 0!==b&&(b.kind.end(b),$.Ab[a]=void 0);$.Ab=[]},bs:function(){$.lz();$.mz();M(K,$)}};
function Bh(a,b,c,d){this.top=a;this.left=b;this.bottom=c;this.right=d}function Ch(a){this.depth=-99;S.c.Ga(this,S.jb);this.h=!0;this.visible=!1;this.b=a;L(this)}Ch.prototype.Ej=function(){};Ch.prototype.pf=function(){};Ch.prototype.cb=function(a,b,c){a:{var d=this.b,g;for(g=0;g<d.kc.length;++g)if(d.kc[g].cb&&d.kc[g].cb(a,b,c)){a=!0;break a}a=!1}return a};
Ch.prototype.Db=function(a,b,c){var d;a:if(d=this.b,d.fb&&a===d.Dq)a=d.fb.a.x,b=d.fb.a.y,d.fb.Cp&&(a=d.fb.Cp.x,b=d.fb.Cp.y),GameUISettingsOffsets?console.log("Component:\n x: tgScale("+(a+d.fb.ih.x-GameUISettingsOffsets.VA)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.fb.ih.y-GameUISettingsOffsets.WA)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.fb.ih.x)+"),\n y: tgScale("+(b+d.fb.ih.y)+"),"),d.ev=!1,d=!0;else{for(var g=0;g<d.kc.length;++g)if(d.kc[g].Db&&d.kc[g].Db(a,
b,c)){d=!0;break a}d=!1}return d};function Dh(){this.Ea=this.depth=0;this.eo=this.Qb=this.h=this.visible=!1;this.kc=[];this.Dl={};this.Dl.Ne=!1;this.ds={};this.paused=this.ds.Ne=!1;this.he=new w(0,0);this.uu=this.tu=0;this.fb=null;this.Dq=this.gv=this.fv=-1;this.ev=!1;this.Gb=this.Fb=0;this.cm=null}e=Dh.prototype;e.cc=function(){this.cm=new Ch(this)};e.kb=function(){this.cm&&(M(K,this.cm),this.cm=null)};
function Eh(a,b,c){for(var d in b){var g=b[d];g.e?c[d]=new Fh(a,g):g.Nu?c[d]=new Gh(a,S.j.q(g.Nu,"<"+g.Nu+">"),g):g.L?c[d]=new Gh(a,S.j.q(g.L,"<"+g.L+">"),g):g.text&&(c[d]=new Gh(a,g.text,g))}}
e.Er=function(a){a||(a=new Bh(Number.MAX_VALUE,Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE));a.left=Number.MAX_VALUE;a.top=Number.MAX_VALUE;a.right=-Number.MAX_VALUE;a.bottom=-Number.MAX_VALUE;for(var b=0;b<this.kc.length;++b){var c=this.kc[b];c.x<a.left&&(a.left=c.x);c.y<a.top&&(a.top=c.y);var d=c.x+c.width,c=c.y+c.height;d>a.right&&(a.right=d);c>a.bottom&&(a.bottom=c)}return a};
e.Ef=function(a){if(this.paused!==a&&(this.paused=a)){a=this.Er();var b=a.right-a.left,c=a.bottom-a.top;!this.he||this.he.width===b&&this.he.height===c||(this.he=null);this.he||(this.he=new w(b,c));x(this.he);this.he.clear();this.oj(-a.left,-a.top);y(this.he);this.tu=a.left;this.uu=a.top}};function Hh(a,b){a.Ne&&(a.k+=b,a.k>=a.duration&&(a.Ne=!1,a.Yb&&a.Yb()))}
e.V=function(a){Hh(this.Dl,a);Hh(this.ds,a);for(var b=0;b<this.kc.length;++b)this.kc[b].V(a);if(this.fb&&this.ev){a=K.ma[this.Dq].x;b=K.ma[this.Dq].y;this.canvas===S.c.xg(S.zj)&&this.fb.Sl(this.Fb+S.wg,this.Gb+S.nf);var c=a-this.fv,d=b-this.gv;this.fb.x+=c;this.fb.y+=d;this.fb.ih.x+=c;this.fb.ih.y+=d;this.fv=a;this.gv=b;this.Qb=!0}};e.Xd=function(){if(this.Qb){var a=S.c.xg(S.zj);this.canvas!==a?this.canvas.T=this.Qb:(m.Kb(a),this.qa())}};
e.oj=function(a,b){for(var c=S.c.xg(S.zj)===this.canvas,d=0;d<this.kc.length;++d){var g=this.kc[d];g.visible&&(c&&g.Sl(a,b),g.qa(a,b))}};e.qa=function(){var a=0,b=0;S.c.xg(S.Pl)!==this.canvas&&(a=S.wg,b=S.nf);this.paused?this.he.p(this.tu+this.Fb+a,this.uu+this.Gb+b):this.oj(this.Fb+a,this.Gb+b);this.Qb=!1};function Ih(){this.Xl=[];this.oo=[];this.Pm=null;this.Hn=void 0;this.uo=!0}
function Jh(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.zB){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof Ih){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new Ih,g.Xl=arguments[0],g.oo=arguments[1],g.Pm=arguments[2];var h=null,k=null,l=null,h=g.Xl,k=g.oo,l=g.Pm;this.$h=g;void 0===this.$h.Hn&&(this.$h.Hn=!qg(S.b));Dh.apply(this,arguments);L(this);this.h=this.visible=!0;k=k||[];h=h||[];this.Qu=2;this.dl=this.Gz=!1;this.r=l||Kh;this.Rr=S.Pl;void 0!==this.r.Ea&&(this.Rr=this.r.Ea);S.c.Ga(this,this.Rr);this.Ek=this.Dk=0;this.r.background.hx&&(this.Dk=this.r.background.hx);this.r.background.ix&&(this.Ek=this.r.background.ix);this.r.background.elements||
(this.Bc=this.r.background.e);this.r.background.aB?(Eh(this,this.r.background.elements,{}),this.Bc=this.r.background.e):(g=this.r.background.e,l=new Dh,Eh(l,this.r.background.elements,[]),g||this.Ea!==S.zj?(this.Bc=new w(g.width,g.height),x(this.Bc),g.p(0,0,0),l.oj(-this.Dk,-this.Ek),y(this.Bc)):(m.Kb(S.c.xg(this.Ea)),l.qa()));var n=this;this.Ns=0;b("score",this.r.Qt)?(this.Df=new Lh(this,this.r.Qt,"SCORE",0,!0),this.r.tz&&new Fh(this,this.r.tz)):this.Df=new Mh(0,0);this.Jj=b("highScore",this.r.Ds)?
new Lh(this,this.r.Ds,"HIGHSCORE",0,!1):new Mh(0,0);b("highScore",this.r.Gs)&&new Fh(this,this.r.Gs);this.Hf=b(["stage","level"],this.r.Qc)?new Lh(this,this.r.Qc,"STAGE",0,!1):new Mh(0,0);b("lives",this.r.it)&&new Lh(this,this.r.it,"LIVES",0,!1);this.en=b("time",this.r.time)?new Lh(this,this.r.time,"TIME",0,!1,function(a){return n.sq(a)}):new Mh(0,0);this.en.Ff(36E4);if(this.r.pb&&this.r.Kp)throw"Don't define both progress and progressFill in your game_ui settings";this.ak=b("progress",this.r.pb)?
this.r.pb.round?new Nh(this,this.r.pb):new Oh(this,this.r.pb):b("progress",this.r.Kp)?new Oh(this,this.r.Kp):new Mh(0,0);b("lives",this.r.Cs)&&new Fh(this,this.r.Cs);b("difficulty",this.r.bo)?new Gh(this,Ph().toUpperCase(),this.r.bo):Ph();b("difficulty",this.r.mj)&&(g=s_ui_smiley_medium,g=(this.r.mj.images?this.r.mj.images:[s_ui_smiley_easy,s_ui_smiley_medium,s_ui_smiley_hard])[sg()],this.r.mj.e||(this.r.mj.e=g),this.sw=new Fh(this,this.r.mj),this.sw.Xt(g));this.r.rf&&!this.r.rf.length&&(this.r.rf=
[this.r.rf]);this.r.$d&&!this.r.$d.length&&(this.r.$d=[this.r.$d]);this.Rs=[];this.Ss=[];this.Rs[0]=b(["item","item0"],this.r.rf)?new Fh(this,this.r.rf[0]):new Mh(0,"");this.Ss[0]=b(["item","item0"],this.r.$d)?new Gh(this,"",this.r.$d[0]):new Mh(0,"");if(this.r.rf&&this.r.$d)for(g=1;g<this.r.$d.length;++g)b("item"+g,this.r.$d[g])&&(this.Ss[g]=new Gh(this,"0 / 0",this.r.$d[g]),this.Rs[g]=new Fh(this,this.r.rf[g]));for(var q in this.r)g=this.r[q],g.L&&new Gh(this,S.j.q(g.L,"<"+g.L+">")+(g.separator?
g.separator:""),g);this.gt=this.Ru=0;this.buttons={};for(q in this.r.buttons)g=Qh(this,this.r.buttons[q]),this.buttons[q]=g;this.r.Ty&&(g=Qh(this,this.r.Ty),this.buttons.pauseButton=g);this.$n={};for(q in this.r.$n)g=this.r.$n[q],g=new Rh[g.oB](this,g),this.$n[q]=g;this.Gb=this.Fb=0}Wf(Dh,Jh);var Rh={};function Qh(a,b){var c=new Sh(a,b,b.aa);a.kc.push(c);c.RB=b;return c}e=Jh.prototype;e.$p=function(a,b){this.buttons[b||"pauseButton"].$p(a)};
e.sq=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.Gz?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};e.ai=function(a){this.ak.ai(a);return this};e.yg=function(){return this.ak.yg()};e.setTime=function(a){this.en.Ff(a);return this};e.getTime=function(){return this.en.J()};function Th(a,b){a.Df.Ff(b);a.$h.Hn&&(a.Jj.J()<b?a.Jj.Ff(b):b<a.Jj.J()&&a.Jj.Ff(Math.max(b,a.Ns)))}function Uh(a,b){a.Jj.Ff(b);a.Ns=b}function Vh(a,b){a.Hf.Ff(b);1<b&&a.ak&&a.ak.Fj&&a.ak.Fj(b)}
function Wh(a){var b=1;"undefined"===typeof b&&(b=1);Vh(a,a.Hf.J()+b)}e.Er=function(a){a||(a=new Bh(0,0,0,0));a.left=0;a.top=0;a.right=this.Bc.width;a.bottom=this.Bc.height;return a};e.kb=function(){Dh.prototype.kb.apply(this,arguments);m.Kb(this.canvas);m.clear();for(var a in this.buttons)M(K,this.buttons[a])};
e.V=function(a){1===this.Qu&&this.setTime(this.getTime()+a);if(2===this.Qu){if(this.Ru&&1E3*this.Ru>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.en,b.Lc.k=0,b.Lc.kq=!0,b.font.setFillColor(b.Lc.color),b.Bf(),"undefined"!==typeof a_gameui_timewarning_second&&I.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}Dh.prototype.V.apply(this,arguments);this.gt+=a};
e.oj=function(a,b){this.Bc&&(this.Bc instanceof p?this.Bc.pc(0,a+this.Dk,b+this.Ek,1):this.Bc.pc(a+this.Dk,b+this.Ek,1));Dh.prototype.oj.apply(this,arguments);this.eo&&this.Bc&&xa(a,b,this.Bc.width,this.Bc.height,"blue",!0)};
function Xh(a,b,c,d,g,h){this.b=a;this.width=g;this.height=h;this.U=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.O={};this.O.Fb=0;this.O.Gb=0;this.O.scale=this.scale;this.O.alpha=this.alpha;this.O.Z=0;this.C={};this.C.Ne=!1;this.C.origin={};this.C.target={};this.C.k=0;this.a.Dl&&(Yh(this,this.a.Dl),this.C.Ne=!1);this.b.kc.push(this);Zh||(Zh={lb:function(a){a.value instanceof w?a.U=a.value:(a.e=a.value,a.Lb=0)},update:$.ye,
oc:$.we,end:$.xe,dd:O,ed:O,bd:function(a,b,c,d){return 1-hc(a,b,c,d)},yl:function(a,b,c,d){return 1*hc(a,b,c,d)+1},zl:function(a,b,c,d){return 1*hc(a,b,c,d)+1}})}var Zh;
function Yh(a,b){a.C.origin.x=void 0===b.x?a.x:b.x;a.C.origin.y=void 0===b.y?a.y:b.y;a.C.origin.alpha=void 0!==b.alpha?b.alpha:1;a.C.origin.scale=void 0!==b.scale?b.scale:1;a.C.target.x=a.x;a.C.target.y=a.y;a.C.target.alpha=a.alpha;a.C.target.scale=a.scale;a.C.duration=b.duration;a.C.Ne=!0;a.C.cd=b.cd||hc;a.C.k=0;a.C.za=b.za||0;$h(a)}
function $h(a){a.C.k>=a.C.duration&&(a.C.k=a.C.duration,a.C.Ne=!1);var b=a.C.cd(a.C.k,a.C.origin.x,a.C.target.x-a.C.origin.x,a.C.duration),c=a.C.cd(a.C.k,a.C.origin.y,a.C.target.y-a.C.origin.y,a.C.duration);a.O.Fb=b-a.x;a.O.Gb=c-a.y;a.O.alpha=a.C.cd(a.C.k,a.C.origin.alpha,a.C.target.alpha-a.C.origin.alpha,a.C.duration);a.O.scale=a.C.cd(a.C.k,a.C.origin.scale,a.C.target.scale-a.C.origin.scale,a.C.duration);a.b.Qb=!0}e=Xh.prototype;
e.qa=function(a,b){this.U&&this.U.$(this.x+this.O.Fb+a,this.y+this.O.Gb+b,this.O.scale,this.O.scale,0,this.O.alpha)};e.Sl=function(a,b){ai(this.x+this.O.Fb+a,this.y+this.O.Gb+b,this.width*this.O.scale,this.height*this.O.scale)};e.em=function(a,b){return a>this.x+this.O.Fb&&a<this.x+this.O.Fb+this.width*this.O.scale&&b>this.y+this.O.Gb&&b<this.y+this.O.Gb+this.height*this.O.scale};e.$t=function(a){this.visible!==a&&(this.visible=a,this.b.Qb=!0)};
e.V=function(a){this.C.Ne&&(0<this.C.za?this.C.za-=a:(this.C.k+=-this.C.za,this.C.za=0,this.C.k+=a,$h(this)))};function Mh(a,b){this.pb=this.value=this.bm=b}e=Mh.prototype;e.Ff=function(a){this.value=a};e.J=function(){return this.value};e.ai=function(a){0>a&&(a=0);100<a&&(a=100);this.pb=a};e.yg=function(){return this.pb};e.Xt=function(){};
function Fh(a,b){this.Cp=b;this.a={};for(var c in b)this.a[c]=b[c];this.e=this.a.e;this.G=0;this.hg=this.a.hg;this.a.VC&&(this.a.x+=this.e.Nb,this.a.y+=this.e.Ob);Xh.call(this,a,this.a,this.a.x,this.a.y,this.e?this.e.width:1,this.e?this.e.height:1)}Wf(Xh,Fh);Rh.GameUIImage=Fh;function bi(a,b){a.G!==b&&(a.G=b,a.b.Qb=!0)}e=Fh.prototype;
e.qa=function(a,b){this.e&&(this.hg&&(a+=-Math.floor(this.e.width/2),b+=-Math.floor(this.e.height/2)),this.e instanceof p?this.e.$(this.G,this.x+a+this.O.Fb,this.y+b+this.O.Gb,this.O.scale,this.O.scale,0,this.O.alpha):this.e.$(this.x+a+this.O.Fb,this.y+b+this.O.Gb,this.O.scale,this.O.scale,0,this.O.alpha),this.b.eo&&xa(this.x+a-this.e.Nb+1,this.y+b-this.e.Ob+1,this.e.width-2,this.e.height-2,"black",!0))};
e.em=function(a,b){if(!this.e)return!1;var c=0,d=0;this.hg&&(c+=-Math.floor(this.e.width/2),d+=-Math.floor(this.e.height/2));c-=this.e.Nb;d-=this.e.Ob;return a>c+this.x+this.O.Fb&&a<c+this.x+this.O.Fb+this.width*this.O.scale&&b>d+this.y+this.O.Gb&&b<d+this.y+this.O.Gb+this.height*this.O.scale};e.Sl=function(a,b){this.e&&(this.hg&&(a+=-Math.floor(this.e.width/2),b+=-Math.floor(this.e.height/2)),a-=this.e.Nb,b-=this.e.Ob,ai(this.x+this.O.Fb+a,this.y+this.O.Gb+b,this.width*this.O.scale,this.height*this.O.scale))};
e.Jo=function(a){a||(a=new f(0,0));a.x=this.x+S.wg+this.b.Fb;a.y=this.y+S.nf+this.b.Gb;return a};e.Xt=function(a){a!==this.e&&(this.e=a,this.b.Qb=!0,this.e&&(this.width=this.e.width,this.height=this.e.height))};
function Gh(a,b,c){"object"===typeof b&&(c=b,b=c.L?S.j.q(c.L,"<"+c.L+">"):c.text||"");this.text=b;this.font=c.font.I();c.Fh&&C(this.font,c.Fh);this.Jt=c.x;this.Kt=c.y;this.It=c.hc;this.My=this.font.fillColor;this.Of=void 0===c.Of?.2:c.Of;Xh.call(this,a,c,Math.floor(c.x-.1*c.hc),Math.floor(c.y-.1*c.sc),Math.floor(1.2*c.hc),Math.floor(1.2*c.sc));this.U=new w(this.width,this.height);switch(this.font.align){case "left":this.bh=Math.floor(.1*c.hc);break;case "right":this.bh=Math.floor(1.1*c.hc);break;
case "center":this.bh=Math.floor(.6*c.hc);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.Of*this.font.fontSize);switch(this.font.i){case "top":this.dh=Math.floor(.1*c.sc);break;case "bottom":this.dh=Math.floor(1.1*c.sc)+a;break;case "middle":this.dh=Math.floor(.6*c.sc)+a;break;default:throw"Unknown baseline: "+this.font.i;}this.Lc={};this.Lc.color="red";this.Lc.duration=200;this.Lc.k=0;this.Lc.kq=!1;this.Bf()}Wf(Xh,Gh);Rh.GameUIText=Gh;
Gh.prototype.V=function(a){Xh.prototype.V.apply(this,arguments);this.Lc.kq&&(this.Lc.k+=a,this.Lc.duration<=this.Lc.k&&(this.Lc.kq=!1,this.font.setFillColor(this.My),this.Bf()))};
Gh.prototype.Bf=function(){this.U.clear();x(this.U);var a=this.font.da(this.text),b=1;a>this.It&&(b=this.It/a);this.font.$(this.text,this.bh,this.dh,b,b,0,1);this.b.eo&&(xa(0,0,this.U.width,this.U.height,"black",!0),xa(this.Jt-this.x,this.Kt-this.y,this.U.width-2*(this.Jt-this.x),this.U.height-2*(this.Kt-this.y),"red",!0),ya(this.bh-5,this.dh,this.bh+5,this.dh),ya(this.bh,this.dh-5,this.bh,this.dh+5));this.b.Qb=!0;y(this.U)};function ci(a){return""+a}function di(a,b,c){return b+c}
function Lh(a,b,c,d,g,h){this.value=this.bm=d||0;this.mn=-1;this.jv=c;this.a=b;this.iv=-99999;this.dn=b.dn||0;this.Hl=b.Hl?b.Hl:h||ci;c=di;g&&0!==this.a.Xr&&(c=ic);this.Ba=new Xf(this.bm,void 0===this.a.Xr?500:this.a.Xr,c);b.Ch&&(this.Ch="game_ui_"+b.Ch);this.text=ei(this)+this.Hl(this.bm);Gh.call(this,a,this.text,b)}Wf(Gh,Lh);Rh.GameUIValue=Lh;Lh.prototype.Ff=function(a){this.value=a;Zf(this.Ba,this.value)};Lh.prototype.J=function(){return this.value};
Lh.prototype.Bq=function(a){var b=this.mn;if(a||K.Ol-this.iv>this.dn)b=this.Hl(Math.floor(this.Ba.J()));this.mn!==b&&(this.iv=K.Ol,this.mn=b,this.text=ei(this)+b,this.Bf())};Lh.prototype.V=function(a){Gh.prototype.V.apply(this,arguments);Yf(this.Ba,a);Math.floor(this.Ba.J())!==this.mn&&this.Bq()};function ei(a){var b="";a.a.ln&&(b=a.Ch?S.j.q(a.Ch,"<"+a.Ch.toUpperCase()+">"):S.j.q("game_ui_"+a.jv,"<"+a.jv+">"));return b+(a.a.separator?a.a.separator:"")}
function Oh(a,b){this.fg=this.pb=0;this.a=b;this.$j=this.Pg=0;this.e=b.e;this.se=b.se||b.e;this.Wo=b.Wo||null;this.a.Mg=this.a.Mg||0;this.a.Rh=this.a.Rh||0;this.Gn=!0;this.Hm=b.Hm||0;this.M=[];this.dl=!1;this.Ba=new Xf(0,200,P);this.mc=new Xf(0,200,P);Xh.call(this,a,b,b.x,b.y,this.e.width,this.e.height)}Wf(Xh,Oh);Rh.GameUIProgress=Oh;Oh.prototype.ai=function(a){0>a&&(a=0);100<a&&(a=100);this.dl?(this.fg=a-this.pb,Zf(this.mc,this.fg)):(Zf(this.Ba,a),this.pb=a)};Oh.prototype.yg=function(){return this.pb};
Oh.prototype.V=function(a){Yf(this.Ba,a);var b=this.Ba.J();b!==this.Pg&&(this.b.Qb=!0,this.Pg=b);Yf(this.mc,a);a=this.mc.J();a!==this.$j&&(this.b.Qb=!0,this.$j=a);b+=a;if(this.Gn)for(a=0;a<this.M.length;++a){var c=b>=this.M[a].position&&this.pb+this.fg>=this.M[a].position;this.M[a].complete!==c&&(this.a.M&&(this.b.Qb=!0,this.Pg=b),this.M[a].complete=c)}};
Oh.prototype.qa=function(a,b){var c,d,g;if(0===this.Hm&&(0<this.mc.J()&&this.se.xa(0,this.width*this.Ba.J()/100,0,this.se.width*this.mc.J()/100,this.se.height,a+this.x+this.width*this.Ba.J()/100,b+this.y),this.e.xa(0,0,0,this.width*this.Ba.J()/100,this.height,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.width/100*d.position,b+this.y+this.a.M.y);if(1===this.Hm&&(0<this.mc.J()&&this.se.xa(0,0,this.height-
this.height*this.Ba.J()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ba.J()/100)),this.e.xa(0,0,this.height-this.height*this.Ba.J()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ba.J()/100)),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.a.M.x,b+this.y+this.height-this.height/100*d.position);if(2===this.Hm&&(0<this.mc.J()&&this.se.xa(0,0,this.height*this.Ba.J()/
100,this.se.width,this.se.height*this.mc.J()/100,a+this.x+this.width*this.Ba.J()/100,b+this.y),this.e.xa(0,0,0,this.width,this.height*this.Ba.J()/100,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.a.M.x,b+this.y+this.height/100*d.position);this.Wo&&this.Wo.p(0,a+this.x+this.a.Mg,b+this.y+this.a.Rh)};function Sh(a,b,c){this.hn=!1;this.qk=-1;this.b=a;this.a=b;this.h=!0;this.$p(c);Fh.call(this,a,b)}
Wf(Fh,Sh);Rh.GameUIButton=Sh;Sh.prototype.$p=function(a){var b=null,c=null,d=this.b,g=this.a;void 0===a&&(a=g.aa?g.aa:0);switch(a){case 0:b=d.$h.uo?Rd:Td;c=function(){qg(S.b)?S.b.Oe(!1,!0,d.$h.uo):S.b.Oe();return!0};break;case 1:b=Ud;c=function(){S.b.Oe();return!0};break;case 2:b=s_btn_small_quit;c=function(){fi(d.$h.uo);return!0};break;case 3:b=g.e}this.Yb=c;this.a.e=b};Sh.prototype.cb=function(a,b,c){if(this.h)return this.em(b-S.wg,c-S.nf)?(this.hn=!0,this.qk=a,bi(this,1),!0):!1};
Sh.prototype.V=function(a){Fh.prototype.V.apply(this,arguments);this.hn&&(this.em(K.ma[this.qk].x-S.wg,K.ma[this.qk].y-S.nf)?bi(this,1):bi(this,0))};Sh.prototype.Db=function(a,b,c){return this.hn&&a===this.qk?(bi(this,0),this.em(b-S.wg,c-S.nf)&&this.Yb&&this.Yb(),this.hn=!1,this.qk=-1,!0):!1};
function Nh(a,b){this.fg=this.pb=0;this.a=b;this.$j=this.Pg=0;this.Gn=!0;this.M=[];this.color=b.color||"#00AEEF";this.xr=b.xr||"#FF0F64";this.tr=b.tr||"#FFED93";this.ur=void 0===b.blink||b.blink;this.Pc=b.Pc;this.rh=this.dl=!1;this.cg=0;this.al=1E3;this.bl=0;this.Ba=new Xf(0,200,P);this.mc=new Xf(0,200,P);Xh.call(this,a,b,b.x,b.y,1,1)}Wf(Xh,Nh);Rh.GameUIRoundProgress=Nh;function gi(a){a.ur&&(a.rh?a.cg-=a.al:(a.rh=!0,a.cg=0,a.bl=0,Zf(a.Ba,100)))}e=Nh.prototype;
e.ai=function(a){0>a&&(a=0);100<a&&(a=100);this.dl?(this.fg=a-this.pb,Zf(this.mc,this.fg)):(this.rh||(100===a&&this.ur?gi(this):Zf(this.Ba,a)),this.pb=a)};e.yg=function(){return this.pb};e.Fj=function(){gi(this)};
e.V=function(a){Yf(this.Ba,a);var b=this.Ba.J();b!==this.Pg&&(this.b.Qb=!0,this.Pg=b);Yf(this.mc,a);var c=this.mc.J();c!==this.$j&&(this.b.Qb=!0,this.$j=c);this.rh&&(this.cg+=a,this.cg>=this.al?100===this.pb?(this.rh=!1,gi(this)):(this.rh=!1,this.bl=0,this.Ba.Gh=0,this.Ba.fn=0,Zf(this.Ba,this.pb)):this.bl=(-Math.cos(this.cg/this.al*5*Math.PI*2)+1)/2,this.b.Qb=!0);b+=c;if(this.Gn)for(a=0;a<this.M.length;++a)c=b>=this.M[a].position&&this.pb+this.fg>=this.M[a].position,this.M[a].complete!==c&&(this.a.M&&
(this.b.Qb=!0,this.Pg=b),this.M[a].complete=c)};e.Sl=function(a,b){this.Pc&&ai(this.x+this.O.Fb+a-this.Pc.Nb,this.y+this.O.Gb+b-this.Pc.Ob,this.Pc.width*this.O.scale,this.Pc.height*this.O.scale)};
e.qa=function(a,b){var c,d;if(this.Pc){d=this.Ba.J()/100;d=Math.max(d,0);d=Math.min(d,1);var g=m.context,h=this.Pc.width/2-T(4),k=g.fillStyle;if(0<this.mc.J()){var l=this.mc.J()/100;g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.xr;g.fill()}g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.al&&(l=g.globalAlpha,g.globalAlpha*=
this.bl,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.tr,g.fill(),g.globalAlpha=l);if(this.a.M){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=T(2);for(d=0;d<this.M.length;++d){c=this.M[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+this.y+c));g.stroke()}g.strokeStyle=
l;g.lineWidth=n}this.Pc.p(0,a+this.x,b+this.y);if(this.a.M)for(d=0;d<this.M.length;++d)c=this.M[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.p(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.M.jz*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.M.jz*.5));g.fillStyle=k}};S.version=S.version||{};S.version.game_ui="2.1.0";
var hi=hi||{},ii={background:{e:md},Kp:{e:ld,se:nd,x:T(116),y:T(90)},buttons:{pauseButton:{x:T(530),y:T(12),aa:0}},Qt:{x:T(120),y:T(12),hc:T(400),sc:T(46),Of:.2,dn:50,ln:!1,separator:"",font:Je,Fh:{fillColor:"#172348",fontSize:T(42)}},Qc:{x:T(18),y:T(18),hc:T(86),sc:T(50),Of:.2,ln:!0,separator:"\n",Ch:"STAGE",font:Ie,Fh:{fillColor:"#799EC5"}},Ds:{x:T(254),y:T(64),hc:T(270),sc:T(20),Of:.2,dn:50,ln:!0,separator:": ",font:He,Fh:{fillColor:"#5E83B0",fontSize:T(16),align:"left",i:"bottom"}},Gs:{x:T(232),
y:T(74),e:pd,hg:!0},Cs:{x:T(36),y:T(86),e:od,hg:!0},it:{x:T(56),y:T(76),hc:T(50),sc:T(24),Of:.2,ln:!1,separator:"x ",font:Ie,Fh:{align:"left",i:"middle",fillColor:"#5782AE"}},rf:{x:T(36),y:T(86),e:null,hg:!0},$d:{x:T(56),y:T(76),hc:T(50),sc:T(24),Of:.2,font:Ie,Fh:{align:"left",i:"middle",fillColor:"#5782AE"}}},Kh=ii;function ji(){return function(a,b,c,d){return 4*jc(a,b,c,d)}}function ki(a){this.depth=0;this.visible=this.h=!1;S.c.Ga(this,S.mf);this.cd=Q([lc,kc],[!1,!0],[.2,.6]);a||L(this)}var li;
function mi(a,b){var c=li;c.duration=a||140;c.k=0;c.h=!0;c.visible=!0;c.nx=b||.5}ki.prototype.V=function(a){this.k+=a;this.k>=this.duration?this.visible=this.h=!1:this.canvas.T=!0};ki.prototype.qa=function(){var a=m.context.globalAlpha;m.context.globalAlpha=this.cd(this.k,0,this.nx,this.duration);xa(0,0,this.canvas.width,this.canvas.height,"#FFFFFF",!1);m.context.globalAlpha=a};function ni(a,b,c,d,g){this.$e(a,b,c,d,g)}function oi(a,b,c){a.Vc=b;a.pd=.5;a.Gc=c;a.kz=a.Vc+a.pd+a.Gc}
ni.prototype.$e=function(a,b,c,d,g,h){this.depth=100;this.h=this.visible=!0;this.group="gameObject";this.x=c;this.y=d;this.U=null;this.state=0;this.alpha=1;this.font=b.I();this.eb=0;this.text=a;this.yb=g;pi(this,h);this.duration=500;oi(this,.25,.06);this.yb&&I.play(this.yb);this.Jb=this.Ib=1;S.c.Ga(this,S.mf);L(this);Sb(this,"game")};var qi={};
function pi(a,b){qi.hasOwnProperty(a.font.n)||(qi[a.font.n]={});var c=""+a.font.fontSize;qi[a.font.n].hasOwnProperty(c)||(qi[a.font.n][c]={});qi[a.font.n][c].hasOwnProperty(a.font.fillColor)||(qi[a.font.n][c][a.font.fillColor]={});qi[a.font.n][c][a.font.fillColor].hasOwnProperty(a.font.strokeColor)||(qi[a.font.n][c][a.font.fillColor][a.font.strokeColor]={});if(qi[a.font.n][c][a.font.fillColor][a.font.strokeColor].hasOwnProperty(a.text))a.U=qi[a.font.n][c][a.font.fillColor][a.font.strokeColor][a.text];
else{a.U=new w(Math.floor(1.2*a.font.da(a.text)),Math.floor(1.2*a.font.W(a.text))+T(10));b||(qi[a.font.n][c][a.font.fillColor][a.font.strokeColor][a.text]=a.U);c=a.U;x(c);try{H(a.font,"middle"),G(a.font,"center"),a.font.p(a.text,c.width/2,c.height/2)}finally{y(c)}}}e=ni.prototype;e.Ef=function(a){this.h=!a};e.kb=function(){this.canvas.T=!0};e.V=function(a){this.eb+=a;this.eb>this.duration&&M(K,this);this.canvas.T=!0;this.Gk(a)};e.Gk=function(){};
e.qa=function(){this.U.$(this.x-this.U.width*this.Ib/2,this.y-this.U.height*this.Jb/2,this.Ib,this.Jb,0,this.alpha)};function ri(a,b,c,d,g,h){this.$e(a,b,c,d,g,h);this.duration=500;oi(this,.25,.06);a=Q([mc,N,ji()],[!1,!1,!1],[this.Vc,this.pd,this.Gc]);this.Ed=new Xf(0,this.duration,a);Zf(this.Ed,2);a=Q([mc,N,hc],[!1,!1,!0],[this.Vc,this.pd,this.Gc]);this.Fd=new Xf(0,this.duration,a);Zf(this.Fd,1)}Wf(ni,ri);
ri.prototype.Gk=function(a){Yf(this.Ed,a);Yf(this.Fd,a);this.Ib=this.Ed.J();this.Jb=this.Fd.J();this.eb>this.duration*(1-this.Gc/this.kz)&&(this.font.setFillColor("white"),this.font.setStrokeColor("white"),pi(this))};
function si(a,b,c,d,g,h,k,l,n){this.$e(a,b,S.$b+S.Ql/2,S.ac+S.vg/2+(n||0),g,l);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Oa(this.font);a.color="white";Na(this.font,a);this.depth=-20;this.duration=2E3;oi(this,.1,.3);k=k?jc:mc;a=Q([k,N],[!1,!1],[this.Vc,this.pd+this.Gc]);this.Ed=new Xf(0,this.duration,a);Zf(this.Ed,1);k=Q([k,N],[!1,!1],[this.Vc,this.pd+this.Gc]);this.Fd=new Xf(0,this.duration,k);Zf(this.Fd,1);k=Q([N,jc],[!1,!1,!0],[this.Vc+this.pd,this.Gc]);this.ag=new Xf(1,
this.duration,k);Zf(this.ag,0);k=Q([N,lc],[!1,!1],[this.Vc+this.pd,this.Gc]);this.Og=new Xf(this.y,this.duration,k);Zf(this.Og,this.y);var q=Q([N,jc],[!1,!1,!0],[this.Vc+this.pd-.2,this.Gc+.2]),t=this;h=h||.75;new ti(c,t.duration,ui(t.x-t.U.width/2,t.y-t.U.height/8,t.U.width,t.U.height/4),T(50),d,function(a){return q(a,h,-h,t.duration)})}Wf(ni,si);
si.prototype.Gk=function(a){Yf(this.Ed,a);Yf(this.Fd,a);Yf(this.ag,a);Yf(this.Og,a);this.Ib=this.Ed.J();this.Jb=this.Fd.J();this.alpha=this.ag.J();this.y=this.Og.J()};si.prototype.qa=function(){this.U.$(this.x-this.U.width*this.Ib/2,this.y-this.U.height*this.Jb/2,this.Ib,this.Jb,0,this.alpha)};
function vi(a,b,c,d,g,h){this.$e(a,b,S.$b+S.Ql/2,S.ac+S.vg/2,g,h);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Oa(this.font);a.color="white";Na(this.font,a);this.depth=-20;this.duration=2E3;oi(this,.5,.3);a=Q([jc,N],[!1,!1],[this.Vc,this.pd+this.Gc]);this.Ed=new Xf(0,this.duration,a);Zf(this.Ed,1);a=Q([jc,N],[!1,!1],[this.Vc,this.pd+this.Gc]);this.Fd=new Xf(0,this.duration,a);Zf(this.Fd,1);a=Q([N,jc],[!1,!1,!0],[this.Vc+this.pd,this.Gc]);this.ag=new Xf(1,this.duration,a);Zf(this.ag,
0);a=Q([N,lc],[!1,!1],[this.Vc+this.pd,this.Gc]);this.Og=new Xf(this.y,this.duration,a);Zf(this.Og,this.y)}Wf(ni,vi);vi.prototype.Gk=function(a){Yf(this.Ed,a);Yf(this.Fd,a);Yf(this.ag,a);Yf(this.Og,a);this.Ib=this.Ed.J();this.Jb=this.Fd.J();this.alpha=this.ag.J();this.y=this.Og.J()};vi.prototype.qa=function(){this.U.$(this.x-this.U.width*this.Ib/2,this.y-this.U.height*this.Jb/2,this.Ib,this.Jb,0,this.alpha)};
function ui(a,b,c,d){var g=2*c+2*d,h=c/g,k=d/g;return function(g){if(g<h)return new f(a+1/h*c*g,b);if(g<h+k)return new f(a+c,b+1/k*(g-h)*d);if(g<h+k+h)return new f(a+c-1/h*(g-h-k)*c,b+d);if(1>=g)return new f(a,b+d-1/k*(g-h-k-h)*d)}}function wi(){this.Vh=new f(0,0);this.wk=new f(0,0);this.Pt=this.Z=this.Or=this.el=this.ht=0}wi.prototype.Yo=function(a){return this.el<a&&this.el+this.ht>a};
function ti(a,b,c,d,g,h){this.e=a;this.visible=this.h=!0;this.Iv=h||function(){return 1};this.depth=0;this.group="gameObject";this.scale=25/a.width;this.Sy=g;this.Sh=[];this.ol=b;this.Pr=1;this.yA=10;this.Pz=d;this.eb=0;this.shape=c;S.c.Ga(this,S.mf);this.ue=new f(0,0);for(a=0;a<g;++a)b=c(a/g),this.ue.x+=b.x,this.ue.y+=b.y;this.ue=this.ue.scale(1/g);for(a=0;a<g;++a)this.Sh.push(new wi),xi(this,a);Q([O,O],[!1,!0],[1,1]);L(this);Sb(this,"game")}var yi=new ka(0);
function xi(a,b){var c=a.Sh[b],d=b/a.Sy;c.ht=a.ol;d=a.shape(d);d=d.add(ga(yi.random(360),yi.random(a.Pz)));c.Pt=360;c.wk=ha(d,a.ue).scale(1/(a.ol/1E3*.04));c.el=a.eb+yi.random(a.yA);c.Is=la(yi,a.e.G-1);c.Vh=a.ue}
ti.prototype.V=function(a){this.eb+=a;for(var b=new f(0,180),c=0;c<this.Sh.length;++c){var d=this.Sh[c],g=Math.floor((this.eb-d.el)/this.ol);g>d.Or&&g<this.Pr-1&&(xi(this,c),d.Or=g);d.Yo(this.eb)&&(g=d.wk.scale(-4),g=b.add(g),d.wk=d.wk.add(g.scale(a/1E3)),d.Vh=d.Vh.add(d.wk.scale(a/1E3)),d.Z+=d.Pt*a/1E3,d.scale=2*Math.log(ha(d.Vh,this.ue).length()/100)*this.scale)}this.eb>this.ol*this.Pr&&M(K,this);this.canvas.T=!0};
ti.prototype.qa=function(){for(var a=0;a<this.Sh.length;++a){var b=this.Sh[a];b.Yo(this.eb)&&this.e.$(b.Is,b.Vh.x,b.Vh.y,b.scale,b.scale,b.Z,.9*this.Iv(this.eb))}};function zi(){ac.call(this);this.group="gameObject";this.cf=[];Sb(this,"game")}Wf(ac,zi);ea.prototype.floor=function(a){return a|0};
function Ai(){this.Cb=$.Jr($.an);this.Cb.font=Ue;this.a=S.a.K.ls;this.xd=this.a.wz;this.fd=this.a.pz;this.ok=this.xd+this.fd;this.Cb.dd=N;this.Cb.ed=Q([N,O],[!1,!1],[this.xd,this.fd]);var a=Q([N,O],[!1,!1],[this.xd,this.fd]);this.Cb.bd=function(b,c,d,g){return a(b,1,-1,g)};this.Cb.yl=Q([P,N],[!1,!1],[this.xd,this.fd]);this.Cb.zl=Q([P,N],[!1,!1],[this.xd,this.fd])}function Bi(a,b,c,d){a.Cb.font=0<b?Ue:Ve;$.dr(a.Cb,(0<b?"+":"")+b,c,d,c,d+a.a.yz*a.ok/1E3,a.ok,0,!0)}
function Ci(){function a(a,b,g,h){return P(a,b,g,h,6)}this.Cb=$.Jr($.an);this.Cb.font=Ue;this.a=S.a.K.ls;this.xd=this.a.rA;this.fd=this.a.pA;this.ok=this.xd+this.fd;this.Cb.dd=N;this.Cb.ed=Q([N,O],[!1,!1],[this.xd,this.fd]);var b=Q([N,O],[!1,!1],[this.xd,this.fd]);this.Cb.bd=function(a,d,g,h){return b(a,1,-1,h)};this.Cb.yl=Q([a,N],[!1,!1],[this.xd,this.fd]);this.Cb.zl=Q([a,N],[!1,!1,!0],[this.xd,.95*this.fd,.05*this.fd])}
function Di(a,b,c,d,g){var h=null,k=null,l="<>";switch(b){case 0:h=Xe;l=S.j.q("bl_nice","<bl_nice>");k=zf;break;case 1:h=We;l=S.j.q("bl_great","<bl_great>");k=yf;break;case 2:case 3:case 4:h=Te,l=S.j.q("bl_awesome","<bl_awesome>"),k=xf}"undefined"===typeof g&&I.play(k,800);a.Cb.font=h;d+=a.a.tA;$.dr(a.Cb,l,c,d,c,d+a.a.sA*a.ok/1E3,a.ok,800,!0)}
function Ei(a,b,c,d,g,h,k){this.depth=c;this.h=this.visible=!0;this.group="gameObject";S.c.Ga(this,S.mf);this.x=a;this.y=b;this.e=d;this.duration=g;this.scale=h;this.Z=0;this.rotation=k||0;L(this);Sb(this,"game");this.k=0}Ei.prototype.V=function(a){this.k+=a;this.Z=this.rotation;this.k>=this.duration&&M(K,this)};Ei.prototype.qa=function(){var a=new f(this.x+S.$b,this.y+S.ac);this.e.$(Math.floor(this.k*this.e.G/this.duration),a.x,a.y,this.scale,this.scale,this.Z,1)};
function Fi(a){S.c.Ga(this,S.mf);this.depth=0;this.visible=this.h=!1;this.$o=this.Zo=0;this.Jg=1;this.b=a;this.cd=Q([lc,N,kc],[!1,!1,!0],[.5,.5,.5]);L(this);Sb(this,"game")}Fi.prototype.show=function(a){this.h?(this.Zo=this.alpha,this.$o=this.duration,this.duration+=a):(this.alpha=0,this.duration=a,this.$o=this.Zo=this.k=0);this.visible=this.h=!0};
Fi.prototype.V=function(a){this.k+=a;this.canvas.T=!0;this.alpha=this.cd(this.k,0,1,this.duration);this.k<this.$o&&(this.alpha=Math.max(this.Zo,this.alpha));this.k>=this.duration&&(this.visible=this.h=!1,this.alpha=0);this.Jg=1-this.alpha*this.b.b.Id.qd.fe};Fi.prototype.qa=function(){Id.pc(0,S.$b,S.ac,this.alpha);Gd.pc(0,S.$b+Id.width,S.ac,this.alpha);Jd.pc(0,S.$b+Id.width+Gd.width,S.ac,this.alpha);Hd.pc(0,S.$b+Id.width,S.ac+S.vg-Hd.height,this.alpha)};
function Gi(){this.depth=9E3;this.h=this.visible=!0;this.group="levelControllers";this.a=S.a.K.rx;this.bc=0;this.Fp=this.di=!0;this.Iy=[];S.c.Ga(this,S.Hh);this.Xp=this.hf=0;this.Nr=null;this.Gw=[qf,rf,sf,tf];var a,b;a={};a.fB=jf;a.gB=kf;a.nB=lf;a.fC=mf;a.gC=nf;a.hC=of;a.PC=pf;a.GB=vf;a.IB=qf;a.JB=rf;a.KB=sf;a.LB=tf;a.FB=uf;b=S.a.K.NB;if(void 0!==b)for(var c in b)b.hasOwnProperty(c)&&void 0!==a[c]&&a[c].LC(b[c]);L(this);Hi(this)}
function Ii(a,b,c,d,g){if(0>=g)return b;if("object"===typeof a&&null!==a&&null!==b){var h;h="undefined"!==typeof a.length?[]:{};for(var k in a)h[k]=Ii(a[k],b[k],c,d,g-1);return h}return"number"===typeof a?a*c+b*d:b}function Ji(a,b){for(var c=null,d=0;d<S.a.K.ep.length;++d){var g=S.a.K.ep[d];if(g.xb.xc>=b){c&&g.xb.xc!==b?(d=(b-c.xb.xc)/(g.xb.xc-c.xb.xc),a.Id=Ii(c,g,1-d,d,3)):a.Id=g;break}else c=g}}
function Hi(a){a.wb=!0;var b=new Ih,c,d=qg(S.b);a.o=new Ki(a,d?d.CC:void 0);d?(S.m.Rg="number",S.m.kg="max",b.oo=["score"],b.Pm=hi.UA,void 0!==d.Vv?c=d.Uh[d.Vv]:(b.Xl=["highScore"],c=0)):(b.Xl=["lives"],b.Pm=ii,c=Ah());a.Ra=new Jh(b);c||(c=0);Uh(a.Ra,c);Vh(a.Ra,1);d?Li(function(){a.Zl();a.bc=2},a):Mi(S.j.q("bl_assignment_header","<bl_assignment_header>"),S.j.q("bl_assignment","<bl_assignment>"),function(){a.Zl();a.bc=2},a);$.mx();$.Ez(!0);a.Gd=new Ai;a.Tm=new Ci;Bi(a.Gd,10,-2E3,-2E3);Bi(a.Gd,20,-2E3,
-2E3);Bi(a.Gd,30,-2E3,-2E3);Bi(a.Gd,40,-2E3,-2E3);Bi(a.Gd,50,-2E3,-2E3);Bi(a.Gd,60,-2E3,-2E3);Bi(a.Gd,70,-2E3,-2E3);Bi(a.Gd,80,-2E3,-2E3);Bi(a.Gd,90,-2E3,-2E3);Bi(a.Gd,100,-2E3,-2E3);Di(a.Tm,0,-2E3,-2E3,!1);Di(a.Tm,1,-2E3,-2E3,!1);Di(a.Tm,2,-2E3,-2E3,!1);b=S.j.q("bl_screencleared","<bl_screencleared>");b=new si(b,Ye,Fd,0,null,1,!1,!1);b.x=-3E3;b.y=-3E3}e=Gi.prototype;e.Zl=function(){this.bc=1;Vh(this.Ra,0);this.Fj();return this.o.Zl()};e.Ef=function(a){this.h=!a};
function Ni(){var a=S.K,b,c;a.Fp=!0;b=a.Fp?Tb(K,function(a){return"LevelControllers"===a.group||"gameObjects"===a.group||"gameAnimationObjects"===a.group}):Tb(K,function(a){return"LevelControllers"===a.group});for(c=0;c<b.length;c+=1)b[c].Ef(!1);a.bc=a.Iy.pop()}
function Oi(a,b,c,d){if(0<d){var g=0,h=0,k=a.a.Jp[h],l;for(l=0;l<d;l+=1)l+1>k[0]&&(h=Math.min(a.a.Jp.length-1,h+1),k=a.a.Jp[h]),g+=k[1];d>a.a.qt[1]?I.play(mf):d>a.a.qt[0]?I.play(nf):I.play(of);l=a.si(g,b,c);if(100<=l)a.Fj();else for(a.o.si(l),g=a.a.Kx,l=g.length-1;0<=l;--l)if(g[l]<=d){a.Nr=a.Gw[l];I.play(a.Nr);Di(a.Tm,l,b+S.$b,c+S.ac);break}}}
e.si=function(a,b,c){var d;d=a/this.Id.Qc.ce*100;0!==a&&(b=void 0===b?S.Ql/2+S.$b:b+S.$b,c=void 0===c?S.vg/2+S.ac:c+S.ac,Bi(this.Gd,a,b,c),this.Ra.ai(this.Ra.yg()+d),b=this.Ra,Th(b,b.Df.J()+a),this.Ra.Df.J()<this.Xp&&Th(this.Ra,this.Xp));return d=this.Ra.yg()};e.kb=function(){$.bs();M(K,this.o);M(K,this.Ra);var a=K,b,c=Tb(a,"game");for(b=0;b<c.length;b+=1)M(a,c[b]);this.canvas.T=!0};
e.V=function(a){a*=this.o.Tg.Jg;this.hf=Math.max(0,this.hf-a);2===this.bc||1===this.bc||3===this.bc&&!this.Fp?this.canvas.T=!0:4===this.bc&&(this.ap<this.Sw?(this.ap+=a,this.canvas.T=!0):(this.bc=5,qg(S.b)?Pi(S.b,this.Ra.Df.J()):Qi(S.b,{totalScore:this.Ra.Df.J(),stage:this.Ra.Hf.J()})))};
e.cb=function(a,b,c){if(2===this.bc&&b>=S.$b&&b<S.$b+S.Ql&&c>=S.ac&&c<S.ac+S.vg&&(a=this.o,b-=S.$b,c-=S.ac,!(0<a.li))){var d,g;d=fa.floor(c/a.a.yc);g=fa.floor(b/a.a.yc);if(d>=a.t)Ri(a);else if(d=g*a.t+d,g=a.o[d],null!==g)if("undefined"===typeof g.ca&&g.wc===Si)if(d=Ti(a,d),d.length<a.yt){for(g=0;g<d.length;g+=1)Ui(a.o[d[g]],!0);a=a.b;a.si(-a.a.Fw,b,c);I.play(vf)}else{for(g=0;g<d.length;g+=1)a.o[d[g]].remove();Oi(a.b,b,c,d.length)}else if("undefined"!==typeof g.ca&&g.wc===Si)switch(a.qe[g.ca]-=1,g.ca){case 0:b=
Vi(a,d,0);Oi(a.b,Wi(a,d),Xi(a,d),b);break;case 1:b=d;var h,k,l,n,q,t,A,B,r,s;h=a.o[b];h.ca=void 0;k=b%a.t;l=fa.floor(b/a.t);n=a.a.lA;d=[];for(c=0;c<a.Rb.length;c+=1)d[c]=[];g=k-n;0>g&&(g=0);k+=n;k>=a.t&&(k=a.t-1);q=l-n;0>q&&(q=0);l+=n;l>=a.va&&(l=a.va-1);n=k-g+1;t=l-q+1;for(A=g;A<=k;A+=1)for(B=q;B<=l;B+=1)h=a.o[B*a.t+A],null!==h&&h.wc!==Yi&&(d[h.color].push(h),a.o[B*a.t+A]=h.Gf?2:1);r=[];for(c=0;c<a.Rb.length;c+=1){A=[];for(A.push(b);0<A.length&&0<d[c].length;)if(b=A.shift(),1===a.o[b]||2===a.o[b])for(h=
d[c].shift(),h.moveTo(Wi(a,b),Xi(a,b),a.a.oq),1===a.o[b]?Zi(h):$i(h),a.o[b]=h,h.Ee=b,h=[],b>=a.t&&h.push(b-a.t),b<a.Sb-a.t&&h.push(b+a.t),0!==b%a.t&&h.push(b-1),0!==(b+1)%a.t&&h.push(b+1),B=0;B<h.length;B+=1)A.push(h[B]);for(;0<d[c].length;)r.push(d[c].shift());if(0<A.length)b=A.shift();else for(A=g+la(a.random,k-g),B=q+la(a.random,l-q),s=0;s<n*t;s+=1){b=B*a.t+A;if(null===a.o[b])break;B+=1;B>l&&(A+=1,B=q,A>k&&(A=g))}}A=g;B=q;for(s=0;s<n*t&&0!==r.length;s+=1){b=B*a.t+A;if(1===a.o[b]||2===a.o[b])h=
r.shift(),h.moveTo(Wi(a,b),Xi(a,b),a.a.oq),1===a.o[b]?Zi(h):$i(h),a.o[b]=h,h.Ee=b;B+=1;B>l&&(A+=1,B=q,A>k&&(A=g))}d=aj(a);g=[];for(c=0;c<d.length;c+=1)g.push(a.o[d[c]]);bj(a.zg,g);Oi(a.b,Wi(a,b),Xi(a,b),0);a.li=a.a.oq;I.play(pf);a.Kg=!0;break;case 2:cj(a,d);break;case 3:b=a.o[d],new Ei(b.x,b.y,0,Kd,1E3,1,0),dj(b),a.Tg.show(a.b.Id.qd.ee)}}};
e.Fj=function(){var a=this;Wh(this.Ra);this.Ra.ai(0);this.Xp=this.Ra.Df.J();ej(this,S.j.q("bl_stage","<bl_stage>")+" "+this.Ra.Hf.J());Ji(this,this.Ra.Hf.J());fj(this.o);1<this.Ra.Hf.J()&&window.setTimeout(function(){S.l.lx(a.Ra.Df.J())},1E3)};e.qa=function(){this.wb=!1};function gj(a){var b=S.j.q("bl_gameover","<bl_gameover>"),c=2E3,d=Se,g=new zi,c=c||0,d=d||Qe;g.pa(a.hf+1+c,function(){new vi(b,d,0,0,void 0,!0)});a.hf+=2E3+c;g.start()}
function ej(a,b){var c=new zi,d=1!==a.Ra.Hf.J();c.pa(a.hf+1,function(){new si(b,Re,Fd,d?8:0,wf,1,!0,!0);d&&mi(300,.25)});a.hf+=2E3;c.start()}
function Ki(a,b){this.depth=200;this.visible=!1;this.h=!0;this.group="levelControllers";this.b=a;this.a=S.a.K.Tw;this.Qg=[];this.Ug=[];"undefined"!==typeof me&&(this.Qg.push(me),this.Ug.push(2));"undefined"!==typeof ne&&(this.Qg.push(ne),this.Ug.push(3));"undefined"!==typeof oe&&(this.Qg.push(oe),this.Ug.push(4));"undefined"!==typeof s_rubyorange&&(this.Qg.push(s_rubyorange),this.Ug.push(5));"undefined"!==typeof ke&&(this.Qg.push(ke),this.Ug.push(6));"undefined"!==typeof le&&(this.Qg.push(le),this.Ug.push(7));
this.t=this.a.rows;this.va=this.a.lw;this.Sb=this.t*this.va;this.o=[];this.lf=[];this.Lg=[];var c,d;for(c=0;c<this.va;++c)this.Lg[c]=null,this.lf[c]=0;for(c=0;c<this.Sb;c+=1)this.o[c]=null;this.nj=[];for(c=0;c<this.va;c+=1)for(this.nj[c]=[],d=0;d<Math.floor(this.t/2);d+=1)this.nj[c].push(new hj(0,0,0,this));this.random=new ka(b);this.$v=new ka(b);this.yt=3;this.vh=0;this.qe=[];for(c=0;3>c;c+=1)this.qe[c]=0;this.Xh=[];this.bj=new ij(this);this.zg=new jj(this);this.paused=!1;L(this);this.Tg=new Fi(this)}
e=Ki.prototype;e.Ef=function(a){this.paused=a};function fj(a){a.oz=a.b.Id.Rb.Xa;a.aw=a.b.Id.Ec.Xa;a.Gl=a.b.Id.Vd.Pd;a.wf=a.b.Id.o.Uc;a.si(a.b.Ra.yg())}e.si=function(a){a/=100;this.Rb=kj(this.oz,a);this.Ec=kj(this.aw,a);var b=Math.floor(10*a);for(a=0;a<=b;++a)if(this.Gl[a])for(var c=0;c<this.Gl[a].length;++c)this.Gl[a][c]&&(this.Gl[a][c]=!1,lj(this,c))};
e.Zl=function(){this.Kg=!1;this.El=this.li=0;this.zg.reset();var a=!0,b,c,d,g,h;do{for(c=0;c<this.va;c+=1)for(d=0;d<this.t;d+=1)b=this.nj[c].shift(),g=c*this.t+(this.t-d-1),b?(b.lb(Wi(this,g),-this.a.yc/2,mj(this)),this.o[g]=b,b.Ee=g):this.o[g]=null;for(c=0;c<this.qe.length;c+=1)for(d=this.qe[c];0<d;){for(g=la(this.random,this.Sb-1);this.o[g]&&"undefined"!==typeof this.o[g].ca;)g=la(this.random,this.Sb-1);nj(this.bj,this.o[g],c);d-=1}if(a)if(g=aj(this),0!==g.length){a=!1;d=[];for(c=0;c<g.length;c+=
1)d.push(this.o[g[c]]);bj(this.zg,d)}else for(c=0;c<this.va;c+=1)for(d=0;d<this.t;d+=1)g=c*this.t+d,(b=this.o[g])&&b.lb(Wi(this,g),-this.a.yc/2,mj(this));b=0;if(!a){for(c=0;c<this.va;c+=1)for(h=0,d=this.t-1;0<=d;d-=1)g=c*this.t+d,this.o[g]&&(oj(this.o[g],Xi(this,g),h,!0),h+=50+this.random.random(20*d),b=Math.max(h,b));this.h=!0;this.k=0;this.wu=!0;I.play(uf)}}while(a);return b};
function mj(a){var b,c,d;b=a.random.random();for(d=c=0;d<a.Rb.length;d+=1)if(c+=a.Rb[d],b<c)return d;return a.Rb.length-1}function kj(a,b){var c;for(c=Math.floor(10*b);0<=c;){if(a[c])return a[c];--c}throw"No setting for for progress "+b+" in setting "+a;}function Wi(a,b){return(fa.floor(b/a.t)+.5)*a.a.yc}function Xi(a,b){return(b%a.t+.5)*a.a.yc}function Ri(a){var b=pj(a);if(!(0>b)){for(;0<=b;)qj(a,b),b=pj(a);rj(a)}}e.pf=function(a){32===a&&Ri(this)};
function Ti(a,b){var c,d,g,h,k,l,n;c=[];d=[];h=[];for(k=0;k<a.Sb;k+=1)h[k]=0;k=a.o[b].color;l=function(a){0===h[a]&&(h[a]=1,c.push(a))};for(l(b);0<c.length;)n=c.shift(),g=a.o[n],null!==g&&g.color===k&&g.wc===Si&&"undefined"===typeof g.ca&&(d.push(n),n>=a.t&&(g=n-a.t,l(g)),n<a.Sb-a.t&&(g=n+a.t,l(g)),0!==n%a.t&&(g=n-1,l(g)),0!==(n+1)%a.t&&(g=n+1,l(g)));return d}
function aj(a){var b,c,d,g,h,k,l;g=b=a.Sb;d=function(a){return a+1>=g?0:a+1};c=la(a.random,a.Sb-1);h=[];for(k=0;k<a.Sb;k+=1)h[k]=0;for(;--b;){if(!h[c]&&(k=a.o[c],null!==k&&"undefined"===typeof k.ca&&k.wc===Si)){k=Ti(a,c);l=k.length;if(l>=a.yt)return k;for(l+=1;--l;)h[k[l]]=1}c=d(c)}return[]}
function Vi(a,b,c){var d,g,h,k,l,n,q,t,A,B;d=a.o[b];g=!1;if(d.Ae&&(g=!0,d.yd<c))return 0;sj(d,c,!0);h=1;l=fa.floor(b/a.t);k=b%a.t;n=Math.max(-a.a.sh,-l);q=Math.min(a.a.sh,a.va-1-l);l=Math.max(-a.a.sh,-k);k=Math.min(a.a.sh,a.t-1-k);var r=a.a.sh*a.a.sh;for(t=n;t<=q;t+=1)for(n=l;n<=k;n+=1)if(A=b+a.t*t+n,d=t*t+n*n,A!==b&&r>=d&&(d=a.o[A],B=c+a.a.Zv*Math.max(Math.abs(t),Math.abs(n)),null!==d&&(!d.Ae||d.yd>B)))switch(d.Ae||"undefined"===typeof d.ca||(a.qe[d.ca]-=1),d.ca){case 0:h+=Vi(a,A,B);break;case 2:cj(a,
A,B);break;default:d.wc!==Yi&&(h+=1),sj(d,B)}return g?0:h}
function cj(a,b,c){var d,g,h,k,l,n,q,t,A,B,r;c=c||0;d=a.o[b];g=d.color;h=b%a.t;k=fa.floor(b/a.t);sj(d);l=0;n=a.a.kw/2;for(A=0;A<a.va;A+=1)for(B=0;B<a.t;B+=1)r=a.o[A*a.t+B],null===r||r.color!==g||"undefined"!==typeof r.ca&&2!==r.ca||(q=Math.abs(B-h),t=Math.abs(A-k),sj(r,Math.max(q,t)*n+c),l+=1);t=Math.max(a.va-1-k,k);q=Math.max(a.t-1-h,h);c=Math.max(t,q);new tj(a,d.x,d.y,0,Math.sqrt(2*c*a.a.yc*c*a.a.yc),c*n);Oi(a.b,Wi(a,b),Xi(a,b),l);I.play(lf)}
function uj(a,b,c,d){var g=!0,h,k,l,n=0;for(h=a.t-1;0<=h;h-=1)if(l=b*a.t+h,k=a.o[l],null===k)n+=1;else if(null!==k&&(0<n||k.Ae||k.Za||k.Ud)){g=!1;break}n===a.t&&d++;if(g){for(h=0;h<a.t;++h)if(l=b*a.t+h,k=a.o[l],null!==k){g=l+c*d*a.t;a.o[g]=k;k.Ee=g;a.o[l]=null;l=Wi(a,g);if(k.Za)throw"Falling while moving";g=Math.abs(k.x-l)/k.images[0].width*k.a.og;k.Jc=l;k.Td?k.og+=g:(k.h=!0,k.Td=!0,k.og=g,k.sj=0,k.sj=0,k.Pa=0,k.nd=k.x,k.visible=!0,Ui(k,!1));k.qf&&vj(k.b)}0<=b-c&&b-c<a.va&&uj(a,b-c,c,d)}}
function lj(a,b){var c=null,d,g,h,c=void 0;if("undefined"!==typeof b){if(a.qx===b&&a.vh<a.a.zt)return;c=b}else{if(a.vh<a.a.zt)return;d=a.$v.random();for(h=g=0;h<a.Ec.length;h+=1)if(g+=a.Ec[h],d<g){c=h;break}if("undefined"===typeof c){a.vh=0;return}}d=la(a.random,a.Sb-1);h=a.o[d];for(g=0;(null===h||"undefined"!==typeof h.ca||0>h.y||h.wc!==Si)&&g<a.Sb;)d=Math.floor(d+1)%a.Sb,h=a.o[d],g+=1;g!==a.Sb&&(nj(a.bj,a.o[d],c),a.qe[c]+=1,a.vh=0,a.qx=c)}
e.kb=function(){var a,b;for(a=0;a<this.Sb;a+=1)null!==this.o[a]&&M(K,this.o[a]);for(b=0;b<this.va;b+=1)for(a=0;a<this.nj[b].length;a+=1)M(K,this.nj[b][a]);for(b=0;b<this.Lg.length;b+=1)M(K,this.Lg[b]);for(b=0;b<this.Xh.length;b+=1)M(K,this.Xh[b]);M(K,this.bj);M(K,this.zg)};function pj(a){for(var b=0,c=!1,b=0;b<a.va;++b)if(null===a.Lg[b]){c=!0;break}return c?b:-1}
function qj(a,b){0===a.Xh.length&&a.Xh.push(new hj(0,0,0,a));var c=a.Xh.pop();c.lb(Wi(a,a.t-1+b*a.t),S.vg-a.a.yc/2,mj(a));c.gk=!0;c.scale=0;c.alpha=.3;c.ei=0;c.h=!0;a.Lg[b]=c}
function rj(a){for(var b=0,c=0,d=0,g,h,k,l=0,c=0;c<a.va;++c){g=!0;for(d=0;d<a.t;++d)b=c*a.t+d,(k=a.o[b])||(g=!1);if(g){if(l+=1,b=a.lf[c]===a.t,++a.lf[c],a.lf[c]=Math.min(a.lf[c],a.t),b){b=a;d=c;for(k=0;k<b.t;++k)b.o[d*b.t+k].blink(2E3,500,400,1);b=b.b;4!==b.bc&&(b.bc=4,b.ap=0,b.Sw=4E3,gj(b))}}else a.lf[c]=0}if(4!==a.b.bc){for(var n=!1,c=0;c<a.va;++c){for(d=0;d<a.t;++d)b=c*a.t+d,(k=a.o[b])&&0===d?(g=Wi(a,b),h=Xi(a,b)-a.a.yc,k.moveTo(g,h,a.a.Cn),a.o[b]=null,k.Ee=void 0):k&&null===a.o[b-1]&&(g=Wi(a,
b-1),h=Xi(a,b-1),k.moveTo(g,h,a.a.Cn),a.o[b]=null,a.o[b-1]=k,k.Ee=b-1),k&&a.lf[c]>d-1&&!k.Gf&&1!==k.Da&&$i(k);b=c*a.t+a.t-1;null===a.o[b]&&(k=a.Lg[c],a.o[b]=k,k.Ee=b,g=Wi(a,b),h=Xi(a,b),k.alpha=1,k.moveTo(g,h,a.a.Cn),a.lf[c]===a.t&&$i(k),a.Lg[c]=null,n=!0)}n&&vj(a);if(l>=a.b.Id.qd.va)lj(a,3);else for(c=0;c<a.Sb;++c)a.o[c]&&3===a.o[c].ca&&(a.o[c].ca=void 0)}}
e.V=function(a){a*=this.Tg.Jg;if(!this.paused){this.wu&&(this.k+=a,this.k>=S.a.K.Zh.Ce&&(this.wu=!1));0<this.li&&(this.li-=a);2===this.b.bc&&(this.vh+=a);if(this.Kg&&0>=this.li){for(var b=!0,c=0;c<this.o.length;++c)if(this.o[c]){b=!1;break}b&&(b=this.b,c=S.j.q("bl_screencleared","<bl_screencleared>"),new si(c,Ye,Fd,16,null,1,!1,!1,S.vg/4),mi(300,.25),I.play(xf),b.si(b.a.hw,0,0,!1));for(var d,g,h,k,l,b=0;b<this.va;b+=1){g=d=0;for(var n=!0,q=!0,t=!0,c=this.t-1;0<=c;c-=1)h=b*this.t+c,k=this.o[h],null!==
k&&(n=!1),null===k?(g+=1,q=!1,t=!0):k.Ae||k.Td||k.Za?g=0:0<g&&(k=this.o[h],l=h+g,this.o[l]=k,k.Ee=l,this.o[h]=null,oj(k,Xi(this,l),d,t),t=!1,d+=1+this.random.random(l%this.t*2));if(!q)for(c=this.t-1;0<=c;c-=1)h=b*this.t+c,k=this.o[h],null!==k&&Zi(k);n&&(d=4>=b?-1:1,c=b+d,0<=c&&c<this.va&&uj(this,c,-d,1))}lj(this);this.Kg=!1}this.wf-=a;0>=this.wf&&2===this.b.bc&&(this.wf=0,a=pj(this),this.wf+=this.b.Id.o.Uc,0<=a?(qj(this,a),a=pj(this),0>a&&rj(this)):(this.wf+=this.b.Id.o.Uc*this.va/2,rj(this)))}};
function vj(a){for(var b=0,c=aj(a),d=[],b=0;b<c.length;b+=1)d.push(a.o[c[b]]);bj(a.zg,d)}e.Xd=function(){};function hj(a,b,c,d){this.depth=500;this.Gf=this.h=this.visible=!1;this.group="gameObjects";this.a=S.a.K.Zh;this.b=d;this.images=d.Qg;this.cj=ud;this.Wv=Cd;this.dropEffect=Ed;this.dk=0;this.Zd=d.a.yc/this.images[0].width;this.Z=0;this.wl=this.a.wl;this.no=[Cd,Cd,Cd,Cd,Cd];this.fs=this.a.es/(Cd.G+1);this.Nn=this.Da=0;S.c.Ga(this,S.Hh);L(this)}var Si=0,Yi=1;e=hj.prototype;
e.Ef=function(a){if(a)this.h=!1;else if(this.wc!==Si||this.ek||this.Ud||this.Td||this.Za)this.h=!0};function sj(a,b,c){a.wc!==Yi?(a.h=!0,a.wc=Yi,a.Ae=!0,a.yd=0,a.b.El+=1,a.Hz=!1===c?!1:!0,void 0!==b&&(a.yd=b),a.ob=0,Ui(a,!1),a.e="undefined"===typeof a.ca?a.images[a.color]:a.cj,a.Da="undefined"===typeof a.ca?0:1<a.ca?a.ca+a.color:a.ca,3===a.ca&&(a.Da=8)):a.Ae&&a.ob<b&&(a.yd=Math.min(b,a.yd));a.qf&&vj(a.b)}
e.remove=function(a){this.wc===Si&&(this.h=!0,this.Pp=a||0,this.wc=Yi,this.Qp=!0,this.e="undefined"===typeof this.ca?this.images[this.color]:this.cj,this.Da="undefined"===typeof this.ca?0:1<this.ca?this.ca+this.color:this.ca,this.ob=0,Ui(this,!1),this.qf&&vj(this.b))};function oj(a,b,c,d){if(a.Za)throw"Falling while moving";a.qc=b;a.cv=d;a.Ud?a.Ce+=a.a.Ce:(a.h=!0,a.Ud=!0,a.Ce=a.a.Ce,a.tj=0,"undefined"!==typeof c&&(a.tj=c),a.Pa=0,a.od=a.y,a.visible=!0,Ui(a,!1));a.qf&&vj(a.b)}
e.moveTo=function(a,b,c){this.Td=this.Ud=!1;Ui(this,!1);this.h=!0;this.nd=this.x;this.od=this.y;this.Jc=a;this.qc=b;this.Pa=0;this.Za=!0;this.tc=c;this.qf&&vj(this.b)};function Ui(a,b){(a.ek=b)?(a.Fl=0,a.h=!0,a.Da=1):a.Da=0}e.blink=function(a,b,c,d){this.wr=!0;this.Mn=0;this.vr=b;this.Yv=c;this.h=!0;this.Da=this.Xv=d};
function dj(a){a.h=!1;a.visible=!1;a.Td?a.x=a.Jc:a.Ud?a.y=a.qc:a.Za&&(a.x=a.Jc,a.y=a.qc);var b=a.b,c,d;c=Math.floor(a.qc/b.a.yc);d=Math.floor(a.Jc/b.a.yc);if(0<=c){var g=b.o[a.Ee];if(g!==a)throw"Assertion failed: ruby="+a+" gridRuby="+g;b.o[d*b.t+c]=null;a.Ee=void 0}b.Xh.push(a);b.Kg=!0;a.y=-a.images[0].height/2;a.ca=void 0;a.qf&&vj(a.b)}
e.lb=function(a,b,c){this.h=!1;this.visible=!0;this.x=a;this.y=b;this.Jc=a;this.qc=b;this.alpha=this.scale=1;this.color=c;this.ca=void 0;this.wc=Si;this.ek=this.Za=this.gk=this.Td=this.Ud=this.Kj=this.Ae=this.Qp=!1;this.Z=this.Da=0;this.ks=this.qf=this.Gf=!1};function wj(a,b){a.ca=b;a.Da=0;a.Nn=1<b?a.b.Ug[a.color]:b;3===b&&(a.Nn=8);a.wc===Si&&0<a.y&&(a.gk=!0,a.ei=0,new tj(a.b,a.x,a.y,3*a.images[0].width,a.images[0].width/2,a.a.Sm),I.play(kf));a.qf&&vj(a.b)}
e.V=function(a){a*=this.b.Tg.Jg;this.pj&&(this.xl+=a,this.xl>this.wl&&(this.pj=!1));this.Qp?this.ob<this.Pp?(this.ob+=a,this.e=this.images[this.color],this.Da=2):(this.ob+=a,this.Kj?(this.Da=Math.floor(this.e.G*(this.ob-this.Pp)/this.a.du),this.ob>=this.Pp+this.a.du&&dj(this)):(this.e=this.Wv,this.Da=0,this.Kj=!0)):this.Ae?(!this.ks&&0===this.ca&&this.yd<this.ob&&(this.ks=!0,mi(void 0,.5)),this.ob<=this.yd?(this.ob+=a,this.ob>this.yd&&(void 0===this.ca&&(this.e=this.images[this.color],this.Da=2),
this.Hz&&(I.stop(jf.name),I.play(jf)))):(this.ob+=a,!this.Kj&&this.ob>=this.fs+this.yd&&(this.e=void 0===this.ca?this.no[this.color]:this.no[4],this.Da=0,this.Kj=!0),this.Kj&&(this.Da=Math.min(fa.floor((this.ob-this.yd)/this.fs)-1,this.no[0].G-1),this.ob>=this.yd+this.a.es&&(this.b.El-=1,dj(this))))):this.gk&&this.ei<this.a.Sm&&(this.ei+=a,this.scale=P(this.ei,0,1,this.a.Sm),this.ei>=this.a.Sm&&(this.scale=1,this.gk=!1));if(this.Td||this.Ud){if(this.Ud)if(this.Pa<this.tj)this.Pa+=a;else if(this.Pa<
this.Ce+this.tj){this.Pa+=a;var b=this.od,c=this.qc-this.od,d=this.Ce,g=d-(this.Pa-this.tj),h=void 0,k=void 0,l,n,q;void 0===h&&(h=4);k=void 0===k?2:Math.sqrt(k);l=[1];for(n=q=1;n<h;n+=1)l.push(l[n-1]*k),q+=l[n];q-=l[h-1]/2;k=Math.pow(l[h-1],2);g=g/d*q;for(n=d=0;n<h;n+=1)if(g>l[n])g-=l[n];else{d=l[n];break}this.y=b+c*(1+-1*(-4*Math.pow(g-d/2,2)+d*d)/k);this.cv&&!this.pj&&Math.abs(this.y-this.qc)<T(5)&&(this.uw=this.Jc,this.vw=this.qc,this.pj=!0,this.xl=0,this.cv=!1);this.Pa>=this.Ce+this.tj&&(this.Ud=
!1,this.b.Kg=!0,this.y=this.qc)}this.Td&&(this.Pa<this.sj?this.Pa+=a:this.Pa<this.og+this.sj&&(this.Pa+=a,this.x=this.nd+(this.Pa-this.sj)/this.og*(this.Jc-this.nd),this.Pa>=this.og+this.sj&&(this.Td=!1,this.b.Kg=!0,this.x=this.Jc)))}else this.Za&&this.Pa<this.tc&&(this.Pa+=a,this.x=ec(this.Pa,this.nd,this.Jc-this.nd,this.tc,2),this.y=ec(this.Pa,this.od,this.qc-this.od,this.tc,2),this.Pa>=this.tc&&(this.x=this.Jc,this.y=this.qc,this.Za=!1,this.b.Kg=!0,this.y<.5*this.b.a.yc&&dj(this)));this.ek&&this.Fl<
this.a.gs&&(this.Fl+=a,this.Fl>=this.a.gs&&(this.ek=!1,this.Da=0));this.Gf&&(this.dk+=a,this.Z=2*Math.sin(this.dk/12));this.wr&&(this.Mn+=a,this.Da=Math.floor(this.Mn)%(this.vr+this.Yv)>this.vr?0:this.Xv);this.pj||this.wr||this.Gf||this.gk||this.wc!==Si||this.ek||this.Ud||this.Td||this.Za||(this.h=!1)};function $i(a){a.Gf||(a.dk=0,a.Z=0);a.h=!0;a.Gf=!0}function Zi(a){a.Z=0;a.dk=0;a.Gf=!1}
e.qa=function(){this.Ae||this.Qp?this.e.$(this.Da,this.x+this.Z,this.y,this.scale*this.Zd,this.scale*this.Zd,0,this.alpha):"undefined"===typeof this.ca?this.images[this.color].$(this.Da,this.x+this.Z,this.y,this.scale*this.Zd,this.scale*this.Zd,0,this.alpha):this.cj.$(this.Nn,this.x+this.Z,this.y,this.scale*this.Zd,this.scale*this.Zd,0,this.alpha);this.pj&&Ed.$(Math.round(this.xl/this.wl*(Ed.G-1)),this.uw,this.vw,this.scale*this.Zd,this.scale*this.Zd,0,this.alpha)};
function ij(a){this.depth=-200;this.h=this.visible=!1;this.group="levelControllers";this.a=S.a.K.bj;this.cj=ud;this.b=a;this.bu=[!1,!1,!1];this.Za=this.cq=!1;S.c.Ga(this,S.mf);this.paused=!1;this.zr=[];L(this)}ij.prototype.Ef=function(a){this.paused=a};function nj(a,b,c){null!==b&&(a.bu[c]?(a.zr.push({Zh:b,type:c}),a.bu[c]=!1,a.h=!0):wj(b,c))}
ij.prototype.V=function(a){a*=this.b.Tg.Jg;this.paused||(this.cq?this.ze+=a:this.Za?this.ze<this.a.tc&&(this.canvas.T=!0,this.ze+=a,this.x=hc(this.ze,this.nd,this.Zh.x+S.$b-this.nd,this.a.tc),this.y=hc(this.ze,this.od,this.Zh.y+S.ac-this.od,this.a.tc),this.ze>=this.a.tc&&(this.visible=this.Za=!1,wj(this.Zh,this.type),Ni())):0===this.zr.length&&(this.h=!1))};
ij.prototype.cb=function(){!this.paused&&this.cq&&this.ze>2*this.qr.a.pC&&(M(K,this.qr),this.qr=null,this.ze=0,this.cq=!1,this.wb=this.visible=this.Za=!0)};ij.prototype.qa=function(){this.cj.p(this.Is,this.x,this.y);this.wb=!1};function tj(a,b,c,d,g,h,k){this.depth=50;this.h=this.visible=!0;this.group="gameAnimationObjects";this.x=b;this.y=c;this.e=k=k||sd;this.hk=d/(k.width/2);this.cs=g/(k.width/2);this.scale=this.hk;this.b=a;this.Zp=.25*h;this.duration=h;this.k=0;S.c.Ga(this,S.Hh);L(this)}
tj.prototype.Ef=function(a){this.h=!a};tj.prototype.V=function(a){a*=this.b.Tg.Jg;this.k+=a;this.scale=this.hk+(this.cs-this.hk)*this.k/this.duration;this.Vt=this.hk+(this.cs-this.hk)*(this.k-this.Zp)/(this.duration-this.Zp);this.k>=this.duration&&M(K,this)};tj.prototype.qa=function(){this.e.$(0,this.x,this.y,this.scale,this.scale,0,1);this.Zp<this.k&&this.e.$(0,this.x,this.y,this.Vt,this.Vt,0,1)};
function jj(a){this.depth=400;this.h=!0;this.group="levelControllers";this.visible=!1;this.a=S.a.K.zg;this.e=td;this.b=a;this.Yr=2E3;S.c.Ga(this,S.Hh);this.qh=0;this.scale=1;this.Ag=[];this.reset();L(this)}jj.prototype.reset=function(){xj(this,!1);this.Ag=[];this.show=this.visible=!1;this.Fe=0};jj.prototype.Ef=function(a){this.h=!a};function xj(a,b){for(var c=0;c<a.Ag.length;++c)a.Ag[c].qf=b}
function bj(a,b){xj(a,!1);1===a.b.b.Ra.Hf.J()?(a.visible=!0,a.show=!0,a.h=!0,a.Fe=0,a.Ag=b,xj(a,!0)):(a.visible=!1,a.show=!1,a.h=!1)}
jj.prototype.V=function(a){a*=this.b.Tg.Jg;0<this.Ag.length&&(this.Fe+=a,this.visible?this.Fe>=this.a.Yd?(this.Fe=0,this.visible=!1):(this.qh+=a,a=Math.abs(Math.sin(Math.PI*this.a.fx*this.qh/1E3)),this.scale=1+this.a.ex*a,this.alpha=Math.max(.2+.8*a,1)):!this.show&&this.Fe>=this.a.je?(this.qh=this.Fe=0,this.show=this.visible=!0):this.show&&this.Fe>=this.a.ke&&(this.qh=this.Fe=0,this.visible=!0))};
jj.prototype.qa=function(){var a,b=0,c=Math.floor(this.qh%this.Yr*this.e.G/this.Yr);c>=this.e.G&&(c=0);for(b=0;b<this.Ag.length;b+=1)a=this.Ag[b],0<a.y&&this.e.$(c,a.x,a.y,this.scale*a.Zd,this.scale*a.Zd,0,this.alpha)};function yj(a,b,c){this.depth=c;this.Ea=0;this.h=this.visible=!1;this.x=a;this.y=b;L(this);li||(li=new ki)}e=yj.prototype;e.cc=function(){};e.kb=function(){};e.V=function(){};e.cb=function(){};e.Db=function(){};e.Ej=function(){};e.pf=function(){};e.Mo=function(){};e.jd=function(){};
e.Xd=function(){};e.qa=function(){};e.ts=function(){var a,b,c;a=[];b=[vd,wd,xd,yd,Ad,zd,Bd];for(c=0;c<b.length;c+=1)a.push({e:b[c],text:S.j.q("TutorialText_"+c,"<TutorialText_"+c+">"),title:S.j.q("TutorialTitle_"+c,"<TutorialTitle_"+c+">")});return a};S.version=S.version||{};S.version.game="1.2.1";S.version=S.version||{};S.version.theme="1.5";S.version=S.version||{};S.version.configuration_poki_api="1.0.0";S.l=S.l||{};S.l.ij=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
S.l.Vr=function(a,b,c,d){var g={};S.l.ij(a.Mk,g);g.fontSize=T(18);d=S.c.g(a.Ti,d.height,T(22));d=a.Ri-d;var h=S.j.q("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.Ok,a.Ti,a.Nk,T(22)),k=c(se,a.Ui,k-28),k=k+T(6),g={};S.l.ij(a.Vi,g);g.fontSize=T(18);k=b("CoolGames\nwww.coolgames.com",g,a.oh,k,a.Zf,T(44));C(X.I(),g);k+=T(58)+Math.min(0,d-T(368));g={};S.l.ij(a.Mk,g);g.fontSize=T(20);g.fillColor="#1A2B36";h=S.j.q("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.Ok,
k,a.Nk,T(22));k+=T(6);k=c(te,a.Ui,k);k+=T(12);g={};S.l.ij(a.Vi,g);g.fontSize=T(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.oh,k,a.Zf,T(22));k+=T(16);g={};S.l.ij(a.Vi,g);b("\u00a9 2020",g,a.oh,k,a.Zf,T(44));return[]};S.l.Dj=function(){return[]};S.l.Zc=function(){S.b.Zc()};
S.l.Tl=function(){function a(){__flagPokiInitialized?(function(){function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){ /*for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))  */})()}(),S.b.Zc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=S.a.w.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};S.l.jm=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};S.l.Ul=function(){PokiSDK.gameLoadingFinished();S.b.Zc()};
S.l.au=function(a){try{S.b.To(),rb("master"),PokiSDK.commercialBreak().then(function(){S.b.Gj();sb("master");a()})["catch"](function(a){console.log("error"+a);S.b.Gj();sb("master")})}catch(b){console.log("error"+b),S.b.Gj()}};S.l.Ms=function(){S.l.au(function(){PokiSDK.gameplayStart()})};S.l.Lh=function(){S.l.au(function(){S.b.Zc()})};S.l.lx=function(){PokiSDK.happyTime(.5)};S.l.Ls=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
S.l.ss=function(a,b){void 0===S.b.Ke&&(S.b.Ke=new Tf(!0));Uf(a,b)};S.l.Aq=function(a){void 0===S.b.Ke&&(S.b.Ke=new Tf(!0));Vf(a)};S.l.Cd=function(a){window.open(a)};S.l.Oe=function(a){"inGame"===a&&PokiSDK.gameplayStop()};S.l.iw=function(a){"inGame"===a&&PokiSDK.gameplayStart()};S.l.kx=function(){};S=S||{};S.fr=S.fr||{};S.fr.hB={qB:""};
function zj(){this.depth=-1E6;this.h=this.visible=!0;this.Ea=S.De;this.end=this.ra=this.cp=this.bp=this.load=this.lb=!1;this.ro=0;this.Fq=this.yk=!1;this.state="GAME_INIT";this.screen=null;this.Gt=this.ub=this.D=0;this.so=!1;this.hm=this.im=!0;this.sy=1;this.Fc=!1;this.Rc={};this.la={difficulty:1,playMusic:!0,playSFX:!0,language:S.j.Io()};window.addEventListener("gameSetPause",this.To,!1);window.addEventListener("gameResume",this.Gj,!1);document.addEventListener("visibilitychange",this.bx,!1);this.eh=
"timedLevelEvent"}e=zj.prototype;e.To=function(){I.pause("master");K.pause()};e.Gj=function(){I.bk("master");Cb(K);Hb(K);Lb(K);K.bk()};e.bx=function(){document.hidden?S.b.To():S.b.Gj()};
e.$e=function(){var a,b=this;void 0!==S.a.R.background&&void 0!==S.a.R.background.color&&(document.body.style.background=S.a.R.background.color);S.Ha=new bg;S.A.Yl&&S.A.Yl.h&&(b.dv=zh(function(a){b.dv=a}));S.m=S.a.K.sg||{};S.m.Wd=S.m.Wd||"level";S.m.bi=void 0!==S.m.bi?S.m.bi:"level"===S.m.Wd;S.m.ha=void 0!==S.m.ha?S.m.ha instanceof Array?S.m.ha:[S.m.ha]:[20];S.m.kj=void 0!==S.m.kj?S.m.kj:"locked";S.m.Rm=void 0!==S.m.Rm?S.m.Rm:"difficulty"===S.m.Wd;S.m.vk=void 0!==S.m.vk?S.m.vk:!1;S.m.bq=void 0!==
S.m.bq?S.m.bq:"level"===S.m.Wd;S.m.kg=void 0!==S.m.kg?S.m.kg:"max";S.m.Rg=void 0!==S.m.Rg?S.m.Rg:"number";S.l.ss(null,function(a){var d,g,h;a&&(b.Rc=a);b.la=dg("preferences",{});b.la.difficulty=void 0!==b.la.difficulty?b.la.difficulty:1;void 0!==S.m.Fu&&0>S.m.Fu.indexOf(sg())&&(b.la.difficulty=S.m.Fu[0]);b.la.playMusic=void 0!==b.la.playMusic?b.la.playMusic:!0;b.Ng(b.la.playMusic);b.la.playSFX=void 0!==b.la.playSFX?b.la.playSFX:!0;b.Em(b.la.playSFX);b.la.language=void 0!==b.la.language&&S.j.px(b.la.language)?
b.la.language:S.j.Io();S.j.Yt(b.la.language);void 0===Bg(b.D,0,"state",void 0)&&Aj(b.D,0,"state","unlocked");if(S.m.bi)if("locked"===S.m.kj)for(h=!1,d=0;d<S.m.ha.length;d++){for(a=0;a<S.m.ha[d];a++)if(g=Bg(d,a,"state","locked"),"locked"===g){b.D=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.la.lastPlayed&&(b.D=b.la.lastPlayed.world||0)});b.ti=Bj();void 0!==b.ti.authToken&&void 0!==b.ti.challengeId&&(b.Fc=!0);S.A.$C&&(this.bb=this.WC?new TestBackendServiceProvider:new BackendServiceProvider,
this.bb.Os(function(a){a&&S.b.bb.eC(b.ti.authToken)}));a=parseFloat(da.u.version);I.Sa&&(da.Oa.Gq&&da.u.tm||da.u.ji&&a&&4.4>a)&&(I.Kk=1);this.lb=!0;this.$l=0};function Bj(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function Cj(a){a.state="GAME_LOAD";a.screen=new mg(function(){S.b.load=!0;qh(S.b,!0);S.Od.Ul();S.l.Ul()},function(a){S.Od.jm(a);S.l.jm(a)},S.A.OC)}
function qh(a,b){a.yk=b||!1;a.Fq=!0;a.ro++}
function Dj(){var a=S.b;a.ro--;switch(a.state){case "GAME_INIT":a.lb&&!a.aD&&(a.Fc&&a.bb&&a.bb.RC(a.ti.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.aq&&a.screen.aq("challengeLoadingError_notValid")}),Cj(a));break;case "GAME_LOAD":if(a.load){if(a.Fc&&a.bb)if(a.bb.ox())qg(a),tg(a.sb.mode);else{a.screen.aq("challengeLoadingError_notStarted");break}M(K,a.screen);"function"===typeof yj&&(S.K=new yj);void 0!==S.A.rr&&!1!==S.A.rr.show&&S.c.Hv();ph(a)}break;case "LEVEL_INIT":a.bp&&Ej(a);
break;case "LEVEL_LOAD":a.cp&&Fj(a);break;case "LEVEL_END":if(a.ra)switch(oh(),S.b.bp=!1,S.b.cp=!1,S.xb=void 0,S.c.xg(S.Hh).T=!0,S.c.xg(S.Pl).T=!0,S.b.Vs){case "retry":xg(S.b,S.b.ub);break;case "next":S.m.bi?S.b.ub+1<S.m.ha[S.b.D]?xg(S.b,S.b.ub+1):S.b.D+1<S.m.ha.length?xg(S.b,0,S.b.D+1):S.m.bq?(S.b.state="GAME_END",S.b.end=!0,qh(S.b,!1),S.l.Xw()):S.b.screen=new wg:xg(S.b,0);break;case "exit":S.m.bi?S.b.screen=new wg:ph(S.b)}break;case "GAME_END":a.end&&(a.end=!1,S.b.screen=null,S.b.screen=new rh)}}
e.Zc=function(){S.b.Fq=!1};function jh(){var a;if(void 0!==S.b.ti.more_games)try{return a=decodeURIComponent(S.b.ti.more_games),function(){S.l.Cd(a)}}catch(b){}if("string"===typeof S.Wh.moreGamesUrl&&""!==S.Wh.moreGamesUrl)return function(){S.l.Cd(S.Wh.moreGamesUrl)};if(void 0!==S.A.my)return function(){S.l.Cd(S.A.my)};if("function"===typeof S.l.$w)return S.l.$w}function qg(a){if(a.Fc&&void 0!==a.bb)return void 0===a.sb&&(a.sb=a.bb.UB()),a.sb}e.xj=function(a){S.b.Fc&&S.b.bb&&S.b.bb.xj(a)};
e.xh=function(a){S.b.Fc&&S.b.bb&&S.b.bb.xh(a)};function sg(){return S.b.la.difficulty}function nh(){switch(sg()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+sg();}}function Ph(){var a="optionsDifficulty_"+nh();return S.j.q(a,"<"+a+">")}function tg(a){S.b.la.difficulty=a;fg("preferences",S.b.la)}e.Ng=function(a){void 0!==a&&(S.b.la.playMusic=a,fg("preferences",S.b.la),a?sb("music"):rb("music"));return S.b.la.playMusic};
e.Em=function(a){void 0!==a&&(S.b.la.playSFX=a,fg("preferences",S.b.la),a?(sb("game"),sb("sfx")):(rb("game"),rb("sfx")));return S.b.la.playSFX};e.language=function(a){void 0!==a&&(S.b.la.language=a,fg("preferences",S.b.la));return S.b.la.language};function uh(a){return"time"===S.m.Rg?(0>a?"-":"")+Math.floor(Math.abs(a)/60)+(10>Math.abs(a%60)?":0":":")+Math.abs(a%60):""+a}
function Aj(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===S.b.Rc["level_"+a+"_"+b]&&(S.b.Rc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?S.b.Rc["level_"+a+"_"+b][g]=d:S.b.Rc["level_"+a+"_"+b][g][c]=d;S.l.Aq(S.b.Rc)}function Bg(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=S.b.Rc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function dg(a,b){var c,d;"game"!==c&&(c="tg");d=S.b.Rc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}
function fg(a,b){var c;"game"!==c&&(c="tg");void 0===S.b.Rc.game&&(S.b.Rc.game={tg:{},game:{}});void 0===a?S.b.Rc.game[c]=b:S.b.Rc.game[c][a]=b;S.l.Aq(S.b.Rc)}function Ig(a,b,c){var d=S.b;void 0===b&&(b=d.ub);void 0===c&&(c=d.D);return void 0===a?Bg(c,b,"stats",{}):Bg(c,b,"stats",{})[a]}function Ah(){var a=Ig("highScore",void 0,void 0);return"number"!==typeof a?0:a}
function Gj(){var a,b,c,d=0;for(a=0;a<S.m.ha.length;a++)for(b=0;b<S.m.ha[a];b++)c=Ig(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function ph(a){a.screen&&M(K,a.screen);a.screen=new pg;a.ub=-1}
function ai(a,b,c,d){var g;g=void 0!==S.a.R.Lj&&void 0!==S.a.R.Lj.backgroundImage?S.a.R.Lj.backgroundImage:void 0!==S.a.w.Lj?S.a.w.Lj.backgroundImage:void 0;S.c.Kb(S.ug);a=a||0;b=b||0;c=c||m.width;d=d||m.height;if(g)if(c=Math.min(Math.min(c,m.width),g.gj),d=Math.min(Math.min(d,m.height),g.Ah),void 0!==g){var h=a,k=b-S.$k,l,n,q;for(l=0;l<g.G;l+=1)n=l%g.Th*g.width,q=g.height*Math.floor(l/g.Th),n>h+c||n+g.width<h||q>k+d||q+g.height<k||g.xa(l,h-n,k-q,c,d,a,b,1)}else xa(a,b,c,d,"white",!1)}
function xg(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.D=c);a.ub=b;a.bp=!0;qh(a,!1);S.l.Yw()}function Ej(a){a.state="LEVEL_LOAD";a.cp=!0;qh(a,!1);S.l.Zw()}
function Fj(a){var b;if(a.D<S.m.ha.length&&a.ub<S.m.ha[a.D]){a.state="LEVEL_PLAY";a.Gt+=1;a.ra=!1;a.screen=null;ai(0,S.$k);b=S.Ha;var c=mh(a,3),d="progression:levelStarted:"+nh(),g=a.eh,h;for(h=0;h<b.ea.length;h++)if(!b.ea[h].h){b.ea[h].k=0;b.ea[h].paused=0;b.ea[h].h=!0;b.ea[h].Dw=c;b.ea[h].Ry=d;b.ea[h].tag=g;break}h===b.ea.length&&b.ea.push({h:!0,k:0,paused:0,Dw:c,Ry:d,tag:g});b.Va(c,d,void 0,S.ia.Ac.Pq);b.Va("Start:","progression:levelStart:"+c,void 0,S.ia.Ac.Bk);for(b=0;b<a.D;b++);S.l.Ms(a.D,a.ub);
a.la.lastPlayed={world:a.D,level:a.ub};S.xb=new Gi}}function Cg(a,b,c){var d=0;void 0===b&&(b=a.D);void 0===c&&(c=a.ub);for(a=0;a<b;a++)d+=S.m.ha[a];return d+c}function Mi(a,b,c,d){new sh(a,b,c,d)}function Li(a,b){var c=S.b;c.Fc&&(c.sb.$c!==c.sb.kf||S.A.gw&&S.A.gw.NC)?new th("challengeStartTextScore",a,b):"function"===typeof a&&(b?b.S():a())}function mh(a,b){var c,d=a.ub+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function Pi(a,b){var c,d,g,h,k;a.Fc?(b=Math.floor(b),a.sb.kf===a.sb.$c?(d=function(b){a.ec&&"function"===typeof a.ec.Hd&&(b?(a.ec.Hd(S.j.q("challengeEndScreenChallengeSend_success","<CHALLENGESENDTEXT>")),a.sb.yu?ch(a.ec,S.j.q("challengeEndScreenChallengeSend_submessage_stranger","")):(k=a.sb.Dd[1],k=13<k.length?k.substr(0,10)+"...":k,ch(a.ec,S.j.q("challengeEndScreenChallengeSend_submessage","<CHALLENGESENDSUBMESSAGE>").replace(/<NAME>/g,k)))):a.ec.Hd(S.j.q("challengeEndScreenChallengeSend_error",
"<CHALLENGESENDERROR>")))},h=function(b){b?a.ec.Hd(S.j.q("challengeCancelMessage_success","<CHALLENGECANCELSUCCESS>")):a.ec.Hd(S.j.q("challengeCancelMessage_error","<CHALLENGECANCELERROR>"))},c=function(){a.bb&&a.bb.xh(h)}):(d=function(b){a.ec&&"function"===typeof a.ec.Hd&&(b||a.ec.Hd(S.j.q("challengeEndScreenScoreSend_error","<CHALLENGESCORESENDERROR>")))},g=function(b){a.ec&&"function"===typeof a.ec.bv&&a.ec.bv(b)}),a.state="LEVEL_END",a.ec=new bh(b,function(){a.bb&&a.bb.TC(b,S.m.Rg,d,g)},c)):Qi(a,
{totalScore:b})}
function Qi(a,b){function c(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===S.m.kg&&a>b||"min"===S.m.kg&&a<b?!0:!1}a.state="LEVEL_END";var d,g,h,k,l,n,q={},t=mh(a,3);b=b||{};b.level=S.m.vk?a.ub+1:Cg(a)+1;b.Js=!1;g=(d=Bg(a.D,a.ub,"stats",void 0))||{};if(void 0!==b.Sd||void 0!==b.zb){void 0!==b.Sd&&(q[b.Sd.id]=b.Sd.I(),"highScore"===b.Sd.id&&(n=b.Sd));if(void 0!==b.zb)for(k=0;k<b.zb.length;k++)q[b.zb[k].id]=b.zb[k].I(),"highScore"===b.zb[k].id&&(n=b.zb[k]);for(k in q)l=q[k],void 0!==
l.Sf&&(q[l.Vm].Ic=l.Sf(q[l.Vm].Ic));void 0!==q.totalScore&&(h=q.totalScore.Ic)}else h=b.totalScore,void 0!==h&&void 0!==b.timeBonus&&(h+=b.timeBonus);k="";if(!0!==b.failed){k="Complete:";if(void 0!==h){S.Ha.Va(k,"level:"+t,h,S.ia.Ac.Bk);if(void 0===d||c(h,d.highScore))g.highScore=h,b.Js=!0,S.Ha.Va("highScore",":score:"+nh()+":"+t,h,S.ia.Ac.pn);void 0!==n&&(n.Ic=g.highScore);b.highScore=g.highScore}if(void 0!==b.stars){if(void 0===g.stars||g.stars<b.stars)g.stars=b.stars;S.Ha.Va("stars",":score:"+
nh()+":"+t,b.stars,S.ia.Ac.pn)}a.ub+1<S.m.ha[a.D]?"locked"===Bg(a.D,a.ub+1,"state","locked")&&Aj(a.D,a.ub+1,"state","unlocked"):a.D+1<S.m.ha.length&&"locked"===Bg(a.D+1,0,"state","locked")&&Aj(a.D+1,0,"state","unlocked");Aj(a.D,a.ub,void 0,{stats:g,state:"played"});void 0!==a.bb&&(d=S.K&&S.K.Qw?S.K.Qw():Gj(),void 0!==d&&a.bb.UC(d,S.m.Rg));hg(S.Ha,a.eh,t,"progression:levelCompleted:"+nh())}else S.Ha.Va("Fail:","level:"+t,h,S.ia.Ac.Bk),hg(S.Ha,a.eh,t,"progression:levelFailed:"+nh());var A={totalScore:h,
level:b.level,highScore:b.highScore,failed:!0===b.failed,stars:b.stars,stage:b.stage};h=function(a){S.b.ra=!0;S.b.Vs=a;qh(S.b,!0);S.l.Lh(A);S.Od.Lh(A)};S.l.lo&&S.l.lo();void 0===b.customEnd&&(a.ec=new Jg(S.m.Wd,b,h))}e.di=function(){S.b.Oe(!0)};e.Oe=function(a,b,c){var d="inGame";S.b.screen instanceof pg?d="startScreen":S.b.screen instanceof wg?d="levelMapScreen":b&&(d=S.b.sb.$c===S.b.sb.kf?"inGame_challenger":"inGame_challengee");S.b.re||(S.b.re=new gh(d,!0===a,b,c))};
function fi(a){var b=[],c,d,g,h,k;S.b.re||S.b.df||(S.b.sb.$c===S.b.sb.kf?(c=S.j.q("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",g="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=S.j.q(b,"<"+b.toUpperCase()+"<");S.b.df&&wh(b);a&&Wg()},h=function(){S.b.xh(k);return!0}):(c=S.j.q("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",g="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=S.j.q(b,"<"+b.toUpperCase()+"<");if(S.b.df&&(wh(b),a)){var b=S.j.q("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",S.b.sb.Dd[S.b.sb.kf]),b=b.replace("<AMOUNT>",S.b.sb.nv),c=S.b.df,d,g,h,k;d=X.I();c.a.nq&&C(d,c.a.nq);g=Wa(d,b,c.a.dz,c.a.cz,!0);g<d.fontSize&&D(d,g);g=d.da(b,c.a.Np)+10;h=d.W(b,c.a.Mp)+10;k=S.c.ka(c.a.ez,c.d.e.width,g,d.align);h=S.c.ka(c.a.fz,c.d.e.height-vh(c),h,d.i);x(c.d.e);d.p(b,
k,h,g);y(c.d.e)}a&&Wg()},h=function(){S.b.xj(k);return!0}),b.push({L:d,S:h,fa:S.b}),b.push({L:g,S:function(){S.b.df.close();S.b.df=null;return!0}}),S.b.df=new fh(c,b,a),S.b.re=S.b.df)}e.Gp=function(){var a,b;b=Tb(K,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].Uo&&b[a].Uo();ig();Ub("game");Mb()};function Wg(a){var b,c;c=Tb(K);for(b=0;b<c.length;b++)"function"===typeof c[b].Uo&&c[b].Uo();Ub();Mb();ig();a&&(a.N=Math.max(0,a.N-1));Vb("system")}
function ah(){var a,b;b=Tb(K);for(a=0;a<b.length;a++)"function"===typeof b[a].ax&&b[a].ax();Vb();a=K;for(b=0;b<a.Ze.length;b+=1)a.Ze[b].paused=Math.max(0,a.Ze[b].paused-1);a=S.Ha;b=S.b.eh;var c;for(c=0;c<a.ea.length;c++)void 0!==a.ea[c]&&a.ea[c].tag===b&&(a.ea[c].paused-=1,a.ea[c].paused=Math.max(a.ea[c].paused,0))}function oh(){var a;S.xb&&M(K,S.xb);for(a=Tb(K,"LevelStartDialog");0<a.length;)M(K,a.pop())}
function gg(){var a="";S.version.builder&&(a=S.version.builder);S.version.tg&&(a+="-"+S.version.tg);S.version.game&&(a+="-"+S.version.game);S.version.config&&(a+="-"+S.version.config);return a}e.cc=function(){this.lb||(this.$e(),qh(S.b,!0),S.Od.Tl(),S.l.Tl())};
e.V=function(a){"function"===typeof this.os&&(this.os(),this.os||S.b.Zc());0<this.ro&&(this.yk||this.Fq||Dj());700>this.$l&&(this.$l+=a,700<=this.$l&&(S.A.ZC&&void 0!==S.A.yj&&S.A.yj.Kl&&S.A.yj.Om&&S.Ha.start([S.A.yj.Kl,S.A.yj.Om]),void 0===Bg(this.D,0,"state",void 0)&&Aj(this.D,0,"state","unlocked")))};e.jd=function(a,b){"languageSet"===a&&S.b.language(b)};e.Xd=function(){var a,b;for(a=0;a<S.te.length;a++)b=S.te[a],b.T&&(m.Kb(b),m.clear())};
e.qa=function(){var a;for(a=0;a<S.te.length;a++)S.te[a].T=!1};S.Wz=function(){S.b=new zj;L(S.b);Sb(S.b,"system")};(void 0===S.Lv||S.Lv)&&S.l.Ww();zj.prototype.Oe=function(a,b,c){var d="inGame";S.b.screen instanceof pg?d="startScreen":S.b.screen instanceof wg?d="levelMapScreen":b&&(d=S.b.sb.$c===S.b.sb.kf?"inGame_challenger":"inGame_challengee");S.l.Oe(d);S.b.re||(S.b.re=new gh(d,!0===a,b,c))};gh.prototype.close=function(){M(K,this);this.canvas.T=!0;S.l.iw(this.type);return!0};
ab.prototype.de=function(a,b){var c,d,g,h=1,k=fb(this,a);this.Ta[a]=b;this.Dc[a]&&delete this.Dc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ta.indexOf(a)){for(g=0;g<d.ta.length;g+=1)void 0!==this.Ta[d.ta[g]]&&(h*=this.Ta[d.ta[g]]);h=Math.round(100*h)/100;if(this.$a){if(d=this.ne[d.id])d.gain.value=h}else this.Sa&&(d.H.volume=h)}this.$a&&(d=this.ne[a])&&(d.gain.value=b)};
}());
