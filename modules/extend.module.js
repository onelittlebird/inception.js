				// Extend selected node(s) with given object/function
				extend: function() {
					var shell, s = [], node;

					// Error on invalid node selector
					if (typeof core.node.getArray[0] === "undefined") {
						return core.error("inception.js: Trying to extend with invalid node selector.");
					}

					// Error on false input object
					if (typeof arguments[0] === "undefined") {
						return core.error("inception.js: Trying to extend with invalid input object.");
					}

					// Create shell object of selector node(s)
					shell = core.stringToObject(core.node.getString, arguments[0]);

					// Match shell with node array
					node = core.node.getArray;

					// Iterate over shell and extend each node
					for (var i in shell) {
						core.extend({to: this, from: shell[i], construct: true, node: node[i], loop: i});
						s.push(shell[i]);
					}

					// Extend up to the global object
					window[core.instance] = core.extend({to: window[core.instance], from: this});

					// Return inception object
					return env;
				}
