const Engine = require('../Engine/Engine.js');
const logger = Engine.getLogging().getLogger(__filename);
const levelManager = require('./LevelManager.js');
const APP_NAME = require('../Engine/Utilities/Constants.js').APP_NAME;

logger.info(`Starting up ${APP_NAME}`);

const engine            = new Engine();
const server            = engine.server;
const inputController   = engine.inputController;

const gameConf  = Engine.getConfig(__dirname + '/config/gameconfig.json');

if (!gameConf) {
    engine.stop();
    
    logger.error(`Invalid application ${APP_NAME} configuration! Server stopped.`);
    return;
}

Engine.setEngine(engine);

const onConnect = require('./Server event handlers/OnPlayerConnect.js');
const onMessage = require('./Server event handlers/OnPlayerMessage.js');
const onDisconnect = require('./Server event handlers/OnPlayerDisconnect.js');

if (inputController) {
    inputController.subscribeOnEvent('connection', onConnect);
    inputController.subscribeOnEvent('clientMessage', onMessage);
    inputController.subscribeOnEvent('disconnection', onDisconnect);
} else {
    server.subscribeOnEvent('connection', onConnect);
    server.subscribeOnEvent('clientMessage', onMessage);
    server.subscribeOnEvent('disconnection', onDisconnect);
}

logger.info(`${APP_NAME} server engine successfully started up!`);

levelManager.initialise(gameConf);

logger.info(`${APP_NAME} successfully started up!`);
