"use strict";

const split = require("../lib/extract");
const expect = require("chai").expect;

describe("parser", () => {
	const opts = {
		syntax: {
			config: {},
		},
	};

	it("skip empty template literal", () => {
		const result = split("``", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip spaces template literal", () => {
		const result = split("`    `", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip double quotes", () => {
		const result = split("\"$ {}\"", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip standard comments", () => {
		const result = split("/*`$ {}`*/", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip single-line comments", () => {
		const result = split("//`$ {}`", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("single line string in line 2", () => {
		const result = split("\n`$ {}`", opts);
		expect(result).to.have.lengthOf(1);
		expect(result[0]).have.property("content", "$ {}");
		expect(result[0]).have.property("startIndex", 2);
	});
});
