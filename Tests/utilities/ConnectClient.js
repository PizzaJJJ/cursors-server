const WebSocket = require('ws');

module.exports = function(host, port) {
    return new Promise((resolve) => {
        let socket = new WebSocket('ws://' + host + ':' + port);
        
        socket.onopen = () => setTimeout(() => resolve(socket), 50);
    });
};