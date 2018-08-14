const TriggerObject = require('./TriggerObject.js');

class HoverArea extends TriggerObject {
    constructor(obj, level) {
        super(obj, level);
    }

    hover(amount) {
        var newCount = this.limitCount - amount;

        if (newCount < 0) {
            newCount = 0;
        }

        if (this.count != newCount) {
            if (newCount == 0 && this.count > 0) {
                this.openDoors();
            } else if (newCount > 0 && this.count == 0) {
                this.closeDoors();
            }
            
            this.count = newCount;
            this.level.updates.objAdd.push(this.getData());
        }
    }
}

module.exports = HoverArea;