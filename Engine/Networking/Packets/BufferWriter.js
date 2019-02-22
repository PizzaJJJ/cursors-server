function BufferWriter() {
	this.buffer = new Buffer();
}

BufferWriter.prototype = {
	writeU8: function(d) {
		var b = new Buffer(1);
		b[0] = d;
		this.writeBuffer(b);
	},
	writeU16: function (d) {
		var b = new Buffer(2);
		b[0] = d&0xff;
		b[1] = (d>>8)&0xff;
		this.writeBuffer(b);
	},
	writeU32: function (d) {
		var b = new Buffer(4);
		b[0] = d&0xff;
		b[1] = (d>>8)&0xff;
		b[2] = (d>>16)&0xff;
		b[3] = (d>>24)&0xff;
		this.writeBuffer(b);
	},
	writeBuffer: function(b) {
		if (!this.buffer) {
			this.buffer = b;
		} else {
			this.buffer = Buffer.concat([this.buffer,b]);
		}
	},
	encode: function() {
		return this.buffer;
	}
};

module.exports = BufferWriter;
