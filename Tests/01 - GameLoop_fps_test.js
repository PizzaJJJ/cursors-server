const assert = require('assert');
const Loop = require('../Engine/Utilities/GameLoop.js');
const TIMESTAMP = require('../Engine/Utilities/Time.js').getTimestamp;

describe('GameLoop', function() {
    describe('FPS measurement', function() {
        const TARGET_FPS = 20;
        const ERR = 0.01;
        const LOW_FPS = (1 - ERR)*TARGET_FPS;
        const HIGH_FPS = (1 + ERR)*TARGET_FPS;
        const TIMEOUT = 1000;

        it('Loop should provide fps not deviating from ' + TARGET_FPS + ' for more than ' + ERR*100 + '%', function(done) {
            
            const playload = function(expireTime) {
                for (var i = 0, j = 0; i < 100000000; i++) {
                    j += i;
        
                    if (TIMESTAMP() >= expireTime) {
                        return;
                    }
                }
            };

            var lastCallTime = 0;
            var fps = 0;

            const loop = new Loop((callTime, expireTime) => {
                fps = 1000/(callTime - lastCallTime);
                lastCallTime = callTime;
            
                playload(expireTime);
            }, Math.floor(1000/TARGET_FPS));
    
            loop.start();
    
            setTimeout(() => {
                loop.stop();

                const res = fps >= LOW_FPS && 
                            fps <= HIGH_FPS;

                assert(res, 'FPS ' + fps + ' does not fit limits from ' + LOW_FPS + ' to ' + HIGH_FPS);
                done();
            }, TIMEOUT);
    
        });
    });
});