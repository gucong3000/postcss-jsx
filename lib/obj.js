"use strict";
const Container = require("postcss/lib/container");

/**
 * Represents a JS obj
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('{}');
 * const obj = root.first;
 * obj.type       //=> 'obj'
 * obj.toString() //=> 'a{}'
 */
class Obj extends Container {
	constructor (defaults) {
		super(defaults);
		this.type = "obj";
		if (!this.nodes) this.nodes = [];
	}
}

module.exports = Obj;
