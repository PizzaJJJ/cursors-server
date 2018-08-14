function writeColor(w, c) {
    w.writeU8(c.b);
    w.writeU8(c.g);
    w.writeU8(c.r);
    w.writeU8(c.a);
}

function writeString(w, s) {
    var b = new Buffer(s);
    w.writeBuffer(b);
}

function writeObject(w, obj, id) {
    w.writeU32(id);
    w.writeU8(obj.type);

    switch(obj.type) {
        case 0:
            w.writeU16(obj.x);
            w.writeU16(obj.y);
            w.writeU8(obj.textHeight);
            w.writeU8(obj.isCentered ? 1 : 0);
            writeString(w, obj.text);
            w.writeU8(0);
            break;
        case 1:
            w.writeU16(obj.x);
            w.writeU16(obj.y);
            w.writeU16(obj.width);
            w.writeU16(obj.height);
            writeColor(w, obj.color);
            break;
        case 2:
            w.writeU16(obj.x);
            w.writeU16(obj.y);
            w.writeU16(obj.width);
            w.writeU16(obj.height);
            w.writeU8(obj.isBad);
            break;
        case 3:
            w.writeU16(obj.x);
            w.writeU16(obj.y);
            w.writeU16(obj.width);
            w.writeU16(obj.height);
            w.writeU16(obj.count);
            writeColor(w, obj.color);
            break;
        case 4:
            w.writeU16(obj.x);
            w.writeU16(obj.y);
            w.writeU16(obj.width);
            w.writeU16(obj.height);
            w.writeU16(obj.count);
            writeColor(w, obj.color);
            break;
        }
}

module.exports = writeObject;