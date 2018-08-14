const assert        = require('assert');
const Server        = require('../../Engine/Networking/Server.js');
const ServerOptions = require('../../Engine/Networking/ServerOptions.js');
const connectClient = require('../utilities/ConnectClient.js');

const test = describe('Client message receive check', function() {
    const config = new ServerOptions({
        host: '127.0.0.1',
        port: 9075,
        maxPlayers: 100,
        maxClientsPerIp: 10
    });

    const OPCODE = 3;
    const X1 = 55;
    const Y1 = 66;
    const X2 = 77;
    const Y2 = 88;

    var serv;
    var clientId;

    var inboundPacket = new ArrayBuffer(9);
    var b = new DataView(inboundPacket);
        b.setUint8(0, OPCODE);
        b.setUint16(1, X1, !0);
        b.setUint16(3, Y1, !0);
        b.setUint16(5, X2, !0);
        b.setUint16(7, Y2, !0);

    before(function() {
        serv = new Server(config);

        serv.subscribeOnEvent('connection', (id) => {
            serv.setPermission(id, true);
            clientId = id;
        });
    });

    after(function() {
        serv.stop();
    });

    it('server should receive a message of a client', function(done) {
        
        serv.subscribeOnEvent('clientMessage', (id, packet) => {
            assert.equal(clientId, id, 'Wrong client id: received ' + id + ' but expected ' + clientId);
            assert.equal(packet.pid, OPCODE, 'Wrong opcode: received ' + packet.pid + ' but expected ' + OPCODE);
            assert.equal(packet.x1, X1, 'Wrong X1: received ' + packet.x1 + ' but expected ' + X1);
            assert.equal(packet.y1, Y1, 'Wrong Y1: received ' + packet.y1 + ' but expected ' + Y1);
            assert.equal(packet.x2, X2, 'Wrong X2: received ' + packet.x2 + ' but expected ' + X2);
            assert.equal(packet.y2, Y2, 'Wrong Y2: received ' + packet.y2 + ' but expected ' + Y2);

            done();
        });
        
        connectClient(config.host, config.port).then((socket) => {
            socket.send(inboundPacket);
        });
        
    });
});

module.exports = test;