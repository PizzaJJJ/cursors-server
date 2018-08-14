const LOCALHOST = require('./../Utilities/Constants.js').LOCALHOST;

class ServerOptions {
    constructor(config) {
        if (!config) {
            config = {};
        }

        this.host = config.host || LOCALHOST;
        this.port = config.port || 9004;
        this.maxPlayers = config.maxPlayers || 900;
        this.maxClientsPerIp = config.maxClientsPerIp || 900;
        this.disconnectionTimeout = config.disconnectionTimeout || 15 * 60 * 1000;
        this.clientVerificationInterval = config.clientVerificationInterval || 30 * 1000;

        if (config.hasOwnProperty('packetThrottler')) {
            this.packetThrottler = {
                enabled: config.packetThrottler.enabled || false,
                packetRate: config.packetThrottler.packetRate || 40,
                packetRatePer: config.packetThrottler.packetRate || 10,
            };
        } else {
            this.packetThrottler = {
                enabled: false,
                packetRate: 40,
                packetRatePer: 10,
            };
        }
    }

    static getDefault() {
        return new ServerOptions();
    }
}

module.exports = ServerOptions;