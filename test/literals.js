"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("template literals", () => {
	it("template literals inside template literals", () => {
		const file = require.resolve("./fixtures/tpl-in-tpl.mjs");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);

		document.first.nodes.forEach((decl) => {
			expect(decl).have.property("type", "decl");
			expect(decl).have.property("prop", "border-bottom");
			expect(decl).have.property("value", "${(props) => (props.border ? `1px solid ${color}` : \"0\")}");
		});
	});

	it("multiline arrow function", () => {
		const file = require.resolve("./fixtures/multiline-arrow-function.mjs");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
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
					"(props.status === \"signed\" && \"red\") ||",
					"\"blue\"}",
				].join("\n\t\t")
			);
		});
	});

	it("interpolation as the only content of a component", () => {
		const file = require.resolve("./fixtures/interpolation-content.mjs");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(9);
		document.nodes.forEach((root, i) => {
			switch (i) {
				case 0: {
					expect(root.nodes).to.have.lengthOf(1);
					root.nodes.forEach(decl => {
						expect(decl).have.property("type", "decl");
						expect(decl).have.property("prop", "display");
						expect(decl).have.property("value", "inline-block");
					});
					return;
				}
				case 1:
				case 2: {
					expect(root.nodes).to.have.lengthOf(2);
					expect(root.first).have.property("type", "literal");
					expect(root.first).have.property("text", "${buttonStyles}");
					expect(root.last).have.property("type", "decl");
					expect(root.last).have.property("prop", "color");
					expect(root.last).have.property("value", "red");
					return;
				}
				case 3:
				case 4: {
					expect(root.nodes).to.have.lengthOf(2);
					expect(root.first).have.property("type", "decl");
					expect(root.first).have.property("prop", "color");
					expect(root.first).have.property("value", "red");
					expect(root.last).have.property("type", "literal");
					expect(root.last).have.property("text", "${buttonStyles}");
				}
			}
		});
	});

	it("selector", () => {
		const file = require.resolve("./fixtures/tpl-selector.mjs");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(6);
		document.first.nodes.forEach(rule => {
			expect(rule).to.have.property("type", "rule");
			expect(rule).to.have.property("selector");
			expect(rule.selector).to.match(/(?:^|\s)\$\{selector\}(?=,|\s|$)/);
		});
	});

	describe("decl", () => {
		const file = require.resolve("./fixtures/tpl-decl.mjs");
		const code = fs.readFileSync(file);

		syntax.parse(code, {
			from: file,
		}).first.nodes.forEach(rule => {
			it(rule.selector, () => {
				expect(rule.nodes).to.have.lengthOf(1);
				const decl = rule.first;
				expect(decl).to.have.property(
					"prop",
					/\bprop\b/.test(rule.selector)
						? `${/\bprefix\b/.test(rule.selector) ? "prefix-" : ""}\${prop}${/\bsuffix\b/.test(rule.selector) ? "-suffix" : ""}`
						: "prop"
				);
				expect(decl).to.have.property(
					"value",
					/\bvalue\b/.test(rule.selector)
						? `${/\bprefix\b/.test(rule.selector) ? "prefix-" : ""}\${value}${/\bsuffix\b/.test(rule.selector) ? "-suffix" : ""}`
						: "value"
				);
			});
		});
	});

	it("non-literals", () => {
		const file = require.resolve("./fixtures/tpl-special.mjs");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		document.walk(node => {
			expect(node).to.have.property("type");
			expect(node.type).to.not.equal("literal");
		});
	});

	describe("template-safe-parse", () => {
		[
			"./fixtures/tpl-in-tpl.mjs",
			"./fixtures/multiline-arrow-function.mjs",
			"./fixtures/interpolation-content.mjs",
			"./fixtures/tpl-selector.mjs",
			"./fixtures/tpl-decl.mjs",
			"./fixtures/tpl-special.mjs",
		].map(file => {
			it(file, () => {
				file = require.resolve(file);
				const code = fs.readFileSync(file);
				syntax({
					css: "safe-parser",
				}).parse(code, {
					from: "styled-safe-parse.js",
				});
			});
		});
	});
});
