"use strict";
const tokenize = require("postcss/lib/tokenize");

function templateTokenize (input) {
	const quasis = input.node.quasis.map((node) => ({
		start: node.start,
		end: node.end,
	})).filter(quasi => quasi.start !== quasi.end);

	let pos = input.node.start + 1;

	const tokenizer = tokenize.apply(this, arguments);

	function tokenInQuasis (start, end) {
		return quasis.some(quasi => (start >= quasi.start && end < quasi.end));
	}

	function back (token) {
		pos -= token[1].length;
		return tokenizer.back.apply(tokenizer, arguments);
	}

	function nextToken () {
		const args = arguments;
		const returned = [];
		let token;
		while (
			(token = tokenizer.nextToken.apply(tokenizer, args)) &&
			!tokenInQuasis(pos, (pos += token[1].length)) &&
			(returned.length || /\$(?=\{|$)/.test(token[1]))
		) {
			returned.push(token);
		}
		if (returned.length) {
			let lastToken = returned[returned.length - 1];
			if (token && token !== lastToken) {
				if (token[0] === returned[0][0]) {
					returned.push(token);
					lastToken = token;
				} else {
					back(token);
				}
			}
			while (lastToken[0] === "space") {
				back(returned.pop());
				lastToken = returned[returned.length - 1];
			}
			token = [
				returned[0][0],
				returned.map(token => token[1]).join(""),
				returned[0][2],
				returned[0][3],
				lastToken[4] || lastToken[2],
				lastToken[5] || lastToken[3],
			];
		}
		return token;
	}
	return Object.assign({}, tokenizer, {
		back,
		nextToken,
	});
}

module.exports = templateTokenize;
