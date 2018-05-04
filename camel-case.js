"use strict";
function camelCase (str) {
	if (str.startsWith("--")) {
		return str;
	}
	return str.replace(/(^|\s|\W)-(ms-)/g, "$1$2").replace(/-+(\w)/g, (s, char) => s.length > 2 ? s : char.toUpperCase());
}

module.exports = camelCase;
