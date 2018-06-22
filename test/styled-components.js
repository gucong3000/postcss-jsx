"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("styled-components", () => {
	it("basic", () => {
		const file = require.resolve("./fixtures/styled");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString(), code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(8);

		const lines = code.match(/^.+$/gm).slice(3).map(line => (line.replace(/^\s*(.+?);?\s*$/, "$1")));
		document.first.nodes.forEach((decl, i) => {
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
		const document = syntax.parse(code, {
			from: "empty_template_literal.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(0);
	});

	it("skip javascript syntax error", () => {
		const code = "\\`";
		const document = syntax.parse(code, {
			from: "syntax_error.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(0);
	});

	it("illegal template literal", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`$\n{display: block}\n${g} {}`",
		].join("\n");
		const document = syntax.parse(code, {
			from: "illegal_template_literal.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(2);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "$");
		expect(document.last.last).have.property("type", "rule");
		expect(document.last.last).have.property("selector", "${g}");
	});

	it("styled.img", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"const Image1 = styled.img.attrs({ src: 'url' })`",
			"  bad-selector {",
			"    color: red;",
			"  }",
			"`;",
		].join("\n");
		const root = syntax.parse(code, {
			from: "styled.img.js",
		});
		expect(root.toString()).to.equal(code);
	});

	it("throw CSS syntax error", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`a{`;",
		].join("\n");

		expect(() => {
			syntax.parse(code, {
				from: "css_syntax_error.js",
			});
		}).to.throw("css_syntax_error.js:2:12: Unclosed block");
	});

	it("skip empty template literal", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div``;",
		].join("\n");
		const root = syntax.parse(code, {
			from: "empty_template_literal.js",
		});
		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(0);
	});

	it("fix CSS syntax error", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`a{`;",
		].join("\n");
		const document = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "postcss-safe-parser.js",
		});
		expect(document.toString()).to.equal([
			"const styled = require(\"styled-components\");",
			"styled.div`a{}`;",
		].join("\n"));
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "a");
	});

	it("fix styled syntax error", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`${ a } {`",
		].join("\n");
		const document = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "styled-safe-parse.js",
		});
		expect(document.toString()).to.equal([
			"const styled = require(\"styled-components\");",
			"styled.div`${ a } {}`",
		].join("\n"));
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "${ a }");
	});

	it("template literal in prop", () => {
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`margin-${/* sc-custom 'left' */ rtlSwitch}: 12.5px;`",
		].join("\n");
		const document = syntax.parse(code, {
			from: "template_literal_in_prop.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.first).to.haveOwnProperty("prop", "margin-${/* sc-custom 'left' */ rtlSwitch}");
	});
});
