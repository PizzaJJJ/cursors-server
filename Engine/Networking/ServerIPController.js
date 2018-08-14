const GET_IP = function(req) {
    var ip = req.headers['x-forwarded-for'];
    
    if (typeof ip === "undefined") {
        ip = req.connection.remoteAddress;
    }

    return ip;
};

class IPController {
    constructor(maxClientsPerIp) {
        this._MAX_CURSORS_PER_IP = maxClientsPerIp;
        this._ipTable = {};
    }

    checkIP(req) {
        var ip = GET_IP(req);
    
        if (!this._ipTable.hasOwnProperty(ip)) {
            return true;
        }
    
        if (this._ipTable[ip] + 1 > this._MAX_CURSORS_PER_IP) {
            return false;
        }
    
        return true;
    }

    registerIP(req) {
        var ip = GET_IP(req);

        if (this._ipTable.hasOwnProperty(ip)) {
            this._ipTable[ip]++;
        } else {
            this._ipTable[ip] = 1;
        }
    }

    unregisterIP(req) {
        var ip = GET_IP(req);
    
        if (this._ipTable.hasOwnProperty(ip) && this._ipTable[ip] > 0) {
            this._ipTable[ip]--;
        }
    }
}

module.exports = IPController;