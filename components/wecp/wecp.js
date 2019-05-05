/**
 * we-cropper v1.2.0
 * (c) 2018 dlhandsome
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WeCropper = factory());
}(this, (function () { 'use strict';

var device = void 0;
var TOUCH_STATE = ['touchstarted', 'touchmoved', 'touchended'];

function isFunction (obj) {
  return typeof obj === 'function'
}

function firstLetterUpper (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function setTouchState (instance) {
  var arg = [], len = arguments.length - 1;
  while ( len-- > 0 ) arg[ len ] = arguments[ len + 1 ];

  TOUCH_STATE.forEach(function (key, i) {
    if (arg[i] !== undefined) {
      instance[key] = arg[i];
    }
  });
}

function validator (instance, o) {
  Object.defineProperties(instance, o);
}

function	getDevice () {
  if (!device) {
    device = wx.getSystemInfoSync();
  }
  return device
}

var tmp = {};

var DEFAULT = {
  id: {
    default: 'cropper',
    get: function get () {
      return tmp.id
    },
    set: function set (value) {
      if (typeof (value) !== 'string') {
        console.error(("id：" + value + " is invalid"));
      }
      tmp.id = value;
    }
  },
  width: {
    default: 750,
    get: function get () {
      return tmp.width
    },
    set: function set (value) {
      if (typeof (value) !== 'number') {
        console.error(("width：" + value + " is invalid"));
      }
      tmp.width = value;
    }
  },
  height: {
    default: 750,
    get: function get () {
      return tmp.height
    },
    set: function set (value) {
      if (typeof (value) !== 'number') {
        console.error(("height：" + value + " is invalid"));
      }
      tmp.height = value;
    }
  },
  scale: {
    default: 2.5,
    get: function get () {
      return tmp.scale
    },
    set: function set (value) {
      if (typeof (value) !== 'number') {
        console.error(("scale：" + value + " is invalid"));
      }
      tmp.scale = value;
    }
  },
  zoom: {
    default: 5,
    get: function get () {
      return tmp.zoom
    },
    set: function set (value) {
      if (typeof (value) !== 'number') {
        console.error(("zoom：" + value + " is invalid"));
      } else if (value < 0 || value > 10) {
        console.error("zoom should be ranged in 0 ~ 10");
      }
      tmp.zoom = value;
    }
  },
  src: {
    default: 'cropper',
    get: function get () {
      return tmp.src
    },
    set: function set (value) {
      if (typeof (value) !== 'string') {
        console.error(("id：" + value + " is invalid"));
      }
      tmp.src = value;
    }
  },
  cut: {
    default: {},
    get: function get () {
      return tmp.cut
    },
    set: function set (value) {
      if (typeof (value) !== 'object') {
        console.error(("id：" + value + " is invalid"));
      }
      tmp.cut = value;
    }
  },
  onReady: {
    default: null,
    get: function get () {
      return tmp.ready
    },
    set: function set (value) {
      tmp.ready = value;
    }
  },
  onBeforeImageLoad: {
    default: null,
    get: function get () {
      return tmp.beforeImageLoad
    },
    set: function set (value) {
      tmp.beforeImageLoad = value;
    }
  },
  onImageLoad: {
    default: null,
    get: function get () {
      return tmp.imageLoad
    },
    set: function set (value) {
      tmp.imageLoad = value;
    }
  },
  onBeforeDraw: {
    default: null,
    get: function get () {
      return tmp.beforeDraw
    },
    set: function set (value) {
      tmp.beforeDraw = value;
    }
  }
};

function prepare () {
  var that = this;
  var ref = getDevice();
  var windowWidth = ref.windowWidth;

  that.attachPage = function () {
    var pages = getCurrentPages();
    //  获取到当前page上下文
    var pageContext = pages[pages.length - 1];
    //  把this依附在Page上下文的wecropper属性上，便于在page钩子函数中访问
    pageContext.wecropper = that;
  };

  that.createCtx = function () {
    var id = that.id;
    if (id) {
      that.ctx = wx.createCanvasContext(id);
    } else {
      console.error("constructor: create canvas context failed, 'id' must be valuable");
    }
  };

  that.deviceRadio = windowWidth / 750;
}

function observer () {
  var that = this;

  var EVENT_TYPE = ['ready', 'beforeImageLoad', 'beforeDraw', 'imageLoad'];

  that.on = function (event, fn) {
    if (EVENT_TYPE.indexOf(event) > -1) {
      if (typeof (fn) === 'function') {
        event === 'ready'
          ? fn(that)
          : that[("on" + (firstLetterUpper(event)))] = fn;
      }
    } else {
      console.error(("event: " + event + " is invalid"));
    }
    return that
  };
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof that !== 'undefined' ? that : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base64 = createCommonjsModule(function (module, exports) {
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
(function(root) {

	// Detect free variables `exports`.
	var freeExports = 'object' == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = 'object' == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof undefined == 'function' &&
		typeof undefined.amd == 'object' &&
		undefined.amd
	) {
		undefined(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(commonjsGlobal));
});

function makeURI (strData, type) {
  return 'data:' + type + ';base64,' + strData
}

function fixType (type) {
  type = type.toLowerCase().replace(/jpg/i, 'jpeg');
  var r = type.match(/png|jpeg|bmp|gif/)[0];
  return 'image/' + r
}

function encodeData (data) {
  var str = '';
  if (typeof data === 'string') {
    str = data;
  } else {
    for (var i = 0; i < data.length; i++) {
      str += String.fromCharCode(data[i]);
    }
  }
  return base64.encode(str)
}

/**
 * 获取图像区域隐含的像素数据
 * @param canvasId canvas标识
 * @param x 将要被提取的图像数据矩形区域的左上角 x 坐标
 * @param y 将要被提取的图像数据矩形区域的左上角 y 坐标
 * @param width 将要被提取的图像数据矩形区域的宽度
 * @param height 将要被提取的图像数据矩形区域的高度
 * @param done 完成回调
 */
