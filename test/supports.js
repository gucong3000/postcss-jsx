"use strict";
const cases = require("postcss-parser-tests");

const fs = require("fs");
const expect = require("chai").expect;
const syntax = require("../");

function clean (node) {
	if (node.raws) {
		delete node.raws.node;
		delete node.raws.beforeStart;
		delete node.raws.afterEnd;
	}
	if (node.source) {
		delete node.source.opts;
	}
	delete node.document;
	if (node.nodes) {
		node.nodes = node.nodes.map(clean);
	};
	return node;
}

describe("should support for each CSS in JS package", () => {
	[
		"interpolation-content.mjs",
		"jsx.jsx",
		"emotion-10.jsx",
		"react-emotion.jsx",
		"react-native.mjs",
		"glamorous.jsx",
		"lit-css.mjs",
		"styled-components.js",
		"tpl-in-tpl.mjs",
		"tpl-selector.mjs",
		"tpl-decl.mjs",
		"tpl-special.mjs",
	].forEach(file => {
		it(file, () => {
			file = require.resolve("./fixtures/" + file);
			const code = fs.readFileSync(file);
			const document = syntax.parse(code, {
				from: file,
			});
			expect(document.source).to.haveOwnProperty("lang", "jsx");
			expect(document.toString(), code.toString());
			expect(document.nodes.length).to.greaterThan(0);
			const parsed = cases.jsonify(clean(document));
			// fs.writeFileSync(file + ".json", parsed + "\n");
			expect(parsed).to.equal(fs.readFileSync(file + ".json", "utf8").trim());
		});
	});
});
