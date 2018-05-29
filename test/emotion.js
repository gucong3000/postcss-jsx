"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("javascript tests", () => {
	it("react-emotion", () => {
		const filename = require.resolve("./fixtures/react-emotion.jsx");
		let code = fs.readFileSync(filename);

		const document = syntax.parse(code, {
			from: filename,
		});

		code = code.toString();

		expect(document.toString(syntax)).to.equal(code);
		expect(document.nodes).to.lengthOf(4);

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
