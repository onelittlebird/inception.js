/*
	Copyright (c) 2010-2012 Filip Moberg, (filip@mcsquare.se)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	Author:		Filip Moberg
	Name:		inception.js
	Version:	1.2
	Codename:	Di Caprio
	Released:	2012-01-03
	Comments:	This version was so awesome, it deserved TWO new version numbers. Totally rebuilt from scratch - inception revisited.
*/

// Sandbox the environment
/** @param {...undefined} undefined */
(function(window, undefined) { 

	// Declare environment variables
	var document = window.document, navigator = window.navigator, location = window.location;


	// Create function in window object
	/** @constructor */
	window.inception = (function inception(oo) {

		var env = this;
		var self = this;
		var core = env.__core__;

		// Make sure core function is instantiated
		if (this === window) {
			return new inception(arguments[0]);
		}

		// Declare core object (with core functions)
		this.__core__ = {

			settings: {
				jQuery: {
					ready: "document"
				},
				error: {
					show: true
				}
			},

			onload: [],

			instance: arguments[0],

			// Extend a primary object with a secondary
			extend: function(o) {

				// If set to true, the returned object will be a copy instead of reference
				if (o.clone === true) {
					o.from = this.clone(o.from); 
				}

				for (var n in o.from) {
					if (o.construct === true && typeof o.from[n] === "function" && n !== "wrapper") {

						// Make a clone so the use of multiple selectors won't construct the same function twice
						o.from = this.clone(o.from);
						var core = env.__core__, node = [core.instance].concat(o.node.replace(/@/g, "").split(".")), wrapper = node[0], cache;
						o.wrapper = [];

						cache = core.wrapper.cache[core.instance];

						if (typeof cache === "function") {
							o.wrapper.push(cache);
						}

						for (var i=1; i < node.length; ++i) {
							wrapper = wrapper + "__" + node[i];
							cache = core.wrapper.cache[wrapper];
							if (typeof cache === "function") {
								o.wrapper.push(cache);
							}
						}

						for (var i=o.wrapper.length; i >= 0; --i) {

							// Construct the function
							o.from[n] = this.functionConstructor({method: o.from[n], func: n, node: o.node, loop: o.loop, wrapper: o.wrapper[i]});
						}
					}

					if (typeof o.from[n] === "object" && n !== "selector" && n !== "$") {

						if (typeof o.to[n] === "undefined") {
							if (o.from[n] === null) {
								o.to[n] = null;
							} else if (o.from[n].constructor.toString().indexOf("Array") !== -1) {
								o.to[n] = [];
							} else {
								o.to[n] = {};
							}
						}

						this.extend({to: o.to[n], from: o.from[n], construct: o.construct, node: o.node, loop: o.loop});
					} else {
						o.to[n] = o.from[n];
					}
				}

				return o.to;
			},

			// Create deep copy of target object
			clone: function() {
				return this.extend({to: {}, from: arguments[0]});
			},

			// Count child objects
			count : function(o) {

				var c = 0, i;

				for (i in o) {
					if (o.hasOwnProperty(o)) {
						++c;
					}
				}

				return c;
			},

			// Create object from node string
			stringToObject: function() {

				var selector = arguments[0].replace(/ /g, "").split("@").slice(1), a = [], s, o, i, node, shell;

				for (s in selector) {
					node = selector[s].split(".");

					if (node[0] !== "") {
						o = {};
						shell = o;

						for (i = 0; i < node.length-1; ++i) {
							o = o[node[i]] = {};
						}

						if (arguments[1]) {
							o = o[node[i]] = arguments[1];
						} else {
							o = o[node[i]] = {};
						}

						a.push(shell);
					}
				}

				return a;
			},

			// Create selector from node string
			stringToSelector: function() {
				var a = [], n = this.stringToArray(arguments[0]), i, x;

				for (i in n) {
					var s = n[i].split(".");
					var node = env;

					for (x in s) {
						if (typeof node[s[x]] !== "undefined") {
							node = node[s[x]];
						}
					}

					if (node !== env) {
						a.push(node);
					}
				}

				return a;
			},

			// Create array from node string
			stringToArray: function() {
				return arguments[0].replace(/ /g, "").split("@").slice(1);
			},

			// Wrapper engine. Used for fetching stored wrappers in runtime.
			wrapper: {
				cache: {
				},

				get: function(o) {
					var wrapper, core = env.__core__, node = [core.instance].concat(o.node.replace(/@/g, "").split(".")), n, i;

					for (i in node) {
						if (!n) {
							n = node[i];
						} else {
							n = n + "__" + node[i];
						}
						if (typeof core.wrapper.cache[n] === "function") {
							wrapper = core.wrapper.cache[n];
						}
					}
					return wrapper;
				}
			},

			// Construct user function(s)
			functionConstructor: function(o) {

				var self = this;
				var core = env.__core__;

				switch(o.func) {

					// If function is an onReady function and it's the first node selector, load it into jQuery ready - else, load it straight after the window object.
					case "onReady":
						if (o.loop === "0" && typeof o.method !== "undefined") {

							if (typeof window.jQuery === "function") {

								window.jQuery(window[core.settings.jQuery.ready]).ready(function() {

									// Call method with its parent object as reference
									o.method.call(window[self.instance][o.node]);
								});

							} else {

								this.onload.push(o.method);

								window.onload = function() {
									for (o in self.onload) {

										// Call method with its parent object as reference
										self.onload[o].call(window[self.instance][o.node]);
									}
								}
							}
						}
						break;

					// Construct function as ordinary
					default:
						return function() {

							if (typeof this[o.func] === "function") {

								// Set up selector
								this[o.func].selector = this[o.func].$ = core.selector;

								// Set up selector (for new methods, if the current method is used as a constructor)
								this[o.func].prototype.selector = this[o.func].prototype.$ = core.selector;

								// Set up node
								this[o.func].node = core.clone(core.node);

								// This line is for legacy purposes only (where the selector is called from the global object)
								window[core.instance].$ = window[core.instance].selector = core.selector;
							}

							// Execute user function in correct environment
							if (typeof o.wrapper === "function") {
								var self = this;
								var args = arguments;

								// Execute user function inside wrappers (if available)
								return o.wrapper.call({
									call: function() {

										// Apply method with its parent object as reference
										return o.method.apply(self, args);
									}
								});
							} else {
								// Execute user function as ordinary (if there are no wrappers defined for this object)
								return o.method.apply(this, arguments);
							}
						};

						break;
				}

			},

			// Error handling
			error: function() {
				var core = env.__core__;

				if (core.settings.error.show === true) {
					throw new Error(arguments[0]);
				}
				return
			}
		};

		// Make the global object a reference to the instance function and return it
		/** @constructor */
		return new (window[arguments[0]] = function() {

			var extended, core = env.__core__;

			// Extend core object with instance object internally
			// Declare user functions and variables
			extended = core.extend({to: env, from: {

				// Default node and selector values
				__core__: {
					node: {
						getString: "",
						getArray: []
					},
					selector: []
				},

				// Extend selected node(s) with given object/function
				extend: function() {
					var shell, s = [], node;

					// Error on invalid node selector
					if (typeof core.node.getArray[0] === "undefined") {
						return core.error("inception.js: Trying to extend with invalid node selector.");
					}

					// Error on false input object
					if (typeof arguments[0] === "undefined") {
						return core.error("inception.js: Trying to extend with invalid input object.");
					}

					// Create shell object of selector node(s)
					shell = core.stringToObject(core.node.getString, arguments[0]);

					// Match shell with node array
					node = core.node.getArray;

					// Iterate over shell and extend each node
					for (var i in shell) {
						core.extend({to: this, from: shell[i], construct: true, node: node[i], loop: i});
						s.push(shell[i]);
					}

					// Extend up to the global object
					window[core.instance] = core.extend({to: window[core.instance], from: this});

					// Return inception object
					return env;
				},

				// Create a new instance and extend with a copy of selected objects
				clone: function() {

					var name = [], arg = arguments[0], i;

					if (arg) {
						name.push(arg);
					} else {
						name = core.node.getArray; 
					}

					for (i in name) {
						// Create a new instance 
						new inception(name[i]);

						// Extend with core object
						core.extend({to: window[name[i]], from: core.clone(env)});

						// Extend with inner object
						core.extend({to: window[name[i]](), from: core.clone(env)});
					}

					return env;
				},

				// Crate a wrapper that sticks to a specified node, and then wraps the calling function with itself.
				wrap: function() {

					var a, i;

					if (typeof arguments[0] === "function") {

						a = core.node.getString.replace(/\./g, "__").replace(/ /g, "").split("@").slice(1);

						if (a.length === 0) {

							// Set wrapper cache
							core.wrapper.cache[core.instance] = arguments[0];
						}

						for (i in a) {

							// Set wrapper cache
							core.wrapper.cache[core.instance + "__" + a[i]] = arguments[0];

							// Extend to core object
							core.extend({to: window[core.instance].__core__.wrapper, from: core.wrapper});
						}
					}

					return env;
				},

				// Used to read and set new environment settings
				settings: function() {
					var core = env.__core__, settings = arguments[0];

					return core.extend({to: core.settings, from: settings});
				},

				// a DOM helper, to easily create new elements through jQuery. This actually is more of a jQuery plugin, but it's often useful - so I included it.
				append: function() {
					var core = env.__core__, o = arguments[0], jQuery = window.jQuery;

					// Faster than jQueries append, but lets you pass through css, bind and attribute objects to jQuery.
					if (typeof window.jQuery === "function") {
						return core.$.each(function() {

							if (o.element) {
								var obj = document.createElement(o.element);
								this.appendChild(obj);
							}

							if (o.css) {
								jQuery(obj).css(o.css);
							}

							if (o.attr) {
								jQuery(obj).attr(o.attr);
							}

							if (o.bind) {
								for (var k in o.bind) {
									jQuery(obj).bind(k, o.bind[k]);
								}
							}
						});
					}

					return env;
				}
			}});

			// Extend up to the global object
			window[core.instance] = core.extend({to: window[core.instance], from: extended});

			// Append correct selector
			if (typeof arguments[0] === "string" && arguments[0].indexOf("@") !== -1) {

				// Set selector to an inception selector
				core.$ = core.selector = core.stringToSelector(arguments[0]);

				// Save original selector string
				core.node.getString = arguments[0];
				core.node.getArray = core.stringToArray(arguments[0]);

			} else if (typeof window.jQuery === "function") {

				// Set selector to a jQuery selector (if it's not an inception selector and if jQuery is present)
				core.$ = core.selector = window.jQuery(arguments[0]);
			} else {

				// Clear all old selectors
				core.node.getString = "";
				core.node.getArray = "";
				core.$ = core.selector = [];
			}
		
			// Return extended core object
			return extended;
		});
	});

})(window);
