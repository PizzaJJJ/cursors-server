/**
 * Returns current date/time timestamp as number.
 * @returns {number} Current date/time timestamp.
 */
const GET_TIMESTAMP = require('./Time.js').getTimestamp;

/**
 * Minimal remaining time until next tick, when setTimeout would be used.
 */
const TIMEOUT_CUTOFF = 10;

/**
 * Constructs a new GameLoop instance.
 *
 * GameLoop is a class intended to construct game loops with user-specified tick value and callback function.
 * To keep a real tick interval as stably close to the specified one as possible and minimify the CPU usage,
 * both setImmediate and setTimout are used.
 */
class GameLoop {
    /**
     * @param {function(number, number)} tickCallback A callback function which receives two timestamps as parameters:
     *
     * 1) one of a current call;
     *
     * 2) one of a next planned loop tick.
     *
     * @param {number} tickInterval Loop tick interval in ms.
     */
    constructor(tickCallback, tickInterval) {
        /**
         * GameLoop tick interval in ms.
         * @private
         */
        this._tickInterval = tickInterval;

        /**
         * The id of the GameLoop. Used to provide an ability to stop the loop.
         * @private
         */
        this._loopId = null;

        /** 
         * A flag to indicate which way of iteration was used last.
         * @private
        */
        this._immediateUsed = true;

        /**
         * User-defined callback function.
         * @private
         */
        this._tickCallback = tickCallback;
    }

    /**
     * Starts the loop.
     */
    start() {
        /**
         * The timestamp of next loop tick.
         */
        var nextTickAt = GET_TIMESTAMP();

        /**
         * The loop function itself.
         */
        const loop = () => {
            // Getting the current time.
            const now = GET_TIMESTAMP();
            var needCall = false;

            // Recalculating the time of next tick if it is time to tick now.
            if (now >= nextTickAt) {
                nextTickAt += this._tickInterval;
                needCall = true;

                // Preventing a series of too fast ticks if there was a delay in previous tick.
                if (now >= nextTickAt) {
                    nextTickAt = now + this._tickInterval;
                }
            }

            // Getting time left to next tick.
            const timeToNextTick = nextTickAt - now;

            // Setting up timers.
            if (timeToNextTick > TIMEOUT_CUTOFF) {
                this._loopId = setTimeout(loop, timeToNextTick);
                this._immediateUsed = false;
            } else {
                this._loopId = setImmediate(loop);
                this._immediateUsed = true;
            }

            // If it is time to tick now, invoke the callback.
            if (needCall) {
                this._tickCallback(now, nextTickAt);
            }
        };

        // Saving the id of the loop.
        this._loopId = setImmediate(loop);
        this._immediateUsed = true;
    }

    /**
     * Stops the loop.
     */
    stop() {
        if (this._immediateUsed) {
            clearImmediate(this._loopId);
        } else {
            clearTimeout(this._loopId);
        }
    }
}

module.exports = GameLoop;