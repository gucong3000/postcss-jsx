"use strict";
const extract = require("./extract");
const syntax = require("postcss-syntax/lib/syntax")(extract);

module.exports = syntax;
