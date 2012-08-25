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
				}
