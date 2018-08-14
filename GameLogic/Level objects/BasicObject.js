const objDispatcher = require('./LevelObjectDispatcher.js');

class BasicObject {
    constructor(obj, level) {
        this.id     = obj.id;
        this.type   = obj.type;

        this.x      = obj.x || 0;
        this.y      = obj.y || 0;
        this.width  = obj.width || 0;
        this.height = obj.height || 0;
        this.color  = obj.color;

        this.owners = [];
        this.initiallyHidden = this.hidden = !!obj.isOpened || !!obj.hidden;

        this.level = level;
    }

    getData() {
        return {
            id: this.id, 
            type: this.type,
            x: this.x, 
            y: this.y, 
            width: this.width,
            height: this.height,
            color: this.color
        };
    }

    hide() {
        this.level.updates.objRemove.push(this.id);
        this.hidden = true;
    }

    show() {
        this.level.updates.objAdd.push(this.getData());
        this.hidden = false;

        if (this.type == objDispatcher.TYPES.WALL) {
            this.level.moveOutPlayers(this);
        }
    }
}

module.exports = BasicObject;