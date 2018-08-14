const PacketManager = require('./Networking/Packets/PacketManager.js');
const readConfig    = require('./Utilities/ConfigReader.js').readConfigFile;
const Constants     = require('./Utilities/Constants.js');
const FileManager   = require('./Utilities/FileManager.js');
const Logging       = require('./Utilities/Logging.js');
const Time          = require('./Utilities/Time.js');

var logger          = Logging.getLogger(__filename);

process.on('exit', function(code) {
    logger.warn(`${Constants.APP_NAME} application exits with code: ${code}`);
});

var engine;

class Engine {
    constructor(config) {
        if (!config) {
            config = readConfig(__dirname + '/config/config.json');
        }

        if (config.hasOwnProperty('logging')) {
            Logging.setLevel(config.logging.level);
            Logging.setTimezone(config.logging.timezone);
        }
    
        if (config.hasOwnProperty('packets')) {
            if (config.packets.hasOwnProperty('valid')) {
                PacketManager.setValidPackets(config.packets.valid);
            }
    
            if (config.packets.hasOwnProperty('throttled')) {
                PacketManager.setThrottledPackets(config.packets.throttled);
            }

            if (config.packets.hasOwnProperty('maxLength')) {
                PacketManager.setMaxPacketLength(config.packets.maxLength);
            }
        }
    
        const ServerOptions = require('./Networking/ServerOptions.js');
        const Server = require('./Networking/Server.js');
        const InputController = require('./Networking/PlayerInboundDataController.js');
    
        var serverOptions;
        if (config.hasOwnProperty('server')) {
            serverOptions = new ServerOptions(config.server);
        } else {
            serverOptions = ServerOptions.getDefault();
            logger.warn('Server configuration is missing. Default values are used:', serverOptions);
        }
    
        const server = new Server(serverOptions);
        logger.info('Server initialized');
    
        var inputController = Constants.NULL;
        if (config.hasOwnProperty('inputController')) {
            if (config.inputController.enabled) {
                inputController = new InputController(server, config.inputController.tickInterval || 20);
                logger.info('Player input controller initialized');
            }
        }

        this.server = server;
        this.inputController = inputController;
    }

    stop() {
        this.server.stop();

        if (this.inputController != Constants.NULL) {
            this.inputController.stop();
        }
    }

    static getEngine() {
        return engine;
    }

    static setEngine(_engine) {
        if (_engine instanceof Engine) {
            engine = _engine;
        }
    }

    // Shortcuts
    static getPacketManager()   { return PacketManager; }
    static getConfig(path)      { return readConfig(path); }
    static getConstants()       { return Constants;}
    static getFileManager()     { return FileManager; }
    static getLogging()         { return Logging; }
    static getTime()            { return Time; }
}

module.exports = Engine;
