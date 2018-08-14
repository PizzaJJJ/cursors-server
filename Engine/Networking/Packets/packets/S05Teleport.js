const BufferWriter = require("../BufferWriter.js");

const OPCODE = 5;

class S05Teleport {
	constructor() {
		this._x = 0;
		this._y = 0;
		this._g = 0;
	}

	encode() {
		var w = new BufferWriter();

		w.writeU8(OPCODE);
		w.writeU16(this._x);
		w.writeU16(this._y);
		w.writeU32(this._g);

		return w.encode();
	}

	setX(x) {
		this._x = x;
	}

	setY(y) {
		this._y = y;
	}

	setG(g) {
		this._g = g;
	}

	static getName() {
		return "S05";
	}

	static create() {
		return new S05Teleport();
	}
}

module.exports = S05Teleport;