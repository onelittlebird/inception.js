				// Used to read and set new environment settings
				settings: function() {
					var core = env.__core__, settings = arguments[0];

					return core.extend({to: core.settings, from: settings});
				}
