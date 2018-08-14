const assert            = require('assert');
const Level             = require('../../GameLogic/Level.js');
const objectDispatcher  = require('../../GameLogic/Level objects/LevelObjectDispatcher.js');
const TYPES             = objectDispatcher.TYPES;

const test = describe('Level initialization check', function() {
    const config = {
        "spawn":{"x":25,"y":25},
	    "objects":[
		    {"id":0,"type":1,"x":0,"y":50,"width":350,"height":25,"color":{"r":0,"g":0,"b":0,"a":0}},
		    {"id":1,"type":1,"x":50,"y":125,"width":350,"height":25,"color":{"r":0,"g":0,"b":0,"a":0}},
		    {"id":2,"type":1,"x":0,"y":200,"width":350,"height":25,"color":{"r":0,"g":0,"b":0,"a":0}},
		    {"id":3,"type":3,"x":175,"y":0,"width":50,"height":50,"lastCount":1,"count":1,"doors":[9],"color":{"r":255,"g":0,"b":0,"a":0}},
		    {"id":4,"type":3,"x":175,"y":75,"width":50,"height":50,"lastCount":1,"count":1,"doors":[8],"color":{"r":0,"g":0,"b":255,"a":0}},
		    {"id":5,"type":3,"x":175,"y":150,"width":50,"height":50,"lastCount":1,"count":1,"doors":[7],"color":{"r":255,"g":255,"b":0,"a":0}},
		    {"id":6,"type":2,"x":0,"y":225,"width":75,"height":75,"isBad":false},
		    {"id":7,"type":1,"isOpened":false,"x":350,"y":200,"width":50,"height":25,"color":{"r":255,"g":255,"b":153,"a":0}},
		    {"id":8,"type":1,"isOpened":false,"x":0,"y":125,"width":50,"height":25,"color":{"r":153,"g":153,"b":255,"a":0}},
		    {"id":9,"type":1,"isOpened":false,"x":350,"y":50,"width":50,"height":25,"color":{"r":255,"g":153,"b":153,"a":0}}
	    ],
	    "lvlname":"D1"
    };

    var walls = [];

    var exits = 0, 
        hovers = 0;

    for (var i = 0, l = config.objects.length; i < l; i++) {
        if (config.objects[i].type == TYPES.GOAL) {
            exits++;
        } else if (config.objects[i].type == TYPES.HOVER) {
            hovers++;
        } else if (config.objects[i].type == TYPES.WALL) {
            walls.push(config.objects[i]);
        }
    }

    const lvl = new Level(config);
    const lvlExits = lvl.objects.exits.length,
          lvlHovers = lvl.objects.hovers.length;

    it('amounts of exits and hover areas in Level instance should be equal to corresponding ones in level config', function() {
        assert.strictEqual(lvlExits, exits, 'Incorrect amount of exits.');
        assert.strictEqual(lvlHovers, hovers, 'Incorrect amount of hover areas.');
    });

    it('random wall area in Level instance should not be walkable', function() {
        const wall  = walls[ Math.floor(walls.length * Math.random()) ];
        const randX = Math.floor(wall.x + walls.width * Math.random());
        const randY = Math.floor(wall.y + walls.height * Math.random());

        assert.strictEqual(lvl.map.isWalkableAt(randX, randY), false, `Wall area is walkable at x: ${randX}, y: ${randY}`);
    });
});

module.exports = test;