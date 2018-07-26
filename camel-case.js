"use strict";
function camelCase (str) {
	return str.replace(/[\w-]+/g, (s) => (
		/^-?([a-z]+(?:-[a-z]+)+)$/.test(s)
			? RegExp.$1.replace(
				/-\w/g,
				s => (
					s[1].toUpperCase()
				)
			)
			: s
	));
}

module.exports = camelCase;
