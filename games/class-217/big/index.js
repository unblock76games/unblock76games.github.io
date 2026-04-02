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
var e,aa=document.getElementById("canvasBackground"),ba="big gameui_difficulty endscreen_level levelselectscreen game_mahjong theme_classic landscape poki_api final".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var m=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.A={};this.Na={};this.mf={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.A.opera=!0,this.A.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Na.op=!0,this.A.ol=!0,this.A.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.A.ol=!0,this.A.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.A.dA=!0,this.A.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.A.chrome=!0,this.A.version=f(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.A.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.A.fB=!0,this.A.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.A.gB=!0,this.A.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.A.Iq=!0,this.A.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Na.iA=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.A.Fs=!0,this.A.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.A.lh=!0,this.A.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.A.PA=!0,this.A.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.A.Zp=!0,this.A.version=c||
f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.A.Lt=!0,this.A.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.mf.uB=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.A.Xp=!0,this.A.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.A.ez=!0,this.A.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name=
"Safari",this.A.Do=!0,this.A.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.A.yB=!0,!this.A.version&&c&&(this.A.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.A.pA=!0,this.A.version=this.A.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.Fs?this.Na.Dz=!0:a&&(this.Na.Uk=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.op?c=f(this,
/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.Lt?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.Zp?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.Xp?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.ez&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Na.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.Fs)this.mf.at=!0;else if(g||"iphone"==a||"ipod"==a||b||this.Zp||this.Lt||this.Xp)this.mf.Yr=!0;this.Be={Uh:!1,hi:!1,x:!1};this.ol&&10<=this.A.version||this.chrome&&20<=this.A.version||
this.Iq&&20<=this.A.version||this.Do&&6<=this.A.version||this.opera&&10<=this.A.version||this.Uk&&this.Na.version&&6<=this.Na.version.split(".")[0]?this.Be.Uh=!0:this.ol&&10>this.A.version||this.chrome&&20>this.A.version||this.Iq&&20>this.A.version||this.Do&&6>this.A.version||this.opera&&10>this.A.version||this.Uk&&this.Na.version&&6>this.Na.version.split(".")[0]?this.Be.hi=!0:this.Be.x=!0;try{this.A.ne=this.A.version?parseFloat(this.A.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.A.ne=0}try{this.Na.ne=
this.Na.version?parseFloat(this.Na.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Na.ne=0}};function ca(a,b){this.x=a;this.y=b}e=ca.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.sq=function(a){var b=this.x-a.x;a=this.y-a.y;return Math.sqrt(b*b+a*a)};e.N=function(){return new ca(this.x,this.y)};e.add=function(a){return new ca(this.x+a.x,this.y+a.y)};e.scale=function(a){return new ca(a*this.x,a*this.y)};
e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new ca(a*this.x+b*this.y,-b*this.x+a*this.y)};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new ca(0,0):new ca(this.x/a,this.y/a)};function da(a){return(new ca(a.y,-a.x)).normalize()}
e.dc=function(a,b,c){var d=Math.min(8,this.length()/4),g;g=this.normalize().scale(2*d);g=new ca(this.x-g.x,this.y-g.y);var h=g.add(da(this).scale(d)),d=g.add(da(this).scale(-d)),k=p.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function ea(a){this.Pi=4294967296;this.Uh=1664525;this.hi=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Pi-1)):a}
ea.prototype.N=function(){var a=new ea;a.Pi=this.Pi;a.Uh=this.Uh;a.hi=this.hi;a.state=this.state;return a};ea.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Uh*this.state+this.hi)%this.Pi;return this.state/this.Pi*b};new ea;function fa(){this.qe="";this.ym=[];this.Th=[];this.Te=[];this.kg=[];this.Ac=[];this.ua("start");this.ua("load");this.ua("game")}function ha(a){var b=ia;b.qe=a;""!==b.qe&&"/"!==b.qe[b.qe.length-1]&&(b.qe+="/")}e=fa.prototype;
e.ua=function(a){this.Ac[a]||(this.Th[a]=0,this.Te[a]=0,this.kg[a]=0,this.Ac[a]=[],this.ym[a]=!1)};e.loaded=function(a){return this.Ac[a]?this.Te[a]:0};e.Mc=function(a){return this.Ac[a]?this.kg[a]:0};e.complete=function(a){return this.Ac[a]?this.Te[a]+this.kg[a]===this.Th[a]:!0};function ja(a){var b=ia;return b.Ac[a]?100*(b.Te[a]+b.kg[a])/b.Th[a]:100}function ka(a){var b=ia;b.Te[a]+=1;b.complete(a)&&la("Load Complete",{Ya:a})}function ma(a){var b=ia;b.kg[a]+=1;la("Load Failed",{Ya:a})}
function na(a,b,c){var d=ia;d.Ac[b]||d.ua(b);d.Ac[b].push(a);d.Th[b]+=c}e.Cd=function(a){var b;if(!this.ym[a])if(this.ym[a]=!0,this.Ac[a]&&0!==this.Ac[a].length)for(b=0;b<this.Ac[a].length;b+=1)this.Ac[a][b].Cd(a,this.qe);else la("Load Complete",{Ya:a})};var ia=new fa;function oa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.mb(a)}oa.prototype.mb=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};
oa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function pa(a,b,c,d,g,h){var k=p;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function qa(a,b,c,d){var g=p;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,d);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
oa.prototype.kc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};oa.prototype.da=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var p=new oa(aa);function ra(a,b,c){this.name=a;this.I=b;this.Rv=c;this.Bc=[];this.jn=[];na(this,this.Rv,this.I)}ra.prototype.Cd=function(a,b){function c(){ma(a)}function d(){ka(a)}var g,h;for(g=0;g<this.Bc.length;g+=1)h=this.jn[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.Bc[g].src=h,this.Bc[g].addEventListener("load",d,!1),this.Bc[g].addEventListener("error",c,!1)};
ra.prototype.complete=function(){var a;for(a=0;a<this.Bc.length;a+=1)if(!this.Bc[a].complete||0===this.Bc[a].width)return!1;return!0};function sa(a,b,c){0<=b&&b<a.I&&(a.Bc[b]=new Image,a.jn[b]=c)}ra.prototype.d=function(a,b){0<=a&&a<this.I&&(this.Bc[a]=b,this.jn[a]="")};ra.prototype.na=function(a,b,c,d,g,h,k,l,n){this.Bc[a]&&this.Bc[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&p.context.drawImage(this.Bc[a],b,c,d,g,h,k,l,n))};
function r(a,b,c,d,g,h,k,l,n,q){this.name=a;this.Hd=b;this.I=c;this.width=d;this.height=g;this.Gb=h;this.Hb=k;this.ki=l;this.xg=n;this.Zg=q;this.Dd=[];this.Ed=[];this.Fd=[];this.Vc=[];this.Uc=[];this.pd=[];this.qd=[]}e=r.prototype;e.d=function(a,b,c,d,g,h,k,l){0<=a&&a<this.I&&(this.Dd[a]=b,this.Ed[a]=c,this.Fd[a]=d,this.Vc[a]=g,this.Uc[a]=h,this.pd[a]=k,this.qd[a]=l)};e.complete=function(){return this.Hd.complete()};
e.q=function(a,b,c){a=(Math.round(a)%this.I+this.I)%this.I;this.Hd.na(this.Dd[a],this.Ed[a],this.Fd[a],this.Vc[a],this.Uc[a],b-this.Gb+this.pd[a],c-this.Hb+this.qd[a])};e.Ic=function(a,b,c,d){var g=p.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.I+this.I)%this.I;this.Hd.na(this.Dd[a],this.Ed[a],this.Fd[a],this.Vc[a],this.Uc[a],b-this.Gb+this.pd[a],c-this.Hb+this.qd[a]);g.globalAlpha=h};
e.ya=function(a,b,c,d,g,h,k){var l=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.I+this.I)%this.I,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,g),l.globalAlpha=k,this.Hd.na(this.Dd[a],this.Ed[a],this.Fd[a],this.Vc[a],this.Uc[a],this.pd[a]-this.Gb,this.qd[a]-this.Hb),l.restore())};
e.xq=function(a,b,c,d,g,h){var k=p.context,l=k.globalAlpha;0!==this.width&&0!==this.height&&(a=(Math.round(a)%this.I+this.I)%this.I,k.globalAlpha=h,d/=this.width,g/=this.height,this.Hd.na(this.Dd[a],this.Ed[a],this.Fd[a],this.Vc[a],this.Uc[a],b+d*this.pd[a],c+g*this.qd[a],d*this.Vc[a],g*this.Uc[a]),k.globalAlpha=l)};
e.na=function(a,b,c,d,g,h,k,l){var n=p.context,q=n.globalAlpha,w,A,E,s;a=(Math.round(a)%this.I+this.I)%this.I;w=this.pd[a];A=this.qd[a];E=this.Vc[a];s=this.Uc[a];b-=w;c-=A;0>=b+d||0>=c+g||b>=E||c>=s||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>E&&(d=E-b),c+g>s&&(g=s-c),n.globalAlpha=l,this.Hd.na(this.Dd[a],this.Ed[a]+b,this.Fd[a]+c,d,g,h,k),n.globalAlpha=q)};
e.cn=function(a,b,c,d,g,h,k,l,n,q,w,A){var E,s,t,u,v,J,ga,W,Z,Da;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),E=Math.ceil((q-b)/h),s=Math.ceil((w-c)/k),b+=l,c+=n,Z=0;Z<E;Z+=1)for(Da=0;Da<s;Da+=1)v=d,J=g,ga=h,W=k,t=b+Z*h,u=c+Da*k,t<l&&(v+=l-t,ga-=l-t,t=l),t+ga>=l+q&&(ga=l+q-t),u<n&&(J+=n-u,W-=n-u,u=n),u+W>=n+w&&(W=n+w-u),0<ga&&0<W&&this.na(a,v,J,ga,W,t,u,A)};e.mk=function(a,b,c,d,g,h,k,l,n,q){this.cn(a,0,0,b,c,d,g,h,k,l,n,q)};
e.lk=function(a,b,c,d,g,h,k,l,n,q){var w=p.context,A=w.globalAlpha,E,s,t,u,v,J;a=(Math.round(a)%this.I+this.I)%this.I;E=l/d;s=n/g;t=this.pd[a];u=this.qd[a];v=this.Vc[a];J=this.Uc[a];b-=t;c-=u;0>=b+d||0>=c+g||b>=v||c>=J||(0>b&&(d+=b,l+=E*b,h-=E*b,b=0),0>c&&(g+=c,n+=s*c,k-=s*c,c=0),b+d>v&&(l-=E*(d-v+b),d=v-b),c+g>J&&(n-=s*(g-J+c),g=J-c),w.globalAlpha=q,this.Hd.na(this.Dd[a],this.Ed[a]+b,this.Fd[a]+c,d,g,h,k,l,n),w.globalAlpha=A)};
e.wq=function(a,b,c,d,g,h,k,l,n,q,w){var A=p.context,E,s,t,u,v,J;0===Math.round(d)||0===Math.round(g)||1E-4>Math.abs(l)||1E-4>Math.abs(n)||(a=(Math.round(a)%this.I+this.I)%this.I,t=this.pd[a],u=this.qd[a],v=this.Vc[a],J=this.Uc[a],s=E=0,b-=t,c-=u,0>=b+d||0>=c+g||b>=v||c>=J||(0>b&&(d+=b,E-=b,b=0),0>c&&(g+=c,s-=c,c=0),b+d>v&&(d=v-b),c+g>J&&(g=J-c),A.save(),A.translate(h,k),A.rotate(-q*Math.PI/180),A.scale(l,n),A.globalAlpha=w,this.Hd.na(this.Dd[a],this.Ed[a]+b,this.Fd[a]+c,d,g,E,s),A.restore()))};
function ta(a,b,c){var d,g,h;for(d=0;d<a.I;d+=1)g=b+d%a.Zg*a.width,h=c+a.height*Math.floor(d/a.Zg),a.Hd.na(a.Dd[d],a.Ed[d],a.Fd[d],a.Vc[d],a.Uc[d],g-a.Gb+a.pd[d],h-a.Hb+a.qd[d])}function x(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Hb=this.Gb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.ql=void 0}e=x.prototype;
e.N=function(){var a=new x(this.width,this.height);a.Gb=this.Gb;a.Hb=this.Hb;y(a);this.q(0,0);z(a);return a};function y(a){a.ql=p.canvas;p.mb(a.canvas)}function z(a){p.canvas===a.canvas&&void 0!==a.ql&&(p.mb(a.ql),a.ql=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.q=function(a,b){p.context.drawImage(this.canvas,a-this.Gb,b-this.Hb)};
e.Ic=function(a,b,c){var d=p.context,g=d.globalAlpha;d.globalAlpha=c;p.context.drawImage(this.canvas,a-this.Gb,b-this.Hb);d.globalAlpha=g};e.ya=function(a,b,c,d,g,h){var k=p.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,p.context.drawImage(this.canvas,-this.Gb,-this.Hb),k.restore())};
e.xq=function(a,b,c,d,g){var h=p.context,k=h.globalAlpha;0!==this.width&&0!==this.height&&0!==Math.round(c)&&0!==Math.round(d)&&(h.globalAlpha=g,p.context.drawImage(this.canvas,a,b,c,d),h.globalAlpha=k)};e.na=function(a,b,c,d,g,h,k){var l=p.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,p.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),l.globalAlpha=n)};
e.cn=function(a,b,c,d,g,h,k,l,n,q,w){var A,E,s,t,u,v,J,ga,W,Z;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),A=Math.ceil((n-a)/g),E=Math.ceil((q-b)/h),a+=k,b+=l,W=0;W<A;W+=1)for(Z=0;Z<E;Z+=1)u=c,v=d,J=g,ga=h,s=a+W*g,t=b+Z*h,s<k&&(u+=k-s,J-=k-s,s=k),s+J>=k+n&&(J=k+n-s),t<l&&(v+=l-t,ga-=l-t,t=l),t+ga>=l+q&&(ga=l+q-t),0<J&&0<ga&&this.na(u,v,J,ga,s,t,w)};
e.mk=function(a,b,c,d,g,h,k,l,n){this.cn(0,0,a,b,c,d,g,h,k,l,n)};e.lk=function(a,b,c,d,g,h,k,l,n){var q=p.context,w=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,p.context.drawImage(this.canvas,a,b,c,d,g,h,k,l),q.globalAlpha=w))};
e.wq=function(a,b,c,d,g,h,k,l,n,q){var w=p.context;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),1E-4>Math.abs(k)||1E-4>Math.abs(l)||(w.save(),w.translate(g,h),w.rotate(-n*Math.PI/180),w.scale(k,l),w.globalAlpha=q,p.context.drawImage(this.canvas,a,b,c,d,0,0,c,d),w.restore()))};
function ua(a,b,c,d){this.t=a;this.yz=b;this.gz=c;this.Aj=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.Xs=!1;na(this,d,1)}function va(a,b,c){p.context.save();p.context.font="250pt "+a+", "+b;a=p.context.measureText(c).width;p.context.restore();return a}
function wa(a){var b,c,d;for(b=0;b<a.Aj.length;b+=1)if(c=a.Aj[b],d=va(a.t,c.font,c.text),c.width!==d){ka(a.Qv);document.body.removeChild(a.oe);a.Xs=!0;return}window.setTimeout(function(){wa(a)},33)}
ua.prototype.Cd=function(a,b){var c="@font-face {font-family: "+this.t+";src: url('"+b+this.yz+"') format('woff'), url('"+b+this.gz+"') format('truetype');}",d=document.createElement("style");d.id=this.t+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.oe=document.createElement("span");this.oe.style.position="absolute";this.oe.style.left="-9999px";this.oe.style.top="-9999px";this.oe.style.visibility=
"hidden";this.oe.style.fontSize="250pt";this.oe.id=this.t+"_loader";document.body.appendChild(this.oe);for(c=0;c<this.Aj.length;c+=1)d=this.Aj[c],d.width=va(d.font,d.font,d.text);this.Qv=a;wa(this)};ua.prototype.complete=function(){return this.Xs};
function B(a,b){this.t=a;this.si=b;this.fontWeight=this.fontStyle="";this.Vd="normal";this.fontSize=12;this.fill=!0;this.nf=1;this.Nc=0;this.fillColor="black";this.fd={f:void 0,Eb:0,xo:!0,yo:!0};this.Wa={tj:!0,I:3,fk:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Xf=1;this.mh=0;this.strokeColor="black";this.strokeStyle=void 0;this.Tc=1;this.je=!1;this.Yf="miter";this.T={j:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.h="top";
this.aa=this.be=0}e=B.prototype;
e.N=function(){var a=new B(this.t,this.si);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.Vd=this.Vd;a.fontSize=this.fontSize;a.fill=this.fill;a.nf=this.nf;a.Nc=this.Nc;a.fillColor=this.fillColor;a.fd={f:this.fd.f,xo:this.fd.xo,yo:this.fd.yo};a.Wa={tj:this.Wa.tj,I:this.Wa.I,fk:this.Wa.fk.slice(0),size:this.Wa.size,offset:this.Wa.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Xf=this.Xf;a.mh=this.mh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.Tc=this.Tc;a.je=
this.je;a.Yf=this.Yf;a.T={j:this.T.j,color:this.T.color,offsetX:this.T.offsetX,offsetY:this.T.offsetY,blur:this.T.blur};a.align=this.align;a.h=this.h;a.be=this.be;a.aa=this.aa;return a};
function C(a,b){void 0!==b.t&&(a.t=b.t);void 0!==b.si&&(a.si=b.si);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.Vd&&(a.Vd=b.Vd);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.nf&&(a.nf=b.nf);void 0!==b.fillColor&&(a.Nc=0,a.fillColor=b.fillColor);void 0!==b.fd&&(a.Nc=1,a.fd=b.fd);void 0!==b.Wa&&(a.Nc=2,a.Wa=b.Wa);void 0!==b.fillStyle&&(a.Nc=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Xf&&(a.Xf=b.Xf);void 0!==b.strokeColor&&(a.mh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.mh=3,a.strokeStyle=b.strokeStyle);void 0!==b.Tc&&(a.Tc=b.Tc);void 0!==b.je&&(a.je=b.je);void 0!==b.Yf&&(a.Yf=b.Yf);void 0!==b.T&&(a.T=b.T);void 0!==b.align&&(a.align=b.align);void 0!==b.h&&(a.h=b.h);void 0!==b.be&&(a.be=b.be);void 0!==b.aa&&(a.aa=b.aa)}function xa(a,b){a.fontWeight=void 0===b?"":b}function D(a,b){a.fontSize=void 0===b?12:b}
function ya(a,b){a.nf=void 0===b?1:b}e.setFillColor=function(a){this.Nc=0;this.fillColor=void 0===a?"black":a};function za(a,b,c,d,g){a.Nc=2;a.Wa.tj=!0;a.Wa.I=b;a.Wa.fk=c.slice(0);a.Wa.size=void 0===d?.6:d;a.Wa.offset=void 0===g?0:g}function Aa(a,b){a.stroke=void 0===b?!1:b}function Ba(a,b){a.Xf=void 0===b?1:b}e.setStrokeColor=function(a){this.mh=0;this.strokeColor=void 0===a?"black":a};function Ca(a,b){a.Tc=void 0===b?1:b}function Ea(a,b){a.je=void 0===b?!1:b}
function Fa(a,b){a.Yf=void 0===b?"miter":b}function Ga(a,b,c){void 0===b?a.T.j=!0:a.T={j:!0,color:b,offsetX:0,offsetY:c,blur:2}}function F(a,b){a.align=void 0===b?"left":b}function G(a,b){a.h=void 0===b?"top":b}function Ha(a,b){a.be=void 0===b?0:b}function Ia(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.t+", "+a.si}function Ja(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Ka(a,b){return a.fontSize*b.length+a.aa*(b.length-1)}
function La(a,b,c){var d,g,h,k,l,n,q=[],w=p.context;w.font=Ia(a);switch(a.Vd){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:w.measureText(n[a]).width});return q}n=b.split("\n");h=w.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];l=w.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=w.measureText(g[b]).width,l+h+k<c?(d+=" "+g[b],l+=h+k):(q.push({text:d,width:l}),d=g[b],l=k);
q.push({text:d,width:l})}return q}e.da=function(a,b){var c;p.context.save();c=Ja(La(this,a,b));p.context.restore();return c};e.W=function(a,b){var c;p.context.save();c=Ka(this,La(this,a,b));p.context.restore();return c};function Ma(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?La(a,c,d):La(a,c);d=Ja(b)<=d&&Ka(a,b)<=g;a.fontSize=k;return d}
function Na(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(p.context.save();Ma(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Ma(a,h+k,b,c,d,g)&&(h+=k);p.context.restore();return Math.max(4,h)}function Pa(a,b,c,d,g){var h=Math.max(.01,a.Wa.size),k=a.Wa.offset;a.Wa.tj?(k=g/2+k*g,h=.5*h*g,b=p.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=p.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.Wa.I-1);for(d=0;d<a.Wa.I;d+=1)b.addColorStop(d*c,a.Wa.fk[d]);return b}
function Qa(a,b,c,d,g,h,k){var l,n;!a.fill&&a.T.j?(b.shadowColor=a.T.color,b.shadowOffsetX=a.T.offsetX,b.shadowOffsetY=a.T.offsetY,b.shadowBlur=a.T.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Xf;switch(a.mh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.Tc;b.lineJoin=a.Yf;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.aa*k;b.strokeText(c[k].text,d+l,g+n)}}
function Ra(a,b,c,d,g,h,k){c=La(a,c,k);k=Ja(c);var l=Ka(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.h){case "base":case "bottom":g+=-l+Math.round(a.be*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.be*a.fontSize/2)}b.font=Ia(a);a.stroke&&a.je&&Qa(a,b,c,d,g,k,h);if(a.fill){var n=d,q=g,w,A;a.T.j?(b.shadowColor=a.T.color,b.shadowOffsetX=a.T.offsetX,b.shadowOffsetY=a.T.offsetY,b.shadowBlur=a.T.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.nf;switch(a.Nc){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.fd.f;A=new x(l.width,l.height);var E=a.fd.xo,s=a.fd.yo;E&&s?w="repeat":E&&!s?w="repeat-x":!E&&s?w="repeat-y":E||s||(w="no-repeat");y(A);l.q(a.fd.Eb,0,0);z(A);w=p.context.createPattern(A.canvas,w);b.fillStyle=w;break;case 2:b.fillStyle=Pa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(w=0;w<c.length;w+=1){l=0;switch(a.align){case "right":l=
k-c[w].width;break;case "center":l=(k-c[w].width)/2}A=a.fontSize*(w+1)+a.aa*w;2===a.Nc&&a.Wa.tj&&(b.fillStyle=Pa(a,n,q+A-a.fontSize,k,a.fontSize));b.fillText(c[w].text,n+l,q+A)}}a.stroke&&!a.je&&Qa(a,b,c,d,g,k,h)}e.q=function(a,b,c,d){var g=p.context;this.fill&&1===this.Nc?this.ya(a,b,c,1,1,0,1,d):(g.save(),Ra(this,g,a,b,c,1,d),g.restore())};e.Ic=function(a,b,c,d,g){var h=p.context;this.fill&&1===this.Nc?this.ya(a,b,c,1,1,0,d,g):(h.save(),Ra(this,h,a,b,c,d,g),h.restore())};
e.ya=function(a,b,c,d,g,h,k,l){var n=p.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Ra(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Sa(){this.gw=10;this.Ej=-1;this.Xt="stop_lowest_prio";this.Up=this.Qa=this.Za=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.Za=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Qa=!0)}catch(d){}this.Up=this.Za||this.Qa;this.Qa&&m.A.lh&&(this.Ej=1);if(this.Up)try{a=new Audio,this.Dp={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Dp={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.$b=[];this.Se={};this.Ra={};this.ic={};this.Jd=
[];this.hc=0;this.Za?(this.Id=new c,this.Ep="function"===typeof this.Id.createGain?function(){return b.Id.createGain()}:"function"===typeof this.Id.createGainNode?function(){return b.Id.createGainNode()}:function(){},this.Kd={},this.Dj=this.Ep(),void 0===this.Dj?(this.Qa=!0,this.Fh=Sa.prototype.xm):(this.Dj.connect(this.Id.destination),this.Kd.master=this.Dj,this.Fh=Sa.prototype.Wt)):this.Fh=this.Qa?Sa.prototype.xm:function(){}}
function Ta(a){var b=H,c,d,g,h,k;for(c=0;c<b.$b.length;c+=1)if((d=b.$b[c])&&0===d.fn)if(d.paused)d.Ip&&(d.zm+=a,d.zm>=d.Ip&&b.$i(d.id));else if(d.Am+=a,d.jg&&d.Am>=d.Ns)d.jg=!1,Ua(b,d,d.Md);else if(d.tc&&b.Qa&&b.Bn(d.id)>=d.duration)if(d.Yn)try{d.J.pause(),d.J.currentTime=d.Md/1E3,4===d.J.readyState?d.J.play():(g=function(){var a=d;return{ready:function(){a.J.play();a.J.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.J.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else d.J.pause(),
Va(d);for(c=b.Jd.length-1;0<=c;c-=1)h=b.Jd[c],b.qr(h.id)||0!==h.fn||(h.n+=a,h.n>=h.duration?(H.Bd(h.id,h.ij),void 0!==b.ic[h.id]&&(b.ic[h.id]=h.ij),h.pb&&h.pb(),b.Jd.splice(c,1)):(k=h.Oa(h.n,h.start,h.ij-h.start,h.duration),H.Bd(h.id,k),void 0!==b.ic[h.id]&&(b.ic[h.id]=k)))}function Wa(a,b){a.Se[b.wc.w.name]?a.Se[b.wc.w.name].length<a.gw&&a.Se[b.wc.w.name].push(b.J):a.Se[b.wc.w.name]=[b.J]}
function Xa(a,b){var c,d,g;g=[];for(c=0;c<a.$b.length;c+=1)(d=a.$b[c])&&0<=d.pa.indexOf(b)&&g.push(d);return g}function Ya(a,b){if(0<a.Ej&&a.hc>=a.Ej)switch(a.Xt){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.$b.length;c+=1)(d=a.$b[c])&&d.tc&&!d.paused&&(void 0===g||g.Bl<d.Bl)&&(g=d);if(g.Bl>b.Ph){a.stop(g.id);break}return!1}return!0}
function Za(a,b){var c,d=1;for(c=0;c<b.pa.length;c+=1)void 0!==H.Ra[b.pa[c]]&&(d*=H.Ra[b.pa[c]]);c=a.Ep();c.gain.value=d;c.connect(a.Dj);a.Kd[b.id]=c;b.J.connect(c)}function $a(a,b){b.J.disconnect(0);a.Kd[b.id]&&(a.Kd[b.id].disconnect(0),delete a.Kd[b.id])}function ab(a,b){var c;if(b.w&&b.w.Nb){if(a.Za)return c=a.Id.createBufferSource(),c.buffer=b.w.Nb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Qa)return c=b.w.Nb.cloneNode(!0),c.volume=0,c}}
function bb(a,b){var c,d;if(a.Za)(c=ab(a,b))&&(d=new cb(b,c));else if(a.Qa){c=a.Se[b.w.name];if(!c)return;0<c.length?d=new cb(b,c.pop()):(c=ab(a,b))&&(d=new cb(b,c))}if(d){a.Za&&Za(a,d);for(c=0;c<a.$b.length;c+=1)if(void 0===a.$b[c])return a.$b[c]=d;a.$b.push(d)}return d}function db(a){var b=H,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Dp[d])return a[c];return!1}e=Sa.prototype;
e.xm=function(a,b,c){function d(){var b;a.loaded=!0;ka(c);a.duration=Math.ceil(1E3*a.Nb.duration);a.Nb.removeEventListener("canplaythrough",d,!1);a.Nb.removeEventListener("error",g,!1);b=a.Nb.cloneNode(!0);H.Se[a.name].push(b)}function g(){ma(c)}(b=db(b))?(a.Nb=new Audio,a.Nb.src=b,a.Nb.autoplay=!1,a.Nb.QA="auto",a.Nb.addEventListener("canplaythrough",d,!1),a.Nb.addEventListener("error",g,!1),a.Nb.load()):g()};
e.Wt=function(a,b,c){var d=db(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){H.Id.decodeAudioData(g.response,function(b){b&&(a.Nb=b,a.duration=1E3*b.duration,a.loaded=!0,ka(c))},function(){ma(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(H.Za=!1,H.Qa=!0,H.Fh=Sa.prototype.xm,H.Fh(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof eb){if(Ya(this,a)){a=bb(this,a);if(!a)return-1;a.Ns=b||0;a.jg=0<b;a.rb=c||0;a.Ud=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.jg||Ua(this,a,a.Md);return a.id}return-1}};
function Ua(a,b,c){var d;"number"!==typeof c&&(c=0);fb(a,b.id);0<b.rb&&(d=gb(a,b.id),a.Bd(b.id,0),hb(a,b.id,d,b.rb,b.Ud),b.rb=0,b.Ud=void 0);if(a.Za){d=c-b.Md;b.Yt=1E3*a.Id.currentTime-d;b.J.onended=function(){Va(b)};try{b.J.start?b.J.start(0,c/1E3,(b.duration-d)/1E3):b.J.noteGrainOn&&b.J.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.td=!0,b.tc=!0,a.hc+=1,b.J.loop=b.Yn}catch(g){}}else if(a.Qa){if(4!==b.J.readyState){var h=function(){return{ready:function(){b.J.currentTime=c/1E3;b.J.play();b.td=!0;b.J.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.J.addEventListener("canplaythrough",h.ready,!1)}else b.J.currentTime=c/1E3,b.J.play(),b.td=!0;b.tc=!0;a.hc+=1}}
e.$i=function(a,b,c,d){var g,h,k,l,n=Xa(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.tc)&&!d||!h.paused&&d){if(!d){for(g=this.Jd.length-1;0<=g;g-=1)if(a=this.Jd[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.rb=b||0;h.Ud=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.Dh&&(void 0===b&&(h.rb=h.Dh.duration),void 0===c&&(h.Ud=h.Dh.Oa),k=h.Dh.gain,h.Dh=void 0)}this.Za&&(a=ab(this,h.wc))&&(h.J=a,Za(this,h));void 0!==k&&H.Bd(h.id,k);Ua(this,h,h.Md+(h.Fj||0));void 0!==l&&
(H.Bd(h.id,l.Oa(l.n,l.start,l.ij-l.start,l.duration)),hb(H,h.id,l.ij,l.duration-l.n,l.Oa,l.pb))}};
e.pause=function(a,b,c,d,g){var h,k,l=Xa(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.rb=c||0,0<h.rb)h.Ud=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.Dh={gain:ib(h.id),duration:h.rb,Oa:h.Ud},hb(H,h.id,0,h.rb,h.Ud,function(){H.pause(h.id,b)});else if(k=this.Bn(h.id),h.Fj=k,g||(h.paused=!0,h.zm=0,h.Ip=b,this.hc-=1),this.Za){h.J.onended=function(){};if(h.tc&&h.td){try{h.J.stop?h.J.stop(0):h.J.noteOff&&h.J.noteOff(0)}catch(n){}h.td=!1}$a(this,h)}else this.Qa&&h.J.pause()};
function Va(a){var b=H;b.Ra[a.id]&&delete b.Ra[a.id];a.paused||(b.hc-=1);b.Za?(a.td=!1,a.tc=!1,$a(b,a)):b.Qa&&Wa(b,a);b.$b[b.$b.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=Xa(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.rb=b||0,0<d.rb)d.Ud=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},hb(H,d.id,0,d.rb,d.Ud,function(){H.stop(d.id)});else{this.Ra[d.id]&&delete this.Ra[d.id];d.tc&&!d.paused&&(this.hc-=1);if(this.Za){if(d.tc&&!d.paused&&!d.jg){if(d.td){try{d.J.stop?d.J.stop(0):d.J.noteOff&&d.J.noteOff(0)}catch(h){}d.td=!1}$a(this,d)}}else this.Qa&&(d.jg||d.J.pause(),Wa(this,d));this.$b[this.$b.indexOf(d)]=void 0;d.tc=!1}};
function hb(a,b,c,d,g,h){var k;for(k=0;k<a.Jd.length;k+=1)if(a.Jd[k].id===b){a.Jd.splice(k,1);break}a.Jd.push({id:b,ij:c,Oa:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,n:0,start:gb(a,b),pb:h,fn:0})}function jb(a){var b=H,c;void 0===b.ic[a]&&(c=void 0!==b.Ra[a]?b.Ra[a]:1,b.Bd(a,0),b.ic[a]=c)}function kb(a){var b=H;void 0!==b.ic[a]&&(b.Bd(a,b.ic[a]),delete b.ic[a])}
e.position=function(a,b){var c,d,g,h,k=Xa(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.Za)if(d.paused)d.Fj=b;else{d.J.onended=function(){};if(d.td){try{d.J.stop?d.J.stop(0):d.J.noteOff&&d.J.noteOff(0)}catch(l){}d.td=!1}$a(this,d);this.hc-=1;if(g=ab(this,d.wc))d.J=g,Za(this,d),Ua(this,d,d.Md+b)}else this.Qa&&(4===d.J.readyState?d.J.currentTime=(d.Md+b)/1E3:(h=function(){var a=d,c=b;return{Zq:function(){a.J.currentTime=(a.Md+c)/1E3;a.J.removeEventListener("canplaythrough",
h.Zq,!1)}}}(),d.J.addEventListener("canplaythrough",h.Zq,!1)))};e.Ao=function(a){H.position(a,0)};e.Cs=function(a,b){var c,d=Xa(this,a);for(c=0;c<d.length;c+=1)d[c].Yn=b,this.Za&&(d[c].J.loop=b)};function gb(a,b){return void 0!==a.Ra[b]?a.Ra[b]:1}function ib(a){var b=H,c=1,d=Xa(b,a)[0];if(d)for(a=0;a<d.pa.length;a+=1)void 0!==b.Ra[d.pa[a]]&&(c*=b.Ra[d.pa[a]]);return Math.round(100*c)/100}
e.Bd=function(a,b){var c,d,g,h=1,k=Xa(this,a);this.Ra[a]=b;this.ic[a]&&delete this.ic[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.pa.indexOf(a)){for(g=0;g<d.pa.length;g+=1)void 0!==this.Ra[d.pa[g]]&&(h*=this.Ra[d.pa[g]]);h=Math.round(100*h)/100;this.Za?this.Kd[d.id].gain.value=h:this.Qa&&(d.J.volume=h)}};
function fb(a,b){var c,d,g,h=1,k=Xa(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.pa.length;g+=1)void 0!==a.Ra[d.pa[g]]&&(h*=a.Ra[d.pa[g]]);h=Math.round(100*h)/100;a.Za?a.Kd[d.id].gain.value=h:a.Qa&&(d.J.volume=h)}}e.Op=function(a,b){var c,d,g,h=Xa(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.pa.indexOf(b[g])&&d.pa.push(b[g]);fb(this,a)};e.qr=function(a){if(a=Xa(this,a)[0])return a.paused};
e.Bn=function(a){if(a=Xa(this,a)[0]){if(this.Za)return a.paused?a.Fj:(1E3*H.Id.currentTime-a.Yt)%a.duration;if(H.Qa)return Math.ceil(1E3*a.J.currentTime-a.Md)}};var H=new Sa;function lb(a,b,c,d){this.name=a;this.Lw=b;this.bx=c;this.rc=d;this.loaded=!1;this.Nb=null;na(this,this.rc,1)}
lb.prototype.Cd=function(a,b){var c,d;c=this.Lw;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.bx;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);H.Se[this.name]=[];H.Fh(this,[d,c],a)};lb.prototype.complete=function(){return this.loaded};
function eb(a,b,c,d,g,h,k){this.name=a;this.w=b;this.startOffset=c;this.duration=d;H.Bd(this.name,void 0!==g?g:1);this.Ph=void 0!==h?h:10;this.pa=[];k&&(this.pa=this.pa.concat(k));0>this.pa.indexOf(this.name)&&this.pa.push(this.name)}eb.prototype.complete=function(){return this.w.complete()};eb.prototype.Bl=function(a){void 0!==a&&(this.Ph=a);return this.Ph};eb.prototype.Op=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.pa.indexOf(a[b])&&this.pa.push(a[b])};
function cb(a,b){this.wc=a;this.Md=this.wc.startOffset;this.J=b;this.duration=this.wc.duration;this.vm()}cb.prototype.vm=function(){this.id=Math.round(Date.now()*Math.random())+"";this.pa=["master",this.id].concat(this.wc.pa);this.Bl=void 0!==this.wc.Ph?this.wc.Ph:10;this.paused=this.tc=this.Yn=!1;this.Am=this.fn=0;this.td=this.jg=!1;this.Ns=this.Fj=0;var a,b=1;for(a=0;a<this.pa.length;a+=1)void 0!==H.Ra[this.pa[a]]&&(b*=H.Ra[this.pa[a]]);!H.Za&&H.Qa&&(this.J.volume=b)};
function mb(a,b){this.name=a;this.fileName=b;this.info=void 0}function nb(a){this.name=a;this.text="";this.Mc=this.complete=!1}nb.prototype.Te=function(a){4===a.readyState&&(this.complete=!0,(this.Mc=200!==a.status)?la("Get Failed",{name:this.name}):(this.text=a.responseText,la("Get Complete",{name:this.name})))};
function ob(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.Mc=200!==c.status,a.Mc?la("Post Failed",{name:a.name}):la("Post Complete",{name:a.name}))};c.send(a.text)}function pb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.Mc=200!==c.status;if(a.Mc)return!1;a.text=c.responseText;return!0}
function qb(a){a&&(this.$d=a);this.clear();this.Mh=this.mg=this.Zc=this.Lh=this.Kh=this.Oh=this.Hh=this.Nh=this.Ld=this.Jh=this.Ih=0;rb(this,this);sb(this,this);tb(this,this);this.pe=[];this.zh=[];this.Rh=[];this.P=0;this.Jp=!1;this.Yk=this.startTime=Date.now();this.Wf=this.Ek=0;this.hw=200;this.rc="";window.xj(window.Ap)}qb.prototype.clear=function(){this.H=[];this.Sh=!1;this.vb=[];this.um=!1};
function rb(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.$d&&!(0<b.P)&&(d=b.$d,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.ig.x=h,b.ig.y=d,b.Bh.push({x:b.ig.x,y:b.ig.y}),0<b.Lh))for(a=b.H.length-1;0<=a&&!((h=b.H[a])&&h.j&&0>=h.P&&h.Gn&&(h=h.Gn(b.ig.x,b.ig.y),!0===h));a-=1);},!1);ub(a)}function ub(a){a.ig={x:0,y:0};a.Bh=[]}
function sb(a,b){window.addEventListener("mousedown",function(a){0<b.P||(a.preventDefault(),window.focus(),b.Hp>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),wb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.P||(a.preventDefault(),b.Cj>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),xb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.P||(a.preventDefault(),vb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Hp=Date.now();
if(!(0<b.P))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),wb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.Cj=Date.now();if(!(0<b.P))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.P))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.Cj=Date.now();if(!(0<b.P))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.Cj=Date.now();if(!(0<b.P))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){yb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){yb(b,a)},!1);zb(a);a.Hp=0;a.Cj=0}function zb(a){var b;a.ka=[];for(b=0;16>b;b+=1)a.ka[b]={id:-1,qb:!1,x:0,y:0};a.We=[]}function Ab(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.ka[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.ka[d].qb){c=d;a.ka[d].id=b;break}return c}
function vb(a,b,c,d){var g,h;void 0!==a.$d&&(b=Ab(a,b),-1!==b&&(g=a.$d,h=g.getBoundingClientRect(),a.ka[b].x=g.width/h.width*(c-h.left),a.ka[b].y=g.height/h.height*(d-h.top)))}function wb(a,b){var c=Ab(a,b),d,g;if(-1!==c&&!a.ka[c].qb&&(a.We.push({of:c,x:a.ka[c].x,y:a.ka[c].y,qb:!0}),a.ka[c].qb=!0,0<a.Zc))for(d=a.H.length-1;0<=d&&!((g=a.H[d])&&g.j&&0>=g.P&&g.Ig&&(g=g.Ig(c,a.ka[c].x,a.ka[c].y),!0===g));d-=1);}
function xb(a,b){var c=Ab(a,b),d,g;if(-1!==c&&a.ka[c].qb&&(a.We.push({of:c,x:a.ka[c].x,y:a.ka[c].y,qb:!1}),a.ka[c].qb=!1,0<a.Zc))for(d=a.H.length-1;0<=d&&!((g=a.H[d])&&g.j&&0>=g.P&&g.Jg&&(g=g.Jg(c,a.ka[c].x,a.ka[c].y),!0===g));d-=1);}
function yb(a,b){var c;if(!(0<a.P)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.We.push({of:0,x:a.ka[0].x,y:a.ka[0].y,wheelDelta:c});if(0<a.Zc)for(d=a.H.length-1;0<=d&&!((g=a.H[d])&&g.j&&0>=g.P&&g.Jn&&(g=g.Jn(c,a.ka[0].x,a.ka[0].y),!0===g));d-=1);}}
function tb(a,b){window.addEventListener("keydown",function(a){0<b.P||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Bb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.P||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Cb(b,a.keyCode))},!1);Db(a)}function Db(a){var b;a.Eh=[];for(b=0;256>b;b+=1)a.Eh[b]=!1;a.lg=[]}
function Bb(a,b){var c,d;if(!a.Eh[b]&&(a.lg.push({key:b,qb:!0}),a.Eh[b]=!0,0<a.mg))for(c=0;c<a.H.length&&!((d=a.H[c])&&d.j&&0>=d.P&&d.Hn&&(d=d.Hn(b),!0===d));c+=1);}function Cb(a,b){var c,d;if(a.Eh[b]&&(a.lg.push({key:b,qb:!1}),a.Eh[b]=!1,0<a.mg))for(c=0;c<a.H.length&&!((d=a.H[c])&&d.j&&0>=d.P&&d.In&&(d=d.In(b),!0===d));c+=1);}function Fb(){var a=I,b;for(b=0;b<a.pe.length;b+=1)a.pe[b].paused+=1}
function la(a,b){var c,d=I,g,h;void 0===c&&(c=null);d.Rh.push({id:a,au:b,th:c});if(0<d.Mh)for(g=0;g<d.H.length&&(!((h=d.H[g])&&h.j&&0>=h.P&&h.Kn)||null!==c&&c!==h||(h=h.Kn(a,b),!0!==h));g+=1);}
function Gb(a,b){var c=a.vb[b];c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.mb(c.canvas),!1!==p.canvas.Y||!0===c.Rb)&&(0===c.Gp&&(0>=c.P&&(c.Eb+=c.Od*a.Wf/1E3),1===c.om&&1===c.pm&&0===c.Sa?1===c.alpha?c.f.q(c.Eb,c.x,c.y):c.f.Ic(c.Eb,c.x,c.y,c.alpha):c.f.ya(c.Eb,c.x,c.y,c.om,c.pm,c.Sa,c.alpha)),1===c.Gp&&(1===c.om&&1===c.pm&&0===c.Sa?1===c.alpha?c.font.q(c.text,c.x,c.y):c.font.Ic(c.text,c.x,c.y,c.alpha):c.font.ya(c.text,c.x,c.y,c.om,c.pm,c.Sa,c.alpha)))}
function Hb(a,b){var c=a.H[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.mb(c.canvas),(!1!==p.canvas.Y||!0===c.Rb)&&c.Ua))return c.Ua()}function Ib(a){for(var b=0,c=0;b<a.H.length||c<a.vb.length;)if(c===a.vb.length){if(!0===Hb(a,b))break;b+=1}else if(b===a.H.length)Gb(a,c),c+=1;else if(a.vb[c].Ha>a.H[b].Ha||a.vb[c].Ha===a.H[b].Ha&&a.vb[c].depth>a.H[b].depth)Gb(a,c),c+=1;else{if(!0===Hb(a,b))break;b+=1}}qb.prototype.pause=function(a){this.P+=1;void 0===a&&(a=!1);this.Jp=a};
qb.prototype.$i=function(){0!==this.P&&(this.Yk=Date.now(),this.P-=1)};qb.prototype.qr=function(){return 0<this.P};window.sm=0;window.rm=0;window.Bp=0;window.Pt=0;window.Cp=0;window.Rt=60;window.St=0;window.Qt=!1;
window.Ap=function(){window.sm=Date.now();window.Pt=window.sm-window.rm;var a=I,b;if(0<a.P)a.Jp&&(Jb(a),Ib(a));else{b=Date.now();"number"!==typeof b&&(b=a.Yk);a.Wf=Math.min(a.hw,b-a.Yk);a.Ek+=a.Wf;""===a.rc&&(a.rc="start",ia.Cd(a.rc));"start"===a.rc&&ia.complete(a.rc)&&(a.rc="load",ia.Cd(a.rc));"load"===a.rc&&ia.complete(a.rc)&&(a.rc="game",ia.Cd(a.rc));"undefined"!==typeof H&&Ta(a.Wf);var c,d;if(0<a.Ih)for(c=0;c<a.H.length&&!((d=a.H[c])&&d.va&&d.j&&0>=d.P&&!0===d.va(a.Wf));c+=1);var g,h;if(0!==a.Bh.length){if(0<
a.Jh)for(d=a.H.length-1;0<=d;d-=1)if((g=a.H[d])&&g.j&&0>=g.P&&g.Fn)for(c=0;c<a.Bh.length;c+=1)h=a.Bh[c],!0!==h.Oc&&(h.Oc=g.Fn(h.x,h.y));a.Bh=[]}if(0!==a.We.length){if(0<a.Ld)for(d=a.H.length-1;0<=d;d-=1)if((g=a.H[d])&&g.j&&0>=g.P&&(g.zb||g.Ub||g.Lk))for(c=0;c<a.We.length;c+=1)h=a.We[c],!0!==h.Oc&&(void 0!==h.wheelDelta&&g.Lk?h.Oc=g.Lk(h.wheelDelta,h.x,h.y):h.qb&&g.zb?h.Oc=g.zb(h.of,h.x,h.y):void 0!==h.qb&&!h.qb&&g.Ub&&(h.Oc=g.Ub(h.of,h.x,h.y)));a.We=[]}if(0!==a.lg.length){if(0<a.Nh)for(d=0;d<a.H.length;d+=
1)if((g=a.H[d])&&g.j&&0>=g.P&&(g.Kk||g.Kg))for(c=0;c<a.lg.length;c+=1)h=a.lg[c],!0!==h.Oc&&(h.qb&&g.Kk?h.Oc=void 0:!h.qb&&g.Kg&&(h.Oc=g.Kg(h.key)));a.lg=[]}c=a.Wf;for(d=a.zh.length=0;d<a.pe.length;d+=1)g=a.pe[d],void 0!==g.id&&0===g.paused&&(0<g.ph||0<g.zo)&&(g.ph-=c,0>=g.ph&&(a.zh.push({id:g.id,th:g.th}),0<g.zo?(g.zo-=1,g.ph+=g.time):g.ph=0));if(0<a.Hh&&0<a.zh.length)for(c=0;c<a.H.length;c+=1)if((d=a.H[c])&&d.En&&d.j)for(g=0;g<a.zh.length;g+=1)h=a.zh[g],!0===h.Oc||null!==h.th&&h.th!==d||(h.Oc=d.En(h.id));
if(0<a.Oh&&0<a.Rh.length)for(c=0;c<a.H.length;c+=1)if((g=a.H[c])&&g.hd&&g.j&&0>=g.P)for(d=0;d<a.Rh.length;d+=1)h=a.Rh[d],!0===h.Oc||null!==h.th&&h.th!==g||(h.Oc=g.hd(h.id,h.au));a.Rh.length=0;if(0<a.Kh)for(c=0;c<a.H.length&&!((d=a.H[c])&&d.oc&&d.j&&0>=d.P&&!0===d.oc(a.Wf));c+=1);Jb(a);Ib(a);a.Yk=b}window.rm=Date.now();window.Bp=window.rm-window.sm;window.Cp=Math.max(window.St,1E3/window.Rt-window.Bp);window.xj(window.Ap)};window.xj=function(a){window.setTimeout(a,window.Cp)};
window.Qt||(window.xj=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.xj);
function Jb(a){function b(a,b){return a.Ha===b.Ha?b.depth-a.depth:a.Ha>b.Ha?-1:1}var c,d;for(c=d=0;c<a.H.length;c+=1)a.H[c]&&(a.H[c].tm&&(a.H[c].tm=!1,a.H[c].j=!0),a.H[d]=a.H[c],d+=1);a.H.length=d;a.Sh&&a.H.sort(b);a.Sh=!1;for(c=d=0;c<a.vb.length;c+=1)a.vb[c]&&(a.vb[d]=a.vb[c],d+=1);a.vb.length=d;a.um&&a.vb.sort(b);a.um=!1}
function K(a,b){var c=I;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.j&&(a.j=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ha&&(a.Ha=0);void 0===a.P&&(a.P=0);void 0===a.Ve&&(a.Ve=[]);a.tm=!1;void 0!==b&&!1===b&&(a.tm=!0,a.j=!1);c.H.push(a);c.Sh=!0;a.va&&(c.Ih+=1);a.Fn&&(c.Jh+=1);if(a.zb||a.Ub)c.Ld+=1;a.Lk&&(c.Ld+=1);if(a.Kk||a.Kg)c.Nh+=1;a.En&&(c.Hh+=1);a.hd&&(c.Oh+=1);a.oc&&(c.Kh+=1);a.Gn&&(c.Lh+=1);if(a.Ig||a.Jg)c.Zc+=1;a.Jn&&(c.Zc+=1);if(a.Hn||a.In)c.mg+=1;a.Kn&&(c.Mh+=
1);a.Tb&&a.Tb()}function Kb(a,b){var c=I;a.depth!==b&&(c.Sh=!0);a.depth=b}function Lb(a,b){var c;b=[].concat(b);void 0===a.Ve&&(a.Ve=[]);for(c=b.length-1;0<=c;c-=1)0>a.Ve.indexOf(b[c])&&a.Ve.push(b[c])}
function Mb(a){var b=I,c=[],d,g;if(void 0===a||"all"===a||"master"===a)for(d=0;d<b.H.length;d+=1)g=b.H[d],void 0!==g&&c.push(g);else if("function"===typeof a)for(d=0;d<b.H.length;d+=1)g=b.H[d],void 0!==g&&a(g)&&c.push(g);else for(d=0;d<b.H.length;d+=1)g=b.H[d],void 0!==g&&0<=g.Ve.indexOf(a)&&c.push(g);return c}function Nb(a){var b=Mb(a);for(a=0;a<b.length;a+=1){var c=b[a];c.P+=1}}function Ob(a){var b=Mb(a);for(a=0;a<b.length;a+=1){var c=b[a];c.P=Math.max(0,c.P-1)}}
qb.prototype.p=function(a){a=this.H.indexOf(a);if(!(0>a)){this.H[a].yb&&this.H[a].yb();var b=this.H[a];b.va&&(this.Ih-=1);b.Fn&&(this.Jh-=1);if(b.zb||b.Ub)this.Ld-=1;b.Lk&&(this.Ld-=1);if(b.Kk||b.Kg)this.Nh-=1;b.En&&(this.Hh-=1);b.hd&&(this.Oh-=1);b.oc&&(this.Kh-=1);b.Gn&&(this.Lh-=1);if(b.Ig||b.Jg)this.Zc-=1;b.Jn&&(this.Zc-=1);if(b.Hn||b.In)this.mg-=1;b.Kn&&(this.Mh-=1);this.H[a]=void 0}};qb.prototype.d=function(a,b,c,d,g,h,k){return Pb(this,a,b,c,d,g,h,k)};
function Pb(a,b,c,d,g,h,k,l){void 0===l&&(l=0);a.vb.push({Gp:0,f:b,Eb:c,Od:d,visible:!0,x:g,y:h,om:1,pm:1,Sa:0,alpha:1,depth:k,Ha:l,P:0,Ve:[]});a.um=!0;return a.vb[a.vb.length-1]}var I=new qb(aa);
function Rb(a,b){var c;this.kind=a;this.D=null;switch(this.kind){case 0:this.D={x:[b.x],y:[b.y]};this.Da=b.x;this.Ta=b.y;this.$a=b.x;this.xb=b.y;break;case 2:this.D={x:[b.x,b.x+b.Lb-1,b.x+b.Lb-1,b.x,b.x],y:[b.y,b.y,b.y+b.Sb-1,b.y+b.Sb-1,b.y]};this.Da=b.x;this.Ta=b.y;this.$a=b.x+b.Lb-1;this.xb=b.y+b.Sb-1;break;case 3:this.D={x:[],y:[]};this.Da=b.x-b.Fl;this.Ta=b.y-b.Fl;this.$a=b.x+b.Fl;this.xb=b.y+b.Fl;break;case 1:this.D={x:[b.sp,b.tp],y:[b.vp,b.wp]};this.Da=Math.min(b.sp,b.tp);this.Ta=Math.min(b.vp,
b.wp);this.$a=Math.max(b.sp,b.tp);this.xb=Math.max(b.vp,b.wp);break;case 4:this.D={x:[],y:[]};this.Da=b.x[0];this.Ta=b.y[0];this.$a=b.x[0];this.xb=b.y[0];for(c=0;c<b.x.length;c+=1)this.D.x.push(b.x[c]),this.D.y.push(b.y[c]),this.Da=Math.min(this.Da,b.x[c]),this.Ta=Math.min(this.Ta,b.y[c]),this.$a=Math.max(this.$a,b.x[c]),this.xb=Math.max(this.xb,b.y[c]);this.D.x.push(b.x[0]);this.D.y.push(b.y[0]);break;default:this.Ta=this.Da=0,this.xb=this.$a=-1}}
function Sb(a,b,c,d){return new Rb(2,{x:a,y:b,Lb:c,Sb:d})}function Tb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.I;h+=1)k=a.pd[h]-a.Gb,l=k+a.Vc[h]-1,n=a.qd[h]-a.Hb,q=n+a.Uc[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>g&&(g=q);return new Rb(2,{x:b,y:d,Lb:c-b+1,Sb:g-d+1})}e=Rb.prototype;
e.N=function(){var a=new Rb(-1,{}),b;a.kind=this.kind;a.Da=this.Da;a.$a=this.$a;a.Ta=this.Ta;a.xb=this.xb;a.D={x:[],y:[]};for(b=0;b<this.D.x.length;b+=1)a.D.x[b]=this.D.x[b];for(b=0;b<this.D.y.length;b+=1)a.D.y[b]=this.D.y[b];return a};e.translate=function(a,b){var c=this.N(),d;c.Da+=a;c.$a+=a;c.Ta+=b;c.xb+=b;for(d=0;d<c.D.x.length;d+=1)c.D.x[d]+=a;for(d=0;d<c.D.y.length;d+=1)c.D.y[d]+=b;return c};
e.scale=function(a){var b=this.N(),c;b.Da*=a;b.$a*=a;b.Ta*=a;b.xb*=a;for(c=0;c<b.D.x.length;c+=1)b.D.x[c]*=a;for(c=0;c<b.D.y.length;c+=1)b.D.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new ca(this.D.x[0],this.D.y[0]),b=b.rotate(a),new Rb(0,{x:b.x,y:b.y});case 1:return b=new ca(this.D.x[0],this.D.y[0]),b=b.rotate(a),c=new ca(this.D.x[1],this.D.y[1]),c=c.rotate(a),new Rb(1,{sp:b.x,vp:b.y,tp:c.x,wp:c.y});case 3:return b=(this.$a-this.Da)/2,c=new ca(this.Da+b,this.Ta+b),c=c.rotate(a),new Rb(3,{x:c.x,y:c.y,Fl:b});default:c=[];d=[];for(g=0;g<this.D.x.length-1;g+=1)b=new ca(this.D.x[g],this.D.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Rb(4,{x:c,y:d})}};
function Ub(a,b,c,d,g){var h,k,l,n,q;if(d<b+a.Da||d>b+a.$a||g<c+a.Ta||g>c+a.xb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return l=(a.$a-a.Da)/2,d-=b+a.Da+l,g-=c+a.Ta+l,d*d+g*g<=l*l;case 1:return l=b+a.D.x[0],n=c+a.D.y[0],b+=a.D.x[1],a=c+a.D.y[1],d===l?g===n:d===b?g===a:1>Math.abs(n+(d-l)*(a-n)/(b-l)-g);case 4:n=new ca(0,0);q=new ca(0,0);l=[];for(k=0;k<a.D.x.length-1;k+=1)n.x=a.D.x[k],n.y=a.D.y[k],q.x=a.D.x[k+1],q.y=a.D.y[k+1],l.push(da(new ca(n.x-q.x,n.y-q.y)));for(n=0;n<l.length;n+=1){q=
new ca(d,g);k=l[n];q=q.x*k.x+q.y*k.y;h=a;var w=b,A=c,E=l[n],s=new ca(0,0),t=void 0,u=1E9;k=-1E10;for(var v=void 0,v=0;v<h.D.x.length;v+=1)s.x=w+h.D.x[v],s.y=A+h.D.y[v],t=s.x*E.x+s.y*E.y,u=Math.min(u,t),k=Math.max(k,t);h=u;if(q<h||k<q)return!1}return!0;default:return!1}}
e.dc=function(a,b,c){var d=p.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.Da-1,b+this.Ta-1,3,3);break;case 2:d.fillRect(a+this.Da,b+this.Ta,this.$a-this.Da+1,this.xb-this.Ta+1);break;case 3:c=(this.$a-this.Da)/2;d.beginPath();d.arc(a+this.Da+c,b+this.Ta+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.D.x[0],b+this.D.y[0]);d.lineTo(a+this.D.x[1],b+this.D.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.D.x[0],b+this.D.y[0]);
for(c=1;c<this.D.x.length-1;c+=1)d.lineTo(a+this.D.x[c],b+this.D.y[c]);d.closePath();d.fill()}};function Vb(){this.depth=1E7;this.visible=!1;this.j=!0;this.group="Engine";this.ma=[];this.Gh=this.P=this.Qh=!1;this.re=1;this.bc=-1;this.qa=-1E6}e=Vb.prototype;e.N=function(){var a=new Vb,b;for(b=0;b<this.ma.length;b+=1)a.ma.push({Ya:this.ma[b].Ya,action:this.ma[b].action});a.Gh=this.Gh;return a};
e.ua=function(a,b){var c,d;if(0===this.ma.length||this.ma[this.ma.length-1].Ya<=a)this.ma.push({Ya:a,action:b});else{for(c=0;this.ma[c].Ya<=a;)c+=1;for(d=this.ma.length;d>c;d-=1)this.ma[d]=this.ma[d-1];this.ma[c]={Ya:a,action:b}}this.qa=-1E6};e.start=function(){this.Qh=!0;this.P=!1;this.bc=0>this.re&&0<this.ma.length?this.ma[this.ma.length-1].Ya+1:-1;this.qa=-1E6;I.p(this);K(this)};
e.Ao=function(){if(0>this.re&&0<this.ma.length){var a=this.ma[this.ma.length-1].Ya;this.bc=0>this.re?a+1:a-1}else this.bc=0>this.re?1:-1;this.qa=-1E6};e.stop=function(){this.Qh=!1;I.p(this)};e.ee=function(){return this.Qh};e.pause=function(){this.P=!0;I.p(this)};e.$i=function(){this.P=!1;I.p(this);K(this)};e.paused=function(){return this.Qh&&this.P};e.Cs=function(a){this.Gh=a};
e.va=function(a){if(this.Qh&&!this.P&&0!==this.re)if(0<this.re){0>this.qa&&(this.qa=0);for(;this.qa<this.ma.length&&this.ma[this.qa].Ya<=this.bc;)this.qa+=1;for(this.bc+=this.re*a;0<=this.qa&&this.qa<this.ma.length&&this.ma[this.qa].Ya<=this.bc;)this.ma[this.qa].action(this.ma[this.qa].Ya,this),this.qa+=1;this.qa>=this.ma.length&&(this.Gh?this.Ao():this.stop())}else{0>this.qa&&(this.qa=this.ma.length-1);for(;0<=this.qa&&this.ma[this.qa].Ya>=this.bc;)this.qa-=1;for(this.bc+=this.re*a;0<=this.qa&&this.ma[this.qa].Ya>=
this.bc;)this.ma[this.qa].action(this.ma[this.qa].Ya,this),this.qa-=1;0>this.qa&&0>=this.bc&&(this.Gh?this.Ao():this.stop())}};function Wb(){this.depth=1E7;this.visible=!1;this.j=!0;this.group="Engine";this.Mb=[];this.Re=[];this.clear();this.ly=!1;K(this)}e=Wb.prototype;e.va=function(){var a,b,c,d,g;if(this.ly)for(a=0;16>a;a+=1)I.ka[a].qb&&(b=I.ka[a].x,c=I.ka[a].y,d=this.Re[a],g=this.Mb[d],!(0<=d&&g&&g.selected)||g&&Ub(g.Pc,0,0,b,c)||(Cb(I,g.keyCode),g.selected=!1,this.Re[a]=-1),this.zb(a,b,c))};
e.zb=function(a,b,c){var d;if(!(0<=this.Re[a]))for(d=0;d<this.Mb.length;d+=1){var g;if(g=this.Mb[d])g=(g=this.Mb[d])?Ub(g.Pc,0,0,b,c):!1;if(g&&!this.Mb[d].selected){Bb(I,this.Mb[d].keyCode);this.Mb[d].selected=!0;this.Re[a]=d;break}}};e.Ub=function(a){var b=this.Re[a];0<=b&&this.Mb[b]&&this.Mb[b].selected&&(Cb(I,this.Mb[b].keyCode),this.Mb[b].selected=!1);this.Re[a]=-1};function Xb(a,b,c,d,g,h,k){c=Sb(c,d,g,h);a.Mb.push({keyCode:k,Pc:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.Mb.length=0;16>a;a+=1)this.Re[a]=-1};e.dc=function(a,b,c){var d,g,h,k;for(d=0;d<this.Mb.length;d+=1)if(g=this.Mb[d])g.selected?g.Pc.dc(0,0,b):g.Pc.dc(0,0,a),h=(g.Pc.Da+g.Pc.$a)/2,k=(g.Pc.Ta+g.Pc.xb)/2,p.kc("id: "+g.id,h-20,k-10,c,"16px Arial"),p.kc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new ea;function Yb(a,b){return b}function L(a,b,c,d){return b+a/d*c}function Zb(a,b,c,d,g){void 0===g&&(g=3);return b+c*Math.pow(a/d,g)}
function $b(a,b,c,d){return Zb(a,b,c,d,2)}function ac(a,b,c,d){return b+c*Zb(d-a,1,-1,d,2)}function bc(a,b,c,d){return Zb(a,b,c,d,3)}function cc(a,b,c,d){return b+c*Zb(d-a,1,-1,d,3)}function dc(a,b,c,d){return b+c*(a<d/2?Zb(a,0,.5,d/2,3):Zb(d-a,1,-.5,d/2,3))}function ec(a,b,c,d,g){a=d-a;var h=3,k=g;void 0===h&&(h=3);void 0===k&&(k=8);g=Math.sin(2*(1-a/d)*Math.PI*h+Math.PI/2);h=k;void 0===h&&(h=8);k=Math.pow(2,-h);g*=0+(Math.pow(2,h*a/d-h)-k)/(1-k)*1;return b+c*(1+-1*g)}
function fc(a,b,c,d,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2))}function M(a,b,c,d,g){return b+c*fc(d-a,1,-1,d,g)}
function gc(a){switch(1){case 0:return function(b,c,d,g,h,k,l){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,l)};case 1:return function(b,c,d,g,h,k,l){return a(b-Math.floor(b/g)*g,c,d,g,h,k,l)};case 2:return function(b,c,d,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*b};case 3:return function(b,c,d,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+d*(n+b)};default:return function(b,c,d,g,h,k,l){return a(b,c,d,g,h,k,l)}}}
function hc(a,b,c){var d,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),g=a[d]===Yb?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,w,A,E,s,t){var u,v;u=a.length-1;for(v=0;v<a.length;v+=1)if(d/A<=l[v+1]){u=v;break}d=a[u](d/A-l[u],0,1,c[u],E,s,t);b[u]&&(d=-d);return g+(k[u]+d)*w/h}}
var N=window.TG_InitSettings||{};N.size=void 0!==N.size?N.size:"big";N.Dt=N.usesFullScreen;N.Eo="big"===N.size?1:.5;N.rf=20;N.yi=10;N.Fg=0;N.Fk=-10;N.yk=-20;N.sb=-30;N.Wd=-40;
function O(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(N.Eo*a);break a;case "round":c=Math.round(N.Eo*a);break a;default:c=N.Eo*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=O(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=O(a[c],b));return a}}function P(a){return"big"===N.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}window.throbber=new mb("throbber","media/throbber.png");
window.TG_StartScreenLogo=new mb("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");var ic=new ra("StartTexture",1,"start");window.StartTexture=ic;sa(ic,0,"media/StartTexture0.png");var Q=new ra("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=Q;sa(Q,0,"media/LevelMapScreenTexture0.png");var jc=new ra("LevelEndTexture",3,"load");window.LevelEndTexture=jc;sa(jc,0,"media/LevelEndTexture0.png");sa(jc,1,"media/LevelEndTexture1.png");sa(jc,2,"media/LevelEndTexture2.png");
var R=new ra("MenuTexture",1,"load");window.MenuTexture=R;sa(R,0,"media/MenuTexture0.png");var kc=new ra("StartScreenTexture",1,"load");window.StartScreenTexture=kc;sa(kc,0,"media/StartScreenTexture0.png");var S=new ra("GameTexture",1,"load");window.GameTexture=S;sa(S,0,"media/GameTexture0.png");var lc=new ra("GameStaticTexture",4,"load");window.GameStaticTexture=lc;sa(lc,0,"media/GameStaticTexture0.png");sa(lc,1,"media/GameStaticTexture1.png");sa(lc,2,"media/GameStaticTexture2.png");sa(lc,3,"media/GameStaticTexture3.png");
var mc=new ra("EndScreenTexture",1,"load");window.EndScreenTexture=mc;sa(mc,0,"media/EndScreenTexture0.png");var T=new ra("texture",7,"load");window.texture=T;sa(T,0,"media/texture0.png");sa(T,1,"media/texture1.png");sa(T,2,"media/texture2.png");sa(T,3,"media/texture3.png");sa(T,4,"media/texture4.png");sa(T,5,"media/texture5.png");sa(T,6,"media/texture6.png");var nc=new r("s_level_0",Q,1,125,140,0,0,125,140,1);window.s_level_0=nc;nc.d(0,0,129,1,125,140,0,0);
var oc=new r("s_level_1",Q,1,125,140,0,0,125,140,1);window.s_level_1=oc;oc.d(0,0,257,1,125,140,0,0);var pc=new r("s_level_2",Q,1,125,140,0,0,125,140,1);window.s_level_2=pc;pc.d(0,0,1,1,125,140,0,0);var qc=new r("s_level_3",Q,1,125,140,0,0,125,140,1);window.s_level_3=qc;qc.d(0,0,385,1,125,140,0,0);var rc=new r("s_level_lock",Q,1,48,70,0,0,48,70,1);window.s_level_lock=rc;rc.d(0,0,953,97,48,69,0,1);var sc=new r("s_level_stars",Q,1,126,46,0,0,126,46,1);window.s_level_stars=sc;
sc.d(0,0,513,1,126,45,0,1);var tc=new r("s_level2_0",Q,1,84,87,0,0,84,87,1);window.s_level2_0=tc;tc.d(0,0,513,49,84,87,0,0);var uc=new r("s_level2_1",Q,1,84,87,0,0,84,87,1);window.s_level2_1=uc;uc.d(0,0,905,1,84,87,0,0);var vc=new r("s_level2_2",Q,1,84,87,0,0,84,87,1);window.s_level2_2=vc;vc.d(0,0,817,1,84,87,0,0);var wc=new r("s_level2_3",Q,1,84,87,0,0,84,87,1);window.s_level2_3=wc;wc.d(0,0,729,1,84,87,0,0);var xc=new r("s_level2_lock",Q,1,84,87,0,0,84,87,1);window.s_level2_lock=xc;
xc.d(0,0,641,1,84,87,0,0);var yc=new r("s_pop_medal",jc,8,378,378,189,189,3024,378,8);window.s_pop_medal=yc;yc.d(0,0,609,1,349,241,3,69);yc.d(1,0,609,529,346,267,5,54);yc.d(2,0,609,249,348,276,20,56);yc.d(3,1,1,1,342,288,26,50);yc.d(4,1,689,1,319,292,22,46);yc.d(5,1,1,297,337,304,14,41);yc.d(6,0,1,681,343,305,12,41);yc.d(7,1,345,1,341,304,13,41);var zc=new r("s_medal_shadow",jc,1,195,208,0,0,195,208,1);window.s_medal_shadow=zc;zc.d(0,2,457,217,189,204,3,1);
var Ac=new r("s_medal_shine",jc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Ac;Ac.d(0,2,657,1,193,207,1,1);Ac.d(1,2,457,1,193,207,1,1);Ac.d(2,2,257,1,193,207,1,1);Ac.d(3,0,801,801,193,207,1,1);Ac.d(4,2,257,217,193,207,1,1);Ac.d(5,0,601,801,193,207,1,1);var Bc=new r("s_icon_toggle_hard",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Bc;Bc.d(0,0,745,1,67,67,0,0);var Cc=new r("s_icon_toggle_medium",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Cc;Cc.d(0,0,817,1,67,67,0,0);
var Dc=new r("s_icon_toggle_easy",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Dc;Dc.d(0,0,889,1,67,67,0,0);var Ec=new r("s_flagIcon_us",R,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Ec;Ec.d(0,0,889,73,48,36,0,6);var Fc=new r("s_flagIcon_gb",R,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=Fc;Fc.d(0,0,497,137,48,36,0,6);var Gc=new r("s_flagIcon_nl",R,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Gc;Gc.d(0,0,625,89,48,36,0,6);var Hc=new r("s_flagIcon_tr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Hc;
Hc.d(0,0,681,129,48,36,0,6);var Ic=new r("s_flagIcon_de",R,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Ic;Ic.d(0,0,889,113,48,36,0,6);var Jc=new r("s_flagIcon_fr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Jc;Jc.d(0,0,945,89,48,36,0,6);var Kc=new r("s_flagIcon_br",R,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Kc;Kc.d(0,0,625,129,48,36,0,6);var Lc=new r("s_flagIcon_es",R,1,48,48,0,0,48,48,1);window.s_flagIcon_es=Lc;Lc.d(0,0,553,145,48,36,0,6);var Mc=new r("s_flagIcon_jp",R,1,48,48,0,0,48,48,1);
window.s_flagIcon_jp=Mc;Mc.d(0,0,737,145,48,36,0,6);var Nc=new r("s_flagIcon_ru",R,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=Nc;Nc.d(0,0,945,129,48,36,0,6);var Oc=new r("s_flagIcon_ar",R,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=Oc;Oc.d(0,0,793,145,48,36,0,6);var Pc=new r("s_flagIcon_kr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=Pc;Pc.d(0,0,569,105,48,36,0,6);var Qc=new r("s_flagIcon_it",R,1,48,48,0,0,48,48,1);window.s_flagIcon_it=Qc;Qc.d(0,0,681,89,48,36,0,6);
var Rc=new r("s_tutorialButton_close",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=Rc;Rc.d(0,0,817,73,65,65,0,0);var Sc=new r("s_tutorialButton_next",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=Sc;Sc.d(0,0,745,73,66,65,0,0);var Tc=new r("s_tutorialButton_previous",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=Tc;Tc.d(0,0,497,65,66,65,0,0);var Uc=new r("s_logo_tinglygames",R,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=Uc;Uc.d(0,0,1,1,240,240,0,0);
var Vc=new r("s_logo_coolgames",R,1,240,240,0,0,240,240,1);window.s_logo_coolgames=Vc;Vc.d(0,0,249,1,240,167,0,36);var Wc=new r("s_logo_tinglygames_start",kc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=Wc;Wc.d(0,0,481,1,156,53,0,0);var Xc=new r("s_logo_coolgames_start",kc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=Xc;Xc.d(0,0,641,1,150,104,75,0);var Yc=new r("s_star01_empty",jc,1,170,170,85,85,170,170,1);window.s_star01_empty=Yc;Yc.d(0,1,265,849,163,168,2,2);
var Zc=new r("s_star01_fill",jc,1,170,170,85,85,170,170,1);window.s_star01_fill=Zc;Zc.d(0,1,873,729,142,147,14,17);var $c=new r("s_star02_empty",jc,1,170,170,85,85,170,170,1);window.s_star02_empty=$c;$c.d(0,1,433,849,168,162,1,1);var ad=new r("s_star02_fill",jc,1,170,170,85,85,170,170,1);window.s_star02_fill=ad;ad.d(0,1,1,865,146,141,12,16);var bd=new r("s_star03_empty",jc,1,170,170,85,85,170,170,1);window.s_star03_empty=bd;bd.d(0,1,609,849,164,168,4,2);
var cd=new r("s_star03_fill",jc,1,170,170,85,85,170,170,1);window.s_star03_fill=cd;cd.d(0,1,873,577,142,148,14,16);var dd=new r("s_sfx_star",jc,8,300,300,150,150,2400,300,8);window.s_sfx_star=dd;dd.d(0,1,777,881,134,131,85,89);dd.d(1,2,1,1,250,244,19,27);dd.d(2,1,1,609,257,253,17,20);dd.d(3,1,601,577,266,263,12,15);dd.d(4,1,689,297,262,273,13,10);dd.d(5,1,345,313,251,270,19,12);dd.d(6,1,345,585,213,260,38,16);dd.d(7,0,353,681,243,299,23,1);var ed=new r("s_ui_cup_highscore",S,1,32,28,0,0,32,28,1);
window.s_ui_cup_highscore=ed;ed.d(0,0,969,121,32,28,0,0);var fd=new r("s_ui_cup_score",S,1,28,24,0,0,28,24,1);window.s_ui_cup_score=fd;fd.d(0,0,721,281,28,24,0,0);var gd=new r("s_ui_divider",lc,1,94,2,0,0,94,2,1);window.s_ui_divider=gd;gd.d(0,0,905,121,94,2,0,0);var hd=new r("s_ui_smiley_hard",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_hard=hd;hd.d(0,0,1001,1,22,22,0,0);var id=new r("s_ui_smiley_medium",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_medium=id;id.d(0,0,1001,49,22,22,0,0);
var jd=new r("s_ui_smiley_easy",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_easy=jd;jd.d(0,0,1001,25,22,22,0,0);var kd=new r("s_ui_crown",S,1,24,20,12,10,24,20,1);window.s_ui_crown=kd;kd.d(0,0,721,313,24,20,0,0);var ld=new r("s_ui_heart",S,1,28,24,14,12,28,24,1);window.s_ui_heart=ld;ld.d(0,0,753,281,26,23,1,1);var md=new r("s_icon_toggle_sfx_on",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=md;md.d(0,0,569,65,49,31,7,17);var nd=new r("s_icon_toggle_sfx_off",R,1,67,67,0,0,67,67,1);
window.s_icon_toggle_sfx_off=nd;nd.d(0,0,961,1,53,31,7,17);var od=new r("s_icon_toggle_music_on",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=od;od.d(0,0,849,145,38,41,13,16);var pd=new r("s_icon_toggle_music_off",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=pd;pd.d(0,0,961,41,51,41,8,16);var qd=new r("s_overlay_assignment",lc,1,592,520,0,0,592,520,1);window.s_overlay_assignment=qd;qd.d(0,2,1,1,591,519,1,1);var rd=new r("s_overlay_level_fail",jc,1,600,676,0,0,600,676,1);
window.s_overlay_level_fail=rd;rd.d(0,0,1,1,600,676,0,0);var sd=new r("s_screen_end",mc,1,640,960,0,0,640,960,1);window.s_screen_end=sd;sd.d(0,0,1,1,640,960,0,0);var td=new r("s_seasons_01_red_01",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_01=td;td.d(0,0,561,369,78,98,0,0);var ud=new r("s_seasons_01_red_02",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_02=ud;ud.d(0,0,241,377,78,98,0,0);var vd=new r("s_seasons_01_red_03",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_03=vd;
vd.d(0,0,641,385,78,98,0,0);var wd=new r("s_seasons_01_red_04",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_04=wd;wd.d(0,0,321,377,78,98,0,0);var xd=new r("s_seasons_02_green_01",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_01=xd;xd.d(0,0,161,377,78,98,0,0);var yd=new r("s_seasons_02_green_02",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_02=yd;yd.d(0,0,1,377,78,98,0,0);var zd=new r("s_seasons_02_green_03",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_03=zd;zd.d(0,0,481,369,78,98,0,0);
var Ad=new r("s_seasons_02_green_04",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_04=Ad;Ad.d(0,0,81,377,78,98,0,0);var Bd=new r("s_logo",kc,1,471,176,0,0,471,176,1);window.s_logo=Bd;Bd.d(0,0,1,1,471,170,0,6);var Cd=new r("s_refresh_icon_shadow",T,1,116,116,58,58,116,116,1);window.s_refresh_icon_shadow=Cd;Cd.d(0,1,585,1,114,112,1,3);var Dd=new r("s_refresh_icon",lc,1,116,116,58,58,116,116,1);window.s_refresh_icon=Dd;Dd.d(0,0,905,1,116,116,0,0);
var Ed=new r("s_refresh_left",lc,1,576,640,0,0,576,640,1);window.s_refresh_left=Ed;Ed.d(0,0,1,1,576,640,0,0);var Fd=new r("s_refresh_right",lc,1,576,640,0,0,576,640,1);window.s_refresh_right=Fd;Fd.d(0,1,1,1,576,640,0,0);var Gd=new r("ImgTileOverlay",S,1,88,98,0,0,88,98,1);window.ImgTileOverlay=Gd;Gd.d(0,0,497,577,58,81,1,1);var Hd=new r("s_effect_hint",S,9,106,106,0,0,954,106,9);window.s_effect_hint=Hd;Hd.d(0,0,961,449,61,84,17,8);Hd.d(1,0,425,577,63,86,16,7);Hd.d(2,0,881,569,67,90,14,5);
Hd.d(3,0,241,553,68,91,14,5);Hd.d(4,0,785,153,78,101,9,0);Hd.d(5,0,345,481,72,95,12,3);Hd.d(6,0,713,569,67,90,14,5);Hd.d(7,0,953,569,63,86,16,7);Hd.d(8,0,961,361,61,84,17,8);var Id=new r("s_effect_select",S,1,164,164,0,0,164,164,1);window.s_effect_select=Id;Id.d(0,0,641,489,68,91,48,36);var Jd=new r("s_tutorial_01",lc,1,350,190,0,0,350,190,1);window.s_tutorial_01=Jd;Jd.d(0,0,585,185,318,181,19,6);var Kd=new r("s_tutorial_02",lc,1,350,190,0,0,350,190,1);window.s_tutorial_02=Kd;
Kd.d(0,0,585,1,318,181,19,6);var Ld=new r("s_tutorial_03",lc,1,350,190,0,0,350,190,1);window.s_tutorial_03=Ld;Ld.d(0,0,585,561,243,186,50,4);var Md=new r("s_tutorial_04",lc,1,350,190,0,0,350,190,1);window.s_tutorial_04=Md;Md.d(0,0,585,369,306,187,18,3);var Nd=new r("ImgTileBamboo1",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo1=Nd;Nd.d(0,0,561,473,78,98,0,0);var Od=new r("ImgTileBamboo2",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo2=Od;Od.d(0,0,81,481,78,98,0,0);
var Pd=new r("ImgTileBamboo3",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo3=Pd;Pd.d(0,0,801,465,78,98,0,0);var Rd=new r("ImgTileBamboo4",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo4=Rd;Rd.d(0,0,481,473,78,98,0,0);var Sd=new r("ImgTileBamboo5",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo5=Sd;Sd.d(0,0,721,465,78,98,0,0);var Td=new r("ImgTileBamboo6",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo6=Td;Td.d(0,0,881,465,78,98,0,0);var Ud=new r("ImgTileBamboo7",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo7=Ud;
Ud.d(0,0,1,481,78,98,0,0);var Wd=new r("ImgTileBamboo8",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo8=Wd;Wd.d(0,0,161,481,78,98,0,0);var Xd=new r("ImgTileBamboo9",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo9=Xd;Xd.d(0,0,401,377,78,98,0,0);var Yd=new r("ImgTileChar1",S,1,88,98,0,0,88,98,1);window.ImgTileChar1=Yd;Yd.d(0,0,881,361,78,98,0,0);var Zd=new r("ImgTileChar2",S,1,88,98,0,0,88,98,1);window.ImgTileChar2=Zd;Zd.d(0,0,721,361,78,98,0,0);var $d=new r("ImgTileChar3",S,1,88,98,0,0,88,98,1);
window.ImgTileChar3=$d;$d.d(0,0,569,161,78,98,0,0);var ae=new r("ImgTileChar4",S,1,88,98,0,0,88,98,1);window.ImgTileChar4=ae;ae.d(0,0,321,169,78,98,0,0);var be=new r("ImgTileChar5",S,1,88,98,0,0,88,98,1);window.ImgTileChar5=be;be.d(0,0,401,169,78,98,0,0);var ce=new r("ImgTileChar6",S,1,88,98,0,0,88,98,1);window.ImgTileChar6=ce;ce.d(0,0,785,257,78,98,0,0);var de=new r("ImgTileChar7",S,1,88,98,0,0,88,98,1);window.ImgTileChar7=de;de.d(0,0,161,169,78,98,0,0);
var ee=new r("ImgTileChar8",S,1,88,98,0,0,88,98,1);window.ImgTileChar8=ee;ee.d(0,0,81,169,78,98,0,0);var fe=new r("ImgTileChar9",S,1,88,98,0,0,88,98,1);window.ImgTileChar9=fe;fe.d(0,0,1,169,78,98,0,0);var ge=new r("ImgTileCircle1",S,1,88,98,0,0,88,98,1);window.ImgTileCircle1=ge;ge.d(0,0,945,153,78,98,0,0);var he=new r("ImgTileCircle2",S,1,88,98,0,0,88,98,1);window.ImgTileCircle2=he;he.d(0,0,489,161,78,98,0,0);var ie=new r("ImgTileCircle3",S,1,88,98,0,0,88,98,1);window.ImgTileCircle3=ie;
ie.d(0,0,865,153,78,98,0,0);var je=new r("ImgTileCircle4",S,1,88,98,0,0,88,98,1);window.ImgTileCircle4=je;je.d(0,0,241,169,78,98,0,0);var ke=new r("ImgTileCircle5",S,1,88,98,0,0,88,98,1);window.ImgTileCircle5=ke;ke.d(0,0,945,257,78,98,0,0);var le=new r("ImgTileCircle6",S,1,88,98,0,0,88,98,1);window.ImgTileCircle6=le;le.d(0,0,321,273,78,98,0,0);var me=new r("ImgTileCircle7",S,1,88,98,0,0,88,98,1);window.ImgTileCircle7=me;me.d(0,0,401,273,78,98,0,0);
var ne=new r("ImgTileCircle8",S,1,88,98,0,0,88,98,1);window.ImgTileCircle8=ne;ne.d(0,0,641,281,78,98,0,0);var oe=new r("ImgTileCircle9",S,1,88,98,0,0,88,98,1);window.ImgTileCircle9=oe;oe.d(0,0,865,257,78,98,0,0);var pe=new r("ImgTileDragon1",S,1,88,98,0,0,88,98,1);window.ImgTileDragon1=pe;pe.d(0,0,241,273,78,98,0,0);var qe=new r("ImgTileDragon2",S,1,88,98,0,0,88,98,1);window.ImgTileDragon2=qe;qe.d(0,0,161,273,78,98,0,0);var re=new r("ImgTileDragon3",S,1,88,98,0,0,88,98,1);window.ImgTileDragon3=re;
re.d(0,0,481,265,78,98,0,0);var se=new r("ImgTileHonor1",S,1,88,98,0,0,88,98,1);window.ImgTileHonor1=se;se.d(0,0,561,265,78,98,0,0);var te=new r("ImgTileHonor2",S,1,88,98,0,0,88,98,1);window.ImgTileHonor2=te;te.d(0,0,1,273,78,98,0,0);var ue=new r("ImgTileHonor3",S,1,88,98,0,0,88,98,1);window.ImgTileHonor3=ue;ue.d(0,0,81,273,78,98,0,0);var ve=new r("ImgTileHonor4",S,1,88,98,0,0,88,98,1);window.ImgTileHonor4=ve;ve.d(0,0,801,361,78,98,0,0);var we=new r("ImgDissapear",S,13,164,164,82,82,2132,164,13);
window.ImgDissapear=we;we.d(0,0,969,1,29,116,70,28);we.d(1,0,809,1,7,149,79,12);we.d(2,0,337,1,48,161,57,2);we.d(3,0,393,1,94,161,42,2);we.d(4,0,657,153,120,125,21,16);we.d(5,0,657,1,149,147,7,9);we.d(6,0,489,1,159,158,2,0);we.d(7,0,169,1,162,162,1,1);we.d(8,0,1,1,162,164,1,0);we.d(9,0,825,1,137,145,11,5);we.d(10,0,1,585,79,62,38,50);we.d(11,0,785,569,90,76,37,43);we.d(12,0,241,481,98,70,40,40);var xe=new r("s_levelicon_0",Q,1,84,84,0,0,84,84,1);window.s_levelicon_0=xe;xe.d(0,0,793,185,84,84,0,0);
var ye=new r("s_levelicon_1",Q,1,84,84,0,0,84,84,1);window.s_levelicon_1=ye;ye.d(0,0,177,233,84,84,0,0);var ze=new r("s_levelicon_10",Q,1,84,84,0,0,84,84,1);window.s_levelicon_10=ze;ze.d(0,0,89,233,84,84,0,0);var Ae=new r("s_levelicon_11",Q,1,84,84,0,0,84,84,1);window.s_levelicon_11=Ae;Ae.d(0,0,1,233,84,84,0,0);var Be=new r("s_levelicon_12",Q,1,84,84,0,0,84,84,1);window.s_levelicon_12=Be;Be.d(0,0,881,185,84,84,0,0);var Ce=new r("s_levelicon_13",Q,1,84,84,0,0,84,84,1);window.s_levelicon_13=Ce;
Ce.d(0,0,353,233,84,84,0,0);var De=new r("s_levelicon_14",Q,1,84,84,0,0,84,84,1);window.s_levelicon_14=De;De.d(0,0,705,185,84,84,0,0);var Ee=new r("s_levelicon_15",Q,1,84,84,0,0,84,84,1);window.s_levelicon_15=Ee;Ee.d(0,0,793,273,84,84,0,0);var Fe=new r("s_levelicon_16",Q,1,84,84,0,0,84,84,1);window.s_levelicon_16=Fe;Fe.d(0,0,705,273,84,84,0,0);var Ge=new r("s_levelicon_17",Q,1,84,84,0,0,84,84,1);window.s_levelicon_17=Ge;Ge.d(0,0,617,273,84,84,0,0);
var He=new r("s_levelicon_18",Q,1,84,84,0,0,84,84,1);window.s_levelicon_18=He;He.d(0,0,441,233,84,84,0,0);var Ie=new r("s_levelicon_19",Q,1,84,84,0,0,84,84,1);window.s_levelicon_19=Ie;Ie.d(0,0,265,233,84,84,0,0);var Je=new r("s_levelicon_2",Q,1,84,84,0,0,84,84,1);window.s_levelicon_2=Je;Je.d(0,0,353,145,84,84,0,0);var Ke=new r("s_levelicon_20",Q,1,84,84,0,0,84,84,1);window.s_levelicon_20=Ke;Ke.d(0,0,601,97,84,84,0,0);var Le=new r("s_levelicon_21",Q,1,84,84,0,0,84,84,1);window.s_levelicon_21=Le;
Le.d(0,0,865,97,84,84,0,0);var Me=new r("s_levelicon_22",Q,1,84,84,0,0,84,84,1);window.s_levelicon_22=Me;Me.d(0,0,777,97,84,84,0,0);var Ne=new r("s_levelicon_23",Q,1,84,84,0,0,84,84,1);window.s_levelicon_23=Ne;Ne.d(0,0,689,97,84,84,0,0);var Oe=new r("s_levelicon_24",Q,1,84,84,0,0,84,84,1);window.s_levelicon_24=Oe;Oe.d(0,0,1,145,84,84,0,0);var Pe=new r("s_levelicon_3",Q,1,84,84,0,0,84,84,1);window.s_levelicon_3=Pe;Pe.d(0,0,177,145,84,84,0,0);var Qe=new r("s_levelicon_4",Q,1,84,84,0,0,84,84,1);
window.s_levelicon_4=Qe;Qe.d(0,0,265,145,84,84,0,0);var Re=new r("s_levelicon_5",Q,1,84,84,0,0,84,84,1);window.s_levelicon_5=Re;Re.d(0,0,617,185,84,84,0,0);var Se=new r("s_levelicon_6",Q,1,84,84,0,0,84,84,1);window.s_levelicon_6=Se;Se.d(0,0,529,185,84,84,0,0);var Te=new r("s_levelicon_7",Q,1,84,84,0,0,84,84,1);window.s_levelicon_7=Te;Te.d(0,0,441,145,84,84,0,0);var Ue=new r("s_levelicon_8",Q,1,84,84,0,0,84,84,1);window.s_levelicon_8=Ue;Ue.d(0,0,89,145,84,84,0,0);
var Ve=new r("s_levelicon_9",Q,1,84,84,0,0,84,84,1);window.s_levelicon_9=Ve;Ve.d(0,0,529,273,84,84,0,0);var We=new r("s_level_preview_frame_filled",T,1,118,116,0,0,118,116,1);window.s_level_preview_frame_filled=We;We.d(0,1,705,1,108,113,5,3);var Xe=new r("s_level_preview_frame",T,1,118,116,0,0,118,116,1);window.s_level_preview_frame=Xe;Xe.d(0,0,889,817,112,114,1,1);var Ye=new r("s_level_preview_frame_locked",T,1,118,116,0,0,118,116,1);window.s_level_preview_frame_locked=Ye;
Ye.d(0,0,769,817,112,114,1,1);var Ze=new r("s_background",lc,4,576,320,0,0,1152,640,2);window.s_background=Ze;Ze.d(0,3,1,1,576,320,0,0);Ze.d(1,1,1,649,576,320,0,0);Ze.d(2,2,1,529,576,320,0,0);Ze.d(3,0,1,649,576,320,0,0);var $e=new r("s_ui_background_blank",T,1,140,580,0,0,140,580,1);window.s_ui_background_blank=$e;$e.d(0,0,993,1,1,1,0,0);var af=new r("s_ui_highscore",T,1,33,47,0,0,33,47,1);window.s_ui_highscore=af;af.d(0,0,985,297,33,47,0,0);var bf=new r("s_ui_timeleft",T,1,34,38,0,0,34,38,1);
window.s_ui_timeleft=bf;bf.d(0,0,985,385,34,38,0,0);var cf=new r("s_loadingbar_background",T,1,42,32,21,16,42,32,1);window.s_loadingbar_background=cf;cf.d(0,0,985,353,38,30,2,2);var df=new r("s_btn_small_pause",T,2,81,98,0,0,162,98,2);window.s_btn_small_pause=df;df.d(0,1,817,1,80,89,1,9);df.d(1,0,953,937,69,69,6,10);var ef=new r("s_btn_small_retry",T,2,81,98,0,0,162,98,2);window.s_btn_small_retry=ef;ef.d(0,1,905,1,80,89,1,9);ef.d(1,0,737,937,69,69,6,10);
var ff=new r("s_btn_big_start",T,2,154,157,0,0,308,157,2);window.s_btn_big_start=ff;ff.d(0,0,161,753,152,157,1,0);ff.d(1,0,321,817,152,157,1,0);var gf=new r("s_btn_big_restart",T,2,154,157,0,0,308,157,2);window.s_btn_big_restart=gf;gf.d(0,0,817,505,152,157,1,0);gf.d(1,0,1,753,152,157,1,0);var hf=new r("s_btn_small_exit",T,2,81,98,0,0,162,98,2);window.s_btn_small_exit=hf;hf.d(0,0,209,913,80,89,1,9);hf.d(1,0,881,937,69,69,6,10);var jf=new r("s_btn_standard",T,2,97,100,0,0,194,100,2);
window.s_btn_standard=jf;jf.d(0,0,1,913,95,99,1,0);jf.d(1,0,105,913,95,99,1,0);var kf=new r("s_btn_small_options",T,2,81,98,0,0,162,98,2);window.s_btn_small_options=kf;kf.d(0,0,929,665,80,89,1,9);kf.d(1,0,809,937,69,69,6,10);var lf=new r("s_btn_toggle",T,2,162,100,0,0,324,100,2);window.s_btn_toggle=lf;lf.d(0,0,817,401,160,99,1,0);lf.d(1,0,817,297,160,99,1,0);var mf=new r("s_btn_bigtext",T,2,137,117,0,0,274,117,2);window.s_btn_bigtext=mf;mf.d(0,0,481,817,135,117,1,0);mf.d(1,0,625,817,135,117,1,0);
var nf=new r("s_icon_toggle_fxoff",T,2,227,100,0,0,454,100,2);window.s_icon_toggle_fxoff=nf;nf.d(0,0,585,505,225,99,1,0);nf.d(1,0,585,297,225,99,1,0);var of=new r("s_icon_toggle_fxon",T,2,227,100,0,0,454,100,2);window.s_icon_toggle_fxon=of;of.d(0,0,585,401,225,99,1,0);of.d(1,0,585,609,225,99,1,0);var pf=new r("s_icon_toggle_musicoff",T,2,227,100,0,0,454,100,2);window.s_icon_toggle_musicoff=pf;pf.d(0,0,1,649,225,99,1,0);pf.d(1,0,465,713,225,99,1,0);
var qf=new r("s_icon_toggle_musicon",T,2,227,100,0,0,454,100,2);window.s_icon_toggle_musicon=qf;qf.d(0,0,697,713,225,99,1,0);qf.d(1,0,233,649,225,99,1,0);var rf=new r("s_level2_arrow_left",T,2,60,84,0,0,120,84,2);window.s_level2_arrow_left=rf;rf.d(0,0,609,937,58,79,1,5);rf.d(1,0,545,937,58,79,1,5);var sf=new r("s_level2_arrow_right",T,2,60,84,0,0,120,84,2);window.s_level2_arrow_right=sf;sf.d(0,0,673,937,58,79,1,5);sf.d(1,0,481,937,58,79,1,5);
var tf=new r("s_screen_levelselect",T,2,576,640,0,0,1152,640,2);window.s_screen_levelselect=tf;tf.d(0,1,1,1,576,640,0,0);tf.d(1,3,1,1,576,640,0,0);var uf=new r("s_overlay_assignement",T,1,417,383,0,0,417,383,1);window.s_overlay_assignement=uf;uf.d(0,0,585,1,406,288,5,95);var vf=new r("s_tutorial",T,1,526,552,0,0,526,552,1);window.s_tutorial=vf;vf.d(0,6,1,1,526,552,0,0);var wf=new r("s_overlay_options",T,1,572,631,0,0,572,631,1);window.s_overlay_options=wf;wf.d(0,4,1,1,556,631,8,0);
var xf=new r("s_overlay_level_win",T,1,644,629,0,0,644,629,1);window.s_overlay_level_win=xf;xf.d(0,5,1,1,550,628,47,1);var yf=new r("s_screen_start",T,2,576,640,0,0,1152,640,2);window.s_screen_start=yf;yf.d(0,2,1,1,576,640,0,0);yf.d(1,0,1,1,576,640,0,0);var zf=new r("s_logo_preload_tinglygames",ic,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=zf;zf.d(0,0,1,1,320,54,0,0);var Af=new r("s_loadingbar_bg",ic,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=Af;Af.d(0,0,665,1,38,20,0,0);
var Bf=new r("s_loadingbar_fill",ic,1,30,12,0,0,30,12,1);window.s_loadingbar_fill=Bf;Bf.d(0,0,705,1,30,12,0,0);var Cf=new r("s_logo_about",R,1,121,121,0,0,121,121,1);window.s_logo_about=Cf;Cf.d(0,0,625,1,117,80,2,21);var Df=new r("s_logo_poki_about",R,1,123,58,0,0,123,58,1);window.s_logo_poki_about=Df;Df.d(0,0,497,1,123,58,0,0);var Ef=new r("s_logo_poki_start",ic,1,120,60,0,0,120,60,1);window.s_logo_poki_start=Ef;Ef.d(0,0,537,1,119,59,1,1);
var Ff=new r("s_ads_background",ic,1,200,200,100,100,200,200,1);window.s_ads_background=Ff;Ff.d(0,0,329,1,200,200,0,0);var Gf=new ua("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=Gf;var U=new B("f_default","Arial");window.f_default=U;D(U,12);U.fill=!0;U.setFillColor("Black");ya(U,1);Aa(U,!1);U.setStrokeColor("Black");Ca(U,1);Fa(U,"miter");Ba(U,1);Ea(U,!1);F(U,"left");G(U,"top");Ha(U,0);U.aa=0;
var Hf=new ua("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=Hf;var If=new ua("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=If;var Jf=new ua("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=Jf;
var Kf=new ua("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=Kf;var Lf=new B("ff_opensans_bold","Arial");window.f_game_ui_tiny=Lf;D(Lf,11);Lf.fill=!0;Lf.setFillColor("#799EC5");ya(Lf,1);Aa(Lf,!1);Lf.setStrokeColor("White");Ca(Lf,1);Fa(Lf,"miter");Ba(Lf,1);Ea(Lf,!1);F(Lf,"center");G(Lf,"middle");Ha(Lf,0);Lf.aa=0;var Mf=new B("ff_opensans_bolditalic","Arial");window.f_game_ui_large=Mf;D(Mf,52);Mf.fill=!0;Mf.setFillColor("#172348");
ya(Mf,1);Aa(Mf,!1);Mf.setStrokeColor("Black");Ca(Mf,1);Fa(Mf,"miter");Ba(Mf,1);Ea(Mf,!1);F(Mf,"center");G(Mf,"middle");Ha(Mf,0);Mf.aa=0;var Nf=new ua("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");window.floaterFontFaceLoader=Nf;var Of=new ua("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Of;var Pf=new B("floaterFontFace","Arial");window.floaterFontText1=Pf;D(Pf,24);
xa(Pf,"normal");Pf.fill=!0;Pf.setFillColor("#FFDE00");ya(Pf,1);Aa(Pf,!0);Pf.setStrokeColor("#6F1F00");Ca(Pf,4);Fa(Pf,"miter");Ba(Pf,1);Ea(Pf,!0);Ga(Pf,"rgba(57,0,0,0.46)",4);F(Pf,"left");G(Pf,"top");Ha(Pf,0);Pf.aa=0;var Qf=new B("floaterFontFace","Arial");window.floaterFontText2=Qf;D(Qf,28);xa(Qf,"normal");Qf.fill=!0;za(Qf,2,["#FFF600","#00DB48","blue"],.65,.02);ya(Qf,1);Aa(Qf,!0);Qf.setStrokeColor("#073400");Ca(Qf,4);Fa(Qf,"miter");Ba(Qf,1);Ea(Qf,!0);Ga(Qf,"rgba(0,57,43,0.47)",4);F(Qf,"left");
G(Qf,"top");Ha(Qf,0);Qf.aa=0;var Rf=new B("floaterFontFace","Arial");window.floaterFontText3=Rf;D(Rf,30);xa(Rf,"normal");Rf.fill=!0;za(Rf,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);ya(Rf,1);Aa(Rf,!0);Rf.setStrokeColor("#4F0027");Ca(Rf,4);Fa(Rf,"miter");Ba(Rf,1);Ea(Rf,!0);Ga(Rf,"rgba(41,0,0,0.48)",5);F(Rf,"left");G(Rf,"top");Ha(Rf,0);Rf.aa=0;var Sf=new B("floaterFontFace","Arial");window.floaterFontText4=Sf;D(Sf,34);xa(Sf,"normal");Sf.fill=!0;za(Sf,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);
ya(Sf,1);Aa(Sf,!0);Sf.setStrokeColor("#001637");Ca(Sf,4);Fa(Sf,"miter");Ba(Sf,1);Ea(Sf,!0);Ga(Sf,"rgba(0,35,75,0.49)",6);F(Sf,"left");G(Sf,"top");Ha(Sf,0);Sf.aa=0;var Tf=new B("floaterNumberFontFace","Arial");window.floaterFontNumberPositive=Tf;D(Tf,30);Tf.fill=!0;Tf.setFillColor("White");ya(Tf,1);Aa(Tf,!0);Tf.setStrokeColor("#00106F");Ca(Tf,2);Fa(Tf,"miter");Ba(Tf,1);Ea(Tf,!1);Ga(Tf,"rgba(0,4,57,0.51)",4);F(Tf,"left");G(Tf,"top");Ha(Tf,0);Tf.aa=0;var Uf=new B("floaterNumberFontFace","Arial");
window.floaterFontNumberNegative=Uf;D(Uf,30);xa(Uf,"normal");Uf.fill=!0;Uf.setFillColor("#FF1E00");ya(Uf,1);Aa(Uf,!0);Uf.setStrokeColor("#3F0000");Ca(Uf,2);Fa(Uf,"miter");Ba(Uf,1);Ea(Uf,!1);Ga(Uf,"rgba(57,0,0,0.49)",4);F(Uf,"left");G(Uf,"top");Ha(Uf,0);Uf.aa=0;var Vf=new ua("f_awesome","fonts/f_awesome.woff","fonts/f_awesome.ttf","fonts");window.f_awesomeLoader=Vf;var Wf=new B("f_awesome","Arial");window.f_awesome=Wf;D(Wf,36);xa(Wf,"normal");Wf.fill=!0;Wf.setFillColor("#ff8900 ");ya(Wf,1);Aa(Wf,!0);
Wf.setStrokeColor("#020626");Ca(Wf,6);Fa(Wf,"round");Ba(Wf,1);Ea(Wf,!0);F(Wf,"left");G(Wf,"top");Ha(Wf,0);Wf.aa=0;var Xf=new B("ff_opensans_extrabold","Arial");window.f_great=Xf;D(Xf,36);xa(Xf,"normal");Xf.fill=!0;Xf.setFillColor("White");ya(Xf,1);Aa(Xf,!0);Xf.setStrokeColor("#020626");Ca(Xf,6);Fa(Xf,"round");Ba(Xf,1);Ea(Xf,!0);F(Xf,"left");G(Xf,"top");Ha(Xf,0);Xf.aa=0;var Yf=new B("ff_opensans_extrabold","Arial");window.f_nice=Yf;D(Yf,36);xa(Yf,"normal");Yf.fill=!0;Yf.setFillColor("#ffc600");
ya(Yf,1);Aa(Yf,!0);Yf.setStrokeColor("#020626");Ca(Yf,6);Fa(Yf,"round");Ba(Yf,1);Ea(Yf,!0);F(Yf,"left");G(Yf,"top");Ha(Yf,0);Yf.aa=0;var V=new B("ff_opensans_bold","Arial");window.f_themeDefault=V;D(V,12);V.fill=!0;V.setFillColor("Black");ya(V,1);Aa(V,!1);V.setStrokeColor("Black");Ca(V,1);Fa(V,"miter");Ba(V,1);Ea(V,!1);F(V,"left");G(V,"top");Ha(V,0);V.aa=0;var Zf=new B("ff_opensans_bold","Arial");window.f_game_ui=Zf;D(Zf,12);Zf.fill=!0;Zf.setFillColor("Black");ya(Zf,1);Aa(Zf,!1);Zf.setStrokeColor("Black");
Ca(Zf,1);Fa(Zf,"miter");Ba(Zf,1);Ea(Zf,!1);F(Zf,"left");G(Zf,"top");Ha(Zf,-.02);Zf.aa=0;var $f=new B("Arial","Arial");window.f_tap_to_play=$f;D($f,28);xa($f,"bold");$f.fill=!0;$f.setFillColor("#1b2b34");ya($f,1);Aa($f,!1);$f.setStrokeColor("Black");Ca($f,28);Fa($f,"round");Ba($f,.55);Ea($f,!1);F($f,"center");G($f,"middle");Ha($f,0);$f.aa=0;var ag=new B("Arial","Arial");window.f_adblocker=ag;D(ag,28);xa(ag,"normal");ag.fill=!0;ag.setFillColor("White");ya(ag,1);Aa(ag,!1);ag.setStrokeColor("Black");
Ca(ag,28);Fa(ag,"round");Ba(ag,.55);Ea(ag,!1);F(ag,"center");G(ag,"middle");Ha(ag,0);ag.aa=0;var bg=new B("Arial","Arial");window.f_copyright=bg;D(bg,22);xa(bg,"bold");bg.fill=!0;bg.setFillColor("#1b2b34");ya(bg,1);Aa(bg,!1);bg.setStrokeColor("Black");Ca(bg,28);Fa(bg,"round");Ba(bg,.55);Ea(bg,!1);F(bg,"left");G(bg,"middle");Ha(bg,0);bg.aa=0;var cg=new B("Arial","Arial");window.f_thankyou=cg;D(cg,50);xa(cg,"bold");cg.fill=!0;cg.setFillColor("#1b2b34");ya(cg,1);Aa(cg,!1);cg.setStrokeColor("Black");
Ca(cg,28);Fa(cg,"round");Ba(cg,.55);Ea(cg,!1);F(cg,"center");G(cg,"middle");Ha(cg,0);cg.aa=0;var dg=new B("Arial","Arial");window.f_loading_game=dg;D(dg,20);xa(dg,"bold");dg.fill=!0;dg.setFillColor("#1b2b34");ya(dg,1);Aa(dg,!1);dg.setStrokeColor("Black");Ca(dg,28);Fa(dg,"round");Ba(dg,.55);Ea(dg,!1);F(dg,"left");G(dg,"middle");Ha(dg,0);dg.aa=0;var eg=new B("Arial","Arial");window.f_interstitial=eg;D(eg,20);xa(eg,"bold");eg.fill=!0;eg.setFillColor("#1b2b34");ya(eg,.38);Aa(eg,!1);eg.setStrokeColor("Black");
Ca(eg,28);Fa(eg,"round");Ba(eg,.55);Ea(eg,!1);F(eg,"center");G(eg,"middle");Ha(eg,0);eg.aa=0;var fg=new lb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=fg;var gg=new eb("a_levelStart",fg,0,1002,1,10,["sfx"]);window.a_levelStart=gg;var hg=new eb("a_levelComplete",fg,3E3,1002,1,10,["sfx"]);window.a_levelComplete=hg;var ig=new eb("a_mouseDown",fg,6E3,471,1,10,["sfx"]);window.a_mouseDown=ig;var jg=new eb("a_levelend_star_01",fg,8E3,1161,1,10,["sfx"]);
window.a_levelend_star_01=jg;var kg=new eb("a_levelend_star_02",fg,11E3,1070,1,10,["sfx"]);window.a_levelend_star_02=kg;var lg=new eb("a_levelend_star_03",fg,14E3,1039,1,10,["sfx"]);window.a_levelend_star_03=lg;var mg=new eb("a_levelend_fail",fg,17E3,1572,1,10,["sfx"]);window.a_levelend_fail=mg;var ng=new eb("a_levelend_score_counter",fg,2E4,54,1,10,["sfx"]);window.a_levelend_score_counter=ng;var pg=new eb("a_levelend_score_end",fg,22E3,888,1,10,["sfx"]);window.a_levelend_score_end=pg;
var qg=new eb("a_medal",fg,24E3,1225,1,10,["sfx"]);window.a_medal=qg;var rg=new eb("a_tileSelection_first",fg,27E3,352,1,10,["game"]);window.a_tileSelection_first=rg;var sg=new eb("a_tileSelection_second",fg,29E3,529,1,10,["game"]);window.a_tileSelection_second=sg;var tg=new eb("a_tileRemove",fg,31E3,869,1,10,["game"]);window.a_tileRemove=tg;var ug=new eb("a_tileShuffle",fg,33E3,736,1,10,["game"]);window.a_tileShuffle=ug;var vg=new eb("a_doorsClose",fg,35E3,1062,1,10,["game"]);
window.a_doorsClose=vg;var wg=new eb("a_doorsOpen",fg,38E3,902,1,10,["game"]);window.a_doorsOpen=wg;var xg=new eb("a_music",fg,4E4,36571,1,10,["game"]);window.a_music=xg;var X=X||{};X["nl-nl"]=X["nl-nl"]||{};X["nl-nl"].loadingScreenLoading="Laden...";X["nl-nl"].startScreenPlay="SPELEN";X["nl-nl"].levelMapScreenTotalScore="Totale score";X["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";X["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";X["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";
X["nl-nl"].levelEndScreenTotalScore="Totale score";X["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";X["nl-nl"].levelEndScreenTimeLeft="Tijd over";X["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";X["nl-nl"].levelEndScreenHighScore="High score";X["nl-nl"].optionsStartScreen="Hoofdmenu";X["nl-nl"].optionsQuit="Stop";X["nl-nl"].optionsResume="Terug naar spel";X["nl-nl"].optionsTutorial="Speluitleg";X["nl-nl"].optionsHighScore="High scores";X["nl-nl"].optionsMoreGames="Meer Spellen";
X["nl-nl"].optionsDifficulty_easy="Makkelijk";X["nl-nl"].optionsDifficulty_medium="Gemiddeld";X["nl-nl"].optionsDifficulty_hard="Moeilijk";X["nl-nl"].optionsMusic_on="Aan";X["nl-nl"].optionsMusic_off="Uit";X["nl-nl"].optionsSFX_on="Aan";X["nl-nl"].optionsSFX_off="Uit";X["nl-nl"]["optionsLang_en-us"]="Engels (US)";X["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";X["nl-nl"]["optionsLang_nl-nl"]="Nederlands";X["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";
X["nl-nl"].gameEndScreenBtnText="Ga verder";X["nl-nl"].optionsTitle="Instellingen";X["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";X["nl-nl"].optionsQuitConfirmBtn_No="Nee";X["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";X["nl-nl"].levelMapScreenTitle="Kies een level";X["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";
X["nl-nl"].optionsRestart="Herstart";X["nl-nl"].optionsSFXBig_on="Geluid aan";X["nl-nl"].optionsSFXBig_off="Geluid uit";X["nl-nl"].optionsAbout_title="Over ons";X["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";X["nl-nl"].optionsAbout_backBtn="Terug";X["nl-nl"].optionsAbout_version="versie:";X["nl-nl"].optionsAbout="Over ons";X["nl-nl"].levelEndScreenMedal="VERBETERD!";X["nl-nl"].startScreenQuestionaire="Wat vind jij?";X["nl-nl"].levelMapScreenWorld_0="Kies een level";
X["nl-nl"].startScreenByTinglyGames="door: CoolGames";X["nl-nl"]["optionsLang_de-de"]="Duits";X["nl-nl"]["optionsLang_tr-tr"]="Turks";X["nl-nl"].optionsAbout_header="Ontwikkeld door:";X["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";X["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";X["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";X["nl-nl"].challengeStartTextScore="Punten van <NAME>:";X["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";
X["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";X["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";X["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";X["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";X["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";X["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";
X["nl-nl"].challengeCancelConfirmBtn_yes="Ja";X["nl-nl"].challengeCancelConfirmBtn_no="Nee";X["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";X["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";X["nl-nl"].challengeEndScreenName_you="Jij";X["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";X["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";
X["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";X["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";X["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";X["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";X["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";
X["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";X["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";X["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";X["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";X["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";X["nl-nl"].challengeForfeitConfirmBtn_no="Nee";
X["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";X["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";X["nl-nl"].optionsChallengeForfeit="Geef op";X["nl-nl"].optionsChallengeCancel="Stop";X["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";X["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";
X["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";X["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";X["nl-nl"]["optionsLang_fr-fr"]="Frans";X["nl-nl"]["optionsLang_ko-kr"]="Koreaans";X["nl-nl"]["optionsLang_ar-eg"]="Arabisch";X["nl-nl"]["optionsLang_es-es"]="Spaans";X["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";X["nl-nl"]["optionsLang_ru-ru"]="Russisch";X["nl-nl"].optionsExit="Stoppen";X["nl-nl"].levelEndScreenTotalScore_number="Totale score:";
X["nl-nl"].levelEndScreenHighScore_number="Topscore:";X["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";X["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";X["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";
X["nl-nl"].optionsAbout_header_publisher="Published by:";X["nl-nl"]["optionsLang_jp-jp"]="Japans";X["nl-nl"]["optionsLang_it-it"]="Italiaans";X["en-us"]=X["en-us"]||{};X["en-us"].loadingScreenLoading="Loading...";X["en-us"].startScreenPlay="PLAY";X["en-us"].levelMapScreenTotalScore="Total score";X["en-us"].levelEndScreenTitle_level="Level <VALUE>";X["en-us"].levelEndScreenTitle_difficulty="Well done!";X["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";X["en-us"].levelEndScreenTotalScore="Total score";
X["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";X["en-us"].levelEndScreenTimeLeft="Time remaining";X["en-us"].levelEndScreenTimeBonus="Time bonus";X["en-us"].levelEndScreenHighScore="High score";X["en-us"].optionsStartScreen="Main menu";X["en-us"].optionsQuit="Quit";X["en-us"].optionsResume="Resume";X["en-us"].optionsTutorial="How to play";X["en-us"].optionsHighScore="High scores";X["en-us"].optionsMoreGames="More Games";X["en-us"].optionsDifficulty_easy="Easy";
X["en-us"].optionsDifficulty_medium="Medium";X["en-us"].optionsDifficulty_hard="Difficult";X["en-us"].optionsMusic_on="On";X["en-us"].optionsMusic_off="Off";X["en-us"].optionsSFX_on="On";X["en-us"].optionsSFX_off="Off";X["en-us"]["optionsLang_en-us"]="English (US)";X["en-us"]["optionsLang_en-gb"]="English (GB)";X["en-us"]["optionsLang_nl-nl"]="Dutch";X["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";X["en-us"].gameEndScreenBtnText="Continue";X["en-us"].optionsTitle="Settings";
X["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";X["en-us"].optionsQuitConfirmBtn_No="No";X["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";X["en-us"].levelMapScreenTitle="Select a level";X["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";X["en-us"].optionsRestart="Restart";
X["en-us"].optionsSFXBig_on="Sound on";X["en-us"].optionsSFXBig_off="Sound off";X["en-us"].optionsAbout_title="About";X["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["en-us"].optionsAbout_backBtn="Back";X["en-us"].optionsAbout_version="version:";X["en-us"].optionsAbout="About";X["en-us"].levelEndScreenMedal="IMPROVED!";X["en-us"].startScreenQuestionaire="What do you think?";X["en-us"].levelMapScreenWorld_0="Select a level";X["en-us"].startScreenByTinglyGames="by: CoolGames";
X["en-us"]["optionsLang_de-de"]="German";X["en-us"]["optionsLang_tr-tr"]="Turkish";X["en-us"].optionsAbout_header="Developed by:";X["en-us"].levelEndScreenViewHighscoreBtn="View scores";X["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";X["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["en-us"].challengeStartTextScore="<NAME>'s score:";X["en-us"].challengeStartTextTime="<NAME>'s time:";X["en-us"].challengeStartScreenToWin="Amount to win:";
X["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["en-us"].challengeCancelConfirmBtn_yes="Yes";X["en-us"].challengeCancelConfirmBtn_no="No";X["en-us"].challengeEndScreensBtn_submit="Submit challenge";X["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";X["en-us"].challengeEndScreenName_you="You";X["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
X["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";X["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";
X["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";X["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";X["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["en-us"].challengeForfeitConfirmBtn_yes="Yes";X["en-us"].challengeForfeitConfirmBtn_no="No";X["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";
X["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["en-us"].optionsChallengeForfeit="Forfeit";X["en-us"].optionsChallengeCancel="Quit";X["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["en-us"].levelEndScreenHighScore_time="Best time:";X["en-us"].levelEndScreenTotalScore_time="Total time:";
X["en-us"]["optionsLang_fr-fr"]="French";X["en-us"]["optionsLang_ko-kr"]="Korean";X["en-us"]["optionsLang_ar-eg"]="Arabic";X["en-us"]["optionsLang_es-es"]="Spanish";X["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";X["en-us"]["optionsLang_ru-ru"]="Russian";X["en-us"].optionsExit="Exit";X["en-us"].levelEndScreenTotalScore_number="Total score:";X["en-us"].levelEndScreenHighScore_number="High score:";X["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["en-us"].optionsAbout_header_publisher="Published by:";X["en-us"]["optionsLang_jp-jp"]="Japanese";X["en-us"]["optionsLang_it-it"]="Italian";X["en-gb"]=X["en-gb"]||{};X["en-gb"].loadingScreenLoading="Loading...";
X["en-gb"].startScreenPlay="PLAY";X["en-gb"].levelMapScreenTotalScore="Total score";X["en-gb"].levelEndScreenTitle_level="Level <VALUE>";X["en-gb"].levelEndScreenTitle_difficulty="Well done!";X["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";X["en-gb"].levelEndScreenTotalScore="Total score";X["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";X["en-gb"].levelEndScreenTimeLeft="Time remaining";X["en-gb"].levelEndScreenTimeBonus="Time bonus";X["en-gb"].levelEndScreenHighScore="High score";
X["en-gb"].optionsStartScreen="Main menu";X["en-gb"].optionsQuit="Quit";X["en-gb"].optionsResume="Resume";X["en-gb"].optionsTutorial="How to play";X["en-gb"].optionsHighScore="High scores";X["en-gb"].optionsMoreGames="More Games";X["en-gb"].optionsDifficulty_easy="Easy";X["en-gb"].optionsDifficulty_medium="Medium";X["en-gb"].optionsDifficulty_hard="Difficult";X["en-gb"].optionsMusic_on="On";X["en-gb"].optionsMusic_off="Off";X["en-gb"].optionsSFX_on="On";X["en-gb"].optionsSFX_off="Off";
X["en-gb"]["optionsLang_en-us"]="English (US)";X["en-gb"]["optionsLang_en-gb"]="English (GB)";X["en-gb"]["optionsLang_nl-nl"]="Dutch";X["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";X["en-gb"].gameEndScreenBtnText="Continue";X["en-gb"].optionsTitle="Settings";X["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";X["en-gb"].optionsQuitConfirmBtn_No="No";
X["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";X["en-gb"].levelMapScreenTitle="Select a level";X["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";X["en-gb"].optionsRestart="Restart";X["en-gb"].optionsSFXBig_on="Sound on";X["en-gb"].optionsSFXBig_off="Sound off";X["en-gb"].optionsAbout_title="About";X["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
X["en-gb"].optionsAbout_backBtn="Back";X["en-gb"].optionsAbout_version="version:";X["en-gb"].optionsAbout="About";X["en-gb"].levelEndScreenMedal="IMPROVED!";X["en-gb"].startScreenQuestionaire="What do you think?";X["en-gb"].levelMapScreenWorld_0="Select a level";X["en-gb"].startScreenByTinglyGames="by: CoolGames";X["en-gb"]["optionsLang_de-de"]="German";X["en-gb"]["optionsLang_tr-tr"]="Turkish";X["en-gb"].optionsAbout_header="Developed by:";X["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
X["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";X["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["en-gb"].challengeStartTextScore="<NAME>'s score:";X["en-gb"].challengeStartTextTime="<NAME>'s time:";X["en-gb"].challengeStartScreenToWin="Amount to win:";X["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
X["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";X["en-gb"].challengeCancelConfirmBtn_yes="Yes";X["en-gb"].challengeCancelConfirmBtn_no="No";X["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
X["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";X["en-gb"].challengeEndScreenName_you="You";X["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";X["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
X["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";X["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
X["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";X["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";X["en-gb"].challengeForfeitConfirmBtn_yes="Yes";X["en-gb"].challengeForfeitConfirmBtn_no="No";X["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";X["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
X["en-gb"].optionsChallengeForfeit="Forfeit";X["en-gb"].optionsChallengeCancel="Quit";X["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["en-gb"].levelEndScreenHighScore_time="Best time:";X["en-gb"].levelEndScreenTotalScore_time="Total time:";X["en-gb"]["optionsLang_fr-fr"]="French";X["en-gb"]["optionsLang_ko-kr"]="Korean";X["en-gb"]["optionsLang_ar-eg"]="Arabic";
X["en-gb"]["optionsLang_es-es"]="Spanish";X["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";X["en-gb"]["optionsLang_ru-ru"]="Russian";X["en-gb"].optionsExit="Exit";X["en-gb"].levelEndScreenTotalScore_number="Total score:";X["en-gb"].levelEndScreenHighScore_number="High score:";X["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["en-gb"].optionsAbout_header_publisher="Published by:";X["en-gb"]["optionsLang_jp-jp"]="Japanese";X["en-gb"]["optionsLang_it-it"]="Italian";X["de-de"]=X["de-de"]||{};X["de-de"].loadingScreenLoading="Laden ...";
X["de-de"].startScreenPlay="SPIELEN";X["de-de"].levelMapScreenTotalScore="Gesamtpunkte";X["de-de"].levelEndScreenTitle_level="Level <VALUE>";X["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";X["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";X["de-de"].levelEndScreenTotalScore="Gesamtpunkte";X["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";X["de-de"].levelEndScreenTimeLeft="Restzeit";X["de-de"].levelEndScreenTimeBonus="Zeitbonus";X["de-de"].levelEndScreenHighScore="Highscore";
X["de-de"].optionsStartScreen="Hauptmen\u00fc";X["de-de"].optionsQuit="Beenden";X["de-de"].optionsResume="Weiterspielen";X["de-de"].optionsTutorial="So wird gespielt";X["de-de"].optionsHighScore="Highscores";X["de-de"].optionsMoreGames="Weitere Spiele";X["de-de"].optionsDifficulty_easy="Einfach";X["de-de"].optionsDifficulty_medium="Mittel";X["de-de"].optionsDifficulty_hard="Schwer";X["de-de"].optionsMusic_on="EIN";X["de-de"].optionsMusic_off="AUS";X["de-de"].optionsSFX_on="EIN";
X["de-de"].optionsSFX_off="AUS";X["de-de"]["optionsLang_en-us"]="Englisch (US)";X["de-de"]["optionsLang_en-gb"]="Englisch (GB)";X["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";X["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";X["de-de"].gameEndScreenBtnText="Weiter";X["de-de"].optionsTitle="Einstellungen";X["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
X["de-de"].optionsQuitConfirmBtn_No="NEIN";X["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";X["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";X["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";X["de-de"].optionsRestart="Neustart";X["de-de"].optionsSFXBig_on="Sound EIN";X["de-de"].optionsSFXBig_off="Sound AUS";X["de-de"].optionsAbout_title="\u00dcber";
X["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["de-de"].optionsAbout_backBtn="Zur\u00fcck";X["de-de"].optionsAbout_version="Version:";X["de-de"].optionsAbout="\u00dcber";X["de-de"].levelEndScreenMedal="VERBESSERT!";X["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";X["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";X["de-de"].startScreenByTinglyGames="von: CoolGames";X["de-de"]["optionsLang_de-de"]="Deutsch";X["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
X["de-de"].optionsAbout_header="Entwickelt von:";X["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";X["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";X["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";X["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";X["de-de"].challengeStartTextTime="Zeit von <NAME>:";X["de-de"].challengeStartScreenToWin="Einsatz:";X["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
X["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";X["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";X["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";X["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";X["de-de"].challengeCancelConfirmBtn_yes="Ja";X["de-de"].challengeCancelConfirmBtn_no="Nein";
X["de-de"].challengeEndScreensBtn_submit="Herausfordern";X["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";X["de-de"].challengeEndScreenName_you="Du";X["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";X["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";X["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
X["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";X["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";X["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";X["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";X["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
X["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";X["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";X["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";X["de-de"].challengeForfeitConfirmBtn_yes="Ja";X["de-de"].challengeForfeitConfirmBtn_no="Nein";X["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";X["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
X["de-de"].optionsChallengeForfeit="Aufgeben";X["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";X["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";X["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";X["de-de"].levelEndScreenHighScore_time="Bestzeit:";X["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
X["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";X["de-de"]["optionsLang_ko-kr"]="Koreanisch";X["de-de"]["optionsLang_ar-eg"]="Arabisch";X["de-de"]["optionsLang_es-es"]="Spanisch";X["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";X["de-de"]["optionsLang_ru-ru"]="Russisch";X["de-de"].optionsExit="Verlassen";X["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";X["de-de"].levelEndScreenHighScore_number="Highscore:";X["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
X["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";X["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["de-de"].optionsAbout_header_publisher="Published by:";X["de-de"]["optionsLang_jp-jp"]="Japanese";X["de-de"]["optionsLang_it-it"]="Italian";X["fr-fr"]=X["fr-fr"]||{};X["fr-fr"].loadingScreenLoading="Chargement...";
X["fr-fr"].startScreenPlay="JOUER";X["fr-fr"].levelMapScreenTotalScore="Score total";X["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";X["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";X["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";X["fr-fr"].levelEndScreenTotalScore="Score total";X["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";X["fr-fr"].levelEndScreenTimeLeft="Temps restant";X["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
X["fr-fr"].levelEndScreenHighScore="Meilleur score";X["fr-fr"].optionsStartScreen="Menu principal";X["fr-fr"].optionsQuit="Quitter";X["fr-fr"].optionsResume="Reprendre";X["fr-fr"].optionsTutorial="Comment jouer";X["fr-fr"].optionsHighScore="Meilleurs scores";X["fr-fr"].optionsMoreGames="Plus de jeux";X["fr-fr"].optionsDifficulty_easy="Facile";X["fr-fr"].optionsDifficulty_medium="Moyen";X["fr-fr"].optionsDifficulty_hard="Difficile";X["fr-fr"].optionsMusic_on="Avec";X["fr-fr"].optionsMusic_off="Sans";
X["fr-fr"].optionsSFX_on="Avec";X["fr-fr"].optionsSFX_off="Sans";X["fr-fr"]["optionsLang_en-us"]="Anglais (US)";X["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";X["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";X["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";X["fr-fr"].gameEndScreenBtnText="Continuer";X["fr-fr"].optionsTitle="Param\u00e8tres";X["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
X["fr-fr"].optionsQuitConfirmBtn_No="Non";X["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";X["fr-fr"].levelMapScreenTitle="Choisir un niveau";X["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";X["fr-fr"].optionsRestart="Recommencer";X["fr-fr"].optionsSFXBig_on="Avec son";X["fr-fr"].optionsSFXBig_off="Sans son";X["fr-fr"].optionsAbout_title="\u00c0 propos";
X["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["fr-fr"].optionsAbout_backBtn="Retour";X["fr-fr"].optionsAbout_version="Version :";X["fr-fr"].optionsAbout="\u00c0 propos";X["fr-fr"].levelEndScreenMedal="RECORD BATTU !";X["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";X["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";X["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";X["fr-fr"]["optionsLang_de-de"]="Allemand";X["fr-fr"]["optionsLang_tr-tr"]="Turc";
X["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";X["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";X["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";X["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";X["fr-fr"].challengeStartTextScore="Son score :";X["fr-fr"].challengeStartTextTime="Son temps\u00a0:";X["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";X["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
X["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";X["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";X["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";X["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";X["fr-fr"].challengeCancelConfirmBtn_yes="Oui";X["fr-fr"].challengeCancelConfirmBtn_no="Non";X["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
X["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";X["fr-fr"].challengeEndScreenName_you="Moi";X["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";X["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";X["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";X["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
X["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";X["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";X["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";X["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";X["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
X["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";X["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";X["fr-fr"].challengeForfeitConfirmBtn_no="Non";X["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";X["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";X["fr-fr"].optionsChallengeForfeit="Abandonner";X["fr-fr"].optionsChallengeCancel="Annuler";X["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
X["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";X["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";X["fr-fr"].levelEndScreenTotalScore_time="Temps total :";X["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";X["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";X["fr-fr"]["optionsLang_ar-eg"]="Arabe";X["fr-fr"]["optionsLang_es-es"]="Espagnol";X["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
X["fr-fr"]["optionsLang_ru-ru"]="Russe";X["fr-fr"].optionsExit="Quitter";X["fr-fr"].levelEndScreenTotalScore_number="Score total :";X["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";X["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";X["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
X["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["fr-fr"].optionsAbout_header_publisher="Published by:";X["fr-fr"]["optionsLang_jp-jp"]="Japanese";X["fr-fr"]["optionsLang_it-it"]="Italian";X["pt-br"]=X["pt-br"]||{};X["pt-br"].loadingScreenLoading="Carregando...";X["pt-br"].startScreenPlay="JOGAR";X["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";X["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";X["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
X["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";X["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";X["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";X["pt-br"].levelEndScreenTimeLeft="Tempo restante";X["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";X["pt-br"].levelEndScreenHighScore="Recorde";X["pt-br"].optionsStartScreen="Menu principal";X["pt-br"].optionsQuit="Sair";X["pt-br"].optionsResume="Continuar";X["pt-br"].optionsTutorial="Como jogar";
X["pt-br"].optionsHighScore="Recordes";X["pt-br"].optionsMoreGames="Mais jogos";X["pt-br"].optionsDifficulty_easy="F\u00e1cil";X["pt-br"].optionsDifficulty_medium="M\u00e9dio";X["pt-br"].optionsDifficulty_hard="Dif\u00edcil";X["pt-br"].optionsMusic_on="Sim";X["pt-br"].optionsMusic_off="N\u00e3o";X["pt-br"].optionsSFX_on="Sim";X["pt-br"].optionsSFX_off="N\u00e3o";X["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";X["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";X["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
X["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";X["pt-br"].gameEndScreenBtnText="Continuar";X["pt-br"].optionsTitle="Configura\u00e7\u00f5es";X["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";X["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";X["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";X["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
X["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";X["pt-br"].optionsRestart="Reiniciar";X["pt-br"].optionsSFXBig_on="Com som";X["pt-br"].optionsSFXBig_off="Sem som";X["pt-br"].optionsAbout_title="Sobre";X["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["pt-br"].optionsAbout_backBtn="Voltar";X["pt-br"].optionsAbout_version="vers\u00e3o:";
X["pt-br"].optionsAbout="Sobre";X["pt-br"].levelEndScreenMedal="MELHOROU!";X["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";X["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";X["pt-br"].startScreenByTinglyGames="da: CoolGames";X["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";X["pt-br"]["optionsLang_tr-tr"]="Turco";X["pt-br"].optionsAbout_header="Desenvolvido por:";X["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";X["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
X["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["pt-br"].challengeStartTextScore="<NAME>'s score:";X["pt-br"].challengeStartTextTime="<NAME>'s time:";X["pt-br"].challengeStartScreenToWin="Amount to win:";X["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
X["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";X["pt-br"].challengeCancelConfirmBtn_yes="Yes";X["pt-br"].challengeCancelConfirmBtn_no="No";X["pt-br"].challengeEndScreensBtn_submit="Submit challenge";X["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";X["pt-br"].challengeEndScreenName_you="You";
X["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";X["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";X["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
X["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";X["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";X["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";X["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
X["pt-br"].challengeForfeitConfirmBtn_yes="Yes";X["pt-br"].challengeForfeitConfirmBtn_no="No";X["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";X["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["pt-br"].optionsChallengeForfeit="Desistir";X["pt-br"].optionsChallengeCancel="Sair do Jogo";X["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
X["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";X["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";X["pt-br"].levelEndScreenTotalScore_time="Tempo total:";X["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";X["pt-br"]["optionsLang_ko-kr"]="Coreano";X["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";X["pt-br"]["optionsLang_es-es"]="Espanhol";X["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
X["pt-br"]["optionsLang_ru-ru"]="Russo";X["pt-br"].optionsExit="Sa\u00edda";X["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";X["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";X["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["pt-br"].optionsAbout_header_publisher="Published by:";X["pt-br"]["optionsLang_jp-jp"]="Japanese";X["pt-br"]["optionsLang_it-it"]="Italian";X["es-es"]=X["es-es"]||{};X["es-es"].loadingScreenLoading="Cargando...";
X["es-es"].startScreenPlay="JUGAR";X["es-es"].levelMapScreenTotalScore="Punt. total";X["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";X["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";X["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";X["es-es"].levelEndScreenTotalScore="Punt. total";X["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";X["es-es"].levelEndScreenTimeLeft="Tiempo restante";X["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
X["es-es"].levelEndScreenHighScore="R\u00e9cord";X["es-es"].optionsStartScreen="Men\u00fa principal";X["es-es"].optionsQuit="Salir";X["es-es"].optionsResume="Seguir";X["es-es"].optionsTutorial="C\u00f3mo jugar";X["es-es"].optionsHighScore="R\u00e9cords";X["es-es"].optionsMoreGames="M\u00e1s juegos";X["es-es"].optionsDifficulty_easy="F\u00e1cil";X["es-es"].optionsDifficulty_medium="Normal";X["es-es"].optionsDifficulty_hard="Dif\u00edcil";X["es-es"].optionsMusic_on="S\u00ed";
X["es-es"].optionsMusic_off="No";X["es-es"].optionsSFX_on="S\u00ed";X["es-es"].optionsSFX_off="No";X["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";X["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";X["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";X["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";X["es-es"].gameEndScreenBtnText="Continuar";X["es-es"].optionsTitle="Ajustes";X["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
X["es-es"].optionsQuitConfirmBtn_No="No";X["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";X["es-es"].levelMapScreenTitle="Elige un nivel";X["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";X["es-es"].optionsRestart="Reiniciar";X["es-es"].optionsSFXBig_on="Sonido s\u00ed";X["es-es"].optionsSFXBig_off="Sonido no";X["es-es"].optionsAbout_title="Acerca de";
X["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["es-es"].optionsAbout_backBtn="Atr\u00e1s";X["es-es"].optionsAbout_version="versi\u00f3n:";X["es-es"].optionsAbout="Acerca de";X["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";X["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";X["es-es"].levelMapScreenWorld_0="Elige un nivel";X["es-es"].startScreenByTinglyGames="de: CoolGames";X["es-es"]["optionsLang_de-de"]="Alem\u00e1n";X["es-es"]["optionsLang_tr-tr"]="Turco";
X["es-es"].optionsAbout_header="Desarrollado por:";X["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";X["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";X["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["es-es"].challengeStartTextScore="<NAME>'s score:";X["es-es"].challengeStartTextTime="<NAME>'s time:";X["es-es"].challengeStartScreenToWin="Amount to win:";X["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
X["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";X["es-es"].challengeCancelConfirmBtn_yes="Yes";X["es-es"].challengeCancelConfirmBtn_no="No";
X["es-es"].challengeEndScreensBtn_submit="Submit challenge";X["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";X["es-es"].challengeEndScreenName_you="You";X["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";X["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
X["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";X["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";X["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
X["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";X["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";X["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["es-es"].challengeForfeitConfirmBtn_yes="Yes";X["es-es"].challengeForfeitConfirmBtn_no="No";X["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";X["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
X["es-es"].optionsChallengeForfeit="Rendirse";X["es-es"].optionsChallengeCancel="Abandonar";X["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";X["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";X["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";X["es-es"].levelEndScreenTotalScore_time="Tiempo total:";X["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";X["es-es"]["optionsLang_ko-kr"]="Coreano";
X["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";X["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";X["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";X["es-es"]["optionsLang_ru-ru"]="Ruso";X["es-es"].optionsExit="Salir";X["es-es"].levelEndScreenTotalScore_number="Puntos totales:";X["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";X["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["es-es"].optionsAbout_header_publisher="Published by:";X["es-es"]["optionsLang_jp-jp"]="Japanese";X["es-es"]["optionsLang_it-it"]="Italian";X["tr-tr"]=X["tr-tr"]||{};X["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
X["tr-tr"].startScreenPlay="OYNA";X["tr-tr"].levelMapScreenTotalScore="Toplam skor";X["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";X["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";X["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";X["tr-tr"].levelEndScreenTotalScore="Toplam skor";X["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";X["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";X["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
X["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";X["tr-tr"].optionsStartScreen="Ana men\u00fc";X["tr-tr"].optionsQuit="\u00c7\u0131k";X["tr-tr"].optionsResume="Devam et";X["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";X["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";X["tr-tr"].optionsMoreGames="Daha Fazla Oyun";X["tr-tr"].optionsDifficulty_easy="Kolay";X["tr-tr"].optionsDifficulty_medium="Orta";X["tr-tr"].optionsDifficulty_hard="Zorluk";X["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
X["tr-tr"].optionsMusic_off="Kapal\u0131";X["tr-tr"].optionsSFX_on="A\u00e7\u0131k";X["tr-tr"].optionsSFX_off="Kapal\u0131";X["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";X["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";X["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";X["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";X["tr-tr"].gameEndScreenBtnText="Devam";X["tr-tr"].optionsTitle="Ayarlar";X["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
X["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";X["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";X["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";X["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";X["tr-tr"].optionsRestart="Tekrar ba\u015flat";X["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";X["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
X["tr-tr"].optionsAbout_title="Hakk\u0131nda";X["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["tr-tr"].optionsAbout_backBtn="Geri";X["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";X["tr-tr"].optionsAbout="Hakk\u0131nda";X["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";X["tr-tr"].startScreenQuestionaire="Ne dersin?";X["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";X["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
X["tr-tr"]["optionsLang_de-de"]="Almanca";X["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";X["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";X["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";X["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";X["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["tr-tr"].challengeStartTextScore="<NAME>'s score:";X["tr-tr"].challengeStartTextTime="<NAME>'s time:";
X["tr-tr"].challengeStartScreenToWin="Amount to win:";X["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["tr-tr"].challengeCancelConfirmBtn_yes="Yes";X["tr-tr"].challengeCancelConfirmBtn_no="No";X["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";X["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";X["tr-tr"].challengeEndScreenName_you="You";X["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
X["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";X["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
X["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";X["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";X["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";X["tr-tr"].challengeForfeitConfirmBtn_no="No";X["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
X["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";X["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";X["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";X["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
X["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";X["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";X["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";X["tr-tr"]["optionsLang_ko-kr"]="Korece";X["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";X["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";X["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";X["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";X["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";X["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
X["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";X["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";X["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
X["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["tr-tr"].optionsAbout_header_publisher="Published by:";X["tr-tr"]["optionsLang_jp-jp"]="Japanese";X["tr-tr"]["optionsLang_it-it"]="Italian";X["ru-ru"]=X["ru-ru"]||{};X["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";X["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";X["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
X["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";X["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";X["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";X["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";X["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
X["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";X["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";X["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";X["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";X["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
X["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";X["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";X["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";X["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";X["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";X["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
X["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";X["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";X["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";X["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";X["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";X["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";X["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
X["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";X["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";X["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";X["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
X["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
X["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";X["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";X["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";X["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
X["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";X["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";X["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";X["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";X["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";X["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";X["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
X["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";X["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";X["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";X["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";X["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
X["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";X["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";X["ru-ru"].optionsAbout_header="Developed by:";X["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";X["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";X["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["ru-ru"].challengeStartTextScore="<NAME>'s score:";
X["ru-ru"].challengeStartTextTime="<NAME>'s time:";X["ru-ru"].challengeStartScreenToWin="Amount to win:";X["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["ru-ru"].challengeCancelConfirmBtn_yes="Yes";X["ru-ru"].challengeCancelConfirmBtn_no="No";X["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";X["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";X["ru-ru"].challengeEndScreenName_you="You";X["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
X["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";X["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
X["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";X["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";X["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";X["ru-ru"].challengeForfeitConfirmBtn_no="No";X["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
X["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["ru-ru"].optionsChallengeForfeit="Forfeit";X["ru-ru"].optionsChallengeCancel="Quit";X["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["ru-ru"].levelEndScreenHighScore_time="Best time:";X["ru-ru"].levelEndScreenTotalScore_time="Total time:";
X["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";X["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";X["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";X["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";X["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
X["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";X["ru-ru"].optionsExit="Exit";X["ru-ru"].levelEndScreenTotalScore_number="Total score:";X["ru-ru"].levelEndScreenHighScore_number="High score:";X["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["ru-ru"].optionsAbout_header_publisher="Published by:";X["ru-ru"]["optionsLang_jp-jp"]="Japanese";X["ru-ru"]["optionsLang_it-it"]="Italian";X["ar-eg"]=X["ar-eg"]||{};X["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
X["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";X["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";X["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";X["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";X["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";X["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
X["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";X["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";X["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";X["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
X["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";X["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";X["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";X["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";X["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
X["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";X["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";X["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";X["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";X["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";X["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
X["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";X["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";X["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
X["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";X["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";X["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";X["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
X["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";X["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
X["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";X["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";X["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";X["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
X["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";X["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";X["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";X["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";X["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
X["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";X["ar-eg"].optionsAbout="\u062d\u0648\u0644";X["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";X["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";X["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";X["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
X["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";X["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";X["ar-eg"].optionsAbout_header="Developed by:";X["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";X["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";X["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["ar-eg"].challengeStartTextScore="<NAME>'s score:";
X["ar-eg"].challengeStartTextTime="<NAME>'s time:";X["ar-eg"].challengeStartScreenToWin="Amount to win:";X["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["ar-eg"].challengeCancelConfirmBtn_yes="Yes";X["ar-eg"].challengeCancelConfirmBtn_no="No";X["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";X["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";X["ar-eg"].challengeEndScreenName_you="You";X["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
X["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";X["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
X["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";X["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";X["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";X["ar-eg"].challengeForfeitConfirmBtn_no="No";X["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
X["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["ar-eg"].optionsChallengeForfeit="Forfeit";X["ar-eg"].optionsChallengeCancel="Quit";X["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["ar-eg"].levelEndScreenHighScore_time="Best time:";X["ar-eg"].levelEndScreenTotalScore_time="Total time:";
X["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";X["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";X["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";X["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";X["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
X["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";X["ar-eg"].optionsExit="Exit";X["ar-eg"].levelEndScreenTotalScore_number="Total score:";X["ar-eg"].levelEndScreenHighScore_number="High score:";X["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["ar-eg"].optionsAbout_header_publisher="Published by:";X["ar-eg"]["optionsLang_jp-jp"]="Japanese";X["ar-eg"]["optionsLang_it-it"]="Italian";X["ko-kr"]=X["ko-kr"]||{};X["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
X["ko-kr"].startScreenPlay="PLAY";X["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";X["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";X["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";X["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";X["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";X["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";X["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
X["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";X["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";X["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";X["ko-kr"].optionsQuit="\uc885\ub8cc";X["ko-kr"].optionsResume="\uacc4\uc18d";X["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";X["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";X["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";X["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
X["ko-kr"].optionsDifficulty_medium="\uc911";X["ko-kr"].optionsDifficulty_hard="\uc0c1";X["ko-kr"].optionsMusic_on="\ucf1c\uae30";X["ko-kr"].optionsMusic_off="\ub044\uae30";X["ko-kr"].optionsSFX_on="\ucf1c\uae30";X["ko-kr"].optionsSFX_off="\ub044\uae30";X["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";X["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";X["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";X["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
X["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";X["ko-kr"].optionsTitle="\uc124\uc815";X["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";X["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";X["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
X["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";X["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";X["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";X["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";X["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
X["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";X["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";X["ko-kr"].optionsAbout_version="\ubc84\uc804:";X["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";X["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";X["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";X["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
X["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";X["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";X["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";X["ko-kr"].optionsAbout_header="Developed by:";X["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";X["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";X["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";X["ko-kr"].challengeStartTextScore="<NAME>'s score:";
X["ko-kr"].challengeStartTextTime="<NAME>'s time:";X["ko-kr"].challengeStartScreenToWin="Amount to win:";X["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";X["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";X["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["ko-kr"].challengeCancelConfirmBtn_yes="Yes";X["ko-kr"].challengeCancelConfirmBtn_no="No";X["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";X["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";X["ko-kr"].challengeEndScreenName_you="You";X["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
X["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";X["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";X["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
X["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";X["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";X["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";X["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";X["ko-kr"].challengeForfeitConfirmBtn_no="No";X["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
X["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";X["ko-kr"].optionsChallengeForfeit="Forfeit";X["ko-kr"].optionsChallengeCancel="Quit";X["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["ko-kr"].levelEndScreenHighScore_time="Best time:";X["ko-kr"].levelEndScreenTotalScore_time="Total time:";
X["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";X["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";X["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";X["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";X["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";X["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";X["ko-kr"].optionsExit="Exit";X["ko-kr"].levelEndScreenTotalScore_number="Total score:";
X["ko-kr"].levelEndScreenHighScore_number="High score:";X["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";X["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
X["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["ko-kr"].optionsAbout_header_publisher="Published by:";X["ko-kr"]["optionsLang_jp-jp"]="Japanese";X["ko-kr"]["optionsLang_it-it"]="Italian";X["jp-jp"]=X["jp-jp"]||{};X["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";X["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";X["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";X["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
X["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";X["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";X["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";X["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";X["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";X["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";X["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
X["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";X["jp-jp"].optionsQuit="\u3084\u3081\u308b";X["jp-jp"].optionsResume="\u518d\u958b";X["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";X["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";X["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";X["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";X["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";X["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
X["jp-jp"].optionsMusic_on="\u30aa\u30f3";X["jp-jp"].optionsMusic_off="\u30aa\u30d5";X["jp-jp"].optionsSFX_on="\u30aa\u30f3";X["jp-jp"].optionsSFX_off="\u30aa\u30d5";X["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";X["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";X["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";X["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
X["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";X["jp-jp"].optionsTitle="\u8a2d\u5b9a";X["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";X["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";X["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
X["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";X["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";X["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";X["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";X["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
X["jp-jp"].optionsAbout_title="About";X["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";X["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";X["jp-jp"].optionsAbout_version="version";X["jp-jp"].optionsAbout="About";X["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";X["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";X["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";X["jp-jp"].startScreenByTinglyGames="by: CoolGames";
X["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";X["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";X["jp-jp"].optionsAbout_header="Developed by";X["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";X["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";X["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";X["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
X["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";X["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";X["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";X["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";X["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";X["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";X["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
X["jp-jp"].challengeCancelConfirmBtn_yes="Yes";X["jp-jp"].challengeCancelConfirmBtn_no="No";X["jp-jp"].challengeEndScreensBtn_submit="\u3042";X["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";X["jp-jp"].challengeEndScreenName_you="You";X["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";X["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";X["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
X["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";X["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";X["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";X["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";X["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
X["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";X["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";X["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";X["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";X["jp-jp"].challengeForfeitConfirmBtn_no="No";X["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";X["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
X["jp-jp"].optionsChallengeForfeit="Forfeit";X["jp-jp"].optionsChallengeCancel="Quit";X["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";X["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";X["jp-jp"].levelEndScreenHighScore_time="Best time:";X["jp-jp"].levelEndScreenTotalScore_time="Total time:";X["jp-jp"]["optionsLang_fr-fr"]="French";X["jp-jp"]["optionsLang_ko-kr"]="Korean";X["jp-jp"]["optionsLang_ar-eg"]="Arabic";
X["jp-jp"]["optionsLang_es-es"]="Spanish";X["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";X["jp-jp"]["optionsLang_ru-ru"]="Russian";X["jp-jp"].optionsExit="Exit";X["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";X["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";X["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
X["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";X["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";X["jp-jp"].optionsAbout_header_publisher="Published by:";X["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";X["jp-jp"]["optionsLang_it-it"]="Italian";X["it-it"]=X["it-it"]||{};X["it-it"].loadingScreenLoading="Caricamento...";
X["it-it"].startScreenPlay="GIOCA";X["it-it"].levelMapScreenTotalScore="Punteggio totale";X["it-it"].levelEndScreenTitle_level="Livello <VALUE>";X["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";X["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";X["it-it"].levelEndScreenTotalScore="Punteggio totale";X["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";X["it-it"].levelEndScreenTimeLeft="Tempo rimanente";X["it-it"].levelEndScreenTimeBonus="Tempo bonus";
X["it-it"].levelEndScreenHighScore="Record";X["it-it"].optionsStartScreen="Menu principale";X["it-it"].optionsQuit="Esci";X["it-it"].optionsResume="Riprendi";X["it-it"].optionsTutorial="Come si gioca";X["it-it"].optionsHighScore="Record";X["it-it"].optionsMoreGames="Altri giochi";X["it-it"].optionsDifficulty_easy="Facile";X["it-it"].optionsDifficulty_medium="Media";X["it-it"].optionsDifficulty_hard="Difficile";X["it-it"].optionsMusic_on="S\u00ec";X["it-it"].optionsMusic_off="No";
X["it-it"].optionsSFX_on="S\u00ec";X["it-it"].optionsSFX_off="No";X["it-it"]["optionsLang_en-us"]="Inglese (US)";X["it-it"]["optionsLang_en-gb"]="Inglese (UK)";X["it-it"]["optionsLang_nl-nl"]="Olandese";X["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";X["it-it"].gameEndScreenBtnText="Continua";X["it-it"].optionsTitle="Impostazioni";X["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
X["it-it"].optionsQuitConfirmBtn_No="No";X["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";X["it-it"].levelMapScreenTitle="Scegli un livello";X["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";X["it-it"].optionsRestart="Riavvia";X["it-it"].optionsSFXBig_on="Audio S\u00cc";X["it-it"].optionsSFXBig_off="Audio NO";X["it-it"].optionsAbout_title="Informazioni";X["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
X["it-it"].optionsAbout_backBtn="Indietro";X["it-it"].optionsAbout_version="versione:";X["it-it"].optionsAbout="Informazioni";X["it-it"].levelEndScreenMedal="MIGLIORATO!";X["it-it"].startScreenQuestionaire="Che ne pensi?";X["it-it"].levelMapScreenWorld_0="Scegli un livello";X["it-it"].startScreenByTinglyGames="di: CoolGames";X["it-it"]["optionsLang_de-de"]="Tedesco";X["it-it"]["optionsLang_tr-tr"]="Turco";X["it-it"].optionsAbout_header="Sviluppato da:";X["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
X["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";X["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";X["it-it"].challengeStartTextScore="punteggio di <NAME>:";X["it-it"].challengeStartTextTime="tempo di <NAME>:";X["it-it"].challengeStartScreenToWin="Necessario per vincere:";X["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";X["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
X["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";X["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";X["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";X["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";X["it-it"].challengeCancelConfirmBtn_no="No";X["it-it"].challengeEndScreensBtn_submit="Invia la sfida";X["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
X["it-it"].challengeEndScreenName_you="Tu";X["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";X["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";X["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";X["it-it"].challengeCancelMessage_success="Sfida annullata.";X["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
X["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";X["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";X["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";X["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";X["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";X["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
X["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";X["it-it"].challengeForfeitConfirmBtn_no="No";X["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";X["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";X["it-it"].optionsChallengeForfeit="Abbandona";X["it-it"].optionsChallengeCancel="Esci";X["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";X["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
X["it-it"].levelEndScreenHighScore_time="Miglior tempo:";X["it-it"].levelEndScreenTotalScore_time="Tempo totale:";X["it-it"]["optionsLang_fr-fr"]="Francese";X["it-it"]["optionsLang_ko-kr"]="Coreano";X["it-it"]["optionsLang_ar-eg"]="Arabo";X["it-it"]["optionsLang_es-es"]="Spagnolo";X["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";X["it-it"]["optionsLang_ru-ru"]="Russo";X["it-it"].optionsExit="Esci";X["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
X["it-it"].levelEndScreenHighScore_number="Record:";X["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";X["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
X["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";X["it-it"].optionsAbout_header_publisher="Distribuito da:";X["it-it"]["optionsLang_jp-jp"]="Giapponese";X["it-it"]["optionsLang_it-it"]="Italiano";X=X||{};X["nl-nl"]=X["nl-nl"]||{};X["nl-nl"].game_ui_SCORE="SCORE";X["nl-nl"].game_ui_STAGE="LEVEL";X["nl-nl"].game_ui_LIVES="LEVENS";X["nl-nl"].game_ui_TIME="TIJD";X["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";X["nl-nl"].game_ui_LEVEL="LEVEL";X["nl-nl"].game_ui_time_left="Resterende tijd";
X["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";X["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";X["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";X["en-us"]=X["en-us"]||{};X["en-us"].game_ui_SCORE="SCORE";X["en-us"].game_ui_STAGE="STAGE";X["en-us"].game_ui_LIVES="LIVES";X["en-us"].game_ui_TIME="TIME";X["en-us"].game_ui_HIGHSCORE="HIGH SCORE";X["en-us"].game_ui_LEVEL="LEVEL";X["en-us"].game_ui_time_left="Time left";X["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";X["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
X["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";X["en-gb"]=X["en-gb"]||{};X["en-gb"].game_ui_SCORE="SCORE";X["en-gb"].game_ui_STAGE="STAGE";X["en-gb"].game_ui_LIVES="LIVES";X["en-gb"].game_ui_TIME="TIME";X["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";X["en-gb"].game_ui_LEVEL="LEVEL";X["en-gb"].game_ui_time_left="Time left";X["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";X["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";X["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";X["de-de"]=X["de-de"]||{};
X["de-de"].game_ui_SCORE="PUNKTE";X["de-de"].game_ui_STAGE="STUFE";X["de-de"].game_ui_LIVES="LEBEN";X["de-de"].game_ui_TIME="ZEIT";X["de-de"].game_ui_HIGHSCORE="HIGHSCORE";X["de-de"].game_ui_LEVEL="LEVEL";X["de-de"].game_ui_time_left="Restzeit";X["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";X["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";X["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";X["fr-fr"]=X["fr-fr"]||{};X["fr-fr"].game_ui_SCORE="SCORE";X["fr-fr"].game_ui_STAGE="SC\u00c8NE";
X["fr-fr"].game_ui_LIVES="VIES";X["fr-fr"].game_ui_TIME="TEMPS";X["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";X["fr-fr"].game_ui_LEVEL="NIVEAU";X["fr-fr"].game_ui_time_left="Temps restant";X["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";X["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";X["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";X["pt-br"]=X["pt-br"]||{};X["pt-br"].game_ui_SCORE="PONTOS";X["pt-br"].game_ui_STAGE="FASE";X["pt-br"].game_ui_LIVES="VIDAS";X["pt-br"].game_ui_TIME="TEMPO";
X["pt-br"].game_ui_HIGHSCORE="RECORDE";X["pt-br"].game_ui_LEVEL="N\u00cdVEL";X["pt-br"].game_ui_time_left="Tempo restante";X["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";X["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";X["pt-br"].game_ui_HIGHSCORE_break="RECORDE";X["es-es"]=X["es-es"]||{};X["es-es"].game_ui_SCORE="PUNTOS";X["es-es"].game_ui_STAGE="FASE";X["es-es"].game_ui_LIVES="VIDAS";X["es-es"].game_ui_TIME="TIEMPO";X["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
X["es-es"].game_ui_LEVEL="NIVEL";X["es-es"].game_ui_time_left="Tiempo restante";X["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";X["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";X["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";X["tr-tr"]=X["tr-tr"]||{};X["tr-tr"].game_ui_SCORE="SKOR";X["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";X["tr-tr"].game_ui_LIVES="HAYATLAR";X["tr-tr"].game_ui_TIME="S\u00dcRE";X["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";X["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
X["tr-tr"].game_ui_time_left="Kalan zaman";X["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";X["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";X["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";X["ru-ru"]=X["ru-ru"]||{};X["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";X["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";X["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";X["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
X["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";X["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";X["ru-ru"].game_ui_time_left="Time left";X["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";X["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";X["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";X["ar-eg"]=X["ar-eg"]||{};X["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";X["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
X["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";X["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";X["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";X["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";X["ar-eg"].game_ui_time_left="Time left";X["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";X["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";X["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
X["ko-kr"]=X["ko-kr"]||{};X["ko-kr"].game_ui_SCORE="\uc810\uc218";X["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";X["ko-kr"].game_ui_LIVES="\uae30\ud68c";X["ko-kr"].game_ui_TIME="\uc2dc\uac04";X["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";X["ko-kr"].game_ui_LEVEL="\ub808\ubca8";X["ko-kr"].game_ui_time_left="Time left";X["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";X["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";X["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
X["jp-jp"]=X["jp-jp"]||{};X["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";X["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";X["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";X["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";X["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";X["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";X["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";X["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";X["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
X["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";X["it-it"]=X["it-it"]||{};X["it-it"].game_ui_SCORE="PUNTEGGIO";X["it-it"].game_ui_STAGE="FASE";X["it-it"].game_ui_LIVES="VITE";X["it-it"].game_ui_TIME="TEMPO";X["it-it"].game_ui_HIGHSCORE="RECORD";X["it-it"].game_ui_LEVEL="LIVELLO";X["it-it"].game_ui_time_left="TEMPO RIMANENTE";X["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";X["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";X["it-it"].game_ui_HIGHSCORE_break="RECORD";
var yg={};
function zg(){yg={Zd:{Rk:"en-us",Rj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Pd:{Hc:O(1040),oq:O(960),Qb:O(640),yg:O(640),kf:O(0),ll:O(-80),jf:0,minHeight:O(780),Qm:{id:"canvasBackground",depth:50},Dc:{id:"canvasGame",depth:100,top:O(200,"round"),left:O(40,"round"),width:O(560,"round"),height:O(560,"round")},Ec:{id:"canvasGameUI",depth:150,top:0,left:0,height:O(120,"round")},ef:{id:"canvasMain",depth:200}},ck:{Hc:O(640),oq:O(640),Qb:O(1152),yg:O(1152),
kf:O(0),ll:O(0),jf:0,minHeight:O(640),minWidth:O(850),Qm:{id:"canvasBackground",depth:50},Dc:{id:"canvasGame",depth:100,top:O(40,"round"),left:O(296,"round"),width:O(560,"round"),height:O(560,"round")},Ec:{id:"canvasGameUI",depth:150,top:0,left:O(151),width:O(140)},ef:{id:"canvasMain",depth:200}},Ob:{bigPlay:{type:"text",w:mf,wa:O(38),lb:O(99),font:{align:"center",h:"middle",fontSize:P({big:46,small:30}),fillColor:"#01198a",T:{j:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Wc:2,Xc:O(30),fontSize:P({big:46,
small:30})},difficulty_toggle:{type:"toggleText",w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"0",w:Dc,L:"optionsDifficulty_easy"},{id:"1",w:Cc,L:"optionsDifficulty_medium"},{id:"2",w:Bc,L:"optionsDifficulty_hard"}],rh:O(30),sh:O(12),Zf:O(10),Wc:2,Xc:O(30),fontSize:P({big:40,small:20})},music_toggle:{type:"toggle",w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,
small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"on",w:qf,L:"optionsMusic_on"},{id:"off",w:pf,L:"optionsMusic_off"}],rh:O(30),sh:O(12),Zf:0,Wc:2,Xc:O(30)},sfx_toggle:{type:"toggle",w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"on",w:of,L:"optionsSFX_on"},{id:"off",w:nf,L:"optionsSFX_off"}],rh:O(30),sh:O(12),Zf:0,Wc:2,Xc:O(30)},music_big_toggle:{type:"toggleText",
w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"on",w:"undefined"!==typeof od?od:void 0,L:"optionsMusic_on"},{id:"off",w:"undefined"!==typeof pd?pd:void 0,L:"optionsMusic_off"}],rh:O(28,"round"),sh:O(10),Zf:O(10),Wc:2,Xc:O(30),fontSize:P({big:40,small:20})},sfx_big_toggle:{type:"toggleText",w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",
T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"on",w:"undefined"!==typeof md?md:void 0,L:"optionsSFXBig_on"},{id:"off",w:"undefined"!==typeof nd?nd:void 0,L:"optionsSFXBig_off"}],rh:O(33,"round"),sh:O(12),Zf:O(10),Wc:2,Xc:O(30),fontSize:P({big:40,small:20})},language_toggle:{type:"toggleText",w:lf,wa:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},V:[{id:"en-us",w:Ec,L:"optionsLang_en-us"},
{id:"en-gb",w:Fc,L:"optionsLang_en-gb"},{id:"nl-nl",w:Gc,L:"optionsLang_nl-nl"},{id:"de-de",w:Ic,L:"optionsLang_de-de"},{id:"fr-fr",w:Jc,L:"optionsLang_fr-fr"},{id:"pt-br",w:Kc,L:"optionsLang_pt-br"},{id:"es-es",w:Lc,L:"optionsLang_es-es"},{id:"ru-ru",w:Nc,L:"optionsLang_ru-ru"},{id:"it-it",w:Qc,L:"optionsLang_it-it"},{id:"ar-eg",w:Oc,L:"optionsLang_ar-eg"},{id:"ko-kr",w:Pc,L:"optionsLang_ko-kr"},{id:"tr-tr",w:Hc,L:"optionsLang_tr-tr"},{id:"jp-jp",w:Mc,L:"optionsLang_jp-jp"}],rh:O(40),sh:O(20),Zf:O(10),
Wc:2,Xc:O(30),fontSize:P({big:40,small:20})},default_text:{type:"text",w:jf,wa:O(40),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Wc:2,Xc:O(30),fontSize:P({big:40,small:20})},default_image:{type:"image",w:jf,wa:O(40),lb:O(40),Xc:O(6)},options:{type:"image",w:kf}},Om:{bigPlay:{type:"text",w:mf,wa:O(40),lb:O(76),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#01198a",T:{j:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Wc:2,Xc:O(30),fontSize:P({big:40,small:20})}},gi:{green:{font:{align:"center",h:"middle",fillColor:"#018a17",T:{j:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",h:"middle",fillColor:"#01198a",T:{j:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",h:"middle",fillColor:"#004f89",T:{j:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",h:"middle",fillColor:"#9a1900",T:{j:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",h:"middle",fillColor:"#8d2501",T:{j:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",h:"middle",fillColor:"#c6258f",T:{j:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",h:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",h:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",T:{j:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",T:{j:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ca:{bz:20},jd:{backgroundImage:"undefined"!==typeof yf?yf:void 0,Dw:0,ku:500,fl:5E3,iw:5E3,Is:-1,Vy:12,Uy:100,le:O(78),$o:{align:"center"},fm:O(560),Ng:O(400),Og:{align:"center"},Cf:O(680),Fe:O(16),Sn:O(18),Li:O(8),Jr:O(8),Kr:O(9),Lr:O(9),jj:{align:"center",fillColor:"#3B0057",fontSize:O(24)},et:{align:"center"},
ft:O(620),em:O(500),Mi:"center",Ef:O(500),Oi:O(60),Ab:{align:"center"},sc:{align:"bottom",offset:O(20)},Xn:O(806),Vn:500,Yv:O(20)},Un:{Mi:"right",fm:O(280),Cf:O(430),Ef:O(340),Ab:{align:"right",offset:O(32)},sc:O(560),Xn:O(560)},Sl:{Mm:O(860),backgroundImage:void 0!==typeof yf?yf:void 0,$u:700,es:1800,uw:700,ox:2600,Hg:void 0!==typeof yf?Bd:void 0,gd:700,zi:{align:"center"},Bk:{align:"center"},Ai:void 0!==typeof Bd?-Bd.height:0,Gg:{align:"top",offset:O(20)},un:1,Qq:1,vn:1,Rq:1,tn:1,Pq:1,dv:L,ev:M,
bv:L,cv:L,av:L,nx:{align:"center"},Vi:O(656),Ui:O(300),wl:700,mx:700,rq:O(368),kk:O(796),pi:O(440),qq:700,co:O(36),jl:O(750),tw:500,Mi:"center",Ef:O(500),Oi:O(60),Ab:{align:"center"},sc:{align:"bottom",offset:O(20)},Xn:O(806),Vn:500,Yv:O(20)},Tl:{Mm:O(0),Vi:O(456),Ui:O(320),rq:{align:"center"},kk:O(346),pi:O(460),co:{align:"left",offset:O(32)},jl:O(528),Mi:"right",Ef:O(340),Ab:{align:"right",offset:O(32)},sc:O(560),Xn:O(560)},De:{dx:{align:"center",offset:O(-230)},mo:{align:"top",offset:O(576)},cx:"options",
Jb:{h:"bottom"},Ne:{align:"center"},Zb:{align:"top",offset:O(35,"round")},rd:O(232),me:O(98),Az:{align:"center",offset:O(-206)},rp:{align:"top",offset:O(30)},zz:{align:"center",offset:O(206)},qp:{align:"top",offset:O(30)},type:"grid",$w:3,KA:3,ax:5,LA:4,vq:!0,Mu:!0,Dn:O(78),Wq:{align:"top",offset:O(140)},Yq:{align:"top",offset:O(140)},Xq:O(20),kv:O(18),lv:O(18),Lv:{yn:{fontSize:P({big:60,small:30}),fillColor:"#3F4F5E",align:"center",h:"middle",T:{j:!0,color:"#D0D8EA",offsetX:0,offsetY:O(6),blur:0}}},
Mv:{yn:{fontSize:P({big:32,small:16}),fillColor:"#3F4F5E",align:"center",h:"middle",T:{j:!0,color:"#D0D8EA",offsetX:0,offsetY:O(2),blur:0}}},Fr:O(438),Gr:O(438),xr:{align:"center"},yr:{align:"center"},Nr:{align:"center"},Or:{align:"center",offset:O(-22)},Br:{align:"center"},Cr:{align:"center",offset:O(-10)},sy:{align:"center",offset:O(216)},To:{align:"top",offset:O(574)},So:{fontSize:P({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Ms:O(10),zl:{fontSize:P({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},ps:{align:"center"},so:{align:"top",offset:O(588)},rx:O(160),qx:O(40),backgroundImage:"undefined"!==typeof tf?tf:void 0,Py:O(10),Qy:200,Oy:O(200),HA:O(600),Iw:800,Hw:500},zr:{rp:{align:"top",offset:O(20)},qp:{align:"top",offset:O(20)},Zb:{align:"top",offset:O(25,"round")},Dn:O(234),Wq:{align:"top",offset:O(110)},Yq:{align:"top",offset:O(110)},To:{align:"top",offset:O(536)},so:{align:"top",offset:O(550)},mo:{align:"top",offset:O(538)}},Nv:{Qc:"undefined"!==typeof qd?qd:void 0,ks:{align:"center"},
Si:"undefined"!==typeof qd?-qd.height:void 0,oo:[{type:"y",sa:0,duration:800,end:{align:"center",offset:O(-142)},Oa:M,wc:gg}],js:[{type:"y",sa:0,duration:600,end:"undefined"!==typeof qd?-qd.height:void 0,Oa:fc,Zj:!0}],bu:{align:"center",h:"middle"},eu:{align:"center"},fu:0,du:O(500),cu:O(80),tv:{align:"center",h:"middle"},uv:{align:"center"},vv:0,tA:O(560),sA:O(80),ns:3500},GA:{oo:[{type:"y",sa:0,duration:800,end:{align:"center"},Oa:M,wc:gg}]},Sm:{Qc:"undefined"!==typeof s_overlay_challenge_start?
s_overlay_challenge_start:void 0,ks:{align:"center"},Si:O(56),Jf:0,Xg:0,Jb:{align:"center",h:"top"},rd:O(500),me:O(100),Ne:{align:"center"},Zb:O(90),Nw:{align:"center",h:"middle"},Rw:O(500),Qw:O(80),Uw:{align:"center"},Vw:O(250),Mx:{align:"center",h:"top"},Ox:O(500),Nx:O(40),Px:{align:"center"},Qx:O(348),Lx:{align:"center",h:"top"},Tx:O(500),Sx:O(50),Vx:{align:"center"},Wx:O(388),lz:{align:"center",h:"top"},nz:O(500),mz:O(40),oz:{align:"center"},pz:O(442),CB:0,DB:0,kz:{align:"center",h:"top"},rz:O(500),
qz:O(50),sz:{align:"center"},tz:O(482),BB:O(10),zB:0,AB:0,te:800,Nj:M,Oj:600,Pj:fc,ns:3500},Rm:{Qp:500,te:800,Yw:1500,ho:500,Ux:2500,Fo:500,Xx:3200,Yx:800,kl:4200,Qg:300,vu:4500,jx:{align:"center"},kx:O(-800),Wg:{align:"center"},If:O(52),Jf:0,Xg:0,ri:.8,hn:"#000000",Qi:{align:"center",h:"middle"},fo:O(360),Wr:O(120),ww:O(4),xw:O(4),Bw:{align:"center"},Cw:O(340),Gy:{align:"center"},Hy:O(600),Vo:O(500),Vs:O(120),pB:{align:"center",h:"middle"},nm:{align:"center",h:"middle"},pp:O(360),Mt:O(60),uz:O(4),
vz:O(4),wz:{align:"center"},xz:O(480),cm:O(460),Ky:{align:"center"},Ly:O(400),wu:{align:"center"},xu:O(500),cs:{align:"center",h:"middle"},Xw:O(75,"round"),Ww:O(48),Zw:O(120),bs:O(214,"round"),as:O(40),Ow:O(4),Pw:O(4),Sw:0,Tw:0,Aq:{align:"center",h:"middle"},Ru:O(220),Qu:O(180),Bq:O(80),zq:O(4),Pu:O(4)},ia:{sl:{K:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,Tu:"undefined"!==typeof s_overlay_endless?s_overlay_endless:void 0,Ov:"undefined"!==typeof xf?xf:void 0,Kv:"undefined"!==
typeof rd?rd:void 0},Ty:500,te:800,Nj:M,Oj:800,Pj:bc,Db:{align:"center"},kb:0,Jb:{align:"center",h:"middle",fontSize:P({big:26,small:13})},Ne:{align:"center"},Zb:O(58),rd:O(500),me:O(100),Xo:{align:"center",h:"middle",fontSize:P({big:56,small:28})},Iy:{align:"center"},Jy:O(236),qk:{align:"center",h:"top",fontSize:P({big:24,small:12})},Cq:{align:"center"},dn:O(144),Bg:{align:"center",h:"top",fontSize:P({big:56,small:28})},uk:{align:"center"},Cg:O(176),tk:O(200),sk:O(60),jh:{align:"center",h:"top",
fontSize:P({big:24,small:12})},Me:{align:"center"},Vf:O(286),Ss:O(0),Lq:!1,Sc:O(14),Zl:O(10),Le:{align:"center",h:"top",fontSize:P({big:24,small:12})},hh:O(10),ih:O(4),kh:O(200),oB:O(50),iu:{align:"center",offset:O(12)},Vp:O(549),Zu:{align:"center",offset:O(162)},Mq:O(489),ii:{align:"center",offset:O(250)},wg:O(10),vg:O(90),gf:O(90),Mo:{align:"center",offset:O(-177,"round")},No:O(120),Oo:{align:"center"},Po:O(96),Qo:{align:"center",offset:O(179,"round")},Ro:O(120),mB:200,oy:500,Js:800,Ls:0,ry:0,qy:300,
py:200,Ks:300,ri:.8,rb:800,hn:"#000000",ao:O(508),il:O(394),Rr:O(96),Sr:O(74),gl:3,Pg:400,jw:2500,JA:0,mw:O(100),Tr:1.5,rw:{align:"center"},sw:O(76),hl:O(180),qw:O(36),Ur:{align:"center",h:"middle",fontSize:P({big:22,small:12}),t:"ff_opensans_extrabold",fillColor:"#1d347f",T:{j:!0,color:"#68cbfa",offsetY:O(2)}},Qr:500,kw:500,lw:O(-30),ow:500,nw:0,pw:4E3,im:600,fz:1500,bq:500,qg:750,xv:{align:"center"},yv:O(290),dr:O(350),Fw:1E3,type:{level:{Vj:"level",uc:!0,eh:!0,qh:"title_level",he:"totalScore",
Sj:"retry",wk:"next"},failed:{Vj:"failed",uc:!1,eh:!1,qh:"title_level",Ws:"subtitle_failed",Sj:"exit",wk:"retry"},endless:{Vj:"endless",uc:!1,eh:!0,qh:"title_endless",rk:"totalScore",he:"highScore",Sj:"exit",wk:"retry"},difficulty:{Vj:"difficulty",uc:!1,eh:!0,qh:"title_difficulty",rk:"timeLeft",he:["totalScore","timeBonus"],Sj:"exit",wk:"retry"}}},wr:{wg:O(0),Zb:O(30),dn:O(114),Cg:O(146),Vf:O(266),Vp:O(488),Mq:O(428),ao:{align:"center",offset:O(220)},il:O(260)},Hi:{backgroundImage:"undefined"!==typeof Ze?
Ze:void 0},options:{backgroundImage:wf,Db:{align:"center"},kb:0,Jb:{},Ne:{align:"center"},Zb:O(58),rd:O(500),me:O(100),ak:O(460,"round"),$j:{align:"center"},cf:{align:"center",offset:O(36)},ad:O(10,"round"),ii:O(510),wg:O(10),vg:O(130),gf:O(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames","quit"]},Gf:800,Hf:M,Ug:600,Vg:bc,nq:{align:"center"},
Wm:O(260),gk:O(460),Vm:O(300),lq:{align:"center"},Um:O(460),kq:{align:"center"},Tm:O(560,"round"),li:O(460,"round"),Yi:{},sd:"undefined"!==typeof vf?vf:void 0,km:{align:"center"},Oe:O(84,"round"),pj:{align:"center",h:"top"},lm:O(480),gp:O(46),xt:{align:"center"},hp:O(110,"round"),ut:{align:"center"},ep:O(160,"round"),wt:{align:"center"},fp:O(446,"round"),oj:{h:"middle",align:"center",fontSize:P({big:36,small:18})},wh:O(480),vt:O(160),tt:{align:"center",offset:O(-80,"round")},dp:O(556,"round"),st:{align:"center",
offset:O(80,"round")},cp:O(556,"round"),Gj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),aa:O(6)},Hj:O(480),Kp:O(50),Ij:{align:"center"},Xh:O(106,"round"),Zh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),aa:O(6)},Xe:O(480),$h:O(110),ng:{align:"center"},ai:O(396,"round"),Yh:{align:"center"},Jj:O(140),Bm:{align:"center"},Vh:O(500),Wh:O(480),Cm:{align:"center",h:"top",fillColor:"#808080",fontSize:P({big:12,small:8})},Np:{align:"center"},Dm:O(610),
Mp:O(440),Lp:O(20),og:O(200),Kj:O(200),Ht:O(80),It:O(140),Gt:O(10)},ex:{Zb:O(12),cf:{align:"center",offset:O(16)},Wm:O(200),Vm:O(300),Um:O(400),Tm:O(500,"round"),Oe:O(60,"round"),hp:O(80,"round"),ep:O(134,"round"),fp:O(410,"round"),dp:O(500,"round"),cp:O(500,"round"),Xh:O(86,"round"),Jj:O(126),ai:O(392,"round"),Vh:O(490),Dm:O(590)},fs:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:wf,Db:{align:"center"},kb:O(120),Jb:{},Ne:{align:"center"},Zb:O(200),ak:O(460,
"round"),$j:{align:"center"},cf:{align:"center",offset:O(140)},ad:O(10,"round"),ii:O(510),wg:O(10),vg:O(130),gf:O(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},Gf:800,Hf:M,Ug:600,Vg:bc,Yi:{},$A:{align:"center"},aB:O(360),ZA:O(460),YA:O(300),UA:"default_text",VA:{align:"center"},WA:O(630),RA:"default_text",SA:{align:"center"},
TA:O(730,"round"),XA:O(460,"round"),mq:{},nq:{align:"center"},Wm:O(200),gk:O(460),Vm:O(250),lq:{align:"center"},Um:O(520),kq:{align:"center"},Tm:O(620,"round"),li:O(460,"round"),Qi:{},zw:{align:"center"},Aw:O(200),eo:O(460),yw:O(300),sd:"undefined"!==typeof vf?vf:void 0,km:{align:"center"},Oe:O(0,"round"),pj:{align:"center",h:"top"},lm:O(480),gp:O(50),xt:{align:"center"},hp:O(20,"round"),ut:{align:"center"},ep:O(70,"round"),wt:{align:"center"},fp:O(356,"round"),oj:{h:"middle",align:"center",fontSize:P({big:36,
small:18})},wh:O(480),vt:O(150),tt:O(224,"round"),dp:O(636,"round"),st:O(350,"round"),cp:O(636,"round"),Gj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),aa:O(6)},Hj:O(480),Kp:O(50),Ij:{align:"center"},Xh:O(26,"round"),Zh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),aa:O(6)},Xe:O(480),$h:O(110),ng:{align:"center"},ai:O(316,"round"),Yh:{align:"center"},Jj:O(60),Bm:{align:"center"},Vh:O(420),Wh:O(480),Cm:{align:"center",h:"top",fillColor:"#808080",
fontSize:P({big:12,small:8})},Np:{align:"center"},Dm:O(530),Mp:O(440),Lp:O(20),og:O(200),Kj:O(200),Ht:O(80),It:O(100),Gt:O(10)},bd:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:wf,Db:{align:"center"},kb:O(120),ak:O(460,"round"),$j:{align:"center"},cf:{align:"bottom",offset:O(20)},ad:O(10,"round"),ii:O(510),wg:O(10),vg:O(130),gf:O(90),Gf:800,Hf:M,Ug:600,Vg:bc,uo:{},zx:{align:"center"},rs:{align:"center",offset:O(40)},El:O(460),Dl:O(300),Wo:{},xx:{align:"center"},yx:{align:"center",
offset:O(160)},wx:O(460),vx:O(200)},zk:{backgroundImage:"undefined"!==typeof sd?sd:void 0,et:{align:"center"},ft:O(152),em:O(560),Sy:O(560),font:{align:"center",h:"middle",fontSize:P({big:52,small:26}),fillColor:"#FFFFFF"},tu:{align:"center"},eq:O(600),dq:O(460),cq:"default_text"},on:{eq:O(520)}}}var Ag={tx:"poki",ej:{Wv:!1,$m:[]},Zd:{Rk:"en-us",Rj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},Yp:{show:!1}},Bg=Bg||{};Bg.xi={Ak:"8d65b6b1bc2f9af242a45a429c07a6c7",Ml:"16691e664c4c5804c5ccb640b137bec48ebf5d95"};
var Cg={};
function Dg(){Cg={o:{jA:"TinglySolitaire"},buttons:{default_color:"green",bigPlay:"blue"},Yb:{Km:.2},De:{lu:[{w:"undefined"!==typeof tf?tf:void 0,x:0,y:0}],Jb:{t:V.t,align:"center",h:"middle",fillColor:"#004f5d",fontSize:P({big:36,small:18})},So:{t:V.t,fontSize:P({big:34,small:18}),fillColor:"#004f5d",align:"center"},zl:{t:V.t,fontSize:P({big:34,small:18}),fillColor:"#004f5d",align:"center"}},Nv:{Si:-qd.height,bu:{t:V.t,align:"center",h:"top",fontSize:P({big:38,small:19}),fillColor:"#001d5c"},eu:{align:"center"},
fu:O(412,"round"),du:O(500),cu:O(80),tv:{t:V.t,fontSize:P({big:46,small:23}),fillColor:"#000000",align:"center",h:"middle"},uv:{align:"center"},vv:O(370,"round")},ia:{Db:{align:"center"},kb:O(2),Si:"undefined"!==typeof s_overlay_endless?-s_overlay_endless.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof xf?-xf.height:0,oo:[{type:"y",sa:0,duration:800,end:O(14),Oa:M,Zj:!0}],js:[{type:"y",sa:0,duration:600,end:"undefined"!==typeof s_overlay_endless?
-s_overlay_endless.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof xf?-xf.height:0,Oa:bc,Zj:!0}],Jb:{t:V.t,align:"center",h:"top",fontSize:P({big:44,small:22}),fillColor:"#001d5c"},dz:!0,qk:{t:V.t,align:"center",h:"top",fillColor:"#586386",fontSize:P({big:36,small:18})},Bg:{t:V.t,align:"center",h:"top",fillColor:"#001d5c",fontSize:P({big:76,small:38})},jh:{t:V.t,h:"bottom",fillColor:"#586386",fontSize:P({big:34,small:18})},Sc:O(4),Le:{t:V.t,h:"bottom",
fillColor:"#001d5c",fontSize:P({big:30,small:15})},Xo:{t:V.t,align:"center",h:"middle",fontSize:P({big:72,small:36}),fillColor:"#01513d"}},options:{Gf:800,Hf:M,Ug:600,Vg:bc,Yi:{align:"center",h:"middle",fontSize:P({big:30,small:15}),fillColor:"#001d5c"},Jb:{t:V.t,align:"center",h:"top",fontSize:P({big:40,small:20}),fillColor:"#001d5c"},Zb:O(21),oj:{h:"middle",align:"center",fontSize:P({big:26,small:13}),fillColor:"#004f5d"},pj:{align:"center",h:"top",fontSize:P({big:36,small:18}),fillColor:"#004f5d"}},
zk:{font:{t:V.t,align:"center",h:"middle",fontSize:P({big:72,small:36}),fillColor:"#037564",stroke:!0,Tc:O(5,"round"),strokeColor:"#ffffff",je:!0}}}}X=X||{};X["nl-nl"]=X["nl-nl"]||{};X["nl-nl"].ShuffleConfirmationText="Er zijn geen identieke steentjes meer. Wil je het bord herschikken?";X["nl-nl"].ShuffleConfirmationTitle="Herschikken";X["nl-nl"].ShuffleConfirmBtnText="Herschikken";X["nl-nl"].ShuffleConfirmBtnTitle="Doorgaan en het bord herschikken?";X["nl-nl"].ShuffleRestartBtnText="Herstarten";
X["nl-nl"].ShuffleRestartBtnTitle="Spel herstarten en opnieuw proberen";X["nl-nl"].TutorialText_0="Vind twee identieke steentjes.";X["nl-nl"].TutorialText_1="#touch{Verwijder de steentjes door er op te klikken.}{Verwijder de steentjes door er op te tikken.}";X["nl-nl"].TutorialText_2="Alleen steentjes die je opzij kunt bewegen\u2026";X["nl-nl"].TutorialText_3="... zonder daarbij andere steentjes te verstoren, mag je verwijderen.";X["nl-nl"].TutorialText_4="Voltooi het spel door alle steentjes te verwijderen.";
X["nl-nl"].TutorialTitle_0="Speluitleg";X["nl-nl"].TutorialTitle_1="Steentjes verwijderen";X["nl-nl"].TutorialTitle_2="Let op!";X["nl-nl"].TutorialTitle_3="Let op!";X["nl-nl"].TutorialTitle_4="Het spel voltooien";X["nl-nl"].levelMapScreenWorld_1="Level 13-24";X["nl-nl"].levelMapScreenWorld_0="Level 1-12";X["nl-nl"].floater_0="Goed";X["nl-nl"].floater_1="Mooi!";X["nl-nl"].floater_2="Geweldig!";X["nl-nl"].floater_3="Fantastisch!";X["en-us"]=X["en-us"]||{};X["en-us"].ShuffleConfirmationText="There are no more possible matches. Would you like to reshuffle the board?";
X["en-us"].ShuffleConfirmationTitle="Reshuffle";X["en-us"].ShuffleConfirmBtnText="RESHUFFLE";X["en-us"].ShuffleConfirmBtnTitle="Continue by reshuffling the board";X["en-us"].ShuffleRestartBtnText="RESTART";X["en-us"].ShuffleRestartBtnTitle="Try again by restarting the game";X["en-us"].TutorialText_0="Find 2 identical tiles.";X["en-us"].TutorialText_1="#touch{Remove the identical tiles by clicking on them.}{Remove the identical tiles by tapping on them.}";X["en-us"].TutorialText_2="You can only remove tiles that can be moved to the right...";
X["en-us"].TutorialText_3="...or left without disturbing other tiles.";X["en-us"].TutorialText_4="Complete the game by removing all the tiles.";X["en-us"].TutorialTitle_0="How to play";X["en-us"].TutorialTitle_1="Removing tiles";X["en-us"].TutorialTitle_2="Pay attention!";X["en-us"].TutorialTitle_3="Pay attention!";X["en-us"].TutorialTitle_4="Completing the game";X["en-us"].levelMapScreenWorld_1="Level 13-24";X["en-us"].levelMapScreenWorld_0="Level 1-12";X["en-us"].floater_0="Good";
X["en-us"].floater_1="Nice!";X["en-us"].floater_2="Great!";X["en-us"].floater_3="Awesome!";X["en-gb"]=X["en-gb"]||{};X["en-gb"].ShuffleConfirmationText="There are no more possible matches. Would you like to reshuffle the board?";X["en-gb"].ShuffleConfirmationTitle="Reshuffle";X["en-gb"].ShuffleConfirmBtnText="Reshuffle";X["en-gb"].ShuffleConfirmBtnTitle="Continue by reshuffling the board";X["en-gb"].ShuffleRestartBtnText="Restart";X["en-gb"].ShuffleRestartBtnTitle="Try again by restarting the game";
X["en-gb"].TutorialText_0="Find 2 identical tiles.";X["en-gb"].TutorialText_1="#touch{Remove the identical tiles by clicking on them.}{Remove the identical tiles by tapping on them.}";X["en-gb"].TutorialText_2="You can only remove tiles that can be moved to the right...";X["en-gb"].TutorialText_3="...or left without disturbing other tiles.";X["en-gb"].TutorialText_4="Complete the game by removing all the tiles.";X["en-gb"].TutorialTitle_0="How to play";X["en-gb"].TutorialTitle_1="Removing tiles";
X["en-gb"].TutorialTitle_2="Pay attention!";X["en-gb"].TutorialTitle_3="Pay attention!";X["en-gb"].TutorialTitle_4="Completing the game";X["en-gb"].levelMapScreenWorld_1="Level 13-24";X["en-gb"].levelMapScreenWorld_0="Level 1-12";X["en-gb"].floater_0="Good";X["en-gb"].floater_1="Nice!";X["en-gb"].floater_2="Great!";X["en-gb"].floater_3="Awesome!";X["de-de"]=X["de-de"]||{};X["de-de"].ShuffleConfirmationText="Es sind keine weiteren Kombinationen m\u00f6glich. M\u00f6chtest du die Steine neu mischen?";
X["de-de"].ShuffleConfirmationTitle="Mischen";X["de-de"].ShuffleConfirmBtnText="Mischen";X["de-de"].ShuffleConfirmBtnTitle="Steine mischen und weiterspielen";X["de-de"].ShuffleRestartBtnText="Neustart";X["de-de"].ShuffleRestartBtnTitle="Spiel neu starten und noch mal versuchen";X["de-de"].TutorialText_0="Finde zwei identische Steine.";X["de-de"].TutorialText_1="#touch{Mit einem Klick auf die zueinander passenden Steine entfernst du sie.}{Durch Tippen auf die zueinander passenden Steine entfernst du sie.}";
X["de-de"].TutorialText_2="Steine k\u00f6nnen nur entfernt werden, wenn du sie nach rechts ...";X["de-de"].TutorialText_3="... oder links verschieben kannst, ohne andere Steine zu st\u00f6ren.";X["de-de"].TutorialText_4="Schlie\u00dfe das Spiel ab, indem du alle Steine entfernst.";X["de-de"].TutorialTitle_0="So wird gespielt";X["de-de"].TutorialTitle_1="Steine entfernen";X["de-de"].TutorialTitle_2="Achtung!";X["de-de"].TutorialTitle_3="Achtung!";X["de-de"].TutorialTitle_4="Das Spiel abschlie\u00dfen";
X["de-de"].levelMapScreenWorld_1="Level 13-24";X["de-de"].levelMapScreenWorld_0="Level 1-12";X["de-de"].floater_0="Gut!";X["de-de"].floater_1="Toll!";X["de-de"].floater_2="Super!";X["de-de"].floater_3="Fantastisch!";X["fr-fr"]=X["fr-fr"]||{};X["fr-fr"].ShuffleConfirmationText="Il n'y a plus de paires possibles. Voulez-vous m\u00e9langer les tuiles\u00a0?";X["fr-fr"].ShuffleConfirmationTitle="M\u00e9langer";X["fr-fr"].ShuffleConfirmBtnText="M\u00e9langer";X["fr-fr"].ShuffleConfirmBtnTitle="Continuez en m\u00e9langeant les tuiles";
X["fr-fr"].ShuffleRestartBtnText="Recommencer";X["fr-fr"].ShuffleRestartBtnTitle="Recommencez la partie";X["fr-fr"].TutorialText_0="Trouvez 2 tuiles identiques.";X["fr-fr"].TutorialText_1="#touch{Retirez les tuiles identiques en cliquant dessus.}{Retirez les tuiles identiques en les touchant l'une apr\u00e8s l'autre.}";X["fr-fr"].TutorialText_2="Vous ne pouvez retirer que les tuiles pouvant \u00eatre d\u00e9plac\u00e9es vers la droite...";X["fr-fr"].TutorialText_3="... ou la gauche sans d\u00e9ranger les autres tuiles.";
X["fr-fr"].TutorialText_4="Finissez le jeu en retirant toutes les tuiles du plateau. ";X["fr-fr"].TutorialTitle_0="Comment jouer";X["fr-fr"].TutorialTitle_1="Retirer les tuiles";X["fr-fr"].TutorialTitle_2="Faites attention !";X["fr-fr"].TutorialTitle_3="Faites attention !";X["fr-fr"].TutorialTitle_4="Finir le jeu";X["fr-fr"].levelMapScreenWorld_1="Niveaux 13-24";X["fr-fr"].levelMapScreenWorld_0="Niveaux 1-12";X["fr-fr"].floater_0="Bien !";X["fr-fr"].floater_1="Joli !";X["fr-fr"].floater_2="G\u00e9nial !";
X["fr-fr"].floater_3="Excellent !";X["pt-br"]=X["pt-br"]||{};X["pt-br"].ShuffleConfirmationText="N\u00e3o h\u00e1 mais combina\u00e7\u00f5es. Gostaria de embaralhar o tabuleiro?";X["pt-br"].ShuffleConfirmationTitle="Embaralhar";X["pt-br"].ShuffleConfirmBtnText="Embaralhar";X["pt-br"].ShuffleConfirmBtnTitle="Embaralhe o tabuleiro para continuar";X["pt-br"].ShuffleRestartBtnText="Reiniciar";X["pt-br"].ShuffleRestartBtnTitle="Reinicie a partida e tente novo";X["pt-br"].TutorialText_0="Ache 2 pe\u00e7as id\u00eanticas.";
X["pt-br"].TutorialText_1="#touch{Clique nas pe\u00e7as iguais, para remov\u00ea-las.}{Toque nas pe\u00e7as iguais, para remov\u00ea-las.}";X["pt-br"].TutorialText_2="S\u00f3 \u00e9 poss\u00edvel remover as pe\u00e7as que podem se mover para direita...";X["pt-br"].TutorialText_3="...ou para esquerda sem interferir em outras pe\u00e7as.";X["pt-br"].TutorialText_4="Remova todas as pe\u00e7as para vencer o jogo.";X["pt-br"].TutorialTitle_0="Como jogar";X["pt-br"].TutorialTitle_1="Remover pe\u00e7as";
X["pt-br"].TutorialTitle_2="Preste aten\u00e7\u00e3o!";X["pt-br"].TutorialTitle_3="Preste aten\u00e7\u00e3o!";X["pt-br"].TutorialTitle_4="Vencer o jogo";X["pt-br"].levelMapScreenWorld_1="N\u00edveis 13-24";X["pt-br"].levelMapScreenWorld_0="N\u00edveis 1-12";X["pt-br"].floater_0="Bom";X["pt-br"].floater_1="Legal!";X["pt-br"].floater_2="\u00d3timo!";X["pt-br"].floater_3="Incr\u00edvel!";X["es-es"]=X["es-es"]||{};X["es-es"].ShuffleConfirmationText="No quedan combinaciones. \u00bfQuieres mezclar el tablero?";
X["es-es"].ShuffleConfirmationTitle="Mezclar";X["es-es"].ShuffleConfirmBtnText="Mezclar";X["es-es"].ShuffleConfirmBtnTitle="Mezcla el tablero para continuar";X["es-es"].ShuffleRestartBtnText="Reiniciar";X["es-es"].ShuffleRestartBtnTitle="Int\u00e9ntalo otra vez desde el principio";X["es-es"].TutorialText_0="Encuentra dos fichas iguales.";X["es-es"].TutorialText_1="#touch{Retira las dos fichas iguales haciendo clic en ellas.}{Retira las dos fichas iguales toc\u00e1ndolas.}";
X["es-es"].TutorialText_2="Solo puedes quitar fichas que puedas mover a la derecha...";X["es-es"].TutorialText_3="\u2026 o a la izquierda sin mover otras fichas.";X["es-es"].TutorialText_4="Termina la partida quitando todas las fichas.";X["es-es"].TutorialTitle_0="C\u00f3mo jugar";X["es-es"].TutorialTitle_1="Quitar fichas";X["es-es"].TutorialTitle_2="\u00a1Presta atenci\u00f3n!";X["es-es"].TutorialTitle_3="\u00a1Presta atenci\u00f3n!";X["es-es"].TutorialTitle_4="Terminar la partida";
X["es-es"].levelMapScreenWorld_1="Nivel 13-24";X["es-es"].levelMapScreenWorld_0="Nivel 1-12";X["es-es"].floater_0="Bien";X["es-es"].floater_1="\u00a1Guay!";X["es-es"].floater_2="\u00a1Mola!";X["es-es"].floater_3="\u00a1Estupendo!";X["tr-tr"]=X["tr-tr"]||{};X["tr-tr"].ShuffleConfirmationText="Ba\u015fka olas\u0131 e\u015fle\u015fme yok. Tahtay\u0131 tekrar kar\u0131\u015ft\u0131rmak istiyor musun?";X["tr-tr"].ShuffleConfirmationTitle="Tekrar kar\u0131\u015ft\u0131r";
X["tr-tr"].ShuffleConfirmBtnText="Tekrar kar\u0131\u015ft\u0131r";X["tr-tr"].ShuffleConfirmBtnTitle="Tahtay\u0131 tekrar kar\u0131\u015ft\u0131rarak devam et";X["tr-tr"].ShuffleRestartBtnText="Tekrar ba\u015flat";X["tr-tr"].ShuffleRestartBtnTitle="Oyunu yeniden ba\u015flatarak tekrar dene";X["tr-tr"].TutorialText_0="Benzer 2 karo bul.";X["tr-tr"].TutorialText_1="#touch{Benzer karolar\u0131 \u00fcstlerine t\u0131klayarak kald\u0131r.}{Benzer karolar\u0131 \u00fcstlerine dokunarak kald\u0131r.}";
X["tr-tr"].TutorialText_2="Sadece sa\u011fa do\u011fru hareket ettirilebilen karolar\u0131 kald\u0131rabilirsin...";X["tr-tr"].TutorialText_3="...veya di\u011fer karolar\u0131 bozmadan sola.";X["tr-tr"].TutorialText_4="T\u00fcm karolar\u0131 kald\u0131rarak oyunu tamamla.";X["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";X["tr-tr"].TutorialTitle_1="Karolar\u0131 kald\u0131rma";X["tr-tr"].TutorialTitle_2="Dikkat et!";X["tr-tr"].TutorialTitle_3="Dikkat et!";X["tr-tr"].TutorialTitle_4="Oyunu tamamlama";
X["tr-tr"].levelMapScreenWorld_1="Seviye 13-24";X["tr-tr"].levelMapScreenWorld_0="Seviye 1-12";X["tr-tr"].floater_0="\u0130yi";X["tr-tr"].floater_1="G\u00fczel!";X["tr-tr"].floater_2="Harika!";X["tr-tr"].floater_3="Muhte\u015fem!";X["ru-ru"]=X["ru-ru"]||{};X["ru-ru"].ShuffleConfirmationText="\u0425\u043e\u0434\u043e\u0432 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442. \u0425\u043e\u0442\u0438\u0442\u0435 \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u0441\u0442\u0438?";
X["ru-ru"].ShuffleConfirmationTitle="\u041f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c";X["ru-ru"].ShuffleConfirmBtnText="\u041f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c";X["ru-ru"].ShuffleConfirmBtnTitle="\u041f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c \u0438 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0438\u0433\u0440\u0443";X["ru-ru"].ShuffleRestartBtnText="\u0417\u0430\u043d\u043e\u0432\u043e";
X["ru-ru"].ShuffleRestartBtnTitle="\u041f\u0435\u0440\u0435\u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0438\u0433\u0440\u0443 \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435 \u043f\u043e\u043f\u044b\u0442\u043a\u0443.";X["ru-ru"].TutorialText_0="\u041d\u0430\u0439\u0434\u0438\u0442\u0435 2 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u0435 \u043a\u043e\u0441\u0442\u0438.";X["ru-ru"].TutorialText_1="#touch{\u0429\u0435\u043b\u043a\u0430\u0439\u0442\u0435 \u043f\u043e \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u043c \u043a\u043e\u0441\u0442\u044f\u043c, \u0447\u0442\u043e\u0431\u044b \u0438\u0445 \u0443\u0431\u0440\u0430\u0442\u044c.}{\u041a\u0430\u0441\u0430\u0439\u0442\u0435\u0441\u044c \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u0445 \u043a\u043e\u0441\u0442\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u0438\u0445 \u0443\u0431\u0440\u0430\u0442\u044c.}";
X["ru-ru"].TutorialText_2="\u0423\u0431\u0438\u0440\u0430\u044e\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0442\u0435 \u043a\u043e\u0441\u0442\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043c\u043e\u0436\u043d\u043e \u0441\u0434\u0432\u0438\u043d\u0443\u0442\u044c \u0432\u043f\u0440\u0430\u0432\u043e...";X["ru-ru"].TutorialText_3="\u0438\u043b\u0438 \u0432\u043b\u0435\u0432\u043e, \u043d\u0435 \u0442\u0440\u043e\u0433\u0430\u044f \u0434\u0440\u0443\u0433\u0438\u0435 \u043a\u043e\u0441\u0442\u0438.";
X["ru-ru"].TutorialText_4="\u0427\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0438\u0433\u0440\u0443, \u0443\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0441\u0435 \u043a\u043e\u0441\u0442\u0438.";X["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";X["ru-ru"].TutorialTitle_1="\u041a\u0430\u043a \u0443\u0431\u0438\u0440\u0430\u0442\u044c \u043a\u043e\u0441\u0442\u0438";X["ru-ru"].TutorialTitle_2="\u0411\u0443\u0434\u044c\u0442\u0435 \u0432\u043d\u0438\u043c\u0430\u0442\u0435\u043b\u044c\u043d\u044b!";
X["ru-ru"].TutorialTitle_3="\u0411\u0443\u0434\u044c\u0442\u0435 \u0432\u043d\u0438\u043c\u0430\u0442\u0435\u043b\u044c\u043d\u044b!";X["ru-ru"].TutorialTitle_4="\u041f\u043e\u0431\u0435\u0434\u0430 \u0432 \u0438\u0433\u0440\u0435";X["ru-ru"].levelMapScreenWorld_1="\u0423\u0440\u043e\u0432\u043d\u0438 13-24";X["ru-ru"].levelMapScreenWorld_0="\u0423\u0440\u043e\u0432\u043d\u0438 1-12";X["ru-ru"].floater_0="\u0425\u043e\u0440\u043e\u0448\u043e";X["ru-ru"].floater_1="\u0417\u0434\u043e\u0440\u043e\u0432\u043e!";
X["ru-ru"].floater_2="\u041e\u0442\u043b\u0438\u0447\u043d\u043e!";X["ru-ru"].floater_3="\u041a\u0440\u0443\u0442\u043e!";X["ar-eg"]=X["ar-eg"]||{};X["ar-eg"].ShuffleConfirmationText="\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0637\u0627\u0631\u0627\u062a \u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0625\u0636\u0627\u0641\u064a\u0629\u060c \u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u062e\u0644\u0637 \u0627\u0644\u0644\u0648\u062d\u0629\u061f";
X["ar-eg"].ShuffleConfirmationTitle="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062e\u0644\u0637";X["ar-eg"].ShuffleConfirmBtnText="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062e\u0644\u0637";X["ar-eg"].ShuffleConfirmBtnTitle="\u0645\u062a\u0627\u0628\u0639\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0639\u0627\u062f\u0629 \u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0644\u0648\u062d\u0629";X["ar-eg"].ShuffleRestartBtnText="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";
X["ar-eg"].ShuffleRestartBtnTitle="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0639\u0627\u062f\u0629 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0644\u0639\u0628\u0629";X["ar-eg"].TutorialText_0="\u0627\u0639\u062b\u0631 \u0639\u0644\u0649 \u0625\u0637\u0627\u0631\u064a\u0646 \u0645\u062a\u062c\u0627\u0646\u0628\u064a\u0646 \u0645\u062a\u0637\u0627\u0628\u0642\u064a\u0646.";X["ar-eg"].TutorialText_1="#touch{\u0642\u0645 \u0628\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0627\u0644\u0646\u0642\u0631 \u0641\u0648\u0642\u0647\u0627.}{\u0642\u0645 \u0628\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0644\u0645\u0633\u0647\u0627.}";
X["ar-eg"].TutorialText_2="\u064a\u0645\u0643\u0646\u0643 \u0641\u0642\u0637 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u062a\u064a \u064a\u0645\u0643\u0646 \u0646\u0642\u0644\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u064a\u0645\u064a\u0646...";X["ar-eg"].TutorialText_3="...\u0623\u0648 \u064a\u0645\u0643\u0646 \u062a\u0631\u0643\u0647\u0627 \u062f\u0648\u0646 \u062a\u062d\u0631\u064a\u0643 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0623\u062e\u0631\u0649.";
X["ar-eg"].TutorialText_4="\u0623\u0643\u0645\u0644 \u0627\u0644\u0644\u0639\u0628\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629.";X["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";X["ar-eg"].TutorialTitle_1="\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629";
X["ar-eg"].TutorialTitle_2="\u0627\u0646\u062a\u0628\u0647!";X["ar-eg"].TutorialTitle_3="\u0627\u0646\u062a\u0628\u0647!";X["ar-eg"].TutorialTitle_4="\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0644\u0639\u0628\u0629";X["ar-eg"].levelMapScreenWorld_1="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 13-24";X["ar-eg"].levelMapScreenWorld_0="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 1-12";X["ar-eg"].floater_0="\u062c\u064a\u062f";X["ar-eg"].floater_1="\u062c\u064a\u062f!";X["ar-eg"].floater_2="\u0639\u0638\u064a\u0645!";
X["ar-eg"].floater_3="\u0631\u0627\u0626\u0639!";X["ko-kr"]=X["ko-kr"]||{};X["ko-kr"].ShuffleConfirmationText="\ub354 \uc774\uc0c1 \uc77c\uce58\ud558\ub294 \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \ubcf4\ub4dc\ub97c \ub2e4\uc2dc \uc11e\uc744\uae4c\uc694?";X["ko-kr"].ShuffleConfirmationTitle="\ub2e4\uc2dc \uc11e\uae30";X["ko-kr"].ShuffleConfirmBtnText="\ub2e4\uc2dc \uc11e\uae30";X["ko-kr"].ShuffleConfirmBtnTitle="\ubcf4\ub4dc \ub2e4\uc2dc \uc11e\uace0 \uacc4\uc18d\ud558\uae30";
X["ko-kr"].ShuffleRestartBtnText="\ub2e4\uc2dc \uc2dc\uc791";X["ko-kr"].ShuffleRestartBtnTitle="\uac8c\uc784 \ub2e4\uc2dc \uc2dc\uc791\ud558\uae30";X["ko-kr"].TutorialText_0="\ub3d9\uc77c\ud55c \ud0c0\uc77c 2\uac1c\ub97c \ucc3e\uc73c\uc138\uc694.";X["ko-kr"].TutorialText_1="#touch{\ub611\uac19\uc740 \ud0c0\uc77c\uc744 \ud074\ub9ad\ud574 \uc81c\uac70\ud569\ub2c8\ub2e4.}{\ub611\uac19\uc740 \ud0c0\uc77c\uc744 \ub20c\ub7ec \uc81c\uac70\ud569\ub2c8\ub2e4.}";X["ko-kr"].TutorialText_2="\uc624\ub978\ucabd\uc73c\ub85c \uc774\ub3d9\ud560 \uc218 \uc788\ub294 \ud0c0\uc77c\ub9cc \uc81c\uac70\ud560 \uc218 \uc788\uc73c\uba70";
X["ko-kr"].TutorialText_3="...\uc67c\ucabd\uc5d0 \ubc29\ud574\ub418\ub294 \ud0c0\uc77c\uc774 \uc5c6\uc744 \ub54c\uc5d0\ub3c4 \uc81c\uac70\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";X["ko-kr"].TutorialText_4="\ubaa8\ub4e0 \ud0c0\uc77c\uc744 \uc81c\uac70\ud558\uba74 \uac8c\uc784\uc774 \uc644\ub8cc\ub429\ub2c8\ub2e4.";X["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";X["ko-kr"].TutorialTitle_1="\ud0c0\uc77c \uc81c\uac70";X["ko-kr"].TutorialTitle_2="\uc8fc\uc758!";X["ko-kr"].TutorialTitle_3="\uc8fc\uc758!";
X["ko-kr"].TutorialTitle_4="\uac8c\uc784 \uc644\ub8cc\ud558\uae30";X["ko-kr"].levelMapScreenWorld_1="\ub808\ubca8 13-24";X["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 1-12";X["ko-kr"].floater_0="\uc88b\uc544\uc694";X["ko-kr"].floater_1="\uba4b\uc838\uc694!";X["ko-kr"].floater_2="\ud6cc\ub96d\ud574\uc694!";X["ko-kr"].floater_3="\uad49\uc7a5\ud558\uad70\uc694!";var Eg=null;
function Fg(){Eg={ck:{Dc:{id:"canvasGame",depth:100,top:O(40,"round"),left:O(296,"round"),width:O(640,"round"),height:O(560,"round")}},qf:{zg:"locked",pn:"Mahjong",yd:"level",U:[12,12],bj:!1,Rf:!0},wf:{Od:30,sa:7,hA:2,ir:2E3,n:2,up:O(18,"round"),xp:O(8,"round")},ia:{rk:"timeLeft",uc:!1,he:["totalScore","timeBonus"],qh:"title_difficulty"},el:{Gz:.025,Iu:.5,Lu:4,Yu:2,fv:2,ls:O(-10,"round"),ix:O(-10,"round"),Ix:2,ky:.5,Xy:O(-10,"round"),Yy:O(-10,"round"),oh:O(93),Zy:O(44.5,"round"),$y:O(44.5,"round"),
bg:O(70)},Hx:{Od:50,Zx:10},Zi:{Pr:4,Xr:2,ts:0},Kx:{rb:1250,to:500},Ho:{Od:100,up:O(52,"round"),xp:O(39,"round")},Ry:{rb:1250,to:500},nA:{vA:!1},Ba:{su:2,Wy:10},EA:24,Bf:[{name:"level_1",width:10,height:6,icon:"undefined"!==typeof xe?xe:void 0,La:"NNNNNNNNNN;N NNNNNN N;F FNNNNF F;   NNQN   ;N NNNNNN N;NNNNNNNNNN".split(";"),Ma:" 22333322 ;   2332   ;2  2332  2;   2332   ;   2332   ; 22333332 ".split(";"),Ba:{time:18E4},K:{K:0}},{name:"level_2",width:10,height:6,icon:"undefined"!==typeof ye?ye:void 0,
La:"  NN  NN  ;NNNNNNNNNN;  NN  NN  ;  NN  NN  ;NNNNNNNNNN;  NN  NN  ".split(";"),Ma:"  22  22  ; 23344332 ;  22  22  ;  22  22  ; 23344332 ;  22  22  ".split(";"),Ba:{time:18E4},K:{K:0}},{name:"level_3",width:10,height:6,icon:"undefined"!==typeof Je?Je:void 0,La:"N N N N N ; N N N N N;N N N N N ; N N N N N;N N N N N ; N N N N N".split(";"),Ma:"3 4 3 2 3 ; 2 3 4 3 2;3 4 3 2 3 ; 2 3 4 2 2;3 4 3 2 3 ; 2 3 4 3 2".split(";"),Ba:{time:18E4},K:{K:0}},{name:"level_4",width:10,height:6,icon:"undefined"!==
typeof Pe?Pe:void 0,La:" NNNNNNNN ; NQQQNQQQ ; NQQQQQQQ ; NQQQQQQQ ;   NQQQ   ;    NQ    ".split(";"),Ma:" 22222222 ; 22222222 ; 22222222 ; 22222222 ;   2222   ;    22    ".split(";"),Ba:{time:18E4},K:{K:0}},{name:"level_5",width:10,height:6,icon:"undefined"!==typeof Qe?Qe:void 0,La:"NNNNNNNNNN;N  NNNN  N;N NNNNNN N;N NQNNNQ N;N  NNNN  N;NNNNNNNNNN".split(";"),Ma:"22  22  22;2   33   2;  334433  ;  334433  ;2   33   2;22  22  22".split(";"),Ba:{time:18E4},K:{K:1}},{name:"level_6",width:10,height:6,
icon:"undefined"!==typeof Re?Re:void 0,La:"N        N;N  NNNN  N;NFNNNNNNFN;N NNNQNN N;N  NNNN  N;N        N".split(";"),Ma:"          ;2  2222  2;22233332 2;2 233332 2;2  2222  2;          ".split(";"),Ba:{time:18E4},K:{K:1}},{name:"level_7",width:10,height:6,icon:"undefined"!==typeof Se?Se:void 0,La:"NNNNNNNNNN;  NNQNQN  ;FNNNNNNNNF; NNQNNNQN ;  NNNNNN  ;NNNNQNQNNN".split(";"),Ma:"   2222   ;   2222   ;  223322  ;  223322  ;   2222   ;   2222   ".split(";"),Ba:{time:18E4},K:{K:1}},{name:"level_8",
width:10,height:6,icon:"undefined"!==typeof Te?Te:void 0,La:"FFNNNNNNFF;  NNNNNN  ;FFNNNNNNFF;  NNNNNN  ;FFNNNNNNFF;  NNNNNN  ".split(";"),Ma:"  2    2  ;  234432  ;  2    2  ;  2    2  ;  234432  ;  2    2  ".split(";"),Ba:{time:18E4},K:{K:1}},{name:"level_9",width:10,height:6,icon:"undefined"!==typeof Ue?Ue:void 0,La:" NNNNNNNN ;NNNNNNNNNN;NNNN  NNNN;NNNN  NNNN;NNNNNNNNNN; NNNNNNNN ".split(";"),Ma:"          ; 22344322 ; 234  432 ; 234  432 ; 22344322 ;          ".split(";"),Ba:{time:18E4},K:{K:2}},
{name:"level_10",width:10,height:6,icon:"undefined"!==typeof Ve?Ve:void 0,La:" FNNNNF N ;N  FF  NNN;N N  N NNN;N NFFNFNNN;NF      NN;  NNNNN N ".split(";"),Ma:" 222223   ;2  22  2  ;2 2  2 2  ;2 222222  ;22        ;  22234   ".split(";"),Ba:{time:18E4},K:{K:2}},{name:"level_11",width:10,height:6,icon:"undefined"!==typeof ze?ze:void 0,La:" NNNNNNNN ;FNQQQQQQQF;FNQNNNNNQF;FNQNNNNNQF; NQNNNNNQ ; NQQQQQQQ ".split(";"),Ma:" 22222222 ; 22222222 ; 22344322 ; 22344322 ; 22222222 ; 22222222 ".split(";"),Ba:{time:18E4},
K:{K:2}},{name:"level_12",width:10,height:6,icon:"undefined"!==typeof Ae?Ae:void 0,La:" NNNNNNNN ;FNQNNQNNQF; NN NN NN ;FNN NN NNF; NNNNNNNN ; NQNNQNNQ ".split(";"),Ma:" 22233222 ;222 33 222; 33 44 33 ;233 44 332; 22 33 22 ; 22233222 ".split(";"),Ba:{time:18E4},K:{K:2}},{name:"level_13_aries",width:10,height:6,icon:"undefined"!==typeof Be?Be:void 0,La:" NN    NN ;N  N  N  N; N  NN  N ;    NN    ;    NN    ;    NN    ".split(";"),Ma:" 33    33 ;2  4  4  2; 2  44  2 ;    44    ;    44    ;    44    ".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_14_taurus",width:10,height:6,icon:"undefined"!==typeof Ce?Ce:void 0,La:"NN      NN;  NNNNNN  ;   NNNN   ;  NN  NN  ;  NN  NN  ;   NNNN   ".split(";"),Ma:"22      22;  333333  ;   4444   ;  44  44  ;  44  44  ;   4444   ".split(";"),Ba:{time:18E4},K:{K:-1}},{name:"level_15_gemini",width:10,height:6,icon:"undefined"!==typeof De?De:void 0,La:"NNNNNNNNNN;  NN  NN  ;  NQ  NQ  ;  NQ  NQ  ;  NQ  NQ  ;NNNNNNNNNN".split(";"),Ma:"2222222222;  44  44  ;  44  44  ;  44  44  ;  44  44  ;2222222222".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_16_cancer",width:10,height:6,icon:"undefined"!==typeof Ee?Ee:void 0,La:"NNNNNNNNN ;N  N    NN;NNNN      ;      NNNN;NN    N  N; NNNNNNNNN".split(";"),Ma:"222222222 ;2  4    22;2334      ;      4332;22    4  2; 222222222".split(";"),Ba:{time:18E4},K:{K:-1}},{name:"level_17_leo",width:10,height:6,icon:"undefined"!==typeof Fe?Fe:void 0,La:"    NN    ;   N  N   ; NNN  N   ;N  N  N  N;N  N  N  N; NN    NN ".split(";"),Ma:"    33    ;   3  3   ; 223  3   ;2  2  3  4;2  2  4  4; 22    34 ".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_18_virgo",width:10,height:6,icon:"undefined"!==typeof Ge?Ge:void 0,La:" NN NN    ;N  N  N N ;N  N  NN N;N  N  N  N;N  N  N N ;N  N NNN  ".split(";"),Ma:" 22 22    ;2  2  2 4 ;2  2  24 4;2  2  3  4;2  2  3 4 ;2  2 444  ".split(";"),Ba:{time:18E4},K:{K:-1}},{name:"level_19_libra",width:10,height:6,icon:"undefined"!==typeof He?He:void 0,La:"   NNNN   ;  NN  NN  ;NNNN  NNNN;          ;NNNNNNNNNN;          ".split(";"),Ma:"   4444   ;  34  43  ;2233  3322;          ;2233443322;          ".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_20_scorpio",width:10,height:6,icon:"undefined"!==typeof Ie?Ie:void 0,La:" NN NN    ;N  N  N   ;N  N  N   ;N  N  N  N;N  N  N  N;N  N  NNNN".split(";"),Ma:" 34 43    ;2  4  4   ;2  4  4   ;2  4  4  4;2  4  4  2;2  4  4332".split(";"),Ba:{time:18E4},K:{K:-1}},{name:"level_21_sagittarius",width:10,height:6,icon:"undefined"!==typeof Ke?Ke:void 0,La:"      NNNN;  N    FNN;   N FN  N;   FN     ; FN  N    ;N     N   ".split(";"),Ma:"      4444;  2    334;   2 33  4;   33     ; 33  2    ;2     2   ".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_22_capricorn",width:10,height:6,icon:"undefined"!==typeof Le?Le:void 0,La:" N NN     ;N N  N NN ;  N  NN  N;     NN  N;     N NN ;   NN     ".split(";"),Ma:" 3 33     ;3 3  3 44 ;  3  34  4;     34  4;     3 44 ;   33     ".split(";"),Ba:{time:18E4},K:{K:-1}},{name:"level_23_aquarius",width:10,height:6,icon:"undefined"!==typeof Me?Me:void 0,La:"  NNN NNN ; NN NNN NN;          ;  NNN NNN ; NN NNN NN;          ".split(";"),Ma:"  344 344 ; 22 322 32;          ;  344 344 ; 22 322 32;          ".split(";"),
Ba:{time:18E4},K:{K:-1}},{name:"level_24_pisces",width:10,height:6,icon:"undefined"!==typeof Ne?Ne:void 0,La:" NN     NN;   N   N  ;FFFNFFFNFF;   N   N  ;   N   N  ; NN     NN".split(";"),Ma:" 33     33;   4   4  ;3334333433;   4   4  ;   4   4  ; 33     33".split(";"),Ba:{time:18E4},K:{K:-1}}]}}N.l=N.l||{};N.l.mv=function(){var a=N.ty;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};N.l.Ik=function(){N.e.Fc()};N.l.BA=function(){};N.l.cl=function(){};N.l.Jk=function(){N.e.Fc()};
N.l.xA=function(){};N.l.wA=function(){};N.l.AA=function(){};N.l.lr=function(){};N.l.jr=function(){};N.l.kr=function(){};N.l.yA=function(){};N.l.ov=function(){N.e.Fc()};N.l.pv=function(){N.e.Fc()};N.l.Lg=function(){N.e.Fc()};N.l.nv=function(){N.e.Fc()};N.l.Uq=function(a,b){void 0===N.e.ce&&(N.e.ce=new Gg(!0));return Hg(a,b)};N.l.ip=function(a){void 0===N.e.ce&&(N.e.ce=new Gg(!0));return Ig(a)};N.l.kd=function(a){window.open(a)};N.l.Di=function(){return[{f:Xc,url:N.C.er}]};N.l.Hv=function(){};
N.ud=N.ud||{};N.ud.Ik=function(){N.e.uj=!1};N.ud.cl=function(){};N.ud.Jk=function(){N.e.uj=!1};N.ud.Lg=function(){N.e.uj=!1};function Jg(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function Kg(a,b,c,d){this.gm=this.Eg=a;this.Du=b;this.duration=1;this.iq=d;this.ze=c;this.bk=null;this.uh=0}function Lg(a,b){a.uh+=b;a.uh>a.duration&&a.bk&&(a.bk(),a.bk=null)}
Kg.prototype.ha=function(){if(this.uh>=this.duration)return this.ze(this.duration,this.Eg,this.gm-this.Eg,this.duration);var a=this.ze(this.uh,this.Eg,this.gm-this.Eg,this.duration);this.iq&&(a=this.iq(a));return a};function Mg(a,b){a.Eg=a.ha();a.gm=b;a.duration=a.Du;a.bk=void 0;a.uh=0}N.Uu=void 0!==N.environment?N.environment:"development";N.Cz=void 0!==N.ga?N.ga:N.Uu;"undefined"!==typeof N.mediaUrl?ha(N.mediaUrl):ha(N.size);N.hu="backButton";N.yf="languageSet";N.Ke="resizeEvent";
N.version={builder:"1.8.3.0","build-time":"12:21:18","build-date":"05-06-2020",audio:H.Za?"web audio api":H.Qa?"html5 audio":"no audio"};N.Nz=new function(){this.Be=this.ew=3;m.A.lh&&(this.Be=3>m.Na.ne?1:4.4>m.Na.ne?2:3);m.Na.Uk&&(this.Be=7>m.Na.ne?2:3);m.Na.op&&(this.Be=8>m.Na.ne?2:3);N.version.browser_name=m.name;N.version.browser_version=m.A.version;N.version.os_version=m.Na.version;N.version.browser_grade=this.Be};N.a={};"function"===typeof zg&&zg();"function"===typeof Fg&&Fg();
"function"===typeof Dg&&Dg();"function"===typeof initGameThemeSettings&&initGameThemeSettings();N.a.u="undefined"!==typeof yg?yg:{};N.a.o="undefined"!==typeof Eg?Eg:{};N.a.M="undefined"!==typeof Cg?Cg:{};N.a.kA="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};N.ah=window.publisherSettings;N.C="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof Ag&&(N.C=Ag);if("undefined"!==typeof Bg)for(var Ng in Bg)N.C[Ng]=Bg[Ng];
(function(){var a,b,c,d,g;N.i={};N.i.Fp="undefined"!==typeof X?X:{};N.i.eb=void 0!==N.C.Zd&&void 0!==N.C.Zd.Rj?N.C.Zd.Rj:N.a.u.Zd.Rj;g=[];for(b=0;b<N.i.eb.length;b++)g.push(N.i.eb[b]);if(N.C.My)for(b=N.i.eb.length-1;0<=b;b--)0>N.C.My.indexOf(N.i.eb[b])&&N.i.eb.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=N.i.eb.length-1;0<=
b;b--)0>c.indexOf(N.i.eb[b])&&N.i.eb.splice(b,1)}catch(h){}0===N.i.eb.length&&(0<g.length?N.i.eb=g:N.i.eb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<N.i.eb.length;d++)if(0<=N.i.eb[d].search(g)){a=N.i.eb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==N.C.Zd&&void 0!==N.C.Zd.Rk?N.C.Zd.Rk:N.a.u.Zd.Rk);N.i.wm=0<=N.i.eb.indexOf(a)?a:N.i.eb[0];N.i.Bj=N.i.Fp[N.i.wm];
if(void 0!==N.a.u.Ob.language_toggle&&void 0!==N.a.u.Ob.language_toggle.V){a=N.a.u.Ob.language_toggle.V;c=[];for(b=0;b<a.length;b++)0<=N.i.eb.indexOf(a[b].id)&&c.push(a[b]);N.a.u.Ob.language_toggle.V=c}N.i.r=function(a,b){var c,d,g,h;if(void 0!==N.i.Bj&&void 0!==N.i.Bj[a]){c=N.i.Bj[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=m.mf.at||m.mf.Yr)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};N.i.Bs=function(a){N.i.wm=
a;N.i.Bj=N.i.Fp[a];la(N.yf,a)};N.i.An=function(){return N.i.wm};N.i.hv=function(){return N.i.eb};N.i.Jv=function(a){return 0<=N.i.eb.indexOf(a)}})();N.Ju={Na:"",gx:"",NA:"",Zm:""};N.b={};
N.b.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};N.b.lj=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
N.b.Ji=function(a){function b(){}b.prototype=Og.prototype;a.prototype=new b};N.b.cy=function(a,b,c,d,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));N.Pd.push(l);return l};
(function(){var a,b,c,d,g,h,k;N.tr=0;N.ur=0;N.Ll=!1;N.jz=m.A.lh&&m.A.ne&&4<=m.A.ne;N.vj=!1;N.Dt=m.mf.at||m.mf.Yr;N.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===N.orientation?N.a.u.ck:N.a.u.Pd;h="landscape"===N.orientation?N.a.o.ck:N.a.o.Pd;if(void 0!==h){if(void 0!==h.Dc)for(a in h.Dc)k.Dc[a]=h.Dc[a];if(void 0!==h.Ec)for(a in h.Ec)k.Ec[a]=h.Ec[a]}b=function(){var a,b,c,d;if(N.jz&&!N.vj){N.vj=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){N.vj=!1;return}b=document.createEvent("Event");b.OA=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);N.vj=!1},100)}};c=function(){var a,c,d,g,h,E,s,t,u;"landscape"===N.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.yg,k.Hc],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.Hc,k.Qb],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];E=d/c[1];h<g?(h=h<E?Math.floor(a[0]/E):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));s=h/c[1];!N.Dt&&1<s&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),s=1);a="landscape"===N.orientation?g:h;c="landscape"===N.orientation?h:g;u=t=0;window.innerHeight<Math.floor(k.Hc*s)&&(t=Math.max(k.ll,window.innerHeight-Math.floor(k.Hc*s)));window.innerWidth<Math.floor(k.Qb*s)&&(u=Math.floor(Math.max(k.yg-k.Qb,(window.innerWidth-Math.floor(k.Qb*s))/s)),window.innerWidth<Math.floor(k.Qb*s)+u*s&&(u+=Math.floor(Math.max((d-k.yg)/2,(window.innerWidth-(k.Qb*s+u*s))/2/s))));N.Wj=k.Hc-k.oq;N.mu=k.Qb-k.yg;N.ra=t;N.Pz=u;N.Oz=Math.min(N.mu,-1*N.Qz);N.Ae=(k.Ec.top||
k.kf)-N.ra;N.Z={top:-1*t,left:-1*u,height:Math.min(k.Hc,Math.round(Math.min(c,window.innerHeight)/s)),width:Math.min(k.Qb,Math.round(Math.min(a,window.innerWidth)/s))};N.eB="landscape"===N.orientation?{top:0,left:Math.floor((k.yg-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.ll),left:k.jf,width:k.Qb,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===N.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,l,n;g=void 0!==b.top?b.top:k.kf;h=void 0!==b.left?b.left:k.jf;l=void 0!==b.width?b.width:k.Qb;n=void 0!==b.height?b.height:k.Hc;a.aA=Math.floor(s*g);a.$z=Math.floor(s*h);a.bA=Math.floor(s*l);a.Zz=Math.floor(s*
n);!1!==c&&(g+=t);!1!==d&&(h+=u);a.setAttribute("style","position:absolute; left:"+Math.floor(s*h)+"px; top:"+Math.floor(s*g)+"px; width:"+Math.floor(s*l)+"px; height:"+Math.floor(s*n)+"px; z-index: "+b.depth)};d(N.Im,k.Qm);d(N.nn,k.Dc);d(N.xn,k.Ec,!1,!0);d(N.$d,k.ef);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);la(N.Ke)};a=function(){if(N.tr===window.innerHeight&&N.ur===window.innerWidth||N.Ll)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;N.Ll=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,m.A.lh?1:0);g--;if((m.A.lh?0:window.innerHeight>d)||0>g)N.ur=window.innerWidth,N.tr=window.innerHeight,clearInterval(N.Ll),N.Ll=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};N.Bi=k.Dc.left||k.jf;N.Ci=k.Dc.top||k.kf;N.Sq=k.Dc.width||k.Qb;N.Oq=k.Dc.height||k.Hc;N.tf=k.Ec.left||k.jf;N.Ae=k.Ec.top||k.kf;N.mA=k.Ec.width||k.Qb;
N.lA=k.Ec.height||k.Hc;N.aw=k.ef.left||k.jf;N.bw=k.ef.top||k.kf;N.cw=k.ef.width||k.Qb;N.$v=k.ef.height||k.Hc;h=function(a){return N.b.cy(a.id,a.depth,void 0!==a.top?a.top:k.kf,void 0!==a.left?a.left:k.jf,void 0!==a.width?a.width:k.Qb,void 0!==a.height?a.height:k.Hc)};N.Pd=[];N.Im=h(k.Qm);N.nn=h(k.Dc);N.xn=h(k.Ec);N.$d=h(k.ef);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);N.qc={};N.qc[N.yi]=N.Im;N.qc[N.Fg]=N.nn;N.qc[N.Fk]=N.xn;N.qc[N.yk]=N.$d;N.qc[N.rf]=N.Im;N.qc[N.sb]=N.$d;N.qc[N.Wd]=N.$d})();
N.b.Zt=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ia.qe+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),N.ou=!0,N.ei=!0,b=function(a){N.ou&&N.ei&&(N.l.kd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){N.ei&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){N.ei&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};N.b.jB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";N.ei=!0}};
N.b.uA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";N.ei=!1}};N.b.zn=function(a){return a===N.nn?{x:N.Bi,y:N.Ci}:a===N.xn?{x:N.tf,y:N.Ae}:{x:N.aw,y:N.bw}};N.b.Xd=function(a){return N.qc[a]};N.b.mb=function(a){return N.qc[a]?(p.canvas!==N.qc[a]&&p.mb(N.qc[a]),!0):!1};N.b.bb=function(a,b){if(N.qc[b]){var c=I;a.Ha!==b&&(c.Sh=!0);a.Ha=b;a.canvas=N.qc[b]}};
N.b.g=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
N.b.fa=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};N.b.Tz=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};N.ea=N.ea||{};N.ea.fy=!1;N.ea.or=function(a){a instanceof Array&&(this.Ak=a[0],this.Ml=a[1],this.pu="https://api.gameanalytics.com/v2/"+this.Ak,this.pr=!0)};
N.ea.Ue=function(a,b){var c,d=JSON.stringify(b),g=window.Crypto.HmacSHA256(d,this.Ml),g=window.Crypto.enc.Base64.stringify(g),h=this.pu+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.fy&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
N.ea.gc={zp:"user",yp:"session_end",Nt:"business",Ot:"resource",wj:"progression",qm:"design",ERROR:"error"};N.ea.Qe=function(){return{user_id:this.mp,session_id:this.by,build:this.uu,device:this.Zm,platform:this.platform,os_version:this.hx,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
N.ea.Wb=function(a,b,c,d,g,h,k){this.by=a;h&&"object"===typeof h&&(this.mp=h.mp);this.uu=g;this.j=!0;this.pr&&(this.Zm=k.Zm,this.platform=k.Na,this.hx=k.gx);this.Ue("init",this.Qe())};N.ea.Ay=function(a){var b=this.Qe(),c=[];b.category=a;c.push(b);this.Ue("events",c)};N.ea.en=function(a,b,c,d){a=[];b=this.Qe();b.length=Math.floor(c);b.category=d;a.push(b);this.Ue("events",a)};
N.ea.Va=function(a,b,c,d){var g=[],h=!1;if(this.j&&this.pr){if(d)switch(d){case N.ea.gc.zp:this.Ay(d);h=!0;break;case N.ea.gc.yp:this.en(0,0,c,d);h=!0;break;case N.ea.gc.Nt:h=!0;break;case N.ea.gc.Ot:h=!0;break;case N.ea.gc.wj:this.Xu(a,b,c,d);h=!0;break;case N.ea.gc.qm:this.Vu(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.Qe(),b.event_id=d+":"+a,b.value=c,g.push(b),this.Ue("design",g))}};N.ea.dB=function(a,b,c){this.Va(a,b,c)};N.ea.fA=function(){};
N.ea.gA=function(){};N.ea.Xu=function(a,b,c,d){var g=[],h=this.Qe();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}g.push(h);this.Ue("events",g)};N.ea.Vu=function(a,b,c,d){var g=[],h=this.Qe();h.category=d;h.event_id=a+b;h.value=c;g.push(h);this.Ue("events",g)};N.ea.ss=function(a,b){var c=[],d=this.Qe();d.category="error";d.message=a;d.severity=b;c.push(d);this.Ue("events",c)};
function Pg(){this.Ha=this.depth=0;this.visible=!1;this.j=!0;this.a=N.a.u.Ca;this.sx=this.a.bz;K(this);Lb(this,"system")}function Qg(){var a=Rg("userId","");""===a&&(a=Sg(),Tg("userId",a));return a}function Sg(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=Pg.prototype;e.start=function(a){N.ea.or(a);N.ea.Wb(Sg(),N.a.o.qf.pn,N.a.M.id,N.C.tx,Ug(),{mp:Qg()},N.Ju)};e.Va=function(a,b,c,d){N.ea.Va(a,b,c,d)};
function Vg(a,b,c,d){var g,h;for(g=0;g<a.ba.length;g++)void 0!==a.ba[g]&&a.ba[g].tag===b&&(h=a.ba[g],a.Va(c,d,h.n/1E3,N.ea.gc.yp),h.j=!1)}function Wg(){var a=N.Ca,b=N.e.dg,c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused+=1)}e.ss=function(a,b){N.ea.ss(a,b)};e.Tb=function(){this.ba=[]};
e.va=function(a){var b,c=0;for(b=0;b<this.ba.length;b++)this.ba[b].j&&(0===this.ba[b].paused&&(this.ba[b].n+=a),c=b);c<this.ba.length-1&&(a=this.ba.length-Math.max(this.sx,c+1),0<a&&this.ba.splice(this.ba.length-a,a))};
function Gg(a,b,c){this.Mr=a||!1;this.host=b||"http://localhost:8080";this.ay=c||this.host+"/services/storage/gamestate";this.Ys="undefined"!==typeof window.localStorage;this.Pn=this.kp=!1;var d=this;window.parent!==window&&(m.A.Do||m.Na.Uk)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.kp="ok"===a.result:"getItem"===b&&d.Gk&&("ok"===a.result?d.Gk(a.value):d.Gk(a.defaultValue))},!1),this.Gk=null,window.parent.postMessage({command:"init"},"*"));this.Ri=[];window.setTimeout(function(){d.Pn=
!0;for(var a=0;a<d.Ri.length;++a)d.Ri[a]();d.Ri=[]},2E3)}function Xg(){return"string"===typeof N.C.Ts&&""!==N.C.Ts?N.C.Ts:void 0!==N.a.o.qf&&void 0!==N.a.o.qf.pn?N.a.o.qf.pn:"0"}function Hg(a,b){var c=N.e.ce;"function"===typeof b&&(c.Pn?Yg(c,a,b):c.Ri.push(function(){Yg(c,a,b)}))}function Ig(a){var b=N.e.ce;b.Pn?Zg(b,a):b.Ri.push(function(){Zg(b,a)})}
function Zg(a,b){var c=null,d=Xg();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.kp)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.Ys)try{window.localStorage.setItem(d,c)}catch(h){}a.Mr||(c=new nb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),ob(c,a.ay+"/my_ip/"+d))}}
function Yg(a,b,c){var d=null,g=null,h=Xg();if(a.kp)a.Gk=function(a){var g;try{d=JSON.parse(a),g=JSON.parse(d.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.Ys)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.Mr||(a=new nb("gameState_"+h),g=null,pb(a,Gg.bB+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(g&&Date.parse(g.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(d.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(l){c(b);return}c(b)}}
function $g(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.Rb=this.visible=!1!==c;this.j=!0;N.b.bb(this,N.sb);var d;this.a=N.a.u.jd;if("landscape"===N.orientation&&N.a.u.Un)for(d in N.a.u.Un)this.a[d]=N.a.u.Un[d];for(d in N.a.M.jd)this.a[d]=N.a.M.jd[d];if(N.C.jd)for(d in N.C.jd)this.a[d]=N.C.jd[d];this.pb=a;this.gq=b;this.tq=!1;this.di=0;this.Jm=!1;this.Uj=0;this.Tj=
this.a.ku;this.vo=!0;this.Vv=.6/Math.log(this.a.fl+1);this.Kt=void 0!==N.C.Uv?N.C.Uv:this.a.Dw;this.fw=this.Kt+this.a.iw;K(this)}e=$g.prototype;e.Ko=function(a){var b;N.b.mb(N.rf);pa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=U.N();(N.C.jd&&N.C.jd.jj||this.a.jj)&&C(b,N.C.jd&&N.C.jd.jj?N.C.jd.jj:this.a.jj);a=N.i.r(a,"<"+a.toUpperCase()+">");b.q(a,this.canvas.width/2,this.canvas.height/2,this.a.em);this.error=!0;this.visible=this.Rb=!1;this.canvas.Y=!0};
e.de=function(){this.oa&&(this.Ab=N.b.g(this.a.Ab,N.Z.width,this.oa.width)+N.Z.left,this.sc=N.b.g(this.a.sc,N.Z.height,this.oa.height)+N.Z.top)};
e.Xm=function(){var a,b,c,d,g,h;if("function"===typeof N.l.Di&&(h=this.a.Ef,(this.Aa=N.l.Di())&&0<this.Aa.length)){this.oa?this.oa.clear():this.oa=new x(this.a.Ef,this.a.Oi);y(this.oa);h/=this.Aa.length;for(c=0;c<this.Aa.length;c++)try{g=this.Aa[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Oi/g.height)),a="center"===this.a.Mi?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.oa.height-g.height*d,g instanceof r?g.ya(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}z(this.oa);this.dl=0;this.Wn=!0;this.Ni=0;this.Df=Sb(0,0,this.oa.width,this.oa.height);this.de()}};
e.Fa=function(){var a,b,c,d;this.vo?p.clear():N.b.mb(N.rf);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(N.ra),1<d.I){c=(p.canvas.height-a)/d.xg;b=-(d.ki*c-p.canvas.width)/2;c=p.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.di;for(h=0;h<d.I;h+=1)k=b+h%d.Zg*d.width,l=a+d.height*Math.floor(h/d.Zg),d.Hd.na(d.Dd[h],d.Ed[h],d.Fd[h],d.Vc[h],d.Uc[h],k-d.Gb+d.pd[h],l-d.Hb+d.qd[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof r?d.ya(0,b,a,c,c,0,this.di):d instanceof x&&d.ya(b,a,c,c,0,this.di);d=this.a.Fe+this.a.Sn+this.a.Ng;b=cf.height;a=cf.width-(this.a.Fe+this.a.Sn);this.Og=N.b.g(this.a.Og,p.canvas.width,d);this.Cf=N.b.g(this.a.Cf,p.canvas.height,b);cf.na(0,0,0,this.a.Fe,b,this.Og,this.Cf,1);cf.mk(0,this.a.Fe,0,a,b,this.Og+this.a.Fe,this.Cf,this.a.Ng,b,1);cf.na(0,this.a.Fe+a,0,this.a.Sn,b,this.Og+this.a.Fe+this.a.Ng,this.Cf,1)};
function ah(a){a.vo&&(a.Jm=!0);a.visible&&(a.Fa(),a.Xm(),"function"===typeof N.l.Cn&&(a.ge=N.l.Cn(),a.ge instanceof x&&(a.gh=!0,a.Gs=Math.floor((a.canvas.width-a.ge.width)/2),a.Hs=Math.floor((a.canvas.height-a.ge.height)/2))));N.e.bl&&ia.Cd("audio");N.e.al&&ia.Cd("audio_music");ia.Cd("fonts")}
e.Tb=function(){var a,b=!1;if(void 0!==N.C.ej)if(!1===N.C.ej.Wv)b=!0;else{if(void 0!==N.C.ej.$m)for(a=0;a<N.C.ej.$m.length;a++){var c;a:{c=N.C.ej.$m[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===bh("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,bh(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof N.C.az&&(new Date).getTime()>N.C.az&&(b=!1);b?(this.sg=[],this.error=!1,this.ht=this.mn=this.Qj=this.n=0,this.ready=this.gh=!1,this.Sv=void 0!==this.a.Kr?this.a.Kr:this.a.Fe-this.a.Li,this.Tv=void 0!==this.a.Lr?this.a.Lr:Math.floor((cf.height-Bf.height)/2),this.Tn=Bf.width-(this.a.Li+this.a.Jr),this.ln=this.$r=this.Tp=!1,(this.gj=ia.complete("start"))&&ah(this),this.Ir=ia.complete("load"),this.visible&&(this.it=document.getElementById("throbber_image"),
this.le=this.a.le,this.$o=N.b.g(this.a.$o,this.canvas.width,this.le),this.fm=N.b.g(this.a.fm,this.canvas.height,this.le))):I.pause()};
e.va=function(a){this.n+=a;"function"===typeof N.l.Cn&&void 0===this.ge&&(this.ge=N.l.Cn(),this.ge instanceof x&&(this.gh=!0,this.Gs=Math.floor((this.canvas.width-this.ge.width)/2),this.Hs=Math.floor((this.canvas.height-this.ge.height)/2)));this.gh&&0<=this.a.Is&&this.n>=this.a.Is&&(this.gh=!1);this.Jm&&(this.Uj+=a,this.Uj>=this.Tj?(this.Jm=!1,this.di=1):this.di=bc(this.Uj,0,1,this.Tj));this.gj&&(this.Qj+=a,this.mn+=a);this.ht=Math.round(this.n/this.a.Uy%(this.a.Vy-1));this.Wn&&(this.dl=0+this.Ni/
this.a.Vn*1,this.Ni+=a,this.Ni>=this.a.Vn&&(this.Wn=!1,this.dl=1));"function"===typeof this.gq&&this.gq(Math.round((ja("load")+ja("audio")+ja("audio_music"))/2));!this.ready&&this.Ir&&(this.ln||this.mn>=this.a.fl)&&(!N.e.bl||this.Tp||H.Qa&&this.Qj>=this.a.fl)&&(!N.e.al||this.$r||H.Qa&&this.Qj>=this.a.fl)&&(this.ready=!0);if(a=!this.tq&&!this.error&&this.ready&&this.n>=this.Kt)a=N.e,a=(a.jc&&a.ab&&!a.ab.Iv()?!1:!0)||this.n>=this.fw;a&&(this.tq=!0,this.pb())};
e.Ig=function(a,b,c){!this.gh&&this.Df&&Ub(this.Df,this.Ab,this.sc,b,c)&&(this.ib=Math.floor((b-this.Ab)/(this.oa.width/this.Aa.length)))};e.Jg=function(a,b,c){void 0!==this.ib&&(this.Aa[this.ib].url||this.Aa[this.ib].action)&&Ub(this.Df,this.Ab,this.sc,b,c)&&(b-=this.Ab,b>=this.oa.width/this.Aa.length*this.ib&&b<this.oa.width/this.Aa.length*(this.ib+1)&&(this.Aa[this.ib].url?N.l.kd(this.Aa[this.ib].url):this.Aa[this.ib].action()));this.ib=void 0};
e.hd=function(a,b){"Load Complete"===a&&"start"===b.Ya?(this.gj=!0,ah(this)):"Load Complete"===a&&"load"===b.Ya?this.Ir=!0:"Load Complete"===a&&"audio"===b.Ya?this.Tp=!0:"Load Complete"===a&&"audio_music"===b.Ya?this.$r=!0:"Load Complete"===a&&"fonts"===b.Ya&&(this.ln=!0);a===N.Ke&&this.de()};
e.Ua=function(){if(!this.error){this.vo&&this.gj?this.Fa():p.clear();try{this.it&&p.context.drawImage(this.it,this.le*this.ht,0,this.le,this.le,this.$o,this.fm,this.le,this.le)}catch(a){}if(this.gj){var b=0,c=this.Og+this.Sv,d=this.Cf+this.Tv,g=Bf.height;Bf.na(0,b,0,this.a.Li,g,c,d,1);b+=this.a.Li;c+=this.a.Li;this.ready?(Bf.mk(0,b,0,this.Tn,g,c,d,this.a.Ng,g,1),b+=this.Tn,c+=this.a.Ng,Bf.na(0,b,0,this.a.Jr,g,c,d,1)):Bf.mk(0,b,0,this.Tn,g,c,d,Math.floor(Math.min((ja("load")+ja("audio"))/500+this.Vv*
Math.log(this.n+1),1)*this.a.Ng),g,1);this.oa&&this.oa.Ic(this.Ab,this.sc,this.dl)}this.gh&&this.ge.q(this.Gs,this.Hs)}};
function ch(){var a,b;b=this;this.depth=100;this.j=this.visible=!0;N.b.bb(this,N.sb);this.a=N.a.u.Sl;if("landscape"===N.orientation&&N.a.u.Tl)for(a in N.a.u.Tl)this.a[a]=N.a.u.Tl[a];this.Ob=N.a.u.Ob;if("landscape"===N.orientation&&N.a.u.Om)for(a in N.a.u.Om)this.Ob[a]=N.a.u.Om[a];for(a in N.a.M.Sl)this.a[a]=N.a.M.Sl[a];this.sg=[];a=dh(N.e);this.hq=void 0!==a&&null!==a;this.X=new Vb;this.X.ua(this.a.$u,function(){b.Os.call(b)});this.X.ua(this.a.es,function(){b.Qs.call(b)});this.X.ua(N.k.bj&&!this.hq?
this.a.ox:this.a.es,function(){b.Rs.call(b)});this.X.ua(this.a.uw,function(){b.Ps.call(b)});K(this,!1)}e=ch.prototype;e.Os=function(){this.Ck=!0;this.a.Hg&&(this.zi=N.b.g(this.a.zi,this.canvas.width,Bd.width),this.Bk=N.b.g(this.a.Bk,this.canvas.width,Bd.width),this.Ai=N.b.g(this.a.Ai,this.canvas.height,Bd.height),this.Gg=N.b.g(this.a.Gg,this.canvas.height,Bd.height),this.wn=this.zi,this.Dk=this.Ai,this.rn=this.a.un,this.sn=this.a.vn,this.qn=this.a.tn,this.nc=0,this.de())};
e.Qs=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d;N.k.bj&&!this.hq&&(c=N.b.g(this.a.rq,this.canvas.width,this.a.pi,Math.floor(this.a.pi/2)),d=N.b.g(this.a.kk,this.canvas.height,lf.height,Math.floor(lf.height/2)),c=new eh("difficulty_toggle",c,d,this.depth-20,fh()+"",this.a.pi,{S:function(a){gh(parseInt(a,10));return!0},Vb:!0}),c.ec=Math.floor(this.a.pi/2),c.fc=Math.floor(lf.height/2),!1!==a&&(hh(c,"xScale",b,0,1,this.a.qq),hh(c,"yScale",b,0,1,this.a.qq)),this.jk=c,this.kk=c.y,this.sg.push(c),
this.de())};
e.Rs=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d=this;this.qo=!0;c=new ih("bigPlay",N.b.g(this.a.nx,this.canvas.width,this.a.Ui,Math.floor(this.a.Ui/2)),N.b.g(this.a.Vi,this.canvas.height,mf.height,Math.floor(mf.height/2)),this.depth-20,"startScreenPlay",this.a.Ui,{S:function(){I.p(d);var a=N.e,b,c,l;void 0===N.e.Yb&&(void 0!==N.a.M.Yb&&(void 0!==N.a.M.Yb.nu&&(b=N.a.M.Yb.nu),void 0!==N.a.M.Yb.Km&&(H.Bd("music",N.a.M.Yb.Km),a.Kf()||jb("music"),N.e.Mw=N.a.M.Yb.Km),c=void 0!==N.a.M.Yb.ju?
N.a.M.Yb.ju:0,l=void 0!==N.a.M.Yb.Tj?N.a.M.Yb.Tj:0),void 0===b&&"undefined"!==typeof xg&&(b=xg),void 0!==b&&(N.e.Yb=H.play(b,c,l),N.e.Yb&&(H.Op(N.e.Yb,"music"),H.Cs(N.e.Yb,!0))));N.k.Rf&&!a.jc?a.screen=new jh:kh(a,0);return!0},Vb:!0});c.ec=Math.floor(this.a.Ui/2);c.fc=Math.floor(mf.height/2);!1!==a?(hh(c,"xScale",b,0,1,this.a.wl),hh(c,"yScale",b,0,1,this.a.wl),this.xl=0):this.xl=this.a.wl;this.vl=c;this.Vi=c.y;this.sg.push(c);this.de()};
function lh(a){var b=hc([M,function(a,b,g,h){return ec(a,b,g,h,2)},Yb],[!0,!1,!1],[.02,.1,.88]);a.os=!0;hh(a.vl,"xScale",gc(b),1,.25,4E3);hh(a.vl,"yScale",gc(b),1,-.1,4E3)}e.Ps=function(a){var b;this.Vr=!0;b=new Og(N.b.g(this.a.co,this.canvas.width,kf.width),N.b.g(this.a.jl,this.canvas.height,kf.height),this.depth-20,new Tb(kf),[kf],{S:N.e.fe,Vb:!0});!1!==a&&hh(b,"alpha",L,0,1,this.a.tw);this.bo=b;this.jl=b.y;this.sg.push(b);this.de()};
e.Fa=function(){var a,b,c,d;if(a=this.a.backgroundImage)N.b.mb(N.rf),c=Math.abs(N.ra),1<a.I?(b=(p.canvas.height-c)/a.xg,d=-(a.ki*b-p.canvas.width)/2,ta(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.ya(0,d,c,b,b,0,1))};
e.Xm=function(){var a,b,c,d,g,h;if("function"===typeof N.l.Di&&(h=this.a.Ef,(this.Aa=N.l.Di())&&0<this.Aa.length)){this.oa?this.oa.clear():this.oa=new x(this.a.Ef,this.a.Oi);y(this.oa);h/=this.Aa.length;for(c in this.Aa)try{g=this.Aa[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Oi/g.height)),a="center"===this.a.Mi?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.oa.height-g.height*d,g instanceof r?g.ya(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}z(this.oa);
this.dl=0;this.Wn=!0;this.Ni=0;this.Df=Sb(0,0,this.oa.width,this.oa.height);this.de()}};e.de=function(){var a;a=0;N.Z.height<this.a.Mm&&(a=this.a.Mm-N.Z.height);this.qo&&(this.vl.y=this.Vi-a);this.Vr&&(this.bo.y=this.jl-a,this.bo.x=N.b.g(this.a.co,N.Z.width,kf.width)+N.Z.left);this.jk&&(this.jk.y=this.kk-a);this.Ck&&this.nc>=this.a.gd&&(this.Dk=this.Gg-N.ra);this.oa&&(this.Ab=N.b.g(this.a.Ab,N.Z.width,this.oa.width)+N.Z.left,this.sc=N.b.g(this.a.sc,N.Z.height,this.oa.height)+N.Z.top)};
e.Tb=function(){this.Fa();this.a.Hg&&(N.b.mb(N.sb),this.a.Hg.q(0,0,-this.a.Hg.height-10));this.Xm();this.X.start()};e.yb=function(){var a;for(a=0;a<this.sg.length;a++)I.p(this.sg[a])};
e.va=function(a){this.canvas.Y=!0;this.Ck&&this.nc<this.a.gd&&(this.wn=this.a.dv(this.nc,this.zi,this.Bk-this.zi,this.a.gd),this.Dk=this.a.ev(this.nc,this.Ai,this.Gg-this.Ai,this.a.gd)-N.ra,this.rn=this.a.bv(this.nc,this.a.un,this.a.Qq-this.a.un,this.a.gd),this.sn=this.a.cv(this.nc,this.a.vn,this.a.Rq-this.a.vn,this.a.gd),this.qn=this.a.av(this.nc,this.a.tn,this.a.Pq-this.a.tn,this.a.gd),this.nc+=a,this.nc>=this.a.gd&&(this.wn=this.Bk,this.Dk=this.Gg-N.ra,this.rn=this.a.Qq,this.sn=this.a.Rq,this.qn=
this.a.Pq));this.qo&&(!this.os&&this.xl>=this.a.wl+this.a.mx&&lh(this),this.xl+=a)};e.Ig=function(a,b,c){this.Df&&Ub(this.Df,this.Ab,this.sc,b,c)&&(this.ib=Math.floor((b-this.Ab)/(this.oa.width/this.Aa.length)))};
e.Jg=function(a,b,c){void 0!==this.ib&&(this.Aa[this.ib].url||this.Aa[this.ib].action)&&Ub(this.Df,this.Ab,this.sc,b,c)&&(b-=this.Ab,b>=this.oa.width/this.Aa.length*this.ib&&b<this.oa.width/this.Aa.length*(this.ib+1)&&(this.Aa[this.ib].url?N.l.kd(this.Aa[this.ib].url):this.Aa[this.ib].action()));this.ib=void 0};e.zb=function(){this.qb=!0};
e.Ub=function(){this.qb&&(this.X.stop(),this.Ck?this.nc<this.a.gd&&(this.nc=this.a.gd-1):(this.Os(),this.nc=this.a.gd-1),this.jk?mh(this.jk):this.Qs(!1),this.Vr?mh(this.bo):this.Ps(!1),this.qo?(mh(this.vl),this.os&&lh(this)):this.Rs(!1),this.qb=!1)};e.hd=function(a){a===N.Ke&&(this.Fa(),this.de())};e.Ua=function(){this.Ck&&this.a.Hg&&this.a.Hg.ya(0,this.wn,this.Dk,this.rn,this.sn,0,this.qn);this.oa&&this.oa.q(this.Ab,this.sc);this.Rb=!1};
function jh(){this.depth=100;this.j=this.visible=!0;N.b.bb(this,N.sb);var a;this.a=N.a.u.De;if("landscape"===N.orientation)for(a in N.a.u.zr)this.a[a]=N.a.u.zr[a];this.za=N.a.o.FA;if(N.a.o.De)for(a in N.a.o.De)this.a[a]=N.a.o.De[a];this.cc=N.a.u.Ob;for(var b in N.a.M.De)this.a[b]=N.a.M.De[b];this.Af=-1;this.Ja=0;this.Bf=[];K(this)}e=jh.prototype;
e.Fa=function(){var a,b,c,d;N.b.mb(N.rf);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(N.ra),1<a.I?(b=(p.canvas.height-c)/a.xg,d=-(a.ki*b-p.canvas.width)/2,ta(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.ya(0,d,c,b,b,0,1));var g;b=N.a.u.ia.type[N.k.yd].uc;N.a.o.ia&&N.a.o.ia.type&&N.a.o.ia.type[N.k.yd]&&N.a.o.ia.type[N.k.yd]&&(b=!1===N.a.o.ia.type[N.k.yd].uc?!1:b);void 0!==this.za&&void 0!==this.za.uc&&(b=this.za.uc);c=N.b.g(this.a.sy,
this.canvas.width,sc.width);a=N.b.g(this.a.To,N.Z.height,sc.height)+N.Z.top;b&&(sc.q(0,c,a),b=U.N(),C(b,this.a.So),F(b,"center"),b.q(this.O+" / "+this.bp,c+Math.floor(sc.width/2),a+sc.height+this.a.Ms));if(void 0!==this.za&&void 0!==this.za.iy?this.za.iy:1)b=U.N(),void 0!==this.a.px?C(b,this.a.px):C(b,this.a.zl),c=N.i.r("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Na(b,c,this.a.rx,this.a.qx),d<b.fontSize&&D(b,d),d=N.b.fa(this.a.ps,this.canvas.width,b.da(c),b.align),g=N.b.fa(this.a.so,N.Z.height,
b.W(c),b.h)+N.Z.top,b.q(c,d,g),c=""+this.Al,C(b,this.a.zl),d=N.b.fa(this.a.ps,this.canvas.width,b.da(c),b.align),b.q(c,d,a+sc.height+this.a.Ms)};
function nh(a){if("grid"===a.a.type){y(a.Ki);p.clear();a.zf=[];var b;b=function(b,d,g){var h,k,l,n,q,w,A,E,s,t,u,v,J,ga,W,Z,Da,Oa,Qd,Qb,Vd,Eb,og;k=N.k.U[b];Qd=a.Kb?a.a.kv:a.a.lv;Qb=a.a.Dn;Vd=Qd;if(a.a.Bu)h=a.a.Bu[b];else{Oa=a.Kb?a.a.$w:a.a.ax;for(Eb=Math.floor(k/Oa);1<Math.abs(Eb-Oa);)Oa-=1,Eb=Math.floor(k/Oa);for(h=[];0<k;)h.push(Math.min(Oa,k)),k-=Oa}Eb=h.length;Da=Math.round(((a.Kb?a.a.Fr:a.a.Gr)-(Eb+1)*Qd)/Eb);og=a.a.yu?a.a.yu:!1;if(!og){Oa=1;for(k=0;k<Eb;k++)Oa=Math.max(h[k],Oa);Z=Math.round((a.canvas.width-
2*Qb)/Oa)}for(k=n=0;k<Eb;k++){Oa=h[k];og&&(Z=Math.round((a.canvas.width-2*Qb)/Oa));for(l=0;l<Oa;l++){s=a.a.vq;J=a.a.Mu;u=N.k.zg||"locked";v=0;q=oh(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(u=q.state),"object"===typeof q.stats&&null!==q.stats&&(v=q.stats.stars||0));ga="locked"===u;"function"===typeof N.o.Tq&&(w=N.o.Tq(ph(N.e,b,n),0,0,u))&&(J=ga=s=!1);q=Qb+d;E=Vd;W=t=1;if(!1!==J){A=a.Kb?nc:tc;if("played"===u)switch(v){case 1:A=a.Kb?oc:uc;break;case 2:A=a.Kb?pc:vc;break;case 3:A=
a.Kb?qc:wc}else a.Kb||"locked"!==u||(A=xc);A.width>Z&&(W=Z/A.width);A.height>Da&&(W=Math.min(t,Da/A.height));q+=Math.round((Z-A.width*W)/2);E+=Math.round((Da-A.height*W)/2);A.ya(0,q,E,W,W,0,1);g&&(a.zf[n]={x:q,y:E})}w&&(w.width>Z&&(t=Z/w.width),w.height>Da&&(t=Math.min(t,Da/w.height)),void 0!==A?(v=N.b.g(a.a.xr,A.width*W,w.width*t),J=N.b.g(a.a.yr,A.height*W,w.height*t)):(v=N.b.g(a.a.xr,Z,w.width*t),J=N.b.g(a.a.yr,Da,w.height*t),g&&(a.zf[n]={x:q+v,y:E+J})),w instanceof x?w.ya(q+v,E+J,t,t,0,1):w.ya(0,
q+v,E+J,t,t,0,1));!1===s||ga||(s=""+(N.k.sj?n+1:ph(N.e,b,n)+1),t=a.fonts.yn,"locked"===u&&void 0!==a.fonts.Xv?t=a.fonts.Xv:"unlocked"===u&&void 0!==a.fonts.iz?t=a.fonts.iz:"played"===u&&void 0!==a.fonts.played&&(t=a.fonts.played),void 0!==A?(v=N.b.fa(a.a.Br,A.width*W,t.da(s),t.align),J=N.b.fa(a.a.Cr,A.height*W,t.W(s),t.h)):(v=N.b.fa(a.a.Br,Z,t.da(s),t.align),J=N.b.fa(a.a.Cr,Da,t.W(s),t.h)),t.q(s,q+v,E+J));a.Kb&&ga&&(void 0!==A?(v=N.b.g(a.a.Nr,A.width*W,rc.width),J=N.b.g(a.a.Or,A.height*W,rc.height)):
(v=N.b.g(a.a.Nr,Z,rc.width),J=N.b.g(a.a.Or,Da,rc.height)),rc.q(0,q+v,E+J));Qb+=Z;n++}Qb=a.a.Dn;Vd+=Da+Qd}};a.Gi&&b(a.G-1,0);b(a.G,a.canvas.width,!0);a.Fi&&b(a.G+1,2*a.canvas.width);z(a.Ki)}}function qh(a,b){switch(b-a.G){case 0:a.io=0;break;case 1:a.io=-a.canvas.width;break;case -1:a.io=a.canvas.width}a.Rg=!0;a.nl=0;a.moveStart=a.Ja;a.Zr=a.io-a.Ja;a.ml=Math.min(a.a.Iw-a.nh,Math.round(Math.abs(a.Zr)/(a.am/1E3)));a.ml=Math.max(a.a.Hw,a.ml)}
function rh(a){if(1<N.k.U.length){var b,c;b=N.b.g(a.a.Az,a.canvas.width,rf.width);c=N.b.g(a.a.rp,N.Z.height,rf.height)+N.Z.top;a.Ie=new Og(b,c,a.depth-20,new Tb(rf),[rf],function(){a.Gd="previous";qh(a,a.G-1);return!0});b=N.b.g(a.a.zz,a.canvas.width,sf.width);c=N.b.g(a.a.qp,N.Z.height,sf.height)+N.Z.top;a.He=new Og(b,c,a.depth-20,new Tb(sf),[sf],function(){a.Gd="next";qh(a,a.G+1);return!0});sh(a)}else a.Ee-=a.a.Xq}
function sh(a){if(1<N.k.U.length){var b;a.Gi?(b=[rf],a.Ie.gb=!0):(b=[new x(rf.width,rf.height)],y(b[0]),rf.q(1,0,0),z(b[0]),a.Ie.gb=!1);th(a.Ie,b);a.Fi?(b=[sf],a.He.gb=!0):(b=[new x(sf.width,sf.height)],y(b[0]),sf.q(1,0,0),z(b[0]),a.He.gb=!1);th(a.He,b)}}
function uh(a){var b,c,d;y(a.eg);p.clear();b=U.N();a.a.Jb&&C(b,a.a.Jb);F(b,"center");G(b,"middle");c=N.i.r("levelMapScreenWorld_"+a.G,"<LEVELMAPSCREENWORLD_"+a.G+">");d=Na(b,c,a.a.rd-(b.stroke?b.Tc:0),a.a.me-(b.stroke?b.Tc:0),!1);d<b.fontSize&&D(b,d);b.q(c,a.eg.width/2,a.eg.height/2);z(a.eg);a.canvas.Y=!0}
e.Tb=function(){var a,b,c,d=this;this.Kb=this.a.Kb?!0:!1;if(!this.Kb){for(a=0;a<N.k.U.length;a++)if(9<N.k.U[a]){b=!0;break}b||(this.Kb=!0)}this.Ki=new x(3*this.canvas.width,this.Kb?this.a.Fr:this.a.Gr);this.Dr=-this.canvas.width;this.Er=this.Kb?this.a.Wq:this.a.Yq;this.Ee=N.b.g(this.Er,N.Z.height,this.Ki.height)+N.Z.top;this.eg=new x(this.a.rd,this.a.me);this.cz=N.b.g(this.a.Ne,this.canvas.width,this.a.rd);this.kt=N.b.g(this.a.Zb,N.Z.height,this.eg.height)+N.Z.top;this.Ar="undefined"!==typeof s_level_mask?
s_level_mask:this.Kb?Tb(nc):Tb(tc);this.a.vq&&(this.fonts={},a=function(a){var b,c;for(b in a)c=U.N(),C(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.yn=U,this.Kb?a(this.a.Lv):a(this.a.Mv));this.G=N.e.G;this.U=N.k.U[this.G];this.bm=!1;this.am=this.Yo=this.nh=0;this.Zo=this.Dr;this.Ja=0;this.Gi=0<this.G;this.Fi=this.G<N.k.U.length-1;for(b=this.bp=this.Al=this.O=0;b<N.k.U.length;b++)for(a=0;a<N.k.U[b];a++)c=vh(N.e,void 0,a,b),this.bp+=3,"object"===typeof c&&null!==c&&(this.O+=void 0!==c.stars?c.stars:
0,this.Al+=void 0!==c.highScore?c.highScore:0);N.o.jv&&(this.Al=N.o.jv());this.Fa();a=this.cc[this.a.cx];this.lo=new Og(N.b.g(this.a.dx,this.canvas.width,a.w.width),N.b.g(this.a.mo,N.Z.height,a.w.height)+N.Z.top,this.depth-20,new Tb(a.w),[a.w],{S:N.e.fe,ca:this});rh(this);nh(this);uh(this);this.Rb=!0};e.yb=function(){this.Ie&&I.p(this.Ie);this.He&&I.p(this.He);I.p(this.lo)};
e.zb=function(a,b,c){if(!this.Rg)for(a=0;a<this.zf.length;a++)if(Ub(this.Ar,this.zf[a].x-this.canvas.width,this.zf[a].y+this.Ee,b,c)){this.Af=a;break}this.Rg=!1;1<N.k.U.length&&(this.bm=!0,this.nh=0,this.$s=this.Zo=b,this.am=this.Yo=0)};
e.Ub=function(a,b,c){if(!this.Rg&&-1!==this.Af&&Ub(this.Ar,this.zf[this.Af].x-this.canvas.width,this.zf[this.Af].y+this.Ee,b,c)&&(a=N.k.zg||"locked",b=oh(this.G,this.Af,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return I.p(this),kh(N.e,this.Af,this.G),!0;this.Af=-1;this.bm=!1;1<N.k.U.length&&(Math.abs(this.Ja)>=this.a.Py&&(this.am>=this.a.Qy||Math.abs(this.Ja)>=this.a.Oy)?"previous"===this.Gd?this.Gi&&0<=this.Ja&&this.Ja<=this.canvas.width/2?qh(this,
this.G-1):(0>this.Ja||(this.Gd="next"),qh(this,this.G)):"next"===this.Gd&&(this.Fi&&0>=this.Ja&&this.Ja>=-this.canvas.width/2?qh(this,this.G+1):(0<this.Ja||(this.Gd="previous"),qh(this,this.G))):0<Math.abs(this.Ja)&&(this.Gd="next"===this.Gd?"previous":"next",qh(this,this.G)));return!0};
e.hd=function(a){if(a===N.yf||a===N.Ke)this.canvas.Y=!0,this.Fa(),a===N.Ke?(this.kt=N.b.g(this.a.Zb,N.Z.height,this.eg.height)+N.Z.top,this.Ee=N.b.g(this.Er,N.Z.height,this.Ki.height)+N.Z.top,this.lo.y=N.b.g(this.a.mo,N.Z.height,this.lo.images[0].height)+N.Z.top,this.Ie&&(this.Ie.y=N.b.g(this.a.rp,N.Z.height,rf.height)+N.Z.top),this.He&&(this.He.y=N.b.g(this.a.qp,N.Z.height,sf.height)+N.Z.top),void 0===this.He&&void 0===this.Ie&&(this.Ee-=this.a.Xq)):(uh(this),nh(this))};
e.oc=function(a){var b=I.ka[0].x;this.bm&&(this.Yo=Math.abs(this.Zo-b),0<this.nh&&(this.am=this.Yo/(this.nh/1E3)),this.Gd=b>this.Zo?"previous":"next",this.nh+=a,this.Ja+=b-this.$s,this.$s=b,this.canvas.Y=!0);this.Rg&&(this.Ja=ac(this.nl,this.moveStart,this.Zr,this.ml),this.nl>=this.ml&&(this.Rg=!1,this.Ja=0),this.nl+=a,this.canvas.Y=!0);if(this.Rg||this.bm)"previous"===this.Gd&&this.Ja>=this.canvas.width/2?0<=this.G-1?(this.G-=1,this.U=N.k.U[this.G],this.Gi=0<this.G,this.Fi=this.G<N.k.U.length-1,
sh(this),this.Ja-=this.canvas.width,uh(this),nh(this),this.canvas.Y=!0,this.moveStart-=this.canvas.width):this.Ja=Math.round(this.canvas.width/2):"next"===this.Gd&&this.Ja<=-this.canvas.width/2&&(this.G+1<N.k.U.length?(this.G+=1,this.U=N.k.U[this.G],this.Gi=0<this.G,this.Fi=this.G<N.k.U.length-1,sh(this),this.Ja+=this.canvas.width,uh(this),nh(this),this.canvas.Y=!0,this.moveStart+=this.canvas.width):this.Ja=Math.round(-this.canvas.width/2))};
e.Ua=function(){this.eg.q(this.cz,this.kt);this.Ki.q(Math.round(this.Dr+this.Ja),this.Ee);this.Rb=!1};
function wh(a,b,c,d){this.depth=10;this.j=this.visible=!0;N.b.bb(this,N.sb);var g;this.type=b.failed?"failed":a;this.a=N.a.u.ia;this.za=this.a.type[this.type];if("landscape"===N.orientation)for(g in N.a.u.wr)this.a[g]=N.a.u.wr[g];for(g in N.a.M.ia)this.a[g]=N.a.M.ia[g];if(N.a.M.ia&&N.a.M.ia.type&&N.a.M.ia.type[this.type])for(g in N.a.M.ia.type[this.type])this.a[g]=N.a.M.ia.type[this.type][g];if("failed"===this.type){if(void 0!==N.a.o.ia&&N.a.o.ia.type&&void 0!==N.a.o.ia.type.failed)for(g in N.a.o.ia.type[this.type])this.za[g]=
N.a.o.ia.type[this.type][g]}else{if(void 0!==N.a.o.ia&&void 0!==N.a.o.ia.type)for(g in N.a.o.ia.type[this.type])this.za[g]=N.a.o.ia.type[this.type][g];for(g in N.a.o.ia)this.za[g]=N.a.o.ia[g]}this.ta=b;this.S=c;this.ca=d;this.ny=[jg,kg,lg];this.bf=[];this.X=new Vb;this.X.parent=this;K(this,!1)}
function xh(a){var b;for(b=0;b<a.O.length;b++)yh(a.O[b]);for(b=0;b<a.Tf.length;b++)I.p(a.Tf[b]);a.Tf=[];a.Ia&&yh(a.Ia);a.Ia=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].gb=!1;a.X.stop();a.X=void 0;zh(a)}
function Ah(a,b){var c;switch(b){case "title_level":c=N.i.r("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.ta.level);break;case "title_endless":c=N.i.r("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.ta.stage);break;case "title_difficulty":c=N.i.r("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.kc(a.a.Jb,c,a.a.Ne,a.a.Zb,a.a.rd,a.a.me)}
function Bh(a,b){var c;switch(b){case "subtitle_failed":c=N.i.r("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.kc(a.a.Xo,c,a.a.Iy,a.a.Jy)}
function Ch(a,b,c){var d,g,h,k,l;g=N.i.r(b.key,"<"+b.key.toUpperCase()+">");d=b.ue?b.toString(b.Uf):b.toString(b.lc);h=a.a.jh;h.align="left";h.h="top";l=U.N();C(l,h);c?(G(l,"bottom"),h=a.a.Le,h.align="left",h.h="bottom",c=U.N(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Zl),void 0!==d&&(h+=c.da(d)),h=N.b.g(a.a.Me,a.canvas.width,h)-a.c.x,void 0!==g&&(l.q(g,h,a.od+l.fontSize),h+=l.da(g)+a.a.Zl,k+=l.W(g)),void 0!==d&&(b.ue?(d=c.W(d),l=a.od+l.fontSize-d,b.ni=new Dh(h,l,a.a.kh,d,a.depth-100,b.Uf,c,a.a.hh,
a.a.ih,a.c,b.toString),k=Math.max(k,d)):(c.q(d,h,a.od+l.fontSize+a.a.Ss),k=Math.max(k,c.W(d)))),0<k&&(a.od+=k+a.a.Sc)):(void 0!==g&&(a.kc(h,g,a.a.Me,a.a.Vf),k=a.a.Vf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Sc:a.a.Sc,k.offset+=l.W(g)):"number"===typeof k&&(k+=a.a.Sc+l.W(g))),void 0!==d&&(h=a.a.Le,h.h="top",b.ue?(c=U.N(),h.align="center",C(c,h),g=N.b.g(a.a.Me,a.canvas.width,a.a.kh)-a.c.x,l=k-a.c.y,b.ni=new Dh(g,l,a.a.kh,c.W(d),a.depth-100,b.Uf,c,a.a.hh,a.a.ih,a.c,b.toString)):a.kc(h,
d,a.a.Me,k)))}
function Eh(a,b,c){var d,g,h,k,l,n;switch(b){case "totalScore":d=""+a.ta.totalScore;g=N.i.r("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=N.i.r("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.ta.highScore;break;case "timeLeft":g=N.i.r("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.ta.timeLeft;break;case "timeBonus":g=N.i.r("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.ta.timeBonus,n=a.ta.timeBonus}h=a.a.jh;h.align=
"left";h.h="top";l=U.N();C(l,h);c?(G(l,"bottom"),h=a.a.Le,h.align="left",h.h="bottom",c=U.N(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Zl),void 0!==d&&(h+=c.da(d)),h=N.b.g(a.a.Me,a.canvas.width,h)-a.c.x,void 0!==g&&(l.q(g,h,a.od+l.fontSize),h+=l.da(g)+a.a.Zl,k+=l.W(g)),void 0!==d&&(void 0!==n?(d=c.W(d),l=a.od+l.fontSize-d,n=new Dh(h,l,a.a.kh,d,a.depth-100,n,c,a.a.hh,a.a.ih,a.c),k=Math.max(k,d)):(c.q(d,h,a.od+l.fontSize+a.a.Ss),k=Math.max(k,c.W(d)))),0<k&&(a.od+=k+a.a.Sc)):(void 0!==g&&(a.kc(h,g,a.a.Me,
a.a.Vf),k=a.a.Vf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Sc:a.a.Sc,k.offset+=l.W(g)):"number"===typeof k&&(k+=a.a.Sc+l.W(g))),void 0!==d&&(h=a.a.Le,h.h="top",void 0!==n?(c=U.N(),h.align="center",C(c,h),g=N.b.g(a.a.Me,a.canvas.width,a.a.kh)-a.c.x,l=k-a.c.y,n=new Dh(g,l,a.a.kh,c.W(d),a.depth-100,n,c,a.a.hh,a.a.ih,a.c)):a.kc(h,d,a.a.Me,k)));n instanceof Dh&&("totalScore"===b?a.gg=n:a.bf.push(n))}
function Fh(a,b){var c,d,g;c=N.i.r(b.key,"<"+b.key.toUpperCase()+">");d=b.ue?b.toString(b.Uf):b.toString(b.lc);void 0!==c&&a.kc(a.a.qk,c,a.a.Cq,a.a.dn);void 0!==d&&(b.ue?(c=U.N(),d=a.a.Bg,a.a.eA||(d.align="center"),C(c,d),d=N.b.g(a.a.uk,a.canvas.width,a.a.tk)-a.c.x,g=N.b.g(a.a.Cg,a.canvas.height,a.a.sk)-a.c.y,b.ni=new Dh(d,g,a.a.tk,a.a.sk,a.depth-100,b.Uf,c,a.a.hh,a.a.ih,a.c,b.toString)):a.kc(a.a.Bg,d,a.a.uk,a.a.Cg))}
function Gh(a,b){var c,d,g,h;switch(b){case "totalScore":c=N.i.r("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.ta.totalScore;g=0;break;case "timeLeft":c=N.i.r("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.ta.timeLeft}void 0!==c&&a.kc(a.a.qk,c,a.a.Cq,a.a.dn);void 0!==d&&(void 0!==g?(c=U.N(),d=a.a.Bg,d.align="center",C(c,d),d=N.b.g(a.a.uk,a.canvas.width,a.a.tk)-a.c.x,h=N.b.g(a.a.Cg,a.canvas.height,a.a.sk)-a.c.y,g=new Dh(d,h,a.a.tk,a.a.sk,a.depth-100,g,c,a.a.hh,a.a.ih,
a.c)):a.kc(a.a.Bg,d,a.a.uk,a.a.Cg));g instanceof Dh&&("totalScore"===b?a.gg=g:a.bf.push(g))}e=wh.prototype;e.kc=function(a,b,c,d,g,h){var k=U.N();C(k,a);void 0!==g&&void 0!==h&&(a=Na(k,b,g,h,g),k.fontSize>a&&D(k,a));a=k.da(b);h=k.W(b);k.q(b,N.b.fa(c,this.canvas.width,a,k.align)-this.c.x,N.b.fa(d,this.canvas.height,h,k.h)-this.c.y,g)};
function Hh(a,b){var c,d,g,h;switch(b){case "retry":c=ef;d=function(){a.xe="retry";xh(a)};break;case "exit":c=hf,d=function(){a.xe="exit";xh(a)}}void 0!==c&&(g=N.b.g(a.a.iu,a.canvas.width,c.width)-a.c.x,h=N.b.g(a.a.Vp,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Og(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
function Ih(a,b){var c,d,g,h;switch(b){case "retry":c=gf;d=function(){a.xe="retry";xh(a)};break;case "exit":c=ff;d=function(){a.xe="exit";xh(a)};break;case "next":c=ff,d=function(){a.xe="next";xh(a)}}void 0!==c&&(g=N.b.g(a.a.Zu,a.canvas.width,c.width)-a.c.x,h=N.b.g(a.a.Mq,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Og(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
e.Tb=function(){this.n=0;this.O=[];this.Tf=[];this.buttons=[];this.canvas.Y=!0;this.xe="";this.Mc=this.ta.failed?!0:!1;this.uc=this.za.uc&&!this.Mc;this.eh=this.za.eh&&!this.Mc&&this.ta.hr;this.Fm=this.alpha=this.rg=0;Jh(this);var a,b,c,d,g,h,k=this;switch(this.za.Vj){case "failed":this.f=this.a.sl.Kv;break;case "level":this.f=this.a.sl.Ov;break;case "difficulty":this.f=this.a.sl.K;break;case "endless":this.f=this.a.sl.Tu}this.c=new Kh(this.depth-10,this.Ha,new x(this.f.width,this.f.height));this.c.x=
N.b.g(this.a.Db,this.canvas.width,this.f.width);this.c.y=N.b.g(this.a.kb,this.canvas.height,this.f.height);y(this.c.f);this.f.q(0,0,0);!this.Mc&&this.uc&&(b=N.b.g(this.a.Mo,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.No,this.canvas.height,Zc.height)-this.c.y+Math.round(Yc.height/2),Yc.q(0,b,a),b=N.b.g(this.a.Oo,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.Po,this.canvas.height,ad.height)-this.c.y+Math.round($c.height/2),$c.q(0,b,a),b=N.b.g(this.a.Qo,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.Ro,
this.canvas.height,cd.height)-this.c.y+Math.round(bd.height/2),bd.q(0,b,a));void 0!==this.za.qh&&Ah(this,this.za.qh);void 0!==this.za.Ws&&Bh(this,this.za.Ws);this.ub={};void 0!==this.ta.xd?(c=this.ta.xd,c.visible&&Fh(this,c),this.ub[c.id]=c):void 0!==this.za.rk&&Gh(this,this.za.rk);if(void 0!==this.ta.ub)for(a=this.ta.ub.length,b=U.N(),C(b,this.a.jh),c=U.N(),C(c,this.a.Le),b=Math.max(b.W("g"),c.W("g"))*a+this.a.Sc*(a-1),this.od=N.b.g(this.a.Vf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)c=this.ta.ub[b],
c.visible&&Ch(this,this.ta.ub[b],1<a),this.ub[c.id]=c;else if(void 0!==this.za.he)if("string"===typeof this.za.he)Eh(this,this.za.he,this.a.Lq);else if(this.za.he instanceof Array)for(a=this.za.he.length,b=U.N(),C(b,this.a.jh),c=U.N(),C(c,this.a.Le),b=Math.max(b.W("g"),c.W("g"))*a+this.a.Sc*(a-1),this.od=N.b.g(this.a.Vf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)Eh(this,this.za.he[b],1<a||this.a.Lq);z(this.c.f);Hh(this,this.za.Sj);Ih(this,this.za.wk);N.e.zt&&(b=N.b.g(k.a.xv,k.canvas.width,k.a.dr)-
this.c.x,a=N.b.g(this.a.yv,this.canvas.height,this.a.gf)-this.c.y,this.cr=new ih("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.dr,{S:function(){void 0!==Lh?N.l.kd(N.C.Nk.url+"submit/"+Lh+"/"+k.ta.totalScore):N.l.kd(N.C.Nk.url+"submit/")},Vb:!0},k.c),this.buttons.push(this.cr),b=function(a){a&&(k.cr.rj("levelEndScreenSubmitHighscoreBtn"),k.CA=a)},Mh(this.ta.totalScore,b));b=N.b.g(this.a.ii,this.canvas.width,this.a.vg)-this.c.x;a=N.b.g(this.a.wg,this.canvas.height,this.a.gf)-this.c.y;
this.buttons.push(new Og(b,a,this.depth-20,new Sb(0,0,this.a.vg,this.a.gf),void 0,function(){k.xe="exit";xh(k)},this.c));for(b=0;b<this.buttons.length;b++)this.buttons[b].gb=!1;this.c.y=-this.c.height;a=this.a.Ty;this.X.ua(a,this.xy);a+=this.a.te;g=0;d=this.a.fz;this.uc&&(d=Math.max(d,this.a.Ks+this.a.Js*this.ta.stars));if(this.gg&&(this.X.ua(a+this.a.im,function(a,b){Nh(b.parent.gg,b.parent.ta.totalScore,d)}),g=a+this.a.im+d,0<this.bf.length)){h=function(a,b){var c=b.parent,d=c.bf[c.rg];Nh(c.gg,
c.gg.value+d.value,c.a.qg);Nh(d,0,c.a.qg);c.rg+=1};for(b=0;b<this.bf.length;b++)g+=this.a.bq,this.X.ua(g,h);g+=this.a.qg}if(void 0!==this.ub&&(g=a,h=function(a,b){var c=b.parent,d=c.Uo[c.rg||0],g=c.ub[d.Yl];void 0!==d.Pe&&(g.visible&&g.ue?Nh(g.ni,d.Pe(g.ni.value),c.a.qg):g.lc=d.Pe(g.lc));d.visible&&d.ue&&Nh(d.ni,d.lc,c.a.qg);c.rg+=1},this.Uo=[],void 0!==this.ta.xd&&void 0!==this.ta.xd.Pe&&(this.X.ua(a+this.a.im,h),this.Uo.push(this.ta.xd),g+=this.a.im+bonusCounterDuration),void 0!==this.ta.ub))for(b=
0;b<this.ta.ub.length;b++)c=this.ta.ub[b],void 0!==c.Pe&&(g+=this.a.bq,this.X.ua(g,h),this.Uo.push(c),g+=this.a.qg);if(this.uc){for(b=0;b<this.ta.stars;b++)a+=this.a.Js,this.X.ua(a,this.By),this.X.ua(a,this.Cy);a+=this.a.Ks}a=Math.max(a,g);this.eh&&(a+=this.a.jw,this.X.ua(a,this.wy),this.X.ua(a,this.uy),this.X.ua(a+this.a.kw,this.vy));a+=500;this.X.ua(a,function(){N.l.Gv&&N.l.Gv()});this.X.ua(a+this.a.Fw,N.l.jr);N.l.kr(this.ta);this.X.start();this.ro(this.Mc)};e.ro=function(a){a?H.play(mg):H.play(hg)};
e.va=function(a){this.alpha=this.a.ri*this.Fm/this.a.rb;this.Fm+=a;this.alpha>=this.a.ri&&(this.alpha=this.a.ri,this.j=!1);this.canvas.Y=!0};
e.xy=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].gb=!0}var d=b.parent,g,h;switch(d.a.Ez){case "fromLeft":h="horizontal";g=N.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.x=-d.c.width;d.c.y=N.b.g(d.a.kb,d.canvas.height,d.c.height)+Math.abs(N.ra);break;case "fromRight":h="horizontal";g=N.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.x=d.canvas.width;d.c.y=N.b.g(this.parent.a.kb,d.canvas.height,selft.c.height)+Math.abs(N.ra);break;case "fromBottom":h="vertical";g=N.b.g(d.a.kb,
d.canvas.height,d.c.height)+Math.abs(N.ra);d.c.x=N.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.y=d.canvas.height+d.c.height;break;default:h="vertical",g=N.b.g(d.a.kb,d.canvas.height,d.c.height)+Math.abs(N.ra),d.c.x=N.b.g(d.a.Db,d.canvas.width,d.c.width),d.c.y=-d.c.height}"vertical"===h?Y(d.c,"y",g,d.a.te,d.a.Nj,c):Y(d.c,"x",g,d.a.te,d.a.Nj,c)};
function zh(a){function b(){I.p(a);a.ca?a.S.call(a.ca,a.xe):a.S(a.xe)}var c,d;switch(a.a.Fz){case "toLeft":d="horizontal";c=-a.c.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.c.height;break;default:d="vertical",c=-a.c.height}"vertical"===d?Y(a.c,"y",c,a.a.Oj,a.a.Pj,b):Y(a.c,"x",c,a.a.Oj,a.a.Pj,b)}
e.By=function(a,b){var c,d=b.parent,g=Math.abs(N.ra);if(d.O.length<d.ta.stars){switch(d.O.length+1){case 1:c=new Kh(d.depth-30,N.Wd,Zc);c.x=N.b.g(d.a.Mo,d.canvas.width,0);c.y=N.b.g(d.a.No,d.canvas.height,Zc.height)+g+Math.round(Yc.height/2);break;case 2:c=new Kh(d.depth-30,N.Wd,ad);c.x=N.b.g(d.a.Oo,d.canvas.width,0);c.y=N.b.g(d.a.Po,d.canvas.height,ad.height)+g+Math.round($c.height/2);break;case 3:c=new Kh(d.depth-30,N.Wd,cd),c.x=N.b.g(d.a.Qo,d.canvas.width,0),c.y=N.b.g(d.a.Ro,d.canvas.height,cd.height)+
g+Math.round(bd.height/2)}c.xa=d.a.Ls;c.Ka=d.a.Ls;c.alpha=d.a.ry;Y(c,"scale",1,d.a.qy,M,function(){var a=d.O.length,b,c,n;y(d.c.f);switch(a){case 1:n=Zc;b=N.b.g(d.a.Mo,d.canvas.width,0)-d.c.x;c=N.b.g(d.a.No,d.canvas.height,Zc.height)-d.c.y+g+Math.round(Yc.height/2);break;case 2:n=ad;b=N.b.g(d.a.Oo,d.canvas.width,0)-d.c.x;c=N.b.g(d.a.Po,d.canvas.height,Zc.height)-d.c.y+g+Math.round($c.height/2);break;case 3:n=cd,b=N.b.g(d.a.Qo,d.canvas.width,0)-d.c.x,c=N.b.g(d.a.Ro,d.canvas.height,Zc.height)-d.c.y+
g+Math.round(bd.height/2)}n.q(0,b,c);z(d.c.f);d.c.Rb=!0;I.p(d.O[a-1])});Y(c,"alpha",1,d.a.py,$b);d.O.push(c);H.play(d.ny[d.O.length-1])}};e.Cy=function(a,b){var c=b.parent,d,g;d=c.O[c.Tf.length];g=new Kh(c.depth-50,N.Wd,dd);g.x=d.x;g.y=d.y;Y(g,"subImage",dd.I-1,c.a.oy,void 0,function(){I.p(g)});c.Tf.push(g)};
e.uy=function(a,b){var c=b.parent,d,g,h,k,l,n,q;d=[];h=U.N();k=N.i.r("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.Ur&&C(h,c.a.Ur);g=Na(h,k,c.a.hl,c.a.qw,!0);g<h.fontSize&&D(h,g);l=N.b.fa(c.a.rw,Ac.width,h.da(k,c.a.hl),h.align);n=N.b.fa(c.a.sw,Ac.height,h.W(k,c.a.hl),h.h);for(q=0;q<Ac.I;q++)g=new x(Ac.width,Ac.height),y(g),Ac.q(q,0,0),h.q(k,l,n,c.a.hl),z(g),d.push(g);c.Ia=new Kh(c.depth-120,N.Wd,d);c.Ia.ec=c.a.Rr;c.Ia.fc=c.a.Sr;c.Ia.x=N.b.g({align:"center"},c.c.canvas.width,c.Ia.width)-c.c.x;
c.Ia.y=N.b.g(c.a.il,c.Ia.canvas.height,c.Ia.height)-c.c.y+Math.abs(N.ra);l=N.b.g(c.a.ao,c.Ia.canvas.width,c.Ia.width)-c.c.x;c.Ia.xa=c.a.gl;c.Ia.Ka=c.a.gl;c.Ia.parent=c.c;c.Ia.alpha=0;c.Ia.Rz=!0;Y(c.Ia,"scale",1,c.a.Pg,$b,function(){I.p(c.jb);c.jb=void 0});Y(c.Ia,"x",l,c.a.Pg,$b);Y(c.Ia,"alpha",1,0,$b);Y(c.Ia,"subImage",Ac.I,c.a.ow,$b,void 0,c.a.Pg+c.a.Qr+c.a.nw,!0,c.a.pw)};
e.wy=function(a,b){var c,d=b.parent;d.jb=new Kh(d.depth-110,N.Wd,zc);d.jb.y=N.b.g(d.a.il,d.jb.canvas.height,zc.height)-d.c.y+d.a.mw;d.jb.ec=d.a.Rr;d.jb.fc=d.a.Sr;d.jb.x=N.b.g(d.a.ao,d.jb.canvas.width,d.jb.width)-d.c.x;c=N.b.g(d.a.il,d.jb.canvas.height,zc.height)-d.c.y+Math.abs(N.ra);d.jb.xa=d.a.gl*d.a.Tr;d.jb.Ka=d.a.gl*d.a.Tr;d.jb.alpha=0;d.jb.parent=d.c;Y(d.jb,"y",c,d.a.Pg,$b);Y(d.jb,"scale",1,d.a.Pg,$b);Y(d.jb,"alpha",1,d.a.Pg,$b)};
e.vy=function(a,b){var c=b.parent;c.Ge=new Kh(c.depth-130,N.Wd,yc);c.Ge.parent=c.c;c.Ge.x=c.Ia.x;c.Ge.y=c.Ia.y+c.a.lw;Y(c.Ge,"subImage",yc.I-1,c.a.Qr,void 0,function(){I.p(c.Ge);c.Ge=void 0});H.play(qg)};
e.yb=function(){var a;for(a=0;a<this.buttons.length;a++)I.p(this.buttons[a]);for(a=0;a<this.O.length;a++)I.p(this.O[a]);for(a=0;a<this.Tf.length;a++)I.p(this.Tf[a]);this.Ia&&(I.p(this.Ia),this.Ge&&I.p(this.Ge),this.jb&&I.p(this.jb));I.p(this.c);this.X&&this.X.stop();this.gg&&I.p(this.gg);for(a=0;a<this.bf.length;a++)I.p(this.bf[a]);Oh()};e.Ua=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.alpha;pa(0,0,p.canvas.width,p.canvas.height,this.a.hn,!1);p.context.globalAlpha=a};
function Ph(a,b,c){this.depth=10;this.visible=!0;this.j=!1;N.b.bb(this,N.sb);this.a=N.a.u.Rm;for(var d in N.a.M.Rm)this.a[d]=N.a.M.Rm[d];this.$l=b;this.Pm=c;this.la=dh(N.e);this.la.$g[this.la.Gc]=a;this.X=new Vb;this.X.parent=this;this.buttons=[];K(this,!1)}e=Ph.prototype;
e.nd=function(a){var b,c,d=this;c=function(){Y(d.message,"xScale",1,d.a.Qg,M);Y(d.message,"yScale",1,d.a.Qg,M);Y(d.message,"alpha",1,d.a.Qg,L)};void 0===this.message&&(b=new x(this.a.fo+2*this.a.ww,this.a.Wr+2*this.a.xw),this.message=new Kh(this.depth-20,N.sb,b),this.message.xa=0,this.message.Ka=0,this.message.alpha=0,this.message.ec=Math.floor(b.width/2),this.message.fc=Math.floor(b.height/2),this.message.x=N.b.g(this.a.Bw,this.canvas.width,0)-this.Wg,this.message.y=N.b.g(this.a.Cw,this.canvas.height,
b.height)+Math.floor(b.height/2)-this.If,this.message.parent=this.c,this.X.bc>=this.a.kl?c():this.X.ua(this.a.kl,c));y(this.message.f);p.clear();b=U.N();void 0!==this.a.Qi&&C(b,this.a.Qi);F(b,"center");G(b,"middle");c=Na(b,a,this.a.fo,this.a.Wr,!0);c<b.fontSize&&D(b,c);b.q(a,Math.floor(this.message.width/2),Math.floor(this.message.height/2),this.a.fo);z(this.message.f);0<this.message.xa&&(this.message.Rb=!0)};
function Qh(a,b){var c,d,g;c=U.N();void 0!==a.a.nm&&C(c,a.a.nm);d=Na(c,b,a.a.Vo,a.a.Vs,!0);d<c.fontSize&&D(c,d);d=N.b.fa(a.a.Gy,a.c.width,a.a.Vo,c.align);g=N.b.fa(a.a.Hy,a.c.height,a.a.Vs,c.h);y(a.c.f);c.q(b,d,g,a.a.Vo);z(a.c.f)}
function Rh(a){var b,c,d;c=function(){Y(a.Fb,"xScale",1,a.a.Qg,M);Y(a.Fb,"yScale",1,a.a.Qg,M);Y(a.Fb,"alpha",1,a.a.Qg,L)};b=new x(a.a.pp+2*a.a.uz,a.a.Mt+2*a.a.vz);a.Fb=new Kh(a.depth-20,N.sb,b);a.Fb.xa=0;a.Fb.Ka=0;a.Fb.alpha=0;a.Fb.ec=Math.floor(b.width/2);a.Fb.fc=Math.floor(b.height/2);a.Fb.x=N.b.g(a.a.wz,a.canvas.width,0)-a.Wg;a.Fb.y=N.b.g(a.a.xz,a.canvas.height,b.height)+Math.floor(b.height/2)-a.If;a.Fb.parent=a.c;a.X.bc>=a.a.kl?c():a.X.ua(a.a.kl,c);b=N.i.r("challengeEndScreenWinnings","CHALLENGEENDSCREENWINNINGS");
b=b.replace("<AMOUNT>",a.la.Jt);y(a.Fb.f);c=U.N();void 0!==a.a.nm&&C(c,a.a.nm);F(c,"center");G(c,"middle");d=Na(c,b,a.a.pp,a.a.Mt,!0);d<c.fontSize&&D(c,d);c.q(b,Math.floor(a.Fb.width/2),Math.floor(a.Fb.height/2),a.a.pp);z(a.Fb.f);0<a.Fb.xa&&(a.Fb.Rb=!0)}e.yt=function(a){if("string"===typeof a){var b=N.i.r("challengeEndScreenOutcomeMessage_"+a,"<CHALLENGEENDSCREEN_CHALLENGE"+a.toUpperCase()+">");this.nd(b);"WON"===a&&Rh(this)}};
function Sh(a){var b,c;b=N.b.g(a.a.Ky,a.c.width,a.a.cm);c=N.b.g(a.a.Ly,a.c.height,0);a.buttons.push(new ih("default_text",b,c,a.depth-20,"challengeEndScreensBtn_submit",a.a.cm,function(){var b;a.$l();for(b=0;b<a.buttons.length;b++)I.p(a.buttons[b]);return!0},a.c));b=N.b.g(a.a.wu,a.c.width,a.a.cm);c=N.b.g(a.a.xu,a.c.height,0);a.buttons.push(new ih("default_text",b,c,a.depth-20,"challengeEndScreenBtn_cancel",a.a.cm,function(){var b,c;b=new Th(N.i.r("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),
[{L:"challengeCancelConfirmBtn_yes",S:function(){b.close();a.Pm();for(c=0;c<a.buttons.length;c++)I.p(a.buttons[c]);return!0}},{L:"challengeCancelConfirmBtn_no",S:function(){b.close()}}],!0)},a.c))}
e.Tb=function(){function a(a){a.xa=0;a.Ka=0;a.ec=Math.floor(a.f.width/2);a.fc=Math.floor(a.f.height/2)}var b,c,d,g,h,k,l=this;Jh(this);"undefined"!==typeof s_overlay_challenge_end?(b=new x(s_overlay_challenge_end.width,s_overlay_challenge_end.height),y(b),s_overlay_challenge_end.q(0,0,0),z(b)):b=new x(O(560),O(560));this.c=new Kh(this.depth-10,N.sb,b);this.c.x=N.b.g(this.a.jx,this.canvas.width,this.c.width)+this.a.Jf;this.c.y=N.b.g(this.a.kx,this.canvas.height,this.c.height)+N.Wj+this.a.Xg;this.Wg=
N.b.g(this.a.Wg,this.canvas.width,this.c.width)+this.a.Jf;this.If=N.b.g(this.a.If,this.canvas.height,this.c.height)+this.a.Xg;h=Array(this.la.ld.length);c=0;k=[];for(b=0;b<this.la.ld.length;b++)b!==this.la.Gc&&(void 0!==this.la.$g[b]?(h[b]=c,c++):k.push(b));h[this.la.Gc]=c;c++;for(b=0;b<k.length;b++)h[k[b]]=c,c++;c=U.N();void 0!==this.a.cs&&C(c,this.a.cs);F(c,"center");G(c,"middle");k=[];for(b=0;b<this.la.ld.length;b++)d=b===this.la.Gc?N.i.r("challengeEndScreenName_you","<YOU>"):this.la.ld[b],13<
d.length&&(d=d.substr(0,10)+"..."),k.push(d);d=c.fontSize;for(b=0;b<k.length;b++)d=Math.min(d,Na(c,k[b],this.a.bs,this.a.as,!1));d<c.fontSize&&D(c,d);this.ae=[];for(b=0;b<k.length;b++)d=k[b],g=new x(this.a.bs+2*this.a.Ow,this.a.as+2*this.a.Pw),y(g),c.q(d,Math.floor(g.width/2)+this.a.Sw,Math.floor(g.height/2)+this.a.Tw),z(g),d=new Kh(this.depth-20,this.Ha,g),d.alpha=0,a(d),d.x=this.a.Xw+h[b]*(g.width+this.a.Ww)+Math.floor(g.width/2)-this.Wg,d.y=N.b.g(this.a.Zw,this.canvas.height,g.height)+Math.floor(g.height/
2)-this.If,d.parent=this.c,this.ae.push(d);this.lf=[];c=U.N();void 0!==this.a.Aq&&C(c,this.a.Aq);F(c,"center");G(c,"middle");for(b=0;b<this.la.ld.length;b++)d=void 0!==this.la.$g[b]?new TG_StatObject("player_"+b,N.k.Of,"",this.la.$g[b]):new TG_StatObject("player_"+b,"text","","?"),h=this.ae[b].x+this.a.zq,k=N.b.g(this.a.Ru,this.canvas.height,this.a.Bq)+Math.floor(g.height/2)-this.If,h=new Dh(h,k,this.a.Qu,this.a.Bq,this.depth-18,b===this.la.Gc?0:d.lc,c,this.a.zq,this.a.Pu,this.c,d.toString),a(h.$c),
h.$c.alpha=0,this.lf.push(h);this.n=0;this.X.ua(this.a.Qp,function(){Y(l.c,"x",l.Wg,l.a.te,M);Y(l.c,"y",l.If+N.Wj,l.a.te,M)});this.X.ua(this.a.Yw,function(){var a;for(a=0;a<l.ae.length;a++)Y(l.ae[a],"xScale",1,l.a.ho,M),Y(l.ae[a],"yScale",1,l.a.ho,M),Y(l.ae[a],"alpha",1,l.a.ho,L)});this.X.ua(this.a.Ux,function(){var a;for(a=0;a<l.ae.length;a++)Y(l.lf[a].$c,"xScale",1,l.a.Fo,M),Y(l.lf[a].$c,"yScale",1,l.a.Fo,M),Y(l.lf[a].$c,"alpha",1,l.a.Fo,L)});this.X.ua(this.a.Xx,function(){Nh(l.lf[l.la.Gc],l.la.$g[l.la.Gc],
l.a.Yx)});"function"===typeof this.$l&&"function"===typeof this.Pm&&this.X.ua(l.a.vu,function(){Sh(l)});this.X.ua(this.a.Qp,N.l.jr);this.X.start();"function"===typeof this.$l&&"function"!==typeof this.Pm&&this.$l()};e.yb=function(){var a;this.message&&I.p(this.message);for(a=0;a<this.buttons.length;a++)I.p(this.buttons[a]);for(a=0;a<this.ae.length;a++)I.p(this.ae[a]);for(a=0;a<this.lf.length;a++)I.p(this.lf[a]);Oh()};
e.Ua=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.a.ri;pa(0,0,p.canvas.width,p.canvas.height,this.a.hn,!1);p.context.globalAlpha=a};
function Uh(a,b,c,d){this.depth=-100;this.visible=!1;this.j=!0;N.b.bb(this,N.sb);var g,h;this.a=c?N.a.u.fs:N.a.u.options;if("landscape"===N.orientation)for(g in h=c?N.a.u.MA:N.a.u.ex,h)this.a[g]=h[g];this.cc=N.a.u.Ob;h=c?N.a.M.fs:N.a.M.options;for(g in h)this.a[g]=h[g];if(N.C.options&&N.C.options.buttons)for(g in N.C.options.buttons)this.a.buttons[g]=N.C.options.buttons[g];this.type=a;this.hz=b;this.jc=c;this.Pl=!1!==d;K(this)}e=Uh.prototype;
e.bi=function(a,b,c,d,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,w=void 0;switch(a){case "music":h="music_toggle";n=this.mt;l=N.e.Kf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.mt;l=N.e.Kf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.nt;l=N.e.yl()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.nt;l=N.e.yl()?"on":"off";break;case "language":h="language_toggle";n=this.lt;l=N.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.cj;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.ws;this.Nm=this.gy;break;case "moreGames":void 0!==N.C.Ew?(h="default_image",w=N.C.Ew):(h="default_text",k="optionsMoreGames");n=this.hy;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=N.ah.customFunctions&&"function"===typeof N.ah.customFunctions.exit?N.ah.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.Ax;break;
case "restart":h="default_text";k="optionsRestart";n=this.Jx;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.ws;this.Nm=this.jy;break;case "about":h="default_text";k="optionsAbout";n=this.ey;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.vi;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.ug}void 0!==h&&void 0!==n&&("image"===this.cc[h].type?this.buttons.push(new Vh(h,b,c,this.depth-20,w,d,{S:n,ca:this,Vb:q},
this.c)):"toggleText"===this.cc[h].type?this.buttons.push(new eh(h,b,c,this.depth-20,l,d,{S:n,ca:this,Vb:q},this.c)):"text"===this.cc[h].type?this.buttons.push(new ih(h,b,c,this.depth-20,k,d,{S:n,ca:this,Vb:q},this.c)):"toggle"===this.cc[h].type&&this.buttons.push(new Wh(h,b,c,this.depth-20,l,{S:n,ca:this,Vb:q},this.c)),this.buttons[this.buttons.length-1].gb=g||!1)};
e.ws=function(){var a=this;Y(a.c,"y","inGame"!==this.type?-this.c.f.height:this.canvas.height,this.a.Ug,this.a.Vg,function(){I.p(a);void 0!==a.Nm&&a.Nm.call(a)});return!0};
e.Fa=function(a,b){var c,d,g,h;y(this.c.f);p.clear();this.a.backgroundImage.q(0,0,0);c=N.i.r("optionsTitle","<OPTIONS_TITLE>");d=U.N();this.a.Jb&&C(d,this.a.Jb);void 0!==this.a.rd&&void 0!==this.a.me&&(g=Na(d,c,this.a.rd,this.a.me,this.a.rd),d.fontSize>g&&D(d,g));g=N.b.fa(this.a.Ne,this.canvas.width,d.da(c),d.align)-a;h=N.b.fa(this.a.Zb,this.canvas.height,d.W(c,d.h))-b+-1*N.ra;d.q(c,g,h);z(this.c.f)};
e.Ye=function(a,b,c){var d,g,h,k,l,n,q;h=!1;var w=this.a.buttons[this.type];"inGame"===this.type&&N.a.o.qf.vw&&(w=N.a.o.qf.vw);if("function"!==typeof Xh())for(d=0;d<w.length;d++){if("string"===typeof w[d]&&"moreGames"===w[d]){w.splice(d,1);break}for(g=0;g<w[d].length;g++)if("moreGames"===w[d][g]){w[d].splice(g,1);break}}if(!1===N.C.Kf||!1===N.e.al)for(d=0;d<w.length;d++)if(w[d]instanceof Array){for(g=0;g<w[d].length;g++)if("music"===w[d][g]){N.e.bl?w[d]="sfx_big":w.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
w[d]){w.splice(d,1);break}if(!N.e.bl)for(d=0;d<w.length;d++)if(w[d]instanceof Array){for(g=0;g<w[d].length;g++)if("sfx"===w[d][g]){!1!==N.C.Kf&&N.e.al?w[d]="music_big":w.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===w[d]){w.splice(d,1);break}if(1===N.i.hv().length)for(d=0;d<w.length;d++)if("language"===w[d]){w.splice(d,1);break}h=this.cc.default_text.w.height;k=this.a.ak;a=N.b.g(this.a.$j,this.canvas.width,k)-a;n=N.b.g(this.a.cf,this.c.f.height,h*w.length+this.a.ad*(w.length-1))-b+-1*N.ra;
for(d=0;d<w.length;d++){l=a;q=k;if("string"===typeof w[d])this.bi(w[d],l,n,q,c);else for(b=w[d],q=(k-(b.length-1)*this.a.ad)/b.length,g=0;g<b.length;g++)this.bi(b[g],l,n,q,c),l+=q+this.a.ad;n+=h+this.a.ad}};e.mt=function(a){var b=!0;"off"===a?(b=!1,N.Ca.Va("off","options:music")):N.Ca.Va("on","options:music");N.e.Kf(b);return!0};e.nt=function(a){var b=!0;"off"===a?(b=!1,N.Ca.Va("off","options:sfx")):N.Ca.Va("on","options:sfx");N.e.yl(b);return!0};
e.lt=function(a){N.i.Bs(a);N.Ca.Va(a,"options:language");return!0};
e.cj=function(){function a(){l.yc+=1;l.cj();return!0}function b(){l.yc-=1;l.cj();return!0}function c(){var a;l.Fa(n,q);l.ff.gb=!0;for(a=0;a<l.buttons.length;a++)I.p(l.buttons[a]);l.buttons=[];l.Ye(n,q,!0)}var d,g,h,k,l=this,n=N.b.g(l.a.Db,l.canvas.width,l.a.backgroundImage.width),q=N.b.g(l.a.kb,l.canvas.height,l.a.backgroundImage.height)+-1*N.ra;void 0===l.yc&&(l.yc=0);l.nj=void 0!==N.o.Vq?N.o.Vq():[];N.Ca.Va((10>l.yc?"0":"")+l.yc,"options:tutorial");for(d=0;d<l.buttons.length;d++)I.p(l.buttons[d]);
l.buttons=[];this.jc?(y(l.c.f),p.clear(),l.ff.gb=!1):l.Fa(n,q);y(l.c.f);void 0!==l.a.sd&&(d=N.b.g(l.a.km,l.c.f.width,l.a.sd.width),g=N.b.g(l.a.Oe,l.c.f.height,l.a.sd.height),l.a.sd.q(0,d,g));k=l.nj[l.yc].title;void 0!==k&&""!==k&&(h=U.N(),l.a.pj&&C(h,l.a.pj),d=Na(h,k,l.a.lm,l.a.gp,l.a.lm),h.fontSize>d&&D(h,d),d=N.b.fa(l.a.xt,l.c.f.width,h.da(k,l.a.lm),h.align),g=N.b.fa(l.a.hp,l.c.f.height,h.W(k,l.a.gp),h.h),h.q(k,d,g));l.yc<l.nj.length&&(h=l.nj[l.yc].f,d=N.b.g(l.a.ut,l.c.f.width,h.width),g=N.b.g(l.a.ep,
l.c.f.height,h.height),h.q(0,d,g),k=l.nj[l.yc].text,h=U.N(),l.a.oj&&C(h,l.a.oj),d=Na(h,k,l.a.wh,l.a.vt,l.a.wh),h.fontSize>d&&D(h,d),d=N.b.fa(l.a.wt,l.c.f.width,h.da(k,l.a.wh),h.align),g=N.b.fa(l.a.fp,l.c.f.height,h.W(k,l.a.wh),h.h),h.q(k,d,g,l.a.wh));z(l.c.f);h=Tc;d=N.b.g(l.a.tt,l.canvas.width,h.width)-l.c.x;g=N.b.g(l.a.dp,l.canvas.height,h.height)-l.c.y-N.ra;0<=l.yc-1?l.buttons.push(new Og(d,g,l.depth-20,new Tb(h),[h],{S:b,ca:l},l.c)):(h=Rc,l.buttons.push(new Og(d,g,l.depth-20,new Tb(h),[h],{S:c,
ca:l},l.c)));h=Sc;d=N.b.g(this.a.st,l.canvas.width,h.width)-l.c.x;g=N.b.g(this.a.cp,l.canvas.height,h.height)-l.c.y-N.ra;l.yc+1<l.nj.length?l.buttons.push(new Og(d,g,l.depth-20,new Tb(h),[h],{S:a,ca:l},l.c)):(h=Rc,l.buttons.push(new Og(d,g,l.depth-20,new Tb(h),[h],{S:c,ca:l},l.c)));return!0};
e.ey=function(){function a(a,b,c,g,h,k){var l;l=U.N();b&&C(l,b);b=Na(l,a,h,k,h);l.fontSize>b&&D(l,b);c=N.b.fa(c,d.c.f.width,l.da(a,h),l.align);g=N.b.fa(g,d.c.f.height,l.W(a,k),l.h);l.q(a,c,g,h);return g+k}function b(a,b,c){b=N.b.g(b,d.c.f.width,a.width);c=N.b.g(c,d.c.f.height,a.height);a.q(0,b,c);return c+a.height}var c,d=this,g=N.b.g(d.a.Db,d.canvas.width,d.a.backgroundImage.width),h=N.b.g(d.a.kb,d.canvas.height,d.a.backgroundImage.height)+-1*N.ra;N.Ca.Va("about","options");for(c=0;c<d.buttons.length;c++)I.p(d.buttons[c]);
d.buttons=[];this.jc?(y(d.c.f),p.clear(),d.ff.gb=!1):d.Fa(g,h);y(d.c.f);void 0!==d.a.sd&&b(d.a.sd,d.a.km,d.a.Oe);var k=null;"function"===typeof N.l.uq?k=N.l.uq(d.a,a,b,d.c.f):(c=N.i.r("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.Gj,d.a.Ij,d.a.Xh,d.a.Hj,d.a.Kp),b(Vc,d.a.Yh,d.a.Jj),c=N.i.r("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.Zh,d.a.ng,d.a.ai,d.a.Xe,d.a.$h));a(N.i.r("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+Ug()+("big"===N.size?"b":"s"),d.a.Cm,d.a.Np,d.a.Dm,d.a.Mp,
d.a.Lp);z(d.c.f);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new Og(l.x,l.y,d.depth-10,Sb(0,0,l.width,l.height),null,{S:function(a){return function(){N.l.kd(a)}}(l.url),Vb:!0},d.c))}else void 0!==N.C.er&&(c=N.b.g(d.a.Yh,d.c.f.width,Vc.width),k=N.b.g(d.a.Jj,d.c.f.height,Vc.height),c=Math.min(c,N.b.g(d.a.ng,d.c.f.width,d.a.Xe)),k=Math.min(k,N.b.g(d.a.ai,d.c.f.height,d.a.$h)),l=Math.max(d.a.Xe,Vc.width),d.buttons.push(new Og(c,k,d.depth-10,Sb(0,0,l,N.b.g(d.a.ai,d.c.f.height,d.a.$h)+d.a.$h-
k),null,{S:function(){N.l.kd(N.C.er)},Vb:!0},d.c)));d.buttons.push(new ih("default_text",N.b.g(d.a.Bm,d.c.f.width,d.a.Wh),d.a.Vh,d.depth-20,"optionsAbout_backBtn",d.a.Wh,{S:function(){var a;d.Fa(g,h);d.ff.gb=!0;for(a=0;a<d.buttons.length;a++)I.p(d.buttons[a]);d.buttons=[];d.Ye(g,h,!0);d.Es=!1},ca:d},d.c));return this.Es=!0};
function Yh(a){var b,c,d,g,h,k=N.b.g(a.a.Db,a.canvas.width,a.a.backgroundImage.width),l=N.b.g(a.a.kb,a.canvas.height,a.a.backgroundImage.height)+-1*N.ra;N.Ca.Va("versions","options");for(b=0;b<a.buttons.length;b++)I.p(a.buttons[b]);a.buttons=[];a.Fa(k,l);y(a.c.f);void 0!==a.a.sd&&a.a.sd.q(0,N.b.g(a.a.km,a.c.width,a.a.sd.width),N.b.g(a.a.Oe,a.c.height,a.a.sd.height));h=U.N();C(h,a.a.Cm);F(h,"left");c=a.a.Ht;d=a.a.It;for(b in N.version)g=b+": "+N.version[b],h.q(g,c,d),d+=h.W(g)+a.a.Gt;c=N.b.g(a.a.Bm,
a.c.f.width,a.a.Wh);d=a.a.Vh;a.buttons.push(new ih("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Wh,{S:function(){var b;a.Fa(k,l);for(b=0;b<a.buttons.length;b++)I.p(a.buttons[b]);a.buttons=[];a.Ye(k,l,!0)},ca:a},a.c))}e.gy=function(){return!0};e.hy=function(){N.Ca.Va("moreGames","options");var a=Xh();"function"===typeof a&&a();return!0};
e.Ax=function(){var a=this;Zh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){N.Ca.Va("confirm_yes","options:quit");I.p(a);Vg(N.Ca,N.e.dg,$h(N.e),"progression:levelQuit:"+ai());bi();ci(N.e);return!0})};
e.Jx=function(){var a=this;Zh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){N.Ca.Va("confirm_yes","options:restart");I.p(a);var b=N.e;b.state="LEVEL_END";Vg(N.Ca,N.e.dg,$h(N.e),"progression:levelRestart:"+ai());b=N.k.sj?b.fb+1:ph(b)+1;N.e.ia=!0;N.e.vr="retry";di(N.e,!0);b={failed:!0,level:b,restart:!0};N.l.Lg(b);N.ud.Lg(b);return!0})};
e.vi=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";b.nd(N.i.r(d,"<"+d.toUpperCase()+">"));a&&(b.ff.gb=!1,b.Pl||Jh())};Zh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){N.e.vi(a);return!0})};
e.ug=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";b.nd(N.i.r(d,"<"+d.toUpperCase()+">"));a&&(b.ff.gb=!1,b.Pl||Jh())};Zh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){N.e.ug(a);return!0})};
function Zh(a,b,c,d,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)I.p(a.buttons[h]);a.buttons=[];b=N.i.r(b,"<"+b.toUpperCase()+">");h=U.N();a.a.mq?C(h,a.a.mq):a.a.Yi&&C(h,a.a.Yi);k=Na(h,b,a.a.gk,a.a.Vm,!0);k<h.fontSize&&D(h,k);n=h.da(b,a.a.gk)+10;l=h.W(b,a.a.gk)+10;k=N.b.fa(a.a.nq,a.c.f.width,n,h.align);l=N.b.fa(a.a.Wm,a.c.f.height,l,h.h);y(a.c.f);h.q(b,k,l,n);z(a.c.f);k=N.b.g(a.a.kq,a.canvas.width,a.a.li)-a.c.x;l=N.b.g(a.a.Tm,a.canvas.height,a.cc.default_text.w.height)-a.c.y-N.ra;a.buttons.push(new ih("default_text",
k,l,a.depth-20,d,a.a.li,{S:function(){var b,c,d;c=N.b.g(a.a.Db,a.canvas.width,a.a.backgroundImage.width);d=N.b.g(a.a.kb,a.canvas.height,a.a.backgroundImage.height)+-1*N.ra;a.Fa(c,d);for(b=0;b<a.buttons.length;b++)I.p(a.buttons[b]);a.buttons=[];a.Ye(c,d,!0);return!0},ca:a},a.c));k=N.b.g(a.a.lq,a.canvas.width,a.a.li)-a.c.x;l=N.b.g(a.a.Um,a.canvas.height,a.cc.default_text.w.height)-a.c.y-N.ra;a.buttons.push(new ih("default_text",k,l,a.depth-20,c,a.a.li,{S:function(){return"function"===typeof g?g():!0},
ca:a},a.c))}
e.nd=function(a){var b,c,d,g;for(b=0;b<this.buttons.length;b++)I.p(this.buttons[b]);this.buttons=[];c=N.b.g(this.a.Db,this.canvas.width,this.a.backgroundImage.width);d=N.b.g(this.a.kb,this.canvas.height,this.a.backgroundImage.height)+-1*N.ra;this.Fa(c,d);b=U.N();this.a.Qi&&C(b,this.a.Qi);c=Na(b,a,this.a.eo,this.a.yw,!0);c<b.fontSize&&D(b,c);g=b.da(a,this.a.eo)+10;d=b.W(a,this.a.eo)+10;c=N.b.fa(this.a.zw,this.c.f.width,g,b.align);d=N.b.fa(this.a.Aw,this.c.f.height,d,b.h);y(this.c.f);b.q(a,c,d,g);z(this.c.f)};
e.jy=function(){N.Ca.Va("startScreen","options");ci(N.e);return!0};e.close=function(){I.p(this);return this.canvas.Y=!0};
e.Tb=function(){var a,b;this.Pl&&Jh(this);N.e.Nd=this;this.Hq=this.Gq=!1;a=this.a.backgroundImage;this.c=new Kh(this.depth-10,this.Ha,new x(a.width,a.height));this.c.x=N.b.g(this.a.Db,this.canvas.width,a.width);a=N.b.g(this.a.kb,this.canvas.height,a.height)+-1*N.ra;this.c.y=a;this.Fa(this.c.x,this.c.y);this.buttons=[];this.hz?this.cj():this.Ye(this.c.x,this.c.y);this.ff=new Og(this.a.ii,this.a.wg,this.depth-20,new Sb(0,0,this.a.vg,this.a.gf),void 0,{S:this.close,ca:this},this.c);this.yh="versions";
this.Ze=new Wb;N.b.bb(this.Ze,N.sb);Kb(this.Ze,this.depth-1);Xb(this.Ze,"keyAreaLeft",this.c.x,this.c.y+this.a.Oe,this.a.og,this.a.Kj,76);Xb(this.Ze,"keyAreaRight",this.c.x+this.c.width-this.a.og,this.c.y+this.a.Oe,this.a.og,this.a.Kj,82);Xb(this.Ze,"keyAreaCentre",N.cw/2-this.a.og/2,this.c.y+this.a.Oe,this.a.og,this.a.Kj,67);b=this;this.c.y="inGame"!==this.type?this.canvas.height:-this.c.f.height;Y(this.c,"y",a,this.a.Gf,this.a.Hf,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].gb=!0})};
e.yb=function(){var a;this.Pl&&Oh();this.Gq&&la(N.yf,N.i.An());this.Hq&&la(N.Ke);for(a=0;a<this.buttons.length;a++)I.p(this.buttons[a]);this.Ze.clear();I.p(this.Ze);I.p(this.ff);I.p(this.c);N.e.Nd=null};e.Ub=function(){return!0};e.zb=function(){return!0};e.Kg=function(a){this.Es&&(67===a?this.yh="":76===a?this.yh+="l":82===a&&(this.yh+="r"),"lrl"===this.yh&&Yh(this))};e.hd=function(a){a===N.yf?(this.Fa(this.c.x,this.c.y),this.Gq=!0):a===N.Ke?this.Hq=!0:a===N.hu&&this.close()};
function ei(){this.depth=-200;this.j=this.visible=!0;N.b.bb(this,N.rf);var a;this.a=N.a.u.zk;if("landscape"===N.orientation&&N.a.u.on)for(a in N.a.u.on)this.a[a]=N.a.u.on[a];this.cc=N.a.u.Ob;for(a in N.a.M.zk)this.a[a]=N.a.M.zk[a];K(this)}
ei.prototype.Fa=function(){var a,b,c,d;c=this.a.backgroundImage;d=(N.$v-Math.abs(N.ra))/c.xg;this.c.f=new x(d*c.ki,d*c.xg);y(this.c.f);this.c.y=Math.abs(N.ra);a=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,ta(c,0,0),a.restore());c=U.N();C(c,this.a.font);d=N.i.r("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Na(c,d,this.a.em-(c.stroke?c.Tc:0),this.a.Sy-(c.stroke?c.Tc:0),!0);a<c.fontSize&&D(c,a);a=N.b.fa(this.a.et,this.canvas.width,
c.da(d),c.align);b=N.b.fa(this.a.ft,this.canvas.height,c.W(d),c.h);c.q(d,a,b,this.a.em);z(this.c.f);this.c.canvas.Y=!0};ei.prototype.Tb=function(){var a=this,b=this.a.backgroundImage,b=new x(b.width,b.height);this.c=new Kh(this.depth,N.sb,b);this.c.x=0;this.c.y=Math.abs(N.ra);this.Fa();this.button=new ih(this.a.cq,N.b.g(this.a.tu,this.canvas.width,this.a.dq),N.b.g(this.a.eq,this.canvas.height,this.cc[this.a.cq].w.height),this.depth-10,"gameEndScreenBtnText",this.a.dq,function(){I.p(a);ci(N.e)},this.c)};
ei.prototype.yb=function(){I.p(this.c);I.p(this.button)};ei.prototype.hd=function(a){a!==N.yf&&a!==N.Ke||this.Fa()};
function Og(a,b,c,d,g,h,k){function l(a,b,c){var d,g;g=N.b.zn(q.canvas);a=Math.round(q.x+q.parent.x-q.ec*q.xa);d=Math.round(q.y+q.parent.y-q.fc*q.Ka);if(q.images&&0<q.vf||0<q.hj)q.vf=0,q.hj=0,q.canvas.Y=!0;if(q.Wi&&q.gb&&Ub(q.Pc,a,d,b-g.x,c-g.y))return q.Wi=!1,void 0!==q.ca?q.rl.call(q.ca,q):q.rl(q)}function n(a,b,c){var d,g,h;h=N.b.zn(q.canvas);d=Math.round(q.x+q.parent.x-q.ec*q.xa);g=Math.round(q.y+q.parent.y-q.fc*q.Ka);if(q.gb&&Ub(q.Pc,d,g,b-h.x,c-h.y))return q.Wi=!0,q.images&&(1<q.images.length?
(q.vf=1,q.canvas.Y=!0):1<q.images[0].I&&(q.hj=1,q.canvas.Y=!0)),void 0!==typeof ig&&H.play(ig),q.of=a,!0}this.depth=c;this.j=this.visible=!0;this.group="TG_Token";N.b.bb(this,N.sb);this.fc=this.ec=0;this.x=a;this.y=b;this.width=g?g[0].width:d.$a-d.Da;this.height=g?g[0].height:d.xb-d.Ta;this.alpha=this.Ka=this.xa=1;this.Sa=0;this.Pc=d;this.images=g;this.hj=this.vf=0;this.Wi=!1;this.gb=!0;this.parent=void 0!==k?k:{x:0,y:0};this.Jl=this.Il=0;this.Rb=!0;this.rl=function(){};this.Vb=!1;"object"===typeof h?
(this.rl=h.S,this.ca=h.ca,this.Vb=h.Vb):"function"===typeof h&&(this.rl=h);var q=this;this.Vb?(this.Ig=n,this.Jg=l):(this.zb=n,this.Ub=l);K(this)}function hh(a,b,c,d,g,h){void 0===a.ve&&(a.ve=[]);a.ve.push({type:b,start:d,Pb:g,Oa:c,duration:h,n:0})}
function mh(a){var b,c;if(void 0!==a.ve){for(b=0;b<a.ve.length;b++)if(c=a.ve[b],c.j){switch(c.type){case "xScale":a.xa=c.start+c.Pb;break;case "yScale":a.Ka=c.start+c.Pb;break;case "alpha":a.alpha=c.start+c.Pb;break;case "angle":a.Sa=c.start+c.Pb;break;case "x":a.x=c.start+c.Pb;break;case "y":a.y=c.start+c.Pb}c.j=!1}a.canvas.Y=!0}}function th(a,b){a.images=b;a.canvas.Y=!0}e=Og.prototype;e.Jo=function(a){this.visible=this.j=a};e.yb=function(){this.images&&(this.canvas.Y=!0)};
e.va=function(a){var b,c;if(void 0!==this.ve){for(b=0;b<this.ve.length;b++)switch(c=this.ve[b],c.n+=a,c.type){case "xScale":var d=this.xa,g=this.Il;this.xa=c.Oa(c.n,c.start,c.Pb,c.duration);this.Il=-(this.images[0].width*this.xa-this.images[0].width*c.start)/2;if(isNaN(this.xa)||isNaN(this.Il))this.xa=d,this.Il=g;break;case "yScale":d=this.Ka;g=this.Jl;this.Ka=c.Oa(c.n,c.start,c.Pb,c.duration);this.Jl=-(this.images[0].height*this.Ka-this.images[0].height*c.start)/2;if(isNaN(this.Ka)||isNaN(this.Jl))this.Ka=
d,this.Jl=g;break;case "alpha":this.alpha=c.Oa(c.n,c.start,c.Pb,c.duration);break;case "angle":this.Sa=c.Oa(c.n,c.start,c.Pb,c.duration);break;case "x":d=this.x;this.x=c.Oa(c.n,c.start,c.Pb,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.Oa(c.n,c.start,c.Pb,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.Y=!0}};
e.oc=function(){var a,b,c;c=N.b.zn(this.canvas);a=Math.round(this.x+this.parent.x-this.ec*this.xa);b=Math.round(this.y+this.parent.y-this.fc*this.Ka);this.Wi&&!Ub(this.Pc,a,b,I.ka[this.of].x-c.x,I.ka[this.of].y-c.y)&&(this.images&&(this.hj=this.vf=0,this.canvas.Y=!0),this.Wi=!1)};
e.Ua=function(){var a,b;a=Math.round(this.x+this.parent.x-this.ec*this.xa);b=Math.round(this.y+this.parent.y-this.fc*this.Ka);this.images&&(this.images[this.vf]instanceof x?this.images[this.vf].ya(a,b,this.xa,this.Ka,this.Sa,this.alpha):this.images[this.vf].ya(this.hj,a,b,this.xa,this.Ka,this.Sa,this.alpha));this.Rb=!1};
function ih(a,b,c,d,g,h,k,l){this.$=N.a.u.Ob[a];a=void 0!==N.a.M.buttons?N.a.u.gi[N.a.M.buttons[a]||N.a.M.buttons.default_color]:N.a.u.gi[N.a.u.buttons.default_color];this.font=U.N();a.font&&C(this.font,a.font);this.$.fontSize&&D(this.font,this.$.fontSize);this.L=g;this.text=N.i.r(this.L,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.$.w.height;this.f={source:this.$.w,wa:this.$.wa,lb:this.$.lb};g=this.Qd(this.f);h=new Sb(0,0,g[0].width,g[0].height);Og.call(this,b,c,d,h,g,k,l)}
N.b.Ji(ih);e=ih.prototype;e.Gl=function(a){this.text=N.i.r(this.L,"<"+this.L.toUpperCase()+">");a&&C(this.font,a);th(this,this.Qd(this.f))};e.rj=function(a,b){this.L=a;this.Gl(b)};e.qj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof r?this.f.source=a:void 0!==a.wa&&void 0!==a.lb&&void 0!==a.source&&(this.f=a);th(this,this.Qd(this.f))};
e.Qd=function(a){var b,c,d,g,h,k,l=a.wa+a.lb;d=this.height-(this.$.Xc||0);var n=a.source;c=this.font.da(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Na(this.font,this.text,b,d,!0);c<this.$.fontSize?D(this.font,c):D(this.font,this.$.fontSize);c=a.wa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.$.Wc&&(d+=this.$.Wc);h=[];for(g=0;g<n.I;g++)k=new x(b+l,this.height),y(k),n.na(g,0,0,a.wa,this.height,0,0,1),n.lk(g,a.wa,0,n.width-l,this.height,a.wa,0,b,this.height,1),n.na(g,a.wa+n.width-l,0,a.lb,this.height,a.wa+b,0,1),this.font.q(this.text,c,d,b),z(k),h.push(k);return h};e.hd=function(a){a===N.yf&&this.Gl()};
function Vh(a,b,c,d,g,h,k,l){this.$=N.a.u.Ob[a];void 0!==h&&(this.width=h);this.height=this.$.w.height;this.vd={source:this.$.w,wa:this.$.wa,lb:this.$.lb};this.f=g;a=this.Qd();g=new Sb(0,0,a[0].width,a[0].height);Og.call(this,b,c,d,g,a,k,l)}N.b.Ji(Vh);
Vh.prototype.Qd=function(){var a,b,c,d,g,h,k,l=this.vd.wa+this.vd.lb;b=this.height-(this.$.Xc||0);var n=this.vd.source;void 0===this.width?a=this.f.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.f.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.f.width))));k=Math.min(a/this.f.width,b/this.f.height);k=Math.min(k,1);g=Math.round(this.vd.wa+
(a-this.f.width*k)/2);h=Math.round((b-this.f.height*k)/2);c=[];for(b=0;b<n.I;b++){d=new x(a+l,this.height);y(d);n.na(b,0,0,this.vd.wa,this.height,0,0,1);n.lk(b,this.vd.wa,0,n.width-l,this.height,this.vd.wa,0,a,this.height,1);n.na(b,this.vd.wa+n.width-l,0,this.vd.lb,this.height,this.vd.wa+a,0,1);try{p.context.drawImage(this.f,g,h,this.f.width*k,this.f.height*k)}catch(q){}z(d);c.push(d)}return c};N.b.Ji(function(a,b,c,d,g,h,k){Og.call(this,a,b,c,g,d,h,k)});
function eh(a,b,c,d,g,h,k,l){var n;this.$=N.a.u.Ob[a];a=void 0!==N.a.M.buttons?N.a.u.gi[N.a.M.buttons[a]||N.a.M.buttons.default_color]:N.a.u.gi[N.a.u.buttons.default_color];this.font=U.N();a.font&&C(this.font,a.font);this.$.fontSize&&D(this.font,this.$.fontSize);void 0!==h&&(this.width=h);this.height=this.$.w.height;this.V=this.$.V;if(this.V.length){for(h=0;h<this.V.length;h++)if(this.V[h].id===g){this.Ea=h;break}void 0===this.Ea&&(this.Ea=0);this.text=N.i.r(this.V[this.Ea].L,"<"+this.V[this.Ea].id.toUpperCase()+
">");this.fg=this.V[this.Ea].w;h=this.Qd();a=new Sb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Pf();return k(n.V[n.Ea].id)}:"object"===typeof k?(g={},g.Vb=k.Vb,g.ca=this,g.S=function(){n.Pf();return k.S.call(k.ca,n.V[n.Ea].id)}):g=function(){n.Pf()};Og.call(this,b,c,d,a,h,g,l)}}N.b.Ji(eh);e=eh.prototype;
e.Pf=function(a){var b;if(void 0===a)this.Ea=(this.Ea+1)%this.V.length;else for(b=0;b<this.V.length;b++)if(this.V[b].id===a){this.Ea=b;break}this.qj(this.V[this.Ea].w,N.i.r(this.V[this.Ea].L,"<"+this.V[this.Ea].id.toUpperCase()+">"))};e.Gl=function(a){a&&C(this.font,a);this.text=N.i.r(this.V[this.Ea].L,"<"+this.V[this.Ea].id.toUpperCase()+">");th(this,this.Qd())};e.qj=function(a,b,c){this.text=b;this.fg=a;c&&C(this.font,c);th(this,this.Qd())};
e.Qd=function(){var a,b,c,d,g,h,k=this.$.wa,l=this.$.lb,n=k+l;g=Math.abs(k-l);d=this.height-(this.$.Xc||0);var q=this.$.w,w=this.font.N();b=w.da(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Na(w,this.text,a,d,!0);d<w.fontSize&&D(w,d);b=w.da(this.text,
a);d=k;c=w.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.$.Zf+Math.round(b/2)):"left"===c?d+=this.$.Zf:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.$.Wc&&(g+=this.$.Wc);c=[];for(b=0;b<q.I;b++)h=new x(a+n,this.height),y(h),q.na(b,0,0,k,this.height,0,0,1),q.lk(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.na(b,k+q.width-n,0,l,this.height,k+a,0,1),this.fg.q(0,this.$.rh,this.$.sh),w.q(this.text,d,g,a),z(h),c.push(h);return c};e.hd=function(a){a===N.yf&&this.Gl()};
function Wh(a,b,c,d,g,h,k){var l;this.V=N.a.u.Ob[a].V;if(this.V.length){for(a=0;a<this.V.length;a++)if(this.V[a].id===g){this.Ea=a;break}void 0===this.Ea&&(this.Ea=0);this.fg=this.V[this.Ea].w;a=new Tb(this.fg);l=this;g="function"===typeof h?function(){l.Pf();return h(l.V[l.Ea].id)}:"object"===typeof h?{ca:this,S:function(){l.Pf();return h.S.call(h.ca,l.V[l.Ea].id)}}:function(){l.Pf()};Og.call(this,b,c,d,a,[this.fg],g,k)}}N.b.Ji(Wh);
Wh.prototype.Pf=function(a){var b;if(void 0===a)this.Ea=(this.Ea+1)%this.V.length;else for(b=0;b<this.V.length;b++)if(this.V[b].id===a){this.Ea=b;break}this.qj(this.V[this.Ea].w)};Wh.prototype.qj=function(a){this.fg=a;th(this,[].concat(this.fg))};
function fi(a,b,c){this.depth=10;this.visible=!1;this.j=!0;N.b.bb(this,N.sb);this.a=N.a.u.Sm;for(var d in N.a.M.Sm)this.a[d]=N.a.M.Sm[d];this.L=a;this.S=b;this.ca=c;this.tl="entering";this.qt=!1;this.la=dh(N.e);this.la.Gc===this.la.ye&&(this.ek=!0);K(this,!1);Lb(this,"LevelStartDialog")}function gi(a){"leaving"!==a.tl&&(a.tl="leaving",Y(a.c,"y",-a.c.height,a.a.Oj,a.a.Pj,function(){I.p(a);a.ca?a.S.call(a.ca):a.S&&a.S()}))}e=fi.prototype;
e.Tb=function(){var a,b,c,d,g,h,k;a=this;b=this.a.Qc;c=void 0!==b?b.width:O(600);d=void 0!==b?b.height:O(700);g=function(a,b,g,h,k,E,s){var t;t=U.N();void 0!==b&&C(t,b);b=Na(t,a,g,h,k);t.fontSize>b&&D(t,b);E=N.b.fa(E,c,t.da(a,k),t.align);s=N.b.fa(s,d,t.W(a,k),t.align);t.q(a,E,s,k?g:void 0)};this.c=new Kh(this.depth+10,this.Ha,new x(c,d));y(this.c.f);void 0!==b&&b.q(0,0,0);b=this.ek?this.la.Us?N.i.r("challengeStartScreenTitle_challenger_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):N.i.r("challengeStartScreenTitle_challenger_friend",
"<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):this.la.Us?N.i.r("challengeStartScreenTitle_challengee_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>"):N.i.r("challengeStartScreenTitle_challengee_friend","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>");g(b,this.a.Jb,this.a.rd,this.a.me,!0,this.a.Ne,this.a.Zb);if(this.ek)for(b="",h=1;h<this.la.ld.length;h++)k=this.la.ld[h],b=13<k.length?b+(k.substr(0,10)+"..."):b+k,h+1<this.la.ld.length&&(b+=", ");else k=this.la.ld[this.la.ye],b=13<k.length?k.substr(0,10)+"...":
k;g(b,this.a.Nw,this.a.Rw,this.a.Qw,!1,this.a.Uw,this.a.Vw);this.ek?b=N.i.r(this.L+"_challenger","<"+this.L.toUpperCase()+"_CHALLENGER>"):(b=N.i.r(this.L,"<"+this.L.toUpperCase()+">"),k=this.la.ld[this.la.ye],b=b.replace("<NAME>",13<k.length?k.substr(0,10)+"...":k));g(b,this.a.Mx,this.a.Ox,this.a.Nx,!1,this.a.Px,this.a.Qx);this.ek||(b=hi(this.la.$g[0]),g(b,this.a.Lx,this.a.Tx,this.a.Sx,!1,this.a.Vx,this.a.Wx));b=N.i.r("challengeStartScreenToWin","<CHALLENGESTARTSCREENTOWIN>");g(b,this.a.lz,this.a.nz,
this.a.mz,!0,this.a.oz,this.a.pz);b=this.la.Jt+"";g(b,this.a.kz,this.a.rz,this.a.qz,!1,this.a.sz,this.a.tz);z(this.c.f);this.c.x=N.b.g(this.a.ks,this.canvas.width,c)+this.a.Jf;this.c.y=-this.c.height;Y(this.c,"y",N.b.g(this.a.Si,this.canvas.height,this.c.f.height)+Math.abs(N.ra),this.a.te,this.a.Nj,function(){a.tl="paused"});H.play(gg);this.n=0};e.yb=function(){I.p(this.c)};e.va=function(a){"paused"!==this.state&&(this.n+=a,this.n>=this.a.ns&&gi(this))};e.zb=function(){return this.qt=!0};
e.Ub=function(){this.qt&&"paused"===this.tl&&gi(this);return!0};function Kh(a,b,c){this.depth=a;this.j=this.visible=!0;N.b.bb(this,b);this.f=c;this.Eb=0;this.width=c.width;this.height=c.height;this.fc=this.ec=this.y=this.x=0;this.Ka=this.xa=1;this.Sa=0;this.alpha=1;this.ob=[];this.Sp=0;this.parent={x:0,y:0};this.Rb=!0;K(this,!1)}
function Y(a,b,c,d,g,h,k,l,n){var q,w=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.xa;break;case "yScale":q=a.Ka;break;case "scale":b="xScale";q=a.xa;Y(a,"yScale",c,d,g,void 0,k,l,n);break;case "angle":q=a.Sa;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.ob.push({id:a.Sp,n:0,j:!0,ik:w,type:b,start:q,end:c,pb:h,duration:d,Oa:g,sa:k,loop:l,Zv:n});a.Sp++}
function yh(a){var b;for(b=a.ob.length-1;0<=b;b--){switch(a.ob[b].type){case "x":a.x=a.ob[b].end;break;case "y":a.y=a.ob[b].end;break;case "xScale":a.xa=a.ob[b].end;break;case "yScale":a.Ka=a.ob[b].end;break;case "angle":a.Sa=a.ob[b].end;break;case "alpha":a.alpha=a.ob[b].end;break;case "subImage":a.Eb=a.ob[b].end}"function"===typeof a.ob[b].pb&&a.ob[b].pb.call(a)}}
Kh.prototype.va=function(a){var b,c,d;for(b=0;b<this.ob.length;b++)if(c=this.ob[b],c.j&&(c.n+=a,c.ik&&c.n>=c.sa&&(c.n%=c.sa,c.ik=!1),!c.ik)){c.n>=c.duration?(d=c.end,c.loop?(c.ik=!0,c.sa=c.Zv,c.n%=c.duration):("function"===typeof c.pb&&c.pb.call(this),this.ob[b]=void 0)):"subImage"===c.type?(d=this.f instanceof Array?this.f.length:this.f.I,d=Math.floor(c.n*d/c.duration)):d=c.Oa(c.n,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.xa=
d;break;case "yScale":this.Ka=d;break;case "angle":this.Sa=d;break;case "alpha":this.alpha=d;break;case "subImage":this.Eb=d}this.canvas.Y=!0}for(b=this.ob.length-1;0<=b;b--)void 0===this.ob[b]&&this.ob.splice(b,1)};
Kh.prototype.Ua=function(){var a,b,c;b=Math.round(this.x-this.xa*this.ec)+this.parent.x;c=Math.round(this.y-this.Ka*this.fc)+this.parent.y;a=this.f;a instanceof Array&&(a=this.f[this.Eb%this.f.length]);a instanceof x?a.ya(b,c,this.xa,this.Ka,this.Sa,this.alpha):a.ya(this.Eb,b,c,this.xa,this.Ka,this.Sa,this.alpha);this.Rb=!1};
function Dh(a,b,c,d,g,h,k,l,n,q,w){this.depth=g;this.visible=!0;this.j=!1;N.b.bb(this,N.sb);this.x=a;this.y=b;this.Zn=l;this.$n="object"===typeof n?n.top:n;this.dw="object"===typeof n?n.bottom:n;this.da=c;this.W=d;this.width=this.da+2*this.Zn;this.height=this.W+this.$n+this.dw;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof w?w:function(a){return a+""};this.alpha=1;this.Nf=this.Mf=this.fc=this.ec=0;c=new x(this.width,this.height);this.$c=new Kh(this.depth,this.Ha,
c);this.$c.x=a-this.Zn;this.$c.y=b-this.$n;this.$c.parent=q;this.Pa=this.$c.f;this.Je();K(this)}Dh.prototype.yb=function(){I.p(this.$c)};function Nh(a,b,c){a.j=!0;a.$e=a.value;a.value=a.$e;a.end=b;a.duration=c;a.Oa=L;a.n=0}
Dh.prototype.Je=function(){var a,b;a=this.font.align;b=this.font.h;var c=this.Zn,d=this.$n;this.Wp||(this.Pa.clear(),this.canvas.Y=!0);y(this.Pa);this.Wp&&this.Wp.na(0,this.Kz,this.Lz,this.Jz,this.Iz,0,0,1);"center"===a?c+=Math.round(this.da/2):"right"===a&&(c+=this.da);"middle"===b?d+=Math.round(this.W/2):"bottom"===b&&(d+=this.W);b=this.toString(this.value);a=Na(this.font,b,this.da,this.W,!0);a<this.font.fontSize&&D(this.font,a);this.font.q(b,c,d,this.da);z(this.Pa);this.$c.Rb=!0};
Dh.prototype.va=function(a){var b;b=Math.round(this.Oa(this.n,this.$e,this.end-this.$e,this.duration));this.n>=this.duration?(this.value=this.end,this.j=!1,this.Je()):b!==this.value&&(this.value=b,this.Je());this.n+=a};function Th(a,b,c){this.depth=-100;this.visible=!1;this.j=!0;this.ux=a;N.b.bb(this,N.sb);this.a=N.a.u.bd;this.cc=N.a.u.Ob;this.fq=b;for(var d in N.a.M.bd)this.a[d]=N.a.M.bd[d];this.po=!1!==c;K(this)}e=Th.prototype;e.lt=function(){};
e.bi=function(a,b,c,d,g){b=new ih("default_text",b,c,this.depth-20,a.L||"NO_TEXT_KEY_GIVEN",d,{S:function(){a.S&&(a.ca?a.S.call(a.ca,a):a.S(a))},ca:this},this.c);this.buttons.push(b);a.text&&b.qj(b.f,a.text);this.buttons[this.buttons.length-1].gb=g||!1};
e.Fa=function(a,b,c){y(this.c.f);p.clear();this.a.backgroundImage.q(0,0,0);a=c?c:this.ux;b=U.N();this.a.uo&&C(b,this.a.uo);c=Na(b,a,this.a.El,this.a.Dl,!0);c<b.fontSize&&D(b,c);c=b.da(a,this.a.El)+10;var d=b.W(a,this.a.Dl)+10;b.q(a,N.b.fa(this.a.zx,this.c.f.width,c,b.align),N.b.fa(this.a.rs,this.c.f.height-ii(this),d,b.h),c);z(this.c.f)};function ii(a){var b=a.fq;return N.b.g(a.a.cf,a.c.f.height,a.cc.default_text.w.height*b.length+a.a.ad*(b.length-1))}
e.Ye=function(a,b){var c,d,g,h,k,l,n,q,w,A=[],A=this.fq;g=this.cc.default_text.w.height;h=this.a.ak;k=N.b.g(this.a.$j,this.canvas.width,h)-a;q=ii(this);for(c=A.length-1;0<=c;c--){n=k;w=h;if("object"===typeof A[c]&&A[c].hasOwnProperty("length")&&A[c].length)for(l=A[c],w=(h-(l.length-1)*this.a.ad)/l.length,d=0;d<l.length;d++)this.bi(l[d],n,q,w,b),n+=w+this.a.ad;else this.bi(A[c],n,q,w,b);q-=g+this.a.ad}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Jo(!0);this.c.visible=!0};e.close=function(){I.p(this);return this.canvas.Y=!0};function ji(a){var b=N.e.se;b.Fa(b.c.x,b.c.y,a);for(a=0;a<b.buttons.length;a++)I.p(b.buttons[a]);b.canvas.Y=!0}
e.Tb=function(){var a,b;this.po&&Jh(this);a=this.a.backgroundImage;this.c=new Kh(this.depth-10,this.Ha,new x(a.width,a.height));this.c.x=N.b.g(this.a.Db,this.canvas.width,a.width);a=N.b.g(this.a.kb,this.canvas.height,a.height)+-1*("landscape"===N.orientation?N.a.u.ck:N.a.u.Pd).ll;this.c.y=a;this.Fa(this.c.x,this.c.y);this.buttons=[];this.Ye(this.c.x);b=this;this.c.y=-this.c.f.height;Y(this.c,"y",a,this.a.Gf,this.a.Hf,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].gb=!0})};
e.yb=function(){var a;this.po&&Oh();for(a=0;a<this.buttons.length;a++)I.p(this.buttons[a]);I.p(this.c);N.e.Nd===this&&(N.e.Nd=null)};e.Ub=function(){return!0};e.zb=function(){return!0};
function ki(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function bh(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,l){a=k(a,k(k(c^(b|~d),g),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,l){a=k(a,k(k(b^c^d,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,l){a=k(a,k(k(b&d|c&~d,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,l){a=k(a,k(k(b&c|~b&d,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,w,A,E,s,t,u,v;a=ki(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);s=1732584193;t=4023233417;u=2562383102;v=271733878;a=l.length;for(n=0;n<a;n+=16)q=s,w=t,A=u,E=v,s=h(s,t,u,v,l[n+
0],7,3614090360),v=h(v,s,t,u,l[n+1],12,3905402710),u=h(u,v,s,t,l[n+2],17,606105819),t=h(t,u,v,s,l[n+3],22,3250441966),s=h(s,t,u,v,l[n+4],7,4118548399),v=h(v,s,t,u,l[n+5],12,1200080426),u=h(u,v,s,t,l[n+6],17,2821735955),t=h(t,u,v,s,l[n+7],22,4249261313),s=h(s,t,u,v,l[n+8],7,1770035416),v=h(v,s,t,u,l[n+9],12,2336552879),u=h(u,v,s,t,l[n+10],17,4294925233),t=h(t,u,v,s,l[n+11],22,2304563134),s=h(s,t,u,v,l[n+12],7,1804603682),v=h(v,s,t,u,l[n+13],12,4254626195),u=h(u,v,s,t,l[n+14],17,2792965006),t=h(t,u,
v,s,l[n+15],22,1236535329),s=g(s,t,u,v,l[n+1],5,4129170786),v=g(v,s,t,u,l[n+6],9,3225465664),u=g(u,v,s,t,l[n+11],14,643717713),t=g(t,u,v,s,l[n+0],20,3921069994),s=g(s,t,u,v,l[n+5],5,3593408605),v=g(v,s,t,u,l[n+10],9,38016083),u=g(u,v,s,t,l[n+15],14,3634488961),t=g(t,u,v,s,l[n+4],20,3889429448),s=g(s,t,u,v,l[n+9],5,568446438),v=g(v,s,t,u,l[n+14],9,3275163606),u=g(u,v,s,t,l[n+3],14,4107603335),t=g(t,u,v,s,l[n+8],20,1163531501),s=g(s,t,u,v,l[n+13],5,2850285829),v=g(v,s,t,u,l[n+2],9,4243563512),u=g(u,
v,s,t,l[n+7],14,1735328473),t=g(t,u,v,s,l[n+12],20,2368359562),s=d(s,t,u,v,l[n+5],4,4294588738),v=d(v,s,t,u,l[n+8],11,2272392833),u=d(u,v,s,t,l[n+11],16,1839030562),t=d(t,u,v,s,l[n+14],23,4259657740),s=d(s,t,u,v,l[n+1],4,2763975236),v=d(v,s,t,u,l[n+4],11,1272893353),u=d(u,v,s,t,l[n+7],16,4139469664),t=d(t,u,v,s,l[n+10],23,3200236656),s=d(s,t,u,v,l[n+13],4,681279174),v=d(v,s,t,u,l[n+0],11,3936430074),u=d(u,v,s,t,l[n+3],16,3572445317),t=d(t,u,v,s,l[n+6],23,76029189),s=d(s,t,u,v,l[n+9],4,3654602809),
v=d(v,s,t,u,l[n+12],11,3873151461),u=d(u,v,s,t,l[n+15],16,530742520),t=d(t,u,v,s,l[n+2],23,3299628645),s=c(s,t,u,v,l[n+0],6,4096336452),v=c(v,s,t,u,l[n+7],10,1126891415),u=c(u,v,s,t,l[n+14],15,2878612391),t=c(t,u,v,s,l[n+5],21,4237533241),s=c(s,t,u,v,l[n+12],6,1700485571),v=c(v,s,t,u,l[n+3],10,2399980690),u=c(u,v,s,t,l[n+10],15,4293915773),t=c(t,u,v,s,l[n+1],21,2240044497),s=c(s,t,u,v,l[n+8],6,1873313359),v=c(v,s,t,u,l[n+15],10,4264355552),u=c(u,v,s,t,l[n+6],15,2734768916),t=c(t,u,v,s,l[n+13],21,
1309151649),s=c(s,t,u,v,l[n+4],6,4149444226),v=c(v,s,t,u,l[n+11],10,3174756917),u=c(u,v,s,t,l[n+2],15,718787259),t=c(t,u,v,s,l[n+9],21,3951481745),s=k(s,q),t=k(t,w),u=k(u,A),v=k(v,E);return(b(s)+b(t)+b(u)+b(v)).toLowerCase()}var Lh;
function li(a,b){var c=N.C.Nk.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function mi(a){li("call=api_is_valid",function(b){a(b.is_valid)})}
function Mh(a,b){li("call=is_highscore&score="+a,function(a){0<=a.position?(Lh=a.code,b(void 0!==Lh)):b(!1)})}
TG_StatObjectFactory={Yz:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},Wz:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,ni(),ni(),!0)},Vz:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===N.k.hf?function(a){return a+d}:function(a){return a-d})},Xz:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===N.k.hf?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.lc=d;this.Uf=void 0!==g?g:this.lc;this.visible=void 0!==h?h:!0;this.ue=void 0!==k?k:this.lc!==this.Uf;this.Pe=l;this.Yl=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return N.b.lj(1E3*a)}}};
TG_StatObject.prototype.N=function(){return new TG_StatObject(this.id,this.type,this.key,this.lc,this.Uf,this.visible,this.ue,this.Pe,this.Yl)};N.version=N.version||{};N.version.tg="2.13.0";function oi(a){this.depth=-99;N.b.bb(this,N.sb);this.j=!0;this.visible=!1;this.e=a;K(this)}oi.prototype.Kk=function(){};oi.prototype.Kg=function(){};oi.prototype.zb=function(a,b,c){a:{var d=this.e,g;for(g=0;g<d.zc.length;++g)if(d.zc[g].zb&&d.zc[g].zb(a,b,c)){a=!0;break a}a=!1}return a};
oi.prototype.Ub=function(a,b,c){var d;a:if(d=this.e,d.cb&&a===d.lp)a=d.cb.a.x,b=d.cb.a.y,d.cb.no&&(a=d.cb.no.x,b=d.cb.no.y),pi?console.log("Component:\n x: tgScale("+(a+d.cb.hg.x-qi)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.cb.hg.y-ri)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.cb.hg.x)+"),\n y: tgScale("+(b+d.cb.hg.y)+"),"),d.At=!1,d=!0;else{for(var g=0;g<d.zc.length;++g)if(d.zc[g].Ub&&d.zc[g].Ub(a,b,c)){d=!0;break a}d=!1}return d};
function si(){this.Ha=this.depth=0;this.bn=this.Ib=this.j=this.visible=!1;this.zc=[];this.vk={};this.vk.ee=!1;this.Fq={};this.paused=this.Fq.ee=!1;this.Dy=new x(0,0);this.Fy=this.Ey=0;this.cb=null;this.lp=this.Ct=this.Bt=-1;this.At=!1;this.Cb=this.Bb=0;this.Tk=null}e=si.prototype;e.Tb=function(){this.Tk=new oi(this)};e.yb=function(){this.Tk&&(I.p(this.Tk),this.Tk=null)};
function ti(a,b,c){for(var d in b){var g=b[d];g.f?c[d]=new ui(a,g):g.gt?c[d]=new vi(a,N.i.r(g.gt,"<"+g.gt+">"),g):g.L?c[d]=new vi(a,N.i.r(g.L,"<"+g.L+">"),g):g.text&&(c[d]=new vi(a,g.text,g))}}function wi(a,b){a.ee&&(a.n+=b,a.n>=a.duration&&(a.ee=!1,a.pb&&a.pb()))}
e.va=function(a){wi(this.vk,a);wi(this.Fq,a);for(var b=0;b<this.zc.length;++b)this.zc[b].va(a);if(this.cb&&this.At){a=I.ka[this.lp].x;b=I.ka[this.lp].y;this.canvas===N.b.Xd(N.yi)&&this.cb.Hk(this.Bb+N.tf,this.Cb+N.Ae);var c=a-this.Bt,d=b-this.Ct;this.cb.x+=c;this.cb.y+=d;this.cb.hg.x+=c;this.cb.hg.y+=d;this.Bt=a;this.Ct=b;this.Ib=!0}};e.oc=function(){if(this.Ib){var a=N.b.Xd(N.yi);this.canvas!==a?this.canvas.Y=this.Ib:(p.mb(a),this.Ua())}};
e.nk=function(a,b){for(var c=N.b.Xd(N.yi)===this.canvas,d=0;d<this.zc.length;++d){var g=this.zc[d];g.visible&&(c&&g.Hk(a,b),g.Ua(a,b))}};e.Ua=function(){var a=0,b=0;N.b.Xd(N.Fk)!==this.canvas&&(a=N.tf,b=N.Ae);this.paused?this.Dy.q(this.Ey+this.Bb+a,this.Fy+this.Cb+b):this.nk(this.Bb+a,this.Cb+b);this.Ib=!1};function xi(){this.Mk=[];this.gn=[];this.Ol=null;this.Hm=void 0;this.xk=!0}
function yi(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.cA){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof xi){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new xi,g.Mk=arguments[0],g.gn=arguments[1],g.Ol=arguments[2];var h=null,k=null,l=null,h=g.Mk,k=g.gn,l=g.Ol;this.dh=g;void 0===this.dh.Hm&&(this.dh.Hm=!dh(N.e));si.apply(this,arguments);K(this);this.j=this.visible=!0;k=k||[];h=h||[];this.cg=2;this.dy=!1;this.s=l||zi;this.pq=N.Fk;void 0!==this.s.Ha&&(this.pq=this.s.Ha);N.b.bb(this,this.pq);this.zj=this.yj=0;this.s.background.fr&&(this.yj=this.s.background.fr);this.s.background.gr&&(this.zj=this.s.background.gr);this.s.background.elements||
(this.Yc=this.s.background.f);this.s.background.Hz?(ti(this,this.s.background.elements,{}),this.Yc=this.s.background.f):(g=this.s.background.f,l=new si,ti(l,this.s.background.elements,[]),g||this.Ha!==N.yi?(this.Yc=new x(g.width,g.height),y(this.Yc),g.q(0,0,0),l.nk(-this.yj,-this.zj),z(this.Yc)):(p.mb(N.b.Xd(this.Ha)),l.Ua()));var n=this;this.nr=0;b("score",this.s.us)?(this.Kl=new Ai(this,this.s.us,"SCORE",0,!0),this.s.Rx&&new ui(this,this.s.Rx)):this.Kl=new Bi(0,0);this.uf=b("highScore",this.s.br)?
new Ai(this,this.s.br,"HIGHSCORE",0,!1):new Bi(0,0);b("highScore",this.s.zv)&&new ui(this,this.s.zv);b(["stage","level"],this.s.my)&&new Ai(this,this.s.my,"STAGE",0,!1);b("lives",this.s.Pv)&&new Ai(this,this.s.Pv,"LIVES",0,!1);this.kj=b("time",this.s.time)?new Ai(this,this.s.time,"TIME",0,!1,function(a){return n.lj(a)}):new Bi(0,0);this.kj.Qf(36E4);if(this.s.md&&this.s.qs)throw"Don't define both progress and progressFill in your game_ui settings";b("progress",this.s.md)?this.s.md.round?new Ci(this,
this.s.md):new Di(this,this.s.md):b("progress",this.s.qs)&&new Di(this,this.s.qs);b("lives",this.s.wv)&&new ui(this,this.s.wv);b("difficulty",this.s.K)?new vi(this,Ei().toUpperCase(),this.s.K):Ei();b("difficulty",this.s.qi)&&(g=id,g=(this.s.qi.images?this.s.qi.images:[jd,id,hd])[fh()],this.s.qi.f||(this.s.qi.f=g),this.Ku=new ui(this,this.s.qi),this.Ku.As(g));this.s.xf&&!this.s.xf.length&&(this.s.xf=[this.s.xf]);this.s.Yd&&!this.s.Yd.length&&(this.s.Yd=[this.s.Yd]);this.rr=[];this.sr=[];this.rr[0]=
b(["item","item0"],this.s.xf)?new ui(this,this.s.xf[0]):new Bi(0,"");this.sr[0]=b(["item","item0"],this.s.Yd)?new vi(this,"",this.s.Yd[0]):new Bi(0,"");if(this.s.xf&&this.s.Yd)for(g=1;g<this.s.Yd.length;++g)b("item"+g,this.s.Yd[g])&&(this.sr[g]=new vi(this,"0 / 0",this.s.Yd[g]),this.rr[g]=new ui(this,this.s.xf[g]));for(var q in this.s)g=this.s[q],g.L&&new vi(this,N.i.r(g.L,"<"+g.L+">")+(g.separator?g.separator:""),g);this.Hr=this.jt=0;this.buttons={};for(q in this.s.buttons)g=Fi(this,this.s.buttons[q]),
this.buttons[q]=g;this.s.ms&&(g=Fi(this,this.s.ms),this.buttons.pauseButton=g);this.Ym={};for(q in this.s.Ym)g=this.s.Ym[q],g=new Gi[g.Sz](this,g),this.Ym[q]=g;this.Cb=this.Bb=0}Jg(si,yi);var Gi={};function Fi(a,b){var c=new Hi(a,b,b.$);a.zc.push(c);c.oA=b;return c}e=yi.prototype;e.Io=function(a,b){this.buttons[b||"pauseButton"].Io(a)};e.lj=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.dy?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};
e.setTime=function(a){this.kj.Qf(a);return this};e.getTime=function(){return this.kj.ha()};e.Em=function(a){a=this.Kl.ha()+a;this.Kl.Qf(a);this.dh.Hm&&(this.uf.ha()<a?this.uf.Qf(a):a<this.uf.ha()&&this.uf.Qf(Math.max(a,this.nr)));return this};e.yb=function(){si.prototype.yb.apply(this,arguments);p.mb(this.canvas);p.clear();for(var a in this.buttons)I.p(this.buttons[a])};
e.va=function(a){1===this.cg&&this.setTime(this.getTime()+a);if(2===this.cg){if(this.jt&&1E3*this.jt>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.kj,b.pc.n=0,b.pc.Xl=!0,b.font.setFillColor(b.pc.color),b.Je(),"undefined"!==typeof a_gameui_timewarning_second&&H.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}si.prototype.va.apply(this,arguments);this.Hr+=a};
e.nk=function(a,b){this.Yc&&(this.Yc instanceof r?this.Yc.Ic(0,a+this.yj,b+this.zj,1):this.Yc.Ic(a+this.yj,b+this.zj,1));si.prototype.nk.apply(this,arguments);this.bn&&this.Yc&&pa(a,b,this.Yc.width,this.Yc.height,"blue",!0)};
function Ii(a,b,c,d,g,h){this.e=a;this.width=g;this.height=h;this.Pa=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.R={};this.R.Bb=0;this.R.Cb=0;this.R.scale=this.scale;this.R.alpha=this.alpha;this.R.Sa=0;this.F={};this.F.ee=!1;this.F.origin={};this.F.target={};this.F.n=0;this.a.vk&&(Ji(this,this.a.vk),this.F.ee=!1);this.e.zc.push(this);Ki||(Ki={Wb:function(a){a.value instanceof x?a.Pa=a.value:(a.f=a.value,a.Eb=0)},
update:$.Td,dc:$.Rd,end:$.Sd,Kc:L,Lc:L,Jc:function(a,b,c,d){return 1-cc(a,b,c,d)},ok:function(a,b,c,d){return 1*cc(a,b,c,d)+1},pk:function(a,b,c,d){return 1*cc(a,b,c,d)+1}})}var Ki;
function Ji(a,b){a.F.origin.x=void 0===b.x?a.x:b.x;a.F.origin.y=void 0===b.y?a.y:b.y;a.F.origin.alpha=void 0!==b.alpha?b.alpha:1;a.F.origin.scale=void 0!==b.scale?b.scale:1;a.F.target.x=a.x;a.F.target.y=a.y;a.F.target.alpha=a.alpha;a.F.target.scale=a.scale;a.F.duration=b.duration;a.F.ee=!0;a.F.ze=b.ze||cc;a.F.n=0;a.F.sa=b.sa||0;Li(a)}
function Li(a){a.F.n>=a.F.duration&&(a.F.n=a.F.duration,a.F.ee=!1);var b=a.F.ze(a.F.n,a.F.origin.x,a.F.target.x-a.F.origin.x,a.F.duration),c=a.F.ze(a.F.n,a.F.origin.y,a.F.target.y-a.F.origin.y,a.F.duration);a.R.Bb=b-a.x;a.R.Cb=c-a.y;a.R.alpha=a.F.ze(a.F.n,a.F.origin.alpha,a.F.target.alpha-a.F.origin.alpha,a.F.duration);a.R.scale=a.F.ze(a.F.n,a.F.origin.scale,a.F.target.scale-a.F.origin.scale,a.F.duration);a.e.Ib=!0}e=Ii.prototype;
e.Ua=function(a,b){this.Pa&&this.Pa.ya(this.x+this.R.Bb+a,this.y+this.R.Cb+b,this.R.scale,this.R.scale,0,this.R.alpha)};e.Hk=function(a,b){Mi(this.x+this.R.Bb+a,this.y+this.R.Cb+b,this.width*this.R.scale,this.height*this.R.scale)};e.Wk=function(a,b){return a>this.x+this.R.Bb&&a<this.x+this.R.Bb+this.width*this.R.scale&&b>this.y+this.R.Cb&&b<this.y+this.R.Cb+this.height*this.R.scale};e.Jo=function(a){this.visible!==a&&(this.visible=a,this.e.Ib=!0)};
e.va=function(a){this.F.ee&&(0<this.F.sa?this.F.sa-=a:(this.F.n+=-this.F.sa,this.F.sa=0,this.F.n+=a,Li(this)))};function Bi(a,b){this.md=this.value=this.Sk=b}e=Bi.prototype;e.Qf=function(a){this.value=a};e.ha=function(){return this.value};e.As=function(){};e.zs=function(){};e.ys=function(){};
function ui(a,b){this.no=b;this.a={};for(var c in b)this.a[c]=b[c];this.f=this.a.f;this.I=0;this.dk=this.a.dk;this.a.sB&&(this.a.x+=this.f.Gb,this.a.y+=this.f.Hb);Ii.call(this,a,this.a,this.a.x,this.a.y,this.f?this.f.width:1,this.f?this.f.height:1)}Jg(Ii,ui);Gi.GameUIImage=ui;function Ni(a,b){a.I!==b&&(a.I=b,a.e.Ib=!0)}e=ui.prototype;
e.Ua=function(a,b){this.f&&(this.dk&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),this.f instanceof r?this.f.ya(this.I,this.x+a+this.R.Bb,this.y+b+this.R.Cb,this.R.scale,this.R.scale,0,this.R.alpha):this.f.ya(this.x+a+this.R.Bb,this.y+b+this.R.Cb,this.R.scale,this.R.scale,0,this.R.alpha),this.e.bn&&pa(this.x+a-this.f.Gb+1,this.y+b-this.f.Hb+1,this.f.width-2,this.f.height-2,"black",!0))};
e.Wk=function(a,b){if(!this.f)return!1;var c=0,d=0;this.dk&&(c+=-Math.floor(this.f.width/2),d+=-Math.floor(this.f.height/2));c-=this.f.Gb;d-=this.f.Hb;return a>c+this.x+this.R.Bb&&a<c+this.x+this.R.Bb+this.width*this.R.scale&&b>d+this.y+this.R.Cb&&b<d+this.y+this.R.Cb+this.height*this.R.scale};e.Hk=function(a,b){this.f&&(this.dk&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),a-=this.f.Gb,b-=this.f.Hb,Mi(this.x+this.R.Bb+a,this.y+this.R.Cb+b,this.width*this.R.scale,this.height*this.R.scale))};
e.Bn=function(a){a||(a=new ca(0,0));a.x=this.x+N.tf+this.e.Bb;a.y=this.y+N.Ae+this.e.Cb;return a};e.As=function(a){a!==this.f&&(this.f=a,this.e.Ib=!0,this.f&&(this.width=this.f.width,this.height=this.f.height))};
function vi(a,b,c){"object"===typeof b&&(c=b,b=c.L?N.i.r(c.L,"<"+c.L+">"):c.text||"");this.text=b;this.font=c.font.N();c.pf&&C(this.font,c.pf);this.hs=c.x;this.is=c.y;this.gs=c.Lb;this.fx=this.font.fillColor;this.ke=void 0===c.ke?.2:c.ke;Ii.call(this,a,c,Math.floor(c.x-.1*c.Lb),Math.floor(c.y-.1*c.Sb),Math.floor(1.2*c.Lb),Math.floor(1.2*c.Sb));this.Pa=new x(this.width,this.height);switch(this.font.align){case "left":this.$f=Math.floor(.1*c.Lb);break;case "right":this.$f=Math.floor(1.1*c.Lb);break;
case "center":this.$f=Math.floor(.6*c.Lb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.ke*this.font.fontSize);switch(this.font.h){case "top":this.ag=Math.floor(.1*c.Sb);break;case "bottom":this.ag=Math.floor(1.1*c.Sb)+a;break;case "middle":this.ag=Math.floor(.6*c.Sb)+a;break;default:throw"Unknown baseline: "+this.font.h;}this.pc={};this.pc.color="red";this.pc.duration=200;this.pc.n=0;this.pc.Xl=!1;this.Je()}Jg(Ii,vi);Gi.GameUIText=vi;
vi.prototype.va=function(a){Ii.prototype.va.apply(this,arguments);this.pc.Xl&&(this.pc.n+=a,this.pc.duration<=this.pc.n&&(this.pc.Xl=!1,this.font.setFillColor(this.fx),this.Je()))};
vi.prototype.Je=function(){this.Pa.clear();y(this.Pa);var a=this.font.da(this.text),b=1;a>this.gs&&(b=this.gs/a);this.font.ya(this.text,this.$f,this.ag,b,b,0,1);this.e.bn&&(pa(0,0,this.Pa.width,this.Pa.height,"black",!0),pa(this.hs-this.x,this.is-this.y,this.Pa.width-2*(this.hs-this.x),this.Pa.height-2*(this.is-this.y),"red",!0),qa(this.$f-5,this.ag,this.$f+5,this.ag),qa(this.$f,this.ag-5,this.$f,this.ag+5));this.e.Ib=!0;z(this.Pa)};function Oi(a){return""+a}function Pi(a,b,c){return b+c}
function Ai(a,b,c,d,g,h){this.value=this.Sk=d||0;this.mm=-1;this.Ft=c;this.a=b;this.Et=-99999;this.ap=b.ap||0;this.wi=b.wi?b.wi:h||Oi;c=Pi;g&&0!==this.a.yq&&(c=dc);this.Ga=new Kg(this.Sk,void 0===this.a.yq?500:this.a.yq,c);b.Ag&&(this.Ag="game_ui_"+b.Ag);this.text=Qi(this)+this.wi(this.Sk);vi.call(this,a,this.text,b)}Jg(vi,Ai);Gi.GameUIValue=Ai;e=Ai.prototype;e.Qf=function(a){this.value=a;Mg(this.Ga,this.value)};e.zs=function(a){a||(a=Oi);this.wi=a;this.rj(!0)};e.ys=function(a){this.Ag=a;this.rj(!0)};
e.ha=function(){return this.value};e.rj=function(a){var b=this.mm;if(a||I.Ek-this.Et>this.ap)b=this.wi(Math.floor(this.Ga.ha()));this.mm!==b&&(this.Et=I.Ek,this.mm=b,this.text=Qi(this)+b,this.Je())};e.va=function(a){vi.prototype.va.apply(this,arguments);Lg(this.Ga,a);Math.floor(this.Ga.ha())!==this.mm&&this.rj()};function Qi(a){var b="";a.a.jp&&(b=a.Ag?N.i.r(a.Ag,"<"+a.Ag.toUpperCase()+">"):N.i.r("game_ui_"+a.Ft,"<"+a.Ft+">"));return b+(a.a.separator?a.a.separator:"")}
function Di(a,b){this.Lm=this.md=0;this.a=b;this.Xi=this.Lf=0;this.f=b.f;this.we=b.we||b.f;this.Nn=b.Nn||null;this.a.Jf=this.a.Jf||0;this.a.Xg=this.a.Xg||0;this.Gm=!0;this.Cl=b.Cl||0;this.O=[];this.Ga=new Kg(0,200,M);this.Cc=new Kg(0,200,M);Ii.call(this,a,b,b.x,b.y,this.f.width,this.f.height)}Jg(Ii,Di);Gi.GameUIProgress=Di;
Di.prototype.va=function(a){Lg(this.Ga,a);var b=this.Ga.ha();b!==this.Lf&&(this.e.Ib=!0,this.Lf=b);Lg(this.Cc,a);a=this.Cc.ha();a!==this.Xi&&(this.e.Ib=!0,this.Xi=a);b+=a;if(this.Gm)for(a=0;a<this.O.length;++a){var c=b>=this.O[a].position&&this.md+this.Lm>=this.O[a].position;this.O[a].complete!==c&&(this.a.O&&(this.e.Ib=!0,this.Lf=b),this.O[a].complete=c)}};
Di.prototype.Ua=function(a,b){var c,d,g;if(0===this.Cl&&(0<this.Cc.ha()&&this.we.na(0,this.width*this.Ga.ha()/100,0,this.we.width*this.Cc.ha()/100,this.we.height,a+this.x+this.width*this.Ga.ha()/100,b+this.y),this.f.na(0,0,0,this.width*this.Ga.ha()/100,this.height,a+this.x,b+this.y),this.a.O))for(c=0;c<this.O.length;++c)d=this.O[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.width/100*d.position,b+this.y+this.a.O.y);if(1===this.Cl&&(0<this.Cc.ha()&&this.we.na(0,0,this.height-
this.height*this.Ga.ha()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ga.ha()/100)),this.f.na(0,0,this.height-this.height*this.Ga.ha()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ga.ha()/100)),this.a.O))for(c=0;c<this.O.length;++c)d=this.O[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.a.O.x,b+this.y+this.height-this.height/100*d.position);if(2===this.Cl&&(0<this.Cc.ha()&&this.we.na(0,0,this.height*this.Ga.ha()/
100,this.we.width,this.we.height*this.Cc.ha()/100,a+this.x+this.width*this.Ga.ha()/100,b+this.y),this.f.na(0,0,0,this.width,this.height*this.Ga.ha()/100,a+this.x,b+this.y),this.a.O))for(c=0;c<this.O.length;++c)d=this.O[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.a.O.x,b+this.y+this.height/100*d.position);this.Nn&&this.Nn.q(0,a+this.x+this.a.Jf,b+this.y+this.a.Xg)};function Hi(a,b,c){this.jm=!1;this.mj=-1;this.e=a;this.a=b;this.j=!0;this.Io(c);ui.call(this,a,b)}
Jg(ui,Hi);Gi.GameUIButton=Hi;Hi.prototype.Io=function(a){var b=null,c=null,d=this.e,g=this.a;void 0===a&&(a=g.$?g.$:0);switch(a){case 0:b=d.dh.xk?df:kf;c=function(){dh(N.e)?N.e.fe(!1,!0,d.dh.xk):N.e.fe();return!0};break;case 1:b=ef;c=function(){N.e.fe();return!0};break;case 2:b=s_btn_small_quit;c=function(){Ri(d.dh.xk);return!0};break;case 3:b=g.f}this.pb=c;this.a.f=b};Hi.prototype.zb=function(a,b,c){if(this.j)return this.Wk(b-N.tf,c-N.Ae)?(this.jm=!0,this.mj=a,Ni(this,1),!0):!1};
Hi.prototype.va=function(a){ui.prototype.va.apply(this,arguments);this.jm&&(this.Wk(I.ka[this.mj].x-N.tf,I.ka[this.mj].y-N.Ae)?Ni(this,1):Ni(this,0))};Hi.prototype.Ub=function(a,b,c){return this.jm&&a===this.mj?(Ni(this,0),this.Wk(b-N.tf,c-N.Ae)&&this.pb&&this.pb(),this.jm=!1,this.mj=-1,!0):!1};
function Ci(a,b){this.Lm=this.md=0;this.a=b;this.Xi=this.Lf=0;this.Gm=!0;this.O=[];this.color=b.color||"#00AEEF";this.aq=b.aq||"#FF0F64";this.$p=b.$p||"#FFED93";this.ru=void 0===b.blink||b.blink;this.Qc=b.Qc;this.fi=!1;this.af=0;this.Xj=1E3;this.Yj=0;this.Ga=new Kg(0,200,M);this.Cc=new Kg(0,200,M);Ii.call(this,a,b,b.x,b.y,1,1)}Jg(Ii,Ci);Gi.GameUIRoundProgress=Ci;
Ci.prototype.va=function(a){Lg(this.Ga,a);var b=this.Ga.ha();b!==this.Lf&&(this.e.Ib=!0,this.Lf=b);Lg(this.Cc,a);var c=this.Cc.ha();c!==this.Xi&&(this.e.Ib=!0,this.Xi=c);this.fi&&(this.af+=a,this.af>=this.Xj?100===this.md?(this.fi=!1,this.ru&&(this.fi?this.af-=this.Xj:(this.fi=!0,this.Yj=this.af=0,Mg(this.Ga,100)))):(this.fi=!1,this.Yj=0,this.Ga.Eg=0,this.Ga.gm=0,Mg(this.Ga,this.md)):this.Yj=(-Math.cos(this.af/this.Xj*5*Math.PI*2)+1)/2,this.e.Ib=!0);b+=c;if(this.Gm)for(a=0;a<this.O.length;++a)c=b>=
this.O[a].position&&this.md+this.Lm>=this.O[a].position,this.O[a].complete!==c&&(this.a.O&&(this.e.Ib=!0,this.Lf=b),this.O[a].complete=c)};Ci.prototype.Hk=function(a,b){this.Qc&&Mi(this.x+this.R.Bb+a-this.Qc.Gb,this.y+this.R.Cb+b-this.Qc.Hb,this.Qc.width*this.R.scale,this.Qc.height*this.R.scale)};
Ci.prototype.Ua=function(a,b){var c,d;if(this.Qc){d=this.Ga.ha()/100;d=Math.max(d,0);d=Math.min(d,1);var g=p.context,h=this.Qc.width/2-O(4),k=g.fillStyle;if(0<this.Cc.ha()){var l=this.Cc.ha()/100;g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.aq;g.fill()}g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Xj&&(l=g.globalAlpha,
g.globalAlpha*=this.Yj,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.$p,g.fill(),g.globalAlpha=l);if(this.a.O){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=O(2);for(d=0;d<this.O.length;++d){c=this.O[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+
this.y+c));g.stroke()}g.strokeStyle=l;g.lineWidth=n}this.Qc.q(0,a+this.x,b+this.y);if(this.a.O)for(d=0;d<this.O.length;++d)c=this.O[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.q(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.O.Bx*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.O.Bx*.5));g.fillStyle=k}};N.version=N.version||{};N.version.game_ui="2.1.0";
var $={dm:{},bt:{},ct:{},dt:{},jo:{},ko:{},Ny:{},Av:{},Vt:function(){$.dm={Wb:$.hk,update:$.Td,dc:$.Rd,end:$.Sd,font:Pf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.bt={Wb:$.hk,update:$.Td,dc:$.Rd,end:$.Sd,font:Qf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.ct={Wb:$.hk,update:$.Td,dc:$.Rd,end:$.Sd,font:Rf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.dt={Wb:$.hk,update:$.Td,dc:$.Rd,end:$.Sd,font:Sf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],
[.1,.8,.1])};$.jo={Wb:$.Fu,update:$.Td,dc:$.Rd,end:$.Sd,ui:Tf,ti:Uf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.ko={Wb:$.Gu,update:$.Td,dc:$.Rd,end:$.Sd,ui:Tf,ti:Uf,margin:20,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.Ny={Wb:$.Hu,update:$.Td,dc:$.Rd,end:$.Sd,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])};$.Av={Wb:$.Eu,update:$.Td,dc:$.Rd,end:$.Sd,Kc:L,Lc:L,Jc:hc([cc,Yb,cc],[!1,!1,!0],[.1,.8,.1])}},jq:function(a){function b(a){var d,g={};for(d in a)g[d]="object"===
typeof a[d]&&null!==a[d]?b(a[d]):a[d];return g}return b(a)},iB:function(a){$.dm.font.t=a;$.bt.font.t=a;$.ct.font.t=a;$.dt.font.t=a},hB:function(a){$.jo.ui.t=a;$.jo.ti.t=a;$.ko.ui.t=a;$.ko.ti.t=a},Ah:!1,ac:[],xs:function(a){$.Ah=a},qA:function(){return $.Ah},Gx:function(a){var b,c;for(b=0;b<$.ac.length;b+=1)c=$.ac[b],void 0===c||void 0!==a&&c.kind!==a||0<c.bh||($.ac[b]=void 0)},Ut:function(){$.Ah=!1;$.ac=[]},Ch:function(a,b,c,d){var g,h,k;void 0===d&&(d=$.Ah);if(d)for(h=0;h<$.ac.length;h+=1)if(g=$.ac[h],
void 0!==g&&g.Ce&&g.kind===a&&g.font===b&&g.text===c)return g.bh+=1,h;g={kind:a,font:b,text:c,bh:1,Ce:d};h=b.align;k=b.h;F(b,"center");G(b,"middle");d=b.da(c)+2*a.margin;a=b.W(c)+2*a.margin;g.Pa=new x(d,a);y(g.Pa);b.q(c,d/2,a/2);z(g.Pa);F(b,h);G(b,k);for(h=0;h<$.ac.length;h+=1)if(void 0===$.ac[h])return $.ac[h]=g,h;$.ac.push(g);return $.ac.length-1},Tt:function(a){var b=$.ac[a];b.bh-=1;0>=b.bh&&!b.Ce&&($.ac[a]=void 0)},hk:function(a){a.buffer=$.Ch(a.kind,a.kind.font,a.value,a.Ce)},Fu:function(a){var b=
a.value.toString();a.buffer=0<=a.value?$.Ch(a.kind,a.kind.ui,b,a.Ce):$.Ch(a.kind,a.kind.ti,b,a.Ce)},Gu:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?$.Ch(a.kind,a.kind.ui,b,a.Ce):$.Ch(a.kind,a.kind.ti,b,a.Ce)},Hu:function(a){a.Pa=a.value},Eu:function(a){a.f=a.value;a.Eb=0},Td:function(a){a.x=void 0!==a.kind.Kc?a.kind.Kc(a.time,a.Vl,a.Dq-a.Vl,a.duration):a.Vl+a.time/a.duration*(a.Dq-a.Vl);a.y=void 0!==a.kind.Lc?a.kind.Lc(a.time,a.Wl,a.Eq-a.Wl,a.duration):a.Wl+a.time/
a.duration*(a.Eq-a.Wl);void 0!==a.kind.ok&&(a.Mf=a.kind.ok(a.time,0,1,a.duration));void 0!==a.kind.pk&&(a.Nf=a.kind.pk(a.time,0,1,a.duration));void 0!==a.kind.Jc&&(a.alpha=a.kind.Jc(a.time,0,1,a.duration));void 0!==a.kind.Nu&&(a.Sa=a.kind.Nu(a.time,0,360,a.duration)%360);void 0!==a.f&&(a.Eb=a.time*a.f.I/a.duration)},Rd:function(a){var b=p.context,c;void 0!==a.f&&null!==a.images?1===a.Mf&&1===a.Nf&&0===a.Sa?a.f.Ic(Math.floor(a.Eb),a.x,a.y,a.alpha):a.f.ya(Math.floor(a.Eb),a.x,a.y,a.Mf,a.Nf,a.Sa,a.alpha):
(c=void 0!==a.Pa&&null!==a.Pa?a.Pa:$.ac[a.buffer].Pa,1===a.Mf&&1===a.Nf&&0===a.Sa?c.Ic(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Mf)||1E-4>Math.abs(a.Nf)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.Sa*Math.PI/180),b.scale(a.Mf,a.Nf),c.Ic(-c.width/2,-c.height/2,a.alpha),b.restore()))},Sd:function(a){void 0!==a.buffer&&$.Tt(a.buffer)},oc:function(a){var b,c,d=!1;for(b=0;b<$.wb.length;b+=1)c=$.wb[b],void 0!==c&&(0<c.sa?(c.sa-=a,0>c.sa&&(c.time+=-c.sa,c.sa=0)):c.time+=a,0<c.sa||(c.time>=c.duration?
(c.kind.end(c),$.wb[b]=void 0):c.kind.update(c),d=!0));d&&($.canvas.Y=!0)},Ua:function(){var a,b;for(a=0;a<$.wb.length;a+=1)b=$.wb[a],void 0!==b&&(0<b.sa||b.kind.dc(b))},wb:[],mr:function(a,b,c){$.Su();void 0===a&&(a=N.yk);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);$.visible=!0;$.j=!0;N.b.bb($,a);$.depth=b;K($);Lb($,c);$.Ut();$.Vt()},$t:function(a,b,c,d,g,h,k,l,n){void 0===l&&(l=void 0!==a.sa?a.sa:0);void 0===n&&(n=$.Ah);void 0===g&&void 0!==a.Jw&&(g=c+a.Jw);void 0===h&&void 0!==a.Kw&&(h=d+a.Kw);
void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Vl:c,Wl:d,Dq:g,Eq:h,x:c,y:d,Mf:1,Nf:1,alpha:1,Sa:0,time:0,duration:k,sa:l,Ce:n};a.kind.Wb(a);for(b=0;b<$.wb.length;b+=1)if(void 0===$.wb[b])return $.wb[b]=a,b;$.wb.push(a);return $.wb.length-1},cB:function(a){var b;0>a||a>=$.wb.length||(b=$.wb[a],void 0!==b&&(b.kind.end(b),$.wb[a]=void 0))},Fx:function(){var a,b;for(a=0;a<$.wb.length;a+=1)b=$.wb[a],void 0!==b&&(b.kind.end(b),$.wb[a]=void 0);$.wb=[]},Su:function(){$.Fx();$.Gx();I.p($)}};
LevelMapIcons={gv:function(a,b){var c=new x(Xe.width,Xe.height),d=Si/Ti,g=a.width/a.height;y(c);d<g?(d=g*Si,g=Ti):(d=Si,g=Ti/g);a.xq(0,Ui-(d-Si)/2,Vi-(g-Ti)/2,d,g,1);b?Ye.q(0,0,0):Xe.q(0,0,0);z(c);return c}};N.version=N.version||{};N.version.game="1.4.1";
function Wi(a){this.depth=9E3;this.j=this.visible=!0;this.group=0;this.Xl=!1;this.B=void 0;K(this);var b=new xi,c,d=dh(N.e);d?(N.k.Of="time",N.k.hf="min",b.xk=!1,b.gn=["time"],b.Ol=Xi.Bz,void 0!==d.qu?c=1E3*d.$g[d.qu]:(c=0,b.Mk=["highScore"])):(b.Mk=["difficulty"],b.Ol=Yi,c=ni(this.$k));this.Xa=new yi(b);d&&(this.Xa.uf.zs(yi.lj),this.Xa.uf.ys("game_ui_TIME_TO_BEAT"));c||(c=0);b=this.Xa;b.uf.Qf(c);b.nr=c;this.B=new Zi(0,0,0,this);this.$k=a;this.tc=!0;this.B.pause=!1;this.Xa.cg=0;if(c=dh(N.e)){this.Xa.setTime(0);
a=[];for(b=0;b<N.a.o.Bf.length;++b)N.a.o.Bf[b].K.K===fh()&&a.push(b);this.$k=c.Dx%a.length}else this.Xa.setTime(N.a.o.Bf[a].Ba.time);a=this.B;c=N.a.o.Bf[a.e.$k];var g,h=null,k,l,n=c.La,q=c.Ma;for(k=0;k<c.height;++k)for(l=0;l<c.width;++l)if(d=l,g=k,h=n[k][l]," "!==h){var w=1;" "!==q[k][l]&&(w=parseInt(q[k][l],10));switch(h){case "F":g+=.5;break;case "Q":$i(a,d-.5,g-.5,w+1,h),h="N"}for(b=1;b<=w;b+=1)$i(a,d,g,b,h)}aj(a,1);if(!a.pl)throw"Finished parsing with unequal amount of tiles. Level is playable, but unfinishable.";
a.Mj=!0;a.Ql();a.m=bj(a);cj(a);dj(a);ej(a,0);a.hm=new fj(0,0,-Number.MAX_VALUE,a,1);this.$q=!1}Wi.prototype.Em=function(a){this.Xa.Em(a)};Wi.prototype.yb=function(){void 0!==this.B&&(gj(this.B),I.p(this.B));this.Xa&&(I.p(this.Xa),this.Xa=null);p.mb(N.b.Xd(N.Fg));p.clear()};
function hj(a){if(a.tc){if(dh(N.e))ij(N.e,a.Xa.getTime()/1E3);else{var b=jj,c=N.e,d=a.Xa.Kl.ha(),g;g=a.Xa;g=g.lj(g.kj.ha());b(c,{totalScore:d,timeLeft:g,timeBonus:N.a.o.Ba.su*Math.floor(a.Xa.getTime()/1E3),submitScoreMethod:"submitSessionScore"})}a.tc=!1}}
function kj(a,b,c,d,g,h,k){this.depth=c;this.j=this.visible=!0;this.group=0;this.a=N.a.o.el;N.b.bb(this,N.Fg);this.x=a;this.y=b;this.alpha=0;this.f=d;this.B=g;this.cd=-1;this.Sg=this.Ad=this.Ff=this.Tg=void 0;this.type=h;this.Cu=0;this.wo=-1;this.Ok=!1;this.Mg=0;this.scale=1;this.vs=!0;this.hb=k;this.aj=this.ji=0;K(this)}e=kj.prototype;e.yb=function(){this.B.Ii===this&&(this.B.Ii=void 0)};
e.zb=function(a,b,c){if(-1===this.cd){var d;a=b-N.Bi;c-=N.Ci;b=this.a.bg;d=this.a.oh;a>this.x&&a<this.x+b&&c>this.y&&c<this.y+d&&this.B.vh.push(this)}};
e.oc=function(a){0<this.cd&&(this.cd-=.001*a,this.vs&&(this.vs=!1),0>=this.cd&&this.B.p(this));if(this.Ok)if(0>=this.Pk){var b=Hd.I;this.On=Math.floor(this.Mg/N.a.o.wf.Od);this.Mg>=b*N.a.o.wf.Od&&(this.On=-1,this.Mg=0,this.Pk=N.a.o.wf.ir);this.Mg+=a}else this.Pk-=a;this.B.Rc!==this||this.B.pause||(this.Go+=a,this.$x=Math.floor(this.Go/N.a.o.Ho.Od%Id.I))};e.Nl=function(){this.Mg=0;this.Ok=!0;this.Pk=N.a.o.wf.ir};function lj(a,b){var c;c=!1;b.f===a.f&&b!==a&&-1===a.cd&&-1===b.cd&&(c=!0);return c}
function mj(a,b,c,d){a.cd=1;a.B.DA=-1;void 0!==a.Tg&&(a.Tg.Ff=void 0);void 0!==a.Ff&&(a.Ff.Tg=void 0);void 0!==a.Sg&&(a.Sg.Ad=void 0);nj(a.B,a);if(b){dj(a.B);oj(a.B);var g=a.B;b=a.B.df+1;g.Dg=g.a.Yu;g.df=b;3<g.df&&(g.df=3);if(0<g.df){var h=g.df;b=g.Kq.x+N.Bi;var g=g.Kq.y+N.Ci,k=pj,l=null,n=null;switch(h){case 1:l="undefined"!==typeof Yf?Yf:null;h=N.i.r("floater_1","<floater_1>");n="undefined"!==typeof a_nice?a_nice:null;break;case 2:l="undefined"!==typeof Xf?Xf:null;h=N.i.r("floater_2","<floater_2>");
n="undefined"!==typeof a_great?a_great:null;break;case 3:l="undefined"!==typeof Wf?Wf:null;h=N.i.r("floater_3","<floater_3>");n="undefined"!==typeof a_awesome?a_awesome:null;break;default:throw"Unknown floater type: "+h;}n&&H.play(n,0);k.mc.font=l;k.a.offsetY&&(g+=k.a.offsetY);$.$t(k.mc,h,b,g,b,g+k.rt,k.pt,0,!0)}}else dj(a.B),a.B.Kq=new ca(a.x,a.y);a.B.e.Em(N.a.o.Ba.Wy);void 0!==c&&new qj(a.x,a.y,0,a.B,c,d)}
function rj(a){var b,c=!1;void 0===b&&(b=0);void 0===a.tb(0,b)&&void 0===a.tb(2,b)&&void 0===a.tb(1,b)?(a.Tg=a.B.tb(0,a),a.Ff=a.B.tb(1,a),a.Ad=a.B.tb(2,a),a.Sg=a.B.tb(3,a),void 0===a.tb(0,b)?c=!0:void 0===a.tb(2,b)&&(c=!0),void 0!==a.tb(1,b)&&(c=!1)):void 0!==a.tb(0,b)&&void 0!==a.tb(2,b)||void 0!==a.tb(1,b)||(c=!0);2!==a.B.m.length||0!==a.B.ie.length||void 0===a.B.m[0].Ad&&void 0===a.B.m[1].Ad||(a.B.m[0].x=3*a.a.bg,a.B.m[0].y=2*a.a.oh,a.B.m[1].x=4*a.a.bg,a.B.m[1].y=2*a.a.oh,dj(a.B));return c}
e.tb=function(a,b){var c;switch(a){case 0:c=this.Tg;break;case 1:c=this.Ad;break;case 2:c=this.Ff;break;case 3:c=this.Sg;break;default:throw"Unknown dir: "+a;}return 0===b?c:void 0!==c?void 0!==c.f?c:void 0:void 0};
e.Ua=function(){var a;(a=1===this.hb)||"Q"!==this.type&&!this.Sg.Ff||(a=!0);this.f&&(0>this.cd&&(this.f.wq(0,0,0,a?this.f.width:O(70),this.f.height,Math.round(this.x),Math.round(this.y),this.scale,this.scale,0,this.alpha),this.B.Rc!==this||this.B.pause||Id.q(this.$x,Math.round(this.x-N.a.o.Ho.up),Math.round(this.y-N.a.o.Ho.xp)),this.Ok&&-1<this.On&&!this.B.pause&&Hd.q(this.On,Math.round(this.x-N.a.o.wf.up),Math.round(this.y-N.a.o.wf.xp))),this.Ad&&"Q"!==this.Ad.type&&(a=.75*this.alpha,Gd.Ic(0,Math.round(this.x),
Math.round(this.y),a)))};function Zi(a,b,c,d){this.depth=c;this.j=this.visible=!0;this.group=0;this.x=a;this.y=b;this.e=d;this.Lj=0;this.df=this.pg=-1;this.wd=1;this.oi=void 0;this.Jq=!0;this.sf=this.Dg=-1;this.m=[];this.Ii=this.f=void 0;this.zd=[];this.Xk=0;this.pause=this.pl=!0;this.Hl=0;this.a=N.a.o.el;this.dj=!1;this.fh=-1;this.Sf=!0;this.ie=[];this.vh=[];N.b.bb(this,N.Fg);a=dh(N.e);this.Cx=new ea(a?a.Dx:void 0);K(this)}e=Zi.prototype;e.Tb=function(){};e.yb=function(){gj(this)};
e.va=function(){this.canvas.Y=!0};
function sj(a){var b,c;b=void 0;for(c=0;c<a.vh.length;c+=1)void 0===b?b=a.vh[c]:b.depth>a.vh[c].depth&&(b=a.vh[c]);if(void 0!==b){var d,g;c=!0;g=new tj(0,0,0);if(!b.B.pause&&1>b.B.wd){if(void 0!==b.B.Rc&&0>b.cd&&lj(b,b.B.Rc)&&rj(b.B.Rc)&&rj(b)){H.play(sg);c=!1;d=Pb(I,b.B.Rc.f,0,0,b.B.Rc.x,b.B.Rc.y,b.B.Rc.depth,void 0);g.ro(0);mj(b,!1,b.B.Rc,d);mj(b.B.Rc,!0,void 0,void 0);b.B.Rc=void 0;d=b.B;for(g=0;g<d.m.length;g+=1)d.m[g].Ok=!1;d.Ii=void 0}c&&rj(b)&&0>b.cd&&(b.B.Rc=b,b.Go=0,H.play(rg))}}a.vh=[]}
e.oc=function(a){this.pause||(this.Lj+=.001*a,this.Nl(),uj(this,1,a),sj(this));if(0<this.pg&&(this.pg-=.001*a,0>=this.pg)){this.pg=-1;var b=[{ar:N.i.r("ShuffleConfirmBtnHeader","<SHUFFLE_CONFIRM_BTN_HEADER>"),text:N.i.r("ShuffleConfirmBtnText","<SHUFFLE_CONFIRM_BTN_TEXT>"),S:this.zy,ca:this}],c;if(void 0===dh(N.e))c={ar:N.i.r("ShuffleRestartBtnHeader","<SHUFFLE_RESTART_BTN_HEADER>"),text:N.i.r("ShuffleRestartBtnText","<SHUFFLE_RESTART_BTN_TEXT>"),S:function(){this.bd.close();I.p(this.e);N.hb=new Wi(this.e.$k)},
ca:this};else{var d=this,g=function(a){a?d.bd.close():d.bd.show()};c={ar:N.i.r("optionsChallengeForfeit","<SHUFFLE_RESTART_BTN_HEADER>"),text:N.i.r("optionsChallengeForfeit","<SHUFFLE_RESTART_BTN_TEXT>"),S:function(){var a=d.bd,b,c;for(b=0;b<a.buttons.length;b++)c=a.buttons[b],c.Jo(!1);a.c.visible=!1;Ri(!1,g)},ca:this}}b.push(c);this.bd=new Th(N.i.r("ShuffleConfirmationText","<SHUFFLE_CONFIRM_TEXT>"),b,void 0===dh(N.e))}0<this.sf&&(this.sf-=.001*a,0>=this.sf&&(this.sf=0,hj(this.e)));0<this.Dg&&(this.Dg-=
.001*a,0>=this.Dg&&(this.Dg=this.df=-1));this.Mj&&(2<this.Xk?(this.Xk=0,this.Ql()):this.Xk+=a)};function $i(a,b,c,d,g){a.pl?(void 0!==a.oi&&(vj(a,a.oi),vj(a,a.oi)),a.oi=wj(a),a.pl=!1):a.pl=!0;var h=(d-1)*a.a.Xy,k=(d-1)*a.a.Yy,l=1*-(a.a.bg+a.a.ls),n=(N.Sq-O(560))/2;d=new kj(b*(a.a.bg+a.a.ls)+l+n+h+a.a.Zy,c*(a.a.oh+a.a.ix)+k+a.a.$y,-d*c*100-10*b,a.oi,a,g,d);d.Cu=0;d.ji=b;d.aj=c;a.m.push(d)}function gj(a){var b,c;a.Ex=!1;for(b=a.m.length-1;0<=b;b-=1)c=a.m[b],a.m.splice(b,1),I.p(c);a.hm&&I.p(a.hm)}
e.Ql=function(){function a(a,b){var c=h[a].Fv;h[a].count-=b;0===h[a].count&&h.splice(a,1);return c}var b,c;if(this.m[0].f){aj(this,0);for(b=0;b<this.m.length;b++)this.m[b].f=void 0;dj(this)}var d=[];for(b=0;b<this.m.length;b++)rj(this.m[b])&&d.push(this.m[b]);var g;for(b=0;b<d.length;b++)g=Math.floor(Math.random()*d.length),c=d[g],d[g]=d[b],d[b]=c;for(var h=[];0<this.zd.length;){c=wj(this);for(g=0;vj(this,c);)g++;h.push({Fv:c,count:g})}b=N.a.o.Zi.Xr;c=N.a.o.Zi.Pr;g=b+Math.round(Math.random()*(c-b));
g=Math.min(g,Math.floor(d.length/2));var k=h.length-1;for(b=0;b<g;b++)c=a(k,2),k--,0>k&&(k=h.length-1),d[2*b].f=c,d[2*b+1].f=c;for(b=2*g;b<d.length;b++)c=a(k--,1),0>k&&(k=h.length-1),d[b].f=c;for(b=0;b<this.m.length;b++)void 0===this.m[b].f&&(k=Math.floor(Math.random()*h.length),c=a(k,1),this.m[b].f=c);this.Mj=!1};function cj(a){var b;p.mb(N.b.Xd(N.Fg));p.clear();for(b=0;b<a.m.length;b+=1)Kb(a.m[b],-(a.m[b].x*N.Oq+a.m[b].y+N.Sq*N.Oq*a.m[b].hb)),a.m[b].Rb=!0,a.m[b].alpha=1;dj(a)}
function aj(a,b){var c;a.zd=[];var d=[];if(1===b){for(c=0;6>c;c+=1)d.push(se),d.push(te),d.push(ue),d.push(ve),d.push(td),d.push(ud),d.push(vd),d.push(wd),d.push(pe),d.push(qe),d.push(re),d.push(ge),d.push(he),d.push(ie),d.push(je),d.push(ke),d.push(le),d.push(me),d.push(ne),d.push(oe),d.push(Yd),d.push(Zd),d.push($d),d.push(ae),d.push(be),d.push(ce),d.push(de),d.push(ee),d.push(fe),d.push(Nd),d.push(Od),d.push(Pd),d.push(Rd),d.push(Sd),d.push(Td),d.push(Ud),d.push(Wd),d.push(Xd),d.push(xd),d.push(yd),
d.push(zd),d.push(Ad);for(c=0;c<a.m.length/2;++c)a.zd.push(d[c]),a.zd.push(d[c])}else for(c=0;c<a.m.length;c+=1)a.zd.push(a.m[c].f)}function vj(a,b){var c;for(c=a.zd.length-1;0<=c;c-=1)if(a.zd[c]===b)return a.zd.splice(c,1),!0;return!1}function wj(a){var b;b=a.zd.length-1;var c=1;void 0!==b&&(c=b);b=Math.floor(a.Cx.random(c+1));return a.zd[b]}e.p=function(a){nj(this,a);I.p(a)};function nj(a,b){var c=a.m.indexOf(b);0<=c&&a.m.splice(c,1)}
function oj(a){var b,c,d,g;d=[];g=0;a.Lj=0;if(2<a.m.length){for(b=0;b<a.m.length;b+=1)rj(a.m[b])&&d.push(a.m[b]);for(b=0;b<d.length;b+=1)for(c=b+1;c<d.length;c+=1)lj(d[b],d[c])&&(g+=1);if(a.Sf){d=N.a.o.Zi.Xr;var h=N.a.o.Zi.Pr;for(b=c=0;b<a.m.length;b+=1)rj(a.m[b])&&(c+=1);(g<Math.min(c,d)||g>h)&&10>a.wd&&(g=0)}if(1>g)a.dj?(a.Sf=!0,a.wd+=1,a.Jq?a.Ul():a.pg=a.a.Ix):(a.Sf=!0,a.wd+=1,a.Ql()),a.dj=!1;else if(0<a.m.length&&a.Sf){a.wd=0;b=[];for(g=0;g<a.m.length;g+=1)rj(a.m[g])&&(b.push(a.m[g]),a.m[g].Vk=
!1);for(g=0;g<b.length;g+=1)if(!b[g].Vk)for(c=0;c<b.length;c+=1)if(lj(b[g],b[c])&&!b[c].Vk){a.ie.push(b[g]);a.ie.push(b[c]);b[g].Vk=!0;b[c].Vk=!0;break}for(g=a.m.length-1;0<=g;g-=1)for(c=0;c<a.ie.length;c+=1)a.m[g]===a.ie[c]&&a.m.splice(g,1);oj(a)}}else{for(b=0;b<a.ie.length;b+=1)a.m.push(a.ie[b]);a.ie=[];cj(a);a.dj=!0;a.wd=0;a.Sf=!1;a.Jq=!1}a.Sf||0===a.m.length&&yj(a)}
e.zy=function(){var a,b;this.bd&&this.bd.close();for(b=0;b<this.m.length;b+=1)this.m[b].wo=0,a=new zj(this.m[b],{wo:1.5},100,$b,this.yy,this),a.start()};e.yy=function(){this.o.Hl+=1;this.o.Hl>=this.o.m.length&&(this.o.Hl=0,this.o.wd+=1,this.hm=new fj(0,0,-Number.MAX_VALUE,this,0))};e.Ul=function(){var a;for(a=0;a<this.m.length;a+=1)this.m[a].wo=-1;uj(this,0,0);this.Mj=!0;this.dj=!1;this.Sf=!0};function uj(a,b,c){0===b&&(a.fh=0);0<=a.fh&&(a.fh+=.001*c,a.fh>=a.a.ky&&(a.fh=-1,H.play(ug)))}
function dj(a){var b;for(b=0;b<a.m.length;b+=1)a.m[b].Tg=a.tb(0,a.m[b]),a.m[b].Ff=a.tb(1,a.m[b]),a.m[b].Ad=a.tb(2,a.m[b]),a.m[b].Sg=a.tb(3,a.m[b]);2!==a.m.length||0!==a.ie.length||void 0===a.m[0].Ad&&void 0===a.m[1].Ad||(a.m[0].x=3*a.a.bg,a.m[0].y=2*a.a.oh,a.m[0].ji=3,a.m[0].aj=2,a.m[0].hb=1,a.m[1].x=5*a.a.bg,a.m[1].y=2*a.a.oh,a.m[1].ji=5,a.m[1].aj=2,a.m[1].hb=1,dj(a))}
e.tb=function(a,b){var c,d,g,h;for(c=0;c<this.m.length;c++)if(d=this.m[c],d!==b)switch(g=d.ji-b.ji,h=d.aj-b.aj,a){case 0:if(d.hb===b.hb&&-1===g&&1>Math.abs(h))return d;break;case 1:if(d.hb===b.hb&&1===g&&1>Math.abs(h))return d;break;case 2:if(d.hb===b.hb+1&&-1<g&&1>g&&1>Math.abs(h))return d;break;case 3:if(d.hb===b.hb-1&&-1<g&&1>g&&1>Math.abs(h))return d;break;default:throw"Unknown pos: "+a;}};function yj(a){a.pause=!0;0!==a.sf&&(a.sf=a.a.fv,a.e.Xa&&(a.e.Xa.cg=0))}
e.Nl=function(){var a=null,b,c=null,d=null,g;b=[];a=N.a.o.wf.sa;if(void 0===this.Ii&&0<a&&this.Lj>=a&&3<this.m.length){for(a=0;a<this.m.length;a+=1)rj(this.m[a])&&b.push(this.m[a]);for(a=0;a<b.length;a+=1)for(g=0;g<b.length;g+=1)lj(b[a],b[g])&&(c=b[a],d=b[g],g=a=b.length);c&&d&&(this.Ii=c,c.Nl(),d.Nl())}};function bj(a){a.m.sort(function(a,c){return c.depth-a.depth});return a.m}function ej(a,b){var c;for(c=0;c<a.m.length;c+=1)a.m[c].alpha=b}e.Ua=function(){this.f&&this.f.q(0,this.x,this.y)};
function zj(a,b,c,d,g,h){this.depth=9E3;this.visible=this.j=!1;this.group=0;this.node=a;this.attributes=b;this.duration=c;this.pb=g;this.Ou=d;this.time=0;this.o=h;this.$e={};for(var k in this.attributes)this.$e[k]=a[k];this.Pb={};for(var l in this.attributes)this.Pb[l]=this.attributes[l]-this.$e[l];K(this)}e=zj.prototype;
e.va=function(a){var b,c,d;this.time+=a;if(this.time<this.duration)for(var g in this.attributes)a=this.Pb[g],b=this.time,c=this.$e[g],d=this.duration,this.node[g]=this.Ou(b,c,a,d);else this.finish()};e.start=function(){this.j=!0};e.pause=function(){this.j=!1};e.Ql=function(){};e.Ul=function(){this.o.Ul()};e.finish=function(){for(var a in this.attributes)this.node[a]=this.attributes[a];this.j=!1;I.p(this);"undefined"!==typeof this.pb&&this.pb()};
function tj(a,b,c){this.depth=c;this.j=this.visible=!0;this.group=0;this.x=a;this.y=b;this.f=void 0;this.fj=this.Rl=-1;this.a=N.a.o.el;K(this)}tj.prototype.oc=function(a){var b=null,c=null;switch(this.Rl){case 0:b=this.a.Iu,c=tg}0<=this.Rl&&(this.fj+=.001*a,this.fj>=b&&c&&(this.Rl=this.fj=-1,H.play(c),I.p(this)))};tj.prototype.ro=function(a){this.Rl=a;this.fj=0};function Aj(){}Aj.prototype.Tq=function(a,b,c,d){return N.a.o.Bf.length<=a?null:(a=N.a.o.Bf[a].icon)?LevelMapIcons.gv(a,"locked"===d):null};
Aj.prototype.Vq=function(){var a,b,c;a=[];b=[Jd,Kd,Ld,Ld,Md];for(c=0;c<b.length;c+=1)a.push({f:b[c],text:N.i.r("TutorialText_"+c,"<TutorialText_"+c+">"),title:N.i.r("TutorialTitle_"+c,"<TutorialTitle_"+c+">")});return a};N.version=N.version||{};N.version.theme="1.0";
if("Internet Explorer"==m.name){for(var Bj=[],Cj=0;Cj<N.a.u.options.buttons.startScreen.length;Cj++)1!=Cj&&Bj.push(N.a.u.options.buttons.startScreen[Cj]);N.a.u.options.buttons.startScreen=Bj;for(var Dj=[],Cj=0;Cj<N.a.u.options.buttons.levelMapScreen.length;Cj++)1!=Cj&&Dj.push(N.a.u.options.buttons.levelMapScreen[Cj]);N.a.u.options.buttons.levelMapScreen=Dj;for(var Ej=[],Cj=0;Cj<N.a.u.options.buttons.inGame.length;Cj++)2!=Cj&&Ej.push(N.a.u.options.buttons.inGame[Cj]);N.a.u.options.buttons.inGame=Ej}
var Ui=O(16),Vi=O(12),Si=O(85),Ti=O(84),Xi=Xi||{},qi=O(14),ri=O(40),pi={},Yi={background:{f:$e,fr:O(0),gr:O(37),elements:[{L:"game_ui_time_left",x:O(6)+qi,y:O(95)+ri,Lb:O(118),Sb:O(16),ke:.2,font:Zf,pf:{fillColor:"#0d4304",fontSize:O(18),Vd:"lower",align:"center",h:"top"}},{L:"game_ui_SCORE",x:O(15)+qi,y:O(183)+ri,Lb:O(100),Sb:O(16),ke:.2,font:Zf,pf:{fillColor:"#0d4304",fontSize:O(20),Vd:"lower",align:"center",h:"top"}},{L:"game_ui_HIGHSCORE",x:O(13)+qi,y:O(302)+ri,Lb:O(100),Sb:O(34),ke:.2,font:Zf,
pf:{fillColor:"#0d4304",fontSize:O(16),Vd:"lower",align:"center",h:"top"}},{f:bf,x:O(48)+qi,y:O(52)+ri},{f:af,x:O(48)+qi,y:O(247)+ri}]},ms:{x:O(22)+qi,y:O(520)-O(80)+ri},time:{x:O(15)+qi,y:O(118)+ri,Lb:O(100),Sb:O(32),ke:.2,jp:!1,separator:"",font:Zf,pf:{fontSize:O(24),fillColor:"#A3c30d",align:"center",h:"top"}},us:{x:O(15)+qi,y:O(204)+ri,Lb:O(100),Sb:O(24),ap:50,ke:.2,jp:!1,separator:"",font:Zf,pf:{fontSize:O(18),fillColor:"#A3c30d",align:"center",h:"top"}},br:{x:O(15)+qi,y:O(325)+ri,Lb:O(100),
Sb:O(16),ke:.2,jp:!1,separator:"",font:Zf,pf:{fillColor:"#A3c30d",fontSize:O(18),align:"center",h:"top"}}},zi=Yi;
function fj(a,b,c,d,g){this.depth=c;this.j=this.visible=!0;this.group=0;this.an=!0;this.x=a;this.y=b;"undefined"!==typeof ImgRefreshMid&&(this.f=ImgRefreshMid);this.Bv=Ed;this.Ev=Fd;this.Cv=Dd;this.Dv=Cd;this.a=N.a.o.Zi;this.Zk=-Ed.width;this.Bo=2*Fd.width;this.Co=this.n=0;this.ul=this.refresh=!1;N.b.bb(this,N.yk);this.type=g;this.Yg=d;this.B=1===g?d:d.o;this.Xa=this.B.e.Xa;this.vc=N.a.o.el.Lu;K(this)}fj.prototype.Tb=function(){Fj(this);this.Yg.pause=!0};
fj.prototype.oc=function(a){var b;b=this.B.dj;this.n>=.8*this.vc&&this.Yg.Mj&&(this.n=.3*this.vc);this.n>=.8*this.vc&&b&&!this.ul?(this.n=.8*this.vc,this.ul=!0,ej(this.B,1),Gj(this)):this.n>=.8*this.vc&&!b&&oj(this.B);if(this.n<this.vc)this.n+=.001*a,this.n>this.vc&&(this.n=this.vc);else if(this.ul){if(dh(N.e)){var c=this;N.hb.$q?this.Xa.cg=1:(Hj(function(){c.Xa.cg=1},this),N.hb.$q=!0)}else this.Xa.cg=2;I.p(this);this.Yg.hm=void 0}this.canvas.Y=!0;this.Co+=.001*a};
function Fj(a){var b,c;b=0===a.type?new zj(a,{Zk:0},200*a.vc,ac,function(){a.an=!1;a.Yg.Ul()},a.Yg):new zj(a,{Zk:0},200*a.vc,ac,function(){a.an=!1});c=new zj(a,{Bo:Fd.width},200*a.vc,ac,function(){});H.play(wg);b.start();c.start()}function Gj(a){var b,c;c=200*a.vc;b=new zj(a,{Zk:-Ed.width},c,ac,function(){});c=new zj(a,{Bo:2*Fd.width},c,ac,function(){});H.play(vg);a.Yg.pause=!1;b.start();c.start()}
fj.prototype.Ua=function(){var a,b,c;a=this.vc;c=20<this.n/(.01*a)&&80>this.n/(.01*a)?!0:!this.ul&&!this.an;this.n<=.2*this.a.ts||this.n>=.8*this.a.ts||(this.refresh=!0);a=p.canvas.width/2+1;b=p.canvas.height/2+1;this.Bv.q(0,this.Zk,0);this.Ev.q(0,this.Bo,0);c&&(this.f&&this.f.q(0,a+N.Bi,b+N.Ci),this.Cv.ya(0,a,b,1,1,500*-this.Co,1),this.Dv.ya(0,a,b,1,1,0,1))};
new function(){$.j||($.mr(),$.xs(!0));this.mc=$.jq($.dm);this.a=N.a.o.Kx;this.dd=this.a.to;this.ed=this.a.rb;this.pt=this.dd+this.ed;this.rt=this.a.sq||0;this.mc.Kc=Yb;this.mc.Lc=hc([Yb,L],[!1,!1],[this.dd,this.ed]);var a=hc([Yb,L],[!1,!1],[this.dd,this.ed]);this.mc.Jc=function(b,c,d,g){return a(b,1,-1,g)};this.mc.ok=hc([M,Yb],[!1,!1],[this.dd,this.ed]);this.mc.pk=hc([M,Yb],[!1,!1],[this.dd,this.ed])};
var pj=new function(){function a(a,b,g,h){return M(a,b,g,h)}$.j||($.mr(),$.xs(!0));this.mc=$.jq($.dm);this.a=N.a.o.Ry;this.dd=this.a.to;this.ed=this.a.rb;this.pt=this.dd+this.ed;this.rt=this.a.sq||0;this.mc.Kc=Yb;this.mc.Lc=hc([Yb,L],[!1,!1],[this.dd,this.ed]);var b=hc([Yb,L],[!1,!1],[this.dd,this.ed]);this.mc.Jc=function(a,d,g,h){return b(a,1,-1,h)};this.mc.ok=hc([a,Yb],[!1,!1],[this.dd,this.ed]);this.mc.pk=hc([a,Yb],[!1,!1],[this.dd,this.ed])};N.a.u.Sl.Gg=O(60);N.a.u.Tl.Vi=O(530);
N.a.u.gi.classic={font:{t:V.t,fontSize:O(45),align:"center",h:"middle",fillColor:"#733900",be:-.15,T:{j:!0,blur:2,color:"#f3da5c",offsetX:0,offsetY:2}}};N.a.M.buttons={default_color:"classic",bigPlay:"classic"};N.a.M.De={lu:[{w:"undefined"!==typeof tf?tf:void 0,x:0,y:0}],Jb:{t:V.t,align:"center",h:"middle",fillColor:"#ffc600",fontSize:O(26)},To:-1E3,so:-1E3,So:{t:V.t,fontSize:O(26),fillColor:"#27900f",align:"center"},zl:{t:V.t,fontSize:O(26),fillColor:"#27900f",align:"center"}};
N.a.M.ia={Db:{align:"center"},kb:O(22),Si:"undefined"!==typeof s_overlay_endless?-s_overlay_endless.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof xf?-xf.height:0,oo:[{type:"y",sa:0,duration:800,end:O(14),Oa:M,Zj:!0}],js:[{type:"y",sa:0,duration:600,end:"undefined"!==typeof s_overlay_endless?-s_overlay_endless.height:"undefined"!==typeof s_overlay_difficulty?-s_overlay_difficulty.height:"undefined"!==typeof xf?-xf.height:0,Oa:bc,Zj:!0}],Zb:O(50),
Jb:{t:V.t,align:"center",h:"top",fontSize:O(26),fillColor:"#ff8900"},dz:!0,qk:{t:V.t,align:"center",h:"top",fillColor:"#ffc600",fontSize:O(26)},Cg:O(186),Bg:{t:V.t,align:"center",h:"top",fillColor:"#ffffff",fontSize:O(50)},jh:{t:V.t,h:"bottom",fillColor:"#ffc600",fontSize:O(26)},Sc:O(4),Le:{t:V.t,h:"bottom",fillColor:"#ffffff",fontSize:O(26)},Xo:{t:V.t,align:"center",h:"middle",fontSize:O(26),fillColor:"#ff8900"}};
N.a.M.options={kb:O(5),Gf:800,Hf:M,Ug:600,Vg:bc,Yi:{align:"center",h:"middle",fontSize:O(26),fillColor:"#ffc600",aa:O(6)},Zb:O(41),Jb:{t:V.t,align:"center",h:"top",fontSize:O(26),fillColor:"#ffc600"},oj:{h:"middle",align:"center",fontSize:O(26),fillColor:"#78381d"},pj:{align:"center",h:"top",fontSize:O(26),fillColor:"#78381d"}};
N.a.M.bd={Gf:800,Hf:M,Ug:600,Vg:bc,uo:{t:V.t,align:"center",h:"middle",fontSize:O(30),fillColor:"#ffc600",aa:O(6)},Wo:{t:V.t,align:"center",h:"middle",fontSize:O(24),fillColor:"#ffc600",aa:O(6)},El:O(460),Dl:O(210),cf:{align:"bottom",offset:O(-30)},rs:{align:"center",offset:O(70)},kb:O(3)};N.a.u.options.ad=0;N.a.M.options.cf={align:"center",offset:35};
function qj(a,b,c,d,g,h){this.depth=0;this.j=this.visible=!0;this.group=0;this.x=a;this.y=b;this.f=h.f;this.Ti=g;this.ci=0;this.Rp=!1;this.a=N.a.o.Hx;this.ot=h;this.B=d;this.alpha=100;N.b.bb(this,N.yk);K(this)}
qj.prototype.oc=function(a){this.ci+=a;this.alpha=1-this.ci/(13*this.a.Od);this.canvas.Y=!0;if(this.ci>=this.a.Zx&&(void 0===this.Ti||this.Rp||(new qj(this.Ti.x,this.Ti.y,0,this.B,void 0,this.Ti),this.Rp=!0),void 0!==this.ot)){a=I;var b=a.vb.indexOf(this.ot);0>b||(a.vb[b]=void 0)}this.ci>=13*this.a.Od&&(void 0===this.Ti&&1>this.B.m.length&&this.B.Ex&&yj(this.B),I.p(this),this.canvas.Y=!0)};qj.prototype.Ua=function(){this.f&&this.f.Ic(0,this.x+N.Bi,this.y+N.Ci,this.alpha)};N.version=N.version||{};
N.version.configuration_poki_api="1.0.0";N.l=N.l||{};N.l.mi=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
N.l.uq=function(a,b,c,d){var g={};N.l.mi(a.Gj,g);g.fontSize=O(18);d=N.b.g(a.Xh,d.height,O(22));d=a.Vh-d;var h=N.i.r("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.Ij,a.Xh,a.Hj,O(22)),k=c(Cf,a.Yh,k-28),k=k+O(6),g={};N.l.mi(a.Zh,g);g.fontSize=O(18);k=b("CoolGames\nwww.coolgames.com",g,a.ng,k,a.Xe,O(44));C(U.N(),g);k+=O(58)+Math.min(0,d-O(368));g={};N.l.mi(a.Gj,g);g.fontSize=O(20);g.fillColor="#1A2B36";h=N.i.r("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.Ij,
k,a.Hj,O(22));k+=O(6);k=c(Df,a.Yh,k);k+=O(12);g={};N.l.mi(a.Zh,g);g.fontSize=O(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.ng,k,a.Xe,O(22));k+=O(16);g={};N.l.mi(a.Zh,g);b("\u00a9 2020",g,a.ng,k,a.Xe,O(44));return[]};N.l.Di=function(){return[]};N.l.Fc=function(){N.e.Fc()};
N.l.Ik=function(){function a(){__flagPokiInitialized?(function(){/*  function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})() */ }(),N.e.Fc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=N.a.u.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};N.l.cl=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};N.l.Jk=function(){PokiSDK.gameLoadingFinished();N.e.Fc()};
N.l.Ds=function(a){try{N.e.Ln(),jb("master"),PokiSDK.commercialBreak().then(function(){N.e.Ei();kb("master");a()})["catch"](function(a){console.log("error"+a);N.e.Ei();kb("master")})}catch(b){console.log("error"+b),N.e.Ei()}};N.l.lr=function(){N.l.Ds(function(){PokiSDK.gameplayStart()})};N.l.Lg=function(){N.l.Ds(function(){N.e.Fc()})};N.l.zA=function(){PokiSDK.happyTime(.5)};N.l.kr=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
N.l.Uq=function(a,b){void 0===N.e.ce&&(N.e.ce=new Gg(!0));Hg(a,b)};N.l.ip=function(a){void 0===N.e.ce&&(N.e.ce=new Gg(!0));Ig(a)};N.l.kd=function(a){window.open(a)};N.l.fe=function(a){"inGame"===a&&PokiSDK.gameplayStop()};N.l.Au=function(a){"inGame"===a&&PokiSDK.gameplayStart()};N.l.Hv=function(){};N=N||{};N.Pp=N.Pp||{};N.Pp.Mz={Uz:""};
function Ij(){this.depth=-1E6;this.j=this.visible=!0;this.Ha=N.Wd;this.end=this.ia=this.Rn=this.Qn=this.load=this.Wb=!1;this.kn=0;this.np=this.uj=!1;this.state="GAME_INIT";this.screen=null;this.ds=this.fb=this.G=0;this.ln=!1;this.al=this.bl=!0;this.Mw=1;this.jc=!1;this.xc={};this.ja={difficulty:1,playMusic:!0,playSFX:!0,language:N.i.An()};window.addEventListener("gameSetPause",this.Ln,!1);window.addEventListener("gameResume",this.Ei,!1);document.addEventListener("visibilitychange",this.sv,!1);this.dg=
"timedLevelEvent"}e=Ij.prototype;e.Ln=function(){H.pause("master");I.pause()};e.Ei=function(){H.$i("master");ub(I);zb(I);Db(I);I.$i()};e.sv=function(){document.hidden?N.e.Ln():N.e.Ei()};
e.vm=function(){var a,b=this;void 0!==N.a.M.background&&void 0!==N.a.M.background.color&&(document.body.style.background=N.a.M.background.color);N.Ca=new Pg;N.C.Nk&&N.C.Nk.j&&(b.zt=mi(function(a){b.zt=a}));N.k=N.a.o.qf||{};N.k.yd=N.k.yd||"level";N.k.Rf=void 0!==N.k.Rf?N.k.Rf:"level"===N.k.yd;N.k.U=void 0!==N.k.U?N.k.U instanceof Array?N.k.U:[N.k.U]:[20];N.k.zg=void 0!==N.k.zg?N.k.zg:"locked";N.k.bj=void 0!==N.k.bj?N.k.bj:"difficulty"===N.k.yd;N.k.sj=void 0!==N.k.sj?N.k.sj:!1;N.k.Lo=void 0!==N.k.Lo?
N.k.Lo:"level"===N.k.yd;N.k.hf=void 0!==N.k.hf?N.k.hf:"max";N.k.Of=void 0!==N.k.Of?N.k.Of:"number";N.l.Uq(null,function(a){var d,g,h;a&&(b.xc=a);b.ja=Rg("preferences",{});b.ja.difficulty=void 0!==b.ja.difficulty?b.ja.difficulty:1;void 0!==N.k.Zs&&0>N.k.Zs.indexOf(fh())&&(b.ja.difficulty=N.k.Zs[0]);b.ja.playMusic=void 0!==b.ja.playMusic?b.ja.playMusic:!0;b.Kf(b.ja.playMusic);b.ja.playSFX=void 0!==b.ja.playSFX?b.ja.playSFX:!0;b.yl(b.ja.playSFX);b.ja.language=void 0!==b.ja.language&&N.i.Jv(b.ja.language)?
b.ja.language:N.i.An();N.i.Bs(b.ja.language);void 0===oh(b.G,0,"state",void 0)&&Jj(b.G,0,"state","unlocked");if(N.k.Rf)if("locked"===N.k.zg)for(h=!1,d=0;d<N.k.U.length;d++){for(a=0;a<N.k.U[d];a++)if(g=oh(d,a,"state","locked"),"locked"===g){b.G=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.ja.lastPlayed&&(b.G=b.ja.lastPlayed.world||0)});b.xh=Kj();void 0!==b.xh.authToken&&void 0!==b.xh.challengeId&&(b.jc=!0);N.C.wB&&(this.ab=this.tB?new TestBackendServiceProvider:new BackendServiceProvider,
this.ab.or(function(a){a&&N.e.ab.IA(b.xh.authToken)}));a=parseFloat(m.A.version);H.Qa&&(m.Na.op&&m.A.ol||m.A.lh&&a&&4.4>a)&&(H.Ej=1);this.Wb=!0;this.Qk=0};function Kj(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function Lj(a){a.state="GAME_LOAD";a.screen=new $g(function(){N.e.load=!0;di(N.e,!0);N.ud.Jk();N.l.Jk()},function(a){N.ud.cl(a);N.l.cl(a)},N.C.lB)}
function di(a,b){a.uj=b||!1;a.np=!0;a.kn++}
function Mj(){var a=N.e;a.kn--;switch(a.state){case "GAME_INIT":a.Wb&&!a.xB&&(a.jc&&a.ab&&a.ab.nB(a.xh.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Ko&&a.screen.Ko("challengeLoadingError_notValid")}),Lj(a));break;case "GAME_LOAD":if(a.load){if(a.jc&&a.ab)if(a.ab.Iv())dh(a),gh(a.nb.mode);else{a.screen.Ko("challengeLoadingError_notStarted");break}I.p(a.screen);"function"===typeof Aj&&(N.o=new Aj);void 0!==N.C.Yp&&!1!==N.C.Yp.show&&N.b.Zt();ci(a)}break;case "LEVEL_INIT":a.Qn&&Nj(a);
break;case "LEVEL_LOAD":a.Rn&&Oj(a);break;case "LEVEL_END":if(a.ia)switch(bi(),N.e.Qn=!1,N.e.Rn=!1,N.hb=void 0,N.b.Xd(N.Fg).Y=!0,N.b.Xd(N.Fk).Y=!0,N.e.vr){case "retry":kh(N.e,N.e.fb);break;case "next":N.k.Rf?N.e.fb+1<N.k.U[N.e.G]?kh(N.e,N.e.fb+1):N.e.G+1<N.k.U.length?kh(N.e,0,N.e.G+1):N.k.Lo?(N.e.state="GAME_END",N.e.end=!0,di(N.e,!1),N.l.nv()):N.e.screen=new jh:kh(N.e,0);break;case "exit":N.k.Rf?N.e.screen=new jh:ci(N.e)}break;case "GAME_END":a.end&&(a.end=!1,N.e.screen=null,N.e.screen=new ei)}}
e.Fc=function(){N.e.np=!1};function Xh(){var a;if(void 0!==N.e.xh.more_games)try{return a=decodeURIComponent(N.e.xh.more_games),function(){N.l.kd(a)}}catch(b){}if("string"===typeof N.ah.moreGamesUrl&&""!==N.ah.moreGamesUrl)return function(){N.l.kd(N.ah.moreGamesUrl)};if(void 0!==N.C.Gw)return function(){N.l.kd(N.C.Gw)};if("function"===typeof N.l.qv)return N.l.qv}function dh(a){if(a.jc&&void 0!==a.ab)return void 0===a.nb&&(a.nb=a.ab.rA()),a.nb}e.vi=function(a){N.e.jc&&N.e.ab&&N.e.ab.vi(a)};
e.ug=function(a){N.e.jc&&N.e.ab&&N.e.ab.ug(a)};function fh(){return N.e.ja.difficulty}function ai(){switch(fh()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+fh();}}function Ei(){var a="optionsDifficulty_"+ai();return N.i.r(a,"<"+a+">")}function gh(a){N.e.ja.difficulty=a;Tg("preferences",N.e.ja)}e.Kf=function(a){void 0!==a&&(N.e.ja.playMusic=a,Tg("preferences",N.e.ja),a?kb("music"):jb("music"));return N.e.ja.playMusic};
e.yl=function(a){void 0!==a&&(N.e.ja.playSFX=a,Tg("preferences",N.e.ja),a?(kb("game"),kb("sfx")):(jb("game"),jb("sfx")));return N.e.ja.playSFX};e.language=function(a){void 0!==a&&(N.e.ja.language=a,Tg("preferences",N.e.ja));return N.e.ja.language};function hi(a){return"time"===N.k.Of?(0>a?"-":"")+Math.floor(Math.abs(a)/60)+(10>Math.abs(a%60)?":0":":")+Math.abs(a%60):""+a}
function Jj(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===N.e.xc["level_"+a+"_"+b]&&(N.e.xc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?N.e.xc["level_"+a+"_"+b][g]=d:N.e.xc["level_"+a+"_"+b][g][c]=d;N.l.ip(N.e.xc)}function oh(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=N.e.xc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function Rg(a,b){var c,d;"game"!==c&&(c="tg");d=N.e.xc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}
function Tg(a,b){var c;"game"!==c&&(c="tg");void 0===N.e.xc.game&&(N.e.xc.game={tg:{},game:{}});void 0===a?N.e.xc.game[c]=b:N.e.xc.game[c][a]=b;N.l.ip(N.e.xc)}function vh(a,b,c,d){void 0===c&&(c=a.fb);void 0===d&&(d=a.G);return void 0===b?oh(d,c,"stats",{}):oh(d,c,"stats",{})[b]}
function ni(a){var b,c,d=N.e;if(void 0===c&&void 0!==a){var g=a;for(c=0;c<N.k.U.length&&!(g<N.k.U[c]);c++)g-=N.k.U[c];c=g;if(void 0===b){var h=g=0;for(b=0;b<N.k.U.length;b++){h+=N.k.U[b];if(h>a)break;g+=1}b=g}}a=vh(d,"highScore",c,b);return"number"!==typeof a?0:a}function Pj(){var a,b,c,d=0;for(a=0;a<N.k.U.length;a++)for(b=0;b<N.k.U[a];b++)c=vh(N.e,void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}
function ci(a){a.screen&&I.p(a.screen);a.screen=new ch;a.fb=-1}
function Mi(a,b,c,d){var g;g=void 0!==N.a.M.Hi&&void 0!==N.a.M.Hi.backgroundImage?N.a.M.Hi.backgroundImage:void 0!==N.a.u.Hi?N.a.u.Hi.backgroundImage:void 0;N.b.mb(N.rf);a=a||0;b=b||0;c=c||p.width;d=d||p.height;if(g)if(c=Math.min(Math.min(c,p.width),g.ki),d=Math.min(Math.min(d,p.height),g.xg),void 0!==g){var h=a,k=b-N.Wj,l,n,q;for(l=0;l<g.I;l+=1)n=l%g.Zg*g.width,q=g.height*Math.floor(l/g.Zg),n>h+c||n+g.width<h||q>k+d||q+g.height<k||g.na(l,h-n,k-q,c,d,a,b,1)}else pa(a,b,c,d,"white",!1)}
function kh(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.G=c);a.fb=b;a.Qn=!0;di(a,!1);N.l.ov()}function Nj(a){a.state="LEVEL_LOAD";a.Rn=!0;di(a,!1);N.l.pv()}
function Oj(a){var b,c=0;if(a.G<N.k.U.length&&a.fb<N.k.U[a.G]){a.state="LEVEL_PLAY";a.ds+=1;a.ia=!1;a.screen=null;Mi(0,N.Wj);b=N.Ca;var d=$h(a,3),g="progression:levelStarted:"+ai(),h=a.dg,k;for(k=0;k<b.ba.length;k++)if(!b.ba[k].j){b.ba[k].n=0;b.ba[k].paused=0;b.ba[k].j=!0;b.ba[k].Wu=d;b.ba[k].lx=g;b.ba[k].tag=h;break}k===b.ba.length&&b.ba.push({j:!0,n:0,paused:0,Wu:d,lx:g,tag:h});b.Va(d,g,void 0,N.ea.gc.zp);b.Va("Start:","progression:levelStart:"+d,void 0,N.ea.gc.wj);for(b=0;b<a.G;b++)c+=N.k.U[b];
N.l.lr(a.G,a.fb);a.ja.lastPlayed={world:a.G,level:a.fb};N.hb=new Wi(c+a.fb)}}function ph(a,b,c){var d=0;void 0===b&&(b=a.G);void 0===c&&(c=a.fb);for(a=0;a<b;a++)d+=N.k.U[a];return d+c}function Hj(a,b){var c=N.e;c.jc&&(c.nb.Gc!==c.nb.ye||N.C.zu&&N.C.zu.kB)?new fi("challengeStartTextTime",a,b):"function"===typeof a&&(b?b.S():a())}function $h(a,b){var c,d=a.fb+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function ij(a,b){var c,d,g,h,k;a.jc?(b=Math.floor(b),a.nb.ye===a.nb.Gc?(d=function(b){a.Xb&&"function"===typeof a.Xb.nd&&(b?(a.Xb.nd(N.i.r("challengeEndScreenChallengeSend_success","<CHALLENGESENDTEXT>")),a.nb.Us?Qh(a.Xb,N.i.r("challengeEndScreenChallengeSend_submessage_stranger","")):(k=a.nb.ld[1],k=13<k.length?k.substr(0,10)+"...":k,Qh(a.Xb,N.i.r("challengeEndScreenChallengeSend_submessage","<CHALLENGESENDSUBMESSAGE>").replace(/<NAME>/g,k)))):a.Xb.nd(N.i.r("challengeEndScreenChallengeSend_error",
"<CHALLENGESENDERROR>")))},h=function(b){b?a.Xb.nd(N.i.r("challengeCancelMessage_success","<CHALLENGECANCELSUCCESS>")):a.Xb.nd(N.i.r("challengeCancelMessage_error","<CHALLENGECANCELERROR>"))},c=function(){a.ab&&a.ab.ug(h)}):(d=function(b){a.Xb&&"function"===typeof a.Xb.nd&&(b||a.Xb.nd(N.i.r("challengeEndScreenScoreSend_error","<CHALLENGESCORESENDERROR>")))},g=function(b){a.Xb&&"function"===typeof a.Xb.yt&&a.Xb.yt(b)}),a.state="LEVEL_END",a.Xb=new Ph(b,function(){a.ab&&a.ab.qB(b,N.k.Of,d,g)},c)):jj(a,
{totalScore:b})}
function jj(a,b){function c(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===N.k.hf&&a>b||"min"===N.k.hf&&a<b?!0:!1}a.state="LEVEL_END";var d,g,h,k,l,n,q={},w=$h(a,3);b=b||{};b.level=N.k.sj?a.fb+1:ph(a)+1;b.hr=!1;g=(d=oh(a.G,a.fb,"stats",void 0))||{};if(void 0!==b.xd||void 0!==b.ub){void 0!==b.xd&&(q[b.xd.id]=b.xd.N(),"highScore"===b.xd.id&&(n=b.xd));if(void 0!==b.ub)for(k=0;k<b.ub.length;k++)q[b.ub[k].id]=b.ub[k].N(),"highScore"===b.ub[k].id&&(n=b.ub[k]);for(k in q)l=q[k],void 0!==
l.Pe&&(q[l.Yl].lc=l.Pe(q[l.Yl].lc));void 0!==q.totalScore&&(h=q.totalScore.lc)}else h=b.totalScore,void 0!==h&&void 0!==b.timeBonus&&(h+=b.timeBonus);k="";if(!0!==b.failed){k="Complete:";if(void 0!==h){N.Ca.Va(k,"level:"+w,h,N.ea.gc.wj);if(void 0===d||c(h,d.highScore))g.highScore=h,b.hr=!0,N.Ca.Va("highScore",":score:"+ai()+":"+w,h,N.ea.gc.qm);void 0!==n&&(n.lc=g.highScore);b.highScore=g.highScore}if(void 0!==b.stars){if(void 0===g.stars||g.stars<b.stars)g.stars=b.stars;N.Ca.Va("stars",":score:"+
ai()+":"+w,b.stars,N.ea.gc.qm)}a.fb+1<N.k.U[a.G]?"locked"===oh(a.G,a.fb+1,"state","locked")&&Jj(a.G,a.fb+1,"state","unlocked"):a.G+1<N.k.U.length&&"locked"===oh(a.G+1,0,"state","locked")&&Jj(a.G+1,0,"state","unlocked");Jj(a.G,a.fb,void 0,{stats:g,state:"played"});void 0!==a.ab&&(d=N.o&&N.o.iv?N.o.iv():Pj(),void 0!==d&&a.ab.rB(d,N.k.Of));Vg(N.Ca,a.dg,w,"progression:levelCompleted:"+ai())}else N.Ca.Va("Fail:","level:"+w,h,N.ea.gc.wj),Vg(N.Ca,a.dg,w,"progression:levelFailed:"+ai());var A={totalScore:h,
level:b.level,highScore:b.highScore,failed:!0===b.failed,stars:b.stars,stage:b.stage};h=function(a){N.e.ia=!0;N.e.vr=a;di(N.e,!0);N.l.Lg(A);N.ud.Lg(A)};N.l.en&&N.l.en();void 0===b.customEnd&&(a.Xb=new wh(N.k.yd,b,h))}e.cj=function(){N.e.fe(!0)};e.fe=function(a,b,c){var d="inGame";N.e.screen instanceof ch?d="startScreen":N.e.screen instanceof jh?d="levelMapScreen":b&&(d=N.e.nb.Gc===N.e.nb.ye?"inGame_challenger":"inGame_challengee");N.e.Nd||(N.e.Nd=new Uh(d,!0===a,b,c))};
function Ri(a,b){var c=[],d,g,h,k,l;N.e.Nd||N.e.se||(N.e.nb.Gc===N.e.nb.ye?(d=N.i.r("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),g="challengeCancelConfirmBtn_yes",h="challengeCancelConfirmBtn_no",l=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=N.i.r(b,"<"+b.toUpperCase()+"<");N.e.se&&ji(b);a&&Jh()},k=function(){"function"===typeof b&&b(!0);N.e.ug(l);return!0}):(d=N.i.r("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),g="challengeForfeitConfirmBtn_yes",
h="challengeForfeitConfirmBtn_no",l=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=N.i.r(b,"<"+b.toUpperCase()+"<");if(N.e.se&&(ji(b),a)){var b=N.i.r("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",N.e.nb.ld[N.e.nb.ye]),b=b.replace("<AMOUNT>",N.e.nb.Jt),c=N.e.se,d,g,h,k;d=U.N();c.a.Wo&&C(d,c.a.Wo);g=Na(d,b,c.a.wx,c.a.vx,!0);g<d.fontSize&&D(d,g);g=d.da(b,c.a.El)+10;h=d.W(b,c.a.Dl)+10;k=N.b.fa(c.a.xx,c.c.f.width,g,d.align);h=N.b.fa(c.a.yx,c.c.f.height-
ii(c),h,d.h);y(c.c.f);d.q(b,k,h,g);z(c.c.f)}a&&Jh()},k=function(){"function"===typeof b&&b(!0);N.e.vi(l);return!0}),c.push({L:g,S:k,ca:N.e}),c.push({L:h,S:function(){N.e.se.close();N.e.se=null;"function"===typeof b&&b(!1);return!0}}),N.e.se=new Th(d,c,a),N.e.Nd=N.e.se)}e.po=function(){var a,b;b=Mb("game");for(a=0;a<b.length;a++)"function"===typeof b[a].Mn&&b[a].Mn();Wg();Nb("game");Fb()};
function Jh(a){var b,c;c=Mb();for(b=0;b<c.length;b++)"function"===typeof c[b].Mn&&c[b].Mn();Nb();Fb();Wg();a&&(a.P=Math.max(0,a.P-1));Ob("system")}function Oh(){var a,b;b=Mb();for(a=0;a<b.length;a++)"function"===typeof b[a].rv&&b[a].rv();Ob();a=I;for(b=0;b<a.pe.length;b+=1)a.pe[b].paused=Math.max(0,a.pe[b].paused-1);a=N.Ca;b=N.e.dg;var c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused-=1,a.ba[c].paused=Math.max(a.ba[c].paused,0))}
function bi(){var a;N.hb&&I.p(N.hb);for(a=Mb("LevelStartDialog");0<a.length;)I.p(a.pop())}function Ug(){var a="";N.version.builder&&(a=N.version.builder);N.version.tg&&(a+="-"+N.version.tg);N.version.game&&(a+="-"+N.version.game);N.version.config&&(a+="-"+N.version.config);return a}e.Tb=function(){this.Wb||(this.vm(),di(N.e,!0),N.ud.Ik(),N.l.Ik())};
e.va=function(a){"function"===typeof this.Nq&&(this.Nq(),this.Nq||N.e.Fc());0<this.kn&&(this.uj||this.np||Mj());700>this.Qk&&(this.Qk+=a,700<=this.Qk&&(N.C.vB&&void 0!==N.C.xi&&N.C.xi.Ak&&N.C.xi.Ml&&N.Ca.start([N.C.xi.Ak,N.C.xi.Ml]),void 0===oh(this.G,0,"state",void 0)&&Jj(this.G,0,"state","unlocked")))};e.hd=function(a,b){"languageSet"===a&&N.e.language(b)};e.oc=function(){var a,b;for(a=0;a<N.Pd.length;a++)b=N.Pd[a],b.Y&&(p.mb(b),p.clear())};
e.Ua=function(){var a;for(a=0;a<N.Pd.length;a++)N.Pd[a].Y=!1};N.ty=function(){N.e=new Ij;K(N.e);Lb(N.e,"system")};(void 0===N.gu||N.gu)&&N.l.mv();Ij.prototype.fe=function(a,b,c){var d="inGame";N.e.screen instanceof ch?d="startScreen":N.e.screen instanceof jh?d="levelMapScreen":b&&(d=N.e.nb.Gc===N.e.nb.ye?"inGame_challenger":"inGame_challengee");N.l.fe(d);N.e.Nd||(N.e.Nd=new Uh(d,!0===a,b,c))};Uh.prototype.close=function(){I.p(this);this.canvas.Y=!0;N.l.Au(this.type);return!0};
Sa.prototype.Bd=function(a,b){var c,d,g,h=1,k=Xa(this,a);this.Ra[a]=b;this.ic[a]&&delete this.ic[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.pa.indexOf(a)){for(g=0;g<d.pa.length;g+=1)void 0!==this.Ra[d.pa[g]]&&(h*=this.Ra[d.pa[g]]);h=Math.round(100*h)/100;if(this.Za){if(d=this.Kd[d.id])d.gain.value=h}else this.Qa&&(d.J.volume=h)}this.Za&&(d=this.Kd[a])&&(d.gain.value=b)};
}());
