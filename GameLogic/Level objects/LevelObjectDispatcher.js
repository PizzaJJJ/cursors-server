const TextObject    = require('./TextObject.js');
const BasicObject   = require('./BasicObject.js');
const Goal          = require('./Goal.js');
const HoverArea     = require('./HoverArea.js');
const Button        = require('./Button.js');
const Engine        = require('../../Engine/Engine.js');
const logger        = Engine.getLogging().getLogger(__filename);
const NULL          = Engine.getConstants().NULL;

const TYPES = {
    TEXT:   0,
    WALL:   1,
    GOAL:   2,
    HOVER:  3,
    BUTTON: 4
};

module.exports.constructObject = function(obj, level) {
    if (obj && obj.hasOwnProperty('type')) {
        switch (obj.type) {
            case TYPES.TEXT:
                return new TextObject(obj, level);
            case TYPES.WALL:
                return new BasicObject(obj, level);
            case TYPES.GOAL:
                return new Goal(obj, level);
            case TYPES.HOVER:
                return new HoverArea(obj, level);
            case TYPES.BUTTON:
                return new Button(obj, level);
        }
    }

    logger.error(`There is no object constructor ${obj.hasOwnProperty('type') ? ('of such type: ' + obj.type) : ('for invalid object configuration')}`);
    return NULL;
};

module.exports.TYPES = TYPES;