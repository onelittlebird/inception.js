


//	Copyright (c) 2010 Filip Moberg (filip@mcsquare.se)
//
//	Permission is hereby granted, free of charge, to any person obtaining a copy
//	of this software and associated documentation files (the "Software"), to deal
//	in the Software without restriction, including without limitation the rights
//	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//	copies of the Software, and to permit persons to whom the Software is
//	furnished to do so, subject to the following conditions:
//
//	The above copyright notice and this permission notice shall be included in
//	all copies or substantial portions of the Software.
//
//	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//	THE SOFTWARE.



function fQuery() {

	// Define global variables

	var args = arguments;
	var m;

	// Argument handler

	if (args[0] && args[0].substr(0,1) == "@") {

		// If first argument is an fQuery modifier
		fQuery._reset();
		m = args[0].split(" ");
		for (i=0; i < m.length; i++) {
			fQuery._modifier.push(m[i].replace("@", ""));
		}

	} else if(args[0] != undefined && jQuery && jQuery(args[0])[0] != "") {

		// If first argument is a valid jQuery selector
		fQuery.$ = jQuery(args[0]);
	}

	if (!fQuery._init) {
		fQuery._init = {

			alias : function() {

				var arr, obj, key;

				if (fQuery._modifier && fQuery._modifier[0]) {

					arr = fQuery._modifier[0] ? fQuery._modifier[0].split(".") : '';
					obj = fQuery();

					for (var i in arr) {
						key = arr[i];
						obj = obj[key];
					}

					window[arguments[0]] = obj;

				} else {

					for (i=0; i < arguments.length; i++) {
						window[arguments[i]] = fQuery;
					}
				}

				fQuery._reset();
			},

			extend : function() {

				var arr, arg, copy, key, n;

				for (i=0; i < fQuery._modifier.length; i++) {

					arr = fQuery._modifier[i] ? fQuery._modifier[i].split(".") : '';
					copy = new Array();
					copy['function'] = fQuery._init;
					copy['object'] = fQuery;
					arg = arguments[0];
					n = 0;

					for (var k in arr) {
						if (n == arr.length-1 && typeof(arg) == "function") {
							arg = new Object();
							arg[arr[n]] = arguments[0];
						} else {
							key = arr[k];

							if (!copy['function'][key]) {

								copy['function'][key] = {};
								copy['object'][key] = {};
							}

							copy['function'] = copy['function'][key];
							copy['object'] = copy['object'][key];
						}

						n++;
					}

					jQuery.extend(true, copy['function'], arg);
					jQuery.extend(true, copy['object'], arg);
				}

				fQuery._reset();
			},

			_reset : function() {
				fQuery._modifier = new Array();
			},

			$ : function() {
				return fQuery.$;
			},

			append : function(o) {

				fQuery.$.each(function() {

					var obj = document.createElement(o.element);
					this.appendChild(obj);

					if (o.css) {
						$(obj).css(o.css);
					}

					if (o.attributes) {
						$(obj).attr(o.attributes);
					}

					if (o.bind) {

						for (var k in o.bind) {
							$(obj).bind(k, o.bind[k]);
						}
					}
				});
			},

			include : function(filename) {

				var filetype = filename.split(".");
				var obj;

				filetype = filetype[filetype.length-1];

				switch (filetype) {
					case "js":
						obj = document.createElement('script');
						obj.setAttribute("type","text/javascript");
						obj.setAttribute("src", filename);
					break;

					case "css":
						obj = document.createElement("link");
						obj.setAttribute("rel", "stylesheet");
						obj.setAttribute("type", "text/css");
						obj.setAttribute("href", filename);
					break;
				}

				if (typeof obj != "undefined") {
					document.getElementsByTagName("head")[0].appendChild(obj);
				}
			},

			count : function(o) {

				var c = 0;

				for (var k in o) {
					if (o.hasOwnProperty(k)) {
						++c;
					}
				}

				return c;
			},

			log : function() {

				if (typeof(console) != "undefined") {
					console.log(arguments[0]);
				}
			}
		};

		jQuery.extend(fQuery, fQuery._init);

	}

	return fQuery._init;
}

fQuery().alias('mcsquare');

