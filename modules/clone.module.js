				// Create a new instance and extend with a copy of selected objects
				clone: function() {

					var name = [], arg = arguments[0], i;

					if (arg) {
						name.push(arg);
					} else {
						name = core.node.getArray; 
					}

					for (i in name) {
						// Create a new instance 
						new inception(name[i]);

						// Extend with core object
						core.extend({to: window[name[i]], from: core.clone(env)});

						// Extend with inner object
						core.extend({to: window[name[i]](), from: core.clone(env)});
					}

					return env;
				}
