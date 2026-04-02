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
var d,aa=document.getElementById("canvasBackground"),ba="big gameui_difficulty endscreen_difficulty levelselectscreen game_mahjong theme_ducklings landscape poki_api final".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var m=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),e=/tablet/i.test(this.userAgent),g=!e&&/[^-]mobi/i.test(this.userAgent);this.u={};this.Oa={};this.kf={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.u.opera=!0,this.u.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Oa.op=!0,this.u.nl=!0,this.u.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.u.nl=!0,this.u.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.u.dA=!0,this.u.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.u.chrome=!0,this.u.version=f(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.u.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.u.gB=!0,this.u.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.u.hB=!0,this.u.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.u.Hq=!0,this.u.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Oa.iA=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.u.Es=!0,this.u.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.u.lh=!0,this.u.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.u.QA=!0,this.u.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.u.Zp=!0,this.u.version=c||
f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.u.Pt=!0,this.u.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.kf.uB=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.u.Xp=!0,this.u.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.u.fz=!0,this.u.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name=
"Safari",this.u.Go=!0,this.u.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.u.yB=!0,!this.u.version&&c&&(this.u.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.u.pA=!0,this.u.version=this.u.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.Es?this.Oa.Cz=!0:a&&(this.Oa.Uk=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.op?c=f(this,
/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.Pt?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.Zp?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.Xp?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.fz&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Oa.version=c);c=c.split(".")[0];if(e||"ipad"==a||b&&(3==c||4==c&&!g)||this.Es)this.kf.et=!0;else if(g||"iphone"==a||"ipod"==a||b||this.Zp||this.Pt||this.Xp)this.kf.Wr=!0;this.Be={Th:!1,fi:!1,x:!1};this.nl&&10<=this.u.version||this.chrome&&20<=this.u.version||
this.Hq&&20<=this.u.version||this.Go&&6<=this.u.version||this.opera&&10<=this.u.version||this.Uk&&this.Oa.version&&6<=this.Oa.version.split(".")[0]?this.Be.Th=!0:this.nl&&10>this.u.version||this.chrome&&20>this.u.version||this.Hq&&20>this.u.version||this.Go&&6>this.u.version||this.opera&&10>this.u.version||this.Uk&&this.Oa.version&&6>this.Oa.version.split(".")[0]?this.Be.fi=!0:this.Be.x=!0;try{this.u.me=this.u.version?parseFloat(this.u.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.u.me=0}try{this.Oa.me=
this.Oa.version?parseFloat(this.Oa.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Oa.me=0}};function ca(a,b){this.x=a;this.y=b}d=ca.prototype;d.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};d.sq=function(a){var b=this.x-a.x;a=this.y-a.y;return Math.sqrt(b*b+a*a)};d.M=function(){return new ca(this.x,this.y)};d.add=function(a){return new ca(this.x+a.x,this.y+a.y)};d.scale=function(a){return new ca(a*this.x,a*this.y)};
d.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new ca(a*this.x+b*this.y,-b*this.x+a*this.y)};d.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new ca(0,0):new ca(this.x/a,this.y/a)};function da(a){return(new ca(a.y,-a.x)).normalize()}
d.dc=function(a,b,c){var e=Math.min(8,this.length()/4),g;g=this.normalize().scale(2*e);g=new ca(this.x-g.x,this.y-g.y);var h=g.add(da(this).scale(e)),e=g.add(da(this).scale(-e)),k=p.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+e.x,b+e.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function fa(a){this.Pi=4294967296;this.Th=1664525;this.fi=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Pi-1)):a}
fa.prototype.M=function(){var a=new fa;a.Pi=this.Pi;a.Th=this.Th;a.fi=this.fi;a.state=this.state;return a};fa.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Th*this.state+this.fi)%this.Pi;return this.state/this.Pi*b};new fa;function ga(){this.pe="";this.ym=[];this.Sh=[];this.Se=[];this.lg=[];this.Ac=[];this.ta("start");this.ta("load");this.ta("game")}function ha(a){var b=ia;b.pe=a;""!==b.pe&&"/"!==b.pe[b.pe.length-1]&&(b.pe+="/")}d=ga.prototype;
d.ta=function(a){this.Ac[a]||(this.Sh[a]=0,this.Se[a]=0,this.lg[a]=0,this.Ac[a]=[],this.ym[a]=!1)};d.loaded=function(a){return this.Ac[a]?this.Se[a]:0};d.Lc=function(a){return this.Ac[a]?this.lg[a]:0};d.complete=function(a){return this.Ac[a]?this.Se[a]+this.lg[a]===this.Sh[a]:!0};function ja(a){var b=ia;return b.Ac[a]?100*(b.Se[a]+b.lg[a])/b.Sh[a]:100}function ka(a){var b=ia;b.Se[a]+=1;b.complete(a)&&la("Load Complete",{Ya:a})}function ma(a){var b=ia;b.lg[a]+=1;la("Load Failed",{Ya:a})}
function na(a,b,c){var e=ia;e.Ac[b]||e.ta(b);e.Ac[b].push(a);e.Sh[b]+=c}d.Ed=function(a){var b;if(!this.ym[a])if(this.ym[a]=!0,this.Ac[a]&&0!==this.Ac[a].length)for(b=0;b<this.Ac[a].length;b+=1)this.Ac[a][b].Ed(a,this.pe);else la("Load Complete",{Ya:a})};var ia=new ga;function oa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.mb(a)}oa.prototype.mb=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};
oa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function pa(a,b,c,e,g,h){var k=p;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,e)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,e)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,e)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,e)));k.context.restore()}
function qa(a,b,c,e){var g=p;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,e);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
oa.prototype.mc=function(a,b,c,e,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=e,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=e,this.context.strokeText(a,b,c)):(void 0!==e&&(this.context.fillStyle=e,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};oa.prototype.da=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var p=new oa(aa);function ra(a,b,c){this.name=a;this.H=b;this.Vv=c;this.Bc=[];this.gn=[];na(this,this.Vv,this.H)}ra.prototype.Ed=function(a,b){function c(){ma(a)}function e(){ka(a)}var g,h;for(g=0;g<this.Bc.length;g+=1)h=this.gn[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.Bc[g].src=h,this.Bc[g].addEventListener("load",e,!1),this.Bc[g].addEventListener("error",c,!1)};
ra.prototype.complete=function(){var a;for(a=0;a<this.Bc.length;a+=1)if(!this.Bc[a].complete||0===this.Bc[a].width)return!1;return!0};function sa(a,b,c){0<=b&&b<a.H&&(a.Bc[b]=new Image,a.gn[b]=c)}ra.prototype.e=function(a,b){0<=a&&a<this.H&&(this.Bc[a]=b,this.gn[a]="")};ra.prototype.ma=function(a,b,c,e,g,h,k,l,n){this.Bc[a]&&this.Bc[a].complete&&(void 0===l&&(l=e),void 0===n&&(n=g),0>=e||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&p.context.drawImage(this.Bc[a],b,c,e,g,h,k,l,n))};
function r(a,b,c,e,g,h,k,l,n,q){this.name=a;this.Kd=b;this.H=c;this.width=e;this.height=g;this.Hb=h;this.Ib=k;this.ii=l;this.Ag=n;this.$g=q;this.Fd=[];this.Gd=[];this.Hd=[];this.Uc=[];this.Tc=[];this.pd=[];this.qd=[]}d=r.prototype;d.e=function(a,b,c,e,g,h,k,l){0<=a&&a<this.H&&(this.Fd[a]=b,this.Gd[a]=c,this.Hd[a]=e,this.Uc[a]=g,this.Tc[a]=h,this.pd[a]=k,this.qd[a]=l)};d.complete=function(){return this.Kd.complete()};
d.p=function(a,b,c){a=(Math.round(a)%this.H+this.H)%this.H;this.Kd.ma(this.Fd[a],this.Gd[a],this.Hd[a],this.Uc[a],this.Tc[a],b-this.Hb+this.pd[a],c-this.Ib+this.qd[a])};d.bd=function(a,b,c,e){var g=p.context,h=g.globalAlpha;g.globalAlpha=e;a=(Math.round(a)%this.H+this.H)%this.H;this.Kd.ma(this.Fd[a],this.Gd[a],this.Hd[a],this.Uc[a],this.Tc[a],b-this.Hb+this.pd[a],c-this.Ib+this.qd[a]);g.globalAlpha=h};
d.Da=function(a,b,c,e,g,h,k){var l=p.context;1E-4>Math.abs(e)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.H+this.H)%this.H,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(e,g),l.globalAlpha=k,this.Kd.ma(this.Fd[a],this.Gd[a],this.Hd[a],this.Uc[a],this.Tc[a],this.pd[a]-this.Hb,this.qd[a]-this.Ib),l.restore())};
d.xq=function(a,b,c,e,g,h){var k=p.context,l=k.globalAlpha;0!==this.width&&0!==this.height&&(a=(Math.round(a)%this.H+this.H)%this.H,k.globalAlpha=h,e/=this.width,g/=this.height,this.Kd.ma(this.Fd[a],this.Gd[a],this.Hd[a],this.Uc[a],this.Tc[a],b+e*this.pd[a],c+g*this.qd[a],e*this.Uc[a],g*this.Tc[a]),k.globalAlpha=l)};
d.ma=function(a,b,c,e,g,h,k,l){var n=p.context,q=n.globalAlpha,w,A,E,s;a=(Math.round(a)%this.H+this.H)%this.H;w=this.pd[a];A=this.qd[a];E=this.Uc[a];s=this.Tc[a];b-=w;c-=A;0>=b+e||0>=c+g||b>=E||c>=s||(0>b&&(e+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+e>E&&(e=E-b),c+g>s&&(g=s-c),n.globalAlpha=l,this.Kd.ma(this.Fd[a],this.Gd[a]+b,this.Hd[a]+c,e,g,h,k),n.globalAlpha=q)};
d.Ym=function(a,b,c,e,g,h,k,l,n,q,w,A){var E,s,t,u,v,K,ea,U,Y,Ba;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),E=Math.ceil((q-b)/h),s=Math.ceil((w-c)/k),b+=l,c+=n,Y=0;Y<E;Y+=1)for(Ba=0;Ba<s;Ba+=1)v=e,K=g,ea=h,U=k,t=b+Y*h,u=c+Ba*k,t<l&&(v+=l-t,ea-=l-t,t=l),t+ea>=l+q&&(ea=l+q-t),u<n&&(K+=n-u,U-=n-u,u=n),u+U>=n+w&&(U=n+w-u),0<ea&&0<U&&this.ma(a,v,K,ea,U,t,u,A)};d.pk=function(a,b,c,e,g,h,k,l,n,q){this.Ym(a,0,0,b,c,e,g,h,k,l,n,q)};
d.ok=function(a,b,c,e,g,h,k,l,n,q){var w=p.context,A=w.globalAlpha,E,s,t,u,v,K;a=(Math.round(a)%this.H+this.H)%this.H;E=l/e;s=n/g;t=this.pd[a];u=this.qd[a];v=this.Uc[a];K=this.Tc[a];b-=t;c-=u;0>=b+e||0>=c+g||b>=v||c>=K||(0>b&&(e+=b,l+=E*b,h-=E*b,b=0),0>c&&(g+=c,n+=s*c,k-=s*c,c=0),b+e>v&&(l-=E*(e-v+b),e=v-b),c+g>K&&(n-=s*(g-K+c),g=K-c),w.globalAlpha=q,this.Kd.ma(this.Fd[a],this.Gd[a]+b,this.Hd[a]+c,e,g,h,k,l,n),w.globalAlpha=A)};
d.wq=function(a,b,c,e,g,h,k,l,n,q,w){var A=p.context,E,s,t,u,v,K;0===Math.round(e)||0===Math.round(g)||1E-4>Math.abs(l)||1E-4>Math.abs(n)||(a=(Math.round(a)%this.H+this.H)%this.H,t=this.pd[a],u=this.qd[a],v=this.Uc[a],K=this.Tc[a],s=E=0,b-=t,c-=u,0>=b+e||0>=c+g||b>=v||c>=K||(0>b&&(e+=b,E-=b,b=0),0>c&&(g+=c,s-=c,c=0),b+e>v&&(e=v-b),c+g>K&&(g=K-c),A.save(),A.translate(h,k),A.rotate(-q*Math.PI/180),A.scale(l,n),A.globalAlpha=w,this.Kd.ma(this.Fd[a],this.Gd[a]+b,this.Hd[a]+c,e,g,E,s),A.restore()))};
function ta(a,b,c){var e,g,h;for(e=0;e<a.H;e+=1)g=b+e%a.$g*a.width,h=c+a.height*Math.floor(e/a.$g),a.Kd.ma(a.Fd[e],a.Gd[e],a.Hd[e],a.Uc[e],a.Tc[e],g-a.Hb+a.pd[e],h-a.Ib+a.qd[e])}function x(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Ib=this.Hb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.pl=void 0}d=x.prototype;
d.M=function(){var a=new x(this.width,this.height);a.Hb=this.Hb;a.Ib=this.Ib;y(a);this.p(0,0);z(a);return a};function y(a){a.pl=p.canvas;p.mb(a.canvas)}function z(a){p.canvas===a.canvas&&void 0!==a.pl&&(p.mb(a.pl),a.pl=void 0)}d.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};d.p=function(a,b){p.context.drawImage(this.canvas,a-this.Hb,b-this.Ib)};
d.bd=function(a,b,c){var e=p.context,g=e.globalAlpha;e.globalAlpha=c;p.context.drawImage(this.canvas,a-this.Hb,b-this.Ib);e.globalAlpha=g};d.Da=function(a,b,c,e,g,h){var k=p.context;1E-4>Math.abs(c)||1E-4>Math.abs(e)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,e),k.globalAlpha=h,p.context.drawImage(this.canvas,-this.Hb,-this.Ib),k.restore())};
d.xq=function(a,b,c,e,g){var h=p.context,k=h.globalAlpha;0!==this.width&&0!==this.height&&0!==Math.round(c)&&0!==Math.round(e)&&(h.globalAlpha=g,p.context.drawImage(this.canvas,a,b,c,e),h.globalAlpha=k)};d.ma=function(a,b,c,e,g,h,k){var l=p.context,n=l.globalAlpha;0>=c||0>=e||(a+c>this.width&&(c=this.width-a),b+e>this.height&&(e=this.height-b),l.globalAlpha=k,p.context.drawImage(this.canvas,a,b,c,e,g,h,c,e),l.globalAlpha=n)};
d.Ym=function(a,b,c,e,g,h,k,l,n,q,w){var A,E,s,t,u,v,K,ea,U,Y;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),e+h>this.height&&(h=this.height-e),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),A=Math.ceil((n-a)/g),E=Math.ceil((q-b)/h),a+=k,b+=l,U=0;U<A;U+=1)for(Y=0;Y<E;Y+=1)u=c,v=e,K=g,ea=h,s=a+U*g,t=b+Y*h,s<k&&(u+=k-s,K-=k-s,s=k),s+K>=k+n&&(K=k+n-s),t<l&&(v+=l-t,ea-=l-t,t=l),t+ea>=l+q&&(ea=l+q-t),0<K&&0<ea&&this.ma(u,v,K,ea,s,t,w)};
d.pk=function(a,b,c,e,g,h,k,l,n){this.Ym(0,0,a,b,c,e,g,h,k,l,n)};d.ok=function(a,b,c,e,g,h,k,l,n){var q=p.context,w=q.globalAlpha;0>=c||0>=e||(a+c>this.width&&(c=this.width-a),b+e>this.height&&(e=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,p.context.drawImage(this.canvas,a,b,c,e,g,h,k,l),q.globalAlpha=w))};
d.wq=function(a,b,c,e,g,h,k,l,n,q){var w=p.context;0>=c||0>=e||(a+c>this.width&&(c=this.width-a),b+e>this.height&&(e=this.height-b),1E-4>Math.abs(k)||1E-4>Math.abs(l)||(w.save(),w.translate(g,h),w.rotate(-n*Math.PI/180),w.scale(k,l),w.globalAlpha=q,p.context.drawImage(this.canvas,a,b,c,e,0,0,c,e),w.restore()))};
function ua(a,b,c,e){this.w=a;this.xz=b;this.hz=c;this.zj=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.at=!1;na(this,e,1)}function va(a,b,c){p.context.save();p.context.font="250pt "+a+", "+b;a=p.context.measureText(c).width;p.context.restore();return a}
function wa(a){var b,c,e;for(b=0;b<a.zj.length;b+=1)if(c=a.zj[b],e=va(a.w,c.font,c.text),c.width!==e){ka(a.Uv);document.body.removeChild(a.ne);a.at=!0;return}window.setTimeout(function(){wa(a)},33)}
ua.prototype.Ed=function(a,b){var c="@font-face {font-family: "+this.w+";src: url('"+b+this.xz+"') format('woff'), url('"+b+this.hz+"') format('truetype');}",e=document.createElement("style");e.id=this.w+"_fontface";e.type="text/css";e.styleSheet?e.styleSheet.cssText=c:e.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(e);this.ne=document.createElement("span");this.ne.style.position="absolute";this.ne.style.left="-9999px";this.ne.style.top="-9999px";this.ne.style.visibility=
"hidden";this.ne.style.fontSize="250pt";this.ne.id=this.w+"_loader";document.body.appendChild(this.ne);for(c=0;c<this.zj.length;c+=1)e=this.zj[c],e.width=va(e.font,e.font,e.text);this.Uv=a;wa(this)};ua.prototype.complete=function(){return this.at};
function B(a,b){this.w=a;this.ri=b;this.fontWeight=this.fontStyle="";this.zd="normal";this.fontSize=12;this.fill=!0;this.lf=1;this.Mc=0;this.fillColor="black";this.ed={f:void 0,Eb:0,Ao:!0,Bo:!0};this.Wa={rj:!0,H:3,fk:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Yf=1;this.mh=0;this.strokeColor="black";this.strokeStyle=void 0;this.Sc=1;this.je=!1;this.Zf="miter";this.U={k:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.h="top";
this.V=this.za=0}d=B.prototype;
d.M=function(){var a=new B(this.w,this.ri);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.zd=this.zd;a.fontSize=this.fontSize;a.fill=this.fill;a.lf=this.lf;a.Mc=this.Mc;a.fillColor=this.fillColor;a.ed={f:this.ed.f,Ao:this.ed.Ao,Bo:this.ed.Bo};a.Wa={rj:this.Wa.rj,H:this.Wa.H,fk:this.Wa.fk.slice(0),size:this.Wa.size,offset:this.Wa.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Yf=this.Yf;a.mh=this.mh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.Sc=this.Sc;a.je=
this.je;a.Zf=this.Zf;a.U={k:this.U.k,color:this.U.color,offsetX:this.U.offsetX,offsetY:this.U.offsetY,blur:this.U.blur};a.align=this.align;a.h=this.h;a.za=this.za;a.V=this.V;return a};
function C(a,b){void 0!==b.w&&(a.w=b.w);void 0!==b.ri&&(a.ri=b.ri);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.zd&&(a.zd=b.zd);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.lf&&(a.lf=b.lf);void 0!==b.fillColor&&(a.Mc=0,a.fillColor=b.fillColor);void 0!==b.ed&&(a.Mc=1,a.ed=b.ed);void 0!==b.Wa&&(a.Mc=2,a.Wa=b.Wa);void 0!==b.fillStyle&&(a.Mc=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Yf&&(a.Yf=b.Yf);void 0!==b.strokeColor&&(a.mh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.mh=3,a.strokeStyle=b.strokeStyle);void 0!==b.Sc&&(a.Sc=b.Sc);void 0!==b.je&&(a.je=b.je);void 0!==b.Zf&&(a.Zf=b.Zf);void 0!==b.U&&(a.U=b.U);void 0!==b.align&&(a.align=b.align);void 0!==b.h&&(a.h=b.h);void 0!==b.za&&(a.za=b.za);void 0!==b.V&&(a.V=b.V)}function xa(a,b){a.fontWeight=void 0===b?"":b}function D(a,b){a.fontSize=void 0===b?12:b}
function ya(a,b){a.lf=void 0===b?1:b}d.setFillColor=function(a){this.Mc=0;this.fillColor=void 0===a?"black":a};function za(a,b,c,e,g){a.Mc=2;a.Wa.rj=!0;a.Wa.H=b;a.Wa.fk=c.slice(0);a.Wa.size=void 0===e?.6:e;a.Wa.offset=void 0===g?0:g}function Aa(a,b){a.stroke=void 0===b?!1:b}function Ca(a,b){a.Yf=void 0===b?1:b}d.setStrokeColor=function(a){this.mh=0;this.strokeColor=void 0===a?"black":a};function Da(a,b){a.Sc=void 0===b?1:b}function Ea(a,b){a.je=void 0===b?!1:b}
function Fa(a,b){a.Zf=void 0===b?"miter":b}function Ga(a,b,c){void 0===b?a.U.k=!0:a.U={k:!0,color:b,offsetX:0,offsetY:c,blur:2}}function F(a,b){a.align=void 0===b?"left":b}function G(a,b){a.h=void 0===b?"top":b}function Ha(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.w+", "+a.ri}function Ia(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Ja(a,b){return a.fontSize*b.length+a.V*(b.length-1)}
function Ka(a,b,c){var e,g,h,k,l,n,q=[],w=p.context;w.font=Ha(a);switch(a.zd){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:w.measureText(n[a]).width});return q}n=b.split("\n");h=w.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");e=g[0];l=w.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=w.measureText(g[b]).width,l+h+k<c?(e+=" "+g[b],l+=h+k):(q.push({text:e,width:l}),e=g[b],l=k);
q.push({text:e,width:l})}return q}d.da=function(a,b){var c;p.context.save();c=Ia(Ka(this,a,b));p.context.restore();return c};d.X=function(a,b){var c;p.context.save();c=Ja(this,Ka(this,a,b));p.context.restore();return c};function Ma(a,b,c,e,g,h){var k=a.fontSize;a.fontSize=b;b=h?Ka(a,c,e):Ka(a,c);e=Ia(b)<=e&&Ja(a,b)<=g;a.fontSize=k;return e}
function Na(a,b,c,e,g){var h=0,k=32;void 0===g&&(g=!1);for(p.context.save();Ma(a,h+k,b,c,e,g);)h+=k;for(;2<=k;)k/=2,Ma(a,h+k,b,c,e,g)&&(h+=k);p.context.restore();return Math.max(4,h)}function Oa(a,b,c,e,g){var h=Math.max(.01,a.Wa.size),k=a.Wa.offset;a.Wa.rj?(k=g/2+k*g,h=.5*h*g,b=p.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=e/2+k*e,h=.5*h*e,b=p.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.Wa.H-1);for(e=0;e<a.Wa.H;e+=1)b.addColorStop(e*c,a.Wa.fk[e]);return b}
function Pa(a,b,c,e,g,h,k){var l,n;!a.fill&&a.U.k?(b.shadowColor=a.U.color,b.shadowOffsetX=a.U.offsetX,b.shadowOffsetY=a.U.offsetY,b.shadowBlur=a.U.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Yf;switch(a.mh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.Sc;b.lineJoin=a.Zf;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.V*k;b.strokeText(c[k].text,e+l,g+n)}}
function Qa(a,b,c,e,g,h,k){c=Ka(a,c,k);k=Ia(c);var l=Ja(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":e+=-k;break;case "center":e+=-k/2}switch(a.h){case "base":case "bottom":g+=-l+Math.round(a.za*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.za*a.fontSize/2)}b.font=Ha(a);a.stroke&&a.je&&Pa(a,b,c,e,g,k,h);if(a.fill){var n=e,q=g,w,A;a.U.k?(b.shadowColor=a.U.color,b.shadowOffsetX=a.U.offsetX,b.shadowOffsetY=a.U.offsetY,b.shadowBlur=a.U.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.lf;switch(a.Mc){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.ed.f;A=new x(l.width,l.height);var E=a.ed.Ao,s=a.ed.Bo;E&&s?w="repeat":E&&!s?w="repeat-x":!E&&s?w="repeat-y":E||s||(w="no-repeat");y(A);l.p(a.ed.Eb,0,0);z(A);w=p.context.createPattern(A.canvas,w);b.fillStyle=w;break;case 2:b.fillStyle=Oa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(w=0;w<c.length;w+=1){l=0;switch(a.align){case "right":l=
k-c[w].width;break;case "center":l=(k-c[w].width)/2}A=a.fontSize*(w+1)+a.V*w;2===a.Mc&&a.Wa.rj&&(b.fillStyle=Oa(a,n,q+A-a.fontSize,k,a.fontSize));b.fillText(c[w].text,n+l,q+A)}}a.stroke&&!a.je&&Pa(a,b,c,e,g,k,h)}d.p=function(a,b,c,e){var g=p.context;this.fill&&1===this.Mc?this.Da(a,b,c,1,1,0,1,e):(g.save(),Qa(this,g,a,b,c,1,e),g.restore())};d.bd=function(a,b,c,e,g){var h=p.context;this.fill&&1===this.Mc?this.Da(a,b,c,1,1,0,e,g):(h.save(),Qa(this,h,a,b,c,e,g),h.restore())};
d.Da=function(a,b,c,e,g,h,k,l){var n=p.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(e,g);try{Qa(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Ra(){this.kw=10;this.Dj=-1;this.cu="stop_lowest_prio";this.Up=this.Qa=this.Za=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.Za=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Qa=!0)}catch(e){}this.Up=this.Za||this.Qa;this.Qa&&m.u.lh&&(this.Dj=1);if(this.Up)try{a=new Audio,this.Dp={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Dp={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.$b=[];this.Re={};this.Ra={};this.kc={};this.Md=
[];this.jc=0;this.Za?(this.Ld=new c,this.Ep="function"===typeof this.Ld.createGain?function(){return b.Ld.createGain()}:"function"===typeof this.Ld.createGainNode?function(){return b.Ld.createGainNode()}:function(){},this.Nd={},this.Cj=this.Ep(),void 0===this.Cj?(this.Qa=!0,this.Eh=Ra.prototype.xm):(this.Cj.connect(this.Ld.destination),this.Nd.master=this.Cj,this.Eh=Ra.prototype.bu)):this.Eh=this.Qa?Ra.prototype.xm:function(){}}
function Sa(a){var b=H,c,e,g,h,k;for(c=0;c<b.$b.length;c+=1)if((e=b.$b[c])&&0===e.dn)if(e.paused)e.Ip&&(e.zm+=a,e.zm>=e.Ip&&b.Wi(e.id));else if(e.Am+=a,e.kg&&e.Am>=e.Os)e.kg=!1,Ta(b,e,e.Pd);else if(e.uc&&b.Qa&&b.Cn(e.id)>=e.duration)if(e.Zn)try{e.J.pause(),e.J.currentTime=e.Pd/1E3,4===e.J.readyState?e.J.play():(g=function(){var a=e;return{ready:function(){a.J.play();a.J.removeEventListener("canplaythrough",g.ready,!1)}}}(),e.J.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else e.J.pause(),
Ua(e);for(c=b.Md.length-1;0<=c;c-=1)h=b.Md[c],b.or(h.id)||0!==h.dn||(h.n+=a,h.n>=h.duration?(H.Dd(h.id,h.fj),void 0!==b.kc[h.id]&&(b.kc[h.id]=h.fj),h.pb&&h.pb(),b.Md.splice(c,1)):(k=h.gb(h.n,h.start,h.fj-h.start,h.duration),H.Dd(h.id,k),void 0!==b.kc[h.id]&&(b.kc[h.id]=k)))}function Va(a,b){a.Re[b.wc.t.name]?a.Re[b.wc.t.name].length<a.kw&&a.Re[b.wc.t.name].push(b.J):a.Re[b.wc.t.name]=[b.J]}
function Wa(a,b){var c,e,g;g=[];for(c=0;c<a.$b.length;c+=1)(e=a.$b[c])&&0<=e.pa.indexOf(b)&&g.push(e);return g}function Xa(a,b){if(0<a.Dj&&a.jc>=a.Dj)switch(a.cu){case "cancel_new":return!1;case "stop_lowest_prio":var c,e,g;for(c=0;c<a.$b.length;c+=1)(e=a.$b[c])&&e.uc&&!e.paused&&(void 0===g||g.Bl<e.Bl)&&(g=e);if(g.Bl>b.Oh){a.stop(g.id);break}return!1}return!0}
function Ya(a,b){var c,e=1;for(c=0;c<b.pa.length;c+=1)void 0!==H.Ra[b.pa[c]]&&(e*=H.Ra[b.pa[c]]);c=a.Ep();c.gain.value=e;c.connect(a.Cj);a.Nd[b.id]=c;b.J.connect(c)}function Za(a,b){b.J.disconnect(0);a.Nd[b.id]&&(a.Nd[b.id].disconnect(0),delete a.Nd[b.id])}function $a(a,b){var c;if(b.t&&b.t.Nb){if(a.Za)return c=a.Ld.createBufferSource(),c.buffer=b.t.Nb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Qa)return c=b.t.Nb.cloneNode(!0),c.volume=0,c}}
function ab(a,b){var c,e;if(a.Za)(c=$a(a,b))&&(e=new bb(b,c));else if(a.Qa){c=a.Re[b.t.name];if(!c)return;0<c.length?e=new bb(b,c.pop()):(c=$a(a,b))&&(e=new bb(b,c))}if(e){a.Za&&Ya(a,e);for(c=0;c<a.$b.length;c+=1)if(void 0===a.$b[c])return a.$b[c]=e;a.$b.push(e)}return e}function cb(a){var b=H,c,e;for(c=0;c<a.length;c+=1)if(e=a[c].split(".").pop(),b.Dp[e])return a[c];return!1}d=Ra.prototype;
d.xm=function(a,b,c){function e(){var b;a.loaded=!0;ka(c);a.duration=Math.ceil(1E3*a.Nb.duration);a.Nb.removeEventListener("canplaythrough",e,!1);a.Nb.removeEventListener("error",g,!1);b=a.Nb.cloneNode(!0);H.Re[a.name].push(b)}function g(){ma(c)}(b=cb(b))?(a.Nb=new Audio,a.Nb.src=b,a.Nb.autoplay=!1,a.Nb.RA="auto",a.Nb.addEventListener("canplaythrough",e,!1),a.Nb.addEventListener("error",g,!1),a.Nb.load()):g()};
d.bu=function(a,b,c){var e=cb(b),g=new XMLHttpRequest;g.open("GET",e,!0);g.responseType="arraybuffer";g.onload=function(){H.Ld.decodeAudioData(g.response,function(b){b&&(a.Nb=b,a.duration=1E3*b.duration,a.loaded=!0,ka(c))},function(){ma(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(H.Za=!1,H.Qa=!0,H.Eh=Ra.prototype.xm,H.Eh(a,b,c))};try{g.send()}catch(h){}};
d.play=function(a,b,c,e){if(a instanceof db){if(Xa(this,a)){a=ab(this,a);if(!a)return-1;a.Os=b||0;a.kg=0<b;a.rb=c||0;a.Xd=e||function(a,b,c,e){return 0==a?b:c*Math.pow(2,10*(a/e-1))+b};a.kg||Ta(this,a,a.Pd);return a.id}return-1}};
function Ta(a,b,c){var e;"number"!==typeof c&&(c=0);eb(a,b.id);0<b.rb&&(e=fb(a,b.id),a.Dd(b.id,0),gb(a,b.id,e,b.rb,b.Xd),b.rb=0,b.Xd=void 0);if(a.Za){e=c-b.Pd;b.du=1E3*a.Ld.currentTime-e;b.J.onended=function(){Ua(b)};try{b.J.start?b.J.start(0,c/1E3,(b.duration-e)/1E3):b.J.noteGrainOn&&b.J.noteGrainOn(0,c/1E3,(b.duration-e)/1E3),b.td=!0,b.uc=!0,a.jc+=1,b.J.loop=b.Zn}catch(g){}}else if(a.Qa){if(4!==b.J.readyState){var h=function(){return{ready:function(){b.J.currentTime=c/1E3;b.J.play();b.td=!0;b.J.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.J.addEventListener("canplaythrough",h.ready,!1)}else b.J.currentTime=c/1E3,b.J.play(),b.td=!0;b.uc=!0;a.jc+=1}}
d.Wi=function(a,b,c,e){var g,h,k,l,n=Wa(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.uc)&&!e||!h.paused&&e){if(!e){for(g=this.Md.length-1;0<=g;g-=1)if(a=this.Md[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.rb=b||0;h.Xd=c||function(a,b,c,e){return 0==a?b:c*Math.pow(2,10*(a/e-1))+b};h.Ch&&(void 0===b&&(h.rb=h.Ch.duration),void 0===c&&(h.Xd=h.Ch.gb),k=h.Ch.gain,h.Ch=void 0)}this.Za&&(a=$a(this,h.wc))&&(h.J=a,Ya(this,h));void 0!==k&&H.Dd(h.id,k);Ta(this,h,h.Pd+(h.Ej||0));void 0!==l&&
(H.Dd(h.id,l.gb(l.n,l.start,l.fj-l.start,l.duration)),gb(H,h.id,l.fj,l.duration-l.n,l.gb,l.pb))}};
d.pause=function(a,b,c,e,g){var h,k,l=Wa(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.rb=c||0,0<h.rb)h.Xd=e||function(a,b,c,e){return 0==a?b:c*Math.pow(2,10*(a/e-1))+b},h.Ch={gain:hb(h.id),duration:h.rb,gb:h.Xd},gb(H,h.id,0,h.rb,h.Xd,function(){H.pause(h.id,b)});else if(k=this.Cn(h.id),h.Ej=k,g||(h.paused=!0,h.zm=0,h.Ip=b,this.jc-=1),this.Za){h.J.onended=function(){};if(h.uc&&h.td){try{h.J.stop?h.J.stop(0):h.J.noteOff&&h.J.noteOff(0)}catch(n){}h.td=!1}Za(this,h)}else this.Qa&&h.J.pause()};
function Ua(a){var b=H;b.Ra[a.id]&&delete b.Ra[a.id];a.paused||(b.jc-=1);b.Za?(a.td=!1,a.uc=!1,Za(b,a)):b.Qa&&Va(b,a);b.$b[b.$b.indexOf(a)]=void 0}
d.stop=function(a,b,c){var e,g=Wa(this,a);for(a=0;a<g.length;a+=1)if(e=g[a],e.rb=b||0,0<e.rb)e.Xd=c||function(a,b,c,e){return 0==a?b:c*Math.pow(2,10*(a/e-1))+b},gb(H,e.id,0,e.rb,e.Xd,function(){H.stop(e.id)});else{this.Ra[e.id]&&delete this.Ra[e.id];e.uc&&!e.paused&&(this.jc-=1);if(this.Za){if(e.uc&&!e.paused&&!e.kg){if(e.td){try{e.J.stop?e.J.stop(0):e.J.noteOff&&e.J.noteOff(0)}catch(h){}e.td=!1}Za(this,e)}}else this.Qa&&(e.kg||e.J.pause(),Va(this,e));this.$b[this.$b.indexOf(e)]=void 0;e.uc=!1}};
function gb(a,b,c,e,g,h){var k;for(k=0;k<a.Md.length;k+=1)if(a.Md[k].id===b){a.Md.splice(k,1);break}a.Md.push({id:b,fj:c,gb:g||function(a,b,c,e){return a==e?b+c:c*(-Math.pow(2,-10*a/e)+1)+b},duration:e,n:0,start:fb(a,b),pb:h,dn:0})}function ib(a){var b=H,c;void 0===b.kc[a]&&(c=void 0!==b.Ra[a]?b.Ra[a]:1,b.Dd(a,0),b.kc[a]=c)}function jb(a){var b=H;void 0!==b.kc[a]&&(b.Dd(a,b.kc[a]),delete b.kc[a])}
d.position=function(a,b){var c,e,g,h,k=Wa(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(e=k[c],b%=e.duration,this.Za)if(e.paused)e.Ej=b;else{e.J.onended=function(){};if(e.td){try{e.J.stop?e.J.stop(0):e.J.noteOff&&e.J.noteOff(0)}catch(l){}e.td=!1}Za(this,e);this.jc-=1;if(g=$a(this,e.wc))e.J=g,Ya(this,e),Ta(this,e,e.Pd+b)}else this.Qa&&(4===e.J.readyState?e.J.currentTime=(e.Pd+b)/1E3:(h=function(){var a=e,c=b;return{Wq:function(){a.J.currentTime=(a.Pd+c)/1E3;a.J.removeEventListener("canplaythrough",
h.Wq,!1)}}}(),e.J.addEventListener("canplaythrough",h.Wq,!1)))};d.Do=function(a){H.position(a,0)};d.Bs=function(a,b){var c,e=Wa(this,a);for(c=0;c<e.length;c+=1)e[c].Zn=b,this.Za&&(e[c].J.loop=b)};function fb(a,b){return void 0!==a.Ra[b]?a.Ra[b]:1}function hb(a){var b=H,c=1,e=Wa(b,a)[0];if(e)for(a=0;a<e.pa.length;a+=1)void 0!==b.Ra[e.pa[a]]&&(c*=b.Ra[e.pa[a]]);return Math.round(100*c)/100}
d.Dd=function(a,b){var c,e,g,h=1,k=Wa(this,a);this.Ra[a]=b;this.kc[a]&&delete this.kc[a];for(c=0;c<k.length;c+=1)if(e=k[c],0<=e.pa.indexOf(a)){for(g=0;g<e.pa.length;g+=1)void 0!==this.Ra[e.pa[g]]&&(h*=this.Ra[e.pa[g]]);h=Math.round(100*h)/100;this.Za?this.Nd[e.id].gain.value=h:this.Qa&&(e.J.volume=h)}};
function eb(a,b){var c,e,g,h=1,k=Wa(a,b);for(c=0;c<k.length;c+=1){e=k[c];for(g=0;g<e.pa.length;g+=1)void 0!==a.Ra[e.pa[g]]&&(h*=a.Ra[e.pa[g]]);h=Math.round(100*h)/100;a.Za?a.Nd[e.id].gain.value=h:a.Qa&&(e.J.volume=h)}}d.Op=function(a,b){var c,e,g,h=Wa(this,a);for(c=0;c<h.length;c+=1)for(e=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>e.pa.indexOf(b[g])&&e.pa.push(b[g]);eb(this,a)};d.or=function(a){if(a=Wa(this,a)[0])return a.paused};
d.Cn=function(a){if(a=Wa(this,a)[0]){if(this.Za)return a.paused?a.Ej:(1E3*H.Ld.currentTime-a.du)%a.duration;if(H.Qa)return Math.ceil(1E3*a.J.currentTime-a.Pd)}};var H=new Ra;function kb(a,b,c,e){this.name=a;this.Pw=b;this.ex=c;this.sc=e;this.loaded=!1;this.Nb=null;na(this,this.sc,1)}
kb.prototype.Ed=function(a,b){var c,e;c=this.Pw;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);e=this.ex;0!==e.toLowerCase().indexOf("http:")&&0!==e.toLowerCase().indexOf("https:")&&(e=b+e);H.Re[this.name]=[];H.Eh(this,[e,c],a)};kb.prototype.complete=function(){return this.loaded};
function db(a,b,c,e,g,h,k){this.name=a;this.t=b;this.startOffset=c;this.duration=e;H.Dd(this.name,void 0!==g?g:1);this.Oh=void 0!==h?h:10;this.pa=[];k&&(this.pa=this.pa.concat(k));0>this.pa.indexOf(this.name)&&this.pa.push(this.name)}db.prototype.complete=function(){return this.t.complete()};db.prototype.Bl=function(a){void 0!==a&&(this.Oh=a);return this.Oh};db.prototype.Op=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.pa.indexOf(a[b])&&this.pa.push(a[b])};
function bb(a,b){this.wc=a;this.Pd=this.wc.startOffset;this.J=b;this.duration=this.wc.duration;this.vm()}bb.prototype.vm=function(){this.id=Math.round(Date.now()*Math.random())+"";this.pa=["master",this.id].concat(this.wc.pa);this.Bl=void 0!==this.wc.Oh?this.wc.Oh:10;this.paused=this.uc=this.Zn=!1;this.Am=this.dn=0;this.td=this.kg=!1;this.Os=this.Ej=0;var a,b=1;for(a=0;a<this.pa.length;a+=1)void 0!==H.Ra[this.pa[a]]&&(b*=H.Ra[this.pa[a]]);!H.Za&&H.Qa&&(this.J.volume=b)};
function lb(a,b){this.name=a;this.fileName=b;this.info=void 0}function mb(a){this.name=a;this.text="";this.Lc=this.complete=!1}mb.prototype.Se=function(a){4===a.readyState&&(this.complete=!0,(this.Lc=200!==a.status)?la("Get Failed",{name:this.name}):(this.text=a.responseText,la("Get Complete",{name:this.name})))};
function nb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.Lc=200!==c.status,a.Lc?la("Post Failed",{name:a.name}):la("Post Complete",{name:a.name}))};c.send(a.text)}function ob(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(e){return!1}a.complete=!0;a.Lc=200!==c.status;if(a.Lc)return!1;a.text=c.responseText;return!0}
function pb(a){a&&(this.be=a);this.clear();this.Lh=this.ng=this.Yc=this.Kh=this.Jh=this.Nh=this.Gh=this.Mh=this.Od=this.Ih=this.Hh=0;qb(this,this);rb(this,this);sb(this,this);this.oe=[];this.yh=[];this.Qh=[];this.O=0;this.Jp=!1;this.Yk=this.startTime=Date.now();this.Xf=this.Ek=0;this.lw=200;this.sc="";window.wj(window.Ap)}pb.prototype.clear=function(){this.I=[];this.Rh=!1;this.wb=[];this.um=!1};
function qb(a,b){window.addEventListener("click",function(a){var e,g,h;if(void 0!==b.be&&!(0<b.O)&&(e=b.be,g=e.getBoundingClientRect(),h=e.width/g.width*(a.clientX-g.left),e=e.height/g.height*(a.clientY-g.top),a.preventDefault(),b.jg.x=h,b.jg.y=e,b.Ah.push({x:b.jg.x,y:b.jg.y}),0<b.Kh))for(a=b.I.length-1;0<=a&&!((h=b.I[a])&&h.k&&0>=h.O&&h.Hn&&(h=h.Hn(b.jg.x,b.jg.y),!0===h));a-=1);},!1);tb(a)}function tb(a){a.jg={x:0,y:0};a.Ah=[]}
function rb(a,b){window.addEventListener("mousedown",function(a){0<b.O||(a.preventDefault(),window.focus(),b.Hp>=Date.now()-1E3||(ub(b,0,a.clientX,a.clientY),vb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.O||(a.preventDefault(),b.Bj>=Date.now()-1E3||(ub(b,0,a.clientX,a.clientY),wb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.O||(a.preventDefault(),ub(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var e=a.changedTouches;b.Hp=Date.now();
if(!(0<b.O))for(a.preventDefault(),window.focus(),a=0;a<e.length;a+=1)ub(b,e[a].identifier,e[a].clientX,e[a].clientY),vb(b,e[a].identifier)},!1);window.addEventListener("touchend",function(a){var e=a.changedTouches;b.Bj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<e.length;a+=1)ub(b,e[a].identifier,e[a].clientX,e[a].clientY),wb(b,e[a].identifier)},!1);window.addEventListener("touchmove",function(a){var e=a.changedTouches;if(!(0<b.O))for(a.preventDefault(),a=0;a<e.length;a+=1)ub(b,e[a].identifier,
e[a].clientX,e[a].clientY)},!1);window.addEventListener("touchleave",function(a){var e=a.changedTouches;b.Bj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<e.length;a+=1)ub(b,e[a].identifier,e[a].clientX,e[a].clientY),wb(b,e[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var e=a.changedTouches;b.Bj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<e.length;a+=1)ub(b,e[a].identifier,e[a].clientX,e[a].clientY),wb(b,e[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){xb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){xb(b,a)},!1);yb(a);a.Hp=0;a.Bj=0}function yb(a){var b;a.ja=[];for(b=0;16>b;b+=1)a.ja[b]={id:-1,qb:!1,x:0,y:0};a.Ve=[]}function zb(a,b){var c=-1,e;for(e=0;16>e;e+=1)if(a.ja[e].id===b){c=e;break}if(-1===c)for(e=0;16>e;e+=1)if(!a.ja[e].qb){c=e;a.ja[e].id=b;break}return c}
function ub(a,b,c,e){var g,h;void 0!==a.be&&(b=zb(a,b),-1!==b&&(g=a.be,h=g.getBoundingClientRect(),a.ja[b].x=g.width/h.width*(c-h.left),a.ja[b].y=g.height/h.height*(e-h.top)))}function vb(a,b){var c=zb(a,b),e,g;if(-1!==c&&!a.ja[c].qb&&(a.Ve.push({mf:c,x:a.ja[c].x,y:a.ja[c].y,qb:!0}),a.ja[c].qb=!0,0<a.Yc))for(e=a.I.length-1;0<=e&&!((g=a.I[e])&&g.k&&0>=g.O&&g.Jg&&(g=g.Jg(c,a.ja[c].x,a.ja[c].y),!0===g));e-=1);}
function wb(a,b){var c=zb(a,b),e,g;if(-1!==c&&a.ja[c].qb&&(a.Ve.push({mf:c,x:a.ja[c].x,y:a.ja[c].y,qb:!1}),a.ja[c].qb=!1,0<a.Yc))for(e=a.I.length-1;0<=e&&!((g=a.I[e])&&g.k&&0>=g.O&&g.Kg&&(g=g.Kg(c,a.ja[c].x,a.ja[c].y),!0===g));e-=1);}
function xb(a,b){var c;if(!(0<a.O)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var e,g;a.Ve.push({mf:0,x:a.ja[0].x,y:a.ja[0].y,wheelDelta:c});if(0<a.Yc)for(e=a.I.length-1;0<=e&&!((g=a.I[e])&&g.k&&0>=g.O&&g.Kn&&(g=g.Kn(c,a.ja[0].x,a.ja[0].y),!0===g));e-=1);}}
function sb(a,b){window.addEventListener("keydown",function(a){0<b.O||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Ab(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.O||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Cb(b,a.keyCode))},!1);Db(a)}function Db(a){var b;a.Dh=[];for(b=0;256>b;b+=1)a.Dh[b]=!1;a.mg=[]}
function Ab(a,b){var c,e;if(!a.Dh[b]&&(a.mg.push({key:b,qb:!0}),a.Dh[b]=!0,0<a.ng))for(c=0;c<a.I.length&&!((e=a.I[c])&&e.k&&0>=e.O&&e.In&&(e=e.In(b),!0===e));c+=1);}function Cb(a,b){var c,e;if(a.Dh[b]&&(a.mg.push({key:b,qb:!1}),a.Dh[b]=!1,0<a.ng))for(c=0;c<a.I.length&&!((e=a.I[c])&&e.k&&0>=e.O&&e.Jn&&(e=e.Jn(b),!0===e));c+=1);}function Eb(){var a=I,b;for(b=0;b<a.oe.length;b+=1)a.oe[b].paused+=1}
function la(a,b){var c,e=I,g,h;void 0===c&&(c=null);e.Qh.push({id:a,gu:b,sh:c});if(0<e.Lh)for(g=0;g<e.I.length&&(!((h=e.I[g])&&h.k&&0>=h.O&&h.Ln)||null!==c&&c!==h||(h=h.Ln(a,b),!0!==h));g+=1);}
function Fb(a,b){var c=a.wb[b];c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.mb(c.canvas),!1!==p.canvas.Z||!0===c.Rb)&&(0===c.Gp&&(0>=c.O&&(c.Eb+=c.Rd*a.Xf/1E3),1===c.om&&1===c.pm&&0===c.Sa?1===c.alpha?c.f.p(c.Eb,c.x,c.y):c.f.bd(c.Eb,c.x,c.y,c.alpha):c.f.Da(c.Eb,c.x,c.y,c.om,c.pm,c.Sa,c.alpha)),1===c.Gp&&(1===c.om&&1===c.pm&&0===c.Sa?1===c.alpha?c.font.p(c.text,c.x,c.y):c.font.bd(c.text,c.x,c.y,c.alpha):c.font.Da(c.text,c.x,c.y,c.om,c.pm,c.Sa,c.alpha)))}
function Gb(a,b){var c=a.I[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.mb(c.canvas),(!1!==p.canvas.Z||!0===c.Rb)&&c.Ua))return c.Ua()}function Hb(a){for(var b=0,c=0;b<a.I.length||c<a.wb.length;)if(c===a.wb.length){if(!0===Gb(a,b))break;b+=1}else if(b===a.I.length)Fb(a,c),c+=1;else if(a.wb[c].Ia>a.I[b].Ia||a.wb[c].Ia===a.I[b].Ia&&a.wb[c].depth>a.I[b].depth)Fb(a,c),c+=1;else{if(!0===Gb(a,b))break;b+=1}}pb.prototype.pause=function(a){this.O+=1;void 0===a&&(a=!1);this.Jp=a};
pb.prototype.Wi=function(){0!==this.O&&(this.Yk=Date.now(),this.O-=1)};pb.prototype.or=function(){return 0<this.O};window.sm=0;window.rm=0;window.Bp=0;window.Vt=0;window.Cp=0;window.Xt=60;window.Yt=0;window.Wt=!1;
window.Ap=function(){window.sm=Date.now();window.Vt=window.sm-window.rm;var a=I,b;if(0<a.O)a.Jp&&(Ib(a),Hb(a));else{b=Date.now();"number"!==typeof b&&(b=a.Yk);a.Xf=Math.min(a.lw,b-a.Yk);a.Ek+=a.Xf;""===a.sc&&(a.sc="start",ia.Ed(a.sc));"start"===a.sc&&ia.complete(a.sc)&&(a.sc="load",ia.Ed(a.sc));"load"===a.sc&&ia.complete(a.sc)&&(a.sc="game",ia.Ed(a.sc));"undefined"!==typeof H&&Sa(a.Xf);var c,e;if(0<a.Hh)for(c=0;c<a.I.length&&!((e=a.I[c])&&e.ua&&e.k&&0>=e.O&&!0===e.ua(a.Xf));c+=1);var g,h;if(0!==a.Ah.length){if(0<
a.Ih)for(e=a.I.length-1;0<=e;e-=1)if((g=a.I[e])&&g.k&&0>=g.O&&g.Gn)for(c=0;c<a.Ah.length;c+=1)h=a.Ah[c],!0!==h.Nc&&(h.Nc=g.Gn(h.x,h.y));a.Ah=[]}if(0!==a.Ve.length){if(0<a.Od)for(e=a.I.length-1;0<=e;e-=1)if((g=a.I[e])&&g.k&&0>=g.O&&(g.Ab||g.Tb||g.Lk))for(c=0;c<a.Ve.length;c+=1)h=a.Ve[c],!0!==h.Nc&&(void 0!==h.wheelDelta&&g.Lk?h.Nc=g.Lk(h.wheelDelta,h.x,h.y):h.qb&&g.Ab?h.Nc=g.Ab(h.mf,h.x,h.y):void 0!==h.qb&&!h.qb&&g.Tb&&(h.Nc=g.Tb(h.mf,h.x,h.y)));a.Ve=[]}if(0!==a.mg.length){if(0<a.Mh)for(e=0;e<a.I.length;e+=
1)if((g=a.I[e])&&g.k&&0>=g.O&&(g.Kk||g.Lg))for(c=0;c<a.mg.length;c+=1)h=a.mg[c],!0!==h.Nc&&(h.qb&&g.Kk?h.Nc=void 0:!h.qb&&g.Lg&&(h.Nc=g.Lg(h.key)));a.mg=[]}c=a.Xf;for(e=a.yh.length=0;e<a.oe.length;e+=1)g=a.oe[e],void 0!==g.id&&0===g.paused&&(0<g.ph||0<g.Co)&&(g.ph-=c,0>=g.ph&&(a.yh.push({id:g.id,sh:g.sh}),0<g.Co?(g.Co-=1,g.ph+=g.time):g.ph=0));if(0<a.Gh&&0<a.yh.length)for(c=0;c<a.I.length;c+=1)if((e=a.I[c])&&e.Fn&&e.k)for(g=0;g<a.yh.length;g+=1)h=a.yh[g],!0===h.Nc||null!==h.sh&&h.sh!==e||(h.Nc=e.Fn(h.id));
if(0<a.Nh&&0<a.Qh.length)for(c=0;c<a.I.length;c+=1)if((g=a.I[c])&&g.gd&&g.k&&0>=g.O)for(e=0;e<a.Qh.length;e+=1)h=a.Qh[e],!0===h.Nc||null!==h.sh&&h.sh!==g||(h.Nc=g.gd(h.id,h.gu));a.Qh.length=0;if(0<a.Jh)for(c=0;c<a.I.length&&!((e=a.I[c])&&e.pc&&e.k&&0>=e.O&&!0===e.pc(a.Xf));c+=1);Ib(a);Hb(a);a.Yk=b}window.rm=Date.now();window.Bp=window.rm-window.sm;window.Cp=Math.max(window.Yt,1E3/window.Xt-window.Bp);window.wj(window.Ap)};window.wj=function(a){window.setTimeout(a,window.Cp)};
window.Wt||(window.wj=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.wj);
function Ib(a){function b(a,b){return a.Ia===b.Ia?b.depth-a.depth:a.Ia>b.Ia?-1:1}var c,e;for(c=e=0;c<a.I.length;c+=1)a.I[c]&&(a.I[c].tm&&(a.I[c].tm=!1,a.I[c].k=!0),a.I[e]=a.I[c],e+=1);a.I.length=e;a.Rh&&a.I.sort(b);a.Rh=!1;for(c=e=0;c<a.wb.length;c+=1)a.wb[c]&&(a.wb[e]=a.wb[c],e+=1);a.wb.length=e;a.um&&a.wb.sort(b);a.um=!1}
function J(a,b){var c=I;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.k&&(a.k=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ia&&(a.Ia=0);void 0===a.O&&(a.O=0);void 0===a.Ue&&(a.Ue=[]);a.tm=!1;void 0!==b&&!1===b&&(a.tm=!0,a.k=!1);c.I.push(a);c.Rh=!0;a.ua&&(c.Hh+=1);a.Gn&&(c.Ih+=1);if(a.Ab||a.Tb)c.Od+=1;a.Lk&&(c.Od+=1);if(a.Kk||a.Lg)c.Mh+=1;a.Fn&&(c.Gh+=1);a.gd&&(c.Nh+=1);a.pc&&(c.Jh+=1);a.Hn&&(c.Kh+=1);if(a.Jg||a.Kg)c.Yc+=1;a.Kn&&(c.Yc+=1);if(a.In||a.Jn)c.ng+=1;a.Ln&&(c.Lh+=
1);a.Sb&&a.Sb()}function Jb(a,b){var c=I;a.depth!==b&&(c.Rh=!0);a.depth=b}function Kb(a,b){var c;b=[].concat(b);void 0===a.Ue&&(a.Ue=[]);for(c=b.length-1;0<=c;c-=1)0>a.Ue.indexOf(b[c])&&a.Ue.push(b[c])}
function Lb(a){var b=I,c=[],e,g;if(void 0===a||"all"===a||"master"===a)for(e=0;e<b.I.length;e+=1)g=b.I[e],void 0!==g&&c.push(g);else if("function"===typeof a)for(e=0;e<b.I.length;e+=1)g=b.I[e],void 0!==g&&a(g)&&c.push(g);else for(e=0;e<b.I.length;e+=1)g=b.I[e],void 0!==g&&0<=g.Ue.indexOf(a)&&c.push(g);return c}function Mb(a){var b=Lb(a);for(a=0;a<b.length;a+=1){var c=b[a];c.O+=1}}function Ob(a){var b=Lb(a);for(a=0;a<b.length;a+=1){var c=b[a];c.O=Math.max(0,c.O-1)}}
pb.prototype.q=function(a){a=this.I.indexOf(a);if(!(0>a)){this.I[a].zb&&this.I[a].zb();var b=this.I[a];b.ua&&(this.Hh-=1);b.Gn&&(this.Ih-=1);if(b.Ab||b.Tb)this.Od-=1;b.Lk&&(this.Od-=1);if(b.Kk||b.Lg)this.Mh-=1;b.Fn&&(this.Gh-=1);b.gd&&(this.Nh-=1);b.pc&&(this.Jh-=1);b.Hn&&(this.Kh-=1);if(b.Jg||b.Kg)this.Yc-=1;b.Kn&&(this.Yc-=1);if(b.In||b.Jn)this.ng-=1;b.Ln&&(this.Lh-=1);this.I[a]=void 0}};pb.prototype.e=function(a,b,c,e,g,h,k){return Pb(this,a,b,c,e,g,h,k)};
function Pb(a,b,c,e,g,h,k,l){void 0===l&&(l=0);a.wb.push({Gp:0,f:b,Eb:c,Rd:e,visible:!0,x:g,y:h,om:1,pm:1,Sa:0,alpha:1,depth:k,Ia:l,O:0,Ue:[]});a.um=!0;return a.wb[a.wb.length-1]}var I=new pb(aa);
function Qb(a,b){var c;this.kind=a;this.C=null;switch(this.kind){case 0:this.C={x:[b.x],y:[b.y]};this.Ea=b.x;this.Ta=b.y;this.$a=b.x;this.yb=b.y;break;case 2:this.C={x:[b.x,b.x+b.Fb-1,b.x+b.Fb-1,b.x,b.x],y:[b.y,b.y,b.y+b.Jb-1,b.y+b.Jb-1,b.y]};this.Ea=b.x;this.Ta=b.y;this.$a=b.x+b.Fb-1;this.yb=b.y+b.Jb-1;break;case 3:this.C={x:[],y:[]};this.Ea=b.x-b.Gl;this.Ta=b.y-b.Gl;this.$a=b.x+b.Gl;this.yb=b.y+b.Gl;break;case 1:this.C={x:[b.sp,b.tp],y:[b.vp,b.wp]};this.Ea=Math.min(b.sp,b.tp);this.Ta=Math.min(b.vp,
b.wp);this.$a=Math.max(b.sp,b.tp);this.yb=Math.max(b.vp,b.wp);break;case 4:this.C={x:[],y:[]};this.Ea=b.x[0];this.Ta=b.y[0];this.$a=b.x[0];this.yb=b.y[0];for(c=0;c<b.x.length;c+=1)this.C.x.push(b.x[c]),this.C.y.push(b.y[c]),this.Ea=Math.min(this.Ea,b.x[c]),this.Ta=Math.min(this.Ta,b.y[c]),this.$a=Math.max(this.$a,b.x[c]),this.yb=Math.max(this.yb,b.y[c]);this.C.x.push(b.x[0]);this.C.y.push(b.y[0]);break;default:this.Ta=this.Ea=0,this.yb=this.$a=-1}}
function Rb(a,b,c,e){return new Qb(2,{x:a,y:b,Fb:c,Jb:e})}function Sb(a){var b=1E6,c=-1E6,e=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.H;h+=1)k=a.pd[h]-a.Hb,l=k+a.Uc[h]-1,n=a.qd[h]-a.Ib,q=n+a.Tc[h]-1,k<b&&(b=k),l>c&&(c=l),n<e&&(e=n),q>g&&(g=q);return new Qb(2,{x:b,y:e,Fb:c-b+1,Jb:g-e+1})}d=Qb.prototype;
d.M=function(){var a=new Qb(-1,{}),b;a.kind=this.kind;a.Ea=this.Ea;a.$a=this.$a;a.Ta=this.Ta;a.yb=this.yb;a.C={x:[],y:[]};for(b=0;b<this.C.x.length;b+=1)a.C.x[b]=this.C.x[b];for(b=0;b<this.C.y.length;b+=1)a.C.y[b]=this.C.y[b];return a};d.translate=function(a,b){var c=this.M(),e;c.Ea+=a;c.$a+=a;c.Ta+=b;c.yb+=b;for(e=0;e<c.C.x.length;e+=1)c.C.x[e]+=a;for(e=0;e<c.C.y.length;e+=1)c.C.y[e]+=b;return c};
d.scale=function(a){var b=this.M(),c;b.Ea*=a;b.$a*=a;b.Ta*=a;b.yb*=a;for(c=0;c<b.C.x.length;c+=1)b.C.x[c]*=a;for(c=0;c<b.C.y.length;c+=1)b.C.y[c]*=a;return b};
d.rotate=function(a){var b,c,e,g;switch(this.kind){case 0:return b=new ca(this.C.x[0],this.C.y[0]),b=b.rotate(a),new Qb(0,{x:b.x,y:b.y});case 1:return b=new ca(this.C.x[0],this.C.y[0]),b=b.rotate(a),c=new ca(this.C.x[1],this.C.y[1]),c=c.rotate(a),new Qb(1,{sp:b.x,vp:b.y,tp:c.x,wp:c.y});case 3:return b=(this.$a-this.Ea)/2,c=new ca(this.Ea+b,this.Ta+b),c=c.rotate(a),new Qb(3,{x:c.x,y:c.y,Gl:b});default:c=[];e=[];for(g=0;g<this.C.x.length-1;g+=1)b=new ca(this.C.x[g],this.C.y[g]),b=b.rotate(a),c.push(b.x),
e.push(b.y);return new Qb(4,{x:c,y:e})}};
function Tb(a,b,c,e,g){var h,k,l,n,q;if(e<b+a.Ea||e>b+a.$a||g<c+a.Ta||g>c+a.yb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return l=(a.$a-a.Ea)/2,e-=b+a.Ea+l,g-=c+a.Ta+l,e*e+g*g<=l*l;case 1:return l=b+a.C.x[0],n=c+a.C.y[0],b+=a.C.x[1],a=c+a.C.y[1],e===l?g===n:e===b?g===a:1>Math.abs(n+(e-l)*(a-n)/(b-l)-g);case 4:n=new ca(0,0);q=new ca(0,0);l=[];for(k=0;k<a.C.x.length-1;k+=1)n.x=a.C.x[k],n.y=a.C.y[k],q.x=a.C.x[k+1],q.y=a.C.y[k+1],l.push(da(new ca(n.x-q.x,n.y-q.y)));for(n=0;n<l.length;n+=1){q=
new ca(e,g);k=l[n];q=q.x*k.x+q.y*k.y;h=a;var w=b,A=c,E=l[n],s=new ca(0,0),t=void 0,u=1E9;k=-1E10;for(var v=void 0,v=0;v<h.C.x.length;v+=1)s.x=w+h.C.x[v],s.y=A+h.C.y[v],t=s.x*E.x+s.y*E.y,u=Math.min(u,t),k=Math.max(k,t);h=u;if(q<h||k<q)return!1}return!0;default:return!1}}
d.dc=function(a,b,c){var e=p.context;e.fillStyle=c;e.strokeStyle=c;switch(this.kind){case 0:e.fillRect(a+this.Ea-1,b+this.Ta-1,3,3);break;case 2:e.fillRect(a+this.Ea,b+this.Ta,this.$a-this.Ea+1,this.yb-this.Ta+1);break;case 3:c=(this.$a-this.Ea)/2;e.beginPath();e.arc(a+this.Ea+c,b+this.Ta+c,c,0,2*Math.PI,!1);e.closePath();e.fill();break;case 1:e.beginPath();e.moveTo(a+this.C.x[0],b+this.C.y[0]);e.lineTo(a+this.C.x[1],b+this.C.y[1]);e.stroke();break;case 4:e.beginPath();e.moveTo(a+this.C.x[0],b+this.C.y[0]);
for(c=1;c<this.C.x.length-1;c+=1)e.lineTo(a+this.C.x[c],b+this.C.y[c]);e.closePath();e.fill()}};function Ub(){this.depth=1E7;this.visible=!1;this.k=!0;this.group="Engine";this.la=[];this.Fh=this.O=this.Ph=!1;this.qe=1;this.bc=-1;this.qa=-1E6}d=Ub.prototype;d.M=function(){var a=new Ub,b;for(b=0;b<this.la.length;b+=1)a.la.push({Ya:this.la[b].Ya,action:this.la[b].action});a.Fh=this.Fh;return a};
d.ta=function(a,b){var c,e;if(0===this.la.length||this.la[this.la.length-1].Ya<=a)this.la.push({Ya:a,action:b});else{for(c=0;this.la[c].Ya<=a;)c+=1;for(e=this.la.length;e>c;e-=1)this.la[e]=this.la[e-1];this.la[c]={Ya:a,action:b}}this.qa=-1E6};d.start=function(){this.Ph=!0;this.O=!1;this.bc=0>this.qe&&0<this.la.length?this.la[this.la.length-1].Ya+1:-1;this.qa=-1E6;I.q(this);J(this)};
d.Do=function(){if(0>this.qe&&0<this.la.length){var a=this.la[this.la.length-1].Ya;this.bc=0>this.qe?a+1:a-1}else this.bc=0>this.qe?1:-1;this.qa=-1E6};d.stop=function(){this.Ph=!1;I.q(this)};d.fe=function(){return this.Ph};d.pause=function(){this.O=!0;I.q(this)};d.Wi=function(){this.O=!1;I.q(this);J(this)};d.paused=function(){return this.Ph&&this.O};d.Bs=function(a){this.Fh=a};
d.ua=function(a){if(this.Ph&&!this.O&&0!==this.qe)if(0<this.qe){0>this.qa&&(this.qa=0);for(;this.qa<this.la.length&&this.la[this.qa].Ya<=this.bc;)this.qa+=1;for(this.bc+=this.qe*a;0<=this.qa&&this.qa<this.la.length&&this.la[this.qa].Ya<=this.bc;)this.la[this.qa].action(this.la[this.qa].Ya,this),this.qa+=1;this.qa>=this.la.length&&(this.Fh?this.Do():this.stop())}else{0>this.qa&&(this.qa=this.la.length-1);for(;0<=this.qa&&this.la[this.qa].Ya>=this.bc;)this.qa-=1;for(this.bc+=this.qe*a;0<=this.qa&&this.la[this.qa].Ya>=
this.bc;)this.la[this.qa].action(this.la[this.qa].Ya,this),this.qa-=1;0>this.qa&&0>=this.bc&&(this.Fh?this.Do():this.stop())}};function Vb(){this.depth=1E7;this.visible=!1;this.k=!0;this.group="Engine";this.Mb=[];this.Qe=[];this.clear();this.ny=!1;J(this)}d=Vb.prototype;d.ua=function(){var a,b,c,e,g;if(this.ny)for(a=0;16>a;a+=1)I.ja[a].qb&&(b=I.ja[a].x,c=I.ja[a].y,e=this.Qe[a],g=this.Mb[e],!(0<=e&&g&&g.selected)||g&&Tb(g.Oc,0,0,b,c)||(Cb(I,g.keyCode),g.selected=!1,this.Qe[a]=-1),this.Ab(a,b,c))};
d.Ab=function(a,b,c){var e;if(!(0<=this.Qe[a]))for(e=0;e<this.Mb.length;e+=1){var g;if(g=this.Mb[e])g=(g=this.Mb[e])?Tb(g.Oc,0,0,b,c):!1;if(g&&!this.Mb[e].selected){Ab(I,this.Mb[e].keyCode);this.Mb[e].selected=!0;this.Qe[a]=e;break}}};d.Tb=function(a){var b=this.Qe[a];0<=b&&this.Mb[b]&&this.Mb[b].selected&&(Cb(I,this.Mb[b].keyCode),this.Mb[b].selected=!1);this.Qe[a]=-1};function Wb(a,b,c,e,g,h,k){c=Rb(c,e,g,h);a.Mb.push({keyCode:k,Oc:c,id:b,selected:!1})}
d.clear=function(){var a;for(a=this.Mb.length=0;16>a;a+=1)this.Qe[a]=-1};d.dc=function(a,b,c){var e,g,h,k;for(e=0;e<this.Mb.length;e+=1)if(g=this.Mb[e])g.selected?g.Oc.dc(0,0,b):g.Oc.dc(0,0,a),h=(g.Oc.Ea+g.Oc.$a)/2,k=(g.Oc.Ta+g.Oc.yb)/2,p.mc("id: "+g.id,h-20,k-10,c,"16px Arial"),p.mc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new fa;function Xb(a,b){return b}function L(a,b,c,e){return b+a/e*c}function Yb(a,b,c,e,g){void 0===g&&(g=3);return b+c*Math.pow(a/e,g)}
function Zb(a,b,c,e){return Yb(a,b,c,e,2)}function $b(a,b,c,e){return b+c*Yb(e-a,1,-1,e,2)}function ac(a,b,c,e){return Yb(a,b,c,e,3)}function bc(a,b,c,e){return b+c*Yb(e-a,1,-1,e,3)}function cc(a,b,c,e){return b+c*(a<e/2?Yb(a,0,.5,e/2,3):Yb(e-a,1,-.5,e/2,3))}function dc(a,b,c,e,g){a=e-a;var h=3,k=g;void 0===h&&(h=3);void 0===k&&(k=8);g=Math.sin(2*(1-a/e)*Math.PI*h+Math.PI/2);h=k;void 0===h&&(h=8);k=Math.pow(2,-h);g*=0+(Math.pow(2,h*a/e-h)-k)/(1-k)*1;return b+c*(1+-1*g)}
function ec(a,b,c,e,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/e,3)-g*Math.pow(a/e,2))}function M(a,b,c,e,g){return b+c*ec(e-a,1,-1,e,g)}
function fc(a){switch(1){case 0:return function(b,c,e,g,h,k,l){return 0>b?c:b>g?c+e:a(b,c,e,g,h,k,l)};case 1:return function(b,c,e,g,h,k,l){return a(b-Math.floor(b/g)*g,c,e,g,h,k,l)};case 2:return function(b,c,e,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+e*b};case 3:return function(b,c,e,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+e*h};case 4:return function(b,c,e,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+e*(n+b)};case 5:return function(b,c,e,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+e*(n+b)};default:return function(b,c,e,g,h,k,l){return a(b,c,e,g,h,k,l)}}}
function gc(a,b,c){var e,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(e=0;e<a.length;e+=1)g+=c[e];for(e=0;e<a.length;e+=1)c[e]/=g;for(e=0;e<a.length;e+=1)l.push(l[e]+c[e]),g=a[e]===Xb?0:b[e]?-1:1,k.push(k[e]+g),h=Math.max(h,k[e+1]);return function(e,g,w,A,E,s,t){var u,v;u=a.length-1;for(v=0;v<a.length;v+=1)if(e/A<=l[v+1]){u=v;break}e=a[u](e/A-l[u],0,1,c[u],E,s,t);b[u]&&(e=-e);return g+(k[u]+e)*w/h}}
var N=window.TG_InitSettings||{};N.size=void 0!==N.size?N.size:"big";N.Ht=N.usesFullScreen;N.Ho="big"===N.size?1:.5;N.of=20;N.xi=10;N.pf=0;N.Fk=-10;N.mn=-20;N.sb=-30;N.Yd=-40;
function O(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(N.Ho*a);break a;case "round":c=Math.round(N.Ho*a);break a;default:c=N.Ho*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=O(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=O(a[c],b));return a}}function P(a){return"big"===N.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}window.throbber=new lb("throbber","media/throbber.png");
window.TG_StartScreenLogo=new lb("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");var hc=new ra("StartTexture",2,"start");window.StartTexture=hc;sa(hc,0,"media/StartTexture0.png");sa(hc,1,"media/StartTexture1.png");var ic=new ra("StartScreenTexture",1,"load");window.StartScreenTexture=ic;sa(ic,0,"media/StartScreenTexture0.png");var Q=new ra("LevelMapScreenTexture",2,"load");window.LevelMapScreenTexture=Q;sa(Q,0,"media/LevelMapScreenTexture0.png");sa(Q,1,"media/LevelMapScreenTexture1.png");
var jc=new ra("LevelEndTexture",2,"load");window.LevelEndTexture=jc;sa(jc,0,"media/LevelEndTexture0.png");sa(jc,1,"media/LevelEndTexture1.png");var R=new ra("MenuTexture",2,"load");window.MenuTexture=R;sa(R,0,"media/MenuTexture0.png");sa(R,1,"media/MenuTexture1.png");var S=new ra("GameTexture",1,"load");window.GameTexture=S;sa(S,0,"media/GameTexture0.png");var kc=new ra("GameStaticTexture",3,"load");window.GameStaticTexture=kc;sa(kc,0,"media/GameStaticTexture0.png");sa(kc,1,"media/GameStaticTexture1.png");
sa(kc,2,"media/GameStaticTexture2.png");var lc=new r("s_loadingbar_background",ic,1,42,32,0,0,42,32,1);window.s_loadingbar_background=lc;lc.e(0,0,673,113,42,32,0,0);var mc=new r("s_level_0",Q,1,125,140,0,0,125,140,1);window.s_level_0=mc;mc.e(0,0,585,1,125,140,0,0);var nc=new r("s_level_1",Q,1,125,140,0,0,125,140,1);window.s_level_1=nc;nc.e(0,0,585,145,125,140,0,0);var oc=new r("s_level_2",Q,1,125,140,0,0,125,140,1);window.s_level_2=oc;oc.e(0,0,841,1,125,140,0,0);
var pc=new r("s_level_3",Q,1,125,140,0,0,125,140,1);window.s_level_3=pc;pc.e(0,0,713,1,125,140,0,0);var qc=new r("s_level_lock",Q,1,48,70,0,0,48,70,1);window.s_level_lock=qc;qc.e(0,0,969,1,48,69,0,1);var rc=new r("s_level_stars",Q,1,126,46,0,0,126,46,1);window.s_level_stars=rc;rc.e(0,0,713,145,126,45,0,1);var sc=new r("s_level2_0",Q,1,84,87,0,0,84,87,1);window.s_level2_0=sc;sc.e(0,0,585,289,84,87,0,0);var tc=new r("s_level2_1",Q,1,84,87,0,0,84,87,1);window.s_level2_1=tc;tc.e(0,0,673,305,84,87,0,0);
var uc=new r("s_level2_2",Q,1,84,87,0,0,84,87,1);window.s_level2_2=uc;uc.e(0,0,761,369,84,87,0,0);var vc=new r("s_level2_3",Q,1,84,87,0,0,84,87,1);window.s_level2_3=vc;vc.e(0,0,849,369,84,87,0,0);var wc=new r("s_level2_arrow_right",Q,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=wc;wc.e(0,0,825,257,60,108,0,0);wc.e(1,0,953,145,60,108,0,0);var xc=new r("s_level2_arrow_left",Q,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=xc;xc.e(0,0,889,257,60,108,0,0);xc.e(1,0,953,257,60,108,0,0);
var yc=new r("s_level2_lock",Q,1,84,87,0,0,84,87,1);window.s_level2_lock=yc;yc.e(0,0,937,369,84,87,0,0);var zc=new r("s_pop_medal",jc,8,378,378,189,189,3024,378,8);window.s_pop_medal=zc;zc.e(0,0,625,1,349,241,3,69);zc.e(1,0,625,529,346,267,5,54);zc.e(2,0,625,249,348,276,20,56);zc.e(3,1,1,1,342,288,26,50);zc.e(4,1,689,1,319,292,22,46);zc.e(5,1,1,297,337,304,14,41);zc.e(6,0,1,625,343,305,12,41);zc.e(7,1,345,1,341,304,13,41);var Ac=new r("s_medal_shadow",jc,1,195,208,0,0,195,208,1);
window.s_medal_shadow=Ac;Ac.e(0,1,745,513,189,204,3,1);var Bc=new r("s_medal_shine",jc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Bc;Bc.e(0,1,545,513,193,207,1,1);Bc.e(1,1,345,313,193,207,1,1);Bc.e(2,0,353,625,193,207,1,1);Bc.e(3,1,689,297,193,207,1,1);Bc.e(4,0,553,801,193,207,1,1);Bc.e(5,0,753,801,193,207,1,1);var Cc=new r("s_icon_toggle_hard",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Cc;Cc.e(0,0,873,345,67,67,0,0);var Dc=new r("s_icon_toggle_medium",R,1,67,67,0,0,67,67,1);
window.s_icon_toggle_medium=Dc;Dc.e(0,0,945,345,67,67,0,0);var Ec=new r("s_icon_toggle_easy",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Ec;Ec.e(0,0,929,617,67,67,0,0);var Fc=new r("s_flagIcon_us",R,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Fc;Fc.e(0,0,337,809,48,36,0,6);var Gc=new r("s_flagIcon_gb",R,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=Gc;Gc.e(0,0,225,809,48,36,0,6);var Hc=new r("s_flagIcon_nl",R,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Hc;Hc.e(0,0,281,809,48,36,0,6);
var Ic=new r("s_flagIcon_tr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Ic;Ic.e(0,0,169,809,48,36,0,6);var Jc=new r("s_flagIcon_de",R,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Jc;Jc.e(0,0,393,809,48,36,0,6);var Kc=new r("s_flagIcon_fr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Kc;Kc.e(0,0,449,809,48,36,0,6);var Lc=new r("s_flagIcon_br",R,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Lc;Lc.e(0,0,673,809,48,36,0,6);var Mc=new r("s_flagIcon_es",R,1,48,48,0,0,48,48,1);window.s_flagIcon_es=Mc;
Mc.e(0,0,841,833,48,36,0,6);var Nc=new r("s_flagIcon_jp",R,1,48,48,0,0,48,48,1);window.s_flagIcon_jp=Nc;Nc.e(0,0,785,809,48,36,0,6);var Oc=new r("s_flagIcon_ru",R,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=Oc;Oc.e(0,0,729,809,48,36,0,6);var Pc=new r("s_flagIcon_ar",R,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=Pc;Pc.e(0,0,617,809,48,36,0,6);var Qc=new r("s_flagIcon_kr",R,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=Qc;Qc.e(0,0,561,809,48,36,0,6);var Rc=new r("s_flagIcon_it",R,1,48,48,0,0,48,48,1);
window.s_flagIcon_it=Rc;Rc.e(0,0,505,809,48,36,0,6);var Sc=new r("s_tutorialButton_close",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=Sc;Sc.e(0,0,953,761,65,65,0,0);var Tc=new r("s_tutorialButton_next",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=Tc;Tc.e(0,0,929,689,66,65,0,0);var Uc=new r("s_tutorialButton_previous",R,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=Uc;Uc.e(0,0,881,761,66,65,0,0);var Vc=new r("s_logo_tinglygames",R,1,240,240,0,0,240,240,1);
window.s_logo_tinglygames=Vc;Vc.e(0,0,625,177,240,240,0,0);var Wc=new r("s_logo_coolgames",R,1,240,240,0,0,240,240,1);window.s_logo_coolgames=Wc;Wc.e(0,0,625,1,240,167,0,36);var Xc=new r("s_logo_tinglygames_start",ic,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=Xc;Xc.e(0,0,529,1,156,53,0,0);var Yc=new r("s_logo_coolgames_start",ic,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=Yc;Yc.e(0,0,689,1,150,104,75,0);var Zc=new r("s_ui_cup_highscore",S,1,32,28,0,0,32,28,1);
window.s_ui_cup_highscore=Zc;Zc.e(0,0,969,121,32,28,0,0);var $c=new r("s_ui_cup_score",S,1,28,24,0,0,28,24,1);window.s_ui_cup_score=$c;$c.e(0,0,969,153,28,24,0,0);var ad=new r("s_ui_divider",kc,1,94,2,0,0,94,2,1);window.s_ui_divider=ad;ad.e(0,0,769,481,94,2,0,0);var bd=new r("s_ui_background_blank",kc,1,140,580,0,0,140,580,1);window.s_ui_background_blank=bd;bd.e(0,0,625,1,140,580,0,0);var cd=new r("s_ui_highscore",kc,1,26,36,13,12,26,36,1);window.s_ui_highscore=cd;cd.e(0,0,921,481,26,36,0,0);
var dd=new r("s_ui_timeleft",kc,1,20,26,0,0,20,26,1);window.s_ui_timeleft=dd;dd.e(0,0,953,481,20,26,0,0);var ed=new r("s_ui_smiley_hard",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_hard=ed;ed.e(0,0,1001,1,22,22,0,0);var fd=new r("s_ui_smiley_medium",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_medium=fd;fd.e(0,0,1001,25,22,22,0,0);var gd=new r("s_ui_smiley_easy",S,1,22,22,11,11,22,22,1);window.s_ui_smiley_easy=gd;gd.e(0,0,1001,49,22,22,0,0);var hd=new r("s_ui_crown",S,1,24,20,12,10,24,20,1);
window.s_ui_crown=hd;hd.e(0,0,969,217,24,20,0,0);var id=new r("s_ui_heart",S,1,28,24,14,12,28,24,1);window.s_ui_heart=id;id.e(0,0,969,185,26,23,1,1);var jd=new r("s_level_preview_frame_locked",Q,1,108,110,0,0,108,110,1);window.s_level_preview_frame_locked=jd;jd.e(0,0,713,193,108,110,0,0);var kd=new r("s_level_preview_frame",Q,1,108,110,0,0,108,110,1);window.s_level_preview_frame=kd;kd.e(0,0,841,145,108,110,0,0);var ld=new r("s_icon_toggle_sfx_on",R,1,67,67,0,0,67,67,1);
window.s_icon_toggle_sfx_on=ld;ld.e(0,0,113,809,49,31,7,17);var md=new r("s_icon_toggle_sfx_off",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=md;md.e(0,0,1,809,53,31,7,17);var nd=new r("s_icon_toggle_music_on",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=nd;nd.e(0,0,977,153,38,41,13,16);var od=new r("s_icon_toggle_music_off",R,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=od;od.e(0,0,57,809,51,41,8,16);var pd=new r("s_btn_small_exit",R,2,100,92,0,0,200,92,2);
window.s_btn_small_exit=pd;pd.e(0,0,569,713,100,92,0,0);pd.e(1,0,873,153,100,92,0,0);var qd=new r("s_btn_small_pause",S,2,100,92,0,0,200,92,2);window.s_btn_small_pause=qd;qd.e(0,0,489,161,100,92,0,0);qd.e(1,0,865,153,100,92,0,0);var rd=new r("s_btn_small_options",R,2,100,92,0,0,200,92,2);window.s_btn_small_options=rd;rd.e(0,0,873,249,100,92,0,0);rd.e(1,0,465,713,100,92,0,0);var sd=new r("s_btn_small_retry",jc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=sd;sd.e(0,1,889,297,100,92,0,0);
sd.e(1,1,889,393,100,92,0,0);var td=new r("s_btn_standard",R,2,96,92,0,0,192,92,2);window.s_btn_standard=td;td.e(0,0,673,713,96,92,0,0);td.e(1,0,777,713,96,92,0,0);var ud=new r("s_btn_toggle",R,2,162,92,0,0,324,92,2);window.s_btn_toggle=ud;ud.e(0,0,857,521,162,92,0,0);ud.e(1,0,857,425,162,92,0,0);var vd=new r("s_icon_toggle_fxoff",R,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=vd;vd.e(0,0,625,425,227,92,0,0);vd.e(1,0,465,617,227,92,0,0);
var wd=new r("s_icon_toggle_fxon",R,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=wd;wd.e(0,0,625,521,227,92,0,0);wd.e(1,0,1,617,227,92,0,0);var xd=new r("s_icon_toggle_musicoff",R,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicoff=xd;xd.e(0,0,233,617,227,92,0,0);xd.e(1,0,697,617,227,92,0,0);var yd=new r("s_icon_toggle_musicon",R,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=yd;yd.e(0,0,1,713,227,92,0,0);yd.e(1,0,233,713,227,92,0,0);
var zd=new r("s_btn_big_start",jc,2,137,104,0,0,274,104,2);window.s_btn_big_start=zd;zd.e(0,1,1,609,137,104,0,0);zd.e(1,1,545,313,137,104,0,0);var Ad=new r("s_btn_bigtext",ic,2,137,104,0,0,274,104,2);window.s_btn_bigtext=Ad;Ad.e(0,0,841,1,137,104,0,0);Ad.e(1,0,529,57,137,104,0,0);var Bd=new r("s_btn_big_restart",jc,2,154,152,0,0,308,152,2);window.s_btn_big_restart=Bd;Bd.e(0,0,353,841,154,152,0,0);Bd.e(1,1,345,529,154,152,0,0);var Cd=new r("s_overlay_assignment",kc,1,605,348,0,0,605,348,1);
window.s_overlay_assignment=Cd;Cd.e(0,0,1,561,605,348,0,0);var Dd=new r("s_overlay_options",R,1,620,620,0,0,620,620,1);window.s_overlay_options=Dd;Dd.e(0,0,1,1,618,613,0,0);var Ed=new r("s_screen_start",hc,4,576,320,0,0,1152,640,2);window.s_screen_start=Ed;Ed.e(0,0,1,329,576,320,0,0);Ed.e(1,1,1,1,576,320,0,0);Ed.e(2,0,1,1,576,320,0,0);Ed.e(3,0,1,657,576,320,0,0);var Fd=new r("s_tutorial",R,1,524,561,0,0,524,561,1);window.s_tutorial=Fd;Fd.e(0,1,1,1,524,561,0,0);
var Gd=new r("s_overlay_dialog",kc,1,616,554,0,0,616,554,1);window.s_overlay_dialog=Gd;Gd.e(0,0,1,1,616,554,0,0);var Hd=new r("s_overlay_difficulty",jc,1,620,620,0,0,620,620,1);window.s_overlay_difficulty=Hd;Hd.e(0,0,1,1,620,620,0,0);var Jd=new r("s_screen_levelselect",Q,4,576,320,0,0,1152,640,2);window.s_screen_levelselect=Jd;Jd.e(0,0,1,1,576,320,0,0);Jd.e(1,0,1,329,576,320,0,0);Jd.e(2,0,1,657,576,320,0,0);Jd.e(3,1,1,1,576,320,0,0);var Kd=new r("s_seasons_01_red_01",S,1,88,98,0,0,88,98,1);
window.s_seasons_01_red_01=Kd;Kd.e(0,0,385,481,88,97,0,0);var Ld=new r("s_seasons_01_red_02",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_02=Ld;Ld.e(0,0,97,481,88,97,0,0);var Md=new r("s_seasons_01_red_03",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_03=Md;Md.e(0,0,289,481,88,97,0,0);var Od=new r("s_seasons_01_red_04",S,1,88,98,0,0,88,98,1);window.s_seasons_01_red_04=Od;Od.e(0,0,673,489,88,97,0,0);var Pd=new r("s_seasons_02_green_01",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_01=Pd;
Pd.e(0,0,769,561,88,97,0,0);var Qd=new r("s_seasons_02_green_02",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_02=Qd;Qd.e(0,0,577,489,88,97,0,0);var Rd=new r("s_seasons_02_green_03",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_03=Rd;Rd.e(0,0,385,585,88,97,0,0);var Sd=new r("s_seasons_02_green_04",S,1,88,98,0,0,88,98,1);window.s_seasons_02_green_04=Sd;Sd.e(0,0,193,481,88,97,0,0);var Td=new r("s_logo",ic,1,524,258,0,0,524,258,1);window.s_logo=Td;Td.e(0,0,1,1,524,258,0,0);
var Ud=new r("ImgTileOverlay",S,1,88,98,0,0,88,98,1);window.ImgTileOverlay=Ud;Ud.e(0,0,961,457,58,81,1,1);var Vd=new r("s_effect_hint",S,9,106,106,0,0,954,106,9);window.s_effect_hint=Vd;Vd.e(0,0,961,249,61,84,17,8);Vd.e(1,0,553,697,63,86,16,7);Vd.e(2,0,321,689,67,90,14,5);Vd.e(3,0,81,689,68,91,14,5);Vd.e(4,0,785,153,78,101,9,0);Vd.e(5,0,1,657,72,95,12,3);Vd.e(6,0,393,689,67,90,14,5);Vd.e(7,0,625,697,63,86,16,7);Vd.e(8,0,593,161,61,84,17,8);var Wd=new r("s_effect_select",S,7,164,164,0,0,1148,164,7);
window.s_effect_select=Wd;Wd.e(0,0,481,673,68,92,48,34);Wd.e(1,0,897,665,68,92,48,34);Wd.e(2,0,673,593,72,95,46,33);Wd.e(3,0,825,665,70,93,48,34);Wd.e(4,0,753,665,69,93,47,33);Wd.e(5,0,153,689,69,91,47,35);Wd.e(6,0,785,257,70,93,47,34);var Xd=new r("s_tutorial_01",kc,1,350,190,0,0,350,190,1);window.s_tutorial_01=Xd;Xd.e(0,0,769,337,246,137,52,27);var Yd=new r("s_tutorial_02",kc,1,350,190,0,0,350,190,1);window.s_tutorial_02=Yd;Yd.e(0,0,769,193,246,137,52,27);
var Zd=new r("s_tutorial_03",kc,1,350,190,0,0,350,190,1);window.s_tutorial_03=Zd;Zd.e(0,0,769,1,246,186,51,4);var $d=new r("s_tutorial_04",kc,1,350,190,0,0,350,190,1);window.s_tutorial_04=$d;$d.e(0,0,609,585,282,171,34,19);var ae=new r("ImgTileBamboo1",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo1=ae;ae.e(0,0,865,561,88,97,0,0);var be=new r("ImgTileBamboo2",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo2=be;be.e(0,0,481,569,88,97,0,0);var ce=new r("ImgTileBamboo3",S,1,88,98,0,0,88,98,1);
window.ImgTileBamboo3=ce;ce.e(0,0,577,593,88,97,0,0);var de=new r("ImgTileBamboo4",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo4=de;de.e(0,0,289,585,88,97,0,0);var ee=new r("ImgTileBamboo5",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo5=ee;ee.e(0,0,97,585,88,97,0,0);var fe=new r("ImgTileBamboo6",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo6=fe;fe.e(0,0,193,585,88,97,0,0);var ge=new r("ImgTileBamboo7",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo7=ge;ge.e(0,0,1,553,88,97,0,0);
var he=new r("ImgTileBamboo8",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo8=he;he.e(0,0,577,385,88,97,0,0);var ie=new r("ImgTileBamboo9",S,1,88,98,0,0,88,98,1);window.ImgTileBamboo9=ie;ie.e(0,0,97,273,88,97,0,0);var je=new r("ImgTileChar1",S,1,88,98,0,0,88,98,1);window.ImgTileChar1=je;je.e(0,0,193,273,88,97,0,0);var ke=new r("ImgTileChar2",S,1,88,98,0,0,88,98,1);window.ImgTileChar2=ke;ke.e(0,0,289,273,88,97,0,0);var le=new r("ImgTileChar3",S,1,88,98,0,0,88,98,1);window.ImgTileChar3=le;
le.e(0,0,385,273,88,97,0,0);var me=new r("ImgTileChar4",S,1,88,98,0,0,88,98,1);window.ImgTileChar4=me;me.e(0,0,585,281,88,97,0,0);var ne=new r("ImgTileChar5",S,1,88,98,0,0,88,98,1);window.ImgTileChar5=ne;ne.e(0,0,489,257,88,97,0,0);var oe=new r("ImgTileChar6",S,1,88,98,0,0,88,98,1);window.ImgTileChar6=oe;oe.e(0,0,865,249,88,97,0,0);var pe=new r("ImgTileChar7",S,1,88,98,0,0,88,98,1);window.ImgTileChar7=pe;pe.e(0,0,201,169,88,97,0,0);var qe=new r("ImgTileChar8",S,1,88,98,0,0,88,98,1);
window.ImgTileChar8=qe;qe.e(0,0,297,169,88,97,0,0);var re=new r("ImgTileChar9",S,1,88,98,0,0,88,98,1);window.ImgTileChar9=re;re.e(0,0,393,169,88,97,0,0);var se=new r("ImgTileCircle1",S,1,88,98,0,0,88,98,1);window.ImgTileCircle1=se;se.e(0,0,1,241,88,97,0,0);var te=new r("ImgTileCircle2",S,1,88,98,0,0,88,98,1);window.ImgTileCircle2=te;te.e(0,0,681,281,88,97,0,0);var ue=new r("ImgTileCircle3",S,1,88,98,0,0,88,98,1);window.ImgTileCircle3=ue;ue.e(0,0,1,345,88,97,0,0);
var ve=new r("ImgTileCircle4",S,1,88,98,0,0,88,98,1);window.ImgTileCircle4=ve;ve.e(0,0,777,353,88,97,0,0);var we=new r("ImgTileCircle5",S,1,88,98,0,0,88,98,1);window.ImgTileCircle5=we;we.e(0,0,673,385,88,97,0,0);var xe=new r("ImgTileCircle6",S,1,88,98,0,0,88,98,1);window.ImgTileCircle6=xe;xe.e(0,0,1,449,88,97,0,0);var ye=new r("ImgTileCircle7",S,1,88,98,0,0,88,98,1);window.ImgTileCircle7=ye;ye.e(0,0,769,457,88,97,0,0);var ze=new r("ImgTileCircle8",S,1,88,98,0,0,88,98,1);window.ImgTileCircle8=ze;
ze.e(0,0,865,457,88,97,0,0);var Ae=new r("ImgTileCircle9",S,1,88,98,0,0,88,98,1);window.ImgTileCircle9=Ae;Ae.e(0,0,105,169,88,97,0,0);var Be=new r("ImgTileDragon1",S,1,88,98,0,0,88,98,1);window.ImgTileDragon1=Be;Be.e(0,0,385,377,88,97,0,0);var Ce=new r("ImgTileDragon2",S,1,88,98,0,0,88,98,1);window.ImgTileDragon2=Ce;Ce.e(0,0,289,377,88,97,0,0);var De=new r("ImgTileDragon3",S,1,88,98,0,0,88,98,1);window.ImgTileDragon3=De;De.e(0,0,873,353,88,97,0,0);
var Ee=new r("ImgTileHonor1",S,1,88,98,0,0,88,98,1);window.ImgTileHonor1=Ee;Ee.e(0,0,481,361,88,97,0,0);var Fe=new r("ImgTileHonor2",S,1,88,98,0,0,88,98,1);window.ImgTileHonor2=Fe;Fe.e(0,0,97,377,88,97,0,0);var Ge=new r("ImgTileHonor3",S,1,88,98,0,0,88,98,1);window.ImgTileHonor3=Ge;Ge.e(0,0,193,377,88,97,0,0);var He=new r("ImgTileHonor4",S,1,88,98,0,0,88,98,1);window.ImgTileHonor4=He;He.e(0,0,481,465,88,97,0,0);var Ie=new r("ImgDissapear",S,13,164,164,40,35,2132,164,13);window.ImgDissapear=Ie;
Ie.e(0,0,969,1,29,116,70,28);Ie.e(1,0,657,1,7,149,79,12);Ie.e(2,0,433,1,48,161,57,2);Ie.e(3,0,337,1,94,161,42,2);Ie.e(4,0,657,153,120,125,21,16);Ie.e(5,0,673,1,149,147,7,9);Ie.e(6,0,489,1,159,158,2,0);Ie.e(7,0,169,1,162,162,1,1);Ie.e(8,0,1,1,162,164,1,0);Ie.e(9,0,825,1,137,145,11,5);Ie.e(10,0,697,761,79,62,38,50);Ie.e(11,0,225,689,90,76,37,43);Ie.e(12,0,1,169,98,70,40,40);var Je=new r("s_background",kc,4,576,320,0,0,1152,640,2);window.s_background=Je;Je.e(0,1,1,657,576,320,0,0);
Je.e(1,1,1,329,576,320,0,0);Je.e(2,2,1,1,576,320,0,0);Je.e(3,1,1,1,576,320,0,0);var Ke=new r("s_refresh_icon",kc,1,84,84,42,42,84,84,1);window.s_refresh_icon=Ke;Ke.e(0,0,865,481,52,58,16,13);var Le=new r("s_refresh_left",kc,1,361,560,0,0,361,560,1);window.s_refresh_left=Le;Le.e(0,2,585,1,361,560,0,0);var Me=new r("s_refresh_right",kc,1,320,560,0,0,320,560,1);window.s_refresh_right=Me;Me.e(0,1,585,1,320,560,0,0);var Ne=new r("s_levelicon_0",Q,1,84,84,0,0,84,84,1);window.s_levelicon_0=Ne;
Ne.e(0,0,849,641,84,84,0,0);var Oe=new r("s_levelicon_1",Q,1,84,84,0,0,84,84,1);window.s_levelicon_1=Oe;Oe.e(0,0,761,641,84,84,0,0);var Pe=new r("s_levelicon_10",Q,1,84,84,0,0,84,84,1);window.s_levelicon_10=Pe;Pe.e(0,0,673,665,84,84,0,0);var Qe=new r("s_levelicon_11",Q,1,84,84,0,0,84,84,1);window.s_levelicon_11=Qe;Qe.e(0,0,585,649,84,84,0,0);var Re=new r("s_levelicon_12",Q,1,84,84,0,0,84,84,1);window.s_levelicon_12=Re;Re.e(0,0,937,641,84,84,0,0);var Se=new r("s_levelicon_13",Q,1,84,84,0,0,84,84,1);
window.s_levelicon_13=Se;Se.e(0,0,937,729,84,84,0,0);var Te=new r("s_levelicon_14",Q,1,84,84,0,0,84,84,1);window.s_levelicon_14=Te;Te.e(0,0,673,753,84,84,0,0);var Ue=new r("s_levelicon_15",Q,1,84,84,0,0,84,84,1);window.s_levelicon_15=Ue;Ue.e(0,0,937,817,84,84,0,0);var Ve=new r("s_levelicon_16",Q,1,84,84,0,0,84,84,1);window.s_levelicon_16=Ve;Ve.e(0,0,849,817,84,84,0,0);var We=new r("s_levelicon_17",Q,1,84,84,0,0,84,84,1);window.s_levelicon_17=We;We.e(0,0,761,817,84,84,0,0);
var Xe=new r("s_levelicon_18",Q,1,84,84,0,0,84,84,1);window.s_levelicon_18=Xe;Xe.e(0,0,585,737,84,84,0,0);var Ye=new r("s_levelicon_19",Q,1,84,84,0,0,84,84,1);window.s_levelicon_19=Ye;Ye.e(0,0,849,729,84,84,0,0);var Ze=new r("s_levelicon_2",Q,1,84,84,0,0,84,84,1);window.s_levelicon_2=Ze;Ze.e(0,0,849,553,84,84,0,0);var $e=new r("s_levelicon_20",Q,1,84,84,0,0,84,84,1);window.s_levelicon_20=$e;$e.e(0,0,585,385,84,84,0,0);var af=new r("s_levelicon_21",Q,1,84,84,0,0,84,84,1);window.s_levelicon_21=af;
af.e(0,0,849,465,84,84,0,0);var bf=new r("s_levelicon_22",Q,1,84,84,0,0,84,84,1);window.s_levelicon_22=bf;bf.e(0,0,761,465,84,84,0,0);var cf=new r("s_levelicon_23",Q,1,84,84,0,0,84,84,1);window.s_levelicon_23=cf;cf.e(0,0,673,401,84,84,0,0);var df=new r("s_levelicon_24",Q,1,84,84,0,0,84,84,1);window.s_levelicon_24=df;df.e(0,0,937,465,84,84,0,0);var ef=new r("s_levelicon_3",Q,1,84,84,0,0,84,84,1);window.s_levelicon_3=ef;ef.e(0,0,673,489,84,84,0,0);var ff=new r("s_levelicon_4",Q,1,84,84,0,0,84,84,1);
window.s_levelicon_4=ff;ff.e(0,0,761,553,84,84,0,0);var gf=new r("s_levelicon_5",Q,1,84,84,0,0,84,84,1);window.s_levelicon_5=gf;gf.e(0,0,673,577,84,84,0,0);var hf=new r("s_levelicon_6",Q,1,84,84,0,0,84,84,1);window.s_levelicon_6=hf;hf.e(0,0,585,561,84,84,0,0);var jf=new r("s_levelicon_7",Q,1,84,84,0,0,84,84,1);window.s_levelicon_7=jf;jf.e(0,0,937,553,84,84,0,0);var kf=new r("s_levelicon_8",Q,1,84,84,0,0,84,84,1);window.s_levelicon_8=kf;kf.e(0,0,585,473,84,84,0,0);
var lf=new r("s_levelicon_9",Q,1,84,84,0,0,84,84,1);window.s_levelicon_9=lf;lf.e(0,0,761,729,84,84,0,0);var mf=new r("s_logo_preload_tinglygames",hc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=mf;mf.e(0,0,585,1,320,54,0,0);var nf=new r("s_loadingbar_bg",hc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=nf;nf.e(0,0,913,1,38,20,0,0);var of=new r("s_loadingbar_fill",hc,1,30,12,0,0,30,12,1);window.s_loadingbar_fill=of;of.e(0,0,953,1,30,12,0,0);
var pf=new r("s_logo_about",R,1,121,121,0,0,121,121,1);window.s_logo_about=pf;pf.e(0,0,873,65,117,80,2,21);var qf=new r("s_logo_poki_about",R,1,123,58,0,0,123,58,1);window.s_logo_poki_about=qf;qf.e(0,0,873,1,123,58,0,0);var rf=new r("s_logo_poki_start",hc,1,120,60,0,0,120,60,1);window.s_logo_poki_start=rf;rf.e(0,0,793,57,119,59,1,1);var sf=new r("s_ads_background",hc,1,200,200,100,100,200,200,1);window.s_ads_background=sf;sf.e(0,0,585,57,200,200,0,0);
var tf=new ua("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=tf;var T=new B("f_default","Arial");window.f_default=T;D(T,12);T.fill=!0;T.setFillColor("Black");ya(T,1);Aa(T,!1);T.setStrokeColor("Black");Da(T,1);Fa(T,"miter");Ca(T,1);Ea(T,!1);F(T,"left");G(T,"top");T.za=0;T.V=0;var uf=new ua("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=uf;
var vf=new ua("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=vf;var wf=new ua("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=wf;var xf=new ua("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=xf;var yf=new B("ff_opensans_bold","Arial");window.f_game_ui_tiny=yf;D(yf,11);
yf.fill=!0;yf.setFillColor("#799EC5");ya(yf,1);Aa(yf,!1);yf.setStrokeColor("White");Da(yf,1);Fa(yf,"miter");Ca(yf,1);Ea(yf,!1);F(yf,"center");G(yf,"middle");yf.za=0;yf.V=0;var V=new B("ff_opensans_bold","Arial");window.f_game_ui=V;D(V,23);V.fill=!0;V.setFillColor("#799EC5");ya(V,1);Aa(V,!1);V.setStrokeColor("Black");Da(V,1);Fa(V,"miter");Ca(V,1);Ea(V,!1);F(V,"center");G(V,"middle");V.za=0;V.V=0;var zf=new B("ff_opensans_bolditalic","Arial");window.f_game_ui_large=zf;D(zf,52);zf.fill=!0;zf.setFillColor("#172348");
ya(zf,1);Aa(zf,!1);zf.setStrokeColor("Black");Da(zf,1);Fa(zf,"miter");Ca(zf,1);Ea(zf,!1);F(zf,"center");G(zf,"middle");zf.za=0;zf.V=0;var Af=new ua("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");window.floaterFontFaceLoader=Af;var Bf=new ua("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Bf;var Cf=new B("floaterFontFace","Arial");window.floaterFontText1=Cf;D(Cf,24);xa(Cf,"normal");
Cf.fill=!0;Cf.setFillColor("#FFDE00");ya(Cf,1);Aa(Cf,!0);Cf.setStrokeColor("#6F1F00");Da(Cf,4);Fa(Cf,"miter");Ca(Cf,1);Ea(Cf,!0);Ga(Cf,"rgba(57,0,0,0.46)",4);F(Cf,"left");G(Cf,"top");Cf.za=0;Cf.V=0;var Df=new B("floaterFontFace","Arial");window.floaterFontText2=Df;D(Df,28);xa(Df,"normal");Df.fill=!0;za(Df,2,["#FFF600","#00DB48","blue"],.65,.02);ya(Df,1);Aa(Df,!0);Df.setStrokeColor("#073400");Da(Df,4);Fa(Df,"miter");Ca(Df,1);Ea(Df,!0);Ga(Df,"rgba(0,57,43,0.47)",4);F(Df,"left");G(Df,"top");Df.za=0;
Df.V=0;var Ef=new B("floaterFontFace","Arial");window.floaterFontText3=Ef;D(Ef,30);xa(Ef,"normal");Ef.fill=!0;za(Ef,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);ya(Ef,1);Aa(Ef,!0);Ef.setStrokeColor("#4F0027");Da(Ef,4);Fa(Ef,"miter");Ca(Ef,1);Ea(Ef,!0);Ga(Ef,"rgba(41,0,0,0.48)",5);F(Ef,"left");G(Ef,"top");Ef.za=0;Ef.V=0;var Ff=new B("floaterFontFace","Arial");window.floaterFontText4=Ff;D(Ff,34);xa(Ff,"normal");Ff.fill=!0;za(Ff,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);ya(Ff,1);Aa(Ff,!0);Ff.setStrokeColor("#001637");
Da(Ff,4);Fa(Ff,"miter");Ca(Ff,1);Ea(Ff,!0);Ga(Ff,"rgba(0,35,75,0.49)",6);F(Ff,"left");G(Ff,"top");Ff.za=0;Ff.V=0;var Gf=new B("floaterNumberFontFace","Arial");window.floaterFontNumberPositive=Gf;D(Gf,30);Gf.fill=!0;Gf.setFillColor("White");ya(Gf,1);Aa(Gf,!0);Gf.setStrokeColor("#00106F");Da(Gf,2);Fa(Gf,"miter");Ca(Gf,1);Ea(Gf,!1);Ga(Gf,"rgba(0,4,57,0.51)",4);F(Gf,"left");G(Gf,"top");Gf.za=0;Gf.V=0;var Hf=new B("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=Hf;D(Hf,30);xa(Hf,"normal");
Hf.fill=!0;Hf.setFillColor("#FF1E00");ya(Hf,1);Aa(Hf,!0);Hf.setStrokeColor("#3F0000");Da(Hf,2);Fa(Hf,"miter");Ca(Hf,1);Ea(Hf,!1);Ga(Hf,"rgba(57,0,0,0.49)",4);F(Hf,"left");G(Hf,"top");Hf.za=0;Hf.V=0;var If=new ua("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");window.f_themeDefaultLoader=If;var W=new B("f_themeDefault","Arial");window.f_themeDefault=W;D(W,12);W.fill=!0;W.setFillColor("Black");ya(W,1);Aa(W,!1);W.setStrokeColor("White");Da(W,5);Fa(W,"miter");Ca(W,1);
Ea(W,!0);F(W,"left");G(W,"top");W.za=0;W.V=0;var Jf=new B("ff_opensans_bolditalic","Arial");window.f_awesome=Jf;D(Jf,25);xa(Jf,"normal");Jf.fill=!0;za(Jf,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);ya(Jf,1);Aa(Jf,!0);Jf.setStrokeColor("#001637");Da(Jf,4);Fa(Jf,"round");Ca(Jf,1);Ea(Jf,!0);Ga(Jf,"rgba(0,35,75,0.49)",3);F(Jf,"left");G(Jf,"top");Jf.za=0;Jf.V=0;var Kf=new B("ff_opensans_bolditalic","Arial");window.f_great=Kf;D(Kf,24);xa(Kf,"normal");Kf.fill=!0;
za(Kf,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);ya(Kf,1);Aa(Kf,!0);Kf.setStrokeColor("#4F0027");Da(Kf,4);Fa(Kf,"round");Ca(Kf,1);Ea(Kf,!0);Ga(Kf,"rgba(41,0,0,0.48)",3);F(Kf,"left");G(Kf,"top");Kf.za=0;Kf.V=0;var Lf=new B("ff_opensans_bolditalic","Arial");window.f_nice=Lf;D(Lf,24);xa(Lf,"normal");Lf.fill=!0;za(Lf,2,["#FFF600","#00DB48","blue"],.65,.02);ya(Lf,1);Aa(Lf,!0);Lf.setStrokeColor("#073400");Da(Lf,4);Fa(Lf,"round");Ca(Lf,1);Ea(Lf,!0);Ga(Lf,"rgba(0,57,43,0.47)",2);F(Lf,"left");G(Lf,"top");
Lf.za=0;Lf.V=0;var Mf=new B("Arial","Arial");window.f_tap_to_play=Mf;D(Mf,28);xa(Mf,"bold");Mf.fill=!0;Mf.setFillColor("#1b2b34");ya(Mf,1);Aa(Mf,!1);Mf.setStrokeColor("Black");Da(Mf,28);Fa(Mf,"round");Ca(Mf,.55);Ea(Mf,!1);F(Mf,"center");G(Mf,"middle");Mf.za=0;Mf.V=0;var Nf=new B("Arial","Arial");window.f_adblocker=Nf;D(Nf,28);xa(Nf,"normal");Nf.fill=!0;Nf.setFillColor("White");ya(Nf,1);Aa(Nf,!1);Nf.setStrokeColor("Black");Da(Nf,28);Fa(Nf,"round");Ca(Nf,.55);Ea(Nf,!1);F(Nf,"center");G(Nf,"middle");
Nf.za=0;Nf.V=0;var Of=new B("Arial","Arial");window.f_copyright=Of;D(Of,22);xa(Of,"bold");Of.fill=!0;Of.setFillColor("#1b2b34");ya(Of,1);Aa(Of,!1);Of.setStrokeColor("Black");Da(Of,28);Fa(Of,"round");Ca(Of,.55);Ea(Of,!1);F(Of,"left");G(Of,"middle");Of.za=0;Of.V=0;var Pf=new B("Arial","Arial");window.f_thankyou=Pf;D(Pf,50);xa(Pf,"bold");Pf.fill=!0;Pf.setFillColor("#1b2b34");ya(Pf,1);Aa(Pf,!1);Pf.setStrokeColor("Black");Da(Pf,28);Fa(Pf,"round");Ca(Pf,.55);Ea(Pf,!1);F(Pf,"center");G(Pf,"middle");
Pf.za=0;Pf.V=0;var Qf=new B("Arial","Arial");window.f_loading_game=Qf;D(Qf,20);xa(Qf,"bold");Qf.fill=!0;Qf.setFillColor("#1b2b34");ya(Qf,1);Aa(Qf,!1);Qf.setStrokeColor("Black");Da(Qf,28);Fa(Qf,"round");Ca(Qf,.55);Ea(Qf,!1);F(Qf,"left");G(Qf,"middle");Qf.za=0;Qf.V=0;var Rf=new B("Arial","Arial");window.f_interstitial=Rf;D(Rf,20);xa(Rf,"bold");Rf.fill=!0;Rf.setFillColor("#1b2b34");ya(Rf,.38);Aa(Rf,!1);Rf.setStrokeColor("Black");Da(Rf,28);Fa(Rf,"round");Ca(Rf,.55);Ea(Rf,!1);F(Rf,"center");G(Rf,"middle");
Rf.za=0;Rf.V=0;var Sf=new kb("as_music","audio/as_music.mp3","audio/as_music.ogg","audio_music");window.as_music=Sf;var Tf=new kb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=Tf;var Uf=new db("a_music",Sf,0,36571,1,1,["music"]);window.a_music=Uf;var Vf=new db("a_tileSelection_first",Tf,0,352,1,10,["game"]);window.a_tileSelection_first=Vf;var Wf=new db("a_tileSelection_second",Tf,2E3,529,1,10,["game"]);window.a_tileSelection_second=Wf;
var Xf=new db("a_tileRemove",Tf,4E3,869,1,10,["game"]);window.a_tileRemove=Xf;var Yf=new db("a_tileShuffle",Tf,6E3,736,1,10,["game"]);window.a_tileShuffle=Yf;var Zf=new db("a_doorsClose",Tf,8E3,1062,1,10,["game"]);window.a_doorsClose=Zf;var $f=new db("a_doorsOpen",Tf,11E3,902,1,10,["game"]);window.a_doorsOpen=$f;var ag=new db("a_levelStart",Tf,13E3,1002,1,10,["sfx"]);window.a_levelStart=ag;var bg=new db("a_levelComplete",Tf,16E3,1002,1,10,["sfx"]);window.a_levelComplete=bg;
var dg=new db("a_mouseDown",Tf,19E3,471,1,10,["sfx"]);window.a_mouseDown=dg;var eg=new db("a_levelend_star_01",Tf,21E3,1161,1,10,["sfx"]);window.a_levelend_star_01=eg;var fg=new db("a_levelend_star_02",Tf,24E3,1070,1,10,["sfx"]);window.a_levelend_star_02=fg;var gg=new db("a_levelend_star_03",Tf,27E3,1039,1,10,["sfx"]);window.a_levelend_star_03=gg;var hg=new db("a_levelend_fail",Tf,3E4,1572,1,10,["sfx"]);window.a_levelend_fail=hg;var ig=new db("a_levelend_score_counter",Tf,33E3,54,1,10,["sfx"]);
window.a_levelend_score_counter=ig;var jg=new db("a_levelend_score_end",Tf,35E3,888,1,10,["sfx"]);window.a_levelend_score_end=jg;var kg=new db("a_medal",Tf,37E3,1225,1,10,["sfx"]);window.a_medal=kg;var X=X||{};X["nl-nl"]=X["nl-nl"]||{};X["nl-nl"].loadingScreenLoading="Laden...";X["nl-nl"].startScreenPlay="SPELEN";X["nl-nl"].levelMapScreenTotalScore="Totale score";X["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";X["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";
X["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";X["nl-nl"].levelEndScreenTotalScore="Totale score";X["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";X["nl-nl"].levelEndScreenTimeLeft="Tijd over";X["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";X["nl-nl"].levelEndScreenHighScore="High score";X["nl-nl"].optionsStartScreen="Hoofdmenu";X["nl-nl"].optionsQuit="Stop";X["nl-nl"].optionsResume="Terug naar spel";X["nl-nl"].optionsTutorial="Speluitleg";X["nl-nl"].optionsHighScore="High scores";
X["nl-nl"].optionsMoreGames="Meer Spellen";X["nl-nl"].optionsDifficulty_easy="Makkelijk";X["nl-nl"].optionsDifficulty_medium="Gemiddeld";X["nl-nl"].optionsDifficulty_hard="Moeilijk";X["nl-nl"].optionsMusic_on="Aan";X["nl-nl"].optionsMusic_off="Uit";X["nl-nl"].optionsSFX_on="Aan";X["nl-nl"].optionsSFX_off="Uit";X["nl-nl"]["optionsLang_en-us"]="Engels (US)";X["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";X["nl-nl"]["optionsLang_nl-nl"]="Nederlands";X["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";
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
var lg={};
function mg(){lg={ae:{Rk:"en-us",Qj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Sd:{Hc:O(1040),oq:O(960),Qb:O(640),Bg:O(640),hf:O(0),kl:O(-80),gf:0,minHeight:O(780),Qm:{id:"canvasBackground",depth:50},Dc:{id:"canvasGame",depth:100,top:O(200,"round"),left:O(40,"round"),width:O(560,"round"),height:O(560,"round")},Ec:{id:"canvasGameUI",depth:150,top:0,left:0,height:O(120,"round")},cf:{id:"canvasMain",depth:200}},bk:{Hc:O(640),oq:O(640),Qb:O(1152),Bg:O(1152),
hf:O(0),kl:O(0),gf:0,minHeight:O(640),minWidth:O(850),Qm:{id:"canvasBackground",depth:50},Dc:{id:"canvasGame",depth:100,top:O(40,"round"),left:O(296,"round"),width:O(560,"round"),height:O(560,"round")},Ec:{id:"canvasGameUI",depth:150,top:0,left:O(151),width:O(140)},cf:{id:"canvasMain",depth:200}},Ob:{bigPlay:{type:"text",t:Ad,va:O(38),lb:O(99),font:{align:"center",h:"middle",fontSize:P({big:46,small:30}),fillColor:"#01198a",U:{k:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Vc:2,Wc:O(30),fontSize:P({big:46,
small:30})},difficulty_toggle:{type:"toggleText",t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"0",t:Ec,L:"optionsDifficulty_easy"},{id:"1",t:Dc,L:"optionsDifficulty_medium"},{id:"2",t:Cc,L:"optionsDifficulty_hard"}],qh:O(30),rh:O(12),$f:O(10),Vc:2,Wc:O(30),fontSize:P({big:40,small:20})},music_toggle:{type:"toggle",t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,
small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"on",t:yd,L:"optionsMusic_on"},{id:"off",t:xd,L:"optionsMusic_off"}],qh:O(30),rh:O(12),$f:0,Vc:2,Wc:O(30)},sfx_toggle:{type:"toggle",t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"on",t:wd,L:"optionsSFX_on"},{id:"off",t:vd,L:"optionsSFX_off"}],qh:O(30),rh:O(12),$f:0,Vc:2,Wc:O(30)},music_big_toggle:{type:"toggleText",
t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"on",t:"undefined"!==typeof nd?nd:void 0,L:"optionsMusic_on"},{id:"off",t:"undefined"!==typeof od?od:void 0,L:"optionsMusic_off"}],qh:O(28,"round"),rh:O(10),$f:O(10),Vc:2,Wc:O(30),fontSize:P({big:40,small:20})},sfx_big_toggle:{type:"toggleText",t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",
U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"on",t:"undefined"!==typeof ld?ld:void 0,L:"optionsSFXBig_on"},{id:"off",t:"undefined"!==typeof md?md:void 0,L:"optionsSFXBig_off"}],qh:O(33,"round"),rh:O(12),$f:O(10),Vc:2,Wc:O(30),fontSize:P({big:40,small:20})},language_toggle:{type:"toggleText",t:ud,va:O(106),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},W:[{id:"en-us",t:Fc,L:"optionsLang_en-us"},
{id:"en-gb",t:Gc,L:"optionsLang_en-gb"},{id:"nl-nl",t:Hc,L:"optionsLang_nl-nl"},{id:"de-de",t:Jc,L:"optionsLang_de-de"},{id:"fr-fr",t:Kc,L:"optionsLang_fr-fr"},{id:"pt-br",t:Lc,L:"optionsLang_pt-br"},{id:"es-es",t:Mc,L:"optionsLang_es-es"},{id:"ru-ru",t:Oc,L:"optionsLang_ru-ru"},{id:"it-it",t:Rc,L:"optionsLang_it-it"},{id:"ar-eg",t:Pc,L:"optionsLang_ar-eg"},{id:"ko-kr",t:Qc,L:"optionsLang_ko-kr"},{id:"tr-tr",t:Ic,L:"optionsLang_tr-tr"},{id:"jp-jp",t:Nc,L:"optionsLang_jp-jp"}],qh:O(40),rh:O(20),$f:O(10),
Vc:2,Wc:O(30),fontSize:P({big:40,small:20})},default_text:{type:"text",t:td,va:O(40),lb:O(40),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Vc:2,Wc:O(30),fontSize:P({big:40,small:20})},default_image:{type:"image",t:td,va:O(40),lb:O(40),Wc:O(6)},options:{type:"image",t:rd}},Om:{bigPlay:{type:"text",t:Ad,va:O(40),lb:O(76),font:{align:"center",h:"middle",fontSize:P({big:40,small:20}),fillColor:"#01198a",U:{k:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Vc:2,Wc:O(30),fontSize:P({big:40,small:20})}},Yj:{green:{font:{align:"center",h:"middle",fillColor:"#018a17",U:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",h:"middle",fillColor:"#01198a",U:{k:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",h:"middle",fillColor:"#004f89",U:{k:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",h:"middle",fillColor:"#9a1900",U:{k:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",h:"middle",fillColor:"#8d2501",U:{k:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",h:"middle",fillColor:"#c6258f",U:{k:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",h:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",h:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",U:{k:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",U:{k:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ba:{dz:20},hd:{backgroundImage:"undefined"!==typeof Ed?Ed:void 0,Hw:0,qu:500,fl:5E3,mw:5E3,Hs:-1,Xy:12,Wy:100,ke:O(78),ap:{align:"center"},fm:O(560),Og:O(400),Pg:{align:"center"},Bf:O(680),Ee:O(16),Tn:O(18),Li:O(8),Hr:O(8),Ir:O(9),Jr:O(9),gj:{align:"center",fillColor:"#3B0057",fontSize:O(24)},it:{align:"center"},
jt:O(620),em:O(500),Mi:"center",Df:O(500),Oi:O(60),Bb:{align:"center"},tc:{align:"bottom",offset:O(20)},Yn:O(806),Wn:500,bw:O(20)},Vn:{Mi:"right",fm:O(280),Bf:O(430),Df:O(340),Bb:{align:"right",offset:O(32)},tc:O(560),Yn:O(560)},Tl:{Mm:O(860),backgroundImage:void 0!==typeof Ed?Ed:void 0,fv:700,cs:1800,yw:700,sx:2600,Ig:void 0!==typeof Ed?Td:void 0,fd:700,zi:{align:"center"},Bk:{align:"center"},Ai:void 0!==typeof Td?-Td.height:0,yi:{align:"top",offset:O(20)},un:1,Oq:1,vn:1,Pq:1,tn:1,Nq:1,jv:L,kv:M,
hv:L,iv:L,gv:L,rx:{align:"center"},yl:O(656),Si:O(300),wl:700,qx:700,rq:O(368),nk:O(796),oi:O(440),qq:700,eo:O(36),il:O(750),xw:500,Mi:"center",Df:O(500),Oi:O(60),Bb:{align:"center"},tc:{align:"bottom",offset:O(20)},Yn:O(806),Wn:500,bw:O(20)},Vo:{Mm:O(0),yl:O(456),Si:O(320),rq:{align:"center"},nk:O(346),oi:O(460),eo:{align:"left",offset:O(32)},il:O(528),Mi:"right",Df:O(340),Bb:{align:"right",offset:O(32)},tc:O(560),Yn:O(560)},xf:{gx:{align:"center",offset:O(-230)},oo:{align:"top",offset:O(576)},fx:"options",
Zb:{h:"bottom"},Me:{align:"center"},hc:{align:"top",offset:O(35,"round")},rd:O(232),le:O(98),zz:{align:"center",offset:O(-206)},rp:{align:"top",offset:O(30)},yz:{align:"center",offset:O(206)},qp:{align:"top",offset:O(30)},type:"grid",cx:3,KA:3,dx:5,LA:4,vq:!0,Su:!0,En:O(78),Tq:{align:"top",offset:O(140)},Vq:{align:"top",offset:O(140)},Uq:O(20),qv:O(18),rv:O(18),Pv:{zn:{fontSize:P({big:60,small:30}),fillColor:"#3F4F5E",align:"center",h:"middle",U:{k:!0,color:"#D0D8EA",offsetX:0,offsetY:O(6),blur:0}}},
Qv:{zn:{fontSize:P({big:32,small:16}),fillColor:"#3F4F5E",align:"center",h:"middle",U:{k:!0,color:"#D0D8EA",offsetX:0,offsetY:O(2),blur:0}}},Dr:O(438),Er:O(438),vr:{align:"center"},wr:{align:"center"},Lr:{align:"center"},Mr:{align:"center",offset:O(-22)},zr:{align:"center"},Ar:{align:"center",offset:O(-10)},uy:{align:"center",offset:O(216)},Ms:{align:"top",offset:O(574)},Ls:{fontSize:P({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Ns:O(10),vo:{fontSize:P({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},ls:{align:"center"},ms:{align:"top",offset:O(588)},vx:O(160),ux:O(40),backgroundImage:"undefined"!==typeof Jd?Jd:void 0,Ry:O(10),Sy:200,Qy:O(200),HA:O(600),Mw:800,Lw:500},xr:{rp:{align:"top",offset:O(20)},qp:{align:"top",offset:O(20)},hc:{align:"top",offset:O(25,"round")},En:O(234),Tq:{align:"top",offset:O(110)},Vq:{align:"top",offset:O(110)},Ms:{align:"top",offset:O(536)},ms:{align:"top",offset:O(550)},oo:{align:"top",offset:O(538)}},Rv:{Pc:"undefined"!==typeof Cd?Cd:void 0,gs:{align:"center"},
ro:"undefined"!==typeof Cd?-Cd.height:void 0,lx:[{type:"y",Ca:0,duration:800,end:{align:"center",offset:O(-142)},gb:M,wc:ag}],OA:[{type:"y",Ca:0,duration:600,end:"undefined"!==typeof Cd?-Cd.height:void 0,gb:ec,Lz:!0}],hu:{align:"center",h:"middle"},ku:{align:"center"},lu:0,ju:O(500),iu:O(80),zv:{align:"center",h:"middle"},Av:{align:"center"},Bv:0,tA:O(560),sA:O(80),js:3500},GA:{lx:[{type:"y",Ca:0,duration:800,end:{align:"center"},gb:M,wc:ag}]},dk:{Pc:"undefined"!==typeof s_overlay_challenge_start?
s_overlay_challenge_start:void 0,gs:{align:"center"},ro:O(56),Jf:0,Yg:0,Zb:{align:"center",h:"top"},rd:O(500),le:O(100),Me:{align:"center"},hc:O(90),Zr:{align:"center",h:"middle"},Uw:O(500),Tw:O(80),Xw:{align:"center"},Yw:O(250),ts:{align:"center",h:"top"},Qx:O(500),Px:O(40),Rx:{align:"center"},Sx:O(348),ss:{align:"center",h:"top"},Vx:O(500),Ux:O(50),Xx:{align:"center"},Yx:O(388),Rt:{align:"center",h:"top"},mz:O(500),lz:O(40),nz:{align:"center"},oz:O(442),CB:0,DB:0,Qt:{align:"center",h:"top"},qz:O(500),
pz:O(50),rz:{align:"center"},sz:O(482),BB:O(10),zB:0,AB:0,se:800,Mj:M,Nj:600,Oj:ec,js:3500},ck:{Qp:500,se:800,ax:1500,jo:500,Wx:2500,Io:500,Zx:3200,$x:800,jl:4200,Rg:300,Bu:4500,nx:{align:"center"},ox:O(-800),Xg:{align:"center"},If:O(52),Jf:0,Yg:0,qi:.8,fn:"#000000",Ef:{align:"center",h:"middle"},ho:O(360),Ur:O(120),Aw:O(4),Bw:O(4),Fw:{align:"center"},Gw:O(340),Jy:{align:"center"},Xs:O(600),Xo:O(500),Ws:O(120),Iy:{align:"center",h:"middle"},tj:{align:"center",h:"middle"},pp:O(360),St:O(60),tz:O(4),
uz:O(4),vz:{align:"center"},wz:O(480),cm:O(460),My:{align:"center"},Ny:O(400),Cu:{align:"center"},Du:O(500),io:{align:"center",h:"middle"},$w:O(75,"round"),Zw:O(48),bx:O(120),as:O(214,"round"),$r:O(40),Rw:O(4),Sw:O(4),Vw:0,Ww:0,Zm:{align:"center",h:"middle"},Xu:O(220),Wu:O(180),Aq:O(80),zq:O(4),Vu:O(4)},na:{rl:{K:"undefined"!==typeof Hd?Hd:void 0,Zu:"undefined"!==typeof s_overlay_endless?s_overlay_endless:void 0,Sv:"undefined"!==typeof s_overlay_level_win?s_overlay_level_win:void 0,Ov:"undefined"!==
typeof s_overlay_level_fail?s_overlay_level_fail:void 0},Vy:500,se:800,Mj:M,Nj:800,Oj:ac,Yb:{align:"center"},ub:0,Zb:{align:"center",h:"middle",fontSize:P({big:26,small:13})},Me:{align:"center"},hc:O(58),rd:O(500),le:O(100),Ys:{align:"center",h:"middle",fontSize:P({big:56,small:28})},Ky:{align:"center"},Ly:O(236),$m:{align:"center",h:"top",fontSize:P({big:24,small:12})},Bq:{align:"center"},an:O(144),pi:{align:"center",h:"top",fontSize:P({big:56,small:28})},vk:{align:"center"},Fg:O(176),uk:O(200),
tk:O(60),dj:{align:"center",h:"top",fontSize:P({big:24,small:12})},Ke:{align:"center"},Wf:O(286),Ts:O(0),Kq:!1,nd:O(14),Zl:O(10),Vf:{align:"center",h:"top",fontSize:P({big:24,small:12})},ih:O(10),jh:O(4),kh:O(200),pB:O(50),ou:{align:"center",offset:O(12)},Vp:O(549),ev:{align:"center",offset:O(162)},Lq:O(489),gi:{align:"center",offset:O(250)},zg:O(10),yg:O(90),ef:O(90),Po:{align:"center",offset:O(-177,"round")},Qo:O(120),Ro:{align:"center"},So:O(96),To:{align:"center",offset:O(179,"round")},Uo:O(120),
nB:200,qy:500,Is:800,Ks:0,ty:0,sy:300,ry:200,Js:300,qi:.8,rb:800,fn:"#000000",bo:O(508),Qi:O(394),Pr:O(96),Qr:O(74),gl:3,Qg:400,nw:2500,JA:0,qw:O(100),Rr:1.5,vw:{align:"center"},ww:O(76),hl:O(180),uw:O(36),Sr:{align:"center",h:"middle",fontSize:P({big:22,small:12}),w:"ff_opensans_extrabold",fillColor:"#1d347f",U:{k:!0,color:"#68cbfa",offsetY:O(2)}},Or:500,ow:500,pw:O(-30),sw:500,rw:0,tw:4E3,im:600,gz:1500,bq:500,rg:750,Dv:{align:"center"},Ev:O(290),ar:O(350),Jw:1E3,type:{level:{Uj:"level",Rc:!0,fh:!0,
jj:"title_level",Le:"totalScore",Rj:"retry",xk:"next"},failed:{Uj:"failed",Rc:!1,fh:!1,jj:"title_level",Zs:"subtitle_failed",Rj:"exit",xk:"retry"},endless:{Uj:"endless",Rc:!1,fh:!0,jj:"title_endless",bn:"totalScore",Le:"highScore",Rj:"exit",xk:"retry"},difficulty:{Uj:"difficulty",Rc:!1,fh:!0,jj:"title_difficulty",bn:"timeLeft",Le:["totalScore","timeBonus"],Rj:"exit",xk:"retry"}}},ur:{zg:O(0),hc:O(30),an:O(114),Fg:O(146),Wf:O(266),Vp:O(488),Lq:O(428),bo:{align:"center",offset:O(220)},Qi:O(260)},Hi:{backgroundImage:"undefined"!==
typeof Je?Je:void 0},options:{backgroundImage:Dd,Yb:{align:"center"},ub:0,Zb:{},Me:{align:"center"},hc:O(58),rd:O(500),le:O(100),$j:O(460,"round"),Zj:{align:"center"},vg:{align:"center",offset:O(36)},wd:O(10,"round"),gi:O(510),zg:O(10),yg:O(130),ef:O(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames","quit"]},Gf:800,Hf:M,Vg:600,Wg:ac,
mq:{align:"center"},jk:O(260),ki:O(460),ik:O(300),lq:{align:"center"},hk:O(460),kq:{align:"center"},gk:O(560,"round"),ji:O(460,"round"),Fl:{},sd:"undefined"!==typeof Fd?Fd:void 0,km:{align:"center"},Ne:O(84,"round"),nj:{align:"center",h:"top"},lm:O(480),hp:O(46),Bt:{align:"center"},ip:O(110,"round"),yt:{align:"center"},fp:O(160,"round"),At:{align:"center"},gp:O(446,"round"),mj:{h:"middle",align:"center",fontSize:P({big:36,small:18})},vh:O(480),zt:O(160),xt:{align:"center",offset:O(-80,"round")},ep:O(556,
"round"),wt:{align:"center",offset:O(80,"round")},dp:O(556,"round"),Fj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),V:O(6)},Gj:O(480),Kp:O(50),Hj:{align:"center"},Wh:O(106,"round"),Yh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),V:O(6)},We:O(480),Zh:O(110),og:{align:"center"},$h:O(396,"round"),Xh:{align:"center"},Ij:O(140),Bm:{align:"center"},Uh:O(500),Vh:O(480),Cm:{align:"center",h:"top",fillColor:"#808080",fontSize:P({big:12,small:8})},Np:{align:"center"},
Dm:O(610),Mp:O(440),Lp:O(20),pg:O(200),Jj:O(200),Lt:O(80),Mt:O(140),Kt:O(10)},hx:{hc:O(12),vg:{align:"center",offset:O(16)},jk:O(200),ik:O(300),hk:O(400),gk:O(500,"round"),Ne:O(60,"round"),ip:O(80,"round"),fp:O(134,"round"),gp:O(410,"round"),ep:O(500,"round"),dp:O(500,"round"),Wh:O(86,"round"),Ij:O(126),$h:O(392,"round"),Uh:O(490),Dm:O(590)},po:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:Dd,Yb:{align:"center"},ub:O(120),Zb:{},Me:{align:"center"},hc:O(200),
$j:O(460,"round"),Zj:{align:"center"},vg:{align:"center",offset:O(140)},wd:O(10,"round"),gi:O(510),zg:O(10),yg:O(130),ef:O(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},Gf:800,Hf:M,Vg:600,Wg:ac,Fl:{},aB:{align:"center"},bB:O(360),$A:O(460),ZA:O(300),VA:"default_text",WA:{align:"center"},XA:O(630),SA:"default_text",TA:{align:"center"},
UA:O(730,"round"),YA:O(460,"round"),Rm:{},mq:{align:"center"},jk:O(200),ki:O(460),ik:O(250),lq:{align:"center"},hk:O(520),kq:{align:"center"},gk:O(620,"round"),ji:O(460,"round"),Ef:{},Dw:{align:"center"},Ew:O(200),fo:O(460),Cw:O(300),sd:"undefined"!==typeof Fd?Fd:void 0,km:{align:"center"},Ne:O(0,"round"),nj:{align:"center",h:"top"},lm:O(480),hp:O(50),Bt:{align:"center"},ip:O(20,"round"),yt:{align:"center"},fp:O(70,"round"),At:{align:"center"},gp:O(356,"round"),mj:{h:"middle",align:"center",fontSize:P({big:36,
small:18})},vh:O(480),zt:O(150),xt:O(224,"round"),ep:O(636,"round"),wt:O(350,"round"),dp:O(636,"round"),Fj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),V:O(6)},Gj:O(480),Kp:O(50),Hj:{align:"center"},Wh:O(26,"round"),Yh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:P({big:26,small:13}),V:O(6)},We:O(480),Zh:O(110),og:{align:"center"},$h:O(316,"round"),Xh:{align:"center"},Ij:O(60),Bm:{align:"center"},Uh:O(420),Vh:O(480),Cm:{align:"center",h:"top",fillColor:"#808080",
fontSize:P({big:12,small:8})},Np:{align:"center"},Dm:O(530),Mp:O(440),Lp:O(20),pg:O(200),Jj:O(200),Lt:O(80),Mt:O(100),Kt:O(10)},$c:{backgroundImage:"undefined"!==typeof Gd?Gd:Dd,Yb:{align:"center"},ub:O(120),$j:O(460,"round"),Zj:{align:"center"},vg:{align:"bottom",offset:O(20)},wd:O(10,"round"),gi:O(510),zg:O(10),yg:O(130),ef:O(90),Gf:800,Hf:M,Vg:600,Wg:ac,xo:{},Dx:{align:"center"},os:{align:"center",offset:O(40)},El:O(460),Dl:O(300),Yo:{},Bx:{align:"center"},Cx:{align:"center",offset:O(160)},Ax:O(460),
zx:O(200)},zk:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,it:{align:"center"},jt:O(152),em:O(560),Uy:O(560),font:{align:"center",h:"middle",fontSize:P({big:52,small:26}),fillColor:"#FFFFFF"},zu:{align:"center"},eq:O(600),dq:O(460),cq:"default_text"},nn:{eq:O(520)}}}var ng={xx:"poki",aj:{$v:!1,Vm:[]},ae:{Rk:"en-us",Qj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},Yp:{show:!1}},X=X||{};X["nl-nl"]=X["nl-nl"]||{};
X["nl-nl"].ShuffleConfirmationText="Er zijn geen identieke steentjes meer. \n Wil je het bord herschikken?";X["nl-nl"].ShuffleConfirmationTitle="Herschikken";X["nl-nl"].ShuffleConfirmBtnText="Herschikken";X["nl-nl"].ShuffleConfirmBtnTitle="Doorgaan en het bord herschikken?";X["nl-nl"].ShuffleRestartBtnText="Herstarten";X["nl-nl"].ShuffleRestartBtnTitle="Spel herstarten en opnieuw proberen";X["nl-nl"].TutorialText_0="Vind twee identieke steentjes.";X["nl-nl"].TutorialText_1="#touch{Verwijder de steentjes door er op te klikken.}{Verwijder de steentjes door er op te tikken.}";
X["nl-nl"].TutorialText_2="Alleen steentjes die je opzij kunt bewegen\u2026";X["nl-nl"].TutorialText_3="... zonder daarbij andere steentjes te verstoren, mag je verwijderen.";X["nl-nl"].TutorialText_4="Voltooi het spel door alle steentjes te verwijderen.";X["nl-nl"].TutorialTitle_0="Speluitleg";X["nl-nl"].TutorialTitle_1="Steentjes verwijderen";X["nl-nl"].TutorialTitle_2="Let op!";X["nl-nl"].TutorialTitle_3="Let op!";X["nl-nl"].TutorialTitle_4="Het spel voltooien";
X["nl-nl"].levelMapScreenWorld_1="Level 13-24";X["nl-nl"].levelMapScreenWorld_0="Level 1-12";X["nl-nl"].floater_0="Goed";X["nl-nl"].floater_1="Mooi!";X["nl-nl"].floater_2="Geweldig!";X["nl-nl"].floater_3="Fantastisch!";X["nl-nl"].levelMapScreenWorld_5="Level 61-72";X["nl-nl"].levelMapScreenWorld_4="Level 49-60";X["nl-nl"].levelMapScreenWorld_3="Level 37-48";X["nl-nl"].levelMapScreenWorld_2="Level 25-36";X["nl-nl"].RewardTimeAcceptBtnHeader="UNDEFINED";X["nl-nl"].RewardTimeAcceptBtnText="UNDEFINED";
X["nl-nl"].RewardTimeRejectBtnHeader="UNDEFINED";X["nl-nl"].RewardTimeRejecttBtnText="UNDEFINED";X["nl-nl"].RewardTimeOfferText="UNDEFINED";X["nl-nl"].levelMapScreenWorld_6="Level 73-84";X["nl-nl"].levelMapScreenWorld_7="Level 85-96";X["nl-nl"].levelMapScreenWorld_8="Level 97-108";X["en-us"]=X["en-us"]||{};X["en-us"].ShuffleConfirmationText="There are no more possible matches. \n Would you like to reshuffle the board?";X["en-us"].ShuffleConfirmationTitle="Reshuffle";
X["en-us"].ShuffleConfirmBtnText="Reshuffle";X["en-us"].ShuffleConfirmBtnTitle="Continue by reshuffling the board";X["en-us"].ShuffleRestartBtnText="Restart";X["en-us"].ShuffleRestartBtnTitle="Try again by restarting the game";X["en-us"].TutorialText_0="Find 2 identical tiles.";X["en-us"].TutorialText_1="#touch{Remove the identical tiles by clicking on them.}{Remove the identical tiles by tapping on them.}";X["en-us"].TutorialText_2="You can only remove tiles that can be moved to the right...";
X["en-us"].TutorialText_3="...or left without disturbing other tiles.";X["en-us"].TutorialText_4="Complete the game by removing all the tiles.";X["en-us"].TutorialTitle_0="How to play";X["en-us"].TutorialTitle_1="Removing tiles";X["en-us"].TutorialTitle_2="Pay attention!";X["en-us"].TutorialTitle_3="Pay attention!";X["en-us"].TutorialTitle_4="Completing the game";X["en-us"].levelMapScreenWorld_1="Level 13-24";X["en-us"].levelMapScreenWorld_0="Level 1-12";X["en-us"].floater_0="Good";
X["en-us"].floater_1="Nice!";X["en-us"].floater_2="Great!";X["en-us"].floater_3="Awesome!";X["en-us"].levelMapScreenWorld_5="Level 61-72";X["en-us"].levelMapScreenWorld_4="Level 49-60";X["en-us"].levelMapScreenWorld_3="Level 37-48";X["en-us"].levelMapScreenWorld_2="Level 25-36";X["en-us"].RewardTimeAcceptBtnHeader="UNDEFINED";X["en-us"].RewardTimeAcceptBtnText="UNDEFINED";X["en-us"].RewardTimeRejectBtnHeader="UNDEFINED";X["en-us"].RewardTimeRejecttBtnText="UNDEFINED";
X["en-us"].RewardTimeOfferText="UNDEFINED";X["en-us"].levelMapScreenWorld_6="Level 73-84";X["en-us"].levelMapScreenWorld_7="Level 85-96";X["en-us"].levelMapScreenWorld_8="Level 97-108";X["en-gb"]=X["en-gb"]||{};X["en-gb"].ShuffleConfirmationText="There are no more possible matches. \n Would you like to reshuffle the board?";X["en-gb"].ShuffleConfirmationTitle="Reshuffle";X["en-gb"].ShuffleConfirmBtnText="Reshuffle";X["en-gb"].ShuffleConfirmBtnTitle="Continue by reshuffling the board";
X["en-gb"].ShuffleRestartBtnText="Restart";X["en-gb"].ShuffleRestartBtnTitle="Try again by restarting the game";X["en-gb"].TutorialText_0="Find 2 identical tiles.";X["en-gb"].TutorialText_1="#touch{Remove the identical tiles by clicking on them.}{Remove the identical tiles by tapping on them.}";X["en-gb"].TutorialText_2="You can only remove tiles that can be moved to the right...";X["en-gb"].TutorialText_3="...or left without disturbing other tiles.";X["en-gb"].TutorialText_4="Complete the game by removing all the tiles.";
X["en-gb"].TutorialTitle_0="How to play";X["en-gb"].TutorialTitle_1="Removing tiles";X["en-gb"].TutorialTitle_2="Pay attention!";X["en-gb"].TutorialTitle_3="Pay attention!";X["en-gb"].TutorialTitle_4="Completing the game";X["en-gb"].levelMapScreenWorld_1="Level 13-24";X["en-gb"].levelMapScreenWorld_0="Level 1-12";X["en-gb"].floater_0="Good";X["en-gb"].floater_1="Nice!";X["en-gb"].floater_2="Great!";X["en-gb"].floater_3="Awesome!";X["en-gb"].levelMapScreenWorld_5="Level 61-72";
X["en-gb"].levelMapScreenWorld_4="Level 49-60";X["en-gb"].levelMapScreenWorld_3="Level 37-48";X["en-gb"].levelMapScreenWorld_2="Level 25-36";X["en-gb"].RewardTimeAcceptBtnHeader="UNDEFINED";X["en-gb"].RewardTimeAcceptBtnText="UNDEFINED";X["en-gb"].RewardTimeRejectBtnHeader="UNDEFINED";X["en-gb"].RewardTimeRejecttBtnText="UNDEFINED";X["en-gb"].RewardTimeOfferText="UNDEFINED";X["en-gb"].levelMapScreenWorld_6="Level 73-84";X["en-gb"].levelMapScreenWorld_7="Level 85-96";
X["en-gb"].levelMapScreenWorld_8="Level 97-108";X["de-de"]=X["de-de"]||{};X["de-de"].ShuffleConfirmationText="Es sind keine weiteren Kombinationen m\u00f6glich. \n M\u00f6chtest du die Steine neu mischen?";X["de-de"].ShuffleConfirmationTitle="Mischen";X["de-de"].ShuffleConfirmBtnText="Mischen";X["de-de"].ShuffleConfirmBtnTitle="Steine mischen und weiterspielen";X["de-de"].ShuffleRestartBtnText="Neustart";X["de-de"].ShuffleRestartBtnTitle="Spiel neu starten und noch mal versuchen";
X["de-de"].TutorialText_0="Finde zwei identische Steine.";X["de-de"].TutorialText_1="#touch{Mit einem Klick auf die zueinander passenden Steine entfernst du sie.}{Durch Tippen auf die zueinander passenden Steine entfernst du sie.}";X["de-de"].TutorialText_2="Steine k\u00f6nnen nur entfernt werden, wenn du sie nach rechts ...";X["de-de"].TutorialText_3="... oder links verschieben kannst, ohne andere Steine zu st\u00f6ren.";X["de-de"].TutorialText_4="Schlie\u00dfe das Spiel ab, indem du alle Steine entfernst.";
X["de-de"].TutorialTitle_0="So wird gespielt";X["de-de"].TutorialTitle_1="Steine entfernen";X["de-de"].TutorialTitle_2="Achtung!";X["de-de"].TutorialTitle_3="Achtung!";X["de-de"].TutorialTitle_4="Das Spiel abschlie\u00dfen";X["de-de"].levelMapScreenWorld_1="Level 13-24";X["de-de"].levelMapScreenWorld_0="Level 1-12";X["de-de"].floater_0="Gut!";X["de-de"].floater_1="Toll!";X["de-de"].floater_2="Super!";X["de-de"].floater_3="Fantastisch!";X["de-de"].levelMapScreenWorld_5="Level 61-72";
X["de-de"].levelMapScreenWorld_4="Level 49-60";X["de-de"].levelMapScreenWorld_3="Level 37-48";X["de-de"].levelMapScreenWorld_2="Level 25-36";X["de-de"].RewardTimeAcceptBtnHeader="UNDEFINED";X["de-de"].RewardTimeAcceptBtnText="UNDEFINED";X["de-de"].RewardTimeRejectBtnHeader="UNDEFINED";X["de-de"].RewardTimeRejecttBtnText="UNDEFINED";X["de-de"].RewardTimeOfferText="UNDEFINED";X["de-de"].levelMapScreenWorld_6="Level 73-84";X["de-de"].levelMapScreenWorld_7="Level 85-96";
X["de-de"].levelMapScreenWorld_8="Level 97-108";X["fr-fr"]=X["fr-fr"]||{};X["fr-fr"].ShuffleConfirmationText="Il n'y a plus de paires possibles. \n Voulez-vous m\u00e9langer les tuiles\u00a0?";X["fr-fr"].ShuffleConfirmationTitle="M\u00e9langer";X["fr-fr"].ShuffleConfirmBtnText="M\u00e9langer";X["fr-fr"].ShuffleConfirmBtnTitle="Continuez en m\u00e9langeant les tuiles";X["fr-fr"].ShuffleRestartBtnText="Recommencer";X["fr-fr"].ShuffleRestartBtnTitle="Recommencez la partie";
X["fr-fr"].TutorialText_0="Trouvez 2 tuiles identiques.";X["fr-fr"].TutorialText_1="#touch{Retirez les tuiles identiques en cliquant dessus.}{Retirez les tuiles identiques en les touchant l'une apr\u00e8s l'autre.}";X["fr-fr"].TutorialText_2="Vous ne pouvez retirer que les tuiles pouvant \u00eatre d\u00e9plac\u00e9es vers la droite...";X["fr-fr"].TutorialText_3="... ou la gauche sans d\u00e9ranger les autres tuiles.";X["fr-fr"].TutorialText_4="Finissez le jeu en retirant toutes les tuiles du plateau. ";
X["fr-fr"].TutorialTitle_0="Comment jouer";X["fr-fr"].TutorialTitle_1="Retirer les tuiles";X["fr-fr"].TutorialTitle_2="Faites attention !";X["fr-fr"].TutorialTitle_3="Faites attention !";X["fr-fr"].TutorialTitle_4="Finir le jeu";X["fr-fr"].levelMapScreenWorld_1="Niveaux 13-24";X["fr-fr"].levelMapScreenWorld_0="Niveaux 1-12";X["fr-fr"].floater_0="Bien !";X["fr-fr"].floater_1="Joli !";X["fr-fr"].floater_2="G\u00e9nial !";X["fr-fr"].floater_3="Excellent !";X["fr-fr"].levelMapScreenWorld_5="Level 61-72";
X["fr-fr"].levelMapScreenWorld_4="Level 49-60";X["fr-fr"].levelMapScreenWorld_3="Level 37-48";X["fr-fr"].levelMapScreenWorld_2="Level 25-36";X["fr-fr"].RewardTimeAcceptBtnHeader="UNDEFINED";X["fr-fr"].RewardTimeAcceptBtnText="UNDEFINED";X["fr-fr"].RewardTimeRejectBtnHeader="UNDEFINED";X["fr-fr"].RewardTimeRejecttBtnText="UNDEFINED";X["fr-fr"].RewardTimeOfferText="UNDEFINED";X["fr-fr"].levelMapScreenWorld_6="Level 73-84";X["fr-fr"].levelMapScreenWorld_7="Level 85-96";
X["fr-fr"].levelMapScreenWorld_8="Level 97-108";X["pt-br"]=X["pt-br"]||{};X["pt-br"].ShuffleConfirmationText="N\u00e3o h\u00e1 mais combina\u00e7\u00f5es. \n Gostaria de embaralhar o tabuleiro?";X["pt-br"].ShuffleConfirmationTitle="Embaralhar";X["pt-br"].ShuffleConfirmBtnText="Embaralhar";X["pt-br"].ShuffleConfirmBtnTitle="Embaralhe o tabuleiro para continuar";X["pt-br"].ShuffleRestartBtnText="Reiniciar";X["pt-br"].ShuffleRestartBtnTitle="Reinicie a partida e tente novo";
X["pt-br"].TutorialText_0="Ache 2 pe\u00e7as id\u00eanticas.";X["pt-br"].TutorialText_1="#touch{Clique nas pe\u00e7as iguais, para remov\u00ea-las.}{Toque nas pe\u00e7as iguais, para remov\u00ea-las.}";X["pt-br"].TutorialText_2="S\u00f3 \u00e9 poss\u00edvel remover as pe\u00e7as que podem se mover para direita...";X["pt-br"].TutorialText_3="...ou para esquerda sem interferir em outras pe\u00e7as.";X["pt-br"].TutorialText_4="Remova todas as pe\u00e7as para vencer o jogo.";
X["pt-br"].TutorialTitle_0="Como jogar";X["pt-br"].TutorialTitle_1="Remover pe\u00e7as";X["pt-br"].TutorialTitle_2="Preste aten\u00e7\u00e3o!";X["pt-br"].TutorialTitle_3="Preste aten\u00e7\u00e3o!";X["pt-br"].TutorialTitle_4="Vencer o jogo";X["pt-br"].levelMapScreenWorld_1="N\u00edveis 13-24";X["pt-br"].levelMapScreenWorld_0="N\u00edveis 1-12";X["pt-br"].floater_0="Bom";X["pt-br"].floater_1="Legal!";X["pt-br"].floater_2="\u00d3timo!";X["pt-br"].floater_3="Incr\u00edvel!";
X["pt-br"].levelMapScreenWorld_5="Level 61-72";X["pt-br"].levelMapScreenWorld_4="Level 49-60";X["pt-br"].levelMapScreenWorld_3="Level 37-48";X["pt-br"].levelMapScreenWorld_2="Level 25-36";X["pt-br"].RewardTimeAcceptBtnHeader="UNDEFINED";X["pt-br"].RewardTimeAcceptBtnText="UNDEFINED";X["pt-br"].RewardTimeRejectBtnHeader="UNDEFINED";X["pt-br"].RewardTimeRejecttBtnText="UNDEFINED";X["pt-br"].RewardTimeOfferText="UNDEFINED";X["pt-br"].levelMapScreenWorld_6="Level 73-84";
X["pt-br"].levelMapScreenWorld_7="Level 85-96";X["pt-br"].levelMapScreenWorld_8="Level 97-108";X["es-es"]=X["es-es"]||{};X["es-es"].ShuffleConfirmationText="No quedan combinaciones. \n \u00bfQuieres mezclar el tablero?";X["es-es"].ShuffleConfirmationTitle="Mezclar";X["es-es"].ShuffleConfirmBtnText="Mezclar";X["es-es"].ShuffleConfirmBtnTitle="Mezcla el tablero para continuar";X["es-es"].ShuffleRestartBtnText="Reiniciar";X["es-es"].ShuffleRestartBtnTitle="Int\u00e9ntalo otra vez desde el principio";
X["es-es"].TutorialText_0="Encuentra dos fichas iguales.";X["es-es"].TutorialText_1="#touch{Retira las dos fichas iguales haciendo clic en ellas.}{Retira las dos fichas iguales toc\u00e1ndolas.}";X["es-es"].TutorialText_2="Solo puedes quitar fichas que puedas mover a la derecha...";X["es-es"].TutorialText_3="\u2026 o a la izquierda sin mover otras fichas.";X["es-es"].TutorialText_4="Termina la partida quitando todas las fichas.";X["es-es"].TutorialTitle_0="C\u00f3mo jugar";
X["es-es"].TutorialTitle_1="Quitar fichas";X["es-es"].TutorialTitle_2="\u00a1Presta atenci\u00f3n!";X["es-es"].TutorialTitle_3="\u00a1Presta atenci\u00f3n!";X["es-es"].TutorialTitle_4="Terminar la partida";X["es-es"].levelMapScreenWorld_1="Nivel 13-24";X["es-es"].levelMapScreenWorld_0="Nivel 1-12";X["es-es"].floater_0="Bien";X["es-es"].floater_1="\u00a1Guay!";X["es-es"].floater_2="\u00a1Mola!";X["es-es"].floater_3="\u00a1Estupendo!";X["es-es"].levelMapScreenWorld_5="Level 61-72";
X["es-es"].levelMapScreenWorld_4="Level 49-60";X["es-es"].levelMapScreenWorld_3="Level 37-48";X["es-es"].levelMapScreenWorld_2="Level 25-36";X["es-es"].RewardTimeAcceptBtnHeader="UNDEFINED";X["es-es"].RewardTimeAcceptBtnText="UNDEFINED";X["es-es"].RewardTimeRejectBtnHeader="UNDEFINED";X["es-es"].RewardTimeRejecttBtnText="UNDEFINED";X["es-es"].RewardTimeOfferText="UNDEFINED";X["es-es"].levelMapScreenWorld_6="Level 73-84";X["es-es"].levelMapScreenWorld_7="Level 85-96";
X["es-es"].levelMapScreenWorld_8="Level 97-108";X["tr-tr"]=X["tr-tr"]||{};X["tr-tr"].ShuffleConfirmationText="Ba\u015fka olas\u0131 e\u015fle\u015fme yok. \n Tahtay\u0131 tekrar kar\u0131\u015ft\u0131rmak istiyor musun?";X["tr-tr"].ShuffleConfirmationTitle="Tekrar kar\u0131\u015ft\u0131r";X["tr-tr"].ShuffleConfirmBtnText="Tekrar kar\u0131\u015ft\u0131r";X["tr-tr"].ShuffleConfirmBtnTitle="Tahtay\u0131 tekrar kar\u0131\u015ft\u0131rarak devam et";X["tr-tr"].ShuffleRestartBtnText="Tekrar ba\u015flat";
X["tr-tr"].ShuffleRestartBtnTitle="Oyunu yeniden ba\u015flatarak tekrar dene";X["tr-tr"].TutorialText_0="Benzer 2 karo bul.";X["tr-tr"].TutorialText_1="#touch{Benzer karolar\u0131 \u00fcstlerine t\u0131klayarak kald\u0131r.}{Benzer karolar\u0131 \u00fcstlerine dokunarak kald\u0131r.}";X["tr-tr"].TutorialText_2="Sadece sa\u011fa do\u011fru hareket ettirilebilen karolar\u0131 kald\u0131rabilirsin...";X["tr-tr"].TutorialText_3="...veya di\u011fer karolar\u0131 bozmadan sola.";
X["tr-tr"].TutorialText_4="T\u00fcm karolar\u0131 kald\u0131rarak oyunu tamamla.";X["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";X["tr-tr"].TutorialTitle_1="Karolar\u0131 kald\u0131rma";X["tr-tr"].TutorialTitle_2="Dikkat et!";X["tr-tr"].TutorialTitle_3="Dikkat et!";X["tr-tr"].TutorialTitle_4="Oyunu tamamlama";X["tr-tr"].levelMapScreenWorld_1="Seviye 13-24";X["tr-tr"].levelMapScreenWorld_0="Seviye 1-12";X["tr-tr"].floater_0="\u0130yi";X["tr-tr"].floater_1="G\u00fczel!";X["tr-tr"].floater_2="Harika!";
X["tr-tr"].floater_3="Muhte\u015fem!";X["tr-tr"].levelMapScreenWorld_5="Level 61-72";X["tr-tr"].levelMapScreenWorld_4="Level 49-60";X["tr-tr"].levelMapScreenWorld_3="Level 37-48";X["tr-tr"].levelMapScreenWorld_2="Level 25-36";X["tr-tr"].RewardTimeAcceptBtnHeader="UNDEFINED";X["tr-tr"].RewardTimeAcceptBtnText="UNDEFINED";X["tr-tr"].RewardTimeRejectBtnHeader="UNDEFINED";X["tr-tr"].RewardTimeRejecttBtnText="UNDEFINED";X["tr-tr"].RewardTimeOfferText="UNDEFINED";X["tr-tr"].levelMapScreenWorld_6="Level 73-84";
X["tr-tr"].levelMapScreenWorld_7="Level 85-96";X["tr-tr"].levelMapScreenWorld_8="Level 97-108";X["ru-ru"]=X["ru-ru"]||{};X["ru-ru"].ShuffleConfirmationText="\u0411\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442 \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u044b\u0445 \u0441\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0439 \n \u0412\u044b \u0445\u043e\u0442\u0435\u043b\u0438 \u0431\u044b \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c \u0434\u043e\u0441\u043a\u0443?";
X["ru-ru"].ShuffleConfirmationTitle="\u041f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c";X["ru-ru"].ShuffleConfirmBtnText="\u041f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0442\u044c";X["ru-ru"].ShuffleConfirmBtnTitle="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043e\u0432\u0430\u0432 \u0434\u043e\u0441\u043a\u0443";X["ru-ru"].ShuffleRestartBtnText="\u041d\u0430\u0447\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430";
X["ru-ru"].ShuffleRestartBtnTitle="\u041f\u043e\u043f\u044b\u0442\u0430\u0439\u0442\u0435\u0441\u044c \u0435\u0449\u0451 \u0440\u0430\u0437, \u043d\u0430\u0447\u0430\u0432 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e";X["ru-ru"].TutorialText_0="\u041d\u0430\u0439\u0434\u0438\u0442\u0435 \u0434\u0432\u0435 \u0438\u0434\u0435\u043d\u0442\u0438\u0447\u043d\u044b\u0435 \u043f\u043b\u0438\u0442\u043a\u0438";X["ru-ru"].TutorialText_1="\u0423\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u0434\u0435\u043d\u0442\u0438\u0447\u043d\u044b\u0435 \u043f\u043b\u0438\u0442\u043a\u0438, \u043d\u0430\u0436\u0430\u0432 \u043d\u0430 \u043d\u0438\u0445";
X["ru-ru"].TutorialText_2="\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0443\u0431\u0440\u0430\u0442\u044c \u043f\u043b\u0438\u0442\u043a\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u044b \u0432\u043f\u0440\u0430\u0432\u043e";X["ru-ru"].TutorialText_3="... \u0438\u043b\u0438 \u0432\u043b\u0435\u0432\u043e, \u043d\u0435 \u0437\u0430\u0442\u0440\u043e\u043d\u0443\u0432 \u0434\u0440\u0443\u0433\u0438\u0435 \u043f\u043b\u0438\u0442\u043a\u0438";
X["ru-ru"].TutorialText_4="\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0438\u0433\u0440\u0443 \u0443\u0431\u0440\u0430\u0432 \u0432\u0441\u0435 \u043f\u043b\u0438\u0442\u043a\u0438";X["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";X["ru-ru"].TutorialTitle_1="\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u043f\u043b\u0438\u0442\u043a\u0438";X["ru-ru"].TutorialTitle_2="\u041e\u0431\u0440\u0430\u0442\u0438\u0442\u0435 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435!";
X["ru-ru"].TutorialTitle_3="\u041e\u0431\u0440\u0430\u0442\u0438\u0442\u0435 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435!";X["ru-ru"].TutorialTitle_4="\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u0435 \u0438\u0433\u0440\u044b";X["ru-ru"].levelMapScreenWorld_1="\u0423\u0440\u043e\u0432\u043d\u0438 13-24";X["ru-ru"].levelMapScreenWorld_0="\u0423\u0440\u043e\u0432\u043d\u0438 1-12";X["ru-ru"].floater_0="\u0425\u043e\u0440\u043e\u0448\u043e";X["ru-ru"].floater_1="\u041f\u0440\u0435\u043a\u0440\u0430\u0441\u043d\u043e!";
X["ru-ru"].floater_2="\u0412\u0435\u043b\u0438\u043a\u043e\u043b\u0435\u043f\u043d\u043e!";X["ru-ru"].floater_3="\u041f\u0440\u0435\u0432\u043e\u0441\u0445\u043e\u0434\u043d\u043e!";X["ru-ru"].levelMapScreenWorld_5="Level 61-72";X["ru-ru"].levelMapScreenWorld_4="Level 49-60";X["ru-ru"].levelMapScreenWorld_3="Level 37-48";X["ru-ru"].levelMapScreenWorld_2="Level 25-36";X["ru-ru"].RewardTimeAcceptBtnHeader="UNDEFINED";X["ru-ru"].RewardTimeAcceptBtnText="UNDEFINED";
X["ru-ru"].RewardTimeRejectBtnHeader="UNDEFINED";X["ru-ru"].RewardTimeRejecttBtnText="UNDEFINED";X["ru-ru"].RewardTimeOfferText="UNDEFINED";X["ru-ru"].levelMapScreenWorld_6="Level 73-84";X["ru-ru"].levelMapScreenWorld_7="Level 85-96";X["ru-ru"].levelMapScreenWorld_8="Level 97-108";X["ar-eg"]=X["ar-eg"]||{};X["ar-eg"].ShuffleConfirmationText="\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0637\u0627\u0631\u0627\u062a \u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0625\u0636\u0627\u0641\u064a\u0629\u060c \u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u062e\u0644\u0637 \u0627\u0644\u0644\u0648\u062d\u0629\u061f";
X["ar-eg"].ShuffleConfirmationTitle="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062e\u0644\u0637";X["ar-eg"].ShuffleConfirmBtnText="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062e\u0644\u0637";X["ar-eg"].ShuffleConfirmBtnTitle="\u0645\u062a\u0627\u0628\u0639\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0639\u0627\u062f\u0629 \u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0644\u0648\u062d\u0629";X["ar-eg"].ShuffleRestartBtnText="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";
X["ar-eg"].ShuffleRestartBtnTitle="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0639\u0627\u062f\u0629 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0644\u0639\u0628\u0629";X["ar-eg"].TutorialText_0="\u0627\u0639\u062b\u0631 \u0639\u0644\u0649 \u0625\u0637\u0627\u0631\u064a\u0646 \u0645\u062a\u062c\u0627\u0646\u0628\u064a\u0646 \u0645\u062a\u0637\u0627\u0628\u0642\u064a\u0646.";X["ar-eg"].TutorialText_1="#touch{\u0642\u0645 \u0628\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0627\u0644\u0646\u0642\u0631 \u0641\u0648\u0642\u0647\u0627.}{\u0642\u0645 \u0628\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0645\u062a\u0637\u0627\u0628\u0642\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0644\u0645\u0633\u0647\u0627.}";
X["ar-eg"].TutorialText_2="\u064a\u0645\u0643\u0646\u0643 \u0641\u0642\u0637 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u062a\u064a \u064a\u0645\u0643\u0646 \u0646\u0642\u0644\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u064a\u0645\u064a\u0646...";X["ar-eg"].TutorialText_3="...\u0623\u0648 \u064a\u0645\u0643\u0646 \u062a\u0631\u0643\u0647\u0627 \u062f\u0648\u0646 \u062a\u062d\u0631\u064a\u0643 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629 \u0627\u0644\u0623\u062e\u0631\u0649.";
X["ar-eg"].TutorialText_4="\u0623\u0643\u0645\u0644 \u0627\u0644\u0644\u0639\u0628\u0629 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629.";X["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";X["ar-eg"].TutorialTitle_1="\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0627\u0646\u0628\u0629";
X["ar-eg"].TutorialTitle_2="\u0627\u0646\u062a\u0628\u0647!";X["ar-eg"].TutorialTitle_3="\u0627\u0646\u062a\u0628\u0647!";X["ar-eg"].TutorialTitle_4="\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0644\u0639\u0628\u0629";X["ar-eg"].levelMapScreenWorld_1="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 13-24";X["ar-eg"].levelMapScreenWorld_0="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 1-12";X["ar-eg"].floater_0="\u062c\u064a\u062f";X["ar-eg"].floater_1="\u062c\u064a\u062f!";X["ar-eg"].floater_2="\u0639\u0638\u064a\u0645!";
X["ar-eg"].floater_3="\u0631\u0627\u0626\u0639!";X["ar-eg"].levelMapScreenWorld_5="Level 61-72";X["ar-eg"].levelMapScreenWorld_4="Level 49-60";X["ar-eg"].levelMapScreenWorld_3="Level 37-48";X["ar-eg"].levelMapScreenWorld_2="Level 25-36";X["ar-eg"].RewardTimeAcceptBtnHeader="UNDEFINED";X["ar-eg"].RewardTimeAcceptBtnText="UNDEFINED";X["ar-eg"].RewardTimeRejectBtnHeader="UNDEFINED";X["ar-eg"].RewardTimeRejecttBtnText="UNDEFINED";X["ar-eg"].RewardTimeOfferText="UNDEFINED";
X["ar-eg"].levelMapScreenWorld_6="Level 73-84";X["ar-eg"].levelMapScreenWorld_7="Level 85-96";X["ar-eg"].levelMapScreenWorld_8="Level 97-108";X["ko-kr"]=X["ko-kr"]||{};X["ko-kr"].ShuffleConfirmationText="\ub354 \uc774\uc0c1 \uc77c\uce58\ud558\ub294 \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \ubcf4\ub4dc\ub97c \ub2e4\uc2dc \uc11e\uc744\uae4c\uc694?";X["ko-kr"].ShuffleConfirmationTitle="\ub2e4\uc2dc \uc11e\uae30";X["ko-kr"].ShuffleConfirmBtnText="\ub2e4\uc2dc \uc11e\uae30";
X["ko-kr"].ShuffleConfirmBtnTitle="\ubcf4\ub4dc \ub2e4\uc2dc \uc11e\uace0 \uacc4\uc18d\ud558\uae30";X["ko-kr"].ShuffleRestartBtnText="\ub2e4\uc2dc \uc2dc\uc791";X["ko-kr"].ShuffleRestartBtnTitle="\uac8c\uc784 \ub2e4\uc2dc \uc2dc\uc791\ud558\uae30";X["ko-kr"].TutorialText_0="\ub3d9\uc77c\ud55c \ud0c0\uc77c 2\uac1c\ub97c \ucc3e\uc73c\uc138\uc694.";X["ko-kr"].TutorialText_1="#touch{\ub611\uac19\uc740 \ud0c0\uc77c\uc744 \ud074\ub9ad\ud574 \uc81c\uac70\ud569\ub2c8\ub2e4.}{\ub611\uac19\uc740 \ud0c0\uc77c\uc744 \ub20c\ub7ec \uc81c\uac70\ud569\ub2c8\ub2e4.}";
X["ko-kr"].TutorialText_2="\uc624\ub978\ucabd\uc73c\ub85c \uc774\ub3d9\ud560 \uc218 \uc788\ub294 \ud0c0\uc77c\ub9cc \uc81c\uac70\ud560 \uc218 \uc788\uc73c\uba70";X["ko-kr"].TutorialText_3="...\uc67c\ucabd\uc5d0 \ubc29\ud574\ub418\ub294 \ud0c0\uc77c\uc774 \uc5c6\uc744 \ub54c\uc5d0\ub3c4 \uc81c\uac70\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";X["ko-kr"].TutorialText_4="\ubaa8\ub4e0 \ud0c0\uc77c\uc744 \uc81c\uac70\ud558\uba74 \uac8c\uc784\uc774 \uc644\ub8cc\ub429\ub2c8\ub2e4.";
X["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";X["ko-kr"].TutorialTitle_1="\ud0c0\uc77c \uc81c\uac70";X["ko-kr"].TutorialTitle_2="\uc8fc\uc758!";X["ko-kr"].TutorialTitle_3="\uc8fc\uc758!";X["ko-kr"].TutorialTitle_4="\uac8c\uc784 \uc644\ub8cc\ud558\uae30";X["ko-kr"].levelMapScreenWorld_1="\ub808\ubca8 13-24";X["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 1-12";X["ko-kr"].floater_0="\uc88b\uc544\uc694";X["ko-kr"].floater_1="\uba4b\uc838\uc694!";X["ko-kr"].floater_2="\ud6cc\ub96d\ud574\uc694!";
X["ko-kr"].floater_3="\uad49\uc7a5\ud558\uad70\uc694!";X["ko-kr"].levelMapScreenWorld_5="Level 61-72";X["ko-kr"].levelMapScreenWorld_4="Level 49-60";X["ko-kr"].levelMapScreenWorld_3="Level 37-48";X["ko-kr"].levelMapScreenWorld_2="Level 25-36";X["ko-kr"].RewardTimeAcceptBtnHeader="UNDEFINED";X["ko-kr"].RewardTimeAcceptBtnText="UNDEFINED";X["ko-kr"].RewardTimeRejectBtnHeader="UNDEFINED";X["ko-kr"].RewardTimeRejecttBtnText="UNDEFINED";X["ko-kr"].RewardTimeOfferText="UNDEFINED";
X["ko-kr"].levelMapScreenWorld_6="Level 73-84";X["ko-kr"].levelMapScreenWorld_7="Level 85-96";X["ko-kr"].levelMapScreenWorld_8="Level 97-108";X["jp-jp"]=X["jp-jp"]||{};X["jp-jp"].ShuffleConfirmationText="\u3053\u308c\u4ee5\u4e0a\u6d88\u305b\u308b\u724c\u304c\u3042\u308a\u307e\u305b\u3093\u3002\n \u518d\u30b7\u30e3\u30c3\u30d5\u30eb\u3057\u307e\u3059\u304b\uff1f";X["jp-jp"].ShuffleConfirmationTitle="\u518d\u30b7\u30e3\u30c3\u30d5\u30eb";X["jp-jp"].ShuffleConfirmBtnText="\u518d\u30b7\u30e3\u30c3\u30d5\u30eb";
X["jp-jp"].ShuffleConfirmBtnTitle="\u518d\u30b7\u30e3\u30c3\u30d5\u30eb\u3057\u3066\u7d9a\u3051\u308b";X["jp-jp"].ShuffleRestartBtnText="\u518d\u30b9\u30bf\u30fc\u30c8";X["jp-jp"].ShuffleRestartBtnTitle="\u30b2\u30fc\u30e0\u3092\u518d\u958b\u3057\u3001\u3082\u3046\u4e00\u5ea6\u6311\u6226\u3059\u308b";X["jp-jp"].TutorialText_0="\u540c\u3058\u7d75\u67c4\u306e\u724c\u3092\u898b\u3064\u3051\u3088\u3046";X["jp-jp"].TutorialText_1="#touch{\u540c\u3058\u7d75\u67c4\u306e\u724c\u3092\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068\u6d88\u305b\u307e\u3059}{\u540c\u3058\u7d75\u67c4\u306e\u724c\u3092\u30bf\u30c3\u30d7\u3059\u308b\u3068\u6d88\u305b\u307e\u3059}";
X["jp-jp"].TutorialText_2="\u5de6\u53f3\u3084\u4e0a\u306b\u724c\u306e\u306a\u3044";X["jp-jp"].TutorialText_3="\u81ea\u7531\u724c\u306e\u307f\u6d88\u3059\u3053\u3068\u304c\u3067\u304d\u307e\u3059";X["jp-jp"].TutorialText_4="\u724c\u3092\u5168\u3066\u6d88\u3059\u3068\u30b9\u30c6\u30fc\u30b8\u30af\u30ea\u30a2\uff01";X["jp-jp"].TutorialTitle_0="\u3042\u305d\u3073\u65b9";X["jp-jp"].TutorialTitle_1="\u724c\u3092\u6d88\u3059";X["jp-jp"].TutorialTitle_2="\u6ce8\u610f\uff01";X["jp-jp"].TutorialTitle_3="\u6ce8\u610f\uff01";
X["jp-jp"].TutorialTitle_4="\u30b2\u30fc\u30e0\u30af\u30ea\u30a2";X["jp-jp"].levelMapScreenWorld_1="\u30ec\u30d9\u30eb 13-24";X["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb 1-12";X["jp-jp"].floater_0="Good";X["jp-jp"].floater_1="Nice!";X["jp-jp"].floater_2="Great!";X["jp-jp"].floater_3="Awesome!";X["jp-jp"].levelMapScreenWorld_5="\u30ec\u30d9\u30eb 61-72";X["jp-jp"].levelMapScreenWorld_4="\u30ec\u30d9\u30eb 49-60";X["jp-jp"].levelMapScreenWorld_3="\u30ec\u30d9\u30eb 37-48";
X["jp-jp"].levelMapScreenWorld_2="\u30ec\u30d9\u30eb 25-36";X["jp-jp"].RewardTimeAcceptBtnHeader="UNDEFINED";X["jp-jp"].RewardTimeAcceptBtnText="UNDEFINED";X["jp-jp"].RewardTimeRejectBtnHeader="UNDEFINED";X["jp-jp"].RewardTimeRejecttBtnText="UNDEFINED";X["jp-jp"].RewardTimeOfferText="UNDEFINED";X["jp-jp"].levelMapScreenWorld_6="\u30ec\u30d9\u30eb 73-84";X["jp-jp"].levelMapScreenWorld_7="\u30ec\u30d9\u30eb 85-96";X["jp-jp"].levelMapScreenWorld_8="\u30ec\u30d9\u30eb 97-108";X["it-it"]=X["it-it"]||{};
X["it-it"].ShuffleConfirmationText="Non ci sono pi\u00f9 combinazioni possibili. \n Vuoi rimescolare il campo di gioco?";X["it-it"].ShuffleConfirmationTitle="Rimescola";X["it-it"].ShuffleConfirmBtnText="Rimescola";X["it-it"].ShuffleConfirmBtnTitle="Continua rimescolando il campo di gioco";X["it-it"].ShuffleRestartBtnText="Ricomincia";X["it-it"].ShuffleRestartBtnTitle="Prova ancora ricominciando la partita";X["it-it"].TutorialText_0="Trova due caselle identiche";X["it-it"].TutorialText_1="#touch{Elimina le tessere identiche cliccando su di esse.}{Elimina le tessere identiche toccandole.}";
X["it-it"].TutorialText_2="Puoi eliminare solo le tessere che possono esere spostate a destra...";X["it-it"].TutorialText_3="...o a sinistra senza intralciare le altre tessere";X["it-it"].TutorialText_4="Completa la partita eliminando tutte le tessere";X["it-it"].TutorialTitle_0="Come giocare";X["it-it"].TutorialTitle_1="Rimuovi le tessere";X["it-it"].TutorialTitle_2="Fai ttenzione!";X["it-it"].TutorialTitle_3="Fai attenzione!";X["it-it"].TutorialTitle_4="Completa la partita";
X["it-it"].levelMapScreenWorld_1="Livelli 13-24";X["it-it"].levelMapScreenWorld_0="Livelli 1-12";X["it-it"].floater_0="Buono";X["it-it"].floater_1="Bene!";X["it-it"].floater_2="Grande!";X["it-it"].floater_3="Fantastico!";X["it-it"].levelMapScreenWorld_5="Level 61-72";X["it-it"].levelMapScreenWorld_4="Level 49-60";X["it-it"].levelMapScreenWorld_3="Level 37-48";X["it-it"].levelMapScreenWorld_2="Level 25-36";X["it-it"].RewardTimeAcceptBtnHeader="UNDEFINED";X["it-it"].RewardTimeAcceptBtnText="UNDEFINED";
X["it-it"].RewardTimeRejectBtnHeader="UNDEFINED";X["it-it"].RewardTimeRejecttBtnText="UNDEFINED";X["it-it"].RewardTimeOfferText="UNDEFINED";X["it-it"].levelMapScreenWorld_6="Level 73-84";X["it-it"].levelMapScreenWorld_7="Level 85-96";X["it-it"].levelMapScreenWorld_8="Level 97-108";var og=og||{};og.wi={Ak:"8d65b6b1bc2f9af242a45a429c07a6c7",Nl:"16691e664c4c5804c5ccb640b137bec48ebf5d95"};var pg={};
function qg(){pg={o:{jA:"DuckpondMahjong"},buttons:{default_color:"green",bigPlay:"blue"},Xb:{Km:.2},Tl:{ru:[{t:Ed,x:0,y:0},{t:"undefined"!==typeof Td?Td:void 0,y:O(20,"round"),x:{align:"center"}}]},xf:{ru:[{t:"undefined"!==typeof Jd?Jd:void 0,x:0,y:0}],Zb:{w:W.w,align:"center",h:"middle",fillColor:"#6d3206",fontSize:O(36)},Ls:{w:W.w,fontSize:O(30),fillColor:"#6d3206",align:"center"},vo:{w:W.w,fontSize:O(30),fillColor:"#6d3206",align:"center"}},Rv:{ro:-Cd.height,hu:{w:W.w,align:"center",h:"top",fontSize:O(26),
fillColor:"#6d3206"},ku:{align:"center"},lu:O(212,"round"),ju:O(300),iu:O(80),zv:{w:W.w,fontSize:O(36),fillColor:"#6d3206",align:"center",h:"middle"},Av:{align:"center"},Bv:O(180,"round")},dk:{Zb:{w:W.w,align:"center",h:"top",fillColor:"#8D331C",fontSize:O(40)},Zr:{align:"center",h:"middle",fillColor:"#8D331C",fontSize:O(30)},ts:{align:"center",h:"top",fontSize:O(26),fillColor:"#A96F5F"},ss:{align:"center",h:"top",fontSize:O(30),fillColor:"#8D331C"},Rt:{align:"center",h:"top",fontSize:O(26),fillColor:"#A96F5F"},
Qt:{fontSize:O(30),fillColor:"#8D331C"}},ck:{Ef:{w:W.w,align:"center",h:"middle",fillColor:"#8D331C",fontSize:O(40),V:O(6)},io:{align:"center",h:"middle",fontSize:O(26),fillColor:"#A96F5F"},Zm:{align:"center",h:"middle",fontSize:O(30),fillColor:"#8D331C"},tj:{align:"center",h:"middle",fontSize:O(30),fillColor:"#A96F5F"},Iy:{w:W.w,align:"center",h:"middle",fillColor:"#8D331C",fontSize:O(32),V:O(6)},Xs:O(540)},na:{ub:O(10),Zb:{w:W.w,align:"center",h:"middle",fontSize:O(38),fillColor:"#6d3206"},tB:!1,
$m:{w:W.w,align:"center",h:"top",fillColor:"#d68d46",fontSize:O(34)},Fg:O(194),pi:{w:W.w,align:"center",h:"top",fillColor:"#6d3206",fontSize:O(64)},dj:{w:W.w,h:"bottom",fillColor:"#d68d46",fontSize:O(32)},nd:O(4),Vf:{w:W.w,h:"bottom",fillColor:"#6d3206",fontSize:O(26)},Ys:{w:W.w,align:"center",h:"middle",fontSize:O(64),fillColor:"#01513d"},Qi:O(140),hc:54},options:{ub:O(10),Gf:800,Hf:M,Vg:600,Wg:ac,Fl:{w:W.w,align:"center",h:"middle",fontSize:O(30),fillColor:"#6d3206",V:O(6)},Zb:{w:W.w,align:"center",
h:"middle",fontSize:O(38),fillColor:"#6d3206"},mj:{h:"middle",align:"center",fontSize:P({big:26,small:13}),fillColor:"#004f5d"},nj:{align:"center",h:"top",fontSize:P({big:36,small:18}),fillColor:"#004f5d"},hc:54},po:{Gf:800,Hf:M,Vg:600,Wg:ac,Rm:{w:W.w,align:"center",h:"middle",fontSize:O(30),fillColor:"#6d3206",V:O(6)},Ef:{w:W.w,align:"center",h:"middle",fontSize:O(30),fillColor:"#6d3206",V:O(6)},Zb:{w:W.w,align:"center",h:"middle",fontSize:O(38),fillColor:"#6d3206"},mj:{h:"middle",align:"center",
fontSize:P({big:26,small:13}),fillColor:"#004f5d"},nj:{align:"center",h:"top",fontSize:P({big:36,small:18}),fillColor:"#004f5d"},jk:O(220),ki:O(460),ik:O(250),hk:O(460),gk:O(560,"round")},$c:{Gf:800,Hf:M,Vg:600,Wg:ac,ub:{align:"center",offset:0},xo:{w:W.w,align:"center",h:"middle",fontSize:O(30),fillColor:"#6d3206",V:O(6)},Yo:{w:W.w,align:"center",h:"middle",fontSize:O(24),fillColor:"#A96F5F",V:O(6)},El:O(460),Dl:O(210),vg:{align:"bottom",offset:O(-30)},os:{align:"center",offset:O(70)}},zk:{font:{w:W.w,
align:"center",h:"middle",fontSize:P({big:72,small:36}),fillColor:"#037564",stroke:!0,Sc:O(5,"round"),strokeColor:"#ffffff",je:!0}}}}var rg=null;
function sg(){rg={bk:{Dc:{id:"canvasGame",depth:100,top:O(40,"round"),left:O(296,"round"),width:O(640,"round"),height:O(560,"round")}},nf:{Cg:"unlocked",pn:"Mahjong",Ad:"difficulty",T:[12,12],Yi:!1,Rf:!0},uf:{Rd:100,Ca:10,hA:2,gr:3E3,n:2,up:O(18,"round"),xp:O(8,"round")},el:{Fz:.1,Ou:.5,Ru:4,dv:2,lv:2,hs:O(-10,"round"),mx:O(-10,"round"),Mx:2,my:.5,Zy:O(-15,"round"),$y:O(-16,"round"),oh:O(93),az:O(44.5,"round"),bz:O(44.5,"round"),cg:O(70)},Lx:{Rd:80,ay:100},Vi:{Nr:4,Vr:2,qs:0},Ox:{rb:1E3,wo:1E3},Ko:{Rd:100,
up:O(52,"round"),xp:O(39,"round")},Ty:{rb:1E3,wo:1E3},nA:{vA:!1},Aa:{yu:2,Yy:10},EA:24,Af:[{name:"level_1",width:10,height:6,icon:"undefined"!==typeof Ne?Ne:void 0,Ma:"NNNNNNNNNN;N NNNNNN N;F FNNNNF F;   NNQN   ;N NNNNNN N;NNNNNNNNNN".split(";"),Na:" 22333322 ;   2332   ;2  2332  2;   2332   ;   2332   ; 22333332 ".split(";"),Aa:{time:18E4},K:{K:0}},{name:"level_2",width:10,height:6,icon:"undefined"!==typeof Oe?Oe:void 0,Ma:"  NN  NN  ;NNNNNNNNNN;  NN  NN  ;  NN  NN  ;NNNNNNNNNN;  NN  NN  ".split(";"),
Na:"  22  22  ; 23344332 ;  22  22  ;  22  22  ; 23344332 ;  22  22  ".split(";"),Aa:{time:18E4},K:{K:0}},{name:"level_3",width:10,height:6,icon:"undefined"!==typeof Ze?Ze:void 0,Ma:"N N N N N ; N N N N N;N N N N N ; N N N N N;N N N N N ; N N N N N".split(";"),Na:"3 4 3 2 3 ; 2 3 4 3 2;3 4 3 2 3 ; 2 3 4 2 2;3 4 3 2 3 ; 2 3 4 3 2".split(";"),Aa:{time:18E4},K:{K:0}},{name:"level_4",width:10,height:6,icon:"undefined"!==typeof ef?ef:void 0,Ma:" NNNNNNNN ; NQQQNQQQ ; NQQQQQQQ ; NQQQQQQQ ;   NQQQ   ;    NQ    ".split(";"),
Na:" 22222222 ; 22222222 ; 22222222 ; 22222222 ;   2222   ;    22    ".split(";"),Aa:{time:18E4},K:{K:0}},{name:"level_5",width:10,height:6,icon:"undefined"!==typeof ff?ff:void 0,Ma:"NNNNNNNNNN;N  NNNN  N;N NNNNNN N;N NQNNNQ N;N  NNNN  N;NNNNNNNNNN".split(";"),Na:"22  22  22;2   33   2;  334433  ;  334433  ;2   33   2;22  22  22".split(";"),Aa:{time:18E4},K:{K:1}},{name:"level_6",width:10,height:6,icon:"undefined"!==typeof gf?gf:void 0,Ma:"N        N;N  NNNN  N;NFNNNNNNFN;N NNNQNN N;N  NNNN  N;N        N".split(";"),
Na:"          ;2  2222  2;22233332 2;2 233332 2;2  2222  2;          ".split(";"),Aa:{time:18E4},K:{K:1}},{name:"level_7",width:10,height:6,icon:"undefined"!==typeof hf?hf:void 0,Ma:"NNNNNNNNNN;  NNQNQN  ;FNNNNNNNNF; NNQNNNQN ;  NNNNNN  ;NNNNQNQNNN".split(";"),Na:"   2222   ;   2222   ;  223322  ;  223322  ;   2222   ;   2222   ".split(";"),Aa:{time:18E4},K:{K:1}},{name:"level_8",width:10,height:6,icon:"undefined"!==typeof jf?jf:void 0,Ma:"FFNNNNNNFF;  NNNNNN  ;FFNNNNNNFF;  NNNNNN  ;FFNNNNNNFF;  NNNNNN  ".split(";"),
Na:"  2    2  ;  234432  ;  2    2  ;  2    2  ;  234432  ;  2    2  ".split(";"),Aa:{time:18E4},K:{K:1}},{name:"level_9",width:10,height:6,icon:"undefined"!==typeof kf?kf:void 0,Ma:" NNNNNNNN ;NNNNNNNNNN;NNNN  NNNN;NNNN  NNNN;NNNNNNNNNN; NNNNNNNN ".split(";"),Na:"          ; 22344322 ; 234  432 ; 234  432 ; 22344322 ;          ".split(";"),Aa:{time:18E4},K:{K:2}},{name:"level_10",width:10,height:6,icon:"undefined"!==typeof lf?lf:void 0,Ma:" FNNNNF N ;N  FF  NNN;N N  N NNN;N NFFNFNNN;NF      NN;  NNNNN N ".split(";"),
Na:" 222223   ;2  22  2  ;2 2  2 2  ;2 222222  ;22        ;  22234   ".split(";"),Aa:{time:18E4},K:{K:2}},{name:"level_11",width:10,height:6,icon:"undefined"!==typeof Pe?Pe:void 0,Ma:" NNNNNNNN ;FNQQQQQQQF;FNQNNNNNQF;FNQNNNNNQF; NQNNNNNQ ; NQQQQQQQ ".split(";"),Na:" 22222222 ; 22222222 ; 22344322 ; 22344322 ; 22222222 ; 22222222 ".split(";"),Aa:{time:18E4},K:{K:2}},{name:"level_12",width:10,height:6,icon:"undefined"!==typeof Qe?Qe:void 0,Ma:" NNNNNNNN ;FNQNNQNNQF; NN NN NN ;FNN NN NNF; NNNNNNNN ; NQNNQNNQ ".split(";"),
Na:" 22233222 ;222 33 222; 33 44 33 ;233 44 332; 22 33 22 ; 22233222 ".split(";"),Aa:{time:18E4},K:{K:2}},{name:"level_13_aries",width:10,height:6,icon:"undefined"!==typeof Re?Re:void 0,Ma:" NN    NN ;N  N  N  N; N  NN  N ;    NN    ;    NN    ;    NN    ".split(";"),Na:" 33    33 ;2  4  4  2; 2  44  2 ;    44    ;    44    ;    44    ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_14_taurus",width:10,height:6,icon:"undefined"!==typeof Se?Se:void 0,Ma:"NN      NN;  NNNNNN  ;   NNNN   ;  NN  NN  ;  NN  NN  ;   NNNN   ".split(";"),
Na:"22      22;  333333  ;   4444   ;  44  44  ;  44  44  ;   4444   ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_15_gemini",width:10,height:6,icon:"undefined"!==typeof Te?Te:void 0,Ma:"NNNNNNNNNN;  NN  NN  ;  NQ  NQ  ;  NQ  NQ  ;  NQ  NQ  ;NNNNNNNNNN".split(";"),Na:"2222222222;  44  44  ;  44  44  ;  44  44  ;  44  44  ;2222222222".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_16_cancer",width:10,height:6,icon:"undefined"!==typeof Ue?Ue:void 0,Ma:"NNNNNNNNN ;N  N    NN;NNNN      ;      NNNN;NN    N  N; NNNNNNNNN".split(";"),
Na:"222222222 ;2  4    22;2334      ;      4332;22    4  2; 222222222".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_17_leo",width:10,height:6,icon:"undefined"!==typeof Ve?Ve:void 0,Ma:"    NN    ;   N  N   ; NNN  N   ;N  N  N  N;N  N  N  N; NN    NN ".split(";"),Na:"    33    ;   3  3   ; 223  3   ;2  2  3  4;2  2  4  4; 22    34 ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_18_virgo",width:10,height:6,icon:"undefined"!==typeof We?We:void 0,Ma:" NN NN    ;N  N  N N ;N  N  NN N;N  N  N  N;N  N  N N ;N  N NNN  ".split(";"),
Na:" 22 22    ;2  2  2 4 ;2  2  24 4;2  2  3  4;2  2  3 4 ;2  2 444  ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_19_libra",width:10,height:6,icon:"undefined"!==typeof Xe?Xe:void 0,Ma:"   NNNN   ;  NN  NN  ;NNNN  NNNN;          ;NNNNNNNNNN;          ".split(";"),Na:"   4444   ;  34  43  ;2233  3322;          ;2233443322;          ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_20_scorpio",width:10,height:6,icon:"undefined"!==typeof Ye?Ye:void 0,Ma:" NN NN    ;N  N  N   ;N  N  N   ;N  N  N  N;N  N  N  N;N  N  NNNN".split(";"),
Na:" 34 43    ;2  4  4   ;2  4  4   ;2  4  4  4;2  4  4  2;2  4  4332".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_21_sagittarius",width:10,height:6,icon:"undefined"!==typeof $e?$e:void 0,Ma:"      NNNN;  N    FNN;   N FN  N;   FN     ; FN  N    ;N     N   ".split(";"),Na:"      4444;  2    334;   2 33  4;   33     ; 33  2    ;2     2   ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_22_capricorn",width:10,height:6,icon:"undefined"!==typeof af?af:void 0,Ma:" N NN     ;N N  N NN ;  N  NN  N;     NN  N;     N NN ;   NN     ".split(";"),
Na:" 3 33     ;3 3  3 44 ;  3  34  4;     34  4;     3 44 ;   33     ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_23_aquarius",width:10,height:6,icon:"undefined"!==typeof bf?bf:void 0,Ma:"  NNN NNN ; NN NNN NN;          ;  NNN NNN ; NN NNN NN;          ".split(";"),Na:"  344 344 ; 22 322 32;          ;  344 344 ; 22 322 32;          ".split(";"),Aa:{time:18E4},K:{K:-1}},{name:"level_24_pisces",width:10,height:6,icon:"undefined"!==typeof cf?cf:void 0,Ma:" NN     NN;   N   N  ;FFFNFFFNFF;   N   N  ;   N   N  ; NN     NN".split(";"),
Na:" 33     33;   4   4  ;3334333433;   4   4  ;   4   4  ; 33     33".split(";"),Aa:{time:18E4},K:{K:-1}}]}}N.l=N.l||{};N.l.sv=function(){var a=N.vy;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};N.l.Ik=function(){N.d.Fc()};N.l.BA=function(){};N.l.cl=function(){};N.l.Jk=function(){N.d.Fc()};N.l.xA=function(){};N.l.wA=function(){};N.l.AA=function(){};N.l.jr=function(){};N.l.hr=function(){};N.l.ir=function(){};N.l.yA=function(){};N.l.uv=function(){N.d.Fc()};
N.l.vv=function(){N.d.Fc()};N.l.Mg=function(){N.d.Fc()};N.l.tv=function(){N.d.Fc()};N.l.Rq=function(a,b){void 0===N.d.de&&(N.d.de=new tg(!0));return ug(a,b)};N.l.jp=function(a){void 0===N.d.de&&(N.d.de=new tg(!0));return vg(a)};N.l.jd=function(a){window.open(a)};N.l.Di=function(){return[{f:Yc,url:N.B.cr}]};N.l.Lv=function(){};N.ud=N.ud||{};N.ud.Ik=function(){N.d.sj=!1};N.ud.cl=function(){};N.ud.Jk=function(){N.d.sj=!1};N.ud.Mg=function(){N.d.sj=!1};
function wg(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function xg(a,b,c,e){this.gm=this.Hg=a;this.Ju=b;this.duration=1;this.iq=e;this.ye=c;this.ak=null;this.th=0}function yg(a,b){a.th+=b;a.th>a.duration&&a.ak&&(a.ak(),a.ak=null)}xg.prototype.ha=function(){if(this.th>=this.duration)return this.ye(this.duration,this.Hg,this.gm-this.Hg,this.duration);var a=this.ye(this.th,this.Hg,this.gm-this.Hg,this.duration);this.iq&&(a=this.iq(a));return a};
function zg(a,b){a.Hg=a.ha();a.gm=b;a.duration=a.Ju;a.ak=void 0;a.th=0}N.$u=void 0!==N.environment?N.environment:"development";N.Bz=void 0!==N.ga?N.ga:N.$u;"undefined"!==typeof N.mediaUrl?ha(N.mediaUrl):ha(N.size);N.nu="backButton";N.wf="languageSet";N.Je="resizeEvent";N.version={builder:"1.8.3.0","build-time":"17:49:13","build-date":"28-04-2020",audio:H.Za?"web audio api":H.Qa?"html5 audio":"no audio"};
N.Nz=new function(){this.Be=this.iw=3;m.u.lh&&(this.Be=3>m.Oa.me?1:4.4>m.Oa.me?2:3);m.Oa.Uk&&(this.Be=7>m.Oa.me?2:3);m.Oa.op&&(this.Be=8>m.Oa.me?2:3);N.version.browser_name=m.name;N.version.browser_version=m.u.version;N.version.os_version=m.Oa.version;N.version.browser_grade=this.Be};N.a={};"function"===typeof mg&&mg();"function"===typeof sg&&sg();"function"===typeof qg&&qg();"function"===typeof initGameThemeSettings&&initGameThemeSettings();N.a.D="undefined"!==typeof lg?lg:{};
N.a.o="undefined"!==typeof rg?rg:{};N.a.R="undefined"!==typeof pg?pg:{};N.a.kA="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};N.bh=window.publisherSettings;N.B="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof ng&&(N.B=ng);if("undefined"!==typeof og)for(var Ag in og)N.B[Ag]=og[Ag];
(function(){var a,b,c,e,g;N.i={};N.i.Fp="undefined"!==typeof X?X:{};N.i.eb=void 0!==N.B.ae&&void 0!==N.B.ae.Qj?N.B.ae.Qj:N.a.D.ae.Qj;g=[];for(b=0;b<N.i.eb.length;b++)g.push(N.i.eb[b]);if(N.B.Oy)for(b=N.i.eb.length-1;0<=b;b--)0>N.B.Oy.indexOf(N.i.eb[b])&&N.i.eb.splice(b,1);try{if(e=function(){var a,b,c,e,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),e=0,g=a.length;e<g;e++)c=a[e].split("="),b[c[0]]=c[1];return b}(),e.lang)for(c=e.lang.toLowerCase().split("+"),b=N.i.eb.length-1;0<=
b;b--)0>c.indexOf(N.i.eb[b])&&N.i.eb.splice(b,1)}catch(h){}0===N.i.eb.length&&(0<g.length?N.i.eb=g:N.i.eb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(e=0;e<N.i.eb.length;e++)if(0<=N.i.eb[e].search(g)){a=N.i.eb[e];break}if(void 0!==a)break}void 0===a&&(a=void 0!==N.B.ae&&void 0!==N.B.ae.Rk?N.B.ae.Rk:N.a.D.ae.Rk);N.i.wm=0<=N.i.eb.indexOf(a)?a:N.i.eb[0];N.i.Aj=N.i.Fp[N.i.wm];
if(void 0!==N.a.D.Ob.language_toggle&&void 0!==N.a.D.Ob.language_toggle.W){a=N.a.D.Ob.language_toggle.W;c=[];for(b=0;b<a.length;b++)0<=N.i.eb.indexOf(a[b].id)&&c.push(a[b]);N.a.D.Ob.language_toggle.W=c}N.i.r=function(a,b){var c,e,g,h;if(void 0!==N.i.Aj&&void 0!==N.i.Aj[a]){c=N.i.Aj[a];if(e=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<e.length;h++)g=(g=m.kf.et||m.kf.Wr)?e[h].match(/{[^}]*}/g)[1]:e[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(e[h],g);return c}return b};N.i.As=function(a){N.i.wm=
a;N.i.Aj=N.i.Fp[a];la(N.wf,a)};N.i.Bn=function(){return N.i.wm};N.i.nv=function(){return N.i.eb};N.i.Nv=function(a){return 0<=N.i.eb.indexOf(a)}})();N.Pu={Oa:"",jx:"",NA:"",Um:""};N.b={};
N.b.createEvent=function(a,b){var c,e,g,h;e=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:e,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,e)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=e}return c};N.b.ij=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
N.b.Ji=function(a){function b(){}b.prototype=Bg.prototype;a.prototype=new b};N.b.ey=function(a,b,c,e,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=e+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));N.Sd.push(l);return l};
(function(){var a,b,c,e,g,h,k;N.rr=0;N.sr=0;N.Ml=!1;N.kz=m.u.lh&&m.u.me&&4<=m.u.me;N.uj=!1;N.Ht=m.kf.et||m.kf.Wr;N.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===N.orientation?N.a.D.bk:N.a.D.Sd;h="landscape"===N.orientation?N.a.o.bk:N.a.o.Sd;if(void 0!==h){if(void 0!==h.Dc)for(a in h.Dc)k.Dc[a]=h.Dc[a];if(void 0!==h.Ec)for(a in h.Ec)k.Ec[a]=h.Ec[a]}b=function(){var a,b,c,e;if(N.kz&&!N.uj){N.uj=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){N.uj=!1;return}b=document.createEvent("Event");b.PA=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);e=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);e.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(e[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);N.uj=!1},100)}};c=function(){var a,c,e,g,h,E,s,t,u;"landscape"===N.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.Bg,k.Hc],e=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.Hc,k.Qb],e=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];E=e/c[1];h<g?(h=h<E?Math.floor(a[0]/E):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));s=h/c[1];!N.Ht&&1<s&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),s=1);a="landscape"===N.orientation?g:h;c="landscape"===N.orientation?h:g;u=t=0;window.innerHeight<Math.floor(k.Hc*s)&&(t=Math.max(k.kl,window.innerHeight-Math.floor(k.Hc*s)));window.innerWidth<Math.floor(k.Qb*s)&&(u=Math.floor(Math.max(k.Bg-k.Qb,(window.innerWidth-Math.floor(k.Qb*s))/s)),window.innerWidth<Math.floor(k.Qb*s)+u*s&&(u+=Math.floor(Math.max((e-k.Bg)/2,(window.innerWidth-(k.Qb*s+u*s))/2/s))));N.Vj=k.Hc-k.oq;N.su=k.Qb-k.Bg;N.ra=t;N.Pz=u;N.Oz=Math.min(N.su,-1*N.Qz);N.Ae=(k.Ec.top||
k.hf)-N.ra;N.$={top:-1*t,left:-1*u,height:Math.min(k.Hc,Math.round(Math.min(c,window.innerHeight)/s)),width:Math.min(k.Qb,Math.round(Math.min(a,window.innerWidth)/s))};N.fB="landscape"===N.orientation?{top:0,left:Math.floor((k.Bg-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.kl),left:k.gf,width:k.Qb,height:k.minHeight};e=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===N.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+e+"px; top:50%; margin-top:"+-e/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+e+"px");e=function(a,b,c,e){var g,h,l,n;g=void 0!==b.top?b.top:k.hf;h=void 0!==b.left?b.left:k.gf;l=void 0!==b.width?b.width:k.Qb;n=void 0!==b.height?b.height:k.Hc;a.aA=Math.floor(s*g);a.$z=Math.floor(s*h);a.bA=Math.floor(s*l);a.Zz=Math.floor(s*
n);!1!==c&&(g+=t);!1!==e&&(h+=u);a.setAttribute("style","position:absolute; left:"+Math.floor(s*h)+"px; top:"+Math.floor(s*g)+"px; width:"+Math.floor(s*l)+"px; height:"+Math.floor(s*n)+"px; z-index: "+b.depth)};e(N.Im,k.Qm);e(N.ln,k.Dc);e(N.xn,k.Ec,!1,!0);e(N.be,k.cf);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);la(N.Je)};a=function(){if(N.rr===window.innerHeight&&N.sr===window.innerWidth||N.Ml)return!1;document.documentElement.style["min-height"]=5E3;e=window.innerHeight;g=40;N.Ml=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,m.u.lh?1:0);g--;if((m.u.lh?0:window.innerHeight>e)||0>g)N.sr=window.innerWidth,N.rr=window.innerHeight,clearInterval(N.Ml),N.Ml=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};N.Bi=k.Dc.left||k.gf;N.Ci=k.Dc.top||k.hf;N.yn=k.Dc.width||k.Qb;N.on=k.Dc.height||k.Hc;N.rf=k.Ec.left||k.gf;N.Ae=k.Ec.top||k.hf;N.mA=k.Ec.width||k.Qb;
N.lA=k.Ec.height||k.Hc;N.ew=k.cf.left||k.gf;N.fw=k.cf.top||k.hf;N.gw=k.cf.width||k.Qb;N.dw=k.cf.height||k.Hc;h=function(a){return N.b.ey(a.id,a.depth,void 0!==a.top?a.top:k.hf,void 0!==a.left?a.left:k.gf,void 0!==a.width?a.width:k.Qb,void 0!==a.height?a.height:k.Hc)};N.Sd=[];N.Im=h(k.Qm);N.ln=h(k.Dc);N.xn=h(k.Ec);N.be=h(k.cf);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);N.rc={};N.rc[N.xi]=N.Im;N.rc[N.pf]=N.ln;N.rc[N.Fk]=N.xn;N.rc[N.mn]=N.be;N.rc[N.of]=N.Im;N.rc[N.sb]=N.be;N.rc[N.Yd]=N.be})();
N.b.eu=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ia.pe+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),N.uu=!0,N.di=!0,b=function(a){N.uu&&N.di&&(N.l.jd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){N.di&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){N.di&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};N.b.kB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";N.di=!0}};
N.b.uA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";N.di=!1}};N.b.An=function(a){return a===N.ln?{x:N.Bi,y:N.Ci}:a===N.xn?{x:N.rf,y:N.Ae}:{x:N.ew,y:N.fw}};N.b.Zd=function(a){return N.rc[a]};N.b.mb=function(a){return N.rc[a]?(p.canvas!==N.rc[a]&&p.mb(N.rc[a]),!0):!1};N.b.bb=function(a,b){if(N.rc[b]){var c=I;a.Ia!==b&&(c.Rh=!0);a.Ia=b;a.canvas=N.rc[b]}};
N.b.g=function(a,b,c,e){var g;b=b||0;c=c||0;e=e||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-e))+g;case "left":case "top":return g-e;case "right":case "bottom":return b-c-g-e;default:return g+0}return 0};
N.b.fa=function(a,b,c,e){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===e||"middle"===e?Math.round(b/2)+g:"left"===e||"top"===e?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===e||"middle"===e?Math.round(c/2)+g:"left"===e||"top"===e?g:c+g;case "right":case "bottom":return"center"===e||"middle"===e?b-Math.round(c/2)-g:"left"===e||"top"===e?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};N.b.Tz=function(a,b,c,e){switch(e){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};N.ea=N.ea||{};N.ea.hy=!1;N.ea.mr=function(a){a instanceof Array&&(this.Ak=a[0],this.Nl=a[1],this.vu="https://api.gameanalytics.com/v2/"+this.Ak,this.nr=!0)};
N.ea.Te=function(a,b){var c,e=JSON.stringify(b),g=window.Crypto.HmacSHA256(e,this.Nl),g=window.Crypto.enc.Base64.stringify(g),h=this.vu+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.hy&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(e)}catch(k){}};
N.ea.ic={zp:"user",yp:"session_end",Tt:"business",Ut:"resource",vj:"progression",qm:"design",ERROR:"error"};N.ea.Pe=function(){return{user_id:this.mp,session_id:this.dy,build:this.Au,device:this.Um,platform:this.platform,os_version:this.kx,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
N.ea.Vb=function(a,b,c,e,g,h,k){this.dy=a;h&&"object"===typeof h&&(this.mp=h.mp);this.Au=g;this.k=!0;this.nr&&(this.Um=k.Um,this.platform=k.Oa,this.kx=k.jx);this.Te("init",this.Pe())};N.ea.Cy=function(a){var b=this.Pe(),c=[];b.category=a;c.push(b);this.Te("events",c)};N.ea.cn=function(a,b,c,e){a=[];b=this.Pe();b.length=Math.floor(c);b.category=e;a.push(b);this.Te("events",a)};
N.ea.Va=function(a,b,c,e){var g=[],h=!1;if(this.k&&this.nr){if(e)switch(e){case N.ea.ic.zp:this.Cy(e);h=!0;break;case N.ea.ic.yp:this.cn(0,0,c,e);h=!0;break;case N.ea.ic.Tt:h=!0;break;case N.ea.ic.Ut:h=!0;break;case N.ea.ic.vj:this.cv(a,b,c,e);h=!0;break;case N.ea.ic.qm:this.av(a,b,c,e),h=!0}h||(e="",b&&(e=b instanceof Array?b.toString().replace(",",":"):e+b),b=this.Pe(),b.event_id=e+":"+a,b.value=c,g.push(b),this.Te("design",g))}};N.ea.eB=function(a,b,c){this.Va(a,b,c)};N.ea.fA=function(){};
N.ea.gA=function(){};N.ea.cv=function(a,b,c,e){var g=[],h=this.Pe();switch(a){case "Start:":h.category=e;h.event_id=a+b;break;case "Complete:":h.category=e;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=e,h.event_id=a+b,h.score=c}g.push(h);this.Te("events",g)};N.ea.av=function(a,b,c,e){var g=[],h=this.Pe();h.category=e;h.event_id=a+b;h.value=c;g.push(h);this.Te("events",g)};N.ea.ps=function(a,b){var c=[],e=this.Pe();e.category="error";e.message=a;e.severity=b;c.push(e);this.Te("events",c)};
function Cg(){this.Ia=this.depth=0;this.visible=!1;this.k=!0;this.a=N.a.D.Ba;this.wx=this.a.dz;J(this);Kb(this,"system")}function Dg(){var a=Eg("userId","");""===a&&(a=Fg(),Gg("userId",a));return a}function Fg(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}d=Cg.prototype;d.start=function(a){N.ea.mr(a);N.ea.Vb(Fg(),N.a.o.nf.pn,N.a.R.id,N.B.xx,Hg(),{mp:Dg()},N.Pu)};d.Va=function(a,b,c,e){N.ea.Va(a,b,c,e)};
function Ig(a,b,c,e){var g,h;for(g=0;g<a.ba.length;g++)void 0!==a.ba[g]&&a.ba[g].tag===b&&(h=a.ba[g],a.Va(c,e,h.n/1E3,N.ea.ic.yp),h.k=!1)}function Jg(){var a=N.Ba,b=N.d.eg,c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused+=1)}d.ps=function(a,b){N.ea.ps(a,b)};d.Sb=function(){this.ba=[]};
d.ua=function(a){var b,c=0;for(b=0;b<this.ba.length;b++)this.ba[b].k&&(0===this.ba[b].paused&&(this.ba[b].n+=a),c=b);c<this.ba.length-1&&(a=this.ba.length-Math.max(this.wx,c+1),0<a&&this.ba.splice(this.ba.length-a,a))};
function tg(a,b,c){this.Kr=a||!1;this.host=b||"http://localhost:8080";this.cy=c||this.host+"/services/storage/gamestate";this.bt="undefined"!==typeof window.localStorage;this.Qn=this.kp=!1;var e=this;window.parent!==window&&(m.u.Go||m.Oa.Uk)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?e.kp="ok"===a.result:"getItem"===b&&e.Gk&&("ok"===a.result?e.Gk(a.value):e.Gk(a.defaultValue))},!1),this.Gk=null,window.parent.postMessage({command:"init"},"*"));this.Ri=[];window.setTimeout(function(){e.Qn=
!0;for(var a=0;a<e.Ri.length;++a)e.Ri[a]();e.Ri=[]},2E3)}function Kg(){return"string"===typeof N.B.Us&&""!==N.B.Us?N.B.Us:void 0!==N.a.o.nf&&void 0!==N.a.o.nf.pn?N.a.o.nf.pn:"0"}function ug(a,b){var c=N.d.de;"function"===typeof b&&(c.Qn?Lg(c,a,b):c.Ri.push(function(){Lg(c,a,b)}))}function vg(a){var b=N.d.de;b.Qn?Mg(b,a):b.Ri.push(function(){Mg(b,a)})}
function Mg(a,b){var c=null,e=Kg();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.kp)window.parent.postMessage({command:"setItem",key:"TG_"+e,value:c},"*");else{if(a.bt)try{window.localStorage.setItem(e,c)}catch(h){}a.Kr||(c=new mb("gameState_"+e),c.text=void 0===JSON?"":JSON.stringify(b),nb(c,a.cy+"/my_ip/"+e))}}
function Lg(a,b,c){var e=null,g=null,h=Kg();if(a.kp)a.Gk=function(a){var g;try{e=JSON.parse(a),g=JSON.parse(e.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.bt)try{(e=window.localStorage.getItem(h))&&(e=JSON.parse(e))}catch(k){c(b);return}a.Kr||(a=new mb("gameState_"+h),g=null,ob(a,tg.cB+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(e){if(g&&Date.parse(g.lastChanged)>Date.parse(e.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(e.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(l){c(b);return}c(b)}}
function Ng(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.Rb=this.visible=!1!==c;this.k=!0;N.b.bb(this,N.sb);var e;this.a=N.a.D.hd;if("landscape"===N.orientation&&N.a.D.Vn)for(e in N.a.D.Vn)this.a[e]=N.a.D.Vn[e];for(e in N.a.R.hd)this.a[e]=N.a.R.hd[e];if(N.B.hd)for(e in N.B.hd)this.a[e]=N.B.hd[e];this.pb=a;this.gq=b;this.tq=!1;this.ci=0;this.Jm=!1;this.Tj=0;this.Sj=
this.a.qu;this.yo=!0;this.Zv=.6/Math.log(this.a.fl+1);this.Ot=void 0!==N.B.Yv?N.B.Yv:this.a.Hw;this.jw=this.Ot+this.a.mw;J(this)}d=Ng.prototype;d.No=function(a){var b;N.b.mb(N.of);pa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=T.M();(N.B.hd&&N.B.hd.gj||this.a.gj)&&C(b,N.B.hd&&N.B.hd.gj?N.B.hd.gj:this.a.gj);a=N.i.r(a,"<"+a.toUpperCase()+">");b.p(a,this.canvas.width/2,this.canvas.height/2,this.a.em);this.error=!0;this.visible=this.Rb=!1;this.canvas.Z=!0};
d.ee=function(){this.oa&&(this.Bb=N.b.g(this.a.Bb,N.$.width,this.oa.width)+N.$.left,this.tc=N.b.g(this.a.tc,N.$.height,this.oa.height)+N.$.top)};
d.Sm=function(){var a,b,c,e,g,h;if("function"===typeof N.l.Di&&(h=this.a.Df,(this.ya=N.l.Di())&&0<this.ya.length)){this.oa?this.oa.clear():this.oa=new x(this.a.Df,this.a.Oi);y(this.oa);h/=this.ya.length;for(c=0;c<this.ya.length;c++)try{g=this.ya[c].f,e=Math.min(1,Math.min((h-20)/g.width,this.a.Oi/g.height)),a="center"===this.a.Mi?h*c+Math.round((h-g.width*e)/2):h*c+Math.round(h-g.width*e)-10,b=this.oa.height-g.height*e,g instanceof r?g.Da(0,a,b,e,e,0,1):p.context.drawImage(g,a,b,g.width*e,g.height*
e)}catch(k){}z(this.oa);this.dl=0;this.Xn=!0;this.Ni=0;this.Cf=Rb(0,0,this.oa.width,this.oa.height);this.ee()}};
d.Ga=function(){var a,b,c,e;this.yo?p.clear():N.b.mb(N.of);if(this.a.backgroundImage)if(e=this.a.backgroundImage,a=Math.abs(N.ra),1<e.H){c=(p.canvas.height-a)/e.Ag;b=-(e.ii*c-p.canvas.width)/2;c=p.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.ci;for(h=0;h<e.H;h+=1)k=b+h%e.$g*e.width,l=a+e.height*Math.floor(h/e.$g),e.Kd.ma(e.Fd[h],e.Gd[h],e.Hd[h],e.Uc[h],e.Tc[h],k-e.Hb+e.pd[h],l-e.Ib+e.qd[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/e.height,b=-Math.floor((e.width*c-this.canvas.width)/
2),e instanceof r?e.Da(0,b,a,c,c,0,this.ci):e instanceof x&&e.Da(b,a,c,c,0,this.ci);e=this.a.Ee+this.a.Tn+this.a.Og;b=lc.height;a=lc.width-(this.a.Ee+this.a.Tn);this.Pg=N.b.g(this.a.Pg,p.canvas.width,e);this.Bf=N.b.g(this.a.Bf,p.canvas.height,b);lc.ma(0,0,0,this.a.Ee,b,this.Pg,this.Bf,1);lc.pk(0,this.a.Ee,0,a,b,this.Pg+this.a.Ee,this.Bf,this.a.Og,b,1);lc.ma(0,this.a.Ee+a,0,this.a.Tn,b,this.Pg+this.a.Ee+this.a.Og,this.Bf,1)};
function Og(a){a.yo&&(a.Jm=!0);a.visible&&(a.Ga(),a.Sm(),"function"===typeof N.l.Dn&&(a.he=N.l.Dn(),a.he instanceof x&&(a.hh=!0,a.Fs=Math.floor((a.canvas.width-a.he.width)/2),a.Gs=Math.floor((a.canvas.height-a.he.height)/2))));N.d.bl&&ia.Ed("audio");N.d.al&&ia.Ed("audio_music");ia.Ed("fonts")}
d.Sb=function(){var a,b=!1;if(void 0!==N.B.aj)if(!1===N.B.aj.$v)b=!0;else{if(void 0!==N.B.aj.Vm)for(a=0;a<N.B.aj.Vm.length;a++){var c;a:{c=N.B.aj.Vm[a];var e=void 0,g=void 0,h=e=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===Pg("file://"))c=!0;else{g=g.split(".");e=g.shift().split("://");e[0]+="://";g=e.concat(g);h="";for(e=g.length-1;0<=e;e--)if(h=g[e]+(0<e&&e<g.length-1?".":"")+h,Pg(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof N.B.cz&&(new Date).getTime()>N.B.cz&&(b=!1);b?(this.ug=[],this.error=!1,this.lt=this.kn=this.Pj=this.n=0,this.ready=this.hh=!1,this.Wv=void 0!==this.a.Ir?this.a.Ir:this.a.Ee-this.a.Li,this.Xv=void 0!==this.a.Jr?this.a.Jr:Math.floor((lc.height-of.height)/2),this.Un=of.width-(this.a.Li+this.a.Hr),this.jn=this.Yr=this.Tp=!1,(this.cj=ia.complete("start"))&&Og(this),this.Gr=ia.complete("load"),this.visible&&(this.mt=document.getElementById("throbber_image"),
this.ke=this.a.ke,this.ap=N.b.g(this.a.ap,this.canvas.width,this.ke),this.fm=N.b.g(this.a.fm,this.canvas.height,this.ke))):I.pause()};
d.ua=function(a){this.n+=a;"function"===typeof N.l.Dn&&void 0===this.he&&(this.he=N.l.Dn(),this.he instanceof x&&(this.hh=!0,this.Fs=Math.floor((this.canvas.width-this.he.width)/2),this.Gs=Math.floor((this.canvas.height-this.he.height)/2)));this.hh&&0<=this.a.Hs&&this.n>=this.a.Hs&&(this.hh=!1);this.Jm&&(this.Tj+=a,this.Tj>=this.Sj?(this.Jm=!1,this.ci=1):this.ci=ac(this.Tj,0,1,this.Sj));this.cj&&(this.Pj+=a,this.kn+=a);this.lt=Math.round(this.n/this.a.Wy%(this.a.Xy-1));this.Xn&&(this.dl=0+this.Ni/
this.a.Wn*1,this.Ni+=a,this.Ni>=this.a.Wn&&(this.Xn=!1,this.dl=1));"function"===typeof this.gq&&this.gq(Math.round((ja("load")+ja("audio")+ja("audio_music"))/2));!this.ready&&this.Gr&&(this.jn||this.kn>=this.a.fl)&&(!N.d.bl||this.Tp||H.Qa&&this.Pj>=this.a.fl)&&(!N.d.al||this.Yr||H.Qa&&this.Pj>=this.a.fl)&&(this.ready=!0);if(a=!this.tq&&!this.error&&this.ready&&this.n>=this.Ot)a=N.d,a=(a.lc&&a.ab&&!a.ab.Mv()?!1:!0)||this.n>=this.jw;a&&(this.tq=!0,this.pb())};
d.Jg=function(a,b,c){!this.hh&&this.Cf&&Tb(this.Cf,this.Bb,this.tc,b,c)&&(this.jb=Math.floor((b-this.Bb)/(this.oa.width/this.ya.length)))};d.Kg=function(a,b,c){void 0!==this.jb&&(this.ya[this.jb].url||this.ya[this.jb].action)&&Tb(this.Cf,this.Bb,this.tc,b,c)&&(b-=this.Bb,b>=this.oa.width/this.ya.length*this.jb&&b<this.oa.width/this.ya.length*(this.jb+1)&&(this.ya[this.jb].url?N.l.jd(this.ya[this.jb].url):this.ya[this.jb].action()));this.jb=void 0};
d.gd=function(a,b){"Load Complete"===a&&"start"===b.Ya?(this.cj=!0,Og(this)):"Load Complete"===a&&"load"===b.Ya?this.Gr=!0:"Load Complete"===a&&"audio"===b.Ya?this.Tp=!0:"Load Complete"===a&&"audio_music"===b.Ya?this.Yr=!0:"Load Complete"===a&&"fonts"===b.Ya&&(this.jn=!0);a===N.Je&&this.ee()};
d.Ua=function(){if(!this.error){this.yo&&this.cj?this.Ga():p.clear();try{this.mt&&p.context.drawImage(this.mt,this.ke*this.lt,0,this.ke,this.ke,this.ap,this.fm,this.ke,this.ke)}catch(a){}if(this.cj){var b=0,c=this.Pg+this.Wv,e=this.Bf+this.Xv,g=of.height;of.ma(0,b,0,this.a.Li,g,c,e,1);b+=this.a.Li;c+=this.a.Li;this.ready?(of.pk(0,b,0,this.Un,g,c,e,this.a.Og,g,1),b+=this.Un,c+=this.a.Og,of.ma(0,b,0,this.a.Hr,g,c,e,1)):of.pk(0,b,0,this.Un,g,c,e,Math.floor(Math.min((ja("load")+ja("audio"))/500+this.Zv*
Math.log(this.n+1),1)*this.a.Og),g,1);this.oa&&this.oa.bd(this.Bb,this.tc,this.dl)}this.hh&&this.he.p(this.Fs,this.Gs)}};
function Qg(){var a,b;b=this;this.depth=100;this.k=this.visible=!0;N.b.bb(this,N.sb);this.a=N.a.D.Tl;if("landscape"===N.orientation&&N.a.D.Vo)for(a in N.a.D.Vo)this.a[a]=N.a.D.Vo[a];this.Ob=N.a.D.Ob;if("landscape"===N.orientation&&N.a.D.Om)for(a in N.a.D.Om)this.Ob[a]=N.a.D.Om[a];for(a in N.a.R.Tl)this.a[a]=N.a.R.Tl[a];this.ug=[];a=Rg(N.d);this.hq=void 0!==a&&null!==a;this.Y=new Ub;this.Y.ta(this.a.fv,function(){b.Ps.call(b)});this.Y.ta(this.a.cs,function(){b.Rs.call(b)});this.Y.ta(N.j.Yi&&!this.hq?
this.a.sx:this.a.cs,function(){b.Ss.call(b)});this.Y.ta(this.a.yw,function(){b.Qs.call(b)});J(this,!1)}d=Qg.prototype;d.Ps=function(){this.Ck=!0;this.a.Ig&&(this.zi=N.b.g(this.a.zi,this.canvas.width,Td.width),this.Bk=N.b.g(this.a.Bk,this.canvas.width,Td.width),this.Ai=N.b.g(this.a.Ai,this.canvas.height,Td.height),this.yi=N.b.g(this.a.yi,this.canvas.height,Td.height),this.wn=this.zi,this.Dk=this.Ai,this.rn=this.a.un,this.sn=this.a.vn,this.qn=this.a.tn,this.oc=0,this.ee())};
d.Rs=function(a){function b(a,b,c,e){return dc(a,b,c,e,15)}var c,e;N.j.Yi&&!this.hq&&(c=N.b.g(this.a.rq,this.canvas.width,this.a.oi,Math.floor(this.a.oi/2)),e=N.b.g(this.a.nk,this.canvas.height,ud.height,Math.floor(ud.height/2)),c=new Sg("difficulty_toggle",c,e,this.depth-20,Tg()+"",this.a.oi,{S:function(a){Ug(parseInt(a,10));return!0},Ub:!0}),c.fc=Math.floor(this.a.oi/2),c.gc=Math.floor(ud.height/2),!1!==a&&(Vg(c,"xScale",b,0,1,this.a.qq),Vg(c,"yScale",b,0,1,this.a.qq)),this.mk=c,this.nk=c.y,this.ug.push(c),
this.ee())};
d.Ss=function(a){function b(a,b,c,e){return dc(a,b,c,e,15)}var c,e=this;this.to=!0;c=new Wg("bigPlay",N.b.g(this.a.rx,this.canvas.width,this.a.Si,Math.floor(this.a.Si/2)),N.b.g(this.a.yl,this.canvas.height,Ad.height,Math.floor(Ad.height/2)),this.depth-20,"startScreenPlay",this.a.Si,{S:function(){I.q(e);var a=N.d,b,c,l;void 0===N.d.Xb&&(void 0!==N.a.R.Xb&&(void 0!==N.a.R.Xb.tu&&(b=N.a.R.Xb.tu),void 0!==N.a.R.Xb.Km&&(H.Dd("music",N.a.R.Xb.Km),a.Kf()||ib("music"),N.d.Qw=N.a.R.Xb.Km),c=void 0!==N.a.R.Xb.pu?
N.a.R.Xb.pu:0,l=void 0!==N.a.R.Xb.Sj?N.a.R.Xb.Sj:0),void 0===b&&"undefined"!==typeof Uf&&(b=Uf),void 0!==b&&(N.d.Xb=H.play(b,c,l),N.d.Xb&&(H.Op(N.d.Xb,"music"),H.Bs(N.d.Xb,!0))));N.j.Rf&&!a.lc?a.screen=new Xg:Yg(a,0);return!0},Ub:!0});c.fc=Math.floor(this.a.Si/2);c.gc=Math.floor(Ad.height/2);!1!==a?(Vg(c,"xScale",b,0,1,this.a.wl),Vg(c,"yScale",b,0,1,this.a.wl),this.xl=0):this.xl=this.a.wl;this.vl=c;this.yl=c.y;this.ug.push(c);this.ee()};
function Zg(a){var b=gc([M,function(a,b,g,h){return dc(a,b,g,h,2)},Xb],[!0,!1,!1],[.02,.1,.88]);a.ks=!0;Vg(a.vl,"xScale",fc(b),1,.25,4E3);Vg(a.vl,"yScale",fc(b),1,-.1,4E3)}d.Qs=function(a){var b;this.Tr=!0;b=new Bg(N.b.g(this.a.eo,this.canvas.width,rd.width),N.b.g(this.a.il,this.canvas.height,rd.height),this.depth-20,new Sb(rd),[rd],{S:N.d.ge,Ub:!0});!1!==a&&Vg(b,"alpha",L,0,1,this.a.xw);this.co=b;this.il=b.y;this.ug.push(b);this.ee()};
d.Ga=function(){var a,b,c,e;if(a=this.a.backgroundImage)N.b.mb(N.of),c=Math.abs(N.ra),1<a.H?(b=(p.canvas.height-c)/a.Ag,e=-(a.ii*b-p.canvas.width)/2,ta(a,e,c)):(b=(p.canvas.height-c)/a.height,e=-Math.floor((a.width*b-this.canvas.width)/2),a.Da(0,e,c,b,b,0,1))};
d.Sm=function(){var a,b,c,e,g,h;if("function"===typeof N.l.Di&&(h=this.a.Df,(this.ya=N.l.Di())&&0<this.ya.length)){this.oa?this.oa.clear():this.oa=new x(this.a.Df,this.a.Oi);y(this.oa);h/=this.ya.length;for(c in this.ya)try{g=this.ya[c].f,e=Math.min(1,Math.min((h-20)/g.width,this.a.Oi/g.height)),a="center"===this.a.Mi?h*c+Math.round((h-g.width*e)/2):h*c+Math.round(h-g.width*e)-10,b=this.oa.height-g.height*e,g instanceof r?g.Da(0,a,b,e,e,0,1):p.context.drawImage(g,a,b,g.width*e,g.height*e)}catch(k){}z(this.oa);
this.dl=0;this.Xn=!0;this.Ni=0;this.Cf=Rb(0,0,this.oa.width,this.oa.height);this.ee()}};d.ee=function(){var a;a=0;N.$.height<this.a.Mm&&(a=this.a.Mm-N.$.height);this.to&&(this.vl.y=this.yl-a);this.Tr&&(this.co.y=this.il-a,this.co.x=N.b.g(this.a.eo,N.$.width,rd.width)+N.$.left);this.mk&&(this.mk.y=this.nk-a);this.Ck&&this.oc>=this.a.fd&&(this.Dk=this.yi-N.ra);this.oa&&(this.Bb=N.b.g(this.a.Bb,N.$.width,this.oa.width)+N.$.left,this.tc=N.b.g(this.a.tc,N.$.height,this.oa.height)+N.$.top)};
d.Sb=function(){this.Ga();this.a.Ig&&(N.b.mb(N.sb),this.a.Ig.p(0,0,-this.a.Ig.height-10));this.Sm();this.Y.start()};d.zb=function(){var a;for(a=0;a<this.ug.length;a++)I.q(this.ug[a])};
d.ua=function(a){this.canvas.Z=!0;this.Ck&&this.oc<this.a.fd&&(this.wn=this.a.jv(this.oc,this.zi,this.Bk-this.zi,this.a.fd),this.Dk=this.a.kv(this.oc,this.Ai,this.yi-this.Ai,this.a.fd)-N.ra,this.rn=this.a.hv(this.oc,this.a.un,this.a.Oq-this.a.un,this.a.fd),this.sn=this.a.iv(this.oc,this.a.vn,this.a.Pq-this.a.vn,this.a.fd),this.qn=this.a.gv(this.oc,this.a.tn,this.a.Nq-this.a.tn,this.a.fd),this.oc+=a,this.oc>=this.a.fd&&(this.wn=this.Bk,this.Dk=this.yi-N.ra,this.rn=this.a.Oq,this.sn=this.a.Pq,this.qn=
this.a.Nq));this.to&&(!this.ks&&this.xl>=this.a.wl+this.a.qx&&Zg(this),this.xl+=a)};d.Jg=function(a,b,c){this.Cf&&Tb(this.Cf,this.Bb,this.tc,b,c)&&(this.jb=Math.floor((b-this.Bb)/(this.oa.width/this.ya.length)))};
d.Kg=function(a,b,c){void 0!==this.jb&&(this.ya[this.jb].url||this.ya[this.jb].action)&&Tb(this.Cf,this.Bb,this.tc,b,c)&&(b-=this.Bb,b>=this.oa.width/this.ya.length*this.jb&&b<this.oa.width/this.ya.length*(this.jb+1)&&(this.ya[this.jb].url?N.l.jd(this.ya[this.jb].url):this.ya[this.jb].action()));this.jb=void 0};d.Ab=function(){this.qb=!0};
d.Tb=function(){this.qb&&(this.Y.stop(),this.Ck?this.oc<this.a.fd&&(this.oc=this.a.fd-1):(this.Ps(),this.oc=this.a.fd-1),this.mk?$g(this.mk):this.Rs(!1),this.Tr?$g(this.co):this.Qs(!1),this.to?($g(this.vl),this.ks&&Zg(this)):this.Ss(!1),this.qb=!1)};d.gd=function(a){a===N.Je&&(this.Ga(),this.ee())};d.Ua=function(){this.Ck&&this.a.Ig&&this.a.Ig.Da(0,this.wn,this.Dk,this.rn,this.sn,0,this.qn);this.oa&&this.oa.p(this.Bb,this.tc);this.Rb=!1};
function Xg(){this.depth=100;this.k=this.visible=!0;N.b.bb(this,N.sb);var a;this.a=N.a.D.xf;if("landscape"===N.orientation)for(a in N.a.D.xr)this.a[a]=N.a.D.xr[a];this.xa=N.a.o.FA;if(N.a.o.xf)for(a in N.a.o.xf)this.a[a]=N.a.o.xf[a];this.cc=N.a.D.Ob;for(var b in N.a.R.xf)this.a[b]=N.a.R.xf[b];this.zf=-1;this.Ka=0;this.Af=[];J(this)}d=Xg.prototype;
d.Ga=function(){var a,b,c,e;N.b.mb(N.of);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(N.ra),1<a.H?(b=(p.canvas.height-c)/a.Ag,e=-(a.ii*b-p.canvas.width)/2,ta(a,e,c)):(b=(p.canvas.height-c)/a.height,e=-Math.floor((a.width*b-this.canvas.width)/2),a.Da(0,e,c,b,b,0,1));var g;b=N.a.D.na.type[N.j.Ad].Rc;N.a.o.na&&N.a.o.na.type&&N.a.o.na.type[N.j.Ad]&&N.a.o.na.type[N.j.Ad]&&(b=!1===N.a.o.na.type[N.j.Ad].Rc?!1:b);void 0!==this.xa&&void 0!==this.xa.Rc&&(b=this.xa.Rc);c=N.b.g(this.a.uy,
this.canvas.width,rc.width);a=N.b.g(this.a.Ms,N.$.height,rc.height)+N.$.top;b&&(rc.p(0,c,a),b=T.M(),C(b,this.a.Ls),F(b,"center"),b.p(this.N+" / "+this.cp,c+Math.floor(rc.width/2),a+rc.height+this.a.Ns));if(void 0!==this.xa&&void 0!==this.xa.ky?this.xa.ky:1)b=T.M(),void 0!==this.a.tx?C(b,this.a.tx):C(b,this.a.vo),c=N.i.r("levelMapScreenTotalScore","<TOTAL SCORE:>"),e=Na(b,c,this.a.vx,this.a.ux),e<b.fontSize&&D(b,e),e=N.b.fa(this.a.ls,this.canvas.width,b.da(c),b.align),g=N.b.fa(this.a.ms,N.$.height,
b.X(c),b.h)+N.$.top,b.p(c,e,g),c=""+this.Al,C(b,this.a.vo),e=N.b.fa(this.a.ls,this.canvas.width,b.da(c),b.align),b.p(c,e,a+rc.height+this.a.Ns)};
function ah(a){if("grid"===a.a.type){y(a.Ki);p.clear();a.yf=[];var b;b=function(b,e,g){var h,k,l,n,q,w,A,E,s,t,u,v,K,ea,U,Y,Ba,La,Id,Nb,Nd,Bb,cg;k=N.j.T[b];Id=a.Lb?a.a.qv:a.a.rv;Nb=a.a.En;Nd=Id;if(a.a.Hu)h=a.a.Hu[b];else{La=a.Lb?a.a.cx:a.a.dx;for(Bb=Math.floor(k/La);1<Math.abs(Bb-La);)La-=1,Bb=Math.floor(k/La);for(h=[];0<k;)h.push(Math.min(La,k)),k-=La}Bb=h.length;Ba=Math.round(((a.Lb?a.a.Dr:a.a.Er)-(Bb+1)*Id)/Bb);cg=a.a.Eu?a.a.Eu:!1;if(!cg){La=1;for(k=0;k<Bb;k++)La=Math.max(h[k],La);Y=Math.round((a.canvas.width-
2*Nb)/La)}for(k=n=0;k<Bb;k++){La=h[k];cg&&(Y=Math.round((a.canvas.width-2*Nb)/La));for(l=0;l<La;l++){s=a.a.vq;K=a.a.Su;u=N.j.Cg||"locked";v=0;q=bh(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(u=q.state),"object"===typeof q.stats&&null!==q.stats&&(v=q.stats.stars||0));ea="locked"===u;"function"===typeof N.o.Qq&&(w=N.o.Qq(ch(N.d,b,n),0,0,u))&&(K=ea=s=!1);q=Nb+e;E=Nd;U=t=1;if(!1!==K){A=a.Lb?mc:sc;if("played"===u)switch(v){case 1:A=a.Lb?nc:tc;break;case 2:A=a.Lb?oc:uc;break;case 3:A=
a.Lb?pc:vc}else a.Lb||"locked"!==u||(A=yc);A.width>Y&&(U=Y/A.width);A.height>Ba&&(U=Math.min(t,Ba/A.height));q+=Math.round((Y-A.width*U)/2);E+=Math.round((Ba-A.height*U)/2);A.Da(0,q,E,U,U,0,1);g&&(a.yf[n]={x:q,y:E})}w&&(w.width>Y&&(t=Y/w.width),w.height>Ba&&(t=Math.min(t,Ba/w.height)),void 0!==A?(v=N.b.g(a.a.vr,A.width*U,w.width*t),K=N.b.g(a.a.wr,A.height*U,w.height*t)):(v=N.b.g(a.a.vr,Y,w.width*t),K=N.b.g(a.a.wr,Ba,w.height*t),g&&(a.yf[n]={x:q+v,y:E+K})),w instanceof x?w.Da(q+v,E+K,t,t,0,1):w.Da(0,
q+v,E+K,t,t,0,1));!1===s||ea||(s=""+(N.j.qj?n+1:ch(N.d,b,n)+1),t=a.fonts.zn,"locked"===u&&void 0!==a.fonts.aw?t=a.fonts.aw:"unlocked"===u&&void 0!==a.fonts.jz?t=a.fonts.jz:"played"===u&&void 0!==a.fonts.played&&(t=a.fonts.played),void 0!==A?(v=N.b.fa(a.a.zr,A.width*U,t.da(s),t.align),K=N.b.fa(a.a.Ar,A.height*U,t.X(s),t.h)):(v=N.b.fa(a.a.zr,Y,t.da(s),t.align),K=N.b.fa(a.a.Ar,Ba,t.X(s),t.h)),t.p(s,q+v,E+K));a.Lb&&ea&&(void 0!==A?(v=N.b.g(a.a.Lr,A.width*U,qc.width),K=N.b.g(a.a.Mr,A.height*U,qc.height)):
(v=N.b.g(a.a.Lr,Y,qc.width),K=N.b.g(a.a.Mr,Ba,qc.height)),qc.p(0,q+v,E+K));Nb+=Y;n++}Nb=a.a.En;Nd+=Ba+Id}};a.Gi&&b(a.G-1,0);b(a.G,a.canvas.width,!0);a.Fi&&b(a.G+1,2*a.canvas.width);z(a.Ki)}}function dh(a,b){switch(b-a.G){case 0:a.ko=0;break;case 1:a.ko=-a.canvas.width;break;case -1:a.ko=a.canvas.width}a.Sg=!0;a.ml=0;a.moveStart=a.Ka;a.Xr=a.ko-a.Ka;a.ll=Math.min(a.a.Mw-a.nh,Math.round(Math.abs(a.Xr)/(a.am/1E3)));a.ll=Math.max(a.a.Lw,a.ll)}
function eh(a){if(1<N.j.T.length){var b,c;b=N.b.g(a.a.zz,a.canvas.width,xc.width);c=N.b.g(a.a.rp,N.$.height,xc.height)+N.$.top;a.He=new Bg(b,c,a.depth-20,new Sb(xc),[xc],function(){a.Id="previous";dh(a,a.G-1);return!0});b=N.b.g(a.a.yz,a.canvas.width,wc.width);c=N.b.g(a.a.qp,N.$.height,wc.height)+N.$.top;a.Ge=new Bg(b,c,a.depth-20,new Sb(wc),[wc],function(){a.Id="next";dh(a,a.G+1);return!0});fh(a)}else a.De-=a.a.Uq}
function fh(a){if(1<N.j.T.length){var b;a.Gi?(b=[xc],a.He.hb=!0):(b=[new x(xc.width,xc.height)],y(b[0]),xc.p(1,0,0),z(b[0]),a.He.hb=!1);gh(a.He,b);a.Fi?(b=[wc],a.Ge.hb=!0):(b=[new x(wc.width,wc.height)],y(b[0]),wc.p(1,0,0),z(b[0]),a.Ge.hb=!1);gh(a.Ge,b)}}
function hh(a){var b,c,e;y(a.fg);p.clear();b=T.M();a.a.Zb&&C(b,a.a.Zb);F(b,"center");G(b,"middle");c=N.i.r("levelMapScreenWorld_"+a.G,"<LEVELMAPSCREENWORLD_"+a.G+">");e=Na(b,c,a.a.rd-(b.stroke?b.Sc:0),a.a.le-(b.stroke?b.Sc:0),!1);e<b.fontSize&&D(b,e);b.p(c,a.fg.width/2,a.fg.height/2);z(a.fg);a.canvas.Z=!0}
d.Sb=function(){var a,b,c,e=this;this.Lb=this.a.Lb?!0:!1;if(!this.Lb){for(a=0;a<N.j.T.length;a++)if(9<N.j.T[a]){b=!0;break}b||(this.Lb=!0)}this.Ki=new x(3*this.canvas.width,this.Lb?this.a.Dr:this.a.Er);this.Br=-this.canvas.width;this.Cr=this.Lb?this.a.Tq:this.a.Vq;this.De=N.b.g(this.Cr,N.$.height,this.Ki.height)+N.$.top;this.fg=new x(this.a.rd,this.a.le);this.ez=N.b.g(this.a.Me,this.canvas.width,this.a.rd);this.ot=N.b.g(this.a.hc,N.$.height,this.fg.height)+N.$.top;this.yr="undefined"!==typeof s_level_mask?
s_level_mask:this.Lb?Sb(mc):Sb(sc);this.a.vq&&(this.fonts={},a=function(a){var b,c;for(b in a)c=T.M(),C(c,a[b]),e.fonts[b]=c},this.fonts={},this.fonts.zn=T,this.Lb?a(this.a.Pv):a(this.a.Qv));this.G=N.d.G;this.T=N.j.T[this.G];this.bm=!1;this.am=this.Zo=this.nh=0;this.$o=this.Br;this.Ka=0;this.Gi=0<this.G;this.Fi=this.G<N.j.T.length-1;for(b=this.cp=this.Al=this.N=0;b<N.j.T.length;b++)for(a=0;a<N.j.T[b];a++)c=ih(N.d,void 0,a,b),this.cp+=3,"object"===typeof c&&null!==c&&(this.N+=void 0!==c.stars?c.stars:
0,this.Al+=void 0!==c.highScore?c.highScore:0);N.o.pv&&(this.Al=N.o.pv());this.Ga();a=this.cc[this.a.fx];this.no=new Bg(N.b.g(this.a.gx,this.canvas.width,a.t.width),N.b.g(this.a.oo,N.$.height,a.t.height)+N.$.top,this.depth-20,new Sb(a.t),[a.t],{S:N.d.ge,ca:this});eh(this);ah(this);hh(this);this.Rb=!0};d.zb=function(){this.He&&I.q(this.He);this.Ge&&I.q(this.Ge);I.q(this.no)};
d.Ab=function(a,b,c){if(!this.Sg)for(a=0;a<this.yf.length;a++)if(Tb(this.yr,this.yf[a].x-this.canvas.width,this.yf[a].y+this.De,b,c)){this.zf=a;break}this.Sg=!1;1<N.j.T.length&&(this.bm=!0,this.nh=0,this.dt=this.$o=b,this.am=this.Zo=0)};
d.Tb=function(a,b,c){if(!this.Sg&&-1!==this.zf&&Tb(this.yr,this.yf[this.zf].x-this.canvas.width,this.yf[this.zf].y+this.De,b,c)&&(a=N.j.Cg||"locked",b=bh(this.G,this.zf,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return I.q(this),Yg(N.d,this.zf,this.G),!0;this.zf=-1;this.bm=!1;1<N.j.T.length&&(Math.abs(this.Ka)>=this.a.Ry&&(this.am>=this.a.Sy||Math.abs(this.Ka)>=this.a.Qy)?"previous"===this.Id?this.Gi&&0<=this.Ka&&this.Ka<=this.canvas.width/2?dh(this,
this.G-1):(0>this.Ka||(this.Id="next"),dh(this,this.G)):"next"===this.Id&&(this.Fi&&0>=this.Ka&&this.Ka>=-this.canvas.width/2?dh(this,this.G+1):(0<this.Ka||(this.Id="previous"),dh(this,this.G))):0<Math.abs(this.Ka)&&(this.Id="next"===this.Id?"previous":"next",dh(this,this.G)));return!0};
d.gd=function(a){if(a===N.wf||a===N.Je)this.canvas.Z=!0,this.Ga(),a===N.Je?(this.ot=N.b.g(this.a.hc,N.$.height,this.fg.height)+N.$.top,this.De=N.b.g(this.Cr,N.$.height,this.Ki.height)+N.$.top,this.no.y=N.b.g(this.a.oo,N.$.height,this.no.images[0].height)+N.$.top,this.He&&(this.He.y=N.b.g(this.a.rp,N.$.height,xc.height)+N.$.top),this.Ge&&(this.Ge.y=N.b.g(this.a.qp,N.$.height,wc.height)+N.$.top),void 0===this.Ge&&void 0===this.He&&(this.De-=this.a.Uq)):(hh(this),ah(this))};
d.pc=function(a){var b=I.ja[0].x;this.bm&&(this.Zo=Math.abs(this.$o-b),0<this.nh&&(this.am=this.Zo/(this.nh/1E3)),this.Id=b>this.$o?"previous":"next",this.nh+=a,this.Ka+=b-this.dt,this.dt=b,this.canvas.Z=!0);this.Sg&&(this.Ka=$b(this.ml,this.moveStart,this.Xr,this.ll),this.ml>=this.ll&&(this.Sg=!1,this.Ka=0),this.ml+=a,this.canvas.Z=!0);if(this.Sg||this.bm)"previous"===this.Id&&this.Ka>=this.canvas.width/2?0<=this.G-1?(this.G-=1,this.T=N.j.T[this.G],this.Gi=0<this.G,this.Fi=this.G<N.j.T.length-1,
fh(this),this.Ka-=this.canvas.width,hh(this),ah(this),this.canvas.Z=!0,this.moveStart-=this.canvas.width):this.Ka=Math.round(this.canvas.width/2):"next"===this.Id&&this.Ka<=-this.canvas.width/2&&(this.G+1<N.j.T.length?(this.G+=1,this.T=N.j.T[this.G],this.Gi=0<this.G,this.Fi=this.G<N.j.T.length-1,fh(this),this.Ka+=this.canvas.width,hh(this),ah(this),this.canvas.Z=!0,this.moveStart+=this.canvas.width):this.Ka=Math.round(-this.canvas.width/2))};
d.Ua=function(){this.fg.p(this.ez,this.ot);this.Ki.p(Math.round(this.Br+this.Ka),this.De);this.Rb=!1};
function jh(a,b,c,e){this.depth=10;this.k=this.visible=!0;N.b.bb(this,N.sb);var g;this.type=b.failed?"failed":a;this.a=N.a.D.na;this.xa=this.a.type[this.type];if("landscape"===N.orientation)for(g in N.a.D.ur)this.a[g]=N.a.D.ur[g];for(g in N.a.R.na)this.a[g]=N.a.R.na[g];if(N.a.R.na&&N.a.R.na.type&&N.a.R.na.type[this.type])for(g in N.a.R.na.type[this.type])this.a[g]=N.a.R.na.type[this.type][g];if("failed"===this.type){if(void 0!==N.a.o.na&&N.a.o.na.type&&void 0!==N.a.o.na.type.failed)for(g in N.a.o.na.type[this.type])this.xa[g]=
N.a.o.na.type[this.type][g]}else{if(void 0!==N.a.o.na&&void 0!==N.a.o.na.type)for(g in N.a.o.na.type[this.type])this.xa[g]=N.a.o.na.type[this.type][g];for(g in N.a.o.na)this.xa[g]=N.a.o.na[g]}this.sa=b;this.S=c;this.ca=e;this.py=[eg,fg,gg];this.af=[];this.Y=new Ub;this.Y.parent=this;J(this,!1)}
function kh(a){var b;for(b=0;b<a.N.length;b++)lh(a.N[b]);for(b=0;b<a.Tf.length;b++)I.q(a.Tf[b]);a.Tf=[];a.Ja&&lh(a.Ja);a.Ja=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].hb=!1;a.Y.stop();a.Y=void 0;mh(a)}
function nh(a,b){var c;switch(b){case "title_level":c=N.i.r("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.sa.level);break;case "title_endless":c=N.i.r("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.sa.stage);break;case "title_difficulty":c=N.i.r("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.mc(a.a.Zb,c,a.a.Me,a.a.hc,a.a.rd,a.a.le)}
function oh(a,b){var c;switch(b){case "subtitle_failed":c=N.i.r("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.mc(a.a.Ys,c,a.a.Ky,a.a.Ly)}
function ph(a,b,c){var e,g,h,k,l;g=N.i.r(b.key,"<"+b.key.toUpperCase()+">");e=b.te?b.toString(b.Uf):b.toString(b.nc);h=a.a.dj;h.align="left";h.h="top";l=T.M();C(l,h);c?(G(l,"bottom"),h=a.a.Vf,h.align="left",h.h="bottom",c=T.M(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Zl),void 0!==e&&(h+=c.da(e)),h=N.b.g(a.a.Ke,a.canvas.width,h)-a.c.x,void 0!==g&&(l.p(g,h,a.od+l.fontSize),h+=l.da(g)+a.a.Zl,k+=l.X(g)),void 0!==e&&(b.te?(e=c.X(e),l=a.od+l.fontSize-e,b.mi=new qh(h,l,a.a.kh,e,a.depth-100,b.Uf,c,a.a.ih,
a.a.jh,a.c,b.toString),k=Math.max(k,e)):(c.p(e,h,a.od+l.fontSize+a.a.Ts),k=Math.max(k,c.X(e)))),0<k&&(a.od+=k+a.a.nd)):(void 0!==g&&(a.mc(h,g,a.a.Ke,a.a.Wf),k=a.a.Wf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.nd:a.a.nd,k.offset+=l.X(g)):"number"===typeof k&&(k+=a.a.nd+l.X(g))),void 0!==e&&(h=a.a.Vf,h.h="top",b.te?(c=T.M(),h.align="center",C(c,h),g=N.b.g(a.a.Ke,a.canvas.width,a.a.kh)-a.c.x,l=k-a.c.y,b.mi=new qh(g,l,a.a.kh,c.X(e),a.depth-100,b.Uf,c,a.a.ih,a.a.jh,a.c,b.toString)):a.mc(h,
e,a.a.Ke,k)))}
function rh(a,b,c){var e,g,h,k,l,n;switch(b){case "totalScore":e=""+a.sa.totalScore;g=N.i.r("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=N.i.r("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");e=""+a.sa.highScore;break;case "timeLeft":g=N.i.r("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");e=""+a.sa.timeLeft;break;case "timeBonus":g=N.i.r("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),e=""+a.sa.timeBonus,n=a.sa.timeBonus}h=a.a.dj;h.align=
"left";h.h="top";l=T.M();C(l,h);c?(G(l,"bottom"),h=a.a.Vf,h.align="left",h.h="bottom",c=T.M(),C(c,h),h=k=0,void 0!==g&&(h+=l.da(g)+a.a.Zl),void 0!==e&&(h+=c.da(e)),h=N.b.g(a.a.Ke,a.canvas.width,h)-a.c.x,void 0!==g&&(l.p(g,h,a.od+l.fontSize),h+=l.da(g)+a.a.Zl,k+=l.X(g)),void 0!==e&&(void 0!==n?(e=c.X(e),l=a.od+l.fontSize-e,n=new qh(h,l,a.a.kh,e,a.depth-100,n,c,a.a.ih,a.a.jh,a.c),k=Math.max(k,e)):(c.p(e,h,a.od+l.fontSize+a.a.Ts),k=Math.max(k,c.X(e)))),0<k&&(a.od+=k+a.a.nd)):(void 0!==g&&(a.mc(h,g,a.a.Ke,
a.a.Wf),k=a.a.Wf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.nd:a.a.nd,k.offset+=l.X(g)):"number"===typeof k&&(k+=a.a.nd+l.X(g))),void 0!==e&&(h=a.a.Vf,h.h="top",void 0!==n?(c=T.M(),h.align="center",C(c,h),g=N.b.g(a.a.Ke,a.canvas.width,a.a.kh)-a.c.x,l=k-a.c.y,n=new qh(g,l,a.a.kh,c.X(e),a.depth-100,n,c,a.a.ih,a.a.jh,a.c)):a.mc(h,e,a.a.Ke,k)));n instanceof qh&&("totalScore"===b?a.hg=n:a.af.push(n))}
function sh(a,b){var c,e,g;c=N.i.r(b.key,"<"+b.key.toUpperCase()+">");e=b.te?b.toString(b.Uf):b.toString(b.nc);void 0!==c&&a.mc(a.a.$m,c,a.a.Bq,a.a.an);void 0!==e&&(b.te?(c=T.M(),e=a.a.pi,a.a.eA||(e.align="center"),C(c,e),e=N.b.g(a.a.vk,a.canvas.width,a.a.uk)-a.c.x,g=N.b.g(a.a.Fg,a.canvas.height,a.a.tk)-a.c.y,b.mi=new qh(e,g,a.a.uk,a.a.tk,a.depth-100,b.Uf,c,a.a.ih,a.a.jh,a.c,b.toString)):a.mc(a.a.pi,e,a.a.vk,a.a.Fg))}
function th(a,b){var c,e,g,h;switch(b){case "totalScore":c=N.i.r("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");e=""+a.sa.totalScore;g=0;break;case "timeLeft":c=N.i.r("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),e=""+a.sa.timeLeft}void 0!==c&&a.mc(a.a.$m,c,a.a.Bq,a.a.an);void 0!==e&&(void 0!==g?(c=T.M(),e=a.a.pi,e.align="center",C(c,e),e=N.b.g(a.a.vk,a.canvas.width,a.a.uk)-a.c.x,h=N.b.g(a.a.Fg,a.canvas.height,a.a.tk)-a.c.y,g=new qh(e,h,a.a.uk,a.a.tk,a.depth-100,g,c,a.a.ih,a.a.jh,
a.c)):a.mc(a.a.pi,e,a.a.vk,a.a.Fg));g instanceof qh&&("totalScore"===b?a.hg=g:a.af.push(g))}d=jh.prototype;d.mc=function(a,b,c,e,g,h){var k=T.M();C(k,a);void 0!==g&&void 0!==h&&(a=Na(k,b,g,h,g),k.fontSize>a&&D(k,a));a=k.da(b);h=k.X(b);k.p(b,N.b.fa(c,this.canvas.width,a,k.align)-this.c.x,N.b.fa(e,this.canvas.height,h,k.h)-this.c.y,g)};
function uh(a,b){var c,e,g,h;switch(b){case "retry":c=sd;e=function(){a.we="retry";kh(a)};break;case "exit":c=pd,e=function(){a.we="exit";kh(a)}}void 0!==c&&(g=N.b.g(a.a.ou,a.canvas.width,c.width)-a.c.x,h=N.b.g(a.a.Vp,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Bg(g,h,a.depth-20,new Sb(c),[c],e,a.c)))}
function vh(a,b){var c,e,g,h;switch(b){case "retry":c=Bd;e=function(){a.we="retry";kh(a)};break;case "exit":c=zd;e=function(){a.we="exit";kh(a)};break;case "next":c=zd,e=function(){a.we="next";kh(a)}}void 0!==c&&(g=N.b.g(a.a.ev,a.canvas.width,c.width)-a.c.x,h=N.b.g(a.a.Lq,a.canvas.height,c.height)-a.c.y,a.buttons.push(new Bg(g,h,a.depth-20,new Sb(c),[c],e,a.c)))}
d.Sb=function(){this.n=0;this.N=[];this.Tf=[];this.buttons=[];this.canvas.Z=!0;this.we="";this.Lc=this.sa.failed?!0:!1;this.Rc=this.xa.Rc&&!this.Lc;this.fh=this.xa.fh&&!this.Lc&&this.sa.fr;this.Fm=this.alpha=this.sg=0;wh(this);var a,b,c,e,g,h,k=this;switch(this.xa.Uj){case "failed":this.f=this.a.rl.Ov;break;case "level":this.f=this.a.rl.Sv;break;case "difficulty":this.f=this.a.rl.K;break;case "endless":this.f=this.a.rl.Zu}this.c=new xh(this.depth-10,this.Ia,new x(this.f.width,this.f.height));this.c.x=
N.b.g(this.a.Yb,this.canvas.width,this.f.width);this.c.y=N.b.g(this.a.ub,this.canvas.height,this.f.height);y(this.c.f);this.f.p(0,0,0);!this.Lc&&this.Rc&&(b=N.b.g(this.a.Po,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.Qo,this.canvas.height,s_star01_fill.height)-this.c.y+Math.round(s_star01_empty.height/2),s_star01_empty.p(0,b,a),b=N.b.g(this.a.Ro,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.So,this.canvas.height,s_star02_fill.height)-this.c.y+Math.round(s_star02_empty.height/2),s_star02_empty.p(0,
b,a),b=N.b.g(this.a.To,this.canvas.width,0)-this.c.x,a=N.b.g(this.a.Uo,this.canvas.height,s_star03_fill.height)-this.c.y+Math.round(s_star03_empty.height/2),s_star03_empty.p(0,b,a));void 0!==this.xa.jj&&nh(this,this.xa.jj);void 0!==this.xa.Zs&&oh(this,this.xa.Zs);this.vb={};void 0!==this.sa.yd?(c=this.sa.yd,c.visible&&sh(this,c),this.vb[c.id]=c):void 0!==this.xa.bn&&th(this,this.xa.bn);if(void 0!==this.sa.vb)for(a=this.sa.vb.length,b=T.M(),C(b,this.a.dj),c=T.M(),C(c,this.a.Vf),b=Math.max(b.X("g"),
c.X("g"))*a+this.a.nd*(a-1),this.od=N.b.g(this.a.Wf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)c=this.sa.vb[b],c.visible&&ph(this,this.sa.vb[b],1<a),this.vb[c.id]=c;else if(void 0!==this.xa.Le)if("string"===typeof this.xa.Le)rh(this,this.xa.Le,this.a.Kq);else if(this.xa.Le instanceof Array)for(a=this.xa.Le.length,b=T.M(),C(b,this.a.dj),c=T.M(),C(c,this.a.Vf),b=Math.max(b.X("g"),c.X("g"))*a+this.a.nd*(a-1),this.od=N.b.g(this.a.Wf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)rh(this,this.xa.Le[b],1<a||
this.a.Kq);z(this.c.f);uh(this,this.xa.Rj);vh(this,this.xa.xk);N.d.Dt&&(b=N.b.g(k.a.Dv,k.canvas.width,k.a.ar)-this.c.x,a=N.b.g(this.a.Ev,this.canvas.height,this.a.ef)-this.c.y,this.$q=new Wg("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.ar,{S:function(){void 0!==yh?N.l.jd(N.B.Nk.url+"submit/"+yh+"/"+k.sa.totalScore):N.l.jd(N.B.Nk.url+"submit/")},Ub:!0},k.c),this.buttons.push(this.$q),b=function(a){a&&(k.$q.pj("levelEndScreenSubmitHighscoreBtn"),k.CA=a)},zh(this.sa.totalScore,
b));b=N.b.g(this.a.gi,this.canvas.width,this.a.yg)-this.c.x;a=N.b.g(this.a.zg,this.canvas.height,this.a.ef)-this.c.y;this.buttons.push(new Bg(b,a,this.depth-20,new Rb(0,0,this.a.yg,this.a.ef),void 0,function(){k.we="exit";kh(k)},this.c));for(b=0;b<this.buttons.length;b++)this.buttons[b].hb=!1;this.c.y=-this.c.height;a=this.a.Vy;this.Y.ta(a,this.zy);a+=this.a.se;g=0;e=this.a.gz;this.Rc&&(e=Math.max(e,this.a.Js+this.a.Is*this.sa.stars));if(this.hg&&(this.Y.ta(a+this.a.im,function(a,b){Ah(b.parent.hg,
b.parent.sa.totalScore,e)}),g=a+this.a.im+e,0<this.af.length)){h=function(a,b){var c=b.parent,e=c.af[c.sg];Ah(c.hg,c.hg.value+e.value,c.a.rg);Ah(e,0,c.a.rg);c.sg+=1};for(b=0;b<this.af.length;b++)g+=this.a.bq,this.Y.ta(g,h);g+=this.a.rg}if(void 0!==this.vb&&(g=a,h=function(a,b){var c=b.parent,e=c.Wo[c.sg||0],g=c.vb[e.Yl];void 0!==e.Oe&&(g.visible&&g.te?Ah(g.mi,e.Oe(g.mi.value),c.a.rg):g.nc=e.Oe(g.nc));e.visible&&e.te&&Ah(e.mi,e.nc,c.a.rg);c.sg+=1},this.Wo=[],void 0!==this.sa.yd&&void 0!==this.sa.yd.Oe&&
(this.Y.ta(a+this.a.im,h),this.Wo.push(this.sa.yd),g+=this.a.im+bonusCounterDuration),void 0!==this.sa.vb))for(b=0;b<this.sa.vb.length;b++)c=this.sa.vb[b],void 0!==c.Oe&&(g+=this.a.bq,this.Y.ta(g,h),this.Wo.push(c),g+=this.a.rg);if(this.Rc){for(b=0;b<this.sa.stars;b++)a+=this.a.Is,this.Y.ta(a,this.Dy),this.Y.ta(a,this.Ey);a+=this.a.Js}a=Math.max(a,g);this.fh&&(a+=this.a.nw,this.Y.ta(a,this.yy),this.Y.ta(a,this.wy),this.Y.ta(a+this.a.ow,this.xy));a+=500;this.Y.ta(a,function(){N.l.Kv&&N.l.Kv()});this.Y.ta(a+
this.a.Jw,N.l.hr);N.l.ir(this.sa);this.Y.start();this.uo(this.Lc)};d.uo=function(a){a?H.play(hg):H.play(bg)};d.ua=function(a){this.alpha=this.a.qi*this.Fm/this.a.rb;this.Fm+=a;this.alpha>=this.a.qi&&(this.alpha=this.a.qi,this.k=!1);this.canvas.Z=!0};
d.zy=function(a,b){function c(){var a;for(a=0;a<e.buttons.length;a++)e.buttons[a].hb=!0}var e=b.parent,g,h;switch(e.a.Dz){case "fromLeft":h="horizontal";g=N.b.g(e.a.Yb,e.canvas.width,e.c.width);e.c.x=-e.c.width;e.c.y=N.b.g(e.a.ub,e.canvas.height,e.c.height)+Math.abs(N.ra);break;case "fromRight":h="horizontal";g=N.b.g(e.a.Yb,e.canvas.width,e.c.width);e.c.x=e.canvas.width;e.c.y=N.b.g(this.parent.a.ub,e.canvas.height,selft.c.height)+Math.abs(N.ra);break;case "fromBottom":h="vertical";g=N.b.g(e.a.ub,
e.canvas.height,e.c.height)+Math.abs(N.ra);e.c.x=N.b.g(e.a.Yb,e.canvas.width,e.c.width);e.c.y=e.canvas.height+e.c.height;break;default:h="vertical",g=N.b.g(e.a.ub,e.canvas.height,e.c.height)+Math.abs(N.ra),e.c.x=N.b.g(e.a.Yb,e.canvas.width,e.c.width),e.c.y=-e.c.height}"vertical"===h?Z(e.c,"y",g,e.a.se,e.a.Mj,c):Z(e.c,"x",g,e.a.se,e.a.Mj,c)};
function mh(a){function b(){I.q(a);a.ca?a.S.call(a.ca,a.we):a.S(a.we)}var c,e;switch(a.a.Ez){case "toLeft":e="horizontal";c=-a.c.width;break;case "toRight":e="horizontal";c=a.canvas.width;break;case "toBottom":e="vertical";c=a.canvas.height+a.c.height;break;default:e="vertical",c=-a.c.height}"vertical"===e?Z(a.c,"y",c,a.a.Nj,a.a.Oj,b):Z(a.c,"x",c,a.a.Nj,a.a.Oj,b)}
d.Dy=function(a,b){var c,e=b.parent,g=Math.abs(N.ra);if(e.N.length<e.sa.stars){switch(e.N.length+1){case 1:c=new xh(e.depth-30,N.Yd,s_star01_fill);c.x=N.b.g(e.a.Po,e.canvas.width,0);c.y=N.b.g(e.a.Qo,e.canvas.height,s_star01_fill.height)+g+Math.round(s_star01_empty.height/2);break;case 2:c=new xh(e.depth-30,N.Yd,s_star02_fill);c.x=N.b.g(e.a.Ro,e.canvas.width,0);c.y=N.b.g(e.a.So,e.canvas.height,s_star02_fill.height)+g+Math.round(s_star02_empty.height/2);break;case 3:c=new xh(e.depth-30,N.Yd,s_star03_fill),
c.x=N.b.g(e.a.To,e.canvas.width,0),c.y=N.b.g(e.a.Uo,e.canvas.height,s_star03_fill.height)+g+Math.round(s_star03_empty.height/2)}c.wa=e.a.Ks;c.La=e.a.Ks;c.alpha=e.a.ty;Z(c,"scale",1,e.a.sy,M,function(){var a=e.N.length,b,c,n;y(e.c.f);switch(a){case 1:n=s_star01_fill;b=N.b.g(e.a.Po,e.canvas.width,0)-e.c.x;c=N.b.g(e.a.Qo,e.canvas.height,s_star01_fill.height)-e.c.y+g+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=N.b.g(e.a.Ro,e.canvas.width,0)-e.c.x;c=N.b.g(e.a.So,e.canvas.height,
s_star01_fill.height)-e.c.y+g+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=N.b.g(e.a.To,e.canvas.width,0)-e.c.x,c=N.b.g(e.a.Uo,e.canvas.height,s_star01_fill.height)-e.c.y+g+Math.round(s_star03_empty.height/2)}n.p(0,b,c);z(e.c.f);e.c.Rb=!0;I.q(e.N[a-1])});Z(c,"alpha",1,e.a.ry,Zb);e.N.push(c);H.play(e.py[e.N.length-1])}};
d.Ey=function(a,b){var c=b.parent,e,g;e=c.N[c.Tf.length];g=new xh(c.depth-50,N.Yd,s_sfx_star);g.x=e.x;g.y=e.y;Z(g,"subImage",s_sfx_star.H-1,c.a.qy,void 0,function(){I.q(g)});c.Tf.push(g)};
d.wy=function(a,b){var c=b.parent,e,g,h,k,l,n,q;e=[];h=T.M();k=N.i.r("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.Sr&&C(h,c.a.Sr);g=Na(h,k,c.a.hl,c.a.uw,!0);g<h.fontSize&&D(h,g);l=N.b.fa(c.a.vw,Bc.width,h.da(k,c.a.hl),h.align);n=N.b.fa(c.a.ww,Bc.height,h.X(k,c.a.hl),h.h);for(q=0;q<Bc.H;q++)g=new x(Bc.width,Bc.height),y(g),Bc.p(q,0,0),h.p(k,l,n,c.a.hl),z(g),e.push(g);c.Ja=new xh(c.depth-120,N.Yd,e);c.Ja.fc=c.a.Pr;c.Ja.gc=c.a.Qr;c.Ja.x=N.b.g({align:"center"},c.c.canvas.width,c.Ja.width)-c.c.x;
c.Ja.y=N.b.g(c.a.Qi,c.Ja.canvas.height,c.Ja.height)-c.c.y+Math.abs(N.ra);l=N.b.g(c.a.bo,c.Ja.canvas.width,c.Ja.width)-c.c.x;c.Ja.wa=c.a.gl;c.Ja.La=c.a.gl;c.Ja.parent=c.c;c.Ja.alpha=0;c.Ja.Rz=!0;Z(c.Ja,"scale",1,c.a.Qg,Zb,function(){I.q(c.kb);c.kb=void 0});Z(c.Ja,"x",l,c.a.Qg,Zb);Z(c.Ja,"alpha",1,0,Zb);Z(c.Ja,"subImage",Bc.H,c.a.sw,Zb,void 0,c.a.Qg+c.a.Or+c.a.rw,!0,c.a.tw)};
d.yy=function(a,b){var c,e=b.parent;e.kb=new xh(e.depth-110,N.Yd,Ac);e.kb.y=N.b.g(e.a.Qi,e.kb.canvas.height,Ac.height)-e.c.y+e.a.qw;e.kb.fc=e.a.Pr;e.kb.gc=e.a.Qr;e.kb.x=N.b.g(e.a.bo,e.kb.canvas.width,e.kb.width)-e.c.x;c=N.b.g(e.a.Qi,e.kb.canvas.height,Ac.height)-e.c.y+Math.abs(N.ra);e.kb.wa=e.a.gl*e.a.Rr;e.kb.La=e.a.gl*e.a.Rr;e.kb.alpha=0;e.kb.parent=e.c;Z(e.kb,"y",c,e.a.Qg,Zb);Z(e.kb,"scale",1,e.a.Qg,Zb);Z(e.kb,"alpha",1,e.a.Qg,Zb)};
d.xy=function(a,b){var c=b.parent;c.Fe=new xh(c.depth-130,N.Yd,zc);c.Fe.parent=c.c;c.Fe.x=c.Ja.x;c.Fe.y=c.Ja.y+c.a.pw;Z(c.Fe,"subImage",zc.H-1,c.a.Or,void 0,function(){I.q(c.Fe);c.Fe=void 0});H.play(kg)};
d.zb=function(){var a;for(a=0;a<this.buttons.length;a++)I.q(this.buttons[a]);for(a=0;a<this.N.length;a++)I.q(this.N[a]);for(a=0;a<this.Tf.length;a++)I.q(this.Tf[a]);this.Ja&&(I.q(this.Ja),this.Fe&&I.q(this.Fe),this.kb&&I.q(this.kb));I.q(this.c);this.Y&&this.Y.stop();this.hg&&I.q(this.hg);for(a=0;a<this.af.length;a++)I.q(this.af[a]);Bh()};d.Ua=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.alpha;pa(0,0,p.canvas.width,p.canvas.height,this.a.fn,!1);p.context.globalAlpha=a};
function Ch(a,b,c){this.depth=10;this.visible=!0;this.k=!1;N.b.bb(this,N.sb);this.a=N.a.D.ck;for(var e in N.a.R.ck)this.a[e]=N.a.R.ck[e];this.$l=b;this.Pm=c;this.ka=Rg(N.d);this.ka.ah[this.ka.Gc]=a;this.Y=new Ub;this.Y.parent=this;this.buttons=[];J(this,!1)}d=Ch.prototype;
d.md=function(a){var b,c,e=this;c=function(){Z(e.message,"xScale",1,e.a.Rg,M);Z(e.message,"yScale",1,e.a.Rg,M);Z(e.message,"alpha",1,e.a.Rg,L)};void 0===this.message&&(b=new x(this.a.ho+2*this.a.Aw,this.a.Ur+2*this.a.Bw),this.message=new xh(this.depth-20,N.sb,b),this.message.wa=0,this.message.La=0,this.message.alpha=0,this.message.fc=Math.floor(b.width/2),this.message.gc=Math.floor(b.height/2),this.message.x=N.b.g(this.a.Fw,this.canvas.width,0)-this.Xg,this.message.y=N.b.g(this.a.Gw,this.canvas.height,
b.height)+Math.floor(b.height/2)-this.If,this.message.parent=this.c,this.Y.bc>=this.a.jl?c():this.Y.ta(this.a.jl,c));y(this.message.f);p.clear();b=T.M();void 0!==this.a.Ef&&C(b,this.a.Ef);F(b,"center");G(b,"middle");c=Na(b,a,this.a.ho,this.a.Ur,!0);c<b.fontSize&&D(b,c);b.p(a,Math.floor(this.message.width/2),Math.floor(this.message.height/2),this.a.ho);z(this.message.f);0<this.message.wa&&(this.message.Rb=!0)};
function Dh(a,b){var c,e,g;c=T.M();void 0!==a.a.tj&&C(c,a.a.tj);e=Na(c,b,a.a.Xo,a.a.Ws,!0);e<c.fontSize&&D(c,e);e=N.b.fa(a.a.Jy,a.c.width,a.a.Xo,c.align);g=N.b.fa(a.a.Xs,a.c.height,a.a.Ws,c.h);y(a.c.f);c.p(b,e,g,a.a.Xo);z(a.c.f)}
function Eh(a){var b,c,e;c=function(){Z(a.Gb,"xScale",1,a.a.Rg,M);Z(a.Gb,"yScale",1,a.a.Rg,M);Z(a.Gb,"alpha",1,a.a.Rg,L)};b=new x(a.a.pp+2*a.a.tz,a.a.St+2*a.a.uz);a.Gb=new xh(a.depth-20,N.sb,b);a.Gb.wa=0;a.Gb.La=0;a.Gb.alpha=0;a.Gb.fc=Math.floor(b.width/2);a.Gb.gc=Math.floor(b.height/2);a.Gb.x=N.b.g(a.a.vz,a.canvas.width,0)-a.Xg;a.Gb.y=N.b.g(a.a.wz,a.canvas.height,b.height)+Math.floor(b.height/2)-a.If;a.Gb.parent=a.c;a.Y.bc>=a.a.jl?c():a.Y.ta(a.a.jl,c);b=N.i.r("challengeEndScreenWinnings","CHALLENGEENDSCREENWINNINGS");
b=b.replace("<AMOUNT>",a.ka.Nt);y(a.Gb.f);c=T.M();void 0!==a.a.tj&&C(c,a.a.tj);F(c,"center");G(c,"middle");e=Na(c,b,a.a.pp,a.a.St,!0);e<c.fontSize&&D(c,e);c.p(b,Math.floor(a.Gb.width/2),Math.floor(a.Gb.height/2),a.a.pp);z(a.Gb.f);0<a.Gb.wa&&(a.Gb.Rb=!0)}d.Ct=function(a){if("string"===typeof a){var b=N.i.r("challengeEndScreenOutcomeMessage_"+a,"<CHALLENGEENDSCREEN_CHALLENGE"+a.toUpperCase()+">");this.md(b);"WON"===a&&Eh(this)}};
function Fh(a){var b,c;b=N.b.g(a.a.My,a.c.width,a.a.cm);c=N.b.g(a.a.Ny,a.c.height,0);a.buttons.push(new Wg("default_text",b,c,a.depth-20,"challengeEndScreensBtn_submit",a.a.cm,function(){var b;a.$l();for(b=0;b<a.buttons.length;b++)I.q(a.buttons[b]);return!0},a.c));b=N.b.g(a.a.Cu,a.c.width,a.a.cm);c=N.b.g(a.a.Du,a.c.height,0);a.buttons.push(new Wg("default_text",b,c,a.depth-20,"challengeEndScreenBtn_cancel",a.a.cm,function(){var b,c;b=new Gh(N.i.r("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),
[{L:"challengeCancelConfirmBtn_yes",S:function(){b.close();a.Pm();for(c=0;c<a.buttons.length;c++)I.q(a.buttons[c]);return!0}},{L:"challengeCancelConfirmBtn_no",S:function(){b.close()}}],!0)},a.c))}
d.Sb=function(){function a(a){a.wa=0;a.La=0;a.fc=Math.floor(a.f.width/2);a.gc=Math.floor(a.f.height/2)}var b,c,e,g,h,k,l=this;wh(this);"undefined"!==typeof s_overlay_challenge_end?(b=new x(s_overlay_challenge_end.width,s_overlay_challenge_end.height),y(b),s_overlay_challenge_end.p(0,0,0),z(b)):b=new x(O(560),O(560));this.c=new xh(this.depth-10,N.sb,b);this.c.x=N.b.g(this.a.nx,this.canvas.width,this.c.width)+this.a.Jf;this.c.y=N.b.g(this.a.ox,this.canvas.height,this.c.height)+N.Vj+this.a.Yg;this.Xg=
N.b.g(this.a.Xg,this.canvas.width,this.c.width)+this.a.Jf;this.If=N.b.g(this.a.If,this.canvas.height,this.c.height)+this.a.Yg;h=Array(this.ka.kd.length);c=0;k=[];for(b=0;b<this.ka.kd.length;b++)b!==this.ka.Gc&&(void 0!==this.ka.ah[b]?(h[b]=c,c++):k.push(b));h[this.ka.Gc]=c;c++;for(b=0;b<k.length;b++)h[k[b]]=c,c++;c=T.M();void 0!==this.a.io&&C(c,this.a.io);F(c,"center");G(c,"middle");k=[];for(b=0;b<this.ka.kd.length;b++)e=b===this.ka.Gc?N.i.r("challengeEndScreenName_you","<YOU>"):this.ka.kd[b],13<
e.length&&(e=e.substr(0,10)+"..."),k.push(e);e=c.fontSize;for(b=0;b<k.length;b++)e=Math.min(e,Na(c,k[b],this.a.as,this.a.$r,!1));e<c.fontSize&&D(c,e);this.ce=[];for(b=0;b<k.length;b++)e=k[b],g=new x(this.a.as+2*this.a.Rw,this.a.$r+2*this.a.Sw),y(g),c.p(e,Math.floor(g.width/2)+this.a.Vw,Math.floor(g.height/2)+this.a.Ww),z(g),e=new xh(this.depth-20,this.Ia,g),e.alpha=0,a(e),e.x=this.a.$w+h[b]*(g.width+this.a.Zw)+Math.floor(g.width/2)-this.Xg,e.y=N.b.g(this.a.bx,this.canvas.height,g.height)+Math.floor(g.height/
2)-this.If,e.parent=this.c,this.ce.push(e);this.jf=[];c=T.M();void 0!==this.a.Zm&&C(c,this.a.Zm);F(c,"center");G(c,"middle");for(b=0;b<this.ka.kd.length;b++)e=void 0!==this.ka.ah[b]?new TG_StatObject("player_"+b,N.j.Of,"",this.ka.ah[b]):new TG_StatObject("player_"+b,"text","","?"),h=this.ce[b].x+this.a.zq,k=N.b.g(this.a.Xu,this.canvas.height,this.a.Aq)+Math.floor(g.height/2)-this.If,h=new qh(h,k,this.a.Wu,this.a.Aq,this.depth-18,b===this.ka.Gc?0:e.nc,c,this.a.zq,this.a.Vu,this.c,e.toString),a(h.Zc),
h.Zc.alpha=0,this.jf.push(h);this.n=0;this.Y.ta(this.a.Qp,function(){Z(l.c,"x",l.Xg,l.a.se,M);Z(l.c,"y",l.If+N.Vj,l.a.se,M)});this.Y.ta(this.a.ax,function(){var a;for(a=0;a<l.ce.length;a++)Z(l.ce[a],"xScale",1,l.a.jo,M),Z(l.ce[a],"yScale",1,l.a.jo,M),Z(l.ce[a],"alpha",1,l.a.jo,L)});this.Y.ta(this.a.Wx,function(){var a;for(a=0;a<l.ce.length;a++)Z(l.jf[a].Zc,"xScale",1,l.a.Io,M),Z(l.jf[a].Zc,"yScale",1,l.a.Io,M),Z(l.jf[a].Zc,"alpha",1,l.a.Io,L)});this.Y.ta(this.a.Zx,function(){Ah(l.jf[l.ka.Gc],l.ka.ah[l.ka.Gc],
l.a.$x)});"function"===typeof this.$l&&"function"===typeof this.Pm&&this.Y.ta(l.a.Bu,function(){Fh(l)});this.Y.ta(this.a.Qp,N.l.hr);this.Y.start();"function"===typeof this.$l&&"function"!==typeof this.Pm&&this.$l()};d.zb=function(){var a;this.message&&I.q(this.message);for(a=0;a<this.buttons.length;a++)I.q(this.buttons[a]);for(a=0;a<this.ce.length;a++)I.q(this.ce[a]);for(a=0;a<this.jf.length;a++)I.q(this.jf[a]);Bh()};
d.Ua=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.a.qi;pa(0,0,p.canvas.width,p.canvas.height,this.a.fn,!1);p.context.globalAlpha=a};
function Hh(a,b,c,e){this.depth=-100;this.visible=!1;this.k=!0;N.b.bb(this,N.sb);var g,h;this.a=c?N.a.D.po:N.a.D.options;if("landscape"===N.orientation)for(g in h=c?N.a.D.MA:N.a.D.hx,h)this.a[g]=h[g];this.cc=N.a.D.Ob;h=c?N.a.R.po:N.a.R.options;for(g in h)this.a[g]=h[g];if(N.B.options&&N.B.options.buttons)for(g in N.B.options.buttons)this.a.buttons[g]=N.B.options.buttons[g];this.type=a;this.iz=b;this.lc=c;this.Ql=!1!==e;J(this)}d=Hh.prototype;
d.ai=function(a,b,c,e,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,w=void 0;switch(a){case "music":h="music_toggle";n=this.qt;l=N.d.Kf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.qt;l=N.d.Kf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.rt;l=N.d.zl()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.rt;l=N.d.zl()?"on":"off";break;case "language":h="language_toggle";n=this.pt;l=N.d.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.Zi;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.vs;this.Nm=this.iy;break;case "moreGames":void 0!==N.B.Iw?(h="default_image",w=N.B.Iw):(h="default_text",k="optionsMoreGames");n=this.jy;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=N.bh.customFunctions&&"function"===typeof N.bh.customFunctions.exit?N.bh.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.Ex;break;
case "restart":h="default_text";k="optionsRestart";n=this.Nx;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.vs;this.Nm=this.ly;break;case "about":h="default_text";k="optionsAbout";n=this.gy;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.ui;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.wg}void 0!==h&&void 0!==n&&("image"===this.cc[h].type?this.buttons.push(new Ih(h,b,c,this.depth-20,w,e,{S:n,ca:this,Ub:q},
this.c)):"toggleText"===this.cc[h].type?this.buttons.push(new Sg(h,b,c,this.depth-20,l,e,{S:n,ca:this,Ub:q},this.c)):"text"===this.cc[h].type?this.buttons.push(new Wg(h,b,c,this.depth-20,k,e,{S:n,ca:this,Ub:q},this.c)):"toggle"===this.cc[h].type&&this.buttons.push(new Jh(h,b,c,this.depth-20,l,{S:n,ca:this,Ub:q},this.c)),this.buttons[this.buttons.length-1].hb=g||!1)};
d.vs=function(){var a=this;Z(a.c,"y","inGame"!==this.type?-this.c.f.height:this.canvas.height,this.a.Vg,this.a.Wg,function(){I.q(a);void 0!==a.Nm&&a.Nm.call(a)});return!0};
d.Ga=function(a,b){var c,e,g,h;y(this.c.f);p.clear();this.a.backgroundImage.p(0,0,0);c=N.i.r("optionsTitle","<OPTIONS_TITLE>");e=T.M();this.a.Zb&&C(e,this.a.Zb);void 0!==this.a.rd&&void 0!==this.a.le&&(g=Na(e,c,this.a.rd,this.a.le,this.a.rd),e.fontSize>g&&D(e,g));g=N.b.fa(this.a.Me,this.canvas.width,e.da(c),e.align)-a;h=N.b.fa(this.a.hc,this.canvas.height,e.X(c,e.h))-b+-1*N.ra;e.p(c,g,h);z(this.c.f)};
d.Xe=function(a,b,c){var e,g,h,k,l,n,q;h=!1;var w=this.a.buttons[this.type];"inGame"===this.type&&N.a.o.nf.zw&&(w=N.a.o.nf.zw);if("function"!==typeof Kh())for(e=0;e<w.length;e++){if("string"===typeof w[e]&&"moreGames"===w[e]){w.splice(e,1);break}for(g=0;g<w[e].length;g++)if("moreGames"===w[e][g]){w[e].splice(g,1);break}}if(!1===N.B.Kf||!1===N.d.al)for(e=0;e<w.length;e++)if(w[e]instanceof Array){for(g=0;g<w[e].length;g++)if("music"===w[e][g]){N.d.bl?w[e]="sfx_big":w.splice(e,1);h=!0;break}if(h)break}else if("music_big"===
w[e]){w.splice(e,1);break}if(!N.d.bl)for(e=0;e<w.length;e++)if(w[e]instanceof Array){for(g=0;g<w[e].length;g++)if("sfx"===w[e][g]){!1!==N.B.Kf&&N.d.al?w[e]="music_big":w.splice(e,1);h=!0;break}if(h)break}else if("sfx_big"===w[e]){w.splice(e,1);break}if(1===N.i.nv().length)for(e=0;e<w.length;e++)if("language"===w[e]){w.splice(e,1);break}h=this.cc.default_text.t.height;k=this.a.$j;a=N.b.g(this.a.Zj,this.canvas.width,k)-a;n=N.b.g(this.a.vg,this.c.f.height,h*w.length+this.a.wd*(w.length-1))-b+-1*N.ra;
for(e=0;e<w.length;e++){l=a;q=k;if("string"===typeof w[e])this.ai(w[e],l,n,q,c);else for(b=w[e],q=(k-(b.length-1)*this.a.wd)/b.length,g=0;g<b.length;g++)this.ai(b[g],l,n,q,c),l+=q+this.a.wd;n+=h+this.a.wd}};d.qt=function(a){var b=!0;"off"===a?(b=!1,N.Ba.Va("off","options:music")):N.Ba.Va("on","options:music");N.d.Kf(b);return!0};d.rt=function(a){var b=!0;"off"===a?(b=!1,N.Ba.Va("off","options:sfx")):N.Ba.Va("on","options:sfx");N.d.zl(b);return!0};
d.pt=function(a){N.i.As(a);N.Ba.Va(a,"options:language");return!0};
d.Zi=function(){function a(){l.yc+=1;l.Zi();return!0}function b(){l.yc-=1;l.Zi();return!0}function c(){var a;l.Ga(n,q);l.df.hb=!0;for(a=0;a<l.buttons.length;a++)I.q(l.buttons[a]);l.buttons=[];l.Xe(n,q,!0)}var e,g,h,k,l=this,n=N.b.g(l.a.Yb,l.canvas.width,l.a.backgroundImage.width),q=N.b.g(l.a.ub,l.canvas.height,l.a.backgroundImage.height)+-1*N.ra;void 0===l.yc&&(l.yc=0);l.lj=void 0!==N.o.Sq?N.o.Sq():[];N.Ba.Va((10>l.yc?"0":"")+l.yc,"options:tutorial");for(e=0;e<l.buttons.length;e++)I.q(l.buttons[e]);
l.buttons=[];this.lc?(y(l.c.f),p.clear(),l.df.hb=!1):l.Ga(n,q);y(l.c.f);void 0!==l.a.sd&&(e=N.b.g(l.a.km,l.c.f.width,l.a.sd.width),g=N.b.g(l.a.Ne,l.c.f.height,l.a.sd.height),l.a.sd.p(0,e,g));k=l.lj[l.yc].title;void 0!==k&&""!==k&&(h=T.M(),l.a.nj&&C(h,l.a.nj),e=Na(h,k,l.a.lm,l.a.hp,l.a.lm),h.fontSize>e&&D(h,e),e=N.b.fa(l.a.Bt,l.c.f.width,h.da(k,l.a.lm),h.align),g=N.b.fa(l.a.ip,l.c.f.height,h.X(k,l.a.hp),h.h),h.p(k,e,g));l.yc<l.lj.length&&(h=l.lj[l.yc].f,e=N.b.g(l.a.yt,l.c.f.width,h.width),g=N.b.g(l.a.fp,
l.c.f.height,h.height),h.p(0,e,g),k=l.lj[l.yc].text,h=T.M(),l.a.mj&&C(h,l.a.mj),e=Na(h,k,l.a.vh,l.a.zt,l.a.vh),h.fontSize>e&&D(h,e),e=N.b.fa(l.a.At,l.c.f.width,h.da(k,l.a.vh),h.align),g=N.b.fa(l.a.gp,l.c.f.height,h.X(k,l.a.vh),h.h),h.p(k,e,g,l.a.vh));z(l.c.f);h=Uc;e=N.b.g(l.a.xt,l.canvas.width,h.width)-l.c.x;g=N.b.g(l.a.ep,l.canvas.height,h.height)-l.c.y-N.ra;0<=l.yc-1?l.buttons.push(new Bg(e,g,l.depth-20,new Sb(h),[h],{S:b,ca:l},l.c)):(h=Sc,l.buttons.push(new Bg(e,g,l.depth-20,new Sb(h),[h],{S:c,
ca:l},l.c)));h=Tc;e=N.b.g(this.a.wt,l.canvas.width,h.width)-l.c.x;g=N.b.g(this.a.dp,l.canvas.height,h.height)-l.c.y-N.ra;l.yc+1<l.lj.length?l.buttons.push(new Bg(e,g,l.depth-20,new Sb(h),[h],{S:a,ca:l},l.c)):(h=Sc,l.buttons.push(new Bg(e,g,l.depth-20,new Sb(h),[h],{S:c,ca:l},l.c)));return!0};
d.gy=function(){function a(a,b,c,g,h,k){var l;l=T.M();b&&C(l,b);b=Na(l,a,h,k,h);l.fontSize>b&&D(l,b);c=N.b.fa(c,e.c.f.width,l.da(a,h),l.align);g=N.b.fa(g,e.c.f.height,l.X(a,k),l.h);l.p(a,c,g,h);return g+k}function b(a,b,c){b=N.b.g(b,e.c.f.width,a.width);c=N.b.g(c,e.c.f.height,a.height);a.p(0,b,c);return c+a.height}var c,e=this,g=N.b.g(e.a.Yb,e.canvas.width,e.a.backgroundImage.width),h=N.b.g(e.a.ub,e.canvas.height,e.a.backgroundImage.height)+-1*N.ra;N.Ba.Va("about","options");for(c=0;c<e.buttons.length;c++)I.q(e.buttons[c]);
e.buttons=[];this.lc?(y(e.c.f),p.clear(),e.df.hb=!1):e.Ga(g,h);y(e.c.f);void 0!==e.a.sd&&b(e.a.sd,e.a.km,e.a.Ne);var k=null;"function"===typeof N.l.uq?k=N.l.uq(e.a,a,b,e.c.f):(c=N.i.r("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,e.a.Fj,e.a.Hj,e.a.Wh,e.a.Gj,e.a.Kp),b(Wc,e.a.Xh,e.a.Ij),c=N.i.r("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,e.a.Yh,e.a.og,e.a.$h,e.a.We,e.a.Zh));a(N.i.r("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+Hg()+("big"===N.size?"b":"s"),e.a.Cm,e.a.Np,e.a.Dm,e.a.Mp,
e.a.Lp);z(e.c.f);if(k)for(c=0;c<k.length;++c){var l=k[c];e.buttons.push(new Bg(l.x,l.y,e.depth-10,Rb(0,0,l.width,l.height),null,{S:function(a){return function(){N.l.jd(a)}}(l.url),Ub:!0},e.c))}else void 0!==N.B.cr&&(c=N.b.g(e.a.Xh,e.c.f.width,Wc.width),k=N.b.g(e.a.Ij,e.c.f.height,Wc.height),c=Math.min(c,N.b.g(e.a.og,e.c.f.width,e.a.We)),k=Math.min(k,N.b.g(e.a.$h,e.c.f.height,e.a.Zh)),l=Math.max(e.a.We,Wc.width),e.buttons.push(new Bg(c,k,e.depth-10,Rb(0,0,l,N.b.g(e.a.$h,e.c.f.height,e.a.Zh)+e.a.Zh-
k),null,{S:function(){N.l.jd(N.B.cr)},Ub:!0},e.c)));e.buttons.push(new Wg("default_text",N.b.g(e.a.Bm,e.c.f.width,e.a.Vh),e.a.Uh,e.depth-20,"optionsAbout_backBtn",e.a.Vh,{S:function(){var a;e.Ga(g,h);e.df.hb=!0;for(a=0;a<e.buttons.length;a++)I.q(e.buttons[a]);e.buttons=[];e.Xe(g,h,!0);e.Ds=!1},ca:e},e.c));return this.Ds=!0};
function Lh(a){var b,c,e,g,h,k=N.b.g(a.a.Yb,a.canvas.width,a.a.backgroundImage.width),l=N.b.g(a.a.ub,a.canvas.height,a.a.backgroundImage.height)+-1*N.ra;N.Ba.Va("versions","options");for(b=0;b<a.buttons.length;b++)I.q(a.buttons[b]);a.buttons=[];a.Ga(k,l);y(a.c.f);void 0!==a.a.sd&&a.a.sd.p(0,N.b.g(a.a.km,a.c.width,a.a.sd.width),N.b.g(a.a.Ne,a.c.height,a.a.sd.height));h=T.M();C(h,a.a.Cm);F(h,"left");c=a.a.Lt;e=a.a.Mt;for(b in N.version)g=b+": "+N.version[b],h.p(g,c,e),e+=h.X(g)+a.a.Kt;c=N.b.g(a.a.Bm,
a.c.f.width,a.a.Vh);e=a.a.Uh;a.buttons.push(new Wg("default_text",c,e,a.depth-20,"optionsAbout_backBtn",a.a.Vh,{S:function(){var b;a.Ga(k,l);for(b=0;b<a.buttons.length;b++)I.q(a.buttons[b]);a.buttons=[];a.Xe(k,l,!0)},ca:a},a.c))}d.iy=function(){return!0};d.jy=function(){N.Ba.Va("moreGames","options");var a=Kh();"function"===typeof a&&a();return!0};
d.Ex=function(){var a=this;Mh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){N.Ba.Va("confirm_yes","options:quit");I.q(a);Ig(N.Ba,N.d.eg,Nh(N.d),"progression:levelQuit:"+Oh());Ph();Qh(N.d);return!0})};
d.Nx=function(){var a=this;Mh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){N.Ba.Va("confirm_yes","options:restart");I.q(a);var b=N.d;b.state="LEVEL_END";Ig(N.Ba,N.d.eg,Nh(N.d),"progression:levelRestart:"+Oh());b=N.j.qj?b.fb+1:ch(b)+1;N.d.na=!0;N.d.tr="retry";Rh(N.d,!0);b={failed:!0,level:b,restart:!0};N.l.Mg(b);N.ud.Mg(b);return!0})};
d.ui=function(){var a,b=this;a=function(a){var e=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";b.md(N.i.r(e,"<"+e.toUpperCase()+">"));a&&(b.df.hb=!1,b.Ql||wh())};Mh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){N.d.ui(a);return!0})};
d.wg=function(){var a,b=this;a=function(a){var e=a?"challengeCancelMessage_success":"challengeCancel_error";b.md(N.i.r(e,"<"+e.toUpperCase()+">"));a&&(b.df.hb=!1,b.Ql||wh())};Mh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){N.d.wg(a);return!0})};
function Mh(a,b,c,e,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)I.q(a.buttons[h]);a.buttons=[];b=N.i.r(b,"<"+b.toUpperCase()+">");h=T.M();a.a.Rm?C(h,a.a.Rm):a.a.Fl&&C(h,a.a.Fl);k=Na(h,b,a.a.ki,a.a.ik,!0);k<h.fontSize&&D(h,k);n=h.da(b,a.a.ki)+10;l=h.X(b,a.a.ki)+10;k=N.b.fa(a.a.mq,a.c.f.width,n,h.align);l=N.b.fa(a.a.jk,a.c.f.height,l,h.h);y(a.c.f);h.p(b,k,l,n);z(a.c.f);k=N.b.g(a.a.kq,a.canvas.width,a.a.ji)-a.c.x;l=N.b.g(a.a.gk,a.canvas.height,a.cc.default_text.t.height)-a.c.y-N.ra;a.buttons.push(new Wg("default_text",
k,l,a.depth-20,e,a.a.ji,{S:function(){var b,c,e;c=N.b.g(a.a.Yb,a.canvas.width,a.a.backgroundImage.width);e=N.b.g(a.a.ub,a.canvas.height,a.a.backgroundImage.height)+-1*N.ra;a.Ga(c,e);for(b=0;b<a.buttons.length;b++)I.q(a.buttons[b]);a.buttons=[];a.Xe(c,e,!0);return!0},ca:a},a.c));k=N.b.g(a.a.lq,a.canvas.width,a.a.ji)-a.c.x;l=N.b.g(a.a.hk,a.canvas.height,a.cc.default_text.t.height)-a.c.y-N.ra;a.buttons.push(new Wg("default_text",k,l,a.depth-20,c,a.a.ji,{S:function(){return"function"===typeof g?g():!0},
ca:a},a.c))}
d.md=function(a){var b,c,e,g;for(b=0;b<this.buttons.length;b++)I.q(this.buttons[b]);this.buttons=[];c=N.b.g(this.a.Yb,this.canvas.width,this.a.backgroundImage.width);e=N.b.g(this.a.ub,this.canvas.height,this.a.backgroundImage.height)+-1*N.ra;this.Ga(c,e);b=T.M();this.a.Ef&&C(b,this.a.Ef);c=Na(b,a,this.a.fo,this.a.Cw,!0);c<b.fontSize&&D(b,c);g=b.da(a,this.a.fo)+10;e=b.X(a,this.a.fo)+10;c=N.b.fa(this.a.Dw,this.c.f.width,g,b.align);e=N.b.fa(this.a.Ew,this.c.f.height,e,b.h);y(this.c.f);b.p(a,c,e,g);z(this.c.f)};
d.ly=function(){N.Ba.Va("startScreen","options");Qh(N.d);return!0};d.close=function(){I.q(this);return this.canvas.Z=!0};
d.Sb=function(){var a,b;this.Ql&&wh(this);N.d.Qd=this;this.Gq=this.Fq=!1;a=this.a.backgroundImage;this.c=new xh(this.depth-10,this.Ia,new x(a.width,a.height));this.c.x=N.b.g(this.a.Yb,this.canvas.width,a.width);a=N.b.g(this.a.ub,this.canvas.height,a.height)+-1*N.ra;this.c.y=a;this.Ga(this.c.x,this.c.y);this.buttons=[];this.iz?this.Zi():this.Xe(this.c.x,this.c.y);this.df=new Bg(this.a.gi,this.a.zg,this.depth-20,new Rb(0,0,this.a.yg,this.a.ef),void 0,{S:this.close,ca:this},this.c);this.xh="versions";
this.Ye=new Vb;N.b.bb(this.Ye,N.sb);Jb(this.Ye,this.depth-1);Wb(this.Ye,"keyAreaLeft",this.c.x,this.c.y+this.a.Ne,this.a.pg,this.a.Jj,76);Wb(this.Ye,"keyAreaRight",this.c.x+this.c.width-this.a.pg,this.c.y+this.a.Ne,this.a.pg,this.a.Jj,82);Wb(this.Ye,"keyAreaCentre",N.gw/2-this.a.pg/2,this.c.y+this.a.Ne,this.a.pg,this.a.Jj,67);b=this;this.c.y="inGame"!==this.type?this.canvas.height:-this.c.f.height;Z(this.c,"y",a,this.a.Gf,this.a.Hf,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].hb=!0})};
d.zb=function(){var a;this.Ql&&Bh();this.Fq&&la(N.wf,N.i.Bn());this.Gq&&la(N.Je);for(a=0;a<this.buttons.length;a++)I.q(this.buttons[a]);this.Ye.clear();I.q(this.Ye);I.q(this.df);I.q(this.c);N.d.Qd=null};d.Tb=function(){return!0};d.Ab=function(){return!0};d.Lg=function(a){this.Ds&&(67===a?this.xh="":76===a?this.xh+="l":82===a&&(this.xh+="r"),"lrl"===this.xh&&Lh(this))};d.gd=function(a){a===N.wf?(this.Ga(this.c.x,this.c.y),this.Fq=!0):a===N.Je?this.Gq=!0:a===N.nu&&this.close()};
function Sh(){this.depth=-200;this.k=this.visible=!0;N.b.bb(this,N.of);var a;this.a=N.a.D.zk;if("landscape"===N.orientation&&N.a.D.nn)for(a in N.a.D.nn)this.a[a]=N.a.D.nn[a];this.cc=N.a.D.Ob;for(a in N.a.R.zk)this.a[a]=N.a.R.zk[a];J(this)}
Sh.prototype.Ga=function(){var a,b,c,e;c=this.a.backgroundImage;e=(N.dw-Math.abs(N.ra))/c.Ag;this.c.f=new x(e*c.ii,e*c.Ag);y(this.c.f);this.c.y=Math.abs(N.ra);a=p.context;1E-4>Math.abs(e)||1E-4>Math.abs(e)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(e,e),a.globalAlpha=1,ta(c,0,0),a.restore());c=T.M();C(c,this.a.font);e=N.i.r("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Na(c,e,this.a.em-(c.stroke?c.Sc:0),this.a.Uy-(c.stroke?c.Sc:0),!0);a<c.fontSize&&D(c,a);a=N.b.fa(this.a.it,this.canvas.width,
c.da(e),c.align);b=N.b.fa(this.a.jt,this.canvas.height,c.X(e),c.h);c.p(e,a,b,this.a.em);z(this.c.f);this.c.canvas.Z=!0};Sh.prototype.Sb=function(){var a=this,b=this.a.backgroundImage,b=new x(b.width,b.height);this.c=new xh(this.depth,N.sb,b);this.c.x=0;this.c.y=Math.abs(N.ra);this.Ga();this.button=new Wg(this.a.cq,N.b.g(this.a.zu,this.canvas.width,this.a.dq),N.b.g(this.a.eq,this.canvas.height,this.cc[this.a.cq].t.height),this.depth-10,"gameEndScreenBtnText",this.a.dq,function(){I.q(a);Qh(N.d)},this.c)};
Sh.prototype.zb=function(){I.q(this.c);I.q(this.button)};Sh.prototype.gd=function(a){a!==N.wf&&a!==N.Je||this.Ga()};
function Bg(a,b,c,e,g,h,k){function l(a,b,c){var e,g;g=N.b.An(q.canvas);a=Math.round(q.x+q.parent.x-q.fc*q.wa);e=Math.round(q.y+q.parent.y-q.gc*q.La);if(q.images&&0<q.tf||0<q.ej)q.tf=0,q.ej=0,q.canvas.Z=!0;if(q.Ti&&q.hb&&Tb(q.Oc,a,e,b-g.x,c-g.y))return q.Ti=!1,void 0!==q.ca?q.ql.call(q.ca,q):q.ql(q)}function n(a,b,c){var e,g,h;h=N.b.An(q.canvas);e=Math.round(q.x+q.parent.x-q.fc*q.wa);g=Math.round(q.y+q.parent.y-q.gc*q.La);if(q.hb&&Tb(q.Oc,e,g,b-h.x,c-h.y))return q.Ti=!0,q.images&&(1<q.images.length?
(q.tf=1,q.canvas.Z=!0):1<q.images[0].H&&(q.ej=1,q.canvas.Z=!0)),void 0!==typeof dg&&H.play(dg),q.mf=a,!0}this.depth=c;this.k=this.visible=!0;this.group="TG_Token";N.b.bb(this,N.sb);this.gc=this.fc=0;this.x=a;this.y=b;this.width=g?g[0].width:e.$a-e.Ea;this.height=g?g[0].height:e.yb-e.Ta;this.alpha=this.La=this.wa=1;this.Sa=0;this.Oc=e;this.images=g;this.ej=this.tf=0;this.Ti=!1;this.hb=!0;this.parent=void 0!==k?k:{x:0,y:0};this.Kl=this.Jl=0;this.Rb=!0;this.ql=function(){};this.Ub=!1;"object"===typeof h?
(this.ql=h.S,this.ca=h.ca,this.Ub=h.Ub):"function"===typeof h&&(this.ql=h);var q=this;this.Ub?(this.Jg=n,this.Kg=l):(this.Ab=n,this.Tb=l);J(this)}function Vg(a,b,c,e,g,h){void 0===a.ue&&(a.ue=[]);a.ue.push({type:b,start:e,Pb:g,gb:c,duration:h,n:0})}
function $g(a){var b,c;if(void 0!==a.ue){for(b=0;b<a.ue.length;b++)if(c=a.ue[b],c.k){switch(c.type){case "xScale":a.wa=c.start+c.Pb;break;case "yScale":a.La=c.start+c.Pb;break;case "alpha":a.alpha=c.start+c.Pb;break;case "angle":a.Sa=c.start+c.Pb;break;case "x":a.x=c.start+c.Pb;break;case "y":a.y=c.start+c.Pb}c.k=!1}a.canvas.Z=!0}}function gh(a,b){a.images=b;a.canvas.Z=!0}d=Bg.prototype;d.Mo=function(a){this.visible=this.k=a};d.zb=function(){this.images&&(this.canvas.Z=!0)};
d.ua=function(a){var b,c;if(void 0!==this.ue){for(b=0;b<this.ue.length;b++)switch(c=this.ue[b],c.n+=a,c.type){case "xScale":var e=this.wa,g=this.Jl;this.wa=c.gb(c.n,c.start,c.Pb,c.duration);this.Jl=-(this.images[0].width*this.wa-this.images[0].width*c.start)/2;if(isNaN(this.wa)||isNaN(this.Jl))this.wa=e,this.Jl=g;break;case "yScale":e=this.La;g=this.Kl;this.La=c.gb(c.n,c.start,c.Pb,c.duration);this.Kl=-(this.images[0].height*this.La-this.images[0].height*c.start)/2;if(isNaN(this.La)||isNaN(this.Kl))this.La=
e,this.Kl=g;break;case "alpha":this.alpha=c.gb(c.n,c.start,c.Pb,c.duration);break;case "angle":this.Sa=c.gb(c.n,c.start,c.Pb,c.duration);break;case "x":e=this.x;this.x=c.gb(c.n,c.start,c.Pb,c.duration);isNaN(this.x)&&(this.x=e);break;case "y":e=this.y,this.y=c.gb(c.n,c.start,c.Pb,c.duration),isNaN(this.y)&&(this.y=e)}this.canvas.Z=!0}};
d.pc=function(){var a,b,c;c=N.b.An(this.canvas);a=Math.round(this.x+this.parent.x-this.fc*this.wa);b=Math.round(this.y+this.parent.y-this.gc*this.La);this.Ti&&!Tb(this.Oc,a,b,I.ja[this.mf].x-c.x,I.ja[this.mf].y-c.y)&&(this.images&&(this.ej=this.tf=0,this.canvas.Z=!0),this.Ti=!1)};
d.Ua=function(){var a,b;a=Math.round(this.x+this.parent.x-this.fc*this.wa);b=Math.round(this.y+this.parent.y-this.gc*this.La);this.images&&(this.images[this.tf]instanceof x?this.images[this.tf].Da(a,b,this.wa,this.La,this.Sa,this.alpha):this.images[this.tf].Da(this.ej,a,b,this.wa,this.La,this.Sa,this.alpha));this.Rb=!1};
function Wg(a,b,c,e,g,h,k,l){this.aa=N.a.D.Ob[a];a=void 0!==N.a.R.buttons?N.a.D.Yj[N.a.R.buttons[a]||N.a.R.buttons.default_color]:N.a.D.Yj[N.a.D.buttons.default_color];this.font=T.M();a.font&&C(this.font,a.font);this.aa.fontSize&&D(this.font,this.aa.fontSize);this.L=g;this.text=N.i.r(this.L,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.aa.t.height;this.f={source:this.aa.t,va:this.aa.va,lb:this.aa.lb};g=this.Td(this.f);h=new Rb(0,0,g[0].width,g[0].height);Bg.call(this,b,c,e,
h,g,k,l)}N.b.Ji(Wg);d=Wg.prototype;d.Hl=function(a){this.text=N.i.r(this.L,"<"+this.L.toUpperCase()+">");a&&C(this.font,a);gh(this,this.Td(this.f))};d.pj=function(a,b){this.L=a;this.Hl(b)};d.oj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof r?this.f.source=a:void 0!==a.va&&void 0!==a.lb&&void 0!==a.source&&(this.f=a);gh(this,this.Td(this.f))};
d.Td=function(a){var b,c,e,g,h,k,l=a.va+a.lb;e=this.height-(this.aa.Wc||0);var n=a.source;c=this.font.da(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Na(this.font,this.text,b,e,!0);c<this.aa.fontSize?D(this.font,c):D(this.font,this.aa.fontSize);c=a.va;
e=this.font.align;"center"===e?c+=Math.round(b/2):"right"===e&&(c+=b);e=Math.round(this.height/2);void 0!==this.aa.Vc&&(e+=this.aa.Vc);h=[];for(g=0;g<n.H;g++)k=new x(b+l,this.height),y(k),n.ma(g,0,0,a.va,this.height,0,0,1),n.ok(g,a.va,0,n.width-l,this.height,a.va,0,b,this.height,1),n.ma(g,a.va+n.width-l,0,a.lb,this.height,a.va+b,0,1),this.font.p(this.text,c,e,b),z(k),h.push(k);return h};d.gd=function(a){a===N.wf&&this.Hl()};
function Ih(a,b,c,e,g,h,k,l){this.aa=N.a.D.Ob[a];void 0!==h&&(this.width=h);this.height=this.aa.t.height;this.vd={source:this.aa.t,va:this.aa.va,lb:this.aa.lb};this.f=g;a=this.Td();g=new Rb(0,0,a[0].width,a[0].height);Bg.call(this,b,c,e,g,a,k,l)}N.b.Ji(Ih);
Ih.prototype.Td=function(){var a,b,c,e,g,h,k,l=this.vd.va+this.vd.lb;b=this.height-(this.aa.Wc||0);var n=this.vd.source;void 0===this.width?a=this.f.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.f.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.f.width))));k=Math.min(a/this.f.width,b/this.f.height);k=Math.min(k,1);g=Math.round(this.vd.va+
(a-this.f.width*k)/2);h=Math.round((b-this.f.height*k)/2);c=[];for(b=0;b<n.H;b++){e=new x(a+l,this.height);y(e);n.ma(b,0,0,this.vd.va,this.height,0,0,1);n.ok(b,this.vd.va,0,n.width-l,this.height,this.vd.va,0,a,this.height,1);n.ma(b,this.vd.va+n.width-l,0,this.vd.lb,this.height,this.vd.va+a,0,1);try{p.context.drawImage(this.f,g,h,this.f.width*k,this.f.height*k)}catch(q){}z(e);c.push(e)}return c};N.b.Ji(function(a,b,c,e,g,h,k){Bg.call(this,a,b,c,g,e,h,k)});
function Sg(a,b,c,e,g,h,k,l){var n;this.aa=N.a.D.Ob[a];a=void 0!==N.a.R.buttons?N.a.D.Yj[N.a.R.buttons[a]||N.a.R.buttons.default_color]:N.a.D.Yj[N.a.D.buttons.default_color];this.font=T.M();a.font&&C(this.font,a.font);this.aa.fontSize&&D(this.font,this.aa.fontSize);void 0!==h&&(this.width=h);this.height=this.aa.t.height;this.W=this.aa.W;if(this.W.length){for(h=0;h<this.W.length;h++)if(this.W[h].id===g){this.Fa=h;break}void 0===this.Fa&&(this.Fa=0);this.text=N.i.r(this.W[this.Fa].L,"<"+this.W[this.Fa].id.toUpperCase()+
">");this.gg=this.W[this.Fa].t;h=this.Td();a=new Rb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Pf();return k(n.W[n.Fa].id)}:"object"===typeof k?(g={},g.Ub=k.Ub,g.ca=this,g.S=function(){n.Pf();return k.S.call(k.ca,n.W[n.Fa].id)}):g=function(){n.Pf()};Bg.call(this,b,c,e,a,h,g,l)}}N.b.Ji(Sg);d=Sg.prototype;
d.Pf=function(a){var b;if(void 0===a)this.Fa=(this.Fa+1)%this.W.length;else for(b=0;b<this.W.length;b++)if(this.W[b].id===a){this.Fa=b;break}this.oj(this.W[this.Fa].t,N.i.r(this.W[this.Fa].L,"<"+this.W[this.Fa].id.toUpperCase()+">"))};d.Hl=function(a){a&&C(this.font,a);this.text=N.i.r(this.W[this.Fa].L,"<"+this.W[this.Fa].id.toUpperCase()+">");gh(this,this.Td())};d.oj=function(a,b,c){this.text=b;this.gg=a;c&&C(this.font,c);gh(this,this.Td())};
d.Td=function(){var a,b,c,e,g,h,k=this.aa.va,l=this.aa.lb,n=k+l;g=Math.abs(k-l);e=this.height-(this.aa.Wc||0);var q=this.aa.t,w=this.font.M();b=w.da(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));e=Na(w,this.text,a,e,!0);e<w.fontSize&&D(w,e);b=w.da(this.text,
a);e=k;c=w.align;"center"===c?e=a-g>=b?e+Math.round((a-g)/2):e+(this.aa.$f+Math.round(b/2)):"left"===c?e+=this.aa.$f:"right"===c&&(e+=a);g=Math.round(this.height/2);void 0!==this.aa.Vc&&(g+=this.aa.Vc);c=[];for(b=0;b<q.H;b++)h=new x(a+n,this.height),y(h),q.ma(b,0,0,k,this.height,0,0,1),q.ok(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.ma(b,k+q.width-n,0,l,this.height,k+a,0,1),this.gg.p(0,this.aa.qh,this.aa.rh),w.p(this.text,e,g,a),z(h),c.push(h);return c};d.gd=function(a){a===N.wf&&this.Hl()};
function Jh(a,b,c,e,g,h,k){var l;this.W=N.a.D.Ob[a].W;if(this.W.length){for(a=0;a<this.W.length;a++)if(this.W[a].id===g){this.Fa=a;break}void 0===this.Fa&&(this.Fa=0);this.gg=this.W[this.Fa].t;a=new Sb(this.gg);l=this;g="function"===typeof h?function(){l.Pf();return h(l.W[l.Fa].id)}:"object"===typeof h?{ca:this,S:function(){l.Pf();return h.S.call(h.ca,l.W[l.Fa].id)}}:function(){l.Pf()};Bg.call(this,b,c,e,a,[this.gg],g,k)}}N.b.Ji(Jh);
Jh.prototype.Pf=function(a){var b;if(void 0===a)this.Fa=(this.Fa+1)%this.W.length;else for(b=0;b<this.W.length;b++)if(this.W[b].id===a){this.Fa=b;break}this.oj(this.W[this.Fa].t)};Jh.prototype.oj=function(a){this.gg=a;gh(this,[].concat(this.gg))};
function Th(a,b,c){this.depth=10;this.visible=!1;this.k=!0;N.b.bb(this,N.sb);this.a=N.a.D.dk;for(var e in N.a.R.dk)this.a[e]=N.a.R.dk[e];this.L=a;this.S=b;this.ca=c;this.tl="entering";this.ut=!1;this.ka=Rg(N.d);this.ka.Gc===this.ka.xe&&(this.ek=!0);J(this,!1);Kb(this,"LevelStartDialog")}function Uh(a){"leaving"!==a.tl&&(a.tl="leaving",Z(a.c,"y",-a.c.height,a.a.Nj,a.a.Oj,function(){I.q(a);a.ca?a.S.call(a.ca):a.S&&a.S()}))}d=Th.prototype;
d.Sb=function(){var a,b,c,e,g,h,k;a=this;b=this.a.Pc;c=void 0!==b?b.width:O(600);e=void 0!==b?b.height:O(700);g=function(a,b,g,h,k,E,s){var t;t=T.M();void 0!==b&&C(t,b);b=Na(t,a,g,h,k);t.fontSize>b&&D(t,b);E=N.b.fa(E,c,t.da(a,k),t.align);s=N.b.fa(s,e,t.X(a,k),t.align);t.p(a,E,s,k?g:void 0)};this.c=new xh(this.depth+10,this.Ia,new x(c,e));y(this.c.f);void 0!==b&&b.p(0,0,0);b=this.ek?this.ka.Vs?N.i.r("challengeStartScreenTitle_challenger_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):N.i.r("challengeStartScreenTitle_challenger_friend",
"<CHALLENGESTARTSCREENTITLE_CHALLENGER>"):this.ka.Vs?N.i.r("challengeStartScreenTitle_challengee_stranger","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>"):N.i.r("challengeStartScreenTitle_challengee_friend","<CHALLENGESTARTSCREENTITLE_CHALLENGEE>");g(b,this.a.Zb,this.a.rd,this.a.le,!0,this.a.Me,this.a.hc);if(this.ek)for(b="",h=1;h<this.ka.kd.length;h++)k=this.ka.kd[h],b=13<k.length?b+(k.substr(0,10)+"..."):b+k,h+1<this.ka.kd.length&&(b+=", ");else k=this.ka.kd[this.ka.xe],b=13<k.length?k.substr(0,10)+"...":
k;g(b,this.a.Zr,this.a.Uw,this.a.Tw,!1,this.a.Xw,this.a.Yw);this.ek?b=N.i.r(this.L+"_challenger","<"+this.L.toUpperCase()+"_CHALLENGER>"):(b=N.i.r(this.L,"<"+this.L.toUpperCase()+">"),k=this.ka.kd[this.ka.xe],b=b.replace("<NAME>",13<k.length?k.substr(0,10)+"...":k));g(b,this.a.ts,this.a.Qx,this.a.Px,!1,this.a.Rx,this.a.Sx);this.ek||(b=Vh(this.ka.ah[0]),g(b,this.a.ss,this.a.Vx,this.a.Ux,!1,this.a.Xx,this.a.Yx));b=N.i.r("challengeStartScreenToWin","<CHALLENGESTARTSCREENTOWIN>");g(b,this.a.Rt,this.a.mz,
this.a.lz,!0,this.a.nz,this.a.oz);b=this.ka.Nt+"";g(b,this.a.Qt,this.a.qz,this.a.pz,!1,this.a.rz,this.a.sz);z(this.c.f);this.c.x=N.b.g(this.a.gs,this.canvas.width,c)+this.a.Jf;this.c.y=-this.c.height;Z(this.c,"y",N.b.g(this.a.ro,this.canvas.height,this.c.f.height)+Math.abs(N.ra),this.a.se,this.a.Mj,function(){a.tl="paused"});H.play(ag);this.n=0};d.zb=function(){I.q(this.c)};d.ua=function(a){"paused"!==this.state&&(this.n+=a,this.n>=this.a.js&&Uh(this))};d.Ab=function(){return this.ut=!0};
d.Tb=function(){this.ut&&"paused"===this.tl&&Uh(this);return!0};function xh(a,b,c){this.depth=a;this.k=this.visible=!0;N.b.bb(this,b);this.f=c;this.Eb=0;this.width=c.width;this.height=c.height;this.gc=this.fc=this.y=this.x=0;this.La=this.wa=1;this.Sa=0;this.alpha=1;this.ob=[];this.Sp=0;this.parent={x:0,y:0};this.Rb=!0;J(this,!1)}
function Z(a,b,c,e,g,h,k,l,n){var q,w=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.wa;break;case "yScale":q=a.La;break;case "scale":b="xScale";q=a.wa;Z(a,"yScale",c,e,g,void 0,k,l,n);break;case "angle":q=a.Sa;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.ob.push({id:a.Sp,n:0,k:!0,lk:w,type:b,start:q,end:c,pb:h,duration:e,gb:g,Ca:k,loop:l,cw:n});a.Sp++}
function lh(a){var b;for(b=a.ob.length-1;0<=b;b--){switch(a.ob[b].type){case "x":a.x=a.ob[b].end;break;case "y":a.y=a.ob[b].end;break;case "xScale":a.wa=a.ob[b].end;break;case "yScale":a.La=a.ob[b].end;break;case "angle":a.Sa=a.ob[b].end;break;case "alpha":a.alpha=a.ob[b].end;break;case "subImage":a.Eb=a.ob[b].end}"function"===typeof a.ob[b].pb&&a.ob[b].pb.call(a)}}
xh.prototype.ua=function(a){var b,c,e;for(b=0;b<this.ob.length;b++)if(c=this.ob[b],c.k&&(c.n+=a,c.lk&&c.n>=c.Ca&&(c.n%=c.Ca,c.lk=!1),!c.lk)){c.n>=c.duration?(e=c.end,c.loop?(c.lk=!0,c.Ca=c.cw,c.n%=c.duration):("function"===typeof c.pb&&c.pb.call(this),this.ob[b]=void 0)):"subImage"===c.type?(e=this.f instanceof Array?this.f.length:this.f.H,e=Math.floor(c.n*e/c.duration)):e=c.gb(c.n,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=e;break;case "y":this.y=e;break;case "xScale":this.wa=
e;break;case "yScale":this.La=e;break;case "angle":this.Sa=e;break;case "alpha":this.alpha=e;break;case "subImage":this.Eb=e}this.canvas.Z=!0}for(b=this.ob.length-1;0<=b;b--)void 0===this.ob[b]&&this.ob.splice(b,1)};
xh.prototype.Ua=function(){var a,b,c;b=Math.round(this.x-this.wa*this.fc)+this.parent.x;c=Math.round(this.y-this.La*this.gc)+this.parent.y;a=this.f;a instanceof Array&&(a=this.f[this.Eb%this.f.length]);a instanceof x?a.Da(b,c,this.wa,this.La,this.Sa,this.alpha):a.Da(this.Eb,b,c,this.wa,this.La,this.Sa,this.alpha);this.Rb=!1};
function qh(a,b,c,e,g,h,k,l,n,q,w){this.depth=g;this.visible=!0;this.k=!1;N.b.bb(this,N.sb);this.x=a;this.y=b;this.$n=l;this.ao="object"===typeof n?n.top:n;this.hw="object"===typeof n?n.bottom:n;this.da=c;this.X=e;this.width=this.da+2*this.$n;this.height=this.X+this.ao+this.hw;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof w?w:function(a){return a+""};this.alpha=1;this.Nf=this.Mf=this.gc=this.fc=0;c=new x(this.width,this.height);this.Zc=new xh(this.depth,this.Ia,
c);this.Zc.x=a-this.$n;this.Zc.y=b-this.ao;this.Zc.parent=q;this.Pa=this.Zc.f;this.Ie();J(this)}qh.prototype.zb=function(){I.q(this.Zc)};function Ah(a,b,c){a.k=!0;a.Ze=a.value;a.value=a.Ze;a.end=b;a.duration=c;a.gb=L;a.n=0}
qh.prototype.Ie=function(){var a,b;a=this.font.align;b=this.font.h;var c=this.$n,e=this.ao;this.Wp||(this.Pa.clear(),this.canvas.Z=!0);y(this.Pa);this.Wp&&this.Wp.ma(0,this.Jz,this.Kz,this.Iz,this.Hz,0,0,1);"center"===a?c+=Math.round(this.da/2):"right"===a&&(c+=this.da);"middle"===b?e+=Math.round(this.X/2):"bottom"===b&&(e+=this.X);b=this.toString(this.value);a=Na(this.font,b,this.da,this.X,!0);a<this.font.fontSize&&D(this.font,a);this.font.p(b,c,e,this.da);z(this.Pa);this.Zc.Rb=!0};
qh.prototype.ua=function(a){var b;b=Math.round(this.gb(this.n,this.Ze,this.end-this.Ze,this.duration));this.n>=this.duration?(this.value=this.end,this.k=!1,this.Ie()):b!==this.value&&(this.value=b,this.Ie());this.n+=a};function Gh(a,b,c){this.depth=-100;this.visible=!1;this.k=!0;this.yx=a;N.b.bb(this,N.sb);this.a=N.a.D.$c;this.cc=N.a.D.Ob;this.fq=b;for(var e in N.a.R.$c)this.a[e]=N.a.R.$c[e];this.so=!1!==c;J(this)}d=Gh.prototype;d.pt=function(){};
d.ai=function(a,b,c,e,g){b=new Wg("default_text",b,c,this.depth-20,a.L||"NO_TEXT_KEY_GIVEN",e,{S:function(){a.S&&(a.ca?a.S.call(a.ca,a):a.S(a))},ca:this},this.c);this.buttons.push(b);a.text&&b.oj(b.f,a.text);this.buttons[this.buttons.length-1].hb=g||!1};
d.Ga=function(a,b,c){y(this.c.f);p.clear();this.a.backgroundImage.p(0,0,0);a=c?c:this.yx;b=T.M();this.a.xo&&C(b,this.a.xo);c=Na(b,a,this.a.El,this.a.Dl,!0);c<b.fontSize&&D(b,c);c=b.da(a,this.a.El)+10;var e=b.X(a,this.a.Dl)+10;b.p(a,N.b.fa(this.a.Dx,this.c.f.width,c,b.align),N.b.fa(this.a.os,this.c.f.height-Wh(this),e,b.h),c);z(this.c.f)};function Wh(a){var b=a.fq;return N.b.g(a.a.vg,a.c.f.height,a.cc.default_text.t.height*b.length+a.a.wd*(b.length-1))}
d.Xe=function(a,b){var c,e,g,h,k,l,n,q,w,A=[],A=this.fq;g=this.cc.default_text.t.height;h=this.a.$j;k=N.b.g(this.a.Zj,this.canvas.width,h)-a;q=Wh(this);for(c=A.length-1;0<=c;c--){n=k;w=h;if("object"===typeof A[c]&&A[c].hasOwnProperty("length")&&A[c].length)for(l=A[c],w=(h-(l.length-1)*this.a.wd)/l.length,e=0;e<l.length;e++)this.ai(l[e],n,q,w,b),n+=w+this.a.wd;else this.ai(A[c],n,q,w,b);q-=g+this.a.wd}};
d.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Mo(!0);this.c.visible=!0};d.close=function(){I.q(this);return this.canvas.Z=!0};function Xh(a){var b=N.d.re;b.Ga(b.c.x,b.c.y,a);for(a=0;a<b.buttons.length;a++)I.q(b.buttons[a]);b.canvas.Z=!0}
d.Sb=function(){var a,b;this.so&&wh(this);a=this.a.backgroundImage;this.c=new xh(this.depth-10,this.Ia,new x(a.width,a.height));this.c.x=N.b.g(this.a.Yb,this.canvas.width,a.width);a=N.b.g(this.a.ub,this.canvas.height,a.height)+-1*("landscape"===N.orientation?N.a.D.bk:N.a.D.Sd).kl;this.c.y=a;this.Ga(this.c.x,this.c.y);this.buttons=[];this.Xe(this.c.x);b=this;this.c.y=-this.c.f.height;Z(this.c,"y",a,this.a.Gf,this.a.Hf,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].hb=!0})};
d.zb=function(){var a;this.so&&Bh();for(a=0;a<this.buttons.length;a++)I.q(this.buttons[a]);I.q(this.c);N.d.Qd===this&&(N.d.Qd=null)};d.Tb=function(){return!0};d.Ab=function(){return!0};
function Yh(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,e,g=0;c=e=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)e++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(e>c&&(b+=a.slice(c,e)),b+=l,c=e=h+1)}e>c&&(b+=a.slice(c,g));return b}
function Pg(a){function b(a){var b="",c="",e;for(e=0;3>=e;e++)c=a>>>8*e&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,e,g,h,l){a=k(a,k(k(c^(b|~e),g),l));return k(a<<h|a>>>32-h,b)}function e(a,b,c,e,g,h,l){a=k(a,k(k(b^c^e,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,e,g,h,l){a=k(a,k(k(b&e|c&~e,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,e,g,h,l){a=k(a,k(k(b&c|~b&e,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,e,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;e=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&e?k^2147483648^g^h:c|e?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,w,A,E,s,t,u,v;a=Yh(a);l=function(a){var b,c=a.length;b=c+8;for(var e=16*((b-b%64)/64+1),g=Array(e-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[e-2]=c<<3;g[e-1]=c>>>29;return g}(a);s=1732584193;t=4023233417;u=2562383102;v=271733878;a=l.length;for(n=0;n<a;n+=16)q=s,w=t,A=u,E=v,s=h(s,t,u,v,l[n+
0],7,3614090360),v=h(v,s,t,u,l[n+1],12,3905402710),u=h(u,v,s,t,l[n+2],17,606105819),t=h(t,u,v,s,l[n+3],22,3250441966),s=h(s,t,u,v,l[n+4],7,4118548399),v=h(v,s,t,u,l[n+5],12,1200080426),u=h(u,v,s,t,l[n+6],17,2821735955),t=h(t,u,v,s,l[n+7],22,4249261313),s=h(s,t,u,v,l[n+8],7,1770035416),v=h(v,s,t,u,l[n+9],12,2336552879),u=h(u,v,s,t,l[n+10],17,4294925233),t=h(t,u,v,s,l[n+11],22,2304563134),s=h(s,t,u,v,l[n+12],7,1804603682),v=h(v,s,t,u,l[n+13],12,4254626195),u=h(u,v,s,t,l[n+14],17,2792965006),t=h(t,u,
v,s,l[n+15],22,1236535329),s=g(s,t,u,v,l[n+1],5,4129170786),v=g(v,s,t,u,l[n+6],9,3225465664),u=g(u,v,s,t,l[n+11],14,643717713),t=g(t,u,v,s,l[n+0],20,3921069994),s=g(s,t,u,v,l[n+5],5,3593408605),v=g(v,s,t,u,l[n+10],9,38016083),u=g(u,v,s,t,l[n+15],14,3634488961),t=g(t,u,v,s,l[n+4],20,3889429448),s=g(s,t,u,v,l[n+9],5,568446438),v=g(v,s,t,u,l[n+14],9,3275163606),u=g(u,v,s,t,l[n+3],14,4107603335),t=g(t,u,v,s,l[n+8],20,1163531501),s=g(s,t,u,v,l[n+13],5,2850285829),v=g(v,s,t,u,l[n+2],9,4243563512),u=g(u,
v,s,t,l[n+7],14,1735328473),t=g(t,u,v,s,l[n+12],20,2368359562),s=e(s,t,u,v,l[n+5],4,4294588738),v=e(v,s,t,u,l[n+8],11,2272392833),u=e(u,v,s,t,l[n+11],16,1839030562),t=e(t,u,v,s,l[n+14],23,4259657740),s=e(s,t,u,v,l[n+1],4,2763975236),v=e(v,s,t,u,l[n+4],11,1272893353),u=e(u,v,s,t,l[n+7],16,4139469664),t=e(t,u,v,s,l[n+10],23,3200236656),s=e(s,t,u,v,l[n+13],4,681279174),v=e(v,s,t,u,l[n+0],11,3936430074),u=e(u,v,s,t,l[n+3],16,3572445317),t=e(t,u,v,s,l[n+6],23,76029189),s=e(s,t,u,v,l[n+9],4,3654602809),
v=e(v,s,t,u,l[n+12],11,3873151461),u=e(u,v,s,t,l[n+15],16,530742520),t=e(t,u,v,s,l[n+2],23,3299628645),s=c(s,t,u,v,l[n+0],6,4096336452),v=c(v,s,t,u,l[n+7],10,1126891415),u=c(u,v,s,t,l[n+14],15,2878612391),t=c(t,u,v,s,l[n+5],21,4237533241),s=c(s,t,u,v,l[n+12],6,1700485571),v=c(v,s,t,u,l[n+3],10,2399980690),u=c(u,v,s,t,l[n+10],15,4293915773),t=c(t,u,v,s,l[n+1],21,2240044497),s=c(s,t,u,v,l[n+8],6,1873313359),v=c(v,s,t,u,l[n+15],10,4264355552),u=c(u,v,s,t,l[n+6],15,2734768916),t=c(t,u,v,s,l[n+13],21,
1309151649),s=c(s,t,u,v,l[n+4],6,4149444226),v=c(v,s,t,u,l[n+11],10,3174756917),u=c(u,v,s,t,l[n+2],15,718787259),t=c(t,u,v,s,l[n+9],21,3951481745),s=k(s,q),t=k(t,w),u=k(u,A),v=k(v,E);return(b(s)+b(t)+b(u)+b(v)).toLowerCase()}var yh;
function Zh(a,b){var c=N.B.Nk.url+"api";try{var e=new XMLHttpRequest;e.open("POST",c);e.setRequestHeader("Content-Type","application/x-www-form-urlencoded");e.onload=function(){"application/json"===e.getResponseHeader("Content-Type")&&b(JSON.parse(e.responseText))};e.onerror=function(a){console.log("error: "+a)};e.send(a)}catch(g){}}function $h(a){Zh("call=api_is_valid",function(b){a(b.is_valid)})}
function zh(a,b){Zh("call=is_highscore&score="+a,function(a){0<=a.position?(yh=a.code,b(void 0!==yh)):b(!1)})}
TG_StatObjectFactory={Yz:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},Wz:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,ai(),ai(),!0)},Vz:function(a,b,c,e,g){return new TG_StatObject(a,b,c,0,e,g,!0,"max"===N.j.ff?function(a){return a+e}:function(a){return a-e})},Xz:function(a,b,c,e,g){return new TG_StatObject(a,b,c,0,e,g,!0,"max"===N.j.ff?function(a){return a-e}:function(a){return a+e})}};
TG_StatObject=function(a,b,c,e,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.nc=e;this.Uf=void 0!==g?g:this.nc;this.visible=void 0!==h?h:!0;this.te=void 0!==k?k:this.nc!==this.Uf;this.Oe=l;this.Yl=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return N.b.ij(1E3*a)}}};
TG_StatObject.prototype.M=function(){return new TG_StatObject(this.id,this.type,this.key,this.nc,this.Uf,this.visible,this.te,this.Oe,this.Yl)};N.version=N.version||{};N.version.tg="2.13.0";function bi(a){this.depth=-99;N.b.bb(this,N.sb);this.k=!0;this.visible=!1;this.d=a;J(this)}bi.prototype.Kk=function(){};bi.prototype.Lg=function(){};bi.prototype.Ab=function(a,b,c){a:{var e=this.d,g;for(g=0;g<e.zc.length;++g)if(e.zc[g].Ab&&e.zc[g].Ab(a,b,c)){a=!0;break a}a=!1}return a};
bi.prototype.Tb=function(a,b,c){var e;a:if(e=this.d,e.cb&&a===e.lp)a=e.cb.a.x,b=e.cb.a.y,e.cb.qo&&(a=e.cb.qo.x,b=e.cb.qo.y),ci?console.log("Component:\n x: tgScale("+(a+e.cb.ig.x-di)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+e.cb.ig.y-ei)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+e.cb.ig.x)+"),\n y: tgScale("+(b+e.cb.ig.y)+"),"),e.Et=!1,e=!0;else{for(var g=0;g<e.zc.length;++g)if(e.zc[g].Tb&&e.zc[g].Tb(a,b,c)){e=!0;break a}e=!1}return e};
function fi(){this.Ia=this.depth=0;this.Xm=this.Kb=this.k=this.visible=!1;this.zc=[];this.wk={};this.wk.fe=!1;this.Eq={};this.paused=this.Eq.fe=!1;this.Fy=new x(0,0);this.Hy=this.Gy=0;this.cb=null;this.lp=this.Gt=this.Ft=-1;this.Et=!1;this.Db=this.Cb=0;this.Tk=null}d=fi.prototype;d.Sb=function(){this.Tk=new bi(this)};d.zb=function(){this.Tk&&(I.q(this.Tk),this.Tk=null)};
function gi(a,b,c){for(var e in b){var g=b[e];g.f?c[e]=new hi(a,g):g.kt?c[e]=new ii(a,N.i.r(g.kt,"<"+g.kt+">"),g):g.L?c[e]=new ii(a,N.i.r(g.L,"<"+g.L+">"),g):g.text&&(c[e]=new ii(a,g.text,g))}}function ji(a,b){a.fe&&(a.n+=b,a.n>=a.duration&&(a.fe=!1,a.pb&&a.pb()))}
d.ua=function(a){ji(this.wk,a);ji(this.Eq,a);for(var b=0;b<this.zc.length;++b)this.zc[b].ua(a);if(this.cb&&this.Et){a=I.ja[this.lp].x;b=I.ja[this.lp].y;this.canvas===N.b.Zd(N.xi)&&this.cb.Hk(this.Cb+N.rf,this.Db+N.Ae);var c=a-this.Ft,e=b-this.Gt;this.cb.x+=c;this.cb.y+=e;this.cb.ig.x+=c;this.cb.ig.y+=e;this.Ft=a;this.Gt=b;this.Kb=!0}};d.pc=function(){if(this.Kb){var a=N.b.Zd(N.xi);this.canvas!==a?this.canvas.Z=this.Kb:(p.mb(a),this.Ua())}};
d.qk=function(a,b){for(var c=N.b.Zd(N.xi)===this.canvas,e=0;e<this.zc.length;++e){var g=this.zc[e];g.visible&&(c&&g.Hk(a,b),g.Ua(a,b))}};d.Ua=function(){var a=0,b=0;N.b.Zd(N.Fk)!==this.canvas&&(a=N.rf,b=N.Ae);this.paused?this.Fy.p(this.Gy+this.Cb+a,this.Hy+this.Db+b):this.qk(this.Cb+a,this.Db+b);this.Kb=!1};function ki(){this.Mk=[];this.en=[];this.Pl=null;this.Hm=void 0;this.yk=!0}
function li(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(e(a))return!1}else for(g=0;g<a.length;++g)if(e(a[g]))return!1;if(b.cA){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function e(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof ki){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new ki,g.Mk=arguments[0],g.en=arguments[1],g.Pl=arguments[2];var h=null,k=null,l=null,h=g.Mk,k=g.en,l=g.Pl;this.eh=g;void 0===this.eh.Hm&&(this.eh.Hm=!Rg(N.d));fi.apply(this,arguments);J(this);this.k=this.visible=!0;k=k||[];h=h||[];this.dg=2;this.fy=!1;this.s=l||mi;this.pq=N.Fk;void 0!==this.s.Ia&&(this.pq=this.s.Ia);N.b.bb(this,this.pq);this.yj=this.xj=0;this.s.background.dr&&(this.xj=this.s.background.dr);this.s.background.er&&(this.yj=this.s.background.er);this.s.background.elements||
(this.Xc=this.s.background.f);this.s.background.Gz?(gi(this,this.s.background.elements,{}),this.Xc=this.s.background.f):(g=this.s.background.f,l=new fi,gi(l,this.s.background.elements,[]),g||this.Ia!==N.xi?(this.Xc=new x(g.width,g.height),y(this.Xc),g.p(0,0,0),l.qk(-this.xj,-this.yj),z(this.Xc)):(p.mb(N.b.Zd(this.Ia)),l.Ua()));var n=this;this.lr=0;b("score",this.s.rs)?(this.Ll=new ni(this,this.s.rs,"SCORE",0,!0),this.s.Tx&&new hi(this,this.s.Tx)):this.Ll=new oi(0,0);this.sf=b("highScore",this.s.Zq)?
new ni(this,this.s.Zq,"HIGHSCORE",0,!1):new oi(0,0);b("highScore",this.s.br)&&new hi(this,this.s.br);b(["stage","level"],this.s.oy)&&new ni(this,this.s.oy,"STAGE",0,!1);b("lives",this.s.Tv)&&new ni(this,this.s.Tv,"LIVES",0,!1);this.hj=b("time",this.s.time)?new ni(this,this.s.time,"TIME",0,!1,function(a){return n.ij(a)}):new oi(0,0);this.hj.Qf(36E4);if(this.s.ld&&this.s.ns)throw"Don't define both progress and progressFill in your game_ui settings";b("progress",this.s.ld)?this.s.ld.round?new pi(this,
this.s.ld):new qi(this,this.s.ld):b("progress",this.s.ns)&&new qi(this,this.s.ns);b("lives",this.s.Cv)&&new hi(this,this.s.Cv);b("difficulty",this.s.K)?new ii(this,ri().toUpperCase(),this.s.K):ri();b("difficulty",this.s.Eg)&&(g=fd,g=(this.s.Eg.images?this.s.Eg.images:[gd,fd,ed])[Tg()],this.s.Eg.f||(this.s.Eg.f=g),this.Qu=new hi(this,this.s.Eg),this.Qu.zs(g));this.s.vf&&!this.s.vf.length&&(this.s.vf=[this.s.vf]);this.s.$d&&!this.s.$d.length&&(this.s.$d=[this.s.$d]);this.pr=[];this.qr=[];this.pr[0]=
b(["item","item0"],this.s.vf)?new hi(this,this.s.vf[0]):new oi(0,"");this.qr[0]=b(["item","item0"],this.s.$d)?new ii(this,"",this.s.$d[0]):new oi(0,"");if(this.s.vf&&this.s.$d)for(g=1;g<this.s.$d.length;++g)b("item"+g,this.s.$d[g])&&(this.qr[g]=new ii(this,"0 / 0",this.s.$d[g]),this.pr[g]=new hi(this,this.s.vf[g]));for(var q in this.s)g=this.s[q],g.L&&new ii(this,N.i.r(g.L,"<"+g.L+">")+(g.separator?g.separator:""),g);this.Fr=this.nt=0;this.buttons={};for(q in this.s.buttons)g=si(this,this.s.buttons[q]),
this.buttons[q]=g;this.s.is&&(g=si(this,this.s.is),this.buttons.pauseButton=g);this.Tm={};for(q in this.s.Tm)g=this.s.Tm[q],g=new ti[g.Sz](this,g),this.Tm[q]=g;this.Db=this.Cb=0}wg(fi,li);var ti={};function si(a,b){var c=new ui(a,b,b.aa);a.zc.push(c);c.oA=b;return c}d=li.prototype;d.Lo=function(a,b){this.buttons[b||"pauseButton"].Lo(a)};d.ij=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.fy?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};
d.setTime=function(a){this.hj.Qf(a);return this};d.getTime=function(){return this.hj.ha()};d.Em=function(a){a=this.Ll.ha()+a;this.Ll.Qf(a);this.eh.Hm&&(this.sf.ha()<a?this.sf.Qf(a):a<this.sf.ha()&&this.sf.Qf(Math.max(a,this.lr)));return this};d.zb=function(){fi.prototype.zb.apply(this,arguments);p.mb(this.canvas);p.clear();for(var a in this.buttons)I.q(this.buttons[a])};
d.ua=function(a){1===this.dg&&this.setTime(this.getTime()+a);if(2===this.dg){if(this.nt&&1E3*this.nt>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.hj,b.qc.n=0,b.qc.Xl=!0,b.font.setFillColor(b.qc.color),b.Ie(),"undefined"!==typeof a_gameui_timewarning_second&&H.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}fi.prototype.ua.apply(this,arguments);this.Fr+=a};
d.qk=function(a,b){this.Xc&&(this.Xc instanceof r?this.Xc.bd(0,a+this.xj,b+this.yj,1):this.Xc.bd(a+this.xj,b+this.yj,1));fi.prototype.qk.apply(this,arguments);this.Xm&&this.Xc&&pa(a,b,this.Xc.width,this.Xc.height,"blue",!0)};
function vi(a,b,c,e,g,h){this.d=a;this.width=g;this.height=h;this.Pa=null;this.x=c;this.y=e;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.P={};this.P.Cb=0;this.P.Db=0;this.P.scale=this.scale;this.P.alpha=this.alpha;this.P.Sa=0;this.F={};this.F.fe=!1;this.F.origin={};this.F.target={};this.F.n=0;this.a.wk&&(wi(this,this.a.wk),this.F.fe=!1);this.d.zc.push(this);xi||(xi={Vb:function(a){a.value instanceof x?a.Pa=a.value:(a.f=a.value,a.Eb=0)},
update:$.Wd,dc:$.Ud,end:$.Vd,Jc:L,Kc:L,Ic:function(a,b,c,e){return 1-bc(a,b,c,e)},rk:function(a,b,c,e){return 1*bc(a,b,c,e)+1},sk:function(a,b,c,e){return 1*bc(a,b,c,e)+1}})}var xi;
function wi(a,b){a.F.origin.x=void 0===b.x?a.x:b.x;a.F.origin.y=void 0===b.y?a.y:b.y;a.F.origin.alpha=void 0!==b.alpha?b.alpha:1;a.F.origin.scale=void 0!==b.scale?b.scale:1;a.F.target.x=a.x;a.F.target.y=a.y;a.F.target.alpha=a.alpha;a.F.target.scale=a.scale;a.F.duration=b.duration;a.F.fe=!0;a.F.ye=b.ye||bc;a.F.n=0;a.F.Ca=b.Ca||0;yi(a)}
function yi(a){a.F.n>=a.F.duration&&(a.F.n=a.F.duration,a.F.fe=!1);var b=a.F.ye(a.F.n,a.F.origin.x,a.F.target.x-a.F.origin.x,a.F.duration),c=a.F.ye(a.F.n,a.F.origin.y,a.F.target.y-a.F.origin.y,a.F.duration);a.P.Cb=b-a.x;a.P.Db=c-a.y;a.P.alpha=a.F.ye(a.F.n,a.F.origin.alpha,a.F.target.alpha-a.F.origin.alpha,a.F.duration);a.P.scale=a.F.ye(a.F.n,a.F.origin.scale,a.F.target.scale-a.F.origin.scale,a.F.duration);a.d.Kb=!0}d=vi.prototype;
d.Ua=function(a,b){this.Pa&&this.Pa.Da(this.x+this.P.Cb+a,this.y+this.P.Db+b,this.P.scale,this.P.scale,0,this.P.alpha)};d.Hk=function(a,b){zi(this.x+this.P.Cb+a,this.y+this.P.Db+b,this.width*this.P.scale,this.height*this.P.scale)};d.Wk=function(a,b){return a>this.x+this.P.Cb&&a<this.x+this.P.Cb+this.width*this.P.scale&&b>this.y+this.P.Db&&b<this.y+this.P.Db+this.height*this.P.scale};d.Mo=function(a){this.visible!==a&&(this.visible=a,this.d.Kb=!0)};
d.ua=function(a){this.F.fe&&(0<this.F.Ca?this.F.Ca-=a:(this.F.n+=-this.F.Ca,this.F.Ca=0,this.F.n+=a,yi(this)))};function oi(a,b){this.ld=this.value=this.Sk=b}d=oi.prototype;d.Qf=function(a){this.value=a};d.ha=function(){return this.value};d.zs=function(){};d.ys=function(){};d.xs=function(){};
function hi(a,b){this.qo=b;this.a={};for(var c in b)this.a[c]=b[c];this.f=this.a.f;this.H=0;this.xg=this.a.xg;this.a.$s&&(this.a.x+=this.f.Hb,this.a.y+=this.f.Ib);vi.call(this,a,this.a,this.a.x,this.a.y,this.f?this.f.width:1,this.f?this.f.height:1)}wg(vi,hi);ti.GameUIImage=hi;function Ai(a,b){a.H!==b&&(a.H=b,a.d.Kb=!0)}d=hi.prototype;
d.Ua=function(a,b){this.f&&(this.xg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),this.f instanceof r?this.f.Da(this.H,this.x+a+this.P.Cb,this.y+b+this.P.Db,this.P.scale,this.P.scale,0,this.P.alpha):this.f.Da(this.x+a+this.P.Cb,this.y+b+this.P.Db,this.P.scale,this.P.scale,0,this.P.alpha),this.d.Xm&&pa(this.x+a-this.f.Hb+1,this.y+b-this.f.Ib+1,this.f.width-2,this.f.height-2,"black",!0))};
d.Wk=function(a,b){if(!this.f)return!1;var c=0,e=0;this.xg&&(c+=-Math.floor(this.f.width/2),e+=-Math.floor(this.f.height/2));c-=this.f.Hb;e-=this.f.Ib;return a>c+this.x+this.P.Cb&&a<c+this.x+this.P.Cb+this.width*this.P.scale&&b>e+this.y+this.P.Db&&b<e+this.y+this.P.Db+this.height*this.P.scale};d.Hk=function(a,b){this.f&&(this.xg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),a-=this.f.Hb,b-=this.f.Ib,zi(this.x+this.P.Cb+a,this.y+this.P.Db+b,this.width*this.P.scale,this.height*this.P.scale))};
d.Cn=function(a){a||(a=new ca(0,0));a.x=this.x+N.rf+this.d.Cb;a.y=this.y+N.Ae+this.d.Db;return a};d.zs=function(a){a!==this.f&&(this.f=a,this.d.Kb=!0,this.f&&(this.width=this.f.width,this.height=this.f.height))};
function ii(a,b,c){"object"===typeof b&&(c=b,b=c.L?N.i.r(c.L,"<"+c.L+">"):c.text||"");this.text=b;this.font=c.font.M();c.ze&&C(this.font,c.ze);this.es=c.x;this.fs=c.y;this.ds=c.Fb;this.ix=this.font.fillColor;this.Jd=void 0===c.Jd?.2:c.Jd;vi.call(this,a,c,Math.floor(c.x-.1*c.Fb),Math.floor(c.y-.1*c.Jb),Math.floor(1.2*c.Fb),Math.floor(1.2*c.Jb));this.Pa=new x(this.width,this.height);switch(this.font.align){case "left":this.ag=Math.floor(.1*c.Fb);break;case "right":this.ag=Math.floor(1.1*c.Fb);break;
case "center":this.ag=Math.floor(.6*c.Fb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.Jd*this.font.fontSize);switch(this.font.h){case "top":this.bg=Math.floor(.1*c.Jb);break;case "bottom":this.bg=Math.floor(1.1*c.Jb)+a;break;case "middle":this.bg=Math.floor(.6*c.Jb)+a;break;default:throw"Unknown baseline: "+this.font.h;}this.qc={};this.qc.color="red";this.qc.duration=200;this.qc.n=0;this.qc.Xl=!1;this.Ie()}wg(vi,ii);ti.GameUIText=ii;
ii.prototype.ua=function(a){vi.prototype.ua.apply(this,arguments);this.qc.Xl&&(this.qc.n+=a,this.qc.duration<=this.qc.n&&(this.qc.Xl=!1,this.font.setFillColor(this.ix),this.Ie()))};
ii.prototype.Ie=function(){this.Pa.clear();y(this.Pa);var a=this.font.da(this.text),b=1;a>this.ds&&(b=this.ds/a);this.font.Da(this.text,this.ag,this.bg,b,b,0,1);this.d.Xm&&(pa(0,0,this.Pa.width,this.Pa.height,"black",!0),pa(this.es-this.x,this.fs-this.y,this.Pa.width-2*(this.es-this.x),this.Pa.height-2*(this.fs-this.y),"red",!0),qa(this.ag-5,this.bg,this.ag+5,this.bg),qa(this.ag,this.bg-5,this.ag,this.bg+5));this.d.Kb=!0;z(this.Pa)};function Bi(a){return""+a}function Ci(a,b,c){return b+c}
function ni(a,b,c,e,g,h){this.value=this.Sk=e||0;this.nm=-1;this.Jt=c;this.a=b;this.It=-99999;this.bp=b.bp||0;this.vi=b.vi?b.vi:h||Bi;c=Ci;g&&0!==this.a.yq&&(c=cc);this.Ha=new xg(this.Sk,void 0===this.a.yq?500:this.a.yq,c);b.Dg&&(this.Dg="game_ui_"+b.Dg);this.text=Di(this)+this.vi(this.Sk);ii.call(this,a,this.text,b)}wg(ii,ni);ti.GameUIValue=ni;d=ni.prototype;d.Qf=function(a){this.value=a;zg(this.Ha,this.value)};d.ys=function(a){a||(a=Bi);this.vi=a;this.pj(!0)};d.xs=function(a){this.Dg=a;this.pj(!0)};
d.ha=function(){return this.value};d.pj=function(a){var b=this.nm;if(a||I.Ek-this.It>this.bp)b=this.vi(Math.floor(this.Ha.ha()));this.nm!==b&&(this.It=I.Ek,this.nm=b,this.text=Di(this)+b,this.Ie())};d.ua=function(a){ii.prototype.ua.apply(this,arguments);yg(this.Ha,a);Math.floor(this.Ha.ha())!==this.nm&&this.pj()};function Di(a){var b="";a.a.mm&&(b=a.Dg?N.i.r(a.Dg,"<"+a.Dg.toUpperCase()+">"):N.i.r("game_ui_"+a.Jt,"<"+a.Jt+">"));return b+(a.a.separator?a.a.separator:"")}
function qi(a,b){this.Lm=this.ld=0;this.a=b;this.Ui=this.Lf=0;this.f=b.f;this.ve=b.ve||b.f;this.On=b.On||null;this.a.Jf=this.a.Jf||0;this.a.Yg=this.a.Yg||0;this.Gm=!0;this.Cl=b.Cl||0;this.N=[];this.Ha=new xg(0,200,M);this.Cc=new xg(0,200,M);vi.call(this,a,b,b.x,b.y,this.f.width,this.f.height)}wg(vi,qi);ti.GameUIProgress=qi;
qi.prototype.ua=function(a){yg(this.Ha,a);var b=this.Ha.ha();b!==this.Lf&&(this.d.Kb=!0,this.Lf=b);yg(this.Cc,a);a=this.Cc.ha();a!==this.Ui&&(this.d.Kb=!0,this.Ui=a);b+=a;if(this.Gm)for(a=0;a<this.N.length;++a){var c=b>=this.N[a].position&&this.ld+this.Lm>=this.N[a].position;this.N[a].complete!==c&&(this.a.N&&(this.d.Kb=!0,this.Lf=b),this.N[a].complete=c)}};
qi.prototype.Ua=function(a,b){var c,e,g;if(0===this.Cl&&(0<this.Cc.ha()&&this.ve.ma(0,this.width*this.Ha.ha()/100,0,this.ve.width*this.Cc.ha()/100,this.ve.height,a+this.x+this.width*this.Ha.ha()/100,b+this.y),this.f.ma(0,0,0,this.width*this.Ha.ha()/100,this.height,a+this.x,b+this.y),this.a.N))for(c=0;c<this.N.length;++c)e=this.N[c],g=e.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.width/100*e.position,b+this.y+this.a.N.y);if(1===this.Cl&&(0<this.Cc.ha()&&this.ve.ma(0,0,this.height-
this.height*this.Ha.ha()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.ha()/100)),this.f.ma(0,0,this.height-this.height*this.Ha.ha()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.ha()/100)),this.a.N))for(c=0;c<this.N.length;++c)e=this.N[c],g=e.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.a.N.x,b+this.y+this.height-this.height/100*e.position);if(2===this.Cl&&(0<this.Cc.ha()&&this.ve.ma(0,0,this.height*this.Ha.ha()/
100,this.ve.width,this.ve.height*this.Cc.ha()/100,a+this.x+this.width*this.Ha.ha()/100,b+this.y),this.f.ma(0,0,0,this.width,this.height*this.Ha.ha()/100,a+this.x,b+this.y),this.a.N))for(c=0;c<this.N.length;++c)e=this.N[c],g=e.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.p(0,a+this.x+this.a.N.x,b+this.y+this.height/100*e.position);this.On&&this.On.p(0,a+this.x+this.a.Jf,b+this.y+this.a.Yg)};function ui(a,b,c){this.jm=!1;this.kj=-1;this.d=a;this.a=b;this.k=!0;this.Lo(c);hi.call(this,a,b)}
wg(hi,ui);ti.GameUIButton=ui;ui.prototype.Lo=function(a){var b=null,c=null,e=this.d,g=this.a;void 0===a&&(a=g.aa?g.aa:0);switch(a){case 0:b=e.eh.yk?qd:rd;c=function(){Rg(N.d)?N.d.ge(!1,!0,e.eh.yk):N.d.ge();return!0};break;case 1:b=sd;c=function(){N.d.ge();return!0};break;case 2:b=s_btn_small_quit;c=function(){Ei(e.eh.yk);return!0};break;case 3:b=g.f}this.pb=c;this.a.f=b};ui.prototype.Ab=function(a,b,c){if(this.k)return this.Wk(b-N.rf,c-N.Ae)?(this.jm=!0,this.kj=a,Ai(this,1),!0):!1};
ui.prototype.ua=function(a){hi.prototype.ua.apply(this,arguments);this.jm&&(this.Wk(I.ja[this.kj].x-N.rf,I.ja[this.kj].y-N.Ae)?Ai(this,1):Ai(this,0))};ui.prototype.Tb=function(a,b,c){return this.jm&&a===this.kj?(Ai(this,0),this.Wk(b-N.rf,c-N.Ae)&&this.pb&&this.pb(),this.jm=!1,this.kj=-1,!0):!1};
function pi(a,b){this.Lm=this.ld=0;this.a=b;this.Ui=this.Lf=0;this.Gm=!0;this.N=[];this.color=b.color||"#00AEEF";this.aq=b.aq||"#FF0F64";this.$p=b.$p||"#FFED93";this.xu=void 0===b.blink||b.blink;this.Pc=b.Pc;this.ei=!1;this.$e=0;this.Wj=1E3;this.Xj=0;this.Ha=new xg(0,200,M);this.Cc=new xg(0,200,M);vi.call(this,a,b,b.x,b.y,1,1)}wg(vi,pi);ti.GameUIRoundProgress=pi;
pi.prototype.ua=function(a){yg(this.Ha,a);var b=this.Ha.ha();b!==this.Lf&&(this.d.Kb=!0,this.Lf=b);yg(this.Cc,a);var c=this.Cc.ha();c!==this.Ui&&(this.d.Kb=!0,this.Ui=c);this.ei&&(this.$e+=a,this.$e>=this.Wj?100===this.ld?(this.ei=!1,this.xu&&(this.ei?this.$e-=this.Wj:(this.ei=!0,this.Xj=this.$e=0,zg(this.Ha,100)))):(this.ei=!1,this.Xj=0,this.Ha.Hg=0,this.Ha.gm=0,zg(this.Ha,this.ld)):this.Xj=(-Math.cos(this.$e/this.Wj*5*Math.PI*2)+1)/2,this.d.Kb=!0);b+=c;if(this.Gm)for(a=0;a<this.N.length;++a)c=b>=
this.N[a].position&&this.ld+this.Lm>=this.N[a].position,this.N[a].complete!==c&&(this.a.N&&(this.d.Kb=!0,this.Lf=b),this.N[a].complete=c)};pi.prototype.Hk=function(a,b){this.Pc&&zi(this.x+this.P.Cb+a-this.Pc.Hb,this.y+this.P.Db+b-this.Pc.Ib,this.Pc.width*this.P.scale,this.Pc.height*this.P.scale)};
pi.prototype.Ua=function(a,b){var c,e;if(this.Pc){e=this.Ha.ha()/100;e=Math.max(e,0);e=Math.min(e,1);var g=p.context,h=this.Pc.width/2-O(4),k=g.fillStyle;if(0<this.Cc.ha()){var l=this.Cc.ha()/100;g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*e*Math.PI,2*(e+l)*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.aq;g.fill()}g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*e*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Wj&&(l=g.globalAlpha,
g.globalAlpha*=this.Xj,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*e*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.$p,g.fill(),g.globalAlpha=l);if(this.a.N){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=O(2);for(e=0;e<this.N.length;++e){c=this.N[e];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+
this.y+c));g.stroke()}g.strokeStyle=l;g.lineWidth=n}this.Pc.p(0,a+this.x,b+this.y);if(this.a.N)for(e=0;e<this.N.length;++e)c=this.N[e],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.p(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.N.Fx*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.N.Fx*.5));g.fillStyle=k}};N.version=N.version||{};N.version.game_ui="2.1.0";
var Fi=Fi||{},di=O(14),ei=O(40),ci={},Gi={background:{f:bd,dr:O(0),er:O(34),elements:[{f:dd,x:O(46)+di,y:O(16)+ei},{L:"game_ui_time_left",x:O(6)+di,y:O(52)+ei,Fb:O(100),Jb:O(20),Jd:.2,font:V,ze:{fillColor:"#9fa9bf",fontSize:O(20),zd:"lower",align:"center",h:"top"}},{f:ad,x:O(9,"round")+di,y:O(124)+ei},{L:"game_ui_SCORE",x:O(6)+di,y:O(140)+ei,Fb:O(100),Jb:O(20),Jd:.2,font:V,ze:{fillColor:"#9fa9bf",fontSize:O(20),zd:"lower",align:"center",h:"top"}},{f:ad,x:O(9,"round")+di,y:O(200)+ei},{L:"game_ui_HIGHSCORE",
x:O(6)+di,y:O(258)+ei,Fb:O(100),Jb:O(20),Jd:.2,font:V,ze:{fillColor:"#9fa9bf",fontSize:O(20),zd:"lower",align:"center",h:"top"}},{f:ad,x:O(9,"round")+di,y:O(318)+ei}]},is:{x:O(6)+di,y:O(538)-O(86)+ei},time:{x:O(6)+di,y:O(80)+ei,Fb:O(100),Jb:O(38),Jd:.2,mm:!1,separator:"",font:V,ze:{fontSize:O(38),fillColor:"#172348",align:"center",h:"top"}},rs:{x:O(6)+di,y:O(166)+ei,Fb:O(100),Jb:O(24),bp:50,Jd:.2,mm:!1,separator:"",font:V,ze:{fontSize:O(24),fillColor:"#172348",align:"center",h:"top"}},br:{x:O(43,
"round")+di,y:O(212)+ei,f:cd,xg:!1,$s:!0},Zq:{x:O(6)+di,y:O(284)+ei,Fb:O(100),Jb:O(20),Jd:.2,mm:!1,separator:"",font:V,ze:{fillColor:"#59668e",fontSize:O(20),align:"center",h:"top"}},K:{x:O(6)+di,y:O(362)+ei,Fb:O(100),Jb:O(40),Jd:.2,mm:!1,separator:"",font:V,ze:{fillColor:"#9fa9bf",fontSize:O(20),align:"center",h:"top",zd:"lower"}},Eg:{x:O(56)+di,y:O(340)+ei,f:fd,xg:!1,$s:!1}},mi=Gi,$={dm:{},ft:{},gt:{},ht:{},lo:{},mo:{},Py:{},Fv:{},au:function(){$.dm={Vb:$.kk,update:$.Wd,dc:$.Ud,end:$.Vd,font:Cf,
margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.ft={Vb:$.kk,update:$.Wd,dc:$.Ud,end:$.Vd,font:Df,margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.gt={Vb:$.kk,update:$.Wd,dc:$.Ud,end:$.Vd,font:Ef,margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.ht={Vb:$.kk,update:$.Wd,dc:$.Ud,end:$.Vd,font:Ff,margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.lo={Vb:$.Lu,update:$.Wd,dc:$.Ud,end:$.Vd,ti:Gf,si:Hf,margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,
.8,.1])};$.mo={Vb:$.Mu,update:$.Wd,dc:$.Ud,end:$.Vd,ti:Gf,si:Hf,margin:20,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.Py={Vb:$.Nu,update:$.Wd,dc:$.Ud,end:$.Vd,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])};$.Fv={Vb:$.Ku,update:$.Wd,dc:$.Ud,end:$.Vd,Jc:L,Kc:L,Ic:gc([bc,Xb,bc],[!1,!1,!0],[.1,.8,.1])}},jq:function(a){function b(a){var e,g={};for(e in a)g[e]="object"===typeof a[e]&&null!==a[e]?b(a[e]):a[e];return g}return b(a)},jB:function(a){$.dm.font.w=a;$.ft.font.w=a;$.gt.font.w=a;$.ht.font.w=
a},iB:function(a){$.lo.ti.w=a;$.lo.si.w=a;$.mo.ti.w=a;$.mo.si.w=a},zh:!1,ac:[],ws:function(a){$.zh=a},qA:function(){return $.zh},Kx:function(a){var b,c;for(b=0;b<$.ac.length;b+=1)c=$.ac[b],void 0===c||void 0!==a&&c.kind!==a||0<c.dh||($.ac[b]=void 0)},$t:function(){$.zh=!1;$.ac=[]},Bh:function(a,b,c,e){var g,h,k;void 0===e&&(e=$.zh);if(e)for(h=0;h<$.ac.length;h+=1)if(g=$.ac[h],void 0!==g&&g.Ce&&g.kind===a&&g.font===b&&g.text===c)return g.dh+=1,h;g={kind:a,font:b,text:c,dh:1,Ce:e};h=b.align;k=b.h;F(b,
"center");G(b,"middle");e=b.da(c)+2*a.margin;a=b.X(c)+2*a.margin;g.Pa=new x(e,a);y(g.Pa);b.p(c,e/2,a/2);z(g.Pa);F(b,h);G(b,k);for(h=0;h<$.ac.length;h+=1)if(void 0===$.ac[h])return $.ac[h]=g,h;$.ac.push(g);return $.ac.length-1},Zt:function(a){var b=$.ac[a];b.dh-=1;0>=b.dh&&!b.Ce&&($.ac[a]=void 0)},kk:function(a){a.buffer=$.Bh(a.kind,a.kind.font,a.value,a.Ce)},Lu:function(a){var b=a.value.toString();a.buffer=0<=a.value?$.Bh(a.kind,a.kind.ti,b,a.Ce):$.Bh(a.kind,a.kind.si,b,a.Ce)},Mu:function(a){var b=
a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?$.Bh(a.kind,a.kind.ti,b,a.Ce):$.Bh(a.kind,a.kind.si,b,a.Ce)},Nu:function(a){a.Pa=a.value},Ku:function(a){a.f=a.value;a.Eb=0},Wd:function(a){a.x=void 0!==a.kind.Jc?a.kind.Jc(a.time,a.Vl,a.Cq-a.Vl,a.duration):a.Vl+a.time/a.duration*(a.Cq-a.Vl);a.y=void 0!==a.kind.Kc?a.kind.Kc(a.time,a.Wl,a.Dq-a.Wl,a.duration):a.Wl+a.time/a.duration*(a.Dq-a.Wl);void 0!==a.kind.rk&&(a.Mf=a.kind.rk(a.time,0,1,a.duration));void 0!==a.kind.sk&&(a.Nf=a.kind.sk(a.time,
0,1,a.duration));void 0!==a.kind.Ic&&(a.alpha=a.kind.Ic(a.time,0,1,a.duration));void 0!==a.kind.Tu&&(a.Sa=a.kind.Tu(a.time,0,360,a.duration)%360);void 0!==a.f&&(a.Eb=a.time*a.f.H/a.duration)},Ud:function(a){var b=p.context,c;void 0!==a.f&&null!==a.images?1===a.Mf&&1===a.Nf&&0===a.Sa?a.f.bd(Math.floor(a.Eb),a.x,a.y,a.alpha):a.f.Da(Math.floor(a.Eb),a.x,a.y,a.Mf,a.Nf,a.Sa,a.alpha):(c=void 0!==a.Pa&&null!==a.Pa?a.Pa:$.ac[a.buffer].Pa,1===a.Mf&&1===a.Nf&&0===a.Sa?c.bd(a.x-c.width/2,a.y-c.height/2,a.alpha):
1E-4>Math.abs(a.Mf)||1E-4>Math.abs(a.Nf)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.Sa*Math.PI/180),b.scale(a.Mf,a.Nf),c.bd(-c.width/2,-c.height/2,a.alpha),b.restore()))},Vd:function(a){void 0!==a.buffer&&$.Zt(a.buffer)},pc:function(a){var b,c,e=!1;for(b=0;b<$.xb.length;b+=1)c=$.xb[b],void 0!==c&&(0<c.Ca?(c.Ca-=a,0>c.Ca&&(c.time+=-c.Ca,c.Ca=0)):c.time+=a,0<c.Ca||(c.time>=c.duration?(c.kind.end(c),$.xb[b]=void 0):c.kind.update(c),e=!0));e&&($.canvas.Z=!0)},Ua:function(){var a,b;for(a=0;a<$.xb.length;a+=
1)b=$.xb[a],void 0!==b&&(0<b.Ca||b.kind.dc(b))},xb:[],kr:function(a,b,c){$.Yu();void 0===a&&(a=N.mn);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);$.visible=!0;$.k=!0;N.b.bb($,a);$.depth=b;J($);Kb($,c);$.$t();$.au()},fu:function(a,b,c,e,g,h,k,l,n){void 0===l&&(l=void 0!==a.Ca?a.Ca:0);void 0===n&&(n=$.zh);void 0===g&&void 0!==a.Nw&&(g=c+a.Nw);void 0===h&&void 0!==a.Ow&&(h=e+a.Ow);void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Vl:c,Wl:e,Cq:g,Dq:h,x:c,y:e,Mf:1,Nf:1,alpha:1,Sa:0,time:0,
duration:k,Ca:l,Ce:n};a.kind.Vb(a);for(b=0;b<$.xb.length;b+=1)if(void 0===$.xb[b])return $.xb[b]=a,b;$.xb.push(a);return $.xb.length-1},dB:function(a){var b;0>a||a>=$.xb.length||(b=$.xb[a],void 0!==b&&(b.kind.end(b),$.xb[a]=void 0))},Jx:function(){var a,b;for(a=0;a<$.xb.length;a+=1)b=$.xb[a],void 0!==b&&(b.kind.end(b),$.xb[a]=void 0);$.xb=[]},Yu:function(){$.Jx();$.Kx();I.q($)}},Hi=O(12),Ii=O(8),Ji=O(84),Ki=O(84);
LevelMapIcons={mv:function(a,b){var c=new x(kd.width,kd.height),e=Ji/Ki,g=a.width/a.height;y(c);e<g?(e=g*Ji,g=Ki):(e=Ji,g=Ki/g);a.xq(0,Hi-(e-Ji)/2,Ii-(g-Ki)/2,e,g,1);b?jd.p(0,0,0):kd.p(0,0,0);z(c);return c}};N.version=N.version||{};N.version.game="1.4.1";
function Li(a){this.depth=9E3;this.k=this.visible=!0;this.group=0;this.Xl=!1;this.A=void 0;J(this);var b=new ki,c,e=Rg(N.d);e?(N.j.Of="time",N.j.ff="min",b.yk=!1,b.en=["time"],b.Pl=Fi.Az,void 0!==e.wu?c=1E3*e.ah[e.wu]:(c=0,b.Mk=["highScore"])):(b.Mk=["difficulty"],b.Pl=Gi,c=ai(this.$k));this.Xa=new li(b);e&&(this.Xa.sf.ys(li.ij),this.Xa.sf.xs("game_ui_TIME_TO_BEAT"));c||(c=0);b=this.Xa;b.sf.Qf(c);b.lr=c;this.A=new Mi(0,0,0,this);this.$k=a;this.uc=!0;this.A.pause=!1;this.Xa.dg=0;if(c=Rg(N.d)){this.Xa.setTime(0);
a=[];for(b=0;b<N.a.o.Af.length;++b)N.a.o.Af[b].K.K===Tg()&&a.push(b);this.$k=c.Hx%a.length}else this.Xa.setTime(N.a.o.Af[a].Aa.time);a=this.A;c=N.a.o.Af[a.d.$k];var g,h=null,k,l,n=c.Ma,q=c.Na;for(k=0;k<c.height;++k)for(l=0;l<c.width;++l)if(e=l,g=k,h=n[k][l]," "!==h){var w=1;" "!==q[k][l]&&(w=parseInt(q[k][l],10));switch(h){case "F":g+=.5;break;case "Q":Ni(a,e-.5,g-.5,w+1,h),h="N"}for(b=1;b<=w;b+=1)Ni(a,e,g,b,h)}Oi(a,1);if(!a.ol)throw"Finished parsing with unequal amount of tiles. Level is playable, but unfinishable.";
a.Lj=!0;a.Rl();a.m=Pi(a);Qi(a);Ri(a);Si(a,0);a.hm=new Ti(0,0,-Number.MAX_VALUE,a,1);this.Xq=!1}Li.prototype.Em=function(a){this.Xa.Em(a)};Li.prototype.zb=function(){void 0!==this.A&&(Ui(this.A),I.q(this.A));this.Xa&&(I.q(this.Xa),this.Xa=null);p.mb(N.b.Zd(N.pf));p.clear()};
function Vi(a){if(a.uc){if(Rg(N.d))Wi(N.d,a.Xa.getTime()/1E3);else{var b=Xi,c=N.d,e=a.Xa.Ll.ha(),g;g=a.Xa;g=g.ij(g.hj.ha());b(c,{totalScore:e,timeLeft:g,timeBonus:N.a.o.Aa.yu*Math.floor(a.Xa.getTime()/1E3),submitScoreMethod:"submitSessionScore"})}a.uc=!1}}
function Yi(a,b,c,e,g,h,k){this.depth=c;this.k=this.visible=!0;this.group=0;this.a=N.a.o.el;N.b.bb(this,N.pf);this.x=a;this.y=b;this.alpha=0;this.f=e;this.A=g;this.ad=-1;this.Tg=this.Cd=this.Ff=this.Ug=void 0;this.type=h;this.Iu=0;this.zo=-1;this.Ok=!1;this.Ng=0;this.scale=1;this.us=!0;this.ib=k;this.Xi=this.hi=0;J(this)}d=Yi.prototype;d.zb=function(){this.A.Ii===this&&(this.A.Ii=void 0)};
d.Ab=function(a,b,c){if(-1===this.ad){var e;a=b-N.Bi;c-=N.Ci;b=this.a.cg;e=this.a.oh;a>this.x&&a<this.x+b&&c>this.y&&c<this.y+e&&this.A.uh.push(this)}};
d.pc=function(a){0<this.ad&&(this.ad-=.001*a,this.us&&(this.us=!1),0>=this.ad&&this.A.q(this));if(this.Ok)if(0>=this.Pk){var b=Vd.H;this.Pn=Math.floor(this.Ng/N.a.o.uf.Rd);this.Ng>=b*N.a.o.uf.Rd&&(this.Pn=-1,this.Ng=0,this.Pk=N.a.o.uf.gr);this.Ng+=a}else this.Pk-=a;this.A.Qc!==this||this.A.pause||(this.Jo+=a,this.by=Math.floor(this.Jo/N.a.o.Ko.Rd%Wd.H))};d.Ol=function(){this.Ng=0;this.Ok=!0;this.Pk=N.a.o.uf.gr};function Zi(a,b){var c;c=!1;b.f===a.f&&b!==a&&-1===a.ad&&-1===b.ad&&(c=!0);return c}
function $i(a,b,c,e){a.ad=1;a.A.DA=-1;void 0!==a.Ug&&(a.Ug.Ff=void 0);void 0!==a.Ff&&(a.Ff.Ug=void 0);void 0!==a.Tg&&(a.Tg.Cd=void 0);aj(a.A,a);if(b){Ri(a.A);bj(a.A);var g=a.A;b=a.A.bf+1;g.Gg=g.a.dv;g.bf=b;3<g.bf&&(g.bf=3);if(0<g.bf){var h=g.bf;b=g.Jq.x+N.Bi;var g=g.Jq.y+N.Ci,k=cj,l=null,n=null;switch(h){case 1:l="undefined"!==typeof Lf?Lf:null;h=N.i.r("floater_1","<floater_1>");n="undefined"!==typeof a_nice?a_nice:null;break;case 2:l="undefined"!==typeof Kf?Kf:null;h=N.i.r("floater_2","<floater_2>");
n="undefined"!==typeof a_great?a_great:null;break;case 3:l="undefined"!==typeof Jf?Jf:null;h=N.i.r("floater_3","<floater_3>");n="undefined"!==typeof a_awesome?a_awesome:null;break;default:throw"Unknown floater type: "+h;}n&&H.play(n,0);k.ec.font=l;k.a.offsetY&&(g+=k.a.offsetY);$.fu(k.ec,h,b,g,b,g+k.vt,k.tt,0,!0)}}else Ri(a.A),a.A.Jq=new ca(a.x,a.y);a.A.d.Em(N.a.o.Aa.Yy);void 0!==c&&new dj(a.x,a.y,0,a.A,c,e)}
function ej(a){var b,c=!1;void 0===b&&(b=0);void 0===a.tb(0,b)&&void 0===a.tb(2,b)&&void 0===a.tb(1,b)?(a.Ug=a.A.tb(0,a),a.Ff=a.A.tb(1,a),a.Cd=a.A.tb(2,a),a.Tg=a.A.tb(3,a),void 0===a.tb(0,b)?c=!0:void 0===a.tb(2,b)&&(c=!0),void 0!==a.tb(1,b)&&(c=!1)):void 0!==a.tb(0,b)&&void 0!==a.tb(2,b)||void 0!==a.tb(1,b)||(c=!0);2!==a.A.m.length||0!==a.A.ie.length||void 0===a.A.m[0].Cd&&void 0===a.A.m[1].Cd||(a.A.m[0].x=3*a.a.cg,a.A.m[0].y=2*a.a.oh,a.A.m[1].x=4*a.a.cg,a.A.m[1].y=2*a.a.oh,Ri(a.A));return c}
d.tb=function(a,b){var c;switch(a){case 0:c=this.Ug;break;case 1:c=this.Cd;break;case 2:c=this.Ff;break;case 3:c=this.Tg;break;default:throw"Unknown dir: "+a;}return 0===b?c:void 0!==c?void 0!==c.f?c:void 0:void 0};
d.Ua=function(){var a;(a=1===this.ib)||"Q"!==this.type&&!this.Tg.Ff||(a=!0);this.f&&(0>this.ad&&(this.f.wq(0,0,0,a?this.f.width:O(70),this.f.height,Math.round(this.x),Math.round(this.y),this.scale,this.scale,0,this.alpha),this.A.Qc!==this||this.A.pause||Wd.p(this.by,Math.round(this.x-N.a.o.Ko.up),Math.round(this.y-N.a.o.Ko.xp)),this.Ok&&-1<this.Pn&&!this.A.pause&&Vd.p(this.Pn,Math.round(this.x-N.a.o.uf.up),Math.round(this.y-N.a.o.uf.xp))),this.Cd&&"Q"!==this.Cd.type&&(a=.75*this.alpha,Ud.bd(0,Math.round(this.x),
Math.round(this.y),a)))};function Mi(a,b,c,e){this.depth=c;this.k=this.visible=!0;this.group=0;this.x=a;this.y=b;this.d=e;this.Kj=0;this.bf=this.qg=-1;this.xd=1;this.ni=void 0;this.Iq=!0;this.qf=this.Gg=-1;this.m=[];this.Ii=this.f=void 0;this.Bd=[];this.Xk=0;this.pause=this.ol=!0;this.Il=0;this.a=N.a.o.el;this.$i=!1;this.gh=-1;this.Sf=!0;this.ie=[];this.uh=[];N.b.bb(this,N.pf);a=Rg(N.d);this.Gx=new fa(a?a.Hx:void 0);J(this)}d=Mi.prototype;d.Sb=function(){};d.zb=function(){Ui(this)};
d.ua=function(){this.canvas.Z=!0};
function fj(a){var b,c;b=void 0;for(c=0;c<a.uh.length;c+=1)void 0===b?b=a.uh[c]:b.depth>a.uh[c].depth&&(b=a.uh[c]);if(void 0!==b){var e,g;c=!0;g=new gj(0,0,0);if(!b.A.pause&&1>b.A.xd){if(void 0!==b.A.Qc&&0>b.ad&&Zi(b,b.A.Qc)&&ej(b.A.Qc)&&ej(b)){H.play(Wf);c=!1;e=Pb(I,b.A.Qc.f,0,0,b.A.Qc.x,b.A.Qc.y,b.A.Qc.depth,void 0);g.uo(0);$i(b,!1,b.A.Qc,e);$i(b.A.Qc,!0,void 0,void 0);b.A.Qc=void 0;e=b.A;for(g=0;g<e.m.length;g+=1)e.m[g].Ok=!1;e.Ii=void 0}c&&ej(b)&&0>b.ad&&(b.A.Qc=b,b.Jo=0,H.play(Vf))}}a.uh=[]}
d.pc=function(a){this.pause||(this.Kj+=.001*a,this.Ol(),hj(this,1,a),fj(this));if(0<this.qg&&(this.qg-=.001*a,0>=this.qg)){this.qg=-1;var b=[{Yq:N.i.r("ShuffleConfirmBtnHeader","<SHUFFLE_CONFIRM_BTN_HEADER>"),text:N.i.r("ShuffleConfirmBtnText","<SHUFFLE_CONFIRM_BTN_TEXT>"),S:this.By,ca:this}],c;if(void 0===Rg(N.d))c={Yq:N.i.r("ShuffleRestartBtnHeader","<SHUFFLE_RESTART_BTN_HEADER>"),text:N.i.r("ShuffleRestartBtnText","<SHUFFLE_RESTART_BTN_TEXT>"),S:function(){this.$c.close();I.q(this.d);N.ib=new Li(this.d.$k)},
ca:this};else{var e=this,g=function(a){a?e.$c.close():e.$c.show()};c={Yq:N.i.r("optionsChallengeForfeit","<SHUFFLE_RESTART_BTN_HEADER>"),text:N.i.r("optionsChallengeForfeit","<SHUFFLE_RESTART_BTN_TEXT>"),S:function(){var a=e.$c,b,c;for(b=0;b<a.buttons.length;b++)c=a.buttons[b],c.Mo(!1);a.c.visible=!1;Ei(!1,g)},ca:this}}b.push(c);this.$c=new Gh(N.i.r("ShuffleConfirmationText","<SHUFFLE_CONFIRM_TEXT>"),b,void 0===Rg(N.d))}0<this.qf&&(this.qf-=.001*a,0>=this.qf&&(this.qf=0,Vi(this.d)));0<this.Gg&&(this.Gg-=
.001*a,0>=this.Gg&&(this.Gg=this.bf=-1));this.Lj&&(2<this.Xk?(this.Xk=0,this.Rl()):this.Xk+=a)};function Ni(a,b,c,e,g){a.ol?(void 0!==a.ni&&(ij(a,a.ni),ij(a,a.ni)),a.ni=jj(a),a.ol=!1):a.ol=!0;var h=(e-1)*a.a.Zy,k=(e-1)*a.a.$y,l=1*-(a.a.cg+a.a.hs),n=(N.yn-O(560))/2;e=new Yi(b*(a.a.cg+a.a.hs)+l+n+h+a.a.az,c*(a.a.oh+a.a.mx)+k+a.a.bz,-e*c*100-10*b,a.ni,a,g,e);e.Iu=0;e.hi=b;e.Xi=c;a.m.push(e)}function Ui(a){var b,c;a.Ix=!1;for(b=a.m.length-1;0<=b;b-=1)c=a.m[b],a.m.splice(b,1),I.q(c);a.hm&&I.q(a.hm)}
d.Rl=function(){function a(a,b){var c=h[a].Jv;h[a].count-=b;0===h[a].count&&h.splice(a,1);return c}var b,c;if(this.m[0].f){Oi(this,0);for(b=0;b<this.m.length;b++)this.m[b].f=void 0;Ri(this)}var e=[];for(b=0;b<this.m.length;b++)ej(this.m[b])&&e.push(this.m[b]);var g;for(b=0;b<e.length;b++)g=Math.floor(Math.random()*e.length),c=e[g],e[g]=e[b],e[b]=c;for(var h=[];0<this.Bd.length;){c=jj(this);for(g=0;ij(this,c);)g++;h.push({Jv:c,count:g})}b=N.a.o.Vi.Vr;c=N.a.o.Vi.Nr;g=b+Math.round(Math.random()*(c-b));
g=Math.min(g,Math.floor(e.length/2));var k=h.length-1;for(b=0;b<g;b++)c=a(k,2),k--,0>k&&(k=h.length-1),e[2*b].f=c,e[2*b+1].f=c;for(b=2*g;b<e.length;b++)c=a(k--,1),0>k&&(k=h.length-1),e[b].f=c;for(b=0;b<this.m.length;b++)void 0===this.m[b].f&&(k=Math.floor(Math.random()*h.length),c=a(k,1),this.m[b].f=c);this.Lj=!1};function Qi(a){var b;p.mb(N.b.Zd(N.pf));p.clear();for(b=0;b<a.m.length;b+=1)Jb(a.m[b],-(a.m[b].x*N.on+a.m[b].y+N.yn*N.on*a.m[b].ib)),a.m[b].Rb=!0,a.m[b].alpha=1;Ri(a)}
function Oi(a,b){var c;a.Bd=[];var e=[];if(1===b){for(c=0;6>c;c+=1)e.push(Ee),e.push(Fe),e.push(Ge),e.push(He),e.push(Kd),e.push(Ld),e.push(Md),e.push(Od),e.push(Be),e.push(Ce),e.push(De),e.push(se),e.push(te),e.push(ue),e.push(ve),e.push(we),e.push(xe),e.push(ye),e.push(ze),e.push(Ae),e.push(je),e.push(ke),e.push(le),e.push(me),e.push(ne),e.push(oe),e.push(pe),e.push(qe),e.push(re),e.push(ae),e.push(be),e.push(ce),e.push(de),e.push(ee),e.push(fe),e.push(ge),e.push(he),e.push(ie),e.push(Pd),e.push(Qd),
e.push(Rd),e.push(Sd);for(c=0;c<a.m.length/2;++c)a.Bd.push(e[c]),a.Bd.push(e[c])}else for(c=0;c<a.m.length;c+=1)a.Bd.push(a.m[c].f)}function ij(a,b){var c;for(c=a.Bd.length-1;0<=c;c-=1)if(a.Bd[c]===b)return a.Bd.splice(c,1),!0;return!1}function jj(a){var b;b=a.Bd.length-1;var c=1;void 0!==b&&(c=b);b=Math.floor(a.Gx.random(c+1));return a.Bd[b]}d.q=function(a){aj(this,a);I.q(a)};function aj(a,b){var c=a.m.indexOf(b);0<=c&&a.m.splice(c,1)}
function bj(a){var b,c,e,g;e=[];g=0;a.Kj=0;if(2<a.m.length){for(b=0;b<a.m.length;b+=1)ej(a.m[b])&&e.push(a.m[b]);for(b=0;b<e.length;b+=1)for(c=b+1;c<e.length;c+=1)Zi(e[b],e[c])&&(g+=1);if(a.Sf){e=N.a.o.Vi.Vr;var h=N.a.o.Vi.Nr;for(b=c=0;b<a.m.length;b+=1)ej(a.m[b])&&(c+=1);(g<Math.min(c,e)||g>h)&&10>a.xd&&(g=0)}if(1>g)a.$i?(a.Sf=!0,a.xd+=1,a.Iq?a.Ul():a.qg=a.a.Mx):(a.Sf=!0,a.xd+=1,a.Rl()),a.$i=!1;else if(0<a.m.length&&a.Sf){a.xd=0;b=[];for(g=0;g<a.m.length;g+=1)ej(a.m[g])&&(b.push(a.m[g]),a.m[g].Vk=
!1);for(g=0;g<b.length;g+=1)if(!b[g].Vk)for(c=0;c<b.length;c+=1)if(Zi(b[g],b[c])&&!b[c].Vk){a.ie.push(b[g]);a.ie.push(b[c]);b[g].Vk=!0;b[c].Vk=!0;break}for(g=a.m.length-1;0<=g;g-=1)for(c=0;c<a.ie.length;c+=1)a.m[g]===a.ie[c]&&a.m.splice(g,1);bj(a)}}else{for(b=0;b<a.ie.length;b+=1)a.m.push(a.ie[b]);a.ie=[];Qi(a);a.$i=!0;a.xd=0;a.Sf=!1;a.Iq=!1}a.Sf||0===a.m.length&&kj(a)}
d.By=function(){var a,b;this.$c&&this.$c.close();for(b=0;b<this.m.length;b+=1)this.m[b].zo=0,a=new lj(this.m[b],{zo:1.5},100,Zb,this.Ay,this),a.start()};d.Ay=function(){this.o.Il+=1;this.o.Il>=this.o.m.length&&(this.o.Il=0,this.o.xd+=1,this.hm=new Ti(0,0,-Number.MAX_VALUE,this,0))};d.Ul=function(){var a;for(a=0;a<this.m.length;a+=1)this.m[a].zo=-1;hj(this,0,0);this.Lj=!0;this.$i=!1;this.Sf=!0};function hj(a,b,c){0===b&&(a.gh=0);0<=a.gh&&(a.gh+=.001*c,a.gh>=a.a.my&&(a.gh=-1,H.play(Yf)))}
function Ri(a){var b;for(b=0;b<a.m.length;b+=1)a.m[b].Ug=a.tb(0,a.m[b]),a.m[b].Ff=a.tb(1,a.m[b]),a.m[b].Cd=a.tb(2,a.m[b]),a.m[b].Tg=a.tb(3,a.m[b]);2!==a.m.length||0!==a.ie.length||void 0===a.m[0].Cd&&void 0===a.m[1].Cd||(a.m[0].x=3*a.a.cg,a.m[0].y=2*a.a.oh,a.m[0].hi=3,a.m[0].Xi=2,a.m[0].ib=1,a.m[1].x=5*a.a.cg,a.m[1].y=2*a.a.oh,a.m[1].hi=5,a.m[1].Xi=2,a.m[1].ib=1,Ri(a))}
d.tb=function(a,b){var c,e,g,h;for(c=0;c<this.m.length;c++)if(e=this.m[c],e!==b)switch(g=e.hi-b.hi,h=e.Xi-b.Xi,a){case 0:if(e.ib===b.ib&&-1===g&&1>Math.abs(h))return e;break;case 1:if(e.ib===b.ib&&1===g&&1>Math.abs(h))return e;break;case 2:if(e.ib===b.ib+1&&-1<g&&1>g&&1>Math.abs(h))return e;break;case 3:if(e.ib===b.ib-1&&-1<g&&1>g&&1>Math.abs(h))return e;break;default:throw"Unknown pos: "+a;}};function kj(a){a.pause=!0;0!==a.qf&&(a.qf=a.a.lv,a.d.Xa&&(a.d.Xa.dg=0))}
d.Ol=function(){var a=null,b,c=null,e=null,g;b=[];a=N.a.o.uf.Ca;if(void 0===this.Ii&&0<a&&this.Kj>=a&&3<this.m.length){for(a=0;a<this.m.length;a+=1)ej(this.m[a])&&b.push(this.m[a]);for(a=0;a<b.length;a+=1)for(g=0;g<b.length;g+=1)Zi(b[a],b[g])&&(c=b[a],e=b[g],g=a=b.length);c&&e&&(this.Ii=c,c.Ol(),e.Ol())}};function Pi(a){a.m.sort(function(a,c){return c.depth-a.depth});return a.m}function Si(a,b){var c;for(c=0;c<a.m.length;c+=1)a.m[c].alpha=b}d.Ua=function(){this.f&&this.f.p(0,this.x,this.y)};
function Ti(a,b,c,e,g){this.depth=c;this.k=this.visible=!0;this.group=0;this.Wm=!0;this.x=a;this.y=b;"undefined"!==typeof ImgRefreshMid&&(this.f=ImgRefreshMid);this.Gv=Le;this.Iv=Me;this.Hv=Ke;this.a=N.a.o.Vi;this.Zk=-Le.width;this.Eo=2*Me.width;this.Fo=this.n=0;this.ul=this.refresh=!1;N.b.bb(this,N.pf);this.type=g;this.Zg=e;this.A=1===g?e:e.o;this.Xa=this.A.d.Xa;this.vc=N.a.o.el.Ru;J(this)}Ti.prototype.Sb=function(){mj(this);this.Zg.pause=!0};
Ti.prototype.pc=function(a){var b;b=this.A.$i;this.n>=.8*this.vc&&this.Zg.Lj&&(this.n=.3*this.vc);this.n>=.8*this.vc&&b&&!this.ul?(this.n=.8*this.vc,this.ul=!0,Si(this.A,1),nj(this)):this.n>=.8*this.vc&&!b&&bj(this.A);if(this.n<this.vc)this.n+=.001*a,this.n>this.vc&&(this.n=this.vc);else if(this.ul){if(Rg(N.d)){var c=this;N.ib.Xq?this.Xa.dg=1:(oj(function(){c.Xa.dg=1},this),N.ib.Xq=!0)}else this.Xa.dg=2;I.q(this);this.Zg.hm=void 0}this.canvas.Z=!0;this.Fo+=.001*a};
function mj(a){var b,c;b=0===a.type?new lj(a,{Zk:0},200*a.vc,$b,function(){a.Wm=!1;a.Zg.Ul()},a.Zg):new lj(a,{Zk:0},200*a.vc,$b,function(){a.Wm=!1});c=new lj(a,{Eo:Me.width},200*a.vc,$b,function(){});H.play($f);b.start();c.start()}function nj(a){var b,c;c=200*a.vc;b=new lj(a,{Zk:-Le.width},c,$b,function(){});c=new lj(a,{Eo:2*Me.width},c,$b,function(){});H.play(Zf);a.Zg.pause=!1;b.start();c.start()}
Ti.prototype.Ua=function(){var a,b,c;a=this.vc;c=20<this.n/(.01*a)&&80>this.n/(.01*a)?!0:!this.ul&&!this.Wm;this.n<=.2*this.a.qs||this.n>=.8*this.a.qs||(this.refresh=!0);a=N.yn/2+1;b=N.on/2+1;this.Gv.p(0,this.Zk,0);this.Iv.p(0,this.Eo,0);c&&(this.f&&this.f.p(0,a+N.Bi,b+N.Ci),this.Hv.Da(0,a,b,1,1,500*-this.Fo,1))};
function lj(a,b,c,e,g,h){this.depth=9E3;this.visible=this.k=!1;this.group=0;this.node=a;this.attributes=b;this.duration=c;this.pb=g;this.Uu=e;this.time=0;this.o=h;this.Ze={};for(var k in this.attributes)this.Ze[k]=a[k];this.Pb={};for(var l in this.attributes)this.Pb[l]=this.attributes[l]-this.Ze[l];J(this)}d=lj.prototype;
d.ua=function(a){var b,c,e;this.time+=a;if(this.time<this.duration)for(var g in this.attributes)a=this.Pb[g],b=this.time,c=this.Ze[g],e=this.duration,this.node[g]=this.Uu(b,c,a,e);else this.finish()};d.start=function(){this.k=!0};d.pause=function(){this.k=!1};d.Rl=function(){};d.Ul=function(){this.o.Ul()};d.finish=function(){for(var a in this.attributes)this.node[a]=this.attributes[a];this.k=!1;I.q(this);"undefined"!==typeof this.pb&&this.pb()};
function dj(a,b,c,e,g,h){this.depth=0;this.k=this.visible=!0;this.group=0;this.x=a;this.y=b;this.f=Ie;this.sl=g;this.bi=this.nq=0;this.Rp=!1;this.a=N.a.o.Lx;this.st=h;this.A=e;N.b.bb(this,N.mn);J(this)}
dj.prototype.pc=function(a){this.bi+=a;this.nq=Math.floor(this.bi/this.a.Rd%this.f.H);if(this.bi>=this.a.ay&&(void 0===this.sl||this.Rp||(new dj(this.sl.x,this.sl.y,0,this.A,void 0,void 0),this.Rp=!0),void 0!==this.st)){a=I;var b=a.wb.indexOf(this.st);0>b||(a.wb[b]=void 0);this.canvas.Z=!0}this.bi>=this.a.Rd*this.f.H&&(void 0===this.sl&&1>this.A.m.length&&this.A.Ix&&kj(this.A),I.q(this),this.canvas.Z=!0)};dj.prototype.Ua=function(){this.f&&this.f.p(this.nq,this.x+N.Bi,this.y+N.Ci)};
function gj(a,b,c){this.depth=c;this.k=this.visible=!0;this.group=0;this.x=a;this.y=b;this.f=void 0;this.bj=this.Sl=-1;this.a=N.a.o.el;J(this)}gj.prototype.pc=function(a){var b=null,c=null;switch(this.Sl){case 0:b=this.a.Ou,c=Xf}0<=this.Sl&&(this.bj+=.001*a,this.bj>=b&&c&&(this.Sl=this.bj=-1,H.play(c),I.q(this)))};gj.prototype.uo=function(a){this.Sl=a;this.bj=0};function pj(){}pj.prototype.Qq=function(a,b,c,e){return N.a.o.Af.length<=a?null:(a=N.a.o.Af[a].icon)?LevelMapIcons.mv(a,"locked"===e):null};
pj.prototype.Sq=function(){var a,b,c;a=[];b=[Xd,Yd,Zd,Zd,$d];for(c=0;c<b.length;c+=1)a.push({f:b[c],text:N.i.r("TutorialText_"+c,"<TutorialText_"+c+">"),title:N.i.r("TutorialTitle_"+c,"<TutorialTitle_"+c+">")});return a};
new function(){$.k||($.kr(),$.ws(!0));this.ec=$.jq($.dm);"undefined"!==typeof f_points&&(this.ec.font=f_points);this.a=N.a.o.Ox;this.cd=this.a.wo;this.dd=this.a.rb;this.tt=this.cd+this.dd;this.vt=this.a.sq||0;this.ec.Jc=Xb;this.ec.Kc=gc([Xb,L],[!1,!1],[this.cd,this.dd]);var a=gc([Xb,L],[!1,!1],[this.cd,this.dd]);this.ec.Ic=function(b,c,e,g){return a(b,1,-1,g)};this.ec.rk=gc([M,Xb],[!1,!1],[this.cd,this.dd]);this.ec.sk=gc([M,Xb],[!1,!1],[this.cd,this.dd])};
var cj=new function(){function a(a,b,g,h){return M(a,b,g,h)}$.k||($.kr(),$.ws(!0));this.ec=$.jq($.dm);this.a=N.a.o.Ty;this.cd=this.a.wo;this.dd=this.a.rb;this.tt=this.cd+this.dd;this.vt=this.a.sq||0;this.ec.Jc=Xb;this.ec.Kc=gc([Xb,L],[!1,!1],[this.cd,this.dd]);var b=gc([Xb,L],[!1,!1],[this.cd,this.dd]);this.ec.Ic=function(a,e,g,h){return b(a,1,-1,h)};this.ec.rk=gc([a,Xb],[!1,!1],[this.cd,this.dd]);this.ec.sk=gc([a,Xb],[!1,!1],[this.cd,this.dd])};N.version=N.version||{};N.version.theme="1.4.2";
N.version=N.version||{};N.version.configuration_poki_api="1.0.0";N.l=N.l||{};N.l.li=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
N.l.uq=function(a,b,c,e){var g={};N.l.li(a.Fj,g);g.fontSize=O(18);e=N.b.g(a.Wh,e.height,O(22));e=a.Uh-e;var h=N.i.r("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.Hj,a.Wh,a.Gj,O(22)),k=c(pf,a.Xh,k-28),k=k+O(6),g={};N.l.li(a.Yh,g);g.fontSize=O(18);k=b("CoolGames\nwww.coolgames.com",g,a.og,k,a.We,O(44));C(T.M(),g);k+=O(58)+Math.min(0,e-O(368));g={};N.l.li(a.Fj,g);g.fontSize=O(20);g.fillColor="#1A2B36";h=N.i.r("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.Hj,
k,a.Gj,O(22));k+=O(6);k=c(qf,a.Xh,k);k+=O(12);g={};N.l.li(a.Yh,g);g.fontSize=O(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.og,k,a.We,O(22));k+=O(16);g={};N.l.li(a.Yh,g);b("\u00a9 2020",g,a.og,k,a.We,O(44));return[]};N.l.Di=function(){return[]};N.l.Fc=function(){N.d.Fc()};
N.l.Ik=function(){function a(){__flagPokiInitialized?(function(){  /* function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],e=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){e=!0;break}}e||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})()     */}(),N.d.Fc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=N.a.D.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};N.l.cl=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};N.l.Jk=function(){PokiSDK.gameLoadingFinished();N.d.Fc()};
N.l.Cs=function(a){try{N.d.Mn(),ib("master"),PokiSDK.commercialBreak().then(function(){N.d.Ei();jb("master");a()})["catch"](function(a){console.log("error"+a);N.d.Ei();jb("master")})}catch(b){console.log("error"+b),N.d.Ei()}};N.l.jr=function(){N.l.Cs(function(){PokiSDK.gameplayStart()})};N.l.Mg=function(){N.l.Cs(function(){N.d.Fc()})};N.l.zA=function(){PokiSDK.happyTime(.5)};N.l.ir=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
N.l.Rq=function(a,b){void 0===N.d.de&&(N.d.de=new tg(!0));ug(a,b)};N.l.jp=function(a){void 0===N.d.de&&(N.d.de=new tg(!0));vg(a)};N.l.jd=function(a){window.open(a)};N.l.ge=function(a){"inGame"===a&&PokiSDK.gameplayStop()};N.l.Gu=function(a){"inGame"===a&&PokiSDK.gameplayStart()};N.l.Lv=function(){};N=N||{};N.Pp=N.Pp||{};N.Pp.Mz={Uz:""};
function qj(){this.depth=-1E6;this.k=this.visible=!0;this.Ia=N.Yd;this.end=this.na=this.Sn=this.Rn=this.load=this.Vb=!1;this.hn=0;this.np=this.sj=!1;this.state="GAME_INIT";this.screen=null;this.bs=this.fb=this.G=0;this.jn=!1;this.al=this.bl=!0;this.Qw=1;this.lc=!1;this.xc={};this.ia={difficulty:1,playMusic:!0,playSFX:!0,language:N.i.Bn()};window.addEventListener("gameSetPause",this.Mn,!1);window.addEventListener("gameResume",this.Ei,!1);document.addEventListener("visibilitychange",this.yv,!1);this.eg=
"timedLevelEvent"}d=qj.prototype;d.Mn=function(){H.pause("master");I.pause()};d.Ei=function(){H.Wi("master");tb(I);yb(I);Db(I);I.Wi()};d.yv=function(){document.hidden?N.d.Mn():N.d.Ei()};
d.vm=function(){var a,b=this;void 0!==N.a.R.background&&void 0!==N.a.R.background.color&&(document.body.style.background=N.a.R.background.color);N.Ba=new Cg;N.B.Nk&&N.B.Nk.k&&(b.Dt=$h(function(a){b.Dt=a}));N.j=N.a.o.nf||{};N.j.Ad=N.j.Ad||"level";N.j.Rf=void 0!==N.j.Rf?N.j.Rf:"level"===N.j.Ad;N.j.T=void 0!==N.j.T?N.j.T instanceof Array?N.j.T:[N.j.T]:[20];N.j.Cg=void 0!==N.j.Cg?N.j.Cg:"locked";N.j.Yi=void 0!==N.j.Yi?N.j.Yi:"difficulty"===N.j.Ad;N.j.qj=void 0!==N.j.qj?N.j.qj:!1;N.j.Oo=void 0!==N.j.Oo?
N.j.Oo:"level"===N.j.Ad;N.j.ff=void 0!==N.j.ff?N.j.ff:"max";N.j.Of=void 0!==N.j.Of?N.j.Of:"number";N.l.Rq(null,function(a){var e,g,h;a&&(b.xc=a);b.ia=Eg("preferences",{});b.ia.difficulty=void 0!==b.ia.difficulty?b.ia.difficulty:1;void 0!==N.j.ct&&0>N.j.ct.indexOf(Tg())&&(b.ia.difficulty=N.j.ct[0]);b.ia.playMusic=void 0!==b.ia.playMusic?b.ia.playMusic:!0;b.Kf(b.ia.playMusic);b.ia.playSFX=void 0!==b.ia.playSFX?b.ia.playSFX:!0;b.zl(b.ia.playSFX);b.ia.language=void 0!==b.ia.language&&N.i.Nv(b.ia.language)?
b.ia.language:N.i.Bn();N.i.As(b.ia.language);void 0===bh(b.G,0,"state",void 0)&&rj(b.G,0,"state","unlocked");if(N.j.Rf)if("locked"===N.j.Cg)for(h=!1,e=0;e<N.j.T.length;e++){for(a=0;a<N.j.T[e];a++)if(g=bh(e,a,"state","locked"),"locked"===g){b.G=0<=a-1?e:0<=e-1?e-1:0;h=!0;break}if(h)break}else void 0!==b.ia.lastPlayed&&(b.G=b.ia.lastPlayed.world||0)});b.wh=sj();void 0!==b.wh.authToken&&void 0!==b.wh.challengeId&&(b.lc=!0);N.B.wB&&(this.ab=this.sB?new TestBackendServiceProvider:new BackendServiceProvider,
this.ab.mr(function(a){a&&N.d.ab.IA(b.wh.authToken)}));a=parseFloat(m.u.version);H.Qa&&(m.Oa.op&&m.u.nl||m.u.lh&&a&&4.4>a)&&(H.Dj=1);this.Vb=!0;this.Qk=0};function sj(){var a,b,c,e,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),e=0,g=a.length;e<g;e++)c=a[e].split("="),b[c[0]]=c[1];return b}function tj(a){a.state="GAME_LOAD";a.screen=new Ng(function(){N.d.load=!0;Rh(N.d,!0);N.ud.Jk();N.l.Jk()},function(a){N.ud.cl(a);N.l.cl(a)},N.B.mB)}
function Rh(a,b){a.sj=b||!1;a.np=!0;a.hn++}
function uj(){var a=N.d;a.hn--;switch(a.state){case "GAME_INIT":a.Vb&&!a.xB&&(a.lc&&a.ab&&a.ab.oB(a.wh.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.No&&a.screen.No("challengeLoadingError_notValid")}),tj(a));break;case "GAME_LOAD":if(a.load){if(a.lc&&a.ab)if(a.ab.Mv())Rg(a),Ug(a.nb.mode);else{a.screen.No("challengeLoadingError_notStarted");break}I.q(a.screen);"function"===typeof pj&&(N.o=new pj);void 0!==N.B.Yp&&!1!==N.B.Yp.show&&N.b.eu();Qh(a)}break;case "LEVEL_INIT":a.Rn&&vj(a);
break;case "LEVEL_LOAD":a.Sn&&xj(a);break;case "LEVEL_END":if(a.na)switch(Ph(),N.d.Rn=!1,N.d.Sn=!1,N.ib=void 0,N.b.Zd(N.pf).Z=!0,N.b.Zd(N.Fk).Z=!0,N.d.tr){case "retry":Yg(N.d,N.d.fb);break;case "next":N.j.Rf?N.d.fb+1<N.j.T[N.d.G]?Yg(N.d,N.d.fb+1):N.d.G+1<N.j.T.length?Yg(N.d,0,N.d.G+1):N.j.Oo?(N.d.state="GAME_END",N.d.end=!0,Rh(N.d,!1),N.l.tv()):N.d.screen=new Xg:Yg(N.d,0);break;case "exit":N.j.Rf?N.d.screen=new Xg:Qh(N.d)}break;case "GAME_END":a.end&&(a.end=!1,N.d.screen=null,N.d.screen=new Sh)}}
d.Fc=function(){N.d.np=!1};function Kh(){var a;if(void 0!==N.d.wh.more_games)try{return a=decodeURIComponent(N.d.wh.more_games),function(){N.l.jd(a)}}catch(b){}if("string"===typeof N.bh.moreGamesUrl&&""!==N.bh.moreGamesUrl)return function(){N.l.jd(N.bh.moreGamesUrl)};if(void 0!==N.B.Kw)return function(){N.l.jd(N.B.Kw)};if("function"===typeof N.l.wv)return N.l.wv}function Rg(a){if(a.lc&&void 0!==a.ab)return void 0===a.nb&&(a.nb=a.ab.rA()),a.nb}d.ui=function(a){N.d.lc&&N.d.ab&&N.d.ab.ui(a)};
d.wg=function(a){N.d.lc&&N.d.ab&&N.d.ab.wg(a)};function Tg(){return N.d.ia.difficulty}function Oh(){switch(Tg()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+Tg();}}function ri(){var a="optionsDifficulty_"+Oh();return N.i.r(a,"<"+a+">")}function Ug(a){N.d.ia.difficulty=a;Gg("preferences",N.d.ia)}d.Kf=function(a){void 0!==a&&(N.d.ia.playMusic=a,Gg("preferences",N.d.ia),a?jb("music"):ib("music"));return N.d.ia.playMusic};
d.zl=function(a){void 0!==a&&(N.d.ia.playSFX=a,Gg("preferences",N.d.ia),a?(jb("game"),jb("sfx")):(ib("game"),ib("sfx")));return N.d.ia.playSFX};d.language=function(a){void 0!==a&&(N.d.ia.language=a,Gg("preferences",N.d.ia));return N.d.ia.language};function Vh(a){return"time"===N.j.Of?(0>a?"-":"")+Math.floor(Math.abs(a)/60)+(10>Math.abs(a%60)?":0":":")+Math.abs(a%60):""+a}
function rj(a,b,c,e){var g="game";"game"!==g&&(g="tg");void 0===N.d.xc["level_"+a+"_"+b]&&(N.d.xc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?N.d.xc["level_"+a+"_"+b][g]=e:N.d.xc["level_"+a+"_"+b][g][c]=e;N.l.jp(N.d.xc)}function bh(a,b,c,e){var g="game";"game"!==g&&(g="tg");a=N.d.xc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:e}function Eg(a,b){var c,e;"game"!==c&&(c="tg");e=N.d.xc.game;return void 0!==e&&(e=void 0===a?e[c]:e[c][a],void 0!==e)?e:b}
function Gg(a,b){var c;"game"!==c&&(c="tg");void 0===N.d.xc.game&&(N.d.xc.game={tg:{},game:{}});void 0===a?N.d.xc.game[c]=b:N.d.xc.game[c][a]=b;N.l.jp(N.d.xc)}function ih(a,b,c,e){void 0===c&&(c=a.fb);void 0===e&&(e=a.G);return void 0===b?bh(e,c,"stats",{}):bh(e,c,"stats",{})[b]}
function ai(a){var b,c,e=N.d;if(void 0===c&&void 0!==a){var g=a;for(c=0;c<N.j.T.length&&!(g<N.j.T[c]);c++)g-=N.j.T[c];c=g;if(void 0===b){var h=g=0;for(b=0;b<N.j.T.length;b++){h+=N.j.T[b];if(h>a)break;g+=1}b=g}}a=ih(e,"highScore",c,b);return"number"!==typeof a?0:a}function yj(){var a,b,c,e=0;for(a=0;a<N.j.T.length;a++)for(b=0;b<N.j.T[a];b++)c=ih(N.d,void 0,b,a),"object"===typeof c&&null!==c&&(e+=void 0!==c.highScore?c.highScore:0);return e}
function Qh(a){a.screen&&I.q(a.screen);a.screen=new Qg;a.fb=-1}
function zi(a,b,c,e){var g;g=void 0!==N.a.R.Hi&&void 0!==N.a.R.Hi.backgroundImage?N.a.R.Hi.backgroundImage:void 0!==N.a.D.Hi?N.a.D.Hi.backgroundImage:void 0;N.b.mb(N.of);a=a||0;b=b||0;c=c||p.width;e=e||p.height;if(g)if(c=Math.min(Math.min(c,p.width),g.ii),e=Math.min(Math.min(e,p.height),g.Ag),void 0!==g){var h=a,k=b-N.Vj,l,n,q;for(l=0;l<g.H;l+=1)n=l%g.$g*g.width,q=g.height*Math.floor(l/g.$g),n>h+c||n+g.width<h||q>k+e||q+g.height<k||g.ma(l,h-n,k-q,c,e,a,b,1)}else pa(a,b,c,e,"white",!1)}
function Yg(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.G=c);a.fb=b;a.Rn=!0;Rh(a,!1);N.l.uv()}function vj(a){a.state="LEVEL_LOAD";a.Sn=!0;Rh(a,!1);N.l.vv()}
function xj(a){var b,c=0;if(a.G<N.j.T.length&&a.fb<N.j.T[a.G]){a.state="LEVEL_PLAY";a.bs+=1;a.na=!1;a.screen=null;zi(0,N.Vj);b=N.Ba;var e=Nh(a,3),g="progression:levelStarted:"+Oh(),h=a.eg,k;for(k=0;k<b.ba.length;k++)if(!b.ba[k].k){b.ba[k].n=0;b.ba[k].paused=0;b.ba[k].k=!0;b.ba[k].bv=e;b.ba[k].px=g;b.ba[k].tag=h;break}k===b.ba.length&&b.ba.push({k:!0,n:0,paused:0,bv:e,px:g,tag:h});b.Va(e,g,void 0,N.ea.ic.zp);b.Va("Start:","progression:levelStart:"+e,void 0,N.ea.ic.vj);for(b=0;b<a.G;b++)c+=N.j.T[b];
N.l.jr(a.G,a.fb);a.ia.lastPlayed={world:a.G,level:a.fb};N.ib=new Li(c+a.fb)}}function ch(a,b,c){var e=0;void 0===b&&(b=a.G);void 0===c&&(c=a.fb);for(a=0;a<b;a++)e+=N.j.T[a];return e+c}function oj(a,b){var c=N.d;c.lc&&(c.nb.Gc!==c.nb.xe||N.B.Fu&&N.B.Fu.lB)?new Th("challengeStartTextTime",a,b):"function"===typeof a&&(b?b.S():a())}function Nh(a,b){var c,e=a.fb+"",g=b-e.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)e="0"+e;return e}
function Wi(a,b){var c,e,g,h,k;a.lc?(b=Math.floor(b),a.nb.xe===a.nb.Gc?(e=function(b){a.Wb&&"function"===typeof a.Wb.md&&(b?(a.Wb.md(N.i.r("challengeEndScreenChallengeSend_success","<CHALLENGESENDTEXT>")),a.nb.Vs?Dh(a.Wb,N.i.r("challengeEndScreenChallengeSend_submessage_stranger","")):(k=a.nb.kd[1],k=13<k.length?k.substr(0,10)+"...":k,Dh(a.Wb,N.i.r("challengeEndScreenChallengeSend_submessage","<CHALLENGESENDSUBMESSAGE>").replace(/<NAME>/g,k)))):a.Wb.md(N.i.r("challengeEndScreenChallengeSend_error",
"<CHALLENGESENDERROR>")))},h=function(b){b?a.Wb.md(N.i.r("challengeCancelMessage_success","<CHALLENGECANCELSUCCESS>")):a.Wb.md(N.i.r("challengeCancelMessage_error","<CHALLENGECANCELERROR>"))},c=function(){a.ab&&a.ab.wg(h)}):(e=function(b){a.Wb&&"function"===typeof a.Wb.md&&(b||a.Wb.md(N.i.r("challengeEndScreenScoreSend_error","<CHALLENGESCORESENDERROR>")))},g=function(b){a.Wb&&"function"===typeof a.Wb.Ct&&a.Wb.Ct(b)}),a.state="LEVEL_END",a.Wb=new Ch(b,function(){a.ab&&a.ab.qB(b,N.j.Of,e,g)},c)):Xi(a,
{totalScore:b})}
function Xi(a,b){function c(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===N.j.ff&&a>b||"min"===N.j.ff&&a<b?!0:!1}a.state="LEVEL_END";var e,g,h,k,l,n,q={},w=Nh(a,3);b=b||{};b.level=N.j.qj?a.fb+1:ch(a)+1;b.fr=!1;g=(e=bh(a.G,a.fb,"stats",void 0))||{};if(void 0!==b.yd||void 0!==b.vb){void 0!==b.yd&&(q[b.yd.id]=b.yd.M(),"highScore"===b.yd.id&&(n=b.yd));if(void 0!==b.vb)for(k=0;k<b.vb.length;k++)q[b.vb[k].id]=b.vb[k].M(),"highScore"===b.vb[k].id&&(n=b.vb[k]);for(k in q)l=q[k],void 0!==
l.Oe&&(q[l.Yl].nc=l.Oe(q[l.Yl].nc));void 0!==q.totalScore&&(h=q.totalScore.nc)}else h=b.totalScore,void 0!==h&&void 0!==b.timeBonus&&(h+=b.timeBonus);k="";if(!0!==b.failed){k="Complete:";if(void 0!==h){N.Ba.Va(k,"level:"+w,h,N.ea.ic.vj);if(void 0===e||c(h,e.highScore))g.highScore=h,b.fr=!0,N.Ba.Va("highScore",":score:"+Oh()+":"+w,h,N.ea.ic.qm);void 0!==n&&(n.nc=g.highScore);b.highScore=g.highScore}if(void 0!==b.stars){if(void 0===g.stars||g.stars<b.stars)g.stars=b.stars;N.Ba.Va("stars",":score:"+
Oh()+":"+w,b.stars,N.ea.ic.qm)}a.fb+1<N.j.T[a.G]?"locked"===bh(a.G,a.fb+1,"state","locked")&&rj(a.G,a.fb+1,"state","unlocked"):a.G+1<N.j.T.length&&"locked"===bh(a.G+1,0,"state","locked")&&rj(a.G+1,0,"state","unlocked");rj(a.G,a.fb,void 0,{stats:g,state:"played"});void 0!==a.ab&&(e=N.o&&N.o.ov?N.o.ov():yj(),void 0!==e&&a.ab.rB(e,N.j.Of));Ig(N.Ba,a.eg,w,"progression:levelCompleted:"+Oh())}else N.Ba.Va("Fail:","level:"+w,h,N.ea.ic.vj),Ig(N.Ba,a.eg,w,"progression:levelFailed:"+Oh());var A={totalScore:h,
level:b.level,highScore:b.highScore,failed:!0===b.failed,stars:b.stars,stage:b.stage};h=function(a){N.d.na=!0;N.d.tr=a;Rh(N.d,!0);N.l.Mg(A);N.ud.Mg(A)};N.l.cn&&N.l.cn();void 0===b.customEnd&&(a.Wb=new jh(N.j.Ad,b,h))}d.Zi=function(){N.d.ge(!0)};d.ge=function(a,b,c){var e="inGame";N.d.screen instanceof Qg?e="startScreen":N.d.screen instanceof Xg?e="levelMapScreen":b&&(e=N.d.nb.Gc===N.d.nb.xe?"inGame_challenger":"inGame_challengee");N.d.Qd||(N.d.Qd=new Hh(e,!0===a,b,c))};
function Ei(a,b){var c=[],e,g,h,k,l;N.d.Qd||N.d.re||(N.d.nb.Gc===N.d.nb.xe?(e=N.i.r("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),g="challengeCancelConfirmBtn_yes",h="challengeCancelConfirmBtn_no",l=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=N.i.r(b,"<"+b.toUpperCase()+"<");N.d.re&&Xh(b);a&&wh()},k=function(){"function"===typeof b&&b(!0);N.d.wg(l);return!0}):(e=N.i.r("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),g="challengeForfeitConfirmBtn_yes",
h="challengeForfeitConfirmBtn_no",l=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=N.i.r(b,"<"+b.toUpperCase()+"<");if(N.d.re&&(Xh(b),a)){var b=N.i.r("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",N.d.nb.kd[N.d.nb.xe]),b=b.replace("<AMOUNT>",N.d.nb.Nt),c=N.d.re,e,g,h,k;e=T.M();c.a.Yo&&C(e,c.a.Yo);g=Na(e,b,c.a.Ax,c.a.zx,!0);g<e.fontSize&&D(e,g);g=e.da(b,c.a.El)+10;h=e.X(b,c.a.Dl)+10;k=N.b.fa(c.a.Bx,c.c.f.width,g,e.align);h=N.b.fa(c.a.Cx,c.c.f.height-
Wh(c),h,e.h);y(c.c.f);e.p(b,k,h,g);z(c.c.f)}a&&wh()},k=function(){"function"===typeof b&&b(!0);N.d.ui(l);return!0}),c.push({L:g,S:k,ca:N.d}),c.push({L:h,S:function(){N.d.re.close();N.d.re=null;"function"===typeof b&&b(!1);return!0}}),N.d.re=new Gh(e,c,a),N.d.Qd=N.d.re)}d.so=function(){var a,b;b=Lb("game");for(a=0;a<b.length;a++)"function"===typeof b[a].Nn&&b[a].Nn();Jg();Mb("game");Eb()};
function wh(a){var b,c;c=Lb();for(b=0;b<c.length;b++)"function"===typeof c[b].Nn&&c[b].Nn();Mb();Eb();Jg();a&&(a.O=Math.max(0,a.O-1));Ob("system")}function Bh(){var a,b;b=Lb();for(a=0;a<b.length;a++)"function"===typeof b[a].xv&&b[a].xv();Ob();a=I;for(b=0;b<a.oe.length;b+=1)a.oe[b].paused=Math.max(0,a.oe[b].paused-1);a=N.Ba;b=N.d.eg;var c;for(c=0;c<a.ba.length;c++)void 0!==a.ba[c]&&a.ba[c].tag===b&&(a.ba[c].paused-=1,a.ba[c].paused=Math.max(a.ba[c].paused,0))}
function Ph(){var a;N.ib&&I.q(N.ib);for(a=Lb("LevelStartDialog");0<a.length;)I.q(a.pop())}function Hg(){var a="";N.version.builder&&(a=N.version.builder);N.version.tg&&(a+="-"+N.version.tg);N.version.game&&(a+="-"+N.version.game);N.version.config&&(a+="-"+N.version.config);return a}d.Sb=function(){this.Vb||(this.vm(),Rh(N.d,!0),N.ud.Ik(),N.l.Ik())};
d.ua=function(a){"function"===typeof this.Mq&&(this.Mq(),this.Mq||N.d.Fc());0<this.hn&&(this.sj||this.np||uj());700>this.Qk&&(this.Qk+=a,700<=this.Qk&&(N.B.vB&&void 0!==N.B.wi&&N.B.wi.Ak&&N.B.wi.Nl&&N.Ba.start([N.B.wi.Ak,N.B.wi.Nl]),void 0===bh(this.G,0,"state",void 0)&&rj(this.G,0,"state","unlocked")))};d.gd=function(a,b){"languageSet"===a&&N.d.language(b)};d.pc=function(){var a,b;for(a=0;a<N.Sd.length;a++)b=N.Sd[a],b.Z&&(p.mb(b),p.clear())};
d.Ua=function(){var a;for(a=0;a<N.Sd.length;a++)N.Sd[a].Z=!1};N.vy=function(){N.d=new qj;J(N.d);Kb(N.d,"system")};(void 0===N.mu||N.mu)&&N.l.sv();qj.prototype.ge=function(a,b,c){var e="inGame";N.d.screen instanceof Qg?e="startScreen":N.d.screen instanceof Xg?e="levelMapScreen":b&&(e=N.d.nb.Gc===N.d.nb.xe?"inGame_challenger":"inGame_challengee");N.l.ge(e);N.d.Qd||(N.d.Qd=new Hh(e,!0===a,b,c))};Hh.prototype.close=function(){I.q(this);this.canvas.Z=!0;N.l.Gu(this.type);return!0};
Ra.prototype.Dd=function(a,b){var c,e,g,h=1,k=Wa(this,a);this.Ra[a]=b;this.kc[a]&&delete this.kc[a];for(c=0;c<k.length;c+=1)if(e=k[c],0<=e.pa.indexOf(a)){for(g=0;g<e.pa.length;g+=1)void 0!==this.Ra[e.pa[g]]&&(h*=this.Ra[e.pa[g]]);h=Math.round(100*h)/100;if(this.Za){if(e=this.Nd[e.id])e.gain.value=h}else this.Qa&&(e.J.volume=h)}this.Za&&(e=this.Nd[a])&&(e.gain.value=b)};
}());
