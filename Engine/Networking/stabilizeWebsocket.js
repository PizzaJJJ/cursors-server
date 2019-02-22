const WebSocket = require('ws');

/**
 * Improves socket's reliability. 
 * 
 * Adds decorative checks of the socket's state before closing, terminating, 
 * sending and pinging to avoid uncaught exceptions. If the state is 
 * inappropriate, connection gets terminated automatically.
 * 
 * @param {WebSocket} socket 
 * 
 * @returns {WebSocket}
 */
module.exports = function(socket) {
    if (socket.stabilized) {
        return;
    }

    const closeOld = socket.close.bind(socket);
    socket.close = function(...args) {
        var state = socket.readyState;

        if (state == WebSocket.OPEN || state == WebSocket.CONNECTING) {
            closeOld(...args);
        }
    };

    const terminateOld = socket.terminate.bind(socket);
    socket.terminate = function(...args) {
        var state = socket.readyState;

        if (state == WebSocket.OPEN || state == WebSocket.CONNECTING) {
            terminateOld(...args);
        }
    };

    const sendOld = socket.send.bind(socket);
    socket.send = function(...args) {
        var state = socket.readyState;

        if (state == WebSocket.OPEN) {
            sendOld(...args);
        } else {
            socket.terminate();
        }
    };

    const pingOld = socket.ping.bind(socket);
    socket.ping = function(...args) {
        var state = socket.readyState;

        if (state == WebSocket.OPEN) {
            pingOld(...args);
        } else {
            socket.terminate();
        }
    };

    socket.stabilized = true;

    return socket;
};