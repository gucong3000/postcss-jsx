"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");
const autoprefixer = require("autoprefixer");
const cases = require("postcss-parser-tests");
const JSON5 = require("json5");
const objectStringify = require("../object-stringify");

describe("CSS in JS", () => {
	it("basic js", () => {
		const document = syntax.parse("x().y(z => {});", {
			from: "/fixtures/basic.js",
		});
		expect(document.nodes).to.lengthOf(0);
	});
	it("glamorous", () => {
		const code = `
			import glm from 'glamorous';
			const Component1 = glm.a({
				"::placeholder": {
					color: "gray",
				},
			});
		`;
		const out = `
			import glm from 'glamorous';
			const Component1 = glm.a({
				"::WebkitInputPlaceholder": {
					color: "gray",
				},
				"::placeholder": {
					color: "gray",
				},
			});
		`;
		return postcss([
			autoprefixer({
				browsers: ["Chrome > 10"],
			}),
		]).process(
			code,
			{
				syntax,
				from: "/fixtures/glamorous-prefix.jsx",
			}
		).then(result => {
			expect(result.content).equal(out);
		});
	});

	describe("setter for object literals", () => {
		it("decl.raws.prop.raw & decl.raws.value.raw", () => {
			const decl = syntax.parse(`
				import glm from 'glamorous';
				const Component1 = glm.a({
					borderRadius: '5px'
				});
			`, {
				from: "/fixtures/glamorous-atRule.jsx",
			}).first.first.first;
			decl.raws.prop.raw = "WebkitBorderRadius";
			expect(decl.prop).to.equal("-webkit-border-radius");
			decl.raws.value.raw = "15px";
			expect(decl.value).to.equal("15px");
		});
		it("atRule.raws.params.raw", () => {
			const atRule = syntax.parse(`
				import glm from 'glamorous';
				const Component1 = glm.a({
					'@media (maxWidth: 500px)': {
						borderRadius: '5px'
					}
				});
			`, {
				from: "/fixtures/glamorous-atRule.jsx",
			}).first.first.first;
			atRule.raws.params.raw = "(minWidth: ' + minWidth + ')";
			expect(atRule.params).to.equal("(min-width: ' + minWidth + ')");
		});
	});

	it("empty object literals", () => {
		const code = `
			import glm from 'glamorous';
			const Component1 = glm.a({
			});
		`;
		const root = syntax.parse(code, {
			from: "/fixtures/glamorous-empty-object-literals.jsx",
		});

		expect(root.toString()).to.equal(code);

		root.first.first.raws.after = "";
		expect(root.toString()).to.equal(`
			import glm from 'glamorous';
			const Component1 = glm.a({});
		`);
	});

	it("float", () => {
		const code = `
			import glm from 'glamorous';
			const Component1 = glm.a({
				cssFloat: "left",
			});
		`;

		const root = syntax.parse(code, {
			from: "/fixtures/glamorous-float.jsx",
		});
		expect(root.first.first.first).to.haveOwnProperty("prop", "float");

		expect(root.toString()).to.equal(`
			import glm from 'glamorous';
			const Component1 = glm.a({
				cssFloat: "left",
			});
		`);

		root.first.first.nodes = [
			postcss.decl({
				prop: "float",
				value: "right",
				raws: {
					before: root.first.first.first.raws.before,
				},
			}),
		];

		expect(root.toString()).to.equal(`
			import glm from 'glamorous';
			const Component1 = glm.a({
				cssFloat: "right",
			});
		`);
	});
	describe("objectify for css", () => {
		cases.each((name, css) => {
			if (name === "bom.css") return;

			it("objectStringifier " + name, () => {
				const root = postcss.parse(css);
				const jsSource = root.toString(objectStringify).trim();
				const jsonSource = "{\n" + jsSource.replace(/,$/, "").replace(/[\s;]+$/gm, "") + "\n}";
				expect(JSON5.parse(jsonSource)).be.ok;
			});
		});
	});

	it("incomplete code", () => {
		const filename = "fixtures/incomplete- react-native.mjs";
		const code = [
			`StyleSheet.create({
				box: { padding: 10 },
				text: { fontWeight: "bold" },
			});`,
			"styled.div`a{display: block}`",
		].join("\n");

		const document = syntax.parse(code, {
			from: filename,
		});
		expect(document.nodes).to.have.lengthOf(2);
	});
});
