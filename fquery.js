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
*/

function fQuery() {

	var args = arguments;
	var m;


	// Argument handler

	if (args[0] && args[0].substr(0,1) == "@") {


		// If first argument is an fQuery node

		fQuery._reset();
		m = args[0].split(" ");
		for (i=0; i < m.length; i++) {
			fQuery._node.push(m[i].replace("@", ""));
		}

	} else if(args[0] != undefined && jQuery && jQuery(args[0])[0] != "") {


		// If first argument is a valid jQuery selector

		fQuery.$ = jQuery(args[0]);
	}

	if (!fQuery._init) {
		fQuery._init = {
			alias : function() {

				var arr, obj, key;


				// Create alias for selected node

				if (fQuery._node && fQuery._node[0]) {

					arr = fQuery._node[0] ? fQuery._node[0].split(".") : '';
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

				var arr, arg, copy, key, n, wrapper;


				// Extend argument object(s) and function(s) to the end of the node chain

				for (i=0; i < fQuery._node.length; i++) {

					arr = fQuery._node[i] ? fQuery._node[i].split(".") : '';
					copy = new Array();
					copy['function'] = fQuery._init;
					copy['object'] = fQuery;
					arg = arguments[0];
					wrapper = new Array();
					n = 0;


					// Crawl to the last object of the chain

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
							if (typeof(copy['object'][key]._wrapper) != "undefined") {
								wrapper.push(copy['object'][key]._wrapper);
							}

							copy['function'] = copy['function'][key];
							copy['object'] = copy['object'][key];
						}

						n++;
					}


					// Apply node wrappers (if any) to node functions

					var fetchWrapper = function(o) {

						var string = o.wrapper.toString();
						var offset = string.indexOf("{");
						var body = string.substr(offset+1,string.length-offset-2);

						if (body.indexOf("@FUNCTION;") != "-1") {
							body = body.replace("@FUNCTION", o.body);
							return body;
						} else {
							return body + o.body;
						}
					}

					var applyWrapper = function() {

						var obj = arguments[0].object;

						for (var a in obj) {
							if (typeof(obj[a]) == "object") {
								new applyWrapper({object: obj[a]});
							}
							if (typeof(obj[a]) == "function") {

								var string = obj[a].toString();
								var offset = string.indexOf("{");
								var head = string.substr(0, offset);
								var args = head.substr(head.indexOf("(")).replace("(","").replace(")","").split(",");
								var body = string.substr(offset+1,string.length-offset-2);

								var i = wrapper.length;
								for (var i=wrapper.length-1; i>=0; i--) {
									body = fetchWrapper({body: body, wrapper: wrapper[i]});
								}

								obj[a] = new Function(args, "{"+body+"}");
							}
						}
					}

					new applyWrapper({object: arg});


					// Apply new object(s) to the fQuery tree

					jQuery.extend(true, copy['function'], arg);
					jQuery.extend(true, copy['object'], arg);
				}


				// If the extend targets the top node (can only be applied with an object)

				if (typeof(fQuery._node[0]) == "undefined" && typeof(arguments[0]) == "object") {

					copy = new Array();
					copy['function'] = fQuery._init;
					copy['object'] = fQuery;
					arg = arguments[0];

					this._extend(true, copy['function'], arg);

					for (var o in arg) {
						copy['object'][o] = arg[o];
					}
				}


				// Reset the _node to an empty array

				fQuery._reset();
			},

			wrap : function() {

				var arr, arg, copy, key;


				// Create wrapper for selected node(s)

				for (i=0; i < fQuery._node.length; i++) {

					arr = fQuery._node[i] ? fQuery._node[i].split(".") : '';
					copy = new Array();
					copy['function'] = fQuery._init;
					copy['object'] = fQuery;
					arg = arguments[0];

					for (var k in arr) {
						key = arr[k];

						if (!copy['function'][key]) {

							copy['function'][key] = {};
							copy['object'][key] = {};
						}

						copy['function'] = copy['function'][key];
						copy['object'] = copy['object'][key];
					}

					copy['function']._wrapper = arg;
					copy['object']._wrapper = arg;
				}


				// Reset the _node to an empty array

				fQuery._reset();
			},

			_reset : function() {


				// Reset the _node to an empty array

				fQuery._node = new Array();
			},

			$ : function() {


				// Returns a jQuery object

				return fQuery.$;
			},

			append : function(o) {


				// Faster than jQueries append, but lets you pass through css, bind and attribute objects to jQuery.

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

			count : function(o) {


				// Count number of child nodes in selected object

				var c = 0;

				for (var k in o) {
					if (o.hasOwnProperty(k)) {
						++c;
					}
				}

				return c;
			},

			log : function() {


				// Check if console is available

				if (typeof(console) != "undefined") {
					console.log(arguments[0]);
				}
			},

			dump : function() {


				// A var_dump function

				var dump = function() {

					fQuery.log("{");

					var obj = arguments[0].object;

					for (var a in obj) {
						fQuery.log(a + " => " + typeof(obj[a]));
						if (typeof(obj[a]) == "object") {
							dump({object: obj[a]});
						}
					}

					fQuery.log("}");
				}

				var payload = (typeof(arguments[0]) == "object") ? arguments[0] : fQuery._init;

				dump({object: payload});
			}
		};

		jQuery.extend(fQuery, fQuery._init);
	}
	return fQuery._init;
}

fQuery();
