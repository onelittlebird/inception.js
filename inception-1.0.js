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

/*

	Author:		Filip Moberg
	Name:		inception.js
	Version:	1.0
	Version name:	SuckerPunch
	Released:	2011-07-01

*/

function inception() {

	var args = arguments;
	var m;


	// Argument handler

	if (args[0] && args[0].substr(0,1) == "@") {


		// If first argument is an inception node

		inception._node = new Array();
		m = args[0].split(" ");
		for (i=0; i < m.length; i++) {
			inception._node.push(m[i].replace("@", ""));
		}

	} else if(args[0] != undefined && jQuery && jQuery(args[0])[0] !== "") {


		// If first argument is a valid jQuery selector

		inception.$ = jQuery(args[0]);
	}

	if (typeof(inception._init) == "undefined") {


		// Declare internal functions

		inception._internals = {
			wrapper : function() {

				var selector = sel = inception.$;
			},

			parseFunction : function() {

				var string = arguments[0].toString();
				var offset = string.indexOf("{");
				var head = string.substr(0, offset);
				var args = head.substr(head.indexOf("(")).replace("(","").replace(")","").replace(/ /g,"").split(",");
				var body = string.substr(offset+1,string.length-offset-2);

				return {
					head : head,
					args : args,
					body : body
				};
			},

			mergeFunctions : function() {

				var p1 = inception._internals.parseFunction(arguments[0]);
				var p2 = inception._internals.parseFunction(arguments[1]);

				var body = p1.body + p2.body;
				var args;

				if (p1.args[0] !== "") {
					args = p1.args;

					if (p2.args[0] !== "") {
						args = args.concat(p2.args);
					}
				} else if (p2.args[0] !== "") {
					args = p2.args;
				}

				if (args) {
					return new Function(args, "{"+body+"}");
				} else {
					return new Function("{"+body+"}");
				}
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

                        jQ : {hasOwn:Object.prototype.hasOwnProperty,isPlainObject:function(obj){if(!obj||typeof obj!=="object"||obj.nodeType||this.isWindow(obj)){return false}if(obj.constructor&&!this.hasOwn.call(obj,"constructor")&&!this.hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false}var key;for(key in obj){}return key===undefined||this.hasOwn.call(obj,key)},isWindow:function(obj){return obj&&typeof obj==="object"&&"setInterval"in obj},isArray:Array.isArray||function(obj){return typeof obj==="array"},extend:function(){var options,name,src,copy,copyIsArray,clone,target=arguments[0]||{},i=1,length=arguments.length,deep=false;if(typeof target==="boolean"){deep=target;target=arguments[1]||{};i=2}if(typeof target!=="object"&&typeof target!=="function"){target={}}if(length===i){target=this;--i}for(;i<length;i++){if((options=arguments[i])!=null){for(name in options){src=target[name];copy=options[name];if(target===copy){continue}if(deep&&copy&&(this.isPlainObject(copy)||(copyIsArray=this.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&this.isArray(src)?src:[]}else{clone=src&&this.isPlainObject(src)?src:{}}target[name]=this.extend(deep,clone,copy)}else if(copy!==undefined){target[name]=copy}}}}return target}}
		};


		// Set default top node wrapper

		inception._wrapper = inception._internals.wrapper;


		// Declare and initialize core functions

		inception._init = {
			alias : function() {

				var arr, obj, key;


				// Create alias for selected node

				if (inception._node && inception._node[0]) {

					arr = inception._node[0] ? inception._node[0].split(".") : '';
					obj = inception();

					for (var i in arr) {
						key = arr[i];
						obj = obj[key];
					}

					window[arguments[0]] = obj;

				} else {

					for (i=0; i < arguments.length; i++) {
						window[arguments[i]] = inception;
					}
				}

				inception._node = new Array();
			},

			extend : function() {

				var arr, arg, copy, key, n, wrapper;


				// Declare wrapper function

				var applyWrapper = function() {

					var fetchWrapper = function(o) {

						var f = inception._internals.parseFunction(o.wrapper);
						var body;

						if (f.body.indexOf("[FUNCTION]") != "-1") {
							return f.body.replace("[FUNCTION]", o.body);
						} else {
							return f.body + o.body;
						}
					};

					var obj = arguments[0].object;
					var wrapper = arguments[0].wrapper;

					for (var a in obj) {
						if (typeof(obj[a]) == "object") {
							new applyWrapper({object: obj[a], wrapper: wrapper});
						}
						if (typeof(obj[a]) == "function") {

							var f = inception._internals.parseFunction(obj[a]);

							body = f.body;
							args = f.args;

							for (var i=wrapper.length-1; i>=0; i--) {
								body = fetchWrapper({body: body, wrapper: wrapper[i]});
							}

							obj[a] = new Function(args, "{"+body+"}");
						}
					}
				};


				// Extend argument object(s) and function(s) to the end of the node chain

				for (i=0; i < inception._node.length; i++) {

					arr = inception._node[i] ? inception._node[i].split(".") : '';
					copy = new Array();
					copy['function'] = inception._init;
					copy['object'] = inception;
					arg = arguments[0];
					wrapper = new Array();
					wrapper.push(inception._wrapper);
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

					new applyWrapper({object: arg, wrapper: wrapper});


					// Apply new object(s) to the inception tree

					inception._internals.jQ.extend(true, copy['function'], arg);
					inception._internals.jQ.extend(true, copy['object'], arg);
				}


				// If the extend targets the top node (can only be applied with an object, else inception would be overridden)

				if (typeof(inception._node[0]) == "undefined" && typeof(arguments[0]) == "object") {

					copy = new Array();
					wrapper = new Array();
					copy['function'] = inception._init;
					copy['object'] = inception;
					arg = arguments[0];
					wrapper.push(inception._wrapper);


					// Apply node wrappers (if any) to node functions

					new applyWrapper({object: arg, wrapper: wrapper});


					inception._internals.jQ.extend(true, copy['function'], arg);

					for (var o in arg) {
						copy['object'][o] = arg[o];
					}
				}


				// Reset the _node to an empty array

				inception._node = new Array();
			},

			wrap : function() {

				var arr, copy, key;
				var arg = arguments[0];


				// Create wrapper for selected node(s)

				for (i=0; i < inception._node.length; i++) {

					arr = inception._node[i] ? inception._node[i].split(".") : '';
					copy = new Array();
					copy['function'] = inception._init;
					copy['object'] = inception;

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


				// Create wrapper for top node (and merge with default top node wrapper)

				if (inception._node.length === 0) {
					copy = new Array();
					copy['function'] = inception._init;
					copy['object'] = inception;

					arg = inception._internals.mergeFunctions(inception._internals.wrapper, arg);

					copy['function']._wrapper = arg;
					copy['object']._wrapper = arg;
				}


				// Reset the _node to an empty array

				inception._node = new Array();
			},

			append : function(o) {


				// Faster than jQueries append, but lets you pass through css, bind and attribute objects to jQuery.

				inception.$.each(function() {

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

			log : function() {


				// Check if console is available

				if (typeof(console) != "undefined") {
					console.log(arguments[0]);
				} else {
					alert(arguments[0]);
				}
			}
		};


		// Merge core functions with the inception object

		inception._internals.jQ.extend(inception, inception._init);
	}

	return inception._init;
}

inception();
