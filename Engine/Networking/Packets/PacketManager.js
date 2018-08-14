const PACKETS 		= require('./index.js');
const BufferReader 	= require('./BufferReader.js');
const logger 		= require('../../Utilities/Logging.js').getLogger(__filename);
const NULL 			= require('../../Utilities/Constants.js').NULL;

var validPackets = {
	1: "C00",
	2: "C01",
	3: "C02"
};

var throttledPackets = {
	2: "C01",
	3: "C02"
};

var MAX_PACKET_LENGTH = 9;

const getPacketLength = function(pkt) {
	return pkt.byteLength;
};

const parse = function(pkt) {
	const reader = new BufferReader(pkt);
	const length = getPacketLength(pkt);

	if (length > MAX_PACKET_LENGTH) {
		logger.warn(`Invalid packet with abnormal length ${length} detected`);
		return false;
	}

	const opcode = reader.readU8();

	if (validPackets.hasOwnProperty(opcode)) {
		let packet = getPacket(validPackets[opcode]);
		packet.readFrom(reader);

		return packet;
	}

	logger.warn(`Invalid packet with opcode ${opcode} detected`);
	return false;
};

const isPacketThrottled = function(pkt) {
	return throttledPackets.hasOwnProperty(pkt.pid);
};

const getPacket = function(name) {
    if (PACKETS.hasOwnProperty(name)) {
        const PacketClass = PACKETS[name];

        return PacketClass.create();
	}
	
	logger.warn(`Attempt to get non-existing packet by name ${name} detected`);
    return NULL;
};

module.exports.parse = parse;
module.exports.isPacketThrottled = isPacketThrottled;
module.exports.getPacket = getPacket;

module.exports.encode = function(packet) {
	return packet.encode();
};

module.exports.setValidPackets = function(packets) {
	validPackets = packets;

	logger.info('Valid packets rules were set up');
};

module.exports.setThrottledPackets = function(packets) {
	throttledPackets = packets;

	logger.info('Throttling packets rules were set up');
};

module.exports.setMaxPacketLength = function(num) {
	MAX_PACKET_LENGTH = num;

	logger.info(`Maximal allowed packet byte length was set up to ${MAX_PACKET_LENGTH}`);
};