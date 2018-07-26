"use strict";

const expect = require("chai").expect;
const camelCase = require("../camel-case");
const unCamelCase = require("../un-camel-case");

const data = {
	xwebkitAnimation: "-xwebkit-animation",
	webkitAnimation: "-webkit-animation",
	epubAnimation: "-epub-animation",
	mozAnimation: "-moz-animation",
	msAnimation: "-ms-animation",
	oAnimation: "-o-animation",
	xAnimation: "-x-animation",
	webkitApp: "-webkit-app",
	borderTopLeftRadius: "border-top-left-radius",
	backgroundImage: "background-image",
	"::selection": "::selection",
	"::mozSelection": "::-moz-selection",
	"::mozSelection,::selection": "::-moz-selection,::selection",
	"--margin-top": "--margin-top",
	"margin--top": "margin--top",
	"height: webkitCalc(2vh-20px);": "height: -webkit-calc(2vh-20px);",
	"calc(2vh-20px)": "calc(2vh-20px)",
	"calc(2vh--20px)": "calc(2vh--20px)",
};

const testCases = Object.keys(data).map(prop => {
	return {
		camel: prop,
		unCamel: data[prop],
	};
});

const symbols = Array.from("@*:;\n,(){} ");

describe("camelCase", () => {
	testCases.forEach(testCase => {
		it(`${testCase.unCamel} => ${testCase.camel}`, () => {
			expect(camelCase(testCase.unCamel)).to.equal(testCase.camel);
		});
	});
	describe("symbols", () => {
		symbols.forEach(symbol => {
			it(JSON.stringify(symbol), () => {
				expect(camelCase(testCases.map(testCase => testCase.unCamel).join(symbol))).to.equal(testCases.map(testCase => testCase.camel).join(symbol));
			});
		});
	});
});

describe("unCamelCase", () => {
	it("onChange => on-change", () => {
		expect(unCamelCase("onChange")).to.equal("on-change");
	});
	it("OnChange => -on-change", () => {
		expect(unCamelCase("OnChange")).to.equal("-on-change");
	});
	testCases.forEach(testCase => {
		it(`${testCase.camel} => ${testCase.unCamel}`, () => {
			expect(unCamelCase(testCase.camel)).to.equal(testCase.unCamel);
		});
	});
	describe("symbols", () => {
		symbols.forEach(symbol => {
			it(JSON.stringify(symbol), () => {
				expect(unCamelCase(testCases.map(testCase => testCase.camel).join(symbol))).to.equal(testCases.map(testCase => testCase.unCamel).join(symbol));
			});
		});
	});
});
