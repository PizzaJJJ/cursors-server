const assert        = require('assert');
const Server        = require('../../Engine/Networking/Server.js');
const ServerOptions = require('../../Engine/Networking/ServerOptions.js');
const connectClient = require('../utilities/ConnectClient.js');

const test = describe('Clients connection check', function() {
    const CLIENTS = 100;

    const config = new ServerOptions({
        host: '127.0.0.1',
        port: 9075,
        maxPlayers: CLIENTS,
        maxClientsPerIp: CLIENTS
    });

    var serv;

    before(function() {
        serv = new Server(config);
    });

    after(function() {
        serv.stop();
    });

    it('all ' + CLIENTS + ' clients should be connected to server', function(done) {

        var pool = [];

        for (var i = 0; i < CLIENTS; i++) {
            pool.push(connectClient(config.host, config.port));
        }

        Promise.all(pool).then(() => {
            assert(serv.clientAmount == CLIENTS, 'Server.clientAmount = ' + serv.clientAmount + ' but should be ' + CLIENTS);

            done();
        });

    });
});

module.exports = test;