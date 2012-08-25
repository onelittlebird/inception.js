			// Create deep copy of target object
			clone: function() {
				return this.extend({to: {}, from: arguments[0]});
			}