function getImageData (canvasId, x, y, width, height, done) {
  wx.canvasGetImageData({
    canvasId: canvasId,
    x: x,
    y: y,
    width: width,
    height: height,
    success: function success (res) {
      done(res);
    },
    fail: function fail (res) {
      done(null);
      console.error('canvasGetImageData error: ' + res);
    }
  });
}

/**
 * 生成bmp格式图片
 * 按照规则生成图片响应头和响应体
 * @param oData 用来描述 canvas 区域隐含的像素数据 { data, width, height } = oData
 * @returns {*} base64字符串
 */
function genBitmapImage (oData) {
  //
  // BITMAPFILEHEADER: http://msdn.microsoft.com/en-us/library/windows/desktop/dd183374(v=vs.85).aspx
  // BITMAPINFOHEADER: http://msdn.microsoft.com/en-us/library/dd183376.aspx
  //
  var biWidth = oData.width;
  var biHeight	= oData.height;
  var biSizeImage = biWidth * biHeight * 3;
  var bfSize = biSizeImage + 54; // total header size = 54 bytes

  //
  //  typedef struct tagBITMAPFILEHEADER {
  //  	WORD bfType;
  //  	DWORD bfSize;
  //  	WORD bfReserved1;
  //  	WORD bfReserved2;
  //  	DWORD bfOffBits;
  //  } BITMAPFILEHEADER;
  //
  var BITMAPFILEHEADER = [
    // WORD bfType -- The file type signature; must be "BM"
    0x42, 0x4D,
    // DWORD bfSize -- The size, in bytes, of the bitmap file
    bfSize & 0xff, bfSize >> 8 & 0xff, bfSize >> 16 & 0xff, bfSize >> 24 & 0xff,
    // WORD bfReserved1 -- Reserved; must be zero
    0, 0,
    // WORD bfReserved2 -- Reserved; must be zero
    0, 0,
    // DWORD bfOffBits -- The offset, in bytes, from the beginning of the BITMAPFILEHEADER structure to the bitmap bits.
    54, 0, 0, 0
  ];

  //
  //  typedef struct tagBITMAPINFOHEADER {
  //  	DWORD biSize;
  //  	LONG  biWidth;
  //  	LONG  biHeight;
  //  	WORD  biPlanes;
  //  	WORD  biBitCount;
  //  	DWORD biCompression;
  //  	DWORD biSizeImage;
  //  	LONG  biXPelsPerMeter;
  //  	LONG  biYPelsPerMeter;
  //  	DWORD biClrUsed;
  //  	DWORD biClrImportant;
  //  } BITMAPINFOHEADER, *PBITMAPINFOHEADER;
  //
  var BITMAPINFOHEADER = [
    // DWORD biSize -- The number of bytes required by the structure
    40, 0, 0, 0,
    // LONG biWidth -- The width of the bitmap, in pixels
    biWidth & 0xff, biWidth >> 8 & 0xff, biWidth >> 16 & 0xff, biWidth >> 24 & 0xff,
    // LONG biHeight -- The height of the bitmap, in pixels
    biHeight & 0xff, biHeight >> 8 & 0xff, biHeight >> 16 & 0xff, biHeight >> 24 & 0xff,
    // WORD biPlanes -- The number of planes for the target device. This value must be set to 1
    1, 0,
    // WORD biBitCount -- The number of bits-per-pixel, 24 bits-per-pixel -- the bitmap
    // has a maximum of 2^24 colors (16777216, Truecolor)
    24, 0,
    // DWORD biCompression -- The type of compression, BI_RGB (code 0) -- uncompressed
    0, 0, 0, 0,
    // DWORD biSizeImage -- The size, in bytes, of the image. This may be set to zero for BI_RGB bitmaps
    biSizeImage & 0xff, biSizeImage >> 8 & 0xff, biSizeImage >> 16 & 0xff, biSizeImage >> 24 & 0xff,
    // LONG biXPelsPerMeter, unused
    0, 0, 0, 0,
    // LONG biYPelsPerMeter, unused
    0, 0, 0, 0,
    // DWORD biClrUsed, the number of color indexes of palette, unused
    0, 0, 0, 0,
    // DWORD biClrImportant, unused
    0, 0, 0, 0
  ];

  var iPadding = (4 - ((biWidth * 3) % 4)) % 4;

  var aImgData = oData.data;

  var strPixelData = '';
  var biWidth4 = biWidth << 2;
  var y = biHeight;
  var fromCharCode = String.fromCharCode;

  do {
    var iOffsetY = biWidth4 * (y - 1);
    var strPixelRow = '';
    for (var x = 0; x < biWidth; x++) {
      var iOffsetX = x << 2;
      strPixelRow += fromCharCode(aImgData[iOffsetY + iOffsetX + 2]) +
        fromCharCode(aImgData[iOffsetY + iOffsetX + 1]) +
        fromCharCode(aImgData[iOffsetY + iOffsetX]);
    }

    for (var c = 0; c < iPadding; c++) {
      strPixelRow += String.fromCharCode(0);
    }

    strPixelData += strPixelRow;
  } while (--y)

  var strEncoded = encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) + encodeData(strPixelData);

  return strEncoded
}

