"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

var _window$AudioContext;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var audio = function audio() {
  _classCallCheck(this, audio);
};

exports["default"] = audio;

_defineProperty(audio, "_data", {});

_defineProperty(audio, "_context", new ((_window$AudioContext = window.AudioContext) !== null && _window$AudioContext !== void 0 ? _window$AudioContext : window.webkitAudioContext)());

_defineProperty(audio, "_playingSingles", {});

_defineProperty(audio, "_getSource", function (id) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  if (!audio._data[id]) {
    console.warn("No audio file loaded with ID \u201C".concat(id, "\u201D"));
    return;
  }

  var source = audio._context.createBufferSource(),
      gainNode = audio._context.createGain();

  gainNode.gain.value = volume;
  gainNode.connect(audio._context.destination);
  source.connect(gainNode);
  source.buffer = audio._data[id];

  source.setVolume = function (volume) {
    return gainNode.gain.value = volume;
  };

  return source;
});

_defineProperty(audio, "load", function (id, url) {
  return new Promise(function (resolve) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      return audio._context.decodeAudioData(request.response, function (buffer) {
        audio._data[id] = buffer;
        resolve();
      });
    };

    request.send();
  });
});

_defineProperty(audio, "loadList", function (data, basedir) {
  var _Promise$allSettled;

  var list = [];

  for (var _i = 0, _Object$entries = Object.entries(data); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        id = _Object$entries$_i[0],
        url = _Object$entries$_i[1];

    list.push(audio.load(id, "".concat(basedir !== null && basedir !== void 0 ? basedir : '.', "/").concat(url)));
  }

  (_Promise$allSettled = Promise.allSettled) !== null && _Promise$allSettled !== void 0 ? _Promise$allSettled : Promise.allSettled = function (promises) {
    return Promise.all(promises.map(function (p) {
      return p.then(function (value) {
        return {
          status: 'fulfilled',
          value: value
        };
      })["catch"](function (reason) {
        return {
          status: 'rejected',
          reason: reason
        };
      });
    }));
  };
  return Promise.allSettled(list);
});

_defineProperty(audio, "play", function (id) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return new Promise(function (resolve) {
    var source = audio._getSource(id, volume);

    if (!source) return resolve(false);

    source.onended = function () {
      return resolve(true);
    };

    source.start(0);
  });
});

_defineProperty(audio, "playSingle", function (id) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return new Promise(function (resolve) {
    var source = audio._getSource(id, volume);

    if (!source) return resolve(false);
    if (audio._playingSingles[id]) audio._playingSingles[id].stop();
    audio._playingSingles[id] = source;

    source.onended = function () {
      return resolve(true);
    };

    source.start(0);
  });
});

_defineProperty(audio, "loop", function (id) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var source = audio._getSource(id, volume);

  if (!source) return;
  source.loop = true;
  source.start(0);
  return source;
});