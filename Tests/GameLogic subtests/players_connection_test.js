const assert        = require('assert');
const WebSocket     = require('ws');
const Engine        = require('../../Engine/Engine.js');
const levelManager  = require('../../GameLogic/LevelManager.js');
const BufferReader  = require('../../Engine/Networking/Packets/BufferReader.js');
const onconnect     = require('../../GameLogic/Server event handlers/OnPlayerConnect.js');

const test = describe('Ids giving check', function() {
    const CLIENTS = 10;

    const config = {
        server: {
            host: '127.0.0.1',
            port: 9075,
            maxPlayers: CLIENTS,
            maxClientsPerIp: CLIENTS
        }
    };

    var engine, oldEngine;

    before(function() {
        oldEngine = Engine.getEngine();

        engine = new Engine(config);
        engine.server.subscribeOnEvent('connection', onconnect);

        Engine.setEngine(engine);
    });

    after(function() {
        engine.stop();

        Engine.setEngine(oldEngine);
    });

    it('all ' + CLIENTS + ' clients should be connected to server and receive their unique ids', function(done) {

        var idsReceived = 0;
        var lastId = -1;

        const readMessage = function(buffer) {
            const reader = new BufferReader(buffer.data);
            var id;
            
            if (reader.readU8() == 0) {
                idsReceived++;
    
                id = reader.readU32();
    
                assert(id > lastId);
                lastId = id;
    
                if (idsReceived == CLIENTS) {
                    done();
                }
            }
        };

        for (var i = 0; i < CLIENTS; i++) {
            let socket = new WebSocket('ws://' + config.server.host + ':' + config.server.port);
            socket.onmessage = readMessage;
        }

    });
});

module.exports = test;