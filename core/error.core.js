			// Error handling
			error: function() {
				var core = env.__core__;

				if (core.settings.error.show === true) {
					throw new Error(arguments[0]);
				}
				return
			}
