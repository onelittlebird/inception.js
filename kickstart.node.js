module.exports = {
	include: function(file_) {
		with (global) {
			eval(require('fs').readFileSync(file_).toString());
		};
	}
}
