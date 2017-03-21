'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _glMatrix = require('gl-matrix');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getCursorPos = function getCursorPos(e) {
	if (e.touches) {
		return {
			x: e.touches[0].pageX,
			y: e.touches[0].pageY
		};
	} else {
		return {
			x: e.clientX,
			y: e.clientY
		};
	}
};

var UP = _glMatrix.vec3.fromValues(0, 1, 0);
var ANGLE_LIMIT = Math.PI / 2 - 0.01;

var OrbitalCameraControl = function () {
	function OrbitalCameraControl(mViewMatrix) {
		var mRadius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
		var mListenerTarget = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

		_classCallCheck(this, OrbitalCameraControl);

		this._mtxTarget = mViewMatrix;
		this._radius = mRadius;
		this._targetRadius = mRadius;
		this._listenerTarget = mListenerTarget;
		this._isDown = false;
		this._rotation = _glMatrix.mat4.create();
		this.center = _glMatrix.vec3.create();

		this.easing = 0.1;
		this.senstivity = 1;
		this.senstivityRotation = 1;

		this._isLocked = false;
		this._isZoomLocked = false;
		this._rx = 0;
		this._trx = 0;
		this._prevx = 0;
		this._ry = 0;
		this._try = 0;
		this._prevy = 0;

		this._quat = _glMatrix.quat.create();
		this._vec = _glMatrix.vec3.create();
		this._mtx = _glMatrix.mat4.create();

		this._mouseDown = {
			x: 0,
			y: 0
		};

		this._mouse = {
			x: 0,
			y: 0
		};

		this._init();
	}

	_createClass(OrbitalCameraControl, [{
		key: '_init',
		value: function _init() {
			var _this = this;

			this._listenerTarget.addEventListener('mousedown', function (e) {
				return _this._onDown(e);
			});
			this._listenerTarget.addEventListener('mouseup', function () {
				return _this._onUp();
			});
			this._listenerTarget.addEventListener('mousemove', function (e) {
				return _this._onMove(e);
			});

			this._listenerTarget.addEventListener('touchstart', function (e) {
				return _this._onDown(e);
			});
			this._listenerTarget.addEventListener('touchend', function () {
				return _this._onUp();
			});
			this._listenerTarget.addEventListener('touchmove', function (e) {
				return _this._onMove(e);
			});

			this._listenerTarget.addEventListener('mousewheel', function (e) {
				return _this._onWheel(e);
			});
			this._listenerTarget.addEventListener('DOMMouseScroll', function (e) {
				return _this._onWheel(e);
			});
		}
	}, {
		key: 'lock',
		value: function lock(mValue) {
			this._isLocked = mValue;
		}
	}, {
		key: 'lockZoom',
		value: function lockZoom(mValue) {
			this._isZoomLocked = mValue;
		}
	}, {
		key: '_onWheel',
		value: function _onWheel(e) {
			if (this._isZoomLocked) {
				return;
			}
			var w = e.wheelDelta;
			var d = e.detail;
			var value = 0;
			if (d) {
				if (w) {
					value = w / d / 40 * d > 0 ? 1 : -1; // Opera
				} else {
					value = -d / 3; // Firefox;         TODO: do not /3 for OS X
				}
			} else {
				value = w / 120;
			}

			this._targetRadius += -value * 2 * this.senstivity;
			if (this._targetRadius < 0.01) {
				this._targetRadius = 0.01;
			}
		}
	}, {
		key: '_onDown',
		value: function _onDown(e) {
			if (this._isLocked) {
				return;
			}
			this._isDown = true;

			this._mouseDown = getCursorPos(e);
			this._mouse = getCursorPos(e);

			this._prevx = this._trx = this._rx;
			this._prevy = this._try = this._ry;
		}
	}, {
		key: '_onMove',
		value: function _onMove(e) {
			if (this._isLocked) {
				return;
			}
			if (!this._isDown) {
				return;
			}
			this._mouse = getCursorPos(e);
		}
	}, {
		key: '_onUp',
		value: function _onUp() {
			if (this._isLocked) {
				return;
			}
			this._isDown = false;
		}
	}, {
		key: 'update',
		value: function update() {
			var dx = this._mouse.x - this._mouseDown.x;
			var dy = this._mouse.y - this._mouseDown.y;

			var senstivity = 0.02 * this.senstivityRotation;
			this._try = this._prevy - dx * senstivity;
			this._trx = this._prevx - dy * senstivity;

			if (this._trx < -Math.PI / 2 + 0.01) {
				this._trx = -Math.PI / 2 + 0.01;
			} else if (this._trx > Math.PI / 2 - 0.01) {
				this._trx = Math.PI / 2 - 0.01;
			}

			this._rx += (this._trx - this._rx) * this.easing;
			this._ry += (this._try - this._ry) * this.easing;
			this._radius += (this._targetRadius - this._radius) * this.easing;

			_glMatrix.quat.identity(this._quat);
			_glMatrix.quat.rotateY(this._quat, this._quat, this._ry);
			_glMatrix.quat.rotateX(this._quat, this._quat, this._rx);

			_glMatrix.vec3.set(this._vec, 0, 0, this._radius);
			_glMatrix.vec3.transformQuat(this._vec, this._vec, this._quat);

			_glMatrix.mat4.identity(this._mtx);
			_glMatrix.mat4.lookAt(this._mtx, this._vec, this.center, UP);

			if (this._mtxTarget) {
				_glMatrix.mat4.copy(this._mtxTarget, this._mtx);
			}
		}
	}]);

	return OrbitalCameraControl;
}();

exports.default = OrbitalCameraControl;
module.exports = exports['default'];
//# sourceMappingURL=OrbitalCameraControl.js.map