!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.CodeMirrorMovie=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"F:\\Projects\\codemirror-movie\\lib\\actions.js":[function(require,module,exports){
"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _utils = require("./utils");

var extend = _utils.extend;
var makePos = _utils.makePos;
var getCursor = _utils.getCursor;

var actions = {
	/**
  * Type-in passed text into current editor char-by-char
  * @param {Object} options Current options
  * @param {CodeMirror} editor Editor instance where action should be
  * performed
  * @param {Function} next Function to call when action performance
  * is completed
  * @param {Function} timer Function that creates timer for delayed
  * execution. This timer will automatically delay execution when
  * scenario is paused and revert when played again
  */
	type: function type(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			text: "", // text to type
			delay: 60, // delay between character typing
			pos: null // initial position where to start typing
		}, wrap("text", options));

		if (!options.text) {
			throw new Error("No text provided for \"type\" action");
		}

		if (options.pos !== null) {
			editor.setCursor(makePos(options.pos, editor));
		}

		var chars = options.text.split("");

		timer(function perform() {
			var ch = chars.shift();
			editor.replaceSelection(ch, "end");
			if (chars.length) {
				timer(perform, options.delay);
			} else {
				next();
			}
		}, options.delay);
	},

	/**
  * Wait for a specified timeout
  * @param options
  * @param editor
  * @param next
  * @param timer
  */
	wait: function wait(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			timeout: 100
		}, wrap("timeout", options));

		timer(next, parseInt(options.timeout, 10));
	},

	/**
  * Move caret to a specified position
  */
	moveTo: function moveTo(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			delay: 80,
			immediate: false // TODO: remove, use delay: 0 instead
		}, wrap("pos", options));

		if (typeof options.pos === "undefined") {
			throw new Error("No position specified for \"moveTo\" action");
		}

		var curPos = getCursor(editor);
		// reset selection, if exists
		editor.setSelection(curPos, curPos);
		var targetPos = makePos(options.pos, editor);

		if (options.immediate || !options.delay) {
			editor.setCursor(targetPos);
			next();
		}

		var deltaLine = targetPos.line - curPos.line;
		var deltaChar = targetPos.ch - curPos.ch;
		var steps = Math.max(deltaChar, deltaLine);
		// var stepLine = deltaLine / steps;
		// var stepChar = deltaChar / steps;
		var stepLine = deltaLine < 0 ? -1 : 1;
		var stepChar = deltaChar < 0 ? -1 : 1;

		timer(function perform() {
			curPos = getCursor(editor);
			if (steps > 0 && !(curPos.line == targetPos.line && curPos.ch == targetPos.ch)) {

				if (curPos.line != targetPos.line) {
					curPos.line += stepLine;
				}

				if (curPos.ch != targetPos.ch) {
					curPos.ch += stepChar;
				}

				editor.setCursor(curPos);
				steps--;
				timer(perform, options.delay);
			} else {
				editor.setCursor(targetPos);
				next();
			}
		}, options.delay);
	},

	/**
  * Similar to "moveTo" function but with immediate cursor position update
  */
	jumpTo: function jumpTo(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			afterDelay: 200
		}, wrap("pos", options));

		if (typeof options.pos === "undefined") {
			throw new Error("No position specified for \"jumpTo\" action");
		}

		editor.setCursor(makePos(options.pos, editor));
		timer(next, options.afterDelay);
	},

	/**
  * Executes predefined CodeMirror command
  * @param {Object} options
  * @param {CodeMirror} editor
  * @param {Function} next
  * @param {Function} timer
  */
	run: function run(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			beforeDelay: 500,
			times: 1
		}, wrap("command", options));

		var times = options.times;
		timer(function perform() {
			if (typeof options.command === "function") {
				options.command(editor, options);
			} else {
				editor.execCommand(options.command);
			}

			if (--times > 0) {
				timer(perform, options.beforeDelay);
			} else {
				next();
			}
		}, options.beforeDelay);
	},

	/**
  * Creates selection for specified position
  * @param {Object} options
  * @param {CodeMirror} editor
  * @param {Function} next
  * @param {Function} timer
  */
	select: function select(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			from: "caret"
		}, wrap("to", options));

		var from = makePos(options.from, editor);
		var to = makePos(options.to, editor);
		editor.setSelection(from, to);
		next();
	}
};

function wrap(key, value) {
	return typeof value === "object" ? value : _defineProperty({}, key, value);
}

module.exports = actions;

},{"./utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js"}],"F:\\Projects\\codemirror-movie\\lib\\dom.js":[function(require,module,exports){
"use strict";

exports.viewportRect = viewportRect;

/**
 * Removes element from parent
 * @param {Element} elem
 * @returns {Element}
 */
exports.remove = remove;

/**
 * Renders string into DOM element
 * @param {String} str
 * @returns {Element}
 */
exports.toDOM = toDOM;

/**
 * Sets or retrieves CSS property value
 * @param {Element} elem
 * @param {String} prop
 * @param {String} val
 */
exports.css = css;
Object.defineProperty(exports, "__esModule", {
	value: true
});
"use strict";

var toArray = require("./utils").toArray;

var w3cCSS = document.defaultView && document.defaultView.getComputedStyle;

function viewportRect() {
	var body = document.body;
	var docElem = document.documentElement;
	var clientTop = docElem.clientTop || body.clientTop || 0;
	var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

	return {
		top: scrollTop - clientTop,
		left: scrollLeft - clientLeft,
		width: body.clientWidth || docElem.clientWidth,
		height: body.clientHeight || docElem.clientHeight
	};
}

function remove(elem) {
	ar(elem).forEach(function (el) {
		return el.parentNode && el.parentNode.removeChild(el);
	});
	return elem;
}

function toDOM(str) {
	var div = document.createElement("div");
	div.innerHTML = str;
	return div.firstChild;
}

function css(elem, prop, val) {
	if (typeof prop === "string" && val == null) {
		return getCSS(elem, prop);
	}

	if (typeof prop === "string") {
		var obj = {};
		obj[prop] = val;
		prop = obj;
	}

	setCSS(elem, prop);
}

function ar(obj) {
	if (obj.length === +obj.length) {
		return toArray(obj);
	}

	return Array.isArray(obj) ? obj : [obj];
}

function toCamelCase(name) {
	return name.replace(/\-(\w)/g, function (str, p1) {
		return p1.toUpperCase();
	});
}

/**
 * Returns CSS property value of given element.
 * @author jQuery Team
 * @param {Element} elem
 * @param {String} name CSS property value
 */
function getCSS(elem, name) {
	var rnumpx = /^-?\d+(?:px)?$/i,
	    rnum = /^-?\d(?:\.\d+)?/,
	    rsuf = /\d$/;

	var nameCamel = toCamelCase(name);
	// If the property exists in style[], then it's been set
	// recently (and is current)
	if (elem.style[nameCamel]) {
		return elem.style[nameCamel];
	}

	if (w3cCSS) {
		var cs = window.getComputedStyle(elem, "");
		return cs.getPropertyValue(name);
	}

	if (elem.currentStyle) {
		var ret = elem.currentStyle[name] || elem.currentStyle[nameCamel];
		var style = elem.style || elem;

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if (!rnumpx.test(ret) && rnum.test(ret)) {
			// Remember the original values
			var left = style.left,
			    rsLeft = elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			elem.runtimeStyle.left = elem.currentStyle.left;
			var suffix = rsuf.test(ret) ? "em" : "";
			style.left = nameCamel === "fontSize" ? "1em" : ret + suffix || 0;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			elem.runtimeStyle.left = rsLeft;
		}

		return ret;
	}
}

/**
 * Sets CSS properties to given element
 * @param {Element} elem
 * @param {Object} params CSS properties to set
 */
function setCSS(elem, params) {
	if (!elem) {
		return;
	}

	var numProps = { "line-height": 1, "z-index": 1, opacity: 1 };
	var props = Object.keys(params).map(function (k) {
		var v = params[k];
		var name = k.replace(/([A-Z])/g, "-$1").toLowerCase();
		return name + ":" + (typeof v === "number" && !(name in numProps) ? v + "px" : v);
	});

	elem.style.cssText += ";" + props.join(";");
}

},{"./utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js"}],"F:\\Projects\\codemirror-movie\\lib\\movie.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/**
 * High-level function to create movie instance on textarea.
 * @param {Element} target Reference to textarea, either <code>Element</code>
 * or string ID. It can also accept existing CodeMirror object.
 * @param {Object} movieOptions Movie options. See <code>defaultOptions</code>
 * for value reference
 * @param {Object} editorOptions Additional options passed to CodeMirror
 * editor initializer.
 */
exports["default"] = movie;
Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * A high-level library interface for creating scenarios over textarea
 * element. The <code>CodeMirror.movie</code> takes reference to textarea
 * element (or its ID) and parses its content for initial content value,
 * scenario and outline.
 */
"use strict";

var _utils = require("./utils");

var parseJSON = _utils.parseJSON;
var extend = _utils.extend;
var toArray = _utils.toArray;

var Scenario = _interopRequire(require("./scenario"));

var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
var mac = ios || /Mac/.test(navigator.platform);

var macCharMap = {
	ctrl: "⌃",
	control: "⌃",
	cmd: "⌘",
	shift: "⇧",
	alt: "⌥",
	enter: "⏎",
	tab: "⇥",
	left: "←",
	right: "→",
	up: "↑",
	down: "↓"
};

var pcCharMap = {
	cmd: "Ctrl",
	control: "Ctrl",
	ctrl: "Ctrl",
	alt: "Alt",
	shift: "Shift",
	left: "←",
	right: "→",
	up: "↑",
	down: "↓"
};

var defaultOptions = {
	/**
  * Automatically parse movie definition from textarea content. Setting
  * this property to <code>false</code> assumes that user wants to
  * explicitly provide movie data: initial value, scenario etc.
  */
	parse: true,

	/**
  * String or regexp used to separate sections of movie definition, e.g.
  * default value, scenario and editor options
  */
	sectionSeparator: "@@@",

	/** Regular expression to extract outline from scenario line */
	outlineSeparator: /\s+:::\s+(.+)$/,

	/** Strip parentheses from prettyfied keyboard shortcut definition */
	stripParentheses: false
};exports.defaultOptions = defaultOptions;

function movie(target) {
	var movieOptions = arguments[1] === undefined ? {} : arguments[1];
	var editorOptions = arguments[2] === undefined ? {} : arguments[2];

	setupCodeMirror();

	if (typeof target === "string") {
		target = document.getElementById(target);
	}

	var targetIsTextarea = target.nodeName.toLowerCase() === "textarea";

	movieOptions = extend({}, defaultOptions, movieOptions);
	editorOptions = extend({
		theme: "espresso",
		mode: "text/html",
		indentWithTabs: true,
		tabSize: 4,
		lineNumbers: true,
		preventCursorMovement: true
	}, editorOptions);

	var initialValue = editorOptions.value || (targetIsTextarea ? target.value : target.getValue()) || "";

	if (targetIsTextarea && movieOptions.parse) {
		extend(movieOptions, parseMovieDefinition(initialValue, movieOptions));
		initialValue = movieOptions.value;
		if (movieOptions.editorOptions) {
			extend(editorOptions, movieOptions.editorOptions);
		}

		// read CM options from given textarea
		var cmAttr = /^data\-cm\-(.+)$/i;
		toArray(target.attributes).forEach(function (attr) {
			var m = attr.name.match(cmAttr);
			if (m) {
				editorOptions[m[1]] = attr.value;
			}
		});
	}

	// normalize line endings
	initialValue = initialValue.replace(/\r?\n/g, "\n");

	// locate initial caret position from | symbol
	var initialPos = initialValue.indexOf("|");

	if (targetIsTextarea) {
		target.value = editorOptions.value = initialValue = initialValue.replace(/\|/g, "");
	}

	// create editor instance if needed
	var editor = targetIsTextarea ? CodeMirror.fromTextArea(target, editorOptions) : target;

	if (initialPos != -1) {
		editor.setCursor(editor.posFromIndex(initialPos));
	}

	// save initial data so we can revert to it later
	editor.__initial = {
		content: initialValue,
		pos: editor.getCursor(true)
	};

	var wrapper = editor.getWrapperElement();

	// adjust height, if required
	if (editorOptions.height) {
		wrapper.style.height = editorOptions.height + "px";
	}

	wrapper.className += " CodeMirror-movie";

	return new Scenario(movieOptions.scenario, editor);
}

function readLines(text) {
	// IE fails to split string by regexp,
	// need to normalize newlines first
	var nl = "\n";
	var lines = (text || "").replace(/\r\n/g, nl).replace(/\n\r/g, nl).replace(/\r/g, nl).split(nl);

	return lines.filter(Boolean);
}

function unescape(text) {
	var replacements = {
		"&lt;": "<",
		"&gt;": ">",
		"&amp;": "&"
	};

	return text.replace(/&(lt|gt|amp);/g, function (str, p1) {
		return replacements[str] || str;
	});
}

/**
 * Extracts initial content, scenario and outline from given string
 * @param {String} text
 * @param {Object} options
 */
function parseMovieDefinition(text) {
	var options = arguments[1] === undefined ? {} : arguments[1];

	options = extend({}, defaultOptions, options || {});
	var parts = text.split(options.sectionSeparator);

	// parse scenario
	var reDef = /^(\w+)\s*:\s*(.+)$/;
	var scenario = [];
	var editorOptions = {};

	var skipComment = function (line) {
		return line.charAt(0) !== "#";
	};

	// read movie definition
	readLines(parts[1]).filter(skipComment).forEach(function (line) {
		// do we have outline definition here?
		line = line.replace(options.outlineSeparator, "");

		var sd = line.match(reDef);
		if (!sd) {
			return scenario.push(line.trim());
		}

		if (sd[2].charAt(0) === "{") {
			var obj = {};
			obj[sd[1]] = parseJSON(unescape(sd[2]));
			return scenario.push(obj);
		}

		scenario.push(sd[1] + ":" + unescape(sd[2]));
	});

	// read editor options
	if (parts[2]) {
		readLines(parts[2]).filter(skipComment).forEach(function (line) {
			var sd = line.match(reDef);
			if (sd) {
				editorOptions[sd[1]] = sd[2];
			}
		});
	}

	return {
		value: unescape(parts[0].trim()),
		scenario: scenario,
		editorOptions: editorOptions
	};
}

function setupCodeMirror() {
	if (typeof CodeMirror === "undefined" || "preventCursorMovement" in CodeMirror.defaults) {
		return;
	}

	CodeMirror.defineOption("preventCursorMovement", false, function (cm) {
		var handler = function (cm, event) {
			return cm.getOption("readOnly") && event.preventDefault();
		};
		cm.on("keydown", handler);
		cm.on("mousedown", handler);
	});
}

if (typeof CodeMirror !== "undefined") {
	CodeMirror.movie = movie;
}

},{"./scenario":"F:\\Projects\\codemirror-movie\\lib\\scenario.js","./utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js"}],"F:\\Projects\\codemirror-movie\\lib\\scenario.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
	value: true
});
"use strict";

var commonActions = _interopRequire(require("./actions"));

var prompt = require("./widgets/prompt").actions;

var tooltip = require("./widgets/tooltip").actions;

var extend = require("./utils").extend;

var actionsDefinition = extend({}, commonActions, prompt, tooltip);

var STATE_IDLE = "idle";
var STATE_PLAY = "play";
var STATE_PAUSE = "pause";

// Regular expression used to split event strings
var eventSplitter = /\s+/;

var defaultOptions = {
	beforeDelay: 1000,
	afterDelay: 1000
};

exports.defaultOptions = defaultOptions;
/**
 * @param {Object} actions Actions scenario
 * @param {Object} data Initial content (<code>String</code>) or editor
 * instance (<code>CodeMirror</code>)
 */

var Scenario = (function () {
	function Scenario(actions, data) {
		_classCallCheck(this, Scenario);

		this._actions = actions;
		this._actionIx = -1;
		this._editor = null;
		this._state = STATE_IDLE;
		this._timerQueue = [];
		this._timer = null;

		if (data && "getValue" in data) {
			this._editor = data;
		}

		var ed = this._editor;
		if (ed && !ed.__initial) {
			ed.__initial = {
				content: ed.getValue(),
				pos: ed.getCursor(true)
			};
		}
	}

	_createClass(Scenario, {
		_setup: {
			value: function _setup(editor) {
				if (!editor && this._editor) {
					editor = this._editor;
				}

				editor.execCommand("revert");
				return editor;
			}
		},
		play: {

			/**
    * Play current scenario
    * @param {CodeMirror} editor Editor instance where on which scenario
    * should be played
    * @memberOf Scenario
    */

			value: function play(editor) {
				if (this._state === STATE_PLAY) {
					// already playing
					return;
				}

				if (this._state === STATE_PAUSE) {
					// revert from paused state
					this._editor = editor || this._editor;
					this._editor.focus();
					var timerObj = null;
					while (timerObj = this._timerQueue.shift()) {
						requestTimer(timerObj.fn, timerObj.delay);
					}

					this._state = STATE_PLAY;
					this.trigger("resume");
					return;
				}

				this._editor = editor = this._setup(editor);
				this._editor.focus();

				this._timer = this.requestTimer.bind(this);
				this._actionIx = -1;

				this._state = STATE_PLAY;
				this._editor.setOption("readOnly", true);
				this.trigger("play");
				this._timer(this.next.bind(this), defaultOptions.beforeDelay);
			}
		},
		back: {
			value: function back() {
				this._actionIx = this._actionIx - 1;
				this.trigger("action", this._actionIx);

				var action = parseActionCall(this._actions[this._actionIx]);

				if (action.name in actionsDefinition) {
					var actionParams = {
						options: action.options,
						editor: this._editor,
						timer: this._timer,
						next: this.next.bind(this),
						back: this.back.bind(this),
						isFirstAction: this._actionIx <= 0,
						isLastAction: this._actionIx >= this._actions.length - 1 };

					actionsDefinition[action.name].call(this, actionParams);
				} else {
					throw new Error("No such action: " + action.name);
				}
			}
		},
		next: {
			value: function next() {
				var _this = this;

				if (this._actionIx >= this._actions.length - 1) {
					return this._timer(function () {
						_this.stop();
					}, defaultOptions.afterDelay);
				}

				this._actionIx = this._actionIx + 1;

				var action = parseActionCall(this._actions[this._actionIx]);
				var isLastAction = this._actionIx >= this._actions.length - 1;

				if (action.name in actionsDefinition) {
					var actionParams = {
						options: action.options,
						editor: this._editor,
						timer: this._timer,
						next: this.next.bind(this),
						back: this.back.bind(this),
						isFirstAction: this._actionIx <= 0,
						isLastAction: isLastAction };

					actionsDefinition[action.name].call(this, actionParams);
				} else {
					throw new Error("No such action: " + action.name);
				}
			}
		},
		pause: {

			/**
    * Pause current scenario playback. It can be restored with
    * <code>play()</code> method call
    */

			value: function pause() {
				this._state = STATE_PAUSE;
				this.trigger("pause");
			}
		},
		stop: {

			/**
    * Stops playback of current scenario
    */

			value: function stop() {
				if (this._state !== STATE_IDLE) {
					this._state = STATE_IDLE;
					this._timerQueue.length = 0;
					this._actionIx = -1;
					this._editor.setOption("readOnly", false);
					this.trigger("stop");
				}
			}
		},
		state: {

			/**
    * Returns current playback state
    * @return {String}
    */

			get: function () {
				return this._state;
			}
		},
		toggle: {

			/**
    * Toggle playback of movie scenario
    */

			value: function toggle() {
				if (this._state === STATE_PLAY) {
					this.pause();
				} else {
					this.play();
				}
			}
		},
		requestTimer: {
			value: (function (_requestTimer) {
				var _requestTimerWrapper = function requestTimer(_x, _x2) {
					return _requestTimer.apply(this, arguments);
				};

				_requestTimerWrapper.toString = function () {
					return _requestTimer.toString();
				};

				return _requestTimerWrapper;
			})(function (fn, delay) {
				if (this._state !== STATE_PLAY) {
					// save function call into a queue till next 'play()' call
					this._timerQueue.push({
						fn: fn,
						delay: delay
					});
				} else {
					return requestTimer(fn, delay);
				}
			})
		},
		on: {

			// borrowed from Backbone
			/**
    * Bind one or more space separated events, `events`, to a `callback`
    * function. Passing `"all"` will bind the callback to all events fired.
    * @param {String} events
    * @param {Function} callback
    * @param {Object} context
    * @memberOf eventDispatcher
    */

			value: function on(events, callback, context) {
				var calls, event, node, tail, list;
				if (!callback) {
					return this;
				}

				events = events.split(eventSplitter);
				calls = this._callbacks || (this._callbacks = {});

				// Create an immutable callback list, allowing traversal during
				// modification.  The tail is an empty object that will always be used
				// as the next node.
				while (event = events.shift()) {
					list = calls[event];
					node = list ? list.tail : {};
					node.next = tail = {};
					node.context = context;
					node.callback = callback;
					calls[event] = {
						tail: tail,
						next: list ? list.next : node
					};
				}

				return this;
			}
		},
		off: {

			/**
    * Remove one or many callbacks. If `context` is null, removes all
    * callbacks with that function. If `callback` is null, removes all
    * callbacks for the event. If `events` is null, removes all bound
    * callbacks for all events.
    * @param {String} events
    * @param {Function} callback
    * @param {Object} context
    */

			value: function off(events, callback, context) {
				var event, calls, node, tail, cb, ctx;

				// No events, or removing *all* events.
				if (!(calls = this._callbacks)) {
					return;
				}

				if (!(events || callback || context)) {
					delete this._callbacks;
					return this;
				}

				// Loop through the listed events and contexts, splicing them out of the
				// linked list of callbacks if appropriate.
				events = events ? events.split(eventSplitter) : Object.keys(calls);
				while (event = events.shift()) {
					node = calls[event];
					delete calls[event];
					if (!node || !(callback || context)) {
						continue;
					}

					// Create a new list, omitting the indicated callbacks.
					tail = node.tail;
					while ((node = node.next) !== tail) {
						cb = node.callback;
						ctx = node.context;
						if (callback && cb !== callback || context && ctx !== context) {
							this.on(event, cb, ctx);
						}
					}
				}

				return this;
			}
		},
		trigger: {

			/**
    * Trigger one or many events, firing all bound callbacks. Callbacks are
    * passed the same arguments as `trigger` is, apart from the event name
    * (unless you're listening on `"all"`, which will cause your callback
    * to receive the true name of the event as the first argument).
    * @param {String} events
    */

			value: function trigger(events) {
				for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					rest[_key - 1] = arguments[_key];
				}

				var event, node, calls, tail, args, all;
				if (!(calls = this._callbacks)) {
					return this;
				}

				all = calls.all;
				events = events.split(eventSplitter);

				// For each event, walk through the linked list of callbacks twice,
				// first to trigger the event, then to trigger any `"all"` callbacks.
				while (event = events.shift()) {
					if (node = calls[event]) {
						tail = node.tail;
						while ((node = node.next) !== tail) {
							node.callback.apply(node.context || this, rest);
						}
					}
					if (node = all) {
						tail = node.tail;
						args = [event].concat(rest);
						while ((node = node.next) !== tail) {
							node.callback.apply(node.context || this, args);
						}
					}
				}

				return this;
			}
		}
	});

	return Scenario;
})();

