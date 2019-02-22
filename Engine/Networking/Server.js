const WebSocket         = require('ws');
const WebSocketServer   = WebSocket.Server;
const stabilize         = require('./stabilizeWebsocket.js');
const Emitter           = require('events').EventEmitter;
const IPController      = require('./ServerIPController.js');
const PacketManager     = require('./Packets/PacketManager.js');
const GameLoop          = require('../Utilities/GameLoop.js');
const TIMESTAMP         = require('../Utilities/Time.js').getTimestamp;
const NULL              = require('../Utilities/Constants.js').NULL;
const logger            = require('../Utilities/Logging.js').getLogger(__filename);

class Server {
    constructor(options) {
        this._MAXPLAYERS = options.maxPlayers;
        this._DISCONNECTION_TIMEOUT = options.disconnectionTimeout;
        this._ipController = new IPController(options.maxClientsPerIp);

        this._packetThrottler = {
            enabled: options.packetThrottler.enabled,
            rate: options.packetThrottler.packetRate,
            per: options.packetThrottler.packetRatePer
        };

        this._cleanDeadClientsLoop = new GameLoop(this._verifyClientsActivity.bind(this), options.clientVerificationInterval);
        this._cleanDeadClientsLoop.start();

        delete options.maxPlayers;
        delete options.maxClientsPerIp;
        delete options.disconnectionTimeout;
        delete options.clientVerificationInterval;
        delete options.packetThrottler;
        
        options.verifyClient = this._verifyConnection.bind(this);
        
        this._eventEmitter = new Emitter();
        this._server = new WebSocketServer(options);

        this._server.on('connection', this._initPlayer.bind(this));
        this._server.on('error', this._handleServerError.bind(this));

        this._sockets = [];
        this._messagesPermissions = [];
    }

    _verifyConnection(info) {
        if (this.clientAmount >= this._MAXPLAYERS) {
            return false;
        }

        return this._ipController.checkIP(info.req);
    }

    _verifyClientsActivity() {
        const now = TIMESTAMP();
        const clients = this._server.clients;

        clients.forEach((sock) => {
            if (!sock.isAlive || now - sock.lastActive >= this._DISCONNECTION_TIMEOUT) {
                sock.terminate();
                return;
            }

            sock.isAlive = true;
            sock.ping('', false);
        });
    }

    _initPlayer(socket, req) {
        const id = this._findID();
        const handleMessage = (msg) => this._handleInboundMessage(id, msg);
        const handleError = (err) => this._handleSocketError(err, socket);
        const handlePong = () => this._handleSocketPong(id);
        
        this._messagesPermissions[id] = false;
        this._ipController.registerIP(req);
        this._sockets[id] = socket;

        socket.isAlive = true;
        socket.lastActive = TIMESTAMP();

        if (this._packetThrottler.enabled) {
            socket.packetsAllowed = this._packetThrottler.rate;
        }

        socket = stabilize(socket);
        
        socket.on('message', handleMessage);
        socket.on('error', handleError);
        socket.on('pong', handlePong);
        socket.once('close', () => {
            socket.removeListener('message', handleMessage);
            socket.removeListener('error', handleError);
            socket.removeListener('pong', handlePong);
            
            this._removePlayer(id, req);
        });

        this._eventEmitter.emit('connection', id);

        logger.debug(`Client ${id} was connected`);
    }

    _removePlayer(id, req) {
        this._messagesPermissions[id] = false;
        this._sockets[id] = NULL;
        this._ipController.unregisterIP(req);
        
        this._eventEmitter.emit('disconnection', id);

        logger.debug(`Client ${id} was disconnected`);
    }

    _handleInboundMessage(id, msg) {
        if (this._messagesPermissions[id]) {
            const packet = PacketManager.parse(msg);

            if (packet) {
                if (this._packetThrottler.enabled) {
                    if(PacketManager.isPacketThrottled(packet)) {
                        if (!this._checkIfPacketAllowed(id)) {
                            return;
                        }
                    }
                }
                
                this._sockets[id].lastActive = TIMESTAMP();
                this._eventEmitter.emit('clientMessage', id, packet);
            } else {
                logger.verbose(`Invalid packet from client ${id}, kicking`);

                this.kickPlayer(id);
            }
        }
    }

    _checkIfPacketAllowed(id) {
        var socket = this._sockets[id];
        var allowance = socket.packetsAllowed;

        const now = TIMESTAMP();
        const rate = this._packetThrottler.rate;
        const per = this._packetThrottler.per;

        allowance += (now - socket.lastActive)*(rate/per);
        
        if (allowance > rate) {
            allowance = rate;
        }
    
        socket.packetsAllowed = allowance;
        socket.lastActive = now;
    
        if (socket.packetsAllowed < 1) {
            return false;
        }
    
        socket.packetsAllowed -= 1;
    
        return true;
    }

    _handleSocketPong(id) {
        this._sockets[id].isAlive = true;
    }

    _handleServerError(err) {
        logger.error(err);
    }

    _handleSocketError(err, socket) {
        if (err) {
            socket.terminate();

            logger.debug('Websocket was disconnected due an error:', err);
        }
    }

    _findID() {
        for (var i = 0, l = this._sockets.length; i < l; i++) {
            if (this._sockets[i] == NULL) {
                return i;
            }
        }

        return i;
    }

    kickPlayer(id) {
        this._sockets[id].terminate();

        logger.debug(`Kicking client ${id}`);
    }

    setPermission(id, msgAllowed) {
        this._messagesPermissions[id] = !!msgAllowed;
    }

    subscribeOnEvent(eventName, handler) {
        this._eventEmitter.on(eventName, handler);
    }

    send(clientId, packet) {
        var socket = this._sockets[clientId];

        packet = PacketManager.encode(packet);
        socket.send(packet, (err) => this._handleSocketError(err, socket));
    }

    get clientAmount() {
        return this._server.clients.size;
    }

    stop() {
        this._cleanDeadClientsLoop.stop();
        this._server.close();

        logger.verbose('Server stopped');
    }
}

module.exports = Server;