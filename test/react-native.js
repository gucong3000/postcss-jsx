"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("react-native", () => {
	it("StyleSheet", () => {
		const filename = require.resolve("./fixtures/react-native.mjs");
		let code = fs.readFileSync(filename);

		const document = syntax.parse(code, {
			from: filename,
		});

		code = code.toString();

		expect(document.toString(syntax)).to.equal(code);
		expect(document.nodes).to.lengthOf(1);
		expect(document.first.nodes).to.lengthOf(1);
		expect(document.first.first.nodes).to.lengthOf(2);
		expect(document.first.first.first).to.haveOwnProperty("type", "rule");
		expect(document.first.first.first).to.haveOwnProperty("selector", "box");
		expect(document.first.first.last).to.haveOwnProperty("type", "rule");
		expect(document.first.first.last).to.haveOwnProperty("selector", "text");

		document.nodes.forEach(root => {
			expect(root.source).to.haveOwnProperty("input");

			expect(code).to.includes(root.source.input.css);
			expect(root.source.input.css.length).lessThan(code.length);
			expect(root.source).to.haveOwnProperty("start").to.haveOwnProperty("line").to.greaterThan(1);

			root.walk(node => {
				expect(node).to.haveOwnProperty("source");

				expect(node.source).to.haveOwnProperty("input").to.haveOwnProperty("css").equal(root.source.input.css);

				expect(node.source).to.haveOwnProperty("start").to.haveOwnProperty("line");
				expect(node.source).to.haveOwnProperty("end").to.haveOwnProperty("line");
			});
		});
	});
});
