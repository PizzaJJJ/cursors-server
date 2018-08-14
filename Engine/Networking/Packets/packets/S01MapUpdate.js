const BufferWriter = require("../BufferWriter.js");
const writeObject = require("../WriteObject.js");

const OPCODE = 1;

class PacketS01MapUpdate {
	constructor() {
		this._playerUpdates 	= [];
		this._clicks 			= [];
		this._wallsRemoved 		= [];
		this._mapUpdates 		= [];
		this._drawings 			= [];
		this._playerCount 		= 0;
	}

	encode() {
		var writer = new BufferWriter(), l;

		writer.writeU8(OPCODE);

		l = this._playerUpdates.length;
		writer.writeU16(l);
		for (var i = 0; i < l; i++) {
			writer.writeU32(this._playerUpdates[i].id);
			writer.writeU16(this._playerUpdates[i].x);
			writer.writeU16(this._playerUpdates[i].y);
		}

		l = this._clicks.length;
		writer.writeU16(l);
		for (i = 0; i < l; i++) {
			writer.writeU16(this._clicks[i].x);
			writer.writeU16(this._clicks[i].y);
		}

		l = this._wallsRemoved.length;
		writer.writeU16(l);
		for (i = 0; i < l; i++) {
			writer.writeU32(this._wallsRemoved[i]);
		}

		l = this._mapUpdates.length;
		writer.writeU16(l);
		for (i = 0; i < l; i++) {
			writeObject(writer, this._mapUpdates[i], this._mapUpdates[i].id);
		}

		l = this._drawings.length;
		writer.writeU16(l);
		for (i = 0; i < l; i++) {
			writer.writeU16(this._drawings[i].x1);
			writer.writeU16(this._drawings[i].y1);
			writer.writeU16(this._drawings[i].x2);
			writer.writeU16(this._drawings[i].y2);
		}
		
		writer.writeU32(this._playerCount);

		return writer.encode();
	}

	setPlayerUpdates(pu) {
		this._playerUpdates = pu;
	}

	setClicks(c) {
		this._clicks = c;
	}

	setWallsRemoved(wr) {
		this._wallsRemoved = wr;
	}

	setMapUpdates(mu) {
		this._mapUpdates = mu;
	}

	setLines(l) {
		this._drawings = l;
	}

	setPlayerCount(pc) {
		this._playerCount = pc;
	}

	static getName() {
		return "S01";
	}

	static create() {
		return new PacketS01MapUpdate();
	}
}

module.exports = PacketS01MapUpdate;