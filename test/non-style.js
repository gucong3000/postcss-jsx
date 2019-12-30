"use strict";
const spawnSync = require("child_process").spawnSync;
const fs = require("fs");
const files = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.match(/^.+\.js$/gm);
const syntax = require("../");
const expect = require("chai").expect;

describe("not throw error for non-style js file", () => {
	files.forEach(file => {
		it(file, () => {
			const code = fs.readFileSync(file);
			const document = syntax.parse(code, {
				from: file,
			});
			expect(document.source).to.haveOwnProperty("lang", "jsx");
			expect(document.toString()).to.equal(code.toString());
		});
	});
});