exports["default"] = Scenario;

/**
 * Parses action call from string
 * @param {String} data
 * @returns {Object}
 */
function parseActionCall(data) {
	if (typeof data === "string") {
		var parts = data.split(":");
		return {
			name: parts.shift(),
			options: parts.join(":")
		};
	} else {
		var name = Object.keys(data)[0];
		return {
			name: name,
			options: data[name]
		};
	}
}

function requestTimer(fn, delay) {
	if (!delay) {
		fn();
	} else {
		return setTimeout(fn, delay);
	}
}

},{"./actions":"F:\\Projects\\codemirror-movie\\lib\\actions.js","./utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js","./widgets/prompt":"F:\\Projects\\codemirror-movie\\lib\\widgets\\prompt.js","./widgets/tooltip":"F:\\Projects\\codemirror-movie\\lib\\widgets\\tooltip.js"}],"F:\\Projects\\codemirror-movie\\lib\\utils.js":[function(require,module,exports){
"use strict";

exports.extend = extend;
exports.toArray = toArray;

/**
 * Returns prefixed (if required) CSS property name
 * @param  {String} prop
 * @return {String}
 */
exports.prefixed = prefixed;
exports.posObj = posObj;
exports.getCursor = getCursor;

/**
 * Helper function that produces <code>{line, ch}</code> object from
 * passed argument
 * @param {Object} pos
 * @param {CodeMirror} editor
 * @returns {Object}
 */
exports.makePos = makePos;
exports.template = template;
exports.find = find;

/**
 * Relaxed JSON parser.
 * @param {String} text
 * @returns {Object} 
 */
exports.parseJSON = parseJSON;
Object.defineProperty(exports, "__esModule", {
	value: true
});
var propCache = {};

// detect CSS 3D Transforms for smoother animations
var has3d = (function () {
	var el = document.createElement("div");
	var cssTransform = prefixed("transform");
	if (cssTransform) {
		el.style[cssTransform] = "translateZ(0)";
		return /translatez/i.test(el.style[cssTransform]);
	}

	return false;
})();

exports.has3d = has3d;

function extend(obj) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	args.forEach(function (a) {
		if (typeof a === "object") {
			Object.keys(a).forEach(function (key) {
				return obj[key] = a[key];
			});
		}
	});
	return obj;
}

function toArray(obj) {
	var ix = arguments[1] === undefined ? 0 : arguments[1];

	return Array.prototype.slice.call(obj, ix);
}

function prefixed(prop) {
	if (prop in propCache) {
		return propCache[prop];
	}

	var el = document.createElement("div");
	var style = el.style;

	var prefixes = ["o", "ms", "moz", "webkit"];
	var props = [prop];
	var capitalize = function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	};

	prop = prop.replace(/\-([a-z])/g, function (str, ch) {
		return ch.toUpperCase();
	});

	var capProp = capitalize(prop);
	prefixes.forEach(function (prefix) {
		props.push(prefix + capProp, capitalize(prefix) + capProp);
	});

	for (var i = 0, il = props.length; i < il; i++) {
		if (props[i] in style) {
			return propCache[prop] = props[i];
		}
	}

	return propCache[prop] = null;
}

function posObj(obj) {
	return {
		line: obj.line,
		ch: obj.ch
	};
}

function getCursor(editor) {
	var start = arguments[1] === undefined ? "from" : arguments[1];

	return posObj(editor.getCursor(start));
}

function makePos(pos, editor) {
	if (pos === "caret") {
		return getCursor(editor);
	}

	if (typeof pos === "string") {
		if (~pos.indexOf(":")) {
			var parts = pos.split(":");
			return {
				line: +parts[0],
				ch: +parts[1]
			};
		}

		pos = +pos;
	}

	if (typeof pos === "number") {
		return posObj(editor.posFromIndex(pos));
	}

	return posObj(pos);
}

function template(tmpl, data) {
	var fn = function (data) {
		return tmpl.replace(/<%([-=])?\s*([\w\-]+)\s*%>/g, function (str, op, key) {
			return data[key.trim()];
		});
	};
	return data ? fn(data) : fn;
}

function find(arr, iter) {
	var found;
	arr.some(function (item, i, arr) {
		if (iter(item, i, arr)) {
			return found = item;
		}
	});
	return found;
}

function parseJSON(text) {
	try {
		return new Function("return " + text)();
	} catch (e) {
		return {};
	}
}

},{}],"F:\\Projects\\codemirror-movie\\lib\\vendor\\tween.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports["default"] = tween;

/**
 * Get or set default value
 * @param  {String} name
 * @param  {Object} value
 * @return {Object}
 */
exports.defaults = defaults;

/**
 * Returns all active animation objects.
 * For debugging mostly
 * @return {Array}
 */
exports._all = _all;
exports.stop = stop;
Object.defineProperty(exports, "__esModule", {
	value: true
});
var global = window;
var time = Date.now ? function () {
	return Date.now();
} : function () {
	return +new Date();
};

var indexOf = "indexOf" in Array.prototype ? function (array, value) {
	return array.indexOf(value);
} : function (array, value) {
	for (var i = 0, il = array.length; i < il; i++) {
		if (array[i] === value) {
			return i;
		}
	}

	return -1;
};

function extend(obj) {
	for (var i = 1, il = arguments.length, source; i < il; i++) {
		source = arguments[i];
		if (source) {
			for (var prop in source) {
				obj[prop] = source[prop];
			}
		}
	}

	return obj;
}

/**
 * requestAnimationFrame polyfill by Erik Möller
 * fixes from Paul Irish and Tino Zijdel
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */
(function () {
	var lastTime = 0;
	var vendors = ["ms", "moz", "webkit", "o"];
	for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
		global.requestAnimationFrame = global[vendors[x] + "RequestAnimationFrame"];
		global.cancelAnimationFrame = global[vendors[x] + "CancelAnimationFrame"] || global[vendors[x] + "CancelRequestAnimationFrame"];
	}

	if (!global.requestAnimationFrame) global.requestAnimationFrame = function (callback, element) {
		var currTime = time();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = global.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!global.cancelAnimationFrame) global.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
})();

var dummyFn = function dummyFn() {};
var anims = [];
var idCounter = 0;

var defaults = {
	duration: 500, // ms
	delay: 0,
	easing: "linear",
	start: dummyFn,
	step: dummyFn,
	complete: dummyFn,
	autostart: true,
	reverse: false
};

var easings = {
	linear: function linear(t, b, c, d) {
		return c * t / d + b;
	},
	inQuad: function inQuad(t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	outQuad: function outQuad(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	inOutQuad: function inOutQuad(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}return -c / 2 * (--t * (t - 2) - 1) + b;
	},
	inCubic: function inCubic(t, b, c, d) {
		return c * (t /= d) * t * t + b;
	},
	outCubic: function outCubic(t, b, c, d) {
		return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	inOutCubic: function inOutCubic(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t + b;
		}return c / 2 * ((t -= 2) * t * t + 2) + b;
	},
	inExpo: function inExpo(t, b, c, d) {
		return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
	},
	outExpo: function outExpo(t, b, c, d) {
		return t == d ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
	},
	inOutExpo: function inOutExpo(t, b, c, d) {
		if (t == 0) {
			return b;
		}if (t == d) {
			return b + c;
		}if ((t /= d / 2) < 1) {
			return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
		}return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	inElastic: function inElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) {
			return b;
		}if ((t /= d) == 1) {
			return b + c;
		}if (!p) p = d * 0.3;
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	outElastic: function outElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) {
			return b;
		}if ((t /= d) == 1) {
			return b + c;
		}if (!p) p = d * 0.3;
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	inOutElastic: function inOutElastic(t, b, c, d, a, p) {
		var s;
		if (t == 0) {
			return b;
		}if ((t /= d / 2) == 2) {
			return b + c;
		}if (!p) p = d * (0.3 * 1.5);
		if (!a || a < Math.abs(c)) {
			a = c;s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(c / a);
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	},
	inBack: function inBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	outBack: function outBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	inOutBack: function inOutBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
		}return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
	},
	inBounce: function inBounce(t, b, c, d) {
		return c - this.outBounce(t, d - t, 0, c, d) + b;
	},
	outBounce: function outBounce(t, b, c, d) {
		if ((t /= d) < 1 / 2.75) {
			return c * (7.5625 * t * t) + b;
		} else if (t < 2 / 2.75) {
			return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
		} else if (t < 2.5 / 2.75) {
			return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
		} else {
			return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
		}
	},
	inOutBounce: function inOutBounce(t, b, c, d) {
		if (t < d / 2) {
			return this.inBounce(t * 2, 0, c, d) * 0.5 + b;
		}return this.outBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	},
	outHard: function outHard(t, b, c, d) {
		var ts = (t /= d) * t;
		var tc = ts * t;
		return b + c * (1.75 * tc * ts + -7.4475 * ts * ts + 12.995 * tc + -11.595 * ts + 5.2975 * t);
	}
};

exports.easings = easings;
function mainLoop() {
	if (!anims.length) {
		// no animations left, stop polling
		return;
	}

	var now = time();
	var filtered = [],
	    tween,
	    opt;

	// do not use Array.filter() of _.filter() function
	// since tween’s callbacks can add new animations
	// in runtime. In this case, filter function will loose
	// newly created animation
	for (var i = 0; i < anims.length; i++) {
		tween = anims[i];

		if (!tween.animating) {
			continue;
		}

		opt = tween.options;

		if (tween.startTime > now) {
			filtered.push(tween);
			continue;
		}

		if (tween.infinite) {
			// opt.step.call(tween, 0);
			opt.step(0, tween);
			filtered.push(tween);
		} else if (tween.pos === 1 || tween.endTime <= now) {
			tween.pos = 1;
			// opt.step.call(tween, opt.reverse ? 0 : 1);
			opt.step(opt.reverse ? 0 : 1, tween);
			tween.stop();
		} else {
			tween.pos = opt.easing(now - tween.startTime, 0, 1, opt.duration);
			// opt.step.call(tween, opt.reverse ? 1 - tween.pos : tween.pos);
			opt.step(opt.reverse ? 1 - tween.pos : tween.pos, tween);
			filtered.push(tween);
		}
	}

	anims = filtered;

	if (anims.length) {
		requestAnimationFrame(mainLoop);
	}
}

function addToQueue(tween) {
	if (indexOf(anims, tween) == -1) {
		anims.push(tween);
		if (anims.length == 1) {
			mainLoop();
		}
	}
}

var Tween = exports.Tween = (function () {
	function Tween(options) {
		_classCallCheck(this, Tween);

		this.options = extend({}, defaults, options);

		var e = this.options.easing;
		if (typeof e == "string") {
			if (!easings[e]) throw "Unknown \"" + e + "\" easing function";
			this.options.easing = easings[e];
		}

		if (typeof this.options.easing != "function") throw "Easing should be a function";

		this._id = "tw" + idCounter++;

		if (this.options.autostart) {
			this.start();
		}
	}

	_createClass(Tween, {
		start: {

			/**
    * Start animation from the beginning
    */

			value: function start() {
				if (!this.animating) {
					this.pos = 0;
					this.startTime = time() + (this.options.delay || 0);
					this.infinite = this.options.duration === "infinite";
					this.endTime = this.infinite ? 0 : this.startTime + this.options.duration;
					this.animating = true;
					this.options.start(this);
					addToQueue(this);
				}

				return this;
			}
		},
		stop: {

			/**
    * Stop animation
    */

			value: function stop() {
				if (this.animating) {
					this.animating = false;
					if (this.options.complete) {
						this.options.complete(this);
					}
				}
				return this;
			}
		},
		toggle: {
			value: function toggle() {
				if (this.animating) {
					this.stop();
				} else {
					this.start();
				}
			}
		}
	});

	return Tween;
})();

function tween(options) {
	return new Tween(options);
}

function defaults(name, value) {
	if (typeof value != "undefined") {
		defaults[name] = value;
	}

	return defaults[name];
}

function _all() {
	return anims;
}

function stop() {
	for (var i = 0; i < anims.length; i++) {
		anims[i].stop();
	}

	anims.length = 0;
}

;

},{}],"F:\\Projects\\codemirror-movie\\lib\\widgets\\prompt.js":[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

exports.show = show;
exports.hide = hide;
Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Shows fake prompt dialog with interactive value typing
 */
"use strict";

var tween = _interopRequire(require("../vendor/tween"));

var _utils = require("../utils");

var extend = _utils.extend;
var template = _utils.template;
var has3d = _utils.has3d;
var prefixed = _utils.prefixed;

var dom = _interopRequireWildcard(require("../dom"));

var dialogInstance = null;
var bgInstance = null;
var lastTween = null;

var actions = {
	prompt: function prompt(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			title: "Enter something",
			delay: 80, // delay between character typing
			typeDelay: 1000, // time to wait before typing text
			hideDelay: 2000 // time to wait before hiding prompt dialog
		}, wrap("text", options));

		show(options.title, editor.getWrapperElement(), function (dialog) {
			timer(function () {
				typeText(dialog.querySelector(".CodeMirror-prompt__input"), options, timer, function () {
					timer(function () {
						hide(next);
					}, options.hideDelay);
				});
			}, options.typeDelay);
		});
	}
};

exports.actions = actions;

function show(text, target, callback) {
	hide();
	dialogInstance = dom.toDOM("<div class=\"CodeMirror-prompt\">\n\t\t<div class=\"CodeMirror-prompt__title\">" + text + "</div>\n\t\t<input type=\"text\" name=\"prompt\" class=\"CodeMirror-prompt__input\" readonly=\"readonly\" />\n\t\t</div>");
	bgInstance = dom.toDOM("<div class=\"CodeMirror-prompt__shade\"></div>");

	target.appendChild(dialogInstance);
	target.appendChild(bgInstance);

	animateShow(dialogInstance, bgInstance, { complete: callback });
}

function hide(callback) {
	if (dialogInstance) {
		if (lastTween) {
			lastTween.stop();
			lastTween = null;
		}
		animateHide(dialogInstance, bgInstance, { complete: callback });
		dialogInstance = bgInstance = null;
	} else if (callback) {
		callback();
	}
}

/**
 * @param {Element} dialog
 * @param {Element} bg
 * @param {Object} options
 */
function animateShow(dialog, bg) {
	var options = arguments[2] === undefined ? {} : arguments[2];

	var cssTransform = prefixed("transform");
	var dialogStyle = dialog.style;
	var bgStyle = bg.style;
	var height = dialog.offsetHeight;
	var tmpl = template(has3d ? "translate3d(0, <%= pos %>, 0)" : "translate(0, <%= pos %>)");

	bgStyle.opacity = 0;
	tween({
		duration: 200,
		step: function step(pos) {
			bgStyle.opacity = pos;
		}
	});

	dialogStyle[cssTransform] = tmpl({ pos: -height });

	return lastTween = tween({
		duration: 400,
		easing: "outCubic",
		step: function step(pos) {
			dialogStyle[cssTransform] = tmpl({ pos: -height * (1 - pos) + "px" });
		},
		complete: function complete() {
			lastTween = null;
			options.complete && options.complete(dialog, bg);
		}
	});
}

/**
 * @param {Element} dialog
 * @param {Element} bg
 * @param {Object} options
 */
function animateHide(dialog, bg, options) {
	var dialogStyle = dialog.style;
	var bgStyle = bg.style;
	var height = dialog.offsetHeight;
	var cssTransform = prefixed("transform");
	var tmpl = template(has3d ? "translate3d(0, <%= pos %>, 0)" : "translate(0, <%= pos %>)");

	return tween({
		duration: 200,
		step: function step(pos) {
			dialogStyle[cssTransform] = tmpl({ pos: -height * pos + "px" });
			bgStyle.opacity = 1 - pos;
		},
		complete: function complete() {
			dom.remove([dialog, bg]);
			options.complete && options.complete(dialog, bg);
		}
	});
}

function typeText(target, options, timer, next) {
	var chars = options.text.split("");
	timer(function perform() {
		target.value += chars.shift();
		if (chars.length) {
			timer(perform, options.delay);
		} else {
			next();
		}
	}, options.delay);
}

