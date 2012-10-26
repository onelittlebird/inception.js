			// Extend a primary object with a secondary
			extend: function(o) {

				// Make sure the environment is from the global scope.
                                if (env && env.__core__ && window[env.__core__.instance]) {
                                        env = window[env.__core__.instance];
                                }	

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

						// onReady executer
						this.onready({method: o.from[n], func: n, node: o.node, loop: o.loop});
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
			}
