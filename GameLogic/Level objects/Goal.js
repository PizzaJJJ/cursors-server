const BasicObject = require('./BasicObject.js');

class Goal extends BasicObject {
    constructor(obj, level) {
        super(obj, level);

        this.isBad          = !!obj.isBad;
        this.isRandom       = !!obj.isRandom;

        this.destination    = obj.dst || null;
    }

    getData() {
        var obj = super.getData();
        obj.isBad = this.isBad;

        return obj;
    }
}

module.exports = Goal;