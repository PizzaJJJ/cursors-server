const BasicObject = require('./BasicObject.js');

class TextObject extends BasicObject {
    constructor(obj, level) {
        super(obj, level);

        this.textHeight = obj.textHeight || 0;
        this.isCentered = !!obj.isCentered;
        this.text       = obj.text || '';
    }

    getData() {
        return {
            id: this.id, 
            type: this.type,
            x: this.x, 
            y: this.y, 
            textHeight: this.textHeight,
            isCentered: this.isCentered,
            text: this.text
        };
    }
}

module.exports = TextObject;