/**
 * 转换为图片base64
 * @param canvasId canvas标识
 * @param x 将要被提取的图像数据矩形区域的左上角 x 坐标
 * @param y 将要被提取的图像数据矩形区域的左上角 y 坐标
 * @param width 将要被提取的图像数据矩形区域的宽度
 * @param height 将要被提取的图像数据矩形区域的高度
 * @param type 转换图片类型
 * @param done 完成回调
 */
function convertToImage (canvasId, x, y, width, height, type, done) {
  if ( done === void 0 ) done = function () {};

  if (type === undefined) { type = 'png'; }
  type = fixType(type);
  if (/bmp/.test(type)) {
    getImageData(canvasId, x, y, width, height, function (data) {
      var strData = genBitmapImage(data);
      isFunction(done) && done(makeURI(strData, 'image/' + type));
    });
  } else {
    console.error('暂不支持生成\'' + type + '\'类型的base64图片');
  }
}

var CanvasToBase64 = {
  convertToImage: convertToImage,
  // convertToPNG: function (width, height, done) {
  //   return convertToImage(width, height, 'png', done)
  // },
  // convertToJPEG: function (width, height, done) {
  //   return convertToImage(width, height, 'jpeg', done)
  // },
  // convertToGIF: function (width, height, done) {
  //   return convertToImage(width, height, 'gif', done)
  // },
  convertToBMP: function (ref, done) {
    if ( ref === void 0 ) ref = {};
    var canvasId = ref.canvasId;
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var height = ref.height;
    if ( done === void 0 ) done = function () {};

    return convertToImage(canvasId, x, y, width, height, 'bmp', done)
  }
};

