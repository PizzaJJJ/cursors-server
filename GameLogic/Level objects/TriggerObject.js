const BasicObject = require('./BasicObject.js');

class TriggerObject extends BasicObject {
    constructor(obj, level) {
        super(obj, level);

        this.count = this.limitCount = obj.count;
        this.doors = [];
    }

    getData() {
        var obj = super.getData();
        obj.count = this.count;

        return obj;
    }

    reset() {
        this.count = this.limitCount;

        if (this.initiallyHidden) {
            this.hide();
        } else {
            this.show();
        }

        this.closeDoors();
    }

    openDoors() {
        for (var i = 0, l = this.doors.length; i < l; i++) {
            if (!this.doors[i].hidden) {
                this.doors[i].hide();
            }
        }
    }

    closeDoors() {
        var j, k;

        a: for (var i = 0, l = this.doors.length; i < l; i++) {
            if (this.doors[i].hidden) {
                let door = this.doors[i];
                
                for (j = 0, k = door.owners.length; j < k; j++) {
                    if (door.owners[j] != this && door.owners[j].count == 0) {
                        continue a;
                    }
                }

                door.show();
            }
        }
    }
}

module.exports = TriggerObject;