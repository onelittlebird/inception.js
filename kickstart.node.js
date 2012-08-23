
	// A module for including inception.js (or any javascript for that matter) into the global namespace with node.js

	module.exports = {
		kickstart: function(file_) {
			with (global) {
				eval(require('fs').readFileSync(file_).toString());
			};
		}
	}

