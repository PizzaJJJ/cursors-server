const assert = require('assert');
const Engine = require('../Engine/Engine.js');
const connectClient = require('./utilities/ConnectClient.js');

const test = describe('PlayerInboundDataController', function() {
    describe('Player messages receive check', function() {
        const config = {
            packets: {
                valid: {
                    3: "C02"
                }
            },
            server: {
                host: '127.0.0.1',
                port: 9075,
                maxPlayers: 100,
                maxClientsPerIp: 10
            },
            inputController: {
                enabled: true,
                tickInterval: 50
            }
        };
    
        const OPCODE = 3;
        const X1 = 55;
        const Y1 = 66;
        const X2 = 77;
        const Y2 = 88;
    
        const MESSAGES_TO_SEND = 500;

        var engine;

        var inboundPacket = new ArrayBuffer(9);
        var b = new DataView(inboundPacket);
            b.setUint8(0, OPCODE);
            b.setUint16(1, X1, !0);
            b.setUint16(3, Y1, !0);
            b.setUint16(5, X2, !0);
            b.setUint16(7, Y2, !0);
            
        var clientId;

        before(function() {
            engine = new Engine(config);
            engine.server.subscribeOnEvent('connection', (id) => {
                engine.server.setPermission(id, true);
                clientId = id;
            });
        });

        after(function() {
            engine.stop();
        });
    
        it('multiple messages should be received', function(done) {
    
            engine.inputController.subscribeOnEvent('playerMessage', (id, packet) => {
                assert.equal(clientId, id, 'Wrong client id: received ' + id + ' but expected ' + clientId);
                assert.equal(packet.pid, OPCODE, 'Wrong opcode: received ' + packet.pid + ' but expected ' + OPCODE);
                assert.equal(packet.x1, X1, 'Wrong X1: received ' + packet.x1 + ' but expected ' + X1);
                assert.equal(packet.y1, Y1, 'Wrong Y1: received ' + packet.y1 + ' but expected ' + Y1);
                assert.equal(packet.x2, X2, 'Wrong X2: received ' + packet.x2 + ' but expected ' + X2);
                assert.equal(packet.y2, Y2, 'Wrong Y2: received ' + packet.y2 + ' but expected ' + Y2);
            
                // next loop's iteration will not be invoked
                engine.inputController.stop();
            });
            
            connectClient(config.server.host, config.server.port).then((socket) => {
                for (var i = 0; i < MESSAGES_TO_SEND; i++) {
                    socket.send(inboundPacket);
                }
            });

            setTimeout(() => done(), 1000);
    
        });
    });
});

module.exports = test;