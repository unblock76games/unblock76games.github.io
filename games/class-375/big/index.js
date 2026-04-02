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
var e,aa=document.getElementById("canvasBackground"),ba="big game_bubbletime theme_plain gameui_endless endscreen_endless landscape poki_api final".split(" ");function ca(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var da=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=ca(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=ca(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),f=!d&&/[^-]mobi/i.test(this.userAgent);this.r={};this.$a={};this.Tf={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.r.opera=!0,this.r.version=c||ca(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.$a.Fp=!0,this.r.sl=!0,this.r.version=ca(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.r.sl=!0,this.r.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.r.tz=!0,this.r.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.r.chrome=!0,this.r.version=ca(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.r.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.r.eB=!0,this.r.version=ca(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.r.tB=!0,this.r.version=ca(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.r.er=!0,this.r.version=ca(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.$a.Dz=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.r.Xs=!0,this.r.version=ca(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.r.Eh=!0,this.r.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.r.KA=!0,this.r.version=ca(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.r.oq=!0,this.r.version=
c||ca(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.r.du=!0,this.r.version=c||ca(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.Tf.SB=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.r.mq=!0,this.r.version=ca(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.r.vy=!0,this.r.version=ca(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&
(this.name="Safari",this.r.Yo=!0,this.r.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.r.XB=!0,!this.r.version&&c&&(this.r.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.r.Lz=!0,this.r.version=this.r.version||ca(this,/gecko\/(\d+(\.\d+)?)/i));b||this.Xs?this.$a.Ky=!0:a&&(this.$a.cl=!0);c="";a?(c=ca(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=ca(this,/android[ \/-](\d+(\.\d+)*)/i):this.Fp?
c=ca(this,/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.du?c=ca(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.oq?c=ca(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.mq?c=ca(this,/bada\/(\d+(\.\d+)*)/i):this.vy&&(c=ca(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.$a.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!f)||this.Xs)this.Tf.vt=!0;else if(f||"iphone"==a||"ipod"==a||b||this.oq||this.du||this.mq)this.Tf.qs=!0;this.Ze={ad:!1,ui:!1,x:!1};this.sl&&10<=this.r.version||this.chrome&&20<=this.r.version||
this.er&&20<=this.r.version||this.Yo&&6<=this.r.version||this.opera&&10<=this.r.version||this.cl&&this.$a.version&&6<=this.$a.version.split(".")[0]?this.Ze.ad=!0:this.sl&&10>this.r.version||this.chrome&&20>this.r.version||this.er&&20>this.r.version||this.Yo&&6>this.r.version||this.opera&&10>this.r.version||this.cl&&this.$a.version&&6>this.$a.version.split(".")[0]?this.Ze.ui=!0:this.Ze.x=!0;try{this.r.Ne=this.r.version?parseFloat(this.r.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.r.Ne=0}try{this.$a.Ne=
this.$a.version?parseFloat(this.$a.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.$a.Ne=0}};function g(a,b){this.x=a;this.y=b}function ea(a,b){return new g(b*Math.cos(Math.PI*a/180),-b*Math.sin(Math.PI*a/180))}e=g.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.direction=function(){return 180*Math.atan2(-this.y,this.x)/Math.PI};e.S=function(){return new g(this.x,this.y)};e.add=function(a){return new g(this.x+a.x,this.y+a.y)};
e.Vb=function(a){return new g(this.x-a.x,this.y-a.y)};e.scale=function(a){return new g(a*this.x,a*this.y)};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new g(a*this.x+b*this.y,-b*this.x+a*this.y)};e.Sf=function(a){return this.x*a.x+this.y*a.y};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new g(0,0):new g(this.x/a,this.y/a)};function fa(a){return(new g(a.y,-a.x)).normalize()}
e.sc=function(a,b,c){var d=Math.min(8,this.length()/4),f=this.Vb(this.normalize().scale(2*d)),h=f.add(fa(this).scale(d)),d=f.add(fa(this).scale(-d)),k=m.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+f.x,b+f.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+f.x,b+f.y);k.stroke()};function ga(a){this.ej=4294967296;this.ad=1664525;this.ui=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.ej-1)):a}
ga.prototype.S=function(){var a=new ga;a.ej=this.ej;a.ad=this.ad;a.ui=this.ui;a.state=this.state;return a};ga.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.ad*this.state+this.ui)%this.ej;return this.state/this.ej*b};function ha(a,b){var c=1;void 0!==b&&(c=b);return Math.floor(a.random(c+1))}new ga;function ia(){this.Qe="";this.Im=[];this.gi=[];this.zf=[];this.Gg=[];this.Zc=[];this.Y("start");this.Y("load");this.Y("game")}
function ja(a){var b=ka;b.Qe=a;""!==b.Qe&&"/"!==b.Qe[b.Qe.length-1]&&(b.Qe+="/")}e=ia.prototype;e.Y=function(a){this.Zc[a]||(this.gi[a]=0,this.zf[a]=0,this.Gg[a]=0,this.Zc[a]=[],this.Im[a]=!1)};e.loaded=function(a){return this.Zc[a]?this.zf[a]:0};e.kd=function(a){return this.Zc[a]?this.Gg[a]:0};e.complete=function(a){return this.Zc[a]?this.zf[a]+this.Gg[a]===this.gi[a]:!0};function la(a){var b=ka;return b.Zc[a]?100*(b.zf[a]+b.Gg[a])/b.gi[a]:100}
function ma(a){var b=ka;b.zf[a]+=1;b.complete(a)&&oa("Load Complete",{ab:a})}function pa(a){var b=ka;b.Gg[a]+=1;oa("Load Failed",{ab:a})}function qa(a,b,c){var d=ka;d.Zc[b]||d.Y(b);d.Zc[b].push(a);d.gi[b]+=c}e.ce=function(a){var b;if(!this.Im[a])if(this.Im[a]=!0,this.Zc[a]&&0!==this.Zc[a].length)for(b=0;b<this.Zc[a].length;b+=1)this.Zc[a][b].ce(a,this.Qe);else oa("Load Complete",{ab:a})};var ka=new ia;function ra(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.sa(a)}
ra.prototype.sa=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};ra.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function sa(a,b,c,d,f,h){var k=m;k.context.save();!1===h?(k.context.fillStyle=f,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=f,k.context.strokeRect(a,b,c,d)):(void 0!==f&&(k.context.fillStyle=f,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ta(a,b,c,d){var f=m;f.context.save();f.context.beginPath();f.context.moveTo(a,b);f.context.lineTo(c,d);f.context.lineWidth=1;f.context.strokeStyle="green";f.context.stroke();f.context.restore()}
ra.prototype.Mc=function(a,b,c,d,f,h,k){this.context.save();this.context.font=f;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};ra.prototype.da=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var m=new ra(aa);function ua(a,b,c){this.name=a;this.G=b;this.Uv=c;this.cd=[];this.xn=[];qa(this,this.Uv,this.G)}ua.prototype.ce=function(a,b){function c(){pa(a)}function d(){ma(a)}var f,h;for(f=0;f<this.cd.length;f+=1)h=this.xn[f],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.cd[f].src=h,this.cd[f].addEventListener("load",d,!1),this.cd[f].addEventListener("error",c,!1)};
ua.prototype.complete=function(){var a;for(a=0;a<this.cd.length;a+=1)if(!this.cd[a].complete||0===this.cd[a].width)return!1;return!0};function va(a,b,c){0<=b&&b<a.G&&(a.cd[b]=new Image,a.xn[b]=c)}ua.prototype.c=function(a,b){0<=a&&a<this.G&&(this.cd[a]=b,this.xn[a]="")};ua.prototype.Ha=function(a,b,c,d,f,h,k,l,n){this.cd[a]&&this.cd[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=f),0>=d||0>=f||0!==Math.round(l)&&0!==Math.round(n)&&m.context.drawImage(this.cd[a],b,c,d,f,h,k,l,n))};
function p(a,b,c,d,f,h,k,l,n,q){this.name=a;this.Ke=b;this.G=c;this.width=d;this.height=f;this.fb=h;this.Ca=k;this.yi=l;this.Yg=n;this.qh=q;this.rf=[];this.sf=[];this.tf=[];this.Ge=[];this.Fe=[];this.He=[];this.Ie=[]}e=p.prototype;e.c=function(a,b,c,d,f,h,k,l){0<=a&&a<this.G&&(this.rf[a]=b,this.sf[a]=c,this.tf[a]=d,this.Ge[a]=f,this.Fe[a]=h,this.He[a]=k,this.Ie[a]=l)};e.complete=function(){return this.Ke.complete()};
e.p=function(a,b,c){a=(Math.round(a)%this.G+this.G)%this.G;this.Ke.Ha(this.rf[a],this.sf[a],this.tf[a],this.Ge[a],this.Fe[a],b-this.fb+this.He[a],c-this.Ca+this.Ie[a])};e.hd=function(a,b,c,d){var f=m.context,h=f.globalAlpha;f.globalAlpha=d;a=(Math.round(a)%this.G+this.G)%this.G;this.Ke.Ha(this.rf[a],this.sf[a],this.tf[a],this.Ge[a],this.Fe[a],b-this.fb+this.He[a],c-this.Ca+this.Ie[a]);f.globalAlpha=h};
e.V=function(a,b,c,d,f,h,k){var l=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(f)||(a=(Math.round(a)%this.G+this.G)%this.G,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,f),l.globalAlpha=k,this.Ke.Ha(this.rf[a],this.sf[a],this.tf[a],this.Ge[a],this.Fe[a],this.He[a]-this.fb,this.Ie[a]-this.Ca),l.restore())};
e.Ha=function(a,b,c,d,f,h,k,l){var n=m.context,q=n.globalAlpha,u,B,D,s;a=(Math.round(a)%this.G+this.G)%this.G;u=this.He[a];B=this.Ie[a];D=this.Ge[a];s=this.Fe[a];b-=u;c-=B;0>=b+d||0>=c+f||b>=D||c>=s||(0>b&&(d+=b,h-=b,b=0),0>c&&(f+=c,k-=c,c=0),b+d>D&&(d=D-b),c+f>s&&(f=s-c),n.globalAlpha=l,this.Ke.Ha(this.rf[a],this.sf[a]+b,this.tf[a]+c,d,f,h,k),n.globalAlpha=q)};
e.pn=function(a,b,c,d,f,h,k,l,n,q,u,B){var D,s,t,v,x,T,ya,Z,na,Ra;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),D=Math.ceil((q-b)/h),s=Math.ceil((u-c)/k),b+=l,c+=n,na=0;na<D;na+=1)for(Ra=0;Ra<s;Ra+=1)x=d,T=f,ya=h,Z=k,t=b+na*h,v=c+Ra*k,t<l&&(x+=l-t,ya-=l-t,t=l),t+ya>=l+q&&(ya=l+q-t),v<n&&(T+=n-v,Z-=n-v,v=n),v+Z>=n+u&&(Z=n+u-v),0<ya&&0<Z&&this.Ha(a,x,T,ya,Z,t,v,B)};e.zk=function(a,b,c,d,f,h,k,l,n,q){this.pn(a,0,0,b,c,d,f,h,k,l,n,q)};
e.yk=function(a,b,c,d,f,h,k,l,n,q){var u=m.context,B=u.globalAlpha,D,s,t,v,x,T;a=(Math.round(a)%this.G+this.G)%this.G;D=l/d;s=n/f;t=this.He[a];v=this.Ie[a];x=this.Ge[a];T=this.Fe[a];b-=t;c-=v;0>=b+d||0>=c+f||b>=x||c>=T||(0>b&&(d+=b,l+=D*b,h-=D*b,b=0),0>c&&(f+=c,n+=s*c,k-=s*c,c=0),b+d>x&&(l-=D*(d-x+b),d=x-b),c+f>T&&(n-=s*(f-T+c),f=T-c),u.globalAlpha=q,this.Ke.Ha(this.rf[a],this.sf[a]+b,this.tf[a]+c,d,f,h,k,l,n),u.globalAlpha=B)};
function wa(a,b,c){var d,f,h;for(d=0;d<a.G;d+=1)f=b+d%a.qh*a.width,h=c+a.height*Math.floor(d/a.qh),a.Ke.Ha(a.rf[d],a.sf[d],a.tf[d],a.Ge[d],a.Fe[d],f-a.fb+a.He[d],h-a.Ca+a.Ie[d])}function r(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Ca=this.fb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.vl=void 0}e=r.prototype;
e.S=function(){var a=new r(this.width,this.height);a.fb=this.fb;a.Ca=this.Ca;w(a);this.p(0,0);y(a);return a};function w(a){a.vl=m.canvas;m.sa(a.canvas)}function y(a){m.canvas===a.canvas&&void 0!==a.vl&&(m.sa(a.vl),a.vl=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.p=function(a,b){m.context.drawImage(this.canvas,a-this.fb,b-this.Ca)};
e.hd=function(a,b,c){var d=m.context,f=d.globalAlpha;d.globalAlpha=c;m.context.drawImage(this.canvas,a-this.fb,b-this.Ca);d.globalAlpha=f};e.V=function(a,b,c,d,f,h){var k=m.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-f*Math.PI/180),k.scale(c,d),k.globalAlpha=h,m.context.drawImage(this.canvas,-this.fb,-this.Ca),k.restore())};
e.Ha=function(a,b,c,d,f,h,k){var l=m.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,m.context.drawImage(this.canvas,a,b,c,d,f,h,c,d),l.globalAlpha=n)};
e.pn=function(a,b,c,d,f,h,k,l,n,q,u){var B,D,s,t,v,x,T,ya,Z,na;if(!(0>=f||0>=h))for(c+f>this.width&&(f=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%f,0<a&&(a-=f),b=Math.round(b)%h,0<b&&(b-=h),B=Math.ceil((n-a)/f),D=Math.ceil((q-b)/h),a+=k,b+=l,Z=0;Z<B;Z+=1)for(na=0;na<D;na+=1)v=c,x=d,T=f,ya=h,s=a+Z*f,t=b+na*h,s<k&&(v+=k-s,T-=k-s,s=k),s+T>=k+n&&(T=k+n-s),t<l&&(x+=l-t,ya-=l-t,t=l),t+ya>=l+q&&(ya=l+q-t),0<T&&0<ya&&this.Ha(v,x,T,ya,s,t,u)};
e.zk=function(a,b,c,d,f,h,k,l,n){this.pn(0,0,a,b,c,d,f,h,k,l,n)};e.yk=function(a,b,c,d,f,h,k,l,n){var q=m.context,u=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,m.context.drawImage(this.canvas,a,b,c,d,f,h,k,l),q.globalAlpha=u))};function xa(a){this.name=a;this.align="left";this.i="base";this.nm=this.Ib=0}e=xa.prototype;e.complete=function(){return this.b.Ke.complete()};
function za(a,b,c){var d=[],f,h,k;if(void 0===c)return d=b.split("\n");0>c&&(c=0);h=f=0;for(d[0]="";f<b.length;)if("\n"===b[f])d.push(""),h=0,f+=1;else if(k=d.length-1,h+=a.width[b.charCodeAt(f)],h>c&&0<d[k].length){for(h=d[k].length-1;0<=h&&" "!==d[k][h];)h-=1;0<=h&&(f=f-d[k].length+h+1,d[k]=d[k].substr(0,h));d.push("");h=0}else d[k]+=b[f],h+=a.nm,f+=1;return d}e.Bf=function(a){var b=0,c;for(c=a.length-1;0<=c;c-=1)b+=this.width[a.charCodeAt(c)]+this.nm;return b-this.nm};
e.da=function(a,b){var c=za(this,a,b),d=0,f;for(f=c.length-1;0<=f;f-=1)d=Math.max(d,this.Bf(c[f]));return d};e.Z=function(a,b){var c=za(this,a,b);return c.length*this.height+(c.length-1)*this.Ib};
e.p=function(a,b,c,d){a=za(this,a,d);d=a.length*this.height+(a.length-1)*this.Ib;var f,h,k,l;switch(this.i){case "top":c-=this.top;break;case "middle":c-=this.top+Math.round(d/2);break;case "base":c-=this.Rg;break;case "bottom":c-=this.top+d}d=c;for(h=0;h<a.length;h+=1){c=b;switch(this.align){case "left":c=b;break;case "center":c=b-Math.round(this.Bf(a[h])/2);break;case "right":c=b-this.Bf(a[h])}for(f=0;f<a[h].length;f+=1)k=a[h].charCodeAt(f),l=this.index[k],0<=l&&this.b.p(l,c-this.left[k],d),c+=
this.width[k]+this.nm;d+=this.height+this.Ib}};e.hd=function(a,b,c,d,f){var h=m.context;h.save();h.globalAlpha=d;this.p(a,b,c,f);h.restore()};e.V=function(a,b,c,d,f,h,k,l){var n=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(f)||(n.save(),n.translate(b,c),n.rotate(-h*Math.PI/180),n.scale(d,f),n.globalAlpha=k,this.p(a,0,0,l/d),n.restore())};
function Aa(a,b,c,d){this.J=a;this.Dy=b;this.xy=c;this.Kj=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.pt=!1;qa(this,d,1)}function Ba(a,b,c){m.context.save();m.context.font="250pt "+a+", "+b;a=m.context.measureText(c).width;m.context.restore();return a}
function Ca(a){var b,c,d;for(b=0;b<a.Kj.length;b+=1)if(c=a.Kj[b],d=Ba(a.J,c.font,c.text),c.width!==d){ma(a.Tv);document.body.removeChild(a.Oe);a.pt=!0;return}window.setTimeout(function(){Ca(a)},33)}
Aa.prototype.ce=function(a,b){var c="@font-face {font-family: "+this.J+";src: url('"+b+this.Dy+"') format('woff'), url('"+b+this.xy+"') format('truetype');}",d=document.createElement("style");d.id=this.J+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.Oe=document.createElement("span");this.Oe.style.position="absolute";this.Oe.style.left="-9999px";this.Oe.style.top="-9999px";this.Oe.style.visibility=
"hidden";this.Oe.style.fontSize="250pt";this.Oe.id=this.J+"_loader";document.body.appendChild(this.Oe);for(c=0;c<this.Kj.length;c+=1)d=this.Kj[c],d.width=Ba(d.font,d.font,d.text);this.Tv=a;Ca(this)};Aa.prototype.complete=function(){return this.pt};
function z(a,b){this.J=a;this.Ii=b;this.fontWeight=this.fontStyle="";this.te="normal";this.fontSize=12;this.fill=!0;this.Uf=1;this.ld=0;this.fillColor="black";this.Ad={b:void 0,Ub:0,Vo:!0,Wo:!0};this.pb={Dj:!0,G:3,nk:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.qg=1;this.Fh=0;this.strokeColor="black";this.strokeStyle=void 0;this.Ld=1;this.qf=!1;this.rg="miter";this.R={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.i="top";
this.Ib=this.ff=0}e=z.prototype;
e.S=function(){var a=new z(this.J,this.Ii);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.te=this.te;a.fontSize=this.fontSize;a.fill=this.fill;a.Uf=this.Uf;a.ld=this.ld;a.fillColor=this.fillColor;a.Ad={b:this.Ad.b,Vo:this.Ad.Vo,Wo:this.Ad.Wo};a.pb={Dj:this.pb.Dj,G:this.pb.G,nk:this.pb.nk.slice(0),size:this.pb.size,offset:this.pb.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.qg=this.qg;a.Fh=this.Fh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.Ld=this.Ld;a.qf=
this.qf;a.rg=this.rg;a.R={h:this.R.h,color:this.R.color,offsetX:this.R.offsetX,offsetY:this.R.offsetY,blur:this.R.blur};a.align=this.align;a.i=this.i;a.ff=this.ff;a.Ib=this.Ib;return a};
function A(a,b){void 0!==b.J&&(a.J=b.J);void 0!==b.Ii&&(a.Ii=b.Ii);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.te&&(a.te=b.te);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.Uf&&(a.Uf=b.Uf);void 0!==b.fillColor&&(a.ld=0,a.fillColor=b.fillColor);void 0!==b.Ad&&(a.ld=1,a.Ad=b.Ad);void 0!==b.pb&&(a.ld=2,a.pb=b.pb);void 0!==b.fillStyle&&(a.ld=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.qg&&(a.qg=b.qg);void 0!==b.strokeColor&&(a.Fh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.Fh=3,a.strokeStyle=b.strokeStyle);void 0!==b.Ld&&(a.Ld=b.Ld);void 0!==b.qf&&(a.qf=b.qf);void 0!==b.rg&&(a.rg=b.rg);void 0!==b.R&&(a.R=b.R);void 0!==b.align&&(a.align=b.align);void 0!==b.i&&(a.i=b.i);void 0!==b.ff&&(a.ff=b.ff);void 0!==b.Ib&&(a.Ib=b.Ib)}function Da(a,b){a.fontWeight=void 0===b?"":b}function C(a,b){a.fontSize=void 0===b?12:b}function Ea(a){a.fill=!0}
function Fa(a,b){a.Uf=void 0===b?1:b}e.setFillColor=function(a){this.ld=0;this.fillColor=void 0===a?"black":a};function Ga(a,b,c,d,f){a.ld=2;a.pb.Dj=!0;a.pb.G=b;a.pb.nk=c.slice(0);a.pb.size=void 0===d?.6:d;a.pb.offset=void 0===f?0:f}function Ha(a,b){a.stroke=void 0===b?!1:b}function Ia(a,b){a.qg=void 0===b?1:b}e.setStrokeColor=function(a){this.Fh=0;this.strokeColor=void 0===a?"black":a};function Ja(a,b){a.Ld=void 0===b?1:b}function Ka(a,b){a.qf=void 0===b?!1:b}
function La(a,b){a.rg=void 0===b?"miter":b}function Ma(a,b,c,d,f,h){void 0===b?a.R={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1}:b instanceof Object?a.R={h:b.h,color:b.color,offsetX:b.offsetX,offsetY:b.offsetY,blur:b.blur}:void 0===c?a.R.h=b:a.R={h:b,color:c,offsetX:d,offsetY:f,blur:h}}function Na(a){return{h:a.R.h,color:a.R.color,offsetX:a.R.offsetX,offsetY:a.R.offsetY,blur:a.R.blur}}function E(a,b){a.align=void 0===b?"left":b}function F(a,b){a.i=void 0===b?"top":b}
function Oa(a){a.ff=0}function Pa(a){a.Ib=0}function Qa(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.J+", "+a.Ii}e.Bf=function(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b};function Sa(a,b){return a.fontSize*b.length+a.Ib*(b.length-1)}
function Ta(a,b,c){var d,f,h,k,l,n,q=[],u=m.context;u.font=Qa(a);switch(a.te){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:u.measureText(n[a]).width});return q}n=b.split("\n");h=u.measureText(" ").width;for(a=0;a<n.length;a+=1){f=n[a].split(" ");d=f[0];l=u.measureText(f[0]).width;for(b=1;b<f.length;b+=1)k=u.measureText(f[b]).width,l+h+k<c?(d+=" "+f[b],l+=h+k):(q.push({text:d,width:l}),d=f[b],l=k);
q.push({text:d,width:l})}return q}e.da=function(a,b){var c;m.context.save();c=this.Bf(Ta(this,a,b));m.context.restore();return c};e.Z=function(a,b){var c;m.context.save();c=Sa(this,Ta(this,a,b));m.context.restore();return c};function Ua(a,b,c,d,f,h){var k=a.fontSize;a.fontSize=b;b=h?Ta(a,c,d):Ta(a,c);d=a.Bf(b)<=d&&Sa(a,b)<=f;a.fontSize=k;return d}
function Va(a,b,c,d,f){var h=0,k=32;void 0===f&&(f=!1);for(m.context.save();Ua(a,h+k,b,c,d,f);)h+=k;for(;2<=k;)k/=2,Ua(a,h+k,b,c,d,f)&&(h+=k);m.context.restore();return Math.max(4,h)}function Wa(a,b,c,d,f){var h=Math.max(.01,a.pb.size),k=a.pb.offset;a.pb.Dj?(k=f/2+k*f,h=.5*h*f,b=m.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=m.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.pb.G-1);for(d=0;d<a.pb.G;d+=1)b.addColorStop(d*c,a.pb.nk[d]);return b}
function Xa(a,b,c,d,f,h,k){var l,n;!a.fill&&a.R.h?(b.shadowColor=a.R.color,b.shadowOffsetX=a.R.offsetX,b.shadowOffsetY=a.R.offsetY,b.shadowBlur=a.R.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.qg;switch(a.Fh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.Ld;b.lineJoin=a.rg;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.Ib*k;b.strokeText(c[k].text,d+l,f+n)}}
function Ya(a,b,c,d,f,h,k){c=Ta(a,c,k);k=a.Bf(c);var l=Sa(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.i){case "base":case "bottom":f+=-l+Math.round(a.ff*a.fontSize);break;case "middle":f+=-l/2+Math.round(a.ff*a.fontSize/2)}b.font=Qa(a);a.stroke&&a.qf&&Xa(a,b,c,d,f,k,h);if(a.fill){var n=d,q=f,u,B;a.R.h?(b.shadowColor=a.R.color,b.shadowOffsetX=a.R.offsetX,b.shadowOffsetY=a.R.offsetY,b.shadowBlur=a.R.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.Uf;switch(a.ld){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.Ad.b;B=new r(l.width,l.height);var D=a.Ad.Vo,s=a.Ad.Wo;D&&s?u="repeat":D&&!s?u="repeat-x":!D&&s?u="repeat-y":D||s||(u="no-repeat");w(B);l.p(a.Ad.Ub,0,0);y(B);u=m.context.createPattern(B.canvas,u);b.fillStyle=u;break;case 2:b.fillStyle=Wa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(u=0;u<c.length;u+=1){l=0;switch(a.align){case "right":l=
k-c[u].width;break;case "center":l=(k-c[u].width)/2}B=a.fontSize*(u+1)+a.Ib*u;2===a.ld&&a.pb.Dj&&(b.fillStyle=Wa(a,n,q+B-a.fontSize,k,a.fontSize));b.fillText(c[u].text,n+l,q+B)}}a.stroke&&!a.qf&&Xa(a,b,c,d,f,k,h)}e.p=function(a,b,c,d){var f=m.context;this.fill&&1===this.ld?this.V(a,b,c,1,1,0,1,d):(f.save(),Ya(this,f,a,b,c,1,d),f.restore())};e.hd=function(a,b,c,d,f){var h=m.context;this.fill&&1===this.ld?this.V(a,b,c,1,1,0,d,f):(h.save(),Ya(this,h,a,b,c,d,f),h.restore())};
e.V=function(a,b,c,d,f,h,k,l){var n=m.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,f);try{Ya(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Za(){this.jw=10;this.Pj=-1;this.ou="stop_lowest_prio";this.iq=this.eb=this.rb=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.rb=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.eb=!0)}catch(d){}this.iq=this.rb||this.eb;this.eb&&da.r.Eh&&(this.Pj=1);if(this.iq)try{a=new Audio,this.Rp={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),
mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(f){this.Rp={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.Bc=
[];this.yf={};this.hb={};this.Ic={};this.he=[];this.Hc=0;this.rb?(this.ge=new c,this.Sp="function"===typeof this.ge.createGain?function(){return b.ge.createGain()}:"function"===typeof this.ge.createGainNode?function(){return b.ge.createGainNode()}:function(){},this.ie={},this.Oj=this.Sp(),void 0===this.Oj?(this.eb=!0,this.Th=Za.prototype.Hm):(this.Oj.connect(this.ge.destination),this.ie.master=this.Oj,this.Th=Za.prototype.nu)):this.Th=this.eb?Za.prototype.Hm:function(){}}
function $a(a){var b=G,c,d,f,h,k;for(c=0;c<b.Bc.length;c+=1)if((d=b.Bc[c])&&0===d.tn)if(d.paused)d.Wp&&(d.Jm+=a,d.Jm>=d.Wp&&b.nj(d.id));else if(d.Km+=a,d.Fg&&d.Km>=d.gt)d.Fg=!1,ab(b,d,d.ke);else if(d.bb&&b.eb&&b.Sn(d.id)>=d.duration)if(d.vo)try{d.H.pause(),d.H.currentTime=d.ke/1E3,4===d.H.readyState?d.H.play():(f=function(){var a=d;return{ready:function(){a.H.play();a.H.removeEventListener("canplaythrough",f.ready,!1)}}}(),d.H.addEventListener("canplaythrough",f.ready,!1))}catch(l){}else d.H.pause(),
bb(d);for(c=b.he.length-1;0<=c;c-=1)h=b.he[c],b.Ir(h.id)||0!==h.tn||(h.m+=a,h.m>=h.duration?(G.be(h.id,h.vj),void 0!==b.Ic[h.id]&&(b.Ic[h.id]=h.vj),h.Fb&&h.Fb(),b.he.splice(c,1)):(k=h.ob(h.m,h.start,h.vj-h.start,h.duration),G.be(h.id,k),void 0!==b.Ic[h.id]&&(b.Ic[h.id]=k)))}function cb(a,b){a.yf[b.Hb.s.name]?a.yf[b.Hb.s.name].length<a.jw&&a.yf[b.Hb.s.name].push(b.H):a.yf[b.Hb.s.name]=[b.H]}
function db(a,b){var c,d,f;f=[];for(c=0;c<a.Bc.length;c+=1)(d=a.Bc[c])&&0<=d.Ba.indexOf(b)&&f.push(d);return f}function eb(a,b){if(0<a.Pj&&a.Hc>=a.Pj)switch(a.ou){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,f;for(c=0;c<a.Bc.length;c+=1)(d=a.Bc[c])&&d.bb&&!d.paused&&(void 0===f||f.Jl<d.Jl)&&(f=d);if(f.Jl>b.ci){a.stop(f.id);break}return!1}return!0}
function fb(a,b){var c,d=1;for(c=0;c<b.Ba.length;c+=1)void 0!==G.hb[b.Ba[c]]&&(d*=G.hb[b.Ba[c]]);c=a.Sp();c.gain.value=d;c.connect(a.Oj);a.ie[b.id]=c;b.H.connect(c)}function hb(a,b){b.H.disconnect(0);a.ie[b.id]&&(a.ie[b.id].disconnect(0),delete a.ie[b.id])}function ib(a,b){var c;if(b.s&&b.s.pc){if(a.rb)return c=a.ge.createBufferSource(),c.buffer=b.s.pc,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.eb)return c=b.s.pc.cloneNode(!0),c.volume=0,c}}
function jb(a,b){var c,d;if(a.rb)(c=ib(a,b))&&(d=new kb(b,c));else if(a.eb){c=a.yf[b.s.name];if(!c)return;0<c.length?d=new kb(b,c.pop()):(c=ib(a,b))&&(d=new kb(b,c))}if(d){a.rb&&fb(a,d);for(c=0;c<a.Bc.length;c+=1)if(void 0===a.Bc[c])return a.Bc[c]=d;a.Bc.push(d)}return d}function lb(a){var b=G,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Rp[d])return a[c];return!1}e=Za.prototype;
e.Hm=function(a,b,c){function d(){var b;a.loaded=!0;ma(c);a.duration=Math.ceil(1E3*a.pc.duration);a.pc.removeEventListener("canplaythrough",d,!1);a.pc.removeEventListener("error",f,!1);b=a.pc.cloneNode(!0);G.yf[a.name].push(b)}function f(){pa(c)}(b=lb(b))?(a.pc=new Audio,a.pc.src=b,a.pc.autoplay=!1,a.pc.NA="auto",a.pc.addEventListener("canplaythrough",d,!1),a.pc.addEventListener("error",f,!1),a.pc.load()):f()};
e.nu=function(a,b,c){var d=lb(b),f=new XMLHttpRequest;f.open("GET",d,!0);f.responseType="arraybuffer";f.onload=function(){G.ge.decodeAudioData(f.response,function(b){b&&(a.pc=b,a.duration=1E3*b.duration,a.loaded=!0,ma(c))},function(){pa(c)})};f.onerror=function(){"undefined"!==typeof Audio&&(G.rb=!1,G.eb=!0,G.Th=Za.prototype.Hm,G.Th(a,b,c))};try{f.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof H){if(eb(this,a)){a=jb(this,a);if(!a)return-1;a.gt=b||0;a.Fg=0<b;a.Lb=c||0;a.se=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.Fg||ab(this,a,a.ke);return a.id}return-1}};
function ab(a,b,c){var d;"number"!==typeof c&&(c=0);mb(a,b.id);0<b.Lb&&(d=nb(a,b.id),a.be(b.id,0),ob(a,b.id,d,b.Lb,b.se),b.Lb=0,b.se=void 0);if(a.rb){d=c-b.ke;b.pu=1E3*a.ge.currentTime-d;b.H.onended=function(){bb(b)};try{b.H.start?b.H.start(0,c/1E3,(b.duration-d)/1E3):b.H.noteGrainOn&&b.H.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.Pd=!0,b.bb=!0,a.Hc+=1,b.H.loop=b.vo}catch(f){}}else if(a.eb){if(4!==b.H.readyState){var h=function(){return{ready:function(){b.H.currentTime=c/1E3;b.H.play();b.Pd=!0;b.H.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.H.addEventListener("canplaythrough",h.ready,!1)}else b.H.currentTime=c/1E3,b.H.play(),b.Pd=!0;b.bb=!0;a.Hc+=1}}
e.nj=function(a,b,c,d){var f,h,k,l,n=db(this,a);for(f=0;f<n.length;f+=1)if(h=n[f],(h.paused||!h.bb)&&!d||!h.paused&&d){if(!d){for(f=this.he.length-1;0<=f;f-=1)if(a=this.he[f],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.Lb=b||0;h.se=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.Rh&&(void 0===b&&(h.Lb=h.Rh.duration),void 0===c&&(h.se=h.Rh.ob),k=h.Rh.gain,h.Rh=void 0)}this.rb&&(a=ib(this,h.Hb))&&(h.H=a,fb(this,h));void 0!==k&&G.be(h.id,k);ab(this,h,h.ke+(h.Qj||0));void 0!==l&&
(G.be(h.id,l.ob(l.m,l.start,l.vj-l.start,l.duration)),ob(G,h.id,l.vj,l.duration-l.m,l.ob,l.Fb))}};
e.pause=function(a,b,c,d,f){var h,k,l=db(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.Lb=c||0,0<h.Lb)h.se=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.Rh={gain:pb(h.id),duration:h.Lb,ob:h.se},ob(G,h.id,0,h.Lb,h.se,function(){G.pause(h.id,b)});else if(k=this.Sn(h.id),h.Qj=k,f||(h.paused=!0,h.Jm=0,h.Wp=b,this.Hc-=1),this.rb){h.H.onended=function(){};if(h.bb&&h.Pd){try{h.H.stop?h.H.stop(0):h.H.noteOff&&h.H.noteOff(0)}catch(n){}h.Pd=!1}hb(this,h)}else this.eb&&h.H.pause()};
function bb(a){var b=G;b.hb[a.id]&&delete b.hb[a.id];a.paused||(b.Hc-=1);b.rb?(a.Pd=!1,a.bb=!1,hb(b,a)):b.eb&&cb(b,a);b.Bc[b.Bc.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,f=db(this,a);for(a=0;a<f.length;a+=1)if(d=f[a],d.Lb=b||0,0<d.Lb)d.se=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},ob(G,d.id,0,d.Lb,d.se,function(){G.stop(d.id)});else{this.hb[d.id]&&delete this.hb[d.id];d.bb&&!d.paused&&(this.Hc-=1);if(this.rb){if(d.bb&&!d.paused&&!d.Fg){if(d.Pd){try{d.H.stop?d.H.stop(0):d.H.noteOff&&d.H.noteOff(0)}catch(h){}d.Pd=!1}hb(this,d)}}else this.eb&&(d.Fg||d.H.pause(),cb(this,d));this.Bc[this.Bc.indexOf(d)]=void 0;d.bb=!1}};
function ob(a,b,c,d,f,h){var k;for(k=0;k<a.he.length;k+=1)if(a.he[k].id===b){a.he.splice(k,1);break}a.he.push({id:b,vj:c,ob:f||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,m:0,start:nb(a,b),Fb:h,tn:0})}function qb(a){var b=G,c;void 0===b.Ic[a]&&(c=void 0!==b.hb[a]?b.hb[a]:1,b.be(a,0),b.Ic[a]=c)}function rb(a){var b=G;void 0!==b.Ic[a]&&(b.be(a,b.Ic[a]),delete b.Ic[a])}
e.position=function(a,b){var c,d,f,h,k=db(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.rb)if(d.paused)d.Qj=b;else{d.H.onended=function(){};if(d.Pd){try{d.H.stop?d.H.stop(0):d.H.noteOff&&d.H.noteOff(0)}catch(l){}d.Pd=!1}hb(this,d);this.Hc-=1;if(f=ib(this,d.Hb))d.H=f,fb(this,d),ab(this,d,d.ke+b)}else this.eb&&(4===d.H.readyState?d.H.currentTime=(d.ke+b)/1E3:(h=function(){var a=d,c=b;return{qr:function(){a.H.currentTime=(a.ke+c)/1E3;a.H.removeEventListener("canplaythrough",
h.qr,!1)}}}(),d.H.addEventListener("canplaythrough",h.qr,!1)))};e.Xo=function(a){G.position(a,0)};e.Ss=function(a,b){var c,d=db(this,a);for(c=0;c<d.length;c+=1)d[c].vo=b,this.rb&&(d[c].H.loop=b)};function nb(a,b){return void 0!==a.hb[b]?a.hb[b]:1}function pb(a){var b=G,c=1,d=db(b,a)[0];if(d)for(a=0;a<d.Ba.length;a+=1)void 0!==b.hb[d.Ba[a]]&&(c*=b.hb[d.Ba[a]]);return Math.round(100*c)/100}
e.be=function(a,b){var c,d,f,h=1,k=db(this,a);this.hb[a]=b;this.Ic[a]&&delete this.Ic[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.Ba.indexOf(a)){for(f=0;f<d.Ba.length;f+=1)void 0!==this.hb[d.Ba[f]]&&(h*=this.hb[d.Ba[f]]);h=Math.round(100*h)/100;this.rb?this.ie[d.id].gain.value=h:this.eb&&(d.H.volume=h)}};
function mb(a,b){var c,d,f,h=1,k=db(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(f=0;f<d.Ba.length;f+=1)void 0!==a.hb[d.Ba[f]]&&(h*=a.hb[d.Ba[f]]);h=Math.round(100*h)/100;a.rb?a.ie[d.id].gain.value=h:a.eb&&(d.H.volume=h)}}e.bq=function(a,b){var c,d,f,h=db(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),f=0;f<b.length;f+=1)0>d.Ba.indexOf(b[f])&&d.Ba.push(b[f]);mb(this,a)};e.Ir=function(a){if(a=db(this,a)[0])return a.paused};e.jo=function(a){return db(this,a)[0]?!0:!1};
e.Sn=function(a){if(a=db(this,a)[0]){if(this.rb)return a.paused?a.Qj:(1E3*G.ge.currentTime-a.pu)%a.duration;if(G.eb)return Math.ceil(1E3*a.H.currentTime-a.ke)}};var G=new Za;function sb(a,b,c,d){this.name=a;this.Kw=b;this.Ow=c;this.Sc=d;this.loaded=!1;this.pc=null;qa(this,this.Sc,1)}
sb.prototype.ce=function(a,b){var c,d;c=this.Kw;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Ow;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);G.yf[this.name]=[];G.Th(this,[d,c],a)};sb.prototype.complete=function(){return this.loaded};
function H(a,b,c,d,f,h,k){this.name=a;this.s=b;this.startOffset=c;this.duration=d;G.be(this.name,void 0!==f?f:1);this.ci=void 0!==h?h:10;this.Ba=[];k&&(this.Ba=this.Ba.concat(k));0>this.Ba.indexOf(this.name)&&this.Ba.push(this.name)}H.prototype.complete=function(){return this.s.complete()};H.prototype.Jl=function(a){void 0!==a&&(this.ci=a);return this.ci};H.prototype.bq=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.Ba.indexOf(a[b])&&this.Ba.push(a[b])};
function kb(a,b){this.Hb=a;this.ke=this.Hb.startOffset;this.H=b;this.duration=this.Hb.duration;this.Pe()}kb.prototype.Pe=function(){this.id=Math.round(Date.now()*Math.random())+"";this.Ba=["master",this.id].concat(this.Hb.Ba);this.Jl=void 0!==this.Hb.ci?this.Hb.ci:10;this.paused=this.bb=this.vo=!1;this.Km=this.tn=0;this.Pd=this.Fg=!1;this.gt=this.Qj=0;var a,b=1;for(a=0;a<this.Ba.length;a+=1)void 0!==G.hb[this.Ba[a]]&&(b*=G.hb[this.Ba[a]]);!G.rb&&G.eb&&(this.H.volume=b)};
function tb(a,b){this.name=a;this.fileName=b;this.info=void 0}function ub(a){this.name=a;this.text="";this.kd=this.complete=!1}ub.prototype.zf=function(a){4===a.readyState&&(this.complete=!0,(this.kd=200!==a.status)?oa("Get Failed",{name:this.name}):(this.text=a.responseText,oa("Get Complete",{name:this.name})))};
function vb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.kd=200!==c.status,a.kd?oa("Post Failed",{name:a.name}):oa("Post Complete",{name:a.name}))};c.send(a.text)}function wb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.kd=200!==c.status;if(a.kd)return!1;a.text=c.responseText;return!0}
function xb(a){a&&(this.ae=a);this.clear();this.$h=this.Jg=this.xd=this.Zh=this.Yh=this.bi=this.Vh=this.ai=this.je=this.Xh=this.Wh=0;yb(this,this);zb(this,this);Ab(this,this);this.Wb=[];this.Nh=[];this.ei=[];this.O=0;this.Xp=!1;this.el=this.startTime=Date.now();this.pg=this.ve=0;this.kw=200;this.Sc="";window.Hj(window.Op)}xb.prototype.clear=function(){this.F=[];this.fi=!1;this.oc=[];this.Em=!1};
function yb(a,b){window.addEventListener("click",function(a){var d,f,h;if(void 0!==b.ae&&!(0<b.O)&&(d=b.ae,f=d.getBoundingClientRect(),h=d.width/f.width*(a.clientX-f.left),d=d.height/f.height*(a.clientY-f.top),a.preventDefault(),b.Eg.x=h,b.Eg.y=d,b.Ph.push({x:b.Eg.x,y:b.Eg.y}),0<b.Zh))for(a=b.F.length-1;0<=a&&!((h=b.F[a])&&h.h&&0>=h.O&&h.Xn&&(h=h.Xn(b.Eg.x,b.Eg.y),!0===h));a-=1);},!1);Bb(a)}function Bb(a){a.Eg={x:0,y:0};a.Ph=[]}
function zb(a,b){window.addEventListener("mousedown",function(a){0<b.O||(a.preventDefault(),window.focus(),b.Vp>=Date.now()-1E3||(Cb(b,0,a.clientX,a.clientY),Db(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.O||(a.preventDefault(),b.Nj>=Date.now()-1E3||(Cb(b,0,a.clientX,a.clientY),Eb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.O||(a.preventDefault(),Cb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Vp=Date.now();
if(!(0<b.O))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)Cb(b,d[a].identifier,d[a].clientX,d[a].clientY),Db(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.Nj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<d.length;a+=1)Cb(b,d[a].identifier,d[a].clientX,d[a].clientY),Eb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.O))for(a.preventDefault(),a=0;a<d.length;a+=1)Cb(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.Nj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<d.length;a+=1)Cb(b,d[a].identifier,d[a].clientX,d[a].clientY),Eb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.Nj=Date.now();if(!(0<b.O))for(a.preventDefault(),a=0;a<d.length;a+=1)Cb(b,d[a].identifier,d[a].clientX,d[a].clientY),Eb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){Fb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){Fb(b,a)},!1);Gb(a);a.Vp=0;a.Nj=0}function Gb(a){var b;a.ia=[];for(b=0;16>b;b+=1)a.ia[b]={id:-1,zb:!1,x:0,y:0};a.Cf=[]}function Hb(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.ia[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.ia[d].zb){c=d;a.ia[d].id=b;break}return c}
function Cb(a,b,c,d){var f,h;void 0!==a.ae&&(b=Hb(a,b),-1!==b&&(f=a.ae,h=f.getBoundingClientRect(),a.ia[b].x=f.width/h.width*(c-h.left),a.ia[b].y=f.height/h.height*(d-h.top)))}function Db(a,b){var c=Hb(a,b),d,f;if(-1!==c&&!a.ia[c].zb&&(a.Cf.push({Vf:c,x:a.ia[c].x,y:a.ia[c].y,zb:!0}),a.ia[c].zb=!0,0<a.xd))for(d=a.F.length-1;0<=d&&!((f=a.F[d])&&f.h&&0>=f.O&&f.gh&&(f=f.gh(c,a.ia[c].x,a.ia[c].y),!0===f));d-=1);}
function Eb(a,b){var c=Hb(a,b),d,f;if(-1!==c&&a.ia[c].zb&&(a.Cf.push({Vf:c,x:a.ia[c].x,y:a.ia[c].y,zb:!1}),a.ia[c].zb=!1,0<a.xd))for(d=a.F.length-1;0<=d&&!((f=a.F[d])&&f.h&&0>=f.O&&f.hh&&(f=f.hh(c,a.ia[c].x,a.ia[c].y),!0===f));d-=1);}
function Fb(a,b){var c;if(!(0<a.O)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,f;a.Cf.push({Vf:0,x:a.ia[0].x,y:a.ia[0].y,wheelDelta:c});if(0<a.xd)for(d=a.F.length-1;0<=d&&!((f=a.F[d])&&f.h&&0>=f.O&&f.$n&&(f=f.$n(c,a.ia[0].x,a.ia[0].y),!0===f));d-=1);}}
function Ab(a,b){window.addEventListener("keydown",function(a){0<b.O||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Ib(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.O||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Jb(b,a.keyCode))},!1);Kb(a)}function Kb(a){var b;a.Sh=[];for(b=0;256>b;b+=1)a.Sh[b]=!1;a.Ig=[]}
function Ib(a,b){var c,d;if(!a.Sh[b]&&(a.Ig.push({key:b,zb:!0}),a.Sh[b]=!0,0<a.Jg))for(c=0;c<a.F.length&&!((d=a.F[c])&&d.h&&0>=d.O&&d.Yn&&(d=d.Yn(b),!0===d));c+=1);}function Jb(a,b){var c,d;if(a.Sh[b]&&(a.Ig.push({key:b,zb:!1}),a.Sh[b]=!1,0<a.Jg))for(c=0;c<a.F.length&&!((d=a.F[c])&&d.h&&0>=d.O&&d.Zn&&(d=d.Zn(b),!0===d));c+=1);}
function Lb(a,b,c){var d=I,f=1,h=d.Wb.length,k;void 0===f&&(f=1);void 0===c&&(c=null);for(k=0;k<d.Wb.length;k+=1)d.Wb[k].id===a&&d.Wb[k].uf===c&&(h=k);if(h===d.Wb.length)for(k=0;k<d.Wb.length;k+=1)void 0===d.Wb[k].id&&(h=k);d.Wb[h]={id:a,time:b,bB:f,uf:c,wg:b,Pl:f-1,paused:0}}function Mb(){var a=I,b;for(b=0;b<a.Wb.length;b+=1)a.Wb[b].paused+=1}
function oa(a,b){var c,d=I,f,h;void 0===c&&(c=null);d.ei.push({id:a,tu:b,uf:c});if(0<d.$h)for(f=0;f<d.F.length&&(!((h=d.F[f])&&h.h&&0>=h.O&&h.ao)||null!==c&&c!==h||(h=h.ao(a,b),!0!==h));f+=1);}
function Nb(a,b){var c=a.oc[b];c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.sa(c.canvas),!1!==m.canvas.$||!0===c.nd)&&(0===c.Up&&(0>=c.O&&(c.Ub+=c.su*a.pg/1E3),1===c.ym&&1===c.zm&&0===c.oa?1===c.alpha?c.b.p(c.Ub,c.x,c.y):c.b.hd(c.Ub,c.x,c.y,c.alpha):c.b.V(c.Ub,c.x,c.y,c.ym,c.zm,c.oa,c.alpha)),1===c.Up&&(1===c.ym&&1===c.zm&&0===c.oa?1===c.alpha?c.font.p(c.text,c.x,c.y):c.font.hd(c.text,c.x,c.y,c.alpha):c.font.V(c.text,c.x,c.y,c.ym,c.zm,c.oa,c.alpha)))}
function Ob(a,b){var c=a.F[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.sa(c.canvas),(!1!==m.canvas.$||!0===c.nd)&&c.ya))return c.ya()}function Pb(a){for(var b=0,c=0;b<a.F.length||c<a.oc.length;)if(c===a.oc.length){if(!0===Ob(a,b))break;b+=1}else if(b===a.F.length)Nb(a,c),c+=1;else if(a.oc[c].Ua>a.F[b].Ua||a.oc[c].Ua===a.F[b].Ua&&a.oc[c].depth>a.F[b].depth)Nb(a,c),c+=1;else{if(!0===Ob(a,b))break;b+=1}}xb.prototype.pause=function(a){this.O+=1;void 0===a&&(a=!1);this.Xp=a};
xb.prototype.nj=function(){0!==this.O&&(this.el=Date.now(),this.O-=1)};xb.prototype.Ir=function(){return 0<this.O};window.Cm=0;window.Bm=0;window.Pp=0;window.gu=0;window.Qp=0;window.iu=60;window.ju=0;window.hu=!1;
window.Op=function(){window.Cm=Date.now();window.gu=window.Cm-window.Bm;var a=I,b;if(0<a.O)a.Xp&&(Qb(a),Pb(a));else{b=Date.now();"number"!==typeof b&&(b=a.el);a.pg=Math.min(a.kw,b-a.el);a.ve+=a.pg;""===a.Sc&&(a.Sc="start",ka.ce(a.Sc));"start"===a.Sc&&ka.complete(a.Sc)&&(a.Sc="load",ka.ce(a.Sc));"load"===a.Sc&&ka.complete(a.Sc)&&(a.Sc="game",ka.ce(a.Sc));"undefined"!==typeof G&&$a(a.pg);var c,d;if(0<a.Wh)for(c=0;c<a.F.length&&!((d=a.F[c])&&d.ba&&d.h&&0>=d.O&&!0===d.ba(a.pg));c+=1);var f,h;if(0!==a.Ph.length){if(0<
a.Xh)for(d=a.F.length-1;0<=d;d-=1)if((f=a.F[d])&&f.h&&0>=f.O&&f.Wn)for(c=0;c<a.Ph.length;c+=1)h=a.Ph[c],!0!==h.od&&(h.od=f.Wn(h.x,h.y));a.Ph=[]}if(0!==a.Cf.length){if(0<a.je)for(d=a.F.length-1;0<=d;d-=1)if((f=a.F[d])&&f.h&&0>=f.O&&(f.Mb||f.Nb||f.Xk))for(c=0;c<a.Cf.length;c+=1)h=a.Cf[c],!0!==h.od&&(void 0!==h.wheelDelta&&f.Xk?h.od=f.Xk(h.wheelDelta,h.x,h.y):h.zb&&f.Mb?h.od=f.Mb(h.Vf,h.x,h.y):void 0!==h.zb&&!h.zb&&f.Nb&&(h.od=f.Nb(h.Vf,h.x,h.y)));a.Cf=[]}if(0!==a.Ig.length){if(0<a.ai)for(d=0;d<a.F.length;d+=
1)if((f=a.F[d])&&f.h&&0>=f.O&&(f.ih||f.bg))for(c=0;c<a.Ig.length;c+=1)h=a.Ig[c],!0!==h.od&&(h.zb&&f.ih?h.od=f.ih(h.key):!h.zb&&f.bg&&(h.od=f.bg(h.key)));a.Ig=[]}c=a.pg;for(d=a.Nh.length=0;d<a.Wb.length;d+=1)f=a.Wb[d],void 0!==f.id&&0===f.paused&&(0<f.wg||0<f.Pl)&&(f.wg-=c,0>=f.wg&&(a.Nh.push({id:f.id,uf:f.uf}),0<f.Pl?(f.Pl-=1,f.wg+=f.time):f.wg=0));if(0<a.Vh&&0<a.Nh.length)for(c=0;c<a.F.length;c+=1)if((d=a.F[c])&&d.Sk&&d.h)for(f=0;f<a.Nh.length;f+=1)h=a.Nh[f],!0===h.od||null!==h.uf&&h.uf!==d||(h.od=
d.Sk(h.id));if(0<a.bi&&0<a.ei.length)for(c=0;c<a.F.length;c+=1)if((f=a.F[c])&&f.Pc&&f.h&&0>=f.O)for(d=0;d<a.ei.length;d+=1)h=a.ei[d],!0===h.od||null!==h.uf&&h.uf!==f||(h.od=f.Pc(h.id,h.tu));a.ei.length=0;if(0<a.Yh)for(c=0;c<a.F.length&&!((d=a.F[c])&&d.Zd&&d.h&&0>=d.O&&!0===d.Zd(a.pg));c+=1);Qb(a);Pb(a);a.el=b}window.Bm=Date.now();window.Pp=window.Bm-window.Cm;window.Qp=Math.max(window.ju,1E3/window.iu-window.Pp);window.Hj(window.Op)};window.Hj=function(a){window.setTimeout(a,window.Qp)};
window.hu||(window.Hj=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.Hj);
function Qb(a){function b(a,b){return a.Ua===b.Ua?b.depth-a.depth:a.Ua>b.Ua?-1:1}var c,d;for(c=d=0;c<a.F.length;c+=1)a.F[c]&&(a.F[c].Dm&&(a.F[c].Dm=!1,a.F[c].h=!0),a.F[d]=a.F[c],d+=1);a.F.length=d;a.fi&&a.F.sort(b);a.fi=!1;for(c=d=0;c<a.oc.length;c+=1)a.oc[c]&&(a.oc[d]=a.oc[c],d+=1);a.oc.length=d;a.Em&&a.oc.sort(b);a.Em=!1}
function J(a,b){var c=I;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.h&&(a.h=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ua&&(a.Ua=0);void 0===a.O&&(a.O=0);void 0===a.le&&(a.le=[]);a.Dm=!1;void 0!==b&&!1===b&&(a.Dm=!0,a.h=!1);c.F.push(a);c.fi=!0;a.ba&&(c.Wh+=1);a.Wn&&(c.Xh+=1);if(a.Mb||a.Nb)c.je+=1;a.Xk&&(c.je+=1);if(a.ih||a.bg)c.ai+=1;a.Sk&&(c.Vh+=1);a.Pc&&(c.bi+=1);a.Zd&&(c.Yh+=1);a.Xn&&(c.Zh+=1);if(a.gh||a.hh)c.xd+=1;a.$n&&(c.xd+=1);if(a.Yn||a.Zn)c.Jg+=1;a.ao&&(c.$h+=
1);a.ec&&a.ec()}function Rb(a,b){var c=I;a.depth!==b&&(c.fi=!0);a.depth=b}function Sb(a,b){var c;b=[].concat(b);void 0===a.le&&(a.le=[]);for(c=b.length-1;0<=c;c-=1)0>a.le.indexOf(b[c])&&a.le.push(b[c])}
function Tb(a,b){var c=[],d,f;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.F.length;d+=1)f=a.F[d],void 0!==f&&c.push(f);else if("function"===typeof b)for(d=0;d<a.F.length;d+=1)f=a.F[d],void 0!==f&&b(f)&&c.push(f);else for(d=0;d<a.F.length;d+=1)f=a.F[d],void 0!==f&&0<=f.le.indexOf(b)&&c.push(f);return c}function Ub(a){var b=Tb(I,a);for(a=0;a<b.length;a+=1){var c=b[a];c.O+=1}}function Vb(a){var b=Tb(I,a);for(a=0;a<b.length;a+=1){var c=b[a];c.O=Math.max(0,c.O-1)}}
function K(a,b){var c=a.F.indexOf(b);if(!(0>c)){a.F[c].tb&&a.F[c].tb();var d=a.F[c];d.ba&&(a.Wh-=1);d.Wn&&(a.Xh-=1);if(d.Mb||d.Nb)a.je-=1;d.Xk&&(a.je-=1);if(d.ih||d.bg)a.ai-=1;d.Sk&&(a.Vh-=1);d.Pc&&(a.bi-=1);d.Zd&&(a.Yh-=1);d.Xn&&(a.Zh-=1);if(d.gh||d.hh)a.xd-=1;d.$n&&(a.xd-=1);if(d.Yn||d.Zn)a.Jg-=1;d.ao&&(a.$h-=1);a.F[c]=void 0}}function Wb(a){var b=I,c=Tb(b,a);for(a=0;a<c.length;a+=1)K(b,c[a])}
xb.prototype.c=function(a,b,c,d,f,h,k){void 0===k&&(k=0);this.oc.push({Up:0,b:a,Ub:b,su:c,visible:!0,x:d,y:f,ym:1,zm:1,oa:0,alpha:1,depth:h,Ua:k,O:0,le:[]});this.Em=!0;return this.oc[this.oc.length-1]};var I=new xb(aa);
function Xb(a,b){var c;this.kind=a;this.t=null;switch(this.kind){case 0:this.t={x:[b.x],y:[b.y]};this.ea=b.x;this.wa=b.y;this.Pa=b.x;this.sb=b.y;break;case 2:this.t={x:[b.x,b.x+b.lc-1,b.x+b.lc-1,b.x,b.x],y:[b.y,b.y,b.y+b.uc-1,b.y+b.uc-1,b.y]};this.ea=b.x;this.wa=b.y;this.Pa=b.x+b.lc-1;this.sb=b.y+b.uc-1;break;case 3:this.t={x:[],y:[]};this.ea=b.x-b.Nl;this.wa=b.y-b.Nl;this.Pa=b.x+b.Nl;this.sb=b.y+b.Nl;break;case 1:this.t={x:[b.Ip,b.Jp],y:[b.Kp,b.Lp]};this.ea=Math.min(b.Ip,b.Jp);this.wa=Math.min(b.Kp,
b.Lp);this.Pa=Math.max(b.Ip,b.Jp);this.sb=Math.max(b.Kp,b.Lp);break;case 4:this.t={x:[],y:[]};this.ea=b.x[0];this.wa=b.y[0];this.Pa=b.x[0];this.sb=b.y[0];for(c=0;c<b.x.length;c+=1)this.t.x.push(b.x[c]),this.t.y.push(b.y[c]),this.ea=Math.min(this.ea,b.x[c]),this.wa=Math.min(this.wa,b.y[c]),this.Pa=Math.max(this.Pa,b.x[c]),this.sb=Math.max(this.sb,b.y[c]);this.t.x.push(b.x[0]);this.t.y.push(b.y[0]);break;default:this.wa=this.ea=0,this.sb=this.Pa=-1}}
function Yb(a,b,c,d){return new Xb(2,{x:a,y:b,lc:c,uc:d})}function Zb(a,b,c){return new Xb(3,{x:a,y:b,Nl:c})}function $b(a){var b=1E6,c=-1E6,d=1E6,f=-1E6,h,k,l,n,q;for(h=0;h<a.G;h+=1)k=a.He[h]-a.fb,l=k+a.Ge[h]-1,n=a.Ie[h]-a.Ca,q=n+a.Fe[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>f&&(f=q);return new Xb(2,{x:b,y:d,lc:c-b+1,uc:f-d+1})}e=Xb.prototype;
e.S=function(){var a=new Xb(-1,{}),b;a.kind=this.kind;a.ea=this.ea;a.Pa=this.Pa;a.wa=this.wa;a.sb=this.sb;a.t={x:[],y:[]};for(b=0;b<this.t.x.length;b+=1)a.t.x[b]=this.t.x[b];for(b=0;b<this.t.y.length;b+=1)a.t.y[b]=this.t.y[b];return a};e.translate=function(a,b){var c=this.S(),d;c.ea+=a;c.Pa+=a;c.wa+=b;c.sb+=b;for(d=0;d<c.t.x.length;d+=1)c.t.x[d]+=a;for(d=0;d<c.t.y.length;d+=1)c.t.y[d]+=b;return c};
e.scale=function(a){var b=this.S(),c;b.ea*=a;b.Pa*=a;b.wa*=a;b.sb*=a;for(c=0;c<b.t.x.length;c+=1)b.t.x[c]*=a;for(c=0;c<b.t.y.length;c+=1)b.t.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,f;switch(this.kind){case 0:return b=new g(this.t.x[0],this.t.y[0]),b=b.rotate(a),new Xb(0,{x:b.x,y:b.y});case 1:return b=new g(this.t.x[0],this.t.y[0]),b=b.rotate(a),c=new g(this.t.x[1],this.t.y[1]),c=c.rotate(a),new Xb(1,{Ip:b.x,Kp:b.y,Jp:c.x,Lp:c.y});case 3:return b=(this.Pa-this.ea)/2,c=new g(this.ea+b,this.wa+b),c=c.rotate(a),Zb(c.x,c.y,b);default:c=[];d=[];for(f=0;f<this.t.x.length-1;f+=1)b=new g(this.t.x[f],this.t.y[f]),b=b.rotate(a),c.push(b.x),d.push(b.y);return new Xb(4,
{x:c,y:d})}};function ac(a,b,c,d){var f=new g(0,0),h,k=1E9,l=-1E10,n;for(n=0;n<a.t.x.length;n+=1)f.x=b+a.t.x[n],f.y=c+a.t.y[n],h=f.Sf(d),k=Math.min(k,h),l=Math.max(l,h);return{min:k,max:l}}function bc(a){var b=new g(0,0),c=new g(0,0),d=[],f;for(f=0;f<a.t.x.length-1;f+=1)b.x=a.t.x[f],b.y=a.t.y[f],c.x=a.t.x[f+1],c.y=a.t.y[f+1],d.push(fa(b.Vb(c)));return d}
function cc(a,b,c,d,f,h){var k,l,n,q;if(f+d.Pa<b+a.ea||f+d.ea>b+a.Pa||h+d.sb<c+a.wa||h+d.wa>c+a.sb)return!1;if(2===a.kind&&2===d.kind)return!0;if(3===d.kind)return k=(d.Pa-d.ea)/2,dc(a,b,c,f+d.ea+k,h+d.wa+k,k);if(3===a.kind)return k=(a.Pa-a.ea)/2,dc(d,f,h,b+a.ea+k,c+a.wa+k,k);if(0===d.kind)return ec(a,b,c,f+d.ea,h+d.wa);if(0===a.kind)return ec(d,f,h,b+a.ea,c+a.wa);k=bc(a).concat(bc(d));for(q=0;q<k.length;q+=1)if(l=ac(a,b,c,k[q]),n=ac(d,f,h,k[q]),l.max<n.min||n.max<l.min)return!1;return!0}
function dc(a,b,c,d,f,h){var k,l,n,q,u,B,D;if(d+h<b+a.ea||d-h>b+a.Pa||f+h<c+a.wa||f-h>c+a.sb)return!1;switch(a.kind){case 0:return l=d-(b+a.ea),n=f-(c+a.wa),l*l+n*n<=h*h;case 3:return q=(a.Pa-a.ea)/2,l=d-(b+a.ea+q),n=f-(c+a.wa+q),l*l+n*n<=(q+h)*(q+h);default:q=bc(a);u=k=0;B=1E9;for(D=0;D<a.t.x.length;D+=1)l=b+a.t.x[D]-d,n=c+a.t.y[D]-f,l=l*l+n*n,l<=B&&(k=b+a.t.x[D],u=c+a.t.y[D],B=l);d=new g(d,f);q.push(d.Vb(new g(k,u)).normalize());for(D=0;D<q.length;D+=1)if(k=d.Sf(q[D]),f=k-h,k+=h,u=ac(a,b,c,q[D]),
k<u.min||u.max<f)return!1;return!0}}function ec(a,b,c,d,f){var h,k,l,n;if(d<b+a.ea||d>b+a.Pa||f<c+a.wa||f>c+a.sb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return h=(a.Pa-a.ea)/2,d-=b+a.ea+h,f-=c+a.wa+h,d*d+f*f<=h*h;case 1:return h=b+a.t.x[0],k=c+a.t.y[0],b+=a.t.x[1],a=c+a.t.y[1],d===h?f===k:d===b?f===a:1>Math.abs(k+(d-h)*(a-k)/(b-h)-f);case 4:h=bc(a);for(k=0;k<h.length;k+=1)if(l=new g(d,f),l=l.Sf(h[k]),n=ac(a,b,c,h[k]),l<n.min||n.max<l)return!1;return!0;default:return!1}}
e.sc=function(a,b,c){var d=m.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.ea-1,b+this.wa-1,3,3);break;case 2:d.fillRect(a+this.ea,b+this.wa,this.Pa-this.ea+1,this.sb-this.wa+1);break;case 3:c=(this.Pa-this.ea)/2;d.beginPath();d.arc(a+this.ea+c,b+this.wa+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);d.lineTo(a+this.t.x[1],b+this.t.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);
for(c=1;c<this.t.x.length-1;c+=1)d.lineTo(a+this.t.x[c],b+this.t.y[c]);d.closePath();d.fill()}};function fc(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.ta=[];this.Uh=this.O=this.di=!1;this.Od=1;this.$c=-1;this.Da=-1E6}function gc(a){a.ta.sort(function(a,c){return a.ab-c.ab})}e=fc.prototype;e.S=function(){var a=new fc,b;for(b=0;b<this.ta.length;b+=1)a.ta.push({ab:this.ta[b].ab,action:this.ta[b].action});a.Uh=this.Uh;return a};
e.Y=function(a,b){var c,d;if(0===this.ta.length||this.ta[this.ta.length-1].ab<=a)this.ta.push({ab:a,action:b});else{for(c=0;this.ta[c].ab<=a;)c+=1;for(d=this.ta.length;d>c;d-=1)this.ta[d]=this.ta[d-1];this.ta[c]={ab:a,action:b}}this.Da=-1E6};e.start=function(){this.di=!0;this.O=!1;this.$c=0>this.Od&&0<this.ta.length?this.ta[this.ta.length-1].ab+1:-1;this.Da=-1E6;K(I,this);J(this)};
e.Xo=function(){if(0>this.Od&&0<this.ta.length){var a=this.ta[this.ta.length-1].ab;this.$c=0>this.Od?a+1:a-1}else this.$c=0>this.Od?1:-1;this.Da=-1E6};e.stop=function(){this.di=!1;K(I,this)};e.Ce=function(){return this.di};e.pause=function(){this.O=!0;K(I,this)};e.nj=function(){this.O=!1;K(I,this);J(this)};e.paused=function(){return this.di&&this.O};e.Ss=function(a){this.Uh=a};
e.ba=function(a){if(this.di&&!this.O&&0!==this.Od)if(0<this.Od){0>this.Da&&(this.Da=0);for(;this.Da<this.ta.length&&this.ta[this.Da].ab<=this.$c;)this.Da+=1;for(this.$c+=this.Od*a;0<=this.Da&&this.Da<this.ta.length&&this.ta[this.Da].ab<=this.$c;)this.ta[this.Da].action(this.ta[this.Da].ab,this),this.Da+=1;this.Da>=this.ta.length&&(this.Uh?this.Xo():this.stop())}else{0>this.Da&&(this.Da=this.ta.length-1);for(;0<=this.Da&&this.ta[this.Da].ab>=this.$c;)this.Da-=1;for(this.$c+=this.Od*a;0<=this.Da&&this.ta[this.Da].ab>=
this.$c;)this.ta[this.Da].action(this.ta[this.Da].ab,this),this.Da-=1;0>this.Da&&0>=this.$c&&(this.Uh?this.Xo():this.stop())}};function ic(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.nc=[];this.xf=[];this.clear();this.Kx=!1;J(this)}e=ic.prototype;e.ba=function(){var a,b,c,d,f;if(this.Kx)for(a=0;16>a;a+=1)I.ia[a].zb&&(b=I.ia[a].x,c=I.ia[a].y,d=this.xf[a],f=this.nc[d],!(0<=d&&f&&f.selected)||f&&ec(f.qb,0,0,b,c)||(Jb(I,f.keyCode),f.selected=!1,this.xf[a]=-1),this.Mb(a,b,c))};
e.Mb=function(a,b,c){var d;if(!(0<=this.xf[a]))for(d=0;d<this.nc.length;d+=1){var f;if(f=this.nc[d])f=(f=this.nc[d])?ec(f.qb,0,0,b,c):!1;if(f&&!this.nc[d].selected){Ib(I,this.nc[d].keyCode);this.nc[d].selected=!0;this.xf[a]=d;break}}};e.Nb=function(a){var b=this.xf[a];0<=b&&this.nc[b]&&this.nc[b].selected&&(Jb(I,this.nc[b].keyCode),this.nc[b].selected=!1);this.xf[a]=-1};function jc(a,b,c,d,f,h,k){c=Yb(c,d,f,h);a.nc.push({keyCode:k,qb:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.nc.length=0;16>a;a+=1)this.xf[a]=-1};e.sc=function(a,b,c){var d,f,h,k;for(d=0;d<this.nc.length;d+=1)if(f=this.nc[d])f.selected?f.qb.sc(0,0,b):f.qb.sc(0,0,a),h=(f.qb.ea+f.qb.Pa)/2,k=(f.qb.wa+f.qb.sb)/2,m.Mc("id: "+f.id,h-20,k-10,c,"16px Arial"),m.Mc("key: "+f.keyCode,h-20,k+10,c,"16px Arial")};new ga;function kc(a,b){return b}function L(a,b,c,d){return b+a/d*c}function lc(a,b,c,d,f){void 0===f&&(f=3);return b+c*Math.pow(a/d,f)}
function mc(a,b,c,d){return lc(a,b,c,d,2)}function nc(a,b,c,d){return lc(a,b,c,d,3)}function oc(a,b,c,d){return b+c*lc(d-a,1,-1,d,3)}function pc(a,b,c,d){return b+c*(a<d/2?lc(a,0,.5,d/2,3):lc(d-a,1,-.5,d/2,3))}function qc(a,b,c,d){return b+c*lc(d-a,1,-1,d,4)}function rc(a,b,c,d){return b+c*(a<d/2?0+.5*(1-Math.cos(a/(d/2)*Math.PI/2)):1+-.5*(1-Math.cos((d-a)/(d/2)*Math.PI/2)))}function sc(a,b,c,d){return b+c*(1+-1*(1-Math.sqrt(1-Math.pow((d-a)/d,2))))}
function tc(a,b,c,d,f,h){a=d-a;var k=h;void 0===f&&(f=3);void 0===k&&(k=8);h=Math.sin(2*(1-a/d)*Math.PI*f+Math.PI/2);f=k;void 0===f&&(f=8);k=Math.pow(2,-f);h*=0+(Math.pow(2,f*a/d-f)-k)/(1-k)*1;return b+c*(1+-1*h)}function uc(a,b,c,d,f){void 0===f&&(f=1.70158);return b+c*((1+f)*Math.pow(a/d,3)-f*Math.pow(a/d,2))}function vc(a,b,c,d,f){return b+c*uc(d-a,1,-1,d,f)}
function wc(a){switch(1){case 0:return function(b,c,d,f,h,k,l){return 0>b?c:b>f?c+d:a(b,c,d,f,h,k,l)};case 1:return function(b,c,d,f,h,k,l){return a(b-Math.floor(b/f)*f,c,d,f,h,k,l)};case 2:return function(b,c,d,f,h,k,l){b=0===Math.floor(b/f)%2?a(b-Math.floor(b/f)*f,0,1,f,h,k,l):a(f-b+Math.floor(b/f)*f,0,1,f,h,k,l);return c+d*b};case 3:return function(b,c,d,f,h,k,l){h=a(b-Math.floor(b/f)*f,0,1,f,h,k,l);0!==Math.floor(b/f)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,f,h,k,l){var n=Math.floor(b/
f);b=a(b-Math.floor(b/f)*f,0,1,f,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,f,h,k,l){var n=Math.floor(b/f);b=0===Math.floor(b/f)%2?a(b-Math.floor(b/f)*f,0,1,f,h,k,l):a(f-b+Math.floor(b/f)*f,1,-1,f,h,k,l);return c+d*(n+b)};default:return function(b,c,d,f,h,k,l){return a(b,c,d,f,h,k,l)}}}
function yc(a,b,c){var d,f=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)f+=c[d];for(d=0;d<a.length;d+=1)c[d]/=f;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),f=a[d]===kc?0:b[d]?-1:1,k.push(k[d]+f),h=Math.max(h,k[d+1]);return function(d,f,u,B,D,s,t){var v,x;v=a.length-1;for(x=0;x<a.length;x+=1)if(d/B<=l[x+1]){v=x;break}d=a[v](d/B-l[v],0,1,c[v],D,s,t);b[v]&&(d=-d);return f+(k[v]+d)*u/h}}
var M=window.TG_InitSettings||{};M.size=void 0!==M.size?M.size:"big";M.Wt=M.usesFullScreen;M.Zo="big"===M.size?1:.5;M.Yf=20;M.Zf=10;M.Xe=0;M.Pk=-10;M.eh=-20;M.Fc=-30;M.ue=-40;
function N(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(M.Zo*a);break a;case "round":c=Math.round(M.Zo*a);break a;default:c=M.Zo*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=N(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=N(a[c],b));return a}}function O(a){return"big"===M.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}var P=P||{};P["nl-nl"]=P["nl-nl"]||{};
P["nl-nl"].TutorialTitle_3="Levels";P["nl-nl"].TutorialText_3="Laat alle bubbels knappen om naar het volgende level te gaan";P["nl-nl"].TutorialTitle_0="Zo speel je";P["nl-nl"].TutorialText_5="Als een bubbel voorbij de streep onder in beeld komt, is het spel afgelopen en kun je het nog eens proberen.";P["nl-nl"].TutorialTitle_5="Kijk uit!";P["nl-nl"].TutorialText_2="Elke bubbel is punten waard. Voor grotere groepen krijg je meer punten.";P["nl-nl"].TutorialTitle_2="Score";
P["nl-nl"].TutorialText_1="Door groepen te maken, laat je de bubbels knappen.";P["nl-nl"].TutorialText_0="Schiet op de bubbels om groepen van drie of meer bubbels van dezelfde kleur te maken.";P["nl-nl"].TutorialTitle_1="Zo speel je";P["nl-nl"].bs_awesome="Briljant!";P["nl-nl"].bs_great="Super!";P["nl-nl"].bs_nice="Mooi!";P["nl-nl"].bs_tap_to_switch_bubbles="#touch{Klik om de bubbels te verwisselen}{Tik om de bubbels te verwisselen}";P["nl-nl"].bs_switch="Wisselen";P["nl-nl"].bs_shootallbubbles="Kun jij de hoogste score neerzetten?";
P["nl-nl"].bs_gameover="Game over";P["nl-nl"].bs_start="Doel";P["nl-nl"].bs_stage="Level";P["nl-nl"].TutorialText_4="Haal de hoogste score door zo veel mogelijk levels te voltooien.";P["nl-nl"].TutorialTitle_4="Topscore";P["nl-nl"].floater_0="Goed";P["nl-nl"].floater_1="Mooi!";P["nl-nl"].floater_2="Geweldig!";P["nl-nl"].floater_3="Fantastisch!";P["en-us"]=P["en-us"]||{};P["en-us"].TutorialTitle_3="Levels";P["en-us"].TutorialText_3="Pop all the bubbles to advance to the next level";
P["en-us"].TutorialTitle_0="How to play";P["en-us"].TutorialText_5="When a bubble crosses the line at the bottom of the screen, the game ends and you can try again.";P["en-us"].TutorialTitle_5="Watch out!";P["en-us"].TutorialText_2="Each bubble is worth points. Bigger groups earn you more points.";P["en-us"].TutorialTitle_2="Score";P["en-us"].TutorialText_1="Creating groups will pop bubbles.";P["en-us"].TutorialText_0="Shoot bubbles to form groups of 3 or more of the same color.";
P["en-us"].TutorialTitle_1="How to play";P["en-us"].bs_awesome="Awesome!";P["en-us"].bs_great="Great!";P["en-us"].bs_nice="Nice!";P["en-us"].bs_tap_to_switch_bubbles="#touch{Click to switch bubbles}{Tap to switch bubbles}";P["en-us"].bs_switch="Switch";P["en-us"].bs_shootallbubbles="Can you reach the highest score?";P["en-us"].bs_gameover="Game over";P["en-us"].bs_start="Goal";P["en-us"].bs_stage="Stage";P["en-us"].TutorialText_4="Get the highest score by completing as many levels as you can.";
P["en-us"].TutorialTitle_4="High score";P["en-us"].floater_0="Good";P["en-us"].floater_1="Nice!";P["en-us"].floater_2="Great!";P["en-us"].floater_3="Awesome!";P["en-gb"]=P["en-gb"]||{};P["en-gb"].TutorialTitle_3="Levels";P["en-gb"].TutorialText_3="Pop all the bubbles to advance to the next level";P["en-gb"].TutorialTitle_0="How to play";P["en-gb"].TutorialText_5="When a bubble crosses the line at the bottom of the screen, the game ends and you can try again.";P["en-gb"].TutorialTitle_5="Watch out!";
P["en-gb"].TutorialText_2="Each bubble is worth points. Bigger groups earn you more points.";P["en-gb"].TutorialTitle_2="Score";P["en-gb"].TutorialText_1="Creating groups will pop bubbles.";P["en-gb"].TutorialText_0="Shoot bubbles to form groups of 3 or more of the same color.";P["en-gb"].TutorialTitle_1="How to play";P["en-gb"].bs_awesome="Brilliant!";P["en-gb"].bs_great="Great!";P["en-gb"].bs_nice="Nice!";P["en-gb"].bs_tap_to_switch_bubbles="#touch{Click to switch bubbles}{Tap to switch bubbles}";
P["en-gb"].bs_switch="Switch";P["en-gb"].bs_shootallbubbles="Can you reach the highest score?";P["en-gb"].bs_gameover="Game over";P["en-gb"].bs_start="Goal";P["en-gb"].bs_stage="Stage";P["en-gb"].TutorialText_4="Get the highest score by completing as many levels as you can.";P["en-gb"].TutorialTitle_4="High score";P["en-gb"].floater_0="Good";P["en-gb"].floater_1="Nice!";P["en-gb"].floater_2="Great!";P["en-gb"].floater_3="Awesome!";P["de-de"]=P["de-de"]||{};P["de-de"].TutorialTitle_3="Levels";
P["de-de"].TutorialText_3="Lass alle Blasen platzen, um ins n\u00e4chste Level zu kommen";P["de-de"].TutorialTitle_0="Spielregeln";P["de-de"].TutorialText_5="Wenn eine Blase die untere Linie \u00fcberschreitet, ist das Spiel vorbei, und du kannst es nochmal versuchen.";P["de-de"].TutorialTitle_5="Vorsicht!";P["de-de"].TutorialText_2="Jede Blase ist Punkte wert. F\u00fcr gr\u00f6\u00dfere Gruppen kriegst du mehr Punkte.";P["de-de"].TutorialTitle_2="Punktzahl";P["de-de"].TutorialText_1="Bilde Gruppen, damit die Blasen platzen.";
P["de-de"].TutorialText_0="Schie\u00df Blasen herum, um gleichfarbige Gruppen aus drei oder mehr Blasen zu bilden.";P["de-de"].TutorialTitle_1="Spielregeln";P["de-de"].bs_awesome="Ganz toll!";P["de-de"].bs_great="Prima!";P["de-de"].bs_nice="Nett!";P["de-de"].bs_tap_to_switch_bubbles="#touch{Anklicken, um Blasen zu tauschen}{Antippen, um Blasen zu tauschen}";P["de-de"].bs_switch="Tauschen";P["de-de"].bs_shootallbubbles="Kannst du die Highscorezone erreichen?";P["de-de"].bs_gameover="Das Spiel ist aus";
P["de-de"].bs_start="Ziel";P["de-de"].bs_stage="Stufe";P["de-de"].TutorialText_4="Erreiche den Highscore, indem du so viele Level wie m\u00f6glich schaffst.";P["de-de"].TutorialTitle_4="Highscore";P["de-de"].floater_0="Gut!";P["de-de"].floater_1="Toll!";P["de-de"].floater_2="Super!";P["de-de"].floater_3="Fantastisch!";P["fr-fr"]=P["fr-fr"]||{};P["fr-fr"].TutorialTitle_3="Niveaux";P["fr-fr"].TutorialText_3="Faites \u00e9clater toutes les bulles pour passer au niveau suivant";
P["fr-fr"].TutorialTitle_0="Comment jouer";P["fr-fr"].TutorialText_5="Quand une bulle touche la ligne en bas de l'\u00e9cran, la partie et termin\u00e9e et vous devez recommencer.";P["fr-fr"].TutorialTitle_5="Attention\u00a0!";P["fr-fr"].TutorialText_2="Chaque bulle vaut des points. Les gros groupes de bulles donnent plus de points.";P["fr-fr"].TutorialTitle_2="Score";P["fr-fr"].TutorialText_1="Cr\u00e9er des groupes fait \u00e9clater les bulles.";P["fr-fr"].TutorialText_0="Tirez des bulles pour cr\u00e9er des groupes de 3 ou plus de la m\u00eame couleur.";
P["fr-fr"].TutorialTitle_1="Comment jouer";P["fr-fr"].bs_awesome="G\u00e9nial\u00a0!";P["fr-fr"].bs_great="Super\u00a0!";P["fr-fr"].bs_nice="Bien\u00a0!";P["fr-fr"].bs_tap_to_switch_bubbles="#touch{Cliquez pour intervertir les bulles}{Touchez pour intervertir les bulles}";P["fr-fr"].bs_switch="Intervertir";P["fr-fr"].bs_shootallbubbles="Pouvez-vous atteindre le meilleur score ?";P["fr-fr"].bs_gameover="Game over";P["fr-fr"].bs_start="Objectif";P["fr-fr"].bs_stage="Niveau";
P["fr-fr"].TutorialText_4="Obtenez le meilleur score en finissant autant de niveaux que possible.";P["fr-fr"].TutorialTitle_4="Meilleur score";P["fr-fr"].floater_0="Bien !";P["fr-fr"].floater_1="Joli !";P["fr-fr"].floater_2="G\u00e9nial !";P["fr-fr"].floater_3="Excellent !";P["pt-br"]=P["pt-br"]||{};P["pt-br"].TutorialTitle_3="Fases";P["pt-br"].TutorialText_3="Estoure todas as bolhas para avan\u00e7ar para a pr\u00f3xima fase";P["pt-br"].TutorialTitle_0="Como jogar";P["pt-br"].TutorialText_5="Quando uma bolha cruza a linha na parte inferior da tela, o jogo se encerra e voc\u00ea pode tentar novamente.";
P["pt-br"].TutorialTitle_5="Cuidado!";P["pt-br"].TutorialText_2="Cada bolha tem um valor em pontos. Grandes conjuntos garantem mais pontos.";P["pt-br"].TutorialTitle_2="Pontua\u00e7\u00e3o";P["pt-br"].TutorialText_1="Criar conjuntos ir\u00e1 estourar bolhas.";P["pt-br"].TutorialText_0="Foque nas bolhas para formar conjuntos com 3 ou mais da mesma cor.";P["pt-br"].TutorialTitle_1="Como jogar";P["pt-br"].bs_awesome="Incr\u00edvel!";P["pt-br"].bs_great="\u00d3timo!";P["pt-br"].bs_nice="Bacana!";
P["pt-br"].bs_tap_to_switch_bubbles="#touch{Clique para trocar as bolhas}{Toque para trocar as bolhas}";P["pt-br"].bs_switch="Interruptor";P["pt-br"].bs_shootallbubbles="Voc\u00ea consegue atingir a pontua\u00e7\u00e3o mais alta?";P["pt-br"].bs_gameover="Fim de jogo";P["pt-br"].bs_start="Objetivo";P["pt-br"].bs_stage="Fase";P["pt-br"].TutorialText_4="Obtenha a maior pontua\u00e7\u00e3o poss\u00edvel ao completar o m\u00e1ximo de fases que voc\u00ea conseguir.";P["pt-br"].TutorialTitle_4="Pontua\u00e7\u00e3o M\u00e1xima";
P["pt-br"].floater_0="Bom";P["pt-br"].floater_1="Legal!";P["pt-br"].floater_2="\u00d3timo!";P["pt-br"].floater_3="Incr\u00edvel!";P["es-es"]=P["es-es"]||{};P["es-es"].TutorialTitle_3="Niveles";P["es-es"].TutorialText_3="Estalla todas las burbujas para pasar de nivel.";P["es-es"].TutorialTitle_0="C\u00f3mo jugar";P["es-es"].TutorialText_5="Si una burbuja cruza la l\u00ednea de la abajo en la pantalla, el juego termina y vuelves a empezar.";P["es-es"].TutorialTitle_5="\u00a1Cuidado!";
P["es-es"].TutorialText_2="Ganas puntos por cada burbuja. Los grupos grandes dan m\u00e1s puntos.";P["es-es"].TutorialTitle_2="Puntuaci\u00f3n";P["es-es"].TutorialText_1="Crea grupos para estallar burbujas.";P["es-es"].TutorialText_0="Dispara burbujas para crear grupos de 3 o m\u00e1s del mismo color.";P["es-es"].TutorialTitle_1="C\u00f3mo jugar";P["es-es"].bs_awesome="\u00a1Estupendo!";P["es-es"].bs_great="\u00a1Genial!";P["es-es"].bs_nice="\u00a1Bien!";P["es-es"].bs_tap_to_switch_bubbles="#touch{Clic para cambiar de burbuja}{Toca para cambiar de burbuja}";
P["es-es"].bs_switch="Cambiar";P["es-es"].bs_shootallbubbles="\u00bfSer\u00e1s capaz de batir el r\u00e9cord?";P["es-es"].bs_gameover="Fin del juego";P["es-es"].bs_start="Objetivo";P["es-es"].bs_stage="Nivel";P["es-es"].TutorialText_4="Bate el r\u00e9cord completando tantos niveles como puedas.";P["es-es"].TutorialTitle_4="R\u00e9cord";P["es-es"].floater_0="Bien";P["es-es"].floater_1="\u00a1Guay!";P["es-es"].floater_2="\u00a1Mola!";P["es-es"].floater_3="\u00a1Estupendo!";P["tr-tr"]=P["tr-tr"]||{};
P["tr-tr"].TutorialTitle_3="Seviyeler";P["tr-tr"].TutorialText_3="Yeni seviyeye ge\u00e7mek i\u00e7in t\u00fcm baloncuklar\u0131 patlat";P["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";P["tr-tr"].TutorialText_5="Bir baloncuk ekran\u0131n alt\u0131ndaki \u00e7izgiyi ge\u00e7ti\u011finde oyun biter ve tekrar denersiniz.";P["tr-tr"].TutorialTitle_5="Dikkat et!";P["tr-tr"].TutorialText_2="Her baloncuk puan eder. B\u00fcy\u00fck gruplar daha fazla puan verir.";P["tr-tr"].TutorialTitle_2="Puan";
P["tr-tr"].TutorialText_1="Grup yaratmak baloncuklar\u0131 patlat\u0131r.";P["tr-tr"].TutorialText_0="Ayn\u0131 renkten 3 baloncuk yapmak i\u00e7in baloncuk f\u0131rlat\u0131rs\u0131n";P["tr-tr"].TutorialTitle_1="Nas\u0131l oynan\u0131r";P["tr-tr"].bs_awesome="Muhte\u015fem!";P["tr-tr"].bs_great="Harika!";P["tr-tr"].bs_nice="G\u00fczel!";P["tr-tr"].bs_tap_to_switch_bubbles="#touch{Baloncuk de\u011fi\u015ftirmek i\u00e7in t\u0131klay\u0131n}{Baloncuk de\u011fi\u015ftirmek i\u00e7in dokunun}";
P["tr-tr"].bs_switch="De\u011fi\u015ftir";P["tr-tr"].bs_shootallbubbles="En y\u00fcksek puana ula\u015fabilecek misin?";P["tr-tr"].bs_gameover="Oyun Bitti";P["tr-tr"].bs_start="Hedef";P["tr-tr"].bs_stage="B\u00f6l\u00fcm";P["tr-tr"].TutorialText_4="Bitirebildi\u011fin kadar b\u00f6l\u00fcm bitirerek en y\u00fcksek puana ula\u015f.";P["tr-tr"].TutorialTitle_4="Y\u00fcksek Puan";P["tr-tr"].floater_0="\u0130yi";P["tr-tr"].floater_1="G\u00fczel!";P["tr-tr"].floater_2="Harika!";P["tr-tr"].floater_3="Muhte\u015fem!";
P["ru-ru"]=P["ru-ru"]||{};P["ru-ru"].TutorialTitle_3="Levels";P["ru-ru"].TutorialText_3="Pop all the bubbles to advance to the next level";P["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";P["ru-ru"].TutorialText_5="When a bubble crosses the line at the bottom of the screen, the game ends and you can try again.";P["ru-ru"].TutorialTitle_5="Watch out!";P["ru-ru"].TutorialText_2="\u0417\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u043f\u0443\u0437\u044b\u0440\u044c \u0432\u044b \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442\u0435 \u043e\u0447\u043a\u0438. \u0427\u0435\u043c \u0431\u043e\u043b\u044c\u0448\u0435 \u0433\u0440\u0443\u043f\u043f\u0430, \u0442\u0435\u043c \u0431\u043e\u043b\u044c\u0448\u0435 \u043e\u0447\u043a\u043e\u0432 \u0432\u044b \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442\u0435.";
P["ru-ru"].TutorialTitle_2="Score";P["ru-ru"].TutorialText_1="Creating groups will pop bubbles.";P["ru-ru"].TutorialText_0="\u0421\u0442\u0440\u0435\u043b\u044f\u0439\u0442\u0435 \u043f\u0443\u0437\u044b\u0440\u044f\u043c\u0438, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0435\u0434\u0438\u043d\u0438\u0442\u044c 3 \u0438 \u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0443\u0437\u044b\u0440\u0435\u0439 \u043e\u0434\u043d\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430.";
P["ru-ru"].TutorialTitle_1="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";P["ru-ru"].bs_awesome="\u041a\u0440\u0443\u0442\u043e!";P["ru-ru"].bs_great="\u041e\u0442\u043b\u0438\u0447\u043d\u043e!";P["ru-ru"].bs_nice="\u0417\u0434\u043e\u0440\u043e\u0432\u043e!";P["ru-ru"].bs_tap_to_switch_bubbles="#touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u0443\u0437\u044b\u0440\u0438 \u043c\u0435\u0441\u0442\u0430\u043c\u0438}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u0443\u0437\u044b\u0440\u0438 \u043c\u0435\u0441\u0442\u0430\u043c\u0438}";
P["ru-ru"].bs_switch="\u0421\u043c\u0435\u043d\u0430 \u0446\u0432\u0435\u0442\u0430";P["ru-ru"].bs_shootallbubbles="Can you reach the highest score?";P["ru-ru"].bs_gameover="\u041a\u043e\u043d\u0435\u0446 \u0438\u0433\u0440\u044b";P["ru-ru"].bs_start="\u0426\u0435\u043b\u044c";P["ru-ru"].bs_stage="\u042d\u0442\u0430\u043f";P["ru-ru"].TutorialText_4="Get the highest score by completing as many levels as you can.";P["ru-ru"].TutorialTitle_4="High score";P["ru-ru"].floater_0="\u0425\u043e\u0440\u043e\u0448\u043e";
P["ru-ru"].floater_1="\u0417\u0434\u043e\u0440\u043e\u0432\u043e!";P["ru-ru"].floater_2="\u041e\u0442\u043b\u0438\u0447\u043d\u043e!";P["ru-ru"].floater_3="\u041a\u0440\u0443\u0442\u043e!";P["ar-eg"]=P["ar-eg"]||{};P["ar-eg"].TutorialTitle_3="Levels";P["ar-eg"].TutorialText_3="Pop all the bubbles to advance to the next level";P["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";P["ar-eg"].TutorialText_5="When a bubble crosses the line at the bottom of the screen, the game ends and you can try again.";
P["ar-eg"].TutorialTitle_5="Watch out!";P["ar-eg"].TutorialText_2="\u062a\u0633\u0627\u0648\u064a \u0643\u0644 \u0641\u0642\u0627\u0639\u0629 \u0639\u062f\u062f\u064b\u0627 \u0645\u0646 \u0627\u0644\u0646\u0642\u0627\u0637. \u0648\u0643\u0644\u0645\u0627 \u0632\u0627\u062f \u0639\u062f\u062f \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0641\u064a \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629\u060c \u0632\u0627\u062f \u0639\u062f\u062f \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062a\u0628 \u062a\u062c\u0645\u0639\u0647\u0627.";
P["ar-eg"].TutorialTitle_2="Score";P["ar-eg"].TutorialText_1="Creating groups will pop bubbles.";P["ar-eg"].TutorialText_0="\u0642\u0645 \u0628\u0642\u0630\u0641 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0644\u062a\u0643\u0648\u064a\u0646 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b \u0641\u0642\u0627\u0639\u0627\u062a \u0623\u0648 \u0643\u062b\u0631 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.";P["ar-eg"].TutorialTitle_1="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";
P["ar-eg"].bs_awesome="\u0631\u0627\u0626\u0639!";P["ar-eg"].bs_great="\u0639\u0638\u064a\u0645!";P["ar-eg"].bs_nice="\u062c\u064a\u062f!";P["ar-eg"].bs_tap_to_switch_bubbles="#touch{\u0627\u0646\u0642\u0631 \u0644\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a}{\u0627\u0644\u0645\u0633 \u0644\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a}";P["ar-eg"].bs_switch="\u062a\u0628\u062f\u064a\u0644";P["ar-eg"].bs_shootallbubbles="Can you reach the highest score?";
P["ar-eg"].bs_gameover="\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u0644\u0639\u0628\u0629";P["ar-eg"].bs_start="\u0627\u0644\u0647\u062f\u0641";P["ar-eg"].bs_stage="\u0627\u0644\u0645\u0631\u062d\u0644\u0629";P["ar-eg"].TutorialText_4="Get the highest score by completing as many levels as you can.";P["ar-eg"].TutorialTitle_4="High score";P["ar-eg"].floater_0="\u062c\u064a\u062f";P["ar-eg"].floater_1="\u062c\u064a\u062f!";P["ar-eg"].floater_2="\u0639\u0638\u064a\u0645!";P["ar-eg"].floater_3="\u0631\u0627\u0626\u0639!";
P["ko-kr"]=P["ko-kr"]||{};P["ko-kr"].TutorialTitle_3="Levels";P["ko-kr"].TutorialText_3="Pop all the bubbles to advance to the next level";P["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";P["ko-kr"].TutorialText_5="When a bubble crosses the line at the bottom of the screen, the game ends and you can try again.";P["ko-kr"].TutorialTitle_5="Watch out!";P["ko-kr"].TutorialText_2="\uac01 \ubc84\ube14\uc774 \uc810\uc218\uac00 \ub429\ub2c8\ub2e4. \ub354 \ud070 \uadf8\ub8f9\uc740 \ub354 \ub9ce\uc740 \uc810\uc218\ub97c \ud68d\ub4dd\ud569\ub2c8\ub2e4.";
P["ko-kr"].TutorialTitle_2="Score";P["ko-kr"].TutorialText_1="Creating groups will pop bubbles.";P["ko-kr"].TutorialText_0="3\uac1c \uc774\uc0c1\uc758 \uac19\uc740 \uc0c9 \uadf8\ub8f9\uc744 \ud5a5\ud574 \uc3d8\uc138\uc694.";P["ko-kr"].TutorialTitle_1="\uac8c\uc784 \ubc29\ubc95";P["ko-kr"].bs_awesome="\uba4b\uc9c0\uad70\uc694!";P["ko-kr"].bs_great="\ud6cc\ub96d\ud574!";P["ko-kr"].bs_nice="\uc88b\uc544\uc694!";P["ko-kr"].bs_tap_to_switch_bubbles="#touch{\ubc84\ube14\uc744 \ubc14\uafb8\ub824\uba74 \uc804\ud658\uc744 \ud074\ub9ad\ud558\uc138\uc694}{\ubc84\ube14\uc744 \ubc14\uafb8\ub824\uba74 \uc804\ud658\uc744 \ub204\ub974\uc138\uc694}";
P["ko-kr"].bs_switch="\uc804\ud658";P["ko-kr"].bs_shootallbubbles="Can you reach the highest score?";P["ko-kr"].bs_gameover="Game over";P["ko-kr"].bs_start="\ubaa9\ud45c";P["ko-kr"].bs_stage="Stage";P["ko-kr"].TutorialText_4="Get the highest score by completing as many levels as you can.";P["ko-kr"].TutorialTitle_4="High score";P["ko-kr"].floater_0="\uc88b\uc544\uc694";P["ko-kr"].floater_1="\uba4b\uc838\uc694!";P["ko-kr"].floater_2="\ud6cc\ub96d\ud574\uc694!";P["ko-kr"].floater_3="\uad49\uc7a5\ud558\uad70\uc694!";
P["jp-jp"]=P["jp-jp"]||{};P["jp-jp"].TutorialTitle_3="\u30ec\u30d9\u30eb";P["jp-jp"].TutorialText_3="\u753b\u9762\u306e\u30d0\u30d6\u30eb\u3092\u305c\u3093\u3076\u6d88\u3057\u3066 \u6b21\u306e\u30ec\u30d9\u30eb\u306b\u9032\u3082\u3046\uff01";P["jp-jp"].TutorialTitle_0="\u3042\u305d\u3073\u65b9";P["jp-jp"].TutorialText_5="\u30d0\u30d6\u30eb\u304c\u753b\u9762\u4e0b\u306e\u7dda\u3092\u3053\u3048\u308b\u3068 \u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc\u3002 \u3082\u3046\u4e00\u5ea6\u30c8\u30e9\u30a4\u3057\u3088\u3046";
P["jp-jp"].TutorialTitle_5="\u6ce8\u610f\uff01";P["jp-jp"].TutorialText_2="\u30d0\u30d6\u30eb\u306e\u6570\u3067\u30dd\u30a4\u30f3\u30c8\u306f\u6c7a\u307e\u308b\u3088\u3002\n\u305f\u304f\u3055\u3093\u305d\u308d\u3048\u3066\n\u9ad8\u30dd\u30a4\u30f3\u30c8\u3092\u30b2\u30c3\u30c8\u3057\u3088\u3046";P["jp-jp"].TutorialTitle_2="\u30b9\u30b3\u30a2";P["jp-jp"].TutorialText_1="\u305d\u308d\u3046\u3068\u30d0\u30d6\u30eb\u304c\u306f\u3058\u3051\u308b\u3088";P["jp-jp"].TutorialText_0="\u30d0\u30d6\u30eb\u3092\u306a\u3052\u3066 \u540c\u3058\u8272\u30923\u3064\u4ee5\u4e0a\u305d\u308d\u3048\u3088\u3046";
P["jp-jp"].TutorialTitle_1="\u3042\u305d\u3073\u65b9";P["jp-jp"].bs_awesome="Amazing!";P["jp-jp"].bs_great="Great!";P["jp-jp"].bs_nice="Nice!";P["jp-jp"].bs_tap_to_switch_bubbles="#touch{\u30af\u30ea\u30c3\u30af\u3057\u3066\u30d0\u30d6\u30eb\u3092\u3044\u308c\u304b\u3048\u308b}{\u30bf\u30c3\u30d7\u3057\u3066\u30d0\u30d6\u30eb\u3092\u3044\u308c\u304b\u3048\u308b}";P["jp-jp"].bs_switch="\u30d0\u30d6\u30eb\u306e\u3044\u308c\u304b\u3048";P["jp-jp"].bs_shootallbubbles="\u30d0\u30d6\u30eb\u3092\u5f3e\u3044\u3066\n\u30cf\u30a4\u30b9\u30b3\u30a2\u3092\u72d9\u304a\u3046\uff01";
P["jp-jp"].bs_gameover="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";P["jp-jp"].bs_start="\u30b4\u30fc\u30eb";P["jp-jp"].bs_stage="\u30b9\u30c6\u30fc\u30b8";P["jp-jp"].TutorialText_4="\u30ec\u30d9\u30eb\u3092\u305f\u304f\u3055\u3093\u30af\u30ea\u30a2\u3057\u3066\n\u30cf\u30a4\u30b9\u30b3\u30a2\u3092\u72d9\u304a\u3046";P["jp-jp"].TutorialTitle_4="\u30cf\u30a4\u30b9\u30b3\u30a2";P["jp-jp"].floater_0="Good";P["jp-jp"].floater_1="Nice!";P["jp-jp"].floater_2="Great!";P["jp-jp"].floater_3="Amazing!";
window.throbber=new tb("throbber","media/throbber.png");window.TG_StartScreenLogo=new tb("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");window.lvl_test=" 0 0 0 0 0   D   0 0 0 0 0 ;0 1 5 3 4 4     4 3 5 5 5  ; 1 5 5 1 1 1 | 5 3 3 5 2   ;2 5 2 5 2 1  |2 5 2 5 2 1  ;   5 5 5 0 1 | 5 5 5 5 5   ;R   2 3 5 5  |4 4 5 5 4    ;   1 1 1 1 1 | 3 3 3 3 2   ;2 2 2 2 2 2  |2 1 2 2 2 1  ;                             ;B B B B B r     e B B B B B".split(";");var zc=new ua("StartTexture",2,"start");
window.StartTexture=zc;va(zc,0,"media/StartTexture0.png");va(zc,1,"media/StartTexture1.png");var Ac=new ua("StartScreenTexture",1,"load");window.StartScreenTexture=Ac;va(Ac,0,"media/StartScreenTexture0.png");var Bc=new ua("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=Bc;va(Bc,0,"media/LevelMapScreenTexture0.png");var Cc=new ua("LevelEndTexture",2,"load");window.LevelEndTexture=Cc;va(Cc,0,"media/LevelEndTexture0.png");va(Cc,1,"media/LevelEndTexture1.png");
var Q=new ua("MenuTexture",2,"load");window.MenuTexture=Q;va(Q,0,"media/MenuTexture0.png");va(Q,1,"media/MenuTexture1.png");var Dc=new ua("GameTexture",2,"load");window.GameTexture=Dc;va(Dc,0,"media/GameTexture0.png");va(Dc,1,"media/GameTexture1.png");var Ec=new ua("GameStaticTexture",2,"load");window.GameStaticTexture=Ec;va(Ec,0,"media/GameStaticTexture0.png");va(Ec,1,"media/GameStaticTexture1.png");var Fc=new ua("TutorialTexture",1,"load");window.TutorialTexture=Fc;va(Fc,0,"media/TutorialTexture0.png");
var Gc=new ua("FloaterTexture",1,"load");window.FloaterTexture=Gc;va(Gc,0,"media/FloaterTexture0.png");var Hc=new p("s_loadingbar_background",Ac,1,42,32,0,0,42,32,1);window.s_loadingbar_background=Hc;Hc.c(0,0,937,1,42,32,0,0);var Ic=new p("s_level_0",Bc,1,125,140,0,0,125,140,1);window.s_level_0=Ic;Ic.c(0,0,129,1,125,140,0,0);var Jc=new p("s_level_1",Bc,1,125,140,0,0,125,140,1);window.s_level_1=Jc;Jc.c(0,0,257,1,125,140,0,0);var Kc=new p("s_level_2",Bc,1,125,140,0,0,125,140,1);window.s_level_2=Kc;
Kc.c(0,0,1,1,125,140,0,0);var Lc=new p("s_level_3",Bc,1,125,140,0,0,125,140,1);window.s_level_3=Lc;Lc.c(0,0,385,1,125,140,0,0);var Mc=new p("s_level_lock",Bc,1,48,70,0,0,48,70,1);window.s_level_lock=Mc;Mc.c(0,0,777,113,48,69,0,1);var Nc=new p("s_level_stars",Bc,1,126,46,0,0,126,46,1);window.s_level_stars=Nc;Nc.c(0,0,513,1,126,45,0,1);var Oc=new p("s_level2_0",Bc,1,84,87,0,0,84,87,1);window.s_level2_0=Oc;Oc.c(0,0,897,97,84,87,0,0);var Pc=new p("s_level2_1",Bc,1,84,87,0,0,84,87,1);
window.s_level2_1=Pc;Pc.c(0,0,897,1,84,87,0,0);var Qc=new p("s_level2_2",Bc,1,84,87,0,0,84,87,1);window.s_level2_2=Qc;Qc.c(0,0,601,113,84,87,0,0);var Rc=new p("s_level2_3",Bc,1,84,87,0,0,84,87,1);window.s_level2_3=Rc;Rc.c(0,0,513,49,84,87,0,0);var Sc=new p("s_level2_arrow_right",Bc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=Sc;Sc.c(0,0,833,1,60,108,0,0);Sc.c(1,0,641,1,60,108,0,0);var Tc=new p("s_level2_arrow_left",Bc,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=Tc;
Tc.c(0,0,705,1,60,108,0,0);Tc.c(1,0,769,1,60,108,0,0);var Uc=new p("s_level2_lock",Bc,1,84,87,0,0,84,87,1);window.s_level2_lock=Uc;Uc.c(0,0,689,113,84,87,0,0);var Vc=new p("s_pop_medal",Cc,8,378,378,189,189,3024,378,8);window.s_pop_medal=Vc;Vc.c(0,0,569,1,349,241,3,69);Vc.c(1,0,569,529,346,267,5,54);Vc.c(2,0,569,249,348,276,20,56);Vc.c(3,1,1,1,342,288,26,50);Vc.c(4,1,689,1,319,292,22,46);Vc.c(5,1,1,297,337,304,14,41);Vc.c(6,0,1,601,343,305,12,41);Vc.c(7,1,345,1,341,304,13,41);
var Wc=new p("s_medal_shadow",Cc,1,195,208,0,0,195,208,1);window.s_medal_shadow=Wc;Wc.c(0,0,353,817,189,204,3,1);var Xc=new p("s_medal_shine",Cc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Xc;Xc.c(0,1,545,513,193,207,1,1);Xc.c(1,1,345,313,193,207,1,1);Xc.c(2,0,353,601,193,207,1,1);Xc.c(3,1,689,297,193,207,1,1);Xc.c(4,0,553,801,193,207,1,1);Xc.c(5,0,753,801,193,207,1,1);var Yc=new p("s_icon_toggle_hard",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Yc;Yc.c(0,0,945,193,67,67,0,0);
var Zc=new p("s_icon_toggle_medium",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Zc;Zc.c(0,0,801,537,67,67,0,0);var $c=new p("s_icon_toggle_easy",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=$c;$c.c(0,0,937,265,67,67,0,0);var ad=new p("s_flagIcon_us",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_us=ad;ad.c(0,0,729,753,48,36,0,6);var bd=new p("s_flagIcon_gb",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=bd;bd.c(0,0,953,721,48,36,0,6);var cd=new p("s_flagIcon_nl",Q,1,48,48,0,0,48,48,1);
window.s_flagIcon_nl=cd;cd.c(0,0,897,721,48,36,0,6);var dd=new p("s_flagIcon_tr",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=dd;dd.c(0,0,841,713,48,36,0,6);var ed=new p("s_flagIcon_de",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_de=ed;ed.c(0,0,785,753,48,36,0,6);var fd=new p("s_flagIcon_fr",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=fd;fd.c(0,0,841,753,48,36,0,6);var gd=new p("s_flagIcon_br",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_br=gd;gd.c(0,0,57,793,48,36,0,6);
var hd=new p("s_flagIcon_es",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_es=hd;hd.c(0,0,1,793,48,36,0,6);var id=new p("s_flagIcon_jp",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_jp=id;id.c(0,0,113,793,48,36,0,6);var jd=new p("s_flagIcon_ru",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=jd;jd.c(0,0,897,761,48,36,0,6);var kd=new p("s_flagIcon_ar",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=kd;kd.c(0,0,673,761,48,36,0,6);var ld=new p("s_flagIcon_kr",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=ld;
ld.c(0,0,785,713,48,36,0,6);var md=new p("s_flagIcon_it",Q,1,48,48,0,0,48,48,1);window.s_flagIcon_it=md;md.c(0,0,953,761,48,36,0,6);var nd=new p("s_tutorialButton_close",Q,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=nd;nd.c(0,0,929,609,65,65,0,0);var od=new p("s_tutorialButton_next",Q,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=od;od.c(0,0,945,537,66,65,0,0);var pd=new p("s_tutorialButton_previous",Q,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=pd;pd.c(0,0,873,537,66,65,0,0);
var qd=new p("s_logo_tinglygames",Q,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=qd;qd.c(0,0,569,177,240,240,0,0);var rd=new p("s_logo_coolgames",Q,1,240,240,0,0,240,240,1);window.s_logo_coolgames=rd;rd.c(0,0,569,1,240,167,0,36);var sd=new p("s_logo_tinglygames_start",Ac,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=sd;sd.c(0,0,625,1,156,53,0,0);var td=new p("s_logo_coolgames_start",Ac,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=td;td.c(0,0,785,1,150,104,75,0);
var ud=new p("s_ui_cup_highscore",Dc,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=ud;ud.c(0,0,985,721,32,28,0,0);var vd=new p("s_ui_cup_score",Dc,1,28,24,0,0,28,24,1);window.s_ui_cup_score=vd;vd.c(0,0,953,873,28,24,0,0);var wd=new p("s_ui_divider",Ec,1,94,2,0,0,94,2,1);window.s_ui_divider=wd;wd.c(0,0,857,49,94,2,0,0);var xd=new p("s_ui_background_blank",Ec,1,140,580,0,0,140,580,1);window.s_ui_background_blank=xd;xd.c(0,0,585,1,140,580,0,0);var yd=new p("s_ui_highscore",Ec,1,26,36,13,12,26,36,1);
window.s_ui_highscore=yd;yd.c(0,0,969,1,26,36,0,0);var zd=new p("s_ui_progressbar_background",Ec,1,120,190,60,60,120,190,1);window.s_ui_progressbar_background=zd;zd.c(0,0,729,49,120,190,0,0);var Ad=new p("s_ui_progressbar_frame",Dc,1,120,118,60,60,120,118,1);window.s_ui_progressbar_frame=Ad;Ad.c(0,0,545,281,120,118,0,0);var Bd=new p("s_tutorial_01",Fc,1,350,190,0,0,350,190,1);window.s_tutorial_01=Bd;Bd.c(0,0,1,1,350,190,0,0);var Cd=new p("s_tutorial_02",Fc,1,350,190,0,0,350,190,1);
window.s_tutorial_02=Cd;Cd.c(0,0,1,385,350,190,0,0);var Dd=new p("s_tutorial_03",Fc,1,350,190,0,0,350,190,1);window.s_tutorial_03=Dd;Dd.c(0,0,353,193,350,190,0,0);var Ed=new p("s_tutorial_04",Fc,1,350,190,0,0,350,190,1);window.s_tutorial_04=Ed;Ed.c(0,0,1,193,350,190,0,0);var Fd=new p("s_tutorial_05",Fc,1,350,190,0,0,350,190,1);window.s_tutorial_05=Fd;Fd.c(0,0,353,1,350,190,0,0);var Gd=new p("s_tutorial_06",Fc,1,350,190,0,0,350,190,1);window.s_tutorial_06=Gd;Gd.c(0,0,353,385,350,190,0,0);
var Hd=new p("s_arrow_switch",Ec,1,234,42,6,11,234,42,1);window.s_arrow_switch=Hd;Hd.c(0,0,729,1,234,42,0,0);var Id=new p("s_booster_bomb",Dc,1,50,50,25,25,50,50,1);window.s_booster_bomb=Id;Id.c(0,0,521,841,50,50,0,0);var Jd=new p("s_booster_fire",Dc,6,50,50,25,25,300,50,6);window.s_booster_fire=Jd;Jd.c(0,0,633,841,50,50,0,0);Jd.c(1,0,745,841,50,50,0,0);Jd.c(2,0,1,849,50,50,0,0);Jd.c(3,0,57,841,50,50,0,0);Jd.c(4,0,961,817,50,50,0,0);Jd.c(5,0,905,817,50,50,0,0);
var Kd=new p("s_booster_fire_trail",Dc,11,48,48,24,24,528,48,11);window.s_booster_fire_trail=Kd;Kd.c(0,0,545,481,48,46,0,1);Kd.c(1,0,225,849,48,48,0,0);Kd.c(2,0,73,657,46,46,0,1);Kd.c(3,0,977,753,44,44,2,2);Kd.c(4,0,281,849,42,42,3,3);Kd.c(5,0,985,681,38,38,5,5);Kd.c(6,0,329,849,36,36,6,6);Kd.c(7,0,369,849,35,35,7,7);Kd.c(8,0,409,849,34,34,7,7);Kd.c(9,0,881,873,33,33,8,8);Kd.c(10,0,921,873,30,30,9,9);var Ld=new p("s_booster_white",Dc,1,50,50,25,25,50,50,1);window.s_booster_white=Ld;
Ld.c(0,0,689,841,50,50,0,0);var Md=new p("s_bubble_blocker",Dc,1,50,50,25,25,50,50,1);window.s_bubble_blocker=Md;Md.c(0,0,169,849,50,50,0,0);var Nd=new p("s_cannon",Dc,1,66,132,33,99,66,132,1);window.s_cannon=Nd;Nd.c(0,0,473,281,66,132,0,0);var Od=new p("s_cannon_counter",Dc,1,154,80,120,34,154,80,1);window.s_cannon_counter=Od;Od.c(0,0,545,401,113,77,41,0);var Pd=new p("s_explosion",Dc,7,64,64,32,32,448,64,7);window.s_explosion=Pd;Pd.c(0,0,841,769,55,56,3,3);Pd.c(1,0,841,625,64,63,0,1);
Pd.c(2,0,1,657,64,64,0,0);Pd.c(3,0,913,681,64,64,0,0);Pd.c(4,0,841,697,64,64,0,0);Pd.c(5,0,473,417,64,64,0,0);Pd.c(6,0,945,609,63,64,1,0);var Qd=new p("s_effect_star",Dc,1,47,46,23,24,47,46,1);window.s_effect_star=Qd;Qd.c(0,0,601,481,47,46,0,0);var Rd=new p("s_guideline",Dc,1,7,260,0,0,7,260,1);window.s_guideline=Rd;Rd.c(0,0,825,529,7,259,0,1);var Sd=new p("s_guideline_pointer",Dc,1,21,21,10,10,21,21,1);window.s_guideline_pointer=Sd;Sd.c(0,0,521,489,21,21,0,0);
var Td=new p("s_pop",Dc,5,64,64,32,32,320,64,5);window.s_pop=Td;Td.c(0,0,913,625,30,24,19,19);Td.c(1,0,473,489,42,35,13,14);Td.c(2,0,65,729,50,53,6,5);Td.c(3,0,1,729,62,60,1,2);Td.c(4,0,913,753,62,62,0,1);var Ud=new p("s_mistake",Dc,1,72,72,36,36,72,72,1);window.s_mistake=Ud;Ud.c(0,0,945,529,72,72,0,0);var Vd=new p("s_pop_floater",Dc,8,378,378,174,193,3024,378,8);window.s_pop_floater=Vd;Vd.c(0,0,673,1,349,241,3,69);Vd.c(1,0,121,281,346,267,5,54);Vd.c(2,0,673,249,348,276,20,56);
Vd.c(3,0,121,553,342,288,26,50);Vd.c(4,1,689,1,319,292,22,46);Vd.c(5,1,345,1,337,304,14,41);Vd.c(6,0,473,529,343,305,12,41);Vd.c(7,1,1,1,341,304,13,41);var Wd=new p("s_bubbles",Dc,6,66,66,33,33,396,66,6);window.s_bubbles=Wd;Wd.c(0,0,65,785,50,50,8,8);Wd.c(1,0,1,793,50,50,8,8);Wd.c(2,0,825,833,50,50,8,8);Wd.c(3,0,465,841,50,50,8,8);Wd.c(4,0,577,841,50,50,8,8);Wd.c(5,0,113,849,50,50,8,8);var Xd=new p("s_logo",Ac,1,619,257,0,0,619,257,1);window.s_logo=Xd;Xd.c(0,0,1,1,619,257,0,0);
var Yd=new p("s_border",Dc,1,550,6,0,3,550,6,1);window.s_border=Yd;Yd.c(0,0,121,233,550,4,0,1);var $d=new p("s_border_warning",Dc,1,550,40,0,20,550,40,1);window.s_border_warning=$d;$d.c(0,0,121,241,550,35,0,2);var ae=new p("s_wall",Dc,1,550,230,0,198,550,230,1);window.s_wall=ae;ae.c(0,0,121,1,550,230,0,0);var be=new p("s_background",Ec,2,576,640,0,0,1152,640,2);window.s_background=be;be.c(0,1,1,1,576,640,0,0);be.c(1,0,1,1,576,640,0,0);
var ce=new p("s_ui_background_bubbleshooter",Dc,1,140,592,0,0,140,592,1);window.s_ui_background_bubbleshooter=ce;ce.c(0,0,1,1,116,556,12,16);var de=new p("s_icon_toggle_sfx_on",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=de;de.c(0,0,729,713,49,31,7,17);var fe=new p("s_icon_toggle_sfx_off",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=fe;fe.c(0,0,929,681,53,31,7,17);var ge=new p("s_icon_toggle_music_off",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=ge;
ge.c(0,0,673,713,51,41,8,16);var he=new p("s_icon_toggle_music_on",Q,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=he;he.c(0,0,985,1,38,41,13,16);var ie=new p("s_btn_big_restart",Cc,2,154,152,0,0,308,152,2);window.s_btn_big_restart=ie;ie.c(0,1,1,609,154,152,0,0);ie.c(1,1,345,529,154,152,0,0);var je=new p("s_btn_big_start",Cc,2,154,152,0,0,308,152,2);window.s_btn_big_start=je;je.c(0,1,161,609,154,152,0,0);je.c(1,1,745,513,154,152,0,0);var ke=new p("s_btn_small_exit",Q,2,100,92,0,0,200,92,2);
window.s_btn_small_exit=ke;ke.c(0,0,905,441,100,92,0,0);ke.c(1,0,817,345,100,92,0,0);var le=new p("s_btn_small_options",Q,2,100,92,0,0,200,92,2);window.s_btn_small_options=le;le.c(0,0,921,345,100,92,0,0);le.c(1,0,801,441,100,92,0,0);var me=new p("s_btn_small_pause",Dc,2,100,92,0,0,200,92,2);window.s_btn_small_pause=me;me.c(0,0,841,529,100,92,0,0);me.c(1,0,1,561,100,92,0,0);var ne=new p("s_btn_small_retry",Cc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=ne;ne.c(0,0,921,97,100,92,0,0);
ne.c(1,0,921,1,100,92,0,0);var oe=new p("s_btn_standard",Q,2,96,92,0,0,192,92,2);window.s_btn_standard=oe;oe.c(0,0,465,713,96,92,0,0);oe.c(1,0,569,713,96,92,0,0);var pe=new p("s_btn_toggle",Q,2,162,92,0,0,324,92,2);window.s_btn_toggle=pe;pe.c(0,0,817,97,162,92,0,0);pe.c(1,0,817,1,162,92,0,0);var qe=new p("s_icon_toggle_fxoff",Q,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=qe;qe.c(0,0,569,425,227,92,0,0);qe.c(1,0,465,617,227,92,0,0);var re=new p("s_icon_toggle_fxon",Q,2,227,92,0,0,454,92,2);
window.s_icon_toggle_fxon=re;re.c(0,0,569,521,227,92,0,0);re.c(1,0,1,601,227,92,0,0);var se=new p("s_icon_toggle_musicoff",Q,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicoff=se;se.c(0,0,233,601,227,92,0,0);se.c(1,0,697,617,227,92,0,0);var te=new p("s_icon_toggle_musicon",Q,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=te;te.c(0,0,1,697,227,92,0,0);te.c(1,0,233,697,227,92,0,0);var ue=new p("s_btn_bigtext",Ac,2,137,104,0,0,274,104,2);window.s_btn_bigtext=ue;ue.c(0,0,625,57,137,104,0,0);
ue.c(1,0,769,113,137,104,0,0);var ve=new p("s_overlay_options",Q,1,574,614,0,0,574,614,1);window.s_overlay_options=ve;ve.c(0,0,1,1,560,597,7,3);var we=new p("s_overlay_assignment",Ec,1,540,214,0,0,540,214,1);window.s_overlay_assignment=we;we.c(0,0,1,649,540,214,0,0);var xe=new p("s_tutorial",Q,1,560,532,0,0,560,532,1);window.s_tutorial=xe;xe.c(0,1,1,1,560,532,0,0);var ye=new p("s_overlay_endless",Cc,1,574,614,0,0,574,614,1);window.s_overlay_endless=ye;ye.c(0,0,1,1,560,597,7,9);
var ze=new p("s_screen_start",zc,4,576,320,0,0,1152,640,2);window.s_screen_start=ze;ze.c(0,0,1,329,576,320,0,0);ze.c(1,1,1,1,576,320,0,0);ze.c(2,0,1,1,576,320,0,0);ze.c(3,0,1,657,576,320,0,0);var Ae=new p("s_logo_preload_tinglygames",zc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=Ae;Ae.c(0,0,585,1,320,54,0,0);var Be=new p("s_loadingbar_bg",zc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=Be;Be.c(0,0,913,1,38,20,0,0);var Ce=new p("s_loadingbar_fill",zc,1,30,12,0,0,30,12,1);
window.s_loadingbar_fill=Ce;Ce.c(0,0,953,1,30,12,0,0);var De=new p("s_logo_about",Q,1,121,121,0,0,121,121,1);window.s_logo_about=De;De.c(0,0,817,257,117,80,2,21);var Ee=new p("s_logo_poki_about",Q,1,123,58,0,0,123,58,1);window.s_logo_poki_about=Ee;Ee.c(0,0,817,193,123,58,0,0);var Fe=new p("s_logo_poki_start",zc,1,120,60,0,0,120,60,1);window.s_logo_poki_start=Fe;Fe.c(0,0,793,57,119,59,1,1);var Ge=new p("s_ads_background",zc,1,200,200,100,100,200,200,1);window.s_ads_background=Ge;
Ge.c(0,0,585,57,200,200,0,0);var He=new xa("scoreFloater_neg");window.scoreFloater_neg=He;He.b=new p("scoreFloater_negImage",Gc,13,34,59,0,0);He.b.c(0,0,625,65,1,1,0,0,1,1,1);He.b.c(1,0,865,353,26,25,4,14,1,1,1);He.b.c(2,0,953,353,21,11,7,23,1,1,1);He.b.c(3,0,169,353,23,30,6,12,1,1,1);He.b.c(4,0,1001,281,22,30,7,12,1,1,1);He.b.c(5,0,889,321,24,30,6,12,1,1,1);He.b.c(6,0,857,321,23,30,6,12,1,1,1);He.b.c(7,0,825,321,25,30,5,12,1,1,1);He.b.c(8,0,921,321,23,30,6,12,1,1,1);
He.b.c(9,0,953,321,24,30,6,12,1,1,1);He.b.c(10,0,985,321,23,30,5,12,1,1,1);He.b.c(11,0,137,329,23,30,6,12,1,1,1);He.b.c(12,0,569,321,24,30,5,12,1,1,1);
He.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,2,-1,-1,3,4,5,6,7,8,9,10,11,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
He.left=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,12,9,12,12,8,8,8,8,8,8,8,8,8,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
He.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,18,10,16,10,10,18,18,18,18,18,18,18,18,18,18,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];He.top=8;He.height=43;He.Rg=38;var Ie=new xa("scoreFloater_pos");window.scoreFloater_pos=Ie;Ie.b=new p("scoreFloater_posImage",Gc,13,34,59,0,0);Ie.b.c(0,0,65,65,1,1,0,0,1,1,1);Ie.b.c(1,0,897,353,26,25,4,14,1,1,1);
Ie.b.c(2,0,929,353,21,11,7,23,1,1,1);Ie.b.c(3,0,25,329,23,30,6,12,1,1,1);Ie.b.c(4,0,1,329,22,30,7,12,1,1,1);Ie.b.c(5,0,793,321,24,30,6,12,1,1,1);Ie.b.c(6,0,601,321,23,30,6,12,1,1,1);Ie.b.c(7,0,697,321,25,30,5,12,1,1,1);Ie.b.c(8,0,633,321,23,30,6,12,1,1,1);Ie.b.c(9,0,761,321,24,30,6,12,1,1,1);Ie.b.c(10,0,729,321,23,30,5,12,1,1,1);Ie.b.c(11,0,665,321,23,30,6,12,1,1,1);Ie.b.c(12,0,105,329,24,30,5,12,1,1,1);
Ie.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,2,-1,-1,3,4,5,6,7,8,9,10,11,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
Ie.left=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,12,9,12,12,8,8,8,8,8,8,8,8,8,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
Ie.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,18,10,16,10,10,18,18,18,18,18,18,18,18,18,18,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];Ie.top=8;Ie.height=43;Ie.Rg=38;var R=new xa("VerdanaFloater1");window.VerdanaFloater1=R;R.b=new p("VerdanaFloater1Image",Gc,59,44,46,0,0);R.b.c(0,0,617,57,1,1,0,0,1,1,1);R.b.c(1,0,681,353,17,30,12,11,1,1,1);
R.b.c(2,0,529,321,31,30,4,11,1,1,1);R.b.c(3,0,649,353,28,30,6,11,1,1,1);R.b.c(4,0,801,353,28,30,6,11,1,1,1);R.b.c(5,0,737,353,30,30,5,11,1,1,1);R.b.c(6,0,265,353,25,30,7,11,1,1,1);R.b.c(7,0,361,353,25,30,8,11,1,1,1);R.b.c(8,0,705,353,29,30,5,11,1,1,1);R.b.c(9,0,201,353,29,30,5,11,1,1,1);R.b.c(10,0,553,353,23,30,9,11,1,1,1);R.b.c(11,0,833,353,23,30,8,11,1,1,1);R.b.c(12,0,393,353,29,30,6,11,1,1,1);R.b.c(13,0,457,353,26,30,8,11,1,1,1);R.b.c(14,0,249,321,32,30,4,11,1,1,1);
R.b.c(15,0,521,353,29,30,5,11,1,1,1);R.b.c(16,0,489,321,31,30,4,11,1,1,1);R.b.c(17,0,425,353,27,30,7,11,1,1,1);R.b.c(18,0,177,281,31,35,4,11,1,1,1);R.b.c(19,0,297,353,30,30,6,11,1,1,1);R.b.c(20,0,233,353,28,30,6,11,1,1,1);R.b.c(21,0,489,353,29,30,5,11,1,1,1);R.b.c(22,0,585,353,28,30,6,11,1,1,1);R.b.c(23,0,289,321,31,30,4,11,1,1,1);R.b.c(24,0,217,201,38,30,1,11,1,1,1);R.b.c(25,0,361,321,31,30,4,11,1,1,1);R.b.c(26,0,401,321,31,30,5,11,1,1,1);R.b.c(27,0,769,353,28,30,6,11,1,1,1);
R.b.c(28,0,1,209,31,37,4,4,1,1,1);R.b.c(29,0,897,201,31,37,4,4,1,1,1);R.b.c(30,0,625,241,31,36,4,5,1,1,1);R.b.c(31,0,665,241,31,36,4,5,1,1,1);R.b.c(32,0,249,281,31,35,4,6,1,1,1);R.b.c(33,0,321,281,31,35,4,6,1,1,1);R.b.c(34,0,457,201,37,30,0,11,1,1,1);R.b.c(35,0,113,249,28,35,6,11,1,1,1);R.b.c(36,0,425,201,25,37,7,4,1,1,1);R.b.c(37,0,529,201,25,37,7,4,1,1,1);R.b.c(38,0,497,201,25,37,7,4,1,1,1);R.b.c(39,0,145,249,25,35,7,6,1,1,1);R.b.c(40,0,393,201,23,37,9,4,1,1,1);
R.b.c(41,0,297,201,23,37,9,4,1,1,1);R.b.c(42,0,601,201,23,37,9,4,1,1,1);R.b.c(43,0,457,273,23,35,9,6,1,1,1);R.b.c(44,0,169,321,32,30,3,11,1,1,1);R.b.c(45,0,705,241,29,36,5,5,1,1,1);R.b.c(46,0,561,201,31,37,4,4,1,1,1);R.b.c(47,0,817,201,31,37,4,4,1,1,1);R.b.c(48,0,857,201,31,37,4,4,1,1,1);R.b.c(49,0,801,241,31,36,4,5,1,1,1);R.b.c(50,0,65,281,31,35,4,6,1,1,1);R.b.c(51,0,65,321,31,33,4,10,1,1,1);R.b.c(52,0,785,201,28,37,6,4,1,1,1);R.b.c(53,0,753,201,28,37,6,4,1,1,1);
R.b.c(54,0,721,201,28,37,6,4,1,1,1);R.b.c(55,0,217,273,28,35,6,6,1,1,1);R.b.c(56,0,681,201,31,37,5,4,1,1,1);R.b.c(57,0,617,353,27,30,7,11,1,1,1);R.b.c(58,0,329,321,27,31,7,10,1,1,1);
R.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
R.left=[18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,13,11,13,14,12,11,15,15,12,14,10,11,11,13,11,12,13,13,12,12,8,12,13,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,
18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,12,12,12,8,13,13,13,13,13,15,15,15,15,11,11,11,11,11,11,11,18,11,12,12,12,12,13,13,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18];
R.width=[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,19,19,18,21,17,16,20,21,13,14,19,16,24,21,21,18,21,19,17,17,20,19,28,19,18,17,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,19,19,19,19,19,19,27,18,17,17,17,17,13,13,13,13,21,21,21,21,21,21,21,8,21,20,20,20,
20,18,18,18,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];R.top=8;R.height=30;R.Rg=33;var S=new xa("VerdanaFloater2");window.VerdanaFloater2=S;S.b=new p("VerdanaFloater2Image",Gc,59,45,48,0,0);S.b.c(0,0,617,65,1,1,0,0,1,1,1);S.b.c(1,0,1009,41,13,34,16,10,1,1,1);S.b.c(2,0,489,281,30,34,8,10,1,1,1);S.b.c(3,0,737,281,25,34,11,10,1,1,1);S.b.c(4,0,681,281,26,34,9,10,1,1,1);S.b.c(5,0,769,281,27,34,10,10,1,1,1);S.b.c(6,0,833,281,22,34,12,10,1,1,1);S.b.c(7,0,881,281,22,34,12,10,1,1,1);
S.b.c(8,0,937,281,28,34,8,10,1,1,1);S.b.c(9,0,905,281,25,34,10,10,1,1,1);S.b.c(10,0,857,281,19,34,13,10,1,1,1);S.b.c(11,0,713,281,21,34,12,10,1,1,1);S.b.c(12,0,425,281,27,34,11,10,1,1,1);S.b.c(13,0,1001,241,22,34,13,10,1,1,1);S.b.c(14,0,361,281,29,34,8,10,1,1,1);S.b.c(15,0,393,281,26,34,10,10,1,1,1);S.b.c(16,0,553,281,30,34,8,10,1,1,1);S.b.c(17,0,649,281,25,34,11,10,1,1,1);S.b.c(18,0,81,201,30,38,8,10,1,1,1);S.b.c(19,0,585,281,27,34,11,10,1,1,1);S.b.c(20,0,521,281,26,34,10,10,1,1,1);
S.b.c(21,0,617,281,25,34,10,10,1,1,1);S.b.c(22,0,801,281,27,34,9,10,1,1,1);S.b.c(23,0,217,313,29,34,8,10,1,1,1);S.b.c(24,0,257,201,38,34,4,10,1,1,1);S.b.c(25,0,1,289,29,34,8,10,1,1,1);S.b.c(26,0,969,281,29,34,8,10,1,1,1);S.b.c(27,0,105,289,25,34,10,10,1,1,1);S.b.c(28,0,769,105,30,41,8,3,1,1,1);S.b.c(29,0,457,105,30,41,8,3,1,1,1);S.b.c(30,0,481,57,30,44,8,0,1,1,1);S.b.c(31,0,225,153,30,40,8,4,1,1,1);S.b.c(32,0,193,153,30,40,8,4,1,1,1);S.b.c(33,0,161,153,30,40,8,4,1,1,1);
S.b.c(34,0,937,201,37,34,3,10,1,1,1);S.b.c(35,0,185,201,26,38,9,10,1,1,1);S.b.c(36,0,433,105,22,41,12,3,1,1,1);S.b.c(37,0,409,105,22,41,12,3,1,1,1);S.b.c(38,0,665,97,22,41,12,3,1,1,1);S.b.c(39,0,913,105,22,40,12,4,1,1,1);S.b.c(40,0,385,105,19,41,13,3,1,1,1);S.b.c(41,0,489,105,19,41,13,3,1,1,1);S.b.c(42,0,513,105,20,41,13,3,1,1,1);S.b.c(43,0,1001,105,19,40,13,4,1,1,1);S.b.c(44,0,33,289,29,34,8,10,1,1,1);S.b.c(45,0,937,105,26,40,10,4,1,1,1);S.b.c(46,0,569,105,30,41,8,3,1,1,1);
S.b.c(47,0,297,57,30,44,8,0,1,1,1);S.b.c(48,0,801,105,30,41,8,3,1,1,1);S.b.c(49,0,129,113,30,40,8,4,1,1,1);S.b.c(50,0,337,145,30,40,8,4,1,1,1);S.b.c(51,0,361,201,30,37,8,9,1,1,1);S.b.c(52,0,737,105,27,41,9,3,1,1,1);S.b.c(53,0,601,105,27,41,9,3,1,1,1);S.b.c(54,0,537,105,27,41,9,3,1,1,1);S.b.c(55,0,81,153,27,40,9,4,1,1,1);S.b.c(56,0,633,105,29,41,8,3,1,1,1);S.b.c(57,0,137,289,25,34,11,10,1,1,1);S.b.c(58,0,289,281,25,35,11,9,1,1,1);
S.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
S.left=[18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,11,13,13,11,11,15,15,12,14,9,11,11,12,11,12,13,13,11,12,7,12,12,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,
18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,12,12,12,7,12,13,13,13,13,15,15,15,15,11,11,11,11,11,11,11,18,11,11,11,11,11,12,12,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18];
S.width=[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,11,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,21,21,20,23,19,18,22,23,15,15,21,17,26,23,23,20,23,21,19,19,22,21,31,21,20,19,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,21,21,21,21,21,21,30,20,19,19,19,19,15,15,15,15,23,23,23,23,23,23,23,9,23,22,22,22,
22,20,20,19,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9];S.top=7;S.height=34;S.Rg=35;var U=new xa("VerdanaFloater3");window.VerdanaFloater3=U;U.b=new p("VerdanaFloater3Image",Gc,60,48,51,0,0);U.b.c(0,0,625,57,1,1,0,0,1,1,1);U.b.c(1,0,1009,1,14,36,17,12,1,1,1);U.b.c(2,0,761,241,32,36,8,12,1,1,1);U.b.c(3,0,873,241,27,36,11,12,1,1,1);U.b.c(4,0,841,241,26,36,11,12,1,1,1);U.b.c(5,0,905,241,29,36,10,12,1,1,1);U.b.c(6,0,1,249,24,36,12,12,1,1,1);U.b.c(7,0,969,241,24,36,13,12,1,1,1);
U.b.c(8,0,937,241,29,36,9,12,1,1,1);U.b.c(9,0,33,249,28,36,10,12,1,1,1);U.b.c(10,0,737,241,22,36,14,12,1,1,1);U.b.c(11,0,641,153,21,36,12,12,1,1,1);U.b.c(12,0,249,241,29,36,11,12,1,1,1);U.b.c(13,0,281,241,24,36,13,12,1,1,1);U.b.c(14,0,73,241,31,36,8,12,1,1,1);U.b.c(15,0,113,209,28,36,10,12,1,1,1);U.b.c(16,0,457,233,30,36,9,12,1,1,1);U.b.c(17,0,217,233,27,36,12,12,1,1,1);U.b.c(18,0,297,153,30,39,9,12,1,1,1);U.b.c(19,0,41,209,29,36,11,12,1,1,1);U.b.c(20,0,185,241,27,36,11,12,1,1,1);
U.b.c(21,0,385,241,28,36,10,12,1,1,1);U.b.c(22,0,553,241,27,36,10,12,1,1,1);U.b.c(23,0,585,241,32,36,8,12,1,1,1);U.b.c(24,0,337,105,41,36,4,12,1,1,1);U.b.c(25,0,313,241,32,36,8,12,1,1,1);U.b.c(26,0,489,241,30,36,10,12,1,1,1);U.b.c(27,0,521,241,27,36,10,12,1,1,1);U.b.c(28,0,513,57,32,44,8,4,1,1,1);U.b.c(29,0,409,57,32,44,8,4,1,1,1);U.b.c(30,0,809,1,32,48,8,0,1,1,1);U.b.c(31,0,1,65,32,43,8,5,1,1,1);U.b.c(32,0,257,105,32,42,8,6,1,1,1);U.b.c(33,0,297,105,32,42,8,6,1,1,1);
U.b.c(34,0,81,113,40,36,3,12,1,1,1);U.b.c(35,0,489,153,26,39,11,12,1,1,1);U.b.c(36,0,553,57,24,44,12,4,1,1,1);U.b.c(37,0,449,57,24,44,12,4,1,1,1);U.b.c(38,0,353,57,24,44,12,4,1,1,1);U.b.c(39,0,161,105,24,42,12,6,1,1,1);U.b.c(40,0,665,49,22,44,14,4,1,1,1);U.b.c(41,0,329,57,22,44,14,4,1,1,1);U.b.c(42,0,385,57,22,44,14,4,1,1,1);U.b.c(43,0,41,65,22,42,14,6,1,1,1);U.b.c(44,0,417,241,31,36,8,12,1,1,1);U.b.c(45,0,945,57,28,43,10,5,1,1,1);U.b.c(46,0,585,57,30,44,9,4,1,1,1);
U.b.c(47,0,633,49,30,48,9,0,1,1,1);U.b.c(48,0,833,57,30,44,9,4,1,1,1);U.b.c(49,0,977,57,30,43,9,5,1,1,1);U.b.c(50,0,225,105,30,42,9,6,1,1,1);U.b.c(51,0,457,313,27,32,11,15,1,1,1);U.b.c(52,0,969,105,30,40,9,10,1,1,1);U.b.c(53,0,737,57,27,44,10,4,1,1,1);U.b.c(54,0,865,57,27,44,10,4,1,1,1);U.b.c(55,0,769,57,27,44,10,4,1,1,1);U.b.c(56,0,193,105,27,42,10,6,1,1,1);U.b.c(57,0,801,57,30,44,10,4,1,1,1);U.b.c(58,0,353,241,27,36,12,12,1,1,1);U.b.c(59,0,977,201,26,37,12,11,1,1,1);
U.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
U.left=[19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,12,12,13,11,13,14,11,11,16,15,12,14,9,11,11,13,11,12,13,13,11,12,7,12,13,13,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,
19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,12,12,12,12,12,12,7,13,13,13,13,13,16,16,16,16,11,11,11,11,11,11,11,11,11,11,11,11,11,13,13,13,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19];
U.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,12,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,24,23,22,25,21,20,25,25,16,17,23,19,29,26,26,22,26,24,22,21,25,23,34,23,22,21,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,24,24,24,24,24,24,33,22,21,21,21,21,16,16,16,16,25,26,26,26,26,26,26,26,26,25,25,25,25,22,22,22,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];U.top=7;U.height=37;U.Rg=38;var V=new xa("VerdanaFloater4");window.VerdanaFloater4=V;V.b=new p("VerdanaFloater4Image",Gc,59,58,61,0,0);V.b.c(0,0,73,65,1,1,0,0,1,1,1);V.b.c(1,0,665,145,21,39,19,16,1,1,1);
V.b.c(2,0,561,153,36,39,9,16,1,1,1);V.b.c(3,0,521,153,33,39,12,16,1,1,1);V.b.c(4,0,873,105,34,40,14,15,1,1,1);V.b.c(5,0,369,153,36,39,11,16,1,1,1);V.b.c(6,0,449,153,33,39,14,16,1,1,1);V.b.c(7,0,409,153,32,39,14,16,1,1,1);V.b.c(8,0,257,153,35,40,12,15,1,1,1);V.b.c(9,0,601,153,38,39,11,16,1,1,1);V.b.c(10,0,329,193,30,39,14,16,1,1,1);V.b.c(11,0,41,161,31,39,13,16,1,1,1);V.b.c(12,0,145,201,38,39,12,16,1,1,1);V.b.c(13,0,113,161,28,39,15,16,1,1,1);V.b.c(14,0,897,57,43,39,9,16,1,1,1);
V.b.c(15,0,641,193,38,39,11,16,1,1,1);V.b.c(16,0,1,113,36,40,12,15,1,1,1);V.b.c(17,0,969,153,34,39,13,16,1,1,1);V.b.c(18,0,257,57,36,46,12,15,1,1,1);V.b.c(19,0,889,153,34,39,12,16,1,1,1);V.b.c(20,0,41,113,35,40,12,15,1,1,1);V.b.c(21,0,769,153,33,39,16,16,1,1,1);V.b.c(22,0,729,153,35,39,13,16,1,1,1);V.b.c(23,0,849,153,35,39,15,16,1,1,1);V.b.c(24,0,161,57,47,39,10,16,1,1,1);V.b.c(25,0,689,105,41,39,9,16,1,1,1);V.b.c(26,0,929,153,34,39,16,16,1,1,1);V.b.c(27,0,809,153,36,39,12,16,1,1,1);
V.b.c(28,0,553,1,36,50,9,5,1,1,1);V.b.c(29,0,593,1,36,50,9,5,1,1,1);V.b.c(30,0,41,1,36,55,9,0,1,1,1);V.b.c(31,0,689,1,37,49,9,6,1,1,1);V.b.c(32,0,849,1,36,48,9,7,1,1,1);V.b.c(33,0,121,57,36,47,9,8,1,1,1);V.b.c(34,0,633,1,50,39,3,16,1,1,1);V.b.c(35,0,217,57,34,46,14,15,1,1,1);V.b.c(36,0,313,1,33,50,14,5,1,1,1);V.b.c(37,0,241,1,33,50,14,5,1,1,1);V.b.c(38,0,353,1,33,50,14,5,1,1,1);V.b.c(39,0,969,1,33,48,14,7,1,1,1);V.b.c(40,0,281,1,30,50,14,5,1,1,1);V.b.c(41,0,201,1,31,50,14,5,1,1,1);
V.b.c(42,0,161,1,31,50,14,5,1,1,1);V.b.c(43,0,929,1,31,48,14,7,1,1,1);V.b.c(44,0,689,153,36,39,11,16,1,1,1);V.b.c(45,0,729,1,38,49,11,6,1,1,1);V.b.c(46,0,81,1,36,50,12,5,1,1,1);V.b.c(47,0,1,1,36,55,12,0,1,1,1);V.b.c(48,0,433,1,36,50,12,5,1,1,1);V.b.c(49,0,769,1,36,49,12,6,1,1,1);V.b.c(50,0,889,1,36,48,12,7,1,1,1);V.b.c(51,0,689,57,41,44,9,13,1,1,1);V.b.c(52,0,473,1,35,50,13,5,1,1,1);V.b.c(53,0,393,1,35,50,13,5,1,1,1);V.b.c(54,0,513,1,35,50,13,5,1,1,1);V.b.c(55,0,81,57,35,48,13,7,1,1,1);
V.b.c(56,0,121,1,34,50,16,5,1,1,1);V.b.c(57,0,1,161,33,39,13,16,1,1,1);V.b.c(58,0,833,105,32,41,13,14,1,1,1);
V.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
V.left=[23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,15,15,16,14,17,17,14,14,19,19,15,18,12,14,14,16,14,15,16,17,14,15,9,15,16,17,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,
23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,15,15,15,15,15,15,9,16,17,17,17,17,19,19,19,19,14,14,14,14,14,14,14,23,14,14,14,14,14,16,16,16,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23];
V.width=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,27,27,26,29,24,23,29,30,19,19,27,22,34,30,30,26,30,28,25,24,29,27,40,27,26,24,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,27,27,27,27,27,27,39,26,24,24,24,24,19,19,19,19,29,30,30,30,30,30,30,12,30,29,29,29,29,26,26,25,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];V.top=9;V.height=43;V.Rg=45;var Je=new Aa("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=Je;var W=new z("f_default","Arial");window.f_default=W;C(W,12);Ea(W);W.setFillColor("Black");
Fa(W,1);Ha(W,!1);W.setStrokeColor("Black");Ja(W,1);La(W,"miter");Ia(W,1);Ka(W,!1);E(W,"left");F(W,"top");Oa(W);Pa(W);var Ke=new Aa("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=Ke;var Le=new Aa("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=Le;var Me=new Aa("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");
window.floaterFontFaceLoader=Me;var Ne=new Aa("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Ne;var Oe=new z("floaterFontFace","Arial");window.floaterFontText1=Oe;C(Oe,24);Da(Oe,"normal");Ea(Oe);Oe.setFillColor("#FFDE00");Fa(Oe,1);Ha(Oe,!0);Oe.setStrokeColor("#6F1F00");Ja(Oe,4);La(Oe,"miter");Ia(Oe,1);Ka(Oe,!0);Ma(Oe,!0,"rgba(57,0,0,0.46)",0,4,2);E(Oe,"left");F(Oe,"top");Oa(Oe);Pa(Oe);
var Pe=new z("floaterFontFace","Arial");window.floaterFontText2=Pe;C(Pe,28);Da(Pe,"normal");Ea(Pe);Ga(Pe,2,["#FFF600","#00DB48","blue"],.65,.02);Fa(Pe,1);Ha(Pe,!0);Pe.setStrokeColor("#073400");Ja(Pe,4);La(Pe,"miter");Ia(Pe,1);Ka(Pe,!0);Ma(Pe,!0,"rgba(0,57,43,0.47)",0,4,2);E(Pe,"left");F(Pe,"top");Oa(Pe);Pa(Pe);var Qe=new z("floaterFontFace","Arial");window.floaterFontText3=Qe;C(Qe,30);Da(Qe,"normal");Ea(Qe);Ga(Qe,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Fa(Qe,1);Ha(Qe,!0);Qe.setStrokeColor("#4F0027");
Ja(Qe,4);La(Qe,"miter");Ia(Qe,1);Ka(Qe,!0);Ma(Qe,!0,"rgba(41,0,0,0.48)",0,5,2);E(Qe,"left");F(Qe,"top");Oa(Qe);Pa(Qe);var Re=new z("floaterFontFace","Arial");window.floaterFontText4=Re;C(Re,34);Da(Re,"normal");Ea(Re);Ga(Re,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Fa(Re,1);Ha(Re,!0);Re.setStrokeColor("#001637");Ja(Re,4);La(Re,"miter");Ia(Re,1);Ka(Re,!0);Ma(Re,!0,"rgba(0,35,75,0.49)",0,6,2);E(Re,"left");F(Re,"top");Oa(Re);Pa(Re);var Se=new z("floaterNumberFontFace","Arial");
window.floaterFontNumberPositive=Se;C(Se,30);Ea(Se);Se.setFillColor("White");Fa(Se,1);Ha(Se,!0);Se.setStrokeColor("#00106F");Ja(Se,2);La(Se,"miter");Ia(Se,1);Ka(Se,!1);Ma(Se,!0,"rgba(0,4,57,0.51)",0,4,2);E(Se,"left");F(Se,"top");Oa(Se);Pa(Se);var Te=new z("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=Te;C(Te,30);Da(Te,"normal");Ea(Te);Te.setFillColor("#FF1E00");Fa(Te,1);Ha(Te,!0);Te.setStrokeColor("#3F0000");Ja(Te,2);La(Te,"miter");Ia(Te,1);Ka(Te,!1);
Ma(Te,!0,"rgba(57,0,0,0.49)",0,4,2);E(Te,"left");F(Te,"top");Oa(Te);Pa(Te);var Ue=new z("ff_opensans_bold","Arial");window.f_game_ui_tiny=Ue;C(Ue,11);Ea(Ue);Ue.setFillColor("#799EC5");Fa(Ue,1);Ha(Ue,!1);Ue.setStrokeColor("White");Ja(Ue,1);La(Ue,"miter");Ia(Ue,1);Ka(Ue,!1);E(Ue,"center");F(Ue,"middle");Oa(Ue);Pa(Ue);var Ve=new z("ff_opensans_bolditalic","Arial");window.f_game_ui_large=Ve;C(Ve,52);Ea(Ve);Ve.setFillColor("#172348");Fa(Ve,1);Ha(Ve,!1);Ve.setStrokeColor("Black");Ja(Ve,1);La(Ve,"miter");
Ia(Ve,1);Ka(Ve,!1);E(Ve,"center");F(Ve,"middle");Oa(Ve);Pa(Ve);var We=new Aa("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=We;var Xe=new Aa("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=Xe;var Ye=new Aa("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");window.f_themeDefaultLoader=Ye;
var Ze=new z("f_themeDefault","Arial");window.f_themeDefault=Ze;C(Ze,40);Ea(Ze);Ze.setFillColor("Black");Fa(Ze,1);Ha(Ze,!1);Ze.setStrokeColor("White");Ja(Ze,5);La(Ze,"miter");Ia(Ze,1);Ka(Ze,!0);E(Ze,"left");F(Ze,"top");Oa(Ze);Pa(Ze);var $e=new z("f_themeDefault","Arial");window.f_announcement=$e;C($e,50);Ea($e);$e.setFillColor("White");Fa($e,1);Ha($e,!0);$e.setStrokeColor("#2C2C2C");Ja($e,6);La($e,"miter");Ia($e,1);Ka($e,!0);Ma($e,!0,"rgba(0,0,0,0.53)",0,5,2);E($e,"center");F($e,"top");Oa($e);Pa($e);
var af=new z("ff_opensans_bold","Arial");window.f_bubble_points=af;C(af,30);Ea(af);Ga(af,2,["White","#DFDFDF","blue"],.6,0);Fa(af,1);Ha(af,!0);af.setStrokeColor("#454545");Ja(af,6);La(af,"round");Ia(af,1);Ka(af,!0);E(af,"left");F(af,"top");Oa(af);Pa(af);var bf=new z("ff_opensans_bold","Arial");window.f_bubbles_left=bf;C(bf,30);Ea(bf);bf.setFillColor("#4E4E4E");Fa(bf,1);Ha(bf,!1);bf.setStrokeColor("Black");Ja(bf,1);La(bf,"miter");Ia(bf,1);Ka(bf,!1);E(bf,"center");F(bf,"middle");Oa(bf);Pa(bf);
var cf=new z("ff_opensans_bold","Arial");window.f_special_points=cf;C(cf,40);Ea(cf);Ga(cf,2,["Yellow","#FF8040","Red"],.6,0);Fa(cf,1);Ha(cf,!0);cf.setStrokeColor("#454545");Ja(cf,6);La(cf,"round");Ia(cf,1);Ka(cf,!0);E(cf,"left");F(cf,"top");Oa(cf);Pa(cf);var df=new z("ff_opensans_bold","Arial");window.f_switch=df;C(df,16);Ea(df);df.setFillColor("#818181");Fa(df,1);Ha(df,!1);df.setStrokeColor("#454545");Ja(df,1);La(df,"miter");Ia(df,1);Ka(df,!1);E(df,"left");F(df,"top");Oa(df);Pa(df);
var ef=new z("ff_opensans_bolditalic","Arial");window.f_nice=ef;C(ef,70);Da(ef,"normal");Ea(ef);Ga(ef,2,["#FFF600","#00DB48","blue"],.65,.02);Fa(ef,1);Ha(ef,!0);ef.setStrokeColor("#073400");Ja(ef,7);La(ef,"round");Ia(ef,1);Ka(ef,!0);Ma(ef,!0,"rgba(0,57,43,0.47)",0,4,2);E(ef,"left");F(ef,"top");Oa(ef);Pa(ef);var ff=new z("ff_opensans_bolditalic","Arial");window.f_great=ff;C(ff,75);Da(ff,"normal");Ea(ff);Ga(ff,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Fa(ff,1);Ha(ff,!0);ff.setStrokeColor("#4F0027");
Ja(ff,7);La(ff,"round");Ia(ff,1);Ka(ff,!0);Ma(ff,!0,"rgba(41,0,0,0.48)",0,5,2);E(ff,"left");F(ff,"top");Oa(ff);Pa(ff);var gf=new z("ff_opensans_bolditalic","Arial");window.f_awesome=gf;C(gf,90);Da(gf,"normal");Ea(gf);Ga(gf,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Fa(gf,1);Ha(gf,!0);gf.setStrokeColor("#001637");Ja(gf,8);La(gf,"round");Ia(gf,1);Ka(gf,!0);Ma(gf,!0,"rgba(0,35,75,0.49)",0,6,2);E(gf,"left");F(gf,"top");Oa(gf);Pa(gf);var hf=new z("ff_opensans_bold","Arial");window.f_game_ui=hf;C(hf,12);
Ea(hf);hf.setFillColor("Black");Fa(hf,1);Ha(hf,!1);hf.setStrokeColor("Black");Ja(hf,1);La(hf,"miter");Ia(hf,1);Ka(hf,!1);E(hf,"left");F(hf,"top");Oa(hf);Pa(hf);var jf=new z("Arial","Arial");window.f_tap_to_play=jf;C(jf,28);Da(jf,"bold");Ea(jf);jf.setFillColor("#1b2b34");Fa(jf,1);Ha(jf,!1);jf.setStrokeColor("Black");Ja(jf,28);La(jf,"round");Ia(jf,.55);Ka(jf,!1);E(jf,"center");F(jf,"middle");Oa(jf);Pa(jf);var kf=new z("Arial","Arial");window.f_adblocker=kf;C(kf,28);Da(kf,"normal");Ea(kf);kf.setFillColor("White");
Fa(kf,1);Ha(kf,!1);kf.setStrokeColor("Black");Ja(kf,28);La(kf,"round");Ia(kf,.55);Ka(kf,!1);E(kf,"center");F(kf,"middle");Oa(kf);Pa(kf);var lf=new z("Arial","Arial");window.f_copyright=lf;C(lf,22);Da(lf,"bold");Ea(lf);lf.setFillColor("#1b2b34");Fa(lf,1);Ha(lf,!1);lf.setStrokeColor("Black");Ja(lf,28);La(lf,"round");Ia(lf,.55);Ka(lf,!1);E(lf,"left");F(lf,"middle");Oa(lf);Pa(lf);var mf=new z("Arial","Arial");window.f_thankyou=mf;C(mf,50);Da(mf,"bold");Ea(mf);mf.setFillColor("#1b2b34");Fa(mf,1);
Ha(mf,!1);mf.setStrokeColor("Black");Ja(mf,28);La(mf,"round");Ia(mf,.55);Ka(mf,!1);E(mf,"center");F(mf,"middle");Oa(mf);Pa(mf);var nf=new z("Arial","Arial");window.f_loading_game=nf;C(nf,20);Da(nf,"bold");Ea(nf);nf.setFillColor("#1b2b34");Fa(nf,1);Ha(nf,!1);nf.setStrokeColor("Black");Ja(nf,28);La(nf,"round");Ia(nf,.55);Ka(nf,!1);E(nf,"left");F(nf,"middle");Oa(nf);Pa(nf);var of=new z("Arial","Arial");window.f_interstitial=of;C(of,20);Da(of,"bold");Ea(of);of.setFillColor("#1b2b34");Fa(of,.38);
Ha(of,!1);of.setStrokeColor("Black");Ja(of,28);La(of,"round");Ia(of,.55);Ka(of,!1);E(of,"center");F(of,"middle");Oa(of);Pa(of);var X=new sb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=X;var pf=new H("a_bigPop",X,0,1328,1,10,["game"]);window.a_bigPop=pf;var qf=new H("a_bomb",X,3E3,1247,1,10,["game"]);window.a_bomb=qf;var rf=new H("a_colorBomb",X,6E3,871,1,10,["game"]);window.a_colorBomb=rf;var sf=new H("a_combo_01",X,8E3,598,1,10,["game"]);
window.a_combo_01=sf;var tf=new H("a_combo_02",X,1E4,678,1,10,["game"]);window.a_combo_02=tf;var uf=new H("a_combo_03",X,12E3,730,1,10,["game"]);window.a_combo_03=uf;var vf=new H("a_combo_04",X,14E3,1225,1,10,["game"]);window.a_combo_04=vf;var wf=new H("a_fireBallNext",X,17E3,1107,1,10,["game"]);window.a_fireBallNext=wf;var xf=new H("a_fireBallShoot",X,2E4,968,1,10,["game"]);window.a_fireBallShoot=xf;var yf=new H("a_glassNext",X,22E3,519,1,10,["game"]);window.a_glassNext=yf;
var zf=new H("a_hit",X,24E3,54,1,10,["game"]);window.a_hit=zf;var Af=new H("a_pop_01",X,26E3,145,1,10,["game"]);window.a_pop_01=Af;var Bf=new H("a_pop_02",X,28E3,140,1,10,["game"]);window.a_pop_02=Bf;var Cf=new H("a_pop_03",X,3E4,164,1,10,["game"]);window.a_pop_03=Cf;var Df=new H("a_pop_04",X,32E3,163,1,10,["game"]);window.a_pop_04=Df;var Ef=new H("a_pop_05",X,34E3,149,1,10,["game"]);window.a_pop_05=Ef;var Ff=new H("a_pop_06",X,36E3,103,1,10,["game"]);window.a_pop_06=Ff;
var Gf=new H("a_shoot",X,38E3,198,1,10,["game"]);window.a_shoot=Gf;var Hf=new H("a_swap",X,4E4,285,.5,10,["game"]);window.a_swap=Hf;var If=new H("a_floater_popup",X,42E3,306,1,10,["game"]);window.a_floater_popup=If;var Jf=new H("a_levelStart",X,44E3,1002,1,10,["sfx"]);window.a_levelStart=Jf;var Kf=new H("a_levelComplete",X,47E3,1002,1,10,["sfx"]);window.a_levelComplete=Kf;var Lf=new H("a_mouseDown",X,5E4,471,1,10,["sfx"]);window.a_mouseDown=Lf;var Nf=new H("a_levelend_star_01",X,52E3,1161,1,10,["sfx"]);
window.a_levelend_star_01=Nf;var Of=new H("a_levelend_star_02",X,55E3,1070,1,10,["sfx"]);window.a_levelend_star_02=Of;var Pf=new H("a_levelend_star_03",X,58E3,1039,1,10,["sfx"]);window.a_levelend_star_03=Pf;var Qf=new H("a_levelend_fail",X,61E3,1572,1,10,["sfx"]);window.a_levelend_fail=Qf;var Rf=new H("a_levelend_score_counter",X,64E3,54,1,10,["sfx"]);window.a_levelend_score_counter=Rf;var Sf=new H("a_levelend_score_end",X,66E3,888,1,10,["sfx"]);window.a_levelend_score_end=Sf;
var Tf=new H("a_medal",X,68E3,1225,1,10,["sfx"]);window.a_medal=Tf;P=P||{};P["nl-nl"]=P["nl-nl"]||{};P["nl-nl"].loadingScreenLoading="Laden...";P["nl-nl"].startScreenPlay="SPELEN";P["nl-nl"].levelMapScreenTotalScore="Totale score";P["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";P["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";P["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";P["nl-nl"].levelEndScreenTotalScore="Totale score";P["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";
P["nl-nl"].levelEndScreenTimeLeft="Tijd over";P["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";P["nl-nl"].levelEndScreenHighScore="High score";P["nl-nl"].optionsStartScreen="Hoofdmenu";P["nl-nl"].optionsQuit="Stop";P["nl-nl"].optionsResume="Terug naar spel";P["nl-nl"].optionsTutorial="Speluitleg";P["nl-nl"].optionsHighScore="High scores";P["nl-nl"].optionsMoreGames="Meer Spellen";P["nl-nl"].optionsDifficulty_easy="Makkelijk";P["nl-nl"].optionsDifficulty_medium="Gemiddeld";
P["nl-nl"].optionsDifficulty_hard="Moeilijk";P["nl-nl"].optionsMusic_on="Aan";P["nl-nl"].optionsMusic_off="Uit";P["nl-nl"].optionsSFX_on="Aan";P["nl-nl"].optionsSFX_off="Uit";P["nl-nl"]["optionsLang_en-us"]="Engels (US)";P["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";P["nl-nl"]["optionsLang_nl-nl"]="Nederlands";P["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";P["nl-nl"].gameEndScreenBtnText="Ga verder";P["nl-nl"].optionsTitle="Instellingen";P["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";
P["nl-nl"].optionsQuitConfirmBtn_No="Nee";P["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";P["nl-nl"].levelMapScreenTitle="Kies een level";P["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";P["nl-nl"].optionsRestart="Herstart";P["nl-nl"].optionsSFXBig_on="Geluid aan";P["nl-nl"].optionsSFXBig_off="Geluid uit";P["nl-nl"].optionsAbout_title="Over ons";P["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";
P["nl-nl"].optionsAbout_backBtn="Terug";P["nl-nl"].optionsAbout_version="versie:";P["nl-nl"].optionsAbout="Over ons";P["nl-nl"].levelEndScreenMedal="VERBETERD!";P["nl-nl"].startScreenQuestionaire="Wat vind jij?";P["nl-nl"].levelMapScreenWorld_0="Kies een level";P["nl-nl"].startScreenByTinglyGames="door: CoolGames";P["nl-nl"]["optionsLang_de-de"]="Duits";P["nl-nl"]["optionsLang_tr-tr"]="Turks";P["nl-nl"].optionsAbout_header="Ontwikkeld door:";P["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";
P["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";P["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";P["nl-nl"].challengeStartTextScore="Punten van <NAME>:";P["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";P["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";P["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";P["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";
P["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";P["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";P["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";P["nl-nl"].challengeCancelConfirmBtn_yes="Ja";P["nl-nl"].challengeCancelConfirmBtn_no="Nee";P["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";
P["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";P["nl-nl"].challengeEndScreenName_you="Jij";P["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";P["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";P["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";
P["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";P["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";P["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";P["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";P["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";
P["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";P["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";P["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";P["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";P["nl-nl"].challengeForfeitConfirmBtn_no="Nee";P["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";
P["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";P["nl-nl"].optionsChallengeForfeit="Geef op";P["nl-nl"].optionsChallengeCancel="Stop";P["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";P["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";P["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";
P["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";P["nl-nl"]["optionsLang_fr-fr"]="Frans";P["nl-nl"]["optionsLang_ko-kr"]="Koreaans";P["nl-nl"]["optionsLang_ar-eg"]="Arabisch";P["nl-nl"]["optionsLang_es-es"]="Spaans";P["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";P["nl-nl"]["optionsLang_ru-ru"]="Russisch";P["nl-nl"].optionsExit="Stoppen";P["nl-nl"].levelEndScreenTotalScore_number="Totale score:";P["nl-nl"].levelEndScreenHighScore_number="Topscore:";
P["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";P["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";P["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";
P["nl-nl"].optionsAbout_header_publisher="Published by:";P["nl-nl"]["optionsLang_jp-jp"]="Japans";P["nl-nl"]["optionsLang_it-it"]="Italiaans";P["en-us"]=P["en-us"]||{};P["en-us"].loadingScreenLoading="Loading...";P["en-us"].startScreenPlay="PLAY";P["en-us"].levelMapScreenTotalScore="Total score";P["en-us"].levelEndScreenTitle_level="Level <VALUE>";P["en-us"].levelEndScreenTitle_difficulty="Well done!";P["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";P["en-us"].levelEndScreenTotalScore="Total score";
P["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";P["en-us"].levelEndScreenTimeLeft="Time remaining";P["en-us"].levelEndScreenTimeBonus="Time bonus";P["en-us"].levelEndScreenHighScore="High score";P["en-us"].optionsStartScreen="Main menu";P["en-us"].optionsQuit="Quit";P["en-us"].optionsResume="Resume";P["en-us"].optionsTutorial="How to play";P["en-us"].optionsHighScore="High scores";P["en-us"].optionsMoreGames="More Games";P["en-us"].optionsDifficulty_easy="Easy";
P["en-us"].optionsDifficulty_medium="Medium";P["en-us"].optionsDifficulty_hard="Difficult";P["en-us"].optionsMusic_on="On";P["en-us"].optionsMusic_off="Off";P["en-us"].optionsSFX_on="On";P["en-us"].optionsSFX_off="Off";P["en-us"]["optionsLang_en-us"]="English (US)";P["en-us"]["optionsLang_en-gb"]="English (GB)";P["en-us"]["optionsLang_nl-nl"]="Dutch";P["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";P["en-us"].gameEndScreenBtnText="Continue";P["en-us"].optionsTitle="Settings";
P["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";P["en-us"].optionsQuitConfirmBtn_No="No";P["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";P["en-us"].levelMapScreenTitle="Select a level";P["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";P["en-us"].optionsRestart="Restart";
P["en-us"].optionsSFXBig_on="Sound on";P["en-us"].optionsSFXBig_off="Sound off";P["en-us"].optionsAbout_title="About";P["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["en-us"].optionsAbout_backBtn="Back";P["en-us"].optionsAbout_version="version:";P["en-us"].optionsAbout="About";P["en-us"].levelEndScreenMedal="IMPROVED!";P["en-us"].startScreenQuestionaire="What do you think?";P["en-us"].levelMapScreenWorld_0="Select a level";P["en-us"].startScreenByTinglyGames="by: CoolGames";
P["en-us"]["optionsLang_de-de"]="German";P["en-us"]["optionsLang_tr-tr"]="Turkish";P["en-us"].optionsAbout_header="Developed by:";P["en-us"].levelEndScreenViewHighscoreBtn="View scores";P["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";P["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["en-us"].challengeStartTextScore="<NAME>'s score:";P["en-us"].challengeStartTextTime="<NAME>'s time:";P["en-us"].challengeStartScreenToWin="Amount to win:";
P["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["en-us"].challengeCancelConfirmBtn_yes="Yes";P["en-us"].challengeCancelConfirmBtn_no="No";P["en-us"].challengeEndScreensBtn_submit="Submit challenge";P["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";P["en-us"].challengeEndScreenName_you="You";P["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
P["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";P["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";
P["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";P["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";P["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["en-us"].challengeForfeitConfirmBtn_yes="Yes";P["en-us"].challengeForfeitConfirmBtn_no="No";P["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";
P["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["en-us"].optionsChallengeForfeit="Forfeit";P["en-us"].optionsChallengeCancel="Quit";P["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["en-us"].levelEndScreenHighScore_time="Best time:";P["en-us"].levelEndScreenTotalScore_time="Total time:";
P["en-us"]["optionsLang_fr-fr"]="French";P["en-us"]["optionsLang_ko-kr"]="Korean";P["en-us"]["optionsLang_ar-eg"]="Arabic";P["en-us"]["optionsLang_es-es"]="Spanish";P["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";P["en-us"]["optionsLang_ru-ru"]="Russian";P["en-us"].optionsExit="Exit";P["en-us"].levelEndScreenTotalScore_number="Total score:";P["en-us"].levelEndScreenHighScore_number="High score:";P["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["en-us"].optionsAbout_header_publisher="Published by:";P["en-us"]["optionsLang_jp-jp"]="Japanese";P["en-us"]["optionsLang_it-it"]="Italian";P["en-gb"]=P["en-gb"]||{};P["en-gb"].loadingScreenLoading="Loading...";
P["en-gb"].startScreenPlay="PLAY";P["en-gb"].levelMapScreenTotalScore="Total score";P["en-gb"].levelEndScreenTitle_level="Level <VALUE>";P["en-gb"].levelEndScreenTitle_difficulty="Well done!";P["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";P["en-gb"].levelEndScreenTotalScore="Total score";P["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";P["en-gb"].levelEndScreenTimeLeft="Time remaining";P["en-gb"].levelEndScreenTimeBonus="Time bonus";P["en-gb"].levelEndScreenHighScore="High score";
P["en-gb"].optionsStartScreen="Main menu";P["en-gb"].optionsQuit="Quit";P["en-gb"].optionsResume="Resume";P["en-gb"].optionsTutorial="How to play";P["en-gb"].optionsHighScore="High scores";P["en-gb"].optionsMoreGames="More Games";P["en-gb"].optionsDifficulty_easy="Easy";P["en-gb"].optionsDifficulty_medium="Medium";P["en-gb"].optionsDifficulty_hard="Difficult";P["en-gb"].optionsMusic_on="On";P["en-gb"].optionsMusic_off="Off";P["en-gb"].optionsSFX_on="On";P["en-gb"].optionsSFX_off="Off";
P["en-gb"]["optionsLang_en-us"]="English (US)";P["en-gb"]["optionsLang_en-gb"]="English (GB)";P["en-gb"]["optionsLang_nl-nl"]="Dutch";P["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";P["en-gb"].gameEndScreenBtnText="Continue";P["en-gb"].optionsTitle="Settings";P["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";P["en-gb"].optionsQuitConfirmBtn_No="No";
P["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";P["en-gb"].levelMapScreenTitle="Select a level";P["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";P["en-gb"].optionsRestart="Restart";P["en-gb"].optionsSFXBig_on="Sound on";P["en-gb"].optionsSFXBig_off="Sound off";P["en-gb"].optionsAbout_title="About";P["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
P["en-gb"].optionsAbout_backBtn="Back";P["en-gb"].optionsAbout_version="version:";P["en-gb"].optionsAbout="About";P["en-gb"].levelEndScreenMedal="IMPROVED!";P["en-gb"].startScreenQuestionaire="What do you think?";P["en-gb"].levelMapScreenWorld_0="Select a level";P["en-gb"].startScreenByTinglyGames="by: CoolGames";P["en-gb"]["optionsLang_de-de"]="German";P["en-gb"]["optionsLang_tr-tr"]="Turkish";P["en-gb"].optionsAbout_header="Developed by:";P["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
P["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";P["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["en-gb"].challengeStartTextScore="<NAME>'s score:";P["en-gb"].challengeStartTextTime="<NAME>'s time:";P["en-gb"].challengeStartScreenToWin="Amount to win:";P["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
P["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";P["en-gb"].challengeCancelConfirmBtn_yes="Yes";P["en-gb"].challengeCancelConfirmBtn_no="No";P["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
P["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";P["en-gb"].challengeEndScreenName_you="You";P["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";P["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
P["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";P["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
P["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";P["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";P["en-gb"].challengeForfeitConfirmBtn_yes="Yes";P["en-gb"].challengeForfeitConfirmBtn_no="No";P["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";P["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
P["en-gb"].optionsChallengeForfeit="Forfeit";P["en-gb"].optionsChallengeCancel="Quit";P["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["en-gb"].levelEndScreenHighScore_time="Best time:";P["en-gb"].levelEndScreenTotalScore_time="Total time:";P["en-gb"]["optionsLang_fr-fr"]="French";P["en-gb"]["optionsLang_ko-kr"]="Korean";P["en-gb"]["optionsLang_ar-eg"]="Arabic";
P["en-gb"]["optionsLang_es-es"]="Spanish";P["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";P["en-gb"]["optionsLang_ru-ru"]="Russian";P["en-gb"].optionsExit="Exit";P["en-gb"].levelEndScreenTotalScore_number="Total score:";P["en-gb"].levelEndScreenHighScore_number="High score:";P["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["en-gb"].optionsAbout_header_publisher="Published by:";P["en-gb"]["optionsLang_jp-jp"]="Japanese";P["en-gb"]["optionsLang_it-it"]="Italian";P["de-de"]=P["de-de"]||{};P["de-de"].loadingScreenLoading="Laden ...";
P["de-de"].startScreenPlay="SPIELEN";P["de-de"].levelMapScreenTotalScore="Gesamtpunkte";P["de-de"].levelEndScreenTitle_level="Level <VALUE>";P["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";P["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";P["de-de"].levelEndScreenTotalScore="Gesamtpunkte";P["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";P["de-de"].levelEndScreenTimeLeft="Restzeit";P["de-de"].levelEndScreenTimeBonus="Zeitbonus";P["de-de"].levelEndScreenHighScore="Highscore";
P["de-de"].optionsStartScreen="Hauptmen\u00fc";P["de-de"].optionsQuit="Beenden";P["de-de"].optionsResume="Weiterspielen";P["de-de"].optionsTutorial="So wird gespielt";P["de-de"].optionsHighScore="Highscores";P["de-de"].optionsMoreGames="Weitere Spiele";P["de-de"].optionsDifficulty_easy="Einfach";P["de-de"].optionsDifficulty_medium="Mittel";P["de-de"].optionsDifficulty_hard="Schwer";P["de-de"].optionsMusic_on="EIN";P["de-de"].optionsMusic_off="AUS";P["de-de"].optionsSFX_on="EIN";
P["de-de"].optionsSFX_off="AUS";P["de-de"]["optionsLang_en-us"]="Englisch (US)";P["de-de"]["optionsLang_en-gb"]="Englisch (GB)";P["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";P["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";P["de-de"].gameEndScreenBtnText="Weiter";P["de-de"].optionsTitle="Einstellungen";P["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
P["de-de"].optionsQuitConfirmBtn_No="NEIN";P["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";P["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";P["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";P["de-de"].optionsRestart="Neustart";P["de-de"].optionsSFXBig_on="Sound EIN";P["de-de"].optionsSFXBig_off="Sound AUS";P["de-de"].optionsAbout_title="\u00dcber";
P["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["de-de"].optionsAbout_backBtn="Zur\u00fcck";P["de-de"].optionsAbout_version="Version:";P["de-de"].optionsAbout="\u00dcber";P["de-de"].levelEndScreenMedal="VERBESSERT!";P["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";P["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";P["de-de"].startScreenByTinglyGames="von: CoolGames";P["de-de"]["optionsLang_de-de"]="Deutsch";P["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
P["de-de"].optionsAbout_header="Entwickelt von:";P["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";P["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";P["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";P["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";P["de-de"].challengeStartTextTime="Zeit von <NAME>:";P["de-de"].challengeStartScreenToWin="Einsatz:";P["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
P["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";P["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";P["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";P["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";P["de-de"].challengeCancelConfirmBtn_yes="Ja";P["de-de"].challengeCancelConfirmBtn_no="Nein";
P["de-de"].challengeEndScreensBtn_submit="Herausfordern";P["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";P["de-de"].challengeEndScreenName_you="Du";P["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";P["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";P["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
P["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";P["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";P["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";P["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";P["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
P["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";P["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";P["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";P["de-de"].challengeForfeitConfirmBtn_yes="Ja";P["de-de"].challengeForfeitConfirmBtn_no="Nein";P["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";P["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
P["de-de"].optionsChallengeForfeit="Aufgeben";P["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";P["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";P["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";P["de-de"].levelEndScreenHighScore_time="Bestzeit:";P["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
P["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";P["de-de"]["optionsLang_ko-kr"]="Koreanisch";P["de-de"]["optionsLang_ar-eg"]="Arabisch";P["de-de"]["optionsLang_es-es"]="Spanisch";P["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";P["de-de"]["optionsLang_ru-ru"]="Russisch";P["de-de"].optionsExit="Verlassen";P["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";P["de-de"].levelEndScreenHighScore_number="Highscore:";P["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
P["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";P["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["de-de"].optionsAbout_header_publisher="Published by:";P["de-de"]["optionsLang_jp-jp"]="Japanese";P["de-de"]["optionsLang_it-it"]="Italian";P["fr-fr"]=P["fr-fr"]||{};P["fr-fr"].loadingScreenLoading="Chargement...";
P["fr-fr"].startScreenPlay="JOUER";P["fr-fr"].levelMapScreenTotalScore="Score total";P["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";P["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";P["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";P["fr-fr"].levelEndScreenTotalScore="Score total";P["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";P["fr-fr"].levelEndScreenTimeLeft="Temps restant";P["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
P["fr-fr"].levelEndScreenHighScore="Meilleur score";P["fr-fr"].optionsStartScreen="Menu principal";P["fr-fr"].optionsQuit="Quitter";P["fr-fr"].optionsResume="Reprendre";P["fr-fr"].optionsTutorial="Comment jouer";P["fr-fr"].optionsHighScore="Meilleurs scores";P["fr-fr"].optionsMoreGames="Plus de jeux";P["fr-fr"].optionsDifficulty_easy="Facile";P["fr-fr"].optionsDifficulty_medium="Moyen";P["fr-fr"].optionsDifficulty_hard="Difficile";P["fr-fr"].optionsMusic_on="Avec";P["fr-fr"].optionsMusic_off="Sans";
P["fr-fr"].optionsSFX_on="Avec";P["fr-fr"].optionsSFX_off="Sans";P["fr-fr"]["optionsLang_en-us"]="Anglais (US)";P["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";P["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";P["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";P["fr-fr"].gameEndScreenBtnText="Continuer";P["fr-fr"].optionsTitle="Param\u00e8tres";P["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
P["fr-fr"].optionsQuitConfirmBtn_No="Non";P["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";P["fr-fr"].levelMapScreenTitle="Choisir un niveau";P["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";P["fr-fr"].optionsRestart="Recommencer";P["fr-fr"].optionsSFXBig_on="Avec son";P["fr-fr"].optionsSFXBig_off="Sans son";P["fr-fr"].optionsAbout_title="\u00c0 propos";
P["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["fr-fr"].optionsAbout_backBtn="Retour";P["fr-fr"].optionsAbout_version="Version :";P["fr-fr"].optionsAbout="\u00c0 propos";P["fr-fr"].levelEndScreenMedal="RECORD BATTU !";P["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";P["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";P["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";P["fr-fr"]["optionsLang_de-de"]="Allemand";P["fr-fr"]["optionsLang_tr-tr"]="Turc";
P["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";P["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";P["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";P["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";P["fr-fr"].challengeStartTextScore="Son score :";P["fr-fr"].challengeStartTextTime="Son temps\u00a0:";P["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";P["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
P["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";P["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";P["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";P["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";P["fr-fr"].challengeCancelConfirmBtn_yes="Oui";P["fr-fr"].challengeCancelConfirmBtn_no="Non";P["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
P["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";P["fr-fr"].challengeEndScreenName_you="Moi";P["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";P["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";P["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";P["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
P["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";P["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";P["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";P["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";P["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
P["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";P["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";P["fr-fr"].challengeForfeitConfirmBtn_no="Non";P["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";P["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";P["fr-fr"].optionsChallengeForfeit="Abandonner";P["fr-fr"].optionsChallengeCancel="Annuler";P["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
P["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";P["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";P["fr-fr"].levelEndScreenTotalScore_time="Temps total :";P["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";P["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";P["fr-fr"]["optionsLang_ar-eg"]="Arabe";P["fr-fr"]["optionsLang_es-es"]="Espagnol";P["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
P["fr-fr"]["optionsLang_ru-ru"]="Russe";P["fr-fr"].optionsExit="Quitter";P["fr-fr"].levelEndScreenTotalScore_number="Score total :";P["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";P["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";P["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
P["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["fr-fr"].optionsAbout_header_publisher="Published by:";P["fr-fr"]["optionsLang_jp-jp"]="Japanese";P["fr-fr"]["optionsLang_it-it"]="Italian";P["pt-br"]=P["pt-br"]||{};P["pt-br"].loadingScreenLoading="Carregando...";P["pt-br"].startScreenPlay="JOGAR";P["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";P["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";P["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
P["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";P["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";P["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";P["pt-br"].levelEndScreenTimeLeft="Tempo restante";P["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";P["pt-br"].levelEndScreenHighScore="Recorde";P["pt-br"].optionsStartScreen="Menu principal";P["pt-br"].optionsQuit="Sair";P["pt-br"].optionsResume="Continuar";P["pt-br"].optionsTutorial="Como jogar";
P["pt-br"].optionsHighScore="Recordes";P["pt-br"].optionsMoreGames="Mais jogos";P["pt-br"].optionsDifficulty_easy="F\u00e1cil";P["pt-br"].optionsDifficulty_medium="M\u00e9dio";P["pt-br"].optionsDifficulty_hard="Dif\u00edcil";P["pt-br"].optionsMusic_on="Sim";P["pt-br"].optionsMusic_off="N\u00e3o";P["pt-br"].optionsSFX_on="Sim";P["pt-br"].optionsSFX_off="N\u00e3o";P["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";P["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";P["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
P["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";P["pt-br"].gameEndScreenBtnText="Continuar";P["pt-br"].optionsTitle="Configura\u00e7\u00f5es";P["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";P["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";P["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";P["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
P["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";P["pt-br"].optionsRestart="Reiniciar";P["pt-br"].optionsSFXBig_on="Com som";P["pt-br"].optionsSFXBig_off="Sem som";P["pt-br"].optionsAbout_title="Sobre";P["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["pt-br"].optionsAbout_backBtn="Voltar";P["pt-br"].optionsAbout_version="vers\u00e3o:";
P["pt-br"].optionsAbout="Sobre";P["pt-br"].levelEndScreenMedal="MELHOROU!";P["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";P["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";P["pt-br"].startScreenByTinglyGames="da: CoolGames";P["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";P["pt-br"]["optionsLang_tr-tr"]="Turco";P["pt-br"].optionsAbout_header="Desenvolvido por:";P["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";P["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
P["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["pt-br"].challengeStartTextScore="<NAME>'s score:";P["pt-br"].challengeStartTextTime="<NAME>'s time:";P["pt-br"].challengeStartScreenToWin="Amount to win:";P["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
P["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";P["pt-br"].challengeCancelConfirmBtn_yes="Yes";P["pt-br"].challengeCancelConfirmBtn_no="No";P["pt-br"].challengeEndScreensBtn_submit="Submit challenge";P["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";P["pt-br"].challengeEndScreenName_you="You";
P["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";P["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";P["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
P["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";P["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";P["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";P["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
P["pt-br"].challengeForfeitConfirmBtn_yes="Yes";P["pt-br"].challengeForfeitConfirmBtn_no="No";P["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";P["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["pt-br"].optionsChallengeForfeit="Desistir";P["pt-br"].optionsChallengeCancel="Sair do Jogo";P["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
P["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";P["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";P["pt-br"].levelEndScreenTotalScore_time="Tempo total:";P["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";P["pt-br"]["optionsLang_ko-kr"]="Coreano";P["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";P["pt-br"]["optionsLang_es-es"]="Espanhol";P["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
P["pt-br"]["optionsLang_ru-ru"]="Russo";P["pt-br"].optionsExit="Sa\u00edda";P["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";P["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";P["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["pt-br"].optionsAbout_header_publisher="Published by:";P["pt-br"]["optionsLang_jp-jp"]="Japanese";P["pt-br"]["optionsLang_it-it"]="Italian";P["es-es"]=P["es-es"]||{};P["es-es"].loadingScreenLoading="Cargando...";
P["es-es"].startScreenPlay="JUGAR";P["es-es"].levelMapScreenTotalScore="Punt. total";P["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";P["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";P["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";P["es-es"].levelEndScreenTotalScore="Punt. total";P["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";P["es-es"].levelEndScreenTimeLeft="Tiempo restante";P["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
P["es-es"].levelEndScreenHighScore="R\u00e9cord";P["es-es"].optionsStartScreen="Men\u00fa principal";P["es-es"].optionsQuit="Salir";P["es-es"].optionsResume="Seguir";P["es-es"].optionsTutorial="C\u00f3mo jugar";P["es-es"].optionsHighScore="R\u00e9cords";P["es-es"].optionsMoreGames="M\u00e1s juegos";P["es-es"].optionsDifficulty_easy="F\u00e1cil";P["es-es"].optionsDifficulty_medium="Normal";P["es-es"].optionsDifficulty_hard="Dif\u00edcil";P["es-es"].optionsMusic_on="S\u00ed";
P["es-es"].optionsMusic_off="No";P["es-es"].optionsSFX_on="S\u00ed";P["es-es"].optionsSFX_off="No";P["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";P["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";P["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";P["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";P["es-es"].gameEndScreenBtnText="Continuar";P["es-es"].optionsTitle="Ajustes";P["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
P["es-es"].optionsQuitConfirmBtn_No="No";P["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";P["es-es"].levelMapScreenTitle="Elige un nivel";P["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";P["es-es"].optionsRestart="Reiniciar";P["es-es"].optionsSFXBig_on="Sonido s\u00ed";P["es-es"].optionsSFXBig_off="Sonido no";P["es-es"].optionsAbout_title="Acerca de";
P["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["es-es"].optionsAbout_backBtn="Atr\u00e1s";P["es-es"].optionsAbout_version="versi\u00f3n:";P["es-es"].optionsAbout="Acerca de";P["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";P["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";P["es-es"].levelMapScreenWorld_0="Elige un nivel";P["es-es"].startScreenByTinglyGames="de: CoolGames";P["es-es"]["optionsLang_de-de"]="Alem\u00e1n";P["es-es"]["optionsLang_tr-tr"]="Turco";
P["es-es"].optionsAbout_header="Desarrollado por:";P["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";P["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";P["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["es-es"].challengeStartTextScore="<NAME>'s score:";P["es-es"].challengeStartTextTime="<NAME>'s time:";P["es-es"].challengeStartScreenToWin="Amount to win:";P["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
P["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";P["es-es"].challengeCancelConfirmBtn_yes="Yes";P["es-es"].challengeCancelConfirmBtn_no="No";
P["es-es"].challengeEndScreensBtn_submit="Submit challenge";P["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";P["es-es"].challengeEndScreenName_you="You";P["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";P["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
P["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";P["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";P["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
P["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";P["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";P["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["es-es"].challengeForfeitConfirmBtn_yes="Yes";P["es-es"].challengeForfeitConfirmBtn_no="No";P["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";P["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
P["es-es"].optionsChallengeForfeit="Rendirse";P["es-es"].optionsChallengeCancel="Abandonar";P["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";P["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";P["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";P["es-es"].levelEndScreenTotalScore_time="Tiempo total:";P["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";P["es-es"]["optionsLang_ko-kr"]="Coreano";
P["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";P["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";P["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";P["es-es"]["optionsLang_ru-ru"]="Ruso";P["es-es"].optionsExit="Salir";P["es-es"].levelEndScreenTotalScore_number="Puntos totales:";P["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";P["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["es-es"].optionsAbout_header_publisher="Published by:";P["es-es"]["optionsLang_jp-jp"]="Japanese";P["es-es"]["optionsLang_it-it"]="Italian";P["tr-tr"]=P["tr-tr"]||{};P["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
P["tr-tr"].startScreenPlay="OYNA";P["tr-tr"].levelMapScreenTotalScore="Toplam skor";P["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";P["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";P["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";P["tr-tr"].levelEndScreenTotalScore="Toplam skor";P["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";P["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";P["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
P["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";P["tr-tr"].optionsStartScreen="Ana men\u00fc";P["tr-tr"].optionsQuit="\u00c7\u0131k";P["tr-tr"].optionsResume="Devam et";P["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";P["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";P["tr-tr"].optionsMoreGames="Daha Fazla Oyun";P["tr-tr"].optionsDifficulty_easy="Kolay";P["tr-tr"].optionsDifficulty_medium="Orta";P["tr-tr"].optionsDifficulty_hard="Zorluk";P["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
P["tr-tr"].optionsMusic_off="Kapal\u0131";P["tr-tr"].optionsSFX_on="A\u00e7\u0131k";P["tr-tr"].optionsSFX_off="Kapal\u0131";P["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";P["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";P["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";P["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";P["tr-tr"].gameEndScreenBtnText="Devam";P["tr-tr"].optionsTitle="Ayarlar";P["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
P["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";P["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";P["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";P["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";P["tr-tr"].optionsRestart="Tekrar ba\u015flat";P["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";P["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
P["tr-tr"].optionsAbout_title="Hakk\u0131nda";P["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["tr-tr"].optionsAbout_backBtn="Geri";P["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";P["tr-tr"].optionsAbout="Hakk\u0131nda";P["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";P["tr-tr"].startScreenQuestionaire="Ne dersin?";P["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";P["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
P["tr-tr"]["optionsLang_de-de"]="Almanca";P["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";P["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";P["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";P["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";P["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["tr-tr"].challengeStartTextScore="<NAME>'s score:";P["tr-tr"].challengeStartTextTime="<NAME>'s time:";
P["tr-tr"].challengeStartScreenToWin="Amount to win:";P["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["tr-tr"].challengeCancelConfirmBtn_yes="Yes";P["tr-tr"].challengeCancelConfirmBtn_no="No";P["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";P["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";P["tr-tr"].challengeEndScreenName_you="You";P["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
P["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";P["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
P["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";P["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";P["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";P["tr-tr"].challengeForfeitConfirmBtn_no="No";P["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
P["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";P["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";P["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";P["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
P["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";P["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";P["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";P["tr-tr"]["optionsLang_ko-kr"]="Korece";P["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";P["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";P["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";P["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";P["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";P["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
P["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";P["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";P["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
P["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["tr-tr"].optionsAbout_header_publisher="Published by:";P["tr-tr"]["optionsLang_jp-jp"]="Japanese";P["tr-tr"]["optionsLang_it-it"]="Italian";P["ru-ru"]=P["ru-ru"]||{};P["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";P["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";P["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
P["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";P["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";P["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";P["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";P["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
P["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";P["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";P["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";P["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";P["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
P["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";P["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";P["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";P["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";P["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";P["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
P["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";P["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";P["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";P["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";P["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";P["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";P["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
P["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";P["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";P["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";P["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
P["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
P["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";P["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";P["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";P["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
P["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";P["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";P["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";P["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";P["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";P["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";P["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
P["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";P["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";P["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";P["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";P["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
P["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";P["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";P["ru-ru"].optionsAbout_header="Developed by:";P["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";P["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";P["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["ru-ru"].challengeStartTextScore="<NAME>'s score:";
P["ru-ru"].challengeStartTextTime="<NAME>'s time:";P["ru-ru"].challengeStartScreenToWin="Amount to win:";P["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["ru-ru"].challengeCancelConfirmBtn_yes="Yes";P["ru-ru"].challengeCancelConfirmBtn_no="No";P["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";P["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";P["ru-ru"].challengeEndScreenName_you="You";P["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
P["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";P["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
P["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";P["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";P["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";P["ru-ru"].challengeForfeitConfirmBtn_no="No";P["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
P["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["ru-ru"].optionsChallengeForfeit="Forfeit";P["ru-ru"].optionsChallengeCancel="Quit";P["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["ru-ru"].levelEndScreenHighScore_time="Best time:";P["ru-ru"].levelEndScreenTotalScore_time="Total time:";
P["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";P["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";P["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";P["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";P["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
P["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";P["ru-ru"].optionsExit="Exit";P["ru-ru"].levelEndScreenTotalScore_number="Total score:";P["ru-ru"].levelEndScreenHighScore_number="High score:";P["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["ru-ru"].optionsAbout_header_publisher="Published by:";P["ru-ru"]["optionsLang_jp-jp"]="Japanese";P["ru-ru"]["optionsLang_it-it"]="Italian";P["ar-eg"]=P["ar-eg"]||{};P["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
P["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";P["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";P["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";P["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";P["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";P["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
P["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";P["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";P["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";P["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
P["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";P["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";P["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";P["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";P["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
P["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";P["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";P["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";P["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";P["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";P["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
P["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";P["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";P["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
P["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";P["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";P["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";P["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
P["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";P["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
P["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";P["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";P["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";P["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
P["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";P["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";P["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";P["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";P["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
P["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";P["ar-eg"].optionsAbout="\u062d\u0648\u0644";P["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";P["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";P["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";P["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
P["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";P["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";P["ar-eg"].optionsAbout_header="Developed by:";P["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";P["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";P["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["ar-eg"].challengeStartTextScore="<NAME>'s score:";
P["ar-eg"].challengeStartTextTime="<NAME>'s time:";P["ar-eg"].challengeStartScreenToWin="Amount to win:";P["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["ar-eg"].challengeCancelConfirmBtn_yes="Yes";P["ar-eg"].challengeCancelConfirmBtn_no="No";P["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";P["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";P["ar-eg"].challengeEndScreenName_you="You";P["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
P["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";P["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
P["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";P["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";P["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";P["ar-eg"].challengeForfeitConfirmBtn_no="No";P["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
P["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["ar-eg"].optionsChallengeForfeit="Forfeit";P["ar-eg"].optionsChallengeCancel="Quit";P["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["ar-eg"].levelEndScreenHighScore_time="Best time:";P["ar-eg"].levelEndScreenTotalScore_time="Total time:";
P["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";P["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";P["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";P["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";P["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
P["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";P["ar-eg"].optionsExit="Exit";P["ar-eg"].levelEndScreenTotalScore_number="Total score:";P["ar-eg"].levelEndScreenHighScore_number="High score:";P["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["ar-eg"].optionsAbout_header_publisher="Published by:";P["ar-eg"]["optionsLang_jp-jp"]="Japanese";P["ar-eg"]["optionsLang_it-it"]="Italian";P["ko-kr"]=P["ko-kr"]||{};P["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
P["ko-kr"].startScreenPlay="PLAY";P["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";P["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";P["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";P["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";P["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";P["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";P["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
P["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";P["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";P["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";P["ko-kr"].optionsQuit="\uc885\ub8cc";P["ko-kr"].optionsResume="\uacc4\uc18d";P["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";P["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";P["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";P["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
P["ko-kr"].optionsDifficulty_medium="\uc911";P["ko-kr"].optionsDifficulty_hard="\uc0c1";P["ko-kr"].optionsMusic_on="\ucf1c\uae30";P["ko-kr"].optionsMusic_off="\ub044\uae30";P["ko-kr"].optionsSFX_on="\ucf1c\uae30";P["ko-kr"].optionsSFX_off="\ub044\uae30";P["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";P["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";P["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";P["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
P["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";P["ko-kr"].optionsTitle="\uc124\uc815";P["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";P["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";P["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
P["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";P["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";P["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";P["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";P["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
P["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";P["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";P["ko-kr"].optionsAbout_version="\ubc84\uc804:";P["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";P["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";P["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";P["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
P["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";P["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";P["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";P["ko-kr"].optionsAbout_header="Developed by:";P["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";P["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";P["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";P["ko-kr"].challengeStartTextScore="<NAME>'s score:";
P["ko-kr"].challengeStartTextTime="<NAME>'s time:";P["ko-kr"].challengeStartScreenToWin="Amount to win:";P["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";P["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";P["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["ko-kr"].challengeCancelConfirmBtn_yes="Yes";P["ko-kr"].challengeCancelConfirmBtn_no="No";P["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";P["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";P["ko-kr"].challengeEndScreenName_you="You";P["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
P["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";P["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";P["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
P["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";P["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";P["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";P["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";P["ko-kr"].challengeForfeitConfirmBtn_no="No";P["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
P["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";P["ko-kr"].optionsChallengeForfeit="Forfeit";P["ko-kr"].optionsChallengeCancel="Quit";P["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["ko-kr"].levelEndScreenHighScore_time="Best time:";P["ko-kr"].levelEndScreenTotalScore_time="Total time:";
P["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";P["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";P["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";P["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";P["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";P["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";P["ko-kr"].optionsExit="Exit";P["ko-kr"].levelEndScreenTotalScore_number="Total score:";
P["ko-kr"].levelEndScreenHighScore_number="High score:";P["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";P["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
P["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["ko-kr"].optionsAbout_header_publisher="Published by:";P["ko-kr"]["optionsLang_jp-jp"]="Japanese";P["ko-kr"]["optionsLang_it-it"]="Italian";P["jp-jp"]=P["jp-jp"]||{};P["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";P["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";P["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";P["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
P["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";P["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";P["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";P["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";P["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";P["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";P["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
P["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";P["jp-jp"].optionsQuit="\u3084\u3081\u308b";P["jp-jp"].optionsResume="\u518d\u958b";P["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";P["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";P["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";P["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";P["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";P["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
P["jp-jp"].optionsMusic_on="\u30aa\u30f3";P["jp-jp"].optionsMusic_off="\u30aa\u30d5";P["jp-jp"].optionsSFX_on="\u30aa\u30f3";P["jp-jp"].optionsSFX_off="\u30aa\u30d5";P["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";P["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";P["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";P["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
P["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";P["jp-jp"].optionsTitle="\u8a2d\u5b9a";P["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";P["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";P["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
P["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";P["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";P["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";P["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";P["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
P["jp-jp"].optionsAbout_title="About";P["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";P["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";P["jp-jp"].optionsAbout_version="version";P["jp-jp"].optionsAbout="About";P["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";P["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";P["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";P["jp-jp"].startScreenByTinglyGames="by: CoolGames";
P["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";P["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";P["jp-jp"].optionsAbout_header="Developed by";P["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";P["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";P["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";P["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
P["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";P["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";P["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";P["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";P["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";P["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";P["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
P["jp-jp"].challengeCancelConfirmBtn_yes="Yes";P["jp-jp"].challengeCancelConfirmBtn_no="No";P["jp-jp"].challengeEndScreensBtn_submit="\u3042";P["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";P["jp-jp"].challengeEndScreenName_you="You";P["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";P["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";P["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
P["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";P["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";P["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";P["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";P["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
P["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";P["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";P["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";P["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";P["jp-jp"].challengeForfeitConfirmBtn_no="No";P["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";P["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
P["jp-jp"].optionsChallengeForfeit="Forfeit";P["jp-jp"].optionsChallengeCancel="Quit";P["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";P["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";P["jp-jp"].levelEndScreenHighScore_time="Best time:";P["jp-jp"].levelEndScreenTotalScore_time="Total time:";P["jp-jp"]["optionsLang_fr-fr"]="French";P["jp-jp"]["optionsLang_ko-kr"]="Korean";P["jp-jp"]["optionsLang_ar-eg"]="Arabic";
P["jp-jp"]["optionsLang_es-es"]="Spanish";P["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";P["jp-jp"]["optionsLang_ru-ru"]="Russian";P["jp-jp"].optionsExit="Exit";P["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";P["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";P["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
P["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";P["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";P["jp-jp"].optionsAbout_header_publisher="Published by:";P["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";P["jp-jp"]["optionsLang_it-it"]="Italian";P["it-it"]=P["it-it"]||{};P["it-it"].loadingScreenLoading="Caricamento...";
P["it-it"].startScreenPlay="GIOCA";P["it-it"].levelMapScreenTotalScore="Punteggio totale";P["it-it"].levelEndScreenTitle_level="Livello <VALUE>";P["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";P["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";P["it-it"].levelEndScreenTotalScore="Punteggio totale";P["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";P["it-it"].levelEndScreenTimeLeft="Tempo rimanente";P["it-it"].levelEndScreenTimeBonus="Tempo bonus";
P["it-it"].levelEndScreenHighScore="Record";P["it-it"].optionsStartScreen="Menu principale";P["it-it"].optionsQuit="Esci";P["it-it"].optionsResume="Riprendi";P["it-it"].optionsTutorial="Come si gioca";P["it-it"].optionsHighScore="Record";P["it-it"].optionsMoreGames="Altri giochi";P["it-it"].optionsDifficulty_easy="Facile";P["it-it"].optionsDifficulty_medium="Media";P["it-it"].optionsDifficulty_hard="Difficile";P["it-it"].optionsMusic_on="S\u00ec";P["it-it"].optionsMusic_off="No";
P["it-it"].optionsSFX_on="S\u00ec";P["it-it"].optionsSFX_off="No";P["it-it"]["optionsLang_en-us"]="Inglese (US)";P["it-it"]["optionsLang_en-gb"]="Inglese (UK)";P["it-it"]["optionsLang_nl-nl"]="Olandese";P["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";P["it-it"].gameEndScreenBtnText="Continua";P["it-it"].optionsTitle="Impostazioni";P["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
P["it-it"].optionsQuitConfirmBtn_No="No";P["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";P["it-it"].levelMapScreenTitle="Scegli un livello";P["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";P["it-it"].optionsRestart="Riavvia";P["it-it"].optionsSFXBig_on="Audio S\u00cc";P["it-it"].optionsSFXBig_off="Audio NO";P["it-it"].optionsAbout_title="Informazioni";P["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
P["it-it"].optionsAbout_backBtn="Indietro";P["it-it"].optionsAbout_version="versione:";P["it-it"].optionsAbout="Informazioni";P["it-it"].levelEndScreenMedal="MIGLIORATO!";P["it-it"].startScreenQuestionaire="Che ne pensi?";P["it-it"].levelMapScreenWorld_0="Scegli un livello";P["it-it"].startScreenByTinglyGames="di: CoolGames";P["it-it"]["optionsLang_de-de"]="Tedesco";P["it-it"]["optionsLang_tr-tr"]="Turco";P["it-it"].optionsAbout_header="Sviluppato da:";P["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
P["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";P["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";P["it-it"].challengeStartTextScore="punteggio di <NAME>:";P["it-it"].challengeStartTextTime="tempo di <NAME>:";P["it-it"].challengeStartScreenToWin="Necessario per vincere:";P["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";P["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
P["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";P["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";P["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";P["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";P["it-it"].challengeCancelConfirmBtn_no="No";P["it-it"].challengeEndScreensBtn_submit="Invia la sfida";P["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
P["it-it"].challengeEndScreenName_you="Tu";P["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";P["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";P["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";P["it-it"].challengeCancelMessage_success="Sfida annullata.";P["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
P["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";P["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";P["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";P["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";P["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";P["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
P["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";P["it-it"].challengeForfeitConfirmBtn_no="No";P["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";P["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";P["it-it"].optionsChallengeForfeit="Abbandona";P["it-it"].optionsChallengeCancel="Esci";P["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";P["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
P["it-it"].levelEndScreenHighScore_time="Miglior tempo:";P["it-it"].levelEndScreenTotalScore_time="Tempo totale:";P["it-it"]["optionsLang_fr-fr"]="Francese";P["it-it"]["optionsLang_ko-kr"]="Coreano";P["it-it"]["optionsLang_ar-eg"]="Arabo";P["it-it"]["optionsLang_es-es"]="Spagnolo";P["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";P["it-it"]["optionsLang_ru-ru"]="Russo";P["it-it"].optionsExit="Esci";P["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
P["it-it"].levelEndScreenHighScore_number="Record:";P["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";P["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
P["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";P["it-it"].optionsAbout_header_publisher="Distribuito da:";P["it-it"]["optionsLang_jp-jp"]="Giapponese";P["it-it"]["optionsLang_it-it"]="Italiano";P=P||{};P["nl-nl"]=P["nl-nl"]||{};P["nl-nl"].game_ui_SCORE="SCORE";P["nl-nl"].game_ui_STAGE="LEVEL";P["nl-nl"].game_ui_LIVES="LEVENS";P["nl-nl"].game_ui_TIME="TIJD";P["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";P["nl-nl"].game_ui_LEVEL="LEVEL";P["nl-nl"].game_ui_time_left="Resterende tijd";
P["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";P["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";P["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";P["en-us"]=P["en-us"]||{};P["en-us"].game_ui_SCORE="SCORE";P["en-us"].game_ui_STAGE="STAGE";P["en-us"].game_ui_LIVES="LIVES";P["en-us"].game_ui_TIME="TIME";P["en-us"].game_ui_HIGHSCORE="HIGH SCORE";P["en-us"].game_ui_LEVEL="LEVEL";P["en-us"].game_ui_time_left="Time left";P["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";P["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
P["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";P["en-gb"]=P["en-gb"]||{};P["en-gb"].game_ui_SCORE="SCORE";P["en-gb"].game_ui_STAGE="STAGE";P["en-gb"].game_ui_LIVES="LIVES";P["en-gb"].game_ui_TIME="TIME";P["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";P["en-gb"].game_ui_LEVEL="LEVEL";P["en-gb"].game_ui_time_left="Time left";P["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";P["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";P["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";P["de-de"]=P["de-de"]||{};
P["de-de"].game_ui_SCORE="PUNKTE";P["de-de"].game_ui_STAGE="STUFE";P["de-de"].game_ui_LIVES="LEBEN";P["de-de"].game_ui_TIME="ZEIT";P["de-de"].game_ui_HIGHSCORE="HIGHSCORE";P["de-de"].game_ui_LEVEL="LEVEL";P["de-de"].game_ui_time_left="Restzeit";P["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";P["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";P["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";P["fr-fr"]=P["fr-fr"]||{};P["fr-fr"].game_ui_SCORE="SCORE";P["fr-fr"].game_ui_STAGE="SC\u00c8NE";
P["fr-fr"].game_ui_LIVES="VIES";P["fr-fr"].game_ui_TIME="TEMPS";P["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";P["fr-fr"].game_ui_LEVEL="NIVEAU";P["fr-fr"].game_ui_time_left="Temps restant";P["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";P["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";P["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";P["pt-br"]=P["pt-br"]||{};P["pt-br"].game_ui_SCORE="PONTOS";P["pt-br"].game_ui_STAGE="FASE";P["pt-br"].game_ui_LIVES="VIDAS";P["pt-br"].game_ui_TIME="TEMPO";
P["pt-br"].game_ui_HIGHSCORE="RECORDE";P["pt-br"].game_ui_LEVEL="N\u00cdVEL";P["pt-br"].game_ui_time_left="Tempo restante";P["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";P["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";P["pt-br"].game_ui_HIGHSCORE_break="RECORDE";P["es-es"]=P["es-es"]||{};P["es-es"].game_ui_SCORE="PUNTOS";P["es-es"].game_ui_STAGE="FASE";P["es-es"].game_ui_LIVES="VIDAS";P["es-es"].game_ui_TIME="TIEMPO";P["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
P["es-es"].game_ui_LEVEL="NIVEL";P["es-es"].game_ui_time_left="Tiempo restante";P["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";P["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";P["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";P["tr-tr"]=P["tr-tr"]||{};P["tr-tr"].game_ui_SCORE="SKOR";P["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";P["tr-tr"].game_ui_LIVES="HAYATLAR";P["tr-tr"].game_ui_TIME="S\u00dcRE";P["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";P["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
P["tr-tr"].game_ui_time_left="Kalan zaman";P["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";P["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";P["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";P["ru-ru"]=P["ru-ru"]||{};P["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";P["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";P["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";P["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
P["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";P["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";P["ru-ru"].game_ui_time_left="Time left";P["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";P["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";P["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";P["ar-eg"]=P["ar-eg"]||{};P["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";P["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
P["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";P["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";P["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";P["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";P["ar-eg"].game_ui_time_left="Time left";P["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";P["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";P["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
P["ko-kr"]=P["ko-kr"]||{};P["ko-kr"].game_ui_SCORE="\uc810\uc218";P["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";P["ko-kr"].game_ui_LIVES="\uae30\ud68c";P["ko-kr"].game_ui_TIME="\uc2dc\uac04";P["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";P["ko-kr"].game_ui_LEVEL="\ub808\ubca8";P["ko-kr"].game_ui_time_left="Time left";P["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";P["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";P["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
P["jp-jp"]=P["jp-jp"]||{};P["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";P["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";P["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";P["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";P["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";P["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";P["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";P["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";P["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
P["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";P["it-it"]=P["it-it"]||{};P["it-it"].game_ui_SCORE="PUNTEGGIO";P["it-it"].game_ui_STAGE="FASE";P["it-it"].game_ui_LIVES="VITE";P["it-it"].game_ui_TIME="TEMPO";P["it-it"].game_ui_HIGHSCORE="RECORD";P["it-it"].game_ui_LEVEL="LIVELLO";P["it-it"].game_ui_time_left="TEMPO RIMANENTE";P["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";P["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";P["it-it"].game_ui_HIGHSCORE_break="RECORD";
var Uf={};
function Vf(){Uf={xe:{$k:"en-us",Yj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Td:{gd:N(1040),Kq:N(960),rc:N(640),$g:N(640),Rf:N(0),ol:N(-80),Qf:0,minHeight:N(780),cn:{id:"canvasBackground",depth:50},Kc:{id:"canvasGame",depth:100,top:N(200,"round"),left:N(40,"round"),width:N(560,"round"),height:N(560,"round")},dd:{id:"canvasGameUI",depth:150,top:0,left:0,height:N(120,"round")},Mf:{id:"canvasMain",depth:200}},lk:{gd:N(640),Kq:N(640),rc:N(1152),$g:N(1152),
Rf:N(0),ol:N(0),Qf:0,minHeight:N(640),minWidth:N(850),cn:{id:"canvasBackground",depth:50},Kc:{id:"canvasGame",depth:100,top:N(40,"round"),left:N(296,"round"),width:N(560,"round"),height:N(560,"round")},dd:{id:"canvasGameUI",depth:150,top:0,left:N(151),width:N(140)},Mf:{id:"canvasMain",depth:200}},qc:{bigPlay:{type:"text",s:ue,Ia:N(38),Db:N(99),font:{align:"center",i:"middle",fontSize:O({big:46,small:30}),fillColor:"#01198a",R:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},td:2,ud:N(30),fontSize:O({big:46,
small:30})},difficulty_toggle:{type:"toggleText",s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"0",s:$c,T:"optionsDifficulty_easy"},{id:"1",s:Zc,T:"optionsDifficulty_medium"},{id:"2",s:Yc,T:"optionsDifficulty_hard"}],Hh:N(30),Ih:N(12),sg:N(10),td:2,ud:N(30),fontSize:O({big:40,small:20})},music_toggle:{type:"toggle",s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,
small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"on",s:te,T:"optionsMusic_on"},{id:"off",s:se,T:"optionsMusic_off"}],Hh:N(30),Ih:N(12),sg:0,td:2,ud:N(30)},sfx_toggle:{type:"toggle",s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"on",s:re,T:"optionsSFX_on"},{id:"off",s:qe,T:"optionsSFX_off"}],Hh:N(30),Ih:N(12),sg:0,td:2,ud:N(30)},music_big_toggle:{type:"toggleText",
s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"on",s:"undefined"!==typeof he?he:void 0,T:"optionsMusic_on"},{id:"off",s:"undefined"!==typeof ge?ge:void 0,T:"optionsMusic_off"}],Hh:N(28,"round"),Ih:N(10),sg:N(10),td:2,ud:N(30),fontSize:O({big:40,small:20})},sfx_big_toggle:{type:"toggleText",s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",
R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"on",s:"undefined"!==typeof de?de:void 0,T:"optionsSFXBig_on"},{id:"off",s:"undefined"!==typeof fe?fe:void 0,T:"optionsSFXBig_off"}],Hh:N(33,"round"),Ih:N(12),sg:N(10),td:2,ud:N(30),fontSize:O({big:40,small:20})},language_toggle:{type:"toggleText",s:pe,Ia:N(106),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ca:[{id:"en-us",s:ad,T:"optionsLang_en-us"},
{id:"en-gb",s:bd,T:"optionsLang_en-gb"},{id:"nl-nl",s:cd,T:"optionsLang_nl-nl"},{id:"de-de",s:ed,T:"optionsLang_de-de"},{id:"fr-fr",s:fd,T:"optionsLang_fr-fr"},{id:"pt-br",s:gd,T:"optionsLang_pt-br"},{id:"es-es",s:hd,T:"optionsLang_es-es"},{id:"ru-ru",s:jd,T:"optionsLang_ru-ru"},{id:"it-it",s:md,T:"optionsLang_it-it"},{id:"ar-eg",s:kd,T:"optionsLang_ar-eg"},{id:"ko-kr",s:ld,T:"optionsLang_ko-kr"},{id:"tr-tr",s:dd,T:"optionsLang_tr-tr"},{id:"jp-jp",s:id,T:"optionsLang_jp-jp"}],Hh:N(40),Ih:N(20),sg:N(10),
td:2,ud:N(30),fontSize:O({big:40,small:20})},default_text:{type:"text",s:oe,Ia:N(40),Db:N(40),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},td:2,ud:N(30),fontSize:O({big:40,small:20})},default_image:{type:"image",s:oe,Ia:N(40),Db:N(40),ud:N(6)},options:{type:"image",s:le}},bn:{bigPlay:{type:"text",s:ue,Ia:N(40),Db:N(76),font:{align:"center",i:"middle",fontSize:O({big:40,small:20}),fillColor:"#01198a",R:{h:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},td:2,ud:N(30),fontSize:O({big:40,small:20})}},hk:{green:{font:{align:"center",i:"middle",fillColor:"#018a17",R:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",i:"middle",fillColor:"#01198a",R:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",i:"middle",fillColor:"#004f89",R:{h:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",i:"middle",fillColor:"#9a1900",R:{h:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",i:"middle",fillColor:"#8d2501",R:{h:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",i:"middle",fillColor:"#c6258f",R:{h:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",i:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",i:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",i:"middle",fillColor:"#ffffff",R:{h:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",i:"middle",fillColor:"#ffffff",R:{h:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Oa:{ty:20},Ed:{backgroundImage:"undefined"!==typeof ze?ze:void 0,Cw:0,zu:500,kl:5E3,lw:5E3,$s:-1,qy:12,py:100,Le:N(78),tp:{align:"center"},fm:N(560),mh:N(400),nh:{align:"center"},gg:N(680),cf:N(16),oo:N(18),aj:N(8),ds:N(8),es:N(9),fs:N(9),wj:{align:"center",fillColor:"#3B0057",fontSize:N(24)},At:{align:"center"},
Bt:N(620),em:N(500),bj:"center",ig:N(500),dj:N(60),Ob:{align:"center"},Tc:{align:"bottom",offset:N(20)},to:N(806),ro:500,aw:N(20)},qo:{bj:"right",fm:N(280),gg:N(430),ig:N(340),Ob:{align:"right",offset:N(32)},Tc:N(560),to:N(560)},mp:{$m:N(860),backgroundImage:void 0!==typeof ze?ze:void 0,hv:700,vs:1800,xw:700,Zw:2600,fh:void 0!==typeof ze?Xd:void 0,Bd:700,Pi:{align:"center"},Mk:{align:"center"},Qi:void 0!==typeof Xd?-Xd.height:0,Oi:{align:"top",offset:N(20)},Mn:1,jr:1,Nn:1,kr:1,Ln:1,ir:1,lv:L,mv:vc,
jv:L,kv:L,iv:L,Yw:{align:"center"},Gl:N(656),ij:N(300),El:700,Xw:700,Oq:N(368),xk:N(796),Ei:N(440),Nq:700,Ao:N(36),nl:N(750),ww:500,bj:"center",ig:N(500),dj:N(60),Ob:{align:"center"},Tc:{align:"bottom",offset:N(20)},to:N(806),ro:500,aw:N(20)},np:{$m:N(0),Gl:N(456),ij:N(320),Oq:{align:"center"},xk:N(346),Ei:N(460),Ao:{align:"left",offset:N(32)},nl:N(528),bj:"right",ig:N(340),Ob:{align:"right",offset:N(32)},Tc:N(560),to:N(560)},lh:{Qw:{align:"center",offset:N(-230)},Jo:{align:"top",offset:N(576)},Pw:"options",
Md:{i:"bottom"},zg:{align:"center"},Vc:{align:"top",offset:N(35,"round")},vd:N(232),fe:N(98),Fy:{align:"center",offset:N(-206)},Hp:{align:"top",offset:N(30)},Ey:{align:"center",offset:N(206)},Gp:{align:"top",offset:N(30)},type:"grid",Mw:3,BA:3,Nw:5,CA:4,Rq:!0,Vu:!0,Vn:N(78),mr:{align:"top",offset:N(140)},or:{align:"top",offset:N(140)},nr:N(20),rv:N(18),sv:N(18),Pv:{Qn:{fontSize:O({big:60,small:30}),fillColor:"#3F4F5E",align:"center",i:"middle",R:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:N(6),blur:0}}},
Qv:{Qn:{fontSize:O({big:32,small:16}),fillColor:"#3F4F5E",align:"center",i:"middle",R:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:N(2),blur:0}}},Yr:N(438),Zr:N(438),Pr:{align:"center"},Qr:{align:"center"},hs:{align:"center"},is:{align:"center",offset:N(-22)},Ur:{align:"center"},Vr:{align:"center",offset:N(-10)},Tx:{align:"center",offset:N(216)},et:{align:"top",offset:N(574)},Sx:{fontSize:O({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},ft:N(10),Fs:{fontSize:O({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},Gs:{align:"center"},Hs:{align:"top",offset:N(588)},bx:N(160),ax:N(40),backgroundImage:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,ky:N(10),ly:200,jy:N(200),Yz:N(600),Hw:800,Gw:500},Sr:{Hp:{align:"top",offset:N(20)},Gp:{align:"top",offset:N(20)},Vc:{align:"top",offset:N(25,"round")},Vn:N(234),mr:{align:"top",offset:N(110)},or:{align:"top",offset:N(110)},et:{align:"top",offset:N(536)},Hs:{align:"top",offset:N(550)},Jo:{align:"top",offset:N(538)}},fl:{pd:"undefined"!==
typeof we?we:void 0,As:{align:"center"},Bs:"undefined"!==typeof we?-we.height:void 0,zl:[{type:"y",Qa:0,duration:800,end:{align:"center",offset:N(-142)},ob:vc,Hb:Jf}],No:[{type:"y",Qa:0,duration:600,end:"undefined"!==typeof we?-we.height:void 0,ob:uc,rq:!0}],eq:{align:"center",i:"middle"},uu:{align:"center"},gq:0,qi:N(500),fq:N(80),rr:{align:"center",i:"middle"},Av:{align:"center"},tr:0,Vi:N(560),sr:N(80),Ds:3500},mo:{zl:[{type:"y",Qa:0,duration:800,end:{align:"center"},ob:vc,Hb:Jf}]},ez:{pd:"undefined"!==
typeof s_overlay_challenge_start?s_overlay_challenge_start:void 0,As:{align:"center"},Bs:N(56),Bl:0,Cl:0,Md:{align:"center",i:"top"},vd:N(500),fe:N(100),zg:{align:"center"},Vc:N(90),kA:{align:"center",i:"middle"},pA:N(500),oA:N(80),tA:{align:"center"},uA:N(250),gB:{align:"center",i:"top"},iB:N(500),hB:N(40),jB:{align:"center"},kB:N(348),fB:{align:"center",i:"top"},mB:N(500),lB:N(50),oB:{align:"center"},pB:N(388),bC:{align:"center",i:"top"},dC:N(500),cC:N(40),gC:{align:"center"},hC:N(442),eC:0,fC:0,
aC:{align:"center",i:"top"},jC:N(500),iC:N(50),kC:{align:"center"},lC:N(482),$B:N(10),YB:0,ZB:0,oi:800,Qm:vc,Rm:600,Sm:uc,Ds:3500},dz:{Ly:500,oi:800,yA:1500,zA:500,nB:2500,sB:500,qB:3200,rB:800,dA:4200,eA:300,Xy:4500,HA:{align:"center"},IA:N(-800),FA:{align:"center"},GA:N(52),Bl:0,Cl:0,Ik:.8,$q:"#000000",Bo:{align:"center",i:"middle"},fA:N(360),aA:N(120),bA:N(4),cA:N(4),gA:{align:"center"},hA:N(340),KB:{align:"center"},LB:N(600),JB:N(500),IB:N(120),HB:{align:"center",i:"middle"},mC:{align:"center",
i:"middle"},qC:N(360),nC:N(60),oC:N(4),pC:N(4),rC:{align:"center"},sC:N(480),RB:N(460),MB:{align:"center"},NB:N(400),Yy:{align:"center"},Zy:N(500),wA:{align:"center",i:"middle"},xA:N(75,"round"),vA:N(48),AA:N(120),sA:N(214,"round"),lA:N(40),mA:N(4),nA:N(4),qA:0,rA:0,wz:{align:"center",i:"middle"},zz:N(220),yz:N(180),xz:N(80),uz:N(4),vz:N(4)},za:{Al:{mn:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,Zu:"undefined"!==typeof ye?ye:void 0,Rv:"undefined"!==typeof s_overlay_level_win?
s_overlay_level_win:void 0,Ov:"undefined"!==typeof s_overlay_level_fail?s_overlay_level_fail:void 0},oy:500,oi:800,Qm:vc,Rm:800,Sm:nc,zc:{align:"center"},Rb:0,Md:{align:"center",i:"middle",fontSize:O({big:26,small:13})},zg:{align:"center"},Vc:N(58),vd:N(500),fe:N(100),ey:{align:"center",i:"middle",fontSize:O({big:56,small:28})},fy:{align:"center"},gy:N(236),qn:{align:"center",i:"top",fontSize:O({big:24,small:12})},Vq:{align:"center"},Bk:N(144),Gi:{align:"center",i:"top",fontSize:O({big:56,small:28})},
Ek:{align:"center"},ah:N(176),Dk:N(200),Ck:N(60),tj:{align:"center",i:"top",fontSize:O({big:24,small:12})},nf:{align:"center"},of:N(286),lt:N(0),gr:!1,de:N(14),$l:N(10),og:{align:"center",i:"top",fontSize:O({big:24,small:12})},Bh:N(10),Ch:N(4),Dh:N(200),GB:N(50),xu:{align:"center",offset:N(12)},Wm:N(549),gv:{align:"center",offset:N(162)},Dn:N(489),xi:{align:"center",offset:N(250)},Pf:N(10),Xg:N(90),Of:N(90),gp:{align:"center",offset:N(-177,"round")},hp:N(120),ip:{align:"center"},jp:N(96),kp:{align:"center",
offset:N(179,"round")},lp:N(120),EB:200,Ox:500,bt:800,dt:0,Rx:0,Qx:300,Px:200,ct:300,Ik:.8,Lb:800,$q:"#000000",yo:N(508),fj:N(394),ks:N(96),ls:N(74),ll:3,oh:400,mw:2500,$z:0,pw:N(100),ms:1.5,uw:{align:"center"},vw:N(76),ml:N(180),tw:N(36),ns:{align:"center",i:"middle",fontSize:O({big:22,small:12}),J:"ff_opensans_extrabold",fillColor:"#1d347f",R:{h:!0,color:"#68cbfa",offsetY:N(2)}},js:500,nw:500,ow:N(-30),rw:500,qw:0,sw:4E3,lm:600,wy:1500,tq:500,Tg:750,Cv:{align:"center"},Dv:N(290),xr:N(350),Ew:1E3,
type:{level:{ak:"level",qd:!0,yh:!0,xj:"title_level",pf:"totalScore",Zj:"retry",Jk:"next"},failed:{ak:"failed",qd:!1,yh:!1,xj:"title_level",ot:"subtitle_failed",Zj:"exit",Jk:"retry"},endless:{ak:"endless",qd:!1,yh:!0,xj:"title_endless",rn:"totalScore",pf:"highScore",Zj:"exit",Jk:"retry"},difficulty:{ak:"difficulty",qd:!1,yh:!0,xj:"title_difficulty",rn:"timeLeft",pf:["totalScore","timeBonus"],Zj:"exit",Jk:"retry"}}},Or:{Pf:N(0),Vc:N(30),Bk:N(114),ah:N(146),of:N(266),Wm:N(488),Dn:N(428),yo:{align:"center",
offset:N(220)},fj:N(260)},Yi:{backgroundImage:"undefined"!==typeof be?be:void 0},options:{backgroundImage:ve,zc:{align:"center"},Rb:0,Md:{},zg:{align:"center"},Vc:N(58),vd:N(500),fe:N(100),jk:N(460,"round"),ik:{align:"center"},Wg:{align:"center",offset:N(36)},Sd:N(10,"round"),xi:N(510),Pf:N(10),Xg:N(130),Of:N(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",
["music","sfx"],"moreGames","quit"]},xl:800,yl:vc,Lo:600,Mo:nc,Gq:{align:"center"},rk:N(260),qk:N(460),gn:N(300),Eq:{align:"center"},pk:N(460),Dq:{align:"center"},ok:N(560,"round"),zi:N(460,"round"),Ml:{},Nd:"undefined"!==typeof xe?xe:void 0,om:{align:"center"},Me:N(84,"round"),um:{align:"center",i:"top"},vm:N(480),xp:N(46),Rt:{align:"center"},wm:N(110,"round"),Ot:{align:"center"},sm:N(160,"round"),Qt:{align:"center"},tm:N(446,"round"),rm:{i:"middle",align:"center",fontSize:O({big:36,small:18})},
Jh:N(480),Pt:N(160),Nt:{align:"center",offset:N(-80,"round")},qm:N(556,"round"),Mt:{align:"center",offset:N(80,"round")},pm:N(556,"round"),Rj:{align:"center",i:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ib:N(6)},Sj:N(480),Yp:N(50),Tj:{align:"center"},Lg:N(106,"round"),ki:{align:"center",i:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ib:N(6)},Df:N(480),li:N(110),Mg:{align:"center"},Ng:N(396,"round"),ii:{align:"center"},ji:N(140),Lm:{align:"center"},Kg:N(500),hi:N(480),Mm:{align:"center",
i:"top",fillColor:"#808080",fontSize:O({big:12,small:8})},aq:{align:"center"},Vj:N(610),$p:N(440),Zp:N(20),Og:N(200),Uj:N(200),au:N(80),bu:N(140),$t:N(10)},Rw:{Vc:N(12),Wg:{align:"center",offset:N(16)},rk:N(200),gn:N(300),pk:N(400),ok:N(500,"round"),Me:N(60,"round"),wm:N(80,"round"),sm:N(134,"round"),tm:N(410,"round"),qm:N(500,"round"),pm:N(500,"round"),Lg:N(86,"round"),ji:N(126),Ng:N(392,"round"),Kg:N(490),Vj:N(590)},ws:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:
ve,zc:{align:"center"},Rb:N(120),Md:{},zg:{align:"center"},Vc:N(200),jk:N(460,"round"),ik:{align:"center"},Wg:{align:"center",offset:N(140)},Sd:N(10,"round"),xi:N(510),Pf:N(10),Xg:N(130),Of:N(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},xl:800,yl:vc,Lo:600,Mo:nc,Ml:{},XA:{align:"center"},YA:N(360),WA:N(460),VA:N(300),RA:"default_text",
SA:{align:"center"},TA:N(630),OA:"default_text",PA:{align:"center"},QA:N(730,"round"),UA:N(460,"round"),Fq:{},Gq:{align:"center"},rk:N(200),qk:N(460),gn:N(250),Eq:{align:"center"},pk:N(520),Dq:{align:"center"},ok:N(620,"round"),zi:N(460,"round"),Bo:{},Aw:{align:"center"},Bw:N(200),Co:N(460),zw:N(300),Nd:"undefined"!==typeof xe?xe:void 0,om:{align:"center"},Me:N(0,"round"),um:{align:"center",i:"top"},vm:N(480),xp:N(50),Rt:{align:"center"},wm:N(20,"round"),Ot:{align:"center"},sm:N(70,"round"),Qt:{align:"center"},
tm:N(356,"round"),rm:{i:"middle",align:"center",fontSize:O({big:36,small:18})},Jh:N(480),Pt:N(150),Nt:N(224,"round"),qm:N(636,"round"),Mt:N(350,"round"),pm:N(636,"round"),Rj:{align:"center",i:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ib:N(6)},Sj:N(480),Yp:N(50),Tj:{align:"center"},Lg:N(26,"round"),ki:{align:"center",i:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ib:N(6)},Df:N(480),li:N(110),Mg:{align:"center"},Ng:N(316,"round"),ii:{align:"center"},ji:N(60),Lm:{align:"center"},
Kg:N(420),hi:N(480),Mm:{align:"center",i:"top",fillColor:"#808080",fontSize:O({big:12,small:8})},aq:{align:"center"},Vj:N(530),$p:N(440),Zp:N(20),Og:N(200),Uj:N(200),au:N(80),bu:N(100),$t:N(10)},ln:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:ve,zc:{align:"center"},Rb:N(120),jk:N(460,"round"),ik:{align:"center"},Wg:{align:"bottom",offset:N(20)},Sd:N(10,"round"),xi:N(510),Pf:N(10),Xg:N(130),Of:N(90),xl:800,yl:vc,Lo:600,Mo:nc,Ks:{},ox:{align:"center"},px:{align:"center",offset:N(40)},
So:N(460),Ro:N(300),nt:{},mx:{align:"center"},nx:{align:"center",offset:N(160)},lx:N(460),kx:N(200)},Gn:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,At:{align:"center"},Bt:N(152),em:N(560),ny:N(560),font:{align:"center",i:"middle",fontSize:O({big:52,small:26}),fillColor:"#FFFFFF"},Gu:{align:"center"},yq:N(600),xq:N(460),wq:"default_text"},Hn:{yq:N(520)}}}
var Wf={ix:"poki",rj:{Zv:!1,nn:[]},xe:{$k:"en-us",Yj:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},nq:{show:!1}},Xf=null;
function Yf(){Xf={ua:{vq:250,Eu:N(5),Gk:200,Hk:100,vn:1.3,ar:20,ev:N(300),br:700,iA:1E3,rl:100,ex:90,fx:-.05,kj:200,gx:100,hx:1.275},u:{Gk:250,dv:4,Hk:300,vn:2,wn:.75},Jc:{Wy:N({x:N(-99,"round"),y:N(26,"floor")}),gw:75,aa:[{x:0,y:0,scale:1},{x:-N(55,"round"),y:N(19,"floor"),scale:.6}],scale:1,size:N(10),x:N(275,"round"),y:N(500,"round")},Td:{Kc:{id:"canvasGame",depth:100,top:N(200,"round"),left:N(45,"round"),width:N(550,"round"),height:N(560,"round")}},lk:{Kc:{id:"canvasGame",depth:100,top:N(40,"round"),
left:N(302,"round"),width:N(550,"round"),height:N(560,"round")}},I:{wn:5},md:{Fu:!1,Mu:.75,scale:1,Lx:.5,wp:200,Ay:20},Xf:{Kk:"bubbletime",Yd:"endless"},l:{Ty:1.41},Fz:{Kk:"Bubbleshooter"},$d:{Uu:N(10),ur:0,lineWidth:N(5),MA:N(5)},Ja:{speed:N(1.5)},pj:{bubbles:[0,10,null,null,15,null,null,25,null,null,50,null,null,100,null,null,null,null,null,null,null],Nv:2,BB:500,CB:250,DB:100},my:{Hy:void 0,Iy:!1,zB:!1,Jx:!1},Wz:16,no:[{name:"level_1",n:{ub:1,Gb:10,bc:40,border:10,description:"Description of level",
speed:N(.004),jc:N(.002),ib:5,cb:5},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:0,Yb:0},ac:{Zb:100,fc:60,$b:0,u:0,I:0,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_2_Bomb",n:{ub:3,Gb:8,bc:50,border:10,description:"Description of level",speed:N(.0042),jc:N(.003),ib:4,cb:7},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:0,Yb:0},ac:{Zb:100,fc:40,$b:0,u:20,I:0,qa:0},nb:{u:7,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_2__",n:{ub:4,Gb:7,bc:50,border:10,
description:"Description of level",speed:N(.0042),jc:N(.0037),ib:4,cb:7},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:0,Yb:0},ac:{Zb:100,fc:40,$b:0,u:20,I:0,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_3_Green",n:{ub:5,Gb:6,bc:40,border:10,description:"Description of level",speed:N(.0042),jc:N(.0038),ib:3,cb:7},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:0,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},
{name:"level_3__",n:{ub:7,Gb:6,bc:40,border:10,description:"Description of level",speed:N(.0043),jc:N(.0039),ib:3,cb:7},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:0,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_4_Colorbomb",n:{ub:8,Gb:6,bc:40,border:10,description:"Description of level",speed:N(.0045),jc:N(.004),ib:3,cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:10,Yb:0},ac:{Zb:100,fc:60,$b:0,u:15,I:20,qa:0},nb:{u:10,I:7,
qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_4__",n:{ub:9,Gb:6,bc:40,border:10,description:"Description of level",speed:N(.0046),jc:N(.0042),ib:3,cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:0,green:10,Yb:0},ac:{Zb:100,fc:60,$b:0,u:15,I:15,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_5_Cyan",n:{ub:10,Gb:8,bc:30,border:10,description:"Description of level",speed:N(.0046),jc:N(.0042),ib:3,cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},
ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_5__",n:{ub:12,Gb:8,bc:35,border:10,description:"Description of level",speed:N(.0046),jc:N(.0042),ib:3,cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:0},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_6_Fireball",n:{ub:13,Gb:8,bc:40,border:10,description:"Description of level",speed:N(.0047),jc:N(.0043),ib:3,
cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:0,I:0,qa:20},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_6__",n:{ub:14,Gb:8,bc:35,border:10,description:"Description of level",speed:N(.0047),jc:N(.0043),ib:3,cb:8},dc:{gc:0,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_7_Pink",n:{ub:15,Gb:8,bc:35,border:10,description:"Description of level",
speed:N(.0048),jc:N(.0044),ib:3,cb:8},dc:{gc:10,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_7__",n:{ub:19,Gb:8,bc:35,border:10,description:"Description of level",speed:N(.0049),jc:N(.0045),ib:3,cb:8},dc:{gc:10,red:10,mc:10,blue:10,cc:10,green:10,Yb:0},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_8_Blocker",n:{ub:20,
Gb:8,bc:40,border:10,description:"Description of level",speed:N(.0049),jc:N(.0045),ib:2,cb:9},dc:{gc:10,red:10,mc:10,blue:10,cc:10,green:10,Yb:1},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}},{name:"level_9_30",n:{ub:30,Gb:7,bc:50,border:10,description:"Description of level",speed:N(.0059),jc:N(.0055),ib:1,cb:10},dc:{gc:10,red:10,mc:10,blue:10,cc:10,green:10,Yb:3},ac:{Zb:100,fc:40,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},
u:{ka:N(100)},U:{xc:3}},{name:"level_9_impossible",n:{ub:50,Gb:5,bc:50,border:10,description:"Description of level",speed:N(.008),jc:N(.007),ib:0,cb:12},dc:{gc:10,red:10,mc:10,blue:10,cc:10,green:10,Yb:5},ac:{Zb:100,fc:70,$b:0,u:15,I:15,qa:15},nb:{u:10,I:10,qa:10,all:10},I:{ka:N(100)},u:{ka:N(100)},U:{xc:3}}]}}var Zf=Zf||{};Zf.Mi={Lk:"e8a177cfa372c8112525c4fb87638ae9",Tl:"9f958fb192ccdc75f4c50f523eceb75bc7e3ce69"};Zf.st="en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr".split(" ");Zf.gf=!1;
var $f=null;
function ag(){$f={buttons:{bigPlay:"blue",default_color:"blue"},l:{Gz:"BubbleShooter"},za:{Rb:12,Pf:N(56),Gi:{J:Ze.J,fontSize:N(110),fillColor:"#001689",align:"center",i:"middle"},qn:{J:Ze.J,fontSize:N(38),fillColor:"#5560b3",align:"center",i:"middle"},Bk:N(166),ah:N(198),og:{J:Ze.J,fontSize:N(38),fillColor:"#001689",align:"center",i:"middle"},tj:{J:Ze.J,fontSize:N(38),fillColor:"#5560b3",align:"center",i:"middle"},of:N(298),Md:{J:Ze.J,fontSize:N(38),fillColor:"#5560b3",align:"center",i:"middle"},
fe:N(38),vd:N(164),Vc:N(58),Dn:N(441),Wm:N(501),fj:N(312)},fl:{eq:{J:Ze.J,fontSize:N(24),fillColor:"#001689",align:"center",i:"middle",Ib:N(6)},qi:N(366),gq:N(136),rr:{J:Ze.J,fontSize:N(48),fillColor:"#001689",align:"center",i:"middle"},Vi:N(366),tr:N(72)},yc:{si:500},options:{Rb:N(12,"round"),ok:N(502),pk:N(402),rk:N(240),Ml:{J:Ze.J,fontSize:N(26),fillColor:"#001689",align:"center",i:"middle"},Md:{J:Ze.J,fontSize:N(38),fillColor:"#5560b3",align:"center",i:"middle"},fe:N(38),vd:N(164),Vc:N(58),Me:N(48,
"round"),rm:{align:"center",i:"top",fontSize:N(24,"round"),fillColor:"#001689"},sm:N(156,"round"),tm:N(372,"round"),um:{J:W.J,fontSize:N(36),fillColor:"#5560b3",align:"center",i:"middle"},wm:N(96,"round"),pm:N(484,"round"),qm:N(484,"round"),Wg:{align:"center",offset:N(12)},Lg:N(80),ji:N(104),Ng:N(348),Kg:N(452),Vj:N(560)}}}M.j=M.j||{};M.j.tv=function(){var a=M.Ux;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};M.j.Uk=function(){M.e.fd()};M.j.Tz=function(){};
M.j.il=function(){};M.j.Vk=function(){M.e.fd()};M.j.Qz=function(){};M.j.Pz=function(){};M.j.Sz=function(){};M.j.Dr=function(){};M.j.Iv=function(){};M.j.Cr=function(){};M.j.Rz=function(){};M.j.vv=function(){M.e.fd()};M.j.wv=function(){M.e.fd()};M.j.jh=function(){M.e.fd()};M.j.uv=function(){M.e.fd()};M.j.lr=function(a,b){void 0===M.e.Ae&&(M.e.Ae=new bg(!0));return cg(a,b)};M.j.yp=function(a){void 0===M.e.Ae&&(M.e.Ae=new bg(!0));return dg(a)};M.j.Fd=function(a){window.open(a)};
M.j.Ri=function(){return[{b:td,url:M.A.yr}]};M.j.Jv=function(){};M.Qd=M.Qd||{};M.Qd.Uk=function(){M.e.Ej=!1};M.Qd.il=function(){};M.Qd.Vk=function(){M.e.Ej=!1};M.Qd.jh=function(){M.e.Ej=!1};function eg(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function fg(a,b,c,d){this.jm=this.dh=a;this.Nu=b;this.duration=1;this.Cq=d;this.We=c;this.kk=null;this.vb=0}function gg(a,b){a.vb+=b;a.vb>a.duration&&a.kk&&(a.kk(),a.kk=null)}
fg.prototype.L=function(){if(this.vb>=this.duration)return this.We(this.duration,this.dh,this.jm-this.dh,this.duration);var a=this.We(this.vb,this.dh,this.jm-this.dh,this.duration);this.Cq&&(a=this.Cq(a));return a};function hg(a,b){a.dh=a.L();a.jm=b;a.duration=a.Nu;a.kk=void 0;a.vb=0}M.$u=void 0!==M.environment?M.environment:"development";M.Jy=void 0!==M.ga?M.ga:M.$u;"undefined"!==typeof M.mediaUrl?ja(M.mediaUrl):ja(M.size);M.wu="backButton";M.af="languageSet";M.lf="resizeEvent";
M.version={builder:"1.8.3.0","build-time":"16:15:39","build-date":"16-06-2020",audio:G.rb?"web audio api":G.eb?"html5 audio":"no audio"};M.Vy=new function(){this.Ze=this.hw=3;da.r.Eh&&(this.Ze=3>da.$a.Ne?1:4.4>da.$a.Ne?2:3);da.$a.cl&&(this.Ze=7>da.$a.Ne?2:3);da.$a.Fp&&(this.Ze=8>da.$a.Ne?2:3);M.version.browser_name=da.name;M.version.browser_version=da.r.version;M.version.os_version=da.$a.version;M.version.browser_grade=this.Ze};M.a={};"function"===typeof Vf&&Vf();"function"===typeof Yf&&Yf();
"function"===typeof ag&&ag();"function"===typeof initGameThemeSettings&&initGameThemeSettings();M.a.w="undefined"!==typeof Uf?Uf:{};M.a.l="undefined"!==typeof Xf?Xf:{};M.a.W="undefined"!==typeof $f?$f:{};M.a.Hz="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};M.th=window.publisherSettings;M.A="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof Wf&&(M.A=Wf);if("undefined"!==typeof Zf)for(var ig in Zf)M.A[ig]=Zf[ig];
(function(){var a,b,c,d,f;M.k={};M.k.Tp="undefined"!==typeof P?P:{};M.k.xb=void 0!==M.A.xe&&void 0!==M.A.xe.Yj?M.A.xe.Yj:M.a.w.xe.Yj;f=[];for(b=0;b<M.k.xb.length;b++)f.push(M.k.xb[b]);if(M.A.st)for(b=M.k.xb.length-1;0<=b;b--)0>M.A.st.indexOf(M.k.xb[b])&&M.k.xb.splice(b,1);try{if(d=function(){var a,b,c,d,f;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,f=a.length;d<f;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=M.k.xb.length-1;0<=
b;b--)0>c.indexOf(M.k.xb[b])&&M.k.xb.splice(b,1)}catch(h){}0===M.k.xb.length&&(0<f.length?M.k.xb=f:M.k.xb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){f=c[b].toLowerCase();for(d=0;d<M.k.xb.length;d++)if(0<=M.k.xb[d].search(f)){a=M.k.xb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==M.A.xe&&void 0!==M.A.xe.$k?M.A.xe.$k:M.a.w.xe.$k);M.k.Gm=0<=M.k.xb.indexOf(a)?a:M.k.xb[0];M.k.Mj=M.k.Tp[M.k.Gm];
if(void 0!==M.a.w.qc.language_toggle&&void 0!==M.a.w.qc.language_toggle.ca){a=M.a.w.qc.language_toggle.ca;c=[];for(b=0;b<a.length;b++)0<=M.k.xb.indexOf(a[b].id)&&c.push(a[b]);M.a.w.qc.language_toggle.ca=c}M.k.K=function(a,b){var c,d,f,h;if(void 0!==M.k.Mj&&void 0!==M.k.Mj[a]){c=M.k.Mj[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)f=(f=da.Tf.vt||da.Tf.qs)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],f=f.substring(1,f.length-1),c=c.replace(d[h],f);return c}return b};M.k.Rs=function(a){M.k.Gm=
a;M.k.Mj=M.k.Tp[a];oa(M.af,a)};M.k.Rk=function(){return M.k.Gm};M.k.nv=function(){return M.k.xb};M.k.Lv=function(a){return 0<=M.k.xb.indexOf(a)}})();M.Su={$a:"",Tw:"",EA:"",kn:""};M.d={};
M.d.createEvent=function(a,b){var c,d,f,h;d=b.detail||{};f=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:f,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,f,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,f,h),c.data=d}return c};M.d.up=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
M.d.Zi=function(a){function b(){}b.prototype=jg.prototype;a.prototype=new b};M.d.Bx=function(a,b,c,d,f,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=f;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));M.Td.push(l);return l};
(function(){var a,b,c,d,f,h,k;M.Lr=0;M.Mr=0;M.Sl=!1;M.By=da.r.Eh&&da.r.Ne&&4<=da.r.Ne;M.Fj=!1;M.Wt=da.Tf.vt||da.Tf.qs;M.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===M.orientation?M.a.w.lk:M.a.w.Td;h="landscape"===M.orientation?M.a.l.lk:M.a.l.Td;if(void 0!==h){if(void 0!==h.Kc)for(a in h.Kc)k.Kc[a]=h.Kc[a];if(void 0!==h.dd)for(a in h.dd)k.dd[a]=h.dd[a]}b=function(){var a,b,c,d;if(M.By&&!M.Fj){M.Fj=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){M.Fj=!1;return}b=document.createEvent("Event");b.JA=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var f=c.getContext("2d");try{var h=f.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}f.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(f){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);M.Fj=!1},100)}};c=function(){var a,c,d,f,h,D,s,t,v;"landscape"===M.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.$g,k.gd],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.gd,k.rc],d=k.minHeight);f=c[0]/c[1];h=a[0]/a[1];D=d/c[1];h<f?(h=h<D?Math.floor(a[0]/D):a[1],f=a[0]):(h=a[1],f=Math.floor(a[1]*f));s=h/c[1];!M.Wt&&1<s&&(f=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),s=1);a="landscape"===M.orientation?f:h;c="landscape"===M.orientation?h:f;v=t=0;window.innerHeight<Math.floor(k.gd*s)&&(t=Math.max(k.ol,window.innerHeight-Math.floor(k.gd*s)));window.innerWidth<Math.floor(k.rc*s)&&(v=Math.floor(Math.max(k.$g-k.rc,(window.innerWidth-Math.floor(k.rc*s))/s)),window.innerWidth<Math.floor(k.rc*s)+v*s&&(v+=Math.floor(Math.max((d-k.$g)/2,(window.innerWidth-(k.rc*s+v*s))/2/s))));M.lq=k.gd-k.Kq;M.Au=k.rc-k.$g;M.va=t;M.az=v;M.$y=Math.min(M.Au,-1*M.bz);M.Ye=(k.dd.top||
k.Rf)-M.va;M.ha={top:-1*t,left:-1*v,height:Math.min(k.gd,Math.round(Math.min(c,window.innerHeight)/s)),width:Math.min(k.rc,Math.round(Math.min(a,window.innerWidth)/s))};M.dB="landscape"===M.orientation?{top:0,left:Math.floor((k.$g-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.ol),left:k.Qf,width:k.rc,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===M.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var f,h,l,n;f=void 0!==b.top?b.top:k.Rf;h=void 0!==b.left?b.left:k.Qf;l=void 0!==b.width?b.width:k.rc;n=void 0!==b.height?b.height:k.gd;a.pz=Math.floor(s*f);a.oz=Math.floor(s*h);a.qz=Math.floor(s*l);a.nz=Math.floor(s*
n);!1!==c&&(f+=t);!1!==d&&(h+=v);a.setAttribute("style","position:absolute; left:"+Math.floor(s*h)+"px; top:"+Math.floor(s*f)+"px; width:"+Math.floor(s*l)+"px; height:"+Math.floor(s*n)+"px; z-index: "+b.depth)};d(M.Xm,k.cn);d(M.Fn,k.Kc);d(M.Pn,k.dd,!1,!0);d(M.ae,k.Mf);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);oa(M.lf)};a=function(){if(M.Lr===window.innerHeight&&M.Mr===window.innerWidth||M.Sl)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;f=40;M.Sl=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,da.r.Eh?1:0);f--;if((da.r.Eh?0:window.innerHeight>d)||0>f)M.Mr=window.innerWidth,M.Lr=window.innerHeight,clearInterval(M.Sl),M.Sl=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};M.Cd=k.Kc.left||k.Qf;M.Dd=k.Kc.top||k.Rf;M.tc=k.Kc.width||k.rc;M.Ni=k.Kc.height||k.gd;M.$f=k.dd.left||k.Qf;M.Ye=k.dd.top||k.Rf;M.Jz=k.dd.width||k.rc;
M.Iz=k.dd.height||k.gd;M.cw=k.Mf.left||k.Qf;M.dw=k.Mf.top||k.Rf;M.ew=k.Mf.width||k.rc;M.bw=k.Mf.height||k.gd;h=function(a){return M.d.Bx(a.id,a.depth,void 0!==a.top?a.top:k.Rf,void 0!==a.left?a.left:k.Qf,void 0!==a.width?a.width:k.rc,void 0!==a.height?a.height:k.gd)};M.Td=[];M.Xm=h(k.cn);M.Fn=h(k.Kc);M.Pn=h(k.dd);M.ae=h(k.Mf);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);M.Rc={};M.Rc[M.Zf]=M.Xm;M.Rc[M.Xe]=M.Fn;M.Rc[M.Pk]=M.Pn;M.Rc[M.eh]=M.ae;M.Rc[M.Yf]=M.Xm;M.Rc[M.Fc]=M.ae;M.Rc[M.ue]=M.ae})();
M.d.qu=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ka.Qe+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),M.Cu=!0,M.ti=!0,b=function(a){M.Cu&&M.ti&&(M.j.Fd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){M.ti&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){M.ti&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};M.d.yB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";M.ti=!0}};
M.d.Oz=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";M.ti=!1}};M.d.Rn=function(a){return a===M.Fn?{x:M.Cd,y:M.Dd}:a===M.Pn?{x:M.$f,y:M.Ye}:{x:M.cw,y:M.dw}};M.d.ag=function(a){return M.Rc[a]};M.d.sa=function(a){return M.Rc[a]?(m.canvas!==M.Rc[a]&&m.sa(M.Rc[a]),!0):!1};M.d.Na=function(a,b){if(M.Rc[b]){var c=I;a.Ua!==b&&(c.fi=!0);a.Ua=b;a.canvas=M.Rc[b]}};
M.d.g=function(a,b,c,d){var f;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(f=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+f;case "left":case "top":return f-d;case "right":case "bottom":return b-c-f-d;default:return f+0}return 0};
M.d.Ga=function(a,b,c,d){var f;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(f=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+f:"left"===d||"top"===d?Math.round(b/2-c/2)+f:Math.round(b/2+c/2)-f;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+f:"left"===d||"top"===d?f:c+f;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-f:"left"===d||"top"===d?b-Math.round(c/2)-f:b-f;default:return f+
0}return 0};M.d.hz=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};M.na=M.na||{};M.na.Ex=!1;M.na.Gr=function(a){a instanceof Array&&(this.Lk=a[0],this.Tl=a[1],this.Du="https://api.gameanalytics.com/v2/"+this.Lk,this.Hr=!0)};
M.na.Af=function(a,b){var c,d=JSON.stringify(b),f=window.Crypto.HmacSHA256(d,this.Tl),f=window.Crypto.enc.Base64.stringify(f),h=this.Du+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.Ex&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",f),c.send(d)}catch(k){}};
M.na.Gc={Np:"user",Mp:"session_end",eu:"business",fu:"resource",Gj:"progression",Am:"design",ERROR:"error"};M.na.wf=function(){return{user_id:this.Dp,session_id:this.Ax,build:this.Iu,device:this.kn,platform:this.platform,os_version:this.Uw,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
M.na.wc=function(a,b,c,d,f,h,k){this.Ax=a;h&&"object"===typeof h&&(this.Dp=h.Dp);this.Iu=f;this.h=!0;this.Hr&&(this.kn=k.kn,this.platform=k.$a,this.Uw=k.Tw);this.Af("init",this.wf())};M.na.Zx=function(a){var b=this.wf(),c=[];b.category=a;c.push(b);this.Af("events",c)};M.na.sn=function(a,b,c,d){a=[];b=this.wf();b.length=Math.floor(c);b.category=d;a.push(b);this.Af("events",a)};
M.na.jb=function(a,b,c,d){var f=[],h=!1;if(this.h&&this.Hr){if(d)switch(d){case M.na.Gc.Np:this.Zx(d);h=!0;break;case M.na.Gc.Mp:this.sn(0,0,c,d);h=!0;break;case M.na.Gc.eu:h=!0;break;case M.na.Gc.fu:h=!0;break;case M.na.Gc.Gj:this.cv(a,b,c,d);h=!0;break;case M.na.Gc.Am:this.av(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.wf(),b.event_id=d+":"+a,b.value=c,f.push(b),this.Af("design",f))}};M.na.cB=function(a,b,c){this.jb(a,b,c)};M.na.Bz=function(){};
M.na.Cz=function(){};M.na.cv=function(a,b,c,d){var f=[],h=this.wf();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}f.push(h);this.Af("events",f)};M.na.av=function(a,b,c,d){var f=[],h=this.wf();h.category=d;h.event_id=a+b;h.value=c;f.push(h);this.Af("events",f)};M.na.Ls=function(a,b){var c=[],d=this.wf();d.category="error";d.message=a;d.severity=b;c.push(d);this.Af("events",c)};
function kg(){this.Ua=this.depth=0;this.visible=!1;this.h=!0;this.a=M.a.w.Oa;this.dx=this.a.ty;J(this);Sb(this,"system")}function lg(){var a=mg("userId","");""===a&&(a=ng(),og("userId",a));return a}function ng(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=kg.prototype;e.start=function(a){M.na.Gr(a);M.na.wc(ng(),M.a.l.Xf.Kk,M.a.W.id,M.A.ix,pg(),{Dp:lg()},M.Su)};e.jb=function(a,b,c,d){M.na.jb(a,b,c,d)};
function qg(a,b,c,d){var f,h;for(f=0;f<a.la.length;f++)void 0!==a.la[f]&&a.la[f].tag===b&&(h=a.la[f],a.jb(c,d,h.m/1E3,M.na.Gc.Mp),h.h=!1)}function rg(){var a=M.Oa,b=M.e.xg,c;for(c=0;c<a.la.length;c++)void 0!==a.la[c]&&a.la[c].tag===b&&(a.la[c].paused+=1)}e.Ls=function(a,b){M.na.Ls(a,b)};e.ec=function(){this.la=[]};
e.ba=function(a){var b,c=0;for(b=0;b<this.la.length;b++)this.la[b].h&&(0===this.la[b].paused&&(this.la[b].m+=a),c=b);c<this.la.length-1&&(a=this.la.length-Math.max(this.dx,c+1),0<a&&this.la.splice(this.la.length-a,a))};
function bg(a,b,c){this.gs=a||!1;this.host=b||"http://localhost:8080";this.zx=c||this.host+"/services/storage/gamestate";this.qt="undefined"!==typeof window.localStorage;this.io=this.Bp=!1;var d=this;window.parent!==window&&(da.r.Yo||da.$a.cl)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.Bp="ok"===a.result:"getItem"===b&&d.Qk&&("ok"===a.result?d.Qk(a.value):d.Qk(a.defaultValue))},!1),this.Qk=null,window.parent.postMessage({command:"init"},"*"));this.gj=[];
window.setTimeout(function(){d.io=!0;for(var a=0;a<d.gj.length;++a)d.gj[a]();d.gj=[]},2E3)}function sg(){return"string"===typeof M.A.mt&&""!==M.A.mt?M.A.mt:void 0!==M.a.l.Xf&&void 0!==M.a.l.Xf.Kk?M.a.l.Xf.Kk:"0"}function cg(a,b){var c=M.e.Ae;"function"===typeof b&&(c.io?tg(c,a,b):c.gj.push(function(){tg(c,a,b)}))}function dg(a){var b=M.e.Ae;b.io?ug(b,a):b.gj.push(function(){ug(b,a)})}
function ug(a,b){var c=null,d=sg();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(f){}if(a.Bp)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.qt)try{window.localStorage.setItem(d,c)}catch(h){}a.gs||(c=new ub("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),vb(c,a.zx+"/my_ip/"+d))}}
function tg(a,b,c){var d=null,f=null,h=sg();if(a.Bp)a.Qk=function(a){var f;try{d=JSON.parse(a),f=JSON.parse(d.gameState)}catch(h){f=b}c(f)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.qt)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.gs||(a=new ub("gameState_"+h),f=null,wb(a,bg.ZA+"/my_ip/"+h)&&(f=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(f&&Date.parse(f.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(f.gameState));return}c(JSON.parse(d.gameState));
return}if(f){c(JSON.parse(f.gameState));return}}catch(l){c(b);return}c(b)}}
function vg(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.nd=this.visible=!1!==c;this.h=!0;M.d.Na(this,M.Fc);var d;this.a=M.a.w.Ed;if("landscape"===M.orientation&&M.a.w.qo)for(d in M.a.w.qo)this.a[d]=M.a.w.qo[d];for(d in M.a.W.Ed)this.a[d]=M.a.W.Ed[d];if(M.A.Ed)for(d in M.A.Ed)this.a[d]=M.A.Ed[d];this.Fb=a;this.Aq=b;this.Pq=!1;this.ri=0;this.Ym=!1;this.$j=0;this.si=
this.a.zu;this.To=!0;this.Yv=.6/Math.log(this.a.kl+1);this.cu=void 0!==M.A.Xv?M.A.Xv:this.a.Cw;this.iw=this.cu+this.a.lw;J(this)}e=vg.prototype;e.dp=function(a){var b;M.d.sa(M.Yf);sa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=W.S();(M.A.Ed&&M.A.Ed.wj||this.a.wj)&&A(b,M.A.Ed&&M.A.Ed.wj?M.A.Ed.wj:this.a.wj);a=M.k.K(a,"<"+a.toUpperCase()+">");b.p(a,this.canvas.width/2,this.canvas.height/2,this.a.em);this.error=!0;this.visible=this.nd=!1;this.canvas.$=!0};
e.Be=function(){this.Aa&&(this.Ob=M.d.g(this.a.Ob,M.ha.width,this.Aa.width)+M.ha.left,this.Tc=M.d.g(this.a.Tc,M.ha.height,this.Aa.height)+M.ha.top)};
e.hn=function(){var a,b,c,d,f,h;if("function"===typeof M.j.Ri&&(h=this.a.ig,(this.Ma=M.j.Ri())&&0<this.Ma.length)){this.Aa?this.Aa.clear():this.Aa=new r(this.a.ig,this.a.dj);w(this.Aa);h/=this.Ma.length;for(c=0;c<this.Ma.length;c++)try{f=this.Ma[c].b,d=Math.min(1,Math.min((h-20)/f.width,this.a.dj/f.height)),a="center"===this.a.bj?h*c+Math.round((h-f.width*d)/2):h*c+Math.round(h-f.width*d)-10,b=this.Aa.height-f.height*d,f instanceof p?f.V(0,a,b,d,d,0,1):m.context.drawImage(f,a,b,f.width*d,f.height*
d)}catch(k){}y(this.Aa);this.jl=0;this.so=!0;this.cj=0;this.hg=Yb(0,0,this.Aa.width,this.Aa.height);this.Be()}};
e.Ta=function(){var a,b,c,d;this.To?m.clear():M.d.sa(M.Yf);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(M.va),1<d.G){c=(m.canvas.height-a)/d.Yg;b=-(d.yi*c-m.canvas.width)/2;c=m.context;var f=c.globalAlpha,h,k,l;c.globalAlpha=this.ri;for(h=0;h<d.G;h+=1)k=b+h%d.qh*d.width,l=a+d.height*Math.floor(h/d.qh),d.Ke.Ha(d.rf[h],d.sf[h],d.tf[h],d.Ge[h],d.Fe[h],k-d.fb+d.He[h],l-d.Ca+d.Ie[h]);c.globalAlpha=f}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof p?d.V(0,b,a,c,c,0,this.ri):d instanceof r&&d.V(b,a,c,c,0,this.ri);d=this.a.cf+this.a.oo+this.a.mh;b=Hc.height;a=Hc.width-(this.a.cf+this.a.oo);this.nh=M.d.g(this.a.nh,m.canvas.width,d);this.gg=M.d.g(this.a.gg,m.canvas.height,b);Hc.Ha(0,0,0,this.a.cf,b,this.nh,this.gg,1);Hc.zk(0,this.a.cf,0,a,b,this.nh+this.a.cf,this.gg,this.a.mh,b,1);Hc.Ha(0,this.a.cf+a,0,this.a.oo,b,this.nh+this.a.cf+this.a.mh,this.gg,1)};
function wg(a){a.To&&(a.Ym=!0);a.visible&&(a.Ta(),a.hn(),"function"===typeof M.j.Tn&&(a.Ee=M.j.Tn(),a.Ee instanceof r&&(a.zh=!0,a.Ys=Math.floor((a.canvas.width-a.Ee.width)/2),a.Zs=Math.floor((a.canvas.height-a.Ee.height)/2))));M.e.hl&&ka.ce("audio");M.e.gl&&ka.ce("audio_music");ka.ce("fonts")}
e.ec=function(){var a,b=!1;if(void 0!==M.A.rj)if(!1===M.A.rj.Zv)b=!0;else{if(void 0!==M.A.rj.nn)for(a=0;a<M.A.rj.nn.length;a++){var c;a:{c=M.A.rj.nn[a];var d=void 0,f=void 0,h=d=void 0,f=void 0,f=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===f.indexOf("file://")&&c===xg("file://"))c=!0;else{f=f.split(".");d=f.shift().split("://");d[0]+="://";f=d.concat(f);h="";for(d=f.length-1;0<=d;d--)if(h=f[d]+(0<d&&d<f.length-1?".":"")+h,xg(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof M.A.ry&&(new Date).getTime()>M.A.ry&&(b=!1);b?(this.Vg=[],this.error=!1,this.Dt=this.Bn=this.Wj=this.m=0,this.ready=this.zh=!1,this.Vv=void 0!==this.a.es?this.a.es:this.a.cf-this.a.aj,this.Wv=void 0!==this.a.fs?this.a.fs:Math.floor((Hc.height-Ce.height)/2),this.po=Ce.width-(this.a.aj+this.a.ds),this.An=this.ss=this.hq=!1,(this.sj=ka.complete("start"))&&wg(this),this.cs=ka.complete("load"),this.visible&&(this.Et=document.getElementById("throbber_image"),
this.Le=this.a.Le,this.tp=M.d.g(this.a.tp,this.canvas.width,this.Le),this.fm=M.d.g(this.a.fm,this.canvas.height,this.Le))):I.pause()};
e.ba=function(a){this.m+=a;"function"===typeof M.j.Tn&&void 0===this.Ee&&(this.Ee=M.j.Tn(),this.Ee instanceof r&&(this.zh=!0,this.Ys=Math.floor((this.canvas.width-this.Ee.width)/2),this.Zs=Math.floor((this.canvas.height-this.Ee.height)/2)));this.zh&&0<=this.a.$s&&this.m>=this.a.$s&&(this.zh=!1);this.Ym&&(this.$j+=a,this.$j>=this.si?(this.Ym=!1,this.ri=1):this.ri=nc(this.$j,0,1,this.si));this.sj&&(this.Wj+=a,this.Bn+=a);this.Dt=Math.round(this.m/this.a.py%(this.a.qy-1));this.so&&(this.jl=0+this.cj/
this.a.ro*1,this.cj+=a,this.cj>=this.a.ro&&(this.so=!1,this.jl=1));"function"===typeof this.Aq&&this.Aq(Math.round((la("load")+la("audio")+la("audio_music"))/2));!this.ready&&this.cs&&(this.An||this.Bn>=this.a.kl)&&(!M.e.hl||this.hq||G.eb&&this.Wj>=this.a.kl)&&(!M.e.gl||this.ss||G.eb&&this.Wj>=this.a.kl)&&(this.ready=!0);if(a=!this.Pq&&!this.error&&this.ready&&this.m>=this.cu)a=M.e,a=(a.zd&&a.Xb&&!a.Xb.Kv()?!1:!0)||this.m>=this.iw;a&&(this.Pq=!0,this.Fb())};
e.gh=function(a,b,c){!this.zh&&this.hg&&ec(this.hg,this.Ob,this.Tc,b,c)&&(this.Bb=Math.floor((b-this.Ob)/(this.Aa.width/this.Ma.length)))};e.hh=function(a,b,c){void 0!==this.Bb&&(this.Ma[this.Bb].url||this.Ma[this.Bb].action)&&ec(this.hg,this.Ob,this.Tc,b,c)&&(b-=this.Ob,b>=this.Aa.width/this.Ma.length*this.Bb&&b<this.Aa.width/this.Ma.length*(this.Bb+1)&&(this.Ma[this.Bb].url?M.j.Fd(this.Ma[this.Bb].url):this.Ma[this.Bb].action()));this.Bb=void 0};
e.Pc=function(a,b){"Load Complete"===a&&"start"===b.ab?(this.sj=!0,wg(this)):"Load Complete"===a&&"load"===b.ab?this.cs=!0:"Load Complete"===a&&"audio"===b.ab?this.hq=!0:"Load Complete"===a&&"audio_music"===b.ab?this.ss=!0:"Load Complete"===a&&"fonts"===b.ab&&(this.An=!0);a===M.lf&&this.Be()};
e.ya=function(){if(!this.error){this.To&&this.sj?this.Ta():m.clear();try{this.Et&&m.context.drawImage(this.Et,this.Le*this.Dt,0,this.Le,this.Le,this.tp,this.fm,this.Le,this.Le)}catch(a){}if(this.sj){var b=0,c=this.nh+this.Vv,d=this.gg+this.Wv,f=Ce.height;Ce.Ha(0,b,0,this.a.aj,f,c,d,1);b+=this.a.aj;c+=this.a.aj;this.ready?(Ce.zk(0,b,0,this.po,f,c,d,this.a.mh,f,1),b+=this.po,c+=this.a.mh,Ce.Ha(0,b,0,this.a.ds,f,c,d,1)):Ce.zk(0,b,0,this.po,f,c,d,Math.floor(Math.min((la("load")+la("audio"))/500+this.Yv*
Math.log(this.m+1),1)*this.a.mh),f,1);this.Aa&&this.Aa.hd(this.Ob,this.Tc,this.jl)}this.zh&&this.Ee.p(this.Ys,this.Zs)}};
function yg(){var a,b;b=this;this.depth=100;this.h=this.visible=!0;M.d.Na(this,M.Fc);this.a=M.a.w.mp;if("landscape"===M.orientation&&M.a.w.np)for(a in M.a.w.np)this.a[a]=M.a.w.np[a];this.qc=M.a.w.qc;if("landscape"===M.orientation&&M.a.w.bn)for(a in M.a.w.bn)this.qc[a]=M.a.w.bn[a];for(a in M.a.W.mp)this.a[a]=M.a.W.mp[a];this.Vg=[];a=zg(M.e);this.Bq=void 0!==a&&null!==a;this.Xa=new fc;this.Xa.Y(this.a.hv,function(){b.ht.call(b)});this.Xa.Y(this.a.vs,function(){b.jt.call(b)});this.Xa.Y(M.o.Wl&&!this.Bq?
this.a.Zw:this.a.vs,function(){b.kt.call(b)});this.Xa.Y(this.a.xw,function(){b.it.call(b)});J(this,!1)}e=yg.prototype;e.ht=function(){this.Nk=!0;this.a.fh&&(this.Pi=M.d.g(this.a.Pi,this.canvas.width,Xd.width),this.Mk=M.d.g(this.a.Mk,this.canvas.width,Xd.width),this.Qi=M.d.g(this.a.Qi,this.canvas.height,Xd.height),this.Oi=M.d.g(this.a.Oi,this.canvas.height,Xd.height),this.On=this.Pi,this.Ok=this.Qi,this.Jn=this.a.Mn,this.Kn=this.a.Nn,this.In=this.a.Ln,this.Nc=0,this.Be())};
e.jt=function(a){function b(a,b,c,d){return tc(a,b,c,d,3,15)}var c,d;M.o.Wl&&!this.Bq&&(c=M.d.g(this.a.Oq,this.canvas.width,this.a.Ei,Math.floor(this.a.Ei/2)),d=M.d.g(this.a.xk,this.canvas.height,pe.height,Math.floor(pe.height/2)),c=new Ag("difficulty_toggle",c,d,this.depth-20,Bg()+"",this.a.Ei,{fa:function(a){Cg(parseInt(a,10));return!0},vc:!0}),c.Gd=Math.floor(this.a.Ei/2),c.Hd=Math.floor(pe.height/2),!1!==a&&(Dg(c,"xScale",b,0,1,this.a.Nq),Dg(c,"yScale",b,0,1,this.a.Nq)),this.wk=c,this.xk=c.y,
this.Vg.push(c),this.Be())};
e.kt=function(a){function b(a,b,c,d){return tc(a,b,c,d,3,15)}var c,d=this;this.Qo=!0;c=new Eg("bigPlay",M.d.g(this.a.Yw,this.canvas.width,this.a.ij,Math.floor(this.a.ij/2)),M.d.g(this.a.Gl,this.canvas.height,ue.height,Math.floor(ue.height/2)),this.depth-20,"startScreenPlay",this.a.ij,{fa:function(){K(I,d);var a=M.e,b,c,l;void 0===M.e.yc&&(void 0!==M.a.W.yc&&(void 0!==M.a.W.yc.Bu&&(b=M.a.W.yc.Bu),void 0!==M.a.W.yc.jq&&(G.be("music",M.a.W.yc.jq),a.gf()||qb("music"),M.e.Lw=M.a.W.yc.jq),c=void 0!==M.a.W.yc.yu?
M.a.W.yc.yu:0,l=void 0!==M.a.W.yc.si?M.a.W.yc.si:0),void 0===b&&"undefined"!==typeof a_music&&(b=a_music),void 0!==b&&(M.e.yc=G.play(b,c,l),M.e.yc&&(G.bq(M.e.yc,"music"),G.Ss(M.e.yc,!0))));M.o.xh&&!a.zd?a.screen=new Fg:Gg(a,0);return!0},vc:!0});c.Gd=Math.floor(this.a.ij/2);c.Hd=Math.floor(ue.height/2);!1!==a?(Dg(c,"xScale",b,0,1,this.a.El),Dg(c,"yScale",b,0,1,this.a.El),this.Fl=0):this.Fl=this.a.El;this.Dl=c;this.Gl=c.y;this.Vg.push(c);this.Be()};
function Hg(a){var b=yc([vc,function(a,b,f,h){return tc(a,b,f,h,3,2)},kc],[!0,!1,!1],[.02,.1,.88]);a.Es=!0;Dg(a.Dl,"xScale",wc(b),1,.25,4E3);Dg(a.Dl,"yScale",wc(b),1,-.1,4E3)}e.it=function(a){var b;this.os=!0;b=new jg(M.d.g(this.a.Ao,this.canvas.width,le.width),M.d.g(this.a.nl,this.canvas.height,le.height),this.depth-20,new $b(le),[le],{fa:M.e.De,vc:!0});!1!==a&&Dg(b,"alpha",L,0,1,this.a.ww);this.zo=b;this.nl=b.y;this.Vg.push(b);this.Be()};
e.Ta=function(){var a,b,c,d;if(a=this.a.backgroundImage)M.d.sa(M.Yf),c=Math.abs(M.va),1<a.G?(b=(m.canvas.height-c)/a.Yg,d=-(a.yi*b-m.canvas.width)/2,wa(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.V(0,d,c,b,b,0,1))};
e.hn=function(){var a,b,c,d,f,h;if("function"===typeof M.j.Ri&&(h=this.a.ig,(this.Ma=M.j.Ri())&&0<this.Ma.length)){this.Aa?this.Aa.clear():this.Aa=new r(this.a.ig,this.a.dj);w(this.Aa);h/=this.Ma.length;for(c in this.Ma)try{f=this.Ma[c].b,d=Math.min(1,Math.min((h-20)/f.width,this.a.dj/f.height)),a="center"===this.a.bj?h*c+Math.round((h-f.width*d)/2):h*c+Math.round(h-f.width*d)-10,b=this.Aa.height-f.height*d,f instanceof p?f.V(0,a,b,d,d,0,1):m.context.drawImage(f,a,b,f.width*d,f.height*d)}catch(k){}y(this.Aa);
this.jl=0;this.so=!0;this.cj=0;this.hg=Yb(0,0,this.Aa.width,this.Aa.height);this.Be()}};e.Be=function(){var a;a=0;M.ha.height<this.a.$m&&(a=this.a.$m-M.ha.height);this.Qo&&(this.Dl.y=this.Gl-a);this.os&&(this.zo.y=this.nl-a,this.zo.x=M.d.g(this.a.Ao,M.ha.width,le.width)+M.ha.left);this.wk&&(this.wk.y=this.xk-a);this.Nk&&this.Nc>=this.a.Bd&&(this.Ok=this.Oi-M.va);this.Aa&&(this.Ob=M.d.g(this.a.Ob,M.ha.width,this.Aa.width)+M.ha.left,this.Tc=M.d.g(this.a.Tc,M.ha.height,this.Aa.height)+M.ha.top)};
e.ec=function(){this.Ta();this.a.fh&&(M.d.sa(M.Fc),this.a.fh.p(0,0,-this.a.fh.height-10));this.hn();this.Xa.start()};e.tb=function(){var a;for(a=0;a<this.Vg.length;a++)K(I,this.Vg[a])};
e.ba=function(a){this.canvas.$=!0;this.Nk&&this.Nc<this.a.Bd&&(this.On=this.a.lv(this.Nc,this.Pi,this.Mk-this.Pi,this.a.Bd),this.Ok=this.a.mv(this.Nc,this.Qi,this.Oi-this.Qi,this.a.Bd)-M.va,this.Jn=this.a.jv(this.Nc,this.a.Mn,this.a.jr-this.a.Mn,this.a.Bd),this.Kn=this.a.kv(this.Nc,this.a.Nn,this.a.kr-this.a.Nn,this.a.Bd),this.In=this.a.iv(this.Nc,this.a.Ln,this.a.ir-this.a.Ln,this.a.Bd),this.Nc+=a,this.Nc>=this.a.Bd&&(this.On=this.Mk,this.Ok=this.Oi-M.va,this.Jn=this.a.jr,this.Kn=this.a.kr,this.In=
this.a.ir));this.Qo&&(!this.Es&&this.Fl>=this.a.El+this.a.Xw&&Hg(this),this.Fl+=a)};e.gh=function(a,b,c){this.hg&&ec(this.hg,this.Ob,this.Tc,b,c)&&(this.Bb=Math.floor((b-this.Ob)/(this.Aa.width/this.Ma.length)))};
e.hh=function(a,b,c){void 0!==this.Bb&&(this.Ma[this.Bb].url||this.Ma[this.Bb].action)&&ec(this.hg,this.Ob,this.Tc,b,c)&&(b-=this.Ob,b>=this.Aa.width/this.Ma.length*this.Bb&&b<this.Aa.width/this.Ma.length*(this.Bb+1)&&(this.Ma[this.Bb].url?M.j.Fd(this.Ma[this.Bb].url):this.Ma[this.Bb].action()));this.Bb=void 0};e.Mb=function(){this.zb=!0};
e.Nb=function(){this.zb&&(this.Xa.stop(),this.Nk?this.Nc<this.a.Bd&&(this.Nc=this.a.Bd-1):(this.ht(),this.Nc=this.a.Bd-1),this.wk?Ig(this.wk):this.jt(!1),this.os?Ig(this.zo):this.it(!1),this.Qo?(Ig(this.Dl),this.Es&&Hg(this)):this.kt(!1),this.zb=!1)};e.Pc=function(a){a===M.lf&&(this.Ta(),this.Be())};e.ya=function(){this.Nk&&this.a.fh&&this.a.fh.V(0,this.On,this.Ok,this.Jn,this.Kn,0,this.In);this.Aa&&this.Aa.p(this.Ob,this.Tc);this.nd=!1};
function Fg(){this.depth=100;this.h=this.visible=!0;M.d.Na(this,M.Fc);var a;this.a=M.a.w.lh;if("landscape"===M.orientation)for(a in M.a.w.Sr)this.a[a]=M.a.w.Sr[a];this.La=M.a.l.Xz;if(M.a.l.lh)for(a in M.a.l.lh)this.a[a]=M.a.l.lh[a];this.Ec=M.a.w.qc;for(var b in M.a.W.lh)this.a[b]=M.a.W.lh[b];this.fg=-1;this.Wa=0;this.no=[];J(this)}e=Fg.prototype;
e.Ta=function(){var a,b,c,d;M.d.sa(M.Yf);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(M.va),1<a.G?(b=(m.canvas.height-c)/a.Yg,d=-(a.yi*b-m.canvas.width)/2,wa(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.V(0,d,c,b,b,0,1));var f;b=M.a.w.za.type[M.o.Yd].qd;M.a.l.za&&M.a.l.za.type&&M.a.l.za.type[M.o.Yd]&&M.a.l.za.type[M.o.Yd]&&(b=!1===M.a.l.za.type[M.o.Yd].qd?!1:b);void 0!==this.La&&void 0!==this.La.qd&&(b=this.La.qd);c=M.d.g(this.a.Tx,
this.canvas.width,Nc.width);a=M.d.g(this.a.et,M.ha.height,Nc.height)+M.ha.top;b&&(Nc.p(0,c,a),b=W.S(),A(b,this.a.Sx),E(b,"center"),b.p(this.M+" / "+this.vp,c+Math.floor(Nc.width/2),a+Nc.height+this.a.ft));if(void 0!==this.La&&void 0!==this.La.Hx?this.La.Hx:1)b=W.S(),void 0!==this.a.$w?A(b,this.a.$w):A(b,this.a.Fs),c=M.k.K("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Va(b,c,this.a.bx,this.a.ax),d<b.fontSize&&C(b,d),d=M.d.Ga(this.a.Gs,this.canvas.width,b.da(c),b.align),f=M.d.Ga(this.a.Hs,M.ha.height,
b.Z(c),b.i)+M.ha.top,b.p(c,d,f),c=""+this.Il,A(b,this.a.Fs),d=M.d.Ga(this.a.Gs,this.canvas.width,b.da(c),b.align),b.p(c,d,a+Nc.height+this.a.ft)};
function Jg(a){if("grid"===a.a.type){w(a.$i);m.clear();a.eg=[];var b;b=function(b,d,f){var h,k,l,n,q,u,B,D,s,t,v,x,T,ya,Z,na,Ra,gb,Zd,xc,ee,hc,Mf;k=M.o.ma[b];Zd=a.kc?a.a.rv:a.a.sv;xc=a.a.Vn;ee=Zd;if(a.a.Lu)h=a.a.Lu[b];else{gb=a.kc?a.a.Mw:a.a.Nw;for(hc=Math.floor(k/gb);1<Math.abs(hc-gb);)gb-=1,hc=Math.floor(k/gb);for(h=[];0<k;)h.push(Math.min(gb,k)),k-=gb}hc=h.length;Ra=Math.round(((a.kc?a.a.Yr:a.a.Zr)-(hc+1)*Zd)/hc);Mf=a.a.Ju?a.a.Ju:!1;if(!Mf){gb=1;for(k=0;k<hc;k++)gb=Math.max(h[k],gb);na=Math.round((a.canvas.width-
2*xc)/gb)}for(k=n=0;k<hc;k++){gb=h[k];Mf&&(na=Math.round((a.canvas.width-2*xc)/gb));for(l=0;l<gb;l++){s=a.a.Rq;T=a.a.Vu;v=M.o.Ci||"locked";x=0;q=Kg(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(v=q.state),"object"===typeof q.stats&&null!==q.stats&&(x=q.stats.stars||0));ya="locked"===v;"function"===typeof M.l.ov&&(u=M.l.ov(Lg(M.e,b,n),b,n,v))&&(T=ya=s=!1);q=xc+d;D=ee;Z=t=1;if(!1!==T){B=a.kc?Ic:Oc;if("played"===v)switch(x){case 1:B=a.kc?Jc:Pc;break;case 2:B=a.kc?Kc:Qc;break;
case 3:B=a.kc?Lc:Rc}else a.kc||"locked"!==v||(B=Uc);B.width>na&&(Z=na/B.width);B.height>Ra&&(Z=Math.min(t,Ra/B.height));q+=Math.round((na-B.width*Z)/2);D+=Math.round((Ra-B.height*Z)/2);B.V(0,q,D,Z,Z,0,1);f&&(a.eg[n]={x:q,y:D})}u&&(u.width>na&&(t=na/u.width),u.height>Ra&&(t=Math.min(t,Ra/u.height)),void 0!==B?(x=M.d.g(a.a.Pr,B.width*Z,u.width*t),T=M.d.g(a.a.Qr,B.height*Z,u.height*t)):(x=M.d.g(a.a.Pr,na,u.width*t),T=M.d.g(a.a.Qr,Ra,u.height*t),f&&(a.eg[n]={x:q+x,y:D+T})),u instanceof r?u.V(q+x,D+T,
t,t,0,1):u.V(0,q+x,D+T,t,t,0,1));!1===s||ya||(s=""+(M.o.Bj?n+1:Lg(M.e,b,n)+1),t=a.fonts.Qn,"locked"===v&&void 0!==a.fonts.$v?t=a.fonts.$v:"unlocked"===v&&void 0!==a.fonts.zy?t=a.fonts.zy:"played"===v&&void 0!==a.fonts.played&&(t=a.fonts.played),void 0!==B?(x=M.d.Ga(a.a.Ur,B.width*Z,t.da(s),t.align),T=M.d.Ga(a.a.Vr,B.height*Z,t.Z(s),t.i)):(x=M.d.Ga(a.a.Ur,na,t.da(s),t.align),T=M.d.Ga(a.a.Vr,Ra,t.Z(s),t.i)),t.p(s,q+x,D+T));a.kc&&ya&&(void 0!==B?(x=M.d.g(a.a.hs,B.width*Z,Mc.width),T=M.d.g(a.a.is,B.height*
Z,Mc.height)):(x=M.d.g(a.a.hs,na,Mc.width),T=M.d.g(a.a.is,Ra,Mc.height)),Mc.p(0,q+x,D+T));xc+=na;n++}xc=a.a.Vn;ee+=Ra+Zd}};a.Ui&&b(a.C-1,0);b(a.C,a.canvas.width,!0);a.Ti&&b(a.C+1,2*a.canvas.width);y(a.$i)}}function Mg(a,b){switch(b-a.C){case 0:a.Fo=0;break;case 1:a.Fo=-a.canvas.width;break;case -1:a.Fo=a.canvas.width}a.ze=!0;a.ql=0;a.moveStart=a.Wa;a.rs=a.Fo-a.Wa;a.pl=Math.min(a.a.Hw-a.Gh,Math.round(Math.abs(a.rs)/(a.am/1E3)));a.pl=Math.max(a.a.Gw,a.pl)}
function Ng(a){if(1<M.o.ma.length){var b,c;b=M.d.g(a.a.Fy,a.canvas.width,Tc.width);c=M.d.g(a.a.Hp,M.ha.height,Tc.height)+M.ha.top;a.hf=new jg(b,c,a.depth-20,new $b(Tc),[Tc],function(){a.ee="previous";Mg(a,a.C-1);return!0});b=M.d.g(a.a.Ey,a.canvas.width,Sc.width);c=M.d.g(a.a.Gp,M.ha.height,Sc.height)+M.ha.top;a.ef=new jg(b,c,a.depth-20,new $b(Sc),[Sc],function(){a.ee="next";Mg(a,a.C+1);return!0});Og(a)}else a.bf-=a.a.nr}
function Og(a){if(1<M.o.ma.length){var b;a.Ui?(b=[Tc],a.hf.Ab=!0):(b=[new r(Tc.width,Tc.height)],w(b[0]),Tc.p(1,0,0),y(b[0]),a.hf.Ab=!1);Pg(a.hf,b);a.Ti?(b=[Sc],a.ef.Ab=!0):(b=[new r(Sc.width,Sc.height)],w(b[0]),Sc.p(1,0,0),y(b[0]),a.ef.Ab=!1);Pg(a.ef,b)}}
function Qg(a){var b,c,d;w(a.yg);m.clear();b=W.S();a.a.Md&&A(b,a.a.Md);E(b,"center");F(b,"middle");c=M.k.K("levelMapScreenWorld_"+a.C,"<LEVELMAPSCREENWORLD_"+a.C+">");d=Va(b,c,a.a.vd-(b.stroke?b.Ld:0),a.a.fe-(b.stroke?b.Ld:0),!1);d<b.fontSize&&C(b,d);b.p(c,a.yg.width/2,a.yg.height/2);y(a.yg);a.canvas.$=!0}
e.ec=function(){var a,b,c,d=this;this.kc=this.a.kc?!0:!1;if(!this.kc){for(a=0;a<M.o.ma.length;a++)if(9<M.o.ma[a]){b=!0;break}b||(this.kc=!0)}this.$i=new r(3*this.canvas.width,this.kc?this.a.Yr:this.a.Zr);this.Wr=-this.canvas.width;this.Xr=this.kc?this.a.mr:this.a.or;this.bf=M.d.g(this.Xr,M.ha.height,this.$i.height)+M.ha.top;this.yg=new r(this.a.vd,this.a.fe);this.uy=M.d.g(this.a.zg,this.canvas.width,this.a.vd);this.Ht=M.d.g(this.a.Vc,M.ha.height,this.yg.height)+M.ha.top;this.Tr="undefined"!==typeof s_level_mask?
s_level_mask:this.kc?$b(Ic):$b(Oc);this.a.Rq&&(this.fonts={},a=function(a){var b,c;for(b in a)c=W.S(),A(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.Qn=W,this.kc?a(this.a.Pv):a(this.a.Qv));this.C=M.e.C;this.ma=M.o.ma[this.C];this.bm=!1;this.am=this.qp=this.Gh=0;this.rp=this.Wr;this.Wa=0;this.Ui=0<this.C;this.Ti=this.C<M.o.ma.length-1;for(b=this.vp=this.Il=this.M=0;b<M.o.ma.length;b++)for(a=0;a<M.o.ma[b];a++)c=Rg(void 0,a,b),this.vp+=3,"object"===typeof c&&null!==c&&(this.M+=void 0!==c.stars?c.stars:
0,this.Il+=void 0!==c.highScore?c.highScore:0);M.l.qv&&(this.Il=M.l.qv());this.Ta();a=this.Ec[this.a.Pw];this.Io=new jg(M.d.g(this.a.Qw,this.canvas.width,a.s.width),M.d.g(this.a.Jo,M.ha.height,a.s.height)+M.ha.top,this.depth-20,new $b(a.s),[a.s],{fa:M.e.De,xa:this});Ng(this);Jg(this);Qg(this);this.nd=!0};e.tb=function(){this.hf&&K(I,this.hf);this.ef&&K(I,this.ef);K(I,this.Io)};
e.Mb=function(a,b,c){if(!this.ze)for(a=0;a<this.eg.length;a++)if(ec(this.Tr,this.eg[a].x-this.canvas.width,this.eg[a].y+this.bf,b,c)){this.fg=a;break}this.ze=!1;1<M.o.ma.length&&(this.bm=!0,this.Gh=0,this.tt=this.rp=b,this.am=this.qp=0)};
e.Nb=function(a,b,c){if(!this.ze&&-1!==this.fg&&ec(this.Tr,this.eg[this.fg].x-this.canvas.width,this.eg[this.fg].y+this.bf,b,c)&&(a=M.o.Ci||"locked",b=Kg(this.C,this.fg,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return K(I,this),Gg(M.e,this.fg,this.C),!0;this.fg=-1;this.bm=!1;1<M.o.ma.length&&(Math.abs(this.Wa)>=this.a.ky&&(this.am>=this.a.ly||Math.abs(this.Wa)>=this.a.jy)?"previous"===this.ee?this.Ui&&0<=this.Wa&&this.Wa<=this.canvas.width/2?Mg(this,
this.C-1):(0>this.Wa||(this.ee="next"),Mg(this,this.C)):"next"===this.ee&&(this.Ti&&0>=this.Wa&&this.Wa>=-this.canvas.width/2?Mg(this,this.C+1):(0<this.Wa||(this.ee="previous"),Mg(this,this.C))):0<Math.abs(this.Wa)&&(this.ee="next"===this.ee?"previous":"next",Mg(this,this.C)));return!0};
e.Pc=function(a){if(a===M.af||a===M.lf)this.canvas.$=!0,this.Ta(),a===M.lf?(this.Ht=M.d.g(this.a.Vc,M.ha.height,this.yg.height)+M.ha.top,this.bf=M.d.g(this.Xr,M.ha.height,this.$i.height)+M.ha.top,this.Io.y=M.d.g(this.a.Jo,M.ha.height,this.Io.images[0].height)+M.ha.top,this.hf&&(this.hf.y=M.d.g(this.a.Hp,M.ha.height,Tc.height)+M.ha.top),this.ef&&(this.ef.y=M.d.g(this.a.Gp,M.ha.height,Sc.height)+M.ha.top),void 0===this.ef&&void 0===this.hf&&(this.bf-=this.a.nr)):(Qg(this),Jg(this))};
e.Zd=function(a){var b=I.ia[0].x;this.bm&&(this.qp=Math.abs(this.rp-b),0<this.Gh&&(this.am=this.qp/(this.Gh/1E3)),this.ee=b>this.rp?"previous":"next",this.Gh+=a,this.Wa+=b-this.tt,this.tt=b,this.canvas.$=!0);this.ze&&(b=this.pl,this.Wa=this.moveStart+this.rs*lc(b-this.ql,1,-1,b,2),this.ql>=this.pl&&(this.ze=!1,this.Wa=0),this.ql+=a,this.canvas.$=!0);if(this.ze||this.bm)"previous"===this.ee&&this.Wa>=this.canvas.width/2?0<=this.C-1?(this.C-=1,this.ma=M.o.ma[this.C],this.Ui=0<this.C,this.Ti=this.C<
M.o.ma.length-1,Og(this),this.Wa-=this.canvas.width,Qg(this),Jg(this),this.canvas.$=!0,this.moveStart-=this.canvas.width):this.Wa=Math.round(this.canvas.width/2):"next"===this.ee&&this.Wa<=-this.canvas.width/2&&(this.C+1<M.o.ma.length?(this.C+=1,this.ma=M.o.ma[this.C],this.Ui=0<this.C,this.Ti=this.C<M.o.ma.length-1,Og(this),this.Wa+=this.canvas.width,Qg(this),Jg(this),this.canvas.$=!0,this.moveStart+=this.canvas.width):this.Wa=Math.round(-this.canvas.width/2))};
e.ya=function(){this.yg.p(this.uy,this.Ht);this.$i.p(Math.round(this.Wr+this.Wa),this.bf);this.nd=!1};
function Sg(a,b,c,d){this.depth=10;this.h=this.visible=!0;M.d.Na(this,M.Fc);var f;this.type=b.failed?"failed":a;this.a=M.a.w.za;this.La=this.a.type[this.type];if("landscape"===M.orientation)for(f in M.a.w.Or)this.a[f]=M.a.w.Or[f];for(f in M.a.W.za)this.a[f]=M.a.W.za[f];if(M.a.W.za&&M.a.W.za.type&&M.a.W.za.type[this.type])for(f in M.a.W.za.type[this.type])this.a[f]=M.a.W.za.type[this.type][f];if("failed"===this.type){if(void 0!==M.a.l.za&&M.a.l.za.type&&void 0!==M.a.l.za.type.failed)for(f in M.a.l.za.type[this.type])this.La[f]=
M.a.l.za.type[this.type][f]}else{if(void 0!==M.a.l.za&&void 0!==M.a.l.za.type)for(f in M.a.l.za.type[this.type])this.La[f]=M.a.l.za.type[this.type][f];for(f in M.a.l.za)this.La[f]=M.a.l.za[f]}this.Ea=b;this.fa=c;this.xa=d;this.Nx=[Nf,Of,Pf];this.Kf=[];this.Xa=new fc;this.Xa.parent=this;J(this,!1)}
function Tg(a){var b;for(b=0;b<a.M.length;b++)Ug(a.M[b]);for(b=0;b<a.mg.length;b++)K(I,a.mg[b]);a.mg=[];a.Va&&Ug(a.Va);a.Va=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].Ab=!1;a.Xa.stop();a.Xa=void 0;Vg(a)}
function Wg(a,b){var c;switch(b){case "title_level":c=M.k.K("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.Ea.level);break;case "title_endless":c=M.k.K("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.Ea.stage);break;case "title_difficulty":c=M.k.K("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.Mc(a.a.Md,c,a.a.zg,a.a.Vc,a.a.vd,a.a.fe)}
function Xg(a,b){var c;switch(b){case "subtitle_failed":c=M.k.K("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.Mc(a.a.ey,c,a.a.fy,a.a.gy)}
function Yg(a,b,c){var d,f,h,k,l;f=M.k.K(b.key,"<"+b.key.toUpperCase()+">");d=b.Se?b.toString(b.ng):b.toString(b.jd);h=a.a.tj;h.align="left";h.i="top";l=W.S();A(l,h);c?(F(l,"bottom"),h=a.a.og,h.align="left",h.i="bottom",c=W.S(),A(c,h),h=k=0,void 0!==f&&(h+=l.da(f)+a.a.$l),void 0!==d&&(h+=c.da(d)),h=M.d.g(a.a.nf,a.canvas.width,h)-a.f.x,void 0!==f&&(l.p(f,h,a.Kd+l.fontSize),h+=l.da(f)+a.a.$l,k+=l.Z(f)),void 0!==d&&(b.Se?(d=c.Z(d),l=a.Kd+l.fontSize-d,b.Bi=new Zg(h,l,a.a.Dh,d,a.depth-100,b.ng,c,a.a.Bh,
a.a.Ch,a.f,b.toString),k=Math.max(k,d)):(c.p(d,h,a.Kd+l.fontSize+a.a.lt),k=Math.max(k,c.Z(d)))),0<k&&(a.Kd+=k+a.a.de)):(void 0!==f&&(a.Mc(h,f,a.a.nf,a.a.of),k=a.a.of,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.de:a.a.de,k.offset+=l.Z(f)):"number"===typeof k&&(k+=a.a.de+l.Z(f))),void 0!==d&&(h=a.a.og,h.i="top",b.Se?(c=W.S(),h.align="center",A(c,h),f=M.d.g(a.a.nf,a.canvas.width,a.a.Dh)-a.f.x,l=k-a.f.y,b.Bi=new Zg(f,l,a.a.Dh,c.Z(d),a.depth-100,b.ng,c,a.a.Bh,a.a.Ch,a.f,b.toString)):a.Mc(h,
d,a.a.nf,k)))}
function $g(a,b,c){var d,f,h,k,l,n;switch(b){case "totalScore":d=""+a.Ea.totalScore;f=M.k.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":f=M.k.K("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.Ea.highScore;break;case "timeLeft":f=M.k.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.Ea.timeLeft;break;case "timeBonus":f=M.k.K("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.Ea.timeBonus,n=a.Ea.timeBonus}h=a.a.tj;h.align=
"left";h.i="top";l=W.S();A(l,h);c?(F(l,"bottom"),h=a.a.og,h.align="left",h.i="bottom",c=W.S(),A(c,h),h=k=0,void 0!==f&&(h+=l.da(f)+a.a.$l),void 0!==d&&(h+=c.da(d)),h=M.d.g(a.a.nf,a.canvas.width,h)-a.f.x,void 0!==f&&(l.p(f,h,a.Kd+l.fontSize),h+=l.da(f)+a.a.$l,k+=l.Z(f)),void 0!==d&&(void 0!==n?(d=c.Z(d),l=a.Kd+l.fontSize-d,n=new Zg(h,l,a.a.Dh,d,a.depth-100,n,c,a.a.Bh,a.a.Ch,a.f),k=Math.max(k,d)):(c.p(d,h,a.Kd+l.fontSize+a.a.lt),k=Math.max(k,c.Z(d)))),0<k&&(a.Kd+=k+a.a.de)):(void 0!==f&&(a.Mc(h,f,a.a.nf,
a.a.of),k=a.a.of,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.de:a.a.de,k.offset+=l.Z(f)):"number"===typeof k&&(k+=a.a.de+l.Z(f))),void 0!==d&&(h=a.a.og,h.i="top",void 0!==n?(c=W.S(),h.align="center",A(c,h),f=M.d.g(a.a.nf,a.canvas.width,a.a.Dh)-a.f.x,l=k-a.f.y,n=new Zg(f,l,a.a.Dh,c.Z(d),a.depth-100,n,c,a.a.Bh,a.a.Ch,a.f)):a.Mc(h,d,a.a.nf,k)));n instanceof Zg&&("totalScore"===b?a.Cg=n:a.Kf.push(n))}
function ah(a,b){var c,d,f;c=M.k.K(b.key,"<"+b.key.toUpperCase()+">");d=b.Se?b.toString(b.ng):b.toString(b.jd);void 0!==c&&a.Mc(a.a.qn,c,a.a.Vq,a.a.Bk);void 0!==d&&(b.Se?(c=W.S(),d=a.a.Gi,a.a.Az||(d.align="center"),A(c,d),d=M.d.g(a.a.Ek,a.canvas.width,a.a.Dk)-a.f.x,f=M.d.g(a.a.ah,a.canvas.height,a.a.Ck)-a.f.y,b.Bi=new Zg(d,f,a.a.Dk,a.a.Ck,a.depth-100,b.ng,c,a.a.Bh,a.a.Ch,a.f,b.toString)):a.Mc(a.a.Gi,d,a.a.Ek,a.a.ah))}
function bh(a,b){var c,d,f,h;switch(b){case "totalScore":c=M.k.K("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.Ea.totalScore;f=0;break;case "timeLeft":c=M.k.K("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.Ea.timeLeft}void 0!==c&&a.Mc(a.a.qn,c,a.a.Vq,a.a.Bk);void 0!==d&&(void 0!==f?(c=W.S(),d=a.a.Gi,d.align="center",A(c,d),d=M.d.g(a.a.Ek,a.canvas.width,a.a.Dk)-a.f.x,h=M.d.g(a.a.ah,a.canvas.height,a.a.Ck)-a.f.y,f=new Zg(d,h,a.a.Dk,a.a.Ck,a.depth-100,f,c,a.a.Bh,a.a.Ch,
a.f)):a.Mc(a.a.Gi,d,a.a.Ek,a.a.ah));f instanceof Zg&&("totalScore"===b?a.Cg=f:a.Kf.push(f))}e=Sg.prototype;e.Mc=function(a,b,c,d,f,h){var k=W.S();A(k,a);void 0!==f&&void 0!==h&&(a=Va(k,b,f,h,f),k.fontSize>a&&C(k,a));a=k.da(b);h=k.Z(b);k.p(b,M.d.Ga(c,this.canvas.width,a,k.align)-this.f.x,M.d.Ga(d,this.canvas.height,h,k.i)-this.f.y,f)};
function ch(a,b){var c,d,f,h;switch(b){case "retry":c=ne;d=function(){a.Ve="retry";Tg(a)};break;case "exit":c=ke,d=function(){a.Ve="exit";Tg(a)}}void 0!==c&&(f=M.d.g(a.a.xu,a.canvas.width,c.width)-a.f.x,h=M.d.g(a.a.Wm,a.canvas.height,c.height)-a.f.y,a.buttons.push(new jg(f,h,a.depth-20,new $b(c),[c],d,a.f)))}
function dh(a,b){var c,d,f,h;switch(b){case "retry":c=ie;d=function(){a.Ve="retry";Tg(a)};break;case "exit":c=je;d=function(){a.Ve="exit";Tg(a)};break;case "next":c=je,d=function(){a.Ve="next";Tg(a)}}void 0!==c&&(f=M.d.g(a.a.gv,a.canvas.width,c.width)-a.f.x,h=M.d.g(a.a.Dn,a.canvas.height,c.height)-a.f.y,a.buttons.push(new jg(f,h,a.depth-20,new $b(c),[c],d,a.f)))}
e.ec=function(){this.m=0;this.M=[];this.mg=[];this.buttons=[];this.canvas.$=!0;this.Ve="";this.kd=this.Ea.failed?!0:!1;this.qd=this.La.qd&&!this.kd;this.yh=this.La.yh&&!this.kd&&this.Ea.Br;this.Pm=this.alpha=this.Ug=0;eh(this);var a,b,c,d,f,h,k=this;switch(this.La.ak){case "failed":this.b=this.a.Al.Ov;break;case "level":this.b=this.a.Al.Rv;break;case "difficulty":this.b=this.a.Al.mn;break;case "endless":this.b=this.a.Al.Zu}this.f=new fh(this.depth-10,this.Ua,new r(this.b.width,this.b.height));this.f.x=
M.d.g(this.a.zc,this.canvas.width,this.b.width);this.f.y=M.d.g(this.a.Rb,this.canvas.height,this.b.height);w(this.f.b);this.b.p(0,0,0);!this.kd&&this.qd&&(b=M.d.g(this.a.gp,this.canvas.width,0)-this.f.x,a=M.d.g(this.a.hp,this.canvas.height,s_star01_fill.height)-this.f.y+Math.round(s_star01_empty.height/2),s_star01_empty.p(0,b,a),b=M.d.g(this.a.ip,this.canvas.width,0)-this.f.x,a=M.d.g(this.a.jp,this.canvas.height,s_star02_fill.height)-this.f.y+Math.round(s_star02_empty.height/2),s_star02_empty.p(0,
b,a),b=M.d.g(this.a.kp,this.canvas.width,0)-this.f.x,a=M.d.g(this.a.lp,this.canvas.height,s_star03_fill.height)-this.f.y+Math.round(s_star03_empty.height/2),s_star03_empty.p(0,b,a));void 0!==this.La.xj&&Wg(this,this.La.xj);void 0!==this.La.ot&&Xg(this,this.La.ot);this.Jb={};void 0!==this.Ea.Xd?(c=this.Ea.Xd,c.visible&&ah(this,c),this.Jb[c.id]=c):void 0!==this.La.rn&&bh(this,this.La.rn);if(void 0!==this.Ea.Jb)for(a=this.Ea.Jb.length,b=W.S(),A(b,this.a.tj),c=W.S(),A(c,this.a.og),b=Math.max(b.Z("g"),
c.Z("g"))*a+this.a.de*(a-1),this.Kd=M.d.g(this.a.of,this.canvas.height,b)-this.f.y,b=0;b<a;b++)c=this.Ea.Jb[b],c.visible&&Yg(this,this.Ea.Jb[b],1<a),this.Jb[c.id]=c;else if(void 0!==this.La.pf)if("string"===typeof this.La.pf)$g(this,this.La.pf,this.a.gr);else if(this.La.pf instanceof Array)for(a=this.La.pf.length,b=W.S(),A(b,this.a.tj),c=W.S(),A(c,this.a.og),b=Math.max(b.Z("g"),c.Z("g"))*a+this.a.de*(a-1),this.Kd=M.d.g(this.a.of,this.canvas.height,b)-this.f.y,b=0;b<a;b++)$g(this,this.La.pf[b],1<a||
this.a.gr);y(this.f.b);ch(this,this.La.Zj);dh(this,this.La.Jk);M.e.St&&(b=M.d.g(k.a.Cv,k.canvas.width,k.a.xr)-this.f.x,a=M.d.g(this.a.Dv,this.canvas.height,this.a.Of)-this.f.y,this.wr=new Eg("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.xr,{fa:function(){void 0!==gh?M.j.Fd(M.A.Yk.url+"submit/"+gh+"/"+k.Ea.totalScore):M.j.Fd(M.A.Yk.url+"submit/")},vc:!0},k.f),this.buttons.push(this.wr),b=function(a){a&&(k.wr.zp("levelEndScreenSubmitHighscoreBtn"),k.Vz=a)},hh(this.Ea.totalScore,
b));b=M.d.g(this.a.xi,this.canvas.width,this.a.Xg)-this.f.x;a=M.d.g(this.a.Pf,this.canvas.height,this.a.Of)-this.f.y;this.buttons.push(new jg(b,a,this.depth-20,new Yb(0,0,this.a.Xg,this.a.Of),void 0,function(){k.Ve="exit";Tg(k)},this.f));for(b=0;b<this.buttons.length;b++)this.buttons[b].Ab=!1;this.f.y=-this.f.height;a=this.a.oy;this.Xa.Y(a,this.Yx);a+=this.a.oi;f=0;d=this.a.wy;this.qd&&(d=Math.max(d,this.a.ct+this.a.bt*this.Ea.stars));if(this.Cg&&(this.Xa.Y(a+this.a.lm,function(a,b){ih(b.parent.Cg,
b.parent.Ea.totalScore,d)}),f=a+this.a.lm+d,0<this.Kf.length)){h=function(a,b){var c=b.parent,d=c.Kf[c.Ug];ih(c.Cg,c.Cg.value+d.value,c.a.Tg);ih(d,0,c.a.Tg);c.Ug+=1};for(b=0;b<this.Kf.length;b++)f+=this.a.tq,this.Xa.Y(f,h);f+=this.a.Tg}if(void 0!==this.Jb&&(f=a,h=function(a,b){var c=b.parent,d=c.pp[c.Ug||0],f=c.Jb[d.Zl];void 0!==d.vf&&(f.visible&&f.Se?ih(f.Bi,d.vf(f.Bi.value),c.a.Tg):f.jd=d.vf(f.jd));d.visible&&d.Se&&ih(d.Bi,d.jd,c.a.Tg);c.Ug+=1},this.pp=[],void 0!==this.Ea.Xd&&void 0!==this.Ea.Xd.vf&&
(this.Xa.Y(a+this.a.lm,h),this.pp.push(this.Ea.Xd),f+=this.a.lm+bonusCounterDuration),void 0!==this.Ea.Jb))for(b=0;b<this.Ea.Jb.length;b++)c=this.Ea.Jb[b],void 0!==c.vf&&(f+=this.a.tq,this.Xa.Y(f,h),this.pp.push(c),f+=this.a.Tg);if(this.qd){for(b=0;b<this.Ea.stars;b++)a+=this.a.bt,this.Xa.Y(a,this.$x),this.Xa.Y(a,this.ay);a+=this.a.ct}a=Math.max(a,f);this.yh&&(a+=this.a.mw,this.Xa.Y(a,this.Xx),this.Xa.Y(a,this.Vx),this.Xa.Y(a+this.a.nw,this.Wx));a+=500;this.Xa.Y(a,function(){M.j.Hv&&M.j.Hv()});this.Xa.Y(a+
this.a.Ew,M.j.Iv);M.j.Cr(this.Ea);this.Xa.start();this.kd?G.play(Qf):G.play(Kf)};e.ba=function(a){this.alpha=this.a.Ik*this.Pm/this.a.Lb;this.Pm+=a;this.alpha>=this.a.Ik&&(this.alpha=this.a.Ik,this.h=!1);this.canvas.$=!0};
e.Yx=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].Ab=!0}var d=b.parent,f,h;switch(d.a.My){case "fromLeft":h="horizontal";f=M.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.x=-d.f.width;d.f.y=M.d.g(d.a.Rb,d.canvas.height,d.f.height)+Math.abs(M.va);break;case "fromRight":h="horizontal";f=M.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.x=d.canvas.width;d.f.y=M.d.g(this.parent.a.Rb,d.canvas.height,selft.f.height)+Math.abs(M.va);break;case "fromBottom":h="vertical";f=M.d.g(d.a.Rb,
d.canvas.height,d.f.height)+Math.abs(M.va);d.f.x=M.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.y=d.canvas.height+d.f.height;break;default:h="vertical",f=M.d.g(d.a.Rb,d.canvas.height,d.f.height)+Math.abs(M.va),d.f.x=M.d.g(d.a.zc,d.canvas.width,d.f.width),d.f.y=-d.f.height}"vertical"===h?jh(d.f,"y",f,d.a.oi,d.a.Qm,c):jh(d.f,"x",f,d.a.oi,d.a.Qm,c)};
function Vg(a){function b(){K(I,a);a.xa?a.fa.call(a.xa,a.Ve):a.fa(a.Ve)}var c,d;switch(a.a.Ny){case "toLeft":d="horizontal";c=-a.f.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.f.height;break;default:d="vertical",c=-a.f.height}"vertical"===d?jh(a.f,"y",c,a.a.Rm,a.a.Sm,b):jh(a.f,"x",c,a.a.Rm,a.a.Sm,b)}
e.$x=function(a,b){var c,d=b.parent,f=Math.abs(M.va);if(d.M.length<d.Ea.stars){switch(d.M.length+1){case 1:c=new fh(d.depth-30,M.ue,s_star01_fill);c.x=M.d.g(d.a.gp,d.canvas.width,0);c.y=M.d.g(d.a.hp,d.canvas.height,s_star01_fill.height)+f+Math.round(s_star01_empty.height/2);break;case 2:c=new fh(d.depth-30,M.ue,s_star02_fill);c.x=M.d.g(d.a.ip,d.canvas.width,0);c.y=M.d.g(d.a.jp,d.canvas.height,s_star02_fill.height)+f+Math.round(s_star02_empty.height/2);break;case 3:c=new fh(d.depth-30,M.ue,s_star03_fill),
c.x=M.d.g(d.a.kp,d.canvas.width,0),c.y=M.d.g(d.a.lp,d.canvas.height,s_star03_fill.height)+f+Math.round(s_star03_empty.height/2)}c.gb=d.a.dt;c.kb=d.a.dt;c.alpha=d.a.Rx;jh(c,"scale",1,d.a.Qx,vc,function(){var a=d.M.length,b,c,n;w(d.f.b);switch(a){case 1:n=s_star01_fill;b=M.d.g(d.a.gp,d.canvas.width,0)-d.f.x;c=M.d.g(d.a.hp,d.canvas.height,s_star01_fill.height)-d.f.y+f+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=M.d.g(d.a.ip,d.canvas.width,0)-d.f.x;c=M.d.g(d.a.jp,d.canvas.height,
s_star01_fill.height)-d.f.y+f+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=M.d.g(d.a.kp,d.canvas.width,0)-d.f.x,c=M.d.g(d.a.lp,d.canvas.height,s_star01_fill.height)-d.f.y+f+Math.round(s_star03_empty.height/2)}n.p(0,b,c);y(d.f.b);d.f.nd=!0;K(I,d.M[a-1])});jh(c,"alpha",1,d.a.Px,mc);d.M.push(c);G.play(d.Nx[d.M.length-1])}};
e.ay=function(a,b){var c=b.parent,d,f;d=c.M[c.mg.length];f=new fh(c.depth-50,M.ue,s_sfx_star);f.x=d.x;f.y=d.y;jh(f,"subImage",s_sfx_star.G-1,c.a.Ox,void 0,function(){K(I,f)});c.mg.push(f)};
e.Vx=function(a,b){var c=b.parent,d,f,h,k,l,n,q;d=[];h=W.S();k=M.k.K("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.ns&&A(h,c.a.ns);f=Va(h,k,c.a.ml,c.a.tw,!0);f<h.fontSize&&C(h,f);l=M.d.Ga(c.a.uw,Xc.width,h.da(k,c.a.ml),h.align);n=M.d.Ga(c.a.vw,Xc.height,h.Z(k,c.a.ml),h.i);for(q=0;q<Xc.G;q++)f=new r(Xc.width,Xc.height),w(f),Xc.p(q,0,0),h.p(k,l,n,c.a.ml),y(f),d.push(f);c.Va=new fh(c.depth-120,M.ue,d);c.Va.Gd=c.a.ks;c.Va.Hd=c.a.ls;c.Va.x=M.d.g({align:"center"},c.f.canvas.width,c.Va.width)-c.f.x;
c.Va.y=M.d.g(c.a.fj,c.Va.canvas.height,c.Va.height)-c.f.y+Math.abs(M.va);l=M.d.g(c.a.yo,c.Va.canvas.width,c.Va.width)-c.f.x;c.Va.gb=c.a.ll;c.Va.kb=c.a.ll;c.Va.parent=c.f;c.Va.alpha=0;c.Va.cz=!0;jh(c.Va,"scale",1,c.a.oh,mc,function(){K(I,c.Cb);c.Cb=void 0});jh(c.Va,"x",l,c.a.oh,mc);jh(c.Va,"alpha",1,0,mc);jh(c.Va,"subImage",Xc.G,c.a.rw,mc,void 0,c.a.oh+c.a.js+c.a.qw,!0,c.a.sw)};
e.Xx=function(a,b){var c,d=b.parent;d.Cb=new fh(d.depth-110,M.ue,Wc);d.Cb.y=M.d.g(d.a.fj,d.Cb.canvas.height,Wc.height)-d.f.y+d.a.pw;d.Cb.Gd=d.a.ks;d.Cb.Hd=d.a.ls;d.Cb.x=M.d.g(d.a.yo,d.Cb.canvas.width,d.Cb.width)-d.f.x;c=M.d.g(d.a.fj,d.Cb.canvas.height,Wc.height)-d.f.y+Math.abs(M.va);d.Cb.gb=d.a.ll*d.a.ms;d.Cb.kb=d.a.ll*d.a.ms;d.Cb.alpha=0;d.Cb.parent=d.f;jh(d.Cb,"y",c,d.a.oh,mc);jh(d.Cb,"scale",1,d.a.oh,mc);jh(d.Cb,"alpha",1,d.a.oh,mc)};
e.Wx=function(a,b){var c=b.parent;c.df=new fh(c.depth-130,M.ue,Vc);c.df.parent=c.f;c.df.x=c.Va.x;c.df.y=c.Va.y+c.a.ow;jh(c.df,"subImage",Vc.G-1,c.a.js,void 0,function(){K(I,c.df);c.df=void 0});G.play(Tf)};
e.tb=function(){var a;for(a=0;a<this.buttons.length;a++)K(I,this.buttons[a]);for(a=0;a<this.M.length;a++)K(I,this.M[a]);for(a=0;a<this.mg.length;a++)K(I,this.mg[a]);this.Va&&(K(I,this.Va),this.df&&K(I,this.df),this.Cb&&K(I,this.Cb));K(I,this.f);this.Xa&&this.Xa.stop();this.Cg&&K(I,this.Cg);for(a=0;a<this.Kf.length;a++)K(I,this.Kf[a]);kh()};e.ya=function(){var a=m.context.globalAlpha;m.context.globalAlpha=this.alpha;sa(0,0,m.canvas.width,m.canvas.height,this.a.$q,!1);m.context.globalAlpha=a};
function lh(a,b,c,d){this.depth=-100;this.visible=!1;this.h=!0;M.d.Na(this,M.Fc);var f,h;this.a=c?M.a.w.ws:M.a.w.options;if("landscape"===M.orientation)for(f in h=c?M.a.w.DA:M.a.w.Rw,h)this.a[f]=h[f];this.Ec=M.a.w.qc;h=c?M.a.W.ws:M.a.W.options;for(f in h)this.a[f]=h[f];if(M.A.options&&M.A.options.buttons)for(f in M.A.options.buttons)this.a.buttons[f]=M.A.options.buttons[f];this.type=a;this.yy=b;this.zd=c;this.Ul=!1!==d;J(this)}e=lh.prototype;
e.ni=function(a,b,c,d,f){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,u=void 0;switch(a){case "music":h="music_toggle";n=this.Jt;l=M.e.gf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.Jt;l=M.e.gf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.Kt;l=M.e.Hl()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.Kt;l=M.e.Hl()?"on":"off";break;case "language":h="language_toggle";n=this.It;l=M.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.qj;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.Ps;this.an=this.Fx;break;case "moreGames":void 0!==M.A.Dw?(h="default_image",u=M.A.Dw):(h="default_text",k="optionsMoreGames");n=this.Gx;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=M.th.customFunctions&&"function"===typeof M.th.customFunctions.exit?M.th.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.qx;break;
case "restart":h="default_text";k="optionsRestart";n=this.ux;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.Ps;this.an=this.Ix;break;case "about":h="default_text";k="optionsAbout";n=this.Dx;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.Li;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.vi}void 0!==h&&void 0!==n&&("image"===this.Ec[h].type?this.buttons.push(new mh(h,b,c,this.depth-20,u,d,{fa:n,xa:this,vc:q},
this.f)):"toggleText"===this.Ec[h].type?this.buttons.push(new Ag(h,b,c,this.depth-20,l,d,{fa:n,xa:this,vc:q},this.f)):"text"===this.Ec[h].type?this.buttons.push(new Eg(h,b,c,this.depth-20,k,d,{fa:n,xa:this,vc:q},this.f)):"toggle"===this.Ec[h].type&&this.buttons.push(new nh(h,b,c,this.depth-20,l,{fa:n,xa:this,vc:q},this.f)),this.buttons[this.buttons.length-1].Ab=f||!1)};
e.Ps=function(){var a=this;jh(a.f,"y","inGame"!==this.type?-this.f.b.height:this.canvas.height,this.a.Lo,this.a.Mo,function(){K(I,a);void 0!==a.an&&a.an.call(a)});return!0};
e.Ta=function(a,b){var c,d,f,h;w(this.f.b);m.clear();this.a.backgroundImage.p(0,0,0);c=M.k.K("optionsTitle","<OPTIONS_TITLE>");d=W.S();this.a.Md&&A(d,this.a.Md);void 0!==this.a.vd&&void 0!==this.a.fe&&(f=Va(d,c,this.a.vd,this.a.fe,this.a.vd),d.fontSize>f&&C(d,f));f=M.d.Ga(this.a.zg,this.canvas.width,d.da(c),d.align)-a;h=M.d.Ga(this.a.Vc,this.canvas.height,d.Z(c,d.i))-b+-1*M.va;d.p(c,f,h);y(this.f.b)};
e.Ef=function(a,b,c){var d,f,h,k,l,n,q;h=!1;var u=this.a.buttons[this.type];"inGame"===this.type&&M.a.l.Xf.yw&&(u=M.a.l.Xf.yw);if("function"!==typeof oh())for(d=0;d<u.length;d++){if("string"===typeof u[d]&&"moreGames"===u[d]){u.splice(d,1);break}for(f=0;f<u[d].length;f++)if("moreGames"===u[d][f]){u[d].splice(f,1);break}}if(!1===M.A.gf||!1===M.e.gl)for(d=0;d<u.length;d++)if(u[d]instanceof Array){for(f=0;f<u[d].length;f++)if("music"===u[d][f]){M.e.hl?u[d]="sfx_big":u.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
u[d]){u.splice(d,1);break}if(!M.e.hl)for(d=0;d<u.length;d++)if(u[d]instanceof Array){for(f=0;f<u[d].length;f++)if("sfx"===u[d][f]){!1!==M.A.gf&&M.e.gl?u[d]="music_big":u.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===u[d]){u.splice(d,1);break}if(1===M.k.nv().length)for(d=0;d<u.length;d++)if("language"===u[d]){u.splice(d,1);break}h=this.Ec.default_text.s.height;k=this.a.jk;a=M.d.g(this.a.ik,this.canvas.width,k)-a;n=M.d.g(this.a.Wg,this.f.b.height,h*u.length+this.a.Sd*(u.length-1))-b+-1*M.va;
for(d=0;d<u.length;d++){l=a;q=k;if("string"===typeof u[d])this.ni(u[d],l,n,q,c);else for(b=u[d],q=(k-(b.length-1)*this.a.Sd)/b.length,f=0;f<b.length;f++)this.ni(b[f],l,n,q,c),l+=q+this.a.Sd;n+=h+this.a.Sd}};e.Jt=function(a){var b=!0;"off"===a?(b=!1,M.Oa.jb("off","options:music")):M.Oa.jb("on","options:music");M.e.gf(b);return!0};e.Kt=function(a){var b=!0;"off"===a?(b=!1,M.Oa.jb("off","options:sfx")):M.Oa.jb("on","options:sfx");M.e.Hl(b);return!0};
e.It=function(a){M.k.Rs(a);M.Oa.jb(a,"options:language");return!0};
e.qj=function(){function a(){l.Wc+=1;l.qj();return!0}function b(){l.Wc-=1;l.qj();return!0}function c(){var a;l.Ta(n,q);l.Nf.Ab=!0;for(a=0;a<l.buttons.length;a++)K(I,l.buttons[a]);l.buttons=[];l.Ef(n,q,!0)}var d,f,h,k,l=this,n=M.d.g(l.a.zc,l.canvas.width,l.a.backgroundImage.width),q=M.d.g(l.a.Rb,l.canvas.height,l.a.backgroundImage.height)+-1*M.va;void 0===l.Wc&&(l.Wc=0);l.zj=void 0!==M.l.Un?M.l.Un(M.e.yb,Bg()):[];M.Oa.jb((10>l.Wc?"0":"")+l.Wc,"options:tutorial");for(d=0;d<l.buttons.length;d++)K(I,
l.buttons[d]);l.buttons=[];this.zd?(w(l.f.b),m.clear(),l.Nf.Ab=!1):l.Ta(n,q);w(l.f.b);void 0!==l.a.Nd&&(d=M.d.g(l.a.om,l.f.b.width,l.a.Nd.width),f=M.d.g(l.a.Me,l.f.b.height,l.a.Nd.height),l.a.Nd.p(0,d,f));k=l.zj[l.Wc].title;void 0!==k&&""!==k&&(h=W.S(),l.a.um&&A(h,l.a.um),d=Va(h,k,l.a.vm,l.a.xp,l.a.vm),h.fontSize>d&&C(h,d),d=M.d.Ga(l.a.Rt,l.f.b.width,h.da(k,l.a.vm),h.align),f=M.d.Ga(l.a.wm,l.f.b.height,h.Z(k,l.a.xp),h.i),h.p(k,d,f));l.Wc<l.zj.length&&(h=l.zj[l.Wc].b,d=M.d.g(l.a.Ot,l.f.b.width,h.width),
f=M.d.g(l.a.sm,l.f.b.height,h.height),h.p(0,d,f),k=l.zj[l.Wc].text,h=W.S(),l.a.rm&&A(h,l.a.rm),d=Va(h,k,l.a.Jh,l.a.Pt,l.a.Jh),h.fontSize>d&&C(h,d),d=M.d.Ga(l.a.Qt,l.f.b.width,h.da(k,l.a.Jh),h.align),f=M.d.Ga(l.a.tm,l.f.b.height,h.Z(k,l.a.Jh),h.i),h.p(k,d,f,l.a.Jh));y(l.f.b);h=pd;d=M.d.g(l.a.Nt,l.canvas.width,h.width)-l.f.x;f=M.d.g(l.a.qm,l.canvas.height,h.height)-l.f.y-M.va;0<=l.Wc-1?l.buttons.push(new jg(d,f,l.depth-20,new $b(h),[h],{fa:b,xa:l},l.f)):(h=nd,l.buttons.push(new jg(d,f,l.depth-20,new $b(h),
[h],{fa:c,xa:l},l.f)));h=od;d=M.d.g(this.a.Mt,l.canvas.width,h.width)-l.f.x;f=M.d.g(this.a.pm,l.canvas.height,h.height)-l.f.y-M.va;l.Wc+1<l.zj.length?l.buttons.push(new jg(d,f,l.depth-20,new $b(h),[h],{fa:a,xa:l},l.f)):(h=nd,l.buttons.push(new jg(d,f,l.depth-20,new $b(h),[h],{fa:c,xa:l},l.f)));return!0};
e.Dx=function(){function a(a,b,c,f,h,k){var l;l=W.S();b&&A(l,b);b=Va(l,a,h,k,h);l.fontSize>b&&C(l,b);c=M.d.Ga(c,d.f.b.width,l.da(a,h),l.align);f=M.d.Ga(f,d.f.b.height,l.Z(a,k),l.i);l.p(a,c,f,h);return f+k}function b(a,b,c){b=M.d.g(b,d.f.b.width,a.width);c=M.d.g(c,d.f.b.height,a.height);a.p(0,b,c);return c+a.height}var c,d=this,f=M.d.g(d.a.zc,d.canvas.width,d.a.backgroundImage.width),h=M.d.g(d.a.Rb,d.canvas.height,d.a.backgroundImage.height)+-1*M.va;M.Oa.jb("about","options");for(c=0;c<d.buttons.length;c++)K(I,
d.buttons[c]);d.buttons=[];this.zd?(w(d.f.b),m.clear(),d.Nf.Ab=!1):d.Ta(f,h);w(d.f.b);void 0!==d.a.Nd&&b(d.a.Nd,d.a.om,d.a.Me);var k=null;"function"===typeof M.j.Qq?k=M.j.Qq(d.a,a,b,d.f.b):(c=M.k.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.Rj,d.a.Tj,d.a.Lg,d.a.Sj,d.a.Yp),b(rd,d.a.ii,d.a.ji),c=M.k.K("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.ki,d.a.Mg,d.a.Ng,d.a.Df,d.a.li));a(M.k.K("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+pg()+("big"===M.size?"b":"s"),d.a.Mm,d.a.aq,
d.a.Vj,d.a.$p,d.a.Zp);y(d.f.b);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new jg(l.x,l.y,d.depth-10,Yb(0,0,l.width,l.height),null,{fa:function(a){return function(){M.j.Fd(a)}}(l.url),vc:!0},d.f))}else void 0!==M.A.yr&&(c=M.d.g(d.a.ii,d.f.b.width,rd.width),k=M.d.g(d.a.ji,d.f.b.height,rd.height),c=Math.min(c,M.d.g(d.a.Mg,d.f.b.width,d.a.Df)),k=Math.min(k,M.d.g(d.a.Ng,d.f.b.height,d.a.li)),l=Math.max(d.a.Df,rd.width),d.buttons.push(new jg(c,k,d.depth-10,Yb(0,0,l,M.d.g(d.a.Ng,d.f.b.height,
d.a.li)+d.a.li-k),null,{fa:function(){M.j.Fd(M.A.yr)},vc:!0},d.f)));d.buttons.push(new Eg("default_text",M.d.g(d.a.Lm,d.f.b.width,d.a.hi),d.a.Kg,d.depth-20,"optionsAbout_backBtn",d.a.hi,{fa:function(){var a;d.Ta(f,h);d.Nf.Ab=!0;for(a=0;a<d.buttons.length;a++)K(I,d.buttons[a]);d.buttons=[];d.Ef(f,h,!0);d.Ws=!1},xa:d},d.f));return this.Ws=!0};
function ph(a){var b,c,d,f,h,k=M.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width),l=M.d.g(a.a.Rb,a.canvas.height,a.a.backgroundImage.height)+-1*M.va;M.Oa.jb("versions","options");for(b=0;b<a.buttons.length;b++)K(I,a.buttons[b]);a.buttons=[];a.Ta(k,l);w(a.f.b);void 0!==a.a.Nd&&a.a.Nd.p(0,M.d.g(a.a.om,a.f.width,a.a.Nd.width),M.d.g(a.a.Me,a.f.height,a.a.Nd.height));h=W.S();A(h,a.a.Mm);E(h,"left");c=a.a.au;d=a.a.bu;for(b in M.version)f=b+": "+M.version[b],h.p(f,c,d),d+=h.Z(f)+a.a.$t;c=M.d.g(a.a.Lm,
a.f.b.width,a.a.hi);d=a.a.Kg;a.buttons.push(new Eg("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.hi,{fa:function(){var b;a.Ta(k,l);for(b=0;b<a.buttons.length;b++)K(I,a.buttons[b]);a.buttons=[];a.Ef(k,l,!0)},xa:a},a.f))}e.Fx=function(){return!0};e.Gx=function(){M.Oa.jb("moreGames","options");var a=oh();"function"===typeof a&&a();return!0};
e.qx=function(){var a=this;qh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){M.Oa.jb("confirm_yes","options:quit");K(I,a);qg(M.Oa,M.e.xg,rh(M.e),"progression:levelQuit:"+sh());th();uh(M.e);return!0})};
e.ux=function(){var a=this;qh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){M.Oa.jb("confirm_yes","options:restart");K(I,a);var b=M.e;b.state="LEVEL_END";qg(M.Oa,M.e.xg,rh(M.e),"progression:levelRestart:"+sh());b=M.o.Bj?b.yb+1:Lg(b)+1;M.e.za=!0;M.e.Nr="retry";vh(M.e,!0);b={failed:!0,level:b,restart:!0};M.j.jh(b);M.Qd.jh(b);return!0})};
e.Li=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";wh(b,M.k.K(d,"<"+d.toUpperCase()+">"));a&&(b.Nf.Ab=!1,b.Ul||eh())};qh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){M.e.Li(a);return!0})};
e.vi=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";wh(b,M.k.K(d,"<"+d.toUpperCase()+">"));a&&(b.Nf.Ab=!1,b.Ul||eh())};qh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){M.e.vi(a);return!0})};
function qh(a,b,c,d,f){var h,k,l,n;for(h=0;h<a.buttons.length;h++)K(I,a.buttons[h]);a.buttons=[];b=M.k.K(b,"<"+b.toUpperCase()+">");h=W.S();a.a.Fq?A(h,a.a.Fq):a.a.Ml&&A(h,a.a.Ml);k=Va(h,b,a.a.qk,a.a.gn,!0);k<h.fontSize&&C(h,k);n=h.da(b,a.a.qk)+10;l=h.Z(b,a.a.qk)+10;k=M.d.Ga(a.a.Gq,a.f.b.width,n,h.align);l=M.d.Ga(a.a.rk,a.f.b.height,l,h.i);w(a.f.b);h.p(b,k,l,n);y(a.f.b);k=M.d.g(a.a.Dq,a.canvas.width,a.a.zi)-a.f.x;l=M.d.g(a.a.ok,a.canvas.height,a.Ec.default_text.s.height)-a.f.y-M.va;a.buttons.push(new Eg("default_text",
k,l,a.depth-20,d,a.a.zi,{fa:function(){var b,c,d;c=M.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width);d=M.d.g(a.a.Rb,a.canvas.height,a.a.backgroundImage.height)+-1*M.va;a.Ta(c,d);for(b=0;b<a.buttons.length;b++)K(I,a.buttons[b]);a.buttons=[];a.Ef(c,d,!0);return!0},xa:a},a.f));k=M.d.g(a.a.Eq,a.canvas.width,a.a.zi)-a.f.x;l=M.d.g(a.a.pk,a.canvas.height,a.Ec.default_text.s.height)-a.f.y-M.va;a.buttons.push(new Eg("default_text",k,l,a.depth-20,c,a.a.zi,{fa:function(){return"function"===typeof f?f():
!0},xa:a},a.f))}function wh(a,b){var c,d,f,h;for(c=0;c<a.buttons.length;c++)K(I,a.buttons[c]);a.buttons=[];d=M.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width);f=M.d.g(a.a.Rb,a.canvas.height,a.a.backgroundImage.height)+-1*M.va;a.Ta(d,f);c=W.S();a.a.Bo&&A(c,a.a.Bo);d=Va(c,b,a.a.Co,a.a.zw,!0);d<c.fontSize&&C(c,d);h=c.da(b,a.a.Co)+10;f=c.Z(b,a.a.Co)+10;d=M.d.Ga(a.a.Aw,a.f.b.width,h,c.align);f=M.d.Ga(a.a.Bw,a.f.b.height,f,c.i);w(a.f.b);c.p(b,d,f,h);y(a.f.b)}
e.Ix=function(){M.Oa.jb("startScreen","options");uh(M.e);return!0};e.close=function(){K(I,this);return this.canvas.$=!0};
e.ec=function(){var a,b;this.Ul&&eh(this);M.e.me=this;this.dr=this.cr=!1;a=this.a.backgroundImage;this.f=new fh(this.depth-10,this.Ua,new r(a.width,a.height));this.f.x=M.d.g(this.a.zc,this.canvas.width,a.width);a=M.d.g(this.a.Rb,this.canvas.height,a.height)+-1*M.va;this.f.y=a;this.Ta(this.f.x,this.f.y);this.buttons=[];this.yy?this.qj():this.Ef(this.f.x,this.f.y);this.Nf=new jg(this.a.xi,this.a.Pf,this.depth-20,new Yb(0,0,this.a.Xg,this.a.Of),void 0,{fa:this.close,xa:this},this.f);this.Lh="versions";
this.Gf=new ic;M.d.Na(this.Gf,M.Fc);Rb(this.Gf,this.depth-1);jc(this.Gf,"keyAreaLeft",this.f.x,this.f.y+this.a.Me,this.a.Og,this.a.Uj,76);jc(this.Gf,"keyAreaRight",this.f.x+this.f.width-this.a.Og,this.f.y+this.a.Me,this.a.Og,this.a.Uj,82);jc(this.Gf,"keyAreaCentre",M.ew/2-this.a.Og/2,this.f.y+this.a.Me,this.a.Og,this.a.Uj,67);b=this;this.f.y="inGame"!==this.type?this.canvas.height:-this.f.b.height;jh(this.f,"y",a,this.a.xl,this.a.yl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ab=
!0})};e.tb=function(){var a;this.Ul&&kh();this.cr&&oa(M.af,M.k.Rk());this.dr&&oa(M.lf);for(a=0;a<this.buttons.length;a++)K(I,this.buttons[a]);this.Gf.clear();K(I,this.Gf);K(I,this.Nf);K(I,this.f);M.e.me=null};e.Nb=function(){return!0};e.Mb=function(){return!0};e.bg=function(a){this.Ws&&(67===a?this.Lh="":76===a?this.Lh+="l":82===a&&(this.Lh+="r"),"lrl"===this.Lh&&ph(this))};e.Pc=function(a){a===M.af?(this.Ta(this.f.x,this.f.y),this.cr=!0):a===M.lf?this.dr=!0:a===M.wu&&this.close()};
function xh(){this.depth=-200;this.h=this.visible=!0;M.d.Na(this,M.Yf);var a;this.a=M.a.w.Gn;if("landscape"===M.orientation&&M.a.w.Hn)for(a in M.a.w.Hn)this.a[a]=M.a.w.Hn[a];this.Ec=M.a.w.qc;for(a in M.a.W.Gn)this.a[a]=M.a.W.Gn[a];J(this)}
xh.prototype.Ta=function(){var a,b,c,d;c=this.a.backgroundImage;d=(M.bw-Math.abs(M.va))/c.Yg;this.f.b=new r(d*c.yi,d*c.Yg);w(this.f.b);this.f.y=Math.abs(M.va);a=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,wa(c,0,0),a.restore());c=W.S();A(c,this.a.font);d=M.k.K("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Va(c,d,this.a.em-(c.stroke?c.Ld:0),this.a.ny-(c.stroke?c.Ld:0),!0);a<c.fontSize&&C(c,a);a=M.d.Ga(this.a.At,this.canvas.width,
c.da(d),c.align);b=M.d.Ga(this.a.Bt,this.canvas.height,c.Z(d),c.i);c.p(d,a,b,this.a.em);y(this.f.b);this.f.canvas.$=!0};xh.prototype.ec=function(){var a=this,b=this.a.backgroundImage,b=new r(b.width,b.height);this.f=new fh(this.depth,M.Fc,b);this.f.x=0;this.f.y=Math.abs(M.va);this.Ta();this.button=new Eg(this.a.wq,M.d.g(this.a.Gu,this.canvas.width,this.a.xq),M.d.g(this.a.yq,this.canvas.height,this.Ec[this.a.wq].s.height),this.depth-10,"gameEndScreenBtnText",this.a.xq,function(){K(I,a);uh(M.e)},this.f)};
xh.prototype.tb=function(){K(I,this.f);K(I,this.button)};xh.prototype.Pc=function(a){a!==M.af&&a!==M.lf||this.Ta()};
function jg(a,b,c,d,f,h,k){function l(a,b,c){var d,f;f=M.d.Rn(q.canvas);a=Math.round(q.x+q.parent.x-q.Gd*q.gb);d=Math.round(q.y+q.parent.y-q.Hd*q.kb);if(q.images&&0<q.cg||0<q.uj)q.cg=0,q.uj=0,q.canvas.$=!0;if(q.lj&&q.Ab&&ec(q.qb,a,d,b-f.x,c-f.y))return q.lj=!1,void 0!==q.xa?q.wl.call(q.xa,q):q.wl(q)}function n(a,b,c){var d,f,h;h=M.d.Rn(q.canvas);d=Math.round(q.x+q.parent.x-q.Gd*q.gb);f=Math.round(q.y+q.parent.y-q.Hd*q.kb);if(q.Ab&&ec(q.qb,d,f,b-h.x,c-h.y))return q.lj=!0,q.images&&(1<q.images.length?
(q.cg=1,q.canvas.$=!0):1<q.images[0].G&&(q.uj=1,q.canvas.$=!0)),void 0!==typeof Lf&&G.play(Lf),q.Vf=a,!0}this.depth=c;this.h=this.visible=!0;this.group="TG_Token";M.d.Na(this,M.Fc);this.Hd=this.Gd=0;this.x=a;this.y=b;this.width=f?f[0].width:d.Pa-d.ea;this.height=f?f[0].height:d.sb-d.wa;this.alpha=this.kb=this.gb=1;this.oa=0;this.qb=d;this.images=f;this.uj=this.cg=0;this.lj=!1;this.Ab=!0;this.parent=void 0!==k?k:{x:0,y:0};this.Rl=this.Ql=0;this.nd=!0;this.wl=function(){};this.vc=!1;"object"===typeof h?
(this.wl=h.fa,this.xa=h.xa,this.vc=h.vc):"function"===typeof h&&(this.wl=h);var q=this;this.vc?(this.gh=n,this.hh=l):(this.Mb=n,this.Nb=l);J(this)}function Dg(a,b,c,d,f,h){void 0===a.ua&&(a.ua=[]);a.ua.push({type:b,start:d,ed:f,ob:c,duration:h,m:0})}
function Ig(a){var b,c;if(void 0!==a.ua){for(b=0;b<a.ua.length;b++)if(c=a.ua[b],c.h){switch(c.type){case "xScale":a.gb=c.start+c.ed;break;case "yScale":a.kb=c.start+c.ed;break;case "alpha":a.alpha=c.start+c.ed;break;case "angle":a.oa=c.start+c.ed;break;case "x":a.x=c.start+c.ed;break;case "y":a.y=c.start+c.ed}c.h=!1}a.canvas.$=!0}}function Pg(a,b){a.images=b;a.canvas.$=!0}e=jg.prototype;e.Ts=function(a){this.visible=this.h=a};e.tb=function(){this.images&&(this.canvas.$=!0)};
e.ba=function(a){var b,c;if(void 0!==this.ua){for(b=0;b<this.ua.length;b++)switch(c=this.ua[b],c.m+=a,c.type){case "xScale":var d=this.gb,f=this.Ql;this.gb=c.ob(c.m,c.start,c.ed,c.duration);this.Ql=-(this.images[0].width*this.gb-this.images[0].width*c.start)/2;if(isNaN(this.gb)||isNaN(this.Ql))this.gb=d,this.Ql=f;break;case "yScale":d=this.kb;f=this.Rl;this.kb=c.ob(c.m,c.start,c.ed,c.duration);this.Rl=-(this.images[0].height*this.kb-this.images[0].height*c.start)/2;if(isNaN(this.kb)||isNaN(this.Rl))this.kb=
d,this.Rl=f;break;case "alpha":this.alpha=c.ob(c.m,c.start,c.ed,c.duration);break;case "angle":this.oa=c.ob(c.m,c.start,c.ed,c.duration);break;case "x":d=this.x;this.x=c.ob(c.m,c.start,c.ed,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.ob(c.m,c.start,c.ed,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.$=!0}};
e.Zd=function(){var a,b,c;c=M.d.Rn(this.canvas);a=Math.round(this.x+this.parent.x-this.Gd*this.gb);b=Math.round(this.y+this.parent.y-this.Hd*this.kb);this.lj&&!ec(this.qb,a,b,I.ia[this.Vf].x-c.x,I.ia[this.Vf].y-c.y)&&(this.images&&(this.uj=this.cg=0,this.canvas.$=!0),this.lj=!1)};
e.ya=function(){var a,b;a=Math.round(this.x+this.parent.x-this.Gd*this.gb);b=Math.round(this.y+this.parent.y-this.Hd*this.kb);this.images&&(this.images[this.cg]instanceof r?this.images[this.cg].V(a,b,this.gb,this.kb,this.oa,this.alpha):this.images[this.cg].V(this.uj,a,b,this.gb,this.kb,this.oa,this.alpha));this.nd=!1};
function Eg(a,b,c,d,f,h,k,l){this.ja=M.a.w.qc[a];a=void 0!==M.a.W.buttons?M.a.w.hk[M.a.W.buttons[a]||M.a.W.buttons.default_color]:M.a.w.hk[M.a.w.buttons.default_color];this.font=W.S();a.font&&A(this.font,a.font);this.ja.fontSize&&C(this.font,this.ja.fontSize);this.T=f;this.text=M.k.K(this.T,"<"+f.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.ja.s.height;this.b={source:this.ja.s,Ia:this.ja.Ia,Db:this.ja.Db};f=this.oe(this.b);h=new Yb(0,0,f[0].width,f[0].height);jg.call(this,b,c,d,
h,f,k,l)}M.d.Zi(Eg);e=Eg.prototype;e.Ol=function(a){this.text=M.k.K(this.T,"<"+this.T.toUpperCase()+">");a&&A(this.font,a);Pg(this,this.oe(this.b))};e.zp=function(a,b){this.T=a;this.Ol(b)};e.Aj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&A(this.font,c);a instanceof p?this.b.source=a:void 0!==a.Ia&&void 0!==a.Db&&void 0!==a.source&&(this.b=a);Pg(this,this.oe(this.b))};
e.oe=function(a){var b,c,d,f,h,k,l=a.Ia+a.Db;d=this.height-(this.ja.ud||0);var n=a.source;c=this.font.da(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Va(this.font,this.text,b,d,!0);c<this.ja.fontSize?C(this.font,c):C(this.font,this.ja.fontSize);c=a.Ia;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.ja.td&&(d+=this.ja.td);h=[];for(f=0;f<n.G;f++)k=new r(b+l,this.height),w(k),n.Ha(f,0,0,a.Ia,this.height,0,0,1),n.yk(f,a.Ia,0,n.width-l,this.height,a.Ia,0,b,this.height,1),n.Ha(f,a.Ia+n.width-l,0,a.Db,this.height,a.Ia+b,0,1),this.font.p(this.text,c,d,b),y(k),h.push(k);return h};e.Pc=function(a){a===M.af&&this.Ol()};
function mh(a,b,c,d,f,h,k,l){this.ja=M.a.w.qc[a];void 0!==h&&(this.width=h);this.height=this.ja.s.height;this.Rd={source:this.ja.s,Ia:this.ja.Ia,Db:this.ja.Db};this.b=f;a=this.oe();f=new Yb(0,0,a[0].width,a[0].height);jg.call(this,b,c,d,f,a,k,l)}M.d.Zi(mh);
mh.prototype.oe=function(){var a,b,c,d,f,h,k,l=this.Rd.Ia+this.Rd.Db;b=this.height-(this.ja.ud||0);var n=this.Rd.source;void 0===this.width?a=this.b.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.b.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.b.width))));k=Math.min(a/this.b.width,b/this.b.height);k=Math.min(k,1);f=Math.round(this.Rd.Ia+
(a-this.b.width*k)/2);h=Math.round((b-this.b.height*k)/2);c=[];for(b=0;b<n.G;b++){d=new r(a+l,this.height);w(d);n.Ha(b,0,0,this.Rd.Ia,this.height,0,0,1);n.yk(b,this.Rd.Ia,0,n.width-l,this.height,this.Rd.Ia,0,a,this.height,1);n.Ha(b,this.Rd.Ia+n.width-l,0,this.Rd.Db,this.height,this.Rd.Ia+a,0,1);try{m.context.drawImage(this.b,f,h,this.b.width*k,this.b.height*k)}catch(q){}y(d);c.push(d)}return c};M.d.Zi(function(a,b,c,d,f,h,k){jg.call(this,a,b,c,f,d,h,k)});
function Ag(a,b,c,d,f,h,k,l){var n;this.ja=M.a.w.qc[a];a=void 0!==M.a.W.buttons?M.a.w.hk[M.a.W.buttons[a]||M.a.W.buttons.default_color]:M.a.w.hk[M.a.w.buttons.default_color];this.font=W.S();a.font&&A(this.font,a.font);this.ja.fontSize&&C(this.font,this.ja.fontSize);void 0!==h&&(this.width=h);this.height=this.ja.s.height;this.ca=this.ja.ca;if(this.ca.length){for(h=0;h<this.ca.length;h++)if(this.ca[h].id===f){this.Sa=h;break}void 0===this.Sa&&(this.Sa=0);this.text=M.k.K(this.ca[this.Sa].T,"<"+this.ca[this.Sa].id.toUpperCase()+
">");this.Ag=this.ca[this.Sa].s;h=this.oe();a=new Yb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?f=function(){n.lg();return k(n.ca[n.Sa].id)}:"object"===typeof k?(f={},f.vc=k.vc,f.xa=this,f.fa=function(){n.lg();return k.fa.call(k.xa,n.ca[n.Sa].id)}):f=function(){n.lg()};jg.call(this,b,c,d,a,h,f,l)}}M.d.Zi(Ag);e=Ag.prototype;
e.lg=function(a){var b;if(void 0===a)this.Sa=(this.Sa+1)%this.ca.length;else for(b=0;b<this.ca.length;b++)if(this.ca[b].id===a){this.Sa=b;break}this.Aj(this.ca[this.Sa].s,M.k.K(this.ca[this.Sa].T,"<"+this.ca[this.Sa].id.toUpperCase()+">"))};e.Ol=function(a){a&&A(this.font,a);this.text=M.k.K(this.ca[this.Sa].T,"<"+this.ca[this.Sa].id.toUpperCase()+">");Pg(this,this.oe())};e.Aj=function(a,b,c){this.text=b;this.Ag=a;c&&A(this.font,c);Pg(this,this.oe())};
e.oe=function(){var a,b,c,d,f,h,k=this.ja.Ia,l=this.ja.Db,n=k+l;f=Math.abs(k-l);d=this.height-(this.ja.ud||0);var q=this.ja.s,u=this.font.S();b=u.da(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Va(u,this.text,a,d,!0);d<u.fontSize&&C(u,d);b=u.da(this.text,
a);d=k;c=u.align;"center"===c?d=a-f>=b?d+Math.round((a-f)/2):d+(this.ja.sg+Math.round(b/2)):"left"===c?d+=this.ja.sg:"right"===c&&(d+=a);f=Math.round(this.height/2);void 0!==this.ja.td&&(f+=this.ja.td);c=[];for(b=0;b<q.G;b++)h=new r(a+n,this.height),w(h),q.Ha(b,0,0,k,this.height,0,0,1),q.yk(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.Ha(b,k+q.width-n,0,l,this.height,k+a,0,1),this.Ag.p(0,this.ja.Hh,this.ja.Ih),u.p(this.text,d,f,a),y(h),c.push(h);return c};e.Pc=function(a){a===M.af&&this.Ol()};
function nh(a,b,c,d,f,h,k){var l;this.ca=M.a.w.qc[a].ca;if(this.ca.length){for(a=0;a<this.ca.length;a++)if(this.ca[a].id===f){this.Sa=a;break}void 0===this.Sa&&(this.Sa=0);this.Ag=this.ca[this.Sa].s;a=new $b(this.Ag);l=this;f="function"===typeof h?function(){l.lg();return h(l.ca[l.Sa].id)}:"object"===typeof h?{xa:this,fa:function(){l.lg();return h.fa.call(h.xa,l.ca[l.Sa].id)}}:function(){l.lg()};jg.call(this,b,c,d,a,[this.Ag],f,k)}}M.d.Zi(nh);
nh.prototype.lg=function(a){var b;if(void 0===a)this.Sa=(this.Sa+1)%this.ca.length;else for(b=0;b<this.ca.length;b++)if(this.ca[b].id===a){this.Sa=b;break}this.Aj(this.ca[this.Sa].s)};nh.prototype.Aj=function(a){this.Ag=a;Pg(this,[].concat(this.Ag))};
function yh(a,b,c,d){this.depth=10;this.visible=!1;this.h=!0;M.d.Na(this,M.Fc);var f;this.a=M.a.w.fl;if("landscape"===M.orientation&&M.a.w.mo)for(f in M.a.w.mo)this.a[f]=M.a.w.mo[f];for(f in M.a.W.fl)this.a[f]=M.a.W.fl[f];this.eo=a;this.Um=b;this.fa=c;this.xa=d;this.hj="entering";this.Lt=!1;J(this,!1);Sb(this,"LevelStartDialog")}
function zh(a){var b,c,d,f,h;if("leaving"!==a.hj){a.hj="leaving";a.Jf=0;b=function(){K(I,a);a.xa?a.fa.call(a.xa):a.fa&&a.fa()};if(void 0!==a.a.No)for(c=0;c<a.a.No.length;c++)d=a.a.No[c],f=void 0,d.rq&&(a.Jf++,f=b),h=d.end,"x"===d.type?h=M.d.g(h,a.canvas.width,a.f.b.width):"y"===d.type&&(h=M.d.g(h,a.canvas.height,a.f.b.height)+Math.abs(M.va)),jh(a.f,d.type,h,d.duration,d.ob,f,d.Qa,d.loop,d.uo);0===a.Jf&&b()}}e=yh.prototype;
e.ec=function(){var a,b,c,d,f,h,k=this;a=this.a.pd;b=a.width;f=a.height;this.f=new fh(this.depth+10,this.Ua,new r(b,f));w(this.f.b);a.p(0,0,0);""!==this.Um&&(c=M.d.g(this.a.uu,b,0),d=M.d.g(this.a.gq,f,0),a=W.S(),A(a,this.a.eq),void 0!==this.a.qi&&void 0!==this.a.fq&&(h=Va(a,this.Um,this.a.qi,this.a.fq,this.a.qi),a.fontSize>h&&C(a,h)),a.p(this.Um,c,d,this.a.qi));""!==this.eo&&(c=M.d.g(this.a.Av,b,0),d=M.d.g(this.a.tr,f,0),a=W.S(),A(a,this.a.rr),void 0!==this.a.Vi&&void 0!==this.a.sr&&(h=Va(a,this.eo,
this.a.Vi,this.a.sr,this.a.Vi),a.fontSize>h&&C(a,h)),a.p(this.eo,c,d,this.a.Vi));y(this.f.b);this.f.x=M.d.g(this.a.As,this.canvas.width,b);this.f.y=M.d.g(this.a.Bs,this.canvas.height,f)+Math.abs(M.va);this.Jf=0;a=function(){k.Jf--;0===k.Jf&&(k.hj="paused")};if(void 0!==this.a.zl)for(b=0;b<this.a.zl.length;b++)f=this.a.zl[b],c=void 0,f.rq&&(this.Jf++,c=a),d=f.end,"x"===f.type?d=M.d.g(d,this.canvas.width,this.f.b.width):"y"===f.type&&(d=M.d.g(d,this.canvas.height,this.f.b.height)+Math.abs(M.va)),jh(this.f,
f.type,d,f.duration,f.ob,c,f.Qa,f.loop,f.uo),void 0!==f.Hb&&G.play(f.Hb);0===this.Jf&&(this.hj="paused");this.m=0};e.tb=function(){K(I,this.f)};e.ba=function(a){"paused"!==this.state&&(this.m+=a,this.m>=this.a.Ds&&zh(this))};e.Mb=function(){return this.Lt=!0};e.Nb=function(){this.Lt&&"paused"===this.hj&&zh(this);return!0};
function fh(a,b,c){this.depth=a;this.h=this.visible=!0;M.d.Na(this,b);this.b=c;this.Ub=0;this.width=c.width;this.height=c.height;this.Hd=this.Gd=this.y=this.x=0;this.kb=this.gb=1;this.oa=0;this.alpha=1;this.Eb=[];this.dq=0;this.parent={x:0,y:0};this.nd=!0;J(this,!1)}
function jh(a,b,c,d,f,h,k,l,n){var q,u=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.gb;break;case "yScale":q=a.kb;break;case "scale":b="xScale";q=a.gb;jh(a,"yScale",c,d,f,void 0,k,l,n);break;case "angle":q=a.oa;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.Eb.push({id:a.dq,m:0,h:!0,uk:u,type:b,start:q,end:c,Fb:h,duration:d,ob:f,Qa:k,loop:l,uo:n});a.dq++}
function Ug(a){var b;for(b=a.Eb.length-1;0<=b;b--){switch(a.Eb[b].type){case "x":a.x=a.Eb[b].end;break;case "y":a.y=a.Eb[b].end;break;case "xScale":a.gb=a.Eb[b].end;break;case "yScale":a.kb=a.Eb[b].end;break;case "angle":a.oa=a.Eb[b].end;break;case "alpha":a.alpha=a.Eb[b].end;break;case "subImage":a.Ub=a.Eb[b].end}"function"===typeof a.Eb[b].Fb&&a.Eb[b].Fb.call(a)}}
fh.prototype.ba=function(a){var b,c,d;for(b=0;b<this.Eb.length;b++)if(c=this.Eb[b],c.h&&(c.m+=a,c.uk&&c.m>=c.Qa&&(c.m%=c.Qa,c.uk=!1),!c.uk)){c.m>=c.duration?(d=c.end,c.loop?(c.uk=!0,c.Qa=c.uo,c.m%=c.duration):("function"===typeof c.Fb&&c.Fb.call(this),this.Eb[b]=void 0)):"subImage"===c.type?(d=this.b instanceof Array?this.b.length:this.b.G,d=Math.floor(c.m*d/c.duration)):d=c.ob(c.m,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.gb=
d;break;case "yScale":this.kb=d;break;case "angle":this.oa=d;break;case "alpha":this.alpha=d;break;case "subImage":this.Ub=d}this.canvas.$=!0}for(b=this.Eb.length-1;0<=b;b--)void 0===this.Eb[b]&&this.Eb.splice(b,1)};
fh.prototype.ya=function(){var a,b,c;b=Math.round(this.x-this.gb*this.Gd)+this.parent.x;c=Math.round(this.y-this.kb*this.Hd)+this.parent.y;a=this.b;a instanceof Array&&(a=this.b[this.Ub%this.b.length]);a instanceof r?a.V(b,c,this.gb,this.kb,this.oa,this.alpha):a.V(this.Ub,b,c,this.gb,this.kb,this.oa,this.alpha);this.nd=!1};
function Zg(a,b,c,d,f,h,k,l,n,q,u){this.depth=f;this.visible=!0;this.h=!1;M.d.Na(this,M.Fc);this.x=a;this.y=b;this.wo=l;this.xo="object"===typeof n?n.top:n;this.fw="object"===typeof n?n.bottom:n;this.da=c;this.Z=d;this.width=this.da+2*this.wo;this.height=this.Z+this.xo+this.fw;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof u?u:function(a){return a+""};this.alpha=1;this.Tb=this.Sb=this.Hd=this.Gd=0;c=new r(this.width,this.height);this.Qg=new fh(this.depth,this.Ua,
c);this.Qg.x=a-this.wo;this.Qg.y=b-this.xo;this.Qg.parent=q;this.N=this.Qg.b;this.jf();J(this)}Zg.prototype.tb=function(){K(I,this.Qg)};function ih(a,b,c){a.h=!0;a.Hf=a.value;a.value=a.Hf;a.end=b;a.duration=c;a.ob=L;a.m=0}
Zg.prototype.jf=function(){var a,b;a=this.font.align;b=this.font.i;var c=this.wo,d=this.xo;this.kq||(this.N.clear(),this.canvas.$=!0);w(this.N);this.kq&&this.kq.Ha(0,this.Ry,this.Sy,this.Qy,this.Py,0,0,1);"center"===a?c+=Math.round(this.da/2):"right"===a&&(c+=this.da);"middle"===b?d+=Math.round(this.Z/2):"bottom"===b&&(d+=this.Z);b=this.toString(this.value);a=Va(this.font,b,this.da,this.Z,!0);a<this.font.fontSize&&C(this.font,a);this.font.p(b,c,d,this.da);y(this.N);this.Qg.nd=!0};
Zg.prototype.ba=function(a){var b;b=Math.round(this.ob(this.m,this.Hf,this.end-this.Hf,this.duration));this.m>=this.duration?(this.value=this.end,this.h=!1,this.jf()):b!==this.value&&(this.value=b,this.jf());this.m+=a};function Ah(a,b,c){this.depth=-100;this.visible=!1;this.h=!0;this.jx=a;M.d.Na(this,M.Fc);this.a=M.a.w.ln;this.Ec=M.a.w.qc;this.zq=b;for(var d in M.a.W.ln)this.a[d]=M.a.W.ln[d];this.Oo=!1!==c;J(this)}e=Ah.prototype;e.It=function(){};
e.ni=function(a,b,c,d,f){b=new Eg("default_text",b,c,this.depth-20,a.T||"NO_TEXT_KEY_GIVEN",d,{fa:function(){a.fa&&(a.xa?a.fa.call(a.xa,a):a.fa(a))},xa:this},this.f);this.buttons.push(b);a.text&&b.Aj(b.b,a.text);this.buttons[this.buttons.length-1].Ab=f||!1};
e.Ta=function(a,b,c){w(this.f.b);m.clear();this.a.backgroundImage.p(0,0,0);a=c?c:this.jx;b=W.S();this.a.Ks&&A(b,this.a.Ks);c=Va(b,a,this.a.So,this.a.Ro,!0);c<b.fontSize&&C(b,c);c=b.da(a,this.a.So)+10;var d=b.Z(a,this.a.Ro)+10;b.p(a,M.d.Ga(this.a.ox,this.f.b.width,c,b.align),M.d.Ga(this.a.px,this.f.b.height-Bh(this),d,b.i),c);y(this.f.b)};function Bh(a){var b=a.zq;return M.d.g(a.a.Wg,a.f.b.height,a.Ec.default_text.s.height*b.length+a.a.Sd*(b.length-1))}
e.Ef=function(a,b){var c,d,f,h,k,l,n,q,u,B=[],B=this.zq;f=this.Ec.default_text.s.height;h=this.a.jk;k=M.d.g(this.a.ik,this.canvas.width,h)-a;q=Bh(this);for(c=B.length-1;0<=c;c--){n=k;u=h;if("object"===typeof B[c]&&B[c].hasOwnProperty("length")&&B[c].length)for(l=B[c],u=(h-(l.length-1)*this.a.Sd)/l.length,d=0;d<l.length;d++)this.ni(l[d],n,q,u,b),n+=u+this.a.Sd;else this.ni(B[c],n,q,u,b);q-=f+this.a.Sd}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Ts(!0);this.f.visible=!0};e.close=function(){K(I,this);return this.canvas.$=!0};function Ch(a){var b=M.e.Re;b.Ta(b.f.x,b.f.y,a);for(a=0;a<b.buttons.length;a++)K(I,b.buttons[a]);b.canvas.$=!0}
e.ec=function(){var a,b;this.Oo&&eh(this);a=this.a.backgroundImage;this.f=new fh(this.depth-10,this.Ua,new r(a.width,a.height));this.f.x=M.d.g(this.a.zc,this.canvas.width,a.width);a=M.d.g(this.a.Rb,this.canvas.height,a.height)+-1*("landscape"===M.orientation?M.a.w.lk:M.a.w.Td).ol;this.f.y=a;this.Ta(this.f.x,this.f.y);this.buttons=[];this.Ef(this.f.x);b=this;this.f.y=-this.f.b.height;jh(this.f,"y",a,this.a.xl,this.a.yl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ab=!0})};
e.tb=function(){var a;this.Oo&&kh();for(a=0;a<this.buttons.length;a++)K(I,this.buttons[a]);K(I,this.f);M.e.me===this&&(M.e.me=null)};e.Nb=function(){return!0};e.Mb=function(){return!0};
function Dh(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,f=0;c=d=0;for(var f=a.length,h=0;h<f;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,f));return b}
function xg(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,f,h,l){a=k(a,k(k(c^(b|~d),f),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,f,h,l){a=k(a,k(k(b^c^d,f),l));return k(a<<h|a>>>32-h,b)}function f(a,b,c,d,f,h,l){a=k(a,k(k(b&d|c&~d,f),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,f,h,l){a=k(a,k(k(b&c|~b&d,f),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,f,h,k;f=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^f^h:c|d?k&1073741824?k^3221225472^f^h:k^1073741824^f^h:k^f^h}var l=[],n,q,u,B,D,s,t,v,x;a=Dh(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),f=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,f[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;f[b]|=128<<k%4*8;f[d-2]=c<<3;f[d-1]=c>>>29;return f}(a);s=1732584193;t=4023233417;v=2562383102;x=271733878;a=l.length;for(n=0;n<a;n+=16)q=s,u=t,B=v,D=x,s=h(s,t,v,x,l[n+
0],7,3614090360),x=h(x,s,t,v,l[n+1],12,3905402710),v=h(v,x,s,t,l[n+2],17,606105819),t=h(t,v,x,s,l[n+3],22,3250441966),s=h(s,t,v,x,l[n+4],7,4118548399),x=h(x,s,t,v,l[n+5],12,1200080426),v=h(v,x,s,t,l[n+6],17,2821735955),t=h(t,v,x,s,l[n+7],22,4249261313),s=h(s,t,v,x,l[n+8],7,1770035416),x=h(x,s,t,v,l[n+9],12,2336552879),v=h(v,x,s,t,l[n+10],17,4294925233),t=h(t,v,x,s,l[n+11],22,2304563134),s=h(s,t,v,x,l[n+12],7,1804603682),x=h(x,s,t,v,l[n+13],12,4254626195),v=h(v,x,s,t,l[n+14],17,2792965006),t=h(t,v,
x,s,l[n+15],22,1236535329),s=f(s,t,v,x,l[n+1],5,4129170786),x=f(x,s,t,v,l[n+6],9,3225465664),v=f(v,x,s,t,l[n+11],14,643717713),t=f(t,v,x,s,l[n+0],20,3921069994),s=f(s,t,v,x,l[n+5],5,3593408605),x=f(x,s,t,v,l[n+10],9,38016083),v=f(v,x,s,t,l[n+15],14,3634488961),t=f(t,v,x,s,l[n+4],20,3889429448),s=f(s,t,v,x,l[n+9],5,568446438),x=f(x,s,t,v,l[n+14],9,3275163606),v=f(v,x,s,t,l[n+3],14,4107603335),t=f(t,v,x,s,l[n+8],20,1163531501),s=f(s,t,v,x,l[n+13],5,2850285829),x=f(x,s,t,v,l[n+2],9,4243563512),v=f(v,
x,s,t,l[n+7],14,1735328473),t=f(t,v,x,s,l[n+12],20,2368359562),s=d(s,t,v,x,l[n+5],4,4294588738),x=d(x,s,t,v,l[n+8],11,2272392833),v=d(v,x,s,t,l[n+11],16,1839030562),t=d(t,v,x,s,l[n+14],23,4259657740),s=d(s,t,v,x,l[n+1],4,2763975236),x=d(x,s,t,v,l[n+4],11,1272893353),v=d(v,x,s,t,l[n+7],16,4139469664),t=d(t,v,x,s,l[n+10],23,3200236656),s=d(s,t,v,x,l[n+13],4,681279174),x=d(x,s,t,v,l[n+0],11,3936430074),v=d(v,x,s,t,l[n+3],16,3572445317),t=d(t,v,x,s,l[n+6],23,76029189),s=d(s,t,v,x,l[n+9],4,3654602809),
x=d(x,s,t,v,l[n+12],11,3873151461),v=d(v,x,s,t,l[n+15],16,530742520),t=d(t,v,x,s,l[n+2],23,3299628645),s=c(s,t,v,x,l[n+0],6,4096336452),x=c(x,s,t,v,l[n+7],10,1126891415),v=c(v,x,s,t,l[n+14],15,2878612391),t=c(t,v,x,s,l[n+5],21,4237533241),s=c(s,t,v,x,l[n+12],6,1700485571),x=c(x,s,t,v,l[n+3],10,2399980690),v=c(v,x,s,t,l[n+10],15,4293915773),t=c(t,v,x,s,l[n+1],21,2240044497),s=c(s,t,v,x,l[n+8],6,1873313359),x=c(x,s,t,v,l[n+15],10,4264355552),v=c(v,x,s,t,l[n+6],15,2734768916),t=c(t,v,x,s,l[n+13],21,
1309151649),s=c(s,t,v,x,l[n+4],6,4149444226),x=c(x,s,t,v,l[n+11],10,3174756917),v=c(v,x,s,t,l[n+2],15,718787259),t=c(t,v,x,s,l[n+9],21,3951481745),s=k(s,q),t=k(t,u),v=k(v,B),x=k(x,D);return(b(s)+b(t)+b(v)+b(x)).toLowerCase()}var gh;
function Eh(a,b){var c=M.A.Yk.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(f){}}function Fh(a){Eh("call=api_is_valid",function(b){a(b.is_valid)})}
function hh(a,b){Eh("call=is_highscore&score="+a,function(a){0<=a.position?(gh=a.code,b(void 0!==gh)):b(!1)})}
TG_StatObjectFactory={mz:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},kz:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,Gh(),Gh(),!0)},jz:function(a,b,c,d,f){return new TG_StatObject(a,b,c,0,d,f,!0,"max"===M.o.Zg?function(a){return a+d}:function(a){return a-d})},lz:function(a,b,c,d,f){return new TG_StatObject(a,b,c,0,d,f,!0,"max"===M.o.Zg?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,f,h,k,l,n){this.id=a;this.type=b;this.key=c;this.jd=d;this.ng=void 0!==f?f:this.jd;this.visible=void 0!==h?h:!0;this.Se=void 0!==k?k:this.jd!==this.ng;this.vf=l;this.Zl=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return M.d.up(1E3*a)}}};
TG_StatObject.prototype.S=function(){return new TG_StatObject(this.id,this.type,this.key,this.jd,this.ng,this.visible,this.Se,this.vf,this.Zl)};M.version=M.version||{};M.version.tg="2.13.0";function Hh(a,b,c,d,f,h,k,l){this.depth=c;this.h=this.visible=!0;this.group="Floater";this.x=a;this.y=b;this.N=d;this.Xt=f;this.kj=h;this.Lb=k;this.scale=this.state=this.m=0;this.alpha=1;this.wx=l||vc;M.d.Na(this,M.eh);"undefined"===typeof this.canvas&&(this.canvas=M.ae);J(this)}
Hh.prototype.tb=function(){this.canvas.$=!0};Hh.prototype.ba=function(a){this.m+=a;0===this.state?this.m>=this.kj?(this.state=this.scale=1,this.m=0):(this.y+=this.Xt*a/1E3,this.scale=this.wx(this.m,0,1,this.kj)):(this.m>=this.Lb&&K(I,this),this.y+=this.Xt*a/1E3,this.alpha=1-this.m/this.Lb);this.canvas.$=!0};Hh.prototype.ya=function(){this.N.V(this.x-this.N.width*this.scale/2,this.y-this.N.height*this.scale/2,this.scale,this.scale,0,this.alpha)};
function Ih(a){this.depth=1E3;this.h=this.visible=!1;this.group=a;J(this)}function Jh(a,b,c,d,f,h,k,l){var n;if(l&&l.hasOwnProperty(b))return new Hh(c,d,-450,l[b],f,200,h,k);n=new r(a.da(b)+10+50,a.Z(b)+50);w(n);a.align="left";a.i="top";a.p(b,30,25);y(n);l&&(l[b]=n);return new Hh(c,d,-450,n,f,200,h,k)}Ih.prototype.Uo=function(){var a,b;a=Tb(I,function(a){return"Floater"===a.group});for(b=0;b<a.length;b+=1)K(I,a[b])};
Ih.prototype.ec=function(){var a,b,c,d,f,h;this.fv=[];b=[R,S,U,V];a=[M.k.K("Floater1","<FLOATER_1>"),M.k.K("Floater2","<FLOATER_2>"),M.k.K("Floater3","<FLOATER_3>"),M.k.K("Floater4","<FLOATER_4>")];for(c=0;c<b.length;c+=1)d=b[c],f=a[Math.min(c,a.length)],h=new r(d.da(f)+10,d.Z(f)),w(h),d.align="left",d.i="top",d.p(f,5,0),y(h),this.fv.push(h)};Ih.prototype.tb=function(){this.Uo()};
var Y={wt:{},xt:{},yt:{},zt:{},Go:{},Ho:{},hy:{},Fv:{},mu:function(){Y.wt={wc:Y.tk,update:Y.re,sc:Y.pe,end:Y.qe,font:Oe,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.xt={wc:Y.tk,update:Y.re,sc:Y.pe,end:Y.qe,font:Pe,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.yt={wc:Y.tk,update:Y.re,sc:Y.pe,end:Y.qe,font:Qe,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.zt={wc:Y.tk,update:Y.re,sc:Y.pe,end:Y.qe,font:Re,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],
[.1,.8,.1])};Y.Go={wc:Y.Pu,update:Y.re,sc:Y.pe,end:Y.qe,Ki:Se,Ji:Te,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.Ho={wc:Y.Qu,update:Y.re,sc:Y.pe,end:Y.qe,Ki:Se,Ji:Te,margin:20,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.hy={wc:Y.Ru,update:Y.re,sc:Y.pe,end:Y.qe,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])};Y.Fv={wc:Y.Ou,update:Y.re,sc:Y.pe,end:Y.qe,Vd:L,Wd:L,Ud:yc([oc,kc,oc],[!1,!1,!0],[.1,.8,.1])}},fz:function(a){function b(a){var d,f={};for(d in a)f[d]="object"===
typeof a[d]&&null!==a[d]?b(a[d]):a[d];return f}return b(a)},wB:function(a){Y.wt.font.J=a;Y.xt.font.J=a;Y.yt.font.J=a;Y.zt.font.J=a},vB:function(a){Y.Go.Ki.J=a;Y.Go.Ji.J=a;Y.Ho.Ki.J=a;Y.Ho.Ji.J=a},Oh:!1,Cc:[],uB:function(a){Y.Oh=a},Mz:function(){return Y.Oh},sx:function(a){var b,c;for(b=0;b<Y.Cc.length;b+=1)c=Y.Cc[b],void 0===c||void 0!==a&&c.kind!==a||0<c.uh||(Y.Cc[b]=void 0)},lu:function(){Y.Oh=!1;Y.Cc=[]},Qh:function(a,b,c,d){var f,h,k;void 0===d&&(d=Y.Oh);if(d)for(h=0;h<Y.Cc.length;h+=1)if(f=Y.Cc[h],
void 0!==f&&f.$e&&f.kind===a&&f.font===b&&f.text===c)return f.uh+=1,h;f={kind:a,font:b,text:c,uh:1,$e:d};h=b.align;k=b.i;E(b,"center");F(b,"middle");d=b.da(c)+2*a.margin;a=b.Z(c)+2*a.margin;f.N=new r(d,a);w(f.N);b.p(c,d/2,a/2);y(f.N);E(b,h);F(b,k);for(h=0;h<Y.Cc.length;h+=1)if(void 0===Y.Cc[h])return Y.Cc[h]=f,h;Y.Cc.push(f);return Y.Cc.length-1},ku:function(a){var b=Y.Cc[a];b.uh-=1;0>=b.uh&&!b.$e&&(Y.Cc[a]=void 0)},tk:function(a){a.buffer=Y.Qh(a.kind,a.kind.font,a.value,a.$e)},Pu:function(a){var b=
a.value.toString();a.buffer=0<=a.value?Y.Qh(a.kind,a.kind.Ki,b,a.$e):Y.Qh(a.kind,a.kind.Ji,b,a.$e)},Qu:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?Y.Qh(a.kind,a.kind.Ki,b,a.$e):Y.Qh(a.kind,a.kind.Ji,b,a.$e)},Ru:function(a){a.N=a.value},Ou:function(a){a.b=a.value;a.Ub=0},re:function(a){a.x=void 0!==a.kind.Vd?a.kind.Vd(a.time,a.Xl,a.Wq-a.Xl,a.duration):a.Xl+a.time/a.duration*(a.Wq-a.Xl);a.y=void 0!==a.kind.Wd?a.kind.Wd(a.time,a.Yl,a.Xq-a.Yl,a.duration):a.Yl+a.time/
a.duration*(a.Xq-a.Yl);void 0!==a.kind.Tq&&(a.Sb=a.kind.Tq(a.time,0,1,a.duration));void 0!==a.kind.Uq&&(a.Tb=a.kind.Uq(a.time,0,1,a.duration));void 0!==a.kind.Ud&&(a.alpha=a.kind.Ud(a.time,0,1,a.duration));void 0!==a.kind.Wu&&(a.oa=a.kind.Wu(a.time,0,360,a.duration)%360);void 0!==a.b&&(a.Ub=a.time*a.b.G/a.duration)},pe:function(a){var b=m.context,c;void 0!==a.b&&null!==a.images?1===a.Sb&&1===a.Tb&&0===a.oa?a.b.hd(Math.floor(a.Ub),a.x,a.y,a.alpha):a.b.V(Math.floor(a.Ub),a.x,a.y,a.Sb,a.Tb,a.oa,a.alpha):
(c=void 0!==a.N&&null!==a.N?a.N:Y.Cc[a.buffer].N,1===a.Sb&&1===a.Tb&&0===a.oa?c.hd(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Sb)||1E-4>Math.abs(a.Tb)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.oa*Math.PI/180),b.scale(a.Sb,a.Tb),c.hd(-c.width/2,-c.height/2,a.alpha),b.restore()))},qe:function(a){void 0!==a.buffer&&Y.ku(a.buffer)},Zd:function(a){var b,c,d=!1;for(b=0;b<Y.Kb.length;b+=1)c=Y.Kb[b],void 0!==c&&(0<c.Qa?(c.Qa-=a,0>c.Qa&&(c.time+=-c.Qa,c.Qa=0)):c.time+=a,0<c.Qa||(c.time>=c.duration?
(c.kind.end(c),Y.Kb[b]=void 0):c.kind.update(c),d=!0));d&&(Y.canvas.$=!0)},ya:function(){var a,b;for(a=0;a<Y.Kb.length;a+=1)b=Y.Kb[a],void 0!==b&&(0<b.Qa||b.kind.sc(b))},Kb:[],Uz:function(a,b,c){Y.Yu();void 0===a&&(a=M.eh);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);Y.visible=!0;Y.h=!0;M.d.Na(Y,a);Y.depth=b;J(Y);Sb(Y,c);Y.lu();Y.mu()},Gy:function(a,b,c,d,f,h,k,l,n){void 0===l&&(l=void 0!==a.Qa?a.Qa:0);void 0===n&&(n=Y.Oh);void 0===f&&void 0!==a.Iw&&(f=c+a.Iw);void 0===h&&void 0!==a.Jw&&(h=d+a.Jw);
void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Xl:c,Yl:d,Wq:f,Xq:h,x:c,y:d,Sb:1,Tb:1,alpha:1,oa:0,time:0,duration:k,Qa:l,$e:n};a.kind.wc(a);for(b=0;b<Y.Kb.length;b+=1)if(void 0===Y.Kb[b])return Y.Kb[b]=a,b;Y.Kb.push(a);return Y.Kb.length-1},$A:function(a){var b;0>a||a>=Y.Kb.length||(b=Y.Kb[a],void 0!==b&&(b.kind.end(b),Y.Kb[a]=void 0))},Uo:function(){var a,b;for(a=0;a<Y.Kb.length;a+=1)b=Y.Kb[a],void 0!==b&&(b.kind.end(b),Y.Kb[a]=void 0);Y.Kb=[]},Yu:function(){Y.Uo();Y.sx();K(I,
Y)}};function Kh(a){this.depth=-99;M.d.Na(this,M.Fc);this.h=!0;this.visible=!1;this.e=a;J(this)}Kh.prototype.ih=function(){};Kh.prototype.bg=function(){};Kh.prototype.Mb=function(a,b,c){a:{var d=this.e,f;for(f=0;f<d.Yc.length;++f)if(d.Yc[f].Mb&&d.Yc[f].Mb(a,b,c)){a=!0;break a}a=!1}return a};
Kh.prototype.Nb=function(a,b,c){var d;a:if(d=this.e,d.wb&&a===d.Cp)a=d.wb.a.x,b=d.wb.a.y,d.wb.Ko&&(a=d.wb.Ko.x,b=d.wb.Ko.y),Lh?console.log("Component:\n x: tgScale("+(a+d.wb.Dg.x-Mh)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.wb.Dg.y-Nh)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.wb.Dg.x)+"),\n y: tgScale("+(b+d.wb.Dg.y)+"),"),d.Tt=!1,d=!0;else{for(var f=0;f<d.Yc.length;++f)if(d.Yc[f].Nb&&d.Yc[f].Nb(a,b,c)){d=!0;break a}d=!1}return d};
function Oh(){this.Ua=this.depth=0;this.on=this.ic=this.h=this.visible=!1;this.Yc=[];this.Fk={};this.Fk.Ce=!1;this.Yq={};this.paused=this.Yq.Ce=!1;this.by=new r(0,0);this.dy=this.cy=0;this.wb=null;this.Cp=this.Vt=this.Ut=-1;this.Tt=!1;this.Qb=this.Pb=0;this.bl=null}e=Oh.prototype;e.ec=function(){this.bl=new Kh(this)};e.tb=function(){this.bl&&(K(I,this.bl),this.bl=null)};
function Ph(a,b,c){for(var d in b){var f=b[d];f.b?c[d]=new Qh(a,f):f.Ct?c[d]=new Rh(a,M.k.K(f.Ct,"<"+f.Ct+">"),f):f.T?c[d]=new Rh(a,M.k.K(f.T,"<"+f.T+">"),f):f.text&&(c[d]=new Rh(a,f.text,f))}}function Sh(a,b){a.Ce&&(a.m+=b,a.m>=a.duration&&(a.Ce=!1,a.Fb&&a.Fb()))}
e.ba=function(a){Sh(this.Fk,a);Sh(this.Yq,a);for(var b=0;b<this.Yc.length;++b)this.Yc[b].ba(a);if(this.wb&&this.Tt){a=I.ia[this.Cp].x;b=I.ia[this.Cp].y;this.canvas===M.d.ag(M.Zf)&&this.wb.Tk(this.Pb+M.$f,this.Qb+M.Ye);var c=a-this.Ut,d=b-this.Vt;this.wb.x+=c;this.wb.y+=d;this.wb.Dg.x+=c;this.wb.Dg.y+=d;this.Ut=a;this.Vt=b;this.ic=!0}};e.Zd=function(){if(this.ic){var a=M.d.ag(M.Zf);this.canvas!==a?this.canvas.$=this.ic:(m.sa(a),this.ya())}};
e.Ak=function(a,b){for(var c=M.d.ag(M.Zf)===this.canvas,d=0;d<this.Yc.length;++d){var f=this.Yc[d];f.visible&&(c&&f.Tk(a,b),f.ya(a,b))}};e.ya=function(){var a=0,b=0;M.d.ag(M.Pk)!==this.canvas&&(a=M.$f,b=M.Ye);this.paused?this.by.p(this.cy+this.Pb+a,this.dy+this.Qb+b):this.Ak(this.Pb+a,this.Qb+b);this.ic=!1};function Th(){this.fo=[];this.Zq=[];this.Us=null;this.Xj=void 0;this.En=!0}
function Uh(a){function b(a,b){if(!b)return!1;var f=0;if("string"===typeof a){if(d(a))return!1}else for(f=0;f<a.length;++f)if(d(a[f]))return!1;if(b.rz){if("string"===typeof a){if(c(a))return!0}else for(f=0;f<a.length;++f)if(c(a[f]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var f;if(a instanceof Th){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
f=a}else f=new Th,f.fo=arguments[0],f.Zq=arguments[1],f.Us=arguments[2];var h=null,k=null,l=null,h=f.fo,k=f.Zq,l=f.Us;this.vh=f;void 0===this.vh.Xj&&(this.vh.Xj=!zg(M.e));Oh.apply(this,arguments);J(this);this.h=this.visible=!0;k=k||[];h=h||[];this.Ft=2;this.dk=this.Cx=!1;this.q=l||Vh;this.Lq=M.Pk;void 0!==this.q.Ua&&(this.Lq=this.q.Ua);M.d.Na(this,this.Lq);this.Jj=this.Ij=0;this.q.background.zr&&(this.Ij=this.q.background.zr);this.q.background.Ar&&(this.Jj=this.q.background.Ar);this.q.background.elements||
(this.wd=this.q.background.b);this.q.background.Oy?(Ph(this,this.q.background.elements,{}),this.wd=this.q.background.b):(f=this.q.background.b,l=new Oh,Ph(l,this.q.background.elements,[]),f||this.Ua!==M.Zf?(this.wd=new r(f.width,f.height),w(this.wd),f.p(0,0,0),l.Ak(-this.Ij,-this.Jj),y(this.wd)):(m.sa(M.d.ag(this.Ua)),l.ya()));var n=this;this.Fr=0;b("score",this.q.Ns)?(this.oj=new Wh(this,this.q.Ns,"SCORE",0,!0),this.q.xx&&new Qh(this,this.q.xx)):this.oj=new Xh(0,0);this.Wi=b("highScore",this.q.vr)?
new Wh(this,this.q.vr,"HIGHSCORE",0,!1):new Xh(0,0);b("highScore",this.q.Ev)&&new Qh(this,this.q.Ev);this.Ah=b(["stage","level"],this.q.at)?new Wh(this,this.q.at,"STAGE",0,!1):new Xh(0,0);b("lives",this.q.Sv)&&new Wh(this,this.q.Sv,"LIVES",0,!1);this.hm=b("time",this.q.time)?new Wh(this,this.q.time,"TIME",0,!1,function(a){return n.up(a)}):new Xh(0,0);this.hm.mf(36E4);if(this.q.hc&&this.q.Js)throw"Don't define both progress and progressFill in your game_ui settings";this.Kl=b("progress",this.q.hc)?
this.q.hc.round?new Yh(this,this.q.hc):new Zh(this,this.q.hc):b("progress",this.q.Js)?new Zh(this,this.q.Js):new Xh(0,0);b("lives",this.q.Bv)&&new Qh(this,this.q.Bv);b("difficulty",this.q.mn)?new Rh(this,$h().toUpperCase(),this.q.mn):$h();b("difficulty",this.q.Fi)&&(f=s_ui_smiley_medium,f=(this.q.Fi.images?this.q.Fi.images:[s_ui_smiley_easy,s_ui_smiley_medium,s_ui_smiley_hard])[Bg()],this.q.Fi.b||(this.q.Fi.b=f),this.Tu=new Qh(this,this.q.Fi),this.Tu.Qs(f));this.q.dg&&!this.q.dg.length&&(this.q.dg=
[this.q.dg]);this.q.we&&!this.q.we.length&&(this.q.we=[this.q.we]);this.Jr=[];this.Kr=[];this.Jr[0]=b(["item","item0"],this.q.dg)?new Qh(this,this.q.dg[0]):new Xh(0,"");this.Kr[0]=b(["item","item0"],this.q.we)?new Rh(this,"",this.q.we[0]):new Xh(0,"");if(this.q.dg&&this.q.we)for(f=1;f<this.q.we.length;++f)b("item"+f,this.q.we[f])&&(this.Kr[f]=new Rh(this,"0 / 0",this.q.we[f]),this.Jr[f]=new Qh(this,this.q.dg[f]));for(var q in this.q)f=this.q[q],f.T&&new Rh(this,M.k.K(f.T,"<"+f.T+">")+(f.separator?
f.separator:""),f);this.$r=this.Gt=0;this.buttons={};for(q in this.q.buttons)f=ai(this,this.q.buttons[q]),this.buttons[q]=f;this.q.Cs&&(f=ai(this,this.q.Cs),this.buttons.pauseButton=f);this.jn={};for(q in this.q.jn)f=this.q.jn[q],f=new bi[f.gz](this,f),this.jn[q]=f;this.Qb=this.Pb=0}eg(Oh,Uh);var bi={};function ai(a,b){var c=new ci(a,b,b.ja);a.Yc.push(c);c.Kz=b;return c}e=Uh.prototype;e.cp=function(a,b){this.buttons[b||"pauseButton"].cp(a)};
e.up=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.Cx?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};e.wh=function(a){this.Kl.wh(a);return this};e.setTime=function(a){this.hm.mf(a);return this};e.getTime=function(){return this.hm.L()};function di(a){var b=$.Oc;b.Wi.mf(a);b.Fr=a}function ei(a,b){a.Ah.mf(b);1<b&&a.Kl&&a.Kl.pr&&a.Kl.pr()}
e.Om=function(a){a=this.oj.L()+a;this.oj.mf(a);this.vh.Xj&&(this.Wi.L()<a?this.Wi.mf(a):a<this.Wi.L()&&this.Wi.mf(Math.max(a,this.Fr)));return this};e.tb=function(){Oh.prototype.tb.apply(this,arguments);m.sa(this.canvas);m.clear();for(var a in this.buttons)K(I,this.buttons[a])};
e.ba=function(a){1===this.Ft&&this.setTime(this.getTime()+a);if(2===this.Ft){if(this.Gt&&1E3*this.Gt>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.hm,b.Qc.m=0,b.Qc.op=!0,b.font.setFillColor(b.Qc.color),b.jf(),"undefined"!==typeof a_gameui_timewarning_second&&G.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}Oh.prototype.ba.apply(this,arguments);this.$r+=a};
e.Ak=function(a,b){this.wd&&(this.wd instanceof p?this.wd.hd(0,a+this.Ij,b+this.Jj,1):this.wd.hd(a+this.Ij,b+this.Jj,1));Oh.prototype.Ak.apply(this,arguments);this.on&&this.wd&&sa(a,b,this.wd.width,this.wd.height,"blue",!0)};
function fi(a,b,c,d,f,h){this.e=a;this.width=f;this.height=h;this.N=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.P={};this.P.Pb=0;this.P.Qb=0;this.P.scale=this.scale;this.P.alpha=this.alpha;this.P.oa=0;this.B={};this.B.Ce=!1;this.B.origin={};this.B.target={};this.B.m=0;this.a.Fk&&(gi(this,this.a.Fk),this.B.Ce=!1);this.e.Yc.push(this);hi||(hi={wc:function(a){a.value instanceof r?a.N=a.value:(a.b=a.value,a.Ub=0)},update:Y.re,
sc:Y.pe,end:Y.qe,Vd:L,Wd:L,Ud:function(a,b,c,d){return 1-oc(a,b,c,d)},Tq:function(a,b,c,d){return 1*oc(a,b,c,d)+1},Uq:function(a,b,c,d){return 1*oc(a,b,c,d)+1}})}var hi;
function gi(a,b){a.B.origin.x=void 0===b.x?a.x:b.x;a.B.origin.y=void 0===b.y?a.y:b.y;a.B.origin.alpha=void 0!==b.alpha?b.alpha:1;a.B.origin.scale=void 0!==b.scale?b.scale:1;a.B.target.x=a.x;a.B.target.y=a.y;a.B.target.alpha=a.alpha;a.B.target.scale=a.scale;a.B.duration=b.duration;a.B.Ce=!0;a.B.We=b.We||oc;a.B.m=0;a.B.Qa=b.Qa||0;ii(a)}
function ii(a){a.B.m>=a.B.duration&&(a.B.m=a.B.duration,a.B.Ce=!1);var b=a.B.We(a.B.m,a.B.origin.x,a.B.target.x-a.B.origin.x,a.B.duration),c=a.B.We(a.B.m,a.B.origin.y,a.B.target.y-a.B.origin.y,a.B.duration);a.P.Pb=b-a.x;a.P.Qb=c-a.y;a.P.alpha=a.B.We(a.B.m,a.B.origin.alpha,a.B.target.alpha-a.B.origin.alpha,a.B.duration);a.P.scale=a.B.We(a.B.m,a.B.origin.scale,a.B.target.scale-a.B.origin.scale,a.B.duration);a.e.ic=!0}e=fi.prototype;
e.ya=function(a,b){this.N&&this.N.V(this.x+this.P.Pb+a,this.y+this.P.Qb+b,this.P.scale,this.P.scale,0,this.P.alpha)};e.Tk=function(a,b){ji(this.x+this.P.Pb+a,this.y+this.P.Qb+b,this.width*this.P.scale,this.height*this.P.scale)};e.dl=function(a,b){return a>this.x+this.P.Pb&&a<this.x+this.P.Pb+this.width*this.P.scale&&b>this.y+this.P.Qb&&b<this.y+this.P.Qb+this.height*this.P.scale};e.Ts=function(a){this.visible!==a&&(this.visible=a,this.e.ic=!0)};
e.ba=function(a){this.B.Ce&&(0<this.B.Qa?this.B.Qa-=a:(this.B.m+=-this.B.Qa,this.B.Qa=0,this.B.m+=a,ii(this)))};function Xh(a,b){this.hc=this.value=this.al=b}Xh.prototype.mf=function(a){this.value=a};Xh.prototype.L=function(){return this.value};Xh.prototype.wh=function(a){0>a&&(a=0);100<a&&(a=100);this.hc=a};Xh.prototype.Qs=function(){};
function Qh(a,b){this.Ko=b;this.a={};for(var c in b)this.a[c]=b[c];this.b=this.a.b;this.G=0;this.mk=this.a.mk;this.a.PB&&(this.a.x+=this.b.fb,this.a.y+=this.b.Ca);fi.call(this,a,this.a,this.a.x,this.a.y,this.b?this.b.width:1,this.b?this.b.height:1)}eg(fi,Qh);bi.GameUIImage=Qh;function ki(a,b){a.G!==b&&(a.G=b,a.e.ic=!0)}e=Qh.prototype;
e.ya=function(a,b){this.b&&(this.mk&&(a+=-Math.floor(this.b.width/2),b+=-Math.floor(this.b.height/2)),this.b instanceof p?this.b.V(this.G,this.x+a+this.P.Pb,this.y+b+this.P.Qb,this.P.scale,this.P.scale,0,this.P.alpha):this.b.V(this.x+a+this.P.Pb,this.y+b+this.P.Qb,this.P.scale,this.P.scale,0,this.P.alpha),this.e.on&&sa(this.x+a-this.b.fb+1,this.y+b-this.b.Ca+1,this.b.width-2,this.b.height-2,"black",!0))};
e.dl=function(a,b){if(!this.b)return!1;var c=0,d=0;this.mk&&(c+=-Math.floor(this.b.width/2),d+=-Math.floor(this.b.height/2));c-=this.b.fb;d-=this.b.Ca;return a>c+this.x+this.P.Pb&&a<c+this.x+this.P.Pb+this.width*this.P.scale&&b>d+this.y+this.P.Qb&&b<d+this.y+this.P.Qb+this.height*this.P.scale};e.Tk=function(a,b){this.b&&(this.mk&&(a+=-Math.floor(this.b.width/2),b+=-Math.floor(this.b.height/2)),a-=this.b.fb,b-=this.b.Ca,ji(this.x+this.P.Pb+a,this.y+this.P.Qb+b,this.width*this.P.scale,this.height*this.P.scale))};
e.Sn=function(a){a||(a=new g(0,0));a.x=this.x+M.$f+this.e.Pb;a.y=this.y+M.Ye+this.e.Qb;return a};e.Qs=function(a){a!==this.b&&(this.b=a,this.e.ic=!0,this.b&&(this.width=this.b.width,this.height=this.b.height))};
function Rh(a,b,c){"object"===typeof b&&(c=b,b=c.T?M.k.K(c.T,"<"+c.T+">"):c.text||"");this.text=b;this.font=c.font.S();c.Wf&&A(this.font,c.Wf);this.ys=c.x;this.zs=c.y;this.xs=c.lc;this.Sw=this.font.fillColor;this.Je=void 0===c.Je?.2:c.Je;fi.call(this,a,c,Math.floor(c.x-.1*c.lc),Math.floor(c.y-.1*c.uc),Math.floor(1.2*c.lc),Math.floor(1.2*c.uc));this.N=new r(this.width,this.height);switch(this.font.align){case "left":this.ug=Math.floor(.1*c.lc);break;case "right":this.ug=Math.floor(1.1*c.lc);break;
case "center":this.ug=Math.floor(.6*c.lc);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.Je*this.font.fontSize);switch(this.font.i){case "top":this.vg=Math.floor(.1*c.uc);break;case "bottom":this.vg=Math.floor(1.1*c.uc)+a;break;case "middle":this.vg=Math.floor(.6*c.uc)+a;break;default:throw"Unknown baseline: "+this.font.i;}this.Qc={};this.Qc.color="red";this.Qc.duration=200;this.Qc.m=0;this.Qc.op=!1;this.jf()}eg(fi,Rh);bi.GameUIText=Rh;
Rh.prototype.ba=function(a){fi.prototype.ba.apply(this,arguments);this.Qc.op&&(this.Qc.m+=a,this.Qc.duration<=this.Qc.m&&(this.Qc.op=!1,this.font.setFillColor(this.Sw),this.jf()))};
Rh.prototype.jf=function(){this.N.clear();w(this.N);var a=this.font.da(this.text),b=1;a>this.xs&&(b=this.xs/a);this.font.V(this.text,this.ug,this.vg,b,b,0,1);this.e.on&&(sa(0,0,this.N.width,this.N.height,"black",!0),sa(this.ys-this.x,this.zs-this.y,this.N.width-2*(this.ys-this.x),this.N.height-2*(this.zs-this.y),"red",!0),ta(this.ug-5,this.vg,this.ug+5,this.vg),ta(this.ug,this.vg-5,this.ug,this.vg+5));this.e.ic=!0;y(this.N)};function li(a){return""+a}
function mi(a){return a.toLocaleString(M.k.Rk())}function ni(a,b,c){return b+c}function Wh(a,b,c,d,f,h){this.value=this.al=d||0;this.xm=-1;this.Zt=c;this.a=b;this.Yt=-99999;this.gm=b.gm||0;this.bh=b.bh?b.bh:h||li;c=ni;f&&0!==this.a.Sq&&(c=pc);this.Ka=new fg(this.al,void 0===this.a.Sq?500:this.a.Sq,c);b.Di&&(this.Di="game_ui_"+b.Di);this.text=oi(this)+this.bh(this.al);Rh.call(this,a,this.text,b)}eg(Rh,Wh);bi.GameUIValue=Wh;Wh.prototype.mf=function(a){this.value=a;hg(this.Ka,this.value)};
Wh.prototype.L=function(){return this.value};Wh.prototype.zp=function(a){var b=this.xm;if(a||I.ve-this.Yt>this.gm)b=this.bh(Math.floor(this.Ka.L()));this.xm!==b&&(this.Yt=I.ve,this.xm=b,this.text=oi(this)+b,this.jf())};Wh.prototype.ba=function(a){Rh.prototype.ba.apply(this,arguments);gg(this.Ka,a);Math.floor(this.Ka.L())!==this.xm&&this.zp()};
function oi(a){var b="";a.a.Ap&&(b=a.Di?M.k.K(a.Di,"<"+a.Di.toUpperCase()+">"):M.k.K("game_ui_"+a.Zt,"<"+a.Zt+">"));return b+(a.a.separator?a.a.separator:"")}function Zh(a,b){this.Lf=this.hc=0;this.a=b;this.mj=this.kg=0;this.b=b.b;this.Te=b.Te||b.b;this.ho=b.ho||null;this.a.Bl=this.a.Bl||0;this.a.Cl=this.a.Cl||0;this.Vm=!0;this.Ll=b.Ll||0;this.M=[];this.dk=!1;this.Ka=new fg(0,200,vc);this.Dc=new fg(0,200,vc);fi.call(this,a,b,b.x,b.y,this.b.width,this.b.height)}eg(fi,Zh);bi.GameUIProgress=Zh;
Zh.prototype.wh=function(a){0>a&&(a=0);100<a&&(a=100);this.dk?(this.Lf=a-this.hc,hg(this.Dc,this.Lf)):(hg(this.Ka,a),this.hc=a)};Zh.prototype.ba=function(a){gg(this.Ka,a);var b=this.Ka.L();b!==this.kg&&(this.e.ic=!0,this.kg=b);gg(this.Dc,a);a=this.Dc.L();a!==this.mj&&(this.e.ic=!0,this.mj=a);b+=a;if(this.Vm)for(a=0;a<this.M.length;++a){var c=b>=this.M[a].position&&this.hc+this.Lf>=this.M[a].position;this.M[a].complete!==c&&(this.a.M&&(this.e.ic=!0,this.kg=b),this.M[a].complete=c)}};
Zh.prototype.ya=function(a,b){var c,d,f;if(0===this.Ll&&(0<this.Dc.L()&&this.Te.Ha(0,this.width*this.Ka.L()/100,0,this.Te.width*this.Dc.L()/100,this.Te.height,a+this.x+this.width*this.Ka.L()/100,b+this.y),this.b.Ha(0,0,0,this.width*this.Ka.L()/100,this.height,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.p(0,a+this.x+this.width/100*d.position,b+this.y+this.a.M.y);if(1===this.Ll&&(0<this.Dc.L()&&this.Te.Ha(0,0,this.height-
this.height*this.Ka.L()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ka.L()/100)),this.b.Ha(0,0,this.height-this.height*this.Ka.L()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ka.L()/100)),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.p(0,a+this.x+this.a.M.x,b+this.y+this.height-this.height/100*d.position);if(2===this.Ll&&(0<this.Dc.L()&&this.Te.Ha(0,0,this.height*this.Ka.L()/
100,this.Te.width,this.Te.height*this.Dc.L()/100,a+this.x+this.width*this.Ka.L()/100,b+this.y),this.b.Ha(0,0,0,this.width,this.height*this.Ka.L()/100,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.p(0,a+this.x+this.a.M.x,b+this.y+this.height/100*d.position);this.ho&&this.ho.p(0,a+this.x+this.a.Bl,b+this.y+this.a.Cl)};function ci(a,b,c){this.mm=!1;this.yj=-1;this.e=a;this.a=b;this.h=!0;this.cp(c);Qh.call(this,a,b)}
eg(Qh,ci);bi.GameUIButton=ci;ci.prototype.cp=function(a){var b=null,c=null,d=this.e,f=this.a;void 0===a&&(a=f.ja?f.ja:0);switch(a){case 0:b=d.vh.En?me:le;c=function(){zg(M.e)?M.e.De(!1,!0,d.vh.En):M.e.De();return!0};break;case 1:b=ne;c=function(){M.e.De();return!0};break;case 2:b=s_btn_small_quit;c=function(){pi(d.vh.En);return!0};break;case 3:b=f.b}this.Fb=c;this.a.b=b};ci.prototype.Mb=function(a,b,c){if(this.h)return this.dl(b-M.$f,c-M.Ye)?(this.mm=!0,this.yj=a,ki(this,1),!0):!1};
ci.prototype.ba=function(a){Qh.prototype.ba.apply(this,arguments);this.mm&&(this.dl(I.ia[this.yj].x-M.$f,I.ia[this.yj].y-M.Ye)?ki(this,1):ki(this,0))};ci.prototype.Nb=function(a,b,c){return this.mm&&a===this.yj?(ki(this,0),this.dl(b-M.$f,c-M.Ye)&&this.Fb&&this.Fb(),this.mm=!1,this.yj=-1,!0):!1};
function Yh(a,b){this.Lf=this.hc=0;this.a=b;this.mj=this.kg=0;this.Vm=!0;this.M=[];this.color=b.color||"#00AEEF";this.sq=b.sq||"#FF0F64";this.pq=b.pq||"#FFED93";this.qq=void 0===b.blink||b.blink;this.pd=b.pd;this.Sg=this.dk=!1;this.If=0;this.bk=1E3;this.ck=0;this.Ka=new fg(0,200,vc);this.Dc=new fg(0,200,vc);fi.call(this,a,b,b.x,b.y,1,1)}eg(fi,Yh);bi.GameUIRoundProgress=Yh;function qi(a){a.qq&&(a.Sg?a.If-=a.bk:(a.Sg=!0,a.If=0,a.ck=0,hg(a.Ka,100)))}e=Yh.prototype;
e.wh=function(a){0>a&&(a=0);100<a&&(a=100);this.dk?(this.Lf=a-this.hc,hg(this.Dc,this.Lf)):(this.Sg||(100===a&&this.qq?qi(this):hg(this.Ka,a)),this.hc=a)};e.pr=function(){qi(this)};
e.ba=function(a){gg(this.Ka,a);var b=this.Ka.L();b!==this.kg&&(this.e.ic=!0,this.kg=b);gg(this.Dc,a);var c=this.Dc.L();c!==this.mj&&(this.e.ic=!0,this.mj=c);this.Sg&&(this.If+=a,this.If>=this.bk?100===this.hc?(this.Sg=!1,qi(this)):(this.Sg=!1,this.ck=0,this.Ka.dh=0,this.Ka.jm=0,hg(this.Ka,this.hc)):this.ck=(-Math.cos(this.If/this.bk*5*Math.PI*2)+1)/2,this.e.ic=!0);b+=c;if(this.Vm)for(a=0;a<this.M.length;++a)c=b>=this.M[a].position&&this.hc+this.Lf>=this.M[a].position,this.M[a].complete!==c&&(this.a.M&&
(this.e.ic=!0,this.kg=b),this.M[a].complete=c)};e.Tk=function(a,b){this.pd&&ji(this.x+this.P.Pb+a-this.pd.fb,this.y+this.P.Qb+b-this.pd.Ca,this.pd.width*this.P.scale,this.pd.height*this.P.scale)};
e.ya=function(a,b){var c,d;if(this.pd){d=this.Ka.L()/100;d=Math.max(d,0);d=Math.min(d,1);var f=m.context,h=this.pd.width/2-N(4),k=f.fillStyle;if(0<this.Dc.L()){var l=this.Dc.L()/100;f.beginPath();f.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);f.lineTo(this.x+a,this.y+b);f.fillStyle=this.sq;f.fill()}f.beginPath();f.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);f.lineTo(this.x+a,this.y+b);f.fillStyle=this.color;f.fill();this.bk&&(l=f.globalAlpha,f.globalAlpha*=
this.ck,f.beginPath(),f.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),f.lineTo(this.x+a,this.y+b),f.fillStyle=this.pq,f.fill(),f.globalAlpha=l);if(this.a.M){var l=f.strokeStyle,n=f.lineWidth;f.strokeStyle="white";f.lineWidth=N(2);for(d=0;d<this.M.length;++d){c=this.M[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;f.beginPath();f.moveTo(Math.round(a+this.x),Math.round(b+this.y));f.lineTo(Math.round(a+this.x+q),Math.round(b+this.y+c));f.stroke()}f.strokeStyle=
l;f.lineWidth=n}this.pd.p(0,a+this.x,b+this.y);if(this.a.M)for(d=0;d<this.M.length;++d)c=this.M[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.p(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.M.ka*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.M.ka*.5));f.fillStyle=k}};M.version=M.version||{};M.version.game_ui="2.1.0";
function ri(a,b,c,d,f){var h=0;this.visible=this.h=!1;this.group=0;this.node=a;this.attributes=b;this.duration=c;this.Fb=f;this.Xu=d;this.vk=0;this.Hf={};for(h in this.attributes)this.Hf[h]=a[h];this.Mq={};for(h in this.attributes)this.Mq[h]=this.attributes[h]-this.Hf[h];J(this)}ri.prototype.finish=function(){this.h=!1;K(I,this);for(i in this.attributes)this.node[i]=this.attributes[i];"undefined"!==typeof this.Fb&&this.Fb()};
ri.prototype.ba=function(a){var b=0,c,d,f;this.vk+=a;if(this.vk<this.duration)for(b in this.attributes)a=this.Mq[b],c=this.vk,d=this.Hf[b],f=this.duration,this.node[b]=this.Xu(c,d,a,f);else this.finish()};ri.prototype.start=function(){this.h=!0};ri.prototype.pause=function(){this.h=!1};function si(){return function(a,b,c,d){return 4*qc(a,b,c,d)}}function ti(a,b,c,d,f){this.Pe(a,b,c,d,f)}function ui(a,b,c){a.bd=b;a.sd=.5;a.Lc=c;a.rx=a.bd+a.sd+a.Lc}
ti.prototype.Pe=function(a,b,c,d,f,h){this.depth=100;this.h=this.visible=!0;this.group="gameObject";this.x=c;this.y=d;this.N=null;this.state=0;this.alpha=1;this.font=b.S();this.vb=0;this.text=a;this.Hb=f;vi(this,h);this.duration=500;ui(this,.25,.06);this.Hb&&G.play(this.Hb);this.Tb=this.Sb=1;M.d.Na(this,M.eh);J(this);Sb(this,"game")};var wi={};
function vi(a,b){wi.hasOwnProperty(a.font.J)||(wi[a.font.J]={});var c=""+a.font.fontSize;wi[a.font.J].hasOwnProperty(c)||(wi[a.font.J][c]={});wi[a.font.J][c].hasOwnProperty(a.font.fillColor)||(wi[a.font.J][c][a.font.fillColor]={});wi[a.font.J][c][a.font.fillColor].hasOwnProperty(a.font.strokeColor)||(wi[a.font.J][c][a.font.fillColor][a.font.strokeColor]={});if(wi[a.font.J][c][a.font.fillColor][a.font.strokeColor].hasOwnProperty(a.text))a.N=wi[a.font.J][c][a.font.fillColor][a.font.strokeColor][a.text];
else{a.N=new r(Math.floor(1.2*a.font.da(a.text)),Math.floor(1.2*a.font.Z(a.text))+N(10));b||(wi[a.font.J][c][a.font.fillColor][a.font.strokeColor][a.text]=a.N);c=a.N;w(c);try{F(a.font,"middle"),E(a.font,"center"),a.font.p(a.text,c.width/2,c.height/2)}finally{y(c)}}}ti.prototype.tb=function(){this.canvas.$=!0};ti.prototype.ba=function(a){this.vb+=a;this.vb>this.duration&&K(I,this);this.canvas.$=!0;this.Lj(a)};ti.prototype.Lj=function(){};
ti.prototype.ya=function(){this.N.V(this.x-this.N.width*this.Sb/2,this.y-this.N.height*this.Tb/2,this.Sb,this.Tb,0,this.alpha)};function xi(a,b,c,d,f,h){this.Pe(a,b,c,d,f,h);this.duration=500;ui(this,.25,.06);a=yc([tc,kc,si()],[!1,!1,!1],[this.bd,this.sd,this.Lc]);this.Id=new fg(0,this.duration,a);hg(this.Id,2);a=yc([tc,kc,oc],[!1,!1,!0],[this.bd,this.sd,this.Lc]);this.Jd=new fg(0,this.duration,a);hg(this.Jd,1)}eg(ti,xi);
xi.prototype.Lj=function(a){gg(this.Id,a);gg(this.Jd,a);this.Sb=this.Id.L();this.Tb=this.Jd.L();this.vb>this.duration*(1-this.Lc/this.rx)&&(this.font.setFillColor("white"),this.font.setStrokeColor("white"),vi(this))};
function yi(a,b,c,d,f,h,k,l,n){this.Pe(a,b,M.Cd+M.tc/2,M.Dd+M.Ni/2+(n||0),f,l);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Na(this.font);a.color="white";Ma(this.font,a);this.depth=-20;this.duration=2E3;ui(this,.1,.3);k=k?qc:tc;a=yc([k,kc],[!1,!1],[this.bd,this.sd+this.Lc]);this.Id=new fg(0,this.duration,a);hg(this.Id,1);k=yc([k,kc],[!1,!1],[this.bd,this.sd+this.Lc]);this.Jd=new fg(0,this.duration,k);hg(this.Jd,1);k=yc([kc,qc],[!1,!1,!0],[this.bd+this.sd,this.Lc]);this.Ff=new fg(1,
this.duration,k);hg(this.Ff,0);k=yc([kc,sc],[!1,!1],[this.bd+this.sd,this.Lc]);this.jg=new fg(this.y,this.duration,k);hg(this.jg,this.y);var q=yc([kc,qc],[!1,!1,!0],[this.bd+this.sd-.2,this.Lc+.2]),u=this;h=h||.75;new zi(c,u.duration,Ai(u.x-u.N.width/2,u.y-u.N.height/8,u.N.width,u.N.height/4),N(50),d,function(a){return q(a,h,-h,u.duration)})}eg(ti,yi);
yi.prototype.Lj=function(a){gg(this.Id,a);gg(this.Jd,a);gg(this.Ff,a);gg(this.jg,a);this.Sb=this.Id.L();this.Tb=this.Jd.L();this.alpha=this.Ff.L();this.y=this.jg.L()};yi.prototype.ya=function(){this.N.V(this.x-this.N.width*this.Sb/2,this.y-this.N.height*this.Tb/2,this.Sb,this.Tb,0,this.alpha)};
function Bi(a,b,c,d,f,h){this.Pe(a,b,M.Cd+M.tc/2,M.Dd+M.Ni/2,f,h);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Na(this.font);a.color="white";Ma(this.font,a);this.depth=-20;this.duration=2E3;ui(this,.5,.3);a=yc([qc,kc],[!1,!1],[this.bd,this.sd+this.Lc]);this.Id=new fg(0,this.duration,a);hg(this.Id,1);a=yc([qc,kc],[!1,!1],[this.bd,this.sd+this.Lc]);this.Jd=new fg(0,this.duration,a);hg(this.Jd,1);a=yc([kc,qc],[!1,!1,!0],[this.bd+this.sd,this.Lc]);this.Ff=new fg(1,this.duration,
a);hg(this.Ff,0);a=yc([kc,sc],[!1,!1],[this.bd+this.sd,this.Lc]);this.jg=new fg(this.y,this.duration,a);hg(this.jg,this.y)}eg(ti,Bi);Bi.prototype.Lj=function(a){gg(this.Id,a);gg(this.Jd,a);gg(this.Ff,a);gg(this.jg,a);this.Sb=this.Id.L();this.Tb=this.Jd.L();this.alpha=this.Ff.L();this.y=this.jg.L()};Bi.prototype.ya=function(){this.N.V(this.x-this.N.width*this.Sb/2,this.y-this.N.height*this.Tb/2,this.Sb,this.Tb,0,this.alpha)};
function Ai(a,b,c,d){var f=2*c+2*d,h=c/f,k=d/f;return function(f){if(f<h)return new g(a+1/h*c*f,b);if(f<h+k)return new g(a+c,b+1/k*(f-h)*d);if(f<h+k+h)return new g(a+c-1/h*(f-h-k)*c,b+d);if(1>=f)return new g(a,b+d-1/k*(f-h-k-h)*d)}}function Ci(){this.sh=new g(0,0);this.Cj=new g(0,0);this.Ms=this.oa=this.Iq=this.gk=this.as=0}Ci.prototype.jo=function(a){return this.gk<a&&this.gk+this.as>a};
function zi(a,b,c,d,f,h){this.b=a;this.visible=this.h=!0;this.ru=h||function(){return 1};this.depth=0;this.group="gameObject";this.scale=25/a.width;this.Ww=f;this.ph=[];this.sk=b;this.Jq=1;this.sy=10;this.Mx=d;this.vb=0;this.shape=c;M.d.Na(this,M.eh);this.ne=new g(0,0);for(a=0;a<f;++a)b=c(a/f),this.ne.x+=b.x,this.ne.y+=b.y;this.ne=this.ne.scale(1/f);for(a=0;a<f;++a)this.ph.push(new Ci),Di(this,a);yc([L,L],[!1,!0],[1,1]);J(this);Sb(this,"game")}var Ei=new ga(0);
function Di(a,b){var c=a.ph[b],d=b/a.Ww;c.as=a.sk;d=a.shape(d);d=d.add(ea(Ei.random(360),Ei.random(a.Mx)));c.Ms=360;c.Cj=d.Vb(a.ne).scale(1/(a.sk/1E3*.04));c.gk=a.vb+Ei.random(a.sy);c.Gv=ha(Ei,a.b.G-1);c.sh=a.ne}
zi.prototype.ba=function(a){this.vb+=a;for(var b=new g(0,180),c=0;c<this.ph.length;++c){var d=this.ph[c],f=Math.floor((this.vb-d.gk)/this.sk);f>d.Iq&&f<this.Jq-1&&(Di(this,c),d.Iq=f);d.jo(this.vb)&&(f=d.Cj.scale(-4),f=b.add(f),d.Cj=d.Cj.add(f.scale(a/1E3)),d.sh=d.sh.add(d.Cj.scale(a/1E3)),d.oa+=d.Ms*a/1E3,d.scale=2*Math.log(d.sh.Vb(this.ne).length()/100)*this.scale)}this.vb>this.sk*this.Jq&&K(I,this);this.canvas.$=!0};
zi.prototype.ya=function(){for(var a=0;a<this.ph.length;++a){var b=this.ph[a];b.jo(this.vb)&&this.b.V(b.Gv,b.sh.x,b.sh.y,b.scale,b.scale,b.oa,.9*this.ru(this.vb))}};function Fi(a,b){this.x=a;this.y=b}e=Fi.prototype;e.add=function(a){this.x+=a.x;this.y+=a.y};e.Vb=function(a){this.x-=a.x;this.y-=a.y};e.scale=function(a){this.x*=a;this.y*=a};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);this.x=a*this.x+b*this.y;this.y=-b*this.x+a*this.y};
e.Sf=function(a){return this.x*a.x+this.y*a.y};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);0===a?this.y=this.x=0:(this.x/=a,this.y/=a)};e.sc=function(a,b,c){var d=Math.min(8,this.length()/4),f=this.Vb(this.normalize().scale(2*d)),h=f.add(fa(this).scale(d)),d=f.add(fa(this).scale(-d)),k=m.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+f.x,b+f.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+f.x,b+f.y);k.stroke()};
function Gi(a,b){return"object"===typeof a?new g(a.x+M.Cd,a.y+M.Dd):new g(a+M.Cd,b+M.Dd)}function Hi(a,b){return M.k.K(a,b||"<"+a+">")}function Ii(){fc.call(this);this.group="gameObject";this.le=[];Sb(this,"game")}eg(fc,Ii);function Ji(a){this.us=a;this.ul=[];this.expansion=1}Ji.prototype.create=function(){0>=this.ul.length&&(this.expansion=Math.round(1.2*this.expansion)+1,this.expand(this.expansion));var a=this.ul.pop();this.us.apply(a,arguments);return a};Ji.prototype.release=function(a){this.ul.push(a)};
Ji.prototype.expand=function(a){for(var b=0;b<a;b++)this.ul.push(new this.us)};var Ki=new Ji(Fi);M.version=M.version||{};M.version.game="1.0.2";var $={};function Li(){this.depth=11;this.h=this.visible=!0;M.d.Na(this,M.Xe);this.a=M.a.l.l;this.Os=this.scrollTo=this.ap=0;this.bp=!1;this.yx=500;J(this);Sb(this,"game");$={e:this};$.Ez=new Ih("gameObject");$.uq=new Mi;$.aB=[];this.Hu={};this.fp={};Ni(this);this.pi=0}function Oi(a,b){a.ap=$.X;a.scrollTo=b;a.Os=I.ve;a.bp=!0}
function Pi(a){a.bb=!1;Qi(a,Hi("bs_stage","Stage")+" "+($.Oc.Ah.L()+1),Kf);var b=new Ii;b.Y(300,function(){a.jj-=$.n.n.cx;var b,d=$.Oc;"undefined"===typeof b&&(b=1);ei(d,d.Ah.L()+b);Ri(a,$.Oc.Ah.L());$.Oc.wh(0);$.Oc.wh(100*a.jj/$.n.n.cx)});b.Y(2E3,function(){hg(a.fk,Si(a)+$.X);Oi(a,-($.n.n.cb-$.n.n.ib)*a.ye-(a.ye*($.n.n.ib-1)+2*$.pa))});b.Y(2600,function(){$.U.rd=($.n.n.cb+1)%2;Ti();var b=-($.n.n.cb-$.n.n.ib)*a.ye;Oi(a,b);a.kh=b;a.Rr=Ui(a);a.bb=!0});b.start()}e=Li.prototype;
e.Om=function(a){$.Oc.Om(a);this.jj+=a};function Vi(a,b,c,d,f,h,k,l,n,q){var u=1,B=Gi(d,f),D=750;c&&(D*=4);a.Y(u,function(){C(b,h);c?new xi("+"+mi(l),b,B.x,B.y,tf,n):Jh(b,(c?"+":"")+mi(l),B.x,B.y,-N(20),D+10*l,void 0,n);C(b,k)});u+=700;1<q&&(a.Y(u,function(){C(b,1*h);new xi("x"+q,b,B.x,B.y,If);C(b,k)}),u+=700,a.Y(u,function(){C(b,1*h);G.play(uf);Jh(b,"+"+mi(l*q),B.x,B.y,-N(20),D+10*l,tc,n);C(b,k)}),u+=300)}
function Wi(a,b,c,d,f,h,k){for(var l=0,n=0;n<d;++n){var q;a:{q=f-n;q>=M.a.l.pj.bubbles.length&&(q=M.a.l.pj.bubbles.length-1);for(1>q&&(q=1);1<=q;--q)if(null!==M.a.l.pj.bubbles[q]){q=M.a.l.pj.bubbles[q];break a}q=void 0}l+=q}c+=$.X;k="undefined"===typeof k?0:k;d=1;h&&(d=M.a.l.pj.Nv);$.e.Om(l*d);if(0<l||0<k){f=af;n=a.Hu;h&&(f=cf);var u=f.fontSize,B=Math.floor(h?f.fontSize+Math.min((l-10)/10,2*f.fontSize):u);q=new Ii;f===cf&&(a.fp.hasOwnProperty(""+B)||(a.fp[""+B]={}),n=a.fp[""+B]);0<l&&Vi(q,f,h,b,c,
B,u,l,n,d);b=l*d+k;a.fr&&K(I,a.fr);M.a.l.my.Jx&&(a.fr=Jh(f,"["+b+"]",50,50,-N(20),5E3,tc,n));q.start()}return l*d}function Xi(a,b,c,d,f){if(0>=f)return b;if("object"===typeof a&&null!==a&&null!==b){var h;h="undefined"!==typeof a.length?[]:{};for(var k in a)h[k]=Xi(a[k],b[k],c,d,f-1);return h}return"number"===typeof a?a*c+b*d:b}
function Ri(a,b){1<b&&M.j.Er&&Lb("STAGEFINISHED",1500,a);for(var c=null,d=0;d<M.a.l.no.length;++d){var f=M.a.l.no[d];if(f.n.ub>=b){c&&f.n.ub!==b?(d=(b-c.n.ub)/(f.n.ub-c.n.ub),$.n=Xi(c,f,1-d,d,3),$.n.n.border=Math.round($.n.n.border),$.n.n.cb=Math.round($.n.n.cb),$.n.n.Gb=Math.round($.n.n.Gb),$.n.n.ib=Math.round($.n.n.ib)):$.n=f;break}else c=f}}e.tb=function(){this.bb=!1;this.tx=!0;this.canvas.$=!0;Wb(function(a){return"gameObject"===a.group});K(I,$.Oc);$=null};
function Yi(){var a=$.e;a.bb&&(a.bb=!1,Lb("LEVELFINISHED",2700,a))}
function Ni(a){a.bb=!1;var b=new Th;b.Xj=!1;b.fo=["lives"];$.Oc=new Uh(b);ei($.Oc,1);(b=Gh())||(b=0);di(b);$.pa=M.tc/11/2;a.ye=Math.sqrt(Math.pow(2*$.pa,2)-Math.pow($.pa,2));Ri(a,1);var c=-($.n.n.cb-$.n.n.ib)*a.ye;$.X=c-(a.ye*($.n.n.ib-1)+2*$.pa);a.kh=c;a.Rr=Ui(a);Zi(Hi("bs_start","Bubbleshooter!"),Hi("bs_shootallbubbles","Shoot all the bubbles...!"),function(){this.bb=!0;Oi(this,c)},a);$.Za=1;$.background=new $i;$.U=new aj;$.U.rd=($.n.n.cb+1)%2;Ti();$.Jc=new bj;$.Jc.mi();$.Jc.Nm=!0;$.Jc.jA=M.a.l.l.Eo;
a.fk=new fg(Si(a)+$.X,1E3,vc);a.jj=0}e.Un=function(){};e.ec=function(){};
e.ba=function(a){this.canvas.$=!0;gg(this.fk,a);this.pi=Math.max(0,this.pi-a);this.bb&&cj()&&Pi(this);if(this.bp){a=this.yx;var b=I.ve-this.Os;b>a?(this.bp=!1,$.X=this.scrollTo):$.X=vc(b,this.ap,this.scrollTo-this.ap,a)}else if(this.bb&&(b=1-Ui(this)/this.Rr,this.kh+=a*oc(b,$.n.n.speed,$.n.n.jc-$.n.n.speed,1),Math.round(this.kh)!==$.X)){$.X=Math.round(this.kh);a:{a=$.U;for(b=a.D.length-1;0<=b;--b){for(var c=a.D[b],d=0;d<c.length;d++)if(c[d]){a=c;break a}a.D.pop()}a=null}if(a)for(b=0;b<a.length;++b)a[b]&&
dj(a[b])}};e.bg=function(a){38===a&&Oi(this,this.scrollTo-10);40===a&&Oi(this,this.scrollTo+10)};e.Sk=function(a){"LEVELFINISHED"===a?ej():"STAGEFINISHED"===a&&M.j.Er($.Oc.oj.L())};e.Pc=function(){};e.Zd=function(){};function Qi(a,b,c){var d=new Ii;d.Y(a.pi+1,function(){new yi(b,$e,Qd,0,c)});a.pi+=1400;d.start()}function fj(){var a=$.e;if(a.bb){var b=new Ii;Qi(a,Hi("bs_gameover","Game over!"));b.Y(1E3,function(){gj()});b.start();Yi()}}function Si(a){return 2*$.pa+($.n.n.border-1)*a.ye+N(2)-$.X}
e.ya=function(){this.Ue&&!this.Ue.Ac&&(Si($.e),N(90));Yd.p(0,0,this.fk.L());0<$.X+ae.height-ae.Ca&&ae.p(0,0,$.X);0<$.X-ae.Ca&&sa(0,0,M.tc,$.X-ae.Ca,"#01A58C",!1)};function Ui(a){return Si(a)+$.X-a.kh}
function bj(){this.depth=10;this.h=this.visible=!0;this.group="gameObject";M.d.Na(this,M.Xe);this.a=M.a.l.Jc;this.x=this.a.x;this.y=this.a.y;this.b=Nd;this.Nm=!1;this.alpha=1;this.Eo=$.n.n.Eo;this.dm=this.ut=0;this.wi=1;this.im=0;this.sp=bf.fillColor;new r(Math.floor(1.2*bf.da("88")),Math.floor(1.2*bf.Z("88")));var a=N(20);this.qb=Yb(-Od.fb-a,-Od.Ca-a,Od.width+2*a,Od.height+2*a);this.cm=new r(Hd.width,Hd.height);hj(this);this.aa=[];this.random=new ga;J(this);Sb(this,"game")}
function hj(a){w(a.cm);a.cm.clear();try{Hd.p(0,0+Hd.fb,0+Hd.Ca);var b=Hi("bs_tap_to_switch_bubbles"),c=Va(df,b,N(180),N(20),!1),d=df.fontSize;df.fontSize>c&&C(df,c);df.p(Hi("bs_tap_to_switch_bubbles"),N(40),N(16),N(180));C(df,d)}finally{y(a.cm)}}e=bj.prototype;
e.mi=function(){var a,b,c,d,f;f=this.a.scale;for(b=0;b<this.aa.length;b++)a=this.aa[b],c=this.a.aa[b].x*f+this.x,d=this.a.aa[b].y*f+this.y,a.moveTo(c,d,this.a.aa[b].scale);for(b=0;this.a.aa.length!==this.aa.length;b++)c=this.a.aa[this.aa.length].x*f+this.x,d=this.a.aa[this.aa.length].y*f+this.y,a=ij(c,d),a.scale=this.a.aa[this.aa.length].scale,this.aa.push(a)};e.ec=function(){this.$d=new jj(this.x,this.y)};
function kj(){var a=$.Jc;if(!cj())for(var b=lj(),c=0;c<a.aa.length;++c){var d=a.aa[c];0<=d.type&&5>=d.type&&-1===b.indexOf(d.type)&&(d.type=b[ha($.U.random,b.length-1)]);"blank"===d.type&&-1===b.indexOf(d.en)&&mj(d,b[ha($.U.random,b.length-1)])}}e.tb=function(){for(this.$d&&K(I,this.$d);0!==this.aa.length;){var a=this.aa.pop();K(I,a)}this.Nm=!1};
function nj(a,b,c){b-=M.Cd;c=c-M.Dd-$.X;c>a.y-a.b.Ca&&(c=a.y-a.b.Ca);b-=a.x;c-=a.y;c=Ki.create(b,c);c.normalize();a.rotation=Math.min(180*Math.acos(0*c.x+-1*c.y)/Math.PI,a.a.gw)*(0<b?-1:1);Ki.release(c)}
e.Zd=function(a){var b,c;b=I.ia[0].x;c=I.ia[0].y;nj(this,b,c);this.y=this.a.y-$.X;for(var d=0;d<this.aa.length;++d){var f=this.aa[d],h=f.position.x,k=f.position.y;f.position.x=this.a.aa[d].x+this.x;f.position.y=this.a.aa[d].y+this.y;f.lb=f.lb+f.position.x-h;f.Ya=f.Ya+f.position.y-k;f.scale=this.a.aa[d].scale}this.$d&&(d=this.$d,h=this.rotation,f=-Math.sin(Math.PI*h/180),h=-Math.cos(Math.PI*h/180),d.tl.x=f,d.tl.y=h,this.$d.ad.x=this.x,this.$d.ad.y=this.y);1>=this.Eo?(this.im+=a,150<this.im&&(this.sp=
"red"===this.sp?bf.fillColor:"red",this.im=0)):this.sp=bf.fillColor;b-=M.Cd;c-=M.Dd;c-=$.X;c=ec(this.qb,this.x,this.y,b,c);this.$d.visible=!0;this.dm=c||I.ia[0].zb?Math.min(1,this.dm+.003*a):Math.max(0,this.dm-.003*a);c?(this.wi=Math.min(1,this.wi+.003*a),this.$d.visible=!1):this.wi=Math.max(0,this.wi-.003*a)};
function oj(a,b){var c,d,f,h;c=a.aa.indexOf(b);if(-1!==c)for(G.play(Hf),++a.ut,a.aa[0]=a.aa.splice(c,1,a.aa[0])[0],"function"===typeof a.aa[0].Po&&a.aa[0].Po(),c=0;c<a.aa.length;c++)b=a.aa[c],d=a.a.aa[c].x+a.x,f=a.a.aa[c].y+a.y,h=a.a.aa[c].scale,b.moveTo(d,f,h)}e.ih=function(a){32===a&&!0===$.e.bb&&oj(this,this.aa[1])};
e.Nb=function(a,b,c){if(0===a&&!0===$.e.bb){a=!0;var d="object"===typeof b?new g(b.x-M.Cd,b.y-M.Dd):new g(b-M.Cd,c-M.Dd);d.y-=$.X;ec(this.qb,this.x,this.y,d.x,d.y)&&(a=!1);if(!0===a&&!0===this.Nm){nj(this,b,c);b=this.aa.shift();b.Vs(this.rotation);b.iy=!0;c=$.uq;for(var f in c.mb)c.mb[f]=Math.max(0,c.mb[f]-1);this.Is=b;$.Jc.mi()}else oj(this,this.aa[1])}};e.Pc=function(a){a===M.af&&hj(this)};
e.ya=function(){Od.V(0,this.x,this.y+$.X,1*$.Za,1*$.Za,0,this.alpha);this.b.V(0,this.x,this.y+$.X,1*$.Za,1*$.Za,this.rotation,this.alpha*(1-this.wi));10>=this.ut&&this.cm.V(this.x+N(35,"floor")-Hd.fb,this.y+N(24,"floor")+$.X-Hd.Ca,1,1,0,this.dm)};function pj(a,b,c){qj(this,a,b,c)}pj.qb=new Zb(0,0,Wd.width/2);
function qj(a,b,c,d){a.depth=4;a.visible=!0;a.h=!1;a.group="gameObject";M.d.Na(a,M.Xe);a.position=new g(b,c);a.lb=a.position.x;a.Ya=a.position.y;a.alpha=1;a.speed=0;a.scale=1;a.b=Wd;a.size=Wd.width/2;a.type=d;a.qb=pj.qb;a.Ac=!1;a.iy=!0;a.direction=new g(0,-1);a.le=["bubble"];a.Do=0;a.ps=0;J(a);Sb(a,"game")}e=pj.prototype;e.tb=function(){};
function rj(a){var b;a.sa("game");b=new ri(a,{scale:1.1},300,L,function(){b=new ri(a,{scale:1},300,L,function(){a.sa("background")});b.group="gameObject";b.start()});b.group="gameObject";b.start()}function sj(a,b){a.direction.x=-Math.sin(Math.PI*b/180);a.direction.y=-Math.cos(Math.PI*b/180)}e.Fm=function(){this.speed=$.Za*M.a.l.Ja.speed};e.Vs=function(a){G.play(Gf);sj(this,a);this.Fm();this.h=!0};e.sa=function(){};e.Wk=function(){$.U.mi(this);this.speed=0;this.h=!1;return!0};
function tj(a,b,c){var d;c="undefined"!==typeof c?c:!0;a.sa("game");b*=a.speed;for(var f=0;f<b;){f+=1;a.position.x+=1*a.direction.x;a.position.y+=1*a.direction.y;a.lb=a.position.x;a.Ya=a.position.y;var h=[];c&&a.position.x<a.size?h.push(new g(-a.direction.x,a.direction.y)):c&&a.position.x>M.tc-a.size&&h.push(new g(-a.direction.x,a.direction.y));if(a.position.y>M.Ni+a.size-$.X){a.remove();break}if(0<h.length){var k=new g(0,0);for(d=0;d<h.length;++d)k=k.add(h[d]);0===k.length()&&console.log("bounceDirectionAverage is 0");
k=k.normalize();a.direction=k}if(d=!a.Ac)d=$.U,h=void 0,a.position.y<$.pa?d=!0:(h=uj(d,a.position.x,a.position.y),d=!1!==vj(d,h.Ra,h.position)?!0:!1),d=!0===d;if(d&&a.Wk())break}}function wj(a){a.Ac=!0;$.Jc&&kj()}e.ba=function(a){$.e.bb?tj(this,a):this.speed&&this.pop()};
function xj(a,b,c){var d;!1===a.Ac&&("undefined"!==typeof a.Fa&&K(I,a.Fa),a.sa("game"),d=M.a.l.ua.Eu,c=(new g(b,c)).Vb(new g(a.position.x,a.position.y)).normalize().scale(d),b=a.position.x-c.x,c=a.position.y-c.y,a.Fa=new ri(a,{lb:b,Ya:c},M.a.l.ua.vq/2,vc,function(){a.Fa=new ri(a,{lb:a.position.x,Ya:a.position.y},M.a.l.ua.vq/2,vc,function(){!1===a.Ac&&a.sa("background")});a.Fa.group="gameObject";a.Fa.start()}),a.Fa.group="gameObject",a.Fa.start())}
function dj(a){var b=Si($.e)-(a.position.y-$.pa);0>b?(fj(),a.Do||(a.Do=I.ve)):b<N(90)&&(a.ps=1-b/N(90),$.e.Ue&&!$.e.Ue.Ac?$.e.Ue.position.y<a.position.y&&($.e.Ue=a):$.e.Ue=a)}
e.moveTo=function(a,b,c){var d;!1===this.Ac&&("undefined"!==typeof this.Fa&&K(I,this.Fa),this.sa("game"),this.position.x=a,this.position.y=b,a="undefined"!==typeof c?c:this.scale,d=this,this.Fa=new ri(this,{lb:this.position.x,Ya:this.position.y,scale:a},M.a.l.ua.rl,L,function(){!1===d.Ac&&d.sa("background")}),this.Fa.group="gameObject",this.Fa.start())};
function yj(a,b){var c,d,f;!1===a.Ac&&(c=uj($.U,a.position.x,a.position.y),"undefined"!==typeof $.U.D[c.Ra][c.position]&&(a.sa("game"),wj(a),Rb(a,0),d=new pj(a.position.x,a.position.y,b),rj(d),f=new ri(a,{alpha:0},600,L),f.group="gameObject",f.start(),f=new ri(a,{scale:1.1},300,L,function(){f=new ri(a,{scale:1},300,L,function(){a.remove()});f.group="gameObject";f.start()}),f.group="gameObject",f.start(),$.U.D[c.Ra][c.position]=d))}
e.pop=function(){var a,b;!1===this.Ac&&(this.sa("game"),Rb(this,3),wj(this),"undefined"!==typeof this.Fa&&K(I,this.Fa),a=new ri(this,{lb:this.position.x,Ya:this.position.y},M.a.l.ua.rl,L),a.group="gameObject",a.start(),b=this,a=new ri(this,{scale:M.a.l.ua.hx},M.a.l.ua.gx,rc,function(){K(I,b);new zj(b.position.x,b.position.y,b.depth,Td,M.a.l.ua.kj,1)}),a.group="gameObject",a.start())};
e.Hi=function(){if(!1===this.Ac){var a,b;this.sa("game");Rb(this,3+Kd.G);wj(this);"undefined"!==typeof this.Fa&&K(I,this.Fa);a=new ri(this,{lb:this.position.x,Ya:this.position.y},M.a.l.ua.rl,L);a.group="gameObject";a.start();b=this;a=new ri(this,{scale:M.a.l.ua.vn},M.a.l.ua.Hk,rc,function(){K(I,b);new zj(b.position.x,b.position.y,b.depth,Pd,M.a.l.ua.Gk,1)});a.group="gameObject";a.start()}};
e.rh=function(){switch(this.type){case 0:G.play(Af);break;case 1:G.play(Bf);break;case 2:G.play(Cf);break;case 3:G.play(Df);break;case 4:G.play(Ef);break;case 5:G.play(Ff)}};
function Aj(a){var b;!1===a.Ac&&(a.sa("game"),Rb(a,3),wj(a),"undefined"!==typeof a.Fa&&K(I,a.Fa),b=M.a.l.ua.ev,a.position.x+=Math.random()*b-b/2,a.position.y+=M.Ni,b=new ri(a,{Ya:a.position.y},M.a.l.ua.br,uc,function(){K(I,a)}),b.group="gameObject",b.start(),b=new ri(a,{lb:a.position.x},M.a.l.ua.br,L),b.group="gameObject",b.start())}e.remove=function(){this.sa("game");K(I,this);wj(this)};
function Bj(a){0<a.Do?Ud.V(0,a.position.x,a.position.y+$.X,a.scale*$.Za,a.scale*$.Za,0,(Math.sin(I.ve/1E3*Math.PI*2)+1)/2):Ud.V(0,a.position.x,a.position.y+$.X,a.scale*$.Za,a.scale*$.Za,0,(Math.sin(I.ve/1E3*Math.PI*6)+1)/2*a.ps)}e.Hg=function(a,b){Bj(this);this.b.V(this.type,a,b+$.X,this.scale*$.Za,this.scale*$.Za,0,this.alpha)};e.ya=function(){0<this.Ya+$.pa+$.X&&this.Hg(this.lb,this.Ya)};
function $i(){this.depth=-9E3;this.h=this.visible=!1;this.group="gameObject";var a=Gi(0,0);this.x=a.x-N(6);this.y=a.y;this.Zm=[];M.d.Na(this,M.Zf);J(this);Sb(this,"game")}$i.prototype.ba=function(){};$i.prototype.ec=function(){m.sa(this.canvas)};$i.prototype.mi=function(a){this.Zm.push(a);m.sa(this.canvas);a.ya()};$i.prototype.kf=function(a){a=this.Zm.indexOf(a);-1!==a&&this.Zm.splice(a,1);this.h=!0};function Cj(a,b,c){this.Ra=a;this.position=b;c&&(this.Ja=c)}
function aj(){this.depth=9E3;this.visible=!0;this.h=!1;this.group="gameObject";this.D=[];this.bs=this.Pg=this.rd=0;this.random=new ga;M.d.Na(this,M.Zf);this.ye=Math.sqrt(Math.pow(2*$.pa,2)-Math.pow($.pa,2));this.Cn=[];J(this);Sb(this,"game")}aj.prototype.ya=function(){ji(M.Cd,M.Dd,M.tc,M.Ni);for(var a=0;a<this.D.length;++a)for(var b=this.D[a],c=0;c<b.length;++c){var d=b[c];d&&d.sz&&d.Hg(d.lb+M.Cd,d.Ya+M.Dd)}};
function Dj(a){for(var b=[0,0,0,0,0,0],c=0;c<a.D.length;++c)for(var d=a.D[c],f=0;f<d.length;++f){var h=d[f];h&&5>=h.type&&0<=h.type&&b[h.type]++}return b}
function Ej(a,b,c){b=b||2;var d;c?d=null:(d=$.Jc,d=0<d.aa.length?d.aa[0].type:void 0);c=c?null:$.Jc.Is?$.Jc.Is.type:null;for(var f=0,h=-1,k=a.D.length;0<=k;--k)for(var l=a.D[k],n=Math.floor(M.tc/(2*$.pa))-(k%2===a.rd?0:1),q=0;q<n;++q){var u=Math.floor((n-1)/2)+Math.ceil(q/2)*(1-(q+1)%2*2);if(!l||!l[u])for(var B=Fj(a,k,u,[]),D=0;D<B.length;++D){var s=B[D].Ja;if(s&&5>=s.type&&0<=s.type&&s.type!==d&&s.type!==c){var t=Gj(a,k,u,s.type,[],!0);t>=f&&(h=s.type,f=t)}}}return-1!==h?h:1<b?Ej(a,1,!0):Ij(new Jj)}
function lj(){var a,b=$.U;a=a||Dj(b);for(var b=[],c=0;c<a.length;++c)0<a[c]&&b.push(c);0===b.length&&b.push(Ij(new Jj));return b}function uj(a,b,c){c=Math.round((c-$.pa)/a.ye)+a.bs;c=Math.max(c,0);c%2===a.rd?(a=Math.round((b-$.pa)/(2*$.pa)),a=Math.max(Math.min(a,Math.floor(M.tc/(2*$.pa))-1),0)):(a=Math.round((b-2*$.pa)/(2*$.pa)),a=Math.max(Math.min(a,Math.floor(M.tc/(2*$.pa))-2),0));return new Cj(c,a)}function Kj(a,b,c){return{x:c*$.pa*2+$.pa*(b%2===a.rd?1:2),y:(b-a.bs)*a.ye+$.pa}}
function Lj(a){var b,c,d,f,h;f=[];for(b=0;b<a.D.length;b++)for(d=a.D[b],c=0;c<d.length;c++)h=d[c],"undefined"!==typeof h&&f.push({Ja:h,Ra:b,position:c});return f}function vj(a,b,c){return"undefined"!==typeof a.D[b]&&"undefined"!==typeof a.D[b][c]?a.D[b][c]:!1}
function Ti(){var a=$.U,b=$.n.n.cb,c,d,f,h,k,l,n,q;d=Math.sqrt(Math.pow(2*$.pa,2)-Math.pow($.pa,2));var u=new Jj;for(h=1;h<=b;h++){a.rd=(a.rd+1)%2;c=Math.floor(M.tc/(2*$.pa))-a.rd;f=[];n=-d*h+$.pa+d*b;for(k=0;k<c;k++){l=0===a.rd%2?k*$.pa*2+$.pa:k*$.pa*2+2*$.pa;a:{q=u;for(var B=n,D=b-h,s=$.U.random.random(q.km),t=0,v=0;v<q.yd.length;++v)if(t+=q.yd[v],t>s||0===D){if(5>=v||0===D){q=new pj(l,B,-1);break a}if(6===v){q=new Mj(l,B);break a}}q=void 0}f.push(q)}a.D.splice(0,0,f);for(k=0;k<c;++k)if(q=a.D[0][k],
-1===q.type)a:for(f=u,n=k,l=(t=10*$.n.n.bc>$.U.random.random(1E3))?1:$.n.n.Gb,B=[],D=0,s=[],q.Mv=t;;){for(var v=$.U.random.random(f.Bg),x=0,t=0;5>=t;++t)if(x+=f.yd[t],x>v)if("undefined"===typeof B[t]&&(B[t]=Gj($.U,0,n,t,void 0,void 0,l+1)),B[t]>=l){s[t]||(s[t]=!0,D++);break}else{q.type=t;break a}if(D>=f.Cy)for(s=[],t=0;t<B.length;++t)B[t]--}}}
function Gj(a,b,c,d,f,h,k){var l=0;h=h||!1;b=[new Cj(b,c)];for(f=f||[];1<=b.length;){c=b[0];f.push(c.Ja);c=Fj(a,c.Ra,c.position,f);for(var n=0;n<c.length;n++){var q=c[n];f.push(q.Ja);d===q.Ja.type&&(q.Ja.Mv&&(h||(l+=k?k:99)),b.push(q),++l)}b.splice(0,1)}return l}
function gj(){var a=$.U;function b(a,b){h.Y(a,function(){Aj(b)})}var c,d,f,h=new Ii,k=Math.floor(M.tc/(2*$.pa)),l=0;for(c=a.D.length-1;0<=c;c--){f=a.D[c];var n=0;for(d=0;d<f.length;d++)"undefined"!==typeof f[d]&&n++;for(d=0;d<f.length;d++){var q=f[d];"undefined"!==typeof q&&b(20*l+20*Math.abs(d-k/2),q)}l+=n}gc(h);h.start()}
function Nj(a,b){var c,d,f,h=null,k=null,l,n;l=[];for(c=0;c<a.D.length;c++)for(d=a.D[c],f=c,n=Math.floor(M.tc/(2*$.pa))-(f%2===a.rd?0:1),f=0;f<n;f++)Oj(a,c,f)||"undefined"===typeof d[f]&&l.push(new Cj(c,f));f=a.D.length;n=Math.floor(M.tc/(2*$.pa))-(f%2===a.rd?0:1);for(c=0;c<n;c++)Oj(a,a.D.length,c)||l.push(new Cj(a.D.length,c));for(c=0;c<l.length;c++)if(d=l[c],0===d.Ra||0<Fj(a,d.Ra,d.position).length)if(f=Kj(a,d.Ra,d.position),f=b.position.Vb(new g(f.x,f.y)).length(),f<h||null===h)h=f,k=d;f=Kj(a,
k.Ra,k.position);"undefined"===typeof a.D[k.Ra]&&(a.D[k.Ra]=[]);a.D[k.Ra][k.position]=b;b.moveTo(f.x,f.y);return k}
aj.prototype.mi=function(a){var b=0,c,d,f,h,k,l,n,q,u;n=this;this.Pg++;u=!0;l=new Ii;l.group="gameObject";d=0;c=Nj(this,a);var B=0;h=Pj(this,c.Ra,c.position);if(3<=h.length){u=!1;for(f=q=0;f<h.length;f++)this.kf(h[f].Ra,h[f].position),++b,++q,d+=M.a.l.ua.ex*Math.pow(f+1,M.a.l.ua.fx),l.Y(d,function(a,b){return function(){a.pop();B+=Wi($.e,a.position.x,a.position.y,1,b,!1)}}(h[f].Ja,q));10<h.length&&G.play(pf);6<h.length?G.play(sf):6<h.length?G.play(tf):5<h.length?G.play(uf):4<h.length?G.play(vf):a.rh();
var D=new g(0,0);k=Qj(this);for(f=0;f<k.length;f++)this.kf(k[f].Ra,k[f].position),++b,d+=M.a.l.ua.ar,l.Y(d,function(a){return function(){Aj(a)}}(k[f].Ja)),D=D.add(k[f].Ja.position);0<k.length?(D=D.scale(1/k.length),l.Y(d,function(){Wi($.e,D.x,D.y,k.length,k.length,!0,B)})):l.Y(d,function(){Wi($.e,a.x,a.y,0,0,!1,B)})}else G.play(zf);c=Fj(this,c.Ra,c.position);for(f=0;f<c.length;f++)h=c[f].Ja,q=c[f].Ra,"bomb"===h.type?(h.rh(),h.Hi()):q!==this.maxLength-1&&u&&xj(h,a.position.x,a.position.y);l.Y(d,function(){n.Pg--});
0===b&&dj(a);l.start()};aj.prototype.kf=function(a,b){!1!==vj(this,a,b)&&(this.D[a][b]=void 0)};
function Fj(a,b,c,d){var f,h,k,l;h=b%2===a.rd?[new Cj(b-1,c-1),new Cj(b-1,c),new Cj(b,c+1),new Cj(b+1,c),new Cj(b+1,c-1),new Cj(b,c-1)]:[new Cj(b-1,c),new Cj(b-1,c+1),new Cj(b,c+1),new Cj(b+1,c+1),new Cj(b+1,c),new Cj(b,c-1)];f=[];for(k=0;k<h.length;k++)b=h[k].Ra,c=h[k].position,"undefined"!==typeof a.D[b]&&"undefined"!==typeof a.D[b][c]&&(l=a.D[b][c],("undefined"!==typeof d?-1===d.indexOf(l):1)&&f.push({Ja:l,Ra:b,position:c}));return f}
function Pj(a,b,c){var d,f,h,k,l;h=a.D[b][c];f=[new Cj(b,c,h)];d=d||[];for(b=[new Cj(b,c,h)];1<=f.length;){c=f[0];d.push(c.Ja);k=Fj(a,c.Ra,c.position,d);for(c=0;c<k.length;c++)l=k[c],d.push(l.Ja),h.type===l.Ja.type&&(f.push(l),b.push(l));f.splice(0,1)}return b}
function Qj(a){var b,c,d,f,h,k;if("undefined"===typeof a.D[0])return Lj(a);c=[];b=b||[];f=!0;for(d=0;d<a.D[0].length;d++)h=a.D[0][d],"undefined"===typeof h?f=!0:!0===f&&(f=!1,c.push({Ja:h,Ra:0,position:d}));for(;1<=c.length;){d=c[0];b.push(d.Ja);h=Fj(a,d.Ra,d.position,b);for(d=0;d<h.length;d++)f=h[d],-1===b.indexOf(f.Ja)&&(c.push(f),b.push(f.Ja));c.splice(0,1)}f=[];for(d=0;d<a.D.length;d++)for(k=a.D[d],c=0;c<k.length;c++)h=k[c],-1===b.indexOf(h)&&"undefined"!==typeof h&&f.push({Ja:h,Ra:d,position:c});
return f}function Rj(a){var b,c,d,f,h;h=c=0;f=new Ii;f.group="gameObject";b=Qj(a);for(d=0;d<b.length;d++)a.kf(b[d].Ra,b[d].position),c+=M.a.l.ua.ar,h++,f.Y(c,function(a){return function(){Aj(a)}}(b[d].Ja));f.start();return h}function cj(){var a=$.U,b,c,d,f;for(b=0;b<a.D.length;b++)for(d=a.D[b],c=0;c<d.length;c++)if(f=d[c])return!1;return!0}
function Sj(a,b,c){var d=$.U,f,h,k,l,n,q;d.Pg++;l=$.n.I.ka;n=M.a.l.I.wn;k=new Ii;k.group="gameObject";k.Od=n;h=new g(a,b);a=Lj(d);for(b=0;b<a.length;b++)f=a[b].Ja,q=h.Vb(f.position).length(),q<l&&"bomb"!==f.type&&"blocker"!==f.type&&k.Y(q,function(a){return function(){yj(a,c)}}(f));k.Y(l+M.a.l.ua.kj*n,function(){d.Pg--;kj()});k.start()}
function Tj(a,b){var c=$.U,d,f,h,k,l,n,q,u,B,D,s;c.Pg++;u=$.n.u.ka;B=M.a.l.u.wn;D=0;q=new Ii;q.group="gameObject";q.Od=B;n=new g(a,b);d=Lj(c);for(f=0;f<d.length;f++)h=d[f].Ja,k=d[f].Ra,l=d[f].position,s=n.Vb(h.position).length(),0===s&&c.kf(k,l),s<u&&(c.kf(k,l),D++,q.Y(s,function(a){return function(){a.Hi()}}(h)));D+=Rj(c);q.Y(u+(M.a.l.ua.Gk+M.a.l.ua.Hk)*B,function(){c.Pg--});q.start();Wi($.e,a,b,D,D,!0)}function Oj(a,b,c){"undefined"===typeof a.Cn[b]&&(a.Cn[b]=[]);return!0===a.Cn[b][c]}
function zj(a,b,c,d,f,h,k){this.depth=c;this.h=this.visible=!0;this.group="gameObject";M.d.Na(this,M.eh);this.x=a;this.y=b;this.b=d;this.duration=f;this.scale=h;this.oa=0;this.rotation=k||0;J(this);Sb(this,"game");this.m=0}zj.prototype.ba=function(a){this.m+=a;this.oa=this.rotation;this.m>=this.duration&&(K(I,this),this.visible=!1)};zj.prototype.ya=function(){var a=Gi(this.x,this.y);this.b.V(Math.floor(this.m*this.b.G/this.duration),a.x,a.y+$.X,this.scale*$.Za,this.scale*$.Za,this.oa,1)};
function Uj(){this.Ua=this.depth=0;this.h=this.visible=!0;J(this);Sb(this,"game")}Uj.prototype.Un=function(){var a,b,c,d;a=[];b=[Bd,Cd,Dd,Ed,Fd,Gd];for(c=0;c<b.length;c+=1)d=b[c],a.push({b:d,text:M.k.K("TutorialText_"+c,"<TutorialText_"+c+">"),title:M.k.K("TutorialTitle_"+c,"<TutorialHeader_"+c+">")});return a};
function jj(a,b){this.depth=11;this.h=this.visible=!0;this.group="gameObject";M.d.Na(this,M.Xe);this.ad=new g(a,b);this.tl=new g(0,-1);this.alpha=0;this.a=M.a.l.$d;this.D=[];J(this);Sb(this,"game")}
function Vj(a,b){var c,d,f,h,k=null,l;l=$.pa;c=Lj($.U);for(d=0;d<c.length;d++)f=c[d].Ja,h=new g(f.lb,f.Ya),h=a.Vb(h).Vb(b.scale(a.Vb(h).Sf(b))).length(),h<=l&&(null===k||f.Ya>k.Ya?k=f:f.Ya===k.Ya&&Math.abs(f.lb-a.x)<Math.abs(k.lb-a.x)&&(k=f));k?(h=a.Vb(new g(k.lb,k.Ya)),c=2*h.Sf(b),l=h.Sf(h)-Math.pow(l,2),h=Math.pow(c,2)-4*l,l=(-c+Math.sqrt(h))/2,h=(-c-Math.sqrt(h))/2):(l=Math.abs(a.x/b.x),h=Math.abs(a.y/b.y));l=Math.min(l,h);return[b.scale(l).add(a)]}
jj.prototype.ba=function(){this.D=0!==this.alpha&&1===this.a.ur?[this.ad].concat(Vj(this.ad,this.tl)):[]};jj.prototype.Mb=function(){this.Fa&&K(I,this.Fa);this.Fa=new ri(this,{alpha:1},400,L);this.Fa.group="gameObject";this.Fa.start()};jj.prototype.Nb=function(){this.Fa&&K(I,this.Fa);this.Fa=new ri(this,{alpha:0},400,L);this.Fa.group="gameObject";this.Fa.start()};
jj.prototype.ya=function(){var a,b,c,d,f,h;switch(this.a.ur){case 1:d=m.context;d.lineWidth=this.a.lineWidth;d.strokeStyle="rgba(255, 255, 255, "+.2*this.alpha+")";c=this.a.Uu;h=0;for(f=1;f<this.D.length;f++){d.beginPath();d.moveTo(this.D[f-1].x,this.D[f-1].y+$.X);d.lineTo(this.D[f].x,this.D[f].y+$.X);for(var k=this.D[f].Vb(this.D[f-1]).normalize(),l=this.D[f].Vb(this.D[f-1]).length(),n=this.D[f-1];h<l;h+=2*c)d.beginPath(),a=k.scale(h).add(n),b=k.scale(Math.min(l,h+c)).add(n),d.moveTo(a.x,a.y+$.X),
d.lineTo(b.x,b.y+$.X),d.stroke();h-=l}2<=this.D.length&&Sd.hd(0,this.D[this.D.length-1].x,this.D[this.D.length-1].y+$.X,this.alpha);break;case 2:Rd.V(0,this.ad.x,this.ad.y+$.X,1,1,this.tl.direction()-90,this.alpha)}};function Wj(a,b){qj(this,a,b,0);this.h=!0;this.b=Ld;this.type="blank";this.N=new r(this.b.width,this.b.height);mj(this,Xj())}eg(pj,Wj);function mj(a,b){w(a.N);a.en=b;Wd.p(a.en,a.b.fb,a.b.Ca);a.b.p(0,a.b.fb,a.b.Ca);y(a.N)}Wj.prototype.Po=function(){G.play(yf)};
Wj.prototype.Wk=function(){Nj($.U,this);Sj(this.position.x,this.position.y,this.en);this.h=!1;this.rh();return!0};Wj.prototype.rh=function(){G.play(rf)};Wj.prototype.Hg=function(){this.N.V(this.lb-this.b.fb*this.scale*$.Za,this.Ya+$.X-this.b.Ca*this.scale*$.Za,this.scale*$.Za,this.scale*$.Za,0,this.alpha)};function Yj(a,b){qj(this,a,b,0);this.b=Id;this.type="bomb";this.un=!1}eg(pj,Yj);e=Yj.prototype;e.Wk=function(){Nj($.U,this);this.Hi();return!0};
e.Hi=function(){!1===this.un&&(this.rh(),this.h=!1,this.un=!0,Tj(this.position.x,this.position.y),this.pop())};e.pop=function(){var a,b;!1===this.Ac&&(this.Ac=!0,"undefined"!==typeof this.Fa&&this.Fa.finish(),this.sa("game"),Rb(this,3),a=new ri(this,{lb:this.position.x,Ya:this.position.y},M.a.l.ua.rl,L),a.group="gameObject",a.start(),b=this,a=new ri(this,{scale:M.a.l.u.vn},M.a.l.u.Hk,rc,function(){K(I,b);new zj(b.position.x,b.position.y,b.depth,Pd,M.a.l.u.Gk,M.a.l.u.dv)}),a.group="gameObject",a.start())};
e.rh=function(){G.play(qf)};e.Hg=function(){this.b.V(0,this.lb,this.Ya+$.X,this.scale*$.Za,this.scale*$.Za,0,this.alpha)};function Zj(a,b){qj(this,a,b,"fire");M.d.Na(this,M.Xe);this.depth=1;this.h=!0;this.Tm=this.m=0;this.b=Jd;this.Xi=0;this.ze=!1;null===ak&&(ak=new Zb(0,0,this.size*M.a.l.md.Mu));this.qb=ak}eg(pj,Zj);var ak=null;e=Zj.prototype;e.Po=function(){G.play(wf)};e.Fm=function(){this.speed=$.Za*M.a.l.Ja.speed*M.a.l.md.Lx};
e.tb=function(){var a,b;a=this;$.e.tx||(b=new Ii,b.group="gameObject",b.Y(M.a.l.md.Ay,function(){a.Xi+=Rj($.U)}),b.start(),Wi($.e,this.position.x,this.position.y+N(80),this.Xi,this.Xi,!0));$.background.kf(this)};e.Vs=function(a){G.play(xf);var b=new Ii;b.group="gameObject";b.Y(100,function(){G.play(xf)});b.start();sj(this,a);this.Fm();this.yn=new bk(this.position.x,this.position.y);this.h=this.ze=!0};e.Wk=function(){return!1};
e.ba=function(a){this.Tm+=a;if(!0===this.ze){tj(this,a,M.a.l.md.Fu);(0>this.position.y+$.X+N(0)+this.size||0>this.position.x||this.position.x>M.tc)&&K(I,this);for(var b=0;b<a;++b)this.m+=1,this.m>=M.a.l.md.wp/Kd.G&&(this.yn=new bk(this.position.x,this.position.y),this.m-=M.a.l.md.wp/Kd.G);this.yn.x=this.position.x;this.yn.y=this.position.y;a=$.U;var c,d,f,h,k;k=!1;b=Lj(a);for(c=0;c<b.length;c++)d=b[c].Ja,f=b[c].Ra,h=b[c].position,!0===cc(d.qb,d.lb,d.Ya,this.qb,this.position.x,this.position.y)&&(d.Hi(),
a.kf(f,h),k=!0);!0===k&&this.Xi++}this.canvas.$=!0};e.Hg=function(){var a=new g(this.lb,this.Ya),b=new g(0,0);this.b.V(Math.floor(this.Tm/80)%this.b.G,a.x+b.x,a.y+$.X+b.y,this.scale*$.Za,this.scale*$.Za,0,this.alpha)};function bk(a,b){this.depth=2;this.h=this.visible=!0;this.group="gameObject";M.d.Na(this,M.Xe);this.oa=0;this.vx=-.2+(new ga).random(.4);this.x=a;this.y=b;this.m=this.index=0;this.scale=M.a.l.md.scale;this.b=Kd;J(this);Sb(this,"game")}
bk.prototype.ba=function(a){this.m+=a;this.oa+=this.vx*a;this.m>=M.a.l.md.wp/this.b.G&&(this.index+=1,this.m=0,Rb(this,this.depth+1));this.index===this.b.G&&K(I,this)};bk.prototype.ya=function(){var a=new g(this.x,this.y);this.b.V(this.index,a.x,a.y+$.X,this.scale,this.scale,this.oa,1)};function Jj(){var a=$.n.dc;this.yd=[a.gc,a.red,a.mc,a.blue,a.cc,a.green,a.Yb];this.km=ck(this.yd,!1);this.Bg=ck(this.yd,!0);for(var b=a=0;5>=b;++b)0<this.yd[b]&&a++;this.Cy=a}
function ck(a,b){var c,d=0;for(c=0;c<(b?6:a.length);++c)a[c]&&(d+=a[c]);return d}function Ij(a){for(var b=$.U.random.random(a.Bg),c=0,d=0;5>=d;++d)if(c+=a.yd[d],c>b)return d;return 0}function Mj(a,b){qj(this,a,b,"blocker");this.b=Md;this.type="blocker";this.un=!1}eg(pj,Mj);Mj.prototype.Hg=function(){Bj(this);this.b.V(0,this.lb,this.Ya+$.X,this.scale*$.Za,this.scale*$.Za,0,this.alpha)};function Mi(){this.mb={u:0,fn:0,md:0,all:0}}
function dk(a){var b=$.n.ac;a.ek=[b.Zb,b.$b,b.u,b.I,b.qa,b.fc];a.km=ck(a.ek);$.Oc.Ah.L()}function Xj(){var a;a=a||lj();var b;b=0+ha($.Jc.random,a.length-1-0);return+a[b]}
function ij(a,b){var c=$.uq;dk(c);for(var d=0;;){for(var f=$.Jc.random.random(c.km),h=0,k=0;k<c.ek.length;++k)if(h+=c.ek[k],h>=f){if(0===k)return new pj(a,b,Xj());if(1===k){for(var c=a,d=b,f=new Jj,h=Dj($.U),l=0,k=void 0,k=0;6>k;++k)l=Math.max(h[k],l);for(var n=!0,k=0;6>k;++k)if(0!==h[k]&&h[k]!==l){n=!1;break}n&&(l+=1);for(k=0;6>k;++k)0!==h[k]?(h[k]=l-h[k],h[k]*=h[k]):h[k]=0;l=ck(h,!0);0===l&&Ij(f);n=[0,0,0,0,0,0];for(k=0;6>k;++k)n[k]=h[k]/l*f.yd[k];f.yd=n;f.Bg=ck(f.yd,!0);0===f.Bg&&(f.yd=h,f.Bg=
l);0===f.Bg&&(f.Bg=10);f=Ij(f);return new pj(c,d,f)}if(2===k){if(0<c.mb.u||0<c.mb.all)break;c.mb.u+=$.n.nb.u;c.mb.all+=$.n.nb.all;return new Yj(a,b)}if(3===k){if(0<c.mb.fn||0<c.mb.all)break;c.mb.fn+=$.n.nb.I;c.mb.all+=$.n.nb.all;return new Wj(a,b)}if(4===k){if(0<c.mb.md||0<c.mb.all)break;c.mb.md+=$.n.nb.qa;c.mb.all+=$.n.nb.all;return new Zj(a,b)}if(5===k)return new pj(a,b,Ej($.U))}++d;100===d&&dk(c);200===d&&(c.ek=[1],c.km=1)}throw"generateBoostOrBubble";}
var Mh=N(14),Nh=N(24),Lh={},Vh={background:{b:ce,zr:N(0),Ar:N(26),elements:[{T:"game_ui_STAGE",x:N(6)+Mh,y:N(52)+Nh,lc:N(100),uc:N(20),Je:.2,font:hf,Wf:{fillColor:"#959dd5",fontSize:N(20),te:"lower",align:"center",i:"top"}},{T:"game_ui_SCORE",x:N(6)+Mh,y:N(148)+Nh,lc:N(100),uc:N(20),Je:.2,font:hf,Wf:{fillColor:"#959dd5",fontSize:N(20),te:"lower",align:"center",i:"top"}},{T:"game_ui_HIGHSCORE",x:N(6)+Mh,y:N(272)+Nh,lc:N(100),uc:N(20),Je:.2,font:hf,Wf:{fillColor:"#959dd5",fontSize:N(20),te:"lower",
align:"center",i:"top"}}]},Cs:{x:N(8)+Mh,y:N(474)+Nh},at:{x:N(6)+Mh,y:N(86)+Nh,lc:N(100),uc:N(38),Je:.2,Ap:!1,separator:"",font:hf,Wf:{fontSize:N(38),fillColor:"#5564ac",align:"center",i:"top"}},Ns:{x:N(6)+Mh,y:N(178)+Nh,lc:N(100),uc:N(24),gm:50,Je:.2,Ap:!1,separator:"",bh:mi,font:hf,Wf:{fontSize:N(24),fillColor:"#5564ac",align:"center",i:"top"}},vr:{x:N(6)+Mh,y:N(298)+Nh,lc:N(100),uc:N(20),gm:50,bh:mi,Je:.2,Ap:!1,separator:"",font:hf,Wf:{fillColor:"#5564ac",fontSize:N(20),align:"center",i:"top"}}};
M.version=M.version||{};M.version.theme="1.1";Li.prototype.ya=function(){this.Ue&&!this.Ue.Ac&&(Si($.e),N(90));Yd.p(0,0,this.fk.L());0<$.X+ae.height-ae.Ca&&ae.p(0,0,$.X);0<$.X-ae.Ca&&sa(0,0,M.tc,$.X-ae.Ca,"#bcc3ff",!1)};M.version=M.version||{};M.version.configuration_poki_api="1.0.0";M.j=M.j||{};M.Mh=!1;M.j.Ai=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
M.j.Qq=function(a,b,c,d){var f={};M.j.Ai(a.Rj,f);f.fontSize=N(18);d=M.d.g(a.Lg,d.height,N(22));d=a.Kg-d;var h=M.k.K("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,f,a.Tj,a.Lg,a.Sj,N(22)),k=c(De,a.ii,k-28),k=k+N(6),f={};M.j.Ai(a.ki,f);f.fontSize=N(18);k=b("CoolGames\nwww.coolgames.com",f,a.Mg,k,a.Df,N(44));A(W.S(),f);k+=N(58)+Math.min(0,d-N(368));f={};M.j.Ai(a.Rj,f);f.fontSize=N(20);f.fillColor="#1A2B36";h=M.k.K("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,f,a.Tj,
k,a.Sj,N(22));k+=N(6);k=c(Ee,a.ii,k);k+=N(12);f={};M.j.Ai(a.ki,f);f.fontSize=N(18);f.fillColor="#1A2B36";k=b("Poki.com/company",f,a.Mg,k,a.Df,N(22));k+=N(16);f={};M.j.Ai(a.ki,f);b("\u00a9 2020",f,a.Mg,k,a.Df,N(44));return[]};M.j.Ri=function(){return[]};M.j.fd=function(){M.e.fd()};
M.j.Uk=function(){function a(){__flagPokiInitialized?(function(){  /* function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})() */ }(),M.e.fd(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=M.a.w.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};M.j.il=function(a){PokiSDK.gameLoadingProgress({percentageDone:a/150})};M.j.Vk=function(){PokiSDK.gameLoadingFinished();M.e.fd()};
M.j.Vl=function(a){if(M.Mh)a&&a();else{M.Mh=!0;try{M.e.bo(),qb("master"),PokiSDK.commercialBreak().then(function(){M.e.Si();rb("master");a&&a();M.Mh=!1})["catch"](function(b){console.log("error"+b);M.e.Si();rb("master");a&&a();M.Mh=!1})}catch(b){console.log("error"+b),M.e.Si(),a&&a(),M.Mh=!1}}};M.j.xB=function(a){M.j.Vl(a)};M.j.Dr=function(){M.j.Vl(function(){PokiSDK.gameplayStart()})};M.j.jh=function(){M.j.Vl(function(){M.e.fd()})};M.j.Er=function(){PokiSDK.happyTime(.5);PokiSDK.gameplayStop();M.j.Vl(function(){PokiSDK.gameplayStart()})};
M.j.Cr=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};M.j.lr=function(a,b){void 0===M.e.Ae&&(M.e.Ae=new bg(!0));cg(a,b)};M.j.yp=function(a){void 0===M.e.Ae&&(M.e.Ae=new bg(!0));dg(a)};M.j.Fd=function(a){window.open(a)};M.j.De=function(a){"inGame"===a&&PokiSDK.gameplayStop()};M.j.Ku=function(a){"inGame"===a&&PokiSDK.gameplayStart()};M.j.Jv=function(){};M=M||{};M.cq=M.cq||{};M.cq.Uy={iz:""};
function ek(){this.depth=-1E6;this.h=this.visible=!0;this.Ua=M.ue;this.end=this.za=this.lo=this.ko=this.load=this.wc=!1;this.zn=0;this.Ep=this.Ej=!1;this.state="GAME_INIT";this.screen=null;this.ts=this.yb=this.C=0;this.An=!1;this.gl=this.hl=!0;this.Lw=1;this.zd=!1;this.Uc={};this.ra={difficulty:1,playMusic:!0,playSFX:!0,language:M.k.Rk()};window.addEventListener("gameSetPause",this.bo,!1);window.addEventListener("gameResume",this.Si,!1);document.addEventListener("visibilitychange",this.zv,!1);this.xg=
"timedLevelEvent"}e=ek.prototype;e.bo=function(){G.pause("master");I.pause()};e.Si=function(){G.nj("master");Bb(I);Gb(I);Kb(I);I.nj()};e.zv=function(){document.hidden?M.e.bo():M.e.Si()};
e.Pe=function(){var a,b=this;void 0!==M.a.W.background&&void 0!==M.a.W.background.color&&(document.body.style.background=M.a.W.background.color);M.Oa=new kg;M.A.Yk&&M.A.Yk.h&&(b.St=Fh(function(a){b.St=a}));M.o=M.a.l.Xf||{};M.o.Yd=M.o.Yd||"level";M.o.xh=void 0!==M.o.xh?M.o.xh:"level"===M.o.Yd;M.o.ma=void 0!==M.o.ma?M.o.ma instanceof Array?M.o.ma:[M.o.ma]:[20];M.o.Ci=void 0!==M.o.Ci?M.o.Ci:"locked";M.o.Wl=void 0!==M.o.Wl?M.o.Wl:"difficulty"===M.o.Yd;M.o.Bj=void 0!==M.o.Bj?M.o.Bj:!1;M.o.ep=void 0!==
M.o.ep?M.o.ep:"level"===M.o.Yd;M.o.Zg=void 0!==M.o.Zg?M.o.Zg:"max";M.o.$o=void 0!==M.o.$o?M.o.$o:"number";M.j.lr(null,function(a){var d,f,h;a&&(b.Uc=a);b.ra=mg("preferences",{});b.ra.difficulty=void 0!==b.ra.difficulty?b.ra.difficulty:1;void 0!==M.o.rt&&0>M.o.rt.indexOf(Bg())&&(b.ra.difficulty=M.o.rt[0]);b.ra.playMusic=void 0!==b.ra.playMusic?b.ra.playMusic:!0;b.gf(b.ra.playMusic);b.ra.playSFX=void 0!==b.ra.playSFX?b.ra.playSFX:!0;b.Hl(b.ra.playSFX);b.ra.language=void 0!==b.ra.language&&M.k.Lv(b.ra.language)?
b.ra.language:M.k.Rk();M.k.Rs(b.ra.language);void 0===Kg(b.C,0,"state",void 0)&&fk(b.C,0,"state","unlocked");if(M.o.xh)if("locked"===M.o.Ci)for(h=!1,d=0;d<M.o.ma.length;d++){for(a=0;a<M.o.ma[d];a++)if(f=Kg(d,a,"state","locked"),"locked"===f){b.C=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.ra.lastPlayed&&(b.C=b.ra.lastPlayed.world||0)});b.Kh=gk();void 0!==b.Kh.authToken&&void 0!==b.Kh.challengeId&&(b.zd=!0);M.A.UB&&(this.Xb=this.QB?new TestBackendServiceProvider:new BackendServiceProvider,
this.Xb.Gr(function(a){a&&M.e.Xb.Zz(b.Kh.authToken)}));a=parseFloat(da.r.version);G.eb&&(da.$a.Fp&&da.r.sl||da.r.Eh&&a&&4.4>a)&&(G.Pj=1);this.wc=!0;this.Zk=0};function gk(){var a,b,c,d,f;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,f=a.length;d<f;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function hk(a){a.state="GAME_LOAD";a.screen=new vg(function(){M.e.load=!0;vh(M.e,!0);M.Qd.Vk();M.j.Vk()},function(a){M.Qd.il(a);M.j.il(a)},M.A.AB)}
function vh(a,b){a.Ej=b||!1;a.Ep=!0;a.zn++}
function ik(){var a=M.e;a.zn--;switch(a.state){case "GAME_INIT":a.wc&&!a.WB&&(a.zd&&a.Xb&&a.Xb.FB(a.Kh.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.dp&&a.screen.dp("challengeLoadingError_notValid")}),hk(a));break;case "GAME_LOAD":if(a.load){if(a.zd&&a.Xb)if(a.Xb.Kv())zg(a),Cg(a.Xc.mode);else{a.screen.dp("challengeLoadingError_notStarted");break}K(I,a.screen);"function"===typeof Uj&&(M.l=new Uj);void 0!==M.A.nq&&!1!==M.A.nq.show&&M.d.qu();uh(a)}break;case "LEVEL_INIT":a.ko&&jk(a);
break;case "LEVEL_LOAD":a.lo&&kk(a);break;case "LEVEL_END":if(a.za)switch(th(),M.e.ko=!1,M.e.lo=!1,M.n=void 0,M.d.ag(M.Xe).$=!0,M.d.ag(M.Pk).$=!0,M.e.Nr){case "retry":Gg(M.e,M.e.yb);break;case "next":M.o.xh?M.e.yb+1<M.o.ma[M.e.C]?Gg(M.e,M.e.yb+1):M.e.C+1<M.o.ma.length?Gg(M.e,0,M.e.C+1):M.o.ep?(M.e.state="GAME_END",M.e.end=!0,vh(M.e,!1),M.j.uv()):M.e.screen=new Fg:Gg(M.e,0);break;case "exit":M.o.xh?M.e.screen=new Fg:uh(M.e)}break;case "GAME_END":a.end&&(a.end=!1,M.e.screen=null,M.e.screen=new xh)}}
e.fd=function(){M.e.Ep=!1};function oh(){var a;if(void 0!==M.e.Kh.more_games)try{return a=decodeURIComponent(M.e.Kh.more_games),function(){M.j.Fd(a)}}catch(b){}if("string"===typeof M.th.moreGamesUrl&&""!==M.th.moreGamesUrl)return function(){M.j.Fd(M.th.moreGamesUrl)};if(void 0!==M.A.Fw)return function(){M.j.Fd(M.A.Fw)};if("function"===typeof M.j.xv)return M.j.xv}function zg(a){if(a.zd&&void 0!==a.Xb)return void 0===a.Xc&&(a.Xc=a.Xb.Nz()),a.Xc}e.Li=function(a){M.e.zd&&M.e.Xb&&M.e.Xb.Li(a)};
e.vi=function(a){M.e.zd&&M.e.Xb&&M.e.Xb.vi(a)};function Bg(){return M.e.ra.difficulty}function sh(){switch(Bg()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+Bg();}}function $h(){var a="optionsDifficulty_"+sh();return M.k.K(a,"<"+a+">")}function Cg(a){M.e.ra.difficulty=a;og("preferences",M.e.ra)}e.gf=function(a){void 0!==a&&(M.e.ra.playMusic=a,og("preferences",M.e.ra),a?rb("music"):qb("music"));return M.e.ra.playMusic};
e.Hl=function(a){void 0!==a&&(M.e.ra.playSFX=a,og("preferences",M.e.ra),a?(rb("game"),rb("sfx")):(qb("game"),qb("sfx")));return M.e.ra.playSFX};e.language=function(a){void 0!==a&&(M.e.ra.language=a,og("preferences",M.e.ra));return M.e.ra.language};function fk(a,b,c,d){var f="game";"game"!==f&&(f="tg");void 0===M.e.Uc["level_"+a+"_"+b]&&(M.e.Uc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?M.e.Uc["level_"+a+"_"+b][f]=d:M.e.Uc["level_"+a+"_"+b][f][c]=d;M.j.yp(M.e.Uc)}
function Kg(a,b,c,d){var f="game";"game"!==f&&(f="tg");a=M.e.Uc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[f]:a[f][c],void 0!==a)?a:d}function mg(a,b){var c,d;"game"!==c&&(c="tg");d=M.e.Uc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function og(a,b){var c;"game"!==c&&(c="tg");void 0===M.e.Uc.game&&(M.e.Uc.game={tg:{},game:{}});void 0===a?M.e.Uc.game[c]=b:M.e.Uc.game[c][a]=b;M.j.yp(M.e.Uc)}
function Rg(a,b,c){var d=M.e;void 0===b&&(b=d.yb);void 0===c&&(c=d.C);return void 0===a?Kg(c,b,"stats",{}):Kg(c,b,"stats",{})[a]}function Gh(){var a=Rg("highScore",void 0,void 0);return"number"!==typeof a?0:a}function lk(){var a,b,c,d=0;for(a=0;a<M.o.ma.length;a++)for(b=0;b<M.o.ma[a];b++)c=Rg(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function uh(a){a.screen&&K(I,a.screen);a.screen=new yg;a.yb=-1}
function ji(a,b,c,d){var f;f=void 0!==M.a.W.Yi&&void 0!==M.a.W.Yi.backgroundImage?M.a.W.Yi.backgroundImage:void 0!==M.a.w.Yi?M.a.w.Yi.backgroundImage:void 0;M.d.sa(M.Yf);a=a||0;b=b||0;c=c||m.width;d=d||m.height;if(f)if(c=Math.min(Math.min(c,m.width),f.yi),d=Math.min(Math.min(d,m.height),f.Yg),void 0!==f){var h=a,k=b-M.lq,l,n,q;for(l=0;l<f.G;l+=1)n=l%f.qh*f.width,q=f.height*Math.floor(l/f.qh),n>h+c||n+f.width<h||q>k+d||q+f.height<k||f.Ha(l,h-n,k-q,c,d,a,b,1)}else sa(a,b,c,d,"white",!1)}
function Gg(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.C=c);a.yb=b;a.ko=!0;vh(a,!1);M.j.vv()}function jk(a){a.state="LEVEL_LOAD";a.lo=!0;vh(a,!1);M.j.wv()}
function kk(a){var b;if(a.C<M.o.ma.length&&a.yb<M.o.ma[a.C]){a.state="LEVEL_PLAY";a.ts+=1;a.za=!1;a.screen=null;ji(0,M.lq);b=M.Oa;var c=rh(a,3),d="progression:levelStarted:"+sh(),f=a.xg,h;for(h=0;h<b.la.length;h++)if(!b.la[h].h){b.la[h].m=0;b.la[h].paused=0;b.la[h].h=!0;b.la[h].bv=c;b.la[h].Vw=d;b.la[h].tag=f;break}h===b.la.length&&b.la.push({h:!0,m:0,paused:0,bv:c,Vw:d,tag:f});b.jb(c,d,void 0,M.na.Gc.Np);b.jb("Start:","progression:levelStart:"+c,void 0,M.na.Gc.Gj);for(b=0;b<a.C;b++);M.j.Dr(a.C,a.yb);
a.ra.lastPlayed={world:a.C,level:a.yb};M.n=new Li}}function Lg(a,b,c){var d=0;void 0===b&&(b=a.C);void 0===c&&(c=a.yb);for(a=0;a<b;a++)d+=M.o.ma[a];return d+c}function Zi(a,b,c,d){new yh(a,b,c,d)}function rh(a,b){var c,d=a.yb+"",f=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<f;c++)d="0"+d;return d}
function ej(){function a(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===M.o.Zg&&a>b||"min"===M.o.Zg&&a<b?!0:!1}var b=M.e,c={totalScore:$.Oc.oj.L(),stage:$.Oc.Ah.L()};b.state="LEVEL_END";var d,f,h,k,l,n,q={},u=rh(b,3),c=c||{};c.level=M.o.Bj?b.yb+1:Lg(b)+1;c.Br=!1;f=(d=Kg(b.C,b.yb,"stats",void 0))||{};if(void 0!==c.Xd||void 0!==c.Jb){void 0!==c.Xd&&(q[c.Xd.id]=c.Xd.S(),"highScore"===c.Xd.id&&(n=c.Xd));if(void 0!==c.Jb)for(k=0;k<c.Jb.length;k++)q[c.Jb[k].id]=c.Jb[k].S(),"highScore"===
c.Jb[k].id&&(n=c.Jb[k]);for(k in q)l=q[k],void 0!==l.vf&&(q[l.Zl].jd=l.vf(q[l.Zl].jd));void 0!==q.totalScore&&(h=q.totalScore.jd)}else h=c.totalScore,void 0!==h&&void 0!==c.timeBonus&&(h+=c.timeBonus);k="";if(!0!==c.failed){k="Complete:";if(void 0!==h){M.Oa.jb(k,"level:"+u,h,M.na.Gc.Gj);if(void 0===d||a(h,d.highScore))f.highScore=h,c.Br=!0,M.Oa.jb("highScore",":score:"+sh()+":"+u,h,M.na.Gc.Am);void 0!==n&&(n.jd=f.highScore);c.highScore=f.highScore}if(void 0!==c.stars){if(void 0===f.stars||f.stars<
c.stars)f.stars=c.stars;M.Oa.jb("stars",":score:"+sh()+":"+u,c.stars,M.na.Gc.Am)}b.yb+1<M.o.ma[b.C]?"locked"===Kg(b.C,b.yb+1,"state","locked")&&fk(b.C,b.yb+1,"state","unlocked"):b.C+1<M.o.ma.length&&"locked"===Kg(b.C+1,0,"state","locked")&&fk(b.C+1,0,"state","unlocked");fk(b.C,b.yb,void 0,{stats:f,state:"played"});void 0!==b.Xb&&(d=M.l&&M.l.pv?M.l.pv():lk(),void 0!==d&&b.Xb.OB(d,M.o.$o));qg(M.Oa,b.xg,u,"progression:levelCompleted:"+sh())}else M.Oa.jb("Fail:","level:"+u,h,M.na.Gc.Gj),qg(M.Oa,b.xg,
u,"progression:levelFailed:"+sh());var B={totalScore:h,level:c.level,highScore:c.highScore,failed:!0===c.failed,stars:c.stars,stage:c.stage},b=function(a){M.e.za=!0;M.e.Nr=a;vh(M.e,!0);M.j.jh(B);M.Qd.jh(B)};M.j.sn&&M.j.sn();void 0===c.customEnd&&new Sg(M.o.Yd,c,b)}e.qj=function(){M.e.De(!0)};
e.De=function(a,b,c){var d="inGame";M.e.screen instanceof yg?d="startScreen":M.e.screen instanceof Fg?d="levelMapScreen":b&&(d=M.e.Xc.Hq===M.e.Xc.dn?"inGame_challenger":"inGame_challengee");M.e.me||(M.e.me=new lh(d,!0===a,b,c))};
function pi(a){var b=[],c,d,f,h,k;M.e.me||M.e.Re||(M.e.Xc.Hq===M.e.Xc.dn?(c=M.k.K("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",f="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=M.k.K(b,"<"+b.toUpperCase()+"<");M.e.Re&&Ch(b);a&&eh()},h=function(){M.e.vi(k);return!0}):(c=M.k.K("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",f="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=M.k.K(b,"<"+b.toUpperCase()+"<");if(M.e.Re&&(Ch(b),a)){var b=M.k.K("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",M.e.Xc.LA[M.e.Xc.dn]),b=b.replace("<AMOUNT>",M.e.Xc.VB),c=M.e.Re,d,f,h,k;d=W.S();c.a.nt&&A(d,c.a.nt);f=Va(d,b,c.a.lx,c.a.kx,!0);f<d.fontSize&&C(d,f);f=d.da(b,c.a.So)+10;h=d.Z(b,c.a.Ro)+10;k=M.d.Ga(c.a.mx,c.f.b.width,f,d.align);h=M.d.Ga(c.a.nx,c.f.b.height-Bh(c),h,d.i);w(c.f.b);d.p(b,
k,h,f);y(c.f.b)}a&&eh()},h=function(){M.e.Li(k);return!0}),b.push({T:d,fa:h,xa:M.e}),b.push({T:f,fa:function(){M.e.Re.close();M.e.Re=null;return!0}}),M.e.Re=new Ah(c,b,a),M.e.me=M.e.Re)}e.Oo=function(){var a,b;b=Tb(I,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].co&&b[a].co();rg();Ub("game");Mb()};function eh(a){var b,c;c=Tb(I);for(b=0;b<c.length;b++)"function"===typeof c[b].co&&c[b].co();Ub();Mb();rg();a&&(a.O=Math.max(0,a.O-1));Vb("system")}
function kh(){var a,b;b=Tb(I);for(a=0;a<b.length;a++)"function"===typeof b[a].yv&&b[a].yv();Vb();a=I;for(b=0;b<a.Wb.length;b+=1)a.Wb[b].paused=Math.max(0,a.Wb[b].paused-1);a=M.Oa;b=M.e.xg;var c;for(c=0;c<a.la.length;c++)void 0!==a.la[c]&&a.la[c].tag===b&&(a.la[c].paused-=1,a.la[c].paused=Math.max(a.la[c].paused,0))}function th(){var a;M.n&&K(I,M.n);for(a=Tb(I,"LevelStartDialog");0<a.length;)K(I,a.pop())}
function pg(){var a="";M.version.builder&&(a=M.version.builder);M.version.tg&&(a+="-"+M.version.tg);M.version.game&&(a+="-"+M.version.game);M.version.config&&(a+="-"+M.version.config);return a}e.ec=function(){this.wc||(this.Pe(),vh(M.e,!0),M.Qd.Uk(),M.j.Uk())};
e.ba=function(a){"function"===typeof this.hr&&(this.hr(),this.hr||M.e.fd());0<this.zn&&(this.Ej||this.Ep||ik());700>this.Zk&&(this.Zk+=a,700<=this.Zk&&(M.A.TB&&void 0!==M.A.Mi&&M.A.Mi.Lk&&M.A.Mi.Tl&&M.Oa.start([M.A.Mi.Lk,M.A.Mi.Tl]),void 0===Kg(this.C,0,"state",void 0)&&fk(this.C,0,"state","unlocked")))};e.Pc=function(a,b){"languageSet"===a&&M.e.language(b)};e.Zd=function(){var a,b;for(a=0;a<M.Td.length;a++)b=M.Td[a],b.$&&(m.sa(b),m.clear())};
e.ya=function(){var a;for(a=0;a<M.Td.length;a++)M.Td[a].$=!1};M.Ux=function(){M.e=new ek;J(M.e);Sb(M.e,"system")};(void 0===M.vu||M.vu)&&M.j.tv();ek.prototype.De=function(a,b,c){var d="inGame";M.e.screen instanceof yg?d="startScreen":M.e.screen instanceof Fg?d="levelMapScreen":b&&(d=M.e.Xc.Hq===M.e.Xc.dn?"inGame_challenger":"inGame_challengee");M.j.De(d);M.e.me||(M.e.me=new lh(d,!0===a,b,c))};lh.prototype.close=function(){K(I,this);this.canvas.$=!0;M.j.Ku(this.type);return!0};
Za.prototype.be=function(a,b){var c,d,f,h=1,k=db(this,a);this.hb[a]=b;this.Ic[a]&&delete this.Ic[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.Ba.indexOf(a)){for(f=0;f<d.Ba.length;f+=1)void 0!==this.hb[d.Ba[f]]&&(h*=this.hb[d.Ba[f]]);h=Math.round(100*h)/100;if(this.rb){if(d=this.ie[d.id])d.gain.value=h}else this.eb&&(d.H.volume=h)}this.rb&&(d=this.ie[a])&&(d.gain.value=b)};
}());
