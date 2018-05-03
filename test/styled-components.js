"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("styled-components", () => {
	it("basic", () => {
		const file = require.resolve("./fixtures/styled");
		let code = fs.readFileSync(file);

		const root = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(root.toString(), code);

		expect(root.nodes).to.have.lengthOf(1);
		expect(root.first.nodes).to.have.lengthOf(8);

		const lines = code.match(/^.+$/gm).slice(3).map(line => (line.replace(/^\s*(.+?);?\s*$/, "$1")));
		root.first.nodes.forEach((decl, i) => {
			if (i) {
				expect(decl).to.have.property("type", "decl");
			} else {
				expect(decl).to.have.property("type", "comment");
			}
			expect(decl.toString()).to.equal(lines[i]);
		});
	});

	it("empty template literal", () => {
		const code = [
			"function test() {",
			"  console.log(`debug`)",
			"  return ``;",
			"}",
			"",
		].join("\n");
		const root = syntax.parse(code, {
			from: "empty_template_literal.js",
		});
		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(0);
	});

	it("skip javascript syntax error", () => {
		const code = "\\`";
		const root = syntax.parse(code, {
			from: "syntax_error.js",
		});
		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(0);
	});

	it("illegal template literal", () => {
		const code = "`$\n{display: block}\n${g} {}`";
		const root = syntax.parse(code, {
			from: "illegal_template_literal.js",
		});
		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(1);
		expect(root.first.nodes).to.have.lengthOf(2);
		expect(root.first.first).have.property("type", "rule");
		expect(root.first.first).have.property("selector", "$");
		expect(root.last.last).have.property("type", "rule");
		expect(root.last.last).have.property("selector", "${g}");
	});

	it("skip CSS syntax error", () => {
		const code = "`a{`";
		const root = syntax.parse(code, {
			from: "css_syntax_error.js",
		});
		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(0);
	});

	it("fix CSS syntax error", () => {
		const code = "`a{`";
		const root = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "postcss-safe-parser.js",
		});
		expect(root.toString()).to.equal("`a{}`");
		expect(root.nodes).to.have.lengthOf(1);
		expect(root.first.nodes).to.have.lengthOf(1);
		expect(root.first.first).have.property("type", "rule");
		expect(root.first.first).have.property("selector", "a");
	});

	it("fix styled syntax error", () => {
		const code = "`${ a } {`";
		const root = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "styled-safe-parse.js",
		});
		expect(root.toString()).to.equal("`${ a } {}`");
		expect(root.nodes).to.have.lengthOf(1);
		expect(root.first.nodes).to.have.lengthOf(1);
		expect(root.first.first).have.property("type", "rule");
		expect(root.first.first).have.property("selector", "${ a }");
	});
});
