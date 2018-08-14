const assert        = require('assert');
const Server        = require('../../Engine/Networking/Server.js');
const ServerOptions = require('../../Engine/Networking/ServerOptions.js');
const connectClient = require('../utilities/ConnectClient.js');
const sleep         = require('../utilities/Sleep.js');

const test = describe('Inactive clients disconnection check', function() {
    const CLIENTS = 5;
    const SLEEP = 500;

    const config = new ServerOptions({
        host: '127.0.0.1',
        port: 9075,
        maxPlayers: 100,
        maxClientsPerIp: 10,
        disconnectionTimeout: Math.round(SLEEP / 2),
        clientVerificationInterval: Math.round(SLEEP / 10)
    });

    var serv;

    before(function() {
        serv = new Server(config);
    });

    after(function() {
        serv.stop();
    });

    it('all ' + CLIENTS + ' clients should be disconnected after ' + config.disconnectionTimeout + ' ms of inactivity', 
    function(done) {

        var pool = [];

        for (var i = 0; i < CLIENTS; i++) {
            pool.push(connectClient(config.host, config.port));
        }

        Promise.all(pool).then(() => {
            return sleep(SLEEP);
        }).then(() => {
            assert(serv.clientAmount == 0, 'Server.clientAmount = ' + serv.clientAmount + ' but should be zero');

            done();
        });

    });
});

module.exports = test;