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
