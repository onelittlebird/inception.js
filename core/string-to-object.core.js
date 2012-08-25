			// Create object from node string
			stringToObject: function() {

				var selector = arguments[0].replace(/ /g, "").split("@").slice(1), a = [], s, o, i, node, shell;

				for (s in selector) {
					node = selector[s].split(".");

					if (node[0] !== "") {
						o = {};
						shell = o;

						for (i = 0; i < node.length-1; ++i) {
							o = o[node[i]] = {};
						}

						if (arguments[1]) {
							o = o[node[i]] = arguments[1];
						} else {
							o = o[node[i]] = {};
						}

						a.push(shell);
					}
				}

				return a;
			}
