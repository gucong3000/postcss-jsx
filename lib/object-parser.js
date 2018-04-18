"use strict";
const postcss = require("postcss");
const Literal = require("./literal");
const Obj = require("./obj");

function forEach (arr, callback) {
	arr && arr.forEach(callback);
}

function camelCase (str) {
	if (str.startsWith("-ms-")) {
		str = str.slice(1);
	}
	return str.replace(/-(\w)/, (dashChar, char) => char.toUpperCase());
}

function unCamelCase (str) {
	return str.replace(/[A-Z]/, (char) => "-" + char.toLowerCase()).replace(/^ms-/, "-ms-");
}

function defineRaws (node, prop, prefix, suffix, props) {
	if (!props) {
		props = {};
	}
	const descriptor = {
		enumerable: true,
		get: () => (
			node[prop]
		),
		set: (value) => {
			node[prop] = value;
		},
	};

	if (!props.raw) {
		props.raw = descriptor;
	}
	if (!props.value) {
		props.value = descriptor;
	}
	node.raws[prop] = Object.defineProperties({
		prefix,
		suffix,
	}, props);
}

class objectParser {
	constructor (input) {
		this.input = input;
	}
	parse (node, source) {
		const root = postcss.root({
			source: {
				input: this.input,
				start: node.loc.start,
			},
		});
		root.raws.node = node;
		const obj = new Obj({
			raws: {
				node,
			},
		});
		root.push(obj);
		this.process(node, obj);
		this.sort(root);
		this.raws(root);

		const startNode = root.first.raws.node;
		const endNode = root.last.raws.node;

		root.source.start = startNode.loc.start;

		root.source.input.css = root.source.input.css.slice(startNode.start, endNode.end);

		this.root = root;
	}

	process (node, parent) {
		[
			"leadingComments",
			"innerComments",
			"trailingComments",
		].forEach(prop => {
			forEach(node[prop], child => {
				this.source(child, this.comment(child, parent));
			});
		});

		const child = (this[node.type] || this.literal).apply(this, [node, parent]);
		this.source(node, child);
		return child;
	}
	source (node, parent) {
		parent.source = {
			input: this.input,
			start: node.loc.start,
			end: node.loc.end,
		};
		return parent;
	}
	raws (parent, node) {
		parent.nodes.forEach((child, i) => {
			if (i) {
				child.raws.before = this.input.css.slice(parent.nodes[i - 1].raws.node.end, child.raws.node.start).replace(/^\s*,+/, "");
			} else if (node) {
				child.raws.before = this.input.css.slice(node.start, child.raws.node.start).replace(/^\s*{+/, "");
			}
		});
		if (node) {
			parent.raws.after = this.input.css.slice(parent.last.raws.node.end, node.end).replace(/^\s*,+/, () => {
				parent.raws.semicolon = true;
				return "";
			}).replace(/}+\s*$/, "");
		}
	}

	sort (node) {
		if (!node.nodes) {
			return;
		}
		node.nodes = node.nodes.sort((a, b) => (
			a.raws.node.start - b.raws.node.start
		));
	}

	getNodeValue (node) {
		switch (node.type) {
			case "Identifier": {
				return node.name;
			}
			case "StringLiteral": {
				return node.value;
			}
			case "TemplateLiteral": {
				return this.input.css.slice(node.quasis[0].start, node.quasis[node.quasis.length - 1].end);
			}
			default: {
				return this.input.css.slice(node.start, node.end);
			}
		}
	}

	ObjectExpression (node, parent) {
		forEach(node.properties, child => {
			this.process(child, parent);
		});
		this.sort(parent);
		this.raws(parent, node);
		return parent;
	}

	ObjectProperty (node, parent) {
		const key = this.getNodeValue(node.key);
		let between = this.input.css.indexOf(":", node.key.end);
		const rawKey = this.input.css.slice(node.start, between).trimRight();
		const rawValue = this.input.css.slice(between + 1, node.end).trimLeft();
		between = this.input.css.slice(node.start + rawKey.length, node.end - rawValue.length);
		const keyWrap = rawKey.split(key);
		if (node.value.type === "ObjectExpression") {
			let rule;
			if (/^@(\S+)(\s*)(.*)$/.test(key)) {
				const atRule = postcss.atRule({
					name: RegExp.$1,
					params: RegExp.$3,
					raws: {
						afterName: RegExp.$2,
					},
					nodes: [],
				});
				defineRaws(atRule, "name", keyWrap[0] + "@", null);
				defineRaws(atRule, "params", null, keyWrap[1]);
				rule = atRule;
			} else {
				// rule = this.rule(key, keyWrap, node.value, parent);
				rule = postcss.rule({
					selector: key,
				});
				defineRaws(rule, "selector", keyWrap[0], keyWrap[1]);
			}
			raw(rule);
			this.ObjectExpression(node.value, rule);
			return rule;
		}

		const value = this.getNodeValue(node.value);
		const valueWrap = rawValue.split(value);

		const decl = postcss.decl({
			prop: unCamelCase(key),
			value,
		});
		defineRaws(decl, "prop", keyWrap[0], keyWrap[1], {
			raw: {
				enumerable: true,
				get: () => (
					camelCase(decl.prop)
				),
				set: (value) => {
					decl.prop = unCamelCase(value);
				},
			},
		});
		defineRaws(decl, "value", valueWrap[0], valueWrap[1]);
		raw(decl);
		return decl;

		function raw (postcssNode) {
			postcssNode.raws.between = between;
			postcssNode.raws.node = node;
			parent.push(postcssNode);
		}
	}

	literal (node, parent) {
		const literal = new Literal({
			text: this.input.css.slice(node.start, node.end),
			raws: {
				node,
			},
		});
		parent.push(literal);
		return literal;
	}

	comment (node, parent) {
		if (!parent.nodes || (node.start < parent.raws.node.start && parent.type !== "root" && parent.parent)) {
			return this.comment(node, parent.parent);
		}
		const text = node.value.match(/^(\s*)((?:\S[\s\S]*?)?)(\s*)$/);
		const comment = postcss.comment({
			text: text[2],
			raws: {
				node,
				left: text[1],
				right: text[3],
				inline: node.type === "CommentLine",
			},
		});

		parent.push(comment);
		return comment;
	}
}
module.exports = objectParser;