function methods () {
  var that = this;

  var id = that.id;
  var deviceRadio = that.deviceRadio;
  var boundWidth = that.width; // 裁剪框默认宽度，即整个画布宽度
  var boundHeight = that.height; // 裁剪框默认高度，即整个画布高度
  var ref = that.cut;
  var x = ref.x; if ( x === void 0 ) x = 0;
  var y = ref.y; if ( y === void 0 ) y = 0;
  var width = ref.width; if ( width === void 0 ) width = boundWidth;
  var height = ref.height; if ( height === void 0 ) height = boundHeight;

  that.updateCanvas = function () {
    if (that.croperTarget) {
      //  画布绘制图片
      that.ctx.drawImage(that.croperTarget, that.imgLeft, that.imgTop, that.scaleWidth, that.scaleHeight);
    }
    isFunction(that.onBeforeDraw) && that.onBeforeDraw(that.ctx, that);

    that.setBoundStyle(); //	设置边界样式
    that.ctx.draw();
    return that
  };

  that.pushOrign = function (src) {
    that.src = src;

    isFunction(that.onBeforeImageLoad) && that.onBeforeImageLoad(that.ctx, that);

    wx.getImageInfo({
      src: src,
      success: function success (res) {
        var innerAspectRadio = res.width / res.height;

        that.croperTarget = res.path;

        if (innerAspectRadio < width / height) {
          that.rectX = x;
          that.baseWidth = width;
          that.baseHeight = width / innerAspectRadio;
          that.rectY = y - Math.abs((height - that.baseHeight) / 2);
        } else {
          that.rectY = y;
          that.baseWidth = height * innerAspectRadio;
          that.baseHeight = height;
          that.rectX = x - Math.abs((width - that.baseWidth) / 2);
        }

        that.imgLeft = that.rectX;
        that.imgTop = that.rectY;
        that.scaleWidth = that.baseWidth;
        that.scaleHeight = that.baseHeight;

        that.updateCanvas();

        isFunction(that.onImageLoad) && that.onImageLoad(that.ctx, that);
      }
    });

    that.update();
    return that
  };

  that.getCropperBase64 = function (done) {
    if ( done === void 0 ) done = function () {};

    CanvasToBase64.convertToBMP({
      canvasId: id,
      x: x,
      y: y,
      width: width,
      height: height
    }, done);
  };

  that.getCropperImage = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var ARG_TYPE = toString.call(args[0]);
    var fn = args[args.length - 1];

    switch (ARG_TYPE) {
      case '[object Object]':
        var ref = args[0];
    var quality = ref.quality; if ( quality === void 0 ) quality = 10;

        if (typeof (quality) !== 'number') {
          console.error(("quality：" + quality + " is invalid"));
        } else if (quality < 0 || quality > 10) {
          console.error("quality should be ranged in 0 ~ 10");
        }
        wx.canvasToTempFilePath({
          canvasId: id,
          x: x,
          y: y,
          width: width,
          height: height,
          destWidth: width * quality / (deviceRadio * 10),
          destHeight: height * quality / (deviceRadio * 10),
          success: function success (res) {
            isFunction(fn) && fn.call(that, res.tempFilePath);
          },
          fail: function fail (res) {
            isFunction(fn) && fn.call(that, null);
          }
        }); break
      case '[object Function]':
        wx.canvasToTempFilePath({
          canvasId: id,
          x: x,
          y: y,
          width: width,
          height: height,
          destWidth: width / deviceRadio,
          destHeight: height / deviceRadio,
          success: function success (res) {
            isFunction(fn) && fn.call(that, res.tempFilePath);
          },
          fail: function fail (res) {
            isFunction(fn) && fn.call(that, null);
          }
        }); break
    }

    return that
  };
}

