"use strict";
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const parse = require("@babel/parser").parse;
const getTemplate = require("./get-template");
const loadSyntax = require("postcss-syntax/load-syntax");

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

const isStyleModule = (node, references) => {
	if (node) {
		const nameSpace = [];
		do {
			if (node.name) {
				nameSpace.unshift(node.name);
			} else if (node.property && node.property.name) {
				nameSpace.unshift(node.property.name);
			}

			node = node.object || node.callee;
		} while (node);

		if (nameSpace.length && references[nameSpace[0]]) {
			nameSpace.unshift.apply(nameSpace, references[nameSpace.shift()]);
			const modeId = nameSpace[0];
			const prefix = partSport[modeId];
			if ((prefix && prefix.every((name, i) => name === nameSpace[i + 1])) || supports[modeId]) {
				return nameSpace;
			}
		}
	}
	return false;
};

const partSport = {
	// https://github.com/Khan/aphrodite
	aphrodite: [
		"StyleSheet",
		"create",
	],

	// https://github.com/necolas/react-native-web
	"react-native": [
		"StyleSheet",
		"create",
	],
};

const supports = {

	// https://github.com/tkh44/emotion
	emotion: true,
	"react-emotion": true,
	"preact-emotion": true,

	// https://github.com/threepointone/glamor
	glamor: true,

	// https://github.com/paypal/glamorous
	glamorous: true,

	// https://github.com/js-next/react-style
	"react-style": true,

	// https://github.com/casesandberg/reactcss
	reactcss: true,

	// https://github.com/styled-components/styled-components
	"styled-components": true,

	// https://github.com/rtsao/styletron
	"styletron-react": true,

	// https://github.com/typestyle/typestyle
	typestyle: true,
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
		sourceType: getSourceType(filename) || "unambiguous",
		plugins,
	};
}

function literalParser (source, opts, styles) {
	let ast;
	try {
		ast = parse(source, getOptions(opts));
	} catch (ex) {
		return styles || [];
	}

	const references = {};
	const objs = {};
	let objLiteral = [];
	let tplLiteral = [];

	function getObjectExpression (path) {
		let objectExpression;
		if (path) {
			if (path.isObjectExpression()) {
				objectExpression = path;
			} else if (path.isIdentifier()) {
				const identifierName = path.node.name;
				if (objs[identifierName]) {
					objectExpression = objs[identifierName];
					delete objs[identifierName];
				}
			}
		}
		return objectExpression;
	}

	function enter (path) {
		if (path.isImportDeclaration()) {
			const moduleId = path.node.source.value;
			if ((moduleId in supports) || (moduleId in partSport)) {
				path.node.specifiers.forEach(specifier => {
					const localName = specifier.local.name;
					references[localName] = [
						moduleId,
					];
					if (specifier.imported) {
						references[localName].push(specifier.imported.name);
					}
				});
			}
		} else if (path.isJSXAttribute()) {
			const attrName = path.node.name.name;
			if (attrName === "css") {
				const element = path.findParent(p => p.isJSXOpeningElement());
				if (!element || !isStyleModule(element.node.name, references)) {
					return;
				}
			} else if (attrName !== "style") {
				return;
			}

			if ((path = getObjectExpression(path.get("value.expression")))) {
				objLiteral.push(path);
			}
		} else if (path.isObjectExpression()) {
			if (
				path.parentPath.isVariableDeclarator() &&
				path.parent.id.type === "Identifier"
			) {
				objs[path.parent.id.name] = path;
			}
		} else if (path.isTemplateLiteral()) {
			if (path.parentPath.isTaggedTemplateExpression() && isStyleModule(path.parent.tag, references)) {
				tplLiteral.push(path);
			}
		} else if (path.isCallExpression()) {
			const callee = path.node.callee;
			if (callee.type === "Identifier" && callee.name === "require") {
				const args = path.get("arguments");
				if (args && args.length && args[0].isStringLiteral()) {
					const moduleId = args[0].container[0].value;
					if ((moduleId in supports) || (moduleId in partSport)) {
						references[path.parent.id.name] = [moduleId];
					}
				}
			} else if (isStyleModule(callee, references)) {
				path.get("arguments").forEach((arg) => {
					if (arg.isFunction()) {
						arg = arg.get("body");
						if (arg.isObjectExpression()) {
							objLiteral.push(arg);
						} else {
							const rule = Object.assign(
								{},
								types.objectExpression(extractDeclarations(arg)),
								{ loc: path.node.loc }
							);
							path.replaceWith(rule);
							objLiteral.push(path);
						}
					} else if ((arg = getObjectExpression(arg))) {
						objLiteral.push(arg);
					}
				});
			}
		}
	}
	traverse(ast, {
		enter (path) {
			try {
				enter(path);
			} catch (ex) {
				console.error(ex);
			}
		},
	});

	objLiteral = objLiteral.map(path => {
		const objectSyntax = require("./object-syntax");
		const endNode = path.node;
		const syntax = objectSyntax(endNode);
		let startNode = endNode;
		if (startNode.leadingComments && startNode.leadingComments.length) {
			startNode = startNode.leadingComments[0];
		}
		return {
			startIndex: startNode.start,
			endIndex: endNode.end,
			skipConvert: true,
			content: source,
			syntax,
			lang: "object-literal",
		};
	});

	tplLiteral = tplLiteral.filter(path => (
		objLiteral.every(style => (
			path.node.start > style.endIndex || path.node.end < style.startIndex
		))
	)).map(path => {
		const quasis = path.node.quasis;
		const value = getTemplate(path.node, source);

		if (value.length === 1 && !value[0].trim()) {
			return;
		}

		const style = {
			startIndex: quasis[0].start,
			endIndex: quasis[quasis.length - 1].end,
			content: value.join(""),
			ignoreErrors: true,
		};
		if (value.length > 1) {
			style.syntax = loadSyntax(opts, "postcss-styled");
			style.lang = "template-literal";
		} else {
			style.lang = "css";
		}
		return style;
	}).filter(Boolean);

	return (styles || []).concat(objLiteral).concat(tplLiteral);
};

module.exports = literalParser;
