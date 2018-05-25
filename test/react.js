"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("react", () => {
	it("inline style in jsx", () => {
		const filename = require.resolve("./fixtures/inline_styles.jsx");
		let code = fs.readFileSync(filename);

		const document = syntax.parse(code, {
			from: filename,
		});

		code = code.toString();

		expect(document.toString(syntax)).to.equal(code);
		expect(document.nodes).to.lengthOf(1);
	});
});