/**
 * 获取最新缩放值
 * @param oldScale 上一次触摸结束后的缩放值
 * @param oldDistance 上一次触摸结束后的双指距离
 * @param zoom 缩放系数
 * @param touch0 第一指touch对象
 * @param touch1 第二指touch对象
 * @returns {*}
 */
var getNewScale = function (oldScale, oldDistance, zoom, touch0, touch1) {
  var xMove, yMove, newDistance;
  // 计算二指最新距离
  xMove = Math.round(touch1.x - touch0.x);
  yMove = Math.round(touch1.y - touch0.y);
  newDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

  return oldScale + 0.001 * zoom * (newDistance - oldDistance)
};

function update () {
  var that = this;

  if (!that.src) { return }

  that.__oneTouchStart = function (touch) {
    that.touchX0 = Math.round(touch.x);
    that.touchY0 = Math.round(touch.y);
  };

  that.__oneTouchMove = function (touch) {
    var xMove, yMove;
    // 计算单指移动的距离
    if (that.touchended) {
      return that.updateCanvas()
    }
    xMove = Math.round(touch.x - that.touchX0);
    yMove = Math.round(touch.y - that.touchY0);

    var imgLeft = Math.round(that.rectX + xMove);
    var imgTop = Math.round(that.rectY + yMove);

    that.outsideBound(imgLeft, imgTop);

    that.updateCanvas();
  };

  that.__twoTouchStart = function (touch0, touch1) {
    var xMove, yMove, oldDistance;

    that.touchX1 = Math.round(that.rectX + that.scaleWidth / 2);
    that.touchY1 = Math.round(that.rectY + that.scaleHeight / 2);

    // 计算两指距离
    xMove = Math.round(touch1.x - touch0.x);
    yMove = Math.round(touch1.y - touch0.y);
    oldDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    that.oldDistance = oldDistance;
  };

  that.__twoTouchMove = function (touch0, touch1) {
    var oldScale = that.oldScale;
    var oldDistance = that.oldDistance;
    var scale = that.scale;
    var zoom = that.zoom;

    that.newScale = getNewScale(oldScale, oldDistance, zoom, touch0, touch1);

    //  设定缩放范围
    that.newScale <= 1 && (that.newScale = 1);
    that.newScale >= scale && (that.newScale = scale);

    that.scaleWidth = Math.round(that.newScale * that.baseWidth);
    that.scaleHeight = Math.round(that.newScale * that.baseHeight);
    var imgLeft = Math.round(that.touchX1 - that.scaleWidth / 2);
    var imgTop = Math.round(that.touchY1 - that.scaleHeight / 2);

    that.outsideBound(imgLeft, imgTop);

    that.updateCanvas();
  };

  that.__xtouchEnd = function () {
    that.oldScale = that.newScale;
    that.rectX = that.imgLeft;
    that.rectY = that.imgTop;
  };
}

var handle = {
  //  图片手势初始监测
  touchStart: function touchStart (e) {
    var that = this;
    var ref = e.touches;
    var touch0 = ref[0];
    var touch1 = ref[1];

    setTouchState(that, true, null, null);

    // 计算第一个触摸点的位置，并参照改点进行缩放
    that.__oneTouchStart(touch0);

    // 两指手势触发
    if (e.touches.length >= 2) {
      that.__twoTouchStart(touch0, touch1);
    }
  },

  //  图片手势动态缩放
  touchMove: function touchMove (e) {
    var that = this;
    var ref = e.touches;
    var touch0 = ref[0];
    var touch1 = ref[1];

    setTouchState(that, null, true);

    // 单指手势时触发
    if (e.touches.length === 1) {
      that.__oneTouchMove(touch0);
    }
    // 两指手势触发
    if (e.touches.length >= 2) {
      that.__twoTouchMove(touch0, touch1);
    }
  },

  touchEnd: function touchEnd (e) {
    var that = this;

    setTouchState(that, false, false, true);
    that.__xtouchEnd();
  }
};

