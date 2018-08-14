const OPCODE = 3;

class C02Line {
	readFrom(reader) {
		this.pid = OPCODE;
		this.x1 = reader.readU16();
		this.y1 = reader.readU16();
		this.x2 = reader.readU16();
		this.y2 = reader.readU16();
	}

	static getName() {
		return "C02";
	}

	static create() {
		return new C02Line();
	}
}

module.exports = C02Line;
