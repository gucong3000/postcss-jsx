"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("template literals", () => {
	it("template literals inside template literals", () => {
		const file = require.resolve("./fixtures/tpl-in-tpl");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString(), code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);

		document.first.nodes.forEach((decl) => {
			expect(decl).have.property("type", "decl");
			expect(decl).have.property("prop", "border-bottom");
			expect(decl).have.property("value", "${(props) => (props.border ? `1px solid ${color}` : '0')}");
		});
	});

	it("multiline arrow function", () => {
		const file = require.resolve("./fixtures/multiline-arrow-function");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString(), code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);

		document.first.nodes.forEach((decl) => {
			expect(decl).have.property("type", "decl");
			expect(decl).have.property("prop", "color");
			expect(decl).have.property(
				"value",
				[
					"${(props) =>",
					"(props.status === 'signed' && 'red') ||",
					"'blue'}",
				].join("\n\t")
			);
		});
	});
});
