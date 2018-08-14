const BufferWriter 	= require("../BufferWriter.js");
const writeObject 	= require("../WriteObject.js");

const OPCODE = 4;

class S04Level {
	encode() {
		var w = new BufferWriter(),
			length = 0, i, l, 
			objects = [];

		for (var type in this.map.objects) {
			let obj = this.map.objects[type];

			for (i = 0, l = obj.length; i < l; i++) {
				if (!obj[i].hidden) {
					objects.push(obj[i]);
					length++;
				}
			}
		}

		w.writeU8(OPCODE); //packet id
		w.writeU16(this.map.spawn.x);
		w.writeU16(this.map.spawn.y);
		w.writeU16(length);

		for (i = 0, l = objects.length; i < l; i++) {
			writeObject(w, objects[i], objects[i].id);
		}
			
		w.writeU32(0); //G

		return w.encode();
	}

	setMap(map) {
		this.map = map;
	}

	static getName() {
		return "S04";
	}

	static create() {
		return new S04Level();
	}
}

module.exports = S04Level;