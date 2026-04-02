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
var e,aa=document.getElementById("canvasBackground"),ba="game_pyramid_solitaire theme_pyramids big gameui_difficulty endscreen_difficulty landscape poki_api final".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var m=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.q={};this.La={};this.vf={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.q.opera=!0,this.q.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.La.wp=!0,this.q.Yk=!0,this.q.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.q.Yk=!0,this.q.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.q.Vm=!0,this.q.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.q.chrome=!0,this.q.version=f(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.q.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.q.KA=!0,this.q.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.q.ZA=!0,this.q.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.q.Rq=!0,this.q.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.La.mz=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.q.Is=!0,this.q.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.q.mh=!0,this.q.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.q.rA=!0,this.q.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.q.eq=!0,this.q.version=c||
f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.q.Qt=!0,this.q.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.vf.qB=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.q.cq=!0,this.q.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.q.hy=!0,this.q.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name=
"Safari",this.q.Io=!0,this.q.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.q.vB=!0,!this.q.version&&c&&(this.q.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.q.tz=!0,this.q.version=this.q.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.Is?this.La.By=!0:a&&(this.La.Fk=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.wp?c=f(this,
/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.Qt?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.eq?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.cq?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.hy&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.La.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.Is)this.vf.jt=!0;else if(g||"iphone"==a||"ipod"==a||b||this.eq||this.Qt||this.cq)this.vf.ds=!0;this.Ee={Vh:!1,li:!1,x:!1};this.Yk&&10<=this.q.version||this.chrome&&20<=this.q.version||
this.Rq&&20<=this.q.version||this.Io&&6<=this.q.version||this.opera&&10<=this.q.version||this.Fk&&this.La.version&&6<=this.La.version.split(".")[0]?this.Ee.Vh=!0:this.Yk&&10>this.q.version||this.chrome&&20>this.q.version||this.Rq&&20>this.q.version||this.Io&&6>this.q.version||this.opera&&10>this.q.version||this.Fk&&this.La.version&&6>this.La.version.split(".")[0]?this.Ee.li=!0:this.Ee.x=!0;try{this.q.ne=this.q.version?parseFloat(this.q.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.q.ne=0}try{this.La.ne=
this.La.version?parseFloat(this.La.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.La.ne=0}};function p(a,b){this.x=a;this.y=b}function da(a){return Math.sqrt(a.x*a.x+a.y*a.y)}e=p.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.M=function(){return new p(this.x,this.y)};e.add=function(a){return new p(this.x+a.x,this.y+a.y)};function ea(a,b){return new p(a.x-b.x,a.y-b.y)}e.scale=function(a){return new p(a*this.x,a*this.y)};
e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new p(a*this.x+b*this.y,-b*this.x+a*this.y)};e.normalize=function(){var a=da(this);return 0===a?new p(0,0):new p(this.x/a,this.y/a)};function fa(a){return(new p(a.y,-a.x)).normalize()}
e.ib=function(a,b,c){var d=Math.min(8,this.length()/4),g=ea(this,this.normalize().scale(2*d)),h=g.add(fa(this).scale(d)),d=g.add(fa(this).scale(-d)),k=w.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function ga(a){this.Ui=4294967296;this.Vh=1664525;this.li=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Ui-1)):a}
ga.prototype.M=function(){var a=new ga;a.Ui=this.Ui;a.Vh=this.Vh;a.li=this.li;a.state=this.state;return a};ga.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Vh*this.state+this.li)%this.Ui;return this.state/this.Ui*b};var ha=new ga;function ia(){this.qe="";this.fm=[];this.Uh=[];this.df=[];this.lg=[];this.zc=[];this.xa("start");this.xa("load");this.xa("game")}function ja(a){var b=ka;b.qe=a;""!==b.qe&&"/"!==b.qe[b.qe.length-1]&&(b.qe+="/")}e=ia.prototype;
e.xa=function(a){this.zc[a]||(this.Uh[a]=0,this.df[a]=0,this.lg[a]=0,this.zc[a]=[],this.fm[a]=!1)};e.loaded=function(a){return this.zc[a]?this.df[a]:0};e.Ic=function(a){return this.zc[a]?this.lg[a]:0};e.complete=function(a){return this.zc[a]?this.df[a]+this.lg[a]===this.Uh[a]:!0};function la(a){var b=ka;return b.zc[a]?100*(b.df[a]+b.lg[a])/b.Uh[a]:100}function ma(a){var b=ka;b.df[a]+=1;b.complete(a)&&na("Load Complete",{ab:a})}function oa(a){var b=ka;b.lg[a]+=1;na("Load Failed",{ab:a})}
function pa(a,b,c){var d=ka;d.zc[b]||d.xa(b);d.zc[b].push(a);d.Uh[b]+=c}e.Ad=function(a){var b;if(!this.fm[a])if(this.fm[a]=!0,this.zc[a]&&0!==this.zc[a].length)for(b=0;b<this.zc[a].length;b+=1)this.zc[a][b].Ad(a,this.qe);else na("Load Complete",{ab:a})};var ka=new ia;function qa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.ob(a)}qa.prototype.ob=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};
qa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function ra(a,b,c,d,g,h){var k=w;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function sa(a,b,c,d){var g=w;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,d);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
qa.prototype.lc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};qa.prototype.ha=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var w=new qa(aa);function ta(a,b,c){this.name=a;this.L=b;this.Qv=c;this.Bc=[];this.an=[];pa(this,this.Qv,this.L)}ta.prototype.Ad=function(a,b){function c(){oa(a)}function d(){ma(a)}var g,h;for(g=0;g<this.Bc.length;g+=1)h=this.an[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.Bc[g].src=h,this.Bc[g].addEventListener("load",d,!1),this.Bc[g].addEventListener("error",c,!1)};
ta.prototype.complete=function(){var a;for(a=0;a<this.Bc.length;a+=1)if(!this.Bc[a].complete||0===this.Bc[a].width)return!1;return!0};function ua(a,b,c){0<=b&&b<a.L&&(a.Bc[b]=new Image,a.an[b]=c)}ta.prototype.d=function(a,b){0<=a&&a<this.L&&(this.Bc[a]=b,this.an[a]="")};ta.prototype.ua=function(a,b,c,d,g,h,k,l,n){this.Bc[a]&&this.Bc[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&w.context.drawImage(this.Bc[a],b,c,d,g,h,k,l,n))};
function x(a,b,c,d,g,h,k,l,n,q){this.name=a;this.We=b;this.L=c;this.width=d;this.height=g;this.Db=h;this.Eb=k;this.oi=l;this.Bg=n;this.Yg=q;this.Re=[];this.Se=[];this.Te=[];this.he=[];this.ge=[];this.ie=[];this.je=[]}e=x.prototype;e.d=function(a,b,c,d,g,h,k,l){0<=a&&a<this.L&&(this.Re[a]=b,this.Se[a]=c,this.Te[a]=d,this.he[a]=g,this.ge[a]=h,this.ie[a]=k,this.je[a]=l)};e.complete=function(){return this.We.complete()};
e.r=function(a,b,c){a=(Math.round(a)%this.L+this.L)%this.L;this.We.ua(this.Re[a],this.Se[a],this.Te[a],this.he[a],this.ge[a],b-this.Db+this.ie[a],c-this.Eb+this.je[a])};e.Yc=function(a,b,c,d){var g=w.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.L+this.L)%this.L;this.We.ua(this.Re[a],this.Se[a],this.Te[a],this.he[a],this.ge[a],b-this.Db+this.ie[a],c-this.Eb+this.je[a]);g.globalAlpha=h};
e.V=function(a,b,c,d,g,h,k){var l=w.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.L+this.L)%this.L,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,g),l.globalAlpha=k,this.We.ua(this.Re[a],this.Se[a],this.Te[a],this.he[a],this.ge[a],this.ie[a]-this.Db,this.je[a]-this.Eb),l.restore())};
e.ua=function(a,b,c,d,g,h,k,l){var n=w.context,q=n.globalAlpha,v,D,F,r;a=(Math.round(a)%this.L+this.L)%this.L;v=this.ie[a];D=this.je[a];F=this.he[a];r=this.ge[a];b-=v;c-=D;0>=b+d||0>=c+g||b>=F||c>=r||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>F&&(d=F-b),c+g>r&&(g=r-c),n.globalAlpha=l,this.We.ua(this.Re[a],this.Se[a]+b,this.Te[a]+c,d,g,h,k),n.globalAlpha=q)};
e.Tm=function(a,b,c,d,g,h,k,l,n,q,v,D){var F,r,s,t,u,L,ca,P,X,xa;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),F=Math.ceil((q-b)/h),r=Math.ceil((v-c)/k),b+=l,c+=n,X=0;X<F;X+=1)for(xa=0;xa<r;xa+=1)u=d,L=g,ca=h,P=k,s=b+X*h,t=c+xa*k,s<l&&(u+=l-s,ca-=l-s,s=l),s+ca>=l+q&&(ca=l+q-s),t<n&&(L+=n-t,P-=n-t,t=n),t+P>=n+v&&(P=n+v-t),0<ca&&0<P&&this.ua(a,u,L,ca,P,s,t,D)};e.fk=function(a,b,c,d,g,h,k,l,n,q){this.Tm(a,0,0,b,c,d,g,h,k,l,n,q)};
e.ek=function(a,b,c,d,g,h,k,l,n,q){var v=w.context,D=v.globalAlpha,F,r,s,t,u,L;a=(Math.round(a)%this.L+this.L)%this.L;F=l/d;r=n/g;s=this.ie[a];t=this.je[a];u=this.he[a];L=this.ge[a];b-=s;c-=t;0>=b+d||0>=c+g||b>=u||c>=L||(0>b&&(d+=b,l+=F*b,h-=F*b,b=0),0>c&&(g+=c,n+=r*c,k-=r*c,c=0),b+d>u&&(l-=F*(d-u+b),d=u-b),c+g>L&&(n-=r*(g-L+c),g=L-c),v.globalAlpha=q,this.We.ua(this.Re[a],this.Se[a]+b,this.Te[a]+c,d,g,h,k,l,n),v.globalAlpha=D)};
function va(a,b,c){var d,g,h;for(d=0;d<a.L;d+=1)g=b+d%a.Yg*a.width,h=c+a.height*Math.floor(d/a.Yg),a.We.ua(a.Re[d],a.Se[d],a.Te[d],a.he[d],a.ge[d],g-a.Db+a.ie[d],h-a.Eb+a.je[d])}function y(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Eb=this.Db=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.$k=void 0}e=y.prototype;
e.M=function(){var a=new y(this.width,this.height);a.Db=this.Db;a.Eb=this.Eb;z(a);this.r(0,0);A(a);return a};function z(a){a.$k=w.canvas;w.ob(a.canvas)}function A(a){w.canvas===a.canvas&&void 0!==a.$k&&(w.ob(a.$k),a.$k=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.r=function(a,b){w.context.drawImage(this.canvas,a-this.Db,b-this.Eb)};
e.Yc=function(a,b,c){var d=w.context,g=d.globalAlpha;d.globalAlpha=c;w.context.drawImage(this.canvas,a-this.Db,b-this.Eb);d.globalAlpha=g};e.V=function(a,b,c,d,g,h){var k=w.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,w.context.drawImage(this.canvas,-this.Db,-this.Eb),k.restore())};
e.ua=function(a,b,c,d,g,h,k){var l=w.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,w.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),l.globalAlpha=n)};
e.Tm=function(a,b,c,d,g,h,k,l,n,q,v){var D,F,r,s,t,u,L,ca,P,X;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),D=Math.ceil((n-a)/g),F=Math.ceil((q-b)/h),a+=k,b+=l,P=0;P<D;P+=1)for(X=0;X<F;X+=1)t=c,u=d,L=g,ca=h,r=a+P*g,s=b+X*h,r<k&&(t+=k-r,L-=k-r,r=k),r+L>=k+n&&(L=k+n-r),s<l&&(u+=l-s,ca-=l-s,s=l),s+ca>=l+q&&(ca=l+q-s),0<L&&0<ca&&this.ua(t,u,L,ca,r,s,v)};
e.fk=function(a,b,c,d,g,h,k,l,n){this.Tm(0,0,a,b,c,d,g,h,k,l,n)};e.ek=function(a,b,c,d,g,h,k,l,n){var q=w.context,v=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,w.context.drawImage(this.canvas,a,b,c,d,g,h,k,l),q.globalAlpha=v))};
function wa(a,b,c,d){this.jb=a;this.xy=b;this.oy=c;this.Dj=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.et=!1;pa(this,d,1)}function ya(a,b,c){w.context.save();w.context.font="250pt "+a+", "+b;a=w.context.measureText(c).width;w.context.restore();return a}
function za(a){var b,c,d;for(b=0;b<a.Dj.length;b+=1)if(c=a.Dj[b],d=ya(a.jb,c.font,c.text),c.width!==d){ma(a.Pv);document.body.removeChild(a.oe);a.et=!0;return}window.setTimeout(function(){za(a)},33)}
wa.prototype.Ad=function(a,b){var c="@font-face {font-family: "+this.jb+";src: url('"+b+this.xy+"') format('woff'), url('"+b+this.oy+"') format('truetype');}",d=document.createElement("style");d.id=this.jb+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.oe=document.createElement("span");this.oe.style.position="absolute";this.oe.style.left="-9999px";this.oe.style.top="-9999px";this.oe.style.visibility=
"hidden";this.oe.style.fontSize="250pt";this.oe.id=this.jb+"_loader";document.body.appendChild(this.oe);for(c=0;c<this.Dj.length;c+=1)d=this.Dj[c],d.width=ya(d.font,d.font,d.text);this.Pv=a;za(this)};wa.prototype.complete=function(){return this.et};
function B(a,b){this.jb=a;this.yi=b;this.fontWeight=this.fontStyle="";this.ud="normal";this.fontSize=12;this.fill=!0;this.wf=1;this.Jc=0;this.fillColor="black";this.$c={f:void 0,qb:0,Eo:!0,Fo:!0};this.$a={wj:!0,L:3,$j:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.ag=1;this.nh=0;this.strokeColor="black";this.strokeStyle=void 0;this.$b=1;this.kd=!1;this.fe="miter";this.P={i:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.j="top";
this.ja=this.Aa=0}e=B.prototype;
e.M=function(){var a=new B(this.jb,this.yi);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.ud=this.ud;a.fontSize=this.fontSize;a.fill=this.fill;a.wf=this.wf;a.Jc=this.Jc;a.fillColor=this.fillColor;a.$c={f:this.$c.f,Eo:this.$c.Eo,Fo:this.$c.Fo};a.$a={wj:this.$a.wj,L:this.$a.L,$j:this.$a.$j.slice(0),size:this.$a.size,offset:this.$a.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.ag=this.ag;a.nh=this.nh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.$b=this.$b;a.kd=
this.kd;a.fe=this.fe;a.P={i:this.P.i,color:this.P.color,offsetX:this.P.offsetX,offsetY:this.P.offsetY,blur:this.P.blur};a.align=this.align;a.j=this.j;a.Aa=this.Aa;a.ja=this.ja;return a};
function C(a,b){void 0!==b.jb&&(a.jb=b.jb);void 0!==b.yi&&(a.yi=b.yi);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.ud&&(a.ud=b.ud);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.wf&&(a.wf=b.wf);void 0!==b.fillColor&&(a.Jc=0,a.fillColor=b.fillColor);void 0!==b.$c&&(a.Jc=1,a.$c=b.$c);void 0!==b.$a&&(a.Jc=2,a.$a=b.$a);void 0!==b.fillStyle&&(a.Jc=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.ag&&(a.ag=b.ag);void 0!==b.strokeColor&&(a.nh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.nh=3,a.strokeStyle=b.strokeStyle);void 0!==b.$b&&(a.$b=b.$b);void 0!==b.kd&&(a.kd=b.kd);void 0!==b.fe&&(a.fe=b.fe);void 0!==b.P&&(a.P=b.P);void 0!==b.align&&(a.align=b.align);void 0!==b.j&&(a.j=b.j);void 0!==b.Aa&&(a.Aa=b.Aa);void 0!==b.ja&&(a.ja=b.ja)}function Aa(a,b){a.fontWeight=void 0===b?"":b}function E(a,b){a.fontSize=void 0===b?12:b}
function Ba(a,b){a.wf=void 0===b?1:b}e.setFillColor=function(a){this.Jc=0;this.fillColor=void 0===a?"black":a};function Ca(a,b,c,d,g){a.Jc=2;a.$a.wj=!0;a.$a.L=b;a.$a.$j=c.slice(0);a.$a.size=void 0===d?.6:d;a.$a.offset=void 0===g?0:g}function Da(a,b){a.stroke=void 0===b?!1:b}function Ea(a,b){a.ag=void 0===b?1:b}e.setStrokeColor=function(a){this.nh=0;this.strokeColor=void 0===a?"black":a};function Fa(a,b){a.$b=void 0===b?1:b}function Ga(a,b){a.kd=void 0===b?!1:b}
function Ha(a,b){a.fe=void 0===b?"miter":b}function Ia(a,b,c){void 0===b?a.P.i=!0:a.P={i:!0,color:b,offsetX:0,offsetY:c,blur:2}}function G(a,b){a.align=void 0===b?"left":b}function H(a,b){a.j=void 0===b?"top":b}function Ja(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.jb+", "+a.yi}function Ka(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Ma(a,b){return a.fontSize*b.length+a.ja*(b.length-1)}
function Na(a,b,c){var d,g,h,k,l,n,q=[],v=w.context;v.font=Ja(a);switch(a.ud){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:v.measureText(n[a]).width});return q}n=b.split("\n");h=v.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];l=v.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=v.measureText(g[b]).width,l+h+k<c?(d+=" "+g[b],l+=h+k):(q.push({text:d,width:l}),d=g[b],l=k);
q.push({text:d,width:l})}return q}e.ha=function(a,b){var c;w.context.save();c=Ka(Na(this,a,b));w.context.restore();return c};e.U=function(a,b){var c;w.context.save();c=Ma(this,Na(this,a,b));w.context.restore();return c};function Oa(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?Na(a,c,d):Na(a,c);d=Ka(b)<=d&&Ma(a,b)<=g;a.fontSize=k;return d}
function Pa(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(w.context.save();Oa(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Oa(a,h+k,b,c,d,g)&&(h+=k);w.context.restore();return Math.max(4,h)}function Qa(a,b,c,d,g){var h=Math.max(.01,a.$a.size),k=a.$a.offset;a.$a.wj?(k=g/2+k*g,h=.5*h*g,b=w.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=w.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.$a.L-1);for(d=0;d<a.$a.L;d+=1)b.addColorStop(d*c,a.$a.$j[d]);return b}
function Ra(a,b,c,d,g,h,k){var l,n;!a.fill&&a.P.i?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.ag;switch(a.nh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.$b;b.lineJoin=a.fe;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.ja*k;b.strokeText(c[k].text,d+l,g+n)}}
function Sa(a,b,c,d,g,h,k){c=Na(a,c,k);k=Ka(c);var l=Ma(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.j){case "base":case "bottom":g+=-l+Math.round(a.Aa*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.Aa*a.fontSize/2)}b.font=Ja(a);a.stroke&&a.kd&&Ra(a,b,c,d,g,k,h);if(a.fill){var n=d,q=g,v,D;a.P.i?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.wf;switch(a.Jc){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.$c.f;D=new y(l.width,l.height);var F=a.$c.Eo,r=a.$c.Fo;F&&r?v="repeat":F&&!r?v="repeat-x":!F&&r?v="repeat-y":F||r||(v="no-repeat");z(D);l.r(a.$c.qb,0,0);A(D);v=w.context.createPattern(D.canvas,v);b.fillStyle=v;break;case 2:b.fillStyle=Qa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(v=0;v<c.length;v+=1){l=0;switch(a.align){case "right":l=
k-c[v].width;break;case "center":l=(k-c[v].width)/2}D=a.fontSize*(v+1)+a.ja*v;2===a.Jc&&a.$a.wj&&(b.fillStyle=Qa(a,n,q+D-a.fontSize,k,a.fontSize));b.fillText(c[v].text,n+l,q+D)}}a.stroke&&!a.kd&&Ra(a,b,c,d,g,k,h)}e.r=function(a,b,c,d){var g=w.context;this.fill&&1===this.Jc?this.V(a,b,c,1,1,0,1,d):(g.save(),Sa(this,g,a,b,c,1,d),g.restore())};e.Yc=function(a,b,c,d,g){var h=w.context;this.fill&&1===this.Jc?this.V(a,b,c,1,1,0,d,g):(h.save(),Sa(this,h,a,b,c,d,g),h.restore())};
e.V=function(a,b,c,d,g,h,k,l){var n=w.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Sa(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Ta(){this.ew=10;this.Hj=-1;this.cu="stop_lowest_prio";this.Zp=this.Qa=this.bb=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.bb=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Qa=!0)}catch(d){}this.Zp=this.bb||this.Qa;this.Qa&&m.q.mh&&(this.Hj=1);if(this.Zp)try{a=new Audio,this.Ip={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Ip={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.ac=[];this.cf={};this.Ra={};this.jc={};this.Fd=
[];this.ic=0;this.bb?(this.Ed=new c,this.Jp="function"===typeof this.Ed.createGain?function(){return b.Ed.createGain()}:"function"===typeof this.Ed.createGainNode?function(){return b.Ed.createGainNode()}:function(){},this.Gd={},this.Gj=this.Jp(),void 0===this.Gj?(this.Qa=!0,this.Gh=Ta.prototype.em):(this.Gj.connect(this.Ed.destination),this.Gd.master=this.Gj,this.Gh=Ta.prototype.bu)):this.Gh=this.Qa?Ta.prototype.em:function(){}}
function Ua(a){var b=I,c,d,g,h,k;for(c=0;c<b.ac.length;c+=1)if((d=b.ac[c])&&0===d.$m)if(d.paused)d.Np&&(d.gm+=a,d.gm>=d.Np&&b.ej(d.id));else if(d.hm+=a,d.kg&&d.hm>=d.Ss)d.kg=!1,Va(b,d,d.Id);else if(d.yd&&b.Qa&&b.Ib(d.id)>=d.duration)if(d.fo)try{d.F.pause(),d.F.currentTime=d.Id/1E3,4===d.F.readyState?d.F.play():(g=function(){var a=d;return{ready:function(){a.F.play();a.F.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.F.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else d.F.pause(),
Wa(d);for(c=b.Fd.length-1;0<=c;c-=1)h=b.Fd[c],b.xr(h.id)||0!==h.$m||(h.p+=a,h.p>=h.duration?(I.zd(h.id,h.oj),void 0!==b.jc[h.id]&&(b.jc[h.id]=h.oj),h.Gb&&h.Gb(),b.Fd.splice(c,1)):(k=h.Wa(h.p,h.start,h.oj-h.start,h.duration),I.zd(h.id,k),void 0!==b.jc[h.id]&&(b.jc[h.id]=k)))}function Xa(a,b){a.cf[b.Nb.s.name]?a.cf[b.Nb.s.name].length<a.ew&&a.cf[b.Nb.s.name].push(b.F):a.cf[b.Nb.s.name]=[b.F]}
function Ya(a,b){var c,d,g;g=[];for(c=0;c<a.ac.length;c+=1)(d=a.ac[c])&&0<=d.pa.indexOf(b)&&g.push(d);return g}function Za(a,b){if(0<a.Hj&&a.ic>=a.Hj)switch(a.cu){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.ac.length;c+=1)(d=a.ac[c])&&d.yd&&!d.paused&&(void 0===g||g.nl<d.nl)&&(g=d);if(g.nl>b.Qh){a.stop(g.id);break}return!1}return!0}
function $a(a,b){var c,d=1;for(c=0;c<b.pa.length;c+=1)void 0!==I.Ra[b.pa[c]]&&(d*=I.Ra[b.pa[c]]);c=a.Jp();c.gain.value=d;c.connect(a.Gj);a.Gd[b.id]=c;b.F.connect(c)}function ab(a,b){b.F.disconnect(0);a.Gd[b.id]&&(a.Gd[b.id].disconnect(0),delete a.Gd[b.id])}function bb(a,b){var c;if(b.s&&b.s.Rb){if(a.bb)return c=a.Ed.createBufferSource(),c.buffer=b.s.Rb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Qa)return c=b.s.Rb.cloneNode(!0),c.volume=0,c}}
function cb(a,b){var c,d;if(a.bb)(c=bb(a,b))&&(d=new db(b,c));else if(a.Qa){c=a.cf[b.s.name];if(!c)return;0<c.length?d=new db(b,c.pop()):(c=bb(a,b))&&(d=new db(b,c))}if(d){a.bb&&$a(a,d);for(c=0;c<a.ac.length;c+=1)if(void 0===a.ac[c])return a.ac[c]=d;a.ac.push(d)}return d}function eb(a){var b=I,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Ip[d])return a[c];return!1}e=Ta.prototype;
e.em=function(a,b,c){function d(){var b;a.loaded=!0;ma(c);a.duration=Math.ceil(1E3*a.Rb.duration);a.Rb.removeEventListener("canplaythrough",d,!1);a.Rb.removeEventListener("error",g,!1);b=a.Rb.cloneNode(!0);I.cf[a.name].push(b)}function g(){oa(c)}(b=eb(b))?(a.Rb=new Audio,a.Rb.src=b,a.Rb.autoplay=!1,a.Rb.uA="auto",a.Rb.addEventListener("canplaythrough",d,!1),a.Rb.addEventListener("error",g,!1),a.Rb.load()):g()};
e.bu=function(a,b,c){var d=eb(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){I.Ed.decodeAudioData(g.response,function(b){b&&(a.Rb=b,a.duration=1E3*b.duration,a.loaded=!0,ma(c))},function(){oa(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(I.bb=!1,I.Qa=!0,I.Gh=Ta.prototype.em,I.Gh(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof J){if(Za(this,a)){a=cb(this,a);if(!a)return-1;a.Ss=b||0;a.kg=0<b;a.xb=c||0;a.Pd=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.kg||Va(this,a,a.Id);return a.id}return-1}};
function Va(a,b,c){var d;"number"!==typeof c&&(c=0);fb(a,b.id);0<b.xb&&(d=gb(a,b.id),a.zd(b.id,0),hb(a,b.id,d,b.xb,b.Pd),b.xb=0,b.Pd=void 0);if(a.bb){d=c-b.Id;b.eu=1E3*a.Ed.currentTime-d;b.F.onended=function(){Wa(b)};try{b.F.start?b.F.start(0,c/1E3,(b.duration-d)/1E3):b.F.noteGrainOn&&b.F.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.nd=!0,b.yd=!0,a.ic+=1,b.F.loop=b.fo}catch(g){}}else if(a.Qa){if(4!==b.F.readyState){var h=function(){return{ready:function(){b.F.currentTime=c/1E3;b.F.play();b.nd=!0;b.F.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.F.addEventListener("canplaythrough",h.ready,!1)}else b.F.currentTime=c/1E3,b.F.play(),b.nd=!0;b.yd=!0;a.ic+=1}}
e.ej=function(a,b,c,d){var g,h,k,l,n=Ya(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.yd)&&!d||!h.paused&&d){if(!d){for(g=this.Fd.length-1;0<=g;g-=1)if(a=this.Fd[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.xb=b||0;h.Pd=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.Eh&&(void 0===b&&(h.xb=h.Eh.duration),void 0===c&&(h.Pd=h.Eh.Wa),k=h.Eh.gain,h.Eh=void 0)}this.bb&&(a=bb(this,h.Nb))&&(h.F=a,$a(this,h));void 0!==k&&I.zd(h.id,k);Va(this,h,h.Id+(h.Ij||0));void 0!==l&&
(I.zd(h.id,l.Wa(l.p,l.start,l.oj-l.start,l.duration)),hb(I,h.id,l.oj,l.duration-l.p,l.Wa,l.Gb))}};
e.pause=function(a,b,c,d,g){var h,k,l=Ya(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.xb=c||0,0<h.xb)h.Pd=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.Eh={gain:ib(h.id),duration:h.xb,Wa:h.Pd},hb(I,h.id,0,h.xb,h.Pd,function(){I.pause(h.id,b)});else if(k=this.Ib(h.id),h.Ij=k,g||(h.paused=!0,h.gm=0,h.Np=b,this.ic-=1),this.bb){h.F.onended=function(){};if(h.yd&&h.nd){try{h.F.stop?h.F.stop(0):h.F.noteOff&&h.F.noteOff(0)}catch(n){}h.nd=!1}ab(this,h)}else this.Qa&&h.F.pause()};
function Wa(a){var b=I;b.Ra[a.id]&&delete b.Ra[a.id];a.paused||(b.ic-=1);b.bb?(a.nd=!1,a.yd=!1,ab(b,a)):b.Qa&&Xa(b,a);b.ac[b.ac.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=Ya(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.xb=b||0,0<d.xb)d.Pd=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},hb(I,d.id,0,d.xb,d.Pd,function(){I.stop(d.id)});else{this.Ra[d.id]&&delete this.Ra[d.id];d.yd&&!d.paused&&(this.ic-=1);if(this.bb){if(d.yd&&!d.paused&&!d.kg){if(d.nd){try{d.F.stop?d.F.stop(0):d.F.noteOff&&d.F.noteOff(0)}catch(h){}d.nd=!1}ab(this,d)}}else this.Qa&&(d.kg||d.F.pause(),Xa(this,d));this.ac[this.ac.indexOf(d)]=void 0;d.yd=!1}};
function hb(a,b,c,d,g,h){var k;for(k=0;k<a.Fd.length;k+=1)if(a.Fd[k].id===b){a.Fd.splice(k,1);break}a.Fd.push({id:b,oj:c,Wa:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,p:0,start:gb(a,b),Gb:h,$m:0})}function jb(a){var b=I,c;void 0===b.jc[a]&&(c=void 0!==b.Ra[a]?b.Ra[a]:1,b.zd(a,0),b.jc[a]=c)}function kb(a){var b=I;void 0!==b.jc[a]&&(b.zd(a,b.jc[a]),delete b.jc[a])}
e.position=function(a,b){var c,d,g,h,k=Ya(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.bb)if(d.paused)d.Ij=b;else{d.F.onended=function(){};if(d.nd){try{d.F.stop?d.F.stop(0):d.F.noteOff&&d.F.noteOff(0)}catch(l){}d.nd=!1}ab(this,d);this.ic-=1;if(g=bb(this,d.Nb))d.F=g,$a(this,d),Va(this,d,d.Id+b)}else this.Qa&&(4===d.F.readyState?d.F.currentTime=(d.Id+b)/1E3:(h=function(){var a=d,c=b;return{hr:function(){a.F.currentTime=(a.Id+c)/1E3;a.F.removeEventListener("canplaythrough",
h.hr,!1)}}}(),d.F.addEventListener("canplaythrough",h.hr,!1)))};e.Ho=function(a){I.position(a,0)};e.fj=function(a,b){var c,d=Ya(this,a);for(c=0;c<d.length;c+=1)d[c].fo=b,this.bb&&(d[c].F.loop=b)};function gb(a,b){return void 0!==a.Ra[b]?a.Ra[b]:1}function ib(a){var b=I,c=1,d=Ya(b,a)[0];if(d)for(a=0;a<d.pa.length;a+=1)void 0!==b.Ra[d.pa[a]]&&(c*=b.Ra[d.pa[a]]);return Math.round(100*c)/100}
e.zd=function(a,b){var c,d,g,h=1,k=Ya(this,a);this.Ra[a]=b;this.jc[a]&&delete this.jc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.pa.indexOf(a)){for(g=0;g<d.pa.length;g+=1)void 0!==this.Ra[d.pa[g]]&&(h*=this.Ra[d.pa[g]]);h=Math.round(100*h)/100;this.bb?this.Gd[d.id].gain.value=h:this.Qa&&(d.F.volume=h)}};
function fb(a,b){var c,d,g,h=1,k=Ya(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.pa.length;g+=1)void 0!==a.Ra[d.pa[g]]&&(h*=a.Ra[d.pa[g]]);h=Math.round(100*h)/100;a.bb?a.Gd[d.id].gain.value=h:a.Qa&&(d.F.volume=h)}}e.Sp=function(a,b){var c,d,g,h=Ya(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.pa.indexOf(b[g])&&d.pa.push(b[g]);fb(this,a)};e.xr=function(a){if(a=Ya(this,a)[0])return a.paused};
e.Ib=function(a){if(a=Ya(this,a)[0]){if(this.bb)return a.paused?a.Ij:(1E3*I.Ed.currentTime-a.eu)%a.duration;if(I.Qa)return Math.ceil(1E3*a.F.currentTime-a.Id)}};var I=new Ta;function lb(a,b,c,d){this.name=a;this.Ew=b;this.Iw=c;this.qc=d;this.loaded=!1;this.Rb=null;pa(this,this.qc,1)}
lb.prototype.Ad=function(a,b){var c,d;c=this.Ew;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Iw;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);I.cf[this.name]=[];I.Gh(this,[d,c],a)};lb.prototype.complete=function(){return this.loaded};
function J(a,b,c,d,g,h,k){this.name=a;this.s=b;this.startOffset=c;this.duration=d;I.zd(this.name,void 0!==g?g:1);this.Qh=void 0!==h?h:10;this.pa=[];k&&(this.pa=this.pa.concat(k));0>this.pa.indexOf(this.name)&&this.pa.push(this.name)}J.prototype.complete=function(){return this.s.complete()};J.prototype.nl=function(a){void 0!==a&&(this.Qh=a);return this.Qh};J.prototype.Sp=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.pa.indexOf(a[b])&&this.pa.push(a[b])};
function db(a,b){this.Nb=a;this.Id=this.Nb.startOffset;this.F=b;this.duration=this.Nb.duration;this.cm()}db.prototype.cm=function(){this.id=Math.round(Date.now()*Math.random())+"";this.pa=["master",this.id].concat(this.Nb.pa);this.nl=void 0!==this.Nb.Qh?this.Nb.Qh:10;this.paused=this.yd=this.fo=!1;this.hm=this.$m=0;this.nd=this.kg=!1;this.Ss=this.Ij=0;var a,b=1;for(a=0;a<this.pa.length;a+=1)void 0!==I.Ra[this.pa[a]]&&(b*=I.Ra[this.pa[a]]);!I.bb&&I.Qa&&(this.F.volume=b)};
function mb(a,b){this.name=a;this.fileName=b;this.info=void 0}function nb(a){this.name=a;this.text="";this.Ic=this.complete=!1}nb.prototype.df=function(a){4===a.readyState&&(this.complete=!0,(this.Ic=200!==a.status)?na("Get Failed",{name:this.name}):(this.text=a.responseText,na("Get Complete",{name:this.name})))};
function ob(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.Ic=200!==c.status,a.Ic?na("Post Failed",{name:a.name}):na("Post Complete",{name:a.name}))};c.send(a.text)}function pb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.Ic=200!==c.status;if(a.Ic)return!1;a.text=c.responseText;return!0}
function qb(a){a&&(this.Vd=a);this.clear();this.Nh=this.ng=this.Vc=this.Mh=this.Lh=this.Ph=this.Ih=this.Oh=this.Hd=this.Kh=this.Jh=0;rb(this,this);sb(this,this);tb(this,this);this.pe=[];this.Ah=[];this.Sh=[];this.H=0;this.Op=!1;this.Ik=this.startTime=Date.now();this.$f=this.ec=0;this.fw=200;this.qc="";window.Aj(window.Fp)}qb.prototype.clear=function(){this.C=[];this.Th=!1;this.Qb=[];this.bm=!1};
function rb(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.Vd&&!(0<b.H)&&(d=b.Vd,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.jg.x=h,b.jg.y=d,b.Ch.push({x:b.jg.x,y:b.jg.y}),0<b.Mh))for(a=b.C.length-1;0<=a&&!((h=b.C[a])&&h.i&&0>=h.H&&h.Hn&&(h=h.Hn(b.jg.x,b.jg.y),!0===h));a-=1);},!1);ub(a)}function ub(a){a.jg={x:0,y:0};a.Ch=[]}
function sb(a,b){window.addEventListener("mousedown",function(a){0<b.H||(a.preventDefault(),window.focus(),b.Mp>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),wb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.H||(a.preventDefault(),b.Fj>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),xb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.H||(a.preventDefault(),vb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Mp=Date.now();
if(!(0<b.H))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),wb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.Fj=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.Fj=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.Fj=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){yb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){yb(b,a)},!1);zb(a);a.Mp=0;a.Fj=0}function zb(a){var b;a.ra=[];for(b=0;16>b;b+=1)a.ra[b]={id:-1,tb:!1,x:0,y:0};a.gf=[]}function Ab(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.ra[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.ra[d].tb){c=d;a.ra[d].id=b;break}return c}
function vb(a,b,c,d){var g,h;void 0!==a.Vd&&(b=Ab(a,b),-1!==b&&(g=a.Vd,h=g.getBoundingClientRect(),a.ra[b].x=g.width/h.width*(c-h.left),a.ra[b].y=g.height/h.height*(d-h.top)))}function wb(a,b){var c=Ab(a,b),d,g;if(-1!==c&&!a.ra[c].tb&&(a.gf.push({xf:c,x:a.ra[c].x,y:a.ra[c].y,tb:!0}),a.ra[c].tb=!0,0<a.Vc))for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.Og&&(g=g.Og(c,a.ra[c].x,a.ra[c].y),!0===g));d-=1);}
function xb(a,b){var c=Ab(a,b),d,g;if(-1!==c&&a.ra[c].tb&&(a.gf.push({xf:c,x:a.ra[c].x,y:a.ra[c].y,tb:!1}),a.ra[c].tb=!1,0<a.Vc))for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.Pg&&(g=g.Pg(c,a.ra[c].x,a.ra[c].y),!0===g));d-=1);}
function yb(a,b){var c;if(!(0<a.H)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.gf.push({xf:0,x:a.ra[0].x,y:a.ra[0].y,wheelDelta:c});if(0<a.Vc)for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.Kn&&(g=g.Kn(c,a.ra[0].x,a.ra[0].y),!0===g));d-=1);}}function Bb(a){return K.ra[a].x}
function tb(a,b){window.addEventListener("keydown",function(a){0<b.H||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Cb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.H||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Eb(b,a.keyCode))},!1);Fb(a)}function Fb(a){var b;a.Fh=[];for(b=0;256>b;b+=1)a.Fh[b]=!1;a.mg=[]}
function Cb(a,b){var c,d;if(!a.Fh[b]&&(a.mg.push({key:b,tb:!0}),a.Fh[b]=!0,0<a.ng))for(c=0;c<a.C.length&&!((d=a.C[c])&&d.i&&0>=d.H&&d.In&&(d=d.In(b),!0===d));c+=1);}function Eb(a,b){var c,d;if(a.Fh[b]&&(a.mg.push({key:b,tb:!1}),a.Fh[b]=!1,0<a.ng))for(c=0;c<a.C.length&&!((d=a.C[c])&&d.i&&0>=d.H&&d.Jn&&(d=d.Jn(b),!0===d));c+=1);}function Gb(){var a=K,b;for(b=0;b<a.pe.length;b+=1)a.pe[b].paused+=1}
function na(a,b){var c,d=K,g,h;void 0===c&&(c=null);d.Sh.push({id:a,ku:b,sh:c});if(0<d.Nh)for(g=0;g<d.C.length&&(!((h=d.C[g])&&h.i&&0>=h.H&&h.Ln)||null!==c&&c!==h||(h=h.Ln(a,b),!0!==h));g+=1);}
function Hb(a,b){var c=a.Qb[b];c.visible&&(void 0!==c.canvas&&c.canvas!==w.canvas&&w.ob(c.canvas),!1!==w.canvas.W||!0===c.Kc)&&(0===c.Lp&&(0>=c.H&&(c.qb+=c.ju*a.$f/1E3),1===c.Wl&&1===c.Xl&&0===c.Sa?1===c.alpha?c.f.r(c.qb,c.x,c.y):c.f.Yc(c.qb,c.x,c.y,c.alpha):c.f.V(c.qb,c.x,c.y,c.Wl,c.Xl,c.Sa,c.alpha)),1===c.Lp&&(1===c.Wl&&1===c.Xl&&0===c.Sa?1===c.alpha?c.font.r(c.text,c.x,c.y):c.font.Yc(c.text,c.x,c.y,c.alpha):c.font.V(c.text,c.x,c.y,c.Wl,c.Xl,c.Sa,c.alpha)))}
function Ib(a,b){var c=a.C[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==w.canvas&&w.ob(c.canvas),(!1!==w.canvas.W||!0===c.Kc)&&c.Ma))return c.Ma()}function Jb(a){for(var b=0,c=0;b<a.C.length||c<a.Qb.length;)if(c===a.Qb.length){if(!0===Ib(a,b))break;b+=1}else if(b===a.C.length)Hb(a,c),c+=1;else if(a.Qb[c].ma>a.C[b].ma||a.Qb[c].ma===a.C[b].ma&&a.Qb[c].depth>a.C[b].depth)Hb(a,c),c+=1;else{if(!0===Ib(a,b))break;b+=1}}qb.prototype.pause=function(a){this.H+=1;void 0===a&&(a=!1);this.Op=a};
qb.prototype.ej=function(){0!==this.H&&(this.Ik=Date.now(),this.H-=1)};qb.prototype.xr=function(){return 0<this.H};window.$l=0;window.Zl=0;window.Gp=0;window.Ut=0;window.Hp=0;window.Wt=60;window.Xt=0;window.Vt=!1;
window.Fp=function(){window.$l=Date.now();window.Ut=window.$l-window.Zl;var a=K,b;if(0<a.H)a.Op&&(Kb(a),Jb(a));else{b=Date.now();"number"!==typeof b&&(b=a.Ik);a.$f=Math.min(a.fw,b-a.Ik);a.ec+=a.$f;""===a.qc&&(a.qc="start",ka.Ad(a.qc));"start"===a.qc&&ka.complete(a.qc)&&(a.qc="load",ka.Ad(a.qc));"load"===a.qc&&ka.complete(a.qc)&&(a.qc="game",ka.Ad(a.qc));"undefined"!==typeof I&&Ua(a.$f);var c,d;if(0<a.Jh)for(c=0;c<a.C.length&&!((d=a.C[c])&&d.va&&d.i&&0>=d.H&&!0===d.va(a.$f));c+=1);var g,h;if(0!==a.Ch.length){if(0<
a.Kh)for(d=a.C.length-1;0<=d;d-=1)if((g=a.C[d])&&g.i&&0>=g.H&&g.Gn)for(c=0;c<a.Ch.length;c+=1)h=a.Ch[c],!0!==h.Mc&&(h.Mc=g.Gn(h.x,h.y));a.Ch=[]}if(0!==a.gf.length){if(0<a.Hd)for(d=a.C.length-1;0<=d;d-=1)if((g=a.C[d])&&g.i&&0>=g.H&&(g.yb||g.Kb||g.Ak))for(c=0;c<a.gf.length;c+=1)h=a.gf[c],!0!==h.Mc&&(void 0!==h.wheelDelta&&g.Ak?h.Mc=g.Ak(h.wheelDelta,h.x,h.y):h.tb&&g.yb?h.Mc=g.yb(h.xf,h.x,h.y):void 0!==h.tb&&!h.tb&&g.Kb&&(h.Mc=g.Kb(h.xf,h.x,h.y)));a.gf=[]}if(0!==a.mg.length){if(0<a.Oh)for(d=0;d<a.C.length;d+=
1)if((g=a.C[d])&&g.i&&0>=g.H&&(g.Gi||g.Qg))for(c=0;c<a.mg.length;c+=1)h=a.mg[c],!0!==h.Mc&&(h.tb&&g.Gi?h.Mc=void 0:!h.tb&&g.Qg&&(h.Mc=g.Qg(h.key)));a.mg=[]}c=a.$f;for(d=a.Ah.length=0;d<a.pe.length;d+=1)g=a.pe[d],void 0!==g.id&&0===g.paused&&(0<g.ph||0<g.Go)&&(g.ph-=c,0>=g.ph&&(a.Ah.push({id:g.id,sh:g.sh}),0<g.Go?(g.Go-=1,g.ph+=g.time):g.ph=0));if(0<a.Ih&&0<a.Ah.length)for(c=0;c<a.C.length;c+=1)if((d=a.C[c])&&d.Fn&&d.i)for(g=0;g<a.Ah.length;g+=1)h=a.Ah[g],!0===h.Mc||null!==h.sh&&h.sh!==d||(h.Mc=d.Fn(h.id));
if(0<a.Ph&&0<a.Sh.length)for(c=0;c<a.C.length;c+=1)if((g=a.C[c])&&g.bd&&g.i&&0>=g.H)for(d=0;d<a.Sh.length;d+=1)h=a.Sh[d],!0===h.Mc||null!==h.sh&&h.sh!==g||(h.Mc=g.bd(h.id,h.ku));a.Sh.length=0;if(0<a.Lh)for(c=0;c<a.C.length&&!((d=a.C[c])&&d.Lc&&d.i&&0>=d.H&&!0===d.Lc(a.$f));c+=1);Kb(a);Jb(a);a.Ik=b}window.Zl=Date.now();window.Gp=window.Zl-window.$l;window.Hp=Math.max(window.Xt,1E3/window.Wt-window.Gp);window.Aj(window.Fp)};window.Aj=function(a){window.setTimeout(a,window.Hp)};
window.Vt||(window.Aj=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.Aj);
function Kb(a){function b(a,b){return a.ma===b.ma?b.depth-a.depth:a.ma>b.ma?-1:1}var c,d;for(c=d=0;c<a.C.length;c+=1)a.C[c]&&(a.C[c].am&&(a.C[c].am=!1,a.C[c].i=!0),a.C[d]=a.C[c],d+=1);a.C.length=d;a.Th&&a.C.sort(b);a.Th=!1;for(c=d=0;c<a.Qb.length;c+=1)a.Qb[c]&&(a.Qb[d]=a.Qb[c],d+=1);a.Qb.length=d;a.bm&&a.Qb.sort(b);a.bm=!1}
function M(a,b){var c=K;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.i&&(a.i=!0);void 0===a.depth&&(a.depth=0);void 0===a.ma&&(a.ma=0);void 0===a.H&&(a.H=0);void 0===a.ff&&(a.ff=[]);a.am=!1;void 0!==b&&!1===b&&(a.am=!0,a.i=!1);c.C.push(a);c.Th=!0;a.va&&(c.Jh+=1);a.Gn&&(c.Kh+=1);if(a.yb||a.Kb)c.Hd+=1;a.Ak&&(c.Hd+=1);if(a.Gi||a.Qg)c.Oh+=1;a.Fn&&(c.Ih+=1);a.bd&&(c.Ph+=1);a.Lc&&(c.Lh+=1);a.Hn&&(c.Mh+=1);if(a.Og||a.Pg)c.Vc+=1;a.Kn&&(c.Vc+=1);if(a.In||a.Jn)c.ng+=1;a.Ln&&(c.Nh+=
1);a.nc&&a.nc()}function Lb(a,b){var c=K;a.depth!==b&&(c.Th=!0);a.depth=b}function Mb(a,b){var c;b=[].concat(b);void 0===a.ff&&(a.ff=[]);for(c=b.length-1;0<=c;c-=1)0>a.ff.indexOf(b[c])&&a.ff.push(b[c])}
function Nb(a,b){var c=[],d,g;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&c.push(g);else if("function"===typeof b)for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&b(g)&&c.push(g);else for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&0<=g.ff.indexOf(b)&&c.push(g);return c}function Ob(a){var b=Nb(K,a);for(a=0;a<b.length;a+=1){var c=b[a];c.H+=1}}function Pb(a){var b=Nb(K,a);for(a=0;a<b.length;a+=1){var c=b[a];c.H=Math.max(0,c.H-1)}}
function N(a,b){var c=a.C.indexOf(b);if(!(0>c)){a.C[c].fc&&a.C[c].fc();var d=a.C[c];d.va&&(a.Jh-=1);d.Gn&&(a.Kh-=1);if(d.yb||d.Kb)a.Hd-=1;d.Ak&&(a.Hd-=1);if(d.Gi||d.Qg)a.Oh-=1;d.Fn&&(a.Ih-=1);d.bd&&(a.Ph-=1);d.Lc&&(a.Lh-=1);d.Hn&&(a.Mh-=1);if(d.Og||d.Pg)a.Vc-=1;d.Kn&&(a.Vc-=1);if(d.In||d.Jn)a.ng-=1;d.Ln&&(a.Nh-=1);a.C[c]=void 0}}
qb.prototype.d=function(a,b,c,d,g,h,k){void 0===k&&(k=0);this.Qb.push({Lp:0,f:a,qb:b,ju:c,visible:!0,x:d,y:g,Wl:1,Xl:1,Sa:0,alpha:1,depth:h,ma:k,H:0,ff:[]});this.bm=!0;return this.Qb[this.Qb.length-1]};var K=new qb(aa);
function Qb(a,b){var c;this.kind=a;this.w=null;switch(this.kind){case 0:this.w={x:[b.x],y:[b.y]};this.Ea=b.x;this.Ta=b.y;this.cb=b.x;this.wb=b.y;break;case 2:this.w={x:[b.x,b.x+b.Cb-1,b.x+b.Cb-1,b.x,b.x],y:[b.y,b.y,b.y+b.Jb-1,b.y+b.Jb-1,b.y]};this.Ea=b.x;this.Ta=b.y;this.cb=b.x+b.Cb-1;this.wb=b.y+b.Jb-1;break;case 3:this.w={x:[],y:[]};this.Ea=b.x-b.ql;this.Ta=b.y-b.ql;this.cb=b.x+b.ql;this.wb=b.y+b.ql;break;case 1:this.w={x:[b.zp,b.Ap],y:[b.Bp,b.Cp]};this.Ea=Math.min(b.zp,b.Ap);this.Ta=Math.min(b.Bp,
b.Cp);this.cb=Math.max(b.zp,b.Ap);this.wb=Math.max(b.Bp,b.Cp);break;case 4:this.w={x:[],y:[]};this.Ea=b.x[0];this.Ta=b.y[0];this.cb=b.x[0];this.wb=b.y[0];for(c=0;c<b.x.length;c+=1)this.w.x.push(b.x[c]),this.w.y.push(b.y[c]),this.Ea=Math.min(this.Ea,b.x[c]),this.Ta=Math.min(this.Ta,b.y[c]),this.cb=Math.max(this.cb,b.x[c]),this.wb=Math.max(this.wb,b.y[c]);this.w.x.push(b.x[0]);this.w.y.push(b.y[0]);break;default:this.Ta=this.Ea=0,this.wb=this.cb=-1}}
function Rb(a,b,c,d){return new Qb(2,{x:a,y:b,Cb:c,Jb:d})}function Tb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.L;h+=1)k=a.ie[h]-a.Db,l=k+a.he[h]-1,n=a.je[h]-a.Eb,q=n+a.ge[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>g&&(g=q);return new Qb(2,{x:b,y:d,Cb:c-b+1,Jb:g-d+1})}e=Qb.prototype;
e.M=function(){var a=new Qb(-1,{}),b;a.kind=this.kind;a.Ea=this.Ea;a.cb=this.cb;a.Ta=this.Ta;a.wb=this.wb;a.w={x:[],y:[]};for(b=0;b<this.w.x.length;b+=1)a.w.x[b]=this.w.x[b];for(b=0;b<this.w.y.length;b+=1)a.w.y[b]=this.w.y[b];return a};e.translate=function(a,b){var c=this.M(),d;c.Ea+=a;c.cb+=a;c.Ta+=b;c.wb+=b;for(d=0;d<c.w.x.length;d+=1)c.w.x[d]+=a;for(d=0;d<c.w.y.length;d+=1)c.w.y[d]+=b;return c};
e.scale=function(a){var b=this.M(),c;b.Ea*=a;b.cb*=a;b.Ta*=a;b.wb*=a;for(c=0;c<b.w.x.length;c+=1)b.w.x[c]*=a;for(c=0;c<b.w.y.length;c+=1)b.w.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new p(this.w.x[0],this.w.y[0]),b=b.rotate(a),new Qb(0,{x:b.x,y:b.y});case 1:return b=new p(this.w.x[0],this.w.y[0]),b=b.rotate(a),c=new p(this.w.x[1],this.w.y[1]),c=c.rotate(a),new Qb(1,{zp:b.x,Bp:b.y,Ap:c.x,Cp:c.y});case 3:return b=(this.cb-this.Ea)/2,c=new p(this.Ea+b,this.Ta+b),c=c.rotate(a),new Qb(3,{x:c.x,y:c.y,ql:b});default:c=[];d=[];for(g=0;g<this.w.x.length-1;g+=1)b=new p(this.w.x[g],this.w.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Qb(4,{x:c,y:d})}};
function Ub(a,b,c,d,g){var h,k,l,n,q;if(d<b+a.Ea||d>b+a.cb||g<c+a.Ta||g>c+a.wb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return l=(a.cb-a.Ea)/2,d-=b+a.Ea+l,g-=c+a.Ta+l,d*d+g*g<=l*l;case 1:return l=b+a.w.x[0],n=c+a.w.y[0],b+=a.w.x[1],a=c+a.w.y[1],d===l?g===n:d===b?g===a:1>Math.abs(n+(d-l)*(a-n)/(b-l)-g);case 4:n=new p(0,0);q=new p(0,0);l=[];for(k=0;k<a.w.x.length-1;k+=1)n.x=a.w.x[k],n.y=a.w.y[k],q.x=a.w.x[k+1],q.y=a.w.y[k+1],l.push(fa(ea(n,q)));for(n=0;n<l.length;n+=1){q=new p(d,g);k=l[n];
q=q.x*k.x+q.y*k.y;h=a;var v=b,D=c,F=l[n],r=new p(0,0),s=void 0,t=1E9;k=-1E10;for(var u=void 0,u=0;u<h.w.x.length;u+=1)r.x=v+h.w.x[u],r.y=D+h.w.y[u],s=r.x*F.x+r.y*F.y,t=Math.min(t,s),k=Math.max(k,s);h=t;if(q<h||k<q)return!1}return!0;default:return!1}}
e.ib=function(a,b,c){var d=w.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.Ea-1,b+this.Ta-1,3,3);break;case 2:d.fillRect(a+this.Ea,b+this.Ta,this.cb-this.Ea+1,this.wb-this.Ta+1);break;case 3:c=(this.cb-this.Ea)/2;d.beginPath();d.arc(a+this.Ea+c,b+this.Ta+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.w.x[0],b+this.w.y[0]);d.lineTo(a+this.w.x[1],b+this.w.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.w.x[0],b+this.w.y[0]);
for(c=1;c<this.w.x.length-1;c+=1)d.lineTo(a+this.w.x[c],b+this.w.y[c]);d.closePath();d.fill()}};function Vb(){this.depth=1E7;this.visible=!1;this.i=!0;this.group="Engine";this.ka=[];this.Hh=this.H=this.Rh=!1;this.re=1;this.Ac=-1;this.qa=-1E6}e=Vb.prototype;e.M=function(){var a=new Vb,b;for(b=0;b<this.ka.length;b+=1)a.ka.push({ab:this.ka[b].ab,action:this.ka[b].action});a.Hh=this.Hh;return a};
e.xa=function(a,b){var c,d;if(0===this.ka.length||this.ka[this.ka.length-1].ab<=a)this.ka.push({ab:a,action:b});else{for(c=0;this.ka[c].ab<=a;)c+=1;for(d=this.ka.length;d>c;d-=1)this.ka[d]=this.ka[d-1];this.ka[c]={ab:a,action:b}}this.qa=-1E6};e.start=function(){this.Rh=!0;this.H=!1;this.Ac=0>this.re&&0<this.ka.length?this.ka[this.ka.length-1].ab+1:-1;this.qa=-1E6;N(K,this);M(this)};
e.Ho=function(){if(0>this.re&&0<this.ka.length){var a=this.ka[this.ka.length-1].ab;this.Ac=0>this.re?a+1:a-1}else this.Ac=0>this.re?1:-1;this.qa=-1E6};e.stop=function(){this.Rh=!1;N(K,this)};e.be=function(){return this.Rh};e.pause=function(){this.H=!0;N(K,this)};e.ej=function(){this.H=!1;N(K,this);M(this)};e.paused=function(){return this.Rh&&this.H};e.fj=function(a){this.Hh=a};
e.va=function(a){if(this.Rh&&!this.H&&0!==this.re)if(0<this.re){0>this.qa&&(this.qa=0);for(;this.qa<this.ka.length&&this.ka[this.qa].ab<=this.Ac;)this.qa+=1;for(this.Ac+=this.re*a;0<=this.qa&&this.qa<this.ka.length&&this.ka[this.qa].ab<=this.Ac;)this.ka[this.qa].action(this.ka[this.qa].ab,this),this.qa+=1;this.qa>=this.ka.length&&(this.Hh?this.Ho():this.stop())}else{0>this.qa&&(this.qa=this.ka.length-1);for(;0<=this.qa&&this.ka[this.qa].ab>=this.Ac;)this.qa-=1;for(this.Ac+=this.re*a;0<=this.qa&&this.ka[this.qa].ab>=
this.Ac;)this.ka[this.qa].action(this.ka[this.qa].ab,this),this.qa-=1;0>this.qa&&0>=this.Ac&&(this.Hh?this.Ho():this.stop())}};function Wb(){this.depth=1E7;this.visible=!1;this.i=!0;this.group="Engine";this.Pb=[];this.bf=[];this.clear();this.yx=!1;M(this)}e=Wb.prototype;e.va=function(){var a,b,c,d,g;if(this.yx)for(a=0;16>a;a+=1)K.ra[a].tb&&(b=Bb(a),c=K.ra[a].y,d=this.bf[a],g=this.Pb[d],!(0<=d&&g&&g.selected)||g&&Ub(g.Nc,0,0,b,c)||(Eb(K,g.keyCode),g.selected=!1,this.bf[a]=-1),this.yb(a,b,c))};
e.yb=function(a,b,c){var d;if(!(0<=this.bf[a]))for(d=0;d<this.Pb.length;d+=1){var g;if(g=this.Pb[d])g=(g=this.Pb[d])?Ub(g.Nc,0,0,b,c):!1;if(g&&!this.Pb[d].selected){Cb(K,this.Pb[d].keyCode);this.Pb[d].selected=!0;this.bf[a]=d;break}}};e.Kb=function(a){var b=this.bf[a];0<=b&&this.Pb[b]&&this.Pb[b].selected&&(Eb(K,this.Pb[b].keyCode),this.Pb[b].selected=!1);this.bf[a]=-1};function Xb(a,b,c,d,g,h,k){c=Rb(c,d,g,h);a.Pb.push({keyCode:k,Nc:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.Pb.length=0;16>a;a+=1)this.bf[a]=-1};e.ib=function(a,b,c){var d,g,h,k;for(d=0;d<this.Pb.length;d+=1)if(g=this.Pb[d])g.selected?g.Nc.ib(0,0,b):g.Nc.ib(0,0,a),h=(g.Nc.Ea+g.Nc.cb)/2,k=(g.Nc.Ta+g.Nc.wb)/2,w.lc("id: "+g.id,h-20,k-10,c,"16px Arial"),w.lc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new ga;function Yb(a,b){return b}function O(a,b,c,d){return b+a/d*c}function Zb(a,b,c,d,g){void 0===g&&(g=3);return b+c*Math.pow(a/d,g)}
function $b(a,b,c,d){return Zb(a,b,c,d,2)}function ac(a,b,c,d){return b+c*Zb(d-a,1,-1,d,2)}function bc(a,b,c,d){return Zb(a,b,c,d,3)}function Q(a,b,c,d){return b+c*Zb(d-a,1,-1,d,3)}function cc(a,b,c,d){return b+c*(a<d/2?Zb(a,0,.5,d/2,3):Zb(d-a,1,-.5,d/2,3))}function dc(a,b,c,d,g){var h;void 0===g&&(g=8);h=Math.pow(2,-g);return b+(Math.pow(2,g*a/d-g)-h)/(1-h)*c}
function ec(a,b,c,d,g){a=d-a;var h=3;void 0===h&&(h=3);void 0===g&&(g=8);h=Math.sin(2*(1-a/d)*Math.PI*h+Math.PI/2);h*=dc(a,0,1,d,g);return b+c*(1+-1*h)}function fc(a,b,c,d,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2))}function gc(a,b,c,d,g){return b+c*fc(d-a,1,-1,d,g)}
function hc(a){switch(1){case 0:return function(b,c,d,g,h,k,l){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,l)};case 1:return function(b,c,d,g,h,k,l){return a(b-Math.floor(b/g)*g,c,d,g,h,k,l)};case 2:return function(b,c,d,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*b};case 3:return function(b,c,d,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+d*(n+b)};default:return function(b,c,d,g,h,k,l){return a(b,c,d,g,h,k,l)}}}
function ic(a,b,c){var d,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),g=a[d]===Yb?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,v,D,F,r,s){var t,u;t=a.length-1;for(u=0;u<a.length;u+=1)if(d/D<=l[u+1]){t=u;break}d=a[t](d/D-l[t],0,1,c[t],F,r,s);b[t]&&(d=-d);return g+(k[t]+d)*v/h}}
var R=window.TG_InitSettings||{};R.size=void 0!==R.size?R.size:"big";R.Lt=R.usesFullScreen;R.Jo="big"===R.size?1:.5;R.Af=20;R.Be=10;R.Yq=0;R.vk=-10;R.Rd=-20;R.dc=-30;R.Qd=-40;
function S(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(R.Jo*a);break a;case "round":c=Math.round(R.Jo*a);break a;default:c=R.Jo*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=S(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=S(a[c],b));return a}}function T(a){return"big"===R.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}window.throbber=new mb("throbber","media/throbber.png");
window.TG_StartScreenLogo=new mb("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");var jc=new ta("StartTexture",2,"start");window.StartTexture=jc;ua(jc,0,"media/StartTexture0.png");ua(jc,1,"media/StartTexture1.png");var kc=new ta("StartScreenTexture",1,"load");window.StartScreenTexture=kc;ua(kc,0,"media/StartScreenTexture0.png");var lc=new ta("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=lc;ua(lc,0,"media/LevelMapScreenTexture0.png");var mc=new ta("LevelEndTexture",3,"load");
window.LevelEndTexture=mc;ua(mc,0,"media/LevelEndTexture0.png");ua(mc,1,"media/LevelEndTexture1.png");ua(mc,2,"media/LevelEndTexture2.png");var U=new ta("MenuTexture",2,"load");window.MenuTexture=U;ua(U,0,"media/MenuTexture0.png");ua(U,1,"media/MenuTexture1.png");var V=new ta("GameTexture",2,"load");window.GameTexture=V;ua(V,0,"media/GameTexture0.png");ua(V,1,"media/GameTexture1.png");var nc=new ta("GameStaticTexture",1,"load");window.GameStaticTexture=nc;ua(nc,0,"media/GameStaticTexture0.png");
var oc=new x("s_loadingbar_background",kc,1,42,32,0,0,42,32,1);window.s_loadingbar_background=oc;oc.d(0,0,697,113,42,32,0,0);var pc=new x("s_level_0",lc,1,125,140,0,0,125,140,1);window.s_level_0=pc;pc.d(0,0,129,1,125,140,0,0);var qc=new x("s_level_1",lc,1,125,140,0,0,125,140,1);window.s_level_1=qc;qc.d(0,0,257,1,125,140,0,0);var rc=new x("s_level_2",lc,1,125,140,0,0,125,140,1);window.s_level_2=rc;rc.d(0,0,1,1,125,140,0,0);var sc=new x("s_level_3",lc,1,125,140,0,0,125,140,1);window.s_level_3=sc;
sc.d(0,0,385,1,125,140,0,0);var tc=new x("s_level_lock",lc,1,48,70,0,0,48,70,1);window.s_level_lock=tc;tc.d(0,0,777,113,48,69,0,1);var uc=new x("s_level_stars",lc,1,126,46,0,0,126,46,1);window.s_level_stars=uc;uc.d(0,0,513,1,126,45,0,1);var vc=new x("s_level2_0",lc,1,84,87,0,0,84,87,1);window.s_level2_0=vc;vc.d(0,0,897,97,84,87,0,0);var wc=new x("s_level2_1",lc,1,84,87,0,0,84,87,1);window.s_level2_1=wc;wc.d(0,0,897,1,84,87,0,0);var xc=new x("s_level2_2",lc,1,84,87,0,0,84,87,1);window.s_level2_2=xc;
xc.d(0,0,601,113,84,87,0,0);var yc=new x("s_level2_3",lc,1,84,87,0,0,84,87,1);window.s_level2_3=yc;yc.d(0,0,513,49,84,87,0,0);var zc=new x("s_level2_arrow_right",lc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=zc;zc.d(0,0,833,1,60,108,0,0);zc.d(1,0,641,1,60,108,0,0);var Ac=new x("s_level2_arrow_left",lc,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=Ac;Ac.d(0,0,705,1,60,108,0,0);Ac.d(1,0,769,1,60,108,0,0);var Bc=new x("s_level2_lock",lc,1,84,87,0,0,84,87,1);window.s_level2_lock=Bc;
Bc.d(0,0,689,113,84,87,0,0);var Cc=new x("s_pop_medal",mc,8,378,378,189,189,3024,378,8);window.s_pop_medal=Cc;Cc.d(0,0,1,649,349,241,3,69);Cc.d(1,1,1,1,346,267,5,54);Cc.d(2,0,353,649,348,276,20,56);Cc.d(3,1,1,273,342,288,26,50);Cc.d(4,1,689,313,319,292,22,46);Cc.d(5,1,1,569,337,304,14,41);Cc.d(6,1,353,1,343,305,12,41);Cc.d(7,1,345,313,341,304,13,41);var Dc=new x("s_medal_shadow",mc,1,195,208,0,0,195,208,1);window.s_medal_shadow=Dc;Dc.d(0,2,401,1,189,204,3,1);
var Ec=new x("s_medal_shine",mc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Ec;Ec.d(0,2,201,1,193,207,1,1);Ec.d(1,0,705,649,193,207,1,1);Ec.d(2,2,1,1,193,207,1,1);Ec.d(3,1,345,625,193,207,1,1);Ec.d(4,1,689,609,193,207,1,1);Ec.d(5,1,705,1,193,207,1,1);var Fc=new x("s_icon_toggle_hard",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Fc;Fc.d(0,1,953,73,67,67,0,0);var Gc=new x("s_icon_toggle_medium",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Gc;Gc.d(0,0,905,929,67,67,0,0);
var Hc=new x("s_icon_toggle_easy",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Hc;Hc.d(0,1,953,1,67,67,0,0);var Ic=new x("s_flagIcon_us",U,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Ic;Ic.d(0,0,961,841,48,36,0,6);var Jc=new x("s_flagIcon_gb",U,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=Jc;Jc.d(0,0,961,801,48,36,0,6);var Kc=new x("s_flagIcon_nl",U,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Kc;Kc.d(0,0,961,881,48,36,0,6);var Lc=new x("s_flagIcon_tr",U,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Lc;
Lc.d(0,0,377,985,48,36,0,6);var Mc=new x("s_flagIcon_de",U,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Mc;Mc.d(0,1,833,161,48,36,0,6);var Nc=new x("s_flagIcon_fr",U,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Nc;Nc.d(0,1,889,161,48,36,0,6);var Oc=new x("s_flagIcon_br",U,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Oc;Oc.d(0,0,265,985,48,36,0,6);var Pc=new x("s_flagIcon_es",U,1,48,48,0,0,48,48,1);window.s_flagIcon_es=Pc;Pc.d(0,1,777,161,48,36,0,6);var Qc=new x("s_flagIcon_jp",U,1,48,48,0,0,48,48,1);
window.s_flagIcon_jp=Qc;Qc.d(0,0,321,985,48,36,0,6);var Rc=new x("s_flagIcon_ru",U,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=Rc;Rc.d(0,1,833,201,48,36,0,6);var Sc=new x("s_flagIcon_ar",U,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=Sc;Sc.d(0,1,777,201,48,36,0,6);var Tc=new x("s_flagIcon_kr",U,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=Tc;Tc.d(0,0,961,761,48,36,0,6);var Uc=new x("s_flagIcon_it",U,1,48,48,0,0,48,48,1);window.s_flagIcon_it=Uc;Uc.d(0,0,209,985,48,36,0,6);
var Vc=new x("s_logo_tinglygames",U,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=Vc;Vc.d(0,0,249,641,240,240,0,0);var Wc=new x("s_logo_coolgames",U,1,240,240,0,0,240,240,1);window.s_logo_coolgames=Wc;Wc.d(0,0,1,641,240,167,0,36);var Xc=new x("s_logo_tinglygames_start",kc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=Xc;Xc.d(0,0,553,1,156,53,0,0);var Yc=new x("s_logo_coolgames_start",kc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=Yc;Yc.d(0,0,713,1,150,104,75,0);
var Zc=new x("s_ui_cup_highscore",V,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=Zc;Zc.d(0,0,1,985,32,28,0,0);var $c=new x("s_ui_cup_score",V,1,28,24,0,0,28,24,1);window.s_ui_cup_score=$c;$c.d(0,0,41,985,28,24,0,0);var ad=new x("s_ui_divider",nc,1,94,2,0,0,94,2,1);window.s_ui_divider=ad;ad.d(0,0,905,281,94,2,0,0);var bd=new x("s_ui_highscore",nc,1,26,36,13,12,26,36,1);window.s_ui_highscore=bd;bd.d(0,0,977,337,26,36,0,0);var cd=new x("s_ui_smiley_hard",V,1,22,22,11,11,22,22,1);
window.s_ui_smiley_hard=cd;cd.d(0,0,969,433,22,22,0,0);var dd=new x("s_ui_smiley_medium",V,1,22,22,11,11,22,22,1);window.s_ui_smiley_medium=dd;dd.d(0,0,689,585,22,22,0,0);var ed=new x("s_ui_smiley_easy",V,1,22,22,11,11,22,22,1);window.s_ui_smiley_easy=ed;ed.d(0,0,993,433,22,22,0,0);var fd=new x("s_ui_crown",V,1,24,20,12,10,24,20,1);window.s_ui_crown=fd;fd.d(0,0,937,433,24,20,0,0);var gd=new x("s_ui_heart",V,1,28,24,14,12,28,24,1);window.s_ui_heart=gd;gd.d(0,0,73,985,26,23,1,1);
var hd=new x("s_btn_undo",nc,2,100,92,0,0,200,92,2);window.s_btn_undo=hd;hd.d(0,0,905,1,100,92,0,0);hd.d(1,0,905,185,100,92,0,0);var id=new x("s_tutorial_01",nc,1,350,190,0,0,350,190,1);window.s_tutorial_01=id;id.d(0,0,553,385,347,186,2,2);var jd=new x("s_tutorial_02",nc,1,350,190,0,0,350,190,1);window.s_tutorial_02=jd;jd.d(0,0,665,577,253,159,44,25);var kd=new x("s_tutorial_03",nc,1,350,190,0,0,350,190,1);window.s_tutorial_03=kd;kd.d(0,0,353,577,309,179,21,6);
var ld=new x("s_tutorial_04",nc,1,350,190,0,0,350,190,1);window.s_tutorial_04=ld;ld.d(0,0,553,193,347,186,2,2);var md=new x("s_tutorial_05",nc,1,350,190,0,0,350,190,1);window.s_tutorial_05=md;md.d(0,0,553,1,347,186,2,2);var nd=new x("s_tutorial_06",nc,1,350,190,0,0,350,190,1);window.s_tutorial_06=nd;nd.d(0,0,1,457,347,186,2,2);var W=new x("s_cards",V,52,84,110,42,55,84,5720,1);window.s_cards=W;W.d(0,0,937,225,72,100,6,6);W.d(1,1,825,209,72,100,6,6);W.d(2,1,241,329,72,99,6,6);
W.d(3,1,801,1,72,100,6,6);W.d(4,1,697,97,72,100,6,6);W.d(5,1,1,433,72,99,6,6);W.d(6,1,745,209,72,100,6,6);W.d(7,1,881,1,72,100,6,6);W.d(8,1,81,433,72,99,6,6);W.d(9,1,161,433,72,99,6,6);W.d(10,1,857,105,72,100,6,6);W.d(11,1,241,433,72,99,6,6);W.d(12,1,321,433,72,99,6,6);W.d(13,0,937,329,72,100,6,6);W.d(14,1,881,417,72,99,6,6);W.d(15,1,801,417,72,99,6,6);W.d(16,1,721,417,72,99,6,6);W.d(17,1,321,329,72,99,6,6);W.d(18,1,561,457,72,99,6,6);W.d(19,1,481,329,72,99,6,6);W.d(20,1,937,105,72,100,6,6);
W.d(21,1,561,353,72,99,6,6);W.d(22,1,641,409,72,99,6,6);W.d(23,1,585,145,72,100,6,6);W.d(24,1,401,433,72,99,6,6);W.d(25,1,641,513,72,99,6,6);W.d(26,0,945,897,72,100,6,6);W.d(27,1,641,617,72,99,6,6);W.d(28,1,241,537,72,99,6,6);W.d(29,0,681,897,72,100,6,6);W.d(30,0,865,897,72,100,6,6);W.d(31,1,401,537,72,99,6,6);W.d(32,1,561,561,72,99,6,6);W.d(33,1,481,537,72,99,6,6);W.d(34,1,81,537,72,99,6,6);W.d(35,1,721,521,72,99,6,6);W.d(36,1,481,433,72,99,6,6);W.d(37,1,321,537,72,99,6,6);
W.d(38,1,801,521,72,99,6,6);W.d(39,1,1,537,72,99,6,6);W.d(40,1,161,537,72,99,6,6);W.d(41,1,881,521,72,99,6,6);W.d(42,1,401,329,72,99,6,6);W.d(43,1,161,329,72,99,6,6);W.d(44,1,825,313,72,99,6,6);W.d(45,1,745,313,72,99,6,6);W.d(46,1,585,249,72,99,6,6);W.d(47,1,665,305,72,99,6,6);W.d(48,1,905,313,72,99,6,6);W.d(49,1,81,329,72,99,6,6);W.d(50,1,905,209,72,99,6,6);W.d(51,1,1,329,72,99,6,6);var od=new x("s_card_dust",V,9,120,160,60,80,1080,160,9);window.s_card_dust=od;od.d(0,0,689,753,110,136,5,12);
od.d(1,1,585,1,110,136,5,12);od.d(2,0,905,753,110,136,5,12);od.d(3,0,801,753,100,136,10,12);od.d(4,0,585,729,102,138,9,11);od.d(5,0,689,609,102,138,9,11);od.d(6,0,897,609,102,138,9,11);od.d(7,0,793,609,102,138,9,11);od.d(8,0,585,585,102,138,9,11);var pd=new x("s_card_ghost",V,1,84,110,42,55,84,110,1);window.s_card_ghost=pd;pd.d(0,1,665,201,72,100,6,5);var qd=new x("s_card_shadow",V,1,84,110,42,55,84,110,1);window.s_card_shadow=qd;qd.d(0,1,777,105,72,100,6,5);
var sd=new x("s_card_selected",V,1,84,110,42,55,84,110,1);window.s_card_selected=sd;sd.d(0,0,937,1,84,110,0,0);var td=new x("s_card_position_stock",V,1,84,110,42,55,84,110,1);window.s_card_position_stock=td;td.d(0,1,721,625,70,96,7,7);var ud=new x("s_card_position_pile",V,1,84,110,42,55,84,110,1);window.s_card_position_pile=ud;ud.d(0,1,793,625,70,96,7,7);var vd=new x("s_card_position_tempCard",V,1,84,110,42,55,84,110,1);window.s_card_position_tempCard=vd;vd.d(0,1,865,625,70,96,7,7);
var wd=new x("s_effect_selected",V,1,100,132,50,66,100,132,1);window.s_effect_selected=wd;wd.d(0,0,929,457,87,122,6,5);var yd=new x("s_effect_destroy",V,8,189,189,94,94,1512,189,8);window.s_effect_destroy=yd;yd.d(0,0,585,1,174,121,2,35);yd.d(1,0,585,129,173,134,3,27);yd.d(2,0,761,1,174,138,10,28);yd.d(3,0,761,305,171,145,13,25);yd.d(4,0,761,457,160,146,11,23);yd.d(5,0,585,425,169,152,7,21);yd.d(6,0,761,145,172,153,6,20);yd.d(7,0,585,265,171,152,7,21);
var zd=new x("s_effect_appearance",V,1,100,132,50,66,100,132,1);window.s_effect_appearance=zd;zd.d(0,0,585,873,87,122,6,5);var Ad=new x("s_btn_big_start",mc,2,154,152,0,0,308,152,2);window.s_btn_big_start=Ad;Ad.d(0,0,705,865,154,152,0,0);Ad.d(1,0,865,865,154,152,0,0);var Bd=new x("s_btn_small_exit",U,2,100,92,0,0,200,92,2);window.s_btn_small_exit=Bd;Bd.d(0,0,873,441,100,92,0,0);Bd.d(1,0,873,345,100,92,0,0);var Cd=new x("s_btn_small_pause",V,2,100,92,0,0,200,92,2);window.s_btn_small_pause=Cd;
Cd.d(0,0,761,897,100,92,0,0);Cd.d(1,1,697,1,100,92,0,0);var Dd=new x("s_btn_small_options",U,2,100,92,0,0,200,92,2);window.s_btn_small_options=Dd;Dd.d(0,0,873,153,100,92,0,0);Dd.d(1,0,873,249,100,92,0,0);var Ed=new x("s_btn_small_retry",mc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=Ed;Ed.d(0,0,905,745,100,92,0,0);Ed.d(1,0,905,649,100,92,0,0);var Fd=new x("s_btn_standard",U,2,96,92,0,0,192,92,2);window.s_btn_standard=Fd;Fd.d(0,0,801,929,96,92,0,0);Fd.d(1,0,873,537,96,92,0,0);
var Gd=new x("s_btn_toggle",U,2,162,92,0,0,324,92,2);window.s_btn_toggle=Gd;Gd.d(0,0,633,929,162,92,0,0);Gd.d(1,0,465,929,162,92,0,0);var Hd=new x("s_icon_toggle_fxoff",U,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=Hd;Hd.d(0,0,729,737,227,92,0,0);Hd.d(1,0,233,889,227,92,0,0);var Id=new x("s_icon_toggle_fxon",U,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=Id;Id.d(0,0,497,641,227,92,0,0);Id.d(1,0,729,833,227,92,0,0);var Jd=new x("s_icon_toggle_musicoff",U,2,227,92,0,0,454,92,2);
window.s_icon_toggle_musicoff=Jd;Jd.d(0,0,729,641,227,92,0,0);Jd.d(1,0,497,737,227,92,0,0);var Kd=new x("s_icon_toggle_musicon",U,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=Kd;Kd.d(0,0,1,817,227,92,0,0);Kd.d(1,0,497,833,227,92,0,0);var Ld=new x("s_btn_bigtext",kc,2,137,104,0,0,274,104,2);window.s_btn_bigtext=Ld;Ld.d(0,0,865,1,137,104,0,0);Ld.d(1,0,553,57,137,104,0,0);var Md=new x("s_icon_toggle_sfx_on",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=Md;Md.d(0,0,961,721,49,31,7,17);
var Nd=new x("s_icon_toggle_sfx_off",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=Nd;Nd.d(0,0,961,633,53,31,7,17);var Od=new x("s_icon_toggle_music_off",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=Od;Od.d(0,0,961,673,51,41,8,16);var Pd=new x("s_icon_toggle_music_on",U,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=Pd;Pd.d(0,0,977,153,38,41,13,16);var Qd=new x("s_btn_big_undo",U,1,200,92,0,0,200,92,1);window.s_btn_big_undo=Qd;Qd.d(0,0,1,913,200,92,0,0);
var Rd=new x("s_btn_big_restart",U,2,154,152,0,0,308,152,2);window.s_btn_big_restart=Rd;Rd.d(0,1,793,1,154,152,0,0);Rd.d(1,1,633,1,154,152,0,0);var Sd=new x("s_tutorial",U,1,630,587,0,0,630,587,1);window.s_tutorial=Sd;Sd.d(0,1,1,1,630,587,0,0);var Td=new x("s_screen_start",jc,4,576,320,0,0,1152,640,2);window.s_screen_start=Td;Td.d(0,0,1,329,576,320,0,0);Td.d(1,1,1,1,576,320,0,0);Td.d(2,0,1,1,576,320,0,0);Td.d(3,0,1,657,576,320,0,0);var Ud=new x("s_overlay_assignment",nc,1,546,454,0,0,546,454,1);
window.s_overlay_assignment=Ud;Ud.d(0,0,1,1,546,454,0,0);var Vd=new x("s_overlay_options",U,1,864,638,0,0,864,638,1);window.s_overlay_options=Vd;Vd.d(0,0,1,1,864,638,0,0);var Wd=new x("s_overlay_difficulty",mc,1,1152,640,0,0,1152,640,1);window.s_overlay_difficulty=Wd;Wd.d(0,0,1,1,979,640,29,0);var Xd=new x("s_card_back",V,1,84,110,42,55,84,110,1);window.s_card_back=Xd;Xd.d(0,0,937,113,76,105,4,3);var Yd=new x("s_tutorialButton_close",U,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=Yd;
Yd.d(0,1,705,161,65,65,0,0);var Zd=new x("s_tutorialButton_next",U,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=Zd;Zd.d(0,1,953,145,66,65,0,0);var $d=new x("s_tutorialButton_previous",U,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=$d;$d.d(0,1,633,161,66,65,0,0);var ae=new x("s_ui_pyramid_solitaire_easy",nc,1,68,47,0,0,68,47,1);window.s_ui_pyramid_solitaire_easy=ae;ae.d(0,0,905,289,68,47,0,0);var be=new x("s_ui_pyramid_solitaire_medium",nc,1,56,44,0,0,56,44,1);
window.s_ui_pyramid_solitaire_medium=be;be.d(0,0,905,345,56,43,0,1);var ce=new x("s_ui_pyramid_solitaire_hard",nc,1,43,43,0,0,43,43,1);window.s_ui_pyramid_solitaire_hard=ce;ce.d(0,0,977,289,43,43,0,0);var de=new x("s_ui_timeleft",nc,1,26,34,0,0,26,34,1);window.s_ui_timeleft=de;de.d(0,0,969,377,26,34,0,0);var ee=new x("s_ui_undoarrow",nc,1,102,82,102,41,102,82,1);window.s_ui_undoarrow=ee;ee.d(0,0,905,97,100,82,0,0);var fe=new x("s_background",V,4,576,320,0,0,1152,640,2);window.s_background=fe;
fe.d(0,0,1,329,576,320,0,0);fe.d(1,1,1,1,576,320,0,0);fe.d(2,0,1,657,576,320,0,0);fe.d(3,0,1,1,576,320,0,0);var ge=new x("s_logo",kc,1,547,339,0,0,547,339,1);window.s_logo=ge;ge.d(0,0,1,1,547,339,0,0);var he=new x("s_ui_background_blank",nc,1,140,580,0,0,140,580,1);window.s_ui_background_blank=he;he.d(0,0,1009,1,1,1,0,0);var ie=new x("s_logo_preload_tinglygames",jc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=ie;ie.d(0,0,585,1,320,54,0,0);
var je=new x("s_loadingbar_bg",jc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=je;je.d(0,0,913,1,38,20,0,0);var ke=new x("s_loadingbar_fill",jc,1,30,12,0,0,30,12,1);window.s_loadingbar_fill=ke;ke.d(0,0,953,1,30,12,0,0);var le=new x("s_logo_about",U,1,121,121,0,0,121,121,1);window.s_logo_about=le;le.d(0,0,873,65,117,80,2,21);var me=new x("s_logo_poki_about",U,1,123,58,0,0,123,58,1);window.s_logo_poki_about=me;me.d(0,0,873,1,123,58,0,0);var ne=new x("s_logo_poki_start",jc,1,120,60,0,0,120,60,1);
window.s_logo_poki_start=ne;ne.d(0,0,793,57,119,59,1,1);var oe=new x("s_ads_background",jc,1,200,200,100,100,200,200,1);window.s_ads_background=oe;oe.d(0,0,585,57,200,200,0,0);var pe=new wa("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=pe;var Y=new B("f_default","Arial");window.f_default=Y;E(Y,12);Y.fill=!0;Y.setFillColor("Black");Ba(Y,1);Da(Y,!1);Y.setStrokeColor("Black");Fa(Y,1);Ha(Y,"miter");Ea(Y,1);Ga(Y,!1);G(Y,"left");H(Y,"top");Y.Aa=0;Y.ja=0;
var qe=new wa("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=qe;var re=new wa("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=re;var se=new wa("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=se;
var te=new wa("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=te;var ue=new B("ff_opensans_bold","Arial");window.f_game_ui_tiny=ue;E(ue,11);ue.fill=!0;ue.setFillColor("#799EC5");Ba(ue,1);Da(ue,!1);ue.setStrokeColor("White");Fa(ue,1);Ha(ue,"miter");Ea(ue,1);Ga(ue,!1);G(ue,"center");H(ue,"middle");ue.Aa=0;ue.ja=0;var ve=new B("ff_opensans_bold","Arial");window.f_game_ui=ve;E(ve,23);ve.fill=!0;ve.setFillColor("#799EC5");
Ba(ve,1);Da(ve,!1);ve.setStrokeColor("Black");Fa(ve,1);Ha(ve,"miter");Ea(ve,1);Ga(ve,!1);G(ve,"center");H(ve,"middle");ve.Aa=0;ve.ja=0;var we=new B("ff_opensans_bolditalic","Arial");window.f_game_ui_large=we;E(we,52);we.fill=!0;we.setFillColor("#172348");Ba(we,1);Da(we,!1);we.setStrokeColor("Black");Fa(we,1);Ha(we,"miter");Ea(we,1);Ga(we,!1);G(we,"center");H(we,"middle");we.Aa=0;we.ja=0;var xe=new wa("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");
window.floaterFontFaceLoader=xe;var ye=new wa("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=ye;var ze=new B("floaterFontFace","Arial");window.floaterFontText1=ze;E(ze,24);Aa(ze,"normal");ze.fill=!0;ze.setFillColor("#FFDE00");Ba(ze,1);Da(ze,!0);ze.setStrokeColor("#6F1F00");Fa(ze,4);Ha(ze,"miter");Ea(ze,1);Ga(ze,!0);Ia(ze,"rgba(57,0,0,0.46)",4);G(ze,"left");H(ze,"top");ze.Aa=0;ze.ja=0;
var Ae=new B("floaterFontFace","Arial");window.floaterFontText2=Ae;E(Ae,28);Aa(Ae,"normal");Ae.fill=!0;Ca(Ae,2,["#FFF600","#00DB48","blue"],.65,.02);Ba(Ae,1);Da(Ae,!0);Ae.setStrokeColor("#073400");Fa(Ae,4);Ha(Ae,"miter");Ea(Ae,1);Ga(Ae,!0);Ia(Ae,"rgba(0,57,43,0.47)",4);G(Ae,"left");H(Ae,"top");Ae.Aa=0;Ae.ja=0;var Be=new B("floaterFontFace","Arial");window.floaterFontText3=Be;E(Be,30);Aa(Be,"normal");Be.fill=!0;Ca(Be,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Ba(Be,1);Da(Be,!0);Be.setStrokeColor("#4F0027");
Fa(Be,4);Ha(Be,"miter");Ea(Be,1);Ga(Be,!0);Ia(Be,"rgba(41,0,0,0.48)",5);G(Be,"left");H(Be,"top");Be.Aa=0;Be.ja=0;var Ce=new B("floaterFontFace","Arial");window.floaterFontText4=Ce;E(Ce,34);Aa(Ce,"normal");Ce.fill=!0;Ca(Ce,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Ba(Ce,1);Da(Ce,!0);Ce.setStrokeColor("#001637");Fa(Ce,4);Ha(Ce,"miter");Ea(Ce,1);Ga(Ce,!0);Ia(Ce,"rgba(0,35,75,0.49)",6);G(Ce,"left");H(Ce,"top");Ce.Aa=0;Ce.ja=0;var De=new B("floaterNumberFontFace","Arial");
window.floaterFontNumberNegative=De;E(De,30);Aa(De,"normal");De.fill=!0;De.setFillColor("#FF1E00");Ba(De,1);Da(De,!0);De.setStrokeColor("#3F0000");Fa(De,2);Ha(De,"miter");Ea(De,1);Ga(De,!1);Ia(De,"rgba(57,0,0,0.49)",4);G(De,"left");H(De,"top");De.Aa=0;De.ja=0;var Ee=new wa("floaterFontNumberPositive","fonts/floaterFontNumberPositive.woff","fonts/floaterFontNumberPositive.ttf","fonts");window.floaterFontNumberPositiveLoader=Ee;var Fe=new B("floaterFontNumberPositive","Arial");
window.floaterFontNumberPositive=Fe;E(Fe,35);Aa(Fe,"bold");Fe.fill=!0;Fe.setFillColor("White");Ba(Fe,1);Da(Fe,!0);Fe.setStrokeColor("#6C0000");Fa(Fe,6);Ha(Fe,"round");Ea(Fe,1);Ga(Fe,!0);G(Fe,"left");H(Fe,"top");Fe.Aa=0;Fe.ja=0;var Ge=new wa("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");window.f_themeDefaultLoader=Ge;var He=new B("f_themeDefault","Arial");window.f_themeDefault=He;E(He,40);Aa(He,"bold");He.fill=!0;He.setFillColor("#6C0000");Ba(He,1);Da(He,!1);He.setStrokeColor("#6C0000");
Fa(He,10);Ha(He,"miter");Ea(He,1);Ga(He,!0);G(He,"left");H(He,"top");He.Aa=0;He.ja=0;var Ie=new B("f_themeDefault","Arial");window.f_game_ui_title_time=Ie;E(Ie,20);Aa(Ie,"bold");Ie.fill=!0;Ie.setFillColor("White");Ba(Ie,1);Da(Ie,!0);Ie.setStrokeColor("#6C433A");Fa(Ie,6);Ha(Ie,"round");Ea(Ie,1);Ga(Ie,!0);G(Ie,"left");H(Ie,"top");Ie.Aa=0;Ie.ja=0;var Je=new B("f_themeDefault","Arial");window.f_game_ui_title=Je;E(Je,24);Aa(Je,"bold");Je.fill=!0;Je.setFillColor("#6C433A");Ba(Je,1);Da(Je,!1);Je.setStrokeColor("#6C433A");
Fa(Je,0);Ha(Je,"round");Ea(Je,1);Ga(Je,!0);G(Je,"left");H(Je,"top");Je.Aa=0;Je.ja=0;var Ke=new B("f_themeDefault","Arial");window.f_game_ui_value=Ke;E(Ke,24);Aa(Ke,"bold");Ke.fill=!0;Ke.setFillColor("#8F173C");Ba(Ke,1);Da(Ke,!0);Ke.setStrokeColor("#8F173C");Fa(Ke,1);Ha(Ke,"miter");Ea(Ke,1);Ga(Ke,!0);G(Ke,"left");H(Ke,"top");Ke.Aa=0;Ke.ja=0;var Le=new B("Arial","Arial");window.f_tap_to_play=Le;E(Le,28);Aa(Le,"bold");Le.fill=!0;Le.setFillColor("#1b2b34");Ba(Le,1);Da(Le,!1);Le.setStrokeColor("Black");
Fa(Le,28);Ha(Le,"round");Ea(Le,.55);Ga(Le,!1);G(Le,"center");H(Le,"middle");Le.Aa=0;Le.ja=0;var Me=new B("Arial","Arial");window.f_adblocker=Me;E(Me,28);Aa(Me,"normal");Me.fill=!0;Me.setFillColor("White");Ba(Me,1);Da(Me,!1);Me.setStrokeColor("Black");Fa(Me,28);Ha(Me,"round");Ea(Me,.55);Ga(Me,!1);G(Me,"center");H(Me,"middle");Me.Aa=0;Me.ja=0;var Ne=new B("Arial","Arial");window.f_copyright=Ne;E(Ne,22);Aa(Ne,"bold");Ne.fill=!0;Ne.setFillColor("#1b2b34");Ba(Ne,1);Da(Ne,!1);Ne.setStrokeColor("Black");
Fa(Ne,28);Ha(Ne,"round");Ea(Ne,.55);Ga(Ne,!1);G(Ne,"left");H(Ne,"middle");Ne.Aa=0;Ne.ja=0;var Oe=new B("Arial","Arial");window.f_thankyou=Oe;E(Oe,50);Aa(Oe,"bold");Oe.fill=!0;Oe.setFillColor("#1b2b34");Ba(Oe,1);Da(Oe,!1);Oe.setStrokeColor("Black");Fa(Oe,28);Ha(Oe,"round");Ea(Oe,.55);Ga(Oe,!1);G(Oe,"center");H(Oe,"middle");Oe.Aa=0;Oe.ja=0;var Pe=new B("Arial","Arial");window.f_loading_game=Pe;E(Pe,20);Aa(Pe,"bold");Pe.fill=!0;Pe.setFillColor("#1b2b34");Ba(Pe,1);Da(Pe,!1);Pe.setStrokeColor("Black");
Fa(Pe,28);Ha(Pe,"round");Ea(Pe,.55);Ga(Pe,!1);G(Pe,"left");H(Pe,"middle");Pe.Aa=0;Pe.ja=0;var Qe=new B("Arial","Arial");window.f_interstitial=Qe;E(Qe,20);Aa(Qe,"bold");Qe.fill=!0;Qe.setFillColor("#1b2b34");Ba(Qe,.38);Da(Qe,!1);Qe.setStrokeColor("Black");Fa(Qe,28);Ha(Qe,"round");Ea(Qe,.55);Ga(Qe,!1);G(Qe,"center");H(Qe,"middle");Qe.Aa=0;Qe.ja=0;var Re=new lb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=Re;var Se=new J("a_deck_shuffle",Re,0,1164,1,10,["game"]);
window.a_deck_shuffle=Se;var Te=new J("a_card_move",Re,3E3,108,1,10,["game"]);window.a_card_move=Te;var Ue=new J("a_card_flip",Re,5E3,359,1,10,["game"]);window.a_card_flip=Ue;var Ve=new J("a_card_error",Re,7E3,241,1,10,["game"]);window.a_card_error=Ve;var We=new J("a_card_placed",Re,9E3,99,1,10,["game"]);window.a_card_placed=We;var Xe=new J("a_card_selected",Re,11E3,99,1,10,["game"]);window.a_card_selected=Xe;var Ye=new J("a_card_combined",Re,13E3,755,1,10,["game"]);window.a_card_combined=Ye;
var Ze=new J("a_music",Re,15E3,38391,.2,10,["game"]);window.a_music=Ze;var $e=new J("a_levelStart",Re,55E3,1002,1,10,["sfx"]);window.a_levelStart=$e;var af=new J("a_levelComplete",Re,58E3,1002,1,10,["sfx"]);window.a_levelComplete=af;var bf=new J("a_mouseDown",Re,61E3,471,1,10,["sfx"]);window.a_mouseDown=bf;var df=new J("a_levelend_star_01",Re,63E3,1161,1,10,["sfx"]);window.a_levelend_star_01=df;var ef=new J("a_levelend_star_02",Re,66E3,1070,1,10,["sfx"]);window.a_levelend_star_02=ef;
var ff=new J("a_levelend_star_03",Re,69E3,1039,1,10,["sfx"]);window.a_levelend_star_03=ff;var gf=new J("a_levelend_fail",Re,72E3,1572,1,10,["sfx"]);window.a_levelend_fail=gf;var hf=new J("a_levelend_score_counter",Re,75E3,54,1,10,["sfx"]);window.a_levelend_score_counter=hf;var jf=new J("a_levelend_score_end",Re,77E3,888,1,10,["sfx"]);window.a_levelend_score_end=jf;var kf=new J("a_medal",Re,79E3,1225,1,10,["sfx"]);window.a_medal=kf;var Z=Z||{};Z["nl-nl"]=Z["nl-nl"]||{};
Z["nl-nl"].loadingScreenLoading="Laden...";Z["nl-nl"].startScreenPlay="SPELEN";Z["nl-nl"].levelMapScreenTotalScore="Totale score";Z["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";Z["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";Z["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";Z["nl-nl"].levelEndScreenTotalScore="Totale score";Z["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";Z["nl-nl"].levelEndScreenTimeLeft="Tijd over";Z["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";
Z["nl-nl"].levelEndScreenHighScore="High score";Z["nl-nl"].optionsStartScreen="Hoofdmenu";Z["nl-nl"].optionsQuit="Stop";Z["nl-nl"].optionsResume="Terug naar spel";Z["nl-nl"].optionsTutorial="Speluitleg";Z["nl-nl"].optionsHighScore="High scores";Z["nl-nl"].optionsMoreGames="Meer Spellen";Z["nl-nl"].optionsDifficulty_easy="Makkelijk";Z["nl-nl"].optionsDifficulty_medium="Gemiddeld";Z["nl-nl"].optionsDifficulty_hard="Moeilijk";Z["nl-nl"].optionsMusic_on="Aan";Z["nl-nl"].optionsMusic_off="Uit";
Z["nl-nl"].optionsSFX_on="Aan";Z["nl-nl"].optionsSFX_off="Uit";Z["nl-nl"]["optionsLang_en-us"]="Engels (US)";Z["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";Z["nl-nl"]["optionsLang_nl-nl"]="Nederlands";Z["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";Z["nl-nl"].gameEndScreenBtnText="Ga verder";Z["nl-nl"].optionsTitle="Instellingen";Z["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";
Z["nl-nl"].optionsQuitConfirmBtn_No="Nee";Z["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";Z["nl-nl"].levelMapScreenTitle="Kies een level";Z["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";Z["nl-nl"].optionsRestart="Herstart";Z["nl-nl"].optionsSFXBig_on="Geluid aan";Z["nl-nl"].optionsSFXBig_off="Geluid uit";Z["nl-nl"].optionsAbout_title="Over ons";Z["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";
Z["nl-nl"].optionsAbout_backBtn="Terug";Z["nl-nl"].optionsAbout_version="versie:";Z["nl-nl"].optionsAbout="Over ons";Z["nl-nl"].levelEndScreenMedal="VERBETERD!";Z["nl-nl"].startScreenQuestionaire="Wat vind jij?";Z["nl-nl"].levelMapScreenWorld_0="Kies een level";Z["nl-nl"].startScreenByTinglyGames="door: CoolGames";Z["nl-nl"]["optionsLang_de-de"]="Duits";Z["nl-nl"]["optionsLang_tr-tr"]="Turks";Z["nl-nl"].optionsAbout_header="Ontwikkeld door:";Z["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";
Z["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";Z["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";Z["nl-nl"].challengeStartTextScore="Punten van <NAME>:";Z["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";Z["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";Z["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";Z["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";
Z["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";Z["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";Z["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";Z["nl-nl"].challengeCancelConfirmBtn_yes="Ja";Z["nl-nl"].challengeCancelConfirmBtn_no="Nee";Z["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";
Z["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";Z["nl-nl"].challengeEndScreenName_you="Jij";Z["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";Z["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";Z["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";
Z["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";Z["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";Z["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";Z["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";Z["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";
Z["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";Z["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";Z["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";Z["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";Z["nl-nl"].challengeForfeitConfirmBtn_no="Nee";Z["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";
Z["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";Z["nl-nl"].optionsChallengeForfeit="Geef op";Z["nl-nl"].optionsChallengeCancel="Stop";Z["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";Z["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";Z["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";
Z["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";Z["nl-nl"]["optionsLang_fr-fr"]="Frans";Z["nl-nl"]["optionsLang_ko-kr"]="Koreaans";Z["nl-nl"]["optionsLang_ar-eg"]="Arabisch";Z["nl-nl"]["optionsLang_es-es"]="Spaans";Z["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";Z["nl-nl"]["optionsLang_ru-ru"]="Russisch";Z["nl-nl"].optionsExit="Stoppen";Z["nl-nl"].levelEndScreenTotalScore_number="Totale score:";Z["nl-nl"].levelEndScreenHighScore_number="Topscore:";
Z["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";Z["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";Z["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";
Z["nl-nl"].optionsAbout_header_publisher="Published by:";Z["nl-nl"]["optionsLang_jp-jp"]="Japans";Z["nl-nl"]["optionsLang_it-it"]="Italiaans";Z["en-us"]=Z["en-us"]||{};Z["en-us"].loadingScreenLoading="Loading...";Z["en-us"].startScreenPlay="PLAY";Z["en-us"].levelMapScreenTotalScore="Total score";Z["en-us"].levelEndScreenTitle_level="Level <VALUE>";Z["en-us"].levelEndScreenTitle_difficulty="Well done!";Z["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";Z["en-us"].levelEndScreenTotalScore="Total score";
Z["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";Z["en-us"].levelEndScreenTimeLeft="Time remaining";Z["en-us"].levelEndScreenTimeBonus="Time bonus";Z["en-us"].levelEndScreenHighScore="High score";Z["en-us"].optionsStartScreen="Main menu";Z["en-us"].optionsQuit="Quit";Z["en-us"].optionsResume="Resume";Z["en-us"].optionsTutorial="How to play";Z["en-us"].optionsHighScore="High scores";Z["en-us"].optionsMoreGames="More Games";Z["en-us"].optionsDifficulty_easy="Easy";
Z["en-us"].optionsDifficulty_medium="Medium";Z["en-us"].optionsDifficulty_hard="Difficult";Z["en-us"].optionsMusic_on="On";Z["en-us"].optionsMusic_off="Off";Z["en-us"].optionsSFX_on="On";Z["en-us"].optionsSFX_off="Off";Z["en-us"]["optionsLang_en-us"]="English (US)";Z["en-us"]["optionsLang_en-gb"]="English (GB)";Z["en-us"]["optionsLang_nl-nl"]="Dutch";Z["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";Z["en-us"].gameEndScreenBtnText="Continue";Z["en-us"].optionsTitle="Settings";
Z["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";Z["en-us"].optionsQuitConfirmBtn_No="No";Z["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";Z["en-us"].levelMapScreenTitle="Select a level";Z["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";Z["en-us"].optionsRestart="Restart";
Z["en-us"].optionsSFXBig_on="Sound on";Z["en-us"].optionsSFXBig_off="Sound off";Z["en-us"].optionsAbout_title="About";Z["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["en-us"].optionsAbout_backBtn="Back";Z["en-us"].optionsAbout_version="version:";Z["en-us"].optionsAbout="About";Z["en-us"].levelEndScreenMedal="IMPROVED!";Z["en-us"].startScreenQuestionaire="What do you think?";Z["en-us"].levelMapScreenWorld_0="Select a level";Z["en-us"].startScreenByTinglyGames="by: CoolGames";
Z["en-us"]["optionsLang_de-de"]="German";Z["en-us"]["optionsLang_tr-tr"]="Turkish";Z["en-us"].optionsAbout_header="Developed by:";Z["en-us"].levelEndScreenViewHighscoreBtn="View scores";Z["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";Z["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["en-us"].challengeStartTextScore="<NAME>'s score:";Z["en-us"].challengeStartTextTime="<NAME>'s time:";Z["en-us"].challengeStartScreenToWin="Amount to win:";
Z["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["en-us"].challengeCancelConfirmBtn_yes="Yes";Z["en-us"].challengeCancelConfirmBtn_no="No";Z["en-us"].challengeEndScreensBtn_submit="Submit challenge";Z["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";Z["en-us"].challengeEndScreenName_you="You";Z["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
Z["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";
Z["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";Z["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";Z["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["en-us"].challengeForfeitConfirmBtn_yes="Yes";Z["en-us"].challengeForfeitConfirmBtn_no="No";Z["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";
Z["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["en-us"].optionsChallengeForfeit="Forfeit";Z["en-us"].optionsChallengeCancel="Quit";Z["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["en-us"].levelEndScreenHighScore_time="Best time:";Z["en-us"].levelEndScreenTotalScore_time="Total time:";
Z["en-us"]["optionsLang_fr-fr"]="French";Z["en-us"]["optionsLang_ko-kr"]="Korean";Z["en-us"]["optionsLang_ar-eg"]="Arabic";Z["en-us"]["optionsLang_es-es"]="Spanish";Z["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";Z["en-us"]["optionsLang_ru-ru"]="Russian";Z["en-us"].optionsExit="Exit";Z["en-us"].levelEndScreenTotalScore_number="Total score:";Z["en-us"].levelEndScreenHighScore_number="High score:";Z["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["en-us"].optionsAbout_header_publisher="Published by:";Z["en-us"]["optionsLang_jp-jp"]="Japanese";Z["en-us"]["optionsLang_it-it"]="Italian";Z["en-gb"]=Z["en-gb"]||{};Z["en-gb"].loadingScreenLoading="Loading...";
Z["en-gb"].startScreenPlay="PLAY";Z["en-gb"].levelMapScreenTotalScore="Total score";Z["en-gb"].levelEndScreenTitle_level="Level <VALUE>";Z["en-gb"].levelEndScreenTitle_difficulty="Well done!";Z["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";Z["en-gb"].levelEndScreenTotalScore="Total score";Z["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";Z["en-gb"].levelEndScreenTimeLeft="Time remaining";Z["en-gb"].levelEndScreenTimeBonus="Time bonus";Z["en-gb"].levelEndScreenHighScore="High score";
Z["en-gb"].optionsStartScreen="Main menu";Z["en-gb"].optionsQuit="Quit";Z["en-gb"].optionsResume="Resume";Z["en-gb"].optionsTutorial="How to play";Z["en-gb"].optionsHighScore="High scores";Z["en-gb"].optionsMoreGames="More Games";Z["en-gb"].optionsDifficulty_easy="Easy";Z["en-gb"].optionsDifficulty_medium="Medium";Z["en-gb"].optionsDifficulty_hard="Difficult";Z["en-gb"].optionsMusic_on="On";Z["en-gb"].optionsMusic_off="Off";Z["en-gb"].optionsSFX_on="On";Z["en-gb"].optionsSFX_off="Off";
Z["en-gb"]["optionsLang_en-us"]="English (US)";Z["en-gb"]["optionsLang_en-gb"]="English (GB)";Z["en-gb"]["optionsLang_nl-nl"]="Dutch";Z["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";Z["en-gb"].gameEndScreenBtnText="Continue";Z["en-gb"].optionsTitle="Settings";Z["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";Z["en-gb"].optionsQuitConfirmBtn_No="No";
Z["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";Z["en-gb"].levelMapScreenTitle="Select a level";Z["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";Z["en-gb"].optionsRestart="Restart";Z["en-gb"].optionsSFXBig_on="Sound on";Z["en-gb"].optionsSFXBig_off="Sound off";Z["en-gb"].optionsAbout_title="About";Z["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
Z["en-gb"].optionsAbout_backBtn="Back";Z["en-gb"].optionsAbout_version="version:";Z["en-gb"].optionsAbout="About";Z["en-gb"].levelEndScreenMedal="IMPROVED!";Z["en-gb"].startScreenQuestionaire="What do you think?";Z["en-gb"].levelMapScreenWorld_0="Select a level";Z["en-gb"].startScreenByTinglyGames="by: CoolGames";Z["en-gb"]["optionsLang_de-de"]="German";Z["en-gb"]["optionsLang_tr-tr"]="Turkish";Z["en-gb"].optionsAbout_header="Developed by:";Z["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
Z["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";Z["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["en-gb"].challengeStartTextScore="<NAME>'s score:";Z["en-gb"].challengeStartTextTime="<NAME>'s time:";Z["en-gb"].challengeStartScreenToWin="Amount to win:";Z["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
Z["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";Z["en-gb"].challengeCancelConfirmBtn_yes="Yes";Z["en-gb"].challengeCancelConfirmBtn_no="No";Z["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
Z["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";Z["en-gb"].challengeEndScreenName_you="You";Z["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";Z["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
Z["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";Z["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
Z["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";Z["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";Z["en-gb"].challengeForfeitConfirmBtn_yes="Yes";Z["en-gb"].challengeForfeitConfirmBtn_no="No";Z["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";Z["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
Z["en-gb"].optionsChallengeForfeit="Forfeit";Z["en-gb"].optionsChallengeCancel="Quit";Z["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["en-gb"].levelEndScreenHighScore_time="Best time:";Z["en-gb"].levelEndScreenTotalScore_time="Total time:";Z["en-gb"]["optionsLang_fr-fr"]="French";Z["en-gb"]["optionsLang_ko-kr"]="Korean";Z["en-gb"]["optionsLang_ar-eg"]="Arabic";
Z["en-gb"]["optionsLang_es-es"]="Spanish";Z["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";Z["en-gb"]["optionsLang_ru-ru"]="Russian";Z["en-gb"].optionsExit="Exit";Z["en-gb"].levelEndScreenTotalScore_number="Total score:";Z["en-gb"].levelEndScreenHighScore_number="High score:";Z["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["en-gb"].optionsAbout_header_publisher="Published by:";Z["en-gb"]["optionsLang_jp-jp"]="Japanese";Z["en-gb"]["optionsLang_it-it"]="Italian";Z["de-de"]=Z["de-de"]||{};Z["de-de"].loadingScreenLoading="Laden ...";
Z["de-de"].startScreenPlay="SPIELEN";Z["de-de"].levelMapScreenTotalScore="Gesamtpunkte";Z["de-de"].levelEndScreenTitle_level="Level <VALUE>";Z["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";Z["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";Z["de-de"].levelEndScreenTotalScore="Gesamtpunkte";Z["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";Z["de-de"].levelEndScreenTimeLeft="Restzeit";Z["de-de"].levelEndScreenTimeBonus="Zeitbonus";Z["de-de"].levelEndScreenHighScore="Highscore";
Z["de-de"].optionsStartScreen="Hauptmen\u00fc";Z["de-de"].optionsQuit="Beenden";Z["de-de"].optionsResume="Weiterspielen";Z["de-de"].optionsTutorial="So wird gespielt";Z["de-de"].optionsHighScore="Highscores";Z["de-de"].optionsMoreGames="Weitere Spiele";Z["de-de"].optionsDifficulty_easy="Einfach";Z["de-de"].optionsDifficulty_medium="Mittel";Z["de-de"].optionsDifficulty_hard="Schwer";Z["de-de"].optionsMusic_on="EIN";Z["de-de"].optionsMusic_off="AUS";Z["de-de"].optionsSFX_on="EIN";
Z["de-de"].optionsSFX_off="AUS";Z["de-de"]["optionsLang_en-us"]="Englisch (US)";Z["de-de"]["optionsLang_en-gb"]="Englisch (GB)";Z["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";Z["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";Z["de-de"].gameEndScreenBtnText="Weiter";Z["de-de"].optionsTitle="Einstellungen";Z["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
Z["de-de"].optionsQuitConfirmBtn_No="NEIN";Z["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";Z["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";Z["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";Z["de-de"].optionsRestart="Neustart";Z["de-de"].optionsSFXBig_on="Sound EIN";Z["de-de"].optionsSFXBig_off="Sound AUS";Z["de-de"].optionsAbout_title="\u00dcber";
Z["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["de-de"].optionsAbout_backBtn="Zur\u00fcck";Z["de-de"].optionsAbout_version="Version:";Z["de-de"].optionsAbout="\u00dcber";Z["de-de"].levelEndScreenMedal="VERBESSERT!";Z["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";Z["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";Z["de-de"].startScreenByTinglyGames="von: CoolGames";Z["de-de"]["optionsLang_de-de"]="Deutsch";Z["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
Z["de-de"].optionsAbout_header="Entwickelt von:";Z["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";Z["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";Z["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";Z["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";Z["de-de"].challengeStartTextTime="Zeit von <NAME>:";Z["de-de"].challengeStartScreenToWin="Einsatz:";Z["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
Z["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";Z["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";Z["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";Z["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";Z["de-de"].challengeCancelConfirmBtn_yes="Ja";Z["de-de"].challengeCancelConfirmBtn_no="Nein";
Z["de-de"].challengeEndScreensBtn_submit="Herausfordern";Z["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";Z["de-de"].challengeEndScreenName_you="Du";Z["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";Z["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";Z["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
Z["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";Z["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";Z["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";Z["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";Z["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
Z["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";Z["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";Z["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";Z["de-de"].challengeForfeitConfirmBtn_yes="Ja";Z["de-de"].challengeForfeitConfirmBtn_no="Nein";Z["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";Z["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
Z["de-de"].optionsChallengeForfeit="Aufgeben";Z["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";Z["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";Z["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";Z["de-de"].levelEndScreenHighScore_time="Bestzeit:";Z["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
Z["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";Z["de-de"]["optionsLang_ko-kr"]="Koreanisch";Z["de-de"]["optionsLang_ar-eg"]="Arabisch";Z["de-de"]["optionsLang_es-es"]="Spanisch";Z["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";Z["de-de"]["optionsLang_ru-ru"]="Russisch";Z["de-de"].optionsExit="Verlassen";Z["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";Z["de-de"].levelEndScreenHighScore_number="Highscore:";Z["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
Z["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";Z["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["de-de"].optionsAbout_header_publisher="Published by:";Z["de-de"]["optionsLang_jp-jp"]="Japanese";Z["de-de"]["optionsLang_it-it"]="Italian";Z["fr-fr"]=Z["fr-fr"]||{};Z["fr-fr"].loadingScreenLoading="Chargement...";
Z["fr-fr"].startScreenPlay="JOUER";Z["fr-fr"].levelMapScreenTotalScore="Score total";Z["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";Z["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";Z["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";Z["fr-fr"].levelEndScreenTotalScore="Score total";Z["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";Z["fr-fr"].levelEndScreenTimeLeft="Temps restant";Z["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
Z["fr-fr"].levelEndScreenHighScore="Meilleur score";Z["fr-fr"].optionsStartScreen="Menu principal";Z["fr-fr"].optionsQuit="Quitter";Z["fr-fr"].optionsResume="Reprendre";Z["fr-fr"].optionsTutorial="Comment jouer";Z["fr-fr"].optionsHighScore="Meilleurs scores";Z["fr-fr"].optionsMoreGames="Plus de jeux";Z["fr-fr"].optionsDifficulty_easy="Facile";Z["fr-fr"].optionsDifficulty_medium="Moyen";Z["fr-fr"].optionsDifficulty_hard="Difficile";Z["fr-fr"].optionsMusic_on="Avec";Z["fr-fr"].optionsMusic_off="Sans";
Z["fr-fr"].optionsSFX_on="Avec";Z["fr-fr"].optionsSFX_off="Sans";Z["fr-fr"]["optionsLang_en-us"]="Anglais (US)";Z["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";Z["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";Z["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";Z["fr-fr"].gameEndScreenBtnText="Continuer";Z["fr-fr"].optionsTitle="Param\u00e8tres";Z["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
Z["fr-fr"].optionsQuitConfirmBtn_No="Non";Z["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";Z["fr-fr"].levelMapScreenTitle="Choisir un niveau";Z["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";Z["fr-fr"].optionsRestart="Recommencer";Z["fr-fr"].optionsSFXBig_on="Avec son";Z["fr-fr"].optionsSFXBig_off="Sans son";Z["fr-fr"].optionsAbout_title="\u00c0 propos";
Z["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["fr-fr"].optionsAbout_backBtn="Retour";Z["fr-fr"].optionsAbout_version="Version :";Z["fr-fr"].optionsAbout="\u00c0 propos";Z["fr-fr"].levelEndScreenMedal="RECORD BATTU !";Z["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";Z["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";Z["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";Z["fr-fr"]["optionsLang_de-de"]="Allemand";Z["fr-fr"]["optionsLang_tr-tr"]="Turc";
Z["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";Z["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";Z["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";Z["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";Z["fr-fr"].challengeStartTextScore="Son score :";Z["fr-fr"].challengeStartTextTime="Son temps\u00a0:";Z["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";Z["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
Z["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";Z["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";Z["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";Z["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";Z["fr-fr"].challengeCancelConfirmBtn_yes="Oui";Z["fr-fr"].challengeCancelConfirmBtn_no="Non";Z["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
Z["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";Z["fr-fr"].challengeEndScreenName_you="Moi";Z["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";Z["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";Z["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";Z["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
Z["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";Z["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";Z["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";Z["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";Z["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
Z["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";Z["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";Z["fr-fr"].challengeForfeitConfirmBtn_no="Non";Z["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";Z["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";Z["fr-fr"].optionsChallengeForfeit="Abandonner";Z["fr-fr"].optionsChallengeCancel="Annuler";Z["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
Z["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";Z["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";Z["fr-fr"].levelEndScreenTotalScore_time="Temps total :";Z["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";Z["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";Z["fr-fr"]["optionsLang_ar-eg"]="Arabe";Z["fr-fr"]["optionsLang_es-es"]="Espagnol";Z["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
Z["fr-fr"]["optionsLang_ru-ru"]="Russe";Z["fr-fr"].optionsExit="Quitter";Z["fr-fr"].levelEndScreenTotalScore_number="Score total :";Z["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";Z["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";Z["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
Z["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["fr-fr"].optionsAbout_header_publisher="Published by:";Z["fr-fr"]["optionsLang_jp-jp"]="Japanese";Z["fr-fr"]["optionsLang_it-it"]="Italian";Z["pt-br"]=Z["pt-br"]||{};Z["pt-br"].loadingScreenLoading="Carregando...";Z["pt-br"].startScreenPlay="JOGAR";Z["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";Z["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";Z["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
Z["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";Z["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";Z["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";Z["pt-br"].levelEndScreenTimeLeft="Tempo restante";Z["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";Z["pt-br"].levelEndScreenHighScore="Recorde";Z["pt-br"].optionsStartScreen="Menu principal";Z["pt-br"].optionsQuit="Sair";Z["pt-br"].optionsResume="Continuar";Z["pt-br"].optionsTutorial="Como jogar";
Z["pt-br"].optionsHighScore="Recordes";Z["pt-br"].optionsMoreGames="Mais jogos";Z["pt-br"].optionsDifficulty_easy="F\u00e1cil";Z["pt-br"].optionsDifficulty_medium="M\u00e9dio";Z["pt-br"].optionsDifficulty_hard="Dif\u00edcil";Z["pt-br"].optionsMusic_on="Sim";Z["pt-br"].optionsMusic_off="N\u00e3o";Z["pt-br"].optionsSFX_on="Sim";Z["pt-br"].optionsSFX_off="N\u00e3o";Z["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";Z["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";Z["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
Z["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";Z["pt-br"].gameEndScreenBtnText="Continuar";Z["pt-br"].optionsTitle="Configura\u00e7\u00f5es";Z["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";Z["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";Z["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";Z["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
Z["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";Z["pt-br"].optionsRestart="Reiniciar";Z["pt-br"].optionsSFXBig_on="Com som";Z["pt-br"].optionsSFXBig_off="Sem som";Z["pt-br"].optionsAbout_title="Sobre";Z["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["pt-br"].optionsAbout_backBtn="Voltar";Z["pt-br"].optionsAbout_version="vers\u00e3o:";
Z["pt-br"].optionsAbout="Sobre";Z["pt-br"].levelEndScreenMedal="MELHOROU!";Z["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";Z["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";Z["pt-br"].startScreenByTinglyGames="da: CoolGames";Z["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";Z["pt-br"]["optionsLang_tr-tr"]="Turco";Z["pt-br"].optionsAbout_header="Desenvolvido por:";Z["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";Z["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
Z["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["pt-br"].challengeStartTextScore="<NAME>'s score:";Z["pt-br"].challengeStartTextTime="<NAME>'s time:";Z["pt-br"].challengeStartScreenToWin="Amount to win:";Z["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
Z["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";Z["pt-br"].challengeCancelConfirmBtn_yes="Yes";Z["pt-br"].challengeCancelConfirmBtn_no="No";Z["pt-br"].challengeEndScreensBtn_submit="Submit challenge";Z["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";Z["pt-br"].challengeEndScreenName_you="You";
Z["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";Z["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
Z["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";Z["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";Z["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";Z["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
Z["pt-br"].challengeForfeitConfirmBtn_yes="Yes";Z["pt-br"].challengeForfeitConfirmBtn_no="No";Z["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";Z["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["pt-br"].optionsChallengeForfeit="Desistir";Z["pt-br"].optionsChallengeCancel="Sair do Jogo";Z["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
Z["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";Z["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";Z["pt-br"].levelEndScreenTotalScore_time="Tempo total:";Z["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";Z["pt-br"]["optionsLang_ko-kr"]="Coreano";Z["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";Z["pt-br"]["optionsLang_es-es"]="Espanhol";Z["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
Z["pt-br"]["optionsLang_ru-ru"]="Russo";Z["pt-br"].optionsExit="Sa\u00edda";Z["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";Z["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";Z["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["pt-br"].optionsAbout_header_publisher="Published by:";Z["pt-br"]["optionsLang_jp-jp"]="Japanese";Z["pt-br"]["optionsLang_it-it"]="Italian";Z["es-es"]=Z["es-es"]||{};Z["es-es"].loadingScreenLoading="Cargando...";
Z["es-es"].startScreenPlay="JUGAR";Z["es-es"].levelMapScreenTotalScore="Punt. total";Z["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";Z["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";Z["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";Z["es-es"].levelEndScreenTotalScore="Punt. total";Z["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";Z["es-es"].levelEndScreenTimeLeft="Tiempo restante";Z["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
Z["es-es"].levelEndScreenHighScore="R\u00e9cord";Z["es-es"].optionsStartScreen="Men\u00fa principal";Z["es-es"].optionsQuit="Salir";Z["es-es"].optionsResume="Seguir";Z["es-es"].optionsTutorial="C\u00f3mo jugar";Z["es-es"].optionsHighScore="R\u00e9cords";Z["es-es"].optionsMoreGames="M\u00e1s juegos";Z["es-es"].optionsDifficulty_easy="F\u00e1cil";Z["es-es"].optionsDifficulty_medium="Normal";Z["es-es"].optionsDifficulty_hard="Dif\u00edcil";Z["es-es"].optionsMusic_on="S\u00ed";
Z["es-es"].optionsMusic_off="No";Z["es-es"].optionsSFX_on="S\u00ed";Z["es-es"].optionsSFX_off="No";Z["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";Z["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";Z["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";Z["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";Z["es-es"].gameEndScreenBtnText="Continuar";Z["es-es"].optionsTitle="Ajustes";Z["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
Z["es-es"].optionsQuitConfirmBtn_No="No";Z["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";Z["es-es"].levelMapScreenTitle="Elige un nivel";Z["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";Z["es-es"].optionsRestart="Reiniciar";Z["es-es"].optionsSFXBig_on="Sonido s\u00ed";Z["es-es"].optionsSFXBig_off="Sonido no";Z["es-es"].optionsAbout_title="Acerca de";
Z["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["es-es"].optionsAbout_backBtn="Atr\u00e1s";Z["es-es"].optionsAbout_version="versi\u00f3n:";Z["es-es"].optionsAbout="Acerca de";Z["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";Z["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";Z["es-es"].levelMapScreenWorld_0="Elige un nivel";Z["es-es"].startScreenByTinglyGames="de: CoolGames";Z["es-es"]["optionsLang_de-de"]="Alem\u00e1n";Z["es-es"]["optionsLang_tr-tr"]="Turco";
Z["es-es"].optionsAbout_header="Desarrollado por:";Z["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";Z["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";Z["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["es-es"].challengeStartTextScore="<NAME>'s score:";Z["es-es"].challengeStartTextTime="<NAME>'s time:";Z["es-es"].challengeStartScreenToWin="Amount to win:";Z["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
Z["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";Z["es-es"].challengeCancelConfirmBtn_yes="Yes";Z["es-es"].challengeCancelConfirmBtn_no="No";
Z["es-es"].challengeEndScreensBtn_submit="Submit challenge";Z["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";Z["es-es"].challengeEndScreenName_you="You";Z["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";Z["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
Z["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";Z["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
Z["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";Z["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";Z["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["es-es"].challengeForfeitConfirmBtn_yes="Yes";Z["es-es"].challengeForfeitConfirmBtn_no="No";Z["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";Z["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
Z["es-es"].optionsChallengeForfeit="Rendirse";Z["es-es"].optionsChallengeCancel="Abandonar";Z["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";Z["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";Z["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";Z["es-es"].levelEndScreenTotalScore_time="Tiempo total:";Z["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";Z["es-es"]["optionsLang_ko-kr"]="Coreano";
Z["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";Z["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";Z["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";Z["es-es"]["optionsLang_ru-ru"]="Ruso";Z["es-es"].optionsExit="Salir";Z["es-es"].levelEndScreenTotalScore_number="Puntos totales:";Z["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";Z["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["es-es"].optionsAbout_header_publisher="Published by:";Z["es-es"]["optionsLang_jp-jp"]="Japanese";Z["es-es"]["optionsLang_it-it"]="Italian";Z["tr-tr"]=Z["tr-tr"]||{};Z["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
Z["tr-tr"].startScreenPlay="OYNA";Z["tr-tr"].levelMapScreenTotalScore="Toplam skor";Z["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";Z["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";Z["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";Z["tr-tr"].levelEndScreenTotalScore="Toplam skor";Z["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";Z["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";Z["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
Z["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";Z["tr-tr"].optionsStartScreen="Ana men\u00fc";Z["tr-tr"].optionsQuit="\u00c7\u0131k";Z["tr-tr"].optionsResume="Devam et";Z["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";Z["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";Z["tr-tr"].optionsMoreGames="Daha Fazla Oyun";Z["tr-tr"].optionsDifficulty_easy="Kolay";Z["tr-tr"].optionsDifficulty_medium="Orta";Z["tr-tr"].optionsDifficulty_hard="Zorluk";Z["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
Z["tr-tr"].optionsMusic_off="Kapal\u0131";Z["tr-tr"].optionsSFX_on="A\u00e7\u0131k";Z["tr-tr"].optionsSFX_off="Kapal\u0131";Z["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";Z["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";Z["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";Z["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";Z["tr-tr"].gameEndScreenBtnText="Devam";Z["tr-tr"].optionsTitle="Ayarlar";Z["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
Z["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";Z["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";Z["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";Z["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";Z["tr-tr"].optionsRestart="Tekrar ba\u015flat";Z["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";Z["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
Z["tr-tr"].optionsAbout_title="Hakk\u0131nda";Z["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["tr-tr"].optionsAbout_backBtn="Geri";Z["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";Z["tr-tr"].optionsAbout="Hakk\u0131nda";Z["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";Z["tr-tr"].startScreenQuestionaire="Ne dersin?";Z["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";Z["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
Z["tr-tr"]["optionsLang_de-de"]="Almanca";Z["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";Z["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";Z["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";Z["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";Z["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["tr-tr"].challengeStartTextScore="<NAME>'s score:";Z["tr-tr"].challengeStartTextTime="<NAME>'s time:";
Z["tr-tr"].challengeStartScreenToWin="Amount to win:";Z["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["tr-tr"].challengeCancelConfirmBtn_yes="Yes";Z["tr-tr"].challengeCancelConfirmBtn_no="No";Z["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";Z["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";Z["tr-tr"].challengeEndScreenName_you="You";Z["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
Z["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
Z["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";Z["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";Z["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";Z["tr-tr"].challengeForfeitConfirmBtn_no="No";Z["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
Z["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";Z["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";Z["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";Z["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
Z["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";Z["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";Z["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";Z["tr-tr"]["optionsLang_ko-kr"]="Korece";Z["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";Z["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";Z["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";Z["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";Z["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";Z["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
Z["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";Z["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";Z["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
Z["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["tr-tr"].optionsAbout_header_publisher="Published by:";Z["tr-tr"]["optionsLang_jp-jp"]="Japanese";Z["tr-tr"]["optionsLang_it-it"]="Italian";Z["ru-ru"]=Z["ru-ru"]||{};Z["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";Z["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";Z["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
Z["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";Z["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";Z["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";Z["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";Z["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
Z["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";Z["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";Z["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";Z["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";Z["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
Z["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";Z["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";Z["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";Z["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";Z["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";Z["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
Z["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";Z["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";Z["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";Z["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";Z["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";Z["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";Z["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
Z["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";Z["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";Z["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";Z["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
Z["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
Z["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";Z["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";Z["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";Z["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
Z["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";Z["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";Z["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";Z["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";Z["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";Z["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";Z["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
Z["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";Z["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";Z["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";Z["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";Z["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
Z["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";Z["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";Z["ru-ru"].optionsAbout_header="Developed by:";Z["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";Z["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";Z["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["ru-ru"].challengeStartTextScore="<NAME>'s score:";
Z["ru-ru"].challengeStartTextTime="<NAME>'s time:";Z["ru-ru"].challengeStartScreenToWin="Amount to win:";Z["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["ru-ru"].challengeCancelConfirmBtn_yes="Yes";Z["ru-ru"].challengeCancelConfirmBtn_no="No";Z["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";Z["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";Z["ru-ru"].challengeEndScreenName_you="You";Z["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
Z["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
Z["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";Z["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";Z["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";Z["ru-ru"].challengeForfeitConfirmBtn_no="No";Z["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
Z["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["ru-ru"].optionsChallengeForfeit="Forfeit";Z["ru-ru"].optionsChallengeCancel="Quit";Z["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["ru-ru"].levelEndScreenHighScore_time="Best time:";Z["ru-ru"].levelEndScreenTotalScore_time="Total time:";
Z["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";Z["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";Z["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";Z["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";Z["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
Z["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";Z["ru-ru"].optionsExit="Exit";Z["ru-ru"].levelEndScreenTotalScore_number="Total score:";Z["ru-ru"].levelEndScreenHighScore_number="High score:";Z["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["ru-ru"].optionsAbout_header_publisher="Published by:";Z["ru-ru"]["optionsLang_jp-jp"]="Japanese";Z["ru-ru"]["optionsLang_it-it"]="Italian";Z["ar-eg"]=Z["ar-eg"]||{};Z["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
Z["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";Z["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";Z["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";Z["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";Z["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";Z["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
Z["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";Z["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";Z["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";Z["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
Z["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";Z["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";Z["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";Z["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";Z["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
Z["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";Z["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";Z["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";Z["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";Z["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";Z["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
Z["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";Z["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";Z["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
Z["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";Z["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";Z["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";Z["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
Z["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";Z["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
Z["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";Z["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";Z["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";Z["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
Z["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";Z["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";Z["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";Z["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";Z["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
Z["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";Z["ar-eg"].optionsAbout="\u062d\u0648\u0644";Z["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";Z["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";Z["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";Z["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
Z["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";Z["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";Z["ar-eg"].optionsAbout_header="Developed by:";Z["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";Z["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";Z["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["ar-eg"].challengeStartTextScore="<NAME>'s score:";
Z["ar-eg"].challengeStartTextTime="<NAME>'s time:";Z["ar-eg"].challengeStartScreenToWin="Amount to win:";Z["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["ar-eg"].challengeCancelConfirmBtn_yes="Yes";Z["ar-eg"].challengeCancelConfirmBtn_no="No";Z["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";Z["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";Z["ar-eg"].challengeEndScreenName_you="You";Z["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
Z["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
Z["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";Z["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";Z["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";Z["ar-eg"].challengeForfeitConfirmBtn_no="No";Z["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
Z["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["ar-eg"].optionsChallengeForfeit="Forfeit";Z["ar-eg"].optionsChallengeCancel="Quit";Z["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["ar-eg"].levelEndScreenHighScore_time="Best time:";Z["ar-eg"].levelEndScreenTotalScore_time="Total time:";
Z["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";Z["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";Z["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";Z["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";Z["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
Z["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";Z["ar-eg"].optionsExit="Exit";Z["ar-eg"].levelEndScreenTotalScore_number="Total score:";Z["ar-eg"].levelEndScreenHighScore_number="High score:";Z["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["ar-eg"].optionsAbout_header_publisher="Published by:";Z["ar-eg"]["optionsLang_jp-jp"]="Japanese";Z["ar-eg"]["optionsLang_it-it"]="Italian";Z["ko-kr"]=Z["ko-kr"]||{};Z["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
Z["ko-kr"].startScreenPlay="PLAY";Z["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";Z["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";Z["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";Z["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";Z["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";Z["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";Z["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
Z["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";Z["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";Z["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";Z["ko-kr"].optionsQuit="\uc885\ub8cc";Z["ko-kr"].optionsResume="\uacc4\uc18d";Z["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";Z["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";Z["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";Z["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
Z["ko-kr"].optionsDifficulty_medium="\uc911";Z["ko-kr"].optionsDifficulty_hard="\uc0c1";Z["ko-kr"].optionsMusic_on="\ucf1c\uae30";Z["ko-kr"].optionsMusic_off="\ub044\uae30";Z["ko-kr"].optionsSFX_on="\ucf1c\uae30";Z["ko-kr"].optionsSFX_off="\ub044\uae30";Z["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";Z["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";Z["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";Z["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
Z["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";Z["ko-kr"].optionsTitle="\uc124\uc815";Z["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";Z["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";Z["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
Z["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";Z["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";Z["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";Z["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";Z["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
Z["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";Z["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";Z["ko-kr"].optionsAbout_version="\ubc84\uc804:";Z["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";Z["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";Z["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";Z["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
Z["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";Z["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";Z["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";Z["ko-kr"].optionsAbout_header="Developed by:";Z["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";Z["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";Z["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";Z["ko-kr"].challengeStartTextScore="<NAME>'s score:";
Z["ko-kr"].challengeStartTextTime="<NAME>'s time:";Z["ko-kr"].challengeStartScreenToWin="Amount to win:";Z["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";Z["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";Z["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["ko-kr"].challengeCancelConfirmBtn_yes="Yes";Z["ko-kr"].challengeCancelConfirmBtn_no="No";Z["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";Z["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";Z["ko-kr"].challengeEndScreenName_you="You";Z["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
Z["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";Z["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
Z["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";Z["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";Z["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";Z["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";Z["ko-kr"].challengeForfeitConfirmBtn_no="No";Z["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
Z["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";Z["ko-kr"].optionsChallengeForfeit="Forfeit";Z["ko-kr"].optionsChallengeCancel="Quit";Z["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["ko-kr"].levelEndScreenHighScore_time="Best time:";Z["ko-kr"].levelEndScreenTotalScore_time="Total time:";
Z["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";Z["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";Z["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";Z["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";Z["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";Z["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";Z["ko-kr"].optionsExit="Exit";Z["ko-kr"].levelEndScreenTotalScore_number="Total score:";
Z["ko-kr"].levelEndScreenHighScore_number="High score:";Z["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";Z["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
Z["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["ko-kr"].optionsAbout_header_publisher="Published by:";Z["ko-kr"]["optionsLang_jp-jp"]="Japanese";Z["ko-kr"]["optionsLang_it-it"]="Italian";Z["jp-jp"]=Z["jp-jp"]||{};Z["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";Z["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";Z["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";Z["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
Z["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";Z["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";Z["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";Z["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";Z["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";Z["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";Z["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
Z["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";Z["jp-jp"].optionsQuit="\u3084\u3081\u308b";Z["jp-jp"].optionsResume="\u518d\u958b";Z["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";Z["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";Z["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";Z["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";Z["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";Z["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
Z["jp-jp"].optionsMusic_on="\u30aa\u30f3";Z["jp-jp"].optionsMusic_off="\u30aa\u30d5";Z["jp-jp"].optionsSFX_on="\u30aa\u30f3";Z["jp-jp"].optionsSFX_off="\u30aa\u30d5";Z["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";Z["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";Z["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";Z["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
Z["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";Z["jp-jp"].optionsTitle="\u8a2d\u5b9a";Z["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";Z["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";Z["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
Z["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";Z["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";Z["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";Z["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";Z["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
Z["jp-jp"].optionsAbout_title="About";Z["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";Z["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";Z["jp-jp"].optionsAbout_version="version";Z["jp-jp"].optionsAbout="About";Z["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";Z["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";Z["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";Z["jp-jp"].startScreenByTinglyGames="by: CoolGames";
Z["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";Z["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";Z["jp-jp"].optionsAbout_header="Developed by";Z["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";Z["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";Z["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";Z["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
Z["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";Z["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";Z["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";Z["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";Z["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";Z["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";Z["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
Z["jp-jp"].challengeCancelConfirmBtn_yes="Yes";Z["jp-jp"].challengeCancelConfirmBtn_no="No";Z["jp-jp"].challengeEndScreensBtn_submit="\u3042";Z["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";Z["jp-jp"].challengeEndScreenName_you="You";Z["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";Z["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";Z["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
Z["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";Z["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";Z["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";Z["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";Z["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
Z["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";Z["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";Z["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";Z["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";Z["jp-jp"].challengeForfeitConfirmBtn_no="No";Z["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";Z["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
Z["jp-jp"].optionsChallengeForfeit="Forfeit";Z["jp-jp"].optionsChallengeCancel="Quit";Z["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";Z["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";Z["jp-jp"].levelEndScreenHighScore_time="Best time:";Z["jp-jp"].levelEndScreenTotalScore_time="Total time:";Z["jp-jp"]["optionsLang_fr-fr"]="French";Z["jp-jp"]["optionsLang_ko-kr"]="Korean";Z["jp-jp"]["optionsLang_ar-eg"]="Arabic";
Z["jp-jp"]["optionsLang_es-es"]="Spanish";Z["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";Z["jp-jp"]["optionsLang_ru-ru"]="Russian";Z["jp-jp"].optionsExit="Exit";Z["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";Z["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";Z["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
Z["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";Z["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";Z["jp-jp"].optionsAbout_header_publisher="Published by:";Z["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";Z["jp-jp"]["optionsLang_it-it"]="Italian";Z["it-it"]=Z["it-it"]||{};Z["it-it"].loadingScreenLoading="Caricamento...";
Z["it-it"].startScreenPlay="GIOCA";Z["it-it"].levelMapScreenTotalScore="Punteggio totale";Z["it-it"].levelEndScreenTitle_level="Livello <VALUE>";Z["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";Z["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";Z["it-it"].levelEndScreenTotalScore="Punteggio totale";Z["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";Z["it-it"].levelEndScreenTimeLeft="Tempo rimanente";Z["it-it"].levelEndScreenTimeBonus="Tempo bonus";
Z["it-it"].levelEndScreenHighScore="Record";Z["it-it"].optionsStartScreen="Menu principale";Z["it-it"].optionsQuit="Esci";Z["it-it"].optionsResume="Riprendi";Z["it-it"].optionsTutorial="Come si gioca";Z["it-it"].optionsHighScore="Record";Z["it-it"].optionsMoreGames="Altri giochi";Z["it-it"].optionsDifficulty_easy="Facile";Z["it-it"].optionsDifficulty_medium="Media";Z["it-it"].optionsDifficulty_hard="Difficile";Z["it-it"].optionsMusic_on="S\u00ec";Z["it-it"].optionsMusic_off="No";
Z["it-it"].optionsSFX_on="S\u00ec";Z["it-it"].optionsSFX_off="No";Z["it-it"]["optionsLang_en-us"]="Inglese (US)";Z["it-it"]["optionsLang_en-gb"]="Inglese (UK)";Z["it-it"]["optionsLang_nl-nl"]="Olandese";Z["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";Z["it-it"].gameEndScreenBtnText="Continua";Z["it-it"].optionsTitle="Impostazioni";Z["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
Z["it-it"].optionsQuitConfirmBtn_No="No";Z["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";Z["it-it"].levelMapScreenTitle="Scegli un livello";Z["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";Z["it-it"].optionsRestart="Riavvia";Z["it-it"].optionsSFXBig_on="Audio S\u00cc";Z["it-it"].optionsSFXBig_off="Audio NO";Z["it-it"].optionsAbout_title="Informazioni";Z["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
Z["it-it"].optionsAbout_backBtn="Indietro";Z["it-it"].optionsAbout_version="versione:";Z["it-it"].optionsAbout="Informazioni";Z["it-it"].levelEndScreenMedal="MIGLIORATO!";Z["it-it"].startScreenQuestionaire="Che ne pensi?";Z["it-it"].levelMapScreenWorld_0="Scegli un livello";Z["it-it"].startScreenByTinglyGames="di: CoolGames";Z["it-it"]["optionsLang_de-de"]="Tedesco";Z["it-it"]["optionsLang_tr-tr"]="Turco";Z["it-it"].optionsAbout_header="Sviluppato da:";Z["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
Z["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";Z["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";Z["it-it"].challengeStartTextScore="punteggio di <NAME>:";Z["it-it"].challengeStartTextTime="tempo di <NAME>:";Z["it-it"].challengeStartScreenToWin="Necessario per vincere:";Z["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";Z["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
Z["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";Z["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";Z["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";Z["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";Z["it-it"].challengeCancelConfirmBtn_no="No";Z["it-it"].challengeEndScreensBtn_submit="Invia la sfida";Z["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
Z["it-it"].challengeEndScreenName_you="Tu";Z["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";Z["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";Z["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";Z["it-it"].challengeCancelMessage_success="Sfida annullata.";Z["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
Z["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";Z["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";Z["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";Z["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";Z["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";Z["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
Z["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";Z["it-it"].challengeForfeitConfirmBtn_no="No";Z["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";Z["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";Z["it-it"].optionsChallengeForfeit="Abbandona";Z["it-it"].optionsChallengeCancel="Esci";Z["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";Z["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
Z["it-it"].levelEndScreenHighScore_time="Miglior tempo:";Z["it-it"].levelEndScreenTotalScore_time="Tempo totale:";Z["it-it"]["optionsLang_fr-fr"]="Francese";Z["it-it"]["optionsLang_ko-kr"]="Coreano";Z["it-it"]["optionsLang_ar-eg"]="Arabo";Z["it-it"]["optionsLang_es-es"]="Spagnolo";Z["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";Z["it-it"]["optionsLang_ru-ru"]="Russo";Z["it-it"].optionsExit="Esci";Z["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
Z["it-it"].levelEndScreenHighScore_number="Record:";Z["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";Z["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
Z["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";Z["it-it"].optionsAbout_header_publisher="Distribuito da:";Z["it-it"]["optionsLang_jp-jp"]="Giapponese";Z["it-it"]["optionsLang_it-it"]="Italiano";Z=Z||{};Z["nl-nl"]=Z["nl-nl"]||{};Z["nl-nl"].game_ui_SCORE="SCORE";Z["nl-nl"].game_ui_STAGE="LEVEL";Z["nl-nl"].game_ui_LIVES="LEVENS";Z["nl-nl"].game_ui_TIME="TIJD";Z["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";Z["nl-nl"].game_ui_LEVEL="LEVEL";Z["nl-nl"].game_ui_time_left="Resterende tijd";
Z["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";Z["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";Z["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";Z["en-us"]=Z["en-us"]||{};Z["en-us"].game_ui_SCORE="SCORE";Z["en-us"].game_ui_STAGE="STAGE";Z["en-us"].game_ui_LIVES="LIVES";Z["en-us"].game_ui_TIME="TIME";Z["en-us"].game_ui_HIGHSCORE="HIGH SCORE";Z["en-us"].game_ui_LEVEL="LEVEL";Z["en-us"].game_ui_time_left="Time left";Z["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";Z["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
Z["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";Z["en-gb"]=Z["en-gb"]||{};Z["en-gb"].game_ui_SCORE="SCORE";Z["en-gb"].game_ui_STAGE="STAGE";Z["en-gb"].game_ui_LIVES="LIVES";Z["en-gb"].game_ui_TIME="TIME";Z["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";Z["en-gb"].game_ui_LEVEL="LEVEL";Z["en-gb"].game_ui_time_left="Time left";Z["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";Z["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";Z["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";Z["de-de"]=Z["de-de"]||{};
Z["de-de"].game_ui_SCORE="PUNKTE";Z["de-de"].game_ui_STAGE="STUFE";Z["de-de"].game_ui_LIVES="LEBEN";Z["de-de"].game_ui_TIME="ZEIT";Z["de-de"].game_ui_HIGHSCORE="HIGHSCORE";Z["de-de"].game_ui_LEVEL="LEVEL";Z["de-de"].game_ui_time_left="Restzeit";Z["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";Z["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";Z["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";Z["fr-fr"]=Z["fr-fr"]||{};Z["fr-fr"].game_ui_SCORE="SCORE";Z["fr-fr"].game_ui_STAGE="SC\u00c8NE";
Z["fr-fr"].game_ui_LIVES="VIES";Z["fr-fr"].game_ui_TIME="TEMPS";Z["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";Z["fr-fr"].game_ui_LEVEL="NIVEAU";Z["fr-fr"].game_ui_time_left="Temps restant";Z["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";Z["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";Z["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";Z["pt-br"]=Z["pt-br"]||{};Z["pt-br"].game_ui_SCORE="PONTOS";Z["pt-br"].game_ui_STAGE="FASE";Z["pt-br"].game_ui_LIVES="VIDAS";Z["pt-br"].game_ui_TIME="TEMPO";
Z["pt-br"].game_ui_HIGHSCORE="RECORDE";Z["pt-br"].game_ui_LEVEL="N\u00cdVEL";Z["pt-br"].game_ui_time_left="Tempo restante";Z["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";Z["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";Z["pt-br"].game_ui_HIGHSCORE_break="RECORDE";Z["es-es"]=Z["es-es"]||{};Z["es-es"].game_ui_SCORE="PUNTOS";Z["es-es"].game_ui_STAGE="FASE";Z["es-es"].game_ui_LIVES="VIDAS";Z["es-es"].game_ui_TIME="TIEMPO";Z["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
Z["es-es"].game_ui_LEVEL="NIVEL";Z["es-es"].game_ui_time_left="Tiempo restante";Z["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";Z["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";Z["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";Z["tr-tr"]=Z["tr-tr"]||{};Z["tr-tr"].game_ui_SCORE="SKOR";Z["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";Z["tr-tr"].game_ui_LIVES="HAYATLAR";Z["tr-tr"].game_ui_TIME="S\u00dcRE";Z["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";Z["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
Z["tr-tr"].game_ui_time_left="Kalan zaman";Z["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";Z["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";Z["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";Z["ru-ru"]=Z["ru-ru"]||{};Z["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";Z["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";Z["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";Z["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
Z["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";Z["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";Z["ru-ru"].game_ui_time_left="Time left";Z["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";Z["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";Z["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";Z["ar-eg"]=Z["ar-eg"]||{};Z["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";Z["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
Z["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";Z["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";Z["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";Z["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";Z["ar-eg"].game_ui_time_left="Time left";Z["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";Z["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";Z["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
Z["ko-kr"]=Z["ko-kr"]||{};Z["ko-kr"].game_ui_SCORE="\uc810\uc218";Z["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";Z["ko-kr"].game_ui_LIVES="\uae30\ud68c";Z["ko-kr"].game_ui_TIME="\uc2dc\uac04";Z["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";Z["ko-kr"].game_ui_LEVEL="\ub808\ubca8";Z["ko-kr"].game_ui_time_left="Time left";Z["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";Z["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";Z["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
Z["jp-jp"]=Z["jp-jp"]||{};Z["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";Z["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";Z["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";Z["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";Z["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";Z["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";Z["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";Z["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";Z["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
Z["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";Z["it-it"]=Z["it-it"]||{};Z["it-it"].game_ui_SCORE="PUNTEGGIO";Z["it-it"].game_ui_STAGE="FASE";Z["it-it"].game_ui_LIVES="VITE";Z["it-it"].game_ui_TIME="TEMPO";Z["it-it"].game_ui_HIGHSCORE="RECORD";Z["it-it"].game_ui_LEVEL="LIVELLO";Z["it-it"].game_ui_time_left="TEMPO RIMANENTE";Z["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";Z["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";Z["it-it"].game_ui_HIGHSCORE_break="RECORD";
var lf={};
function mf(){lf={Ud:{Sd:"en-us",Pj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Kd:{Gc:S(1040),wq:S(960),Tb:S(640),Eg:S(640),tf:S(0),Vk:S(-80),sf:0,minHeight:S(780),Em:{id:"canvasBackground",depth:50},Wc:{id:"canvasGame",depth:100,top:S(200,"round"),left:S(40,"round"),width:S(560,"round"),height:S(560,"round")},Dc:{id:"canvasGameUI",depth:150,top:0,left:0,height:S(120,"round")},of:{id:"canvasMain",depth:200}},Fm:{Gc:S(640),wq:S(640),Tb:S(1152),Eg:S(1152),
tf:S(0),Vk:S(0),sf:0,minHeight:S(640),minWidth:S(850),Em:{id:"canvasBackground",depth:50},Wc:{id:"canvasGame",depth:100,top:S(40,"round"),left:S(296,"round"),width:S(560,"round"),height:S(560,"round")},Dc:{id:"canvasGameUI",depth:150,top:0,left:S(151),width:S(140)},of:{id:"canvasMain",depth:200}},Sb:{bigPlay:{type:"text",s:Ld,wa:S(38),nb:S(99),font:{align:"center",j:"middle",fontSize:T({big:46,small:30}),fillColor:"#01198a",P:{i:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Sc:2,Tc:S(30),fontSize:T({big:46,
small:30})},difficulty_toggle:{type:"toggleText",s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"0",s:Hc,N:"optionsDifficulty_easy"},{id:"1",s:Gc,N:"optionsDifficulty_medium"},{id:"2",s:Fc,N:"optionsDifficulty_hard"}],qh:S(30),rh:S(12),bg:S(10),Sc:2,Tc:S(30),fontSize:T({big:40,small:20})},music_toggle:{type:"toggle",s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,
small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"on",s:Kd,N:"optionsMusic_on"},{id:"off",s:Jd,N:"optionsMusic_off"}],qh:S(30),rh:S(12),bg:0,Sc:2,Tc:S(30)},sfx_toggle:{type:"toggle",s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"on",s:Id,N:"optionsSFX_on"},{id:"off",s:Hd,N:"optionsSFX_off"}],qh:S(30),rh:S(12),bg:0,Sc:2,Tc:S(30)},music_big_toggle:{type:"toggleText",
s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"on",s:"undefined"!==typeof Pd?Pd:void 0,N:"optionsMusic_on"},{id:"off",s:"undefined"!==typeof Od?Od:void 0,N:"optionsMusic_off"}],qh:S(28,"round"),rh:S(10),bg:S(10),Sc:2,Tc:S(30),fontSize:T({big:40,small:20})},sfx_big_toggle:{type:"toggleText",s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",
P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"on",s:"undefined"!==typeof Md?Md:void 0,N:"optionsSFXBig_on"},{id:"off",s:"undefined"!==typeof Nd?Nd:void 0,N:"optionsSFXBig_off"}],qh:S(33,"round"),rh:S(12),bg:S(10),Sc:2,Tc:S(30),fontSize:T({big:40,small:20})},language_toggle:{type:"toggleText",s:Gd,wa:S(106),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},R:[{id:"en-us",s:Ic,N:"optionsLang_en-us"},
{id:"en-gb",s:Jc,N:"optionsLang_en-gb"},{id:"nl-nl",s:Kc,N:"optionsLang_nl-nl"},{id:"de-de",s:Mc,N:"optionsLang_de-de"},{id:"fr-fr",s:Nc,N:"optionsLang_fr-fr"},{id:"pt-br",s:Oc,N:"optionsLang_pt-br"},{id:"es-es",s:Pc,N:"optionsLang_es-es"},{id:"ru-ru",s:Rc,N:"optionsLang_ru-ru"},{id:"it-it",s:Uc,N:"optionsLang_it-it"},{id:"ar-eg",s:Sc,N:"optionsLang_ar-eg"},{id:"ko-kr",s:Tc,N:"optionsLang_ko-kr"},{id:"tr-tr",s:Lc,N:"optionsLang_tr-tr"},{id:"jp-jp",s:Qc,N:"optionsLang_jp-jp"}],qh:S(40),rh:S(20),bg:S(10),
Sc:2,Tc:S(30),fontSize:T({big:40,small:20})},default_text:{type:"text",s:Fd,wa:S(40),nb:S(40),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Sc:2,Tc:S(30),fontSize:T({big:40,small:20})},default_image:{type:"image",s:Fd,wa:S(40),nb:S(40),Tc:S(6)},options:{type:"image",s:Dd}},Dm:{bigPlay:{type:"text",s:Ld,wa:S(40),nb:S(76),font:{align:"center",j:"middle",fontSize:T({big:40,small:20}),fillColor:"#01198a",P:{i:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Sc:2,Tc:S(30),fontSize:T({big:40,small:20})}},Vj:{green:{font:{align:"center",j:"middle",fillColor:"#018a17",P:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",j:"middle",fillColor:"#01198a",P:{i:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",j:"middle",fillColor:"#004f89",P:{i:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",j:"middle",fillColor:"#9a1900",P:{i:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",j:"middle",fillColor:"#8d2501",P:{i:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",j:"middle",fillColor:"#c6258f",P:{i:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",j:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",j:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",j:"middle",fillColor:"#ffffff",P:{i:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",j:"middle",fillColor:"#ffffff",P:{i:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ca:{fy:20},cd:{backgroundImage:"undefined"!==typeof Td?Td:void 0,ww:0,ru:500,Ok:5E3,gw:5E3,Ms:-1,cy:12,by:100,le:S(78),dp:{align:"center"},Hl:S(560),Tg:S(400),Ug:{align:"center"},Mf:S(680),Ie:S(16),Yn:S(18),Qi:S(8),Rr:S(8),Sr:S(9),Tr:S(9),pj:{align:"center",fillColor:"#3B0057",fontSize:S(24)},qt:{align:"center"},
rt:S(620),Gl:S(500),Ri:"center",Of:S(500),Ti:S(60),zb:{align:"center"},rc:{align:"bottom",offset:S(20)},co:S(806),ao:500,Xv:S(20)},$n:{Ri:"right",Hl:S(280),Mf:S(430),Of:S(340),zb:{align:"right",offset:S(32)},rc:S(560),co:S(560)},Al:{Bm:S(860),backgroundImage:void 0!==typeof Td?Td:void 0,cv:700,hs:1800,sw:700,Rw:2600,Mg:void 0!==typeof Td?ge:void 0,ad:700,Ng:{align:"center"},Di:{align:"center"},Ei:void 0!==typeof ge?-ge.height:0,Lg:{align:"top",offset:S(20)},rn:1,$q:1,sn:1,ar:1,qn:1,Zq:1,gv:O,hv:gc,
ev:O,fv:O,dv:O,ts:{align:"center"},$i:S(656),$g:S(300),jl:700,Qw:700,Qm:S(368),ui:S(796),Fg:S(440),zq:700,ko:S(36),Uk:S(750),rw:500,Ri:"center",Of:S(500),Ti:S(60),zb:{align:"center"},rc:{align:"bottom",offset:S(20)},co:S(806),ao:500,Xv:S(20)},Wo:{Bm:S(0),$i:S(456),$g:S(320),Qm:{align:"center"},ui:S(346),Fg:S(460),ko:{align:"left",offset:S(32)},Uk:S(528),Ri:"right",Of:S(340),zb:{align:"right",offset:S(32)},rc:S(560),co:S(560)},Sg:{Kw:{align:"center",offset:S(-230)},ro:{align:"top",offset:S(576)},Jw:"options",
ld:{j:"bottom"},Ye:{align:"center"},vc:{align:"top",offset:S(35,"round")},Dd:S(232),Xe:S(98),zy:{align:"center",offset:S(-206)},yp:{align:"top",offset:S(30)},yy:{align:"center",offset:S(206)},xp:{align:"top",offset:S(30)},type:"grid",Gw:3,iA:3,Hw:5,jA:4,Cq:!0,Qu:!0,En:S(78),er:{align:"top",offset:S(140)},gr:{align:"top",offset:S(140)},fr:S(20),nv:S(18),ov:S(18),Lv:{xn:{fontSize:T({big:60,small:30}),fillColor:"#3F4F5E",align:"center",j:"middle",P:{i:!0,color:"#D0D8EA",offsetX:0,offsetY:S(6),blur:0}}},
Mv:{xn:{fontSize:T({big:32,small:16}),fillColor:"#3F4F5E",align:"center",j:"middle",P:{i:!0,color:"#D0D8EA",offsetX:0,offsetY:S(2),blur:0}}},Nr:S(438),Or:S(438),Er:{align:"center"},Fr:{align:"center"},Vr:{align:"center"},Wr:{align:"center",offset:S(-22)},Ir:{align:"center"},Jr:{align:"center",offset:S(-10)},Gx:{align:"center",offset:S(216)},Qs:{align:"top",offset:S(574)},Fx:{fontSize:T({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Rs:S(10),us:{fontSize:T({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},vs:{align:"center"},ws:{align:"top",offset:S(588)},Uw:S(160),Tw:S(40),backgroundImage:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,Yx:S(10),Zx:200,Xx:S(200),Hz:S(600),Bw:800,Aw:500},Gr:{yp:{align:"top",offset:S(20)},xp:{align:"top",offset:S(20)},vc:{align:"top",offset:S(25,"round")},En:S(234),er:{align:"top",offset:S(110)},gr:{align:"top",offset:S(110)},Qs:{align:"top",offset:S(536)},ws:{align:"top",offset:S(550)},ro:{align:"top",offset:S(538)}},Jk:{Oc:"undefined"!==
typeof Ud?Ud:void 0,ms:{align:"center"},ns:"undefined"!==typeof Ud?-Ud.height:void 0,Wi:[{type:"y",aa:0,duration:800,end:{align:"center",offset:S(-142)},Wa:gc,Nb:$e}],vo:[{type:"y",aa:0,duration:600,end:"undefined"!==typeof Ud?-Ud.height:void 0,Wa:fc,gq:!0}],Wp:{align:"center",j:"middle"},lu:{align:"center"},Xp:0,ei:S(500),pm:S(80),ir:{align:"center",j:"middle"},wv:{align:"center"},jr:0,Li:S(560),On:S(80),rs:3500},Xn:{Wi:[{type:"y",aa:0,duration:800,end:{align:"center"},Wa:gc,Nb:$e}]},Sy:{Oc:"undefined"!==
typeof s_overlay_challenge_start?s_overlay_challenge_start:void 0,ms:{align:"center"},ns:S(56),el:0,fl:0,ld:{align:"center",j:"top"},Dd:S(500),Xe:S(100),Ye:{align:"center"},vc:S(90),Sz:{align:"center",j:"middle"},Xz:S(500),Wz:S(80),aA:{align:"center"},bA:S(250),MA:{align:"center",j:"top"},OA:S(500),NA:S(40),PA:{align:"center"},QA:S(348),LA:{align:"center",j:"top"},SA:S(500),RA:S(50),UA:{align:"center"},VA:S(388),AB:{align:"center",j:"top"},CB:S(500),BB:S(40),FB:{align:"center"},GB:S(442),DB:0,EB:0,
zB:{align:"center",j:"top"},IB:S(500),HB:S(50),JB:{align:"center"},KB:S(482),yB:S(10),wB:0,xB:0,ci:800,Nj:gc,nm:600,om:fc,rs:3500},Ry:{Cy:500,ci:800,fA:1500,gA:500,TA:2500,YA:500,WA:3200,XA:800,Nz:4200,Oz:300,Jy:4500,oA:{align:"center"},pA:S(-800),mA:{align:"center"},nA:S(52),el:0,fl:0,mk:.8,Lq:"#000000",lo:{align:"center",j:"middle"},Pz:S(360),Kz:S(120),Lz:S(4),Mz:S(4),Qz:{align:"center"},Rz:S(340),jB:{align:"center"},kB:S(600),iB:S(500),hB:S(120),gB:{align:"center",j:"middle"},LB:{align:"center",
j:"middle"},PB:S(360),MB:S(60),NB:S(4),OB:S(4),QB:{align:"center"},RB:S(480),pB:S(460),lB:{align:"center"},mB:S(400),Ky:{align:"center"},Ly:S(500),dA:{align:"center",j:"middle"},eA:S(75,"round"),cA:S(48),hA:S(120),$z:S(214,"round"),Tz:S(40),Uz:S(4),Vz:S(4),Yz:0,Zz:0,fz:{align:"center",j:"middle"},iz:S(220),hz:S(180),gz:S(80),dz:S(4),ez:S(4)},na:{dl:{eb:"undefined"!==typeof Wd?Wd:void 0,Uu:"undefined"!==typeof s_overlay_endless?s_overlay_endless:void 0,Nv:"undefined"!==typeof s_overlay_level_win?s_overlay_level_win:
void 0,Kv:"undefined"!==typeof s_overlay_level_fail?s_overlay_level_fail:void 0},ay:500,ci:800,Nj:gc,nm:800,om:bc,Yb:{align:"center"},Zb:0,ld:{align:"center",j:"middle",fontSize:T({big:26,small:13})},Ye:{align:"center"},vc:S(58),Dd:S(500),Xe:S(100),Tx:{align:"center",j:"middle",fontSize:T({big:56,small:28})},Ux:{align:"center"},Vx:S(236),Wm:{align:"center",j:"top",fontSize:T({big:24,small:12})},Xm:{align:"center"},ik:S(144),wi:{align:"center",j:"top",fontSize:T({big:56,small:28})},xi:{align:"center"},
Hg:S(176),kk:S(200),jk:S(60),kj:{align:"center",j:"top",fontSize:T({big:24,small:12})},ee:{align:"center"},Pe:S(286),Xs:S(0),Sq:!1,hd:S(14),lj:S(10),Zf:{align:"center",j:"top",fontSize:T({big:24,small:12})},jh:S(10),kh:S(4),lh:S(200),fB:S(50),ou:{align:"center",offset:S(12)},tm:S(549),Tq:{align:"center",offset:S(162)},fn:S(489),rf:{align:"center",offset:S(250)},xe:S(10),Ag:S(90),qf:S(90),Qo:{align:"center",offset:S(-177,"round")},Ro:S(120),So:{align:"center"},To:S(96),Uo:{align:"center",offset:S(179,
"round")},Vo:S(120),dB:200,Bx:500,Ns:800,Ps:0,Ex:0,Dx:300,Cx:200,Os:300,mk:.8,xb:800,Lq:"#000000",Sk:S(508),Tk:S(394),Yr:S(96),Zr:S(74),Qk:3,Wg:400,hw:2500,Jz:0,kw:S(100),$r:1.5,pw:{align:"center"},qw:S(76),Rk:S(180),ow:S(36),as:{align:"center",j:"middle",fontSize:T({big:22,small:12}),jb:"ff_opensans_extrabold",fillColor:"#1d347f",P:{i:!0,color:"#68cbfa",offsetY:S(2)}},Xr:500,iw:500,jw:S(-30),mw:500,lw:0,nw:4E3,Kl:600,ny:1500,iq:500,vg:750,yv:{align:"center"},zv:S(290),mr:S(350),yw:1E3,type:{level:{Sj:"level",
Qc:!0,hh:!0,qj:"title_level",Qe:"totalScore",Qj:"retry",pk:"next"},failed:{Sj:"failed",Qc:!1,hh:!1,qj:"title_level",bt:"subtitle_failed",Qj:"exit",pk:"retry"},endless:{Sj:"endless",Qc:!1,hh:!0,qj:"title_endless",Ym:"totalScore",Qe:"highScore",Qj:"exit",pk:"retry"},difficulty:{Sj:"difficulty",Qc:!1,hh:!0,qj:"title_difficulty",Ym:"timeLeft",Qe:["totalScore","timeBonus"],Qj:"exit",pk:"retry"}}},Dr:{xe:S(0),vc:S(30),ik:S(114),Hg:S(146),Pe:S(266),tm:S(488),fn:S(428),Sk:{align:"center",offset:S(220)},Tk:S(260)},
Ni:{backgroundImage:"undefined"!==typeof fe?fe:void 0},options:{backgroundImage:Vd,Yb:{align:"center"},Zb:0,ld:{},Ye:{align:"center"},vc:S(58),Dd:S(500),Xe:S(100),Xj:S(460,"round"),Wj:{align:"center"},ki:{align:"center",offset:S(36)},qd:S(10,"round"),rf:S(510),xe:S(10),Ag:S(130),qf:S(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames",
"quit"]},bl:800,cl:gc,to:600,uo:bc,tq:{align:"center"},Km:S(260),ak:S(460),Jm:S(300),rq:{align:"center"},Im:S(460),qq:{align:"center"},Hm:S(560,"round"),pi:S(460,"round"),pl:{},md:"undefined"!==typeof Sd?Sd:void 0,Ml:{align:"center"},Ze:S(84,"round"),Ql:{align:"center",j:"top"},Rl:S(480),mp:S(46),Gt:{align:"center"},Sl:S(110,"round"),Et:{align:"center"},Ol:S(160,"round"),Ft:{align:"center"},Pl:S(446,"round"),Nl:{j:"middle",align:"center",fontSize:T({big:36,small:18})},uh:S(480),lp:S(160),Dt:{align:"center",
offset:S(-80,"round")},kp:S(556,"round"),Ct:{align:"center",offset:S(80,"round")},jp:S(556,"round"),Jj:{align:"center",j:"top",fillColor:"#3C0058",fontSize:T({big:26,small:13}),ja:S(6)},Kj:S(480),jm:S(50),Lj:{align:"center"},og:S(106,"round"),$h:{align:"center",j:"top",fillColor:"#3C0058",fontSize:T({big:26,small:13}),ja:S(6)},hf:S(480),pg:S(110),qg:{align:"center"},rg:S(396,"round"),Yh:{align:"center"},Zh:S(140),im:{align:"center"},Wh:S(500),Xh:S(480),km:{align:"center",j:"top",fillColor:"#808080",
fontSize:T({big:12,small:8})},Rp:{align:"center"},lm:S(610),Qp:S(440),Pp:S(20),sg:S(200),Mj:S(200),tp:S(80),up:S(140),Ot:S(10)},Lw:{vc:S(12),ki:{align:"center",offset:S(16)},Km:S(200),Jm:S(300),Im:S(400),Hm:S(500,"round"),Ze:S(60,"round"),Sl:S(80,"round"),Ol:S(134,"round"),Pl:S(410,"round"),kp:S(500,"round"),jp:S(500,"round"),og:S(86,"round"),Zh:S(126),rg:S(392,"round"),Wh:S(490),lm:S(590)},is:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:Vd,Yb:{align:"center"},
Zb:S(120),ld:{},Ye:{align:"center"},vc:S(200),Xj:S(460,"round"),Wj:{align:"center"},ki:{align:"center",offset:S(140)},qd:S(10,"round"),rf:S(510),xe:S(10),Ag:S(130),qf:S(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},bl:800,cl:gc,to:600,uo:bc,pl:{},EA:{align:"center"},FA:S(360),DA:S(460),CA:S(300),yA:"default_text",zA:{align:"center"},
AA:S(630),vA:"default_text",wA:{align:"center"},xA:S(730,"round"),BA:S(460,"round"),sq:{},tq:{align:"center"},Km:S(200),ak:S(460),Jm:S(250),rq:{align:"center"},Im:S(520),qq:{align:"center"},Hm:S(620,"round"),pi:S(460,"round"),lo:{},uw:{align:"center"},vw:S(200),mo:S(460),tw:S(300),md:"undefined"!==typeof Sd?Sd:void 0,Ml:{align:"center"},Ze:S(0,"round"),Ql:{align:"center",j:"top"},Rl:S(480),mp:S(50),Gt:{align:"center"},Sl:S(20,"round"),Et:{align:"center"},Ol:S(70,"round"),Ft:{align:"center"},Pl:S(356,
"round"),Nl:{j:"middle",align:"center",fontSize:T({big:36,small:18})},uh:S(480),lp:S(150),Dt:S(224,"round"),kp:S(636,"round"),Ct:S(350,"round"),jp:S(636,"round"),Jj:{align:"center",j:"top",fillColor:"#3C0058",fontSize:T({big:26,small:13}),ja:S(6)},Kj:S(480),jm:S(50),Lj:{align:"center"},og:S(26,"round"),$h:{align:"center",j:"top",fillColor:"#3C0058",fontSize:T({big:26,small:13}),ja:S(6)},hf:S(480),pg:S(110),qg:{align:"center"},rg:S(316,"round"),Yh:{align:"center"},Zh:S(60),im:{align:"center"},Wh:S(420),
Xh:S(480),km:{align:"center",j:"top",fillColor:"#808080",fontSize:T({big:12,small:8})},Rp:{align:"center"},lm:S(530),Qp:S(440),Pp:S(20),sg:S(200),Mj:S(200),tp:S(80),up:S(100),Ot:S(10)},Pm:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:Vd,Yb:{align:"center"},Zb:S(120),Xj:S(460,"round"),Wj:{align:"center"},ki:{align:"bottom",offset:S(20)},qd:S(10,"round"),rf:S(510),xe:S(10),Ag:S(130),qf:S(90),bl:800,cl:gc,to:600,uo:bc,ys:{},cx:{align:"center"},dx:{align:"center",offset:S(40)},
Co:S(460),Bo:S(300),at:{},ax:{align:"center"},bx:{align:"center",offset:S(160)},$w:S(460),Zw:S(200)},kn:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,qt:{align:"center"},rt:S(152),Gl:S(560),$x:S(560),font:{align:"center",j:"middle",fontSize:T({big:52,small:26}),fillColor:"#FFFFFF"},zu:{align:"center"},lq:S(600),kq:S(460),jq:"default_text"},ln:{lq:S(520)}}}
var nf={Ww:"poki",ij:{Vv:!1,Rm:[]},Ud:{Sd:"en-us",Pj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},dq:{show:!1}},of=null;
function pf(){of={Ua:{hk:500,shadowOffsetX:S(4,"round"),shadowOffsetY:S(4,"round")},debug:{Ru:!1,Um:!1,Px:!1},Ig:{aa:35,Zd:S(310),$d:S(52),time:1E3},zf:{mn:"pyramid_solitaire",vd:"difficulty",cs:["resume","tutorial",["music","sfx"],"restart","quit"]},wd:{Fu:S(310,"round"),Gu:S(490,"round"),Xw:350,Ao:40,Ys:500,Zs:50},Wb:{Py:400,vi:400,gx:50,eh:500,ky:180,ly:-50,my:500},Jv:{qy:S(872,"round"),ry:S(416,"round"),sy:S(100,"round"),ty:S(192,"round")},fb:{Nq:S(0,"round"),Oq:S(20,"round"),offset:S(28,"round"),
Zd:S(167,"round"),$d:S(300,"round")},Lb:{Ou:1,Pu:.2,Zd:S(295,"round"),$d:S(52,"round")},tc:{Zd:S(52,"round"),$d:S(300,"round")},gc:{Zd:S(52,"round"),$d:S(420,"round")},Mr:[{name:"EASY",un:{oo:4},wn:{xm:1E3,ym:2,Am:1E3,fa:0},Sd:{fa:250,time:6E5},Xi:{Zo:-10,cp:0,me:-50},fa:{Cg:25,Hk:25,xo:0,hp:1E3}},{name:"MEDIUM",un:{oo:3},wn:{xm:1E3,ym:4,Am:1E3,fa:0},Sd:{fa:250,time:48E4},Xi:{Zo:-10,cp:0,me:-50},fa:{Cg:25,Hk:25,xo:0,hp:1E3}},{name:"HARD",un:{oo:2},wn:{xm:1E3,ym:6,Am:1E3,fa:0},Sd:{fa:250,time:36E4},
Xi:{Zo:-10,cp:0,me:-50},fa:{Cg:25,Hk:25,xo:0,hp:1E3}}]}}Z=Z||{};Z["nl-nl"]=Z["nl-nl"]||{};Z["nl-nl"].optionsDifficulty_easy="4 stapels";Z["nl-nl"].optionsDifficulty_medium="3 stapels";Z["nl-nl"].optionsDifficulty_hard="2 stapels";Z["nl-nl"].TutorialTitle_5="Ongedaan maken";Z["nl-nl"].TutorialTitle_4="Tijdelijke ruimte";Z["nl-nl"].TutorialTitle_3="Pakstapel";Z["nl-nl"].TutorialTitle_2="Instructies";Z["nl-nl"].TutorialTitle_1="Instructies";Z["nl-nl"].TutorialText_4="Je kunt \u00e9\u00e9n kaart opslaan in de tijdelijke ruimte.";
Z["nl-nl"].TutorialText_3="#touch{Klik op de pakstapel om nieuwe kaarten te pakken.}{Tik op de pakstapel om nieuwe kaarten te pakken.}";Z["nl-nl"].TutorialText_2="Aas = 1, Boer = 11, Vrouw = 12, Heer = 13";Z["nl-nl"].TutorialText_1="Maak combinaties van 2 kaarten die opgeteld 13 zijn.";Z["nl-nl"].levelStartHeader="Doel";Z["nl-nl"].levelStartText="Maak de piramide leeg";Z["nl-nl"].TutorialTitle_0="Doel";Z["nl-nl"].TutorialText_0="Het doel is om alle kaarten van het veld te verwijderen.";
Z["nl-nl"].TutorialText_5="#touch{Klik op de knop ongedaan maken om je laatste zet terug te draaien.}{Tik op de knop ongedaan maken om je laatste zet terug te draaien.}";Z["nl-nl"].levelEndScreenBonusGameWon="De piramide is leeg";Z["nl-nl"].levelEndScreenAllCardsUsedBonus="Alle 52 kaarten zijn gebruikt";Z["nl-nl"].levelEndScreenBonusTime="Bonustijd";Z["en-us"]=Z["en-us"]||{};Z["en-us"].optionsDifficulty_easy="4 piles";Z["en-us"].optionsDifficulty_medium="3 piles";
Z["en-us"].optionsDifficulty_hard="2 piles";Z["en-us"].TutorialTitle_5="Undo";Z["en-us"].TutorialTitle_4="Temporary space";Z["en-us"].TutorialTitle_3="Draw pile";Z["en-us"].TutorialTitle_2="How to play";Z["en-us"].TutorialTitle_1="How to play";Z["en-us"].TutorialText_4="You can store one card in the temporary space.";Z["en-us"].TutorialText_3="#touch{Click on the draw pile to draw new cards.}{Tap the draw pile to draw new cards.}";Z["en-us"].TutorialText_2="Ace = 1,  Jack = 11,  Queen = 12,  King = 13";
Z["en-us"].TutorialText_1="Create combinations of 2 cards that add up to 13.";Z["en-us"].levelStartHeader="Goal";Z["en-us"].levelStartText="Clear the pyramid";Z["en-us"].TutorialTitle_0="Goal";Z["en-us"].TutorialText_0="The goal is to clear all cards from the field.";Z["en-us"].TutorialText_5="#touch{Click the undo button to undo your last move.}{Tap the undo button to undo your last move.}";Z["en-us"].levelEndScreenBonusGameWon="Pyramid cleared";Z["en-us"].levelEndScreenAllCardsUsedBonus="All 52 cards used";
Z["en-us"].levelEndScreenBonusTime="Bonus Time";Z["en-gb"]=Z["en-gb"]||{};Z["en-gb"].optionsDifficulty_easy="4 piles";Z["en-gb"].optionsDifficulty_medium="3 piles";Z["en-gb"].optionsDifficulty_hard="2 piles";Z["en-gb"].TutorialTitle_5="Undo";Z["en-gb"].TutorialTitle_4="Temporary space";Z["en-gb"].TutorialTitle_3="Draw pile";Z["en-gb"].TutorialTitle_2="How to play";Z["en-gb"].TutorialTitle_1="How to play";Z["en-gb"].TutorialText_4="You can store one card in the temporary space.";
Z["en-gb"].TutorialText_3="#touch{Click on the draw pile to draw new cards.}{Tap the draw pile to draw new cards.}";Z["en-gb"].TutorialText_2="Ace = 1,  Jack = 11,  Queen = 12,  King = 13";Z["en-gb"].TutorialText_1="Create combinations of 2 cards that add up to 13.";Z["en-gb"].levelStartHeader="Goal";Z["en-gb"].levelStartText="Clear the pyramid";Z["en-gb"].TutorialTitle_0="Goal";Z["en-gb"].TutorialText_0="The goal is to clear all cards from the field.";Z["en-gb"].TutorialText_5="#touch{Click the undo button to undo your last move.}{Tap the undo button to undo your last move.}";
Z["en-gb"].levelEndScreenBonusGameWon="Pyramid cleared";Z["en-gb"].levelEndScreenAllCardsUsedBonus="All 52 cards used";Z["en-gb"].levelEndScreenBonusTime="Bonus Time";Z["de-de"]=Z["de-de"]||{};Z["de-de"].optionsDifficulty_easy="4 Haufen";Z["de-de"].optionsDifficulty_medium="3 Haufen";Z["de-de"].optionsDifficulty_hard="2 Haufen";Z["de-de"].TutorialTitle_5="Zur\u00fcck";Z["de-de"].TutorialTitle_4="Zwischenablage";Z["de-de"].TutorialTitle_3="Kartenstock";Z["de-de"].TutorialTitle_2="So wird gespielt";
Z["de-de"].TutorialTitle_1="So wird gespielt";Z["de-de"].TutorialText_4="Du kannst eine Karte in der Zwischenablage ablegen.";Z["de-de"].TutorialText_3="#touch{Klicke auf den Kartenstock, um neue Karten zu ziehen.}{Tippe auf den Kartenstock, um neue Karten zu ziehen.}";Z["de-de"].TutorialText_2="Ass = 1, Bube = 11, Dame = 12, K\u00f6nig = 13";Z["de-de"].TutorialText_1="Stelle Kombinationen aus 2 Karten zusammen, die den Wert 13 ergeben.";Z["de-de"].levelStartHeader="Ziel";
Z["de-de"].levelStartText="Die Pyramide abr\u00e4umen.";Z["de-de"].TutorialTitle_0="Ziel";Z["de-de"].TutorialText_0="Ziel ist, alle Karten vom Spielfeld zu entfernen.";Z["de-de"].TutorialText_5="#touch{Klicke auf den Zur\u00fcck-Button, um deinen letzten Zug zur\u00fcckzunehmen.}{Tippe auf den Zur\u00fcck-Button, um deinen letzten Zug zur\u00fcckzunehmen.}";Z["de-de"].levelEndScreenBonusGameWon="Pyramide abger\u00e4umt";Z["de-de"].levelEndScreenAllCardsUsedBonus="Alle 52 Karten benutzt.";
Z["de-de"].levelEndScreenBonusTime="Bonuszeit";Z["fr-fr"]=Z["fr-fr"]||{};Z["fr-fr"].optionsDifficulty_easy="4 piles";Z["fr-fr"].optionsDifficulty_medium="3 piles";Z["fr-fr"].optionsDifficulty_hard="2 piles";Z["fr-fr"].TutorialTitle_5="Annuler";Z["fr-fr"].TutorialTitle_4="Zone temporaire";Z["fr-fr"].TutorialTitle_3="Pioche";Z["fr-fr"].TutorialTitle_2="Comment jouer";Z["fr-fr"].TutorialTitle_1="Comment jouer";Z["fr-fr"].TutorialText_4="Vous pouvez stocker une carte dans la zone temporaire.";
Z["fr-fr"].TutorialText_3="#touch{Cliquez sur la pioche pour piocher de nouvelles cartes.}{Tapotez la pioche pour piocher de nouvelles cartes.}";Z["fr-fr"].TutorialText_2="As = 1,  Valet = 11,  Reine = 12,  Roi = 13";Z["fr-fr"].TutorialText_1="Combinez deux cartes de fa\u00e7on \u00e0 obtenir un total de 13.";Z["fr-fr"].levelStartHeader="Objectif";Z["fr-fr"].levelStartText="Terminez la pyramide.";Z["fr-fr"].TutorialTitle_0="Objectif";Z["fr-fr"].TutorialText_0="L'objectif est de se d\u00e9barrasser de toutes les cartes.";
Z["fr-fr"].TutorialText_5="#touch{Cliquez sur le bouton Annuler pour annuler votre dernier d\u00e9placement.}{Tapotez le bouton Annuler pour annuler votre dernier d\u00e9placement.}";Z["fr-fr"].levelEndScreenBonusGameWon="Pyramide termin\u00e9e";Z["fr-fr"].levelEndScreenAllCardsUsedBonus="Int\u00e9gralit\u00e9 des 52 cartes utilis\u00e9es";Z["fr-fr"].levelEndScreenBonusTime="Temps bonus";Z["pt-br"]=Z["pt-br"]||{};Z["pt-br"].optionsDifficulty_easy="4 pilhas";Z["pt-br"].optionsDifficulty_medium="3 pilhas";
Z["pt-br"].optionsDifficulty_hard="2 pilhas";Z["pt-br"].TutorialTitle_5="Desfazer";Z["pt-br"].TutorialTitle_4="Espa\u00e7o tempor\u00e1rio";Z["pt-br"].TutorialTitle_3="Pilha de compra";Z["pt-br"].TutorialTitle_2="Como jogar";Z["pt-br"].TutorialTitle_1="Como jogar";Z["pt-br"].TutorialText_4="Voc\u00ea pode guardar uma carta no espa\u00e7o tempor\u00e1rio.";Z["pt-br"].TutorialText_3="#touch{Clique na pilha de compra para tirar novas cartas.}{Toque na pilha de compra para tirar novas cartas.}";
Z["pt-br"].TutorialText_2="\u00c1s = 1,  Valete = 11,  Dama = 12,  Rei = 13";Z["pt-br"].TutorialText_1="Crie combina\u00e7\u00f5es de 2 cartas que somem 13.";Z["pt-br"].levelStartHeader="Objetivo";Z["pt-br"].levelStartText="Remova a pir\u00e2mide.";Z["pt-br"].TutorialTitle_0="Objetivo";Z["pt-br"].TutorialText_0="O objetivo \u00e9 tirar todas as cartas da mesa.";Z["pt-br"].TutorialText_5="#touch{Clique no bot\u00e3o desfazer para desfazer sua \u00faltima jogada.}{Toque no bot\u00e3o desfazer para desfazer sua \u00faltima jogada.}";
Z["pt-br"].levelEndScreenBonusGameWon="Pir\u00e2mide removida.";Z["pt-br"].levelEndScreenAllCardsUsedBonus="Todas as 52 cartas foram usadas.";Z["pt-br"].levelEndScreenBonusTime="Tempo de b\u00f4nus";Z["es-es"]=Z["es-es"]||{};Z["es-es"].optionsDifficulty_easy="4 montones";Z["es-es"].optionsDifficulty_medium="3 montones";Z["es-es"].optionsDifficulty_hard="2 montones";Z["es-es"].TutorialTitle_5="Deshacer";Z["es-es"].TutorialTitle_4="Espacio temporal";Z["es-es"].TutorialTitle_3="Mazo";
Z["es-es"].TutorialTitle_2="C\u00f3mo jugar";Z["es-es"].TutorialTitle_1="C\u00f3mo jugar";Z["es-es"].TutorialText_4="Puedes guardar una carta en el espacio temporal.";Z["es-es"].TutorialText_3="#touch{Haz clic en el mazo para sacar cartas nuevas.}{Toca el mazo para sacar cartas nuevas.}";Z["es-es"].TutorialText_2="As = 1, Jota = 11, Reina = 12, Rey = 13";Z["es-es"].TutorialText_1="Crea combinaciones de 2 cartas que juntas sumen 13.";Z["es-es"].levelStartHeader="Objetivo";
Z["es-es"].levelStartText="Resuelve la pir\u00e1mide";Z["es-es"].TutorialTitle_0="Objetivo";Z["es-es"].TutorialText_0="El objetivo es librarte de todas las cartas.";Z["es-es"].TutorialText_5="#touch{Haz clic en el bot\u00f3n Deshacer para deshacer tu \u00faltimo movimiento.}{Toca el bot\u00f3n Deshacer para deshacer tu \u00faltimo movimiento.}";Z["es-es"].levelEndScreenBonusGameWon="Pir\u00e1mide resuelta";Z["es-es"].levelEndScreenAllCardsUsedBonus="Has usado las 52 cartas";
Z["es-es"].levelEndScreenBonusTime="Tiempo extra";Z["tr-tr"]=Z["tr-tr"]||{};Z["tr-tr"].optionsDifficulty_easy="4 y\u0131\u011f\u0131n";Z["tr-tr"].optionsDifficulty_medium="3 y\u0131\u011f\u0131n";Z["tr-tr"].optionsDifficulty_hard="2 y\u0131\u011f\u0131n";Z["tr-tr"].TutorialTitle_5="Geri al";Z["tr-tr"].TutorialTitle_4="Ge\u00e7ici alan";Z["tr-tr"].TutorialTitle_3="\u00c7ekme y\u0131\u011f\u0131n\u0131";Z["tr-tr"].TutorialTitle_2="Nas\u0131l Oynan\u0131r";Z["tr-tr"].TutorialTitle_1="Nas\u0131l Oynan\u0131r";
Z["tr-tr"].TutorialText_4="Ge\u00e7ici alanda bir kart tutabilirsin";Z["tr-tr"].TutorialText_3="#touch{\u00c7ekme y\u0131\u011f\u0131n\u0131na t\u0131klayarak kart \u00e7ek.}{\u00c7ekme y\u0131\u011f\u0131n\u0131na dokunarak kart \u00e7ek.}";Z["tr-tr"].TutorialText_2="As = 1, Bacak = 11, K\u0131z = 12, Papaz = 13";Z["tr-tr"].TutorialText_1="Toplam\u0131 13 olan 2 kart tut.";Z["tr-tr"].levelStartHeader="Ama\u00e7";Z["tr-tr"].levelStartText="Piramidi temizle";Z["tr-tr"].TutorialTitle_0="Ama\u00e7";
Z["tr-tr"].TutorialText_0="Ama\u00e7, sahadaki t\u00fcm kartlar\u0131 temizlemektir.";Z["tr-tr"].TutorialText_5="#touch{Geri al tu\u015funa t\u0131klayarak son hareketini geri al.}{Geri al tu\u015funa dokunarak son hareketini geri al.}";Z["tr-tr"].levelEndScreenBonusGameWon="Piramit temizlendi";Z["tr-tr"].levelEndScreenAllCardsUsedBonus="52 kart\u0131n tamam\u0131 kullan\u0131ld\u0131";Z["tr-tr"].levelEndScreenBonusTime="Bonus Zaman";Z["ru-ru"]=Z["ru-ru"]||{};Z["ru-ru"].optionsDifficulty_easy="4 piles";
Z["ru-ru"].optionsDifficulty_medium="3 piles";Z["ru-ru"].optionsDifficulty_hard="2 piles";Z["ru-ru"].TutorialTitle_5="Undo";Z["ru-ru"].TutorialTitle_4="Temporary space";Z["ru-ru"].TutorialTitle_3="Draw pile";Z["ru-ru"].TutorialTitle_2="How to play";Z["ru-ru"].TutorialTitle_1="How to play";Z["ru-ru"].TutorialText_4="You can store one card in the temporary space.";Z["ru-ru"].TutorialText_3="#touch{Click on the draw pile to draw new cards.}{Tap the draw pile to draw new cards.}";
Z["ru-ru"].TutorialText_2="Ace = 1,  Jack = 11,  Queen = 12,  King = 13";Z["ru-ru"].TutorialText_1="Create combinations of 2 cards that add up to 13.";Z["ru-ru"].levelStartHeader="Goal";Z["ru-ru"].levelStartText="Clear the pyramid";Z["ru-ru"].TutorialTitle_0="Goal";Z["ru-ru"].TutorialText_0="The goal is to clear all cards from the field.";Z["ru-ru"].TutorialText_5="#touch{Click the undo button to undo your last move.}{Tap the undo button to undo your last move.}";
Z["ru-ru"].levelEndScreenBonusGameWon="Pyramid cleared";Z["ru-ru"].levelEndScreenAllCardsUsedBonus="All 52 cards used";Z["ru-ru"].levelEndScreenBonusTime="Bonus Time";Z["ar-eg"]=Z["ar-eg"]||{};Z["ar-eg"].optionsDifficulty_easy="4 piles";Z["ar-eg"].optionsDifficulty_medium="3 piles";Z["ar-eg"].optionsDifficulty_hard="2 piles";Z["ar-eg"].TutorialTitle_5="Undo";Z["ar-eg"].TutorialTitle_4="Temporary space";Z["ar-eg"].TutorialTitle_3="Draw pile";Z["ar-eg"].TutorialTitle_2="How to play";
Z["ar-eg"].TutorialTitle_1="How to play";Z["ar-eg"].TutorialText_4="You can store one card in the temporary space.";Z["ar-eg"].TutorialText_3="#touch{Click on the draw pile to draw new cards.}{Tap the draw pile to draw new cards.}";Z["ar-eg"].TutorialText_2="Ace = 1,  Jack = 11,  Queen = 12,  King = 13";Z["ar-eg"].TutorialText_1="Create combinations of 2 cards that add up to 13.";Z["ar-eg"].levelStartHeader="Goal";Z["ar-eg"].levelStartText="Clear the pyramid";Z["ar-eg"].TutorialTitle_0="Goal";
Z["ar-eg"].TutorialText_0="The goal is to clear all cards from the field.";Z["ar-eg"].TutorialText_5="#touch{Click the undo button to undo your last move.}{Tap the undo button to undo your last move.}";Z["ar-eg"].levelEndScreenBonusGameWon="Pyramid cleared";Z["ar-eg"].levelEndScreenAllCardsUsedBonus="All 52 cards used";Z["ar-eg"].levelEndScreenBonusTime="Bonus Time";Z["ko-kr"]=Z["ko-kr"]||{};Z["ko-kr"].optionsDifficulty_easy="4 piles";Z["ko-kr"].optionsDifficulty_medium="3 piles";
Z["ko-kr"].optionsDifficulty_hard="2 piles";Z["ko-kr"].TutorialTitle_5="Undo";Z["ko-kr"].TutorialTitle_4="Temporary space";Z["ko-kr"].TutorialTitle_3="Draw pile";Z["ko-kr"].TutorialTitle_2="How to play";Z["ko-kr"].TutorialTitle_1="How to play";Z["ko-kr"].TutorialText_4="You can store one card in the temporary space.";Z["ko-kr"].TutorialText_3="#touch{Click on the draw pile to draw new cards.}{Tap the draw pile to draw new cards.}";Z["ko-kr"].TutorialText_2="Ace = 1,  Jack = 11,  Queen = 12,  King = 13";
Z["ko-kr"].TutorialText_1="Create combinations of 2 cards that add up to 13.";Z["ko-kr"].levelStartHeader="Goal";Z["ko-kr"].levelStartText="Clear the pyramid";Z["ko-kr"].TutorialTitle_0="Goal";Z["ko-kr"].TutorialText_0="The goal is to clear all cards from the field.";Z["ko-kr"].TutorialText_5="#touch{Click the undo button to undo your last move.}{Tap the undo button to undo your last move.}";Z["ko-kr"].levelEndScreenBonusGameWon="Pyramid cleared";Z["ko-kr"].levelEndScreenAllCardsUsedBonus="All 52 cards used";
Z["ko-kr"].levelEndScreenBonusTime="Bonus Time";var qf=qf||{};qf.Ci={sk:"c4481147714d700db7d6713c3493888c",vl:"4b64010f32166f829b87973f4290e287cbc6f716"};qf.ht="en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr".split(" ");var rf=null;
function sf(){rf={buttons:{bigPlay:"bluegreen",default_color:"bluegreen"},k:{nz:"TinglyPyramidSolitaire"},na:{hu:"fromBottom",Nj:Q,iu:"toBottom",tm:S(500),rf:S(860),xe:S(9),wi:{align:"center",j:"top",fillColor:"rgb(143,23, 60)",fontSize:45},Tu:!0,Wm:{align:"left",j:"top",fillColor:"rgb(108,67,58)",fontSize:35},Xm:{align:"center",offset:65},ik:S(180),xi:{align:"center",offset:65},Hg:S(220),Tq:{align:"center",offset:S(155)},fn:S(440),Sk:S(860),Zf:{align:"center",j:"top",fillColor:"rgb(108,67,58)",fontSize:20},
kj:{align:"center",j:"top",fillColor:"rgb(108,67,58)",fontSize:20},hd:S(S(8)),lj:S(S(10)),ee:{align:"center",offset:65},Pe:S(310),ld:{align:"center",j:"middle",fontSize:35,fillColor:"white",stroke:!0,fe:"round",kd:!0,$b:6,strokeColor:"rgb(143,23, 60)"},Ye:{align:"center",offset:10},vc:{align:"top",offset:25}},Jk:{Wp:{align:"center",j:"middle",fillColor:"rgb(108,0,0)",fontSize:25},pm:S(50),ei:S(300),Xp:S(390),ir:{align:"center",j:"middle",fontSize:50,fill:!0,fillColor:"white",stroke:"true",strokeColor:"rgb(108,0,0)",
$b:8,kd:!0},On:S(50),Li:S(300),jr:S(340),Wi:[{type:"y",aa:0,duration:800,end:{align:"center",offset:S(-60)},Wa:gc,Nb:$e}]},Xb:{gi:500},options:{jm:S(28),og:S(112,"round"),Zh:S(145),pg:S(90),rg:S(394,"round"),rf:S(695),xe:S(9),pl:{align:"center",j:"middle",fillColor:"rgb(108,0,0)",fontSize:25},ld:{align:"center",j:"top",fontSize:35,fillColor:"white",stroke:!0,fe:"round",kd:!0,$b:6,strokeColor:"rgb(143,23, 60)"},vc:S(20),Nl:{align:"center",j:"top",fillColor:"rgb(108,0,0)",fontSize:30},Ol:S(170,"round"),
lp:S(80),Pl:S(400,"round"),Ql:{align:"center",j:"top",fillColor:"rgb(108,0,0)",fontSize:40},Sl:S(110,"round"),tp:S(200),up:S(150)},Al:{Fg:S(300),Qm:{align:"center",offset:S(-140)},ui:S(450),Di:{align:"center",offset:-136},Lg:{align:"top",offset:S(24)},Ng:{align:"center",offset:-136},$g:S(270),ts:{align:"center",offset:S(-140)},$i:S(568)}}}R.l=R.l||{};R.l.pv=function(){var a=R.Hx;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};R.l.yk=function(){R.e.Fc()};R.l.Cz=function(){};
R.l.Mk=function(){};R.l.zk=function(){R.e.Fc()};R.l.yz=function(){};R.l.xz=function(){};R.l.Bz=function(){};R.l.tr=function(){};R.l.Dv=function(){};R.l.sr=function(){};R.l.zz=function(){};R.l.rv=function(){R.e.Fc()};R.l.sv=function(){R.e.Fc()};R.l.Rg=function(){R.e.Fc()};R.l.qv=function(){R.e.Fc()};R.l.cr=function(a,b){void 0===R.e.Wd&&(R.e.Wd=new tf(!0));return uf(a,b)};R.l.np=function(a){void 0===R.e.Wd&&(R.e.Wd=new tf(!0));return vf(a)};R.l.dd=function(a){window.open(a)};
R.l.Fi=function(){return[{f:Yc,url:R.u.or}]};R.l.Ev=function(){};R.od=R.od||{};R.od.yk=function(){R.e.xj=!1};R.od.Mk=function(){};R.od.zk=function(){R.e.xj=!1};R.od.Rg=function(){R.e.xj=!1};function wf(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function xf(a,b,c,d){this.Jl=this.Jg=a;this.Hu=b;this.duration=1;this.pq=d;this.ze=c;this.Yj=null;this.th=0}function yf(a,b){a.th+=b;a.th>a.duration&&a.Yj&&(a.Yj(),a.Yj=null)}
xf.prototype.X=function(){if(this.th>=this.duration)return this.ze(this.duration,this.Jg,this.Jl-this.Jg,this.duration);var a=this.ze(this.th,this.Jg,this.Jl-this.Jg,this.duration);this.pq&&(a=this.pq(a));return a};function zf(a,b){a.Jg=a.X();a.Jl=b;a.duration=a.Hu;a.Yj=void 0;a.th=0}R.Vu=void 0!==R.environment?R.environment:"development";R.Ay=void 0!==R.ga?R.ga:R.Vu;"undefined"!==typeof R.mediaUrl?ja(R.mediaUrl):ja(R.size);R.nu="backButton";R.Jf="languageSet";R.Ne="resizeEvent";
R.version={builder:"1.8.3.0","build-time":"10:35:44","build-date":"04-05-2020",audio:I.bb?"web audio api":I.Qa?"html5 audio":"no audio"};R.Iy=new function(){this.Ee=this.cw=3;m.q.mh&&(this.Ee=3>m.La.ne?1:4.4>m.La.ne?2:3);m.La.Fk&&(this.Ee=7>m.La.ne?2:3);m.La.wp&&(this.Ee=8>m.La.ne?2:3);R.version.browser_name=m.name;R.version.browser_version=m.q.version;R.version.os_version=m.La.version;R.version.browser_grade=this.Ee};R.a={};"function"===typeof mf&&mf();"function"===typeof pf&&pf();
"function"===typeof sf&&sf();"function"===typeof initGameThemeSettings&&initGameThemeSettings();R.a.t="undefined"!==typeof lf?lf:{};R.a.k="undefined"!==typeof of?of:{};R.a.O="undefined"!==typeof rf?rf:{};R.a.oz="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};R.bh=window.publisherSettings;R.u="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof nf&&(R.u=nf);if("undefined"!==typeof qf)for(var Af in qf)R.u[Af]=qf[Af];
(function(){var a,b,c,d,g;R.m={};R.m.Kp="undefined"!==typeof Z?Z:{};R.m.hb=void 0!==R.u.Ud&&void 0!==R.u.Ud.Pj?R.u.Ud.Pj:R.a.t.Ud.Pj;g=[];for(b=0;b<R.m.hb.length;b++)g.push(R.m.hb[b]);if(R.u.ht)for(b=R.m.hb.length-1;0<=b;b--)0>R.u.ht.indexOf(R.m.hb[b])&&R.m.hb.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=R.m.hb.length-1;0<=
b;b--)0>c.indexOf(R.m.hb[b])&&R.m.hb.splice(b,1)}catch(h){}0===R.m.hb.length&&(0<g.length?R.m.hb=g:R.m.hb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<R.m.hb.length;d++)if(0<=R.m.hb[d].search(g)){a=R.m.hb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==R.u.Ud&&void 0!==R.u.Ud.Sd?R.u.Ud.Sd:R.a.t.Ud.Sd);R.m.dm=0<=R.m.hb.indexOf(a)?a:R.m.hb[0];R.m.Ej=R.m.Kp[R.m.dm];
if(void 0!==R.a.t.Sb.language_toggle&&void 0!==R.a.t.Sb.language_toggle.R){a=R.a.t.Sb.language_toggle.R;c=[];for(b=0;b<a.length;b++)0<=R.m.hb.indexOf(a[b].id)&&c.push(a[b]);R.a.t.Sb.language_toggle.R=c}R.m.K=function(a,b){var c,d,g,h;if(void 0!==R.m.Ej&&void 0!==R.m.Ej[a]){c=R.m.Ej[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=m.vf.jt||m.vf.ds)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};R.m.Es=function(a){R.m.dm=
a;R.m.Ej=R.m.Kp[a];na(R.Jf,a)};R.m.Cn=function(){return R.m.dm};R.m.jv=function(){return R.m.hb};R.m.Hv=function(a){return 0<=R.m.hb.indexOf(a)}})();R.Mu={La:"",Nw:"",lA:"",Om:""};R.b={};
R.b.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};R.b.gp=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
R.b.Oi=function(a){function b(){}b.prototype=Bf.prototype;a.prototype=new b};R.b.px=function(a,b,c,d,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));R.Kd.push(l);return l};
(function(){var a,b,c,d,g,h,k;R.Ar=0;R.Br=0;R.ul=!1;R.vy=m.q.mh&&m.q.ne&&4<=m.q.ne;R.yj=!1;R.Lt=m.vf.jt||m.vf.ds;R.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===R.orientation?R.a.t.Fm:R.a.t.Kd;h="landscape"===R.orientation?R.a.k.Fm:R.a.k.Kd;if(void 0!==h){if(void 0!==h.Wc)for(a in h.Wc)k.Wc[a]=h.Wc[a];if(void 0!==h.Dc)for(a in h.Dc)k.Dc[a]=h.Dc[a]}b=function(){var a,b,c,d;if(R.vy&&!R.yj){R.yj=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){R.yj=!1;return}b=document.createEvent("Event");b.qA=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);R.yj=!1},100)}};c=function(){var a,c,d,g,h,F,r,s,t;"landscape"===R.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.Eg,k.Gc],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.Gc,k.Tb],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];F=d/c[1];h<g?(h=h<F?Math.floor(a[0]/F):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));r=h/c[1];!R.Lt&&1<r&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),r=1);a="landscape"===R.orientation?g:h;c="landscape"===R.orientation?h:g;t=s=0;window.innerHeight<Math.floor(k.Gc*r)&&(s=Math.max(k.Vk,window.innerHeight-Math.floor(k.Gc*r)));window.innerWidth<Math.floor(k.Tb*r)&&(t=Math.floor(Math.max(k.Eg-k.Tb,(window.innerWidth-Math.floor(k.Tb*r))/r)),window.innerWidth<Math.floor(k.Tb*r)+t*r&&(t+=Math.floor(Math.max((d-k.Eg)/2,(window.innerWidth-(k.Tb*r+t*r))/2/r))));R.bq=k.Gc-k.wq;R.su=k.Tb-k.Eg;R.ia=s;R.Ny=t;R.My=Math.min(R.su,-1*R.Oy);R.Ce=(k.Dc.top||
k.tf)-R.ia;R.Y={top:-1*s,left:-1*t,height:Math.min(k.Gc,Math.round(Math.min(c,window.innerHeight)/r)),width:Math.min(k.Tb,Math.round(Math.min(a,window.innerWidth)/r))};R.JA="landscape"===R.orientation?{top:0,left:Math.floor((k.Eg-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.Vk),left:k.sf,width:k.Tb,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===R.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,l,n;g=void 0!==b.top?b.top:k.tf;h=void 0!==b.left?b.left:k.sf;l=void 0!==b.width?b.width:k.Tb;n=void 0!==b.height?b.height:k.Gc;a.az=Math.floor(r*g);a.$y=Math.floor(r*h);a.bz=Math.floor(r*l);a.Zy=Math.floor(r*
n);!1!==c&&(g+=s);!1!==d&&(h+=t);a.setAttribute("style","position:absolute; left:"+Math.floor(r*h)+"px; top:"+Math.floor(r*g)+"px; width:"+Math.floor(r*l)+"px; height:"+Math.floor(r*n)+"px; z-index: "+b.depth)};d(R.um,k.Em);d(R.jn,k.Wc);d(R.vn,k.Dc,!1,!0);d(R.Vd,k.of);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);na(R.Ne)};a=function(){if(R.Ar===window.innerHeight&&R.Br===window.innerWidth||R.ul)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;R.ul=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,m.q.mh?1:0);g--;if((m.q.mh?0:window.innerHeight>d)||0>g)R.Br=window.innerWidth,R.Ar=window.innerHeight,clearInterval(R.ul),R.ul=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};R.Bf=k.Wc.left||k.sf;R.Cf=k.Wc.top||k.tf;R.iv=k.Wc.width||k.Tb;R.bv=k.Wc.height||k.Gc;R.Df=k.Dc.left||k.sf;R.Ce=k.Dc.top||k.tf;R.qz=k.Dc.width||k.Tb;
R.pz=k.Dc.height||k.Gc;R.Zv=k.of.left||k.sf;R.$v=k.of.top||k.tf;R.aw=k.of.width||k.Tb;R.Yv=k.of.height||k.Gc;h=function(a){return R.b.px(a.id,a.depth,void 0!==a.top?a.top:k.tf,void 0!==a.left?a.left:k.sf,void 0!==a.width?a.width:k.Tb,void 0!==a.height?a.height:k.Gc)};R.Kd=[];R.um=h(k.Em);R.jn=h(k.Wc);R.vn=h(k.Dc);R.Vd=h(k.of);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);R.pc={};R.pc[R.Be]=R.um;R.pc[R.Yq]=R.jn;R.pc[R.vk]=R.vn;R.pc[R.Rd]=R.Vd;R.pc[R.Af]=R.um;R.pc[R.dc]=R.Vd;R.pc[R.Qd]=R.Vd})();
R.b.fu=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ka.qe+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),R.vu=!0,R.hi=!0,b=function(a){R.vu&&R.hi&&(R.l.dd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){R.hi&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){R.hi&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};R.b.bB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";R.hi=!0}};
R.b.wz=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";R.hi=!1}};R.b.yn=function(a){return a===R.jn?{x:R.Bf,y:R.Cf}:a===R.vn?{x:R.Df,y:R.Ce}:{x:R.Zv,y:R.$v}};R.b.Ff=function(a){return R.pc[a]};R.b.ob=function(a){return R.pc[a]?(w.canvas!==R.pc[a]&&w.ob(R.pc[a]),!0):!1};R.b.Na=function(a,b){if(R.pc[b]){var c=K;a.ma!==b&&(c.Th=!0);a.ma=b;a.canvas=R.pc[b]}};
R.b.g=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
R.b.ta=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};R.b.Vy=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};R.da=R.da||{};R.da.sx=!1;R.da.vr=function(a){a instanceof Array&&(this.sk=a[0],this.vl=a[1],this.wu="https://api.gameanalytics.com/v2/"+this.sk,this.wr=!0)};
R.da.ef=function(a,b){var c,d=JSON.stringify(b),g=window.Crypto.HmacSHA256(d,this.vl),g=window.Crypto.enc.Base64.stringify(g),h=this.wu+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.sx&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
R.da.hc={Ep:"user",Dp:"session_end",St:"business",Tt:"resource",zj:"progression",Yl:"design",ERROR:"error"};R.da.af=function(){return{user_id:this.rp,session_id:this.nx,build:this.Au,device:this.Om,platform:this.platform,os_version:this.Ow,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
R.da.kb=function(a,b,c,d,g,h,k){this.nx=a;h&&"object"===typeof h&&(this.rp=h.rp);this.Au=g;this.i=!0;this.wr&&(this.Om=k.Om,this.platform=k.La,this.Ow=k.Nw);this.ef("init",this.af())};R.da.Mx=function(a){var b=this.af(),c=[];b.category=a;c.push(b);this.ef("events",c)};R.da.Zm=function(a,b,c,d){a=[];b=this.af();b.length=Math.floor(c);b.category=d;a.push(b);this.ef("events",a)};
R.da.Ya=function(a,b,c,d){var g=[],h=!1;if(this.i&&this.wr){if(d)switch(d){case R.da.hc.Ep:this.Mx(d);h=!0;break;case R.da.hc.Dp:this.Zm(0,0,c,d);h=!0;break;case R.da.hc.St:h=!0;break;case R.da.hc.Tt:h=!0;break;case R.da.hc.zj:this.Yu(a,b,c,d);h=!0;break;case R.da.hc.Yl:this.Wu(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.af(),b.event_id=d+":"+a,b.value=c,g.push(b),this.ef("design",g))}};R.da.IA=function(a,b,c){this.Ya(a,b,c)};R.da.kz=function(){};
R.da.lz=function(){};R.da.Yu=function(a,b,c,d){var g=[],h=this.af();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}g.push(h);this.ef("events",g)};R.da.Wu=function(a,b,c,d){var g=[],h=this.af();h.category=d;h.event_id=a+b;h.value=c;g.push(h);this.ef("events",g)};R.da.zs=function(a,b){var c=[],d=this.af();d.category="error";d.message=a;d.severity=b;c.push(d);this.ef("events",c)};
function Cf(){this.ma=this.depth=0;this.visible=!1;this.i=!0;this.a=R.a.t.Ca;this.Vw=this.a.fy;M(this);Mb(this,"system")}function Df(){var a=Ef("userId","");""===a&&(a=Ff(),Gf("userId",a));return a}function Ff(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=Cf.prototype;e.start=function(a){R.da.vr(a);R.da.kb(Ff(),R.a.k.zf.mn,R.a.O.id,R.u.Ww,Hf(),{rp:Df()},R.Mu)};e.Ya=function(a,b,c,d){R.da.Ya(a,b,c,d)};
function If(a,b,c,d){var g,h;for(g=0;g<a.ba.length;g++)void 0!==a.ba[g]&&a.ba[g].tag===b&&(h=a.ba[g],a.Ya(c,d,h.p/1E3,R.da.hc.Dp),h.i=!1)}function Jf(){var a=R.Ca,b=R.e.eg,c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused+=1)}e.zs=function(a,b){R.da.zs(a,b)};e.nc=function(){this.ba=[]};
e.va=function(a){var b,c=0;for(b=0;b<this.ba.length;b++)this.ba[b].i&&(0===this.ba[b].paused&&(this.ba[b].p+=a),c=b);c<this.ba.length-1&&(a=this.ba.length-Math.max(this.Vw,c+1),0<a&&this.ba.splice(this.ba.length-a,a))};
function tf(a,b,c){this.Ur=a||!1;this.host=b||"http://localhost:8080";this.mx=c||this.host+"/services/storage/gamestate";this.ft="undefined"!==typeof window.localStorage;this.Tn=this.pp=!1;var d=this;window.parent!==window&&(m.q.Io||m.La.Fk)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.pp="ok"===a.result:"getItem"===b&&d.wk&&("ok"===a.result?d.wk(a.value):d.wk(a.defaultValue))},!1),this.wk=null,window.parent.postMessage({command:"init"},"*"));this.Vi=[];window.setTimeout(function(){d.Tn=
!0;for(var a=0;a<d.Vi.length;++a)d.Vi[a]();d.Vi=[]},2E3)}function Kf(){return"string"===typeof R.u.$s&&""!==R.u.$s?R.u.$s:void 0!==R.a.k.zf&&void 0!==R.a.k.zf.mn?R.a.k.zf.mn:"0"}function uf(a,b){var c=R.e.Wd;"function"===typeof b&&(c.Tn?Lf(c,a,b):c.Vi.push(function(){Lf(c,a,b)}))}function vf(a){var b=R.e.Wd;b.Tn?Mf(b,a):b.Vi.push(function(){Mf(b,a)})}
function Mf(a,b){var c=null,d=Kf();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.pp)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.ft)try{window.localStorage.setItem(d,c)}catch(h){}a.Ur||(c=new nb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),ob(c,a.mx+"/my_ip/"+d))}}
function Lf(a,b,c){var d=null,g=null,h=Kf();if(a.pp)a.wk=function(a){var g;try{d=JSON.parse(a),g=JSON.parse(d.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.ft)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.Ur||(a=new nb("gameState_"+h),g=null,pb(a,tf.GA+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(g&&Date.parse(g.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(d.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(l){c(b);return}c(b)}}
function Nf(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.Kc=this.visible=!1!==c;this.i=!0;R.b.Na(this,R.dc);var d;this.a=R.a.t.cd;if("landscape"===R.orientation&&R.a.t.$n)for(d in R.a.t.$n)this.a[d]=R.a.t.$n[d];for(d in R.a.O.cd)this.a[d]=R.a.O.cd[d];if(R.u.cd)for(d in R.u.cd)this.a[d]=R.u.cd[d];this.Gb=a;this.nq=b;this.Aq=!1;this.fi=0;this.vm=!1;this.Rj=0;this.gi=
this.a.ru;this.Do=!0;this.Uv=.6/Math.log(this.a.Ok+1);this.Pt=void 0!==R.u.Tv?R.u.Tv:this.a.ww;this.dw=this.Pt+this.a.gw;M(this)}e=Nf.prototype;e.Oo=function(a){var b;R.b.ob(R.Af);ra(0,0,this.canvas.width,this.canvas.height,"white",!1);b=Y.M();(R.u.cd&&R.u.cd.pj||this.a.pj)&&C(b,R.u.cd&&R.u.cd.pj?R.u.cd.pj:this.a.pj);a=R.m.K(a,"<"+a.toUpperCase()+">");b.r(a,this.canvas.width/2,this.canvas.height/2,this.a.Gl);this.error=!0;this.visible=this.Kc=!1;this.canvas.W=!0};
e.Yd=function(){this.oa&&(this.zb=R.b.g(this.a.zb,R.Y.width,this.oa.width)+R.Y.left,this.rc=R.b.g(this.a.rc,R.Y.height,this.oa.height)+R.Y.top)};
e.Mm=function(){var a,b,c,d,g,h;if("function"===typeof R.l.Fi&&(h=this.a.Of,(this.za=R.l.Fi())&&0<this.za.length)){this.oa?this.oa.clear():this.oa=new y(this.a.Of,this.a.Ti);z(this.oa);h/=this.za.length;for(c=0;c<this.za.length;c++)try{g=this.za[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Ti/g.height)),a="center"===this.a.Ri?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.oa.height-g.height*d,g instanceof x?g.V(0,a,b,d,d,0,1):w.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}A(this.oa);this.Nk=0;this.bo=!0;this.Si=0;this.Nf=Rb(0,0,this.oa.width,this.oa.height);this.Yd()}};
e.Ga=function(){var a,b,c,d;this.Do?w.clear():R.b.ob(R.Af);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(R.ia),1<d.L){c=(w.canvas.height-a)/d.Bg;b=-(d.oi*c-w.canvas.width)/2;c=w.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.fi;for(h=0;h<d.L;h+=1)k=b+h%d.Yg*d.width,l=a+d.height*Math.floor(h/d.Yg),d.We.ua(d.Re[h],d.Se[h],d.Te[h],d.he[h],d.ge[h],k-d.Db+d.ie[h],l-d.Eb+d.je[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof x?d.V(0,b,a,c,c,0,this.fi):d instanceof y&&d.V(b,a,c,c,0,this.fi);d=this.a.Ie+this.a.Yn+this.a.Tg;b=oc.height;a=oc.width-(this.a.Ie+this.a.Yn);this.Ug=R.b.g(this.a.Ug,w.canvas.width,d);this.Mf=R.b.g(this.a.Mf,w.canvas.height,b);oc.ua(0,0,0,this.a.Ie,b,this.Ug,this.Mf,1);oc.fk(0,this.a.Ie,0,a,b,this.Ug+this.a.Ie,this.Mf,this.a.Tg,b,1);oc.ua(0,this.a.Ie+a,0,this.a.Yn,b,this.Ug+this.a.Ie+this.a.Tg,this.Mf,1)};
function Of(a){a.Do&&(a.vm=!0);a.visible&&(a.Ga(),a.Mm(),"function"===typeof R.l.Dn&&(a.de=R.l.Dn(),a.de instanceof y&&(a.ih=!0,a.Ks=Math.floor((a.canvas.width-a.de.width)/2),a.Ls=Math.floor((a.canvas.height-a.de.height)/2))));R.e.Lk&&ka.Ad("audio");R.e.Kk&&ka.Ad("audio_music");ka.Ad("fonts")}
e.nc=function(){var a,b=!1;if(void 0!==R.u.ij)if(!1===R.u.ij.Vv)b=!0;else{if(void 0!==R.u.ij.Rm)for(a=0;a<R.u.ij.Rm.length;a++){var c;a:{c=R.u.ij.Rm[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===Pf("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,Pf(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof R.u.dy&&(new Date).getTime()>R.u.dy&&(b=!1);b?(this.xg=[],this.error=!1,this.tt=this.en=this.Oj=this.p=0,this.ready=this.ih=!1,this.Rv=void 0!==this.a.Sr?this.a.Sr:this.a.Ie-this.a.Qi,this.Sv=void 0!==this.a.Tr?this.a.Tr:Math.floor((oc.height-ke.height)/2),this.Zn=ke.width-(this.a.Qi+this.a.Rr),this.dn=this.fs=this.Yp=!1,(this.jj=ka.complete("start"))&&Of(this),this.Qr=ka.complete("load"),this.visible&&(this.ut=document.getElementById("throbber_image"),
this.le=this.a.le,this.dp=R.b.g(this.a.dp,this.canvas.width,this.le),this.Hl=R.b.g(this.a.Hl,this.canvas.height,this.le))):K.pause()};
e.va=function(a){this.p+=a;"function"===typeof R.l.Dn&&void 0===this.de&&(this.de=R.l.Dn(),this.de instanceof y&&(this.ih=!0,this.Ks=Math.floor((this.canvas.width-this.de.width)/2),this.Ls=Math.floor((this.canvas.height-this.de.height)/2)));this.ih&&0<=this.a.Ms&&this.p>=this.a.Ms&&(this.ih=!1);this.vm&&(this.Rj+=a,this.Rj>=this.gi?(this.vm=!1,this.fi=1):this.fi=bc(this.Rj,0,1,this.gi));this.jj&&(this.Oj+=a,this.en+=a);this.tt=Math.round(this.p/this.a.by%(this.a.cy-1));this.bo&&(this.Nk=0+this.Si/
this.a.ao*1,this.Si+=a,this.Si>=this.a.ao&&(this.bo=!1,this.Nk=1));"function"===typeof this.nq&&this.nq(Math.round((la("load")+la("audio")+la("audio_music"))/2));!this.ready&&this.Qr&&(this.dn||this.en>=this.a.Ok)&&(!R.e.Lk||this.Yp||I.Qa&&this.Oj>=this.a.Ok)&&(!R.e.Kk||this.fs||I.Qa&&this.Oj>=this.a.Ok)&&(this.ready=!0);if(a=!this.Aq&&!this.error&&this.ready&&this.p>=this.Pt)a=R.e,a=(a.Xc&&a.Fb&&!a.Fb.Gv()?!1:!0)||this.p>=this.dw;a&&(this.Aq=!0,this.Gb())};
e.Og=function(a,b,c){!this.ih&&this.Nf&&Ub(this.Nf,this.zb,this.rc,b,c)&&(this.lb=Math.floor((b-this.zb)/(this.oa.width/this.za.length)))};e.Pg=function(a,b,c){void 0!==this.lb&&(this.za[this.lb].url||this.za[this.lb].action)&&Ub(this.Nf,this.zb,this.rc,b,c)&&(b-=this.zb,b>=this.oa.width/this.za.length*this.lb&&b<this.oa.width/this.za.length*(this.lb+1)&&(this.za[this.lb].url?R.l.dd(this.za[this.lb].url):this.za[this.lb].action()));this.lb=void 0};
e.bd=function(a,b){"Load Complete"===a&&"start"===b.ab?(this.jj=!0,Of(this)):"Load Complete"===a&&"load"===b.ab?this.Qr=!0:"Load Complete"===a&&"audio"===b.ab?this.Yp=!0:"Load Complete"===a&&"audio_music"===b.ab?this.fs=!0:"Load Complete"===a&&"fonts"===b.ab&&(this.dn=!0);a===R.Ne&&this.Yd()};
e.Ma=function(){if(!this.error){this.Do&&this.jj?this.Ga():w.clear();try{this.ut&&w.context.drawImage(this.ut,this.le*this.tt,0,this.le,this.le,this.dp,this.Hl,this.le,this.le)}catch(a){}if(this.jj){var b=0,c=this.Ug+this.Rv,d=this.Mf+this.Sv,g=ke.height;ke.ua(0,b,0,this.a.Qi,g,c,d,1);b+=this.a.Qi;c+=this.a.Qi;this.ready?(ke.fk(0,b,0,this.Zn,g,c,d,this.a.Tg,g,1),b+=this.Zn,c+=this.a.Tg,ke.ua(0,b,0,this.a.Rr,g,c,d,1)):ke.fk(0,b,0,this.Zn,g,c,d,Math.floor(Math.min((la("load")+la("audio"))/500+this.Uv*
Math.log(this.p+1),1)*this.a.Tg),g,1);this.oa&&this.oa.Yc(this.zb,this.rc,this.Nk)}this.ih&&this.de.r(this.Ks,this.Ls)}};
function Qf(){var a,b;b=this;this.depth=100;this.i=this.visible=!0;R.b.Na(this,R.dc);this.a=R.a.t.Al;if("landscape"===R.orientation&&R.a.t.Wo)for(a in R.a.t.Wo)this.a[a]=R.a.t.Wo[a];this.Sb=R.a.t.Sb;if("landscape"===R.orientation&&R.a.t.Dm)for(a in R.a.t.Dm)this.Sb[a]=R.a.t.Dm[a];for(a in R.a.O.Al)this.a[a]=R.a.O.Al[a];this.xg=[];a=Rf(R.e);this.oq=void 0!==a&&null!==a;this.Ka=new Vb;this.Ka.xa(this.a.cv,function(){b.Ts.call(b)});this.Ka.xa(this.a.hs,function(){b.Vs.call(b)});this.Ka.xa(R.n.yl&&!this.oq?
this.a.Rw:this.a.hs,function(){b.Ws.call(b)});this.Ka.xa(this.a.sw,function(){b.Us.call(b)});M(this,!1)}e=Qf.prototype;e.Ts=function(){this.tk=!0;this.a.Mg&&(this.Ng=R.b.g(this.a.Ng,this.canvas.width,ge.width),this.Di=R.b.g(this.a.Di,this.canvas.width,ge.width),this.Ei=R.b.g(this.a.Ei,this.canvas.height,ge.height),this.Lg=R.b.g(this.a.Lg,this.canvas.height,ge.height),this.tn=this.Ng,this.uk=this.Ei,this.on=this.a.rn,this.pn=this.a.sn,this.nn=this.a.qn,this.mc=0,this.Yd())};
e.Vs=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d;R.n.yl&&!this.oq&&(c=R.b.g(this.a.Qm,this.canvas.width,this.a.Fg,Math.floor(this.a.Fg/2)),d=R.b.g(this.a.ui,this.canvas.height,Gd.height,Math.floor(Gd.height/2)),c=new Sf("difficulty_toggle",c,d,this.depth-20,Tf()+"",this.a.Fg,{S:function(a){Uf(parseInt(a,10));return!0},Vb:!0}),c.ed=Math.floor(this.a.Fg/2),c.fd=Math.floor(Gd.height/2),!1!==a&&(Vf(c,"xScale",b,0,1,this.a.zq),Vf(c,"yScale",b,0,1,this.a.zq)),this.dk=c,this.ui=c.y,this.xg.push(c),
this.Yd())};
e.Ws=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d=this;this.yo=!0;c=new Wf("bigPlay",R.b.g(this.a.ts,this.canvas.width,this.a.$g,Math.floor(this.a.$g/2)),R.b.g(this.a.$i,this.canvas.height,Ld.height,Math.floor(Ld.height/2)),this.depth-20,"startScreenPlay",this.a.$g,{S:function(){N(K,d);var a=R.e,b,c,l;void 0===R.e.Xb&&(void 0!==R.a.O.Xb&&(void 0!==R.a.O.Xb.uu&&(b=R.a.O.Xb.uu),void 0!==R.a.O.Xb.$p&&(I.zd("music",R.a.O.Xb.$p),a.Qf()||jb("music"),R.e.Fw=R.a.O.Xb.$p),c=void 0!==R.a.O.Xb.pu?
R.a.O.Xb.pu:0,l=void 0!==R.a.O.Xb.gi?R.a.O.Xb.gi:0),void 0===b&&"undefined"!==typeof Ze&&(b=Ze),void 0!==b&&(R.e.Xb=I.play(b,c,l),R.e.Xb&&(I.Sp(R.e.Xb,"music"),I.fj(R.e.Xb,!0))));R.n.gh&&!a.Xc?a.screen=new Xf:Yf(a,0);return!0},Vb:!0});c.ed=Math.floor(this.a.$g/2);c.fd=Math.floor(Ld.height/2);!1!==a?(Vf(c,"xScale",b,0,1,this.a.jl),Vf(c,"yScale",b,0,1,this.a.jl),this.kl=0):this.kl=this.a.jl;this.il=c;this.$i=c.y;this.xg.push(c);this.Yd()};
function Zf(a){var b=ic([gc,function(a,b,g,h){return ec(a,b,g,h,2)},Yb],[!0,!1,!1],[.02,.1,.88]);a.ss=!0;Vf(a.il,"xScale",hc(b),1,.25,4E3);Vf(a.il,"yScale",hc(b),1,-.1,4E3)}e.Us=function(a){var b;this.bs=!0;b=new Bf(R.b.g(this.a.ko,this.canvas.width,Dd.width),R.b.g(this.a.Uk,this.canvas.height,Dd.height),this.depth-20,new Tb(Dd),[Dd],{S:R.e.ce,Vb:!0});!1!==a&&Vf(b,"alpha",O,0,1,this.a.rw);this.jo=b;this.Uk=b.y;this.xg.push(b);this.Yd()};
e.Ga=function(){var a,b,c,d;if(a=this.a.backgroundImage)R.b.ob(R.Af),c=Math.abs(R.ia),1<a.L?(b=(w.canvas.height-c)/a.Bg,d=-(a.oi*b-w.canvas.width)/2,va(a,d,c)):(b=(w.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.V(0,d,c,b,b,0,1))};
e.Mm=function(){var a,b,c,d,g,h;if("function"===typeof R.l.Fi&&(h=this.a.Of,(this.za=R.l.Fi())&&0<this.za.length)){this.oa?this.oa.clear():this.oa=new y(this.a.Of,this.a.Ti);z(this.oa);h/=this.za.length;for(c in this.za)try{g=this.za[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Ti/g.height)),a="center"===this.a.Ri?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.oa.height-g.height*d,g instanceof x?g.V(0,a,b,d,d,0,1):w.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}A(this.oa);
this.Nk=0;this.bo=!0;this.Si=0;this.Nf=Rb(0,0,this.oa.width,this.oa.height);this.Yd()}};e.Yd=function(){var a;a=0;R.Y.height<this.a.Bm&&(a=this.a.Bm-R.Y.height);this.yo&&(this.il.y=this.$i-a);this.bs&&(this.jo.y=this.Uk-a,this.jo.x=R.b.g(this.a.ko,R.Y.width,Dd.width)+R.Y.left);this.dk&&(this.dk.y=this.ui-a);this.tk&&this.mc>=this.a.ad&&(this.uk=this.Lg-R.ia);this.oa&&(this.zb=R.b.g(this.a.zb,R.Y.width,this.oa.width)+R.Y.left,this.rc=R.b.g(this.a.rc,R.Y.height,this.oa.height)+R.Y.top)};
e.nc=function(){this.Ga();this.a.Mg&&(R.b.ob(R.dc),this.a.Mg.r(0,0,-this.a.Mg.height-10));this.Mm();this.Ka.start()};e.fc=function(){var a;for(a=0;a<this.xg.length;a++)N(K,this.xg[a])};
e.va=function(a){this.canvas.W=!0;this.tk&&this.mc<this.a.ad&&(this.tn=this.a.gv(this.mc,this.Ng,this.Di-this.Ng,this.a.ad),this.uk=this.a.hv(this.mc,this.Ei,this.Lg-this.Ei,this.a.ad)-R.ia,this.on=this.a.ev(this.mc,this.a.rn,this.a.$q-this.a.rn,this.a.ad),this.pn=this.a.fv(this.mc,this.a.sn,this.a.ar-this.a.sn,this.a.ad),this.nn=this.a.dv(this.mc,this.a.qn,this.a.Zq-this.a.qn,this.a.ad),this.mc+=a,this.mc>=this.a.ad&&(this.tn=this.Di,this.uk=this.Lg-R.ia,this.on=this.a.$q,this.pn=this.a.ar,this.nn=
this.a.Zq));this.yo&&(!this.ss&&this.kl>=this.a.jl+this.a.Qw&&Zf(this),this.kl+=a)};e.Og=function(a,b,c){this.Nf&&Ub(this.Nf,this.zb,this.rc,b,c)&&(this.lb=Math.floor((b-this.zb)/(this.oa.width/this.za.length)))};
e.Pg=function(a,b,c){void 0!==this.lb&&(this.za[this.lb].url||this.za[this.lb].action)&&Ub(this.Nf,this.zb,this.rc,b,c)&&(b-=this.zb,b>=this.oa.width/this.za.length*this.lb&&b<this.oa.width/this.za.length*(this.lb+1)&&(this.za[this.lb].url?R.l.dd(this.za[this.lb].url):this.za[this.lb].action()));this.lb=void 0};e.yb=function(){this.tb=!0};
e.Kb=function(){this.tb&&(this.Ka.stop(),this.tk?this.mc<this.a.ad&&(this.mc=this.a.ad-1):(this.Ts(),this.mc=this.a.ad-1),this.dk?$f(this.dk):this.Vs(!1),this.bs?$f(this.jo):this.Us(!1),this.yo?($f(this.il),this.ss&&Zf(this)):this.Ws(!1),this.tb=!1)};e.bd=function(a){a===R.Ne&&(this.Ga(),this.Yd())};e.Ma=function(){this.tk&&this.a.Mg&&this.a.Mg.V(0,this.tn,this.uk,this.on,this.pn,0,this.nn);this.oa&&this.oa.r(this.zb,this.rc);this.Kc=!1};
function Xf(){this.depth=100;this.i=this.visible=!0;R.b.Na(this,R.dc);var a;this.a=R.a.t.Sg;if("landscape"===R.orientation)for(a in R.a.t.Gr)this.a[a]=R.a.t.Gr[a];this.ya=R.a.k.Gz;if(R.a.k.Sg)for(a in R.a.k.Sg)this.a[a]=R.a.k.Sg[a];this.cc=R.a.t.Sb;for(var b in R.a.O.Sg)this.a[b]=R.a.O.Sg[b];this.Lf=-1;this.Ja=0;this.Mr=[];M(this)}e=Xf.prototype;
e.Ga=function(){var a,b,c,d;R.b.ob(R.Af);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(R.ia),1<a.L?(b=(w.canvas.height-c)/a.Bg,d=-(a.oi*b-w.canvas.width)/2,va(a,d,c)):(b=(w.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.V(0,d,c,b,b,0,1));var g;b=R.a.t.na.type[R.n.vd].Qc;R.a.k.na&&R.a.k.na.type&&R.a.k.na.type[R.n.vd]&&R.a.k.na.type[R.n.vd]&&(b=!1===R.a.k.na.type[R.n.vd].Qc?!1:b);void 0!==this.ya&&void 0!==this.ya.Qc&&(b=this.ya.Qc);c=R.b.g(this.a.Gx,
this.canvas.width,uc.width);a=R.b.g(this.a.Qs,R.Y.height,uc.height)+R.Y.top;b&&(uc.r(0,c,a),b=Y.M(),C(b,this.a.Fx),G(b,"center"),b.r(this.G+" / "+this.ip,c+Math.floor(uc.width/2),a+uc.height+this.a.Rs));if(void 0!==this.ya&&void 0!==this.ya.vx?this.ya.vx:1)b=Y.M(),void 0!==this.a.Sw?C(b,this.a.Sw):C(b,this.a.us),c=R.m.K("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Pa(b,c,this.a.Uw,this.a.Tw),d<b.fontSize&&E(b,d),d=R.b.ta(this.a.vs,this.canvas.width,b.ha(c),b.align),g=R.b.ta(this.a.ws,R.Y.height,
b.U(c),b.j)+R.Y.top,b.r(c,d,g),c=""+this.ml,C(b,this.a.us),d=R.b.ta(this.a.vs,this.canvas.width,b.ha(c),b.align),b.r(c,d,a+uc.height+this.a.Rs)};
function ag(a){if("grid"===a.a.type){z(a.Pi);w.clear();a.Kf=[];var b;b=function(b,d,g){var h,k,l,n,q,v,D,F,r,s,t,u,L,ca,P,X,xa,La,rd,Sb,xd,Db,cf;k=R.n.ca[b];rd=a.Ob?a.a.nv:a.a.ov;Sb=a.a.En;xd=rd;if(a.a.Du)h=a.a.Du[b];else{La=a.Ob?a.a.Gw:a.a.Hw;for(Db=Math.floor(k/La);1<Math.abs(Db-La);)La-=1,Db=Math.floor(k/La);for(h=[];0<k;)h.push(Math.min(La,k)),k-=La}Db=h.length;xa=Math.round(((a.Ob?a.a.Nr:a.a.Or)-(Db+1)*rd)/Db);cf=a.a.Bu?a.a.Bu:!1;if(!cf){La=1;for(k=0;k<Db;k++)La=Math.max(h[k],La);X=Math.round((a.canvas.width-
2*Sb)/La)}for(k=n=0;k<Db;k++){La=h[k];cf&&(X=Math.round((a.canvas.width-2*Sb)/La));for(l=0;l<La;l++){r=a.a.Cq;L=a.a.Qu;t=R.n.si||"locked";u=0;q=bg(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(t=q.state),"object"===typeof q.stats&&null!==q.stats&&(u=q.stats.stars||0));ca="locked"===t;"function"===typeof R.k.kv&&(v=R.k.kv(cg(R.e,b,n),b,n,t))&&(L=ca=r=!1);q=Sb+d;F=xd;P=s=1;if(!1!==L){D=a.Ob?pc:vc;if("played"===t)switch(u){case 1:D=a.Ob?qc:wc;break;case 2:D=a.Ob?rc:xc;break;case 3:D=
a.Ob?sc:yc}else a.Ob||"locked"!==t||(D=Bc);D.width>X&&(P=X/D.width);D.height>xa&&(P=Math.min(s,xa/D.height));q+=Math.round((X-D.width*P)/2);F+=Math.round((xa-D.height*P)/2);D.V(0,q,F,P,P,0,1);g&&(a.Kf[n]={x:q,y:F})}v&&(v.width>X&&(s=X/v.width),v.height>xa&&(s=Math.min(s,xa/v.height)),void 0!==D?(u=R.b.g(a.a.Er,D.width*P,v.width*s),L=R.b.g(a.a.Fr,D.height*P,v.height*s)):(u=R.b.g(a.a.Er,X,v.width*s),L=R.b.g(a.a.Fr,xa,v.height*s),g&&(a.Kf[n]={x:q+u,y:F+L})),v instanceof y?v.V(q+u,F+L,s,s,0,1):v.V(0,
q+u,F+L,s,s,0,1));!1===r||ca||(r=""+(R.n.vj?n+1:cg(R.e,b,n)+1),s=a.fonts.xn,"locked"===t&&void 0!==a.fonts.Wv?s=a.fonts.Wv:"unlocked"===t&&void 0!==a.fonts.uy?s=a.fonts.uy:"played"===t&&void 0!==a.fonts.played&&(s=a.fonts.played),void 0!==D?(u=R.b.ta(a.a.Ir,D.width*P,s.ha(r),s.align),L=R.b.ta(a.a.Jr,D.height*P,s.U(r),s.j)):(u=R.b.ta(a.a.Ir,X,s.ha(r),s.align),L=R.b.ta(a.a.Jr,xa,s.U(r),s.j)),s.r(r,q+u,F+L));a.Ob&&ca&&(void 0!==D?(u=R.b.g(a.a.Vr,D.width*P,tc.width),L=R.b.g(a.a.Wr,D.height*P,tc.height)):
(u=R.b.g(a.a.Vr,X,tc.width),L=R.b.g(a.a.Wr,xa,tc.height)),tc.r(0,q+u,F+L));Sb+=X;n++}Sb=a.a.En;xd+=xa+rd}};a.Ki&&b(a.B-1,0);b(a.B,a.canvas.width,!0);a.Ji&&b(a.B+1,2*a.canvas.width);A(a.Pi)}}function dg(a,b){switch(b-a.B){case 0:a.no=0;break;case 1:a.no=-a.canvas.width;break;case -1:a.no=a.canvas.width}a.Xg=!0;a.Xk=0;a.moveStart=a.Ja;a.es=a.no-a.Ja;a.Wk=Math.min(a.a.Bw-a.oh,Math.round(Math.abs(a.es)/(a.El/1E3)));a.Wk=Math.max(a.a.Aw,a.Wk)}
function eg(a){if(1<R.n.ca.length){var b,c;b=R.b.g(a.a.zy,a.canvas.width,Ac.width);c=R.b.g(a.a.yp,R.Y.height,Ac.height)+R.Y.top;a.Le=new Bf(b,c,a.depth-20,new Tb(Ac),[Ac],function(){a.Bd="previous";dg(a,a.B-1);return!0});b=R.b.g(a.a.yy,a.canvas.width,zc.width);c=R.b.g(a.a.xp,R.Y.height,zc.height)+R.Y.top;a.Ke=new Bf(b,c,a.depth-20,new Tb(zc),[zc],function(){a.Bd="next";dg(a,a.B+1);return!0});fg(a)}else a.He-=a.a.fr}
function fg(a){if(1<R.n.ca.length){var b;a.Ki?(b=[Ac],a.Le.Za=!0):(b=[new y(Ac.width,Ac.height)],z(b[0]),Ac.r(1,0,0),A(b[0]),a.Le.Za=!1);gg(a.Le,b);a.Ji?(b=[zc],a.Ke.Za=!0):(b=[new y(zc.width,zc.height)],z(b[0]),zc.r(1,0,0),A(b[0]),a.Ke.Za=!1);gg(a.Ke,b)}}
function hg(a){var b,c,d;z(a.fg);w.clear();b=Y.M();a.a.ld&&C(b,a.a.ld);G(b,"center");H(b,"middle");c=R.m.K("levelMapScreenWorld_"+a.B,"<LEVELMAPSCREENWORLD_"+a.B+">");d=Pa(b,c,a.a.Dd-(b.stroke?b.$b:0),a.a.Xe-(b.stroke?b.$b:0),!1);d<b.fontSize&&E(b,d);b.r(c,a.fg.width/2,a.fg.height/2);A(a.fg);a.canvas.W=!0}
e.nc=function(){var a,b,c,d=this;this.Ob=this.a.Ob?!0:!1;if(!this.Ob){for(a=0;a<R.n.ca.length;a++)if(9<R.n.ca[a]){b=!0;break}b||(this.Ob=!0)}this.Pi=new y(3*this.canvas.width,this.Ob?this.a.Nr:this.a.Or);this.Kr=-this.canvas.width;this.Lr=this.Ob?this.a.er:this.a.gr;this.He=R.b.g(this.Lr,R.Y.height,this.Pi.height)+R.Y.top;this.fg=new y(this.a.Dd,this.a.Xe);this.gy=R.b.g(this.a.Ye,this.canvas.width,this.a.Dd);this.wt=R.b.g(this.a.vc,R.Y.height,this.fg.height)+R.Y.top;this.Hr="undefined"!==typeof s_level_mask?
s_level_mask:this.Ob?Tb(pc):Tb(vc);this.a.Cq&&(this.fonts={},a=function(a){var b,c;for(b in a)c=Y.M(),C(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.xn=Y,this.Ob?a(this.a.Lv):a(this.a.Mv));this.B=R.e.B;this.ca=R.n.ca[this.B];this.Fl=!1;this.El=this.$o=this.oh=0;this.ap=this.Kr;this.Ja=0;this.Ki=0<this.B;this.Ji=this.B<R.n.ca.length-1;for(b=this.ip=this.ml=this.G=0;b<R.n.ca.length;b++)for(a=0;a<R.n.ca[b];a++)c=ig(void 0,a,b),this.ip+=3,"object"===typeof c&&null!==c&&(this.G+=void 0!==c.stars?c.stars:
0,this.ml+=void 0!==c.highScore?c.highScore:0);R.k.mv&&(this.ml=R.k.mv());this.Ga();a=this.cc[this.a.Jw];this.qo=new Bf(R.b.g(this.a.Kw,this.canvas.width,a.s.width),R.b.g(this.a.ro,R.Y.height,a.s.height)+R.Y.top,this.depth-20,new Tb(a.s),[a.s],{S:R.e.ce,la:this});eg(this);ag(this);hg(this);this.Kc=!0};e.fc=function(){this.Le&&N(K,this.Le);this.Ke&&N(K,this.Ke);N(K,this.qo)};
e.yb=function(a,b,c){if(!this.Xg)for(a=0;a<this.Kf.length;a++)if(Ub(this.Hr,this.Kf[a].x-this.canvas.width,this.Kf[a].y+this.He,b,c)){this.Lf=a;break}this.Xg=!1;1<R.n.ca.length&&(this.Fl=!0,this.oh=0,this.it=this.ap=b,this.El=this.$o=0)};
e.Kb=function(a,b,c){if(!this.Xg&&-1!==this.Lf&&Ub(this.Hr,this.Kf[this.Lf].x-this.canvas.width,this.Kf[this.Lf].y+this.He,b,c)&&(a=R.n.si||"locked",b=bg(this.B,this.Lf,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return N(K,this),Yf(R.e,this.Lf,this.B),!0;this.Lf=-1;this.Fl=!1;1<R.n.ca.length&&(Math.abs(this.Ja)>=this.a.Yx&&(this.El>=this.a.Zx||Math.abs(this.Ja)>=this.a.Xx)?"previous"===this.Bd?this.Ki&&0<=this.Ja&&this.Ja<=this.canvas.width/2?dg(this,
this.B-1):(0>this.Ja||(this.Bd="next"),dg(this,this.B)):"next"===this.Bd&&(this.Ji&&0>=this.Ja&&this.Ja>=-this.canvas.width/2?dg(this,this.B+1):(0<this.Ja||(this.Bd="previous"),dg(this,this.B))):0<Math.abs(this.Ja)&&(this.Bd="next"===this.Bd?"previous":"next",dg(this,this.B)));return!0};
e.bd=function(a){if(a===R.Jf||a===R.Ne)this.canvas.W=!0,this.Ga(),a===R.Ne?(this.wt=R.b.g(this.a.vc,R.Y.height,this.fg.height)+R.Y.top,this.He=R.b.g(this.Lr,R.Y.height,this.Pi.height)+R.Y.top,this.qo.y=R.b.g(this.a.ro,R.Y.height,this.qo.images[0].height)+R.Y.top,this.Le&&(this.Le.y=R.b.g(this.a.yp,R.Y.height,Ac.height)+R.Y.top),this.Ke&&(this.Ke.y=R.b.g(this.a.xp,R.Y.height,zc.height)+R.Y.top),void 0===this.Ke&&void 0===this.Le&&(this.He-=this.a.fr)):(hg(this),ag(this))};
e.Lc=function(a){var b=Bb(0);this.Fl&&(this.$o=Math.abs(this.ap-b),0<this.oh&&(this.El=this.$o/(this.oh/1E3)),this.Bd=b>this.ap?"previous":"next",this.oh+=a,this.Ja+=b-this.it,this.it=b,this.canvas.W=!0);this.Xg&&(this.Ja=ac(this.Xk,this.moveStart,this.es,this.Wk),this.Xk>=this.Wk&&(this.Xg=!1,this.Ja=0),this.Xk+=a,this.canvas.W=!0);if(this.Xg||this.Fl)"previous"===this.Bd&&this.Ja>=this.canvas.width/2?0<=this.B-1?(this.B-=1,this.ca=R.n.ca[this.B],this.Ki=0<this.B,this.Ji=this.B<R.n.ca.length-1,fg(this),
this.Ja-=this.canvas.width,hg(this),ag(this),this.canvas.W=!0,this.moveStart-=this.canvas.width):this.Ja=Math.round(this.canvas.width/2):"next"===this.Bd&&this.Ja<=-this.canvas.width/2&&(this.B+1<R.n.ca.length?(this.B+=1,this.ca=R.n.ca[this.B],this.Ki=0<this.B,this.Ji=this.B<R.n.ca.length-1,fg(this),this.Ja+=this.canvas.width,hg(this),ag(this),this.canvas.W=!0,this.moveStart+=this.canvas.width):this.Ja=Math.round(-this.canvas.width/2))};
e.Ma=function(){this.fg.r(this.gy,this.wt);this.Pi.r(Math.round(this.Kr+this.Ja),this.He);this.Kc=!1};
function jg(a,b,c,d){this.depth=10;this.i=this.visible=!0;R.b.Na(this,R.dc);var g;this.type=b.failed?"failed":a;this.a=R.a.t.na;this.ya=this.a.type[this.type];if("landscape"===R.orientation)for(g in R.a.t.Dr)this.a[g]=R.a.t.Dr[g];for(g in R.a.O.na)this.a[g]=R.a.O.na[g];if(R.a.O.na&&R.a.O.na.type&&R.a.O.na.type[this.type])for(g in R.a.O.na.type[this.type])this.a[g]=R.a.O.na.type[this.type][g];if("failed"===this.type){if(void 0!==R.a.k.na&&R.a.k.na.type&&void 0!==R.a.k.na.type.failed)for(g in R.a.k.na.type[this.type])this.ya[g]=
R.a.k.na.type[this.type][g]}else{if(void 0!==R.a.k.na&&void 0!==R.a.k.na.type)for(g in R.a.k.na.type[this.type])this.ya[g]=R.a.k.na.type[this.type][g];for(g in R.a.k.na)this.ya[g]=R.a.k.na[g]}this.sa=b;this.S=c;this.la=d;this.Ax=[df,ef,ff];this.nf=[];this.Ka=new Vb;this.Ka.parent=this;M(this,!1)}
function kg(a){var b;for(b=0;b<a.G.length;b++)lg(a.G[b]);for(b=0;b<a.Xf.length;b++)N(K,a.Xf[b]);a.Xf=[];a.Ia&&lg(a.Ia);a.Ia=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].Za=!1;a.Ka.stop();a.Ka=void 0;mg(a)}
function ng(a,b){var c;switch(b){case "title_level":c=R.m.K("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.sa.level);break;case "title_endless":c=R.m.K("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.sa.stage);break;case "title_difficulty":c=R.m.K("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.lc(a.a.ld,c,a.a.Ye,a.a.vc,a.a.Dd,a.a.Xe)}
function og(a,b){var c;switch(b){case "subtitle_failed":c=R.m.K("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.lc(a.a.Tx,c,a.a.Ux,a.a.Vx)}
function pg(a,b,c){var d,g,h,k,l;g=R.m.K(b.key,"<"+b.key.toUpperCase()+">");d=b.te?b.toString(b.Yf):b.toString(b.Hc);h=a.a.kj;h.align="left";h.j="top";l=Y.M();C(l,h);c?(H(l,"bottom"),h=a.a.Zf,h.align="left",h.j="bottom",c=Y.M(),C(c,h),h=k=0,void 0!==g&&(h+=l.ha(g)+a.a.lj),void 0!==d&&(h+=c.ha(d)),h=R.b.g(a.a.ee,a.canvas.width,h)-a.c.x,void 0!==g&&(l.r(g,h,a.jd+l.fontSize),h+=l.ha(g)+a.a.lj,k+=l.U(g)),void 0!==d&&(b.te?(d=c.U(d),l=a.jd+l.fontSize-d,b.ri=new qg(h,l,a.a.lh,d,a.depth-100,b.Yf,c,a.a.jh,
a.a.kh,a.c,b.toString),k=Math.max(k,d)):(c.r(d,h,a.jd+l.fontSize+a.a.Xs),k=Math.max(k,c.U(d)))),0<k&&(a.jd+=k+a.a.hd)):(void 0!==g&&(a.lc(h,g,a.a.ee,a.a.Pe),k=a.a.Pe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.hd:a.a.hd,k.offset+=l.U(g)):"number"===typeof k&&(k+=a.a.hd+l.U(g))),void 0!==d&&(h=a.a.Zf,h.j="top",b.te?(c=Y.M(),h.align="center",C(c,h),g=R.b.g(a.a.ee,a.canvas.width,a.a.lh)-a.c.x,l=k-a.c.y,b.ri=new qg(g,l,a.a.lh,c.U(d),a.depth-100,b.Yf,c,a.a.jh,a.a.kh,a.c,b.toString)):a.lc(h,
d,a.a.ee,k)))}
function rg(a,b,c){var d,g,h,k,l,n;switch(b){case "totalScore":d=""+a.sa.totalScore;g=R.m.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=R.m.K("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.sa.highScore;break;case "timeLeft":g=R.m.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.sa.timeLeft;break;case "timeBonus":g=R.m.K("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.sa.timeBonus,n=a.sa.timeBonus}h=a.a.kj;h.align=
"left";h.j="top";l=Y.M();C(l,h);c?(H(l,"bottom"),h=a.a.Zf,h.align="left",h.j="bottom",c=Y.M(),C(c,h),h=k=0,void 0!==g&&(h+=l.ha(g)+a.a.lj),void 0!==d&&(h+=c.ha(d)),h=R.b.g(a.a.ee,a.canvas.width,h)-a.c.x,void 0!==g&&(l.r(g,h,a.jd+l.fontSize),h+=l.ha(g)+a.a.lj,k+=l.U(g)),void 0!==d&&(void 0!==n?(d=c.U(d),l=a.jd+l.fontSize-d,n=new qg(h,l,a.a.lh,d,a.depth-100,n,c,a.a.jh,a.a.kh,a.c),k=Math.max(k,d)):(c.r(d,h,a.jd+l.fontSize+a.a.Xs),k=Math.max(k,c.U(d)))),0<k&&(a.jd+=k+a.a.hd)):(void 0!==g&&(a.lc(h,g,a.a.ee,
a.a.Pe),k=a.a.Pe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.hd:a.a.hd,k.offset+=l.U(g)):"number"===typeof k&&(k+=a.a.hd+l.U(g))),void 0!==d&&(h=a.a.Zf,h.j="top",void 0!==n?(c=Y.M(),h.align="center",C(c,h),g=R.b.g(a.a.ee,a.canvas.width,a.a.lh)-a.c.x,l=k-a.c.y,n=new qg(g,l,a.a.lh,c.U(d),a.depth-100,n,c,a.a.jh,a.a.kh,a.c)):a.lc(h,d,a.a.ee,k)));n instanceof qg&&("totalScore"===b?a.hg=n:a.nf.push(n))}
function sg(a,b){var c,d,g;c=R.m.K(b.key,"<"+b.key.toUpperCase()+">");d=b.te?b.toString(b.Yf):b.toString(b.Hc);void 0!==c&&a.lc(a.a.Wm,c,a.a.Xm,a.a.ik);void 0!==d&&(b.te?(c=Y.M(),d=a.a.wi,a.a.Tu||(d.align="center"),C(c,d),d=R.b.g(a.a.xi,a.canvas.width,a.a.kk)-a.c.x,g=R.b.g(a.a.Hg,a.canvas.height,a.a.jk)-a.c.y,b.ri=new qg(d,g,a.a.kk,a.a.jk,a.depth-100,b.Yf,c,a.a.jh,a.a.kh,a.c,b.toString)):a.lc(a.a.wi,d,a.a.xi,a.a.Hg))}
function tg(a,b){var c,d,g,h;switch(b){case "totalScore":c=R.m.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.sa.totalScore;g=0;break;case "timeLeft":c=R.m.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.sa.timeLeft}void 0!==c&&a.lc(a.a.Wm,c,a.a.Xm,a.a.ik);void 0!==d&&(void 0!==g?(c=Y.M(),d=a.a.wi,d.align="center",C(c,d),d=R.b.g(a.a.xi,a.canvas.width,a.a.kk)-a.c.x,h=R.b.g(a.a.Hg,a.canvas.height,a.a.jk)-a.c.y,g=new qg(d,h,a.a.kk,a.a.jk,a.depth-100,g,c,a.a.jh,a.a.kh,
a.c)):a.lc(a.a.wi,d,a.a.xi,a.a.Hg));g instanceof qg&&("totalScore"===b?a.hg=g:a.nf.push(g))}e=jg.prototype;e.lc=function(a,b,c,d,g,h){var k=Y.M();C(k,a);void 0!==g&&void 0!==h&&(a=Pa(k,b,g,h,g),k.fontSize>a&&E(k,a));a=k.ha(b);h=k.U(b);k.r(b,R.b.ta(c,this.canvas.width,a,k.align)-this.c.x,R.b.ta(d,this.canvas.height,h,k.j)-this.c.y,g)};
function ug(a,b){var c,d,g,h;switch(b){case "retry":c=Ed;d=function(){a.we="retry";kg(a)};break;case "exit":c=Bd,d=function(){a.we="exit";kg(a)}}void 0!==c&&(g=R.b.g(a.a.ou,a.canvas.width,c.width)-a.c.x,h=R.b.g(a.a.tm,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Bf(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
function vg(a,b){var c,d,g,h;switch(b){case "retry":c=Rd;d=function(){a.we="retry";kg(a)};break;case "exit":c=Ad;d=function(){a.we="exit";kg(a)};break;case "next":c=Ad,d=function(){a.we="next";kg(a)}}void 0!==c&&(g=R.b.g(a.a.Tq,a.canvas.width,c.width)-a.c.x,h=R.b.g(a.a.fn,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Bf(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
e.nc=function(){this.p=0;this.G=[];this.Xf=[];this.buttons=[];this.canvas.W=!0;this.we="";this.Ic=this.sa.failed?!0:!1;this.Qc=this.ya.Qc&&!this.Ic;this.hh=this.ya.hh&&!this.Ic&&this.sa.rr;this.mm=this.alpha=this.wg=0;wg(this);var a,b,c,d,g,h,k=this;switch(this.ya.Sj){case "failed":this.f=this.a.dl.Kv;break;case "level":this.f=this.a.dl.Nv;break;case "difficulty":this.f=this.a.dl.eb;break;case "endless":this.f=this.a.dl.Uu}this.c=new xg(this.depth-10,this.ma,new y(this.f.width,this.f.height));this.c.x=
R.b.g(this.a.Yb,this.canvas.width,this.f.width);this.c.y=R.b.g(this.a.Zb,this.canvas.height,this.f.height);z(this.c.f);this.f.r(0,0,0);!this.Ic&&this.Qc&&(b=R.b.g(this.a.Qo,this.canvas.width,0)-this.c.x,a=R.b.g(this.a.Ro,this.canvas.height,s_star01_fill.height)-this.c.y+Math.round(s_star01_empty.height/2),s_star01_empty.r(0,b,a),b=R.b.g(this.a.So,this.canvas.width,0)-this.c.x,a=R.b.g(this.a.To,this.canvas.height,s_star02_fill.height)-this.c.y+Math.round(s_star02_empty.height/2),s_star02_empty.r(0,
b,a),b=R.b.g(this.a.Uo,this.canvas.width,0)-this.c.x,a=R.b.g(this.a.Vo,this.canvas.height,s_star03_fill.height)-this.c.y+Math.round(s_star03_empty.height/2),s_star03_empty.r(0,b,a));void 0!==this.ya.qj&&ng(this,this.ya.qj);void 0!==this.ya.bt&&og(this,this.ya.bt);this.pb={};void 0!==this.sa.Zc?(c=this.sa.Zc,c.visible&&sg(this,c),this.pb[c.id]=c):void 0!==this.ya.Ym&&tg(this,this.ya.Ym);if(void 0!==this.sa.pb)for(a=this.sa.pb.length,b=Y.M(),C(b,this.a.kj),c=Y.M(),C(c,this.a.Zf),b=Math.max(b.U("g"),
c.U("g"))*a+this.a.hd*(a-1),this.jd=R.b.g(this.a.Pe,this.canvas.height,b)-this.c.y,b=0;b<a;b++)c=this.sa.pb[b],c.visible&&pg(this,this.sa.pb[b],1<a),this.pb[c.id]=c;else if(void 0!==this.ya.Qe)if("string"===typeof this.ya.Qe)rg(this,this.ya.Qe,this.a.Sq);else if(this.ya.Qe instanceof Array)for(a=this.ya.Qe.length,b=Y.M(),C(b,this.a.kj),c=Y.M(),C(c,this.a.Zf),b=Math.max(b.U("g"),c.U("g"))*a+this.a.hd*(a-1),this.jd=R.b.g(this.a.Pe,this.canvas.height,b)-this.c.y,b=0;b<a;b++)rg(this,this.ya.Qe[b],1<a||
this.a.Sq);A(this.c.f);ug(this,this.ya.Qj);vg(this,this.ya.pk);R.e.Ht&&(b=R.b.g(k.a.yv,k.canvas.width,k.a.mr)-this.c.x,a=R.b.g(this.a.zv,this.canvas.height,this.a.qf)-this.c.y,this.lr=new Wf("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.mr,{S:function(){void 0!==yg?R.l.dd(R.u.Bk.url+"submit/"+yg+"/"+k.sa.totalScore):R.l.dd(R.u.Bk.url+"submit/")},Vb:!0},k.c),this.buttons.push(this.lr),b=function(a){a&&(k.lr.op("levelEndScreenSubmitHighscoreBtn"),k.Dz=a)},zg(this.sa.totalScore,
b));b=R.b.g(this.a.rf,this.canvas.width,this.a.Ag)-this.c.x;a=R.b.g(this.a.xe,this.canvas.height,this.a.qf)-this.c.y;this.buttons.push(new Bf(b,a,this.depth-20,new Rb(0,0,this.a.Ag,this.a.qf),void 0,function(){k.we="exit";kg(k)},this.c));for(b=0;b<this.buttons.length;b++)this.buttons[b].Za=!1;this.c.y=-this.c.height;a=this.a.ay;this.Ka.xa(a,this.Lx);a+=this.a.ci;g=0;d=this.a.ny;this.Qc&&(d=Math.max(d,this.a.Os+this.a.Ns*this.sa.stars));if(this.hg&&(this.Ka.xa(a+this.a.Kl,function(a,b){Ag(b.parent.hg,
b.parent.sa.totalScore,d)}),g=a+this.a.Kl+d,0<this.nf.length)){h=function(a,b){var c=b.parent,d=c.nf[c.wg];Ag(c.hg,c.hg.value+d.value,c.a.vg);Ag(d,0,c.a.vg);c.wg+=1};for(b=0;b<this.nf.length;b++)g+=this.a.iq,this.Ka.xa(g,h);g+=this.a.vg}if(void 0!==this.pb&&(g=a,h=function(a,b){var c=b.parent,d=c.Yo[c.wg||0],g=c.pb[d.Dl];void 0!==d.$e&&(g.visible&&g.te?Ag(g.ri,d.$e(g.ri.value),c.a.vg):g.Hc=d.$e(g.Hc));d.visible&&d.te&&Ag(d.ri,d.Hc,c.a.vg);c.wg+=1},this.Yo=[],void 0!==this.sa.Zc&&void 0!==this.sa.Zc.$e&&
(this.Ka.xa(a+this.a.Kl,h),this.Yo.push(this.sa.Zc),g+=this.a.Kl+bonusCounterDuration),void 0!==this.sa.pb))for(b=0;b<this.sa.pb.length;b++)c=this.sa.pb[b],void 0!==c.$e&&(g+=this.a.iq,this.Ka.xa(g,h),this.Yo.push(c),g+=this.a.vg);if(this.Qc){for(b=0;b<this.sa.stars;b++)a+=this.a.Ns,this.Ka.xa(a,this.Nx),this.Ka.xa(a,this.Ox);a+=this.a.Os}a=Math.max(a,g);this.hh&&(a+=this.a.hw,this.Ka.xa(a,this.Kx),this.Ka.xa(a,this.Ix),this.Ka.xa(a+this.a.iw,this.Jx));a+=500;this.Ka.xa(a,function(){R.l.Cv&&R.l.Cv()});
this.Ka.xa(a+this.a.yw,R.l.Dv);R.l.sr(this.sa);this.Ka.start();this.Ic?I.play(gf):I.play(af)};e.va=function(a){this.alpha=this.a.mk*this.mm/this.a.xb;this.mm+=a;this.alpha>=this.a.mk&&(this.alpha=this.a.mk,this.i=!1);this.canvas.W=!0};
e.Lx=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].Za=!0}var d=b.parent,g,h;switch(d.a.hu){case "fromLeft":h="horizontal";g=R.b.g(d.a.Yb,d.canvas.width,d.c.width);d.c.x=-d.c.width;d.c.y=R.b.g(d.a.Zb,d.canvas.height,d.c.height)+Math.abs(R.ia);break;case "fromRight":h="horizontal";g=R.b.g(d.a.Yb,d.canvas.width,d.c.width);d.c.x=d.canvas.width;d.c.y=R.b.g(this.parent.a.Zb,d.canvas.height,selft.c.height)+Math.abs(R.ia);break;case "fromBottom":h="vertical";g=R.b.g(d.a.Zb,
d.canvas.height,d.c.height)+Math.abs(R.ia);d.c.x=R.b.g(d.a.Yb,d.canvas.width,d.c.width);d.c.y=d.canvas.height+d.c.height;break;default:h="vertical",g=R.b.g(d.a.Zb,d.canvas.height,d.c.height)+Math.abs(R.ia),d.c.x=R.b.g(d.a.Yb,d.canvas.width,d.c.width),d.c.y=-d.c.height}"vertical"===h?Bg(d.c,"y",g,d.a.ci,d.a.Nj,c):Bg(d.c,"x",g,d.a.ci,d.a.Nj,c)};
function mg(a){function b(){N(K,a);a.la?a.S.call(a.la,a.we):a.S(a.we)}var c,d;switch(a.a.iu){case "toLeft":d="horizontal";c=-a.c.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.c.height;break;default:d="vertical",c=-a.c.height}"vertical"===d?Bg(a.c,"y",c,a.a.nm,a.a.om,b):Bg(a.c,"x",c,a.a.nm,a.a.om,b)}
e.Nx=function(a,b){var c,d=b.parent,g=Math.abs(R.ia);if(d.G.length<d.sa.stars){switch(d.G.length+1){case 1:c=new xg(d.depth-30,R.Qd,s_star01_fill);c.x=R.b.g(d.a.Qo,d.canvas.width,0);c.y=R.b.g(d.a.Ro,d.canvas.height,s_star01_fill.height)+g+Math.round(s_star01_empty.height/2);break;case 2:c=new xg(d.depth-30,R.Qd,s_star02_fill);c.x=R.b.g(d.a.So,d.canvas.width,0);c.y=R.b.g(d.a.To,d.canvas.height,s_star02_fill.height)+g+Math.round(s_star02_empty.height/2);break;case 3:c=new xg(d.depth-30,R.Qd,s_star03_fill),
c.x=R.b.g(d.a.Uo,d.canvas.width,0),c.y=R.b.g(d.a.Vo,d.canvas.height,s_star03_fill.height)+g+Math.round(s_star03_empty.height/2)}c.Ba=d.a.Ps;c.Da=d.a.Ps;c.alpha=d.a.Ex;Bg(c,"scale",1,d.a.Dx,gc,function(){var a=d.G.length,b,c,n;z(d.c.f);switch(a){case 1:n=s_star01_fill;b=R.b.g(d.a.Qo,d.canvas.width,0)-d.c.x;c=R.b.g(d.a.Ro,d.canvas.height,s_star01_fill.height)-d.c.y+g+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=R.b.g(d.a.So,d.canvas.width,0)-d.c.x;c=R.b.g(d.a.To,d.canvas.height,
s_star01_fill.height)-d.c.y+g+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=R.b.g(d.a.Uo,d.canvas.width,0)-d.c.x,c=R.b.g(d.a.Vo,d.canvas.height,s_star01_fill.height)-d.c.y+g+Math.round(s_star03_empty.height/2)}n.r(0,b,c);A(d.c.f);d.c.Kc=!0;N(K,d.G[a-1])});Bg(c,"alpha",1,d.a.Cx,$b);d.G.push(c);I.play(d.Ax[d.G.length-1])}};
e.Ox=function(a,b){var c=b.parent,d,g;d=c.G[c.Xf.length];g=new xg(c.depth-50,R.Qd,s_sfx_star);g.x=d.x;g.y=d.y;Bg(g,"subImage",s_sfx_star.L-1,c.a.Bx,void 0,function(){N(K,g)});c.Xf.push(g)};
e.Ix=function(a,b){var c=b.parent,d,g,h,k,l,n,q;d=[];h=Y.M();k=R.m.K("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.as&&C(h,c.a.as);g=Pa(h,k,c.a.Rk,c.a.ow,!0);g<h.fontSize&&E(h,g);l=R.b.ta(c.a.pw,Ec.width,h.ha(k,c.a.Rk),h.align);n=R.b.ta(c.a.qw,Ec.height,h.U(k,c.a.Rk),h.j);for(q=0;q<Ec.L;q++)g=new y(Ec.width,Ec.height),z(g),Ec.r(q,0,0),h.r(k,l,n,c.a.Rk),A(g),d.push(g);c.Ia=new xg(c.depth-120,R.Qd,d);c.Ia.ed=c.a.Yr;c.Ia.fd=c.a.Zr;c.Ia.x=R.b.g({align:"center"},c.c.canvas.width,c.Ia.width)-c.c.x;
c.Ia.y=R.b.g(c.a.Tk,c.Ia.canvas.height,c.Ia.height)-c.c.y+Math.abs(R.ia);l=R.b.g(c.a.Sk,c.Ia.canvas.width,c.Ia.width)-c.c.x;c.Ia.Ba=c.a.Qk;c.Ia.Da=c.a.Qk;c.Ia.parent=c.c;c.Ia.alpha=0;c.Ia.Qy=!0;Bg(c.Ia,"scale",1,c.a.Wg,$b,function(){N(K,c.mb);c.mb=void 0});Bg(c.Ia,"x",l,c.a.Wg,$b);Bg(c.Ia,"alpha",1,0,$b);Bg(c.Ia,"subImage",Ec.L,c.a.mw,$b,void 0,c.a.Wg+c.a.Xr+c.a.lw,!0,c.a.nw)};
e.Kx=function(a,b){var c,d=b.parent;d.mb=new xg(d.depth-110,R.Qd,Dc);d.mb.y=R.b.g(d.a.Tk,d.mb.canvas.height,Dc.height)-d.c.y+d.a.kw;d.mb.ed=d.a.Yr;d.mb.fd=d.a.Zr;d.mb.x=R.b.g(d.a.Sk,d.mb.canvas.width,d.mb.width)-d.c.x;c=R.b.g(d.a.Tk,d.mb.canvas.height,Dc.height)-d.c.y+Math.abs(R.ia);d.mb.Ba=d.a.Qk*d.a.$r;d.mb.Da=d.a.Qk*d.a.$r;d.mb.alpha=0;d.mb.parent=d.c;Bg(d.mb,"y",c,d.a.Wg,$b);Bg(d.mb,"scale",1,d.a.Wg,$b);Bg(d.mb,"alpha",1,d.a.Wg,$b)};
e.Jx=function(a,b){var c=b.parent;c.Je=new xg(c.depth-130,R.Qd,Cc);c.Je.parent=c.c;c.Je.x=c.Ia.x;c.Je.y=c.Ia.y+c.a.jw;Bg(c.Je,"subImage",Cc.L-1,c.a.Xr,void 0,function(){N(K,c.Je);c.Je=void 0});I.play(kf)};
e.fc=function(){var a;for(a=0;a<this.buttons.length;a++)N(K,this.buttons[a]);for(a=0;a<this.G.length;a++)N(K,this.G[a]);for(a=0;a<this.Xf.length;a++)N(K,this.Xf[a]);this.Ia&&(N(K,this.Ia),this.Je&&N(K,this.Je),this.mb&&N(K,this.mb));N(K,this.c);this.Ka&&this.Ka.stop();this.hg&&N(K,this.hg);for(a=0;a<this.nf.length;a++)N(K,this.nf[a]);Cg()};e.Ma=function(){var a=w.context.globalAlpha;w.context.globalAlpha=this.alpha;ra(0,0,w.canvas.width,w.canvas.height,this.a.Lq,!1);w.context.globalAlpha=a};
function Dg(a,b,c,d){this.depth=-100;this.visible=!1;this.i=!0;R.b.Na(this,R.dc);var g,h;this.a=c?R.a.t.is:R.a.t.options;if("landscape"===R.orientation)for(g in h=c?R.a.t.kA:R.a.t.Lw,h)this.a[g]=h[g];this.cc=R.a.t.Sb;h=c?R.a.O.is:R.a.O.options;for(g in h)this.a[g]=h[g];if(R.u.options&&R.u.options.buttons)for(g in R.u.options.buttons)this.a.buttons[g]=R.u.options.buttons[g];this.type=a;this.py=b;this.Xc=c;this.xl=!1!==d;M(this)}e=Dg.prototype;
e.ai=function(a,b,c,d,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,v=void 0;switch(a){case "music":h="music_toggle";n=this.yt;l=R.e.Qf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.yt;l=R.e.Qf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.zt;l=R.e.ll()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.zt;l=R.e.ll()?"on":"off";break;case "language":h="language_toggle";n=this.xt;l=R.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.gj;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.Cs;this.Cm=this.tx;break;case "moreGames":void 0!==R.u.xw?(h="default_image",v=R.u.xw):(h="default_text",k="optionsMoreGames");n=this.ux;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=R.bh.customFunctions&&"function"===typeof R.bh.customFunctions.exit?R.bh.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.ex;break;
case "restart":h="default_text";k="optionsRestart";n=this.jx;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.Cs;this.Cm=this.wx;break;case "about":h="default_text";k="optionsAbout";n=this.rx;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.Bi;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.mi}void 0!==h&&void 0!==n&&("image"===this.cc[h].type?this.buttons.push(new Eg(h,b,c,this.depth-20,v,d,{S:n,la:this,Vb:q},
this.c)):"toggleText"===this.cc[h].type?this.buttons.push(new Sf(h,b,c,this.depth-20,l,d,{S:n,la:this,Vb:q},this.c)):"text"===this.cc[h].type?this.buttons.push(new Wf(h,b,c,this.depth-20,k,d,{S:n,la:this,Vb:q},this.c)):"toggle"===this.cc[h].type&&this.buttons.push(new Fg(h,b,c,this.depth-20,l,{S:n,la:this,Vb:q},this.c)),this.buttons[this.buttons.length-1].Za=g||!1)};
e.Cs=function(){var a=this;Bg(a.c,"y","inGame"!==this.type?-this.c.f.height:this.canvas.height,this.a.to,this.a.uo,function(){N(K,a);void 0!==a.Cm&&a.Cm.call(a)});return!0};
e.Ga=function(a,b){var c,d,g,h;z(this.c.f);w.clear();this.a.backgroundImage.r(0,0,0);c=R.m.K("optionsTitle","<OPTIONS_TITLE>");d=Y.M();this.a.ld&&C(d,this.a.ld);void 0!==this.a.Dd&&void 0!==this.a.Xe&&(g=Pa(d,c,this.a.Dd,this.a.Xe,this.a.Dd),d.fontSize>g&&E(d,g));g=R.b.ta(this.a.Ye,this.canvas.width,d.ha(c),d.align)-a;h=R.b.ta(this.a.vc,this.canvas.height,d.U(c,d.j))-b+-1*R.ia;d.r(c,g,h);A(this.c.f)};
e.jf=function(a,b,c){var d,g,h,k,l,n,q;h=!1;var v=this.a.buttons[this.type];"inGame"===this.type&&R.a.k.zf.cs&&(v=R.a.k.zf.cs);if("function"!==typeof Gg())for(d=0;d<v.length;d++){if("string"===typeof v[d]&&"moreGames"===v[d]){v.splice(d,1);break}for(g=0;g<v[d].length;g++)if("moreGames"===v[d][g]){v[d].splice(g,1);break}}if(!1===R.u.Qf||!1===R.e.Kk)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("music"===v[d][g]){R.e.Lk?v[d]="sfx_big":v.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
v[d]){v.splice(d,1);break}if(!R.e.Lk)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("sfx"===v[d][g]){!1!==R.u.Qf&&R.e.Kk?v[d]="music_big":v.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===v[d]){v.splice(d,1);break}if(1===R.m.jv().length)for(d=0;d<v.length;d++)if("language"===v[d]){v.splice(d,1);break}h=this.cc.default_text.s.height;k=this.a.Xj;a=R.b.g(this.a.Wj,this.canvas.width,k)-a;n=R.b.g(this.a.ki,this.c.f.height,h*v.length+this.a.qd*(v.length-1))-b+-1*R.ia;
for(d=0;d<v.length;d++){l=a;q=k;if("string"===typeof v[d])this.ai(v[d],l,n,q,c);else for(b=v[d],q=(k-(b.length-1)*this.a.qd)/b.length,g=0;g<b.length;g++)this.ai(b[g],l,n,q,c),l+=q+this.a.qd;n+=h+this.a.qd}};e.yt=function(a){var b=!0;"off"===a?(b=!1,R.Ca.Ya("off","options:music")):R.Ca.Ya("on","options:music");R.e.Qf(b);return!0};e.zt=function(a){var b=!0;"off"===a?(b=!1,R.Ca.Ya("off","options:sfx")):R.Ca.Ya("on","options:sfx");R.e.ll(b);return!0};
e.xt=function(a){R.m.Es(a);R.Ca.Ya(a,"options:language");return!0};
e.gj=function(){function a(){l.wc+=1;l.gj();return!0}function b(){l.wc-=1;l.gj();return!0}function c(){var a;l.Ga(n,q);l.pf.Za=!0;for(a=0;a<l.buttons.length;a++)N(K,l.buttons[a]);l.buttons=[];l.jf(n,q,!0)}var d,g,h,k,l=this,n=R.b.g(l.a.Yb,l.canvas.width,l.a.backgroundImage.width),q=R.b.g(l.a.Zb,l.canvas.height,l.a.backgroundImage.height)+-1*R.ia;void 0===l.wc&&(l.wc=0);l.tj=void 0!==R.k.dr?R.k.dr():[];R.Ca.Ya((10>l.wc?"0":"")+l.wc,"options:tutorial");for(d=0;d<l.buttons.length;d++)N(K,l.buttons[d]);
l.buttons=[];this.Xc?(z(l.c.f),w.clear(),l.pf.Za=!1):l.Ga(n,q);z(l.c.f);void 0!==l.a.md&&(d=R.b.g(l.a.Ml,l.c.f.width,l.a.md.width),g=R.b.g(l.a.Ze,l.c.f.height,l.a.md.height),l.a.md.r(0,d,g));k=l.tj[l.wc].title;void 0!==k&&""!==k&&(h=Y.M(),l.a.Ql&&C(h,l.a.Ql),d=Pa(h,k,l.a.Rl,l.a.mp,l.a.Rl),h.fontSize>d&&E(h,d),d=R.b.ta(l.a.Gt,l.c.f.width,h.ha(k,l.a.Rl),h.align),g=R.b.ta(l.a.Sl,l.c.f.height,h.U(k,l.a.mp),h.j),h.r(k,d,g));l.wc<l.tj.length&&(h=l.tj[l.wc].f,d=R.b.g(l.a.Et,l.c.f.width,h.width),g=R.b.g(l.a.Ol,
l.c.f.height,h.height),h.r(0,d,g),k=l.tj[l.wc].text,h=Y.M(),l.a.Nl&&C(h,l.a.Nl),d=Pa(h,k,l.a.uh,l.a.lp,l.a.uh),h.fontSize>d&&E(h,d),d=R.b.ta(l.a.Ft,l.c.f.width,h.ha(k,l.a.uh),h.align),g=R.b.ta(l.a.Pl,l.c.f.height,h.U(k,l.a.uh),h.j),h.r(k,d,g,l.a.uh));A(l.c.f);h=$d;d=R.b.g(l.a.Dt,l.canvas.width,h.width)-l.c.x;g=R.b.g(l.a.kp,l.canvas.height,h.height)-l.c.y-R.ia;0<=l.wc-1?l.buttons.push(new Bf(d,g,l.depth-20,new Tb(h),[h],{S:b,la:l},l.c)):(h=Yd,l.buttons.push(new Bf(d,g,l.depth-20,new Tb(h),[h],{S:c,
la:l},l.c)));h=Zd;d=R.b.g(this.a.Ct,l.canvas.width,h.width)-l.c.x;g=R.b.g(this.a.jp,l.canvas.height,h.height)-l.c.y-R.ia;l.wc+1<l.tj.length?l.buttons.push(new Bf(d,g,l.depth-20,new Tb(h),[h],{S:a,la:l},l.c)):(h=Yd,l.buttons.push(new Bf(d,g,l.depth-20,new Tb(h),[h],{S:c,la:l},l.c)));return!0};
e.rx=function(){function a(a,b,c,g,h,k){var l;l=Y.M();b&&C(l,b);b=Pa(l,a,h,k,h);l.fontSize>b&&E(l,b);c=R.b.ta(c,d.c.f.width,l.ha(a,h),l.align);g=R.b.ta(g,d.c.f.height,l.U(a,k),l.j);l.r(a,c,g,h);return g+k}function b(a,b,c){b=R.b.g(b,d.c.f.width,a.width);c=R.b.g(c,d.c.f.height,a.height);a.r(0,b,c);return c+a.height}var c,d=this,g=R.b.g(d.a.Yb,d.canvas.width,d.a.backgroundImage.width),h=R.b.g(d.a.Zb,d.canvas.height,d.a.backgroundImage.height)+-1*R.ia;R.Ca.Ya("about","options");for(c=0;c<d.buttons.length;c++)N(K,
d.buttons[c]);d.buttons=[];this.Xc?(z(d.c.f),w.clear(),d.pf.Za=!1):d.Ga(g,h);z(d.c.f);void 0!==d.a.md&&b(d.a.md,d.a.Ml,d.a.Ze);var k=null;"function"===typeof R.l.Bq?k=R.l.Bq(d.a,a,b,d.c.f):(c=R.m.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.Jj,d.a.Lj,d.a.og,d.a.Kj,d.a.jm),b(Wc,d.a.Yh,d.a.Zh),c=R.m.K("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.$h,d.a.qg,d.a.rg,d.a.hf,d.a.pg));a(R.m.K("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+Hf()+("big"===R.size?"b":"s"),d.a.km,d.a.Rp,
d.a.lm,d.a.Qp,d.a.Pp);A(d.c.f);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new Bf(l.x,l.y,d.depth-10,Rb(0,0,l.width,l.height),null,{S:function(a){return function(){R.l.dd(a)}}(l.url),Vb:!0},d.c))}else void 0!==R.u.or&&(c=R.b.g(d.a.Yh,d.c.f.width,Wc.width),k=R.b.g(d.a.Zh,d.c.f.height,Wc.height),c=Math.min(c,R.b.g(d.a.qg,d.c.f.width,d.a.hf)),k=Math.min(k,R.b.g(d.a.rg,d.c.f.height,d.a.pg)),l=Math.max(d.a.hf,Wc.width),d.buttons.push(new Bf(c,k,d.depth-10,Rb(0,0,l,R.b.g(d.a.rg,d.c.f.height,
d.a.pg)+d.a.pg-k),null,{S:function(){R.l.dd(R.u.or)},Vb:!0},d.c)));d.buttons.push(new Wf("default_text",R.b.g(d.a.im,d.c.f.width,d.a.Xh),d.a.Wh,d.depth-20,"optionsAbout_backBtn",d.a.Xh,{S:function(){var a;d.Ga(g,h);d.pf.Za=!0;for(a=0;a<d.buttons.length;a++)N(K,d.buttons[a]);d.buttons=[];d.jf(g,h,!0);d.Hs=!1},la:d},d.c));return this.Hs=!0};
function Hg(a){var b,c,d,g,h,k=R.b.g(a.a.Yb,a.canvas.width,a.a.backgroundImage.width),l=R.b.g(a.a.Zb,a.canvas.height,a.a.backgroundImage.height)+-1*R.ia;R.Ca.Ya("versions","options");for(b=0;b<a.buttons.length;b++)N(K,a.buttons[b]);a.buttons=[];a.Ga(k,l);z(a.c.f);void 0!==a.a.md&&a.a.md.r(0,R.b.g(a.a.Ml,a.c.width,a.a.md.width),R.b.g(a.a.Ze,a.c.height,a.a.md.height));h=Y.M();C(h,a.a.km);G(h,"left");c=a.a.tp;d=a.a.up;for(b in R.version)g=b+": "+R.version[b],h.r(g,c,d),d+=h.U(g)+a.a.Ot;c=R.b.g(a.a.im,
a.c.f.width,a.a.Xh);d=a.a.Wh;a.buttons.push(new Wf("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Xh,{S:function(){var b;a.Ga(k,l);for(b=0;b<a.buttons.length;b++)N(K,a.buttons[b]);a.buttons=[];a.jf(k,l,!0)},la:a},a.c))}e.tx=function(){return!0};e.ux=function(){R.Ca.Ya("moreGames","options");var a=Gg();"function"===typeof a&&a();return!0};
e.ex=function(){var a=this;Ig(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){R.Ca.Ya("confirm_yes","options:quit");N(K,a);If(R.Ca,R.e.eg,Jg(R.e),"progression:levelQuit:"+Kg());Lg();Mg(R.e);return!0})};
e.jx=function(){var a=this;Ig(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){R.Ca.Ya("confirm_yes","options:restart");N(K,a);var b=R.e;b.state="LEVEL_END";If(R.Ca,R.e.eg,Jg(R.e),"progression:levelRestart:"+Kg());b=R.n.vj?b.sb+1:cg(b)+1;R.e.na=!0;R.e.Cr="retry";Ng(R.e,!0);b={failed:!0,level:b,restart:!0};R.l.Rg(b);R.od.Rg(b);return!0})};
e.Bi=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";Og(b,R.m.K(d,"<"+d.toUpperCase()+">"));a&&(b.pf.Za=!1,b.xl||wg())};Ig(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){R.e.Bi(a);return!0})};
e.mi=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";Og(b,R.m.K(d,"<"+d.toUpperCase()+">"));a&&(b.pf.Za=!1,b.xl||wg())};Ig(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){R.e.mi(a);return!0})};
function Ig(a,b,c,d,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)N(K,a.buttons[h]);a.buttons=[];b=R.m.K(b,"<"+b.toUpperCase()+">");h=Y.M();a.a.sq?C(h,a.a.sq):a.a.pl&&C(h,a.a.pl);k=Pa(h,b,a.a.ak,a.a.Jm,!0);k<h.fontSize&&E(h,k);n=h.ha(b,a.a.ak)+10;l=h.U(b,a.a.ak)+10;k=R.b.ta(a.a.tq,a.c.f.width,n,h.align);l=R.b.ta(a.a.Km,a.c.f.height,l,h.j);z(a.c.f);h.r(b,k,l,n);A(a.c.f);k=R.b.g(a.a.qq,a.canvas.width,a.a.pi)-a.c.x;l=R.b.g(a.a.Hm,a.canvas.height,a.cc.default_text.s.height)-a.c.y-R.ia;a.buttons.push(new Wf("default_text",
k,l,a.depth-20,d,a.a.pi,{S:function(){var b,c,d;c=R.b.g(a.a.Yb,a.canvas.width,a.a.backgroundImage.width);d=R.b.g(a.a.Zb,a.canvas.height,a.a.backgroundImage.height)+-1*R.ia;a.Ga(c,d);for(b=0;b<a.buttons.length;b++)N(K,a.buttons[b]);a.buttons=[];a.jf(c,d,!0);return!0},la:a},a.c));k=R.b.g(a.a.rq,a.canvas.width,a.a.pi)-a.c.x;l=R.b.g(a.a.Im,a.canvas.height,a.cc.default_text.s.height)-a.c.y-R.ia;a.buttons.push(new Wf("default_text",k,l,a.depth-20,c,a.a.pi,{S:function(){return"function"===typeof g?g():!0},
la:a},a.c))}function Og(a,b){var c,d,g,h;for(c=0;c<a.buttons.length;c++)N(K,a.buttons[c]);a.buttons=[];d=R.b.g(a.a.Yb,a.canvas.width,a.a.backgroundImage.width);g=R.b.g(a.a.Zb,a.canvas.height,a.a.backgroundImage.height)+-1*R.ia;a.Ga(d,g);c=Y.M();a.a.lo&&C(c,a.a.lo);d=Pa(c,b,a.a.mo,a.a.tw,!0);d<c.fontSize&&E(c,d);h=c.ha(b,a.a.mo)+10;g=c.U(b,a.a.mo)+10;d=R.b.ta(a.a.uw,a.c.f.width,h,c.align);g=R.b.ta(a.a.vw,a.c.f.height,g,c.j);z(a.c.f);c.r(b,d,g,h);A(a.c.f)}
e.wx=function(){R.Ca.Ya("startScreen","options");Mg(R.e);return!0};e.close=function(){N(K,this);return this.canvas.W=!0};
e.nc=function(){var a,b;this.xl&&wg(this);R.e.Jd=this;this.Qq=this.Pq=!1;a=this.a.backgroundImage;this.c=new xg(this.depth-10,this.ma,new y(a.width,a.height));this.c.x=R.b.g(this.a.Yb,this.canvas.width,a.width);a=R.b.g(this.a.Zb,this.canvas.height,a.height)+-1*R.ia;this.c.y=a;this.Ga(this.c.x,this.c.y);this.buttons=[];this.py?this.gj():this.jf(this.c.x,this.c.y);this.pf=new Bf(this.a.rf,this.a.xe,this.depth-20,new Rb(0,0,this.a.Ag,this.a.qf),void 0,{S:this.close,la:this},this.c);this.yh="versions";
this.kf=new Wb;R.b.Na(this.kf,R.dc);Lb(this.kf,this.depth-1);Xb(this.kf,"keyAreaLeft",this.c.x,this.c.y+this.a.Ze,this.a.sg,this.a.Mj,76);Xb(this.kf,"keyAreaRight",this.c.x+this.c.width-this.a.sg,this.c.y+this.a.Ze,this.a.sg,this.a.Mj,82);Xb(this.kf,"keyAreaCentre",R.aw/2-this.a.sg/2,this.c.y+this.a.Ze,this.a.sg,this.a.Mj,67);b=this;this.c.y="inGame"!==this.type?this.canvas.height:-this.c.f.height;Bg(this.c,"y",a,this.a.bl,this.a.cl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Za=
!0})};e.fc=function(){var a;this.xl&&Cg();this.Pq&&na(R.Jf,R.m.Cn());this.Qq&&na(R.Ne);for(a=0;a<this.buttons.length;a++)N(K,this.buttons[a]);this.kf.clear();N(K,this.kf);N(K,this.pf);N(K,this.c);R.e.Jd=null};e.Kb=function(){return!0};e.yb=function(){return!0};e.Qg=function(a){this.Hs&&(67===a?this.yh="":76===a?this.yh+="l":82===a&&(this.yh+="r"),"lrl"===this.yh&&Hg(this))};e.bd=function(a){a===R.Jf?(this.Ga(this.c.x,this.c.y),this.Pq=!0):a===R.Ne?this.Qq=!0:a===R.nu&&this.close()};
function Pg(){this.depth=-200;this.i=this.visible=!0;R.b.Na(this,R.Af);var a;this.a=R.a.t.kn;if("landscape"===R.orientation&&R.a.t.ln)for(a in R.a.t.ln)this.a[a]=R.a.t.ln[a];this.cc=R.a.t.Sb;for(a in R.a.O.kn)this.a[a]=R.a.O.kn[a];M(this)}
Pg.prototype.Ga=function(){var a,b,c,d;c=this.a.backgroundImage;d=(R.Yv-Math.abs(R.ia))/c.Bg;this.c.f=new y(d*c.oi,d*c.Bg);z(this.c.f);this.c.y=Math.abs(R.ia);a=w.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,va(c,0,0),a.restore());c=Y.M();C(c,this.a.font);d=R.m.K("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Pa(c,d,this.a.Gl-(c.stroke?c.$b:0),this.a.$x-(c.stroke?c.$b:0),!0);a<c.fontSize&&E(c,a);a=R.b.ta(this.a.qt,this.canvas.width,
c.ha(d),c.align);b=R.b.ta(this.a.rt,this.canvas.height,c.U(d),c.j);c.r(d,a,b,this.a.Gl);A(this.c.f);this.c.canvas.W=!0};Pg.prototype.nc=function(){var a=this,b=this.a.backgroundImage,b=new y(b.width,b.height);this.c=new xg(this.depth,R.dc,b);this.c.x=0;this.c.y=Math.abs(R.ia);this.Ga();this.button=new Wf(this.a.jq,R.b.g(this.a.zu,this.canvas.width,this.a.kq),R.b.g(this.a.lq,this.canvas.height,this.cc[this.a.jq].s.height),this.depth-10,"gameEndScreenBtnText",this.a.kq,function(){N(K,a);Mg(R.e)},this.c)};
Pg.prototype.fc=function(){N(K,this.c);N(K,this.button)};Pg.prototype.bd=function(a){a!==R.Jf&&a!==R.Ne||this.Ga()};
function Bf(a,b,c,d,g,h,k){function l(a,b,c){var d,g;g=R.b.yn(q.canvas);a=Math.round(q.x+q.parent.x-q.ed*q.Ba);d=Math.round(q.y+q.parent.y-q.fd*q.Da);if(q.images&&0<q.Gf||0<q.nj)q.Gf=0,q.nj=0,q.canvas.W=!0;if(q.bj&&q.Za&&Ub(q.Nc,a,d,b-g.x,c-g.y))return q.bj=!1,void 0!==q.la?q.al.call(q.la,q):q.al(q)}function n(a,b,c){var d,g,h;h=R.b.yn(q.canvas);d=Math.round(q.x+q.parent.x-q.ed*q.Ba);g=Math.round(q.y+q.parent.y-q.fd*q.Da);if(q.Za&&Ub(q.Nc,d,g,b-h.x,c-h.y))return q.bj=!0,q.images&&(1<q.images.length?
(q.Gf=1,q.canvas.W=!0):1<q.images[0].L&&(q.nj=1,q.canvas.W=!0)),void 0!==typeof bf&&I.play(bf),q.xf=a,!0}this.depth=c;this.i=this.visible=!0;this.group="TG_Token";R.b.Na(this,R.dc);this.fd=this.ed=0;this.x=a;this.y=b;this.width=g?g[0].width:d.cb-d.Ea;this.height=g?g[0].height:d.wb-d.Ta;this.alpha=this.Da=this.Ba=1;this.Sa=0;this.Nc=d;this.images=g;this.nj=this.Gf=0;this.bj=!1;this.Za=!0;this.parent=void 0!==k?k:{x:0,y:0};this.tl=this.sl=0;this.Kc=!0;this.al=function(){};this.Vb=!1;"object"===typeof h?
(this.al=h.S,this.la=h.la,this.Vb=h.Vb):"function"===typeof h&&(this.al=h);var q=this;this.Vb?(this.Og=n,this.Pg=l):(this.yb=n,this.Kb=l);M(this)}function Vf(a,b,c,d,g,h){void 0===a.ue&&(a.ue=[]);a.ue.push({type:b,start:d,Ec:g,Wa:c,duration:h,p:0})}
function $f(a){var b,c;if(void 0!==a.ue){for(b=0;b<a.ue.length;b++)if(c=a.ue[b],c.i){switch(c.type){case "xScale":a.Ba=c.start+c.Ec;break;case "yScale":a.Da=c.start+c.Ec;break;case "alpha":a.alpha=c.start+c.Ec;break;case "angle":a.Sa=c.start+c.Ec;break;case "x":a.x=c.start+c.Ec;break;case "y":a.y=c.start+c.Ec}c.i=!1}a.canvas.W=!0}}function gg(a,b){a.images=b;a.canvas.W=!0}e=Bf.prototype;e.No=function(a){this.visible=this.i=a};e.fc=function(){this.images&&(this.canvas.W=!0)};
e.va=function(a){var b,c;if(void 0!==this.ue){for(b=0;b<this.ue.length;b++)switch(c=this.ue[b],c.p+=a,c.type){case "xScale":var d=this.Ba,g=this.sl;this.Ba=c.Wa(c.p,c.start,c.Ec,c.duration);this.sl=-(this.images[0].width*this.Ba-this.images[0].width*c.start)/2;if(isNaN(this.Ba)||isNaN(this.sl))this.Ba=d,this.sl=g;break;case "yScale":d=this.Da;g=this.tl;this.Da=c.Wa(c.p,c.start,c.Ec,c.duration);this.tl=-(this.images[0].height*this.Da-this.images[0].height*c.start)/2;if(isNaN(this.Da)||isNaN(this.tl))this.Da=
d,this.tl=g;break;case "alpha":this.alpha=c.Wa(c.p,c.start,c.Ec,c.duration);break;case "angle":this.Sa=c.Wa(c.p,c.start,c.Ec,c.duration);break;case "x":d=this.x;this.x=c.Wa(c.p,c.start,c.Ec,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.Wa(c.p,c.start,c.Ec,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.W=!0}};
e.Lc=function(){var a,b,c;c=R.b.yn(this.canvas);a=Math.round(this.x+this.parent.x-this.ed*this.Ba);b=Math.round(this.y+this.parent.y-this.fd*this.Da);this.bj&&!Ub(this.Nc,a,b,Bb(this.xf)-c.x,K.ra[this.xf].y-c.y)&&(this.images&&(this.nj=this.Gf=0,this.canvas.W=!0),this.bj=!1)};
e.Ma=function(){var a,b;a=Math.round(this.x+this.parent.x-this.ed*this.Ba);b=Math.round(this.y+this.parent.y-this.fd*this.Da);this.images&&(this.images[this.Gf]instanceof y?this.images[this.Gf].V(a,b,this.Ba,this.Da,this.Sa,this.alpha):this.images[this.Gf].V(this.nj,a,b,this.Ba,this.Da,this.Sa,this.alpha));this.Kc=!1};
function Wf(a,b,c,d,g,h,k,l){this.Z=R.a.t.Sb[a];a=void 0!==R.a.O.buttons?R.a.t.Vj[R.a.O.buttons[a]||R.a.O.buttons.default_color]:R.a.t.Vj[R.a.t.buttons.default_color];this.font=Y.M();a.font&&C(this.font,a.font);this.Z.fontSize&&E(this.font,this.Z.fontSize);this.N=g;this.text=R.m.K(this.N,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.Z.s.height;this.f={source:this.Z.s,wa:this.Z.wa,nb:this.Z.nb};g=this.Ld(this.f);h=new Rb(0,0,g[0].width,g[0].height);Bf.call(this,b,c,d,h,g,k,l)}
R.b.Oi(Wf);e=Wf.prototype;e.rl=function(a){this.text=R.m.K(this.N,"<"+this.N.toUpperCase()+">");a&&C(this.font,a);gg(this,this.Ld(this.f))};e.op=function(a,b){this.N=a;this.rl(b)};e.uj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof x?this.f.source=a:void 0!==a.wa&&void 0!==a.nb&&void 0!==a.source&&(this.f=a);gg(this,this.Ld(this.f))};
e.Ld=function(a){var b,c,d,g,h,k,l=a.wa+a.nb;d=this.height-(this.Z.Tc||0);var n=a.source;c=this.font.ha(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Pa(this.font,this.text,b,d,!0);c<this.Z.fontSize?E(this.font,c):E(this.font,this.Z.fontSize);c=a.wa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.Z.Sc&&(d+=this.Z.Sc);h=[];for(g=0;g<n.L;g++)k=new y(b+l,this.height),z(k),n.ua(g,0,0,a.wa,this.height,0,0,1),n.ek(g,a.wa,0,n.width-l,this.height,a.wa,0,b,this.height,1),n.ua(g,a.wa+n.width-l,0,a.nb,this.height,a.wa+b,0,1),this.font.r(this.text,c,d,b),A(k),h.push(k);return h};e.bd=function(a){a===R.Jf&&this.rl()};
function Eg(a,b,c,d,g,h,k,l){this.Z=R.a.t.Sb[a];void 0!==h&&(this.width=h);this.height=this.Z.s.height;this.pd={source:this.Z.s,wa:this.Z.wa,nb:this.Z.nb};this.f=g;a=this.Ld();g=new Rb(0,0,a[0].width,a[0].height);Bf.call(this,b,c,d,g,a,k,l)}R.b.Oi(Eg);
Eg.prototype.Ld=function(){var a,b,c,d,g,h,k,l=this.pd.wa+this.pd.nb;b=this.height-(this.Z.Tc||0);var n=this.pd.source;void 0===this.width?a=this.f.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.f.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.f.width))));k=Math.min(a/this.f.width,b/this.f.height);k=Math.min(k,1);g=Math.round(this.pd.wa+
(a-this.f.width*k)/2);h=Math.round((b-this.f.height*k)/2);c=[];for(b=0;b<n.L;b++){d=new y(a+l,this.height);z(d);n.ua(b,0,0,this.pd.wa,this.height,0,0,1);n.ek(b,this.pd.wa,0,n.width-l,this.height,this.pd.wa,0,a,this.height,1);n.ua(b,this.pd.wa+n.width-l,0,this.pd.nb,this.height,this.pd.wa+a,0,1);try{w.context.drawImage(this.f,g,h,this.f.width*k,this.f.height*k)}catch(q){}A(d);c.push(d)}return c};R.b.Oi(function(a,b,c,d,g,h,k){Bf.call(this,a,b,c,g,d,h,k)});
function Sf(a,b,c,d,g,h,k,l){var n;this.Z=R.a.t.Sb[a];a=void 0!==R.a.O.buttons?R.a.t.Vj[R.a.O.buttons[a]||R.a.O.buttons.default_color]:R.a.t.Vj[R.a.t.buttons.default_color];this.font=Y.M();a.font&&C(this.font,a.font);this.Z.fontSize&&E(this.font,this.Z.fontSize);void 0!==h&&(this.width=h);this.height=this.Z.s.height;this.R=this.Z.R;if(this.R.length){for(h=0;h<this.R.length;h++)if(this.R[h].id===g){this.Fa=h;break}void 0===this.Fa&&(this.Fa=0);this.text=R.m.K(this.R[this.Fa].N,"<"+this.R[this.Fa].id.toUpperCase()+
">");this.gg=this.R[this.Fa].s;h=this.Ld();a=new Rb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Vf();return k(n.R[n.Fa].id)}:"object"===typeof k?(g={},g.Vb=k.Vb,g.la=this,g.S=function(){n.Vf();return k.S.call(k.la,n.R[n.Fa].id)}):g=function(){n.Vf()};Bf.call(this,b,c,d,a,h,g,l)}}R.b.Oi(Sf);e=Sf.prototype;
e.Vf=function(a){var b;if(void 0===a)this.Fa=(this.Fa+1)%this.R.length;else for(b=0;b<this.R.length;b++)if(this.R[b].id===a){this.Fa=b;break}this.uj(this.R[this.Fa].s,R.m.K(this.R[this.Fa].N,"<"+this.R[this.Fa].id.toUpperCase()+">"))};e.rl=function(a){a&&C(this.font,a);this.text=R.m.K(this.R[this.Fa].N,"<"+this.R[this.Fa].id.toUpperCase()+">");gg(this,this.Ld())};e.uj=function(a,b,c){this.text=b;this.gg=a;c&&C(this.font,c);gg(this,this.Ld())};
e.Ld=function(){var a,b,c,d,g,h,k=this.Z.wa,l=this.Z.nb,n=k+l;g=Math.abs(k-l);d=this.height-(this.Z.Tc||0);var q=this.Z.s,v=this.font.M();b=v.ha(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Pa(v,this.text,a,d,!0);d<v.fontSize&&E(v,d);b=v.ha(this.text,
a);d=k;c=v.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.Z.bg+Math.round(b/2)):"left"===c?d+=this.Z.bg:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.Z.Sc&&(g+=this.Z.Sc);c=[];for(b=0;b<q.L;b++)h=new y(a+n,this.height),z(h),q.ua(b,0,0,k,this.height,0,0,1),q.ek(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.ua(b,k+q.width-n,0,l,this.height,k+a,0,1),this.gg.r(0,this.Z.qh,this.Z.rh),v.r(this.text,d,g,a),A(h),c.push(h);return c};e.bd=function(a){a===R.Jf&&this.rl()};
function Fg(a,b,c,d,g,h,k){var l;this.R=R.a.t.Sb[a].R;if(this.R.length){for(a=0;a<this.R.length;a++)if(this.R[a].id===g){this.Fa=a;break}void 0===this.Fa&&(this.Fa=0);this.gg=this.R[this.Fa].s;a=new Tb(this.gg);l=this;g="function"===typeof h?function(){l.Vf();return h(l.R[l.Fa].id)}:"object"===typeof h?{la:this,S:function(){l.Vf();return h.S.call(h.la,l.R[l.Fa].id)}}:function(){l.Vf()};Bf.call(this,b,c,d,a,[this.gg],g,k)}}R.b.Oi(Fg);
Fg.prototype.Vf=function(a){var b;if(void 0===a)this.Fa=(this.Fa+1)%this.R.length;else for(b=0;b<this.R.length;b++)if(this.R[b].id===a){this.Fa=b;break}this.uj(this.R[this.Fa].s)};Fg.prototype.uj=function(a){this.gg=a;gg(this,[].concat(this.gg))};
function Qg(a,b,c,d){this.depth=10;this.visible=!1;this.i=!0;R.b.Na(this,R.dc);var g;this.a=R.a.t.Jk;if("landscape"===R.orientation&&R.a.t.Xn)for(g in R.a.t.Xn)this.a[g]=R.a.t.Xn[g];for(g in R.a.O.Jk)this.a[g]=R.a.O.Jk[g];this.Pn=a;this.qm=b;this.S=c;this.la=d;this.Yi="entering";this.At=!1;M(this,!1);Mb(this,"LevelStartDialog")}
function Rg(a){var b,c,d,g,h;if("leaving"!==a.Yi){a.Yi="leaving";a.mf=0;b=function(){N(K,a);a.la?a.S.call(a.la):a.S&&a.S()};if(void 0!==a.a.vo)for(c=0;c<a.a.vo.length;c++)d=a.a.vo[c],g=void 0,d.gq&&(a.mf++,g=b),h=d.end,"x"===d.type?h=R.b.g(h,a.canvas.width,a.c.f.width):"y"===d.type&&(h=R.b.g(h,a.canvas.height,a.c.f.height)+Math.abs(R.ia)),Bg(a.c,d.type,h,d.duration,d.Wa,g,d.aa,d.loop,d.eo);0===a.mf&&b()}}e=Qg.prototype;
e.nc=function(){var a,b,c,d,g,h,k=this;a=this.a.Oc;b=a.width;g=a.height;this.c=new xg(this.depth+10,this.ma,new y(b,g));z(this.c.f);a.r(0,0,0);""!==this.qm&&(c=R.b.g(this.a.lu,b,0),d=R.b.g(this.a.Xp,g,0),a=Y.M(),C(a,this.a.Wp),void 0!==this.a.ei&&void 0!==this.a.pm&&(h=Pa(a,this.qm,this.a.ei,this.a.pm,this.a.ei),a.fontSize>h&&E(a,h)),a.r(this.qm,c,d,this.a.ei));""!==this.Pn&&(c=R.b.g(this.a.wv,b,0),d=R.b.g(this.a.jr,g,0),a=Y.M(),C(a,this.a.ir),void 0!==this.a.Li&&void 0!==this.a.On&&(h=Pa(a,this.Pn,
this.a.Li,this.a.On,this.a.Li),a.fontSize>h&&E(a,h)),a.r(this.Pn,c,d,this.a.Li));A(this.c.f);this.c.x=R.b.g(this.a.ms,this.canvas.width,b);this.c.y=R.b.g(this.a.ns,this.canvas.height,g)+Math.abs(R.ia);this.mf=0;a=function(){k.mf--;0===k.mf&&(k.Yi="paused")};if(void 0!==this.a.Wi)for(b=0;b<this.a.Wi.length;b++)g=this.a.Wi[b],c=void 0,g.gq&&(this.mf++,c=a),d=g.end,"x"===g.type?d=R.b.g(d,this.canvas.width,this.c.f.width):"y"===g.type&&(d=R.b.g(d,this.canvas.height,this.c.f.height)+Math.abs(R.ia)),Bg(this.c,
g.type,d,g.duration,g.Wa,c,g.aa,g.loop,g.eo),void 0!==g.Nb&&I.play(g.Nb);0===this.mf&&(this.Yi="paused");this.p=0};e.fc=function(){N(K,this.c)};e.va=function(a){"paused"!==this.state&&(this.p+=a,this.p>=this.a.rs&&Rg(this))};e.yb=function(){return this.At=!0};e.Kb=function(){this.At&&"paused"===this.Yi&&Rg(this);return!0};
function xg(a,b,c){this.depth=a;this.i=this.visible=!0;R.b.Na(this,b);this.f=c;this.qb=0;this.width=c.width;this.height=c.height;this.fd=this.ed=this.y=this.x=0;this.Da=this.Ba=1;this.Sa=0;this.alpha=1;this.rb=[];this.Up=0;this.parent={x:0,y:0};this.Kc=!0;M(this,!1)}
function Bg(a,b,c,d,g,h,k,l,n){var q,v=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.Ba;break;case "yScale":q=a.Da;break;case "scale":b="xScale";q=a.Ba;Bg(a,"yScale",c,d,g,void 0,k,l,n);break;case "angle":q=a.Sa;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.rb.push({id:a.Up,p:0,i:!0,ck:v,type:b,start:q,end:c,Gb:h,duration:d,Wa:g,aa:k,loop:l,eo:n});a.Up++}
function lg(a){var b;for(b=a.rb.length-1;0<=b;b--){switch(a.rb[b].type){case "x":a.x=a.rb[b].end;break;case "y":a.y=a.rb[b].end;break;case "xScale":a.Ba=a.rb[b].end;break;case "yScale":a.Da=a.rb[b].end;break;case "angle":a.Sa=a.rb[b].end;break;case "alpha":a.alpha=a.rb[b].end;break;case "subImage":a.qb=a.rb[b].end}"function"===typeof a.rb[b].Gb&&a.rb[b].Gb.call(a)}}
xg.prototype.va=function(a){var b,c,d;for(b=0;b<this.rb.length;b++)if(c=this.rb[b],c.i&&(c.p+=a,c.ck&&c.p>=c.aa&&(c.p%=c.aa,c.ck=!1),!c.ck)){c.p>=c.duration?(d=c.end,c.loop?(c.ck=!0,c.aa=c.eo,c.p%=c.duration):("function"===typeof c.Gb&&c.Gb.call(this),this.rb[b]=void 0)):"subImage"===c.type?(d=this.f instanceof Array?this.f.length:this.f.L,d=Math.floor(c.p*d/c.duration)):d=c.Wa(c.p,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.Ba=
d;break;case "yScale":this.Da=d;break;case "angle":this.Sa=d;break;case "alpha":this.alpha=d;break;case "subImage":this.qb=d}this.canvas.W=!0}for(b=this.rb.length-1;0<=b;b--)void 0===this.rb[b]&&this.rb.splice(b,1)};
xg.prototype.Ma=function(){var a,b,c;b=Math.round(this.x-this.Ba*this.ed)+this.parent.x;c=Math.round(this.y-this.Da*this.fd)+this.parent.y;a=this.f;a instanceof Array&&(a=this.f[this.qb%this.f.length]);a instanceof y?a.V(b,c,this.Ba,this.Da,this.Sa,this.alpha):a.V(this.qb,b,c,this.Ba,this.Da,this.Sa,this.alpha);this.Kc=!1};
function qg(a,b,c,d,g,h,k,l,n,q,v){this.depth=g;this.visible=!0;this.i=!1;R.b.Na(this,R.dc);this.x=a;this.y=b;this.ho=l;this.io="object"===typeof n?n.top:n;this.bw="object"===typeof n?n.bottom:n;this.ha=c;this.U=d;this.width=this.ha+2*this.ho;this.height=this.U+this.io+this.bw;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof v?v:function(a){return a+""};this.alpha=1;this.Uf=this.Tf=this.fd=this.ed=0;c=new y(this.width,this.height);this.ug=new xg(this.depth,this.ma,
c);this.ug.x=a-this.ho;this.ug.y=b-this.io;this.ug.parent=q;this.Oa=this.ug.f;this.Me();M(this)}qg.prototype.fc=function(){N(K,this.ug)};function Ag(a,b,c){a.i=!0;a.wm=a.value;a.value=a.wm;a.end=b;a.duration=c;a.Wa=O;a.p=0}
qg.prototype.Me=function(){var a,b;a=this.font.align;b=this.font.j;var c=this.ho,d=this.io;this.aq||(this.Oa.clear(),this.canvas.W=!0);z(this.Oa);this.aq&&this.aq.ua(0,this.Fy,this.Gy,this.Ey,this.Dy,0,0,1);"center"===a?c+=Math.round(this.ha/2):"right"===a&&(c+=this.ha);"middle"===b?d+=Math.round(this.U/2):"bottom"===b&&(d+=this.U);b=this.toString(this.value);a=Pa(this.font,b,this.ha,this.U,!0);a<this.font.fontSize&&E(this.font,a);this.font.r(b,c,d,this.ha);A(this.Oa);this.ug.Kc=!0};
qg.prototype.va=function(a){var b;b=Math.round(this.Wa(this.p,this.wm,this.end-this.wm,this.duration));this.p>=this.duration?(this.value=this.end,this.i=!1,this.Me()):b!==this.value&&(this.value=b,this.Me());this.p+=a};function Sg(a,b,c){this.depth=-100;this.visible=!1;this.i=!0;this.Yw=a;R.b.Na(this,R.dc);this.a=R.a.t.Pm;this.cc=R.a.t.Sb;this.mq=b;for(var d in R.a.O.Pm)this.a[d]=R.a.O.Pm[d];this.wo=!1!==c;M(this)}e=Sg.prototype;e.xt=function(){};
e.ai=function(a,b,c,d,g){b=new Wf("default_text",b,c,this.depth-20,a.N||"NO_TEXT_KEY_GIVEN",d,{S:function(){a.S&&(a.la?a.S.call(a.la,a):a.S(a))},la:this},this.c);this.buttons.push(b);a.text&&b.uj(b.f,a.text);this.buttons[this.buttons.length-1].Za=g||!1};
e.Ga=function(a,b,c){z(this.c.f);w.clear();this.a.backgroundImage.r(0,0,0);a=c?c:this.Yw;b=Y.M();this.a.ys&&C(b,this.a.ys);c=Pa(b,a,this.a.Co,this.a.Bo,!0);c<b.fontSize&&E(b,c);c=b.ha(a,this.a.Co)+10;var d=b.U(a,this.a.Bo)+10;b.r(a,R.b.ta(this.a.cx,this.c.f.width,c,b.align),R.b.ta(this.a.dx,this.c.f.height-Tg(this),d,b.j),c);A(this.c.f)};function Tg(a){var b=a.mq;return R.b.g(a.a.ki,a.c.f.height,a.cc.default_text.s.height*b.length+a.a.qd*(b.length-1))}
e.jf=function(a,b){var c,d,g,h,k,l,n,q,v,D=[],D=this.mq;g=this.cc.default_text.s.height;h=this.a.Xj;k=R.b.g(this.a.Wj,this.canvas.width,h)-a;q=Tg(this);for(c=D.length-1;0<=c;c--){n=k;v=h;if("object"===typeof D[c]&&D[c].hasOwnProperty("length")&&D[c].length)for(l=D[c],v=(h-(l.length-1)*this.a.qd)/l.length,d=0;d<l.length;d++)this.ai(l[d],n,q,v,b),n+=v+this.a.qd;else this.ai(D[c],n,q,v,b);q-=g+this.a.qd}};
e.Rn=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.No(!1);this.c.visible=!1};e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.No(!0);this.c.visible=!0};e.close=function(){N(K,this);return this.canvas.W=!0};function Ug(a){var b=R.e.se;b.Ga(b.c.x,b.c.y,a);for(a=0;a<b.buttons.length;a++)N(K,b.buttons[a]);b.canvas.W=!0}
e.nc=function(){var a,b;this.wo&&wg(this);a=this.a.backgroundImage;this.c=new xg(this.depth-10,this.ma,new y(a.width,a.height));this.c.x=R.b.g(this.a.Yb,this.canvas.width,a.width);a=R.b.g(this.a.Zb,this.canvas.height,a.height)+-1*("landscape"===R.orientation?R.a.t.Fm:R.a.t.Kd).Vk;this.c.y=a;this.Ga(this.c.x,this.c.y);this.buttons=[];this.jf(this.c.x);b=this;this.c.y=-this.c.f.height;Bg(this.c,"y",a,this.a.bl,this.a.cl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Za=!0})};
e.fc=function(){var a;this.wo&&Cg();for(a=0;a<this.buttons.length;a++)N(K,this.buttons[a]);N(K,this.c);R.e.Jd===this&&(R.e.Jd=null)};e.Kb=function(){return!0};e.yb=function(){return!0};
function Vg(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function Pf(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,l){a=k(a,k(k(c^(b|~d),g),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,l){a=k(a,k(k(b^c^d,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,l){a=k(a,k(k(b&d|c&~d,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,l){a=k(a,k(k(b&c|~b&d,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,v,D,F,r,s,t,u;a=Vg(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);r=1732584193;s=4023233417;t=2562383102;u=271733878;a=l.length;for(n=0;n<a;n+=16)q=r,v=s,D=t,F=u,r=h(r,s,t,u,l[n+
0],7,3614090360),u=h(u,r,s,t,l[n+1],12,3905402710),t=h(t,u,r,s,l[n+2],17,606105819),s=h(s,t,u,r,l[n+3],22,3250441966),r=h(r,s,t,u,l[n+4],7,4118548399),u=h(u,r,s,t,l[n+5],12,1200080426),t=h(t,u,r,s,l[n+6],17,2821735955),s=h(s,t,u,r,l[n+7],22,4249261313),r=h(r,s,t,u,l[n+8],7,1770035416),u=h(u,r,s,t,l[n+9],12,2336552879),t=h(t,u,r,s,l[n+10],17,4294925233),s=h(s,t,u,r,l[n+11],22,2304563134),r=h(r,s,t,u,l[n+12],7,1804603682),u=h(u,r,s,t,l[n+13],12,4254626195),t=h(t,u,r,s,l[n+14],17,2792965006),s=h(s,t,
u,r,l[n+15],22,1236535329),r=g(r,s,t,u,l[n+1],5,4129170786),u=g(u,r,s,t,l[n+6],9,3225465664),t=g(t,u,r,s,l[n+11],14,643717713),s=g(s,t,u,r,l[n+0],20,3921069994),r=g(r,s,t,u,l[n+5],5,3593408605),u=g(u,r,s,t,l[n+10],9,38016083),t=g(t,u,r,s,l[n+15],14,3634488961),s=g(s,t,u,r,l[n+4],20,3889429448),r=g(r,s,t,u,l[n+9],5,568446438),u=g(u,r,s,t,l[n+14],9,3275163606),t=g(t,u,r,s,l[n+3],14,4107603335),s=g(s,t,u,r,l[n+8],20,1163531501),r=g(r,s,t,u,l[n+13],5,2850285829),u=g(u,r,s,t,l[n+2],9,4243563512),t=g(t,
u,r,s,l[n+7],14,1735328473),s=g(s,t,u,r,l[n+12],20,2368359562),r=d(r,s,t,u,l[n+5],4,4294588738),u=d(u,r,s,t,l[n+8],11,2272392833),t=d(t,u,r,s,l[n+11],16,1839030562),s=d(s,t,u,r,l[n+14],23,4259657740),r=d(r,s,t,u,l[n+1],4,2763975236),u=d(u,r,s,t,l[n+4],11,1272893353),t=d(t,u,r,s,l[n+7],16,4139469664),s=d(s,t,u,r,l[n+10],23,3200236656),r=d(r,s,t,u,l[n+13],4,681279174),u=d(u,r,s,t,l[n+0],11,3936430074),t=d(t,u,r,s,l[n+3],16,3572445317),s=d(s,t,u,r,l[n+6],23,76029189),r=d(r,s,t,u,l[n+9],4,3654602809),
u=d(u,r,s,t,l[n+12],11,3873151461),t=d(t,u,r,s,l[n+15],16,530742520),s=d(s,t,u,r,l[n+2],23,3299628645),r=c(r,s,t,u,l[n+0],6,4096336452),u=c(u,r,s,t,l[n+7],10,1126891415),t=c(t,u,r,s,l[n+14],15,2878612391),s=c(s,t,u,r,l[n+5],21,4237533241),r=c(r,s,t,u,l[n+12],6,1700485571),u=c(u,r,s,t,l[n+3],10,2399980690),t=c(t,u,r,s,l[n+10],15,4293915773),s=c(s,t,u,r,l[n+1],21,2240044497),r=c(r,s,t,u,l[n+8],6,1873313359),u=c(u,r,s,t,l[n+15],10,4264355552),t=c(t,u,r,s,l[n+6],15,2734768916),s=c(s,t,u,r,l[n+13],21,
1309151649),r=c(r,s,t,u,l[n+4],6,4149444226),u=c(u,r,s,t,l[n+11],10,3174756917),t=c(t,u,r,s,l[n+2],15,718787259),s=c(s,t,u,r,l[n+9],21,3951481745),r=k(r,q),s=k(s,v),t=k(t,D),u=k(u,F);return(b(r)+b(s)+b(t)+b(u)).toLowerCase()}var yg;
function Wg(a,b){var c=R.u.Bk.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function Xg(a){Wg("call=api_is_valid",function(b){a(b.is_valid)})}
function zg(a,b){Wg("call=is_highscore&score="+a,function(a){0<=a.position?(yg=a.code,b(void 0!==yg)):b(!1)})}
TG_StatObjectFactory={Yy:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},Eu:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,Yg(),Yg(),!0)},Lm:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===R.n.Dg?function(a){return a+d}:function(a){return a-d})},Xy:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===R.n.Dg?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.Hc=d;this.Yf=void 0!==g?g:this.Hc;this.visible=void 0!==h?h:!0;this.te=void 0!==k?k:this.Hc!==this.Yf;this.$e=l;this.Dl=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return R.b.gp(1E3*a)}}};
TG_StatObject.prototype.M=function(){return new TG_StatObject(this.id,this.type,this.key,this.Hc,this.Yf,this.visible,this.te,this.$e,this.Dl)};R.version=R.version||{};R.version.tg="2.13.0";function Zg(a){this.depth=-99;R.b.Na(this,R.dc);this.i=!0;this.visible=!1;this.e=a;M(this)}Zg.prototype.Gi=function(){};Zg.prototype.Qg=function(){};Zg.prototype.yb=function(a,b,c){a:{var d=this.e,g;for(g=0;g<d.yc.length;++g)if(d.yc[g].yb&&d.yc[g].yb(a,b,c)){a=!0;break a}a=!1}return a};
Zg.prototype.Kb=function(a,b,c){var d;a:if(d=this.e,d.gb&&a===d.qp)a=d.gb.a.x,b=d.gb.a.y,d.gb.so&&(a=d.gb.so.x,b=d.gb.so.y),$g?console.log("Component:\n x: tgScale("+(a+d.gb.ig.x-ah)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.gb.ig.y-bh)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.gb.ig.x)+"),\n y: tgScale("+(b+d.gb.ig.y)+"),"),d.It=!1,d=!0;else{for(var g=0;g<d.yc.length;++g)if(d.yc[g].Kb&&d.yc[g].Kb(a,b,c)){d=!0;break a}d=!1}return d};
function ch(){this.ma=this.depth=0;this.Sm=this.Mb=this.i=this.visible=!1;this.yc=[];this.lk={};this.lk.be=!1;this.Jq={};this.paused=this.Jq.be=!1;this.Qx=new y(0,0);this.Sx=this.Rx=0;this.gb=null;this.qp=this.Kt=this.Jt=-1;this.It=!1;this.Bb=this.Ab=0;this.Ek=null}e=ch.prototype;e.nc=function(){this.Ek=new Zg(this)};e.fc=function(){this.Ek&&(N(K,this.Ek),this.Ek=null)};
function dh(a,b,c){for(var d in b){var g=b[d];g.f?c[d]=new eh(a,g):g.st?c[d]=new fh(a,R.m.K(g.st,"<"+g.st+">"),g):g.N?c[d]=new fh(a,R.m.K(g.N,"<"+g.N+">"),g):g.text&&(c[d]=new fh(a,g.text,g))}}function gh(a,b){a.be&&(a.p+=b,a.p>=a.duration&&(a.be=!1,a.Gb&&a.Gb()))}
e.va=function(a){gh(this.lk,a);gh(this.Jq,a);for(var b=0;b<this.yc.length;++b)this.yc[b].va(a);if(this.gb&&this.It){a=Bb(this.qp);b=K.ra[this.qp].y;this.canvas===R.b.Ff(R.Be)&&this.gb.xk(this.Ab+R.Df,this.Bb+R.Ce);var c=a-this.Jt,d=b-this.Kt;this.gb.x+=c;this.gb.y+=d;this.gb.ig.x+=c;this.gb.ig.y+=d;this.Jt=a;this.Kt=b;this.Mb=!0}};e.Lc=function(){if(this.Mb){var a=R.b.Ff(R.Be);this.canvas!==a?this.canvas.W=this.Mb:(w.ob(a),this.Ma())}};
e.gk=function(a,b){for(var c=R.b.Ff(R.Be)===this.canvas,d=0;d<this.yc.length;++d){var g=this.yc[d];g.visible&&(c&&g.xk(a,b),g.Ma(a,b))}};e.Ma=function(){var a=0,b=0;R.b.Ff(R.vk)!==this.canvas&&(a=R.Df,b=R.Ce);this.paused?this.Qx.r(this.Rx+this.Ab+a,this.Sx+this.Bb+b):this.gk(this.Ab+a,this.Bb+b);this.Mb=!1};function hh(){this.Qn=[];this.Kq=[];this.Fs=null;this.sm=void 0;this.hn=!0}
function ih(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.cz){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof hh){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new hh,g.Qn=arguments[0],g.Kq=arguments[1],g.Fs=arguments[2];var h=null,k=null,l=null,h=g.Qn,k=g.Kq,l=g.Fs;this.fh=g;void 0===this.fh.sm&&(this.fh.sm=!Rf(R.e));ch.apply(this,arguments);M(this);this.i=this.visible=!0;k=k||[];h=h||[];this.fp=2;this.qx=!1;this.o=l||jh;this.xq=R.vk;void 0!==this.o.ma&&(this.xq=this.o.ma);R.b.Na(this,this.xq);this.Cj=this.Bj=0;this.o.background.pr&&(this.Bj=this.o.background.pr);this.o.background.qr&&(this.Cj=this.o.background.qr);this.o.background.elements||
(this.Uc=this.o.background.f);this.o.background.qu?(dh(this,this.o.background.elements,{}),this.Uc=this.o.background.f):(g=this.o.background.f,l=new ch,dh(l,this.o.background.elements,[]),g||this.ma!==R.Be?(this.Uc=new y(g.width,g.height),z(this.Uc),g.r(0,0,0),l.gk(-this.Bj,-this.Cj),A(this.Uc)):(w.ob(R.b.Ff(this.ma)),l.Ma()));var n=this;this.ur=0;b("score",this.o.fa)?(this.Oe=new kh(this,this.o.fa,"SCORE",0,!0),this.o.lx&&new eh(this,this.o.lx)):this.Oe=new lh(0,0);this.Mi=b("highScore",this.o.kr)?
new kh(this,this.o.kr,"HIGHSCORE",0,!1):new lh(0,0);b("highScore",this.o.nr)&&new eh(this,this.o.nr);b(["stage","level"],this.o.zx)&&new kh(this,this.o.zx,"STAGE",0,!1);b("lives",this.o.Ov)&&new kh(this,this.o.Ov,"LIVES",0,!1);this.Il=b("time",this.o.time)?new kh(this,this.o.time,"TIME",0,!1,function(a){return n.gp(a)}):new lh(0,0);this.Il.Wf(36E4);if(this.o.gd&&this.o.xs)throw"Don't define both progress and progressFill in your game_ui settings";b("progress",this.o.gd)?this.o.gd.round?new mh(this,
this.o.gd):new nh(this,this.o.gd):b("progress",this.o.xs)&&new nh(this,this.o.xs);b("lives",this.o.xv)&&new eh(this,this.o.xv);b("difficulty",this.o.eb)?new fh(this,oh().toUpperCase(),this.o.eb):oh();b("difficulty",this.o.Gg)&&(g=dd,g=(this.o.Gg.images?this.o.Gg.images:[ed,dd,cd])[Tf()],this.o.Gg.f||(this.o.Gg.f=g),this.Nu=new eh(this,this.o.Gg),this.Nu.Ds(g));this.o.If&&!this.o.If.length&&(this.o.If=[this.o.If]);this.o.Td&&!this.o.Td.length&&(this.o.Td=[this.o.Td]);this.yr=[];this.zr=[];this.yr[0]=
b(["item","item0"],this.o.If)?new eh(this,this.o.If[0]):new lh(0,"");this.zr[0]=b(["item","item0"],this.o.Td)?new fh(this,"",this.o.Td[0]):new lh(0,"");if(this.o.If&&this.o.Td)for(g=1;g<this.o.Td.length;++g)b("item"+g,this.o.Td[g])&&(this.zr[g]=new fh(this,"0 / 0",this.o.Td[g]),this.yr[g]=new eh(this,this.o.If[g]));for(var q in this.o)g=this.o[q],g.N&&new fh(this,R.m.K(g.N,"<"+g.N+">")+(g.separator?g.separator:""),g);this.Pr=this.vt=0;this.buttons={};for(q in this.o.buttons)g=ph(this,this.o.buttons[q]),
this.buttons[q]=g;this.o.qs&&(g=ph(this,this.o.qs),this.buttons.pauseButton=g);this.Nm={};for(q in this.o.Nm)g=this.o.Nm[q],g=new qh[g.Uy](this,g),this.Nm[q]=g;this.Bb=this.Ab=0}wf(ch,ih);var qh={};function ph(a,b){var c=new rh(a,b,b.Z);a.yc.push(c);c.sz=b;return c}e=ih.prototype;e.Lo=function(a,b){this.buttons[b||"pauseButton"].Lo(a)};e.gp=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.qx?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};
e.setTime=function(a){this.Il.Wf(a);return this};e.getTime=function(){return this.Il.X()};function sh(a,b){a.Oe.Wf(b);a.fh.sm&&(a.Mi.X()<b?a.Mi.Wf(b):b<a.Mi.X()&&a.Mi.Wf(Math.max(b,a.ur)))}function th(a,b){a.Mi.Wf(b);a.ur=b}e.bi=function(a){sh(this,this.Oe.X()+a);return this};e.fc=function(){ch.prototype.fc.apply(this,arguments);w.ob(this.canvas);w.clear();for(var a in this.buttons)N(K,this.buttons[a])};
e.va=function(a){1===this.fp&&this.setTime(this.getTime()+a);if(2===this.fp){if(this.vt&&1E3*this.vt>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.Il,b.oc.p=0,b.oc.Xo=!0,b.font.setFillColor(b.oc.color),b.Me(),"undefined"!==typeof a_gameui_timewarning_second&&I.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}ch.prototype.va.apply(this,arguments);this.Pr+=a};
e.gk=function(a,b){this.Uc&&(this.Uc instanceof x?this.Uc.Yc(0,a+this.Bj,b+this.Cj,1):this.Uc.Yc(a+this.Bj,b+this.Cj,1));ch.prototype.gk.apply(this,arguments);this.Sm&&this.Uc&&ra(a,b,this.Uc.width,this.Uc.height,"blue",!0)};
function uh(a,b,c,d,g,h){this.e=a;this.width=g;this.height=h;this.Oa=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.I={};this.I.Ab=0;this.I.Bb=0;this.I.scale=this.scale;this.I.alpha=this.alpha;this.I.Sa=0;this.A={};this.A.be=!1;this.A.origin={};this.A.target={};this.A.p=0;this.a.lk&&(vh(this,this.a.lk),this.A.be=!1);this.e.yc.push(this);wh||(wh={kb:function(a){a.value instanceof y?a.Oa=a.value:(a.f=a.value,a.qb=0)},
update:$.Od,ib:$.Md,end:$.Nd,sd:O,td:O,rd:function(a,b,c,d){return 1-Q(a,b,c,d)},Eq:function(a,b,c,d){return 1*Q(a,b,c,d)+1},Fq:function(a,b,c,d){return 1*Q(a,b,c,d)+1}})}var wh;
function vh(a,b){a.A.origin.x=void 0===b.x?a.x:b.x;a.A.origin.y=void 0===b.y?a.y:b.y;a.A.origin.alpha=void 0!==b.alpha?b.alpha:1;a.A.origin.scale=void 0!==b.scale?b.scale:1;a.A.target.x=a.x;a.A.target.y=a.y;a.A.target.alpha=a.alpha;a.A.target.scale=a.scale;a.A.duration=b.duration;a.A.be=!0;a.A.ze=b.ze||Q;a.A.p=0;a.A.aa=b.aa||0;xh(a)}
function xh(a){a.A.p>=a.A.duration&&(a.A.p=a.A.duration,a.A.be=!1);var b=a.A.ze(a.A.p,a.A.origin.x,a.A.target.x-a.A.origin.x,a.A.duration),c=a.A.ze(a.A.p,a.A.origin.y,a.A.target.y-a.A.origin.y,a.A.duration);a.I.Ab=b-a.x;a.I.Bb=c-a.y;a.I.alpha=a.A.ze(a.A.p,a.A.origin.alpha,a.A.target.alpha-a.A.origin.alpha,a.A.duration);a.I.scale=a.A.ze(a.A.p,a.A.origin.scale,a.A.target.scale-a.A.origin.scale,a.A.duration);a.e.Mb=!0}e=uh.prototype;
e.Ma=function(a,b){this.Oa&&this.Oa.V(this.x+this.I.Ab+a,this.y+this.I.Bb+b,this.I.scale,this.I.scale,0,this.I.alpha)};e.xk=function(a,b){yh(this.x+this.I.Ab+a,this.y+this.I.Bb+b,this.width*this.I.scale,this.height*this.I.scale)};e.Gk=function(a,b){return a>this.x+this.I.Ab&&a<this.x+this.I.Ab+this.width*this.I.scale&&b>this.y+this.I.Bb&&b<this.y+this.I.Bb+this.height*this.I.scale};e.No=function(a){this.visible!==a&&(this.visible=a,this.e.Mb=!0)};
e.va=function(a){this.A.be&&(0<this.A.aa?this.A.aa-=a:(this.A.p+=-this.A.aa,this.A.aa=0,this.A.p+=a,xh(this)))};function lh(a,b){this.gd=this.value=this.Dk=b}lh.prototype.Wf=function(a){this.value=a};lh.prototype.X=function(){return this.value};lh.prototype.Ds=function(){};
function eh(a,b){this.so=b;this.a={};for(var c in b)this.a[c]=b[c];this.f=this.a.f;this.L=0;this.zg=this.a.zg;this.a.dt&&(this.a.x+=this.f.Db,this.a.y+=this.f.Eb);uh.call(this,a,this.a,this.a.x,this.a.y,this.f?this.f.width:1,this.f?this.f.height:1)}wf(uh,eh);qh.GameUIImage=eh;function zh(a,b){a.L!==b&&(a.L=b,a.e.Mb=!0)}e=eh.prototype;
e.Ma=function(a,b){this.f&&(this.zg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),this.f instanceof x?this.f.V(this.L,this.x+a+this.I.Ab,this.y+b+this.I.Bb,this.I.scale,this.I.scale,0,this.I.alpha):this.f.V(this.x+a+this.I.Ab,this.y+b+this.I.Bb,this.I.scale,this.I.scale,0,this.I.alpha),this.e.Sm&&ra(this.x+a-this.f.Db+1,this.y+b-this.f.Eb+1,this.f.width-2,this.f.height-2,"black",!0))};
e.Gk=function(a,b){if(!this.f)return!1;var c=0,d=0;this.zg&&(c+=-Math.floor(this.f.width/2),d+=-Math.floor(this.f.height/2));c-=this.f.Db;d-=this.f.Eb;return a>c+this.x+this.I.Ab&&a<c+this.x+this.I.Ab+this.width*this.I.scale&&b>d+this.y+this.I.Bb&&b<d+this.y+this.I.Bb+this.height*this.I.scale};e.xk=function(a,b){this.f&&(this.zg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),a-=this.f.Db,b-=this.f.Eb,yh(this.x+this.I.Ab+a,this.y+this.I.Bb+b,this.width*this.I.scale,this.height*this.I.scale))};
e.Ib=function(a){a||(a=new p(0,0));a.x=this.x+R.Df+this.e.Ab;a.y=this.y+R.Ce+this.e.Bb;return a};e.Ds=function(a){a!==this.f&&(this.f=a,this.e.Mb=!0,this.f&&(this.width=this.f.width,this.height=this.f.height))};e.br=function(){return this.f};
function fh(a,b,c){"object"===typeof b&&(c=b,b=c.N?R.m.K(c.N,"<"+c.N+">"):c.text||"");this.text=b;this.font=c.font.M();c.Ae&&C(this.font,c.Ae);this.ks=c.x;this.ls=c.y;this.js=c.Cb;this.Mw=this.font.fillColor;this.Cd=void 0===c.Cd?.2:c.Cd;uh.call(this,a,c,Math.floor(c.x-.1*c.Cb),Math.floor(c.y-.1*c.Jb),Math.floor(1.2*c.Cb),Math.floor(1.2*c.Jb));this.Oa=new y(this.width,this.height);switch(this.font.align){case "left":this.cg=Math.floor(.1*c.Cb);break;case "right":this.cg=Math.floor(1.1*c.Cb);break;
case "center":this.cg=Math.floor(.6*c.Cb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.Cd*this.font.fontSize);switch(this.font.j){case "top":this.dg=Math.floor(.1*c.Jb);break;case "bottom":this.dg=Math.floor(1.1*c.Jb)+a;break;case "middle":this.dg=Math.floor(.6*c.Jb)+a;break;default:throw"Unknown baseline: "+this.font.j;}this.oc={};this.oc.color="red";this.oc.duration=200;this.oc.p=0;this.oc.Xo=!1;this.Me()}wf(uh,fh);qh.GameUIText=fh;
fh.prototype.va=function(a){uh.prototype.va.apply(this,arguments);this.oc.Xo&&(this.oc.p+=a,this.oc.duration<=this.oc.p&&(this.oc.Xo=!1,this.font.setFillColor(this.Mw),this.Me()))};
fh.prototype.Me=function(){this.Oa.clear();z(this.Oa);var a=this.font.ha(this.text),b=1;a>this.js&&(b=this.js/a);this.font.V(this.text,this.cg,this.dg,b,b,0,1);this.e.Sm&&(ra(0,0,this.Oa.width,this.Oa.height,"black",!0),ra(this.ks-this.x,this.ls-this.y,this.Oa.width-2*(this.ks-this.x),this.Oa.height-2*(this.ls-this.y),"red",!0),sa(this.cg-5,this.dg,this.cg+5,this.dg),sa(this.cg,this.dg-5,this.cg,this.dg+5));this.e.Mb=!0;A(this.Oa)};function Ah(a){return""+a}function Bh(a,b,c){return b+c}
function kh(a,b,c,d,g,h){this.value=this.Dk=d||0;this.Ul=-1;this.Nt=c;this.a=b;this.Mt=-99999;this.ep=b.ep||0;this.ok=b.ok?b.ok:h||Ah;c=Bh;g&&0!==this.a.Dq&&(c=cc);this.Ha=new xf(this.Dk,void 0===this.a.Dq?500:this.a.Dq,c);b.ti&&(this.ti="game_ui_"+b.ti);this.text=Ch(this)+this.ok(this.Dk);fh.call(this,a,this.text,b)}wf(fh,kh);qh.GameUIValue=kh;kh.prototype.Wf=function(a){this.value=a;zf(this.Ha,this.value)};kh.prototype.X=function(){return this.value};
kh.prototype.op=function(a){var b=this.Ul;if(a||K.ec-this.Mt>this.ep)b=this.ok(Math.floor(this.Ha.X()));this.Ul!==b&&(this.Mt=K.ec,this.Ul=b,this.text=Ch(this)+b,this.Me())};kh.prototype.va=function(a){fh.prototype.va.apply(this,arguments);yf(this.Ha,a);Math.floor(this.Ha.X())!==this.Ul&&this.op()};function Ch(a){var b="";a.a.Tl&&(b=a.ti?R.m.K(a.ti,"<"+a.ti.toUpperCase()+">"):R.m.K("game_ui_"+a.Nt,"<"+a.Nt+">"));return b+(a.a.separator?a.a.separator:"")}
function nh(a,b){this.zm=this.gd=0;this.a=b;this.cj=this.Rf=0;this.f=b.f;this.ve=b.ve||b.f;this.Sn=b.Sn||null;this.a.el=this.a.el||0;this.a.fl=this.a.fl||0;this.rm=!0;this.ol=b.ol||0;this.G=[];this.Ha=new xf(0,200,gc);this.Cc=new xf(0,200,gc);uh.call(this,a,b,b.x,b.y,this.f.width,this.f.height)}wf(uh,nh);qh.GameUIProgress=nh;
nh.prototype.va=function(a){yf(this.Ha,a);var b=this.Ha.X();b!==this.Rf&&(this.e.Mb=!0,this.Rf=b);yf(this.Cc,a);a=this.Cc.X();a!==this.cj&&(this.e.Mb=!0,this.cj=a);b+=a;if(this.rm)for(a=0;a<this.G.length;++a){var c=b>=this.G[a].position&&this.gd+this.zm>=this.G[a].position;this.G[a].complete!==c&&(this.a.G&&(this.e.Mb=!0,this.Rf=b),this.G[a].complete=c)}};
nh.prototype.Ma=function(a,b){var c,d,g;if(0===this.ol&&(0<this.Cc.X()&&this.ve.ua(0,this.width*this.Ha.X()/100,0,this.ve.width*this.Cc.X()/100,this.ve.height,a+this.x+this.width*this.Ha.X()/100,b+this.y),this.f.ua(0,0,0,this.width*this.Ha.X()/100,this.height,a+this.x,b+this.y),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.width/100*d.position,b+this.y+this.a.G.y);if(1===this.ol&&(0<this.Cc.X()&&this.ve.ua(0,0,this.height-
this.height*this.Ha.X()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.X()/100)),this.f.ua(0,0,this.height-this.height*this.Ha.X()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.X()/100)),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.a.G.x,b+this.y+this.height-this.height/100*d.position);if(2===this.ol&&(0<this.Cc.X()&&this.ve.ua(0,0,this.height*this.Ha.X()/
100,this.ve.width,this.ve.height*this.Cc.X()/100,a+this.x+this.width*this.Ha.X()/100,b+this.y),this.f.ua(0,0,0,this.width,this.height*this.Ha.X()/100,a+this.x,b+this.y),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.a.G.x,b+this.y+this.height/100*d.position);this.Sn&&this.Sn.r(0,a+this.x+this.a.el,b+this.y+this.a.fl)};function rh(a,b,c){this.Ll=!1;this.sj=-1;this.e=a;this.a=b;this.i=!0;this.Lo(c);eh.call(this,a,b)}
wf(eh,rh);qh.GameUIButton=rh;rh.prototype.Lo=function(a){var b=null,c=null,d=this.e,g=this.a;void 0===a&&(a=g.Z?g.Z:0);switch(a){case 0:b=d.fh.hn?Cd:Dd;c=function(){Rf(R.e)?R.e.ce(!1,!0,d.fh.hn):R.e.ce();return!0};break;case 1:b=Ed;c=function(){R.e.ce();return!0};break;case 2:b=s_btn_small_quit;c=function(){Dh(d.fh.hn);return!0};break;case 3:b=g.f}this.Gb=c;this.a.f=b};rh.prototype.yb=function(a,b,c){if(this.i)return this.Gk(b-R.Df,c-R.Ce)?(this.Ll=!0,this.sj=a,zh(this,1),!0):!1};
rh.prototype.va=function(a){eh.prototype.va.apply(this,arguments);this.Ll&&(this.Gk(Bb(this.sj)-R.Df,K.ra[this.sj].y-R.Ce)?zh(this,1):zh(this,0))};rh.prototype.Kb=function(a,b,c){return this.Ll&&a===this.sj?(zh(this,0),this.Gk(b-R.Df,c-R.Ce)&&this.Gb&&this.Gb(),this.Ll=!1,this.sj=-1,!0):!1};
function mh(a,b){this.zm=this.gd=0;this.a=b;this.cj=this.Rf=0;this.rm=!0;this.G=[];this.color=b.color||"#00AEEF";this.hq=b.hq||"#FF0F64";this.fq=b.fq||"#FFED93";this.xu=void 0===b.blink||b.blink;this.Oc=b.Oc;this.ji=!1;this.lf=0;this.Tj=1E3;this.Uj=0;this.Ha=new xf(0,200,gc);this.Cc=new xf(0,200,gc);uh.call(this,a,b,b.x,b.y,1,1)}wf(uh,mh);qh.GameUIRoundProgress=mh;
mh.prototype.va=function(a){yf(this.Ha,a);var b=this.Ha.X();b!==this.Rf&&(this.e.Mb=!0,this.Rf=b);yf(this.Cc,a);var c=this.Cc.X();c!==this.cj&&(this.e.Mb=!0,this.cj=c);this.ji&&(this.lf+=a,this.lf>=this.Tj?100===this.gd?(this.ji=!1,this.xu&&(this.ji?this.lf-=this.Tj:(this.ji=!0,this.Uj=this.lf=0,zf(this.Ha,100)))):(this.ji=!1,this.Uj=0,this.Ha.Jg=0,this.Ha.Jl=0,zf(this.Ha,this.gd)):this.Uj=(-Math.cos(this.lf/this.Tj*5*Math.PI*2)+1)/2,this.e.Mb=!0);b+=c;if(this.rm)for(a=0;a<this.G.length;++a)c=b>=
this.G[a].position&&this.gd+this.zm>=this.G[a].position,this.G[a].complete!==c&&(this.a.G&&(this.e.Mb=!0,this.Rf=b),this.G[a].complete=c)};mh.prototype.xk=function(a,b){this.Oc&&yh(this.x+this.I.Ab+a-this.Oc.Db,this.y+this.I.Bb+b-this.Oc.Eb,this.Oc.width*this.I.scale,this.Oc.height*this.I.scale)};
mh.prototype.Ma=function(a,b){var c,d;if(this.Oc){d=this.Ha.X()/100;d=Math.max(d,0);d=Math.min(d,1);var g=w.context,h=this.Oc.width/2-S(4),k=g.fillStyle;if(0<this.Cc.X()){var l=this.Cc.X()/100;g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.hq;g.fill()}g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Tj&&(l=g.globalAlpha,
g.globalAlpha*=this.Uj,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.fq,g.fill(),g.globalAlpha=l);if(this.a.G){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=S(2);for(d=0;d<this.G.length;++d){c=this.G[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+
this.y+c));g.stroke()}g.strokeStyle=l;g.lineWidth=n}this.Oc.r(0,a+this.x,b+this.y);if(this.a.G)for(d=0;d<this.G.length;++d)c=this.G[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.r(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.G.fx*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.G.fx*.5));g.fillStyle=k}};R.version=R.version||{};R.version.game_ui="2.1.0";
var $={mt:{},nt:{},ot:{},pt:{},Zk:{},po:{},Wx:{},Bv:{},au:function(){$.mt={kb:$.bk,update:$.Od,ib:$.Md,end:$.Nd,font:ze,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.nt={kb:$.bk,update:$.Od,ib:$.Md,end:$.Nd,font:Ae,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.ot={kb:$.bk,update:$.Od,ib:$.Md,end:$.Nd,font:Be,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.pt={kb:$.bk,update:$.Od,ib:$.Md,end:$.Nd,font:Ce,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,
.1])};$.Zk={kb:$.Ju,update:$.Od,ib:$.Md,end:$.Nd,Ai:Fe,zi:De,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.po={kb:$.Ku,update:$.Od,ib:$.Md,end:$.Nd,Ai:Fe,zi:De,margin:20,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.Wx={kb:$.Lu,update:$.Od,ib:$.Md,end:$.Nd,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])};$.Bv={kb:$.Iu,update:$.Od,ib:$.Md,end:$.Nd,sd:O,td:O,rd:ic([Q,Yb,Q],[!1,!1,!0],[.1,.8,.1])}},Ty:function(a){function b(a){var d,g={};for(d in a)g[d]="object"===typeof a[d]&&null!==
a[d]?b(a[d]):a[d];return g}return b(a)},aB:function(a){$.mt.font.jb=a;$.nt.font.jb=a;$.ot.font.jb=a;$.pt.font.jb=a},$A:function(a){$.Zk.Ai.jb=a;$.Zk.zi.jb=a;$.po.Ai.jb=a;$.po.zi.jb=a},Bh:!1,bc:[],ox:function(a){$.Bh=a},uz:function(){return $.Bh},ix:function(a){var b,c;for(b=0;b<$.bc.length;b+=1)c=$.bc[b],void 0===c||void 0!==a&&c.kind!==a||0<c.dh||($.bc[b]=void 0)},$t:function(){$.Bh=!1;$.bc=[]},Dh:function(a,b,c,d){var g,h,k;void 0===d&&(d=$.Bh);if(d)for(h=0;h<$.bc.length;h+=1)if(g=$.bc[h],void 0!==
g&&g.Ge&&g.kind===a&&g.font===b&&g.text===c)return g.dh+=1,h;g={kind:a,font:b,text:c,dh:1,Ge:d};h=b.align;k=b.j;G(b,"center");H(b,"middle");d=b.ha(c)+2*a.margin;a=b.U(c)+2*a.margin;g.Oa=new y(d,a);z(g.Oa);b.r(c,d/2,a/2);A(g.Oa);G(b,h);H(b,k);for(h=0;h<$.bc.length;h+=1)if(void 0===$.bc[h])return $.bc[h]=g,h;$.bc.push(g);return $.bc.length-1},Yt:function(a){var b=$.bc[a];b.dh-=1;0>=b.dh&&!b.Ge&&($.bc[a]=void 0)},bk:function(a){a.buffer=$.Dh(a.kind,a.kind.font,a.value,a.Ge)},Ju:function(a){var b=a.value.toString();
a.buffer=0<=a.value?$.Dh(a.kind,a.kind.Ai,b,a.Ge):$.Dh(a.kind,a.kind.zi,b,a.Ge)},Ku:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?$.Dh(a.kind,a.kind.Ai,b,a.Ge):$.Dh(a.kind,a.kind.zi,b,a.Ge)},Lu:function(a){a.Oa=a.value},Iu:function(a){a.f=a.value;a.qb=0},Od:function(a){a.x=void 0!==a.kind.sd?a.kind.sd(a.time,a.Bl,a.Hq-a.Bl,a.duration):a.Bl+a.time/a.duration*(a.Hq-a.Bl);a.y=void 0!==a.kind.td?a.kind.td(a.time,a.Cl,a.Iq-a.Cl,a.duration):a.Cl+a.time/a.duration*(a.Iq-a.Cl);
void 0!==a.kind.Eq&&(a.Tf=a.kind.Eq(a.time,0,1,a.duration));void 0!==a.kind.Fq&&(a.Uf=a.kind.Fq(a.time,0,1,a.duration));void 0!==a.kind.rd&&(a.alpha=a.kind.rd(a.time,0,1,a.duration));void 0!==a.kind.Su&&(a.Sa=a.kind.Su(a.time,0,360,a.duration)%360);void 0!==a.f&&(a.qb=a.time*a.f.L/a.duration)},Md:function(a){var b=w.context,c;void 0!==a.f&&null!==a.images?1===a.Tf&&1===a.Uf&&0===a.Sa?a.f.Yc(Math.floor(a.qb),a.x,a.y,a.alpha):a.f.V(Math.floor(a.qb),a.x,a.y,a.Tf,a.Uf,a.Sa,a.alpha):(c=void 0!==a.Oa&&
null!==a.Oa?a.Oa:$.bc[a.buffer].Oa,1===a.Tf&&1===a.Uf&&0===a.Sa?c.Yc(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Tf)||1E-4>Math.abs(a.Uf)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.Sa*Math.PI/180),b.scale(a.Tf,a.Uf),c.Yc(-c.width/2,-c.height/2,a.alpha),b.restore()))},Nd:function(a){void 0!==a.buffer&&$.Yt(a.buffer)},Lc:function(a){var b,c,d=!1;for(b=0;b<$.vb.length;b+=1)c=$.vb[b],void 0!==c&&(0<c.aa?(c.aa-=a,0>c.aa&&(c.time+=-c.aa,c.aa=0)):c.time+=a,0<c.aa||(c.time>=c.duration?(c.kind.end(c),
$.vb[b]=void 0):c.kind.update(c),d=!0));d&&($.canvas.W=!0)},Ma:function(){var a,b;for(a=0;a<$.vb.length;a+=1)b=$.vb[a],void 0!==b&&(0<b.aa||b.kind.ib(b))},vb:[],Fv:function(a,b,c){$.Gq();void 0===a&&(a=R.Rd);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);$.visible=!0;$.i=!0;R.b.Na($,a);$.depth=b;M($);Mb($,c);$.$t();$.au()},gu:function(a,b,c,d,g,h,k,l,n){void 0===l&&(l=void 0!==a.aa?a.aa:0);void 0===n&&(n=$.Bh);void 0===g&&void 0!==a.Cw&&(g=c+a.Cw);void 0===h&&void 0!==a.Dw&&(h=d+a.Dw);void 0===k&&
void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Bl:c,Cl:d,Hq:g,Iq:h,x:c,y:d,Tf:1,Uf:1,alpha:1,Sa:0,time:0,duration:k,aa:l,Ge:n};a.kind.kb(a);for(b=0;b<$.vb.length;b+=1)if(void 0===$.vb[b])return $.vb[b]=a,b;$.vb.push(a);return $.vb.length-1},HA:function(a){var b;0>a||a>=$.vb.length||(b=$.vb[a],void 0!==b&&(b.kind.end(b),$.vb[a]=void 0))},hx:function(){var a,b;for(a=0;a<$.vb.length;a+=1)b=$.vb[a],void 0!==b&&(b.kind.end(b),$.vb[a]=void 0);$.vb=[]},Gq:function(){$.hx();$.ix();N(K,$)}};
function Rect(a,b,c,d){this.x=a;this.y=b;this.width=c;this.height=d}Rect.prototype.contains=function(a,b){return a>=this.x&&a<=this.x+this.width&&b>=this.y&&b<=this.y+this.height};Rect.prototype.Vm=function(a){return new Rect(this.x-a,this.y-a,this.width+2*a,this.height+2*a)};function Eh(a,b,c){b<a.x?(a.width=a.x-b+a.width,a.x=b):b>a.x+a.width&&(a.width=b-a.x);c<a.y?(a.height=a.y-c+a.height,a.y=c):c>a.y+a.height&&(a.height=c-a.y)}
function Fh(a){return[new p(a.x,a.y),new p(a.x+a.width,a.y),new p(a.x,a.y+a.height),new p(a.x+a.width,a.y+a.height)]}
function Gh(a,b,c,d){this.ma=this.depth=0;this.visible=!1;this.i=!0;this.Rc=a;this.Xa=b;this.open=!1;this.x=void 0===c?0:c;this.y=void 0===d?0:d;this.qk=this.x;this.rk=this.y;this.Ue=this.x;this.Ve=this.y;this.alpha=1;this.vq=!1;this.As=R.a.k.Ua.shadowOffsetX/2;this.Bs=R.a.k.Ua.shadowOffsetY/2;this.Wq=this.Pc=0;this.Hf=this.Un=!1;this.bp=this.ke=0;this.kt=this.lt=Q;this.zh=0;this.Vl=2500;this.wy=R.iv/2;this.Rt=!1;this.di=0;this.Vp=R.a.k.Ua.hk;this.Da=this.Ba=1;this.bn=this.yf=0;this.Js=!1;this.$u=
function(a){return.1>a?ac(a,1,1.3-1,.2):.2>a?1.3:.45>a?ac(a-.2,1.3,-1.2,.2):.7>a?$b(a-.45,.1,1.2,.2):.8>a?1.3:$b(a-.8,1.3,-(1.3-1),.2)};this.av=ic([ac,Yb,ac],[!1,!1,!0],[.1,.7,.2]);this.xx=ic([ac,ac],[!1,!0]);this.Ii=!0;M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd)}function Hh(a,b){void 0!==b&&Lb(a,b)}e=Gh.prototype;e.br=function(){return this.open===this.Ii?{f:W,ct:13*this.Rc+this.Xa-1}:{f:Xd,ct:0}};
function Ih(a,b,c,d,g,h,k,l,n,q){a.qk=a.x;a.rk=a.y;a.Ue=b;a.Ve=c;a.Wq=a.Pc;Hh(a,k);if(!(!0!==n&&0>=a.ke&&a.x===b&&a.y===c)){void 0===h&&(h=0);a.ke=g+h;a.bp=g;a.kt=void 0===q?a.lt:q;a.i=!0;if(void 0===h||0===h)a.visible=!0;void 0===l&&(l=!1);void 0===a.fb||l||a.fb.ub();a.fb=d}}function Jh(a,b,c){var d=!0;void 0===b&&(b=0);void 0===c&&(c=0);a.yf=b+c;a.bn=b;a.open=!a.open;a.Ii=!1;a.Js=!1;a.i=!0;0===c&&(a.visible=!0);void 0===d&&(d=!1);void 0===a.fb||d||a.fb.ub()}
e.va=function(a){var b=1,c=1;this.i=!1;if(this.Hf||this.vq)this.i=!0;0<this.ke?(this.i=!0,this.ke-=a,this.ke>this.bp?b=0:(this.visible=!0,b=0>=this.ke?1:1-this.ke/this.bp),b=this.kt(b,0,1,1),this.x=this.qk+(this.Ue-this.qk)*b,this.y=this.rk+(this.Ve-this.rk)*b):(this.x=this.Ue,this.y=this.Ve);this.i&&(this.Un||this.Hf)?(this.Pc+=(1-this.Pc)/2*a/12,this.Pc=Math.min(this.Pc,1)):this.Pc=this.Wq*(1-b);0<this.yf?(this.i=!0,this.yf-=a,this.yf>this.bn?c=0:(this.visible=!0,c=0>=this.yf?1:1-this.yf/this.bn),
!this.Ii&&.45<c&&(this.Ii=!0,I.play(Ue)),this.Js?(c=this.xx(c,0,1,1),this.Ba=1-.99*c,this.Da=1+.2*c):(this.Ba=this.$u(c),this.Da=this.av(c,1,.3,1))):this.Ii=!0;0<this.di?(this.di-=a,this.alpha=1-this.di/this.Vp,0>this.alpha&&(this.alpha=0)):this.alpha=1;if(this.Rt)if(this.zh+=a,this.zh>=this.Vl)this.i=this.Rt=!1;else{this.i=!0;this.x=this.qk+Q(this.zh,0,-this.wy,this.Vl);a=this.rk;var d=this.Vl,b=R.bv,c=d-this.zh,g=2,h=5,k,l,n;void 0===g&&(g=4);h=void 0===h?2:Math.sqrt(h);k=[1];for(l=n=1;l<g;l+=1)k.push(k[l-
1]*h),n+=k[l];n-=k[g-1]/2;h=Math.pow(k[g-1],2);c=c/d*n;for(l=d=0;l<g;l+=1)if(c>k[l])c-=k[l];else{d=k[l];break}this.y=a+(0+b*(1+-1*(-4*Math.pow(c-d/2,2)+d*d)/h));this.alpha=dc(this.zh,1,-1,this.Vl)}!1===this.i&&(this.visible=!1,void 0!==this.fb&&this.fb.ub())};e.Lc=function(){this.canvas.W=!0};
e.Ma=function(){w.context.save();w.context.translate(this.x-2*this.As*this.Pc,this.y-2*this.Bs*this.Pc);w.context.scale(this.Ba,this.Da);qd.V(0,2*this.As*this.Pc,2*this.Bs*this.Pc,1,1,0,this.alpha);this.Hf&&sd.V(0,0,0,1,1,0,this.Pc);this.ub(0,0);w.context.restore()};e.ub=function(a,b){var c=this.br();c.f.V(c.ct,a,b,1,1,0,this.alpha);R.a.k.debug.Ru&&w.context.fillText("s"+this.Rc+"c"+this.Xa,a+4,b-W.height/3)};e.Ub=function(){return new Rect(this.x-W.width/2,this.y-W.height/2,W.width,W.height)};
function Kh(a,b){a.ke=0;a.Hf=!1;!0!==b&&new Lh(a.x,a.y,a.depth+1)}function Mh(a){a.di=a.Vp;a.alpha=0}function Nh(a,b,c){this.x=a;this.y=b;this.aj=c;this.h=[];this.zl="squared";this.nk=-1;this.uf=new p(0,20);this.Zu=.5;this.tu=0;this.os=this.ps="none";this.Pk=this.Vg=-1;this.ii=0;this.ib=!0}
function Oh(a,b,c){if("alternate"===a.ps){if(null!==b&&(0===b.Rc||3===b.Rc?"black":"red")===(0===c.Rc||3===c.Rc?"black":"red"))return!1}else if("same"===a.ps&&null!==b&&b.Rc!==c.Rc)return!1;if("asc"===a.os)if(null===b){if(1!==c.Xa)return!1}else{if(b.Xa+1!==c.Xa)return!1}else if("desc"===a.os)if(null===b){if(!0===R.D.rz.sA&&13!==c.Xa)return!1}else if(b.Xa-1!==c.Xa)return!1;return!0}
function Ph(a,b){var c=0;if(0<=a.Vg&&a.h.length+b.length>a.Vg||!Oh(a,Qh(a),b[0]))return!1;for(c=0;c<b.length-1;c+=1)if(!Oh(a,b[c],b[c+1]))return!1;a.h=a.h.concat(b);return!0}function Qh(a){return 0===a.h.length?null:a.h[a.h.length-1]}e=Nh.prototype;e.pop=function(){return this.h.pop()};e.Ib=function(a){var b,c=new p(this.x,this.y),d;if("fanned"===this.zl&&(b=0<=this.nk?Math.max(0,this.h.length-this.nk):0,a>=b))for(d=b;d<a;d+=1)b=this.h[d].open?1:this.Zu,c=c.add(this.uf.scale(b));return c};
e.Ub=function(a){a=this.Ib(a);return new Rect(a.x-W.width/2*1,a.y-W.height/2*1,1*W.width,1*W.height)};function Rh(a){var b=a.Ub(0);a=a.Ub(a.h.length-1);Eh(b,a.x,a.y);Eh(b,a.x+a.width,a.y+a.height);return b}e.Ef=function(){var a,b,c;return"fanned"===this.zl?(a=this.Ub(0),b=new Rect(a.x,a.y,a.width,a.height),-1===this.nk?(b.x+=this.uf.x*this.h.length,b.y+=this.uf.y*this.h.length):(c=Math.max(this.nk,this.tu),b.x+=this.uf.x*c,b.y+=this.uf.y*c),Eh(a,b.x,b.y),Eh(a,b.x+b.width,b.y+b.height),a.Vm(1)):this.Ub(0).Vm(1)};
e.An=function(a){return this.ii-a};e.Bn=function(a,b){var c;for(c=this.h.length-1;0<=c;c-=1)if(this.Ub(c).contains(a,b))return c;return 0<this.h.length&&this.Ef().contains(a,b)?-1:-2};e.Xd=function(a,b,c,d,g,h,k){var l,n,q;void 0===b&&(b=0);void 0===c&&(c=0);void 0===g&&(g=0);void 0===k&&(k=!1);for(h=0;h<this.h.length;h+=1)n=h>=c,l=g+Math.max(0,h-c)*b,q=a,!n&&k&&(l=0,q*=2),this.ah(h,q,l,d,n)};e.Mo=function(a){for(var b=0;b<this.h.length;++b)this.h[b].Un=a};e.wl=function(a,b){this.h[a].Hf=b};
e.ah=function(a,b,c,d,g,h){var k=this.An(a),l=this.Ib(a);void 0===c&&(c=0);Ih(this.h[a],l.x,l.y,this,b,c,k,d,g,h)};
e.ub=function(){var a,b,c;if(!0===this.ib){R.b.ob(R.Be);a=this.Ef();yh(a.x,a.y,a.width,a.height);R.a.k.debug.Um&&ra(a.x,a.y,a.width,a.height,"red",!0);void 0!==this.aj&&(c=this.Ib(0),this.aj.V(0,c.x,c.y,1,1,0,1));if(this.Av)for(a=0;a<this.h.length;a+=1)b=this.h[a],c=this.Ib(a),b.x===c.x&&b.y===c.y&&qd.V(0,c.x,c.y,1,1,0,1);for(a=0;a<this.h.length;a+=1)b=this.h[a],c=this.Ib(a),b.x!==c.x||b.y!==c.y||b.visible||b.ub(Math.round(c.x),Math.round(c.y))}};
function Sh(a,b,c){this.x=a;this.y=b;this.aj=c;this.h=[];this.ii=0;this.ib=!0}e=Sh.prototype;e.Ub=function(a){a=this.Ib(a);return new Rect(a.x-W.width/2*1,a.y-W.height/2*1,1*W.width,1*W.height)};e.Ef=function(){var a=this.Ub(0),b=this.Ub(21),c=this.Ub(27);Eh(a,b.x,b.y);Eh(a,b.x+b.width,b.y+b.height);Eh(a,c.x,c.y);Eh(a,c.x+c.width,c.y+c.height);return a};e.An=function(a){return this.ii-a};
e.Bn=function(a,b){var c;for(c=this.h.length-1;0<=c;c-=1)if(null!==this.h[c]&&this.Ub(c).contains(a,b))return c;return this.Ef().contains(a,b)?-1:-2};e.Ib=function(a){a=Th(a);return{x:this.x+(a.ni-a.ae/2)*W.width*R.a.k.Lb.Ou,y:this.y+a.ae*W.height*R.a.k.Lb.Pu}};function Uh(a,b){var c=Th(b),d=Vh(c.ae+1,c.ni),c=Vh(c.ae+1,c.ni+1);return(d>=a.h.length||null===a.h[d])&&(c>=a.h.length||null===a.h[c])}function Th(a){var b;for(b=0;10>b;b+=1){if(a<=b)return{ae:b,ni:a};a-=b+1}}
function Vh(a,b){var c,d=0;for(c=0;c<=a;c+=1)d+=c;return d+b}function Wh(a,b){var c=Th(a),d=Th(b),g=Math.min(c.ae,d.ae);c.ae!==g&&(d=c=d);g=d.ni-c.ni;return 1===d.ae-c.ae&&(0===g||1===g)}e.Xd=function(a,b,c,d,g,h,k){var l,n,q;void 0===b&&(b=0);void 0===c&&(c=0);void 0===g&&(g=0);void 0===k&&(k=!1);for(h=0;h<this.h.length;h+=1)n=h>=c,l=g+Math.max(0,h-c)*b,q=a,!n&&k&&(l=0,q*=2),this.ah(h,q,l,d,n)};e.Mo=function(a){for(var b=0;b<this.h.length;++b)null!==this.h[b]&&(this.h[b].Un=a)};
e.wl=function(a,b){null!==this.h[a]&&(this.h[a].Hf=b)};e.ah=function(a,b,c,d,g,h){var k=this.An(a),l=this.Ib(a);void 0===c&&(c=0);a=this.h[a];null!==a&&Ih(a,l.x,l.y,this,b,c,k,d,g,h)};
e.ub=function(){var a,b,c;if(!0===this.ib){R.b.ob(R.Be);a=this.Ef();yh(a.x,a.y,a.width,a.height);R.a.k.debug.Um&&ra(a.x,a.y,a.width,a.height,"red",!0);void 0!==this.aj&&(c=this.Ib(0),this.aj.V(0,c.x,c.y,1,1,0,1));if(this.Av)for(a=0;a<this.h.length;a+=1)b=this.h[a],null!==b&&(c=this.Ib(a),b.x===c.x&&b.y===c.y&&qd.V(0,c.x,c.y,1,1,0,1));for(a=0;a<this.h.length;a+=1)b=this.h[a],null!==b&&(c=this.Ib(a),b.x!==c.x||b.y!==c.y||b.visible||b.ub(Math.round(c.x),Math.round(c.y)))}};
function Xh(){this.Lb=this.gc=this.sc=this.tc=void 0}function Yh(a,b,c){var d,g=52,h,k;b+=R.Bf;c+=R.Cf;d=[];for(h=0;4>h;h+=1)for(k=1;14>k;k+=1)d.push(new Gh(h,k,b,c));if(!0===a)for(;g;)h=Math.floor(Math.random()*g),g-=1,a=d[g],d[g]=d[h],d[h]=a;return d}function Zh(a){if(0!==a.tc.h.length||0!==a.gc.h.length||null!==a.Lb.h[0])return!1;for(i=0;i<a.sc.length;i+=1)if(0!==a.sc[i].h.length)return!1;return!0}
function $h(){function a(a){return 13===a?!0:void 0===c[13-a]?(c[a]=1,!1):!0}var b=R.D.Va;if(void 0===b.gc||0===b.gc.h.length||0!==b.tc.h.length||null===R.D.Va.Lb.h[0])return!0;var c={},d;for(d=0;d<b.Lb.h.length;d+=1)if(null!==b.Lb.h[d]&&Uh(b.Lb,d)&&a(b.Lb.h[d].Xa))return!0;for(d=0;d<b.sc.length;d+=1)if(0<b.sc[d].h.length&&a(Qh(b.sc[d]).Xa))return!0;return a(Qh(b.gc).Xa)?!0:!1}
Xh.prototype.kb=function(a){var b=R.a.k.wd.Fu,c=R.a.k.wd.Gu;a=Yh(!0!==a,b,c);var d=new Nh(b+R.Bf,c+R.Cf);d.h=[a[0]];d.ub();b=new Vb;c=28*R.a.k.wd.Ao;b.xa(c,function(){d.h=[];d.ub()});b.start();Mb(b,["game","item"]);var b=new Nh(R.a.k.tc.Zd+R.Bf,R.a.k.tc.$d+R.Cf,td),g=a.length-28;b.h=a.slice(0,g);b.Xd(R.a.k.wd.Ys,R.a.k.wd.Zs,void 0,void 0,c);b.ii=-104;b.Fz=!0;b.ub();var c=[],h,k;for(k=0;k<R.D.eb.un.oo;k+=1)h=new Nh(R.a.k.fb.Zd+k*(W.width+R.a.k.fb.offset)+R.Bf,R.a.k.fb.$d+R.Cf,ud),h.zl="fanned",h.uf=
new p(R.a.k.fb.Nq,R.a.k.fb.Oq),h.Ez=!0,h.Vg=0,h.Pk=1,h.h=[],h.ub(),c.push(h);h=new Sh(R.a.k.Lb.Zd+R.Bf,R.a.k.Lb.$d+R.Cf);h.h=a.splice(g,g+28);for(k=0;28>k;k+=1)a=h.h[k],a.open=!0,a.Sf=k;h.Xd(R.a.k.wd.Xw,R.a.k.wd.Ao);h.Fe=!0;h.ub();a=new Nh(R.a.k.gc.Zd+R.Bf,R.a.k.gc.$d+R.Cf,vd);a.Iv=!0;a.Vg=1;a.Pk=1;a.ub();g=I.play(Se);I.fj(g,!0);I.stop(g,2600,bc);this.tc=b;this.sc=c;this.Lb=h;this.gc=a};
function ai(){this.ma=this.depth=0;this.visible=!1;this.i=!0;this.reset();M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd)}ai.prototype.Lc=function(){null!=this.dj&&this.dj<K.ec&&this.reset();this.visible&&(this.canvas.W=!0)};ai.prototype.set=function(a,b,c,d){this.reset();this.x=a;this.y=b;this.Rc=c;this.Xa=d;this.visible=!0};function bi(a,b,c){0>=b?a.reset():(a.dj=b+K.ec,a.xb=b,a.Mq=void 0===c?!1:c)}
ai.prototype.reset=function(){this.visible=!1;this.y=this.x=0;this.alpha=.2;this.Xa=this.Rc=0;this.dj=null;this.xb=0;this.Mq=!1};ai.prototype.Ma=function(){var a=1;!0===this.Mq&&null!==this.dj&&(a=(this.dj-K.ec)/this.xb);W.V(13*this.Rc+this.Xa-1,this.x,this.y,1,1,0,this.alpha*a)};
function ci(a,b,c,d){this.ma=this.depth=0;this.visible=!1;this.i=!0;this.Ua=a;a.open=!0;a.visible=!0;a.vq=!0;this.aa=b;this.sp=new p(d*Math.cos(Math.PI*c/180),-d*Math.sin(Math.PI*c/180));this.acceleration=new p(0,-d/4);M(this);Mb(this,["game","item"])}ci.prototype.va=function(a){this.aa-=a;if(!(0<this.aa)){var b=this.sp,c=this.acceleration.scale(a/1E3);b.x+=c.x;b.y+=c.y;this.Ua.Ue+=this.sp.x*a/1E3;this.Ua.Ve+=this.sp.y*a/1E3}};
function di(a,b,c){this.depth=c;this.ma=0;this.i=this.visible=!0;this.x=a;this.y=b;this.qb=0;this.mj=9;this.startTime=K.ec;this.duration=R.a.k.Ua.hk;M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd)}di.prototype.zn=function(){return Math.floor((K.ec-this.startTime)/this.duration*this.mj)};di.prototype.Ma=function(){var a=this.zn();a>=this.mj?N(K,this):od.V(a,this.x,this.y,1,1,0,1)};
function Lh(a,b,c){this.depth=c;this.ma=0;this.i=this.visible=!0;this.x=a;this.y=b;this.qb=0;this.mj=8;this.startTime=K.ec;this.duration=R.a.k.Ua.hk;M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd)}Lh.prototype.zn=function(){return Math.floor((K.ec-this.startTime)/this.duration*this.mj)};Lh.prototype.Ma=function(){var a=this.zn();a>=this.mj?N(K,this):yd.V(a,this.x,this.y,1,1,0,1)};
function ei(){this.ma=this.depth=0;this.visible=!0;this.i=!1;this.zo=0;this.ye=28*R.a.k.wd.Ao+24*R.a.k.wd.Zs+R.a.k.wd.Ys;this.Pf=-1;this.Zg=0;this.gl=void 0;this.Zi=new p(0,0);this.xd=new p(0,0);this.Bt=[];this.kc=new fi;this.T=null;this.De=new ai;M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd)}function gi(a,b){void 0===b?a.T.J.h.length>a.T.$&&a.T.J.wl(a.T.$,!1):b.Hf=!1;a.T=null}e=ei.prototype;e.fa=function(a){var b=R.D.Hb,c=b.Oe.X();b.bi(a);0>b.Oe.X()&&sh(b,0);a=b.Oe.X()-c;0<a&&this.kc.bi(a)};
function hi(a,b,c){$.gu($.Zk,a,b,c,b,c-20,1300,0,!0)}e.kb=function(){this.i=!0};function ii(a,b){a.ye=Math.max(b,a.ye)}
function ji(a){var b,c,d,g,h,k,l;if(0!==R.D.Va.tc.h.length){var n=R.D.Va;c=Math.min(n.tc.h.length,n.sc.length);a.fa(R.D.eb.Xi.Zo*c);g=R.a.k.Wb.my;h=R.a.k.Wb.ky;k=R.a.k.Wb.ly;l=h*(c-1)+g;for(b=0;b<c;b+=1){d=n.tc.pop();Jh(d,g,h*b);var q=n.sc[b];q.h.push(d);ki(a.kc,n.tc,-1,n.sc[b],d);q.Xd(.5*g,h*b,q.h.length-1,!0,h*b+.2*g,void 0,!0);d=new Vb;d.fb=q;d.xa(h*b+g+k,function(a,b){var c=Qh(b.fb);null!==c&&new di(c.Ue,c.Ve,c.depth+1)});d.start();Mb(d,["game","item"])}ii(a,l);d=new Vb;d.xa(h*(c-1),function(){n.tc.ub()});
d.start();Mb(d,["game","item"])}}
function li(a,b){var c,d,g,h=R.D.Va.sc;for(c=0;c<h.length;c+=1)if(g=h[c].Bn(a,b),-2!==g){if(-1===g)g=h[c].h.length-1;else for(d=g;d<h[c].h.length;d+=1)if(h[c].h[d].open){g=d;break}a:{d=h[c];for(var k=0,k=d.h.length-1;k>=g;k-=1)if(!d.h[k].open||k<d.h.length-1&&!Oh(d,d.h[k],d.h[k+1])){d=!1;break a}d=!0}d&&(d=h[c],d=0>d.Pk?!0:d.Pk>=d.h.length-g);if(d)return{J:h[c],$:g}}g=R.D.Va.gc.h.length-1;if(0<=g&&R.D.Va.gc.Ub(g).contains(a,b))return{J:R.D.Va.gc,$:g};c=R.D.Va.Lb;g=c.Bn(a,b);if(Uh(c,g))return{J:R.D.Va.Lb,
$:g,gn:!0}}function mi(a){var b,c=[];for(b=0;b<a.length;b+=1){R.D.Va.gc.Ef().contains(a[b].x,a[b].y)&&c.push({fb:R.D.Va.gc,Sf:-1});var d;for(d=0;d<R.D.Va.sc.length;d+=1)R.D.Va.sc[d].Ef().contains(a[b].x,a[b].y)&&c.push({fb:R.D.Va.sc[d],Sf:-1});var g=R.D.Va.Lb;for(d=0;d<g.h.length;d+=1)null!==g.h[d]&&Uh(g,d)&&g.Ub(d).contains(a[b].x,a[b].y)&&c.push({fb:g,Sf:d})}return c}function ni(a){0===a.kc.Zj.length||a.Bt.push(a.kc);a.kc=new fi}
e.me=function(){ni(this);null!==this.T&&gi(this);this.De.reset();var a=this.Bt.pop();a&&(a.me(),this.fa(R.D.eb.Xi.me));oi()};
e.yb=function(a){0<this.ye||-1!==this.Pf||(this.Pf=a,this.Zg=0,this.gl=void 0,this.Zi=new p(Bb(a),K.ra[a].y),this.yq=!1,ni(this),a=li(this.Zi.x,this.Zi.y),void 0!==a&&(null!==this.T&&this.T.J===a.J&&this.T.$===a.$&&(gi(this),I.play(Ve),this.yq=!0),a.hl=a.J.Ib(a.$),a.Pa=new Nh(a.hl.x,a.hl.y),a.Pa.zl="fanned",a.Pa.ii=-104,a.Pa.ib=!1,a.Pa.uf=new p(R.a.k.fb.Nq,R.a.k.fb.Oq),this.De.set(a.J.h[a.$].Ue,a.J.h[a.$].Ve,a.J.h[a.$].Rc,a.J.h[a.$].Xa),!0===a.gn?(a.Pa.h=[a.J.h[a.$]],a.J.h[a.$]=null):(a.Pa.h=a.J.h.slice(a.$),
a.J.h=a.J.h.slice(0,a.$)),a.Pa.Xd(100)),this.gl=a)};e.Lc=function(a){var b,c;this.canvas.W=!0;this.ye=Math.max(this.ye-a,0);0<this.ye||-1===this.Pf||(this.Zg+=a,this.xd=new p(Bb(this.Pf),K.ra[this.Pf].y),c=this.gl,void 0!==c&&(b=ea(this.xd,this.Zi),c.Pa.x=c.hl.x+b.x,c.Pa.y=c.hl.y+b.y,c.Pa.Xd(a),this.Zg>.2*R.a.k.Wb.vi&&c.Pa.Mo(!0)),null!==this.T&&this.Zg>R.a.k.Wb.vi&&gi(this))};
e.Kb=function(a){var b,c,d,g,h,k=0,l,n=null,q,v=R.a.k.Wb.eh,D=R.a.k.Wb.gx;if(!(0<this.ye)&&this.Pf===a)if(this.Pf=-1,a=ea(this.xd,this.Zi).length(),c=this.Zg<R.a.k.Wb.vi&&30>a,b=this.gl,void 0===b)this.De.reset(),this.click(this.xd.x,this.xd.y);else if(b.Pa.Mo(!1),a=function(){!0===b.gn?(b.J.h[b.$]=b.Pa.h[0],b.J.ah(b.$,v,0,void 0,!0)):(k=b.J.h.length,b.J.h=b.J.h.concat(b.Pa.h),b.J.Xd(v,D,k))},c)a(),this.click(this.xd.x,this.xd.y);else{null!==this.T&&gi(this);d=c=!1;g=null;h=b.Pa.h[0];l=[b.Pa,{x:b.Pa.x,
y:b.Pa.y-W.height/2},this.xd];l=l.concat(Fh(b.Pa.h[0].Ub()));l=mi(l);for(q=0;q<l.length;q+=1)if(n=l[q].fb,n!==b.J||n.Fe&&!Wh(l[q].Sf,b.$))if(!n.Fe){k=n.h.length;if(1===b.Pa.h.length&&0<n.h.length&&(g=Qh(n),13===h.Xa+g.Xa)){d=!0;break}if(Ph(n,b.Pa.h)){c=!0;break}}else if(1===b.Pa.h.length&&(g=n.h[l[q].Sf],13===h.Xa+g.Xa)){d=!0;break}d?(pi(n,l[q].Sf),Kh(h),Kh(g,!0),I.play(Ye),this.fa(R.D.eb.fa.Cg),hi(R.D.eb.fa.Cg,this.xd.x,this.xd.y),qi(this),oi(),ki(this.kc,b.J,b.J.Fe?b.$:-1,null,h),ki(this.kc,n,l[q].Sf,
null,g),bi(this.De,v/2,!0)):c?(n.Xd(v,D,k),ki(this.kc,b.J,b.J.Fe?b.$:-1,n,b.Pa.h[0]),!0===n.Iv&&this.fa(R.D.eb.Xi.cp),I.play(We),qi(this),oi(),bi(this.De,v/2,!0)):(I.play(Ve),a(),bi(this.De,v))}};function qi(a){var b;if(null===R.D.Va.Lb.h[0]===!0){var c=ri();R.D.ey.stop();R.D.Hb.fp=0;b=new Vb;b.xa(c,function(){R.D.Zt.call(R.D)});b.start();Mb(b,["game","item"]);ii(a,20*c)}}function oi(){$h()?R.D.vh.Rn():R.D.vh.show()}
function ri(){var a=R.a.k.Ig.aa,b=Yh(!0,R.a.k.Ig.Zd,R.a.k.Ig.$d),c;for(c=0;c<b.length;c+=1){var d=b[c],g=c*a,h=90+(-45+ha.random(90));d.jz=new ci(d,g,h,-500);Hh(d,-1E3+c)}a=I.play(Se);I.fj(a,!0);I.stop(a,b.length*R.a.k.Ig.aa,bc);return b.length*R.a.k.Ig.aa+R.a.k.Ig.time}
e.click=function(a,b){var c,d=!1;if(K.ec-this.zo<=R.a.k.Wb.vi)ii(this,R.a.k.Wb.vi),this.zo=0;else if(!this.yq){var g=li(a,b);if(void 0===g)null!==this.T?(d=R.D.Va.gc,c=this.T.J.h[this.T.$],Rh(d).contains(a,b)?(0<=d.Vg&&d.h.length>=d.Vg?g=!1:Oh(d,Qh(d),c)?(d.h.push(c),g=!0):g=!1,g?(pi(this.T.J,this.T.$),d.Xd(R.a.k.Wb.eh),ki(this.kc,this.T.J,this.T.J.Fe?this.T.$:-1,d,c),I.play(We),qi(this),oi(),gi(this,c)):I.play(Ve)):(I.play(Ve),gi(this)),d=!0):Rh(R.D.Va.tc).contains(a,b)&&(ji(this),oi(),d=!0);else{var d=
!0,h=g.J.h[g.$];c=!1;if(13===h.Xa)!0===g.gn?(ki(this.kc,g.J,g.$,null,h),g.J.h[g.$]=null,c=!0):g.$===g.J.h.length-1&&(ki(this.kc,g.J,-1,null,h),g.J.pop(),c=!0),!0===c&&(Kh(h),g.J.ub(),this.De.reset(),null!==this.T&&gi(this),this.fa(R.D.eb.fa.Hk),I.play(Ye),hi(R.D.eb.fa.Hk,a,b),qi(this),oi());else if(null===this.T)this.T=g,this.T.J.wl(this.T.$,!0),I.play(Xe);else{c=this.T.J.h[this.T.$];var k=13===c.Xa+h.Xa;if(k){Kh(c);Kh(h);I.play(Ye);var l=g.J.Fe?g.$:-1;ki(this.kc,this.T.J,this.T.J.Fe?this.T.$:-1,
null,c);ki(this.kc,g.J,l,null,h);pi(this.T.J,this.T.$);pi(g.J,g.$);qi(this);oi();this.fa(R.D.eb.fa.Cg);hi(R.D.eb.fa.Cg,a,b)}else I.play(Ve);gi(this);this.De.reset();k||(this.T=g,this.T.J.wl(this.T.$,!0))}}this.zo=d?0:K.ec}};function pi(a,b){a.Fe?a.h[b]=null:a.pop();a.ub()}e.Ma=function(){this.canvas.W=!0;if(R.a.k.debug.Um&&null!==this.T){var a=this.T.J.h[this.T.$].Ub();ra(a.x,a.y,a.width,a.height,"yellow",!0)}};
function si(a,b,c,d,g){this.Kg=a;this.Uq=b;this.Vq=0<=b;this.rj=c;this.iy=d;this.jy=0<=d;this.Ua=g}
si.prototype.me=function(a){var b=R.a.k.Wb.eh;this.Vq?this.Kg.h[this.Uq]=this.Ua:this.Kg.h.push(this.Ua);var c=0;this.Kg===R.D.Va.tc&&this.Ua.open&&(c=a*R.a.k.Wb.eh/2,Jh(this.Ua,R.a.k.Wb.eh/2,c));null!==this.rj&&(this.jy?this.rj.h[this.iy]=null:this.rj.pop());this.Vq?this.Kg.ah(this.Uq,b,0,void 0,!0):this.Kg.ah(this.Kg.h.length-1,b,c,0<c,!0);if(0!==c){a=new Vb;var d=this;a.xa(c,function(){d.rj.ub()});a.start();Mb(a,["game","item"])}null===this.rj&&Mh(this.Ua);Hh(this.Ua,-999-da(ea(new p(this.Ua.x,
this.Ua.y),new p(this.Ua.Ue,this.Ua.Ve)))/100);ii(R.D.yg,c+b)};function fi(){this.Zj=[];this.fa=0}function ki(a,b,c,d,g){a.Zj.push(new si(b,c,d,-1,g))}fi.prototype.bi=function(a){this.fa+=a};fi.prototype.me=function(){R.D.Hb.bi(-this.fa);for(var a=R.a.k.Wb.eh,b=this.Zj.length-1;0<=b;--b)this.Zj[b].me(b);ii(R.D.yg,a);$h()?R.D.vh.Rn():R.D.vh.show()};function ti(){this.depth=10;this.i=this.visible=!1;M(this);Mb(this,["game"])}
ti.prototype.dr=function(){var a,b,c;a=[];b=[id,jd,kd,ld,md,nd];for(c=0;c<b.length;c+=1)a.push({f:b[c],text:R.m.K("TutorialText_"+c,"<TUTORIAL_TEXT_"+c+">"),title:R.m.K("TutorialTitle_"+c,"<TUTORIAL_TITLE_"+c+">")});return a};function ui(){this.depth=0;this.i=!1;this.visible=!0;R.b.Na(this,R.Be);this.a=R.a.k.Jv;M(this);Mb(this,["game"])}e=ui.prototype;
e.du=function(){var a;this.i=!0;this.Hb.setTime(this.eb.Sd.time);a=new Vb;a.xa(this.eb.fa.hp,function(){0<R.D.Hb.getTime()&&(R.D.Hb.bi(R.D.eb.fa.xo),0>R.D.Hb.Oe.X()&&sh(R.D.Hb,0))});a.fj(!0);a.start();Mb(a,["game","item"]);this.ey=a;this.Va.kb(R.a.k.debug.Px);this.yg.kb()};
e.Zt=function(){var a,b;this.i=!1;this.wh&&(this.wh.Za=!1);a=Math.round(R.D.Hb.getTime()/1E3);b=a%60;a=Math.round((a-b)/60)+":"+("00"+b.toString()).slice(-2);var c=R.D.eb.wn;b=[];b.push(TG_StatObjectFactory.Lm("bonusTime","number","levelEndScreenBonusTime",Math.round(R.D.Hb.getTime()/c.Am*c.ym),!0));0<c.fa&&b.push(TG_StatObjectFactory.Lm("bonusGameWon","number","levelEndScreenBonusGameWon",c.fa,!0));b.push(TG_StatObjectFactory.Lm("allCardsUsedBonus","number","levelEndScreenAllCardsUsedBonus",Zh(this.Va)?
c.xm:0,!0));b.push(TG_StatObjectFactory.Eu("number"));c=R.D.Hb.Oe.X();vi({failed:!1,Zc:new TG_StatObject("totalScore","number","levelEndScreenTotalScore_number",c,c,!0,!0),pb:b,totalScore:c,timeLeft:a})};e.Gi=function(){};
e.nc=function(){function a(){return 0<c.yg.ye?!1:(c.yg.me.call(c.yg),!0)}var b,c;$.Fv();$.ox(!0);yh();this.eb=R.a.k.Mr[Tf()];b=new hh;b.Qn=["background"];this.Hb=new ih(b);sh(this.Hb,this.eb.Sd.fa);this.Hb.setTime(0);(b=Yg())||(b=0);th(this.Hb,b);this.Va=new Xh;this.yg=new ei;c=this;"landscape"===R.orientation?wi(this,a):(this.Hb.buttons.undoButton.Gb=a,this.wh=null,this.vh=new xi(this.a.ry,this.a.ty,-100,!0));yi(R.m.K("levelStartHeader","<levelStartHeader>"),R.m.K("levelStartText","<levelStartText>"),
this.du,this)};function wi(a,b){var c,d;c=a.a.qy;d=a.a.sy;a.wh=new Bf(c,d,2,Tb(hd),[hd],b);a.wh.Za=!0;R.b.Na(a.wh,R.Rd);a.vh=new xi(c,d,1,!1)}e.fc=function(){var a=K,b,c=Nb(a,"item");for(b=0;b<c.length;b+=1)N(a,c[b]);N(K,this.Hb);N(K,this.wh);N(K,this.vh);$.Gq()};function xi(a,b,c,d){this.depth=c;this.ma=0;this.i=this.visible=!0;this.x=a;this.y=b;this.yu=1E3;this.time=this.duration=R.a.k.Ua.hk;this.hj=!1;M(this);Mb(this,["game","item"]);R.b.Na(this,R.Rd);this.kx=d||!1}
xi.prototype.Lc=function(a){this.time+=a};xi.prototype.show=function(){this.hj||(this.hj=!0,this.time=0)};xi.prototype.Rn=function(){this.hj&&(this.hj=!1,this.time=0)};xi.prototype.Ma=function(){var a=-(0+Math.sin(K.ec/this.yu*Math.PI*2)*(ee.width/4-0)),b;b=this.hj?this.time/this.duration:1-this.time/this.duration;0>b?b=0:1<b&&(b=1);!1===this.kx?ee.Yc(0,this.x+a-hd.width/4,this.y+hd.height/2,b):ee.V(0,this.x+hd.width/2,this.y+a-hd.height/4,1,1,90,b)};R.version=R.version||{};R.version.game="1.1.0";
R.version=R.version||{};R.version.theme="1.1.0";
var ah=S(14),bh=S(40),$g={},jh={background:{f:he,pr:S(0),qr:S(34),qu:!1,elements:[{f:de,x:S(46)+ah,y:S(9)+bh},{N:"game_ui_time_left",x:S(8)+ah,y:S(47)+bh,Cb:S(96),Jb:S(24),Cd:.2,font:Ie,Ae:{ud:"lower",align:"center",j:"middle"}},{N:"game_ui_SCORE",x:S(6)+ah,y:S(131)+bh,Cb:S(100),Jb:S(20),Cd:.2,font:Je,Ae:{ud:"lower",align:"center",j:"top"}},{N:"game_ui_HIGHSCORE",x:S(6)+ah,y:S(258)+bh,Cb:S(100),Jb:S(20),Cd:.2,font:Je,Ae:{ud:"lower",align:"center",j:"top"}}]},eb:{x:S(6)+ah,y:S(388)+bh,Cb:S(100),Jb:S(20),
Cd:.2,Tl:!1,separator:"",font:Je,Ae:{align:"center",j:"top",ud:"lower"}},Gg:{x:S(28)+ah,y:S(337)+bh,f:ae,images:[ae,be,ce],zg:!1,dt:!0},qs:{x:S(6)+ah,y:S(440)+bh},time:{x:S(6)+ah,y:S(77)+bh,Cb:S(100),Jb:S(38),Cd:.2,Tl:!1,separator:"",font:Ke,Ae:{fontSize:32,$b:2,align:"center",j:"top"}},fa:{x:S(6)+ah,y:S(155)+bh,Cb:S(100),Jb:S(24),ep:50,Cd:.2,Tl:!1,separator:"",font:Ke,Ae:{align:"center",j:"top"}},nr:{x:S(43,"round")+ah,y:S(212)+bh,f:bd,zg:!1,dt:!0},kr:{x:S(6)+ah,y:S(284)+bh,Cb:S(100),Jb:S(20),Cd:.2,
Tl:!1,separator:"",font:Ke,Ae:{align:"center",j:"top"}}};R.version=R.version||{};R.version.configuration_poki_api="1.0.0";R.l=R.l||{};R.l.qi=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
R.l.Bq=function(a,b,c,d){var g={};R.l.qi(a.Jj,g);g.fontSize=S(18);d=R.b.g(a.og,d.height,S(22));d=a.Wh-d;var h=R.m.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.Lj,a.og,a.Kj,S(22)),k=c(le,a.Yh,k-28),k=k+S(6),g={};R.l.qi(a.$h,g);g.fontSize=S(18);k=b("CoolGames\nwww.coolgames.com",g,a.qg,k,a.hf,S(44));C(Y.M(),g);k+=S(58)+Math.min(0,d-S(368));g={};R.l.qi(a.Jj,g);g.fontSize=S(20);g.fillColor="#1A2B36";h=R.m.K("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.Lj,
k,a.Kj,S(22));k+=S(6);k=c(me,a.Yh,k);k+=S(12);g={};R.l.qi(a.$h,g);g.fontSize=S(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.qg,k,a.hf,S(22));k+=S(16);g={};R.l.qi(a.$h,g);b("\u00a9 2020",g,a.qg,k,a.hf,S(44));return[]};R.l.Fi=function(){return[]};R.l.Fc=function(){R.e.Fc()};
R.l.yk=function(){function a(){__flagPokiInitialized?(function(){  /* function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})()  */ }(),R.e.Fc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=R.a.t.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};R.l.Mk=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};R.l.zk=function(){PokiSDK.gameLoadingFinished();R.e.Fc()};
R.l.Gs=function(a){try{R.e.Mn(),jb("master"),PokiSDK.commercialBreak().then(function(){R.e.Hi();kb("master");a()})["catch"](function(a){console.log("error"+a);R.e.Hi();kb("master")})}catch(b){console.log("error"+b),R.e.Hi()}};R.l.tr=function(){R.l.Gs(function(){PokiSDK.gameplayStart()})};R.l.Rg=function(){R.l.Gs(function(){R.e.Fc()})};R.l.Az=function(){PokiSDK.happyTime(.5)};R.l.sr=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
R.l.cr=function(a,b){void 0===R.e.Wd&&(R.e.Wd=new tf(!0));uf(a,b)};R.l.np=function(a){void 0===R.e.Wd&&(R.e.Wd=new tf(!0));vf(a)};R.l.dd=function(a){window.open(a)};R.l.ce=function(a){"inGame"===a&&PokiSDK.gameplayStop()};R.l.Cu=function(a){"inGame"===a&&PokiSDK.gameplayStart()};R.l.Ev=function(){};R=R||{};R.Tp=R.Tp||{};R.Tp.Hy={Wy:""};
function zi(){this.depth=-1E6;this.i=this.visible=!0;this.ma=R.Qd;this.end=this.na=this.Wn=this.Vn=this.load=this.kb=!1;this.cn=0;this.vp=this.xj=!1;this.state="GAME_INIT";this.screen=null;this.gs=this.sb=this.B=0;this.dn=!1;this.Kk=this.Lk=!0;this.Fw=1;this.Xc=!1;this.uc={};this.ea={difficulty:1,playMusic:!0,playSFX:!0,language:R.m.Cn()};window.addEventListener("gameSetPause",this.Mn,!1);window.addEventListener("gameResume",this.Hi,!1);document.addEventListener("visibilitychange",this.vv,!1);this.eg=
"timedLevelEvent"}e=zi.prototype;e.Mn=function(){I.pause("master");K.pause()};e.Hi=function(){I.ej("master");ub(K);zb(K);Fb(K);K.ej()};e.vv=function(){document.hidden?R.e.Mn():R.e.Hi()};
e.cm=function(){var a,b=this;void 0!==R.a.O.background&&void 0!==R.a.O.background.color&&(document.body.style.background=R.a.O.background.color);R.Ca=new Cf;R.u.Bk&&R.u.Bk.i&&(b.Ht=Xg(function(a){b.Ht=a}));R.n=R.a.k.zf||{};R.n.vd=R.n.vd||"level";R.n.gh=void 0!==R.n.gh?R.n.gh:"level"===R.n.vd;R.n.ca=void 0!==R.n.ca?R.n.ca instanceof Array?R.n.ca:[R.n.ca]:[20];R.n.si=void 0!==R.n.si?R.n.si:"locked";R.n.yl=void 0!==R.n.yl?R.n.yl:"difficulty"===R.n.vd;R.n.vj=void 0!==R.n.vj?R.n.vj:!1;R.n.Po=void 0!==
R.n.Po?R.n.Po:"level"===R.n.vd;R.n.Dg=void 0!==R.n.Dg?R.n.Dg:"max";R.n.Ko=void 0!==R.n.Ko?R.n.Ko:"number";R.l.cr(null,function(a){var d,g,h;a&&(b.uc=a);b.ea=Ef("preferences",{});b.ea.difficulty=void 0!==b.ea.difficulty?b.ea.difficulty:1;void 0!==R.n.gt&&0>R.n.gt.indexOf(Tf())&&(b.ea.difficulty=R.n.gt[0]);b.ea.playMusic=void 0!==b.ea.playMusic?b.ea.playMusic:!0;b.Qf(b.ea.playMusic);b.ea.playSFX=void 0!==b.ea.playSFX?b.ea.playSFX:!0;b.ll(b.ea.playSFX);b.ea.language=void 0!==b.ea.language&&R.m.Hv(b.ea.language)?
b.ea.language:R.m.Cn();R.m.Es(b.ea.language);void 0===bg(b.B,0,"state",void 0)&&Ai(b.B,0,"state","unlocked");if(R.n.gh)if("locked"===R.n.si)for(h=!1,d=0;d<R.n.ca.length;d++){for(a=0;a<R.n.ca[d];a++)if(g=bg(d,a,"state","locked"),"locked"===g){b.B=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.ea.lastPlayed&&(b.B=b.ea.lastPlayed.world||0)});b.xh=Bi();void 0!==b.xh.authToken&&void 0!==b.xh.challengeId&&(b.Xc=!0);R.u.sB&&(this.Fb=this.oB?new TestBackendServiceProvider:new BackendServiceProvider,
this.Fb.vr(function(a){a&&R.e.Fb.Iz(b.xh.authToken)}));a=parseFloat(m.q.version);I.Qa&&(m.La.wp&&m.q.Yk||m.q.mh&&a&&4.4>a)&&(I.Hj=1);this.kb=!0;this.Ck=0};function Bi(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function Ci(a){a.state="GAME_LOAD";a.screen=new Nf(function(){R.e.load=!0;Ng(R.e,!0);R.od.zk();R.l.zk()},function(a){R.od.Mk(a);R.l.Mk(a)},R.u.cB)}
function Ng(a,b){a.xj=b||!1;a.vp=!0;a.cn++}
function Di(){var a=R.e;a.cn--;switch(a.state){case "GAME_INIT":a.kb&&!a.uB&&(a.Xc&&a.Fb&&a.Fb.eB(a.xh.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Oo&&a.screen.Oo("challengeLoadingError_notValid")}),Ci(a));break;case "GAME_LOAD":if(a.load){if(a.Xc&&a.Fb)if(a.Fb.Gv())Rf(a),Uf(a.xc.mode);else{a.screen.Oo("challengeLoadingError_notStarted");break}N(K,a.screen);"function"===typeof ti&&(R.k=new ti);void 0!==R.u.dq&&!1!==R.u.dq.show&&R.b.fu();Mg(a)}break;case "LEVEL_INIT":a.Vn&&Ei(a);
break;case "LEVEL_LOAD":a.Wn&&Fi(a);break;case "LEVEL_END":if(a.na)switch(Lg(),R.e.Vn=!1,R.e.Wn=!1,R.D=void 0,R.b.Ff(R.Yq).W=!0,R.b.Ff(R.vk).W=!0,R.e.Cr){case "retry":Yf(R.e,R.e.sb);break;case "next":R.n.gh?R.e.sb+1<R.n.ca[R.e.B]?Yf(R.e,R.e.sb+1):R.e.B+1<R.n.ca.length?Yf(R.e,0,R.e.B+1):R.n.Po?(R.e.state="GAME_END",R.e.end=!0,Ng(R.e,!1),R.l.qv()):R.e.screen=new Xf:Yf(R.e,0);break;case "exit":R.n.gh?R.e.screen=new Xf:Mg(R.e)}break;case "GAME_END":a.end&&(a.end=!1,R.e.screen=null,R.e.screen=new Pg)}}
e.Fc=function(){R.e.vp=!1};function Gg(){var a;if(void 0!==R.e.xh.more_games)try{return a=decodeURIComponent(R.e.xh.more_games),function(){R.l.dd(a)}}catch(b){}if("string"===typeof R.bh.moreGamesUrl&&""!==R.bh.moreGamesUrl)return function(){R.l.dd(R.bh.moreGamesUrl)};if(void 0!==R.u.zw)return function(){R.l.dd(R.u.zw)};if("function"===typeof R.l.tv)return R.l.tv}function Rf(a){if(a.Xc&&void 0!==a.Fb)return void 0===a.xc&&(a.xc=a.Fb.vz()),a.xc}e.Bi=function(a){R.e.Xc&&R.e.Fb&&R.e.Fb.Bi(a)};
e.mi=function(a){R.e.Xc&&R.e.Fb&&R.e.Fb.mi(a)};function Tf(){return R.e.ea.difficulty}function Kg(){switch(Tf()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+Tf();}}function oh(){var a="optionsDifficulty_"+Kg();return R.m.K(a,"<"+a+">")}function Uf(a){R.e.ea.difficulty=a;Gf("preferences",R.e.ea)}e.Qf=function(a){void 0!==a&&(R.e.ea.playMusic=a,Gf("preferences",R.e.ea),a?kb("music"):jb("music"));return R.e.ea.playMusic};
e.ll=function(a){void 0!==a&&(R.e.ea.playSFX=a,Gf("preferences",R.e.ea),a?(kb("game"),kb("sfx")):(jb("game"),jb("sfx")));return R.e.ea.playSFX};e.language=function(a){void 0!==a&&(R.e.ea.language=a,Gf("preferences",R.e.ea));return R.e.ea.language};function Ai(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===R.e.uc["level_"+a+"_"+b]&&(R.e.uc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?R.e.uc["level_"+a+"_"+b][g]=d:R.e.uc["level_"+a+"_"+b][g][c]=d;R.l.np(R.e.uc)}
function bg(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=R.e.uc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function Ef(a,b){var c,d;"game"!==c&&(c="tg");d=R.e.uc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function Gf(a,b){var c;"game"!==c&&(c="tg");void 0===R.e.uc.game&&(R.e.uc.game={tg:{},game:{}});void 0===a?R.e.uc.game[c]=b:R.e.uc.game[c][a]=b;R.l.np(R.e.uc)}
function ig(a,b,c){var d=R.e;void 0===b&&(b=d.sb);void 0===c&&(c=d.B);return void 0===a?bg(c,b,"stats",{}):bg(c,b,"stats",{})[a]}function Yg(){var a=ig("highScore",void 0,void 0);return"number"!==typeof a?0:a}function Gi(){var a,b,c,d=0;for(a=0;a<R.n.ca.length;a++)for(b=0;b<R.n.ca[a];b++)c=ig(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function Mg(a){a.screen&&N(K,a.screen);a.screen=new Qf;a.sb=-1}
function yh(a,b,c,d){var g;g=void 0!==R.a.O.Ni&&void 0!==R.a.O.Ni.backgroundImage?R.a.O.Ni.backgroundImage:void 0!==R.a.t.Ni?R.a.t.Ni.backgroundImage:void 0;R.b.ob(R.Af);a=a||0;b=b||0;c=c||w.width;d=d||w.height;if(g)if(c=Math.min(Math.min(c,w.width),g.oi),d=Math.min(Math.min(d,w.height),g.Bg),void 0!==g){var h=a,k=b-R.bq,l,n,q;for(l=0;l<g.L;l+=1)n=l%g.Yg*g.width,q=g.height*Math.floor(l/g.Yg),n>h+c||n+g.width<h||q>k+d||q+g.height<k||g.ua(l,h-n,k-q,c,d,a,b,1)}else ra(a,b,c,d,"white",!1)}
function Yf(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.B=c);a.sb=b;a.Vn=!0;Ng(a,!1);R.l.rv()}function Ei(a){a.state="LEVEL_LOAD";a.Wn=!0;Ng(a,!1);R.l.sv()}
function Fi(a){var b;if(a.B<R.n.ca.length&&a.sb<R.n.ca[a.B]){a.state="LEVEL_PLAY";a.gs+=1;a.na=!1;a.screen=null;yh(0,R.bq);b=R.Ca;var c=Jg(a,3),d="progression:levelStarted:"+Kg(),g=a.eg,h;for(h=0;h<b.ba.length;h++)if(!b.ba[h].i){b.ba[h].p=0;b.ba[h].paused=0;b.ba[h].i=!0;b.ba[h].Xu=c;b.ba[h].Pw=d;b.ba[h].tag=g;break}h===b.ba.length&&b.ba.push({i:!0,p:0,paused:0,Xu:c,Pw:d,tag:g});b.Ya(c,d,void 0,R.da.hc.Ep);b.Ya("Start:","progression:levelStart:"+c,void 0,R.da.hc.zj);for(b=0;b<a.B;b++);R.l.tr(a.B,a.sb);
a.ea.lastPlayed={world:a.B,level:a.sb};R.D=new ui}}function cg(a,b,c){var d=0;void 0===b&&(b=a.B);void 0===c&&(c=a.sb);for(a=0;a<b;a++)d+=R.n.ca[a];return d+c}function yi(a,b,c,d){new Qg(a,b,c,d)}function Jg(a,b){var c,d=a.sb+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function vi(a){function b(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===R.n.Dg&&a>b||"min"===R.n.Dg&&a<b?!0:!1}var c=R.e;c.state="LEVEL_END";var d,g,h,k,l,n,q={},v=Jg(c,3);a=a||{};a.level=R.n.vj?c.sb+1:cg(c)+1;a.rr=!1;g=(d=bg(c.B,c.sb,"stats",void 0))||{};if(void 0!==a.Zc||void 0!==a.pb){void 0!==a.Zc&&(q[a.Zc.id]=a.Zc.M(),"highScore"===a.Zc.id&&(n=a.Zc));if(void 0!==a.pb)for(k=0;k<a.pb.length;k++)q[a.pb[k].id]=a.pb[k].M(),"highScore"===a.pb[k].id&&(n=a.pb[k]);for(k in q)l=q[k],void 0!==
l.$e&&(q[l.Dl].Hc=l.$e(q[l.Dl].Hc));void 0!==q.totalScore&&(h=q.totalScore.Hc)}else h=a.totalScore,void 0!==h&&void 0!==a.timeBonus&&(h+=a.timeBonus);k="";if(!0!==a.failed){k="Complete:";if(void 0!==h){R.Ca.Ya(k,"level:"+v,h,R.da.hc.zj);if(void 0===d||b(h,d.highScore))g.highScore=h,a.rr=!0,R.Ca.Ya("highScore",":score:"+Kg()+":"+v,h,R.da.hc.Yl);void 0!==n&&(n.Hc=g.highScore);a.highScore=g.highScore}if(void 0!==a.stars){if(void 0===g.stars||g.stars<a.stars)g.stars=a.stars;R.Ca.Ya("stars",":score:"+
Kg()+":"+v,a.stars,R.da.hc.Yl)}c.sb+1<R.n.ca[c.B]?"locked"===bg(c.B,c.sb+1,"state","locked")&&Ai(c.B,c.sb+1,"state","unlocked"):c.B+1<R.n.ca.length&&"locked"===bg(c.B+1,0,"state","locked")&&Ai(c.B+1,0,"state","unlocked");Ai(c.B,c.sb,void 0,{stats:g,state:"played"});void 0!==c.Fb&&(d=R.k&&R.k.lv?R.k.lv():Gi(),void 0!==d&&c.Fb.nB(d,R.n.Ko));If(R.Ca,c.eg,v,"progression:levelCompleted:"+Kg())}else R.Ca.Ya("Fail:","level:"+v,h,R.da.hc.zj),If(R.Ca,c.eg,v,"progression:levelFailed:"+Kg());var D={totalScore:h,
level:a.level,highScore:a.highScore,failed:!0===a.failed,stars:a.stars,stage:a.stage},c=function(a){R.e.na=!0;R.e.Cr=a;Ng(R.e,!0);R.l.Rg(D);R.od.Rg(D)};R.l.Zm&&R.l.Zm();void 0===a.customEnd&&new jg(R.n.vd,a,c)}e.gj=function(){R.e.ce(!0)};e.ce=function(a,b,c){var d="inGame";R.e.screen instanceof Qf?d="startScreen":R.e.screen instanceof Xf?d="levelMapScreen":b&&(d=R.e.xc.uq===R.e.xc.Gm?"inGame_challenger":"inGame_challengee");R.e.Jd||(R.e.Jd=new Dg(d,!0===a,b,c))};
function Dh(a){var b=[],c,d,g,h,k;R.e.Jd||R.e.se||(R.e.xc.uq===R.e.xc.Gm?(c=R.m.K("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",g="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=R.m.K(b,"<"+b.toUpperCase()+"<");R.e.se&&Ug(b);a&&wg()},h=function(){R.e.mi(k);return!0}):(c=R.m.K("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",g="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=R.m.K(b,"<"+b.toUpperCase()+"<");if(R.e.se&&(Ug(b),a)){var b=R.m.K("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",R.e.xc.tA[R.e.xc.Gm]),b=b.replace("<AMOUNT>",R.e.xc.tB),c=R.e.se,d,g,h,k;d=Y.M();c.a.at&&C(d,c.a.at);g=Pa(d,b,c.a.$w,c.a.Zw,!0);g<d.fontSize&&E(d,g);g=d.ha(b,c.a.Co)+10;h=d.U(b,c.a.Bo)+10;k=R.b.ta(c.a.ax,c.c.f.width,g,d.align);h=R.b.ta(c.a.bx,c.c.f.height-Tg(c),h,d.j);z(c.c.f);d.r(b,
k,h,g);A(c.c.f)}a&&wg()},h=function(){R.e.Bi(k);return!0}),b.push({N:d,S:h,la:R.e}),b.push({N:g,S:function(){R.e.se.close();R.e.se=null;return!0}}),R.e.se=new Sg(c,b,a),R.e.Jd=R.e.se)}e.wo=function(){var a,b;b=Nb(K,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].Nn&&b[a].Nn();Jf();Ob("game");Gb()};function wg(a){var b,c;c=Nb(K);for(b=0;b<c.length;b++)"function"===typeof c[b].Nn&&c[b].Nn();Ob();Gb();Jf();a&&(a.H=Math.max(0,a.H-1));Pb("system")}
function Cg(){var a,b;b=Nb(K);for(a=0;a<b.length;a++)"function"===typeof b[a].uv&&b[a].uv();Pb();a=K;for(b=0;b<a.pe.length;b+=1)a.pe[b].paused=Math.max(0,a.pe[b].paused-1);a=R.Ca;b=R.e.eg;var c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused-=1,a.ba[c].paused=Math.max(a.ba[c].paused,0))}function Lg(){var a;R.D&&N(K,R.D);for(a=Nb(K,"LevelStartDialog");0<a.length;)N(K,a.pop())}
function Hf(){var a="";R.version.builder&&(a=R.version.builder);R.version.tg&&(a+="-"+R.version.tg);R.version.game&&(a+="-"+R.version.game);R.version.config&&(a+="-"+R.version.config);return a}e.nc=function(){this.kb||(this.cm(),Ng(R.e,!0),R.od.yk(),R.l.yk())};
e.va=function(a){"function"===typeof this.Xq&&(this.Xq(),this.Xq||R.e.Fc());0<this.cn&&(this.xj||this.vp||Di());700>this.Ck&&(this.Ck+=a,700<=this.Ck&&(R.u.rB&&void 0!==R.u.Ci&&R.u.Ci.sk&&R.u.Ci.vl&&R.Ca.start([R.u.Ci.sk,R.u.Ci.vl]),void 0===bg(this.B,0,"state",void 0)&&Ai(this.B,0,"state","unlocked")))};e.bd=function(a,b){"languageSet"===a&&R.e.language(b)};e.Lc=function(){var a,b;for(a=0;a<R.Kd.length;a++)b=R.Kd[a],b.W&&(w.ob(b),w.clear())};
e.Ma=function(){var a;for(a=0;a<R.Kd.length;a++)R.Kd[a].W=!1};R.Hx=function(){R.e=new zi;M(R.e);Mb(R.e,"system")};(void 0===R.mu||R.mu)&&R.l.pv();zi.prototype.ce=function(a,b,c){var d="inGame";R.e.screen instanceof Qf?d="startScreen":R.e.screen instanceof Xf?d="levelMapScreen":b&&(d=R.e.xc.uq===R.e.xc.Gm?"inGame_challenger":"inGame_challengee");R.l.ce(d);R.e.Jd||(R.e.Jd=new Dg(d,!0===a,b,c))};Dg.prototype.close=function(){N(K,this);this.canvas.W=!0;R.l.Cu(this.type);return!0};
Ta.prototype.zd=function(a,b){var c,d,g,h=1,k=Ya(this,a);this.Ra[a]=b;this.jc[a]&&delete this.jc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.pa.indexOf(a)){for(g=0;g<d.pa.length;g+=1)void 0!==this.Ra[d.pa[g]]&&(h*=this.Ra[d.pa[g]]);h=Math.round(100*h)/100;if(this.bb){if(d=this.Gd[d.id])d.gain.value=h}else this.Qa&&(d.F.volume=h)}this.bb&&(d=this.Gd[a])&&(d.gain.value=b)};
}());
