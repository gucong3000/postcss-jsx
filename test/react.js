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
		expect(document.nodes).to.lengthOf(3);
	});

	it("first line indentation handle", () => {
		const code = `
export default <img style=
	{
		{
			transform: 'translate(1, 1)',
		}
	}
/>;
`;

		const document = syntax.parse(code, {
			from: "before.js",
		});

		expect(document.toString(syntax)).to.equal(code);
		expect(document.nodes).to.lengthOf(1);
		expect(document.first.source.input.css).to.match(/^\s+\{/);
		expect(document.first.source.start.column).to.equal(1);
		expect(document.first.raws.beforeStart).to.match(/\n$/);
		expect(document.first.first.raws.before).to.match(/^\s+$/);
		expect(document.first.first.source.start.column).to.greaterThan(1);
	});
});
