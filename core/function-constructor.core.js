			// Construct user function(s)
			functionConstructor: function(o) {

				var self = this;
				var core = env.__core__;

				// Construct function as ordinary
				return function() {

					if (typeof this[o.func] === "function") {

						// Set up selector
						this[o.func].selector = this[o.func].$ = core.selector;

						// Set up selector (for new methods, if the current method is used as a constructor)
						if (this[o.func].prototype) {
							this[o.func].prototype.selector = this[o.func].prototype.$ = core.selector;
						}

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
			}
