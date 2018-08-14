const LevelMap          = require('./LevelMap.js');
const objectDispatcher  = require('./Level objects/LevelObjectDispatcher.js');
const logger            = require('../Engine/Engine.js').getLogging().getLogger(__filename);

module.exports = function(level, configObjects, w, h) {
    const levelObjects  = level.objects;
    const min           = Math.min;      

    var constructedObjects = [];
    var gridStep = h, xRest, yRest;

    for (var i = 0; i < configObjects.length; i++) {
        let obj = objectDispatcher.constructObject(configObjects[i], level);

        if (!obj) {
            configObjects.splice(i, 1);
            i--;

            logger.warn(`Invalid object won't be included to level ${level.name}`);
            continue;
        }

        constructedObjects[obj.id] = obj;

        switch (obj.type) {
            case objectDispatcher.TYPES.TEXT:
                levelObjects.texts.push(obj);
                break;
            case objectDispatcher.TYPES.WALL:
                levelObjects.walls.push(obj);
                break;
            case objectDispatcher.TYPES.GOAL:
                levelObjects.exits.push(obj);
                break;
            case objectDispatcher.TYPES.HOVER:
                levelObjects.hovers.push(obj);
                break;
            case objectDispatcher.TYPES.BUTTON:
                levelObjects.buttons.push(obj);
                break;  
        }
        /* 
            Calculating maximal acceptable grid size for level's map.
            Step 1 - draft calculation.
        */
        if (obj.type != objectDispatcher.TYPES.TEXT) {
            gridStep = min(gridStep, obj.width, obj.height);
		    xRest = obj.x % gridStep;
		    yRest = obj.y % gridStep;
		    if (xRest > 0) gridStep = min(gridStep, xRest);
		    if (yRest > 0) gridStep = min(gridStep, yRest);
        }
    }

    const l = configObjects.length;
    var j, jl;
    
    for (i = 0; i < l; i++) {
        let obj = configObjects[i];

        if (obj.hasOwnProperty('doors')) {
            for (j = 0, jl = obj.doors.length; j < jl; j++) {
                constructedObjects[obj.id].doors.push(
                    constructedObjects[obj.doors[j]]
                );
            }
        }

        if (obj.hasOwnProperty('owners')) {
            for (j = 0, jl = obj.owners.length; j < jl; j++) {
                constructedObjects[obj.id].owners.push(
                    constructedObjects[obj.owners[j]]
                );
            }
        }
        /* 
            Calculating maximal acceptable grid size for level's map.
            Step 2 - correcting calculation.
        */
        if (obj.type != objectDispatcher.TYPES.TEXT) {
            xRest = obj.x % gridStep;
            yRest = obj.y % gridStep;
            if (xRest > 0) gridStep = min(gridStep, xRest);
            if (yRest > 0) gridStep = min(gridStep, yRest);
        }
    }

    const levelMap = new LevelMap(gridStep, w, h);
    for (i = 0; i < l; i++) {
        let obj = constructedObjects[configObjects[i].id];

        if (obj.type != objectDispatcher.TYPES.TEXT) {
            levelMap.writeObject(obj);
        }
    }

    level.map = levelMap;
};