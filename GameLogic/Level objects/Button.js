const TriggerObject = require('./TriggerObject.js');

const RELAX_TIME = 1000;
const PAUSE_TIME = 4000;

class Button extends TriggerObject {
    constructor(obj, level) {
        super(obj, level);

        this.relaxationTime = obj.relaxationTime || RELAX_TIME;
        this.pauseTime      = obj.pauseTime      || PAUSE_TIME;
        this.timer = null;
    }

    reset() {
        super.reset();

        clearTimeout(this.timer);
    }

    relax() {
        const lastCount = this.count;
        var newCount = this.count + 1;

        if (newCount > this.limitCount) {
            newCount = this.limitCount;
        }

        if (this.count != newCount) {
            this.count = newCount;
            this.level.updates.objAdd.push(this.getData());

            if (newCount > 0 && lastCount == 0) {
                this.closeDoors();
            }
            
            this.timer = setTimeout(() => this.relax(), this.relaxationTime);
            this.level.invokeUpdateCallback();
        }
    }

    pressDown() {
        const lastCount = this.count;
        var newCount = this.count - 1;

        if (newCount < 0) {
            newCount = 0;
        }

        if (this.count != newCount) {
            this.count = newCount;
            this.level.updates.objAdd.push(this.getData());
        }

        if (newCount == 0) {
            if (lastCount > 0) {
                this.openDoors();
            }
            
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.relax(), this.pauseTime);

            return;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.relax(), this.relaxationTime);
    }
}

module.exports = Button;