function cut () {
  var that = this;
  var boundWidth = that.width; // 裁剪框默认宽度，即整个画布宽度
  var boundHeight = that.height;
  // 裁剪框默认高度，即整个画布高度
  var ref = that.cut;
  var x = ref.x; if ( x === void 0 ) x = 0;
  var y = ref.y; if ( y === void 0 ) y = 0;
  var width = ref.width; if ( width === void 0 ) width = boundWidth;
  var height = ref.height; if ( height === void 0 ) height = boundHeight;

  /**
	 * 设置边界
	 * @param imgLeft 图片左上角横坐标值
	 * @param imgTop 图片左上角纵坐标值
	 */
  that.outsideBound = function (imgLeft, imgTop) {
    that.imgLeft = imgLeft >= x
      ? x
      : that.scaleWidth + imgLeft - x <= width
        ? x + width - that.scaleWidth
        :	imgLeft;

    that.imgTop = imgTop >= y
      ? y
      : that.scaleHeight + imgTop - y <= height
        ? y + height - that.scaleHeight
        : imgTop;
  };

  /**
	 * 设置边界样式
	 * @param color	边界颜色
	 */
  that.setBoundStyle = function (ref) {
    if ( ref === void 0 ) ref = {};
    var color = ref.color; if ( color === void 0 ) color = '#04b00f';
    var mask = ref.mask; if ( mask === void 0 ) mask = 'rgba(0, 0, 0, 0.3)';
    var lineWidth = ref.lineWidth; if ( lineWidth === void 0 ) lineWidth = 1;

    var boundOption = [
      {
        start: { x: x - lineWidth, y: y + 10 - lineWidth },
        step1: { x: x - lineWidth, y: y - lineWidth },
        step2: { x: x + 10 - lineWidth, y: y - lineWidth }
      },
      {
        start: { x: x - lineWidth, y: y + height - 10 + lineWidth },
        step1: { x: x - lineWidth, y: y + height + lineWidth },
        step2: { x: x + 10 - lineWidth, y: y + height + lineWidth }
      },
      {
        start: { x: x + width - 10 + lineWidth, y: y - lineWidth },
        step1: { x: x + width + lineWidth, y: y - lineWidth },
        step2: { x: x + width + lineWidth, y: y + 10 - lineWidth }
      },
      {
        start: { x: x + width + lineWidth, y: y + height - 10 + lineWidth },
        step1: { x: x + width + lineWidth, y: y + height + lineWidth },
        step2: { x: x + width - 10 + lineWidth, y: y + height + lineWidth }
      }
    ];

    // 绘制半透明层
    that.ctx.beginPath();
    that.ctx.setFillStyle(mask);
    that.ctx.fillRect(0, 0, x, boundHeight);
    that.ctx.fillRect(x, 0, width, y);
    that.ctx.fillRect(x, y + height, width, boundHeight - y - height);
    that.ctx.fillRect(x + width, 0, boundWidth - x - width, boundHeight);
    that.ctx.fill();

    boundOption.forEach(function (op) {
      that.ctx.beginPath();
      that.ctx.setStrokeStyle(color);
      that.ctx.setLineWidth(lineWidth);
      that.ctx.moveTo(op.start.x, op.start.y);
      that.ctx.lineTo(op.step1.x, op.step1.y);
      that.ctx.lineTo(op.step2.x, op.step2.y);
      that.ctx.stroke();
    });
  };
}

var version = "1.2.0";

var WeCropper = function WeCropper (params) {
  var that = this;
  var _default = {};

  validator(that, DEFAULT);

  Object.keys(DEFAULT).forEach(function (key) {
    _default[key] = DEFAULT[key].default;
  });
  Object.assign(that, _default, params);

  that.prepare();
  that.attachPage();
  that.createCtx();
  that.observer();
  that.cutt();
  that.methods();
  that.init();
  that.update();

  return that
};

WeCropper.prototype.init = function init () {
  var that = this;
  var src = that.src;

  that.version = version;

  typeof that.onReady === 'function' && that.onReady(that.ctx, that);

  if (src) {
    that.pushOrign(src);
  }
  setTouchState(that, false, false, false);

  that.oldScale = 1;
  that.newScale = 1;

  return that
};

Object.assign(WeCropper.prototype, handle);

WeCropper.prototype.prepare = prepare;
WeCropper.prototype.observer = observer;
WeCropper.prototype.methods = methods;
WeCropper.prototype.cutt = cut;
WeCropper.prototype.update = update;

return WeCropper;

})));