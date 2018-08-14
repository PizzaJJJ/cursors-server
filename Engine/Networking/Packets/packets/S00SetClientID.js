const BufferWriter = require("../BufferWriter.js");

const OPCODE = 0;

class PacketS00SetClientID {
	encode() {
		var writer = new BufferWriter();

		writer.writeU8(OPCODE);
		writer.writeU32(this._id);

		return writer.encode();
	}

	setId(id) {
		this._id = id;
	}

	static getName() {
		return "S00";
	}

	static create() {
		return new PacketS00SetClientID();
	}
}

module.exports = PacketS00SetClientID;