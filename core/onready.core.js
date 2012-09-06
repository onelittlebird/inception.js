			// Construct user function(s)
			onready: function(o) {

				var self = this;
				var core = env.__core__;

				switch(o.func) {

					// If function is an onReady function and it's the first node selector, load it into jQuery ready - else, load it straight after the window object.
					case "onReady":
						if (o.loop === "0" && typeof o.method !== "undefined") {

							if (typeof window.jQuery === "function") {

								window.jQuery(window[core.settings.jQuery.ready]).ready(function() {

									o.nodeKeys = o.node.split(".");
									o.parentNode = window[self.instance];
									for (var i in o.nodeKeys) {
										o.parentNode = o.parentNode[o.nodeKeys[i]];
									}

									// Call method with its parent object as reference
									o.method.call(o.parentNode);
								});

							} else {

								this.onload.push(o.method);

								window.onload = function() {
									for (o in self.onload) {

										o.nodeKeys = o.node.split(".");
										o.parentNode = window[self.instance];
										for (var i in o.nodeKeys) {
											o.parentNode = o.parentNode[o.nodeKeys[i]];
										}

										// Call method with its parent object as reference
										self.onload[o].call(o.parentNode);
									}
								}
							}
						}
						break;
				}
			}
