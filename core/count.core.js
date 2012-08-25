			// Count child objects
			count : function(o) {

				var c = 0, i;

				for (i in o) {
					if (o.hasOwnProperty(o)) {
						++c;
					}
				}

				return c;
			}
