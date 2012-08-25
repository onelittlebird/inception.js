
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

	Author:		[ PRAGMA :: HEADER_AUTHOR ]
	Name:		inception.js
	Version:	[ PRAGMA :: HEADER_VERSION ]
	Codename:	[ PRAGMA :: HEADER_CODENAME ]
	Released:	[ PRAGMA :: HEADER_RELEASE_DATE ]
*/


// Root reference combatibility (for execution in a non browser environment)
(function () {
	if (typeof window === "undefined") {
		window = this;
		__isBrowser = false;
	} else {
		__isBrowser = true;
	}
})();


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

			onload: [],
			instance: arguments[0],

			[ PRAGMA :: CORE ]
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

				[ PRAGMA :: MODULES ]
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
			} else if (arguments[0] && __isBrowser) {

				// Use native javascript CSS selector
				core.$ = core.selector = document.querySelectorAll(arguments[0]);
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
