"use strict";
const spawnSync = require("child_process").spawnSync;
const fs = require("fs");
const files = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.match(/^.+$/gm).filter(file => file.endsWith(".js"));
const syntax = require("../");
const expect = require("chai").expect;

describe("non-style js files", () => {
	files.forEach(file => {
		it(file, () => {
			const code = fs.readFileSync(file);
			const document = syntax.parse(code, {
				from: file,
			});
			expect(document.source).to.haveOwnProperty("lang", "jsx");
			expect(document.toString(), code.toString());
		});
	});
});
