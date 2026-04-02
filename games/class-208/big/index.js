// Copyright (c) 2013-2016 CoolGames

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
var e,ba=document.getElementById("canvasBackground"),ca="big game_template gameui_level levelselectscreen endscreen_level theme_swamp landscape final poki_api".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var l=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.D={};this.mb={};this.gg={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.D.opera=!0,this.D.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.mb.kq=!0,this.D.Wl=!0,this.D.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.D.Wl=!0,this.D.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/Edge/i.test(this.userAgent)?(this.name="Microsoft Edge",this.D.yA=!0,this.D.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.D.chrome=!0,this.D.version=f(this,
/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.D.version=c)):/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.D.iC=!0,this.D.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.D.xC=!0,this.D.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.D.Fr=!0,this.D.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),
/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.mb.IA=!0)):/silk/i.test(this.userAgent)?(this.name="Amazon Silk",this.D.pt=!0,this.D.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.D.Wh=!0,this.D.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.D.OB=!0,this.D.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.D.Yq=!0,this.D.version=c||
f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.D.tu=!0,this.D.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.gg.PC=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.D.Wq=!0,this.D.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.D.Fz=!0,this.D.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name=
"Safari",this.D.yp=!0,this.D.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",this.D.UC=!0,!this.D.version&&c&&(this.D.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.D.OA=!0,this.D.version=this.D.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.pt?this.mb.Qz=!0:a&&(this.mb.Fl=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.kq?c=f(this,
/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.tu?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.Yq?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):this.Wq?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.Fz&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.mb.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.pt)this.gg.Qt=!0;else if(g||"iphone"==a||"ipod"==a||b||this.Yq||this.tu||this.Wq)this.gg.Ss=!0;this.of={Bi:!1,Pi:!1,x:!1};this.Wl&&10<=this.D.version||this.chrome&&20<=this.D.version||
this.Fr&&20<=this.D.version||this.yp&&6<=this.D.version||this.opera&&10<=this.D.version||this.Fl&&this.mb.version&&6<=this.mb.version.split(".")[0]?this.of.Bi=!0:this.Wl&&10>this.D.version||this.chrome&&20>this.D.version||this.Fr&&20>this.D.version||this.yp&&6>this.D.version||this.opera&&10>this.D.version||this.Fl&&this.mb.version&&6>this.mb.version.split(".")[0]?this.of.Pi=!0:this.of.x=!0;try{this.D.Ze=this.D.version?parseFloat(this.D.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.D.Ze=0}try{this.mb.Ze=
this.mb.version?parseFloat(this.mb.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.mb.Ze=0}};function da(a,b){this.x=a;this.y=b}e=da.prototype;e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.direction=function(){return 180*Math.atan2(-this.y,this.x)/Math.PI};e.ea=function(){return new da(this.x,this.y)};e.add=function(a){return new da(this.x+a.x,this.y+a.y)};e.scale=function(a){return new da(a*this.x,a*this.y)};
e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new da(a*this.x+b*this.y,-b*this.x+a*this.y)};e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new da(0,0):new da(this.x/a,this.y/a)};function ea(a){return(new da(a.y,-a.x)).normalize()}
e.Lc=function(a,b,c){var d=Math.min(8,this.length()/4),g;g=this.normalize().scale(2*d);g=new da(this.x-g.x,this.y-g.y);var h=g.add(ea(this).scale(d)),d=g.add(ea(this).scale(-d)),k=p.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};function fa(a){this.Bj=4294967296;this.Bi=1664525;this.Pi=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.Bj-1)):a}
fa.prototype.ea=function(){var a=new fa;a.Bj=this.Bj;a.Bi=this.Bi;a.Pi=this.Pi;a.state=this.state;return a};fa.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.Bi*this.state+this.Pi)%this.Bj;return this.state/this.Bj*b};new fa;function ga(){this.af="";this.jn=[];this.Ai=[];this.Qf=[];this.Xg=[];this.gd=[];this.zb("start");this.zb("load");this.zb("game")}function ha(a){var b=ia;b.af=a;""!==b.af&&"/"!==b.af[b.af.length-1]&&(b.af+="/")}e=ga.prototype;
e.zb=function(a){this.gd[a]||(this.Ai[a]=0,this.Qf[a]=0,this.Xg[a]=0,this.gd[a]=[],this.jn[a]=!1)};e.loaded=function(a){return this.gd[a]?this.Qf[a]:0};e.rd=function(a){return this.gd[a]?this.Xg[a]:0};e.complete=function(a){return this.gd[a]?this.Qf[a]+this.Xg[a]===this.Ai[a]:!0};function ja(a){var b=ia;return b.gd[a]?100*(b.Qf[a]+b.Xg[a])/b.Ai[a]:100}function la(a){var b=ia;b.Qf[a]+=1;b.complete(a)&&ma("Load Complete",{Cb:a})}function na(a){var b=ia;b.Xg[a]+=1;ma("Load Failed",{Cb:a})}
function oa(a,b,c){var d=ia;d.gd[b]||d.zb(b);d.gd[b].push(a);d.Ai[b]+=c}e.me=function(a){var b;if(!this.jn[a])if(this.jn[a]=!0,this.gd[a]&&0!==this.gd[a].length)for(b=0;b<this.gd[a].length;b+=1)this.gd[a][b].me(a,this.af);else ma("Load Complete",{Cb:a})};var ia=new ga;function pa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.Ub(a)}pa.prototype.Ub=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};
pa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function qa(a,b,c,d,g,h){var k=p;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ra(a,b,c,d,g){a.context.save();a.context.beginPath();a.context.arc(b,c,d,0,2*Math.PI,!1);a.context.closePath();void 0!==g&&(a.context.fillStyle=g,a.context.fill());a.context.restore()}function sa(a,b,c,d,g,h){var k=p;k.context.save();k.context.beginPath();k.context.moveTo(a,b);k.context.lineTo(c,d);h&&(k.context.lineWidth=h);k.context.strokeStyle=g;k.context.stroke();k.context.restore()}
pa.prototype.Qc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};pa.prototype.ya=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var p=new pa(ba);function ta(a,b,c){this.name=a;this.S=b;this.$w=c;this.jd=[];this.Tn=[];oa(this,this.$w,this.S)}ta.prototype.me=function(a,b){function c(){na(a)}function d(){la(a)}var g,h;for(g=0;g<this.jd.length;g+=1)h=this.Tn[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.jd[g].src=h,this.jd[g].addEventListener("load",d,!1),this.jd[g].addEventListener("error",c,!1)};
ta.prototype.complete=function(){var a;for(a=0;a<this.jd.length;a+=1)if(!this.jd[a].complete||0===this.jd[a].width)return!1;return!0};function ua(a,b,c){0<=b&&b<a.S&&(a.jd[b]=new Image,a.Tn[b]=c)}ta.prototype.b=function(a,b){0<=a&&a<this.S&&(this.jd[a]=b,this.Tn[a]="")};ta.prototype.Na=function(a,b,c,d,g,h,k,m,n){this.jd[a]&&this.jd[a].complete&&(void 0===m&&(m=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(m)&&0!==Math.round(n)&&p.context.drawImage(this.jd[a],b,c,d,g,h,k,m,n))};
function q(a,b,c,d,g,h,k,m,n,r){this.name=a;this.Hf=b;this.S=c;this.width=d;this.height=g;this.hc=h;this.ic=k;this.Si=m;this.ph=n;this.Jh=r;this.Ef=[];this.Ff=[];this.Gf=[];this.Te=[];this.Se=[];this.Ue=[];this.Ve=[]}e=q.prototype;e.b=function(a,b,c,d,g,h,k,m){0<=a&&a<this.S&&(this.Ef[a]=b,this.Ff[a]=c,this.Gf[a]=d,this.Te[a]=g,this.Se[a]=h,this.Ue[a]=k,this.Ve[a]=m)};e.complete=function(){return this.Hf.complete()};
e.A=function(a,b,c){a=(Math.round(a)%this.S+this.S)%this.S;this.Hf.Na(this.Ef[a],this.Ff[a],this.Gf[a],this.Te[a],this.Se[a],b-this.hc+this.Ue[a],c-this.ic+this.Ve[a])};e.de=function(a,b,c,d){var g=p.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.S+this.S)%this.S;this.Hf.Na(this.Ef[a],this.Ff[a],this.Gf[a],this.Te[a],this.Se[a],b-this.hc+this.Ue[a],c-this.ic+this.Ve[a]);g.globalAlpha=h};
e.Da=function(a,b,c,d,g,h,k){var m=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.S+this.S)%this.S,m.save(),m.translate(b,c),m.rotate(-h*Math.PI/180),m.scale(d,g),m.globalAlpha=k,this.Hf.Na(this.Ef[a],this.Ff[a],this.Gf[a],this.Te[a],this.Se[a],this.Ue[a]-this.hc,this.Ve[a]-this.ic),m.restore())};
e.Na=function(a,b,c,d,g,h,k,m){var n=p.context,r=n.globalAlpha,v,z,I,t;a=(Math.round(a)%this.S+this.S)%this.S;v=this.Ue[a];z=this.Ve[a];I=this.Te[a];t=this.Se[a];b-=v;c-=z;0>=b+d||0>=c+g||b>=I||c>=t||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>I&&(d=I-b),c+g>t&&(g=t-c),n.globalAlpha=m,this.Hf.Na(this.Ef[a],this.Ff[a]+b,this.Gf[a]+c,d,g,h,k),n.globalAlpha=r)};
e.On=function(a,b,c,d,g,h,k,m,n,r,v,z){var I,t,u,w,x,R,ka,Y,aa,Ma;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),I=Math.ceil((r-b)/h),t=Math.ceil((v-c)/k),b+=m,c+=n,aa=0;aa<I;aa+=1)for(Ma=0;Ma<t;Ma+=1)x=d,R=g,ka=h,Y=k,u=b+aa*h,w=c+Ma*k,u<m&&(x+=m-u,ka-=m-u,u=m),u+ka>=m+r&&(ka=m+r-u),w<n&&(R+=n-w,Y-=n-w,w=n),w+Y>=n+v&&(Y=n+v-w),0<ka&&0<Y&&this.Na(a,x,R,ka,Y,u,w,z)};e.$k=function(a,b,c,d,g,h,k,m,n,r){this.On(a,0,0,b,c,d,g,h,k,m,n,r)};
e.Zk=function(a,b,c,d,g,h,k,m,n,r){var v=p.context,z=v.globalAlpha,I,t,u,w,x,R;a=(Math.round(a)%this.S+this.S)%this.S;I=m/d;t=n/g;u=this.Ue[a];w=this.Ve[a];x=this.Te[a];R=this.Se[a];b-=u;c-=w;0>=b+d||0>=c+g||b>=x||c>=R||(0>b&&(d+=b,m+=I*b,h-=I*b,b=0),0>c&&(g+=c,n+=t*c,k-=t*c,c=0),b+d>x&&(m-=I*(d-x+b),d=x-b),c+g>R&&(n-=t*(g-R+c),g=R-c),v.globalAlpha=r,this.Hf.Na(this.Ef[a],this.Ff[a]+b,this.Gf[a]+c,d,g,h,k,m,n),v.globalAlpha=z)};
function va(a,b,c){var d,g,h;for(d=0;d<a.S;d+=1)g=b+d%a.Jh*a.width,h=c+a.height*Math.floor(d/a.Jh),a.Hf.Na(a.Ef[d],a.Ff[d],a.Gf[d],a.Te[d],a.Se[d],g-a.hc+a.Ue[d],h-a.ic+a.Ve[d])}function s(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.ic=this.hc=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.Xl=void 0}e=s.prototype;
e.ea=function(){var a=new s(this.width,this.height);a.hc=this.hc;a.ic=this.ic;y(a);this.A(0,0);A(a);return a};function y(a){a.Xl=p.canvas;p.Ub(a.canvas)}function A(a){p.canvas===a.canvas&&void 0!==a.Xl&&(p.Ub(a.Xl),a.Xl=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.A=function(a,b){p.context.drawImage(this.canvas,a-this.hc,b-this.ic)};
e.de=function(a,b,c){var d=p.context,g=d.globalAlpha;d.globalAlpha=c;p.context.drawImage(this.canvas,a-this.hc,b-this.ic);d.globalAlpha=g};e.Da=function(a,b,c,d,g,h){var k=p.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,p.context.drawImage(this.canvas,-this.hc,-this.ic),k.restore())};
e.Na=function(a,b,c,d,g,h,k){var m=p.context,n=m.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),m.globalAlpha=k,p.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),m.globalAlpha=n)};
e.On=function(a,b,c,d,g,h,k,m,n,r,v){var z,I,t,u,w,x,R,ka,Y,aa;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),z=Math.ceil((n-a)/g),I=Math.ceil((r-b)/h),a+=k,b+=m,Y=0;Y<z;Y+=1)for(aa=0;aa<I;aa+=1)w=c,x=d,R=g,ka=h,t=a+Y*g,u=b+aa*h,t<k&&(w+=k-t,R-=k-t,t=k),t+R>=k+n&&(R=k+n-t),u<m&&(x+=m-u,ka-=m-u,u=m),u+ka>=m+r&&(ka=m+r-u),0<R&&0<ka&&this.Na(w,x,R,ka,t,u,v)};
e.$k=function(a,b,c,d,g,h,k,m,n){this.On(0,0,a,b,c,d,g,h,k,m,n)};e.Zk=function(a,b,c,d,g,h,k,m,n){var r=p.context,v=r.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(m)&&(r.globalAlpha=n,p.context.drawImage(this.canvas,a,b,c,d,g,h,k,m),r.globalAlpha=v))};
function wa(a,b,c,d){this.K=a;this.Mz=b;this.Iz=c;this.lk=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.Lt=!1;oa(this,d,1)}function xa(a,b,c){p.context.save();p.context.font="250pt "+a+", "+b;a=p.context.measureText(c).width;p.context.restore();return a}
function ya(a){var b,c,d;for(b=0;b<a.lk.length;b+=1)if(c=a.lk[b],d=xa(a.K,c.font,c.text),c.width!==d){la(a.Zw);document.body.removeChild(a.$e);a.Lt=!0;return}window.setTimeout(function(){ya(a)},33)}
wa.prototype.me=function(a,b){var c="@font-face {font-family: "+this.K+";src: url('"+b+this.Mz+"') format('woff'), url('"+b+this.Iz+"') format('truetype');}",d=document.createElement("style");d.id=this.K+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.$e=document.createElement("span");this.$e.style.position="absolute";this.$e.style.left="-9999px";this.$e.style.top="-9999px";this.$e.style.visibility=
"hidden";this.$e.style.fontSize="250pt";this.$e.id=this.K+"_loader";document.body.appendChild(this.$e);for(c=0;c<this.lk.length;c+=1)d=this.lk[c],d.width=xa(d.font,d.font,d.text);this.Zw=a;ya(this)};wa.prototype.complete=function(){return this.Lt};
function za(a,b){this.K=a;this.bj=b;this.fontWeight=this.fontStyle="";this.Bc="normal";this.fontSize=12;this.fill=!0;this.hg=1;this.sd=0;this.fillColor="black";this.Od={g:void 0,gc:0,vp:!0,wp:!0};this.Bb={bk:!0,S:3,Nk:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.Ng=1;this.Xh=0;this.strokeColor="black";this.strokeStyle=void 0;this.pa=1;this.Za=!1;this.gb="miter";this.la={p:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.l="top";
this.Ia=this.fb=0}e=za.prototype;
e.ea=function(){var a=new za(this.K,this.bj);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.Bc=this.Bc;a.fontSize=this.fontSize;a.fill=this.fill;a.hg=this.hg;a.sd=this.sd;a.fillColor=this.fillColor;a.Od={g:this.Od.g,vp:this.Od.vp,wp:this.Od.wp};a.Bb={bk:this.Bb.bk,S:this.Bb.S,Nk:this.Bb.Nk.slice(0),size:this.Bb.size,offset:this.Bb.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.Ng=this.Ng;a.Xh=this.Xh;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.pa=this.pa;
a.Za=this.Za;a.gb=this.gb;a.la={p:this.la.p,color:this.la.color,offsetX:this.la.offsetX,offsetY:this.la.offsetY,blur:this.la.blur};a.align=this.align;a.l=this.l;a.fb=this.fb;a.Ia=this.Ia;return a};
function B(a,b){void 0!==b.K&&(a.K=b.K);void 0!==b.bj&&(a.bj=b.bj);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.Bc&&(a.Bc=b.Bc);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.hg&&(a.hg=b.hg);void 0!==b.fillColor&&(a.sd=0,a.fillColor=b.fillColor);void 0!==b.Od&&(a.sd=1,a.Od=b.Od);void 0!==b.Bb&&(a.sd=2,a.Bb=b.Bb);void 0!==b.fillStyle&&(a.sd=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.Ng&&(a.Ng=b.Ng);void 0!==b.strokeColor&&(a.Xh=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.Xh=3,a.strokeStyle=b.strokeStyle);void 0!==b.pa&&(a.pa=b.pa);void 0!==b.Za&&(a.Za=b.Za);void 0!==b.gb&&(a.gb=b.gb);void 0!==b.la&&(a.la=b.la);void 0!==b.align&&(a.align=b.align);void 0!==b.l&&(a.l=b.l);void 0!==b.fb&&(a.fb=b.fb);void 0!==b.Ia&&(a.Ia=b.Ia)}function Aa(a,b){a.fontWeight=void 0===b?"":b}function C(a,b){a.fontSize=void 0===b?12:b}
function Ba(a,b){a.hg=void 0===b?1:b}e.setFillColor=function(a){this.sd=0;this.fillColor=void 0===a?"black":a};function Ca(a,b,c,d,g){a.sd=2;a.Bb.bk=!0;a.Bb.S=b;a.Bb.Nk=c.slice(0);a.Bb.size=void 0===d?.6:d;a.Bb.offset=void 0===g?0:g}function Da(a,b){a.stroke=void 0===b?!1:b}function Ea(a,b){a.Ng=void 0===b?1:b}e.setStrokeColor=function(a){this.Xh=0;this.strokeColor=void 0===a?"black":a};function Fa(a,b){a.pa=void 0===b?1:b}function Ga(a,b){a.Za=void 0===b?!1:b}
function Ha(a,b){a.gb=void 0===b?"miter":b}function Ia(a,b,c){void 0===b?a.la.p=!0:a.la={p:!0,color:b,offsetX:0,offsetY:c,blur:2}}function Ja(a,b){a.align=void 0===b?"left":b}function Ka(a,b){a.l=void 0===b?"top":b}function La(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.K+", "+a.bj}function Na(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function Oa(a,b){return a.fontSize*b.length+a.Ia*(b.length-1)}
function Pa(a,b,c){var d,g,h,k,m,n,r=[],v=p.context;v.font=La(a);switch(a.Bc){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)r.push({text:n[a],width:v.measureText(n[a]).width});return r}n=b.split("\n");h=v.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];m=v.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=v.measureText(g[b]).width,m+h+k<c?(d+=" "+g[b],m+=h+k):(r.push({text:d,width:m}),d=g[b],m=k);
r.push({text:d,width:m})}return r}e.ya=function(a,b){var c;p.context.save();c=Na(Pa(this,a,b));p.context.restore();return c};e.na=function(a,b){var c;p.context.save();c=Oa(this,Pa(this,a,b));p.context.restore();return c};function Qa(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?Pa(a,c,d):Pa(a,c);d=Na(b)<=d&&Oa(a,b)<=g;a.fontSize=k;return d}
function Ra(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(p.context.save();Qa(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Qa(a,h+k,b,c,d,g)&&(h+=k);p.context.restore();return Math.max(4,h)}function Sa(a,b,c,d,g){var h=Math.max(.01,a.Bb.size),k=a.Bb.offset;a.Bb.bk?(k=g/2+k*g,h=.5*h*g,b=p.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=p.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.Bb.S-1);for(d=0;d<a.Bb.S;d+=1)b.addColorStop(d*c,a.Bb.Nk[d]);return b}
function Ta(a,b,c,d,g,h,k){var m,n;!a.fill&&a.la.p?(b.shadowColor=a.la.color,b.shadowOffsetX=a.la.offsetX,b.shadowOffsetY=a.la.offsetY,b.shadowBlur=a.la.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.Ng;switch(a.Xh){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.pa;b.lineJoin=a.gb;for(k=0;k<c.length;k+=1){m=0;switch(a.align){case "right":m=h-c[k].width;break;case "center":m=(h-c[k].width)/2}n=a.fontSize*
(k+1)+a.Ia*k;b.strokeText(c[k].text,d+m,g+n)}}
function Ua(a,b,c,d,g,h,k){c=Pa(a,c,k);k=Na(c);var m=Oa(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.l){case "base":case "bottom":g+=-m+Math.round(a.fb*a.fontSize);break;case "middle":g+=-m/2+Math.round(a.fb*a.fontSize/2)}b.font=La(a);a.stroke&&a.Za&&Ta(a,b,c,d,g,k,h);if(a.fill){var n=d,r=g,v,z;a.la.p?(b.shadowColor=a.la.color,b.shadowOffsetX=a.la.offsetX,b.shadowOffsetY=a.la.offsetY,b.shadowBlur=a.la.blur):(b.shadowColor=
void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.hg;switch(a.sd){case 0:b.fillStyle=a.fillColor;break;case 1:m=a.Od.g;z=new s(m.width,m.height);var I=a.Od.vp,t=a.Od.wp;I&&t?v="repeat":I&&!t?v="repeat-x":!I&&t?v="repeat-y":I||t||(v="no-repeat");y(z);m.A(a.Od.gc,0,0);A(z);v=p.context.createPattern(z.canvas,v);b.fillStyle=v;break;case 2:b.fillStyle=Sa(a,n,r,k,m);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(v=0;v<c.length;v+=1){m=0;switch(a.align){case "right":m=
k-c[v].width;break;case "center":m=(k-c[v].width)/2}z=a.fontSize*(v+1)+a.Ia*v;2===a.sd&&a.Bb.bk&&(b.fillStyle=Sa(a,n,r+z-a.fontSize,k,a.fontSize));b.fillText(c[v].text,n+m,r+z)}}a.stroke&&!a.Za&&Ta(a,b,c,d,g,k,h)}e.A=function(a,b,c,d){var g=p.context;this.fill&&1===this.sd?this.Da(a,b,c,1,1,0,1,d):(g.save(),Ua(this,g,a,b,c,1,d),g.restore())};e.de=function(a,b,c,d,g){var h=p.context;this.fill&&1===this.sd?this.Da(a,b,c,1,1,0,d,g):(h.save(),Ua(this,h,a,b,c,d,g),h.restore())};
e.Da=function(a,b,c,d,g,h,k,m){var n=p.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Ua(this,n,a,0,0,k,m)}catch(r){}n.restore()};
function Va(){this.qx=10;this.pk=-1;this.av="stop_lowest_prio";this.Sq=this.ob=this.Db=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.Db=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.ob=!0)}catch(d){}this.Sq=this.Db||this.ob;this.ob&&l.D.Wh&&(this.pk=1);if(this.Sq)try{a=new Audio,this.Eq={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Eq={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.Hc=[];this.Pf={};this.qb={};this.Pc={};this.qe=
[];this.Oc=0;this.Db?(this.pe=new c,this.Fq="function"===typeof this.pe.createGain?function(){return b.pe.createGain()}:"function"===typeof this.pe.createGainNode?function(){return b.pe.createGainNode()}:function(){},this.re={},this.ok=this.Fq(),void 0===this.ok?(this.ob=!0,this.mi=Va.prototype.hn):(this.ok.connect(this.pe.destination),this.re.master=this.ok,this.mi=Va.prototype.$u)):this.mi=this.ob?Va.prototype.hn:function(){}}
function Wa(a){var b=D,c,d,g,h,k;for(c=0;c<b.Hc.length;c+=1)if((d=b.Hc[c])&&0===d.Rn)if(d.paused)d.Jq&&(d.kn+=a,d.kn>=d.Jq&&b.Mj(d.id));else if(d.ln+=a,d.Wg&&d.ln>=d.Ct)d.Wg=!1,Xa(b,d,d.te);else if(d.ie&&b.ob&&b.oo(d.id)>=d.duration)if(d.Po)try{d.P.pause(),d.P.currentTime=d.te/1E3,4===d.P.readyState?d.P.play():(g=function(){var a=d;return{ready:function(){a.P.play();a.P.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.P.addEventListener("canplaythrough",g.ready,!1))}catch(m){}else d.P.pause(),
Ya(d);for(c=b.qe.length-1;0<=c;c-=1)h=b.qe[c],b.ls(h.id)||0!==h.Rn||(h.w+=a,h.w>=h.duration?(D.le(h.id,h.Sj),void 0!==b.Pc[h.id]&&(b.Pc[h.id]=h.Sj),h.Ab&&h.Ab(),b.qe.splice(c,1)):(k=h.kb(h.w,h.start,h.Sj-h.start,h.duration),D.le(h.id,k),void 0!==b.Pc[h.id]&&(b.Pc[h.id]=k)))}function $a(a,b){a.Pf[b.ad.m.name]?a.Pf[b.ad.m.name].length<a.qx&&a.Pf[b.ad.m.name].push(b.P):a.Pf[b.ad.m.name]=[b.P]}
function ab(a,b){var c,d,g;g=[];for(c=0;c<a.Hc.length;c+=1)(d=a.Hc[c])&&0<=d.Ga.indexOf(b)&&g.push(d);return g}function bb(a,b){if(0<a.pk&&a.Oc>=a.pk)switch(a.av){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.Hc.length;c+=1)(d=a.Hc[c])&&d.ie&&!d.paused&&(void 0===g||g.nm<d.nm)&&(g=d);if(g.nm>b.wi){a.stop(g.id);break}return!1}return!0}
function cb(a,b){var c,d=1;for(c=0;c<b.Ga.length;c+=1)void 0!==D.qb[b.Ga[c]]&&(d*=D.qb[b.Ga[c]]);c=a.Fq();c.gain.value=d;c.connect(a.ok);a.re[b.id]=c;b.P.connect(c)}function db(a,b){b.P.disconnect(0);a.re[b.id]&&(a.re[b.id].disconnect(0),delete a.re[b.id])}function eb(a,b){var c;if(b.m&&b.m.xc){if(a.Db)return c=a.pe.createBufferSource(),c.buffer=b.m.xc,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.ob)return c=b.m.xc.cloneNode(!0),c.volume=0,c}}
function fb(a,b){var c,d;if(a.Db)(c=eb(a,b))&&(d=new gb(b,c));else if(a.ob){c=a.Pf[b.m.name];if(!c)return;0<c.length?d=new gb(b,c.pop()):(c=eb(a,b))&&(d=new gb(b,c))}if(d){a.Db&&cb(a,d);for(c=0;c<a.Hc.length;c+=1)if(void 0===a.Hc[c])return a.Hc[c]=d;a.Hc.push(d)}return d}function hb(a){var b=D,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Eq[d])return a[c];return!1}e=Va.prototype;
e.hn=function(a,b,c){function d(){var b;a.loaded=!0;la(c);a.duration=Math.ceil(1E3*a.xc.duration);a.xc.removeEventListener("canplaythrough",d,!1);a.xc.removeEventListener("error",g,!1);b=a.xc.cloneNode(!0);D.Pf[a.name].push(b)}function g(){na(c)}(b=hb(b))?(a.xc=new Audio,a.xc.src=b,a.xc.autoplay=!1,a.xc.SB="auto",a.xc.addEventListener("canplaythrough",d,!1),a.xc.addEventListener("error",g,!1),a.xc.load()):g()};
e.$u=function(a,b,c){var d=hb(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){D.pe.decodeAudioData(g.response,function(b){b&&(a.xc=b,a.duration=1E3*b.duration,a.loaded=!0,la(c))},function(){na(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(D.Db=!1,D.ob=!0,D.mi=Va.prototype.hn,D.mi(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof E){if(bb(this,a)){a=fb(this,a);if(!a)return-1;a.Ct=b||0;a.Wg=0<b;a.Mc=c||0;a.De=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.Wg||Xa(this,a,a.te);return a.id}return-1}};
function Xa(a,b,c){var d;"number"!==typeof c&&(c=0);ib(a,b.id);0<b.Mc&&(d=jb(a,b.id),a.le(b.id,0),kb(a,b.id,d,b.Mc,b.De),b.Mc=0,b.De=void 0);if(a.Db){d=c-b.te;b.bv=1E3*a.pe.currentTime-d;b.P.onended=function(){Ya(b)};try{b.P.start?b.P.start(0,c/1E3,(b.duration-d)/1E3):b.P.noteGrainOn&&b.P.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.Yd=!0,b.ie=!0,a.Oc+=1,b.P.loop=b.Po}catch(g){}}else if(a.ob){if(4!==b.P.readyState){var h=function(){return{ready:function(){b.P.currentTime=c/1E3;b.P.play();b.Yd=!0;b.P.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.P.addEventListener("canplaythrough",h.ready,!1)}else b.P.currentTime=c/1E3,b.P.play(),b.Yd=!0;b.ie=!0;a.Oc+=1}}
e.Mj=function(a,b,c,d){var g,h,k,m,n=ab(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.ie)&&!d||!h.paused&&d){if(!d){for(g=this.qe.length-1;0<=g;g-=1)if(a=this.qe[g],a.id===h.id){m=a;b=0;c=void 0;break}h.paused=!1;h.Mc=b||0;h.De=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.ki&&(void 0===b&&(h.Mc=h.ki.duration),void 0===c&&(h.De=h.ki.kb),k=h.ki.gain,h.ki=void 0)}this.Db&&(a=eb(this,h.ad))&&(h.P=a,cb(this,h));void 0!==k&&D.le(h.id,k);Xa(this,h,h.te+(h.qk||0));void 0!==m&&
(D.le(h.id,m.kb(m.w,m.start,m.Sj-m.start,m.duration)),kb(D,h.id,m.Sj,m.duration-m.w,m.kb,m.Ab))}};
e.pause=function(a,b,c,d,g){var h,k,m=ab(this,a);for(a=0;a<m.length;a+=1)if(h=m[a],!h.paused)if(h.Mc=c||0,0<h.Mc)h.De=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.ki={gain:lb(h.id),duration:h.Mc,kb:h.De},kb(D,h.id,0,h.Mc,h.De,function(){D.pause(h.id,b)});else if(k=this.oo(h.id),h.qk=k,g||(h.paused=!0,h.kn=0,h.Jq=b,this.Oc-=1),this.Db){h.P.onended=function(){};if(h.ie&&h.Yd){try{h.P.stop?h.P.stop(0):h.P.noteOff&&h.P.noteOff(0)}catch(n){}h.Yd=!1}db(this,h)}else this.ob&&h.P.pause()};
function Ya(a){var b=D;b.qb[a.id]&&delete b.qb[a.id];a.paused||(b.Oc-=1);b.Db?(a.Yd=!1,a.ie=!1,db(b,a)):b.ob&&$a(b,a);b.Hc[b.Hc.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=ab(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.Mc=b||0,0<d.Mc)d.De=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},kb(D,d.id,0,d.Mc,d.De,function(){D.stop(d.id)});else{this.qb[d.id]&&delete this.qb[d.id];d.ie&&!d.paused&&(this.Oc-=1);if(this.Db){if(d.ie&&!d.paused&&!d.Wg){if(d.Yd){try{d.P.stop?d.P.stop(0):d.P.noteOff&&d.P.noteOff(0)}catch(h){}d.Yd=!1}db(this,d)}}else this.ob&&(d.Wg||d.P.pause(),$a(this,d));this.Hc[this.Hc.indexOf(d)]=void 0;d.ie=!1}};
function kb(a,b,c,d,g,h){var k;for(k=0;k<a.qe.length;k+=1)if(a.qe[k].id===b){a.qe.splice(k,1);break}a.qe.push({id:b,Sj:c,kb:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,w:0,start:jb(a,b),Ab:h,Rn:0})}function mb(a){var b=D,c;void 0===b.Pc[a]&&(c=void 0!==b.qb[a]?b.qb[a]:1,b.le(a,0),b.Pc[a]=c)}function nb(a){var b=D;void 0!==b.Pc[a]&&(b.le(a,b.Pc[a]),delete b.Pc[a])}
e.position=function(a,b){var c,d,g,h,k=ab(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.Db)if(d.paused)d.qk=b;else{d.P.onended=function(){};if(d.Yd){try{d.P.stop?d.P.stop(0):d.P.noteOff&&d.P.noteOff(0)}catch(m){}d.Yd=!1}db(this,d);this.Oc-=1;if(g=eb(this,d.ad))d.P=g,cb(this,d),Xa(this,d,d.te+b)}else this.ob&&(4===d.P.readyState?d.P.currentTime=(d.te+b)/1E3:(h=function(){var a=d,c=b;return{Vr:function(){a.P.currentTime=(a.te+c)/1E3;a.P.removeEventListener("canplaythrough",
h.Vr,!1)}}}(),d.P.addEventListener("canplaythrough",h.Vr,!1)))};e.xp=function(a){D.position(a,0)};e.Ep=function(a,b){var c,d=ab(this,a);for(c=0;c<d.length;c+=1)d[c].Po=b,this.Db&&(d[c].P.loop=b)};function jb(a,b){return void 0!==a.qb[b]?a.qb[b]:1}function lb(a){var b=D,c=1,d=ab(b,a)[0];if(d)for(a=0;a<d.Ga.length;a+=1)void 0!==b.qb[d.Ga[a]]&&(c*=b.qb[d.Ga[a]]);return Math.round(100*c)/100}
e.le=function(a,b){var c,d,g,h=1,k=ab(this,a);this.qb[a]=b;this.Pc[a]&&delete this.Pc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.Ga.indexOf(a)){for(g=0;g<d.Ga.length;g+=1)void 0!==this.qb[d.Ga[g]]&&(h*=this.qb[d.Ga[g]]);h=Math.round(100*h)/100;this.Db?this.re[d.id].gain.value=h:this.ob&&(d.P.volume=h)}};
function ib(a,b){var c,d,g,h=1,k=ab(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.Ga.length;g+=1)void 0!==a.qb[d.Ga[g]]&&(h*=a.qb[d.Ga[g]]);h=Math.round(100*h)/100;a.Db?a.re[d.id].gain.value=h:a.ob&&(d.P.volume=h)}}e.wk=function(a,b){var c,d,g,h=ab(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.Ga.indexOf(b[g])&&d.Ga.push(b[g]);ib(this,a)};e.ls=function(a){if(a=ab(this,a)[0])return a.paused};
e.oo=function(a){if(a=ab(this,a)[0]){if(this.Db)return a.paused?a.qk:(1E3*D.pe.currentTime-a.bv)%a.duration;if(D.ob)return Math.ceil(1E3*a.P.currentTime-a.te)}};var D=new Va;function ob(a,b,c,d){this.name=a;this.Tx=b;this.Xx=c;this.Xc=d;this.loaded=!1;this.xc=null;oa(this,this.Xc,1)}
ob.prototype.me=function(a,b){var c,d;c=this.Tx;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Xx;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);D.Pf[this.name]=[];D.mi(this,[d,c],a)};ob.prototype.complete=function(){return this.loaded};
function E(a,b,c,d,g,h,k){this.name=a;this.m=b;this.startOffset=c;this.duration=d;D.le(this.name,void 0!==g?g:1);this.wi=void 0!==h?h:10;this.Ga=[];k&&(this.Ga=this.Ga.concat(k));0>this.Ga.indexOf(this.name)&&this.Ga.push(this.name)}E.prototype.complete=function(){return this.m.complete()};E.prototype.nm=function(a){void 0!==a&&(this.wi=a);return this.wi};E.prototype.wk=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.Ga.indexOf(a[b])&&this.Ga.push(a[b])};
function gb(a,b){this.ad=a;this.te=this.ad.startOffset;this.P=b;this.duration=this.ad.duration;this.fn()}gb.prototype.fn=function(){this.id=Math.round(Date.now()*Math.random())+"";this.Ga=["master",this.id].concat(this.ad.Ga);this.nm=void 0!==this.ad.wi?this.ad.wi:10;this.paused=this.ie=this.Po=!1;this.ln=this.Rn=0;this.Yd=this.Wg=!1;this.Ct=this.qk=0;var a,b=1;for(a=0;a<this.Ga.length;a+=1)void 0!==D.qb[this.Ga[a]]&&(b*=D.qb[this.Ga[a]]);!D.Db&&D.ob&&(this.P.volume=b)};
function pb(a,b){this.name=a;this.fileName=b;this.info=void 0}function qb(a){this.name=a;this.text="";this.rd=this.complete=!1}qb.prototype.Qf=function(a){4===a.readyState&&(this.complete=!0,(this.rd=200!==a.status)?ma("Get Failed",{name:this.name}):(this.text=a.responseText,ma("Get Complete",{name:this.name})))};
function rb(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.rd=200!==c.status,a.rd?ma("Post Failed",{name:a.name}):ma("Post Complete",{name:a.name}))};c.send(a.text)}function sb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.rd=200!==c.status;if(a.rd)return!1;a.text=c.responseText;return!0}
function tb(a){a&&(this.Ke=a);this.clear();this.ti=this.$g=this.Id=this.si=this.ri=this.vi=this.oi=this.ui=this.se=this.qi=this.pi=0;ub(this,this);vb(this,this);wb(this,this);this.jc=[];this.gi=[];this.yi=[];this.ba=0;this.Kq=!1;this.Hl=this.startTime=Date.now();this.Mg=this.pl=0;this.rx=200;this.Xc="";window.ik(window.Bq)}e=tb.prototype;e.clear=function(){this.O=[];this.zi=!1;this.wc=[];this.en=!1};
function ub(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.Ke&&!(0<b.ba)&&(d=b.Ke,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.Vg.x=h,b.Vg.y=d,b.ii.push({x:b.Vg.x,y:b.Vg.y}),0<b.si))for(a=b.O.length-1;0<=a&&!((h=b.O[a])&&h.p&&0>=h.ba&&h.so&&(h=h.so(b.Vg.x,b.Vg.y),!0===h));a-=1);},!1);xb(a)}function xb(a){a.Vg={x:0,y:0};a.ii=[]}
function vb(a,b){window.addEventListener("mousedown",function(a){0<b.ba||(a.preventDefault(),window.focus(),b.Iq>=Date.now()-1E3||(yb(b,0,a.clientX,a.clientY),zb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.ba||(a.preventDefault(),b.nk>=Date.now()-1E3||(yb(b,0,a.clientX,a.clientY),Ab(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.ba||(a.preventDefault(),yb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Iq=
Date.now();if(!(0<b.ba))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)yb(b,d[a].identifier,d[a].clientX,d[a].clientY),zb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.nk=Date.now();if(!(0<b.ba))for(a.preventDefault(),a=0;a<d.length;a+=1)yb(b,d[a].identifier,d[a].clientX,d[a].clientY),Ab(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.ba))for(a.preventDefault(),a=0;a<d.length;a+=1)yb(b,
d[a].identifier,d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.nk=Date.now();if(!(0<b.ba))for(a.preventDefault(),a=0;a<d.length;a+=1)yb(b,d[a].identifier,d[a].clientX,d[a].clientY),Ab(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.nk=Date.now();if(!(0<b.ba))for(a.preventDefault(),a=0;a<d.length;a+=1)yb(b,d[a].identifier,d[a].clientX,d[a].clientY),Ab(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){Bb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){Bb(b,a)},!1);Cb(a);a.Iq=0;a.nk=0}function Cb(a){var b;a.wa=[];for(b=0;16>b;b+=1)a.wa[b]={id:-1,Pb:!1,x:0,y:0};a.Tf=[]}function Db(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.wa[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.wa[d].Pb){c=d;a.wa[d].id=b;break}return c}
function yb(a,b,c,d){var g,h;void 0!==a.Ke&&(b=Db(a,b),-1!==b&&(g=a.Ke,h=g.getBoundingClientRect(),a.wa[b].x=g.width/h.width*(c-h.left),a.wa[b].y=g.height/h.height*(d-h.top)))}function zb(a,b){var c=Db(a,b),d,g;if(-1!==c&&!a.wa[c].Pb&&(a.Tf.push({ig:c,x:a.wa[c].x,y:a.wa[c].y,Pb:!0}),a.wa[c].Pb=!0,0<a.Id))for(d=a.O.length-1;0<=d&&!((g=a.O[d])&&g.p&&0>=g.ba&&g.zh&&(g=g.zh(c,a.wa[c].x,a.wa[c].y),!0===g));d-=1);}
function Ab(a,b){var c=Db(a,b),d,g;if(-1!==c&&a.wa[c].Pb&&(a.Tf.push({ig:c,x:a.wa[c].x,y:a.wa[c].y,Pb:!1}),a.wa[c].Pb=!1,0<a.Id))for(d=a.O.length-1;0<=d&&!((g=a.O[d])&&g.p&&0>=g.ba&&g.Ah&&(g=g.Ah(c,a.wa[c].x,a.wa[c].y),!0===g));d-=1);}
function Bb(a,b){var c;if(!(0<a.ba)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.Tf.push({ig:0,x:a.wa[0].x,y:a.wa[0].y,wheelDelta:c});if(0<a.Id)for(d=a.O.length-1;0<=d&&!((g=a.O[d])&&g.p&&0>=g.ba&&g.vo&&(g=g.vo(c,a.wa[0].x,a.wa[0].y),!0===g));d-=1);}}e.Nm=function(a){return this.wa[a].Pb};
function wb(a,b){window.addEventListener("keydown",function(a){0<b.ba||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Eb(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.ba||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Fb(b,a.keyCode))},!1);Gb(a)}function Gb(a){var b;a.li=[];for(b=0;256>b;b+=1)a.li[b]=!1;a.Yg=[]}
function Eb(a,b){var c,d;if(!a.li[b]&&(a.Yg.push({key:b,Pb:!0}),a.li[b]=!0,0<a.$g))for(c=0;c<a.O.length&&!((d=a.O[c])&&d.p&&0>=d.ba&&d.to&&(d=d.to(b),!0===d));c+=1);}function Fb(a,b){var c,d;if(a.li[b]&&(a.Yg.push({key:b,Pb:!1}),a.li[b]=!1,0<a.$g))for(c=0;c<a.O.length&&!((d=a.O[c])&&d.p&&0>=d.ba&&d.uo&&(d=d.uo(b),!0===d));c+=1);}
function Hb(a,b,c){var d=F,g=0,h=d.jc.length,k;void 0===g&&(g=1);void 0===c&&(c=null);for(k=0;k<d.jc.length;k+=1)d.jc[k].id===a&&d.jc[k].Kf===c&&(h=k);if(h===d.jc.length)for(k=0;k<d.jc.length;k+=1)void 0===d.jc[k].id&&(h=k);d.jc[h]={id:a,time:b,fC:g,Kf:c,Pg:b,sm:g-1,paused:0}}function Ib(){var a=F,b;for(b=0;b<a.jc.length;b+=1)a.jc[b].paused+=1}
function ma(a,b){var c,d=F,g,h;void 0===c&&(c=null);d.yi.push({id:a,gv:b,Kf:c});if(0<d.ti)for(g=0;g<d.O.length&&(!((h=d.O[g])&&h.p&&0>=h.ba&&h.wo)||null!==c&&c!==h||(h=h.wo(a,b),!0!==h));g+=1);}
function Jb(a,b){var c=a.wc[b];c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.Ub(c.canvas),!1!==p.canvas.ta||!0===c.td)&&(0===c.Hq&&(0>=c.ba&&(c.gc+=c.fv*a.Mg/1E3),1===c.Zm&&1===c.$m&&0===c.Ra?1===c.alpha?c.g.A(c.gc,c.x,c.y):c.g.de(c.gc,c.x,c.y,c.alpha):c.g.Da(c.gc,c.x,c.y,c.Zm,c.$m,c.Ra,c.alpha)),1===c.Hq&&(1===c.Zm&&1===c.$m&&0===c.Ra?1===c.alpha?c.font.A(c.text,c.x,c.y):c.font.de(c.text,c.x,c.y,c.alpha):c.font.Da(c.text,c.x,c.y,c.Zm,c.$m,c.Ra,c.alpha)))}
function Kb(a,b){var c=a.O[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==p.canvas&&p.Ub(c.canvas),(!1!==p.canvas.ta||!0===c.td)&&c.tb))return c.tb()}function Lb(a){for(var b=0,c=0;b<a.O.length||c<a.wc.length;)if(c===a.wc.length){if(!0===Kb(a,b))break;b+=1}else if(b===a.O.length)Jb(a,c),c+=1;else if(a.wc[c].Ua>a.O[b].Ua||a.wc[c].Ua===a.O[b].Ua&&a.wc[c].depth>a.O[b].depth)Jb(a,c),c+=1;else{if(!0===Kb(a,b))break;b+=1}}e.pause=function(a){this.ba+=1;void 0===a&&(a=!1);this.Kq=a};
e.Mj=function(){0!==this.ba&&(this.Hl=Date.now(),this.ba-=1)};e.ls=function(){return 0<this.ba};window.cn=0;window.bn=0;window.Cq=0;window.Su=0;window.Dq=0;window.Uu=60;window.Vu=0;window.Tu=!1;
window.Bq=function(){window.cn=Date.now();window.Su=window.cn-window.bn;var a=F,b;if(0<a.ba)a.Kq&&(Mb(a),Lb(a));else{b=Date.now();"number"!==typeof b&&(b=a.Hl);a.Mg=Math.min(a.rx,b-a.Hl);a.pl+=a.Mg;""===a.Xc&&(a.Xc="start",ia.me(a.Xc));"start"===a.Xc&&ia.complete(a.Xc)&&(a.Xc="load",ia.me(a.Xc));"load"===a.Xc&&ia.complete(a.Xc)&&(a.Xc="game",ia.me(a.Xc));"undefined"!==typeof D&&Wa(a.Mg);var c,d;if(0<a.pi)for(c=0;c<a.O.length&&!((d=a.O[c])&&d.Oa&&d.p&&0>=d.ba&&!0===d.Oa(a.Mg));c+=1);var g,h;if(0!==
a.ii.length){if(0<a.qi)for(d=a.O.length-1;0<=d;d-=1)if((g=a.O[d])&&g.p&&0>=g.ba&&g.ro)for(c=0;c<a.ii.length;c+=1)h=a.ii[c],!0!==h.wd&&(h.wd=g.ro(h.x,h.y));a.ii=[]}if(0!==a.Tf.length){if(0<a.se)for(d=a.O.length-1;0<=d;d-=1)if((g=a.O[d])&&g.p&&0>=g.ba&&(g.Qb||g.pc||g.yl))for(c=0;c<a.Tf.length;c+=1)h=a.Tf[c],!0!==h.wd&&(void 0!==h.wheelDelta&&g.yl?h.wd=g.yl(h.wheelDelta,h.x,h.y):h.Pb&&g.Qb?h.wd=g.Qb(h.ig,h.x,h.y):void 0!==h.Pb&&!h.Pb&&g.pc&&(h.wd=g.pc(h.ig,h.x,h.y)));a.Tf=[]}if(0!==a.Yg.length){if(0<
a.ui)for(d=0;d<a.O.length;d+=1)if((g=a.O[d])&&g.p&&0>=g.ba&&(g.kj||g.qg))for(c=0;c<a.Yg.length;c+=1)h=a.Yg[c],!0!==h.wd&&(h.Pb&&g.kj?h.wd=void 0:!h.Pb&&g.qg&&(h.wd=g.qg(h.key)));a.Yg=[]}c=a.Mg;for(d=a.gi.length=0;d<a.jc.length;d+=1)g=a.jc[d],void 0!==g.id&&0===g.paused&&(0<g.Pg||0<g.sm)&&(g.Pg-=c,0>=g.Pg&&(a.gi.push({id:g.id,Kf:g.Kf}),0<g.sm?(g.sm-=1,g.Pg+=g.time):g.Pg=0));if(0<a.oi&&0<a.gi.length)for(c=0;c<a.O.length;c+=1)if((d=a.O[c])&&d.ul&&d.p)for(g=0;g<a.gi.length;g+=1)h=a.gi[g],!0===h.wd||null!==
h.Kf&&h.Kf!==d||(h.wd=d.ul(h.id));if(0<a.vi&&0<a.yi.length)for(c=0;c<a.O.length;c+=1)if((g=a.O[c])&&g.vd&&g.p&&0>=g.ba)for(d=0;d<a.yi.length;d+=1)h=a.yi[d],!0===h.wd||null!==h.Kf&&h.Kf!==g||(h.wd=g.vd(h.id,h.gv));a.yi.length=0;if(0<a.ri)for(c=0;c<a.O.length&&!((d=a.O[c])&&d.ud&&d.p&&0>=d.ba&&!0===d.ud(a.Mg));c+=1);Mb(a);Lb(a);a.Hl=b}window.bn=Date.now();window.Cq=window.bn-window.cn;window.Dq=Math.max(window.Vu,1E3/window.Uu-window.Cq);window.ik(window.Bq)};
window.ik=function(a){window.setTimeout(a,window.Dq)};window.Tu||(window.ik=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.ik);
function Mb(a){function b(a,b){return a.Ua===b.Ua?b.depth-a.depth:a.Ua>b.Ua?-1:1}var c,d;for(c=d=0;c<a.O.length;c+=1)a.O[c]&&(a.O[c].dn&&(a.O[c].dn=!1,a.O[c].p=!0),a.O[d]=a.O[c],d+=1);a.O.length=d;a.zi&&a.O.sort(b);a.zi=!1;for(c=d=0;c<a.wc.length;c+=1)a.wc[c]&&(a.wc[d]=a.wc[c],d+=1);a.wc.length=d;a.en&&a.wc.sort(b);a.en=!1}
function Nb(a,b){var c=F;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.p&&(a.p=!0);void 0===a.depth&&(a.depth=0);void 0===a.Ua&&(a.Ua=0);void 0===a.ba&&(a.ba=0);void 0===a.Sf&&(a.Sf=[]);a.dn=!1;void 0!==b&&!1===b&&(a.dn=!0,a.p=!1);c.O.push(a);c.zi=!0;a.Oa&&(c.pi+=1);a.ro&&(c.qi+=1);if(a.Qb||a.pc)c.se+=1;a.yl&&(c.se+=1);if(a.kj||a.qg)c.ui+=1;a.ul&&(c.oi+=1);a.vd&&(c.vi+=1);a.ud&&(c.ri+=1);a.so&&(c.si+=1);if(a.zh||a.Ah)c.Id+=1;a.vo&&(c.Id+=1);if(a.to||a.uo)c.$g+=1;a.wo&&
(c.ti+=1);a.Tc&&a.Tc()}function Ob(a,b){var c=F;a.depth!==b&&(c.zi=!0);a.depth=b}function Pb(a,b){var c;b=[].concat(b);void 0===a.Sf&&(a.Sf=[]);for(c=b.length-1;0<=c;c-=1)0>a.Sf.indexOf(b[c])&&a.Sf.push(b[c])}
function Qb(a,b){var c=[],d,g;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.O.length;d+=1)g=a.O[d],void 0!==g&&c.push(g);else if("function"===typeof b)for(d=0;d<a.O.length;d+=1)g=a.O[d],void 0!==g&&b(g)&&c.push(g);else for(d=0;d<a.O.length;d+=1)g=a.O[d],void 0!==g&&0<=g.Sf.indexOf(b)&&c.push(g);return c}function Rb(a){var b=Qb(F,a);for(a=0;a<b.length;a+=1){var c=b[a];c.ba+=1}}function Sb(a){var b=Qb(F,a);for(a=0;a<b.length;a+=1){var c=b[a];c.ba=Math.max(0,c.ba-1)}}
function G(a,b){var c=a.O.indexOf(b);if(!(0>c)){a.O[c].Uc&&a.O[c].Uc();var d=a.O[c];d.Oa&&(a.pi-=1);d.ro&&(a.qi-=1);if(d.Qb||d.pc)a.se-=1;d.yl&&(a.se-=1);if(d.kj||d.qg)a.ui-=1;d.ul&&(a.oi-=1);d.vd&&(a.vi-=1);d.ud&&(a.ri-=1);d.so&&(a.si-=1);if(d.zh||d.Ah)a.Id-=1;d.vo&&(a.Id-=1);if(d.to||d.uo)a.$g-=1;d.wo&&(a.ti-=1);a.O[c]=void 0}}
tb.prototype.b=function(a,b,c,d,g,h,k){void 0===k&&(k=0);this.wc.push({Hq:0,g:a,gc:b,fv:c,visible:!0,x:d,y:g,Zm:1,$m:1,Ra:0,alpha:1,depth:h,Ua:k,ba:0,Sf:[]});this.en=!0;return this.wc[this.wc.length-1]};var F=new tb(ba);
function Tb(a,b){var c;this.kind=a;this.L=null;switch(this.kind){case 0:this.L={x:[b.x],y:[b.y]};this.ab=b.x;this.rb=b.y;this.Eb=b.x;this.Zb=b.y;break;case 2:this.L={x:[b.x,b.x+b.jb-1,b.x+b.jb-1,b.x,b.x],y:[b.y,b.y,b.y+b.cb-1,b.y+b.cb-1,b.y]};this.ab=b.x;this.rb=b.y;this.Eb=b.x+b.jb-1;this.Zb=b.y+b.cb-1;break;case 3:this.L={x:[],y:[]};this.ab=b.x-b.qm;this.rb=b.y-b.qm;this.Eb=b.x+b.qm;this.Zb=b.y+b.qm;break;case 1:this.L={x:[b.nq,b.oq],y:[b.pq,b.qq]};this.ab=Math.min(b.nq,b.oq);this.rb=Math.min(b.pq,
b.qq);this.Eb=Math.max(b.nq,b.oq);this.Zb=Math.max(b.pq,b.qq);break;case 4:this.L={x:[],y:[]};this.ab=b.x[0];this.rb=b.y[0];this.Eb=b.x[0];this.Zb=b.y[0];for(c=0;c<b.x.length;c+=1)this.L.x.push(b.x[c]),this.L.y.push(b.y[c]),this.ab=Math.min(this.ab,b.x[c]),this.rb=Math.min(this.rb,b.y[c]),this.Eb=Math.max(this.Eb,b.x[c]),this.Zb=Math.max(this.Zb,b.y[c]);this.L.x.push(b.x[0]);this.L.y.push(b.y[0]);break;default:this.rb=this.ab=0,this.Zb=this.Eb=-1}}
function Ub(a,b,c,d){return new Tb(2,{x:a,y:b,jb:c,cb:d})}function Vb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,m,n,r;for(h=0;h<a.S;h+=1)k=a.Ue[h]-a.hc,m=k+a.Te[h]-1,n=a.Ve[h]-a.ic,r=n+a.Se[h]-1,k<b&&(b=k),m>c&&(c=m),n<d&&(d=n),r>g&&(g=r);return new Tb(2,{x:b,y:d,jb:c-b+1,cb:g-d+1})}e=Tb.prototype;
e.ea=function(){var a=new Tb(-1,{}),b;a.kind=this.kind;a.ab=this.ab;a.Eb=this.Eb;a.rb=this.rb;a.Zb=this.Zb;a.L={x:[],y:[]};for(b=0;b<this.L.x.length;b+=1)a.L.x[b]=this.L.x[b];for(b=0;b<this.L.y.length;b+=1)a.L.y[b]=this.L.y[b];return a};e.translate=function(a,b){var c=this.ea(),d;c.ab+=a;c.Eb+=a;c.rb+=b;c.Zb+=b;for(d=0;d<c.L.x.length;d+=1)c.L.x[d]+=a;for(d=0;d<c.L.y.length;d+=1)c.L.y[d]+=b;return c};
e.scale=function(a){var b=this.ea(),c;b.ab*=a;b.Eb*=a;b.rb*=a;b.Zb*=a;for(c=0;c<b.L.x.length;c+=1)b.L.x[c]*=a;for(c=0;c<b.L.y.length;c+=1)b.L.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new da(this.L.x[0],this.L.y[0]),b=b.rotate(a),new Tb(0,{x:b.x,y:b.y});case 1:return b=new da(this.L.x[0],this.L.y[0]),b=b.rotate(a),c=new da(this.L.x[1],this.L.y[1]),c=c.rotate(a),new Tb(1,{nq:b.x,pq:b.y,oq:c.x,qq:c.y});case 3:return b=(this.Eb-this.ab)/2,c=new da(this.ab+b,this.rb+b),c=c.rotate(a),new Tb(3,{x:c.x,y:c.y,qm:b});default:c=[];d=[];for(g=0;g<this.L.x.length-1;g+=1)b=new da(this.L.x[g],this.L.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Tb(4,{x:c,y:d})}};
function Wb(a,b,c,d,g){var h,k,m,n,r;if(d<b+a.ab||d>b+a.Eb||g<c+a.rb||g>c+a.Zb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return m=(a.Eb-a.ab)/2,d-=b+a.ab+m,g-=c+a.rb+m,d*d+g*g<=m*m;case 1:return m=b+a.L.x[0],n=c+a.L.y[0],b+=a.L.x[1],a=c+a.L.y[1],d===m?g===n:d===b?g===a:1>Math.abs(n+(d-m)*(a-n)/(b-m)-g);case 4:n=new da(0,0);r=new da(0,0);m=[];for(k=0;k<a.L.x.length-1;k+=1)n.x=a.L.x[k],n.y=a.L.y[k],r.x=a.L.x[k+1],r.y=a.L.y[k+1],m.push(ea(new da(n.x-r.x,n.y-r.y)));for(n=0;n<m.length;n+=1){r=
new da(d,g);k=m[n];r=r.x*k.x+r.y*k.y;h=a;var v=b,z=c,I=m[n],t=new da(0,0),u=void 0,w=1E9;k=-1E10;for(var x=void 0,x=0;x<h.L.x.length;x+=1)t.x=v+h.L.x[x],t.y=z+h.L.y[x],u=t.x*I.x+t.y*I.y,w=Math.min(w,u),k=Math.max(k,u);h=w;if(r<h||k<r)return!1}return!0;default:return!1}}
e.Lc=function(a,b,c){var d=p.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.ab-1,b+this.rb-1,3,3);break;case 2:d.fillRect(a+this.ab,b+this.rb,this.Eb-this.ab+1,this.Zb-this.rb+1);break;case 3:c=(this.Eb-this.ab)/2;d.beginPath();d.arc(a+this.ab+c,b+this.rb+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.L.x[0],b+this.L.y[0]);d.lineTo(a+this.L.x[1],b+this.L.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.L.x[0],b+this.L.y[0]);
for(c=1;c<this.L.x.length-1;c+=1)d.lineTo(a+this.L.x[c],b+this.L.y[c]);d.closePath();d.fill()}};function Xb(){this.depth=1E7;this.visible=!1;this.p=!0;this.group="Engine";this.Ca=[];this.ni=this.ba=this.xi=!1;this.bf=1;this.hd=-1;this.Ha=-1E6}e=Xb.prototype;e.ea=function(){var a=new Xb,b;for(b=0;b<this.Ca.length;b+=1)a.Ca.push({Cb:this.Ca[b].Cb,action:this.Ca[b].action});a.ni=this.ni;return a};
e.zb=function(a,b){var c,d;if(0===this.Ca.length||this.Ca[this.Ca.length-1].Cb<=a)this.Ca.push({Cb:a,action:b});else{for(c=0;this.Ca[c].Cb<=a;)c+=1;for(d=this.Ca.length;d>c;d-=1)this.Ca[d]=this.Ca[d-1];this.Ca[c]={Cb:a,action:b}}this.Ha=-1E6};e.start=function(){this.xi=!0;this.ba=!1;this.hd=0>this.bf&&0<this.Ca.length?this.Ca[this.Ca.length-1].Cb+1:-1;this.Ha=-1E6;G(F,this);Nb(this)};
e.xp=function(){if(0>this.bf&&0<this.Ca.length){var a=this.Ca[this.Ca.length-1].Cb;this.hd=0>this.bf?a+1:a-1}else this.hd=0>this.bf?1:-1;this.Ha=-1E6};e.stop=function(){this.xi=!1;G(F,this)};e.fc=function(){return this.xi};e.pause=function(){this.ba=!0;G(F,this)};e.Mj=function(){this.ba=!1;G(F,this);Nb(this)};e.paused=function(){return this.xi&&this.ba};e.Ep=function(a){this.ni=a};
e.Oa=function(a){if(this.xi&&!this.ba&&0!==this.bf)if(0<this.bf){0>this.Ha&&(this.Ha=0);for(;this.Ha<this.Ca.length&&this.Ca[this.Ha].Cb<=this.hd;)this.Ha+=1;for(this.hd+=this.bf*a;0<=this.Ha&&this.Ha<this.Ca.length&&this.Ca[this.Ha].Cb<=this.hd;)this.Ca[this.Ha].action(this.Ca[this.Ha].Cb,this),this.Ha+=1;this.Ha>=this.Ca.length&&(this.ni?this.xp():this.stop())}else{0>this.Ha&&(this.Ha=this.Ca.length-1);for(;0<=this.Ha&&this.Ca[this.Ha].Cb>=this.hd;)this.Ha-=1;for(this.hd+=this.bf*a;0<=this.Ha&&
this.Ca[this.Ha].Cb>=this.hd;)this.Ca[this.Ha].action(this.Ca[this.Ha].Cb,this),this.Ha-=1;0>this.Ha&&0>=this.hd&&(this.ni?this.xp():this.stop())}};function Yb(){this.depth=1E7;this.visible=!1;this.p=!0;this.group="Engine";this.vc=[];this.Of=[];this.clear();this.Zy=!1;Nb(this)}e=Yb.prototype;
e.Oa=function(){var a,b,c,d,g;if(this.Zy)for(a=0;16>a;a+=1)F.Nm(a)&&(b=F.wa[a].x,c=F.wa[a].y,d=this.Of[a],g=this.vc[d],!(0<=d&&g&&g.selected)||g&&Wb(g.xd,0,0,b,c)||(Fb(F,g.keyCode),g.selected=!1,this.Of[a]=-1),this.Qb(a,b,c))};e.Qb=function(a,b,c){var d;if(!(0<=this.Of[a]))for(d=0;d<this.vc.length;d+=1){var g;if(g=this.vc[d])g=(g=this.vc[d])?Wb(g.xd,0,0,b,c):!1;if(g&&!this.vc[d].selected){Eb(F,this.vc[d].keyCode);this.vc[d].selected=!0;this.Of[a]=d;break}}};
e.pc=function(a){var b=this.Of[a];0<=b&&this.vc[b]&&this.vc[b].selected&&(Fb(F,this.vc[b].keyCode),this.vc[b].selected=!1);this.Of[a]=-1};function Zb(a,b,c,d,g,h,k){c=Ub(c,d,g,h);a.vc.push({keyCode:k,xd:c,id:b,selected:!1})}e.clear=function(){var a;for(a=this.vc.length=0;16>a;a+=1)this.Of[a]=-1};
e.Lc=function(a,b,c){var d,g,h,k;for(d=0;d<this.vc.length;d+=1)if(g=this.vc[d])g.selected?g.xd.Lc(0,0,b):g.xd.Lc(0,0,a),h=(g.xd.ab+g.xd.Eb)/2,k=(g.xd.rb+g.xd.Zb)/2,p.Qc("id: "+g.id,h-20,k-10,c,"16px Arial"),p.Qc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new fa;function $b(a,b){return b}function H(a,b,c,d){return b+a/d*c}function ac(a,b,c,d,g){void 0===g&&(g=3);a=Math.pow(a/d,g);return b+c*a}function bc(a,b,c,d){a=a<d/2?ac(a,0,.5,d/2,3):ac(d-a,1,-.5,d/2,3);return b+c*a}
function cc(a,b,c,d){return ac(a,b,c,d,2)}function dc(a,b,c,d){return ac(a,b,c,d,3)}function fc(a,b,c,d){a=ac(d-a,1,-1,d,3);return b+c*a}function gc(a,b,c,d){return bc(a,b,c,d)}function hc(a,b,c,d,g){a=d-a;var h=3,k=g;void 0===h&&(h=3);void 0===k&&(k=8);g=Math.sin(2*(1-a/d)*Math.PI*h+Math.PI/2);void 0===k&&(k=8);h=Math.pow(2,-k);d=0+1*((Math.pow(2,k*a/d-k)-h)/(1-h));return b+c*(1+-1*g*d)}function ic(a,b,c,d,g){void 0===g&&(g=1.70158);a=(1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2);return b+c*a}
function jc(a,b,c,d,g){a=ic(d-a,1,-1,d,g);return b+c*a}
function kc(a){switch(1){case 0:return function(b,c,d,g,h,k,m){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,m)};case 1:return function(b,c,d,g,h,k,m){return a(b-Math.floor(b/g)*g,c,d,g,h,k,m)};case 2:return function(b,c,d,g,h,k,m){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,m):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,m);return c+d*b};case 3:return function(b,c,d,g,h,k,m){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,m);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,m){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,m);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,m){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,m):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,m);return c+d*(n+b)};default:return function(b,c,d,g,h,k,m){return a(b,c,d,g,h,k,m)}}}
function lc(a,b,c){var d,g=0,h=1,k=[0],m=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)m.push(m[d]+c[d]),g=a[d]===$b?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,v,z,I,t,u){var w,x;w=a.length-1;for(x=0;x<a.length;x+=1)if(d/z<=m[x+1]){w=x;break}d=a[w](d/z-m[w],0,1,c[w],I,t,u);b[w]&&(d=-d);return g+(k[w]+d)*v/h}}
var J=window.TG_InitSettings||{};J.size=void 0!==J.size?J.size:"big";J.lu=J.usesFullScreen;J.zp="big"===J.size?1:.5;J.kg=20;J.lg=10;J.Lr=0;J.ql=-10;J.mg=-20;J.Rc=-30;J.Ee=-40;
function K(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(J.zp*a);break a;case "round":c=Math.round(J.zp*a);break a;default:c=J.zp*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=K(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=K(a[c],b));return a}}function L(a){return"big"===J.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}var M=M||{};M["nl-nl"]=M["nl-nl"]||{};
M["nl-nl"].TutorialTitle_01="Ketenen";M["nl-nl"].TutorialText_01="Keten 3 of meer monsters van dezelfde kleur om ze te verslaan.";M["nl-nl"].TutorialTitle_02="Ketenen";M["nl-nl"].TutorialText_02="#touch{Klik}{Tik} op een monster om hem te verslepen en een keten te maken.";M["nl-nl"].TutorialTitle_03="Ketenen";M["nl-nl"].TutorialText_03="Sommige voorwerpen worden vernietigd wanneer een naastgelegen monster wordt verslagen.";M["nl-nl"].TutorialTitle_04="Doelen";M["nl-nl"].TutorialText_04="Levels kunnen allerlei doelen hebben.";
M["nl-nl"].TutorialTitle_05="Doelen";M["nl-nl"].TutorialText_05="Scoor genoeg punten om deze levels te winnen.";M["nl-nl"].TutorialTitle_06="Doelen";M["nl-nl"].TutorialText_06="Leid genoeg diamanten naar de onderkant van het veld om het level te voltooien.";M["nl-nl"].TutorialTitle_07="Doelen";M["nl-nl"].TutorialText_07="Verwijder het slijm van deze tegels door het monster dat erop staat te verslaan.";M["nl-nl"].TutorialTitle_08="Doelen";M["nl-nl"].TutorialText_08="Bevrijd de varkens uit de kooien door een naastgelegen monster te verslaan.";
M["nl-nl"].TutorialTitle_09="Doelen";M["nl-nl"].TutorialText_09="Kloners vermenigvuldigen zich. Versla een naastgelegen monster om de kloner te vernietigen!";M["nl-nl"].TutorialTitle_10="Power-ups.";M["nl-nl"].TutorialText_10="Maak langere ketens om een power-up te verdienen.";M["nl-nl"].TutorialTitle_11="Power-ups.";M["nl-nl"].TutorialText_11="Deze power-ups verwijderen een hele rij of kolom.";M["nl-nl"].TutorialTitle_12="Power-ups.";M["nl-nl"].TutorialText_12="Deze power-ups verslaan alle nabijgelegen monsters.";
M["nl-nl"].TutorialTitle_13="Power-ups.";M["nl-nl"].TutorialText_13="Dankzij deze power-up kun je monsters van verschillende kleuren ketenen.";M["nl-nl"].TutorialTitle_14="Zetten";M["nl-nl"].TutorialText_14="In de meeste levels krijg je maar een beperkt aantal zetten. Voltooi het level voor je zetten op zijn.";M["nl-nl"].LevelGoalScore="Scoor <TARGET> punten om het level te voltooien!";M["nl-nl"].LevelGoalDiamond="Verzamel <TARGET> diamanten om het level te voltooien!";
M["nl-nl"].LevelGoalCloner="Versla alle kloners om het level te voltooien!";M["nl-nl"].LevelGoalGuard="Bevrijd <TARGET> varkens om het level te voltooien!";M["nl-nl"].LevelGoalSludge="Verwijder al het slijm om het level te voltooien!";M["nl-nl"].LevelStartHeader="Doel";M["nl-nl"].LevelCompleted="Level voltooid!";M["nl-nl"].NoMoves="Geen zetten meer!";M["nl-nl"].FrenzyStart="Combo Crusade!";M["nl-nl"].MovesLeft="Zetten";M["nl-nl"].levelMapScreenWorld_1="Levels 7-12";
M["nl-nl"].levelMapScreenWorld_2="Levels 13-18";M["nl-nl"].levelMapScreenWorld_3="Levels 19-24";M["nl-nl"].levelMapScreenWorld_4="Levels 25-30";M["nl-nl"].levelMapScreenWorld_5="Levels 31-36";M["nl-nl"].levelMapScreenWorld_6="Levels 37-42";M["nl-nl"].levelMapScreenWorld_7="Levels 43-48";M["en-us"]=M["en-us"]||{};M["en-us"].TutorialTitle_01="Chaining";M["en-us"].TutorialText_01="Chain 3 or more monsters of the same color to defeat them.";M["en-us"].TutorialTitle_02="Chaining";
M["en-us"].TutorialText_02="#touch{Click}{Tap} on a monster and drag it to create a chain.";M["en-us"].TutorialTitle_03="Chaining";M["en-us"].TutorialText_03="Some items will be destroyed when a nearby monster is defeated.";M["en-us"].TutorialTitle_04="Goals";M["en-us"].TutorialText_04="Levels can have different goals.";M["en-us"].TutorialTitle_05="Goals";M["en-us"].TutorialText_05="Score enough points to win these levels.";M["en-us"].TutorialTitle_06="Goals";M["en-us"].TutorialText_06="Get enough diamonds to the bottom of the field to complete the level.";
M["en-us"].TutorialTitle_07="Goals";M["en-us"].TutorialText_07="Remove the slime from these tiles by defeating a monster that is standing in it.";M["en-us"].TutorialTitle_08="Goals";M["en-us"].TutorialText_08="Free the pigs from the cages by defeating a monster nearby.";M["en-us"].TutorialTitle_09="Goals";M["en-us"].TutorialText_09="Cloners can multiply. Defeat a monster nearby to get rid of it!";M["en-us"].TutorialTitle_10="Power-ups.";M["en-us"].TutorialText_10="Create longer chains for the chance to gain a power-up.";
M["en-us"].TutorialTitle_11="Power-ups.";M["en-us"].TutorialText_11="These power-ups will remove an entire row or column.";M["en-us"].TutorialTitle_12="Power-ups.";M["en-us"].TutorialText_12="These power-ups will get rid of all nearby monsters.";M["en-us"].TutorialTitle_13="Power-ups.";M["en-us"].TutorialText_13="This power-up allows you to chain different colored monsters.";M["en-us"].TutorialTitle_14="Moves";M["en-us"].TutorialText_14="In most levels you will only have a limited number of moves! Complete the level before you run out.";
M["en-us"].LevelGoalScore="Score <TARGET> points to complete the level!";M["en-us"].LevelGoalDiamond="Collect <TARGET> gems to complete the level!";M["en-us"].LevelGoalCloner="Defeat all the Cloners to complete the level!";M["en-us"].LevelGoalGuard="Free <TARGET> Pigs to complete the level!";M["en-us"].LevelGoalSludge="Clear all the slime to complete the level!";M["en-us"].LevelStartHeader="Goal";M["en-us"].LevelCompleted="Level completed!";M["en-us"].NoMoves="Out of moves!";
M["en-us"].FrenzyStart="Combo Crusade!";M["en-us"].MovesLeft="Moves left";M["en-us"].levelMapScreenWorld_1="Levels 7-12";M["en-us"].levelMapScreenWorld_2="Levels 13-18";M["en-us"].levelMapScreenWorld_3="Levels 19-24";M["en-us"].levelMapScreenWorld_4="Levels 25-30";M["en-us"].levelMapScreenWorld_5="Levels 31-36";M["en-us"].levelMapScreenWorld_6="Levels 37-42";M["en-us"].levelMapScreenWorld_7="Levels 43-48";M["de-de"]=M["de-de"]||{};M["de-de"].TutorialTitle_01="Ketten";M["de-de"].TutorialText_01="Verkette drei oder mehr Monster derselben Farbe, um sie zu besiegen.";
M["de-de"].TutorialTitle_02="Ketten";M["de-de"].TutorialText_02="#touch{Klicke}{Tippe} auf ein Monster und ziehe es, um eine Kette zu bauen.";M["de-de"].TutorialTitle_03="Ketten";M["de-de"].TutorialText_03="Einige Objekte werden zerst\u00f6rt, wenn du in seiner N\u00e4he ein Monster besiegst.";M["de-de"].TutorialTitle_04="Ziele";M["de-de"].TutorialText_04="Levels k\u00f6nnen unterschiedliche Ziele haben.";M["de-de"].TutorialTitle_05="Ziele";M["de-de"].TutorialText_05="Erziele gen\u00fcgend Punkte, um diese Levels erfolgreich abzuschlie\u00dfen.";
M["de-de"].TutorialTitle_06="Ziele";M["de-de"].TutorialText_06="Bring gen\u00fcgend Diamanten zum unteren Bildschirmrand, um das Level abzuschlie\u00dfen.";M["de-de"].TutorialTitle_07="Ziele";M["de-de"].TutorialText_07="Entferne den Schleim von diesen Feldern, indem du ein Monster besiegst, das darin steht.";M["de-de"].TutorialTitle_08="Ziele";M["de-de"].TutorialText_08="Befreie die Schweinchen aus den K\u00e4figen, indem du in ihrer N\u00e4he ein Monster besiegst.";M["de-de"].TutorialTitle_09="Ziele";
M["de-de"].TutorialText_09="Cloner k\u00f6nnen sich vermehren. Besiege in der N\u00e4he ein Monster, um sie loszuwerden.";M["de-de"].TutorialTitle_10="Extras.";M["de-de"].TutorialText_10="Bilde l\u00e4ngere Ketten, dann erh\u00f6ht sich die Chance, ein Extra zu erhalten.";M["de-de"].TutorialTitle_11="Extras.";M["de-de"].TutorialText_11="Diese Extras entfernen eine komplette Reihe oder Spalte.";M["de-de"].TutorialTitle_12="Extras.";M["de-de"].TutorialText_12="Diese Extras entfernen alle in der N\u00e4he befindlichen Monster.";
M["de-de"].TutorialTitle_13="Extras.";M["de-de"].TutorialText_13="Mit diesem Extra kannst du zwei verschiedenfarbige Monster miteinander verketten.";M["de-de"].TutorialTitle_14="Z\u00fcge";M["de-de"].TutorialText_14="In den meisten Levels hast du nur eine begrenzte Anzahl Z\u00fcge zur Verf\u00fcgung. Schlie\u00df das Level ab, bevor dir die Z\u00fcge ausgehen.";M["de-de"].LevelGoalScore="Erziele <TARGET> Punkte, um das Level abzuschlie\u00dfen.";M["de-de"].LevelGoalDiamond="Sammle <TARGET> Edelsteine, um das Level abzuschlie\u00dfen.";
M["de-de"].LevelGoalCloner="Besiege alle Cloner, um das Level abzuschlie\u00dfen!";M["de-de"].LevelGoalGuard="Befreie <TARGET> Schweinchen, um das Level abzuschlie\u00dfen.";M["de-de"].LevelGoalSludge="Entferne den gesamten Schleim, um das Level abzuschlie\u00dfen.";M["de-de"].LevelStartHeader="Ziel";M["de-de"].LevelCompleted="Level abgeschlossen!";M["de-de"].NoMoves="Keine Z\u00fcge mehr!";M["de-de"].FrenzyStart="Combo Crusade!";M["de-de"].MovesLeft="Verbleibende Z\u00fcge";
M["de-de"].levelMapScreenWorld_1="Levels 7-12";M["de-de"].levelMapScreenWorld_2="Levels 13-18";M["de-de"].levelMapScreenWorld_3="Levels 19-24";M["de-de"].levelMapScreenWorld_4="Levels 25-30";M["de-de"].levelMapScreenWorld_5="Levels 31-36";M["de-de"].levelMapScreenWorld_6="Levels 37-42";M["de-de"].levelMapScreenWorld_7="Levels 43-48";M["fr-fr"]=M["fr-fr"]||{};M["fr-fr"].TutorialTitle_01="S\u00e9rie";M["fr-fr"].TutorialText_01="Alignez 3\u00a0monstres de la m\u00eame couleur ou plus pour les vaincre.";
M["fr-fr"].TutorialTitle_02="S\u00e9rie";M["fr-fr"].TutorialText_02="#touch{Cliquez sur}{Touchez} un monstre et faites-le glisser pour former une s\u00e9rie.";M["fr-fr"].TutorialTitle_03="S\u00e9rie";M["fr-fr"].TutorialText_03="Certains objets seront d\u00e9truits si un monstre est d\u00e9truit \u00e0 proximit\u00e9.";M["fr-fr"].TutorialTitle_04="Objectifs";M["fr-fr"].TutorialText_04="Il peut y avoir plusieurs objectifs par niveau.";M["fr-fr"].TutorialTitle_05="Objectifs";
M["fr-fr"].TutorialText_05="Marquez assez de points pour gagner dans ces niveaux.";M["fr-fr"].TutorialTitle_06="Objectifs";M["fr-fr"].TutorialText_06="Rassemblez suffisamment de diamants en bas de la grille pour terminer le niveau.";M["fr-fr"].TutorialTitle_07="Objectifs";M["fr-fr"].TutorialText_07="Supprimez la gel\u00e9e sur ces cases en \u00e9liminant les monstres qui sont dessus.";M["fr-fr"].TutorialTitle_08="Objectifs";M["fr-fr"].TutorialText_08="Lib\u00e9rez les cochons de leurs cages en \u00e9liminant un monstre \u00e0 proximit\u00e9.";
M["fr-fr"].TutorialTitle_09="Objectifs";M["fr-fr"].TutorialText_09="Les cloneurs peuvent se multiplier. \u00c9liminez un monstre \u00e0 proximit\u00e9 pour vous en d\u00e9barrasser\u00a0!";M["fr-fr"].TutorialTitle_10="Bonus";M["fr-fr"].TutorialText_10="Cr\u00e9ez des s\u00e9ries plus longues pour avoir une chance d'obtenir un bonus.";M["fr-fr"].TutorialTitle_11="Bonus";M["fr-fr"].TutorialText_11="Ces bonus peuvent supprimer une ligne ou une colonne enti\u00e8re.";M["fr-fr"].TutorialTitle_12="Bonus";
M["fr-fr"].TutorialText_12="Ces bonus peuvent \u00e9liminer les monstres \u00e0 proximit\u00e9.";M["fr-fr"].TutorialTitle_13="Bonus";M["fr-fr"].TutorialText_13="Ce bonus vous permet d'aligner des monstres de diff\u00e9rentes couleurs.";M["fr-fr"].TutorialTitle_14="D\u00e9placements";M["fr-fr"].TutorialText_14="Dans la plupart des niveaux, vous ne disposez que d'une quantit\u00e9 limit\u00e9e de d\u00e9placements\u00a0! Terminez le niveau avant qu'ils soient \u00e9puis\u00e9s.";
M["fr-fr"].LevelGoalScore="Marquez <TARGET> points pour terminer le niveau\u00a0!";M["fr-fr"].LevelGoalDiamond="R\u00e9cup\u00e9rez <TARGET> gemmes pour terminer le niveau\u00a0!";M["fr-fr"].LevelGoalCloner="\u00c9liminez tous les cloneurs pour terminer le niveau\u00a0!";M["fr-fr"].LevelGoalGuard="Lib\u00e9rez <TARGET> cochons pour terminer le niveau\u00a0!";M["fr-fr"].LevelGoalSludge="Supprimez toute la gel\u00e9e pour terminer le niveau\u00a0!";M["fr-fr"].LevelStartHeader="Objectif";
M["fr-fr"].LevelCompleted="Niveau termin\u00e9\u00a0!";M["fr-fr"].NoMoves="Plus de d\u00e9placements\u00a0!";M["fr-fr"].FrenzyStart="Combo Crusade\u00a0!";M["fr-fr"].MovesLeft="D\u00e9placements restants";M["fr-fr"].levelMapScreenWorld_1="Niveaux 7-12";M["fr-fr"].levelMapScreenWorld_2="Niveaux 13-18";M["fr-fr"].levelMapScreenWorld_3="Niveaux 19-24";M["fr-fr"].levelMapScreenWorld_4="Niveaux 25-30";M["fr-fr"].levelMapScreenWorld_5="Niveaux 31-36";M["fr-fr"].levelMapScreenWorld_6="Niveaux 37-42";
M["fr-fr"].levelMapScreenWorld_7="Niveaux 43-48";M["pt-pt"]=M["pt-pt"]||{};M["pt-pt"].TutorialTitle_01="Combo";M["pt-pt"].TutorialText_01="Combo de 3 ou mais monstros da mesma cor para derrot\u00e1-los.";M["pt-pt"].TutorialTitle_02="Combo";M["pt-pt"].TutorialText_02="#touch {Clica} {Toca} Toca num monstro e arrast\u00e1-lo para criar uma combo.";M["pt-pt"].TutorialTitle_03="Combo";M["pt-pt"].TutorialText_03="Alguns itens ser\u00e3o destru\u00eddos quando um monstro nas proximidades \u00e9 derrotado.";
M["pt-pt"].TutorialTitle_04="Objectivos";M["pt-pt"].TutorialText_04="Os n\u00edveis t\u00eam objectivos diferntes";M["pt-pt"].TutorialTitle_05="Objectivos";M["pt-pt"].TutorialText_05="Ganha pontos suficientes para passares este n\u00edvel";M["pt-pt"].TutorialTitle_06="Objectivos";M["pt-pt"].TutorialText_06="Obt\u00e9m diamantes suficientes para a parte inferior do campo para completares o n\u00edvel.";M["pt-pt"].TutorialTitle_07="Objectivos";M["pt-pt"].TutorialText_07="Remove o lodo a partir destas telhas, derrotando um monstro que est\u00e1 em p\u00e9 na mesma.";
M["pt-pt"].TutorialTitle_08="Objectivos";M["pt-pt"].TutorialText_08="Liberta os porcos das gaiolas, derrotando um monstro nas proximidades.";M["pt-pt"].TutorialTitle_09="Objectivos";M["pt-pt"].TutorialText_09="Cloners podem multiplicar-se. Derrota um monstro nas proximidades para te livrares dele!";M["pt-pt"].TutorialTitle_10="Power-ups";M["pt-pt"].TutorialText_10="Cria combos longos para ganhares power-up.";M["pt-pt"].TutorialTitle_11="Power-ups";M["pt-pt"].TutorialText_11="Estes power-up v\u00e3o remover uma linha ou uma coluna.";
M["pt-pt"].TutorialTitle_12="Power-ups";M["pt-pt"].TutorialText_12="Estes power-ups v\u00e3o-se livrar de todos os monstros nas proximidades.";M["pt-pt"].TutorialTitle_13="Power-ups";M["pt-pt"].TutorialText_13="Estes power-up d\u00e3o a hip\u00f3tese de fazeres uma combo de monstros de diferentes cores.";M["pt-pt"].TutorialTitle_14="Movimentos";M["pt-pt"].TutorialText_14="Na maioria dos n\u00edveis ter\u00e1s apenas um n\u00famero limitado de movimentos! Completa o n\u00edvel antes que acabe.";
M["pt-pt"].LevelGoalScore="Pontua\u00e7\u00e3o <TARGET> pontos para completar o n\u00edvel!";M["pt-pt"].LevelGoalDiamond="Apanha <TARGET> gemas para completares o n\u00edvel!";M["pt-pt"].LevelGoalCloner="Derrota todos os Cloners para completares o n\u00edvel!";M["pt-pt"].LevelGoalGuard="Liberta <TARGET> porcos para completares o n\u00edvel!";M["pt-pt"].LevelGoalSludge="Limpa todo o lodo para completares o n\u00edvel!";M["pt-pt"].LevelStartHeader="Objectivo";M["pt-pt"].LevelCompleted="N\u00edvel completo!";
M["pt-pt"].NoMoves="Sem movimentos!";M["pt-pt"].FrenzyStart="Cruzada de Combos!";M["pt-pt"].MovesLeft="Movimentos:";M["pt-pt"].levelMapScreenWorld_1="N\u00edveis 7-12";M["pt-pt"].levelMapScreenWorld_2="N\u00edveis 13-18";M["pt-pt"].levelMapScreenWorld_3="N\u00edveis 19-24";M["pt-pt"].levelMapScreenWorld_4="N\u00edveis 25-30";M["pt-pt"].levelMapScreenWorld_5="N\u00edveis 31-36";M["pt-pt"].levelMapScreenWorld_6="N\u00edveis 37-42";M["pt-pt"].levelMapScreenWorld_7="N\u00edveis 43-48";
M["pt-br"]=M["pt-br"]||{};M["pt-br"].TutorialTitle_01="Sequ\u00eancia";M["pt-br"].TutorialText_01="Fa\u00e7a uma sequ\u00eancia de 3 ou mais monstros da mesma cor para elimin\u00e1-los.";M["pt-br"].TutorialTitle_02="Sequ\u00eancia";M["pt-br"].TutorialText_02="#touch{Clique}{Toque} em um monstro e arraste-o para criar uma sequ\u00eancia.";M["pt-br"].TutorialTitle_03="Sequ\u00eancia";M["pt-br"].TutorialText_03="Alguns itens s\u00e3o destru\u00eddos quando um monstro pr\u00f3ximo \u00e9 eliminado.";
M["pt-br"].TutorialTitle_04="Objetivos";M["pt-br"].TutorialText_04="As fases podem ter diferentes objetivos.";M["pt-br"].TutorialTitle_05="Objetivos";M["pt-br"].TutorialText_05="Fa\u00e7a pontos suficientes para passar de fase.";M["pt-br"].TutorialTitle_06="Objetivos";M["pt-br"].TutorialText_06="Leve diamantes suficientes ao fundo do tabuleiro para passar de fase.";M["pt-br"].TutorialTitle_07="Objetivos";M["pt-br"].TutorialText_07="Remova a gosma destes campos eliminando o monstro que estiver dentro deles.";
M["pt-br"].TutorialTitle_08="Objetivos";M["pt-br"].TutorialText_08="Liberte os porcos das jaulas eliminando um monstro que estiver pr\u00f3ximo.";M["pt-br"].TutorialTitle_09="Objetivos";M["pt-br"].TutorialText_09="Clonadores podem se multiplicar. Elimine-os derrotando um monstro que estiver pr\u00f3ximo!";M["pt-br"].TutorialTitle_10="Power-ups.";M["pt-br"].TutorialText_10="Crie sequ\u00eancias maiores para ter a chance de ganhar um poder.";M["pt-br"].TutorialTitle_11="Poderes";
M["pt-br"].TutorialText_11="Estes poderes removem uma linha ou uma coluna inteira.";M["pt-br"].TutorialTitle_12="Poderes";M["pt-br"].TutorialText_12="Estes poderes eliminam todos os monstros que estiverem pr\u00f3ximos.";M["pt-br"].TutorialTitle_13="Poderes";M["pt-br"].TutorialText_13="Este poderes permite sequ\u00eancias com monstros de cores diferentes.";M["pt-br"].TutorialTitle_14="A\u00e7\u00f5es";M["pt-br"].TutorialText_14="Na maioria das fases, voc\u00ea tem apenas um n\u00famero limitado de a\u00e7\u00f5es! Passe de fase antes que as a\u00e7\u00f5es acabem.";
M["pt-br"].LevelGoalScore="Fa\u00e7a <TARGET> pontos para passar de fase!";M["pt-br"].LevelGoalDiamond="Obtenha <TARGET> joias para passar de fase!";M["pt-br"].LevelGoalCloner="Elimine todos os Clonadores para passar de fase!";M["pt-br"].LevelGoalGuard="Liberte <TARGET> porcos para passar de fase!";M["pt-br"].LevelGoalSludge="Elimine toda a gosma para passar de fase!";M["pt-br"].LevelStartHeader="Objetivo";M["pt-br"].LevelCompleted="Fase conclu\u00edda!";M["pt-br"].NoMoves="N\u00e3o h\u00e1 mais a\u00e7\u00f5es!";
M["pt-br"].FrenzyStart="Combo Crusade!";M["pt-br"].MovesLeft="A\u00e7\u00f5es restantes";M["pt-br"].levelMapScreenWorld_1="Fases  7 a 12";M["pt-br"].levelMapScreenWorld_2="Fases  13 a 18";M["pt-br"].levelMapScreenWorld_3="Fases  19 a 24";M["pt-br"].levelMapScreenWorld_4="Fases  25 a 30";M["pt-br"].levelMapScreenWorld_5="Fases  31 a 36";M["pt-br"].levelMapScreenWorld_6="Fases  37 a 42";M["pt-br"].levelMapScreenWorld_7="Fases  43 a 48";M["es-es"]=M["es-es"]||{};M["es-es"].TutorialTitle_01="Cadenas";
M["es-es"].TutorialText_01="Encadena tres o m\u00e1s monstruos del mismo color para eliminarlos.";M["es-es"].TutorialTitle_02="Cadenas";M["es-es"].TutorialText_02="#touch{Haz clic en}{Toca} un monstruo y arr\u00e1stralo para crear una cadena.";M["es-es"].TutorialTitle_03="Cadenas";M["es-es"].TutorialText_03="Algunos objetos se destruir\u00e1n cuando un monstruo cercano sea eliminado.";M["es-es"].TutorialTitle_04="Objetivos";M["es-es"].TutorialText_04="Los niveles pueden tener diferentes objetivos.";
M["es-es"].TutorialTitle_05="Objetivos";M["es-es"].TutorialText_05="Consigue suficientes puntos para superar estos niveles.";M["es-es"].TutorialTitle_06="Objetivos";M["es-es"].TutorialText_06="Lleva suficientes gemas al fondo de la pantalla para completar el nivel.";M["es-es"].TutorialTitle_07="Objetivos";M["es-es"].TutorialText_07="Limpia el cieno de estas celdas eliminando los monstruos que hay en ellas.";M["es-es"].TutorialTitle_08="Objetivos";M["es-es"].TutorialText_08="Libera a los cerdos de las jaulas eliminando al monstruo que est\u00e9 cerca.";
M["es-es"].TutorialTitle_09="Objetivos";M["es-es"].TutorialText_09="Los Clonadores pueden multiplicarse. \u00a1Elimina al monstruo que est\u00e9 cerca para deshacerte de ellos!";M["es-es"].TutorialTitle_10="Potenciadores.";M["es-es"].TutorialText_10="Crea cadenas m\u00e1s largas para ganar habilidades.";M["es-es"].TutorialTitle_11="Potenciadores.";M["es-es"].TutorialText_11="Estos potenciadores eliminar\u00e1n una fila o una columna completa.";M["es-es"].TutorialTitle_12="Potenciadores.";
M["es-es"].TutorialText_12="Estos potenciadores te librar\u00e1n de los monstruos cercanos.";M["es-es"].TutorialTitle_13="Potenciadores.";M["es-es"].TutorialText_13="Este potenciador te permite encadenar monstruos de diferentes colores.";M["es-es"].TutorialTitle_14="Movimientos";M["es-es"].TutorialText_14="\u00a1En muchos niveles, tienes movimientos limitados! Completa el nivel antes de que se te acaben.";M["es-es"].LevelGoalScore="\u00a1Consigue <TARGET> puntos para superar el nivel!";
M["es-es"].LevelGoalDiamond="\u00a1Acumula <TARGET> gemas para superar el nivel!";M["es-es"].LevelGoalCloner="\u00a1Elimina a todos los Clonadores para superar el nivel!";M["es-es"].LevelGoalGuard="\u00a1Libera <TARGET> cerdos para superar el nivel!";M["es-es"].LevelGoalSludge="\u00a1Limpia el cieno para superar el nivel!";M["es-es"].LevelStartHeader="Objetivo";M["es-es"].LevelCompleted="\u00a1Nivel superado!";M["es-es"].NoMoves="\u00a1Sin movimientos!";M["es-es"].FrenzyStart="\u00a1Cruzada de Combos!";
M["es-es"].MovesLeft="Movimientos ";M["es-es"].levelMapScreenWorld_1="Niveles 7-12";M["es-es"].levelMapScreenWorld_2="Niveles 13-18";M["es-es"].levelMapScreenWorld_3="Niveles 19-24";M["es-es"].levelMapScreenWorld_4="Niveles 25-30";M["es-es"].levelMapScreenWorld_5="Niveles 31-36";M["es-es"].levelMapScreenWorld_6="Niveles 37-42";M["es-es"].levelMapScreenWorld_7="Niveles 43-48";M["tr-tr"]=M["tr-tr"]||{};M["tr-tr"].TutorialTitle_01="Zincirleme";M["tr-tr"].TutorialText_01="Ayn\u0131 renkteki yarat\u0131klardan 3 veya daha fazlas\u0131n\u0131 toplayarak defet.";
M["tr-tr"].TutorialTitle_02="Zincirleme";M["tr-tr"].TutorialText_02="Zincir yaratmak i\u00e7in yarat\u0131\u011fa #touch{t\u0131kla}{dokun} ve s\u00fcr\u00fckle.";M["tr-tr"].TutorialTitle_03="Zincirleme";M["tr-tr"].TutorialText_03="Yak\u0131n\u0131nda bir yarat\u0131k defedilen baz\u0131 nesneler yok olur.";M["tr-tr"].TutorialTitle_04="Ama\u00e7lar";M["tr-tr"].TutorialText_04="B\u00f6l\u00fcmlerin de\u011fi\u015fik ama\u00e7lar\u0131 vard\u0131r.";M["tr-tr"].TutorialTitle_05="Ama\u00e7lar";
M["tr-tr"].TutorialText_05="Bu b\u00f6l\u00fcmleri ge\u00e7mek i\u00e7in yeterli puan\u0131n olmal\u0131.";M["tr-tr"].TutorialTitle_06="Ama\u00e7lar";M["tr-tr"].TutorialText_06="B\u00f6l\u00fcm\u00fc ge\u00e7mek i\u00e7in alan\u0131n alt\u0131ndaki elmaslara eri\u015fmelisin.";M["tr-tr"].TutorialTitle_07="Ama\u00e7lar";M["tr-tr"].TutorialText_07="\u00c7amuru yoketmek i\u00e7in i\u00e7indeki yarat\u0131\u011f\u0131 defetmelisin.";M["tr-tr"].TutorialTitle_08="Ama\u00e7lar";
M["tr-tr"].TutorialText_08="Kafeslerdeki domuzlar\u0131 kurtarmak i\u00e7in yanlar\u0131nda bir yarat\u0131k defet.";M["tr-tr"].TutorialTitle_09="Ama\u00e7lar";M["tr-tr"].TutorialText_09="Klonlar \u00e7o\u011falabilir. Onlar\u0131 postalamak i\u00e7in yanlar\u0131nda bir yarat\u0131k defet!";M["tr-tr"].TutorialTitle_10="G\u00fc\u00e7lendiriciler";M["tr-tr"].TutorialText_10="Daha uzun zincirler yaratt\u0131\u011f\u0131nda g\u00fc\u00e7lendirici kazanabilirsin.";M["tr-tr"].TutorialTitle_11="G\u00fc\u00e7lendiriciler";
M["tr-tr"].TutorialText_11="Bu g\u00fc\u00e7lendiriciler bir s\u00fctun veya s\u0131ray\u0131 tamamen yokedebilir.";M["tr-tr"].TutorialTitle_12="G\u00fc\u00e7lendiriciler";M["tr-tr"].TutorialText_12="Bu g\u00fc\u00e7lendiriciler yak\u0131nlardaki t\u00fcm yarat\u0131klar\u0131 yokeder.";M["tr-tr"].TutorialTitle_13="G\u00fc\u00e7lendiriciler";M["tr-tr"].TutorialText_13="Bu g\u00fc\u00e7lendirici, farkl\u0131 renkteki yarat\u0131klar\u0131 e\u015fleyebilmeni sa\u011flar.";
M["tr-tr"].TutorialTitle_14="Ad\u0131m Say\u0131s\u0131";M["tr-tr"].TutorialText_14="\u00c7o\u011fu b\u00f6l\u00fcmde s\u0131n\u0131rl\u0131 say\u0131da ad\u0131m\u0131n vard\u0131r! Hepsini harcamadan b\u00f6l\u00fcm\u00fc bitir.";M["tr-tr"].LevelGoalScore="B\u00f6l\u00fcm\u00fc bitirmek i\u00e7in <TARGET> puan topla!";M["tr-tr"].LevelGoalDiamond="B\u00f6l\u00fcm\u00fc bitirmek i\u00e7in <TARGET> m\u00fccevher topla!";M["tr-tr"].LevelGoalCloner="B\u00f6l\u00fcm\u00fc bitirmek i\u00e7in t\u00fcm Klonlar\u0131 postala!";
M["tr-tr"].LevelGoalGuard="B\u00f6l\u00fcm\u00fc bitirmek i\u00e7in <TARGET> domuzu serbest b\u0131rak!";M["tr-tr"].LevelGoalSludge="B\u00f6l\u00fcm\u00fc bitirmek i\u00e7in t\u00fcm \u00e7amurlar\u0131 temizle!";M["tr-tr"].LevelStartHeader="Ama\u00e7";M["tr-tr"].LevelCompleted="B\u00f6l\u00fcm tamamland\u0131!";M["tr-tr"].NoMoves="Ad\u0131m kalmad\u0131!";M["tr-tr"].FrenzyStart="Combo Delisi!";M["tr-tr"].MovesLeft="Kalan ad\u0131mlar";M["tr-tr"].levelMapScreenWorld_1="B\u00f6l\u00fcm 7-12";
M["tr-tr"].levelMapScreenWorld_2="B\u00f6l\u00fcm 13-18";M["tr-tr"].levelMapScreenWorld_3="B\u00f6l\u00fcm 19-24";M["tr-tr"].levelMapScreenWorld_4="B\u00f6l\u00fcm 25-30";M["tr-tr"].levelMapScreenWorld_5="B\u00f6l\u00fcm 31-36";M["tr-tr"].levelMapScreenWorld_6="B\u00f6l\u00fcm 37-42";M["tr-tr"].levelMapScreenWorld_7="B\u00f6l\u00fcm 43-48";M["ru-ru"]=M["ru-ru"]||{};M["ru-ru"].TutorialTitle_01="\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0446\u0435\u043f\u0438";M["ru-ru"].TutorialText_01="\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u0446\u0435\u043f\u044c \u0438\u0437 3 \u0438\u043b\u0438 \u0431\u043e\u043b\u0435\u0435 \u043c\u043e\u043d\u0441\u0442\u0440\u043e\u0432 \u043e\u0434\u043d\u043e\u0433\u043e \u0438 \u0442\u043e\u0433\u043e \u0436\u0435 \u0446\u0432\u0435\u0442\u0430, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0431\u0435\u0434\u0438\u0442\u044c \u0438\u0445.";
M["ru-ru"].TutorialTitle_02="\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0446\u0435\u043f\u0438";M["ru-ru"].TutorialText_02="\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u043c\u043e\u043d\u0441\u0442\u0440\u0430 \u0438 \u0442\u044f\u043d\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0446\u0435\u043f\u044c";M["ru-ru"].TutorialTitle_03="\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0446\u0435\u043f\u0438";
M["ru-ru"].TutorialText_03="\u041d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043f\u0440\u0435\u0436\u0434\u043c\u0435\u0442\u044b \u043f\u043e\u0431\u043b\u0438\u0437\u043e\u0441\u0442\u0438 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u0443\u043d\u0438\u0447\u0442\u043e\u0436\u0435\u043d\u044b \u0432\u0437\u0440\u044b\u0432\u043e\u043c \u043c\u043e\u043d\u0441\u0442\u0440\u043e\u0432";M["ru-ru"].TutorialTitle_04="\u0426\u0435\u043b\u0438";M["ru-ru"].TutorialText_04="\u0423\u0440\u043e\u0432\u043d\u0438 \u043c\u043e\u0433\u0443\u0442 \u0438\u043c\u0435\u0442\u044c \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u044b\u0435 \u0446\u0435\u043b\u0438";
M["ru-ru"].TutorialTitle_05="\u0426\u0435\u043b\u0438";M["ru-ru"].TutorialText_05="\u041d\u0430\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u043e\u0447\u043a\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u044d\u0442\u0438 \u0443\u0440\u043e\u0432\u043d\u0438";M["ru-ru"].TutorialTitle_06="\u0426\u0435\u043b\u0438";M["ru-ru"].TutorialText_06="\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u0440\u0430\u0433\u043e\u0446\u0435\u043d\u043d\u043e\u0441\u0442\u0435\u0439 \u0441\u043d\u0438\u0437\u0443 \u043f\u043e\u043b\u044f, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";
M["ru-ru"].TutorialTitle_07="\u0426\u0435\u043b\u0438";M["ru-ru"].TutorialText_07="\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u0441\u043b\u0438\u0437\u044c \u0441 \u044d\u0442\u0438\u0445 \u043f\u043b\u0438\u0442\u043e\u043a, \u043f\u043e\u0431\u0435\u0434\u0438\u0432 \u043c\u043e\u043d\u0441\u0442\u0440\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0441\u0442\u043e\u0438\u0442 \u043d\u0430 \u043d\u0438\u0445";M["ru-ru"].TutorialTitle_08="\u0426\u0435\u043b\u0438";
M["ru-ru"].TutorialText_08="\u041e\u0441\u0432\u043e\u0431\u043e\u0434\u0438\u0442\u0435 \u0441\u0432\u0438\u043d\u0435\u0439 \u0438\u0437 \u043a\u043b\u0435\u0442\u043e\u043a, \u043f\u043e\u0431\u0435\u0434\u0438\u0432 \u043c\u043e\u043d\u0441\u0442\u0440\u0430 \u0440\u044f\u0434\u043e\u043c.";M["ru-ru"].TutorialTitle_09="\u0426\u0435\u043b\u0438";M["ru-ru"].TutorialText_09="\u041a\u043b\u043e\u043d\u0435\u0440\u044b \u0443\u043c\u0435\u044e\u0442 \u0440\u0430\u0437\u043c\u043d\u043e\u0436\u0430\u0442\u044c\u0441\u044f. \u041f\u043e\u0431\u0435\u0434\u0438\u0442\u0435 \u043c\u043e\u043d\u0441\u0442\u0440\u0430 \u043f\u043e\u0431\u043b\u0438\u0437\u043e\u0441\u0442\u0438, \u0447\u0442\u043e\u0431\u044b \u0438\u0437\u0431\u0430\u0432\u0438\u0442\u044c\u0441\u044f \u043e\u0442 \u043d\u0438\u0445!";
M["ru-ru"].TutorialTitle_10="\u0423\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438";M["ru-ru"].TutorialText_10="\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u0434\u043b\u0438\u043d\u043d\u0443\u044e \u0446\u0435\u043f\u044c, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0443\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u044c";M["ru-ru"].TutorialTitle_11="\u0423\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438";M["ru-ru"].TutorialText_11="\u042d\u0442\u0438 \u0443\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438 \u0443\u0434\u0430\u043b\u044f\u0442 \u0432\u0435\u0441\u044c \u0440\u044f\u0434 \u0438\u043b\u0438 \u043a\u043e\u043b\u043e\u043d\u043a\u0443.";
M["ru-ru"].TutorialTitle_12="\u0423\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438";M["ru-ru"].TutorialText_12="\u042d\u0442\u0438 \u0443\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438 \u0443\u0434\u0430\u043b\u044f\u044e\u0442 \u0432\u0441\u0435\u0445 \u0441\u043e\u0441\u0435\u0434\u043d\u0438\u0445 \u043c\u043e\u043d\u0441\u0442\u0440\u043e\u0432.";M["ru-ru"].TutorialTitle_13="\u0423\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u0438";M["ru-ru"].TutorialText_13="\u042d\u0442\u043e\u0442 \u0443\u043b\u0443\u0447\u0448\u0430\u0442\u0435\u043b\u044c \u043f\u043e\u0437\u0432\u043e\u043b\u044f\u0435\u0442 \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0446\u0435\u043f\u044c \u0438\u0437 \u0440\u0430\u0437\u043d\u044b\u0445 \u043f\u043e \u0446\u0432\u0435\u0442\u0443 \u043c\u043e\u043d\u0441\u0442\u0440\u043e\u0432";
M["ru-ru"].TutorialTitle_14="\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u044f";M["ru-ru"].TutorialText_14="\u0412 \u0431\u043e\u043b\u044c\u0448\u0438\u043d\u0441\u0442\u0432\u0435 \u0443\u0440\u043e\u0432\u043d\u0435\u0439 \u0443 \u0432\u0430\u0441 \u0431\u0443\u0434\u0435\u0442 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0445\u043e\u0434\u043e\u0432. \u041f\u043e\u0441\u0442\u0430\u0440\u0430\u0439\u0442\u0435\u0441\u044c \u0432\u044b\u0438\u0433\u0440\u0430\u0442\u044c \u043d\u0435 \u043f\u043e\u0442\u0440\u0430\u0442\u0438\u0432 \u0438\u0445 \u0432\u0441\u0435.";
M["ru-ru"].LevelGoalScore="\u041d\u0430\u0431\u0435\u0440\u0438\u0442\u0435 <TARGET> \u043e\u0447\u043a\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c!";M["ru-ru"].LevelGoalDiamond="\u0421\u043e\u0431\u0435\u0440\u0438\u0442\u0435 <TARGET> \u0434\u0440\u0430\u0433\u043e\u0446\u0435\u043d\u043d\u044b\u0445 \u043a\u0430\u043c\u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c!";
M["ru-ru"].LevelGoalCloner="\u041f\u043e\u0431\u0435\u0439\u0442\u0435 \u0432\u0441\u0435\u0445 \u041a\u043b\u043e\u043d\u0435\u0440\u043e\u0432, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c!";M["ru-ru"].LevelGoalGuard="\u041e\u0441\u0432\u043e\u0431\u043e\u0434\u0438\u0442\u0435 <TARGET> \u0441\u0432\u0438\u043d\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c!";
M["ru-ru"].LevelGoalSludge='\u0423\u0434\u0430\u043b\u0438\u0442\u0435 \u0432\u0441\u044e \u0441\u043b\u0438\u0437\u044c, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c"';M["ru-ru"].LevelStartHeader="\u0426\u0435\u043b\u044c";M["ru-ru"].LevelCompleted="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043f\u0440\u043e\u0439\u0434\u0435\u043d!";M["ru-ru"].NoMoves="\u0411\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442 \u0445\u043e\u0434\u043e\u0432!";
M["ru-ru"].FrenzyStart="\u041a\u043e\u043c\u0431\u043e!";M["ru-ru"].MovesLeft="\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0439";M["ru-ru"].levelMapScreenWorld_1="\u0423\u0440\u043e\u0432\u043d\u0438 7-12";M["ru-ru"].levelMapScreenWorld_2="\u0423\u0440\u043e\u0432\u043d\u0438 13-18";M["ru-ru"].levelMapScreenWorld_3="\u0423\u0440\u043e\u0432\u043d\u0438 19-24";M["ru-ru"].levelMapScreenWorld_4="\u0423\u0440\u043e\u0432\u043d\u0438 25-30";
M["ru-ru"].levelMapScreenWorld_5="\u0423\u0440\u043e\u0432\u043d\u0438 31-36";M["ru-ru"].levelMapScreenWorld_6="\u0423\u0440\u043e\u0432\u043d\u0438 37-42";M["ru-ru"].levelMapScreenWorld_7="\u0423\u0440\u043e\u0432\u043d\u0438 43-48";M["jp-jp"]=M["jp-jp"]||{};M["jp-jp"].TutorialTitle_01="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_01="3\u5339\u4ee5\u4e0a\u540c\u3058\u8272\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\n\u3064\u306a\u3052\u3066\u3084\u3063\u3064\u3051\u3088\u3046\uff01";
M["jp-jp"].TutorialTitle_02="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_02="#touch{\u30c9\u30e9\u30c3\u30b0}{\u30b9\u30ef\u30a4\u30d7}\u3057\u3066\n\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\u3064\u306a\u3052\u3088\u3046";M["jp-jp"].TutorialTitle_03="\u3042\u305d\u3073\u65b9";M["jp-jp"].TutorialText_03="\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\u6d88\u3059\u3068\n\u305d\u3070\u306b\u3042\u308b\u30a2\u30a4\u30c6\u30e0\u3092\u58ca\u305b\u307e\u3059";M["jp-jp"].TutorialTitle_04="\u30b4\u30fc\u30eb";
M["jp-jp"].TutorialText_04="\u30ec\u30d9\u30eb\u6bce\u306b\n\u7570\u306a\u308b\u30b4\u30fc\u30eb\u304c\u3042\u308a\u307e\u3059";M["jp-jp"].TutorialTitle_05="\u30b4\u30fc\u30eb";M["jp-jp"].TutorialText_05="\u5fc5\u8981\u306a\u30dd\u30a4\u30f3\u30c8\u3092\u30b2\u30c3\u30c8\u3057\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046";M["jp-jp"].TutorialTitle_06="\u30b4\u30fc\u30eb";M["jp-jp"].TutorialText_06="\u5fc5\u8981\u306a\u6570\u306e\u30c0\u30a4\u30e4\u3092\n\u4e0b\u307e\u3067\u843d\u3068\u3057\u3066\n\u30ec\u30d9\u30eb\u30af\u30ea\u30a2\u3057\u3088\u3046";
M["jp-jp"].TutorialTitle_07="\u30b4\u30fc\u30eb";M["jp-jp"].TutorialText_07="\u30b9\u30e9\u30a4\u30e0\u3092\u53d6\u308a\u9664\u3044\u3066\n\u305d\u3053\u306b\u3044\u308b\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\n\u3084\u3063\u3064\u3051\u3088\u3046";M["jp-jp"].TutorialTitle_08="\u30b4\u30fc\u30eb";M["jp-jp"].TutorialText_08="\u8fd1\u304f\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\u3084\u3063\u3064\u3051\u3066\n\u5b50\u30d6\u30bf\u305f\u3061\u3092\u9003\u304c\u305d\u3046";M["jp-jp"].TutorialTitle_09="\u30b4\u30fc\u30eb";
M["jp-jp"].TutorialText_09="\u8fd1\u304f\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\u3084\u3063\u3064\u3051\u3066\n\u5897\u6b96\u3059\u308b\u30af\u30ed\u30fc\u30f3\u3092\u6d88\u305d\u3046";M["jp-jp"].TutorialTitle_10="\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7";M["jp-jp"].TutorialText_10="\u306a\u308b\u3079\u304f\u591a\u304f\u3064\u306a\u3052\u3066\n\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7\u3092\u72d9\u304a\u3046";M["jp-jp"].TutorialTitle_11="\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7";
M["jp-jp"].TutorialText_11="\u3053\u306e\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7\u3067\n1\u884c / \u5217\u3092\u4e38\u3054\u3068\u6d88\u305b\u307e\u3059";M["jp-jp"].TutorialTitle_12="\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7";M["jp-jp"].TutorialText_12="\u3053\u306e\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7\u3067\n\u8fd1\u304f\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\n\u307e\u3068\u3081\u3066\u6d88\u305b\u307e\u3059";M["jp-jp"].TutorialTitle_13="\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7";
M["jp-jp"].TutorialText_13="\u3053\u306e\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7\u3067\n\u9055\u3046\u8272\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3092\u3064\u306a\u3052\u307e\u3059";M["jp-jp"].TutorialTitle_14="\u79fb\u52d5";M["jp-jp"].TutorialText_14="\u307b\u3068\u3093\u3069\u306e\u30ec\u30d9\u30eb\u3067\u306f\n\u79fb\u52d5\u56de\u6570\u306b\u5236\u9650\u304c\u3042\u308a\u307e\u3059\n\u306a\u304f\u306a\u308b\u524d\u306b\u30af\u30ea\u30a2\u3057\u3088\u3046";M["jp-jp"].LevelGoalScore="<TARGET> \u30dd\u30a4\u30f3\u30c8\u7372\u5f97\u3057\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046\uff01";
M["jp-jp"].LevelGoalDiamond="<TARGET> \u500b\u5b9d\u77f3\u3092\u96c6\u3081\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046\uff01";M["jp-jp"].LevelGoalCloner="\u30af\u30ed\u30fc\u30f3\u3092\u3059\u3079\u3066\u3084\u3063\u3064\u3051\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046\uff01";M["jp-jp"].LevelGoalGuard="<TARGET> \u5339\u5b50\u30d6\u30bf\u3092\u9003\u304c\u3057\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046\uff01";
M["jp-jp"].LevelGoalSludge="\u30b9\u30e9\u30a4\u30e0\u3092\u5168\u90e8\u53d6\u308a\u9664\u3044\u3066\n\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u3088\u3046\uff01";M["jp-jp"].LevelStartHeader="\u30b4\u30fc\u30eb";M["jp-jp"].LevelCompleted="\u30ec\u30d9\u30eb\u30af\u30ea\u30a2\uff01";M["jp-jp"].NoMoves="\u79fb\u52d5\u56de\u6570\u30ca\u30b7";M["jp-jp"].FrenzyStart="\u30c1\u30a7\u30fc\u30f3\u30e2\u30f3\u30b9\u30bf\u30fc\uff01";M["jp-jp"].MovesLeft="\u79fb\u52d5\u53ef\u80fd\u56de\u6570";
M["jp-jp"].levelMapScreenWorld_1="\u30ec\u30d9\u30eb 7-12";M["jp-jp"].levelMapScreenWorld_2="\u30ec\u30d9\u30eb 13-18";M["jp-jp"].levelMapScreenWorld_3="\u30ec\u30d9\u30eb 19-24";M["jp-jp"].levelMapScreenWorld_4="\u30ec\u30d9\u30eb 25-30";M["jp-jp"].levelMapScreenWorld_5="\u30ec\u30d9\u30eb 31-36";M["jp-jp"].levelMapScreenWorld_6="\u30ec\u30d9\u30eb 37-42";M["jp-jp"].levelMapScreenWorld_7="\u30ec\u30d9\u30eb 43-48";M["it-it"]=M["it-it"]||{};M["it-it"].TutorialTitle_01="Incatenamento";
M["it-it"].TutorialText_01="Incatena 3 o pi\u00f9 mostri dello stesso colore per distruggerli.";M["it-it"].TutorialTitle_02="Incatenamento";M["it-it"].TutorialText_02="#touch{Clicca}{Tocca} un mostro e trascina per creare una catena.";M["it-it"].TutorialTitle_03="Incatenamento";M["it-it"].TutorialText_03="Alcuni oggetti saranno distrutti quando un mostro vicino \u00e8 sconfitto.";M["it-it"].TutorialTitle_04="Obiettivi";M["it-it"].TutorialText_04="I livelli possono avere obiettivi diversi.";
M["it-it"].TutorialTitle_05="Obiettivi";M["it-it"].TutorialText_05="Realizza abbastanza punti per vincere questo livello.";M["it-it"].TutorialTitle_06="Obiettivi";M["it-it"].TutorialText_06="Accumula abbastanza diamanti nella parte bassa del campo di gioco per completare il livello";M["it-it"].TutorialTitle_07="Obiettivi";M["it-it"].TutorialText_07="Rimuovi la melma da queste caselle sconfiggendo il mostro che sta su queste.";M["it-it"].TutorialTitle_08="Obiettivi";M["it-it"].TutorialText_08="Libera i maiali dalle gabbie sconfiggendo un mostro vicino.";
M["it-it"].TutorialTitle_09="Obiettivi";M["it-it"].TutorialText_09="I clonatori possono moltiplicarsi. Sconfiggi un mostro vicino per sbarazzartene.";M["it-it"].TutorialTitle_10="Potenziamenti";M["it-it"].TutorialText_10="Crea catene pi\u00f9 lunghe per poter guadagnare un potenziamento";M["it-it"].TutorialTitle_11="Potenziamenti";M["it-it"].TutorialText_11="Questi potenziamenti possono rimuovere un'intera riga o colonna";M["it-it"].TutorialTitle_12="Potenziamenti";M["it-it"].TutorialText_12="Questi potenziamenti ti libereranno di tutti i mostri vicini.";
M["it-it"].TutorialTitle_13="Potenziamenti";M["it-it"].TutorialText_13="Questo potenziamento ti permette di incatenare mostri di colori diversi.";M["it-it"].TutorialTitle_14="Mosse";M["it-it"].TutorialText_14="Nella maggior parte dei livelli avr\u00e0ai solo un numero limitato di mosse! Completa il livello prima di esaurirle.";M["it-it"].LevelGoalScore="Realizza\u00a0<TARGET> punti per completare il livello!";M["it-it"].LevelGoalDiamond="Colleziona\u00a0<TARGET> gemme per completare il livello!";
M["it-it"].LevelGoalCloner="Sconfiggi tutti i Clonatori per completare il livello!";M["it-it"].LevelGoalGuard="Libera\u00a0<TARGET>\u00a0 maiali per completare il livello!";M["it-it"].LevelGoalSludge="Ripulisci tutta la melma per completare il livello!";M["it-it"].LevelStartHeader="Obiettivo";M["it-it"].LevelCompleted="Livello completato!";M["it-it"].NoMoves="Mosse esaurite!";M["it-it"].FrenzyStart="Combo Crusade!";M["it-it"].MovesLeft="Mosse rimaste";M["it-it"].levelMapScreenWorld_1="Livello 7 - 12";
M["it-it"].levelMapScreenWorld_2="Livello 13 - 18";M["it-it"].levelMapScreenWorld_3="Livello 19 - 24";M["it-it"].levelMapScreenWorld_4="Livello 25 -\u00a030";M["it-it"].levelMapScreenWorld_5="Livello 31 - 36";M["it-it"].levelMapScreenWorld_6="Livello 37 - 42";M["it-it"].levelMapScreenWorld_7="Livello 43 - 48";var mc={};window.slashSounds=mc;var N={};window.selectSounds=N;var nc={};window.fallSounds=nc;var oc={};window.slimeSounds=oc;window.throbber=new pb("throbber","media/throbber.png");
window.TG_StartScreenLogo=new pb("TG_StartScreenLogo","../logos/TG_StartScreenLogo.png");var pc=new ta("StartTexture",1,"start");window.StartTexture=pc;ua(pc,0,"media/StartTexture0.png");var qc=new ta("StartScreenTexture",1,"load");window.StartScreenTexture=qc;ua(qc,0,"media/StartScreenTexture0.png");var rc=new ta("LevelMapScreenTexture",2,"load");window.LevelMapScreenTexture=rc;ua(rc,0,"media/LevelMapScreenTexture0.png");ua(rc,1,"media/LevelMapScreenTexture1.png");
var sc=new ta("LevelEndTexture",4,"load");window.LevelEndTexture=sc;ua(sc,0,"media/LevelEndTexture0.png");ua(sc,1,"media/LevelEndTexture1.png");ua(sc,2,"media/LevelEndTexture2.png");ua(sc,3,"media/LevelEndTexture3.png");var O=new ta("MenuTexture",2,"load");window.MenuTexture=O;ua(O,0,"media/MenuTexture0.png");ua(O,1,"media/MenuTexture1.png");var tc=new ta("GameTexture",1,"load");window.GameTexture=tc;ua(tc,0,"media/GameTexture0.png");var uc=new ta("GameStaticTexture",2,"load");
window.GameStaticTexture=uc;ua(uc,0,"media/GameStaticTexture0.png");ua(uc,1,"media/GameStaticTexture1.png");var vc=new ta("StartScreenTexure",2,"load");window.StartScreenTexure=vc;ua(vc,0,"media/StartScreenTexure0.png");ua(vc,1,"media/StartScreenTexure1.png");var wc=new ta("EndScreenTexture",2,"load");window.EndScreenTexture=wc;ua(wc,0,"media/EndScreenTexture0.png");ua(wc,1,"media/EndScreenTexture1.png");var xc=new ta("tutorialTexture",2,"load");window.tutorialTexture=xc;ua(xc,0,"media/tutorialTexture0.png");
ua(xc,1,"media/tutorialTexture1.png");var P=new ta("texture",2,"load");window.texture=P;ua(P,0,"media/texture0.png");ua(P,1,"media/texture1.png");var yc=new q("s_loadingbar_background",qc,1,42,32,0,0,42,32,1);window.s_loadingbar_background=yc;yc.b(0,0,929,1,42,32,0,0);var zc=new q("s_level_0",rc,1,125,140,0,0,125,140,1);window.s_level_0=zc;zc.b(0,0,585,1,125,140,0,0);var Ac=new q("s_level_1",rc,1,125,140,0,0,125,140,1);window.s_level_1=Ac;Ac.b(0,0,841,1,125,140,0,0);
var Bc=new q("s_level_2",rc,1,125,140,0,0,125,140,1);window.s_level_2=Bc;Bc.b(0,0,585,145,125,140,0,0);var Cc=new q("s_level_3",rc,1,125,140,0,0,125,140,1);window.s_level_3=Cc;Cc.b(0,0,713,1,125,140,0,0);var Dc=new q("s_level_lock",rc,1,48,70,0,0,48,70,1);window.s_level_lock=Dc;Dc.b(0,0,969,1,48,69,0,1);var Ec=new q("s_level_stars",rc,1,126,46,0,0,126,46,1);window.s_level_stars=Ec;Ec.b(0,0,713,145,126,45,0,1);var Fc=new q("s_level2_0",rc,1,84,87,0,0,84,87,1);window.s_level2_0=Fc;
Fc.b(0,0,585,289,84,87,0,0);var Hc=new q("s_level2_1",rc,1,84,87,0,0,84,87,1);window.s_level2_1=Hc;Hc.b(0,0,761,353,84,87,0,0);var Ic=new q("s_level2_2",rc,1,84,87,0,0,84,87,1);window.s_level2_2=Ic;Ic.b(0,0,929,257,84,87,0,0);var Jc=new q("s_level2_3",rc,1,84,87,0,0,84,87,1);window.s_level2_3=Jc;Jc.b(0,0,673,305,84,87,0,0);var Kc=new q("s_level2_arrow_right",rc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=Kc;Kc.b(0,0,713,193,60,108,0,0);Kc.b(1,0,777,193,60,108,0,0);
var Lc=new q("s_level2_arrow_left",rc,2,60,108,0,0,60,216,1);window.s_level2_arrow_left=Lc;Lc.b(0,0,841,145,60,108,0,0);Lc.b(1,0,905,145,60,108,0,0);var Mc=new q("s_level2_lock",rc,1,84,87,0,0,84,87,1);window.s_level2_lock=Mc;Mc.b(0,0,841,257,84,87,0,0);var Nc=new q("s_pop_medal",sc,8,378,378,189,189,3024,378,8);window.s_pop_medal=Nc;Nc.b(0,0,1,641,349,241,3,69);Nc.b(1,1,657,1,346,267,5,54);Nc.b(2,0,353,641,348,276,20,56);Nc.b(3,1,657,585,342,288,26,50);Nc.b(4,2,345,1,319,292,22,46);
Nc.b(5,2,1,1,337,304,14,41);Nc.b(6,1,657,273,343,305,12,41);Nc.b(7,1,1,641,341,304,13,41);var Oc=new q("s_medal_shadow",sc,1,195,208,0,0,195,208,1);window.s_medal_shadow=Oc;Oc.b(0,2,601,737,189,204,3,1);var Pc=new q("s_medal_shine",sc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Pc;Pc.b(0,2,601,521,193,207,1,1);Pc.b(1,2,801,521,193,207,1,1);Pc.b(2,2,201,545,193,207,1,1);Pc.b(3,2,1,529,193,207,1,1);Pc.b(4,2,401,545,193,207,1,1);Pc.b(5,2,1,313,193,207,1,1);
var Qc=new q("s_icon_toggle_hard",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Qc;Qc.b(0,0,865,345,67,67,0,0);var Rc=new q("s_icon_toggle_medium",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Rc;Rc.b(0,0,953,617,67,67,0,0);var Sc=new q("s_icon_toggle_easy",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Sc;Sc.b(0,0,937,345,67,67,0,0);var Tc=new q("s_flagIcon_us",O,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Tc;Tc.b(0,0,929,801,48,36,0,6);var Uc=new q("s_flagIcon_gb",O,1,48,48,0,0,48,48,1);
window.s_flagIcon_gb=Uc;Uc.b(0,0,969,281,48,36,0,6);var Vc=new q("s_flagIcon_nl",O,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Vc;Vc.b(0,0,545,809,48,36,0,6);var Wc=new q("s_flagIcon_tr",O,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Wc;Wc.b(0,0,825,809,48,36,0,6);var Xc=new q("s_flagIcon_de",O,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Xc;Xc.b(0,0,169,833,48,36,0,6);var Yc=new q("s_flagIcon_fr",O,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Yc;Yc.b(0,0,57,833,48,36,0,6);
var Zc=new q("s_flagIcon_br",O,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Zc;Zc.b(0,0,1,833,48,36,0,6);var $c=new q("s_flagIcon_es",O,1,48,48,0,0,48,48,1);window.s_flagIcon_es=$c;$c.b(0,0,713,809,48,36,0,6);var ad=new q("s_flagIcon_jp",O,1,48,48,0,0,48,48,1);window.s_flagIcon_jp=ad;ad.b(0,0,601,809,48,36,0,6);var bd=new q("s_flagIcon_ru",O,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=bd;bd.b(0,0,769,809,48,36,0,6);var cd=new q("s_flagIcon_ar",O,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=cd;
cd.b(0,0,657,809,48,36,0,6);var dd=new q("s_flagIcon_kr",O,1,48,48,0,0,48,48,1);window.s_flagIcon_kr=dd;dd.b(0,0,929,761,48,36,0,6);var ed=new q("s_flagIcon_it",O,1,48,48,0,0,48,48,1);window.s_flagIcon_it=ed;ed.b(0,0,113,833,48,36,0,6);var fd=new q("s_tutorialButton_close",O,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=fd;fd.b(0,0,953,689,65,65,0,0);var gd=new q("s_tutorialButton_next",O,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=gd;gd.b(0,0,537,641,66,65,0,0);
var hd=new q("s_tutorialButton_previous",O,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=hd;hd.b(0,0,465,641,66,65,0,0);var id=new q("s_logo_tinglygames",O,1,240,240,0,0,240,240,1);window.s_logo_tinglygames=id;id.b(0,0,617,1,240,240,0,0);var jd=new q("s_logo_coolgames",O,1,240,240,0,0,240,240,1);window.s_logo_coolgames=jd;jd.b(0,0,617,249,240,167,0,36);var kd=new q("s_logo_tinglygames_start",qc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=kd;kd.b(0,0,617,1,156,53,0,0);
var ld=new q("s_logo_coolgames_start",qc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=ld;ld.b(0,0,777,1,150,104,75,0);var md=new q("s_star01_empty",sc,1,170,170,85,85,170,170,1);window.s_star01_empty=md;md.b(0,2,1,745,163,168,2,2);var nd=new q("s_star01_fill",sc,1,170,170,85,85,170,170,1);window.s_star01_fill=nd;nd.b(0,2,201,313,142,147,14,17);var od=new q("s_star02_empty",sc,1,170,170,85,85,170,170,1);window.s_star02_empty=od;od.b(0,0,705,857,168,162,1,1);
var pd=new q("s_star02_fill",sc,1,170,170,85,85,170,170,1);window.s_star02_fill=pd;pd.b(0,1,617,881,146,141,12,16);var qd=new q("s_star03_empty",sc,1,170,170,85,85,170,170,1);window.s_star03_empty=qd;qd.b(0,2,793,737,164,168,4,2);var rd=new q("s_star03_fill",sc,1,170,170,85,85,170,170,1);window.s_star03_fill=rd;rd.b(0,0,881,857,142,148,14,16);var sd=new q("s_sfx_star",sc,8,300,300,150,150,2400,300,8);window.s_sfx_star=sd;sd.b(0,1,769,881,134,131,85,89);sd.b(1,2,345,297,250,244,19,27);
sd.b(2,2,673,265,257,253,17,20);sd.b(3,1,345,641,266,263,12,15);sd.b(4,0,713,305,262,273,13,10);sd.b(5,0,713,585,251,270,19,12);sd.b(6,2,673,1,213,260,38,16);sd.b(7,0,713,1,243,299,23,1);var td=new q("s_ui_cup_highscore",tc,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=td;td.b(0,0,465,1,32,28,0,0);var ud=new q("s_ui_cup_score",tc,1,28,24,0,0,28,24,1);window.s_ui_cup_score=ud;ud.b(0,0,505,1,28,24,0,0);var vd=new q("s_ui_divider",uc,1,94,2,0,0,94,2,1);window.s_ui_divider=vd;vd.b(0,0,729,1,94,2,0,0);
var wd=new q("s_ui_background_blank",uc,1,140,580,0,0,140,580,1);window.s_ui_background_blank=wd;wd.b(0,0,1,1,140,580,0,0);var xd=new q("s_ui_highscore",uc,1,26,36,13,12,26,36,1);window.s_ui_highscore=xd;xd.b(0,0,825,1,26,36,0,0);var yd=new q("s_star_empty",tc,1,24,24,12,12,24,24,1);window.s_star_empty=yd;yd.b(0,0,601,1,24,23,0,0);var zd=new q("s_star_filled",tc,1,24,24,12,12,24,24,1);window.s_star_filled=zd;zd.b(0,0,569,1,24,23,0,0);var Ad=new q("s_ui_heart",tc,1,28,24,14,12,28,24,1);
window.s_ui_heart=Ad;Ad.b(0,0,537,1,26,23,1,1);var Bd=new q("s_ui_progressbar_stars_frame",tc,1,120,118,60,60,120,118,1);window.s_ui_progressbar_stars_frame=Bd;Bd.b(0,0,129,1,120,118,0,0);var Cd=new q("s_ui_progressbar_stars_background",tc,1,120,190,60,60,120,190,1);window.s_ui_progressbar_stars_background=Cd;Cd.b(0,0,1,1,120,190,0,0);var Dd=new q("s_btn_big_restart",sc,2,154,152,0,0,308,152,2);window.s_btn_big_restart=Dd;Dd.b(0,2,329,761,154,152,0,0);Dd.b(1,3,1,1,154,152,0,0);
var Ed=new q("s_btn_big_start",sc,2,154,152,0,0,308,152,2);window.s_btn_big_start=Ed;Ed.b(0,2,169,761,154,152,0,0);Ed.b(1,3,161,1,154,152,0,0);var Fd=new q("s_btn_small_exit",O,2,100,92,0,0,200,92,2);window.s_btn_small_exit=Fd;Fd.b(0,0,865,249,100,92,0,0);Fd.b(1,0,849,617,100,92,0,0);var Gd=new q("s_btn_small_pause",tc,2,100,92,0,0,200,92,2);window.s_btn_small_pause=Gd;Gd.b(0,0,361,1,100,92,0,0);Gd.b(1,0,257,1,100,92,0,0);var Hd=new q("s_btn_small_options",O,2,100,92,0,0,200,92,2);
window.s_btn_small_options=Hd;Hd.b(0,0,865,153,100,92,0,0);Hd.b(1,0,233,737,100,92,0,0);var Id=new q("s_btn_small_retry",sc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=Id;Id.b(0,0,393,921,100,92,0,0);Id.b(1,0,289,921,100,92,0,0);var Jd=new q("s_btn_standard",O,2,96,92,0,0,192,92,2);window.s_btn_standard=Jd;Jd.b(0,0,337,737,96,92,0,0);Jd.b(1,0,441,809,96,92,0,0);var Kd=new q("s_btn_toggle",O,2,162,92,0,0,324,92,2);window.s_btn_toggle=Kd;Kd.b(0,0,849,425,162,92,0,0);Kd.b(1,0,849,521,162,92,0,0);
var Ld=new q("s_icon_toggle_fxoff",O,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=Ld;Ld.b(0,0,617,617,227,92,0,0);Ld.b(1,0,617,425,227,92,0,0);var Md=new q("s_icon_toggle_fxon",O,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=Md;Md.b(0,0,617,521,227,92,0,0);Md.b(1,0,1,641,227,92,0,0);var Nd=new q("s_icon_toggle_musicoff",O,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicoff=Nd;Nd.b(0,0,233,641,227,92,0,0);Nd.b(1,0,697,713,227,92,0,0);
var Od=new q("s_icon_toggle_musicon",O,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=Od;Od.b(0,0,1,737,227,92,0,0);Od.b(1,0,465,713,227,92,0,0);var Pd=new q("s_btn_bigtext",sc,2,137,104,0,0,274,104,2);window.s_btn_bigtext=Pd;Pd.b(0,0,145,889,137,104,0,0);Pd.b(1,0,1,889,137,104,0,0);var Qd=new q("s_icon_toggle_sfx_on",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=Qd;Qd.b(0,0,969,241,49,31,7,17);var Rd=new q("s_icon_toggle_sfx_off",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=Rd;
Rd.b(0,0,969,153,53,31,7,17);var Sd=new q("s_icon_toggle_music_on",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=Sd;Sd.b(0,0,985,65,38,41,13,16);var Td=new q("s_icon_toggle_music_off",O,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=Td;Td.b(0,0,969,193,51,41,8,16);var Ud=new q("s_overlay_assignment",uc,1,565,414,0,0,565,414,1);window.s_overlay_assignment=Ud;Ud.b(0,1,1,329,565,414,0,0);var Vd=new q("s_tutorial",O,1,522,562,0,0,522,562,1);window.s_tutorial=Vd;Vd.b(0,1,1,1,522,562,0,0);
var Wd=new q("s_screen_start",vc,2,576,640,0,0,1152,640,2);window.s_screen_start=Wd;Wd.b(0,1,1,1,576,640,0,0);Wd.b(1,0,1,1,576,640,0,0);var Xd=new q("s_overlay_options",O,1,628,634,0,0,628,634,1);window.s_overlay_options=Xd;Xd.b(0,0,1,1,607,632,19,0);var Yd=new q("s_overlay_level_win",sc,1,694,633,0,0,694,633,1);window.s_overlay_level_win=Yd;Yd.b(0,1,1,1,654,632,5,0);var Zd=new q("s_overlay_level_fail",sc,1,812,633,0,0,812,633,1);window.s_overlay_level_fail=Zd;Zd.b(0,0,1,1,706,632,8,0);
var $d=new q("s_screen_end",wc,2,576,640,0,0,1152,640,2);window.s_screen_end=$d;$d.b(0,1,1,1,576,640,0,0);$d.b(1,0,1,1,576,640,0,0);var ae=new q("s_screen_levelselect",rc,2,576,640,0,0,1152,640,2);window.s_screen_levelselect=ae;ae.b(0,1,1,1,576,640,0,0);ae.b(1,0,1,1,576,640,0,0);var be=new q("s_tutorial_1",xc,1,350,190,0,0,350,190,1);window.s_tutorial_1=be;be.b(0,0,705,1,235,139,45,27);var ce=new q("s_tutorial_2",xc,1,350,190,0,0,350,190,1);window.s_tutorial_2=ce;ce.b(0,0,1,385,350,190,0,0);
var de=new q("s_tutorial_3",xc,1,350,190,0,0,350,190,1);window.s_tutorial_3=de;de.b(0,0,353,769,349,190,1,0);var ee=new q("s_tutorial_4",xc,1,350,190,0,0,350,190,1);window.s_tutorial_4=ee;ee.b(0,0,353,385,350,190,0,0);var fe=new q("s_tutorial_5",xc,1,350,190,0,0,350,190,1);window.s_tutorial_5=fe;fe.b(0,0,1,769,349,190,1,0);var ge=new q("s_tutorial_6",xc,1,350,190,0,0,350,190,1);window.s_tutorial_6=ge;ge.b(0,1,1,193,349,190,1,0);var he=new q("s_tutorial_7",xc,1,350,190,0,0,350,190,1);
window.s_tutorial_7=he;he.b(0,1,353,1,349,190,1,0);var ie=new q("s_tutorial_8",xc,1,350,190,0,0,350,190,1);window.s_tutorial_8=ie;ie.b(0,1,1,1,349,190,1,0);var je=new q("s_tutorial_9",xc,1,350,190,0,0,350,190,1);window.s_tutorial_9=je;je.b(0,0,1,577,350,190,0,0);var ke=new q("s_tutorial_10",xc,1,350,190,0,0,350,190,1);window.s_tutorial_10=ke;ke.b(0,0,353,193,350,190,0,0);var le=new q("s_tutorial_11",xc,1,350,190,0,0,350,190,1);window.s_tutorial_11=le;le.b(0,0,1,1,350,190,0,0);
var me=new q("s_tutorial_12",xc,1,350,190,0,0,350,190,1);window.s_tutorial_12=me;me.b(0,0,1,193,350,190,0,0);var ne=new q("s_tutorial_13",xc,1,350,190,0,0,350,190,1);window.s_tutorial_13=ne;ne.b(0,0,353,577,350,190,0,0);var oe=new q("s_tutorial_14",xc,1,350,190,0,0,350,190,1);window.s_tutorial_14=oe;oe.b(0,0,353,1,350,190,0,0);var pe=new q("s_background",uc,4,576,320,0,0,1152,640,2);window.s_background=pe;pe.b(0,0,1,657,576,320,0,0);pe.b(1,0,145,329,576,320,0,0);pe.b(2,1,1,1,576,320,0,0);
pe.b(3,0,145,1,576,320,0,0);var qe=new q("s_logo",qc,1,612,388,0,56,612,388,1);window.s_logo=qe;qe.b(0,0,1,1,612,388,0,0);var re=new q("s_animation_slash_diagonal_down",P,5,64,73,27,58,320,73,5);window.s_animation_slash_diagonal_down=re;re.b(0,0,785,105,6,4,8,14);re.b(1,0,849,241,23,9,10,10);re.b(2,0,401,209,36,53,14,12);re.b(3,0,897,105,23,15,13,45);re.b(4,0,1009,81,13,4,5,56);var se=new q("s_animation_slash_diagonal_up",P,5,64,73,32,59,320,73,5);window.s_animation_slash_diagonal_up=se;
se.b(0,0,1017,113,6,5,0,59);se.b(1,0,633,289,21,17,1,45);se.b(2,1,65,217,43,41,7,19);se.b(3,0,993,33,29,21,30,15);se.b(4,0,633,337,20,16,42,12);var te=new q("s_animation_slash_horizontal",P,4,64,73,31,62,256,73,4);window.s_animation_slash_horizontal=te;te.b(0,0,785,113,6,3,0,40);te.b(1,0,289,993,55,29,1,25);te.b(2,0,993,89,24,5,35,35);te.b(3,0,241,273,11,2,51,37);var ue=new q("s_animation_slash_vertical",P,5,64,73,25,59,320,73,5);window.s_animation_slash_vertical=ue;ue.b(0,0,785,89,4,8,30,1);
ue.b(1,0,729,257,38,69,12,0);ue.b(2,0,993,57,10,26,21,43);ue.b(3,0,769,257,7,18,20,54);ue.b(4,0,1017,97,4,7,21,62);var ve=new q("s_animation_slash_final",P,5,64,73,31,56,320,73,5);window.s_animation_slash_final=ve;ve.b(0,0,257,273,8,11,24,2);ve.b(1,1,289,145,45,64,10,4);ve.b(2,0,225,977,60,42,3,28);ve.b(3,0,257,777,59,29,1,41);ve.b(4,0,1,985,58,23,4,45);var we=new q("s_animation_pouf",P,6,146,139,73,87,876,139,6);window.s_animation_pouf=we;we.b(0,0,809,449,15,19,66,61);we.b(1,1,217,1,57,69,47,33);
we.b(2,0,945,489,77,92,38,19);we.b(3,0,329,409,92,108,30,10);we.b(4,0,321,1,123,130,14,0);we.b(5,0,1,1,145,135,1,4);var ye=new q("s_sfx_powerExplosion",P,7,75,75,37,60,525,75,7);window.s_sfx_powerExplosion=ye;ye.b(0,0,1009,273,8,8,33,31);ye.b(1,0,329,369,24,24,25,23);ye.b(2,0,361,601,34,34,20,18);ye.b(3,1,233,209,54,54,10,9);ye.b(4,1,881,145,61,61,7,6);ye.b(5,1,409,1,67,67,4,3);ye.b(6,0,585,929,75,75,0,0);var ze=new q("s_sfx_powerHor",P,12,129,129,64,80,1548,129,12);window.s_sfx_powerHor=ze;
ze.b(0,0,841,937,71,68,33,29);ze.b(1,0,1,385,108,70,12,28);ze.b(2,0,361,337,113,67,10,31);ze.b(3,0,401,265,117,66,7,31);ze.b(4,0,321,137,125,67,4,31);ze.b(5,0,793,1,129,66,0,33);ze.b(6,0,833,441,104,64,0,32);ze.b(7,0,481,385,108,67,12,31);ze.b(8,0,241,289,113,72,10,28);ze.b(9,0,281,209,117,76,7,28);ze.b(10,0,657,89,125,80,4,27);ze.b(11,0,657,1,129,85,0,24);var Ae=new q("s_sfx_powerOmni",P,9,130,130,65,80,1170,130,9);window.s_sfx_powerOmni=Ae;Ae.b(0,0,881,241,10,12,64,62);
Ae.b(1,0,897,73,24,24,57,55);Ae.b(2,1,169,209,57,55,40,39);Ae.b(3,0,409,937,75,73,30,30);Ae.b(4,0,809,513,92,88,20,23);Ae.b(5,0,1,273,115,109,10,11);Ae.b(6,0,153,145,121,119,6,7);Ae.b(7,0,449,137,124,123,4,4);Ae.b(8,0,449,1,130,130,0,0);var Be=new q("s_sfx_powerVer",P,12,129,129,64,80,1548,129,12);window.s_sfx_powerVer=Be;Be.b(0,1,1,1,69,71,33,28);Be.b(1,0,633,377,75,108,30,11);Be.b(2,0,937,257,70,113,32,9);Be.b(3,0,657,257,70,117,31,6);Be.b(4,0,577,137,73,123,30,4);Be.b(5,0,585,1,66,129,34,0);
Be.b(6,0,489,937,62,71,36,28);Be.b(7,0,945,377,73,107,30,11);Be.b(8,0,121,361,80,112,28,9);Be.b(9,0,849,257,81,117,27,5);Be.b(10,0,57,145,87,123,24,3);Be.b(11,0,793,73,95,129,21,0);var Ce=new q("s_sfx_powerup_move",P,7,72,72,36,36,504,72,7);window.s_sfx_powerup_move=Ce;Ce.b(0,0,305,457,15,15,28,29);Ce.b(1,0,233,649,31,31,18,21);Ce.b(2,0,361,289,34,39,17,19);Ce.b(3,1,337,145,60,63,8,6);Ce.b(4,0,425,409,47,46,13,13);Ce.b(5,0,993,1,30,28,21,21);Ce.b(6,0,633,265,20,21,25,26);
var Ee=new q("s_animation_fire",P,9,60,172,30,160,540,172,9);window.s_animation_fire=Ee;Ee.b(0,0,993,97,16,24,18,148);Ee.b(1,0,905,585,55,85,0,86);Ee.b(2,0,785,209,60,117,0,53);Ee.b(3,0,153,1,56,137,4,30);Ee.b(4,0,929,1,57,125,3,22);Ee.b(5,0,1,145,54,123,5,9);Ee.b(6,0,145,577,50,85,9,1);Ee.b(7,0,969,585,50,77,9,0);Ee.b(8,1,697,145,49,63,11,5);var Fe=new q("s_animation_splash",P,7,125,136,62,98,875,136,7);window.s_animation_splash=Fe;Fe.b(0,0,713,449,90,103,16,17);Fe.b(1,0,729,329,96,113,13,13);
Fe.b(2,0,217,1,102,135,10,0);Fe.b(3,0,521,265,110,116,8,20);Fe.b(4,0,121,273,115,79,5,27);Fe.b(5,0,657,177,120,73,3,32);Fe.b(6,0,897,129,125,69,0,36);var Ge=new q("s_sfx_powerup_colorless_inactive",P,15,79,79,39,39,1185,79,15);window.s_sfx_powerup_colorless_inactive=Ge;Ge.b(0,1,593,65,65,65,7,7);Ge.b(1,1,289,73,65,65,7,7);Ge.b(2,1,505,73,65,65,7,7);Ge.b(3,1,361,73,65,65,7,7);Ge.b(4,1,217,73,65,65,7,7);Ge.b(5,1,73,73,65,65,7,7);Ge.b(6,1,921,1,65,65,7,7);Ge.b(7,1,737,73,65,65,7,7);
Ge.b(8,1,433,73,65,65,7,7);Ge.b(9,1,809,73,65,65,7,7);Ge.b(10,1,145,137,65,65,7,7);Ge.b(11,1,1,81,65,65,7,7);Ge.b(12,1,953,73,65,65,7,7);Ge.b(13,1,665,73,65,65,7,7);Ge.b(14,1,881,73,65,65,7,7);var He=new q("s_sfx_powerup_colorless_active",P,15,79,79,39,39,1185,79,15);window.s_sfx_powerup_colorless_active=He;He.b(0,0,233,689,79,79,0,0);He.b(1,0,873,849,79,79,0,0);He.b(2,0,873,761,79,79,0,0);He.b(3,0,169,777,79,79,0,0);He.b(4,0,497,761,79,79,0,0);He.b(5,0,409,737,79,79,0,0);
He.b(6,0,785,689,79,79,0,0);He.b(7,0,321,729,79,79,0,0);He.b(8,0,1,737,79,79,0,0);He.b(9,0,785,777,79,79,0,0);He.b(10,0,753,865,79,79,0,0);He.b(11,0,169,865,79,79,0,0);He.b(12,0,1,825,79,79,0,0);He.b(13,0,417,849,79,79,0,0);He.b(14,0,665,833,79,79,0,0);var Ie=new q("s_characters_blob",P,5,81,81,40,70,405,81,5);window.s_characters_blob=Ie;Ie.b(0,1,145,73,65,58,9,10);Ie.b(1,0,585,857,77,70,3,4);Ie.b(2,0,1,913,77,70,3,4);Ie.b(3,1,593,1,65,58,9,10);Ie.b(4,0,257,905,77,70,3,4);
var Je=new q("s_characters_dragon",P,5,81,81,40,70,405,81,5);window.s_characters_dragon=Je;Je.b(0,1,73,145,50,64,11,7);Je.b(1,0,961,921,62,76,5,1);Je.b(2,0,961,761,62,76,5,1);Je.b(3,1,577,137,50,64,11,7);Je.b(4,0,961,841,62,76,5,1);var Ke=new q("s_characters_gnome",P,5,81,81,40,70,405,81,5);window.s_characters_gnome=Ke;Ke.b(0,1,665,1,59,65,7,7);Ke.b(1,0,89,745,73,79,0,0);Ke.b(2,0,705,745,73,79,0,0);Ke.b(3,1,793,1,59,65,7,7);Ke.b(4,0,257,817,73,79,0,0);
var Le=new q("s_characters_block",P,5,81,81,40,70,405,81,5);window.s_characters_block=Le;Le.b(0,1,473,145,61,63,11,12);Le.b(1,0,585,769,73,79,5,2);Le.b(2,0,625,681,76,81,2,0);Le.b(3,1,753,145,61,63,11,12);Le.b(4,0,873,673,76,81,2,0);var Me=new q("s_characters_skull",P,5,81,81,40,70,405,81,5);window.s_characters_skull=Me;Me.b(0,1,857,1,57,65,18,7);Me.b(1,0,337,913,69,77,12,1);Me.b(2,0,81,921,69,77,12,1);Me.b(3,1,729,1,57,65,18,7);Me.b(4,0,665,921,69,77,12,1);
var Ne=new q("s_characters_spider",P,5,81,81,40,70,405,81,5);window.s_characters_spider=Ne;Ne.b(0,1,345,1,60,67,10,7);Ne.b(1,0,337,825,72,79,4,1);Ne.b(2,0,505,849,72,79,4,1);Ne.b(3,1,281,1,60,67,10,7);Ne.b(4,0,89,833,72,79,4,1);var Oe=new q("s_characters_cloner",P,5,81,81,40,70,405,81,5);window.s_characters_cloner=Oe;Oe.b(0,1,481,1,53,67,14,7);Oe.b(1,1,537,1,53,67,14,7);Oe.b(2,0,713,657,69,81,6,0);Oe.b(3,0,89,673,53,67,14,7);Oe.b(4,0,953,673,69,81,6,0);
var Pe=new q("s_assets_symbols_big_1",P,1,92,93,46,46,92,93,1);window.s_assets_symbols_big_1=Pe;Pe.b(0,0,209,457,92,93,0,0);var Qe=new q("s_assets_symbols_big_2",P,1,92,93,46,46,92,93,1);window.s_assets_symbols_big_2=Qe;Qe.b(0,0,425,457,92,93,0,0);var Re=new q("s_assets_symbols_big_3",P,1,92,93,46,46,92,93,1);window.s_assets_symbols_big_3=Re;Re.b(0,0,105,481,92,93,0,0);var Se=new q("s_assets_symbols_big_4",P,1,92,93,46,46,92,93,1);window.s_assets_symbols_big_4=Se;Se.b(0,0,617,489,92,93,0,0);
var Te=new q("s_assets_symbols_big_5",P,1,92,93,46,46,92,93,1);window.s_assets_symbols_big_5=Te;Te.b(0,0,521,457,92,93,0,0);var Ue=new q("s_assets_symbols_small_1",P,1,57,57,28,28,57,57,1);window.s_assets_symbols_small_1=Ue;Ue.b(0,1,1,217,57,57,0,0);var Ve=new q("s_assets_symbols_small_2",P,1,57,57,28,28,57,57,1);window.s_assets_symbols_small_2=Ve;Ve.b(0,1,537,209,57,57,0,0);var We=new q("s_assets_symbols_small_3",P,1,57,57,28,28,57,57,1);window.s_assets_symbols_small_3=We;
We.b(0,1,817,209,57,57,0,0);var Xe=new q("s_assets_symbols_small_4",P,1,57,57,28,28,57,57,1);window.s_assets_symbols_small_4=Xe;Xe.b(0,1,881,209,57,57,0,0);var Ye=new q("s_assets_symbols_small_5",P,1,57,57,28,28,57,57,1);window.s_assets_symbols_small_5=Ye;Ye.b(0,1,945,209,57,57,0,0);var Ze=new q("s_ui_overlay",P,1,96,96,48,48,96,96,1);window.s_ui_overlay=Ze;Ze.b(0,0,1,457,96,96,0,0);var $e=new q("s_assets_tiles_field",P,1,70,70,0,0,70,70,1);window.s_assets_tiles_field=$e;
$e.b(0,0,153,953,70,70,0,0);var af=new q("s_assets_tiles_1",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_1=af;af.b(0,0,569,585,70,88,0,0);var bf=new q("s_assets_tiles_2",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_2=bf;bf.b(0,0,73,577,70,88,0,0);var cf=new q("s_assets_tiles_3",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_3=cf;cf.b(0,0,1,561,70,88,0,0);var df=new q("s_assets_tiles_4",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_4=df;df.b(0,0,497,553,70,88,0,0);
var ef=new q("s_assets_tiles_5",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_5=ef;ef.b(0,0,713,561,70,88,0,0);var ff=new q("s_assets_tiles_6",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_6=ff;ff.b(0,0,641,585,70,88,0,0);var gf=new q("s_assets_tiles_7",P,1,70,88,35,44,70,88,1);window.s_assets_tiles_7=gf;gf.b(0,0,201,553,70,88,0,0);var hf=new q("s_animation_slime",P,6,89,83,44,41,534,83,6);window.s_animation_slime=hf;hf.b(0,0,273,601,82,83,4,0);hf.b(1,0,401,553,88,81,1,1);
hf.b(2,0,449,649,82,79,2,2);hf.b(3,0,785,609,82,78,2,1);hf.b(4,0,145,665,82,77,1,1);hf.b(5,0,537,681,81,77,0,1);var jf=new q("s_assets_diamond",P,8,37,58,18,29,296,58,8);window.s_assets_diamond=jf;jf.b(0,0,593,385,37,58,0,0);jf.b(1,0,905,513,37,58,0,0);jf.b(2,0,665,769,37,58,0,0);jf.b(3,1,401,201,37,58,0,0);jf.b(4,1,537,145,37,58,0,0);jf.b(5,0,281,145,37,58,0,0);jf.b(6,0,921,937,37,58,0,0);jf.b(7,1,129,209,37,58,0,0);var kf=new q("s_assets_pot",P,3,92,72,46,36,276,72,3);window.s_assets_pot=kf;
kf.b(0,1,945,145,58,61,17,4);kf.b(1,0,785,121,1,3,91,33);kf.b(2,0,305,521,91,72,0,0);var lf=new q("s_assets_shadow_1",P,1,44,29,22,14,44,29,1);window.s_assets_shadow_1=lf;lf.b(0,0,849,209,44,29,0,0);var mf=new q("s_assets_shadow_2",P,1,62,29,31,14,62,29,1);window.s_assets_shadow_2=mf;mf.b(0,0,169,745,62,29,0,0);var nf=new q("s_assets_shadow_3",P,1,36,24,18,12,36,24,1);window.s_assets_shadow_3=nf;nf.b(0,0,481,337,36,24,0,0);var of=new q("s_assets_cage",P,3,120,78,52,60,360,78,3);
window.s_assets_cage=of;of.b(0,1,145,1,67,69,18,9);of.b(1,0,737,953,67,69,18,9);of.b(2,1,73,1,67,69,18,9);var pf=new q("s_assets_pot_destroyed",P,4,92,72,46,58,368,72,4);window.s_assets_pot_destroyed=pf;pf.b(0,1,817,145,61,62,14,4);pf.b(1,1,1,153,61,61,14,7);pf.b(2,1,217,145,64,59,11,11);pf.b(3,1,401,145,63,54,15,11);var qf=new q("s_assets_cage_destroyed",P,2,120,78,52,60,240,78,2);window.s_assets_cage_destroyed=qf;qf.b(0,0,833,377,109,59,7,1);qf.b(1,0,897,201,120,50,0,0);
var rf=new q("s_assets_pig",P,1,55,63,27,56,55,63,1);window.s_assets_pig=rf;rf.b(0,1,633,145,55,63,0,0);var sf=new q("s_assets_pig_jumping",P,1,81,55,40,46,81,55,1);window.s_assets_pig_jumping=sf;sf.b(0,0,1,673,81,55,0,0);var tf=new q("s_hit_border",P,3,21,21,10,10,63,21,3);window.s_hit_border=tf;tf.b(0,0,1009,257,12,12,0,9);tf.b(1,0,1009,57,12,21,0,0);tf.b(2,0,633,313,21,21,0,0);var uf=new q("s_chest",P,2,111,82,39,64,222,82,2);window.s_chest=uf;uf.b(0,0,361,641,82,81,0,1);
uf.b(1,0,209,369,111,82,0,0);var vf=new q("s_logo_preload_tinglygames",pc,1,322,54,0,0,322,54,1);window.s_logo_preload_tinglygames=vf;vf.b(0,0,1,1,320,54,0,0);var wf=new q("s_loadingbar_bg",pc,1,38,20,0,0,38,20,1);window.s_loadingbar_bg=wf;wf.b(0,0,665,1,38,20,0,0);var xf=new q("s_loadingbar_fill",pc,1,30,12,0,0,30,12,1);window.s_loadingbar_fill=xf;xf.b(0,0,705,1,30,12,0,0);var yf=new q("s_logo_about",O,1,121,121,0,0,121,121,1);window.s_logo_about=yf;yf.b(0,0,865,65,117,80,2,21);
var zf=new q("s_logo_poki_about",O,1,123,58,0,0,123,58,1);window.s_logo_poki_about=zf;zf.b(0,0,865,1,123,58,0,0);var Af=new q("s_logo_poki_start",pc,1,120,60,0,0,120,60,1);window.s_logo_poki_start=Af;Af.b(0,0,537,1,119,59,1,1);var Bf=new q("s_ads_background",pc,1,200,200,100,100,200,200,1);window.s_ads_background=Bf;Bf.b(0,0,329,1,200,200,0,0);var Cf=new wa("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=Cf;var Q=new za("f_default","Arial");
window.f_default=Q;C(Q,12);Q.fill=!0;Q.setFillColor("Black");Ba(Q,1);Da(Q,!1);Q.setStrokeColor("Black");Fa(Q,1);Ha(Q,"miter");Ea(Q,1);Ga(Q,!1);Ja(Q,"left");Ka(Q,"top");Q.fb=0;Q.Ia=0;var Df=new wa("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=Df;var Ef=new wa("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=Ef;
var Ff=new wa("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");window.floaterFontFaceLoader=Ff;var Gf=new wa("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=Gf;var Hf=new za("floaterFontFace","Arial");window.floaterFontText1=Hf;C(Hf,24);Aa(Hf,"normal");Hf.fill=!0;Hf.setFillColor("#FFDE00");Ba(Hf,1);Da(Hf,!0);Hf.setStrokeColor("#6F1F00");Fa(Hf,4);Ha(Hf,"miter");Ea(Hf,1);
Ga(Hf,!0);Ia(Hf,"rgba(57,0,0,0.46)",4);Ja(Hf,"left");Ka(Hf,"top");Hf.fb=0;Hf.Ia=0;var If=new za("floaterFontFace","Arial");window.floaterFontText2=If;C(If,28);Aa(If,"normal");If.fill=!0;Ca(If,2,["#FFF600","#00DB48","blue"],.65,.02);Ba(If,1);Da(If,!0);If.setStrokeColor("#073400");Fa(If,4);Ha(If,"miter");Ea(If,1);Ga(If,!0);Ia(If,"rgba(0,57,43,0.47)",4);Ja(If,"left");Ka(If,"top");If.fb=0;If.Ia=0;var Jf=new za("floaterFontFace","Arial");window.floaterFontText3=Jf;C(Jf,30);Aa(Jf,"normal");Jf.fill=!0;
Ca(Jf,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);Ba(Jf,1);Da(Jf,!0);Jf.setStrokeColor("#4F0027");Fa(Jf,4);Ha(Jf,"miter");Ea(Jf,1);Ga(Jf,!0);Ia(Jf,"rgba(41,0,0,0.48)",5);Ja(Jf,"left");Ka(Jf,"top");Jf.fb=0;Jf.Ia=0;var Kf=new za("floaterFontFace","Arial");window.floaterFontText4=Kf;C(Kf,34);Aa(Kf,"normal");Kf.fill=!0;Ca(Kf,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);Ba(Kf,1);Da(Kf,!0);Kf.setStrokeColor("#001637");Fa(Kf,4);Ha(Kf,"miter");Ea(Kf,1);Ga(Kf,!0);Ia(Kf,"rgba(0,35,75,0.49)",6);Ja(Kf,"left");
Ka(Kf,"top");Kf.fb=0;Kf.Ia=0;var Lf=new za("floaterNumberFontFace","Arial");window.floaterFontNumberPositive=Lf;C(Lf,30);Lf.fill=!0;Lf.setFillColor("White");Ba(Lf,1);Da(Lf,!0);Lf.setStrokeColor("#00106F");Fa(Lf,2);Ha(Lf,"miter");Ea(Lf,1);Ga(Lf,!1);Ia(Lf,"rgba(0,4,57,0.51)",4);Ja(Lf,"left");Ka(Lf,"top");Lf.fb=0;Lf.Ia=0;var Mf=new za("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=Mf;C(Mf,30);Aa(Mf,"normal");Mf.fill=!0;Mf.setFillColor("#FF1E00");Ba(Mf,1);Da(Mf,!0);Mf.setStrokeColor("#3F0000");
Fa(Mf,2);Ha(Mf,"miter");Ea(Mf,1);Ga(Mf,!1);Ia(Mf,"rgba(57,0,0,0.49)",4);Ja(Mf,"left");Ka(Mf,"top");Mf.fb=0;Mf.Ia=0;var Nf=new wa("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=Nf;var Of=new wa("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=Of;var Pf=new za("ff_opensans_bold","Arial");window.f_game_ui_tiny=Pf;C(Pf,11);Pf.fill=!0;Pf.setFillColor("#799EC5");
Ba(Pf,1);Da(Pf,!1);Pf.setStrokeColor("White");Fa(Pf,1);Ha(Pf,"miter");Ea(Pf,1);Ga(Pf,!1);Ja(Pf,"center");Ka(Pf,"middle");Pf.fb=0;Pf.Ia=0;var Qf=new za("ff_opensans_bolditalic","Arial");window.f_game_ui_large=Qf;C(Qf,52);Qf.fill=!0;Qf.setFillColor("#172348");Ba(Qf,1);Da(Qf,!1);Qf.setStrokeColor("Black");Fa(Qf,1);Ha(Qf,"miter");Ea(Qf,1);Ga(Qf,!1);Ja(Qf,"center");Ka(Qf,"middle");Qf.fb=0;Qf.Ia=0;var Rf=new wa("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");
window.f_themeDefaultLoader=Rf;var S=new za("f_themeDefault","Arial");window.f_themeDefault=S;C(S,12);S.fill=!0;S.setFillColor("Black");Ba(S,1);Da(S,!1);S.setStrokeColor("White");Fa(S,5);Ha(S,"miter");Ea(S,1);Ga(S,!0);Ja(S,"left");Ka(S,"top");S.fb=0;S.Ia=0;var Sf=new wa("f_floaters","fonts/f_floaters.woff","fonts/f_floaters.ttf","fonts");window.f_floatersLoader=Sf;var Tf=new za("f_floaters","Arial");window.f_floaters=Tf;C(Tf,12);Tf.fill=!0;Tf.setFillColor("Black");Ba(Tf,1);Da(Tf,!1);Tf.setStrokeColor("Black");
Fa(Tf,1);Ha(Tf,"miter");Ea(Tf,1);Ga(Tf,!1);Ja(Tf,"center");Ka(Tf,"middle");Tf.fb=0;Tf.Ia=0;var Uf=new wa("f_game_ui","fonts/f_game_ui.woff","fonts/f_game_ui.ttf","fonts");window.f_game_uiLoader=Uf;var T=new za("f_game_ui","Arial");window.f_game_ui=T;C(T,12);T.fill=!0;T.setFillColor("Black");Ba(T,1);Da(T,!1);T.setStrokeColor("Black");Fa(T,1);Ha(T,"miter");Ea(T,1);Ga(T,!1);Ja(T,"left");Ka(T,"top");T.fb=0;T.Ia=0;var Vf=new za("Arial","Arial");window.f_tap_to_play=Vf;C(Vf,28);Aa(Vf,"bold");Vf.fill=!0;
Vf.setFillColor("#1b2b34");Ba(Vf,1);Da(Vf,!1);Vf.setStrokeColor("Black");Fa(Vf,28);Ha(Vf,"round");Ea(Vf,.55);Ga(Vf,!1);Ja(Vf,"center");Ka(Vf,"middle");Vf.fb=0;Vf.Ia=0;var Wf=new za("Arial","Arial");window.f_adblocker=Wf;C(Wf,28);Aa(Wf,"normal");Wf.fill=!0;Wf.setFillColor("White");Ba(Wf,1);Da(Wf,!1);Wf.setStrokeColor("Black");Fa(Wf,28);Ha(Wf,"round");Ea(Wf,.55);Ga(Wf,!1);Ja(Wf,"center");Ka(Wf,"middle");Wf.fb=0;Wf.Ia=0;var Xf=new za("Arial","Arial");window.f_copyright=Xf;C(Xf,22);Aa(Xf,"bold");
Xf.fill=!0;Xf.setFillColor("#1b2b34");Ba(Xf,1);Da(Xf,!1);Xf.setStrokeColor("Black");Fa(Xf,28);Ha(Xf,"round");Ea(Xf,.55);Ga(Xf,!1);Ja(Xf,"left");Ka(Xf,"middle");Xf.fb=0;Xf.Ia=0;var Yf=new za("Arial","Arial");window.f_thankyou=Yf;C(Yf,50);Aa(Yf,"bold");Yf.fill=!0;Yf.setFillColor("#1b2b34");Ba(Yf,1);Da(Yf,!1);Yf.setStrokeColor("Black");Fa(Yf,28);Ha(Yf,"round");Ea(Yf,.55);Ga(Yf,!1);Ja(Yf,"center");Ka(Yf,"middle");Yf.fb=0;Yf.Ia=0;var Zf=new za("Arial","Arial");window.f_loading_game=Zf;C(Zf,20);Aa(Zf,"bold");
Zf.fill=!0;Zf.setFillColor("#1b2b34");Ba(Zf,1);Da(Zf,!1);Zf.setStrokeColor("Black");Fa(Zf,28);Ha(Zf,"round");Ea(Zf,.55);Ga(Zf,!1);Ja(Zf,"left");Ka(Zf,"middle");Zf.fb=0;Zf.Ia=0;var $f=new za("Arial","Arial");window.f_interstitial=$f;C($f,20);Aa($f,"bold");$f.fill=!0;$f.setFillColor("#1b2b34");Ba($f,.38);Da($f,!1);$f.setStrokeColor("Black");Fa($f,28);Ha($f,"round");Ea($f,.55);Ga($f,!1);Ja($f,"center");Ka($f,"middle");$f.fb=0;$f.Ia=0;
var ag=new ob("battleMusic","audio/battleMusic.mp3","audio/battleMusic.ogg","audio");window.battleMusic=ag;var U=new ob("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=U;var bg=new E("a_battleMusic",ag,0,34909,1,10,["game"]);window.a_battleMusic=bg;mc.yu=new E("_002_Monster_hit_01",U,0,247,1,10,["game"]);mc._002_Monster_hit_01=mc.yu;mc.zu=new E("_002_Monster_hit_02",U,2E3,239,1,10,["game"]);mc._002_Monster_hit_02=mc.zu;
mc.Au=new E("_002_Monster_hit_03",U,4E3,301,1,10,["game"]);mc._002_Monster_hit_03=mc.Au;mc.Bu=new E("_002_Monster_hit_04",U,6E3,324,1,10,["game"]);mc._002_Monster_hit_04=mc.Bu;N.Cu=new E("_004_Monster_select_01",U,8E3,329,1,10,["game"]);N._004_Monster_select_01=N.Cu;N.Du=new E("_004_Monster_select_02",U,1E4,277,1,10,["game"]);N._004_Monster_select_02=N.Du;N.Eu=new E("_004_Monster_select_03",U,12E3,284,1,10,["game"]);N._004_Monster_select_03=N.Eu;
N.Fu=new E("_004_Monster_select_04",U,14E3,249,1,10,["game"]);N._004_Monster_select_04=N.Fu;N.Gu=new E("_004_Monster_select_05",U,16E3,244,1,10,["game"]);N._004_Monster_select_05=N.Gu;N.Hu=new E("_004_Monster_select_06",U,18E3,227,1,10,["game"]);N._004_Monster_select_06=N.Hu;N.Iu=new E("_004_Monster_select_07",U,2E4,251,1,10,["game"]);N._004_Monster_select_07=N.Iu;N.Ju=new E("_004_Monster_select_08",U,22E3,251,1,10,["game"]);N._004_Monster_select_08=N.Ju;
nc.Ku=new E("_005_Monster_fall_01",U,24E3,533,1,10,["game"]);nc._005_Monster_fall_01=nc.Ku;nc.Lu=new E("_005_Monster_fall_02",U,26E3,544,1,10,["game"]);nc._005_Monster_fall_02=nc.Lu;nc.Mu=new E("_005_Monster_fall_03",U,28E3,467,1,10,["game"]);nc._005_Monster_fall_03=nc.Mu;nc.Nu=new E("_005_Monster_fall_04",U,3E4,612,1,10,["game"]);nc._005_Monster_fall_04=nc.Nu;nc.Ou=new E("_005_Monster_fall_05",U,32E3,601,1,10,["game"]);nc._005_Monster_fall_05=nc.Ou;
var cg=new E("a_powerup_trigger",U,34E3,1702,1,10,["game"]);window.a_powerup_trigger=cg;var dg=new E("a_powerup_hit",U,37E3,943,1,10,["game"]);window.a_powerup_hit=dg;var eg=new E("a_slash_final",U,39E3,718,1,10,["game"]);window.a_slash_final=eg;var fg=new E("a_diamond",U,41E3,1163,1,10,["game"]);window.a_diamond=fg;var gg=new E("a_cloner_destroy",U,44E3,495,1,10,["game"]);window.a_cloner_destroy=gg;var hg=new E("a_goal",U,46E3,1218,1,10,["game"]);window.a_goal=hg;
var ig=new E("a_intro",U,49E3,2727,1,10,["game"]);window.a_intro=ig;var jg=new E("a_no_moves",U,53E3,774,1,10,["game"]);window.a_no_moves=jg;oc.Pu=new E("_013_Sludge_remove_01",U,55E3,250,1,10,["game"]);oc._013_Sludge_remove_01=oc.Pu;oc.Qu=new E("_013_Sludge_remove_02",U,57E3,260,1,10,["game"]);oc._013_Sludge_remove_02=oc.Qu;oc.Ru=new E("_013_Sludge_remove_03",U,59E3,466,1,10,["game"]);oc._013_Sludge_remove_03=oc.Ru;var kg=new E("a_guard",U,61E3,492,1,10,["game"]);window.a_guard=kg;
var lg=new E("a_blocker",U,63E3,959,1,10,["game"]);window.a_blocker=lg;var mg=new E("a_frenzy_start",U,65E3,1625,1,10,["game"]);window.a_frenzy_start=mg;var ng=new E("a_goal_reached",U,68E3,3665,1,10,["game"]);window.a_goal_reached=ng;var og=new E("a_cloner_clone",U,73E3,1500,1,10,["game"]);window.a_cloner_clone=og;var pg=new E("a_ambient",U,76E3,13794,1,10,["game"]);window.a_ambient=pg;var qg=new E("a_music",U,91E3,13794,1,10,["game"]);window.a_music=qg;
var rg=new E("a_levelStart",U,106E3,1002,1,10,["sfx"]);window.a_levelStart=rg;var sg=new E("a_levelComplete",U,109E3,1002,1,10,["sfx"]);window.a_levelComplete=sg;var tg=new E("a_mouseDown",U,112E3,471,1,10,["sfx"]);window.a_mouseDown=tg;var ug=new E("a_levelend_star_01",U,114E3,1161,1,10,["sfx"]);window.a_levelend_star_01=ug;var vg=new E("a_levelend_star_02",U,117E3,1070,1,10,["sfx"]);window.a_levelend_star_02=vg;var wg=new E("a_levelend_star_03",U,12E4,1039,1,10,["sfx"]);
window.a_levelend_star_03=wg;var xg=new E("a_levelend_fail",U,123E3,1572,1,10,["sfx"]);window.a_levelend_fail=xg;var yg=new E("a_levelend_score_counter",U,126E3,54,1,10,["sfx"]);window.a_levelend_score_counter=yg;var zg=new E("a_levelend_score_end",U,128E3,888,1,10,["sfx"]);window.a_levelend_score_end=zg;var Ag=new E("a_medal",U,13E4,1225,1,10,["sfx"]);window.a_medal=Ag;M=M||{};M["nl-nl"]=M["nl-nl"]||{};M["nl-nl"].loadingScreenLoading="Laden...";M["nl-nl"].startScreenPlay="SPELEN";
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
var Bg={};
function Cg(){Bg={Je:{Cl:"en-us",zk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp it-it".split(" ")},we:{od:K(1040),nr:K(960),zc:K(640),rh:K(640),eg:K(0),Tl:K(-80),dg:0,minHeight:K(780),Cn:{id:"canvasBackground",depth:50},Kd:{id:"canvasGame",depth:100,top:K(200,"round"),left:K(40,"round"),width:K(560,"round"),height:K(560,"round")},kd:{id:"canvasGameUI",depth:150,top:0,left:0,height:K(120,"round")},$f:{id:"canvasMain",depth:200}},Dn:{od:K(640),nr:K(640),zc:K(1152),rh:K(1152),
eg:K(0),Tl:K(0),dg:0,minHeight:K(640),minWidth:K(850),Cn:{id:"canvasBackground",depth:50},Kd:{id:"canvasGame",depth:100,top:K(40,"round"),left:K(296,"round"),width:K(560,"round"),height:K(560,"round")},kd:{id:"canvasGameUI",depth:150,top:0,left:K(151),width:K(140)},$f:{id:"canvasMain",depth:200}},yc:{bigPlay:{type:"text",m:Pd,Pa:K(38),Mb:K(99),font:{align:"center",l:"middle",fontSize:L({big:46,small:30}),fillColor:"#01198a",la:{p:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Dd:2,Ed:K(30),fontSize:L({big:46,
small:30})},difficulty_toggle:{type:"toggleText",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ma:[{id:"0",m:Sc,aa:"optionsDifficulty_easy"},{id:"1",m:Rc,aa:"optionsDifficulty_medium"},{id:"2",m:Qc,aa:"optionsDifficulty_hard"}],Zh:K(30),$h:K(12),Og:K(10),Dd:2,Ed:K(30),fontSize:L({big:40,small:20})},music_toggle:{type:"toggle",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,
small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ma:[{id:"on",m:Od,aa:"optionsMusic_on"},{id:"off",m:Nd,aa:"optionsMusic_off"}],Zh:K(30),$h:K(12),Og:0,Dd:2,Ed:K(30)},sfx_toggle:{type:"toggle",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ma:[{id:"on",m:Md,aa:"optionsSFX_on"},{id:"off",m:Ld,aa:"optionsSFX_off"}],Zh:K(30),$h:K(12),Og:0,Dd:2,Ed:K(30)},
music_big_toggle:{type:"toggleText",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ma:[{id:"on",m:"undefined"!==typeof Sd?Sd:void 0,aa:"optionsMusic_on"},{id:"off",m:"undefined"!==typeof Td?Td:void 0,aa:"optionsMusic_off"}],Zh:K(28,"round"),$h:K(10),Og:K(10),Dd:2,Ed:K(30),fontSize:L({big:40,small:20})},sfx_big_toggle:{type:"toggleText",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",
fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},ma:[{id:"on",m:"undefined"!==typeof Qd?Qd:void 0,aa:"optionsSFXBig_on"},{id:"off",m:"undefined"!==typeof Rd?Rd:void 0,aa:"optionsSFXBig_off"}],Zh:K(33,"round"),$h:K(12),Og:K(10),Dd:2,Ed:K(30),fontSize:L({big:40,small:20})},language_toggle:{type:"toggleText",m:Kd,Pa:K(106),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,
offsetY:2,blur:0}},ma:[{id:"en-us",m:Tc,aa:"optionsLang_en-us"},{id:"en-gb",m:Uc,aa:"optionsLang_en-gb"},{id:"nl-nl",m:Vc,aa:"optionsLang_nl-nl"},{id:"de-de",m:Xc,aa:"optionsLang_de-de"},{id:"fr-fr",m:Yc,aa:"optionsLang_fr-fr"},{id:"pt-br",m:Zc,aa:"optionsLang_pt-br"},{id:"es-es",m:$c,aa:"optionsLang_es-es"},{id:"ru-ru",m:bd,aa:"optionsLang_ru-ru"},{id:"it-it",m:ed,aa:"optionsLang_it-it"},{id:"ar-eg",m:cd,aa:"optionsLang_ar-eg"},{id:"ko-kr",m:dd,aa:"optionsLang_ko-kr"},{id:"tr-tr",m:Wc,aa:"optionsLang_tr-tr"},
{id:"jp-jp",m:ad,aa:"optionsLang_jp-jp"}],Zh:K(40),$h:K(20),Og:K(10),Dd:2,Ed:K(30),fontSize:L({big:40,small:20})},default_text:{type:"text",m:Jd,Pa:K(40),Mb:K(40),font:{align:"center",l:"middle",fontSize:L({big:40,small:20}),fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Dd:2,Ed:K(30),fontSize:L({big:40,small:20})},default_image:{type:"image",m:Jd,Pa:K(40),Mb:K(40),Ed:K(6)},options:{type:"image",m:Hd}},Bn:{bigPlay:{type:"text",m:Pd,Pa:K(40),Mb:K(76),font:{align:"center",
l:"middle",fontSize:L({big:40,small:20}),fillColor:"#01198a",la:{p:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Dd:2,Ed:K(30),fontSize:L({big:40,small:20})}},Ik:{green:{font:{align:"center",l:"middle",fillColor:"#018a17",la:{p:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",l:"middle",fillColor:"#01198a",la:{p:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",l:"middle",fillColor:"#004f89",la:{p:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},
orange:{font:{align:"center",l:"middle",fillColor:"#9a1900",la:{p:!0,color:"#ffb986",offsetX:0,offsetY:2,blur:0}}},orangeyellow:{font:{align:"center",l:"middle",fillColor:"#8d2501",la:{p:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",l:"middle",fillColor:"#c6258f",la:{p:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",l:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",l:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",
l:"middle",fillColor:"#ffffff",la:{p:!0,color:"#4c0200",offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",l:"middle",fillColor:"#ffffff",la:{p:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},$a:{Cz:20},Rd:{backgroundImage:"undefined"!==typeof Wd?Wd:void 0,Lx:0,uv:500,Ol:5E3,sx:5E3,ut:-1,Az:12,zz:100,Xe:K(78),$p:{align:"center"},Km:K(560),Dh:K(400),Eh:{align:"center"},zg:K(680),rf:K(16),Jo:K(18),xj:K(8),Gs:K(8),Hs:K(9),Is:K(9),Tj:{align:"center",
fillColor:"#3B0057",fontSize:K(24)},Ut:{align:"center"},Zp:K(620),Jm:K(500),yj:"center",Bg:K(500),Aj:K(60),bc:{align:"center"},Yc:{align:"bottom",offset:K(20)},Oo:K(806),Mo:500,gx:K(20)},Lo:{yj:"right",Km:K(280),zg:K(430),Bg:K(340),bc:{align:"right",offset:K(32)},Yc:K(560),Oo:K(560)},Bm:{zn:K(860),backgroundImage:void 0!==typeof Wd?Wd:void 0,hw:700,Ws:1800,Ex:700,ky:2600,yh:void 0!==typeof Wd?qe:void 0,Pd:700,hj:{align:"center"},ml:{align:"center"},ij:void 0!==typeof qe?-qe.height:0,xh:{align:"top",
offset:K(20)},ho:1,Nr:1,io:1,Or:1,fo:1,Mr:1,lw:H,mw:jc,jw:H,kw:H,iw:H,jy:{align:"center"},jm:K(656),Hj:K(300),hm:700,iy:700,rr:K(368),Xk:K(796),Zi:K(440),qr:700,Wo:K(36),Sl:K(750),Dx:500,yj:"center",Bg:K(500),Aj:K(60),bc:{align:"center"},Yc:{align:"bottom",offset:K(20)},Oo:K(806),Mo:500,gx:K(20)},Sp:{zn:K(0),jm:K(456),Hj:K(320),rr:{align:"center"},Xk:K(346),Zi:K(460),Wo:{align:"left",offset:K(32)},Sl:K(528),yj:"right",Bg:K(340),bc:{align:"right",offset:K(32)},Yc:K(560),Oo:K(560)},wg:{Zx:{align:"center",
offset:K(-230)},fp:{align:"top",offset:K(576)},Yx:"options",cd:{l:"bottom"},Jf:{align:"center"},Gc:{align:"top",offset:K(35,"round")},Wd:K(232),If:K(98),Oz:{align:"center",offset:K(-206)},mq:{align:"top",offset:K(30)},Nz:{align:"center",offset:K(206)},lq:{align:"top",offset:K(30)},type:"grid",Vx:3,DB:3,Wx:5,EB:4,ur:!0,Wv:!0,qo:K(78),Sr:{align:"top",offset:K(140)},Ur:{align:"top",offset:K(140)},Tr:K(20),rw:K(18),sw:K(18),Vw:{lo:{fontSize:L({big:60,small:30}),fillColor:"#3F4F5E",align:"center",l:"middle",
la:{p:!0,color:"#D0D8EA",offsetX:0,offsetY:K(6),blur:0}}},Ww:{lo:{fontSize:L({big:32,small:16}),fillColor:"#3F4F5E",align:"center",l:"middle",la:{p:!0,color:"#D0D8EA",offsetX:0,offsetY:K(2),blur:0}}},Bs:K(438),Cs:K(438),ss:{align:"center"},ts:{align:"center"},Ks:{align:"center"},Ls:{align:"center",offset:K(-22)},ws:{align:"center"},xs:{align:"center",offset:K(-10)},At:{align:"center",offset:K(216)},Pp:{align:"top",offset:K(574)},zt:{fontSize:L({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},
Bt:K(10),lp:{fontSize:L({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},mp:{align:"center"},np:{align:"top",offset:K(588)},ny:K(160),my:K(40),backgroundImage:"undefined"!==typeof ae?ae:void 0,vz:K(10),wz:200,uz:K(200),bB:K(600),Qx:800,Px:500},us:{mq:{align:"top",offset:K(20)},lq:{align:"top",offset:K(20)},Gc:{align:"top",offset:K(25,"round")},qo:K(234),Sr:{align:"top",offset:K(110)},Ur:{align:"top",offset:K(110)},Pp:{align:"top",offset:K(536)},np:{align:"top",offset:K(550)},fp:{align:"top",
offset:K(538)}},Xw:{Zc:"undefined"!==typeof Ud?Ud:void 0,fy:{align:"center"},Ys:"undefined"!==typeof Ud?-Ud.height:void 0,ey:[{type:"y",J:0,duration:800,end:{align:"center",offset:K(-142)},kb:jc,ad:rg}],IB:[{type:"y",J:0,duration:600,end:"undefined"!==typeof Ud?-Ud.height:void 0,kb:ic,Zz:!0}],hv:{align:"center",l:"middle"},kv:{align:"center"},lv:0,jv:K(500),iv:K(80),Aw:{align:"center",l:"middle"},Dw:{align:"center"},Ew:0,Cw:K(560),Bw:K(80),hy:3500},aB:{ey:[{type:"y",J:0,duration:800,end:{align:"center"},
kb:jc,ad:rg}]},kA:{Zc:"undefined"!==typeof s_overlay_challenge_start?s_overlay_challenge_start:void 0,fy:{align:"center"},Ys:K(56),dm:0,em:0,cd:{align:"center",l:"top"},Wd:K(500),If:K(100),Jf:{align:"center"},Gc:K(90),mB:{align:"center",l:"middle"},rB:K(500),qB:K(80),vB:{align:"center"},wB:K(250),kC:{align:"center",l:"top"},mC:K(500),lC:K(40),nC:{align:"center"},oC:K(348),jC:{align:"center",l:"top"},qC:K(500),pC:K(50),sC:{align:"center"},tC:K(388),ZC:{align:"center",l:"top"},aD:K(500),$C:K(40),dD:{align:"center"},
eD:K(442),bD:0,cD:0,YC:{align:"center",l:"top"},gD:K(500),fD:K(50),hD:{align:"center"},iD:K(482),XC:K(10),VC:0,WC:0,Ki:800,qn:jc,rn:600,sn:ic,hy:3500},jA:{Rz:500,Ki:800,AB:1500,BB:500,rC:2500,wC:500,uC:3200,vC:800,hB:4200,iB:300,cA:4500,LB:{align:"center"},MB:K(-800),JB:{align:"center"},KB:K(52),dm:0,em:0,el:.8,Cr:"#000000",Xo:{align:"center",l:"middle"},jB:K(360),eB:K(120),fB:K(4),gB:K(4),kB:{align:"center"},lB:K(340),IC:{align:"center"},JC:K(600),HC:K(500),GC:K(120),FC:{align:"center",l:"middle"},
jD:{align:"center",l:"middle"},nD:K(360),kD:K(60),lD:K(4),mD:K(4),oD:{align:"center"},pD:K(480),OC:K(460),KC:{align:"center"},LC:K(400),dA:{align:"center"},eA:K(500),yB:{align:"center",l:"middle"},zB:K(75,"round"),xB:K(48),CB:K(120),uB:K(214,"round"),nB:K(40),oB:K(4),pB:K(4),sB:0,tB:0,BA:{align:"center",l:"middle"},EA:K(220),DA:K(180),CA:K(80),zA:K(4),AA:K(4)},xa:{cm:{Mn:"undefined"!==typeof s_overlay_difficulty?s_overlay_difficulty:void 0,$v:"undefined"!==typeof s_overlay_endless?s_overlay_endless:
void 0,Yw:"undefined"!==typeof Yd?Yd:void 0,Uw:"undefined"!==typeof Zd?Zd:void 0},yz:500,Ki:800,qn:jc,rn:800,sn:dc,Ec:{align:"center"},sc:0,cd:{align:"center",l:"middle",fontSize:L({big:26,small:13})},Jf:{align:"center"},Gc:K(58),Wd:K(500),If:K(100),Vp:{align:"center",l:"middle",fontSize:L({big:56,small:28})},rz:{align:"center"},Wp:K(236),bl:{align:"center",l:"top",fontSize:L({big:24,small:12})},yr:{align:"center"},aj:K(144),uh:{align:"center",l:"top",fontSize:L({big:56,small:28})},cl:{align:"center"},
fg:K(176),wh:K(200),vh:K(60),Uh:{align:"center",l:"top",fontSize:L({big:24,small:12})},Df:{align:"center"},Qe:K(286),Ht:K(0),Gr:!1,Cd:K(14),Fm:K(10),Cf:{align:"center",l:"top",fontSize:L({big:24,small:12})},Sh:K(10),Th:K(4),Vh:K(200),EC:K(50),rv:{align:"center",offset:K(12)},Tq:K(549),fw:{align:"center",offset:K(162)},Hr:K(489),kf:{align:"center",offset:K(250)},cg:K(10),nh:K(90),bg:K(90),Jp:{align:"center",offset:K(-177,"round")},Kp:K(120),Lp:{align:"center"},Mp:K(96),Np:{align:"center",offset:K(179,
"round")},Op:K(120),CC:200,cz:500,wt:800,yt:0,fz:0,ez:300,dz:200,xt:300,el:.8,Mc:800,Cr:"#000000",Rl:K(508),Cj:K(394),Ns:K(96),Os:K(74),Pl:3,Fh:400,tx:2500,dB:0,wx:K(100),Ps:1.5,Bx:{align:"center"},Cx:K(76),Ql:K(180),Ax:K(36),Qs:{align:"center",l:"middle",fontSize:L({big:22,small:12}),K:"ff_opensans_extrabold",fillColor:"#1d347f",la:{p:!0,color:"#68cbfa",offsetY:K(2)}},Ms:500,ux:500,vx:K(-30),yx:500,xx:0,zx:4E3,Mm:600,Gz:1500,$q:500,jh:750,Fw:{align:"center"},Gw:K(290),as:K(350),Nx:1E3,type:{level:{Ck:"level",
Bd:!0,Qh:!0,Vj:"title_level",Re:"totalScore",Ak:"retry",hl:"next"},failed:{Ck:"failed",Bd:!1,Qh:!1,Vj:"title_level",Kt:"subtitle_failed",Ak:"exit",hl:"retry"},endless:{Ck:"endless",Bd:!1,Qh:!0,Vj:"title_endless",Pn:"totalScore",Re:"highScore",Ak:"exit",hl:"retry"},difficulty:{Ck:"difficulty",Bd:!1,Qh:!0,Vj:"title_difficulty",Pn:"timeLeft",Re:["totalScore","timeBonus"],Ak:"exit",hl:"retry"}}},rs:{cg:K(0),Gc:K(30),aj:K(114),fg:K(146),Qe:K(266),Tq:K(488),Hr:K(428),Rl:{align:"center",offset:K(220)},Cj:K(260)},
oj:{backgroundImage:"undefined"!==typeof pe?pe:void 0},options:{backgroundImage:Xd,Ec:{align:"center"},sc:0,cd:{},Jf:{align:"center"},Gc:K(58),Wd:K(500),If:K(100),Kk:K(460,"round"),Jk:{align:"center"},Oi:{align:"center",offset:K(36)},ae:K(10,"round"),kf:K(510),cg:K(10),nh:K(130),bg:K(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames",
"quit"]},Fj:800,Gj:jc,am:600,bm:dc,kr:{align:"center"},Sk:K(260),Rk:K(460),Qk:K(300),ir:{align:"center"},Pk:K(460),hr:{align:"center"},Ok:K(560,"round"),Ui:K(460,"round"),pm:{},Xd:"undefined"!==typeof Vd?Vd:void 0,Pm:{align:"center"},Ye:K(84,"round"),Vm:{align:"center",l:"top"},Wm:K(480),dq:K(46),gu:{align:"center"},Xm:K(110,"round"),eu:{align:"center"},Tm:K(160,"round"),fu:{align:"center"},Um:K(446,"round"),Sm:{l:"middle",align:"center",fontSize:L({big:36,small:18})},ci:K(480),cq:K(160),du:{align:"center",
offset:K(-80,"round")},Rm:K(556,"round"),cu:{align:"center",offset:K(80,"round")},Qm:K(556,"round"),rk:{align:"center",l:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ia:K(6)},sk:K(480),Lq:K(50),tk:{align:"center"},dh:K(106,"round"),Fi:{align:"center",l:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ia:K(6)},Uf:K(480),Gi:K(110),eh:{align:"center"},fh:K(396,"round"),Di:{align:"center"},Ei:K(140),mn:{align:"center"},bh:K(500),Ci:K(480),nn:{align:"center",l:"top",fillColor:"#808080",
fontSize:L({big:12,small:8})},Oq:{align:"center"},vk:K(610),Nq:K(440),Mq:K(20),gh:K(200),uk:K(200),pu:K(80),qu:K(140),ou:K(10)},$x:{Gc:K(12),Oi:{align:"center",offset:K(16)},Sk:K(200),Qk:K(300),Pk:K(400),Ok:K(500,"round"),Ye:K(60,"round"),Xm:K(80,"round"),Tm:K(134,"round"),Um:K(410,"round"),Rm:K(500,"round"),Qm:K(500,"round"),dh:K(86,"round"),Ei:K(126),fh:K(392,"round"),bh:K(490),vk:K(590)},Xs:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:Xd,Ec:{align:"center"},
sc:K(120),cd:{},Jf:{align:"center"},Gc:K(200),Kk:K(460,"round"),Jk:{align:"center"},Oi:{align:"center",offset:K(140)},ae:K(10,"round"),kf:K(510),cg:K(10),nh:K(130),bg:K(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},Fj:800,Gj:jc,am:600,bm:dc,pm:{},bC:{align:"center"},cC:K(360),aC:K(460),$B:K(300),WB:"default_text",XB:{align:"center"},
YB:K(630),TB:"default_text",UB:{align:"center"},VB:K(730,"round"),ZB:K(460,"round"),jr:{},kr:{align:"center"},Sk:K(200),Rk:K(460),Qk:K(250),ir:{align:"center"},Pk:K(520),hr:{align:"center"},Ok:K(620,"round"),Ui:K(460,"round"),Xo:{},Hx:{align:"center"},Ix:K(200),Yo:K(460),Gx:K(300),Xd:"undefined"!==typeof Vd?Vd:void 0,Pm:{align:"center"},Ye:K(0,"round"),Vm:{align:"center",l:"top"},Wm:K(480),dq:K(50),gu:{align:"center"},Xm:K(20,"round"),eu:{align:"center"},Tm:K(70,"round"),fu:{align:"center"},Um:K(356,
"round"),Sm:{l:"middle",align:"center",fontSize:L({big:36,small:18})},ci:K(480),cq:K(150),du:K(224,"round"),Rm:K(636,"round"),cu:K(350,"round"),Qm:K(636,"round"),rk:{align:"center",l:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ia:K(6)},sk:K(480),Lq:K(50),tk:{align:"center"},dh:K(26,"round"),Fi:{align:"center",l:"top",fillColor:"#3C0058",fontSize:L({big:26,small:13}),Ia:K(6)},Uf:K(480),Gi:K(110),eh:{align:"center"},fh:K(316,"round"),Di:{align:"center"},Ei:K(60),mn:{align:"center"},bh:K(420),
Ci:K(480),nn:{align:"center",l:"top",fillColor:"#808080",fontSize:L({big:12,small:8})},Oq:{align:"center"},vk:K(530),Nq:K(440),Mq:K(20),gh:K(200),uk:K(200),pu:K(80),qu:K(100),ou:K(10)},Ln:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:Xd,Ec:{align:"center"},sc:K(120),Kk:K(460,"round"),Jk:{align:"center"},Oi:{align:"bottom",offset:K(20)},ae:K(10,"round"),kf:K(510),cg:K(10),nh:K(130),bg:K(90),Fj:800,Gj:jc,am:600,bm:dc,ft:{},Cy:{align:"center"},Dy:{align:"center",offset:K(40)},
sp:K(460),rp:K(300),Jt:{},Ay:{align:"center"},By:{align:"center",offset:K(160)},zy:K(460),yy:K(200)},jl:{backgroundImage:"undefined"!==typeof $d?$d:void 0,Ut:{align:"center"},Zp:K(152),Jm:K(560),xz:K(560),font:{align:"center",l:"middle",fontSize:L({big:52,small:26}),fillColor:"#FFFFFF"},Cv:{align:"center"},cr:K(600),br:K(460),ar:"default_text"},$n:{cr:K(520)}}}
var Dg={wy:"poki",Pj:{ex:!1,Nn:[]},Je:{Cl:"en-us",zk:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr".split(" ")},Xq:{show:!1}},V=null;
function Eg(){V={th:{ah:50},lc:{vA:100,$y:16},mc:{Ir:1250,Jr:-50,Il:2E3,Jl:-100,Hy:800,Iy:1500,Ly:750,My:-40},oa:{Gv:300,Ri:350,Jv:250,Kv:500,Rv:30,Sv:250,Tv:400,ew:30,Zn:1250,Ow:20,Pw:400,So:300,Kx:150,$c:50,qt:500},jg:{sh:"locked",ao:"gridchain",he:"level",ka:[25,25],Nj:!1,Jg:!0},fj:{To:4,az:{i:-1.5,j:3},Hz:250},e:{H:3,kt:K(32)},xa:{Re:["totalScore","highScore"]},ja:{Sn:90,Xr:.65,Hg:200,ke:.2},G:{nx:750,Jx:150},Tb:{yv:50,oh:50,Uv:5E3,Iw:3,QB:2500,qy:2500,$s:1500,sy:5E3,ty:1500,bt:750,RB:700,uy:750,
Ky:50},da:{height:K(70),width:K(70)},n:{level1:{width:250,height:200,items:[{x:150,y:0,id:"monster",kind:2},{x:200,y:50,id:"monster",kind:2},{x:200,y:100,id:"monster",kind:2},{x:150,y:150,id:"monster",kind:3},{x:150,y:100,id:"monster",kind:1},{x:150,y:50,id:"monster",kind:3},{x:100,y:100,id:"monster",kind:3},{x:50,y:150,id:"monster",kind:1},{x:50,y:100,id:"monster",kind:2},{x:50,y:50,id:"monster",kind:1},{x:50,y:0,id:"monster",kind:3},{x:0,y:50,id:"monster",kind:3},{x:0,y:100,id:"monster",kind:3},
{x:100,y:50,id:"monster",kind:1},{x:100,y:0,id:"monster",kind:0},{x:100,y:150,id:"monster",kind:0},{x:0,y:0,id:"wall"},{x:200,y:0,id:"wall"},{x:200,y:150,id:"wall"},{x:0,y:150,id:"wall"}]},level2:{width:250,height:200,items:[{x:50,y:50,id:"blocker"},{x:150,y:50,id:"blocker"},{x:200,y:100,id:"blocker"},{x:100,y:100,id:"blocker"},{x:0,y:100,id:"blocker"},{x:50,y:150,id:"blocker"},{x:150,y:150,id:"blocker"}]},level3:{width:300,height:250,items:[{x:50,y:50,id:"wall"},{x:200,y:50,id:"wall"},{x:50,y:150,
id:"wall"},{x:200,y:150,id:"wall"},{x:100,y:100,id:"blocker"},{x:150,y:100,id:"blocker"}]},tut_area:{width:300,height:300,items:[{x:50,y:0,id:"monster",kind:0},{x:100,y:0,id:"monster",kind:0},{x:150,y:0,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:0},{x:0,y:50,id:"monster",kind:0},{x:50,y:100,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:150,y:200,id:"monster",kind:1},{x:150,y:150,id:"monster",kind:1},{x:200,y:150,id:"monster",kind:0},{x:200,y:100,id:"monster",kind:0},{x:250,y:50,
id:"monster",kind:0},{x:0,y:0,id:"blocker"},{x:50,y:50,id:"blocker"},{x:0,y:250,id:"blocker"},{x:250,y:250,id:"blocker"},{x:250,y:0,id:"blocker"},{x:200,y:50,id:"blocker"},{x:0,y:200,id:"blocker"},{x:50,y:250,id:"blocker"},{x:200,y:250,id:"blocker"},{x:250,y:200,id:"blocker"},{x:100,y:250,id:"blocker"},{x:150,y:250,id:"blocker"},{x:50,y:200,id:"blocker"},{x:200,y:200,id:"blocker"},{x:100,y:200,id:"monster",kind:0},{x:100,y:150,id:"monster",kind:0},{x:100,y:100,id:"monster",kind:0},{x:100,y:50,id:"monster",
kind:0},{x:150,y:50,id:"monster",kind:0},{x:150,y:100,id:"monster",kind:1},{x:250,y:100,id:"monster",kind:0},{x:250,y:150,id:"monster",kind:0},{x:0,y:150,id:"monster",kind:0},{x:0,y:100,id:"monster",kind:0},{x:150,y:150,id:"pow_exp"}]},tut_color:{width:250,height:350,items:[{x:0,y:300,id:"wall"},{x:0,y:200,id:"wall"},{x:0,y:100,id:"wall"},{x:0,y:0,id:"wall"},{x:200,y:300,id:"wall"},{x:200,y:200,id:"wall"},{x:200,y:100,id:"wall"},{x:200,y:0,id:"wall"},{x:100,y:300,id:"wall"},{x:50,y:0,id:"monster",
kind:0},{x:100,y:0,id:"monster",kind:0},{x:150,y:0,id:"monster",kind:0},{x:150,y:50,id:"monster",kind:0},{x:200,y:50,id:"monster",kind:0},{x:150,y:100,id:"monster",kind:0},{x:150,y:150,id:"monster",kind:0},{x:200,y:150,id:"monster",kind:0},{x:150,y:200,id:"monster",kind:0},{x:200,y:250,id:"monster",kind:0},{x:150,y:300,id:"monster",kind:0},{x:50,y:300,id:"monster",kind:0},{x:0,y:250,id:"monster",kind:0},{x:100,y:250,id:"monster",kind:1},{x:100,y:200,id:"monster",kind:1},{x:50,y:200,id:"monster",kind:0},
{x:0,y:150,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:100,y:150,id:"monster",kind:1},{x:100,y:100,id:"monster",kind:1},{x:50,y:100,id:"monster",kind:0},{x:0,y:50,id:"monster",kind:0},{x:50,y:50,id:"monster",kind:0},{x:100,y:50,id:"monster",kind:1},{x:50,y:250,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},{x:200,y:50,id:"priority",direction:-1},{x:200,y:150,id:"priority",direction:-1},{x:200,y:250,id:"priority",direction:-1},{x:50,y:100,id:"priority",direction:-1},{x:50,y:200,
id:"priority",direction:-1},{x:50,y:0,id:"priority",direction:-1},{x:0,y:50,id:"priority",direction:1},{x:0,y:150,id:"priority",direction:1},{x:0,y:250,id:"priority",direction:1},{x:150,y:0,id:"priority",direction:1},{x:150,y:100,id:"priority",direction:1},{x:150,y:200,id:"priority",direction:1}]},tut_rowclear:{width:300,height:250,items:[{x:50,y:50,id:"monster",kind:1},{x:50,y:100,id:"monster",kind:0},{x:0,y:100,id:"monster",kind:0},{x:0,y:150,id:"monster",kind:0},{x:100,y:100,id:"monster",kind:0},
{x:100,y:50,id:"monster",kind:1},{x:100,y:0,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:150,y:100,id:"monster",kind:0},{x:150,y:0,id:"monster",kind:0},{x:200,y:50,id:"monster",kind:0},{x:200,y:100,id:"monster",kind:0},{x:250,y:100,id:"monster",kind:0},{x:250,y:150,id:"monster",kind:0},{x:150,y:200,id:"blocker"},{x:100,y:200,id:"blocker"},{x:150,y:50,id:"monster",kind:1},{x:200,y:150,id:"monster",kind:0},{x:250,y:50,id:"monster",kind:0},{x:0,y:0,id:"wall"},{x:250,y:0,id:"wall"},{x:0,y:50,
id:"monster",kind:0},{x:50,y:0,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:0},{x:50,y:200,id:"blocker"},{x:100,y:150,id:"blocker"},{x:150,y:150,id:"blocker"},{x:200,y:200,id:"blocker"},{x:0,y:200,id:"blocker"},{x:250,y:200,id:"blocker"},{x:100,y:50,id:"pow_ver"}]},color2:{width:350,height:300,items:[{x:150,y:250,id:"wall"},{x:50,y:100,id:"wall"},{x:100,y:150,id:"wall"},{x:0,y:150,id:"wall"},{x:50,y:200,id:"wall"},{x:250,y:200,id:"wall"},{x:300,y:150,id:"wall"},{x:250,y:100,id:"wall"},{x:200,
y:150,id:"wall"},{x:300,y:200,id:"priority",direction:-1},{x:0,y:200,id:"priority",direction:1}]},area2:{width:250,height:350,items:[{x:150,y:200,id:"blocker"},{x:200,y:250,id:"blocker"},{x:50,y:200,id:"blocker"},{x:0,y:250,id:"blocker"},{x:100,y:250,id:"blocker"},{x:50,y:300,id:"blocker"},{x:150,y:300,id:"blocker"},{x:0,y:50,id:"monster",kind:0},{x:50,y:50,id:"monster",kind:0},{x:100,y:50,id:"monster",kind:2},{x:150,y:50,id:"monster",kind:2},{x:200,y:50,id:"monster",kind:2},{x:50,y:0,id:"monster",
kind:0},{x:0,y:0,id:"monster",kind:0},{x:100,y:0,id:"monster",kind:0},{x:150,y:0,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:2},{x:0,y:100,id:"wall"},{x:200,y:100,id:"wall"},{x:50,y:100,id:"blocker"},{x:100,y:100,id:"blocker"},{x:150,y:100,id:"blocker"},{x:0,y:150,id:"blocker"},{x:200,y:150,id:"blocker"},{x:100,y:50,id:"pow_exp"}]},rowclear2:{width:350,height:300,items:[{x:250,y:250,id:"wall"},{x:150,y:250,id:"wall"},{x:50,y:250,id:"wall"},{x:250,y:150,id:"wall"},{x:150,y:150,id:"wall"},{x:50,
y:150,id:"wall"},{x:0,y:250,id:"blocker"},{x:100,y:250,id:"blocker"},{x:200,y:250,id:"blocker"},{x:300,y:250,id:"blocker"},{x:50,y:200,id:"blocker"},{x:150,y:200,id:"blocker"},{x:250,y:200,id:"blocker"},{x:100,y:200,id:"monster",kind:1},{x:100,y:200,id:"pow_ver"},{x:300,y:150,id:"priority",direction:-1},{x:200,y:150,id:"priority",direction:-1},{x:0,y:150,id:"priority",direction:1}]},rowclear3:{width:250,height:350,items:[{x:50,y:0,id:"wall"},{x:150,y:0,id:"wall"},{x:150,y:50,id:"wall"},{x:200,y:50,
id:"wall"},{x:50,y:50,id:"wall"},{x:0,y:50,id:"wall"},{x:0,y:0,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:0},{x:0,y:100,id:"wall"},{x:200,y:100,id:"wall"},{x:0,y:300,id:"wall"},{x:200,y:300,id:"wall"},{x:200,y:250,id:"monster",kind:0},{x:150,y:300,id:"monster",kind:0},{x:50,y:300,id:"monster",kind:0},{x:100,y:300,id:"monster",kind:0},{x:200,y:0,id:"pow_hor"},{x:0,y:0,id:"pow_ver"},{x:200,y:250,id:"pow_ver"},{x:50,y:100,id:"priority",direction:-1},{x:200,y:250,id:"priority",direction:-1},{x:150,
y:100,id:"priority",direction:1},{x:0,y:250,id:"priority",direction:1}]},level11:{width:200,height:350,items:[{x:50,y:50,id:"sludge"},{x:100,y:50,id:"sludge"},{x:50,y:100,id:"sludge"},{x:100,y:100,id:"sludge"},{x:50,y:200,id:"sludge"},{x:100,y:200,id:"sludge"},{x:50,y:250,id:"sludge"},{x:100,y:250,id:"sludge"},{x:50,y:150,id:"sludge"},{x:100,y:150,id:"sludge"}]},level12:{width:300,height:300,items:[{x:50,y:0,id:"blocker"},{x:0,y:50,id:"blocker"},{x:200,y:0,id:"blocker"},{x:250,y:50,id:"blocker"},
{x:0,y:200,id:"blocker"},{x:50,y:250,id:"blocker"},{x:250,y:200,id:"blocker"},{x:200,y:250,id:"blocker"},{x:0,y:0,id:"sludge"},{x:250,y:0,id:"sludge"},{x:250,y:250,id:"sludge"},{x:0,y:250,id:"sludge"},{x:100,y:100,id:"sludge"},{x:150,y:100,id:"sludge"},{x:150,y:150,id:"sludge"},{x:100,y:150,id:"sludge"}]},level13:{width:350,height:300,items:[{x:50,y:150,id:"blocker"},{x:100,y:150,id:"blocker"},{x:150,y:150,id:"blocker"},{x:200,y:150,id:"blocker"},{x:250,y:150,id:"blocker"},{x:0,y:150,id:"wall"},{x:300,
y:150,id:"wall"},{x:0,y:100,id:"monster",kind:1},{x:0,y:250,id:"sludge"},{x:50,y:250,id:"sludge"},{x:100,y:250,id:"sludge"},{x:150,y:250,id:"sludge"},{x:200,y:250,id:"sludge"},{x:250,y:250,id:"sludge"},{x:300,y:250,id:"sludge"},{x:0,y:200,id:"sludge"},{x:50,y:200,id:"sludge"},{x:100,y:200,id:"sludge"},{x:150,y:200,id:"sludge"},{x:200,y:200,id:"sludge"},{x:250,y:200,id:"sludge"},{x:300,y:200,id:"sludge"},{x:0,y:100,id:"pow_exp"}]},smushtest:{width:300,height:250,items:[{x:50,y:0,id:"wall"},{x:0,y:50,
id:"wall"},{x:200,y:0,id:"wall"},{x:250,y:50,id:"wall"},{x:0,y:150,id:"wall"},{x:50,y:200,id:"wall"},{x:250,y:150,id:"wall"},{x:200,y:200,id:"wall"},{x:0,y:0,id:"sludge"},{x:0,y:200,id:"sludge"},{x:250,y:200,id:"sludge"},{x:250,y:0,id:"sludge"},{x:100,y:100,id:"sludge"},{x:150,y:100,id:"sludge"}]},level14:{width:250,height:300,items:[{x:0,y:100,id:"guard"},{x:200,y:100,id:"guard"},{x:150,y:100,id:"guard"},{x:50,y:100,id:"guard"},{x:50,y:200,id:"guard"},{x:100,y:200,id:"guard"},{x:150,y:200,id:"guard"},
{x:200,y:250,id:"monster",kind:0},{x:200,y:200,id:"monster",kind:0},{x:200,y:150,id:"monster",kind:0},{x:150,y:150,id:"monster",kind:0},{x:100,y:150,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:0,y:150,id:"monster",kind:0},{x:0,y:200,id:"monster",kind:0},{x:0,y:250,id:"monster",kind:0},{x:50,y:250,id:"monster",kind:0},{x:100,y:250,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},{x:100,y:100,id:"monster",kind:0},{x:100,y:50,id:"monster",kind:0},{x:100,y:0,id:"monster",kind:0},{x:150,
y:0,id:"monster",kind:0},{x:150,y:50,id:"monster",kind:0},{x:200,y:50,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:0},{x:50,y:0,id:"monster",kind:0},{x:50,y:50,id:"monster",kind:0},{x:0,y:50,id:"monster",kind:0},{x:0,y:0,id:"monster",kind:0}]},level18:{width:300,height:350,items:[{x:0,y:50,id:"wall"},{x:0,y:0,id:"wall"},{x:50,y:0,id:"wall"},{x:200,y:0,id:"wall"},{x:250,y:0,id:"wall"},{x:250,y:50,id:"wall"},{x:100,y:100,id:"wall"},{x:150,y:100,id:"wall"},{x:50,y:300,id:"guard"},{x:100,y:300,id:"guard"},
{x:150,y:300,id:"guard"},{x:200,y:300,id:"guard"},{x:150,y:250,id:"guard"},{x:100,y:250,id:"guard"},{x:200,y:100,id:"priority",direction:-1},{x:50,y:100,id:"priority",direction:1}]},level16:{width:300,height:300,items:[{x:200,y:0,id:"wall"},{x:200,y:50,id:"wall"},{x:200,y:100,id:"wall"},{x:200,y:150,id:"wall"},{x:200,y:200,id:"wall"},{x:200,y:250,id:"wall"},{x:250,y:0,id:"guard"},{x:250,y:50,id:"guard"},{x:250,y:100,id:"guard"},{x:250,y:150,id:"guard"},{x:250,y:200,id:"guard"},{x:250,y:250,id:"guard"}]},
level15:{width:300,height:400,items:[{x:250,y:50,id:"wall"},{x:0,y:350,id:"guard"},{x:250,y:0,id:"guard"},{x:0,y:300,id:"wall"},{x:0,y:200,id:"wall"},{x:0,y:100,id:"wall"},{x:0,y:0,id:"wall"},{x:250,y:150,id:"wall"},{x:250,y:250,id:"wall"},{x:250,y:350,id:"wall"},{x:0,y:50,id:"guard"},{x:0,y:150,id:"guard"},{x:0,y:250,id:"guard"},{x:250,y:300,id:"guard"},{x:250,y:200,id:"guard"},{x:250,y:100,id:"guard"}]},level17:{width:350,height:300,items:[{x:0,y:250,id:"wall"},{x:0,y:150,id:"wall"},{x:0,y:50,id:"wall"},
{x:300,y:50,id:"wall"},{x:300,y:150,id:"wall"},{x:300,y:250,id:"wall"},{x:50,y:200,id:"guard"},{x:100,y:250,id:"guard"},{x:150,y:200,id:"guard"},{x:200,y:250,id:"guard"},{x:250,y:200,id:"guard"},{x:200,y:150,id:"guard"},{x:100,y:150,id:"guard"},{x:50,y:100,id:"guard"},{x:150,y:100,id:"guard"},{x:250,y:100,id:"guard"},{x:200,y:50,id:"guard"},{x:100,y:50,id:"guard"},{x:50,y:0,id:"guard"},{x:150,y:0,id:"guard"},{x:250,y:0,id:"guard"},{x:0,y:0,id:"monster",kind:0},{x:50,y:50,id:"monster",kind:0},{x:0,
y:100,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:0,y:200,id:"monster",kind:0},{x:50,y:250,id:"monster",kind:0},{x:100,y:200,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},{x:200,y:200,id:"monster",kind:0},{x:250,y:250,id:"monster",kind:0},{x:300,y:200,id:"monster",kind:0},{x:250,y:150,id:"monster",kind:0},{x:200,y:100,id:"monster",kind:0},{x:150,y:50,id:"monster",kind:0},{x:100,y:0,id:"monster",kind:0},{x:100,y:100,id:"monster",kind:0},{x:150,y:150,id:"monster",kind:0},{x:300,
y:100,id:"monster",kind:0},{x:250,y:50,id:"monster",kind:0},{x:300,y:0,id:"monster",kind:0},{x:200,y:0,id:"monster",kind:0},{x:300,y:0,id:"priority",direction:-1},{x:300,y:100,id:"priority",direction:-1},{x:300,y:200,id:"priority",direction:-1},{x:0,y:0,id:"priority",direction:1},{x:0,y:100,id:"priority",direction:1},{x:0,y:200,id:"priority",direction:1}]},level19:{width:300,height:350,items:[{x:0,y:100,id:"wall"},{x:100,y:100,id:"wall"},{x:200,y:100,id:"wall"},{x:50,y:100,id:"guard"},{x:150,y:100,
id:"guard"},{x:250,y:100,id:"guard"},{x:50,y:200,id:"wall"},{x:150,y:200,id:"wall"},{x:250,y:200,id:"wall"},{x:0,y:200,id:"guard"},{x:100,y:200,id:"guard"},{x:200,y:200,id:"guard"},{x:0,y:250,id:"monster",kind:0},{x:0,y:300,id:"monster",kind:0},{x:50,y:250,id:"monster",kind:0},{x:50,y:300,id:"monster",kind:0},{x:100,y:250,id:"monster",kind:0},{x:100,y:300,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},{x:150,y:300,id:"monster",kind:0},{x:200,y:250,id:"monster",kind:0},{x:200,y:300,id:"monster",
kind:0},{x:250,y:250,id:"monster",kind:0},{x:250,y:300,id:"monster",kind:0},{x:250,y:150,id:"monster",kind:0},{x:200,y:150,id:"monster",kind:0},{x:150,y:150,id:"monster",kind:0},{x:100,y:150,id:"monster",kind:0},{x:50,y:150,id:"monster",kind:0},{x:0,y:150,id:"monster",kind:0}]},level20:{width:400,height:300,items:[{x:50,y:250,id:"wall"},{x:150,y:250,id:"wall"},{x:250,y:250,id:"wall"},{x:350,y:250,id:"wall"},{x:0,y:200,id:"guard"},{x:100,y:200,id:"guard"},{x:200,y:200,id:"guard"},{x:300,y:200,id:"guard"},
{x:0,y:0,id:"wall"},{x:350,y:0,id:"wall"},{x:100,y:0,id:"wall"},{x:250,y:0,id:"wall"},{x:0,y:250,id:"guard"},{x:100,y:250,id:"guard"},{x:200,y:250,id:"guard"},{x:300,y:250,id:"guard"},{x:0,y:250,id:"sludge"},{x:100,y:250,id:"sludge"},{x:200,y:250,id:"sludge"},{x:300,y:250,id:"sludge"},{x:350,y:200,id:"sludge"},{x:300,y:200,id:"sludge"},{x:250,y:200,id:"sludge"},{x:200,y:200,id:"sludge"},{x:150,y:200,id:"sludge"},{x:100,y:200,id:"sludge"},{x:50,y:200,id:"sludge"},{x:0,y:200,id:"sludge"},{x:50,y:200,
id:"priority",direction:-1},{x:150,y:200,id:"priority",direction:-1},{x:250,y:200,id:"priority",direction:-1},{x:350,y:200,id:"priority",direction:-1},{x:150,y:0,id:"priority",direction:-1},{x:50,y:0,id:"priority",direction:-1},{x:50,y:200,id:"priority",direction:1},{x:150,y:200,id:"priority",direction:1},{x:250,y:200,id:"priority",direction:1},{x:200,y:0,id:"priority",direction:1},{x:300,y:0,id:"priority",direction:1}]},testSlime:{width:350,height:300,items:[{x:200,y:150,id:"wall"},{x:300,y:150,
id:"wall"},{x:150,y:100,id:"wall"},{x:250,y:100,id:"wall"},{x:100,y:150,id:"wall"},{x:50,y:100,id:"wall"},{x:0,y:150,id:"wall"},{x:0,y:200,id:"sludge"},{x:0,y:250,id:"sludge"},{x:50,y:250,id:"sludge"},{x:100,y:250,id:"sludge"},{x:150,y:250,id:"sludge"},{x:200,y:250,id:"sludge"},{x:250,y:250,id:"sludge"},{x:300,y:250,id:"sludge"},{x:300,y:200,id:"sludge"},{x:200,y:200,id:"sludge"},{x:100,y:200,id:"sludge"},{x:50,y:150,id:"sludge"},{x:50,y:200,id:"sludge"},{x:150,y:200,id:"sludge"},{x:150,y:150,id:"sludge"},
{x:250,y:150,id:"sludge"},{x:250,y:200,id:"sludge"}]},level21:{width:300,height:350,items:[{x:50,y:300,id:"cloner"},{x:100,y:300,id:"cloner"},{x:150,y:300,id:"cloner"},{x:200,y:300,id:"cloner"},{x:50,y:250,id:"cloner"},{x:200,y:250,id:"cloner"},{x:0,y:300,id:"monster",kind:0},{x:0,y:250,id:"monster",kind:0},{x:100,y:250,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},{x:250,y:250,id:"monster",kind:0},{x:250,y:300,id:"monster",kind:0},{x:0,y:200,id:"blocker"},{x:50,y:200,id:"blocker"},{x:250,
y:200,id:"blocker"},{x:0,y:150,id:"blocker"},{x:250,y:150,id:"blocker"},{x:100,y:200,id:"blocker"},{x:150,y:200,id:"blocker"},{x:100,y:150,id:"blocker"},{x:150,y:150,id:"blocker"},{x:200,y:200,id:"blocker"},{x:200,y:150,id:"blocker"},{x:50,y:150,id:"blocker"}]},level22:{width:300,height:400,items:[{x:0,y:0,id:"wall"},{x:0,y:50,id:"wall"},{x:0,y:150,id:"wall"},{x:0,y:250,id:"wall"},{x:0,y:200,id:"cloner"},{x:0,y:100,id:"cloner"},{x:0,y:300,id:"cloner"},{x:0,y:350,id:"cloner"},{x:50,y:350,id:"cloner"},
{x:50,y:200,id:"blocker"},{x:250,y:0,id:"wall"},{x:250,y:50,id:"wall"},{x:250,y:150,id:"wall"},{x:250,y:250,id:"wall"},{x:250,y:100,id:"cloner"},{x:250,y:200,id:"cloner"},{x:250,y:300,id:"cloner"},{x:250,y:350,id:"cloner"},{x:200,y:200,id:"blocker"},{x:200,y:350,id:"cloner"},{x:100,y:250,id:"blocker"},{x:150,y:250,id:"blocker"},{x:50,y:250,id:"priority",direction:-1},{x:50,y:50,id:"priority",direction:-1},{x:50,y:150,id:"priority",direction:-1},{x:200,y:50,id:"priority",direction:1},{x:200,y:150,
id:"priority",direction:1},{x:200,y:250,id:"priority",direction:1}]},level23:{width:350,height:350,items:[{x:50,y:200,id:"blocker"},{x:100,y:150,id:"cloner"},{x:200,y:150,id:"cloner"},{x:50,y:150,id:"blocker"},{x:250,y:150,id:"blocker"},{x:250,y:200,id:"blocker"},{x:50,y:250,id:"monster",kind:0},{x:50,y:300,id:"monster",kind:0},{x:100,y:300,id:"monster",kind:0},{x:150,y:300,id:"monster",kind:0},{x:200,y:300,id:"monster",kind:0},{x:250,y:250,id:"monster",kind:0},{x:250,y:300,id:"monster",kind:0},{x:0,
y:300,id:"monster",kind:0},{x:300,y:300,id:"monster",kind:0},{x:300,y:250,id:"monster",kind:0},{x:0,y:250,id:"monster",kind:0},{x:100,y:250,id:"blocker"},{x:150,y:250,id:"blocker"},{x:200,y:250,id:"blocker"},{x:200,y:200,id:"cloner"},{x:150,y:200,id:"cloner"},{x:100,y:200,id:"cloner"},{x:150,y:150,id:"blocker"},{x:100,y:100,id:"blocker"},{x:150,y:100,id:"blocker"},{x:200,y:100,id:"blocker"},{x:50,y:100,id:"wall"},{x:250,y:100,id:"wall"},{x:300,y:200,id:"priority",direction:-1},{x:250,y:250,id:"priority",
direction:-1},{x:50,y:50,id:"priority",direction:-1},{x:300,y:100,id:"priority",direction:-1},{x:0,y:200,id:"priority",direction:1},{x:50,y:250,id:"priority",direction:1},{x:250,y:50,id:"priority",direction:1},{x:0,y:100,id:"priority",direction:1}]},level24:{width:300,height:300,items:[{x:50,y:250,id:"cloner"},{x:100,y:200,id:"cloner"},{x:150,y:150,id:"cloner"},{x:200,y:100,id:"cloner"},{x:250,y:50,id:"cloner"},{x:250,y:150,id:"monster",kind:0},{x:200,y:200,id:"monster",kind:0},{x:150,y:250,id:"monster",
kind:0},{x:0,y:250,id:"blocker"},{x:50,y:200,id:"blocker"},{x:100,y:150,id:"blocker"},{x:150,y:100,id:"blocker"},{x:200,y:50,id:"blocker"},{x:250,y:0,id:"blocker"},{x:250,y:250,id:"cloner"},{x:200,y:250,id:"blocker"},{x:250,y:200,id:"blocker"},{x:100,y:250,id:"blocker"},{x:150,y:200,id:"blocker"},{x:200,y:150,id:"blocker"},{x:250,y:100,id:"blocker"}]},level25:{width:350,height:350,items:[{x:0,y:0,id:"wall"},{x:200,y:0,id:"wall"},{x:100,y:0,id:"wall"},{x:300,y:0,id:"wall"},{x:0,y:250,id:"cloner"},
{x:0,y:300,id:"cloner"},{x:300,y:250,id:"cloner"},{x:300,y:300,id:"cloner"},{x:200,y:250,id:"cloner"},{x:200,y:300,id:"cloner"},{x:100,y:250,id:"cloner"},{x:100,y:300,id:"cloner"},{x:50,y:250,id:"wall"},{x:50,y:300,id:"wall"},{x:150,y:250,id:"wall"},{x:150,y:300,id:"wall"},{x:250,y:250,id:"wall"},{x:250,y:300,id:"wall"},{x:0,y:200,id:"blocker"},{x:100,y:200,id:"blocker"},{x:200,y:200,id:"blocker"},{x:300,y:200,id:"blocker"},{x:50,y:0,id:"priority",direction:-1},{x:150,y:0,id:"priority",direction:-1},
{x:250,y:0,id:"priority",direction:-1},{x:50,y:200,id:"priority",direction:-1},{x:150,y:200,id:"priority",direction:-1},{x:250,y:200,id:"priority",direction:-1},{x:50,y:0,id:"priority",direction:1},{x:150,y:0,id:"priority",direction:1},{x:250,y:0,id:"priority",direction:1},{x:250,y:200,id:"priority",direction:1},{x:150,y:200,id:"priority",direction:1},{x:50,y:200,id:"priority",direction:1}]},level26:{width:300,height:400,items:[{x:0,y:300,id:"guard"},{x:0,y:350,id:"guard"},{x:50,y:350,id:"guard"},
{x:250,y:50,id:"guard"},{x:250,y:0,id:"guard"},{x:200,y:0,id:"guard"},{x:0,y:250,id:"cloner"},{x:50,y:300,id:"cloner"},{x:100,y:350,id:"cloner"},{x:150,y:0,id:"cloner"},{x:200,y:50,id:"cloner"},{x:250,y:100,id:"cloner"},{x:100,y:0,id:"blocker"},{x:150,y:50,id:"blocker"},{x:200,y:100,id:"blocker"},{x:250,y:150,id:"blocker"},{x:0,y:200,id:"blocker"},{x:50,y:250,id:"blocker"},{x:100,y:300,id:"blocker"},{x:150,y:350,id:"blocker"},{x:50,y:0,id:"priority",direction:1},{x:100,y:50,id:"priority",direction:1},
{x:150,y:100,id:"priority",direction:1},{x:200,y:150,id:"priority",direction:1},{x:0,y:150,id:"priority",direction:1},{x:50,y:200,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:150,y:300,id:"priority",direction:1}]},level27:{width:350,height:350,items:[{x:0,y:50,id:"wall"},{x:0,y:150,id:"wall"},{x:0,y:250,id:"wall"},{x:300,y:50,id:"wall"},{x:300,y:150,id:"wall"},{x:300,y:250,id:"wall"},{x:100,y:50,id:"wall"},{x:100,y:150,id:"wall"},{x:100,y:250,id:"wall"},{x:200,y:50,id:"wall"},
{x:200,y:150,id:"wall"},{x:200,y:250,id:"wall"},{x:0,y:300,id:"cloner"},{x:50,y:300,id:"cloner"},{x:100,y:300,id:"cloner"},{x:150,y:300,id:"cloner"},{x:200,y:300,id:"cloner"},{x:250,y:300,id:"cloner"},{x:300,y:300,id:"cloner"},{x:0,y:0,id:"sludge"},{x:50,y:0,id:"sludge"},{x:100,y:0,id:"sludge"},{x:150,y:0,id:"sludge"},{x:200,y:0,id:"sludge"},{x:250,y:0,id:"sludge"},{x:300,y:0,id:"sludge"},{x:250,y:50,id:"sludge"},{x:250,y:100,id:"sludge"},{x:250,y:150,id:"sludge"},{x:250,y:200,id:"sludge"},{x:250,
y:250,id:"sludge"},{x:250,y:300,id:"sludge"},{x:300,y:300,id:"sludge"},{x:300,y:200,id:"sludge"},{x:300,y:100,id:"sludge"},{x:200,y:100,id:"sludge"},{x:200,y:200,id:"sludge"},{x:150,y:200,id:"sludge"},{x:150,y:250,id:"sludge"},{x:150,y:300,id:"sludge"},{x:200,y:300,id:"sludge"},{x:100,y:300,id:"sludge"},{x:100,y:200,id:"sludge"},{x:100,y:100,id:"sludge"},{x:150,y:100,id:"sludge"},{x:150,y:50,id:"sludge"},{x:150,y:150,id:"sludge"},{x:50,y:100,id:"sludge"},{x:50,y:50,id:"sludge"},{x:0,y:100,id:"sludge"},
{x:50,y:150,id:"sludge"},{x:0,y:200,id:"sludge"},{x:50,y:200,id:"sludge"},{x:50,y:250,id:"sludge"},{x:0,y:300,id:"sludge"},{x:50,y:300,id:"sludge"},{x:300,y:100,id:"priority",direction:-1},{x:300,y:200,id:"priority",direction:-1},{x:300,y:0,id:"priority",direction:-1},{x:200,y:0,id:"priority",direction:-1},{x:200,y:100,id:"priority",direction:-1},{x:200,y:200,id:"priority",direction:-1},{x:100,y:0,id:"priority",direction:-1},{x:100,y:100,id:"priority",direction:-1},{x:100,y:200,id:"priority",direction:-1},
{x:0,y:0,id:"priority",direction:1},{x:0,y:100,id:"priority",direction:1},{x:0,y:200,id:"priority",direction:1},{x:100,y:200,id:"priority",direction:1},{x:100,y:100,id:"priority",direction:1},{x:100,y:0,id:"priority",direction:1},{x:200,y:0,id:"priority",direction:1},{x:200,y:100,id:"priority",direction:1},{x:200,y:200,id:"priority",direction:1}]},level28:{width:400,height:300,items:[{x:0,y:250,id:"blocker"},{x:100,y:250,id:"blocker"},{x:200,y:250,id:"blocker"},{x:300,y:250,id:"blocker"},{x:350,y:200,
id:"blocker"},{x:250,y:200,id:"blocker"},{x:150,y:200,id:"blocker"},{x:50,y:200,id:"blocker"},{x:0,y:150,id:"blocker"},{x:100,y:150,id:"blocker"},{x:200,y:150,id:"blocker"},{x:300,y:150,id:"blocker"},{x:300,y:200,id:"cloner"},{x:200,y:200,id:"cloner"},{x:100,y:200,id:"cloner"},{x:0,y:200,id:"cloner"},{x:50,y:100,id:"blocker"},{x:150,y:100,id:"blocker"},{x:250,y:100,id:"blocker"},{x:350,y:100,id:"blocker"},{x:50,y:150,id:"cloner"},{x:150,y:150,id:"cloner"},{x:250,y:150,id:"cloner"},{x:350,y:150,id:"cloner"},
{x:50,y:250,id:"guard"},{x:150,y:250,id:"guard"},{x:250,y:250,id:"guard"},{x:350,y:250,id:"guard"}]},level29:{width:350,height:350,items:[{x:150,y:0,id:"wall"},{x:150,y:150,id:"wall"},{x:150,y:100,id:"wall"},{x:150,y:250,id:"wall"},{x:0,y:300,id:"cloner"},{x:100,y:300,id:"cloner"},{x:200,y:300,id:"cloner"},{x:150,y:300,id:"cloner"},{x:300,y:300,id:"cloner"},{x:150,y:200,id:"cloner"},{x:150,y:50,id:"cloner"},{x:0,y:250,id:"blocker"},{x:50,y:250,id:"blocker"},{x:50,y:300,id:"blocker"},{x:100,y:250,
id:"blocker"},{x:250,y:300,id:"blocker"},{x:200,y:250,id:"blocker"},{x:250,y:250,id:"blocker"},{x:300,y:250,id:"blocker"},{x:150,y:50,id:"sludge"},{x:150,y:200,id:"sludge"},{x:100,y:300,id:"sludge"},{x:200,y:300,id:"sludge"},{x:150,y:300,id:"sludge"},{x:0,y:300,id:"sludge"},{x:300,y:300,id:"sludge"},{x:200,y:250,id:"sludge"},{x:250,y:250,id:"sludge"},{x:300,y:250,id:"sludge"},{x:100,y:250,id:"sludge"},{x:50,y:250,id:"sludge"},{x:0,y:250,id:"sludge"},{x:50,y:300,id:"sludge"},{x:250,y:300,id:"sludge"}]},
level30:{width:400,height:250,items:[{x:0,y:100,id:"blocker"},{x:250,y:100,id:"blocker"},{x:350,y:100,id:"blocker"},{x:50,y:0,id:"blocker"},{x:0,y:50,id:"blocker"},{x:100,y:50,id:"blocker"},{x:100,y:150,id:"blocker"},{x:100,y:100,id:"blocker"},{x:50,y:200,id:"blocker"},{x:0,y:150,id:"blocker"},{x:300,y:0,id:"blocker"},{x:300,y:200,id:"blocker"},{x:350,y:150,id:"blocker"},{x:250,y:150,id:"blocker"},{x:250,y:50,id:"blocker"},{x:350,y:50,id:"blocker"},{x:50,y:50,id:"cloner"},{x:50,y:100,id:"cloner"},
{x:50,y:150,id:"cloner"},{x:300,y:50,id:"cloner"},{x:300,y:100,id:"cloner"},{x:300,y:150,id:"cloner"},{x:0,y:0,id:"wall"},{x:0,y:200,id:"wall"},{x:350,y:200,id:"wall"},{x:350,y:0,id:"wall"},{x:50,y:50,id:"sludge"},{x:50,y:100,id:"sludge"},{x:50,y:150,id:"sludge"},{x:50,y:200,id:"sludge"},{x:0,y:150,id:"sludge"},{x:100,y:150,id:"sludge"},{x:100,y:100,id:"sludge"},{x:100,y:50,id:"sludge"},{x:50,y:0,id:"sludge"},{x:0,y:50,id:"sludge"},{x:0,y:100,id:"sludge"},{x:250,y:100,id:"sludge"},{x:250,y:50,id:"sludge"},
{x:300,y:0,id:"sludge"},{x:350,y:50,id:"sludge"},{x:350,y:100,id:"sludge"},{x:350,y:150,id:"sludge"},{x:300,y:200,id:"sludge"},{x:250,y:150,id:"sludge"},{x:300,y:150,id:"sludge"},{x:300,y:100,id:"sludge"},{x:300,y:50,id:"sludge"}]},level31:{width:250,height:350,items:[{x:50,y:200,id:"wall"},{x:150,y:200,id:"wall"},{x:0,y:200,id:"blocker"},{x:100,y:200,id:"blocker"},{x:0,y:250,id:"monster",kind:0},{x:50,y:250,id:"monster",kind:0},{x:100,y:250,id:"monster",kind:0},{x:150,y:250,id:"monster",kind:0},
{x:200,y:250,id:"monster",kind:0},{x:0,y:300,id:"monster",kind:0},{x:50,y:300,id:"monster",kind:0},{x:100,y:300,id:"monster",kind:0},{x:150,y:300,id:"monster",kind:0},{x:200,y:300,id:"monster",kind:0},{x:200,y:200,id:"blocker"},{x:200,y:0,id:"diamond"},{x:0,y:0,id:"diamond"},{x:0,y:50,id:"blocker"},{x:200,y:50,id:"blocker"},{x:50,y:50,id:"blocker"},{x:150,y:50,id:"blocker"},{x:50,y:150,id:"priority",direction:-1},{x:150,y:150,id:"priority",direction:-1},{x:50,y:150,id:"priority",direction:1},{x:150,
y:150,id:"priority",direction:1}]},level32:{width:350,height:350,items:[{x:50,y:0,id:"wall"},{x:0,y:0,id:"wall"},{x:0,y:50,id:"wall"},{x:300,y:0,id:"wall"},{x:0,y:300,id:"wall"},{x:250,y:0,id:"wall"},{x:300,y:50,id:"wall"},{x:300,y:300,id:"wall"},{x:50,y:300,id:"wall"},{x:0,y:250,id:"wall"},{x:300,y:250,id:"wall"},{x:250,y:300,id:"wall"},{x:150,y:100,id:"wall"},{x:150,y:150,id:"wall"},{x:150,y:200,id:"wall"},{x:100,y:150,id:"wall"},{x:200,y:150,id:"wall"},{x:100,y:100,id:"priority",direction:-1},
{x:150,y:50,id:"priority",direction:-1},{x:100,y:0,id:"priority",direction:-1},{x:50,y:50,id:"priority",direction:-1},{x:250,y:250,id:"priority",direction:-1},{x:300,y:200,id:"priority",direction:-1},{x:250,y:150,id:"priority",direction:-1},{x:200,y:200,id:"priority",direction:-1},{x:250,y:200,id:"priority",direction:-1},{x:300,y:150,id:"priority",direction:-1},{x:150,y:0,id:"priority",direction:-1},{x:100,y:50,id:"priority",direction:-1},{x:50,y:100,id:"priority",direction:-1},{x:200,y:250,id:"priority",
direction:-1},{x:150,y:50,id:"priority",direction:1},{x:200,y:100,id:"priority",direction:1},{x:200,y:0,id:"priority",direction:1},{x:250,y:50,id:"priority",direction:1},{x:0,y:200,id:"priority",direction:1},{x:50,y:250,id:"priority",direction:1},{x:50,y:150,id:"priority",direction:1},{x:100,y:200,id:"priority",direction:1},{x:0,y:150,id:"priority",direction:1},{x:50,y:200,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:200,y:50,id:"priority",direction:1},{x:250,y:100,id:"priority",
direction:1},{x:150,y:0,id:"priority",direction:1}]},level33:{width:400,height:400,items:[{x:50,y:300,id:"wall"},{x:50,y:350,id:"wall"},{x:300,y:300,id:"wall"},{x:300,y:350,id:"wall"},{x:300,y:250,id:"wall"},{x:50,y:250,id:"wall"},{x:0,y:250,id:"diamond"},{x:350,y:250,id:"diamond"},{x:50,y:150,id:"wall"},{x:50,y:200,id:"wall"},{x:300,y:150,id:"wall"},{x:300,y:200,id:"wall"},{x:0,y:300,id:"blocker"},{x:0,y:350,id:"blocker"},{x:350,y:300,id:"blocker"},{x:350,y:350,id:"blocker"},{x:350,y:200,id:"blocker"},
{x:0,y:200,id:"blocker"},{x:0,y:150,id:"diamond"},{x:350,y:150,id:"diamond"},{x:350,y:100,id:"wall"},{x:0,y:100,id:"wall"},{x:350,y:50,id:"priority",direction:-1},{x:300,y:100,id:"priority",direction:-1},{x:0,y:50,id:"priority",direction:1},{x:50,y:100,id:"priority",direction:1}]},level38:{width:250,height:400,items:[{x:0,y:0,id:"diamond"},{x:200,y:0,id:"diamond"},{x:100,y:0,id:"diamond"},{x:0,y:50,id:"blocker"},{x:100,y:50,id:"blocker"},{x:200,y:50,id:"blocker"},{x:0,y:350,id:"wall"},{x:100,y:350,
id:"wall"},{x:200,y:350,id:"wall"},{x:100,y:250,id:"wall"},{x:0,y:250,id:"wall"},{x:0,y:150,id:"wall"},{x:100,y:150,id:"wall"},{x:200,y:150,id:"wall"},{x:200,y:250,id:"wall"},{x:200,y:100,id:"priority",direction:-1},{x:200,y:200,id:"priority",direction:-1},{x:200,y:300,id:"priority",direction:-1},{x:100,y:300,id:"priority",direction:-1},{x:100,y:200,id:"priority",direction:-1},{x:100,y:100,id:"priority",direction:-1},{x:100,y:100,id:"priority",direction:1},{x:100,y:200,id:"priority",direction:1},
{x:100,y:300,id:"priority",direction:1},{x:0,y:100,id:"priority",direction:1},{x:0,y:200,id:"priority",direction:1},{x:0,y:300,id:"priority",direction:1}]},level39:{width:200,height:400,items:[{x:0,y:50,id:"blocker"},{x:0,y:0,id:"diamond"},{x:150,y:100,id:"diamond"},{x:150,y:150,id:"blocker"},{x:0,y:250,id:"blocker"},{x:0,y:200,id:"diamond"},{x:150,y:50,id:"wall"},{x:0,y:150,id:"wall"},{x:150,y:250,id:"wall"},{x:0,y:350,id:"wall"},{x:150,y:0,id:"priority",direction:-1},{x:150,y:200,id:"priority",
direction:-1},{x:50,y:150,id:"priority",direction:-1},{x:50,y:250,id:"priority",direction:-1},{x:50,y:50,id:"priority",direction:-1},{x:0,y:100,id:"priority",direction:1},{x:0,y:300,id:"priority",direction:1},{x:100,y:50,id:"priority",direction:1},{x:100,y:150,id:"priority",direction:1}]},level36:{width:350,height:350,items:[{x:0,y:0,id:"cloner"},{x:0,y:100,id:"cloner"},{x:0,y:150,id:"cloner"},{x:100,y:300,id:"wall"},{x:0,y:300,id:"wall"},{x:0,y:250,id:"cloner"},{x:300,y:300,id:"wall"},{x:200,y:300,
id:"wall"},{x:300,y:0,id:"cloner"},{x:300,y:100,id:"cloner"},{x:300,y:150,id:"cloner"},{x:300,y:250,id:"cloner"},{x:50,y:0,id:"blocker"},{x:50,y:100,id:"blocker"},{x:250,y:0,id:"blocker"},{x:250,y:100,id:"blocker"},{x:150,y:100,id:"wall"},{x:150,y:200,id:"wall"},{x:50,y:150,id:"blocker"},{x:50,y:300,id:"blocker"},{x:250,y:300,id:"blocker"},{x:250,y:150,id:"blocker"},{x:0,y:50,id:"blocker"},{x:0,y:200,id:"blocker"},{x:300,y:200,id:"blocker"},{x:300,y:50,id:"blocker"},{x:100,y:250,id:"priority",direction:-1},
{x:200,y:250,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:200,y:100,id:"priority",direction:-1},{x:150,y:150,id:"priority",direction:-1},{x:150,y:50,id:"priority",direction:-1},{x:200,y:200,id:"priority",direction:-1},{x:0,y:250,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:200,y:250,id:"priority",direction:1},{x:150,y:50,id:"priority",direction:1},{x:100,y:100,id:"priority",direction:1},{x:150,y:150,id:"priority",direction:1},{x:100,y:200,id:"priority",
direction:1}]},level37:{width:350,height:350,items:[{x:0,y:0,id:"wall"},{x:50,y:50,id:"wall"},{x:100,y:100,id:"wall"},{x:150,y:150,id:"wall"},{x:200,y:100,id:"wall"},{x:250,y:50,id:"wall"},{x:300,y:0,id:"wall"},{x:150,y:0,id:"wall"},{x:0,y:300,id:"wall"},{x:100,y:300,id:"wall"},{x:200,y:300,id:"wall"},{x:300,y:300,id:"wall"},{x:50,y:300,id:"cloner"},{x:150,y:300,id:"cloner"},{x:250,y:300,id:"cloner"},{x:300,y:250,id:"cloner"},{x:0,y:250,id:"cloner"},{x:0,y:200,id:"wall"},{x:300,y:200,id:"wall"},{x:50,
y:250,id:"blocker"},{x:100,y:250,id:"blocker"},{x:150,y:250,id:"blocker"},{x:200,y:250,id:"blocker"},{x:250,y:250,id:"blocker"},{x:250,y:0,id:"priority",direction:-1},{x:200,y:50,id:"priority",direction:-1},{x:150,y:100,id:"priority",direction:-1},{x:100,y:250,id:"priority",direction:-1},{x:200,y:250,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:300,y:150,id:"priority",direction:-1},{x:50,y:0,id:"priority",direction:1},{x:100,y:50,id:"priority",direction:1},{x:150,y:100,
id:"priority",direction:1},{x:0,y:150,id:"priority",direction:1},{x:0,y:250,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:200,y:250,id:"priority",direction:1}]},level41:{width:350,height:400,items:[{x:0,y:0,id:"wall"},{x:100,y:0,id:"wall"},{x:200,y:0,id:"wall"},{x:300,y:0,id:"wall"},{x:50,y:100,id:"wall"},{x:150,y:100,id:"wall"},{x:250,y:100,id:"wall"},{x:100,y:200,id:"wall"},{x:200,y:200,id:"wall"},{x:150,y:300,id:"wall"},{x:200,y:250,id:"cloner"},{x:100,y:250,id:"cloner"},
{x:250,y:150,id:"cloner"},{x:50,y:150,id:"cloner"},{x:0,y:350,id:"wall"},{x:300,y:350,id:"wall"},{x:150,y:150,id:"cloner"},{x:100,y:150,id:"cloner"},{x:200,y:150,id:"cloner"},{x:150,y:250,id:"cloner"},{x:150,y:200,id:"cloner"}]},level42:{width:350,height:400,items:[{x:0,y:350,id:"wall"},{x:150,y:350,id:"wall"},{x:300,y:350,id:"wall"},{x:200,y:350,id:"wall"},{x:100,y:350,id:"wall"},{x:150,y:300,id:"wall"},{x:50,y:250,id:"wall"},{x:250,y:250,id:"wall"},{x:100,y:0,id:"wall"},{x:50,y:50,id:"wall"},{x:0,
y:100,id:"wall"},{x:0,y:50,id:"wall"},{x:0,y:0,id:"wall"},{x:50,y:0,id:"wall"},{x:200,y:0,id:"wall"},{x:250,y:50,id:"wall"},{x:300,y:100,id:"wall"},{x:300,y:50,id:"wall"},{x:300,y:0,id:"wall"},{x:250,y:0,id:"wall"},{x:150,y:150,id:"wall"},{x:0,y:300,id:"guard"},{x:50,y:300,id:"guard"},{x:50,y:350,id:"guard"},{x:100,y:300,id:"guard"},{x:200,y:300,id:"guard"},{x:250,y:350,id:"guard"},{x:250,y:300,id:"guard"},{x:300,y:300,id:"guard"},{x:50,y:100,id:"priority",direction:-1},{x:200,y:150,id:"priority",
direction:-1},{x:100,y:300,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:300,y:300,id:"priority",direction:-1},{x:150,y:250,id:"priority",direction:-1},{x:50,y:200,id:"priority",direction:-1},{x:150,y:100,id:"priority",direction:-1},{x:0,y:300,id:"priority",direction:1},{x:0,y:250,id:"priority",direction:1},{x:200,y:300,id:"priority",direction:1},{x:100,y:150,id:"priority",direction:1},{x:250,y:100,id:"priority",direction:1},{x:150,y:250,id:"priority",direction:1},{x:150,
y:100,id:"priority",direction:1},{x:250,y:200,id:"priority",direction:1}]},level43:{width:400,height:400,items:[{x:250,y:350,id:"wall"},{x:300,y:300,id:"wall"},{x:250,y:250,id:"wall"},{x:300,y:200,id:"wall"},{x:250,y:150,id:"wall"},{x:300,y:100,id:"wall"},{x:250,y:50,id:"wall"},{x:300,y:0,id:"wall"},{x:350,y:350,id:"wall"},{x:350,y:250,id:"wall"},{x:350,y:150,id:"wall"},{x:350,y:50,id:"wall"},{x:350,y:0,id:"guard"},{x:300,y:50,id:"guard"},{x:350,y:100,id:"guard"},{x:300,y:150,id:"guard"},{x:350,y:200,
id:"guard"},{x:300,y:250,id:"guard"},{x:350,y:300,id:"guard"},{x:300,y:350,id:"guard"},{x:150,y:100,id:"wall"},{x:50,y:100,id:"wall"},{x:100,y:200,id:"wall"},{x:50,y:300,id:"wall"},{x:150,y:300,id:"wall"},{x:100,y:0,id:"wall"},{x:250,y:0,id:"blocker"},{x:250,y:100,id:"blocker"},{x:250,y:200,id:"blocker"},{x:250,y:300,id:"blocker"},{x:350,y:0,id:"priority",direction:-1},{x:350,y:100,id:"priority",direction:-1},{x:350,y:200,id:"priority",direction:-1},{x:350,y:300,id:"priority",direction:-1},{x:300,
y:50,id:"priority",direction:1},{x:300,y:150,id:"priority",direction:1},{x:300,y:250,id:"priority",direction:1}]},level44:{width:350,height:350,items:[{x:0,y:50,id:"wall"},{x:300,y:50,id:"wall"},{x:250,y:50,id:"wall"},{x:50,y:50,id:"wall"},{x:0,y:0,id:"cloner"},{x:300,y:0,id:"cloner"},{x:150,y:100,id:"wall"},{x:0,y:100,id:"wall"},{x:300,y:100,id:"wall"},{x:150,y:250,id:"wall"},{x:50,y:250,id:"wall"},{x:250,y:250,id:"wall"},{x:150,y:50,id:"sludge"},{x:100,y:100,id:"sludge"},{x:200,y:100,id:"sludge"},
{x:100,y:150,id:"sludge"},{x:150,y:150,id:"sludge"},{x:200,y:150,id:"sludge"},{x:200,y:50,id:"sludge"},{x:100,y:50,id:"sludge"},{x:150,y:0,id:"sludge"},{x:150,y:200,id:"sludge"},{x:100,y:200,id:"sludge"},{x:200,y:200,id:"sludge"},{x:100,y:250,id:"sludge"},{x:100,y:300,id:"sludge"},{x:150,y:300,id:"sludge"},{x:200,y:300,id:"sludge"},{x:200,y:250,id:"sludge"},{x:50,y:200,id:"sludge"},{x:250,y:200,id:"sludge"},{x:250,y:300,id:"sludge"},{x:50,y:300,id:"sludge"},{x:100,y:50,id:"priority",direction:-1},
{x:50,y:100,id:"priority",direction:-1},{x:200,y:100,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:200,y:250,id:"priority",direction:-1},{x:100,y:250,id:"priority",direction:-1},{x:100,y:100,id:"priority",direction:1},{x:0,y:250,id:"priority",direction:1},{x:200,y:250,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:200,y:50,id:"priority",direction:1},{x:250,y:100,id:"priority",direction:1}]},level45:{width:400,height:350,items:[{x:350,y:200,id:"wall"},
{x:350,y:100,id:"wall"},{x:300,y:100,id:"wall"},{x:350,y:50,id:"wall"},{x:350,y:250,id:"wall"},{x:300,y:200,id:"wall"},{x:0,y:200,id:"wall"},{x:0,y:100,id:"wall"},{x:0,y:50,id:"wall"},{x:50,y:100,id:"wall"},{x:50,y:200,id:"wall"},{x:0,y:250,id:"wall"},{x:0,y:150,id:"cloner"},{x:350,y:150,id:"cloner"},{x:50,y:250,id:"guard"},{x:0,y:300,id:"guard"},{x:50,y:300,id:"guard"},{x:300,y:250,id:"guard"},{x:350,y:300,id:"guard"},{x:300,y:300,id:"guard"},{x:250,y:300,id:"guard"},{x:250,y:250,id:"guard"},{x:100,
y:250,id:"guard"},{x:100,y:300,id:"guard"},{x:150,y:200,id:"wall"},{x:200,y:200,id:"wall"},{x:150,y:300,id:"wall"},{x:200,y:300,id:"wall"},{x:150,y:250,id:"guard"},{x:200,y:250,id:"guard"}]},level46:{width:300,height:400,items:[{x:200,y:350,id:"wall"},{x:250,y:300,id:"wall"},{x:250,y:350,id:"wall"},{x:100,y:350,id:"wall"},{x:50,y:300,id:"wall"},{x:0,y:250,id:"wall"},{x:0,y:300,id:"wall"},{x:0,y:350,id:"wall"},{x:50,y:350,id:"wall"},{x:200,y:250,id:"wall"},{x:100,y:250,id:"wall"},{x:50,y:200,id:"wall"},
{x:150,y:200,id:"wall"},{x:250,y:200,id:"wall"},{x:0,y:150,id:"wall"},{x:100,y:150,id:"wall"},{x:200,y:150,id:"wall"},{x:0,y:0,id:"wall"},{x:250,y:0,id:"wall"},{x:200,y:300,id:"priority",direction:-1},{x:250,y:250,id:"priority",direction:-1},{x:250,y:150,id:"priority",direction:-1},{x:200,y:100,id:"priority",direction:-1},{x:100,y:100,id:"priority",direction:-1},{x:100,y:200,id:"priority",direction:-1},{x:50,y:150,id:"priority",direction:-1},{x:150,y:150,id:"priority",direction:-1},{x:200,y:200,id:"priority",
direction:-1},{x:50,y:0,id:"priority",direction:-1},{x:0,y:200,id:"priority",direction:1},{x:50,y:250,id:"priority",direction:1},{x:100,y:300,id:"priority",direction:1},{x:100,y:200,id:"priority",direction:1},{x:200,y:200,id:"priority",direction:1},{x:50,y:150,id:"priority",direction:1},{x:150,y:150,id:"priority",direction:1},{x:0,y:100,id:"priority",direction:1},{x:100,y:100,id:"priority",direction:1},{x:200,y:100,id:"priority",direction:1},{x:200,y:0,id:"priority",direction:1}]},level48:{width:400,
height:400,items:[{x:350,y:200,id:"monster",kind:2},{x:250,y:300,id:"monster",kind:2},{x:200,y:350,id:"monster",kind:1},{x:150,y:350,id:"cloner"},{x:200,y:300,id:"cloner"},{x:250,y:250,id:"cloner"},{x:300,y:200,id:"cloner"},{x:350,y:150,id:"cloner"},{x:50,y:350,id:"wall"},{x:100,y:300,id:"wall"},{x:150,y:250,id:"wall"},{x:200,y:200,id:"wall"},{x:250,y:150,id:"wall"},{x:300,y:100,id:"wall"},{x:350,y:50,id:"wall"},{x:100,y:350,id:"blocker"},{x:150,y:300,id:"blocker"},{x:200,y:250,id:"blocker"},{x:250,
y:200,id:"blocker"},{x:300,y:150,id:"blocker"},{x:350,y:100,id:"blocker"},{x:250,y:350,id:"wall"},{x:300,y:300,id:"wall"},{x:350,y:250,id:"wall"},{x:350,y:350,id:"cloner"},{x:300,y:350,id:"monster",kind:1},{x:350,y:300,id:"monster",kind:3},{x:300,y:250,id:"monster",kind:1},{x:0,y:50,id:"wall"},{x:50,y:0,id:"wall"},{x:0,y:0,id:"wall"},{x:50,y:300,id:"priority",direction:-1},{x:100,y:250,id:"priority",direction:-1},{x:150,y:200,id:"priority",direction:-1},{x:200,y:150,id:"priority",direction:-1},{x:250,
y:100,id:"priority",direction:-1},{x:300,y:50,id:"priority",direction:-1},{x:350,y:200,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:250,y:300,id:"priority",direction:-1},{x:350,y:0,id:"priority",direction:-1},{x:350,y:100,id:"priority",direction:-1},{x:300,y:150,id:"priority",direction:-1},{x:250,y:200,id:"priority",direction:-1},{x:200,y:250,id:"priority",direction:-1},{x:150,y:300,id:"priority",direction:-1},{x:350,y:300,id:"priority",direction:-1},{x:100,y:0,id:"priority",
direction:-1},{x:50,y:50,id:"priority",direction:-1},{x:300,y:50,id:"priority",direction:1},{x:250,y:100,id:"priority",direction:1},{x:200,y:150,id:"priority",direction:1},{x:150,y:200,id:"priority",direction:1},{x:100,y:250,id:"priority",direction:1},{x:50,y:300,id:"priority",direction:1},{x:250,y:300,id:"priority",direction:1},{x:300,y:250,id:"priority",direction:1}]},level50:{width:350,height:400,items:[{x:0,y:350,id:"wall"},{x:50,y:300,id:"wall"},{x:100,y:250,id:"wall"},{x:150,y:200,id:"wall"},
{x:200,y:150,id:"wall"},{x:250,y:100,id:"wall"},{x:300,y:50,id:"wall"},{x:50,y:350,id:"blocker"},{x:100,y:300,id:"blocker"},{x:150,y:250,id:"blocker"},{x:200,y:200,id:"blocker"},{x:250,y:150,id:"blocker"},{x:300,y:100,id:"blocker"},{x:300,y:350,id:"wall"},{x:100,y:350,id:"cloner"},{x:150,y:300,id:"cloner"},{x:200,y:250,id:"cloner"},{x:250,y:200,id:"cloner"},{x:300,y:150,id:"cloner"},{x:300,y:200,id:"monster",kind:4},{x:250,y:250,id:"monster",kind:1},{x:200,y:300,id:"monster",kind:3},{x:150,y:350,
id:"monster",kind:2},{x:300,y:300,id:"wall"},{x:250,y:350,id:"wall"},{x:200,y:350,id:"cloner"},{x:250,y:300,id:"cloner"},{x:300,y:250,id:"cloner"},{x:300,y:0,id:"priority",direction:-1},{x:250,y:50,id:"priority",direction:-1},{x:200,y:100,id:"priority",direction:-1},{x:150,y:150,id:"priority",direction:-1},{x:100,y:200,id:"priority",direction:-1},{x:50,y:250,id:"priority",direction:-1},{x:300,y:250,id:"priority",direction:-1},{x:250,y:300,id:"priority",direction:-1},{x:250,y:50,id:"priority",direction:1},
{x:200,y:100,id:"priority",direction:1},{x:150,y:150,id:"priority",direction:1},{x:100,y:200,id:"priority",direction:1},{x:50,y:250,id:"priority",direction:1},{x:0,y:300,id:"priority",direction:1}]},GB:"level1 level2 level3 tut_area tut_color tut_rowclear color2 area2 rowclear2 rowclear3 level11 level12 level13 smushtest level14 level18 level16 level15 level17 level19 level20 testSlime level21 level22 level23 level24 level25 level26 level27 level28 level29 level30 level31 level32 level33 level38 level39 level36 level37 level41 level42 level43 level44 level45 level46 level48 level50".split(" ")}};
V.As=[{name:"level1",n:[V.n.level1],B:{$:-1,target:1E3,type:"score"},t:{R:[0],T:[1,1,1,0,0,0]},G:{U:50,V:0,W:0,Z:2,X:100,H:100,Y:50},h:{h:[500,750,1E3]}},{name:"level2",n:[V.n.level2],B:{$:-1,target:1500,type:"score"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:50,V:0,W:0,Z:2,X:100,H:100,Y:50},h:{h:[500,1E3,1500]}},{name:"level3",n:[V.n.level3],B:{$:8,target:3E3,type:"score"},t:{R:[3.5],T:[1,1,1,0,0,0]},G:{U:50,V:0,W:0,Z:2,X:100,H:100,Y:50},h:{h:[2E3,3E3,4E3]}},{name:"level4",n:[V.n.tut_area],B:{$:8,target:3E3,
type:"score"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:100,Z:2,X:7,H:4,Y:0},h:{h:[3E3,6E3,9E3]}},{name:"level5",n:[V.n.area2],B:{$:10,target:5E3,type:"score"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:0,W:100,Z:2,X:7,H:4,Y:0},h:{h:[5E3,7500,1E4]}},{name:"level6",n:[V.n.tut_color],B:{$:8,target:4500,type:"score"},t:{R:[0],T:[1,1,1,0,0,0]},G:{U:0,V:100,W:0,Z:2,X:7,H:4,Y:0},h:{h:[4500,7500,15E3]}},{name:"level7",n:[V.n.color2],B:{$:10,target:3E3,type:"score"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:100,W:0,Z:2,X:7,
H:4,Y:0},h:{h:[3E3,6E3,12E3]}},{name:"level8",n:[V.n.tut_rowclear],B:{$:10,target:4E3,type:"score"},t:{R:[0],T:[33,33,33,0,0,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[4E3,7500,11E3]}},{name:"level9",n:[V.n.rowclear2],B:{$:12,target:8E3,type:"score"},t:{R:[0],T:[1,1,1,0,0,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[8E3,12E3,16E3]}},{name:"level10",n:[V.n.rowclear3],B:{$:12,target:8E3,type:"score"},t:{R:[0],T:[1,1,1,0,0,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[8E3,15E3,22E3]}},{name:"level11",
n:[V.n.level11],B:{$:10,target:8,type:"sludge"},t:{R:[0],T:[33,33,33,0,0,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[850,3400,13600]}},{name:"level12",n:[V.n.testSlime],B:{$:10,target:8,type:"sludge"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:1,W:0,Z:8,X:7,H:4,Y:0},h:{h:[850,3400,13600]}},{name:"level13",n:[V.n.level13],B:{$:12,target:14,type:"sludge"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:0,W:100,Z:2,X:7,H:4,Y:0},h:{h:[700,1400,2800]}},{name:"level14",n:[V.n.level14],B:{$:8,target:7,type:"guard"},t:{R:[0],T:[1,
1,1,1,0,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[700,1400,2800]}},{name:"level15",n:[V.n.level15],B:{$:10,target:8,type:"guard"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:0,W:1,Z:2,X:7,H:4,Y:0},h:{h:[800,1600,3200]}},{name:"level16",n:[V.n.level16],B:{$:15,target:7,type:"guard"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[1E4,2E4,3E4]}},{name:"level17",n:[V.n.level17],B:{$:15,target:15,type:"guard"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:1,W:0,Z:2,X:7,H:4,Y:0},h:{h:[750,1500,3E3]}},{name:"level18",
n:[V.n.level18],B:{$:15,target:4E3,type:"score"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[600,1200,2400]}},{name:"level19",n:[V.n.level19],B:{$:15,target:5E3,type:"score"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[5E3,1E4,15E3]}},{name:"level20",n:[V.n.level20],B:{$:20,target:8,type:"sludge"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:1,W:0,Z:4,X:7,H:4,Y:0},h:{h:[1400,2800,5600]}},{name:"level21",n:[V.n.level21],B:{$:8,target:1E3,type:"cloners"},t:{R:[0],T:[1,
1,1,0,0,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[800,3800,6800]}},{name:"level22",n:[V.n.level23],B:{$:15,target:1E3,type:"cloners"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:0,W:0,Z:4,X:7,H:4,Y:0},h:{h:[1700,2700,3700]}},{name:"level23",n:[V.n.level24],B:{$:18,target:1E3,type:"cloners"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:1,W:0,Z:6,X:7,H:4,Y:0},h:{h:[1800,6800,11800]}},{name:"level24",n:[V.n.level22],B:{$:15,target:7E3,type:"cloners"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:1,V:0,W:0,Z:4,X:7,H:4,Y:1},h:{h:[1400,
12500,24E3]}},{name:"level25",n:[V.n.level25],B:{$:15,target:6E3,type:"score"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:50,V:0,W:0,Z:4,X:7,H:4,Y:50},h:{h:[6E3,10500,15E3]}},{name:"level26",n:[V.n.level26],B:{$:18,target:1E3,type:"guard"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[3500,13500,25E3]}},{name:"level27",n:[V.n.level27],B:{$:22,target:1E3,type:"sludge"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:1,V:0,W:2,Z:4,X:7,H:4,Y:1},h:{h:[4400,14400,24400]}},{name:"level28",n:[V.n.level28],B:{$:20,
target:1E3,type:"guard"},t:{R:[0],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:1,Z:2,X:7,H:4,Y:0},h:{h:[3E3,16E3,29E3]}},{name:"level29",n:[V.n.level29],B:{$:20,target:1E3,type:"sludge"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,V:1,W:1,Z:6,X:7,H:4,Y:0},h:{h:[3E3,16E3,29E3]}},{name:"level30",n:[V.n.level30],B:{$:20,target:1E3,type:"sludge"},t:{R:[0],T:[4,4,4,4,0,0]},G:{U:0,V:0,W:1,Z:6,X:7,H:4,Y:0},h:{h:[4400,14400,24400]}},{name:"level31",n:[V.n.level31],B:{$:20,target:2,type:"diamond"},t:{R:[0],T:[1,1,1,1,0,0]},G:{U:0,
V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[1E3,20500,4E4]}},{name:"level32",n:[V.n.level32],B:{$:25,target:3,type:"diamond"},t:{R:[3.5],T:[1,1,1,1,0,0]},G:{U:1,V:0,W:2,Z:4,X:7,H:4,Y:1},h:{h:[500,25E3,45E3]}},{name:"level33",n:[V.n.level33],B:{$:20,target:4,type:"diamond"},t:{R:[3.5],T:[1,1,1,1,1,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[13E3,43E3,73E3]}},{name:"level34",n:[V.n.level17],B:{$:25,target:3,type:"diamond"},t:{R:[3.5],T:[1,1,1,1,1,0]},G:{U:0,V:0,W:1,Z:2,X:7,H:4,Y:0},h:{h:[12500,25E3,5E4]}},{name:"level35",
n:[V.n.level23],B:{$:25,target:2,type:"diamond"},t:{R:[3.5],T:[3,3,3,3,1,0]},G:{U:0,V:1,W:2,Z:6,X:7,H:4,Y:0},h:{h:[11E3,41E3,61E3]}},{name:"level36",n:[V.n.level36],B:{$:20,target:2,type:"diamond"},t:{R:[3],T:[33,33,33,33,0,0]},G:{U:0,V:0,W:0,Z:2,X:7,H:4,Y:0},h:{h:[11E3,31E3,51E3]}},{name:"level37",n:[V.n.level37],B:{$:25,target:4,type:"diamond"},t:{R:[3.5],T:[1,3,3,3,3,0]},G:{U:1,V:2,W:2,Z:6,X:7,H:4,Y:1},h:{h:[2E4,6E4,1E5]}},{name:"level38",n:[V.n.level38],B:{$:25,target:2E4,type:"score"},t:{R:[0],
T:[1,1,1,1,0,0]},G:{U:1,V:0,W:2,Z:6,X:7,H:4,Y:1},h:{h:[2E4,3E4,4E4]}},{name:"level39",n:[V.n.level39],B:{$:30,target:3E4,type:"score"},t:{R:[3.5],T:[10,10,10,10,10,1]},G:{U:1,V:0,W:0,Z:10,X:7,H:4,Y:1},h:{h:[3E4,45E3,6E4]}},{name:"level40",n:[V.n.level27],B:{$:25,target:3,type:"diamond"},t:{R:[3.5],T:[1,1,1,1,0,0]},G:{U:50,V:0,W:50,Z:2,X:7,H:4,Y:50},h:{h:[2E4,4E4,6E4]}},{name:"level41",n:[V.n.level41],B:{$:25,target:12E3,type:"score"},t:{R:[0],T:[5,5,5,10,1,0]},G:{U:1,V:1,W:0,Z:10,X:7,H:4,Y:1},h:{h:[12E3,
22E3,32E3]}},{name:"level42",n:[V.n.level42],B:{$:25,target:3,type:"diamond"},t:{R:[4],T:[1,20,20,20,20,0]},G:{U:50,V:0,W:0,Z:2,X:7,H:4,Y:50},h:{h:[16E3,36E3,56E3]}},{name:"level43",n:[V.n.level43],B:{$:30,target:1E3,type:"guard"},t:{R:[0],T:[10,1,10,10,10,0]},G:{U:50,V:0,W:0,Z:6,X:7,H:4,Y:50},h:{h:[5E3,2E4,35E3]}},{name:"level44",n:[V.n.level44],B:{$:25,target:21,type:"sludge"},t:{R:[0],T:[5,5,5,5,5,1]},G:{U:0,V:1,W:0,Z:10,X:7,H:4,Y:0},h:{h:[1E4,3E4,5E4]}},{name:"level45",n:[V.n.level45],B:{$:30,
target:1E3,type:"guard"},t:{R:[0],T:[20,20,20,20,20,1]},G:{U:50,V:0,W:0,Z:10,X:7,H:4,Y:50},h:{h:[3E3,23E3,43E3]}},{name:"level46",n:[V.n.level46],B:{$:35,target:3,type:"diamond"},t:{R:[4],T:[1,1,1,1,1,0]},G:{U:1,V:0,W:1,Z:6,X:7,H:4,Y:1},h:{h:[17E3,27E3,47E3]}},{name:"level47",n:[V.n.testSlime],B:{$:35,target:1E3,type:"sludge"},t:{R:[0],T:[1,15,10,10,10,10]},G:{U:50,V:0,W:0,Z:5,X:7,H:4,Y:50},h:{h:[250,500,750]}},{name:"level48",n:[V.n.level48],B:{$:30,target:1E3,type:"cloners"},t:{R:[0],T:[1,10,10,
10,10,10]},G:{U:1,V:0,W:1,Z:5,X:7,H:4,Y:1},h:{h:[5E3,1E4,15E3]}},{name:"level49",n:[V.n.level25],B:{$:35,target:4,type:"diamond"},t:{R:[5],T:[1,1,1,1,1,0]},G:{U:1,V:1,W:0,Z:5,X:7,H:4,Y:1},h:{h:[23E3,43E3,53E3]}},{name:"level50",n:[V.n.level50],B:{$:35,target:4,type:"diamond"},t:{R:[6],T:[1,1,1,1,1,0]},G:{U:1,V:3,W:2,Z:5,X:7,H:4,Y:1},h:{h:[21E3,41E3,61E3]}}]}var Fg=Fg||{};Fg.gj={ll:"a70132876c11fac60d09c7bb13be6135",xm:"11e4193fa139b1e17e3c9c3e36f7efa8f2a30c6c"};Fg.Ot="en-us it-it pt-br nl-nl de-de fr-fr pt-pt es-es tr-tr ru-ru jp-jp".split(" ");
var Gg={};
function Hg(){Gg={JA:"ComboCrusader",buttons:{default_color:"orange",bigPlay:"orange"},Dc:{xn:.6,Mi:500},Bm:{Vz:[{m:Wd,x:0,y:0},{m:"undefined"!==typeof qe?qe:void 0,y:K(50,"round"),x:{align:"center"}}],xh:{align:"top",offset:K(18)}},Xw:{Ys:-Ud.height,Aw:{K:S.K,align:"center",l:"top",fontSize:K(52),fillColor:"#ffffff",stroke:!0,pa:K(8),Za:!0,strokeColor:"#00aef2",gb:"round"},Dw:{align:"center"},Ew:K(180,"round"),Cw:K(500),Bw:K(52),hv:{K:S.K,align:"center",l:"middle",fontSize:K(52),fillColor:"#ffffff",stroke:!0,
pa:K(8),Za:!0,strokeColor:"#00aef2",gb:"round"},kv:{align:"center"},lv:K(300,"round"),jv:K(500),iv:K(142)},Tw:{Gc:K(64),cd:{K:S.K,align:"center",l:"middle",fontSize:K(50),fillColor:"#e5911b",stroke:!0,pa:K(6),Za:!0,strokeColor:"#00256e",gb:"round"},Ez:!0,aj:K(134),bl:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(38),stroke:!0,pa:K(6),Za:!0,strokeColor:"#00256e",gb:"round"},fg:K(166),wh:K(400),vh:K(110),uh:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(38),stroke:!0,pa:K(6),
Za:!0,strokeColor:"#00256e",gb:"round"},Qe:K(284),Uh:{K:S.K,align:"left",l:"top",fillColor:"#ffffff",fontSize:K(35),stroke:!0,pa:K(6),Za:!0,strokeColor:"#00256e",gb:"round"},Cd:K(10),Cf:{K:S.K,align:"left",l:"top",fillColor:"#ffffff",fontSize:K(38),stroke:!0,pa:K(6),Za:!0,strokeColor:"#00256e",gb:"round"},Vp:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(38),stroke:!0,pa:K(6),Za:!0,strokeColor:"#00256e",gb:"round"},Wp:K(160),kf:K(850),Rl:{align:"center",offset:K(280)},Cj:K(340)},Sw:{Gc:K(96),
cd:{K:S.K,align:"center",l:"middle",fontSize:K(50),fillColor:"#e5911b",stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},Ez:!0,aj:K(134),bl:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(48),stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},fg:K(166),wh:K(400),vh:K(110),uh:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(48),stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},Qe:K(284),Uh:{K:S.K,align:"left",l:"top",fillColor:"#ffffff",fontSize:K(48),
stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},Cd:K(10),Cf:{K:S.K,align:"left",l:"top",fillColor:"#ffffff",fontSize:K(48),stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},Vp:{K:S.K,align:"center",l:"top",fillColor:"#ffffff",fontSize:K(60),stroke:!0,pa:K(6),Za:!0,strokeColor:"#4f0b00",gb:"round"},Wp:K(224),kf:K(840)},options:{sc:K(0),Fj:800,Gj:jc,am:600,bm:dc,pm:{K:S.K,align:"center",l:"top",fontSize:K(52),fillColor:"#ffeedd",stroke:!0,pa:K(8),Za:!0,strokeColor:"#4c2b11",gb:"round"},
Gc:K(36),cd:{K:S.K,align:"center",l:"middle",fontSize:K(30),fillColor:"#403934"},Sm:{l:"middle",align:"center",fontSize:L({big:26,small:13}),fillColor:"#004f5d"},Vm:{align:"center",l:"top",fontSize:L({big:36,small:18}),fillColor:"#004f5d"},Sk:K(96),Qk:K(250),Pk:K(376),Ok:K(476,"round"),Ye:K(40),Xm:K(100,"round"),Tm:K(162,"round"),Um:K(424,"round"),Rm:K(500,"round"),Qm:K(500,"round"),cq:K(120),dh:K(72),fh:K(366),bh:K(456),Ei:K(112),vk:K(552),kf:K(560),cg:0},jl:{font:{K:S.K,align:"center",l:"middle",
fontSize:K(54),fillColor:"#ffffff",stroke:!0,pa:K(8),strokeColor:"#479fb2",Za:!0},Zp:124},wg:{At:{align:"center",offset:0},Pp:{align:"top",offset:526},zt:{K:S.K,align:"center",l:"top",fontSize:K(40),fillColor:"#ffeee2",stroke:!0,pa:K(6),Za:!0,strokeColor:"#843c0c",gb:"round"},mp:{align:"center",offset:250},np:{align:"top",offset:540},lp:{K:S.K,align:"center",l:"top",fontSize:K(40),fillColor:"#ffeee2",stroke:!0,pa:K(6),Za:!0,strokeColor:"#843c0c",gb:"round"},Gc:{align:"top",offset:24},cd:{K:S.K,align:"center",
l:"top",fontSize:K(40),fillColor:"#ffeee2",stroke:!0,pa:K(6),Za:!0,strokeColor:"#843c0c",gb:"round"}}}}J.q=J.q||{};J.q.tw=function(){var a=J.gz;a?a():console.log("Something is wrong with Framework Init (TG.startFramework)")};J.q.wl=function(){J.d.md()};J.q.YA=function(){};J.q.Ml=function(){};J.q.xl=function(){J.d.md()};J.q.UA=function(){};J.q.TA=function(){};J.q.XA=function(){};J.q.gs=function(){};J.q.Kw=function(){};J.q.fs=function(){};J.q.VA=function(){};J.q.vw=function(){J.d.md()};J.q.ww=function(){J.d.md()};
J.q.Bh=function(){J.d.md()};J.q.uw=function(){J.d.md()};J.q.Qr=function(a,b){void 0===J.d.Le&&(J.d.Le=new Ig(!0));return Jg(a,b)};J.q.eq=function(a){void 0===J.d.Le&&(J.d.Le=new Ig(!0));return Kg(a)};J.q.Sd=function(a){window.open(a)};J.q.jj=function(){return[{g:ld,url:J.I.cs}]};J.q.Lw=function(){};J.Zd=J.Zd||{};J.Zd.wl=function(){J.d.ck=!1};J.Zd.Ml=function(){};J.Zd.xl=function(){J.d.ck=!1};J.Zd.Bh=function(){J.d.ck=!1};function Lg(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}
function Mg(a,b,c,d){this.oe=this.oc=a;this.Lv=b;this.duration=1;this.gr=d;this.pd=c;this.Lk=null;this.ai=0}function Ng(a,b){a.ai+=b;a.ai>a.duration&&a.Lk&&(a.Lk(),a.Lk=null)}Mg.prototype.Ea=function(){if(this.ai>=this.duration)return this.pd(this.duration,this.oc,this.oe-this.oc,this.duration);var a=this.pd(this.ai,this.oc,this.oe-this.oc,this.duration);this.gr&&(a=this.gr(a));return a};function Og(a,b){a.oc=a.Ea();a.oe=b;a.duration=a.Lv;a.Lk=void 0;a.ai=0}
J.aw=void 0!==J.environment?J.environment:"development";J.Pz=void 0!==J.ga?J.ga:J.aw;"undefined"!==typeof J.mediaUrl?ha(J.mediaUrl):ha(J.size);J.qv="backButton";J.vg="languageSet";J.yf="resizeEvent";J.version={builder:"1.8.3.0","build-time":"11:37:25","build-date":"02-05-2020",audio:D.Db?"web audio api":D.ob?"html5 audio":"no audio"};
J.bA=new function(){this.of=this.ox=3;l.D.Wh&&(this.of=3>l.mb.Ze?1:4.4>l.mb.Ze?2:3);l.mb.Fl&&(this.of=7>l.mb.Ze?2:3);l.mb.kq&&(this.of=8>l.mb.Ze?2:3);J.version.browser_name=l.name;J.version.browser_version=l.D.version;J.version.os_version=l.mb.version;J.version.browser_grade=this.of};J.a={};"function"===typeof Cg&&Cg();"function"===typeof Eg&&Eg();"function"===typeof Hg&&Hg();"function"===typeof initGameThemeSettings&&initGameThemeSettings();J.a.F="undefined"!==typeof Bg?Bg:{};
J.a.e="undefined"!==typeof V?V:{};J.a.ha="undefined"!==typeof Gg?Gg:{};J.a.KA="undefined"!==typeof gameThemeSettingsVar?gameThemeSettingsVar:{};J.Lh=window.publisherSettings;J.I="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof Dg&&(J.I=Dg);if("undefined"!==typeof Fg)for(var Pg in Fg)J.I[Pg]=Fg[Pg];
(function(){var a,b,c,d,g;J.o={};J.o.Gq="undefined"!==typeof M?M:{};J.o.Gb=void 0!==J.I.Je&&void 0!==J.I.Je.zk?J.I.Je.zk:J.a.F.Je.zk;g=[];for(b=0;b<J.o.Gb.length;b++)g.push(J.o.Gb[b]);if(J.I.Ot)for(b=J.o.Gb.length-1;0<=b;b--)0>J.I.Ot.indexOf(J.o.Gb[b])&&J.o.Gb.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=J.o.Gb.length-1;0<=
b;b--)0>c.indexOf(J.o.Gb[b])&&J.o.Gb.splice(b,1)}catch(h){}0===J.o.Gb.length&&(0<g.length?J.o.Gb=g:J.o.Gb.push("en-us"));c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<J.o.Gb.length;d++)if(0<=J.o.Gb[d].search(g)){a=J.o.Gb[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==J.I.Je&&void 0!==J.I.Je.Cl?J.I.Je.Cl:J.a.F.Je.Cl);J.o.gn=0<=J.o.Gb.indexOf(a)?a:J.o.Gb[0];J.o.mk=J.o.Gq[J.o.gn];
if(void 0!==J.a.F.yc.language_toggle&&void 0!==J.a.F.yc.language_toggle.ma){a=J.a.F.yc.language_toggle.ma;c=[];for(b=0;b<a.length;b++)0<=J.o.Gb.indexOf(a[b].id)&&c.push(a[b]);J.a.F.yc.language_toggle.ma=c}J.o.N=function(a,b){var c,d,g,h;if(void 0!==J.o.mk&&void 0!==J.o.mk[a]){c=J.o.mk[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=l.gg.Qt||l.gg.Ss)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};J.o.mt=function(a){J.o.gn=
a;J.o.mk=J.o.Gq[a];ma(J.vg,a)};J.o.no=function(){return J.o.gn};J.o.nw=function(){return J.o.Gb};J.o.Rw=function(a){return 0<=J.o.Gb.indexOf(a)}})();J.Qv={mb:"",cy:"",HB:"",Kn:""};J.c={};
J.c.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};J.c.aq=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};
J.c.qj=function(a){function b(){}b.prototype=Rg.prototype;a.prototype=new b};J.c.Ry=function(a,b,c,d,g,h){var k=!1,m=document.getElementById(a);m||(k=!0,m=document.createElement("canvas"),m.id=a);m.style.zIndex=b;m.style.top=c+"px";m.style.left=d+"px";m.width=g;m.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(m):document.body.appendChild(m));J.we.push(m);return m};
(function(){var a,b,c,d,g,h,k;J.os=0;J.ps=0;J.wm=!1;J.Lz=l.D.Wh&&l.D.Ze&&4<=l.D.Ze;J.ek=!1;J.lu=l.gg.Qt||l.gg.Ss;J.orientation=0<=ca.indexOf("landscape")?"landscape":"portrait";k="landscape"===J.orientation?J.a.F.Dn:J.a.F.we;h="landscape"===J.orientation?J.a.e.Dn:J.a.e.we;if(void 0!==h){if(void 0!==h.Kd)for(a in h.Kd)k.Kd[a]=h.Kd[a];if(void 0!==h.kd)for(a in h.kd)k.kd[a]=h.kd[a]}b=function(){var a,b,c,d;if(J.Lz&&!J.ek){J.ek=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){J.ek=!1;return}b=document.createEvent("Event");b.NB=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);J.ek=!1},100)}};c=function(){var a,c,d,g,h,I,t,u,w;"landscape"===J.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.rh,k.od],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.od,k.zc],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];I=d/c[1];h<g?(h=h<I?Math.floor(a[0]/I):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));t=h/c[1];!J.lu&&1<t&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),t=1);a="landscape"===J.orientation?g:h;c="landscape"===J.orientation?h:g;w=u=0;window.innerHeight<Math.floor(k.od*t)&&(u=Math.max(k.Tl,window.innerHeight-Math.floor(k.od*t)));window.innerWidth<Math.floor(k.zc*t)&&(w=Math.floor(Math.max(k.rh-k.zc,(window.innerWidth-Math.floor(k.zc*t))/t)),window.innerWidth<Math.floor(k.zc*t)+w*t&&(w+=Math.floor(Math.max((d-k.rh)/2,(window.innerWidth-(k.zc*t+w*t))/2/t))));J.Vq=k.od-k.nr;J.vv=k.zc-k.rh;J.La=u;J.gA=w;J.fA=Math.min(J.vv,-1*J.hA);J.Fe=(k.kd.top||
k.eg)-J.La;J.ra={top:-1*u,left:-1*w,height:Math.min(k.od,Math.round(Math.min(c,window.innerHeight)/t)),width:Math.min(k.zc,Math.round(Math.min(a,window.innerWidth)/t))};J.hC="landscape"===J.orientation?{top:0,left:Math.floor((k.rh-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.Tl),left:k.dg,width:k.zc,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===J.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,m,n;g=void 0!==b.top?b.top:k.eg;h=void 0!==b.left?b.left:k.dg;m=void 0!==b.width?b.width:k.zc;n=void 0!==b.height?b.height:k.od;a.tA=Math.floor(t*g);a.sA=Math.floor(t*h);a.uA=Math.floor(t*m);a.rA=Math.floor(t*
n);!1!==c&&(g+=u);!1!==d&&(h+=w);a.setAttribute("style","position:absolute; left:"+Math.floor(t*h)+"px; top:"+Math.floor(t*g)+"px; width:"+Math.floor(t*m)+"px; height:"+Math.floor(t*n)+"px; z-index: "+b.depth)};d(J.vn,k.Cn);d(J.Yn,k.Kd);d(J.ko,k.kd,!1,!0);d(J.Ke,k.$f);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);ma(J.yf)};a=function(){if(J.os===window.innerHeight&&J.ps===window.innerWidth||J.wm)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;J.wm=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,l.D.Wh?1:0);g--;if((l.D.Wh?0:window.innerHeight>d)||0>g)J.ps=window.innerWidth,J.os=window.innerHeight,clearInterval(J.wm),J.wm=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};J.ng=k.Kd.left||k.dg;J.og=k.Kd.top||k.eg;J.rl=k.Kd.width||k.zc;J.kl=k.Kd.height||k.od;J.mf=k.kd.left||k.dg;J.Fe=k.kd.top||k.eg;J.MA=k.kd.width||k.zc;
J.LA=k.kd.height||k.od;J.jx=k.$f.left||k.dg;J.kx=k.$f.top||k.eg;J.lx=k.$f.width||k.zc;J.ix=k.$f.height||k.od;h=function(a){return J.c.Ry(a.id,a.depth,void 0!==a.top?a.top:k.eg,void 0!==a.left?a.left:k.dg,void 0!==a.width?a.width:k.zc,void 0!==a.height?a.height:k.od)};J.we=[];J.vn=h(k.Cn);J.Yn=h(k.Kd);J.ko=h(k.kd);J.Ke=h(k.$f);c();document.body.addEventListener("touchmove",function(){},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);J.Wc={};J.Wc[J.lg]=J.vn;J.Wc[J.Lr]=J.Yn;J.Wc[J.ql]=J.ko;J.Wc[J.mg]=J.Ke;J.Wc[J.kg]=J.vn;J.Wc[J.Rc]=J.Ke;J.Wc[J.Ee]=J.Ke})();
J.c.cv=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ia.af+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),J.xv=!0,J.Ni=!0,b=function(a){J.xv&&J.Ni&&(J.q.Sd("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){J.Ni&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){J.Ni&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};J.c.AC=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";J.Ni=!0}};
J.c.RA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";J.Ni=!1}};J.c.mo=function(a){return a===J.Yn?{x:J.ng,y:J.og}:a===J.ko?{x:J.mf,y:J.Fe}:{x:J.jx,y:J.kx}};J.c.pg=function(a){return J.Wc[a]};J.c.Ub=function(a){return J.Wc[a]?(p.canvas!==J.Wc[a]&&p.Ub(J.Wc[a]),!0):!1};J.c.Vb=function(a,b){if(J.Wc[b]){var c=F;a.Ua!==b&&(c.zi=!0);a.Ua=b;a.canvas=J.Wc[b]}};
J.c.k=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
J.c.Ma=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};J.c.lA=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};J.za=J.za||{};J.za.Uy=!1;J.za.hs=function(a){a instanceof Array&&(this.ll=a[0],this.xm=a[1],this.zv="https://api.gameanalytics.com/v2/"+this.ll,this.is=!0)};
J.za.Rf=function(a,b){var c,d=JSON.stringify(b),g=window.Crypto.HmacSHA256(d,this.xm),g=window.Crypto.enc.Base64.stringify(g),h=this.zv+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.Uy&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
J.za.Nc={yq:"user",xq:"session_end",vu:"business",xu:"resource",hk:"progression",an:"design",ERROR:"error"};J.za.Nf=function(){return{user_id:this.iq,session_id:this.Py,build:this.Dv,device:this.Kn,platform:this.platform,os_version:this.dy,sdk_version:"rest api v2",v:2,client_ts:Math.floor(Date.now()/1E3),manufacturer:"",session_num:1}};
J.za.ac=function(a,b,c,d,g,h,k){this.Py=a;h&&"object"===typeof h&&(this.iq=h.iq);this.Dv=g;this.p=!0;this.is&&(this.Kn=k.Kn,this.platform=k.mb,this.dy=k.cy);this.Rf("init",this.Nf())};J.za.lz=function(a){var b=this.Nf(),c=[];b.category=a;c.push(b);this.Rf("events",c)};J.za.Qn=function(a,b,c,d){a=[];b=this.Nf();b.length=Math.floor(c);b.category=d;a.push(b);this.Rf("events",a)};
J.za.ub=function(a,b,c,d){var g=[],h=!1;if(this.p&&this.is){if(d)switch(d){case J.za.Nc.yq:this.lz(d);h=!0;break;case J.za.Nc.xq:this.Qn(0,0,c,d);h=!0;break;case J.za.Nc.vu:h=!0;break;case J.za.Nc.xu:h=!0;break;case J.za.Nc.hk:this.dw(a,b,c,d);h=!0;break;case J.za.Nc.an:this.bw(a,b,c,d),h=!0}h||(d="",b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b),b=this.Nf(),b.event_id=d+":"+a,b.value=c,g.push(b),this.Rf("design",g))}};J.za.gC=function(a,b,c){this.ub(a,b,c)};J.za.GA=function(){};
J.za.HA=function(){};J.za.dw=function(a,b,c,d){var g=[],h=this.Nf();switch(a){case "Start:":h.category=d;h.event_id=a+b;break;case "Complete:":h.category=d;h.event_id=a+b;h.score=c;break;case "Fail:":h.category=d,h.event_id=a+b,h.score=c}g.push(h);this.Rf("events",g)};J.za.bw=function(a,b,c,d){var g=[],h=this.Nf();h.category=d;h.event_id=a+b;h.value=c;g.push(h);this.Rf("events",g)};J.za.jt=function(a,b){var c=[],d=this.Nf();d.category="error";d.message=a;d.severity=b;c.push(d);this.Rf("events",c)};
function Sg(){this.Ua=this.depth=0;this.visible=!1;this.p=!0;this.a=J.a.F.$a;this.oy=this.a.Cz;Nb(this);Pb(this,"system")}function Tg(){var a=Ug("userId","");""===a&&(a=Vg(),Wg("userId",a));return a}function Vg(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=Sg.prototype;e.start=function(a){J.za.hs(a);J.za.ac(Vg(),J.a.e.jg.ao,J.a.ha.id,J.I.wy,Xg(),{iq:Tg()},J.Qv)};e.ub=function(a,b,c,d){J.za.ub(a,b,c,d)};
function Yg(a,b,c,d){var g,h;for(g=0;g<a.va.length;g++)void 0!==a.va[g]&&a.va[g].tag===b&&(h=a.va[g],a.ub(c,d,h.w/1E3,J.za.Nc.xq),h.p=!1)}function Zg(){var a=J.$a,b=J.d.Qg,c;for(c=0;c<a.va.length;c++)void 0!==a.va[c]&&a.va[c].tag===b&&(a.va[c].paused+=1)}e.jt=function(a,b){J.za.jt(a,b)};e.Tc=function(){this.va=[]};
e.Oa=function(a){var b,c=0;for(b=0;b<this.va.length;b++)this.va[b].p&&(0===this.va[b].paused&&(this.va[b].w+=a),c=b);c<this.va.length-1&&(a=this.va.length-Math.max(this.oy,c+1),0<a&&this.va.splice(this.va.length-a,a))};
function Ig(a,b,c){this.Js=a||!1;this.host=b||"http://localhost:8080";this.Oy=c||this.host+"/services/storage/gamestate";this.Mt="undefined"!==typeof window.localStorage;this.Eo=this.gq=!1;var d=this;window.parent!==window&&(l.D.yp||l.mb.Fl)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.gq="ok"===a.result:"getItem"===b&&d.sl&&("ok"===a.result?d.sl(a.value):d.sl(a.defaultValue))},!1),this.sl=null,window.parent.postMessage({command:"init"},"*"));this.Dj=[];window.setTimeout(function(){d.Eo=
!0;for(var a=0;a<d.Dj.length;++a)d.Dj[a]();d.Dj=[]},2E3)}function $g(){return"string"===typeof J.I.It&&""!==J.I.It?J.I.It:void 0!==J.a.e.jg&&void 0!==J.a.e.jg.ao?J.a.e.jg.ao:"0"}function Jg(a,b){var c=J.d.Le;"function"===typeof b&&(c.Eo?ah(c,a,b):c.Dj.push(function(){ah(c,a,b)}))}function Kg(a){var b=J.d.Le;b.Eo?bh(b,a):b.Dj.push(function(){bh(b,a)})}
function bh(a,b){var c=null,d=$g();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.gq)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.Mt)try{window.localStorage.setItem(d,c)}catch(h){}a.Js||(c=new qb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),rb(c,a.Oy+"/my_ip/"+d))}}
function ah(a,b,c){var d=null,g=null,h=$g();if(a.gq)a.sl=function(a){var g;try{d=JSON.parse(a),g=JSON.parse(d.gameState)}catch(h){g=b}c(g)},window.parent.postMessage({command:"getItem",key:"TG_"+h},"*");else{if(a.Mt)try{(d=window.localStorage.getItem(h))&&(d=JSON.parse(d))}catch(k){c(b);return}a.Js||(a=new qb("gameState_"+h),g=null,sb(a,Ig.dC+"/my_ip/"+h)&&(g=void 0===JSON?{}:JSON.parse(a.text)));try{if(d){if(g&&Date.parse(g.lastChanged)>Date.parse(d.lastChanged)){c(JSON.parse(g.gameState));return}c(JSON.parse(d.gameState));
return}if(g){c(JSON.parse(g.gameState));return}}catch(m){c(b);return}c(b)}}
function ch(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.td=this.visible=!1!==c;this.p=!0;J.c.Vb(this,J.Rc);var d;this.a=J.a.F.Rd;if("landscape"===J.orientation&&J.a.F.Lo)for(d in J.a.F.Lo)this.a[d]=J.a.F.Lo[d];for(d in J.a.ha.Rd)this.a[d]=J.a.ha.Rd[d];if(J.I.Rd)for(d in J.I.Rd)this.a[d]=J.I.Rd[d];this.Ab=a;this.er=b;this.sr=!1;this.Li=0;this.wn=!1;this.Bk=0;this.Mi=
this.a.uv;this.up=!0;this.dx=.6/Math.log(this.a.Ol+1);this.ru=void 0!==J.I.cx?J.I.cx:this.a.Lx;this.px=this.ru+this.a.sx;Nb(this)}e=ch.prototype;e.Hp=function(a){var b;J.c.Ub(J.kg);qa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=Q.ea();(J.I.Rd&&J.I.Rd.Tj||this.a.Tj)&&B(b,J.I.Rd&&J.I.Rd.Tj?J.I.Rd.Tj:this.a.Tj);a=J.o.N(a,"<"+a.toUpperCase()+">");b.A(a,this.canvas.width/2,this.canvas.height/2,this.a.Jm);this.error=!0;this.visible=this.td=!1;this.canvas.ta=!0};
e.Me=function(){this.Fa&&(this.bc=J.c.k(this.a.bc,J.ra.width,this.Fa.width)+J.ra.left,this.Yc=J.c.k(this.a.Yc,J.ra.height,this.Fa.height)+J.ra.top)};
e.Hn=function(){var a,b,c,d,g,h;if("function"===typeof J.q.jj&&(h=this.a.Bg,(this.Ya=J.q.jj())&&0<this.Ya.length)){this.Fa?this.Fa.clear():this.Fa=new s(this.a.Bg,this.a.Aj);y(this.Fa);h/=this.Ya.length;for(c=0;c<this.Ya.length;c++)try{g=this.Ya[c].g,d=Math.min(1,Math.min((h-20)/g.width,this.a.Aj/g.height)),a="center"===this.a.yj?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.Fa.height-g.height*d,g instanceof q?g.Da(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}A(this.Fa);this.Nl=0;this.No=!0;this.zj=0;this.Ag=Ub(0,0,this.Fa.width,this.Fa.height);this.Me()}};
e.Va=function(){var a,b,c,d;this.up?p.clear():J.c.Ub(J.kg);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(J.La),1<d.S){c=(p.canvas.height-a)/d.ph;b=-(d.Si*c-p.canvas.width)/2;c=p.context;var g=c.globalAlpha,h,k,m;c.globalAlpha=this.Li;for(h=0;h<d.S;h+=1)k=b+h%d.Jh*d.width,m=a+d.height*Math.floor(h/d.Jh),d.Hf.Na(d.Ef[h],d.Ff[h],d.Gf[h],d.Te[h],d.Se[h],k-d.hc+d.Ue[h],m-d.ic+d.Ve[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof q?d.Da(0,b,a,c,c,0,this.Li):d instanceof s&&d.Da(b,a,c,c,0,this.Li);d=this.a.rf+this.a.Jo+this.a.Dh;b=yc.height;a=yc.width-(this.a.rf+this.a.Jo);this.Eh=J.c.k(this.a.Eh,p.canvas.width,d);this.zg=J.c.k(this.a.zg,p.canvas.height,b);yc.Na(0,0,0,this.a.rf,b,this.Eh,this.zg,1);yc.$k(0,this.a.rf,0,a,b,this.Eh+this.a.rf,this.zg,this.a.Dh,b,1);yc.Na(0,this.a.rf+a,0,this.a.Jo,b,this.Eh+this.a.rf+this.a.Dh,this.zg,1)};
function dh(a){a.up&&(a.wn=!0);a.visible&&(a.Va(),a.Hn(),"function"===typeof J.q.po&&(a.Pe=J.q.po(),a.Pe instanceof s&&(a.Rh=!0,a.st=Math.floor((a.canvas.width-a.Pe.width)/2),a.tt=Math.floor((a.canvas.height-a.Pe.height)/2))));J.d.Ll&&ia.me("audio");J.d.Kl&&ia.me("audio_music");ia.me("fonts")}
e.Tc=function(){var a,b=!1;if(void 0!==J.I.Pj)if(!1===J.I.Pj.ex)b=!0;else{if(void 0!==J.I.Pj.Nn)for(a=0;a<J.I.Pj.Nn.length;a++){var c;a:{c=J.I.Pj.Nn[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===eh("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,eh(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof J.I.Bz&&(new Date).getTime()>J.I.Bz&&(b=!1);b?(this.lh=[],this.error=!1,this.Vt=this.Wn=this.yk=this.w=0,this.ready=this.Rh=!1,this.ax=void 0!==this.a.Hs?this.a.Hs:this.a.rf-this.a.xj,this.bx=void 0!==this.a.Is?this.a.Is:Math.floor((yc.height-xf.height)/2),this.Ko=xf.width-(this.a.xj+this.a.Gs),this.Vn=this.Us=this.Rq=!1,(this.Qj=ia.complete("start"))&&dh(this),this.Fs=ia.complete("load"),this.visible&&(this.Wt=document.getElementById("throbber_image"),
this.Xe=this.a.Xe,this.$p=J.c.k(this.a.$p,this.canvas.width,this.Xe),this.Km=J.c.k(this.a.Km,this.canvas.height,this.Xe))):F.pause()};
e.Oa=function(a){this.w+=a;"function"===typeof J.q.po&&void 0===this.Pe&&(this.Pe=J.q.po(),this.Pe instanceof s&&(this.Rh=!0,this.st=Math.floor((this.canvas.width-this.Pe.width)/2),this.tt=Math.floor((this.canvas.height-this.Pe.height)/2)));this.Rh&&0<=this.a.ut&&this.w>=this.a.ut&&(this.Rh=!1);this.wn&&(this.Bk+=a,this.Bk>=this.Mi?(this.wn=!1,this.Li=1):this.Li=dc(this.Bk,0,1,this.Mi));this.Qj&&(this.yk+=a,this.Wn+=a);this.Vt=Math.round(this.w/this.a.zz%(this.a.Az-1));this.No&&(this.Nl=0+this.zj/
this.a.Mo*1,this.zj+=a,this.zj>=this.a.Mo&&(this.No=!1,this.Nl=1));"function"===typeof this.er&&this.er(Math.round((ja("load")+ja("audio")+ja("audio_music"))/2));!this.ready&&this.Fs&&(this.Vn||this.Wn>=this.a.Ol)&&(!J.d.Ll||this.Rq||D.ob&&this.yk>=this.a.Ol)&&(!J.d.Kl||this.Us||D.ob&&this.yk>=this.a.Ol)&&(this.ready=!0);if(a=!this.sr&&!this.error&&this.ready&&this.w>=this.ru)a=J.d,a=(a.Ld&&a.kc&&!a.kc.Qw()?!1:!0)||this.w>=this.px;a&&(this.sr=!0,this.Ab())};
e.zh=function(a,b,c){!this.Rh&&this.Ag&&Wb(this.Ag,this.bc,this.Yc,b,c)&&(this.Kb=Math.floor((b-this.bc)/(this.Fa.width/this.Ya.length)))};e.Ah=function(a,b,c){void 0!==this.Kb&&(this.Ya[this.Kb].url||this.Ya[this.Kb].action)&&Wb(this.Ag,this.bc,this.Yc,b,c)&&(b-=this.bc,b>=this.Fa.width/this.Ya.length*this.Kb&&b<this.Fa.width/this.Ya.length*(this.Kb+1)&&(this.Ya[this.Kb].url?J.q.Sd(this.Ya[this.Kb].url):this.Ya[this.Kb].action()));this.Kb=void 0};
e.vd=function(a,b){"Load Complete"===a&&"start"===b.Cb?(this.Qj=!0,dh(this)):"Load Complete"===a&&"load"===b.Cb?this.Fs=!0:"Load Complete"===a&&"audio"===b.Cb?this.Rq=!0:"Load Complete"===a&&"audio_music"===b.Cb?this.Us=!0:"Load Complete"===a&&"fonts"===b.Cb&&(this.Vn=!0);a===J.yf&&this.Me()};
e.tb=function(){if(!this.error){this.up&&this.Qj?this.Va():p.clear();try{this.Wt&&p.context.drawImage(this.Wt,this.Xe*this.Vt,0,this.Xe,this.Xe,this.$p,this.Km,this.Xe,this.Xe)}catch(a){}if(this.Qj){var b=0,c=this.Eh+this.ax,d=this.zg+this.bx,g=xf.height;xf.Na(0,b,0,this.a.xj,g,c,d,1);b+=this.a.xj;c+=this.a.xj;this.ready?(xf.$k(0,b,0,this.Ko,g,c,d,this.a.Dh,g,1),b+=this.Ko,c+=this.a.Dh,xf.Na(0,b,0,this.a.Gs,g,c,d,1)):xf.$k(0,b,0,this.Ko,g,c,d,Math.floor(Math.min((ja("load")+ja("audio"))/500+this.dx*
Math.log(this.w+1),1)*this.a.Dh),g,1);this.Fa&&this.Fa.de(this.bc,this.Yc,this.Nl)}this.Rh&&this.Pe.A(this.st,this.tt)}};
function fh(){var a,b;b=this;this.depth=100;this.p=this.visible=!0;J.c.Vb(this,J.Rc);this.a=J.a.F.Bm;if("landscape"===J.orientation&&J.a.F.Sp)for(a in J.a.F.Sp)this.a[a]=J.a.F.Sp[a];this.yc=J.a.F.yc;if("landscape"===J.orientation&&J.a.F.Bn)for(a in J.a.F.Bn)this.yc[a]=J.a.F.Bn[a];for(a in J.a.ha.Bm)this.a[a]=J.a.ha.Bm[a];this.lh=[];a=gh(J.d);this.fr=void 0!==a&&null!==a;this.ib=new Xb;this.ib.zb(this.a.hw,function(){b.Dt.call(b)});this.ib.zb(this.a.Ws,function(){b.Ft.call(b)});this.ib.zb(J.r.Nj&&
!this.fr?this.a.ky:this.a.Ws,function(){b.Gt.call(b)});this.ib.zb(this.a.Ex,function(){b.Et.call(b)});Nb(this,!1)}e=fh.prototype;e.Dt=function(){this.nl=!0;this.a.yh&&(this.hj=J.c.k(this.a.hj,this.canvas.width,qe.width),this.ml=J.c.k(this.a.ml,this.canvas.width,qe.width),this.ij=J.c.k(this.a.ij,this.canvas.height,qe.height),this.xh=J.c.k(this.a.xh,this.canvas.height,qe.height),this.jo=this.hj,this.ol=this.ij,this.co=this.a.ho,this.eo=this.a.io,this.bo=this.a.fo,this.Sc=0,this.Me())};
e.Ft=function(a){function b(a,b,c,d){return hc(a,b,c,d,15)}var c,d;J.r.Nj&&!this.fr&&(c=J.c.k(this.a.rr,this.canvas.width,this.a.Zi,Math.floor(this.a.Zi/2)),d=J.c.k(this.a.Xk,this.canvas.height,Kd.height,Math.floor(Kd.height/2)),c=new hh("difficulty_toggle",c,d,this.depth-20,ih()+"",this.a.Zi,{Aa:function(a){jh(parseInt(a,10));return!0},Cc:!0}),c.Td=Math.floor(this.a.Zi/2),c.Ud=Math.floor(Kd.height/2),!1!==a&&(kh(c,"xScale",b,0,1,this.a.qr),kh(c,"yScale",b,0,1,this.a.qr)),this.Wk=c,this.Xk=c.y,this.lh.push(c),
this.Me())};
e.Gt=function(a){function b(a,b,c,d){return hc(a,b,c,d,15)}var c,d,g=this;this.kp=!0;c=J.c.k(this.a.jy,this.canvas.width,this.a.Hj,Math.floor(this.a.Hj/2));d=J.c.k(this.a.jm,this.canvas.height,Pd.height,Math.floor(Pd.height/2));c=new lh("bigPlay",c,d,this.depth-20,"startScreenPlay",this.a.Hj,{Aa:function(){G(F,g);var a=J.d,b,c,d;void 0===J.d.Dc&&(void 0!==J.a.ha.Dc&&(void 0!==J.a.ha.Dc.wv&&(b=J.a.ha.Dc.wv),void 0!==J.a.ha.Dc.xn&&(D.le("music",J.a.ha.Dc.xn),a.wf()||mb("music"),J.d.Ux=J.a.ha.Dc.xn),c=
void 0!==J.a.ha.Dc.sv?J.a.ha.Dc.sv:0,d=void 0!==J.a.ha.Dc.Mi?J.a.ha.Dc.Mi:0),void 0===b&&"undefined"!==typeof qg&&(b=qg),void 0!==b&&(J.d.Dc=D.play(b,c,d),J.d.Dc&&(D.wk(J.d.Dc,"music"),D.Ep(J.d.Dc,!0))));J.r.Jg&&!a.Ld?a.screen=new mh:nh(a,0);return!0},Cc:!0});c.Td=Math.floor(this.a.Hj/2);c.Ud=Math.floor(Pd.height/2);!1!==a?(kh(c,"xScale",b,0,1,this.a.hm),kh(c,"yScale",b,0,1,this.a.hm),this.im=0):this.im=this.a.hm;this.gm=c;this.jm=c.y;this.lh.push(c);this.Me()};
function oh(a){var b=lc([jc,function(a,b,g,h){return hc(a,b,g,h,2)},$b],[!0,!1,!1],[.02,.1,.88]);a.Zs=!0;kh(a.gm,"xScale",kc(b),1,.25,4E3);kh(a.gm,"yScale",kc(b),1,-.1,4E3)}e.Et=function(a){var b,c;this.Rs=!0;b=J.c.k(this.a.Wo,this.canvas.width,Hd.width);c=J.c.k(this.a.Sl,this.canvas.height,Hd.height);b=new Rg(b,c,this.depth-20,new Vb(Hd),[Hd],{Aa:J.d.Oe,Cc:!0});!1!==a&&kh(b,"alpha",H,0,1,this.a.Dx);this.Vo=b;this.Sl=b.y;this.lh.push(b);this.Me()};
e.Va=function(){var a,b,c,d;if(a=this.a.backgroundImage)J.c.Ub(J.kg),c=Math.abs(J.La),1<a.S?(b=(p.canvas.height-c)/a.ph,d=-(a.Si*b-p.canvas.width)/2,va(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.Da(0,d,c,b,b,0,1))};
e.Hn=function(){var a,b,c,d,g,h;if("function"===typeof J.q.jj&&(h=this.a.Bg,(this.Ya=J.q.jj())&&0<this.Ya.length)){this.Fa?this.Fa.clear():this.Fa=new s(this.a.Bg,this.a.Aj);y(this.Fa);h/=this.Ya.length;for(c in this.Ya)try{g=this.Ya[c].g,d=Math.min(1,Math.min((h-20)/g.width,this.a.Aj/g.height)),a="center"===this.a.yj?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.Fa.height-g.height*d,g instanceof q?g.Da(0,a,b,d,d,0,1):p.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}A(this.Fa);
this.Nl=0;this.No=!0;this.zj=0;this.Ag=Ub(0,0,this.Fa.width,this.Fa.height);this.Me()}};e.Me=function(){var a;a=0;J.ra.height<this.a.zn&&(a=this.a.zn-J.ra.height);this.kp&&(this.gm.y=this.jm-a);this.Rs&&(this.Vo.y=this.Sl-a,this.Vo.x=J.c.k(this.a.Wo,J.ra.width,Hd.width)+J.ra.left);this.Wk&&(this.Wk.y=this.Xk-a);this.nl&&this.Sc>=this.a.Pd&&(this.ol=this.xh-J.La);this.Fa&&(this.bc=J.c.k(this.a.bc,J.ra.width,this.Fa.width)+J.ra.left,this.Yc=J.c.k(this.a.Yc,J.ra.height,this.Fa.height)+J.ra.top)};
e.Tc=function(){this.Va();this.a.yh&&(J.c.Ub(J.Rc),this.a.yh.A(0,0,-this.a.yh.height-10));this.Hn();this.ib.start()};e.Uc=function(){var a;for(a=0;a<this.lh.length;a++)G(F,this.lh[a])};
e.Oa=function(a){this.canvas.ta=!0;this.nl&&this.Sc<this.a.Pd&&(this.jo=this.a.lw(this.Sc,this.hj,this.ml-this.hj,this.a.Pd),this.ol=this.a.mw(this.Sc,this.ij,this.xh-this.ij,this.a.Pd)-J.La,this.co=this.a.jw(this.Sc,this.a.ho,this.a.Nr-this.a.ho,this.a.Pd),this.eo=this.a.kw(this.Sc,this.a.io,this.a.Or-this.a.io,this.a.Pd),this.bo=this.a.iw(this.Sc,this.a.fo,this.a.Mr-this.a.fo,this.a.Pd),this.Sc+=a,this.Sc>=this.a.Pd&&(this.jo=this.ml,this.ol=this.xh-J.La,this.co=this.a.Nr,this.eo=this.a.Or,this.bo=
this.a.Mr));this.kp&&(!this.Zs&&this.im>=this.a.hm+this.a.iy&&oh(this),this.im+=a)};e.zh=function(a,b,c){this.Ag&&Wb(this.Ag,this.bc,this.Yc,b,c)&&(this.Kb=Math.floor((b-this.bc)/(this.Fa.width/this.Ya.length)))};
e.Ah=function(a,b,c){void 0!==this.Kb&&(this.Ya[this.Kb].url||this.Ya[this.Kb].action)&&Wb(this.Ag,this.bc,this.Yc,b,c)&&(b-=this.bc,b>=this.Fa.width/this.Ya.length*this.Kb&&b<this.Fa.width/this.Ya.length*(this.Kb+1)&&(this.Ya[this.Kb].url?J.q.Sd(this.Ya[this.Kb].url):this.Ya[this.Kb].action()));this.Kb=void 0};e.Qb=function(){this.Pb=!0};
e.pc=function(){this.Pb&&(this.ib.stop(),this.nl?this.Sc<this.a.Pd&&(this.Sc=this.a.Pd-1):(this.Dt(),this.Sc=this.a.Pd-1),this.Wk?ph(this.Wk):this.Ft(!1),this.Rs?ph(this.Vo):this.Et(!1),this.kp?(ph(this.gm),this.Zs&&oh(this)):this.Gt(!1),this.Pb=!1)};e.vd=function(a){a===J.yf&&(this.Va(),this.Me())};e.tb=function(){this.nl&&this.a.yh&&this.a.yh.Da(0,this.jo,this.ol,this.co,this.eo,0,this.bo);this.Fa&&this.Fa.A(this.bc,this.Yc);this.td=!1};
function mh(){this.depth=100;this.p=this.visible=!0;J.c.Vb(this,J.Rc);var a;this.a=J.a.F.wg;if("landscape"===J.orientation)for(a in J.a.F.us)this.a[a]=J.a.F.us[a];this.Xa=J.a.e.$A;if(J.a.e.wg)for(a in J.a.e.wg)this.a[a]=J.a.e.wg[a];this.Kc=J.a.F.yc;for(var b in J.a.ha.wg)this.a[b]=J.a.ha.wg[b];this.yg=-1;this.hb=0;this.As=[];Nb(this)}e=mh.prototype;
e.Va=function(){var a,b,c,d;J.c.Ub(J.kg);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(J.La),1<a.S?(b=(p.canvas.height-c)/a.ph,d=-(a.Si*b-p.canvas.width)/2,va(a,d,c)):(b=(p.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.Da(0,d,c,b,b,0,1));var g;b=J.a.F.xa.type[J.r.he].Bd;J.a.e.xa&&J.a.e.xa.type&&J.a.e.xa.type[J.r.he]&&J.a.e.xa.type[J.r.he]&&(b=!1===J.a.e.xa.type[J.r.he].Bd?!1:b);void 0!==this.Xa&&void 0!==this.Xa.Bd&&(b=this.Xa.Bd);c=J.c.k(this.a.At,
this.canvas.width,Ec.width);a=J.c.k(this.a.Pp,J.ra.height,Ec.height)+J.ra.top;b&&(Ec.A(0,c,a),b=Q.ea(),B(b,this.a.zt),Ja(b,"center"),b.A(this.h+" / "+this.bq,c+Math.floor(Ec.width/2),a+Ec.height+this.a.Bt));if(void 0!==this.Xa&&void 0!==this.Xa.Xy?this.Xa.Xy:1)b=Q.ea(),void 0!==this.a.ly?B(b,this.a.ly):B(b,this.a.lp),c=J.o.N("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Ra(b,c,this.a.ny,this.a.my),d<b.fontSize&&C(b,d),d=J.c.Ma(this.a.mp,this.canvas.width,b.ya(c),b.align),g=J.c.Ma(this.a.np,J.ra.height,
b.na(c),b.l)+J.ra.top,b.A(c,d,g),c=""+this.lm,B(b,this.a.lp),d=J.c.Ma(this.a.mp,this.canvas.width,b.ya(c),b.align),b.A(c,d,a+Ec.height+this.a.Bt)};
function qh(a){if("grid"===a.a.type){y(a.uj);p.clear();a.xg=[];var b;b=function(b,d,g){var h,k,m,n,r,v,z,I,t,u,w,x,R,ka,Y,aa,Ma,Za,xe,Gc,De,ec,Qg;k=J.r.ka[b];xe=a.uc?a.a.rw:a.a.sw;Gc=a.a.qo;De=xe;if(a.a.Iv)h=a.a.Iv[b];else{Za=a.uc?a.a.Vx:a.a.Wx;for(ec=Math.floor(k/Za);1<Math.abs(ec-Za);)Za-=1,ec=Math.floor(k/Za);for(h=[];0<k;)h.push(Math.min(Za,k)),k-=Za}ec=h.length;Ma=Math.round(((a.uc?a.a.Bs:a.a.Cs)-(ec+1)*xe)/ec);Qg=a.a.Ev?a.a.Ev:!1;if(!Qg){Za=1;for(k=0;k<ec;k++)Za=Math.max(h[k],Za);aa=Math.round((a.canvas.width-
2*Gc)/Za)}for(k=n=0;k<ec;k++){Za=h[k];Qg&&(aa=Math.round((a.canvas.width-2*Gc)/Za));for(m=0;m<Za;m++){t=a.a.ur;R=a.a.Wv;w=J.r.sh||"locked";x=0;r=rh(b,n,void 0,void 0);"object"===typeof r&&null!==r&&(void 0!==r.state&&(w=r.state),"object"===typeof r.stats&&null!==r.stats&&(x=r.stats.stars||0));ka="locked"===w;"function"===typeof J.e.ow&&(v=J.e.ow(sh(J.d,b,n),b,n,w))&&(R=ka=t=!1);r=Gc+d;I=De;Y=u=1;if(!1!==R){z=a.uc?zc:Fc;if("played"===w)switch(x){case 1:z=a.uc?Ac:Hc;break;case 2:z=a.uc?Bc:Ic;break;
case 3:z=a.uc?Cc:Jc}else a.uc||"locked"!==w||(z=Mc);z.width>aa&&(Y=aa/z.width);z.height>Ma&&(Y=Math.min(u,Ma/z.height));r+=Math.round((aa-z.width*Y)/2);I+=Math.round((Ma-z.height*Y)/2);z.Da(0,r,I,Y,Y,0,1);g&&(a.xg[n]={x:r,y:I})}v&&(v.width>aa&&(u=aa/v.width),v.height>Ma&&(u=Math.min(u,Ma/v.height)),void 0!==z?(x=J.c.k(a.a.ss,z.width*Y,v.width*u),R=J.c.k(a.a.ts,z.height*Y,v.height*u)):(x=J.c.k(a.a.ss,aa,v.width*u),R=J.c.k(a.a.ts,Ma,v.height*u),g&&(a.xg[n]={x:r+x,y:I+R})),v instanceof s?v.Da(r+x,I+
R,u,u,0,1):v.Da(0,r+x,I+R,u,u,0,1));!1===t||ka||(t=""+(J.r.ak?n+1:sh(J.d,b,n)+1),u=a.fonts.lo,"locked"===w&&void 0!==a.fonts.fx?u=a.fonts.fx:"unlocked"===w&&void 0!==a.fonts.Kz?u=a.fonts.Kz:"played"===w&&void 0!==a.fonts.played&&(u=a.fonts.played),void 0!==z?(x=J.c.Ma(a.a.ws,z.width*Y,u.ya(t),u.align),R=J.c.Ma(a.a.xs,z.height*Y,u.na(t),u.l)):(x=J.c.Ma(a.a.ws,aa,u.ya(t),u.align),R=J.c.Ma(a.a.xs,Ma,u.na(t),u.l)),u.A(t,r+x,I+R));a.uc&&ka&&(void 0!==z?(x=J.c.k(a.a.Ks,z.width*Y,Dc.width),R=J.c.k(a.a.Ls,
z.height*Y,Dc.height)):(x=J.c.k(a.a.Ks,aa,Dc.width),R=J.c.k(a.a.Ls,Ma,Dc.height)),Dc.A(0,r+x,I+R));Gc+=aa;n++}Gc=a.a.qo;De+=Ma+xe}};a.nj&&b(a.M-1,0);b(a.M,a.canvas.width,!0);a.mj&&b(a.M+1,2*a.canvas.width);A(a.uj)}}function th(a,b){switch(b-a.M){case 0:a.Zo=0;break;case 1:a.Zo=-a.canvas.width;break;case -1:a.Zo=a.canvas.width}a.Hh=!0;a.Vl=0;a.moveStart=a.hb;a.Ts=a.Zo-a.hb;a.Ul=Math.min(a.a.Qx-a.Yh,Math.round(Math.abs(a.Ts)/(a.Gm/1E3)));a.Ul=Math.max(a.a.Px,a.Ul)}
function uh(a){if(1<J.r.ka.length){var b,c;b=J.c.k(a.a.Oz,a.canvas.width,Lc.width);c=J.c.k(a.a.mq,J.ra.height,Lc.height)+J.ra.top;a.xf=new Rg(b,c,a.depth-20,new Vb(Lc),[Lc],function(){a.ne="previous";th(a,a.M-1);return!0});b=J.c.k(a.a.Nz,a.canvas.width,Kc.width);c=J.c.k(a.a.lq,J.ra.height,Kc.height)+J.ra.top;a.tf=new Rg(b,c,a.depth-20,new Vb(Kc),[Kc],function(){a.ne="next";th(a,a.M+1);return!0});vh(a)}else a.qf-=a.a.Tr}
function vh(a){if(1<J.r.ka.length){var b;a.nj?(b=[Lc],a.xf.Ib=!0):(b=[new s(Lc.width,Lc.height)],y(b[0]),Lc.A(1,0,0),A(b[0]),a.xf.Ib=!1);wh(a.xf,b);a.mj?(b=[Kc],a.tf.Ib=!0):(b=[new s(Kc.width,Kc.height)],y(b[0]),Kc.A(1,0,0),A(b[0]),a.tf.Ib=!1);wh(a.tf,b)}}
function xh(a){var b,c,d;y(a.Rg);p.clear();b=Q.ea();a.a.cd&&B(b,a.a.cd);Ja(b,"center");Ka(b,"middle");c=J.o.N("levelMapScreenWorld_"+a.M,"<LEVELMAPSCREENWORLD_"+a.M+">");d=Ra(b,c,a.a.Wd-(b.stroke?b.pa:0),a.a.If-(b.stroke?b.pa:0),!1);d<b.fontSize&&C(b,d);b.A(c,a.Rg.width/2,a.Rg.height/2);A(a.Rg);a.canvas.ta=!0}
e.Tc=function(){var a,b,c,d=this;this.uc=this.a.uc?!0:!1;if(!this.uc){for(a=0;a<J.r.ka.length;a++)if(9<J.r.ka[a]){b=!0;break}b||(this.uc=!0)}this.uj=new s(3*this.canvas.width,this.uc?this.a.Bs:this.a.Cs);this.ys=-this.canvas.width;this.zs=this.uc?this.a.Sr:this.a.Ur;this.qf=J.c.k(this.zs,J.ra.height,this.uj.height)+J.ra.top;this.Rg=new s(this.a.Wd,this.a.If);this.Dz=J.c.k(this.a.Jf,this.canvas.width,this.a.Wd);J.c.k(this.a.Jf,this.canvas.width,this.a.Wd);this.Zt=J.c.k(this.a.Gc,J.ra.height,this.Rg.height)+
J.ra.top;this.vs="undefined"!==typeof s_level_mask?s_level_mask:this.uc?Vb(zc):Vb(Fc);this.a.ur&&(this.fonts={},a=function(a){var b,c;for(b in a)c=Q.ea(),B(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.lo=Q,this.uc?a(this.a.Vw):a(this.a.Ww));this.M=J.d.M;this.ka=J.r.ka[this.M];this.Hm=!1;this.Gm=this.Xp=this.Yh=0;this.Yp=this.ys;this.hb=0;this.nj=0<this.M;this.mj=this.M<J.r.ka.length-1;for(b=this.bq=this.lm=this.h=0;b<J.r.ka.length;b++)for(a=0;a<J.r.ka[b];a++)c=yh(J.d,void 0,a,b),this.bq+=3,"object"===
typeof c&&null!==c&&(this.h+=void 0!==c.stars?c.stars:0,this.lm+=void 0!==c.highScore?c.highScore:0);J.e.qw&&(this.lm=J.e.qw());this.Va();a=this.Kc[this.a.Yx];b=J.c.k(this.a.Zx,this.canvas.width,a.m.width);c=J.c.k(this.a.fp,J.ra.height,a.m.height)+J.ra.top;this.ep=new Rg(b,c,this.depth-20,new Vb(a.m),[a.m],{Aa:J.d.Oe,Sa:this});uh(this);qh(this);xh(this);this.td=!0};e.Uc=function(){this.xf&&G(F,this.xf);this.tf&&G(F,this.tf);G(F,this.ep)};
e.Qb=function(a,b,c){if(!this.Hh)for(a=0;a<this.xg.length;a++)if(Wb(this.vs,this.xg[a].x-this.canvas.width,this.xg[a].y+this.qf,b,c)){this.yg=a;break}this.Hh=!1;1<J.r.ka.length&&(this.Hm=!0,this.Yh=0,this.Pt=this.Yp=b,this.Gm=this.Xp=0)};
e.pc=function(a,b,c){if(!this.Hh&&-1!==this.yg&&Wb(this.vs,this.xg[this.yg].x-this.canvas.width,this.xg[this.yg].y+this.qf,b,c)&&(a=J.r.sh||"locked",b=rh(this.M,this.yg,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return G(F,this),nh(J.d,this.yg,this.M),!0;this.yg=-1;this.Hm=!1;1<J.r.ka.length&&(Math.abs(this.hb)>=this.a.vz&&(this.Gm>=this.a.wz||Math.abs(this.hb)>=this.a.uz)?"previous"===this.ne?this.nj&&0<=this.hb&&this.hb<=this.canvas.width/2?th(this,
this.M-1):(0>this.hb||(this.ne="next"),th(this,this.M)):"next"===this.ne&&(this.mj&&0>=this.hb&&this.hb>=-this.canvas.width/2?th(this,this.M+1):(0<this.hb||(this.ne="previous"),th(this,this.M))):0<Math.abs(this.hb)&&(this.ne="next"===this.ne?"previous":"next",th(this,this.M)));return!0};
e.vd=function(a){if(a===J.vg||a===J.yf)this.canvas.ta=!0,this.Va(),a===J.yf?(this.Zt=J.c.k(this.a.Gc,J.ra.height,this.Rg.height)+J.ra.top,this.qf=J.c.k(this.zs,J.ra.height,this.uj.height)+J.ra.top,this.ep.y=J.c.k(this.a.fp,J.ra.height,this.ep.images[0].height)+J.ra.top,this.xf&&(this.xf.y=J.c.k(this.a.mq,J.ra.height,Lc.height)+J.ra.top),this.tf&&(this.tf.y=J.c.k(this.a.lq,J.ra.height,Kc.height)+J.ra.top),void 0===this.tf&&void 0===this.xf&&(this.qf-=this.a.Tr)):(xh(this),qh(this))};
e.ud=function(a){var b=F.wa[0].x;this.Hm&&(this.Xp=Math.abs(this.Yp-b),0<this.Yh&&(this.Gm=this.Xp/(this.Yh/1E3)),this.ne=b>this.Yp?"previous":"next",this.Yh+=a,this.hb+=b-this.Pt,this.Pt=b,this.canvas.ta=!0);if(this.Hh){var b=this.moveStart,c=this.Ts,d=this.Ul,d=ac(d-this.Vl,1,-1,d,2);this.hb=b+c*d;this.Vl>=this.Ul&&(this.Hh=!1,this.hb=0);this.Vl+=a;this.canvas.ta=!0}if(this.Hh||this.Hm)"previous"===this.ne&&this.hb>=this.canvas.width/2?0<=this.M-1?(this.M-=1,this.ka=J.r.ka[this.M],this.nj=0<this.M,
this.mj=this.M<J.r.ka.length-1,vh(this),this.hb-=this.canvas.width,xh(this),qh(this),this.canvas.ta=!0,this.moveStart-=this.canvas.width):this.hb=Math.round(this.canvas.width/2):"next"===this.ne&&this.hb<=-this.canvas.width/2&&(this.M+1<J.r.ka.length?(this.M+=1,this.ka=J.r.ka[this.M],this.nj=0<this.M,this.mj=this.M<J.r.ka.length-1,vh(this),this.hb+=this.canvas.width,xh(this),qh(this),this.canvas.ta=!0,this.moveStart+=this.canvas.width):this.hb=Math.round(-this.canvas.width/2))};
e.tb=function(){this.Rg.A(this.Dz,this.Zt);this.uj.A(Math.round(this.ys+this.hb),this.qf);this.td=!1};
function zh(a,b,c,d){this.depth=10;this.p=this.visible=!0;J.c.Vb(this,J.Rc);var g;this.type=b.failed?"failed":a;this.a=J.a.F.xa;this.Xa=this.a.type[this.type];if("landscape"===J.orientation)for(g in J.a.F.rs)this.a[g]=J.a.F.rs[g];for(g in J.a.ha.xa)this.a[g]=J.a.ha.xa[g];if(J.a.ha.xa&&J.a.ha.xa.type&&J.a.ha.xa.type[this.type])for(g in J.a.ha.xa.type[this.type])this.a[g]=J.a.ha.xa.type[this.type][g];if("failed"===this.type){if(void 0!==J.a.e.xa&&J.a.e.xa.type&&void 0!==J.a.e.xa.type.failed)for(g in J.a.e.xa.type[this.type])this.Xa[g]=
J.a.e.xa.type[this.type][g]}else{if(void 0!==J.a.e.xa&&void 0!==J.a.e.xa.type)for(g in J.a.e.xa.type[this.type])this.Xa[g]=J.a.e.xa.type[this.type][g];for(g in J.a.e.xa)this.Xa[g]=J.a.e.xa[g]}this.Ja=b;this.Aa=c;this.Sa=d;this.bz=[ug,vg,wg];this.Yf=[];this.ib=new Xb;this.ib.parent=this;Nb(this,!1)}
function Ah(a){var b;for(b=0;b<a.h.length;b++)Bh(a.h[b]);for(b=0;b<a.Kg.length;b++)G(F,a.Kg[b]);a.Kg=[];a.eb&&Bh(a.eb);a.eb=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].Ib=!1;a.ib.stop();a.ib=void 0;Ch(a)}
function Dh(a,b){var c;switch(b){case "title_level":c=J.o.N("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.Ja.level);break;case "title_endless":c=J.o.N("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.Ja.stage);break;case "title_difficulty":c=J.o.N("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.Qc(a.a.cd,c,a.a.Jf,a.a.Gc,a.a.Wd,a.a.If)}
function Eh(a,b){var c;switch(b){case "subtitle_failed":c=J.o.N("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.Qc(a.a.Vp,c,a.a.rz,a.a.Wp)}
function Fh(a,b,c){var d,g,h,k,m;g=J.o.N(b.key,"<"+b.key.toUpperCase()+">");d=b.df?b.toString(b.Lg):b.toString(b.qd);h=a.a.Uh;h.align="left";h.l="top";m=Q.ea();B(m,h);c?(Ka(m,"bottom"),h=a.a.Cf,h.align="left",h.l="bottom",c=Q.ea(),B(c,h),h=k=0,void 0!==g&&(h+=m.ya(g)+a.a.Fm),void 0!==d&&(h+=c.ya(d)),h=J.c.k(a.a.Df,a.canvas.width,h)-a.f.x,void 0!==g&&(m.A(g,h,a.Vd+m.fontSize),h+=m.ya(g)+a.a.Fm,k+=m.na(g)),void 0!==d&&(b.df?(d=c.na(d),m=a.Vd+m.fontSize-d,b.Wi=new Gh(h,m,a.a.Vh,d,a.depth-100,b.Lg,c,
a.a.Sh,a.a.Th,a.f,b.toString),k=Math.max(k,d)):(c.A(d,h,a.Vd+m.fontSize+a.a.Ht),k=Math.max(k,c.na(d)))),0<k&&(a.Vd+=k+a.a.Cd)):(void 0!==g&&(a.Qc(h,g,a.a.Df,a.a.Qe),k=a.a.Qe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Cd:a.a.Cd,k.offset+=m.na(g)):"number"===typeof k&&(k+=a.a.Cd+m.na(g))),void 0!==d&&(h=a.a.Cf,h.l="top",b.df?(c=Q.ea(),h.align="center",B(c,h),g=J.c.k(a.a.Df,a.canvas.width,a.a.Vh)-a.f.x,m=k-a.f.y,b.Wi=new Gh(g,m,a.a.Vh,c.na(d),a.depth-100,b.Lg,c,a.a.Sh,a.a.Th,a.f,b.toString)):
a.Qc(h,d,a.a.Df,k)))}
function Hh(a,b,c){var d,g,h,k,m,n;switch(b){case "totalScore":d=""+a.Ja.totalScore;g=J.o.N("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=J.o.N("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.Ja.highScore;break;case "timeLeft":g=J.o.N("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.Ja.timeLeft;break;case "timeBonus":g=J.o.N("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.Ja.timeBonus,n=a.Ja.timeBonus}h=a.a.Uh;h.align=
"left";h.l="top";m=Q.ea();B(m,h);c?(Ka(m,"bottom"),h=a.a.Cf,h.align="left",h.l="bottom",c=Q.ea(),B(c,h),h=k=0,void 0!==g&&(h+=m.ya(g)+a.a.Fm),void 0!==d&&(h+=c.ya(d)),h=J.c.k(a.a.Df,a.canvas.width,h)-a.f.x,void 0!==g&&(m.A(g,h,a.Vd+m.fontSize),h+=m.ya(g)+a.a.Fm,k+=m.na(g)),void 0!==d&&(void 0!==n?(d=c.na(d),m=a.Vd+m.fontSize-d,n=new Gh(h,m,a.a.Vh,d,a.depth-100,n,c,a.a.Sh,a.a.Th,a.f),k=Math.max(k,d)):(c.A(d,h,a.Vd+m.fontSize+a.a.Ht),k=Math.max(k,c.na(d)))),0<k&&(a.Vd+=k+a.a.Cd)):(void 0!==g&&(a.Qc(h,
g,a.a.Df,a.a.Qe),k=a.a.Qe,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Cd:a.a.Cd,k.offset+=m.na(g)):"number"===typeof k&&(k+=a.a.Cd+m.na(g))),void 0!==d&&(h=a.a.Cf,h.l="top",void 0!==n?(c=Q.ea(),h.align="center",B(c,h),g=J.c.k(a.a.Df,a.canvas.width,a.a.Vh)-a.f.x,m=k-a.f.y,n=new Gh(g,m,a.a.Vh,c.na(d),a.depth-100,n,c,a.a.Sh,a.a.Th,a.f)):a.Qc(h,d,a.a.Df,k)));n instanceof Gh&&("totalScore"===b?a.Tg=n:a.Yf.push(n))}
function Ih(a,b){var c,d,g;c=J.o.N(b.key,"<"+b.key.toUpperCase()+">");d=b.df?b.toString(b.Lg):b.toString(b.qd);void 0!==c&&a.Qc(a.a.bl,c,a.a.yr,a.a.aj);void 0!==d&&(b.df?(c=Q.ea(),d=a.a.uh,a.a.FA||(d.align="center"),B(c,d),d=J.c.k(a.a.cl,a.canvas.width,a.a.wh)-a.f.x,g=J.c.k(a.a.fg,a.canvas.height,a.a.vh)-a.f.y,b.Wi=new Gh(d,g,a.a.wh,a.a.vh,a.depth-100,b.Lg,c,a.a.Sh,a.a.Th,a.f,b.toString)):a.Qc(a.a.uh,d,a.a.cl,a.a.fg))}
function Jh(a,b){var c,d,g,h;switch(b){case "totalScore":c=J.o.N("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.Ja.totalScore;g=0;break;case "timeLeft":c=J.o.N("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.Ja.timeLeft}void 0!==c&&a.Qc(a.a.bl,c,a.a.yr,a.a.aj);void 0!==d&&(void 0!==g?(c=Q.ea(),d=a.a.uh,d.align="center",B(c,d),d=J.c.k(a.a.cl,a.canvas.width,a.a.wh)-a.f.x,h=J.c.k(a.a.fg,a.canvas.height,a.a.vh)-a.f.y,g=new Gh(d,h,a.a.wh,a.a.vh,a.depth-100,g,c,a.a.Sh,a.a.Th,
a.f)):a.Qc(a.a.uh,d,a.a.cl,a.a.fg));g instanceof Gh&&("totalScore"===b?a.Tg=g:a.Yf.push(g))}e=zh.prototype;e.Qc=function(a,b,c,d,g,h){var k=Q.ea();B(k,a);void 0!==g&&void 0!==h&&(a=Ra(k,b,g,h,g),k.fontSize>a&&C(k,a));h=k.ya(b);a=k.na(b);c=J.c.Ma(c,this.canvas.width,h,k.align)-this.f.x;d=J.c.Ma(d,this.canvas.height,a,k.l)-this.f.y;k.A(b,c,d,g)};
function Kh(a,b){var c,d,g,h;switch(b){case "retry":c=Id;d=function(){a.hf="retry";Ah(a)};break;case "exit":c=Fd,d=function(){a.hf="exit";Ah(a)}}void 0!==c&&(g=J.c.k(a.a.rv,a.canvas.width,c.width)-a.f.x,h=J.c.k(a.a.Tq,a.canvas.height,c.height)-a.f.y,a.buttons.push(new Rg(g,h,a.depth-20,new Vb(c),[c],d,a.f)))}
function Lh(a,b){var c,d,g,h;switch(b){case "retry":c=Dd;d=function(){a.hf="retry";Ah(a)};break;case "exit":c=Ed;d=function(){a.hf="exit";Ah(a)};break;case "next":c=Ed,d=function(){a.hf="next";Ah(a)}}void 0!==c&&(g=J.c.k(a.a.fw,a.canvas.width,c.width)-a.f.x,h=J.c.k(a.a.Hr,a.canvas.height,c.height)-a.f.y,a.buttons.push(new Rg(g,h,a.depth-20,new Vb(c),[c],d,a.f)))}
e.Tc=function(){this.w=0;this.h=[];this.Kg=[];this.buttons=[];this.canvas.ta=!0;this.hf="";this.rd=this.Ja.failed?!0:!1;this.Bd=this.Xa.Bd&&!this.rd;this.Qh=this.Xa.Qh&&!this.rd&&this.Ja.es;this.pn=this.alpha=this.kh=0;Mh(this);var a,b,c,d,g,h,k=this;switch(this.Xa.Ck){case "failed":this.g=this.a.cm.Uw;break;case "level":this.g=this.a.cm.Yw;break;case "difficulty":this.g=this.a.cm.Mn;break;case "endless":this.g=this.a.cm.$v}this.f=new Nh(this.depth-10,this.Ua,new s(this.g.width,this.g.height));this.f.x=
J.c.k(this.a.Ec,this.canvas.width,this.g.width);this.f.y=J.c.k(this.a.sc,this.canvas.height,this.g.height);y(this.f.g);this.g.A(0,0,0);!this.rd&&this.Bd&&(b=J.c.k(this.a.Jp,this.canvas.width,0)-this.f.x,a=J.c.k(this.a.Kp,this.canvas.height,nd.height)-this.f.y+Math.round(md.height/2),md.A(0,b,a),b=J.c.k(this.a.Lp,this.canvas.width,0)-this.f.x,a=J.c.k(this.a.Mp,this.canvas.height,pd.height)-this.f.y+Math.round(od.height/2),od.A(0,b,a),b=J.c.k(this.a.Np,this.canvas.width,0)-this.f.x,a=J.c.k(this.a.Op,
this.canvas.height,rd.height)-this.f.y+Math.round(qd.height/2),qd.A(0,b,a));void 0!==this.Xa.Vj&&Dh(this,this.Xa.Vj);void 0!==this.Xa.Kt&&Eh(this,this.Xa.Kt);this.Wb={};void 0!==this.Ja.ge?(c=this.Ja.ge,c.visible&&Ih(this,c),this.Wb[c.id]=c):void 0!==this.Xa.Pn&&Jh(this,this.Xa.Pn);if(void 0!==this.Ja.Wb)for(a=this.Ja.Wb.length,b=Q.ea(),B(b,this.a.Uh),c=Q.ea(),B(c,this.a.Cf),b=Math.max(b.na("g"),c.na("g"))*a+this.a.Cd*(a-1),this.Vd=J.c.k(this.a.Qe,this.canvas.height,b)-this.f.y,b=0;b<a;b++)c=this.Ja.Wb[b],
c.visible&&Fh(this,this.Ja.Wb[b],1<a),this.Wb[c.id]=c;else if(void 0!==this.Xa.Re)if("string"===typeof this.Xa.Re)Hh(this,this.Xa.Re,this.a.Gr);else if(this.Xa.Re instanceof Array)for(a=this.Xa.Re.length,b=Q.ea(),B(b,this.a.Uh),c=Q.ea(),B(c,this.a.Cf),b=Math.max(b.na("g"),c.na("g"))*a+this.a.Cd*(a-1),this.Vd=J.c.k(this.a.Qe,this.canvas.height,b)-this.f.y,b=0;b<a;b++)Hh(this,this.Xa.Re[b],1<a||this.a.Gr);A(this.f.g);Kh(this,this.Xa.Ak);Lh(this,this.Xa.hl);J.d.hu&&(b=J.c.k(k.a.Fw,k.canvas.width,k.a.as)-
this.f.x,a=J.c.k(this.a.Gw,this.canvas.height,this.a.bg)-this.f.y,this.$r=new lh("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.as,{Aa:function(){void 0!==Oh?J.q.Sd(J.I.Al.url+"submit/"+Oh+"/"+k.Ja.totalScore):J.q.Sd(J.I.Al.url+"submit/")},Cc:!0},k.f),this.buttons.push(this.$r),b=function(a){a&&(k.$r.fq("levelEndScreenSubmitHighscoreBtn"),k.ZA=a)},Ph(this.Ja.totalScore,b));b=J.c.k(this.a.kf,this.canvas.width,this.a.nh)-this.f.x;a=J.c.k(this.a.cg,this.canvas.height,this.a.bg)-this.f.y;
this.buttons.push(new Rg(b,a,this.depth-20,new Ub(0,0,this.a.nh,this.a.bg),void 0,function(){k.hf="exit";Ah(k)},this.f));for(b=0;b<this.buttons.length;b++)this.buttons[b].Ib=!1;this.f.y=-this.f.height;a=this.a.yz;this.ib.zb(a,this.kz);a+=this.a.Ki;g=0;d=this.a.Gz;this.Bd&&(d=Math.max(d,this.a.xt+this.a.wt*this.Ja.stars));if(this.Tg&&(this.ib.zb(a+this.a.Mm,function(a,b){Qh(b.parent.Tg,b.parent.Ja.totalScore,d)}),g=a+this.a.Mm+d,0<this.Yf.length)){h=function(a,b){var c=b.parent,d=c.Yf[c.kh];Qh(c.Tg,
c.Tg.value+d.value,c.a.jh);Qh(d,0,c.a.jh);c.kh+=1};for(b=0;b<this.Yf.length;b++)g+=this.a.$q,this.ib.zb(g,h);g+=this.a.jh}if(void 0!==this.Wb&&(g=a,h=function(a,b){var c=b.parent,d=c.Up[c.kh||0],g=c.Wb[d.Em];void 0!==d.Lf&&(g.visible&&g.df?Qh(g.Wi,d.Lf(g.Wi.value),c.a.jh):g.qd=d.Lf(g.qd));d.visible&&d.df&&Qh(d.Wi,d.qd,c.a.jh);c.kh+=1},this.Up=[],void 0!==this.Ja.ge&&void 0!==this.Ja.ge.Lf&&(this.ib.zb(a+this.a.Mm,h),this.Up.push(this.Ja.ge),g+=this.a.Mm+bonusCounterDuration),void 0!==this.Ja.Wb))for(b=
0;b<this.Ja.Wb.length;b++)c=this.Ja.Wb[b],void 0!==c.Lf&&(g+=this.a.$q,this.ib.zb(g,h),this.Up.push(c),g+=this.a.jh);if(this.Bd){for(b=0;b<this.Ja.stars;b++)a+=this.a.wt,this.ib.zb(a,this.mz),this.ib.zb(a,this.nz);a+=this.a.xt}a=Math.max(a,g);this.Qh&&(a+=this.a.tx,this.ib.zb(a,this.jz),this.ib.zb(a,this.hz),this.ib.zb(a+this.a.ux,this.iz));a+=500;this.ib.zb(a,function(){J.q.Jw&&J.q.Jw()});this.ib.zb(a+this.a.Nx,J.q.Kw);J.q.fs(this.Ja);this.ib.start();this.rd?D.play(xg):D.play(sg)};
e.Oa=function(a){this.alpha=this.a.el*this.pn/this.a.Mc;this.pn+=a;this.alpha>=this.a.el&&(this.alpha=this.a.el,this.p=!1);this.canvas.ta=!0};
e.kz=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].Ib=!0}var d=b.parent,g,h;switch(d.a.Sz){case "fromLeft":h="horizontal";g=J.c.k(d.a.Ec,d.canvas.width,d.f.width);d.f.x=-d.f.width;d.f.y=J.c.k(d.a.sc,d.canvas.height,d.f.height)+Math.abs(J.La);break;case "fromRight":h="horizontal";g=J.c.k(d.a.Ec,d.canvas.width,d.f.width);d.f.x=d.canvas.width;d.f.y=J.c.k(this.parent.a.sc,d.canvas.height,selft.f.height)+Math.abs(J.La);break;case "fromBottom":h="vertical";g=J.c.k(d.a.sc,
d.canvas.height,d.f.height)+Math.abs(J.La);d.f.x=J.c.k(d.a.Ec,d.canvas.width,d.f.width);d.f.y=d.canvas.height+d.f.height;break;default:h="vertical",g=J.c.k(d.a.sc,d.canvas.height,d.f.height)+Math.abs(J.La),d.f.x=J.c.k(d.a.Ec,d.canvas.width,d.f.width),d.f.y=-d.f.height}"vertical"===h?Rh(d.f,"y",g,d.a.Ki,d.a.qn,c):Rh(d.f,"x",g,d.a.Ki,d.a.qn,c)};
function Ch(a){function b(){G(F,a);a.Sa?a.Aa.call(a.Sa,a.hf):a.Aa(a.hf)}var c,d;switch(a.a.Tz){case "toLeft":d="horizontal";c=-a.f.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.f.height;break;default:d="vertical",c=-a.f.height}"vertical"===d?Rh(a.f,"y",c,a.a.rn,a.a.sn,b):Rh(a.f,"x",c,a.a.rn,a.a.sn,b)}
e.mz=function(a,b){var c,d=b.parent,g=Math.abs(J.La);if(d.h.length<d.Ja.stars){switch(d.h.length+1){case 1:c=new Nh(d.depth-30,J.Ee,nd);c.x=J.c.k(d.a.Jp,d.canvas.width,0);c.y=J.c.k(d.a.Kp,d.canvas.height,nd.height)+g+Math.round(md.height/2);break;case 2:c=new Nh(d.depth-30,J.Ee,pd);c.x=J.c.k(d.a.Lp,d.canvas.width,0);c.y=J.c.k(d.a.Mp,d.canvas.height,pd.height)+g+Math.round(od.height/2);break;case 3:c=new Nh(d.depth-30,J.Ee,rd),c.x=J.c.k(d.a.Np,d.canvas.width,0),c.y=J.c.k(d.a.Op,d.canvas.height,rd.height)+
g+Math.round(qd.height/2)}c.pb=d.a.yt;c.wb=d.a.yt;c.alpha=d.a.fz;Rh(c,"scale",1,d.a.ez,jc,function(){var a=d.h.length,b,c,n;y(d.f.g);switch(a){case 1:n=nd;b=J.c.k(d.a.Jp,d.canvas.width,0)-d.f.x;c=J.c.k(d.a.Kp,d.canvas.height,nd.height)-d.f.y+g+Math.round(md.height/2);break;case 2:n=pd;b=J.c.k(d.a.Lp,d.canvas.width,0)-d.f.x;c=J.c.k(d.a.Mp,d.canvas.height,nd.height)-d.f.y+g+Math.round(od.height/2);break;case 3:n=rd,b=J.c.k(d.a.Np,d.canvas.width,0)-d.f.x,c=J.c.k(d.a.Op,d.canvas.height,nd.height)-d.f.y+
g+Math.round(qd.height/2)}n.A(0,b,c);A(d.f.g);d.f.td=!0;G(F,d.h[a-1])});Rh(c,"alpha",1,d.a.dz,cc);d.h.push(c);D.play(d.bz[d.h.length-1])}};e.nz=function(a,b){var c=b.parent,d,g;d=c.h[c.Kg.length];g=new Nh(c.depth-50,J.Ee,sd);g.x=d.x;g.y=d.y;Rh(g,"subImage",sd.S-1,c.a.cz,void 0,function(){G(F,g)});c.Kg.push(g)};
e.hz=function(a,b){var c=b.parent,d,g,h,k,m,n,r;d=[];h=Q.ea();k=J.o.N("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.Qs&&B(h,c.a.Qs);g=Ra(h,k,c.a.Ql,c.a.Ax,!0);g<h.fontSize&&C(h,g);m=J.c.Ma(c.a.Bx,Pc.width,h.ya(k,c.a.Ql),h.align);n=J.c.Ma(c.a.Cx,Pc.height,h.na(k,c.a.Ql),h.l);for(r=0;r<Pc.S;r++)g=new s(Pc.width,Pc.height),y(g),Pc.A(r,0,0),h.A(k,m,n,c.a.Ql),A(g),d.push(g);c.eb=new Nh(c.depth-120,J.Ee,d);c.eb.Td=c.a.Ns;c.eb.Ud=c.a.Os;c.eb.x=J.c.k({align:"center"},c.f.canvas.width,c.eb.width)-c.f.x;
c.eb.y=J.c.k(c.a.Cj,c.eb.canvas.height,c.eb.height)-c.f.y+Math.abs(J.La);m=J.c.k(c.a.Rl,c.eb.canvas.width,c.eb.width)-c.f.x;c.eb.pb=c.a.Pl;c.eb.wb=c.a.Pl;c.eb.parent=c.f;c.eb.alpha=0;c.eb.iA=!0;Rh(c.eb,"scale",1,c.a.Fh,cc,function(){G(F,c.Lb);c.Lb=void 0});Rh(c.eb,"x",m,c.a.Fh,cc);Rh(c.eb,"alpha",1,0,cc);Rh(c.eb,"subImage",Pc.S,c.a.yx,cc,void 0,c.a.Fh+c.a.Ms+c.a.xx,!0,c.a.zx)};
e.jz=function(a,b){var c,d=b.parent;d.Lb=new Nh(d.depth-110,J.Ee,Oc);d.Lb.y=J.c.k(d.a.Cj,d.Lb.canvas.height,Oc.height)-d.f.y+d.a.wx;d.Lb.Td=d.a.Ns;d.Lb.Ud=d.a.Os;d.Lb.x=J.c.k(d.a.Rl,d.Lb.canvas.width,d.Lb.width)-d.f.x;c=J.c.k(d.a.Cj,d.Lb.canvas.height,Oc.height)-d.f.y+Math.abs(J.La);d.Lb.pb=d.a.Pl*d.a.Ps;d.Lb.wb=d.a.Pl*d.a.Ps;d.Lb.alpha=0;d.Lb.parent=d.f;Rh(d.Lb,"y",c,d.a.Fh,cc);Rh(d.Lb,"scale",1,d.a.Fh,cc);Rh(d.Lb,"alpha",1,d.a.Fh,cc)};
e.iz=function(a,b){var c=b.parent;c.sf=new Nh(c.depth-130,J.Ee,Nc);c.sf.parent=c.f;c.sf.x=c.eb.x;c.sf.y=c.eb.y+c.a.vx;Rh(c.sf,"subImage",Nc.S-1,c.a.Ms,void 0,function(){G(F,c.sf);c.sf=void 0});D.play(Ag)};
e.Uc=function(){var a;for(a=0;a<this.buttons.length;a++)G(F,this.buttons[a]);for(a=0;a<this.h.length;a++)G(F,this.h[a]);for(a=0;a<this.Kg.length;a++)G(F,this.Kg[a]);this.eb&&(G(F,this.eb),this.sf&&G(F,this.sf),this.Lb&&G(F,this.Lb));G(F,this.f);this.ib&&this.ib.stop();this.Tg&&G(F,this.Tg);for(a=0;a<this.Yf.length;a++)G(F,this.Yf[a]);Sh()};e.tb=function(){var a=p.context.globalAlpha;p.context.globalAlpha=this.alpha;qa(0,0,p.canvas.width,p.canvas.height,this.a.Cr,!1);p.context.globalAlpha=a};
function Th(a,b,c,d){this.depth=-100;this.visible=!1;this.p=!0;J.c.Vb(this,J.Rc);var g,h;this.a=c?J.a.F.Xs:J.a.F.options;if("landscape"===J.orientation)for(g in h=c?J.a.F.FB:J.a.F.$x,h)this.a[g]=h[g];this.Kc=J.a.F.yc;h=c?J.a.ha.Xs:J.a.ha.options;for(g in h)this.a[g]=h[g];if(J.I.options&&J.I.options.buttons)for(g in J.I.options.buttons)this.a.buttons[g]=J.I.options.buttons[g];this.type=a;this.Jz=b;this.Ld=c;this.ym=!1!==d;Nb(this)}e=Th.prototype;
e.Hi=function(a,b,c,d,g){var h=void 0,k=void 0,m=void 0,n=void 0,r=void 0,v=void 0;switch(a){case "music":h="music_toggle";n=this.au;m=J.d.wf()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.au;m=J.d.wf()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.bu;m=J.d.km()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.bu;m=J.d.km()?"on":"off";break;case "language":h="language_toggle";n=this.$t;m=J.d.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.Oj;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.lt;this.An=this.Vy;break;case "moreGames":void 0!==J.I.Mx?(h="default_image",v=J.I.Mx):(h="default_text",k="optionsMoreGames");n=this.Wy;r=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=J.Lh.customFunctions&&"function"===typeof J.Lh.customFunctions.exit?J.Lh.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.Ey;break;
case "restart":h="default_text";k="optionsRestart";n=this.Gy;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.lt;this.An=this.Yy;break;case "about":h="default_text";k="optionsAbout";n=this.Ty;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.ej;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.Qi}void 0!==h&&void 0!==n&&("image"===this.Kc[h].type?this.buttons.push(new Uh(h,b,c,this.depth-20,v,d,{Aa:n,Sa:this,Cc:r},
this.f)):"toggleText"===this.Kc[h].type?this.buttons.push(new hh(h,b,c,this.depth-20,m,d,{Aa:n,Sa:this,Cc:r},this.f)):"text"===this.Kc[h].type?this.buttons.push(new lh(h,b,c,this.depth-20,k,d,{Aa:n,Sa:this,Cc:r},this.f)):"toggle"===this.Kc[h].type&&this.buttons.push(new Vh(h,b,c,this.depth-20,m,{Aa:n,Sa:this,Cc:r},this.f)),this.buttons[this.buttons.length-1].Ib=g||!1)};
e.lt=function(){var a=this;Rh(a.f,"y","inGame"!==this.type?-this.f.g.height:this.canvas.height,this.a.am,this.a.bm,function(){G(F,a);void 0!==a.An&&a.An.call(a)});return!0};
e.Va=function(a,b){var c,d,g,h;y(this.f.g);p.clear();this.a.backgroundImage.A(0,0,0);c=J.o.N("optionsTitle","<OPTIONS_TITLE>");d=Q.ea();this.a.cd&&B(d,this.a.cd);void 0!==this.a.Wd&&void 0!==this.a.If&&(g=Ra(d,c,this.a.Wd,this.a.If,this.a.Wd),d.fontSize>g&&C(d,g));g=J.c.Ma(this.a.Jf,this.canvas.width,d.ya(c),d.align)-a;h=J.c.Ma(this.a.Gc,this.canvas.height,d.na(c,d.l))-b+-1*J.La;d.A(c,g,h);A(this.f.g)};
e.Vf=function(a,b,c){var d,g,h,k,m,n,r;h=!1;var v=this.a.buttons[this.type];"inGame"===this.type&&J.a.e.jg.Fx&&(v=J.a.e.jg.Fx);if("function"!==typeof Wh())for(d=0;d<v.length;d++){if("string"===typeof v[d]&&"moreGames"===v[d]){v.splice(d,1);break}for(g=0;g<v[d].length;g++)if("moreGames"===v[d][g]){v[d].splice(g,1);break}}if(!1===J.I.wf||!1===J.d.Kl)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("music"===v[d][g]){J.d.Ll?v[d]="sfx_big":v.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
v[d]){v.splice(d,1);break}if(!J.d.Ll)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("sfx"===v[d][g]){!1!==J.I.wf&&J.d.Kl?v[d]="music_big":v.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===v[d]){v.splice(d,1);break}if(1===J.o.nw().length)for(d=0;d<v.length;d++)if("language"===v[d]){v.splice(d,1);break}h=this.Kc.default_text.m.height;k=this.a.Kk;a=J.c.k(this.a.Jk,this.canvas.width,k)-a;n=J.c.k(this.a.Oi,this.f.g.height,h*v.length+this.a.ae*(v.length-1))-b+-1*J.La;
for(d=0;d<v.length;d++){m=a;r=k;if("string"===typeof v[d])this.Hi(v[d],m,n,r,c);else for(b=v[d],r=(k-(b.length-1)*this.a.ae)/b.length,g=0;g<b.length;g++)this.Hi(b[g],m,n,r,c),m+=r+this.a.ae;n+=h+this.a.ae}};e.au=function(a){var b=!0;"off"===a?(b=!1,J.$a.ub("off","options:music")):J.$a.ub("on","options:music");J.d.wf(b);return!0};e.bu=function(a){var b=!0;"off"===a?(b=!1,J.$a.ub("off","options:sfx")):J.$a.ub("on","options:sfx");J.d.km(b);return!0};
e.$t=function(a){J.o.mt(a);J.$a.ub(a,"options:language");return!0};
e.Oj=function(){function a(){m.dd+=1;m.Oj();return!0}function b(){m.dd-=1;m.Oj();return!0}function c(){var a;m.Va(n,r);m.ag.Ib=!0;for(a=0;a<m.buttons.length;a++)G(F,m.buttons[a]);m.buttons=[];m.Vf(n,r,!0)}var d,g,h,k,m=this,n=J.c.k(m.a.Ec,m.canvas.width,m.a.backgroundImage.width),r=J.c.k(m.a.sc,m.canvas.height,m.a.backgroundImage.height)+-1*J.La;void 0===m.dd&&(m.dd=0);m.Xj=void 0!==J.e.Rr?J.e.Rr():[];J.$a.ub((10>m.dd?"0":"")+m.dd,"options:tutorial");for(d=0;d<m.buttons.length;d++)G(F,m.buttons[d]);
m.buttons=[];this.Ld?(y(m.f.g),p.clear(),m.ag.Ib=!1):m.Va(n,r);y(m.f.g);void 0!==m.a.Xd&&(d=J.c.k(m.a.Pm,m.f.g.width,m.a.Xd.width),g=J.c.k(m.a.Ye,m.f.g.height,m.a.Xd.height),m.a.Xd.A(0,d,g));k=m.Xj[m.dd].title;void 0!==k&&""!==k&&(h=Q.ea(),m.a.Vm&&B(h,m.a.Vm),d=Ra(h,k,m.a.Wm,m.a.dq,m.a.Wm),h.fontSize>d&&C(h,d),d=J.c.Ma(m.a.gu,m.f.g.width,h.ya(k,m.a.Wm),h.align),g=J.c.Ma(m.a.Xm,m.f.g.height,h.na(k,m.a.dq),h.l),h.A(k,d,g));m.dd<m.Xj.length&&(h=m.Xj[m.dd].g,d=J.c.k(m.a.eu,m.f.g.width,h.width),g=J.c.k(m.a.Tm,
m.f.g.height,h.height),h.A(0,d,g),k=m.Xj[m.dd].text,h=Q.ea(),m.a.Sm&&B(h,m.a.Sm),d=Ra(h,k,m.a.ci,m.a.cq,m.a.ci),h.fontSize>d&&C(h,d),d=J.c.Ma(m.a.fu,m.f.g.width,h.ya(k,m.a.ci),h.align),g=J.c.Ma(m.a.Um,m.f.g.height,h.na(k,m.a.ci),h.l),h.A(k,d,g,m.a.ci));A(m.f.g);h=hd;d=J.c.k(m.a.du,m.canvas.width,h.width)-m.f.x;g=J.c.k(m.a.Rm,m.canvas.height,h.height)-m.f.y-J.La;0<=m.dd-1?m.buttons.push(new Rg(d,g,m.depth-20,new Vb(h),[h],{Aa:b,Sa:m},m.f)):(h=fd,m.buttons.push(new Rg(d,g,m.depth-20,new Vb(h),[h],{Aa:c,
Sa:m},m.f)));h=gd;d=J.c.k(this.a.cu,m.canvas.width,h.width)-m.f.x;g=J.c.k(this.a.Qm,m.canvas.height,h.height)-m.f.y-J.La;m.dd+1<m.Xj.length?m.buttons.push(new Rg(d,g,m.depth-20,new Vb(h),[h],{Aa:a,Sa:m},m.f)):(h=fd,m.buttons.push(new Rg(d,g,m.depth-20,new Vb(h),[h],{Aa:c,Sa:m},m.f)));return!0};
e.Ty=function(){function a(a,b,c,g,h,k){var m;m=Q.ea();b&&B(m,b);b=Ra(m,a,h,k,h);m.fontSize>b&&C(m,b);c=J.c.Ma(c,d.f.g.width,m.ya(a,h),m.align);g=J.c.Ma(g,d.f.g.height,m.na(a,k),m.l);m.A(a,c,g,h);return g+k}function b(a,b,c){b=J.c.k(b,d.f.g.width,a.width);c=J.c.k(c,d.f.g.height,a.height);a.A(0,b,c);return c+a.height}var c,d=this,g=J.c.k(d.a.Ec,d.canvas.width,d.a.backgroundImage.width),h=J.c.k(d.a.sc,d.canvas.height,d.a.backgroundImage.height)+-1*J.La;J.$a.ub("about","options");for(c=0;c<d.buttons.length;c++)G(F,
d.buttons[c]);d.buttons=[];this.Ld?(y(d.f.g),p.clear(),d.ag.Ib=!1):d.Va(g,h);y(d.f.g);void 0!==d.a.Xd&&b(d.a.Xd,d.a.Pm,d.a.Ye);var k=null;"function"===typeof J.q.tr?k=J.q.tr(d.a,a,b,d.f.g):(c=J.o.N("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.rk,d.a.tk,d.a.dh,d.a.sk,d.a.Lq),b(jd,d.a.Di,d.a.Ei),c=J.o.N("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.Fi,d.a.eh,d.a.fh,d.a.Uf,d.a.Gi));a(J.o.N("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+Xg()+("big"===J.size?"b":"s"),d.a.nn,d.a.Oq,
d.a.vk,d.a.Nq,d.a.Mq);A(d.f.g);if(k)for(c=0;c<k.length;++c){var m=k[c];d.buttons.push(new Rg(m.x,m.y,d.depth-10,Ub(0,0,m.width,m.height),null,{Aa:function(a){return function(){J.q.Sd(a)}}(m.url),Cc:!0},d.f))}else if(void 0!==J.I.cs){c=J.c.k(d.a.Di,d.f.g.width,jd.width);k=J.c.k(d.a.Ei,d.f.g.height,jd.height);c=Math.min(c,J.c.k(d.a.eh,d.f.g.width,d.a.Uf));var k=Math.min(k,J.c.k(d.a.fh,d.f.g.height,d.a.Gi)),m=Math.max(d.a.Uf,jd.width),n=J.c.k(d.a.fh,d.f.g.height,d.a.Gi)+d.a.Gi-k;d.buttons.push(new Rg(c,
k,d.depth-10,Ub(0,0,m,n),null,{Aa:function(){J.q.Sd(J.I.cs)},Cc:!0},d.f))}c=J.c.k(d.a.mn,d.f.g.width,d.a.Ci);d.buttons.push(new lh("default_text",c,d.a.bh,d.depth-20,"optionsAbout_backBtn",d.a.Ci,{Aa:function(){var a;d.Va(g,h);d.ag.Ib=!0;for(a=0;a<d.buttons.length;a++)G(F,d.buttons[a]);d.buttons=[];d.Vf(g,h,!0);d.ot=!1},Sa:d},d.f));return this.ot=!0};
function Xh(a){var b,c,d,g,h,k=J.c.k(a.a.Ec,a.canvas.width,a.a.backgroundImage.width),m=J.c.k(a.a.sc,a.canvas.height,a.a.backgroundImage.height)+-1*J.La;J.$a.ub("versions","options");for(b=0;b<a.buttons.length;b++)G(F,a.buttons[b]);a.buttons=[];a.Va(k,m);y(a.f.g);void 0!==a.a.Xd&&a.a.Xd.A(0,J.c.k(a.a.Pm,a.f.width,a.a.Xd.width),J.c.k(a.a.Ye,a.f.height,a.a.Xd.height));h=Q.ea();B(h,a.a.nn);Ja(h,"left");c=a.a.pu;d=a.a.qu;for(b in J.version)g=b+": "+J.version[b],h.A(g,c,d),d+=h.na(g)+a.a.ou;c=J.c.k(a.a.mn,
a.f.g.width,a.a.Ci);d=a.a.bh;a.buttons.push(new lh("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.Ci,{Aa:function(){var b;a.Va(k,m);for(b=0;b<a.buttons.length;b++)G(F,a.buttons[b]);a.buttons=[];a.Vf(k,m,!0)},Sa:a},a.f))}e.Vy=function(){return!0};e.Wy=function(){J.$a.ub("moreGames","options");var a=Wh();"function"===typeof a&&a();return!0};
e.Ey=function(){var a=this;Yh(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){J.$a.ub("confirm_yes","options:quit");G(F,a);Yg(J.$a,J.d.Qg,Zh(J.d),"progression:levelQuit:"+$h());ai();bi(J.d);return!0})};
e.Gy=function(){var a=this;Yh(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){J.$a.ub("confirm_yes","options:restart");G(F,a);var b=J.d;b.state="LEVEL_END";Yg(J.$a,J.d.Qg,Zh(J.d),"progression:levelRestart:"+$h());b=J.r.ak?b.Hb+1:sh(b)+1;J.d.xa=!0;J.d.qs="retry";ci(J.d,!0);b={failed:!0,level:b,restart:!0};J.q.Bh(b);J.Zd.Bh(b);return!0})};
e.ej=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";di(b,J.o.N(d,"<"+d.toUpperCase()+">"));a&&(b.ag.Ib=!1,b.ym||Mh())};Yh(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){J.d.ej(a);return!0})};
e.Qi=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";di(b,J.o.N(d,"<"+d.toUpperCase()+">"));a&&(b.ag.Ib=!1,b.ym||Mh())};Yh(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){J.d.Qi(a);return!0})};
function Yh(a,b,c,d,g){var h,k,m,n;for(h=0;h<a.buttons.length;h++)G(F,a.buttons[h]);a.buttons=[];b=J.o.N(b,"<"+b.toUpperCase()+">");h=Q.ea();a.a.jr?B(h,a.a.jr):a.a.pm&&B(h,a.a.pm);k=Ra(h,b,a.a.Rk,a.a.Qk,!0);k<h.fontSize&&C(h,k);n=h.ya(b,a.a.Rk)+10;m=h.na(b,a.a.Rk)+10;k=J.c.Ma(a.a.kr,a.f.g.width,n,h.align);m=J.c.Ma(a.a.Sk,a.f.g.height,m,h.l);y(a.f.g);h.A(b,k,m,n);A(a.f.g);k=J.c.k(a.a.hr,a.canvas.width,a.a.Ui)-a.f.x;m=J.c.k(a.a.Ok,a.canvas.height,a.Kc.default_text.m.height)-a.f.y-J.La;a.buttons.push(new lh("default_text",
k,m,a.depth-20,d,a.a.Ui,{Aa:function(){var b,c,d;c=J.c.k(a.a.Ec,a.canvas.width,a.a.backgroundImage.width);d=J.c.k(a.a.sc,a.canvas.height,a.a.backgroundImage.height)+-1*J.La;a.Va(c,d);for(b=0;b<a.buttons.length;b++)G(F,a.buttons[b]);a.buttons=[];a.Vf(c,d,!0);return!0},Sa:a},a.f));k=J.c.k(a.a.ir,a.canvas.width,a.a.Ui)-a.f.x;m=J.c.k(a.a.Pk,a.canvas.height,a.Kc.default_text.m.height)-a.f.y-J.La;a.buttons.push(new lh("default_text",k,m,a.depth-20,c,a.a.Ui,{Aa:function(){return"function"===typeof g?g():
!0},Sa:a},a.f))}function di(a,b){var c,d,g,h;for(c=0;c<a.buttons.length;c++)G(F,a.buttons[c]);a.buttons=[];d=J.c.k(a.a.Ec,a.canvas.width,a.a.backgroundImage.width);g=J.c.k(a.a.sc,a.canvas.height,a.a.backgroundImage.height)+-1*J.La;a.Va(d,g);c=Q.ea();a.a.Xo&&B(c,a.a.Xo);d=Ra(c,b,a.a.Yo,a.a.Gx,!0);d<c.fontSize&&C(c,d);h=c.ya(b,a.a.Yo)+10;g=c.na(b,a.a.Yo)+10;d=J.c.Ma(a.a.Hx,a.f.g.width,h,c.align);g=J.c.Ma(a.a.Ix,a.f.g.height,g,c.l);y(a.f.g);c.A(b,d,g,h);A(a.f.g)}
e.Yy=function(){J.$a.ub("startScreen","options");bi(J.d);return!0};e.close=function(){G(F,this);return this.canvas.ta=!0};
e.Tc=function(){var a,b;this.ym&&Mh(this);J.d.ue=this;this.Er=this.Dr=!1;a=this.a.backgroundImage;this.f=new Nh(this.depth-10,this.Ua,new s(a.width,a.height));this.f.x=J.c.k(this.a.Ec,this.canvas.width,a.width);a=J.c.k(this.a.sc,this.canvas.height,a.height)+-1*J.La;this.f.y=a;this.Va(this.f.x,this.f.y);this.buttons=[];this.Jz?this.Oj():this.Vf(this.f.x,this.f.y);this.ag=new Rg(this.a.kf,this.a.cg,this.depth-20,new Ub(0,0,this.a.nh,this.a.bg),void 0,{Aa:this.close,Sa:this},this.f);this.fi="versions";
this.Wf=new Yb;J.c.Vb(this.Wf,J.Rc);Ob(this.Wf,this.depth-1);Zb(this.Wf,"keyAreaLeft",this.f.x,this.f.y+this.a.Ye,this.a.gh,this.a.uk,76);Zb(this.Wf,"keyAreaRight",this.f.x+this.f.width-this.a.gh,this.f.y+this.a.Ye,this.a.gh,this.a.uk,82);Zb(this.Wf,"keyAreaCentre",J.lx/2-this.a.gh/2,this.f.y+this.a.Ye,this.a.gh,this.a.uk,67);b=this;this.f.y="inGame"!==this.type?this.canvas.height:-this.f.g.height;Rh(this.f,"y",a,this.a.Fj,this.a.Gj,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ib=
!0})};e.Uc=function(){var a;this.ym&&Sh();this.Dr&&ma(J.vg,J.o.no());this.Er&&ma(J.yf);for(a=0;a<this.buttons.length;a++)G(F,this.buttons[a]);this.Wf.clear();G(F,this.Wf);G(F,this.ag);G(F,this.f);J.d.ue=null};e.pc=function(){return!0};e.Qb=function(){return!0};e.qg=function(a){this.ot&&(67===a?this.fi="":76===a?this.fi+="l":82===a&&(this.fi+="r"),"lrl"===this.fi&&Xh(this))};e.vd=function(a){a===J.vg?(this.Va(this.f.x,this.f.y),this.Dr=!0):a===J.yf?this.Er=!0:a===J.qv&&this.close()};
function ei(){this.depth=-200;this.p=this.visible=!0;J.c.Vb(this,J.kg);var a;this.a=J.a.F.jl;if("landscape"===J.orientation&&J.a.F.$n)for(a in J.a.F.$n)this.a[a]=J.a.F.$n[a];this.Kc=J.a.F.yc;for(a in J.a.ha.jl)this.a[a]=J.a.ha.jl[a];Nb(this)}
ei.prototype.Va=function(){var a,b,c,d;c=this.a.backgroundImage;d=(J.ix-Math.abs(J.La))/c.ph;this.f.g=new s(d*c.Si,d*c.ph);y(this.f.g);this.f.y=Math.abs(J.La);a=p.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,va(c,0,0),a.restore());c=Q.ea();B(c,this.a.font);d=J.o.N("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Ra(c,d,this.a.Jm-(c.stroke?c.pa:0),this.a.xz-(c.stroke?c.pa:0),!0);a<c.fontSize&&C(c,a);a=J.c.Ma(this.a.Ut,this.canvas.width,
c.ya(d),c.align);b=J.c.Ma(this.a.Zp,this.canvas.height,c.na(d),c.l);c.A(d,a,b,this.a.Jm);A(this.f.g);this.f.canvas.ta=!0};
ei.prototype.Tc=function(){var a,b,c=this;a=this.a.backgroundImage;a=new s(a.width,a.height);this.f=new Nh(this.depth,J.Rc,a);this.f.x=0;this.f.y=Math.abs(J.La);this.Va();a=J.c.k(this.a.Cv,this.canvas.width,this.a.br);b=J.c.k(this.a.cr,this.canvas.height,this.Kc[this.a.ar].m.height);this.button=new lh(this.a.ar,a,b,this.depth-10,"gameEndScreenBtnText",this.a.br,function(){G(F,c);bi(J.d)},this.f)};ei.prototype.Uc=function(){G(F,this.f);G(F,this.button)};
ei.prototype.vd=function(a){a!==J.vg&&a!==J.yf||this.Va()};
function Rg(a,b,c,d,g,h,k){function m(a,b,c){var d,g;g=J.c.mo(r.canvas);a=Math.round(r.x+r.parent.x-r.Td*r.pb);d=Math.round(r.y+r.parent.y-r.Ud*r.wb);if(r.images&&0<r.sg||0<r.Rj)r.sg=0,r.Rj=0,r.canvas.ta=!0;if(r.Kj&&r.Ib&&Wb(r.xd,a,d,b-g.x,c-g.y))return r.Kj=!1,void 0!==r.Sa?r.Yl.call(r.Sa,r):r.Yl(r)}function n(a,b,c){var d,g,h;h=J.c.mo(r.canvas);d=Math.round(r.x+r.parent.x-r.Td*r.pb);g=Math.round(r.y+r.parent.y-r.Ud*r.wb);if(r.Ib&&Wb(r.xd,d,g,b-h.x,c-h.y))return r.Kj=!0,r.images&&(1<r.images.length?
(r.sg=1,r.canvas.ta=!0):1<r.images[0].S&&(r.Rj=1,r.canvas.ta=!0)),void 0!==typeof tg&&D.play(tg),r.ig=a,!0}this.depth=c;this.p=this.visible=!0;this.group="TG_Token";J.c.Vb(this,J.Rc);this.Ud=this.Td=0;this.x=a;this.y=b;this.width=g?g[0].width:d.Eb-d.ab;this.height=g?g[0].height:d.Zb-d.rb;this.alpha=this.wb=this.pb=1;this.Ra=0;this.xd=d;this.images=g;this.Rj=this.sg=0;this.Kj=!1;this.Ib=!0;this.parent=void 0!==k?k:{x:0,y:0};this.vm=this.um=0;this.td=!0;this.Yl=function(){};this.Cc=!1;"object"===typeof h?
(this.Yl=h.Aa,this.Sa=h.Sa,this.Cc=h.Cc):"function"===typeof h&&(this.Yl=h);var r=this;this.Cc?(this.zh=n,this.Ah=m):(this.Qb=n,this.pc=m);Nb(this)}function kh(a,b,c,d,g,h){void 0===a.fa&&(a.fa=[]);a.fa.push({type:b,start:d,ld:g,kb:c,duration:h,w:0})}
function ph(a){var b,c;if(void 0!==a.fa){for(b=0;b<a.fa.length;b++)if(c=a.fa[b],c.p){switch(c.type){case "xScale":a.pb=c.start+c.ld;break;case "yScale":a.wb=c.start+c.ld;break;case "alpha":a.alpha=c.start+c.ld;break;case "angle":a.Ra=c.start+c.ld;break;case "x":a.x=c.start+c.ld;break;case "y":a.y=c.start+c.ld}c.p=!1}a.canvas.ta=!0}}function wh(a,b){a.images=b;a.canvas.ta=!0}e=Rg.prototype;e.setPosition=function(a,b){this.x=a;this.y=b;this.images&&(this.canvas.ta=!0)};
e.Fp=function(a){this.visible=this.p=a};e.Uc=function(){this.images&&(this.canvas.ta=!0)};
e.Oa=function(a){var b,c;if(void 0!==this.fa){for(b=0;b<this.fa.length;b++)switch(c=this.fa[b],c.w+=a,c.type){case "xScale":var d=this.pb,g=this.um;this.pb=c.kb(c.w,c.start,c.ld,c.duration);this.um=-(this.images[0].width*this.pb-this.images[0].width*c.start)/2;if(isNaN(this.pb)||isNaN(this.um))this.pb=d,this.um=g;break;case "yScale":d=this.wb;g=this.vm;this.wb=c.kb(c.w,c.start,c.ld,c.duration);this.vm=-(this.images[0].height*this.wb-this.images[0].height*c.start)/2;if(isNaN(this.wb)||isNaN(this.vm))this.wb=
d,this.vm=g;break;case "alpha":this.alpha=c.kb(c.w,c.start,c.ld,c.duration);break;case "angle":this.Ra=c.kb(c.w,c.start,c.ld,c.duration);break;case "x":d=this.x;this.x=c.kb(c.w,c.start,c.ld,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.kb(c.w,c.start,c.ld,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.ta=!0}};
e.ud=function(){var a,b,c;c=J.c.mo(this.canvas);a=Math.round(this.x+this.parent.x-this.Td*this.pb);b=Math.round(this.y+this.parent.y-this.Ud*this.wb);this.Kj&&!Wb(this.xd,a,b,F.wa[this.ig].x-c.x,F.wa[this.ig].y-c.y)&&(this.images&&(this.Rj=this.sg=0,this.canvas.ta=!0),this.Kj=!1)};
e.tb=function(){var a,b;a=Math.round(this.x+this.parent.x-this.Td*this.pb);b=Math.round(this.y+this.parent.y-this.Ud*this.wb);this.images&&(this.images[this.sg]instanceof s?this.images[this.sg].Da(a,b,this.pb,this.wb,this.Ra,this.alpha):this.images[this.sg].Da(this.Rj,a,b,this.pb,this.wb,this.Ra,this.alpha));this.td=!1};
function lh(a,b,c,d,g,h,k,m){this.sa=J.a.F.yc[a];a=void 0!==J.a.ha.buttons?J.a.F.Ik[J.a.ha.buttons[a]||J.a.ha.buttons.default_color]:J.a.F.Ik[J.a.F.buttons.default_color];this.font=Q.ea();a.font&&B(this.font,a.font);this.sa.fontSize&&C(this.font,this.sa.fontSize);this.aa=g;this.text=J.o.N(this.aa,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.sa.m.height;this.g={source:this.sa.m,Pa:this.sa.Pa,Mb:this.sa.Mb};g=this.xe(this.g);h=new Ub(0,0,g[0].width,g[0].height);Rg.call(this,
b,c,d,h,g,k,m)}J.c.qj(lh);e=lh.prototype;e.rm=function(a){this.text=J.o.N(this.aa,"<"+this.aa.toUpperCase()+">");a&&B(this.font,a);wh(this,this.xe(this.g))};e.fq=function(a,b){this.aa=a;this.rm(b)};e.Zj=function(a,b,c){"string"===typeof b&&(this.text=b);c&&B(this.font,c);a instanceof q?this.g.source=a:void 0!==a.Pa&&void 0!==a.Mb&&void 0!==a.source&&(this.g=a);wh(this,this.xe(this.g))};
e.xe=function(a){var b,c,d,g,h,k,m=a.Pa+a.Mb;d=this.height-(this.sa.Ed||0);var n=a.source;c=this.font.ya(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-m:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-m:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-m,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-m,c))));c=Ra(this.font,this.text,b,d,!0);c<this.sa.fontSize?C(this.font,c):C(this.font,this.sa.fontSize);c=a.Pa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.sa.Dd&&(d+=this.sa.Dd);h=[];for(g=0;g<n.S;g++)k=new s(b+m,this.height),y(k),n.Na(g,0,0,a.Pa,this.height,0,0,1),n.Zk(g,a.Pa,0,n.width-m,this.height,a.Pa,0,b,this.height,1),n.Na(g,a.Pa+n.width-m,0,a.Mb,this.height,a.Pa+b,0,1),this.font.A(this.text,c,d,b),A(k),h.push(k);return h};e.vd=function(a){a===J.vg&&this.rm()};
function Uh(a,b,c,d,g,h,k,m){this.sa=J.a.F.yc[a];void 0!==h&&(this.width=h);this.height=this.sa.m.height;this.$d={source:this.sa.m,Pa:this.sa.Pa,Mb:this.sa.Mb};this.g=g;a=this.xe();g=new Ub(0,0,a[0].width,a[0].height);Rg.call(this,b,c,d,g,a,k,m)}J.c.qj(Uh);
Uh.prototype.xe=function(){var a,b,c,d,g,h,k,m=this.$d.Pa+this.$d.Mb;b=this.height-(this.sa.Ed||0);var n=this.$d.source;void 0===this.width?a=this.g.width:"number"===typeof this.width?a=this.width-m:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-m:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-m,this.g.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-m,this.g.width))));k=Math.min(a/this.g.width,b/this.g.height);k=Math.min(k,1);g=Math.round(this.$d.Pa+
(a-this.g.width*k)/2);h=Math.round((b-this.g.height*k)/2);c=[];for(b=0;b<n.S;b++){d=new s(a+m,this.height);y(d);n.Na(b,0,0,this.$d.Pa,this.height,0,0,1);n.Zk(b,this.$d.Pa,0,n.width-m,this.height,this.$d.Pa,0,a,this.height,1);n.Na(b,this.$d.Pa+n.width-m,0,this.$d.Mb,this.height,this.$d.Pa+a,0,1);try{p.context.drawImage(this.g,g,h,this.g.width*k,this.g.height*k)}catch(r){}A(d);c.push(d)}return c};J.c.qj(function(a,b,c,d,g,h,k){Rg.call(this,a,b,c,g,d,h,k)});
function hh(a,b,c,d,g,h,k,m){var n;this.sa=J.a.F.yc[a];a=void 0!==J.a.ha.buttons?J.a.F.Ik[J.a.ha.buttons[a]||J.a.ha.buttons.default_color]:J.a.F.Ik[J.a.F.buttons.default_color];this.font=Q.ea();a.font&&B(this.font,a.font);this.sa.fontSize&&C(this.font,this.sa.fontSize);void 0!==h&&(this.width=h);this.height=this.sa.m.height;this.ma=this.sa.ma;if(this.ma.length){for(h=0;h<this.ma.length;h++)if(this.ma[h].id===g){this.bb=h;break}void 0===this.bb&&(this.bb=0);this.text=J.o.N(this.ma[this.bb].aa,"<"+
this.ma[this.bb].id.toUpperCase()+">");this.Sg=this.ma[this.bb].m;h=this.xe();a=new Ub(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.Ig();return k(n.ma[n.bb].id)}:"object"===typeof k?(g={},g.Cc=k.Cc,g.Sa=this,g.Aa=function(){n.Ig();return k.Aa.call(k.Sa,n.ma[n.bb].id)}):g=function(){n.Ig()};Rg.call(this,b,c,d,a,h,g,m)}}J.c.qj(hh);e=hh.prototype;
e.Ig=function(a){var b;if(void 0===a)this.bb=(this.bb+1)%this.ma.length;else for(b=0;b<this.ma.length;b++)if(this.ma[b].id===a){this.bb=b;break}this.Zj(this.ma[this.bb].m,J.o.N(this.ma[this.bb].aa,"<"+this.ma[this.bb].id.toUpperCase()+">"))};e.rm=function(a){a&&B(this.font,a);this.text=J.o.N(this.ma[this.bb].aa,"<"+this.ma[this.bb].id.toUpperCase()+">");wh(this,this.xe())};e.Zj=function(a,b,c){this.text=b;this.Sg=a;c&&B(this.font,c);wh(this,this.xe())};
e.xe=function(){var a,b,c,d,g,h,k=this.sa.Pa,m=this.sa.Mb,n=k+m;g=Math.abs(k-m);d=this.height-(this.sa.Ed||0);var r=this.sa.m,v=this.font.ea();b=v.ya(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Ra(v,this.text,a,d,!0);d<v.fontSize&&C(v,d);b=v.ya(this.text,
a);d=k;c=v.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.sa.Og+Math.round(b/2)):"left"===c?d+=this.sa.Og:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.sa.Dd&&(g+=this.sa.Dd);c=[];for(b=0;b<r.S;b++)h=new s(a+n,this.height),y(h),r.Na(b,0,0,k,this.height,0,0,1),r.Zk(b,k,0,r.width-n,this.height,k,0,a,this.height,1),r.Na(b,k+r.width-n,0,m,this.height,k+a,0,1),this.Sg.A(0,this.sa.Zh,this.sa.$h),v.A(this.text,d,g,a),A(h),c.push(h);return c};e.vd=function(a){a===J.vg&&this.rm()};
function Vh(a,b,c,d,g,h,k){var m;this.ma=J.a.F.yc[a].ma;if(this.ma.length){for(a=0;a<this.ma.length;a++)if(this.ma[a].id===g){this.bb=a;break}void 0===this.bb&&(this.bb=0);this.Sg=this.ma[this.bb].m;a=new Vb(this.Sg);m=this;g="function"===typeof h?function(){m.Ig();return h(m.ma[m.bb].id)}:"object"===typeof h?{Sa:this,Aa:function(){m.Ig();return h.Aa.call(h.Sa,m.ma[m.bb].id)}}:function(){m.Ig()};Rg.call(this,b,c,d,a,[this.Sg],g,k)}}J.c.qj(Vh);
Vh.prototype.Ig=function(a){var b;if(void 0===a)this.bb=(this.bb+1)%this.ma.length;else for(b=0;b<this.ma.length;b++)if(this.ma[b].id===a){this.bb=b;break}this.Zj(this.ma[this.bb].m)};Vh.prototype.Zj=function(a){this.Sg=a;wh(this,[].concat(this.Sg))};
function Nh(a,b,c){this.depth=a;this.p=this.visible=!0;J.c.Vb(this,b);this.g=c;this.gc=0;this.width=c.width;this.height=c.height;this.Ud=this.Td=this.y=this.x=0;this.wb=this.pb=1;this.Ra=0;this.alpha=1;this.Ob=[];this.Qq=0;this.parent={x:0,y:0};this.td=!0;Nb(this,!1)}
function Rh(a,b,c,d,g,h,k,m,n){var r,v=0<k;switch(b){case "x":r=a.x;break;case "y":r=a.y;break;case "xScale":r=a.pb;break;case "yScale":r=a.wb;break;case "scale":b="xScale";r=a.pb;Rh(a,"yScale",c,d,g,void 0,k,m,n);break;case "angle":r=a.Ra;break;case "alpha":r=a.alpha;break;case "subImage":r=0}a.Ob.push({id:a.Qq,w:0,p:!0,Uk:v,type:b,start:r,end:c,Ab:h,duration:d,kb:g,J:k,loop:m,hx:n});a.Qq++}
function Bh(a){var b;for(b=a.Ob.length-1;0<=b;b--){switch(a.Ob[b].type){case "x":a.x=a.Ob[b].end;break;case "y":a.y=a.Ob[b].end;break;case "xScale":a.pb=a.Ob[b].end;break;case "yScale":a.wb=a.Ob[b].end;break;case "angle":a.Ra=a.Ob[b].end;break;case "alpha":a.alpha=a.Ob[b].end;break;case "subImage":a.gc=a.Ob[b].end}"function"===typeof a.Ob[b].Ab&&a.Ob[b].Ab.call(a)}}
Nh.prototype.Oa=function(a){var b,c,d;for(b=0;b<this.Ob.length;b++)if(c=this.Ob[b],c.p&&(c.w+=a,c.Uk&&c.w>=c.J&&(c.w%=c.J,c.Uk=!1),!c.Uk)){c.w>=c.duration?(d=c.end,c.loop?(c.Uk=!0,c.J=c.hx,c.w%=c.duration):("function"===typeof c.Ab&&c.Ab.call(this),this.Ob[b]=void 0)):"subImage"===c.type?(d=this.g instanceof Array?this.g.length:this.g.S,d=Math.floor(c.w*d/c.duration)):d=c.kb(c.w,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.pb=
d;break;case "yScale":this.wb=d;break;case "angle":this.Ra=d;break;case "alpha":this.alpha=d;break;case "subImage":this.gc=d}this.canvas.ta=!0}for(b=this.Ob.length-1;0<=b;b--)void 0===this.Ob[b]&&this.Ob.splice(b,1)};
Nh.prototype.tb=function(){var a,b,c;b=Math.round(this.x-this.pb*this.Td)+this.parent.x;c=Math.round(this.y-this.wb*this.Ud)+this.parent.y;a=this.g;a instanceof Array&&(a=this.g[this.gc%this.g.length]);a instanceof s?a.Da(b,c,this.pb,this.wb,this.Ra,this.alpha):a.Da(this.gc,b,c,this.pb,this.wb,this.Ra,this.alpha);this.td=!1};
function Gh(a,b,c,d,g,h,k,m,n,r,v){this.depth=g;this.visible=!0;this.p=!1;J.c.Vb(this,J.Rc);this.x=a;this.y=b;this.Qo=m;this.Ro="object"===typeof n?n.top:n;this.mx="object"===typeof n?n.bottom:n;this.ya=c;this.na=d;this.width=this.ya+2*this.Qo;this.height=this.na+this.Ro+this.mx;this.value=h||0;this.parent=r||{x:0,y:0};this.font=k;this.toString="function"===typeof v?v:function(a){return a+""};this.alpha=1;this.Gg=this.Fg=this.Ud=this.Td=0;c=new s(this.width,this.height);this.hh=new Nh(this.depth,
this.Ua,c);this.hh.x=a-this.Qo;this.hh.y=b-this.Ro;this.hh.parent=r;this.Ka=this.hh.g;this.je();Nb(this)}Gh.prototype.Uc=function(){G(F,this.hh)};function Qh(a,b,c){a.p=!0;a.yn=a.value;a.value=a.yn;a.end=b;a.duration=c;a.kb=H;a.w=0}
Gh.prototype.je=function(){var a,b;a=this.font.align;b=this.font.l;var c=this.Qo,d=this.Ro;this.Uq||(this.Ka.clear(),this.canvas.ta=!0);y(this.Ka);this.Uq&&this.Uq.Na(0,this.Xz,this.Yz,this.Wz,this.Uz,0,0,1);"center"===a?c+=Math.round(this.ya/2):"right"===a&&(c+=this.ya);"middle"===b?d+=Math.round(this.na/2):"bottom"===b&&(d+=this.na);b=this.toString(this.value);a=Ra(this.font,b,this.ya,this.na,!0);a<this.font.fontSize&&C(this.font,a);this.font.A(b,c,d,this.ya);A(this.Ka);this.hh.td=!0};
Gh.prototype.Oa=function(a){var b;b=Math.round(this.kb(this.w,this.yn,this.end-this.yn,this.duration));this.w>=this.duration?(this.value=this.end,this.p=!1,this.je()):b!==this.value&&(this.value=b,this.je());this.w+=a};function fi(a,b,c){this.depth=-100;this.visible=!1;this.p=!0;this.xy=a;J.c.Vb(this,J.Rc);this.a=J.a.F.Ln;this.Kc=J.a.F.yc;this.dr=b;for(var d in J.a.ha.Ln)this.a[d]=J.a.ha.Ln[d];this.jp=!1!==c;Nb(this)}e=fi.prototype;e.$t=function(){};
e.Hi=function(a,b,c,d,g){b=new lh("default_text",b,c,this.depth-20,a.aa||"NO_TEXT_KEY_GIVEN",d,{Aa:function(){a.Aa&&(a.Sa?a.Aa.call(a.Sa,a):a.Aa(a))},Sa:this},this.f);this.buttons.push(b);a.text&&b.Zj(b.g,a.text);this.buttons[this.buttons.length-1].Ib=g||!1};
e.Va=function(a,b,c){y(this.f.g);p.clear();this.a.backgroundImage.A(0,0,0);a=c?c:this.xy;b=Q.ea();this.a.ft&&B(b,this.a.ft);c=Ra(b,a,this.a.sp,this.a.rp,!0);c<b.fontSize&&C(b,c);c=b.ya(a,this.a.sp)+10;var d=b.na(a,this.a.rp)+10,g=J.c.Ma(this.a.Cy,this.f.g.width,c,b.align),d=J.c.Ma(this.a.Dy,this.f.g.height-gi(this),d,b.l);b.A(a,g,d,c);A(this.f.g)};function gi(a){var b=a.dr;return J.c.k(a.a.Oi,a.f.g.height,a.Kc.default_text.m.height*b.length+a.a.ae*(b.length-1))}
e.Vf=function(a,b){var c,d,g,h,k,m,n,r,v,z=[],z=this.dr;g=this.Kc.default_text.m.height;h=this.a.Kk;k=J.c.k(this.a.Jk,this.canvas.width,h)-a;r=gi(this);for(c=z.length-1;0<=c;c--){n=k;v=h;if("object"===typeof z[c]&&z[c].hasOwnProperty("length")&&z[c].length)for(m=z[c],v=(h-(m.length-1)*this.a.ae)/m.length,d=0;d<m.length;d++)this.Hi(m[d],n,r,v,b),n+=v+this.a.ae;else this.Hi(z[c],n,r,v,b);r-=g+this.a.ae}};
e.zo=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Fp(!1);this.f.visible=!1};e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Fp(!0);this.f.visible=!0};e.close=function(){G(F,this);return this.canvas.ta=!0};function hi(a){var b=J.d.cf;b.Va(b.f.x,b.f.y,a);for(a=0;a<b.buttons.length;a++)G(F,b.buttons[a]);b.canvas.ta=!0}
e.Tc=function(){var a,b;this.jp&&Mh(this);a=this.a.backgroundImage;this.f=new Nh(this.depth-10,this.Ua,new s(a.width,a.height));this.f.x=J.c.k(this.a.Ec,this.canvas.width,a.width);var c="landscape"===J.orientation?J.a.F.Dn:J.a.F.we;a=J.c.k(this.a.sc,this.canvas.height,a.height)+-1*c.Tl;this.f.y=a;this.Va(this.f.x,this.f.y);this.buttons=[];this.Vf(this.f.x);b=this;this.f.y=-this.f.g.height;Rh(this.f,"y",a,this.a.Fj,this.a.Gj,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Ib=!0})};
e.Uc=function(){var a;this.jp&&Sh();for(a=0;a<this.buttons.length;a++)G(F,this.buttons[a]);G(F,this.f);J.d.ue===this&&(J.d.ue=null)};e.pc=function(){return!0};e.Qb=function(){return!0};
function ii(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),m=null;if(128>k)d++;else if(127<k&&2048>k)m=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))m=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);m=a.charCodeAt(++h);if(56320!==(m&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(m&1023)+65536;m=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==m&&(d>c&&(b+=a.slice(c,d)),b+=m,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function eh(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,m){a=k(a,k(k(c^(b|~d),g),m));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,m){a=k(a,k(k(b^c^d,g),m));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,m){a=k(a,k(k(b&d|c&~d,g),m));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,m){a=k(a,k(k(b&c|~b&d,g),m));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var m=[],n,r,v,z,I,t,u,w,x;a=ii(a);m=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);t=1732584193;u=4023233417;w=2562383102;x=271733878;a=m.length;for(n=0;n<a;n+=16)r=t,v=u,z=w,I=x,t=h(t,u,w,x,m[n+
0],7,3614090360),x=h(x,t,u,w,m[n+1],12,3905402710),w=h(w,x,t,u,m[n+2],17,606105819),u=h(u,w,x,t,m[n+3],22,3250441966),t=h(t,u,w,x,m[n+4],7,4118548399),x=h(x,t,u,w,m[n+5],12,1200080426),w=h(w,x,t,u,m[n+6],17,2821735955),u=h(u,w,x,t,m[n+7],22,4249261313),t=h(t,u,w,x,m[n+8],7,1770035416),x=h(x,t,u,w,m[n+9],12,2336552879),w=h(w,x,t,u,m[n+10],17,4294925233),u=h(u,w,x,t,m[n+11],22,2304563134),t=h(t,u,w,x,m[n+12],7,1804603682),x=h(x,t,u,w,m[n+13],12,4254626195),w=h(w,x,t,u,m[n+14],17,2792965006),u=h(u,w,
x,t,m[n+15],22,1236535329),t=g(t,u,w,x,m[n+1],5,4129170786),x=g(x,t,u,w,m[n+6],9,3225465664),w=g(w,x,t,u,m[n+11],14,643717713),u=g(u,w,x,t,m[n+0],20,3921069994),t=g(t,u,w,x,m[n+5],5,3593408605),x=g(x,t,u,w,m[n+10],9,38016083),w=g(w,x,t,u,m[n+15],14,3634488961),u=g(u,w,x,t,m[n+4],20,3889429448),t=g(t,u,w,x,m[n+9],5,568446438),x=g(x,t,u,w,m[n+14],9,3275163606),w=g(w,x,t,u,m[n+3],14,4107603335),u=g(u,w,x,t,m[n+8],20,1163531501),t=g(t,u,w,x,m[n+13],5,2850285829),x=g(x,t,u,w,m[n+2],9,4243563512),w=g(w,
x,t,u,m[n+7],14,1735328473),u=g(u,w,x,t,m[n+12],20,2368359562),t=d(t,u,w,x,m[n+5],4,4294588738),x=d(x,t,u,w,m[n+8],11,2272392833),w=d(w,x,t,u,m[n+11],16,1839030562),u=d(u,w,x,t,m[n+14],23,4259657740),t=d(t,u,w,x,m[n+1],4,2763975236),x=d(x,t,u,w,m[n+4],11,1272893353),w=d(w,x,t,u,m[n+7],16,4139469664),u=d(u,w,x,t,m[n+10],23,3200236656),t=d(t,u,w,x,m[n+13],4,681279174),x=d(x,t,u,w,m[n+0],11,3936430074),w=d(w,x,t,u,m[n+3],16,3572445317),u=d(u,w,x,t,m[n+6],23,76029189),t=d(t,u,w,x,m[n+9],4,3654602809),
x=d(x,t,u,w,m[n+12],11,3873151461),w=d(w,x,t,u,m[n+15],16,530742520),u=d(u,w,x,t,m[n+2],23,3299628645),t=c(t,u,w,x,m[n+0],6,4096336452),x=c(x,t,u,w,m[n+7],10,1126891415),w=c(w,x,t,u,m[n+14],15,2878612391),u=c(u,w,x,t,m[n+5],21,4237533241),t=c(t,u,w,x,m[n+12],6,1700485571),x=c(x,t,u,w,m[n+3],10,2399980690),w=c(w,x,t,u,m[n+10],15,4293915773),u=c(u,w,x,t,m[n+1],21,2240044497),t=c(t,u,w,x,m[n+8],6,1873313359),x=c(x,t,u,w,m[n+15],10,4264355552),w=c(w,x,t,u,m[n+6],15,2734768916),u=c(u,w,x,t,m[n+13],21,
1309151649),t=c(t,u,w,x,m[n+4],6,4149444226),x=c(x,t,u,w,m[n+11],10,3174756917),w=c(w,x,t,u,m[n+2],15,718787259),u=c(u,w,x,t,m[n+9],21,3951481745),t=k(t,r),u=k(u,v),w=k(w,z),x=k(x,I);return(b(t)+b(u)+b(w)+b(x)).toLowerCase()}var Oh;
function ji(a,b){var c=J.I.Al.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function ki(a){ji("call=api_is_valid",function(b){a(b.is_valid)})}
function Ph(a,b){ji("call=is_highscore&score="+a,function(a){0<=a.position?(Oh=a.code,b(void 0!==Oh)):b(!1)})}
TG_StatObjectFactory={qA:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},oA:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,li(),li(),!0)},nA:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===J.r.qh?function(a){return a+d}:function(a){return a-d})},pA:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===J.r.qh?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,m,n){this.id=a;this.type=b;this.key=c;this.qd=d;this.Lg=void 0!==g?g:this.qd;this.visible=void 0!==h?h:!0;this.df=void 0!==k?k:this.qd!==this.Lg;this.Lf=m;this.Em=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return J.c.aq(1E3*a)}}};
TG_StatObject.prototype.ea=function(){return new TG_StatObject(this.id,this.type,this.key,this.qd,this.Lg,this.visible,this.df,this.Lf,this.Em)};J.version=J.version||{};J.version.tg="2.13.0";
function mi(a){this.jf=[];this.dl=[];this.vy=this.fm=!1;this.ht=new fa;this.rj=-1;var b=0,c;if("number"===typeof a)for(c=0;c<a;++c)this.jf[c]=1/a;else{for(c=0;c<a.length;++c)if(b+=a[c],0>a[c])throw"Invalid distribution, chance < 0";if(0===b)for(c=0;c<a.length;++c)this.jf[c]=0;else for(c=0;c<a.length;++c)this.jf[c]=a[c]/b}this.rj=-1;if(this.fm)for(a=0;a<this.jf.length;++a)this.dl[a]=0}
function ni(a){var b,c,d,g,h;b instanceof Array||(b=[b]);!c||c instanceof Array||(c=[c]);for(h=g=d=0;h<a.jf.length;h++)0>b.indexOf(h)&&(!c||0<=c.indexOf(h))&&(a.fm&&(d+=a.dl[h]),g+=a.jf[h]);if(0===g)return a.rj=-1,null;for(;;){var k=a.ht.random(1),m=0,n=!1;for(h=0;h<a.jf.length;++h)if(!(0<=b.indexOf(h)||c&&0>c.indexOf(h)||a.vy&&a.rj===h)){var r=a.jf[h]/g;if(a.fm&&r<a.dl[h]/d)n=!0;else if(m+=r,m>k)return a.fm&&++a.dl[h],a.rj=h}if(0===m)if(n)d++;else return a.rj=-1,null}}
var W={Im:{},Rt:{},St:{},Tt:{},$o:{},ap:{},tz:{},Hw:{},Yu:function(){W.Im={ac:W.Tk,update:W.Ae,Lc:W.ye,end:W.ze,font:Hf,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.Rt={ac:W.Tk,update:W.Ae,Lc:W.ye,end:W.ze,font:If,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.St={ac:W.Tk,update:W.Ae,Lc:W.ye,end:W.ze,font:Jf,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.Tt={ac:W.Tk,update:W.Ae,Lc:W.ye,end:W.ze,font:Kf,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],
[.1,.8,.1])};W.$o={ac:W.Nv,update:W.Ae,Lc:W.ye,end:W.ze,dj:Lf,cj:Mf,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.ap={ac:W.Ov,update:W.Ae,Lc:W.ye,end:W.ze,dj:Lf,cj:Mf,margin:20,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.tz={ac:W.Pv,update:W.Ae,Lc:W.ye,end:W.ze,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])};W.Hw={ac:W.Mv,update:W.Ae,Lc:W.ye,end:W.ze,fe:H,Md:H,ee:lc([fc,$b,fc],[!1,!1,!0],[.1,.8,.1])}},Fv:function(a){function b(a){var d,g={};for(d in a)g[d]="object"===
typeof a[d]&&null!==a[d]?b(a[d]):a[d];return g}return b(a)},zC:function(a){W.Im.font.K=a;W.Rt.font.K=a;W.St.font.K=a;W.Tt.font.K=a},yC:function(a){W.$o.dj.K=a;W.$o.cj.K=a;W.ap.dj.K=a;W.ap.cj.K=a},hi:!1,Ic:[],Qy:function(a){W.hi=a},PA:function(){return W.hi},Fy:function(a){var b,c;for(b=0;b<W.Ic.length;b+=1)c=W.Ic[b],void 0===c||void 0!==a&&c.kind!==a||0<c.Mh||(W.Ic[b]=void 0)},Xu:function(){W.hi=!1;W.Ic=[]},ji:function(a,b,c,d){var g,h,k;void 0===d&&(d=W.hi);if(d)for(h=0;h<W.Ic.length;h+=1)if(g=W.Ic[h],
void 0!==g&&g.pf&&g.kind===a&&g.font===b&&g.text===c)return g.Mh+=1,h;g={kind:a,font:b,text:c,Mh:1,pf:d};h=b.align;k=b.l;Ja(b,"center");Ka(b,"middle");d=b.ya(c)+2*a.margin;a=b.na(c)+2*a.margin;g.Ka=new s(d,a);y(g.Ka);b.A(c,d/2,a/2);A(g.Ka);Ja(b,h);Ka(b,k);for(h=0;h<W.Ic.length;h+=1)if(void 0===W.Ic[h])return W.Ic[h]=g,h;W.Ic.push(g);return W.Ic.length-1},Wu:function(a){var b=W.Ic[a];b.Mh-=1;0>=b.Mh&&!b.pf&&(W.Ic[a]=void 0)},Tk:function(a){a.buffer=W.ji(a.kind,a.kind.font,a.value,a.pf)},Nv:function(a){var b=
a.value.toString();a.buffer=0<=a.value?W.ji(a.kind,a.kind.dj,b,a.pf):W.ji(a.kind,a.kind.cj,b,a.pf)},Ov:function(a){var b=a.value.toString();0<a.value&&(b="+"+b);a.buffer=0<=a.value?W.ji(a.kind,a.kind.dj,b,a.pf):W.ji(a.kind,a.kind.cj,b,a.pf)},Pv:function(a){a.Ka=a.value},Mv:function(a){a.g=a.value;a.gc=0},Ae:function(a){a.x=void 0!==a.kind.fe?a.kind.fe(a.time,a.Cm,a.zr-a.Cm,a.duration):a.Cm+a.time/a.duration*(a.zr-a.Cm);a.y=void 0!==a.kind.Md?a.kind.Md(a.time,a.Dm,a.Ar-a.Dm,a.duration):a.Dm+a.time/
a.duration*(a.Ar-a.Dm);void 0!==a.kind.wr&&(a.Fg=a.kind.wr(a.time,0,1,a.duration));void 0!==a.kind.xr&&(a.Gg=a.kind.xr(a.time,0,1,a.duration));void 0!==a.kind.ee&&(a.alpha=a.kind.ee(a.time,0,1,a.duration));void 0!==a.kind.Yv&&(a.Ra=a.kind.Yv(a.time,0,360,a.duration)%360);void 0!==a.g&&(a.gc=a.time*a.g.S/a.duration)},ye:function(a){var b=p.context,c;void 0!==a.g&&null!==a.images?1===a.Fg&&1===a.Gg&&0===a.Ra?a.g.de(Math.floor(a.gc),a.x,a.y,a.alpha):a.g.Da(Math.floor(a.gc),a.x,a.y,a.Fg,a.Gg,a.Ra,a.alpha):
(c=void 0!==a.Ka&&null!==a.Ka?a.Ka:W.Ic[a.buffer].Ka,1===a.Fg&&1===a.Gg&&0===a.Ra?c.de(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.Fg)||1E-4>Math.abs(a.Gg)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.Ra*Math.PI/180),b.scale(a.Fg,a.Gg),c.de(-c.width/2,-c.height/2,a.alpha),b.restore()))},ze:function(a){void 0!==a.buffer&&W.Wu(a.buffer)},ud:function(a){var b,c,d=!1;for(b=0;b<W.Xb.length;b+=1)c=W.Xb[b],void 0!==c&&(0<c.J?(c.J-=a,0>c.J&&(c.time+=-c.J,c.J=0)):c.time+=a,0<c.J||(c.time>=c.duration?
(c.kind.end(c),W.Xb[b]=void 0):c.kind.update(c),d=!0));d&&(W.canvas.ta=!0)},tb:function(){var a,b;for(a=0;a<W.Xb.length;a+=1)b=W.Xb[a],void 0!==b&&(0<b.J||b.kind.Lc(b))},Xb:[],Mw:function(a,b,c){W.Zv();void 0===a&&(a=J.mg);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);W.visible=!0;W.p=!0;J.c.Vb(W,a);W.depth=b;Nb(W);Pb(W,c);W.Xu();W.Yu()},dv:function(a,b,c,d,g,h,k,m,n){void 0===m&&(m=void 0!==a.J?a.J:0);void 0===n&&(n=W.hi);void 0===g&&void 0!==a.Rx&&(g=c+a.Rx);void 0===h&&void 0!==a.Sx&&(h=d+a.Sx);
void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Cm:c,Dm:d,zr:g,Ar:h,x:c,y:d,Fg:1,Gg:1,alpha:1,Ra:0,time:0,duration:k,J:m,pf:n};a.kind.ac(a);for(b=0;b<W.Xb.length;b+=1)if(void 0===W.Xb[b])return W.Xb[b]=a,b;W.Xb.push(a);return W.Xb.length-1},eC:function(a){var b;0>a||a>=W.Xb.length||(b=W.Xb[a],void 0!==b&&(b.kind.end(b),W.Xb[a]=void 0))},it:function(){var a,b;for(a=0;a<W.Xb.length;a+=1)b=W.Xb[a],void 0!==b&&(b.kind.end(b),W.Xb[a]=void 0);W.Xb=[]},Zv:function(){W.it();W.Fy();G(F,W)}};
function oi(a){this.depth=-99;J.c.Vb(this,J.Rc);this.p=!0;this.visible=!1;this.d=a;Nb(this)}oi.prototype.kj=function(){};oi.prototype.qg=function(){};oi.prototype.Qb=function(a,b,c){a:{var d=this.d,g;for(g=0;g<d.Nb.length;++g)if(d.Nb[g].Qb&&d.Nb[g].Qb(a,b,c)){a=!0;break a}a=!1}return a};
oi.prototype.pc=function(a,b,c){var d;a:if(d=this.d,d.Fb&&a===d.hq)a=d.Fb.a.x,b=d.Fb.a.y,d.Fb.gp&&(a=d.Fb.gp.x,b=d.Fb.gp.y),X?console.log("Component:\n x: tgScale("+(a+d.Fb.Ug.x-X.xb)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.Fb.Ug.y-X.yb)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.Fb.Ug.x)+"),\n y: tgScale("+(b+d.Fb.Ug.y)+"),"),d.iu=!1,d=!0;else{for(var g=0;g<d.Nb.length;++g)if(d.Nb[g].pc&&d.Nb[g].pc(a,b,c)){d=!0;break a}d=!1}return d};
function pi(){this.Ua=this.depth=0;this.Yk=this.ec=this.p=this.visible=!1;this.Nb=[];this.Jb={};this.Jb.fc=!1;this.Ac={};this.paused=this.Ac.fc=!1;this.oz=new s(0,0);this.qz=this.pz=0;this.Fb=null;this.hq=this.ku=this.ju=-1;this.iu=!1;this.dc=this.cc=0;this.El=null}e=pi.prototype;e.Tc=function(){this.El=new oi(this)};e.Uc=function(){this.El&&(G(F,this.El),this.El=null)};
function qi(a,b,c){for(var d in b){var g=b[d];g.g?c[d]=new ri(a,g):g.We?c[d]=new si(a,J.o.N(g.We,"<"+g.We+">"),g):g.aa?c[d]=new si(a,J.o.N(g.aa,"<"+g.aa+">"),g):g.text&&(c[d]=new si(a,g.text,g))}}e.Qp=function(a){this.Jb.fc=!0;this.Jb.w=0;this.Jb.duration=0;this.Jb.Ab=a;for(a=0;a<this.Nb.length;++a)this.Nb[a].Qp(),this.Jb.duration=Math.max(this.Jb.duration,ti(this.Nb[a].a.Jb))};
e.Rp=function(a,b){this.Ac.fc=!0;this.Ac.w=0;this.Ac.duration=0;this.Ac.Ab=a;for(var c=0;c<this.Nb.length;++c)this.Nb[c].Rp(b),this.Ac.duration=Math.max(this.Ac.duration,ti(this.Nb[c].a.Ac))};function ui(a,b){a.fc&&(a.w+=b,a.w>=a.duration&&(a.fc=!1,a.Ab&&a.Ab()))}
e.Oa=function(a){ui(this.Jb,a);ui(this.Ac,a);for(var b=0;b<this.Nb.length;++b)this.Nb[b].Oa(a);if(this.Fb&&this.iu){a=F.wa[this.hq].x;b=F.wa[this.hq].y;this.canvas===J.c.pg(J.lg)&&this.Fb.vl(this.cc+J.mf,this.dc+J.Fe);var c=a-this.ju,d=b-this.ku;this.Fb.x+=c;this.Fb.y+=d;this.Fb.Ug.x+=c;this.Fb.Ug.y+=d;this.ju=a;this.ku=b;this.ec=!0}};e.ud=function(){if(this.ec){var a=J.c.pg(J.lg);this.canvas!==a?this.canvas.ta=this.ec:(p.Ub(a),this.tb())}};
e.al=function(a,b){for(var c=J.c.pg(J.lg)===this.canvas,d=0;d<this.Nb.length;++d){var g=this.Nb[d];g.visible&&(c&&g.vl(a,b),g.tb(a,b))}};e.tb=function(){var a=0,b=0;J.c.pg(J.ql)!==this.canvas&&(a=J.mf,b=J.Fe);this.paused?this.oz.A(this.pz+this.cc+a,this.qz+this.dc+b):this.al(this.cc+a,this.dc+b);this.ec=!1};function vi(){this.Yr=[];this.Br=[];this.Gp=null;this.un=void 0;this.Xn=!0}
function wi(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.wA){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof vi){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new vi,g.Yr=arguments[0],g.Br=arguments[1],g.Gp=arguments[2];var h=null,k=null,m=null,h=g.Yr,k=g.Br,m=g.Gp;this.Nh=g;void 0===this.Nh.un&&(this.Nh.un=!gh(J.d));pi.apply(this,arguments);Nb(this);this.p=this.visible=!0;k=k||[];h=h||[];this.Xt=2;this.Gk=this.Sy=!1;this.u=m||xi;this.or=J.ql;void 0!==this.u.Ua&&(this.or=this.u.Ua);J.c.Vb(this,this.or);this.kk=this.jk=0;this.u.background.Co&&(this.jk=this.u.background.Co);this.u.background.Do&&(this.kk=this.u.background.Do);this.u.background.elements||
(this.Hd=this.u.background.g);this.u.background.tv?(qi(this,this.u.background.elements,{}),this.Hd=this.u.background.g):(g=this.u.background.g,m=new pi,qi(m,this.u.background.elements,[]),g||this.Ua!==J.lg?(this.Hd=new s(g.width,g.height),y(this.Hd),g.A(0,0,0),m.al(-this.jk,-this.kk),A(this.Hd)):(p.Ub(J.c.pg(this.Ua)),m.tb()));var n=this;this.Nw=0;b("score",this.u.Qa)?(this.Ap=new yi(this,this.u.Qa,"SCORE",0,!0),this.u.Jy&&new ri(this,this.u.Jy)):this.Ap=new zi(0,0);this.zl=b("highScore",this.u.Ao)?
new yi(this,this.u.Ao,"HIGHSCORE",0,!1):new zi(0,0);b("highScore",this.u.bs)&&new ri(this,this.u.bs);b(["stage","level"],this.u.vt)&&new yi(this,this.u.vt,"STAGE",0,!1);b("lives",this.u.Es)&&new yi(this,this.u.Es,"LIVES",0,!1);this.Lm=b("time",this.u.time)?new yi(this,this.u.time,"TIME",0,!1,function(a){return n.aq(a)}):new zi(0,0);this.Lm.Ph(36E4);if(this.u.Sb&&this.u.et)throw"Don't define both progress and progressFill in your game_ui settings";this.dt=b("progress",this.u.Sb)?this.u.Sb.round?new Ai(this,
this.u.Sb):new Bi(this,this.u.Sb):b("progress",this.u.et)?new Bi(this,this.u.et):new zi(0,0);b("lives",this.u.Wr)&&new ri(this,this.u.Wr);b("difficulty",this.u.Mn)?new si(this,Ci().toUpperCase(),this.u.Mn):Ci();b("difficulty",this.u.$i)&&(g=s_ui_smiley_medium,g=(this.u.$i.images?this.u.$i.images:[s_ui_smiley_easy,s_ui_smiley_medium,s_ui_smiley_hard])[ih()],this.u.$i.g||(this.u.$i.g=g),this.Vv=new ri(this,this.u.$i),this.Vv.Dp(g));this.u.ug&&!this.u.ug.length&&(this.u.ug=[this.u.ug]);this.u.Ie&&!this.u.Ie.length&&
(this.u.Ie=[this.u.Ie]);this.ms=[];this.ns=[];this.ms[0]=b(["item","item0"],this.u.ug)?new ri(this,this.u.ug[0]):new zi(0,"");this.ns[0]=b(["item","item0"],this.u.Ie)?new si(this,"",this.u.Ie[0]):new zi(0,"");if(this.u.ug&&this.u.Ie)for(g=1;g<this.u.Ie.length;++g)b("item"+g,this.u.Ie[g])&&(this.ns[g]=new si(this,"0 / 0",this.u.Ie[g]),this.ms[g]=new ri(this,this.u.ug[g]));for(var r in this.u)g=this.u[r],g.aa&&new si(this,J.o.N(g.aa,"<"+g.aa+">")+(g.separator?g.separator:""),g);this.Ds=this.Yt=0;this.buttons=
{};for(r in this.u.buttons)g=Di(this,this.u.buttons[r]),this.buttons[r]=g;this.u.ip&&(g=Di(this,this.u.ip),this.buttons.pauseButton=g);this.Xi={};for(r in this.u.Xi)g=this.u.Xi[r],g=new Ei[g.Ti](this,g),this.Xi[r]=g;this.dc=this.cc=0}Lg(pi,wi);var Ei={};function Fi(a){return Z.di.Xi[a]}function Di(a,b){var c=new Gi(a,b,b.sa);a.Nb.push(c);c.NA=b;return c}e=wi.prototype;e.Cp=function(a,b){this.buttons[b||"pauseButton"].Cp(a)};
e.aq=function(a){var b=Math.floor(a/6E4),c=Math.floor(a%6E4/1E3);return this.Sy?(c=Math.floor(a/1E3),c.toString()):b+(10>c?":0":":")+c};e.Oh=function(a){this.dt.Oh(a);return this};e.setTime=function(a){this.Lm.Ph(a);return this};e.getTime=function(){return this.Lm.Ea()};function Hi(a,b){a.Ap.Ph(b);a.Nh.un&&(a.zl.Ea()<b?a.zl.Ph(b):b<a.zl.Ea()&&a.zl.Ph(Math.max(b,a.Nw)))}e.on=function(a){Hi(this,this.Ap.Ea()+a);return this};e.Ji=function(a){return this.dt.Ji(a)};
e.Uc=function(){pi.prototype.Uc.apply(this,arguments);p.Ub(this.canvas);p.clear();for(var a in this.buttons)G(F,this.buttons[a])};
e.Oa=function(a){1===this.Xt&&this.setTime(this.getTime()+a);if(2===this.Xt){if(this.Yt&&1E3*this.Yt>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.Lm,b.nb.w=0,b.nb.Tp=!0,b.font.setFillColor(b.nb.color),b.je(),"undefined"!==typeof a_gameui_timewarning_second&&D.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}pi.prototype.Oa.apply(this,arguments);this.Ds+=a};
e.al=function(a,b){this.Hd&&(this.Hd instanceof q?this.Hd.de(0,a+this.jk,b+this.kk,1):this.Hd.de(a+this.jk,b+this.kk,1));pi.prototype.al.apply(this,arguments);this.Yk&&this.Hd&&qa(a,b,this.Hd.width,this.Hd.height,"blue",!0)};function Ii(a){this.complete=!1;this.position=a}
function Ji(a,b,c,d,g,h){this.d=a;this.width=g;this.height=h;this.Ka=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.ca={};this.ca.cc=0;this.ca.dc=0;this.ca.scale=this.scale;this.ca.alpha=this.alpha;this.ca.Ra=0;this.C={};this.C.fc=!1;this.C.origin={};this.C.target={};this.C.w=0;this.a.Jb&&(Ki(this,this.a.Jb),this.C.fc=!1);this.d.Nb.push(this);Li||(Li={ac:function(a){a.value instanceof s?a.Ka=a.value:(a.g=a.value,a.gc=
0)},update:W.Ae,Lc:W.ye,end:W.ze,fe:H,Md:H,ee:function(a,b,c,d){return 1-fc(a,b,c,d)},wr:function(a,b,c,d){return 1*fc(a,b,c,d)+1},xr:function(a,b,c,d){return 1*fc(a,b,c,d)+1}})}var Li;function ti(a){if(a){var b=a.duration;a.J&&(b+=a.J);return b}return 0}e=Ji.prototype;e.Rp=function(a){this.a.Ac?Mi(this,this.a.Ac):a&&this.a.Jb&&Mi(this,this.a.Jb)};e.Qp=function(){this.a.Jb&&Ki(this,this.a.Jb)};function Ni(a,b){a.C.duration=b.duration;a.C.fc=!0;a.C.pd=b.pd||fc;a.C.w=0;a.C.J=b.J||0;Oi(a)}
function Ki(a,b){a.C.origin.x=void 0===b.x?a.x:b.x;a.C.origin.y=void 0===b.y?a.y:b.y;a.C.origin.alpha=void 0!==b.alpha?b.alpha:1;a.C.origin.scale=void 0!==b.scale?b.scale:1;a.C.target.x=a.x;a.C.target.y=a.y;a.C.target.alpha=a.alpha;a.C.target.scale=a.scale;Ni(a,b)}
function Mi(a,b){a.C.target.x=void 0===b.x?a.x:b.x;a.C.target.y=void 0===b.y?a.y:b.y;a.C.target.alpha=void 0!==b.alpha?b.alpha:1;a.C.target.scale=void 0!==b.scale?b.scale:1;a.C.origin.x=a.x;a.C.origin.y=a.y;a.C.origin.alpha=a.alpha;a.C.origin.scale=a.scale;Ni(a,b)}
function Oi(a){a.C.w>=a.C.duration&&(a.C.w=a.C.duration,a.C.fc=!1);var b=a.C.pd(a.C.w,a.C.origin.x,a.C.target.x-a.C.origin.x,a.C.duration),c=a.C.pd(a.C.w,a.C.origin.y,a.C.target.y-a.C.origin.y,a.C.duration);a.ca.cc=b-a.x;a.ca.dc=c-a.y;a.ca.alpha=a.C.pd(a.C.w,a.C.origin.alpha,a.C.target.alpha-a.C.origin.alpha,a.C.duration);a.ca.scale=a.C.pd(a.C.w,a.C.origin.scale,a.C.target.scale-a.C.origin.scale,a.C.duration);a.d.ec=!0}
e.tb=function(a,b){this.Ka&&this.Ka.Da(this.x+this.ca.cc+a,this.y+this.ca.dc+b,this.ca.scale,this.ca.scale,0,this.ca.alpha)};e.vl=function(a,b){Pi(this.x+this.ca.cc+a,this.y+this.ca.dc+b,this.width*this.ca.scale,this.height*this.ca.scale)};e.Gl=function(a,b){return a>this.x+this.ca.cc&&a<this.x+this.ca.cc+this.width*this.ca.scale&&b>this.y+this.ca.dc&&b<this.y+this.ca.dc+this.height*this.ca.scale};e.Fp=function(a){this.visible!==a&&(this.visible=a,this.d.ec=!0)};
e.Oa=function(a){this.C.fc&&(0<this.C.J?this.C.J-=a:(this.C.w+=-this.C.J,this.C.J=0,this.C.w+=a,Oi(this)))};function zi(a,b){this.Sb=this.value=this.Dl=b}e=zi.prototype;e.Ph=function(a){this.value=a};e.Ea=function(){return this.value};e.Oh=function(a){0>a&&(a=0);100<a&&(a=100);this.Sb=a};e.Ji=function(){};e.Fc=function(){};e.Dp=function(){};
function ri(a,b){this.gp=b;this.a={};for(var c in b)this.a[c]=b[c];this.g=this.a.g;this.S=0;this.mh=this.a.mh;this.a.sz&&(this.a.x+=this.g.hc,this.a.y+=this.g.ic);Ji.call(this,a,this.a,this.a.x,this.a.y,this.g?this.g.width:1,this.g?this.g.height:1)}Lg(Ji,ri);Ei.GameUIImage=ri;function Qi(a,b){a.S!==b&&(a.S=b,a.d.ec=!0)}e=ri.prototype;
e.tb=function(a,b){this.g&&(this.mh&&(a+=-Math.floor(this.g.width/2),b+=-Math.floor(this.g.height/2)),this.g instanceof q?this.g.Da(this.S,this.x+a+this.ca.cc,this.y+b+this.ca.dc,this.ca.scale,this.ca.scale,0,this.ca.alpha):this.g.Da(this.x+a+this.ca.cc,this.y+b+this.ca.dc,this.ca.scale,this.ca.scale,0,this.ca.alpha),this.d.Yk&&qa(this.x+a-this.g.hc+1,this.y+b-this.g.ic+1,this.g.width-2,this.g.height-2,"black",!0))};
e.Gl=function(a,b){if(!this.g)return!1;var c=0,d=0;this.mh&&(c+=-Math.floor(this.g.width/2),d+=-Math.floor(this.g.height/2));c-=this.g.hc;d-=this.g.ic;return a>c+this.x+this.ca.cc&&a<c+this.x+this.ca.cc+this.width*this.ca.scale&&b>d+this.y+this.ca.dc&&b<d+this.y+this.ca.dc+this.height*this.ca.scale};
e.vl=function(a,b){this.g&&(this.mh&&(a+=-Math.floor(this.g.width/2),b+=-Math.floor(this.g.height/2)),a-=this.g.hc,b-=this.g.ic,Pi(this.x+this.ca.cc+a,this.y+this.ca.dc+b,this.width*this.ca.scale,this.height*this.ca.scale))};e.oo=function(a){a||(a=new da(0,0));a.x=this.x+J.mf+this.d.cc;a.y=this.y+J.Fe+this.d.dc;return a};e.Dp=function(a){a!==this.g&&(this.g=a,this.d.ec=!0,this.g&&(this.width=this.g.width,this.height=this.g.height))};
function si(a,b,c){"object"===typeof b&&(c=b,b=c.aa?J.o.N(c.aa,"<"+c.aa+">"):c.text||"");this.text=b;this.font=c.font.ea();c.nc&&B(this.font,c.nc);this.Zl=c.x;this.$l=c.y;this.hp=c.jb;this.by=c.cb;this.ay=this.font.fillColor;this.tc=void 0===c.tc?.2:c.tc;Ji.call(this,a,c,Math.floor(c.x-.1*c.jb),Math.floor(c.y-.1*c.cb),Math.floor(1.2*c.jb),Math.floor(1.2*c.cb));this.Ka=new s(this.width,this.height);switch(this.font.align){case "left":this.Fd=Math.floor(.1*c.jb);break;case "right":this.Fd=Math.floor(1.1*
c.jb);break;case "center":this.Fd=Math.floor(.6*c.jb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.tc*this.font.fontSize);switch(this.font.l){case "top":this.Gd=Math.floor(.1*c.cb);break;case "bottom":this.Gd=Math.floor(1.1*c.cb)+a;break;case "middle":this.Gd=Math.floor(.6*c.cb)+a;break;default:throw"Unknown baseline: "+this.font.l;}this.nb={};this.nb.color="red";this.nb.duration=200;this.nb.w=0;this.nb.Tp=!1;this.je()}Lg(Ji,si);Ei.GameUIText=si;
si.prototype.Oa=function(a){Ji.prototype.Oa.apply(this,arguments);this.nb.Tp&&(this.nb.w+=a,this.nb.duration<=this.nb.w&&(this.nb.Tp=!1,this.font.setFillColor(this.ay),this.je()))};
si.prototype.je=function(){this.Ka.clear();y(this.Ka);var a=this.font.ya(this.text),b=1;a>this.hp&&(b=this.hp/a);this.font.Da(this.text,this.Fd,this.Gd,b,b,0,1);this.d.Yk&&(qa(0,0,this.Ka.width,this.Ka.height,"black",!0),qa(this.Zl-this.x,this.$l-this.y,this.Ka.width-2*(this.Zl-this.x),this.Ka.height-2*(this.$l-this.y),"red",!0),sa(this.Fd-5,this.Gd,this.Fd+5,this.Gd,"green",1),sa(this.Fd,this.Gd-5,this.Fd,this.Gd+5,"green",1));this.d.ec=!0;A(this.Ka)};
si.prototype.Fc=function(a){this.text!==a&&(this.text=a,this.je())};function Ri(a){return""+a}function Si(a,b,c){return b+c}function yi(a,b,c,d,g,h){this.value=this.Dl=d||0;this.Ym=-1;this.nu=c;this.a=b;this.mu=-99999;this.Uj=b.Uj||0;this.gl=b.gl?b.gl:h||Ri;c=Si;g&&0!==this.a.vr&&(c=gc);this.Wa=new Mg(this.Dl,void 0===this.a.vr?500:this.a.vr,c);b.Yi&&(this.Yi="game_ui_"+b.Yi);this.text=Ti(this)+this.gl(this.Dl);si.call(this,a,this.text,b)}Lg(si,yi);Ei.GameUIValue=yi;
yi.prototype.Ph=function(a){this.value=a;Og(this.Wa,this.value)};yi.prototype.Ea=function(){return this.value};yi.prototype.fq=function(a){var b=this.Ym;if(a||F.pl-this.mu>this.Uj)b=this.gl(Math.floor(this.Wa.Ea()));this.Ym!==b&&(this.mu=F.pl,this.Ym=b,this.text=Ti(this)+b,this.je())};yi.prototype.Oa=function(a){si.prototype.Oa.apply(this,arguments);Ng(this.Wa,a);Math.floor(this.Wa.Ea())!==this.Ym&&this.fq()};
function Ti(a){var b="";a.a.$j&&(b=a.Yi?J.o.N(a.Yi,"<"+a.Yi.toUpperCase()+">"):J.o.N("game_ui_"+a.nu,"<"+a.nu+">"));return b+(a.a.separator?a.a.separator:"")}function Bi(a,b){this.Zf=this.Sb=0;this.a=b;this.Lj=this.Eg=0;this.g=b.g;this.ff=b.ff||b.g;this.Bo=b.Bo||null;this.a.dm=this.a.dm||0;this.a.em=this.a.em||0;this.tn=!0;this.om=b.om||0;this.h=[];this.Gk=!1;this.Wa=new Mg(0,200,jc);this.Jc=new Mg(0,200,jc);Ji.call(this,a,b,b.x,b.y,this.g.width,this.g.height)}Lg(Ji,Bi);Ei.GameUIProgress=Bi;
Bi.prototype.Oh=function(a){0>a&&(a=0);100<a&&(a=100);this.Gk?(this.Zf=a-this.Sb,Og(this.Jc,this.Zf)):(Og(this.Wa,a),this.Sb=a)};Bi.prototype.Oa=function(a){Ng(this.Wa,a);var b=this.Wa.Ea();b!==this.Eg&&(this.d.ec=!0,this.Eg=b);Ng(this.Jc,a);a=this.Jc.Ea();a!==this.Lj&&(this.d.ec=!0,this.Lj=a);b+=a;if(this.tn)for(a=0;a<this.h.length;++a){var c=b>=this.h[a].position&&this.Sb+this.Zf>=this.h[a].position;this.h[a].complete!==c&&(this.a.h&&(this.d.ec=!0,this.Eg=b),this.h[a].complete=c)}};
Bi.prototype.tb=function(a,b){var c,d,g;if(0===this.om&&(0<this.Jc.Ea()&&this.ff.Na(0,this.width*this.Wa.Ea()/100,0,this.ff.width*this.Jc.Ea()/100,this.ff.height,a+this.x+this.width*this.Wa.Ea()/100,b+this.y),this.g.Na(0,0,0,this.width*this.Wa.Ea()/100,this.height,a+this.x,b+this.y),this.a.h))for(c=0;c<this.h.length;++c)d=this.h[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.A(0,a+this.x+this.width/100*d.position,b+this.y+this.a.h.y);if(1===this.om&&(0<this.Jc.Ea()&&this.ff.Na(0,0,this.height-
this.height*this.Wa.Ea()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Wa.Ea()/100)),this.g.Na(0,0,this.height-this.height*this.Wa.Ea()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Wa.Ea()/100)),this.a.h))for(c=0;c<this.h.length;++c)d=this.h[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.A(0,a+this.x+this.a.h.x,b+this.y+this.height-this.height/100*d.position);if(2===this.om&&(0<this.Jc.Ea()&&this.ff.Na(0,0,this.height*this.Wa.Ea()/
100,this.ff.width,this.ff.height*this.Jc.Ea()/100,a+this.x+this.width*this.Wa.Ea()/100,b+this.y),this.g.Na(0,0,0,this.width,this.height*this.Wa.Ea()/100,a+this.x,b+this.y),this.a.h))for(c=0;c<this.h.length;++c)d=this.h[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.A(0,a+this.x+this.a.h.x,b+this.y+this.height/100*d.position);this.Bo&&this.Bo.A(0,a+this.x+this.a.dm,b+this.y+this.a.em)};Bi.prototype.Ji=function(a){this.h.push(new Ii(a));return this.h.length-1};
function Gi(a,b,c){this.Om=!1;this.Wj=-1;this.d=a;this.a=b;this.p=!0;this.Cp(c);ri.call(this,a,b)}Lg(ri,Gi);Ei.GameUIButton=Gi;Gi.prototype.Cp=function(a){var b=null,c=null,d=this.d,g=this.a;void 0===a&&(a=g.sa?g.sa:0);switch(a){case 0:b=d.Nh.Xn?Gd:Hd;c=function(){gh(J.d)?J.d.Oe(!1,!0,d.Nh.Xn):J.d.Oe();return!0};break;case 1:b=Id;c=function(){J.d.Oe();return!0};break;case 2:b=s_btn_small_quit;c=function(){Ui(d.Nh.Xn);return!0};break;case 3:b=g.g}this.Ab=c;this.a.g=b};
Gi.prototype.Qb=function(a,b,c){if(this.p)return this.Gl(b-J.mf,c-J.Fe)?(this.Om=!0,this.Wj=a,Qi(this,1),!0):!1};Gi.prototype.Oa=function(a){ri.prototype.Oa.apply(this,arguments);this.Om&&(this.Gl(F.wa[this.Wj].x-J.mf,F.wa[this.Wj].y-J.Fe)?Qi(this,1):Qi(this,0))};Gi.prototype.pc=function(a,b,c){return this.Om&&a===this.Wj?(Qi(this,0),this.Gl(b-J.mf,c-J.Fe)&&this.Ab&&this.Ab(),this.Om=!1,this.Wj=-1,!0):!1};
function Ai(a,b){this.Zf=this.Sb=0;this.a=b;this.Lj=this.Eg=0;this.tn=!0;this.h=[];this.color=b.color||"#00AEEF";this.Hk=b.Hk||"#FF0F64";this.Ek=b.Ek||"#FFED93";this.Zq=void 0===b.blink||b.blink;this.Zc=b.Zc;this.ih=this.Gk=!1;this.Xf=0;this.Dk=1E3;this.Fk=0;this.Wa=new Mg(0,200,jc);this.Jc=new Mg(0,200,jc);Ji.call(this,a,b,b.x,b.y,1,1)}Lg(Ji,Ai);Ei.GameUIRoundProgress=Ai;function Vi(a){a.Zq&&(a.ih?a.Xf-=a.Dk:(a.ih=!0,a.Xf=0,a.Fk=0,Og(a.Wa,100)))}e=Ai.prototype;
e.Ji=function(a){this.h.push(new Ii(a));return this.h.length-1};e.Oh=function(a){0>a&&(a=0);100<a&&(a=100);this.Gk?(this.Zf=a-this.Sb,Og(this.Jc,this.Zf)):(this.ih||(100===a&&this.Zq?Vi(this):Og(this.Wa,a)),this.Sb=a)};
e.Oa=function(a){Ng(this.Wa,a);var b=this.Wa.Ea();b!==this.Eg&&(this.d.ec=!0,this.Eg=b);Ng(this.Jc,a);var c=this.Jc.Ea();c!==this.Lj&&(this.d.ec=!0,this.Lj=c);this.ih&&(this.Xf+=a,this.Xf>=this.Dk?100===this.Sb?(this.ih=!1,Vi(this)):(this.ih=!1,this.Fk=0,this.Wa.oc=0,this.Wa.oe=0,Og(this.Wa,this.Sb)):this.Fk=(-Math.cos(this.Xf/this.Dk*5*Math.PI*2)+1)/2,this.d.ec=!0);b+=c;if(this.tn)for(a=0;a<this.h.length;++a)c=b>=this.h[a].position&&this.Sb+this.Zf>=this.h[a].position,this.h[a].complete!==c&&(this.a.h&&
(this.d.ec=!0,this.Eg=b),this.h[a].complete=c)};e.vl=function(a,b){this.Zc&&Pi(this.x+this.ca.cc+a-this.Zc.hc,this.y+this.ca.dc+b-this.Zc.ic,this.Zc.width*this.ca.scale,this.Zc.height*this.ca.scale)};
e.tb=function(a,b){var c,d;if(this.Zc){d=this.Wa.Ea()/100;d=Math.max(d,0);d=Math.min(d,1);var g=p.context,h=this.Zc.width/2-K(4),k=g.fillStyle;0<this.Jc.Ea()&&(c=this.Jc.Ea()/100,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+c)*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.Hk,g.fill());g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Dk&&(c=g.globalAlpha,g.globalAlpha*=
this.Fk,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.Ek,g.fill(),g.globalAlpha=c);if(this.a.h){var m=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=K(2);for(d=0;d<this.h.length;++d){c=this.h[d];c=c.position/100*Math.PI*2;var r=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+r),Math.round(b+this.y+c));g.stroke()}g.strokeStyle=
m;g.lineWidth=n}this.Zc.A(0,a+this.x,b+this.y);if(this.a.h)for(d=0;d<this.h.length;++d)c=this.h[d],h=c.complete?zd:yd,c=c.position/100*Math.PI*2,m=Math.sin(-.5*Math.PI+c)*this.a.h.tp*.5,h.A(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.h.tp*.5),Math.round(b+this.y+m));g.fillStyle=k}};J.version=J.version||{};J.version.game_ui="2.1.0";var Wi=Wi||{},X={xb:K(14),yb:K(40)};
Wi.gk={background:{g:wd,Co:K(0),Do:K(34),elements:[{g:Cd,x:K(56)+X.xb,y:K(44)+X.yb},{aa:"game_ui_STAGE",x:K(6)+X.xb,y:K(108)+X.yb,jb:K(100),cb:K(20),tc:.2,font:T,nc:{fillColor:"#9fa9bf",fontSize:K(20),Bc:"lower",align:"center",l:"top"}},{g:vd,x:K(9,"round")+X.xb,y:K(182)+X.yb},{g:vd,x:K(9,"round")+X.xb,y:K(240)+X.yb},{aa:"game_ui_SCORE",x:K(6)+X.xb,y:K(254)+X.yb,jb:K(100),cb:K(20),tc:.2,font:T,nc:{fillColor:"#9fa9bf",fontSize:K(20),Bc:"lower",align:"center",l:"top"}},{g:vd,x:K(9,"round")+X.xb,y:K(304)+
X.yb},{aa:"game_ui_HIGHSCORE",x:K(6)+X.xb,y:K(370)+X.yb,jb:K(100),cb:K(20),tc:.2,font:T,nc:{fillColor:"#9fa9bf",fontSize:K(20),Bc:"lower",align:"center",l:"top"}}]},Sb:{x:K(56)+X.xb,y:K(44)+X.yb,Zc:Bd,round:!0,color:"#00AEEF",Hk:"#FF0F64",Ek:"#FFED93",blink:!1,h:{tp:K(73)}},vt:{x:K(6)+X.xb,y:K(130)+X.yb,jb:K(100),cb:K(38),tc:.2,$j:!1,separator:"",font:T,nc:{fontSize:K(38),fillColor:"#12AEEB",align:"center",l:"top"}},Wr:{x:K(50)+X.xb,y:K(224)+X.yb,g:Ad,mh:!0},Es:{x:K(56)+X.xb,y:K(200)+X.yb,jb:K(50),
cb:K(24),tc:.2,$j:!1,separator:"x ",font:T,nc:{align:"left",l:"middle",fillColor:"#5782AE"}},Qa:{x:K(6)+X.xb,y:K(276)+X.yb,jb:K(100),cb:K(24),Uj:50,tc:.2,$j:!1,separator:"",font:T,nc:{fontSize:K(24),fillColor:"#172348",align:"center",l:"top"}},bs:{x:K(43,"round")+X.xb,y:K(324)+X.yb,g:xd,mh:!1,sz:!0},Ao:{x:K(6)+X.xb,y:K(392)+X.yb,jb:K(100),cb:K(20),tc:.2,$j:!1,separator:"",font:T,nc:{fillColor:"#59668e",fontSize:K(20),align:"center",l:"top"}},ip:{x:K(6)+X.xb,y:K(538)-K(86)+X.yb}};var xi=Wi.gk;
J.version=J.version||{};J.version.game="1.0.1";Wi=Wi||{};X={xb:K(0),yb:K(0)};
Wi.gk={Ua:J.lg,background:{Co:K(0),Do:K(34),tv:!0,elements:[{aa:"game_ui_SCORE",x:K(14)+X.xb,y:K(200)+X.yb,jb:K(100),cb:K(20),tc:.2,font:T,nc:{fillColor:"#63380f",fontSize:K(20),Bc:"lower",align:"center",l:"top"}}]},Sb:{x:K(62)+X.xb,y:K(134)+X.yb,round:!0,Zc:Ze,color:"#FCF59E",Hk:"#FCF59E",Ek:"#FCF59E",h:{tp:K(73)}},Qa:{x:K(28)+X.xb,y:K(220)+X.yb,jb:K(72),cb:K(30),Uj:50,tc:.2,$j:!1,separator:"",font:T,nc:{fontSize:K(30),fillColor:"#63380f",align:"center",l:"top"}},ip:{x:K(12)+X.xb,y:K(486)+X.yb},
Xi:{level:{Ti:"GameUIText",aa:"Level 27",x:K(16),y:K(24),jb:K(96),cb:K(30),tc:.2,font:T,nc:{fillColor:"#ba8148",fontSize:K(30),Bc:"upper",align:"center",l:"middle"}},movesHeader:{Ti:"GameUIBreakText",aa:"MovesLeft",x:K(16),y:K(312),jb:K(102),cb:K(28),tc:.2,font:T,nc:{fillColor:"#fcf59e",fontSize:K(24),Bc:"upper",align:"center",l:"top"}},movesLeft:{Ti:"GameUIText",text:"0",x:K(30),y:K(256),jb:K(68),cb:K(48),tc:.2,font:T,nc:{fillColor:"#fcf59e",fontSize:K(48),Bc:"upper",align:"center",l:"middle"}},
goalImage:{Ti:"GameUIImage",x:K(60),y:K(370),g:null},goalText:{Ti:"GameUIText",Uj:50,x:K(16),y:K(410),jb:K(96),cb:K(30),tc:.2,font:T,nc:{fillColor:"#fcf59e",fontSize:K(30),Bc:"upper",align:"center",l:"middle"}}}};var xi=Wi.gk,Z={};function Xi(a){this.Ua=this.depth=0;this.p=this.visible=!0;this.fc=!1;this.Go=a;this.qp=this.pp=this.bi=-1;this.Kh=[];this.Gh=!1;this.wj=this.pj=null;this.il=0;J.c.Vb(this,J.mg);Nb(this);Pb(this,["game"]);new Yi}e=Xi.prototype;
e.Tc=function(){Zi(this);$i();this.Va();aj();var a=this;(new bj).show(function(){Z.s.be=!0;Z.s.op=!0;a.fc=!0;Fi("goalImage").Dp(Z.B.Yj);var b;b=D.play(ig,b||0);D.stop("battleMusic",0);ab(D,b);if(b=D.play(bg))D.wk(b,"music"),D.wk(b,"battleMusic"),D.Ep(b,!0);J.d.wf()||(nb("battleMusic"),mb("battleMusic"))})};
function Zi(a){Z={d:a,Qa:0};Z.SA=li(a.Go);Z.sj=a.Go+1;Z.lb=J.a.e.As[a.Go];Z.Ch=Z.lb.n[0];Z.state=cj;Z.Fo=!1;Z.h=0;Z.ia=[];Z.lf=-1;Z.nd=[];Z.at=Z.lb.G.H;Z.mm=Z.lb.G.X;0===Z.lb.G.Y+Z.lb.G.U+Z.lb.G.W+Z.lb.G.V&&(Z.at=99999,Z.mm=99999);Z.Dg=0;Z.ry=new mi([Z.lb.G.Y,Z.lb.G.U,Z.lb.G.W,Z.lb.G.V]);Z.Ny=Math.floor(999999999*Math.random());Z.gt=new fa(Z.Ny);Z.Ij=0;Z.zm=0;Z.tl=0;Z.Mk=0;Z.Fn=!1;Z.pr=0;Z.R=0;Z.fl=!0;var b=Z.Ch.width/J.a.e.th.ah,c=Z.Ch.height/J.a.e.th.ah;Z.s=new dj(b,c);Z.offset={x:J.ng+(J.rl-b*
J.a.e.da.width)/2,y:J.og+(J.kl-c*J.a.e.da.height)/2};a.qc={x:-tf.width,y:-tf.height};a.pj=new s(b*J.a.e.da.width+2*tf.width,c*J.a.e.da.height+2*tf.height);a.wj=new s(b*J.a.e.da.width+2*tf.width,c*J.a.e.da.height+2*tf.height)}
function $i(){var a,b,c,d,g,h;Z.rc=Z.lb.B.$;Z.Uo=1.25*Z.lb.h.h[2];Z.rt=new mi(Z.lb.t.T);a=Z.rt;c=Z.gt.ea();a.ht=c;Z.Bf=[];for(a=0;a<Z.lb.t.T.length;a++)0<Z.lb.t.T[a]&&Z.Bf.push(a);for(a=0;a<Z.Bf.length;a++)c=Z.Bf[a],d=Math.floor(Z.gt.random()*Z.Bf.length),Z.Bf[a]=Z.Bf[d],Z.Bf[d]=c;for(a=0;a<Z.Ch.items.length;a++){b=Z.Ch.items[a];c=b.x/J.a.e.th.ah;d=b.y/J.a.e.th.ah;g={i:c,j:d};h=null;if("monster"===b.id)h=ej(Z.s,new fj(Z.s,b.kind),g);else if("wall"===b.id)ej(Z.s,new gj(Z.s),g);else if("diamond"===
b.id)h=ej(Z.s,new hj(Z.s),g);else if("blocker"===b.id)h=ej(Z.s,new ij(Z.s),g);else if("guard"===b.id)h=ej(Z.s,new jj(Z.s),g);else if("cloner"===b.id)h=ej(Z.s,new kj(Z.s),g);else if("sludge"===b.id)b={i:c,j:d},g=Z.s,lj(g,b)&&null===g.ua[b.i][b.j].Af&&(g.ua[b.i][b.j].Af={p:!0,J:0,frame:0},Z.zm++);else if("priority"===b.id){g={i:c,j:d};var k=Z.s;lj(k,g)&&k.zd.push({position:g,direction:b.direction,p:!0,disabled:!1})}null!==h&&(h.scale.x=0,h.scale.y=0,h.Yb({x:0,y:0},{x:1,y:1},jc,J.a.e.oa.Pw,(2*c+d)*J.a.e.oa.Ow))}for(a=
0;a<Z.Ch.items.length;a++)b=Z.Ch.items[a],c=b.x/J.a.e.th.ah,d=b.y/J.a.e.th.ah,"pow_hor"===b.id?(h=mj(Z.s,{i:c,j:d}),null!==h&&nj(h,oj)):"pow_ver"===b.id?(h=mj(Z.s,{i:c,j:d}),null!==h&&nj(h,pj)):"pow_exp"===b.id&&(h=mj(Z.s,{i:c,j:d}),null!==h&&nj(h,qj));rj(Z.s);switch(Z.lb.B.type){case "score":Z.B=new sj(Z.lb.B.target);break;case "diamond":Z.B=new tj(Z.lb.B.target);Z.R=Z.lb.t.R/100;break;case "sludge":Z.B=new uj;break;case "guard":Z.B=new vj;break;case "cloners":Z.B=new wj}}
function aj(){var a;a=new vi;a.Gp=Wi.gk;Z.di=new wi(a);for(a=0;3>a;a++)Z.di.Ji(Z.lb.h.h[a]/Z.Uo*100);0>Z.rc?Fi("movesLeft").Fc("\u221e"):Fi("movesLeft").Fc(Z.rc.toString());Fi("goalText").Fc(Z.B.current+"/"+Z.B.target);Fi("level").Fc(J.o.N("game_ui_LEVEL","<game_ui_LEVEL>")+" "+Z.sj)}e.Uc=function(){G(F,Z.di);var a=F,b,c=Qb(a,"item");for(b=0;b<c.length;b+=1)G(a,c[b]);xj.clear();yj();this.canvas.ta=!0};e.Oa=function(){};
e.Qb=function(a,b,c){-1===this.bi&&(this.bi=a,this.Gh||Z.s.rg||0===Z.rc||Z.state!==zj||(a=mj(Z.s,{i:Math.floor((b-Z.offset.x)/J.a.e.da.width),j:Math.floor((c-Z.offset.y)/J.a.e.da.height)}),null!==a&&a.Vc&&(Z.ia.push(a),a.uf(1,!1),Aj(this),Bj(),Cj(this),Dj(this))))};
e.pc=function(a){Ej=0;if(this.bi===a&&!this.Gh&&0!==Z.rc&&Z.state===zj){this.qp=this.pp=this.bi=-1;if(0!==Z.nd.length){this.Gh=!0;Fj(this);var b=Z.lb.G,c=Z.ia.length,d=Z.ia[Z.ia.length-1];a=d.position;var g=!1;if(!(c<Z.at))if(Z.Dg>=b.Z||c>=Z.mm?g=!0:(g=1/(b.X-b.H+1),g*=c-b.H+1,g=Math.random()<g),g)if(b=ni(Z.ry),0===b)Gj(this,pj,a,d.Ad),Z.Dg=0;else if(1===b)Gj(this,oj,a,d.Ad),Z.Dg=0;else if(2===b)Gj(this,qj,a,d.Ad),Z.Dg=0;else{b=!0;for(c=0;c<Z.ia.length;c++)if(Z.ia[c].type===$.types.dk){b=!1;break}b?
(d=new Hj(Z.s,d.Ad),ej(Z.s,d,a),Z.Dg=0):Z.Dg++}else Z.Dg++;0<Z.rc&&Z.ia.length>=J.a.e.e.H&&Z.rc--}if(Z.ia.length<J.a.e.e.H)for(a=0;a<Z.ia.length;a++)Z.ia[a].Ih();Z.ia=[];Z.lf=-1;Z.nd=[]}};function Fj(a){if(Z.state===zj&&Z.ia.length<J.a.e.e.H)a.Gh=!1;else{var b,c;for(Z.nd.sort(function(a,b){var c=b.J-a.J;return 0===c?a.Rb===b.Rb?0:a.Rb===Ij||a.Rb===Jj?1:a.Rb===Kj&&b.Rb===Lj?1:-1:c});0<Z.nd.length;)b=Z.nd.pop(),c=Mj(Z.s,b.position,b.Rb,b.J),null!==c&&a.on(b.Qa,b.position,c.Ad)}}
e.on=function(a,b,c){var d,g;Hb({type:Nj,ev:a},c,this);d=(b.i+.5)*J.a.e.da.width+Z.offset.x;b=(b.j+.25)*J.a.e.da.height+Z.offset.y;g="score_";g=a>=J.a.e.mc.Iy?g+"high":a>=J.a.e.mc.Ly?g+"mid":g+"low";xj.Am(a.toString(),d,b,0,J.a.e.mc.My,J.a.e.mc.Hy,g,c)};function Oj(a){a.Gh=!1;0<Z.Mk&&Z.state===zj&&Pj();0<=Z.rc&&(Fi("movesLeft").Fc(Z.rc.toString()),0===Z.rc&&Z.state===zj&&(Z.state=Qj));for(a=Z.h;3>a;a++)Z.Qa>=Z.lb.h.h[a]&&(Z.h=a+1);ma(Rj,{})}
e.xa=function(){J.a.ha.xa=Z.Fo?J.a.ha.Tw:J.a.ha.Sw;Z.di.Oh(Z.Qa/Z.Uo*100);for(var a=Z.h;3>a;a++)Z.Qa>=Z.lb.h.h[a]&&(Z.h=a+1);Sj();yj()};e.kj=function(){};e.qg=function(){};
e.ul=function(a){var b;a.type===Tj&&this.xa();a.type===Uj&&(xj.Am(J.o.N("NoMoves","<NoMoves>"),J.ng+J.rl/2,J.og+J.kl/2-J.a.e.mc.Jl/2,0,J.a.e.mc.Jl,J.a.e.mc.Il,"level_lose",0),b=J.a.e.mc.Il+Vj(Z.s)+1500,Hb({type:Tj},b,this),D.play(jg,void 0));a.type===Wj&&(xj.Am(J.o.N("LevelCompleted","<LevelCompleted>"),J.ng+J.rl/2,J.og+J.kl/2-J.a.e.mc.Jl/2,0,J.a.e.mc.Jl,J.a.e.mc.Il,"level_win",0),Z.Fo=!0,b=J.a.e.mc.Il+Vj(Z.s),0<Z.rc||0<Z.Ij?Hb({type:Xj},b,this):Hb({type:Tj},b,this),yj());a.type===Xj&&(xj.Am(J.o.N("FrenzyStart",
"<FrenzyStart>"),J.ng+J.rl/2,J.og+J.kl/2-J.a.e.mc.Jr/2,0,J.a.e.mc.Jr,J.a.e.mc.Ir,"level_win",0),Z.state=Yj,this.il=J.a.e.mc.Ir,D.play(mg,void 0));a.type===Nj&&(Z.Qa+=a.ev,Hi(Z.di,Z.Qa),Z.B.handleEvent(Zj,{}))};
e.vd=function(a,b){console.log(a);Z.B.handleEvent(a,b);Z.state===zj&&Z.B.ce&&(Z.state=ak,D.play(ng,void 0));if(a===bk){Z.di.Oh(Z.Qa/Z.Uo*100);if(0<this.Kh.length){var c,d,g,h,k;for(c=this.Kh.length-1;0<=c;c--){d=this.Kh[c];do g=Z.s,g=g.t[Math.floor(Math.random()*g.t.length)];while(null!==g.yd||!g.Vc||g.position.i===d.start.i&&g.position.j===d.start.j||g.type===$.types.dk);h=g.position.i-d.start.i;k=g.position.j-d.start.j;h=J.a.e.G.Jx+100*Math.sqrt(h*h+k*k);h=Math.min(h,J.a.e.G.nx);k=d.Be;var m=d.start,
n=g.position,r=h,v=0,z=void 0,I=void 0,t=void 0,z={};z.type=ck;v=v||0;I=n.i-m.i;t=n.j-m.j;z.start={i:m.i,j:m.j};z.end={i:n.i,j:n.j};z.time=-v;r="undefined"!==typeof r?r:Math.sqrt(I*I+t*t)*J.a.e.lc.xA;z.duration=r;k.fa.push(z);k=d.Be;m=h;n=void 0;n={};n.type=dk;m=m||0;n.time=-m;n.duration=1;k.fa.push(n);nj(g,d.py,h);this.Kh.splice(c,1)}}this.Gh&&Oj(this);Z.state===cj&&(Z.state=zj)}};
function Pj(){var a,b,c,d,g;if(Z.Fn)Z.Fn=!1;else{g=[];for(a=0;a<Z.s.t.length;a++)if(c=Z.s.t[a],c.type===$.types.Mf&&null===c.yd)for(d=[],d.push(mj(Z.s,{i:c.position.i+1,j:c.position.j})),d.push(mj(Z.s,{i:c.position.i-1,j:c.position.j})),d.push(mj(Z.s,{i:c.position.i,j:c.position.j+1})),d.push(mj(Z.s,{i:c.position.i,j:c.position.j-1})),b=0;b<d.length;b++)if(null!==d[b]&&d[b].type===$.types.sq){g.push({target:c,parent:d[b]});break}if(0<g.length){b=Math.floor(Math.random()*g.length);a=g[b].target;b=
g[b].parent;ek(Z.s,a.position);a.qa=2;a.Yb({x:1.1,y:1.1},{x:0,y:0},ic,J.a.e.oa.Ri,0);fk(a,J.a.e.oa.Ri);var h=new kj(Z.s);ej(Z.s,h,a.position);h.qa=1;g=b.position.i-a.position.i;b=b.position.j-a.position.j;h.Yb({x:0,y:0},{x:1,y:1},jc,J.a.e.oa.Ri,0);gk(h,{i:a.position.i+g,j:a.position.j+b},{i:a.position.i,j:a.position.j},10,J.a.e.oa.Ri);hk(h,function(){h.qa=0},J.a.e.oa.Ri);ma(jk,{});D.play(og,0);kk(Z.s)}}}
e.ud=function(a){this.canvas.ta=!0;this.fc&&Z.s.update(a);Z.state===Qj&&(Hb({type:Uj},J.a.e.oa.Zn,this),Z.state=lk);Z.state===ak&&(Hb({type:Wj},J.a.e.oa.Zn,this),Z.state=lk);if(Z.state===Yj&&!Z.s.rg)if(0<this.il)this.il-=a;else{var b,c,d,g;d=0;if(0===this.Kh.length){for(b=0;b<Z.s.t.length;b++)if(c=Z.s.t[b],c.type===$.types.dk&&(c.yd=mk),null!==c.yd){g=c.yd.sb(c.position,d*J.a.e.fj.Hz);for(c=0;c<g.length;c++)nk(g[c]);d++}if(0<d)Fj(this),Oj(this);else if(0<Z.rc)for(d=Math.ceil(Z.rc/J.a.e.fj.To+Math.random()*
J.a.e.fj.To),d=Math.min(d,J.a.e.fj.To),d=Math.min(d,Z.rc),Z.rc-=d,Fi("movesLeft").Fc(Z.rc.toString()),b=0;b<d;b++)Gj(this,ok,J.a.e.fj.az);else Hb({type:Tj},J.a.e.oa.Zn,this),Z.state=lk}}0<Z.ia.length&&Aj(this);pk-=a;qk-=a};
function Gj(a,b,c,d){var g={};g.py=b;g.start=c;g.Be=new rk(Ce,!0,20);g.Be.position.i=g.start.i;g.Be.position.j=g.start.j;g.Be.offset.x=J.a.e.da.width/2;g.Be.offset.y=J.a.e.da.height/2;g.Be.visible=!1;b=g.Be;d=d||0;c={};c.type=sk;c.time=-(d||0);c.duration=1;c.visible=!0;b.fa.push(c);d=Z.s;b=g.Be;-1===d.lc.indexOf(b)&&d.lc.push(b);a.Kh.push(g)}function nj(a,b,c){var d=tk(b.nf());a.yd=b;uk(a,d,!0,c||0);Z.Ij++}
function Aj(a){var b,c,d,g,h,k;b=F.wa[a.bi].x-Z.offset.x;c=F.wa[a.bi].y-Z.offset.y;Z.lf=Z.ia[Z.ia.length-1].kind;d=b%J.a.e.da.width-J.a.e.da.width/2;g=c%J.a.e.da.height-J.a.e.da.height/2;if(!(d*d+g*g>J.a.e.e.kt*J.a.e.e.kt)&&(b=Math.floor(b/J.a.e.da.width),c=Math.floor(c/J.a.e.da.height),b!==a.pp||c!==a.qp)){d=mj(Z.s,{i:b,j:c});if(null!==d){if(!d.Vc||-1!==Z.lf&&d.kind!==Z.lf&&-1!==d.kind)return;g=Math.abs(d.position.i-Z.ia[Z.ia.length-1].position.i);h=Math.abs(d.position.j-Z.ia[Z.ia.length-1].position.j);
k=Z.ia.indexOf(d);-1===k&&1>=g&&1>=h?(Z.ia.push(d),d.uf(Z.ia.length,!1),Bj(),Cj(a),Dj(a)):-1!==k&&k===Z.ia.length-2?(Z.ia.pop().Ih(),Bj(),Cj(a),Dj(a),Z.ia[Z.ia.length-1].uf(Z.ia.length,!0)):-1!==k&&k===Z.ia.length-3&&(Z.ia.pop().Ih(),Z.ia.pop().Ih(),Bj(),Cj(a),Dj(a),Z.ia[Z.ia.length-1].uf(Z.ia.length,!0))}a.pp=b;a.qp=c}}
e.tb=function(){var a=Z.s,b,c,d,g,h;for(b=0;b<a.width;b++)for(c=0;c<a.height;c++)h=a.ua[b][c].Af,null!==h&&(d=(b+.5)*J.a.e.da.width+Z.offset.x,g=(c+.5)*J.a.e.da.height+Z.offset.y,hf.A(Math.floor(h.frame),d,g));var a=Z.s,k;for(b=0;b<a.ed.length;b++)c=a.ed[b],null!==c.vb&&(c.type===$.types.Mf&&-1!==Z.lf&&Z.lf!==c.kind&&(k*=J.a.e.ja.Xr),d=c.x+c.offset.x+c.Ta.x+Z.offset.x,g=c.y+c.offset.y+c.Ta.y+Z.offset.y,c.vb.Da(c.qa,d,g,c.scale.x,c.scale.y,0,k));0<Z.ia.length&&this.pj.A(Z.offset.x+this.qc.x,Z.offset.y+
this.qc.y);k=Z.s;for(a=0;a<k.ed.length;a++)b=k.ed[a],null!==b.m&&(c=b.alpha,b.type===$.types.Mf&&-1!==Z.lf&&Z.lf!==b.kind&&-1!==b.kind&&-1===Z.ia.indexOf(b)&&(c*=J.a.e.ja.Xr),d=b.x+b.offset.x+Z.offset.x,g=b.y+b.offset.y+Z.offset.y,b.m.Da(b.qa,d,g,b.scale.x,b.scale.y,0,c));0<Z.ia.length&&this.wj.A(Z.offset.x+this.qc.x,Z.offset.y+this.qc.y);k=Z.s;for(a=0;a<k.lc.length;a++)b=k.lc[a],b.visible&&(c=b.alpha,d=b.x+b.offset.x+Z.offset.x,g=b.y+b.offset.y+Z.offset.y,b.m.Da(Math.floor(b.qa),d,g,b.scale.x,b.scale.y,
0,c))};
function Cj(a){a.pj.clear();y(a.pj);var b,c,d,g,h=[],k,m,n=[];for(k=0;k<Z.s.width;k++)for(n[k]=[],m=0;m<Z.s.height;m++)n[k][m]=0;for(b=0;b<Z.nd.length;b++)c=Z.nd[b],c.nb&&lj(Z.s,c.position)&&(n[c.position.i][c.position.j]=1);var r=J.a.e.da.width,v=J.a.e.da.height;for(k=0;k<Z.s.width;k++)for(m=0;m<Z.s.height;m++)if(0!==n[k][m]){b=k*J.a.e.da.width-a.qc.x;c=m*J.a.e.da.height-a.qc.y;qa(b,c,r,v,"rgba(220,72,0,0.5)");b=k*J.a.e.da.width-a.qc.x;c=m*J.a.e.da.height-a.qc.y;g=-1;var z=0;0!==m&&1===n[k][m-1]&&
(z+=1);0!==k&&1===n[k-1][m]&&(z+=2);0!==m&&0!==k&&1===n[k-1][m-1]&&(z+=4);switch(z){case 0:case 4:d=270;g=2;break;case 1:d=0;g=1;break;case 2:d=270;g=1;break;case 3:d=270;g=0;break;case 5:g=d=0;break;case 6:d=180,g=0}-1!==g&&h.push({x:b,y:c,tm:d,sub:g});b=k*J.a.e.da.width-a.qc.x;c=(m+1)*J.a.e.da.height-a.qc.y;g=-1;z=0;m<Z.s.height-1&&1===n[k][m+1]&&(z+=1);0!==k&&1===n[k-1][m]&&(z+=2);m<Z.s.height-1&&0!==k&&1===n[k-1][m+1]&&(z+=4);switch(z){case 0:case 4:d=0;g=2;break;case 2:d=90;g=1;break;case 6:d=
90,g=0}-1!==g&&h.push({x:b,y:c,tm:d,sub:g});b=(k+1)*J.a.e.da.width-a.qc.x;c=(m+1)*J.a.e.da.height-a.qc.y;g=-1;z=0;m<Z.s.height-1&&1===n[k][m+1]&&(z+=1);k<Z.s.width-1&&1===n[k+1][m]&&(z+=2);m<Z.s.height-1&&k<Z.s.width-1&&1===n[k+1][m+1]&&(z+=4);switch(z){case 0:case 4:d=90;g=2;break;case 1:d=180,g=1}-1!==g&&h.push({x:b,y:c,tm:d,sub:g});b=(k+1)*J.a.e.da.width-a.qc.x;c=m*J.a.e.da.height-a.qc.y;g=-1;z=0;0!==m&&1===n[k][m-1]&&(z+=1);k<Z.s.width-1&&1===n[k+1][m]&&(z+=2);0!==m&&k<Z.s.width-1&&1===n[k+1][m-
1]&&(z+=4);switch(z){case 0:case 4:d=180,g=2}-1!==g&&h.push({x:b,y:c,tm:d,sub:g})}for(b=0;b<h.length;b++)d=h[b],tf.Da(d.sub,d.x,d.y,1,1,d.tm,1);A(a.pj)}
function Dj(a){a.wj.clear();y(a.wj);var b,c,d,g,h=[];for(b=0;b<Z.ia.length;b++)c=Z.ia[b],d={},d.x=c.x-a.qc.x+J.a.e.da.width/2,d.y=c.y-a.qc.y+J.a.e.da.height/2,d.i=c.Qd,h.push(d);for(b=0;b<h.length;b++)d=h[b],ra(p,d.x,d.y,K(14),"rgba(255,255,255,0.9)"),b<h.length-1&&(g=h[b+1],sa(d.x,d.y,g.x,g.y,"rgba(255,255,255,0.9)",12));for(b=0;b<h.length;b++)d=h[b],c=d.i,ra(p,d.x,d.y,K(10),c),b<h.length-1&&(g=h[b+1],c=g.i,"rgba(0,0,0,0)"===c&&(c=d.i),sa(d.x,d.y,g.x,g.y,c,4));A(a.wj)}
e.Va=function(){var a,b,c,d;J.c.Ub(J.lg);for(a=0;a<Z.s.width;a++)for(b=0;b<Z.s.height;b++){c=a*J.a.e.da.width+Z.offset.x;d=b*J.a.e.da.height+Z.offset.y;var g={i:a,j:b},h=Z.s;(lj(h,g)?h.ua[g.i][g.j].su:1)||$e.A(0,c,d)}};
function Bj(){Z.nd=[];var a,b,c,d,g=0,h,k,m=[],n=[],r;r={i:-1,j:-1};k=J.a.e.Tb.yv;for(a=h=0;a<Z.ia.length;a++){d=Z.ia[a];null!==d.yd&&n.push(d.yd);b={position:d.position,Rb:Ij,Qa:k,J:h,nb:!1};a===Z.ia.length-1&&(b.Rb=Jj);nk(b);c=d.bp(b.J);for(b=0;b<c.length;b++)nk(c[b]);g++;0===g%J.a.e.Tb.Iw&&(k+=J.a.e.Tb.Ky);h+=Math.max(J.a.e.oa.Kx,J.a.e.oa.So-40*Math.pow(g,.5))}r.i=d.position.i;r.j=d.position.j;for(a=0;a<n.length;a++){g=n[a];for(d=!1;;){d=!1;for(b=0;b<m.length;b++)if(m[b].pow.id===g.id){d=m[b].ds=
!0;break}if(d&&null!==g.Ge())g=g.Ge(),d=!1;else break}d||m.push({pow:g,position:r,J:h,ds:!1})}for(a=0;a<m.length;a++)if(g=m[a],!g.ds)for(c=g.pow.sb(g.position,g.J),b=0;b<c.length;b++)if(nk(c[b]),d=mj(Z.s,c[b].position),null!==d&&null!==d.yd&&-1===Z.ia.indexOf(d)){n=!0;for(h=0;h<m.length;h++)if(m[h].position.i===d.position.i&&m[h].position.j===d.position.j){n=!1;break}n&&(h=d.yd,null!==h.He(g.pow)&&(h=h.He(g.pow)),m.push({pow:h,position:d.position,J:c[b].J}))}}
function nk(a){var b,c;if(a.vf)for(b=Z.nd.length-1;0<=b;b--)c=Z.nd[b],c.position.i===a.position.i&&c.position.j===a.position.j&&Z.nd.splice(b,1);Z.nd.push(a)}var cj=100,zj=101,Qj=102,ak=103,lk=104,Yj=105,Rj=200,bk=202,jk=203,Zj=205,Nj=400,Uj=401,Wj=402,Xj=403,Tj=404,Ij=300,Kj=301,Lj=302,Jj=303;
function vk(a,b,c){this.depth=c;this.Ua=0;this.p=this.visible=!0;this.x=a;this.y=b;Nb(this);xj.ac();xj.Ii("score_low",wk);xj.Ii("score_mid",xk);xj.Ii("score_high",yk);xj.Ii("level_win",zk);xj.Ii("level_lose",Ak);for(var d in mc)mc.hasOwnProperty(d)&&Bk.push(mc[d]);for(d in N)N.hasOwnProperty(d)&&Ck.push(N[d]);for(d in nc)nc.hasOwnProperty(d)&&Dk.push(nc[d]);for(d in oc)oc.hasOwnProperty(d)&&Ek.push(oc[d])}
vk.prototype.Rr=function(){var a,b,c;a=[];b=[be,ce,de,ee,fe,ge,he,ie,je,ke,le,me,ne,oe];var d="01 02 03 04 05 06 07 08 09 10 11 12 13 14".split(" ");for(c=0;c<b.length;c+=1){var g=d[c];a.push({g:b[c],text:J.o.N("TutorialText_"+g,"<TutorialText_"+g+">"),title:J.o.N("TutorialTitle_"+g,"<TutorialTitle_"+g+">")})}return a};
function dj(a,b){this.width=a;this.height=b;this.ua=[];this.Gn=[];var c,d;for(c=0;c<this.width;c++)for(this.ua[c]=[],d=this.Gn[c]=0;d<this.height;d++)this.ua[c][d]={empty:!0,su:!1,Af:null,ja:null};this.t=[];this.ed=[];this.lc=[];this.zd=[];this.be=this.op=this.rg=!1}
function ej(a,b,c){"undefined"===typeof c?c=b.position:b.setPosition(c);if(!lj(a,c))return null;if(!1===a.ua[c.i][c.j].empty)return tinglyLog(a,"field at "+c.i+", "+c.j+" is not empty. Did not insert piece."),null;a.ua[c.i][c.j].empty=!1;a.ua[c.i][c.j].ja=b;b.x=c.i*J.a.e.da.width;b.y=c.j*J.a.e.da.height;b.type!==$.types.zq&&a.t.push(b);a.ed.push(b);return b}function mj(a,b){return lj(a,b)?a.ua[b.i][b.j].ja:null}
function Mj(a,b,c,d){if(!lj(a,b))return null;var g=a.ua[b.i][b.j].ja;if(null===g)return null;var h=!1;switch(c){case Jj:case Ij:h=!0;break;case Lj:h=g.Jn;break;case Kj:h=g.Vk}return h?(ek(a,b),a.be=!0,g.Cg(c,d),null!==a.ua[b.i][b.j].Af&&g.Vc&&(a.ua[b.i][b.j].Af.p=!1,a.ua[b.i][b.j].Af.J=d+J.a.e.oa.qt,a=d+J.a.e.oa.qt,b=Math.floor(Math.random()*Ek.length),D.play(Ek[b],a)),g):null}
function ek(a,b){if(lj(a,b)){var c;!0===a.ua[b.i][b.j].empty?tinglyLog(a,"field at "+b.i+", "+b.j+" is empty. Did not remove piece."):!0!==a.ua[b.i][b.j].su&&(c=a.t.indexOf(a.ua[b.i][b.j].ja),a.t.splice(c,1),a.ua[b.i][b.j].empty=!0,a.ua[b.i][b.j].ja=null)}}function Vj(a){var b,c,d,g=0,h;for(b=0;b<a.ed.length;b++)if(h=a.ed[b],0<h.fa.length)for(c=0;c<h.fa.length;c++)d=0,d+=h.fa[c].duration,d-=h.fa[c].time,g=Math.max(d,g);return g}
dj.prototype.update=function(a){var b=0;if(this.be){for(var b=!1,c=0,d=!1,g=0,c=0;c<this.width;c++)this.Gn[c]=0;for(c=Vj(this)+J.a.e.oa.ew;this.be;){for(var h=c,k=g,m=void 0,n=void 0,m=0;m<this.width;m++)if(this.ua[m][0].empty){var n=new fj(this,0),r=Math.random();0<Z.R&&Z.pr<Z.B.target&&(r<Z.R||Z.fl)&&(Z.fl=!1,n=new hj(this));this.Gn[m]++;gk(n,{i:m,j:-1},{i:m,j:0},h);n.setPosition({i:m,j:0});n.Nd=k;ej(this,n);n.x=-999;n.y=-999}a:{for(var h=b,k=c,m=g,v=r=n=n=r=void 0,v=this.height-2;0<=v;v--)for(r=
0;r<this.width;r++)if(n=this.ua[r][v].ja,null!==n&&n.type===$.types.uq&&n.Nd!==m&&Fk(this,n,0,k)){n.Nd=m;break a}for(r=0;r<this.zd.length;r++)if(!1!==this.zd[r].p&&(n=this.zd[r].position,n=this.ua[n.i][n.j].ja,null!==n&&n.Nd!==m&&Fk(this,n,this.zd[r].direction,k,!0))){n.Nd=m;this.zd[r].p=!1;this.zd[r].disabled=!0;break a}for(v=this.height-2;0<=v;v--)for(r=0;r<this.width;r++)if(n=this.ua[r][v].ja,null!==n&&n.Nd!==m&&Fk(this,n,0,k)){n.Nd=m;break a}if(h)for(v=this.height-2;0<=v;v--)for(r=0;r<this.width;r++)if(n=
this.ua[r][v].ja,null!==n&&n.Nd!==m){if(Fk(this,n,-1,k)){n.Nd=m;break a}if(Fk(this,n,1,k)){n.Nd=m;break a}}this.be=!1}this.be?d=!1:d?b||(this.be=b=!0,c+=J.a.e.oa.Rv):(this.be=d=!0,g++,c+=J.a.e.ja.Sn)}for(b=0;b<this.t.length;b++)this.t[b].Nd=-1;for(b=0;b<this.t.length;b++)d=this.t[b],null!==d&&d.type===$.types.Mf&&0===d.kind&&Gk(d,ni(Z.rt)+1);kk(this);rj(this);for(b=0;b<this.zd.length;b++)!1===this.zd[b].p&&(this.zd[b].disabled?this.zd[b].disabled=!1:this.zd[b].p=!0)}for(b=0;b<this.ed.length;b++)this.ed[b].Ej(a);
this.rg=!1;for(b=this.ed.length-1;0<=b;b--)for(g=this.ed[b],d=g.fa.length-1;0<=d;d--){c=g.fa[d];c.ks||(this.rg=!0);c.time+=a;h=Math.min(1,c.time/c.duration);if(0<h)switch(c.type){case $.fa.fk:m=c.end.i-c.start.i;n=c.end.j-c.start.j;k=0+1*(1-Math.cos(h/1*Math.PI/2));g.x=(c.start.i+m*k)*J.a.e.da.width;g.y=(c.start.j+n*k)*J.a.e.da.height;break;case $.fa.vq:h=1;k=c.Ce;k.position.i=g.position.i;k.position.j=g.position.j;c.ov&&(k.ja=g,g.Ce=k);-1===this.lc.indexOf(k)&&this.lc.push(k);break;case $.fa.rq:h=
1;c.gw.call();break;case $.fa.wq:m=c.oe.x-c.oc.x,n=c.oe.y-c.oc.y,k=c.kb(h,0,1,1),g.scale.x=c.oc.x+m*k,g.scale.y=c.oc.y+n*k}1===h&&(g.fa.splice(d,1),c.type===$.fa.tq&&(g.Ce&&this.lc.splice(this.lc.indexOf(g.Ce),1),this.ed.splice(b,1)),c.type===$.fa.fk&&0===c.mr&&(c=g,c.Yb({x:.9,y:1.15},{x:1,y:1},ic,75,150),c.Yb({x:1.2,y:.8},{x:.9,y:1.15},ic,150,0),0<pk||(c=void 0,pk=250+50*Math.random(),c=Math.floor(Math.random()*Dk.length),D.play(Dk[c]))),0===g.fa.length&&Hk(g))}for(b=this.lc.length-1;0<=b;b--){d=
this.lc[b];d.qa+=a/1E3*d.$b;if(d.qa>=d.m.S)if(d.loop)d.qa-=d.m.S;else{g=void 0;g=this.lc.indexOf(d);-1!==g&&this.lc.splice(g,1);continue}null!==d.ja?(d.x=d.ja.x,d.y=d.ja.y):(d.x=d.position.i*J.a.e.da.width,d.y=d.position.j*J.a.e.da.height);for(g=d.fa.length-1;0<=g;g--){this.rg=!0;c=d.fa[g];c.time+=a;h=Math.min(1,c.time/c.duration);if(0<=h)switch(c.type){case ck:m=c.end.i-c.start.i;n=c.end.j-c.start.j;k=bc(h,0,1,1);d.x=(c.start.i+m*k)*J.a.e.da.width;d.y=(c.start.j+n*k)*J.a.e.da.height;break;case dk:this.lc.splice(b,
1);break;case sk:d.visible=c.visible;break;case Ik:m=c.oe.x-c.oc.x,n=c.oe.y-c.oc.y,k=c.kb(h,0,1,1),d.scale.x=c.oc.x+m*k,d.scale.y=c.oc.y+n*k}1===h&&d.fa.splice(g,1)}}for(b=0;b<this.width;b++)for(d=0;d<this.height;d++)g=this.ua[b][d].Af,null===g||g.p||(0<g.J?(g.J-=a,0>=g.J&&(Z.zm--,ma(207))):(g.frame+=a/1E3*J.a.e.lc.$y,g.frame>=hf.S&&(this.ua[b][d].Af=null)));if(this.op&&!this.rg){for(b=this.t.length-1;0<=b;b--)this.t[b].cp&&this.t[b].cp(0),Hk(this.t[b]);this.be||ma(bk,{})}this.op=this.rg};
function Fk(a,b,c,d,g){var h,k;if(!b.ve)return!1;h=b.position.i+c;k=b.position.j+1;if(!lj(a,{i:h,j:k}))return!1;if(a.ua[h][k].empty){if(0!==c&&!g)for(c=k-1;0<=c;c--)if(!a.ua[h][c].empty){if(null!==a.ua[h][c].ja&&a.ua[h][c].ja.ve)return;break}gk(b,b.position,{i:h,j:k},d);a.ua[b.position.i][b.position.j].empty=!0;a.ua[b.position.i][b.position.j].ja=null;b.setPosition({i:h,j:k});a.ua[h][k].empty=!1;a.ua[h][k].ja=b;return a.be=!0}}
function kk(a){function b(b){var d,g,h,k,m=[],n=[],r=-1;m.push(b);for(r=b.kind;0<m.length;)for(k=m.pop(),n.push(k),c[k.position.i][k.position.j]=!0,b=-1;1>=b;b++)for(d=-1;1>=d;d++)g=k.position.i+b,h=k.position.j+d,!1!==lj(a,{i:g,j:h})&&!0!==c[g][h]&&(g=a.ua[g][h].ja,null!==g&&g.Vc&&-1===m.indexOf(g)&&g.kind===r&&m.push(g));return n}var c=[],d,g;for(d=0;d<a.width;d++)for(c[d]=[],g=0;g<a.height;g++)c[d][g]=!1;var h,k=[],m,n,r,v;for(d=0;d<a.t.length;d++)if(n=a.t[d],n.type===$.types.Mf&&0!==n.kind&&!1===
c[n.position.i][n.position.j]){h=b(n);if(h.length>=J.a.e.e.H)return;0<h.length&&k.push(h)}for(k.sort(function(a,b){return a.length-b.length});0<k.length;){h=k.pop();for(m=0;h.length<J.a.e.e.H&&m<h.length;)for(n=h[m],m++,d=-1;1>=d;d++)for(g=-1;1>=g;g++)r=n.position.i+d,v=n.position.j+g,r=mj(a,{i:r,j:v}),null!==r&&-1===h.indexOf(r)&&null===r.yd&&r.type===$.types.Mf&&(r.kind!==n.kind&&Gk(r,n.kind),h.push(r),h.length>=J.a.e.e.H&&(g=d=2));if(h.length>=J.a.e.e.H)break}}
function rj(a){a.ed.sort(function(b,c){return(b.position.j-c.position.j)*(a.width+2)+(c.position.i-b.position.i)})}function lj(a,b){return 0>b.i||0>b.j||b.i>=a.width||b.j>=a.height?!1:!0}
function $(a){this.kind=0;this.type=-1;this.Vk=this.Vc=this.ve=this.Vc=!1;this.Jn=!0;this.Ce=this.yd=null;this.s=a;this.Ad=100;this.position={i:0,j:0};this.fa=[];this.Nd=-1;this.y=this.x=0;this.m=null;this.qa=0;this.scale={x:1,y:1};this.offset={x:0,y:0};this.alpha=1;this.vb=lf;this.Ta={x:0,y:0};this.Qd="white";this.vj={x:0,y:0}}$.types={Mf:4E3,uu:4001,uq:4002,wu:4003,sq:4004,dk:4005,zq:4006};$.fa={fk:3E3,vq:3001,tq:3002,rq:3003,wq:3004};e=$.prototype;
e.setPosition=function(a){this.position.i=a.i;this.position.j=a.j};e.Ej=function(){};e.cp=function(){};e.uf=function(){};e.Ih=function(){};e.Cg=function(a,b){fk(this,b)};e.bp=function(){return[]};
function gk(a,b,c,d,g){var h,k,m,n;h={};h.type=$.fa.fk;d=d||0;g=g||J.a.e.ja.Sn;k=c.i-b.i;m=c.j-b.j;h.mr=k;h.Xv=m;if(0<a.fa.length&&(n=a.fa[a.fa.length-1],n.type===$.fa.fk&&n.mr===k&&n.Xv===m&&d<=n.duration-n.time)){n.end.i=c.i;n.end.j=c.j;n.duration+=J.a.e.ja.Sn;return}h.start={i:b.i,j:b.j};h.end={i:c.i,j:c.j};h.time=-d;h.duration=g;a.fa.push(h)}function fk(a,b){var c={};c.type=$.fa.tq;c.duration=1;c.time=-(b||0);a.fa.push(c)}
function uk(a,b,c,d){var g,h={};b.offset.x=a.Ta.x+a.offset.x;b.offset.y=a.Ta.y+a.offset.y;h.type=$.fa.vq;h.duration=g||1;h.time=-(d||0);h.Ce=b;h.ov=c;a.fa.push(h)}function hk(a,b,c){var d={};d.type=$.fa.rq;d.duration=1;d.gw=b;d.time=-(c||0);a.fa.push(d)}e.Yb=function(a,b,c,d,g){var h={};h.type=$.fa.wq;h.duration=d;h.oc=a;h.oe=b;h.kb=c;h.time=-(g||0);h.ks=!0;this.fa.push(h)};function Hk(a){a.x=a.position.i*J.a.e.da.width;a.y=a.position.j*J.a.e.da.width}
function Jk(a,b){a.m=b.m;a.offset.x=b.offset.x;a.offset.y=b.offset.y;a.vb=b.vb;a.Ta.x=b.Ta.x;a.Ta.y=b.Ta.y;void 0!==b.Qd&&(a.Qd=b.Qd);void 0!==b.vj&&(a.vj.x=b.vj.x,a.vj.y=b.vj.y)}
var xj={Zg:{},ac:function(){xj.Zu()},Ii:function(a,b){if(xj.Zg.hasOwnProperty(a))tinglyLog(xj,"Floater kind with name "+a+" already exists");else{var c=b.font.ea();c.setFillColor(b.fillColor);C(c,b.size);b.stroke&&(Da(c,!0),Ga(c,!0),c.setStrokeColor(b.strokeColor),Fa(c,b.pa),Ha(c,"round"));xj.Zg[a]=W.Fv(W.Im);xj.Zg[a].font=c;xj.Zg[a].Md=b.kb}},Zu:function(){W.Mw(J.mg,-1E6,["game","floaters"]);W.Qy(!0)},clear:function(){W.it()},Am:function(a,b,c,d,g,h,k,m){var n=W.Im;xj.Zg.hasOwnProperty(k)&&(n=xj.Zg[k]);
W.dv(n,a,b,c,b+d,c+g,h||1E3,m||0)}},Bk=[],Ck=[],Dk=[],Ek=[],Kk=-1,Ej=0,pk=0,qk=0;function Lk(a){var b=-1;a=a||0;if(1===Bk.length)b=Bk[0];else{do b=Math.floor(Math.random()*Bk.length);while(b===Kk);Kk=b;b=Bk[b]}D.play(b,a)}function Mk(a){a?a=Math.min(a,Ck.length-1):(a=Math.min(Ej,Ck.length-1),Ej++);D.play(Ck[a])}function Nk(){var a=dg;100!==qk&&(0>qk&&(a=cg),qk=100,D.play(a))}function yj(){D.stop("battleMusic",400)}
var pj={id:0,nf:function(){return Ok},sb:function(a,b){var c=[],d,g;for(g=0;g<Z.s.height;g++)d={},d.position={i:a.i,j:g},d.Rb=Lj,d.Qa=J.a.e.Tb.oh,d.J=b+Math.abs(g-a.j)*J.a.e.oa.$c,d.nb=!0,d.direction={i:0,j:1},g===a.j&&(d.vf=!0,d.Qa=J.a.e.Tb.bt),c.push(d);return c},Ge:function(){return ok},He:function(a){return 0===a.id||1===a.id||2===a.id?ok:null}},oj={id:0,nf:function(){return Pk},sb:function(a,b){var c=[],d,g;for(g=0;g<Z.s.width;g++)d={},d.position={i:g,j:a.j},d.Rb=Lj,d.Qa=J.a.e.Tb.oh,d.J=b+Math.abs(g-
a.i)*J.a.e.oa.$c,d.nb=!0,d.direction={i:1,j:0},g===a.i&&(d.vf=!0,d.Qa=J.a.e.Tb.bt),c.push(d);return c},Ge:function(){return ok},He:function(a){return 0===a.id||1===a.id||2===a.id?ok:null}},ok={id:1,nf:function(){return Qk},sb:function(a,b,c){var d=[],d=oj.sb(a,b),d=d.concat(pj.sb(a,b));c||(c={},c.position={i:a.i,j:a.j},c.Rb=Lj,c.Qa=J.a.e.Tb.$s,c.J=b,c.nb=!0,c.vf=!0,d.push(c));return d},Ge:function(){return Rk},He:function(){return null}},Rk={id:2,nf:function(){return Qk},sb:function(a,b){var c,d,
g,h=[];for(c=-1;1>=c;c++)d=a.i+c,g=a.j+c,h=h.concat(ok.sb({i:d,j:g},b+Math.sqrt(2*Math.abs(c))*J.a.e.oa.$c,!0));c={};c.position={i:a.i,j:a.j};c.Rb=Lj;c.Qa=J.a.e.Tb.$s;c.J=b;c.nb=!0;c.vf=!0;h.push(c);return h},Ge:function(){return Sk},He:function(){return null}},qj={id:3,nf:function(){return Tk},sb:function(a,b,c){var d=[],g,h,k,m;c=c||!1;for(h=-1;1>=h;h++)for(k=-1;1>=k;k++)m=Math.sqrt(k*k+h*h),g={},g.position={i:a.i+k,j:a.j+h},g.Rb=Lj,g.Qa=J.a.e.Tb.oh,g.J=b+m*J.a.e.oa.$c,g.nb=!0,0!==k||0!==h||c||
(g.Qa=J.a.e.Tb.uy,g.vf=!0),d.push(g);return d},Ge:function(){return mk},He:function(){return null}},mk={id:4,nf:function(){return Tk},sb:function(a,b,c){var d=[];c=c||!1;d=d.concat(qj.sb({i:a.i,j:a.j},b,!0));d=d.concat(qj.sb({i:a.i+1,j:a.j},b+Math.sqrt(2)*J.a.e.oa.$c,!0));d=d.concat(qj.sb({i:a.i-1,j:a.j},b+Math.sqrt(2)*J.a.e.oa.$c,!0));d=d.concat(qj.sb({i:a.i,j:a.j+1},b+Math.sqrt(2)*J.a.e.oa.$c,!0));d=d.concat(qj.sb({i:a.i,j:a.j-1},b+Math.sqrt(2)*J.a.e.oa.$c,!0));c||(c={},c.position={i:a.i,j:a.j},
c.Rb=Lj,c.Qa=J.a.e.Tb.ty,c.J=b,c.nb=!0,c.vf=!0,d.push(c));return d},Ge:function(){return Uk},He:function(){return null}},Uk={id:5,nf:function(){return Tk},sb:function(a,b){var c=[],d,c=c.concat(mk.sb({i:a.i,j:a.j},b,!0)),c=c.concat(mk.sb({i:a.i+1,j:a.j},b+Math.sqrt(2)*J.a.e.oa.$c,!0)),c=c.concat(mk.sb({i:a.i-1,j:a.j},b+Math.sqrt(2)*J.a.e.oa.$c,!0)),c=c.concat(mk.sb({i:a.i,j:a.j+1},b+Math.sqrt(2)*J.a.e.oa.$c,!0)),c=c.concat(mk.sb({i:a.i,j:a.j-1},b+Math.sqrt(2)*J.a.e.oa.$c,!0));d={};d.position={i:a.i,
j:a.j};d.Rb=Lj;d.Qa=J.a.e.Tb.qy;d.J=b;d.nb=!0;d.vf=!0;c.push(d);return c},Ge:function(){return Sk},He:function(){return null}},Sk={id:6,nf:function(){return Tk},sb:function(a,b){var c=[],d,g,h,k;for(g=0;g<Z.s.height;g++)for(h=0;h<=Z.s.width;h++)d=a.i-h,k=a.j-g,k=Math.sqrt(d*d+k*k),d={},d.position={i:h,j:g},d.Rb=Lj,d.Qa=J.a.e.Tb.oh,d.J=b+k*J.a.e.oa.$c,d.nb=!0,h===a.i&&g===a.j&&(d.Qa=J.a.e.Tb.sy,d.vf=!0),c.push(d);return c},Ge:function(){return null},He:function(){return null}};
function sj(a){this.current=0;this.target=a;this.ef=Qe;this.Yj=Ve;this.ce=!1;this.tj=J.o.N("LevelGoalScore","<LevelGoalScore><TARGET>").replace("<TARGET>",a.toString())}sj.prototype.handleEvent=function(a){a===Zj&&(this.current=Z.Qa,Fi("goalText").Fc(this.current+"/"+this.target),this.current>=this.target&&(this.ce=!0))};function tj(a){this.current=0;this.target=a;this.ef=Re;this.Yj=We;this.ce=!1;this.tj=J.o.N("LevelGoalDiamond","<LevelGoalDiamond><TARGET>").replace("<TARGET>",a.toString())}
tj.prototype.handleEvent=function(a){201===a&&(this.current++,Fi("goalText").Fc(this.current+"/"+this.target),this.current>=this.target&&(this.ce=!0))};function uj(){this.current=0;this.target=Z.zm;this.ef=Se;this.Yj=Xe;this.ce=!1;this.tj=J.o.N("LevelGoalSludge","<LevelGoalSludge><TARGET>").replace("<TARGET>",this.target.toString())}uj.prototype.handleEvent=function(a){207===a&&(this.current=this.target-Z.zm,Fi("goalText").Fc(this.current+"/"+this.target),this.current>=this.target&&(this.ce=!0))};
function vj(){this.current=0;this.target=Z.tl;this.ef=Te;this.Yj=Ye;this.ce=!1;this.tj=J.o.N("LevelGoalGuard","<LevelGoalGuard><TARGET>").replace("<TARGET>",this.target.toString())}vj.prototype.handleEvent=function(a){206===a&&(this.current=this.target-Z.tl,Fi("goalText").Fc(this.current+"/"+this.target),this.current>=this.target&&(this.ce=!0))};
function wj(){this.current=0;this.target=Z.Mk;this.ef=Pe;this.Yj=Ue;this.ce=!1;this.tj=J.o.N("LevelGoalCloner","<LevelGoalCloner><TARGET>").replace("<TARGET>",this.target.toString())}wj.prototype.handleEvent=function(a){204===a&&(this.current++,Fi("goalText").Fc(this.current+"/"+this.target));if(a===jk||204===a)this.target=Z.Mk,Fi("goalText").Fc(this.current+"/"+this.target),this.current===this.target&&(this.ce=!0)};
function rk(a,b,c){this.position={i:-1,j:-1};this.loop=b||!1;this.ja=null;this.y=this.x=this.J=0;this.m=a;this.qa=0;this.$b=c||20;this.visible=!0;this.offset={x:0,y:0};this.scale={x:1,y:1};this.fa=[];this.duration=1E3/this.$b*this.m.S}var ck=4E3,dk=4001,sk=4002,Ik=4003;rk.prototype.Yb=function(a,b,c,d,g){var h={};h.type=Ik;h.duration=d;h.oc=a;h.oe=b;h.kb=c;h.time=-(g||0);h.ks=!0;this.fa.push(h)};function tk(a){return null===a?null:new rk(a.m,a.loop,a.$b)}
var Vk={background:{g:Ud,x:K(64),y:K(30),Jb:{y:-K(500),alpha:0,duration:400,J:200,pd:jc},Ac:{alpha:0,duration:200,J:750}},nv:{We:"header",x:K(132),y:K(182),jb:K(440),cb:K(100),font:T,nc:{fillColor:"#403934",fontSize:K(60),align:"center",l:"top"},Jb:{x:K(730),duration:250,J:700,alpha:0,pd:jc},Ac:{x:K(730),duration:250,J:250,alpha:0}},mv:{Bv:!0,We:"assignment",x:K(152),y:K(256),jb:K(400),cb:K(160),font:T,nc:{fillColor:"#403934",fontSize:K(36),Bc:"lower",align:"center",l:"top"},aA:!0,Jb:{duration:250,
J:1E3,alpha:0},Ac:{alpha:0,duration:250}}};function bj(){pi.apply(this,arguments);Nb(this);Pb(this,["game","LevelStartDialog"]);this.depth=-1E3;this.visible=this.p=!1;this.Ab=null;J.c.Vb(this,J.mg);this.elements={};Wk(this,Vk);this.ef={};this.ef={g:{g:Z.B.ef,x:K(352),y:K(90),Jb:{duration:200,J:500,scale:0,pd:jc},Ac:{scale:Ue.width/Pe.width,x:K(60)-J.ng,y:K(370)-J.og,J:1E3,duration:500,pd:fc}}};D.play(rg,void 0);Wk(this,this.ef);this.w=0;this.duration=7E3;this.fc=!0}
function Wk(a,b){for(var c in b){var d=b[c],g={},h;for(h in d)g[h]=d[h];g.x-=J.mf;g.y-=J.Fe;g.g?a.elements[c]=new ri(a,g):g.Bv?a.elements[c]=new Xk(a,J.o.N(g.We,"<"+g.We+">"),g):g.We?a.elements[c]=new si(a,J.o.N(g.We,"<"+g.We+">"),g):g.text&&(a.elements[c]=new si(a,g.text,g))}}Lg(pi,bj);e=bj.prototype;e.show=function(a){this.Nm=!1;this.visible=this.p=!0;this.Zr=!1;this.Ab=a;this.elements.nv.Fc(J.o.N("LevelStartHeader","<LevelStartHeader>"));this.elements.mv.Fc(Z.B.tj);this.Qp()};
e.zo=function(){if(!this.Zr){this.Zr=!0;var a=this;this.Rp(function(){G(F,a);a.Ab&&a.Ab()})}};e.Qb=function(){return this.Nm=!0};e.pc=function(){this.Nm&&this.zo();return!0};e.Oa=function(a){pi.prototype.Oa.apply(this,arguments);this.fc&&(this.w+=a,this.w>=this.duration&&(this.zo(),this.fc=!1))};e.ud=function(){};e.tb=function(){p.context.save();p.context.translate(J.ng,J.og);pi.prototype.tb.apply(this,arguments);p.context.restore()};
function fj(a,b){$.apply(this,[a]);this.type=$.types.Mf;this.kind=0;b&&0!==b&&Gk(this,Z.Bf[b-1]+1);this.Vc=this.ve=!0;this.selected=!1;this.zf=0;this.Jd=5E4*Math.random();this.offset.x=36;this.offset.y=44;this.Ta.x=-2;this.Ta.y=-2}Lg($,fj);function Gk(a,b){var c=Yk[b-1];a.kind=b;Jk(a,c)}e=fj.prototype;
e.uf=function(a,b){if(!this.selected&&!b){this.selected=!0;this.qa=1;null!==this.Ce&&(this.Ce.visible=!1);this.zf=0;if(a>=Z.mm){var c=this;this.qa=4;hk(this,function(){c.qa=1},J.a.e.ja.Hg);this.Yb({x:1+J.a.e.ja.ke,y:1+J.a.e.ja.ke},{x:1,y:1},ic,J.a.e.ja.Hg,0)}else this.Yb({x:1+J.a.e.ja.ke/2,y:1+J.a.e.ja.ke/2},{x:1,y:1},ic,J.a.e.ja.Hg/2,0);1<a&&Z.ia[a-2].uf(-1,!0);Mk(a-1)}this.selected&&b&&(this.Yb({x:1-+J.a.e.ja.ke/2,y:1-J.a.e.ja.ke/2},{x:1,y:1},ic,J.a.e.ja.Hg/2,0),a>=Z.mm&&(c=this,this.qa=4,hk(this,
function(){c.qa=1},J.a.e.ja.Hg)),Mk(a-1))};e.Ih=function(){this.selected&&(this.selected=!1,this.qa=0,null!==this.Ce&&(this.Ce.visible=!0),this.scale.y=1,this.Yb({x:1.1,y:1.1},{x:1,y:1},ic,100,0));0<Ej&&Ej--;0<Ej&&Ej--};e.Ej=function(a){this.selected?(this.zf+=a,this.scale.y=Math.max(1,.04*Math.sin(this.zf/80)+1.02)):(this.Jd-=a,0>this.Jd&&(0===this.qa?(this.qa=3,this.Jd=150+50*Math.random()):(this.qa=0,this.Jd=2E4+5E4*Math.random())))};
e.Cg=function(a,b){var c=null,d=0;this.scale.y=1;switch(a){case Ij:c=tk(fj.Pr());d=c.duration;break;case Jj:c=tk(Zk);d=c.duration;break;case Lj:c=tk($k),d=c.duration}null!==c&&uk(this,c,!1,b);var g=this;a===Lj?(hk(this,function(){g.qa=4;Nk()},b),d/=8):(hk(this,function(){g.qa=2},b),a===Jj?D.play(eg,b):Lk(b));this.Yb({x:1,y:1},{x:.5,y:.5},ic,d/2,b+d/2);fk(this,b+d);uk(this,tk(al),!1,b+d);this.Ad=b+d;null!==this.yd&&Z.Ij--};
e.bp=function(a){var b,c=[],d,g;for(d=-1;1>=d;d++)for(g=-1;1>=g;g++)Math.abs(d)!==Math.abs(g)&&(b={},b.position={i:this.position.i+d,j:this.position.j+g},b.Rb=Kj,b.Qa=J.a.e.Tb.oh,b.J=a+J.a.e.oa.So,c.push(b));return c};fj.Aq=-1;fj.Pr=function(){var a;if(1===bl.length)return bl[0];do a=Math.floor(Math.random()*bl.length);while(a===fj.Aq);fj.Aq=a;return bl[a]};function ij(a){$.apply(this,[a]);this.type=$.types.uu;this.Vc=this.ve=!1;Jk(this,cl[0]);this.Vk=!0}Lg($,ij);
ij.prototype.Cg=function(a,b){var c=tk(dl);fk(this,b);uk(this,c,!1,b);a===Lj&&(uk(this,tk($k),!1,b),hk(this,function(){Nk()},b));this.Ad=b+c.duration;D.play(lg,b)};function hj(a){$.apply(this,[a]);this.type=$.types.uq;this.ve=!0;this.Vc=!1;Jk(this,el);this.Jn=!1;this.xk=1E4*Math.random();Z.fl=!1;Z.pr++}Lg($,hj);hj.prototype.Ej=function(a){this.xk-=a;0>this.xk&&(this.qa+=a/1E3*16,this.qa>=this.m.S&&(this.qa=0,this.xk=5E3+5E3*Math.random()))};
hj.prototype.cp=function(){this.position.j===this.s.height-1&&(Mj(this.s,this.position,Ij,J.a.e.oa.Sv),ma(201,{}),Z.d.on(J.a.e.Tb.Uv,this.position,this.Ad))};hj.prototype.Cg=function(a,b){var c=J.a.e.oa.Tv;this.Yb({x:1.1,y:1.1},{x:.5,y:.5},ic,c,0);fk(this,c);this.Ad=c;D.play(fg,b);Z.fl=!0};function gj(a){$.apply(this,[a]);this.type=$.types.zq;this.Vc=this.ve=!1;a=Math.floor(Math.random()*fl.length);Jk(this,fl[a]);this.Jn=!1}Lg($,gj);
function kj(a){fj.apply(this,[a]);this.type=$.types.sq;this.Vc=this.ve=!1;Jk(this,gl);this.Vk=!0;Z.Mk++}Lg(fj,kj);kj.prototype.Cg=function(a,b){Z.Fn=!0;var c=0,d=this;a===Lj?(c=tk($k),uk(this,c,!1,b),c=c.duration/3,hk(this,function(){d.qa=4;Nk()},b)):(hk(this,function(){d.qa=2},b),c=J.a.e.oa.Gv);fk(this,b+c);D.play(gg,b+c);hk(this,function(){ma(204)},b);uk(this,tk(hl),!1,b+c);this.Ad=b+c};
function Hj(a,b){$.apply(this,[a]);this.type=$.types.dk;this.kind=-1;this.Vc=this.ve=!0;Jk(this,il);this.scale.x=0;this.scale.y=0;this.Yb({x:0,y:0},{x:1,y:1},jc,J.a.e.oa.Kv,b+J.a.e.oa.Jv);this.selected=!1;Z.Ij++}Lg($,Hj);e=Hj.prototype;
e.uf=function(a,b){this.selected||b||(this.selected=!0,this.m=He,this.zf=0,this.Yb({x:1+J.a.e.ja.ke,y:1+J.a.e.ja.ke},{x:1,y:1},ic,J.a.e.ja.Hg/2,0),1<a&&Z.ia[a-2].uf(-1,!0),Mk(a));this.selected&&b&&(this.Yb({x:1-+J.a.e.ja.ke/2,y:1-J.a.e.ja.ke/2},{x:1,y:1},ic,J.a.e.ja.Hg/2,0),Mk(a))};e.Ih=function(){this.selected&&(this.selected=!1,this.m=Ge,this.scale.y=this.scale.x=1,this.Yb({x:1.1,y:1.1},{x:1,y:1},ic,100,0));0<Ej&&Ej--;0<Ej&&Ej--};
e.Ej=function(a){this.qa=(this.qa+a/1E3*16)%this.m.S;this.selected&&(this.zf+=a,this.scale.x=Math.max(1,.04*Math.sin(this.zf/80)+1.02),this.scale.y=this.scale.x)};
e.Cg=function(a,b){var c=null,d=0;this.scale.y=1;switch(a){case Ij:c=tk(fj.Pr());d=c.duration;break;case Jj:c=tk(Zk);d=c.duration;break;case Lj:c=tk($k),d=c.duration}null!==c&&uk(this,c,!1,b);var g=this;a===Lj?(hk(this,function(){g.qa=4;Nk()},b),d/=8):(hk(this,function(){g.qa=2},b),a===Jj?D.play(eg,b):Lk(b));this.Yb({x:1,y:1},{x:.5,y:.5},ic,d/2,b+d/2);fk(this,b+d);uk(this,tk(al),!1,b+d);this.Ad=b+d;Z.Ij--};
e.bp=function(a){var b,c=[],d,g;for(d=-1;1>=d;d++)for(g=-1;1>=g;g++)Math.abs(d)!==Math.abs(g)&&(b={},b.position={i:this.position.i+d,j:this.position.j+g},b.Rb=Kj,b.Qa=J.a.e.Tb.oh,b.J=a+J.a.e.oa.So,c.push(b));return c};function jj(a){$.apply(this,[a]);this.type=$.types.wu;this.ve=!0;this.Vc=!1;Jk(this,jl[0]);Z.tl++;this.Vk=!0;this.Jd=25E3*Math.random()}Lg($,jj);
jj.prototype.Cg=function(a,b){var c=new kl(this.position.i,this.position.j,b);fk(this,b);a===Lj&&(uk(this,tk($k),!1,b),hk(this,function(){Nk()},b));var d=tk(al);uk(this,d,!1,b);uk(this,tk(ll),!1,b);hk(this,function(){Z.tl--;ma(206)},b);hk(this,function(){},b+c.ct);this.Ad=b+d.duration;D.play(kg,b)};jj.prototype.Ej=function(a){this.Jd-=a;0>this.Jd&&(0===this.qa?(this.qa=Math.round(Math.random())+1,this.Jd=2500):(this.qa=0,this.Jd=1E4+15E3*Math.random()))};function Xk(a,b,c){si.call(this,a,b,c)}
Lg(si,Xk);Ei.GameUIBreakText=Xk;
Xk.prototype.je=function(){this.Ka.clear();y(this.Ka);var a=this.font.ya(this.text),a=Math.min(a,this.hp),b=Ra(this.font,this.text,a,this.by,!0),c=this.font.ea();b<this.font.fontSize&&C(c,b);c.A(this.text,this.Fd,this.Gd,a);this.d.Yk&&(qa(0,0,this.Ka.width,this.Ka.height,"black",!0),qa(this.Zl-this.x,this.$l-this.y,this.Ka.width-2*(this.Zl-this.x),this.Ka.height-2*(this.$l-this.y),"red",!0),sa(this.Fd-5,this.Gd,this.Fd+5,this.Gd,"green",1),sa(this.Fd,this.Gd-5,this.Fd,this.Gd+5,"green",1));this.d.ec=
!0;A(this.Ka)};function kl(a,b,c){this.depth=-400;this.Ua=0;this.p=this.visible=!0;this.x=Z.offset.x+J.a.e.da.width*(a+.5);this.y=Z.offset.y+J.a.e.da.height*(b+.5);this.scale={x:0,y:0};this.alpha=1;J.c.Vb(this,J.mg);Nb(this);Pb(this,["game","item"]);this.Jj=-c;this.In=7500;this.gf=0;this.ct=600+300*Math.random();this.js=!1;this.direction=a>=Z.s.width/2?1:-1;this.Av=this.y;this.m=rf;this.Ra=0}kl.prototype.Tc=function(){};
kl.prototype.ud=function(a){if(this.js){this.gf=(this.gf+a/200)%(2*Math.PI);var b=Math.abs(Math.sin(this.gf))-.1;0<=b?(this.x+=this.direction*a*K(.15+.15*b),this.y=this.Av-K(100)*b,this.In-=a,0>this.In&&(this.alpha-=a/1E3),b=Math.cos(this.gf),this.gf>Math.PI&&(b*=-1),this.Ra+=a/50*(6*b-this.Ra),this.gf%Math.PI<Math.PI/4?(this.scale.x=ic(this.gf%Math.PI,1.15,-.1,Math.PI/4),this.scale.y=ic(this.gf%Math.PI,.8,.1,Math.PI/4)):(this.scale.x=1,this.scale.y=1)):(this.scale.x=1.08,this.scale.y=.9,this.Ra=
0)}else this.Jj+=a,0<this.Jj&&(this.scale.x=jc(Math.min(this.Jj,300),0,1,300),this.scale.y=this.scale.x),this.Jj>this.ct&&(this.js=!0,this.m=sf)};kl.prototype.tb=function(){this.m.Da(0,this.x,this.y,this.scale.x*this.direction,this.scale.y,this.Ra,this.alpha)};function Yi(a,b,c){this.depth=c;this.Ua=0;this.p=this.visible=!0;this.x=1050;this.y=386;this.scale={x:1,y:1};this.Ne=-1;J.c.Vb(this,J.mg);Nb(this);Pb(this,["game","item"]);this.dp=!1}
Yi.prototype.Qb=function(a,b,c){-1===this.Ne&&(a=Math.abs(b-this.x),c=Math.abs(c-this.y),2500>a*a+c*c&&(this.dp=!this.dp,this.Ne=0))};Yi.prototype.ud=function(a){-1!==this.Ne&&(this.Ne+=a,this.scale.x=ic(this.Ne,1.12,-.12,200),this.scale.y=ic(this.Ne,1.12,-.12,200),200<=this.Ne&&(this.Ne=-1,this.scale.x=1,this.scale.y=1))};Yi.prototype.tb=function(){uf.Da(this.dp?1:0,this.x,this.y,this.scale.x,this.scale.y,0,1)};J.version=J.version||{};J.version.theme="1.1.1";
var wk={font:Tf,fillColor:"#fcf59e",size:K(28),stroke:!0,strokeColor:"#4c2b11",pa:6},xk={font:Tf,fillColor:"#fcf59e",size:K(32),stroke:!0,strokeColor:"#4c2b11",pa:6},yk={font:Tf,fillColor:"#fcf59e",size:K(36),stroke:!0,strokeColor:"#4c2b11",pa:6},zk={font:Tf,fillColor:"#ff4f00",size:K(60),stroke:!0,strokeColor:"#ffdb79",pa:6},Ak={font:Tf,fillColor:"#c3440b",size:K(60),stroke:!0,strokeColor:"#ffdb79",pa:6},Yk=[{m:Ie,offset:{x:K(34),y:K(42)},vb:lf,Ta:{x:K(2),y:K(0)},Qd:"#FFC905"},{m:Je,offset:{x:K(38),
y:K(46)},vb:lf,Ta:{x:K(-4),y:K(-4)},Qd:"#02C2E8"},{m:Ke,offset:{x:K(38),y:K(46)},vb:lf,Ta:{x:K(-2),y:K(-4)},Qd:"#85AF20"},{m:Le,offset:{x:K(34),y:K(48)},vb:mf,Ta:{x:K(1),y:K(-6)},Qd:"#FC5E17"},{m:Me,offset:{x:K(28),y:K(46)},vb:mf,Ta:{x:K(5),y:K(-4)},Qd:"#FF81DD"},{m:Ne,offset:{x:K(36),y:K(46)},vb:mf,Ta:{x:K(-3),y:K(-4)},Qd:"#047BFC"}],cl=[{m:kf,offset:{x:K(34),y:K(22)},vb:mf,Ta:{x:K(0),y:K(22)}}],el={m:jf,offset:{x:K(34),y:K(16)},vb:nf,Ta:{x:K(2),y:K(28)}},jl=[{m:of,offset:{x:K(36),y:K(45)},vb:null,
Ta:{x:K(0),y:K(0)}}],gl={m:Oe,offset:{x:K(36),y:K(46)},vb:nf,Ta:{x:K(0),y:K(0)}},il={m:Ge,offset:{x:K(35),y:K(35)},vb:lf,Ta:{x:K(-2),y:K(-4)},Qd:"rgba(0,0,0,0)"},fl=[{m:af,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}},{m:bf,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}},{m:cf,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}},{m:df,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}},{m:ef,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}},{m:ff,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),
y:K(0)}},{m:gf,offset:{x:K(35),y:K(26)},vb:null,Ta:{x:K(0),y:K(0)}}],bl=[{m:re,$b:12,loop:!1},{m:se,$b:12,loop:!1},{m:te,$b:12,loop:!1},{m:ue,$b:12,loop:!1}],Zk={m:ve,$b:16,loop:!1},al={m:we,$b:12,loop:!1},$k={m:Ee,$b:12,loop:!1},Ok={m:Be,$b:16,loop:!0},Pk={m:ze,$b:16,loop:!0},Qk={m:Ae,$b:16,loop:!0},Tk={m:ye,$b:12,loop:!0},dl={m:pf,$b:12,loop:!1},ll={m:qf,$b:8,loop:!1},hl={m:Fe,$b:16,loop:!1};J.version=J.version||{};J.version.configuration_poki_api="1.0.0";J.q=J.q||{};
J.q.Vi=function(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};
J.q.tr=function(a,b,c,d){var g={};J.q.Vi(a.rk,g);g.fontSize=K(18);d=J.c.k(a.dh,d.height,K(22));d=a.bh-d;var h=J.o.N("optionsAbout_header","<OPTIONSABOUT_HEADER>"),k=b(h,g,a.tk,a.dh,a.sk,K(22)),k=c(yf,a.Di,k-28),k=k+K(6),g={};J.q.Vi(a.Fi,g);g.fontSize=K(18);k=b("CoolGames\nwww.coolgames.com",g,a.eh,k,a.Uf,K(44));B(Q.ea(),g);k+=K(58)+Math.min(0,d-K(368));g={};J.q.Vi(a.rk,g);g.fontSize=K(20);g.fillColor="#1A2B36";h=J.o.N("optionsAbout_header_publisher","<optionsAbout_header_publisher>");k=b(h,g,a.tk,
k,a.sk,K(22));k+=K(6);k=c(zf,a.Di,k);k+=K(12);g={};J.q.Vi(a.Fi,g);g.fontSize=K(18);g.fillColor="#1A2B36";k=b("Poki.com/company",g,a.eh,k,a.Uf,K(22));k+=K(16);g={};J.q.Vi(a.Fi,g);b("\u00a9 2020",g,a.eh,k,a.Uf,K(44));return[]};J.q.jj=function(){return[]};J.q.md=function(){J.d.md()};
J.q.wl=function(){function a(){__flagPokiInitialized?(function(){/* function a(c){return b[c-0]}var b="top indexOf aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw== hostname length location LnBva2ktZ2RuLmNvbQ== href".split(" ");(function(a,b){for(var c=++b;--c;)a.push(a.shift())})(b,430);(function(){for(var b=["bG9jYWxob3N0","LnBva2kuY29t",a("0x0")],d=!1,k=window[a("0x7")][a("0x5")],m=0;m<b[a("0x6")];m++){var n=atob(b[m]);if(-1!==k[a("0x3")](n,k.length-n.length)){d=!0;break}}d||(b=atob(a("0x4")),window.location[a("0x1")]=
b,window[a("0x2")][a("0x7")]!==window[a("0x7")]&&(window[a("0x2")][a("0x7")]=window[a("0x7")]))})()*/}(),J.d.md(),PokiSDK.gameLoadingStart()):setTimeout(a,500)}a();var b=J.a.F.options.buttons;b.startScreen.splice(b.startScreen.indexOf("about"),1);b.levelMapScreen.splice(b.levelMapScreen.indexOf("about"),1)};J.q.Ml=function(a){a/=150;console.log(a);PokiSDK.gameLoadingProgress({percentageDone:a})};J.q.xl=function(){PokiSDK.gameLoadingFinished();J.d.md()};
J.q.nt=function(a){try{J.d.xo(),mb("master"),PokiSDK.commercialBreak().then(function(){J.d.lj();nb("master");a()})["catch"](function(a){console.log("error"+a);J.d.lj();nb("master")})}catch(b){console.log("error"+b),J.d.lj()}};J.q.gs=function(){J.q.nt(function(){PokiSDK.gameplayStart()})};J.q.Bh=function(){J.q.nt(function(){J.d.md()})};J.q.WA=function(){PokiSDK.happyTime(.5)};J.q.fs=function(){PokiSDK.happyTime(1);PokiSDK.gameplayStop()};
J.q.Qr=function(a,b){void 0===J.d.Le&&(J.d.Le=new Ig(!0));Jg(a,b)};J.q.eq=function(a){void 0===J.d.Le&&(J.d.Le=new Ig(!0));Kg(a)};J.q.Sd=function(a){window.open(a)};J.q.Oe=function(a){"inGame"===a&&PokiSDK.gameplayStop()};J.q.Hv=function(a){"inGame"===a&&PokiSDK.gameplayStart()};J.q.Lw=function(){};J=J||{};J.Pq=J.Pq||{};J.Pq.$z={mA:""};
if("Internet Explorer"==l.name){for(var ml=[],nl=0;nl<J.a.F.options.buttons.startScreen.length;nl++)1!=nl&&ml.push(J.a.F.options.buttons.startScreen[nl]);J.a.F.options.buttons.startScreen=ml;for(var ol=[],nl=0;nl<J.a.F.options.buttons.levelMapScreen.length;nl++)1!=nl&&ol.push(J.a.F.options.buttons.levelMapScreen[nl]);J.a.F.options.buttons.levelMapScreen=ol;for(var pl=[],nl=0;nl<J.a.F.options.buttons.inGame.length;nl++)2!=nl&&pl.push(J.a.F.options.buttons.inGame[nl]);J.a.F.options.buttons.inGame=pl}
function ql(){this.depth=-1E6;this.p=this.visible=!0;this.Ua=J.Ee;this.end=this.xa=this.Io=this.Ho=this.load=this.ac=!1;this.Un=0;this.jq=this.ck=!1;this.state="GAME_INIT";this.screen=null;this.Vs=this.Hb=this.M=0;this.Vn=!1;this.Kl=this.Ll=!0;this.Ux=1;this.Ld=!1;this.bd={};this.Ba={difficulty:1,playMusic:!0,playSFX:!0,language:J.o.no()};window.addEventListener("gameSetPause",this.xo,!1);window.addEventListener("gameResume",this.lj,!1);document.addEventListener("visibilitychange",this.zw,!1);this.Qg=
"timedLevelEvent"}e=ql.prototype;e.xo=function(){D.pause("master");F.pause()};e.lj=function(){D.Mj("master");xb(F);Cb(F);Gb(F);F.Mj()};e.zw=function(){document.hidden?J.d.xo():J.d.lj()};
e.fn=function(){var a,b=this;void 0!==J.a.ha.background&&void 0!==J.a.ha.background.color&&(document.body.style.background=J.a.ha.background.color);J.$a=new Sg;J.I.Al&&J.I.Al.p&&(b.hu=ki(function(a){b.hu=a}));J.r=J.a.e.jg||{};J.r.he=J.r.he||"level";J.r.Jg=void 0!==J.r.Jg?J.r.Jg:"level"===J.r.he;J.r.ka=void 0!==J.r.ka?J.r.ka instanceof Array?J.r.ka:[J.r.ka]:[20];J.r.sh=void 0!==J.r.sh?J.r.sh:"locked";J.r.Nj=void 0!==J.r.Nj?J.r.Nj:"difficulty"===J.r.he;J.r.ak=void 0!==J.r.ak?J.r.ak:!1;J.r.Ip=void 0!==
J.r.Ip?J.r.Ip:"level"===J.r.he;J.r.qh=void 0!==J.r.qh?J.r.qh:"max";J.r.Bp=void 0!==J.r.Bp?J.r.Bp:"number";J.q.Qr(null,function(a){var d,g,h;a&&(b.bd=a);b.Ba=Ug("preferences",{});b.Ba.difficulty=void 0!==b.Ba.difficulty?b.Ba.difficulty:1;void 0!==J.r.Nt&&0>J.r.Nt.indexOf(ih())&&(b.Ba.difficulty=J.r.Nt[0]);b.Ba.playMusic=void 0!==b.Ba.playMusic?b.Ba.playMusic:!0;b.wf(b.Ba.playMusic);b.Ba.playSFX=void 0!==b.Ba.playSFX?b.Ba.playSFX:!0;b.km(b.Ba.playSFX);b.Ba.language=void 0!==b.Ba.language&&J.o.Rw(b.Ba.language)?
b.Ba.language:J.o.no();J.o.mt(b.Ba.language);void 0===rh(b.M,0,"state",void 0)&&rl(b.M,0,"state","unlocked");if(J.r.Jg)if("locked"===J.r.sh)for(h=!1,d=0;d<J.r.ka.length;d++){for(a=0;a<J.r.ka[d];a++)if(g=rh(d,a,"state","locked"),"locked"===g){b.M=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.Ba.lastPlayed&&(b.M=b.Ba.lastPlayed.world||0)});b.ei=sl();void 0!==b.ei.authToken&&void 0!==b.ei.challengeId&&(b.Ld=!0);J.I.RC&&(this.kc=this.NC?new TestBackendServiceProvider:new BackendServiceProvider,
this.kc.hs(function(a){a&&J.d.kc.cB(b.ei.authToken)}));a=parseFloat(l.D.version);D.ob&&(l.mb.kq&&l.D.Wl||l.D.Wh&&a&&4.4>a)&&(D.pk=1);this.ac=!0;this.Bl=0};function sl(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function tl(a){a.state="GAME_LOAD";a.screen=new ch(function(){J.d.load=!0;ci(J.d,!0);J.Zd.xl();J.q.xl()},function(a){J.Zd.Ml(a);J.q.Ml(a)},J.I.BC)}
function ci(a,b){a.ck=b||!1;a.jq=!0;a.Un++}
function ul(){var a=J.d;a.Un--;switch(a.state){case "GAME_INIT":a.ac&&!a.TC&&(a.Ld&&a.kc&&a.kc.DC(a.ei.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Hp&&a.screen.Hp("challengeLoadingError_notValid")}),tl(a));break;case "GAME_LOAD":if(a.load){if(a.Ld&&a.kc)if(a.kc.Qw())gh(a),jh(a.fd.mode);else{a.screen.Hp("challengeLoadingError_notStarted");break}G(F,a.screen);"function"===typeof vk&&(J.e=new vk);void 0!==J.I.Xq&&!1!==J.I.Xq.show&&J.c.cv();bi(a)}break;case "LEVEL_INIT":a.Ho&&vl(a);
break;case "LEVEL_LOAD":a.Io&&wl(a);break;case "LEVEL_END":if(a.xa)switch(ai(),J.d.Ho=!1,J.d.Io=!1,J.sj=void 0,J.c.pg(J.Lr).ta=!0,J.c.pg(J.ql).ta=!0,J.d.qs){case "retry":nh(J.d,J.d.Hb);break;case "next":J.r.Jg?J.d.Hb+1<J.r.ka[J.d.M]?nh(J.d,J.d.Hb+1):J.d.M+1<J.r.ka.length?nh(J.d,0,J.d.M+1):J.r.Ip?(J.d.state="GAME_END",J.d.end=!0,ci(J.d,!1),J.q.uw()):J.d.screen=new mh:nh(J.d,0);break;case "exit":J.r.Jg?J.d.screen=new mh:bi(J.d)}break;case "GAME_END":a.end&&(a.end=!1,J.d.screen=null,J.d.screen=new ei)}}
e.md=function(){J.d.jq=!1};function Wh(){var a;if(void 0!==J.d.ei.more_games)try{return a=decodeURIComponent(J.d.ei.more_games),function(){J.q.Sd(a)}}catch(b){}if("string"===typeof J.Lh.moreGamesUrl&&""!==J.Lh.moreGamesUrl)return function(){J.q.Sd(J.Lh.moreGamesUrl)};if(void 0!==J.I.Ox)return function(){J.q.Sd(J.I.Ox)};if("function"===typeof J.q.xw)return J.q.xw}function gh(a){if(a.Ld&&void 0!==a.kc)return void 0===a.fd&&(a.fd=a.kc.QA()),a.fd}e.ej=function(a){J.d.Ld&&J.d.kc&&J.d.kc.ej(a)};
e.Qi=function(a){J.d.Ld&&J.d.kc&&J.d.kc.Qi(a)};function ih(){return J.d.Ba.difficulty}function $h(){switch(ih()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+ih();}}function Ci(){var a="optionsDifficulty_"+$h();return J.o.N(a,"<"+a+">")}function jh(a){J.d.Ba.difficulty=a;Wg("preferences",J.d.Ba)}e.wf=function(a){void 0!==a&&(J.d.Ba.playMusic=a,Wg("preferences",J.d.Ba),a?nb("music"):mb("music"));return J.d.Ba.playMusic};
e.km=function(a){void 0!==a&&(J.d.Ba.playSFX=a,Wg("preferences",J.d.Ba),a?(nb("game"),nb("sfx")):(mb("game"),mb("sfx")));return J.d.Ba.playSFX};e.language=function(a){void 0!==a&&(J.d.Ba.language=a,Wg("preferences",J.d.Ba));return J.d.Ba.language};function rl(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===J.d.bd["level_"+a+"_"+b]&&(J.d.bd["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?J.d.bd["level_"+a+"_"+b][g]=d:J.d.bd["level_"+a+"_"+b][g][c]=d;J.q.eq(J.d.bd)}
function rh(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=J.d.bd["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function Ug(a,b){var c,d;"game"!==c&&(c="tg");d=J.d.bd.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function Wg(a,b){var c;"game"!==c&&(c="tg");void 0===J.d.bd.game&&(J.d.bd.game={tg:{},game:{}});void 0===a?J.d.bd.game[c]=b:J.d.bd.game[c][a]=b;J.q.eq(J.d.bd)}
function yh(a,b,c,d){void 0===c&&(c=a.Hb);void 0===d&&(d=a.M);return void 0===b?rh(d,c,"stats",{}):rh(d,c,"stats",{})[b]}function li(a){var b,c,d=J.d;if(void 0===c&&void 0!==a){var g=a;for(c=0;c<J.r.ka.length&&!(g<J.r.ka[c]);c++)g-=J.r.ka[c];c=g;if(void 0===b){var h=g=0;for(b=0;b<J.r.ka.length;b++){h+=J.r.ka[b];if(h>a)break;g+=1}b=g}}a=yh(d,"highScore",c,b);return"number"!==typeof a?0:a}
function xl(){var a,b,c,d=0;for(a=0;a<J.r.ka.length;a++)for(b=0;b<J.r.ka[a];b++)c=yh(J.d,void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function bi(a){a.screen&&G(F,a.screen);a.screen=new fh;a.Hb=-1}
function Pi(a,b,c,d){var g;g=void 0!==J.a.ha.oj&&void 0!==J.a.ha.oj.backgroundImage?J.a.ha.oj.backgroundImage:void 0!==J.a.F.oj?J.a.F.oj.backgroundImage:void 0;J.c.Ub(J.kg);a=a||0;b=b||0;c=c||p.width;d=d||p.height;if(g)if(c=Math.min(Math.min(c,p.width),g.Si),d=Math.min(Math.min(d,p.height),g.ph),void 0!==g){var h=a,k=b-J.Vq,m,n,r;for(m=0;m<g.S;m+=1)n=m%g.Jh*g.width,r=g.height*Math.floor(m/g.Jh),n>h+c||n+g.width<h||r>k+d||r+g.height<k||g.Na(m,h-n,k-r,c,d,a,b,1)}else qa(a,b,c,d,"white",!1)}
function nh(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.M=c);a.Hb=b;a.Ho=!0;ci(a,!1);J.q.vw()}function vl(a){a.state="LEVEL_LOAD";a.Io=!0;ci(a,!1);J.q.ww()}
function wl(a){var b,c=0;if(a.M<J.r.ka.length&&a.Hb<J.r.ka[a.M]){a.state="LEVEL_PLAY";a.Vs+=1;a.xa=!1;a.screen=null;Pi(0,J.Vq);b=J.$a;var d=Zh(a,3),g="progression:levelStarted:"+$h(),h=a.Qg,k;for(k=0;k<b.va.length;k++)if(!b.va[k].p){b.va[k].w=0;b.va[k].paused=0;b.va[k].p=!0;b.va[k].cw=d;b.va[k].gy=g;b.va[k].tag=h;break}k===b.va.length&&b.va.push({p:!0,w:0,paused:0,cw:d,gy:g,tag:h});b.ub(d,g,void 0,J.za.Nc.yq);b.ub("Start:","progression:levelStart:"+d,void 0,J.za.Nc.hk);for(b=0;b<a.M;b++)c+=J.r.ka[b];
J.q.gs(a.M,a.Hb);a.Ba.lastPlayed={world:a.M,level:a.Hb};J.sj=new Xi(c+a.Hb)}}function sh(a,b,c){var d=0;void 0===b&&(b=a.M);void 0===c&&(c=a.Hb);for(a=0;a<b;a++)d+=J.r.ka[a];return d+c}function Zh(a,b){var c,d=a.Hb+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function Sj(){function a(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===J.r.qh&&a>b||"min"===J.r.qh&&a<b?!0:!1}var b=J.d,c={failed:!Z.Fo,totalScore:Z.Qa,highScore:Z.Ao,stars:Z.h};b.state="LEVEL_END";var d,g,h,k,m,n,r={},v=Zh(b,3),c=c||{};c.level=J.r.ak?b.Hb+1:sh(b)+1;c.es=!1;g=(d=rh(b.M,b.Hb,"stats",void 0))||{};if(void 0!==c.ge||void 0!==c.Wb){void 0!==c.ge&&(r[c.ge.id]=c.ge.ea(),"highScore"===c.ge.id&&(n=c.ge));if(void 0!==c.Wb)for(k=0;k<c.Wb.length;k++)r[c.Wb[k].id]=c.Wb[k].ea(),
"highScore"===c.Wb[k].id&&(n=c.Wb[k]);for(k in r)m=r[k],void 0!==m.Lf&&(r[m.Em].qd=m.Lf(r[m.Em].qd));void 0!==r.totalScore&&(h=r.totalScore.qd)}else h=c.totalScore,void 0!==h&&void 0!==c.timeBonus&&(h+=c.timeBonus);k="";if(!0!==c.failed){k="Complete:";if(void 0!==h){J.$a.ub(k,"level:"+v,h,J.za.Nc.hk);if(void 0===d||a(h,d.highScore))g.highScore=h,c.es=!0,J.$a.ub("highScore",":score:"+$h()+":"+v,h,J.za.Nc.an);void 0!==n&&(n.qd=g.highScore);c.highScore=g.highScore}if(void 0!==c.stars){if(void 0===g.stars||
g.stars<c.stars)g.stars=c.stars;J.$a.ub("stars",":score:"+$h()+":"+v,c.stars,J.za.Nc.an)}b.Hb+1<J.r.ka[b.M]?"locked"===rh(b.M,b.Hb+1,"state","locked")&&rl(b.M,b.Hb+1,"state","unlocked"):b.M+1<J.r.ka.length&&"locked"===rh(b.M+1,0,"state","locked")&&rl(b.M+1,0,"state","unlocked");rl(b.M,b.Hb,void 0,{stats:g,state:"played"});void 0!==b.kc&&(d=J.e&&J.e.pw?J.e.pw():xl(),void 0!==d&&b.kc.MC(d,J.r.Bp));Yg(J.$a,b.Qg,v,"progression:levelCompleted:"+$h())}else J.$a.ub("Fail:","level:"+v,h,J.za.Nc.hk),Yg(J.$a,
b.Qg,v,"progression:levelFailed:"+$h());var z={totalScore:h,level:c.level,highScore:c.highScore,failed:!0===c.failed,stars:c.stars,stage:c.stage},b=function(a){J.d.xa=!0;J.d.qs=a;ci(J.d,!0);J.q.Bh(z);J.Zd.Bh(z)};J.q.Qn&&J.q.Qn();void 0===c.customEnd&&new zh(J.r.he,c,b)}e.Oj=function(){J.d.Oe(!0)};
e.Oe=function(a,b,c){var d="inGame";J.d.screen instanceof fh?d="startScreen":J.d.screen instanceof mh?d="levelMapScreen":b&&(d=J.d.fd.lr===J.d.fd.En?"inGame_challenger":"inGame_challengee");J.d.ue||(J.d.ue=new Th(d,!0===a,b,c))};
function Ui(a){var b=[],c,d,g,h,k;J.d.ue||J.d.cf||(J.d.fd.lr===J.d.fd.En?(c=J.o.N("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",g="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=J.o.N(b,"<"+b.toUpperCase()+"<");J.d.cf&&hi(b);a&&Mh()},h=function(){J.d.Qi(k);return!0}):(c=J.o.N("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",g="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=J.o.N(b,"<"+b.toUpperCase()+"<");if(J.d.cf&&(hi(b),a)){var b=J.o.N("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",J.d.fd.PB[J.d.fd.En]),b=b.replace("<AMOUNT>",J.d.fd.SC),c=J.d.cf,d,g,h,k;d=Q.ea();c.a.Jt&&B(d,c.a.Jt);g=Ra(d,b,c.a.zy,c.a.yy,!0);g<d.fontSize&&C(d,g);g=d.ya(b,c.a.sp)+10;h=d.na(b,c.a.rp)+10;k=J.c.Ma(c.a.Ay,c.f.g.width,g,d.align);h=J.c.Ma(c.a.By,c.f.g.height-gi(c),h,d.l);y(c.f.g);d.A(b,
k,h,g);A(c.f.g)}a&&Mh()},h=function(){J.d.ej(k);return!0}),b.push({aa:d,Aa:h,Sa:J.d}),b.push({aa:g,Aa:function(){J.d.cf.close();J.d.cf=null;return!0}}),J.d.cf=new fi(c,b,a),J.d.ue=J.d.cf)}e.jp=function(){var a,b;b=Qb(F,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].yo&&b[a].yo();Zg();Rb("game");Ib()};function Mh(a){var b,c;c=Qb(F);for(b=0;b<c.length;b++)"function"===typeof c[b].yo&&c[b].yo();Rb();Ib();Zg();a&&(a.ba=Math.max(0,a.ba-1));Sb("system")}
function Sh(){var a,b;b=Qb(F);for(a=0;a<b.length;a++)"function"===typeof b[a].yw&&b[a].yw();Sb();a=F;for(b=0;b<a.jc.length;b+=1)a.jc[b].paused=Math.max(0,a.jc[b].paused-1);a=J.$a;b=J.d.Qg;var c;for(c=0;c<a.va.length;c++)void 0!==a.va[c]&&a.va[c].tag===b&&(a.va[c].paused-=1,a.va[c].paused=Math.max(a.va[c].paused,0))}function ai(){var a;J.sj&&G(F,J.sj);for(a=Qb(F,"LevelStartDialog");0<a.length;)G(F,a.pop())}
function Xg(){var a="";J.version.builder&&(a=J.version.builder);J.version.tg&&(a+="-"+J.version.tg);J.version.game&&(a+="-"+J.version.game);J.version.config&&(a+="-"+J.version.config);return a}e.Tc=function(){this.ac||(this.fn(),ci(J.d,!0),J.Zd.wl(),J.q.wl())};
e.Oa=function(a){"function"===typeof this.Kr&&(this.Kr(),this.Kr||J.d.md());0<this.Un&&(this.ck||this.jq||ul());700>this.Bl&&(this.Bl+=a,700<=this.Bl&&(J.I.QC&&void 0!==J.I.gj&&J.I.gj.ll&&J.I.gj.xm&&J.$a.start([J.I.gj.ll,J.I.gj.xm]),void 0===rh(this.M,0,"state",void 0)&&rl(this.M,0,"state","unlocked")))};e.vd=function(a,b){"languageSet"===a&&J.d.language(b)};e.ud=function(){var a,b;for(a=0;a<J.we.length;a++)b=J.we[a],b.ta&&(p.Ub(b),p.clear())};
e.tb=function(){var a;for(a=0;a<J.we.length;a++)J.we[a].ta=!1};J.gz=function(){J.d=new ql;Nb(J.d);Pb(J.d,"system")};(void 0===J.pv||J.pv)&&J.q.tw();ql.prototype.Oe=function(a,b,c){var d="inGame";J.d.screen instanceof fh?d="startScreen":J.d.screen instanceof mh?d="levelMapScreen":b&&(d=J.d.fd.lr===J.d.fd.En?"inGame_challenger":"inGame_challengee");J.q.Oe(d);J.d.ue||(J.d.ue=new Th(d,!0===a,b,c))};Th.prototype.close=function(){G(F,this);this.canvas.ta=!0;J.q.Hv(this.type);return!0};
Va.prototype.le=function(a,b){var c,d,g,h=1,k=ab(this,a);this.qb[a]=b;this.Pc[a]&&delete this.Pc[a];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.Ga.indexOf(a)){for(g=0;g<d.Ga.length;g+=1)void 0!==this.qb[d.Ga[g]]&&(h*=this.qb[d.Ga[g]]);h=Math.round(100*h)/100;if(this.Db){if(d=this.re[d.id])d.gain.value=h}else this.ob&&(d.P.volume=h)}this.Db&&(d=this.re[a])&&(d.gain.value=b)};
