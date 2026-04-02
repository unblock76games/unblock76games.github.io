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
var e,aa=document.getElementById("canvasBackground"),ba="big game_template gameui_level levelselectscreen endscreen_level theme_maya landscape final poki_api".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var m=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.q={};this.Sa={};this.yf={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.q.opera=!0,this.q.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Sa.ip=!0,this.q.Xk=!0,this.q.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.q.Xk=!0,this.q.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.q.Wy=!0,this.q.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.q.chrome=!0,this.q.version=f(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.q.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.q.AA=!0,this.q.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.q.PA=!0,this.q.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.q.Dq=!0,this.q.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Sa.fz=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.q.ws=!0,this.q.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.q.bh=!0,this.q.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.q.gA=!0,this.q.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.q.Up=!0,this.q.version=c||
f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.q.Ct=!0,this.q.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.yf.hB=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.q.Sp=!0,this.q.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.q.$x=!0,this.q.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name=
"Safari",this.q.xo=!0,this.q.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.q.mB=!0,!this.q.version&&c&&(this.q.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.q.lz=!0,this.q.version=this.q.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.ws?this.Sa.py=!0:a&&(this.Sa.Ik=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.ip?c=f(this,
/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.Ct?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.Up?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.Sp?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.$x&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Sa.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.ws)this.yf.Ys=!0;else if(g||"iphone"==a||"ipod"==a||b||this.Up||this.Ct||this.Sp)this.yf.Pr=!0;this.Je={Ih:!1,Zh:!1,x:!1};this.Xk&&10<=this.q.version||this.chrome&&20<=this.q.version||
this.Dq&&20<=this.q.version||this.xo&&6<=this.q.version||this.opera&&10<=this.q.version||this.Ik&&this.Sa.version&&6<=this.Sa.version.split(".")[0]?this.Je.Ih=!0:this.Xk&&10>this.q.version||this.chrome&&20>this.q.version||this.Dq&&20>this.q.version||this.xo&&6>this.q.version||this.opera&&10>this.q.version||this.Ik&&this.Sa.version&&6>this.Sa.version.split(".")[0]?this.Je.Zh=!0:this.Je.x=!0;try{this.q.te=this.q.version?parseFloat(this.q.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.q.te=0}try{this.Sa.te=
this.Sa.version?parseFloat(this.Sa.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Sa.te=0}};function da(a,b){this.x=a;this.y=b}e=da.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.T=function(){return new da(this.x,this.y)};e.add=function(a){return new da(this.x+a.x,this.y+a.y)};function ea(a,b){return new da(a.x-b.x,a.y-b.y)}e.scale=function(a){return new da(a*this.x,a*this.y)};
e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new da(a*this.x+b*this.y,-b*this.x+a*this.y)};function fa(a,b){return a.x*b.x+a.y*b.y}function ga(a){return new da(a.y,-a.x)}e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new da(0,0):new da(this.x/a,this.y/a)};
e.hc=function(a,b,c){var d=Math.min(8,this.length()/4),g=ea(this,this.normalize().scale(2*d)),h=g.add(ga(this).normalize().scale(d)),d=g.add(ga(this).normalize().scale(-d)),k=p.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function ha(a){this.Ji=4294967296;this.Ih=1664525;this.Zh=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Ji-1)):a}
ha.prototype.T=function(){var a=new ha;a.Ji=this.Ji;a.Ih=this.Ih;a.Zh=this.Zh;a.state=this.state;return a};ha.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Ih*this.state+this.Zh)%this.Ji;return this.state/this.Ji*b};function ia(a,b){var c=1;void 0!==b&&(c=b);return Math.floor(a.random(c+1))}var ja=new ha;function ka(){this.xe="";this.im=[];this.Hh=[];this.ef=[];this.ig=[];this.Gc=[];this.cb("start");this.cb("load");this.cb("game")}
function la(a){var b=ma;b.xe=a;""!==b.xe&&"/"!==b.xe[b.xe.length-1]&&(b.xe+="/")}e=ka.prototype;e.cb=function(a){this.Gc[a]||(this.Hh[a]=0,this.ef[a]=0,this.ig[a]=0,this.Gc[a]=[],this.im[a]=!1)};e.loaded=function(a){return this.Gc[a]?this.ef[a]:0};e.Pc=function(a){return this.Gc[a]?this.ig[a]:0};e.complete=function(a){return this.Gc[a]?this.ef[a]+this.ig[a]===this.Hh[a]:!0};function na(a){var b=ma;return b.Gc[a]?100*(b.ef[a]+b.ig[a])/b.Hh[a]:100}
function oa(a){var b=ma;b.ef[a]+=1;b.complete(a)&&pa("Load Complete",{hb:a})}function qa(a){var b=ma;b.ig[a]+=1;pa("Load Failed",{hb:a})}function ra(a,b,c){var d=ma;d.Gc[b]||d.cb(b);d.Gc[b].push(a);d.Hh[b]+=c}e.Jd=function(a){var b;if(!this.im[a])if(this.im[a]=!0,this.Gc[a]&&0!==this.Gc[a].length)for(b=0;b<this.Gc[a].length;b+=1)this.Gc[a][b].Jd(a,this.xe);else pa("Load Complete",{hb:a})};var ma=new ka;function sa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.Kb(a)}
sa.prototype.Kb=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};sa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function ta(a,b,c,d,g,h){var k=p;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ua(a,b,c,d){var g=p;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,d);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
sa.prototype.vc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};sa.prototype.ka=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var p=new sa(aa);function va(a,b,c){this.name=a;this.G=b;this.ev=c;this.Ic=[];this.Wm=[];ra(this,this.ev,this.G)}va.prototype.Jd=function(a,b){function c(){qa(a)}function d(){oa(a)}var g,h;for(g=0;g<this.Ic.length;g+=1)h=this.Wm[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.Ic[g].src=h,this.Ic[g].addEventListener("load",d,!1),this.Ic[g].addEventListener("error",c,!1)};
va.prototype.complete=function(){var a;for(a=0;a<this.Ic.length;a+=1)if(!this.Ic[a].complete||0===this.Ic[a].width)return!1;return!0};function wa(a,b,c){0<=b&&b<a.G&&(a.Ic[b]=new Image,a.Wm[b]=c)}va.prototype.b=function(a,b){0<=a&&a<this.G&&(this.Ic[a]=b,this.Wm[a]="")};va.prototype.va=function(a,b,c,d,g,h,k,l,n){this.Ic[a]&&this.Ic[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&p.context.drawImage(this.Ic[a],b,c,d,g,h,k,l,n))};
function u(a,b,c,d,g,h,k,l,n,q){this.name=a;this.qe=b;this.G=c;this.width=d;this.height=g;this.wb=h;this.xb=k;this.ai=l;this.wg=n;this.Tg=q;this.ne=[];this.oe=[];this.pe=[];this.Md=[];this.Ld=[];this.Nd=[];this.Od=[]}e=u.prototype;e.b=function(a,b,c,d,g,h,k,l){0<=a&&a<this.G&&(this.ne[a]=b,this.oe[a]=c,this.pe[a]=d,this.Md[a]=g,this.Ld[a]=h,this.Nd[a]=k,this.Od[a]=l)};e.complete=function(){return this.qe.complete()};
e.r=function(a,b,c){a=(Math.round(a)%this.G+this.G)%this.G;this.qe.va(this.ne[a],this.oe[a],this.pe[a],this.Md[a],this.Ld[a],b-this.wb+this.Nd[a],c-this.xb+this.Od[a])};e.Ad=function(a,b,c,d){var g=p.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.G+this.G)%this.G;this.qe.va(this.ne[a],this.oe[a],this.pe[a],this.Md[a],this.Ld[a],b-this.wb+this.Nd[a],c-this.xb+this.Od[a]);g.globalAlpha=h};
e.ya=function(a,b,c,d,g,h,k){var l=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.G+this.G)%this.G,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,g),l.globalAlpha=k,this.qe.va(this.ne[a],this.oe[a],this.pe[a],this.Md[a],this.Ld[a],this.Nd[a]-this.wb,this.Od[a]-this.xb),l.restore())};
e.hi=function(a,b,c,d,g,h,k,l){var n=p.context,q=n.globalAlpha,s,z,B,r,t,v,w,I,Y;if(0!==this.width&&0!==this.height){a=(Math.round(a)%this.G+this.G)%this.G;n.globalAlpha=l;b=Math.round(b-this.wb)%this.width;0<b&&(b-=this.width);c=Math.round(c-this.xb)%this.height;0<c&&(c-=this.height);l=Math.ceil((h-b)/this.width);s=Math.ceil((k-c)/this.height);b+=d+this.Nd[a];c+=g+this.Od[a];for(I=0;I<l;I+=1)for(Y=0;Y<s;Y+=1)r=this.oe[a],t=this.pe[a],v=this.Md[a],w=this.Ld[a],z=b+I*this.width,B=c+Y*this.height,z<
d&&(r+=d-z,v-=d-z,z=d),z+v>=d+h&&(v=d+h-z),B<g&&(t+=g-B,w-=g-B,B=g),B+w>=g+k&&(w=g+k-B),0<v&&0<w&&this.qe.va(this.ne[a],r,t,v,w,z,B);n.globalAlpha=q}};
e.va=function(a,b,c,d,g,h,k,l){var n=p.context,q=n.globalAlpha,s,z,B,r;a=(Math.round(a)%this.G+this.G)%this.G;s=this.Nd[a];z=this.Od[a];B=this.Md[a];r=this.Ld[a];b-=s;c-=z;0>=b+d||0>=c+g||b>=B||c>=r||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>B&&(d=B-b),c+g>r&&(g=r-c),n.globalAlpha=l,this.qe.va(this.ne[a],this.oe[a]+b,this.pe[a]+c,d,g,h,k),n.globalAlpha=q)};
e.Qm=function(a,b,c,d,g,h,k,l,n,q,s,z){var B,r,t,v,w,I,Y,T,ca,Ba;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),B=Math.ceil((q-b)/h),r=Math.ceil((s-c)/k),b+=l,c+=n,ca=0;ca<B;ca+=1)for(Ba=0;Ba<r;Ba+=1)w=d,I=g,Y=h,T=k,t=b+ca*h,v=c+Ba*k,t<l&&(w+=l-t,Y-=l-t,t=l),t+Y>=l+q&&(Y=l+q-t),v<n&&(I+=n-v,T-=n-v,v=n),v+T>=n+s&&(T=n+s-v),0<Y&&0<T&&this.va(a,w,I,Y,T,t,v,z)};e.dk=function(a,b,c,d,g,h,k,l,n,q){this.Qm(a,0,0,b,c,d,g,h,k,l,n,q)};
e.ck=function(a,b,c,d,g,h,k,l,n,q){var s=p.context,z=s.globalAlpha,B,r,t,v,w,I;a=(Math.round(a)%this.G+this.G)%this.G;B=l/d;r=n/g;t=this.Nd[a];v=this.Od[a];w=this.Md[a];I=this.Ld[a];b-=t;c-=v;0>=b+d||0>=c+g||b>=w||c>=I||(0>b&&(d+=b,l+=B*b,h-=B*b,b=0),0>c&&(g+=c,n+=r*c,k-=r*c,c=0),b+d>w&&(l-=B*(d-w+b),d=w-b),c+g>I&&(n-=r*(g-I+c),g=I-c),s.globalAlpha=q,this.qe.va(this.ne[a],this.oe[a]+b,this.pe[a]+c,d,g,h,k,l,n),s.globalAlpha=z)};
function xa(a,b,c){var d,g,h;for(d=0;d<a.G;d+=1)g=b+d%a.Tg*a.width,h=c+a.height*Math.floor(d/a.Tg),a.qe.va(a.ne[d],a.oe[d],a.pe[d],a.Md[d],a.Ld[d],g-a.wb+a.Nd[d],h-a.xb+a.Od[d])}function x(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.xb=this.wb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.Yk=void 0}e=x.prototype;
e.T=function(){var a=new x(this.width,this.height);a.wb=this.wb;a.xb=this.xb;y(a);this.r(0,0);A(a);return a};function y(a){a.Yk=p.canvas;p.Kb(a.canvas)}function A(a){p.canvas===a.canvas&&void 0!==a.Yk&&(p.Kb(a.Yk),a.Yk=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.r=function(a,b){p.context.drawImage(this.canvas,a-this.wb,b-this.xb)};
e.Ad=function(a,b,c){var d=p.context,g=d.globalAlpha;d.globalAlpha=c;p.context.drawImage(this.canvas,a-this.wb,b-this.xb);d.globalAlpha=g};e.ya=function(a,b,c,d,g,h){var k=p.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,p.context.drawImage(this.canvas,-this.wb,-this.xb),k.restore())};
e.hi=function(a,b,c,d,g,h,k){var l=p.context,n=l.globalAlpha,q,s,z,B,r,t,v,w,I;if(0!==this.width&&0!==this.height){l.globalAlpha=k;a=Math.round(a-this.wb)%this.width;0<a&&(a-=this.width);b=Math.round(b-this.xb)%this.height;0<b&&(b-=this.height);k=Math.ceil((g-a)/this.width);q=Math.ceil((h-b)/this.height);a+=c;b+=d;for(w=0;w<k;w+=1)for(I=0;I<q;I+=1)r=B=0,t=this.width,v=this.height,s=a+w*this.width,z=b+I*this.height,s<c&&(B+=c-s,t-=c-s,s=c),s+t>=c+g&&(t=c+g-s),z<d&&(r+=d-z,v-=d-z,z=d),z+v>=d+h&&(v=
d+h-z),0<t&&0<v&&p.context.drawImage(this.canvas,B,r,t,v,s,z,t,v);l.globalAlpha=n}};e.va=function(a,b,c,d,g,h,k){var l=p.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,p.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),l.globalAlpha=n)};
e.Qm=function(a,b,c,d,g,h,k,l,n,q,s){var z,B,r,t,v,w,I,Y,T,ca;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),z=Math.ceil((n-a)/g),B=Math.ceil((q-b)/h),a+=k,b+=l,T=0;T<z;T+=1)for(ca=0;ca<B;ca+=1)v=c,w=d,I=g,Y=h,r=a+T*g,t=b+ca*h,r<k&&(v+=k-r,I-=k-r,r=k),r+I>=k+n&&(I=k+n-r),t<l&&(w+=l-t,Y-=l-t,t=l),t+Y>=l+q&&(Y=l+q-t),0<I&&0<Y&&this.va(v,w,I,Y,r,t,s)};
e.dk=function(a,b,c,d,g,h,k,l,n){this.Qm(0,0,a,b,c,d,g,h,k,l,n)};e.ck=function(a,b,c,d,g,h,k,l,n){var q=p.context,s=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,p.context.drawImage(this.canvas,a,b,c,d,g,h,k,l),q.globalAlpha=s))};
function ya(a,b,c,d){this.U=a;this.gy=b;this.cy=c;this.tj=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.Ts=!1;ra(this,d,1)}function za(a,b,c){p.context.save();p.context.font="250pt "+a+", "+b;a=p.context.measureText(c).width;p.context.restore();return a}
function Aa(a){var b,c,d;for(b=0;b<a.tj.length;b+=1)if(c=a.tj[b],d=za(a.U,c.font,c.text),c.width!==d){oa(a.dv);document.body.removeChild(a.ue);a.Ts=!0;return}window.setTimeout(function(){Aa(a)},33)}
ya.prototype.Jd=function(a,b){var c="@font-face {font-family: "+this.U+";src: url('"+b+this.gy+"') format('woff'), url('"+b+this.cy+"') format('truetype');}",d=document.createElement("style");d.id=this.U+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.ue=document.createElement("span");this.ue.style.position="absolute";this.ue.style.left="-9999px";this.ue.style.top="-9999px";this.ue.style.visibility=
"hidden";this.ue.style.fontSize="250pt";this.ue.id=this.U+"_loader";document.body.appendChild(this.ue);for(c=0;c<this.tj.length;c+=1)d=this.tj[c],d.width=za(d.font,d.font,d.text);this.dv=a;Aa(this)};ya.prototype.complete=function(){return this.Ts};
function Ca(a,b){this.U=a;this.ji=b;this.fontWeight=this.fontStyle="";this.jd="normal";this.fontSize=12;this.fill=!0;this.zf=1;this.Qc=0;this.fillColor="black";this.hd={f:void 0,Lb:0,uo:!0,vo:!0};this.fb={lj:!0,G:3,Sj:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Xf=1;this.dh=0;this.strokeColor="black";this.strokeStyle=void 0;this.nc=1;this.sd=!1;this.me="miter";this.Y={k:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.h="top";
this.Ca=this.Ra=0}e=Ca.prototype;
e.T=function(){var a=new Ca(this.U,this.ji);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.jd=this.jd;a.fontSize=this.fontSize;a.fill=this.fill;a.zf=this.zf;a.Qc=this.Qc;a.fillColor=this.fillColor;a.hd={f:this.hd.f,uo:this.hd.uo,vo:this.hd.vo};a.fb={lj:this.fb.lj,G:this.fb.G,Sj:this.fb.Sj.slice(0),size:this.fb.size,offset:this.fb.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Xf=this.Xf;a.dh=this.dh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.nc=this.nc;a.sd=
this.sd;a.me=this.me;a.Y={k:this.Y.k,color:this.Y.color,offsetX:this.Y.offsetX,offsetY:this.Y.offsetY,blur:this.Y.blur};a.align=this.align;a.h=this.h;a.Ra=this.Ra;a.Ca=this.Ca;return a};
function C(a,b){void 0!==b.U&&(a.U=b.U);void 0!==b.ji&&(a.ji=b.ji);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.jd&&(a.jd=b.jd);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.zf&&(a.zf=b.zf);void 0!==b.fillColor&&(a.Qc=0,a.fillColor=b.fillColor);void 0!==b.hd&&(a.Qc=1,a.hd=b.hd);void 0!==b.fb&&(a.Qc=2,a.fb=b.fb);void 0!==b.fillStyle&&(a.Qc=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Xf&&(a.Xf=b.Xf);void 0!==b.strokeColor&&(a.dh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.dh=3,a.strokeStyle=b.strokeStyle);void 0!==b.nc&&(a.nc=b.nc);void 0!==b.sd&&(a.sd=b.sd);void 0!==b.me&&(a.me=b.me);void 0!==b.Y&&(a.Y=b.Y);void 0!==b.align&&(a.align=b.align);void 0!==b.h&&(a.h=b.h);void 0!==b.Ra&&(a.Ra=b.Ra);void 0!==b.Ca&&(a.Ca=b.Ca)}function Da(a,b){a.fontWeight=void 0===b?"":b}function D(a,b){a.fontSize=void 0===b?12:b}
function Ea(a,b){a.zf=void 0===b?1:b}e.setFillColor=function(a){this.Qc=0;this.fillColor=void 0===a?"black":a};function Fa(a,b,c,d,g){a.Qc=2;a.fb.lj=!0;a.fb.G=b;a.fb.Sj=c.slice(0);a.fb.size=void 0===d?.6:d;a.fb.offset=void 0===g?0:g}function Ga(a,b){a.stroke=void 0===b?!1:b}function Ha(a,b){a.Xf=void 0===b?1:b}e.setStrokeColor=function(a){this.dh=0;this.strokeColor=void 0===a?"black":a};function Ia(a,b){a.nc=void 0===b?1:b}function Ka(a,b){a.sd=void 0===b?!1:b}
function La(a,b){a.me=void 0===b?"miter":b}function Ma(a,b,c){void 0===b?a.Y.k=!0:a.Y={k:!0,color:b,offsetX:0,offsetY:c,blur:2}}function Na(a,b){a.align=void 0===b?"left":b}function Oa(a,b){a.h=void 0===b?"top":b}function Pa(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.U+", "+a.ji}function Qa(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Ra(a,b){return a.fontSize*b.length+a.Ca*(b.length-1)}
function Sa(a,b,c){var d,g,h,k,l,n,q=[],s=p.context;s.font=Pa(a);switch(a.jd){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:s.measureText(n[a]).width});return q}n=b.split("\n");h=s.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];l=s.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=s.measureText(g[b]).width,l+h+k<c?(d+=" "+g[b],l+=h+k):(q.push({text:d,width:l}),d=g[b],l=k);
q.push({text:d,width:l})}return q}e.ka=function(a,b){var c;p.context.save();c=Qa(Sa(this,a,b));p.context.restore();return c};e.ca=function(a,b){var c;p.context.save();c=Ra(this,Sa(this,a,b));p.context.restore();return c};function Ta(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?Sa(a,c,d):Sa(a,c);d=Qa(b)<=d&&Ra(a,b)<=g;a.fontSize=k;return d}
function Ua(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(p.context.save();Ta(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Ta(a,h+k,b,c,d,g)&&(h+=k);p.context.restore();return Math.max(4,h)}function Va(a,b,c,d,g){var h=Math.max(.01,a.fb.size),k=a.fb.offset;a.fb.lj?(k=g/2+k*g,h=.5*h*g,b=p.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=p.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.fb.G-1);for(d=0;d<a.fb.G;d+=1)b.addColorStop(d*c,a.fb.Sj[d]);return b}
function Wa(a,b,c,d,g,h,k){var l,n;!a.fill&&a.Y.k?(b.shadowColor=a.Y.color,b.shadowOffsetX=a.Y.offsetX,b.shadowOffsetY=a.Y.offsetY,b.shadowBlur=a.Y.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Xf;switch(a.dh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.nc;b.lineJoin=a.me;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.Ca*k;b.strokeText(c[k].text,d+l,g+n)}}
function Xa(a,b,c,d,g,h,k){c=Sa(a,c,k);k=Qa(c);var l=Ra(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.h){case "base":case "bottom":g+=-l+Math.round(a.Ra*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.Ra*a.fontSize/2)}b.font=Pa(a);a.stroke&&a.sd&&Wa(a,b,c,d,g,k,h);if(a.fill){var n=d,q=g,s,z;a.Y.k?(b.shadowColor=a.Y.color,b.shadowOffsetX=a.Y.offsetX,b.shadowOffsetY=a.Y.offsetY,b.shadowBlur=a.Y.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.zf;switch(a.Qc){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.hd.f;z=new x(l.width,l.height);var B=a.hd.uo,r=a.hd.vo;B&&r?s="repeat":B&&!r?s="repeat-x":!B&&r?s="repeat-y":B||r||(s="no-repeat");y(z);l.r(a.hd.Lb,0,0);A(z);s=p.context.createPattern(z.canvas,s);b.fillStyle=s;break;case 2:b.fillStyle=Va(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(s=0;s<c.length;s+=1){l=0;switch(a.align){case "right":l=
k-c[s].width;break;case "center":l=(k-c[s].width)/2}z=a.fontSize*(s+1)+a.Ca*s;2===a.Qc&&a.fb.lj&&(b.fillStyle=Va(a,n,q+z-a.fontSize,k,a.fontSize));b.fillText(c[s].text,n+l,q+z)}}a.stroke&&!a.sd&&Wa(a,b,c,d,g,k,h)}e.r=function(a,b,c,d){var g=p.context;this.fill&&1===this.Qc?this.ya(a,b,c,1,1,0,1,d):(g.save(),Xa(this,g,a,b,c,1,d),g.restore())};e.Ad=function(a,b,c,d,g){var h=p.context;this.fill&&1===this.Qc?this.ya(a,b,c,1,1,0,d,g):(h.save(),Xa(this,h,a,b,c,d,g),h.restore())};
e.ya=function(a,b,c,d,g,h,k,l){var n=p.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Xa(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Ya(){this.vv=10;this.xj=-1;this.Ot="stop_lowest_prio";this.Mp=this.Xa=this.jb=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.jb=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Xa=!0)}catch(d){}this.Mp=this.jb||this.Xa;this.Xa&&m.q.bh&&(this.xj=1);if(this.Mp)try{a=new Audio,this.up={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.up={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.dc=[];this.df={};this.Za={};this.uc={};this.Rd=
[];this.tc=0;this.jb?(this.Qd=new c,this.vp="function"===typeof this.Qd.createGain?function(){return b.Qd.createGain()}:"function"===typeof this.Qd.createGainNode?function(){return b.Qd.createGainNode()}:function(){},this.Sd={},this.wj=this.vp(),void 0===this.wj?(this.Xa=!0,this.th=Ya.prototype.hm):(this.wj.connect(this.Qd.destination),this.Sd.master=this.wj,this.th=Ya.prototype.Nt)):this.th=this.Xa?Ya.prototype.hm:function(){}}
function Za(a){var b=E,c,d,g,h,k;for(c=0;c<b.dc.length;c+=1)if((d=b.dc[c])&&0===d.Vm)if(d.paused)d.zp&&(d.jm+=a,d.jm>=d.zp&&b.Pf(d.id));else if(d.km+=a,d.hg&&d.km>=d.Hs)d.hg=!1,$a(b,d,d.Ud);else if(d.Hd&&b.Xa&&b.qn(d.id)>=d.duration)if(d.Sn)try{d.J.pause(),d.J.currentTime=d.Ud/1E3,4===d.J.readyState?d.J.play():(g=function(){var a=d;return{ready:function(){a.J.play();a.J.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.J.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else d.J.pause(),
ab(d);for(c=b.Rd.length-1;0<=c;c-=1)h=b.Rd[c],b.ir(h.id)||0!==h.Vm||(h.p+=a,h.p>=h.duration?(E.Id(h.id,h.$i),void 0!==b.uc[h.id]&&(b.uc[h.id]=h.$i),h.Vb&&h.Vb(),b.Rd.splice(c,1)):(k=h.eb(h.p,h.start,h.$i-h.start,h.duration),E.Id(h.id,k),void 0!==b.uc[h.id]&&(b.uc[h.id]=k)))}function bb(a,b){a.df[b.cc.s.name]?a.df[b.cc.s.name].length<a.vv&&a.df[b.cc.s.name].push(b.J):a.df[b.cc.s.name]=[b.J]}
function cb(a,b){var c,d,g;g=[];for(c=0;c<a.dc.length;c+=1)(d=a.dc[c])&&0<=d.ta.indexOf(b)&&g.push(d);return g}function db(a,b){if(0<a.xj&&a.tc>=a.xj)switch(a.Ot){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.dc.length;c+=1)(d=a.dc[c])&&d.Hd&&!d.paused&&(void 0===g||g.ll<d.ll)&&(g=d);if(g.ll>b.Dh){a.stop(g.id);break}return!1}return!0}
function eb(a,b){var c,d=1;for(c=0;c<b.ta.length;c+=1)void 0!==E.Za[b.ta[c]]&&(d*=E.Za[b.ta[c]]);c=a.vp();c.gain.value=d;c.connect(a.wj);a.Sd[b.id]=c;b.J.connect(c)}function fb(a,b){b.J.disconnect(0);a.Sd[b.id]&&(a.Sd[b.id].disconnect(0),delete a.Sd[b.id])}function gb(a,b){var c;if(b.s&&b.s.Tb){if(a.jb)return c=a.Qd.createBufferSource(),c.buffer=b.s.Tb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Xa)return c=b.s.Tb.cloneNode(!0),c.volume=0,c}}
function hb(a,b){var c,d;if(a.jb)(c=gb(a,b))&&(d=new ib(b,c));else if(a.Xa){c=a.df[b.s.name];if(!c)return;0<c.length?d=new ib(b,c.pop()):(c=gb(a,b))&&(d=new ib(b,c))}if(d){a.jb&&eb(a,d);for(c=0;c<a.dc.length;c+=1)if(void 0===a.dc[c])return a.dc[c]=d;a.dc.push(d)}return d}function jb(a){var b=E,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.up[d])return a[c];return!1}e=Ya.prototype;
e.hm=function(a,b,c){function d(){var b;a.loaded=!0;oa(c);a.duration=Math.ceil(1E3*a.Tb.duration);a.Tb.removeEventListener("canplaythrough",d,!1);a.Tb.removeEventListener("error",g,!1);b=a.Tb.cloneNode(!0);E.df[a.name].push(b)}function g(){qa(c)}(b=jb(b))?(a.Tb=new Audio,a.Tb.src=b,a.Tb.autoplay=!1,a.Tb.jA="auto",a.Tb.addEventListener("canplaythrough",d,!1),a.Tb.addEventListener("error",g,!1),a.Tb.load()):g()};
e.Nt=function(a,b,c){var d=jb(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){E.Qd.decodeAudioData(g.response,function(b){b&&(a.Tb=b,a.duration=1E3*b.duration,a.loaded=!0,oa(c))},function(){qa(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(E.jb=!1,E.Xa=!0,E.th=Ya.prototype.hm,E.th(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof F){if(db(this,a)){a=hb(this,a);if(!a)return-1;a.Hs=b||0;a.hg=0<b;a.ic=c||0;a.ce=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.hg||$a(this,a,a.Ud);return a.id}return-1}};
function $a(a,b,c){var d;"number"!==typeof c&&(c=0);kb(a,b.id);0<b.ic&&(d=lb(a,b.id),a.Id(b.id,0),mb(a,b.id,d,b.ic,b.ce),b.ic=0,b.ce=void 0);if(a.jb){d=c-b.Ud;b.Qt=1E3*a.Qd.currentTime-d;b.J.onended=function(){ab(b)};try{b.J.start?b.J.start(0,c/1E3,(b.duration-d)/1E3):b.J.noteGrainOn&&b.J.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.wd=!0,b.Hd=!0,a.tc+=1,b.J.loop=b.Sn}catch(g){}}else if(a.Xa){if(4!==b.J.readyState){var h=function(){return{ready:function(){b.J.currentTime=c/1E3;b.J.play();b.wd=!0;b.J.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.J.addEventListener("canplaythrough",h.ready,!1)}else b.J.currentTime=c/1E3,b.J.play(),b.wd=!0;b.Hd=!0;a.tc+=1}}
e.Pf=function(a,b,c,d){var g,h,k,l,n=cb(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.Hd)&&!d||!h.paused&&d){if(!d){for(g=this.Rd.length-1;0<=g;g-=1)if(a=this.Rd[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.ic=b||0;h.ce=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.rh&&(void 0===b&&(h.ic=h.rh.duration),void 0===c&&(h.ce=h.rh.eb),k=h.rh.gain,h.rh=void 0)}this.jb&&(a=gb(this,h.cc))&&(h.J=a,eb(this,h));void 0!==k&&E.Id(h.id,k);$a(this,h,h.Ud+(h.yj||0));void 0!==l&&
(E.Id(h.id,l.eb(l.p,l.start,l.$i-l.start,l.duration)),mb(E,h.id,l.$i,l.duration-l.p,l.eb,l.Vb))}};
e.pause=function(a,b,c,d,g){var h,k,l=cb(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.ic=c||0,0<h.ic)h.ce=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.rh={gain:nb(h.id),duration:h.ic,eb:h.ce},mb(E,h.id,0,h.ic,h.ce,function(){E.pause(h.id,b)});else if(k=this.qn(h.id),h.yj=k,g||(h.paused=!0,h.jm=0,h.zp=b,this.tc-=1),this.jb){h.J.onended=function(){};if(h.Hd&&h.wd){try{h.J.stop?h.J.stop(0):h.J.noteOff&&h.J.noteOff(0)}catch(n){}h.wd=!1}fb(this,h)}else this.Xa&&h.J.pause()};
function ab(a){var b=E;b.Za[a.id]&&delete b.Za[a.id];a.paused||(b.tc-=1);b.jb?(a.wd=!1,a.Hd=!1,fb(b,a)):b.Xa&&bb(b,a);b.dc[b.dc.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=cb(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.ic=b||0,0<d.ic)d.ce=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},mb(E,d.id,0,d.ic,d.ce,function(){E.stop(d.id)});else{this.Za[d.id]&&delete this.Za[d.id];d.Hd&&!d.paused&&(this.tc-=1);if(this.jb){if(d.Hd&&!d.paused&&!d.hg){if(d.wd){try{d.J.stop?d.J.stop(0):d.J.noteOff&&d.J.noteOff(0)}catch(h){}d.wd=!1}fb(this,d)}}else this.Xa&&(d.hg||d.J.pause(),bb(this,d));this.dc[this.dc.indexOf(d)]=void 0;d.Hd=!1}};
function mb(a,b,c,d,g,h){var k;for(k=0;k<a.Rd.length;k+=1)if(a.Rd[k].id===b){a.Rd.splice(k,1);break}a.Rd.push({id:b,$i:c,eb:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,p:0,start:lb(a,b),Vb:h,Vm:0})}function ob(a){var b=E,c;void 0===b.uc[a]&&(c=void 0!==b.Za[a]?b.Za[a]:1,b.Id(a,0),b.uc[a]=c)}function pb(a){var b=E;void 0!==b.uc[a]&&(b.Id(a,b.uc[a]),delete b.uc[a])}
e.position=function(a,b){var c,d,g,h,k=cb(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.jb)if(d.paused)d.yj=b;else{d.J.onended=function(){};if(d.wd){try{d.J.stop?d.J.stop(0):d.J.noteOff&&d.J.noteOff(0)}catch(l){}d.wd=!1}fb(this,d);this.tc-=1;if(g=gb(this,d.cc))d.J=g,eb(this,d),$a(this,d,d.Ud+b)}else this.Xa&&(4===d.J.readyState?d.J.currentTime=(d.Ud+b)/1E3:(h=function(){var a=d,c=b;return{Rq:function(){a.J.currentTime=(a.Ud+c)/1E3;a.J.removeEventListener("canplaythrough",
h.Rq,!1)}}}(),d.J.addEventListener("canplaythrough",h.Rq,!1)))};e.wo=function(a){E.position(a,0)};e.rs=function(a,b){var c,d=cb(this,a);for(c=0;c<d.length;c+=1)d[c].Sn=b,this.jb&&(d[c].J.loop=b)};function lb(a,b){return void 0!==a.Za[b]?a.Za[b]:1}function nb(a){var b=E,c=1,d=cb(b,a)[0];if(d)for(a=0;a<d.ta.length;a+=1)void 0!==b.Za[d.ta[a]]&&(c*=b.Za[d.ta[a]]);return Math.round(100*c)/100}
e.Id=function(a,b){var c,d,g,h=1,k=cb(this,a);this.Za[a]=b;this.uc[a]&&delete this.uc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ta.indexOf(a)){for(g=0;g<d.ta.length;g+=1)void 0!==this.Za[d.ta[g]]&&(h*=this.Za[d.ta[g]]);h=Math.round(100*h)/100;this.jb?this.Sd[d.id].gain.value=h:this.Xa&&(d.J.volume=h)}};
function kb(a,b){var c,d,g,h=1,k=cb(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.ta.length;g+=1)void 0!==a.Za[d.ta[g]]&&(h*=a.Za[d.ta[g]]);h=Math.round(100*h)/100;a.jb?a.Sd[d.id].gain.value=h:a.Xa&&(d.J.volume=h)}}e.Fp=function(a,b){var c,d,g,h=cb(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.ta.indexOf(b[g])&&d.ta.push(b[g]);kb(this,a)};e.ir=function(a){if(a=cb(this,a)[0])return a.paused};
e.qn=function(a){if(a=cb(this,a)[0]){if(this.jb)return a.paused?a.yj:(1E3*E.Qd.currentTime-a.Qt)%a.duration;if(E.Xa)return Math.ceil(1E3*a.J.currentTime-a.Ud)}};var E=new Ya;function qb(a,b,c,d){this.name=a;this.Vv=b;this.Zv=c;this.Ac=d;this.loaded=!1;this.Tb=null;ra(this,this.Ac,1)}
qb.prototype.Jd=function(a,b){var c,d;c=this.Vv;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Zv;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);E.df[this.name]=[];E.th(this,[d,c],a)};qb.prototype.complete=function(){return this.loaded};
function F(a,b,c,d,g,h,k){this.name=a;this.s=b;this.startOffset=c;this.duration=d;E.Id(this.name,void 0!==g?g:1);this.Dh=void 0!==h?h:10;this.ta=[];k&&(this.ta=this.ta.concat(k));0>this.ta.indexOf(this.name)&&this.ta.push(this.name)}F.prototype.complete=function(){return this.s.complete()};F.prototype.ll=function(a){void 0!==a&&(this.Dh=a);return this.Dh};F.prototype.Fp=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.ta.indexOf(a[b])&&this.ta.push(a[b])};
function ib(a,b){this.cc=a;this.Ud=this.cc.startOffset;this.J=b;this.duration=this.cc.duration;this.fm()}ib.prototype.fm=function(){this.id=Math.round(Date.now()*Math.random())+"";this.ta=["master",this.id].concat(this.cc.ta);this.ll=void 0!==this.cc.Dh?this.cc.Dh:10;this.paused=this.Hd=this.Sn=!1;this.km=this.Vm=0;this.wd=this.hg=!1;this.Hs=this.yj=0;var a,b=1;for(a=0;a<this.ta.length;a+=1)void 0!==E.Za[this.ta[a]]&&(b*=E.Za[this.ta[a]]);!E.jb&&E.Xa&&(this.J.volume=b)};
function rb(a){this.name=a;this.text="";this.Pc=this.complete=!1}rb.prototype.ef=function(a){4===a.readyState&&(this.complete=!0,(this.Pc=200!==a.status)?pa("Get Failed",{name:this.name}):(this.text=a.responseText,pa("Get Complete",{name:this.name})))};
function sb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.Pc=200!==c.status,a.Pc?pa("Post Failed",{name:a.name}):pa("Post Complete",{name:a.name}))};c.send(a.text)}function tb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.Pc=200!==c.status;if(a.Pc)return!1;a.text=c.responseText;return!0}
function ub(a){a&&(this.ge=a);this.clear();this.Ah=this.kg=this.ed=this.zh=this.yh=this.Ch=this.vh=this.Bh=this.Td=this.xh=this.wh=0;vb(this,this);wb(this,this);xb(this,this);this.Mb=[];this.nh=[];this.Fh=[];this.M=0;this.Ap=!1;this.Kk=this.startTime=Date.now();this.Wf=this.tk=0;this.wv=200;this.Ac="";window.qj(window.rp)}ub.prototype.clear=function(){this.D=[];this.Gh=!1;this.Sb=[];this.em=!1};
function vb(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.ge&&!(0<b.M)&&(d=b.ge,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.gg.x=h,b.gg.y=d,b.ph.push({x:b.gg.x,y:b.gg.y}),0<b.zh))for(a=b.D.length-1;0<=a&&!((h=b.D[a])&&h.k&&0>=h.M&&h.un&&(h=h.un(b.gg.x,b.gg.y),!0===h));a-=1);},!1);yb(a)}function yb(a){a.gg={x:0,y:0};a.ph=[]}
function wb(a,b){window.addEventListener("mousedown",function(a){0<b.M||(a.preventDefault(),window.focus(),b.yp>=Date.now()-1E3||(zb(b,0,a.clientX,a.clientY),Ab(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.M||(a.preventDefault(),b.vj>=Date.now()-1E3||(zb(b,0,a.clientX,a.clientY),Cb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.M||(a.preventDefault(),zb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.yp=Date.now();
if(!(0<b.M))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)zb(b,d[a].identifier,d[a].clientX,d[a].clientY),Ab(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.vj=Date.now();if(!(0<b.M))for(a.preventDefault(),a=0;a<d.length;a+=1)zb(b,d[a].identifier,d[a].clientX,d[a].clientY),Cb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.M))for(a.preventDefault(),a=0;a<d.length;a+=1)zb(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.vj=Date.now();if(!(0<b.M))for(a.preventDefault(),a=0;a<d.length;a+=1)zb(b,d[a].identifier,d[a].clientX,d[a].clientY),Cb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.vj=Date.now();if(!(0<b.M))for(a.preventDefault(),a=0;a<d.length;a+=1)zb(b,d[a].identifier,d[a].clientX,d[a].clientY),Cb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){Db(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){Db(b,a)},!1);Eb(a);a.yp=0;a.vj=0}function Eb(a){var b;a.la=[];for(b=0;16>b;b+=1)a.la[b]={id:-1,zb:!1,x:0,y:0};a.hf=[]}function Fb(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.la[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.la[d].zb){c=d;a.la[d].id=b;break}return c}
function zb(a,b,c,d){var g,h;void 0!==a.ge&&(b=Fb(a,b),-1!==b&&(g=a.ge,h=g.getBoundingClientRect(),a.la[b].x=g.width/h.width*(c-h.left),a.la[b].y=g.height/h.height*(d-h.top)))}function Ab(a,b){var c=Fb(a,b),d,g;if(-1!==c&&!a.la[c].zb&&(a.hf.push({Af:c,x:a.la[c].x,y:a.la[c].y,zb:!0}),a.la[c].zb=!0,0<a.ed))for(d=a.D.length-1;0<=d&&!((g=a.D[d])&&g.k&&0>=g.M&&g.Lg&&(g=g.Lg(c,a.la[c].x,a.la[c].y),!0===g));d-=1);}
function Cb(a,b){var c=Fb(a,b),d,g;if(-1!==c&&a.la[c].zb&&(a.hf.push({Af:c,x:a.la[c].x,y:a.la[c].y,zb:!1}),a.la[c].zb=!1,0<a.ed))for(d=a.D.length-1;0<=d&&!((g=a.D[d])&&g.k&&0>=g.M&&g.Mg&&(g=g.Mg(c,a.la[c].x,a.la[c].y),!0===g));d-=1);}
function Db(a,b){var c;if(!(0<a.M)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.hf.push({Af:0,x:a.la[0].x,y:a.la[0].y,wheelDelta:c});if(0<a.ed)for(d=a.D.length-1;0<=d&&!((g=a.D[d])&&g.k&&0>=g.M&&g.xn&&(g=g.xn(c,a.la[0].x,a.la[0].y),!0===g));d-=1);}}
function xb(a,b){window.addEventListener("keydown",function(a){0<b.M||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Gb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.M||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Hb(b,a.keyCode))},!1);Ib(a)}function Ib(a){var b;a.sh=[];for(b=0;256>b;b+=1)a.sh[b]=!1;a.jg=[]}
function Gb(a,b){var c,d;if(!a.sh[b]&&(a.jg.push({key:b,zb:!0}),a.sh[b]=!0,0<a.kg))for(c=0;c<a.D.length&&!((d=a.D[c])&&d.k&&0>=d.M&&d.vn&&(d=d.vn(b),!0===d));c+=1);}function Hb(a,b){var c,d;if(a.sh[b]&&(a.jg.push({key:b,zb:!1}),a.sh[b]=!1,0<a.kg))for(c=0;c<a.D.length&&!((d=a.D[c])&&d.k&&0>=d.M&&d.wn&&(d=d.wn(b),!0===d));c+=1);}
function Jb(a,b,c){var d=G,g=0,h=d.Mb.length,k;void 0===g&&(g=1);void 0===c&&(c=null);for(k=0;k<d.Mb.length;k+=1)d.Mb[k].id===a&&d.Mb[k].ud===c&&(h=k);if(h===d.Mb.length)for(k=0;k<d.Mb.length;k+=1)void 0===d.Mb[k].id&&(h=k);d.Mb[h]={id:a,time:b,xA:g,ud:c,ag:b,ql:g-1,paused:0}}function Kb(){var a=G,b;for(b=0;b<a.Mb.length;b+=1)a.Mb[b].paused+=1}
function pa(a,b){var c,d=G,g,h;void 0===c&&(c=null);d.Fh.push({id:a,St:b,ud:c});if(0<d.Ah)for(g=0;g<d.D.length&&(!((h=d.D[g])&&h.k&&0>=h.M&&h.yn)||null!==c&&c!==h||(h=h.yn(a,b),!0!==h));g+=1);}
function Lb(a,b){var c=a.Sb[b];c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.Kb(c.canvas),!1!==p.canvas.ia||!0===c.Sc)&&(0===c.xp&&(0>=c.M&&(c.Lb+=c.Wd*a.Wf/1E3),1===c.Wl&&1===c.Xl&&0===c.$a?1===c.alpha?c.f.r(c.Lb,c.x,c.y):c.f.Ad(c.Lb,c.x,c.y,c.alpha):c.f.ya(c.Lb,c.x,c.y,c.Wl,c.Xl,c.$a,c.alpha)),1===c.xp&&(1===c.Wl&&1===c.Xl&&0===c.$a?1===c.alpha?c.font.r(c.text,c.x,c.y):c.font.Ad(c.text,c.x,c.y,c.alpha):c.font.ya(c.text,c.x,c.y,c.Wl,c.Xl,c.$a,c.alpha)))}
function Mb(a,b){var c=a.D[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.Kb(c.canvas),(!1!==p.canvas.ia||!0===c.Sc)&&c.gb))return c.gb()}function Nb(a){for(var b=0,c=0;b<a.D.length||c<a.Sb.length;)if(c===a.Sb.length){if(!0===Mb(a,b))break;b+=1}else if(b===a.D.length)Lb(a,c),c+=1;else if(a.Sb[c].Ha>a.D[b].Ha||a.Sb[c].Ha===a.D[b].Ha&&a.Sb[c].depth>a.D[b].depth)Lb(a,c),c+=1;else{if(!0===Mb(a,b))break;b+=1}}ub.prototype.pause=function(a){this.M+=1;void 0===a&&(a=!1);this.Ap=a};
ub.prototype.Pf=function(){0!==this.M&&(this.Kk=Date.now(),this.M-=1)};ub.prototype.ir=function(){return 0<this.M};window.cm=0;window.bm=0;window.sp=0;window.Gt=0;window.tp=0;window.It=60;window.Jt=0;window.Ht=!1;
window.rp=function(){window.cm=Date.now();window.Gt=window.cm-window.bm;var a=G,b;if(0<a.M)a.Ap&&(Ob(a),Nb(a));else{b=Date.now();"number"!==typeof b&&(b=a.Kk);a.Wf=Math.min(a.wv,b-a.Kk);a.tk+=a.Wf;""===a.Ac&&(a.Ac="start",ma.Jd(a.Ac));"start"===a.Ac&&ma.complete(a.Ac)&&(a.Ac="load",ma.Jd(a.Ac));"load"===a.Ac&&ma.complete(a.Ac)&&(a.Ac="game",ma.Jd(a.Ac));"undefined"!==typeof E&&Za(a.Wf);var c,d;if(0<a.wh)for(c=0;c<a.D.length&&!((d=a.D[c])&&d.Da&&d.k&&0>=d.M&&!0===d.Da(a.Wf));c+=1);var g,h;if(0!==a.ph.length){if(0<
a.xh)for(d=a.D.length-1;0<=d;d-=1)if((g=a.D[d])&&g.k&&0>=g.M&&g.tn)for(c=0;c<a.ph.length;c+=1)h=a.ph[c],!0!==h.Uc&&(h.Uc=g.tn(h.x,h.y));a.ph=[]}if(0!==a.hf.length){if(0<a.Td)for(d=a.D.length-1;0<=d;d-=1)if((g=a.D[d])&&g.k&&0>=g.M&&(g.Fb||g.Xb||g.Bk))for(c=0;c<a.hf.length;c+=1)h=a.hf[c],!0!==h.Uc&&(void 0!==h.wheelDelta&&g.Bk?h.Uc=g.Bk(h.wheelDelta,h.x,h.y):h.zb&&g.Fb?h.Uc=g.Fb(h.Af,h.x,h.y):void 0!==h.zb&&!h.zb&&g.Xb&&(h.Uc=g.Xb(h.Af,h.x,h.y)));a.hf=[]}if(0!==a.jg.length){if(0<a.Bh)for(d=0;d<a.D.length;d+=
1)if((g=a.D[d])&&g.k&&0>=g.M&&(g.Ak||g.Ng))for(c=0;c<a.jg.length;c+=1)h=a.jg[c],!0!==h.Uc&&(h.zb&&g.Ak?h.Uc=void 0:!h.zb&&g.Ng&&(h.Uc=g.Ng(h.key)));a.jg=[]}c=a.Wf;for(d=a.nh.length=0;d<a.Mb.length;d+=1)g=a.Mb[d],void 0!==g.id&&0===g.paused&&(0<g.ag||0<g.ql)&&(g.ag-=c,0>=g.ag&&(a.nh.push({id:g.id,ud:g.ud}),0<g.ql?(g.ql-=1,g.ag+=g.time):g.ag=0));if(0<a.vh&&0<a.nh.length)for(c=0;c<a.D.length;c+=1)if((d=a.D[c])&&d.wk&&d.k)for(g=0;g<a.nh.length;g+=1)h=a.nh[g],!0===h.Uc||null!==h.ud&&h.ud!==d||(h.Uc=d.wk(h.id));
if(0<a.Ch&&0<a.Fh.length)for(c=0;c<a.D.length;c+=1)if((g=a.D[c])&&g.Tc&&g.k&&0>=g.M)for(d=0;d<a.Fh.length;d+=1)h=a.Fh[d],!0===h.Uc||null!==h.ud&&h.ud!==g||(h.Uc=g.Tc(h.id,h.St));a.Fh.length=0;if(0<a.yh)for(c=0;c<a.D.length&&!((d=a.D[c])&&d.ld&&d.k&&0>=d.M&&!0===d.ld(a.Wf));c+=1);Ob(a);Nb(a);a.Kk=b}window.bm=Date.now();window.sp=window.bm-window.cm;window.tp=Math.max(window.Jt,1E3/window.It-window.sp);window.qj(window.rp)};window.qj=function(a){window.setTimeout(a,window.tp)};
window.Ht||(window.qj=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.qj);
function Ob(a){function b(a,b){return a.Ha===b.Ha?b.depth-a.depth:a.Ha>b.Ha?-1:1}var c,d;for(c=d=0;c<a.D.length;c+=1)a.D[c]&&(a.D[c].dm&&(a.D[c].dm=!1,a.D[c].k=!0),a.D[d]=a.D[c],d+=1);a.D.length=d;a.Gh&&a.D.sort(b);a.Gh=!1;for(c=d=0;c<a.Sb.length;c+=1)a.Sb[c]&&(a.Sb[d]=a.Sb[c],d+=1);a.Sb.length=d;a.em&&a.Sb.sort(b);a.em=!1}
function Pb(a,b){var c=G;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.k&&(a.k=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ha&&(a.Ha=0);void 0===a.M&&(a.M=0);void 0===a.gf&&(a.gf=[]);a.dm=!1;void 0!==b&&!1===b&&(a.dm=!0,a.k=!1);c.D.push(a);c.Gh=!0;a.Da&&(c.wh+=1);a.tn&&(c.xh+=1);if(a.Fb||a.Xb)c.Td+=1;a.Bk&&(c.Td+=1);if(a.Ak||a.Ng)c.Bh+=1;a.wk&&(c.vh+=1);a.Tc&&(c.Ch+=1);a.ld&&(c.yh+=1);a.un&&(c.zh+=1);if(a.Lg||a.Mg)c.ed+=1;a.xn&&(c.ed+=1);if(a.vn||a.wn)c.kg+=1;a.yn&&
(c.Ah+=1);a.xc&&a.xc()}function Qb(a,b){var c=G;a.depth!==b&&(c.Gh=!0);a.depth=b}function Rb(a,b){var c;b=[].concat(b);void 0===a.gf&&(a.gf=[]);for(c=b.length-1;0<=c;c-=1)0>a.gf.indexOf(b[c])&&a.gf.push(b[c])}
function Sb(a,b){var c=[],d,g;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.D.length;d+=1)g=a.D[d],void 0!==g&&c.push(g);else if("function"===typeof b)for(d=0;d<a.D.length;d+=1)g=a.D[d],void 0!==g&&b(g)&&c.push(g);else for(d=0;d<a.D.length;d+=1)g=a.D[d],void 0!==g&&0<=g.gf.indexOf(b)&&c.push(g);return c}function Tb(a){var b=Sb(G,a);for(a=0;a<b.length;a+=1){var c=b[a];c.M+=1}}function Ub(a){var b=Sb(G,a);for(a=0;a<b.length;a+=1){var c=b[a];c.M=Math.max(0,c.M-1)}}
function H(a,b){var c=a.D.indexOf(b);if(!(0>c)){a.D[c].lc&&a.D[c].lc();var d=a.D[c];d.Da&&(a.wh-=1);d.tn&&(a.xh-=1);if(d.Fb||d.Xb)a.Td-=1;d.Bk&&(a.Td-=1);if(d.Ak||d.Ng)a.Bh-=1;d.wk&&(a.vh-=1);d.Tc&&(a.Ch-=1);d.ld&&(a.yh-=1);d.un&&(a.zh-=1);if(d.Lg||d.Mg)a.ed-=1;d.xn&&(a.ed-=1);if(d.vn||d.wn)a.kg-=1;d.yn&&(a.Ah-=1);a.D[c]=void 0}}function Vb(){var a=G,b,c=Sb(a,"item");for(b=0;b<c.length;b+=1)H(a,c[b])}
ub.prototype.b=function(a,b,c,d,g,h,k){void 0===k&&(k=0);this.Sb.push({xp:0,f:a,Lb:b,Wd:c,visible:!0,x:d,y:g,Wl:1,Xl:1,$a:0,alpha:1,depth:h,Ha:k,M:0,gf:[]});this.em=!0;return this.Sb[this.Sb.length-1]};var G=new ub(aa);
function Xb(a,b){var c;this.kind=a;this.t=null;switch(this.kind){case 0:this.t={x:[b.x],y:[b.y]};this.$=b.x;this.qa=b.y;this.Ka=b.x;this.lb=b.y;break;case 2:this.t={x:[b.x,b.x+b.kb-1,b.x+b.kb-1,b.x,b.x],y:[b.y,b.y,b.y+b.mb-1,b.y+b.mb-1,b.y]};this.$=b.x;this.qa=b.y;this.Ka=b.x+b.kb-1;this.lb=b.y+b.mb-1;break;case 3:this.t={x:[],y:[]};this.$=b.x-b.ol;this.qa=b.y-b.ol;this.Ka=b.x+b.ol;this.lb=b.y+b.ol;break;case 1:this.t={x:[b.lp,b.mp],y:[b.np,b.op]};this.$=Math.min(b.lp,b.mp);this.qa=Math.min(b.np,
b.op);this.Ka=Math.max(b.lp,b.mp);this.lb=Math.max(b.np,b.op);break;case 4:this.t={x:[],y:[]};this.$=b.x[0];this.qa=b.y[0];this.Ka=b.x[0];this.lb=b.y[0];for(c=0;c<b.x.length;c+=1)this.t.x.push(b.x[c]),this.t.y.push(b.y[c]),this.$=Math.min(this.$,b.x[c]),this.qa=Math.min(this.qa,b.y[c]),this.Ka=Math.max(this.Ka,b.x[c]),this.lb=Math.max(this.lb,b.y[c]);this.t.x.push(b.x[0]);this.t.y.push(b.y[0]);break;default:this.qa=this.$=0,this.lb=this.Ka=-1}}
function Yb(a,b,c,d){return new Xb(2,{x:a,y:b,kb:c,mb:d})}function Zb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.G;h+=1)k=a.Nd[h]-a.wb,l=k+a.Md[h]-1,n=a.Od[h]-a.xb,q=n+a.Ld[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>g&&(g=q);return new Xb(2,{x:b,y:d,kb:c-b+1,mb:g-d+1})}e=Xb.prototype;
e.T=function(){var a=new Xb(-1,{}),b;a.kind=this.kind;a.$=this.$;a.Ka=this.Ka;a.qa=this.qa;a.lb=this.lb;a.t={x:[],y:[]};for(b=0;b<this.t.x.length;b+=1)a.t.x[b]=this.t.x[b];for(b=0;b<this.t.y.length;b+=1)a.t.y[b]=this.t.y[b];return a};e.translate=function(a,b){var c=this.T(),d;c.$+=a;c.Ka+=a;c.qa+=b;c.lb+=b;for(d=0;d<c.t.x.length;d+=1)c.t.x[d]+=a;for(d=0;d<c.t.y.length;d+=1)c.t.y[d]+=b;return c};
e.scale=function(a){var b=this.T(),c;b.$*=a;b.Ka*=a;b.qa*=a;b.lb*=a;for(c=0;c<b.t.x.length;c+=1)b.t.x[c]*=a;for(c=0;c<b.t.y.length;c+=1)b.t.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new da(this.t.x[0],this.t.y[0]),b=b.rotate(a),new Xb(0,{x:b.x,y:b.y});case 1:return b=new da(this.t.x[0],this.t.y[0]),b=b.rotate(a),c=new da(this.t.x[1],this.t.y[1]),c=c.rotate(a),new Xb(1,{lp:b.x,np:b.y,mp:c.x,op:c.y});case 3:return b=(this.Ka-this.$)/2,c=new da(this.$+b,this.qa+b),c=c.rotate(a),new Xb(3,{x:c.x,y:c.y,ol:b});default:c=[];d=[];for(g=0;g<this.t.x.length-1;g+=1)b=new da(this.t.x[g],this.t.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Xb(4,{x:c,y:d})}};function $b(a,b,c,d){var g=new da(0,0),h,k=1E9,l=-1E10,n;for(n=0;n<a.t.x.length;n+=1)g.x=b+a.t.x[n],g.y=c+a.t.y[n],h=fa(g,d),k=Math.min(k,h),l=Math.max(l,h);return{min:k,max:l}}function ac(a){var b=new da(0,0),c=new da(0,0),d=[],g;for(g=0;g<a.t.x.length-1;g+=1)b.x=a.t.x[g],b.y=a.t.y[g],c.x=a.t.x[g+1],c.y=a.t.y[g+1],d.push(ga(ea(b,c)).normalize());return d}
function bc(a,b,c,d,g,h){var k,l,n,q;if(g+d.Ka<b+a.$||g+d.$>b+a.Ka||h+d.lb<c+a.qa||h+d.qa>c+a.lb)return!1;if(2===a.kind&&2===d.kind)return!0;if(3===d.kind)return k=(d.Ka-d.$)/2,cc(a,b,c,g+d.$+k,h+d.qa+k,k);if(3===a.kind)return k=(a.Ka-a.$)/2,cc(d,g,h,b+a.$+k,c+a.qa+k,k);if(0===d.kind)return dc(a,b,c,g+d.$,h+d.qa);if(0===a.kind)return dc(d,g,h,b+a.$,c+a.qa);k=ac(a).concat(ac(d));for(q=0;q<k.length;q+=1)if(l=$b(a,b,c,k[q]),n=$b(d,g,h,k[q]),l.max<n.min||n.max<l.min)return!1;return!0}
function cc(a,b,c,d,g,h){var k,l,n,q,s,z,B;if(d+h<b+a.$||d-h>b+a.Ka||g+h<c+a.qa||g-h>c+a.lb)return!1;switch(a.kind){case 0:return l=d-(b+a.$),n=g-(c+a.qa),l*l+n*n<=h*h;case 3:return q=(a.Ka-a.$)/2,l=d-(b+a.$+q),n=g-(c+a.qa+q),l*l+n*n<=(q+h)*(q+h);default:q=ac(a);s=k=0;z=1E9;for(B=0;B<a.t.x.length;B+=1)l=b+a.t.x[B]-d,n=c+a.t.y[B]-g,l=l*l+n*n,l<=z&&(k=b+a.t.x[B],s=c+a.t.y[B],z=l);d=new da(d,g);q.push(ea(d,new da(k,s)).normalize());for(B=0;B<q.length;B+=1)if(k=fa(d,q[B]),g=k-h,k+=h,s=$b(a,b,c,q[B]),
k<s.min||s.max<g)return!1;return!0}}function dc(a,b,c,d,g){var h,k,l,n;if(d<b+a.$||d>b+a.Ka||g<c+a.qa||g>c+a.lb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return h=(a.Ka-a.$)/2,d-=b+a.$+h,g-=c+a.qa+h,d*d+g*g<=h*h;case 1:return h=b+a.t.x[0],k=c+a.t.y[0],b+=a.t.x[1],a=c+a.t.y[1],d===h?g===k:d===b?g===a:1>Math.abs(k+(d-h)*(a-k)/(b-h)-g);case 4:h=ac(a);for(k=0;k<h.length;k+=1)if(l=new da(d,g),l=fa(l,h[k]),n=$b(a,b,c,h[k]),l<n.min||n.max<l)return!1;return!0;default:return!1}}
e.hc=function(a,b,c){var d=p.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.$-1,b+this.qa-1,3,3);break;case 2:d.fillRect(a+this.$,b+this.qa,this.Ka-this.$+1,this.lb-this.qa+1);break;case 3:c=(this.Ka-this.$)/2;d.beginPath();d.arc(a+this.$+c,b+this.qa+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);d.lineTo(a+this.t.x[1],b+this.t.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);
for(c=1;c<this.t.x.length-1;c+=1)d.lineTo(a+this.t.x[c],b+this.t.y[c]);d.closePath();d.fill()}};function ec(){this.depth=1E7;this.visible=!1;this.k=!0;this.group="Engine";this.pa=[];this.uh=this.M=this.Eh=!1;this.ye=1;this.Hc=-1;this.ua=-1E6}e=ec.prototype;e.T=function(){var a=new ec,b;for(b=0;b<this.pa.length;b+=1)a.pa.push({hb:this.pa[b].hb,action:this.pa[b].action});a.uh=this.uh;return a};
e.cb=function(a,b){var c,d;if(0===this.pa.length||this.pa[this.pa.length-1].hb<=a)this.pa.push({hb:a,action:b});else{for(c=0;this.pa[c].hb<=a;)c+=1;for(d=this.pa.length;d>c;d-=1)this.pa[d]=this.pa[d-1];this.pa[c]={hb:a,action:b}}this.ua=-1E6};e.start=function(){this.Eh=!0;this.M=!1;this.Hc=0>this.ye&&0<this.pa.length?this.pa[this.pa.length-1].hb+1:-1;this.ua=-1E6;H(G,this);Pb(this)};
e.wo=function(){if(0>this.ye&&0<this.pa.length){var a=this.pa[this.pa.length-1].hb;this.Hc=0>this.ye?a+1:a-1}else this.Hc=0>this.ye?1:-1;this.ua=-1E6};e.stop=function(){this.Eh=!1;H(G,this)};e.bc=function(){return this.Eh};e.pause=function(){this.M=!0;H(G,this)};e.Pf=function(){this.M=!1;H(G,this);Pb(this)};e.paused=function(){return this.Eh&&this.M};e.rs=function(a){this.uh=a};
e.Da=function(a){if(this.Eh&&!this.M&&0!==this.ye)if(0<this.ye){0>this.ua&&(this.ua=0);for(;this.ua<this.pa.length&&this.pa[this.ua].hb<=this.Hc;)this.ua+=1;for(this.Hc+=this.ye*a;0<=this.ua&&this.ua<this.pa.length&&this.pa[this.ua].hb<=this.Hc;)this.pa[this.ua].action(this.pa[this.ua].hb,this),this.ua+=1;this.ua>=this.pa.length&&(this.uh?this.wo():this.stop())}else{0>this.ua&&(this.ua=this.pa.length-1);for(;0<=this.ua&&this.pa[this.ua].hb>=this.Hc;)this.ua-=1;for(this.Hc+=this.ye*a;0<=this.ua&&this.pa[this.ua].hb>=
this.Hc;)this.pa[this.ua].action(this.pa[this.ua].hb,this),this.ua-=1;0>this.ua&&0>=this.Hc&&(this.uh?this.wo():this.stop())}};function fc(){this.depth=1E7;this.visible=!1;this.k=!0;this.group="Engine";this.Rb=[];this.cf=[];this.clear();this.vx=!1;Pb(this)}e=fc.prototype;e.Da=function(){var a,b,c,d,g;if(this.vx)for(a=0;16>a;a+=1)G.la[a].zb&&(b=G.la[a].x,c=G.la[a].y,d=this.cf[a],g=this.Rb[d],!(0<=d&&g&&g.selected)||g&&dc(g.Vc,0,0,b,c)||(Hb(G,g.keyCode),g.selected=!1,this.cf[a]=-1),this.Fb(a,b,c))};
e.Fb=function(a,b,c){var d;if(!(0<=this.cf[a]))for(d=0;d<this.Rb.length;d+=1){var g;if(g=this.Rb[d])g=(g=this.Rb[d])?dc(g.Vc,0,0,b,c):!1;if(g&&!this.Rb[d].selected){Gb(G,this.Rb[d].keyCode);this.Rb[d].selected=!0;this.cf[a]=d;break}}};e.Xb=function(a){var b=this.cf[a];0<=b&&this.Rb[b]&&this.Rb[b].selected&&(Hb(G,this.Rb[b].keyCode),this.Rb[b].selected=!1);this.cf[a]=-1};function gc(a,b,c,d,g,h,k){c=Yb(c,d,g,h);a.Rb.push({keyCode:k,Vc:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.Rb.length=0;16>a;a+=1)this.cf[a]=-1};e.hc=function(a,b,c){var d,g,h,k;for(d=0;d<this.Rb.length;d+=1)if(g=this.Rb[d])g.selected?g.Vc.hc(0,0,b):g.Vc.hc(0,0,a),h=(g.Vc.$+g.Vc.Ka)/2,k=(g.Vc.qa+g.Vc.lb)/2,p.vc("id: "+g.id,h-20,k-10,c,"16px Arial"),p.vc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new ha;function hc(a,b){return b}function ic(a,b,c,d){return b+a/d*c}function jc(a,b,c,d,g){void 0===g&&(g=3);return b+c*Math.pow(a/d,g)}
function kc(a,b,c,d){return jc(a,b,c,d,2)}function lc(a,b,c,d){return jc(a,b,c,d,3)}function mc(a,b,c,d){return b+c*jc(d-a,1,-1,d,3)}function nc(a,b,c,d){return b+c*(a<d/2?jc(a,0,.5,d/2,3):jc(d-a,1,-.5,d/2,3))}function oc(a,b,c,d,g){a=d-a;var h=3,k=g;void 0===h&&(h=3);void 0===k&&(k=8);g=Math.sin(2*(1-a/d)*Math.PI*h+Math.PI/2);h=k;void 0===h&&(h=8);k=Math.pow(2,-h);g*=0+(Math.pow(2,h*a/d-h)-k)/(1-k)*1;return b+c*(1+-1*g)}
function pc(a,b,c,d,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2))}function qc(a,b,c,d,g){return b+c*pc(d-a,1,-1,d,g)}
function rc(a){switch(1){case 0:return function(b,c,d,g,h,k,l){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,l)};case 1:return function(b,c,d,g,h,k,l){return a(b-Math.floor(b/g)*g,c,d,g,h,k,l)};case 2:return function(b,c,d,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*b};case 3:return function(b,c,d,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+d*(n+b)};default:return function(b,c,d,g,h,k,l){return a(b,c,d,g,h,k,l)}}}
function sc(a,b,c){var d,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),g=a[d]===hc?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,s,z,B,r,t){var v,w;v=a.length-1;for(w=0;w<a.length;w+=1)if(d/z<=l[w+1]){v=w;break}d=a[v](d/z-l[v],0,1,c[v],B,r,t);b[v]&&(d=-d);return g+(k[v]+d)*s/h}}
var J=window.TG_InitSettings||{};J.size=void 0!==J.size?J.size:"big";J.ut=J.usesFullScreen;J.yo="big"===J.size?1:.5;J.Bf=20;J.Dg=10;J.Hq=0;J.uk=-10;J.Eg=-20;J.jc=-30;J.de=-40;
function K(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(J.yo*a);break a;case "round":c=Math.round(J.yo*a);break a;default:c=J.yo*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=K(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=K(a[c],b));return a}}function L(a){return"big"===J.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}var M=M||{};M["nl-nl"]=M["nl-nl"]||{};
M["nl-nl"].LevelStartHeader="Doel";M["nl-nl"].LevelStartAssignment="Maak het veld binnen de tijd leeg";M["nl-nl"].TutorialHeader_1="Instructies";M["nl-nl"].TutorialText_1="#touch{Klik}{Tik} op een tegel om hem te selecteren";M["nl-nl"].TutorialHeader_2="Instructies";M["nl-nl"].TutorialText_2="Selecteer twee tegels van dezelfde soort die alleen met twee hoeken op elkaar aansluiten.";M["nl-nl"].TutorialHeader_3="Instructies";M["nl-nl"].TutorialText_3="De lijn mag geen andere tegels kruisen.";
M["nl-nl"].TutorialHeader_4="Voortgang";M["nl-nl"].TutorialText_4="Als je een match hebt gemaakt, verdwijnen de tegels en verdien je extra tijd.";M["nl-nl"].TutorialHeader_5="Voortgang";M["nl-nl"].TutorialText_5="Om het level te voltooien, moet je alle tegels binnen de tijd verwijderen.";M["nl-nl"].TutorialHeader_6="Speciaal";M["nl-nl"].TutorialText_6="Dit is een obstakel. Je kunt geen match maken met obstakels.";M["nl-nl"].levelMapScreenWorld_1="Levels 10-18";M["nl-nl"].levelMapScreenWorld_0="Levels 1-9";
M["nl-nl"].levelMapScreenWorld_2="Levels 19-27";M["nl-nl"].levelMapScreenWorld_3="Levels 28-36";M["nl-nl"].levelMapScreenWorld_4="Levels 37-45";M["nl-nl"].levelMapScreenWorld_5="Levels 46-47";M["nl-nl"].levelMapScreenWorld_6="Levels 55-63";M["nl-nl"].OutOfMoves="Geen zetten meer";M["nl-nl"].ComboEnd="Combo gereset!";M["nl-nl"].TimeAddedMultiple="+<TIME>s";M["nl-nl"].TimeAddedSingle="+1s";M["nl-nl"].Congrats="Goed gedaan!";M["nl-nl"].TimeUp="Je tijd is om!";M["en-us"]=M["en-us"]||{};
M["en-us"].LevelStartHeader="Goal";M["en-us"].LevelStartAssignment="Clear the field within the time limit";M["en-us"].TutorialHeader_1="How to play";M["en-us"].TutorialText_1="#touch{Click}{Tap} on a tile to select it.";M["en-us"].TutorialHeader_2="How to play";M["en-us"].TutorialText_2="Select two tiles of the same type that can only be linked with two corners.";M["en-us"].TutorialHeader_3="How to play";M["en-us"].TutorialText_3="The line may not intersect other tiles.";
M["en-us"].TutorialHeader_4="Progress";M["en-us"].TutorialText_4="When you make a match, the tiles disappear and you earn extra time.";M["en-us"].TutorialHeader_5="Progress";M["en-us"].TutorialText_5="Clear all tiles within the time limit to complete the level.";M["en-us"].TutorialHeader_6="Special";M["en-us"].TutorialText_6="This is a blocker. Blockers cannot be matched.";M["en-us"].levelMapScreenWorld_1="Levels 10-18";M["en-us"].levelMapScreenWorld_0="Levels 1-9";
M["en-us"].levelMapScreenWorld_2="Levels 19-27";M["en-us"].levelMapScreenWorld_3="Levels 28-36";M["en-us"].levelMapScreenWorld_4="Levels 37-45";M["en-us"].levelMapScreenWorld_5="Levels 46-47";M["en-us"].levelMapScreenWorld_6="Levels 55-63";M["en-us"].OutOfMoves="Out of moves";M["en-us"].ComboEnd="Combo reset!";M["en-us"].TimeAddedMultiple="+<TIME>s";M["en-us"].TimeAddedSingle="+1s";M["en-us"].Congrats="Well done!";M["en-us"].TimeUp="Time's up!";M["en-gb"]=M["en-gb"]||{};
M["en-gb"].LevelStartHeader="Goal";M["en-gb"].LevelStartAssignment="Clear the field within the time limit";M["en-gb"].TutorialHeader_1="How to play";M["en-gb"].TutorialText_1="#touch{Click}{Tap} on a tile to select it.";M["en-gb"].TutorialHeader_2="How to play";M["en-gb"].TutorialText_2="Select two tiles of the same type that can only be linked with two corners.";M["en-gb"].TutorialHeader_3="How to play";M["en-gb"].TutorialText_3="The line may not intersect other tiles.";
M["en-gb"].TutorialHeader_4="Progress";M["en-gb"].TutorialText_4="When you make a match, the tiles disappear and you earn extra time.";M["en-gb"].TutorialHeader_5="Progress";M["en-gb"].TutorialText_5="Clear all tiles within the time limit to complete the level.";M["en-gb"].TutorialHeader_6="Special";M["en-gb"].TutorialText_6="This is a blocker. Blockers cannot be matched.";M["en-gb"].levelMapScreenWorld_1="Levels 10-18";M["en-gb"].levelMapScreenWorld_0="Levels 1-9";
M["en-gb"].levelMapScreenWorld_2="Levels 19-27";M["en-gb"].levelMapScreenWorld_3="Levels 28-36";M["en-gb"].levelMapScreenWorld_4="Levels 37-45";M["en-gb"].levelMapScreenWorld_5="Levels 46-47";M["en-gb"].levelMapScreenWorld_6="Levels 55-63";M["en-gb"].OutOfMoves="Out of moves";M["en-gb"].ComboEnd="Combo reset!";M["en-gb"].TimeAddedMultiple="+<TIME>s";M["en-gb"].TimeAddedSingle="+1s";M["en-gb"].Congrats="Well done!";M["en-gb"].TimeUp="Time's up!";M["de-de"]=M["de-de"]||{};
M["de-de"].LevelStartHeader="Ziel";M["de-de"].LevelStartAssignment="R\u00e4ume das Spielfeld innerhalb des Zeitlimits leer.";M["de-de"].TutorialHeader_1="So wird gespielt";M["de-de"].TutorialText_1="#touch{Klicke}{Tippe} auf ein Feld, um es auszuw\u00e4hlen.";M["de-de"].TutorialHeader_2="So wird gespielt";M["de-de"].TutorialText_2="W\u00e4hle zwei Felder desselben Typs aus, die nur mit zwei Ecken verbunden werden k\u00f6nnen.";M["de-de"].TutorialHeader_3="So wird gespielt";
M["de-de"].TutorialText_3="Diese Linie darf keine anderen Felder kreuzen.";M["de-de"].TutorialHeader_4="Fortschritt";M["de-de"].TutorialText_4="Wenn du ein Paar geschafft hast, verschwinden die Felder und bekommst zus\u00e4tzliche Zeit.";M["de-de"].TutorialHeader_5="Fortschritt";M["de-de"].TutorialText_5="R\u00e4ume alle Felder innerhalb des Zeitlimits ab, um das Level abzuschlie\u00dfen.";M["de-de"].TutorialHeader_6="Extra";M["de-de"].TutorialText_6="Das ist ein Blocker. Mit Blockern k\u00f6nnen keine Paare gebildet werden.";
M["de-de"].levelMapScreenWorld_1="Levels 10-18";M["de-de"].levelMapScreenWorld_0="Levels 1-9";M["de-de"].levelMapScreenWorld_2="Levels 19-27";M["de-de"].levelMapScreenWorld_3="Levels 28-36";M["de-de"].levelMapScreenWorld_4="Levels 37-45";M["de-de"].levelMapScreenWorld_5="Levels 46-47";M["de-de"].levelMapScreenWorld_6="Levels 55-63";M["de-de"].OutOfMoves="Keine Z\u00fcge mehr";M["de-de"].ComboEnd="Combo zur\u00fcckgesetzt!";M["de-de"].TimeAddedMultiple="+<TIME> Sek.";M["de-de"].TimeAddedSingle="+1 Sek.";
M["de-de"].Congrats="Sehr gut!";M["de-de"].TimeUp="Die Zeit ist um!";M["fr-fr"]=M["fr-fr"]||{};M["fr-fr"].LevelStartHeader="Objectif";M["fr-fr"].LevelStartAssignment="D\u00e9barrassez-vous de toutes les tuiles avant la fin du temps imparti.";M["fr-fr"].TutorialHeader_1="Comment jouer";M["fr-fr"].TutorialText_1="#touch{Cliquez sur}{Tapotez} une tuile pour la s\u00e9lectionner.";M["fr-fr"].TutorialHeader_2="Comment jouer";M["fr-fr"].TutorialText_2="S\u00e9lectionnez deux tuiles du m\u00eame type et qui peuvent \u00eatre reli\u00e9es par deux bords.";
M["fr-fr"].TutorialHeader_3="Comment jouer";M["fr-fr"].TutorialText_3="La ligne ne doit pas couper d'autres tuiles.";M["fr-fr"].TutorialHeader_4="Progression";M["fr-fr"].TutorialText_4="Quand vous r\u00e9ussissez une association, les tuiles disparaissent et vous obtenez du temps suppl\u00e9mentaire.";M["fr-fr"].TutorialHeader_5="Progression";M["fr-fr"].TutorialText_5="D\u00e9barrassez-vous de toutes les tuiles avant la fin du temps imparti pour r\u00e9ussir le niveau.";
M["fr-fr"].TutorialHeader_6="Sp\u00e9cial";M["fr-fr"].TutorialText_6="Ceci est un bloqueur. Les bloqueurs ne peuvent pas \u00eatre associ\u00e9s.";M["fr-fr"].levelMapScreenWorld_1="Niveaux 10-18";M["fr-fr"].levelMapScreenWorld_0="Niveaux 1-9";M["fr-fr"].levelMapScreenWorld_2="Niveaux 19-27";M["fr-fr"].levelMapScreenWorld_3="Niveaux 28-36";M["fr-fr"].levelMapScreenWorld_4="Niveaux 37-45";M["fr-fr"].levelMapScreenWorld_5="Niveaux 46-47";M["fr-fr"].levelMapScreenWorld_6="Niveaux 55-63";
M["fr-fr"].OutOfMoves="D\u00e9placements \u00e9puis\u00e9s";M["fr-fr"].ComboEnd="Combo r\u00e9initialis\u00e9\u00a0!";M["fr-fr"].TimeAddedMultiple="+<TIME>s";M["fr-fr"].TimeAddedSingle="+1s";M["fr-fr"].Congrats="Bien jou\u00e9\u00a0!";M["fr-fr"].TimeUp="Temps \u00e9coul\u00e9\u00a0!";M["pt-pt"]=M["pt-pt"]||{};M["pt-pt"].LevelStartHeader="Objectivo";M["pt-pt"].LevelStartAssignment="Limpa o campo dentro do prazo limite";M["pt-pt"].TutorialHeader_1="Como se joga";M["pt-pt"].TutorialText_1="#touch {Click} {Toca} numa pe\u00e7a para selecion\u00e1-la.";
M["pt-pt"].TutorialHeader_2="Como se joga";M["pt-pt"].TutorialText_2="Seleccione duas pe\u00e7as do mesmo tipo que s\u00f3 podem ser ligadas a dois dos cantos.";M["pt-pt"].TutorialHeader_3="Como jogar";M["pt-pt"].TutorialText_3="A linha n\u00e3o pode tocar noutras pe\u00e7as";M["pt-pt"].TutorialHeader_4="Progresso";M["pt-pt"].TutorialText_4="Quando fazes uma sequ\u00eancia, as pe\u00e7as desaparecem e ganhas tempo extra";M["pt-pt"].TutorialHeader_5="Progresso";M["pt-pt"].TutorialText_5="Limpa todas as pe\u00e7as dentro do tempo limite para completares o n\u00edvel";
M["pt-pt"].TutorialHeader_6="Especial";M["pt-pt"].TutorialText_6="Este \u00e9 um bloqueador. Os bloqueadores n\u00e3o podem ser jogados.";M["pt-pt"].levelMapScreenWorld_1="N\u00edveis 10-18";M["pt-pt"].levelMapScreenWorld_0="N\u00edveis 1-9";M["pt-pt"].levelMapScreenWorld_2="N\u00edveis 19-27";M["pt-pt"].levelMapScreenWorld_3="N\u00edveis 28-36";M["pt-pt"].levelMapScreenWorld_4="N\u00edveis 37-45";M["pt-pt"].levelMapScreenWorld_5="N\u00edveis 46-47";M["pt-pt"].levelMapScreenWorld_6="N\u00edveis 55-63";
M["pt-pt"].OutOfMoves="Sem movimentos";M["pt-pt"].ComboEnd="Rep\u00f4r combo";M["pt-pt"].TimeAddedMultiple="+<TIME>s";M["pt-pt"].TimeAddedSingle="+1s";M["pt-pt"].Congrats="Muito bem!";M["pt-pt"].TimeUp="Acabou o tempo!";M["pt-br"]=M["pt-br"]||{};M["pt-br"].LevelStartHeader="Objetivo";M["pt-br"].LevelStartAssignment="Remova todas as pe\u00e7as dentro do limite de tempo.";M["pt-br"].TutorialHeader_1="Como jogar";M["pt-br"].TutorialText_1="#touch{Clique}{Toque} em uma pe\u00e7a para selecion\u00e1-la.";
M["pt-br"].TutorialHeader_2="Como jogar";M["pt-br"].TutorialText_2="Selecione duas pe\u00e7as do mesmo tipo que s\u00f3 possam ser ligadas por dois cantos.";M["pt-br"].TutorialHeader_3="Como jogar";M["pt-br"].TutorialText_3="A linha n\u00e3o pode cruzar outras pe\u00e7as.";M["pt-br"].TutorialHeader_4="Progresso";M["pt-br"].TutorialText_4="Ao fazer uma combina\u00e7\u00e3o, as pe\u00e7as desaparecem e voc\u00ea ganha tempo extra.";M["pt-br"].TutorialHeader_5="Progresso";M["pt-br"].TutorialText_5="Remova todas as pe\u00e7as dentro do limite de tempo para concluir o n\u00edvel.";
M["pt-br"].TutorialHeader_6="Especial";M["pt-br"].TutorialText_6="Isto \u00e9 um bloqueador. Bloqueadores n\u00e3o podem fazer combina\u00e7\u00f5es.";M["pt-br"].levelMapScreenWorld_1="N\u00edveis 10 a 18";M["pt-br"].levelMapScreenWorld_0="N\u00edveis 1 a 9";M["pt-br"].levelMapScreenWorld_2="N\u00edveis 19 a 27";M["pt-br"].levelMapScreenWorld_3="N\u00edveis 28 a 36";M["pt-br"].levelMapScreenWorld_4="N\u00edveis 37 a 45";M["pt-br"].levelMapScreenWorld_5="N\u00edveis 46 a 54";
M["pt-br"].levelMapScreenWorld_6="N\u00edveis 55 a 63";M["pt-br"].OutOfMoves="N\u00e3o h\u00e1 mais jogadas.";M["pt-br"].ComboEnd="Combo reiniciado!";M["pt-br"].TimeAddedMultiple="+<TIME> seg.";M["pt-br"].TimeAddedSingle="+1 seg.";M["pt-br"].Congrats="Muito bem!";M["pt-br"].TimeUp="Tempo esgotado!";M["es-es"]=M["es-es"]||{};M["es-es"].LevelStartHeader="Objetivo";M["es-es"].LevelStartAssignment="Despeja la zona de juego a tiempo";M["es-es"].TutorialHeader_1="C\u00f3mo jugar";
M["es-es"].TutorialText_1="#touch{Haz clic en}{Toca} una ficha para elegirla.";M["es-es"].TutorialHeader_2="C\u00f3mo jugar";M["es-es"].TutorialText_2="Elige dos fichas del mismo tipo que solo se unan por dos esquinas.";M["es-es"].TutorialHeader_3="C\u00f3mo jugar";M["es-es"].TutorialText_3="La l\u00ednea no puede cruzar otras fichas.";M["es-es"].TutorialHeader_4="Progreso";M["es-es"].TutorialText_4="Cuando combines dos iguales, las fichas desaparecen y ganas m\u00e1s tiempo.";
M["es-es"].TutorialHeader_5="Progreso";M["es-es"].TutorialText_5="Quita todas las fichas a tiempo para terminar el nivel.";M["es-es"].TutorialHeader_6="Especial";M["es-es"].TutorialText_6="Esto es un bloqueo. Los bloqueos no se combinan.";M["es-es"].levelMapScreenWorld_1="Niveles 10-18";M["es-es"].levelMapScreenWorld_0="Niveles 1-9";M["es-es"].levelMapScreenWorld_2="Niveles 19-27";M["es-es"].levelMapScreenWorld_3="Niveles 28-36";M["es-es"].levelMapScreenWorld_4="Niveles 37-45";
M["es-es"].levelMapScreenWorld_5="Niveles 46-47";M["es-es"].levelMapScreenWorld_6="Niveles 55-63";M["es-es"].OutOfMoves="Sin movimientos";M["es-es"].ComboEnd="\u00a1Combo reiniciado!";M["es-es"].TimeAddedMultiple="+<TIME> s";M["es-es"].TimeAddedSingle="+1 s";M["es-es"].Congrats="\u00a1Muy bien!";M["es-es"].TimeUp="\u00a1Tiempo!";M["tr-tr"]=M["tr-tr"]||{};M["tr-tr"].LevelStartHeader="Ama\u00e7";M["tr-tr"].LevelStartAssignment="Zaman dolmadan sahadaki t\u00fcm kartlar\u0131 temizle";
M["tr-tr"].TutorialHeader_1="Nas\u0131l Oynan\u0131r";M["tr-tr"].TutorialText_1="Tu\u011flay\u0131 se\u00e7mek i\u00e7in \u00fcst\u00fcne #touch{T\u0131kla}{Dokun}.";M["tr-tr"].TutorialHeader_2="Nas\u0131l Oynan\u0131r";M["tr-tr"].TutorialText_2="Sadece iki k\u00f6\u015fe ile birle\u015ftirilebilen ayn\u0131 t\u00fcrde iki tu\u011fla se\u00e7.";M["tr-tr"].TutorialHeader_3="Nas\u0131l Oynan\u0131r";M["tr-tr"].TutorialText_3="\u00c7izgi, di\u011fer tu\u011flalar\u0131 ge\u00e7emez.";
M["tr-tr"].TutorialHeader_4="\u0130lerleme";M["tr-tr"].TutorialText_4="E\u015fle\u015ftirdi\u011finde tu\u011flalar yok olur ve ekstra zaman kazan\u0131rs\u0131n.";M["tr-tr"].TutorialHeader_5="\u0130lerleme";M["tr-tr"].TutorialText_5="B\u00f6l\u00fcm\u00fc ge\u00e7mek i\u00e7in zaman dolmadan t\u00fcm tu\u011flalar\u0131 temizle.";M["tr-tr"].TutorialHeader_6="\u00d6zel";M["tr-tr"].TutorialText_6="Bu bir bloktur. Bloklar e\u015fle\u015ftirilemez.";M["tr-tr"].levelMapScreenWorld_1="B\u00f6l\u00fcm 10-18";
M["tr-tr"].levelMapScreenWorld_0="B\u00f6l\u00fcm 1-9";M["tr-tr"].levelMapScreenWorld_2="B\u00f6l\u00fcm 19-27";M["tr-tr"].levelMapScreenWorld_3="B\u00f6l\u00fcm 28-36";M["tr-tr"].levelMapScreenWorld_4="B\u00f6l\u00fcm 37-45";M["tr-tr"].levelMapScreenWorld_5="B\u00f6l\u00fcm 46-47";M["tr-tr"].levelMapScreenWorld_6="B\u00f6l\u00fcm 55-63";M["tr-tr"].OutOfMoves="Hareket kalmad\u0131";M["tr-tr"].ComboEnd="Kombo s\u0131f\u0131rland\u0131!";M["tr-tr"].TimeAddedMultiple="+<TIME>s";
M["tr-tr"].TimeAddedSingle="+1s";M["tr-tr"].Congrats="Tebrikler!";M["tr-tr"].TimeUp="Zaman doldu!";M["ru-ru"]=M["ru-ru"]||{};M["ru-ru"].LevelStartHeader="\u0426\u0435\u043b\u044c";M["ru-ru"].LevelStartAssignment="\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u043f\u043e\u043b\u0435 \u0437\u0430 \u043e\u0442\u0432\u0435\u0434\u0451\u043d\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";M["ru-ru"].TutorialHeader_1="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";
M["ru-ru"].TutorialText_1="\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u043f\u043b\u0438\u0442\u043a\u0443, \u0447\u0442\u043e\u0431\u044b \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u0435\u0451";M["ru-ru"].TutorialHeader_2="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";M["ru-ru"].TutorialText_2="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0432\u0435 \u043f\u043b\u0438\u0442\u043a\u0438 \u0442\u043e\u0433\u043e \u0436\u0435 \u0442\u0438\u043f\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u0441\u0432\u044f\u0437\u0430\u043d\u044b \u0442\u043e\u043b\u044c\u043a\u043e \u0441 \u0434\u0432\u0443\u043c\u044f \u0443\u0433\u043b\u0430\u043c\u0438.";
M["ru-ru"].TutorialHeader_3="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";M["ru-ru"].TutorialText_3="\u041b\u0438\u043d\u0438\u044f \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u043f\u0435\u0440\u0435\u0441\u0435\u043a\u0430\u0442\u044c \u0434\u0440\u0443\u0433\u0438\u0435 \u043f\u043b\u0438\u0442\u043a\u0438.";M["ru-ru"].TutorialHeader_4="\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441";M["ru-ru"].TutorialText_4="\u041a\u043e\u0433\u0434\u0430 \u0432\u044b \u0434\u0435\u043b\u0430\u0435\u0442\u0435 \u0441\u043e\u043f\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043f\u043b\u0438\u0442\u043a\u0438 \u0438\u0441\u0447\u0435\u0437\u0430\u044e\u0442 \u0438 \u0432\u044b \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442\u0435 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";
M["ru-ru"].TutorialHeader_5="\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441";M["ru-ru"].TutorialText_5="\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u0432\u0441\u0435 \u043f\u043b\u0438\u0442\u043a\u0438 \u0437\u0430 \u043e\u0442\u0432\u0435\u0434\u0451\u043d\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";M["ru-ru"].TutorialHeader_6="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e";M["ru-ru"].TutorialText_6="\u042d\u0442\u043e \u0431\u043b\u043e\u043a\u0430\u0442\u043e\u0440. \u0411\u043b\u043e\u043a\u0430\u0442\u043e\u0440\u044b \u043d\u0435 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u0441\u043e\u043f\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u044b.";
M["ru-ru"].levelMapScreenWorld_1="\u0423\u0440\u043e\u0432\u043d\u0438 10-18";M["ru-ru"].levelMapScreenWorld_0="\u0423\u0440\u043e\u0432\u043d\u0438 1-9";M["ru-ru"].levelMapScreenWorld_2="\u0423\u0440\u043e\u0432\u043d\u0438 19-27";M["ru-ru"].levelMapScreenWorld_3="\u0423\u0440\u043e\u0432\u043d\u0438 28-36";M["ru-ru"].levelMapScreenWorld_4="\u0423\u0440\u043e\u0432\u043d\u0438 37-45";M["ru-ru"].levelMapScreenWorld_5="\u0423\u0440\u043e\u0432\u043d\u0438 46-47";M["ru-ru"].levelMapScreenWorld_6="\u0423\u0440\u043e\u0432\u043d\u0438 55-63";
M["ru-ru"].OutOfMoves="\u041d\u0435\u0442 \u0445\u043e\u0434\u043e\u0432";M["ru-ru"].ComboEnd="\u041a\u043e\u043c\u0431\u043e \u0441\u0431\u0440\u043e\u0441!";M["ru-ru"].TimeAddedMultiple="+<TIME>s";M["ru-ru"].TimeAddedSingle="+1s";M["ru-ru"].Congrats="\u041e\u0442\u043b\u0438\u0447\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430!";M["ru-ru"].TimeUp="\u0412\u0440\u0435\u043c\u044f \u0432\u044b\u0448\u043b\u043e!";M["jp-jp"]=M["jp-jp"]||{};M["jp-jp"].LevelStartHeader="\u30b4\u30fc\u30eb";
M["jp-jp"].LevelStartAssignment="\u6642\u9593\u5185\u306b\u5168\u30bf\u30a4\u30eb\u3092\u6d88\u305d\u3046\uff01";M["jp-jp"].TutorialHeader_1="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_1="#touch{\u30af\u30ea\u30c3\u30af}{\u30bf\u30c3\u30d7}\u3057\u3066\u30bf\u30a4\u30eb\u3092\u9078\u629e\u3057\u307e\u3059";M["jp-jp"].TutorialHeader_2="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_2="3\u3064\u4ee5\u5185\u306e\u76f4\u7dda\u3067\n\u7d50\u3079\u308b\u4f4d\u7f6e\u306b\u3042\u308b\n\u540c\u3058\u30bf\u30a4\u30eb\u30922\u3064\u9078\u3073\u307e\u3059";
M["jp-jp"].TutorialHeader_3="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_3="\u76f4\u7dda\u306f\u30bf\u30a4\u30eb\u306e\u4e0a\u3092\n\u6a2a\u5207\u308c\u307e\u305b\u3093";M["jp-jp"].TutorialHeader_4="\u9032\u3081\u65b9";M["jp-jp"].TutorialText_4="\u30da\u30a2\u3092\u4f5c\u308b\u3068\u30bf\u30a4\u30eb\u304c\u6d88\u3048\u3066\n\u30a8\u30af\u30b9\u30c8\u30e9\u30bf\u30a4\u30e0\u304c\u3082\u3089\u3048\u307e\u3059";M["jp-jp"].TutorialHeader_5="\u9032\u3081\u65b9";M["jp-jp"].TutorialText_5="\u6642\u9593\u5185\u306b\u5168\u30bf\u30a4\u30eb\u3092\u6d88\u3059\u3068\n\u30b2\u30fc\u30e0\u30af\u30ea\u30a2\uff01";
M["jp-jp"].TutorialHeader_6="\u30b9\u30da\u30b7\u30e3\u30eb";M["jp-jp"].TutorialText_6="\u3053\u306e\u30d6\u30ed\u30c3\u30ab\u30fc\u3067\u306f\n\u30da\u30a2\u3092\u4f5c\u308c\u307e\u305b\u3093";M["jp-jp"].levelMapScreenWorld_1="\u30ec\u30d9\u30eb 10-18";M["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb 1-9";M["jp-jp"].levelMapScreenWorld_2="\u30ec\u30d9\u30eb 19-27";M["jp-jp"].levelMapScreenWorld_3="\u30ec\u30d9\u30eb 28-36";M["jp-jp"].levelMapScreenWorld_4="\u30ec\u30d9\u30eb 37-45";
M["jp-jp"].levelMapScreenWorld_5="\u30ec\u30d9\u30eb 46-47";M["jp-jp"].levelMapScreenWorld_6="\u30ec\u30d9\u30eb 55-63";M["jp-jp"].OutOfMoves="\u3053\u308c\u4ee5\u4e0a\u52d5\u304b\u305b\u307e\u305b\u3093";M["jp-jp"].ComboEnd="\u30b3\u30f3\u30dc\u30ea\u30bb\u30c3\u30c8\uff01";M["jp-jp"].TimeAddedMultiple="\uff0b<TIME>\u79d2";M["jp-jp"].TimeAddedSingle="\uff0b1\u79d2";M["jp-jp"].Congrats="\u3084\u3063\u305f\u306d\uff01";M["jp-jp"].TimeUp="\u6642\u9593\u5207\u308c\uff01";M["it-it"]=M["it-it"]||{};
M["it-it"].LevelStartHeader="Obiettivo";M["it-it"].LevelStartAssignment="Pulisci il campo entro il tempo stabilito";M["it-it"].TutorialHeader_1="Come giocare";M["it-it"].TutorialText_1="#touch{Clicca}{Tocca} una casella per selezionarla.";M["it-it"].TutorialHeader_2="Come giocare";M["it-it"].TutorialText_2="Seleziona due caselle dello stesso tipo che possono essere collegate solo per due angoli";M["it-it"].TutorialHeader_3="Come giocare";M["it-it"].TutorialText_3="La linea non pu\u00f2 incrociare altre caselle.";
M["it-it"].TutorialHeader_4="Progressi";M["it-it"].TutorialText_4="Quando fai una combinazione, le caselle scompaiono e tu guadagni tempo extra.";M["it-it"].TutorialHeader_5="Progressi";M["it-it"].TutorialText_5="Elimina tutte le caselle entro il tempo stabilito per completare il livello.";M["it-it"].TutorialHeader_6="Speciale";M["it-it"].TutorialText_6="Questo \u00e8 un blocco. I blocchi non possono essere abbinati.";M["it-it"].levelMapScreenWorld_1="Livello 10-18";
M["it-it"].levelMapScreenWorld_0="Livello 1-9";M["it-it"].levelMapScreenWorld_2="Livello 19-27";M["it-it"].levelMapScreenWorld_3="Livello 28 - 36";M["it-it"].levelMapScreenWorld_4="Livello 37- 45";M["it-it"].levelMapScreenWorld_5="Livello 45 - 54";M["it-it"].levelMapScreenWorld_6="Livello 55- 63";M["it-it"].OutOfMoves="Mosse terminate";M["it-it"].ComboEnd="Combo azzerata!";M["it-it"].TimeAddedMultiple="+<TIME>s";M["it-it"].TimeAddedSingle="+1s";M["it-it"].Congrats="Ben fatto!";M["it-it"].TimeUp="Tempo scaduto!";
var N={},O={},P={},tc={},uc={},vc=new va("StartTexture",2,"start");wa(vc,0,"media/StartTexture0.png");wa(vc,1,"media/StartTexture1.png");var wc=new va("StartScreenTexture",1,"load");wa(wc,0,"media/StartScreenTexture0.png");var xc=new va("LevelMapScreenTexture",2,"load");wa(xc,0,"media/LevelMapScreenTexture0.png");wa(xc,1,"media/LevelMapScreenTexture1.png");var yc=new va("LevelEndTexture",4,"load");wa(yc,0,"media/LevelEndTexture0.png");wa(yc,1,"media/LevelEndTexture1.png");wa(yc,2,"media/LevelEndTexture2.png");
wa(yc,3,"media/LevelEndTexture3.png");var Q=new va("MenuTexture",2,"load");wa(Q,0,"media/MenuTexture0.png");wa(Q,1,"media/MenuTexture1.png");var R=new va("GameTexture",1,"load");wa(R,0,"media/GameTexture0.png");var zc=new va("GameStaticTexture",2,"load");wa(zc,0,"media/GameStaticTexture0.png");wa(zc,1,"media/GameStaticTexture1.png");var Ac=new va("TutorialTexture",1,"load");wa(Ac,0,"media/TutorialTexture0.png");var Bc=new va("EndScreenTexture",2,"load");wa(Bc,0,"media/EndScreenTexture0.png");
wa(Bc,1,"media/EndScreenTexture1.png");var Cc=new va("BirdTexture",1,"load");wa(Cc,0,"media/BirdTexture0.png");var Dc=new u("s_loadingbar_background",wc,1,42,32,0,0,42,32,1);Dc.b(0,0,313,1,42,32,0,0);var Ec=new u("s_level_0",xc,1,125,140,0,0,125,140,1);Ec.b(0,0,585,1,125,140,0,0);var Fc=new u("s_level_1",xc,1,125,140,0,0,125,140,1);Fc.b(0,0,841,1,125,140,0,0);var Gc=new u("s_level_2",xc,1,125,140,0,0,125,140,1);Gc.b(0,0,713,1,125,140,0,0);var Hc=new u("s_level_3",xc,1,125,140,0,0,125,140,1);
Hc.b(0,0,585,145,125,140,0,0);var Ic=new u("s_level_lock",xc,1,48,70,0,0,48,70,1);Ic.b(0,0,969,1,48,69,0,1);var Jc=new u("s_level_stars",xc,1,126,46,0,0,126,46,1);Jc.b(0,0,713,145,126,45,0,1);var Kc=new u("s_level2_0",xc,1,84,87,0,0,84,87,1);Kc.b(0,0,929,257,84,87,0,0);var Lc=new u("s_level2_1",xc,1,84,87,0,0,84,87,1);Lc.b(0,0,585,289,84,87,0,0);var Mc=new u("s_level2_2",xc,1,84,87,0,0,84,87,1);Mc.b(0,0,841,257,84,87,0,0);var Nc=new u("s_level2_3",xc,1,84,87,0,0,84,87,1);
Nc.b(0,0,673,305,84,87,0,0);var Oc=new u("s_level2_arrow_right",xc,2,60,108,0,0,60,216,1);Oc.b(0,0,777,193,60,108,0,0);Oc.b(1,0,713,193,60,108,0,0);var Pc=new u("s_level2_arrow_left",xc,2,60,108,0,0,60,216,1);Pc.b(0,0,905,145,60,108,0,0);Pc.b(1,0,841,145,60,108,0,0);var Qc=new u("s_level2_lock",xc,1,84,87,0,0,84,87,1);Qc.b(0,0,761,353,84,87,0,0);var Rc=new u("s_pop_medal",yc,8,378,378,189,189,3024,378,8);Rc.b(0,0,1,633,349,241,3,69);Rc.b(1,1,1,633,346,267,5,54);Rc.b(2,0,353,633,348,276,20,56);
Rc.b(3,2,1,1,342,288,26,50);Rc.b(4,2,689,1,319,292,22,46);Rc.b(5,2,1,297,337,304,14,41);Rc.b(6,1,353,633,343,305,12,41);Rc.b(7,2,345,1,341,304,13,41);var Sc=new u("s_medal_shadow",yc,1,195,208,0,0,195,208,1);Sc.b(0,2,833,569,189,204,3,1);var Tc=new u("s_medal_shine",yc,6,195,208,0,0,1170,208,6);Tc.b(0,3,201,1,193,207,1,1);Tc.b(1,3,401,1,193,207,1,1);Tc.b(2,3,801,1,193,207,1,1);Tc.b(3,3,601,1,193,207,1,1);Tc.b(4,3,1,217,193,207,1,1);Tc.b(5,3,1,1,193,207,1,1);
var Uc=new u("s_icon_toggle_hard",Q,1,67,67,0,0,67,67,1);Uc.b(0,0,953,193,67,67,0,0);var Vc=new u("s_icon_toggle_medium",Q,1,67,67,0,0,67,67,1);Vc.b(0,0,945,337,67,67,0,0);var Wc=new u("s_icon_toggle_easy",Q,1,67,67,0,0,67,67,1);Wc.b(0,0,945,265,67,67,0,0);var Xc=new u("s_flagIcon_us",Q,1,48,48,0,0,48,48,1);Xc.b(0,0,945,833,48,36,0,6);var Yc=new u("s_flagIcon_gb",Q,1,48,48,0,0,48,48,1);Yc.b(0,0,961,753,48,36,0,6);var Zc=new u("s_flagIcon_nl",Q,1,48,48,0,0,48,48,1);Zc.b(0,0,945,873,48,36,0,6);
var $c=new u("s_flagIcon_tr",Q,1,48,48,0,0,48,48,1);$c.b(0,0,713,921,48,36,0,6);var ad=new u("s_flagIcon_de",Q,1,48,48,0,0,48,48,1);ad.b(0,0,937,953,48,36,0,6);var bd=new u("s_flagIcon_fr",Q,1,48,48,0,0,48,48,1);bd.b(0,0,825,921,48,36,0,6);var cd=new u("s_flagIcon_br",Q,1,48,48,0,0,48,48,1);cd.b(0,0,769,921,48,36,0,6);var dd=new u("s_flagIcon_es",Q,1,48,48,0,0,48,48,1);dd.b(0,0,601,921,48,36,0,6);var fd=new u("s_flagIcon_jp",Q,1,48,48,0,0,48,48,1);fd.b(0,0,945,913,48,36,0,6);
var gd=new u("s_flagIcon_ru",Q,1,48,48,0,0,48,48,1);gd.b(0,0,657,921,48,36,0,6);var hd=new u("s_flagIcon_ar",Q,1,48,48,0,0,48,48,1);hd.b(0,0,545,921,48,36,0,6);var id=new u("s_flagIcon_kr",Q,1,48,48,0,0,48,48,1);id.b(0,0,961,793,48,36,0,6);var jd=new u("s_flagIcon_it",Q,1,48,48,0,0,48,48,1);jd.b(0,0,881,921,48,36,0,6);var ld=new u("s_tutorialButton_close",Q,1,66,65,0,0,66,65,1);ld.b(0,0,929,553,65,65,0,0);var md=new u("s_tutorialButton_next",Q,1,66,65,0,0,66,65,1);md.b(0,0,929,481,66,65,0,0);
var nd=new u("s_tutorialButton_previous",Q,1,66,65,0,0,66,65,1);nd.b(0,0,929,409,66,65,0,0);(new u("s_logo_tinglygames",Q,1,240,240,0,0,240,240,1)).b(0,0,1,633,240,240,0,0);var od=new u("s_logo_coolgames",Q,1,240,240,0,0,240,240,1);od.b(0,0,249,633,240,167,0,36);(new u("s_logo_tinglygames_start",wc,1,156,54,0,0,156,54,1)).b(0,0,1,1,156,53,0,0);var pd=new u("s_logo_coolgames_start",wc,1,300,104,0,0,300,104,1);pd.b(0,0,161,1,150,104,75,0);var qd=new u("s_star01_empty",yc,1,170,170,85,85,170,170,1);
qd.b(0,2,257,841,163,168,2,2);var rd=new u("s_star01_fill",yc,1,170,170,85,85,170,170,1);rd.b(0,3,665,217,142,147,14,17);var sd=new u("s_star02_empty",yc,1,170,170,85,85,170,170,1);sd.b(0,2,833,777,168,162,1,1);var td=new u("s_star02_fill",yc,1,170,170,85,85,170,170,1);td.b(0,0,1,881,146,141,12,16);var ud=new u("s_star03_empty",yc,1,170,170,85,85,170,170,1);ud.b(0,2,609,833,164,168,4,2);var vd=new u("s_star03_fill",yc,1,170,170,85,85,170,170,1);vd.b(0,3,521,217,142,148,14,16);
var wd=new u("s_sfx_star",yc,8,300,300,150,150,2400,300,8);wd.b(0,3,809,217,134,131,85,89);wd.b(1,2,1,609,250,244,19,27);wd.b(2,2,345,585,257,253,17,20);wd.b(3,2,345,313,266,263,12,15);wd.b(4,1,705,633,262,273,13,10);wd.b(5,2,689,297,251,270,19,12);wd.b(6,2,617,569,213,260,38,16);wd.b(7,0,705,633,243,299,23,1);(new u("s_ui_cup_highscore",R,1,32,28,0,0,32,28,1)).b(0,0,881,369,32,28,0,0);(new u("s_ui_cup_score",R,1,28,24,0,0,28,24,1)).b(0,0,617,513,28,24,0,0);
var xd=new u("s_ui_divider",zc,1,94,2,0,0,94,2,1);xd.b(0,0,769,1,94,2,0,0);var yd=new u("s_ui_background_blank",zc,1,140,580,0,0,140,580,1);yd.b(0,0,625,1,140,580,0,0);var zd=new u("s_ui_highscore",zc,1,26,36,13,12,26,36,1);zd.b(0,0,865,1,26,36,0,0);var Ad=new u("s_ui_heart",R,1,28,24,14,12,28,24,1);Ad.b(0,0,889,561,26,23,1,1);var Bd=new u("s_ui_progressbar_stars_frame",R,1,120,118,60,60,120,118,1);Bd.b(0,0,793,193,120,118,0,0);
var Cd=new u("s_ui_progressbar_stars_background",R,1,120,190,60,60,120,190,1);Cd.b(0,0,897,1,120,190,0,0);var Dd=new u("s_tutorial_00",Ac,1,350,190,0,0,350,190,1);Dd.b(0,0,617,113,107,100,128,32);var Ed=new u("s_tutorial_01",Ac,1,350,190,0,0,350,190,1);Ed.b(0,0,353,89,261,103,53,40);var Fd=new u("s_tutorial_02",Ac,1,350,190,0,0,350,190,1);Fd.b(0,0,705,1,261,104,53,40);var Gd=new u("s_tutorial_03",Ac,1,350,190,0,0,350,190,1);Gd.b(0,0,353,1,344,79,3,56);
var Hd=new u("s_tutorial_04",Ac,1,350,190,0,0,350,190,1);Hd.b(0,0,1,1,350,190,0,0);var Id=new u("s_tutorial_05",Ac,1,350,190,0,0,350,190,1);Id.b(0,0,729,113,70,70,128,62);var Jd=new u("s_btn_big_restart",yc,2,154,152,0,0,308,152,2);Jd.b(0,2,1,857,154,152,0,0);Jd.b(1,3,201,217,154,152,0,0);var Kd=new u("s_btn_big_start",yc,2,154,152,0,0,308,152,2);Kd.b(0,2,425,841,154,152,0,0);Kd.b(1,3,361,217,154,152,0,0);var Ld=new u("s_btn_small_exit",Q,2,100,92,0,0,200,92,2);Ld.b(0,0,825,441,100,92,0,0);
Ld.b(1,0,825,537,100,92,0,0);var Md=new u("s_btn_small_options",Q,2,100,92,0,0,200,92,2);Md.b(0,0,825,345,100,92,0,0);Md.b(1,0,233,905,100,92,0,0);var Nd=new u("s_btn_small_retry",yc,2,100,92,0,0,200,92,2);Nd.b(0,0,905,97,100,92,0,0);Nd.b(1,0,905,1,100,92,0,0);var Od=new u("s_btn_standard",Q,2,96,92,0,0,192,92,2);Od.b(0,0,337,905,96,92,0,0);Od.b(1,0,441,921,96,92,0,0);var Pd=new u("s_btn_toggle",Q,2,162,92,0,0,324,92,2);Pd.b(0,0,825,1,162,92,0,0);Pd.b(1,0,825,97,162,92,0,0);
var Qd=new u("s_icon_toggle_fxoff",Q,2,227,92,0,0,454,92,2);Qd.b(0,0,497,729,227,92,0,0);Qd.b(1,0,497,633,227,92,0,0);var Rd=new u("s_icon_toggle_fxon",Q,2,227,92,0,0,454,92,2);Rd.b(0,0,729,633,227,92,0,0);Rd.b(1,0,729,729,227,92,0,0);var Sd=new u("s_icon_toggle_musicoff",Q,2,227,92,0,0,454,92,2);Sd.b(0,0,249,809,227,92,0,0);Sd.b(1,0,713,825,227,92,0,0);var Td=new u("s_icon_toggle_musicon",Q,2,227,92,0,0,454,92,2);Td.b(0,0,1,881,227,92,0,0);Td.b(1,0,481,825,227,92,0,0);
var Ud=new u("s_btn_bigtext",yc,2,137,104,0,0,274,104,2);Ud.b(0,0,297,913,137,104,0,0);Ud.b(1,0,153,881,137,104,0,0);var Vd=new u("s_icon_toggle_sfx_on",Q,1,67,67,0,0,67,67,1);Vd.b(0,0,961,713,49,31,7,17);var Wd=new u("s_icon_toggle_sfx_off",Q,1,67,67,0,0,67,67,1);Wd.b(0,0,961,625,53,31,7,17);var Xd=new u("s_icon_toggle_music_on",Q,1,67,67,0,0,67,67,1);Xd.b(0,0,545,961,38,41,13,16);var Yd=new u("s_icon_toggle_music_off",Q,1,67,67,0,0,67,67,1);Yd.b(0,0,961,665,51,41,8,16);
var Zd=new u("s_screen_start",vc,4,576,320,0,0,1152,640,2);Zd.b(0,0,1,329,576,320,0,0);Zd.b(1,1,1,1,576,320,0,0);Zd.b(2,0,1,1,576,320,0,0);Zd.b(3,0,1,657,576,320,0,0);var $d=new u("s_overlay_options",Q,1,820,626,0,0,820,626,1);$d.b(0,0,1,1,820,626,0,0);var ae=new u("s_overlay_level_win",yc,1,953,626,0,0,953,626,1);ae.b(0,0,1,1,898,626,55,0);var be=new u("s_overlay_level_fail",yc,1,953,626,0,0,953,626,1);be.b(0,1,1,1,888,626,0,0);var ce=new u("s_screen_end",Bc,4,576,320,0,0,1152,640,2);
ce.b(0,0,1,329,576,320,0,0);ce.b(1,1,1,1,576,320,0,0);ce.b(2,0,1,1,576,320,0,0);ce.b(3,0,1,657,576,320,0,0);var de=new u("s_screen_levelselect",xc,4,576,320,0,0,1152,640,2);de.b(0,0,1,329,576,320,0,0);de.b(1,1,1,1,576,320,0,0);de.b(2,0,1,657,576,320,0,0);de.b(3,0,1,1,576,320,0,0);var ee=new u("s_overlay_assignment",zc,1,621,415,0,0,621,415,1);ee.b(0,0,1,1,621,415,0,0);var fe=new u("s_tutorial",Q,1,560,532,0,0,560,532,1);fe.b(0,1,1,1,560,532,0,0);
var ge=new u("s_background",zc,4,576,320,0,0,1152,640,2);ge.b(0,1,1,329,576,320,0,0);ge.b(1,0,1,425,576,320,0,0);ge.b(2,1,1,1,576,320,0,0);ge.b(3,1,1,657,576,320,0,0);var he=new u("s_ui_progressbar_frame",R,1,116,124,58,58,116,124,1);he.b(0,0,673,185,116,124,0,0);var ie=new u("s_star_empty",R,1,24,23,12,11,24,23,1);ie.b(0,0,953,561,24,23,0,0);var je=new u("s_star_filled",R,1,24,23,12,11,24,23,1);je.b(0,0,921,561,24,23,0,0);var ke=new u("s_logo",vc,1,480,266,0,0,480,266,1);
ke.b(0,1,1,329,480,266,0,0);N.Kw=new u("s_tile_1",R,1,70,70,0,0,70,70,1);N.Kw.b(0,0,585,441,70,70,0,0);N.Vw=new u("s_tile_2",R,1,70,70,0,0,70,70,1);N.Vw.b(0,0,297,441,70,70,0,0);N.bx=new u("s_tile_3",R,1,70,70,0,0,70,70,1);N.bx.b(0,0,153,441,70,70,0,0);N.cx=new u("s_tile_4",R,1,70,70,0,0,70,70,1);N.cx.b(0,0,945,417,70,70,0,0);N.dx=new u("s_tile_5",R,1,70,70,0,0,70,70,1);N.dx.b(0,0,225,441,70,70,0,0);N.ex=new u("s_tile_6",R,1,70,70,0,0,70,70,1);N.ex.b(0,0,441,441,70,70,0,0);
N.fx=new u("s_tile_7",R,1,70,70,0,0,70,70,1);N.fx.b(0,0,1,449,70,70,0,0);N.gx=new u("s_tile_8",R,1,70,70,0,0,70,70,1);N.gx.b(0,0,513,441,70,70,0,0);N.hx=new u("s_tile_9",R,1,70,70,0,0,70,70,1);N.hx.b(0,0,369,441,70,70,0,0);N.Lw=new u("s_tile_10",R,1,70,70,0,0,70,70,1);N.Lw.b(0,0,145,513,70,70,0,0);N.Mw=new u("s_tile_11",R,1,70,70,0,0,70,70,1);N.Mw.b(0,0,289,513,70,70,0,0);N.Nw=new u("s_tile_12",R,1,70,70,0,0,70,70,1);N.Nw.b(0,0,217,513,70,70,0,0);N.Ow=new u("s_tile_13",R,1,70,70,0,0,70,70,1);
N.Ow.b(0,0,73,513,70,70,0,0);N.Pw=new u("s_tile_14",R,1,70,70,0,0,70,70,1);N.Pw.b(0,0,945,489,70,70,0,0);N.Qw=new u("s_tile_15",R,1,70,70,0,0,70,70,1);N.Qw.b(0,0,801,481,70,70,0,0);N.Rw=new u("s_tile_16",R,1,70,70,0,0,70,70,1);N.Rw.b(0,0,657,481,70,70,0,0);N.Sw=new u("s_tile_17",R,1,70,70,0,0,70,70,1);N.Sw.b(0,0,873,489,70,70,0,0);N.Tw=new u("s_tile_18",R,1,70,70,0,0,70,70,1);N.Tw.b(0,0,729,481,70,70,0,0);N.Uw=new u("s_tile_19",R,1,70,70,0,0,70,70,1);N.Uw.b(0,0,81,441,70,70,0,0);
N.Ww=new u("s_tile_20",R,1,70,70,0,0,70,70,1);N.Ww.b(0,0,801,409,70,70,0,0);N.Xw=new u("s_tile_21",R,1,70,70,0,0,70,70,1);N.Xw.b(0,0,81,369,70,70,0,0);N.Yw=new u("s_tile_22",R,1,70,70,0,0,70,70,1);N.Yw.b(0,0,297,369,70,70,0,0);N.Zw=new u("s_tile_23",R,1,70,70,0,0,70,70,1);N.Zw.b(0,0,225,369,70,70,0,0);N.$w=new u("s_tile_24",R,1,70,70,0,0,70,70,1);N.$w.b(0,0,153,369,70,70,0,0);N.ax=new u("s_tile_25",R,1,70,70,0,0,70,70,1);N.ax.b(0,0,369,369,70,70,0,0);
N.ix=new u("s_tile_special",R,1,70,70,0,0,70,70,1);N.ix.b(0,0,513,369,70,70,0,0);var le=new u("s_block",R,1,70,70,0,0,70,70,1);le.b(0,0,441,369,70,70,0,0);var me=new u("s_line_start",R,1,70,70,35,35,70,70,1);me.b(0,0,729,409,70,70,0,0);var ne=new u("s_line_hor",R,1,50,12,0,0,50,12,1);ne.b(0,0,785,553,50,12,0,0);var oe=new u("s_line_vert",R,1,12,50,0,0,12,50,1);oe.b(0,0,881,313,12,50,0,0);var pe=new u("s_line_corner",R,12,70,62,35,40,840,62,12);pe.b(0,0,545,561,46,41,14,10);
pe.b(1,0,489,561,47,40,14,10);pe.b(2,0,841,561,44,39,17,12);pe.b(3,0,1,561,48,34,12,16);pe.b(4,0,729,553,51,32,11,18);pe.b(5,0,433,513,55,31,9,19);pe.b(6,0,617,553,54,33,9,17);pe.b(7,0,1,521,54,35,9,14);pe.b(8,0,673,553,54,37,9,12);pe.b(9,0,497,513,55,40,8,10);pe.b(10,0,433,553,54,39,9,10);pe.b(11,0,561,513,54,40,9,9);O.Wc=new u("s_bird_intro_1",Cc,12,316,283,62,223,3792,283,12);O.Wc.b(0,0,497,369,17,11,52,216);O.Wc.b(1,0,953,169,16,21,53,207);O.Wc.b(2,0,1001,1,22,33,53,195);
O.Wc.b(3,0,513,529,29,53,53,175);O.Wc.b(4,0,705,689,41,74,53,154);O.Wc.b(5,0,305,585,50,92,48,136);O.Wc.b(6,0,929,1,67,99,37,128);O.Wc.b(7,0,113,361,114,150,9,77);O.Wc.b(8,0,545,1,121,188,18,39);O.Wc.b(9,0,785,193,110,181,55,46);O.Wc.b(10,0,137,1,131,201,55,26);O.Wc.b(11,0,337,505,100,76,139,14);O.Xc=new u("s_bird_intro_2",Cc,12,316,283,62,223,3792,283,12);O.Xc.b(0,0,473,369,17,11,52,216);O.Xc.b(1,0,1001,81,16,21,53,207);O.Xc.b(2,0,1001,41,22,33,53,195);O.Xc.b(3,0,473,313,29,53,53,175);
O.Xc.b(4,0,97,689,41,74,53,154);O.Xc.b(5,0,361,585,50,92,48,136);O.Xc.b(6,0,441,529,67,99,37,128);O.Xc.b(7,0,113,209,114,150,9,77);O.Xc.b(8,0,545,193,121,188,18,39);O.Xc.b(9,0,673,193,110,181,55,46);O.Xc.b(10,0,273,1,131,201,55,26);O.Xc.b(11,0,105,513,100,76,139,14);O.Yc=new u("s_bird_intro_3",Cc,12,316,283,62,223,3792,283,12);O.Yc.b(0,0,1001,169,17,11,52,216);O.Yc.b(1,0,929,169,16,21,53,207);O.Yc.b(2,0,561,481,22,33,53,195);O.Yc.b(3,0,993,521,29,53,53,175);O.Yc.b(4,0,753,689,41,74,53,154);
O.Yc.b(5,0,865,537,50,92,48,136);O.Yc.b(6,0,473,209,67,99,37,128);O.Yc.b(7,0,353,209,114,150,9,77);O.Yc.b(8,0,801,1,121,188,18,39);O.Yc.b(9,0,1,209,110,181,55,46);O.Yc.b(10,0,409,1,131,201,55,26);O.Yc.b(11,0,665,521,100,76,139,14);O.Zc=new u("s_bird_intro_4",Cc,12,316,283,62,223,3792,283,12);O.Zc.b(0,0,521,369,17,11,52,216);O.Zc.b(1,0,977,169,16,21,53,207);O.Zc.b(2,0,561,441,22,33,53,195);O.Zc.b(3,0,505,313,29,53,53,175);O.Zc.b(4,0,345,681,41,74,53,154);O.Zc.b(5,0,97,593,50,92,48,136);
O.Zc.b(6,0,921,521,67,99,37,128);O.Zc.b(7,0,233,209,114,150,9,77);O.Zc.b(8,0,673,1,121,188,18,39);O.Zc.b(9,0,897,193,110,181,55,46);O.Zc.b(10,0,1,1,131,201,55,26);O.Zc.b(11,0,561,521,100,76,139,14);P.Se=new u("s_bird_ani_1",Cc,8,149,147,85,104,1192,147,8);P.Se.b(0,0,1,537,93,62,26,50);P.Se.b(1,0,1,449,101,82,32,33);P.Se.b(2,0,585,417,103,102,26,17);P.Se.b(3,0,513,689,91,82,33,52);P.Se.b(4,0,249,681,91,82,34,37);P.Se.b(5,0,921,625,91,82,33,37);P.Se.b(6,0,793,377,114,32,12,49);
P.Se.b(7,0,913,377,110,47,13,57);P.Te=new u("s_bird_ani_2",Cc,8,149,147,85,104,1192,147,8);P.Te.b(0,0,769,537,93,62,26,50);P.Te.b(1,0,233,457,101,82,32,33);P.Te.b(2,0,697,417,103,102,26,17);P.Te.b(3,0,609,601,91,82,33,52);P.Te.b(4,0,705,601,91,82,34,37);P.Te.b(5,0,153,609,91,82,33,37);P.Te.b(6,0,353,361,114,32,12,49);P.Te.b(7,0,233,401,110,47,13,57);P.Ue=new u("s_bird_ani_3",Cc,8,149,147,85,104,1192,147,8);P.Ue.b(0,0,929,105,93,62,26,50);P.Ue.b(1,0,921,433,101,82,32,33);
P.Ue.b(2,0,809,433,103,102,26,17);P.Ue.b(3,0,609,689,91,82,33,52);P.Ue.b(4,0,1,689,91,82,34,37);P.Ue.b(5,0,513,601,91,82,33,37);P.Ue.b(6,0,673,377,114,32,12,49);P.Ue.b(7,0,1,393,110,47,13,57);P.Ve=new u("s_bird_ani_4",Cc,8,149,147,85,104,1192,147,8);P.Ve.b(0,0,209,545,93,62,26,50);P.Ve.b(1,0,457,441,101,82,32,33);P.Ve.b(2,0,345,401,103,102,26,17);P.Ve.b(3,0,801,633,91,82,33,52);P.Ve.b(4,0,1,601,91,82,34,37);P.Ve.b(5,0,417,633,91,82,33,37);P.Ve.b(6,0,233,361,114,32,12,49);
P.Ve.b(7,0,473,385,110,47,13,57);var re=new u("s_ani_stone_cracking",R,6,93,103,9,17,558,103,6);re.b(0,0,657,409,70,70,9,17);re.b(1,0,585,369,70,70,8,17);re.b(2,0,873,417,70,70,8,17);re.b(3,0,1,369,74,75,5,15);re.b(4,0,921,193,92,103,0,0);re.b(5,0,921,305,92,103,0,0);var se=new u("s_ani_stone_explosion",R,7,216,180,97,93,1512,180,7);se.b(0,0,1,1,216,180,0,0);se.b(1,0,225,185,216,180,0,0);se.b(2,0,225,1,216,180,0,0);se.b(3,0,1,185,216,180,0,0);se.b(4,0,449,1,216,180,0,0);se.b(5,0,673,1,216,180,0,0);
se.b(6,0,449,185,216,180,0,0);var te=new u("s_emphasis",R,1,63,63,31,31,63,63,1);te.b(0,0,361,513,63,63,0,0);var ue=new u("s_btn_small_pause",R,2,100,92,0,0,200,92,2);ue.b(0,0,777,313,100,92,0,0);ue.b(1,0,673,313,100,92,0,0);(new u("s_logo_preload_tinglygames",vc,1,322,54,0,0,322,54,1)).b(0,0,585,1,320,54,0,0);(new u("s_loadingbar_bg",vc,1,38,20,0,0,38,20,1)).b(0,0,913,1,38,20,0,0);var ve=new u("s_loadingbar_fill",vc,1,30,12,0,0,30,12,1);ve.b(0,0,953,1,30,12,0,0);
var we=new u("s_logo_about",Q,1,121,121,0,0,121,121,1);we.b(0,0,825,257,117,80,2,21);var xe=new u("s_logo_poki_about",Q,1,123,58,0,0,123,58,1);xe.b(0,0,825,193,123,58,0,0);(new u("s_logo_poki_start",vc,1,120,60,0,0,120,60,1)).b(0,0,793,57,119,59,1,1);(new u("s_ads_background",vc,1,200,200,100,100,200,200,1)).b(0,0,585,57,200,200,0,0);new ya("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");var S=new Ca("f_default","Arial");D(S,12);S.fill=!0;S.setFillColor("Black");Ea(S,1);Ga(S,!1);
S.setStrokeColor("Black");Ia(S,1);La(S,"miter");Ha(S,1);Ka(S,!1);Na(S,"left");Oa(S,"top");S.Ra=0;S.Ca=0;new ya("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");new ya("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");new ya("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");new ya("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");
var ye=new Ca("floaterFontFace","Arial");D(ye,24);Da(ye,"normal");ye.fill=!0;ye.setFillColor("#FFDE00");Ea(ye,1);Ga(ye,!0);ye.setStrokeColor("#6F1F00");Ia(ye,4);La(ye,"miter");Ha(ye,1);Ka(ye,!0);Ma(ye,"rgba(57,0,0,0.46)",4);Na(ye,"left");Oa(ye,"top");ye.Ra=0;ye.Ca=0;var ze=new Ca("floaterFontFace","Arial");D(ze,28);Da(ze,"normal");ze.fill=!0;Fa(ze,2,["#FFF600","#00DB48","blue"],.65,.02);Ea(ze,1);Ga(ze,!0);ze.setStrokeColor("#073400");Ia(ze,4);La(ze,"miter");Ha(ze,1);Ka(ze,!0);
Ma(ze,"rgba(0,57,43,0.47)",4);Na(ze,"left");Oa(ze,"top");ze.Ra=0;ze.Ca=0;var Ae=new Ca("floaterFontFace","Arial");D(Ae,30);Da(Ae,"normal");Ae.fill=!0;Fa(Ae,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Ea(Ae,1);Ga(Ae,!0);Ae.setStrokeColor("#4F0027");Ia(Ae,4);La(Ae,"miter");Ha(Ae,1);Ka(Ae,!0);Ma(Ae,"rgba(41,0,0,0.48)",5);Na(Ae,"left");Oa(Ae,"top");Ae.Ra=0;Ae.Ca=0;var Be=new Ca("floaterFontFace","Arial");D(Be,34);Da(Be,"normal");Be.fill=!0;Fa(Be,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Ea(Be,1);
Ga(Be,!0);Be.setStrokeColor("#001637");Ia(Be,4);La(Be,"miter");Ha(Be,1);Ka(Be,!0);Ma(Be,"rgba(0,35,75,0.49)",6);Na(Be,"left");Oa(Be,"top");Be.Ra=0;Be.Ca=0;var Ce=new Ca("floaterNumberFontFace","Arial");D(Ce,30);Ce.fill=!0;Ce.setFillColor("White");Ea(Ce,1);Ga(Ce,!0);Ce.setStrokeColor("#00106F");Ia(Ce,2);La(Ce,"miter");Ha(Ce,1);Ka(Ce,!1);Ma(Ce,"rgba(0,4,57,0.51)",4);Na(Ce,"left");Oa(Ce,"top");Ce.Ra=0;Ce.Ca=0;var De=new Ca("floaterNumberFontFace","Arial");D(De,30);Da(De,"normal");De.fill=!0;De.setFillColor("#FF1E00");
Ea(De,1);Ga(De,!0);De.setStrokeColor("#3F0000");Ia(De,2);La(De,"miter");Ha(De,1);Ka(De,!1);Ma(De,"rgba(57,0,0,0.49)",4);Na(De,"left");Oa(De,"top");De.Ra=0;De.Ca=0;new ya("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");new ya("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");var Ee=new Ca("ff_opensans_bold","Arial");D(Ee,11);Ee.fill=!0;Ee.setFillColor("#799EC5");Ea(Ee,1);Ga(Ee,!1);Ee.setStrokeColor("White");
Ia(Ee,1);La(Ee,"miter");Ha(Ee,1);Ka(Ee,!1);Na(Ee,"center");Oa(Ee,"middle");Ee.Ra=0;Ee.Ca=0;var Fe=new Ca("ff_opensans_bolditalic","Arial");D(Fe,52);Fe.fill=!0;Fe.setFillColor("#172348");Ea(Fe,1);Ga(Fe,!1);Fe.setStrokeColor("Black");Ia(Fe,1);La(Fe,"miter");Ha(Fe,1);Ka(Fe,!1);Na(Fe,"center");Oa(Fe,"middle");Fe.Ra=0;Fe.Ca=0;new ya("f_game_ui","fonts/f_game_ui.woff","fonts/f_game_ui.ttf","fonts");var U=new Ca("f_game_ui","Arial");D(U,12);U.fill=!0;U.setFillColor("Black");Ea(U,1);Ga(U,!1);U.setStrokeColor("Black");
Ia(U,1);La(U,"miter");Ha(U,1);Ka(U,!1);Na(U,"left");Oa(U,"top");U.Ra=0;U.Ca=0;new ya("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");var V=new Ca("f_themeDefault","Arial");D(V,40);V.fill=!0;V.setFillColor("Black");Ea(V,1);Ga(V,!0);V.setStrokeColor("Red");Ia(V,5);La(V,"bevel");Ha(V,1);Ka(V,!0);Na(V,"left");Oa(V,"top");V.Ra=0;V.Ca=0;var Ge=new Ca("Arial","Arial");D(Ge,28);Da(Ge,"bold");Ge.fill=!0;Ge.setFillColor("#1b2b34");Ea(Ge,1);Ga(Ge,!1);Ge.setStrokeColor("Black");
Ia(Ge,28);La(Ge,"round");Ha(Ge,.55);Ka(Ge,!1);Na(Ge,"center");Oa(Ge,"middle");Ge.Ra=0;Ge.Ca=0;var He=new Ca("Arial","Arial");D(He,28);Da(He,"normal");He.fill=!0;He.setFillColor("White");Ea(He,1);Ga(He,!1);He.setStrokeColor("Black");Ia(He,28);La(He,"round");Ha(He,.55);Ka(He,!1);Na(He,"center");Oa(He,"middle");He.Ra=0;He.Ca=0;var Ie=new Ca("Arial","Arial");D(Ie,22);Da(Ie,"bold");Ie.fill=!0;Ie.setFillColor("#1b2b34");Ea(Ie,1);Ga(Ie,!1);Ie.setStrokeColor("Black");Ia(Ie,28);La(Ie,"round");Ha(Ie,.55);
Ka(Ie,!1);Na(Ie,"left");Oa(Ie,"middle");Ie.Ra=0;Ie.Ca=0;var Je=new Ca("Arial","Arial");D(Je,50);Da(Je,"bold");Je.fill=!0;Je.setFillColor("#1b2b34");Ea(Je,1);Ga(Je,!1);Je.setStrokeColor("Black");Ia(Je,28);La(Je,"round");Ha(Je,.55);Ka(Je,!1);Na(Je,"center");Oa(Je,"middle");Je.Ra=0;Je.Ca=0;var Ke=new Ca("Arial","Arial");D(Ke,20);Da(Ke,"bold");Ke.fill=!0;Ke.setFillColor("#1b2b34");Ea(Ke,1);Ga(Ke,!1);Ke.setStrokeColor("Black");Ia(Ke,28);La(Ke,"round");Ha(Ke,.55);Ka(Ke,!1);Na(Ke,"left");Oa(Ke,"middle");
Ke.Ra=0;Ke.Ca=0;var Le=new Ca("Arial","Arial");D(Le,20);Da(Le,"bold");Le.fill=!0;Le.setFillColor("#1b2b34");Ea(Le,.38);Ga(Le,!1);Le.setStrokeColor("Black");Ia(Le,28);La(Le,"round");Ha(Le,.55);Ka(Le,!1);Na(Le,"center");Oa(Le,"middle");Le.Ra=0;Le.Ca=0;
var Me=new qb("as_music","audio/as_music.mp3","audio/as_music.ogg","audio_music"),Ne=new qb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio"),Oe=new F("a_music",Me,0,27428,.3,1,["music"]),Pe=new F("a_levelStart",Ne,0,1002,1,10,["sfx"]),Qe=new F("a_levelComplete",Ne,3E3,1002,1,10,["sfx"]),Re=new F("a_mouseDown",Ne,6E3,471,1,10,["sfx"]),Se=new F("a_levelend_star_01",Ne,8E3,1161,1,10,["sfx"]),Te=new F("a_levelend_star_02",Ne,11E3,1070,1,10,["sfx"]),Ue=new F("a_levelend_star_03",
Ne,14E3,1039,1,10,["sfx"]);new F("a_levelend_score_counter",Ne,17E3,54,1,10,["sfx"]);new F("a_levelend_score_end",Ne,19E3,888,1,10,["sfx"]);var Ve=new F("a_medal",Ne,21E3,1225,1,10,["sfx"]),We=new F("a_levelend_fail",Ne,24E3,2919,1,10,["game"]),Xe=new F("a_outro",Ne,28E3,3739,1,10,["game"]),Ye=new F("a_deselect",Ne,33E3,239,1,10,["game"]),Ze=new F("a_select",Ne,35E3,264,1,10,["game"]),$e=new F("a_intro",Ne,37E3,699,1,10,["game"]);new F("a_tile_move",Ne,39E3,1E3,1,10,["game"]);
var af=new F("a_combo",Ne,42E3,1388,1,10,["game"]),bf=new F("a_combo_end",Ne,45E3,1062,1,10,["game"]),cf=new F("a_explode",Ne,48E3,1610,1,10,["game"]);tc.my=new F("a_vines_01",Ne,51E3,1371,1,10,["game"]);tc.ny=new F("a_vines_02",Ne,54E3,1440,1,10,["game"]);uc.ky=new F("a_bird_01",Ne,57E3,1542,1,10,["game"]);uc.ly=new F("a_bird_02",Ne,6E4,1969,1,10,["game"]);M=M||{};M["nl-nl"]=M["nl-nl"]||{};M["nl-nl"].loadingScreenLoading="Laden...";M["nl-nl"].startScreenPlay="SPELEN";
M["nl-nl"].levelMapScreenTotalScore="Totale score";M["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";M["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";M["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";M["nl-nl"].levelEndScreenTotalScore="Totale score";M["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";M["nl-nl"].levelEndScreenTimeLeft="Tijd over";M["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";M["nl-nl"].levelEndScreenHighScore="High score";
M["nl-nl"].optionsStartScreen="Hoofdmenu";M["nl-nl"].optionsQuit="Stop";M["nl-nl"].optionsResume="Terug naar spel";M["nl-nl"].optionsTutorial="Speluitleg";M["nl-nl"].optionsHighScore="High scores";M["nl-nl"].optionsMoreGames="Meer Spellen";M["nl-nl"].optionsDifficulty_easy="Makkelijk";M["nl-nl"].optionsDifficulty_medium="Gemiddeld";M["nl-nl"].optionsDifficulty_hard="Moeilijk";M["nl-nl"].optionsMusic_on="Aan";M["nl-nl"].optionsMusic_off="Uit";M["nl-nl"].optionsSFX_on="Aan";
M["nl-nl"].optionsSFX_off="Uit";M["nl-nl"]["optionsLang_en-us"]="Engels (US)";M["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";M["nl-nl"]["optionsLang_nl-nl"]="Nederlands";M["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";M["nl-nl"].gameEndScreenBtnText="Ga verder";M["nl-nl"].optionsTitle="Instellingen";M["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";M["nl-nl"].optionsQuitConfirmBtn_No="Nee";
M["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";M["nl-nl"].levelMapScreenTitle="Kies een level";M["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";M["nl-nl"].optionsRestart="Herstart";M["nl-nl"].optionsSFXBig_on="Geluid aan";M["nl-nl"].optionsSFXBig_off="Geluid uit";M["nl-nl"].optionsAbout_title="Over ons";M["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";
M["nl-nl"].optionsAbout_backBtn="Terug";M["nl-nl"].optionsAbout_version="versie:";M["nl-nl"].optionsAbout="Over ons";M["nl-nl"].levelEndScreenMedal="VERBETERD!";M["nl-nl"].startScreenQuestionaire="Wat vind jij?";M["nl-nl"].levelMapScreenWorld_0="Kies een level";M["nl-nl"].startScreenByTinglyGames="door: CoolGames";M["nl-nl"]["optionsLang_de-de"]="Duits";M["nl-nl"]["optionsLang_tr-tr"]="Turks";M["nl-nl"].optionsAbout_header="Ontwikkeld door:";M["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";
M["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";M["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";M["nl-nl"].challengeStartTextScore="Punten van <NAME>:";M["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";M["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";M["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";M["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";
M["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";M["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";M["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";M["nl-nl"].challengeCancelConfirmBtn_yes="Ja";M["nl-nl"].challengeCancelConfirmBtn_no="Nee";M["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";
M["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";M["nl-nl"].challengeEndScreenName_you="Jij";M["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";M["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";M["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";
M["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";M["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";M["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";M["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";M["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";
M["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";M["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";M["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";M["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";M["nl-nl"].challengeForfeitConfirmBtn_no="Nee";M["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";
M["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";M["nl-nl"].optionsChallengeForfeit="Geef op";M["nl-nl"].optionsChallengeCancel="Stop";M["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";M["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";M["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";
M["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";M["nl-nl"]["optionsLang_fr-fr"]="Frans";M["nl-nl"]["optionsLang_ko-kr"]="Koreaans";M["nl-nl"]["optionsLang_ar-eg"]="Arabisch";M["nl-nl"]["optionsLang_es-es"]="Spaans";M["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";M["nl-nl"]["optionsLang_ru-ru"]="Russisch";M["nl-nl"].optionsExit="Stoppen";M["nl-nl"].levelEndScreenTotalScore_number="Totale score:";M["nl-nl"].levelEndScreenHighScore_number="Topscore:";
M["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";M["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";M["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";
M["nl-nl"].optionsAbout_header_publisher="Published by:";M["nl-nl"]["optionsLang_jp-jp"]="Japans";M["nl-nl"]["optionsLang_it-it"]="Italiaans";M["en-us"]=M["en-us"]||{};M["en-us"].loadingScreenLoading="Loading...";M["en-us"].startScreenPlay="PLAY";M["en-us"].levelMapScreenTotalScore="Total score";M["en-us"].levelEndScreenTitle_level="Level <VALUE>";M["en-us"].levelEndScreenTitle_difficulty="Well done!";M["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";M["en-us"].levelEndScreenTotalScore="Total score";
M["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";M["en-us"].levelEndScreenTimeLeft="Time remaining";M["en-us"].levelEndScreenTimeBonus="Time bonus";M["en-us"].levelEndScreenHighScore="High score";M["en-us"].optionsStartScreen="Main menu";M["en-us"].optionsQuit="Quit";M["en-us"].optionsResume="Resume";M["en-us"].optionsTutorial="How to play";M["en-us"].optionsHighScore="High scores";M["en-us"].optionsMoreGames="More Games";M["en-us"].optionsDifficulty_easy="Easy";
M["en-us"].optionsDifficulty_medium="Medium";M["en-us"].optionsDifficulty_hard="Difficult";M["en-us"].optionsMusic_on="On";M["en-us"].optionsMusic_off="Off";M["en-us"].optionsSFX_on="On";M["en-us"].optionsSFX_off="Off";M["en-us"]["optionsLang_en-us"]="English (US)";M["en-us"]["optionsLang_en-gb"]="English (GB)";M["en-us"]["optionsLang_nl-nl"]="Dutch";M["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";M["en-us"].gameEndScreenBtnText="Continue";M["en-us"].optionsTitle="Settings";
M["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";M["en-us"].optionsQuitConfirmBtn_No="No";M["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";M["en-us"].levelMapScreenTitle="Select a level";M["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";M["en-us"].optionsRestart="Restart";
M["en-us"].optionsSFXBig_on="Sound on";M["en-us"].optionsSFXBig_off="Sound off";M["en-us"].optionsAbout_title="About";M["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["en-us"].optionsAbout_backBtn="Back";M["en-us"].optionsAbout_version="version:";M["en-us"].optionsAbout="About";M["en-us"].levelEndScreenMedal="IMPROVED!";M["en-us"].startScreenQuestionaire="What do you think?";M["en-us"].levelMapScreenWorld_0="Select a level";M["en-us"].startScreenByTinglyGames="by: CoolGames";
M["en-us"]["optionsLang_de-de"]="German";M["en-us"]["optionsLang_tr-tr"]="Turkish";M["en-us"].optionsAbout_header="Developed by:";M["en-us"].levelEndScreenViewHighscoreBtn="View scores";M["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";M["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["en-us"].challengeStartTextScore="<NAME>'s score:";M["en-us"].challengeStartTextTime="<NAME>'s time:";M["en-us"].challengeStartScreenToWin="Amount to win:";
M["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["en-us"].challengeCancelConfirmBtn_yes="Yes";M["en-us"].challengeCancelConfirmBtn_no="No";M["en-us"].challengeEndScreensBtn_submit="Submit challenge";M["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";M["en-us"].challengeEndScreenName_you="You";M["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
M["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";M["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";
M["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";M["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";M["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["en-us"].challengeForfeitConfirmBtn_yes="Yes";M["en-us"].challengeForfeitConfirmBtn_no="No";M["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";
M["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["en-us"].optionsChallengeForfeit="Forfeit";M["en-us"].optionsChallengeCancel="Quit";M["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["en-us"].levelEndScreenHighScore_time="Best time:";M["en-us"].levelEndScreenTotalScore_time="Total time:";
M["en-us"]["optionsLang_fr-fr"]="French";M["en-us"]["optionsLang_ko-kr"]="Korean";M["en-us"]["optionsLang_ar-eg"]="Arabic";M["en-us"]["optionsLang_es-es"]="Spanish";M["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";M["en-us"]["optionsLang_ru-ru"]="Russian";M["en-us"].optionsExit="Exit";M["en-us"].levelEndScreenTotalScore_number="Total score:";M["en-us"].levelEndScreenHighScore_number="High score:";M["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["en-us"].optionsAbout_header_publisher="Published by:";M["en-us"]["optionsLang_jp-jp"]="Japanese";M["en-us"]["optionsLang_it-it"]="Italian";M["en-gb"]=M["en-gb"]||{};M["en-gb"].loadingScreenLoading="Loading...";
M["en-gb"].startScreenPlay="PLAY";M["en-gb"].levelMapScreenTotalScore="Total score";M["en-gb"].levelEndScreenTitle_level="Level <VALUE>";M["en-gb"].levelEndScreenTitle_difficulty="Well done!";M["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";M["en-gb"].levelEndScreenTotalScore="Total score";M["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";M["en-gb"].levelEndScreenTimeLeft="Time remaining";M["en-gb"].levelEndScreenTimeBonus="Time bonus";M["en-gb"].levelEndScreenHighScore="High score";
M["en-gb"].optionsStartScreen="Main menu";M["en-gb"].optionsQuit="Quit";M["en-gb"].optionsResume="Resume";M["en-gb"].optionsTutorial="How to play";M["en-gb"].optionsHighScore="High scores";M["en-gb"].optionsMoreGames="More Games";M["en-gb"].optionsDifficulty_easy="Easy";M["en-gb"].optionsDifficulty_medium="Medium";M["en-gb"].optionsDifficulty_hard="Difficult";M["en-gb"].optionsMusic_on="On";M["en-gb"].optionsMusic_off="Off";M["en-gb"].optionsSFX_on="On";M["en-gb"].optionsSFX_off="Off";
M["en-gb"]["optionsLang_en-us"]="English (US)";M["en-gb"]["optionsLang_en-gb"]="English (GB)";M["en-gb"]["optionsLang_nl-nl"]="Dutch";M["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";M["en-gb"].gameEndScreenBtnText="Continue";M["en-gb"].optionsTitle="Settings";M["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";M["en-gb"].optionsQuitConfirmBtn_No="No";
M["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";M["en-gb"].levelMapScreenTitle="Select a level";M["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";M["en-gb"].optionsRestart="Restart";M["en-gb"].optionsSFXBig_on="Sound on";M["en-gb"].optionsSFXBig_off="Sound off";M["en-gb"].optionsAbout_title="About";M["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
M["en-gb"].optionsAbout_backBtn="Back";M["en-gb"].optionsAbout_version="version:";M["en-gb"].optionsAbout="About";M["en-gb"].levelEndScreenMedal="IMPROVED!";M["en-gb"].startScreenQuestionaire="What do you think?";M["en-gb"].levelMapScreenWorld_0="Select a level";M["en-gb"].startScreenByTinglyGames="by: CoolGames";M["en-gb"]["optionsLang_de-de"]="German";M["en-gb"]["optionsLang_tr-tr"]="Turkish";M["en-gb"].optionsAbout_header="Developed by:";M["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
M["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";M["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["en-gb"].challengeStartTextScore="<NAME>'s score:";M["en-gb"].challengeStartTextTime="<NAME>'s time:";M["en-gb"].challengeStartScreenToWin="Amount to win:";M["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
M["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";M["en-gb"].challengeCancelConfirmBtn_yes="Yes";M["en-gb"].challengeCancelConfirmBtn_no="No";M["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
M["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";M["en-gb"].challengeEndScreenName_you="You";M["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";M["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
M["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";M["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
M["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";M["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";M["en-gb"].challengeForfeitConfirmBtn_yes="Yes";M["en-gb"].challengeForfeitConfirmBtn_no="No";M["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";M["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
M["en-gb"].optionsChallengeForfeit="Forfeit";M["en-gb"].optionsChallengeCancel="Quit";M["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["en-gb"].levelEndScreenHighScore_time="Best time:";M["en-gb"].levelEndScreenTotalScore_time="Total time:";M["en-gb"]["optionsLang_fr-fr"]="French";M["en-gb"]["optionsLang_ko-kr"]="Korean";M["en-gb"]["optionsLang_ar-eg"]="Arabic";
M["en-gb"]["optionsLang_es-es"]="Spanish";M["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";M["en-gb"]["optionsLang_ru-ru"]="Russian";M["en-gb"].optionsExit="Exit";M["en-gb"].levelEndScreenTotalScore_number="Total score:";M["en-gb"].levelEndScreenHighScore_number="High score:";M["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["en-gb"].optionsAbout_header_publisher="Published by:";M["en-gb"]["optionsLang_jp-jp"]="Japanese";M["en-gb"]["optionsLang_it-it"]="Italian";M["de-de"]=M["de-de"]||{};M["de-de"].loadingScreenLoading="Laden ...";
M["de-de"].startScreenPlay="SPIELEN";M["de-de"].levelMapScreenTotalScore="Gesamtpunkte";M["de-de"].levelEndScreenTitle_level="Level <VALUE>";M["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";M["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";M["de-de"].levelEndScreenTotalScore="Gesamtpunkte";M["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";M["de-de"].levelEndScreenTimeLeft="Restzeit";M["de-de"].levelEndScreenTimeBonus="Zeitbonus";M["de-de"].levelEndScreenHighScore="Highscore";
M["de-de"].optionsStartScreen="Hauptmen\u00fc";M["de-de"].optionsQuit="Beenden";M["de-de"].optionsResume="Weiterspielen";M["de-de"].optionsTutorial="So wird gespielt";M["de-de"].optionsHighScore="Highscores";M["de-de"].optionsMoreGames="Weitere Spiele";M["de-de"].optionsDifficulty_easy="Einfach";M["de-de"].optionsDifficulty_medium="Mittel";M["de-de"].optionsDifficulty_hard="Schwer";M["de-de"].optionsMusic_on="EIN";M["de-de"].optionsMusic_off="AUS";M["de-de"].optionsSFX_on="EIN";
M["de-de"].optionsSFX_off="AUS";M["de-de"]["optionsLang_en-us"]="Englisch (US)";M["de-de"]["optionsLang_en-gb"]="Englisch (GB)";M["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";M["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";M["de-de"].gameEndScreenBtnText="Weiter";M["de-de"].optionsTitle="Einstellungen";M["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
M["de-de"].optionsQuitConfirmBtn_No="NEIN";M["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";M["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";M["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";M["de-de"].optionsRestart="Neustart";M["de-de"].optionsSFXBig_on="Sound EIN";M["de-de"].optionsSFXBig_off="Sound AUS";M["de-de"].optionsAbout_title="\u00dcber";
M["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["de-de"].optionsAbout_backBtn="Zur\u00fcck";M["de-de"].optionsAbout_version="Version:";M["de-de"].optionsAbout="\u00dcber";M["de-de"].levelEndScreenMedal="VERBESSERT!";M["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";M["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";M["de-de"].startScreenByTinglyGames="von: CoolGames";M["de-de"]["optionsLang_de-de"]="Deutsch";M["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
M["de-de"].optionsAbout_header="Entwickelt von:";M["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";M["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";M["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";M["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";M["de-de"].challengeStartTextTime="Zeit von <NAME>:";M["de-de"].challengeStartScreenToWin="Einsatz:";M["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
M["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";M["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";M["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";M["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";M["de-de"].challengeCancelConfirmBtn_yes="Ja";M["de-de"].challengeCancelConfirmBtn_no="Nein";
M["de-de"].challengeEndScreensBtn_submit="Herausfordern";M["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";M["de-de"].challengeEndScreenName_you="Du";M["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";M["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";M["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
M["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";M["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";M["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";M["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";M["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
M["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";M["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";M["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";M["de-de"].challengeForfeitConfirmBtn_yes="Ja";M["de-de"].challengeForfeitConfirmBtn_no="Nein";M["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";M["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
M["de-de"].optionsChallengeForfeit="Aufgeben";M["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";M["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";M["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";M["de-de"].levelEndScreenHighScore_time="Bestzeit:";M["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
M["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";M["de-de"]["optionsLang_ko-kr"]="Koreanisch";M["de-de"]["optionsLang_ar-eg"]="Arabisch";M["de-de"]["optionsLang_es-es"]="Spanisch";M["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";M["de-de"]["optionsLang_ru-ru"]="Russisch";M["de-de"].optionsExit="Verlassen";M["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";M["de-de"].levelEndScreenHighScore_number="Highscore:";M["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
M["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";M["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["de-de"].optionsAbout_header_publisher="Published by:";M["de-de"]["optionsLang_jp-jp"]="Japanese";M["de-de"]["optionsLang_it-it"]="Italian";M["fr-fr"]=M["fr-fr"]||{};M["fr-fr"].loadingScreenLoading="Chargement...";
M["fr-fr"].startScreenPlay="JOUER";M["fr-fr"].levelMapScreenTotalScore="Score total";M["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";M["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";M["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";M["fr-fr"].levelEndScreenTotalScore="Score total";M["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";M["fr-fr"].levelEndScreenTimeLeft="Temps restant";M["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
M["fr-fr"].levelEndScreenHighScore="Meilleur score";M["fr-fr"].optionsStartScreen="Menu principal";M["fr-fr"].optionsQuit="Quitter";M["fr-fr"].optionsResume="Reprendre";M["fr-fr"].optionsTutorial="Comment jouer";M["fr-fr"].optionsHighScore="Meilleurs scores";M["fr-fr"].optionsMoreGames="Plus de jeux";M["fr-fr"].optionsDifficulty_easy="Facile";M["fr-fr"].optionsDifficulty_medium="Moyen";M["fr-fr"].optionsDifficulty_hard="Difficile";M["fr-fr"].optionsMusic_on="Avec";M["fr-fr"].optionsMusic_off="Sans";
M["fr-fr"].optionsSFX_on="Avec";M["fr-fr"].optionsSFX_off="Sans";M["fr-fr"]["optionsLang_en-us"]="Anglais (US)";M["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";M["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";M["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";M["fr-fr"].gameEndScreenBtnText="Continuer";M["fr-fr"].optionsTitle="Param\u00e8tres";M["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
M["fr-fr"].optionsQuitConfirmBtn_No="Non";M["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";M["fr-fr"].levelMapScreenTitle="Choisir un niveau";M["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";M["fr-fr"].optionsRestart="Recommencer";M["fr-fr"].optionsSFXBig_on="Avec son";M["fr-fr"].optionsSFXBig_off="Sans son";M["fr-fr"].optionsAbout_title="\u00c0 propos";
M["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["fr-fr"].optionsAbout_backBtn="Retour";M["fr-fr"].optionsAbout_version="Version :";M["fr-fr"].optionsAbout="\u00c0 propos";M["fr-fr"].levelEndScreenMedal="RECORD BATTU !";M["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";M["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";M["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";M["fr-fr"]["optionsLang_de-de"]="Allemand";M["fr-fr"]["optionsLang_tr-tr"]="Turc";
M["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";M["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";M["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";M["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";M["fr-fr"].challengeStartTextScore="Son score :";M["fr-fr"].challengeStartTextTime="Son temps\u00a0:";M["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";M["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
M["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";M["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";M["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";M["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";M["fr-fr"].challengeCancelConfirmBtn_yes="Oui";M["fr-fr"].challengeCancelConfirmBtn_no="Non";M["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
M["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";M["fr-fr"].challengeEndScreenName_you="Moi";M["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";M["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";M["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";M["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
M["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";M["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";M["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";M["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";M["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
M["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";M["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";M["fr-fr"].challengeForfeitConfirmBtn_no="Non";M["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";M["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";M["fr-fr"].optionsChallengeForfeit="Abandonner";M["fr-fr"].optionsChallengeCancel="Annuler";M["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
M["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";M["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";M["fr-fr"].levelEndScreenTotalScore_time="Temps total :";M["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";M["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";M["fr-fr"]["optionsLang_ar-eg"]="Arabe";M["fr-fr"]["optionsLang_es-es"]="Espagnol";M["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
M["fr-fr"]["optionsLang_ru-ru"]="Russe";M["fr-fr"].optionsExit="Quitter";M["fr-fr"].levelEndScreenTotalScore_number="Score total :";M["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";M["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";M["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
M["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["fr-fr"].optionsAbout_header_publisher="Published by:";M["fr-fr"]["optionsLang_jp-jp"]="Japanese";M["fr-fr"]["optionsLang_it-it"]="Italian";M["pt-br"]=M["pt-br"]||{};M["pt-br"].loadingScreenLoading="Carregando...";M["pt-br"].startScreenPlay="JOGAR";M["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";M["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";M["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
M["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";M["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";M["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";M["pt-br"].levelEndScreenTimeLeft="Tempo restante";M["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";M["pt-br"].levelEndScreenHighScore="Recorde";M["pt-br"].optionsStartScreen="Menu principal";M["pt-br"].optionsQuit="Sair";M["pt-br"].optionsResume="Continuar";M["pt-br"].optionsTutorial="Como jogar";
M["pt-br"].optionsHighScore="Recordes";M["pt-br"].optionsMoreGames="Mais jogos";M["pt-br"].optionsDifficulty_easy="F\u00e1cil";M["pt-br"].optionsDifficulty_medium="M\u00e9dio";M["pt-br"].optionsDifficulty_hard="Dif\u00edcil";M["pt-br"].optionsMusic_on="Sim";M["pt-br"].optionsMusic_off="N\u00e3o";M["pt-br"].optionsSFX_on="Sim";M["pt-br"].optionsSFX_off="N\u00e3o";M["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";M["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";M["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
M["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";M["pt-br"].gameEndScreenBtnText="Continuar";M["pt-br"].optionsTitle="Configura\u00e7\u00f5es";M["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";M["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";M["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";M["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
M["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";M["pt-br"].optionsRestart="Reiniciar";M["pt-br"].optionsSFXBig_on="Com som";M["pt-br"].optionsSFXBig_off="Sem som";M["pt-br"].optionsAbout_title="Sobre";M["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["pt-br"].optionsAbout_backBtn="Voltar";M["pt-br"].optionsAbout_version="vers\u00e3o:";
M["pt-br"].optionsAbout="Sobre";M["pt-br"].levelEndScreenMedal="MELHOROU!";M["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";M["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";M["pt-br"].startScreenByTinglyGames="da: CoolGames";M["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";M["pt-br"]["optionsLang_tr-tr"]="Turco";M["pt-br"].optionsAbout_header="Desenvolvido por:";M["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";M["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
M["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["pt-br"].challengeStartTextScore="<NAME>'s score:";M["pt-br"].challengeStartTextTime="<NAME>'s time:";M["pt-br"].challengeStartScreenToWin="Amount to win:";M["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
M["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";M["pt-br"].challengeCancelConfirmBtn_yes="Yes";M["pt-br"].challengeCancelConfirmBtn_no="No";M["pt-br"].challengeEndScreensBtn_submit="Submit challenge";M["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";M["pt-br"].challengeEndScreenName_you="You";
M["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";M["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";M["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
M["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";M["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";M["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";M["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
M["pt-br"].challengeForfeitConfirmBtn_yes="Yes";M["pt-br"].challengeForfeitConfirmBtn_no="No";M["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";M["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["pt-br"].optionsChallengeForfeit="Desistir";M["pt-br"].optionsChallengeCancel="Sair do Jogo";M["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
M["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";M["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";M["pt-br"].levelEndScreenTotalScore_time="Tempo total:";M["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";M["pt-br"]["optionsLang_ko-kr"]="Coreano";M["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";M["pt-br"]["optionsLang_es-es"]="Espanhol";M["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
M["pt-br"]["optionsLang_ru-ru"]="Russo";M["pt-br"].optionsExit="Sa\u00edda";M["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";M["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";M["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["pt-br"].optionsAbout_header_publisher="Published by:";M["pt-br"]["optionsLang_jp-jp"]="Japanese";M["pt-br"]["optionsLang_it-it"]="Italian";M["es-es"]=M["es-es"]||{};M["es-es"].loadingScreenLoading="Cargando...";
M["es-es"].startScreenPlay="JUGAR";M["es-es"].levelMapScreenTotalScore="Punt. total";M["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";M["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";M["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";M["es-es"].levelEndScreenTotalScore="Punt. total";M["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";M["es-es"].levelEndScreenTimeLeft="Tiempo restante";M["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
M["es-es"].levelEndScreenHighScore="R\u00e9cord";M["es-es"].optionsStartScreen="Men\u00fa principal";M["es-es"].optionsQuit="Salir";M["es-es"].optionsResume="Seguir";M["es-es"].optionsTutorial="C\u00f3mo jugar";M["es-es"].optionsHighScore="R\u00e9cords";M["es-es"].optionsMoreGames="M\u00e1s juegos";M["es-es"].optionsDifficulty_easy="F\u00e1cil";M["es-es"].optionsDifficulty_medium="Normal";M["es-es"].optionsDifficulty_hard="Dif\u00edcil";M["es-es"].optionsMusic_on="S\u00ed";
M["es-es"].optionsMusic_off="No";M["es-es"].optionsSFX_on="S\u00ed";M["es-es"].optionsSFX_off="No";M["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";M["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";M["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";M["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";M["es-es"].gameEndScreenBtnText="Continuar";M["es-es"].optionsTitle="Ajustes";M["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
M["es-es"].optionsQuitConfirmBtn_No="No";M["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";M["es-es"].levelMapScreenTitle="Elige un nivel";M["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";M["es-es"].optionsRestart="Reiniciar";M["es-es"].optionsSFXBig_on="Sonido s\u00ed";M["es-es"].optionsSFXBig_off="Sonido no";M["es-es"].optionsAbout_title="Acerca de";
M["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["es-es"].optionsAbout_backBtn="Atr\u00e1s";M["es-es"].optionsAbout_version="versi\u00f3n:";M["es-es"].optionsAbout="Acerca de";M["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";M["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";M["es-es"].levelMapScreenWorld_0="Elige un nivel";M["es-es"].startScreenByTinglyGames="de: CoolGames";M["es-es"]["optionsLang_de-de"]="Alem\u00e1n";M["es-es"]["optionsLang_tr-tr"]="Turco";
M["es-es"].optionsAbout_header="Desarrollado por:";M["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";M["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";M["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["es-es"].challengeStartTextScore="<NAME>'s score:";M["es-es"].challengeStartTextTime="<NAME>'s time:";M["es-es"].challengeStartScreenToWin="Amount to win:";M["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
M["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";M["es-es"].challengeCancelConfirmBtn_yes="Yes";M["es-es"].challengeCancelConfirmBtn_no="No";
M["es-es"].challengeEndScreensBtn_submit="Submit challenge";M["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";M["es-es"].challengeEndScreenName_you="You";M["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";M["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
M["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";M["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";M["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
M["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";M["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";M["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["es-es"].challengeForfeitConfirmBtn_yes="Yes";M["es-es"].challengeForfeitConfirmBtn_no="No";M["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";M["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
M["es-es"].optionsChallengeForfeit="Rendirse";M["es-es"].optionsChallengeCancel="Abandonar";M["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";M["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";M["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";M["es-es"].levelEndScreenTotalScore_time="Tiempo total:";M["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";M["es-es"]["optionsLang_ko-kr"]="Coreano";
M["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";M["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";M["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";M["es-es"]["optionsLang_ru-ru"]="Ruso";M["es-es"].optionsExit="Salir";M["es-es"].levelEndScreenTotalScore_number="Puntos totales:";M["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";M["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["es-es"].optionsAbout_header_publisher="Published by:";M["es-es"]["optionsLang_jp-jp"]="Japanese";M["es-es"]["optionsLang_it-it"]="Italian";M["tr-tr"]=M["tr-tr"]||{};M["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
M["tr-tr"].startScreenPlay="OYNA";M["tr-tr"].levelMapScreenTotalScore="Toplam skor";M["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";M["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";M["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";M["tr-tr"].levelEndScreenTotalScore="Toplam skor";M["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";M["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";M["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
M["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";M["tr-tr"].optionsStartScreen="Ana men\u00fc";M["tr-tr"].optionsQuit="\u00c7\u0131k";M["tr-tr"].optionsResume="Devam et";M["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";M["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";M["tr-tr"].optionsMoreGames="Daha Fazla Oyun";M["tr-tr"].optionsDifficulty_easy="Kolay";M["tr-tr"].optionsDifficulty_medium="Orta";M["tr-tr"].optionsDifficulty_hard="Zorluk";M["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
M["tr-tr"].optionsMusic_off="Kapal\u0131";M["tr-tr"].optionsSFX_on="A\u00e7\u0131k";M["tr-tr"].optionsSFX_off="Kapal\u0131";M["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";M["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";M["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";M["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";M["tr-tr"].gameEndScreenBtnText="Devam";M["tr-tr"].optionsTitle="Ayarlar";M["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
M["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";M["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";M["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";M["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";M["tr-tr"].optionsRestart="Tekrar ba\u015flat";M["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";M["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
M["tr-tr"].optionsAbout_title="Hakk\u0131nda";M["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["tr-tr"].optionsAbout_backBtn="Geri";M["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";M["tr-tr"].optionsAbout="Hakk\u0131nda";M["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";M["tr-tr"].startScreenQuestionaire="Ne dersin?";M["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";M["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
M["tr-tr"]["optionsLang_de-de"]="Almanca";M["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";M["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";M["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";M["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";M["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["tr-tr"].challengeStartTextScore="<NAME>'s score:";M["tr-tr"].challengeStartTextTime="<NAME>'s time:";
M["tr-tr"].challengeStartScreenToWin="Amount to win:";M["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["tr-tr"].challengeCancelConfirmBtn_yes="Yes";M["tr-tr"].challengeCancelConfirmBtn_no="No";M["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";M["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";M["tr-tr"].challengeEndScreenName_you="You";M["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
M["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";M["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
M["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";M["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";M["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";M["tr-tr"].challengeForfeitConfirmBtn_no="No";M["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
M["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";M["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";M["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";M["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
M["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";M["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";M["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";M["tr-tr"]["optionsLang_ko-kr"]="Korece";M["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";M["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";M["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";M["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";M["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";M["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
M["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";M["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";M["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
M["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["tr-tr"].optionsAbout_header_publisher="Published by:";M["tr-tr"]["optionsLang_jp-jp"]="Japanese";M["tr-tr"]["optionsLang_it-it"]="Italian";M["ru-ru"]=M["ru-ru"]||{};M["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";M["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";M["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
M["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";M["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";M["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";M["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";M["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
M["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";M["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";M["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";M["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";M["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
M["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";M["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";M["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";M["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";M["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";M["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
M["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";M["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";M["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";M["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";M["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";M["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";M["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
M["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";M["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";M["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";M["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
M["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
M["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";M["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";M["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";M["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
M["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";M["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";M["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";M["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";M["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";M["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";M["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
M["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";M["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";M["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";M["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";M["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
M["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";M["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";M["ru-ru"].optionsAbout_header="Developed by:";M["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";M["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";M["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["ru-ru"].challengeStartTextScore="<NAME>'s score:";
M["ru-ru"].challengeStartTextTime="<NAME>'s time:";M["ru-ru"].challengeStartScreenToWin="Amount to win:";M["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["ru-ru"].challengeCancelConfirmBtn_yes="Yes";M["ru-ru"].challengeCancelConfirmBtn_no="No";M["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";M["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";M["ru-ru"].challengeEndScreenName_you="You";M["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
M["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";M["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
M["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";M["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";M["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";M["ru-ru"].challengeForfeitConfirmBtn_no="No";M["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
M["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["ru-ru"].optionsChallengeForfeit="Forfeit";M["ru-ru"].optionsChallengeCancel="Quit";M["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["ru-ru"].levelEndScreenHighScore_time="Best time:";M["ru-ru"].levelEndScreenTotalScore_time="Total time:";
M["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";M["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";M["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";M["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";M["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
M["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";M["ru-ru"].optionsExit="Exit";M["ru-ru"].levelEndScreenTotalScore_number="Total score:";M["ru-ru"].levelEndScreenHighScore_number="High score:";M["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["ru-ru"].optionsAbout_header_publisher="Published by:";M["ru-ru"]["optionsLang_jp-jp"]="Japanese";M["ru-ru"]["optionsLang_it-it"]="Italian";M["ar-eg"]=M["ar-eg"]||{};M["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
M["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";M["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";M["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";M["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";M["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";M["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
M["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";M["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";M["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";M["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
M["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";M["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";M["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";M["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";M["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
M["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";M["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";M["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";M["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";M["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";M["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
M["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";M["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";M["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
M["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";M["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";M["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";M["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
M["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";M["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
M["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";M["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";M["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";M["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
M["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";M["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";M["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";M["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";M["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
M["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";M["ar-eg"].optionsAbout="\u062d\u0648\u0644";M["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";M["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";M["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";M["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
M["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";M["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";M["ar-eg"].optionsAbout_header="Developed by:";M["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";M["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";M["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["ar-eg"].challengeStartTextScore="<NAME>'s score:";
M["ar-eg"].challengeStartTextTime="<NAME>'s time:";M["ar-eg"].challengeStartScreenToWin="Amount to win:";M["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["ar-eg"].challengeCancelConfirmBtn_yes="Yes";M["ar-eg"].challengeCancelConfirmBtn_no="No";M["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";M["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";M["ar-eg"].challengeEndScreenName_you="You";M["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
M["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";M["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
M["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";M["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";M["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";M["ar-eg"].challengeForfeitConfirmBtn_no="No";M["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
M["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["ar-eg"].optionsChallengeForfeit="Forfeit";M["ar-eg"].optionsChallengeCancel="Quit";M["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["ar-eg"].levelEndScreenHighScore_time="Best time:";M["ar-eg"].levelEndScreenTotalScore_time="Total time:";
M["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";M["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";M["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";M["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";M["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
M["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";M["ar-eg"].optionsExit="Exit";M["ar-eg"].levelEndScreenTotalScore_number="Total score:";M["ar-eg"].levelEndScreenHighScore_number="High score:";M["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["ar-eg"].optionsAbout_header_publisher="Published by:";M["ar-eg"]["optionsLang_jp-jp"]="Japanese";M["ar-eg"]["optionsLang_it-it"]="Italian";M["ko-kr"]=M["ko-kr"]||{};M["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
M["ko-kr"].startScreenPlay="PLAY";M["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";M["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";M["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";M["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";M["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";M["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";M["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
M["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";M["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";M["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";M["ko-kr"].optionsQuit="\uc885\ub8cc";M["ko-kr"].optionsResume="\uacc4\uc18d";M["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";M["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";M["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";M["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
M["ko-kr"].optionsDifficulty_medium="\uc911";M["ko-kr"].optionsDifficulty_hard="\uc0c1";M["ko-kr"].optionsMusic_on="\ucf1c\uae30";M["ko-kr"].optionsMusic_off="\ub044\uae30";M["ko-kr"].optionsSFX_on="\ucf1c\uae30";M["ko-kr"].optionsSFX_off="\ub044\uae30";M["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";M["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";M["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";M["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
M["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";M["ko-kr"].optionsTitle="\uc124\uc815";M["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";M["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";M["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
M["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";M["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";M["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";M["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";M["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
M["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";M["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";M["ko-kr"].optionsAbout_version="\ubc84\uc804:";M["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";M["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";M["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";M["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
M["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";M["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";M["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";M["ko-kr"].optionsAbout_header="Developed by:";M["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";M["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";M["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";M["ko-kr"].challengeStartTextScore="<NAME>'s score:";
M["ko-kr"].challengeStartTextTime="<NAME>'s time:";M["ko-kr"].challengeStartScreenToWin="Amount to win:";M["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";M["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";M["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["ko-kr"].challengeCancelConfirmBtn_yes="Yes";M["ko-kr"].challengeCancelConfirmBtn_no="No";M["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";M["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";M["ko-kr"].challengeEndScreenName_you="You";M["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
M["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";M["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";M["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
M["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";M["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";M["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";M["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";M["ko-kr"].challengeForfeitConfirmBtn_no="No";M["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
M["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";M["ko-kr"].optionsChallengeForfeit="Forfeit";M["ko-kr"].optionsChallengeCancel="Quit";M["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["ko-kr"].levelEndScreenHighScore_time="Best time:";M["ko-kr"].levelEndScreenTotalScore_time="Total time:";
M["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";M["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";M["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";M["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";M["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";M["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";M["ko-kr"].optionsExit="Exit";M["ko-kr"].levelEndScreenTotalScore_number="Total score:";
M["ko-kr"].levelEndScreenHighScore_number="High score:";M["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";M["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
M["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["ko-kr"].optionsAbout_header_publisher="Published by:";M["ko-kr"]["optionsLang_jp-jp"]="Japanese";M["ko-kr"]["optionsLang_it-it"]="Italian";M["jp-jp"]=M["jp-jp"]||{};M["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";M["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";M["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";M["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
M["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";M["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";M["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";M["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";M["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";M["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";M["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
M["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";M["jp-jp"].optionsQuit="\u3084\u3081\u308b";M["jp-jp"].optionsResume="\u518d\u958b";M["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";M["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";M["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";M["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";M["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";M["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
M["jp-jp"].optionsMusic_on="\u30aa\u30f3";M["jp-jp"].optionsMusic_off="\u30aa\u30d5";M["jp-jp"].optionsSFX_on="\u30aa\u30f3";M["jp-jp"].optionsSFX_off="\u30aa\u30d5";M["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";M["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";M["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";M["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
M["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";M["jp-jp"].optionsTitle="\u8a2d\u5b9a";M["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";M["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";M["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
M["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";M["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";M["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";M["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";M["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
M["jp-jp"].optionsAbout_title="About";M["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";M["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";M["jp-jp"].optionsAbout_version="version";M["jp-jp"].optionsAbout="About";M["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";M["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";M["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";M["jp-jp"].startScreenByTinglyGames="by: CoolGames";
M["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";M["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";M["jp-jp"].optionsAbout_header="Developed by";M["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";M["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";M["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";M["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
M["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";M["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";M["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";M["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";M["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";M["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";M["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
M["jp-jp"].challengeCancelConfirmBtn_yes="Yes";M["jp-jp"].challengeCancelConfirmBtn_no="No";M["jp-jp"].challengeEndScreensBtn_submit="\u3042";M["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";M["jp-jp"].challengeEndScreenName_you="You";M["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";M["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";M["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
M["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";M["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";M["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";M["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";M["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
M["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";M["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";M["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";M["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";M["jp-jp"].challengeForfeitConfirmBtn_no="No";M["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";M["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
M["jp-jp"].optionsChallengeForfeit="Forfeit";M["jp-jp"].optionsChallengeCancel="Quit";M["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";M["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";M["jp-jp"].levelEndScreenHighScore_time="Best time:";M["jp-jp"].levelEndScreenTotalScore_time="Total time:";M["jp-jp"]["optionsLang_fr-fr"]="French";M["jp-jp"]["optionsLang_ko-kr"]="Korean";M["jp-jp"]["optionsLang_ar-eg"]="Arabic";
M["jp-jp"]["optionsLang_es-es"]="Spanish";M["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";M["jp-jp"]["optionsLang_ru-ru"]="Russian";M["jp-jp"].optionsExit="Exit";M["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";M["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";M["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
M["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";M["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";M["jp-jp"].optionsAbout_header_publisher="Published by:";M["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";M["jp-jp"]["optionsLang_it-it"]="Italian";M["it-it"]=M["it-it"]||{};M["it-it"].loadingScreenLoading="Caricamento...";
M["it-it"].startScreenPlay="GIOCA";M["it-it"].levelMapScreenTotalScore="Punteggio totale";M["it-it"].levelEndScreenTitle_level="Livello <VALUE>";M["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";M["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";M["it-it"].levelEndScreenTotalScore="Punteggio totale";M["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";M["it-it"].levelEndScreenTimeLeft="Tempo rimanente";M["it-it"].levelEndScreenTimeBonus="Tempo bonus";
M["it-it"].levelEndScreenHighScore="Record";M["it-it"].optionsStartScreen="Menu principale";M["it-it"].optionsQuit="Esci";M["it-it"].optionsResume="Riprendi";M["it-it"].optionsTutorial="Come si gioca";M["it-it"].optionsHighScore="Record";M["it-it"].optionsMoreGames="Altri giochi";M["it-it"].optionsDifficulty_easy="Facile";M["it-it"].optionsDifficulty_medium="Media";M["it-it"].optionsDifficulty_hard="Difficile";M["it-it"].optionsMusic_on="S\u00ec";M["it-it"].optionsMusic_off="No";
M["it-it"].optionsSFX_on="S\u00ec";M["it-it"].optionsSFX_off="No";M["it-it"]["optionsLang_en-us"]="Inglese (US)";M["it-it"]["optionsLang_en-gb"]="Inglese (UK)";M["it-it"]["optionsLang_nl-nl"]="Olandese";M["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";M["it-it"].gameEndScreenBtnText="Continua";M["it-it"].optionsTitle="Impostazioni";M["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
M["it-it"].optionsQuitConfirmBtn_No="No";M["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";M["it-it"].levelMapScreenTitle="Scegli un livello";M["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";M["it-it"].optionsRestart="Riavvia";M["it-it"].optionsSFXBig_on="Audio S\u00cc";M["it-it"].optionsSFXBig_off="Audio NO";M["it-it"].optionsAbout_title="Informazioni";M["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
M["it-it"].optionsAbout_backBtn="Indietro";M["it-it"].optionsAbout_version="versione:";M["it-it"].optionsAbout="Informazioni";M["it-it"].levelEndScreenMedal="MIGLIORATO!";M["it-it"].startScreenQuestionaire="Che ne pensi?";M["it-it"].levelMapScreenWorld_0="Scegli un livello";M["it-it"].startScreenByTinglyGames="di: CoolGames";M["it-it"]["optionsLang_de-de"]="Tedesco";M["it-it"]["optionsLang_tr-tr"]="Turco";M["it-it"].optionsAbout_header="Sviluppato da:";M["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
M["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";M["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";M["it-it"].challengeStartTextScore="punteggio di <NAME>:";M["it-it"].challengeStartTextTime="tempo di <NAME>:";M["it-it"].challengeStartScreenToWin="Necessario per vincere:";M["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";M["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
M["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";M["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";M["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";M["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";M["it-it"].challengeCancelConfirmBtn_no="No";M["it-it"].challengeEndScreensBtn_submit="Invia la sfida";M["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
M["it-it"].challengeEndScreenName_you="Tu";M["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";M["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";M["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";M["it-it"].challengeCancelMessage_success="Sfida annullata.";M["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
M["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";M["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";M["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";M["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";M["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";M["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
M["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";M["it-it"].challengeForfeitConfirmBtn_no="No";M["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";M["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";M["it-it"].optionsChallengeForfeit="Abbandona";M["it-it"].optionsChallengeCancel="Esci";M["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";M["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
M["it-it"].levelEndScreenHighScore_time="Miglior tempo:";M["it-it"].levelEndScreenTotalScore_time="Tempo totale:";M["it-it"]["optionsLang_fr-fr"]="Francese";M["it-it"]["optionsLang_ko-kr"]="Coreano";M["it-it"]["optionsLang_ar-eg"]="Arabo";M["it-it"]["optionsLang_es-es"]="Spagnolo";M["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";M["it-it"]["optionsLang_ru-ru"]="Russo";M["it-it"].optionsExit="Esci";M["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
M["it-it"].levelEndScreenHighScore_number="Record:";M["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";M["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
M["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";M["it-it"].optionsAbout_header_publisher="Distribuito da:";M["it-it"]["optionsLang_jp-jp"]="Giapponese";M["it-it"]["optionsLang_it-it"]="Italiano";M=M||{};M["nl-nl"]=M["nl-nl"]||{};M["nl-nl"].game_ui_SCORE="SCORE";M["nl-nl"].game_ui_STAGE="LEVEL";M["nl-nl"].game_ui_LIVES="LEVENS";M["nl-nl"].game_ui_TIME="TIJD";M["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";M["nl-nl"].game_ui_LEVEL="LEVEL";M["nl-nl"].game_ui_time_left="Resterende tijd";
M["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";M["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";M["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";M["en-us"]=M["en-us"]||{};M["en-us"].game_ui_SCORE="SCORE";M["en-us"].game_ui_STAGE="STAGE";M["en-us"].game_ui_LIVES="LIVES";M["en-us"].game_ui_TIME="TIME";M["en-us"].game_ui_HIGHSCORE="HIGH SCORE";M["en-us"].game_ui_LEVEL="LEVEL";M["en-us"].game_ui_time_left="Time left";M["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";M["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
M["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";M["en-gb"]=M["en-gb"]||{};M["en-gb"].game_ui_SCORE="SCORE";M["en-gb"].game_ui_STAGE="STAGE";M["en-gb"].game_ui_LIVES="LIVES";M["en-gb"].game_ui_TIME="TIME";M["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";M["en-gb"].game_ui_LEVEL="LEVEL";M["en-gb"].game_ui_time_left="Time left";M["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";M["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";M["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";M["de-de"]=M["de-de"]||{};
M["de-de"].game_ui_SCORE="PUNKTE";M["de-de"].game_ui_STAGE="STUFE";M["de-de"].game_ui_LIVES="LEBEN";M["de-de"].game_ui_TIME="ZEIT";M["de-de"].game_ui_HIGHSCORE="HIGHSCORE";M["de-de"].game_ui_LEVEL="LEVEL";M["de-de"].game_ui_time_left="Restzeit";M["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";M["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";M["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";M["fr-fr"]=M["fr-fr"]||{};M["fr-fr"].game_ui_SCORE="SCORE";M["fr-fr"].game_ui_STAGE="SC\u00c8NE";
M["fr-fr"].game_ui_LIVES="VIES";M["fr-fr"].game_ui_TIME="TEMPS";M["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";M["fr-fr"].game_ui_LEVEL="NIVEAU";M["fr-fr"].game_ui_time_left="Temps restant";M["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";M["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";M["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";M["pt-br"]=M["pt-br"]||{};M["pt-br"].game_ui_SCORE="PONTOS";M["pt-br"].game_ui_STAGE="FASE";M["pt-br"].game_ui_LIVES="VIDAS";M["pt-br"].game_ui_TIME="TEMPO";
M["pt-br"].game_ui_HIGHSCORE="RECORDE";M["pt-br"].game_ui_LEVEL="N\u00cdVEL";M["pt-br"].game_ui_time_left="Tempo restante";M["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";M["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";M["pt-br"].game_ui_HIGHSCORE_break="RECORDE";M["es-es"]=M["es-es"]||{};M["es-es"].game_ui_SCORE="PUNTOS";M["es-es"].game_ui_STAGE="FASE";M["es-es"].game_ui_LIVES="VIDAS";M["es-es"].game_ui_TIME="TIEMPO";M["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
M["es-es"].game_ui_LEVEL="NIVEL";M["es-es"].game_ui_time_left="Tiempo restante";M["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";M["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";M["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";M["tr-tr"]=M["tr-tr"]||{};M["tr-tr"].game_ui_SCORE="SKOR";M["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";M["tr-tr"].game_ui_LIVES="HAYATLAR";M["tr-tr"].game_ui_TIME="S\u00dcRE";M["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";M["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
M["tr-tr"].game_ui_time_left="Kalan zaman";M["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";M["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";M["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";M["ru-ru"]=M["ru-ru"]||{};M["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";M["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";M["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";M["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
M["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";M["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";M["ru-ru"].game_ui_time_left="Time left";M["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";M["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";M["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";M["ar-eg"]=M["ar-eg"]||{};M["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";M["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
M["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";M["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";M["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";M["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";M["ar-eg"].game_ui_time_left="Time left";M["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";M["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";M["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
M["ko-kr"]=M["ko-kr"]||{};M["ko-kr"].game_ui_SCORE="\uc810\uc218";M["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";M["ko-kr"].game_ui_LIVES="\uae30\ud68c";M["ko-kr"].game_ui_TIME="\uc2dc\uac04";M["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";M["ko-kr"].game_ui_LEVEL="\ub808\ubca8";M["ko-kr"].game_ui_time_left="Time left";M["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";M["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";M["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
M["jp-jp"]=M["jp-jp"]||{};M["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";M["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";M["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";M["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";M["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";M["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";M["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";M["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";M["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
M["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";M["it-it"]=M["it-it"]||{};M["it-it"].game_ui_SCORE="PUNTEGGIO";M["it-it"].game_ui_STAGE="FASE";M["it-it"].game_ui_LIVES="VITE";M["it-it"].game_ui_TIME="TEMPO";M["it-it"].game_ui_HIGHSCORE="RECORD";M["it-it"].game_ui_LEVEL="LIVELLO";M["it-it"].game_ui_time_left="TEMPO RIMANENTE";M["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";M["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";M["it-it"].game_ui_HIGHSCORE_break="RECORD";
var df={};
function ef(){df={fe:{Fk:"en-us",Fj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Xd:{Mc:K(1040),jq:K(960),Wb:K(640),yg:K(640),xf:K(0),Uk:K(-80),wf:0,minHeight:K(780),Fm:{id:"canvasBackground",depth:50},fd:{id:"canvasGame",depth:100,top:K(200,"round"),left:K(40,"round"),width:K(560,"round"),height:K(560,"round")},Jc:{id:"canvasGameUI",depth:150,top:0,left:0,height:K(120,"round")},sf:{id:"canvasMain",depth:200}},Gm:{Mc:K(640),jq:K(640),Wb:K(1152),yg:K(1152),
xf:K(0),Uk:K(0),wf:0,minHeight:K(640),minWidth:K(850),Fm:{id:"canvasBackground",depth:50},fd:{id:"canvasGame",depth:100,top:K(40,"round"),left:K(296,"round"),width:K(560,"round"),height:K(560,"round")},Jc:{id:"canvasGameUI",depth:150,top:0,left:K(151),width:K(140)},sf:{id:"canvasMain",depth:200}},Ub:{bigPlay:{type:"text",s:Ud,Aa:K(38),ub:K(99),font:{align:"center",h:"middle",fontSize:L({big:46,small:30}),fillColor:"#01198a",Y:{k:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},ad:2,bd:K(30),fontSize:L({big:46,
small:30})},difficulty_toggle:{type:"toggleText",s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"0",s:Wc,S:"optionsDifficulty_easy"},{id:"1",s:Vc,S:"optionsDifficulty_medium"},{id:"2",s:Uc,S:"optionsDifficulty_hard"}],gh:K(30),hh:K(12),Yf:K(10),ad:2,bd:K(30),fontSize:L({big:40,small:20})},music_toggle:{type:"toggle",s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,
small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"on",s:Td,S:"optionsMusic_on"},{id:"off",s:Sd,S:"optionsMusic_off"}],gh:K(30),hh:K(12),Yf:0,ad:2,bd:K(30)},sfx_toggle:{type:"toggle",s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"on",s:Rd,S:"optionsSFX_on"},{id:"off",s:Qd,S:"optionsSFX_off"}],gh:K(30),hh:K(12),Yf:0,ad:2,bd:K(30)},music_big_toggle:{type:"toggleText",
s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"on",s:"undefined"!==typeof Xd?Xd:void 0,S:"optionsMusic_on"},{id:"off",s:"undefined"!==typeof Yd?Yd:void 0,S:"optionsMusic_off"}],gh:K(28,"round"),hh:K(10),Yf:K(10),ad:2,bd:K(30),fontSize:L({big:40,small:20})},sfx_big_toggle:{type:"toggleText",s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",
Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"on",s:"undefined"!==typeof Vd?Vd:void 0,S:"optionsSFXBig_on"},{id:"off",s:"undefined"!==typeof Wd?Wd:void 0,S:"optionsSFXBig_off"}],gh:K(33,"round"),hh:K(12),Yf:K(10),ad:2,bd:K(30),fontSize:L({big:40,small:20})},language_toggle:{type:"toggleText",s:Pd,Aa:K(106),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Z:[{id:"en-us",s:Xc,S:"optionsLang_en-us"},
{id:"en-gb",s:Yc,S:"optionsLang_en-gb"},{id:"nl-nl",s:Zc,S:"optionsLang_nl-nl"},{id:"de-de",s:ad,S:"optionsLang_de-de"},{id:"fr-fr",s:bd,S:"optionsLang_fr-fr"},{id:"pt-br",s:cd,S:"optionsLang_pt-br"},{id:"es-es",s:dd,S:"optionsLang_es-es"},{id:"ru-ru",s:gd,S:"optionsLang_ru-ru"},{id:"it-it",s:jd,S:"optionsLang_it-it"},{id:"ar-eg",s:hd,S:"optionsLang_ar-eg"},{id:"ko-kr",s:id,S:"optionsLang_ko-kr"},{id:"tr-tr",s:$c,S:"optionsLang_tr-tr"},{id:"jp-jp",s:fd,S:"optionsLang_jp-jp"}],gh:K(40),hh:K(20),Yf:K(10),
ad:2,bd:K(30),fontSize:L({big:40,small:20})},default_text:{type:"text",s:Od,Aa:K(40),ub:K(40),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ad:2,bd:K(30),fontSize:L({big:40,small:20})},default_image:{type:"image",s:Od,Aa:K(40),ub:K(40),bd:K(6)},options:{type:"image",s:Md}},Em:{bigPlay:{type:"text",s:Ud,Aa:K(40),ub:K(76),font:{align:"center",h:"middle",fontSize:L({big:40,small:20}),fillColor:"#01198a",Y:{k:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},ad:2,bd:K(30),fontSize:L({big:40,small:20})}},Oj:{green:{font:{align:"center",h:"middle",fillColor:"#018a17",Y:{k:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",h:"middle",fillColor:"#01198a",Y:{k:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",h:"middle",fillColor:"#004f89",Y:{k:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",h:"middle",fillColor:"#9a1900",Y:{k:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",h:"middle",fillColor:"#8d2501",Y:{k:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",h:"middle",fillColor:"#c6258f",Y:{k:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",h:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",h:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",Y:{k:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",Y:{k:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ja:{Yx:20},md:{backgroundImage:"undefined"!==typeof Zd?Zd:void 0,Nv:0,Xt:500,Qk:5E3,xv:5E3,zs:-1,Ux:12,Tx:100,re:K(78),Uo:{align:"center"},Gl:K(560),Pg:K(400),Qg:{align:"center"},Kf:K(680),Me:K(16),Ln:K(18),Fi:K(8),Cr:K(8),Dr:K(9),Er:K(9),aj:{align:"center",fillColor:"#3B0057",fontSize:K(24)},bt:{align:"center"},
To:K(620),bj:K(500),Gi:"center",Mf:K(500),Ii:K(60),Hb:{align:"center"},Bc:{align:"bottom",offset:K(20)},Qn:K(806),On:500,lv:K(20)},Nn:{Gi:"right",Gl:K(280),Kf:K(430),Mf:K(340),Hb:{align:"right",offset:K(32)},Bc:K(560),Qn:K(560)},zl:{Bm:K(860),backgroundImage:void 0!==typeof Zd?Zd:void 0,vu:700,Tr:1800,Jv:700,jw:2600,Gg:void 0!==typeof Zd?ke:void 0,kd:700,Hg:{align:"center"},qi:{align:"center"},ri:void 0!==typeof ke?-ke.height:0,Fg:{align:"top",offset:K(20)},jn:1,Jq:1,kn:1,Kq:1,hn:1,Iq:1,zu:ic,Au:qc,
xu:ic,yu:ic,wu:ic,cs:{align:"center"},Pi:K(656),Oi:K(300),hl:700,iw:700,mq:K(368),bk:K(796),fi:K(440),lq:700,Xn:K(36),Tk:K(750),Iv:500,Gi:"center",Mf:K(500),Ii:K(60),Hb:{align:"center"},Bc:{align:"bottom",offset:K(20)},Qn:K(806),On:500,lv:K(20)},Mo:{Bm:K(0),Pi:K(456),Oi:K(320),mq:{align:"center"},bk:K(346),fi:K(460),Xn:{align:"left",offset:K(32)},Tk:K(528),Gi:"right",Mf:K(340),Hb:{align:"right",offset:K(32)},Bc:K(560),Qn:K(560)},Hf:{aw:{align:"center",offset:K(-230)},eo:{align:"top",offset:K(576)},
$v:"options",cd:{h:"bottom"},Ze:{align:"center"},qc:{align:"top",offset:K(35,"round")},td:K(232),Ye:K(98),iy:{align:"center",offset:K(-206)},kp:{align:"top",offset:K(30)},hy:{align:"center",offset:K(206)},jp:{align:"top",offset:K(30)},type:"grid",Xv:3,Yz:3,Yv:5,Zz:4,pq:!0,nu:!0,sn:K(78),Nq:{align:"top",offset:K(140)},Pq:{align:"top",offset:K(140)},Oq:K(20),Fu:K(18),Gu:K(18),Zu:{nn:{fontSize:L({big:60,small:30}),fillColor:"#3F4F5E",align:"center",h:"middle",Y:{k:!0,color:"#D0D8EA",offsetX:0,offsetY:K(6),
blur:0}}},$u:{nn:{fontSize:L({big:32,small:16}),fillColor:"#3F4F5E",align:"center",h:"middle",Y:{k:!0,color:"#D0D8EA",offsetX:0,offsetY:K(2),blur:0}}},xr:K(438),yr:K(438),pr:{align:"center"},qr:{align:"center"},Gr:{align:"center"},Hr:{align:"center",offset:K(-22)},tr:{align:"center"},ur:{align:"center",offset:K(-10)},Es:{align:"center",offset:K(216)},Fs:{align:"top",offset:K(574)},Ds:{fontSize:L({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Gs:K(10),ds:{fontSize:L({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},es:{align:"center"},fs:{align:"top",offset:K(588)},tw:K(160),sw:K(40),backgroundImage:"undefined"!==typeof de?de:void 0,Qx:K(10),Rx:200,Px:K(200),wz:K(600),Sv:800,Rv:500},rr:{kp:{align:"top",offset:K(20)},jp:{align:"top",offset:K(20)},qc:{align:"top",offset:K(25,"round")},sn:K(234),Nq:{align:"top",offset:K(110)},Pq:{align:"top",offset:K(110)},Fs:{align:"top",offset:K(536)},fs:{align:"top",offset:K(550)},eo:{align:"top",offset:K(538)}},Lk:{mc:"undefined"!==typeof ee?ee:void 0,ko:{align:"center"},
$r:"undefined"!==typeof ee?-ee.height:void 0,bl:[{type:"y",na:0,duration:800,end:{align:"center",offset:K(-142)},eb:qc,cc:Pe}],jo:[{type:"y",na:0,duration:600,end:"undefined"!==typeof ee?-ee.height:void 0,eb:pc,Wp:!0}],Ip:{align:"center",h:"middle"},Jp:{align:"center"},Kp:0,Uh:K(500),tm:K(80),Sq:{align:"center",h:"middle"},Uq:{align:"center"},Vq:0,wi:K(560),Tq:K(80),as:3500},In:{bl:[{type:"y",na:0,duration:800,end:{align:"center"},eb:qc,cc:Pe}]},Iy:{mc:"undefined"!==typeof s_overlay_challenge_start?
s_overlay_challenge_start:void 0,ko:{align:"center"},$r:K(56),dl:0,el:0,cd:{align:"center",h:"top"},td:K(500),Ye:K(100),Ze:{align:"center"},qc:K(90),Hz:{align:"center",h:"middle"},Mz:K(500),Lz:K(80),Qz:{align:"center"},Rz:K(250),CA:{align:"center",h:"top"},EA:K(500),DA:K(40),FA:{align:"center"},GA:K(348),BA:{align:"center",h:"top"},IA:K(500),HA:K(50),KA:{align:"center"},LA:K(388),rB:{align:"center",h:"top"},tB:K(500),sB:K(40),wB:{align:"center"},xB:K(442),uB:0,vB:0,qB:{align:"center",h:"top"},zB:K(500),
yB:K(50),AB:{align:"center"},BB:K(482),pB:K(10),nB:0,oB:0,Sh:800,pm:qc,qm:600,rm:pc,as:3500},Hy:{qy:500,Sh:800,Vz:1500,Wz:500,JA:2500,OA:500,MA:3200,NA:800,Cz:4200,Dz:300,Ay:4500,dA:{align:"center"},eA:K(-800),bA:{align:"center"},cA:K(52),dl:0,el:0,mk:.8,Aq:"#000000",Yn:{align:"center",h:"middle"},Ez:K(360),zz:K(120),Az:K(4),Bz:K(4),Fz:{align:"center"},Gz:K(340),aB:{align:"center"},bB:K(600),$A:K(500),ZA:K(120),YA:{align:"center",h:"middle"},CB:{align:"center",h:"middle"},GB:K(360),DB:K(60),EB:K(4),
FB:K(4),HB:{align:"center"},IB:K(480),gB:K(460),cB:{align:"center"},dB:K(400),By:{align:"center"},Cy:K(500),Tz:{align:"center",h:"middle"},Uz:K(75,"round"),Sz:K(48),Xz:K(120),Pz:K(214,"round"),Iz:K(40),Jz:K(4),Kz:K(4),Nz:0,Oz:0,Zy:{align:"center",h:"middle"},bz:K(220),az:K(180),$y:K(80),Xy:K(4),Yy:K(4)},oa:{cl:{Nm:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,pu:"undefined"!==typeof s_overlay_endless?s_overlay_endless:void 0,bv:"undefined"!==typeof ae?ae:void 0,Yu:"undefined"!==
typeof be?be:void 0},Sx:500,Sh:800,pm:qc,qm:800,rm:lc,$b:{align:"center"},ac:0,cd:{align:"center",h:"middle",fontSize:L({big:26,small:13})},Ze:{align:"center"},qc:K(58),td:K(500),Ye:K(100),Ps:{align:"center",h:"middle",fontSize:L({big:56,small:28})},Rs:{align:"center"},Ss:K(236),Sm:{align:"center",h:"top",fontSize:L({big:24,small:12})},tq:{align:"center"},gk:K(144),ii:{align:"center",h:"top",fontSize:L({big:56,small:28})},jk:{align:"center"},Bg:K(176),ik:K(200),hk:K(60),Xi:{align:"center",h:"top",
fontSize:L({big:24,small:12})},We:{align:"center"},Xe:K(286),Ms:K(0),Eq:!1,Kd:K(14),Dl:K(10),Vf:{align:"center",h:"top",fontSize:L({big:24,small:12})},Zg:K(10),$g:K(4),ah:K(200),WA:K(50),Vt:{align:"center",offset:K(12)},Op:K(549),uu:{align:"center",offset:K(162)},Fq:K(489),vg:{align:"center",offset:K(250)},vf:K(10),ug:K(90),uf:K(90),Go:{align:"center",offset:K(-177,"round")},Ho:K(120),Io:{align:"center"},Jo:K(96),Ko:{align:"center",offset:K(179,"round")},Lo:K(120),UA:200,yx:500,As:800,Cs:0,Bx:0,Ax:300,
zx:200,Bs:300,mk:.8,ic:800,Aq:"#000000",Vn:K(508),Ki:K(394),Jr:K(96),Kr:K(74),Rk:3,Rg:400,yv:2500,yz:0,Bv:K(100),Lr:1.5,Gv:{align:"center"},Hv:K(76),Sk:K(180),Fv:K(36),Mr:{align:"center",h:"middle",fontSize:L({big:22,small:12}),U:"ff_opensans_extrabold",fillColor:"#1d347f",Y:{k:!0,color:"#68cbfa",offsetY:K(2)}},Ir:500,zv:500,Av:K(-30),Dv:500,Cv:0,Ev:4E3,Ml:600,by:1500,Xp:500,pg:750,Ou:{align:"center"},Pu:K(290),$q:K(350),Pv:1E3,type:{level:{Ij:"level",$c:!0,Xg:!0,fj:"title_level",le:"totalScore",
Gj:"retry",ok:"next"},failed:{Ij:"failed",$c:!1,Xg:!1,fj:"title_level",Qs:"subtitle_failed",Gj:"exit",ok:"retry"},endless:{Ij:"endless",$c:!1,Xg:!0,fj:"title_endless",Tm:"totalScore",le:"highScore",Gj:"exit",ok:"retry"},difficulty:{Ij:"difficulty",$c:!1,Xg:!0,fj:"title_difficulty",Tm:"timeLeft",le:["totalScore","timeBonus"],Gj:"exit",ok:"retry"}}},or:{vf:K(0),qc:K(30),gk:K(114),Bg:K(146),Xe:K(266),Op:K(488),Fq:K(428),Vn:{align:"center",offset:K(220)},Ki:K(260)},Bi:{backgroundImage:"undefined"!==typeof ge?
ge:void 0},options:{backgroundImage:$d,$b:{align:"center"},ac:0,cd:{},Ze:{align:"center"},qc:K(58),td:K(500),Ye:K(100),Qj:K(460,"round"),Pj:{align:"center"},Yh:{align:"center",offset:K(36)},zd:K(10,"round"),vg:K(510),vf:K(10),ug:K(130),uf:K(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames","quit"]},$k:800,al:qc,ho:600,io:lc,hq:{align:"center"},
Xj:K(260),Wj:K(460),Im:K(300),fq:{align:"center"},Vj:K(460),eq:{align:"center"},Uj:K(560,"round"),bi:K(460,"round"),nl:{},vd:"undefined"!==typeof fe?fe:void 0,Ol:{align:"center"},$e:K(84,"round"),Ul:{align:"center",h:"top"},ij:K(480),$o:K(46),pt:{align:"center"},ap:K(110,"round"),nt:{align:"center"},Sl:K(160,"round"),ot:{align:"center"},Tl:K(446,"round"),Rl:{h:"middle",align:"center",fontSize:L({big:36,small:18})},jh:K(480),Zo:K(160),mt:{align:"center",offset:K(-80,"round")},Ql:K(556,"round"),lt:{align:"center",
offset:K(80,"round")},Pl:K(556,"round"),zj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ca:K(6)},Aj:K(480),Bp:K(50),Bj:{align:"center"},Lh:K(106,"round"),Nh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ca:K(6)},jf:K(480),Oh:K(110),lg:{align:"center"},Ph:K(396,"round"),Mh:{align:"center"},Cj:K(140),lm:{align:"center"},Jh:K(500),Kh:K(480),mm:{align:"center",h:"top",fillColor:"#808080",fontSize:L({big:12,small:8})},Ep:{align:"center"},nm:K(610),
Dp:K(440),Cp:K(20),mg:K(200),Dj:K(200),yt:K(80),zt:K(140),xt:K(10)},bw:{qc:K(12),Yh:{align:"center",offset:K(16)},Xj:K(200),Im:K(300),Vj:K(400),Uj:K(500,"round"),$e:K(60,"round"),ap:K(80,"round"),Sl:K(134,"round"),Tl:K(410,"round"),Ql:K(500,"round"),Pl:K(500,"round"),Lh:K(86,"round"),Cj:K(126),Ph:K(392,"round"),Jh:K(490),nm:K(590)},Ur:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:$d,$b:{align:"center"},ac:K(120),cd:{},Ze:{align:"center"},qc:K(200),Qj:K(460,
"round"),Pj:{align:"center"},Yh:{align:"center",offset:K(140)},zd:K(10,"round"),vg:K(510),vf:K(10),ug:K(130),uf:K(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},$k:800,al:qc,ho:600,io:lc,nl:{},tA:{align:"center"},uA:K(360),sA:K(460),rA:K(300),nA:"default_text",oA:{align:"center"},pA:K(630),kA:"default_text",lA:{align:"center"},
mA:K(730,"round"),qA:K(460,"round"),gq:{},hq:{align:"center"},Xj:K(200),Wj:K(460),Im:K(250),fq:{align:"center"},Vj:K(520),eq:{align:"center"},Uj:K(620,"round"),bi:K(460,"round"),Yn:{},Lv:{align:"center"},Mv:K(200),Zn:K(460),Kv:K(300),vd:"undefined"!==typeof fe?fe:void 0,Ol:{align:"center"},$e:K(0,"round"),Ul:{align:"center",h:"top"},ij:K(480),$o:K(50),pt:{align:"center"},ap:K(20,"round"),nt:{align:"center"},Sl:K(70,"round"),ot:{align:"center"},Tl:K(356,"round"),Rl:{h:"middle",align:"center",fontSize:L({big:36,
small:18})},jh:K(480),Zo:K(150),mt:K(224,"round"),Ql:K(636,"round"),lt:K(350,"round"),Pl:K(636,"round"),zj:{align:"center",h:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ca:K(6)},Aj:K(480),Bp:K(50),Bj:{align:"center"},Lh:K(26,"round"),Nh:{align:"center",h:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ca:K(6)},jf:K(480),Oh:K(110),lg:{align:"center"},Ph:K(316,"round"),Mh:{align:"center"},Cj:K(60),lm:{align:"center"},Jh:K(420),Kh:K(480),mm:{align:"center",h:"top",fillColor:"#808080",
fontSize:L({big:12,small:8})},Ep:{align:"center"},nm:K(530),Dp:K(440),Cp:K(20),mg:K(200),Dj:K(200),yt:K(80),zt:K(100),xt:K(10)},Mm:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:$d,$b:{align:"center"},ac:K(120),Qj:K(460,"round"),Pj:{align:"center"},Yh:{align:"bottom",offset:K(20)},zd:K(10,"round"),vg:K(510),vf:K(10),ug:K(130),uf:K(90),$k:800,al:qc,ho:600,io:lc,is:{},Cw:{align:"center"},Dw:{align:"center",offset:K(40)},ro:K(460),qo:K(300),Os:{},Aw:{align:"center"},Bw:{align:"center",
offset:K(160)},zw:K(460),yw:K(200)},pk:{backgroundImage:"undefined"!==typeof ce?ce:void 0,bt:{align:"center"},To:K(152),bj:K(560),at:K(560),font:{align:"center",h:"middle",fontSize:L({big:52,small:26}),fillColor:"#FFFFFF"},bu:{align:"center"},Cm:K(600),$p:K(460),Zp:"default_text"},cn:{Cm:K(520)}}}var ff={ww:"poki",Vi:{jv:!1,Om:[]},fe:{Fk:"en-us",Fj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},Tp:{show:!1}},gf=gf||{};gf.oi={qk:"2d6a23595caffab2e3268eef29ce7833",ul:"877b697a557f34ef49b06fe4862a520b7eca7b4f"};
gf.Ws="en-us nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru jp-jp it-it".split(" ");var hf=null;
function jf(){hf={sc:{rv:5,X:{x:K(65),y:0},Vx:K(70),Wx:K(-7)},Tj:{max:4,ns:[1,1.3,1.6,2,2,2,2,2],time:1},He:{zg:"locked",dn:"linkgame",Fd:"level",Or:["resume","tutorial",["music","sfx"],"quit"],ba:[9],Ti:!1,Sf:!0},n:{Nu:10,sv:2,Bt:15},oa:{le:["timeLeft"]},av:{us:!1},Kn:{Jn:9},fw:{Yp:{top:740,zm:1240,left:-800,right:2052},Xu:{top:180,zm:840,left:-1200,right:-100},Jw:{top:180,zm:840,left:1252,right:2352}},ve:{Level1:{width:500,height:400,items:[{x:150,y:100,id:"tile",kind:0},{x:150,y:200,id:"tile",
kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},
{x:250,y:250,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:50},A:{types_1:[1,1,1,1,1],types_11:[0,0,0,0,0],types_16:[0,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level2:{width:500,height:400,items:[{x:150,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,
id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0}],m:{O:1,P:12,R:40,
time:50},A:{types_1:[1,1,1,1,1],types_11:[1,1,0,0,0],types_16:[0,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level3:{width:500,height:400,items:[{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:13},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:13},{x:200,y:250,id:"tile",kind:9},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},
{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:3},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:1},{x:250,y:150,id:"tile",kind:10},{x:300,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:2},{x:300,y:200,id:"tile",kind:3},{x:150,y:200,id:"tile",kind:2},{x:100,y:100,id:"tile",kind:9},{x:100,y:300,id:"tile",kind:10},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:350,
y:300,id:"tile",kind:1}],m:{O:1,P:18,R:55,time:75},A:{types_1:[0,0,0,1,1],types_11:[1,1,0,1,1],types_16:[0,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,0,0]}},Level4:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:5},{x:50,y:100,id:"tile",kind:3},{x:50,y:200,id:"tile",kind:6},{x:50,y:250,id:"tile",kind:2},{x:50,y:300,id:"tile",kind:4},{x:400,y:100,id:"tile",kind:5},{x:400,y:150,id:"tile",kind:2},{x:400,y:200,id:"tile",kind:3},{x:400,y:300,id:"tile",kind:6},{x:150,y:200,id:"tile",kind:0},
{x:150,y:150,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:200,
y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:4},{x:50,y:150,id:"tile",kind:1},{x:400,y:250,id:"tile",kind:1}],m:{O:1,P:16,R:55,time:75},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,1,1,1,1]}},Level5:{width:500,height:400,items:[{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:2},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",
kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:1},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:3},{x:50,y:100,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:4},{x:100,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:1},{x:150,
y:200,id:"tile",kind:2},{x:200,y:150,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:3},{x:300,y:150,id:"tile",kind:4},{x:250,y:150,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",
kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0}],m:{O:1,P:19,R:65,time:95},A:{types_1:[0,0,0,0,1],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level6:{width:500,height:400,items:[{x:50,y:100,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:8},{x:150,y:150,id:"tile",kind:9},{x:150,y:250,id:"tile",kind:10},
{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:11},{x:300,y:50,id:"tile",kind:3},{x:300,y:100,id:"tile",kind:5},{x:300,y:150,id:"tile",kind:2},{x:300,y:200,id:"tile",kind:6},{x:300,y:250,id:"tile",kind:4},{x:350,y:300,id:"tile",kind:13},{x:400,y:300,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:1},{x:350,y:50,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:13},{x:100,
y:150,id:"tile",kind:7},{x:200,y:50,id:"tile",kind:1},{x:250,y:50,id:"tile",kind:7},{x:250,y:300,id:"tile",kind:12},{x:200,y:300,id:"tile",kind:6},{x:200,y:100,id:"tile",kind:2},{x:250,y:100,id:"tile",kind:8},{x:250,y:150,id:"tile",kind:9},{x:200,y:200,id:"tile",kind:4},{x:200,y:150,id:"tile",kind:3},{x:250,y:200,id:"tile",kind:10},{x:250,y:250,id:"tile",kind:11},{x:200,y:250,id:"tile",kind:5},{x:50,y:300,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:400,y:250,
id:"tile",kind:0},{x:50,y:250,id:"tile",kind:12},{x:100,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0}],m:{O:1,P:19,R:65,time:95},A:{types_1:[0,0,0,0,0],types_11:[0,0,0,1,1],types_16:[1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level7:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:16},{x:400,y:50,id:"tile",kind:15},{x:250,y:150,id:"tile",kind:16},
{x:150,y:200,id:"tile",kind:15},{x:150,y:50,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:200,y:200,
id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:350,y:300,id:"tile",
kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:18},{x:250,y:50,id:"tile",kind:17},{x:250,y:300,id:"tile",kind:17},{x:200,y:300,id:"tile",kind:18},{x:50,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:80},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,0],types_16:[0,0,0],types_21:[1,1,1,1,0],types_26:[0],
types_6:[1,1,1,1,1]}},Level8:{width:500,height:400,items:[{x:400,y:50,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:25},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:15},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:3},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:18},{x:50,y:350,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:15},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,
id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:3},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:19},{x:300,y:50,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:20},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:18},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:20},{x:400,y:150,id:"tile",
kind:0},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:25},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},
{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:19},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0}],m:{O:1,P:16,R:55,time:90},A:{types_1:[1,1,0,1,1],types_11:[1,1,1,1,0],types_16:[1,1,0,0,0],types_21:[1,1,1,1,0],types_26:[0],types_6:[1,1,1,1,1]}},Level9:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:0},{x:50,y:100,
id:"tile",kind:4},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:21},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:13},{x:150,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:1},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:6},{x:400,y:300,id:"tile",kind:4},{x:400,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:100,id:"tile",
kind:0},{x:400,y:50,id:"tile",kind:21},{x:350,y:50,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:10},{x:350,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:13},{x:150,y:0,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:1},{x:100,y:0,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",
kind:6},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:10},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:9},{x:350,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},
{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:9},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0}],m:{O:1,P:16,R:55,time:85},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,
1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level10:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:2},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:6},{x:400,y:150,id:"tile",kind:7},{x:400,y:200,id:"tile",kind:4},{x:400,y:250,id:"tile",kind:3},{x:400,y:300,id:"tile",kind:2},{x:400,y:350,id:"tile",kind:5},{x:350,y:350,id:"tile",kind:14},
{x:300,y:350,id:"tile",kind:11},{x:250,y:350,id:"tile",kind:12},{x:200,y:350,id:"tile",kind:13},{x:150,y:350,id:"tile",kind:10},{x:100,y:350,id:"tile",kind:9},{x:50,y:350,id:"tile",kind:3},{x:50,y:300,id:"tile",kind:7},{x:50,y:250,id:"tile",kind:8},{x:50,y:200,id:"tile",kind:5},{x:50,y:150,id:"tile",kind:4},{x:50,y:100,id:"tile",kind:6},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,
y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:350,y:250,
id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:1},{x:100,y:0,id:"tile",kind:9},{x:150,y:0,id:"tile",kind:13},{x:200,y:0,id:"tile",kind:14},{x:250,y:0,id:"tile",kind:11},{x:300,y:0,id:"tile",kind:10},{x:350,y:0,id:"tile",kind:12},{x:400,y:0,id:"tile",kind:8},{x:300,y:250,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},
{x:400,y:50,id:"tile",kind:1}],m:{O:1,P:9,R:30,time:70},A:{types_1:[0,0,0,0,0],types_11:[0,0,0,0,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level11:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:16},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",
kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:2},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:4},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:5},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,
y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:8},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,
id:"tile",kind:0},{x:250,y:200,id:"tile",kind:14},{x:200,y:200,id:"tile",kind:12},{x:150,y:200,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:1},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:1},{x:450,y:100,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:12},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:5},{x:0,y:50,id:"tile",kind:8},{x:0,y:100,id:"tile",kind:0},
{x:0,y:250,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:2},{x:50,y:350,id:"tile",kind:14},{x:100,y:350,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:16},{x:350,y:200,id:"tile",
kind:4}],m:{O:1,P:10,R:35,time:95},A:{types_1:[0,0,1,0,0],types_11:[1,0,1,0,1],types_16:[0,1,1],types_21:[1,1,1,1,0],types_26:[0],types_6:[1,0,1,1,1]}},Level12:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:15},{x:150,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:16},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,
y:300,id:"tile",kind:15},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:16},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:18},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",
kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:20},{x:200,y:50,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:17},{x:200,y:100,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:22},{x:50,y:0,id:"tile",kind:20},{x:100,y:0,id:"tile",kind:0},
{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:19},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:17},{x:200,y:350,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:21},{x:150,y:200,id:"tile",kind:0},{x:150,y:150,
id:"tile",kind:0},{x:300,y:200,id:"tile",kind:18},{x:300,y:150,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:21},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:22},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:19},{x:250,y:50,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0}],m:{O:1,P:18,R:60,time:110},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,0],types_16:[0,0,0,0,0],types_21:[0,0,1,1,1],
types_26:[0],types_6:[1,1,1,1,1]}},Level13:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:6},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:1},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:6},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,
y:300,id:"tile",kind:2},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:22},{x:50,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:4},{x:300,y:100,id:"tile",kind:17},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:5},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",
kind:0},{x:250,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:5},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:3},{x:200,y:200,id:"tile",kind:25},{x:150,y:200,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:3},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,
y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:4},{x:100,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:22},{x:200,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:25},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:2},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},
{x:450,y:200,id:"tile",kind:17},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:1},{x:250,y:100,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:110},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,0,1,1,1],types_21:[1,0,1,1,0],types_26:[0],types_6:[0,1,1,1,1]}},Level14:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,
id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:21},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:2},{x:0,y:200,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",
kind:0},{x:150,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:21},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:2},{x:450,y:100,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:9},{x:250,y:300,id:"tile",kind:0},
{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:25},{x:100,y:300,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:22},{x:200,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:9},{x:250,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:19},{x:100,y:250,
id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:19},{x:350,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",
kind:0},{x:300,y:100,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:6},{x:50,y:150,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:22},{x:400,y:300,id:"tile",kind:6},{x:400,y:50,id:"tile",kind:25}],m:{O:1,P:15,R:50,time:125},A:{types_1:[1,0,1,1,1],types_11:[1,1,1,1,1],types_16:[1,1,1,0,1],types_21:[0,0,1,1,0],types_26:[0],types_6:[0,1,1,0,1]}},Level15:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:23},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,
id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:8},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:17},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:11},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:4},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:23},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},
{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:8},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:17},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:11},{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},
{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,
id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:13},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:4},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:12},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:13},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:12},{x:100,y:250,id:"tile",
kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0}],m:{O:1,P:9,R:30,time:120},A:{types_1:[1,1,1,0,1],types_11:[0,0,0,1,1],types_16:[1,0,1,1,1],types_21:[1,1,0,1,1],types_26:[0],types_6:[1,1,0,1,1]}},Level16:{width:500,height:400,items:[{x:50,
y:50,id:"tile",kind:16},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:10},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:5},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:6},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:1},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",
kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:10},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:7},{x:100,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:6},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:16},{x:350,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},
{x:300,y:250,id:"tile",kind:7},{x:350,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:1},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:5},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:350,y:100,id:"block"},{x:100,y:250,id:"block"}],m:{O:1,P:15,R:50,time:80},A:{types_1:[0,1,1,1,0],
types_11:[1,1,1,1,1],types_16:[0,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,1,1,0]}},Level17:{width:500,height:400,items:[{x:200,y:0,id:"tile",kind:12},{x:250,y:0,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:13},{x:450,y:300,id:"tile",kind:14},{x:250,y:350,id:"tile",kind:12},{x:200,y:350,id:"tile",kind:17},{x:0,y:300,id:"tile",kind:14},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:20},{x:300,y:50,id:"tile",kind:0},
{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:20},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:19},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:18},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:19},{x:50,
y:150,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:11},{x:50,y:50,id:"tile",kind:16},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:15},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:15},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:13},{x:100,y:200,
id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:17},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:11},{x:200,y:200,id:"tile",kind:16},{x:150,y:200,id:"tile",kind:0},{x:0,y:0,id:"block"},{x:50,y:0,id:"block"},{x:100,y:0,id:"block"},{x:150,y:0,id:"block"},{x:300,y:0,id:"block"},{x:350,y:0,id:"block"},{x:400,y:0,id:"block"},{x:450,y:0,id:"block"},{x:450,y:100,id:"block"},{x:450,y:150,id:"block"},{x:450,y:200,id:"block"},{x:450,
y:250,id:"block"},{x:300,y:350,id:"block"},{x:350,y:350,id:"block"},{x:400,y:350,id:"block"},{x:450,y:350,id:"block"},{x:0,y:350,id:"block"},{x:50,y:350,id:"block"},{x:100,y:350,id:"block"},{x:150,y:350,id:"block"},{x:0,y:100,id:"block"},{x:0,y:150,id:"block"},{x:0,y:200,id:"block"},{x:0,y:250,id:"block"},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:18}],m:{O:1,P:15,R:50,time:90},A:{types_1:[1,1,1,1,1],types_11:[0,0,0,0,0],types_16:[0,0,0,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,
1,1,1,1]}},Level18:{width:500,height:400,items:[{x:50,y:0,id:"tile",kind:1},{x:350,y:0,id:"tile",kind:5},{x:100,y:0,id:"tile",kind:6},{x:400,y:0,id:"tile",kind:2},{x:50,y:50,id:"tile",kind:7},{x:50,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:12},{x:50,y:300,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:3},{x:100,y:300,id:"tile",kind:4},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:4},{x:400,
y:300,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:3},{x:400,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:1},{x:400,y:100,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:9},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:8},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:9},{x:300,y:100,id:"tile",kind:0},{x:300,y:50,id:"tile",
kind:0},{x:250,y:50,id:"tile",kind:10},{x:250,y:100,id:"tile",kind:8},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:7},{x:250,y:300,id:"tile",kind:6},{x:200,y:250,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:11},{x:200,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:2},{x:150,y:200,id:"tile",kind:10},{x:150,y:250,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:11},{x:100,y:250,id:"tile",kind:5},{x:100,y:100,id:"tile",kind:0},
{x:100,y:50,id:"tile",kind:0},{x:0,y:0,id:"block"},{x:0,y:50,id:"block"},{x:0,y:100,id:"block"},{x:0,y:150,id:"block"},{x:0,y:200,id:"block"},{x:0,y:250,id:"block"},{x:0,y:300,id:"block"},{x:0,y:350,id:"block"},{x:450,y:0,id:"block"},{x:450,y:50,id:"block"},{x:450,y:150,id:"block"},{x:450,y:200,id:"block"},{x:450,y:250,id:"block"},{x:450,y:300,id:"block"},{x:450,y:350,id:"block"},{x:450,y:100,id:"block"},{x:300,y:350,id:"block"},{x:250,y:350,id:"block"},{x:200,y:350,id:"block"},{x:150,y:350,id:"block"},
{x:150,y:0,id:"block"},{x:200,y:0,id:"block"},{x:250,y:0,id:"block"},{x:300,y:0,id:"block"},{x:200,y:300,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:12},{x:100,y:350,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:200,y:200,id:"block"},{x:250,y:150,id:"block"}],m:{O:1,P:9,R:30,time:75},A:{types_1:[0,0,0,0,0],types_11:[0,0,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level19:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:7},
{x:50,y:0,id:"tile",kind:18},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:16},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:9},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:6},{x:400,y:350,id:"tile",
kind:0},{x:350,y:350,id:"tile",kind:18},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:13},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:9},{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",
kind:6},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:15},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:24},{x:400,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:7},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:16},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:15},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},
{x:50,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:24},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:300,
y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:13},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:350,y:50,id:"block"},{x:350,y:100,id:"block"},{x:100,y:50,id:"block"},{x:100,y:100,id:"block"},{x:100,y:250,id:"block"},{x:100,y:300,id:"block"},{x:350,y:250,id:"block"},{x:350,y:300,id:"block"},{x:200,y:150,id:"tile",kind:0}],m:{O:1,P:10,R:35,time:100},A:{types_1:[1,1,1,1,1],types_11:[1,1,0,1,0],types_16:[0,1,0,1,1],types_21:[1,1,1,0,1],types_26:[0],types_6:[0,0,1,0,1]}},Level20:{width:500,
height:400,items:[{x:0,y:0,id:"tile",kind:1},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:6},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:3},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:8},{x:450,y:0,id:"tile",kind:4},{x:50,y:0,id:"tile",kind:10},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:5},{x:0,y:200,id:"tile",kind:0},{x:0,y:250,id:"tile",
kind:4},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:3},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:7},{x:150,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:5},{x:300,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:2},{x:450,y:300,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:6},{x:450,y:100,id:"tile",kind:0},{x:400,
y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:10},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:1},{x:350,y:300,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:7},{x:300,y:250,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,
id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:9},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:9},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},
{x:150,y:100,id:"tile",kind:2},{x:100,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:8},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:110},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,
1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level21:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:1},{x:100,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:5},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:4},{x:400,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:6},{x:100,y:150,id:"tile",kind:8},{x:150,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",
kind:9},{x:50,y:100,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:6},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:3},{x:100,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:7},{x:200,y:300,id:"tile",kind:10},{x:250,y:300,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:3},{x:400,y:250,id:"tile",kind:1},{x:350,y:300,id:"tile",kind:2},{x:350,y:200,id:"tile",kind:7},{x:300,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,
y:250,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:8},{x:400,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:2},{x:100,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:5},{x:200,y:200,id:"tile",kind:4},{x:350,y:250,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:9},{x:200,y:150,id:"tile",kind:0},{x:250,y:200,
id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:10},{x:0,y:0,id:"block"},{x:450,y:0,id:"block"},{x:0,y:350,id:"block"},{x:450,y:350,id:"block"},{x:450,y:250,id:"block"},{x:0,y:250,id:"block"},{x:0,y:100,id:"block"},{x:450,y:100,id:"block"},{x:100,y:0,id:"block"},{x:200,y:0,id:"block"},{x:250,y:0,id:"block"},{x:350,y:0,id:"block"},{x:100,y:350,id:"block"},{x:200,y:350,id:"block"},{x:250,y:350,id:"block"},{x:350,y:350,id:"block"}],m:{O:1,P:12,R:40,time:80},A:{types_1:[0,
0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,1]}},Level22:{width:500,height:400,items:[{x:0,y:0,id:"block"},{x:0,y:50,id:"block"},{x:0,y:100,id:"block"},{x:0,y:150,id:"block"},{x:0,y:200,id:"block"},{x:0,y:250,id:"block"},{x:0,y:300,id:"block"},{x:0,y:350,id:"block"},{x:450,y:0,id:"block"},{x:450,y:50,id:"block"},{x:450,y:100,id:"block"},{x:450,y:150,id:"block"},{x:450,y:200,id:"block"},{x:450,y:250,id:"block"},{x:450,y:300,id:"block"},{x:450,
y:350,id:"block"},{x:50,y:0,id:"tile",kind:3},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:5},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:4},{x:400,y:50,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:9},{x:400,y:150,id:"tile",kind:1},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:9},{x:400,y:300,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:2},{x:350,y:350,id:"tile",kind:0},{x:300,
y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:4},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:6},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:1},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:7},{x:350,y:50,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},
{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:8},{x:100,y:100,id:"tile",kind:6},{x:150,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:7},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:2},{x:200,y:250,id:"tile",kind:0},{x:250,
y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:5},{x:300,y:150,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:8},{x:150,y:100,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:3},{x:200,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:90},A:{types_1:[0,0,
0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,1]}},Level23:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:7},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:12},{x:300,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:6},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:7},{x:450,y:150,
id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:10},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:8},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:14},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:11},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:9},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:10},
{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:13},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:12},{x:200,y:50,id:"tile",kind:9},{x:250,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:14},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:150,id:"tile",
kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:6},{x:350,y:150,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:8},{x:200,y:250,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:11},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:13},{x:150,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},
{x:350,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:50,y:100,id:"block"},{x:100,y:100,id:"block"},{x:150,y:100,id:"block"},{x:150,y:50,id:"block"},{x:50,y:250,id:"block"},{x:100,y:250,id:"block"},{x:150,y:250,id:"block"},{x:150,y:300,id:"block"},{x:300,y:300,id:"block"},{x:300,y:250,id:"block"},{x:350,y:250,id:"block"},{x:400,y:250,id:"block"},{x:300,y:50,id:"block"},{x:300,y:100,id:"block"},{x:350,y:100,id:"block"},{x:400,y:100,id:"block"}],m:{O:1,P:15,R:50,time:85},A:{types_1:[1,1,
1,1,1],types_11:[0,0,0,0,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level25:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:21},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:2},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:1},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:22},{x:450,y:0,id:"tile",kind:25},{x:450,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:21},{x:300,y:50,
id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:24},{x:0,y:100,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:25},{x:0,y:250,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:24},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:150,
y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:1},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:2},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:23},{x:450,y:300,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:3},{x:400,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,
id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:3},{x:300,y:250,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:23},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:22},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",
kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"block"},{x:100,y:100,id:"block"},{x:100,y:50,id:"block"},{x:350,y:50,id:"block"},{x:350,y:100,id:"block"},{x:400,y:100,id:"block"},{x:400,y:250,id:"block"},{x:350,y:250,id:"block"},{x:350,y:300,id:"block"},{x:100,y:300,id:"block"},{x:100,y:250,id:"block"},{x:50,y:250,id:"block"}],m:{O:1,P:9,
R:30,time:90},A:{types_1:[0,0,0,1,1],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,0,0,0,0],types_26:[0],types_6:[1,1,1,1,1]}},Level26:{width:500,height:400,items:[{x:0,y:0,id:"block"},{x:50,y:0,id:"block"},{x:100,y:0,id:"block"},{x:350,y:0,id:"block"},{x:400,y:0,id:"block"},{x:450,y:0,id:"block"},{x:450,y:50,id:"block"},{x:450,y:300,id:"block"},{x:450,y:350,id:"block"},{x:400,y:350,id:"block"},{x:350,y:350,id:"block"},{x:100,y:350,id:"block"},{x:50,y:350,id:"block"},{x:0,y:350,id:"block"},
{x:0,y:300,id:"block"},{x:0,y:50,id:"block"},{x:50,y:50,id:"tile",kind:15},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:19},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:12},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:20},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},
{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:18},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:14},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:16},{x:250,y:100,id:"tile",kind:14},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:16},{x:350,y:150,id:"tile",kind:0},{x:350,
y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:15},{x:200,y:250,id:"tile",kind:19},{x:150,y:250,id:"tile",kind:12},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:18},{x:300,y:200,id:"tile",kind:10},{x:150,y:150,id:"tile",kind:11},{x:150,y:200,id:"tile",kind:17},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:200,
y:0,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:17},{x:200,y:350,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:10},{x:0,y:250,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:11},{x:450,y:250,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:13},{x:300,y:0,id:"tile",kind:13},{x:150,y:0,id:"tile",kind:20}],m:{O:1,P:18,R:60,time:90},A:{types_1:[1,1,1,1,1],types_11:[0,0,0,0,0],types_16:[0,0,0,0,0],types_21:[1,1,1,1,1],
types_26:[0],types_6:[1,1,1,1,1]}},Level28:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:6},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:11},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:7},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:10},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:8},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:9},{x:350,y:300,id:"tile",kind:0},{x:300,
y:300,id:"tile",kind:7},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:8},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:11},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:6},{x:50,y:150,id:"tile",kind:10},{x:100,y:150,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",
kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:12},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:9},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:12},
{x:250,y:150,id:"tile",kind:0},{x:150,y:0,id:"block"},{x:200,y:0,id:"block"},{x:250,y:0,id:"block"},{x:300,y:0,id:"block"},{x:450,y:150,id:"block"},{x:450,y:200,id:"block"},{x:250,y:350,id:"block"},{x:200,y:350,id:"block"},{x:150,y:350,id:"block"},{x:0,y:150,id:"block"},{x:0,y:200,id:"block"},{x:300,y:350,id:"block"}],m:{O:1,P:15,R:50,time:90},A:{types_1:[1,1,1,1,1],types_11:[0,0,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level30:{width:500,height:400,items:[{x:0,
y:0,id:"tile",kind:1},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:7},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:9},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:2},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:4},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:9},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:7},{x:450,y:350,id:"tile",kind:3},{x:400,
y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:8},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:4},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:2},{x:0,y:300,id:"tile",kind:5},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:8},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},
{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:5},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,
id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:10},{x:350,y:150,id:"tile",kind:1},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",
kind:0},{x:200,y:250,id:"tile",kind:10},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:3},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0}],m:{O:1,P:7,R:25,time:125},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,
1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level31:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:11},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:18},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:17},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:14},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:17},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",
kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:13},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:15},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:16},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:12},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:19},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,
y:100,id:"tile",kind:20},{x:0,y:50,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:14},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:12},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:11},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:13},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:20},{x:100,y:250,
id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:18},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:19},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:15},{x:100,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:16},{x:350,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",
kind:0},{x:50,y:50,id:"block"},{x:50,y:150,id:"block"},{x:50,y:200,id:"block"},{x:50,y:300,id:"block"},{x:150,y:300,id:"block"},{x:200,y:300,id:"block"},{x:250,y:300,id:"block"},{x:300,y:300,id:"block"},{x:400,y:300,id:"block"},{x:400,y:200,id:"block"},{x:400,y:150,id:"block"},{x:400,y:50,id:"block"},{x:300,y:50,id:"block"},{x:250,y:50,id:"block"},{x:200,y:50,id:"block"},{x:150,y:50,id:"block"},{x:50,y:100,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:90},A:{types_1:[1,1,1,1,1],types_11:[0,0,0,0,0],types_16:[0,
0,0,0,0],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level32:{width:500,height:400,items:[{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:6},{x:450,y:0,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:4},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:8},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:6},{x:150,y:50,
id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:7},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:9},{x:300,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:8},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},
{x:300,y:250,id:"tile",kind:1},{x:250,y:0,id:"block"},{x:250,y:100,id:"block"},{x:250,y:250,id:"block"},{x:50,y:150,id:"block"},{x:150,y:150,id:"block"},{x:250,y:150,id:"block"},{x:300,y:150,id:"block"},{x:400,y:150,id:"block"},{x:450,y:150,id:"block"},{x:0,y:0,id:"tile",kind:3},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:5},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:2},{x:50,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:9},{x:350,y:350,id:"tile",
kind:7},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:1},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:0,y:150,id:"block"},{x:250,y:350,id:"block"},{x:0,y:200,id:"block"},{x:50,y:200,id:"block"},{x:150,y:200,id:"block"},{x:200,y:200,id:"block"},{x:300,y:200,id:"block"},{x:400,y:200,id:"block"},{x:450,y:200,id:"block"},{x:250,y:200,id:"block"},{x:200,y:250,id:"block"},{x:200,y:350,id:"block"},{x:200,y:0,id:"block"},{x:200,y:100,id:"block"},{x:200,y:150,id:"block"},{x:200,
y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:3},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:4},{x:250,y:300,id:"tile",kind:2},{x:200,y:300,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:5},{x:100,y:200,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:120},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,
0,0]}},Level33:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:23},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:24},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:20},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},
{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:24},{x:200,y:100,id:"tile",kind:25},{x:250,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:15},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:25},{x:100,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,
y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:15},{x:100,y:150,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:23},{x:300,y:250,id:"tile",kind:20},{x:350,y:300,id:"tile",kind:0},{x:200,y:150,id:"block"},{x:250,y:150,id:"block"},{x:250,y:200,id:"block"},{x:200,y:200,id:"block"}],m:{O:1,
P:15,R:50,time:85},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,0],types_16:[1,1,1,1,0],types_21:[0,1,0,0,1],types_26:[0],types_6:[1,1,1,1,1]}},Level34:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:5},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:9},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:6},{x:450,y:50,id:"tile",kind:0},{x:450,
y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:1},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:8},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:9},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:2},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:7},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",
kind:3},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:2},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",
kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:1},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:7},{x:300,y:100,id:"tile",kind:3},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,
y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:6},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:5},{x:300,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:8},{x:200,y:150,id:"block"},{x:250,y:150,id:"block"},{x:250,y:200,id:"block"},{x:200,y:200,id:"block"},{x:100,y:100,id:"tile",kind:0},{x:200,
y:300,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0}],m:{O:1,P:9,R:30,time:110},A:{types_1:[0,0,0,1,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,1]}},Level35:{width:500,height:400,items:[{x:50,y:50,id:"tile",kind:10},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:2},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:8},{x:350,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",
kind:0},{x:400,y:150,id:"tile",kind:13},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:5},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:8},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:9},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:13},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},
{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:5},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:10},{x:350,y:200,id:"tile",kind:9},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:2},{x:100,y:250,id:"tile",kind:0},{x:100,
y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"block"},{x:150,y:200,id:"block"},{x:300,y:150,id:"block"},{x:300,y:200,id:"block"},{x:400,y:200,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:85},A:{types_1:[1,0,1,1,0],types_11:[1,1,0,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,0,0,0]}},Level36:{width:500,height:400,items:[{x:50,y:100,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,
id:"tile",kind:14},{x:400,y:250,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:17},{x:350,y:150,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:2},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:8},{x:400,y:50,id:"tile",kind:3},{x:350,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},
{x:200,y:100,id:"tile",kind:3},{x:300,y:100,id:"tile",kind:8},{x:300,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:14},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:6},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:23},{x:300,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:6},{x:350,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:2},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,
y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:17},{x:250,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:23},{x:250,y:100,id:"block"},{x:200,y:150,id:"block"},{x:250,y:200,id:"block"},{x:200,y:250,id:"block"}],m:{O:1,P:15,R:50,time:85},A:{types_1:[1,0,0,1,1],types_11:[1,1,1,0,1],types_16:[1,0,1,1,1],types_21:[1,1,0,1,1],types_26:[0],types_6:[0,1,0,1,1]}},Level37:{width:500,height:400,items:[{x:0,
y:0,id:"tile",kind:11},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:23},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:19},{x:450,y:50,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:21},{x:400,y:0,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:15},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:100,
y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:1},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:23},{x:400,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",
kind:2},{x:50,y:150,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:3},{x:0,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:1},{x:400,y:200,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:3},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,
y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:15},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:2},{x:400,y:350,id:"tile",kind:21},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",
kind:0},{x:250,y:350,id:"tile",kind:11},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:19},{x:100,y:150,id:"block"},{x:150,y:150,id:"block"},{x:200,y:150,id:"block"},{x:250,y:200,id:"block"},{x:300,y:200,id:"block"},{x:350,y:200,id:"block"},{x:0,y:100,id:"tile",kind:0}],m:{O:1,P:13,R:45,time:110},A:{types_1:[0,0,0,1,1],types_11:[0,1,1,1,0],types_16:[1,1,1,0,1],types_21:[0,1,0,1,1],types_26:[0],types_6:[1,
1,1,1,1]}},Level38:{width:500,height:400,items:[{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:2},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:9},{x:450,y:50,id:"tile",kind:1},{x:450,y:100,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:3},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:4},{x:300,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:2},{x:0,y:300,id:"tile",kind:0},{x:0,
y:250,id:"tile",kind:9},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:3},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:50,y:0,id:"tile",kind:1},{x:50,y:50,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:10},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:6},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:4},{x:250,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},
{x:400,y:300,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:8},{x:300,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:7},{x:150,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:8},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,
id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:7},{x:350,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:5},{x:150,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:10},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",
kind:0},{x:300,y:150,id:"tile",kind:6},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:0,y:0,id:"block"},{x:0,y:350,id:"block"},{x:450,y:350,id:"block"},{x:450,y:0,id:"block"},{x:450,y:200,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:5},{x:200,y:0,id:"block"},{x:250,y:0,id:"block"},{x:250,y:350,id:"block"},{x:200,y:350,id:"block"},{x:200,y:200,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:110},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,
1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level40:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:19},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:24},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:18},{x:450,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},
{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:21},{x:150,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:17},{x:150,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:20},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",
kind:22},{x:450,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:25},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:22},{x:0,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},
{x:300,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:25},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:19},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:17},{x:250,
y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:18},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:20},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:23},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:24},{x:450,y:350,id:"tile",kind:21},{x:0,y:150,id:"tile",
kind:23}],m:{O:1,P:7,R:25,time:125},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,1],types_16:[1,0,0,0,0],types_21:[0,0,0,0,0],types_26:[0],types_6:[1,1,1,1,1]}},Level41:{width:500,height:400,items:[{x:0,y:350,id:"block"},{x:50,y:350,id:"block"},{x:100,y:350,id:"block"},{x:150,y:350,id:"block"},{x:200,y:350,id:"block"},{x:250,y:350,id:"block"},{x:300,y:350,id:"block"},{x:350,y:350,id:"block"},{x:400,y:350,id:"block"},{x:450,y:350,id:"block"},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,
y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:21},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:19},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:22},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:20},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",
kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:25},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:23},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:25},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",
kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:24},{x:350,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},
{x:200,y:150,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:19},{x:150,y:250,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:21},{x:150,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:24},{x:0,y:0,id:"tile",kind:20},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:23},{x:0,y:200,id:"tile",kind:0},{x:0,y:250,id:"tile",
kind:0},{x:0,y:300,id:"tile",kind:22}],m:{O:1,P:15,R:50,time:95},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level42:{width:500,height:400,items:[{x:50,y:0,id:"tile",kind:5},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:12},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:7},{x:400,y:0,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",
kind:0},{x:450,y:150,id:"tile",kind:6},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:11},{x:400,y:350,id:"tile",kind:6},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:8},{x:150,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:3},{x:100,y:350,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:4},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:8},{x:0,y:100,id:"tile",kind:0},{x:0,
y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:9},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:4},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:5},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",
kind:10},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:9},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:12},{x:50,y:150,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:3},{x:350,y:100,id:"tile",kind:11},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:300,
y:250,id:"tile",kind:7},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:10},{x:100,y:150,id:"tile",kind:0},{x:200,y:100,id:"block"},{x:250,y:100,id:"block"},{x:300,y:150,id:"block"},{x:300,y:200,id:"block"},{x:250,y:250,id:"block"},{x:200,y:250,id:"block"},{x:150,y:200,id:"block"},{x:150,y:150,id:"block"},{x:250,y:150,id:"tile",kind:2},{x:250,y:200,id:"tile",kind:2},{x:200,y:200,id:"tile",kind:1},{x:200,y:150,id:"tile",kind:1},{x:0,y:0,id:"block"},{x:0,y:350,id:"block"},{x:450,y:350,id:"block"},
{x:450,y:0,id:"block"},{x:100,y:200,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:85},A:{types_1:[1,1,0,0,0],types_11:[0,0,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level43:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:4},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:1},{x:250,y:0,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:8},{x:400,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:300,
y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:6},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:1},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:17},{x:450,y:250,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:9},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:15},{x:200,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",
kind:0},{x:0,y:350,id:"tile",kind:17},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:9},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:15},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:5},{x:50,y:100,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:250,id:"tile",
kind:0},{x:50,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:3},{x:200,y:300,id:"tile",kind:8},{x:250,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:2},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:3},{x:200,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:6},{x:300,y:200,id:"tile",kind:0},
{x:350,y:200,id:"tile",kind:2},{x:350,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:100,y:50,id:"block"},{x:150,y:100,id:"block"},{x:150,y:250,id:"block"},{x:100,y:300,id:"block"},{x:350,y:50,id:"block"},{x:300,y:100,id:"block"},{x:300,y:250,id:"block"},{x:350,y:300,id:"block"},{x:350,y:250,id:"tile",kind:5},{x:400,y:300,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:4},
{x:400,y:50,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:125},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,0],types_16:[1,0,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,1,0,0,1]}},Level44:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:11},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:16},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},
{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:12},{x:450,y:50,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:17},{x:300,y:200,id:"tile",
kind:14},{x:350,y:100,id:"tile",kind:15},{x:400,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:12},{x:150,y:150,id:"tile",kind:11},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:17},{x:0,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:16},{x:150,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:18},{x:450,y:250,id:"tile",kind:0},
{x:400,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:13},{x:100,y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:18},{x:350,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,
id:"tile",kind:14},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:15},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:13},{x:200,y:300,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:150,y:100,id:"block"},{x:300,y:100,id:"block"},{x:250,y:150,id:"block"},{x:200,y:150,id:"block"},{x:200,y:200,id:"block"},{x:250,y:200,id:"block"},{x:300,y:250,id:"block"},
{x:150,y:250,id:"block"},{x:250,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:125},A:{types_1:[1,1,1,1,1],types_11:[0,0,0,0,0],types_16:[0,0,0,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level45:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:2},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:7},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},
{x:300,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:16},{x:450,y:0,id:"tile",kind:14},{x:450,y:50,id:"tile",kind:8},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:3},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:16},{x:150,y:350,
id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:15},{x:0,y:300,id:"tile",kind:7},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:8},{x:0,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,
id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",
kind:2},{x:300,y:100,id:"tile",kind:11},{x:350,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:3},{x:50,y:150,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:15},{x:300,y:250,id:"tile",kind:11},{x:250,y:250,id:"tile",kind:14},{x:200,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:5},{x:100,y:250,id:"tile",kind:0},{x:150,y:150,id:"block"},{x:200,y:150,id:"block"},{x:250,y:150,id:"block"},{x:300,y:150,
id:"block"},{x:300,y:200,id:"block"},{x:250,y:200,id:"block"},{x:200,y:200,id:"block"},{x:150,y:200,id:"block"},{x:100,y:100,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:5},{x:350,y:0,id:"tile",kind:0}],m:{O:1,P:12,R:40,time:125},A:{types_1:[1,0,0,1,0],types_11:[0,1,1,0,0],types_16:[0,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,0,0,1,1]}},Level47:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:9},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:13},{x:150,y:0,id:"tile",kind:0},
{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:10},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:8},{x:450,y:0,id:"tile",kind:21},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:5},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:10},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",
kind:0},{x:200,y:350,id:"tile",kind:3},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:12},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:5},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",
kind:2},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:13},{x:50,y:300,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},
{x:100,y:150,id:"tile",kind:12},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:8},{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:3},{x:150,y:200,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:21},{x:400,y:300,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:9},{x:400,y:100,id:"tile",kind:0},{x:100,
y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:200,y:50,id:"block"},{x:200,y:100,id:"block"},{x:200,y:250,id:"block"},{x:200,y:300,id:"block"},{x:150,y:150,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:2}],m:{O:1,P:15,R:50,time:120},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[1,1,1,1,1]}},Level48:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:4},{x:50,y:0,id:"tile",
kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:5},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:0},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:1},{x:450,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:7},{x:100,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},
{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:3},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,
id:"tile",kind:5},{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:2},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:150,y:350,id:"tile",kind:6},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:3},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:7},{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:6},
{x:350,y:200,id:"tile",kind:0},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:1},{x:250,y:300,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:300,
y:200,id:"tile",kind:0},{x:150,y:100,id:"block"},{x:300,y:100,id:"block"},{x:300,y:250,id:"block"},{x:150,y:250,id:"block"},{x:250,y:200,id:"block"},{x:200,y:150,id:"block"},{x:250,y:150,id:"tile",kind:4},{x:200,y:200,id:"tile",kind:2},{x:200,y:350,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:135},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level49:{width:500,height:400,
items:[{x:0,y:0,id:"tile",kind:1},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:7},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:8},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:2},{x:450,y:50,id:"tile",kind:6},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},
{x:100,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:250,y:100,id:"tile",kind:2},{x:350,y:100,id:"tile",kind:1},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:6},{x:50,y:150,id:"tile",kind:0},{x:150,y:150,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:5},{x:350,y:200,id:"tile",kind:9},{x:350,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",
kind:0},{x:400,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:8},{x:100,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:4},{x:250,y:250,id:"tile",kind:0},{x:350,y:250,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:7},{x:450,y:300,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,
y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:3},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:3},{x:50,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:5},{x:150,y:350,id:"tile",kind:9},{x:200,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",
kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:4},{x:200,y:200,id:"block"},{x:250,y:150,id:"block"},{x:150,y:250,id:"block"},{x:300,y:100,id:"block"},{x:150,y:100,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0}],m:{O:1,P:15,R:50,time:130},A:{types_1:[0,0,0,0,0],types_11:[1,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],
types_6:[0,0,0,0,1]}},Level50:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:16},{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:23},{x:200,y:0,id:"tile",kind:0},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:26},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:19},{x:450,y:50,id:"tile",kind:21},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},
{x:450,y:300,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:20},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:24},{x:300,y:350,id:"tile",kind:0},{x:200,y:250,id:"tile",kind:16},{x:200,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:21},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:25},{x:50,y:350,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:18},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:0},{x:0,y:200,
id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:100,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:200,y:50,id:"tile",kind:25},{x:250,y:50,id:"tile",kind:0},{x:300,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:26},{x:400,y:200,id:"tile",kind:0},{x:400,y:250,id:"tile",kind:23},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},
{x:350,y:250,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:18},{x:300,y:100,id:"tile",kind:0},{x:300,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:17},{x:300,y:250,id:"tile",kind:0},{x:250,y:250,id:"tile",kind:0},{x:250,y:200,id:"tile",kind:26},{x:250,y:150,id:"tile",kind:22},{x:250,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:26},{x:50,y:50,id:"tile",kind:24},{x:150,
y:250,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:20},{x:150,y:150,id:"tile",kind:0},{x:150,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:19},{x:50,y:100,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:22},{x:50,y:250,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:17},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0}],m:{O:1,P:15,
R:50,time:140},A:{types_1:[1,1,1,1,1],types_11:[1,1,1,1,1],types_16:[0,0,0,0,0],types_21:[0,0,0,0,0],types_26:[0],types_6:[1,1,1,1,1]}},Level51:{width:500,height:400,items:[{x:50,y:0,id:"tile",kind:0},{x:100,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:3},{x:200,y:0,id:"tile",kind:11},{x:250,y:0,id:"tile",kind:0},{x:300,y:0,id:"tile",kind:4},{x:350,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:50,id:"tile",kind:26},{x:400,y:50,id:"tile",kind:0},{x:350,y:50,id:"tile",kind:2},{x:300,
y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:9},{x:200,y:50,id:"tile",kind:0},{x:150,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:6},{x:50,y:50,id:"tile",kind:9},{x:100,y:50,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:200,y:100,id:"tile",kind:4},{x:250,y:100,id:"tile",kind:0},{x:300,y:100,id:"tile",kind:8},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:0},{x:450,y:150,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:26},
{x:250,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:0},{x:150,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:5},{x:50,y:200,id:"tile",kind:0},{x:0,y:200,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:10},{x:150,y:150,id:"tile",kind:1},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:3},{x:300,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:11},{x:400,y:200,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:8},{x:450,y:250,
id:"tile",kind:0},{x:400,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:0},{x:350,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:0},{x:250,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:100,y:300,id:"tile",kind:7},{x:50,y:300,id:"tile",kind:0},{x:0,y:300,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:5},{x:50,y:250,id:"tile",kind:0},{x:100,y:250,id:"tile",kind:0},{x:150,y:250,id:"tile",kind:10},{x:200,y:250,id:"tile",kind:2},{x:250,y:250,id:"tile",kind:0},{x:200,y:300,id:"tile",
kind:0},{x:450,y:300,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:350,y:350,id:"tile",kind:0},{x:300,y:350,id:"tile",kind:1},{x:250,y:350,id:"tile",kind:0},{x:200,y:350,id:"tile",kind:7},{x:150,y:350,id:"tile",kind:0},{x:100,y:350,id:"tile",kind:0},{x:50,y:350,id:"tile",kind:6},{x:0,y:0,id:"block"},{x:0,y:350,id:"block"},{x:450,y:350,id:"block"},{x:450,y:0,id:"block"},{x:350,y:200,id:"block"},{x:350,y:250,id:"block"},{x:300,y:250,id:"block"},{x:100,y:150,id:"block"},{x:100,y:100,id:"block"},
{x:150,y:100,id:"block"}],m:{O:1,P:15,R:50,time:140},A:{types_1:[0,0,0,0,0],types_11:[0,1,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Level52:{width:500,height:400,items:[{x:0,y:0,id:"tile",kind:2},{x:50,y:0,id:"tile",kind:0},{x:150,y:0,id:"tile",kind:0},{x:200,y:0,id:"tile",kind:9},{x:250,y:0,id:"tile",kind:0},{x:400,y:0,id:"tile",kind:0},{x:450,y:0,id:"tile",kind:1},{x:300,y:0,id:"tile",kind:8},{x:450,y:50,id:"tile",kind:0},{x:400,y:50,id:"tile",kind:0},{x:300,
y:50,id:"tile",kind:0},{x:250,y:50,id:"tile",kind:9},{x:200,y:50,id:"tile",kind:26},{x:150,y:50,id:"tile",kind:0},{x:50,y:50,id:"tile",kind:0},{x:0,y:50,id:"tile",kind:0},{x:0,y:100,id:"tile",kind:0},{x:50,y:100,id:"tile",kind:0},{x:100,y:100,id:"tile",kind:5},{x:150,y:100,id:"tile",kind:8},{x:300,y:100,id:"tile",kind:0},{x:350,y:100,id:"tile",kind:0},{x:400,y:100,id:"tile",kind:0},{x:450,y:100,id:"tile",kind:10},{x:450,y:150,id:"tile",kind:0},{x:400,y:150,id:"tile",kind:0},{x:350,y:150,id:"tile",
kind:0},{x:300,y:150,id:"tile",kind:1},{x:150,y:150,id:"tile",kind:0},{x:100,y:150,id:"tile",kind:0},{x:50,y:150,id:"tile",kind:0},{x:0,y:150,id:"tile",kind:6},{x:0,y:200,id:"tile",kind:0},{x:50,y:200,id:"tile",kind:0},{x:100,y:200,id:"tile",kind:7},{x:150,y:200,id:"tile",kind:0},{x:200,y:200,id:"tile",kind:2},{x:250,y:200,id:"tile",kind:0},{x:300,y:200,id:"tile",kind:0},{x:350,y:200,id:"tile",kind:3},{x:400,y:200,id:"tile",kind:0},{x:450,y:200,id:"tile",kind:4},{x:400,y:250,id:"tile",kind:10},{x:350,
y:250,id:"tile",kind:0},{x:300,y:250,id:"tile",kind:4},{x:150,y:250,id:"tile",kind:11},{x:100,y:250,id:"tile",kind:0},{x:50,y:250,id:"tile",kind:0},{x:0,y:250,id:"tile",kind:7},{x:0,y:300,id:"tile",kind:0},{x:0,y:350,id:"tile",kind:5},{x:50,y:350,id:"tile",kind:0},{x:250,y:350,id:"tile",kind:0},{x:400,y:350,id:"tile",kind:0},{x:450,y:350,id:"tile",kind:3},{x:450,y:300,id:"tile",kind:0},{x:450,y:250,id:"tile",kind:0},{x:400,y:300,id:"tile",kind:12},{x:300,y:350,id:"tile",kind:12},{x:200,y:350,id:"tile",
kind:11},{x:150,y:350,id:"tile",kind:0},{x:50,y:300,id:"tile",kind:0},{x:150,y:300,id:"tile",kind:0},{x:200,y:300,id:"tile",kind:0},{x:300,y:300,id:"tile",kind:26},{x:250,y:300,id:"tile",kind:0},{x:200,y:150,id:"tile",kind:0},{x:250,y:150,id:"tile",kind:6},{x:200,y:100,id:"block"},{x:250,y:100,id:"block"},{x:200,y:250,id:"block"},{x:250,y:250,id:"block"},{x:350,y:300,id:"block"},{x:350,y:350,id:"block"},{x:100,y:300,id:"block"},{x:100,y:350,id:"block"},{x:100,y:50,id:"block"},{x:100,y:0,id:"block"},
{x:350,y:0,id:"block"},{x:350,y:50,id:"block"}],m:{O:1,P:15,R:50,time:120},A:{types_1:[0,0,0,0,0],types_11:[0,0,1,1,1],types_16:[1,1,1,1,1],types_21:[1,1,1,1,1],types_26:[0],types_6:[0,0,0,0,0]}},Vr:"Level1 Level2 Level3 Level4 Level5 Level6 Level7 Level8 Level9 Level10 Level11 Level12 Level13 Level14 Level15 Level16 Level17 Level18 Level19 Level20 Level21 Level22 Level23 Level25 Level26 Level28 Level30 Level31 Level32 Level33 Level34 Level35 Level36 Level37 Level38 Level40 Level41 Level42 Level43 Level44 Level45 Level47 Level48 Level49 Level50 Level51 Level52".split(" ")},
cv:[]}}var kf=null;
function lf(){kf={buttons:{bigPlay:"orange",default_color:"orange"},n:{gz:"MysticalBirdLink"},oa:{ii:{U:V.U,align:"center",h:"top",fontSize:K(34),fillColor:"#bb3128",stroke:!1},Sm:{U:V.U,align:"center",h:"top",fontSize:K(28),fillColor:"#b7513b",stroke:!1},gk:K(134),Bg:K(166),Vf:{U:V.U,align:"center",h:"top",fontSize:K(42),fillColor:"#bb3128",stroke:!1},Xi:{U:V.U,align:"center",h:"top",fontSize:K(28),fillColor:"#bb3128",stroke:!1},Xe:K(296),Ps:{U:V.U,align:"center",h:"middle",fontSize:K(62),fillColor:"#bb3128",
stroke:!1},Ss:K(240),Rs:K(640),cd:{U:V.U,align:"center",h:"middle",fontSize:K(36),fillColor:"#bb3128",stroke:!1},qc:K(36),Ki:K(325)},Hf:{Ds:{U:V.U,align:"center",fontSize:K(35),fillColor:"#bb3128",stroke:!0,nc:K(6),strokeColor:"#ffd6b6",sd:!0,me:"bevel"},cd:{U:V.U,h:"bottom",align:"center",fontSize:K(60),fillColor:"#bb3128",stroke:!0,nc:K(6),strokeColor:"#ffd6b6",sd:!0,me:"bevel"},qc:{align:"top",offset:K(20,"round")},Es:{align:"center",offset:0}},Lk:{Ip:{U:V.U,align:"center",h:"middle",fontSize:K(48),
fillColor:"#bb3228",stroke:!1},Uh:K(460),tm:K(200),Kp:K(250),Jp:K(310),Sq:{U:V.U,align:"center",h:"middle",fontSize:K(60),fillColor:"#bb3228",stroke:!1},wi:K(460),Vq:K(140),Uq:K(310),ko:K(330)},Zb:{Wh:500},options:{vg:K(700),vf:K(16),Uj:K(480),Vj:K(380),Xj:K(220),nl:{U:V.U,align:"center",h:"middle",fontSize:K(40),fillColor:"#b7513b",stroke:!1},cd:{U:V.U,align:"center",h:"top",fontSize:K(36),fillColor:"#bb3128",stroke:!1},qc:K(24),Pl:K(484,"round"),Ql:K(484,"round"),Rl:{align:"center",h:"middle",fontSize:L({big:28,
small:14}),fillColor:"#7C000C",stroke:!1},Sl:K(128,"round"),Zo:K(140),Tl:K(400,"round"),Ul:{align:"center",h:"top",fontSize:K(32),fillColor:"#7C000C",stroke:!1},ij:K(460)},zl:{qi:{align:"center",offset:0},Fg:{align:"top",offset:K(20)},Hg:{align:"center",offset:0},cs:{align:"center",offset:0},Pi:K(470)},pk:{font:{U:V.U,align:"center",h:"tops",fontSize:K(56),fillColor:"#b6503a",stroke:!0,nc:K(6),sd:!0,strokeColor:"#ffbf54"},To:K(36),bj:K(640),at:K(120),Cm:K(520)}}}J.j=J.j||{};
J.j.Hu=function(){var a=J.Cx;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};J.j.yk=function(){J.e.Lc()};J.j.uz=function(){};J.j.Ok=function(){};J.j.zk=function(){J.e.Lc()};J.j.qz=function(){};J.j.pz=function(){};J.j.tz=function(){};J.j.fr=function(){};J.j.Su=function(){};J.j.er=function(){};J.j.rz=function(){};J.j.Ju=function(){J.e.Lc()};J.j.Ku=function(){J.e.Lc()};J.j.Og=function(){J.e.Lc()};J.j.Iu=function(){J.e.Lc()};
J.j.Lq=function(a,b){void 0===J.e.he&&(J.e.he=new mf(!0));return nf(a,b)};J.j.bp=function(a){void 0===J.e.he&&(J.e.he=new mf(!0));return of(a)};J.j.nd=function(a){window.open(a)};J.j.si=function(){return[{f:pd,url:J.w.br}]};J.j.Tu=function(){};J.xd=J.xd||{};J.xd.yk=function(){J.e.mj=!1};J.xd.Ok=function(){};J.xd.zk=function(){J.e.mj=!1};J.xd.Og=function(){J.e.mj=!1};function pf(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}
function qf(a,b,c,d){this.Ll=this.Cg=a;this.gu=b;this.duration=1;this.dq=d;this.Ge=c;this.Rj=null;this.ih=0}qf.prototype.mf=function(a){this.ih+=a;this.ih>this.duration&&this.Rj&&(this.Rj(),this.Rj=null)};qf.prototype.za=function(){if(this.ih>=this.duration)return this.Ge(this.duration,this.Cg,this.Ll-this.Cg,this.duration);var a=this.Ge(this.ih,this.Cg,this.Ll-this.Cg,this.duration);this.dq&&(a=this.dq(a));return a};function rf(a,b){a.Cg=a.za();a.Ll=b;a.duration=a.gu;a.Rj=void 0;a.ih=0}
J.qu=void 0!==J.environment?J.environment:"development";J.oy=void 0!==J.ga?J.ga:J.qu;"undefined"!==typeof J.mediaUrl?la(J.mediaUrl):la(J.size);J.Ut="backButton";J.Gf="languageSet";J.Re="resizeEvent";J.version={builder:"1.8.3.0","build-time":"12:32:43","build-date":"02-05-2020",audio:E.jb?"web audio api":E.Xa?"html5 audio":"no audio"};
J.zy=new function(){this.Je=this.tv=3;m.q.bh&&(this.Je=3>m.Sa.te?1:4.4>m.Sa.te?2:3);m.Sa.Ik&&(this.Je=7>m.Sa.te?2:3);m.Sa.ip&&(this.Je=8>m.Sa.te?2:3);J.version.browser_name=m.name;J.version.browser_version=m.q.version;J.version.os_version=m.Sa.version;J.version.browser_grade=this.Je};J.a={};"function"===typeof ef&&ef();"function"===typeof jf&&jf();"function"===typeof lf&&lf();"function"===typeof initGameThemeSettings&&initGameThemeSettings();J.a.u="undefined"!==typeof df?df:{};
J.a.n="undefined"!==typeof hf?hf:{};J.a.W="undefined"!==typeof kf?kf:{};J.a.hz="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};J.Ug=window.publisherSettings;J.w="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof ff&&(J.w=ff);if("undefined"!==typeof gf)for(var sf in gf)J.w[sf]=gf[sf];
(function(){var a,b,c,d,g;J.i={};J.i.wp="undefined"!==typeof M?M:{};J.i.pb=void 0!==J.w.fe&&void 0!==J.w.fe.Fj?J.w.fe.Fj:J.a.u.fe.Fj;g=[];for(b=0;b<J.i.pb.length;b++)g.push(J.i.pb[b]);if(J.w.Ws)for(b=J.i.pb.length-1;0<=b;b--)0>J.w.Ws.indexOf(J.i.pb[b])&&J.i.pb.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=J.i.pb.length-1;0<=
b;b--)0>c.indexOf(J.i.pb[b])&&J.i.pb.splice(b,1)}catch(h){}0===J.i.pb.length&&(0<g.length?J.i.pb=g:J.i.pb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<J.i.pb.length;d++)if(0<=J.i.pb[d].search(g)){a=J.i.pb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==J.w.fe&&void 0!==J.w.fe.Fk?J.w.fe.Fk:J.a.u.fe.Fk);J.i.gm=0<=J.i.pb.indexOf(a)?a:J.i.pb[0];J.i.uj=J.i.wp[J.i.gm];
if(void 0!==J.a.u.Ub.language_toggle&&void 0!==J.a.u.Ub.language_toggle.Z){a=J.a.u.Ub.language_toggle.Z;c=[];for(b=0;b<a.length;b++)0<=J.i.pb.indexOf(a[b].id)&&c.push(a[b]);J.a.u.Ub.language_toggle.Z=c}J.i.K=function(a,b){var c,d,g,h;if(void 0!==J.i.uj&&void 0!==J.i.uj[a]){c=J.i.uj[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=m.yf.Ys||m.yf.Pr)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};J.i.qs=function(a){J.i.gm=
a;J.i.uj=J.i.wp[a];pa(J.Gf,a)};J.i.pn=function(){return J.i.gm};J.i.Bu=function(){return J.i.pb};J.i.Wu=function(a){return 0<=J.i.pb.indexOf(a)}})();J.lu={Sa:"",dw:"",aA:"",Lm:""};J.c={};
J.c.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};J.c.Kl=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
J.c.Ci=function(a){function b(){}b.prototype=tf.prototype;a.prototype=new b};J.c.ox=function(a,b,c,d,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));J.Xd.push(l);return l};
(function(){var a,b,c,d,g,h,k;J.lr=0;J.mr=0;J.tl=!1;J.fy=m.q.bh&&m.q.te&&4<=m.q.te;J.oj=!1;J.ut=m.yf.Ys||m.yf.Pr;J.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===J.orientation?J.a.u.Gm:J.a.u.Xd;h="landscape"===J.orientation?J.a.n.Gm:J.a.n.Xd;if(void 0!==h){if(void 0!==h.fd)for(a in h.fd)k.fd[a]=h.fd[a];if(void 0!==h.Jc)for(a in h.Jc)k.Jc[a]=h.Jc[a]}b=function(){var a,b,c,d;if(J.fy&&!J.oj){J.oj=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){J.oj=!1;return}b=document.createEvent("Event");b.fA=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);J.oj=!1},100)}};c=function(){var a,c,d,g,h,B,r,t,v;"landscape"===J.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.yg,k.Mc],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.Mc,k.Wb],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];B=d/c[1];h<g?(h=h<B?Math.floor(a[0]/B):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));r=h/c[1];!J.ut&&1<r&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),r=1);a="landscape"===J.orientation?g:h;c="landscape"===J.orientation?h:g;v=t=0;window.innerHeight<Math.floor(k.Mc*r)&&(t=Math.max(k.Uk,window.innerHeight-Math.floor(k.Mc*r)));window.innerWidth<Math.floor(k.Wb*r)&&(v=Math.floor(Math.max(k.yg-k.Wb,(window.innerWidth-Math.floor(k.Wb*r))/r)),window.innerWidth<Math.floor(k.Wb*r)+v*r&&(v+=Math.floor(Math.max((d-k.yg)/2,(window.innerWidth-(k.Wb*r+v*r))/2/r))));J.Rp=k.Mc-k.jq;J.Yt=k.Wb-k.yg;J.ma=t;J.Ey=v;J.Dy=Math.min(J.Yt,-1*J.Fy);J.Ie=(k.Jc.top||
k.xf)-J.ma;J.da={top:-1*t,left:-1*v,height:Math.min(k.Mc,Math.round(Math.min(c,window.innerHeight)/r)),width:Math.min(k.Wb,Math.round(Math.min(a,window.innerWidth)/r))};J.zA="landscape"===J.orientation?{top:0,left:Math.floor((k.yg-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.Uk),left:k.wf,width:k.Wb,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===J.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,l,n;g=void 0!==b.top?b.top:k.xf;h=void 0!==b.left?b.left:k.wf;l=void 0!==b.width?b.width:k.Wb;n=void 0!==b.height?b.height:k.Mc;a.Ty=Math.floor(r*g);a.Sy=Math.floor(r*h);a.Uy=Math.floor(r*l);a.Ry=Math.floor(r*
n);!1!==c&&(g+=t);!1!==d&&(h+=v);a.setAttribute("style","position:absolute; left:"+Math.floor(r*h)+"px; top:"+Math.floor(r*g)+"px; width:"+Math.floor(r*l)+"px; height:"+Math.floor(r*n)+"px; z-index: "+b.depth)};d(J.wm,k.Fm);d(J.bn,k.fd);d(J.mn,k.Jc,!1,!0);d(J.ge,k.sf);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);pa(J.Re)};a=function(){if(J.lr===window.innerHeight&&J.mr===window.innerWidth||J.tl)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;J.tl=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,m.q.bh?1:0);g--;if((m.q.bh?0:window.innerHeight>d)||0>g)J.mr=window.innerWidth,J.lr=window.innerHeight,clearInterval(J.tl),J.tl=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};J.Ig=k.fd.left||k.wf;J.Jg=k.fd.top||k.xf;J.Kg=k.fd.width||k.Wb;J.pi=k.fd.height||k.Mc;J.Cf=k.Jc.left||k.wf;J.Ie=k.Jc.top||k.xf;J.jz=k.Jc.width||k.Wb;
J.iz=k.Jc.height||k.Mc;J.nv=k.sf.left||k.wf;J.ov=k.sf.top||k.xf;J.pv=k.sf.width||k.Wb;J.mv=k.sf.height||k.Mc;h=function(a){return J.c.ox(a.id,a.depth,void 0!==a.top?a.top:k.xf,void 0!==a.left?a.left:k.wf,void 0!==a.width?a.width:k.Wb,void 0!==a.height?a.height:k.Mc)};J.Xd=[];J.wm=h(k.Fm);J.bn=h(k.fd);J.mn=h(k.Jc);J.ge=h(k.sf);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);J.zc={};J.zc[J.Dg]=J.wm;J.zc[J.Hq]=J.bn;J.zc[J.uk]=J.mn;J.zc[J.Eg]=J.ge;J.zc[J.Bf]=J.wm;J.zc[J.jc]=J.ge;J.zc[J.de]=J.ge})();
J.c.Rt=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ma.xe+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),J.$t=!0,J.Xh=!0,b=function(a){J.$t&&J.Xh&&(J.j.nd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){J.Xh&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){J.Xh&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};J.c.SA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";J.Xh=!0}};
J.c.oz=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";J.Xh=!1}};J.c.on=function(a){return a===J.bn?{x:J.Ig,y:J.Jg}:a===J.mn?{x:J.Cf,y:J.Ie}:{x:J.nv,y:J.ov}};J.c.Df=function(a){return J.zc[a]};J.c.Kb=function(a){return J.zc[a]?(p.canvas!==J.zc[a]&&p.Kb(J.zc[a]),!0):!1};J.c.vb=function(a,b){if(J.zc[b]){var c=G;a.Ha!==b&&(c.Gh=!0);a.Ha=b;a.canvas=J.zc[b]}};
J.c.g=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
J.c.xa=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};J.c.Ly=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};J.ha=J.ha||{};J.ha.rx=!1;J.ha.gr=function(a){a instanceof Array&&(this.qk=a[0],this.ul=a[1],this.au="https://api.gameanalytics.com/v2/"+this.qk,this.hr=!0)};
J.ha.ff=function(a,b){var c,d=JSON.stringify(b),g=window.Crypto.HmacSHA256(d,this.ul),g=window.Crypto.enc.Base64.stringify(g),h=this.au+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.rx&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
J.ha.rc={qp:"user",pp:"session_end",Dt:"business",Ft:"resource",pj:"progression",Zl:"design",ERROR:"error"};J.ha.bf=function(){return{user_id:this.fp,session_id:this.mx,build:this.cu,device:this.Lm,platform:this.platform,os_version:this.ew,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
J.ha.Gb=function(a,b,c,d,g,h,k){this.mx=a;h&&"object"===typeof h&&(this.fp=h.fp);this.cu=g;this.k=!0;this.hr&&(this.Lm=k.Lm,this.platform=k.Sa,this.ew=k.dw);this.ff("init",this.bf())};J.ha.Hx=function(a){var b=this.bf(),c=[];b.category=a;c.push(b);this.ff("events",c)};J.ha.Um=function(a,b,c,d){a=[];b=this.bf();b.length=Math.floor(c);b.category=d;a.push(b);this.ff("events",a)};
J.ha.ab=function(a,b,c,d){var g=[],h=!1;if(this.k&&this.hr){if(d)switch(d){case J.ha.rc.qp:this.Hx(d);h=!0;break;case J.ha.rc.pp:this.Um(0,0,c,d);h=!0;break;case J.ha.rc.Dt:h=!0;break;case J.ha.rc.Ft:h=!0;break;case J.ha.rc.pj:this.tu(a,b,c,d);h=!0;break;case J.ha.rc.Zl:this.ru(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.bf(),b.event_id=d+":"+a,b.value=c,g.push(b),this.ff("design",g))}};J.ha.yA=function(a,b,c){this.ab(a,b,c)};J.ha.dz=function(){};
J.ha.ez=function(){};J.ha.tu=function(a,b,c,d){var g=[],h=this.bf();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}g.push(h);this.ff("events",g)};J.ha.ru=function(a,b,c,d){var g=[],h=this.bf();h.category=d;h.event_id=a+b;h.value=c;g.push(h);this.ff("events",g)};J.ha.ls=function(a,b){var c=[],d=this.bf();d.category="error";d.message=a;d.severity=b;c.push(d);this.ff("events",c)};
function uf(){this.Ha=this.depth=0;this.visible=!1;this.k=!0;this.a=J.a.u.Ja;this.uw=this.a.Yx;Pb(this);Rb(this,"system")}function vf(){var a=wf("userId","");""===a&&(a=xf(),yf("userId",a));return a}function xf(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=uf.prototype;e.start=function(a){J.ha.gr(a);J.ha.Gb(xf(),J.a.n.He.dn,J.a.W.id,J.w.ww,zf(),{fp:vf()},J.lu)};e.ab=function(a,b,c,d){J.ha.ab(a,b,c,d)};
function Af(a,b,c,d){var g,h;for(g=0;g<a.fa.length;g++)void 0!==a.fa[g]&&a.fa[g].tag===b&&(h=a.fa[g],a.ab(c,d,h.p/1E3,J.ha.rc.pp),h.k=!1)}function Bf(){var a=J.Ja,b=J.e.bg,c;for(c=0;c<a.fa.length;c++)void 0!==a.fa[c]&&a.fa[c].tag===b&&(a.fa[c].paused+=1)}e.ls=function(a,b){J.ha.ls(a,b)};e.xc=function(){this.fa=[]};
e.Da=function(a){var b,c=0;for(b=0;b<this.fa.length;b++)this.fa[b].k&&(0===this.fa[b].paused&&(this.fa[b].p+=a),c=b);c<this.fa.length-1&&(a=this.fa.length-Math.max(this.uw,c+1),0<a&&this.fa.splice(this.fa.length-a,a))};
function mf(a,b,c){this.Fr=a||!1;this.host=b||"http://localhost:8080";this.lx=c||this.host+"/services/storage/gamestate";this.Us="undefined"!==typeof window.localStorage;this.En=this.dp=!1;var d=this;window.parent!==window&&(m.q.xo||m.Sa.Ik)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.dp="ok"===a.result:"getItem"===b&&d.vk&&("ok"===a.result?d.vk(a.value):d.vk(a.defaultValue))},!1),this.vk=null,window.parent.postMessage({command:"init"},"*"));this.Li=[];window.setTimeout(function(){d.En=
!0;for(var a=0;a<d.Li.length;++a)d.Li[a]();d.Li=[]},2E3)}function Cf(){return"string"===typeof J.w.Ns&&""!==J.w.Ns?J.w.Ns:void 0!==J.a.n.He&&void 0!==J.a.n.He.dn?J.a.n.He.dn:"0"}function nf(a,b){var c=J.e.he;"function"===typeof b&&(c.En?Df(c,a,b):c.Li.push(function(){Df(c,a,b)}))}function of(a){var b=J.e.he;b.En?Ef(b,a):b.Li.push(function(){Ef(b,a)})}
function Ef(a,b){var c=null,d=Cf();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.dp)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.Us)try{window.localStorage.setItem(d,c)}catch(h){}a.Fr||(c=new rb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),sb(c,a.lx+"/my_ip/"+d))}}
function Df(a,b,c){var d=null,g=null,h=Cf();if(a.dp)a.vk=function(a){var g;try{d=JSON.parse(a),g=JSON.parse(d.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.Us)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.Fr||(a=new rb("gameState_"+h),g=null,tb(a,mf.vA+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(g&&Date.parse(g.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(d.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(l){c(b);return}c(b)}}
function Ff(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.Sc=this.visible=!1!==c;this.k=!0;J.c.vb(this,J.jc);var d;this.a=J.a.u.md;if("landscape"===J.orientation&&J.a.u.Nn)for(d in J.a.u.Nn)this.a[d]=J.a.u.Nn[d];for(d in J.a.W.md)this.a[d]=J.a.W.md[d];if(J.w.md)for(d in J.w.md)this.a[d]=J.w.md[d];this.Vb=a;this.bq=b;this.nq=!1;this.Vh=0;this.xm=!1;this.Hj=0;this.Wh=
this.a.Xt;this.to=!0;this.iv=.6/Math.log(this.a.Qk+1);this.At=void 0!==J.w.hv?J.w.hv:this.a.Nv;this.uv=this.At+this.a.xv;Pb(this)}e=Ff.prototype;e.Co=function(a){var b;J.c.Kb(J.Bf);ta(0,0,this.canvas.width,this.canvas.height,"white",!1);b=S.T();(J.w.md&&J.w.md.aj||this.a.aj)&&C(b,J.w.md&&J.w.md.aj?J.w.md.aj:this.a.aj);a=J.i.K(a,"<"+a.toUpperCase()+">");b.r(a,this.canvas.width/2,this.canvas.height/2,this.a.bj);this.error=!0;this.visible=this.Sc=!1;this.canvas.ia=!0};
e.ie=function(){this.sa&&(this.Hb=J.c.g(this.a.Hb,J.da.width,this.sa.width)+J.da.left,this.Bc=J.c.g(this.a.Bc,J.da.height,this.sa.height)+J.da.top)};
e.Jm=function(){var a,b,c,d,g,h;if("function"===typeof J.j.si&&(h=this.a.Mf,(this.Ia=J.j.si())&&0<this.Ia.length)){this.sa?this.sa.clear():this.sa=new x(this.a.Mf,this.a.Ii);y(this.sa);h/=this.Ia.length;for(c=0;c<this.Ia.length;c++)try{g=this.Ia[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Ii/g.height)),a="center"===this.a.Gi?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.sa.height-g.height*d,g instanceof u?g.ya(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}A(this.sa);this.Pk=0;this.Pn=!0;this.Hi=0;this.Lf=Yb(0,0,this.sa.width,this.sa.height);this.ie()}};
e.Na=function(){var a,b,c,d;this.to?p.clear():J.c.Kb(J.Bf);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(J.ma),1<d.G){c=(p.canvas.height-a)/d.wg;b=-(d.ai*c-p.canvas.width)/2;c=p.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.Vh;for(h=0;h<d.G;h+=1)k=b+h%d.Tg*d.width,l=a+d.height*Math.floor(h/d.Tg),d.qe.va(d.ne[h],d.oe[h],d.pe[h],d.Md[h],d.Ld[h],k-d.wb+d.Nd[h],l-d.xb+d.Od[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof u?d.ya(0,b,a,c,c,0,this.Vh):d instanceof x&&d.ya(b,a,c,c,0,this.Vh);d=this.a.Me+this.a.Ln+this.a.Pg;b=Dc.height;a=Dc.width-(this.a.Me+this.a.Ln);this.Qg=J.c.g(this.a.Qg,p.canvas.width,d);this.Kf=J.c.g(this.a.Kf,p.canvas.height,b);Dc.va(0,0,0,this.a.Me,b,this.Qg,this.Kf,1);Dc.dk(0,this.a.Me,0,a,b,this.Qg+this.a.Me,this.Kf,this.a.Pg,b,1);Dc.va(0,this.a.Me+a,0,this.a.Ln,b,this.Qg+this.a.Me+this.a.Pg,this.Kf,1)};
function Gf(a){a.to&&(a.xm=!0);a.visible&&(a.Na(),a.Jm(),"function"===typeof J.j.rn&&(a.ke=J.j.rn(),a.ke instanceof x&&(a.Yg=!0,a.xs=Math.floor((a.canvas.width-a.ke.width)/2),a.ys=Math.floor((a.canvas.height-a.ke.height)/2))));J.e.Nk&&ma.Jd("audio");J.e.Mk&&ma.Jd("audio_music");ma.Jd("fonts")}
e.xc=function(){var a,b=!1;if(void 0!==J.w.Vi)if(!1===J.w.Vi.jv)b=!0;else{if(void 0!==J.w.Vi.Om)for(a=0;a<J.w.Vi.Om.length;a++){var c;a:{c=J.w.Vi.Om[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===Hf("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,Hf(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof J.w.Xx&&(new Date).getTime()>J.w.Xx&&(b=!1);b?(this.rg=[],this.error=!1,this.dt=this.Zm=this.Ej=this.p=0,this.ready=this.Yg=!1,this.fv=void 0!==this.a.Dr?this.a.Dr:this.a.Me-this.a.Fi,this.gv=void 0!==this.a.Er?this.a.Er:Math.floor((Dc.height-ve.height)/2),this.Mn=ve.width-(this.a.Fi+this.a.Cr),this.Ym=this.Rr=this.Lp=!1,(this.Wi=ma.complete("start"))&&Gf(this),this.Br=ma.complete("load"),this.visible&&(this.et=document.getElementById("throbber_image"),
this.re=this.a.re,this.Uo=J.c.g(this.a.Uo,this.canvas.width,this.re),this.Gl=J.c.g(this.a.Gl,this.canvas.height,this.re))):G.pause()};
e.Da=function(a){this.p+=a;"function"===typeof J.j.rn&&void 0===this.ke&&(this.ke=J.j.rn(),this.ke instanceof x&&(this.Yg=!0,this.xs=Math.floor((this.canvas.width-this.ke.width)/2),this.ys=Math.floor((this.canvas.height-this.ke.height)/2)));this.Yg&&0<=this.a.zs&&this.p>=this.a.zs&&(this.Yg=!1);this.xm&&(this.Hj+=a,this.Hj>=this.Wh?(this.xm=!1,this.Vh=1):this.Vh=lc(this.Hj,0,1,this.Wh));this.Wi&&(this.Ej+=a,this.Zm+=a);this.dt=Math.round(this.p/this.a.Tx%(this.a.Ux-1));this.Pn&&(this.Pk=0+this.Hi/
this.a.On*1,this.Hi+=a,this.Hi>=this.a.On&&(this.Pn=!1,this.Pk=1));"function"===typeof this.bq&&this.bq(Math.round((na("load")+na("audio")+na("audio_music"))/2));!this.ready&&this.Br&&(this.Ym||this.Zm>=this.a.Qk)&&(!J.e.Nk||this.Lp||E.Xa&&this.Ej>=this.a.Qk)&&(!J.e.Mk||this.Rr||E.Xa&&this.Ej>=this.a.Qk)&&(this.ready=!0);if(a=!this.nq&&!this.error&&this.ready&&this.p>=this.At)a=J.e,a=(a.gd&&a.Nb&&!a.Nb.Vu()?!1:!0)||this.p>=this.uv;a&&(this.nq=!0,this.Vb())};
e.Lg=function(a,b,c){!this.Yg&&this.Lf&&dc(this.Lf,this.Hb,this.Bc,b,c)&&(this.sb=Math.floor((b-this.Hb)/(this.sa.width/this.Ia.length)))};e.Mg=function(a,b,c){void 0!==this.sb&&(this.Ia[this.sb].url||this.Ia[this.sb].action)&&dc(this.Lf,this.Hb,this.Bc,b,c)&&(b-=this.Hb,b>=this.sa.width/this.Ia.length*this.sb&&b<this.sa.width/this.Ia.length*(this.sb+1)&&(this.Ia[this.sb].url?J.j.nd(this.Ia[this.sb].url):this.Ia[this.sb].action()));this.sb=void 0};
e.Tc=function(a,b){"Load Complete"===a&&"start"===b.hb?(this.Wi=!0,Gf(this)):"Load Complete"===a&&"load"===b.hb?this.Br=!0:"Load Complete"===a&&"audio"===b.hb?this.Lp=!0:"Load Complete"===a&&"audio_music"===b.hb?this.Rr=!0:"Load Complete"===a&&"fonts"===b.hb&&(this.Ym=!0);a===J.Re&&this.ie()};
e.gb=function(){if(!this.error){this.to&&this.Wi?this.Na():p.clear();try{this.et&&p.context.drawImage(this.et,this.re*this.dt,0,this.re,this.re,this.Uo,this.Gl,this.re,this.re)}catch(a){}if(this.Wi){var b=0,c=this.Qg+this.fv,d=this.Kf+this.gv,g=ve.height;ve.va(0,b,0,this.a.Fi,g,c,d,1);b+=this.a.Fi;c+=this.a.Fi;this.ready?(ve.dk(0,b,0,this.Mn,g,c,d,this.a.Pg,g,1),b+=this.Mn,c+=this.a.Pg,ve.va(0,b,0,this.a.Cr,g,c,d,1)):ve.dk(0,b,0,this.Mn,g,c,d,Math.floor(Math.min((na("load")+na("audio"))/500+this.iv*
Math.log(this.p+1),1)*this.a.Pg),g,1);this.sa&&this.sa.Ad(this.Hb,this.Bc,this.Pk)}this.Yg&&this.ke.r(this.xs,this.ys)}};
function If(){var a,b;b=this;this.depth=100;this.k=this.visible=!0;J.c.vb(this,J.jc);this.a=J.a.u.zl;if("landscape"===J.orientation&&J.a.u.Mo)for(a in J.a.u.Mo)this.a[a]=J.a.u.Mo[a];this.Ub=J.a.u.Ub;if("landscape"===J.orientation&&J.a.u.Em)for(a in J.a.u.Em)this.Ub[a]=J.a.u.Em[a];for(a in J.a.W.zl)this.a[a]=J.a.W.zl[a];this.rg=[];a=Jf(J.e);this.cq=void 0!==a&&null!==a;this.Qa=new ec;this.Qa.cb(this.a.vu,function(){b.Is.call(b)});this.Qa.cb(this.a.Tr,function(){b.Ks.call(b)});this.Qa.cb(J.l.Ti&&!this.cq?
this.a.jw:this.a.Tr,function(){b.Ls.call(b)});this.Qa.cb(this.a.Jv,function(){b.Js.call(b)});Pb(this,!1)}e=If.prototype;e.Is=function(){this.rk=!0;this.a.Gg&&(this.Hg=J.c.g(this.a.Hg,this.canvas.width,ke.width),this.qi=J.c.g(this.a.qi,this.canvas.width,ke.width),this.ri=J.c.g(this.a.ri,this.canvas.height,ke.height),this.Fg=J.c.g(this.a.Fg,this.canvas.height,ke.height),this.ln=this.Hg,this.sk=this.ri,this.fn=this.a.jn,this.gn=this.a.kn,this.en=this.a.hn,this.wc=0,this.ie())};
e.Ks=function(a){function b(a,b,c,d){return oc(a,b,c,d,15)}var c,d;J.l.Ti&&!this.cq&&(c=J.c.g(this.a.mq,this.canvas.width,this.a.fi,Math.floor(this.a.fi/2)),d=J.c.g(this.a.bk,this.canvas.height,Pd.height,Math.floor(Pd.height/2)),c=new Kf("difficulty_toggle",c,d,this.depth-20,Lf()+"",this.a.fi,{aa:function(a){Mf(parseInt(a,10));return!0},Yb:!0}),c.od=Math.floor(this.a.fi/2),c.pd=Math.floor(Pd.height/2),!1!==a&&(Nf(c,"xScale",b,0,1,this.a.lq),Nf(c,"yScale",b,0,1,this.a.lq)),this.ak=c,this.bk=c.y,this.rg.push(c),
this.ie())};
e.Ls=function(a){function b(a,b,c,d){return oc(a,b,c,d,15)}var c,d,g=this;this.po=!0;c=J.c.g(this.a.cs,this.canvas.width,this.a.Oi,Math.floor(this.a.Oi/2));d=J.c.g(this.a.Pi,this.canvas.height,Ud.height,Math.floor(Ud.height/2));c=new Of("bigPlay",c,d,this.depth-20,"startScreenPlay",this.a.Oi,{aa:function(){H(G,g);var a=J.e,b,c,d;void 0===J.e.Zb&&(void 0!==J.a.W.Zb&&(void 0!==J.a.W.Zb.Zt&&(b=J.a.W.Zb.Zt),void 0!==J.a.W.Zb.Pp&&(E.Id("music",J.a.W.Zb.Pp),a.Nf()||ob("music"),J.e.Wv=J.a.W.Zb.Pp),c=void 0!==
J.a.W.Zb.Wt?J.a.W.Zb.Wt:0,d=void 0!==J.a.W.Zb.Wh?J.a.W.Zb.Wh:0),void 0===b&&"undefined"!==typeof Oe&&(b=Oe),void 0!==b&&(J.e.Zb=E.play(b,c,d),J.e.Zb&&(E.Fp(J.e.Zb,"music"),E.rs(J.e.Zb,!0))));J.l.Sf&&!a.gd?a.screen=new Pf:Qf(a,0);return!0},Yb:!0});c.od=Math.floor(this.a.Oi/2);c.pd=Math.floor(Ud.height/2);!1!==a?(Nf(c,"xScale",b,0,1,this.a.hl),Nf(c,"yScale",b,0,1,this.a.hl),this.il=0):this.il=this.a.hl;this.gl=c;this.Pi=c.y;this.rg.push(c);this.ie()};
function Rf(a){var b=sc([qc,function(a,b,g,h){return oc(a,b,g,h,2)},hc],[!0,!1,!1],[.02,.1,.88]);a.bs=!0;Nf(a.gl,"xScale",rc(b),1,.25,4E3);Nf(a.gl,"yScale",rc(b),1,-.1,4E3)}e.Js=function(a){var b,c;this.Nr=!0;b=J.c.g(this.a.Xn,this.canvas.width,Md.width);c=J.c.g(this.a.Tk,this.canvas.height,Md.height);b=new tf(b,c,this.depth-20,new Zb(Md),[Md],{aa:J.e.je,Yb:!0});!1!==a&&Nf(b,"alpha",ic,0,1,this.a.Iv);this.Wn=b;this.Tk=b.y;this.rg.push(b);this.ie()};
e.Na=function(){var a,b,c,d;if(a=this.a.backgroundImage)J.c.Kb(J.Bf),c=Math.abs(J.ma),1<a.G?(b=(p.canvas.height-c)/a.wg,d=-(a.ai*b-p.canvas.width)/2,xa(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.ya(0,d,c,b,b,0,1))};
e.Jm=function(){var a,b,c,d,g,h;if("function"===typeof J.j.si&&(h=this.a.Mf,(this.Ia=J.j.si())&&0<this.Ia.length)){this.sa?this.sa.clear():this.sa=new x(this.a.Mf,this.a.Ii);y(this.sa);h/=this.Ia.length;for(c in this.Ia)try{g=this.Ia[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.Ii/g.height)),a="center"===this.a.Gi?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.sa.height-g.height*d,g instanceof u?g.ya(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}A(this.sa);
this.Pk=0;this.Pn=!0;this.Hi=0;this.Lf=Yb(0,0,this.sa.width,this.sa.height);this.ie()}};e.ie=function(){var a;a=0;J.da.height<this.a.Bm&&(a=this.a.Bm-J.da.height);this.po&&(this.gl.y=this.Pi-a);this.Nr&&(this.Wn.y=this.Tk-a,this.Wn.x=J.c.g(this.a.Xn,J.da.width,Md.width)+J.da.left);this.ak&&(this.ak.y=this.bk-a);this.rk&&this.wc>=this.a.kd&&(this.sk=this.Fg-J.ma);this.sa&&(this.Hb=J.c.g(this.a.Hb,J.da.width,this.sa.width)+J.da.left,this.Bc=J.c.g(this.a.Bc,J.da.height,this.sa.height)+J.da.top)};
e.xc=function(){this.Na();this.a.Gg&&(J.c.Kb(J.jc),this.a.Gg.r(0,0,-this.a.Gg.height-10));this.Jm();this.Qa.start()};e.lc=function(){var a;for(a=0;a<this.rg.length;a++)H(G,this.rg[a])};
e.Da=function(a){this.canvas.ia=!0;this.rk&&this.wc<this.a.kd&&(this.ln=this.a.zu(this.wc,this.Hg,this.qi-this.Hg,this.a.kd),this.sk=this.a.Au(this.wc,this.ri,this.Fg-this.ri,this.a.kd)-J.ma,this.fn=this.a.xu(this.wc,this.a.jn,this.a.Jq-this.a.jn,this.a.kd),this.gn=this.a.yu(this.wc,this.a.kn,this.a.Kq-this.a.kn,this.a.kd),this.en=this.a.wu(this.wc,this.a.hn,this.a.Iq-this.a.hn,this.a.kd),this.wc+=a,this.wc>=this.a.kd&&(this.ln=this.qi,this.sk=this.Fg-J.ma,this.fn=this.a.Jq,this.gn=this.a.Kq,this.en=
this.a.Iq));this.po&&(!this.bs&&this.il>=this.a.hl+this.a.iw&&Rf(this),this.il+=a)};e.Lg=function(a,b,c){this.Lf&&dc(this.Lf,this.Hb,this.Bc,b,c)&&(this.sb=Math.floor((b-this.Hb)/(this.sa.width/this.Ia.length)))};
e.Mg=function(a,b,c){void 0!==this.sb&&(this.Ia[this.sb].url||this.Ia[this.sb].action)&&dc(this.Lf,this.Hb,this.Bc,b,c)&&(b-=this.Hb,b>=this.sa.width/this.Ia.length*this.sb&&b<this.sa.width/this.Ia.length*(this.sb+1)&&(this.Ia[this.sb].url?J.j.nd(this.Ia[this.sb].url):this.Ia[this.sb].action()));this.sb=void 0};e.Fb=function(){this.zb=!0};
e.Xb=function(){this.zb&&(this.Qa.stop(),this.rk?this.wc<this.a.kd&&(this.wc=this.a.kd-1):(this.Is(),this.wc=this.a.kd-1),this.ak?Sf(this.ak):this.Ks(!1),this.Nr?Sf(this.Wn):this.Js(!1),this.po?(Sf(this.gl),this.bs&&Rf(this)):this.Ls(!1),this.zb=!1)};e.Tc=function(a){a===J.Re&&(this.Na(),this.ie())};e.gb=function(){this.rk&&this.a.Gg&&this.a.Gg.ya(0,this.ln,this.sk,this.fn,this.gn,0,this.en);this.sa&&this.sa.r(this.Hb,this.Bc);this.Sc=!1};
function Pf(){this.depth=100;this.k=this.visible=!0;J.c.vb(this,J.jc);var a;this.a=J.a.u.Hf;if("landscape"===J.orientation)for(a in J.a.u.rr)this.a[a]=J.a.u.rr[a];this.Ga=J.a.n.av;if(J.a.n.Hf)for(a in J.a.n.Hf)this.a[a]=J.a.n.Hf[a];this.gc=J.a.u.Ub;for(var b in J.a.W.Hf)this.a[b]=J.a.W.Hf[b];this.Jf=-1;this.Pa=0;this.cv=[];Pb(this)}e=Pf.prototype;
e.Na=function(){var a,b,c,d;J.c.Kb(J.Bf);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(J.ma),1<a.G?(b=(p.canvas.height-c)/a.wg,d=-(a.ai*b-p.canvas.width)/2,xa(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.ya(0,d,c,b,b,0,1));var g;b=J.a.u.oa.type[J.l.Fd].$c;J.a.n.oa&&J.a.n.oa.type&&J.a.n.oa.type[J.l.Fd]&&J.a.n.oa.type[J.l.Fd]&&(b=!1===J.a.n.oa.type[J.l.Fd].$c?!1:b);void 0!==this.Ga&&void 0!==this.Ga.$c&&(b=this.Ga.$c);c=J.c.g(this.a.Es,
this.canvas.width,Jc.width);a=J.c.g(this.a.Fs,J.da.height,Jc.height)+J.da.top;b&&(Jc.r(0,c,a),b=S.T(),C(b,this.a.Ds),Na(b,"center"),b.r(this.H+" / "+this.Yo,c+Math.floor(Jc.width/2),a+Jc.height+this.a.Gs));if(void 0!==this.Ga&&void 0!==this.Ga.us?this.Ga.us:1)b=S.T(),void 0!==this.a.rw?C(b,this.a.rw):C(b,this.a.ds),c=J.i.K("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Ua(b,c,this.a.tw,this.a.sw),d<b.fontSize&&D(b,d),d=J.c.xa(this.a.es,this.canvas.width,b.ka(c),b.align),g=J.c.xa(this.a.fs,J.da.height,
b.ca(c),b.h)+J.da.top,b.r(c,d,g),c=""+this.kl,C(b,this.a.ds),d=J.c.xa(this.a.es,this.canvas.width,b.ka(c),b.align),b.r(c,d,a+Jc.height+this.a.Gs)};
function Tf(a){if("grid"===a.a.type){y(a.Ei);p.clear();a.If=[];var b;b=function(b,d,g){var h,k,l,n,q,s,z,B,r,t,v,w,I,Y,T,ca,Ba,Ja,ed,Wb,kd,Bb,qe;k=J.l.ba[b];ed=a.Qb?a.a.Fu:a.a.Gu;Wb=a.a.sn;kd=ed;if(a.a.fu)h=a.a.fu[b];else{Ja=a.Qb?a.a.Xv:a.a.Yv;for(Bb=Math.floor(k/Ja);1<Math.abs(Bb-Ja);)Ja-=1,Bb=Math.floor(k/Ja);for(h=[];0<k;)h.push(Math.min(Ja,k)),k-=Ja}Bb=h.length;Ba=Math.round(((a.Qb?a.a.xr:a.a.yr)-(Bb+1)*ed)/Bb);qe=a.a.du?a.a.du:!1;if(!qe){Ja=1;for(k=0;k<Bb;k++)Ja=Math.max(h[k],Ja);ca=Math.round((a.canvas.width-
2*Wb)/Ja)}for(k=n=0;k<Bb;k++){Ja=h[k];qe&&(ca=Math.round((a.canvas.width-2*Wb)/Ja));for(l=0;l<Ja;l++){r=a.a.pq;I=a.a.nu;v=J.l.zg||"locked";w=0;q=Uf(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(v=q.state),"object"===typeof q.stats&&null!==q.stats&&(w=q.stats.stars||0));Y="locked"===v;"function"===typeof J.n.Cu&&(s=J.n.Cu(Vf(J.e,b,n),b,n,v))&&(I=Y=r=!1);q=Wb+d;B=kd;T=t=1;if(!1!==I){z=a.Qb?Ec:Kc;if("played"===v)switch(w){case 1:z=a.Qb?Fc:Lc;break;case 2:z=a.Qb?Gc:Mc;break;case 3:z=
a.Qb?Hc:Nc}else a.Qb||"locked"!==v||(z=Qc);z.width>ca&&(T=ca/z.width);z.height>Ba&&(T=Math.min(t,Ba/z.height));q+=Math.round((ca-z.width*T)/2);B+=Math.round((Ba-z.height*T)/2);z.ya(0,q,B,T,T,0,1);g&&(a.If[n]={x:q,y:B})}s&&(s.width>ca&&(t=ca/s.width),s.height>Ba&&(t=Math.min(t,Ba/s.height)),void 0!==z?(w=J.c.g(a.a.pr,z.width*T,s.width*t),I=J.c.g(a.a.qr,z.height*T,s.height*t)):(w=J.c.g(a.a.pr,ca,s.width*t),I=J.c.g(a.a.qr,Ba,s.height*t),g&&(a.If[n]={x:q+w,y:B+I})),s instanceof x?s.ya(q+w,B+I,t,t,0,1):
s.ya(0,q+w,B+I,t,t,0,1));!1===r||Y||(r=""+(J.l.kj?n+1:Vf(J.e,b,n)+1),t=a.fonts.nn,"locked"===v&&void 0!==a.fonts.kv?t=a.fonts.kv:"unlocked"===v&&void 0!==a.fonts.ey?t=a.fonts.ey:"played"===v&&void 0!==a.fonts.played&&(t=a.fonts.played),void 0!==z?(w=J.c.xa(a.a.tr,z.width*T,t.ka(r),t.align),I=J.c.xa(a.a.ur,z.height*T,t.ca(r),t.h)):(w=J.c.xa(a.a.tr,ca,t.ka(r),t.align),I=J.c.xa(a.a.ur,Ba,t.ca(r),t.h)),t.r(r,q+w,B+I));a.Qb&&Y&&(void 0!==z?(w=J.c.g(a.a.Gr,z.width*T,Ic.width),I=J.c.g(a.a.Hr,z.height*T,
Ic.height)):(w=J.c.g(a.a.Gr,ca,Ic.width),I=J.c.g(a.a.Hr,Ba,Ic.height)),Ic.r(0,q+w,B+I));Wb+=ca;n++}Wb=a.a.sn;kd+=Ba+ed}};a.vi&&b(a.C-1,0);b(a.C,a.canvas.width,!0);a.ui&&b(a.C+1,2*a.canvas.width);A(a.Ei)}}function Wf(a,b){switch(b-a.C){case 0:a.$n=0;break;case 1:a.$n=-a.canvas.width;break;case -1:a.$n=a.canvas.width}a.Sg=!0;a.Wk=0;a.moveStart=a.Pa;a.Qr=a.$n-a.Pa;a.Vk=Math.min(a.a.Sv-a.eh,Math.round(Math.abs(a.Qr)/(a.El/1E3)));a.Vk=Math.max(a.a.Rv,a.Vk)}
function Xf(a){if(1<J.l.ba.length){var b,c;b=J.c.g(a.a.iy,a.canvas.width,Pc.width);c=J.c.g(a.a.kp,J.da.height,Pc.height)+J.da.top;a.Pe=new tf(b,c,a.depth-20,new Zb(Pc),[Pc],function(){a.Pd="previous";Wf(a,a.C-1);return!0});b=J.c.g(a.a.hy,a.canvas.width,Oc.width);c=J.c.g(a.a.jp,J.da.height,Oc.height)+J.da.top;a.Oe=new tf(b,c,a.depth-20,new Zb(Oc),[Oc],function(){a.Pd="next";Wf(a,a.C+1);return!0});Yf(a)}else a.Le-=a.a.Oq}
function Yf(a){if(1<J.l.ba.length){var b;a.vi?(b=[Pc],a.Pe.rb=!0):(b=[new x(Pc.width,Pc.height)],y(b[0]),Pc.r(1,0,0),A(b[0]),a.Pe.rb=!1);Zf(a.Pe,b);a.ui?(b=[Oc],a.Oe.rb=!0):(b=[new x(Oc.width,Oc.height)],y(b[0]),Oc.r(1,0,0),A(b[0]),a.Oe.rb=!1);Zf(a.Oe,b)}}
function $f(a){var b,c,d;y(a.cg);p.clear();b=S.T();a.a.cd&&C(b,a.a.cd);Na(b,"center");Oa(b,"middle");c=J.i.K("levelMapScreenWorld_"+a.C,"<LEVELMAPSCREENWORLD_"+a.C+">");d=Ua(b,c,a.a.td-(b.stroke?b.nc:0),a.a.Ye-(b.stroke?b.nc:0),!1);d<b.fontSize&&D(b,d);b.r(c,a.cg.width/2,a.cg.height/2);A(a.cg);a.canvas.ia=!0}
e.xc=function(){var a,b,c,d=this;this.Qb=this.a.Qb?!0:!1;if(!this.Qb){for(a=0;a<J.l.ba.length;a++)if(9<J.l.ba[a]){b=!0;break}b||(this.Qb=!0)}this.Ei=new x(3*this.canvas.width,this.Qb?this.a.xr:this.a.yr);this.vr=-this.canvas.width;this.wr=this.Qb?this.a.Nq:this.a.Pq;this.Le=J.c.g(this.wr,J.da.height,this.Ei.height)+J.da.top;this.cg=new x(this.a.td,this.a.Ye);this.Zx=J.c.g(this.a.Ze,this.canvas.width,this.a.td);J.c.g(this.a.Ze,this.canvas.width,this.a.td);this.gt=J.c.g(this.a.qc,J.da.height,this.cg.height)+
J.da.top;this.sr="undefined"!==typeof s_level_mask?s_level_mask:this.Qb?Zb(Ec):Zb(Kc);this.a.pq&&(this.fonts={},a=function(a){var b,c;for(b in a)c=S.T(),C(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.nn=S,this.Qb?a(this.a.Zu):a(this.a.$u));this.C=J.e.C;this.ba=J.l.ba[this.C];this.Fl=!1;this.El=this.Qo=this.eh=0;this.Ro=this.vr;this.Pa=0;this.vi=0<this.C;this.ui=this.C<J.l.ba.length-1;for(b=this.Yo=this.kl=this.H=0;b<J.l.ba.length;b++)for(a=0;a<J.l.ba[b];a++)c=ag(void 0,a,b),this.Yo+=3,"object"===
typeof c&&null!==c&&(this.H+=void 0!==c.stars?c.stars:0,this.kl+=void 0!==c.highScore?c.highScore:0);J.n.Eu&&(this.kl=J.n.Eu());this.Na();a=this.gc[this.a.$v];b=J.c.g(this.a.aw,this.canvas.width,a.s.width);c=J.c.g(this.a.eo,J.da.height,a.s.height)+J.da.top;this.co=new tf(b,c,this.depth-20,new Zb(a.s),[a.s],{aa:J.e.je,ra:this});Xf(this);Tf(this);$f(this);this.Sc=!0};e.lc=function(){this.Pe&&H(G,this.Pe);this.Oe&&H(G,this.Oe);H(G,this.co)};
e.Fb=function(a,b,c){if(!this.Sg)for(a=0;a<this.If.length;a++)if(dc(this.sr,this.If[a].x-this.canvas.width,this.If[a].y+this.Le,b,c)){this.Jf=a;break}this.Sg=!1;1<J.l.ba.length&&(this.Fl=!0,this.eh=0,this.Xs=this.Ro=b,this.El=this.Qo=0)};
e.Xb=function(a,b,c){if(!this.Sg&&-1!==this.Jf&&dc(this.sr,this.If[this.Jf].x-this.canvas.width,this.If[this.Jf].y+this.Le,b,c)&&(a=J.l.zg||"locked",b=Uf(this.C,this.Jf,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return H(G,this),Qf(J.e,this.Jf,this.C),!0;this.Jf=-1;this.Fl=!1;1<J.l.ba.length&&(Math.abs(this.Pa)>=this.a.Qx&&(this.El>=this.a.Rx||Math.abs(this.Pa)>=this.a.Px)?"previous"===this.Pd?this.vi&&0<=this.Pa&&this.Pa<=this.canvas.width/2?Wf(this,
this.C-1):(0>this.Pa||(this.Pd="next"),Wf(this,this.C)):"next"===this.Pd&&(this.ui&&0>=this.Pa&&this.Pa>=-this.canvas.width/2?Wf(this,this.C+1):(0<this.Pa||(this.Pd="previous"),Wf(this,this.C))):0<Math.abs(this.Pa)&&(this.Pd="next"===this.Pd?"previous":"next",Wf(this,this.C)));return!0};
e.Tc=function(a){if(a===J.Gf||a===J.Re)this.canvas.ia=!0,this.Na(),a===J.Re?(this.gt=J.c.g(this.a.qc,J.da.height,this.cg.height)+J.da.top,this.Le=J.c.g(this.wr,J.da.height,this.Ei.height)+J.da.top,this.co.y=J.c.g(this.a.eo,J.da.height,this.co.images[0].height)+J.da.top,this.Pe&&(this.Pe.y=J.c.g(this.a.kp,J.da.height,Pc.height)+J.da.top),this.Oe&&(this.Oe.y=J.c.g(this.a.jp,J.da.height,Oc.height)+J.da.top),void 0===this.Oe&&void 0===this.Pe&&(this.Le-=this.a.Oq)):($f(this),Tf(this))};
e.ld=function(a){var b=G.la[0].x;this.Fl&&(this.Qo=Math.abs(this.Ro-b),0<this.eh&&(this.El=this.Qo/(this.eh/1E3)),this.Pd=b>this.Ro?"previous":"next",this.eh+=a,this.Pa+=b-this.Xs,this.Xs=b,this.canvas.ia=!0);this.Sg&&(b=this.Vk,this.Pa=this.moveStart+this.Qr*jc(b-this.Wk,1,-1,b,2),this.Wk>=this.Vk&&(this.Sg=!1,this.Pa=0),this.Wk+=a,this.canvas.ia=!0);if(this.Sg||this.Fl)"previous"===this.Pd&&this.Pa>=this.canvas.width/2?0<=this.C-1?(this.C-=1,this.ba=J.l.ba[this.C],this.vi=0<this.C,this.ui=this.C<
J.l.ba.length-1,Yf(this),this.Pa-=this.canvas.width,$f(this),Tf(this),this.canvas.ia=!0,this.moveStart-=this.canvas.width):this.Pa=Math.round(this.canvas.width/2):"next"===this.Pd&&this.Pa<=-this.canvas.width/2&&(this.C+1<J.l.ba.length?(this.C+=1,this.ba=J.l.ba[this.C],this.vi=0<this.C,this.ui=this.C<J.l.ba.length-1,Yf(this),this.Pa+=this.canvas.width,$f(this),Tf(this),this.canvas.ia=!0,this.moveStart+=this.canvas.width):this.Pa=Math.round(-this.canvas.width/2))};
e.gb=function(){this.cg.r(this.Zx,this.gt);this.Ei.r(Math.round(this.vr+this.Pa),this.Le);this.Sc=!1};
function bg(a,b,c,d){this.depth=10;this.k=this.visible=!0;J.c.vb(this,J.jc);var g;this.type=b.failed?"failed":a;this.a=J.a.u.oa;this.Ga=this.a.type[this.type];if("landscape"===J.orientation)for(g in J.a.u.or)this.a[g]=J.a.u.or[g];for(g in J.a.W.oa)this.a[g]=J.a.W.oa[g];if(J.a.W.oa&&J.a.W.oa.type&&J.a.W.oa.type[this.type])for(g in J.a.W.oa.type[this.type])this.a[g]=J.a.W.oa.type[this.type][g];if("failed"===this.type){if(void 0!==J.a.n.oa&&J.a.n.oa.type&&void 0!==J.a.n.oa.type.failed)for(g in J.a.n.oa.type[this.type])this.Ga[g]=
J.a.n.oa.type[this.type][g]}else{if(void 0!==J.a.n.oa&&void 0!==J.a.n.oa.type)for(g in J.a.n.oa.type[this.type])this.Ga[g]=J.a.n.oa.type[this.type][g];for(g in J.a.n.oa)this.Ga[g]=J.a.n.oa[g]}this.wa=b;this.aa=c;this.ra=d;this.xx=[Se,Te,Ue];this.qf=[];this.Qa=new ec;this.Qa.parent=this;Pb(this,!1)}
function cg(a){var b;for(b=0;b<a.H.length;b++)dg(a.H[b]);for(b=0;b<a.Tf.length;b++)H(G,a.Tf[b]);a.Tf=[];a.Oa&&dg(a.Oa);a.Oa=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].rb=!1;a.Qa.stop();a.Qa=void 0;eg(a)}
function fg(a,b){var c;switch(b){case "title_level":c=J.i.K("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.wa.level);break;case "title_endless":c=J.i.K("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.wa.stage);break;case "title_difficulty":c=J.i.K("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.vc(a.a.cd,c,a.a.Ze,a.a.qc,a.a.td,a.a.Ye)}
function gg(a,b){var c;switch(b){case "subtitle_failed":c=J.i.K("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.vc(a.a.Ps,c,a.a.Rs,a.a.Ss)}
function hg(a,b,c){var d,g,h,k,l;g=J.i.K(b.key,"<"+b.key.toUpperCase()+">");d=b.Ae?b.toString(b.Uf):b.toString(b.Oc);h=a.a.Xi;h.align="left";h.h="top";l=S.T();C(l,h);c?(Oa(l,"bottom"),h=a.a.Vf,h.align="left",h.h="bottom",c=S.T(),C(c,h),h=k=0,void 0!==g&&(h+=l.ka(g)+a.a.Dl),void 0!==d&&(h+=c.ka(d)),h=J.c.g(a.a.We,a.canvas.width,h)-a.d.x,void 0!==g&&(l.r(g,h,a.qd+l.fontSize),h+=l.ka(g)+a.a.Dl,k+=l.ca(g)),void 0!==d&&(b.Ae?(d=c.ca(d),l=a.qd+l.fontSize-d,b.di=new ig(h,l,a.a.ah,d,a.depth-100,b.Uf,c,a.a.Zg,
a.a.$g,a.d,b.toString),k=Math.max(k,d)):(c.r(d,h,a.qd+l.fontSize+a.a.Ms),k=Math.max(k,c.ca(d)))),0<k&&(a.qd+=k+a.a.Kd)):(void 0!==g&&(a.vc(h,g,a.a.We,a.a.Xe),k=a.a.Xe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Kd:a.a.Kd,k.offset+=l.ca(g)):"number"===typeof k&&(k+=a.a.Kd+l.ca(g))),void 0!==d&&(h=a.a.Vf,h.h="top",b.Ae?(c=S.T(),h.align="center",C(c,h),g=J.c.g(a.a.We,a.canvas.width,a.a.ah)-a.d.x,l=k-a.d.y,b.di=new ig(g,l,a.a.ah,c.ca(d),a.depth-100,b.Uf,c,a.a.Zg,a.a.$g,a.d,b.toString)):
a.vc(h,d,a.a.We,k)))}
function jg(a,b,c){var d,g,h,k,l,n;switch(b){case "totalScore":d=""+a.wa.totalScore;g=J.i.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=J.i.K("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.wa.highScore;break;case "timeLeft":g=J.i.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.wa.timeLeft;break;case "timeBonus":g=J.i.K("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.wa.timeBonus,n=a.wa.timeBonus}h=a.a.Xi;h.align=
"left";h.h="top";l=S.T();C(l,h);c?(Oa(l,"bottom"),h=a.a.Vf,h.align="left",h.h="bottom",c=S.T(),C(c,h),h=k=0,void 0!==g&&(h+=l.ka(g)+a.a.Dl),void 0!==d&&(h+=c.ka(d)),h=J.c.g(a.a.We,a.canvas.width,h)-a.d.x,void 0!==g&&(l.r(g,h,a.qd+l.fontSize),h+=l.ka(g)+a.a.Dl,k+=l.ca(g)),void 0!==d&&(void 0!==n?(d=c.ca(d),l=a.qd+l.fontSize-d,n=new ig(h,l,a.a.ah,d,a.depth-100,n,c,a.a.Zg,a.a.$g,a.d),k=Math.max(k,d)):(c.r(d,h,a.qd+l.fontSize+a.a.Ms),k=Math.max(k,c.ca(d)))),0<k&&(a.qd+=k+a.a.Kd)):(void 0!==g&&(a.vc(h,
g,a.a.We,a.a.Xe),k=a.a.Xe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Kd:a.a.Kd,k.offset+=l.ca(g)):"number"===typeof k&&(k+=a.a.Kd+l.ca(g))),void 0!==d&&(h=a.a.Vf,h.h="top",void 0!==n?(c=S.T(),h.align="center",C(c,h),g=J.c.g(a.a.We,a.canvas.width,a.a.ah)-a.d.x,l=k-a.d.y,n=new ig(g,l,a.a.ah,c.ca(d),a.depth-100,n,c,a.a.Zg,a.a.$g,a.d)):a.vc(h,d,a.a.We,k)));n instanceof ig&&("totalScore"===b?a.eg=n:a.qf.push(n))}
function kg(a,b){var c,d,g;c=J.i.K(b.key,"<"+b.key.toUpperCase()+">");d=b.Ae?b.toString(b.Uf):b.toString(b.Oc);void 0!==c&&a.vc(a.a.Sm,c,a.a.tq,a.a.gk);void 0!==d&&(b.Ae?(c=S.T(),d=a.a.ii,a.a.cz||(d.align="center"),C(c,d),d=J.c.g(a.a.jk,a.canvas.width,a.a.ik)-a.d.x,g=J.c.g(a.a.Bg,a.canvas.height,a.a.hk)-a.d.y,b.di=new ig(d,g,a.a.ik,a.a.hk,a.depth-100,b.Uf,c,a.a.Zg,a.a.$g,a.d,b.toString)):a.vc(a.a.ii,d,a.a.jk,a.a.Bg))}
function lg(a,b){var c,d,g,h;switch(b){case "totalScore":c=J.i.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.wa.totalScore;g=0;break;case "timeLeft":c=J.i.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.wa.timeLeft}void 0!==c&&a.vc(a.a.Sm,c,a.a.tq,a.a.gk);void 0!==d&&(void 0!==g?(c=S.T(),d=a.a.ii,d.align="center",C(c,d),d=J.c.g(a.a.jk,a.canvas.width,a.a.ik)-a.d.x,h=J.c.g(a.a.Bg,a.canvas.height,a.a.hk)-a.d.y,g=new ig(d,h,a.a.ik,a.a.hk,a.depth-100,g,c,a.a.Zg,a.a.$g,
a.d)):a.vc(a.a.ii,d,a.a.jk,a.a.Bg));g instanceof ig&&("totalScore"===b?a.eg=g:a.qf.push(g))}e=bg.prototype;e.vc=function(a,b,c,d,g,h){var k=S.T();C(k,a);void 0!==g&&void 0!==h&&(a=Ua(k,b,g,h,g),k.fontSize>a&&D(k,a));h=k.ka(b);a=k.ca(b);c=J.c.xa(c,this.canvas.width,h,k.align)-this.d.x;d=J.c.xa(d,this.canvas.height,a,k.h)-this.d.y;k.r(b,c,d,g)};
function mg(a,b){var c,d,g,h;switch(b){case "retry":c=Nd;d=function(){a.De="retry";cg(a)};break;case "exit":c=Ld,d=function(){a.De="exit";cg(a)}}void 0!==c&&(g=J.c.g(a.a.Vt,a.canvas.width,c.width)-a.d.x,h=J.c.g(a.a.Op,a.canvas.height,c.height)-a.d.y,a.buttons.push(new tf(g,h,a.depth-20,new Zb(c),[c],d,a.d)))}
function ng(a,b){var c,d,g,h;switch(b){case "retry":c=Jd;d=function(){a.De="retry";cg(a)};break;case "exit":c=Kd;d=function(){a.De="exit";cg(a)};break;case "next":c=Kd,d=function(){a.De="next";cg(a)}}void 0!==c&&(g=J.c.g(a.a.uu,a.canvas.width,c.width)-a.d.x,h=J.c.g(a.a.Fq,a.canvas.height,c.height)-a.d.y,a.buttons.push(new tf(g,h,a.depth-20,new Zb(c),[c],d,a.d)))}
e.xc=function(){this.p=0;this.H=[];this.Tf=[];this.buttons=[];this.canvas.ia=!0;this.De="";this.Pc=this.wa.failed?!0:!1;this.$c=this.Ga.$c&&!this.Pc;this.Xg=this.Ga.Xg&&!this.Pc&&this.wa.dr;this.om=this.alpha=this.qg=0;og(this);var a,b,c,d,g,h,k=this;switch(this.Ga.Ij){case "failed":this.f=this.a.cl.Yu;break;case "level":this.f=this.a.cl.bv;break;case "difficulty":this.f=this.a.cl.Nm;break;case "endless":this.f=this.a.cl.pu}this.d=new pg(this.depth-10,this.Ha,new x(this.f.width,this.f.height));this.d.x=
J.c.g(this.a.$b,this.canvas.width,this.f.width);this.d.y=J.c.g(this.a.ac,this.canvas.height,this.f.height);y(this.d.f);this.f.r(0,0,0);!this.Pc&&this.$c&&(b=J.c.g(this.a.Go,this.canvas.width,0)-this.d.x,a=J.c.g(this.a.Ho,this.canvas.height,rd.height)-this.d.y+Math.round(qd.height/2),qd.r(0,b,a),b=J.c.g(this.a.Io,this.canvas.width,0)-this.d.x,a=J.c.g(this.a.Jo,this.canvas.height,td.height)-this.d.y+Math.round(sd.height/2),sd.r(0,b,a),b=J.c.g(this.a.Ko,this.canvas.width,0)-this.d.x,a=J.c.g(this.a.Lo,
this.canvas.height,vd.height)-this.d.y+Math.round(ud.height/2),ud.r(0,b,a));void 0!==this.Ga.fj&&fg(this,this.Ga.fj);void 0!==this.Ga.Qs&&gg(this,this.Ga.Qs);this.Bb={};void 0!==this.wa.Ed?(c=this.wa.Ed,c.visible&&kg(this,c),this.Bb[c.id]=c):void 0!==this.Ga.Tm&&lg(this,this.Ga.Tm);if(void 0!==this.wa.Bb)for(a=this.wa.Bb.length,b=S.T(),C(b,this.a.Xi),c=S.T(),C(c,this.a.Vf),b=Math.max(b.ca("g"),c.ca("g"))*a+this.a.Kd*(a-1),this.qd=J.c.g(this.a.Xe,this.canvas.height,b)-this.d.y,b=0;b<a;b++)c=this.wa.Bb[b],
c.visible&&hg(this,this.wa.Bb[b],1<a),this.Bb[c.id]=c;else if(void 0!==this.Ga.le)if("string"===typeof this.Ga.le)jg(this,this.Ga.le,this.a.Eq);else if(this.Ga.le instanceof Array)for(a=this.Ga.le.length,b=S.T(),C(b,this.a.Xi),c=S.T(),C(c,this.a.Vf),b=Math.max(b.ca("g"),c.ca("g"))*a+this.a.Kd*(a-1),this.qd=J.c.g(this.a.Xe,this.canvas.height,b)-this.d.y,b=0;b<a;b++)jg(this,this.Ga.le[b],1<a||this.a.Eq);A(this.d.f);mg(this,this.Ga.Gj);ng(this,this.Ga.ok);J.e.qt&&(b=J.c.g(k.a.Ou,k.canvas.width,k.a.$q)-
this.d.x,a=J.c.g(this.a.Pu,this.canvas.height,this.a.uf)-this.d.y,this.Zq=new Of("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.$q,{aa:function(){void 0!==qg?J.j.nd(J.w.Dk.url+"submit/"+qg+"/"+k.wa.totalScore):J.j.nd(J.w.Dk.url+"submit/")},Yb:!0},k.d),this.buttons.push(this.Zq),b=function(a){a&&(k.Zq.cp("levelEndScreenSubmitHighscoreBtn"),k.vz=a)},rg(this.wa.totalScore,b));b=J.c.g(this.a.vg,this.canvas.width,this.a.ug)-this.d.x;a=J.c.g(this.a.vf,this.canvas.height,this.a.uf)-this.d.y;
this.buttons.push(new tf(b,a,this.depth-20,new Yb(0,0,this.a.ug,this.a.uf),void 0,function(){k.De="exit";cg(k)},this.d));for(b=0;b<this.buttons.length;b++)this.buttons[b].rb=!1;this.d.y=-this.d.height;a=this.a.Sx;this.Qa.cb(a,this.Gx);a+=this.a.Sh;g=0;d=this.a.by;this.$c&&(d=Math.max(d,this.a.Bs+this.a.As*this.wa.stars));if(this.eg&&(this.Qa.cb(a+this.a.Ml,function(a,b){sg(b.parent.eg,b.parent.wa.totalScore,d)}),g=a+this.a.Ml+d,0<this.qf.length)){h=function(a,b){var c=b.parent,d=c.qf[c.qg];sg(c.eg,
c.eg.value+d.value,c.a.pg);sg(d,0,c.a.pg);c.qg+=1};for(b=0;b<this.qf.length;b++)g+=this.a.Xp,this.Qa.cb(g,h);g+=this.a.pg}if(void 0!==this.Bb&&(g=a,h=function(a,b){var c=b.parent,d=c.Oo[c.qg||0],g=c.Bb[d.Cl];void 0!==d.af&&(g.visible&&g.Ae?sg(g.di,d.af(g.di.value),c.a.pg):g.Oc=d.af(g.Oc));d.visible&&d.Ae&&sg(d.di,d.Oc,c.a.pg);c.qg+=1},this.Oo=[],void 0!==this.wa.Ed&&void 0!==this.wa.Ed.af&&(this.Qa.cb(a+this.a.Ml,h),this.Oo.push(this.wa.Ed),g+=this.a.Ml+bonusCounterDuration),void 0!==this.wa.Bb))for(b=
0;b<this.wa.Bb.length;b++)c=this.wa.Bb[b],void 0!==c.af&&(g+=this.a.Xp,this.Qa.cb(g,h),this.Oo.push(c),g+=this.a.pg);if(this.$c){for(b=0;b<this.wa.stars;b++)a+=this.a.As,this.Qa.cb(a,this.Ix),this.Qa.cb(a,this.Jx);a+=this.a.Bs}a=Math.max(a,g);this.Xg&&(a+=this.a.yv,this.Qa.cb(a,this.Fx),this.Qa.cb(a,this.Dx),this.Qa.cb(a+this.a.zv,this.Ex));a+=500;this.Qa.cb(a,function(){J.j.Ru&&J.j.Ru()});this.Qa.cb(a+this.a.Pv,J.j.Su);J.j.er(this.wa);this.Qa.start();this.Pc?E.play(We):E.play(Qe)};
e.Da=function(a){this.alpha=this.a.mk*this.om/this.a.ic;this.om+=a;this.alpha>=this.a.mk&&(this.alpha=this.a.mk,this.k=!1);this.canvas.ia=!0};
e.Gx=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].rb=!0}var d=b.parent,g,h;switch(d.a.ry){case "fromLeft":h="horizontal";g=J.c.g(d.a.$b,d.canvas.width,d.d.width);d.d.x=-d.d.width;d.d.y=J.c.g(d.a.ac,d.canvas.height,d.d.height)+Math.abs(J.ma);break;case "fromRight":h="horizontal";g=J.c.g(d.a.$b,d.canvas.width,d.d.width);d.d.x=d.canvas.width;d.d.y=J.c.g(this.parent.a.ac,d.canvas.height,selft.d.height)+Math.abs(J.ma);break;case "fromBottom":h="vertical";g=J.c.g(d.a.ac,
d.canvas.height,d.d.height)+Math.abs(J.ma);d.d.x=J.c.g(d.a.$b,d.canvas.width,d.d.width);d.d.y=d.canvas.height+d.d.height;break;default:h="vertical",g=J.c.g(d.a.ac,d.canvas.height,d.d.height)+Math.abs(J.ma),d.d.x=J.c.g(d.a.$b,d.canvas.width,d.d.width),d.d.y=-d.d.height}"vertical"===h?tg(d.d,"y",g,d.a.Sh,d.a.pm,c):tg(d.d,"x",g,d.a.Sh,d.a.pm,c)};
function eg(a){function b(){H(G,a);a.ra?a.aa.call(a.ra,a.De):a.aa(a.De)}var c,d;switch(a.a.sy){case "toLeft":d="horizontal";c=-a.d.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.d.height;break;default:d="vertical",c=-a.d.height}"vertical"===d?tg(a.d,"y",c,a.a.qm,a.a.rm,b):tg(a.d,"x",c,a.a.qm,a.a.rm,b)}
e.Ix=function(a,b){var c,d=b.parent,g=Math.abs(J.ma);if(d.H.length<d.wa.stars){switch(d.H.length+1){case 1:c=new pg(d.depth-30,J.de,rd);c.x=J.c.g(d.a.Go,d.canvas.width,0);c.y=J.c.g(d.a.Ho,d.canvas.height,rd.height)+g+Math.round(qd.height/2);break;case 2:c=new pg(d.depth-30,J.de,td);c.x=J.c.g(d.a.Io,d.canvas.width,0);c.y=J.c.g(d.a.Jo,d.canvas.height,td.height)+g+Math.round(sd.height/2);break;case 3:c=new pg(d.depth-30,J.de,vd),c.x=J.c.g(d.a.Ko,d.canvas.width,0),c.y=J.c.g(d.a.Lo,d.canvas.height,vd.height)+
g+Math.round(ud.height/2)}c.Ya=d.a.Cs;c.bb=d.a.Cs;c.alpha=d.a.Bx;tg(c,"scale",1,d.a.Ax,qc,function(){var a=d.H.length,b,c,n;y(d.d.f);switch(a){case 1:n=rd;b=J.c.g(d.a.Go,d.canvas.width,0)-d.d.x;c=J.c.g(d.a.Ho,d.canvas.height,rd.height)-d.d.y+g+Math.round(qd.height/2);break;case 2:n=td;b=J.c.g(d.a.Io,d.canvas.width,0)-d.d.x;c=J.c.g(d.a.Jo,d.canvas.height,rd.height)-d.d.y+g+Math.round(sd.height/2);break;case 3:n=vd,b=J.c.g(d.a.Ko,d.canvas.width,0)-d.d.x,c=J.c.g(d.a.Lo,d.canvas.height,rd.height)-d.d.y+
g+Math.round(ud.height/2)}n.r(0,b,c);A(d.d.f);d.d.Sc=!0;H(G,d.H[a-1])});tg(c,"alpha",1,d.a.zx,kc);d.H.push(c);E.play(d.xx[d.H.length-1])}};e.Jx=function(a,b){var c=b.parent,d,g;d=c.H[c.Tf.length];g=new pg(c.depth-50,J.de,wd);g.x=d.x;g.y=d.y;tg(g,"subImage",wd.G-1,c.a.yx,void 0,function(){H(G,g)});c.Tf.push(g)};
e.Dx=function(a,b){var c=b.parent,d,g,h,k,l,n,q;d=[];h=S.T();k=J.i.K("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.Mr&&C(h,c.a.Mr);g=Ua(h,k,c.a.Sk,c.a.Fv,!0);g<h.fontSize&&D(h,g);l=J.c.xa(c.a.Gv,Tc.width,h.ka(k,c.a.Sk),h.align);n=J.c.xa(c.a.Hv,Tc.height,h.ca(k,c.a.Sk),h.h);for(q=0;q<Tc.G;q++)g=new x(Tc.width,Tc.height),y(g),Tc.r(q,0,0),h.r(k,l,n,c.a.Sk),A(g),d.push(g);c.Oa=new pg(c.depth-120,J.de,d);c.Oa.od=c.a.Jr;c.Oa.pd=c.a.Kr;c.Oa.x=J.c.g({align:"center"},c.d.canvas.width,c.Oa.width)-c.d.x;
c.Oa.y=J.c.g(c.a.Ki,c.Oa.canvas.height,c.Oa.height)-c.d.y+Math.abs(J.ma);l=J.c.g(c.a.Vn,c.Oa.canvas.width,c.Oa.width)-c.d.x;c.Oa.Ya=c.a.Rk;c.Oa.bb=c.a.Rk;c.Oa.parent=c.d;c.Oa.alpha=0;c.Oa.Gy=!0;tg(c.Oa,"scale",1,c.a.Rg,kc,function(){H(G,c.tb);c.tb=void 0});tg(c.Oa,"x",l,c.a.Rg,kc);tg(c.Oa,"alpha",1,0,kc);tg(c.Oa,"subImage",Tc.G,c.a.Dv,kc,void 0,c.a.Rg+c.a.Ir+c.a.Cv,!0,c.a.Ev)};
e.Fx=function(a,b){var c,d=b.parent;d.tb=new pg(d.depth-110,J.de,Sc);d.tb.y=J.c.g(d.a.Ki,d.tb.canvas.height,Sc.height)-d.d.y+d.a.Bv;d.tb.od=d.a.Jr;d.tb.pd=d.a.Kr;d.tb.x=J.c.g(d.a.Vn,d.tb.canvas.width,d.tb.width)-d.d.x;c=J.c.g(d.a.Ki,d.tb.canvas.height,Sc.height)-d.d.y+Math.abs(J.ma);d.tb.Ya=d.a.Rk*d.a.Lr;d.tb.bb=d.a.Rk*d.a.Lr;d.tb.alpha=0;d.tb.parent=d.d;tg(d.tb,"y",c,d.a.Rg,kc);tg(d.tb,"scale",1,d.a.Rg,kc);tg(d.tb,"alpha",1,d.a.Rg,kc)};
e.Ex=function(a,b){var c=b.parent;c.Ne=new pg(c.depth-130,J.de,Rc);c.Ne.parent=c.d;c.Ne.x=c.Oa.x;c.Ne.y=c.Oa.y+c.a.Av;tg(c.Ne,"subImage",Rc.G-1,c.a.Ir,void 0,function(){H(G,c.Ne);c.Ne=void 0});E.play(Ve)};
e.lc=function(){var a;for(a=0;a<this.buttons.length;a++)H(G,this.buttons[a]);for(a=0;a<this.H.length;a++)H(G,this.H[a]);for(a=0;a<this.Tf.length;a++)H(G,this.Tf[a]);this.Oa&&(H(G,this.Oa),this.Ne&&H(G,this.Ne),this.tb&&H(G,this.tb));H(G,this.d);this.Qa&&this.Qa.stop();this.eg&&H(G,this.eg);for(a=0;a<this.qf.length;a++)H(G,this.qf[a]);ug()};e.gb=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.alpha;ta(0,0,p.canvas.width,p.canvas.height,this.a.Aq,!1);p.context.globalAlpha=a};
function vg(a,b,c,d){this.depth=-100;this.visible=!1;this.k=!0;J.c.vb(this,J.jc);var g,h;this.a=c?J.a.u.Ur:J.a.u.options;if("landscape"===J.orientation)for(g in h=c?J.a.u.$z:J.a.u.bw,h)this.a[g]=h[g];this.gc=J.a.u.Ub;h=c?J.a.W.Ur:J.a.W.options;for(g in h)this.a[g]=h[g];if(J.w.options&&J.w.options.buttons)for(g in J.w.options.buttons)this.a.buttons[g]=J.w.options.buttons[g];this.type=a;this.dy=b;this.gd=c;this.xl=!1!==d;Pb(this)}e=vg.prototype;
e.Qh=function(a,b,c,d,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,s=void 0;switch(a){case "music":h="music_toggle";n=this.it;l=J.e.Nf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.it;l=J.e.Nf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.jt;l=J.e.jl()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.jt;l=J.e.jl()?"on":"off";break;case "language":h="language_toggle";n=this.ht;l=J.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.Ui;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.os;this.Dm=this.sx;break;case "moreGames":void 0!==J.w.Ov?(h="default_image",s=J.w.Ov):(h="default_text",k="optionsMoreGames");n=this.tx;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=J.Ug.customFunctions&&"function"===typeof J.Ug.customFunctions.exit?J.Ug.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.Ew;break;
case "restart":h="default_text";k="optionsRestart";n=this.Hw;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.os;this.Dm=this.ux;break;case "about":h="default_text";k="optionsAbout";n=this.qx;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.ni;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.$h}void 0!==h&&void 0!==n&&("image"===this.gc[h].type?this.buttons.push(new wg(h,b,c,this.depth-20,s,d,{aa:n,ra:this,Yb:q},
this.d)):"toggleText"===this.gc[h].type?this.buttons.push(new Kf(h,b,c,this.depth-20,l,d,{aa:n,ra:this,Yb:q},this.d)):"text"===this.gc[h].type?this.buttons.push(new Of(h,b,c,this.depth-20,k,d,{aa:n,ra:this,Yb:q},this.d)):"toggle"===this.gc[h].type&&this.buttons.push(new xg(h,b,c,this.depth-20,l,{aa:n,ra:this,Yb:q},this.d)),this.buttons[this.buttons.length-1].rb=g||!1)};
e.os=function(){var a=this;tg(a.d,"y","inGame"!==this.type?-this.d.f.height:this.canvas.height,this.a.ho,this.a.io,function(){H(G,a);void 0!==a.Dm&&a.Dm.call(a)});return!0};
e.Na=function(a,b){var c,d,g,h;y(this.d.f);p.clear();this.a.backgroundImage.r(0,0,0);c=J.i.K("optionsTitle","<OPTIONS_TITLE>");d=S.T();this.a.cd&&C(d,this.a.cd);void 0!==this.a.td&&void 0!==this.a.Ye&&(g=Ua(d,c,this.a.td,this.a.Ye,this.a.td),d.fontSize>g&&D(d,g));g=J.c.xa(this.a.Ze,this.canvas.width,d.ka(c),d.align)-a;h=J.c.xa(this.a.qc,this.canvas.height,d.ca(c,d.h))-b+-1*J.ma;d.r(c,g,h);A(this.d.f)};
e.kf=function(a,b,c){var d,g,h,k,l,n,q;h=!1;var s=this.a.buttons[this.type];"inGame"===this.type&&J.a.n.He.Or&&(s=J.a.n.He.Or);if("function"!==typeof yg())for(d=0;d<s.length;d++){if("string"===typeof s[d]&&"moreGames"===s[d]){s.splice(d,1);break}for(g=0;g<s[d].length;g++)if("moreGames"===s[d][g]){s[d].splice(g,1);break}}if(!1===J.w.Nf||!1===J.e.Mk)for(d=0;d<s.length;d++)if(s[d]instanceof Array){for(g=0;g<s[d].length;g++)if("music"===s[d][g]){J.e.Nk?s[d]="sfx_big":s.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
s[d]){s.splice(d,1);break}if(!J.e.Nk)for(d=0;d<s.length;d++)if(s[d]instanceof Array){for(g=0;g<s[d].length;g++)if("sfx"===s[d][g]){!1!==J.w.Nf&&J.e.Mk?s[d]="music_big":s.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===s[d]){s.splice(d,1);break}if(1===J.i.Bu().length)for(d=0;d<s.length;d++)if("language"===s[d]){s.splice(d,1);break}h=this.gc.default_text.s.height;k=this.a.Qj;a=J.c.g(this.a.Pj,this.canvas.width,k)-a;n=J.c.g(this.a.Yh,this.d.f.height,h*s.length+this.a.zd*(s.length-1))-b+-1*J.ma;
for(d=0;d<s.length;d++){l=a;q=k;if("string"===typeof s[d])this.Qh(s[d],l,n,q,c);else for(b=s[d],q=(k-(b.length-1)*this.a.zd)/b.length,g=0;g<b.length;g++)this.Qh(b[g],l,n,q,c),l+=q+this.a.zd;n+=h+this.a.zd}};e.it=function(a){var b=!0;"off"===a?(b=!1,J.Ja.ab("off","options:music")):J.Ja.ab("on","options:music");J.e.Nf(b);return!0};e.jt=function(a){var b=!0;"off"===a?(b=!1,J.Ja.ab("off","options:sfx")):J.Ja.ab("on","options:sfx");J.e.jl(b);return!0};
e.ht=function(a){J.i.qs(a);J.Ja.ab(a,"options:language");return!0};
e.Ui=function(){function a(){l.Dc+=1;l.Ui();return!0}function b(){l.Dc-=1;l.Ui();return!0}function c(){var a;l.Na(n,q);l.tf.rb=!0;for(a=0;a<l.buttons.length;a++)H(G,l.buttons[a]);l.buttons=[];l.kf(n,q,!0)}var d,g,h,k,l=this,n=J.c.g(l.a.$b,l.canvas.width,l.a.backgroundImage.width),q=J.c.g(l.a.ac,l.canvas.height,l.a.backgroundImage.height)+-1*J.ma;void 0===l.Dc&&(l.Dc=0);l.hj=void 0!==J.n.Mq?J.n.Mq():[];J.Ja.ab((10>l.Dc?"0":"")+l.Dc,"options:tutorial");for(d=0;d<l.buttons.length;d++)H(G,l.buttons[d]);
l.buttons=[];this.gd?(y(l.d.f),p.clear(),l.tf.rb=!1):l.Na(n,q);y(l.d.f);void 0!==l.a.vd&&(d=J.c.g(l.a.Ol,l.d.f.width,l.a.vd.width),g=J.c.g(l.a.$e,l.d.f.height,l.a.vd.height),l.a.vd.r(0,d,g));k=l.hj[l.Dc].title;void 0!==k&&""!==k&&(h=S.T(),l.a.Ul&&C(h,l.a.Ul),d=Ua(h,k,l.a.ij,l.a.$o,l.a.ij),h.fontSize>d&&D(h,d),d=J.c.xa(l.a.pt,l.d.f.width,h.ka(k,l.a.ij),h.align),g=J.c.xa(l.a.ap,l.d.f.height,h.ca(k,l.a.$o),h.h),h.r(k,d,g));l.Dc<l.hj.length&&(h=l.hj[l.Dc].f,d=J.c.g(l.a.nt,l.d.f.width,h.width),g=J.c.g(l.a.Sl,
l.d.f.height,h.height),h.r(0,d,g),k=l.hj[l.Dc].text,h=S.T(),l.a.Rl&&C(h,l.a.Rl),d=Ua(h,k,l.a.jh,l.a.Zo,l.a.jh),h.fontSize>d&&D(h,d),d=J.c.xa(l.a.ot,l.d.f.width,h.ka(k,l.a.jh),h.align),g=J.c.xa(l.a.Tl,l.d.f.height,h.ca(k,l.a.jh),h.h),h.r(k,d,g,l.a.jh));A(l.d.f);h=nd;d=J.c.g(l.a.mt,l.canvas.width,h.width)-l.d.x;g=J.c.g(l.a.Ql,l.canvas.height,h.height)-l.d.y-J.ma;0<=l.Dc-1?l.buttons.push(new tf(d,g,l.depth-20,new Zb(h),[h],{aa:b,ra:l},l.d)):(h=ld,l.buttons.push(new tf(d,g,l.depth-20,new Zb(h),[h],{aa:c,
ra:l},l.d)));h=md;d=J.c.g(this.a.lt,l.canvas.width,h.width)-l.d.x;g=J.c.g(this.a.Pl,l.canvas.height,h.height)-l.d.y-J.ma;l.Dc+1<l.hj.length?l.buttons.push(new tf(d,g,l.depth-20,new Zb(h),[h],{aa:a,ra:l},l.d)):(h=ld,l.buttons.push(new tf(d,g,l.depth-20,new Zb(h),[h],{aa:c,ra:l},l.d)));return!0};
e.qx=function(){function a(a,b,c,g,h,k){var l;l=S.T();b&&C(l,b);b=Ua(l,a,h,k,h);l.fontSize>b&&D(l,b);c=J.c.xa(c,d.d.f.width,l.ka(a,h),l.align);g=J.c.xa(g,d.d.f.height,l.ca(a,k),l.h);l.r(a,c,g,h);return g+k}function b(a,b,c){b=J.c.g(b,d.d.f.width,a.width);c=J.c.g(c,d.d.f.height,a.height);a.r(0,b,c);return c+a.height}var c,d=this,g=J.c.g(d.a.$b,d.canvas.width,d.a.backgroundImage.width),h=J.c.g(d.a.ac,d.canvas.height,d.a.backgroundImage.height)+-1*J.ma;J.Ja.ab("about","options");for(c=0;c<d.buttons.length;c++)H(G,
d.buttons[c]);d.buttons=[];this.gd?(y(d.d.f),p.clear(),d.tf.rb=!1):d.Na(g,h);y(d.d.f);void 0!==d.a.vd&&b(d.a.vd,d.a.Ol,d.a.$e);var k=null;"function"===typeof J.j.oq?k=J.j.oq(d.a,a,b,d.d.f):(c=J.i.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.zj,d.a.Bj,d.a.Lh,d.a.Aj,d.a.Bp),b(od,d.a.Mh,d.a.Cj),c=J.i.K("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.Nh,d.a.lg,d.a.Ph,d.a.jf,d.a.Oh));a(J.i.K("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+zf()+("big"===J.size?"b":"s"),d.a.mm,d.a.Ep,
d.a.nm,d.a.Dp,d.a.Cp);A(d.d.f);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new tf(l.x,l.y,d.depth-10,Yb(0,0,l.width,l.height),null,{aa:function(a){return function(){J.j.nd(a)}}(l.url),Yb:!0},d.d))}else if(void 0!==J.w.br){c=J.c.g(d.a.Mh,d.d.f.width,od.width);k=J.c.g(d.a.Cj,d.d.f.height,od.height);c=Math.min(c,J.c.g(d.a.lg,d.d.f.width,d.a.jf));var k=Math.min(k,J.c.g(d.a.Ph,d.d.f.height,d.a.Oh)),l=Math.max(d.a.jf,od.width),n=J.c.g(d.a.Ph,d.d.f.height,d.a.Oh)+d.a.Oh-k;d.buttons.push(new tf(c,
k,d.depth-10,Yb(0,0,l,n),null,{aa:function(){J.j.nd(J.w.br)},Yb:!0},d.d))}c=J.c.g(d.a.lm,d.d.f.width,d.a.Kh);d.buttons.push(new Of("default_text",c,d.a.Jh,d.depth-20,"optionsAbout_backBtn",d.a.Kh,{aa:function(){var a;d.Na(g,h);d.tf.rb=!0;for(a=0;a<d.buttons.length;a++)H(G,d.buttons[a]);d.buttons=[];d.kf(g,h,!0);d.vs=!1},ra:d},d.d));return this.vs=!0};
function zg(a){var b,c,d,g,h,k=J.c.g(a.a.$b,a.canvas.width,a.a.backgroundImage.width),l=J.c.g(a.a.ac,a.canvas.height,a.a.backgroundImage.height)+-1*J.ma;J.Ja.ab("versions","options");for(b=0;b<a.buttons.length;b++)H(G,a.buttons[b]);a.buttons=[];a.Na(k,l);y(a.d.f);void 0!==a.a.vd&&a.a.vd.r(0,J.c.g(a.a.Ol,a.d.width,a.a.vd.width),J.c.g(a.a.$e,a.d.height,a.a.vd.height));h=S.T();C(h,a.a.mm);Na(h,"left");c=a.a.yt;d=a.a.zt;for(b in J.version)g=b+": "+J.version[b],h.r(g,c,d),d+=h.ca(g)+a.a.xt;c=J.c.g(a.a.lm,
a.d.f.width,a.a.Kh);d=a.a.Jh;a.buttons.push(new Of("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Kh,{aa:function(){var b;a.Na(k,l);for(b=0;b<a.buttons.length;b++)H(G,a.buttons[b]);a.buttons=[];a.kf(k,l,!0)},ra:a},a.d))}e.sx=function(){return!0};e.tx=function(){J.Ja.ab("moreGames","options");var a=yg();"function"===typeof a&&a();return!0};
e.Ew=function(){var a=this;Ag(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){J.Ja.ab("confirm_yes","options:quit");H(G,a);Af(J.Ja,J.e.bg,Bg(J.e),"progression:levelQuit:"+Cg());Dg();Eg(J.e);return!0})};
e.Hw=function(){var a=this;Ag(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){J.Ja.ab("confirm_yes","options:restart");H(G,a);var b=J.e;b.state="LEVEL_END";Af(J.Ja,J.e.bg,Bg(J.e),"progression:levelRestart:"+Cg());b=J.l.kj?b.qb+1:Vf(b)+1;J.e.oa=!0;J.e.nr="retry";Fg(J.e,!0);b={failed:!0,level:b,restart:!0};J.j.Og(b);J.xd.Og(b);return!0})};
e.ni=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";Gg(b,J.i.K(d,"<"+d.toUpperCase()+">"));a&&(b.tf.rb=!1,b.xl||og())};Ag(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){J.e.ni(a);return!0})};
e.$h=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";Gg(b,J.i.K(d,"<"+d.toUpperCase()+">"));a&&(b.tf.rb=!1,b.xl||og())};Ag(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){J.e.$h(a);return!0})};
function Ag(a,b,c,d,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)H(G,a.buttons[h]);a.buttons=[];b=J.i.K(b,"<"+b.toUpperCase()+">");h=S.T();a.a.gq?C(h,a.a.gq):a.a.nl&&C(h,a.a.nl);k=Ua(h,b,a.a.Wj,a.a.Im,!0);k<h.fontSize&&D(h,k);n=h.ka(b,a.a.Wj)+10;l=h.ca(b,a.a.Wj)+10;k=J.c.xa(a.a.hq,a.d.f.width,n,h.align);l=J.c.xa(a.a.Xj,a.d.f.height,l,h.h);y(a.d.f);h.r(b,k,l,n);A(a.d.f);k=J.c.g(a.a.eq,a.canvas.width,a.a.bi)-a.d.x;l=J.c.g(a.a.Uj,a.canvas.height,a.gc.default_text.s.height)-a.d.y-J.ma;a.buttons.push(new Of("default_text",
k,l,a.depth-20,d,a.a.bi,{aa:function(){var b,c,d;c=J.c.g(a.a.$b,a.canvas.width,a.a.backgroundImage.width);d=J.c.g(a.a.ac,a.canvas.height,a.a.backgroundImage.height)+-1*J.ma;a.Na(c,d);for(b=0;b<a.buttons.length;b++)H(G,a.buttons[b]);a.buttons=[];a.kf(c,d,!0);return!0},ra:a},a.d));k=J.c.g(a.a.fq,a.canvas.width,a.a.bi)-a.d.x;l=J.c.g(a.a.Vj,a.canvas.height,a.gc.default_text.s.height)-a.d.y-J.ma;a.buttons.push(new Of("default_text",k,l,a.depth-20,c,a.a.bi,{aa:function(){return"function"===typeof g?g():
!0},ra:a},a.d))}function Gg(a,b){var c,d,g,h;for(c=0;c<a.buttons.length;c++)H(G,a.buttons[c]);a.buttons=[];d=J.c.g(a.a.$b,a.canvas.width,a.a.backgroundImage.width);g=J.c.g(a.a.ac,a.canvas.height,a.a.backgroundImage.height)+-1*J.ma;a.Na(d,g);c=S.T();a.a.Yn&&C(c,a.a.Yn);d=Ua(c,b,a.a.Zn,a.a.Kv,!0);d<c.fontSize&&D(c,d);h=c.ka(b,a.a.Zn)+10;g=c.ca(b,a.a.Zn)+10;d=J.c.xa(a.a.Lv,a.d.f.width,h,c.align);g=J.c.xa(a.a.Mv,a.d.f.height,g,c.h);y(a.d.f);c.r(b,d,g,h);A(a.d.f)}
e.ux=function(){J.Ja.ab("startScreen","options");Eg(J.e);return!0};e.close=function(){H(G,this);return this.canvas.ia=!0};
e.xc=function(){var a,b;this.xl&&og(this);J.e.Vd=this;this.Cq=this.Bq=!1;a=this.a.backgroundImage;this.d=new pg(this.depth-10,this.Ha,new x(a.width,a.height));this.d.x=J.c.g(this.a.$b,this.canvas.width,a.width);a=J.c.g(this.a.ac,this.canvas.height,a.height)+-1*J.ma;this.d.y=a;this.Na(this.d.x,this.d.y);this.buttons=[];this.dy?this.Ui():this.kf(this.d.x,this.d.y);this.tf=new tf(this.a.vg,this.a.vf,this.depth-20,new Yb(0,0,this.a.ug,this.a.uf),void 0,{aa:this.close,ra:this},this.d);this.mh="versions";
this.nf=new fc;J.c.vb(this.nf,J.jc);Qb(this.nf,this.depth-1);gc(this.nf,"keyAreaLeft",this.d.x,this.d.y+this.a.$e,this.a.mg,this.a.Dj,76);gc(this.nf,"keyAreaRight",this.d.x+this.d.width-this.a.mg,this.d.y+this.a.$e,this.a.mg,this.a.Dj,82);gc(this.nf,"keyAreaCentre",J.pv/2-this.a.mg/2,this.d.y+this.a.$e,this.a.mg,this.a.Dj,67);b=this;this.d.y="inGame"!==this.type?this.canvas.height:-this.d.f.height;tg(this.d,"y",a,this.a.$k,this.a.al,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].rb=
!0})};e.lc=function(){var a;this.xl&&ug();this.Bq&&pa(J.Gf,J.i.pn());this.Cq&&pa(J.Re);for(a=0;a<this.buttons.length;a++)H(G,this.buttons[a]);this.nf.clear();H(G,this.nf);H(G,this.tf);H(G,this.d);J.e.Vd=null};e.Xb=function(){return!0};e.Fb=function(){return!0};e.Ng=function(a){this.vs&&(67===a?this.mh="":76===a?this.mh+="l":82===a&&(this.mh+="r"),"lrl"===this.mh&&zg(this))};e.Tc=function(a){a===J.Gf?(this.Na(this.d.x,this.d.y),this.Bq=!0):a===J.Re?this.Cq=!0:a===J.Ut&&this.close()};
function Hg(){this.depth=-200;this.k=this.visible=!0;J.c.vb(this,J.Bf);var a;this.a=J.a.u.pk;if("landscape"===J.orientation&&J.a.u.cn)for(a in J.a.u.cn)this.a[a]=J.a.u.cn[a];this.gc=J.a.u.Ub;for(a in J.a.W.pk)this.a[a]=J.a.W.pk[a];Pb(this)}
Hg.prototype.Na=function(){var a,b,c,d;d=Math.abs(J.ma);c=this.a.backgroundImage;d=(J.mv-d)/c.wg;this.d.f=new x(d*c.ai,d*c.wg);y(this.d.f);this.d.y=Math.abs(J.ma);a=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,xa(c,0,0),a.restore());c=S.T();C(c,this.a.font);d=J.i.K("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Ua(c,d,this.a.bj-(c.stroke?c.nc:0),this.a.at-(c.stroke?c.nc:0),!0);a<c.fontSize&&D(c,a);a=J.c.xa(this.a.bt,
this.canvas.width,c.ka(d),c.align);b=J.c.xa(this.a.To,this.canvas.height,c.ca(d),c.h);c.r(d,a,b,this.a.bj);A(this.d.f);this.d.canvas.ia=!0};
Hg.prototype.xc=function(){var a,b,c=this;a=this.a.backgroundImage;a=new x(a.width,a.height);this.d=new pg(this.depth,J.jc,a);this.d.x=0;this.d.y=Math.abs(J.ma);this.Na();a=J.c.g(this.a.bu,this.canvas.width,this.a.$p);b=J.c.g(this.a.Cm,this.canvas.height,this.gc[this.a.Zp].s.height);this.button=new Of(this.a.Zp,a,b,this.depth-10,"gameEndScreenBtnText",this.a.$p,function(){H(G,c);Eg(J.e)},this.d)};Hg.prototype.lc=function(){H(G,this.d);H(G,this.button)};
Hg.prototype.Tc=function(a){a!==J.Gf&&a!==J.Re||this.Na()};
function tf(a,b,c,d,g,h,k){function l(a,b,c){var d,g;g=J.c.on(q.canvas);a=Math.round(q.x+q.parent.x-q.od*q.Ya);d=Math.round(q.y+q.parent.y-q.pd*q.bb);if(q.images&&0<q.Ef||0<q.Yi)q.Ef=0,q.Yi=0,q.canvas.ia=!0;if(q.Qi&&q.rb&&dc(q.Vc,a,d,b-g.x,c-g.y))return q.Qi=!1,void 0!==q.ra?q.Zk.call(q.ra,q):q.Zk(q)}function n(a,b,c){var d,g,h;h=J.c.on(q.canvas);d=Math.round(q.x+q.parent.x-q.od*q.Ya);g=Math.round(q.y+q.parent.y-q.pd*q.bb);if(q.rb&&dc(q.Vc,d,g,b-h.x,c-h.y))return q.Qi=!0,q.images&&(1<q.images.length?
(q.Ef=1,q.canvas.ia=!0):1<q.images[0].G&&(q.Yi=1,q.canvas.ia=!0)),void 0!==typeof Re&&E.play(Re),q.Af=a,!0}this.depth=c;this.k=this.visible=!0;this.group="TG_Token";J.c.vb(this,J.jc);this.pd=this.od=0;this.x=a;this.y=b;this.width=g?g[0].width:d.Ka-d.$;this.height=g?g[0].height:d.lb-d.qa;this.alpha=this.bb=this.Ya=1;this.$a=0;this.Vc=d;this.images=g;this.Yi=this.Ef=0;this.Qi=!1;this.rb=!0;this.parent=void 0!==k?k:{x:0,y:0};this.sl=this.rl=0;this.Sc=!0;this.Zk=function(){};this.Yb=!1;"object"===typeof h?
(this.Zk=h.aa,this.ra=h.ra,this.Yb=h.Yb):"function"===typeof h&&(this.Zk=h);var q=this;this.Yb?(this.Lg=n,this.Mg=l):(this.Fb=n,this.Xb=l);Pb(this)}function Nf(a,b,c,d,g,h){void 0===a.Be&&(a.Be=[]);a.Be.push({type:b,start:d,Kc:g,eb:c,duration:h,p:0})}
function Sf(a){var b,c;if(void 0!==a.Be){for(b=0;b<a.Be.length;b++)if(c=a.Be[b],c.k){switch(c.type){case "xScale":a.Ya=c.start+c.Kc;break;case "yScale":a.bb=c.start+c.Kc;break;case "alpha":a.alpha=c.start+c.Kc;break;case "angle":a.$a=c.start+c.Kc;break;case "x":a.x=c.start+c.Kc;break;case "y":a.y=c.start+c.Kc}c.k=!1}a.canvas.ia=!0}}function Zf(a,b){a.images=b;a.canvas.ia=!0}e=tf.prototype;e.ss=function(a){this.visible=this.k=a};e.lc=function(){this.images&&(this.canvas.ia=!0)};
e.Da=function(a){var b,c;if(void 0!==this.Be){for(b=0;b<this.Be.length;b++)switch(c=this.Be[b],c.p+=a,c.type){case "xScale":var d=this.Ya,g=this.rl;this.Ya=c.eb(c.p,c.start,c.Kc,c.duration);this.rl=-(this.images[0].width*this.Ya-this.images[0].width*c.start)/2;if(isNaN(this.Ya)||isNaN(this.rl))this.Ya=d,this.rl=g;break;case "yScale":d=this.bb;g=this.sl;this.bb=c.eb(c.p,c.start,c.Kc,c.duration);this.sl=-(this.images[0].height*this.bb-this.images[0].height*c.start)/2;if(isNaN(this.bb)||isNaN(this.sl))this.bb=
d,this.sl=g;break;case "alpha":this.alpha=c.eb(c.p,c.start,c.Kc,c.duration);break;case "angle":this.$a=c.eb(c.p,c.start,c.Kc,c.duration);break;case "x":d=this.x;this.x=c.eb(c.p,c.start,c.Kc,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.eb(c.p,c.start,c.Kc,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.ia=!0}};
e.ld=function(){var a,b,c;c=J.c.on(this.canvas);a=Math.round(this.x+this.parent.x-this.od*this.Ya);b=Math.round(this.y+this.parent.y-this.pd*this.bb);this.Qi&&!dc(this.Vc,a,b,G.la[this.Af].x-c.x,G.la[this.Af].y-c.y)&&(this.images&&(this.Yi=this.Ef=0,this.canvas.ia=!0),this.Qi=!1)};
e.gb=function(){var a,b;a=Math.round(this.x+this.parent.x-this.od*this.Ya);b=Math.round(this.y+this.parent.y-this.pd*this.bb);this.images&&(this.images[this.Ef]instanceof x?this.images[this.Ef].ya(a,b,this.Ya,this.bb,this.$a,this.alpha):this.images[this.Ef].ya(this.Yi,a,b,this.Ya,this.bb,this.$a,this.alpha));this.Sc=!1};
function Of(a,b,c,d,g,h,k,l){this.ea=J.a.u.Ub[a];a=void 0!==J.a.W.buttons?J.a.u.Oj[J.a.W.buttons[a]||J.a.W.buttons.default_color]:J.a.u.Oj[J.a.u.buttons.default_color];this.font=S.T();a.font&&C(this.font,a.font);this.ea.fontSize&&D(this.font,this.ea.fontSize);this.S=g;this.text=J.i.K(this.S,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.ea.s.height;this.f={source:this.ea.s,Aa:this.ea.Aa,ub:this.ea.ub};g=this.Zd(this.f);h=new Yb(0,0,g[0].width,g[0].height);tf.call(this,b,c,d,
h,g,k,l)}J.c.Ci(Of);e=Of.prototype;e.pl=function(a){this.text=J.i.K(this.S,"<"+this.S.toUpperCase()+">");a&&C(this.font,a);Zf(this,this.Zd(this.f))};e.cp=function(a,b){this.S=a;this.pl(b)};e.jj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof u?this.f.source=a:void 0!==a.Aa&&void 0!==a.ub&&void 0!==a.source&&(this.f=a);Zf(this,this.Zd(this.f))};
e.Zd=function(a){var b,c,d,g,h,k,l=a.Aa+a.ub;d=this.height-(this.ea.bd||0);var n=a.source;c=this.font.ka(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Ua(this.font,this.text,b,d,!0);c<this.ea.fontSize?D(this.font,c):D(this.font,this.ea.fontSize);c=a.Aa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.ea.ad&&(d+=this.ea.ad);h=[];for(g=0;g<n.G;g++)k=new x(b+l,this.height),y(k),n.va(g,0,0,a.Aa,this.height,0,0,1),n.ck(g,a.Aa,0,n.width-l,this.height,a.Aa,0,b,this.height,1),n.va(g,a.Aa+n.width-l,0,a.ub,this.height,a.Aa+b,0,1),this.font.r(this.text,c,d,b),A(k),h.push(k);return h};e.Tc=function(a){a===J.Gf&&this.pl()};
function wg(a,b,c,d,g,h,k,l){this.ea=J.a.u.Ub[a];void 0!==h&&(this.width=h);this.height=this.ea.s.height;this.yd={source:this.ea.s,Aa:this.ea.Aa,ub:this.ea.ub};this.f=g;a=this.Zd();g=new Yb(0,0,a[0].width,a[0].height);tf.call(this,b,c,d,g,a,k,l)}J.c.Ci(wg);
wg.prototype.Zd=function(){var a,b,c,d,g,h,k,l=this.yd.Aa+this.yd.ub;b=this.height-(this.ea.bd||0);var n=this.yd.source;void 0===this.width?a=this.f.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.f.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.f.width))));k=Math.min(a/this.f.width,b/this.f.height);k=Math.min(k,1);g=Math.round(this.yd.Aa+
(a-this.f.width*k)/2);h=Math.round((b-this.f.height*k)/2);c=[];for(b=0;b<n.G;b++){d=new x(a+l,this.height);y(d);n.va(b,0,0,this.yd.Aa,this.height,0,0,1);n.ck(b,this.yd.Aa,0,n.width-l,this.height,this.yd.Aa,0,a,this.height,1);n.va(b,this.yd.Aa+n.width-l,0,this.yd.ub,this.height,this.yd.Aa+a,0,1);try{p.context.drawImage(this.f,g,h,this.f.width*k,this.f.height*k)}catch(q){}A(d);c.push(d)}return c};J.c.Ci(function(a,b,c,d,g,h,k){tf.call(this,a,b,c,g,d,h,k)});
function Kf(a,b,c,d,g,h,k,l){var n;this.ea=J.a.u.Ub[a];a=void 0!==J.a.W.buttons?J.a.u.Oj[J.a.W.buttons[a]||J.a.W.buttons.default_color]:J.a.u.Oj[J.a.u.buttons.default_color];this.font=S.T();a.font&&C(this.font,a.font);this.ea.fontSize&&D(this.font,this.ea.fontSize);void 0!==h&&(this.width=h);this.height=this.ea.s.height;this.Z=this.ea.Z;if(this.Z.length){for(h=0;h<this.Z.length;h++)if(this.Z[h].id===g){this.Ma=h;break}void 0===this.Ma&&(this.Ma=0);this.text=J.i.K(this.Z[this.Ma].S,"<"+this.Z[this.Ma].id.toUpperCase()+
">");this.dg=this.Z[this.Ma].s;h=this.Zd();a=new Yb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Ab();return k(n.Z[n.Ma].id)}:"object"===typeof k?(g={},g.Yb=k.Yb,g.ra=this,g.aa=function(){n.Ab();return k.aa.call(k.ra,n.Z[n.Ma].id)}):g=function(){n.Ab()};tf.call(this,b,c,d,a,h,g,l)}}J.c.Ci(Kf);e=Kf.prototype;
e.Ab=function(a){var b;if(void 0===a)this.Ma=(this.Ma+1)%this.Z.length;else for(b=0;b<this.Z.length;b++)if(this.Z[b].id===a){this.Ma=b;break}this.jj(this.Z[this.Ma].s,J.i.K(this.Z[this.Ma].S,"<"+this.Z[this.Ma].id.toUpperCase()+">"))};e.pl=function(a){a&&C(this.font,a);this.text=J.i.K(this.Z[this.Ma].S,"<"+this.Z[this.Ma].id.toUpperCase()+">");Zf(this,this.Zd())};e.jj=function(a,b,c){this.text=b;this.dg=a;c&&C(this.font,c);Zf(this,this.Zd())};
e.Zd=function(){var a,b,c,d,g,h,k=this.ea.s,l=this.ea.Aa,n=this.ea.ub,q=l+n;g=Math.abs(l-n);d=this.height-(this.ea.bd||0);var s=this.font.T();b=s.ka(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-q:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-q:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-q,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-q,b))));d=Ua(s,this.text,a,d,!0);d<s.fontSize&&D(s,d);b=s.ka(this.text,
a);d=l;c=s.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.ea.Yf+Math.round(b/2)):"left"===c?d+=this.ea.Yf:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.ea.ad&&(g+=this.ea.ad);c=[];for(b=0;b<k.G;b++)h=new x(a+q,this.height),y(h),k.va(b,0,0,l,this.height,0,0,1),k.ck(b,l,0,k.width-q,this.height,l,0,a,this.height,1),k.va(b,l+k.width-q,0,n,this.height,l+a,0,1),this.dg.r(0,this.ea.gh,this.ea.hh),s.r(this.text,d,g,a),A(h),c.push(h);return c};e.Tc=function(a){a===J.Gf&&this.pl()};
function xg(a,b,c,d,g,h,k){var l;this.Z=J.a.u.Ub[a].Z;if(this.Z.length){for(a=0;a<this.Z.length;a++)if(this.Z[a].id===g){this.Ma=a;break}void 0===this.Ma&&(this.Ma=0);this.dg=this.Z[this.Ma].s;a=new Zb(this.dg);l=this;g="function"===typeof h?function(){l.Ab();return h(l.Z[l.Ma].id)}:"object"===typeof h?{ra:this,aa:function(){l.Ab();return h.aa.call(h.ra,l.Z[l.Ma].id)}}:function(){l.Ab()};tf.call(this,b,c,d,a,[this.dg],g,k)}}J.c.Ci(xg);
xg.prototype.Ab=function(a){var b;if(void 0===a)this.Ma=(this.Ma+1)%this.Z.length;else for(b=0;b<this.Z.length;b++)if(this.Z[b].id===a){this.Ma=b;break}this.jj(this.Z[this.Ma].s)};xg.prototype.jj=function(a){this.dg=a;Zf(this,[].concat(this.dg))};
function Ig(a,b,c,d){this.depth=10;this.visible=!1;this.k=!0;J.c.vb(this,J.jc);var g;this.a=J.a.u.Lk;if("landscape"===J.orientation&&J.a.u.In)for(g in J.a.u.In)this.a[g]=J.a.u.In[g];for(g in J.a.W.Lk)this.a[g]=J.a.W.Lk[g];this.An=a;this.um=b;this.aa=c;this.ra=d;this.Ni="entering";this.kt=!1;Pb(this,!1);Rb(this,"LevelStartDialog")}
function Jg(a){var b,c,d,g,h;if("leaving"!==a.Ni){a.Ni="leaving";a.pf=0;b=function(){H(G,a);a.ra?a.aa.call(a.ra):a.aa&&a.aa()};if(void 0!==a.a.jo)for(c=0;c<a.a.jo.length;c++)d=a.a.jo[c],g=void 0,d.Wp&&(a.pf++,g=b),h=d.end,"x"===d.type?h=J.c.g(h,a.canvas.width,a.d.f.width):"y"===d.type&&(h=J.c.g(h,a.canvas.height,a.d.f.height)+Math.abs(J.ma)),tg(a.d,d.type,h,d.duration,d.eb,g,d.na,d.loop,d.Rn);0===a.pf&&b()}}e=Ig.prototype;
e.xc=function(){var a,b,c,d,g,h,k=this;a=this.a.mc;b=a.width;g=a.height;this.d=new pg(this.depth+10,this.Ha,new x(b,g));y(this.d.f);a.r(0,0,0);""!==this.um&&(c=J.c.g(this.a.Jp,b,0),d=J.c.g(this.a.Kp,g,0),a=S.T(),C(a,this.a.Ip),void 0!==this.a.Uh&&void 0!==this.a.tm&&(h=Ua(a,this.um,this.a.Uh,this.a.tm,this.a.Uh),a.fontSize>h&&D(a,h)),a.r(this.um,c,d,this.a.Uh));""!==this.An&&(c=J.c.g(this.a.Uq,b,0),d=J.c.g(this.a.Vq,g,0),a=S.T(),C(a,this.a.Sq),void 0!==this.a.wi&&void 0!==this.a.Tq&&(h=Ua(a,this.An,
this.a.wi,this.a.Tq,this.a.wi),a.fontSize>h&&D(a,h)),a.r(this.An,c,d,this.a.wi));A(this.d.f);this.d.x=J.c.g(this.a.ko,this.canvas.width,b);this.d.y=J.c.g(this.a.$r,this.canvas.height,g)+Math.abs(J.ma);this.pf=0;a=function(){k.pf--;0===k.pf&&(k.Ni="paused")};if(void 0!==this.a.bl)for(b=0;b<this.a.bl.length;b++)g=this.a.bl[b],c=void 0,g.Wp&&(this.pf++,c=a),d=g.end,"x"===g.type?d=J.c.g(d,this.canvas.width,this.d.f.width):"y"===g.type&&(d=J.c.g(d,this.canvas.height,this.d.f.height)+Math.abs(J.ma)),tg(this.d,
g.type,d,g.duration,g.eb,c,g.na,g.loop,g.Rn),void 0!==g.cc&&E.play(g.cc);0===this.pf&&(this.Ni="paused");this.p=0};e.lc=function(){H(G,this.d)};e.Da=function(a){"paused"!==this.state&&(this.p+=a,this.p>=this.a.as&&Jg(this))};e.Fb=function(){return this.kt=!0};e.Xb=function(){this.kt&&"paused"===this.Ni&&Jg(this);return!0};
function pg(a,b,c){this.depth=a;this.k=this.visible=!0;J.c.vb(this,b);this.f=c;this.Lb=0;this.width=c.width;this.height=c.height;this.pd=this.od=this.y=this.x=0;this.bb=this.Ya=1;this.$a=0;this.alpha=1;this.yb=[];this.Hp=0;this.parent={x:0,y:0};this.Sc=!0;Pb(this,!1)}
function tg(a,b,c,d,g,h,k,l,n){var q,s=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.Ya;break;case "yScale":q=a.bb;break;case "scale":b="xScale";q=a.Ya;tg(a,"yScale",c,d,g,void 0,k,l,n);break;case "angle":q=a.$a;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.yb.push({id:a.Hp,p:0,k:!0,Zj:s,type:b,start:q,end:c,Vb:h,duration:d,eb:g,na:k,loop:l,Rn:n});a.Hp++}
function dg(a){var b;for(b=a.yb.length-1;0<=b;b--){switch(a.yb[b].type){case "x":a.x=a.yb[b].end;break;case "y":a.y=a.yb[b].end;break;case "xScale":a.Ya=a.yb[b].end;break;case "yScale":a.bb=a.yb[b].end;break;case "angle":a.$a=a.yb[b].end;break;case "alpha":a.alpha=a.yb[b].end;break;case "subImage":a.Lb=a.yb[b].end}"function"===typeof a.yb[b].Vb&&a.yb[b].Vb.call(a)}}
pg.prototype.Da=function(a){var b,c,d;for(b=0;b<this.yb.length;b++)if(c=this.yb[b],c.k&&(c.p+=a,c.Zj&&c.p>=c.na&&(c.p%=c.na,c.Zj=!1),!c.Zj)){c.p>=c.duration?(d=c.end,c.loop?(c.Zj=!0,c.na=c.Rn,c.p%=c.duration):("function"===typeof c.Vb&&c.Vb.call(this),this.yb[b]=void 0)):"subImage"===c.type?(d=this.f instanceof Array?this.f.length:this.f.G,d=Math.floor(c.p*d/c.duration)):d=c.eb(c.p,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.Ya=
d;break;case "yScale":this.bb=d;break;case "angle":this.$a=d;break;case "alpha":this.alpha=d;break;case "subImage":this.Lb=d}this.canvas.ia=!0}for(b=this.yb.length-1;0<=b;b--)void 0===this.yb[b]&&this.yb.splice(b,1)};
pg.prototype.gb=function(){var a,b,c;b=Math.round(this.x-this.Ya*this.od)+this.parent.x;c=Math.round(this.y-this.bb*this.pd)+this.parent.y;a=this.f;a instanceof Array&&(a=this.f[this.Lb%this.f.length]);a instanceof x?a.ya(b,c,this.Ya,this.bb,this.$a,this.alpha):a.ya(this.Lb,b,c,this.Ya,this.bb,this.$a,this.alpha);this.Sc=!1};
function ig(a,b,c,d,g,h,k,l,n,q,s){this.depth=g;this.visible=!0;this.k=!1;J.c.vb(this,J.jc);this.x=a;this.y=b;this.Tn=l;this.Un="object"===typeof n?n.top:n;this.qv="object"===typeof n?n.bottom:n;this.ka=c;this.ca=d;this.width=this.ka+2*this.Tn;this.height=this.ca+this.Un+this.qv;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof s?s:function(a){return a+""};this.alpha=1;this.Rf=this.Qf=this.pd=this.od=0;c=new x(this.width,this.height);this.ng=new pg(this.depth,
this.Ha,c);this.ng.x=a-this.Tn;this.ng.y=b-this.Un;this.ng.parent=q;this.Wa=this.ng.f;this.Qe();Pb(this)}ig.prototype.lc=function(){H(G,this.ng)};function sg(a,b,c){a.k=!0;a.ym=a.value;a.value=a.ym;a.end=b;a.duration=c;a.eb=ic;a.p=0}
ig.prototype.Qe=function(){var a,b;a=this.font.align;b=this.font.h;var c=this.Tn,d=this.Un;this.Qp||(this.Wa.clear(),this.canvas.ia=!0);y(this.Wa);this.Qp&&this.Qp.va(0,this.wy,this.xy,this.vy,this.uy,0,0,1);"center"===a?c+=Math.round(this.ka/2):"right"===a&&(c+=this.ka);"middle"===b?d+=Math.round(this.ca/2):"bottom"===b&&(d+=this.ca);b=this.toString(this.value);a=Ua(this.font,b,this.ka,this.ca,!0);a<this.font.fontSize&&D(this.font,a);this.font.r(b,c,d,this.ka);A(this.Wa);this.ng.Sc=!0};
ig.prototype.Da=function(a){var b;b=Math.round(this.eb(this.p,this.ym,this.end-this.ym,this.duration));this.p>=this.duration?(this.value=this.end,this.k=!1,this.Qe()):b!==this.value&&(this.value=b,this.Qe());this.p+=a};function Kg(a,b,c){this.depth=-100;this.visible=!1;this.k=!0;this.xw=a;J.c.vb(this,J.jc);this.a=J.a.u.Mm;this.gc=J.a.u.Ub;this.aq=b;for(var d in J.a.W.Mm)this.a[d]=J.a.W.Mm[d];this.no=!1!==c;Pb(this)}e=Kg.prototype;e.ht=function(){};
e.Qh=function(a,b,c,d,g){b=new Of("default_text",b,c,this.depth-20,a.S||"NO_TEXT_KEY_GIVEN",d,{aa:function(){a.aa&&(a.ra?a.aa.call(a.ra,a):a.aa(a))},ra:this},this.d);this.buttons.push(b);a.text&&b.jj(b.f,a.text);this.buttons[this.buttons.length-1].rb=g||!1};
e.Na=function(a,b,c){y(this.d.f);p.clear();this.a.backgroundImage.r(0,0,0);a=c?c:this.xw;b=S.T();this.a.is&&C(b,this.a.is);c=Ua(b,a,this.a.ro,this.a.qo,!0);c<b.fontSize&&D(b,c);c=b.ka(a,this.a.ro)+10;var d=b.ca(a,this.a.qo)+10,g=J.c.xa(this.a.Cw,this.d.f.width,c,b.align),d=J.c.xa(this.a.Dw,this.d.f.height-Lg(this),d,b.h);b.r(a,g,d,c);A(this.d.f)};function Lg(a){var b=a.aq;return J.c.g(a.a.Yh,a.d.f.height,a.gc.default_text.s.height*b.length+a.a.zd*(b.length-1))}
e.kf=function(a,b){var c,d,g,h,k,l,n,q,s,z=[],z=this.aq;g=this.gc.default_text.s.height;h=this.a.Qj;k=J.c.g(this.a.Pj,this.canvas.width,h)-a;q=Lg(this);for(c=z.length-1;0<=c;c--){n=k;s=h;if("object"===typeof z[c]&&z[c].hasOwnProperty("length")&&z[c].length)for(l=z[c],s=(h-(l.length-1)*this.a.zd)/l.length,d=0;d<l.length;d++)this.Qh(l[d],n,q,s,b),n+=s+this.a.zd;else this.Qh(z[c],n,q,s,b);q-=g+this.a.zd}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.ss(!0);this.d.visible=!0};e.close=function(){H(G,this);return this.canvas.ia=!0};function Mg(a){var b=J.e.ze;b.Na(b.d.x,b.d.y,a);for(a=0;a<b.buttons.length;a++)H(G,b.buttons[a]);b.canvas.ia=!0}
e.xc=function(){var a,b;this.no&&og(this);a=this.a.backgroundImage;this.d=new pg(this.depth-10,this.Ha,new x(a.width,a.height));this.d.x=J.c.g(this.a.$b,this.canvas.width,a.width);var c="landscape"===J.orientation?J.a.u.Gm:J.a.u.Xd;a=J.c.g(this.a.ac,this.canvas.height,a.height)+-1*c.Uk;this.d.y=a;this.Na(this.d.x,this.d.y);this.buttons=[];this.kf(this.d.x);b=this;this.d.y=-this.d.f.height;tg(this.d,"y",a,this.a.$k,this.a.al,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].rb=!0})};
e.lc=function(){var a;this.no&&ug();for(a=0;a<this.buttons.length;a++)H(G,this.buttons[a]);H(G,this.d);J.e.Vd===this&&(J.e.Vd=null)};e.Xb=function(){return!0};e.Fb=function(){return!0};
function Ng(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function Hf(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,l){a=k(a,k(k(c^(b|~d),g),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,l){a=k(a,k(k(b^c^d,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,l){a=k(a,k(k(b&d|c&~d,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,l){a=k(a,k(k(b&c|~b&d,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,s,z,B,r,t,v,w;a=Ng(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);r=1732584193;t=4023233417;v=2562383102;w=271733878;a=l.length;for(n=0;n<a;n+=16)q=r,s=t,z=v,B=w,r=h(r,t,v,w,l[n+
0],7,3614090360),w=h(w,r,t,v,l[n+1],12,3905402710),v=h(v,w,r,t,l[n+2],17,606105819),t=h(t,v,w,r,l[n+3],22,3250441966),r=h(r,t,v,w,l[n+4],7,4118548399),w=h(w,r,t,v,l[n+5],12,1200080426),v=h(v,w,r,t,l[n+6],17,2821735955),t=h(t,v,w,r,l[n+7],22,4249261313),r=h(r,t,v,w,l[n+8],7,1770035416),w=h(w,r,t,v,l[n+9],12,2336552879),v=h(v,w,r,t,l[n+10],17,4294925233),t=h(t,v,w,r,l[n+11],22,2304563134),r=h(r,t,v,w,l[n+12],7,1804603682),w=h(w,r,t,v,l[n+13],12,4254626195),v=h(v,w,r,t,l[n+14],17,2792965006),t=h(t,v,
w,r,l[n+15],22,1236535329),r=g(r,t,v,w,l[n+1],5,4129170786),w=g(w,r,t,v,l[n+6],9,3225465664),v=g(v,w,r,t,l[n+11],14,643717713),t=g(t,v,w,r,l[n+0],20,3921069994),r=g(r,t,v,w,l[n+5],5,3593408605),w=g(w,r,t,v,l[n+10],9,38016083),v=g(v,w,r,t,l[n+15],14,3634488961),t=g(t,v,w,r,l[n+4],20,3889429448),r=g(r,t,v,w,l[n+9],5,568446438),w=g(w,r,t,v,l[n+14],9,3275163606),v=g(v,w,r,t,l[n+3],14,4107603335),t=g(t,v,w,r,l[n+8],20,1163531501),r=g(r,t,v,w,l[n+13],5,2850285829),w=g(w,r,t,v,l[n+2],9,4243563512),v=g(v,
w,r,t,l[n+7],14,1735328473),t=g(t,v,w,r,l[n+12],20,2368359562),r=d(r,t,v,w,l[n+5],4,4294588738),w=d(w,r,t,v,l[n+8],11,2272392833),v=d(v,w,r,t,l[n+11],16,1839030562),t=d(t,v,w,r,l[n+14],23,4259657740),r=d(r,t,v,w,l[n+1],4,2763975236),w=d(w,r,t,v,l[n+4],11,1272893353),v=d(v,w,r,t,l[n+7],16,4139469664),t=d(t,v,w,r,l[n+10],23,3200236656),r=d(r,t,v,w,l[n+13],4,681279174),w=d(w,r,t,v,l[n+0],11,3936430074),v=d(v,w,r,t,l[n+3],16,3572445317),t=d(t,v,w,r,l[n+6],23,76029189),r=d(r,t,v,w,l[n+9],4,3654602809),
w=d(w,r,t,v,l[n+12],11,3873151461),v=d(v,w,r,t,l[n+15],16,530742520),t=d(t,v,w,r,l[n+2],23,3299628645),r=c(r,t,v,w,l[n+0],6,4096336452),w=c(w,r,t,v,l[n+7],10,1126891415),v=c(v,w,r,t,l[n+14],15,2878612391),t=c(t,v,w,r,l[n+5],21,4237533241),r=c(r,t,v,w,l[n+12],6,1700485571),w=c(w,r,t,v,l[n+3],10,2399980690),v=c(v,w,r,t,l[n+10],15,4293915773),t=c(t,v,w,r,l[n+1],21,2240044497),r=c(r,t,v,w,l[n+8],6,1873313359),w=c(w,r,t,v,l[n+15],10,4264355552),v=c(v,w,r,t,l[n+6],15,2734768916),t=c(t,v,w,r,l[n+13],21,
1309151649),r=c(r,t,v,w,l[n+4],6,4149444226),w=c(w,r,t,v,l[n+11],10,3174756917),v=c(v,w,r,t,l[n+2],15,718787259),t=c(t,v,w,r,l[n+9],21,3951481745),r=k(r,q),t=k(t,s),v=k(v,z),w=k(w,B);return(b(r)+b(t)+b(v)+b(w)).toLowerCase()}var qg;
function Og(a,b){var c=J.w.Dk.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function Pg(a){Og("call=api_is_valid",function(b){a(b.is_valid)})}
function rg(a,b){Og("call=is_highscore&score="+a,function(a){0<=a.position?(qg=a.code,b(void 0!==qg)):b(!1)})}
TG_StatObjectFactory={Qy:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},Oy:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,Qg(),Qg(),!0)},Ny:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===J.l.xg?function(a){return a+d}:function(a){return a-d})},Py:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===J.l.xg?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.Oc=d;this.Uf=void 0!==g?g:this.Oc;this.visible=void 0!==h?h:!0;this.Ae=void 0!==k?k:this.Oc!==this.Uf;this.af=l;this.Cl=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return J.c.Kl(1E3*a)}}};
TG_StatObject.prototype.T=function(){return new TG_StatObject(this.id,this.type,this.key,this.Oc,this.Uf,this.visible,this.Ae,this.af,this.Cl)};J.version=J.version||{};J.version.tg="2.13.0";
function Rg(a){this.Ee=[];this.lk=[];this.vw=this.Mi=!1;this.ks=new ha;this.Di=-1;var b=0,c;if("number"===typeof a)for(c=0;c<a;++c)this.Ee[c]=1/a;else{for(c=0;c<a.length;++c)if(b+=a[c],0>a[c])throw"Invalid distribution, chance < 0";if(0===b)for(c=0;c<a.length;++c)this.Ee[c]=0;else for(c=0;c<a.length;++c)this.Ee[c]=a[c]/b}this.Mi=!0;this.Di=-1;if(this.Mi)for(a=0;a<this.Ee.length;++a)this.lk[a]=0}function Sg(a,b){a.ks=b}
function Tg(a){var b,c,d,g,h;b instanceof Array||(b=[b]);!c||c instanceof Array||(c=[c]);for(h=g=d=0;h<a.Ee.length;h++)0>b.indexOf(h)&&(!c||0<=c.indexOf(h))&&(a.Mi&&(d+=a.lk[h]),g+=a.Ee[h]);if(0===g)return a.Di=-1,null;for(;;){var k=a.ks.random(1),l=0,n=!1;for(h=0;h<a.Ee.length;++h)if(!(0<=b.indexOf(h)||c&&0>c.indexOf(h)||a.vw&&a.Di===h)){var q=a.Ee[h]/g;if(a.Mi&&q<a.lk[h]/d)n=!0;else if(l+=q,l>k)return a.Mi&&++a.lk[h],a.Di=h}if(0===l)if(n)d++;else return a.Di=-1,null}}
var W={Zs:{},fh:{},So:{},$s:{},ao:{},bo:{},Ox:{},Qu:{},Mt:function(){W.Zs={Gb:W.Yj,update:W.be,hc:W.$d,end:W.ae,font:ye,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.fh={Gb:W.Yj,update:W.be,hc:W.$d,end:W.ae,font:ze,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.So={Gb:W.Yj,update:W.be,hc:W.$d,end:W.ae,font:Ae,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.$s={Gb:W.Yj,update:W.be,hc:W.$d,end:W.ae,font:Be,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],
[!1,!1,!0],[.1,.8,.1])};W.ao={Gb:W.iu,update:W.be,hc:W.$d,end:W.ae,mi:Ce,li:De,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.bo={Gb:W.ju,update:W.be,hc:W.$d,end:W.ae,mi:Ce,li:De,margin:20,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.Ox={Gb:W.ku,update:W.be,hc:W.$d,end:W.ae,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])};W.Qu={Gb:W.hu,update:W.be,hc:W.$d,end:W.ae,Cd:ic,Dd:ic,Bd:sc([mc,hc,mc],[!1,!1,!0],[.1,.8,.1])}},Jy:function(a){function b(a){var d,g={};for(d in a)g[d]=
"object"===typeof a[d]&&null!==a[d]?b(a[d]):a[d];return g}return b(a)},RA:function(a){W.Zs.font.U=a;W.fh.font.U=a;W.So.font.U=a;W.$s.font.U=a},QA:function(a){W.ao.mi.U=a;W.ao.li.U=a;W.bo.mi.U=a;W.bo.li.U=a},oh:!1,ec:[],nx:function(a){W.oh=a},mz:function(){return W.oh},Gw:function(a){var b,c;for(b=0;b<W.ec.length;b+=1)c=W.ec[b],void 0===c||void 0!==a&&c.kind!==a||0<c.Vg||(W.ec[b]=void 0)},Lt:function(){W.oh=!1;W.ec=[]},qh:function(a,b,c,d){var g,h,k;void 0===d&&(d=W.oh);if(d)for(h=0;h<W.ec.length;h+=
1)if(g=W.ec[h],void 0!==g&&g.Ke&&g.kind===a&&g.font===b&&g.text===c)return g.Vg+=1,h;g={kind:a,font:b,text:c,Vg:1,Ke:d};h=b.align;k=b.h;Na(b,"center");Oa(b,"middle");d=b.ka(c)+2*a.margin;a=b.ca(c)+2*a.margin;g.Wa=new x(d,a);y(g.Wa);b.r(c,d/2,a/2);A(g.Wa);Na(b,h);Oa(b,k);for(h=0;h<W.ec.length;h+=1)if(void 0===W.ec[h])return W.ec[h]=g,h;W.ec.push(g);return W.ec.length-1},Kt:function(a){var b=W.ec[a];b.Vg-=1;0>=b.Vg&&!b.Ke&&(W.ec[a]=void 0)},Yj:function(a){a.buffer=W.qh(a.kind,a.kind.font,a.value,a.Ke)},
iu:function(a){var b=a.value.toString();a.buffer=0<=a.value?W.qh(a.kind,a.kind.mi,b,a.Ke):W.qh(a.kind,a.kind.li,b,a.Ke)},ju:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?W.qh(a.kind,a.kind.mi,b,a.Ke):W.qh(a.kind,a.kind.li,b,a.Ke)},ku:function(a){a.Wa=a.value},hu:function(a){a.f=a.value;a.Lb=0},be:function(a){a.x=void 0!==a.kind.Cd?a.kind.Cd(a.time,a.Al,a.wq-a.Al,a.duration):a.Al+a.time/a.duration*(a.wq-a.Al);a.y=void 0!==a.kind.Dd?a.kind.Dd(a.time,a.Bl,a.xq-a.Bl,a.duration):
a.Bl+a.time/a.duration*(a.xq-a.Bl);void 0!==a.kind.rq&&(a.Qf=a.kind.rq(a.time,0,1,a.duration));void 0!==a.kind.sq&&(a.Rf=a.kind.sq(a.time,0,1,a.duration));void 0!==a.kind.Bd&&(a.alpha=a.kind.Bd(a.time,0,1,a.duration));void 0!==a.kind.ou&&(a.$a=a.kind.ou(a.time,0,360,a.duration)%360);void 0!==a.f&&(a.Lb=a.time*a.f.G/a.duration)},$d:function(a){var b=p.context,c;void 0!==a.f&&null!==a.images?1===a.Qf&&1===a.Rf&&0===a.$a?a.f.Ad(Math.floor(a.Lb),a.x,a.y,a.alpha):a.f.ya(Math.floor(a.Lb),a.x,a.y,a.Qf,a.Rf,
a.$a,a.alpha):(c=void 0!==a.Wa&&null!==a.Wa?a.Wa:W.ec[a.buffer].Wa,1===a.Qf&&1===a.Rf&&0===a.$a?c.Ad(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Qf)||1E-4>Math.abs(a.Rf)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.$a*Math.PI/180),b.scale(a.Qf,a.Rf),c.Ad(-c.width/2,-c.height/2,a.alpha),b.restore()))},ae:function(a){void 0!==a.buffer&&W.Kt(a.buffer)},ld:function(a){var b,c,d=!1;for(b=0;b<W.Cb.length;b+=1)c=W.Cb[b],void 0!==c&&(0<c.na?(c.na-=a,0>c.na&&(c.time+=-c.na,c.na=0)):c.time+=a,0<c.na||
(c.time>=c.duration?(c.kind.end(c),W.Cb[b]=void 0):c.kind.update(c),d=!0));d&&(W.canvas.ia=!0)},gb:function(){var a,b;for(a=0;a<W.Cb.length;a+=1)b=W.Cb[a],void 0!==b&&(0<b.na||b.kind.hc(b))},Cb:[],Uu:function(a,b,c){W.uq();void 0===a&&(a=J.Eg);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);W.visible=!0;W.k=!0;J.c.vb(W,a);W.depth=b;Pb(W);Rb(W,c);W.Lt();W.Mt()},Rh:function(a,b,c,d,g,h,k,l,n){void 0===l&&(l=void 0!==a.na?a.na:0);void 0===n&&(n=W.oh);void 0===g&&void 0!==a.Tv&&(g=c+a.Tv);void 0===h&&void 0!==
a.Uv&&(h=d+a.Uv);void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Al:c,Bl:d,wq:g,xq:h,x:c,y:d,Qf:1,Rf:1,alpha:1,$a:0,time:0,duration:k,na:l,Ke:n};a.kind.Gb(a);for(b=0;b<W.Cb.length;b+=1)if(void 0===W.Cb[b])return W.Cb[b]=a,b;W.Cb.push(a);return W.Cb.length-1},wA:function(a){var b;0>a||a>=W.Cb.length||(b=W.Cb[a],void 0!==b&&(b.kind.end(b),W.Cb[a]=void 0))},Fw:function(){var a,b;for(a=0;a<W.Cb.length;a+=1)b=W.Cb[a],void 0!==b&&(b.kind.end(b),W.Cb[a]=void 0);W.Cb=[]},uq:function(){W.Fw();
W.Gw();H(G,W)}};function Ug(a){this.depth=-99;J.c.vb(this,J.jc);this.k=!0;this.visible=!1;this.e=a;Pb(this)}Ug.prototype.Ak=function(){};Ug.prototype.Ng=function(){};Ug.prototype.Fb=function(a,b,c){a:{var d=this.e,g;for(g=0;g<d.Fc.length;++g)if(d.Fc[g].Fb&&d.Fc[g].Fb(a,b,c)){a=!0;break a}a=!1}return a};
Ug.prototype.Xb=function(a,b,c){var d;a:if(d=this.e,d.ob&&a===d.ep)a=d.ob.a.x,b=d.ob.a.y,d.ob.fo&&(a=d.ob.fo.x,b=d.ob.fo.y),X?console.log("Component:\n x: tgScale("+(a+d.ob.fg.x-X.Ta)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.ob.fg.y-X.Ua)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.ob.fg.x)+"),\n y: tgScale("+(b+d.ob.fg.y)+"),"),d.rt=!1,d=!0;else{for(var g=0;g<d.Fc.length;++g)if(d.Fc[g].Xb&&d.Fc[g].Xb(a,b,c)){d=!0;break a}d=!1}return d};
function Vg(){this.Ha=this.depth=0;this.Pm=this.Pb=this.k=this.visible=!1;this.Fc=[];this.kk={};this.kk.bc=!1;this.yq={};this.paused=this.yq.bc=!1;this.Kx=new x(0,0);this.Mx=this.Lx=0;this.ob=null;this.ep=this.tt=this.st=-1;this.rt=!1;this.Jb=this.Ib=0;this.Hk=null}e=Vg.prototype;e.xc=function(){this.Hk=new Ug(this)};e.lc=function(){this.Hk&&(H(G,this.Hk),this.Hk=null)};
function Wg(a,b,c){for(var d in b){var g=b[d];g.f?c[d]=new Xg(a,g):g.ct?c[d]=new Yg(a,J.i.K(g.ct,"<"+g.ct+">"),g):g.S?c[d]=new Yg(a,J.i.K(g.S,"<"+g.S+">"),g):g.text&&(c[d]=new Yg(a,g.text,g))}}function Zg(a,b){a.bc&&(a.p+=b,a.p>=a.duration&&(a.bc=!1,a.Vb&&a.Vb()))}
e.Da=function(a){Zg(this.kk,a);Zg(this.yq,a);for(var b=0;b<this.Fc.length;++b)this.Fc[b].Da(a);if(this.ob&&this.rt){a=G.la[this.ep].x;b=G.la[this.ep].y;this.canvas===J.c.Df(J.Dg)&&this.ob.xk(this.Ib+J.Cf,this.Jb+J.Ie);var c=a-this.st,d=b-this.tt;this.ob.x+=c;this.ob.y+=d;this.ob.fg.x+=c;this.ob.fg.y+=d;this.st=a;this.tt=b;this.Pb=!0}};e.ld=function(){if(this.Pb){var a=J.c.Df(J.Dg);this.canvas!==a?this.canvas.ia=this.Pb:(p.Kb(a),this.gb())}};
e.ek=function(a,b){for(var c=J.c.Df(J.Dg)===this.canvas,d=0;d<this.Fc.length;++d){var g=this.Fc[d];g.visible&&(c&&g.xk(a,b),g.gb(a,b))}};e.gb=function(){var a=0,b=0;J.c.Df(J.uk)!==this.canvas&&(a=J.Cf,b=J.Ie);this.paused?this.Kx.r(this.Lx+this.Ib+a,this.Mx+this.Jb+b):this.ek(this.Ib+a,this.Jb+b);this.Pb=!1};function $g(){this.Xq=[];this.zq=[];this.Bo=null;this.Np=void 0;this.an=!0}
function ah(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.Vy){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof $g){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new $g,g.Xq=arguments[0],g.zq=arguments[1],g.Bo=arguments[2];var h=null,k=null,l=null,h=g.Xq,k=g.zq,l=g.Bo;this.Si=g;void 0===this.Si.Np&&(this.Si.Np=!Jf(J.e));Vg.apply(this,arguments);Pb(this);this.k=this.visible=!0;k=k||[];h=h||[];this.ej=2;this.Mj=this.px=!1;this.o=l||bh;this.kq=J.uk;void 0!==this.o.Ha&&(this.kq=this.o.Ha);J.c.vb(this,this.kq);this.sj=this.rj=0;this.o.background.Cn&&(this.rj=this.o.background.Cn);this.o.background.Dn&&(this.sj=this.o.background.Dn);this.o.background.elements||
(this.dd=this.o.background.f);this.o.background.ty?(Wg(this,this.o.background.elements,{}),this.dd=this.o.background.f):(g=this.o.background.f,l=new Vg,Wg(l,this.o.background.elements,[]),g||this.Ha!==J.Dg?(this.dd=new x(g.width,g.height),y(this.dd),g.r(0,0,0),l.ek(-this.rj,-this.sj),A(this.dd)):(p.Kb(J.c.Df(this.Ha)),l.gb()));var n=this;b("score",this.o.ms)&&(new ch(this,this.o.ms,"SCORE",0,!0),this.o.jx&&new Xg(this,this.o.jx));b("highScore",this.o.Yq)&&new ch(this,this.o.Yq,"HIGHSCORE",0,!1);b("highScore",
this.o.ar)&&new Xg(this,this.o.ar);this.wx=b(["stage","level"],this.o.Fo)?new ch(this,this.o.Fo,"STAGE",0,!1):new dh(0,0);b("lives",this.o.Ar)&&new ch(this,this.o.Ar,"LIVES",0,!1);this.dj=b("time",this.o.time)?new ch(this,this.o.time,"TIME",0,!1,function(a){return n.Kl(a)}):new dh(0,0);this.dj.wl(36E4);if(this.o.Va&&this.o.hs)throw"Don't define both progress and progressFill in your game_ui settings";this.gs=b("progress",this.o.Va)?this.o.Va.round?new eh(this,this.o.Va):new fh(this,this.o.Va):b("progress",
this.o.hs)?new fh(this,this.o.hs):new dh(0,0);b("lives",this.o.Wq)&&new Xg(this,this.o.Wq);b("difficulty",this.o.Nm)?new Yg(this,gh().toUpperCase(),this.o.Nm):gh();b("difficulty",this.o.gi)&&(g=s_ui_smiley_medium,g=(this.o.gi.images?this.o.gi.images:[s_ui_smiley_easy,s_ui_smiley_medium,s_ui_smiley_hard])[Lf()],this.o.gi.f||(this.o.gi.f=g),this.mu=new Xg(this,this.o.gi),this.mu.ps(g));this.o.Ff&&!this.o.Ff.length&&(this.o.Ff=[this.o.Ff]);this.o.ee&&!this.o.ee.length&&(this.o.ee=[this.o.ee]);this.jr=
[];this.kr=[];this.jr[0]=b(["item","item0"],this.o.Ff)?new Xg(this,this.o.Ff[0]):new dh(0,"");this.kr[0]=b(["item","item0"],this.o.ee)?new Yg(this,"",this.o.ee[0]):new dh(0,"");if(this.o.Ff&&this.o.ee)for(g=1;g<this.o.ee.length;++g)b("item"+g,this.o.ee[g])&&(this.kr[g]=new Yg(this,"0 / 0",this.o.ee[g]),this.jr[g]=new Xg(this,this.o.Ff[g]));for(var q in this.o)g=this.o[q],g.S&&new Yg(this,J.i.K(g.S,"<"+g.S+">")+(g.separator?g.separator:""),g);this.zr=this.Xo=0;this.buttons={};for(q in this.o.buttons)g=
hh(this,this.o.buttons[q]),this.buttons[q]=g;this.o.mo&&(g=hh(this,this.o.mo),this.buttons.pauseButton=g);this.Km={};for(q in this.o.Km)g=this.o.Km[q],g=new ih[g.Ky](this,g),this.Km[q]=g;this.Jb=this.Ib=0}pf(Vg,ah);var ih={};function hh(a,b){var c=new jh(a,b,b.ea);a.Fc.push(c);c.kz=b;return c}e=ah.prototype;e.Ao=function(a,b){this.buttons[b||"pauseButton"].Ao(a)};e.Kl=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.px?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};
e.Wg=function(a){this.gs.Wg(a);return this};e.setTime=function(a){this.dj.wl(a);return this};e.getTime=function(){return this.dj.za()};e.lf=function(a){return this.gs.lf(a)};e.lc=function(){Vg.prototype.lc.apply(this,arguments);p.Kb(this.canvas);p.clear();for(var a in this.buttons)H(G,this.buttons[a])};
e.Da=function(a){1===this.ej&&this.setTime(this.getTime()+a);if(2===this.ej){if(this.Xo&&1E3*this.Xo>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.dj,b.yc.p=0,b.yc.No=!0,b.font.setFillColor(b.yc.color),b.Qe(),"undefined"!==typeof a_gameui_timewarning_second&&E.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}Vg.prototype.Da.apply(this,arguments);this.zr+=a};
e.ek=function(a,b){this.dd&&(this.dd instanceof u?this.dd.Ad(0,a+this.rj,b+this.sj,1):this.dd.Ad(a+this.rj,b+this.sj,1));Vg.prototype.ek.apply(this,arguments);this.Pm&&this.dd&&ta(a,b,this.dd.width,this.dd.height,"blue",!0)};function kh(a){this.complete=!1;this.position=a}
function lh(a,b,c,d,g,h){this.e=a;this.width=g;this.height=h;this.Wa=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.N={};this.N.Ib=0;this.N.Jb=0;this.N.scale=this.scale;this.N.alpha=this.alpha;this.N.$a=0;this.B={};this.B.bc=!1;this.B.origin={};this.B.target={};this.B.p=0;this.a.kk&&(mh(this,this.a.kk),this.B.bc=!1);this.e.Fc.push(this);nh||(nh={Gb:function(a){a.value instanceof x?a.Wa=a.value:(a.f=a.value,a.Lb=0)},
update:W.be,hc:W.$d,end:W.ae,Cd:ic,Dd:ic,Bd:function(a,b,c,d){return 1-mc(a,b,c,d)},rq:function(a,b,c,d){return 1*mc(a,b,c,d)+1},sq:function(a,b,c,d){return 1*mc(a,b,c,d)+1}})}var nh;
function mh(a,b){a.B.origin.x=void 0===b.x?a.x:b.x;a.B.origin.y=void 0===b.y?a.y:b.y;a.B.origin.alpha=void 0!==b.alpha?b.alpha:1;a.B.origin.scale=void 0!==b.scale?b.scale:1;a.B.target.x=a.x;a.B.target.y=a.y;a.B.target.alpha=a.alpha;a.B.target.scale=a.scale;a.B.duration=b.duration;a.B.bc=!0;a.B.Ge=b.Ge||mc;a.B.p=0;a.B.na=b.na||0;oh(a)}
function oh(a){a.B.p>=a.B.duration&&(a.B.p=a.B.duration,a.B.bc=!1);var b=a.B.Ge(a.B.p,a.B.origin.x,a.B.target.x-a.B.origin.x,a.B.duration),c=a.B.Ge(a.B.p,a.B.origin.y,a.B.target.y-a.B.origin.y,a.B.duration);a.N.Ib=b-a.x;a.N.Jb=c-a.y;a.N.alpha=a.B.Ge(a.B.p,a.B.origin.alpha,a.B.target.alpha-a.B.origin.alpha,a.B.duration);a.N.scale=a.B.Ge(a.B.p,a.B.origin.scale,a.B.target.scale-a.B.origin.scale,a.B.duration);a.e.Pb=!0}e=lh.prototype;
e.gb=function(a,b){this.Wa&&this.Wa.ya(this.x+this.N.Ib+a,this.y+this.N.Jb+b,this.N.scale,this.N.scale,0,this.N.alpha)};e.xk=function(a,b){ph(this.x+this.N.Ib+a,this.y+this.N.Jb+b,this.width*this.N.scale,this.height*this.N.scale)};e.Jk=function(a,b){return a>this.x+this.N.Ib&&a<this.x+this.N.Ib+this.width*this.N.scale&&b>this.y+this.N.Jb&&b<this.y+this.N.Jb+this.height*this.N.scale};e.ss=function(a){this.visible!==a&&(this.visible=a,this.e.Pb=!0)};
e.Da=function(a){this.B.bc&&(0<this.B.na?this.B.na-=a:(this.B.p+=-this.B.na,this.B.na=0,this.B.p+=a,oh(this)))};function dh(a,b){this.Va=this.value=this.Gk=b}e=dh.prototype;e.wl=function(a){this.value=a};e.za=function(){return this.value};e.Wg=function(a){0>a&&(a=0);100<a&&(a=100);this.Va=a};e.lf=function(){};e.ps=function(){};
function Xg(a,b){this.fo=b;this.a={};for(var c in b)this.a[c]=b[c];this.f=this.a.f;this.G=0;this.sg=this.a.sg;this.a.Nx&&(this.a.x+=this.f.wb,this.a.y+=this.f.xb);lh.call(this,a,this.a,this.a.x,this.a.y,this.f?this.f.width:1,this.f?this.f.height:1)}pf(lh,Xg);ih.GameUIImage=Xg;function qh(a,b){a.G!==b&&(a.G=b,a.e.Pb=!0)}e=Xg.prototype;
e.gb=function(a,b){this.f&&(this.sg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),this.f instanceof u?this.f.ya(this.G,this.x+a+this.N.Ib,this.y+b+this.N.Jb,this.N.scale,this.N.scale,0,this.N.alpha):this.f.ya(this.x+a+this.N.Ib,this.y+b+this.N.Jb,this.N.scale,this.N.scale,0,this.N.alpha),this.e.Pm&&ta(this.x+a-this.f.wb+1,this.y+b-this.f.xb+1,this.f.width-2,this.f.height-2,"black",!0))};
e.Jk=function(a,b){if(!this.f)return!1;var c=0,d=0;this.sg&&(c+=-Math.floor(this.f.width/2),d+=-Math.floor(this.f.height/2));c-=this.f.wb;d-=this.f.xb;return a>c+this.x+this.N.Ib&&a<c+this.x+this.N.Ib+this.width*this.N.scale&&b>d+this.y+this.N.Jb&&b<d+this.y+this.N.Jb+this.height*this.N.scale};e.xk=function(a,b){this.f&&(this.sg&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),a-=this.f.wb,b-=this.f.xb,ph(this.x+this.N.Ib+a,this.y+this.N.Jb+b,this.width*this.N.scale,this.height*this.N.scale))};
e.qn=function(a){a||(a=new da(0,0));a.x=this.x+J.Cf+this.e.Ib;a.y=this.y+J.Ie+this.e.Jb;return a};e.ps=function(a){a!==this.f&&(this.f=a,this.e.Pb=!0,this.f&&(this.width=this.f.width,this.height=this.f.height))};
function Yg(a,b,c){"object"===typeof b&&(c=b,b=c.S?J.i.K(c.S,"<"+c.S+">"):c.text||"");this.text=b;this.font=c.font.T();c.Rc&&C(this.font,c.Rc);this.Xr=c.x;this.Yr=c.y;this.Wr=c.kb;this.cw=this.font.fillColor;this.oc=void 0===c.oc?.2:c.oc;lh.call(this,a,c,Math.floor(c.x-.1*c.kb),Math.floor(c.y-.1*c.mb),Math.floor(1.2*c.kb),Math.floor(1.2*c.mb));this.Wa=new x(this.width,this.height);switch(this.font.align){case "left":this.Zf=Math.floor(.1*c.kb);break;case "right":this.Zf=Math.floor(1.1*c.kb);break;
case "center":this.Zf=Math.floor(.6*c.kb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.oc*this.font.fontSize);switch(this.font.h){case "top":this.$f=Math.floor(.1*c.mb);break;case "bottom":this.$f=Math.floor(1.1*c.mb)+a;break;case "middle":this.$f=Math.floor(.6*c.mb)+a;break;default:throw"Unknown baseline: "+this.font.h;}this.yc={};this.yc.color="red";this.yc.duration=200;this.yc.p=0;this.yc.No=!1;this.Qe()}pf(lh,Yg);ih.GameUIText=Yg;
Yg.prototype.Da=function(a){lh.prototype.Da.apply(this,arguments);this.yc.No&&(this.yc.p+=a,this.yc.duration<=this.yc.p&&(this.yc.No=!1,this.font.setFillColor(this.cw),this.Qe()))};
Yg.prototype.Qe=function(){this.Wa.clear();y(this.Wa);var a=this.font.ka(this.text),b=1;a>this.Wr&&(b=this.Wr/a);this.font.ya(this.text,this.Zf,this.$f,b,b,0,1);this.e.Pm&&(ta(0,0,this.Wa.width,this.Wa.height,"black",!0),ta(this.Xr-this.x,this.Yr-this.y,this.Wa.width-2*(this.Xr-this.x),this.Wa.height-2*(this.Yr-this.y),"red",!0),ua(this.Zf-5,this.$f,this.Zf+5,this.$f),ua(this.Zf,this.$f-5,this.Zf,this.$f+5));this.e.Pb=!0;A(this.Wa)};function rh(a){return""+a}function sh(a,b,c){return b+c}
function ch(a,b,c,d,g,h){this.value=this.Gk=d||0;this.Vl=-1;this.wt=c;this.a=b;this.vt=-99999;this.Jl=b.Jl||0;this.nk=b.nk?b.nk:h||rh;c=sh;g&&0!==this.a.qq&&(c=nc);this.Ea=new qf(this.Gk,void 0===this.a.qq?500:this.a.qq,c);b.ei&&(this.ei="game_ui_"+b.ei);this.text=th(this)+this.nk(this.Gk);Yg.call(this,a,this.text,b)}pf(Yg,ch);ih.GameUIValue=ch;ch.prototype.wl=function(a){this.value=a;rf(this.Ea,this.value)};ch.prototype.za=function(){return this.value};
ch.prototype.cp=function(a){var b=this.Vl;if(a||G.tk-this.vt>this.Jl)b=this.nk(Math.floor(this.Ea.za()));this.Vl!==b&&(this.vt=G.tk,this.Vl=b,this.text=th(this)+b,this.Qe())};ch.prototype.Da=function(a){Yg.prototype.Da.apply(this,arguments);this.Ea.mf(a);Math.floor(this.Ea.za())!==this.Vl&&this.cp()};function th(a){var b="";a.a.lh&&(b=a.ei?J.i.K(a.ei,"<"+a.ei.toUpperCase()+">"):J.i.K("game_ui_"+a.wt,"<"+a.wt+">"));return b+(a.a.separator?a.a.separator:"")}
function fh(a,b){this.rf=this.Va=0;this.a=b;this.Ri=this.Of=0;this.f=b.f;this.Ce=b.Ce||b.f;this.Bn=b.Bn||null;this.a.dl=this.a.dl||0;this.a.el=this.a.el||0;this.vm=!0;this.ml=b.ml||0;this.H=[];this.Mj=!1;this.Ea=new qf(0,200,qc);this.fc=new qf(0,200,qc);lh.call(this,a,b,b.x,b.y,this.f.width,this.f.height)}pf(lh,fh);ih.GameUIProgress=fh;fh.prototype.Wg=function(a){0>a&&(a=0);100<a&&(a=100);this.Mj?(this.rf=a-this.Va,rf(this.fc,this.rf)):(rf(this.Ea,a),this.Va=a)};
fh.prototype.Da=function(a){this.Ea.mf(a);var b=this.Ea.za();b!==this.Of&&(this.e.Pb=!0,this.Of=b);this.fc.mf(a);a=this.fc.za();a!==this.Ri&&(this.e.Pb=!0,this.Ri=a);b+=a;if(this.vm)for(a=0;a<this.H.length;++a){var c=b>=this.H[a].position&&this.Va+this.rf>=this.H[a].position;this.H[a].complete!==c&&(this.a.H&&(this.e.Pb=!0,this.Of=b),this.H[a].complete=c)}};
fh.prototype.gb=function(a,b){var c,d,g;if(0===this.ml&&(0<this.fc.za()&&this.Ce.va(0,this.width*this.Ea.za()/100,0,this.Ce.width*this.fc.za()/100,this.Ce.height,a+this.x+this.width*this.Ea.za()/100,b+this.y),this.f.va(0,0,0,this.width*this.Ea.za()/100,this.height,a+this.x,b+this.y),this.a.H))for(c=0;c<this.H.length;++c)d=this.H[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.width/100*d.position,b+this.y+this.a.H.y);if(1===this.ml&&(0<this.fc.za()&&this.Ce.va(0,0,this.height-
this.height*this.Ea.za()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ea.za()/100)),this.f.va(0,0,this.height-this.height*this.Ea.za()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ea.za()/100)),this.a.H))for(c=0;c<this.H.length;++c)d=this.H[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.a.H.x,b+this.y+this.height-this.height/100*d.position);if(2===this.ml&&(0<this.fc.za()&&this.Ce.va(0,0,this.height*this.Ea.za()/
100,this.Ce.width,this.Ce.height*this.fc.za()/100,a+this.x+this.width*this.Ea.za()/100,b+this.y),this.f.va(0,0,0,this.width,this.height*this.Ea.za()/100,a+this.x,b+this.y),this.a.H))for(c=0;c<this.H.length;++c)d=this.H[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.r(0,a+this.x+this.a.H.x,b+this.y+this.height/100*d.position);this.Bn&&this.Bn.r(0,a+this.x+this.a.dl,b+this.y+this.a.el)};fh.prototype.lf=function(a){this.H.push(new kh(a));return this.H.length-1};
function jh(a,b,c){this.Nl=!1;this.gj=-1;this.e=a;this.a=b;this.k=!0;this.Ao(c);Xg.call(this,a,b)}pf(Xg,jh);ih.GameUIButton=jh;jh.prototype.Ao=function(a){var b=null,c=null,d=this.e,g=this.a;void 0===a&&(a=g.ea?g.ea:0);switch(a){case 0:b=d.Si.an?ue:Md;c=function(){Jf(J.e)?J.e.je(!1,!0,d.Si.an):J.e.je();return!0};break;case 1:b=Nd;c=function(){J.e.je();return!0};break;case 2:b=s_btn_small_quit;c=function(){uh(d.Si.an);return!0};break;case 3:b=g.f}this.Vb=c;this.a.f=b};
jh.prototype.Fb=function(a,b,c){if(this.k)return this.Jk(b-J.Cf,c-J.Ie)?(this.Nl=!0,this.gj=a,qh(this,1),!0):!1};jh.prototype.Da=function(a){Xg.prototype.Da.apply(this,arguments);this.Nl&&(this.Jk(G.la[this.gj].x-J.Cf,G.la[this.gj].y-J.Ie)?qh(this,1):qh(this,0))};jh.prototype.Xb=function(a,b,c){return this.Nl&&a===this.gj?(qh(this,0),this.Jk(b-J.Cf,c-J.Ie)&&this.Vb&&this.Vb(),this.Nl=!1,this.gj=-1,!0):!1};
function eh(a,b){this.rf=this.Va=0;this.a=b;this.Ri=this.Of=0;this.vm=!0;this.H=[];this.color=b.color||"#00AEEF";this.Nj=b.Nj||"#FF0F64";this.Kj=b.Kj||"#FFED93";this.Vp=void 0===b.blink||b.blink;this.mc=b.mc;this.og=this.Mj=!1;this.of=0;this.Jj=1E3;this.Lj=0;this.Ea=new qf(0,200,qc);this.fc=new qf(0,200,qc);lh.call(this,a,b,b.x,b.y,1,1)}pf(lh,eh);ih.GameUIRoundProgress=eh;function vh(a){a.Vp&&(a.og?a.of-=a.Jj:(a.og=!0,a.of=0,a.Lj=0,rf(a.Ea,100)))}e=eh.prototype;
e.lf=function(a){this.H.push(new kh(a));return this.H.length-1};e.Wg=function(a){0>a&&(a=0);100<a&&(a=100);this.Mj?(this.rf=a-this.Va,rf(this.fc,this.rf)):(this.og||(100===a&&this.Vp?vh(this):rf(this.Ea,a)),this.Va=a)};
e.Da=function(a){this.Ea.mf(a);var b=this.Ea.za();b!==this.Of&&(this.e.Pb=!0,this.Of=b);this.fc.mf(a);var c=this.fc.za();c!==this.Ri&&(this.e.Pb=!0,this.Ri=c);this.og&&(this.of+=a,this.of>=this.Jj?100===this.Va?(this.og=!1,vh(this)):(this.og=!1,this.Lj=0,this.Ea.Cg=0,this.Ea.Ll=0,rf(this.Ea,this.Va)):this.Lj=(-Math.cos(this.of/this.Jj*5*Math.PI*2)+1)/2,this.e.Pb=!0);b+=c;if(this.vm)for(a=0;a<this.H.length;++a)c=b>=this.H[a].position&&this.Va+this.rf>=this.H[a].position,this.H[a].complete!==c&&(this.a.H&&
(this.e.Pb=!0,this.Of=b),this.H[a].complete=c)};e.xk=function(a,b){this.mc&&ph(this.x+this.N.Ib+a-this.mc.wb,this.y+this.N.Jb+b-this.mc.xb,this.mc.width*this.N.scale,this.mc.height*this.N.scale)};
e.gb=function(a,b){var c,d;if(this.mc){d=this.Ea.za()/100;d=Math.max(d,0);d=Math.min(d,1);var g=p.context,h=this.mc.width/2-K(4),k=g.fillStyle;0<this.fc.za()&&(c=this.fc.za()/100,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+c)*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.Nj,g.fill());g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Jj&&(c=g.globalAlpha,g.globalAlpha*=
this.Lj,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.Kj,g.fill(),g.globalAlpha=c);if(this.a.H){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=K(2);for(d=0;d<this.H.length;++d){c=this.H[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+this.y+c));g.stroke()}g.strokeStyle=
l;g.lineWidth=n}this.mc.r(0,a+this.x,b+this.y);if(this.a.H)for(d=0;d<this.H.length;++d)c=this.H[d],h=c.complete?je:ie,c=c.position/100*Math.PI*2,l=Math.sin(-.5*Math.PI+c)*this.a.H.so*.5,h.r(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.H.so*.5),Math.round(b+this.y+l));g.fillStyle=k}};J.version=J.version||{};J.version.game_ui="2.1.0";var wh=wh||{},X={Ta:K(14),Ua:K(40)};
wh.ve={background:{f:yd,Cn:K(0),Dn:K(34),elements:[{f:Cd,x:K(56)+X.Ta,y:K(44)+X.Ua},{S:"game_ui_STAGE",x:K(6)+X.Ta,y:K(108)+X.Ua,kb:K(100),mb:K(20),oc:.2,font:U,Rc:{fillColor:"#9fa9bf",fontSize:K(20),jd:"lower",align:"center",h:"top"}},{f:xd,x:K(9,"round")+X.Ta,y:K(182)+X.Ua},{f:xd,x:K(9,"round")+X.Ta,y:K(240)+X.Ua},{S:"game_ui_SCORE",x:K(6)+X.Ta,y:K(254)+X.Ua,kb:K(100),mb:K(20),oc:.2,font:U,Rc:{fillColor:"#9fa9bf",fontSize:K(20),jd:"lower",align:"center",h:"top"}},{f:xd,x:K(9,"round")+X.Ta,y:K(304)+
X.Ua},{S:"game_ui_HIGHSCORE",x:K(6)+X.Ta,y:K(370)+X.Ua,kb:K(100),mb:K(20),oc:.2,font:U,Rc:{fillColor:"#9fa9bf",fontSize:K(20),jd:"lower",align:"center",h:"top"}}]},Va:{x:K(56)+X.Ta,y:K(44)+X.Ua,mc:Bd,round:!0,color:"#00AEEF",Nj:"#FF0F64",Kj:"#FFED93",blink:!1,H:{so:K(73)}},Fo:{x:K(6)+X.Ta,y:K(130)+X.Ua,kb:K(100),mb:K(38),oc:.2,lh:!1,separator:"",font:U,Rc:{fontSize:K(38),fillColor:"#12AEEB",align:"center",h:"top"}},Wq:{x:K(50)+X.Ta,y:K(224)+X.Ua,f:Ad,sg:!0},Ar:{x:K(56)+X.Ta,y:K(200)+X.Ua,kb:K(50),
mb:K(24),oc:.2,lh:!1,separator:"x ",font:U,Rc:{align:"left",h:"middle",fillColor:"#5782AE"}},ms:{x:K(6)+X.Ta,y:K(276)+X.Ua,kb:K(100),mb:K(24),Jl:50,oc:.2,lh:!1,separator:"",font:U,Rc:{fontSize:K(24),fillColor:"#172348",align:"center",h:"top"}},ar:{x:K(43,"round")+X.Ta,y:K(324)+X.Ua,f:zd,sg:!1,Nx:!0},Yq:{x:K(6)+X.Ta,y:K(392)+X.Ua,kb:K(100),mb:K(20),oc:.2,lh:!1,separator:"",font:U,Rc:{fillColor:"#59668e",fontSize:K(20),align:"center",h:"top"}},mo:{x:K(6)+X.Ta,y:K(538)-K(86)+X.Ua}};var bh=wh.ve;
J.version=J.version||{};J.version.game="1.1";function xh(a){this.Ha=this.depth=0;this.visible=!1;this.k=!0;this.bc=this.oo=!1;this.Fn=a;this.m=J.a.n.ve[J.a.n.ve.Vr[a]];this.Va=1;this.yi=this.Yd=this.Fe=0;this.xi=!1;W.Uu();W.nx(!0);J.c.vb(this,J.Eg);Pb(this);Rb(this,["game"])}e=xh.prototype;
e.xc=function(){var a=J.i.K("LevelStartHeader","<LevelStartHeader>"),b=J.i.K("LevelStartAssignment","<LevelStartAssignment>");new Ig(a,b,this.Pt,this);a=new $g;a.Bo=wh.ve;this.nb=new ah(a);this.nb.wx.wl(this.Fn+1);this.nb.Wg(0);this.nb.lf(this.m.m.O/this.m.m.time*100);this.nb.lf(this.m.m.P/this.m.m.time*100);this.nb.lf(this.m.m.R/this.m.m.time*100);this.nb.setTime(1E3*this.m.m.time);-1!==J.a.n.n.Bt&&(this.nb.Xo=J.a.n.n.Bt+1);this.nb.ej=0;this.oo=!0};e.Pt=function(){Jb({id:yh},50,this)};
function zh(a,b,c){var d,g;for(d=0;d<a.Wo.length;d++)if(g=a.Wo[d],g.F===b&&g.L===c)return g;return null}function Ah(a){var b,c=0;b=Sb(G,"tile");for(c;c<b.length;c++)a||Bh(b[c],!1),b[c].fk=!1,Ch(b[c])}e.lc=function(){H(G,this.nb);Vb();W.uq()};
e.Fb=function(a,b,c){if(!(0>=this.nb.getTime()||this.oo)){var d=this.kc;a=1-Z/($+Z);b-=d.X.x;c-=d.X.y;b/=$+Z;c/=$+Z;b%1>a||c%1>a?b=null:(b=Math.floor(b),c=Math.floor(c),b={F:b,L:c});if(null!==b){c=this.kc;a=b.F;b=b.L;var g;if(0<=a&&a<c.width&&0<=b&&b<c.height)if(d=c.vl,a=c.A[a][b],a===d)c.vl=null,pa("Tile Selected",{pc:{F:-1,L:-1}});else{if(null!==d)for(var h=0;h<c.se.length;h++){b=c.se[h];g=!1;if(b.start.id===d.id&&b.end.id===a.id)g=!0;else if(b.start.id===a.id&&b.end.id===d.id){g=!0;for(var k=b.path,
l=[],n=k.rd.length-1;0<=n;n--)l.push(k.rd[n]);k.rd=l;l=k.end;k.end=k.start;k.start=l}if(g){startTile=b.start;endTile=b.end;d=startTile.value;g=startTile;g.type="g_et";g.value=-1;g=endTile;g.type="g_et";g.value=-1;c.Il-=2;pa("Link Created",{path:b.path,start:startTile,end:endTile,value:d});Dh(c);c.vl=null;break}}if(-1===a.F||"g_et"!==a.type&&"g_bt"!==a.type)c.vl=a,pa("Tile Selected",{pc:a})}}}};
e.Tc=function(a,b){if("Link Created"===a){var c=b.start.ud,d=b.end.ud,g=this.kc,g=new Eh(b.path,b.type,{x:g.X.x,y:g.X.y},c,d,b.value),h=J.a.n.Tj.ns[Math.min(this.Fe,J.a.n.Tj.ns.length-1)],h=Math.ceil(h);this.Fe<J.a.n.Tj.max&&this.Fe++;this.Yd=1E3*J.a.n.Tj.time+g.totalTime;this.mf(h);Jb({id:Fh,start:c,end:d,cj:h,Fe:this.Fe},2*g.totalTime,this);this.yi=0;this.xi=!1;g=2*g.totalTime;0===this.kc.se.length&&(0===this.kc.Il?(Jb({id:Gh},this.Yd+4E3+g,this),Jb({id:xh.Et},this.Yd+g/2,this),this.nb.ej=0,this.bc=
!1):(Jb({id:Hh},this.Yd+1200+g/2,this),Jb({id:Ih},this.Yd+3E3+g,this)));Bh(c,!0);Bh(d,!0);Bh(c,!1);Bh(d,!1)}"Tile Selected"===a&&(Ah(),-1!==b.pc.F&&Bh(zh(this,b.pc.F,b.pc.L),!0),this.yi=0,this.xi&&(this.xi=!1))};e.Ck=function(){AudioHandler.lo()};e.Qq=function(){AudioHandler.Iw()};var Ih="lc_il",Gh="lc_iw",Gh="lc_ib",Hh="lc_nm",Fh="lc_ap",yh="lc_lc";
xh.prototype.wk=function(a){var b,c;if(a.id===Ih){AudioHandler.lo();var d=Math.max(10,Math.ceil(1E3*Math.ceil(this.nb.getTime()/1E3)/this.m.m.time));Jh({failed:!0,totalScore:d,level:this.Fn,submitScoreMethod:"submitSessionScore"})}if(a.id===Gh){var d=0,g=this.nb.getTime()/1E3;g>this.m.m.O&&(d=1);g>this.m.m.P&&(d=2);g>this.m.m.R&&(d=3);var h=this.Fn;b=this.nb;b=b.Kl(b.dj.za());AudioHandler.lo();Jh({failed:!1,stars:d,timeLeft:b,totalScore:g,level:h,submitScoreMethod:"submitSessionScore"})}if(a.id===
xh.Et){AudioHandler.ow();d=J.a.n.fw;d=[d.Xu,d.Jw,d.Yp,d.Yp];for(g=0;50>g;g++){var h=Math.floor(Math.random()*d.length),k=d[h];b=k.left+(k.right-k.left)*Math.random();k=k.top+(k.zm-k.top)*Math.random();console.log(h+"\t"+b.toFixed(1)+"\t"+k.toFixed(1));h=new Kh(b,k,1+g%25);h.ib=Math.floor(Math.random()*h.f.G);h.y+=K(183)}d=J.Ig+J.Kg/2+J.a.n.sc.X.x;g=J.Jg+J.pi/2+J.a.n.sc.X.y;W.Rh(W.fh,J.i.K("Congrats","<Congrats>"),d,g,d,g-200,3500)}a.id===Fh&&(d=(a.start.I.x+a.end.I.x)/2+$/2,g=(a.start.I.y+a.end.I.y)/
2+$/2,AudioHandler.hw(a.Fe),0<a.cj&&(h="",h=1===a.cj?J.i.K("TimeAddedSingle","<TimeAddedSingle>"+a.cj):J.i.K("TimeAddedMultiple","<TimeAddedMultiple>"+a.cj).replace("<TIME>",a.cj),W.Rh(W.fh,h,d,g,d,g-K(30),1200)));if(a.id===yh){d=0;do d++,this.kc=new Lh(this.m);while(!1===this.kc.Eo&&d<J.a.n.sc.rv);Vb();this.Wo=[];g=this.kc;d=[];for(h=0;h<g.width;h++)for(b=0;b<g.height;b++)k=g.A[h][b],"g_et"!==k.type&&d.push(k);for(g=0;g<d.length;g++){k=d[g];b=h=new Mh;c=k;b.pc=c;b.pc.ud=b;Ch(b);var l=c.L;b.F=c.F;
b.L=l;b.Ab("tt_in");c=this.kc;b=c.X.x+k.F*($+Z);c=c.X.y+k.L*($+Z);k=h;k.x=b;k.y=c;Qb(k,-k.x-k.y);this.Wo.push(h)}this.bc=!0;AudioHandler.nw();this.nb.ej=2;this.oo=!1}d=J.Ig+J.Kg/2+J.a.n.sc.X.x;g=J.Jg+J.pi/2+J.a.n.sc.X.y;a.id===Hh&&W.Rh(W.So,J.i.K("OutOfMoves","<OutOfMoves>"),d,g-30,d,g-70,1800)};xh.prototype.mf=function(a){a=this.nb.getTime()+1E3*a;a=Math.min(a,1E3*this.m.m.time);this.nb.setTime(a)};
xh.prototype.ld=function(a){this.canvas.ia=!0;if(this.bc){this.Va=Math.floor(this.nb.getTime()/1E3)/this.m.m.time;this.Va=Math.min(this.Va,.999);this.nb.Wg(100*this.Va);if(0>=this.nb.getTime()){Jb({id:Ih},2500,this);var b=J.Ig+J.Kg/2+J.a.n.sc.X.x,c=J.Jg+J.pi/2+J.a.n.sc.X.y;W.Rh(W.fh,J.i.K("TimeUp","<TimeUp>"),b,c-10,b,c-40,2E3);this.bc=!1}this.yi+=a;this.yi>1E3*J.a.n.n.Nu&&!this.xi&&0<this.kc.se.length&&(Ah(!0),this.xi=!0,b=this.kc,0===b.se.length?b=null:(c=Math.floor(Math.random()*b.se.length),b=
b.se[c]),zh(this,b.start.F,b.start.L).fk=!0,zh(this,b.end.F,b.end.L).fk=!0);0<this.Yd&&(this.Yd-=a,0>=this.Yd&&(1<this.Fe&&this.bc&&(AudioHandler.kw(),b=J.Ig+J.Kg/2+J.a.n.sc.X.x,c=J.Jg+J.pi/2+J.a.n.sc.X.y,W.Rh(W.fh,J.i.K("ComboEnd","<ComboEnd>"),b,c-10,b,c-40,1200)),this.Fe=0))}};xh.prototype.gb=function(){};
function Nh(a,b,c){this.depth=c;this.Ha=0;this.k=this.visible=!0;this.x=a;this.y=b;Pb(this);a=[];for(b=J.a.n.ve.Vr.length;b>J.a.n.Kn.Jn;)a.push(J.a.n.Kn.Jn),b-=J.a.n.Kn.Jn;a.push(b);J.a.n.He.ba=a;for(var d in N)N.hasOwnProperty(d)&&Oh.push(N[d]);for(d in tc)tc.hasOwnProperty(d)&&AudioHandler.am.push(tc[d]);for(d in uc)uc.hasOwnProperty(d)&&AudioHandler.Yl.push(uc[d]);for(d in O)O.hasOwnProperty(d)&&Ph.push(O[d]);for(d in P)P.hasOwnProperty(d)&&Qh.push(P[d]);AudioHandler.Gb();$=J.a.n.sc.Vx;Z=J.a.n.sc.Wx}
Nh.prototype.Mq=function(){var a,b,c;a=[];b=[Dd,Ed,Fd,Gd,Hd,Id];for(c=0;c<b.length;c++)a.push({f:b[c],text:J.i.K("TutorialText_"+(c+1),"<TutorialText_"+(c+1)+">"),title:J.i.K("TutorialHeader_"+(c+1),"<TutorialHeader_"+(c+1)+">")});return a};
function Lh(a){this.A=[];this.X={x:0,y:0};this.Hl={F:0,L:0};this.se=[];this.height=this.width=-1;this.Eo=!1;this.m=a;this.Il=0;this.kx=ia(ja,999999);this.js=new ha(this.kx);var b,c,d,g,h,k;b=c=99;d=g=-1;for(a=0;a<this.m.items.length;a++)k=this.m.items[a],h=k.x/50,k=k.y/50,h>d&&(d=h),k>g&&(g=k),h<b&&(b=h),k<c&&(c=k);this.width=d-b+1;this.height=g-c+1;this.Hl.F=b;this.Hl.L=c;a=Z+($+Z)*this.width;b=Z+($+Z)*this.height;this.X.x=J.Ig+(J.Kg-a)/2+Z;this.X.y=J.Jg+(J.pi-b)/2+Z;this.X.x+=J.a.n.sc.X.x;this.X.y+=
J.a.n.sc.X.y;this.X.x=Math.floor(this.X.x);this.X.y=Math.floor(this.X.y);this.A=Rh(this.width,this.height,null);for(a=0;a<this.width;a++)for(b=0;b<this.height;b++)this.A[a][b]={type:"g_et",value:-1,F:a,L:b,kc:this};for(a=g=0;a<this.m.items.length;a++)b=this.m.items[a],c=b.x/50-this.Hl.F,d=b.y/50-this.Hl.L,h={},h.F=c,h.L=d,h.id=g,h.kc=this,"tile"===b.id&&(g++,0===b.kind?(h.type="g_rt",h.value=-1):(h.type="g_nt",h.value=b.kind)),"block"===b.id&&(h.type="g_bt",h.value=-1),this.A[c][d]=h;this.Il=g;Sh(this);
Dh(this);this.vl=null}var $=1,Z=1,Oh=[];
function Sh(a){var b,c,d,g,h,k,l,n,q;b=[];for(d=1;d<=Oh.length;d+=5)b=b.concat(a.m.A["types_"+d.toString()]);c=Math.min(b.length,Oh.length);b.length=c;q=new Rg(b);Sg(q,new ha(999999*ia(a.js)));b=[];c=[];for(h=0;h<a.width;h++)for(k=0;k<a.height;k++)d=a.A[h][k],"g_rt"===d.type?b.push(d):"g_nt"===d.type&&c.push(d);for(h=0;0<b.length;){Th(b,999999*ia(a.js));for(d=0;d<c.length-1;d++)for(k=c[d],g=d+1;g<c.length;g++)l=c[g],k.value===l.value&&(n=Uh(a,k.F,k.L,l.F,l.L),n.valid&&(k.ki=!0,l.ki=!0,c.splice(g,
1),c.splice(d,1),d=0));k=b.pop();d=null;l=-1;g=[];for(d=0;d<b.length;d++)l=b[d],l.value===k.value&&(n=Uh(a,k.F,k.L,l.F,l.L),n.valid&&(2<Vh(n)||500<h)&&g.push({Zr:l,Ai:d,Eb:Vh(n)}));if(0===g.length&&500<h)for(d=0;d<b.length;d++)l=b[d],n=Uh(a,k.F,k.L,l.F,l.L),!n.valid||"g_rt"!==k.type&&"g_rt"!==l.type||g.push({Zr:l,Ai:d,Eb:Vh(n)});if(0===g.length){if(b.push(k),h++,1500<=h){a.Eo=!1;return}}else h=0,g.sort(function(a,b){return b.Eb-a.Eb}),d=g[0].Zr,l=g[0].Ai,"g_rt"===k.type&&"g_rt"===d.type?k.value=Tg(q)+
1:"g_rt"===k.type&&(k.value=d.value),d.value=k.value,"g_rt"===k.type&&(k.type="g_nt"),"g_rt"===d.type&&(d.type="g_nt"),k.ki=!0,d.ki=!0,b.splice(l,1)}for(h=0;h<a.width;h++)for(k=0;k<a.height;k++)a.A[h][k].ki=!1;a.Eo=!0}
function Dh(a){var b,c,d;d=Rh(a.width,a.height,!1);a.se=[];for(b=0;b<a.width;b++)for(c=0;c<a.height;c++){var g=b,h=c,k=d,l=void 0,n=void 0,q=void 0;k[g][h]=!0;q=a.A[g][h];if("g_nt"===q.type)for(l=0;l<a.width;l++)for(n=0;n<a.height;n++){var s=a.A[l][n];if(!k[l][n]&&s.value===q.value){var z=Uh(a,g,h,l,n);z.valid&&a.se.push({path:z,start:q,end:s})}}}}
function Uh(a,b,c,d,g){var h,k,l,n;h=Rh(a.width,a.height,!1);for(k=0;k<a.width;k++)for(l=0;l<a.height;l++)n=a.A[k][l],"g_et"===n.type||n.ki?h[k][l]=!0:k===b&&l===c?h[k][l]=!0:k===d&&l===g&&(h[k][l]=!0);a=new Wh;a.setStart(b,c);a.setEnd(d,g);var q,s;b=h.length;c=h[0].length;d=Rh(b+2,c+2,null);for(g=-1;g<b+1;g++)for(k=-1;k<c+1;k++)l=new Node(g,k),l.nj=0<=g&&g<b&&0<=k&&k<c?h[g][k]:!0,d[g+1][k+1]=l,g===a.start.F&&k===a.start.L&&(l.Ob=0,l.Eb=0),g===a.end.F&&k===a.end.L&&(s=l);var z;for(l=1;l<=J.a.n.n.sv+
1&&-1===s.Ob;){for(g=0;g<b+2;g++)for(k=0;k<c+2;k++)if(h=d[g][k],h.Ob===l-1){z=h.Eb;for(q=g+1;q<b+2;q++){z++;n=d[q][k];if(!n.nj)break;if(-1===n.Ob||n.Ob===l&&n.Eb>z)n.parent=h,n.Ob=l,n.Eb=z}z=h.Eb;for(q=g-1;0<=q;q--){z++;n=d[q][k];if(!n.nj)break;if(-1===n.Ob||n.Ob===l&&n.Eb>z)n.parent=h,n.Ob=l,n.Eb=z}z=h.Eb;for(q=k+1;q<c+2;q++){z++;n=d[g][q];if(!n.nj)break;if(-1===n.Ob||n.Ob===l&&n.Eb>z)n.parent=h,n.Ob=l,n.Eb=z}z=h.Eb;for(q=k-1;0<=q;q--){z++;n=d[g][q];if(!n.nj)break;if(-1===n.Ob||n.Ob===l&&n.Eb>z)n.parent=
h,n.Ob=l,n.Eb=z}}l++}if(-1!==s.Ob){h=s;do s=new Xh(h.F,h.L),a.rd.unshift(s),h=h.parent;while(null!==h);a.valid=!0}return a}function Xh(a,b){this.F=a|0;this.L=b|0}function Wh(){this.Po=0;this.start=new Xh(-1,-1);this.end=new Xh(-1,-1);this.rd=[];this.valid=!1}Wh.prototype.setStart=function(a,b){this.start=new Xh(a,b)};Wh.prototype.setEnd=function(a,b){this.end=new Xh(a,b)};function Yh(a){return a.Po<a.rd.length?a.rd[a.Po++]:null}
function Vh(a){var b,c=0;for(b=0;b<a.rd.length-1;b++)c+=Math.abs(a.rd[b].F-a.rd[b+1].F),c+=Math.abs(a.rd[b].L-a.rd[b+1].L);return c}function Node(a,b){this.nj=!1;this.F=a;this.L=b;this.Ob=-1;this.Eb=999;this.parent=null}function Rh(a,b,c){var d,g,h;h=[];for(d=0;d<a;d++)for(h[d]=[],g=0;g<b;g++)h[d][g]=c;return h}function Th(a,b){var c,d,g,h;void 0===b&&(b=Math.floor(999999*ja.random()));h=new ha(b);for(c=0;c<a.length;c++)d=Math.floor(h.random()*a.length),g=a[d],a[d]=a[c],a[c]=g}
function Eh(a,b,c,d,g,h){this.k=this.visible=!0;this.depth=-25E4;this.y=this.x=0;this.path=a;this.type=b;this.X=c;this.alpha=1;this.totalTime=0;Pb(this);J.c.vb(this,J.Eg);Rb(this,["game","item","line"]);this.Ba=[];this.Gd=this.fl=0;this.$j=[];this.La=d;this.Fa=g;this.yl=this.vq=!1;Zh(this);this.state=$h;this.ft=Yb(0,0,$,$);AudioHandler.qw();this.ay=h}var $h="tl_g";
function Zh(a){var b,c,d;a.path.Po=0;b=Yh(a.path);d=c=null;ai(a,b,me,-1,!0);a.La.I.x=b.F*($+Z)+a.X.x;for(a.La.I.y=b.L*($+Z)+a.X.y;null!==b;)d=c,c=b,b=Yh(a.path),null!==b&&(1<a.Ba.length&&ai(a,c,pe,1,!1,d,b),bi(a,c,b));ai(a,c,me,-1,!0);a.Fa.I.x=c.F*($+Z)+a.X.x;a.Fa.I.y=c.L*($+Z)+a.X.y;a.$j=a.Ba.concat([]);a.$j.sort(function(a,b){return a.depth-b.depth});a.Ba[0].abs={};a.Ba[0].abs.x=a.La.I.x+Z/2;a.Ba[0].abs.y=a.La.I.y+Z/2;a.Ba[a.Ba.length-1].abs={};a.Ba[a.Ba.length-1].abs.x=a.Fa.I.x+Z/2;a.Ba[a.Ba.length-
1].abs.y=a.Fa.I.y+Z/2}function ai(a,b,c,d,g,h,k){var l=0;g?l=90*Math.floor(4*Math.random()):(g=b.F-h.F,h=b.L-h.L,l=b.F-k.F,k=b.L-k.L,0!==g&&(g/=Math.abs(g)),0!==h&&(h/=Math.abs(h)),0!==l&&(l/=Math.abs(l)),0!==k&&(k/=Math.abs(k)),l=180/Math.PI*Math.atan2(-(h+k),g+l),l+=10*(Math.round(6*Math.random())-3),l-=90);a.Ba.push({type:"tl_b",F:b.F,L:b.L,time:125,visible:{start:0,end:0},rotation:l,cr:c,depth:d,ib:0});a.totalTime+=125}
function bi(a,b,c){var d;d=100+35*(Math.abs(c.F-b.F)+Math.abs(c.L-b.L));a.Ba.push({type:"tl_l",start:b,end:c,Nc:{F:c.F-b.F,L:c.L-b.L},time:d,visible:{start:0,end:0},depth:0});a.totalTime+=d}
Eh.prototype.Da=function(a){var b,c,d,g;for(g=0;g<this.Ba.length;g++)b=this.Ba[g],"tl_b"===b.type&&0!==b.visible.end&&b.ib<b.cr.G-1&&(b.ib+=a/1E3*20);this.state===$h&&(this.Gd+=a,b=this.Ba[this.fl],b.visible.end=mc(this.Gd,0,1,b.time),this.Gd>b.time&&(b.visible.end=1,this.fl++,this.Gd=0,Bh(this.Fa,!1)),this.fl>=this.Ba.length&&(this.state="tl_p",this.fl=0,this.La.Ab(ci.$l),this.Fa.Ab(ci.$l)));if("tl_p"===this.state){this.Gd+=a/1.5;var h=this.Fa.I.x,k=this.Fa.I.y,l=this.La.I.x,n=this.La.I.y;if(!this.yl||
200>this.Gd){c=this.Gd;for(g=0;0<c&&!this.yl;)b=this.Ba[g],d=Math.min(c,b.time),b.visible.start=lc(d,0,1,b.time),c-=d,g++,"tl_l"===b.type&&(this.La.I.x=(b.start.F+b.Nc.F*b.visible.start)*($+Z)+this.X.x,this.La.I.y=(b.start.L+b.Nc.L*b.visible.start)*($+Z)+this.X.y);c=this.Gd;for(g=0;0<c&&!this.vq;)b=this.Ba[this.Ba.length-1-g],d=Math.min(c,b.time),b.visible.end=lc(d,1,-1,b.time),c-=d,g++,"tl_l"===b.type&&(this.Fa.I.x=(b.end.F-b.Nc.F*(1-b.visible.end))*($+Z)+this.X.x,this.Fa.I.y=(b.end.L-b.Nc.L*(1-
b.visible.end))*($+Z)+this.X.y);this.Ba[0].visible={start:0,end:1};this.Ba[0].abs.x=this.La.I.x+Z/2;this.Ba[0].abs.y=this.La.I.y+Z/2;this.Ba[this.Ba.length-1].visible={start:0,end:1};this.Ba[this.Ba.length-1].abs.x=this.Fa.I.x+Z/2;this.Ba[this.Ba.length-1].abs.y=this.Fa.I.y+Z/2}else this.state="tl_o",this.La.Ab(di),this.Fa.Ab(di),AudioHandler.mw();if(!this.yl&&(bc(this.ft,this.La.I.x,this.La.I.y,this.ft,this.Fa.I.x,this.Fa.I.y)&&(this.vq=!0),b=this.Fa.I.x-this.La.I.x,c=this.Fa.I.y-this.La.I.y,b=Math.sqrt(b*
b+c*c),b<$+Z))for(this.yl=!0,h=this.Fa.I.x-h,k=this.Fa.I.y-k,l=this.La.I.x-l,n=this.La.I.y-n,0!==h&&(h/=Math.abs(h)),0!==k&&(k/=Math.abs(k)),0!==l&&(l/=Math.abs(l)),0!==n&&(n/=Math.abs(n));b<$+Z;)this.Fa.I.x-=h,this.Fa.I.y-=k,this.La.I.x-=l,this.La.I.y-=n,b=this.Fa.I.x-this.La.I.x,c=this.Fa.I.y-this.La.I.y,b=Math.sqrt(b*b+c*c)}"tl_o"===this.state&&(this.alpha-=a/250,0>=this.alpha&&(H(G,this),a=(this.La.I.y+this.Fa.I.y)/2+$/2,new Kh((this.La.I.x+this.Fa.I.x)/2+$/2-K(10)+Math.random()*K(20),a-K(10)+
Math.random()*K(20),this.ay)))};
Eh.prototype.gb=function(){var a,b,c,d,g,h,k,l=$/2;for(a=0;a<this.$j.length;a++)if(b=this.$j[a],0<b.visible.end)switch(b.type){case "tl_l":c=(b.start.F+b.Nc.F*b.visible.start)*($+Z)+this.X.x+l;d=(b.start.L+b.Nc.L*b.visible.start)*($+Z)+this.X.y+l;g=(b.end.F-b.Nc.F*(1-b.visible.end))*($+Z)+this.X.x+l;h=(b.end.L-b.Nc.L*(1-b.visible.end))*($+Z)+this.X.y+l;k=this.alpha;0>b.Nc.F?(b=Math.floor(c)-Math.floor(g),ne.hi(0,b,0,Math.floor(g),d-ne.height/2,b,ne.height,k)):0<b.Nc.F?ne.hi(0,0,0,c,d-ne.height/2,
g-c,ne.height,k):0>b.Nc.L?(b=d-Math.floor(h),oe.hi(0,0,b,c-oe.width/2,Math.floor(h),oe.width,b,k)):0<b.Nc.L&&oe.hi(0,0,0,c-oe.width/2,d,oe.width,h-d,k);break;case "tl_b":c=Math.max(0,b.visible.end-b.visible.start),k=(0+1*(.5>c?jc(c,0,.5,.5,3):jc(1-c,1,-.5,.5,3)))*this.alpha,c=b.F*($+Z)+this.X.x+l,d=b.L*($+Z)+this.X.y+l,void 0!==b.abs&&(c=b.abs.x+l,d=b.abs.y+l),b.cr.ya(Math.floor(b.ib),c,d,k,k,b.rotation,1)}};
function Mh(){this.k=this.visible=!0;this.L=this.F=this.y=this.x=0;this.offset={x:0,y:0};J.c.vb(this,J.Eg);Pb(this);Rb(this,["game","item","tile"]);this.f=this.pc=null;this.ib=0;this.scale=this.alpha=1;this.Zi=-1;this.fk=this.zi=!1;this.Ag=0;this.Rm=1;this.state=ei;this.V={};this.I={x:-1,y:-1}}var ei="tt_id",di="tt_pds",ci={};function Ch(a){"g_nt"===a.pc.type?a.f=Oh[a.pc.value-1]:"g_bt"===a.pc.type&&(a.f=le)}
Mh.prototype.Ab=function(a,b,c){if(this.state!==a||c)switch(b="undefined"!==typeof b?b:{},this.offset.x=0,this.ib=this.offset.y=0,this.scale=this.alpha=1,this.V={},this.state=a,this.state){case "tt_in":a=Math.abs(this.pc.F+.5-this.pc.kc.width/2)+Math.abs(this.pc.L+.5-this.pc.kc.height/2);a=150*Math.sqrt(a)+25*Math.random();this.V.na="undefined"!==typeof b.na?b.na:a;this.V.Am=4.5+Math.random();this.V.height=10*this.V.Am;this.V.Db=100*this.V.Am-200;this.V.totalTime=this.V.Db;this.alpha=0;break;case ci.$l:this.zi=
!1;break;case di:this.V.Wd="undefined"!==typeof b.Wd?b.Wd:24;this.f=re;this.Zi=-1E5-this.x-this.y;Qb(this,this.Zi);break;case "tt_ds":this.V.Wd="undefined"!==typeof b.Wd?b.Wd:20;this.f=se;this.scale=2;this.Zi=-1E5-this.x-this.y;Qb(this,this.Zi);break;case "tt_pr":this.V.Db="undefined"!==typeof b.time?b.time:100;this.V.duration="undefined"!==typeof b.time?b.duration:this.V.Db;break;case "tt_re":this.V.Db="undefined"!==typeof b.time?b.time:250,this.V.duration="undefined"!==typeof b.time?b.duration:
this.V.Db}};function Bh(a,b){b!==a.zi&&(a.zi=b,a.zi?AudioHandler.pw():AudioHandler.lw(),a.Ab(a.zi?"tt_pr":"tt_re"))}
Mh.prototype.ld=function(a){var b;this.Ag+=a;this.Rm=Math.min(1,1+.2*Math.sin(this.Ag/1200*Math.PI*2));1200<this.Ag&&(this.Ag-=1200);-1!==this.I.x&&(this.x=this.I.x,this.y=this.I.y,-1===this.Zi&&(b=-this.x-this.y,Qb(this,b)));switch(this.state){case "tt_in":this.V.na-=a;0>=this.V.na&&(this.V.Db-=a);a=this.V.totalTime-this.V.Db;b=this.offset;var c=-this.V.height,d=this.V.height,g=this.V.totalTime,h=g-a,k=this.V.Am,l=2,n,q,s;void 0===l&&(l=4);k=void 0===k?2:Math.sqrt(k);n=[1];for(q=s=1;q<l;q+=1)n.push(n[q-
1]*k),s+=n[q];s-=n[l-1]/2;k=Math.pow(n[l-1],2);h=h/g*s;for(q=g=0;q<l;q+=1)if(h>n[q])h-=n[q];else{g=n[q];break}b.y=c+d*(1+-1*(-4*Math.pow(h-g/2,2)+g*g)/k);this.alpha=Math.max(0,a/this.V.totalTime);0>=this.V.Db&&this.Ab(ei);break;case ci.$l:this.offset.x=2*Math.random()-1;this.offset.y=2*Math.random()-1;break;case di:this.ib+=a/1E3*this.V.Wd;this.ib>=this.f.G&&this.Ab("tt_ds");break;case "tt_ds":this.ib+=a/1E3*this.V.Wd;this.ib>=this.f.G&&H(G,this);break;case "tt_pr":this.V.Db-=a;a=mc(this.V.duration-
this.V.Db,0,5,this.V.duration);this.offset.x=a;this.offset.y=a;0>=this.V.Db&&(this.Ab(ei),this.offset.x=5,this.offset.y=5);break;case "tt_re":this.V.Db-=a,a=lc(this.V.duration-this.V.Db,5,-5,this.V.duration),this.offset.x=a+2*Math.random()-1,this.offset.y=a+2*Math.random()-1,0>=this.V.Db&&this.Ab(ei)}};
Mh.prototype.gb=function(){null!==this.f&&(this.f.ya(Math.floor(this.ib),this.x+K(this.offset.x),this.y+K(this.offset.y),this.scale,this.scale,0,this.alpha),this.fk&&te.ya(1,this.x+($+Z)/2,this.y+($+Z)/2,this.Rm,this.Rm,0,1))};
function Kh(a,b,c){this.k=this.visible=!0;this.depth=-25E4;this.x=a;this.y=b;this.Ai=fi[c-1];this.state=gi;this.f=Ph[this.Ai];this.$m=hi;this.Th=this.ib=0;this.sm=.9+.2*Math.random();this.scale={x:1,y:1};.5>Math.random()&&(this.scale.x*=-1);0>this.x?this.scale.x=1:this.x>2*J.Kg&&(this.scale.x=-1);Pb(this);J.c.vb(this,J.Eg);Rb(this,["game","item","bird"])}
var fi=[0,2,3,3,0,1,3,1,2,2,3,3,0,1,1,0,2,2,1,2,0,1,3,2,3,2],hi=[.06,.06,.06,.06,.06,.06,.06,.06,.12,.06,.06,.06],ii=[.1,.05,.05,.1,.1,.05,.05,.05],Ph=[],Qh=[],gi="tb_i",ji={};
Kh.prototype.ld=function(a){this.Th+=a/1E3*this.sm;this.Th>this.$m[this.ib]&&(this.Th-=this.$m[this.ib],this.ib++);"tb_l"===this.state&&(this.x+=.24*a*this.scale.x*this.sm,this.y-=.06*a*this.sm,(-100>this.x||-100>this.y)&&H(G,this));this.ib>=this.f.G&&(this.state===gi&&(this.f=Qh[this.Ai],this.$m=ii,this.x+=this.scale.x*K(142),this.y-=K(183),this.state="tb_l"),this.ib=0)};Kh.prototype.gb=function(){this.state!==ji.jy&&this.f.ya(this.ib,this.x,this.y,this.scale.x,this.scale.y,0,1)};
AudioHandler={we:{},am:[],Yl:[],Gb:function(){},update:function(){},hw:function(){var a=Math.floor(Math.random()*AudioHandler.Yl.length);E.play(AudioHandler.Yl[a])},pw:function(){E.play(Ze)},lw:function(){E.play(Ye)},nw:function(){E.play($e)},ow:function(){E.play(Xe)},hA:function(){E.play(af)},kw:function(){E.play(bf)},qw:function(){var a=Math.floor(Math.random()*AudioHandler.am.length);E.play(AudioHandler.am[a])},mw:function(){E.play(cf)},XA:function(){},lo:function(){-1!==AudioHandler.we.Vo&&E.pause(AudioHandler.we.Vo);
-1!==AudioHandler.we.gp&&E.pause(AudioHandler.we.gp)},Iw:function(){-1!==AudioHandler.we.Vo&&E.Pf(AudioHandler.we.Vo);-1!==AudioHandler.we.gp&&E.Pf(AudioHandler.we.gp)}};wh=wh||{};X={Ta:K(0),Ua:K(0)};
wh.ve={Ha:J.Dg,background:{Cn:K(0),Dn:K(34),elements:[{S:"game_ui_LEVEL",x:K(28)+X.Ta,y:K(240)+X.Ua,kb:K(100),mb:K(50),oc:.2,font:U,Rc:{fillColor:"#ed7b45",fontSize:K(20),jd:"lower",align:"center",h:"top"}},{S:"game_ui_time_left",x:K(28)+X.Ta,y:K(350)+X.Ua,kb:K(100),mb:K(40),oc:.2,font:U,Rc:{fillColor:"#bd5332",fontSize:K(15),jd:"lower",align:"center",h:"top"}}]},Va:{x:K(77)+X.Ta,y:K(172)+X.Ua,mc:he,round:!0,color:"#73a1ff",Nj:"#73a1ff",Kj:"#73a1ff",H:{so:K(73)}},Fo:{x:K(42)+X.Ta,y:K(258)+X.Ua,kb:K(72),
mb:K(30),Jl:50,oc:.2,lh:!1,separator:"",font:U,Rc:{fontSize:K(32),fillColor:"#ed7b45",align:"center",h:"top"}},time:{x:K(18)+X.Ta,y:K(376)+X.Ua,kb:K(120),mb:K(46),oc:.2,lh:!1,separator:"",font:U,Rc:{fontSize:K(38),fillColor:"#bd5332",align:"center",h:"top"}},mo:{x:K(28)+X.Ta,y:K(492)+X.Ua}};bh=wh.ve;J.version=J.version||{};J.version.theme="1.1";J.version=J.version||{};J.version.configuration_poki_api="1.0.0";J.j=J.j||{};J.j.ci=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
J.j.oq=function(a,b,c,d){var g={};J.j.ci(a.zj,g);g.fontSize=K(18);d=J.c.g(a.Lh,d.height,K(22));d=a.Jh-d;var h=J.i.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.Bj,a.Lh,a.Aj,K(22)),k=c(we,a.Mh,k-28),k=k+K(6),g={};J.j.ci(a.Nh,g);g.fontSize=K(18);k=b("CoolGames\nwww.coolgames.com",g,a.lg,k,a.jf,K(44));C(S.T(),g);k+=K(58)+Math.min(0,d-K(368));g={};J.j.ci(a.zj,g);g.fontSize=K(20);g.fillColor="#1A2B36";h=J.i.K("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.Bj,
k,a.Aj,K(22));k+=K(6);k=c(xe,a.Mh,k);k+=K(12);g={};J.j.ci(a.Nh,g);g.fontSize=K(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.lg,k,a.jf,K(22));k+=K(16);g={};J.j.ci(a.Nh,g);b("\u00a9 2020",g,a.lg,k,a.jf,K(44));return[]};J.j.si=function(){return[]};J.j.Lc=function(){J.e.Lc()};
J.j.yk=function(){function a(){__flagPokiInitialized?(function(){       /*function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})()        */  }(),J.e.Lc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=J.a.u.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};J.j.Ok=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};J.j.zk=function(){PokiSDK.gameLoadingFinished();J.e.Lc()};
J.j.ts=function(a){try{J.e.zn(),ob("master"),PokiSDK.commercialBreak().then(function(){J.e.ti();pb("master");a()})["catch"](function(a){console.log("error"+a);J.e.ti();pb("master")})}catch(b){console.log("error"+b),J.e.ti()}};J.j.fr=function(){J.j.ts(function(){PokiSDK.gameplayStart()})};J.j.Og=function(){J.j.ts(function(){J.e.Lc()})};J.j.sz=function(){PokiSDK.happyTime(.5)};J.j.er=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
J.j.Lq=function(a,b){void 0===J.e.he&&(J.e.he=new mf(!0));nf(a,b)};J.j.bp=function(a){void 0===J.e.he&&(J.e.he=new mf(!0));of(a)};J.j.nd=function(a){window.open(a)};J.j.je=function(a){"inGame"===a&&PokiSDK.gameplayStop()};J.j.eu=function(a){"inGame"===a&&PokiSDK.gameplayStart()};J.j.Tu=function(){};J=J||{};J.Gp=J.Gp||{};J.Gp.yy={My:""};
function ki(){this.depth=-1E6;this.k=this.visible=!0;this.Ha=J.de;this.end=this.oa=this.Hn=this.Gn=this.load=this.Gb=!1;this.Xm=0;this.hp=this.mj=!1;this.state="GAME_INIT";this.screen=null;this.Sr=this.qb=this.C=0;this.Ym=!1;this.Mk=this.Nk=!0;this.Wv=1;this.gd=!1;this.Cc={};this.ja={difficulty:1,playMusic:!0,playSFX:!0,language:J.i.pn()};window.addEventListener("gameSetPause",this.zn,!1);window.addEventListener("gameResume",this.ti,!1);document.addEventListener("visibilitychange",this.Mu,!1);this.bg=
"timedLevelEvent"}e=ki.prototype;e.zn=function(){E.pause("master");G.pause()};e.ti=function(){E.Pf("master");yb(G);Eb(G);Ib(G);G.Pf()};e.Mu=function(){document.hidden?J.e.zn():J.e.ti()};
e.fm=function(){var a,b=this;void 0!==J.a.W.background&&void 0!==J.a.W.background.color&&(document.body.style.background=J.a.W.background.color);J.Ja=new uf;J.w.Dk&&J.w.Dk.k&&(b.qt=Pg(function(a){b.qt=a}));J.l=J.a.n.He||{};J.l.Fd=J.l.Fd||"level";J.l.Sf=void 0!==J.l.Sf?J.l.Sf:"level"===J.l.Fd;J.l.ba=void 0!==J.l.ba?J.l.ba instanceof Array?J.l.ba:[J.l.ba]:[20];J.l.zg=void 0!==J.l.zg?J.l.zg:"locked";J.l.Ti=void 0!==J.l.Ti?J.l.Ti:"difficulty"===J.l.Fd;J.l.kj=void 0!==J.l.kj?J.l.kj:!1;J.l.Do=void 0!==
J.l.Do?J.l.Do:"level"===J.l.Fd;J.l.xg=void 0!==J.l.xg?J.l.xg:"max";J.l.zo=void 0!==J.l.zo?J.l.zo:"number";J.j.Lq(null,function(a){var d,g,h;a&&(b.Cc=a);b.ja=wf("preferences",{});b.ja.difficulty=void 0!==b.ja.difficulty?b.ja.difficulty:1;void 0!==J.l.Vs&&0>J.l.Vs.indexOf(Lf())&&(b.ja.difficulty=J.l.Vs[0]);b.ja.playMusic=void 0!==b.ja.playMusic?b.ja.playMusic:!0;b.Nf(b.ja.playMusic);b.ja.playSFX=void 0!==b.ja.playSFX?b.ja.playSFX:!0;b.jl(b.ja.playSFX);b.ja.language=void 0!==b.ja.language&&J.i.Wu(b.ja.language)?
b.ja.language:J.i.pn();J.i.qs(b.ja.language);void 0===Uf(b.C,0,"state",void 0)&&li(b.C,0,"state","unlocked");if(J.l.Sf)if("locked"===J.l.zg)for(h=!1,d=0;d<J.l.ba.length;d++){for(a=0;a<J.l.ba[d];a++)if(g=Uf(d,a,"state","locked"),"locked"===g){b.C=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.ja.lastPlayed&&(b.C=b.ja.lastPlayed.world||0)});b.kh=mi();void 0!==b.kh.authToken&&void 0!==b.kh.challengeId&&(b.gd=!0);J.w.jB&&(this.Nb=this.fB?new TestBackendServiceProvider:new BackendServiceProvider,
this.Nb.gr(function(a){a&&J.e.Nb.xz(b.kh.authToken)}));a=parseFloat(m.q.version);E.Xa&&(m.Sa.ip&&m.q.Xk||m.q.bh&&a&&4.4>a)&&(E.xj=1);this.Gb=!0;this.Ek=0};function mi(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function ni(a){a.state="GAME_LOAD";a.screen=new Ff(function(){J.e.load=!0;Fg(J.e,!0);J.xd.zk();J.j.zk()},function(a){J.xd.Ok(a);J.j.Ok(a)},J.w.TA)}
function Fg(a,b){a.mj=b||!1;a.hp=!0;a.Xm++}
function oi(){var a=J.e;a.Xm--;switch(a.state){case "GAME_INIT":a.Gb&&!a.lB&&(a.gd&&a.Nb&&a.Nb.VA(a.kh.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Co&&a.screen.Co("challengeLoadingError_notValid")}),ni(a));break;case "GAME_LOAD":if(a.load){if(a.gd&&a.Nb)if(a.Nb.Vu())Jf(a),Mf(a.Ec.mode);else{a.screen.Co("challengeLoadingError_notStarted");break}H(G,a.screen);"function"===typeof Nh&&(J.n=new Nh);void 0!==J.w.Tp&&!1!==J.w.Tp.show&&J.c.Rt();Eg(a)}break;case "LEVEL_INIT":a.Gn&&pi(a);
break;case "LEVEL_LOAD":a.Hn&&qi(a);break;case "LEVEL_END":if(a.oa)switch(Dg(),J.e.Gn=!1,J.e.Hn=!1,J.m=void 0,J.c.Df(J.Hq).ia=!0,J.c.Df(J.uk).ia=!0,J.e.nr){case "retry":Qf(J.e,J.e.qb);break;case "next":J.l.Sf?J.e.qb+1<J.l.ba[J.e.C]?Qf(J.e,J.e.qb+1):J.e.C+1<J.l.ba.length?Qf(J.e,0,J.e.C+1):J.l.Do?(J.e.state="GAME_END",J.e.end=!0,Fg(J.e,!1),J.j.Iu()):J.e.screen=new Pf:Qf(J.e,0);break;case "exit":J.l.Sf?J.e.screen=new Pf:Eg(J.e)}break;case "GAME_END":a.end&&(a.end=!1,J.e.screen=null,J.e.screen=new Hg)}}
e.Lc=function(){J.e.hp=!1};function yg(){var a;if(void 0!==J.e.kh.more_games)try{return a=decodeURIComponent(J.e.kh.more_games),function(){J.j.nd(a)}}catch(b){}if("string"===typeof J.Ug.moreGamesUrl&&""!==J.Ug.moreGamesUrl)return function(){J.j.nd(J.Ug.moreGamesUrl)};if(void 0!==J.w.Qv)return function(){J.j.nd(J.w.Qv)};if("function"===typeof J.j.Lu)return J.j.Lu}function Jf(a){if(a.gd&&void 0!==a.Nb)return void 0===a.Ec&&(a.Ec=a.Nb.nz()),a.Ec}e.ni=function(a){J.e.gd&&J.e.Nb&&J.e.Nb.ni(a)};
e.$h=function(a){J.e.gd&&J.e.Nb&&J.e.Nb.$h(a)};function Lf(){return J.e.ja.difficulty}function Cg(){switch(Lf()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+Lf();}}function gh(){var a="optionsDifficulty_"+Cg();return J.i.K(a,"<"+a+">")}function Mf(a){J.e.ja.difficulty=a;yf("preferences",J.e.ja)}e.Nf=function(a){void 0!==a&&(J.e.ja.playMusic=a,yf("preferences",J.e.ja),a?pb("music"):ob("music"));return J.e.ja.playMusic};
e.jl=function(a){void 0!==a&&(J.e.ja.playSFX=a,yf("preferences",J.e.ja),a?(pb("game"),pb("sfx")):(ob("game"),ob("sfx")));return J.e.ja.playSFX};e.language=function(a){void 0!==a&&(J.e.ja.language=a,yf("preferences",J.e.ja));return J.e.ja.language};function li(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===J.e.Cc["level_"+a+"_"+b]&&(J.e.Cc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?J.e.Cc["level_"+a+"_"+b][g]=d:J.e.Cc["level_"+a+"_"+b][g][c]=d;J.j.bp(J.e.Cc)}
function Uf(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=J.e.Cc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function wf(a,b){var c,d;"game"!==c&&(c="tg");d=J.e.Cc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function yf(a,b){var c;"game"!==c&&(c="tg");void 0===J.e.Cc.game&&(J.e.Cc.game={tg:{},game:{}});void 0===a?J.e.Cc.game[c]=b:J.e.Cc.game[c][a]=b;J.j.bp(J.e.Cc)}
function ag(a,b,c){var d=J.e;void 0===b&&(b=d.qb);void 0===c&&(c=d.C);return void 0===a?Uf(c,b,"stats",{}):Uf(c,b,"stats",{})[a]}function Qg(){var a=ag("highScore",void 0,void 0);return"number"!==typeof a?0:a}function ri(){var a,b,c,d=0;for(a=0;a<J.l.ba.length;a++)for(b=0;b<J.l.ba[a];b++)c=ag(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function Eg(a){a.screen&&H(G,a.screen);a.screen=new If;a.qb=-1}
function ph(a,b,c,d){var g;g=void 0!==J.a.W.Bi&&void 0!==J.a.W.Bi.backgroundImage?J.a.W.Bi.backgroundImage:void 0!==J.a.u.Bi?J.a.u.Bi.backgroundImage:void 0;J.c.Kb(J.Bf);a=a||0;b=b||0;c=c||p.width;d=d||p.height;if(g)if(c=Math.min(Math.min(c,p.width),g.ai),d=Math.min(Math.min(d,p.height),g.wg),void 0!==g){var h=a,k=b-J.Rp,l,n,q;for(l=0;l<g.G;l+=1)n=l%g.Tg*g.width,q=g.height*Math.floor(l/g.Tg),n>h+c||n+g.width<h||q>k+d||q+g.height<k||g.va(l,h-n,k-q,c,d,a,b,1)}else ta(a,b,c,d,"white",!1)}
function Qf(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.C=c);a.qb=b;a.Gn=!0;Fg(a,!1);J.j.Ju()}function pi(a){a.state="LEVEL_LOAD";a.Hn=!0;Fg(a,!1);J.j.Ku()}
function qi(a){var b,c=0;if(a.C<J.l.ba.length&&a.qb<J.l.ba[a.C]){a.state="LEVEL_PLAY";a.Sr+=1;a.oa=!1;a.screen=null;ph(0,J.Rp);b=J.Ja;var d=Bg(a,3),g="progression:levelStarted:"+Cg(),h=a.bg,k;for(k=0;k<b.fa.length;k++)if(!b.fa[k].k){b.fa[k].p=0;b.fa[k].paused=0;b.fa[k].k=!0;b.fa[k].su=d;b.fa[k].gw=g;b.fa[k].tag=h;break}k===b.fa.length&&b.fa.push({k:!0,p:0,paused:0,su:d,gw:g,tag:h});b.ab(d,g,void 0,J.ha.rc.qp);b.ab("Start:","progression:levelStart:"+d,void 0,J.ha.rc.pj);for(b=0;b<a.C;b++)c+=J.l.ba[b];
J.j.fr(a.C,a.qb);a.ja.lastPlayed={world:a.C,level:a.qb};J.m=new xh(c+a.qb)}}function Vf(a,b,c){var d=0;void 0===b&&(b=a.C);void 0===c&&(c=a.qb);for(a=0;a<b;a++)d+=J.l.ba[a];return d+c}function Bg(a,b){var c,d=a.qb+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function Jh(a){function b(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===J.l.xg&&a>b||"min"===J.l.xg&&a<b?!0:!1}var c=J.e;c.state="LEVEL_END";var d,g,h,k,l,n,q={},s=Bg(c,3);a=a||{};a.level=J.l.kj?c.qb+1:Vf(c)+1;a.dr=!1;g=(d=Uf(c.C,c.qb,"stats",void 0))||{};if(void 0!==a.Ed||void 0!==a.Bb){void 0!==a.Ed&&(q[a.Ed.id]=a.Ed.T(),"highScore"===a.Ed.id&&(n=a.Ed));if(void 0!==a.Bb)for(k=0;k<a.Bb.length;k++)q[a.Bb[k].id]=a.Bb[k].T(),"highScore"===a.Bb[k].id&&(n=a.Bb[k]);for(k in q)l=q[k],void 0!==
l.af&&(q[l.Cl].Oc=l.af(q[l.Cl].Oc));void 0!==q.totalScore&&(h=q.totalScore.Oc)}else h=a.totalScore,void 0!==h&&void 0!==a.timeBonus&&(h+=a.timeBonus);k="";if(!0!==a.failed){k="Complete:";if(void 0!==h){J.Ja.ab(k,"level:"+s,h,J.ha.rc.pj);if(void 0===d||b(h,d.highScore))g.highScore=h,a.dr=!0,J.Ja.ab("highScore",":score:"+Cg()+":"+s,h,J.ha.rc.Zl);void 0!==n&&(n.Oc=g.highScore);a.highScore=g.highScore}if(void 0!==a.stars){if(void 0===g.stars||g.stars<a.stars)g.stars=a.stars;J.Ja.ab("stars",":score:"+
Cg()+":"+s,a.stars,J.ha.rc.Zl)}c.qb+1<J.l.ba[c.C]?"locked"===Uf(c.C,c.qb+1,"state","locked")&&li(c.C,c.qb+1,"state","unlocked"):c.C+1<J.l.ba.length&&"locked"===Uf(c.C+1,0,"state","locked")&&li(c.C+1,0,"state","unlocked");li(c.C,c.qb,void 0,{stats:g,state:"played"});void 0!==c.Nb&&(d=J.n&&J.n.Du?J.n.Du():ri(),void 0!==d&&c.Nb.eB(d,J.l.zo));Af(J.Ja,c.bg,s,"progression:levelCompleted:"+Cg())}else J.Ja.ab("Fail:","level:"+s,h,J.ha.rc.pj),Af(J.Ja,c.bg,s,"progression:levelFailed:"+Cg());var z={totalScore:h,
level:a.level,highScore:a.highScore,failed:!0===a.failed,stars:a.stars,stage:a.stage},c=function(a){J.e.oa=!0;J.e.nr=a;Fg(J.e,!0);J.j.Og(z);J.xd.Og(z)};J.j.Um&&J.j.Um();void 0===a.customEnd&&new bg(J.l.Fd,a,c)}e.Ui=function(){J.e.je(!0)};e.je=function(a,b,c){var d="inGame";J.e.screen instanceof If?d="startScreen":J.e.screen instanceof Pf?d="levelMapScreen":b&&(d=J.e.Ec.iq===J.e.Ec.Hm?"inGame_challenger":"inGame_challengee");J.e.Vd||(J.e.Vd=new vg(d,!0===a,b,c))};
function uh(a){var b=[],c,d,g,h,k;J.e.Vd||J.e.ze||(J.e.Ec.iq===J.e.Ec.Hm?(c=J.i.K("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",g="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=J.i.K(b,"<"+b.toUpperCase()+"<");J.e.ze&&Mg(b);a&&og()},h=function(){J.e.$h(k);return!0}):(c=J.i.K("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",g="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=J.i.K(b,"<"+b.toUpperCase()+"<");if(J.e.ze&&(Mg(b),a)){var b=J.i.K("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",J.e.Ec.iA[J.e.Ec.Hm]),b=b.replace("<AMOUNT>",J.e.Ec.kB),c=J.e.ze,d,g,h,k;d=S.T();c.a.Os&&C(d,c.a.Os);g=Ua(d,b,c.a.zw,c.a.yw,!0);g<d.fontSize&&D(d,g);g=d.ka(b,c.a.ro)+10;h=d.ca(b,c.a.qo)+10;k=J.c.xa(c.a.Aw,c.d.f.width,g,d.align);h=J.c.xa(c.a.Bw,c.d.f.height-Lg(c),h,d.h);y(c.d.f);d.r(b,
k,h,g);A(c.d.f)}a&&og()},h=function(){J.e.ni(k);return!0}),b.push({S:d,aa:h,ra:J.e}),b.push({S:g,aa:function(){J.e.ze.close();J.e.ze=null;return!0}}),J.e.ze=new Kg(c,b,a),J.e.Vd=J.e.ze)}e.no=function(){var a,b;b=Sb(G,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].Ck&&b[a].Ck();Bf();Tb("game");Kb()};function og(a){var b,c;c=Sb(G);for(b=0;b<c.length;b++)"function"===typeof c[b].Ck&&c[b].Ck();Tb();Kb();Bf();a&&(a.M=Math.max(0,a.M-1));Ub("system")}
function ug(){var a,b;b=Sb(G);for(a=0;a<b.length;a++)"function"===typeof b[a].Qq&&b[a].Qq();Ub();a=G;for(b=0;b<a.Mb.length;b+=1)a.Mb[b].paused=Math.max(0,a.Mb[b].paused-1);a=J.Ja;b=J.e.bg;var c;for(c=0;c<a.fa.length;c++)void 0!==a.fa[c]&&a.fa[c].tag===b&&(a.fa[c].paused-=1,a.fa[c].paused=Math.max(a.fa[c].paused,0))}function Dg(){var a;J.m&&H(G,J.m);for(a=Sb(G,"LevelStartDialog");0<a.length;)H(G,a.pop())}
function zf(){var a="";J.version.builder&&(a=J.version.builder);J.version.tg&&(a+="-"+J.version.tg);J.version.game&&(a+="-"+J.version.game);J.version.config&&(a+="-"+J.version.config);return a}e.xc=function(){this.Gb||(this.fm(),Fg(J.e,!0),J.xd.yk(),J.j.yk())};
e.Da=function(a){"function"===typeof this.Gq&&(this.Gq(),this.Gq||J.e.Lc());0<this.Xm&&(this.mj||this.hp||oi());700>this.Ek&&(this.Ek+=a,700<=this.Ek&&(J.w.iB&&void 0!==J.w.oi&&J.w.oi.qk&&J.w.oi.ul&&J.Ja.start([J.w.oi.qk,J.w.oi.ul]),void 0===Uf(this.C,0,"state",void 0)&&li(this.C,0,"state","unlocked")))};e.Tc=function(a,b){"languageSet"===a&&J.e.language(b)};e.ld=function(){var a,b;for(a=0;a<J.Xd.length;a++)b=J.Xd[a],b.ia&&(p.Kb(b),p.clear())};
e.gb=function(){var a;for(a=0;a<J.Xd.length;a++)J.Xd[a].ia=!1};J.Cx=function(){J.e=new ki;Pb(J.e);Rb(J.e,"system")};(void 0===J.Tt||J.Tt)&&J.j.Hu();ki.prototype.je=function(a,b,c){var d="inGame";J.e.screen instanceof If?d="startScreen":J.e.screen instanceof Pf?d="levelMapScreen":b&&(d=J.e.Ec.iq===J.e.Ec.Hm?"inGame_challenger":"inGame_challengee");J.j.je(d);J.e.Vd||(J.e.Vd=new vg(d,!0===a,b,c))};vg.prototype.close=function(){H(G,this);this.canvas.ia=!0;J.j.eu(this.type);return!0};
Ya.prototype.Id=function(a,b){var c,d,g,h=1,k=cb(this,a);this.Za[a]=b;this.uc[a]&&delete this.uc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ta.indexOf(a)){for(g=0;g<d.ta.length;g+=1)void 0!==this.Za[d.ta[g]]&&(h*=this.Za[d.ta[g]]);h=Math.round(100*h)/100;if(this.jb){if(d=this.Sd[d.id])d.gain.value=h}else this.Xa&&(d.J.volume=h)}this.jb&&(d=this.Sd[a])&&(d.gain.value=b)};
}());
