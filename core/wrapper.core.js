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
			}
