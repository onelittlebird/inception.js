			// Create selector from node string
			stringToSelector: function() {
				var a = [], n = this.stringToArray(arguments[0]), i, x;

				for (i in n) {
					var s = n[i].split(".");
					var node = env;

					for (x in s) {
						if (typeof node[s[x]] !== "undefined") {
							node = node[s[x]];
						}
					}

					if (node !== env) {
						a.push(node);
					}
				}

				return a;
			}
