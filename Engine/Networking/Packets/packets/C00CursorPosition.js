const OPCODE = 1;

class C00CursorPosition {
	readFrom(reader) {
		this.pid = OPCODE;
		this.x = reader.readU16();
		this.y = reader.readU16();
		this.g = reader.readU32();
	}

	static getName() {
		return "C00";
	}

	static create() {
		return new C00CursorPosition();
	}
}

module.exports = C00CursorPosition;