"use strict";
function unCamelCase (str) {
	return str.replace(/[\w-]+/g, (s) => (
		/^[a-z]*(?:[A-Z][a-z]+)+$/.test(s)
			? s.replace(
				/[A-Z]/g,
				s => "-" + s.toLowerCase()
			).replace(
				/^(\w|ms|moz|khtml|epub|\w*webkit)-/,
				"-$1-"
			)
			: s
	));
}

module.exports = unCamelCase;
