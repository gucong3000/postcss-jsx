"use strict";
const Stringifier = require("postcss/lib/stringifier");

module.exports = class ScssStringifier extends Stringifier {
	obj (node, semicolon) {
		this.builder("{", node, "start");

		let after;
		if (node.nodes && node.nodes.length) {
			this.body(node);
			after = this.raw(node, "after");
		} else {
			after = this.raw(node, "after", "emptyBody");
		}

		if (after) this.builder(after);
		this.builder("}", node, "end");
	}
	literal (node, semicolon) {
		this.builder(node.text + (semicolon ? "," : ""));
	}
	decl (node, semicolon) {
		const prop = this.rawValue(node, "prop");
		const between = this.raw(node, "between", "colon");
		const value = this.rawValue(node, "value");
		let string = prop + between + value;

		if (semicolon) string += ",";
		this.builder(string, node);
	}
	rule (node, semicolon) {
		this.block(node, this.rawValue(node, "selector"), semicolon);
	}
	atrule (node, semicolon) {
		let name = this.rawValue(node, "name");
		const params = this.rawValue(node, "params");

		if (typeof node.raws.afterName !== "undefined") {
			name += node.raws.afterName;
		} else if (params) {
			name += " ";
		}

		if (node.nodes) {
			this.block(node, name + params, semicolon);
		} else {
			const end = (node.raws.between || "") + (semicolon ? "," : "");
			this.builder(name + params + end, node);
		}
	}
	block (node, start, semicolon) {
		super.block(node, start);
		if (semicolon) {
			this.builder(",", node);
		}
	}
	comment (node) {
		const left = this.raw(node, "left", "commentLeft");
		const right = this.raw(node, "right", "commentRight");

		if (node.raws.inline) {
			const text = node.raws.text || node.text;
			this.builder("//" + left + text + right, node);
		} else {
			this.builder("/*" + left + node.text + right + "*/", node);
		}
	}
	rawValue (node, prop) {
		let value = node[prop];
		const raw = node.raws[prop];
		if (raw) {
			if (raw.value === value) {
				value = raw.raw;
			}
			if (raw.prefix) {
				value = raw.prefix + value;
			}
			if (raw.suffix) {
				value += raw.suffix;
			}
		}
		return value;
	}
};
