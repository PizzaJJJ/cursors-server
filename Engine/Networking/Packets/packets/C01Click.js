const OPCODE = 2;

class C01Click {
	readFrom(reader) {
		this.pid = OPCODE;
		this.x = reader.readU16();
		this.y = reader.readU16();
		this.g = reader.readU32();
	}

	static getName() {
		return "C01";
	}

	static create() {
		return new C01Click();
	}
}

module.exports = C01Click;
