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
var e,aa=document.getElementById("canvasBackground"),ba="big game_bubbleshooter theme_plain gameui_endless endscreen_endless landscape poki_api final".split(" ");function ca(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var da=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=ca(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=ca(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),f=!d&&/[^-]mobi/i.test(this.userAgent);this.q={};this.Ya={};this.qg={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.q.opera=!0,this.q.version=c||ca(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Ya.aq=!0,this.q.Tl=!0,this.q.version=ca(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.q.Tl=!0,this.q.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.q.Vz=!0,this.q.version=ca(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.q.chrome=!0,this.q.version=ca(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.q.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.q.EB=!0,this.q.version=ca(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.q.TB=!0,this.q.version=ca(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.q.Cr=!0,this.q.version=ca(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Ya.eA=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.q.ut=!0,this.q.version=ca(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.q.di=!0,this.q.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.q.iB=!0,this.q.version=ca(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.q.Kq=!0,this.q.version=
c||ca(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.q.Bu=!0,this.q.version=c||ca(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.qg.nC=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.q.Iq=!0,this.q.version=ca(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.q.Zy=!0,this.q.version=ca(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&
(this.name="Safari",this.q.wp=!0,this.q.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.q.sC=!0,!this.q.version&&c&&(this.q.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.q.mA=!0,this.q.version=this.q.version||ca(this,/gecko\/(\d+(\.\d+)?)/i));b||this.ut?this.Ya.nz=!0:a&&(this.Ya.Dl=!0);c="";a?(c=ca(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=ca(this,/android[ \/-](\d+(\.\d+)*)/i):this.aq?
c=ca(this,/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.Bu?c=ca(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.Kq?c=ca(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.Iq?c=ca(this,/bada\/(\d+(\.\d+)*)/i):this.Zy&&(c=ca(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Ya.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!f)||this.ut)this.qg.Tt=!0;else if(f||"iphone"==a||"ipod"==a||b||this.Kq||this.Bu||this.Iq)this.qg.Ls=!0;this.zf={fd:!1,Ui:!1,x:!1};this.Tl&&10<=this.q.version||this.chrome&&20<=this.q.version||
this.Cr&&20<=this.q.version||this.wp&&6<=this.q.version||this.opera&&10<=this.q.version||this.Dl&&this.Ya.version&&6<=this.Ya.version.split(".")[0]?this.zf.fd=!0:this.Tl&&10>this.q.version||this.chrome&&20>this.q.version||this.Cr&&20>this.q.version||this.wp&&6>this.q.version||this.opera&&10>this.q.version||this.Dl&&this.Ya.version&&6>this.Ya.version.split(".")[0]?this.zf.Ui=!0:this.zf.x=!0;try{this.q.mf=this.q.version?parseFloat(this.q.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.q.mf=0}try{this.Ya.mf=
this.Ya.version?parseFloat(this.Ya.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Ya.mf=0}};function g(a,b){this.x=a;this.y=b}function ea(a,b){return new g(b*Math.cos(Math.PI*a/180),-b*Math.sin(Math.PI*a/180))}e=g.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.direction=function(){return 180*Math.atan2(-this.y,this.x)/Math.PI};e.K=function(){return new g(this.x,this.y)};e.add=function(a){return new g(this.x+a.x,this.y+a.y)};
e.ic=function(a){return new g(this.x-a.x,this.y-a.y)};e.scale=function(a){return new g(a*this.x,a*this.y)};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new g(a*this.x+b*this.y,-b*this.x+a*this.y)};e.pg=function(a){return this.x*a.x+this.y*a.y};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new g(0,0):new g(this.x/a,this.y/a)};function fa(a){return(new g(a.y,-a.x)).normalize()}
e.tc=function(a,b,c){var d=Math.min(8,this.length()/4),f=this.ic(this.normalize().scale(2*d)),h=f.add(fa(this).scale(d)),d=f.add(fa(this).scale(-d)),k=m.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+f.x,b+f.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+f.x,b+f.y);k.stroke()};function ga(a){this.Fj=4294967296;this.fd=1664525;this.Ui=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Fj-1)):a}
ga.prototype.K=function(){var a=new ga;a.Fj=this.Fj;a.fd=this.fd;a.Ui=this.Ui;a.state=this.state;return a};ga.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.fd*this.state+this.Ui)%this.Fj;return this.state/this.Fj*b};function ha(a,b){var c=1;void 0!==b&&(c=b);return Math.floor(a.random(c+1))}new ga;function ia(){this.pf="";this.gn=[];this.Ii=[];this.Xf=[];this.gh=[];this.dd=[];this.Y("start");this.Y("load");this.Y("game")}
function ja(a){var b=ka;b.pf=a;""!==b.pf&&"/"!==b.pf[b.pf.length-1]&&(b.pf+="/")}e=ia.prototype;e.Y=function(a){this.dd[a]||(this.Ii[a]=0,this.Xf[a]=0,this.gh[a]=0,this.dd[a]=[],this.gn[a]=!1)};e.loaded=function(a){return this.dd[a]?this.Xf[a]:0};e.nd=function(a){return this.dd[a]?this.gh[a]:0};e.complete=function(a){return this.dd[a]?this.Xf[a]+this.gh[a]===this.Ii[a]:!0};function la(a){var b=ka;return b.dd[a]?100*(b.Xf[a]+b.gh[a])/b.Ii[a]:100}
function ma(a){var b=ka;b.Xf[a]+=1;b.complete(a)&&na("Load Complete",{qb:a})}function oa(a){var b=ka;b.gh[a]+=1;na("Load Failed",{qb:a})}function qa(a,b,c){var d=ka;d.dd[b]||d.Y(b);d.dd[b].push(a);d.Ii[b]+=c}e.je=function(a){var b;if(!this.gn[a])if(this.gn[a]=!0,this.dd[a]&&0!==this.dd[a].length)for(b=0;b<this.dd[a].length;b+=1)this.dd[a][b].je(a,this.pf);else na("Load Complete",{qb:a})};var ka=new ia;function ra(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.ia(a)}
ra.prototype.ia=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};ra.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function sa(a,b,c,d,f,h){var k=m;k.context.save();!1===h?(k.context.fillStyle=f,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=f,k.context.strokeRect(a,b,c,d)):(void 0!==f&&(k.context.fillStyle=f,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ta(a,b,c,d){var f=m;f.context.save();f.context.beginPath();f.context.moveTo(a,b);f.context.lineTo(c,d);f.context.lineWidth=1;f.context.strokeStyle="green";f.context.stroke();f.context.restore()}
ra.prototype.Qc=function(a,b,c,d,f,h,k){this.context.save();this.context.font=f;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};ra.prototype.$=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var m=new ra(aa);function ua(a,b,c){this.name=a;this.F=b;this.sw=c;this.hd=[];this.Tn=[];qa(this,this.sw,this.F)}ua.prototype.je=function(a,b){function c(){oa(a)}function d(){ma(a)}var f,h;for(f=0;f<this.hd.length;f+=1)h=this.Tn[f],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.hd[f].src=h,this.hd[f].addEventListener("load",d,!1),this.hd[f].addEventListener("error",c,!1)};
ua.prototype.complete=function(){var a;for(a=0;a<this.hd.length;a+=1)if(!this.hd[a].complete||0===this.hd[a].width)return!1;return!0};function va(a,b,c){0<=b&&b<a.F&&(a.hd[b]=new Image,a.Tn[b]=c)}ua.prototype.c=function(a,b){0<=a&&a<this.F&&(this.hd[a]=b,this.Tn[a]="")};ua.prototype.Ea=function(a,b,c,d,f,h,k,l,n){this.hd[a]&&this.hd[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=f),0>=d||0>=f||0!==Math.round(l)&&0!==Math.round(n)&&m.context.drawImage(this.hd[a],b,c,d,f,h,k,l,n))};
function p(a,b,c,d,f,h,k,l,n,q){this.name=a;this.hf=b;this.F=c;this.width=d;this.height=f;this.cb=h;this.Wa=k;this.Yi=l;this.zh=n;this.Qh=q;this.Of=[];this.Pf=[];this.Qf=[];this.df=[];this.cf=[];this.ef=[];this.ff=[]}e=p.prototype;e.c=function(a,b,c,d,f,h,k,l){0<=a&&a<this.F&&(this.Of[a]=b,this.Pf[a]=c,this.Qf[a]=d,this.df[a]=f,this.cf[a]=h,this.ef[a]=k,this.ff[a]=l)};e.complete=function(){return this.hf.complete()};
e.o=function(a,b,c){a=(Math.round(a)%this.F+this.F)%this.F;this.hf.Ea(this.Of[a],this.Pf[a],this.Qf[a],this.df[a],this.cf[a],b-this.cb+this.ef[a],c-this.Wa+this.ff[a])};e.md=function(a,b,c,d){var f=m.context,h=f.globalAlpha;f.globalAlpha=d;a=(Math.round(a)%this.F+this.F)%this.F;this.hf.Ea(this.Of[a],this.Pf[a],this.Qf[a],this.df[a],this.cf[a],b-this.cb+this.ef[a],c-this.Wa+this.ff[a]);f.globalAlpha=h};
e.R=function(a,b,c,d,f,h,k){var l=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(f)||(a=(Math.round(a)%this.F+this.F)%this.F,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,f),l.globalAlpha=k,this.hf.Ea(this.Of[a],this.Pf[a],this.Qf[a],this.df[a],this.cf[a],this.ef[a]-this.cb,this.ff[a]-this.Wa),l.restore())};
e.Ea=function(a,b,c,d,f,h,k,l){var n=m.context,q=n.globalAlpha,u,B,C,t;a=(Math.round(a)%this.F+this.F)%this.F;u=this.ef[a];B=this.ff[a];C=this.df[a];t=this.cf[a];b-=u;c-=B;0>=b+d||0>=c+f||b>=C||c>=t||(0>b&&(d+=b,h-=b,b=0),0>c&&(f+=c,k-=c,c=0),b+d>C&&(d=C-b),c+f>t&&(f=t-c),n.globalAlpha=l,this.hf.Ea(this.Of[a],this.Pf[a]+b,this.Qf[a]+c,d,f,h,k),n.globalAlpha=q)};
e.Ln=function(a,b,c,d,f,h,k,l,n,q,u,B){var C,t,s,v,x,U,za,$,pa,Ra;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),C=Math.ceil((q-b)/h),t=Math.ceil((u-c)/k),b+=l,c+=n,pa=0;pa<C;pa+=1)for(Ra=0;Ra<t;Ra+=1)x=d,U=f,za=h,$=k,s=b+pa*h,v=c+Ra*k,s<l&&(x+=l-s,za-=l-s,s=l),s+za>=l+q&&(za=l+q-s),v<n&&(U+=n-v,$-=n-v,v=n),v+$>=n+u&&($=n+u-v),0<za&&0<$&&this.Ea(a,x,U,za,$,s,v,B)};e.Yk=function(a,b,c,d,f,h,k,l,n,q){this.Ln(a,0,0,b,c,d,f,h,k,l,n,q)};
e.Xk=function(a,b,c,d,f,h,k,l,n,q){var u=m.context,B=u.globalAlpha,C,t,s,v,x,U;a=(Math.round(a)%this.F+this.F)%this.F;C=l/d;t=n/f;s=this.ef[a];v=this.ff[a];x=this.df[a];U=this.cf[a];b-=s;c-=v;0>=b+d||0>=c+f||b>=x||c>=U||(0>b&&(d+=b,l+=C*b,h-=C*b,b=0),0>c&&(f+=c,n+=t*c,k-=t*c,c=0),b+d>x&&(l-=C*(d-x+b),d=x-b),c+f>U&&(n-=t*(f-U+c),f=U-c),u.globalAlpha=q,this.hf.Ea(this.Of[a],this.Pf[a]+b,this.Qf[a]+c,d,f,h,k,l,n),u.globalAlpha=B)};
function wa(a,b,c){var d,f,h;for(d=0;d<a.F;d+=1)f=b+d%a.Qh*a.width,h=c+a.height*Math.floor(d/a.Qh),a.hf.Ea(a.Of[d],a.Pf[d],a.Qf[d],a.df[d],a.cf[d],f-a.cb+a.ef[d],h-a.Wa+a.ff[d])}function r(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.Wa=this.cb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.Wl=void 0}e=r.prototype;
e.K=function(){var a=new r(this.width,this.height);a.cb=this.cb;a.Wa=this.Wa;w(a);this.o(0,0);y(a);return a};function w(a){a.Wl=m.canvas;m.ia(a.canvas)}function y(a){m.canvas===a.canvas&&void 0!==a.Wl&&(m.ia(a.Wl),a.Wl=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.o=function(a,b){m.context.drawImage(this.canvas,a-this.cb,b-this.Wa)};
e.md=function(a,b,c){var d=m.context,f=d.globalAlpha;d.globalAlpha=c;m.context.drawImage(this.canvas,a-this.cb,b-this.Wa);d.globalAlpha=f};e.R=function(a,b,c,d,f,h){var k=m.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-f*Math.PI/180),k.scale(c,d),k.globalAlpha=h,m.context.drawImage(this.canvas,-this.cb,-this.Wa),k.restore())};
e.Ea=function(a,b,c,d,f,h,k){var l=m.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,m.context.drawImage(this.canvas,a,b,c,d,f,h,c,d),l.globalAlpha=n)};
e.Ln=function(a,b,c,d,f,h,k,l,n,q,u){var B,C,t,s,v,x,U,za,$,pa;if(!(0>=f||0>=h))for(c+f>this.width&&(f=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%f,0<a&&(a-=f),b=Math.round(b)%h,0<b&&(b-=h),B=Math.ceil((n-a)/f),C=Math.ceil((q-b)/h),a+=k,b+=l,$=0;$<B;$+=1)for(pa=0;pa<C;pa+=1)v=c,x=d,U=f,za=h,t=a+$*f,s=b+pa*h,t<k&&(v+=k-t,U-=k-t,t=k),t+U>=k+n&&(U=k+n-t),s<l&&(x+=l-s,za-=l-s,s=l),s+za>=l+q&&(za=l+q-s),0<U&&0<za&&this.Ea(v,x,U,za,t,s,u)};
e.Yk=function(a,b,c,d,f,h,k,l,n){this.Ln(0,0,a,b,c,d,f,h,k,l,n)};e.Xk=function(a,b,c,d,f,h,k,l,n){var q=m.context,u=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,m.context.drawImage(this.canvas,a,b,c,d,f,h,k,l),q.globalAlpha=u))};function xa(a){this.name=a;this.align="left";this.j="base";this.Lm=this.Wb=0}e=xa.prototype;e.complete=function(){return this.b.hf.complete()};
function ya(a,b,c){var d=[],f,h,k;if(void 0===c)return d=b.split("\n");0>c&&(c=0);h=f=0;for(d[0]="";f<b.length;)if("\n"===b[f])d.push(""),h=0,f+=1;else if(k=d.length-1,h+=a.width[b.charCodeAt(f)],h>c&&0<d[k].length){for(h=d[k].length-1;0<=h&&" "!==d[k][h];)h-=1;0<=h&&(f=f-d[k].length+h+1,d[k]=d[k].substr(0,h));d.push("");h=0}else d[k]+=b[f],h+=a.Lm,f+=1;return d}e.Zf=function(a){var b=0,c;for(c=a.length-1;0<=c;c-=1)b+=this.width[a.charCodeAt(c)]+this.Lm;return b-this.Lm};
e.$=function(a,b){var c=ya(this,a,b),d=0,f;for(f=c.length-1;0<=f;f-=1)d=Math.max(d,this.Zf(c[f]));return d};e.W=function(a,b){var c=ya(this,a,b);return c.length*this.height+(c.length-1)*this.Wb};
e.o=function(a,b,c,d){a=ya(this,a,d);d=a.length*this.height+(a.length-1)*this.Wb;var f,h,k,l;switch(this.j){case "top":c-=this.top;break;case "middle":c-=this.top+Math.round(d/2);break;case "base":c-=this.sh;break;case "bottom":c-=this.top+d}d=c;for(h=0;h<a.length;h+=1){c=b;switch(this.align){case "left":c=b;break;case "center":c=b-Math.round(this.Zf(a[h])/2);break;case "right":c=b-this.Zf(a[h])}for(f=0;f<a[h].length;f+=1)k=a[h].charCodeAt(f),l=this.index[k],0<=l&&this.b.o(l,c-this.left[k],d),c+=
this.width[k]+this.Lm;d+=this.height+this.Wb}};e.md=function(a,b,c,d,f){var h=m.context;h.save();h.globalAlpha=d;this.o(a,b,c,f);h.restore()};e.R=function(a,b,c,d,f,h,k,l){var n=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(f)||(n.save(),n.translate(b,c),n.rotate(-h*Math.PI/180),n.scale(d,f),n.globalAlpha=k,this.o(a,0,0,l/d),n.restore())};
function Aa(a,b,c,d){this.L=a;this.gz=b;this.az=c;this.hk=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.Ot=!1;qa(this,d,1)}function Ba(a,b,c){m.context.save();m.context.font="250pt "+a+", "+b;a=m.context.measureText(c).width;m.context.restore();return a}
function Ca(a){var b,c,d;for(b=0;b<a.hk.length;b+=1)if(c=a.hk[b],d=Ba(a.L,c.font,c.text),c.width!==d){ma(a.rw);document.body.removeChild(a.nf);a.Ot=!0;return}window.setTimeout(function(){Ca(a)},33)}
Aa.prototype.je=function(a,b){var c="@font-face {font-family: "+this.L+";src: url('"+b+this.gz+"') format('woff'), url('"+b+this.az+"') format('truetype');}",d=document.createElement("style");d.id=this.L+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.nf=document.createElement("span");this.nf.style.position="absolute";this.nf.style.left="-9999px";this.nf.style.top="-9999px";this.nf.style.visibility=
"hidden";this.nf.style.fontSize="250pt";this.nf.id=this.L+"_loader";document.body.appendChild(this.nf);for(c=0;c<this.hk.length;c+=1)d=this.hk[c],d.width=Ba(d.font,d.font,d.text);this.rw=a;Ca(this)};Aa.prototype.complete=function(){return this.Ot};
function Da(a,b){this.L=a;this.hj=b;this.fontWeight=this.fontStyle="";this.Oe="normal";this.fontSize=12;this.fill=!0;this.rg=1;this.od=0;this.fillColor="black";this.Ed={b:void 0,hc:0,tp:!0,up:!0};this.nb={bk:!0,F:3,Lk:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Sg=1;this.ei=0;this.strokeColor="black";this.strokeStyle=void 0;this.Xb=1;this.Ac=!1;this.Kc="miter";this.P={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.j="top";
this.Wb=this.Gf=0}e=Da.prototype;
e.K=function(){var a=new Da(this.L,this.hj);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.Oe=this.Oe;a.fontSize=this.fontSize;a.fill=this.fill;a.rg=this.rg;a.od=this.od;a.fillColor=this.fillColor;a.Ed={b:this.Ed.b,tp:this.Ed.tp,up:this.Ed.up};a.nb={bk:this.nb.bk,F:this.nb.F,Lk:this.nb.Lk.slice(0),size:this.nb.size,offset:this.nb.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Sg=this.Sg;a.ei=this.ei;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.Xb=this.Xb;a.Ac=
this.Ac;a.Kc=this.Kc;a.P={h:this.P.h,color:this.P.color,offsetX:this.P.offsetX,offsetY:this.P.offsetY,blur:this.P.blur};a.align=this.align;a.j=this.j;a.Gf=this.Gf;a.Wb=this.Wb;return a};
function z(a,b){void 0!==b.L&&(a.L=b.L);void 0!==b.hj&&(a.hj=b.hj);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.Oe&&(a.Oe=b.Oe);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.rg&&(a.rg=b.rg);void 0!==b.fillColor&&(a.od=0,a.fillColor=b.fillColor);void 0!==b.Ed&&(a.od=1,a.Ed=b.Ed);void 0!==b.nb&&(a.od=2,a.nb=b.nb);void 0!==b.fillStyle&&(a.od=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Sg&&(a.Sg=b.Sg);void 0!==b.strokeColor&&(a.ei=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.ei=3,a.strokeStyle=b.strokeStyle);void 0!==b.Xb&&(a.Xb=b.Xb);void 0!==b.Ac&&(a.Ac=b.Ac);void 0!==b.Kc&&(a.Kc=b.Kc);void 0!==b.P&&(a.P=b.P);void 0!==b.align&&(a.align=b.align);void 0!==b.j&&(a.j=b.j);void 0!==b.Gf&&(a.Gf=b.Gf);void 0!==b.Wb&&(a.Wb=b.Wb)}function Ea(a,b){a.fontWeight=void 0===b?"":b}function A(a,b){a.fontSize=void 0===b?12:b}function Fa(a){a.fill=!0}
function Ga(a,b){a.rg=void 0===b?1:b}e.setFillColor=function(a){this.od=0;this.fillColor=void 0===a?"black":a};function Ha(a,b,c,d,f){a.od=2;a.nb.bk=!0;a.nb.F=b;a.nb.Lk=c.slice(0);a.nb.size=void 0===d?.6:d;a.nb.offset=void 0===f?0:f}function Ia(a,b){a.stroke=void 0===b?!1:b}function Ja(a,b){a.Sg=void 0===b?1:b}e.setStrokeColor=function(a){this.ei=0;this.strokeColor=void 0===a?"black":a};function Ka(a,b){a.Xb=void 0===b?1:b}function La(a,b){a.Ac=void 0===b?!1:b}
function Ma(a,b){a.Kc=void 0===b?"miter":b}function Na(a,b,c,d,f,h){void 0===b?a.P={h:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1}:b instanceof Object?a.P={h:b.h,color:b.color,offsetX:b.offsetX,offsetY:b.offsetY,blur:b.blur}:void 0===c?a.P.h=b:a.P={h:b,color:c,offsetX:d,offsetY:f,blur:h}}function Oa(a){return{h:a.P.h,color:a.P.color,offsetX:a.P.offsetX,offsetY:a.P.offsetY,blur:a.P.blur}}function D(a,b){a.align=void 0===b?"left":b}function E(a,b){a.j=void 0===b?"top":b}
function Pa(a){a.Gf=0}function Qa(a){a.Wb=0}function Sa(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.L+", "+a.hj}e.Zf=function(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b};function Ta(a,b){return a.fontSize*b.length+a.Wb*(b.length-1)}
function Ua(a,b,c){var d,f,h,k,l,n,q=[],u=m.context;u.font=Sa(a);switch(a.Oe){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:u.measureText(n[a]).width});return q}n=b.split("\n");h=u.measureText(" ").width;for(a=0;a<n.length;a+=1){f=n[a].split(" ");d=f[0];l=u.measureText(f[0]).width;for(b=1;b<f.length;b+=1)k=u.measureText(f[b]).width,l+h+k<c?(d+=" "+f[b],l+=h+k):(q.push({text:d,width:l}),d=f[b],l=k);
q.push({text:d,width:l})}return q}e.$=function(a,b){var c;m.context.save();c=this.Zf(Ua(this,a,b));m.context.restore();return c};e.W=function(a,b){var c;m.context.save();c=Ta(this,Ua(this,a,b));m.context.restore();return c};function Va(a,b,c,d,f,h){var k=a.fontSize;a.fontSize=b;b=h?Ua(a,c,d):Ua(a,c);d=a.Zf(b)<=d&&Ta(a,b)<=f;a.fontSize=k;return d}
function Wa(a,b,c,d,f){var h=0,k=32;void 0===f&&(f=!1);for(m.context.save();Va(a,h+k,b,c,d,f);)h+=k;for(;2<=k;)k/=2,Va(a,h+k,b,c,d,f)&&(h+=k);m.context.restore();return Math.max(4,h)}function Xa(a,b,c,d,f){var h=Math.max(.01,a.nb.size),k=a.nb.offset;a.nb.bk?(k=f/2+k*f,h=.5*h*f,b=m.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=m.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.nb.F-1);for(d=0;d<a.nb.F;d+=1)b.addColorStop(d*c,a.nb.Lk[d]);return b}
function Ya(a,b,c,d,f,h,k){var l,n;!a.fill&&a.P.h?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Sg;switch(a.ei){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.Xb;b.lineJoin=a.Kc;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.Wb*k;b.strokeText(c[k].text,d+l,f+n)}}
function Za(a,b,c,d,f,h,k){c=Ua(a,c,k);k=a.Zf(c);var l=Ta(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.j){case "base":case "bottom":f+=-l+Math.round(a.Gf*a.fontSize);break;case "middle":f+=-l/2+Math.round(a.Gf*a.fontSize/2)}b.font=Sa(a);a.stroke&&a.Ac&&Ya(a,b,c,d,f,k,h);if(a.fill){var n=d,q=f,u,B;a.P.h?(b.shadowColor=a.P.color,b.shadowOffsetX=a.P.offsetX,b.shadowOffsetY=a.P.offsetY,b.shadowBlur=a.P.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.rg;switch(a.od){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.Ed.b;B=new r(l.width,l.height);var C=a.Ed.tp,t=a.Ed.up;C&&t?u="repeat":C&&!t?u="repeat-x":!C&&t?u="repeat-y":C||t||(u="no-repeat");w(B);l.o(a.Ed.hc,0,0);y(B);u=m.context.createPattern(B.canvas,u);b.fillStyle=u;break;case 2:b.fillStyle=Xa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(u=0;u<c.length;u+=1){l=0;switch(a.align){case "right":l=
k-c[u].width;break;case "center":l=(k-c[u].width)/2}B=a.fontSize*(u+1)+a.Wb*u;2===a.od&&a.nb.bk&&(b.fillStyle=Xa(a,n,q+B-a.fontSize,k,a.fontSize));b.fillText(c[u].text,n+l,q+B)}}a.stroke&&!a.Ac&&Ya(a,b,c,d,f,k,h)}e.o=function(a,b,c,d){var f=m.context;this.fill&&1===this.od?this.R(a,b,c,1,1,0,1,d):(f.save(),Za(this,f,a,b,c,1,d),f.restore())};e.md=function(a,b,c,d,f){var h=m.context;this.fill&&1===this.od?this.R(a,b,c,1,1,0,d,f):(h.save(),Za(this,h,a,b,c,d,f),h.restore())};
e.R=function(a,b,c,d,f,h,k,l){var n=m.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,f);try{Za(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function $a(){this.Iw=10;this.mk=-1;this.Mu="stop_lowest_prio";this.Eq=this.bb=this.sb=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.sb=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.bb=!0)}catch(d){}this.Eq=this.sb||this.bb;this.bb&&da.q.di&&(this.mk=1);if(this.Eq)try{a=new Audio,this.mq={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),
mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(f){this.mq={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.Cc=
[];this.Wf={};this.fb={};this.Mc={};this.pe=[];this.Lc=0;this.sb?(this.oe=new c,this.nq="function"===typeof this.oe.createGain?function(){return b.oe.createGain()}:"function"===typeof this.oe.createGainNode?function(){return b.oe.createGainNode()}:function(){},this.qe={},this.lk=this.nq(),void 0===this.lk?(this.bb=!0,this.ui=$a.prototype.fn):(this.lk.connect(this.oe.destination),this.qe.master=this.lk,this.ui=$a.prototype.Lu)):this.ui=this.bb?$a.prototype.fn:function(){}}
function ab(a){var b=F,c,d,f,h,k;for(c=0;c<b.Cc.length;c+=1)if((d=b.Cc[c])&&0===d.Pn)if(d.paused)d.rq&&(d.hn+=a,d.hn>=d.rq&&b.Oj(d.id));else if(d.jn+=a,d.fh&&d.jn>=d.Et)d.fh=!1,bb(b,d,d.se);else if(d.Za&&b.bb&&b.qo(d.id)>=d.duration)if(d.Uo)try{d.G.pause(),d.G.currentTime=d.se/1E3,4===d.G.readyState?d.G.play():(f=function(){var a=d;return{ready:function(){a.G.play();a.G.removeEventListener("canplaythrough",f.ready,!1)}}}(),d.G.addEventListener("canplaythrough",f.ready,!1))}catch(l){}else d.G.pause(),
cb(d);for(c=b.pe.length-1;0<=c;c-=1)h=b.pe[c],b.ds(h.id)||0!==h.Pn||(h.m+=a,h.m>=h.duration?(F.he(h.id,h.Wj),void 0!==b.Mc[h.id]&&(b.Mc[h.id]=h.Wj),h.jb&&h.jb(),b.pe.splice(c,1)):(k=h.mb(h.m,h.start,h.Wj-h.start,h.duration),F.he(h.id,k),void 0!==b.Mc[h.id]&&(b.Mc[h.id]=k)))}function db(a,b){a.Wf[b.Vb.s.name]?a.Wf[b.Vb.s.name].length<a.Iw&&a.Wf[b.Vb.s.name].push(b.G):a.Wf[b.Vb.s.name]=[b.G]}
function eb(a,b){var c,d,f;f=[];for(c=0;c<a.Cc.length;c+=1)(d=a.Cc[c])&&0<=d.ya.indexOf(b)&&f.push(d);return f}function fb(a,b){if(0<a.mk&&a.Lc>=a.mk)switch(a.Mu){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,f;for(c=0;c<a.Cc.length;c+=1)(d=a.Cc[c])&&d.Za&&!d.paused&&(void 0===f||f.jm<d.jm)&&(f=d);if(f.jm>b.Ei){a.stop(f.id);break}return!1}return!0}
function gb(a,b){var c,d=1;for(c=0;c<b.ya.length;c+=1)void 0!==F.fb[b.ya[c]]&&(d*=F.fb[b.ya[c]]);c=a.nq();c.gain.value=d;c.connect(a.lk);a.qe[b.id]=c;b.G.connect(c)}function hb(a,b){b.G.disconnect(0);a.qe[b.id]&&(a.qe[b.id].disconnect(0),delete a.qe[b.id])}function jb(a,b){var c;if(b.s&&b.s.qc){if(a.sb)return c=a.oe.createBufferSource(),c.buffer=b.s.qc,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.bb)return c=b.s.qc.cloneNode(!0),c.volume=0,c}}
function kb(a,b){var c,d;if(a.sb)(c=jb(a,b))&&(d=new lb(b,c));else if(a.bb){c=a.Wf[b.s.name];if(!c)return;0<c.length?d=new lb(b,c.pop()):(c=jb(a,b))&&(d=new lb(b,c))}if(d){a.sb&&gb(a,d);for(c=0;c<a.Cc.length;c+=1)if(void 0===a.Cc[c])return a.Cc[c]=d;a.Cc.push(d)}return d}function mb(a){var b=F,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.mq[d])return a[c];return!1}e=$a.prototype;
e.fn=function(a,b,c){function d(){var b;a.loaded=!0;ma(c);a.duration=Math.ceil(1E3*a.qc.duration);a.qc.removeEventListener("canplaythrough",d,!1);a.qc.removeEventListener("error",f,!1);b=a.qc.cloneNode(!0);F.Wf[a.name].push(b)}function f(){oa(c)}(b=mb(b))?(a.qc=new Audio,a.qc.src=b,a.qc.autoplay=!1,a.qc.lB="auto",a.qc.addEventListener("canplaythrough",d,!1),a.qc.addEventListener("error",f,!1),a.qc.load()):f()};
e.Lu=function(a,b,c){var d=mb(b),f=new XMLHttpRequest;f.open("GET",d,!0);f.responseType="arraybuffer";f.onload=function(){F.oe.decodeAudioData(f.response,function(b){b&&(a.qc=b,a.duration=1E3*b.duration,a.loaded=!0,ma(c))},function(){oa(c)})};f.onerror=function(){"undefined"!==typeof Audio&&(F.sb=!1,F.bb=!0,F.ui=$a.prototype.fn,F.ui(a,b,c))};try{f.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof G){if(fb(this,a)){a=kb(this,a);if(!a)return-1;a.Et=b||0;a.fh=0<b;a.$b=c||0;a.Me=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.fh||bb(this,a,a.se);return a.id}return-1}};
function bb(a,b,c){var d;"number"!==typeof c&&(c=0);nb(a,b.id);0<b.$b&&(d=ob(a,b.id),a.he(b.id,0),pb(a,b.id,d,b.$b,b.Me),b.$b=0,b.Me=void 0);if(a.sb){d=c-b.se;b.Nu=1E3*a.oe.currentTime-d;b.G.onended=function(){cb(b)};try{b.G.start?b.G.start(0,c/1E3,(b.duration-d)/1E3):b.G.noteGrainOn&&b.G.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.Td=!0,b.Za=!0,a.Lc+=1,b.G.loop=b.Uo}catch(f){}}else if(a.bb){if(4!==b.G.readyState){var h=function(){return{ready:function(){b.G.currentTime=c/1E3;b.G.play();b.Td=!0;b.G.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.G.addEventListener("canplaythrough",h.ready,!1)}else b.G.currentTime=c/1E3,b.G.play(),b.Td=!0;b.Za=!0;a.Lc+=1}}
e.Oj=function(a,b,c,d){var f,h,k,l,n=eb(this,a);for(f=0;f<n.length;f+=1)if(h=n[f],(h.paused||!h.Za)&&!d||!h.paused&&d){if(!d){for(f=this.pe.length-1;0<=f;f-=1)if(a=this.pe[f],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.$b=b||0;h.Me=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.si&&(void 0===b&&(h.$b=h.si.duration),void 0===c&&(h.Me=h.si.mb),k=h.si.gain,h.si=void 0)}this.sb&&(a=jb(this,h.Vb))&&(h.G=a,gb(this,h));void 0!==k&&F.he(h.id,k);bb(this,h,h.se+(h.nk||0));void 0!==l&&
(F.he(h.id,l.mb(l.m,l.start,l.Wj-l.start,l.duration)),pb(F,h.id,l.Wj,l.duration-l.m,l.mb,l.jb))}};
e.pause=function(a,b,c,d,f){var h,k,l=eb(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.$b=c||0,0<h.$b)h.Me=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.si={gain:qb(h.id),duration:h.$b,mb:h.Me},pb(F,h.id,0,h.$b,h.Me,function(){F.pause(h.id,b)});else if(k=this.qo(h.id),h.nk=k,f||(h.paused=!0,h.hn=0,h.rq=b,this.Lc-=1),this.sb){h.G.onended=function(){};if(h.Za&&h.Td){try{h.G.stop?h.G.stop(0):h.G.noteOff&&h.G.noteOff(0)}catch(n){}h.Td=!1}hb(this,h)}else this.bb&&h.G.pause()};
function cb(a){var b=F;b.fb[a.id]&&delete b.fb[a.id];a.paused||(b.Lc-=1);b.sb?(a.Td=!1,a.Za=!1,hb(b,a)):b.bb&&db(b,a);b.Cc[b.Cc.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,f=eb(this,a);for(a=0;a<f.length;a+=1)if(d=f[a],d.$b=b||0,0<d.$b)d.Me=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},pb(F,d.id,0,d.$b,d.Me,function(){F.stop(d.id)});else{this.fb[d.id]&&delete this.fb[d.id];d.Za&&!d.paused&&(this.Lc-=1);if(this.sb){if(d.Za&&!d.paused&&!d.fh){if(d.Td){try{d.G.stop?d.G.stop(0):d.G.noteOff&&d.G.noteOff(0)}catch(h){}d.Td=!1}hb(this,d)}}else this.bb&&(d.fh||d.G.pause(),db(this,d));this.Cc[this.Cc.indexOf(d)]=void 0;d.Za=!1}};
function pb(a,b,c,d,f,h){var k;for(k=0;k<a.pe.length;k+=1)if(a.pe[k].id===b){a.pe.splice(k,1);break}a.pe.push({id:b,Wj:c,mb:f||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,m:0,start:ob(a,b),jb:h,Pn:0})}function rb(a){var b=F,c;void 0===b.Mc[a]&&(c=void 0!==b.fb[a]?b.fb[a]:1,b.he(a,0),b.Mc[a]=c)}function sb(a){var b=F;void 0!==b.Mc[a]&&(b.he(a,b.Mc[a]),delete b.Mc[a])}
e.position=function(a,b){var c,d,f,h,k=eb(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.sb)if(d.paused)d.nk=b;else{d.G.onended=function(){};if(d.Td){try{d.G.stop?d.G.stop(0):d.G.noteOff&&d.G.noteOff(0)}catch(l){}d.Td=!1}hb(this,d);this.Lc-=1;if(f=jb(this,d.Vb))d.G=f,gb(this,d),bb(this,d,d.se+b)}else this.bb&&(4===d.G.readyState?d.G.currentTime=(d.se+b)/1E3:(h=function(){var a=d,c=b;return{Or:function(){a.G.currentTime=(a.se+c)/1E3;a.G.removeEventListener("canplaythrough",
h.Or,!1)}}}(),d.G.addEventListener("canplaythrough",h.Or,!1)))};e.vp=function(a){F.position(a,0)};e.jt=function(a,b){var c,d=eb(this,a);for(c=0;c<d.length;c+=1)d[c].Uo=b,this.sb&&(d[c].G.loop=b)};function ob(a,b){return void 0!==a.fb[b]?a.fb[b]:1}function qb(a){var b=F,c=1,d=eb(b,a)[0];if(d)for(a=0;a<d.ya.length;a+=1)void 0!==b.fb[d.ya[a]]&&(c*=b.fb[d.ya[a]]);return Math.round(100*c)/100}
e.he=function(a,b){var c,d,f,h=1,k=eb(this,a);this.fb[a]=b;this.Mc[a]&&delete this.Mc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ya.indexOf(a)){for(f=0;f<d.ya.length;f+=1)void 0!==this.fb[d.ya[f]]&&(h*=this.fb[d.ya[f]]);h=Math.round(100*h)/100;this.sb?this.qe[d.id].gain.value=h:this.bb&&(d.G.volume=h)}};
function nb(a,b){var c,d,f,h=1,k=eb(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(f=0;f<d.ya.length;f+=1)void 0!==a.fb[d.ya[f]]&&(h*=a.fb[d.ya[f]]);h=Math.round(100*h)/100;a.sb?a.qe[d.id].gain.value=h:a.bb&&(d.G.volume=h)}}e.xq=function(a,b){var c,d,f,h=eb(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),f=0;f<b.length;f+=1)0>d.ya.indexOf(b[f])&&d.ya.push(b[f]);nb(this,a)};e.ds=function(a){if(a=eb(this,a)[0])return a.paused};e.Ho=function(a){return eb(this,a)[0]?!0:!1};
e.qo=function(a){if(a=eb(this,a)[0]){if(this.sb)return a.paused?a.nk:(1E3*F.oe.currentTime-a.Nu)%a.duration;if(F.bb)return Math.ceil(1E3*a.G.currentTime-a.se)}};var F=new $a;function tb(a,b,c,d){this.name=a;this.kx=b;this.ox=c;this.Wc=d;this.loaded=!1;this.qc=null;qa(this,this.Wc,1)}
tb.prototype.je=function(a,b){var c,d;c=this.kx;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.ox;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);F.Wf[this.name]=[];F.ui(this,[d,c],a)};tb.prototype.complete=function(){return this.loaded};
function G(a,b,c,d,f,h,k){this.name=a;this.s=b;this.startOffset=c;this.duration=d;F.he(this.name,void 0!==f?f:1);this.Ei=void 0!==h?h:10;this.ya=[];k&&(this.ya=this.ya.concat(k));0>this.ya.indexOf(this.name)&&this.ya.push(this.name)}G.prototype.complete=function(){return this.s.complete()};G.prototype.jm=function(a){void 0!==a&&(this.Ei=a);return this.Ei};G.prototype.xq=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.ya.indexOf(a[b])&&this.ya.push(a[b])};
function lb(a,b){this.Vb=a;this.se=this.Vb.startOffset;this.G=b;this.duration=this.Vb.duration;this.of()}lb.prototype.of=function(){this.id=Math.round(Date.now()*Math.random())+"";this.ya=["master",this.id].concat(this.Vb.ya);this.jm=void 0!==this.Vb.Ei?this.Vb.Ei:10;this.paused=this.Za=this.Uo=!1;this.jn=this.Pn=0;this.Td=this.fh=!1;this.Et=this.nk=0;var a,b=1;for(a=0;a<this.ya.length;a+=1)void 0!==F.fb[this.ya[a]]&&(b*=F.fb[this.ya[a]]);!F.sb&&F.bb&&(this.G.volume=b)};
function ub(a,b){this.name=a;this.fileName=b;this.info=void 0}function vb(a){this.name=a;this.text="";this.nd=this.complete=!1}vb.prototype.Xf=function(a){4===a.readyState&&(this.complete=!0,(this.nd=200!==a.status)?na("Get Failed",{name:this.name}):(this.text=a.responseText,na("Get Complete",{name:this.name})))};
function wb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.nd=200!==c.status,a.nd?na("Post Failed",{name:a.name}):na("Post Complete",{name:a.name}))};c.send(a.text)}function xb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.nd=200!==c.status;if(a.nd)return!1;a.text=c.responseText;return!0}
function yb(a){a&&(this.de=a);this.clear();this.Bi=this.jh=this.Ad=this.Ai=this.zi=this.Di=this.wi=this.Ci=this.re=this.yi=this.xi=0;zb(this,this);Ab(this,this);Bb(this,this);this.jc=[];this.oi=[];this.Gi=[];this.N=0;this.sq=!1;this.El=this.startTime=Date.now();this.Rg=this.Gh=0;this.Jw=200;this.Wc="";window.ek(window.jq)}yb.prototype.clear=function(){this.D=[];this.Hi=!1;this.pc=[];this.cn=!1};
function zb(a,b){window.addEventListener("click",function(a){var d,f,h;if(void 0!==b.de&&!(0<b.N)&&(d=b.de,f=d.getBoundingClientRect(),h=d.width/f.width*(a.clientX-f.left),d=d.height/f.height*(a.clientY-f.top),a.preventDefault(),b.eh.x=h,b.eh.y=d,b.qi.push({x:b.eh.x,y:b.eh.y}),0<b.Ai))for(a=b.D.length-1;0<=a&&!((h=b.D[a])&&h.h&&0>=h.N&&h.uo&&(h=h.uo(b.eh.x,b.eh.y),!0===h));a-=1);},!1);Cb(a)}function Cb(a){a.eh={x:0,y:0};a.qi=[]}
function Ab(a,b){window.addEventListener("mousedown",function(a){0<b.N||(a.preventDefault(),window.focus(),b.qq>=Date.now()-1E3||(Db(b,0,a.clientX,a.clientY),Eb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.N||(a.preventDefault(),b.kk>=Date.now()-1E3||(Db(b,0,a.clientX,a.clientY),Fb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.N||(a.preventDefault(),Db(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.qq=Date.now();
if(!(0<b.N))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Eb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.kk=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.kk=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.kk=Date.now();if(!(0<b.N))for(a.preventDefault(),a=0;a<d.length;a+=1)Db(b,d[a].identifier,d[a].clientX,d[a].clientY),Fb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){Gb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){Gb(b,a)},!1);Hb(a);a.qq=0;a.kk=0}function Hb(a){var b;a.fa=[];for(b=0;16>b;b+=1)a.fa[b]={id:-1,zb:!1,x:0,y:0};a.$f=[]}function Ib(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.fa[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.fa[d].zb){c=d;a.fa[d].id=b;break}return c}
function Db(a,b,c,d){var f,h;void 0!==a.de&&(b=Ib(a,b),-1!==b&&(f=a.de,h=f.getBoundingClientRect(),a.fa[b].x=f.width/h.width*(c-h.left),a.fa[b].y=f.height/h.height*(d-h.top)))}function Eb(a,b){var c=Ib(a,b),d,f;if(-1!==c&&!a.fa[c].zb&&(a.$f.push({sg:c,x:a.fa[c].x,y:a.fa[c].y,zb:!0}),a.fa[c].zb=!0,0<a.Ad))for(d=a.D.length-1;0<=d&&!((f=a.D[d])&&f.h&&0>=f.N&&f.Jh&&(f=f.Jh(c,a.fa[c].x,a.fa[c].y),!0===f));d-=1);}
function Fb(a,b){var c=Ib(a,b),d,f;if(-1!==c&&a.fa[c].zb&&(a.$f.push({sg:c,x:a.fa[c].x,y:a.fa[c].y,zb:!1}),a.fa[c].zb=!1,0<a.Ad))for(d=a.D.length-1;0<=d&&!((f=a.D[d])&&f.h&&0>=f.N&&f.Kh&&(f=f.Kh(c,a.fa[c].x,a.fa[c].y),!0===f));d-=1);}
function Gb(a,b){var c;if(!(0<a.N)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,f;a.$f.push({sg:0,x:a.fa[0].x,y:a.fa[0].y,wheelDelta:c});if(0<a.Ad)for(d=a.D.length-1;0<=d&&!((f=a.D[d])&&f.h&&0>=f.N&&f.xo&&(f=f.xo(c,a.fa[0].x,a.fa[0].y),!0===f));d-=1);}}
function Bb(a,b){window.addEventListener("keydown",function(a){0<b.N||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Jb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.N||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Kb(b,a.keyCode))},!1);Lb(a)}function Lb(a){var b;a.ti=[];for(b=0;256>b;b+=1)a.ti[b]=!1;a.ih=[]}
function Jb(a,b){var c,d;if(!a.ti[b]&&(a.ih.push({key:b,zb:!0}),a.ti[b]=!0,0<a.jh))for(c=0;c<a.D.length&&!((d=a.D[c])&&d.h&&0>=d.N&&d.vo&&(d=d.vo(b),!0===d));c+=1);}function Kb(a,b){var c,d;if(a.ti[b]&&(a.ih.push({key:b,zb:!1}),a.ti[b]=!1,0<a.jh))for(c=0;c<a.D.length&&!((d=a.D[c])&&d.h&&0>=d.N&&d.wo&&(d=d.wo(b),!0===d));c+=1);}function Mb(){var a=H,b;for(b=0;b<a.jc.length;b+=1)a.jc[b].paused+=1}
function na(a,b){var c,d=H,f,h;void 0===c&&(c=null);d.Gi.push({id:a,Ru:b,Sf:c});if(0<d.Bi)for(f=0;f<d.D.length&&(!((h=d.D[f])&&h.h&&0>=h.N&&h.yo)||null!==c&&c!==h||(h=h.yo(a,b),!0!==h));f+=1);}
function Nb(a,b){var c=a.pc[b];c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.ia(c.canvas),!1!==m.canvas.Z||!0===c.qd)&&(0===c.pq&&(0>=c.N&&(c.hc+=c.Qu*a.Rg/1E3),1===c.Xm&&1===c.Ym&&0===c.na?1===c.alpha?c.b.o(c.hc,c.x,c.y):c.b.md(c.hc,c.x,c.y,c.alpha):c.b.R(c.hc,c.x,c.y,c.Xm,c.Ym,c.na,c.alpha)),1===c.pq&&(1===c.Xm&&1===c.Ym&&0===c.na?1===c.alpha?c.font.o(c.text,c.x,c.y):c.font.md(c.text,c.x,c.y,c.alpha):c.font.R(c.text,c.x,c.y,c.Xm,c.Ym,c.na,c.alpha)))}
function Ob(a,b){var c=a.D[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==m.canvas&&m.ia(c.canvas),(!1!==m.canvas.Z||!0===c.qd)&&c.pa))return c.pa()}function Pb(a){for(var b=0,c=0;b<a.D.length||c<a.pc.length;)if(c===a.pc.length){if(!0===Ob(a,b))break;b+=1}else if(b===a.D.length)Nb(a,c),c+=1;else if(a.pc[c].Sa>a.D[b].Sa||a.pc[c].Sa===a.D[b].Sa&&a.pc[c].depth>a.D[b].depth)Nb(a,c),c+=1;else{if(!0===Ob(a,b))break;b+=1}}yb.prototype.pause=function(a){this.N+=1;void 0===a&&(a=!1);this.sq=a};
yb.prototype.Oj=function(){0!==this.N&&(this.El=Date.now(),this.N-=1)};yb.prototype.ds=function(){return 0<this.N};window.an=0;window.$m=0;window.kq=0;window.Eu=0;window.lq=0;window.Gu=60;window.Hu=0;window.Fu=!1;
window.jq=function(){window.an=Date.now();window.Eu=window.an-window.$m;var a=H,b;if(0<a.N)a.sq&&(Qb(a),Pb(a));else{b=Date.now();"number"!==typeof b&&(b=a.El);a.Rg=Math.min(a.Jw,b-a.El);a.Gh+=a.Rg;""===a.Wc&&(a.Wc="start",ka.je(a.Wc));"start"===a.Wc&&ka.complete(a.Wc)&&(a.Wc="load",ka.je(a.Wc));"load"===a.Wc&&ka.complete(a.Wc)&&(a.Wc="game",ka.je(a.Wc));"undefined"!==typeof F&&ab(a.Rg);var c,d;if(0<a.xi)for(c=0;c<a.D.length&&!((d=a.D[c])&&d.X&&d.h&&0>=d.N&&!0===d.X(a.Rg));c+=1);var f,h;if(0!==a.qi.length){if(0<
a.yi)for(d=a.D.length-1;0<=d;d-=1)if((f=a.D[d])&&f.h&&0>=f.N&&f.to)for(c=0;c<a.qi.length;c+=1)h=a.qi[c],!0!==h.rd&&(h.rd=f.to(h.x,h.y));a.qi=[]}if(0!==a.$f.length){if(0<a.re)for(d=a.D.length-1;0<=d;d-=1)if((f=a.D[d])&&f.h&&0>=f.N&&(f.Bb||f.Cb||f.vl))for(c=0;c<a.$f.length;c+=1)h=a.$f[c],!0!==h.rd&&(void 0!==h.wheelDelta&&f.vl?h.rd=f.vl(h.wheelDelta,h.x,h.y):h.zb&&f.Bb?h.rd=f.Bb(h.sg,h.x,h.y):void 0!==h.zb&&!h.zb&&f.Cb&&(h.rd=f.Cb(h.sg,h.x,h.y)));a.$f=[]}if(0!==a.ih.length){if(0<a.Ci)for(d=0;d<a.D.length;d+=
1)if((f=a.D[d])&&f.h&&0>=f.N&&(f.yg||f.zg))for(c=0;c<a.ih.length;c+=1)h=a.ih[c],!0!==h.rd&&(h.zb&&f.yg?h.rd=f.yg(h.key):!h.zb&&f.zg&&(h.rd=f.zg(h.key)));a.ih=[]}c=a.Rg;for(d=a.oi.length=0;d<a.jc.length;d+=1)f=a.jc[d],void 0!==f.id&&0===f.paused&&(0<f.Xg||0<f.om)&&(f.Xg-=c,0>=f.Xg&&(a.oi.push({id:f.id,Sf:f.Sf}),0<f.om?(f.om-=1,f.Xg+=f.time):f.Xg=0));if(0<a.wi&&0<a.oi.length)for(c=0;c<a.D.length;c+=1)if((d=a.D[c])&&d.rl&&d.h)for(f=0;f<a.oi.length;f+=1)h=a.oi[f],!0===h.rd||null!==h.Sf&&h.Sf!==d||(h.rd=
d.rl(h.id));if(0<a.Di&&0<a.Gi.length)for(c=0;c<a.D.length;c+=1)if((f=a.D[c])&&f.Tc&&f.h&&0>=f.N)for(d=0;d<a.Gi.length;d+=1)h=a.Gi[d],!0===h.rd||null!==h.Sf&&h.Sf!==f||(h.rd=f.Tc(h.id,h.Ru));a.Gi.length=0;if(0<a.zi)for(c=0;c<a.D.length&&!((d=a.D[c])&&d.Re&&d.h&&0>=d.N&&!0===d.Re(a.Rg));c+=1);Qb(a);Pb(a);a.El=b}window.$m=Date.now();window.kq=window.$m-window.an;window.lq=Math.max(window.Hu,1E3/window.Gu-window.kq);window.ek(window.jq)};window.ek=function(a){window.setTimeout(a,window.lq)};
window.Fu||(window.ek=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.ek);
function Qb(a){function b(a,b){return a.Sa===b.Sa?b.depth-a.depth:a.Sa>b.Sa?-1:1}var c,d;for(c=d=0;c<a.D.length;c+=1)a.D[c]&&(a.D[c].bn&&(a.D[c].bn=!1,a.D[c].h=!0),a.D[d]=a.D[c],d+=1);a.D.length=d;a.Hi&&a.D.sort(b);a.Hi=!1;for(c=d=0;c<a.pc.length;c+=1)a.pc[c]&&(a.pc[d]=a.pc[c],d+=1);a.pc.length=d;a.cn&&a.pc.sort(b);a.cn=!1}
function I(a,b){var c=H;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.h&&(a.h=!0);void 0===a.depth&&(a.depth=0);void 0===a.Sa&&(a.Sa=0);void 0===a.N&&(a.N=0);void 0===a.te&&(a.te=[]);a.bn=!1;void 0!==b&&!1===b&&(a.bn=!0,a.h=!1);c.D.push(a);c.Hi=!0;a.X&&(c.xi+=1);a.to&&(c.yi+=1);if(a.Bb||a.Cb)c.re+=1;a.vl&&(c.re+=1);if(a.yg||a.zg)c.Ci+=1;a.rl&&(c.wi+=1);a.Tc&&(c.Di+=1);a.Re&&(c.zi+=1);a.uo&&(c.Ai+=1);if(a.Jh||a.Kh)c.Ad+=1;a.xo&&(c.Ad+=1);if(a.vo||a.wo)c.jh+=1;a.yo&&(c.Bi+=
1);a.bc&&a.bc()}function Rb(a,b){var c=H;a.depth!==b&&(c.Hi=!0);a.depth=b}function Sb(a,b){var c;b=[].concat(b);void 0===a.te&&(a.te=[]);for(c=b.length-1;0<=c;c-=1)0>a.te.indexOf(b[c])&&a.te.push(b[c])}
function Tb(a,b){var c=[],d,f;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.D.length;d+=1)f=a.D[d],void 0!==f&&c.push(f);else if("function"===typeof b)for(d=0;d<a.D.length;d+=1)f=a.D[d],void 0!==f&&b(f)&&c.push(f);else for(d=0;d<a.D.length;d+=1)f=a.D[d],void 0!==f&&0<=f.te.indexOf(b)&&c.push(f);return c}function Ub(a){var b=Tb(H,a);for(a=0;a<b.length;a+=1){var c=b[a];c.N+=1}}function Vb(a){var b=Tb(H,a);for(a=0;a<b.length;a+=1){var c=b[a];c.N=Math.max(0,c.N-1)}}
function J(a,b){var c=a.D.indexOf(b);if(!(0>c)){a.D[c].ob&&a.D[c].ob();var d=a.D[c];d.X&&(a.xi-=1);d.to&&(a.yi-=1);if(d.Bb||d.Cb)a.re-=1;d.vl&&(a.re-=1);if(d.yg||d.zg)a.Ci-=1;d.rl&&(a.wi-=1);d.Tc&&(a.Di-=1);d.Re&&(a.zi-=1);d.uo&&(a.Ai-=1);if(d.Jh||d.Kh)a.Ad-=1;d.xo&&(a.Ad-=1);if(d.vo||d.wo)a.jh-=1;d.yo&&(a.Bi-=1);a.D[c]=void 0}}function Wb(a){var b=H,c=Tb(b,a);for(a=0;a<c.length;a+=1)J(b,c[a])}
yb.prototype.c=function(a,b,c,d,f,h,k){void 0===k&&(k=0);this.pc.push({pq:0,b:a,hc:b,Qu:c,visible:!0,x:d,y:f,Xm:1,Ym:1,na:0,alpha:1,depth:h,Sa:k,N:0,te:[]});this.cn=!0;return this.pc[this.pc.length-1]};var H=new yb(aa);
function Xb(a,b){var c;this.kind=a;this.t=null;switch(this.kind){case 0:this.t={x:[b.x],y:[b.y]};this.ba=b.x;this.va=b.y;this.Oa=b.x;this.tb=b.y;break;case 2:this.t={x:[b.x,b.x+b.nc-1,b.x+b.nc-1,b.x,b.x],y:[b.y,b.y,b.y+b.vc-1,b.y+b.vc-1,b.y]};this.ba=b.x;this.va=b.y;this.Oa=b.x+b.nc-1;this.tb=b.y+b.vc-1;break;case 3:this.t={x:[],y:[]};this.ba=b.x-b.mm;this.va=b.y-b.mm;this.Oa=b.x+b.mm;this.tb=b.y+b.mm;break;case 1:this.t={x:[b.dq,b.eq],y:[b.fq,b.gq]};this.ba=Math.min(b.dq,b.eq);this.va=Math.min(b.fq,
b.gq);this.Oa=Math.max(b.dq,b.eq);this.tb=Math.max(b.fq,b.gq);break;case 4:this.t={x:[],y:[]};this.ba=b.x[0];this.va=b.y[0];this.Oa=b.x[0];this.tb=b.y[0];for(c=0;c<b.x.length;c+=1)this.t.x.push(b.x[c]),this.t.y.push(b.y[c]),this.ba=Math.min(this.ba,b.x[c]),this.va=Math.min(this.va,b.y[c]),this.Oa=Math.max(this.Oa,b.x[c]),this.tb=Math.max(this.tb,b.y[c]);this.t.x.push(b.x[0]);this.t.y.push(b.y[0]);break;default:this.va=this.ba=0,this.tb=this.Oa=-1}}
function Yb(a,b,c,d){return new Xb(2,{x:a,y:b,nc:c,vc:d})}function Zb(a,b,c){return new Xb(3,{x:a,y:b,mm:c})}function $b(a){var b=1E6,c=-1E6,d=1E6,f=-1E6,h,k,l,n,q;for(h=0;h<a.F;h+=1)k=a.ef[h]-a.cb,l=k+a.df[h]-1,n=a.ff[h]-a.Wa,q=n+a.cf[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>f&&(f=q);return new Xb(2,{x:b,y:d,nc:c-b+1,vc:f-d+1})}e=Xb.prototype;
e.K=function(){var a=new Xb(-1,{}),b;a.kind=this.kind;a.ba=this.ba;a.Oa=this.Oa;a.va=this.va;a.tb=this.tb;a.t={x:[],y:[]};for(b=0;b<this.t.x.length;b+=1)a.t.x[b]=this.t.x[b];for(b=0;b<this.t.y.length;b+=1)a.t.y[b]=this.t.y[b];return a};e.translate=function(a,b){var c=this.K(),d;c.ba+=a;c.Oa+=a;c.va+=b;c.tb+=b;for(d=0;d<c.t.x.length;d+=1)c.t.x[d]+=a;for(d=0;d<c.t.y.length;d+=1)c.t.y[d]+=b;return c};
e.scale=function(a){var b=this.K(),c;b.ba*=a;b.Oa*=a;b.va*=a;b.tb*=a;for(c=0;c<b.t.x.length;c+=1)b.t.x[c]*=a;for(c=0;c<b.t.y.length;c+=1)b.t.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,f;switch(this.kind){case 0:return b=new g(this.t.x[0],this.t.y[0]),b=b.rotate(a),new Xb(0,{x:b.x,y:b.y});case 1:return b=new g(this.t.x[0],this.t.y[0]),b=b.rotate(a),c=new g(this.t.x[1],this.t.y[1]),c=c.rotate(a),new Xb(1,{dq:b.x,fq:b.y,eq:c.x,gq:c.y});case 3:return b=(this.Oa-this.ba)/2,c=new g(this.ba+b,this.va+b),c=c.rotate(a),Zb(c.x,c.y,b);default:c=[];d=[];for(f=0;f<this.t.x.length-1;f+=1)b=new g(this.t.x[f],this.t.y[f]),b=b.rotate(a),c.push(b.x),d.push(b.y);return new Xb(4,
{x:c,y:d})}};function ac(a,b,c,d){var f=new g(0,0),h,k=1E9,l=-1E10,n;for(n=0;n<a.t.x.length;n+=1)f.x=b+a.t.x[n],f.y=c+a.t.y[n],h=f.pg(d),k=Math.min(k,h),l=Math.max(l,h);return{min:k,max:l}}function bc(a){var b=new g(0,0),c=new g(0,0),d=[],f;for(f=0;f<a.t.x.length-1;f+=1)b.x=a.t.x[f],b.y=a.t.y[f],c.x=a.t.x[f+1],c.y=a.t.y[f+1],d.push(fa(b.ic(c)));return d}
function cc(a,b,c,d,f,h){var k,l,n,q;if(f+d.Oa<b+a.ba||f+d.ba>b+a.Oa||h+d.tb<c+a.va||h+d.va>c+a.tb)return!1;if(2===a.kind&&2===d.kind)return!0;if(3===d.kind)return k=(d.Oa-d.ba)/2,dc(a,b,c,f+d.ba+k,h+d.va+k,k);if(3===a.kind)return k=(a.Oa-a.ba)/2,dc(d,f,h,b+a.ba+k,c+a.va+k,k);if(0===d.kind)return ec(a,b,c,f+d.ba,h+d.va);if(0===a.kind)return ec(d,f,h,b+a.ba,c+a.va);k=bc(a).concat(bc(d));for(q=0;q<k.length;q+=1)if(l=ac(a,b,c,k[q]),n=ac(d,f,h,k[q]),l.max<n.min||n.max<l.min)return!1;return!0}
function dc(a,b,c,d,f,h){var k,l,n,q,u,B,C;if(d+h<b+a.ba||d-h>b+a.Oa||f+h<c+a.va||f-h>c+a.tb)return!1;switch(a.kind){case 0:return l=d-(b+a.ba),n=f-(c+a.va),l*l+n*n<=h*h;case 3:return q=(a.Oa-a.ba)/2,l=d-(b+a.ba+q),n=f-(c+a.va+q),l*l+n*n<=(q+h)*(q+h);default:q=bc(a);u=k=0;B=1E9;for(C=0;C<a.t.x.length;C+=1)l=b+a.t.x[C]-d,n=c+a.t.y[C]-f,l=l*l+n*n,l<=B&&(k=b+a.t.x[C],u=c+a.t.y[C],B=l);d=new g(d,f);q.push(d.ic(new g(k,u)).normalize());for(C=0;C<q.length;C+=1)if(k=d.pg(q[C]),f=k-h,k+=h,u=ac(a,b,c,q[C]),
k<u.min||u.max<f)return!1;return!0}}function ec(a,b,c,d,f){var h,k,l,n;if(d<b+a.ba||d>b+a.Oa||f<c+a.va||f>c+a.tb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return h=(a.Oa-a.ba)/2,d-=b+a.ba+h,f-=c+a.va+h,d*d+f*f<=h*h;case 1:return h=b+a.t.x[0],k=c+a.t.y[0],b+=a.t.x[1],a=c+a.t.y[1],d===h?f===k:d===b?f===a:1>Math.abs(k+(d-h)*(a-k)/(b-h)-f);case 4:h=bc(a);for(k=0;k<h.length;k+=1)if(l=new g(d,f),l=l.pg(h[k]),n=ac(a,b,c,h[k]),l<n.min||n.max<l)return!1;return!0;default:return!1}}
e.tc=function(a,b,c){var d=m.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.ba-1,b+this.va-1,3,3);break;case 2:d.fillRect(a+this.ba,b+this.va,this.Oa-this.ba+1,this.tb-this.va+1);break;case 3:c=(this.Oa-this.ba)/2;d.beginPath();d.arc(a+this.ba+c,b+this.va+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);d.lineTo(a+this.t.x[1],b+this.t.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.t.x[0],b+this.t.y[0]);
for(c=1;c<this.t.x.length-1;c+=1)d.lineTo(a+this.t.x[c],b+this.t.y[c]);d.closePath();d.fill()}};function fc(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.ua=[];this.vi=this.N=this.Fi=!1;this.Sd=1;this.ed=-1;this.za=-1E6}e=fc.prototype;e.K=function(){var a=new fc,b;for(b=0;b<this.ua.length;b+=1)a.ua.push({qb:this.ua[b].qb,action:this.ua[b].action});a.vi=this.vi;return a};
e.Y=function(a,b){var c,d;if(0===this.ua.length||this.ua[this.ua.length-1].qb<=a)this.ua.push({qb:a,action:b});else{for(c=0;this.ua[c].qb<=a;)c+=1;for(d=this.ua.length;d>c;d-=1)this.ua[d]=this.ua[d-1];this.ua[c]={qb:a,action:b}}this.za=-1E6};e.start=function(){this.Fi=!0;this.N=!1;this.ed=0>this.Sd&&0<this.ua.length?this.ua[this.ua.length-1].qb+1:-1;this.za=-1E6;J(H,this);I(this)};
e.vp=function(){if(0>this.Sd&&0<this.ua.length){var a=this.ua[this.ua.length-1].qb;this.ed=0>this.Sd?a+1:a-1}else this.ed=0>this.Sd?1:-1;this.za=-1E6};e.stop=function(){this.Fi=!1;J(H,this)};e.Ze=function(){return this.Fi};e.pause=function(){this.N=!0;J(H,this)};e.Oj=function(){this.N=!1;J(H,this);I(this)};e.paused=function(){return this.Fi&&this.N};e.jt=function(a){this.vi=a};
e.X=function(a){if(this.Fi&&!this.N&&0!==this.Sd)if(0<this.Sd){0>this.za&&(this.za=0);for(;this.za<this.ua.length&&this.ua[this.za].qb<=this.ed;)this.za+=1;for(this.ed+=this.Sd*a;0<=this.za&&this.za<this.ua.length&&this.ua[this.za].qb<=this.ed;)this.ua[this.za].action(this.ua[this.za].qb,this),this.za+=1;this.za>=this.ua.length&&(this.vi?this.vp():this.stop())}else{0>this.za&&(this.za=this.ua.length-1);for(;0<=this.za&&this.ua[this.za].qb>=this.ed;)this.za-=1;for(this.ed+=this.Sd*a;0<=this.za&&this.ua[this.za].qb>=
this.ed;)this.ua[this.za].action(this.ua[this.za].qb,this),this.za-=1;0>this.za&&0>=this.ed&&(this.vi?this.vp():this.stop())}};function gc(){this.depth=1E7;this.visible=!1;this.h=!0;this.group="Engine";this.oc=[];this.Vf=[];this.clear();this.my=!1;I(this)}e=gc.prototype;e.X=function(){var a,b,c,d,f;if(this.my)for(a=0;16>a;a+=1)H.fa[a].zb&&(b=H.fa[a].x,c=H.fa[a].y,d=this.Vf[a],f=this.oc[d],!(0<=d&&f&&f.selected)||f&&ec(f.pb,0,0,b,c)||(Kb(H,f.keyCode),f.selected=!1,this.Vf[a]=-1),this.Bb(a,b,c))};
e.Bb=function(a,b,c){var d;if(!(0<=this.Vf[a]))for(d=0;d<this.oc.length;d+=1){var f;if(f=this.oc[d])f=(f=this.oc[d])?ec(f.pb,0,0,b,c):!1;if(f&&!this.oc[d].selected){Jb(H,this.oc[d].keyCode);this.oc[d].selected=!0;this.Vf[a]=d;break}}};e.Cb=function(a){var b=this.Vf[a];0<=b&&this.oc[b]&&this.oc[b].selected&&(Kb(H,this.oc[b].keyCode),this.oc[b].selected=!1);this.Vf[a]=-1};function hc(a,b,c,d,f,h,k){c=Yb(c,d,f,h);a.oc.push({keyCode:k,pb:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.oc.length=0;16>a;a+=1)this.Vf[a]=-1};e.tc=function(a,b,c){var d,f,h,k;for(d=0;d<this.oc.length;d+=1)if(f=this.oc[d])f.selected?f.pb.tc(0,0,b):f.pb.tc(0,0,a),h=(f.pb.ba+f.pb.Oa)/2,k=(f.pb.va+f.pb.tb)/2,m.Qc("id: "+f.id,h-20,k-10,c,"16px Arial"),m.Qc("key: "+f.keyCode,h-20,k+10,c,"16px Arial")};new ga;function ic(a,b){return b}function K(a,b,c,d){return b+a/d*c}function jc(a,b,c,d,f){void 0===f&&(f=3);return b+c*Math.pow(a/d,f)}
function lc(a,b,c,d){return jc(a,b,c,d,2)}function mc(a,b,c,d){return jc(a,b,c,d,3)}function nc(a,b,c,d){return b+c*jc(d-a,1,-1,d,3)}function oc(a,b,c,d){return b+c*(a<d/2?jc(a,0,.5,d/2,3):jc(d-a,1,-.5,d/2,3))}function pc(a,b,c,d){return b+c*jc(d-a,1,-1,d,4)}function qc(a,b,c,d){return b+c*(a<d/2?0+.5*(1-Math.cos(a/(d/2)*Math.PI/2)):1+-.5*(1-Math.cos((d-a)/(d/2)*Math.PI/2)))}function rc(a,b,c,d){return b+c*(1+-1*(1-Math.sqrt(1-Math.pow((d-a)/d,2))))}
function sc(a,b,c,d,f,h){a=d-a;var k=h;void 0===f&&(f=3);void 0===k&&(k=8);h=Math.sin(2*(1-a/d)*Math.PI*f+Math.PI/2);f=k;void 0===f&&(f=8);k=Math.pow(2,-f);h*=0+(Math.pow(2,f*a/d-f)-k)/(1-k)*1;return b+c*(1+-1*h)}function tc(a,b,c,d,f){void 0===f&&(f=1.70158);return b+c*((1+f)*Math.pow(a/d,3)-f*Math.pow(a/d,2))}function uc(a,b,c,d,f){return b+c*tc(d-a,1,-1,d,f)}
function vc(a){switch(1){case 0:return function(b,c,d,f,h,k,l){return 0>b?c:b>f?c+d:a(b,c,d,f,h,k,l)};case 1:return function(b,c,d,f,h,k,l){return a(b-Math.floor(b/f)*f,c,d,f,h,k,l)};case 2:return function(b,c,d,f,h,k,l){b=0===Math.floor(b/f)%2?a(b-Math.floor(b/f)*f,0,1,f,h,k,l):a(f-b+Math.floor(b/f)*f,0,1,f,h,k,l);return c+d*b};case 3:return function(b,c,d,f,h,k,l){h=a(b-Math.floor(b/f)*f,0,1,f,h,k,l);0!==Math.floor(b/f)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,f,h,k,l){var n=Math.floor(b/
f);b=a(b-Math.floor(b/f)*f,0,1,f,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,f,h,k,l){var n=Math.floor(b/f);b=0===Math.floor(b/f)%2?a(b-Math.floor(b/f)*f,0,1,f,h,k,l):a(f-b+Math.floor(b/f)*f,1,-1,f,h,k,l);return c+d*(n+b)};default:return function(b,c,d,f,h,k,l){return a(b,c,d,f,h,k,l)}}}
function wc(a,b,c){var d,f=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)f+=c[d];for(d=0;d<a.length;d+=1)c[d]/=f;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),f=a[d]===ic?0:b[d]?-1:1,k.push(k[d]+f),h=Math.max(h,k[d+1]);return function(d,f,u,B,C,t,s){var v,x;v=a.length-1;for(x=0;x<a.length;x+=1)if(d/B<=l[x+1]){v=x;break}d=a[v](d/B-l[v],0,1,c[v],C,t,s);b[v]&&(d=-d);return f+(k[v]+d)*u/h}}
var L=window.TG_InitSettings||{};L.size=void 0!==L.size?L.size:"big";L.tu=L.usesFullScreen;L.xp="big"===L.size?1:.5;L.vg=20;L.wg=10;L.yf=0;L.ol=-10;L.Eh=-20;L.Jc=-30;L.Pe=-40;
function M(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(L.xp*a);break a;case "round":c=Math.round(L.xp*a);break a;default:c=L.xp*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=M(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=M(a[c],b));return a}}function N(a){return"big"===L.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}var O=O||{};O["nl-nl"]=O["nl-nl"]||{};O["nl-nl"].bs_stage="Level";
O["nl-nl"].bs_start="Doel";O["nl-nl"].bs_gameover="Helaas";O["nl-nl"].bs_shootallbubbles="Kun jij het hoogste level behalen?";O["nl-nl"].bs_switch="Wisselen";O["nl-nl"].bs_tap_to_switch_bubbles="#touch{Klik om bubbles te wisselen}{Tik om bubbles te wisselen}";O["nl-nl"].bs_nice="Mooi!";O["nl-nl"].bs_great="Geweldig!";O["nl-nl"].bs_awesome="Fantastisch!";O["nl-nl"].TutorialTitle_1="Speluitleg";O["nl-nl"].TutorialText_0="Schiet met bubbels en vorm groepen van drie of meer bubbels van dezelfde kleur.";
O["nl-nl"].TutorialText_1="Door groepen te vormen verwijder je bubbels.";O["nl-nl"].TutorialTitle_2="Voortgang";O["nl-nl"].TutorialText_2="Elke bubbel is punten waard. Hoe groter de groep, hoe meer punten.";O["nl-nl"].TutorialTitle_3="Levels voltooien";O["nl-nl"].TutorialText_3="Verdien 500 punten om naar het volgende level te gaan.";O["nl-nl"].TutorialTitle_6="Bonussen";O["nl-nl"].TutorialText_6="Dit is een bom. De bom verwijdert omliggende bubbels als hij geraakt wordt.";
O["nl-nl"].TutorialTitle_5="Bonussen";O["nl-nl"].TutorialText_5="Dit zijn kleurenbommen. Ze geven hun kleur aan alle omliggende bubbels.";O["nl-nl"].TutorialTitle_7="Bonussen";O["nl-nl"].TutorialText_7="Dit is een vuurbal. Hij vernietigt alle bubbels op zijn pad.";O["nl-nl"].TutorialTitle_0="Speluitleg";O["nl-nl"].TutorialText_4="Dit zijn blokkers. Een blok kan je alleen wegspelen door de omringende bubbels te verwijderen.";O["nl-nl"].TutorialTitle_4="Blokkers";O["en-us"]=O["en-us"]||{};
O["en-us"].bs_stage="Stage";O["en-us"].bs_start="Goal";O["en-us"].bs_gameover="Game over";O["en-us"].bs_shootallbubbles="Can you reach the highest level?";O["en-us"].bs_switch="Switch";O["en-us"].bs_tap_to_switch_bubbles="#touch{Click to switch bubbles}{Tap to switch bubbles}";O["en-us"].bs_nice="Nice!";O["en-us"].bs_great="Great!";O["en-us"].bs_awesome="Awesome!";O["en-us"].TutorialTitle_1="How to play";O["en-us"].TutorialText_0="Shoot bubbles to form groups of 3 or more of the same color.";
O["en-us"].TutorialText_1="Creating groups will destroy bubbles.";O["en-us"].TutorialTitle_2="Progress";O["en-us"].TutorialText_2="Each bubble is worth points. Bigger groups earn you more points.";O["en-us"].TutorialTitle_3="Completing levels";O["en-us"].TutorialText_3="Earn 500 points to gain a level.";O["en-us"].TutorialTitle_6="Boosters";O["en-us"].TutorialText_6="This is a bomb. It will remove all surrounding bubbles when hit.";O["en-us"].TutorialTitle_5="Boosters";O["en-us"].TutorialText_5="These are color bombs. They will color all surrounding bubbles with their color.";
O["en-us"].TutorialTitle_7="Boosters";O["en-us"].TutorialText_7="This is a fireball. It will destroy all bubbles in its path.";O["en-us"].TutorialTitle_0="How to play";O["en-us"].TutorialText_4="These are blockers. You can get rid of them by removing their surrounding bubbles.";O["en-us"].TutorialTitle_4="Blockers";O["en-gb"]=O["en-gb"]||{};O["en-gb"].bs_stage="Stage";O["en-gb"].bs_start="Goal";O["en-gb"].bs_gameover="Game over";O["en-gb"].bs_shootallbubbles="Can you reach the highest level?";
O["en-gb"].bs_switch="Switch";O["en-gb"].bs_tap_to_switch_bubbles="#touch{Click to switch bubbles}{Tap to switch bubbles}";O["en-gb"].bs_nice="Nice!";O["en-gb"].bs_great="Great!";O["en-gb"].bs_awesome="Awesome!";O["en-gb"].TutorialTitle_1="How to play";O["en-gb"].TutorialText_0="Shoot bubbles to form groups of 3 or more of the same color.";O["en-gb"].TutorialText_1="Creating groups will destroy bubbles.";O["en-gb"].TutorialTitle_2="Progress";O["en-gb"].TutorialText_2="Each bubble is worth points. Bigger groups earn you more points.";
O["en-gb"].TutorialTitle_3="Completing levels";O["en-gb"].TutorialText_3="Earn 500 points to gain a level.";O["en-gb"].TutorialTitle_6="Boosters";O["en-gb"].TutorialText_6="This is a bomb. It will remove all surrounding bubbles when hit.";O["en-gb"].TutorialTitle_5="Boosters";O["en-gb"].TutorialText_5="These are colour bombs. They will colour all surrounding bubbles with their colour.";O["en-gb"].TutorialTitle_7="Boosters";O["en-gb"].TutorialText_7="This is a fireball. It will destroy all bubbles in its path.";
O["en-gb"].TutorialTitle_0="How to play";O["en-gb"].TutorialText_4="These are blockers. You can get rid of them by removing their surrounding bubbles.";O["en-gb"].TutorialTitle_4="Blockers";O["de-de"]=O["de-de"]||{};O["de-de"].bs_stage="Stufe";O["de-de"].bs_start="Ziel";O["de-de"].bs_gameover="ENDE!";O["de-de"].bs_shootallbubbles="Kannst du das h\u00f6chste Level erreichen?";O["de-de"].bs_switch="Schalter";O["de-de"].bs_tap_to_switch_bubbles="#touch{Blasen wechseln: Klicken}{Blasen wechseln: Tippen}";
O["de-de"].bs_nice="Toll!";O["de-de"].bs_great="Super!";O["de-de"].bs_awesome="Fantastisch!";O["de-de"].TutorialTitle_1="So wird gespielt";O["de-de"].TutorialText_0="Schie\u00dfe Blasen nach oben, um Gruppen aus mindestens drei gleichfarbigen Blasen zu bilden.";O["de-de"].TutorialText_1="Wird eine Gruppe gebildet, zerst\u00f6rt das die Blasen.";O["de-de"].TutorialTitle_2="Fortschritt";O["de-de"].TutorialText_2="Jede Blase bringt dir Punkte ein. Gr\u00f6\u00dfere Gruppen sind mehr Punkte wert.";
O["de-de"].TutorialTitle_3="Levels abschlie\u00dfen";O["de-de"].TutorialText_3="Verdiene dir 500 Punkte, um ein Level aufzusteigen.";O["de-de"].TutorialTitle_6="Extras";O["de-de"].TutorialText_6="Das ist eine Bombe. Sie entfernt bei einem Treffer alle Blasen, von denen sie umgeben ist.";O["de-de"].TutorialTitle_5="Extras";O["de-de"].TutorialText_5="Das sind Farbbomben. Sie f\u00e4rben alle sie umgebenden Blasen in ihre Farbe um.";O["de-de"].TutorialTitle_7="Extras";O["de-de"].TutorialText_7="Das ist ein Feuerball. Er zerst\u00f6rt alle Blasen in seiner Flugbahn.";
O["de-de"].TutorialTitle_0="So wird gespielt";O["de-de"].TutorialText_4="Das sind Blocker. Blocker wirst du los, indem du die Blasen entfernst, von denen sie umgeben sind.";O["de-de"].TutorialTitle_4="Blocker";O["fr-fr"]=O["fr-fr"]||{};O["fr-fr"].bs_stage="Sc\u00e8ne";O["fr-fr"].bs_start="Objectif";O["fr-fr"].bs_gameover="Partie termin\u00e9e";O["fr-fr"].bs_shootallbubbles="Atteindrez-vous le dernier niveau ?";O["fr-fr"].bs_switch="\u00c9changer";O["fr-fr"].bs_tap_to_switch_bubbles="#touch{Cliquez pour \u00e9changer les bulles}{Touchez pour \u00e9changer les bulles}";
O["fr-fr"].bs_nice="Joli !";O["fr-fr"].bs_great="G\u00e9nial !";O["fr-fr"].bs_awesome="Excellent !";O["fr-fr"].TutorialTitle_1="Comment jouer";O["fr-fr"].TutorialText_0="Tirez vos bulles pour former des groupes de 3 (ou plus) de la m\u00eame couleur.";O["fr-fr"].TutorialText_1="Cr\u00e9er des groupes de bulles les fait dispara\u00eetre.";O["fr-fr"].TutorialTitle_2="Progression";O["fr-fr"].TutorialText_2="Chaque bulle rapporte des points. Plus le groupe est grand, plus vous gagnez de points.";
O["fr-fr"].TutorialTitle_3="Terminer les niveaux";O["fr-fr"].TutorialText_3="Atteignez 500 points pour passer au niveau suivant.";O["fr-fr"].TutorialTitle_6="Bonus";O["fr-fr"].TutorialText_6="Ceci est une bombe. Elle fait dispara\u00eetre toutes les bulles proches.";O["fr-fr"].TutorialTitle_5="Bonus";O["fr-fr"].TutorialText_5="Voici des bombes de couleur. Elles changent la couleur de toutes les bulles avoisinantes.";O["fr-fr"].TutorialTitle_7="Bonus";O["fr-fr"].TutorialText_7="Ceci est une boule de feu. Elle d\u00e9truit toutes les bulles sur son chemin.";
O["fr-fr"].TutorialTitle_0="Comment jouer";O["fr-fr"].TutorialText_4="Voici des cailloux. Vous pouvez vous en d\u00e9barrasser en \u00e9clatant les bulles situ\u00e9es autour.";O["fr-fr"].TutorialTitle_4="Cailloux";O["pt-br"]=O["pt-br"]||{};O["pt-br"].bs_stage="Fase";O["pt-br"].bs_start="Objetivo";O["pt-br"].bs_gameover="Fim do jogo";O["pt-br"].bs_shootallbubbles="Tente chegar ao n\u00edvel m\u00e1ximo!";O["pt-br"].bs_switch="Trocar";O["pt-br"].bs_tap_to_switch_bubbles="#touch{Clique para trocar as bolhas.}{Toque para trocar as bolhas.}";
O["pt-br"].bs_nice="Legal!";O["pt-br"].bs_great="\u00d3timo!";O["pt-br"].bs_awesome="Incr\u00edvel!";O["pt-br"].TutorialTitle_1="Como jogar";O["pt-br"].TutorialText_0="Atire nas bolhas para formar grupos de 3 ou mais da mesma cor.";O["pt-br"].TutorialText_1="Forme grupos para destruir as bolhas.";O["pt-br"].TutorialTitle_2="Progresso";O["pt-br"].TutorialText_2="Cada bolha vale pontos. Grupos maiores valem mais pontos.";O["pt-br"].TutorialTitle_3="Passar de n\u00edvel";O["pt-br"].TutorialText_3="Fa\u00e7a 500 pontos para passar de fase.";
O["pt-br"].TutorialTitle_6="Refor\u00e7os";O["pt-br"].TutorialText_6="Esta \u00e9 a bomba. Quando \u00e9 atingida, remove todas as bolhas ao redor.";O["pt-br"].TutorialTitle_5="Refor\u00e7os";O["pt-br"].TutorialText_5="Estas s\u00e3o bombas de cor. Elas deixam as bolhas ao redor com a mesma cor delas.";O["pt-br"].TutorialTitle_7="Refor\u00e7os";O["pt-br"].TutorialText_7="Esta \u00e9 a bola de fogo. Ela destr\u00f3i todas as bolhas em seu caminho.";O["pt-br"].TutorialTitle_0="Como jogar";
O["pt-br"].TutorialText_4="Estes s\u00e3o os bloqueadores. Remova as bolhas ao redor, para se livrar deles.";O["pt-br"].TutorialTitle_4="Bloqueadores";O["es-es"]=O["es-es"]||{};O["es-es"].bs_stage="Fase";O["es-es"].bs_start="Objetivo";O["es-es"].bs_gameover="Fin del juego";O["es-es"].bs_shootallbubbles="\u00bfPuedes llegar al \u00faltimo nivel?";O["es-es"].bs_switch="Cambiar";O["es-es"].bs_tap_to_switch_bubbles="#touch{Haz clic para cambiar de burbuja.}{Toca para cambiar de burbuja.}";
O["es-es"].bs_nice="\u00a1Guay!";O["es-es"].bs_great="\u00a1Genial!";O["es-es"].bs_awesome="\u00a1Estupendo!";O["es-es"].TutorialTitle_1="C\u00f3mo jugar";O["es-es"].TutorialText_0="Dispara burbujas para crear grupos de 3 o m\u00e1s del mismo color.";O["es-es"].TutorialText_1="Al crear grupos, eliminas las burbujas.";O["es-es"].TutorialTitle_2="Progreso";O["es-es"].TutorialText_2="Cada burbuja te da puntos. Cuanto mayor sea el grupo, m\u00e1s puntos dan.";O["es-es"].TutorialTitle_3="Completar niveles";
O["es-es"].TutorialText_3="Gana 500 puntos para subir de nivel.";O["es-es"].TutorialTitle_6="Potenciadores";O["es-es"].TutorialText_6="Esto es una bomba. Eliminar\u00e1 las burbujas a su alrededor si le das.";O["es-es"].TutorialTitle_5="Potenciadores";O["es-es"].TutorialText_5="Estas son bombas de color. Hacen que las burbujas cercanas sean de su color.";O["es-es"].TutorialTitle_7="Potenciadores";O["es-es"].TutorialText_7="Esto es una bola de fuego. Destruye las burbujas en su camino.";
O["es-es"].TutorialTitle_0="C\u00f3mo jugar";O["es-es"].TutorialText_4="Esto es un bloqueo. Para librarte de \u00e9l, elimina las burbujas de alrededor.";O["es-es"].TutorialTitle_4="Bloqueos";O["tr-tr"]=O["tr-tr"]||{};O["tr-tr"].bs_stage="B\u00f6l\u00fcm";O["tr-tr"].bs_start="Hedef";O["tr-tr"].bs_gameover="Oyun bitti";O["tr-tr"].bs_shootallbubbles="En y\u00fcksek seviyeye ula\u015fabilir misin?";O["tr-tr"].bs_switch="De\u011fi\u015ftir";O["tr-tr"].bs_tap_to_switch_bubbles="#touch{Balonlar\u0131 de\u011fi\u015ftirmek i\u00e7in t\u0131kla}{Balonlar\u0131 de\u011fi\u015ftirmek i\u00e7in dokun}";
O["tr-tr"].bs_nice="G\u00fczel!";O["tr-tr"].bs_great="Harika!";O["tr-tr"].bs_awesome="Muhte\u015fem!";O["tr-tr"].TutorialTitle_1="Nas\u0131l oynan\u0131r";O["tr-tr"].TutorialText_0="3'l\u00fc ya da daha fazla ayn\u0131 renkten gruplar olu\u015fturmak i\u00e7in balonlar\u0131 vur.";O["tr-tr"].TutorialText_1="Gruplar olu\u015fturmak balonlar\u0131 yok eder.";O["tr-tr"].TutorialTitle_2="\u0130lerleme";O["tr-tr"].TutorialText_2="Her balonun puan de\u011feri vard\u0131r. Daha b\u00fcy\u00fck gruplar daha fazla puan kazand\u0131r\u0131r.";
O["tr-tr"].TutorialTitle_3="Seviyeleri tamamlama";O["tr-tr"].TutorialText_3="Seviye atlamak i\u00e7in 500 puan kazan.";O["tr-tr"].TutorialTitle_6="Destekler";O["tr-tr"].TutorialText_6="Bu bir bombad\u0131r. Vuruldu\u011funda etraflar\u0131ndaki balonlar\u0131 kald\u0131r\u0131r.";O["tr-tr"].TutorialTitle_5="Destekler";O["tr-tr"].TutorialText_5="Bunlar renkli bombalard\u0131r. Etraflar\u0131ndaki balonlar\u0131 kendi renklerine boyarlar.";O["tr-tr"].TutorialTitle_7="Destekler";
O["tr-tr"].TutorialText_7="Bu bir alev topu. Yolundaki t\u00fcm balonlar\u0131 yok eder.";O["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";O["tr-tr"].TutorialText_4="Bunlar engelleyenler! Bunlardan kurtulmak i\u00e7in etraflar\u0131ndaki balonlar\u0131 kald\u0131r.";O["tr-tr"].TutorialTitle_4="Engelleyenler";O["ru-ru"]=O["ru-ru"]||{};O["ru-ru"].bs_stage="\u042d\u0442\u0430\u043f";O["ru-ru"].bs_start="\u0426\u0435\u043b\u044c";O["ru-ru"].bs_gameover="\u041a\u043e\u043d\u0435\u0446 \u0438\u0433\u0440\u044b";
O["ru-ru"].bs_shootallbubbles="\u0414\u043e\u0431\u0435\u0440\u0435\u0442\u0435\u0441\u044c \u043b\u0438 \u0432\u044b \u0434\u043e \u0441\u0430\u043c\u043e\u0433\u043e \u0432\u044b\u0441\u043e\u043a\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f?";O["ru-ru"].bs_switch="\u0421\u043c\u0435\u043d\u0430 \u0446\u0432\u0435\u0442\u0430";O["ru-ru"].bs_tap_to_switch_bubbles="#touch{\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u0443\u0437\u044b\u0440\u0438 \u043c\u0435\u0441\u0442\u0430\u043c\u0438}{\u041a\u043e\u0441\u043d\u0438\u0442\u0435\u0441\u044c, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u0435\u043d\u044f\u0442\u044c \u043f\u0443\u0437\u044b\u0440\u0438 \u043c\u0435\u0441\u0442\u0430\u043c\u0438}";
O["ru-ru"].bs_nice="\u0417\u0434\u043e\u0440\u043e\u0432\u043e!";O["ru-ru"].bs_great="\u041e\u0442\u043b\u0438\u0447\u043d\u043e!";O["ru-ru"].bs_awesome="\u041a\u0440\u0443\u0442\u043e!";O["ru-ru"].TutorialTitle_1="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";O["ru-ru"].TutorialText_0="\u0421\u0442\u0440\u0435\u043b\u044f\u0439\u0442\u0435 \u043f\u0443\u0437\u044b\u0440\u044f\u043c\u0438, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0435\u0434\u0438\u043d\u0438\u0442\u044c 3 \u0438 \u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0443\u0437\u044b\u0440\u0435\u0439 \u043e\u0434\u043d\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430.";
O["ru-ru"].TutorialText_1="\u0421\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u043d\u044b\u0435 \u043f\u0443\u0437\u044b\u0440\u0438 \u043b\u043e\u043f\u0430\u044e\u0442\u0441\u044f.";O["ru-ru"].TutorialTitle_2="\u0425\u043e\u0434 \u0438\u0433\u0440\u044b";O["ru-ru"].TutorialText_2="\u0417\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u043f\u0443\u0437\u044b\u0440\u044c \u0432\u044b \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442\u0435 \u043e\u0447\u043a\u0438. \u0427\u0435\u043c \u0431\u043e\u043b\u044c\u0448\u0435 \u0433\u0440\u0443\u043f\u043f\u0430, \u0442\u0435\u043c \u0431\u043e\u043b\u044c\u0448\u0435 \u043e\u0447\u043a\u043e\u0432 \u0432\u044b \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442\u0435.";
O["ru-ru"].TutorialTitle_3="\u041f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0440\u043e\u0432\u043d\u0435\u0439";O["ru-ru"].TutorialText_3="\u0417\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0439\u0442\u0435 500 \u043e\u0447\u043a\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u043d\u043e\u0432\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c.";O["ru-ru"].TutorialTitle_6="\u0411\u043e\u043d\u0443\u0441\u044b";
O["ru-ru"].TutorialText_6="\u042d\u0442\u043e \u0431\u043e\u043c\u0431\u0430. \u041f\u0440\u0438 \u0432\u0437\u0440\u044b\u0432\u0435 \u043e\u043d\u0430 \u0443\u043d\u0438\u0447\u0442\u043e\u0436\u0430\u0435\u0442 \u0432\u0441\u0435 \u043e\u043a\u0440\u0443\u0436\u0430\u044e\u0449\u0438\u0435 \u043f\u0443\u0437\u044b\u0440\u0438.";O["ru-ru"].TutorialTitle_5="\u0411\u043e\u043d\u0443\u0441\u044b";O["ru-ru"].TutorialText_5="\u042d\u0442\u043e \u0446\u0432\u0435\u0442\u043d\u044b\u0435 \u0431\u043e\u043c\u0431\u044b. \u041e\u043d\u0438 \u043f\u0435\u0440\u0435\u043a\u0440\u0430\u0448\u0438\u0432\u0430\u044e\u0442 \u0432\u0441\u0435 \u043f\u0443\u0437\u044b\u0440\u0438 \u0440\u044f\u0434\u043e\u043c \u0432 \u0441\u0432\u043e\u0439 \u0446\u0432\u0435\u0442.";
O["ru-ru"].TutorialTitle_7="\u0411\u043e\u043d\u0443\u0441\u044b";O["ru-ru"].TutorialText_7="\u042d\u0442\u043e \u043e\u0433\u043d\u0435\u043d\u043d\u044b\u0439 \u0448\u0430\u0440. \u041e\u043d \u0443\u043d\u0438\u0447\u0442\u043e\u0436\u0430\u0435\u0442 \u0432\u0441\u0435 \u043f\u0443\u0437\u044b\u0440\u0438 \u043d\u0430 \u0441\u0432\u043e\u0435\u043c \u043f\u0443\u0442\u0438.";O["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";O["ru-ru"].TutorialText_4="\u042d\u0442\u043e \u0431\u043b\u043e\u043a\u0430\u0442\u043e\u0440\u044b. \u0418\u0437\u0431\u0430\u0432\u0438\u0442\u044c\u0441\u044f \u043e\u0442 \u043d\u0438\u0445 \u043c\u043e\u0436\u043d\u043e, \u0443\u0431\u0440\u0430\u0432 \u043e\u043a\u0440\u0443\u0436\u0430\u044e\u0449\u0438\u0435 \u043f\u0443\u0437\u044b\u0440\u0438.";
O["ru-ru"].TutorialTitle_4="\u0411\u043b\u043e\u043a\u0430\u0442\u043e\u0440\u044b";O["ar-eg"]=O["ar-eg"]||{};O["ar-eg"].bs_stage="\u0627\u0644\u0645\u0631\u062d\u0644\u0629";O["ar-eg"].bs_start="\u0627\u0644\u0647\u062f\u0641";O["ar-eg"].bs_gameover="\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u0644\u0639\u0628\u0629";O["ar-eg"].bs_shootallbubbles="\u0647\u0644 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649\u061f";
O["ar-eg"].bs_switch="\u062a\u0628\u062f\u064a\u0644";O["ar-eg"].bs_tap_to_switch_bubbles="#touch{\u0627\u0646\u0642\u0631 \u0644\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a}{\u0627\u0644\u0645\u0633 \u0644\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a}";O["ar-eg"].bs_nice="\u062c\u064a\u062f!";O["ar-eg"].bs_great="\u0639\u0638\u064a\u0645!";O["ar-eg"].bs_awesome="\u0631\u0627\u0626\u0639!";O["ar-eg"].TutorialTitle_1="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";
O["ar-eg"].TutorialText_0="\u0642\u0645 \u0628\u0642\u0630\u0641 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0644\u062a\u0643\u0648\u064a\u0646 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0645\u0646 \u062b\u0644\u0627\u062b \u0641\u0642\u0627\u0639\u0627\u062a \u0623\u0648 \u0643\u062b\u0631 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0644\u0648\u0646.";O["ar-eg"].TutorialText_1="\u064a\u0624\u062f\u064a \u062a\u0643\u0648\u064a\u0646 \u0645\u062c\u0645\u0648\u0639\u0627\u062a \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0625\u0644\u0649 \u062a\u062f\u0645\u064a\u0631\u0647\u0627.";
O["ar-eg"].TutorialTitle_2="\u0627\u0644\u062a\u0642\u062f\u0645";O["ar-eg"].TutorialText_2="\u062a\u0633\u0627\u0648\u064a \u0643\u0644 \u0641\u0642\u0627\u0639\u0629 \u0639\u062f\u062f\u064b\u0627 \u0645\u0646 \u0627\u0644\u0646\u0642\u0627\u0637. \u0648\u0643\u0644\u0645\u0627 \u0632\u0627\u062f \u0639\u062f\u062f \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0641\u064a \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629\u060c \u0632\u0627\u062f \u0639\u062f\u062f \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062a\u0628 \u062a\u062c\u0645\u0639\u0647\u0627.";
O["ar-eg"].TutorialTitle_3="\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a";O["ar-eg"].TutorialText_3="\u0627\u062c\u0645\u0639 500 \u0646\u0642\u0637\u0629 \u0644\u0644\u0641\u0648\u0632 \u0628\u0645\u0633\u062a\u0648\u0649.";O["ar-eg"].TutorialTitle_6="\u0645\u064a\u0632\u0627\u062a";O["ar-eg"].TutorialText_6="\u0647\u0630\u0647 \u0642\u0646\u0628\u0644\u0629. \u0633\u062a\u0642\u0648\u0645 \u0628\u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0627\u0644\u0645\u062d\u064a\u0637\u0629 \u0628\u0647\u0627 \u0639\u0646\u062f \u0636\u0631\u0628\u0647\u0627.";
O["ar-eg"].TutorialTitle_5="\u0645\u064a\u0632\u0627\u062a";O["ar-eg"].TutorialText_5="\u0647\u0630\u0647 \u0642\u0646\u0627\u0628\u0644 \u0627\u0644\u0644\u0648\u0646. \u0633\u062a\u0642\u0648\u0645 \u0627\u0644\u0642\u0646\u0627\u0628\u0644 \u0628\u062a\u0644\u0648\u064a\u0646 \u0643\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0627\u0644\u0645\u062d\u064a\u0637\u0629 \u0628\u0647\u0627 \u0628\u0644\u0648\u0646\u0647\u0627.";O["ar-eg"].TutorialTitle_7="\u0645\u064a\u0632\u0627\u062a";
O["ar-eg"].TutorialText_7="\u0647\u0630\u0647 \u0643\u0631\u0629 \u0646\u0627\u0631\u064a\u0629. \u0633\u062a\u0642\u0648\u0645 \u0628\u062a\u062f\u0645\u064a\u0631 \u0643\u0644 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0627\u0644\u0645\u0648\u062c\u0648\u062f\u0629 \u0641\u064a \u0645\u0633\u0627\u0631\u0647\u0627.";O["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";O["ar-eg"].TutorialText_4="\u0647\u0630\u0647 \u0635\u062e\u0648\u0631. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u062e\u0644\u0635 \u0645\u0646\u0647\u0627 \u0639\u0646 \u0637\u0631\u064a\u0642 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0641\u0642\u0627\u0639\u0627\u062a \u0627\u0644\u0645\u062d\u064a\u0637\u0629 \u0628\u0647\u0627.";
O["ar-eg"].TutorialTitle_4="\u0635\u062e\u0648\u0631";O["ko-kr"]=O["ko-kr"]||{};O["ko-kr"].bs_stage="Stage";O["ko-kr"].bs_start="\ubaa9\ud45c";O["ko-kr"].bs_gameover="Game over";O["ko-kr"].bs_shootallbubbles="\ucd5c\uace0 \ub808\ubca8\uc5d0 \ub3c4\ub2ec\ud560 \uc218 \uc788\ub098\uc694?";O["ko-kr"].bs_switch="\uc804\ud658";O["ko-kr"].bs_tap_to_switch_bubbles="#touch{\ubc84\ube14\uc744 \ubc14\uafb8\ub824\uba74 \uc804\ud658\uc744 \ud074\ub9ad\ud558\uc138\uc694}{\ubc84\ube14\uc744 \ubc14\uafb8\ub824\uba74 \uc804\ud658\uc744 \ub204\ub974\uc138\uc694}";
O["ko-kr"].bs_nice="\uc88b\uc544\uc694!";O["ko-kr"].bs_great="\ud6cc\ub96d\ud574!";O["ko-kr"].bs_awesome="\uba4b\uc9c0\uad70\uc694!";O["ko-kr"].TutorialTitle_1="\uac8c\uc784 \ubc29\ubc95";O["ko-kr"].TutorialText_0="3\uac1c \uc774\uc0c1\uc758 \uac19\uc740 \uc0c9 \uadf8\ub8f9\uc744 \ud5a5\ud574 \uc3d8\uc138\uc694.";O["ko-kr"].TutorialText_1="\uadf8\ub8f9\uc774 \ub9cc\ub4e4\uba74 \ubc84\ube14\uc744 \ud30c\uad34\ud569\ub2c8\ub2e4.";O["ko-kr"].TutorialTitle_2="\uc9c4\ud589";O["ko-kr"].TutorialText_2="\uac01 \ubc84\ube14\uc774 \uc810\uc218\uac00 \ub429\ub2c8\ub2e4. \ub354 \ud070 \uadf8\ub8f9\uc740 \ub354 \ub9ce\uc740 \uc810\uc218\ub97c \ud68d\ub4dd\ud569\ub2c8\ub2e4.";
O["ko-kr"].TutorialTitle_3="\ub808\ubca8 \uc644\ub8cc\ud558\uae30";O["ko-kr"].TutorialText_3="\ub808\ubca8\uc744 \ud655\ubcf4\ud558\ub824\uba74 500\uc810\uc744 \ud68d\ub4dd\ud558\uc138\uc694.";O["ko-kr"].TutorialTitle_6="\ubd80\uc2a4\ud130";O["ko-kr"].TutorialText_6="\ud3ed\ud0c4\uc785\ub2c8\ub2e4. \ub9de\ucd94\uba74 \uc8fc\uc704 \ubaa8\ub4e0 \ubc84\ube14\uc744 \uc81c\uac70\ud569\ub2c8\ub2e4.";O["ko-kr"].TutorialTitle_5="\ubd80\uc2a4\ud130";O["ko-kr"].TutorialText_5="\uc0c9\uae54 \ud3ed\ud0c4\uc785\ub2c8\ub2e4. \uc8fc\ubcc0\uc758 \ubc84\ube14\uc744 \uac19\uc740 \uc0c9\uc73c\ub85c \ubc14\uafc9\ub2c8\ub2e4.";
O["ko-kr"].TutorialTitle_7="\ubd80\uc2a4\ud130";O["ko-kr"].TutorialText_7="\ubd88 \ub369\uc5b4\ub9ac\uc785\ub2c8\ub2e4. \uc9c0\ub098\uac04 \uc790\ub9ac\uc758 \ubaa8\ub4e0 \ubc84\ube14\uc744 \ud30c\uad34\ud569\ub2c8\ub2e4.";O["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";O["ko-kr"].TutorialText_4="\ucc28\ub2e8\uc81c\uc785\ub2c8\ub2e4. \uc8fc\ubcc0 \ubc84\ube14\uc744 \uc81c\uac70\ud574 \ud30c\uad34\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";O["ko-kr"].TutorialTitle_4="\ucc28\ub2e8\uc81c";
O["jp-jp"]=O["jp-jp"]||{};O["jp-jp"].bs_stage="\u30ec\u30d9\u30eb";O["jp-jp"].bs_start="\u30b4\u30fc\u30eb";O["jp-jp"].bs_gameover="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";O["jp-jp"].bs_shootallbubbles="\u30cf\u30a4\u30b9\u30b3\u30a2\u3092\u76ee\u6307\u3057\u3066\u306d\uff01";O["jp-jp"].bs_switch="\u4ea4\u63db";O["jp-jp"].bs_tap_to_switch_bubbles="#touch{\u30bf\u30c3\u30d7\u3057\u3066\u30d0\u30d6\u30eb\u3092\u4ea4\u63db\u3057\u3066\u304f\u3060\u3055\u3044\u3002}{\u30bf\u30c3\u30d7\u3067\u30d0\u30d6\u30eb\u3092\u4ea4\u63db}";
O["jp-jp"].bs_nice="Nice!";O["jp-jp"].bs_great="Great!";O["jp-jp"].bs_awesome="Awesome!";O["jp-jp"].TutorialTitle_1="\u3042\u305d\u3073\u65b9";O["jp-jp"].TutorialText_0="\u540c\u3058\u8272\u306e\u30d0\u30d6\u30eb\u304c\uff13\u3064\u4ee5\u4e0a\u30de\u30c3\u30c1\u3059\u308b\u5834\u6240\u306b\u3001\n\u30d0\u30d6\u30eb\u3092\u6483\u3063\u3066\u304f\u3060\u3055\u3044\u3002";O["jp-jp"].TutorialText_1="\u30de\u30c3\u30c1\u3059\u308b\u3068\u30d0\u30d6\u30eb\u304c\u6d88\u3048\u307e\u3059\u3002";
O["jp-jp"].TutorialTitle_2="\u30dd\u30a4\u30f3\u30c8";O["jp-jp"].TutorialText_2="\u30d0\u30d6\u30eb\u3092\u6d88\u3059\u3068\u30dd\u30a4\u30f3\u30c8\u304c\u5f97\u3089\u308c\u307e\u3059\u3002\n\u591a\u304f\u306e\u30d0\u30d6\u30eb\u3092\u4e00\u5ea6\u306b\u6d88\u3059\u3068\u3001\n\u3088\u308a\u591a\u304f\u306e\u30dd\u30a4\u30f3\u30c8\u3092\u7372\u5f97\u3067\u304d\u307e\u3059\u3002";O["jp-jp"].TutorialTitle_3="\u30ec\u30d9\u30eb\u30af\u30ea\u30a2";O["jp-jp"].TutorialText_3="500\u30dd\u30a4\u30f3\u30c8\u3092\u7372\u5f97\u3059\u308b\u3068\u6b21\u306e\u30ec\u30d9\u30eb\u3078\u9032\u3081\u307e\u3059\u3002";
O["jp-jp"].TutorialTitle_6="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";O["jp-jp"].TutorialText_6="\u7206\u5f3e\u3092\u6483\u3064\u3068\u3001\n\u307e\u308f\u308a\u306e\u30d0\u30eb\u30fc\u30f3\u3092\u4e00\u5ea6\u306b\u6d88\u3059\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002";O["jp-jp"].TutorialTitle_5="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";O["jp-jp"].TutorialText_5="\u30ab\u30e9\u30fc\u7206\u5f3e\u3092\u6483\u3064\u3068\u3001\n\u307e\u308f\u308a\u306e\u30d0\u30eb\u30fc\u30f3\u304c\u7206\u5f3e\u3068\u540c\u3058\u8272\u306b\u5909\u308f\u308a\u307e\u3059\u3002";
O["jp-jp"].TutorialTitle_7="\u304a\u52a9\u3051\u30a2\u30a4\u30c6\u30e0";O["jp-jp"].TutorialText_7="\u30d5\u30a1\u30a4\u30e4\u30fc\u30dc\u30fc\u30eb\u3092\u6483\u3064\u3068\u3001\n\u4e00\u5217\u3059\u3079\u3066\u306e\u30d0\u30d6\u30eb\u3092\u6d88\u3059\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002";O["jp-jp"].TutorialTitle_0="\u3042\u305d\u3073\u65b9";O["jp-jp"].TutorialText_4="\u307e\u308f\u308a\u306e\u30d0\u30eb\u30fc\u30f3\u3092\u6d88\u3057\u3066\u3001\n\u77f3\u3092\u53d6\u308a\u9664\u3044\u3066\u304f\u3060\u3055\u3044\u3002";
O["jp-jp"].TutorialTitle_4="\u304a\u90aa\u9b54\u30a2\u30a4\u30c6\u30e0";window.throbber=new ub("throbber","media/throbber.png");window.TG_StartScreenLogo=new ub("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");window.lvl_test=" 0 0 0 0 0   D   0 0 0 0 0 ;0 1 5 3 4 4     4 3 5 5 5  ; 1 5 5 1 1 1 | 5 3 3 5 2   ;2 5 2 5 2 1  |2 5 2 5 2 1  ;   5 5 5 0 1 | 5 5 5 5 5   ;R   2 3 5 5  |4 4 5 5 4    ;   1 1 1 1 1 | 3 3 3 3 2   ;2 2 2 2 2 2  |2 1 2 2 2 1  ;                             ;B B B B B r     e B B B B B".split(";");
var xc=new ua("StartTexture",2,"start");window.StartTexture=xc;va(xc,0,"media/StartTexture0.png");va(xc,1,"media/StartTexture1.png");var yc=new ua("StartScreenTexture",1,"load");window.StartScreenTexture=yc;va(yc,0,"media/StartScreenTexture0.png");var zc=new ua("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=zc;va(zc,0,"media/LevelMapScreenTexture0.png");var Ac=new ua("LevelEndTexture",2,"load");window.LevelEndTexture=Ac;va(Ac,0,"media/LevelEndTexture0.png");va(Ac,1,"media/LevelEndTexture1.png");
var P=new ua("MenuTexture",2,"load");window.MenuTexture=P;va(P,0,"media/MenuTexture0.png");va(P,1,"media/MenuTexture1.png");var Cc=new ua("GameTexture",2,"load");window.GameTexture=Cc;va(Cc,0,"media/GameTexture0.png");va(Cc,1,"media/GameTexture1.png");var Dc=new ua("GameStaticTexture",2,"load");window.GameStaticTexture=Dc;va(Dc,0,"media/GameStaticTexture0.png");va(Dc,1,"media/GameStaticTexture1.png");var Ec=new ua("TutorialTexture",1,"load");window.TutorialTexture=Ec;va(Ec,0,"media/TutorialTexture0.png");
var Fc=new ua("texture",1,"load");window.texture=Fc;va(Fc,0,"media/texture0.png");var Gc=new ua("FloaterTexture",1,"load");window.FloaterTexture=Gc;va(Gc,0,"media/FloaterTexture0.png");var Hc=new p("s_loadingbar_background",yc,1,42,32,0,0,42,32,1);window.s_loadingbar_background=Hc;Hc.c(0,0,937,1,42,32,0,0);var Ic=new p("s_level_0",zc,1,125,140,0,0,125,140,1);window.s_level_0=Ic;Ic.c(0,0,129,1,125,140,0,0);var Jc=new p("s_level_1",zc,1,125,140,0,0,125,140,1);window.s_level_1=Jc;
Jc.c(0,0,257,1,125,140,0,0);var Kc=new p("s_level_2",zc,1,125,140,0,0,125,140,1);window.s_level_2=Kc;Kc.c(0,0,1,1,125,140,0,0);var Lc=new p("s_level_3",zc,1,125,140,0,0,125,140,1);window.s_level_3=Lc;Lc.c(0,0,385,1,125,140,0,0);var Mc=new p("s_level_lock",zc,1,48,70,0,0,48,70,1);window.s_level_lock=Mc;Mc.c(0,0,777,113,48,69,0,1);var Nc=new p("s_level_stars",zc,1,126,46,0,0,126,46,1);window.s_level_stars=Nc;Nc.c(0,0,513,1,126,45,0,1);var Oc=new p("s_level2_0",zc,1,84,87,0,0,84,87,1);
window.s_level2_0=Oc;Oc.c(0,0,897,97,84,87,0,0);var Pc=new p("s_level2_1",zc,1,84,87,0,0,84,87,1);window.s_level2_1=Pc;Pc.c(0,0,897,1,84,87,0,0);var Qc=new p("s_level2_2",zc,1,84,87,0,0,84,87,1);window.s_level2_2=Qc;Qc.c(0,0,601,113,84,87,0,0);var Rc=new p("s_level2_3",zc,1,84,87,0,0,84,87,1);window.s_level2_3=Rc;Rc.c(0,0,513,49,84,87,0,0);var Sc=new p("s_level2_arrow_right",zc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=Sc;Sc.c(0,0,833,1,60,108,0,0);Sc.c(1,0,641,1,60,108,0,0);
var Tc=new p("s_level2_arrow_left",zc,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=Tc;Tc.c(0,0,705,1,60,108,0,0);Tc.c(1,0,769,1,60,108,0,0);var Uc=new p("s_level2_lock",zc,1,84,87,0,0,84,87,1);window.s_level2_lock=Uc;Uc.c(0,0,689,113,84,87,0,0);var Vc=new p("s_pop_medal",Ac,8,378,378,189,189,3024,378,8);window.s_pop_medal=Vc;Vc.c(0,0,569,1,349,241,3,69);Vc.c(1,0,569,529,346,267,5,54);Vc.c(2,0,569,249,348,276,20,56);Vc.c(3,1,1,1,342,288,26,50);Vc.c(4,1,689,1,319,292,22,46);
Vc.c(5,1,1,297,337,304,14,41);Vc.c(6,0,1,601,343,305,12,41);Vc.c(7,1,345,1,341,304,13,41);var Wc=new p("s_medal_shadow",Ac,1,195,208,0,0,195,208,1);window.s_medal_shadow=Wc;Wc.c(0,0,353,817,189,204,3,1);var Xc=new p("s_medal_shine",Ac,6,195,208,0,0,1170,208,6);window.s_medal_shine=Xc;Xc.c(0,1,545,513,193,207,1,1);Xc.c(1,1,345,313,193,207,1,1);Xc.c(2,0,353,601,193,207,1,1);Xc.c(3,1,689,297,193,207,1,1);Xc.c(4,0,553,801,193,207,1,1);Xc.c(5,0,753,801,193,207,1,1);
var Yc=new p("s_icon_toggle_hard",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Yc;Yc.c(0,0,945,193,67,67,0,0);var Zc=new p("s_icon_toggle_medium",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Zc;Zc.c(0,0,801,537,67,67,0,0);var $c=new p("s_icon_toggle_easy",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=$c;$c.c(0,0,937,265,67,67,0,0);var ad=new p("s_flagIcon_us",P,1,48,48,0,0,48,48,1);window.s_flagIcon_us=ad;ad.c(0,0,729,753,48,36,0,6);var bd=new p("s_flagIcon_gb",P,1,48,48,0,0,48,48,1);
window.s_flagIcon_gb=bd;bd.c(0,0,953,721,48,36,0,6);var cd=new p("s_flagIcon_nl",P,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=cd;cd.c(0,0,897,721,48,36,0,6);var dd=new p("s_flagIcon_tr",P,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=dd;dd.c(0,0,841,713,48,36,0,6);var ed=new p("s_flagIcon_de",P,1,48,48,0,0,48,48,1);window.s_flagIcon_de=ed;ed.c(0,0,785,753,48,36,0,6);var fd=new p("s_flagIcon_fr",P,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=fd;fd.c(0,0,841,753,48,36,0,6);
var gd=new p("s_flagIcon_br",P,1,48,48,0,0,48,48,1);window.s_flagIcon_br=gd;gd.c(0,0,57,793,48,36,0,6);var hd=new p("s_flagIcon_es",P,1,48,48,0,0,48,48,1);window.s_flagIcon_es=hd;hd.c(0,0,1,793,48,36,0,6);var id=new p("s_flagIcon_jp",P,1,48,48,0,0,48,48,1);window.s_flagIcon_jp=id;id.c(0,0,113,793,48,36,0,6);var jd=new p("s_flagIcon_ru",P,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=jd;jd.c(0,0,897,761,48,36,0,6);var kd=new p("s_flagIcon_ar",P,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=kd;
kd.c(0,0,673,761,48,36,0,6);var ld=new p("s_flagIcon_kr",P,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=ld;ld.c(0,0,785,713,48,36,0,6);var md=new p("s_flagIcon_it",P,1,48,48,0,0,48,48,1);window.s_flagIcon_it=md;md.c(0,0,953,761,48,36,0,6);var nd=new p("s_tutorialButton_close",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=nd;nd.c(0,0,929,609,65,65,0,0);var od=new p("s_tutorialButton_next",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=od;od.c(0,0,945,537,66,65,0,0);
var pd=new p("s_tutorialButton_previous",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=pd;pd.c(0,0,873,537,66,65,0,0);var qd=new p("s_logo_tinglygames",P,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=qd;qd.c(0,0,569,177,240,240,0,0);var rd=new p("s_logo_coolgames",P,1,240,240,0,0,240,240,1);window.s_logo_coolgames=rd;rd.c(0,0,569,1,240,167,0,36);var sd=new p("s_logo_tinglygames_start",yc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=sd;sd.c(0,0,625,1,156,53,0,0);
var td=new p("s_logo_coolgames_start",yc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=td;td.c(0,0,785,1,150,104,75,0);var ud=new p("s_ui_cup_highscore",Cc,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=ud;ud.c(0,0,913,729,32,28,0,0);var vd=new p("s_ui_cup_score",Cc,1,28,24,0,0,28,24,1);window.s_ui_cup_score=vd;vd.c(0,0,953,729,28,24,0,0);var wd=new p("s_ui_divider",Dc,1,94,2,0,0,94,2,1);window.s_ui_divider=wd;wd.c(0,0,857,49,94,2,0,0);
var xd=new p("s_ui_background_blank",Dc,1,140,580,0,0,140,580,1);window.s_ui_background_blank=xd;xd.c(0,0,585,1,140,580,0,0);var yd=new p("s_ui_highscore",Dc,1,26,36,13,12,26,36,1);window.s_ui_highscore=yd;yd.c(0,0,969,1,26,36,0,0);var zd=new p("s_ui_progressbar_background",Dc,1,120,190,60,60,120,190,1);window.s_ui_progressbar_background=zd;zd.c(0,0,729,49,120,190,0,0);var Ad=new p("s_ui_progressbar_frame",Cc,1,120,118,60,60,120,118,1);window.s_ui_progressbar_frame=Ad;Ad.c(0,0,353,281,120,118,0,0);
var Bd=new p("s_tutorial_07",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_07=Bd;Bd.c(0,0,705,1,92,92,129,49);var Cd=new p("s_tutorial_08",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_08=Cd;Cd.c(0,0,801,1,78,78,138,58);var Dd=new p("s_tutorial_01",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_01=Dd;Dd.c(0,0,353,385,350,190,0,0);var Ed=new p("s_tutorial_02",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_02=Ed;Ed.c(0,0,353,193,350,190,0,0);var Fd=new p("s_tutorial_03",Ec,1,350,190,0,0,350,190,1);
window.s_tutorial_03=Fd;Fd.c(0,0,1,193,350,190,0,0);var Gd=new p("s_tutorial_04",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_04=Gd;Gd.c(0,0,353,1,350,190,0,0);var Hd=new p("s_tutorial_05",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_05=Hd;Hd.c(0,0,1,1,350,190,0,0);var Id=new p("s_tutorial_06",Ec,1,350,190,0,0,350,190,1);window.s_tutorial_06=Id;Id.c(0,0,1,385,350,190,0,0);var Jd=new p("s_arrow_switch",Dc,1,234,42,6,11,234,42,1);window.s_arrow_switch=Jd;Jd.c(0,0,729,1,234,42,0,0);
var Kd=new p("s_booster_bomb",Cc,1,50,50,25,25,50,50,1);window.s_booster_bomb=Kd;Kd.c(0,0,817,593,50,50,0,0);var Ld=new p("s_booster_fire",Cc,6,50,50,25,25,300,50,6);window.s_booster_fire=Ld;Ld.c(0,0,873,625,50,50,0,0);Ld.c(1,0,929,625,50,50,0,0);Ld.c(2,0,761,593,50,50,0,0);Ld.c(3,0,705,593,50,50,0,0);Ld.c(4,0,897,569,50,50,0,0);Ld.c(5,0,953,569,50,50,0,0);var Md=new p("s_booster_fire_trail",Cc,11,48,48,24,24,528,48,11);window.s_booster_fire_trail=Md;Md.c(0,0,425,401,48,46,0,1);
Md.c(1,0,761,649,48,48,0,0);Md.c(2,0,977,425,46,46,0,1);Md.c(3,0,977,473,44,44,2,2);Md.c(4,0,873,681,42,42,3,3);Md.c(5,0,513,281,38,38,5,5);Md.c(6,0,513,321,36,36,6,6);Md.c(7,0,985,345,35,35,7,7);Md.c(8,0,985,385,34,34,7,7);Md.c(9,0,985,625,33,33,8,8);Md.c(10,0,993,225,30,30,9,9);var Nd=new p("s_booster_white",Cc,1,50,50,25,25,50,50,1);window.s_booster_white=Nd;Nd.c(0,0,705,649,50,50,0,0);var Od=new p("s_bubble_blocker",Cc,1,50,50,25,25,50,50,1);window.s_bubble_blocker=Od;
Od.c(0,0,353,473,50,50,0,0);var Pd=new p("s_cannon",Cc,1,66,132,33,99,66,132,1);window.s_cannon=Pd;Pd.c(0,0,481,281,23,90,22,1);var Qd=new p("s_cannon_counter",Cc,1,154,80,120,34,154,80,1);window.s_cannon_counter=Qd;Qd.c(0,0,905,265,113,77,41,0);var Rd=new p("s_explosion",Cc,7,64,64,32,32,448,64,7);window.s_explosion=Rd;Rd.c(0,0,833,529,55,56,3,3);Rd.c(1,0,353,401,64,63,0,1);Rd.c(2,0,905,425,64,64,0,0);Rd.c(3,0,425,449,64,64,0,0);Rd.c(4,0,905,497,64,64,0,0);Rd.c(5,0,921,193,64,64,0,0);
Rd.c(6,0,481,377,63,64,1,0);var Sd=new p("s_effect_star",Cc,1,47,46,23,24,47,46,1);window.s_effect_star=Sd;Sd.c(0,0,817,649,47,46,0,0);var Td=new p("s_guideline",Cc,1,7,260,0,0,7,260,1);window.s_guideline=Td;Td.c(0,0,905,1,7,259,0,1);var Ud=new p("s_guideline_pointer",Cc,1,21,21,10,10,21,21,1);window.s_guideline_pointer=Ud;Ud.c(0,0,497,505,21,21,0,0);var Vd=new p("s_pop",Cc,5,64,64,32,32,320,64,5);window.s_pop=Vd;Vd.c(0,0,993,193,30,24,19,19);Vd.c(1,0,977,521,42,35,13,14);
Vd.c(2,0,497,449,50,53,6,5);Vd.c(3,0,705,529,62,60,1,2);Vd.c(4,0,769,529,62,62,0,1);var Wd=new p("s_mistake",Cc,1,72,72,36,36,72,72,1);window.s_mistake=Wd;Wd.c(0,0,905,345,72,72,0,0);var Xd=new p("s_pop_floater",Cc,8,378,378,174,193,3024,378,8);window.s_pop_floater=Xd;Xd.c(0,0,553,1,349,241,3,69);Xd.c(1,0,1,281,346,267,5,54);Xd.c(2,0,553,249,348,276,20,56);Xd.c(3,0,1,553,342,288,26,50);Xd.c(4,1,689,1,319,292,22,46);Xd.c(5,1,345,1,337,304,14,41);Xd.c(6,0,353,529,343,305,12,41);
Xd.c(7,1,1,1,341,304,13,41);var Yd=new p("s_bubbles",Cc,6,42,42,21,21,252,42,6);window.s_bubbles=Yd;Yd.c(0,0,865,729,40,40,1,1);Yd.c(1,0,705,705,40,40,1,1);Yd.c(2,0,969,681,40,40,1,1);Yd.c(3,0,817,697,40,40,1,1);Yd.c(4,0,753,705,40,40,1,1);Yd.c(5,0,921,681,40,40,1,1);var Zd=new p("s_logo",yc,1,619,257,0,0,619,257,1);window.s_logo=Zd;Zd.c(0,0,1,1,619,257,0,0);var $d=new p("s_border",Cc,1,550,6,0,3,550,6,1);window.s_border=$d;$d.c(0,0,1,1,550,4,0,1);
var ae=new p("s_border_warning",Cc,1,550,40,0,20,550,40,1);window.s_border_warning=ae;ae.c(0,0,1,241,550,35,0,2);var be=new p("s_wall",Cc,1,550,230,0,198,550,230,1);window.s_wall=be;be.c(0,0,1,9,550,230,0,0);var ce=new p("s_cannon_container",Fc,1,40,40,20,20,40,40,1);window.s_cannon_container=ce;ce.c(0,0,449,1,40,40,0,0);var de=new p("s_ui_bubble_score",Fc,1,110,110,55,55,110,110,1);window.s_ui_bubble_score=de;de.c(0,0,225,1,110,110,0,0);
var ee=new p("s_ui_bubble_stage",Fc,1,110,110,55,55,110,110,1);window.s_ui_bubble_stage=ee;ee.c(0,0,1,1,110,110,0,0);var ge=new p("s_ui_bubble_highscore",Fc,1,110,110,55,55,110,110,1);window.s_ui_bubble_highscore=ge;ge.c(0,0,113,1,110,110,0,0);var he=new p("s_ui_bubble_restart",Fc,1,110,110,55,55,110,110,1);window.s_ui_bubble_restart=he;he.c(0,0,337,1,110,110,0,0);var ie=new p("s_background",Dc,2,576,640,0,0,1152,640,2);window.s_background=ie;ie.c(0,1,1,1,576,640,0,0);ie.c(1,0,1,1,576,640,0,0);
var je=new p("s_ui_background_bubbleshooter",Cc,1,140,592,0,0,140,592,1);window.s_ui_background_bubbleshooter=je;je.c(0,0,993,257,1,1,0,0);var le=new p("s_icon_toggle_sfx_on",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=le;le.c(0,0,729,713,49,31,7,17);var me=new p("s_icon_toggle_sfx_off",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=me;me.c(0,0,929,681,53,31,7,17);var ne=new p("s_icon_toggle_music_off",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=ne;ne.c(0,0,673,713,51,41,8,16);
var oe=new p("s_icon_toggle_music_on",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=oe;oe.c(0,0,985,1,38,41,13,16);var pe=new p("s_btn_big_restart",Ac,2,154,152,0,0,308,152,2);window.s_btn_big_restart=pe;pe.c(0,1,1,609,154,152,0,0);pe.c(1,1,345,529,154,152,0,0);var qe=new p("s_btn_big_start",Ac,2,154,152,0,0,308,152,2);window.s_btn_big_start=qe;qe.c(0,1,161,609,154,152,0,0);qe.c(1,1,745,513,154,152,0,0);var re=new p("s_btn_small_exit",P,2,100,92,0,0,200,92,2);window.s_btn_small_exit=re;
re.c(0,0,905,441,100,92,0,0);re.c(1,0,817,345,100,92,0,0);var se=new p("s_btn_small_options",P,2,100,92,0,0,200,92,2);window.s_btn_small_options=se;se.c(0,0,921,345,100,92,0,0);se.c(1,0,801,441,100,92,0,0);var te=new p("s_btn_small_pause",Cc,2,100,92,0,0,200,92,2);window.s_btn_small_pause=te;te.c(0,0,921,1,100,92,0,0);te.c(1,0,921,97,100,92,0,0);var ue=new p("s_btn_small_retry",Ac,2,100,92,0,0,200,92,2);window.s_btn_small_retry=ue;ue.c(0,0,921,97,100,92,0,0);ue.c(1,0,921,1,100,92,0,0);
var ve=new p("s_btn_standard",P,2,96,92,0,0,192,92,2);window.s_btn_standard=ve;ve.c(0,0,465,713,96,92,0,0);ve.c(1,0,569,713,96,92,0,0);var we=new p("s_btn_toggle",P,2,162,92,0,0,324,92,2);window.s_btn_toggle=we;we.c(0,0,817,97,162,92,0,0);we.c(1,0,817,1,162,92,0,0);var xe=new p("s_icon_toggle_fxoff",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=xe;xe.c(0,0,569,425,227,92,0,0);xe.c(1,0,465,617,227,92,0,0);var ye=new p("s_icon_toggle_fxon",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=ye;
ye.c(0,0,569,521,227,92,0,0);ye.c(1,0,1,601,227,92,0,0);var ze=new p("s_icon_toggle_musicoff",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicoff=ze;ze.c(0,0,233,601,227,92,0,0);ze.c(1,0,697,617,227,92,0,0);var Ae=new p("s_icon_toggle_musicon",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=Ae;Ae.c(0,0,1,697,227,92,0,0);Ae.c(1,0,233,697,227,92,0,0);var Be=new p("s_btn_bigtext",yc,2,137,104,0,0,274,104,2);window.s_btn_bigtext=Be;Be.c(0,0,625,57,137,104,0,0);Be.c(1,0,769,113,137,104,0,0);
var Ce=new p("s_overlay_options",P,1,574,614,0,0,574,614,1);window.s_overlay_options=Ce;Ce.c(0,0,1,1,560,597,7,3);var De=new p("s_overlay_assignment",Dc,1,540,214,0,0,540,214,1);window.s_overlay_assignment=De;De.c(0,0,1,649,540,214,0,0);var Ee=new p("s_tutorial",P,1,560,532,0,0,560,532,1);window.s_tutorial=Ee;Ee.c(0,1,1,1,560,532,0,0);var Fe=new p("s_overlay_endless",Ac,1,574,614,0,0,574,614,1);window.s_overlay_endless=Fe;Fe.c(0,0,1,1,560,597,7,9);
var Ge=new p("s_screen_start",xc,4,576,320,0,0,1152,640,2);window.s_screen_start=Ge;Ge.c(0,0,1,329,576,320,0,0);Ge.c(1,1,1,1,576,320,0,0);Ge.c(2,0,1,1,576,320,0,0);Ge.c(3,0,1,657,576,320,0,0);var He=new p("s_logo_preload_tinglygames",xc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=He;He.c(0,0,585,1,320,54,0,0);var Ie=new p("s_loadingbar_bg",xc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=Ie;Ie.c(0,0,913,1,38,20,0,0);var Je=new p("s_loadingbar_fill",xc,1,30,12,0,0,30,12,1);
window.s_loadingbar_fill=Je;Je.c(0,0,953,1,30,12,0,0);var Ke=new p("s_logo_about",P,1,121,121,0,0,121,121,1);window.s_logo_about=Ke;Ke.c(0,0,817,257,117,80,2,21);var Le=new p("s_logo_poki_about",P,1,123,58,0,0,123,58,1);window.s_logo_poki_about=Le;Le.c(0,0,817,193,123,58,0,0);var Me=new p("s_logo_poki_start",xc,1,120,60,0,0,120,60,1);window.s_logo_poki_start=Me;Me.c(0,0,793,57,119,59,1,1);var Ne=new p("s_ads_background",xc,1,200,200,100,100,200,200,1);window.s_ads_background=Ne;
Ne.c(0,0,585,57,200,200,0,0);var Oe=new xa("scoreFloater_neg");window.scoreFloater_neg=Oe;Oe.b=new p("scoreFloater_negImage",Gc,13,34,59,0,0);Oe.b.c(0,0,625,65,1,1,0,0,1,1,1);Oe.b.c(1,0,865,353,26,25,4,14,1,1,1);Oe.b.c(2,0,953,353,21,11,7,23,1,1,1);Oe.b.c(3,0,169,353,23,30,6,12,1,1,1);Oe.b.c(4,0,1001,281,22,30,7,12,1,1,1);Oe.b.c(5,0,889,321,24,30,6,12,1,1,1);Oe.b.c(6,0,857,321,23,30,6,12,1,1,1);Oe.b.c(7,0,825,321,25,30,5,12,1,1,1);Oe.b.c(8,0,921,321,23,30,6,12,1,1,1);
Oe.b.c(9,0,953,321,24,30,6,12,1,1,1);Oe.b.c(10,0,985,321,23,30,5,12,1,1,1);Oe.b.c(11,0,137,329,23,30,6,12,1,1,1);Oe.b.c(12,0,569,321,24,30,5,12,1,1,1);
Oe.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,2,-1,-1,3,4,5,6,7,8,9,10,11,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
Oe.left=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,12,9,12,12,8,8,8,8,8,8,8,8,8,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
Oe.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,18,10,16,10,10,18,18,18,18,18,18,18,18,18,18,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];Oe.top=8;Oe.height=43;Oe.sh=38;var Pe=new xa("scoreFloater_pos");window.scoreFloater_pos=Pe;Pe.b=new p("scoreFloater_posImage",Gc,13,34,59,0,0);Pe.b.c(0,0,65,65,1,1,0,0,1,1,1);Pe.b.c(1,0,897,353,26,25,4,14,1,1,1);
Pe.b.c(2,0,929,353,21,11,7,23,1,1,1);Pe.b.c(3,0,25,329,23,30,6,12,1,1,1);Pe.b.c(4,0,1,329,22,30,7,12,1,1,1);Pe.b.c(5,0,793,321,24,30,6,12,1,1,1);Pe.b.c(6,0,601,321,23,30,6,12,1,1,1);Pe.b.c(7,0,697,321,25,30,5,12,1,1,1);Pe.b.c(8,0,633,321,23,30,6,12,1,1,1);Pe.b.c(9,0,761,321,24,30,6,12,1,1,1);Pe.b.c(10,0,729,321,23,30,5,12,1,1,1);Pe.b.c(11,0,665,321,23,30,6,12,1,1,1);Pe.b.c(12,0,105,329,24,30,5,12,1,1,1);
Pe.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,2,-1,-1,3,4,5,6,7,8,9,10,11,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
Pe.left=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,8,12,9,12,12,8,8,8,8,8,8,8,8,8,8,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
Pe.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,18,10,16,10,10,18,18,18,18,18,18,18,18,18,18,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];Pe.top=8;Pe.height=43;Pe.sh=38;var Q=new xa("VerdanaFloater1");window.VerdanaFloater1=Q;Q.b=new p("VerdanaFloater1Image",Gc,59,44,46,0,0);Q.b.c(0,0,617,57,1,1,0,0,1,1,1);Q.b.c(1,0,681,353,17,30,12,11,1,1,1);
Q.b.c(2,0,529,321,31,30,4,11,1,1,1);Q.b.c(3,0,649,353,28,30,6,11,1,1,1);Q.b.c(4,0,801,353,28,30,6,11,1,1,1);Q.b.c(5,0,737,353,30,30,5,11,1,1,1);Q.b.c(6,0,265,353,25,30,7,11,1,1,1);Q.b.c(7,0,361,353,25,30,8,11,1,1,1);Q.b.c(8,0,705,353,29,30,5,11,1,1,1);Q.b.c(9,0,201,353,29,30,5,11,1,1,1);Q.b.c(10,0,553,353,23,30,9,11,1,1,1);Q.b.c(11,0,833,353,23,30,8,11,1,1,1);Q.b.c(12,0,393,353,29,30,6,11,1,1,1);Q.b.c(13,0,457,353,26,30,8,11,1,1,1);Q.b.c(14,0,249,321,32,30,4,11,1,1,1);
Q.b.c(15,0,521,353,29,30,5,11,1,1,1);Q.b.c(16,0,489,321,31,30,4,11,1,1,1);Q.b.c(17,0,425,353,27,30,7,11,1,1,1);Q.b.c(18,0,177,281,31,35,4,11,1,1,1);Q.b.c(19,0,297,353,30,30,6,11,1,1,1);Q.b.c(20,0,233,353,28,30,6,11,1,1,1);Q.b.c(21,0,489,353,29,30,5,11,1,1,1);Q.b.c(22,0,585,353,28,30,6,11,1,1,1);Q.b.c(23,0,289,321,31,30,4,11,1,1,1);Q.b.c(24,0,217,201,38,30,1,11,1,1,1);Q.b.c(25,0,361,321,31,30,4,11,1,1,1);Q.b.c(26,0,401,321,31,30,5,11,1,1,1);Q.b.c(27,0,769,353,28,30,6,11,1,1,1);
Q.b.c(28,0,1,209,31,37,4,4,1,1,1);Q.b.c(29,0,897,201,31,37,4,4,1,1,1);Q.b.c(30,0,625,241,31,36,4,5,1,1,1);Q.b.c(31,0,665,241,31,36,4,5,1,1,1);Q.b.c(32,0,249,281,31,35,4,6,1,1,1);Q.b.c(33,0,321,281,31,35,4,6,1,1,1);Q.b.c(34,0,457,201,37,30,0,11,1,1,1);Q.b.c(35,0,113,249,28,35,6,11,1,1,1);Q.b.c(36,0,425,201,25,37,7,4,1,1,1);Q.b.c(37,0,529,201,25,37,7,4,1,1,1);Q.b.c(38,0,497,201,25,37,7,4,1,1,1);Q.b.c(39,0,145,249,25,35,7,6,1,1,1);Q.b.c(40,0,393,201,23,37,9,4,1,1,1);
Q.b.c(41,0,297,201,23,37,9,4,1,1,1);Q.b.c(42,0,601,201,23,37,9,4,1,1,1);Q.b.c(43,0,457,273,23,35,9,6,1,1,1);Q.b.c(44,0,169,321,32,30,3,11,1,1,1);Q.b.c(45,0,705,241,29,36,5,5,1,1,1);Q.b.c(46,0,561,201,31,37,4,4,1,1,1);Q.b.c(47,0,817,201,31,37,4,4,1,1,1);Q.b.c(48,0,857,201,31,37,4,4,1,1,1);Q.b.c(49,0,801,241,31,36,4,5,1,1,1);Q.b.c(50,0,65,281,31,35,4,6,1,1,1);Q.b.c(51,0,65,321,31,33,4,10,1,1,1);Q.b.c(52,0,785,201,28,37,6,4,1,1,1);Q.b.c(53,0,753,201,28,37,6,4,1,1,1);
Q.b.c(54,0,721,201,28,37,6,4,1,1,1);Q.b.c(55,0,217,273,28,35,6,6,1,1,1);Q.b.c(56,0,681,201,31,37,5,4,1,1,1);Q.b.c(57,0,617,353,27,30,7,11,1,1,1);Q.b.c(58,0,329,321,27,31,7,10,1,1,1);
Q.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
Q.left=[18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,13,11,13,14,12,11,15,15,12,14,10,11,11,13,11,12,13,13,12,12,8,12,13,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,
18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,12,12,12,8,13,13,13,13,13,15,15,15,15,11,11,11,11,11,11,11,18,11,12,12,12,12,13,13,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18];
Q.width=[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,19,19,18,21,17,16,20,21,13,14,19,16,24,21,21,18,21,19,17,17,20,19,28,19,18,17,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,19,19,19,19,19,19,27,18,17,17,17,17,13,13,13,13,21,21,21,21,21,21,21,8,21,20,20,20,
20,18,18,18,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];Q.top=8;Q.height=30;Q.sh=33;var R=new xa("VerdanaFloater2");window.VerdanaFloater2=R;R.b=new p("VerdanaFloater2Image",Gc,59,45,48,0,0);R.b.c(0,0,617,65,1,1,0,0,1,1,1);R.b.c(1,0,1009,41,13,34,16,10,1,1,1);R.b.c(2,0,489,281,30,34,8,10,1,1,1);R.b.c(3,0,737,281,25,34,11,10,1,1,1);R.b.c(4,0,681,281,26,34,9,10,1,1,1);R.b.c(5,0,769,281,27,34,10,10,1,1,1);R.b.c(6,0,833,281,22,34,12,10,1,1,1);R.b.c(7,0,881,281,22,34,12,10,1,1,1);
R.b.c(8,0,937,281,28,34,8,10,1,1,1);R.b.c(9,0,905,281,25,34,10,10,1,1,1);R.b.c(10,0,857,281,19,34,13,10,1,1,1);R.b.c(11,0,713,281,21,34,12,10,1,1,1);R.b.c(12,0,425,281,27,34,11,10,1,1,1);R.b.c(13,0,1001,241,22,34,13,10,1,1,1);R.b.c(14,0,361,281,29,34,8,10,1,1,1);R.b.c(15,0,393,281,26,34,10,10,1,1,1);R.b.c(16,0,553,281,30,34,8,10,1,1,1);R.b.c(17,0,649,281,25,34,11,10,1,1,1);R.b.c(18,0,81,201,30,38,8,10,1,1,1);R.b.c(19,0,585,281,27,34,11,10,1,1,1);R.b.c(20,0,521,281,26,34,10,10,1,1,1);
R.b.c(21,0,617,281,25,34,10,10,1,1,1);R.b.c(22,0,801,281,27,34,9,10,1,1,1);R.b.c(23,0,217,313,29,34,8,10,1,1,1);R.b.c(24,0,257,201,38,34,4,10,1,1,1);R.b.c(25,0,1,289,29,34,8,10,1,1,1);R.b.c(26,0,969,281,29,34,8,10,1,1,1);R.b.c(27,0,105,289,25,34,10,10,1,1,1);R.b.c(28,0,769,105,30,41,8,3,1,1,1);R.b.c(29,0,457,105,30,41,8,3,1,1,1);R.b.c(30,0,481,57,30,44,8,0,1,1,1);R.b.c(31,0,225,153,30,40,8,4,1,1,1);R.b.c(32,0,193,153,30,40,8,4,1,1,1);R.b.c(33,0,161,153,30,40,8,4,1,1,1);
R.b.c(34,0,937,201,37,34,3,10,1,1,1);R.b.c(35,0,185,201,26,38,9,10,1,1,1);R.b.c(36,0,433,105,22,41,12,3,1,1,1);R.b.c(37,0,409,105,22,41,12,3,1,1,1);R.b.c(38,0,665,97,22,41,12,3,1,1,1);R.b.c(39,0,913,105,22,40,12,4,1,1,1);R.b.c(40,0,385,105,19,41,13,3,1,1,1);R.b.c(41,0,489,105,19,41,13,3,1,1,1);R.b.c(42,0,513,105,20,41,13,3,1,1,1);R.b.c(43,0,1001,105,19,40,13,4,1,1,1);R.b.c(44,0,33,289,29,34,8,10,1,1,1);R.b.c(45,0,937,105,26,40,10,4,1,1,1);R.b.c(46,0,569,105,30,41,8,3,1,1,1);
R.b.c(47,0,297,57,30,44,8,0,1,1,1);R.b.c(48,0,801,105,30,41,8,3,1,1,1);R.b.c(49,0,129,113,30,40,8,4,1,1,1);R.b.c(50,0,337,145,30,40,8,4,1,1,1);R.b.c(51,0,361,201,30,37,8,9,1,1,1);R.b.c(52,0,737,105,27,41,9,3,1,1,1);R.b.c(53,0,601,105,27,41,9,3,1,1,1);R.b.c(54,0,537,105,27,41,9,3,1,1,1);R.b.c(55,0,81,153,27,40,9,4,1,1,1);R.b.c(56,0,633,105,29,41,8,3,1,1,1);R.b.c(57,0,137,289,25,34,11,10,1,1,1);R.b.c(58,0,289,281,25,35,11,9,1,1,1);
R.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
R.left=[18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,11,13,13,11,11,15,15,12,14,9,11,11,12,11,12,13,13,11,12,7,12,12,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,
18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,12,12,12,12,12,12,7,12,13,13,13,13,15,15,15,15,11,11,11,11,11,11,11,18,11,11,11,11,11,12,12,13,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18];
R.width=[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,11,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,21,21,20,23,19,18,22,23,15,15,21,17,26,23,23,20,23,21,19,19,22,21,31,21,20,19,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,21,21,21,21,21,21,30,20,19,19,19,19,15,15,15,15,23,23,23,23,23,23,23,9,23,22,22,22,
22,20,20,19,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9];R.top=7;R.height=34;R.sh=35;var S=new xa("VerdanaFloater3");window.VerdanaFloater3=S;S.b=new p("VerdanaFloater3Image",Gc,60,48,51,0,0);S.b.c(0,0,625,57,1,1,0,0,1,1,1);S.b.c(1,0,1009,1,14,36,17,12,1,1,1);S.b.c(2,0,761,241,32,36,8,12,1,1,1);S.b.c(3,0,873,241,27,36,11,12,1,1,1);S.b.c(4,0,841,241,26,36,11,12,1,1,1);S.b.c(5,0,905,241,29,36,10,12,1,1,1);S.b.c(6,0,1,249,24,36,12,12,1,1,1);S.b.c(7,0,969,241,24,36,13,12,1,1,1);
S.b.c(8,0,937,241,29,36,9,12,1,1,1);S.b.c(9,0,33,249,28,36,10,12,1,1,1);S.b.c(10,0,737,241,22,36,14,12,1,1,1);S.b.c(11,0,641,153,21,36,12,12,1,1,1);S.b.c(12,0,249,241,29,36,11,12,1,1,1);S.b.c(13,0,281,241,24,36,13,12,1,1,1);S.b.c(14,0,73,241,31,36,8,12,1,1,1);S.b.c(15,0,113,209,28,36,10,12,1,1,1);S.b.c(16,0,457,233,30,36,9,12,1,1,1);S.b.c(17,0,217,233,27,36,12,12,1,1,1);S.b.c(18,0,297,153,30,39,9,12,1,1,1);S.b.c(19,0,41,209,29,36,11,12,1,1,1);S.b.c(20,0,185,241,27,36,11,12,1,1,1);
S.b.c(21,0,385,241,28,36,10,12,1,1,1);S.b.c(22,0,553,241,27,36,10,12,1,1,1);S.b.c(23,0,585,241,32,36,8,12,1,1,1);S.b.c(24,0,337,105,41,36,4,12,1,1,1);S.b.c(25,0,313,241,32,36,8,12,1,1,1);S.b.c(26,0,489,241,30,36,10,12,1,1,1);S.b.c(27,0,521,241,27,36,10,12,1,1,1);S.b.c(28,0,513,57,32,44,8,4,1,1,1);S.b.c(29,0,409,57,32,44,8,4,1,1,1);S.b.c(30,0,809,1,32,48,8,0,1,1,1);S.b.c(31,0,1,65,32,43,8,5,1,1,1);S.b.c(32,0,257,105,32,42,8,6,1,1,1);S.b.c(33,0,297,105,32,42,8,6,1,1,1);
S.b.c(34,0,81,113,40,36,3,12,1,1,1);S.b.c(35,0,489,153,26,39,11,12,1,1,1);S.b.c(36,0,553,57,24,44,12,4,1,1,1);S.b.c(37,0,449,57,24,44,12,4,1,1,1);S.b.c(38,0,353,57,24,44,12,4,1,1,1);S.b.c(39,0,161,105,24,42,12,6,1,1,1);S.b.c(40,0,665,49,22,44,14,4,1,1,1);S.b.c(41,0,329,57,22,44,14,4,1,1,1);S.b.c(42,0,385,57,22,44,14,4,1,1,1);S.b.c(43,0,41,65,22,42,14,6,1,1,1);S.b.c(44,0,417,241,31,36,8,12,1,1,1);S.b.c(45,0,945,57,28,43,10,5,1,1,1);S.b.c(46,0,585,57,30,44,9,4,1,1,1);
S.b.c(47,0,633,49,30,48,9,0,1,1,1);S.b.c(48,0,833,57,30,44,9,4,1,1,1);S.b.c(49,0,977,57,30,43,9,5,1,1,1);S.b.c(50,0,225,105,30,42,9,6,1,1,1);S.b.c(51,0,457,313,27,32,11,15,1,1,1);S.b.c(52,0,969,105,30,40,9,10,1,1,1);S.b.c(53,0,737,57,27,44,10,4,1,1,1);S.b.c(54,0,865,57,27,44,10,4,1,1,1);S.b.c(55,0,769,57,27,44,10,4,1,1,1);S.b.c(56,0,193,105,27,42,10,6,1,1,1);S.b.c(57,0,801,57,30,44,10,4,1,1,1);S.b.c(58,0,353,241,27,36,12,12,1,1,1);S.b.c(59,0,977,201,26,37,12,11,1,1,1);
S.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
S.left=[19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,12,12,13,11,13,14,11,11,16,15,12,14,9,11,11,13,11,12,13,13,11,12,7,12,13,13,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,
19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,12,12,12,12,12,12,7,13,13,13,13,13,16,16,16,16,11,11,11,11,11,11,11,11,11,11,11,11,11,13,13,13,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19];
S.width=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,12,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,24,23,22,25,21,20,25,25,16,17,23,19,29,26,26,22,26,24,22,21,25,23,34,23,22,21,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,24,24,24,24,24,24,33,22,21,21,21,21,16,16,16,16,25,26,26,26,26,26,26,26,26,25,25,25,25,22,22,22,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];S.top=7;S.height=37;S.sh=38;var T=new xa("VerdanaFloater4");window.VerdanaFloater4=T;T.b=new p("VerdanaFloater4Image",Gc,59,58,61,0,0);T.b.c(0,0,73,65,1,1,0,0,1,1,1);T.b.c(1,0,665,145,21,39,19,16,1,1,1);
T.b.c(2,0,561,153,36,39,9,16,1,1,1);T.b.c(3,0,521,153,33,39,12,16,1,1,1);T.b.c(4,0,873,105,34,40,14,15,1,1,1);T.b.c(5,0,369,153,36,39,11,16,1,1,1);T.b.c(6,0,449,153,33,39,14,16,1,1,1);T.b.c(7,0,409,153,32,39,14,16,1,1,1);T.b.c(8,0,257,153,35,40,12,15,1,1,1);T.b.c(9,0,601,153,38,39,11,16,1,1,1);T.b.c(10,0,329,193,30,39,14,16,1,1,1);T.b.c(11,0,41,161,31,39,13,16,1,1,1);T.b.c(12,0,145,201,38,39,12,16,1,1,1);T.b.c(13,0,113,161,28,39,15,16,1,1,1);T.b.c(14,0,897,57,43,39,9,16,1,1,1);
T.b.c(15,0,641,193,38,39,11,16,1,1,1);T.b.c(16,0,1,113,36,40,12,15,1,1,1);T.b.c(17,0,969,153,34,39,13,16,1,1,1);T.b.c(18,0,257,57,36,46,12,15,1,1,1);T.b.c(19,0,889,153,34,39,12,16,1,1,1);T.b.c(20,0,41,113,35,40,12,15,1,1,1);T.b.c(21,0,769,153,33,39,16,16,1,1,1);T.b.c(22,0,729,153,35,39,13,16,1,1,1);T.b.c(23,0,849,153,35,39,15,16,1,1,1);T.b.c(24,0,161,57,47,39,10,16,1,1,1);T.b.c(25,0,689,105,41,39,9,16,1,1,1);T.b.c(26,0,929,153,34,39,16,16,1,1,1);T.b.c(27,0,809,153,36,39,12,16,1,1,1);
T.b.c(28,0,553,1,36,50,9,5,1,1,1);T.b.c(29,0,593,1,36,50,9,5,1,1,1);T.b.c(30,0,41,1,36,55,9,0,1,1,1);T.b.c(31,0,689,1,37,49,9,6,1,1,1);T.b.c(32,0,849,1,36,48,9,7,1,1,1);T.b.c(33,0,121,57,36,47,9,8,1,1,1);T.b.c(34,0,633,1,50,39,3,16,1,1,1);T.b.c(35,0,217,57,34,46,14,15,1,1,1);T.b.c(36,0,313,1,33,50,14,5,1,1,1);T.b.c(37,0,241,1,33,50,14,5,1,1,1);T.b.c(38,0,353,1,33,50,14,5,1,1,1);T.b.c(39,0,969,1,33,48,14,7,1,1,1);T.b.c(40,0,281,1,30,50,14,5,1,1,1);T.b.c(41,0,201,1,31,50,14,5,1,1,1);
T.b.c(42,0,161,1,31,50,14,5,1,1,1);T.b.c(43,0,929,1,31,48,14,7,1,1,1);T.b.c(44,0,689,153,36,39,11,16,1,1,1);T.b.c(45,0,729,1,38,49,11,6,1,1,1);T.b.c(46,0,81,1,36,50,12,5,1,1,1);T.b.c(47,0,1,1,36,55,12,0,1,1,1);T.b.c(48,0,433,1,36,50,12,5,1,1,1);T.b.c(49,0,769,1,36,49,12,6,1,1,1);T.b.c(50,0,889,1,36,48,12,7,1,1,1);T.b.c(51,0,689,57,41,44,9,13,1,1,1);T.b.c(52,0,473,1,35,50,13,5,1,1,1);T.b.c(53,0,393,1,35,50,13,5,1,1,1);T.b.c(54,0,513,1,35,50,13,5,1,1,1);T.b.c(55,0,81,57,35,48,13,7,1,1,1);
T.b.c(56,0,121,1,34,50,16,5,1,1,1);T.b.c(57,0,1,161,33,39,13,16,1,1,1);T.b.c(58,0,833,105,32,41,13,14,1,1,1);
T.index=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,-1,51,52,53,54,55,56,57,58,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
T.left=[23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,15,15,16,14,17,17,14,14,19,19,15,18,12,14,14,16,14,15,16,17,14,15,9,15,16,17,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,
23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,15,15,15,15,15,15,9,16,17,17,17,17,19,19,19,19,14,14,14,14,14,14,14,23,14,14,14,14,14,16,16,16,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23];
T.width=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,27,27,26,29,24,23,29,30,19,19,27,22,34,30,30,26,30,28,25,24,29,27,40,27,26,24,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,27,27,27,27,27,27,39,26,24,24,24,24,19,19,19,19,29,30,30,30,30,30,30,12,30,29,29,29,29,26,26,25,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];T.top=9;T.height=43;T.sh=45;var Qe=new Aa("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=Qe;var V=new Da("f_default","Arial");window.f_default=V;A(V,12);Fa(V);V.setFillColor("Black");
Ga(V,1);Ia(V,!1);V.setStrokeColor("Black");Ka(V,1);Ma(V,"miter");Ja(V,1);La(V,!1);D(V,"left");E(V,"top");Pa(V);Qa(V);var Re=new Aa("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=Re;var Se=new Aa("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=Se;var Te=new Aa("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");
window.floaterFontFaceLoader=Te;var Ue=new Aa("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Ue;var Ve=new Da("floaterFontFace","Arial");window.floaterFontText1=Ve;A(Ve,24);Ea(Ve,"normal");Fa(Ve);Ve.setFillColor("#FFDE00");Ga(Ve,1);Ia(Ve,!0);Ve.setStrokeColor("#6F1F00");Ka(Ve,4);Ma(Ve,"miter");Ja(Ve,1);La(Ve,!0);Na(Ve,!0,"rgba(57,0,0,0.46)",0,4,2);D(Ve,"left");E(Ve,"top");Pa(Ve);Qa(Ve);
var We=new Da("floaterFontFace","Arial");window.floaterFontText2=We;A(We,28);Ea(We,"normal");Fa(We);Ha(We,2,["#FFF600","#00DB48","blue"],.65,.02);Ga(We,1);Ia(We,!0);We.setStrokeColor("#073400");Ka(We,4);Ma(We,"miter");Ja(We,1);La(We,!0);Na(We,!0,"rgba(0,57,43,0.47)",0,4,2);D(We,"left");E(We,"top");Pa(We);Qa(We);var Xe=new Da("floaterFontFace","Arial");window.floaterFontText3=Xe;A(Xe,30);Ea(Xe,"normal");Fa(Xe);Ha(Xe,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Ga(Xe,1);Ia(Xe,!0);Xe.setStrokeColor("#4F0027");
Ka(Xe,4);Ma(Xe,"miter");Ja(Xe,1);La(Xe,!0);Na(Xe,!0,"rgba(41,0,0,0.48)",0,5,2);D(Xe,"left");E(Xe,"top");Pa(Xe);Qa(Xe);var Ye=new Da("floaterFontFace","Arial");window.floaterFontText4=Ye;A(Ye,34);Ea(Ye,"normal");Fa(Ye);Ha(Ye,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Ga(Ye,1);Ia(Ye,!0);Ye.setStrokeColor("#001637");Ka(Ye,4);Ma(Ye,"miter");Ja(Ye,1);La(Ye,!0);Na(Ye,!0,"rgba(0,35,75,0.49)",0,6,2);D(Ye,"left");E(Ye,"top");Pa(Ye);Qa(Ye);var Ze=new Da("floaterNumberFontFace","Arial");
window.floaterFontNumberPositive=Ze;A(Ze,30);Fa(Ze);Ze.setFillColor("White");Ga(Ze,1);Ia(Ze,!0);Ze.setStrokeColor("#00106F");Ka(Ze,2);Ma(Ze,"miter");Ja(Ze,1);La(Ze,!1);Na(Ze,!0,"rgba(0,4,57,0.51)",0,4,2);D(Ze,"left");E(Ze,"top");Pa(Ze);Qa(Ze);var $e=new Da("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=$e;A($e,30);Ea($e,"normal");Fa($e);$e.setFillColor("#FF1E00");Ga($e,1);Ia($e,!0);$e.setStrokeColor("#3F0000");Ka($e,2);Ma($e,"miter");Ja($e,1);La($e,!1);
Na($e,!0,"rgba(57,0,0,0.49)",0,4,2);D($e,"left");E($e,"top");Pa($e);Qa($e);var af=new Da("ff_opensans_bold","Arial");window.f_game_ui_tiny=af;A(af,11);Fa(af);af.setFillColor("#799EC5");Ga(af,1);Ia(af,!1);af.setStrokeColor("White");Ka(af,1);Ma(af,"miter");Ja(af,1);La(af,!1);D(af,"center");E(af,"middle");Pa(af);Qa(af);var bf=new Da("ff_opensans_bolditalic","Arial");window.f_game_ui_large=bf;A(bf,52);Fa(bf);bf.setFillColor("#172348");Ga(bf,1);Ia(bf,!1);bf.setStrokeColor("Black");Ka(bf,1);Ma(bf,"miter");
Ja(bf,1);La(bf,!1);D(bf,"center");E(bf,"middle");Pa(bf);Qa(bf);var cf=new Aa("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=cf;var df=new Aa("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=df;var ef=new Da("f_themeDefault","Arial");window.f_announcement=ef;A(ef,50);Fa(ef);ef.setFillColor("White");Ga(ef,1);Ia(ef,!0);ef.setStrokeColor("#2C2C2C");
Ka(ef,6);Ma(ef,"miter");Ja(ef,1);La(ef,!0);Na(ef,!0,"rgba(0,0,0,0.53)",0,5,2);D(ef,"center");E(ef,"top");Pa(ef);Qa(ef);var ff=new Da("ff_opensans_bold","Arial");window.f_bubble_points=ff;A(ff,30);Fa(ff);Ha(ff,2,["White","#DFDFDF","blue"],.6,0);Ga(ff,1);Ia(ff,!0);ff.setStrokeColor("#454545");Ka(ff,6);Ma(ff,"round");Ja(ff,1);La(ff,!0);D(ff,"left");E(ff,"top");Pa(ff);Qa(ff);var W=new Da("ff_opensans_bold","Arial");window.f_bubbles_left=W;A(W,30);Fa(W);W.setFillColor("#4E4E4E");Ga(W,1);Ia(W,!1);W.setStrokeColor("Black");
Ka(W,1);Ma(W,"miter");Ja(W,1);La(W,!1);D(W,"center");E(W,"middle");Pa(W);Qa(W);var gf=new Da("ff_opensans_bold","Arial");window.f_special_points=gf;A(gf,40);Fa(gf);Ha(gf,2,["Yellow","#FF8040","Red"],.6,0);Ga(gf,1);Ia(gf,!0);gf.setStrokeColor("#454545");Ka(gf,6);Ma(gf,"round");Ja(gf,1);La(gf,!0);D(gf,"left");E(gf,"top");Pa(gf);Qa(gf);var hf=new Da("ff_opensans_bold","Arial");window.f_switch=hf;A(hf,16);Fa(hf);hf.setFillColor("#818181");Ga(hf,1);Ia(hf,!1);hf.setStrokeColor("#454545");Ka(hf,1);
Ma(hf,"miter");Ja(hf,1);La(hf,!1);D(hf,"left");E(hf,"top");Pa(hf);Qa(hf);var jf=new Da("ff_opensans_bolditalic","Arial");window.f_nice=jf;A(jf,70);Ea(jf,"normal");Fa(jf);Ha(jf,2,["#FFF600","#00DB48","blue"],.65,.02);Ga(jf,1);Ia(jf,!0);jf.setStrokeColor("#073400");Ka(jf,7);Ma(jf,"round");Ja(jf,1);La(jf,!0);Na(jf,!0,"rgba(0,57,43,0.47)",0,4,2);D(jf,"left");E(jf,"top");Pa(jf);Qa(jf);var kf=new Da("ff_opensans_bolditalic","Arial");window.f_great=kf;A(kf,75);Ea(kf,"normal");Fa(kf);
Ha(kf,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Ga(kf,1);Ia(kf,!0);kf.setStrokeColor("#4F0027");Ka(kf,7);Ma(kf,"round");Ja(kf,1);La(kf,!0);Na(kf,!0,"rgba(41,0,0,0.48)",0,5,2);D(kf,"left");E(kf,"top");Pa(kf);Qa(kf);var lf=new Da("ff_opensans_bolditalic","Arial");window.f_awesome=lf;A(lf,90);Ea(lf,"normal");Fa(lf);Ha(lf,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Ga(lf,1);Ia(lf,!0);lf.setStrokeColor("#001637");Ka(lf,8);Ma(lf,"round");Ja(lf,1);La(lf,!0);Na(lf,!0,"rgba(0,35,75,0.49)",0,6,2);D(lf,"left");
E(lf,"top");Pa(lf);Qa(lf);var mf=new Da("ff_opensans_bold","Arial");window.f_game_ui=mf;A(mf,12);Fa(mf);mf.setFillColor("Black");Ga(mf,1);Ia(mf,!1);mf.setStrokeColor("Black");Ka(mf,1);Ma(mf,"miter");Ja(mf,1);La(mf,!1);D(mf,"left");E(mf,"top");Pa(mf);Qa(mf);var nf=new Aa("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");window.f_themeDefaultLoader=nf;var of=new Da("f_themeDefault","Arial");window.f_themeDefault=of;A(of,40);Fa(of);of.setFillColor("Black");Ga(of,1);
Ia(of,!1);of.setStrokeColor("White");Ka(of,5);Ma(of,"miter");Ja(of,1);La(of,!0);D(of,"left");E(of,"top");Pa(of);Qa(of);var pf=new Da("Arial","Arial");window.f_tap_to_play=pf;A(pf,28);Ea(pf,"bold");Fa(pf);pf.setFillColor("#1b2b34");Ga(pf,1);Ia(pf,!1);pf.setStrokeColor("Black");Ka(pf,28);Ma(pf,"round");Ja(pf,.55);La(pf,!1);D(pf,"center");E(pf,"middle");Pa(pf);Qa(pf);var qf=new Da("Arial","Arial");window.f_adblocker=qf;A(qf,28);Ea(qf,"normal");Fa(qf);qf.setFillColor("White");Ga(qf,1);Ia(qf,!1);qf.setStrokeColor("Black");
Ka(qf,28);Ma(qf,"round");Ja(qf,.55);La(qf,!1);D(qf,"center");E(qf,"middle");Pa(qf);Qa(qf);var rf=new Da("Arial","Arial");window.f_copyright=rf;A(rf,22);Ea(rf,"bold");Fa(rf);rf.setFillColor("#1b2b34");Ga(rf,1);Ia(rf,!1);rf.setStrokeColor("Black");Ka(rf,28);Ma(rf,"round");Ja(rf,.55);La(rf,!1);D(rf,"left");E(rf,"middle");Pa(rf);Qa(rf);var sf=new Da("Arial","Arial");window.f_thankyou=sf;A(sf,50);Ea(sf,"bold");Fa(sf);sf.setFillColor("#1b2b34");Ga(sf,1);Ia(sf,!1);sf.setStrokeColor("Black");Ka(sf,28);
Ma(sf,"round");Ja(sf,.55);La(sf,!1);D(sf,"center");E(sf,"middle");Pa(sf);Qa(sf);var tf=new Da("Arial","Arial");window.f_loading_game=tf;A(tf,20);Ea(tf,"bold");Fa(tf);tf.setFillColor("#1b2b34");Ga(tf,1);Ia(tf,!1);tf.setStrokeColor("Black");Ka(tf,28);Ma(tf,"round");Ja(tf,.55);La(tf,!1);D(tf,"left");E(tf,"middle");Pa(tf);Qa(tf);var uf=new Da("Arial","Arial");window.f_interstitial=uf;A(uf,20);Ea(uf,"bold");Fa(uf);uf.setFillColor("#1b2b34");Ga(uf,.38);Ia(uf,!1);uf.setStrokeColor("Black");Ka(uf,28);
Ma(uf,"round");Ja(uf,.55);La(uf,!1);D(uf,"center");E(uf,"middle");Pa(uf);Qa(uf);var X=new tb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=X;var vf=new G("a_bigPop",X,0,1328,1,10,["game"]);window.a_bigPop=vf;var wf=new G("a_bomb",X,3E3,1247,1,10,["game"]);window.a_bomb=wf;var xf=new G("a_colorBomb",X,6E3,871,1,10,["game"]);window.a_colorBomb=xf;var yf=new G("a_combo_01",X,8E3,598,1,10,["game"]);window.a_combo_01=yf;
var zf=new G("a_combo_02",X,1E4,678,1,10,["game"]);window.a_combo_02=zf;var Af=new G("a_combo_03",X,12E3,730,1,10,["game"]);window.a_combo_03=Af;var Bf=new G("a_combo_04",X,14E3,1225,1,10,["game"]);window.a_combo_04=Bf;var Cf=new G("a_fireBallNext",X,17E3,1107,1,10,["game"]);window.a_fireBallNext=Cf;var Df=new G("a_fireBallShoot",X,2E4,968,1,10,["game"]);window.a_fireBallShoot=Df;var Ef=new G("a_glassNext",X,22E3,519,1,10,["game"]);window.a_glassNext=Ef;var Ff=new G("a_hit",X,24E3,54,1,10,["game"]);
window.a_hit=Ff;var Gf=new G("a_pop_01",X,26E3,145,1,10,["game"]);window.a_pop_01=Gf;var Hf=new G("a_pop_02",X,28E3,140,1,10,["game"]);window.a_pop_02=Hf;var If=new G("a_pop_03",X,3E4,164,1,10,["game"]);window.a_pop_03=If;var Jf=new G("a_pop_04",X,32E3,163,1,10,["game"]);window.a_pop_04=Jf;var Kf=new G("a_pop_05",X,34E3,149,1,10,["game"]);window.a_pop_05=Kf;var Lf=new G("a_pop_06",X,36E3,103,1,10,["game"]);window.a_pop_06=Lf;var Mf=new G("a_shoot",X,38E3,198,1,10,["game"]);window.a_shoot=Mf;
var Nf=new G("a_swap",X,4E4,285,.5,10,["game"]);window.a_swap=Nf;var Of=new G("a_floater_popup",X,42E3,306,1,10,["game"]);window.a_floater_popup=Of;var Pf=new G("a_levelStart",X,44E3,1002,1,10,["sfx"]);window.a_levelStart=Pf;var Qf=new G("a_levelComplete",X,47E3,1002,1,10,["sfx"]);window.a_levelComplete=Qf;var Rf=new G("a_mouseDown",X,5E4,471,1,10,["sfx"]);window.a_mouseDown=Rf;var Sf=new G("a_levelend_star_01",X,52E3,1161,1,10,["sfx"]);window.a_levelend_star_01=Sf;
var Tf=new G("a_levelend_star_02",X,55E3,1070,1,10,["sfx"]);window.a_levelend_star_02=Tf;var Uf=new G("a_levelend_star_03",X,58E3,1039,1,10,["sfx"]);window.a_levelend_star_03=Uf;var Wf=new G("a_levelend_fail",X,61E3,1572,1,10,["sfx"]);window.a_levelend_fail=Wf;var Xf=new G("a_levelend_score_counter",X,64E3,54,1,10,["sfx"]);window.a_levelend_score_counter=Xf;var Yf=new G("a_levelend_score_end",X,66E3,888,1,10,["sfx"]);window.a_levelend_score_end=Yf;var Zf=new G("a_medal",X,68E3,1225,1,10,["sfx"]);
window.a_medal=Zf;O=O||{};O["nl-nl"]=O["nl-nl"]||{};O["nl-nl"].loadingScreenLoading="Laden...";O["nl-nl"].startScreenPlay="SPELEN";O["nl-nl"].levelMapScreenTotalScore="Totale score";O["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";O["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";O["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";O["nl-nl"].levelEndScreenTotalScore="Totale score";O["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";O["nl-nl"].levelEndScreenTimeLeft="Tijd over";
O["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";O["nl-nl"].levelEndScreenHighScore="High score";O["nl-nl"].optionsStartScreen="Hoofdmenu";O["nl-nl"].optionsQuit="Stop";O["nl-nl"].optionsResume="Terug naar spel";O["nl-nl"].optionsTutorial="Speluitleg";O["nl-nl"].optionsHighScore="High scores";O["nl-nl"].optionsMoreGames="Meer Spellen";O["nl-nl"].optionsDifficulty_easy="Makkelijk";O["nl-nl"].optionsDifficulty_medium="Gemiddeld";O["nl-nl"].optionsDifficulty_hard="Moeilijk";
O["nl-nl"].optionsMusic_on="Aan";O["nl-nl"].optionsMusic_off="Uit";O["nl-nl"].optionsSFX_on="Aan";O["nl-nl"].optionsSFX_off="Uit";O["nl-nl"]["optionsLang_en-us"]="Engels (US)";O["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";O["nl-nl"]["optionsLang_nl-nl"]="Nederlands";O["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";O["nl-nl"].gameEndScreenBtnText="Ga verder";O["nl-nl"].optionsTitle="Instellingen";O["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";
O["nl-nl"].optionsQuitConfirmBtn_No="Nee";O["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";O["nl-nl"].levelMapScreenTitle="Kies een level";O["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";O["nl-nl"].optionsRestart="Herstart";O["nl-nl"].optionsSFXBig_on="Geluid aan";O["nl-nl"].optionsSFXBig_off="Geluid uit";O["nl-nl"].optionsAbout_title="Over ons";O["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2020";
O["nl-nl"].optionsAbout_backBtn="Terug";O["nl-nl"].optionsAbout_version="versie:";O["nl-nl"].optionsAbout="Over ons";O["nl-nl"].levelEndScreenMedal="VERBETERD!";O["nl-nl"].startScreenQuestionaire="Wat vind jij?";O["nl-nl"].levelMapScreenWorld_0="Kies een level";O["nl-nl"].startScreenByTinglyGames="door: CoolGames";O["nl-nl"]["optionsLang_de-de"]="Duits";O["nl-nl"]["optionsLang_tr-tr"]="Turks";O["nl-nl"].optionsAbout_header="Ontwikkeld door:";O["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";
O["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";O["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";O["nl-nl"].challengeStartTextScore="Punten van <NAME>:";O["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";O["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";O["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";O["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";
O["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";O["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";O["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";O["nl-nl"].challengeCancelConfirmBtn_yes="Ja";O["nl-nl"].challengeCancelConfirmBtn_no="Nee";O["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";
O["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";O["nl-nl"].challengeEndScreenName_you="Jij";O["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";O["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";O["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";
O["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";O["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";O["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";O["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";O["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";
O["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";O["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";O["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";O["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";O["nl-nl"].challengeForfeitConfirmBtn_no="Nee";O["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";
O["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";O["nl-nl"].optionsChallengeForfeit="Geef op";O["nl-nl"].optionsChallengeCancel="Stop";O["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";O["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";O["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";
O["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";O["nl-nl"]["optionsLang_fr-fr"]="Frans";O["nl-nl"]["optionsLang_ko-kr"]="Koreaans";O["nl-nl"]["optionsLang_ar-eg"]="Arabisch";O["nl-nl"]["optionsLang_es-es"]="Spaans";O["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";O["nl-nl"]["optionsLang_ru-ru"]="Russisch";O["nl-nl"].optionsExit="Stoppen";O["nl-nl"].levelEndScreenTotalScore_number="Totale score:";O["nl-nl"].levelEndScreenHighScore_number="Topscore:";
O["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";O["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";O["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";
O["nl-nl"].optionsAbout_header_publisher="Published by:";O["nl-nl"]["optionsLang_jp-jp"]="Japans";O["nl-nl"]["optionsLang_it-it"]="Italiaans";O["en-us"]=O["en-us"]||{};O["en-us"].loadingScreenLoading="Loading...";O["en-us"].startScreenPlay="PLAY";O["en-us"].levelMapScreenTotalScore="Total score";O["en-us"].levelEndScreenTitle_level="Level <VALUE>";O["en-us"].levelEndScreenTitle_difficulty="Well done!";O["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";O["en-us"].levelEndScreenTotalScore="Total score";
O["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";O["en-us"].levelEndScreenTimeLeft="Time remaining";O["en-us"].levelEndScreenTimeBonus="Time bonus";O["en-us"].levelEndScreenHighScore="High score";O["en-us"].optionsStartScreen="Main menu";O["en-us"].optionsQuit="Quit";O["en-us"].optionsResume="Resume";O["en-us"].optionsTutorial="How to play";O["en-us"].optionsHighScore="High scores";O["en-us"].optionsMoreGames="More Games";O["en-us"].optionsDifficulty_easy="Easy";
O["en-us"].optionsDifficulty_medium="Medium";O["en-us"].optionsDifficulty_hard="Difficult";O["en-us"].optionsMusic_on="On";O["en-us"].optionsMusic_off="Off";O["en-us"].optionsSFX_on="On";O["en-us"].optionsSFX_off="Off";O["en-us"]["optionsLang_en-us"]="English (US)";O["en-us"]["optionsLang_en-gb"]="English (GB)";O["en-us"]["optionsLang_nl-nl"]="Dutch";O["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";O["en-us"].gameEndScreenBtnText="Continue";O["en-us"].optionsTitle="Settings";
O["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";O["en-us"].optionsQuitConfirmBtn_No="No";O["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";O["en-us"].levelMapScreenTitle="Select a level";O["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";O["en-us"].optionsRestart="Restart";
O["en-us"].optionsSFXBig_on="Sound on";O["en-us"].optionsSFXBig_off="Sound off";O["en-us"].optionsAbout_title="About";O["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["en-us"].optionsAbout_backBtn="Back";O["en-us"].optionsAbout_version="version:";O["en-us"].optionsAbout="About";O["en-us"].levelEndScreenMedal="IMPROVED!";O["en-us"].startScreenQuestionaire="What do you think?";O["en-us"].levelMapScreenWorld_0="Select a level";O["en-us"].startScreenByTinglyGames="by: CoolGames";
O["en-us"]["optionsLang_de-de"]="German";O["en-us"]["optionsLang_tr-tr"]="Turkish";O["en-us"].optionsAbout_header="Developed by:";O["en-us"].levelEndScreenViewHighscoreBtn="View scores";O["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";O["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["en-us"].challengeStartTextScore="<NAME>'s score:";O["en-us"].challengeStartTextTime="<NAME>'s time:";O["en-us"].challengeStartScreenToWin="Amount to win:";
O["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["en-us"].challengeCancelConfirmBtn_yes="Yes";O["en-us"].challengeCancelConfirmBtn_no="No";O["en-us"].challengeEndScreensBtn_submit="Submit challenge";O["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";O["en-us"].challengeEndScreenName_you="You";O["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
O["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";O["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";
O["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";O["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";O["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["en-us"].challengeForfeitConfirmBtn_yes="Yes";O["en-us"].challengeForfeitConfirmBtn_no="No";O["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";
O["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["en-us"].optionsChallengeForfeit="Forfeit";O["en-us"].optionsChallengeCancel="Quit";O["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["en-us"].levelEndScreenHighScore_time="Best time:";O["en-us"].levelEndScreenTotalScore_time="Total time:";
O["en-us"]["optionsLang_fr-fr"]="French";O["en-us"]["optionsLang_ko-kr"]="Korean";O["en-us"]["optionsLang_ar-eg"]="Arabic";O["en-us"]["optionsLang_es-es"]="Spanish";O["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";O["en-us"]["optionsLang_ru-ru"]="Russian";O["en-us"].optionsExit="Exit";O["en-us"].levelEndScreenTotalScore_number="Total score:";O["en-us"].levelEndScreenHighScore_number="High score:";O["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["en-us"].optionsAbout_header_publisher="Published by:";O["en-us"]["optionsLang_jp-jp"]="Japanese";O["en-us"]["optionsLang_it-it"]="Italian";O["en-gb"]=O["en-gb"]||{};O["en-gb"].loadingScreenLoading="Loading...";
O["en-gb"].startScreenPlay="PLAY";O["en-gb"].levelMapScreenTotalScore="Total score";O["en-gb"].levelEndScreenTitle_level="Level <VALUE>";O["en-gb"].levelEndScreenTitle_difficulty="Well done!";O["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";O["en-gb"].levelEndScreenTotalScore="Total score";O["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";O["en-gb"].levelEndScreenTimeLeft="Time remaining";O["en-gb"].levelEndScreenTimeBonus="Time bonus";O["en-gb"].levelEndScreenHighScore="High score";
O["en-gb"].optionsStartScreen="Main menu";O["en-gb"].optionsQuit="Quit";O["en-gb"].optionsResume="Resume";O["en-gb"].optionsTutorial="How to play";O["en-gb"].optionsHighScore="High scores";O["en-gb"].optionsMoreGames="More Games";O["en-gb"].optionsDifficulty_easy="Easy";O["en-gb"].optionsDifficulty_medium="Medium";O["en-gb"].optionsDifficulty_hard="Difficult";O["en-gb"].optionsMusic_on="On";O["en-gb"].optionsMusic_off="Off";O["en-gb"].optionsSFX_on="On";O["en-gb"].optionsSFX_off="Off";
O["en-gb"]["optionsLang_en-us"]="English (US)";O["en-gb"]["optionsLang_en-gb"]="English (GB)";O["en-gb"]["optionsLang_nl-nl"]="Dutch";O["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";O["en-gb"].gameEndScreenBtnText="Continue";O["en-gb"].optionsTitle="Settings";O["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";O["en-gb"].optionsQuitConfirmBtn_No="No";
O["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";O["en-gb"].levelMapScreenTitle="Select a level";O["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";O["en-gb"].optionsRestart="Restart";O["en-gb"].optionsSFXBig_on="Sound on";O["en-gb"].optionsSFXBig_off="Sound off";O["en-gb"].optionsAbout_title="About";O["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
O["en-gb"].optionsAbout_backBtn="Back";O["en-gb"].optionsAbout_version="version:";O["en-gb"].optionsAbout="About";O["en-gb"].levelEndScreenMedal="IMPROVED!";O["en-gb"].startScreenQuestionaire="What do you think?";O["en-gb"].levelMapScreenWorld_0="Select a level";O["en-gb"].startScreenByTinglyGames="by: CoolGames";O["en-gb"]["optionsLang_de-de"]="German";O["en-gb"]["optionsLang_tr-tr"]="Turkish";O["en-gb"].optionsAbout_header="Developed by:";O["en-gb"].levelEndScreenViewHighscoreBtn="View scores";
O["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";O["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["en-gb"].challengeStartTextScore="<NAME>'s score:";O["en-gb"].challengeStartTextTime="<NAME>'s time:";O["en-gb"].challengeStartScreenToWin="Amount to win:";O["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";
O["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";O["en-gb"].challengeCancelConfirmBtn_yes="Yes";O["en-gb"].challengeCancelConfirmBtn_no="No";O["en-gb"].challengeEndScreensBtn_submit="Submit challenge";
O["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";O["en-gb"].challengeEndScreenName_you="You";O["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";O["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";
O["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";O["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";
O["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";O["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";O["en-gb"].challengeForfeitConfirmBtn_yes="Yes";O["en-gb"].challengeForfeitConfirmBtn_no="No";O["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";O["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
O["en-gb"].optionsChallengeForfeit="Forfeit";O["en-gb"].optionsChallengeCancel="Quit";O["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["en-gb"].levelEndScreenHighScore_time="Best time:";O["en-gb"].levelEndScreenTotalScore_time="Total time:";O["en-gb"]["optionsLang_fr-fr"]="French";O["en-gb"]["optionsLang_ko-kr"]="Korean";O["en-gb"]["optionsLang_ar-eg"]="Arabic";
O["en-gb"]["optionsLang_es-es"]="Spanish";O["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";O["en-gb"]["optionsLang_ru-ru"]="Russian";O["en-gb"].optionsExit="Exit";O["en-gb"].levelEndScreenTotalScore_number="Total score:";O["en-gb"].levelEndScreenHighScore_number="High score:";O["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["en-gb"].optionsAbout_header_publisher="Published by:";O["en-gb"]["optionsLang_jp-jp"]="Japanese";O["en-gb"]["optionsLang_it-it"]="Italian";O["de-de"]=O["de-de"]||{};O["de-de"].loadingScreenLoading="Laden ...";
O["de-de"].startScreenPlay="SPIELEN";O["de-de"].levelMapScreenTotalScore="Gesamtpunkte";O["de-de"].levelEndScreenTitle_level="Level <VALUE>";O["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";O["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";O["de-de"].levelEndScreenTotalScore="Gesamtpunkte";O["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";O["de-de"].levelEndScreenTimeLeft="Restzeit";O["de-de"].levelEndScreenTimeBonus="Zeitbonus";O["de-de"].levelEndScreenHighScore="Highscore";
O["de-de"].optionsStartScreen="Hauptmen\u00fc";O["de-de"].optionsQuit="Beenden";O["de-de"].optionsResume="Weiterspielen";O["de-de"].optionsTutorial="So wird gespielt";O["de-de"].optionsHighScore="Highscores";O["de-de"].optionsMoreGames="Weitere Spiele";O["de-de"].optionsDifficulty_easy="Einfach";O["de-de"].optionsDifficulty_medium="Mittel";O["de-de"].optionsDifficulty_hard="Schwer";O["de-de"].optionsMusic_on="EIN";O["de-de"].optionsMusic_off="AUS";O["de-de"].optionsSFX_on="EIN";
O["de-de"].optionsSFX_off="AUS";O["de-de"]["optionsLang_en-us"]="Englisch (US)";O["de-de"]["optionsLang_en-gb"]="Englisch (GB)";O["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";O["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";O["de-de"].gameEndScreenBtnText="Weiter";O["de-de"].optionsTitle="Einstellungen";O["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
O["de-de"].optionsQuitConfirmBtn_No="NEIN";O["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";O["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";O["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";O["de-de"].optionsRestart="Neustart";O["de-de"].optionsSFXBig_on="Sound EIN";O["de-de"].optionsSFXBig_off="Sound AUS";O["de-de"].optionsAbout_title="\u00dcber";
O["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["de-de"].optionsAbout_backBtn="Zur\u00fcck";O["de-de"].optionsAbout_version="Version:";O["de-de"].optionsAbout="\u00dcber";O["de-de"].levelEndScreenMedal="VERBESSERT!";O["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";O["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";O["de-de"].startScreenByTinglyGames="von: CoolGames";O["de-de"]["optionsLang_de-de"]="Deutsch";O["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
O["de-de"].optionsAbout_header="Entwickelt von:";O["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";O["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";O["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";O["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";O["de-de"].challengeStartTextTime="Zeit von <NAME>:";O["de-de"].challengeStartScreenToWin="Einsatz:";O["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
O["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";O["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";O["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";O["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";O["de-de"].challengeCancelConfirmBtn_yes="Ja";O["de-de"].challengeCancelConfirmBtn_no="Nein";
O["de-de"].challengeEndScreensBtn_submit="Herausfordern";O["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";O["de-de"].challengeEndScreenName_you="Du";O["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";O["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";O["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
O["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";O["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";O["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";O["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";O["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
O["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";O["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";O["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";O["de-de"].challengeForfeitConfirmBtn_yes="Ja";O["de-de"].challengeForfeitConfirmBtn_no="Nein";O["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";O["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
O["de-de"].optionsChallengeForfeit="Aufgeben";O["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";O["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";O["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";O["de-de"].levelEndScreenHighScore_time="Bestzeit:";O["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
O["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";O["de-de"]["optionsLang_ko-kr"]="Koreanisch";O["de-de"]["optionsLang_ar-eg"]="Arabisch";O["de-de"]["optionsLang_es-es"]="Spanisch";O["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";O["de-de"]["optionsLang_ru-ru"]="Russisch";O["de-de"].optionsExit="Verlassen";O["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";O["de-de"].levelEndScreenHighScore_number="Highscore:";O["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
O["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";O["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["de-de"].optionsAbout_header_publisher="Published by:";O["de-de"]["optionsLang_jp-jp"]="Japanese";O["de-de"]["optionsLang_it-it"]="Italian";O["fr-fr"]=O["fr-fr"]||{};O["fr-fr"].loadingScreenLoading="Chargement...";
O["fr-fr"].startScreenPlay="JOUER";O["fr-fr"].levelMapScreenTotalScore="Score total";O["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";O["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";O["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";O["fr-fr"].levelEndScreenTotalScore="Score total";O["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";O["fr-fr"].levelEndScreenTimeLeft="Temps restant";O["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";
O["fr-fr"].levelEndScreenHighScore="Meilleur score";O["fr-fr"].optionsStartScreen="Menu principal";O["fr-fr"].optionsQuit="Quitter";O["fr-fr"].optionsResume="Reprendre";O["fr-fr"].optionsTutorial="Comment jouer";O["fr-fr"].optionsHighScore="Meilleurs scores";O["fr-fr"].optionsMoreGames="Plus de jeux";O["fr-fr"].optionsDifficulty_easy="Facile";O["fr-fr"].optionsDifficulty_medium="Moyen";O["fr-fr"].optionsDifficulty_hard="Difficile";O["fr-fr"].optionsMusic_on="Avec";O["fr-fr"].optionsMusic_off="Sans";
O["fr-fr"].optionsSFX_on="Avec";O["fr-fr"].optionsSFX_off="Sans";O["fr-fr"]["optionsLang_en-us"]="Anglais (US)";O["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";O["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";O["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";O["fr-fr"].gameEndScreenBtnText="Continuer";O["fr-fr"].optionsTitle="Param\u00e8tres";O["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
O["fr-fr"].optionsQuitConfirmBtn_No="Non";O["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";O["fr-fr"].levelMapScreenTitle="Choisir un niveau";O["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";O["fr-fr"].optionsRestart="Recommencer";O["fr-fr"].optionsSFXBig_on="Avec son";O["fr-fr"].optionsSFXBig_off="Sans son";O["fr-fr"].optionsAbout_title="\u00c0 propos";
O["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["fr-fr"].optionsAbout_backBtn="Retour";O["fr-fr"].optionsAbout_version="Version :";O["fr-fr"].optionsAbout="\u00c0 propos";O["fr-fr"].levelEndScreenMedal="RECORD BATTU !";O["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";O["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";O["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";O["fr-fr"]["optionsLang_de-de"]="Allemand";O["fr-fr"]["optionsLang_tr-tr"]="Turc";
O["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";O["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";O["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";O["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";O["fr-fr"].challengeStartTextScore="Son score :";O["fr-fr"].challengeStartTextTime="Son temps\u00a0:";O["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";O["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
O["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";O["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";O["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";O["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";O["fr-fr"].challengeCancelConfirmBtn_yes="Oui";O["fr-fr"].challengeCancelConfirmBtn_no="Non";O["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
O["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";O["fr-fr"].challengeEndScreenName_you="Moi";O["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";O["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";O["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";O["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
O["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";O["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";O["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";O["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";O["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
O["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";O["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";O["fr-fr"].challengeForfeitConfirmBtn_no="Non";O["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";O["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";O["fr-fr"].optionsChallengeForfeit="Abandonner";O["fr-fr"].optionsChallengeCancel="Annuler";O["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
O["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";O["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";O["fr-fr"].levelEndScreenTotalScore_time="Temps total :";O["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";O["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";O["fr-fr"]["optionsLang_ar-eg"]="Arabe";O["fr-fr"]["optionsLang_es-es"]="Espagnol";O["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
O["fr-fr"]["optionsLang_ru-ru"]="Russe";O["fr-fr"].optionsExit="Quitter";O["fr-fr"].levelEndScreenTotalScore_number="Score total :";O["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";O["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";O["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
O["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["fr-fr"].optionsAbout_header_publisher="Published by:";O["fr-fr"]["optionsLang_jp-jp"]="Japanese";O["fr-fr"]["optionsLang_it-it"]="Italian";O["pt-br"]=O["pt-br"]||{};O["pt-br"].loadingScreenLoading="Carregando...";O["pt-br"].startScreenPlay="JOGAR";O["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";O["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";O["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
O["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";O["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";O["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";O["pt-br"].levelEndScreenTimeLeft="Tempo restante";O["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";O["pt-br"].levelEndScreenHighScore="Recorde";O["pt-br"].optionsStartScreen="Menu principal";O["pt-br"].optionsQuit="Sair";O["pt-br"].optionsResume="Continuar";O["pt-br"].optionsTutorial="Como jogar";
O["pt-br"].optionsHighScore="Recordes";O["pt-br"].optionsMoreGames="Mais jogos";O["pt-br"].optionsDifficulty_easy="F\u00e1cil";O["pt-br"].optionsDifficulty_medium="M\u00e9dio";O["pt-br"].optionsDifficulty_hard="Dif\u00edcil";O["pt-br"].optionsMusic_on="Sim";O["pt-br"].optionsMusic_off="N\u00e3o";O["pt-br"].optionsSFX_on="Sim";O["pt-br"].optionsSFX_off="N\u00e3o";O["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";O["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";O["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
O["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";O["pt-br"].gameEndScreenBtnText="Continuar";O["pt-br"].optionsTitle="Configura\u00e7\u00f5es";O["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";O["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";O["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";O["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
O["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";O["pt-br"].optionsRestart="Reiniciar";O["pt-br"].optionsSFXBig_on="Com som";O["pt-br"].optionsSFXBig_off="Sem som";O["pt-br"].optionsAbout_title="Sobre";O["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["pt-br"].optionsAbout_backBtn="Voltar";O["pt-br"].optionsAbout_version="vers\u00e3o:";
O["pt-br"].optionsAbout="Sobre";O["pt-br"].levelEndScreenMedal="MELHOROU!";O["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";O["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";O["pt-br"].startScreenByTinglyGames="da: CoolGames";O["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";O["pt-br"]["optionsLang_tr-tr"]="Turco";O["pt-br"].optionsAbout_header="Desenvolvido por:";O["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";O["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
O["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["pt-br"].challengeStartTextScore="<NAME>'s score:";O["pt-br"].challengeStartTextTime="<NAME>'s time:";O["pt-br"].challengeStartScreenToWin="Amount to win:";O["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
O["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";O["pt-br"].challengeCancelConfirmBtn_yes="Yes";O["pt-br"].challengeCancelConfirmBtn_no="No";O["pt-br"].challengeEndScreensBtn_submit="Submit challenge";O["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";O["pt-br"].challengeEndScreenName_you="You";
O["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";O["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";O["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
O["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";O["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";O["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";O["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
O["pt-br"].challengeForfeitConfirmBtn_yes="Yes";O["pt-br"].challengeForfeitConfirmBtn_no="No";O["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";O["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["pt-br"].optionsChallengeForfeit="Desistir";O["pt-br"].optionsChallengeCancel="Sair do Jogo";O["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
O["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";O["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";O["pt-br"].levelEndScreenTotalScore_time="Tempo total:";O["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";O["pt-br"]["optionsLang_ko-kr"]="Coreano";O["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";O["pt-br"]["optionsLang_es-es"]="Espanhol";O["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
O["pt-br"]["optionsLang_ru-ru"]="Russo";O["pt-br"].optionsExit="Sa\u00edda";O["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";O["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";O["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["pt-br"].optionsAbout_header_publisher="Published by:";O["pt-br"]["optionsLang_jp-jp"]="Japanese";O["pt-br"]["optionsLang_it-it"]="Italian";O["es-es"]=O["es-es"]||{};O["es-es"].loadingScreenLoading="Cargando...";
O["es-es"].startScreenPlay="JUGAR";O["es-es"].levelMapScreenTotalScore="Punt. total";O["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";O["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";O["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";O["es-es"].levelEndScreenTotalScore="Punt. total";O["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";O["es-es"].levelEndScreenTimeLeft="Tiempo restante";O["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";
O["es-es"].levelEndScreenHighScore="R\u00e9cord";O["es-es"].optionsStartScreen="Men\u00fa principal";O["es-es"].optionsQuit="Salir";O["es-es"].optionsResume="Seguir";O["es-es"].optionsTutorial="C\u00f3mo jugar";O["es-es"].optionsHighScore="R\u00e9cords";O["es-es"].optionsMoreGames="M\u00e1s juegos";O["es-es"].optionsDifficulty_easy="F\u00e1cil";O["es-es"].optionsDifficulty_medium="Normal";O["es-es"].optionsDifficulty_hard="Dif\u00edcil";O["es-es"].optionsMusic_on="S\u00ed";
O["es-es"].optionsMusic_off="No";O["es-es"].optionsSFX_on="S\u00ed";O["es-es"].optionsSFX_off="No";O["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";O["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";O["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";O["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";O["es-es"].gameEndScreenBtnText="Continuar";O["es-es"].optionsTitle="Ajustes";O["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
O["es-es"].optionsQuitConfirmBtn_No="No";O["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";O["es-es"].levelMapScreenTitle="Elige un nivel";O["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";O["es-es"].optionsRestart="Reiniciar";O["es-es"].optionsSFXBig_on="Sonido s\u00ed";O["es-es"].optionsSFXBig_off="Sonido no";O["es-es"].optionsAbout_title="Acerca de";
O["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["es-es"].optionsAbout_backBtn="Atr\u00e1s";O["es-es"].optionsAbout_version="versi\u00f3n:";O["es-es"].optionsAbout="Acerca de";O["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";O["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";O["es-es"].levelMapScreenWorld_0="Elige un nivel";O["es-es"].startScreenByTinglyGames="de: CoolGames";O["es-es"]["optionsLang_de-de"]="Alem\u00e1n";O["es-es"]["optionsLang_tr-tr"]="Turco";
O["es-es"].optionsAbout_header="Desarrollado por:";O["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";O["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";O["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["es-es"].challengeStartTextScore="<NAME>'s score:";O["es-es"].challengeStartTextTime="<NAME>'s time:";O["es-es"].challengeStartScreenToWin="Amount to win:";O["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
O["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";O["es-es"].challengeCancelConfirmBtn_yes="Yes";O["es-es"].challengeCancelConfirmBtn_no="No";
O["es-es"].challengeEndScreensBtn_submit="Submit challenge";O["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";O["es-es"].challengeEndScreenName_you="You";O["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";O["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
O["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";O["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";O["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
O["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";O["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";O["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["es-es"].challengeForfeitConfirmBtn_yes="Yes";O["es-es"].challengeForfeitConfirmBtn_no="No";O["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";O["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
O["es-es"].optionsChallengeForfeit="Rendirse";O["es-es"].optionsChallengeCancel="Abandonar";O["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";O["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";O["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";O["es-es"].levelEndScreenTotalScore_time="Tiempo total:";O["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";O["es-es"]["optionsLang_ko-kr"]="Coreano";
O["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";O["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";O["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";O["es-es"]["optionsLang_ru-ru"]="Ruso";O["es-es"].optionsExit="Salir";O["es-es"].levelEndScreenTotalScore_number="Puntos totales:";O["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";O["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["es-es"].optionsAbout_header_publisher="Published by:";O["es-es"]["optionsLang_jp-jp"]="Japanese";O["es-es"]["optionsLang_it-it"]="Italian";O["tr-tr"]=O["tr-tr"]||{};O["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";
O["tr-tr"].startScreenPlay="OYNA";O["tr-tr"].levelMapScreenTotalScore="Toplam skor";O["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";O["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";O["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";O["tr-tr"].levelEndScreenTotalScore="Toplam skor";O["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";O["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";O["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";
O["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";O["tr-tr"].optionsStartScreen="Ana men\u00fc";O["tr-tr"].optionsQuit="\u00c7\u0131k";O["tr-tr"].optionsResume="Devam et";O["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";O["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";O["tr-tr"].optionsMoreGames="Daha Fazla Oyun";O["tr-tr"].optionsDifficulty_easy="Kolay";O["tr-tr"].optionsDifficulty_medium="Orta";O["tr-tr"].optionsDifficulty_hard="Zorluk";O["tr-tr"].optionsMusic_on="A\u00e7\u0131k";
O["tr-tr"].optionsMusic_off="Kapal\u0131";O["tr-tr"].optionsSFX_on="A\u00e7\u0131k";O["tr-tr"].optionsSFX_off="Kapal\u0131";O["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";O["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";O["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";O["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";O["tr-tr"].gameEndScreenBtnText="Devam";O["tr-tr"].optionsTitle="Ayarlar";O["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
O["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";O["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";O["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";O["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";O["tr-tr"].optionsRestart="Tekrar ba\u015flat";O["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";O["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
O["tr-tr"].optionsAbout_title="Hakk\u0131nda";O["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["tr-tr"].optionsAbout_backBtn="Geri";O["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";O["tr-tr"].optionsAbout="Hakk\u0131nda";O["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";O["tr-tr"].startScreenQuestionaire="Ne dersin?";O["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";O["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
O["tr-tr"]["optionsLang_de-de"]="Almanca";O["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";O["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";O["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";O["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";O["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["tr-tr"].challengeStartTextScore="<NAME>'s score:";O["tr-tr"].challengeStartTextTime="<NAME>'s time:";
O["tr-tr"].challengeStartScreenToWin="Amount to win:";O["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["tr-tr"].challengeCancelConfirmBtn_yes="Yes";O["tr-tr"].challengeCancelConfirmBtn_no="No";O["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";O["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";O["tr-tr"].challengeEndScreenName_you="You";O["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
O["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";O["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
O["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";O["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";O["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";O["tr-tr"].challengeForfeitConfirmBtn_no="No";O["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
O["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";O["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";O["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";O["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
O["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";O["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";O["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";O["tr-tr"]["optionsLang_ko-kr"]="Korece";O["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";O["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";O["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";O["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";O["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";O["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
O["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";O["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";O["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
O["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["tr-tr"].optionsAbout_header_publisher="Published by:";O["tr-tr"]["optionsLang_jp-jp"]="Japanese";O["tr-tr"]["optionsLang_it-it"]="Italian";O["ru-ru"]=O["ru-ru"]||{};O["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";O["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";O["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";
O["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";O["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";O["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";O["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";O["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";
O["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";O["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";O["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";O["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";O["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";
O["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";O["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";O["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";O["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";O["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";O["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
O["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";O["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";O["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";O["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";O["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";O["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";O["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";
O["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";O["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";O["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";O["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
O["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
O["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";O["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";O["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";O["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
O["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";O["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";O["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";O["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";O["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\u00820";O["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";O["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
O["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";O["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";O["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";O["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";O["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
O["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";O["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";O["ru-ru"].optionsAbout_header="Developed by:";O["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";O["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";O["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["ru-ru"].challengeStartTextScore="<NAME>'s score:";
O["ru-ru"].challengeStartTextTime="<NAME>'s time:";O["ru-ru"].challengeStartScreenToWin="Amount to win:";O["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["ru-ru"].challengeCancelConfirmBtn_yes="Yes";O["ru-ru"].challengeCancelConfirmBtn_no="No";O["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";O["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";O["ru-ru"].challengeEndScreenName_you="You";O["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
O["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";O["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
O["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";O["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";O["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";O["ru-ru"].challengeForfeitConfirmBtn_no="No";O["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
O["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["ru-ru"].optionsChallengeForfeit="Forfeit";O["ru-ru"].optionsChallengeCancel="Quit";O["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["ru-ru"].levelEndScreenHighScore_time="Best time:";O["ru-ru"].levelEndScreenTotalScore_time="Total time:";
O["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";O["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";O["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";O["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";O["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
O["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";O["ru-ru"].optionsExit="Exit";O["ru-ru"].levelEndScreenTotalScore_number="Total score:";O["ru-ru"].levelEndScreenHighScore_number="High score:";O["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["ru-ru"].optionsAbout_header_publisher="Published by:";O["ru-ru"]["optionsLang_jp-jp"]="Japanese";O["ru-ru"]["optionsLang_it-it"]="Italian";O["ar-eg"]=O["ar-eg"]||{};O["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
O["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";O["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";O["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";O["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";O["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";O["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
O["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";O["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";O["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";O["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
O["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";O["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";O["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";O["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";O["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
O["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";O["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";O["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";O["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";O["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";O["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
O["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";O["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";O["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
O["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";O["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";O["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";O["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
O["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";O["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
O["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";O["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";O["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";O["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
O["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";O["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";O["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";O["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";O["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
O["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";O["ar-eg"].optionsAbout="\u062d\u0648\u0644";O["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";O["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";O["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";O["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
O["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";O["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";O["ar-eg"].optionsAbout_header="Developed by:";O["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";O["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";O["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["ar-eg"].challengeStartTextScore="<NAME>'s score:";
O["ar-eg"].challengeStartTextTime="<NAME>'s time:";O["ar-eg"].challengeStartScreenToWin="Amount to win:";O["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["ar-eg"].challengeCancelConfirmBtn_yes="Yes";O["ar-eg"].challengeCancelConfirmBtn_no="No";O["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";O["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";O["ar-eg"].challengeEndScreenName_you="You";O["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
O["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";O["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
O["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";O["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";O["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";O["ar-eg"].challengeForfeitConfirmBtn_no="No";O["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
O["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["ar-eg"].optionsChallengeForfeit="Forfeit";O["ar-eg"].optionsChallengeCancel="Quit";O["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["ar-eg"].levelEndScreenHighScore_time="Best time:";O["ar-eg"].levelEndScreenTotalScore_time="Total time:";
O["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";O["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";O["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";O["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";O["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
O["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";O["ar-eg"].optionsExit="Exit";O["ar-eg"].levelEndScreenTotalScore_number="Total score:";O["ar-eg"].levelEndScreenHighScore_number="High score:";O["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["ar-eg"].optionsAbout_header_publisher="Published by:";O["ar-eg"]["optionsLang_jp-jp"]="Japanese";O["ar-eg"]["optionsLang_it-it"]="Italian";O["ko-kr"]=O["ko-kr"]||{};O["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";
O["ko-kr"].startScreenPlay="PLAY";O["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";O["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";O["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";O["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";O["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";O["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";O["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";
O["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";O["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";O["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";O["ko-kr"].optionsQuit="\uc885\ub8cc";O["ko-kr"].optionsResume="\uacc4\uc18d";O["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";O["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";O["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";O["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";
O["ko-kr"].optionsDifficulty_medium="\uc911";O["ko-kr"].optionsDifficulty_hard="\uc0c1";O["ko-kr"].optionsMusic_on="\ucf1c\uae30";O["ko-kr"].optionsMusic_off="\ub044\uae30";O["ko-kr"].optionsSFX_on="\ucf1c\uae30";O["ko-kr"].optionsSFX_off="\ub044\uae30";O["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";O["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";O["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";O["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
O["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";O["ko-kr"].optionsTitle="\uc124\uc815";O["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";O["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";O["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
O["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";O["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";O["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";O["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";O["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
O["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";O["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";O["ko-kr"].optionsAbout_version="\ubc84\uc804:";O["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";O["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";O["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";O["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
O["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";O["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";O["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";O["ko-kr"].optionsAbout_header="Developed by:";O["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";O["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";O["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";O["ko-kr"].challengeStartTextScore="<NAME>'s score:";
O["ko-kr"].challengeStartTextTime="<NAME>'s time:";O["ko-kr"].challengeStartScreenToWin="Amount to win:";O["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";O["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";O["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["ko-kr"].challengeCancelConfirmBtn_yes="Yes";O["ko-kr"].challengeCancelConfirmBtn_no="No";O["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";O["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";O["ko-kr"].challengeEndScreenName_you="You";O["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
O["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";O["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";O["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
O["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";O["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";O["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";O["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";O["ko-kr"].challengeForfeitConfirmBtn_no="No";O["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
O["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";O["ko-kr"].optionsChallengeForfeit="Forfeit";O["ko-kr"].optionsChallengeCancel="Quit";O["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["ko-kr"].levelEndScreenHighScore_time="Best time:";O["ko-kr"].levelEndScreenTotalScore_time="Total time:";
O["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";O["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";O["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";O["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";O["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";O["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";O["ko-kr"].optionsExit="Exit";O["ko-kr"].levelEndScreenTotalScore_number="Total score:";
O["ko-kr"].levelEndScreenHighScore_number="High score:";O["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";O["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
O["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["ko-kr"].optionsAbout_header_publisher="Published by:";O["ko-kr"]["optionsLang_jp-jp"]="Japanese";O["ko-kr"]["optionsLang_it-it"]="Italian";O["jp-jp"]=O["jp-jp"]||{};O["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";O["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";O["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";O["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
O["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";O["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";O["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";O["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";O["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";O["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";O["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
O["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";O["jp-jp"].optionsQuit="\u3084\u3081\u308b";O["jp-jp"].optionsResume="\u518d\u958b";O["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";O["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";O["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";O["jp-jp"].optionsDifficulty_easy="\u304b\u3093\u305f\u3093";O["jp-jp"].optionsDifficulty_medium="\u3075\u3064\u3046";O["jp-jp"].optionsDifficulty_hard="\u96e3\u3057\u3044";
O["jp-jp"].optionsMusic_on="\u30aa\u30f3";O["jp-jp"].optionsMusic_off="\u30aa\u30d5";O["jp-jp"].optionsSFX_on="\u30aa\u30f3";O["jp-jp"].optionsSFX_off="\u30aa\u30d5";O["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";O["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";O["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";O["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
O["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";O["jp-jp"].optionsTitle="\u8a2d\u5b9a";O["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";O["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";O["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
O["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";O["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";O["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";O["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";O["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
O["jp-jp"].optionsAbout_title="About";O["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";O["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";O["jp-jp"].optionsAbout_version="version";O["jp-jp"].optionsAbout="About";O["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";O["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";O["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";O["jp-jp"].startScreenByTinglyGames="by: CoolGames";
O["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";O["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";O["jp-jp"].optionsAbout_header="Developed by";O["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";O["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";O["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";O["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
O["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";O["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";O["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";O["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";O["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";O["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";O["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
O["jp-jp"].challengeCancelConfirmBtn_yes="Yes";O["jp-jp"].challengeCancelConfirmBtn_no="No";O["jp-jp"].challengeEndScreensBtn_submit="\u3042";O["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";O["jp-jp"].challengeEndScreenName_you="You";O["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";O["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";O["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
O["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";O["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";O["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";O["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";O["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
O["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";O["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";O["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";O["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";O["jp-jp"].challengeForfeitConfirmBtn_no="No";O["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";O["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
O["jp-jp"].optionsChallengeForfeit="Forfeit";O["jp-jp"].optionsChallengeCancel="Quit";O["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";O["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";O["jp-jp"].levelEndScreenHighScore_time="Best time:";O["jp-jp"].levelEndScreenTotalScore_time="Total time:";O["jp-jp"]["optionsLang_fr-fr"]="French";O["jp-jp"]["optionsLang_ko-kr"]="Korean";O["jp-jp"]["optionsLang_ar-eg"]="Arabic";
O["jp-jp"]["optionsLang_es-es"]="Spanish";O["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";O["jp-jp"]["optionsLang_ru-ru"]="Russian";O["jp-jp"].optionsExit="Exit";O["jp-jp"].levelEndScreenTotalScore_number="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2:";O["jp-jp"].levelEndScreenHighScore_number="\u30cf\u30a4\u30b9\u30b3\u30a2:";O["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
O["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";O["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";O["jp-jp"].optionsAbout_header_publisher="Published by:";O["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";O["jp-jp"]["optionsLang_it-it"]="Italian";O["it-it"]=O["it-it"]||{};O["it-it"].loadingScreenLoading="Caricamento...";
O["it-it"].startScreenPlay="GIOCA";O["it-it"].levelMapScreenTotalScore="Punteggio totale";O["it-it"].levelEndScreenTitle_level="Livello <VALUE>";O["it-it"].levelEndScreenTitle_difficulty="Ottimo lavoro!";O["it-it"].levelEndScreenTitle_endless="Livello <VALUE>";O["it-it"].levelEndScreenTotalScore="Punteggio totale";O["it-it"].levelEndScreenSubTitle_levelFailed="Non hai superato il livello";O["it-it"].levelEndScreenTimeLeft="Tempo rimanente";O["it-it"].levelEndScreenTimeBonus="Tempo bonus";
O["it-it"].levelEndScreenHighScore="Record";O["it-it"].optionsStartScreen="Menu principale";O["it-it"].optionsQuit="Esci";O["it-it"].optionsResume="Riprendi";O["it-it"].optionsTutorial="Come si gioca";O["it-it"].optionsHighScore="Record";O["it-it"].optionsMoreGames="Altri giochi";O["it-it"].optionsDifficulty_easy="Facile";O["it-it"].optionsDifficulty_medium="Media";O["it-it"].optionsDifficulty_hard="Difficile";O["it-it"].optionsMusic_on="S\u00ec";O["it-it"].optionsMusic_off="No";
O["it-it"].optionsSFX_on="S\u00ec";O["it-it"].optionsSFX_off="No";O["it-it"]["optionsLang_en-us"]="Inglese (US)";O["it-it"]["optionsLang_en-gb"]="Inglese (UK)";O["it-it"]["optionsLang_nl-nl"]="Olandese";O["it-it"].gameEndScreenTitle="Congratulazioni!\nHai completato il gioco.";O["it-it"].gameEndScreenBtnText="Continua";O["it-it"].optionsTitle="Impostazioni";O["it-it"].optionsQuitConfirmationText="Attenzione!\n\nSe abbandoni ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";
O["it-it"].optionsQuitConfirmBtn_No="No";O["it-it"].optionsQuitConfirmBtn_Yes="S\u00ec, ho deciso";O["it-it"].levelMapScreenTitle="Scegli un livello";O["it-it"].optionsRestartConfirmationText="Attenzione!\n\nSe riavvii ora, perderai tutti i progressi ottenuti in questo livello. Confermi?";O["it-it"].optionsRestart="Riavvia";O["it-it"].optionsSFXBig_on="Audio S\u00cc";O["it-it"].optionsSFXBig_off="Audio NO";O["it-it"].optionsAbout_title="Informazioni";O["it-it"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2020";
O["it-it"].optionsAbout_backBtn="Indietro";O["it-it"].optionsAbout_version="versione:";O["it-it"].optionsAbout="Informazioni";O["it-it"].levelEndScreenMedal="MIGLIORATO!";O["it-it"].startScreenQuestionaire="Che ne pensi?";O["it-it"].levelMapScreenWorld_0="Scegli un livello";O["it-it"].startScreenByTinglyGames="di: CoolGames";O["it-it"]["optionsLang_de-de"]="Tedesco";O["it-it"]["optionsLang_tr-tr"]="Turco";O["it-it"].optionsAbout_header="Sviluppato da:";O["it-it"].levelEndScreenViewHighscoreBtn="Guarda i punteggi";
O["it-it"].levelEndScreenSubmitHighscoreBtn="Invia il punteggio";O["it-it"].challengeStartScreenTitle_challengee_friend="Hai ricevuto una sfida da:";O["it-it"].challengeStartTextScore="punteggio di <NAME>:";O["it-it"].challengeStartTextTime="tempo di <NAME>:";O["it-it"].challengeStartScreenToWin="Necessario per vincere:";O["it-it"].challengeEndScreenWinnings="Hai vinto <AMOUNT> fairpoint";O["it-it"].challengeEndScreenOutcomeMessage_WON="Hai vinto la sfida!";
O["it-it"].challengeEndScreenOutcomeMessage_LOST="Hai perso la sfida.";O["it-it"].challengeEndScreenOutcomeMessage_TIED="Hai pareggiato.";O["it-it"].challengeCancelConfirmText="Stai per annullare la sfida. Recupererai la posta, tranne la quota di partecipazione alla sfida. Confermi?";O["it-it"].challengeCancelConfirmBtn_yes="S\u00ec";O["it-it"].challengeCancelConfirmBtn_no="No";O["it-it"].challengeEndScreensBtn_submit="Invia la sfida";O["it-it"].challengeEndScreenBtn_cancel="Annulla la sfida";
O["it-it"].challengeEndScreenName_you="Tu";O["it-it"].challengeEndScreenChallengeSend_error="Impossibile inviare la sfida. Riprova pi\u00f9 tardi.";O["it-it"].challengeEndScreenChallengeSend_success="Sfida inviata!";O["it-it"].challengeCancelMessage_error="Impossibile annullare la sfida. Riprova pi\u00f9 tardi.";O["it-it"].challengeCancelMessage_success="Sfida annullata.";O["it-it"].challengeEndScreenScoreSend_error="Impossibile comunicare col server. Riprova pi\u00f9 tardi.";
O["it-it"].challengeStartScreenTitle_challengee_stranger="Sei stato abbinato a:";O["it-it"].challengeStartScreenTitle_challenger_friend="Stai sfidando:";O["it-it"].challengeStartScreenTitle_challenger_stranger="Stai impostando un punteggio da battere per:";O["it-it"].challengeStartTextTime_challenger="Gioca e imposta un tempo da battere.";O["it-it"].challengeStartTextScore_challenger="Gioca e imposta un punteggio da superare.";O["it-it"].challengeForfeitConfirmText="Stai per abbandonare la sfida. Confermi?";
O["it-it"].challengeForfeitConfirmBtn_yes="S\u00ec";O["it-it"].challengeForfeitConfirmBtn_no="No";O["it-it"].challengeForfeitMessage_success="Hai abbandonato la sfida.";O["it-it"].challengeForfeitMessage_error="Impossibile abbandonare la sfida. Riprova pi\u00f9 tardi.";O["it-it"].optionsChallengeForfeit="Abbandona";O["it-it"].optionsChallengeCancel="Esci";O["it-it"].challengeLoadingError_notValid="La sfida non \u00e8 pi\u00f9 valida.";O["it-it"].challengeLoadingError_notStarted="Impossibile connettersi al server. Riprova pi\u00f9 tardi.";
O["it-it"].levelEndScreenHighScore_time="Miglior tempo:";O["it-it"].levelEndScreenTotalScore_time="Tempo totale:";O["it-it"]["optionsLang_fr-fr"]="Francese";O["it-it"]["optionsLang_ko-kr"]="Coreano";O["it-it"]["optionsLang_ar-eg"]="Arabo";O["it-it"]["optionsLang_es-es"]="Spagnolo";O["it-it"]["optionsLang_pt-br"]="Brasiliano - Portoghese";O["it-it"]["optionsLang_ru-ru"]="Russo";O["it-it"].optionsExit="Esci";O["it-it"].levelEndScreenTotalScore_number="Punteggio totale:";
O["it-it"].levelEndScreenHighScore_number="Record:";O["it-it"].challengeEndScreenChallengeSend_submessage="<NAME> ha a disposizione 72 ore per accettare o rifiutare la tua sfida. Se la rifiuta, o non la accetta entro 72 ore, recupererai la posta e la quota di partecipazione alla sfida.";O["it-it"].challengeEndScreenChallengeSend_submessage_stranger="Se nessuno accetta la tua sfida entro 72 ore, recuperi la posta e la quota di partecipazione alla sfida.";
O["it-it"].challengeForfeitMessage_winnings="<NAME> ha vinto <AMOUNT> fairpoint!";O["it-it"].optionsAbout_header_publisher="Distribuito da:";O["it-it"]["optionsLang_jp-jp"]="Giapponese";O["it-it"]["optionsLang_it-it"]="Italiano";O=O||{};O["nl-nl"]=O["nl-nl"]||{};O["nl-nl"].game_ui_SCORE="SCORE";O["nl-nl"].game_ui_STAGE="LEVEL";O["nl-nl"].game_ui_LIVES="LEVENS";O["nl-nl"].game_ui_TIME="TIJD";O["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";O["nl-nl"].game_ui_LEVEL="LEVEL";O["nl-nl"].game_ui_time_left="Resterende tijd";
O["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";O["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";O["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";O["en-us"]=O["en-us"]||{};O["en-us"].game_ui_SCORE="SCORE";O["en-us"].game_ui_STAGE="STAGE";O["en-us"].game_ui_LIVES="LIVES";O["en-us"].game_ui_TIME="TIME";O["en-us"].game_ui_HIGHSCORE="HIGH SCORE";O["en-us"].game_ui_LEVEL="LEVEL";O["en-us"].game_ui_time_left="Time left";O["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";O["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";
O["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";O["en-gb"]=O["en-gb"]||{};O["en-gb"].game_ui_SCORE="SCORE";O["en-gb"].game_ui_STAGE="STAGE";O["en-gb"].game_ui_LIVES="LIVES";O["en-gb"].game_ui_TIME="TIME";O["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";O["en-gb"].game_ui_LEVEL="LEVEL";O["en-gb"].game_ui_time_left="Time left";O["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";O["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";O["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";O["de-de"]=O["de-de"]||{};
O["de-de"].game_ui_SCORE="PUNKTE";O["de-de"].game_ui_STAGE="STUFE";O["de-de"].game_ui_LIVES="LEBEN";O["de-de"].game_ui_TIME="ZEIT";O["de-de"].game_ui_HIGHSCORE="HIGHSCORE";O["de-de"].game_ui_LEVEL="LEVEL";O["de-de"].game_ui_time_left="Restzeit";O["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";O["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";O["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";O["fr-fr"]=O["fr-fr"]||{};O["fr-fr"].game_ui_SCORE="SCORE";O["fr-fr"].game_ui_STAGE="SC\u00c8NE";
O["fr-fr"].game_ui_LIVES="VIES";O["fr-fr"].game_ui_TIME="TEMPS";O["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";O["fr-fr"].game_ui_LEVEL="NIVEAU";O["fr-fr"].game_ui_time_left="Temps restant";O["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";O["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";O["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";O["pt-br"]=O["pt-br"]||{};O["pt-br"].game_ui_SCORE="PONTOS";O["pt-br"].game_ui_STAGE="FASE";O["pt-br"].game_ui_LIVES="VIDAS";O["pt-br"].game_ui_TIME="TEMPO";
O["pt-br"].game_ui_HIGHSCORE="RECORDE";O["pt-br"].game_ui_LEVEL="N\u00cdVEL";O["pt-br"].game_ui_time_left="Tempo restante";O["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";O["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";O["pt-br"].game_ui_HIGHSCORE_break="RECORDE";O["es-es"]=O["es-es"]||{};O["es-es"].game_ui_SCORE="PUNTOS";O["es-es"].game_ui_STAGE="FASE";O["es-es"].game_ui_LIVES="VIDAS";O["es-es"].game_ui_TIME="TIEMPO";O["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";
O["es-es"].game_ui_LEVEL="NIVEL";O["es-es"].game_ui_time_left="Tiempo restante";O["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";O["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";O["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";O["tr-tr"]=O["tr-tr"]||{};O["tr-tr"].game_ui_SCORE="SKOR";O["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";O["tr-tr"].game_ui_LIVES="HAYATLAR";O["tr-tr"].game_ui_TIME="S\u00dcRE";O["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";O["tr-tr"].game_ui_LEVEL="SEV\u0130YE";
O["tr-tr"].game_ui_time_left="Kalan zaman";O["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";O["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";O["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";O["ru-ru"]=O["ru-ru"]||{};O["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";O["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";O["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";O["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";
O["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";O["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";O["ru-ru"].game_ui_time_left="Time left";O["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";O["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";O["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";O["ar-eg"]=O["ar-eg"]||{};O["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";O["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";
O["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";O["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";O["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";O["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";O["ar-eg"].game_ui_time_left="Time left";O["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";O["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";O["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
O["ko-kr"]=O["ko-kr"]||{};O["ko-kr"].game_ui_SCORE="\uc810\uc218";O["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";O["ko-kr"].game_ui_LIVES="\uae30\ud68c";O["ko-kr"].game_ui_TIME="\uc2dc\uac04";O["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";O["ko-kr"].game_ui_LEVEL="\ub808\ubca8";O["ko-kr"].game_ui_time_left="Time left";O["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";O["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";O["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";
O["jp-jp"]=O["jp-jp"]||{};O["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";O["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";O["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";O["jp-jp"].game_ui_TIME="\u30bf\u30a4\u30e0";O["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";O["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";O["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";O["jp-jp"].game_ui_TIME_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";O["jp-jp"].game_ui_SCORE_TO_BEAT="\u30af\u30ea\u30a2\u307e\u3067\u3042\u3068";
O["jp-jp"].game_ui_HIGHSCORE_break="\u30cf\u30a4\n\u30b9\u30b3\u30a2";O["it-it"]=O["it-it"]||{};O["it-it"].game_ui_SCORE="PUNTEGGIO";O["it-it"].game_ui_STAGE="FASE";O["it-it"].game_ui_LIVES="VITE";O["it-it"].game_ui_TIME="TEMPO";O["it-it"].game_ui_HIGHSCORE="RECORD";O["it-it"].game_ui_LEVEL="LIVELLO";O["it-it"].game_ui_time_left="TEMPO RIMANENTE";O["it-it"].game_ui_TIME_TO_BEAT="TEMPO DA BATTERE";O["it-it"].game_ui_SCORE_TO_BEAT="PUNTEGGIO DA BATTERE";O["it-it"].game_ui_HIGHSCORE_break="RECORD";
var $f={};
function ag(){$f={Ue:{Al:"en-us",vk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},Wd:{ld:M(1040),hr:M(960),sc:M(640),Bh:M(640),og:M(0),Ol:M(-80),ng:0,minHeight:M(780),Bn:{id:"canvasBackground",depth:50},Nc:{id:"canvasGame",depth:100,top:M(200,"round"),left:M(40,"round"),width:M(560,"round"),height:M(560,"round")},jd:{id:"canvasGameUI",depth:150,top:0,left:0,height:M(120,"round")},jg:{id:"canvasMain",depth:200}},Jk:{ld:M(640),hr:M(640),sc:M(1152),Bh:M(1152),
og:M(0),Ol:M(0),ng:0,minHeight:M(640),minWidth:M(850),Bn:{id:"canvasBackground",depth:50},Nc:{id:"canvasGame",depth:100,top:M(40,"round"),left:M(296,"round"),width:M(560,"round"),height:M(560,"round")},jd:{id:"canvasGameUI",depth:150,top:0,left:M(151),width:M(140)},jg:{id:"canvasMain",depth:200}},rc:{bigPlay:{type:"text",s:Be,Fa:M(38),Gb:M(99),font:{align:"center",j:"middle",fontSize:N({big:46,small:30}),fillColor:"#01198a",P:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},wd:2,xd:M(30),fontSize:N({big:46,
small:30})},difficulty_toggle:{type:"toggleText",s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"0",s:$c,S:"optionsDifficulty_easy"},{id:"1",s:Zc,S:"optionsDifficulty_medium"},{id:"2",s:Yc,S:"optionsDifficulty_hard"}],gi:M(30),hi:M(12),Ug:M(10),wd:2,xd:M(30),fontSize:N({big:40,small:20})},music_toggle:{type:"toggle",s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,
small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"on",s:Ae,S:"optionsMusic_on"},{id:"off",s:ze,S:"optionsMusic_off"}],gi:M(30),hi:M(12),Ug:0,wd:2,xd:M(30)},sfx_toggle:{type:"toggle",s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"on",s:ye,S:"optionsSFX_on"},{id:"off",s:xe,S:"optionsSFX_off"}],gi:M(30),hi:M(12),Ug:0,wd:2,xd:M(30)},music_big_toggle:{type:"toggleText",
s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"on",s:"undefined"!==typeof oe?oe:void 0,S:"optionsMusic_on"},{id:"off",s:"undefined"!==typeof ne?ne:void 0,S:"optionsMusic_off"}],gi:M(28,"round"),hi:M(10),Ug:M(10),wd:2,xd:M(30),fontSize:N({big:40,small:20})},sfx_big_toggle:{type:"toggleText",s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",
P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"on",s:"undefined"!==typeof le?le:void 0,S:"optionsSFXBig_on"},{id:"off",s:"undefined"!==typeof me?me:void 0,S:"optionsSFXBig_off"}],gi:M(33,"round"),hi:M(12),Ug:M(10),wd:2,xd:M(30),fontSize:N({big:40,small:20})},language_toggle:{type:"toggleText",s:we,Fa:M(106),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},aa:[{id:"en-us",s:ad,S:"optionsLang_en-us"},
{id:"en-gb",s:bd,S:"optionsLang_en-gb"},{id:"nl-nl",s:cd,S:"optionsLang_nl-nl"},{id:"de-de",s:ed,S:"optionsLang_de-de"},{id:"fr-fr",s:fd,S:"optionsLang_fr-fr"},{id:"pt-br",s:gd,S:"optionsLang_pt-br"},{id:"es-es",s:hd,S:"optionsLang_es-es"},{id:"ru-ru",s:jd,S:"optionsLang_ru-ru"},{id:"it-it",s:md,S:"optionsLang_it-it"},{id:"ar-eg",s:kd,S:"optionsLang_ar-eg"},{id:"ko-kr",s:ld,S:"optionsLang_ko-kr"},{id:"tr-tr",s:dd,S:"optionsLang_tr-tr"},{id:"jp-jp",s:id,S:"optionsLang_jp-jp"}],gi:M(40),hi:M(20),Ug:M(10),
wd:2,xd:M(30),fontSize:N({big:40,small:20})},default_text:{type:"text",s:ve,Fa:M(40),Gb:M(40),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},wd:2,xd:M(30),fontSize:N({big:40,small:20})},default_image:{type:"image",s:ve,Fa:M(40),Gb:M(40),xd:M(6)},options:{type:"image",s:se}},An:{bigPlay:{type:"text",s:Be,Fa:M(40),Gb:M(76),font:{align:"center",j:"middle",fontSize:N({big:40,small:20}),fillColor:"#01198a",P:{h:!0,
color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},wd:2,xd:M(30),fontSize:N({big:40,small:20})}},Fk:{green:{font:{align:"center",j:"middle",fillColor:"#018a17",P:{h:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",j:"middle",fillColor:"#01198a",P:{h:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",j:"middle",fillColor:"#004f89",P:{h:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",j:"middle",fillColor:"#9a1900",P:{h:!0,
color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",j:"middle",fillColor:"#8d2501",P:{h:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",j:"middle",fillColor:"#c6258f",P:{h:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",j:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",j:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",j:"middle",fillColor:"#ffffff",P:{h:!0,color:"#4c0200",
offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",j:"middle",fillColor:"#ffffff",P:{h:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},Ga:{Xy:20},Id:{backgroundImage:"undefined"!==typeof Ge?Ge:void 0,ax:0,Xu:500,Kl:5E3,Kw:5E3,xt:-1,Uy:12,Ty:100,jf:M(78),Pp:{align:"center"},Em:M(560),Mh:M(400),Nh:{align:"center"},Fg:M(680),Df:M(16),No:M(18),Bj:M(8),zs:M(8),As:M(9),Bs:M(9),Xj:{align:"center",fillColor:"#3B0057",fontSize:M(24)},Yt:{align:"center"},
Zt:M(620),Dm:M(500),Cj:"center",Hg:M(500),Ej:M(60),cc:{align:"center"},Xc:{align:"bottom",offset:M(20)},So:M(806),Qo:500,zw:M(20)},Po:{Cj:"right",Em:M(280),Fg:M(430),Hg:M(340),cc:{align:"right",offset:M(32)},Xc:M(560),So:M(560)},Jp:{yn:M(860),backgroundImage:void 0!==typeof Ge?Ge:void 0,Gv:700,Qs:1800,Ww:700,Ax:2600,Fh:void 0!==typeof Ge?Zd:void 0,Fd:700,oj:{align:"center"},ll:{align:"center"},pj:void 0!==typeof Zd?-Zd.height:0,nj:{align:"top",offset:M(20)},jo:1,Hr:1,ko:1,Ir:1,io:1,Gr:1,Kv:K,Lv:uc,
Iv:K,Jv:K,Hv:K,zx:{align:"center"},gm:M(656),Jj:M(300),em:700,yx:700,lr:M(368),Wk:M(796),dj:M(440),kr:700,Zo:M(36),Nl:M(750),Vw:500,Cj:"center",Hg:M(500),Ej:M(60),cc:{align:"center"},Xc:{align:"bottom",offset:M(20)},So:M(806),Qo:500,zw:M(20)},Kp:{yn:M(0),gm:M(456),Jj:M(320),lr:{align:"center"},Wk:M(346),dj:M(460),Zo:{align:"left",offset:M(32)},Nl:M(528),Cj:"right",Hg:M(340),cc:{align:"right",offset:M(32)},Xc:M(560),So:M(560)},Lh:{qx:{align:"center",offset:M(-230)},gp:{align:"top",offset:M(576)},px:"options",
Qd:{j:"bottom"},Zg:{align:"center"},$c:{align:"top",offset:M(35,"round")},yd:M(232),me:M(98),iz:{align:"center",offset:M(-206)},cq:{align:"top",offset:M(30)},hz:{align:"center",offset:M(206)},bq:{align:"top",offset:M(30)},type:"grid",mx:3,$A:3,nx:5,aB:4,or:!0,tv:!0,so:M(78),Kr:{align:"top",offset:M(140)},Mr:{align:"top",offset:M(140)},Lr:M(20),Qv:M(18),Rv:M(18),nw:{no:{fontSize:N({big:60,small:30}),fillColor:"#3F4F5E",align:"center",j:"middle",P:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:M(6),blur:0}}},
ow:{no:{fontSize:N({big:32,small:16}),fillColor:"#3F4F5E",align:"center",j:"middle",P:{h:!0,color:"#D0D8EA",offsetX:0,offsetY:M(2),blur:0}}},us:M(438),vs:M(438),ls:{align:"center"},ms:{align:"center"},Ds:{align:"center"},Es:{align:"center",offset:M(-22)},ps:{align:"center"},qs:{align:"center",offset:M(-10)},vy:{align:"center",offset:M(216)},Ct:{align:"top",offset:M(574)},uy:{fontSize:N({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Dt:M(10),Ys:{fontSize:N({big:24,small:12}),fillColor:"#3F4F5E",
align:"center"},Zs:{align:"center"},$s:{align:"top",offset:M(588)},Dx:M(160),Cx:M(40),backgroundImage:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,Oy:M(10),Py:200,Ny:M(200),yA:M(600),gx:800,fx:500},ns:{cq:{align:"top",offset:M(20)},bq:{align:"top",offset:M(20)},$c:{align:"top",offset:M(25,"round")},so:M(234),Kr:{align:"top",offset:M(110)},Mr:{align:"top",offset:M(110)},Ct:{align:"top",offset:M(536)},$s:{align:"top",offset:M(550)},gp:{align:"top",offset:M(538)}},Fl:{td:"undefined"!==
typeof De?De:void 0,Us:{align:"center"},Vs:"undefined"!==typeof De?-De.height:void 0,$l:[{type:"y",Pa:0,duration:800,end:{align:"center",offset:M(-142)},mb:uc,Vb:Pf}],lp:[{type:"y",Pa:0,duration:600,end:"undefined"!==typeof De?-De.height:void 0,mb:tc,Nq:!0}],Aq:{align:"center",j:"middle"},Su:{align:"center"},Cq:0,Qi:M(500),Bq:M(80),Pr:{align:"center",j:"middle"},Zv:{align:"center"},Rr:0,uj:M(560),Qr:M(80),Ws:3500},Ko:{$l:[{type:"y",Pa:0,duration:800,end:{align:"center"},mb:uc,Vb:Pf}]},Hz:{td:"undefined"!==
typeof s_overlay_challenge_start?s_overlay_challenge_start:void 0,Us:{align:"center"},Vs:M(56),bm:0,cm:0,Qd:{align:"center",j:"top"},yd:M(500),me:M(100),Zg:{align:"center"},$c:M(90),JA:{align:"center",j:"middle"},OA:M(500),NA:M(80),SA:{align:"center"},TA:M(250),GB:{align:"center",j:"top"},IB:M(500),HB:M(40),JB:{align:"center"},KB:M(348),FB:{align:"center",j:"top"},MB:M(500),LB:M(50),OB:{align:"center"},PB:M(388),xC:{align:"center",j:"top"},zC:M(500),yC:M(40),CC:{align:"center"},DC:M(442),AC:0,BC:0,
wC:{align:"center",j:"top"},FC:M(500),EC:M(50),GC:{align:"center"},HC:M(482),vC:M(10),tC:0,uC:0,Pi:800,on:uc,pn:600,qn:tc,Ws:3500},Gz:{oz:500,Pi:800,XA:1500,YA:500,NB:2500,SB:500,QB:3200,RB:800,EA:4200,FA:300,zz:4500,fB:{align:"center"},gB:M(-800),dB:{align:"center"},eB:M(52),bm:0,cm:0,gl:.8,xr:"#000000",$o:{align:"center",j:"middle"},GA:M(360),BA:M(120),CA:M(4),DA:M(4),HA:{align:"center"},IA:M(340),fC:{align:"center"},gC:M(600),eC:M(500),dC:M(120),cC:{align:"center",j:"middle"},IC:{align:"center",
j:"middle"},MC:M(360),JC:M(60),KC:M(4),LC:M(4),NC:{align:"center"},OC:M(480),mC:M(460),hC:{align:"center"},iC:M(400),Az:{align:"center"},Bz:M(500),VA:{align:"center",j:"middle"},WA:M(75,"round"),UA:M(48),ZA:M(120),RA:M(214,"round"),KA:M(40),LA:M(4),MA:M(4),PA:0,QA:0,Yz:{align:"center",j:"middle"},aA:M(220),$z:M(180),Zz:M(80),Wz:M(4),Xz:M(4)},qa:{am:{In:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,xv:"undefined"!==typeof Fe?Fe:void 0,pw:"undefined"!==typeof s_overlay_level_win?
s_overlay_level_win:void 0,mw:"undefined"!==typeof s_overlay_level_fail?s_overlay_level_fail:void 0},Sy:500,Pi:800,on:uc,pn:800,qn:mc,zc:{align:"center"},dc:0,Qd:{align:"center",j:"middle",fontSize:N({big:26,small:13})},Zg:{align:"center"},$c:M(58),yd:M(500),me:M(100),Hy:{align:"center",j:"middle",fontSize:N({big:56,small:28})},Iy:{align:"center"},Jy:M(236),Mn:{align:"center",j:"top",fontSize:N({big:24,small:12})},sr:{align:"center"},$k:M(144),fj:{align:"center",j:"top",fontSize:N({big:56,small:28})},
cl:{align:"center"},Ch:M(176),bl:M(200),al:M(60),Uj:{align:"center",j:"top",fontSize:N({big:24,small:12})},Lf:{align:"center"},Mf:M(286),Kt:M(0),Er:!1,ke:M(14),ym:M(10),Qg:{align:"center",j:"top",fontSize:N({big:24,small:12})},ai:M(10),bi:M(4),ci:M(200),bC:M(50),Vu:{align:"center",offset:M(12)},xk:M(549),Fv:{align:"center",offset:M(162)},Zn:M(489),Xi:{align:"center",offset:M(250)},mg:M(10),yh:M(90),lg:M(90),Dp:{align:"center",offset:M(-177,"round")},Ep:M(120),Fp:{align:"center"},Gp:M(96),Hp:{align:"center",
offset:M(179,"round")},Ip:M(120),$B:200,qy:500,zt:800,Bt:0,ty:0,sy:300,ry:200,At:300,gl:.8,$b:800,xr:"#000000",Xo:M(508),Gj:M(394),Gs:M(96),Hs:M(74),Ll:3,Oh:400,Lw:2500,AA:0,Ow:M(100),Is:1.5,Tw:{align:"center"},Uw:M(76),Ml:M(180),Sw:M(36),Js:{align:"center",j:"middle",fontSize:N({big:22,small:12}),L:"ff_opensans_extrabold",fillColor:"#1d347f",P:{h:!0,color:"#68cbfa",offsetY:M(2)}},Fs:500,Mw:500,Nw:M(-30),Qw:500,Pw:0,Rw:4E3,Km:600,$y:1500,Pq:500,uh:750,aw:{align:"center"},bw:M(290),Wr:M(350),cx:1E3,
type:{level:{zk:"level",ud:!0,Xh:!0,Yj:"title_level",Nf:"totalScore",wk:"retry",il:"next"},failed:{zk:"failed",ud:!1,Xh:!1,Yj:"title_level",Nt:"subtitle_failed",wk:"exit",il:"retry"},endless:{zk:"endless",ud:!1,Xh:!0,Yj:"title_endless",Nn:"totalScore",Nf:"highScore",wk:"exit",il:"retry"},difficulty:{zk:"difficulty",ud:!1,Xh:!0,Yj:"title_difficulty",Nn:"timeLeft",Nf:["totalScore","timeBonus"],wk:"exit",il:"retry"}}},js:{mg:M(0),$c:M(30),$k:M(114),Ch:M(146),Mf:M(266),xk:M(488),Zn:M(428),Xo:{align:"center",
offset:M(220)},Gj:M(260)},xj:{backgroundImage:"undefined"!==typeof ie?ie:void 0},options:{backgroundImage:Ce,zc:{align:"center"},dc:0,Qd:{},Zg:{align:"center"},$c:M(58),yd:M(500),me:M(100),Hk:M(460,"round"),Gk:{align:"center"},xh:{align:"center",offset:M(36)},Vd:M(10,"round"),Xi:M(510),mg:M(10),yh:M(130),lg:M(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",
["music","sfx"],"moreGames","quit"]},Yl:800,Zl:uc,jp:600,kp:mc,dr:{align:"center"},Pk:M(260),Ok:M(460),En:M(300),br:{align:"center"},Nk:M(460),ar:{align:"center"},Mk:M(560,"round"),Zi:M(460,"round"),lm:{},Rd:"undefined"!==typeof Ee?Ee:void 0,Mm:{align:"center"},lf:M(84,"round"),Sm:{align:"center",j:"top"},Tm:M(480),Tp:M(46),ou:{align:"center"},Um:M(110,"round"),lu:{align:"center"},Qm:M(160,"round"),nu:{align:"center"},Rm:M(446,"round"),Pm:{j:"middle",align:"center",fontSize:N({big:36,small:18})},
ii:M(480),mu:M(160),ku:{align:"center",offset:M(-80,"round")},Om:M(556,"round"),ju:{align:"center",offset:M(80,"round")},Nm:M(556,"round"),ok:{align:"center",j:"top",fillColor:"#3C0058",fontSize:N({big:26,small:13}),Wb:M(6)},pk:M(480),tq:M(50),qk:{align:"center"},mh:M(106,"round"),Mi:{align:"center",j:"top",fillColor:"#3C0058",fontSize:N({big:26,small:13}),Wb:M(6)},ag:M(480),Ni:M(110),nh:{align:"center"},oh:M(396,"round"),Ki:{align:"center"},Li:M(140),kn:{align:"center"},lh:M(500),Ji:M(480),ln:{align:"center",
j:"top",fillColor:"#808080",fontSize:N({big:12,small:8})},wq:{align:"center"},sk:M(610),vq:M(440),uq:M(20),ph:M(200),rk:M(200),yu:M(80),zu:M(140),xu:M(10)},rx:{$c:M(12),xh:{align:"center",offset:M(16)},Pk:M(200),En:M(300),Nk:M(400),Mk:M(500,"round"),lf:M(60,"round"),Um:M(80,"round"),Qm:M(134,"round"),Rm:M(410,"round"),Om:M(500,"round"),Nm:M(500,"round"),mh:M(86,"round"),Li:M(126),oh:M(392,"round"),lh:M(490),sk:M(590)},Rs:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:
Ce,zc:{align:"center"},dc:M(120),Qd:{},Zg:{align:"center"},$c:M(200),Hk:M(460,"round"),Gk:{align:"center"},xh:{align:"center",offset:M(140)},Vd:M(10,"round"),Xi:M(510),mg:M(10),yh:M(130),lg:M(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},Yl:800,Zl:uc,jp:600,kp:mc,lm:{},vB:{align:"center"},wB:M(360),uB:M(460),tB:M(300),pB:"default_text",
qB:{align:"center"},rB:M(630),mB:"default_text",nB:{align:"center"},oB:M(730,"round"),sB:M(460,"round"),cr:{},dr:{align:"center"},Pk:M(200),Ok:M(460),En:M(250),br:{align:"center"},Nk:M(520),ar:{align:"center"},Mk:M(620,"round"),Zi:M(460,"round"),$o:{},Zw:{align:"center"},$w:M(200),ap:M(460),Yw:M(300),Rd:"undefined"!==typeof Ee?Ee:void 0,Mm:{align:"center"},lf:M(0,"round"),Sm:{align:"center",j:"top"},Tm:M(480),Tp:M(50),ou:{align:"center"},Um:M(20,"round"),lu:{align:"center"},Qm:M(70,"round"),nu:{align:"center"},
Rm:M(356,"round"),Pm:{j:"middle",align:"center",fontSize:N({big:36,small:18})},ii:M(480),mu:M(150),ku:M(224,"round"),Om:M(636,"round"),ju:M(350,"round"),Nm:M(636,"round"),ok:{align:"center",j:"top",fillColor:"#3C0058",fontSize:N({big:26,small:13}),Wb:M(6)},pk:M(480),tq:M(50),qk:{align:"center"},mh:M(26,"round"),Mi:{align:"center",j:"top",fillColor:"#3C0058",fontSize:N({big:26,small:13}),Wb:M(6)},ag:M(480),Ni:M(110),nh:{align:"center"},oh:M(316,"round"),Ki:{align:"center"},Li:M(60),kn:{align:"center"},
lh:M(420),Ji:M(480),ln:{align:"center",j:"top",fillColor:"#808080",fontSize:N({big:12,small:8})},wq:{align:"center"},sk:M(530),vq:M(440),uq:M(20),ph:M(200),rk:M(200),yu:M(80),zu:M(100),xu:M(10)},Hn:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:Ce,zc:{align:"center"},dc:M(120),Hk:M(460,"round"),Gk:{align:"center"},xh:{align:"bottom",offset:M(20)},Vd:M(10,"round"),Xi:M(510),mg:M(10),yh:M(130),lg:M(90),Yl:800,Zl:uc,jp:600,kp:mc,ct:{},Px:{align:"center"},Qx:{align:"center",offset:M(40)},
qp:M(460),pp:M(300),Mt:{},Nx:{align:"center"},Ox:{align:"center",offset:M(160)},Mx:M(460),Lx:M(200)},bo:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,Yt:{align:"center"},Zt:M(152),Dm:M(560),Ry:M(560),font:{align:"center",j:"middle",fontSize:N({big:52,small:26}),fillColor:"#FFFFFF"},dv:{align:"center"},Uq:M(600),Tq:M(460),Sq:"default_text"},co:{Uq:M(520)}}}
var bg={Jx:"poki",Sj:{xw:!1,Jn:[]},Ue:{Al:"en-us",vk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},Jq:{show:!1}},cg=cg||{};cg.lj={kl:"a4492e75bdd8fd11878fac5a89a17ed0",tm:"1f6a3ccf1641dd9596430e69b2aa211beea0ba30"};var dg=null;
function eg(){dg={oa:{Rq:250,bv:M(5),el:200,fl:100,Rn:1.3,yr:20,Dv:M(300),zr:700,ex:1E3,Sl:100,Fx:90,Gx:-.5,Kj:200,Hx:100,Ix:1.275},Ca:{el:250,Cv:4,fl:300,Rn:2,Sn:.75},yb:{Vq:M({x:M(56,"round"),y:M(-8,"floor")}),Fw:75,V:[{x:0,y:0,scale:1},{x:-M(55,"round"),y:M(19,"floor"),scale:.8}],scale:1,size:M(10),x:M(275,"round"),y:M(450,"round")},Wd:{Nc:{id:"canvasGame",depth:100,top:M(200,"round"),left:M(46,"round"),width:M(550,"round"),height:M(560,"round")}},Jk:{Nc:{id:"canvasGame",depth:100,top:M(40,"round"),
left:M(304,"round"),width:M(550,"round"),height:M(560,"round")}},kb:{Sn:5},pd:{cv:!1,jv:1,scale:1.5,ny:.5,Sp:200,dz:20},ug:{jl:"Bubbleshooter",ae:"endless"},k:{wz:1.41,ts:14,ra:6,Vx:3},gA:{jl:"Bubbleshooter"},ce:{sv:M(10),Sr:1,lineWidth:M(5),kB:M(5)},U:{$r:5},$e:{bubbles:[0,10,null,null,15,null,null,25,null,null,50,null,null,100,null,null,null,null,null,null,null],lw:2,ky:500,ly:250,st:100},Qy:{kz:void 0,lz:!1,YB:!1,jy:!1},wA:9,Lo:[{name:"level_1",r:{Yc:1,Ve:7,He:40,border:10,ra:6,Md:500,description:"Description of level"},
ca:{speed:M(1.1)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[0,10,10,10,0,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,
0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_2_Cyan",r:{Yc:2,Ve:6,He:50,border:10,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[0,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,35,0,0,0],Jb:null,Kb:null,Lb:null,
Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_3_Colorbombs",r:{Yc:5,Ve:6,He:40,border:10,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[0,10,10,10,10,10,0],Jb:null,
Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:[90,30,0,0,0],Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_4_Pink",
r:{Yc:7,Ve:5,He:60,border:9,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,
1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_5_Blockers",r:{Yc:10,Ve:5,He:40,border:9,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),
Ib:[90,35,0,0,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_6_bombs",r:{Yc:12,Ve:4,He:70,border:8,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),
Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:[90,30,0,0,0],Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},
Ca:{rb:M(100)},U:{fe:3}},{name:"level_7_Fireball",r:{Yc:15,Ve:4,He:40,border:8,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:[90,30,0,0,0],Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,
0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_8_theoretical end",r:{Yc:20,Ve:3,He:80,border:7,ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,
Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:[90,30,0,0,0],Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}},{name:"level_9_impossible",r:{Yc:100,Ve:2,He:90,border:7,
ra:6,Md:500,description:"Description of level"},ca:{speed:M(1.2)},Fe:{vf:"pink red yellow blue cyan green blocker".split(" "),Ib:[10,10,10,10,10,10,0],Jb:null,Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null},ub:{uf:"bubble_in_field bubble_not_in_field bomb colorbomb fireball perfect_bubble".split(" "),Ib:[90,30,0,0,0],Jb:[90,30,0,0,0],Kb:null,Lb:null,Mb:null,Nb:null,Ob:null,Pb:null,Qb:null,Rb:null,we:[0,0,0,0,0,1],xe:[0,0,0,0,0,1],ye:[0,0,0,0,0,1],ze:[0,0,0,0,0,1],Ae:[0,0,0,0,0,1],
Be:[0,0,0,0,0,1],Ce:[0,0,0,0,0,1],De:[0,0,0,0,0,1],Ee:[0,0,0,0,0,1],ve:[0,0,0,0,0,1]},Gc:{Ca:10,kb:10,Ne:10,all:10},kb:{rb:M(100)},Ca:{rb:M(100)},U:{fe:3}}]}}var fg=null;
function gg(){fg={buttons:{bigPlay:"blue",default_color:"blue"},k:{hA:"BubbleShooter"},qa:{dc:12,mg:M(56),fj:{L:of.L,fontSize:M(110),fillColor:"#001689",align:"center",j:"middle"},Mn:{L:of.L,fontSize:M(38),fillColor:"#5560b3",align:"center",j:"middle"},$k:M(166),Ch:M(198),Qg:{L:of.L,fontSize:M(38),fillColor:"#001689",align:"center",j:"middle"},Uj:{L:of.L,fontSize:M(38),fillColor:"#5560b3",align:"center",j:"middle"},Mf:M(298),Qd:{L:of.L,fontSize:M(38),fillColor:"#5560b3",align:"center",j:"middle"},
me:M(38),yd:M(164),$c:M(58),Zn:M(441),xk:M(501),Gj:M(312)},Fl:{Aq:{L:of.L,fontSize:M(24),fillColor:"#001689",align:"center",j:"middle",Wb:M(6)},Qi:M(366),Cq:M(136),Pr:{L:of.L,fontSize:M(48),fillColor:"#001689",align:"center",j:"middle"},uj:M(366),Rr:M(72)},yc:{Si:500},options:{dc:M(12,"round"),Mk:M(502),Nk:M(402),Pk:M(240),lm:{L:of.L,fontSize:M(26),fillColor:"#001689",align:"center",j:"middle"},Qd:{L:of.L,fontSize:M(38),fillColor:"#5560b3",align:"center",j:"middle"},me:M(38),yd:M(164),$c:M(58),lf:M(48,
"round"),Pm:{align:"center",j:"top",fontSize:M(24,"round"),fillColor:"#001689"},Qm:M(156,"round"),Rm:M(372,"round"),Sm:{L:V.L,fontSize:M(36),fillColor:"#5560b3",align:"center",j:"middle"},Um:M(96,"round"),Nm:M(484,"round"),Om:M(484,"round"),xh:{align:"center",offset:M(12)},mh:M(80),Li:M(104),oh:M(348),lh:M(452),sk:M(560)}}}L.i=L.i||{};L.i.Sv=function(){var a=L.wy;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};L.i.tl=function(){L.e.Oc()};L.i.tA=function(){};
L.i.Il=function(){};L.i.Ih=function(){L.e.Oc()};L.i.qA=function(){};L.i.Eo=function(){};L.i.yl=function(){};L.i.xl=function(){};L.i.gw=function(){};L.i.Fo=function(){};L.i.rA=function(){};L.i.Uv=function(){L.e.Oc()};L.i.Vv=function(){L.e.Oc()};L.i.Se=function(){L.e.Oc()};L.i.Tv=function(){L.e.Oc()};L.i.Jr=function(a,b){void 0===L.e.Xe&&(L.e.Xe=new hg(!0));return ig(a,b)};L.i.Up=function(a){void 0===L.e.Xe&&(L.e.Xe=new hg(!0));return jg(a)};L.i.Jd=function(a){window.open(a)};
L.i.qj=function(){return[{b:td,url:L.w.Xr}]};L.i.hw=function(){};L.Bd=L.Bd||{};L.Bd.tl=function(){L.e.ck=!1};L.Bd.Il=function(){};L.Bd.Ih=function(){L.e.ck=!1};L.Bd.Se=function(){L.e.ck=!1};function kg(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}function lg(a,b,c,d){this.Im=this.Dh=a;this.lv=b;this.duration=1;this.$q=d;this.xf=c;this.Ik=null;this.vb=0}function mg(a,b){a.vb+=b;a.vb>a.duration&&a.Ik&&(a.Ik(),a.Ik=null)}
lg.prototype.O=function(){if(this.vb>=this.duration)return this.xf(this.duration,this.Dh,this.Im-this.Dh,this.duration);var a=this.xf(this.vb,this.Dh,this.Im-this.Dh,this.duration);this.$q&&(a=this.$q(a));return a};function ng(a,b){a.Dh=a.O();a.Im=b;a.duration=a.lv;a.Ik=void 0;a.vb=0}L.yv=void 0!==L.environment?L.environment:"development";L.mz=void 0!==L.ga?L.ga:L.yv;"undefined"!==typeof L.mediaUrl?ja(L.mediaUrl):ja(L.size);L.Uu="backButton";L.Bf="languageSet";L.Jf="resizeEvent";
L.version={builder:"1.8.3.0","build-time":"16:52:20","build-date":"30-06-2020",audio:F.sb?"web audio api":F.bb?"html5 audio":"no audio"};L.yz=new function(){this.zf=this.Gw=3;da.q.di&&(this.zf=3>da.Ya.mf?1:4.4>da.Ya.mf?2:3);da.Ya.Dl&&(this.zf=7>da.Ya.mf?2:3);da.Ya.aq&&(this.zf=8>da.Ya.mf?2:3);L.version.browser_name=da.name;L.version.browser_version=da.q.version;L.version.os_version=da.Ya.version;L.version.browser_grade=this.zf};L.a={};"function"===typeof ag&&ag();"function"===typeof eg&&eg();
"function"===typeof gg&&gg();"function"===typeof initGameThemeSettings&&initGameThemeSettings();L.a.u="undefined"!==typeof $f?$f:{};L.a.k="undefined"!==typeof dg?dg:{};L.a.T="undefined"!==typeof fg?fg:{};L.a.iA="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};L.Th=window.publisherSettings;L.w="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof bg&&(L.w=bg);if("undefined"!==typeof cg)for(var og in cg)L.w[og]=cg[og];
(function(){var a,b,c,d,f;L.l={};L.l.oq="undefined"!==typeof O?O:{};L.l.xb=void 0!==L.w.Ue&&void 0!==L.w.Ue.vk?L.w.Ue.vk:L.a.u.Ue.vk;f=[];for(b=0;b<L.l.xb.length;b++)f.push(L.l.xb[b]);if(L.w.Ky)for(b=L.l.xb.length-1;0<=b;b--)0>L.w.Ky.indexOf(L.l.xb[b])&&L.l.xb.splice(b,1);try{if(d=function(){var a,b,c,d,f;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,f=a.length;d<f;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=L.l.xb.length-1;0<=
b;b--)0>c.indexOf(L.l.xb[b])&&L.l.xb.splice(b,1)}catch(h){}0===L.l.xb.length&&(0<f.length?L.l.xb=f:L.l.xb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){f=c[b].toLowerCase();for(d=0;d<L.l.xb.length;d++)if(0<=L.l.xb[d].search(f)){a=L.l.xb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==L.w.Ue&&void 0!==L.w.Ue.Al?L.w.Ue.Al:L.a.u.Ue.Al);L.l.en=0<=L.l.xb.indexOf(a)?a:L.l.xb[0];L.l.jk=L.l.oq[L.l.en];
if(void 0!==L.a.u.rc.language_toggle&&void 0!==L.a.u.rc.language_toggle.aa){a=L.a.u.rc.language_toggle.aa;c=[];for(b=0;b<a.length;b++)0<=L.l.xb.indexOf(a[b].id)&&c.push(a[b]);L.a.u.rc.language_toggle.aa=c}L.l.H=function(a,b){var c,d,f,h;if(void 0!==L.l.jk&&void 0!==L.l.jk[a]){c=L.l.jk[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)f=(f=da.qg.Tt||da.qg.Ls)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],f=f.substring(1,f.length-1),c=c.replace(d[h],f);return c}return b};L.l.it=function(a){L.l.en=
a;L.l.jk=L.l.oq[a];na(L.Bf,a)};L.l.po=function(){return L.l.en};L.l.Mv=function(){return L.l.xb};L.l.jw=function(a){return 0<=L.l.xb.indexOf(a)}})();L.qv={Ya:"",tx:"",cB:"",Gn:""};L.d={};
L.d.createEvent=function(a,b){var c,d,f,h;d=b.detail||{};f=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:f,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,f,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,f,h),c.data=d}return c};L.d.Qp=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
L.d.yj=function(a){function b(){}b.prototype=pg.prototype;a.prototype=new b};L.d.by=function(a,b,c,d,f,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=f;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));L.Wd.push(l);return l};
(function(){var a,b,c,d,f,h,k;L.gs=0;L.hs=0;L.sm=!1;L.ez=da.q.di&&da.q.mf&&4<=da.q.mf;L.dk=!1;L.tu=da.qg.Tt||da.qg.Ls;L.orientation=0<=ba.indexOf("landscape")?"landscape":"portrait";k="landscape"===L.orientation?L.a.u.Jk:L.a.u.Wd;h="landscape"===L.orientation?L.a.k.Jk:L.a.k.Wd;if(void 0!==h){if(void 0!==h.Nc)for(a in h.Nc)k.Nc[a]=h.Nc[a];if(void 0!==h.jd)for(a in h.jd)k.jd[a]=h.jd[a]}b=function(){var a,b,c,d;if(L.ez&&!L.dk){L.dk=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){L.dk=!1;return}b=document.createEvent("Event");b.hB=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var f=c.getContext("2d");try{var h=f.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}f.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(f){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);L.dk=!1},100)}};c=function(){var a,c,d,f,h,C,t,s,v;"landscape"===L.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.Bh,k.ld],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.ld,k.sc],d=k.minHeight);f=c[0]/c[1];h=a[0]/a[1];C=d/c[1];h<f?(h=h<C?Math.floor(a[0]/C):a[1],f=a[0]):(h=a[1],f=Math.floor(a[1]*f));t=h/c[1];!L.tu&&1<t&&(f=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),t=1);a="landscape"===L.orientation?f:h;c="landscape"===L.orientation?h:f;v=s=0;window.innerHeight<Math.floor(k.ld*t)&&(s=Math.max(k.Ol,window.innerHeight-Math.floor(k.ld*t)));window.innerWidth<Math.floor(k.sc*t)&&(v=Math.floor(Math.max(k.Bh-k.sc,(window.innerWidth-Math.floor(k.sc*t))/t)),window.innerWidth<Math.floor(k.sc*t)+v*t&&(v+=Math.floor(Math.max((d-k.Bh)/2,(window.innerWidth-(k.sc*t+v*t))/2/t))));L.Hq=k.ld-k.hr;L.Yu=k.sc-k.Bh;L.ta=s;L.Dz=v;L.Cz=Math.min(L.Yu,-1*L.Ez);L.be=(k.jd.top||
k.og)-L.ta;L.ea={top:-1*s,left:-1*v,height:Math.min(k.ld,Math.round(Math.min(c,window.innerHeight)/t)),width:Math.min(k.sc,Math.round(Math.min(a,window.innerWidth)/t))};L.DB="landscape"===L.orientation?{top:0,left:Math.floor((k.Bh-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.Ol),left:k.ng,width:k.sc,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===L.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var f,h,l,n;f=void 0!==b.top?b.top:k.og;h=void 0!==b.left?b.left:k.ng;l=void 0!==b.width?b.width:k.sc;n=void 0!==b.height?b.height:k.ld;a.Rz=Math.floor(t*f);a.Qz=Math.floor(t*h);a.Sz=Math.floor(t*l);a.Pz=Math.floor(t*
n);!1!==c&&(f+=s);!1!==d&&(h+=v);a.setAttribute("style","position:absolute; left:"+Math.floor(t*h)+"px; top:"+Math.floor(t*f)+"px; width:"+Math.floor(t*l)+"px; height:"+Math.floor(t*n)+"px; z-index: "+b.depth)};d(L.vn,k.Bn);d(L.ao,k.Nc);d(L.mo,k.jd,!1,!0);d(L.de,k.jg);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);na(L.Jf)};a=function(){if(L.gs===window.innerHeight&&L.hs===window.innerWidth||L.sm)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;f=40;L.sm=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,da.q.di?1:0);f--;if((da.q.di?0:window.innerHeight>d)||0>f)L.hs=window.innerWidth,L.gs=window.innerHeight,clearInterval(L.sm),L.sm=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};L.Gd=k.Nc.left||k.ng;L.Hd=k.Nc.top||k.og;L.Sc=k.Nc.width||k.sc;L.mj=k.Nc.height||k.ld;L.Qe=k.jd.left||k.ng;L.be=k.jd.top||k.og;L.kA=k.jd.width||k.sc;
L.jA=k.jd.height||k.ld;L.Bw=k.jg.left||k.ng;L.Cw=k.jg.top||k.og;L.Dw=k.jg.width||k.sc;L.Aw=k.jg.height||k.ld;h=function(a){return L.d.by(a.id,a.depth,void 0!==a.top?a.top:k.og,void 0!==a.left?a.left:k.ng,void 0!==a.width?a.width:k.sc,void 0!==a.height?a.height:k.ld)};L.Wd=[];L.vn=h(k.Bn);L.ao=h(k.Nc);L.mo=h(k.jd);L.de=h(k.jg);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);L.Vc={};L.Vc[L.wg]=L.vn;L.Vc[L.yf]=L.ao;L.Vc[L.ol]=L.mo;L.Vc[L.Eh]=L.de;L.Vc[L.vg]=L.vn;L.Vc[L.Jc]=L.de;L.Vc[L.Pe]=L.de})();
L.d.Ou=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ka.pf+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),L.$u=!0,L.Ti=!0,b=function(a){L.$u&&L.Ti&&(L.i.Jd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){L.Ti&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){L.Ti&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};L.d.XB=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";L.Ti=!0}};
L.d.pA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";L.Ti=!1}};L.d.oo=function(a){return a===L.ao?{x:L.Gd,y:L.Hd}:a===L.mo?{x:L.Qe,y:L.be}:{x:L.Bw,y:L.Cw}};L.d.xg=function(a){return L.Vc[a]};L.d.ia=function(a){return L.Vc[a]?(m.canvas!==L.Vc[a]&&m.ia(L.Vc[a]),!0):!1};L.d.Ma=function(a,b){if(L.Vc[b]){var c=H;a.Sa!==b&&(c.Hi=!0);a.Sa=b;a.canvas=L.Vc[b]}};
L.d.g=function(a,b,c,d){var f;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(f=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+f;case "left":case "top":return f-d;case "right":case "bottom":return b-c-f-d;default:return f+0}return 0};
L.d.Da=function(a,b,c,d){var f;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(f=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+f:"left"===d||"top"===d?Math.round(b/2-c/2)+f:Math.round(b/2+c/2)-f;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+f:"left"===d||"top"===d?f:c+f;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-f:"left"===d||"top"===d?b-Math.round(c/2)-f:b-f;default:return f+
0}return 0};L.d.Jz=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};L.la=L.la||{};L.la.ey=!1;L.la.bs=function(a){a instanceof Array&&(this.kl=a[0],this.tm=a[1],this.av="https://api.gameanalytics.com/v2/"+this.kl,this.cs=!0)};
L.la.Yf=function(a,b){var c,d=JSON.stringify(b),f=window.Crypto.HmacSHA256(d,this.tm),f=window.Crypto.enc.Base64.stringify(f),h=this.av+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.ey&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",f),c.send(d)}catch(k){}};
L.la.Bc={iq:"user",hq:"session_end",Cu:"business",Du:"resource",mi:"progression",Zm:"design",ERROR:"error"};L.la.Uf=function(){return{user_id:this.Zp,session_id:this.ay,build:this.fv,device:this.Gn,platform:this.platform,os_version:this.ux,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
L.la.xc=function(a,b,c,d,f,h,k){this.ay=a;h&&"object"===typeof h&&(this.Zp=h.Zp);this.fv=f;this.h=!0;this.cs&&(this.Gn=k.Gn,this.platform=k.Ya,this.ux=k.tx);this.Yf("init",this.Uf())};L.la.By=function(a){var b=this.Uf(),c=[];b.category=a;c.push(b);this.Yf("events",c)};L.la.On=function(a,b,c,d){a=[];b=this.Uf();b.length=Math.floor(c);b.category=d;a.push(b);this.Yf("events",a)};
L.la.$a=function(a,b,c,d){var f=[],h=!1;if(this.h&&this.cs){if(d)switch(d){case L.la.Bc.iq:this.By(d);h=!0;break;case L.la.Bc.hq:this.On(0,0,c,d);h=!0;break;case L.la.Bc.Cu:h=!0;break;case L.la.Bc.Du:h=!0;break;case L.la.Bc.mi:this.Bv(a,b,c,d);h=!0;break;case L.la.Bc.Zm:this.zv(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.Uf(),b.event_id=d+":"+a,b.value=c,f.push(b),this.Yf("design",f))}};L.la.BB=function(a,b,c){this.$a(a,b,c)};L.la.cA=function(){};
L.la.dA=function(){};L.la.Bv=function(a,b,c,d){var f=[],h=this.Uf();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}f.push(h);this.Yf("events",f)};L.la.zv=function(a,b,c,d){var f=[],h=this.Uf();h.category=d;h.event_id=a+b;h.value=c;f.push(h);this.Yf("events",f)};L.la.dt=function(a,b){var c=[],d=this.Uf();d.category="error";d.message=a;d.severity=b;c.push(d);this.Yf("events",c)};
function qg(){this.Sa=this.depth=0;this.visible=!1;this.h=!0;this.a=L.a.u.Ga;this.Ex=this.a.Xy;I(this);Sb(this,"system")}function rg(){var a=sg("userId","");""===a&&(a=tg(),ug("userId",a));return a}function tg(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=qg.prototype;e.start=function(a){L.la.bs(a);L.la.xc(tg(),L.a.k.ug.jl,L.a.T.id,L.w.Jx,vg(),{Zp:rg()},L.qv)};e.$a=function(a,b,c,d){L.la.$a(a,b,c,d)};
function wg(a,b,c,d){var f,h;for(f=0;f<a.ja.length;f++)void 0!==a.ja[f]&&a.ja[f].tag===b&&(h=a.ja[f],a.$a(c,d,h.m/1E3,L.la.Bc.hq),h.h=!1)}function xg(){var a=L.Ga,b=L.e.Rf,c;for(c=0;c<a.ja.length;c++)void 0!==a.ja[c]&&a.ja[c].tag===b&&(a.ja[c].paused+=1)}e.dt=function(a,b){L.la.dt(a,b)};e.bc=function(){this.ja=[]};
e.X=function(a){var b,c=0;for(b=0;b<this.ja.length;b++)this.ja[b].h&&(0===this.ja[b].paused&&(this.ja[b].m+=a),c=b);c<this.ja.length-1&&(a=this.ja.length-Math.max(this.Ex,c+1),0<a&&this.ja.splice(this.ja.length-a,a))};
function hg(a,b,c){this.Cs=a||!1;this.host=b||"http://localhost:8080";this.$x=c||this.host+"/services/storage/gamestate";this.Pt="undefined"!==typeof window.localStorage;this.Go=this.Xp=!1;var d=this;window.parent!==window&&(da.q.wp||da.Ya.Dl)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.Xp="ok"===a.result:"getItem"===b&&d.pl&&("ok"===a.result?d.pl(a.value):d.pl(a.defaultValue))},!1),this.pl=null,window.parent.postMessage({command:"init"},"*"));this.Hj=[];
window.setTimeout(function(){d.Go=!0;for(var a=0;a<d.Hj.length;++a)d.Hj[a]();d.Hj=[]},2E3)}function yg(){return"string"===typeof L.w.Lt&&""!==L.w.Lt?L.w.Lt:void 0!==L.a.k.ug&&void 0!==L.a.k.ug.jl?L.a.k.ug.jl:"0"}function ig(a,b){var c=L.e.Xe;"function"===typeof b&&(c.Go?zg(c,a,b):c.Hj.push(function(){zg(c,a,b)}))}function jg(a){var b=L.e.Xe;b.Go?Ag(b,a):b.Hj.push(function(){Ag(b,a)})}
function Ag(a,b){var c=null,d=yg();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(f){}if(a.Xp)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.Pt)try{window.localStorage.setItem(d,c)}catch(h){}a.Cs||(c=new vb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),wb(c,a.$x+"/my_ip/"+d))}}
function zg(a,b,c){var d=null,f=null,h=yg();if(a.Xp)a.pl=function(a){var f;try{d=JSON.parse(a),f=JSON.parse(d.gameState)}catch(h){f=b}c(f)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.Pt)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.Cs||(a=new vb("gameState_"+h),f=null,xb(a,hg.xB+"/my_ip/"+h)&&(f=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(f&&Date.parse(f.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(f.gameState));return}c(JSON.parse(d.gameState));
return}if(f){c(JSON.parse(f.gameState));return}}catch(l){c(b);return}c(b)}}
function Bg(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.qd=this.visible=!1!==c;this.h=!0;L.d.Ma(this,L.Jc);var d;this.a=L.a.u.Id;if("landscape"===L.orientation&&L.a.u.Po)for(d in L.a.u.Po)this.a[d]=L.a.u.Po[d];for(d in L.a.T.Id)this.a[d]=L.a.T.Id[d];if(L.w.Id)for(d in L.w.Id)this.a[d]=L.w.Id[d];this.jb=a;this.Xq=b;this.mr=!1;this.Ri=0;this.wn=!1;this.yk=0;this.Si=
this.a.Xu;this.rp=!0;this.ww=.6/Math.log(this.a.Kl+1);this.Au=void 0!==L.w.vw?L.w.vw:this.a.ax;this.Hw=this.Au+this.a.Kw;I(this)}e=Bg.prototype;e.Ap=function(a){var b;L.d.ia(L.vg);sa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=V.K();(L.w.Id&&L.w.Id.Xj||this.a.Xj)&&z(b,L.w.Id&&L.w.Id.Xj?L.w.Id.Xj:this.a.Xj);a=L.l.H(a,"<"+a.toUpperCase()+">");b.o(a,this.canvas.width/2,this.canvas.height/2,this.a.Dm);this.error=!0;this.visible=this.qd=!1;this.canvas.Z=!0};
e.Ye=function(){this.xa&&(this.cc=L.d.g(this.a.cc,L.ea.width,this.xa.width)+L.ea.left,this.Xc=L.d.g(this.a.Xc,L.ea.height,this.xa.height)+L.ea.top)};
e.Fn=function(){var a,b,c,d,f,h;if("function"===typeof L.i.qj&&(h=this.a.Hg,(this.La=L.i.qj())&&0<this.La.length)){this.xa?this.xa.clear():this.xa=new r(this.a.Hg,this.a.Ej);w(this.xa);h/=this.La.length;for(c=0;c<this.La.length;c++)try{f=this.La[c].b,d=Math.min(1,Math.min((h-20)/f.width,this.a.Ej/f.height)),a="center"===this.a.Cj?h*c+Math.round((h-f.width*d)/2):h*c+Math.round(h-f.width*d)-10,b=this.xa.height-f.height*d,f instanceof p?f.R(0,a,b,d,d,0,1):m.context.drawImage(f,a,b,f.width*d,f.height*
d)}catch(k){}y(this.xa);this.Jl=0;this.Ro=!0;this.Dj=0;this.Gg=Yb(0,0,this.xa.width,this.xa.height);this.Ye()}};
e.Ra=function(){var a,b,c,d;this.rp?m.clear():L.d.ia(L.vg);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(L.ta),1<d.F){c=(m.canvas.height-a)/d.zh;b=-(d.Yi*c-m.canvas.width)/2;c=m.context;var f=c.globalAlpha,h,k,l;c.globalAlpha=this.Ri;for(h=0;h<d.F;h+=1)k=b+h%d.Qh*d.width,l=a+d.height*Math.floor(h/d.Qh),d.hf.Ea(d.Of[h],d.Pf[h],d.Qf[h],d.df[h],d.cf[h],k-d.cb+d.ef[h],l-d.Wa+d.ff[h]);c.globalAlpha=f}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof p?d.R(0,b,a,c,c,0,this.Ri):d instanceof r&&d.R(b,a,c,c,0,this.Ri);d=this.a.Df+this.a.No+this.a.Mh;b=Hc.height;a=Hc.width-(this.a.Df+this.a.No);this.Nh=L.d.g(this.a.Nh,m.canvas.width,d);this.Fg=L.d.g(this.a.Fg,m.canvas.height,b);Hc.Ea(0,0,0,this.a.Df,b,this.Nh,this.Fg,1);Hc.Yk(0,this.a.Df,0,a,b,this.Nh+this.a.Df,this.Fg,this.a.Mh,b,1);Hc.Ea(0,this.a.Df+a,0,this.a.No,b,this.Nh+this.a.Df+this.a.Mh,this.Fg,1)};
function Cg(a){a.rp&&(a.wn=!0);a.visible&&(a.Ra(),a.Fn(),"function"===typeof L.i.ro&&(a.bf=L.i.ro(),a.bf instanceof r&&(a.Yh=!0,a.vt=Math.floor((a.canvas.width-a.bf.width)/2),a.wt=Math.floor((a.canvas.height-a.bf.height)/2))));L.e.Hl&&ka.je("audio");L.e.Gl&&ka.je("audio_music");ka.je("fonts")}
e.bc=function(){var a,b=!1;if(void 0!==L.w.Sj)if(!1===L.w.Sj.xw)b=!0;else{if(void 0!==L.w.Sj.Jn)for(a=0;a<L.w.Sj.Jn.length;a++){var c;a:{c=L.w.Sj.Jn[a];var d=void 0,f=void 0,h=d=void 0,f=void 0,f=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===f.indexOf("file://")&&c===Dg("file://"))c=!0;else{f=f.split(".");d=f.shift().split("://");d[0]+="://";f=d.concat(f);h="";for(d=f.length-1;0<=d;d--)if(h=f[d]+(0<d&&d<f.length-1?".":"")+h,Dg(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof L.w.Vy&&(new Date).getTime()>L.w.Vy&&(b=!1);b?(this.wh=[],this.error=!1,this.au=this.Xn=this.uk=this.m=0,this.ready=this.Yh=!1,this.tw=void 0!==this.a.As?this.a.As:this.a.Df-this.a.Bj,this.uw=void 0!==this.a.Bs?this.a.Bs:Math.floor((Hc.height-Je.height)/2),this.Oo=Je.width-(this.a.Bj+this.a.zs),this.Wn=this.Os=this.Dq=!1,(this.Tj=ka.complete("start"))&&Cg(this),this.ys=ka.complete("load"),this.visible&&(this.bu=document.getElementById("throbber_image"),
this.jf=this.a.jf,this.Pp=L.d.g(this.a.Pp,this.canvas.width,this.jf),this.Em=L.d.g(this.a.Em,this.canvas.height,this.jf))):H.pause()};
e.X=function(a){this.m+=a;"function"===typeof L.i.ro&&void 0===this.bf&&(this.bf=L.i.ro(),this.bf instanceof r&&(this.Yh=!0,this.vt=Math.floor((this.canvas.width-this.bf.width)/2),this.wt=Math.floor((this.canvas.height-this.bf.height)/2)));this.Yh&&0<=this.a.xt&&this.m>=this.a.xt&&(this.Yh=!1);this.wn&&(this.yk+=a,this.yk>=this.Si?(this.wn=!1,this.Ri=1):this.Ri=mc(this.yk,0,1,this.Si));this.Tj&&(this.uk+=a,this.Xn+=a);this.au=Math.round(this.m/this.a.Ty%(this.a.Uy-1));this.Ro&&(this.Jl=0+this.Dj/
this.a.Qo*1,this.Dj+=a,this.Dj>=this.a.Qo&&(this.Ro=!1,this.Jl=1));"function"===typeof this.Xq&&this.Xq(Math.round((la("load")+la("audio")+la("audio_music"))/2));!this.ready&&this.ys&&(this.Wn||this.Xn>=this.a.Kl)&&(!L.e.Hl||this.Dq||F.bb&&this.uk>=this.a.Kl)&&(!L.e.Gl||this.Os||F.bb&&this.uk>=this.a.Kl)&&(this.ready=!0);if(a=!this.mr&&!this.error&&this.ready&&this.m>=this.Au)a=L.e,a=(a.Dd&&a.kc&&!a.kc.iw()?!1:!0)||this.m>=this.Hw;a&&(this.mr=!0,this.jb())};
e.Jh=function(a,b,c){!this.Yh&&this.Gg&&ec(this.Gg,this.cc,this.Xc,b,c)&&(this.Db=Math.floor((b-this.cc)/(this.xa.width/this.La.length)))};e.Kh=function(a,b,c){void 0!==this.Db&&(this.La[this.Db].url||this.La[this.Db].action)&&ec(this.Gg,this.cc,this.Xc,b,c)&&(b-=this.cc,b>=this.xa.width/this.La.length*this.Db&&b<this.xa.width/this.La.length*(this.Db+1)&&(this.La[this.Db].url?L.i.Jd(this.La[this.Db].url):this.La[this.Db].action()));this.Db=void 0};
e.Tc=function(a,b){"Load Complete"===a&&"start"===b.qb?(this.Tj=!0,Cg(this)):"Load Complete"===a&&"load"===b.qb?this.ys=!0:"Load Complete"===a&&"audio"===b.qb?this.Dq=!0:"Load Complete"===a&&"audio_music"===b.qb?this.Os=!0:"Load Complete"===a&&"fonts"===b.qb&&(this.Wn=!0);a===L.Jf&&this.Ye()};
e.pa=function(){if(!this.error){this.rp&&this.Tj?this.Ra():m.clear();try{this.bu&&m.context.drawImage(this.bu,this.jf*this.au,0,this.jf,this.jf,this.Pp,this.Em,this.jf,this.jf)}catch(a){}if(this.Tj){var b=0,c=this.Nh+this.tw,d=this.Fg+this.uw,f=Je.height;Je.Ea(0,b,0,this.a.Bj,f,c,d,1);b+=this.a.Bj;c+=this.a.Bj;this.ready?(Je.Yk(0,b,0,this.Oo,f,c,d,this.a.Mh,f,1),b+=this.Oo,c+=this.a.Mh,Je.Ea(0,b,0,this.a.zs,f,c,d,1)):Je.Yk(0,b,0,this.Oo,f,c,d,Math.floor(Math.min((la("load")+la("audio"))/500+this.ww*
Math.log(this.m+1),1)*this.a.Mh),f,1);this.xa&&this.xa.md(this.cc,this.Xc,this.Jl)}this.Yh&&this.bf.o(this.vt,this.wt)}};
function Eg(){var a,b;b=this;this.depth=100;this.h=this.visible=!0;L.d.Ma(this,L.Jc);this.a=L.a.u.Jp;if("landscape"===L.orientation&&L.a.u.Kp)for(a in L.a.u.Kp)this.a[a]=L.a.u.Kp[a];this.rc=L.a.u.rc;if("landscape"===L.orientation&&L.a.u.An)for(a in L.a.u.An)this.rc[a]=L.a.u.An[a];for(a in L.a.T.Jp)this.a[a]=L.a.T.Jp[a];this.wh=[];a=Fg(L.e);this.Yq=void 0!==a&&null!==a;this.Va=new fc;this.Va.Y(this.a.Gv,function(){b.Ft.call(b)});this.Va.Y(this.a.Qs,function(){b.It.call(b)});this.Va.Y(L.n.vm&&!this.Yq?
this.a.Ax:this.a.Qs,function(){b.Jt.call(b)});this.Va.Y(this.a.Ww,function(){b.Ht.call(b)});I(this,!1)}e=Eg.prototype;e.Ft=function(){this.ml=!0;this.a.Fh&&(this.oj=L.d.g(this.a.oj,this.canvas.width,Zd.width),this.ll=L.d.g(this.a.ll,this.canvas.width,Zd.width),this.pj=L.d.g(this.a.pj,this.canvas.height,Zd.height),this.nj=L.d.g(this.a.nj,this.canvas.height,Zd.height),this.lo=this.oj,this.nl=this.pj,this.fo=this.a.jo,this.ho=this.a.ko,this.eo=this.a.io,this.Rc=0,this.Ye())};
e.It=function(a){function b(a,b,c,d){return sc(a,b,c,d,3,15)}var c,d;L.n.vm&&!this.Yq&&(c=L.d.g(this.a.lr,this.canvas.width,this.a.dj,Math.floor(this.a.dj/2)),d=L.d.g(this.a.Wk,this.canvas.height,we.height,Math.floor(we.height/2)),c=new Gg("difficulty_toggle",c,d,this.depth-20,Hg()+"",this.a.dj,{da:function(a){Ig(parseInt(a,10));return!0},wc:!0}),c.Kd=Math.floor(this.a.dj/2),c.Ld=Math.floor(we.height/2),!1!==a&&(Jg(c,"xScale",b,0,1,this.a.kr),Jg(c,"yScale",b,0,1,this.a.kr)),this.Vk=c,this.Wk=c.y,
this.wh.push(c),this.Ye())};
e.Jt=function(a){function b(a,b,c,d){return sc(a,b,c,d,3,15)}var c,d=this;this.op=!0;c=new Kg("bigPlay",L.d.g(this.a.zx,this.canvas.width,this.a.Jj,Math.floor(this.a.Jj/2)),L.d.g(this.a.gm,this.canvas.height,Be.height,Math.floor(Be.height/2)),this.depth-20,"startScreenPlay",this.a.Jj,{da:function(){J(H,d);Lg(L.e);return!0},wc:!0});c.Kd=Math.floor(this.a.Jj/2);c.Ld=Math.floor(Be.height/2);!1!==a?(Jg(c,"xScale",b,0,1,this.a.em),Jg(c,"yScale",b,0,1,this.a.em),this.fm=0):this.fm=this.a.em;this.dm=c;this.gm=
c.y;this.wh.push(c);this.Ye()};function Mg(a){var b=wc([uc,function(a,b,f,h){return sc(a,b,f,h,3,2)},ic],[!0,!1,!1],[.02,.1,.88]);a.Xs=!0;Jg(a.dm,"xScale",vc(b),1,.25,4E3);Jg(a.dm,"yScale",vc(b),1,-.1,4E3)}e.Ht=function(a){var b;this.Ks=!0;b=new pg(L.d.g(this.a.Zo,this.canvas.width,se.width),L.d.g(this.a.Nl,this.canvas.height,se.height),this.depth-20,new $b(se),[se],{da:L.e.af,wc:!0});!1!==a&&Jg(b,"alpha",K,0,1,this.a.Vw);this.Yo=b;this.Nl=b.y;this.wh.push(b);this.Ye()};
e.Ra=function(){var a,b,c,d;if(a=this.a.backgroundImage)L.d.ia(L.vg),c=Math.abs(L.ta),1<a.F?(b=(m.canvas.height-c)/a.zh,d=-(a.Yi*b-m.canvas.width)/2,wa(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.R(0,d,c,b,b,0,1))};
e.Fn=function(){var a,b,c,d,f,h;if("function"===typeof L.i.qj&&(h=this.a.Hg,(this.La=L.i.qj())&&0<this.La.length)){this.xa?this.xa.clear():this.xa=new r(this.a.Hg,this.a.Ej);w(this.xa);h/=this.La.length;for(c in this.La)try{f=this.La[c].b,d=Math.min(1,Math.min((h-20)/f.width,this.a.Ej/f.height)),a="center"===this.a.Cj?h*c+Math.round((h-f.width*d)/2):h*c+Math.round(h-f.width*d)-10,b=this.xa.height-f.height*d,f instanceof p?f.R(0,a,b,d,d,0,1):m.context.drawImage(f,a,b,f.width*d,f.height*d)}catch(k){}y(this.xa);
this.Jl=0;this.Ro=!0;this.Dj=0;this.Gg=Yb(0,0,this.xa.width,this.xa.height);this.Ye()}};e.Ye=function(){var a;a=0;L.ea.height<this.a.yn&&(a=this.a.yn-L.ea.height);this.op&&(this.dm.y=this.gm-a);this.Ks&&(this.Yo.y=this.Nl-a,this.Yo.x=L.d.g(this.a.Zo,L.ea.width,se.width)+L.ea.left);this.Vk&&(this.Vk.y=this.Wk-a);this.ml&&this.Rc>=this.a.Fd&&(this.nl=this.nj-L.ta);this.xa&&(this.cc=L.d.g(this.a.cc,L.ea.width,this.xa.width)+L.ea.left,this.Xc=L.d.g(this.a.Xc,L.ea.height,this.xa.height)+L.ea.top)};
e.bc=function(){this.Ra();this.a.Fh&&(L.d.ia(L.Jc),this.a.Fh.o(0,0,-this.a.Fh.height-10));this.Fn();this.Va.start()};e.ob=function(){var a;for(a=0;a<this.wh.length;a++)J(H,this.wh[a])};
e.X=function(a){this.canvas.Z=!0;this.ml&&this.Rc<this.a.Fd&&(this.lo=this.a.Kv(this.Rc,this.oj,this.ll-this.oj,this.a.Fd),this.nl=this.a.Lv(this.Rc,this.pj,this.nj-this.pj,this.a.Fd)-L.ta,this.fo=this.a.Iv(this.Rc,this.a.jo,this.a.Hr-this.a.jo,this.a.Fd),this.ho=this.a.Jv(this.Rc,this.a.ko,this.a.Ir-this.a.ko,this.a.Fd),this.eo=this.a.Hv(this.Rc,this.a.io,this.a.Gr-this.a.io,this.a.Fd),this.Rc+=a,this.Rc>=this.a.Fd&&(this.lo=this.ll,this.nl=this.nj-L.ta,this.fo=this.a.Hr,this.ho=this.a.Ir,this.eo=
this.a.Gr));this.op&&(!this.Xs&&this.fm>=this.a.em+this.a.yx&&Mg(this),this.fm+=a)};e.Jh=function(a,b,c){this.Gg&&ec(this.Gg,this.cc,this.Xc,b,c)&&(this.Db=Math.floor((b-this.cc)/(this.xa.width/this.La.length)))};
e.Kh=function(a,b,c){void 0!==this.Db&&(this.La[this.Db].url||this.La[this.Db].action)&&ec(this.Gg,this.cc,this.Xc,b,c)&&(b-=this.cc,b>=this.xa.width/this.La.length*this.Db&&b<this.xa.width/this.La.length*(this.Db+1)&&(this.La[this.Db].url?L.i.Jd(this.La[this.Db].url):this.La[this.Db].action()));this.Db=void 0};e.Bb=function(){this.zb=!0};
e.Cb=function(){this.zb&&(this.Va.stop(),this.ml?this.Rc<this.a.Fd&&(this.Rc=this.a.Fd-1):(this.Ft(),this.Rc=this.a.Fd-1),this.Vk?Ng(this.Vk):this.It(!1),this.Ks?Ng(this.Yo):this.Ht(!1),this.op?(Ng(this.dm),this.Xs&&Mg(this)):this.Jt(!1),this.zb=!1)};e.Tc=function(a){a===L.Jf&&(this.Ra(),this.Ye())};e.pa=function(){this.ml&&this.a.Fh&&this.a.Fh.R(0,this.lo,this.nl,this.fo,this.ho,0,this.eo);this.xa&&this.xa.o(this.cc,this.Xc);this.qd=!1};
function Og(){this.depth=100;this.h=this.visible=!0;L.d.Ma(this,L.Jc);var a;this.a=L.a.u.Lh;if("landscape"===L.orientation)for(a in L.a.u.ns)this.a[a]=L.a.u.ns[a];this.Ja=L.a.k.xA;if(L.a.k.Lh)for(a in L.a.k.Lh)this.a[a]=L.a.k.Lh[a];this.Hc=L.a.u.rc;for(var b in L.a.T.Lh)this.a[b]=L.a.T.Lh[b];this.Eg=-1;this.Ua=0;this.Lo=[];I(this)}e=Og.prototype;
e.Ra=function(){var a,b,c,d;L.d.ia(L.vg);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(L.ta),1<a.F?(b=(m.canvas.height-c)/a.zh,d=-(a.Yi*b-m.canvas.width)/2,wa(a,d,c)):(b=(m.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.R(0,d,c,b,b,0,1));var f;b=L.a.u.qa.type[L.n.ae].ud;L.a.k.qa&&L.a.k.qa.type&&L.a.k.qa.type[L.n.ae]&&L.a.k.qa.type[L.n.ae]&&(b=!1===L.a.k.qa.type[L.n.ae].ud?!1:b);void 0!==this.Ja&&void 0!==this.Ja.ud&&(b=this.Ja.ud);c=L.d.g(this.a.vy,
this.canvas.width,Nc.width);a=L.d.g(this.a.Ct,L.ea.height,Nc.height)+L.ea.top;b&&(Nc.o(0,c,a),b=V.K(),z(b,this.a.uy),D(b,"center"),b.o(this.M+" / "+this.Rp,c+Math.floor(Nc.width/2),a+Nc.height+this.a.Dt));if(void 0!==this.Ja&&void 0!==this.Ja.hy?this.Ja.hy:1)b=V.K(),void 0!==this.a.Bx?z(b,this.a.Bx):z(b,this.a.Ys),c=L.l.H("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Wa(b,c,this.a.Dx,this.a.Cx),d<b.fontSize&&A(b,d),d=L.d.Da(this.a.Zs,this.canvas.width,b.$(c),b.align),f=L.d.Da(this.a.$s,L.ea.height,
b.W(c),b.j)+L.ea.top,b.o(c,d,f),c=""+this.im,z(b,this.a.Ys),d=L.d.Da(this.a.Zs,this.canvas.width,b.$(c),b.align),b.o(c,d,a+Nc.height+this.a.Dt)};
function Pg(a){if("grid"===a.a.type){w(a.Aj);m.clear();a.Dg=[];var b;b=function(b,d,f){var h,k,l,n,q,u,B,C,t,s,v,x,U,za,$,pa,Ra,ib,fe,Bc,ke,kc,Vf;k=L.n.ma[b];fe=a.mc?a.a.Qv:a.a.Rv;Bc=a.a.so;ke=fe;if(a.a.iv)h=a.a.iv[b];else{ib=a.mc?a.a.mx:a.a.nx;for(kc=Math.floor(k/ib);1<Math.abs(kc-ib);)ib-=1,kc=Math.floor(k/ib);for(h=[];0<k;)h.push(Math.min(ib,k)),k-=ib}kc=h.length;Ra=Math.round(((a.mc?a.a.us:a.a.vs)-(kc+1)*fe)/kc);Vf=a.a.gv?a.a.gv:!1;if(!Vf){ib=1;for(k=0;k<kc;k++)ib=Math.max(h[k],ib);pa=Math.round((a.canvas.width-
2*Bc)/ib)}for(k=n=0;k<kc;k++){ib=h[k];Vf&&(pa=Math.round((a.canvas.width-2*Bc)/ib));for(l=0;l<ib;l++){t=a.a.or;U=a.a.tv;v=L.n.bj||"locked";x=0;q=Qg(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(v=q.state),"object"===typeof q.stats&&null!==q.stats&&(x=q.stats.stars||0));za="locked"===v;"function"===typeof L.k.Nv&&(u=L.k.Nv(Rg(L.e,b,n),b,n,v))&&(U=za=t=!1);q=Bc+d;C=ke;$=s=1;if(!1!==U){B=a.mc?Ic:Oc;if("played"===v)switch(x){case 1:B=a.mc?Jc:Pc;break;case 2:B=a.mc?Kc:Qc;break;
case 3:B=a.mc?Lc:Rc}else a.mc||"locked"!==v||(B=Uc);B.width>pa&&($=pa/B.width);B.height>Ra&&($=Math.min(s,Ra/B.height));q+=Math.round((pa-B.width*$)/2);C+=Math.round((Ra-B.height*$)/2);B.R(0,q,C,$,$,0,1);f&&(a.Dg[n]={x:q,y:C})}u&&(u.width>pa&&(s=pa/u.width),u.height>Ra&&(s=Math.min(s,Ra/u.height)),void 0!==B?(x=L.d.g(a.a.ls,B.width*$,u.width*s),U=L.d.g(a.a.ms,B.height*$,u.height*s)):(x=L.d.g(a.a.ls,pa,u.width*s),U=L.d.g(a.a.ms,Ra,u.height*s),f&&(a.Dg[n]={x:q+x,y:C+U})),u instanceof r?u.R(q+x,C+U,
s,s,0,1):u.R(0,q+x,C+U,s,s,0,1));!1===t||za||(t=""+(L.n.ki?n+1:Rg(L.e,b,n)+1),s=a.fonts.no,"locked"===v&&void 0!==a.fonts.yw?s=a.fonts.yw:"unlocked"===v&&void 0!==a.fonts.cz?s=a.fonts.cz:"played"===v&&void 0!==a.fonts.played&&(s=a.fonts.played),void 0!==B?(x=L.d.Da(a.a.ps,B.width*$,s.$(t),s.align),U=L.d.Da(a.a.qs,B.height*$,s.W(t),s.j)):(x=L.d.Da(a.a.ps,pa,s.$(t),s.align),U=L.d.Da(a.a.qs,Ra,s.W(t),s.j)),s.o(t,q+x,C+U));a.mc&&za&&(void 0!==B?(x=L.d.g(a.a.Ds,B.width*$,Mc.width),U=L.d.g(a.a.Es,B.height*
$,Mc.height)):(x=L.d.g(a.a.Ds,pa,Mc.width),U=L.d.g(a.a.Es,Ra,Mc.height)),Mc.o(0,q+x,C+U));Bc+=pa;n++}Bc=a.a.so;ke+=Ra+fe}};a.tj&&b(a.C-1,0);b(a.C,a.canvas.width,!0);a.sj&&b(a.C+1,2*a.canvas.width);y(a.Aj)}}function Sg(a,b){switch(b-a.C){case 0:a.bp=0;break;case 1:a.bp=-a.canvas.width;break;case -1:a.bp=a.canvas.width}a.We=!0;a.Rl=0;a.moveStart=a.Ua;a.Ms=a.bp-a.Ua;a.Ql=Math.min(a.a.gx-a.fi,Math.round(Math.abs(a.Ms)/(a.zm/1E3)));a.Ql=Math.max(a.a.fx,a.Ql)}
function Tg(a){if(1<L.n.ma.length){var b,c;b=L.d.g(a.a.iz,a.canvas.width,Tc.width);c=L.d.g(a.a.cq,L.ea.height,Tc.height)+L.ea.top;a.Hf=new pg(b,c,a.depth-20,new $b(Tc),[Tc],function(){a.le="previous";Sg(a,a.C-1);return!0});b=L.d.g(a.a.hz,a.canvas.width,Sc.width);c=L.d.g(a.a.bq,L.ea.height,Sc.height)+L.ea.top;a.Ff=new pg(b,c,a.depth-20,new $b(Sc),[Sc],function(){a.le="next";Sg(a,a.C+1);return!0});Ug(a)}else a.Cf-=a.a.Lr}
function Ug(a){if(1<L.n.ma.length){var b;a.tj?(b=[Tc],a.Hf.Ab=!0):(b=[new r(Tc.width,Tc.height)],w(b[0]),Tc.o(1,0,0),y(b[0]),a.Hf.Ab=!1);Vg(a.Hf,b);a.sj?(b=[Sc],a.Ff.Ab=!0):(b=[new r(Sc.width,Sc.height)],w(b[0]),Sc.o(1,0,0),y(b[0]),a.Ff.Ab=!1);Vg(a.Ff,b)}}
function Wg(a){var b,c,d;w(a.Yg);m.clear();b=V.K();a.a.Qd&&z(b,a.a.Qd);D(b,"center");E(b,"middle");c=L.l.H("levelMapScreenWorld_"+a.C,"<LEVELMAPSCREENWORLD_"+a.C+">");d=Wa(b,c,a.a.yd-(b.stroke?b.Xb:0),a.a.me-(b.stroke?b.Xb:0),!1);d<b.fontSize&&A(b,d);b.o(c,a.Yg.width/2,a.Yg.height/2);y(a.Yg);a.canvas.Z=!0}
e.bc=function(){var a,b,c,d=this;this.mc=this.a.mc?!0:!1;if(!this.mc){for(a=0;a<L.n.ma.length;a++)if(9<L.n.ma[a]){b=!0;break}b||(this.mc=!0)}this.Aj=new r(3*this.canvas.width,this.mc?this.a.us:this.a.vs);this.rs=-this.canvas.width;this.ss=this.mc?this.a.Kr:this.a.Mr;this.Cf=L.d.g(this.ss,L.ea.height,this.Aj.height)+L.ea.top;this.Yg=new r(this.a.yd,this.a.me);this.Yy=L.d.g(this.a.Zg,this.canvas.width,this.a.yd);this.eu=L.d.g(this.a.$c,L.ea.height,this.Yg.height)+L.ea.top;this.os="undefined"!==typeof s_level_mask?
s_level_mask:this.mc?$b(Ic):$b(Oc);this.a.or&&(this.fonts={},a=function(a){var b,c;for(b in a)c=V.K(),z(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.no=V,this.mc?a(this.a.nw):a(this.a.ow));this.C=L.e.C;this.ma=L.n.ma[this.C];this.Am=!1;this.zm=this.Np=this.fi=0;this.Op=this.rs;this.Ua=0;this.tj=0<this.C;this.sj=this.C<L.n.ma.length-1;for(b=this.Rp=this.im=this.M=0;b<L.n.ma.length;b++)for(a=0;a<L.n.ma[b];a++)c=Xg(void 0,a,b),this.Rp+=3,"object"===typeof c&&null!==c&&(this.M+=void 0!==c.stars?c.stars:
0,this.im+=void 0!==c.highScore?c.highScore:0);L.k.Pv&&(this.im=L.k.Pv());this.Ra();a=this.Hc[this.a.px];this.fp=new pg(L.d.g(this.a.qx,this.canvas.width,a.s.width),L.d.g(this.a.gp,L.ea.height,a.s.height)+L.ea.top,this.depth-20,new $b(a.s),[a.s],{da:L.e.af,wa:this});Tg(this);Pg(this);Wg(this);this.qd=!0};e.ob=function(){this.Hf&&J(H,this.Hf);this.Ff&&J(H,this.Ff);J(H,this.fp)};
e.Bb=function(a,b,c){if(!this.We)for(a=0;a<this.Dg.length;a++)if(ec(this.os,this.Dg[a].x-this.canvas.width,this.Dg[a].y+this.Cf,b,c)){this.Eg=a;break}this.We=!1;1<L.n.ma.length&&(this.Am=!0,this.fi=0,this.Rt=this.Op=b,this.zm=this.Np=0)};
e.Cb=function(a,b,c){if(!this.We&&-1!==this.Eg&&ec(this.os,this.Dg[this.Eg].x-this.canvas.width,this.Dg[this.Eg].y+this.Cf,b,c)&&(a=L.n.bj||"locked",b=Qg(this.C,this.Eg,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return J(H,this),Yg(L.e,this.Eg,this.C),!0;this.Eg=-1;this.Am=!1;1<L.n.ma.length&&(Math.abs(this.Ua)>=this.a.Oy&&(this.zm>=this.a.Py||Math.abs(this.Ua)>=this.a.Ny)?"previous"===this.le?this.tj&&0<=this.Ua&&this.Ua<=this.canvas.width/2?Sg(this,
this.C-1):(0>this.Ua||(this.le="next"),Sg(this,this.C)):"next"===this.le&&(this.sj&&0>=this.Ua&&this.Ua>=-this.canvas.width/2?Sg(this,this.C+1):(0<this.Ua||(this.le="previous"),Sg(this,this.C))):0<Math.abs(this.Ua)&&(this.le="next"===this.le?"previous":"next",Sg(this,this.C)));return!0};
e.Tc=function(a){if(a===L.Bf||a===L.Jf)this.canvas.Z=!0,this.Ra(),a===L.Jf?(this.eu=L.d.g(this.a.$c,L.ea.height,this.Yg.height)+L.ea.top,this.Cf=L.d.g(this.ss,L.ea.height,this.Aj.height)+L.ea.top,this.fp.y=L.d.g(this.a.gp,L.ea.height,this.fp.images[0].height)+L.ea.top,this.Hf&&(this.Hf.y=L.d.g(this.a.cq,L.ea.height,Tc.height)+L.ea.top),this.Ff&&(this.Ff.y=L.d.g(this.a.bq,L.ea.height,Sc.height)+L.ea.top),void 0===this.Ff&&void 0===this.Hf&&(this.Cf-=this.a.Lr)):(Wg(this),Pg(this))};
e.Re=function(a){var b=H.fa[0].x;this.Am&&(this.Np=Math.abs(this.Op-b),0<this.fi&&(this.zm=this.Np/(this.fi/1E3)),this.le=b>this.Op?"previous":"next",this.fi+=a,this.Ua+=b-this.Rt,this.Rt=b,this.canvas.Z=!0);this.We&&(b=this.Ql,this.Ua=this.moveStart+this.Ms*jc(b-this.Rl,1,-1,b,2),this.Rl>=this.Ql&&(this.We=!1,this.Ua=0),this.Rl+=a,this.canvas.Z=!0);if(this.We||this.Am)"previous"===this.le&&this.Ua>=this.canvas.width/2?0<=this.C-1?(this.C-=1,this.ma=L.n.ma[this.C],this.tj=0<this.C,this.sj=this.C<
L.n.ma.length-1,Ug(this),this.Ua-=this.canvas.width,Wg(this),Pg(this),this.canvas.Z=!0,this.moveStart-=this.canvas.width):this.Ua=Math.round(this.canvas.width/2):"next"===this.le&&this.Ua<=-this.canvas.width/2&&(this.C+1<L.n.ma.length?(this.C+=1,this.ma=L.n.ma[this.C],this.tj=0<this.C,this.sj=this.C<L.n.ma.length-1,Ug(this),this.Ua+=this.canvas.width,Wg(this),Pg(this),this.canvas.Z=!0,this.moveStart+=this.canvas.width):this.Ua=Math.round(-this.canvas.width/2))};
e.pa=function(){this.Yg.o(this.Yy,this.eu);this.Aj.o(Math.round(this.rs+this.Ua),this.Cf);this.qd=!1};
function Zg(a,b,c,d){this.depth=10;this.h=this.visible=!0;L.d.Ma(this,L.Jc);var f;this.type=b.failed?"failed":a;this.a=L.a.u.qa;this.Ja=this.a.type[this.type];if("landscape"===L.orientation)for(f in L.a.u.js)this.a[f]=L.a.u.js[f];for(f in L.a.T.qa)this.a[f]=L.a.T.qa[f];if(L.a.T.qa&&L.a.T.qa.type&&L.a.T.qa.type[this.type])for(f in L.a.T.qa.type[this.type])this.a[f]=L.a.T.qa.type[this.type][f];if("failed"===this.type){if(void 0!==L.a.k.qa&&L.a.k.qa.type&&void 0!==L.a.k.qa.type.failed)for(f in L.a.k.qa.type[this.type])this.Ja[f]=
L.a.k.qa.type[this.type][f]}else{if(void 0!==L.a.k.qa&&void 0!==L.a.k.qa.type)for(f in L.a.k.qa.type[this.type])this.Ja[f]=L.a.k.qa.type[this.type][f];for(f in L.a.k.qa)this.Ja[f]=L.a.k.qa[f]}this.Ba=b;this.da=c;this.wa=d;this.py=[Sf,Tf,Uf];this.hg=[];this.Va=new fc;this.Va.parent=this;I(this,!1)}
function $g(a){var b;for(b=0;b<a.M.length;b++)ah(a.M[b]);for(b=0;b<a.Og.length;b++)J(H,a.Og[b]);a.Og=[];a.Ta&&ah(a.Ta);a.Ta=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].Ab=!1;a.Va.stop();a.Va=void 0;bh(a)}
function ch(a,b){var c;switch(b){case "title_level":c=L.l.H("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.Ba.level);break;case "title_endless":c=L.l.H("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.Ba.stage);break;case "title_difficulty":c=L.l.H("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.Qc(a.a.Qd,c,a.a.Zg,a.a.$c,a.a.yd,a.a.me)}
function dh(a,b){var c;switch(b){case "subtitle_failed":c=L.l.H("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.Qc(a.a.Hy,c,a.a.Iy,a.a.Jy)}
function eh(a,b,c){var d,f,h,k,l;f=L.l.H(b.key,"<"+b.key.toUpperCase()+">");d=b.sf?b.toString(b.Pg):b.toString(b.uc);h=a.a.Uj;h.align="left";h.j="top";l=V.K();z(l,h);c?(E(l,"bottom"),h=a.a.Qg,h.align="left",h.j="bottom",c=V.K(),z(c,h),h=k=0,void 0!==f&&(h+=l.$(f)+a.a.ym),void 0!==d&&(h+=c.$(d)),h=L.d.g(a.a.Lf,a.canvas.width,h)-a.f.x,void 0!==f&&(l.o(f,h,a.Pd+l.fontSize),h+=l.$(f)+a.a.ym,k+=l.W(f)),void 0!==d&&(b.sf?(d=c.W(d),l=a.Pd+l.fontSize-d,b.aj=new fh(h,l,a.a.ci,d,a.depth-100,b.Pg,c,a.a.ai,a.a.bi,
a.f,b.toString),k=Math.max(k,d)):(c.o(d,h,a.Pd+l.fontSize+a.a.Kt),k=Math.max(k,c.W(d)))),0<k&&(a.Pd+=k+a.a.ke)):(void 0!==f&&(a.Qc(h,f,a.a.Lf,a.a.Mf),k=a.a.Mf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.ke:a.a.ke,k.offset+=l.W(f)):"number"===typeof k&&(k+=a.a.ke+l.W(f))),void 0!==d&&(h=a.a.Qg,h.j="top",b.sf?(c=V.K(),h.align="center",z(c,h),f=L.d.g(a.a.Lf,a.canvas.width,a.a.ci)-a.f.x,l=k-a.f.y,b.aj=new fh(f,l,a.a.ci,c.W(d),a.depth-100,b.Pg,c,a.a.ai,a.a.bi,a.f,b.toString)):a.Qc(h,d,
a.a.Lf,k)))}
function gh(a,b,c){var d,f,h,k,l,n;switch(b){case "totalScore":d=""+a.Ba.totalScore;f=L.l.H("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":f=L.l.H("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.Ba.highScore;break;case "timeLeft":f=L.l.H("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.Ba.timeLeft;break;case "timeBonus":f=L.l.H("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.Ba.timeBonus,n=a.Ba.timeBonus}h=a.a.Uj;h.align=
"left";h.j="top";l=V.K();z(l,h);c?(E(l,"bottom"),h=a.a.Qg,h.align="left",h.j="bottom",c=V.K(),z(c,h),h=k=0,void 0!==f&&(h+=l.$(f)+a.a.ym),void 0!==d&&(h+=c.$(d)),h=L.d.g(a.a.Lf,a.canvas.width,h)-a.f.x,void 0!==f&&(l.o(f,h,a.Pd+l.fontSize),h+=l.$(f)+a.a.ym,k+=l.W(f)),void 0!==d&&(void 0!==n?(d=c.W(d),l=a.Pd+l.fontSize-d,n=new fh(h,l,a.a.ci,d,a.depth-100,n,c,a.a.ai,a.a.bi,a.f),k=Math.max(k,d)):(c.o(d,h,a.Pd+l.fontSize+a.a.Kt),k=Math.max(k,c.W(d)))),0<k&&(a.Pd+=k+a.a.ke)):(void 0!==f&&(a.Qc(h,f,a.a.Lf,
a.a.Mf),k=a.a.Mf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.ke:a.a.ke,k.offset+=l.W(f)):"number"===typeof k&&(k+=a.a.ke+l.W(f))),void 0!==d&&(h=a.a.Qg,h.j="top",void 0!==n?(c=V.K(),h.align="center",z(c,h),f=L.d.g(a.a.Lf,a.canvas.width,a.a.ci)-a.f.x,l=k-a.f.y,n=new fh(f,l,a.a.ci,c.W(d),a.depth-100,n,c,a.a.ai,a.a.bi,a.f)):a.Qc(h,d,a.a.Lf,k)));n instanceof fh&&("totalScore"===b?a.bh=n:a.hg.push(n))}
function hh(a,b){var c,d,f;c=L.l.H(b.key,"<"+b.key.toUpperCase()+">");d=b.sf?b.toString(b.Pg):b.toString(b.uc);void 0!==c&&a.Qc(a.a.Mn,c,a.a.sr,a.a.$k);void 0!==d&&(b.sf?(c=V.K(),d=a.a.fj,a.a.bA||(d.align="center"),z(c,d),d=L.d.g(a.a.cl,a.canvas.width,a.a.bl)-a.f.x,f=L.d.g(a.a.Ch,a.canvas.height,a.a.al)-a.f.y,b.aj=new fh(d,f,a.a.bl,a.a.al,a.depth-100,b.Pg,c,a.a.ai,a.a.bi,a.f,b.toString)):a.Qc(a.a.fj,d,a.a.cl,a.a.Ch))}
function ih(a,b){var c,d,f,h;switch(b){case "totalScore":c=L.l.H("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.Ba.totalScore;f=0;break;case "timeLeft":c=L.l.H("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.Ba.timeLeft}void 0!==c&&a.Qc(a.a.Mn,c,a.a.sr,a.a.$k);void 0!==d&&(void 0!==f?(c=V.K(),d=a.a.fj,d.align="center",z(c,d),d=L.d.g(a.a.cl,a.canvas.width,a.a.bl)-a.f.x,h=L.d.g(a.a.Ch,a.canvas.height,a.a.al)-a.f.y,f=new fh(d,h,a.a.bl,a.a.al,a.depth-100,f,c,a.a.ai,a.a.bi,
a.f)):a.Qc(a.a.fj,d,a.a.cl,a.a.Ch));f instanceof fh&&("totalScore"===b?a.bh=f:a.hg.push(f))}e=Zg.prototype;e.Qc=function(a,b,c,d,f,h){var k=V.K();z(k,a);void 0!==f&&void 0!==h&&(a=Wa(k,b,f,h,f),k.fontSize>a&&A(k,a));a=k.$(b);h=k.W(b);k.o(b,L.d.Da(c,this.canvas.width,a,k.align)-this.f.x,L.d.Da(d,this.canvas.height,h,k.j)-this.f.y,f)};
function jh(a,b){var c,d,f,h;switch(b){case "retry":c=ue;d=function(){a.wf="retry";$g(a)};break;case "exit":c=re,d=function(){a.wf="exit";$g(a)}}void 0!==c&&(f=L.d.g(a.a.Vu,a.canvas.width,c.width)-a.f.x,h=L.d.g(a.a.xk,a.canvas.height,c.height)-a.f.y,a.buttons.push(new pg(f,h,a.depth-20,new $b(c),[c],d,a.f)))}
function kh(a,b){var c,d,f,h;switch(b){case "retry":c=pe;d=function(){a.wf="retry";$g(a)};break;case "exit":c=qe;d=function(){a.wf="exit";$g(a)};break;case "next":c=qe,d=function(){a.wf="next";$g(a)}}void 0!==c&&(f=L.d.g(a.a.Fv,a.canvas.width,c.width)-a.f.x,h=L.d.g(a.a.Zn,a.canvas.height,c.height)-a.f.y,a.buttons.push(new pg(f,h,a.depth-20,new $b(c),[c],d,a.f)))}
e.bc=function(){this.m=0;this.M=[];this.Og=[];this.buttons=[];this.canvas.Z=!0;this.wf="";this.nd=this.Ba.failed?!0:!1;this.ud=this.Ja.ud&&!this.nd;this.Xh=this.Ja.Xh&&!this.nd&&this.Ba.Do;this.nn=this.alpha=this.vh=0;lh(this);var a,b,c,d,f,h,k=this;switch(this.Ja.zk){case "failed":this.b=this.a.am.mw;break;case "level":this.b=this.a.am.pw;break;case "difficulty":this.b=this.a.am.In;break;case "endless":this.b=this.a.am.xv}this.f=new mh(this.depth-10,this.Sa,new r(this.b.width,this.b.height));this.f.x=
L.d.g(this.a.zc,this.canvas.width,this.b.width);this.f.y=L.d.g(this.a.dc,this.canvas.height,this.b.height);w(this.f.b);this.b.o(0,0,0);!this.nd&&this.ud&&(b=L.d.g(this.a.Dp,this.canvas.width,0)-this.f.x,a=L.d.g(this.a.Ep,this.canvas.height,s_star01_fill.height)-this.f.y+Math.round(s_star01_empty.height/2),s_star01_empty.o(0,b,a),b=L.d.g(this.a.Fp,this.canvas.width,0)-this.f.x,a=L.d.g(this.a.Gp,this.canvas.height,s_star02_fill.height)-this.f.y+Math.round(s_star02_empty.height/2),s_star02_empty.o(0,
b,a),b=L.d.g(this.a.Hp,this.canvas.width,0)-this.f.x,a=L.d.g(this.a.Ip,this.canvas.height,s_star03_fill.height)-this.f.y+Math.round(s_star03_empty.height/2),s_star03_empty.o(0,b,a));void 0!==this.Ja.Yj&&ch(this,this.Ja.Yj);void 0!==this.Ja.Nt&&dh(this,this.Ja.Nt);this.ab={};void 0!==this.Ba.Ic?(c=this.Ba.Ic,c.visible&&hh(this,c),this.ab[c.id]=c):void 0!==this.Ja.Nn&&ih(this,this.Ja.Nn);if(void 0!==this.Ba.ab)for(a=this.Ba.ab.length,b=V.K(),z(b,this.a.Uj),c=V.K(),z(c,this.a.Qg),b=Math.max(b.W("g"),
c.W("g"))*a+this.a.ke*(a-1),this.Pd=L.d.g(this.a.Mf,this.canvas.height,b)-this.f.y,b=0;b<a;b++)c=this.Ba.ab[b],c.visible&&eh(this,this.Ba.ab[b],1<a),this.ab[c.id]=c;else if(void 0!==this.Ja.Nf)if("string"===typeof this.Ja.Nf)gh(this,this.Ja.Nf,this.a.Er);else if(this.Ja.Nf instanceof Array)for(a=this.Ja.Nf.length,b=V.K(),z(b,this.a.Uj),c=V.K(),z(c,this.a.Qg),b=Math.max(b.W("g"),c.W("g"))*a+this.a.ke*(a-1),this.Pd=L.d.g(this.a.Mf,this.canvas.height,b)-this.f.y,b=0;b<a;b++)gh(this,this.Ja.Nf[b],1<a||
this.a.Er);y(this.f.b);jh(this,this.Ja.wk);kh(this,this.Ja.il);L.e.pu&&(b=L.d.g(k.a.aw,k.canvas.width,k.a.Wr)-this.f.x,a=L.d.g(this.a.bw,this.canvas.height,this.a.lg)-this.f.y,this.Vr=new Kg("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.Wr,{da:function(){void 0!==nh?L.i.Jd(L.w.wl.url+"submit/"+nh+"/"+k.Ba.totalScore):L.i.Jd(L.w.wl.url+"submit/")},wc:!0},k.f),this.buttons.push(this.Vr),b=function(a){a&&(k.Vr.Vp("levelEndScreenSubmitHighscoreBtn"),k.vA=a)},oh(this.Ba.totalScore,
b));b=L.d.g(this.a.Xi,this.canvas.width,this.a.yh)-this.f.x;a=L.d.g(this.a.mg,this.canvas.height,this.a.lg)-this.f.y;this.buttons.push(new pg(b,a,this.depth-20,new Yb(0,0,this.a.yh,this.a.lg),void 0,function(){k.wf="exit";$g(k)},this.f));for(b=0;b<this.buttons.length;b++)this.buttons[b].Ab=!1;this.f.y=-this.f.height;a=this.a.Sy;this.Va.Y(a,this.Ay);a+=this.a.Pi;f=0;d=this.a.$y;this.ud&&(d=Math.max(d,this.a.At+this.a.zt*this.Ba.stars));if(this.bh&&(this.Va.Y(a+this.a.Km,function(a,b){ph(b.parent.bh,
b.parent.Ba.totalScore,d)}),f=a+this.a.Km+d,0<this.hg.length)){h=function(a,b){var c=b.parent,d=c.hg[c.vh];ph(c.bh,c.bh.value+d.value,c.a.uh);ph(d,0,c.a.uh);c.vh+=1};for(b=0;b<this.hg.length;b++)f+=this.a.Pq,this.Va.Y(f,h);f+=this.a.uh}if(void 0!==this.ab&&(f=a,h=function(a,b){var c=b.parent,d=c.Mp[c.vh||0],f=c.ab[d.$h];void 0!==d.ne&&(f.visible&&f.sf?ph(f.aj,d.ne(f.aj.value),c.a.uh):f.uc=d.ne(f.uc));d.visible&&d.sf&&ph(d.aj,d.uc,c.a.uh);c.vh+=1},this.Mp=[],void 0!==this.Ba.Ic&&void 0!==this.Ba.Ic.ne&&
(this.Va.Y(a+this.a.Km,h),this.Mp.push(this.Ba.Ic),f+=this.a.Km+bonusCounterDuration),void 0!==this.Ba.ab))for(b=0;b<this.Ba.ab.length;b++)c=this.Ba.ab[b],void 0!==c.ne&&(f+=this.a.Pq,this.Va.Y(f,h),this.Mp.push(c),f+=this.a.uh);if(this.ud){for(b=0;b<this.Ba.stars;b++)a+=this.a.zt,this.Va.Y(a,this.Cy),this.Va.Y(a,this.Dy);a+=this.a.At}a=Math.max(a,f);this.Xh&&(a+=this.a.Lw,this.Va.Y(a,this.zy),this.Va.Y(a,this.xy),this.Va.Y(a+this.a.Mw,this.yy));a+=500;this.Va.Y(a,function(){L.i.fw&&L.i.fw()});this.Va.Y(a+
this.a.cx,L.i.gw);L.i.Fo(this.Ba);this.Va.start();this.nd?F.play(Wf):F.play(Qf)};e.X=function(a){this.alpha=this.a.gl*this.nn/this.a.$b;this.nn+=a;this.alpha>=this.a.gl&&(this.alpha=this.a.gl,this.h=!1);this.canvas.Z=!0};
e.Ay=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].Ab=!0}var d=b.parent,f,h;switch(d.a.pz){case "fromLeft":h="horizontal";f=L.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.x=-d.f.width;d.f.y=L.d.g(d.a.dc,d.canvas.height,d.f.height)+Math.abs(L.ta);break;case "fromRight":h="horizontal";f=L.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.x=d.canvas.width;d.f.y=L.d.g(this.parent.a.dc,d.canvas.height,selft.f.height)+Math.abs(L.ta);break;case "fromBottom":h="vertical";f=L.d.g(d.a.dc,
d.canvas.height,d.f.height)+Math.abs(L.ta);d.f.x=L.d.g(d.a.zc,d.canvas.width,d.f.width);d.f.y=d.canvas.height+d.f.height;break;default:h="vertical",f=L.d.g(d.a.dc,d.canvas.height,d.f.height)+Math.abs(L.ta),d.f.x=L.d.g(d.a.zc,d.canvas.width,d.f.width),d.f.y=-d.f.height}"vertical"===h?qh(d.f,"y",f,d.a.Pi,d.a.on,c):qh(d.f,"x",f,d.a.Pi,d.a.on,c)};
function bh(a){function b(){J(H,a);a.wa?a.da.call(a.wa,a.wf):a.da(a.wf)}var c,d;switch(a.a.qz){case "toLeft":d="horizontal";c=-a.f.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.f.height;break;default:d="vertical",c=-a.f.height}"vertical"===d?qh(a.f,"y",c,a.a.pn,a.a.qn,b):qh(a.f,"x",c,a.a.pn,a.a.qn,b)}
e.Cy=function(a,b){var c,d=b.parent,f=Math.abs(L.ta);if(d.M.length<d.Ba.stars){switch(d.M.length+1){case 1:c=new mh(d.depth-30,L.Pe,s_star01_fill);c.x=L.d.g(d.a.Dp,d.canvas.width,0);c.y=L.d.g(d.a.Ep,d.canvas.height,s_star01_fill.height)+f+Math.round(s_star01_empty.height/2);break;case 2:c=new mh(d.depth-30,L.Pe,s_star02_fill);c.x=L.d.g(d.a.Fp,d.canvas.width,0);c.y=L.d.g(d.a.Gp,d.canvas.height,s_star02_fill.height)+f+Math.round(s_star02_empty.height/2);break;case 3:c=new mh(d.depth-30,L.Pe,s_star03_fill),
c.x=L.d.g(d.a.Hp,d.canvas.width,0),c.y=L.d.g(d.a.Ip,d.canvas.height,s_star03_fill.height)+f+Math.round(s_star03_empty.height/2)}c.eb=d.a.Bt;c.hb=d.a.Bt;c.alpha=d.a.ty;qh(c,"scale",1,d.a.sy,uc,function(){var a=d.M.length,b,c,n;w(d.f.b);switch(a){case 1:n=s_star01_fill;b=L.d.g(d.a.Dp,d.canvas.width,0)-d.f.x;c=L.d.g(d.a.Ep,d.canvas.height,s_star01_fill.height)-d.f.y+f+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=L.d.g(d.a.Fp,d.canvas.width,0)-d.f.x;c=L.d.g(d.a.Gp,d.canvas.height,
s_star01_fill.height)-d.f.y+f+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=L.d.g(d.a.Hp,d.canvas.width,0)-d.f.x,c=L.d.g(d.a.Ip,d.canvas.height,s_star01_fill.height)-d.f.y+f+Math.round(s_star03_empty.height/2)}n.o(0,b,c);y(d.f.b);d.f.qd=!0;J(H,d.M[a-1])});qh(c,"alpha",1,d.a.ry,lc);d.M.push(c);F.play(d.py[d.M.length-1])}};
e.Dy=function(a,b){var c=b.parent,d,f;d=c.M[c.Og.length];f=new mh(c.depth-50,L.Pe,s_sfx_star);f.x=d.x;f.y=d.y;qh(f,"subImage",s_sfx_star.F-1,c.a.qy,void 0,function(){J(H,f)});c.Og.push(f)};
e.xy=function(a,b){var c=b.parent,d,f,h,k,l,n,q;d=[];h=V.K();k=L.l.H("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.Js&&z(h,c.a.Js);f=Wa(h,k,c.a.Ml,c.a.Sw,!0);f<h.fontSize&&A(h,f);l=L.d.Da(c.a.Tw,Xc.width,h.$(k,c.a.Ml),h.align);n=L.d.Da(c.a.Uw,Xc.height,h.W(k,c.a.Ml),h.j);for(q=0;q<Xc.F;q++)f=new r(Xc.width,Xc.height),w(f),Xc.o(q,0,0),h.o(k,l,n,c.a.Ml),y(f),d.push(f);c.Ta=new mh(c.depth-120,L.Pe,d);c.Ta.Kd=c.a.Gs;c.Ta.Ld=c.a.Hs;c.Ta.x=L.d.g({align:"center"},c.f.canvas.width,c.Ta.width)-c.f.x;
c.Ta.y=L.d.g(c.a.Gj,c.Ta.canvas.height,c.Ta.height)-c.f.y+Math.abs(L.ta);l=L.d.g(c.a.Xo,c.Ta.canvas.width,c.Ta.width)-c.f.x;c.Ta.eb=c.a.Ll;c.Ta.hb=c.a.Ll;c.Ta.parent=c.f;c.Ta.alpha=0;c.Ta.Fz=!0;qh(c.Ta,"scale",1,c.a.Oh,lc,function(){J(H,c.Eb);c.Eb=void 0});qh(c.Ta,"x",l,c.a.Oh,lc);qh(c.Ta,"alpha",1,0,lc);qh(c.Ta,"subImage",Xc.F,c.a.Qw,lc,void 0,c.a.Oh+c.a.Fs+c.a.Pw,!0,c.a.Rw)};
e.zy=function(a,b){var c,d=b.parent;d.Eb=new mh(d.depth-110,L.Pe,Wc);d.Eb.y=L.d.g(d.a.Gj,d.Eb.canvas.height,Wc.height)-d.f.y+d.a.Ow;d.Eb.Kd=d.a.Gs;d.Eb.Ld=d.a.Hs;d.Eb.x=L.d.g(d.a.Xo,d.Eb.canvas.width,d.Eb.width)-d.f.x;c=L.d.g(d.a.Gj,d.Eb.canvas.height,Wc.height)-d.f.y+Math.abs(L.ta);d.Eb.eb=d.a.Ll*d.a.Is;d.Eb.hb=d.a.Ll*d.a.Is;d.Eb.alpha=0;d.Eb.parent=d.f;qh(d.Eb,"y",c,d.a.Oh,lc);qh(d.Eb,"scale",1,d.a.Oh,lc);qh(d.Eb,"alpha",1,d.a.Oh,lc)};
e.yy=function(a,b){var c=b.parent;c.Ef=new mh(c.depth-130,L.Pe,Vc);c.Ef.parent=c.f;c.Ef.x=c.Ta.x;c.Ef.y=c.Ta.y+c.a.Nw;qh(c.Ef,"subImage",Vc.F-1,c.a.Fs,void 0,function(){J(H,c.Ef);c.Ef=void 0});F.play(Zf)};
e.ob=function(){var a;for(a=0;a<this.buttons.length;a++)J(H,this.buttons[a]);for(a=0;a<this.M.length;a++)J(H,this.M[a]);for(a=0;a<this.Og.length;a++)J(H,this.Og[a]);this.Ta&&(J(H,this.Ta),this.Ef&&J(H,this.Ef),this.Eb&&J(H,this.Eb));J(H,this.f);this.Va&&this.Va.stop();this.bh&&J(H,this.bh);for(a=0;a<this.hg.length;a++)J(H,this.hg[a]);rh()};e.pa=function(){var a=m.context.globalAlpha;m.context.globalAlpha=this.alpha;sa(0,0,m.canvas.width,m.canvas.height,this.a.xr,!1);m.context.globalAlpha=a};
function sh(a,b,c,d){this.depth=-100;this.visible=!1;this.h=!0;L.d.Ma(this,L.Jc);var f,h;this.a=c?L.a.u.Rs:L.a.u.options;if("landscape"===L.orientation)for(f in h=c?L.a.u.bB:L.a.u.rx,h)this.a[f]=h[f];this.Hc=L.a.u.rc;h=c?L.a.T.Rs:L.a.T.options;for(f in h)this.a[f]=h[f];if(L.w.options&&L.w.options.buttons)for(f in L.w.options.buttons)this.a.buttons[f]=L.w.options.buttons[f];this.type=a;this.bz=b;this.Dd=c;this.um=!1!==d;I(this)}e=sh.prototype;
e.Oi=function(a,b,c,d,f){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,u=void 0;switch(a){case "music":h="music_toggle";n=this.gu;l=L.e.Ig()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.gu;l=L.e.Ig()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.hu;l=L.e.hm()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.hu;l=L.e.hm()?"on":"off";break;case "language":h="language_toggle";n=this.fu;l=L.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.Rj;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.gt;this.zn=this.fy;break;case "moreGames":void 0!==L.w.bx?(h="default_image",u=L.w.bx):(h="default_text",k="optionsMoreGames");n=this.gy;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=L.Th.customFunctions&&"function"===typeof L.Th.customFunctions.exit?L.Th.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.Rx;break;
case "restart":h="default_text";k="optionsRestart";n=this.Wx;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.gt;this.zn=this.iy;break;case "about":h="default_text";k="optionsAbout";n=this.dy;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.kj;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.Vi}void 0!==h&&void 0!==n&&("image"===this.Hc[h].type?this.buttons.push(new th(h,b,c,this.depth-20,u,d,{da:n,wa:this,wc:q},
this.f)):"toggleText"===this.Hc[h].type?this.buttons.push(new Gg(h,b,c,this.depth-20,l,d,{da:n,wa:this,wc:q},this.f)):"text"===this.Hc[h].type?this.buttons.push(new Kg(h,b,c,this.depth-20,k,d,{da:n,wa:this,wc:q},this.f)):"toggle"===this.Hc[h].type&&this.buttons.push(new uh(h,b,c,this.depth-20,l,{da:n,wa:this,wc:q},this.f)),this.buttons[this.buttons.length-1].Ab=f||!1)};
e.gt=function(){var a=this;qh(a.f,"y","inGame"!==this.type?-this.f.b.height:this.canvas.height,this.a.jp,this.a.kp,function(){J(H,a);void 0!==a.zn&&a.zn.call(a)});return!0};
e.Ra=function(a,b){var c,d,f,h;w(this.f.b);m.clear();this.a.backgroundImage.o(0,0,0);c=L.l.H("optionsTitle","<OPTIONS_TITLE>");d=V.K();this.a.Qd&&z(d,this.a.Qd);void 0!==this.a.yd&&void 0!==this.a.me&&(f=Wa(d,c,this.a.yd,this.a.me,this.a.yd),d.fontSize>f&&A(d,f));f=L.d.Da(this.a.Zg,this.canvas.width,d.$(c),d.align)-a;h=L.d.Da(this.a.$c,this.canvas.height,d.W(c,d.j))-b+-1*L.ta;d.o(c,f,h);y(this.f.b)};
e.bg=function(a,b,c){var d,f,h,k,l,n,q;h=!1;var u=this.a.buttons[this.type];"inGame"===this.type&&L.a.k.ug.Xw&&(u=L.a.k.ug.Xw);if("function"!==typeof vh())for(d=0;d<u.length;d++){if("string"===typeof u[d]&&"moreGames"===u[d]){u.splice(d,1);break}for(f=0;f<u[d].length;f++)if("moreGames"===u[d][f]){u[d].splice(f,1);break}}if(!1===L.w.Ig||!1===L.e.Gl)for(d=0;d<u.length;d++)if(u[d]instanceof Array){for(f=0;f<u[d].length;f++)if("music"===u[d][f]){L.e.Hl?u[d]="sfx_big":u.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
u[d]){u.splice(d,1);break}if(!L.e.Hl)for(d=0;d<u.length;d++)if(u[d]instanceof Array){for(f=0;f<u[d].length;f++)if("sfx"===u[d][f]){!1!==L.w.Ig&&L.e.Gl?u[d]="music_big":u.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===u[d]){u.splice(d,1);break}if(1===L.l.Mv().length)for(d=0;d<u.length;d++)if("language"===u[d]){u.splice(d,1);break}h=this.Hc.default_text.s.height;k=this.a.Hk;a=L.d.g(this.a.Gk,this.canvas.width,k)-a;n=L.d.g(this.a.xh,this.f.b.height,h*u.length+this.a.Vd*(u.length-1))-b+-1*L.ta;
for(d=0;d<u.length;d++){l=a;q=k;if("string"===typeof u[d])this.Oi(u[d],l,n,q,c);else for(b=u[d],q=(k-(b.length-1)*this.a.Vd)/b.length,f=0;f<b.length;f++)this.Oi(b[f],l,n,q,c),l+=q+this.a.Vd;n+=h+this.a.Vd}};e.gu=function(a){var b=!0;"off"===a?(b=!1,L.Ga.$a("off","options:music")):L.Ga.$a("on","options:music");L.e.Ig(b);return!0};e.hu=function(a){var b=!0;"off"===a?(b=!1,L.Ga.$a("off","options:sfx")):L.Ga.$a("on","options:sfx");L.e.hm(b);return!0};
e.fu=function(a){L.l.it(a);L.Ga.$a(a,"options:language");return!0};
e.Rj=function(){function a(){l.ad+=1;l.Rj();return!0}function b(){l.ad-=1;l.Rj();return!0}function c(){var a;l.Ra(n,q);l.kg.Ab=!0;for(a=0;a<l.buttons.length;a++)J(H,l.buttons[a]);l.buttons=[];l.bg(n,q,!0)}var d,f,h,k,l=this,n=L.d.g(l.a.zc,l.canvas.width,l.a.backgroundImage.width),q=L.d.g(l.a.dc,l.canvas.height,l.a.backgroundImage.height)+-1*L.ta;void 0===l.ad&&(l.ad=0);l.Zj=void 0!==L.k.ql?L.k.ql(L.e.lb,Hg()):[];L.Ga.$a((10>l.ad?"0":"")+l.ad,"options:tutorial");for(d=0;d<l.buttons.length;d++)J(H,
l.buttons[d]);l.buttons=[];this.Dd?(w(l.f.b),m.clear(),l.kg.Ab=!1):l.Ra(n,q);w(l.f.b);void 0!==l.a.Rd&&(d=L.d.g(l.a.Mm,l.f.b.width,l.a.Rd.width),f=L.d.g(l.a.lf,l.f.b.height,l.a.Rd.height),l.a.Rd.o(0,d,f));k=l.Zj[l.ad].title;void 0!==k&&""!==k&&(h=V.K(),l.a.Sm&&z(h,l.a.Sm),d=Wa(h,k,l.a.Tm,l.a.Tp,l.a.Tm),h.fontSize>d&&A(h,d),d=L.d.Da(l.a.ou,l.f.b.width,h.$(k,l.a.Tm),h.align),f=L.d.Da(l.a.Um,l.f.b.height,h.W(k,l.a.Tp),h.j),h.o(k,d,f));l.ad<l.Zj.length&&(h=l.Zj[l.ad].b,d=L.d.g(l.a.lu,l.f.b.width,h.width),
f=L.d.g(l.a.Qm,l.f.b.height,h.height),h.o(0,d,f),k=l.Zj[l.ad].text,h=V.K(),l.a.Pm&&z(h,l.a.Pm),d=Wa(h,k,l.a.ii,l.a.mu,l.a.ii),h.fontSize>d&&A(h,d),d=L.d.Da(l.a.nu,l.f.b.width,h.$(k,l.a.ii),h.align),f=L.d.Da(l.a.Rm,l.f.b.height,h.W(k,l.a.ii),h.j),h.o(k,d,f,l.a.ii));y(l.f.b);h=pd;d=L.d.g(l.a.ku,l.canvas.width,h.width)-l.f.x;f=L.d.g(l.a.Om,l.canvas.height,h.height)-l.f.y-L.ta;0<=l.ad-1?l.buttons.push(new pg(d,f,l.depth-20,new $b(h),[h],{da:b,wa:l},l.f)):(h=nd,l.buttons.push(new pg(d,f,l.depth-20,new $b(h),
[h],{da:c,wa:l},l.f)));h=od;d=L.d.g(this.a.ju,l.canvas.width,h.width)-l.f.x;f=L.d.g(this.a.Nm,l.canvas.height,h.height)-l.f.y-L.ta;l.ad+1<l.Zj.length?l.buttons.push(new pg(d,f,l.depth-20,new $b(h),[h],{da:a,wa:l},l.f)):(h=nd,l.buttons.push(new pg(d,f,l.depth-20,new $b(h),[h],{da:c,wa:l},l.f)));return!0};
e.dy=function(){function a(a,b,c,f,h,k){var l;l=V.K();b&&z(l,b);b=Wa(l,a,h,k,h);l.fontSize>b&&A(l,b);c=L.d.Da(c,d.f.b.width,l.$(a,h),l.align);f=L.d.Da(f,d.f.b.height,l.W(a,k),l.j);l.o(a,c,f,h);return f+k}function b(a,b,c){b=L.d.g(b,d.f.b.width,a.width);c=L.d.g(c,d.f.b.height,a.height);a.o(0,b,c);return c+a.height}var c,d=this,f=L.d.g(d.a.zc,d.canvas.width,d.a.backgroundImage.width),h=L.d.g(d.a.dc,d.canvas.height,d.a.backgroundImage.height)+-1*L.ta;L.Ga.$a("about","options");for(c=0;c<d.buttons.length;c++)J(H,
d.buttons[c]);d.buttons=[];this.Dd?(w(d.f.b),m.clear(),d.kg.Ab=!1):d.Ra(f,h);w(d.f.b);void 0!==d.a.Rd&&b(d.a.Rd,d.a.Mm,d.a.lf);var k=null;"function"===typeof L.i.nr?k=L.i.nr(d.a,a,b,d.f.b):(c=L.l.H("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.ok,d.a.qk,d.a.mh,d.a.pk,d.a.tq),b(rd,d.a.Ki,d.a.Li),c=L.l.H("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.Mi,d.a.nh,d.a.oh,d.a.ag,d.a.Ni));a(L.l.H("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+vg()+("big"===L.size?"b":"s"),d.a.ln,d.a.wq,
d.a.sk,d.a.vq,d.a.uq);y(d.f.b);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new pg(l.x,l.y,d.depth-10,Yb(0,0,l.width,l.height),null,{da:function(a){return function(){L.i.Jd(a)}}(l.url),wc:!0},d.f))}else void 0!==L.w.Xr&&(c=L.d.g(d.a.Ki,d.f.b.width,rd.width),k=L.d.g(d.a.Li,d.f.b.height,rd.height),c=Math.min(c,L.d.g(d.a.nh,d.f.b.width,d.a.ag)),k=Math.min(k,L.d.g(d.a.oh,d.f.b.height,d.a.Ni)),l=Math.max(d.a.ag,rd.width),d.buttons.push(new pg(c,k,d.depth-10,Yb(0,0,l,L.d.g(d.a.oh,d.f.b.height,
d.a.Ni)+d.a.Ni-k),null,{da:function(){L.i.Jd(L.w.Xr)},wc:!0},d.f)));d.buttons.push(new Kg("default_text",L.d.g(d.a.kn,d.f.b.width,d.a.Ji),d.a.lh,d.depth-20,"optionsAbout_backBtn",d.a.Ji,{da:function(){var a;d.Ra(f,h);d.kg.Ab=!0;for(a=0;a<d.buttons.length;a++)J(H,d.buttons[a]);d.buttons=[];d.bg(f,h,!0);d.tt=!1},wa:d},d.f));return this.tt=!0};
function wh(a){var b,c,d,f,h,k=L.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width),l=L.d.g(a.a.dc,a.canvas.height,a.a.backgroundImage.height)+-1*L.ta;L.Ga.$a("versions","options");for(b=0;b<a.buttons.length;b++)J(H,a.buttons[b]);a.buttons=[];a.Ra(k,l);w(a.f.b);void 0!==a.a.Rd&&a.a.Rd.o(0,L.d.g(a.a.Mm,a.f.width,a.a.Rd.width),L.d.g(a.a.lf,a.f.height,a.a.Rd.height));h=V.K();z(h,a.a.ln);D(h,"left");c=a.a.yu;d=a.a.zu;for(b in L.version)f=b+": "+L.version[b],h.o(f,c,d),d+=h.W(f)+a.a.xu;c=L.d.g(a.a.kn,
a.f.b.width,a.a.Ji);d=a.a.lh;a.buttons.push(new Kg("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Ji,{da:function(){var b;a.Ra(k,l);for(b=0;b<a.buttons.length;b++)J(H,a.buttons[b]);a.buttons=[];a.bg(k,l,!0)},wa:a},a.f))}e.fy=function(){return!0};e.gy=function(){L.Ga.$a("moreGames","options");var a=vh();"function"===typeof a&&a();return!0};
e.Rx=function(){var a=this;xh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){L.Ga.$a("confirm_yes","options:quit");J(H,a);wg(L.Ga,L.e.Rf,yh(L.e),"progression:levelQuit:"+zh());Ah();L.e.kh();return!0})};e.Wx=function(){var a=this;xh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){L.Ga.$a("confirm_yes","options:restart");J(H,a);Bh();return!0})};
e.kj=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";Ch(b,L.l.H(d,"<"+d.toUpperCase()+">"));a&&(b.kg.Ab=!1,b.um||lh())};xh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){L.e.kj(a);return!0})};
e.Vi=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";Ch(b,L.l.H(d,"<"+d.toUpperCase()+">"));a&&(b.kg.Ab=!1,b.um||lh())};xh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){L.e.Vi(a);return!0})};
function xh(a,b,c,d,f){var h,k,l,n;for(h=0;h<a.buttons.length;h++)J(H,a.buttons[h]);a.buttons=[];b=L.l.H(b,"<"+b.toUpperCase()+">");h=V.K();a.a.cr?z(h,a.a.cr):a.a.lm&&z(h,a.a.lm);k=Wa(h,b,a.a.Ok,a.a.En,!0);k<h.fontSize&&A(h,k);n=h.$(b,a.a.Ok)+10;l=h.W(b,a.a.Ok)+10;k=L.d.Da(a.a.dr,a.f.b.width,n,h.align);l=L.d.Da(a.a.Pk,a.f.b.height,l,h.j);w(a.f.b);h.o(b,k,l,n);y(a.f.b);k=L.d.g(a.a.ar,a.canvas.width,a.a.Zi)-a.f.x;l=L.d.g(a.a.Mk,a.canvas.height,a.Hc.default_text.s.height)-a.f.y-L.ta;a.buttons.push(new Kg("default_text",
k,l,a.depth-20,d,a.a.Zi,{da:function(){var b,c,d;c=L.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width);d=L.d.g(a.a.dc,a.canvas.height,a.a.backgroundImage.height)+-1*L.ta;a.Ra(c,d);for(b=0;b<a.buttons.length;b++)J(H,a.buttons[b]);a.buttons=[];a.bg(c,d,!0);return!0},wa:a},a.f));k=L.d.g(a.a.br,a.canvas.width,a.a.Zi)-a.f.x;l=L.d.g(a.a.Nk,a.canvas.height,a.Hc.default_text.s.height)-a.f.y-L.ta;a.buttons.push(new Kg("default_text",k,l,a.depth-20,c,a.a.Zi,{da:function(){return"function"===typeof f?f():
!0},wa:a},a.f))}function Ch(a,b){var c,d,f,h;for(c=0;c<a.buttons.length;c++)J(H,a.buttons[c]);a.buttons=[];d=L.d.g(a.a.zc,a.canvas.width,a.a.backgroundImage.width);f=L.d.g(a.a.dc,a.canvas.height,a.a.backgroundImage.height)+-1*L.ta;a.Ra(d,f);c=V.K();a.a.$o&&z(c,a.a.$o);d=Wa(c,b,a.a.ap,a.a.Yw,!0);d<c.fontSize&&A(c,d);h=c.$(b,a.a.ap)+10;f=c.W(b,a.a.ap)+10;d=L.d.Da(a.a.Zw,a.f.b.width,h,c.align);f=L.d.Da(a.a.$w,a.f.b.height,f,c.j);w(a.f.b);c.o(b,d,f,h);y(a.f.b)}
e.iy=function(){L.Ga.$a("startScreen","options");L.e.kh();return!0};e.close=function(){J(H,this);return this.canvas.Z=!0};
e.bc=function(){var a,b;this.um&&lh(this);L.e.ue=this;this.Br=this.Ar=!1;a=this.a.backgroundImage;this.f=new mh(this.depth-10,this.Sa,new r(a.width,a.height));this.f.x=L.d.g(this.a.zc,this.canvas.width,a.width);a=L.d.g(this.a.dc,this.canvas.height,a.height)+-1*L.ta;this.f.y=a;this.Ra(this.f.x,this.f.y);this.buttons=[];this.bz?this.Rj():this.bg(this.f.x,this.f.y);this.kg=new pg(this.a.Xi,this.a.mg,this.depth-20,new Yb(0,0,this.a.yh,this.a.lg),void 0,{da:this.close,wa:this},this.f);this.li="versions";
this.dg=new gc;L.d.Ma(this.dg,L.Jc);Rb(this.dg,this.depth-1);hc(this.dg,"keyAreaLeft",this.f.x,this.f.y+this.a.lf,this.a.ph,this.a.rk,76);hc(this.dg,"keyAreaRight",this.f.x+this.f.width-this.a.ph,this.f.y+this.a.lf,this.a.ph,this.a.rk,82);hc(this.dg,"keyAreaCentre",L.Dw/2-this.a.ph/2,this.f.y+this.a.lf,this.a.ph,this.a.rk,67);b=this;this.f.y="inGame"!==this.type?this.canvas.height:-this.f.b.height;qh(this.f,"y",a,this.a.Yl,this.a.Zl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ab=
!0})};e.ob=function(){var a;this.um&&rh();this.Ar&&na(L.Bf,L.l.po());this.Br&&na(L.Jf);for(a=0;a<this.buttons.length;a++)J(H,this.buttons[a]);this.dg.clear();J(H,this.dg);J(H,this.kg);J(H,this.f);L.e.ue=null};e.Cb=function(){return!0};e.Bb=function(){return!0};e.zg=function(a){this.tt&&(67===a?this.li="":76===a?this.li+="l":82===a&&(this.li+="r"),"lrl"===this.li&&wh(this))};e.Tc=function(a){a===L.Bf?(this.Ra(this.f.x,this.f.y),this.Ar=!0):a===L.Jf?this.Br=!0:a===L.Uu&&this.close()};
function Dh(){this.depth=-200;this.h=this.visible=!0;L.d.Ma(this,L.vg);var a;this.a=L.a.u.bo;if("landscape"===L.orientation&&L.a.u.co)for(a in L.a.u.co)this.a[a]=L.a.u.co[a];this.Hc=L.a.u.rc;for(a in L.a.T.bo)this.a[a]=L.a.T.bo[a];I(this)}
Dh.prototype.Ra=function(){var a,b,c,d;c=this.a.backgroundImage;d=(L.Aw-Math.abs(L.ta))/c.zh;this.f.b=new r(d*c.Yi,d*c.zh);w(this.f.b);this.f.y=Math.abs(L.ta);a=m.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,wa(c,0,0),a.restore());c=V.K();z(c,this.a.font);d=L.l.H("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Wa(c,d,this.a.Dm-(c.stroke?c.Xb:0),this.a.Ry-(c.stroke?c.Xb:0),!0);a<c.fontSize&&A(c,a);a=L.d.Da(this.a.Yt,this.canvas.width,
c.$(d),c.align);b=L.d.Da(this.a.Zt,this.canvas.height,c.W(d),c.j);c.o(d,a,b,this.a.Dm);y(this.f.b);this.f.canvas.Z=!0};Dh.prototype.bc=function(){var a=this,b=this.a.backgroundImage,b=new r(b.width,b.height);this.f=new mh(this.depth,L.Jc,b);this.f.x=0;this.f.y=Math.abs(L.ta);this.Ra();this.button=new Kg(this.a.Sq,L.d.g(this.a.dv,this.canvas.width,this.a.Tq),L.d.g(this.a.Uq,this.canvas.height,this.Hc[this.a.Sq].s.height),this.depth-10,"gameEndScreenBtnText",this.a.Tq,function(){J(H,a);L.e.kh()},this.f)};
Dh.prototype.ob=function(){J(H,this.f);J(H,this.button)};Dh.prototype.Tc=function(a){a!==L.Bf&&a!==L.Jf||this.Ra()};
function pg(a,b,c,d,f,h,k){function l(a,b,c){var d,f;f=L.d.oo(q.canvas);a=Math.round(q.x+q.parent.x-q.Kd*q.eb);d=Math.round(q.y+q.parent.y-q.Ld*q.hb);if(q.images&&0<q.Ag||0<q.Vj)q.Ag=0,q.Vj=0,q.canvas.Z=!0;if(q.Lj&&q.Ab&&ec(q.pb,a,d,b-f.x,c-f.y))return q.Lj=!1,void 0!==q.wa?q.Xl.call(q.wa,q):q.Xl(q)}function n(a,b,c){var d,f,h;h=L.d.oo(q.canvas);d=Math.round(q.x+q.parent.x-q.Kd*q.eb);f=Math.round(q.y+q.parent.y-q.Ld*q.hb);if(q.Ab&&ec(q.pb,d,f,b-h.x,c-h.y))return q.Lj=!0,q.images&&(1<q.images.length?
(q.Ag=1,q.canvas.Z=!0):1<q.images[0].F&&(q.Vj=1,q.canvas.Z=!0)),void 0!==typeof Rf&&F.play(Rf),q.sg=a,!0}this.depth=c;this.h=this.visible=!0;this.group="TG_Token";L.d.Ma(this,L.Jc);this.Ld=this.Kd=0;this.x=a;this.y=b;this.width=f?f[0].width:d.Oa-d.ba;this.height=f?f[0].height:d.tb-d.va;this.alpha=this.hb=this.eb=1;this.na=0;this.pb=d;this.images=f;this.Vj=this.Ag=0;this.Lj=!1;this.Ab=!0;this.parent=void 0!==k?k:{x:0,y:0};this.qm=this.pm=0;this.qd=!0;this.Xl=function(){};this.wc=!1;"object"===typeof h?
(this.Xl=h.da,this.wa=h.wa,this.wc=h.wc):"function"===typeof h&&(this.Xl=h);var q=this;this.wc?(this.Jh=n,this.Kh=l):(this.Bb=n,this.Cb=l);I(this)}function Jg(a,b,c,d,f,h){void 0===a.oa&&(a.oa=[]);a.oa.push({type:b,start:d,kd:f,mb:c,duration:h,m:0})}
function Ng(a){var b,c;if(void 0!==a.oa){for(b=0;b<a.oa.length;b++)if(c=a.oa[b],c.h){switch(c.type){case "xScale":a.eb=c.start+c.kd;break;case "yScale":a.hb=c.start+c.kd;break;case "alpha":a.alpha=c.start+c.kd;break;case "angle":a.na=c.start+c.kd;break;case "x":a.x=c.start+c.kd;break;case "y":a.y=c.start+c.kd}c.h=!1}a.canvas.Z=!0}}function Vg(a,b){a.images=b;a.canvas.Z=!0}e=pg.prototype;e.kt=function(a){this.visible=this.h=a};e.ob=function(){this.images&&(this.canvas.Z=!0)};
e.X=function(a){var b,c;if(void 0!==this.oa){for(b=0;b<this.oa.length;b++)switch(c=this.oa[b],c.m+=a,c.type){case "xScale":var d=this.eb,f=this.pm;this.eb=c.mb(c.m,c.start,c.kd,c.duration);this.pm=-(this.images[0].width*this.eb-this.images[0].width*c.start)/2;if(isNaN(this.eb)||isNaN(this.pm))this.eb=d,this.pm=f;break;case "yScale":d=this.hb;f=this.qm;this.hb=c.mb(c.m,c.start,c.kd,c.duration);this.qm=-(this.images[0].height*this.hb-this.images[0].height*c.start)/2;if(isNaN(this.hb)||isNaN(this.qm))this.hb=
d,this.qm=f;break;case "alpha":this.alpha=c.mb(c.m,c.start,c.kd,c.duration);break;case "angle":this.na=c.mb(c.m,c.start,c.kd,c.duration);break;case "x":d=this.x;this.x=c.mb(c.m,c.start,c.kd,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.mb(c.m,c.start,c.kd,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.Z=!0}};
e.Re=function(){var a,b,c;c=L.d.oo(this.canvas);a=Math.round(this.x+this.parent.x-this.Kd*this.eb);b=Math.round(this.y+this.parent.y-this.Ld*this.hb);this.Lj&&!ec(this.pb,a,b,H.fa[this.sg].x-c.x,H.fa[this.sg].y-c.y)&&(this.images&&(this.Vj=this.Ag=0,this.canvas.Z=!0),this.Lj=!1)};
e.pa=function(){var a,b;a=Math.round(this.x+this.parent.x-this.Kd*this.eb);b=Math.round(this.y+this.parent.y-this.Ld*this.hb);this.images&&(this.images[this.Ag]instanceof r?this.images[this.Ag].R(a,b,this.eb,this.hb,this.na,this.alpha):this.images[this.Ag].R(this.Vj,a,b,this.eb,this.hb,this.na,this.alpha));this.qd=!1};
function Kg(a,b,c,d,f,h,k,l){this.ha=L.a.u.rc[a];a=void 0!==L.a.T.buttons?L.a.u.Fk[L.a.T.buttons[a]||L.a.T.buttons.default_color]:L.a.u.Fk[L.a.u.buttons.default_color];this.font=V.K();a.font&&z(this.font,a.font);this.ha.fontSize&&A(this.font,this.ha.fontSize);this.S=f;this.text=L.l.H(this.S,"<"+f.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.ha.s.height;this.b={source:this.ha.s,Fa:this.ha.Fa,Gb:this.ha.Gb};f=this.Ie(this.b);h=new Yb(0,0,f[0].width,f[0].height);pg.call(this,b,c,d,
h,f,k,l)}L.d.yj(Kg);e=Kg.prototype;e.nm=function(a){this.text=L.l.H(this.S,"<"+this.S.toUpperCase()+">");a&&z(this.font,a);Vg(this,this.Ie(this.b))};e.Vp=function(a,b){this.S=a;this.nm(b)};e.$j=function(a,b,c){"string"===typeof b&&(this.text=b);c&&z(this.font,c);a instanceof p?this.b.source=a:void 0!==a.Fa&&void 0!==a.Gb&&void 0!==a.source&&(this.b=a);Vg(this,this.Ie(this.b))};
e.Ie=function(a){var b,c,d,f,h,k,l=a.Fa+a.Gb;d=this.height-(this.ha.xd||0);var n=a.source;c=this.font.$(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Wa(this.font,this.text,b,d,!0);c<this.ha.fontSize?A(this.font,c):A(this.font,this.ha.fontSize);c=a.Fa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.ha.wd&&(d+=this.ha.wd);h=[];for(f=0;f<n.F;f++)k=new r(b+l,this.height),w(k),n.Ea(f,0,0,a.Fa,this.height,0,0,1),n.Xk(f,a.Fa,0,n.width-l,this.height,a.Fa,0,b,this.height,1),n.Ea(f,a.Fa+n.width-l,0,a.Gb,this.height,a.Fa+b,0,1),this.font.o(this.text,c,d,b),y(k),h.push(k);return h};e.Tc=function(a){a===L.Bf&&this.nm()};
function th(a,b,c,d,f,h,k,l){this.ha=L.a.u.rc[a];void 0!==h&&(this.width=h);this.height=this.ha.s.height;this.Ud={source:this.ha.s,Fa:this.ha.Fa,Gb:this.ha.Gb};this.b=f;a=this.Ie();f=new Yb(0,0,a[0].width,a[0].height);pg.call(this,b,c,d,f,a,k,l)}L.d.yj(th);
th.prototype.Ie=function(){var a,b,c,d,f,h,k,l=this.Ud.Fa+this.Ud.Gb;b=this.height-(this.ha.xd||0);var n=this.Ud.source;void 0===this.width?a=this.b.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.b.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.b.width))));k=Math.min(a/this.b.width,b/this.b.height);k=Math.min(k,1);f=Math.round(this.Ud.Fa+
(a-this.b.width*k)/2);h=Math.round((b-this.b.height*k)/2);c=[];for(b=0;b<n.F;b++){d=new r(a+l,this.height);w(d);n.Ea(b,0,0,this.Ud.Fa,this.height,0,0,1);n.Xk(b,this.Ud.Fa,0,n.width-l,this.height,this.Ud.Fa,0,a,this.height,1);n.Ea(b,this.Ud.Fa+n.width-l,0,this.Ud.Gb,this.height,this.Ud.Fa+a,0,1);try{m.context.drawImage(this.b,f,h,this.b.width*k,this.b.height*k)}catch(q){}y(d);c.push(d)}return c};L.d.yj(function(a,b,c,d,f,h,k){pg.call(this,a,b,c,f,d,h,k)});
function Gg(a,b,c,d,f,h,k,l){var n;this.ha=L.a.u.rc[a];a=void 0!==L.a.T.buttons?L.a.u.Fk[L.a.T.buttons[a]||L.a.T.buttons.default_color]:L.a.u.Fk[L.a.u.buttons.default_color];this.font=V.K();a.font&&z(this.font,a.font);this.ha.fontSize&&A(this.font,this.ha.fontSize);void 0!==h&&(this.width=h);this.height=this.ha.s.height;this.aa=this.ha.aa;if(this.aa.length){for(h=0;h<this.aa.length;h++)if(this.aa[h].id===f){this.Qa=h;break}void 0===this.Qa&&(this.Qa=0);this.text=L.l.H(this.aa[this.Qa].S,"<"+this.aa[this.Qa].id.toUpperCase()+
">");this.$g=this.aa[this.Qa].s;h=this.Ie();a=new Yb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?f=function(){n.Ng();return k(n.aa[n.Qa].id)}:"object"===typeof k?(f={},f.wc=k.wc,f.wa=this,f.da=function(){n.Ng();return k.da.call(k.wa,n.aa[n.Qa].id)}):f=function(){n.Ng()};pg.call(this,b,c,d,a,h,f,l)}}L.d.yj(Gg);e=Gg.prototype;
e.Ng=function(a){var b;if(void 0===a)this.Qa=(this.Qa+1)%this.aa.length;else for(b=0;b<this.aa.length;b++)if(this.aa[b].id===a){this.Qa=b;break}this.$j(this.aa[this.Qa].s,L.l.H(this.aa[this.Qa].S,"<"+this.aa[this.Qa].id.toUpperCase()+">"))};e.nm=function(a){a&&z(this.font,a);this.text=L.l.H(this.aa[this.Qa].S,"<"+this.aa[this.Qa].id.toUpperCase()+">");Vg(this,this.Ie())};e.$j=function(a,b,c){this.text=b;this.$g=a;c&&z(this.font,c);Vg(this,this.Ie())};
e.Ie=function(){var a,b,c,d,f,h,k=this.ha.Fa,l=this.ha.Gb,n=k+l;f=Math.abs(k-l);d=this.height-(this.ha.xd||0);var q=this.ha.s,u=this.font.K();b=u.$(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Wa(u,this.text,a,d,!0);d<u.fontSize&&A(u,d);b=u.$(this.text,
a);d=k;c=u.align;"center"===c?d=a-f>=b?d+Math.round((a-f)/2):d+(this.ha.Ug+Math.round(b/2)):"left"===c?d+=this.ha.Ug:"right"===c&&(d+=a);f=Math.round(this.height/2);void 0!==this.ha.wd&&(f+=this.ha.wd);c=[];for(b=0;b<q.F;b++)h=new r(a+n,this.height),w(h),q.Ea(b,0,0,k,this.height,0,0,1),q.Xk(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.Ea(b,k+q.width-n,0,l,this.height,k+a,0,1),this.$g.o(0,this.ha.gi,this.ha.hi),u.o(this.text,d,f,a),y(h),c.push(h);return c};e.Tc=function(a){a===L.Bf&&this.nm()};
function uh(a,b,c,d,f,h,k){var l;this.aa=L.a.u.rc[a].aa;if(this.aa.length){for(a=0;a<this.aa.length;a++)if(this.aa[a].id===f){this.Qa=a;break}void 0===this.Qa&&(this.Qa=0);this.$g=this.aa[this.Qa].s;a=new $b(this.$g);l=this;f="function"===typeof h?function(){l.Ng();return h(l.aa[l.Qa].id)}:"object"===typeof h?{wa:this,da:function(){l.Ng();return h.da.call(h.wa,l.aa[l.Qa].id)}}:function(){l.Ng()};pg.call(this,b,c,d,a,[this.$g],f,k)}}L.d.yj(uh);
uh.prototype.Ng=function(a){var b;if(void 0===a)this.Qa=(this.Qa+1)%this.aa.length;else for(b=0;b<this.aa.length;b++)if(this.aa[b].id===a){this.Qa=b;break}this.$j(this.aa[this.Qa].s)};uh.prototype.$j=function(a){this.$g=a;Vg(this,[].concat(this.$g))};
function Eh(a,b,c,d){this.depth=10;this.visible=!1;this.h=!0;L.d.Ma(this,L.Jc);var f;this.a=L.a.u.Fl;if("landscape"===L.orientation&&L.a.u.Ko)for(f in L.a.u.Ko)this.a[f]=L.a.u.Ko[f];for(f in L.a.T.Fl)this.a[f]=L.a.T.Fl[f];this.Bo=a;this.sn=b;this.da=c;this.wa=d;this.Ij="entering";this.iu=!1;I(this,!1);Sb(this,"LevelStartDialog")}
function Fh(a){var b,c,d,f,h;if("leaving"!==a.Ij){a.Ij="leaving";a.gg=0;b=function(){J(H,a);a.wa?a.da.call(a.wa):a.da&&a.da()};if(void 0!==a.a.lp)for(c=0;c<a.a.lp.length;c++)d=a.a.lp[c],f=void 0,d.Nq&&(a.gg++,f=b),h=d.end,"x"===d.type?h=L.d.g(h,a.canvas.width,a.f.b.width):"y"===d.type&&(h=L.d.g(h,a.canvas.height,a.f.b.height)+Math.abs(L.ta)),qh(a.f,d.type,h,d.duration,d.mb,f,d.Pa,d.loop,d.To);0===a.gg&&b()}}e=Eh.prototype;
e.bc=function(){var a,b,c,d,f,h,k=this;a=this.a.td;b=a.width;f=a.height;this.f=new mh(this.depth+10,this.Sa,new r(b,f));w(this.f.b);a.o(0,0,0);""!==this.sn&&(c=L.d.g(this.a.Su,b,0),d=L.d.g(this.a.Cq,f,0),a=V.K(),z(a,this.a.Aq),void 0!==this.a.Qi&&void 0!==this.a.Bq&&(h=Wa(a,this.sn,this.a.Qi,this.a.Bq,this.a.Qi),a.fontSize>h&&A(a,h)),a.o(this.sn,c,d,this.a.Qi));""!==this.Bo&&(c=L.d.g(this.a.Zv,b,0),d=L.d.g(this.a.Rr,f,0),a=V.K(),z(a,this.a.Pr),void 0!==this.a.uj&&void 0!==this.a.Qr&&(h=Wa(a,this.Bo,
this.a.uj,this.a.Qr,this.a.uj),a.fontSize>h&&A(a,h)),a.o(this.Bo,c,d,this.a.uj));y(this.f.b);this.f.x=L.d.g(this.a.Us,this.canvas.width,b);this.f.y=L.d.g(this.a.Vs,this.canvas.height,f)+Math.abs(L.ta);this.gg=0;a=function(){k.gg--;0===k.gg&&(k.Ij="paused")};if(void 0!==this.a.$l)for(b=0;b<this.a.$l.length;b++)f=this.a.$l[b],c=void 0,f.Nq&&(this.gg++,c=a),d=f.end,"x"===f.type?d=L.d.g(d,this.canvas.width,this.f.b.width):"y"===f.type&&(d=L.d.g(d,this.canvas.height,this.f.b.height)+Math.abs(L.ta)),qh(this.f,
f.type,d,f.duration,f.mb,c,f.Pa,f.loop,f.To),void 0!==f.Vb&&F.play(f.Vb);0===this.gg&&(this.Ij="paused");this.m=0};e.ob=function(){J(H,this.f)};e.X=function(a){"paused"!==this.state&&(this.m+=a,this.m>=this.a.Ws&&Fh(this))};e.Bb=function(){return this.iu=!0};e.Cb=function(){this.iu&&"paused"===this.Ij&&Fh(this);return!0};
function mh(a,b,c){this.depth=a;this.h=this.visible=!0;L.d.Ma(this,b);this.b=c;this.hc=0;this.width=c.width;this.height=c.height;this.Ld=this.Kd=this.y=this.x=0;this.hb=this.eb=1;this.na=0;this.alpha=1;this.Hb=[];this.zq=0;this.parent={x:0,y:0};this.qd=!0;I(this,!1)}
function qh(a,b,c,d,f,h,k,l,n){var q,u=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.eb;break;case "yScale":q=a.hb;break;case "scale":b="xScale";q=a.eb;qh(a,"yScale",c,d,f,void 0,k,l,n);break;case "angle":q=a.na;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.Hb.push({id:a.zq,m:0,h:!0,Tk:u,type:b,start:q,end:c,jb:h,duration:d,mb:f,Pa:k,loop:l,To:n});a.zq++}
function ah(a){var b;for(b=a.Hb.length-1;0<=b;b--){switch(a.Hb[b].type){case "x":a.x=a.Hb[b].end;break;case "y":a.y=a.Hb[b].end;break;case "xScale":a.eb=a.Hb[b].end;break;case "yScale":a.hb=a.Hb[b].end;break;case "angle":a.na=a.Hb[b].end;break;case "alpha":a.alpha=a.Hb[b].end;break;case "subImage":a.hc=a.Hb[b].end}"function"===typeof a.Hb[b].jb&&a.Hb[b].jb.call(a)}}
mh.prototype.X=function(a){var b,c,d;for(b=0;b<this.Hb.length;b++)if(c=this.Hb[b],c.h&&(c.m+=a,c.Tk&&c.m>=c.Pa&&(c.m%=c.Pa,c.Tk=!1),!c.Tk)){c.m>=c.duration?(d=c.end,c.loop?(c.Tk=!0,c.Pa=c.To,c.m%=c.duration):("function"===typeof c.jb&&c.jb.call(this),this.Hb[b]=void 0)):"subImage"===c.type?(d=this.b instanceof Array?this.b.length:this.b.F,d=Math.floor(c.m*d/c.duration)):d=c.mb(c.m,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.eb=
d;break;case "yScale":this.hb=d;break;case "angle":this.na=d;break;case "alpha":this.alpha=d;break;case "subImage":this.hc=d}this.canvas.Z=!0}for(b=this.Hb.length-1;0<=b;b--)void 0===this.Hb[b]&&this.Hb.splice(b,1)};
mh.prototype.pa=function(){var a,b,c;b=Math.round(this.x-this.eb*this.Kd)+this.parent.x;c=Math.round(this.y-this.hb*this.Ld)+this.parent.y;a=this.b;a instanceof Array&&(a=this.b[this.hc%this.b.length]);a instanceof r?a.R(b,c,this.eb,this.hb,this.na,this.alpha):a.R(this.hc,b,c,this.eb,this.hb,this.na,this.alpha);this.qd=!1};
function fh(a,b,c,d,f,h,k,l,n,q,u){this.depth=f;this.visible=!0;this.h=!1;L.d.Ma(this,L.Jc);this.x=a;this.y=b;this.Vo=l;this.Wo="object"===typeof n?n.top:n;this.Ew="object"===typeof n?n.bottom:n;this.$=c;this.W=d;this.width=this.$+2*this.Vo;this.height=this.W+this.Wo+this.Ew;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof u?u:function(a){return a+""};this.alpha=1;this.gc=this.fc=this.Ld=this.Kd=0;c=new r(this.width,this.height);this.rh=new mh(this.depth,this.Sa,
c);this.rh.x=a-this.Vo;this.rh.y=b-this.Wo;this.rh.parent=q;this.J=this.rh.b;this.ge();I(this)}fh.prototype.ob=function(){J(H,this.rh)};function ph(a,b,c){a.h=!0;a.eg=a.value;a.value=a.eg;a.end=b;a.duration=c;a.mb=K;a.m=0}
fh.prototype.ge=function(){var a,b;a=this.font.align;b=this.font.j;var c=this.Vo,d=this.Wo;this.Gq||(this.J.clear(),this.canvas.Z=!0);w(this.J);this.Gq&&this.Gq.Ea(0,this.uz,this.vz,this.tz,this.sz,0,0,1);"center"===a?c+=Math.round(this.$/2):"right"===a&&(c+=this.$);"middle"===b?d+=Math.round(this.W/2):"bottom"===b&&(d+=this.W);b=this.toString(this.value);a=Wa(this.font,b,this.$,this.W,!0);a<this.font.fontSize&&A(this.font,a);this.font.o(b,c,d,this.$);y(this.J);this.rh.qd=!0};
fh.prototype.X=function(a){var b;b=Math.round(this.mb(this.m,this.eg,this.end-this.eg,this.duration));this.m>=this.duration?(this.value=this.end,this.h=!1,this.ge()):b!==this.value&&(this.value=b,this.ge());this.m+=a};function Gh(a,b,c){this.depth=-100;this.visible=!1;this.h=!0;this.Kx=a;L.d.Ma(this,L.Jc);this.a=L.a.u.Hn;this.Hc=L.a.u.rc;this.Wq=b;for(var d in L.a.T.Hn)this.a[d]=L.a.T.Hn[d];this.mp=!1!==c;I(this)}e=Gh.prototype;e.fu=function(){};
e.Oi=function(a,b,c,d,f){b=new Kg("default_text",b,c,this.depth-20,a.S||"NO_TEXT_KEY_GIVEN",d,{da:function(){a.da&&(a.wa?a.da.call(a.wa,a):a.da(a))},wa:this},this.f);this.buttons.push(b);a.text&&b.$j(b.b,a.text);this.buttons[this.buttons.length-1].Ab=f||!1};
e.Ra=function(a,b,c){w(this.f.b);m.clear();this.a.backgroundImage.o(0,0,0);a=c?c:this.Kx;b=V.K();this.a.ct&&z(b,this.a.ct);c=Wa(b,a,this.a.qp,this.a.pp,!0);c<b.fontSize&&A(b,c);c=b.$(a,this.a.qp)+10;var d=b.W(a,this.a.pp)+10;b.o(a,L.d.Da(this.a.Px,this.f.b.width,c,b.align),L.d.Da(this.a.Qx,this.f.b.height-Hh(this),d,b.j),c);y(this.f.b)};function Hh(a){var b=a.Wq;return L.d.g(a.a.xh,a.f.b.height,a.Hc.default_text.s.height*b.length+a.a.Vd*(b.length-1))}
e.bg=function(a,b){var c,d,f,h,k,l,n,q,u,B=[],B=this.Wq;f=this.Hc.default_text.s.height;h=this.a.Hk;k=L.d.g(this.a.Gk,this.canvas.width,h)-a;q=Hh(this);for(c=B.length-1;0<=c;c--){n=k;u=h;if("object"===typeof B[c]&&B[c].hasOwnProperty("length")&&B[c].length)for(l=B[c],u=(h-(l.length-1)*this.a.Vd)/l.length,d=0;d<l.length;d++)this.Oi(l[d],n,q,u,b),n+=u+this.a.Vd;else this.Oi(B[c],n,q,u,b);q-=f+this.a.Vd}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.kt(!0);this.f.visible=!0};e.close=function(){J(H,this);return this.canvas.Z=!0};function Ih(a){var b=L.e.qf;b.Ra(b.f.x,b.f.y,a);for(a=0;a<b.buttons.length;a++)J(H,b.buttons[a]);b.canvas.Z=!0}
e.bc=function(){var a,b;this.mp&&lh(this);a=this.a.backgroundImage;this.f=new mh(this.depth-10,this.Sa,new r(a.width,a.height));this.f.x=L.d.g(this.a.zc,this.canvas.width,a.width);a=L.d.g(this.a.dc,this.canvas.height,a.height)+-1*("landscape"===L.orientation?L.a.u.Jk:L.a.u.Wd).Ol;this.f.y=a;this.Ra(this.f.x,this.f.y);this.buttons=[];this.bg(this.f.x);b=this;this.f.y=-this.f.b.height;qh(this.f,"y",a,this.a.Yl,this.a.Zl,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ab=!0})};
e.ob=function(){var a;this.mp&&rh();for(a=0;a<this.buttons.length;a++)J(H,this.buttons[a]);J(H,this.f);L.e.ue===this&&(L.e.ue=null)};e.Cb=function(){return!0};e.Bb=function(){return!0};
function Jh(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,f=0;c=d=0;for(var f=a.length,h=0;h<f;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,f));return b}
function Dg(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,f,h,l){a=k(a,k(k(c^(b|~d),f),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,f,h,l){a=k(a,k(k(b^c^d,f),l));return k(a<<h|a>>>32-h,b)}function f(a,b,c,d,f,h,l){a=k(a,k(k(b&d|c&~d,f),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,f,h,l){a=k(a,k(k(b&c|~b&d,f),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,f,h,k;f=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^f^h:c|d?k&1073741824?k^3221225472^f^h:k^1073741824^f^h:k^f^h}var l=[],n,q,u,B,C,t,s,v,x;a=Jh(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),f=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,f[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;f[b]|=128<<k%4*8;f[d-2]=c<<3;f[d-1]=c>>>29;return f}(a);t=1732584193;s=4023233417;v=2562383102;x=271733878;a=l.length;for(n=0;n<a;n+=16)q=t,u=s,B=v,C=x,t=h(t,s,v,x,l[n+
0],7,3614090360),x=h(x,t,s,v,l[n+1],12,3905402710),v=h(v,x,t,s,l[n+2],17,606105819),s=h(s,v,x,t,l[n+3],22,3250441966),t=h(t,s,v,x,l[n+4],7,4118548399),x=h(x,t,s,v,l[n+5],12,1200080426),v=h(v,x,t,s,l[n+6],17,2821735955),s=h(s,v,x,t,l[n+7],22,4249261313),t=h(t,s,v,x,l[n+8],7,1770035416),x=h(x,t,s,v,l[n+9],12,2336552879),v=h(v,x,t,s,l[n+10],17,4294925233),s=h(s,v,x,t,l[n+11],22,2304563134),t=h(t,s,v,x,l[n+12],7,1804603682),x=h(x,t,s,v,l[n+13],12,4254626195),v=h(v,x,t,s,l[n+14],17,2792965006),s=h(s,v,
x,t,l[n+15],22,1236535329),t=f(t,s,v,x,l[n+1],5,4129170786),x=f(x,t,s,v,l[n+6],9,3225465664),v=f(v,x,t,s,l[n+11],14,643717713),s=f(s,v,x,t,l[n+0],20,3921069994),t=f(t,s,v,x,l[n+5],5,3593408605),x=f(x,t,s,v,l[n+10],9,38016083),v=f(v,x,t,s,l[n+15],14,3634488961),s=f(s,v,x,t,l[n+4],20,3889429448),t=f(t,s,v,x,l[n+9],5,568446438),x=f(x,t,s,v,l[n+14],9,3275163606),v=f(v,x,t,s,l[n+3],14,4107603335),s=f(s,v,x,t,l[n+8],20,1163531501),t=f(t,s,v,x,l[n+13],5,2850285829),x=f(x,t,s,v,l[n+2],9,4243563512),v=f(v,
x,t,s,l[n+7],14,1735328473),s=f(s,v,x,t,l[n+12],20,2368359562),t=d(t,s,v,x,l[n+5],4,4294588738),x=d(x,t,s,v,l[n+8],11,2272392833),v=d(v,x,t,s,l[n+11],16,1839030562),s=d(s,v,x,t,l[n+14],23,4259657740),t=d(t,s,v,x,l[n+1],4,2763975236),x=d(x,t,s,v,l[n+4],11,1272893353),v=d(v,x,t,s,l[n+7],16,4139469664),s=d(s,v,x,t,l[n+10],23,3200236656),t=d(t,s,v,x,l[n+13],4,681279174),x=d(x,t,s,v,l[n+0],11,3936430074),v=d(v,x,t,s,l[n+3],16,3572445317),s=d(s,v,x,t,l[n+6],23,76029189),t=d(t,s,v,x,l[n+9],4,3654602809),
x=d(x,t,s,v,l[n+12],11,3873151461),v=d(v,x,t,s,l[n+15],16,530742520),s=d(s,v,x,t,l[n+2],23,3299628645),t=c(t,s,v,x,l[n+0],6,4096336452),x=c(x,t,s,v,l[n+7],10,1126891415),v=c(v,x,t,s,l[n+14],15,2878612391),s=c(s,v,x,t,l[n+5],21,4237533241),t=c(t,s,v,x,l[n+12],6,1700485571),x=c(x,t,s,v,l[n+3],10,2399980690),v=c(v,x,t,s,l[n+10],15,4293915773),s=c(s,v,x,t,l[n+1],21,2240044497),t=c(t,s,v,x,l[n+8],6,1873313359),x=c(x,t,s,v,l[n+15],10,4264355552),v=c(v,x,t,s,l[n+6],15,2734768916),s=c(s,v,x,t,l[n+13],21,
1309151649),t=c(t,s,v,x,l[n+4],6,4149444226),x=c(x,t,s,v,l[n+11],10,3174756917),v=c(v,x,t,s,l[n+2],15,718787259),s=c(s,v,x,t,l[n+9],21,3951481745),t=k(t,q),s=k(s,u),v=k(v,B),x=k(x,C);return(b(t)+b(s)+b(v)+b(x)).toLowerCase()}var nh;
function Kh(a,b){var c=L.w.wl.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(f){}}function Lh(a){Kh("call=api_is_valid",function(b){a(b.is_valid)})}
function oh(a,b){Kh("call=is_highscore&score="+a,function(a){0<=a.position?(nh=a.code,b(void 0!==nh)):b(!1)})}
TG_StatObjectFactory={Oz:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},Mz:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,Mh(),Mh(),!0)},Lz:function(a,b,c,d,f){return new TG_StatObject(a,b,c,0,d,f,!0,"max"===L.n.Ah?function(a){return a+d}:function(a){return a-d})},Nz:function(a,b,c,d,f){return new TG_StatObject(a,b,c,0,d,f,!0,"max"===L.n.Ah?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,f,h,k,l,n){this.id=a;this.type=b;this.key=c;this.uc=d;this.Pg=void 0!==f?f:this.uc;this.visible=void 0!==h?h:!0;this.sf=void 0!==k?k:this.uc!==this.Pg;this.ne=l;this.$h=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return L.d.Qp(1E3*a)}}};
TG_StatObject.prototype.K=function(){return new TG_StatObject(this.id,this.type,this.key,this.uc,this.Pg,this.visible,this.sf,this.ne,this.$h)};L.version=L.version||{};L.version.tg="2.13.0";function Nh(a,b,c,d,f,h,k,l){this.depth=c;this.h=this.visible=!0;this.group="Floater";this.x=a;this.y=b;this.J=d;this.uu=f;this.Kj=h;this.$b=k;this.scale=this.state=this.m=0;this.alpha=1;this.Yx=l||uc;L.d.Ma(this,L.Eh);"undefined"===typeof this.canvas&&(this.canvas=L.de);I(this)}
Nh.prototype.ob=function(){this.canvas.Z=!0};Nh.prototype.X=function(a){this.m+=a;0===this.state?this.m>=this.Kj?(this.state=this.scale=1,this.m=0):(this.y+=this.uu*a/1E3,this.scale=this.Yx(this.m,0,1,this.Kj)):(this.m>=this.$b&&J(H,this),this.y+=this.uu*a/1E3,this.alpha=1-this.m/this.$b);this.canvas.Z=!0};Nh.prototype.pa=function(){this.J.R(this.x-this.J.width*this.scale/2,this.y-this.J.height*this.scale/2,this.scale,this.scale,0,this.alpha)};
function Oh(a){this.depth=1E3;this.h=this.visible=!1;this.group=a;I(this)}function Ph(a,b,c,d,f,h,k,l){var n;if(l&&l.hasOwnProperty(b))return new Nh(c,d,-450,l[b],f,200,h,k);n=new r(a.$(b)+10+50,a.W(b)+50);w(n);a.align="left";a.j="top";a.o(b,30,25);y(n);l&&(l[b]=n);return new Nh(c,d,-450,n,f,200,h,k)}Oh.prototype.sp=function(){var a,b;a=Tb(H,function(a){return"Floater"===a.group});for(b=0;b<a.length;b+=1)J(H,a[b])};
Oh.prototype.bc=function(){var a,b,c,d,f,h;this.Ev=[];b=[Q,R,S,T];a=[L.l.H("Floater1","<FLOATER_1>"),L.l.H("Floater2","<FLOATER_2>"),L.l.H("Floater3","<FLOATER_3>"),L.l.H("Floater4","<FLOATER_4>")];for(c=0;c<b.length;c+=1)d=b[c],f=a[Math.min(c,a.length)],h=new r(d.$(f)+10,d.W(f)),w(h),d.align="left",d.j="top",d.o(f,5,0),y(h),this.Ev.push(h)};Oh.prototype.ob=function(){this.sp()};
var Y={Ut:{},Vt:{},Wt:{},Xt:{},dp:{},ep:{},Ly:{},dw:{},Ku:function(){Y.Ut={xc:Y.Sk,update:Y.Le,tc:Y.Je,end:Y.Ke,font:Ve,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.Vt={xc:Y.Sk,update:Y.Le,tc:Y.Je,end:Y.Ke,font:We,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.Wt={xc:Y.Sk,update:Y.Le,tc:Y.Je,end:Y.Ke,font:Xe,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.Xt={xc:Y.Sk,update:Y.Le,tc:Y.Je,end:Y.Ke,font:Ye,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],
[.1,.8,.1])};Y.dp={xc:Y.nv,update:Y.Le,tc:Y.Je,end:Y.Ke,jj:Ze,ij:$e,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.ep={xc:Y.ov,update:Y.Le,tc:Y.Je,end:Y.Ke,jj:Ze,ij:$e,margin:20,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.Ly={xc:Y.pv,update:Y.Le,tc:Y.Je,end:Y.Ke,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])};Y.dw={xc:Y.mv,update:Y.Le,tc:Y.Je,end:Y.Ke,Yd:K,Zd:K,Xd:wc([nc,ic,nc],[!1,!1,!0],[.1,.8,.1])}},Iz:function(a){function b(a){var d,f={};for(d in a)f[d]="object"===
typeof a[d]&&null!==a[d]?b(a[d]):a[d];return f}return b(a)},WB:function(a){Y.Ut.font.L=a;Y.Vt.font.L=a;Y.Wt.font.L=a;Y.Xt.font.L=a},VB:function(a){Y.dp.jj.L=a;Y.dp.ij.L=a;Y.ep.jj.L=a;Y.ep.ij.L=a},pi:!1,Dc:[],UB:function(a){Y.pi=a},nA:function(){return Y.pi},Tx:function(a){var b,c;for(b=0;b<Y.Dc.length;b+=1)c=Y.Dc[b],void 0===c||void 0!==a&&c.kind!==a||0<c.Uh||(Y.Dc[b]=void 0)},Ju:function(){Y.pi=!1;Y.Dc=[]},ri:function(a,b,c,d){var f,h,k;void 0===d&&(d=Y.pi);if(d)for(h=0;h<Y.Dc.length;h+=1)if(f=Y.Dc[h],
void 0!==f&&f.Af&&f.kind===a&&f.font===b&&f.text===c)return f.Uh+=1,h;f={kind:a,font:b,text:c,Uh:1,Af:d};h=b.align;k=b.j;D(b,"center");E(b,"middle");d=b.$(c)+2*a.margin;a=b.W(c)+2*a.margin;f.J=new r(d,a);w(f.J);b.o(c,d/2,a/2);y(f.J);D(b,h);E(b,k);for(h=0;h<Y.Dc.length;h+=1)if(void 0===Y.Dc[h])return Y.Dc[h]=f,h;Y.Dc.push(f);return Y.Dc.length-1},Iu:function(a){var b=Y.Dc[a];b.Uh-=1;0>=b.Uh&&!b.Af&&(Y.Dc[a]=void 0)},Sk:function(a){a.buffer=Y.ri(a.kind,a.kind.font,a.value,a.Af)},nv:function(a){var b=
a.value.toString();a.buffer=0<=a.value?Y.ri(a.kind,a.kind.jj,b,a.Af):Y.ri(a.kind,a.kind.ij,b,a.Af)},ov:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?Y.ri(a.kind,a.kind.jj,b,a.Af):Y.ri(a.kind,a.kind.ij,b,a.Af)},pv:function(a){a.J=a.value},mv:function(a){a.b=a.value;a.hc=0},Le:function(a){a.x=void 0!==a.kind.Yd?a.kind.Yd(a.time,a.wm,a.tr-a.wm,a.duration):a.wm+a.time/a.duration*(a.tr-a.wm);a.y=void 0!==a.kind.Zd?a.kind.Zd(a.time,a.xm,a.ur-a.xm,a.duration):a.xm+a.time/
a.duration*(a.ur-a.xm);void 0!==a.kind.qr&&(a.fc=a.kind.qr(a.time,0,1,a.duration));void 0!==a.kind.rr&&(a.gc=a.kind.rr(a.time,0,1,a.duration));void 0!==a.kind.Xd&&(a.alpha=a.kind.Xd(a.time,0,1,a.duration));void 0!==a.kind.uv&&(a.na=a.kind.uv(a.time,0,360,a.duration)%360);void 0!==a.b&&(a.hc=a.time*a.b.F/a.duration)},Je:function(a){var b=m.context,c;void 0!==a.b&&null!==a.images?1===a.fc&&1===a.gc&&0===a.na?a.b.md(Math.floor(a.hc),a.x,a.y,a.alpha):a.b.R(Math.floor(a.hc),a.x,a.y,a.fc,a.gc,a.na,a.alpha):
(c=void 0!==a.J&&null!==a.J?a.J:Y.Dc[a.buffer].J,1===a.fc&&1===a.gc&&0===a.na?c.md(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.fc)||1E-4>Math.abs(a.gc)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.na*Math.PI/180),b.scale(a.fc,a.gc),c.md(-c.width/2,-c.height/2,a.alpha),b.restore()))},Ke:function(a){void 0!==a.buffer&&Y.Iu(a.buffer)},Re:function(a){var b,c,d=!1;for(b=0;b<Y.Zb.length;b+=1)c=Y.Zb[b],void 0!==c&&(0<c.Pa?(c.Pa-=a,0>c.Pa&&(c.time+=-c.Pa,c.Pa=0)):c.time+=a,0<c.Pa||(c.time>=c.duration?
(c.kind.end(c),Y.Zb[b]=void 0):c.kind.update(c),d=!0));d&&(Y.canvas.Z=!0)},pa:function(){var a,b;for(a=0;a<Y.Zb.length;a+=1)b=Y.Zb[a],void 0!==b&&(0<b.Pa||b.kind.tc(b))},Zb:[],uA:function(a,b,c){Y.wv();void 0===a&&(a=L.Eh);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);Y.visible=!0;Y.h=!0;L.d.Ma(Y,a);Y.depth=b;I(Y);Sb(Y,c);Y.Ju();Y.Ku()},jz:function(a,b,c,d,f,h,k,l,n){void 0===l&&(l=void 0!==a.Pa?a.Pa:0);void 0===n&&(n=Y.pi);void 0===f&&void 0!==a.hx&&(f=c+a.hx);void 0===h&&void 0!==a.ix&&(h=d+a.ix);
void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,wm:c,xm:d,tr:f,ur:h,x:c,y:d,fc:1,gc:1,alpha:1,na:0,time:0,duration:k,Pa:l,Af:n};a.kind.xc(a);for(b=0;b<Y.Zb.length;b+=1)if(void 0===Y.Zb[b])return Y.Zb[b]=a,b;Y.Zb.push(a);return Y.Zb.length-1},yB:function(a){var b;0>a||a>=Y.Zb.length||(b=Y.Zb[a],void 0!==b&&(b.kind.end(b),Y.Zb[a]=void 0))},sp:function(){var a,b;for(a=0;a<Y.Zb.length;a+=1)b=Y.Zb[a],void 0!==b&&(b.kind.end(b),Y.Zb[a]=void 0);Y.Zb=[]},wv:function(){Y.sp();Y.Tx();J(H,
Y)}};function Qh(a){this.depth=-99;L.d.Ma(this,L.Jc);this.h=!0;this.visible=!1;this.e=a;I(this)}Qh.prototype.yg=function(){};Qh.prototype.zg=function(){};Qh.prototype.Bb=function(a,b,c){a:{var d=this.e,f;for(f=0;f<d.cd.length;++f)if(d.cd[f].Bb&&d.cd[f].Bb(a,b,c)){a=!0;break a}a=!1}return a};
Qh.prototype.Cb=function(a,b,c){var d;a:if(d=this.e,d.wb&&a===d.Yp)a=d.wb.a.x,b=d.wb.a.y,d.wb.hp&&(a=d.wb.hp.x,b=d.wb.hp.y),Rh?console.log("Component:\n x: tgScale("+(a+d.wb.dh.x-Sh)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.wb.dh.y-Th)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.wb.dh.x)+"),\n y: tgScale("+(b+d.wb.dh.y)+"),"),d.qu=!1,d=!0;else{for(var f=0;f<d.cd.length;++f)if(d.cd[f].Cb&&d.cd[f].Cb(a,b,c)){d=!0;break a}d=!1}return d};
function Uh(){this.Sa=this.depth=0;this.Kn=this.ec=this.h=this.visible=!1;this.cd=[];this.dl={};this.dl.Ze=!1;this.vr={};this.paused=this.vr.Ze=!1;this.Ey=new r(0,0);this.Gy=this.Fy=0;this.wb=null;this.Yp=this.su=this.ru=-1;this.qu=!1;this.Tb=this.Sb=0;this.Cl=null}e=Uh.prototype;e.bc=function(){this.Cl=new Qh(this)};e.ob=function(){this.Cl&&(J(H,this.Cl),this.Cl=null)};
function Vh(a,b,c){for(var d in b){var f=b[d];f.b?c[d]=new Wh(a,f):f.$t?c[d]=new Xh(a,L.l.H(f.$t,"<"+f.$t+">"),f):f.S?c[d]=new Xh(a,L.l.H(f.S,"<"+f.S+">"),f):f.text&&(c[d]=new Xh(a,f.text,f))}}function Yh(a,b){a.Ze&&(a.m+=b,a.m>=a.duration&&(a.Ze=!1,a.jb&&a.jb()))}
e.X=function(a){Yh(this.dl,a);Yh(this.vr,a);for(var b=0;b<this.cd.length;++b)this.cd[b].X(a);if(this.wb&&this.qu){a=H.fa[this.Yp].x;b=H.fa[this.Yp].y;this.canvas===L.d.xg(L.wg)&&this.wb.sl(this.Sb+L.Qe,this.Tb+L.be);var c=a-this.ru,d=b-this.su;this.wb.x+=c;this.wb.y+=d;this.wb.dh.x+=c;this.wb.dh.y+=d;this.ru=a;this.su=b;this.ec=!0}};e.Re=function(){if(this.ec){var a=L.d.xg(L.wg);this.canvas!==a?this.canvas.Z=this.ec:(m.ia(a),this.pa())}};
e.Zk=function(a,b){for(var c=L.d.xg(L.wg)===this.canvas,d=0;d<this.cd.length;++d){var f=this.cd[d];f.visible&&(c&&f.sl(a,b),f.pa(a,b))}};e.pa=function(){var a=0,b=0;L.d.xg(L.ol)!==this.canvas&&(a=L.Qe,b=L.be);this.paused?this.Ey.o(this.Fy+this.Sb+a,this.Gy+this.Tb+b):this.Zk(this.Sb+a,this.Tb+b);this.ec=!1};function Zh(){this.Tr=[];this.wr=[];this.lt=null;this.un=void 0;this.$n=!0}
function $h(a){function b(a,b){if(!b)return!1;var f=0;if("string"===typeof a){if(d(a))return!1}else for(f=0;f<a.length;++f)if(d(a[f]))return!1;if(b.Tz){if("string"===typeof a){if(c(a))return!0}else for(f=0;f<a.length;++f)if(c(a[f]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var f;if(a instanceof Zh){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
f=a}else f=new Zh,f.Tr=arguments[0],f.wr=arguments[1],f.lt=arguments[2];var h=null,k=null,l=null,h=f.Tr,k=f.wr,l=f.lt;this.Vh=f;void 0===this.Vh.un&&(this.Vh.un=!Fg(L.e));Uh.apply(this,arguments);I(this);this.h=this.visible=!0;k=k||[];h=h||[];this.cu=2;this.Ck=this.cy=!1;this.p=l||ai;this.ir=L.ol;void 0!==this.p.Sa&&(this.ir=this.p.Sa);L.d.Ma(this,this.ir);this.gk=this.fk=0;this.p.background.Yr&&(this.fk=this.p.background.Yr);this.p.background.Zr&&(this.gk=this.p.background.Zr);this.p.background.elements||
(this.zd=this.p.background.b);this.p.background.rz?(Vh(this,this.p.background.elements,{}),this.zd=this.p.background.b):(f=this.p.background.b,l=new Uh,Vh(l,this.p.background.elements,[]),f||this.Sa!==L.wg?(this.zd=new r(f.width,f.height),w(this.zd),f.o(0,0,0),l.Zk(-this.fk,-this.gk),y(this.zd)):(m.ia(L.d.xg(this.Sa)),l.pa()));var n=this;this.as=0;b("score",this.p.ft)?(this.rm=new bi(this,this.p.ft,"SCORE",0,!0),this.p.Zx&&new Wh(this,this.p.Zx)):this.rm=new ci(0,0);this.vj=b("highScore",this.p.Ur)?
new bi(this,this.p.Ur,"HIGHSCORE",0,!1):new ci(0,0);b("highScore",this.p.cw)&&new Wh(this,this.p.cw);this.Zh=b(["stage","level"],this.p.yt)?new bi(this,this.p.yt,"STAGE",0,!1):new ci(0,0);b("lives",this.p.qw)&&new bi(this,this.p.qw,"LIVES",0,!1);this.Gm=b("time",this.p.time)?new bi(this,this.p.time,"TIME",0,!1,function(a){return n.Qp(a)}):new ci(0,0);this.Gm.Kf(36E4);if(this.p.Fb&&this.p.bt)throw"Don't define both progress and progressFill in your game_ui settings";this.Nj=b("progress",this.p.Fb)?
this.p.Fb.round?new di(this,this.p.Fb):new ei(this,this.p.Fb):b("progress",this.p.bt)?new ei(this,this.p.bt):new ci(0,0);b("lives",this.p.$v)&&new Wh(this,this.p.$v);b("difficulty",this.p.In)?new Xh(this,fi().toUpperCase(),this.p.In):fi();b("difficulty",this.p.ej)&&(f=s_ui_smiley_medium,f=(this.p.ej.images?this.p.ej.images:[s_ui_smiley_easy,s_ui_smiley_medium,s_ui_smiley_hard])[Hg()],this.p.ej.b||(this.p.ej.b=f),this.rv=new Wh(this,this.p.ej),this.rv.ht(f));this.p.Cg&&!this.p.Cg.length&&(this.p.Cg=
[this.p.Cg]);this.p.Te&&!this.p.Te.length&&(this.p.Te=[this.p.Te]);this.es=[];this.fs=[];this.es[0]=b(["item","item0"],this.p.Cg)?new Wh(this,this.p.Cg[0]):new ci(0,"");this.fs[0]=b(["item","item0"],this.p.Te)?new Xh(this,"",this.p.Te[0]):new ci(0,"");if(this.p.Cg&&this.p.Te)for(f=1;f<this.p.Te.length;++f)b("item"+f,this.p.Te[f])&&(this.fs[f]=new Xh(this,"0 / 0",this.p.Te[f]),this.es[f]=new Wh(this,this.p.Cg[f]));for(var q in this.p)f=this.p[q],f.S&&new Xh(this,L.l.H(f.S,"<"+f.S+">")+(f.separator?
f.separator:""),f);this.ws=this.du=0;this.buttons={};for(q in this.p.buttons)f=gi(this,this.p.buttons[q]),this.buttons[q]=f;this.p.xx&&(f=gi(this,this.p.xx),this.buttons.pauseButton=f);this.Qk={};for(q in this.p.Qk)f=this.p.Qk[q],f=new hi[f.kv](this,f),this.Qk[q]=f;this.Tb=this.Sb=0}kg(Uh,$h);var hi={};function gi(a,b){var c=new ii(a,b,b.ha);a.cd.push(c);c.lA=b;return c}e=$h.prototype;e.Pj=function(a,b){this.buttons[b||"pauseButton"].Pj(a)};
e.Qp=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.cy?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};e.Mg=function(a){this.Nj.Mg(a);return this};e.Hh=function(){return this.Nj.Hh()};e.setTime=function(a){this.Gm.Kf(a);return this};e.getTime=function(){return this.Gm.O()};function ji(a){var b=Z.ac;b.vj.Kf(a);b.as=a}function ki(a,b){a.Zh.Kf(b);1<b&&a.Nj&&a.Nj.Nr&&a.Nj.Nr()}
e.mn=function(a){a=this.rm.O()+a;this.rm.Kf(a);this.Vh.un&&(this.vj.O()<a?this.vj.Kf(a):a<this.vj.O()&&this.vj.Kf(Math.max(a,this.as)));return this};e.ob=function(){Uh.prototype.ob.apply(this,arguments);m.ia(this.canvas);m.clear();for(var a in this.buttons)J(H,this.buttons[a])};
e.X=function(a){1===this.cu&&this.setTime(this.getTime()+a);if(2===this.cu){if(this.du&&1E3*this.du>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.Gm,b.Uc.m=0,b.Uc.Lp=!0,b.font.setFillColor(b.Uc.color),b.ge(),"undefined"!==typeof a_gameui_timewarning_second&&F.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}Uh.prototype.X.apply(this,arguments);this.ws+=a};
e.Zk=function(a,b){this.zd&&(this.zd instanceof p?this.zd.md(0,a+this.fk,b+this.gk,1):this.zd.md(a+this.fk,b+this.gk,1));Uh.prototype.Zk.apply(this,arguments);this.Kn&&this.zd&&sa(a,b,this.zd.width,this.zd.height,"blue",!0)};
function li(a,b,c,d,f,h){this.e=a;this.width=f;this.height=h;this.J=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.A={};this.A.Sb=0;this.A.Tb=0;this.A.scale=this.scale;this.A.alpha=this.alpha;this.A.na=0;this.B={};this.B.Ze=!1;this.B.origin={};this.B.target={};this.B.m=0;this.a.dl&&(mi(this,this.a.dl),this.B.Ze=!1);this.e.cd.push(this);ni||(ni={xc:function(a){a.value instanceof r?a.J=a.value:(a.b=a.value,a.hc=0)},update:Y.Le,
tc:Y.Je,end:Y.Ke,Yd:K,Zd:K,Xd:function(a,b,c,d){return 1-nc(a,b,c,d)},qr:function(a,b,c,d){return 1*nc(a,b,c,d)+1},rr:function(a,b,c,d){return 1*nc(a,b,c,d)+1}})}var ni;
function mi(a,b){a.B.origin.x=void 0===b.x?a.x:b.x;a.B.origin.y=void 0===b.y?a.y:b.y;a.B.origin.alpha=void 0!==b.alpha?b.alpha:1;a.B.origin.scale=void 0!==b.scale?b.scale:1;a.B.target.x=a.x;a.B.target.y=a.y;a.B.target.alpha=a.alpha;a.B.target.scale=a.scale;a.B.duration=b.duration;a.B.Ze=!0;a.B.xf=b.xf||nc;a.B.m=0;a.B.Pa=b.Pa||0;oi(a)}
function oi(a){a.B.m>=a.B.duration&&(a.B.m=a.B.duration,a.B.Ze=!1);var b=a.B.xf(a.B.m,a.B.origin.x,a.B.target.x-a.B.origin.x,a.B.duration),c=a.B.xf(a.B.m,a.B.origin.y,a.B.target.y-a.B.origin.y,a.B.duration);a.A.Sb=b-a.x;a.A.Tb=c-a.y;a.A.alpha=a.B.xf(a.B.m,a.B.origin.alpha,a.B.target.alpha-a.B.origin.alpha,a.B.duration);a.A.scale=a.B.xf(a.B.m,a.B.origin.scale,a.B.target.scale-a.B.origin.scale,a.B.duration);a.e.ec=!0}e=li.prototype;
e.pa=function(a,b){this.J&&this.J.R(this.x+this.A.Sb+a,this.y+this.A.Tb+b,this.A.scale,this.A.scale,0,this.A.alpha)};e.sl=function(a,b){pi(this.x+this.A.Sb+a,this.y+this.A.Tb+b,this.width*this.A.scale,this.height*this.A.scale)};e.Bg=function(a,b){return a>this.x+this.A.Sb&&a<this.x+this.A.Sb+this.width*this.A.scale&&b>this.y+this.A.Tb&&b<this.y+this.A.Tb+this.height*this.A.scale};e.kt=function(a){this.visible!==a&&(this.visible=a,this.e.ec=!0)};
e.X=function(a){this.B.Ze&&(0<this.B.Pa?this.B.Pa-=a:(this.B.m+=-this.B.Pa,this.B.Pa=0,this.B.m+=a,oi(this)))};function ci(a,b){this.Fb=this.value=this.Bl=b}e=ci.prototype;e.Kf=function(a){this.value=a};e.O=function(){return this.value};e.Mg=function(a){0>a&&(a=0);100<a&&(a=100);this.Fb=a};e.Hh=function(){return this.Fb};e.ht=function(){};
function Wh(a,b){this.hp=b;this.a={};for(var c in b)this.a[c]=b[c];this.b=this.a.b;this.F=0;this.Kk=this.a.Kk;this.a.kC&&(this.a.x+=this.b.cb,this.a.y+=this.b.Wa);li.call(this,a,this.a,this.a.x,this.a.y,this.b?this.b.width:1,this.b?this.b.height:1)}kg(li,Wh);hi.GameUIImage=Wh;function qi(a,b){a.F!==b&&(a.F=b,a.e.ec=!0)}e=Wh.prototype;
e.pa=function(a,b){this.b&&(this.Kk&&(a+=-Math.floor(this.b.width/2),b+=-Math.floor(this.b.height/2)),this.b instanceof p?this.b.R(this.F,this.x+a+this.A.Sb,this.y+b+this.A.Tb,this.A.scale,this.A.scale,0,this.A.alpha):this.b.R(this.x+a+this.A.Sb,this.y+b+this.A.Tb,this.A.scale,this.A.scale,0,this.A.alpha),this.e.Kn&&sa(this.x+a-this.b.cb+1,this.y+b-this.b.Wa+1,this.b.width-2,this.b.height-2,"black",!0))};
e.Bg=function(a,b){if(!this.b)return!1;var c=0,d=0;this.Kk&&(c+=-Math.floor(this.b.width/2),d+=-Math.floor(this.b.height/2));c-=this.b.cb;d-=this.b.Wa;return a>c+this.x+this.A.Sb&&a<c+this.x+this.A.Sb+this.width*this.A.scale&&b>d+this.y+this.A.Tb&&b<d+this.y+this.A.Tb+this.height*this.A.scale};e.sl=function(a,b){this.b&&(this.Kk&&(a+=-Math.floor(this.b.width/2),b+=-Math.floor(this.b.height/2)),a-=this.b.cb,b-=this.b.Wa,pi(this.x+this.A.Sb+a,this.y+this.A.Tb+b,this.width*this.A.scale,this.height*this.A.scale))};
e.qo=function(a){a||(a=new g(0,0));a.x=this.x+L.Qe+this.e.Sb;a.y=this.y+L.be+this.e.Tb;return a};e.ht=function(a){a!==this.b&&(this.b=a,this.e.ec=!0,this.b&&(this.width=this.b.width,this.height=this.b.height))};
function Xh(a,b,c){"object"===typeof b&&(c=b,b=c.S?L.l.H(c.S,"<"+c.S+">"):c.text||"");this.text=b;this.font=c.font.K();c.$d&&z(this.font,c.$d);this.Ss=c.x;this.Ts=c.y;this.ip=c.nc;this.sx=this.font.fillColor;this.gf=void 0===c.gf?.2:c.gf;li.call(this,a,c,Math.floor(c.x-.1*c.nc),Math.floor(c.y-.1*c.vc),Math.floor(1.2*c.nc),Math.floor(1.2*c.vc));this.J=new r(this.width,this.height);switch(this.font.align){case "left":this.Vg=Math.floor(.1*c.nc);break;case "right":this.Vg=Math.floor(1.1*c.nc);break;
case "center":this.Vg=Math.floor(.6*c.nc);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.gf*this.font.fontSize);switch(this.font.j){case "top":this.Wg=Math.floor(.1*c.vc);break;case "bottom":this.Wg=Math.floor(1.1*c.vc)+a;break;case "middle":this.Wg=Math.floor(.6*c.vc)+a;break;default:throw"Unknown baseline: "+this.font.j;}this.Uc={};this.Uc.color="red";this.Uc.duration=200;this.Uc.m=0;this.Uc.Lp=!1;this.ge()}kg(li,Xh);hi.GameUIText=Xh;
Xh.prototype.X=function(a){li.prototype.X.apply(this,arguments);this.Uc.Lp&&(this.Uc.m+=a,this.Uc.duration<=this.Uc.m&&(this.Uc.Lp=!1,this.font.setFillColor(this.sx),this.ge()))};
Xh.prototype.ge=function(){this.J.clear();w(this.J);var a=this.font.$(this.text),b=1;a>this.ip&&(b=this.ip/a);this.font.R(this.text,this.Vg,this.Wg,b,b,0,1);this.e.Kn&&(sa(0,0,this.J.width,this.J.height,"black",!0),sa(this.Ss-this.x,this.Ts-this.y,this.J.width-2*(this.Ss-this.x),this.J.height-2*(this.Ts-this.y),"red",!0),ta(this.Vg-5,this.Wg,this.Vg+5,this.Wg),ta(this.Vg,this.Wg-5,this.Vg,this.Wg+5));this.e.ec=!0;y(this.J)};function ri(a){return""+a}function si(a,b,c){return b+c}
function bi(a,b,c,d,f,h){this.value=this.Bl=d||0;this.Wm=-1;this.wu=c;this.a=b;this.vu=-99999;this.Fm=b.Fm||0;this.hl=b.hl?b.hl:h||ri;c=si;f&&0!==this.a.pr&&(c=oc);this.Ha=new lg(this.Bl,void 0===this.a.pr?500:this.a.pr,c);b.cj&&(this.cj="game_ui_"+b.cj);this.text=ti(this)+this.hl(this.Bl);Xh.call(this,a,this.text,b)}kg(Xh,bi);hi.GameUIValue=bi;bi.prototype.Kf=function(a){this.value=a;ng(this.Ha,this.value)};bi.prototype.O=function(){return this.value};
bi.prototype.Vp=function(a){var b=this.Wm;if(a||H.Gh-this.vu>this.Fm)b=this.hl(Math.floor(this.Ha.O()));this.Wm!==b&&(this.vu=H.Gh,this.Wm=b,this.text=ti(this)+b,this.ge())};bi.prototype.X=function(a){Xh.prototype.X.apply(this,arguments);mg(this.Ha,a);Math.floor(this.Ha.O())!==this.Wm&&this.Vp()};function ti(a){var b="";a.a.Wp&&(b=a.cj?L.l.H(a.cj,"<"+a.cj.toUpperCase()+">"):L.l.H("game_ui_"+a.wu,"<"+a.wu+">"));return b+(a.a.separator?a.a.separator:"")}
function ei(a,b){this.ig=this.Fb=0;this.a=b;this.Mj=this.Lg=0;this.b=b.b;this.tf=b.tf||b.b;this.Co=b.Co||null;this.a.bm=this.a.bm||0;this.a.cm=this.a.cm||0;this.tn=!0;this.km=b.km||0;this.M=[];this.Ck=!1;this.Ha=new lg(0,200,uc);this.Fc=new lg(0,200,uc);li.call(this,a,b,b.x,b.y,this.b.width,this.b.height)}kg(li,ei);hi.GameUIProgress=ei;ei.prototype.Mg=function(a){0>a&&(a=0);100<a&&(a=100);this.Ck?(this.ig=a-this.Fb,ng(this.Fc,this.ig)):(ng(this.Ha,a),this.Fb=a)};ei.prototype.Hh=function(){return this.Fb};
ei.prototype.X=function(a){mg(this.Ha,a);var b=this.Ha.O();b!==this.Lg&&(this.e.ec=!0,this.Lg=b);mg(this.Fc,a);a=this.Fc.O();a!==this.Mj&&(this.e.ec=!0,this.Mj=a);b+=a;if(this.tn)for(a=0;a<this.M.length;++a){var c=b>=this.M[a].position&&this.Fb+this.ig>=this.M[a].position;this.M[a].complete!==c&&(this.a.M&&(this.e.ec=!0,this.Lg=b),this.M[a].complete=c)}};
ei.prototype.pa=function(a,b){var c,d,f;if(0===this.km&&(0<this.Fc.O()&&this.tf.Ea(0,this.width*this.Ha.O()/100,0,this.tf.width*this.Fc.O()/100,this.tf.height,a+this.x+this.width*this.Ha.O()/100,b+this.y),this.b.Ea(0,0,0,this.width*this.Ha.O()/100,this.height,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.o(0,a+this.x+this.width/100*d.position,b+this.y+this.a.M.y);if(1===this.km&&(0<this.Fc.O()&&this.tf.Ea(0,0,this.height-
this.height*this.Ha.O()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.O()/100)),this.b.Ea(0,0,this.height-this.height*this.Ha.O()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Ha.O()/100)),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.o(0,a+this.x+this.a.M.x,b+this.y+this.height-this.height/100*d.position);if(2===this.km&&(0<this.Fc.O()&&this.tf.Ea(0,0,this.height*this.Ha.O()/
100,this.tf.width,this.tf.height*this.Fc.O()/100,a+this.x+this.width*this.Ha.O()/100,b+this.y),this.b.Ea(0,0,0,this.width,this.height*this.Ha.O()/100,a+this.x,b+this.y),this.a.M))for(c=0;c<this.M.length;++c)d=this.M[c],f=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,f.o(0,a+this.x+this.a.M.x,b+this.y+this.height/100*d.position);this.Co&&this.Co.o(0,a+this.x+this.a.bm,b+this.y+this.a.cm)};function ii(a,b,c){this.Tf=!1;this.kf=-1;this.e=a;this.a=b;this.h=!0;this.Pj(c);Wh.call(this,a,b)}
kg(Wh,ii);hi.GameUIButton=ii;ii.prototype.Pj=function(a){var b=null,c=null,d=this.e,f=this.a;void 0===a&&(a=f.ha?f.ha:0);switch(a){case 0:b=d.Vh.$n?te:se;c=function(){Fg(L.e)?L.e.af(!1,!0,d.Vh.$n):L.e.af();return!0};break;case 1:b=ue;c=function(){L.e.af();return!0};break;case 2:b=s_btn_small_quit;c=function(){ui(d.Vh.$n);return!0};break;case 3:b=f.b}this.jb=c;this.a.b=b};ii.prototype.Bb=function(a,b,c){if(this.h)return this.Bg(b-L.Qe,c-L.be)?(this.Tf=!0,this.kf=a,qi(this,1),!0):!1};
ii.prototype.X=function(a){Wh.prototype.X.apply(this,arguments);this.Tf&&(this.Bg(H.fa[this.kf].x-L.Qe,H.fa[this.kf].y-L.be)?qi(this,1):qi(this,0))};ii.prototype.Cb=function(a,b,c){return this.Tf&&a===this.kf?(qi(this,0),this.Bg(b-L.Qe,c-L.be)&&this.jb&&this.jb(),this.Tf=!1,this.kf=-1,!0):!1};
function di(a,b){this.ig=this.Fb=0;this.a=b;this.Mj=this.Lg=0;this.tn=!0;this.M=[];this.color=b.color||"#00AEEF";this.Oq=b.Oq||"#FF0F64";this.Lq=b.Lq||"#FFED93";this.Mq=void 0===b.blink||b.blink;this.td=b.td;this.th=this.Ck=!1;this.fg=0;this.Ak=1E3;this.Bk=0;this.Ha=new lg(0,200,uc);this.Fc=new lg(0,200,uc);li.call(this,a,b,b.x,b.y,1,1)}kg(li,di);hi.GameUIRoundProgress=di;function vi(a){a.Mq&&(a.th?a.fg-=a.Ak:(a.th=!0,a.fg=0,a.Bk=0,ng(a.Ha,100)))}e=di.prototype;
e.Mg=function(a){0>a&&(a=0);100<a&&(a=100);this.Ck?(this.ig=a-this.Fb,ng(this.Fc,this.ig)):(this.th||(100===a&&this.Mq?vi(this):ng(this.Ha,a)),this.Fb=a)};e.Hh=function(){return this.Fb};e.Nr=function(){vi(this)};
e.X=function(a){mg(this.Ha,a);var b=this.Ha.O();b!==this.Lg&&(this.e.ec=!0,this.Lg=b);mg(this.Fc,a);var c=this.Fc.O();c!==this.Mj&&(this.e.ec=!0,this.Mj=c);this.th&&(this.fg+=a,this.fg>=this.Ak?100===this.Fb?(this.th=!1,vi(this)):(this.th=!1,this.Bk=0,this.Ha.Dh=0,this.Ha.Im=0,ng(this.Ha,this.Fb)):this.Bk=(-Math.cos(this.fg/this.Ak*5*Math.PI*2)+1)/2,this.e.ec=!0);b+=c;if(this.tn)for(a=0;a<this.M.length;++a)c=b>=this.M[a].position&&this.Fb+this.ig>=this.M[a].position,this.M[a].complete!==c&&(this.a.M&&
(this.e.ec=!0,this.Lg=b),this.M[a].complete=c)};e.sl=function(a,b){this.td&&pi(this.x+this.A.Sb+a-this.td.cb,this.y+this.A.Tb+b-this.td.Wa,this.td.width*this.A.scale,this.td.height*this.A.scale)};
e.pa=function(a,b){var c,d;if(this.td){d=this.Ha.O()/100;d=Math.max(d,0);d=Math.min(d,1);var f=m.context,h=this.td.width/2-M(4),k=f.fillStyle;if(0<this.Fc.O()){var l=this.Fc.O()/100;f.beginPath();f.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);f.lineTo(this.x+a,this.y+b);f.fillStyle=this.Oq;f.fill()}f.beginPath();f.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);f.lineTo(this.x+a,this.y+b);f.fillStyle=this.color;f.fill();this.Ak&&(l=f.globalAlpha,f.globalAlpha*=
this.Bk,f.beginPath(),f.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),f.lineTo(this.x+a,this.y+b),f.fillStyle=this.Lq,f.fill(),f.globalAlpha=l);if(this.a.M){var l=f.strokeStyle,n=f.lineWidth;f.strokeStyle="white";f.lineWidth=M(2);for(d=0;d<this.M.length;++d){c=this.M[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;f.beginPath();f.moveTo(Math.round(a+this.x),Math.round(b+this.y));f.lineTo(Math.round(a+this.x+q),Math.round(b+this.y+c));f.stroke()}f.strokeStyle=
l;f.lineWidth=n}this.td.o(0,a+this.x,b+this.y);if(this.a.M)for(d=0;d<this.M.length;++d)c=this.M[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.o(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.M.rb*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.M.rb*.5));f.fillStyle=k}};L.version=L.version||{};L.version.game_ui="2.1.0";
function wi(a,b,c,d,f){var h=0;this.visible=this.h=!1;this.group=0;this.node=a;this.attributes=b;this.duration=c;this.jb=f;this.vv=d;this.Uk=0;this.eg={};for(h in this.attributes)this.eg[h]=a[h];this.jr={};for(h in this.attributes)this.jr[h]=this.attributes[h]-this.eg[h];I(this)}wi.prototype.finish=function(){this.h=!1;J(H,this);for(i in this.attributes)this.node[i]=this.attributes[i];"undefined"!==typeof this.jb&&this.jb()};
wi.prototype.X=function(a){var b=0,c,d,f;this.Uk+=a;if(this.Uk<this.duration)for(b in this.attributes)a=this.jr[b],c=this.Uk,d=this.eg[b],f=this.duration,this.node[b]=this.vv(c,d,a,f);else this.finish()};wi.prototype.start=function(){this.h=!0};wi.prototype.pause=function(){this.h=!1};function xi(){return function(a,b,c,d){return 4*pc(a,b,c,d)}}function yi(a,b,c,d,f){this.of(a,b,c,d,f)}function zi(a,b,c){a.gd=b;a.vd=.5;a.Pc=c;a.Sx=a.gd+a.vd+a.Pc}
yi.prototype.of=function(a,b,c,d,f,h){this.depth=100;this.h=this.visible=!0;this.group="gameObject";this.x=c;this.y=d;this.J=null;this.state=0;this.alpha=1;this.font=b.K();this.vb=0;this.text=a;this.Vb=f;Ai(this,h);this.duration=500;zi(this,.25,.06);this.Vb&&F.play(this.Vb);this.gc=this.fc=1;L.d.Ma(this,L.Eh);I(this);Sb(this,"game")};var Bi={};
function Ai(a,b){Bi.hasOwnProperty(a.font.L)||(Bi[a.font.L]={});var c=""+a.font.fontSize;Bi[a.font.L].hasOwnProperty(c)||(Bi[a.font.L][c]={});Bi[a.font.L][c].hasOwnProperty(a.font.fillColor)||(Bi[a.font.L][c][a.font.fillColor]={});Bi[a.font.L][c][a.font.fillColor].hasOwnProperty(a.font.strokeColor)||(Bi[a.font.L][c][a.font.fillColor][a.font.strokeColor]={});if(Bi[a.font.L][c][a.font.fillColor][a.font.strokeColor].hasOwnProperty(a.text))a.J=Bi[a.font.L][c][a.font.fillColor][a.font.strokeColor][a.text];
else{a.J=new r(Math.floor(1.2*a.font.$(a.text)),Math.floor(1.2*a.font.W(a.text))+M(10));b||(Bi[a.font.L][c][a.font.fillColor][a.font.strokeColor][a.text]=a.J);c=a.J;w(c);try{E(a.font,"middle"),D(a.font,"center"),a.font.o(a.text,c.width/2,c.height/2)}finally{y(c)}}}yi.prototype.ob=function(){this.canvas.Z=!0};yi.prototype.X=function(a){this.vb+=a;this.vb>this.duration&&J(H,this);this.canvas.Z=!0;this.ik(a)};yi.prototype.ik=function(){};
yi.prototype.pa=function(){this.J.R(this.x-this.J.width*this.fc/2,this.y-this.J.height*this.gc/2,this.fc,this.gc,0,this.alpha)};function Ci(a,b,c,d,f,h){this.of(a,b,c,d,f,h);this.duration=500;zi(this,.25,.06);a=wc([sc,ic,xi()],[!1,!1,!1],[this.gd,this.vd,this.Pc]);this.Nd=new lg(0,this.duration,a);ng(this.Nd,2);a=wc([sc,ic,nc],[!1,!1,!0],[this.gd,this.vd,this.Pc]);this.Od=new lg(0,this.duration,a);ng(this.Od,1)}kg(yi,Ci);
Ci.prototype.ik=function(a){mg(this.Nd,a);mg(this.Od,a);this.fc=this.Nd.O();this.gc=this.Od.O();this.vb>this.duration*(1-this.Pc/this.Sx)&&(this.font.setFillColor("white"),this.font.setStrokeColor("white"),Ai(this))};
function Di(a,b,c,d,f,h,k,l,n){this.of(a,b,L.Gd+L.Sc/2,L.Hd+L.mj/2+(n||0),f,l);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Oa(this.font);a.color="white";Na(this.font,a);this.depth=-20;this.duration=2E3;zi(this,.1,.3);k=k?pc:sc;a=wc([k,ic],[!1,!1],[this.gd,this.vd+this.Pc]);this.Nd=new lg(0,this.duration,a);ng(this.Nd,1);k=wc([k,ic],[!1,!1],[this.gd,this.vd+this.Pc]);this.Od=new lg(0,this.duration,k);ng(this.Od,1);k=wc([ic,pc],[!1,!1,!0],[this.gd+this.vd,this.Pc]);this.cg=new lg(1,
this.duration,k);ng(this.cg,0);k=wc([ic,rc],[!1,!1],[this.gd+this.vd,this.Pc]);this.Kg=new lg(this.y,this.duration,k);ng(this.Kg,this.y);var q=wc([ic,pc],[!1,!1,!0],[this.gd+this.vd-.2,this.Pc+.2]),u=this;h=h||.75;new Ei(c,u.duration,Fi(u.x-u.J.width/2,u.y-u.J.height/8,u.J.width,u.J.height/4),M(50),d,function(a){return q(a,h,-h,u.duration)})}kg(yi,Di);
Di.prototype.ik=function(a){mg(this.Nd,a);mg(this.Od,a);mg(this.cg,a);mg(this.Kg,a);this.fc=this.Nd.O();this.gc=this.Od.O();this.alpha=this.cg.O();this.y=this.Kg.O()};Di.prototype.pa=function(){this.J.R(this.x-this.J.width*this.fc/2,this.y-this.J.height*this.gc/2,this.fc,this.gc,0,this.alpha)};
function Gi(a,b,c,d,f,h){this.of(a,b,L.Gd+L.Sc/2,L.Hd+L.mj/2,f,h);this.font.setFillColor("white");this.font.setStrokeColor("white");a=Oa(this.font);a.color="white";Na(this.font,a);this.depth=-20;this.duration=2E3;zi(this,.5,.3);a=wc([pc,ic],[!1,!1],[this.gd,this.vd+this.Pc]);this.Nd=new lg(0,this.duration,a);ng(this.Nd,1);a=wc([pc,ic],[!1,!1],[this.gd,this.vd+this.Pc]);this.Od=new lg(0,this.duration,a);ng(this.Od,1);a=wc([ic,pc],[!1,!1,!0],[this.gd+this.vd,this.Pc]);this.cg=new lg(1,this.duration,
a);ng(this.cg,0);a=wc([ic,rc],[!1,!1],[this.gd+this.vd,this.Pc]);this.Kg=new lg(this.y,this.duration,a);ng(this.Kg,this.y)}kg(yi,Gi);Gi.prototype.ik=function(a){mg(this.Nd,a);mg(this.Od,a);mg(this.cg,a);mg(this.Kg,a);this.fc=this.Nd.O();this.gc=this.Od.O();this.alpha=this.cg.O();this.y=this.Kg.O()};Gi.prototype.pa=function(){this.J.R(this.x-this.J.width*this.fc/2,this.y-this.J.height*this.gc/2,this.fc,this.gc,0,this.alpha)};
function Fi(a,b,c,d){var f=2*c+2*d,h=c/f,k=d/f;return function(f){if(f<h)return new g(a+1/h*c*f,b);if(f<h+k)return new g(a+c,b+1/k*(f-h)*d);if(f<h+k+h)return new g(a+c-1/h*(f-h-k)*c,b+d);if(1>=f)return new g(a,b+d-1/k*(f-h-k-h)*d)}}function Hi(){this.Sh=new g(0,0);this.ak=new g(0,0);this.et=this.na=this.fr=this.Ek=this.xs=0}Hi.prototype.Ho=function(a){return this.Ek<a&&this.Ek+this.xs>a};
function Ei(a,b,c,d,f,h){this.b=a;this.visible=this.h=!0;this.Pu=h||function(){return 1};this.depth=0;this.group="gameObject";this.scale=25/a.width;this.wx=f;this.Ph=[];this.Rk=b;this.gr=1;this.Wy=10;this.oy=d;this.vb=0;this.shape=c;L.d.Ma(this,L.Eh);this.Ge=new g(0,0);for(a=0;a<f;++a)b=c(a/f),this.Ge.x+=b.x,this.Ge.y+=b.y;this.Ge=this.Ge.scale(1/f);for(a=0;a<f;++a)this.Ph.push(new Hi),Ii(this,a);wc([K,K],[!1,!0],[1,1]);I(this);Sb(this,"game")}var Ji=new ga(0);
function Ii(a,b){var c=a.Ph[b],d=b/a.wx;c.xs=a.Rk;d=a.shape(d);d=d.add(ea(Ji.random(360),Ji.random(a.oy)));c.et=360;c.ak=d.ic(a.Ge).scale(1/(a.Rk/1E3*.04));c.Ek=a.vb+Ji.random(a.Wy);c.ew=ha(Ji,a.b.F-1);c.Sh=a.Ge}
Ei.prototype.X=function(a){this.vb+=a;for(var b=new g(0,180),c=0;c<this.Ph.length;++c){var d=this.Ph[c],f=Math.floor((this.vb-d.Ek)/this.Rk);f>d.fr&&f<this.gr-1&&(Ii(this,c),d.fr=f);d.Ho(this.vb)&&(f=d.ak.scale(-4),f=b.add(f),d.ak=d.ak.add(f.scale(a/1E3)),d.Sh=d.Sh.add(d.ak.scale(a/1E3)),d.na+=d.et*a/1E3,d.scale=2*Math.log(d.Sh.ic(this.Ge).length()/100)*this.scale)}this.vb>this.Rk*this.gr&&J(H,this);this.canvas.Z=!0};
Ei.prototype.pa=function(){for(var a=0;a<this.Ph.length;++a){var b=this.Ph[a];b.Ho(this.vb)&&this.b.R(b.ew,b.Sh.x,b.Sh.y,b.scale,b.scale,b.na,.9*this.Pu(this.vb))}};function Ki(a,b){this.x=a;this.y=b}e=Ki.prototype;e.add=function(a){this.x+=a.x;this.y+=a.y};e.ic=function(a){this.x-=a.x;this.y-=a.y};e.scale=function(a){this.x*=a;this.y*=a};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);this.x=a*this.x+b*this.y;this.y=-b*this.x+a*this.y};
e.pg=function(a){return this.x*a.x+this.y*a.y};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);0===a?this.y=this.x=0:(this.x/=a,this.y/=a)};e.tc=function(a,b,c){var d=Math.min(8,this.length()/4),f=this.ic(this.normalize().scale(2*d)),h=f.add(fa(this).scale(d)),d=f.add(fa(this).scale(-d)),k=m.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+f.x,b+f.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+f.x,b+f.y);k.stroke()};
function Li(a,b){return"object"===typeof a?new g(a.x+L.Gd,a.y+L.Hd):new g(a+L.Gd,b+L.Hd)}function Mi(a,b){return L.l.H(a,b||"<"+a+">")}function Ni(){fc.call(this);this.group="gameObject";this.te=[];Sb(this,"game")}kg(fc,Ni);function Oi(a){this.Ps=a;this.Vl=[];this.expansion=1}Oi.prototype.create=function(){0>=this.Vl.length&&(this.expansion=Math.round(1.2*this.expansion)+1,this.expand(this.expansion));var a=this.Vl.pop();this.Ps.apply(a,arguments);return a};Oi.prototype.release=function(a){this.Vl.push(a)};
Oi.prototype.expand=function(a){for(var b=0;b<a;b++)this.Vl.push(new this.Ps)};var Pi=new Oi(Ki);L.version=L.version||{};L.version.game="1.2";var Z={};function Qi(){this.depth=11;this.h=this.visible=!0;L.d.Ma(this,L.yf);this.a=L.a.k.k;this.scrollTo=0;I(this);Sb(this,"game");Z={e:this};Z.fA=new Oh("gameObject");Z.Qq=new Ri;Z.zB=[];this.ev={};this.Cp={};Z.gb=0;this.Gt();this.Ec=0}e=Qi.prototype;
e.mn=function(a){Z.ac.mn(a);this.Jg+=a;if(this.Za&&(Z.ac.Mg(100*this.Jg/Z.r.r.Md),100<=Z.ac.Hh())){L.i.nt&&L.i.nt();this.Za=!1;var b=this;this.zp(Mi("bs_stage","Stage")+" "+(Z.ac.Zh.O()+1),Qf);(new wi(null,[],300,K,function(){b.Jg-=Z.r.r.Md;var a,d=Z.ac;"undefined"===typeof a&&(a=1);ki(d,d.Zh.O()+a);Si(Z.ac.Zh.O());ng(b.Dk,Ti());Z.ac.Mg(0);Z.ac.Mg(100*b.Jg/Z.r.r.Md);b.Za=!0})).start()}};
function Ui(a){a>=L.a.k.$e.bubbles.length&&(a=L.a.k.$e.bubbles.length-1);for(1>a&&(a=1);1<=a;--a)if(null!==L.a.k.$e.bubbles[a])return L.a.k.$e.bubbles[a]}e.ot=function(){new Di(Mi("bs_awesome"),lf,Sd,50,Bf)};e.qt=function(){new Di(Mi("bs_great"),kf,Sd,50,Bf)};e.rt=function(){new Di(Mi("bs_nice"),jf,Sd,20,Bf)};
e.pt=function(a,b,c,d,f,h,k,l,n,q,u){var B=Li(f,h),C=750;d&&(C*=4);a.Y(b,function(){A(c,k);d?new Ci("+"+n,c,B.x,B.y,zf,q):Ph(c,(d?"+":"")+n,B.x,B.y,-M(20),C+10*n,void 0,q);A(c,l)});b+=700;1<u&&(a.Y(b,function(){A(c,1*k);new Ci("x"+u,c,B.x,B.y,Of);A(c,l)}),b+=700,a.Y(b,function(){A(c,1*k);F.play(Af);"undefined"!==typeof Xd?new Vi(f,h,3,Xd,500,1,0):(new Vi(f,h,3,Vd,400,3,0),new Vi(f+M(20),h,3,Vd,400,3,22.5),new Vi(f+M(20),h,3,Vd,400,3,45));Ph(c,"+"+n*u,B.x,B.y,-M(20),C+10*n,sc,q);A(c,l)}),b+=300);return b};
function Wi(a,b,c,d,f,h,k){for(var l=0,n=0;n<d;++n)l+=Ui(f-n);k="undefined"===typeof k?0:k;f=1;h&&(f=L.a.k.$e.lw);Z.e.mn(l*f);if(0<l||0<k){var n=ff,q=a.ev;h&&(n=gf);var u=n.fontSize,B=Math.floor(h?n.fontSize+Math.min((l-10)/10,2*n.fontSize):u),C=new Ni,t=1;n===gf&&(a.Cp.hasOwnProperty(""+B)||(a.Cp[""+B]={}),q=a.Cp[""+B]);0<l&&(t=a.pt(C,t,n,h,b,c,B,u,l,q,f));b=l*f+k;a.Dr&&J(H,a.Dr);L.a.k.Qy.jy&&(a.Dr=Ph(n,"["+b+"]",50,50,-M(20),5E3,sc,q));(h||0===d)&&b>=L.a.k.$e.st&&(b>=L.a.k.$e.ky?(C.Y(t+a.Ec,function(){Z.e.ot()}),
a.Ec+=t+2E3):b>=L.a.k.$e.ly?(C.Y(t+a.Ec,function(){Z.e.qt()}),a.Ec+=t+2E3):b>=L.a.k.$e.st&&(C.Y(t+a.Ec,function(){Z.e.rt()}),a.Ec+=t+2E3));C.start()}return l*f}function Xi(a,b,c,d,f){if(0>=f)return b;if("object"===typeof a&&null!==a&&null!==b){var h;h="undefined"!==typeof a.length?[]:{};for(var k in a)h[k]=Xi(a[k],b[k],c,d,f-1);return h}return"number"===typeof a?a*c+b*d:b}
function Si(a){for(var b=null,c=0;c<L.a.k.Lo.length;++c){var d=L.a.k.Lo[c];if(d.r.Yc>=a){b&&d.r.Yc!==a?(a=(a-b.r.Yc)/(d.r.Yc-b.r.Yc),Z.r=Xi(b,d,1-a,a,3),Z.r.r.border=d.r.border):Z.r=d;break}else b=d}}e.ob=function(){this.Za=!1;this.Ux=!0;this.canvas.Z=!0;Wb(function(a){return"gameObject"===a.group});J(H,Z.ac);Z=null};
e.Gt=function(){this.Za=!1;Z.ac=new $h({lives:!0});ki(Z.ac,1);var a=Mh();a||(a=0);ji(a);a=this.a.ts||11;Si(1);Yi(function(){this.Za=!0},this);Z.Aa=L.Sc/a/2;Z.Ia=Z.Aa/(Yd.width/2);Z.background=new Zi;Z.U=new $i;aj(Z.U,L.a.k.U.$r);Z.yb=new bj;Z.yb.qh();Z.yb.tk=!0;Z.yb.jx=L.a.k.k.ra;this.Dk=new lg(Ti(),1E3,uc);this.Jg=0};e.ql=function(){};e.bc=function(){};e.X=function(a){this.canvas.Z=!0;mg(this.Dk,a);this.Ec=Math.max(0,this.Ec-a)};e.Bb=function(){};e.Cb=function(){};e.yg=function(){};e.zg=function(){};
e.rl=function(a){"LEVELFINISHED"===a&&L.e.ks({totalScore:Z.ac.rm.O(),stage:Z.ac.Zh.O()})};e.Tc=function(){};e.Re=function(){};e.zp=function(a,b){var c=new Ni;c.Y(this.Ec+1,function(){new Di(a,ef,Sd,0,b)});this.Ec+=2E3;c.start()};function Ti(){return 2*Z.Aa+(Z.r.r.border-1)*Z.U.Mo+M(2)}e.pa=function(){$d.o(0,0,this.Dk.O())};
function bj(){this.depth=10;this.h=this.visible=!0;this.group="gameObject";L.d.Ma(this,L.yf);this.a=L.a.k.yb;this.x=this.a.x;this.y=this.a.y;this.b=Pd;this.tk=!1;this.alpha=1;this.ra=Z.r.r.ra;this.Cm=this.St=0;this.Wi=1;this.Hm=0;this.Tg=W.fillColor;this.Yb=new r(Math.floor(1.2*W.$("88")),Math.floor(1.2*W.W("88")));this.zj=-1;var a=M(20);this.pb=Yb(-Qd.cb-a,-Qd.Wa-a,Qd.width+2*a,Qd.height+2*a);this.Bm=new r(Jd.width,Jd.height);cj(this);this.V=[];this.random=new ga;I(this);Sb(this,"game")}
function cj(a){w(a.Bm);a.Bm.clear();try{Jd.o(0,0+Jd.cb,0+Jd.Wa);var b=Mi("bs_tap_to_switch_bubbles"),c=Wa(hf,b,M(180),M(20),!1),d=hf.fontSize;hf.fontSize>c&&A(hf,c);hf.o(Mi("bs_tap_to_switch_bubbles"),M(40),M(16),M(180));A(hf,d)}finally{y(a.Bm)}}e=bj.prototype;
e.qh=function(){var a,b,c,d,f;f=this.a.scale;for(b=0;b<this.V.length;b++)a=this.V[b],c=this.a.V[b].x*f+this.x,d=this.a.V[b].y*f+this.y,a.moveTo(c,d,this.a.V[b].scale);for(b=0;this.a.V.length!==this.V.length;b++)c=this.a.V[this.V.length].x*f+this.x,d=this.a.V[this.V.length].y*f+this.y,a=dj(c,d),a.scale=this.a.V[this.V.length].scale,this.V.push(a)};e.bc=function(){this.ce=new ej(this.x,this.y)};e.ob=function(){for(this.ce&&J(H,this.ce);0!==this.V.length;){var a=this.V.pop();J(H,a)}this.tk=!1};
function fj(a,b,c){b-=L.Gd;c-=L.Hd;c>a.y-a.b.Wa&&(c=a.y-a.b.Wa);b-=a.x;c-=a.y+Z.gb;c=Pi.create(b,c);c.normalize();a.rotation=Math.min(180*Math.acos(0*c.x+-1*c.y)/Math.PI,a.a.Fw)*(0<b?-1:1);Pi.release(c)}
e.X=function(a){var b,c;b=H.fa[0].x;c=H.fa[0].y;fj(this,b,c);this.y=this.a.y-Z.gb;for(var d=0;d<this.V.length;++d){var f=this.V[d];f.Xa=this.a.V[d].x+this.x;f.Na=this.a.V[d].y+this.y;f.position.x=this.a.V[d].x+this.x;f.position.y=this.a.V[d].y+this.y;f.scale=this.a.V[d].scale}if(this.ce){var d=this.ce,h=this.rotation,f=-Math.sin(Math.PI*h/180),h=-Math.cos(Math.PI*h/180);d.Ul.x=f;d.Ul.y=h;this.ce.fd.x=this.x;this.ce.fd.y=this.y}1>=this.ra?(this.Hm+=a,150<this.Hm&&(this.Tg="red"===this.Tg?W.fillColor:
"red",this.zj=-1,this.Hm=0)):this.Tg=W.fillColor;b-=L.Gd;c-=L.Hd;c+=Z.gb;c=ec(this.pb,this.x,this.y,b,c);this.ce.visible=!0;this.Cm=c||H.fa[0].zb?Math.min(1,this.Cm+.003*a):Math.max(0,this.Cm-.003*a);c?(this.Wi=Math.min(1,this.Wi+.003*a),this.ce.visible=!1):this.Wi=Math.max(0,this.Wi-.003*a)};
function gj(a,b){var c,d,f,h;c=a.V.indexOf(b);if(-1!==c)for(F.play(Nf),++a.St,a.V[0]=a.V.splice(c,1,a.V[0])[0],"function"===typeof a.V[0].np&&a.V[0].np(),c=0;c<a.V.length;c++)b=a.V[c],d=a.a.V[c].x+a.x,f=a.a.V[c].y+a.y,h=a.a.V[c].scale,b.moveTo(d,f,h)}e.yg=function(a){32===a&&gj(this,this.V[1])};
e.Cb=function(a,b,c){if(0===a&&!0===Z.e.Za){a=!0;var d="object"===typeof b?new g(b.x-L.Gd,b.y-L.Hd):new g(b-L.Gd,c-L.Hd);d.y+=Z.gb;ec(this.pb,this.x,this.y,d.x,d.y)&&(a=!1);if(!0===a&&!0===this.tk){fj(this,b,c);b=this.V.shift();b.mt(this.rotation);b.My=!0;c=Z.Qq;for(var f in c.ib)c.ib[f]=Math.max(0,c.ib[f]-1);this.at=b;Z.yb.qh()}else gj(this,this.V[1])}};e.Ns=function(){this.ra--;0>=this.ra&&(this.ra=Z.r.r.ra,Z.U.sd++)};e.Tc=function(a){a===L.Bf&&cj(this)};
e.pa=function(){Qd.R(0,this.x,this.y+Z.gb,1*Z.Ia,1*Z.Ia,0,this.alpha);this.b.R(0,this.x,this.y+Z.gb,1*Z.Ia,1*Z.Ia,this.rotation,this.alpha*(1-this.Wi));var a=this.a.Vq;if(this.zj!==this.ra){w(this.Yb);try{1!==this.ra&&(this.Tg=W.fillColor);this.Yb.clear();var b=W.fillColor;W.setFillColor(this.Tg);W.o(""+this.ra,this.Yb.width/2,this.Yb.height/2);W.setFillColor(b);this.zj=this.ra}finally{y(this.Yb)}}this.Yb.o(a.x+this.x-this.Yb.width/2,a.y+this.y-this.Yb.height/2);10>=this.St&&this.Bm.R(this.x+M(35,
"floor")-Jd.cb,this.y+M(24,"floor")+Z.gb-Jd.Wa,1,1,0,this.Cm)};function hj(a,b,c){ij(this,a,b,c)}hj.pb=new Zb(0,0,Yd.width/2);function ij(a,b,c,d){a.depth=4;a.visible=!0;a.h=!1;a.group="gameObject";L.d.Ma(a,L.yf);a.position=new g(b,c);a.Xa=a.position.x;a.Na=a.position.y;a.alpha=1;a.speed=0;a.scale=1;a.b=Yd;a.size=Yd.width/2;a.type=d;a.pb=hj.pb;a.Ub=!1;a.My=!0;a.direction=new g(0,-1);a.te=["bubble"];a.Pl=0;I(a);Sb(a,"game")}e=hj.prototype;e.ob=function(){};
function jj(a){var b;a.ia("game");b=new wi(a,{scale:1.1},300,K,function(){b=new wi(a,{scale:1},300,K,function(){a.ia("background")});b.group="gameObject";b.start()});b.group="gameObject";b.start()}function kj(a,b){a.direction.x=-Math.sin(Math.PI*b/180);a.direction.y=-Math.cos(Math.PI*b/180)}e.dn=function(){this.speed=Z.Ia*Z.r.ca.speed};e.mt=function(a){F.play(Mf);kj(this,a);this.dn();this.h=!0};e.ia=function(){};e.ul=function(){Z.U.qh(this);this.speed=0;this.h=!1;return!0};
function lj(a,b,c){var d;c="undefined"!==typeof c?c:!0;a.ia("game");b*=a.speed;for(var f=0;f<b;){f+=1;a.position.x+=1*a.direction.x;a.position.y+=1*a.direction.y;a.Xa=a.position.x;a.Na=a.position.y;var h=[];c&&a.position.x<a.size?h.push(new g(-a.direction.x,a.direction.y)):c&&a.position.x>L.Sc-a.size&&h.push(new g(-a.direction.x,a.direction.y));if(a.position.y>L.mj+a.size-Z.gb){a.remove();break}if(0<h.length){var k=new g(0,0);for(d=0;d<h.length;++d)k=k.add(h[d]);0===k.length()&&console.log("bounceDirectionAverage is 0");
k=k.normalize();a.direction=k}if(d=!a.Ub)d=Z.U,h=void 0,a.position.y<Z.Aa?d=!0:(h=mj(d,a.position.x,a.position.y),d=!1!==nj(d,h.Ka,h.position)?!0:!1),d=!0===d;if(d&&a.ul())break}}e.X=function(a){lj(this,a)};
function oj(a,b,c){var d;!1===a.Ub&&("undefined"!==typeof a.ka&&J(H,a.ka),a.ia("game"),d=L.a.k.oa.bv,c=(new g(b,c)).ic(new g(a.position.x,a.position.y)).normalize().scale(d),b=a.position.x-c.x,c=a.position.y-c.y,a.ka=new wi(a,{Xa:b,Na:c},L.a.k.oa.Rq/2,uc,function(){a.ka=new wi(a,{Xa:a.position.x,Na:a.position.y},L.a.k.oa.Rq/2,uc,function(){!1===a.Ub&&a.ia("background")});a.ka.group="gameObject";a.ka.start()}),a.ka.group="gameObject",a.ka.start())}
function pj(a,b){!1===a.Ub&&("undefined"!==typeof a.ka&&J(H,a.ka),a.ia("game"),a.Xa=a.position.x,a.Na=a.position.y,a.position.y+=b,a.ka=new wi(a,{Na:a.position.y,Xa:a.position.x},L.a.k.oa.ex,uc,function(){!1===a.Ub&&a.ia("background");qj(a)}),a.ka.group="gameObject",a.ka.start())}
function qj(a){if(a.position.y+Z.Aa>Ti()){var b=Z.e;if(b.Za){var c=Z.e;if(c.Za){c.Za=!1;var d=H,f=1,h=d.jc.length,k;void 0===f&&(f=1);void 0===c&&(c=null);for(k=0;k<d.jc.length;k+=1)"LEVELFINISHED"===d.jc[k].id&&d.jc[k].Sf===c&&(h=k);if(h===d.jc.length)for(k=0;k<d.jc.length;k+=1)void 0===d.jc[k].id&&(h=k);d.jc[h]={id:"LEVELFINISHED",time:3E3,AB:f,Sf:c,Xg:3E3,om:f-1,paused:0}}b.zp(Mi("bs_gameover","Game over!"))}a.Pl||(a.Pl=H.Gh)}}
e.moveTo=function(a,b,c){var d;!1===this.Ub&&("undefined"!==typeof this.ka&&J(H,this.ka),this.ia("game"),this.position.x=a,this.position.y=b,a="undefined"!==typeof c?c:this.scale,d=this,this.ka=new wi(this,{Xa:this.position.x,Na:this.position.y,scale:a},L.a.k.oa.Sl,K,function(){!1===d.Ub&&d.ia("background")}),this.ka.group="gameObject",this.ka.start())};
function rj(a,b){var c,d,f;!1===a.Ub&&(c=mj(Z.U,a.position.x,a.position.y),"undefined"!==typeof Z.U.I[c.Ka][c.position]&&(a.ia("game"),a.Ub=!0,Rb(a,0),d=new hj(a.position.x,a.position.y,b),jj(d),f=new wi(a,{alpha:0},600,K),f.group="gameObject",f.start(),f=new wi(a,{scale:1.1},300,K,function(){f=new wi(a,{scale:1},300,K,function(){a.remove()});f.group="gameObject";f.start()}),f.group="gameObject",f.start(),Z.U.I[c.Ka][c.position]=d))}
e.pop=function(){var a,b;!1===this.Ub&&(this.ia("game"),Rb(this,3),this.Ub=!0,"undefined"!==typeof this.ka&&J(H,this.ka),a=new wi(this,{Xa:this.position.x,Na:this.position.y},L.a.k.oa.Sl,K),a.group="gameObject",a.start(),b=this,a=new wi(this,{scale:L.a.k.oa.Ix},L.a.k.oa.Hx,qc,function(){J(H,b);new Vi(b.position.x,b.position.y,b.depth,Vd,L.a.k.oa.Kj,1)}),a.group="gameObject",a.start())};
e.gj=function(){if(!1===this.Ub){var a,b;this.ia("game");Rb(this,3+Md.F);this.Ub=!0;"undefined"!==typeof this.ka&&J(H,this.ka);a=new wi(this,{Xa:this.position.x,Na:this.position.y},L.a.k.oa.Sl,K);a.group="gameObject";a.start();b=this;a=new wi(this,{scale:L.a.k.oa.Rn},L.a.k.oa.fl,qc,function(){J(H,b);new Vi(b.position.x,b.position.y,b.depth,Rd,L.a.k.oa.el,1)});a.group="gameObject";a.start()}};
e.Rh=function(){switch(this.type){case 0:F.play(Gf);break;case 1:F.play(Hf);break;case 2:F.play(If);break;case 3:F.play(Jf);break;case 4:F.play(Kf);break;case 5:F.play(Lf)}};
function sj(a){var b;!1===a.Ub&&(a.ia("game"),Rb(a,3),a.Ub=!0,"undefined"!==typeof a.ka&&J(H,a.ka),b=L.a.k.oa.Dv,a.position.x+=Math.random()*b-b/2,a.position.y+=L.mj,b=new wi(a,{Na:a.position.y},L.a.k.oa.zr,tc,function(){J(H,a)}),b.group="gameObject",b.start(),b=new wi(a,{Xa:a.position.x},L.a.k.oa.zr,K),b.group="gameObject",b.start())}e.remove=function(){this.ia("game");J(H,this);this.Ub=!0};
function tj(a){0<a.Pl&&Wd.R(0,a.position.x,a.position.y+Z.gb,a.scale*Z.Ia,a.scale*Z.Ia,0,(Math.sin((H.Gh-a.Pl)/1E3*Math.PI*2)+1)/2)}e.hh=function(a,b){tj(this);this.b.R(this.type,a,b+Z.gb,this.scale*Z.Ia,this.scale*Z.Ia,0,this.alpha)};e.pa=function(){0!==this.speed||this.h||this.Xa!==this.position.x||this.Na!==this.position.y||(this.Xa=this.position.x,this.Na=this.position.y);this.hh(this.Xa,this.Na)};
function Zi(){this.depth=-9E3;this.h=this.visible=!1;this.group="gameObject";var a=Li(0,0);this.x=a.x-M(6);this.y=a.y;this.xn=[];L.d.Ma(this,L.wg);I(this);Sb(this,"game")}Zi.prototype.X=function(){};Zi.prototype.bc=function(){m.ia(this.canvas)};Zi.prototype.qh=function(a){this.xn.push(a);m.ia(this.canvas);a.pa()};Zi.prototype.If=function(a){a=this.xn.indexOf(a);-1!==a&&this.xn.splice(a,1);this.h=!0};function uj(a,b,c){this.Ka=a;this.position=b;c&&(this.ca=c)}
function $i(){this.depth=9E3;this.visible=!0;this.h=!1;this.group="gameObject";this.I=[];this.ie=1;this.sd=this.rf=0;this.random=new ga;L.d.Ma(this,L.wg);this.Mo=Math.sqrt(Math.pow(2*Z.Aa,2)-Math.pow(Z.Aa,2));this.Yn=[];I(this);Sb(this,"game")}e=$i.prototype;e.bc=function(){};e.ob=function(){};e.pa=function(){pi(L.Gd,L.Hd,L.Sc,L.mj);for(var a=0;a<this.I.length;++a)for(var b=this.I[a],c=0;c<b.length;++c){var d=b[c];d&&d.Uz&&d.hh(d.Xa+L.Gd,d.Na+L.Hd)}};
function vj(a){for(var b=[0,0,0,0,0,0],c=0;c<a.I.length;++c)for(var d=a.I[c],f=0;f<d.length;++f){var h=d[f];h&&5>=h.type&&0<=h.type&&b[h.type]++}return b}
function wj(a,b){b=b||2;var c;c=Z.yb;c=0<c.V.length?c.V[0].type:void 0;for(var d=Z.yb.at?Z.yb.at.type:null,f=a.I.length;0<=f;--f)for(var h=a.I[f],k=Math.floor(L.Sc/(2*Z.Aa))-(f%2===a.ie?0:1),l=0;l<k;++l){var n=Math.floor((k-1)/2)+Math.ceil(l/2)*(1-(l+1)%2*2);if(!h||!h[n]){for(var q=new uj(f,n,null),q=xj(a,q.Ka,q.position,[q.ca]),u=[],B=0,C=-1,t=0;t<q.length;++t){var s=q[t].ca;s&&5>=s.type&&0<=s.type&&s.type!==c&&s.type!==d&&("undefined"===typeof u[s.type]&&(u[s.type]=yj(a,f,n,s.type,[],!0)),u[s.type]>=
B&&(C=s.type,B=u[s.type]))}if(B>=b)return C}}return 1<b?wj(a,1):zj(new Aj)}function mj(a,b,c){c=Math.round((c-Z.Aa)/a.Mo);c=Math.max(c,0);c%2===a.ie?(a=Math.round((b-Z.Aa)/(2*Z.Aa)),a=Math.max(Math.min(a,Math.floor(L.Sc/(2*Z.Aa))-1),0)):(a=Math.round((b-2*Z.Aa)/(2*Z.Aa)),a=Math.max(Math.min(a,Math.floor(L.Sc/(2*Z.Aa))-2),0));return new uj(c,a)}function Bj(a,b,c){return{x:c*Z.Aa*2+Z.Aa*(b%2===a.ie?1:2),y:b*a.Mo+Z.Aa}}
function Cj(a){var b,c,d;for(b=0;b<a.I.length;b++){c=a.I[b];d=!0;for(var f=0;f<c.length;f++)"undefined"!==typeof c[f]&&(d=!1);if(!0===d)return b}return a.I.length}function Dj(a){var b,c,d,f,h;f=[];for(b=0;b<a.I.length;b++)for(d=a.I[b],c=0;c<d.length;c++)h=d[c],"undefined"!==typeof h&&f.push({ca:h,Ka:b,position:c});return f}function nj(a,b,c){return"undefined"!==typeof a.I[b]&&"undefined"!==typeof a.I[b][c]?a.I[b][c]:!1}
function aj(a,b){var c,d,f,h,k,l,n,q;d=Math.sqrt(Math.pow(2*Z.Aa,2)-Math.pow(Z.Aa,2));var u=new Aj;for(h=1;h<=b;h++){a.ie=(a.ie+1)%2;c=Math.floor(L.Sc/(2*Z.Aa))-a.ie;f=[];n=-d*h+Z.Aa;for(k=0;k<c;k++){l=0===a.ie%2?k*Z.Aa*2+Z.Aa:k*Z.Aa*2+2*Z.Aa;a:{q=u;for(var B=n,C=Z.U.random.random(q.Jm),t=0,s=0;s<q.Cd.length;++s)if(t+=q.Cd[s],t>C){if(5>=s){q=new hj(l,B,-1);break a}if(6===s){q=new Ej(l,B);break a}}q=void 0}f.push(q)}a.I.splice(0,0,f);for(k=0;k<c;++k)if(q=a.I[0][k],-1===q.type)a:for(f=u,n=k,l=(s=10*
Z.r.r.He>Z.U.random.random(1E3))?1:Z.r.r.Ve,B=[],C=0,t=[],q.kw=s;;){for(var v=Z.U.random.random(f.ah),x=0,s=0;5>=s;++s)if(x+=f.Cd[s],x>v)if("undefined"===typeof B[s]&&(B[s]=yj(Z.U,0,n,s)),B[s]>=l){t[s]||(t[s]=!0,C++);break}else{q.type=s;break a}if(C>=f.fz)for(t=[],s=0;s<B.length;++s)B[s]--}}c=Dj(a);for(k=0;k<c.length;k++)q=c[k].ca,pj(q,d*b)}
function yj(a,b,c,d,f,h){var k=0;h=h||!1;b=[new uj(b,c)];for(f=f||[];1<=b.length;){c=b[0];f.push(c.ca);c=xj(a,c.Ka,c.position,f);for(var l=0;l<c.length;l++){var n=c[l];f.push(n.ca);d===n.ca.type&&(n.ca.kw&&(h||(k+=999999)),b.push(n),++k)}b.splice(0,1)}return k}
function Fj(a,b){var c,d,f,h=null,k=null,l,n;l=[];for(c=0;c<a.I.length;c++)for(d=a.I[c],f=c,n=Math.floor(L.Sc/(2*Z.Aa))-(f%2===a.ie?0:1),f=0;f<n;f++)Gj(a,c,f)||"undefined"===typeof d[f]&&l.push(new uj(c,f));f=a.I.length;n=Math.floor(L.Sc/(2*Z.Aa))-(f%2===a.ie?0:1);for(c=0;c<n;c++)Gj(a,a.I.length,c)||l.push(new uj(a.I.length,c));for(c=0;c<l.length;c++)if(d=l[c],0===d.Ka||0<xj(a,d.Ka,d.position).length)if(f=Bj(a,d.Ka,d.position),f=b.position.ic(new g(f.x,f.y)).length(),f<h||null===h)h=f,k=d;f=Bj(a,
k.Ka,k.position);"undefined"===typeof a.I[k.Ka]&&(a.I[k.Ka]=[]);a.I[k.Ka][k.position]=b;b.moveTo(f.x,f.y);return k}
e.qh=function(a){var b=0,c,d,f,h,k,l,n,q,u;n=this;this.rf++;u=!0;l=new Ni;l.group="gameObject";d=0;c=Fj(this,a);var B=0;h=Hj(this,c.Ka,c.position);if(3<=h.length){u=!1;for(f=q=0;f<h.length;f++)this.If(h[f].Ka,h[f].position),++b,++q,d+=L.a.k.oa.Fx*Math.pow(f+1,L.a.k.oa.Gx),l.Y(d,function(a,b){return function(){a.pop();B+=Wi(Z.e,a.position.x,a.position.y,1,b,!1)}}(h[f].ca,q));10<h.length&&F.play(vf);6<h.length?F.play(yf):6<h.length?F.play(zf):5<h.length?F.play(Af):4<h.length?F.play(Bf):a.Rh();var C=
new g(0,0);k=Ij(this);for(f=0;f<k.length;f++)this.If(k[f].Ka,k[f].position),++b,d+=L.a.k.oa.yr,l.Y(d,function(a){return function(){sj(a)}}(k[f].ca)),C=C.add(k[f].ca.position);0<k.length?(C=C.scale(1/k.length),l.Y(d,function(){Wi(Z.e,C.x,C.y,k.length,k.length,!0,B)})):l.Y(d,function(){Wi(Z.e,a.x,a.y,0,0,!1,B)})}else F.play(Ff);c=xj(this,c.Ka,c.position);for(f=0;f<c.length;f++)h=c[f].ca,q=c[f].Ka,"bomb"===h.type?(h.Rh(),h.gj()):q!==this.maxLength-1&&u&&oj(h,a.position.x,a.position.y);l.Y(d,function(){n.rf--;
0===n.rf&&n.Vm()});0===b&&(qj(a),Z.yb.Ns());l.start()};e.If=function(a,b){!1!==nj(this,a,b)&&(this.I[a][b]=void 0)};
function xj(a,b,c,d){var f,h,k,l;h=b%2===a.ie?[new uj(b-1,c-1),new uj(b-1,c),new uj(b,c+1),new uj(b+1,c),new uj(b+1,c-1),new uj(b,c-1)]:[new uj(b-1,c),new uj(b-1,c+1),new uj(b,c+1),new uj(b+1,c+1),new uj(b+1,c),new uj(b,c-1)];f=[];for(k=0;k<h.length;k++)b=h[k].Ka,c=h[k].position,"undefined"!==typeof a.I[b]&&"undefined"!==typeof a.I[b][c]&&(l=a.I[b][c],("undefined"!==typeof d?-1===d.indexOf(l):1)&&f.push({ca:l,Ka:b,position:c}));return f}
function Hj(a,b,c){var d,f,h,k,l;h=a.I[b][c];f=[new uj(b,c,h)];d=d||[];for(b=[new uj(b,c,h)];1<=f.length;){c=f[0];d.push(c.ca);k=xj(a,c.Ka,c.position,d);for(c=0;c<k.length;c++)l=k[c],d.push(l.ca),h.type===l.ca.type&&(f.push(l),b.push(l));f.splice(0,1)}return b}
function Ij(a){var b,c,d,f,h,k;if("undefined"===typeof a.I[0])return Dj(a);c=[];b=b||[];f=!0;for(d=0;d<a.I[0].length;d++)h=a.I[0][d],"undefined"===typeof h?f=!0:!0===f&&(f=!1,c.push({ca:h,Ka:0,position:d}));for(;1<=c.length;){d=c[0];b.push(d.ca);h=xj(a,d.Ka,d.position,b);for(d=0;d<h.length;d++)f=h[d],-1===b.indexOf(f.ca)&&(c.push(f),b.push(f.ca));c.splice(0,1)}f=[];for(d=0;d<a.I.length;d++)for(k=a.I[d],c=0;c<k.length;c++)h=k[c],-1===b.indexOf(h)&&"undefined"!==typeof h&&f.push({ca:h,Ka:d,position:c});
return f}function Jj(a){var b,c,d,f,h;h=c=0;f=new Ni;f.group="gameObject";b=Ij(a);for(d=0;d<b.length;d++)a.If(b[d].Ka,b[d].position),c+=L.a.k.oa.yr,h++,f.Y(c,function(a){return function(){sj(a)}}(b[d].ca));f.start();return h}e.Vm=function(){if(!0===Z.e.Za){var a=Math.round(Z.r.U.fe/Z.Ia),b=Cj(this);this.sd=Math.max(a-b,this.sd);0<this.sd&&(aj(this,this.sd),this.sd=0,0<a-b&&(Z.ee=Math.max(1,Z.ee-1),Z.yb.ra=Z.ee))}};
function Kj(a,b,c){var d=Z.U,f,h,k,l,n,q;d.rf++;l=Z.r.kb.rb;n=L.a.k.kb.Sn;k=new Ni;k.group="gameObject";k.Sd=n;h=new g(a,b);a=Dj(d);for(b=0;b<a.length;b++)f=a[b].ca,q=h.ic(f.position).length(),q<l&&"bomb"!==f.type&&"blocker"!==f.type&&k.Y(q,function(a){return function(){rj(a,c)}}(f));k.Y(l+L.a.k.oa.Kj*n,function(){d.rf--});k.start()}
function Lj(a,b){var c=Z.U,d,f,h,k,l,n,q,u,B,C,t;c.rf++;u=Z.r.Ca.rb;B=L.a.k.Ca.Sn;C=0;q=new Ni;q.group="gameObject";q.Sd=B;n=new g(a,b);d=Dj(c);for(f=0;f<d.length;f++)h=d[f].ca,k=d[f].Ka,l=d[f].position,t=n.ic(h.position).length(),0===t&&c.If(k,l),t<u&&(c.If(k,l),C++,q.Y(t,function(a){return function(){a.gj()}}(h)));C+=Jj(c);q.Y(u+(L.a.k.oa.el+L.a.k.oa.fl)*B,function(){c.rf--;0===c.rf&&c.Vm()});q.start();Wi(Z.e,a,b,C,C,!0)}
function Gj(a,b,c){"undefined"===typeof a.Yn[b]&&(a.Yn[b]=[]);return!0===a.Yn[b][c]}function Vi(a,b,c,d,f,h,k){this.depth=c;this.h=this.visible=!0;this.group="gameObject";L.d.Ma(this,L.Eh);this.x=a;this.y=b;this.b=d;this.duration=f;this.scale=h;this.na=0;this.rotation=k||0;I(this);Sb(this,"game");this.m=0}Vi.prototype.X=function(a){this.m+=a;this.na=this.rotation;this.m>=this.duration&&J(H,this)};
Vi.prototype.pa=function(){var a=Li(this.x,this.y);this.b.R(Math.floor(this.m*this.b.F/this.duration),a.x,a.y+Z.gb,this.scale*Z.Ia,this.scale*Z.Ia,this.na,1)};function Mj(){this.Sa=this.depth=0;this.h=this.visible=!0;I(this);Sb(this,"game")}Mj.prototype.ql=function(){var a,b,c,d;a=[];b=[Dd,Ed,Fd,Gd,Hd,Id,Bd,Cd];for(c=0;c<b.length;c+=1)d=b[c],a.push({b:d,text:L.l.H("TutorialText_"+c,"<TutorialText_"+c+">"),title:L.l.H("TutorialTitle_"+c,"<TutorialHeader_"+c+">")});return a};
function ej(a,b){this.depth=11;this.h=this.visible=!0;this.group="gameObject";L.d.Ma(this,L.yf);this.fd=new g(a,b);this.Ul=new g(0,-1);this.alpha=0;this.a=L.a.k.ce;this.I=[];I(this);Sb(this,"game")}
function Nj(a,b){var c,d,f,h,k=null,l;l=Z.Aa;c=Dj(Z.U);for(d=0;d<c.length;d++)f=c[d].ca,h=new g(f.Xa,f.Na),h=a.ic(h).ic(b.scale(a.ic(h).pg(b))).length(),h<=l&&(null===k||f.Na>k.Na?k=f:f.Na===k.Na&&Math.abs(f.Xa-a.x)<Math.abs(k.Xa-a.x)&&(k=f));k?(h=a.ic(new g(k.Xa,k.Na)),c=2*h.pg(b),l=h.pg(h)-Math.pow(l,2),h=Math.pow(c,2)-4*l,l=(-c+Math.sqrt(h))/2,h=(-c-Math.sqrt(h))/2):(l=Math.abs(a.x/b.x),h=Math.abs(a.y/b.y));l=Math.min(l,h);return[b.scale(l).add(a)]}
ej.prototype.X=function(){this.I=0!==this.alpha&&1===this.a.Sr?[this.fd].concat(Nj(this.fd,this.Ul)):[]};ej.prototype.Bb=function(){this.ka&&J(H,this.ka);this.ka=new wi(this,{alpha:1},400,K);this.ka.group="gameObject";this.ka.start()};ej.prototype.Cb=function(){this.ka&&J(H,this.ka);this.ka=new wi(this,{alpha:0},400,K);this.ka.group="gameObject";this.ka.start()};
ej.prototype.pa=function(){var a,b,c,d,f,h;switch(this.a.Sr){case 1:d=m.context;d.lineWidth=this.a.lineWidth;d.strokeStyle="rgba(255, 255, 255, "+.2*this.alpha+")";c=this.a.sv;h=0;for(f=1;f<this.I.length;f++){d.beginPath();d.moveTo(this.I[f-1].x,this.I[f-1].y+Z.gb);d.lineTo(this.I[f].x,this.I[f].y+Z.gb);for(var k=this.I[f].ic(this.I[f-1]).normalize(),l=this.I[f].ic(this.I[f-1]).length(),n=this.I[f-1];h<l;h+=2*c)d.beginPath(),a=k.scale(h).add(n),b=k.scale(Math.min(l,h+c)).add(n),d.moveTo(a.x,a.y+Z.gb),
d.lineTo(b.x,b.y+Z.gb),d.stroke();h-=l}2<=this.I.length&&Ud.md(0,this.I[this.I.length-1].x,this.I[this.I.length-1].y+Z.gb,this.alpha);break;case 2:Td.R(0,this.fd.x,this.fd.y+Z.gb,1,1,this.Ul.direction()-90,this.alpha)}};function Oj(a,b){ij(this,a,b,0);this.h=!0;this.Zq=zj(new Aj);this.b=Nd;this.type="blank";this.J=new r(this.b.width,this.b.height);w(this.J);Yd.o(this.Zq,this.b.cb,this.b.Wa);this.b.o(0,this.b.cb,this.b.Wa);y(this.J)}kg(hj,Oj);Oj.prototype.np=function(){F.play(Ef)};
Oj.prototype.ul=function(){Fj(Z.U,this);Kj(this.position.x,this.position.y,this.Zq);this.h=!1;this.Rh();return!0};Oj.prototype.Rh=function(){F.play(xf)};Oj.prototype.hh=function(){this.J.R(this.Xa-this.b.cb*this.scale*Z.Ia,this.Na+Z.gb-this.b.Wa*this.scale*Z.Ia,this.scale*Z.Ia,this.scale*Z.Ia,0,this.alpha)};function Pj(a,b){ij(this,a,b,0);this.b=Kd;this.type="bomb";this.Qn=!1}kg(hj,Pj);e=Pj.prototype;e.ul=function(){Fj(Z.U,this);this.gj();return!0};
e.gj=function(){!1===this.Qn&&(this.Rh(),this.h=!1,this.Qn=!0,Lj(this.position.x,this.position.y),this.pop())};
e.pop=function(){var a,b;!1===this.Ub&&(this.Ub=!0,"undefined"!==typeof this.ka&&this.ka.finish(),this.ia("game"),Rb(this,3),a=new wi(this,{Xa:this.position.x,Na:this.position.y},L.a.k.oa.Sl,K),a.group="gameObject",a.start(),b=this,a=new wi(this,{scale:L.a.k.Ca.Rn},L.a.k.Ca.fl,qc,function(){J(H,b);new Vi(b.position.x,b.position.y,b.depth,Rd,L.a.k.Ca.el,L.a.k.Ca.Cv)}),a.group="gameObject",a.start())};e.Rh=function(){F.play(wf)};
e.hh=function(){this.b.R(0,this.Xa,this.Na+Z.gb,this.scale*Z.Ia,this.scale*Z.Ia,0,this.alpha)};function Qj(a,b){ij(this,a,b,"fire");L.d.Ma(this,L.yf);this.depth=1;this.h=!0;this.rn=this.m=0;this.b=Ld;this.wj=0;this.We=!1;null===Rj&&(Rj=new Zb(0,0,this.size*L.a.k.pd.jv));this.pb=Rj}kg(hj,Qj);var Rj=null;e=Qj.prototype;e.np=function(){F.play(Cf)};e.dn=function(){this.speed=Z.Ia*Z.r.ca.speed*L.a.k.pd.ny};
e.ob=function(){var a,b;a=this;Z.e.Ux||(b=new Ni,b.group="gameObject",b.Y(L.a.k.pd.dz,function(){a.wj+=Jj(Z.U);Z.U.Vm()}),b.start(),Wi(Z.e,this.position.x,this.position.y+M(80),this.wj,this.wj,!0));Z.background.If(this)};e.mt=function(a){F.play(Df);var b=new Ni;b.group="gameObject";b.Y(100,function(){F.play(Df)});b.start();kj(this,a);this.dn();this.Un=new Sj(this.position.x,this.position.y);this.h=this.We=!0};e.ul=function(){return!1};
e.X=function(a){this.rn+=a;if(!0===this.We){lj(this,a,L.a.k.pd.cv);(0>this.position.y+M(0)+this.size||0>this.position.x||this.position.x>L.Sc)&&J(H,this);for(var b=0;b<a;++b)this.m+=1,this.m>=L.a.k.pd.Sp/Md.F&&(this.Un=new Sj(this.position.x,this.position.y),this.m-=L.a.k.pd.Sp/Md.F);this.Un.x=this.position.x;this.Un.y=this.position.y;a=Z.U;var c,d,f,h,k;k=!1;b=Dj(a);for(c=0;c<b.length;c++)d=b[c].ca,f=b[c].Ka,h=b[c].position,!0===cc(d.pb,d.Xa,d.Na,this.pb,this.position.x,this.position.y)&&(d.gj(),
a.If(f,h),k=!0);!0===k&&this.wj++}this.canvas.Z=!0};e.hh=function(){var a=new g(this.Xa,this.Na),b=new g(0,0);this.b.R(Math.floor(this.rn/80)%this.b.F,a.x+b.x,a.y+Z.gb+b.y,this.scale*Z.Ia,this.scale*Z.Ia,0,this.alpha)};function Sj(a,b){this.depth=2;this.h=this.visible=!0;this.group="gameObject";L.d.Ma(this,L.yf);this.na=0;this.Xx=-.2+(new ga).random(.4);this.x=a;this.y=b;this.m=this.index=0;this.scale=L.a.k.pd.scale;this.b=Md;I(this);Sb(this,"game")}
Sj.prototype.X=function(a){this.m+=a;this.na+=this.Xx*a;this.m>=L.a.k.pd.Sp/this.b.F&&(this.index+=1,this.m=0,Rb(this,this.depth+1));this.index===this.b.F&&J(H,this)};Sj.prototype.pa=function(){var a=new g(this.x,this.y);this.b.R(this.index,a.x,a.y,this.scale,this.scale,this.na,1)};function Aj(){this.Cd=Tj(Z.r.Fe);this.Jm=Uj(this.Cd,!1);this.ah=Uj(this.Cd,!0);for(var a=0,b=0;5>=b;++b)0<this.Cd[b]&&a++;this.fz=a}
function Vj(a,b){switch(b){case 0:return a.Ib;case 1:return a.Jb;case 2:return a.Kb;case 3:return a.Lb;case 4:return a.Mb;case 5:return a.Nb;case 6:return a.Ob;case 7:return a.Pb;case 8:return a.Qb;case 9:return a.Rb}}function Tj(a){var b=[0,0,0,0,0,0],c;for(c=Math.floor(Z.ac.Hh()/10);0<=c&&!(b=Vj(a,c));--c);return b}function Uj(a,b){var c,d=0;for(c=0;c<(b?6:a.length);++c)a[c]&&(d+=a[c]);return d}function zj(a){for(var b=Z.U.random.random(a.ah),c=0,d=0;5>=d;++d)if(c+=a.Cd[d],c>b)return d}
function Ej(a,b){ij(this,a,b,"blocker");this.b=Od;this.type="blocker";this.Qn=!1}kg(hj,Ej);Ej.prototype.hh=function(){tj(this);this.b.R(0,this.Xa,this.Na+Z.gb,this.scale*Z.Ia,this.scale*Z.Ia,0,this.alpha)};function Ri(){this.ib={Ca:0,Dn:0,pd:0,all:0}}
function Wj(a,b){var c=5*(Z.r.r.border-Cj(Z.U))+Z.yb.ra;!b&&10>=c?(1===c?a.lc=Z.r.ub.we:2===c?a.lc=Z.r.ub.xe:3===c?a.lc=Z.r.ub.ye:4===c?a.lc=Z.r.ub.ze:5===c?a.lc=Z.r.ub.Ae:6===c?a.lc=Z.r.ub.Be:7===c?a.lc=Z.r.ub.Ce:8===c?a.lc=Z.r.ub.De:9===c?a.lc=Z.r.ub.Ee:10===c&&(a.lc=Z.r.ub.ve),a.lc||(a.lc=Tj(Z.r.ub))):a.lc=Tj(Z.r.ub);a.Jm=Uj(a.lc);Z.ac.Zh.O()}
function dj(a,b){var c=Z.Qq;Wj(c);for(var d=0;;){for(var f=Z.yb.random.random(c.Jm),h=0,k=0;k<c.lc.length;++k)if(h+=c.lc[k],h>=f){if(0===k){c=a;d=b;f=void 0;if(!f){f=void 0;h=Z.U;f=f||vj(h);h=[];for(k=0;k<f.length;++k)0<f[k]&&h.push(k);0===h.length&&h.push(zj(new Aj));f=h}f=+f[0+ha(Z.yb.random,f.length-1-0)];return new hj(c,d,f)}if(1===k){for(var c=a,d=b,f=new Aj,h=vj(Z.U),l=0,k=void 0,k=0;6>k;++k)l=Math.max(h[k],l);for(k=0;6>k;++k)0!==h[k]?(h[k]=l-h[k],h[k]*=h[k]):h[k]=0;l=Uj(h,!0);0===l&&zj(f);
for(var n=[0,0,0,0,0,0],k=0;6>k;++k)n[k]=h[k]/l*f.Cd[k];f.Cd=n;f.ah=Uj(f.Cd,!0);0===f.ah&&(f.Cd=h,f.ah=l);0===f.ah&&(f.ah=10);f=zj(f);return new hj(c,d,f)}if(2===k){if(0<c.ib.Ca||0<c.ib.all)break;c.ib.Ca+=Z.r.Gc.Ca;c.ib.all+=Z.r.Gc.all;return new Pj(a,b)}if(3===k){if(0<c.ib.Dn||0<c.ib.all)break;c.ib.Dn+=Z.r.Gc.kb;c.ib.all+=Z.r.Gc.all;return new Oj(a,b)}if(4===k){if(0<c.ib.pd||0<c.ib.all)break;c.ib.pd+=Z.r.Gc.Ne;c.ib.all+=Z.r.Gc.all;return new Qj(a,b)}if(5===k)return new hj(a,b,wj(Z.U))}++d;100===
d&&Wj(c,!0);200===d&&(c.lc=[1],c.Jm=1)}throw"generateBubbleOrSpecialBubble";}function Xj(a,b,c){this.Tf=!1;this.kf=-1;this.e=a;this.a=b;this.h=!0;this.Pj(c);this.width=he.width;this.height=he.height;this.font=b.font.K();b.$d&&z(this.font,b.$d);Wh.call(this,a,b);this.A.Sb=-this.width/2;this.A.Tb=-this.height/2;this.J=new r(this.width,this.height);this.ge()}kg(Wh,Xj);hi.GameUIRestartButton=Xj;e=Xj.prototype;e.Pj=function(){var a=null,a=he;this.jb=function(){Bh();return!0};this.a.b=a};
e.ge=function(){this.J.clear();w(this.J);this.b.R(0,this.width/2,this.height/2,this.A.scale,this.A.scale,0,this.A.alpha);var a=L.l.H("optionsRestart"),b=this.font.$(a),c=1;90<b&&(c=this.ip/b);c*this.A.scale;this.font.R(a,this.width/2,this.height/2,c,c,0,1);this.e.ec=!0;y(this.J)};e.pa=li.prototype.pa;e.Bg=function(a,b){var c=this.x-this.width/2*this.A.scale,d=this.y-this.height/2*this.A.scale;return a>c&&a<c+this.width*this.A.scale&&b>d&&b<d+this.height*this.A.scale};
e.Bb=function(a,b,c){if(this.h)return this.Bg(b-L.Qe,c-L.be)?(this.Tf=!0,this.kf=a,!0):!1};e.X=function(a){Wh.prototype.X.apply(this,arguments)};e.Cb=function(a,b,c){return this.Tf&&a===this.kf?(this.Bg(b-L.Qe,c-L.be)&&this.jb&&this.jb(),this.Tf=!1,this.kf=-1,!0):!1};O=O||{};O["en-us"]=O["en-us"]||{};O["en-us"].game_ui_HIGHSCORE="high\nscore";O["en-gb"]=O["en-gb"]||{};O["en-gb"].game_ui_HIGHSCORE="high\nscore";
var Sh=M(14),Th=M(24),Rh={},ai={background:{b:je,Yr:M(0),Zr:M(26),elements:[{x:M(56)+Sh,y:M(82)+Th,b:ee},{S:"game_ui_STAGE",x:M(21)+Sh,y:M(52)+Th,nc:M(70),vc:M(20),gf:.2,font:mf,$d:{fillColor:"#bdc4fa",fontSize:M(20),Oe:"lower",align:"center",j:"top",stroke:!0,strokeColor:"#000",Ac:!0,Xb:4,Kc:"round"}},{x:M(56)+Sh,y:M(222)+Th,b:de},{S:"game_ui_SCORE",x:M(21)+Sh,y:M(192)+Th,nc:M(70),vc:M(36),gf:.2,font:mf,$d:{fillColor:"#bdc4fa",fontSize:M(18),Oe:"lower",align:"center",j:"top",stroke:!0,strokeColor:"#000",
Ac:!0,Xb:4,Kc:"round"}},{x:M(56)+Sh,y:M(362)+Th,b:ge},{S:"game_ui_HIGHSCORE",x:M(21)+Sh,y:M(332)+Th,nc:M(70),vc:M(36),gf:.2,font:mf,$d:{fillColor:"#bdc4fa",fontSize:M(18),Oe:"lower",align:"center",j:"top",stroke:!0,strokeColor:"#000",Ac:!0,Xb:4,Kc:"round"}}]},yt:{x:M(6)+Sh,y:M(86)+Th,nc:M(100),vc:M(38),gf:.2,Wp:!1,separator:"",font:mf,$d:{fontSize:M(38),fillColor:"#bdc4fa",align:"center",j:"top",stroke:!0,strokeColor:"#000",Ac:!0,Xb:4,Kc:"round"}},ft:{x:M(6)+Sh,y:M(232)+Th,nc:M(100),vc:M(24),Fm:50,
gf:.2,Wp:!1,separator:"",font:mf,$d:{fontSize:M(24),fillColor:"#bdc4fa",align:"center",j:"top",stroke:!0,strokeColor:"#000",Ac:!0,Xb:4,Kc:"round"}},Ur:{x:M(16)+Sh,y:M(372)+Th,nc:M(80),vc:M(26),Fm:50,gf:.2,Wp:!1,separator:"",font:mf,$d:{fillColor:"#bdc4fa",fontSize:M(26),align:"center",j:"top",stroke:!0,strokeColor:"#000",Ac:!0,Xb:4,Kc:"round"}},Qk:{CB:{kv:"GameUIRestartButton",x:M(56)+Sh,y:M(502)+Th,font:mf,$d:{fillColor:"#bdc4fa",fontSize:M(26),align:"center",j:"middle",stroke:!0,strokeColor:"#000",
Ac:!0,Xb:4,Kc:"round"}}}};Mj.prototype.ql=function(){var a,b,c,d;a=[];b=[Dd,Ed,Fd,Gd];for(c=0;c<b.length;c+=1)d=b[c],a.push({b:d,text:L.l.H("TutorialText_"+c,"<TutorialText_"+c+">"),title:L.l.H("TutorialTitle_"+c,"<TutorialHeader_"+c+">")});return a};$i.prototype.Vm=function(){if(!0===Z.e.Za){var a=Math.round(Z.r.U.fe/Z.Ia),b=Cj(this);this.sd=Math.max(a-b,this.sd);0<this.sd&&(aj(this,this.sd),this.sd=0,0<a-b&&(Z.yb.ra=Z.ee))}};
bj.prototype.Ns=function(){this.ra--;0>=this.ra&&(Z.ee--,0>=Z.ee&&(Z.ee=L.a.k.k.Vx),this.ra=Z.ee,Z.U.sd++)};
bj.prototype.pa=function(){this.b.R(0,this.x,this.y+Z.gb,1*Z.Ia,1*Z.Ia,this.rotation,this.alpha);for(var a=Math.PI/3.5,b=45*Math.cos(a),a=45*Math.sin(a),c,d,f=0;f<this.ra;f++)c=this.x+this.a.V[1].x-f*b,d=this.y+this.a.V[1].y-f%2*a,ce.o(0,c,d);if(this.zj!==this.ra){b=this.Yb;a=Math.floor(1.2*W.$("8/8"));c=this.Yb.height;b.width=a;b.height=c;b.canvas.width=a;b.canvas.height=c;b.clear();w(this.Yb);try{1!==this.ra&&(this.Tg=W.fillColor);this.Yb.clear();var h=W.fillColor;W.setFillColor(this.Tg);W.o(this.ra+
"/"+Z.ee,this.Yb.width/2,this.Yb.height/2);W.setFillColor(h);this.zj=this.ra}finally{y(this.Yb)}}h=this.a.Vq;this.Yb.o(h.x+this.x-this.Yb.width/2,h.y+this.y-this.Yb.height/2)};e=Qi.prototype;e.Gt=function(){this.Za=!1;Z.ac=new $h({lives:!0});ki(Z.ac,1);var a=Mh();a||(a=0);ji(a);a=this.a.ts||11;Si(1);this.Za=!0;Z.Aa=L.Sc/a/2;Z.Ia=Z.Aa/(Yd.width/2);Z.background=new Zi;Z.U=new $i;aj(Z.U,L.a.k.U.$r);Z.ee=L.a.k.k.ra;Z.yb=new bj;Z.yb.qh();Z.yb.tk=!0;Z.yb.jx=Z.ee;this.Dk=new lg(Ti(),1E3,uc);this.Jg=0};
e.ot=function(){};e.qt=function(){};e.rt=function(){};e.pt=function(){return 0};e.zp=function(){};L.version=L.version||{};L.version.theme="1.1";L.version=L.version||{};L.version.configuration_poki_api="1.0.0";L.i=L.i||{};L.ni=!1;L.i.$i=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
L.i.nr=function(a,b,c,d){var f={};L.i.$i(a.ok,f);f.fontSize=M(18);d=L.d.g(a.mh,d.height,M(22));d=a.lh-d;var h=L.l.H("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,f,a.qk,a.mh,a.pk,M(22)),k=c(Ke,a.Ki,k-28),k=k+M(6),f={};L.i.$i(a.Mi,f);f.fontSize=M(18);k=b("CoolGames\nwww.coolgames.com",f,a.nh,k,a.ag,M(44));z(V.K(),f);k+=M(58)+Math.min(0,d-M(368));f={};L.i.$i(a.ok,f);f.fontSize=M(20);f.fillColor="#1A2B36";h=L.l.H("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,f,a.qk,
k,a.pk,M(22));k+=M(6);k=c(Le,a.Ki,k);k+=M(12);f={};L.i.$i(a.Mi,f);f.fontSize=M(18);f.fillColor="#1A2B36";k=b("Poki.com/company",f,a.nh,k,a.ag,M(22));k+=M(16);f={};L.i.$i(a.Mi,f);b("\u00a9 2020",f,a.nh,k,a.ag,M(44));return[]};L.i.qj=function(){return[]};L.i.Oc=function(){L.e.Oc()};
L.i.tl=function(){function a(){__flagPokiInitialized?(function(){function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){/*for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],l=0;l<b[a("0x6")];l++){var n=atob(b[l]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))*/})()}(),L.e.Oc(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=L.a.u.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};L.i.Il=function(a){PokiSDK.gameLoadingProgress({percentageDone:a/150})};L.i.Ih=function(){PokiSDK.gameLoadingFinished();L.e.Oc()};
L.i.Qj=function(a){if(L.ni)a&&a();else{L.ni=!0;try{L.e.zo(),rb("master"),PokiSDK.commercialBreak().then(function(){L.e.rj();sb("master");a&&a();L.ni=!1})["catch"](function(b){console.log("error"+b);L.e.rj();sb("master");a&&a();L.ni=!1})}catch(b){console.log("error"+b),L.e.rj(),a&&a(),L.ni=!1}}};L.i.nt=function(a){L.i.Qj(a)};L.i.xl=function(){L.i.Qj(function(){PokiSDK.gameplayStart()})};L.i.Se=function(){PokiSDK.gameplayStop();L.i.Qj(function(){L.e.Oc()})};
L.i.sA=function(){PokiSDK.happyTime(.5);PokiSDK.gameplayStop();L.i.Qj(function(){PokiSDK.gameplayStart()})};L.i.Fo=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};L.i.Jr=function(a,b){void 0===L.e.Xe&&(L.e.Xe=new hg(!0));ig(a,b)};L.i.Up=function(a){void 0===L.e.Xe&&(L.e.Xe=new hg(!0));jg(a)};L.i.Jd=function(a){window.open(a)};L.i.af=function(a){"inGame"===a&&PokiSDK.gameplayStop()};L.i.hv=function(a){"inGame"===a&&PokiSDK.gameplayStart()};L.i.hw=function(){};L=L||{};L.yq=L.yq||{};
L.yq.xz={Kz:""};
function Yj(){this.depth=-1E6;this.h=this.visible=!0;this.Sa=L.Pe;this.end=this.qa=this.Jo=this.Io=this.load=this.xc=!1;this.Vn=0;this.$p=this.ck=!1;this.state="GAME_INIT";this.screen=null;this.cp=this.lb=this.C=0;this.Wn=!1;this.Gl=this.Hl=!0;this.lx=1;this.Dd=!1;this.Zc={};this.sa={difficulty:1,playMusic:!0,playSFX:!0,language:L.l.po()};window.addEventListener("gameSetPause",this.zo,!1);window.addEventListener("gameResume",this.rj,!1);document.addEventListener("visibilitychange",this.Yv,!1);this.Rf=
"timedLevelEvent"}e=Yj.prototype;e.zo=function(){F.pause("master");H.pause()};e.rj=function(){F.Oj("master");Cb(H);Hb(H);Lb(H);H.Oj()};e.Yv=function(){document.hidden?L.e.zo():L.e.rj()};
e.of=function(){var a,b=this;void 0!==L.a.T.background&&void 0!==L.a.T.background.color&&(document.body.style.background=L.a.T.background.color);L.Ga=new qg;L.w.wl&&L.w.wl.h&&(b.pu=Lh(function(a){b.pu=a}));L.n=L.a.k.ug||{};L.n.ae=L.n.ae||"level";L.n.Wh=void 0!==L.n.Wh?L.n.Wh:"level"===L.n.ae;L.n.ma=void 0!==L.n.ma?L.n.ma instanceof Array?L.n.ma:[L.n.ma]:[20];L.n.bj=void 0!==L.n.bj?L.n.bj:"locked";L.n.vm=void 0!==L.n.vm?L.n.vm:"difficulty"===L.n.ae;L.n.ki=void 0!==L.n.ki?L.n.ki:!1;L.n.Bp=void 0!==
L.n.Bp?L.n.Bp:"level"===L.n.ae;L.n.Ah=void 0!==L.n.Ah?L.n.Ah:"max";L.n.yp=void 0!==L.n.yp?L.n.yp:"number";L.i.Jr(null,function(a){var d,f,h;a&&(b.Zc=a);b.sa=sg("preferences",{});b.sa.difficulty=void 0!==b.sa.difficulty?b.sa.difficulty:1;void 0!==L.n.Qt&&0>L.n.Qt.indexOf(Hg())&&(b.sa.difficulty=L.n.Qt[0]);b.sa.playMusic=void 0!==b.sa.playMusic?b.sa.playMusic:!0;b.Ig(b.sa.playMusic);b.sa.playSFX=void 0!==b.sa.playSFX?b.sa.playSFX:!0;b.hm(b.sa.playSFX);b.sa.language=void 0!==b.sa.language&&L.l.jw(b.sa.language)?
b.sa.language:L.l.po();L.l.it(b.sa.language);void 0===Qg(b.C,0,"state",void 0)&&Zj(b.C,0,"state","unlocked");if(L.n.Wh)if("locked"===L.n.bj)for(h=!1,d=0;d<L.n.ma.length;d++){for(a=0;a<L.n.ma[d];a++)if(f=Qg(d,a,"state","locked"),"locked"===f){b.C=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.sa.lastPlayed&&(b.C=b.sa.lastPlayed.world||0)});b.ji=ak();void 0!==b.ji.authToken&&void 0!==b.ji.challengeId&&(b.Dd=!0);L.w.pC&&(this.kc=this.lC?new TestBackendServiceProvider:new BackendServiceProvider,
this.kc.bs(function(a){a&&L.e.kc.zA(b.ji.authToken)}));a=parseFloat(da.q.version);F.bb&&(da.Ya.aq&&da.q.Tl||da.q.di&&a&&4.4>a)&&(F.mk=1);this.xc=!0;this.zl=0};function ak(){var a,b,c,d,f;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,f=a.length;d<f;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function bk(a){a.state="GAME_LOAD";a.screen=new Bg(function(){L.e.load=!0;ck(L.e,!0);L.Bd.Ih();L.i.Ih()},function(a){L.Bd.Il(a);L.i.Il(a)},L.w.ZB)}
function ck(a,b){a.ck=b||!1;a.$p=!0;a.Vn++}
function dk(){var a=L.e;a.Vn--;switch(a.state){case "GAME_INIT":a.xc&&!a.rC&&(a.Dd&&a.kc&&a.kc.aC(a.ji.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Ap&&a.screen.Ap("challengeLoadingError_notValid")}),bk(a));break;case "GAME_LOAD":if(a.load){if(a.Dd&&a.kc)if(a.kc.iw())Fg(a),Ig(a.bd.mode);else{a.screen.Ap("challengeLoadingError_notStarted");break}J(H,a.screen);"function"===typeof Mj&&(L.k=new Mj);void 0!==L.w.Jq&&!1!==L.w.Jq.show&&L.d.Ou();a.kh()}break;case "LEVEL_INIT":a.Io&&
fk(a);break;case "LEVEL_LOAD":a.Jo&&gk(a);break;case "LEVEL_END":if(a.qa)switch(Ah(),L.e.Io=!1,L.e.Jo=!1,L.r=void 0,L.d.xg(L.yf).Z=!0,L.d.xg(L.ol).Z=!0,L.e.is){case "retry":Yg(L.e,L.e.lb);break;case "next":L.n.Wh?L.e.lb+1<L.n.ma[L.e.C]?Yg(L.e,L.e.lb+1):L.e.C+1<L.n.ma.length?Yg(L.e,0,L.e.C+1):L.n.Bp?(L.e.state="GAME_END",L.e.end=!0,ck(L.e,!1),L.i.Tv()):L.e.screen=new Og:Yg(L.e,0);break;case "exit":L.n.Wh?L.e.screen=new Og:L.e.kh()}break;case "GAME_END":a.end&&(a.end=!1,L.e.screen=null,L.e.screen=new Dh)}}
e.Oc=function(){L.e.$p=!1};function vh(){var a;if(void 0!==L.e.ji.more_games)try{return a=decodeURIComponent(L.e.ji.more_games),function(){L.i.Jd(a)}}catch(b){}if("string"===typeof L.Th.moreGamesUrl&&""!==L.Th.moreGamesUrl)return function(){L.i.Jd(L.Th.moreGamesUrl)};if(void 0!==L.w.dx)return function(){L.i.Jd(L.w.dx)};if("function"===typeof L.i.Wv)return L.i.Wv}function Fg(a){if(a.Dd&&void 0!==a.kc)return void 0===a.bd&&(a.bd=a.kc.oA()),a.bd}e.kj=function(a){L.e.Dd&&L.e.kc&&L.e.kc.kj(a)};
e.Vi=function(a){L.e.Dd&&L.e.kc&&L.e.kc.Vi(a)};function Hg(){return L.e.sa.difficulty}function zh(){switch(Hg()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+Hg();}}function fi(){var a="optionsDifficulty_"+zh();return L.l.H(a,"<"+a+">")}function Ig(a){L.e.sa.difficulty=a;ug("preferences",L.e.sa)}e.Ig=function(a){void 0!==a&&(L.e.sa.playMusic=a,ug("preferences",L.e.sa),a?sb("music"):rb("music"));return L.e.sa.playMusic};
e.hm=function(a){void 0!==a&&(L.e.sa.playSFX=a,ug("preferences",L.e.sa),a?(sb("game"),sb("sfx")):(rb("game"),rb("sfx")));return L.e.sa.playSFX};e.language=function(a){void 0!==a&&(L.e.sa.language=a,ug("preferences",L.e.sa));return L.e.sa.language};function Zj(a,b,c,d){var f="game";"game"!==f&&(f="tg");void 0===L.e.Zc["level_"+a+"_"+b]&&(L.e.Zc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?L.e.Zc["level_"+a+"_"+b][f]=d:L.e.Zc["level_"+a+"_"+b][f][c]=d;L.i.Up(L.e.Zc)}
function Qg(a,b,c,d){var f="game";"game"!==f&&(f="tg");a=L.e.Zc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[f]:a[f][c],void 0!==a)?a:d}function sg(a,b){var c,d;"game"!==c&&(c="tg");d=L.e.Zc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function ug(a,b){var c;"game"!==c&&(c="tg");void 0===L.e.Zc.game&&(L.e.Zc.game={tg:{},game:{}});void 0===a?L.e.Zc.game[c]=b:L.e.Zc.game[c][a]=b;L.i.Up(L.e.Zc)}
function Xg(a,b,c){var d=L.e;void 0===b&&(b=d.lb);void 0===c&&(c=d.C);return void 0===a?Qg(c,b,"stats",{}):Qg(c,b,"stats",{})[a]}function Mh(){var a=Xg("highScore",void 0,void 0);return"number"!==typeof a?0:a}function hk(){var a,b,c,d=0;for(a=0;a<L.n.ma.length;a++)for(b=0;b<L.n.ma[a];b++)c=Xg(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}
function Lg(a){var b,c,d;void 0===L.e.yc&&(void 0!==L.a.T.yc&&(void 0!==L.a.T.yc.Zu&&(b=L.a.T.yc.Zu),void 0!==L.a.T.yc.Fq&&(F.he("music",L.a.T.yc.Fq),a.Ig()||rb("music"),L.e.lx=L.a.T.yc.Fq),c=void 0!==L.a.T.yc.Wu?L.a.T.yc.Wu:0,d=void 0!==L.a.T.yc.Si?L.a.T.yc.Si:0),void 0===b&&"undefined"!==typeof a_music&&(b=a_music),void 0!==b&&(L.e.yc=F.play(b,c,d),L.e.yc&&(F.xq(L.e.yc,"music"),F.jt(L.e.yc,!0))));0!==a.cp&&L.i.Eo();L.n.Wh&&!a.Dd?a.screen=new Og:Yg(a,0)}
e.kh=function(){this.screen&&J(H,this.screen);this.screen=new Eg;this.lb=-1;L.i.yl()};
function pi(a,b,c,d){var f;f=void 0!==L.a.T.xj&&void 0!==L.a.T.xj.backgroundImage?L.a.T.xj.backgroundImage:void 0!==L.a.u.xj?L.a.u.xj.backgroundImage:void 0;L.d.ia(L.vg);a=a||0;b=b||0;c=c||m.width;d=d||m.height;if(f)if(c=Math.min(Math.min(c,m.width),f.Yi),d=Math.min(Math.min(d,m.height),f.zh),void 0!==f){var h=a,k=b-L.Hq,l,n,q;for(l=0;l<f.F;l+=1)n=l%f.Qh*f.width,q=f.height*Math.floor(l/f.Qh),n>h+c||n+f.width<h||q>k+d||q+f.height<k||f.Ea(l,h-n,k-q,c,d,a,b,1)}else sa(a,b,c,d,"white",!1)}
function Yg(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.C=c);a.lb=b;a.Io=!0;ck(a,!1);L.i.Uv()}function fk(a){a.state="LEVEL_LOAD";a.Jo=!0;ck(a,!1);L.i.Vv()}
function gk(a){var b;if(a.C<L.n.ma.length&&a.lb<L.n.ma[a.C]){a.state="LEVEL_PLAY";a.cp+=1;a.qa=!1;a.screen=null;pi(0,L.Hq);b=L.Ga;var c=yh(a,3),d="progression:levelStarted:"+zh(),f=a.Rf,h;for(h=0;h<b.ja.length;h++)if(!b.ja[h].h){b.ja[h].m=0;b.ja[h].paused=0;b.ja[h].h=!0;b.ja[h].Av=c;b.ja[h].vx=d;b.ja[h].tag=f;break}h===b.ja.length&&b.ja.push({h:!0,m:0,paused:0,Av:c,vx:d,tag:f});b.$a(c,d,void 0,L.la.Bc.iq);b.$a("Start:","progression:levelStart:"+c,void 0,L.la.Bc.mi);for(b=0;b<a.C;b++);L.i.xl(a.C,a.lb);
a.sa.lastPlayed={world:a.C,level:a.lb};L.r=new Qi}}function Rg(a,b,c){var d=0;void 0===b&&(b=a.C);void 0===c&&(c=a.lb);for(a=0;a<b;a++)d+=L.n.ma[a];return d+c}function Yi(a,b){var c=Mi("bs_start","Bubbleshooter!"),d=Mi("bs_shootallbubbles","Shoot all the bubbles...!");new Eh(c,d,a,b)}function yh(a,b){var c,d=a.lb+"",f=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<f;c++)d="0"+d;return d}
e.ks=function(a){function b(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===L.n.Ah&&a>b||"min"===L.n.Ah&&a<b?!0:!1}this.state="LEVEL_END";var c,d,f,h,k,l,n={},q=yh(this,3);a=a||{};a.level=L.n.ki?this.lb+1:Rg(this)+1;a.Do=!1;d=(c=Qg(this.C,this.lb,"stats",void 0))||{};if(void 0!==a.Ic||void 0!==a.ab){void 0!==a.Ic&&(n[a.Ic.id]=a.Ic.K(),"highScore"===a.Ic.id&&(l=a.Ic));if(void 0!==a.ab)for(h=0;h<a.ab.length;h++)n[a.ab[h].id]=a.ab[h].K(),"highScore"===a.ab[h].id&&(l=a.ab[h]);for(h in n)k=
n[h],void 0!==k.ne&&(n[k.$h].uc=k.ne(n[k.$h].uc));void 0!==n.totalScore&&(f=n.totalScore.uc)}else f=a.totalScore,void 0!==f&&void 0!==a.timeBonus&&(f+=a.timeBonus);h="";if(!0!==a.failed){h="Complete:";if(void 0!==f){L.Ga.$a(h,"level:"+q,f,L.la.Bc.mi);if(void 0===c||b(f,c.highScore))d.highScore=f,a.Do=!0,L.Ga.$a("highScore",":score:"+zh()+":"+q,f,L.la.Bc.Zm);void 0!==l&&(l.uc=d.highScore);a.highScore=d.highScore}if(void 0!==a.stars){if(void 0===d.stars||d.stars<a.stars)d.stars=a.stars;L.Ga.$a("stars",
":score:"+zh()+":"+q,a.stars,L.la.Bc.Zm)}this.lb+1<L.n.ma[this.C]?"locked"===Qg(this.C,this.lb+1,"state","locked")&&Zj(this.C,this.lb+1,"state","unlocked"):this.C+1<L.n.ma.length&&"locked"===Qg(this.C+1,0,"state","locked")&&Zj(this.C+1,0,"state","unlocked");Zj(this.C,this.lb,void 0,{stats:d,state:"played"});void 0!==this.kc&&(c=L.k&&L.k.Ov?L.k.Ov():hk(),void 0!==c&&this.kc.jC(c,L.n.yp));wg(L.Ga,this.Rf,q,"progression:levelCompleted:"+zh())}else L.Ga.$a("Fail:","level:"+q,f,L.la.Bc.mi),wg(L.Ga,this.Rf,
q,"progression:levelFailed:"+zh());var u={totalScore:f,level:a.level,highScore:a.highScore,failed:!0===a.failed,stars:a.stars,stage:a.stage};f=function(a){L.e.qa=!0;L.e.is=a;ck(L.e,!0);L.i.Se(u);L.Bd.Se(u)};L.i.On&&L.i.On();void 0===a.customEnd&&new Zg(L.n.ae,a,f)};e.Rj=function(){L.e.af(!0)};
e.af=function(a,b,c){var d="inGame";L.e.screen instanceof Eg?d="startScreen":L.e.screen instanceof Og?d="levelMapScreen":b&&(d=L.e.bd.er===L.e.bd.Cn?"inGame_challenger":"inGame_challengee");L.e.ue||(L.e.ue=new sh(d,!0===a,b,c))};
function ui(a){var b=[],c,d,f,h,k;L.e.ue||L.e.qf||(L.e.bd.er===L.e.bd.Cn?(c=L.l.H("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",f="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=L.l.H(b,"<"+b.toUpperCase()+"<");L.e.qf&&Ih(b);a&&lh()},h=function(){L.e.Vi(k);return!0}):(c=L.l.H("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",f="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=L.l.H(b,"<"+b.toUpperCase()+"<");if(L.e.qf&&(Ih(b),a)){var b=L.l.H("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",L.e.bd.jB[L.e.bd.Cn]),b=b.replace("<AMOUNT>",L.e.bd.qC),c=L.e.qf,d,f,h,k;d=V.K();c.a.Mt&&z(d,c.a.Mt);f=Wa(d,b,c.a.Mx,c.a.Lx,!0);f<d.fontSize&&A(d,f);f=d.$(b,c.a.qp)+10;h=d.W(b,c.a.pp)+10;k=L.d.Da(c.a.Nx,c.f.b.width,f,d.align);h=L.d.Da(c.a.Ox,c.f.b.height-Hh(c),h,d.j);w(c.f.b);d.o(b,k,
h,f);y(c.f.b)}a&&lh()},h=function(){L.e.kj(k);return!0}),b.push({S:d,da:h,wa:L.e}),b.push({S:f,da:function(){L.e.qf.close();L.e.qf=null;return!0}}),L.e.qf=new Gh(c,b,a),L.e.ue=L.e.qf)}e.mp=function(){var a,b;b=Tb(H,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].Ao&&b[a].Ao();xg();Ub("game");Mb()};function lh(a){var b,c;c=Tb(H);for(b=0;b<c.length;b++)"function"===typeof c[b].Ao&&c[b].Ao();Ub();Mb();xg();a&&(a.N=Math.max(0,a.N-1));Vb("system")}
function rh(){var a,b;b=Tb(H);for(a=0;a<b.length;a++)"function"===typeof b[a].Xv&&b[a].Xv();Vb();a=H;for(b=0;b<a.jc.length;b+=1)a.jc[b].paused=Math.max(0,a.jc[b].paused-1);a=L.Ga;b=L.e.Rf;var c;for(c=0;c<a.ja.length;c++)void 0!==a.ja[c]&&a.ja[c].tag===b&&(a.ja[c].paused-=1,a.ja[c].paused=Math.max(a.ja[c].paused,0))}function Ah(){var a;L.r&&J(H,L.r);for(a=Tb(H,"LevelStartDialog");0<a.length;)J(H,a.pop())}
function Bh(){var a=L.e;a.state="LEVEL_END";wg(L.Ga,L.e.Rf,yh(L.e),"progression:levelRestart:"+zh());a=L.n.ki?a.lb+1:Rg(a)+1;L.e.qa=!0;L.e.is="retry";ck(L.e,!0);a={failed:!0,level:a,restart:!0};L.i.Se(a);L.Bd.Se(a);L.i.Eo()}function vg(){var a="";L.version.builder&&(a=L.version.builder);L.version.tg&&(a+="-"+L.version.tg);L.version.game&&(a+="-"+L.version.game);L.version.config&&(a+="-"+L.version.config);return a}e.bc=function(){this.xc||(this.of(),ck(L.e,!0),L.Bd.tl(),L.i.tl())};
e.X=function(a){"function"===typeof this.Fr&&(this.Fr(),this.Fr||L.e.Oc());0<this.Vn&&(this.ck||this.$p||dk());700>this.zl&&(this.zl+=a,700<=this.zl&&(L.w.oC&&void 0!==L.w.lj&&L.w.lj.kl&&L.w.lj.tm&&L.Ga.start([L.w.lj.kl,L.w.lj.tm]),void 0===Qg(this.C,0,"state",void 0)&&Zj(this.C,0,"state","unlocked")))};e.Tc=function(a,b){"languageSet"===a&&L.e.language(b)};e.Re=function(){var a,b;for(a=0;a<L.Wd.length;a++)b=L.Wd[a],b.Z&&(m.ia(b),m.clear())};
e.pa=function(){var a;for(a=0;a<L.Wd.length;a++)L.Wd[a].Z=!1};L.wy=function(){L.e=new Yj;I(L.e);Sb(L.e,"system")};(void 0===L.Tu||L.Tu)&&L.i.Sv();L.a.u.options.buttons={startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames","about","restart"]};L.a.T.qa.xk=9999;
Yj.prototype.kh=function(){this.screen&&(J(H,this.screen),m.clear());this.lb=-1;L.i.yl();Lg(this)};
Yj.prototype.ks=function(a){this.state="LEVEL_END";var b,c,d,f={},h=yh(this,3);a=a||{};a.level=L.n.ki?this.lb+1:Rg(this)+1;a.Do=!1;if(void 0!==a.Ic||void 0!==a.ab){void 0!==a.Ic&&(f[a.Ic.id]=a.Ic.K());if(void 0!==a.ab)for(c=0;c<a.ab.length;c++)f[a.ab[c].id]=a.ab[c].K();for(c in f)d=f[c],void 0!==d.ne&&(f[d.$h].uc=d.ne(f[d.$h].uc));void 0!==f.totalScore&&(b=f.totalScore.uc)}else b=a.totalScore,void 0!==b&&void 0!==a.timeBonus&&(b+=a.timeBonus);L.Ga.$a("Fail:","level:"+h,b,L.la.Bc.mi);wg(L.Ga,this.Rf,
h,"progression:levelFailed:"+zh());a={totalScore:b,level:a.level,highScore:a.highScore,failed:!0===a.failed,stars:a.stars,stage:a.stage};L.i.Fo(a);L.i.Se(a);L.Bd.Se(a);L.e.qa=!0;ck(L.e,!0);Bh()};L.i.Se=function(){PokiSDK.gameplayStop()};L.i.Eo=function(){L.i.Qj(function(){L.e.Oc()})};
(function(){function a(a,b){return function(){a&&a.apply(this);b()}}var b=L.i,c,d="landscape"===L.orientation;b.Ih=a(b.Ih,function(){var a=window.Booster;a&&a.AdBanner&&(c=new a.AdBanner({}),d||c.show())});d&&(b.yl=a(b.yl,function(){c&&c.hide()}),b.xl=a(b.xl,function(){c&&c.show()}))})();
Yj.prototype.af=function(a,b,c){var d="inGame";L.e.screen instanceof Eg?d="startScreen":L.e.screen instanceof Og?d="levelMapScreen":b&&(d=L.e.bd.er===L.e.bd.Cn?"inGame_challenger":"inGame_challengee");L.i.af(d);L.e.ue||(L.e.ue=new sh(d,!0===a,b,c))};sh.prototype.close=function(){J(H,this);this.canvas.Z=!0;L.i.hv(this.type);return!0};
$a.prototype.he=function(a,b){var c,d,f,h=1,k=eb(this,a);this.fb[a]=b;this.Mc[a]&&delete this.Mc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.ya.indexOf(a)){for(f=0;f<d.ya.length;f+=1)void 0!==this.fb[d.ya[f]]&&(h*=this.fb[d.ya[f]]);h=Math.round(100*h)/100;if(this.sb){if(d=this.qe[d.id])d.gain.value=h}else this.bb&&(d.G.volume=h)}this.sb&&(d=this.qe[a])&&(d.gain.value=b)};
}());
