"use strict";
const traverse = require("@babel/traverse").default;
const t = require("@babel/types").default;
const parse = require("babylon").parse;

const isTopLevelExpression = path =>
	path.isObjectExpression() && !path.findParent(p => p.isObjectExpression());

const isCssAttribute = path =>
	isTopLevelExpression(path) &&
	path.findParent(
		p => p.isJSXAttribute() && p.node.name && p.node.name.name === "css"
	);

const extractDeclarations = (path) => {
	let declarations = [];

	path.traverse({
		ObjectExpression (p) {
			if (!p.findParent(parent => parent.isObjectProperty())) {
				p.node.properties.forEach((prop) => {
					declarations = declarations.concat([prop]);
				});
			}
		},
	});

	return declarations;
};

function getSourceType (filename) {
	if (filename && /\.m[tj]sx?$/.test(filename)) {
		return "module";
	}
	try {
		return require("@babel/core").loadOptions({
			filename,
		}).sourceType;
	} catch (ex) {
		//
	}
}

function getOptions (opts, attribute) {
	const plugins = [
		"jsx",
		"typescript",
		"objectRestSpread",
		"decorators",
		"classProperties",
		"exportExtensions",
		"asyncGenerators",
		"functionBind",
		"functionSent",
		"dynamicImport",
		"optionalCatchBinding",
	];
	const filename = opts.from && opts.from.replace(/\?.*$/, "");

	return {
		sourceFilename: filename,
		sourceType: getSourceType(filename) || "module",
		plugins,
	};
}

function literalParser (source, opts) {
	let ast;
	try {
		ast = parse(source, getOptions(opts));
	} catch (ex) {
		if (opts.from && /\.(?:m?[jt]sx?|es\d*|pac)(\?.*|$)/i.test(opts.from)) {
			return [];
		}
		return;
	}

	let glamorousImport;
	let objects = [];
	let tpls = [];

	traverse(ast, {
		enter (path) {
			if (path.isTemplateLiteral()) {
				tpls.push(path);
				return;
			}
			if (isCssAttribute(path)) {
				objects = objects.concat([path]);
			}

			if (path.isImportDeclaration()) {
				if (path.node.source.value === "glamorous") {
					glamorousImport = path
						.get("specifiers")
						.filter(specifier => specifier.isImportDefaultSpecifier())[0];
				}
			}

			if (path.isCallExpression()) {
				let importName;

				if (glamorousImport) {
					importName = glamorousImport.node.local.name;
				}

				if (
					(path.node.callee.object &&
					(path.node.callee.object.name === importName || path.node.callee.object.name === "styled")) ||
					(path.node.callee.callee && (path.node.callee.callee.name === importName || path.node.callee.callee.name === "styled"))
				) {
					path.get("arguments").forEach((arg) => {
						if (arg.isObjectExpression()) {
							objects = objects.concat([arg]);
						} else if (arg.isFunction()) {
							if (arg.get("body").isObjectExpression()) {
								objects = objects.concat(arg.get("body"));
							} else {
								const rule = Object.assign(
									{},
									t.objectExpression(extractDeclarations(arg.get("body"))),
									{ loc: path.node.loc }
								);
								path.replaceWith(rule);
								objects = objects.concat(path);
							}
						}
					});
				}
			}
		},
	});

	objects = objects.map(path => {
		const objectSyntax = require("./object-syntax");
		const root = objectSyntax.parse(path.node, source, opts);
		const startIndex = root.first.raws.node.start;
		const endIndex = root.last.raws.node.end;
		return {
			root,
			startIndex,
			endIndex,
			syntax: objectSyntax,
			lang: "object-literal",
		};
	});

	let styledSyntax;

	function getStyledSyntax () {
		if (!styledSyntax) {
			const getSyntax = require("postcss-syntax/lib/get-syntax");
			const cssSyntax = getSyntax("css", opts);
			styledSyntax = {
				parse: require(cssSyntax.parse.name === "safeParse" ? "./template-safe-parse" : "./template-parse"),
				stringify: cssSyntax.stringify,
			};
		}
		return styledSyntax;
	}

	tpls = tpls.filter(path => (
		objects.every(style => (
			path.node.start > style.endIndex || path.node.end < style.startIndex
		))
	)).map(path => {
		const quasis = path.node.quasis;
		const startIndex = quasis[0].start;
		const strSource = source.slice(startIndex, quasis[quasis.length - 1].end);

		if (!strSource.trim()) {
			return;
		}

		const style = {
			startIndex: startIndex,
			content: strSource,
			ignoreErrors: true,
		};
		if (/(^|\s|\{|\}|;|:)\$\{/m.test(strSource)) {
			style.syntax = getStyledSyntax();
			style.lang = "template-literal";
		} else {
			style.lang = "css";
		}
		return style;
	}).filter(Boolean);

	return objects.concat(tpls);
};

module.exports = literalParser;
