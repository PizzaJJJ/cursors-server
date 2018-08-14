/**
 * Returns current date/time timestamp as number.
 * @returns {number} Current date/time timestamp.
 */
const getTimestamp = Date.now;

const getTimestampISO = function(timeZone) {
    var date = new Date(Date.now() + timeZone*60*60*1000);

    date = String(date.toISOString());

    return date.replace('Z', ' ').replace('T', ' ');
};

const formatTimezone = function(timeZone) {
    var tz = 'UTC';

    if (timeZone > 0) {
        tz += '+';
    } else {
        tz += '-';
    }

    const timeZoneAbs = Math.abs(timeZone);

    if (timeZoneAbs < 10) {
        tz += '0'; 
    }

    const reminder = timeZone % 1;

    if (reminder != 0) {
        tz += Math.floor(timeZoneAbs) + ':' + (reminder*60).toFixed(0);
    } else {
        tz += timeZoneAbs + ':00';
    }

    return tz;
};

module.exports.getTimestamp     = getTimestamp;
module.exports.getTimestampISO  = getTimestampISO;
module.exports.formatTimezone   = formatTimezone;