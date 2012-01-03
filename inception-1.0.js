/*
	Copyright (c) 2010 Filip Moberg, (filip@mcsquare.se)

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
	Released:	2011-07-01
	Comments:	This version was so awesome, it deserved a whole new version number. Totally rebuilt from scratch - inception revisited.
*/

// Sandbox the environment
(function(window, undefined) { 

	// Declare environment variables
	var document = window.document, navigator = window.navigator, location = window.location;


	// Create function in window object
	window.inception = (function inception() {

		var env = this;

		// Make sure core function is instantiated
		if (this === window) {
			return new inception(arguments[0]);
		}

		// Declare core object (with core functions)
		this.core = {

			instance: arguments[0],

			// Extend a primary object with a secondary
			extend: function(o) {

				// If set to true, the returned object will be a copy instead of pointer
				if (typeof o.clone === "boolean" && o.clone === true) {
					o.from = this.clone(o.from); 
				}

				for (var n in o.from) {
					if (o.construct === true && typeof o.from[n] === "function" && n !== "wrapper") {

						// Make a clone so the use of multiple selectors won't construct the same function twice
						o.from = this.clone(o.from);

						// Construct the function
						o.from[n] = this.functionConstructor({method: o.from[n], func: n, node: o.node});
					}

					if (typeof o.from[n] === "object" && n !== "selector" && n !== "$") {

						if (typeof o.to[n] === "undefined") {
							if (o.from[n].constructor.toString().indexOf("Array") !== -1) {
								o.to[n] = [];
							} else {
								o.to[n] = {};
							}
						}

						this.extend({to: o.to[n], from: o.from[n], construct: o.construct, node: o.node});
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

				var c = 0;

				for (var o in arguments[0]) {
					if (arguments[0].hasOwnProperty(o)) {
						++c;
					}
				}

				return c;
			},

			// Create object from node string
			stringToObject: function() {

				var selector = arguments[0].replace(/ /g, "").split("@").slice(1), a = [], s, o, node, shell;

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
				var a = [], n = this.stringToArray(arguments[0]);

				for (i in n) {
					var s = n[i].split(".");
					var node = env;
					for (x in s) {
						if (typeof node[s[x]] !== "undefined") {
							node = node[s[x]];
						}
					}
					a.push(node);
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
					var wrapper, node = o.node.replace(/@/g, "").split("."), n;

					for (i in node) {
						if (!n) {
							n = node[i];
						} else {
							n = n + "__" + node[i];
						}
						if (typeof env.core.wrapper.cache[n] === "function") {
							wrapper = env.core.wrapper.cache[n];
						}
					}

					return wrapper;
				}
			},

			// Construct user function(s)
			functionConstructor: function(o) {

				return function() {

					// Set current selector
					this[o.func].selector = this[o.func].$ = env.selector;
					this[o.func].node = env.core.clone(env.node);

					// Execute user function in correct environment and supress error messages
					try {

						if (o.wrapper = env.core.wrapper.get(o)) {
							var self = this;
							var args = arguments;
							// Execute user function within a defined node wrapper
							o.wrapper({
								run: function() {
									o.method.apply(self, args);
								}
							});
						} else {
							// Execute user function as ordinary
							o.method.apply(this, arguments);
						}

					} catch(e) {

						if (typeof console !== "undefined" && typeof console.log !== "undefined") {
							console.log(e);
						}
					}
				};
			},

			// Error handling
			error: function() {

				throw new Error(arguments[0]);
				return
			}
		};

		// Make the global object a reference to the instance function and return it
		return new (window[arguments[0]] = function() {

			// Extend core object with instance object internally
			// Declare user functions and variables
			var core = env.core.extend({to: env, from: {

				node: {
					toString: "",
					toArray: []
				},

				extend: function() {
					var shell, s = [];

					// Error on invalid selector
					if (typeof this.selector === "undefined") {
						return this.core.error("inception.js: Trying to extend with invalid node selector.");
					}

					// Error on false input object
					if (typeof arguments[0] === "undefined") {
						return this.core.error("inception.js: Trying to extend with invalid input object.");
					}

					// Create shell object of selector node(s)
					shell = this.core.stringToObject(this.node.toString, arguments[0]);
					node = this.node.toArray;

					for (var i in shell) {
						this.core.extend({to: this, from: shell[i], construct: true, node: node[i]});
						s.push(shell[i]);
					}

					// Extend up to the global object
					window[env.core.instance] = env.core.extend({to: window[env.core.instance], from: this});

					// Return inception object
					return env;
				},

				alias: function() {
					return this.core.error("inception.js: Function alias() is deprecated. Please use the constructor instead -> new inception('your_framework'.");
				},

				// Create a new instance and extend with a copy of selected objects
				clone: function() {

					// XXX TODO Create a statement for selectors

					// Create a new instance 
					new inception(arguments[0]);

					// Extend with core object
					env.core.extend({to: window[arguments[0]], from: env.core.clone(env)});

					// Extend with inner object
					env.core.extend({to: window[arguments[0]](), from: env.core.clone(env)});

					return env;
				},

				wrapper: function() {

					if (typeof arguments[0] === "function") {
						var a;
						a = env.node.toString.replace(/\./g, "__").replace(/ /g, "").split("@").slice(1);

						for (i in a) {
							// Set wrapper cache
							env.core.wrapper.cache[env.core.instance + "__" + a[i]] = arguments[0];

							// Extend to core object
							env.core.extend({to: window[env.core.instance].core.wrapper, from: env.core.wrapper});
						}
					}

					return env;
				},

				wrap: function() {
					return this.wrapper(arguments[0]);
				}

			}});

			// Extend up to the global object
			window[env.core.instance] = env.core.extend({to: window[env.core.instance], from: core});

			// Append correct selector
			if (typeof arguments[0] === "string" && arguments[0].indexOf("@") !== -1) {

				// Set selector to an inception selector
				env.$ = env.selector = env.core.stringToSelector(arguments[0]);

				// Save original selector string
				env.node.toString = arguments[0];
				env.node.toArray = env.core.stringToArray(arguments[0]);

			} else if (typeof window.jQuery === "function" && typeof window.jQuery(arguments[0])[0] !== "undefined") {

				// Set selector to a jQuery selector
				env.$ = env.selector = jQuery(arguments[0]);
			} else {

				// Clear all old selectors
				env.node.toString = "";
				env.node.toArray = "";
				env.$ = env.selector = [];
			}
		
			// Return extended core object
			return core;
		});
	});

})(window);

new inception("dev");
new inception("mcsquare");

mcsquare("@test").wrapper(function(o) {
	console.log('first start');
	o.run();
	console.log('first end');
});

mcsquare("@test.blob").wrapper(function(o) {
	console.log('second start');
	o.run();
	console.log('second end');
});

mcsquare("@test.blob.case1 @test.blob.case2").extend({
	func1: function() {
		var sel = this.func1.selector;
		setInterval(function() {
			console.log(sel);
		}, 1000);
	},
	func2: function() {
		var sel = this.func2.selector;
		setInterval(function() {
			console.log(sel);
		}, 1000);
	}
}).wrapper(function(o) {
	var filip = "hooo";
	console.log('third start');
	o.run();
	console.log('third end');
});