function wrap(key, value) {
	return typeof value === "object" ? value : _defineProperty({}, key, value);
}

},{"../dom":"F:\\Projects\\codemirror-movie\\lib\\dom.js","../utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js","../vendor/tween":"F:\\Projects\\codemirror-movie\\lib\\vendor\\tween.js"}],"F:\\Projects\\codemirror-movie\\lib\\widgets\\tooltip.js":[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

exports.show = show;
exports.hide = hide;
Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Extension that allows authors to display context tooltips bound to specific
 * positions
 */
"use strict";

var tween = _interopRequire(require("../vendor/tween"));

var _utils = require("../utils");

var extend = _utils.extend;
var prefixed = _utils.prefixed;
var makePos = _utils.makePos;
var has3d = _utils.has3d;

var dom = _interopRequireWildcard(require("../dom"));

var instance = null;
var lastTween = null;

var alignDefaults = {
	/** CSS selector for getting popup tail */
	tailClass: "CodeMirror-tooltip__tail",

	/** Class name for switching tail/popup position relative to target point */
	belowClass: "CodeMirror-tooltip_below",

	/** Min distance between popup and viewport */
	popupMargin: 5,

	/** Min distance between popup left/right edge and its tail */
	tailMargin: 11
};

exports.alignDefaults = alignDefaults;
var actions = {
	/**
  * Shows tooltip with given text, wait for `options.wait`
  * milliseconds then hides tooltip
  */
	tooltip: function tooltip(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		options = extend({
			wait: 4000, // time to wait before hiding tooltip
			pos: "caret" // position where tooltip should point to
		}, wrap("text", options));

		var text = options.text;

		var pos = resolvePosition(options.pos, editor);
		var callback = function () {
			timer(function () {
				hide(function () {
					return timer(next);
				});
			}, options.wait);
		};

		show({ text: text, pos: pos, callback: callback });
	},

	/**
  * Shows tooltip with specified text. This tooltip should be explicitly
  * hidden with `hideTooltip` action
  */
	showTooltip: function showTooltip(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;

		options = extend({
			pos: "caret" // position where tooltip should point to
		}, wrap("text", options));

		var text = options.text;

		var pos = resolvePosition(options.pos, editor);

		show({ text: text, pos: pos });
		next();
	},

	showControlledTooltip: function showControlledTooltip(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var back = _ref.back;
		var next = _ref.next;
		var isFirstAction = _ref.isFirstAction;
		var isLastAction = _ref.isLastAction;

		options = extend({
			pos: "caret" // position where tooltip should point to
		}, wrap("text", options));

		var text = options.text;

		var pos = resolvePosition(options.pos, editor);
		var callback = function () {
			if (!isFirstAction) {
				var backButton = document.getElementById("js-tooltip-controls-back");
				backButton.removeAttribute("disabled");
				backButton.addEventListener("click", back);
			}

			if (!isLastAction) {
				var nextButton = document.getElementById("js-tooltip-controls-next");
				nextButton.removeAttribute("disabled");
				nextButton.addEventListener("click", next);
			}

			if (isLastAction) {
				var finishButton = document.getElementById("js-tooltip-controls-finish");
				finishButton.removeAttribute("disabled");
				finishButton.addEventListener("click", function () {
					hide();
					next();
				});
			}
		};

		show({
			text: text,
			pos: pos,
			callback: callback,
			hasBackControl: !isFirstAction,
			hasNextControl: !isLastAction,
			hasFinishButton: isLastAction });
	},

	/**
  * Hides tooltip, previously shown by 'showTooltip' action
  */
	hideTooltip: function hideTooltip(_ref) {
		var options = _ref.options;
		var editor = _ref.editor;
		var next = _ref.next;
		var timer = _ref.timer;

		hide(next);
	}
};

exports.actions = actions;

function show(_ref) {
	var text = _ref.text;
	var pos = _ref.pos;
	var callback = _ref.callback;
	var _ref$hasBackControl = _ref.hasBackControl;
	var hasBackControl = _ref$hasBackControl === undefined ? false : _ref$hasBackControl;
	var _ref$hasNextControl = _ref.hasNextControl;
	var hasNextControl = _ref$hasNextControl === undefined ? false : _ref$hasNextControl;
	var _ref$hasFinishButton = _ref.hasFinishButton;
	var hasFinishButton = _ref$hasFinishButton === undefined ? false : _ref$hasFinishButton;

	hide();

	instance = dom.toDOM("<div class=\"CodeMirror-tooltip\">\n\t\t<div class=\"CodeMirror-tooltip__content\">" + text + "</div>\n\t\t<div class=\"CodeMirror-tooltip__controls\">\n\t\t\t" + (hasBackControl ? "<button id=\"js-tooltip-controls-back\" disabled>Back</button>" : "") + "\n\t\t\t" + (hasNextControl ? "<button id=\"js-tooltip-controls-next\" disabled>Next</button>" : "") + "\n\t\t\t" + (hasFinishButton ? "<button id=\"js-tooltip-controls-finish\" disabled>Finish</button>" : "") + "\n\t\t</div>\n\t\t<div class=\"CodeMirror-tooltip__tail\"></div>\n\t\t</div>");

	dom.css(instance, prefixed("transform"), "scale(0)");
	document.body.appendChild(instance);

	alignPopupWithTail(instance, { position: pos });
	animateShow(instance, { complete: callback });
}

function hide(callback) {
	if (instance) {
		if (lastTween) {
			lastTween.stop();
			lastTween = null;
		}
		animateHide(instance, { complete: callback });
		instance = null;
	} else if (callback) {
		callback();
	}
}

/**
 * Helper function that finds optimal position of tooltip popup on page
 * and aligns popup tail with this position
 * @param {Element} popup
 * @param {Object} options
 */
function alignPopupWithTail(popup) {
	var options = arguments[1] === undefined ? {} : arguments[1];

	options = extend({}, alignDefaults, options);

	dom.css(popup, {
		left: 0,
		top: 0
	});

	var tail = popup.querySelector("." + options.tailClass);

	var resultX = 0,
	    resultY = 0;
	var pos = options.position;
	var vp = dom.viewportRect();

	var width = popup.offsetWidth;
	var height = popup.offsetHeight;

	var isTop;

	// calculate horizontal position
	resultX = Math.min(vp.width - width - options.popupMargin, Math.max(options.popupMargin, pos.x - vp.left - width / 2));

	// calculate vertical position
	if (height + tail.offsetHeight + options.popupMargin + vp.top < pos.y) {
		// place above target position
		resultY = Math.max(0, pos.y - height - tail.offsetHeight);
		isTop = true;
	} else {
		// place below target position
		resultY = pos.y + tail.offsetHeight;
		isTop = false;
	}

	// calculate tail position
	var tailMinLeft = options.tailMargin;
	var tailMaxLeft = width - options.tailMargin;
	tail.style.left = Math.min(tailMaxLeft, Math.max(tailMinLeft, pos.x - resultX - vp.left)) + "px";

	dom.css(popup, {
		left: resultX,
		top: resultY
	});

	popup.classList.toggle(options.belowClass, !isTop);
}

/**
 * @param {jQuery} elem
 * @param {Object} options
 */
function animateShow(elem) {
	var options = arguments[1] === undefined ? {} : arguments[1];

	options = extend({}, alignDefaults, options);
	var cssOrigin = prefixed("transform-origin");
	var cssTransform = prefixed("transform");
	var style = elem.style;

	var tail = elem.querySelector("." + options.tailClass);
	var xOrigin = dom.css(tail, "left");
	var yOrigin = tail.offsetTop;
	if (elem.classList.contains(options.belowClass)) {
		yOrigin -= tail.offsetHeight;
	}

	yOrigin += "px";

	style[cssOrigin] = xOrigin + " " + yOrigin;
	var prefix = has3d ? "translateZ(0) " : "";

	return lastTween = tween({
		duration: 800,
		easing: "outElastic",
		step: function step(pos) {
			style[cssTransform] = prefix + "scale(" + pos + ")";
		},
		complete: function complete() {
			style[cssTransform] = "none";
			lastTween = null;
			options.complete && options.complete(elem);
		}
	});
}

/**
 * @param {jQuery} elem
 * @param {Object} options
 */
function animateHide(elem, options) {
	var style = elem.style;

	return tween({
		duration: 200,
		easing: "linear",
		step: function step(pos) {
			style.opacity = 1 - pos;
		},
		complete: function complete() {
			dom.remove(elem);
			options.complete && options.complete(elem);
		}
	});
}

/**
 * Resolves position where tooltip should point to
 * @param {Object} pos
 * @param {CodeMirror} editor
 * @returns {Object} Object with <code>x</code> and <code>y</code>
 * properties
 */
function resolvePosition(pos, editor) {
	if (pos === "caret") {
		// get absolute position of current caret position
		return sanitizeCaretPos(editor.cursorCoords(true));
	}

	if (typeof pos === "object") {
		if ("x" in pos && "y" in pos) {
			// passed absolute coordinates
			return pos;
		}

		if ("left" in pos && "top" in pos) {
			// passed absolute coordinates
			return sanitizeCaretPos(pos);
		}
	}

	pos = makePos(pos, editor);
	return sanitizeCaretPos(editor.charCoords(pos));
}

function sanitizeCaretPos(pos) {
	if ("left" in pos) {
		pos.x = pos.left;
	}

	if ("top" in pos) {
		pos.y = pos.top;
	}

	return pos;
}

function wrap(key, value) {
	return typeof value === "object" ? value : _defineProperty({}, key, value);
}

},{"../dom":"F:\\Projects\\codemirror-movie\\lib\\dom.js","../utils":"F:\\Projects\\codemirror-movie\\lib\\utils.js","../vendor/tween":"F:\\Projects\\codemirror-movie\\lib\\vendor\\tween.js"}]},{},["F:\\Projects\\codemirror-movie\\lib\\movie.js"])("F:\\Projects\\codemirror-movie\\lib\\movie.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6L1Byb2plY3RzL2NvZGVtaXJyb3ItbW92aWUvbGliL2FjdGlvbnMuanMiLCJGOi9Qcm9qZWN0cy9jb2RlbWlycm9yLW1vdmllL2xpYi9kb20uanMiLCJGOi9Qcm9qZWN0cy9jb2RlbWlycm9yLW1vdmllL2xpYi9tb3ZpZS5qcyIsIkY6L1Byb2plY3RzL2NvZGVtaXJyb3ItbW92aWUvbGliL3NjZW5hcmlvLmpzIiwiRjovUHJvamVjdHMvY29kZW1pcnJvci1tb3ZpZS9saWIvdXRpbHMuanMiLCJGOi9Qcm9qZWN0cy9jb2RlbWlycm9yLW1vdmllL2xpYi92ZW5kb3IvdHdlZW4uanMiLCJGOi9Qcm9qZWN0cy9jb2RlbWlycm9yLW1vdmllL2xpYi93aWRnZXRzL3Byb21wdC5qcyIsIkY6L1Byb2plY3RzL2NvZGVtaXJyb3ItbW92aWUvbGliL3dpZGdldHMvdG9vbHRpcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7cUJDQXlDLFNBQVM7O0lBQTFDLE1BQU0sVUFBTixNQUFNO0lBQUUsT0FBTyxVQUFQLE9BQU87SUFBRSxTQUFTLFVBQVQsU0FBUzs7QUFFbEMsSUFBSSxPQUFPLEdBQUc7Ozs7Ozs7Ozs7OztBQVliLEtBQUksRUFBRSxvQkFBMkM7TUFBaEMsT0FBTyxRQUFQLE9BQU87TUFBRSxNQUFNLFFBQU4sTUFBTTtNQUFFLElBQUksUUFBSixJQUFJO01BQUUsS0FBSyxRQUFMLEtBQUs7O0FBQzVDLFNBQU8sR0FBRyxNQUFNLENBQUM7QUFDaEIsT0FBSSxFQUFFLEVBQUU7QUFDUixRQUFLLEVBQUUsRUFBRTtBQUNULE1BQUcsRUFBRSxJQUFJO0FBQUEsR0FDVCxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsTUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDbEIsU0FBTSxJQUFJLEtBQUssQ0FBQyxzQ0FB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QyxHQUFDLENBQUMsQ0FBQSxHQUFJLENBQUM7QUFBRSxVQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQUEsQUFDdEMsT0FBTyxDQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQSxHQUFFLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDLENBQUM7RUFDaEM7QUFDRCxPQUFNLEVBQUUsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzVCLFNBQU0sQUFBQyxDQUFDLElBQUUsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0VBQ2xFO0FBQ0QsUUFBTyxFQUFFLGlCQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUM3QixTQUFNLEFBQUMsQ0FBQyxJQUFFLENBQUMsR0FBSSxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLElBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEU7QUFDRCxVQUFTLEVBQUUsbUJBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQy9CLE1BQUcsQ0FBQyxJQUFFLENBQUM7QUFBRSxVQUFPLENBQUMsQ0FBQztHQUFBLEFBQ2xCLElBQUcsQ0FBQyxJQUFFLENBQUM7QUFBRSxVQUFPLENBQUMsR0FBQyxDQUFDLENBQUM7R0FBQSxBQUNwQixJQUFHLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUEsR0FBSSxDQUFDO0FBQUUsVUFBTyxDQUFDLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO0dBQUEsQUFDeEUsT0FBTyxDQUFDLEdBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkQ7QUFDRCxVQUFTLEVBQUUsbUJBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDckMsTUFBSSxDQUFDLENBQUM7QUFDTixNQUFHLENBQUMsSUFBRSxDQUFDO0FBQUUsVUFBTyxDQUFDLENBQUM7R0FBQSxBQUFFLElBQUcsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFBLElBQUcsQ0FBQztBQUFFLFVBQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQztHQUFBLEFBQUUsSUFBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLEdBQUUsQ0FBQztBQUM3RCxNQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQUUsSUFBQyxHQUFDLENBQUMsQ0FBQyxBQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO0dBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRixTQUFPLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxJQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFBLEFBQUMsR0FBQyxDQUFDLENBQUUsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3pFO0FBQ0QsV0FBVSxFQUFFLG9CQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RDLE1BQUksQ0FBQyxDQUFDO0FBQ04sTUFBRyxDQUFDLElBQUUsQ0FBQztBQUFFLFVBQU8sQ0FBQyxDQUFDO0dBQUEsQUFBRSxJQUFHLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQSxJQUFHLENBQUM7QUFBRSxVQUFPLENBQUMsR0FBQyxDQUFDLENBQUM7R0FBQSxBQUFFLElBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxHQUFFLENBQUM7QUFDN0QsTUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUFFLElBQUMsR0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztHQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxBQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEYsU0FBTyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLElBQUcsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQUFBQyxHQUFDLENBQUMsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUU7RUFDdkU7QUFDRCxhQUFZLEVBQUUsc0JBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDeEMsTUFBSSxDQUFDLENBQUM7QUFDTixNQUFHLENBQUMsSUFBRSxDQUFDO0FBQUUsVUFBTyxDQUFDLENBQUM7R0FBQSxBQUNsQixJQUFHLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUEsSUFBRyxDQUFDO0FBQUUsVUFBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDO0dBQUEsQUFDM0IsSUFBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxJQUFFLEdBQUUsR0FBQyxHQUFHLENBQUEsQUFBQyxDQUFDO0FBQ3BCLE1BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFBRSxJQUFDLEdBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7R0FBRSxNQUFZLENBQUMsR0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLE1BQUcsQ0FBQyxHQUFHLENBQUM7QUFBRSxVQUFPLENBQUMsR0FBRSxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxFQUFFLElBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQSxBQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsSUFBRyxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxBQUFDLEdBQUMsQ0FBQyxDQUFFLENBQUEsQUFBQyxHQUFHLENBQUMsQ0FBQztHQUFBLEFBQ3RGLE9BQU8sQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLENBQUEsQUFBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLElBQUcsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQUFBQyxHQUFDLENBQUMsQ0FBRSxHQUFDLEdBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzlFO0FBQ0QsT0FBTSxFQUFFLGdCQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDL0IsTUFBRyxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDL0IsU0FBTyxDQUFDLElBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQSxBQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLENBQUMsQ0FBQztFQUNwQztBQUNELFFBQU8sRUFBRSxpQkFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2hDLE1BQUcsQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFNBQU8sQ0FBQyxJQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEdBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzdDO0FBQ0QsVUFBUyxFQUFFLG1CQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbEMsTUFBRyxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDL0IsTUFBRyxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFBLEdBQUksQ0FBQztBQUFFLFVBQU8sQ0FBQyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFDLElBQUcsS0FBSyxDQUFDLEdBQUUsQ0FBQyxDQUFBLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLEFBQUMsR0FBRyxDQUFDLENBQUM7R0FBQSxBQUMvRCxPQUFPLENBQUMsR0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFBLEdBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFDLElBQUcsS0FBSyxDQUFDLEdBQUUsQ0FBQyxDQUFBLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkQ7QUFDRCxTQUFRLEVBQUUsa0JBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlCLFNBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDL0M7QUFDRCxVQUFTLEVBQUUsbUJBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQy9CLE1BQUcsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFBLEdBQUksQ0FBQyxHQUFDLElBQUksQUFBQyxFQUFFO0FBQ3BCLFVBQU8sQ0FBQyxJQUFFLE1BQU0sR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDLENBQUM7R0FDMUIsTUFBTSxJQUFHLENBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxBQUFDLEVBQUU7QUFDdEIsVUFBTyxDQUFDLElBQUUsTUFBTSxJQUFFLENBQUMsSUFBRyxHQUFHLEdBQUMs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QUcsRUFBRTtBQUNsQixLQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7RUFDakI7O0FBRUQsS0FBSSxLQUFLLElBQUksR0FBRyxFQUFFO0FBQ2pCLEtBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztFQUNoQjs7QUFFRCxRQUFPLEdBQUcsQ0FBQztDQUNYOztBQUVELFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDekIsUUFBTyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsS0FBSyx1QkFBSyxHQUFHLEVBQUcsS0FBSyxDQUFDLENBQUM7Q0FDMUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtleHRlbmQsIG1ha2VQb3MsIGdldEN1cnNvcn0gZnJvbSAnLi91dGlscyc7XHJcblxyXG52YXIgYWN0aW9ucyA9IHtcclxuXHQvKipcclxuXHQgKiBUeXBlLWluIHBhc3NlZCB0ZXh0IGludG8gY3VycmVudCBlZGl0b3IgY2hhci1ieS1jaGFyXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQ3VycmVudCBvcHRpb25zXHJcblx0ICogQHBhcmFtIHtDb2RlTWlycm9yfSBlZGl0b3IgRWRpdG9yIGluc3RhbmNlIHdoZXJlIGFjdGlvbiBzaG91bGQgYmVcclxuXHQgKiBwZXJmb3JtZWRcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhY3Rpb24gcGVyZm9ybWFuY2VcclxuXHQgKiBpcyBjb21wbGV0ZWRcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0aW1lciBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgdGltZXIgZm9yIGRlbGF5ZWRcclxuXHQgKiBleGVjdXRpb24uIFRoaXMgdGltZXIgd2lsbCBhdXRvbWF0aWNhbGx5IGRlbGF5IGV4ZWN1dGlvbiB3aGVuXHJcblx0ICogc2NlbmFyaW8gaXMgcGF1c2VkIGFuZCByZXZlcnQgd2hlbiBwbGF5ZWQgYWdhaW5cclxuXHQgKi9cclxuXHR0eXBlOiBmdW5jdGlvbih7IG9wdGlvbnMsIGVkaXRvciwgbmV4dCwgdGltZXIgfSkge1xyXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7XHJcblx0XHRcdHRleHQ6ICcnLCAgLy8gdGV4dCB0byB0eXBlXHJcblx0XHRcdGRlbGF5OiA2MCwgLy8gZGVsYXkgYmV0d2VlbiBjaGFyYWN0ZXIgdHlwaW5nXHJcblx0XHRcdHBvczogbnVsbCAgLy8gaW5pdGlhbCBwb3NpdGlvbiB3aGVyZSB0byBzdGFydCB0eXBpbmdcclxuXHRcdH0sIHdyYXAoJ3RleHQnLCBvcHRpb25zKSk7XHJcblxyXG5cdFx0aWYgKCFvcHRpb25zLnRleHQpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdObyB0ZXh0IHByb3ZpZGVkIGZvciBcInR5cGVcIiBhY3Rpb24nKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5wb3MgIT09IG51bGwpIHtcclxuXHRcdFx0ZWRpdG9yLnNldEN1cnNvcihtYWtlUG9zKG9wdGlvbnMucG9zLCBlZGl0b3IpKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY2hhcnMgPSBvcHRpb25zLnRleHQuc3BsaXQoJycpO1xyXG5cclxuXHRcdHRpbWVyKGZ1bmN0aW9uIHBlcmZvcm0oKSB7XHJcblx0XHRcdHZhciBjaCA9IGNoYXJzLnNoaWZ0KCk7XHJcblx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGNoLCAnZW5kJyk7XHJcblx0XHRcdGlmIChjaGFycy5sZW5ndGgpIHtcclxuXHRcdFx0XHR0aW1lcihwZXJmb3JtLCBvcHRpb25zLmRlbGF5KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRuZXh0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIG9wdGlvbnMuZGVsYXkpO1xyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdhaXQgZm9yIGEgc3BlY2lmaWVkIHRpbWVvdXRcclxuXHQgKiBAcGFyYW0gb3B0aW9uc1xyXG5cdCAqIEBwYXJhbSBlZGl0b3JcclxuXHQgKiBAcGFyYW0gbmV4dFxyXG5cdCAqIEBwYXJhbSB0aW1lclxyXG5cdCAqL1xyXG5cdHdhaXQ6IGZ1bmN0aW9uKHsgb3B0aW9ucywgZWRpdG9yLCBuZXh0LCB0aW1lciB9KSB7XHJcblx0XHRvcHRpb25zID0gZXh0ZW5kKHtcclxuXHRcdFx0dGltZW91dDogMTAwXHJcblx0XHR9LCB3cmFwKCd0aW1lb3V0Jywgb3B0aW9ucykpO1xyXG5cclxuXHRcdHRpbWVyKG5leHQsIHBhcnNlSW50KG9wdGlvbnMudGltZW91dCwgMTApKTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBNb3ZlIGNhcmV0IHRvIGEgc3BlY2lmaWVkIHBvc2l0aW9uXHJcblx0ICovXHJcblx0bW92ZVRvOiBmdW5jdGlvbih7IG9wdGlvbnMsIGVkaXRvciwgbmV4dCwgdGltZXIgfSkge1xyXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7XHJcblx0XHRcdGRlbGF5OiA4MCxcclxuXHRcdFx0aW1tZWRpYXRlOiBmYWxzZSAvLyBUT0RPOiByZW1vdmUsIHVzZSBkZWxheTogMCBpbnN0ZWFkXHJcblx0XHR9LCB3cmFwKCdwb3MnLCBvcHRpb25zKSk7XHJcblxyXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnBvcyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdObyBwb3NpdGlvbiBzcGVjaWZpZWQgZm9yIFwibW92ZVRvXCIgYWN0aW9uJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGN1clBvcyA9IGdldEN1cnNvcihlZGl0b3IpO1xyXG5cdFx0Ly8gcmVzZXQgc2VsZWN0aW9uLCBpZiBleGlzdHNcclxuXHRcdGVkaXRvci5zZXRTZWxlY3Rpb24oY3VyUG9zLCBjdXJQb3MpO1xyXG5cdFx0dmFyIHRhcmdldFBvcyA9IG1ha2VQb3Mob3B0aW9ucy5wb3MsIGVkaXRvcik7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuaW1tZWRpYXRlIHx8ICFvcHRpb25zLmRlbGF5KSB7XHJcblx0XHRcdGVkaXRvci5zZXRDdXJzb3IodGFyZ2V0UG9zKTtcclxuXHRcdFx0bmV4dCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkZWx0YUxpbmUgPSB0YXJnZXRQb3MubGluZSAtIGN1clBvcy5saW5lO1xyXG5cdFx0dmFyIGRlbHRhQ2hhciA9IHRhcmdldFBvcy5jaCAtIGN1clBvcy5jaDtcclxuXHRcdHZhciBzdGVwcyA9IE1hdGgubWF4KGRlbHRhQ2hhciwgZGVsdGFMaW5lKTtcclxuXHRcdC8vIHZhciBzdGVwTGluZSA9IGRlbHRhTGluZSAvIHN0ZXBzO1xyXG5cdFx0Ly8gdmFyIHN0ZXBDaGFyID0gZGVsdGFDaGFyIC8gc3RlcHM7XHJcblx0XHR2YXIgc3RlcExpbmUgPSBkZWx0YUxpbmUgPCAwID8gLTEgOiAxO1xyXG5cdFx0dmFyIHN0ZXBDaGFyID0gZGVsdGFDaGFyIDwgMCA/IC0xIDogMTtcclxuXHJcblx0XHR0aW1lcihmdW5jdGlvbiBwZXJmb3JtKCkge1xyXG5cdFx0XHRjdXJQb3MgPSBnZXRDdXJzb3IoZWRpdG9yKTtcclxuXHRcdFx0aWYgKHN0ZXBzID4gMCAmJiAhKGN1clBvcy5saW5lID09IHRhcmdldFBvcy5saW5lICYmIGN1clBvcy5jaCA9PSB0YXJnZXRQb3MuY2gpKSB7XHJcblxyXG5cdFx0XHRcdGlmIChjdXJQb3MubGluZSAhPSB0YXJnZXRQb3MubGluZSkge1xyXG5cdFx0XHRcdFx0Y3VyUG9zLmxpbmUgKz0gc3RlcExpbmU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoY3VyUG9zLmNoICE9IHRhcmdldFBvcy5jaCkge1xyXG5cdFx0XHRcdFx0Y3VyUG9zLmNoICs9IHN0ZXBDaGFyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZWRpdG9yLnNldEN1cnNvcihjdXJQb3MpO1xyXG5cdFx0XHRcdHN0ZXBzLS07XHJcblx0XHRcdFx0dGltZXIocGVyZm9ybSwgb3B0aW9ucy5kZWxheSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZWRpdG9yLnNldEN1cnNvcih0YXJnZXRQb3MpO1xyXG5cdFx0XHRcdG5leHQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgb3B0aW9ucy5kZWxheSk7XHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogU2ltaWxhciB0byBcIm1vdmVUb1wiIGZ1bmN0aW9uIGJ1dCB3aXRoIGltbWVkaWF0ZSBjdXJzb3IgcG9zaXRpb24gdXBkYXRlXHJcblx0ICovXHJcblx0anVtcFRvOiBmdW5jdGlvbih7IG9wdGlvbnMsIGVkaXRvciwgbmV4dCwgdGltZXIgfSkge1xyXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7XHJcblx0XHRcdGFmdGVyRGVsYXk6IDIwMFxyXG5cdFx0fSwgd3JhcCgncG9zJywgb3B0aW9ucykpO1xyXG5cclxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wb3MgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignTm8gcG9zaXRpb24gc3BlY2lmaWVkIGZvciBcImp1bXBUb1wiIGFjdGlvbicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVkaXRvci5zZXRDdXJzb3IobWFrZVBvcyhvcHRpb25zLnBvcywgZWRpdG9yKSk7XHJcblx0XHR0aW1lcihuZXh0LCBvcHRpb25zLmFmdGVyRGVsYXkpO1xyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIEV4ZWN1dGVzIHByZWRlZmluZWQgQ29kZU1pcnJvciBjb21tYW5kXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuXHQgKiBAcGFyYW0ge0NvZGVNaXJyb3J9IGVkaXRvclxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0aW1lclxyXG5cdCAqL1xyXG5cdHJ1bjogZnVuY3Rpb24oeyBvcHRpb25zLCBlZGl0b3IsIG5leHQsIHRpbWVyIH0pIHtcclxuXHRcdG9wdGlvbnMgPSBleHRlbmQoe1xyXG5cdFx0XHRiZWZvcmVEZWxheTogNTAwLFxyXG5cdFx0XHR0aW1lczogMVxyXG5cdFx0fSwgd3JhcCgnY29tbWFuZCcsIG9wdGlvbnMpKTtcclxuXHJcblx0XHR2YXIgdGltZXMgPSBvcHRpb25zLnRpbWVzO1xyXG5cdFx0dGltZXIoZnVuY3Rpb24gcGVyZm9ybSgpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNvbW1hbmQgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRvcHRpb25zLmNvbW1hbmQoZWRpdG9yLCBvcHRpb25zKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRlZGl0b3IuZXhlY0NvbW1hbmQob3B0aW9ucy5jb21tYW5kKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKC0tdGltZXMgPiAwKSB7XHJcblx0XHRcdFx0dGltZXIocGVyZm9ybSwgb3B0aW9ucy5iZWZvcmVEZWxheSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bmV4dCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCBvcHRpb25zLmJlZm9yZURlbGF5KTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIHNlbGVjdGlvbiBmb3Igc3BlY2lmaWVkIHBvc2l0aW9uXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuXHQgKiBAcGFyYW0ge0NvZGVNaXJyb3J9IGVkaXRvclxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0aW1lclxyXG5cdCAqL1xyXG5cdHNlbGVjdDogZnVuY3Rpb24oeyBvcHRpb25zLCBlZGl0b3IsIG5leHQsIHRpbWVyIH0pIHtcclxuXHRcdG9wdGlvbnMgPSBleHRlbmQoe1xyXG5cdFx0XHRmcm9tOiAnY2FyZXQnXHJcblx0XHR9LCB3cmFwKCd0bycsIG9wdGlvbnMpKTtcclxuXHJcblx0XHR2YXIgZnJvbSA9IG1ha2VQb3Mob3B0aW9ucy5mcm9tLCBlZGl0b3IpO1xyXG5cdFx0dmFyIHRvID0gbWFrZVBvcyhvcHRpb25zLnRvLCBlZGl0b3IpO1xyXG5cdFx0ZWRpdG9yLnNldFNlbGVjdGlvbihmcm9tLCB0byk7XHJcblx0XHRuZXh0KCk7XHJcblx0fVxyXG59O1xyXG5cclxuZnVuY3Rpb24gd3JhcChrZXksIHZhbHVlKSB7XHJcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB2YWx1ZSA6IHtba2V5XTogdmFsdWV9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhY3Rpb25zO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7dG9BcnJheX0gZnJvbSAnLi91dGlscyc7XHJcblxyXG52YXIgdzNjQ1NTID0gZG9jdW1lbnQuZGVmYXVsdFZpZXcgJiYgZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3cG9ydFJlY3QoKSB7XHJcblx0dmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG5cdHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cdHZhciBjbGllbnRUb3AgPSBkb2NFbGVtLmNsaWVudFRvcCAgfHwgYm9keS5jbGllbnRUb3AgIHx8IDA7XHJcblx0dmFyIGNsaWVudExlZnQgPSBkb2NFbGVtLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDA7XHJcblx0dmFyIHNjcm9sbFRvcCAgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3AgIHx8IGJvZHkuc2Nyb2xsVG9wO1xyXG5cdHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQ7XHJcblx0XHJcblx0cmV0dXJuIHtcclxuXHRcdHRvcDogc2Nyb2xsVG9wICAtIGNsaWVudFRvcCxcclxuXHRcdGxlZnQ6IHNjcm9sbExlZnQgLSBjbGllbnRMZWZ0LFxyXG5cdFx0d2lkdGg6IGJvZHkuY2xpZW50V2lkdGggfHwgZG9jRWxlbS5jbGllbnRXaWR0aCxcclxuXHRcdGhlaWdodDogYm9keS5jbGllbnRIZWlnaHQgfHwgZG9jRWxlbS5jbGllbnRIZWlnaHRcclxuXHR9O1xyXG59XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBlbGVtZW50IGZyb20gcGFyZW50XHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxyXG4gKiBAcmV0dXJucyB7RWxlbWVudH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmUoZWxlbSkge1xyXG5cdGFyKGVsZW0pLmZvckVhY2goZWwgPT4gZWwucGFyZW50Tm9kZSAmJiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKSk7XHJcblx0cmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXJzIHN0cmluZyBpbnRvIERPTSBlbGVtZW50XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcclxuICogQHJldHVybnMge0VsZW1lbnR9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9ET00oc3RyKSB7XHJcblx0dmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGRpdi5pbm5lckhUTUwgPSBzdHI7XHJcblx0cmV0dXJuIGRpdi5maXJzdENoaWxkO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyBvciByZXRyaWV2ZXMgQ1NTIHByb3BlcnR5IHZhbHVlXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3NzKGVsZW0sIHByb3AsIHZhbCkge1xyXG5cdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgdmFsID09IG51bGwpIHtcclxuXHRcdHJldHVybiBnZXRDU1MoZWxlbSwgcHJvcCk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpIHtcclxuXHRcdHZhciBvYmogPSB7fTtcclxuXHRcdG9ialtwcm9wXSA9IHZhbDtcclxuXHRcdHByb3AgPSBvYmo7XHJcblx0fVxyXG5cdFxyXG5cdHNldENTUyhlbGVtLCBwcm9wKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXIob2JqKSB7XHJcblx0aWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XHJcblx0XHRyZXR1cm4gdG9BcnJheShvYmopO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gQXJyYXkuaXNBcnJheShvYmopID8gb2JqIDogW29ial07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlKG5hbWUpIHtcclxuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKC9cXC0oXFx3KS9nLCBmdW5jdGlvbihzdHIsIHAxKSB7XHJcblx0XHRyZXR1cm4gcDEudG9VcHBlckNhc2UoKTtcclxuXHR9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgQ1NTIHByb3BlcnR5IHZhbHVlIG9mIGdpdmVuIGVsZW1lbnQuXHJcbiAqIEBhdXRob3IgalF1ZXJ5IFRlYW1cclxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIENTUyBwcm9wZXJ0eSB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Q1NTKGVsZW0sIG5hbWUpIHtcclxuXHR2YXIgcm51bXB4ID0gL14tP1xcZCsoPzpweCk/JC9pLFxyXG5cdFx0cm51bSA9IC9eLT9cXGQoPzpcXC5cXGQrKT8vLFxyXG5cdFx0cnN1ZiA9IC9cXGQkLztcclxuXHRcclxuXHR2YXIgbmFtZUNhbWVsID0gdG9DYW1lbENhc2UobmFtZSk7XHJcblx0Ly8gSWYgdGhlIHByb3BlcnR5IGV4aXN0cyBpbiBzdHlsZVtdLCB0aGVuIGl0J3MgYmVlbiBzZXRcclxuXHQvLyByZWNlbnRseSAoYW5kIGlzIGN1cnJlbnQpXHJcblx0aWYgKGVsZW0uc3R5bGVbbmFtZUNhbWVsXSkge1xyXG5cdFx0cmV0dXJuIGVsZW0uc3R5bGVbbmFtZUNhbWVsXTtcclxuXHR9IFxyXG5cdFx0XHJcblx0aWYgKHczY0NTUykge1xyXG5cdFx0dmFyIGNzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSwgJycpO1xyXG5cdFx0cmV0dXJuIGNzLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChlbGVtLmN1cnJlbnRTdHlsZSkge1xyXG5cdFx0dmFyIHJldCA9IGVsZW0uY3VycmVudFN0eWxlW25hbWVdIHx8IGVsZW0uY3VycmVudFN0eWxlW25hbWVDYW1lbF07XHJcblx0XHR2YXIgc3R5bGUgPSBlbGVtLnN0eWxlIHx8IGVsZW07XHJcblx0XHRcclxuXHRcdC8vIEZyb20gdGhlIGF3ZXNvbWUgaGFjayBieSBEZWFuIEVkd2FyZHNcclxuXHRcdC8vIGh0dHA6Ly9lcmlrLmVhZS5uZXQvYXJjaGl2ZXMvMjAwNy8wNy8yNy8xOC41NC4xNS8jY29tbWVudC0xMDIyOTFcclxuXHRcdFxyXG5cdFx0Ly8gSWYgd2UncmUgbm90IGRlYWxpbmcgd2l0aCBhIHJlZ3VsYXIgcGl4ZWwgbnVtYmVyXHJcblx0XHQvLyBidXQgYSBudW1iZXIgdGhhdCBoYXMgYSB3ZWlyZCBlbmRpbmcsIHdlIG5lZWQgdG8gY29udmVydCBpdCB0byBwaXhlbHNcclxuXHRcdGlmICghcm51bXB4LnRlc3QocmV0KSAmJiBybnVtLnRlc3QocmV0KSkge1xyXG5cdFx0XHQvLyBSZW1lbWJlciB0aGUgb3JpZ2luYWwgdmFsdWVzXHJcblx0XHRcdHZhciBsZWZ0ID0gc3R5bGUubGVmdCwgcnNMZWZ0ID0gZWxlbS5ydW50aW1lU3R5bGUubGVmdDtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFB1dCBpbiB0aGUgbmV3IHZhbHVlcyB0byBnZXQgYSBjb21wdXRlZCB2YWx1ZSBvdXRcclxuXHRcdFx0ZWxlbS5ydW50aW1lU3R5bGUubGVmdCA9IGVsZW0uY3VycmVudFN0eWxlLmxlZnQ7XHJcblx0XHRcdHZhciBzdWZmaXggPSByc3VmLnRlc3QocmV0KSA/ICdlbScgOiAnJztcclxuXHRcdFx0c3R5bGUubGVmdCA9IG5hbWVDYW1lbCA9PT0gJ2ZvbnRTaXplJyA/ICcxZW0nIDogKHJldCArIHN1ZmZpeCB8fCAwKTtcclxuXHRcdFx0cmV0ID0gc3R5bGUucGl4ZWxMZWZ0ICsgJ3B4JztcclxuXHRcdFx0XHJcblx0XHRcdC8vIFJldmVydCB0aGUgY2hhbmdlZCB2YWx1ZXNcclxuXHRcdFx0c3R5bGUubGVmdCA9IGxlZnQ7XHJcblx0XHRcdGVsZW0ucnVudGltZVN0eWxlLmxlZnQgPSByc0xlZnQ7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogU2V0cyBDU1MgcHJvcGVydGllcyB0byBnaXZlbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIENTUyBwcm9wZXJ0aWVzIHRvIHNldFxyXG4gKi9cclxuZnVuY3Rpb24gc2V0Q1NTKGVsZW0sIHBhcmFtcykge1xyXG5cdGlmICghZWxlbSkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0dmFyIG51bVByb3BzID0geydsaW5lLWhlaWdodCc6IDEsICd6LWluZGV4JzogMSwgb3BhY2l0eTogMX07XHJcblx0dmFyIHByb3BzID0gT2JqZWN0LmtleXMocGFyYW1zKS5tYXAoayA9PiB7XHJcblx0XHR2YXIgdiA9IHBhcmFtc1trXTtcclxuXHRcdHZhciBuYW1lID0gay5yZXBsYWNlKC8oW0EtWl0pL2csICctJDEnKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0cmV0dXJuIG5hbWUgKyAnOicgKyAoKHR5cGVvZiB2ID09PSAnbnVtYmVyJyAmJiAhKG5hbWUgaW4gbnVtUHJvcHMpKSA/IHYgKyAncHgnIDogdik7XHJcblx0fSk7XHJcblxyXG5cdGVsZW0uc3R5bGUuY3NzVGV4dCArPSAnOycgKyBwcm9wcy5qb2luKCc7Jyk7XHJcbn0iLCIvKipcclxuICogQSBoaWdoLWxldmVsIGxpYnJhcnkgaW50ZXJmYWNlIGZvciBjcmVhdGluZyBzY2VuYXJpb3Mgb3ZlciB0ZXh0YXJlYVxyXG4gKiBlbGVtZW50LiBUaGUgPGNvZGU+Q29kZU1pcnJvci5tb3ZpZTwvY29kZT4gdGFrZXMgcmVmZXJlbmNlIHRvIHRleHRhcmVhXHJcbiAqIGVsZW1lbnQgKG9yIGl0cyBJRCkgYW5kIHBhcnNlcyBpdHMgY29udGVudCBmb3IgaW5pdGlhbCBjb250ZW50IHZhbHVlLFxyXG4gKiBzY2VuYXJpbyBhbmQgb3V0bGluZS5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHtwYXJzZUpTT04sIGV4dGVuZCwgdG9BcnJheX0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCBTY2VuYXJpbyBmcm9tICcuL3NjZW5hcmlvJztcclxuXHJcbnZhciBpb3MgPSAvQXBwbGVXZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgL01vYmlsZVxcL1xcdysvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XHJcbnZhciBtYWMgPSBpb3MgfHwgL01hYy8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pO1xyXG5cclxudmFyIG1hY0NoYXJNYXAgPSB7XHJcblx0J2N0cmwnOiAn4oyDJyxcclxuXHQnY29udHJvbCc6ICfijIMnLFxyXG5cdCdjbWQnOiAn4oyYJyxcclxuXHQnc2hpZnQnOiAn4oenJyxcclxuXHQnYWx0JzogJ+KMpScsXHJcblx0J2VudGVyJzogJ+KPjicsXHJcblx0J3RhYic6ICfih6UnLFxyXG5cdCdsZWZ0JzogJ+KGkCcsXHJcblx0J3JpZ2h0JzogJ+KGkicsXHJcblx0J3VwJzogJ+KGkScsXHJcblx0J2Rvd24nOiAn4oaTJ1xyXG59O1xyXG5cclxudmFyIHBjQ2hhck1hcCA9IHtcclxuXHQnY21kJzogJ0N0cmwnLFxyXG5cdCdjb250cm9sJzogJ0N0cmwnLFxyXG5cdCdjdHJsJzogJ0N0cmwnLFxyXG5cdCdhbHQnOiAnQWx0JyxcclxuXHQnc2hpZnQnOiAnU2hpZnQnLFxyXG5cdCdsZWZ0JzogJ+KGkCcsXHJcblx0J3JpZ2h0JzogJ+KGkicsXHJcblx0J3VwJzogJ+KGkScsXHJcblx0J2Rvd24nOiAn4oaTJ1xyXG59O1xyXG5cclxuZXhwb3J0IHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcclxuXHQvKipcclxuXHQgKiBBdXRvbWF0aWNhbGx5IHBhcnNlIG1vdmllIGRlZmluaXRpb24gZnJvbSB0ZXh0YXJlYSBjb250ZW50LiBTZXR0aW5nXHJcblx0ICogdGhpcyBwcm9wZXJ0eSB0byA8Y29kZT5mYWxzZTwvY29kZT4gYXNzdW1lcyB0aGF0IHVzZXIgd2FudHMgdG9cclxuXHQgKiBleHBsaWNpdGx5IHByb3ZpZGUgbW92aWUgZGF0YTogaW5pdGlhbCB2YWx1ZSwgc2NlbmFyaW8gZXRjLlxyXG5cdCAqL1xyXG5cdHBhcnNlOiB0cnVlLFxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgb3IgcmVnZXhwIHVzZWQgdG8gc2VwYXJhdGUgc2VjdGlvbnMgb2YgbW92aWUgZGVmaW5pdGlvbiwgZS5nLlxyXG5cdCAqIGRlZmF1bHQgdmFsdWUsIHNjZW5hcmlvIGFuZCBlZGl0b3Igb3B0aW9uc1xyXG5cdCAqL1xyXG5cdHNlY3Rpb25TZXBhcmF0b3I6ICdAQEAnLFxyXG5cclxuXHQvKiogUmVndWxhciBleHByZXNzaW9uIHRvIGV4dHJhY3Qgb3V0bGluZSBmcm9tIHNjZW5hcmlvIGxpbmUgKi9cclxuXHRvdXRsaW5lU2VwYXJhdG9yOiAvXFxzKzo6OlxccysoLispJC8sXHJcblxyXG5cdC8qKiBTdHJpcCBwYXJlbnRoZXNlcyBmcm9tIHByZXR0eWZpZWQga2V5Ym9hcmQgc2hvcnRjdXQgZGVmaW5pdGlvbiAqL1xyXG5cdHN0cmlwUGFyZW50aGVzZXM6IGZhbHNlXHJcbn07XHJcblxyXG4vKipcclxuICogSGlnaC1sZXZlbCBmdW5jdGlvbiB0byBjcmVhdGUgbW92aWUgaW5zdGFuY2Ugb24gdGV4dGFyZWEuXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFJlZmVyZW5jZSB0byB0ZXh0YXJlYSwgZWl0aGVyIDxjb2RlPkVsZW1lbnQ8L2NvZGU+XHJcbiAqIG9yIHN0cmluZyBJRC4gSXQgY2FuIGFsc28gYWNjZXB0IGV4aXN0aW5nIENvZGVNaXJyb3Igb2JqZWN0LlxyXG4gKiBAcGFyYW0ge09iamVjdH0gbW92aWVPcHRpb25zIE1vdmllIG9wdGlvbnMuIFNlZSA8Y29kZT5kZWZhdWx0T3B0aW9uczwvY29kZT5cclxuICogZm9yIHZhbHVlIHJlZmVyZW5jZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gZWRpdG9yT3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbnMgcGFzc2VkIHRvIENvZGVNaXJyb3JcclxuICogZWRpdG9yIGluaXRpYWxpemVyLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbW92aWUodGFyZ2V0LCBtb3ZpZU9wdGlvbnM9e30sIGVkaXRvck9wdGlvbnM9e30pIHtcclxuXHRzZXR1cENvZGVNaXJyb3IoKTtcclxuXHJcblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKSB7XHJcblx0XHR0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0dmFyIHRhcmdldElzVGV4dGFyZWEgPSB0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3RleHRhcmVhJztcclxuXHJcblx0bW92aWVPcHRpb25zID0gZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgbW92aWVPcHRpb25zKTtcclxuXHRlZGl0b3JPcHRpb25zID0gZXh0ZW5kKHtcclxuXHRcdHRoZW1lOiAnZXNwcmVzc28nLFxyXG5cdFx0bW9kZSA6ICd0ZXh0L2h0bWwnLFxyXG5cdFx0aW5kZW50V2l0aFRhYnM6IHRydWUsXHJcblx0XHR0YWJTaXplOiA0LFxyXG5cdFx0bGluZU51bWJlcnMgOiB0cnVlLFxyXG5cdFx0cHJldmVudEN1cnNvck1vdmVtZW50OiB0cnVlXHJcblx0fSwgZWRpdG9yT3B0aW9ucyk7XHJcblxyXG5cdHZhciBpbml0aWFsVmFsdWUgPSBlZGl0b3JPcHRpb25zLnZhbHVlIHx8ICh0YXJnZXRJc1RleHRhcmVhID8gdGFyZ2V0LnZhbHVlIDogdGFyZ2V0LmdldFZhbHVlKCkpIHx8ICcnO1xyXG5cclxuXHRpZiAodGFyZ2V0SXNUZXh0YXJlYSAmJiBtb3ZpZU9wdGlvbnMucGFyc2UpIHtcclxuXHRcdGV4dGVuZChtb3ZpZU9wdGlvbnMsIHBhcnNlTW92aWVEZWZpbml0aW9uKGluaXRpYWxWYWx1ZSwgbW92aWVPcHRpb25zKSk7XHJcblx0XHRpbml0aWFsVmFsdWUgPSBtb3ZpZU9wdGlvbnMudmFsdWU7XHJcblx0XHRpZiAobW92aWVPcHRpb25zLmVkaXRvck9wdGlvbnMpIHtcclxuXHRcdFx0ZXh0ZW5kKGVkaXRvck9wdGlvbnMsIG1vdmllT3B0aW9ucy5lZGl0b3JPcHRpb25zKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZWFkIENNIG9wdGlvbnMgZnJvbSBnaXZlbiB0ZXh0YXJlYVxyXG5cdFx0dmFyIGNtQXR0ciA9IC9eZGF0YVxcLWNtXFwtKC4rKSQvaTtcclxuXHRcdHRvQXJyYXkodGFyZ2V0LmF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24oYXR0cikge1xyXG5cdFx0XHR2YXIgbSA9IGF0dHIubmFtZS5tYXRjaChjbUF0dHIpO1xyXG5cdFx0XHRpZiAobSkge1xyXG5cdFx0XHRcdGVkaXRvck9wdGlvbnNbbVsxXV0gPSBhdHRyLnZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIG5vcm1hbGl6ZSBsaW5lIGVuZGluZ3NcclxuXHRpbml0aWFsVmFsdWUgPSBpbml0aWFsVmFsdWUucmVwbGFjZSgvXFxyP1xcbi9nLCAnXFxuJyk7XHJcblxyXG5cdC8vIGxvY2F0ZSBpbml0aWFsIGNhcmV0IHBvc2l0aW9uIGZyb20gfCBzeW1ib2xcclxuXHR2YXIgaW5pdGlhbFBvcyA9IGluaXRpYWxWYWx1ZS5pbmRleE9mKCd8Jyk7XHJcblxyXG5cdGlmICh0YXJnZXRJc1RleHRhcmVhKSB7XHJcblx0XHR0YXJnZXQudmFsdWUgPSBlZGl0b3JPcHRpb25zLnZhbHVlID0gaW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlLnJlcGxhY2UoL1xcfC9nLCAnJyk7XHJcblx0fVxyXG5cclxuXHQvLyBjcmVhdGUgZWRpdG9yIGluc3RhbmNlIGlmIG5lZWRlZFxyXG5cdHZhciBlZGl0b3IgPSB0YXJnZXRJc1RleHRhcmVhID8gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEodGFyZ2V0LCBlZGl0b3JPcHRpb25zKSA6IHRhcmdldDtcclxuXHJcblx0aWYgKGluaXRpYWxQb3MgIT0gLTEpIHtcclxuXHRcdGVkaXRvci5zZXRDdXJzb3IoZWRpdG9yLnBvc0Zyb21JbmRleChpbml0aWFsUG9zKSk7XHJcblx0fVxyXG5cclxuXHQvLyBzYXZlIGluaXRpYWwgZGF0YSBzbyB3ZSBjYW4gcmV2ZXJ0IHRvIGl0IGxhdGVyXHJcblx0ZWRpdG9yLl9faW5pdGlhbCA9IHtcclxuXHRcdGNvbnRlbnQ6IGluaXRpYWxWYWx1ZSxcclxuXHRcdHBvczogZWRpdG9yLmdldEN1cnNvcih0cnVlKVxyXG5cdH07XHJcblxyXG5cdHZhciB3cmFwcGVyID0gZWRpdG9yLmdldFdyYXBwZXJFbGVtZW50KCk7XHJcblxyXG5cdC8vIGFkanVzdCBoZWlnaHQsIGlmIHJlcXVpcmVkXHJcblx0aWYgKGVkaXRvck9wdGlvbnMuaGVpZ2h0KSB7XHJcblx0XHR3cmFwcGVyLnN0eWxlLmhlaWdodCA9IGVkaXRvck9wdGlvbnMuaGVpZ2h0ICsgJ3B4JztcclxuXHR9XHJcblxyXG5cdHdyYXBwZXIuY2xhc3NOYW1lICs9ICcgQ29kZU1pcnJvci1tb3ZpZSc7XHJcblxyXG4gIHJldHVybiBuZXcgU2NlbmFyaW8obW92aWVPcHRpb25zLnNjZW5hcmlvLCBlZGl0b3IpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVhZExpbmVzKHRleHQpIHtcclxuXHQvLyBJRSBmYWlscyB0byBzcGxpdCBzdHJpbmcgYnkgcmVnZXhwLFxyXG5cdC8vIG5lZWQgdG8gbm9ybWFsaXplIG5ld2xpbmVzIGZpcnN0XHJcblx0dmFyIG5sID0gJ1xcbic7XHJcblx0dmFyIGxpbmVzID0gKHRleHQgfHwgJycpXHJcblx0XHQucmVwbGFjZSgvXFxyXFxuL2csIG5sKVxyXG5cdFx0LnJlcGxhY2UoL1xcblxcci9nLCBubClcclxuXHRcdC5yZXBsYWNlKC9cXHIvZywgbmwpXHJcblx0XHQuc3BsaXQobmwpO1xyXG5cclxuXHRyZXR1cm4gbGluZXMuZmlsdGVyKEJvb2xlYW4pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bmVzY2FwZSh0ZXh0KSB7XHJcblx0dmFyIHJlcGxhY2VtZW50cyA9IHtcclxuXHRcdCcmbHQ7JzogICc8JyxcclxuXHRcdCcmZ3Q7JzogICc+JyxcclxuXHRcdCcmYW1wOyc6ICcmJ1xyXG5cdH07XHJcblxyXG5cdHJldHVybiB0ZXh0LnJlcGxhY2UoLyYobHR8Z3R8YW1wKTsvZywgZnVuY3Rpb24oc3RyLCBwMSkge1xyXG5cdFx0cmV0dXJuIHJlcGxhY2VtZW50c1tzdHJdIHx8IHN0cjtcclxuXHR9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3RzIGluaXRpYWwgY29udGVudCwgc2NlbmFyaW8gYW5kIG91dGxpbmUgZnJvbSBnaXZlbiBzdHJpbmdcclxuICogQHBhcmFtIHtTdHJpbmd9IHRleHRcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlTW92aWVEZWZpbml0aW9uKHRleHQsIG9wdGlvbnM9e30pIHtcclxuXHRvcHRpb25zID0gZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyB8fCB7fSk7XHJcblx0dmFyIHBhcnRzID0gdGV4dC5zcGxpdChvcHRpb25zLnNlY3Rpb25TZXBhcmF0b3IpO1xyXG5cclxuXHQvLyBwYXJzZSBzY2VuYXJpb1xyXG5cdHZhciByZURlZiA9IC9eKFxcdyspXFxzKjpcXHMqKC4rKSQvO1xyXG5cdHZhciBzY2VuYXJpbyA9IFtdO1xyXG5cdHZhciBlZGl0b3JPcHRpb25zID0ge307XHJcblxyXG5cdHZhciBza2lwQ29tbWVudCA9IGxpbmUgPT4gbGluZS5jaGFyQXQoMCkgIT09ICcjJztcclxuXHJcblx0Ly8gcmVhZCBtb3ZpZSBkZWZpbml0aW9uXHJcblx0cmVhZExpbmVzKHBhcnRzWzFdKS5maWx0ZXIoc2tpcENvbW1lbnQpLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xyXG5cdFx0Ly8gZG8gd2UgaGF2ZSBvdXRsaW5lIGRlZmluaXRpb24gaGVyZT9cclxuXHRcdGxpbmUgPSBsaW5lLnJlcGxhY2Uob3B0aW9ucy5vdXRsaW5lU2VwYXJhdG9yLCAnJyk7XHJcblxyXG5cdFx0dmFyIHNkID0gbGluZS5tYXRjaChyZURlZik7XHJcblx0XHRpZiAoIXNkKSB7XHJcblx0XHRcdHJldHVybiBzY2VuYXJpby5wdXNoKGxpbmUudHJpbSgpKTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYgKHNkWzJdLmNoYXJBdCgwKSA9PT0gJ3snKSB7XHJcblx0XHRcdHZhciBvYmogPSB7fTtcclxuXHRcdFx0b2JqW3NkWzFdXSA9IHBhcnNlSlNPTih1bmVzY2FwZShzZFsyXSkpO1xyXG5cdFx0XHRyZXR1cm4gc2NlbmFyaW8ucHVzaChvYmopO1xyXG5cdFx0fVxyXG5cclxuXHRcdHNjZW5hcmlvLnB1c2goc2RbMV0gKyAnOicgKyB1bmVzY2FwZShzZFsyXSkpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyByZWFkIGVkaXRvciBvcHRpb25zXHJcblx0aWYgKHBhcnRzWzJdKSB7XHJcblx0XHRyZWFkTGluZXMocGFydHNbMl0pLmZpbHRlcihza2lwQ29tbWVudCkuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XHJcblx0XHRcdHZhciBzZCA9IGxpbmUubWF0Y2gocmVEZWYpO1xyXG5cdFx0XHRpZiAoc2QpIHtcclxuXHRcdFx0XHRlZGl0b3JPcHRpb25zW3NkWzFdXSA9IHNkWzJdO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHR2YWx1ZTogdW5lc2NhcGUocGFydHNbMF0udHJpbSgpKSxcclxuXHRcdHNjZW5hcmlvOiBzY2VuYXJpbyxcclxuXHRcdGVkaXRvck9wdGlvbnM6IGVkaXRvck9wdGlvbnNcclxuXHR9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXR1cENvZGVNaXJyb3IoKSB7XHJcblx0aWYgKHR5cGVvZiBDb2RlTWlycm9yID09PSAndW5kZWZpbmVkJyB8fCAncHJldmVudEN1cnNvck1vdmVtZW50JyBpbiBDb2RlTWlycm9yLmRlZmF1bHRzKSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRDb2RlTWlycm9yLmRlZmluZU9wdGlvbigncHJldmVudEN1cnNvck1vdmVtZW50JywgZmFsc2UsIGNtID0+IHtcclxuXHRcdHZhciBoYW5kbGVyID0gKGNtLCBldmVudCkgPT4gY20uZ2V0T3B0aW9uKCdyZWFkT25seScpICYmIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRjbS5vbigna2V5ZG93bicsIGhhbmRsZXIpO1xyXG5cdFx0Y20ub24oJ21vdXNlZG93bicsIGhhbmRsZXIpO1xyXG5cdH0pO1xyXG59XHJcblxyXG5pZiAodHlwZW9mIENvZGVNaXJyb3IgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0Q29kZU1pcnJvci5tb3ZpZSA9IG1vdmllO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGNvbW1vbkFjdGlvbnMgZnJvbSAnLi9hY3Rpb25zJztcclxuaW1wb3J0IHthY3Rpb25zIGFzIHByb21wdH0gZnJvbSAnLi93aWRnZXRzL3Byb21wdCc7XHJcbmltcG9ydCB7YWN0aW9ucyBhcyB0b29sdGlwfSBmcm9tICcuL3dpZGdldHMvdG9vbHRpcCc7XHJcbmltcG9ydCB7ZXh0ZW5kfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbnZhciBhY3Rpb25zRGVmaW5pdGlvbiA9IGV4dGVuZCh7fSwgY29tbW9uQWN0aW9ucywgcHJvbXB0LCB0b29sdGlwKTtcclxuXHJcbnZhciBTVEFURV9JRExFICA9ICdpZGxlJztcclxudmFyIFNUQVRFX1BMQVkgID0gJ3BsYXknO1xyXG52YXIgU1RBVEVfUEFVU0UgPSAncGF1c2UnO1xyXG5cclxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5nc1xyXG52YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcclxuXHJcbmV4cG9ydCB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0YmVmb3JlRGVsYXk6IDEwMDAsXHJcblx0YWZ0ZXJEZWxheTogMTAwMFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb25zIEFjdGlvbnMgc2NlbmFyaW9cclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgSW5pdGlhbCBjb250ZW50ICg8Y29kZT5TdHJpbmc8L2NvZGU+KSBvciBlZGl0b3JcclxuICogaW5zdGFuY2UgKDxjb2RlPkNvZGVNaXJyb3I8L2NvZGU+KVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NlbmFyaW8ge1xyXG5cdGNvbnN0cnVjdG9yKGFjdGlvbnMsIGRhdGEpIHtcclxuXHRcdHRoaXMuX2FjdGlvbnMgPSBhY3Rpb25zO1xyXG5cdFx0dGhpcy5fYWN0aW9uSXggPSAtMTtcclxuXHRcdHRoaXMuX2VkaXRvciA9IG51bGw7XHJcblx0XHR0aGlzLl9zdGF0ZSA9IFNUQVRFX0lETEU7XHJcblx0XHR0aGlzLl90aW1lclF1ZXVlID0gW107XHJcblx0XHR0aGlzLl90aW1lciA9IG51bGw7XHJcblxyXG5cdFx0aWYgKGRhdGEgJiYgJ2dldFZhbHVlJyBpbiBkYXRhKSB7XHJcblx0XHRcdHRoaXMuX2VkaXRvciA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGVkID0gdGhpcy5fZWRpdG9yO1xyXG5cdFx0aWYgKGVkICYmICFlZC5fX2luaXRpYWwpIHtcclxuXHRcdFx0ZWQuX19pbml0aWFsID0ge1xyXG5cdFx0XHRcdGNvbnRlbnQ6IGVkLmdldFZhbHVlKCksXHJcblx0XHRcdFx0cG9zOiBlZC5nZXRDdXJzb3IodHJ1ZSlcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdF9zZXR1cChlZGl0b3IpIHtcclxuXHRcdGlmICghZWRpdG9yICYmIHRoaXMuX2VkaXRvcikge1xyXG5cdFx0XHRlZGl0b3IgPSB0aGlzLl9lZGl0b3I7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWRpdG9yLmV4ZWNDb21tYW5kKCdyZXZlcnQnKTtcclxuXHRcdHJldHVybiBlZGl0b3I7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQbGF5IGN1cnJlbnQgc2NlbmFyaW9cclxuXHQgKiBAcGFyYW0ge0NvZGVNaXJyb3J9IGVkaXRvciBFZGl0b3IgaW5zdGFuY2Ugd2hlcmUgb24gd2hpY2ggc2NlbmFyaW9cclxuXHQgKiBzaG91bGQgYmUgcGxheWVkXHJcblx0ICogQG1lbWJlck9mIFNjZW5hcmlvXHJcblx0ICovXHJcblx0cGxheShlZGl0b3IpIHtcclxuXHRcdGlmICh0aGlzLl9zdGF0ZSA9PT0gU1RBVEVfUExBWSkge1xyXG5cdFx0XHQvLyBhbHJlYWR5IHBsYXlpbmdcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9zdGF0ZSA9PT0gU1RBVEVfUEFVU0UpIHtcclxuXHRcdFx0Ly8gcmV2ZXJ0IGZyb20gcGF1c2VkIHN0YXRlXHJcblx0XHRcdHRoaXMuX2VkaXRvciA9IGVkaXRvciB8fCB0aGlzLl9lZGl0b3I7XHJcbiAgICAgIHRoaXMuX2VkaXRvci5mb2N1cygpO1xyXG5cdFx0XHR2YXIgdGltZXJPYmogPSBudWxsO1xyXG5cdFx0XHR3aGlsZSAodGltZXJPYmogPSB0aGlzLl90aW1lclF1ZXVlLnNoaWZ0KCkpIHtcclxuXHRcdFx0XHRyZXF1ZXN0VGltZXIodGltZXJPYmouZm4sIHRpbWVyT2JqLmRlbGF5KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fc3RhdGUgPSBTVEFURV9QTEFZO1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc3VtZScpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fZWRpdG9yID0gZWRpdG9yID0gdGhpcy5fc2V0dXAoZWRpdG9yKTtcclxuXHRcdHRoaXMuX2VkaXRvci5mb2N1cygpO1xyXG5cclxuXHRcdHRoaXMuX3RpbWVyID0gdGhpcy5yZXF1ZXN0VGltZXIuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMuX2FjdGlvbkl4ID0gLTE7XHJcblxyXG5cdFx0dGhpcy5fc3RhdGUgPSBTVEFURV9QTEFZO1xyXG5cdFx0dGhpcy5fZWRpdG9yLnNldE9wdGlvbigncmVhZE9ubHknLCB0cnVlKTtcclxuXHRcdHRoaXMudHJpZ2dlcigncGxheScpO1xyXG5cdFx0dGhpcy5fdGltZXIodGhpcy5uZXh0LmJpbmQodGhpcyksIGRlZmF1bHRPcHRpb25zLmJlZm9yZURlbGF5KTtcclxuXHR9XHJcblxyXG5cdGJhY2soKSB7XHJcbiAgICB0aGlzLl9hY3Rpb25JeCA9IHRoaXMuX2FjdGlvbkl4IC0gMTtcclxuICAgIHRoaXMudHJpZ2dlcignYWN0aW9uJywgdGhpcy5fYWN0aW9uSXgpO1xyXG5cclxuICAgIGNvbnN0IGFjdGlvbiA9IHBhcnNlQWN0aW9uQ2FsbCh0aGlzLl9hY3Rpb25zW3RoaXMuX2FjdGlvbkl4XSk7XHJcblxyXG4gICAgaWYgKGFjdGlvbi5uYW1lIGluIGFjdGlvbnNEZWZpbml0aW9uKSB7XHJcbiAgICAgIGNvbnN0IGFjdGlvblBhcmFtcyA9IHtcclxuICAgICAgICBvcHRpb25zOiBhY3Rpb24ub3B0aW9ucyxcclxuICAgICAgICBlZGl0b3I6IHRoaXMuX2VkaXRvcixcclxuICAgICAgICB0aW1lcjogdGhpcy5fdGltZXIsXHJcbiAgICAgICAgbmV4dDogdGhpcy5uZXh0LmJpbmQodGhpcyksXHJcbiAgICAgICAgYmFjazogdGhpcy5iYWNrLmJpbmQodGhpcyksXHJcbiAgICAgICAgaXNGaXJzdEFjdGlvbjogdGhpcy5fYWN0aW9uSXggPD0gMCxcclxuICAgICAgICBpc0xhc3RBY3Rpb246IHRoaXMuX2FjdGlvbkl4ID49IHRoaXMuX2FjdGlvbnMubGVuZ3RoIC0gMSxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGFjdGlvbnNEZWZpbml0aW9uW2FjdGlvbi5uYW1lXS5jYWxsKHRoaXMsIGFjdGlvblBhcmFtcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHN1Y2ggYWN0aW9uOiAnICsgYWN0aW9uLm5hbWUpO1xyXG4gICAgfVxyXG5cdH1cclxuXHJcblx0bmV4dCgpIHtcclxuICAgIGlmICh0aGlzLl9hY3Rpb25JeCA+PSB0aGlzLl9hY3Rpb25zLmxlbmd0aCAtIDEpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3RpbWVyKCgpID0+IHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfSwgZGVmYXVsdE9wdGlvbnMuYWZ0ZXJEZWxheSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fYWN0aW9uSXggPSB0aGlzLl9hY3Rpb25JeCArIDE7XHJcblxyXG4gICAgY29uc3QgYWN0aW9uID0gcGFyc2VBY3Rpb25DYWxsKHRoaXMuX2FjdGlvbnNbdGhpcy5fYWN0aW9uSXhdKTtcclxuXHRcdGNvbnN0IGlzTGFzdEFjdGlvbiA9IHRoaXMuX2FjdGlvbkl4ID49IHRoaXMuX2FjdGlvbnMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICBpZiAoYWN0aW9uLm5hbWUgaW4gYWN0aW9uc0RlZmluaXRpb24pIHtcclxuICAgICAgY29uc3QgYWN0aW9uUGFyYW1zID0ge1xyXG4gICAgICBcdG9wdGlvbnM6IGFjdGlvbi5vcHRpb25zLFxyXG5cdFx0XHRcdGVkaXRvcjogdGhpcy5fZWRpdG9yLFxyXG5cdFx0XHRcdHRpbWVyOiB0aGlzLl90aW1lcixcclxuXHRcdFx0XHRuZXh0OiB0aGlzLm5leHQuYmluZCh0aGlzKSxcclxuXHRcdFx0XHRiYWNrOiB0aGlzLmJhY2suYmluZCh0aGlzKSxcclxuXHRcdFx0XHRpc0ZpcnN0QWN0aW9uOiB0aGlzLl9hY3Rpb25JeCA8PSAwLFxyXG5cdFx0XHRcdGlzTGFzdEFjdGlvbixcclxuXHRcdFx0fTtcclxuXHJcbiAgICAgIGFjdGlvbnNEZWZpbml0aW9uW2FjdGlvbi5uYW1lXS5jYWxsKHRoaXMsIGFjdGlvblBhcmFtcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHN1Y2ggYWN0aW9uOiAnICsgYWN0aW9uLm5hbWUpO1xyXG4gICAgfVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGF1c2UgY3VycmVudCBzY2VuYXJpbyBwbGF5YmFjay4gSXQgY2FuIGJlIHJlc3RvcmVkIHdpdGhcclxuXHQgKiA8Y29kZT5wbGF5KCk8L2NvZGU+IG1ldGhvZCBjYWxsXHJcblx0ICovXHJcblx0cGF1c2UoKSB7XHJcblx0XHR0aGlzLl9zdGF0ZSA9IFNUQVRFX1BBVVNFO1xyXG5cdFx0dGhpcy50cmlnZ2VyKCdwYXVzZScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RvcHMgcGxheWJhY2sgb2YgY3VycmVudCBzY2VuYXJpb1xyXG5cdCAqL1xyXG5cdHN0b3AoKSB7XHJcblx0XHRpZiAodGhpcy5fc3RhdGUgIT09IFNUQVRFX0lETEUpIHtcclxuXHRcdFx0dGhpcy5fc3RhdGUgPSBTVEFURV9JRExFO1xyXG5cdFx0XHR0aGlzLl90aW1lclF1ZXVlLmxlbmd0aCA9IDA7XHJcblx0XHRcdHRoaXMuX2FjdGlvbkl4ID0gLTE7XHJcblx0XHRcdHRoaXMuX2VkaXRvci5zZXRPcHRpb24oJ3JlYWRPbmx5JywgZmFsc2UpO1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoJ3N0b3AnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgY3VycmVudCBwbGF5YmFjayBzdGF0ZVxyXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHQgKi9cclxuXHRnZXQgc3RhdGUoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc3RhdGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUb2dnbGUgcGxheWJhY2sgb2YgbW92aWUgc2NlbmFyaW9cclxuXHQgKi9cclxuXHR0b2dnbGUoKSB7XHJcblx0XHRpZiAodGhpcy5fc3RhdGUgPT09IFNUQVRFX1BMQVkpIHtcclxuXHRcdFx0dGhpcy5wYXVzZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5wbGF5KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXF1ZXN0VGltZXIoZm4sIGRlbGF5KSB7XHJcblx0XHRpZiAodGhpcy5fc3RhdGUgIT09IFNUQVRFX1BMQVkpIHtcclxuXHRcdFx0Ly8gc2F2ZSBmdW5jdGlvbiBjYWxsIGludG8gYSBxdWV1ZSB0aWxsIG5leHQgJ3BsYXkoKScgY2FsbFxyXG5cdFx0XHR0aGlzLl90aW1lclF1ZXVlLnB1c2goe1xyXG5cdFx0XHRcdGZuOiBmbixcclxuXHRcdFx0XHRkZWxheTogZGVsYXlcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gcmVxdWVzdFRpbWVyKGZuLCBkZWxheSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBib3Jyb3dlZCBmcm9tIEJhY2tib25lXHJcblx0LyoqXHJcblx0ICogQmluZCBvbmUgb3IgbW9yZSBzcGFjZSBzZXBhcmF0ZWQgZXZlbnRzLCBgZXZlbnRzYCwgdG8gYSBgY2FsbGJhY2tgXHJcblx0ICogZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZCB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxyXG5cdCAqIEBtZW1iZXJPZiBldmVudERpc3BhdGNoZXJcclxuXHQgKi9cclxuXHRvbihldmVudHMsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcblx0XHR2YXIgY2FsbHMsIGV2ZW50LCBub2RlLCB0YWlsLCBsaXN0O1xyXG5cdFx0aWYgKCFjYWxsYmFjaykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHRldmVudHMgPSBldmVudHMuc3BsaXQoZXZlbnRTcGxpdHRlcik7XHJcblx0XHRjYWxscyA9IHRoaXMuX2NhbGxiYWNrcyB8fCAodGhpcy5fY2FsbGJhY2tzID0ge30pO1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhbiBpbW11dGFibGUgY2FsbGJhY2sgbGlzdCwgYWxsb3dpbmcgdHJhdmVyc2FsIGR1cmluZ1xyXG5cdFx0Ly8gbW9kaWZpY2F0aW9uLiAgVGhlIHRhaWwgaXMgYW4gZW1wdHkgb2JqZWN0IHRoYXQgd2lsbCBhbHdheXMgYmUgdXNlZFxyXG5cdFx0Ly8gYXMgdGhlIG5leHQgbm9kZS5cclxuXHRcdHdoaWxlIChldmVudCA9IGV2ZW50cy5zaGlmdCgpKSB7XHJcblx0XHRcdGxpc3QgPSBjYWxsc1tldmVudF07XHJcblx0XHRcdG5vZGUgPSBsaXN0ID8gbGlzdC50YWlsIDoge307XHJcblx0XHRcdG5vZGUubmV4dCA9IHRhaWwgPSB7fTtcclxuXHRcdFx0bm9kZS5jb250ZXh0ID0gY29udGV4dDtcclxuXHRcdFx0bm9kZS5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cdFx0XHRjYWxsc1tldmVudF0gPSB7XHJcblx0XHRcdFx0dGFpbCA6IHRhaWwsXHJcblx0XHRcdFx0bmV4dCA6IGxpc3QgPyBsaXN0Lm5leHQgOiBub2RlXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZW1vdmUgb25lIG9yIG1hbnkgY2FsbGJhY2tzLiBJZiBgY29udGV4dGAgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcclxuXHQgKiBjYWxsYmFja3Mgd2l0aCB0aGF0IGZ1bmN0aW9uLiBJZiBgY2FsbGJhY2tgIGlzIG51bGwsIHJlbW92ZXMgYWxsXHJcblx0ICogY2FsbGJhY2tzIGZvciB0aGUgZXZlbnQuIElmIGBldmVudHNgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXHJcblx0ICogY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBldmVudHNcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XHJcblx0ICovXHJcblx0b2ZmKGV2ZW50cywgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuXHRcdHZhciBldmVudCwgY2FsbHMsIG5vZGUsIHRhaWwsIGNiLCBjdHg7XHJcblxyXG5cdFx0Ly8gTm8gZXZlbnRzLCBvciByZW1vdmluZyAqYWxsKiBldmVudHMuXHJcblx0XHRpZiAoIShjYWxscyA9IHRoaXMuX2NhbGxiYWNrcykpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghKGV2ZW50cyB8fCBjYWxsYmFjayB8fCBjb250ZXh0KSkge1xyXG5cdFx0XHRkZWxldGUgdGhpcy5fY2FsbGJhY2tzO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBMb29wIHRocm91Z2ggdGhlIGxpc3RlZCBldmVudHMgYW5kIGNvbnRleHRzLCBzcGxpY2luZyB0aGVtIG91dCBvZiB0aGVcclxuXHRcdC8vIGxpbmtlZCBsaXN0IG9mIGNhbGxiYWNrcyBpZiBhcHByb3ByaWF0ZS5cclxuXHRcdGV2ZW50cyA9IGV2ZW50cyA/IGV2ZW50cy5zcGxpdChldmVudFNwbGl0dGVyKSA6IE9iamVjdC5rZXlzKGNhbGxzKTtcclxuXHRcdHdoaWxlIChldmVudCA9IGV2ZW50cy5zaGlmdCgpKSB7XHJcblx0XHRcdG5vZGUgPSBjYWxsc1tldmVudF07XHJcblx0XHRcdGRlbGV0ZSBjYWxsc1tldmVudF07XHJcblx0XHRcdGlmICghbm9kZSB8fCAhKGNhbGxiYWNrIHx8IGNvbnRleHQpKSB7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIENyZWF0ZSBhIG5ldyBsaXN0LCBvbWl0dGluZyB0aGUgaW5kaWNhdGVkIGNhbGxiYWNrcy5cclxuXHRcdFx0dGFpbCA9IG5vZGUudGFpbDtcclxuXHRcdFx0d2hpbGUgKChub2RlID0gbm9kZS5uZXh0KSAhPT0gdGFpbCkge1xyXG5cdFx0XHRcdGNiID0gbm9kZS5jYWxsYmFjaztcclxuXHRcdFx0XHRjdHggPSBub2RlLmNvbnRleHQ7XHJcblx0XHRcdFx0aWYgKChjYWxsYmFjayAmJiBjYiAhPT0gY2FsbGJhY2spIHx8IChjb250ZXh0ICYmIGN0eCAhPT0gY29udGV4dCkpIHtcclxuXHRcdFx0XHRcdHRoaXMub24oZXZlbnQsIGNiLCBjdHgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXHJcblx0ICogcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcclxuXHQgKiAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2tcclxuXHQgKiB0byByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50c1xyXG5cdCAqL1xyXG5cdHRyaWdnZXIoZXZlbnRzLCAuLi5yZXN0KSB7XHJcblx0XHR2YXIgZXZlbnQsIG5vZGUsIGNhbGxzLCB0YWlsLCBhcmdzLCBhbGw7XHJcblx0XHRpZiAoIShjYWxscyA9IHRoaXMuX2NhbGxiYWNrcykpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblxyXG5cdFx0YWxsID0gY2FsbHMuYWxsO1xyXG5cdFx0ZXZlbnRzID0gZXZlbnRzLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xyXG5cclxuXHRcdC8vIEZvciBlYWNoIGV2ZW50LCB3YWxrIHRocm91Z2ggdGhlIGxpbmtlZCBsaXN0IG9mIGNhbGxiYWNrcyB0d2ljZSxcclxuXHRcdC8vIGZpcnN0IHRvIHRyaWdnZXIgdGhlIGV2ZW50LCB0aGVuIHRvIHRyaWdnZXIgYW55IGBcImFsbFwiYCBjYWxsYmFja3MuXHJcblx0XHR3aGlsZSAoZXZlbnQgPSBldmVudHMuc2hpZnQoKSkge1xyXG5cdFx0XHRpZiAobm9kZSA9IGNhbGxzW2V2ZW50XSkge1xyXG5cdFx0XHRcdHRhaWwgPSBub2RlLnRhaWw7XHJcblx0XHRcdFx0d2hpbGUgKChub2RlID0gbm9kZS5uZXh0KSAhPT0gdGFpbCkge1xyXG5cdFx0XHRcdFx0bm9kZS5jYWxsYmFjay5hcHBseShub2RlLmNvbnRleHQgfHwgdGhpcywgcmVzdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChub2RlID0gYWxsKSB7XHJcblx0XHRcdFx0dGFpbCA9IG5vZGUudGFpbDtcclxuXHRcdFx0XHRhcmdzID0gWyBldmVudCBdLmNvbmNhdChyZXN0KTtcclxuXHRcdFx0XHR3aGlsZSAoKG5vZGUgPSBub2RlLm5leHQpICE9PSB0YWlsKSB7XHJcblx0XHRcdFx0XHRub2RlLmNhbGxiYWNrLmFwcGx5KG5vZGUuY29udGV4dCB8fCB0aGlzLCBhcmdzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIGFjdGlvbiBjYWxsIGZyb20gc3RyaW5nXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZUFjdGlvbkNhbGwoZGF0YSkge1xyXG5cdGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdHZhciBwYXJ0cyA9IGRhdGEuc3BsaXQoJzonKTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG5hbWU6IHBhcnRzLnNoaWZ0KCksXHJcblx0XHRcdG9wdGlvbnM6IHBhcnRzLmpvaW4oJzonKVxyXG5cdFx0fTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dmFyIG5hbWUgPSBPYmplY3Qua2V5cyhkYXRhKVswXTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG5hbWU6IG5hbWUsXHJcblx0XHRcdG9wdGlvbnM6IGRhdGFbbmFtZV1cclxuXHRcdH07XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXF1ZXN0VGltZXIoZm4sIGRlbGF5KSB7XHJcblx0aWYgKCFkZWxheSkge1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoZm4sIGRlbGF5KTtcclxuXHR9XHJcbn1cclxuIiwidmFyIHByb3BDYWNoZSA9IHt9O1xyXG5cclxuLy8gZGV0ZWN0IENTUyAzRCBUcmFuc2Zvcm1zIGZvciBzbW9vdGhlciBhbmltYXRpb25zIFxyXG5leHBvcnQgdmFyIGhhczNkID0gKGZ1bmN0aW9uKCkge1xyXG5cdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdHZhciBjc3NUcmFuc2Zvcm0gPSBwcmVmaXhlZCgndHJhbnNmb3JtJyk7XHJcblx0aWYgKGNzc1RyYW5zZm9ybSkge1xyXG5cdFx0ZWwuc3R5bGVbY3NzVHJhbnNmb3JtXSA9ICd0cmFuc2xhdGVaKDApJztcclxuXHRcdHJldHVybiAoL3RyYW5zbGF0ZXovaSkudGVzdChlbC5zdHlsZVtjc3NUcmFuc2Zvcm1dKTsgXHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufSkoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob2JqLCAuLi5hcmdzKSB7XHJcblx0YXJncy5mb3JFYWNoKGEgPT4ge1xyXG5cdFx0aWYgKHR5cGVvZiBhID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRPYmplY3Qua2V5cyhhKS5mb3JFYWNoKGtleSA9PiBvYmpba2V5XSA9IGFba2V5XSk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0cmV0dXJuIG9iajtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXkob2JqLCBpeD0wKSB7XHJcblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG9iaiwgaXgpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBwcmVmaXhlZCAoaWYgcmVxdWlyZWQpIENTUyBwcm9wZXJ0eSBuYW1lXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gcHJvcFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlZml4ZWQocHJvcCkge1xyXG5cdGlmIChwcm9wIGluIHByb3BDYWNoZSkge1xyXG5cdFx0cmV0dXJuIHByb3BDYWNoZVtwcm9wXTtcclxuXHR9XHJcblxyXG5cdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdHZhciBzdHlsZSA9IGVsLnN0eWxlO1xyXG5cclxuXHR2YXIgcHJlZml4ZXMgPSBbJ28nLCAnbXMnLCAnbW96JywgJ3dlYmtpdCddO1xyXG5cdHZhciBwcm9wcyA9IFtwcm9wXTtcclxuXHR2YXIgY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHN0cikge1xyXG5cdFx0cmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHIoMSk7XHJcblx0fTtcclxuXHJcblx0cHJvcCA9IHByb3AucmVwbGFjZSgvXFwtKFthLXpdKS9nLCBmdW5jdGlvbihzdHIsIGNoKSB7XHJcblx0XHRyZXR1cm4gY2gudG9VcHBlckNhc2UoKTtcclxuXHR9KTtcclxuXHJcblx0dmFyIGNhcFByb3AgPSBjYXBpdGFsaXplKHByb3ApO1xyXG5cdHByZWZpeGVzLmZvckVhY2goZnVuY3Rpb24ocHJlZml4KSB7XHJcblx0XHRwcm9wcy5wdXNoKHByZWZpeCArIGNhcFByb3AsIGNhcGl0YWxpemUocHJlZml4KSArIGNhcFByb3ApO1xyXG5cdH0pO1xyXG5cclxuXHRmb3IgKHZhciBpID0gMCwgaWwgPSBwcm9wcy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XHJcblx0XHRpZiAocHJvcHNbaV0gaW4gc3R5bGUpIHtcclxuXHRcdFx0cmV0dXJuIHByb3BDYWNoZVtwcm9wXSA9IHByb3BzW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHByb3BDYWNoZVtwcm9wXSA9IG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3NPYmoob2JqKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdGxpbmU6IG9iai5saW5lLFxyXG5cdFx0Y2g6IG9iai5jaFxyXG5cdH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3IoZWRpdG9yLCBzdGFydD0nZnJvbScpIHtcclxuXHRyZXR1cm4gcG9zT2JqKGVkaXRvci5nZXRDdXJzb3Ioc3RhcnQpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHByb2R1Y2VzIDxjb2RlPntsaW5lLCBjaH08L2NvZGU+IG9iamVjdCBmcm9tXHJcbiAqIHBhc3NlZCBhcmd1bWVudFxyXG4gKiBAcGFyYW0ge09iamVjdH0gcG9zXHJcbiAqIEBwYXJhbSB7Q29kZU1pcnJvcn0gZWRpdG9yXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBvcyhwb3MsIGVkaXRvcikge1xyXG5cdGlmIChwb3MgPT09ICdjYXJldCcpIHtcclxuXHRcdHJldHVybiBnZXRDdXJzb3IoZWRpdG9yKTtcclxuXHR9XHJcblxyXG5cdGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykge1xyXG5cdFx0aWYgKH5wb3MuaW5kZXhPZignOicpKSB7XHJcblx0XHRcdGxldCBwYXJ0cyA9IHBvcy5zcGxpdCgnOicpO1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdGxpbmU6ICtwYXJ0c1swXSxcclxuXHRcdFx0XHRjaDogK3BhcnRzWzFdXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHBvcyA9ICtwb3M7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0eXBlb2YgcG9zID09PSAnbnVtYmVyJykge1xyXG5cdFx0cmV0dXJuIHBvc09iaihlZGl0b3IucG9zRnJvbUluZGV4KHBvcykpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcG9zT2JqKHBvcyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZSh0bXBsLCBkYXRhKSB7XHJcblx0dmFyIGZuID0gZGF0YSA9PiB0bXBsLnJlcGxhY2UoLzwlKFstPV0pP1xccyooW1xcd1xcLV0rKVxccyolPi9nLCAoc3RyLCBvcCwga2V5KSA9PiBkYXRhW2tleS50cmltKCldKTtcclxuXHRyZXR1cm4gZGF0YSA/IGZuKGRhdGEpIDogZm47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kKGFyciwgaXRlcikge1xyXG5cdHZhciBmb3VuZDtcclxuXHRhcnIuc29tZSgoaXRlbSwgaSwgYXJyKSA9PiB7XHJcblx0XHRpZiAoaXRlcihpdGVtLCBpLCBhcnIpKSB7XHJcblx0XHRcdHJldHVybiBmb3VuZCA9IGl0ZW07XHJcblx0XHR9XHJcblx0fSk7XHJcblx0cmV0dXJuIGZvdW5kO1xyXG59XHJcblxyXG4vKipcclxuICogUmVsYXhlZCBKU09OIHBhcnNlci5cclxuICogQHBhcmFtIHtTdHJpbmd9IHRleHRcclxuICogQHJldHVybnMge09iamVjdH0gXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKU09OKHRleHQpIHtcclxuXHR0cnkge1xyXG5cdFx0cmV0dXJuIChuZXcgRnVuY3Rpb24oJ3JldHVybiAnICsgdGV4dCkpKCk7XHJcblx0fSBjYXRjaChlKSB7XHJcblx0XHRyZXR1cm4ge307XHJcblx0fVxyXG59IiwidmFyIGdsb2JhbCA9IHdpbmRvdztcclxudmFyIHRpbWUgPSBEYXRlLm5vdyBcclxuXHQ/IGZ1bmN0aW9uKCkge3JldHVybiBEYXRlLm5vdygpO31cclxuXHQ6IGZ1bmN0aW9uKCkge3JldHVybiArbmV3IERhdGU7fTtcclxuXHJcbnZhciBpbmRleE9mID0gJ2luZGV4T2YnIGluIEFycmF5LnByb3RvdHlwZVxyXG5cdD8gZnVuY3Rpb24oYXJyYXksIHZhbHVlKSB7cmV0dXJuIGFycmF5LmluZGV4T2YodmFsdWUpO31cclxuXHQ6IGZ1bmN0aW9uKGFycmF5LCB2YWx1ZSkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGlsID0gYXJyYXkubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xyXG5cdFx0XHRpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gLTE7XHJcblx0fTtcclxuXHJcbmZ1bmN0aW9uIGV4dGVuZChvYmopIHtcclxuXHRmb3IgKHZhciBpID0gMSwgaWwgPSBhcmd1bWVudHMubGVuZ3RoLCBzb3VyY2U7IGkgPCBpbDsgaSsrKSB7XHJcblx0XHRzb3VyY2UgPSBhcmd1bWVudHNbaV07XHJcblx0XHRpZiAoc291cmNlKSB7XHJcblx0XHRcdGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XHJcblx0XHRcdFx0b2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb2JqO1xyXG59XHJcblxyXG4vKipcclxuICogcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlclxyXG4gKiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXHJcbiAqIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXHJcbiAqIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuXHR2YXIgbGFzdFRpbWUgPSAwO1xyXG5cdHZhciB2ZW5kb3JzID0gWyAnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJyBdO1xyXG5cdGZvciAodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIWdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xyXG5cdFx0Z2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGdsb2JhbFt2ZW5kb3JzW3hdICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xyXG5cdFx0Z2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZ2xvYmFsW3ZlbmRvcnNbeF0gKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxyXG5cdFx0XHRcdHx8IGdsb2JhbFt2ZW5kb3JzW3hdICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIWdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXHJcblx0XHRnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcclxuXHRcdFx0dmFyIGN1cnJUaW1lID0gdGltZSgpO1xyXG5cdFx0XHR2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcclxuXHRcdFx0dmFyIGlkID0gZ2xvYmFsLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTtcclxuXHRcdFx0fSwgdGltZVRvQ2FsbCk7XHJcblx0XHRcdGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xyXG5cdFx0XHRyZXR1cm4gaWQ7XHJcblx0XHR9O1xyXG5cclxuXHRpZiAoIWdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSlcclxuXHRcdGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGlkKSB7XHJcblx0XHRcdGNsZWFyVGltZW91dChpZCk7XHJcblx0XHR9O1xyXG59KCkpO1xyXG5cclxuXHJcbnZhciBkdW1teUZuID0gZnVuY3Rpb24oKSB7fTtcclxudmFyIGFuaW1zID0gW107XHJcbnZhciBpZENvdW50ZXIgPSAwO1xyXG5cclxudmFyIGRlZmF1bHRzID0ge1xyXG5cdGR1cmF0aW9uOiA1MDAsIC8vIG1zXHJcblx0ZGVsYXk6IDAsXHJcblx0ZWFzaW5nOiAnbGluZWFyJyxcclxuXHRzdGFydDogZHVtbXlGbixcclxuXHRzdGVwOiBkdW1teUZuLFxyXG5cdGNvbXBsZXRlOiBkdW1teUZuLFxyXG5cdGF1dG9zdGFydDogdHJ1ZSxcclxuXHRyZXZlcnNlOiBmYWxzZVxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBlYXNpbmdzID0ge1xyXG5cdGxpbmVhcjogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0cmV0dXJuIGMgKiB0IC8gZCArIGI7XHJcblx0fSxcclxuXHRpblF1YWQ6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcclxuXHRcdHJldHVybiBjKih0Lz1kKSp0ICsgYjtcclxuXHR9LFxyXG5cdG91dFF1YWQ6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHtcclxuXHRcdHJldHVybiAtYyAqKHQvPWQpKih0LTIpICsgYjtcclxuXHR9LFxyXG5cdGluT3V0UXVhZDogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0aWYoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKnQqdCArIGI7XHJcblx0XHRyZXR1cm4gLWMvMiAqKCgtLXQpKih0LTIpIC0gMSkgKyBiO1xyXG5cdH0sXHJcblx0aW5DdWJpYzogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0cmV0dXJuIGMqKHQvPWQpKnQqdCArIGI7XHJcblx0fSxcclxuXHRvdXRDdWJpYzogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0cmV0dXJuIGMqKCh0PXQvZC0xKSp0KnQgKyAxKSArIGI7XHJcblx0fSxcclxuXHRpbk91dEN1YmljOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XHJcblx0XHRpZigodC89ZC8yKSA8IDEpIHJldHVybiBjLzIqdCp0KnQgKyBiO1xyXG5cdFx0cmV0dXJuIGMvMiooKHQtPTIpKnQqdCArIDIpICsgYjtcclxuXHR9LFxyXG5cdGluRXhwbzogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0cmV0dXJuKHQ9PTApID8gYiA6IGMgKiBNYXRoLnBvdygyLCAxMCAqKHQvZCAtIDEpKSArIGIgLSBjICogMC4wMDE7XHJcblx0fSxcclxuXHRvdXRFeHBvOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XHJcblx0XHRyZXR1cm4odD09ZCkgPyBiK2MgOiBjICogMS4wMDEgKigtTWF0aC5wb3coMiwgLTEwICogdC9kKSArIDEpICsgYjtcclxuXHR9LFxyXG5cdGluT3V0RXhwbzogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0aWYodD09MCkgcmV0dXJuIGI7XHJcblx0XHRpZih0PT1kKSByZXR1cm4gYitjO1xyXG5cdFx0aWYoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yICogTWF0aC5wb3coMiwgMTAgKih0IC0gMSkpICsgYiAtIGMgKiAwLjAwMDU7XHJcblx0XHRyZXR1cm4gYy8yICogMS4wMDA1ICooLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKSArIGI7XHJcblx0fSxcclxuXHRpbkVsYXN0aWM6IGZ1bmN0aW9uKHQsIGIsIGMsIGQsIGEsIHApIHtcclxuXHRcdHZhciBzO1xyXG5cdFx0aWYodD09MCkgcmV0dXJuIGI7ICBpZigodC89ZCk9PTEpIHJldHVybiBiK2M7ICBpZighcCkgcD1kKi4zO1xyXG5cdFx0aWYoIWEgfHwgYSA8IE1hdGguYWJzKGMpKSB7IGE9Yzsgcz1wLzQ7IH0gZWxzZSBzID0gcC8oMipNYXRoLlBJKSAqIE1hdGguYXNpbihjL2EpO1xyXG5cdFx0cmV0dXJuIC0oYSpNYXRoLnBvdygyLDEwKih0LT0xKSkgKiBNYXRoLnNpbigodCpkLXMpKigyKk1hdGguUEkpL3AgKSkgKyBiO1xyXG5cdH0sXHJcblx0b3V0RWxhc3RpYzogZnVuY3Rpb24odCwgYiwgYywgZCwgYSwgcCkge1xyXG5cdFx0dmFyIHM7XHJcblx0XHRpZih0PT0wKSByZXR1cm4gYjsgIGlmKCh0Lz1kKT09MSkgcmV0dXJuIGIrYzsgIGlmKCFwKSBwPWQqLjM7XHJcblx0XHRpZighYSB8fCBhIDwgTWF0aC5hYnMoYykpIHsgYT1jOyBzPXAvNDsgfSBlbHNlIHMgPSBwLygyKk1hdGguUEkpICogTWF0aC5hc2luKGMvYSk7XHJcblx0XHRyZXR1cm4oYSpNYXRoLnBvdygyLC0xMCp0KSAqIE1hdGguc2luKCh0KmQtcykqKDIqTWF0aC5QSSkvcCApICsgYyArIGIpO1xyXG5cdH0sXHJcblx0aW5PdXRFbGFzdGljOiBmdW5jdGlvbih0LCBiLCBjLCBkLCBhLCBwKSB7XHJcblx0XHR2YXIgcztcclxuXHRcdGlmKHQ9PTApIHJldHVybiBiOyBcclxuXHRcdGlmKCh0Lz1kLzIpPT0yKSByZXR1cm4gYitjO1xyXG5cdFx0aWYoIXApIHA9ZCooLjMqMS41KTtcclxuXHRcdGlmKCFhIHx8IGEgPCBNYXRoLmFicyhjKSkgeyBhPWM7IHM9cC80OyB9ICAgICAgIGVsc2UgcyA9IHAvKDIqTWF0aC5QSSkgKiBNYXRoLmFzaW4oYy9hKTtcclxuXHRcdGlmKHQgPCAxKSByZXR1cm4gLS41KihhKk1hdGgucG93KDIsMTAqKHQtPTEpKSAqIE1hdGguc2luKCh0KmQtcykqKDIqTWF0aC5QSSkvcCApKSArIGI7XHJcblx0XHRyZXR1cm4gYSpNYXRoLnBvdygyLC0xMCoodC09MSkpICogTWF0aC5zaW4oKHQqZC1zKSooMipNYXRoLlBJKS9wICkqLjUgKyBjICsgYjtcclxuXHR9LFxyXG5cdGluQmFjazogZnVuY3Rpb24odCwgYiwgYywgZCwgcykge1xyXG5cdFx0aWYocyA9PSB1bmRlZmluZWQpIHMgPSAxLjcwMTU4O1xyXG5cdFx0cmV0dXJuIGMqKHQvPWQpKnQqKChzKzEpKnQgLSBzKSArIGI7XHJcblx0fSxcclxuXHRvdXRCYWNrOiBmdW5jdGlvbih0LCBiLCBjLCBkLCBzKSB7XHJcblx0XHRpZihzID09IHVuZGVmaW5lZCkgcyA9IDEuNzAxNTg7XHJcblx0XHRyZXR1cm4gYyooKHQ9dC9kLTEpKnQqKChzKzEpKnQgKyBzKSArIDEpICsgYjtcclxuXHR9LFxyXG5cdGluT3V0QmFjazogZnVuY3Rpb24odCwgYiwgYywgZCwgcykge1xyXG5cdFx0aWYocyA9PSB1bmRlZmluZWQpIHMgPSAxLjcwMTU4O1xyXG5cdFx0aWYoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKih0KnQqKCgocyo9KDEuNTI1KSkrMSkqdCAtIHMpKSArIGI7XHJcblx0XHRyZXR1cm4gYy8yKigodC09MikqdCooKChzKj0oMS41MjUpKSsxKSp0ICsgcykgKyAyKSArIGI7XHJcblx0fSxcclxuXHRpbkJvdW5jZTogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0cmV0dXJuIGMgLSB0aGlzLm91dEJvdW5jZSh0LCBkLXQsIDAsIGMsIGQpICsgYjtcclxuXHR9LFxyXG5cdG91dEJvdW5jZTogZnVuY3Rpb24odCwgYiwgYywgZCkge1xyXG5cdFx0aWYoKHQvPWQpIDwoMS8yLjc1KSkge1xyXG5cdFx0XHRyZXR1cm4gYyooNy41NjI1KnQqdCkgKyBiO1xyXG5cdFx0fSBlbHNlIGlmKHQgPCgyLzIuNzUpKSB7XHJcblx0XHRcdHJldHVybiBjKig3LjU2MjUqKHQtPSgxLjUvMi43NSkpKnQgKyAuNzUpICsgYjtcclxuXHRcdH0gZWxzZSBpZih0IDwoMi41LzIuNzUpKSB7XHJcblx0XHRcdHJldHVybiBjKig3LjU2MjUqKHQtPSgyLjI1LzIuNzUpKSp0ICsgLjkzNzUpICsgYjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBjKig3LjU2MjUqKHQtPSgyLjYyNS8yLjc1KSkqdCArIC45ODQzNzUpICsgYjtcclxuXHRcdH1cclxuXHR9LFxyXG5cdGluT3V0Qm91bmNlOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XHJcblx0XHRpZih0IDwgZC8yKSByZXR1cm4gdGhpcy5pbkJvdW5jZSh0KjIsIDAsIGMsIGQpICogLjUgKyBiO1xyXG5cdFx0cmV0dXJuIHRoaXMub3V0Qm91bmNlKHQqMi1kLCAwLCBjLCBkKSAqIC41ICsgYyouNSArIGI7XHJcblx0fSxcclxuXHRvdXRIYXJkOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7XHJcblx0XHR2YXIgdHMgPSAodC89ZCkqdDtcclxuXHRcdHZhciB0YyA9IHRzKnQ7XHJcblx0XHRyZXR1cm4gYiArIGMqKDEuNzUqdGMqdHMgKyAtNy40NDc1KnRzKnRzICsgMTIuOTk1KnRjICsgLTExLjU5NSp0cyArIDUuMjk3NSp0KTtcclxuXHR9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBtYWluTG9vcCgpIHtcclxuXHRpZiAoIWFuaW1zLmxlbmd0aCkge1xyXG5cdFx0Ly8gbm8gYW5pbWF0aW9ucyBsZWZ0LCBzdG9wIHBvbGxpbmdcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0dmFyIG5vdyA9IHRpbWUoKTtcclxuXHR2YXIgZmlsdGVyZWQgPSBbXSwgdHdlZW4sIG9wdDtcclxuXHJcblx0Ly8gZG8gbm90IHVzZSBBcnJheS5maWx0ZXIoKSBvZiBfLmZpbHRlcigpIGZ1bmN0aW9uXHJcblx0Ly8gc2luY2UgdHdlZW7igJlzIGNhbGxiYWNrcyBjYW4gYWRkIG5ldyBhbmltYXRpb25zXHJcblx0Ly8gaW4gcnVudGltZS4gSW4gdGhpcyBjYXNlLCBmaWx0ZXIgZnVuY3Rpb24gd2lsbCBsb29zZVxyXG5cdC8vIG5ld2x5IGNyZWF0ZWQgYW5pbWF0aW9uXHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbmltcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0dHdlZW4gPSBhbmltc1tpXTtcclxuXHJcblx0XHRpZiAoIXR3ZWVuLmFuaW1hdGluZykge1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHJcblx0XHRvcHQgPSB0d2Vlbi5vcHRpb25zO1xyXG5cclxuXHRcdGlmICh0d2Vlbi5zdGFydFRpbWUgPiBub3cpIHtcclxuXHRcdFx0ZmlsdGVyZWQucHVzaCh0d2Vlbik7XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0d2Vlbi5pbmZpbml0ZSkge1xyXG5cdFx0XHQvLyBvcHQuc3RlcC5jYWxsKHR3ZWVuLCAwKTtcclxuXHRcdFx0b3B0LnN0ZXAoMCwgdHdlZW4pO1xyXG5cdFx0XHRmaWx0ZXJlZC5wdXNoKHR3ZWVuKTtcclxuXHRcdH0gZWxzZSBpZiAodHdlZW4ucG9zID09PSAxIHx8IHR3ZWVuLmVuZFRpbWUgPD0gbm93KSB7XHJcblx0XHRcdHR3ZWVuLnBvcyA9IDE7XHJcblx0XHRcdC8vIG9wdC5zdGVwLmNhbGwodHdlZW4sIG9wdC5yZXZlcnNlID8gMCA6IDEpO1xyXG5cdFx0XHRvcHQuc3RlcChvcHQucmV2ZXJzZSA/IDAgOiAxLCB0d2Vlbik7XHJcblx0XHRcdHR3ZWVuLnN0b3AoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHR3ZWVuLnBvcyA9IG9wdC5lYXNpbmcobm93IC0gdHdlZW4uc3RhcnRUaW1lLCAwLCAxLCBvcHQuZHVyYXRpb24pO1xyXG5cdFx0XHQvLyBvcHQuc3RlcC5jYWxsKHR3ZWVuLCBvcHQucmV2ZXJzZSA/IDEgLSB0d2Vlbi5wb3MgOiB0d2Vlbi5wb3MpO1xyXG5cdFx0XHRvcHQuc3RlcChvcHQucmV2ZXJzZSA/IDEgLSB0d2Vlbi5wb3MgOiB0d2Vlbi5wb3MsIHR3ZWVuKTtcclxuXHRcdFx0ZmlsdGVyZWQucHVzaCh0d2Vlbik7XHJcblx0XHR9XHRcdFx0XHJcblx0fVxyXG5cclxuXHRhbmltcyA9IGZpbHRlcmVkO1xyXG5cclxuXHRpZiAoYW5pbXMubGVuZ3RoKSB7XHJcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFpbkxvb3ApO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkVG9RdWV1ZSh0d2Vlbikge1xyXG5cdGlmIChpbmRleE9mKGFuaW1zLCB0d2VlbikgPT0gLTEpIHtcclxuXHRcdGFuaW1zLnB1c2godHdlZW4pO1xyXG5cdFx0aWYgKGFuaW1zLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdG1haW5Mb29wKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHdlZW4ge1xyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuXHRcdHRoaXMub3B0aW9ucyA9IGV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cdFxyXG5cdFx0dmFyIGUgPSB0aGlzLm9wdGlvbnMuZWFzaW5nO1xyXG5cdFx0aWYgKHR5cGVvZiBlID09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGlmICghZWFzaW5nc1tlXSlcclxuXHRcdFx0XHR0aHJvdyAnVW5rbm93biBcIicgKyBlICsgJ1wiIGVhc2luZyBmdW5jdGlvbic7XHJcblx0XHRcdHRoaXMub3B0aW9ucy5lYXNpbmcgPSBlYXNpbmdzW2VdO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5lYXNpbmcgIT0gJ2Z1bmN0aW9uJylcclxuXHRcdFx0dGhyb3cgJ0Vhc2luZyBzaG91bGQgYmUgYSBmdW5jdGlvbic7XHJcblxyXG5cdFx0dGhpcy5faWQgPSAndHcnICsgKGlkQ291bnRlcisrKTtcclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hdXRvc3RhcnQpIHtcclxuXHRcdFx0dGhpcy5zdGFydCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RhcnQgYW5pbWF0aW9uIGZyb20gdGhlIGJlZ2lubmluZ1xyXG5cdCAqL1xyXG5cdHN0YXJ0KCkge1xyXG5cdFx0aWYgKCF0aGlzLmFuaW1hdGluZykge1xyXG5cdFx0XHR0aGlzLnBvcyA9IDA7XHJcblx0XHRcdHRoaXMuc3RhcnRUaW1lID0gdGltZSgpICsgKHRoaXMub3B0aW9ucy5kZWxheSB8fCAwKTtcclxuXHRcdFx0dGhpcy5pbmZpbml0ZSA9IHRoaXMub3B0aW9ucy5kdXJhdGlvbiA9PT0gJ2luZmluaXRlJztcclxuXHRcdFx0dGhpcy5lbmRUaW1lID0gdGhpcy5pbmZpbml0ZSA/IDAgOiB0aGlzLnN0YXJ0VGltZSArIHRoaXMub3B0aW9ucy5kdXJhdGlvbjtcclxuXHRcdFx0dGhpcy5hbmltYXRpbmcgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLm9wdGlvbnMuc3RhcnQodGhpcyk7XHJcblx0XHRcdGFkZFRvUXVldWUodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdG9wIGFuaW1hdGlvblxyXG5cdCAqL1xyXG5cdHN0b3AoKSB7XHJcblx0XHRpZiAodGhpcy5hbmltYXRpbmcpIHtcclxuXHRcdFx0dGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5jb21wbGV0ZSkge1xyXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5jb21wbGV0ZSh0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHR0b2dnbGUoKSB7XHJcblx0XHRpZiAodGhpcy5hbmltYXRpbmcpIHtcclxuXHRcdFx0dGhpcy5zdG9wKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnN0YXJ0KCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0d2VlbihvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBUd2VlbihvcHRpb25zKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBvciBzZXQgZGVmYXVsdCB2YWx1ZVxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcclxuICogQHBhcmFtICB7T2JqZWN0fSB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMobmFtZSwgdmFsdWUpIHtcclxuXHRpZiAodHlwZW9mIHZhbHVlICE9ICd1bmRlZmluZWQnKSB7XHJcblx0XHRkZWZhdWx0c1tuYW1lXSA9IHZhbHVlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGRlZmF1bHRzW25hbWVdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbGwgYWN0aXZlIGFuaW1hdGlvbiBvYmplY3RzLlxyXG4gKiBGb3IgZGVidWdnaW5nIG1vc3RseVxyXG4gKiBAcmV0dXJuIHtBcnJheX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfYWxsKCkge1xyXG5cdHJldHVybiBhbmltcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0b3AoKSB7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbmltcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0YW5pbXNbaV0uc3RvcCgpO1xyXG5cdH1cclxuXHJcblx0YW5pbXMubGVuZ3RoID0gMDtcclxufTsiLCIvKipcclxuICogU2hvd3MgZmFrZSBwcm9tcHQgZGlhbG9nIHdpdGggaW50ZXJhY3RpdmUgdmFsdWUgdHlwaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB0d2VlbiBmcm9tICcuLi92ZW5kb3IvdHdlZW4nO1xyXG5pbXBvcnQge2V4dGVuZCwgdGVtcGxhdGUsIGhhczNkLCBwcmVmaXhlZH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgKiBhcyBkb20gZnJvbSAnLi4vZG9tJztcclxuXHJcbnZhciBkaWFsb2dJbnN0YW5jZSA9IG51bGw7XHJcbnZhciBiZ0luc3RhbmNlID0gbnVsbDtcclxudmFyIGxhc3RUd2VlbiA9IG51bGw7XHJcblxyXG5leHBvcnQgdmFyIGFjdGlvbnMgPSB7XHJcblx0cHJvbXB0KHsgb3B0aW9ucywgZWRpdG9yLCBuZXh0LCB0aW1lciB9KSB7XHJcblx0XHRvcHRpb25zID0gZXh0ZW5kKHtcclxuXHRcdFx0dGl0bGU6ICdFbnRlciBzb21ldGhpbmcnLFxyXG5cdFx0XHRkZWxheTogODAsICAgICAgICAvLyBkZWxheSBiZXR3ZWVuIGNoYXJhY3RlciB0eXBpbmdcclxuXHRcdFx0dHlwZURlbGF5OiAxMDAwLCAgLy8gdGltZSB0byB3YWl0IGJlZm9yZSB0eXBpbmcgdGV4dFxyXG5cdFx0XHRoaWRlRGVsYXk6IDIwMDAgICAvLyB0aW1lIHRvIHdhaXQgYmVmb3JlIGhpZGluZyBwcm9tcHQgZGlhbG9nXHJcblx0XHR9LCB3cmFwKCd0ZXh0Jywgb3B0aW9ucykpO1xyXG5cclxuXHRcdHNob3cob3B0aW9ucy50aXRsZSwgZWRpdG9yLmdldFdyYXBwZXJFbGVtZW50KCksIGZ1bmN0aW9uKGRpYWxvZykge1xyXG5cdFx0XHR0aW1lcihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0eXBlVGV4dChkaWFsb2cucXVlcnlTZWxlY3RvcignLkNvZGVNaXJyb3ItcHJvbXB0X19pbnB1dCcpLCBvcHRpb25zLCB0aW1lciwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR0aW1lcihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0aGlkZShuZXh0KTtcclxuXHRcdFx0XHRcdH0sIG9wdGlvbnMuaGlkZURlbGF5KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSwgb3B0aW9ucy50eXBlRGVsYXkpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3codGV4dCwgdGFyZ2V0LCBjYWxsYmFjaykge1xyXG5cdGhpZGUoKTtcclxuXHRkaWFsb2dJbnN0YW5jZSA9IGRvbS50b0RPTShgPGRpdiBjbGFzcz1cIkNvZGVNaXJyb3ItcHJvbXB0XCI+XHJcblx0XHQ8ZGl2IGNsYXNzPVwiQ29kZU1pcnJvci1wcm9tcHRfX3RpdGxlXCI+JHt0ZXh0fTwvZGl2PlxyXG5cdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInByb21wdFwiIGNsYXNzPVwiQ29kZU1pcnJvci1wcm9tcHRfX2lucHV0XCIgcmVhZG9ubHk9XCJyZWFkb25seVwiIC8+XHJcblx0XHQ8L2Rpdj5gKTtcclxuXHRiZ0luc3RhbmNlID0gZG9tLnRvRE9NKCc8ZGl2IGNsYXNzPVwiQ29kZU1pcnJvci1wcm9tcHRfX3NoYWRlXCI+PC9kaXY+Jyk7XHJcblxyXG5cdHRhcmdldC5hcHBlbmRDaGlsZChkaWFsb2dJbnN0YW5jZSk7XHJcblx0dGFyZ2V0LmFwcGVuZENoaWxkKGJnSW5zdGFuY2UpO1xyXG5cclxuXHRhbmltYXRlU2hvdyhkaWFsb2dJbnN0YW5jZSwgYmdJbnN0YW5jZSwge2NvbXBsZXRlOiBjYWxsYmFja30pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGlkZShjYWxsYmFjaykge1xyXG5cdGlmIChkaWFsb2dJbnN0YW5jZSkge1xyXG5cdFx0aWYgKGxhc3RUd2Vlbikge1xyXG5cdFx0XHRsYXN0VHdlZW4uc3RvcCgpO1xyXG5cdFx0XHRsYXN0VHdlZW4gPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0YW5pbWF0ZUhpZGUoZGlhbG9nSW5zdGFuY2UsIGJnSW5zdGFuY2UsIHtjb21wbGV0ZTogY2FsbGJhY2t9KTtcclxuXHRcdGRpYWxvZ0luc3RhbmNlID0gYmdJbnN0YW5jZSA9IG51bGw7XHJcblx0fSBlbHNlIGlmIChjYWxsYmFjaykge1xyXG5cdFx0Y2FsbGJhY2soKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpYWxvZ1xyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGJnXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAqL1xyXG5mdW5jdGlvbiBhbmltYXRlU2hvdyhkaWFsb2csIGJnLCBvcHRpb25zPXt9KSB7XHJcblx0dmFyIGNzc1RyYW5zZm9ybSA9IHByZWZpeGVkKCd0cmFuc2Zvcm0nKTtcclxuXHR2YXIgZGlhbG9nU3R5bGUgPSBkaWFsb2cuc3R5bGU7XHJcblx0dmFyIGJnU3R5bGUgPSBiZy5zdHlsZTtcclxuXHR2YXIgaGVpZ2h0ID0gZGlhbG9nLm9mZnNldEhlaWdodDtcclxuXHR2YXIgdG1wbCA9IHRlbXBsYXRlKGhhczNkID8gJ3RyYW5zbGF0ZTNkKDAsIDwlPSBwb3MgJT4sIDApJyA6ICd0cmFuc2xhdGUoMCwgPCU9IHBvcyAlPiknKTtcclxuXHJcblx0YmdTdHlsZS5vcGFjaXR5ID0gMDtcclxuXHR0d2Vlbih7XHJcblx0XHRkdXJhdGlvbjogMjAwLFxyXG5cdFx0c3RlcChwb3MpIHtcclxuXHRcdFx0YmdTdHlsZS5vcGFjaXR5ID0gcG9zO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHRkaWFsb2dTdHlsZVtjc3NUcmFuc2Zvcm1dID0gdG1wbCh7cG9zOiAtaGVpZ2h0fSk7XHJcblxyXG5cdHJldHVybiBsYXN0VHdlZW4gPSB0d2Vlbih7XHJcblx0XHRkdXJhdGlvbjogNDAwLFxyXG5cdFx0ZWFzaW5nOiAnb3V0Q3ViaWMnLFxyXG5cdFx0c3RlcChwb3MpIHtcclxuXHRcdFx0ZGlhbG9nU3R5bGVbY3NzVHJhbnNmb3JtXSA9IHRtcGwoe3BvczogKC1oZWlnaHQgKiAoMSAtIHBvcykpICsgJ3B4J30pO1xyXG5cdFx0fSxcclxuXHRcdGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGFzdFR3ZWVuID0gbnVsbDtcclxuXHRcdFx0b3B0aW9ucy5jb21wbGV0ZSAmJiBvcHRpb25zLmNvbXBsZXRlKGRpYWxvZywgYmcpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtFbGVtZW50fSBkaWFsb2dcclxuICogQHBhcmFtIHtFbGVtZW50fSBiZ1xyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gYW5pbWF0ZUhpZGUoZGlhbG9nLCBiZywgb3B0aW9ucykge1xyXG5cdHZhciBkaWFsb2dTdHlsZSA9IGRpYWxvZy5zdHlsZTtcclxuXHR2YXIgYmdTdHlsZSA9IGJnLnN0eWxlO1xyXG5cdHZhciBoZWlnaHQgPSBkaWFsb2cub2Zmc2V0SGVpZ2h0O1xyXG5cdHZhciBjc3NUcmFuc2Zvcm0gPSBwcmVmaXhlZCgndHJhbnNmb3JtJyk7XHJcblx0dmFyIHRtcGwgPSB0ZW1wbGF0ZShoYXMzZCA/ICd0cmFuc2xhdGUzZCgwLCA8JT0gcG9zICU+LCAwKScgOiAndHJhbnNsYXRlKDAsIDwlPSBwb3MgJT4pJyk7XHJcblxyXG5cdHJldHVybiB0d2Vlbih7XHJcblx0XHRkdXJhdGlvbjogMjAwLFxyXG5cdFx0c3RlcChwb3MpIHtcclxuXHRcdFx0ZGlhbG9nU3R5bGVbY3NzVHJhbnNmb3JtXSA9IHRtcGwoe3BvczogKC1oZWlnaHQgKiBwb3MpICsgJ3B4J30pO1xyXG5cdFx0XHRiZ1N0eWxlLm9wYWNpdHkgPSAxIC0gcG9zO1xyXG5cdFx0fSxcclxuXHRcdGNvbXBsZXRlKCkge1xyXG5cdFx0XHRkb20ucmVtb3ZlKFtkaWFsb2csIGJnXSk7XHJcblx0XHRcdG9wdGlvbnMuY29tcGxldGUgJiYgb3B0aW9ucy5jb21wbGV0ZShkaWFsb2csIGJnKTtcclxuXHRcdH1cclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdHlwZVRleHQodGFyZ2V0LCBvcHRpb25zLCB0aW1lciwgbmV4dCkge1xyXG5cdHZhciBjaGFycyA9IG9wdGlvbnMudGV4dC5zcGxpdCgnJyk7XHJcblx0dGltZXIoZnVuY3Rpb24gcGVyZm9ybSgpIHtcclxuXHRcdHRhcmdldC52YWx1ZSArPSBjaGFycy5zaGlmdCgpO1xyXG5cdFx0aWYgKGNoYXJzLmxlbmd0aCkge1xyXG5cdFx0XHR0aW1lcihwZXJmb3JtLCBvcHRpb25zLmRlbGF5KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG5leHQoKTtcclxuXHRcdH1cclxuXHR9LCBvcHRpb25zLmRlbGF5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gd3JhcChrZXksIHZhbHVlKSB7XHJcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB2YWx1ZSA6IHtba2V5XTogdmFsdWV9O1xyXG59XHJcbiIsIi8qKlxyXG4gKiBFeHRlbnNpb24gdGhhdCBhbGxvd3MgYXV0aG9ycyB0byBkaXNwbGF5IGNvbnRleHQgdG9vbHRpcHMgYm91bmQgdG8gc3BlY2lmaWNcclxuICogcG9zaXRpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB0d2VlbiBmcm9tICcuLi92ZW5kb3IvdHdlZW4nO1xyXG5pbXBvcnQge2V4dGVuZCwgcHJlZml4ZWQsIG1ha2VQb3MsIGhhczNkfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCAqIGFzIGRvbSBmcm9tICcuLi9kb20nO1xyXG5cclxudmFyIGluc3RhbmNlID0gbnVsbDtcclxudmFyIGxhc3RUd2VlbiA9IG51bGw7XHJcblxyXG5leHBvcnQgdmFyIGFsaWduRGVmYXVsdHMgPSB7XHJcblx0LyoqIENTUyBzZWxlY3RvciBmb3IgZ2V0dGluZyBwb3B1cCB0YWlsICovXHJcblx0dGFpbENsYXNzOiAnQ29kZU1pcnJvci10b29sdGlwX190YWlsJyxcclxuXHJcblx0LyoqIENsYXNzIG5hbWUgZm9yIHN3aXRjaGluZyB0YWlsL3BvcHVwIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRhcmdldCBwb2ludCAqL1xyXG5cdGJlbG93Q2xhc3M6ICdDb2RlTWlycm9yLXRvb2x0aXBfYmVsb3cnLFxyXG5cclxuXHQvKiogTWluIGRpc3RhbmNlIGJldHdlZW4gcG9wdXAgYW5kIHZpZXdwb3J0ICovXHJcblx0cG9wdXBNYXJnaW46IDUsXHJcblxyXG5cdC8qKiBNaW4gZGlzdGFuY2UgYmV0d2VlbiBwb3B1cCBsZWZ0L3JpZ2h0IGVkZ2UgYW5kIGl0cyB0YWlsICovXHJcblx0dGFpbE1hcmdpbjogMTFcclxufTtcclxuXHJcbmV4cG9ydCB2YXIgYWN0aW9ucyA9IHtcclxuXHQvKipcclxuXHQgKiBTaG93cyB0b29sdGlwIHdpdGggZ2l2ZW4gdGV4dCwgd2FpdCBmb3IgYG9wdGlvbnMud2FpdGBcclxuXHQgKiBtaWxsaXNlY29uZHMgdGhlbiBoaWRlcyB0b29sdGlwXHJcblx0ICovXHJcblx0dG9vbHRpcCh7IG9wdGlvbnMsIGVkaXRvciwgbmV4dCwgdGltZXIgfSkge1xyXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7XHJcblx0XHRcdHdhaXQ6IDQwMDAsICAgLy8gdGltZSB0byB3YWl0IGJlZm9yZSBoaWRpbmcgdG9vbHRpcFxyXG5cdFx0XHRwb3M6ICdjYXJldCcgIC8vIHBvc2l0aW9uIHdoZXJlIHRvb2x0aXAgc2hvdWxkIHBvaW50IHRvXHJcblx0XHR9LCB3cmFwKCd0ZXh0Jywgb3B0aW9ucykpO1xyXG5cclxuXHRcdGNvbnN0IHsgdGV4dCB9ID0gb3B0aW9ucztcclxuXHRcdGNvbnN0IHBvcyA9IHJlc29sdmVQb3NpdGlvbihvcHRpb25zLnBvcywgZWRpdG9yKTtcclxuXHRcdGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xyXG4gICAgICB0aW1lcigoKSA9PiB7XHJcbiAgICAgICAgaGlkZSgoKSA9PiB0aW1lcihuZXh0KSk7XHJcbiAgICAgIH0sIG9wdGlvbnMud2FpdCk7XHJcbiAgICB9O1xyXG5cclxuXHRcdHNob3coe3RleHQsIHBvcywgY2FsbGJhY2t9KTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBTaG93cyB0b29sdGlwIHdpdGggc3BlY2lmaWVkIHRleHQuIFRoaXMgdG9vbHRpcCBzaG91bGQgYmUgZXhwbGljaXRseVxyXG5cdCAqIGhpZGRlbiB3aXRoIGBoaWRlVG9vbHRpcGAgYWN0aW9uXHJcblx0ICovXHJcblx0c2hvd1Rvb2x0aXAoeyBvcHRpb25zLCBlZGl0b3IsIG5leHQgfSkge1xyXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7XHJcblx0XHRcdHBvczogJ2NhcmV0JyAgLy8gcG9zaXRpb24gd2hlcmUgdG9vbHRpcCBzaG91bGQgcG9pbnQgdG9cclxuXHRcdH0sIHdyYXAoJ3RleHQnLCBvcHRpb25zKSk7XHJcblxyXG5cdFx0Y29uc3QgeyB0ZXh0IH0gPSBvcHRpb25zO1xyXG5cdFx0Y29uc3QgcG9zID0gcmVzb2x2ZVBvc2l0aW9uKG9wdGlvbnMucG9zLCBlZGl0b3IpO1xyXG5cclxuXHRcdHNob3coeyB0ZXh0LCBwb3MgfSk7XHJcblx0XHRuZXh0KCk7XHJcblx0fSxcclxuXHJcblx0c2hvd0NvbnRyb2xsZWRUb29sdGlwKHsgb3B0aW9ucywgZWRpdG9yLCBiYWNrLCBuZXh0LCBpc0ZpcnN0QWN0aW9uLCBpc0xhc3RBY3Rpb24gfSkge1xyXG4gICAgb3B0aW9ucyA9IGV4dGVuZCh7XHJcbiAgICAgIHBvczogJ2NhcmV0JyAgLy8gcG9zaXRpb24gd2hlcmUgdG9vbHRpcCBzaG91bGQgcG9pbnQgdG9cclxuICAgIH0sIHdyYXAoJ3RleHQnLCBvcHRpb25zKSk7XHJcblxyXG4gICAgY29uc3QgeyB0ZXh0IH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3QgcG9zID0gcmVzb2x2ZVBvc2l0aW9uKG9wdGlvbnMucG9zLCBlZGl0b3IpO1xyXG5cdFx0Y29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XHJcbiAgICAgIGlmICghaXNGaXJzdEFjdGlvbikge1xyXG4gICAgICBcdGNvbnN0IGJhY2tCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdG9vbHRpcC1jb250cm9scy1iYWNrJyk7XHJcbiAgICAgICAgYmFja0J1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgYmFja0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGJhY2spO1xyXG4gICAgICB9XHJcblxyXG5cdFx0XHRpZiAoIWlzTGFzdEFjdGlvbikge1xyXG4gICAgICAgIGNvbnN0IG5leHRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdG9vbHRpcC1jb250cm9scy1uZXh0Jyk7XHJcbiAgICAgICAgbmV4dEJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgbmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG5leHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNMYXN0QWN0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgZmluaXNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pzLXRvb2x0aXAtY29udHJvbHMtZmluaXNoJyk7XHJcbiAgICAgICAgZmluaXNoQnV0dG9uLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuICAgICAgICBmaW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgfSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG4gICAgc2hvdyh7XHJcblx0XHRcdHRleHQsXHJcblx0XHRcdHBvcyxcclxuICAgICAgY2FsbGJhY2ssXHJcblx0XHRcdGhhc0JhY2tDb250cm9sOiAhaXNGaXJzdEFjdGlvbixcclxuXHRcdFx0aGFzTmV4dENvbnRyb2w6ICFpc0xhc3RBY3Rpb24sXHJcblx0XHRcdGhhc0ZpbmlzaEJ1dHRvbjogaXNMYXN0QWN0aW9uLFxyXG4gICAgfSk7XHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogSGlkZXMgdG9vbHRpcCwgcHJldmlvdXNseSBzaG93biBieSAnc2hvd1Rvb2x0aXAnIGFjdGlvblxyXG5cdCAqL1xyXG5cdGhpZGVUb29sdGlwKHsgb3B0aW9ucywgZWRpdG9yLCBuZXh0LCB0aW1lciB9KSB7XHJcblx0XHRoaWRlKG5leHQpO1xyXG5cdH1cclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93KHsgdGV4dCwgcG9zLCBjYWxsYmFjaywgaGFzQmFja0NvbnRyb2wgPSBmYWxzZSwgaGFzTmV4dENvbnRyb2wgPSBmYWxzZSwgaGFzRmluaXNoQnV0dG9uID0gZmFsc2UgfSkge1xyXG5cdGhpZGUoKTtcclxuXHJcblx0aW5zdGFuY2UgPSBkb20udG9ET00oYDxkaXYgY2xhc3M9XCJDb2RlTWlycm9yLXRvb2x0aXBcIj5cclxuXHRcdDxkaXYgY2xhc3M9XCJDb2RlTWlycm9yLXRvb2x0aXBfX2NvbnRlbnRcIj4ke3RleHR9PC9kaXY+XHJcblx0XHQ8ZGl2IGNsYXNzPVwiQ29kZU1pcnJvci10b29sdGlwX19jb250cm9sc1wiPlxyXG5cdFx0XHQke2hhc0JhY2tDb250cm9sID8gJzxidXR0b24gaWQ9XCJqcy10b29sdGlwLWNvbnRyb2xzLWJhY2tcIiBkaXNhYmxlZD5CYWNrPC9idXR0b24+JyA6ICcnfVxyXG5cdFx0XHQke2hhc05leHRDb250cm9sID8gJzxidXR0b24gaWQ9XCJqcy10b29sdGlwLWNvbnRyb2xzLW5leHRcIiBkaXNhYmxlZD5OZXh0PC9idXR0b24+JyA6ICcnfVxyXG5cdFx0XHQke2hhc0ZpbmlzaEJ1dHRvbiA/ICc8YnV0dG9uIGlkPVwianMtdG9vbHRpcC1jb250cm9scy1maW5pc2hcIiBkaXNhYmxlZD5GaW5pc2g8L2J1dHRvbj4nIDogJyd9XHJcblx0XHQ8L2Rpdj5cclxuXHRcdDxkaXYgY2xhc3M9XCJDb2RlTWlycm9yLXRvb2x0aXBfX3RhaWxcIj48L2Rpdj5cclxuXHRcdDwvZGl2PmBcclxuXHQpO1xyXG5cclxuXHRkb20uY3NzKGluc3RhbmNlLCBwcmVmaXhlZCgndHJhbnNmb3JtJyksICdzY2FsZSgwKScpO1xyXG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xyXG5cclxuXHRhbGlnblBvcHVwV2l0aFRhaWwoaW5zdGFuY2UsIHtwb3NpdGlvbjogcG9zfSk7XHJcblx0YW5pbWF0ZVNob3coaW5zdGFuY2UsIHtjb21wbGV0ZTogY2FsbGJhY2t9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhpZGUoY2FsbGJhY2spIHtcclxuIFx0aWYgKGluc3RhbmNlKSB7XHJcblx0XHRpZiAobGFzdFR3ZWVuKSB7XHJcblx0XHRcdGxhc3RUd2Vlbi5zdG9wKCk7XHJcblx0XHRcdGxhc3RUd2VlbiA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRhbmltYXRlSGlkZShpbnN0YW5jZSwge2NvbXBsZXRlOiBjYWxsYmFja30pO1xyXG5cdFx0aW5zdGFuY2UgPSBudWxsO1xyXG5cdH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcclxuXHRcdGNhbGxiYWNrKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZmluZHMgb3B0aW1hbCBwb3NpdGlvbiBvZiB0b29sdGlwIHBvcHVwIG9uIHBhZ2VcclxuICogYW5kIGFsaWducyBwb3B1cCB0YWlsIHdpdGggdGhpcyBwb3NpdGlvblxyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHBvcHVwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAqL1xyXG5mdW5jdGlvbiBhbGlnblBvcHVwV2l0aFRhaWwocG9wdXAsIG9wdGlvbnM9e30pIHtcclxuXHRvcHRpb25zID0gZXh0ZW5kKHt9LCBhbGlnbkRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcblx0ZG9tLmNzcyhwb3B1cCwge1xyXG5cdFx0bGVmdDogMCxcclxuXHRcdHRvcDogMFxyXG5cdH0pO1xyXG5cclxuXHR2YXIgdGFpbCA9IHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy4nICsgb3B0aW9ucy50YWlsQ2xhc3MpO1xyXG5cclxuXHR2YXIgcmVzdWx0WCA9IDAsIHJlc3VsdFkgPSAwO1xyXG5cdHZhciBwb3MgPSBvcHRpb25zLnBvc2l0aW9uO1xyXG5cdHZhciB2cCA9IGRvbS52aWV3cG9ydFJlY3QoKTtcclxuXHJcblx0dmFyIHdpZHRoID0gcG9wdXAub2Zmc2V0V2lkdGg7XHJcblx0dmFyIGhlaWdodCA9IHBvcHVwLm9mZnNldEhlaWdodDtcclxuXHJcblx0dmFyIGlzVG9wO1xyXG5cclxuXHQvLyBjYWxjdWxhdGUgaG9yaXpvbnRhbCBwb3NpdGlvblxyXG5cdHJlc3VsdFggPSBNYXRoLm1pbih2cC53aWR0aCAtIHdpZHRoIC0gb3B0aW9ucy5wb3B1cE1hcmdpbiwgTWF0aC5tYXgob3B0aW9ucy5wb3B1cE1hcmdpbiwgcG9zLnggLSB2cC5sZWZ0IC0gd2lkdGggLyAyKSk7XHJcblxyXG5cdC8vIGNhbGN1bGF0ZSB2ZXJ0aWNhbCBwb3NpdGlvblxyXG5cdGlmIChoZWlnaHQgKyB0YWlsLm9mZnNldEhlaWdodCArIG9wdGlvbnMucG9wdXBNYXJnaW4gKyB2cC50b3AgPCBwb3MueSkge1xyXG5cdFx0Ly8gcGxhY2UgYWJvdmUgdGFyZ2V0IHBvc2l0aW9uXHJcblx0XHRyZXN1bHRZID0gTWF0aC5tYXgoMCwgcG9zLnkgLSBoZWlnaHQgLSB0YWlsLm9mZnNldEhlaWdodCk7XHJcblx0XHRpc1RvcCA9IHRydWU7XHJcblx0fSBlbHNlIHtcclxuXHRcdC8vIHBsYWNlIGJlbG93IHRhcmdldCBwb3NpdGlvblxyXG5cdFx0cmVzdWx0WSA9IHBvcy55ICsgdGFpbC5vZmZzZXRIZWlnaHQ7XHJcblx0XHRpc1RvcCA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Ly8gY2FsY3VsYXRlIHRhaWwgcG9zaXRpb25cclxuXHR2YXIgdGFpbE1pbkxlZnQgPSBvcHRpb25zLnRhaWxNYXJnaW47XHJcblx0dmFyIHRhaWxNYXhMZWZ0ID0gd2lkdGggLSBvcHRpb25zLnRhaWxNYXJnaW47XHJcblx0dGFpbC5zdHlsZS5sZWZ0ID0gTWF0aC5taW4odGFpbE1heExlZnQsIE1hdGgubWF4KHRhaWxNaW5MZWZ0LCBwb3MueCAtIHJlc3VsdFggLSB2cC5sZWZ0KSkgKyAncHgnO1xyXG5cclxuXHRkb20uY3NzKHBvcHVwLCB7XHJcblx0XHRsZWZ0OiByZXN1bHRYLFxyXG5cdFx0dG9wOiByZXN1bHRZXHJcblx0fSk7XHJcblxyXG5cdHBvcHVwLmNsYXNzTGlzdC50b2dnbGUob3B0aW9ucy5iZWxvd0NsYXNzLCAhaXNUb3ApO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1cclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIGFuaW1hdGVTaG93KGVsZW0sIG9wdGlvbnM9e30pIHtcclxuXHRvcHRpb25zID0gZXh0ZW5kKHt9LCBhbGlnbkRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHR2YXIgY3NzT3JpZ2luID0gcHJlZml4ZWQoJ3RyYW5zZm9ybS1vcmlnaW4nKTtcclxuXHR2YXIgY3NzVHJhbnNmb3JtID0gcHJlZml4ZWQoJ3RyYW5zZm9ybScpO1xyXG5cdHZhciBzdHlsZSA9IGVsZW0uc3R5bGU7XHJcblxyXG5cdHZhciB0YWlsID0gZWxlbS5xdWVyeVNlbGVjdG9yKCcuJyArIG9wdGlvbnMudGFpbENsYXNzKTtcclxuXHR2YXIgeE9yaWdpbiA9IGRvbS5jc3ModGFpbCwgJ2xlZnQnKTtcclxuXHR2YXIgeU9yaWdpbiA9IHRhaWwub2Zmc2V0VG9wO1xyXG5cdGlmIChlbGVtLmNsYXNzTGlzdC5jb250YWlucyhvcHRpb25zLmJlbG93Q2xhc3MpKSB7XHJcblx0XHR5T3JpZ2luIC09IHRhaWwub2Zmc2V0SGVpZ2h0O1xyXG5cdH1cclxuXHJcblx0eU9yaWdpbiArPSAncHgnO1xyXG5cclxuXHRzdHlsZVtjc3NPcmlnaW5dID0geE9yaWdpbiArICcgJyArIHlPcmlnaW47XHJcblx0dmFyIHByZWZpeCA9IGhhczNkID8gJ3RyYW5zbGF0ZVooMCkgJyA6ICcnO1xyXG5cclxuXHRyZXR1cm4gbGFzdFR3ZWVuID0gdHdlZW4oe1xyXG5cdFx0ZHVyYXRpb246IDgwMCxcclxuXHRcdGVhc2luZzogJ291dEVsYXN0aWMnLFxyXG5cdFx0c3RlcChwb3MpIHtcclxuXHRcdFx0c3R5bGVbY3NzVHJhbnNmb3JtXSA9IHByZWZpeCArICdzY2FsZSgnICsgcG9zICsgJyknO1xyXG5cdFx0fSxcclxuXHRcdGNvbXBsZXRlKCkge1xyXG5cdFx0XHRzdHlsZVtjc3NUcmFuc2Zvcm1dID0gJ25vbmUnO1xyXG5cdFx0XHRsYXN0VHdlZW4gPSBudWxsO1xyXG5cdFx0XHRvcHRpb25zLmNvbXBsZXRlICYmIG9wdGlvbnMuY29tcGxldGUoZWxlbSk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbVxyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gYW5pbWF0ZUhpZGUoZWxlbSwgb3B0aW9ucykge1xyXG5cdHZhciBzdHlsZSA9IGVsZW0uc3R5bGU7XHJcblxyXG5cdHJldHVybiB0d2Vlbih7XHJcblx0XHRkdXJhdGlvbjogMjAwLFxyXG5cdFx0ZWFzaW5nOiAnbGluZWFyJyxcclxuXHRcdHN0ZXA6IGZ1bmN0aW9uKHBvcykge1xyXG5cdFx0XHRzdHlsZS5vcGFjaXR5ID0gKDEgLSBwb3MpO1xyXG5cdFx0fSxcclxuXHRcdGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0ZG9tLnJlbW92ZShlbGVtKTtcclxuXHRcdFx0b3B0aW9ucy5jb21wbGV0ZSAmJiBvcHRpb25zLmNvbXBsZXRlKGVsZW0pO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUmVzb2x2ZXMgcG9zaXRpb24gd2hlcmUgdG9vbHRpcCBzaG91bGQgcG9pbnQgdG9cclxuICogQHBhcmFtIHtPYmplY3R9IHBvc1xyXG4gKiBAcGFyYW0ge0NvZGVNaXJyb3J9IGVkaXRvclxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCA8Y29kZT54PC9jb2RlPiBhbmQgPGNvZGU+eTwvY29kZT5cclxuICogcHJvcGVydGllc1xyXG4gKi9cclxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9uKHBvcywgZWRpdG9yKSB7XHJcblx0aWYgKHBvcyA9PT0gJ2NhcmV0Jykge1xyXG5cdFx0Ly8gZ2V0IGFic29sdXRlIHBvc2l0aW9uIG9mIGN1cnJlbnQgY2FyZXQgcG9zaXRpb25cclxuXHRcdHJldHVybiBzYW5pdGl6ZUNhcmV0UG9zKGVkaXRvci5jdXJzb3JDb29yZHModHJ1ZSkpO1xyXG5cdH1cclxuXHJcblx0aWYgKHR5cGVvZiBwb3MgPT09ICdvYmplY3QnKSB7XHJcblx0XHRpZiAoJ3gnIGluIHBvcyAmJiAneScgaW4gcG9zKSB7XHJcblx0XHRcdC8vIHBhc3NlZCBhYnNvbHV0ZSBjb29yZGluYXRlc1xyXG5cdFx0XHRyZXR1cm4gcG9zO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICgnbGVmdCcgaW4gcG9zICYmICd0b3AnIGluIHBvcykge1xyXG5cdFx0XHQvLyBwYXNzZWQgYWJzb2x1dGUgY29vcmRpbmF0ZXNcclxuXHRcdFx0cmV0dXJuIHNhbml0aXplQ2FyZXRQb3MocG9zKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHBvcyA9IG1ha2VQb3MocG9zLCBlZGl0b3IpO1xyXG5cdHJldHVybiBzYW5pdGl6ZUNhcmV0UG9zKGVkaXRvci5jaGFyQ29vcmRzKHBvcykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYW5pdGl6ZUNhcmV0UG9zKHBvcykge1xyXG5cdGlmICgnbGVmdCcgaW4gcG9zKSB7XHJcblx0XHRwb3MueCA9IHBvcy5sZWZ0O1xyXG5cdH1cclxuXHJcblx0aWYgKCd0b3AnIGluIHBvcykge1xyXG5cdFx0cG9zLnkgPSBwb3MudG9wO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gd3JhcChrZXksIHZhbHVlKSB7XHJcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB2YWx1ZSA6IHtba2V5XTogdmFsdWV9O1xyXG59XHJcbiJdfQ==
