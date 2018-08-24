const objDispatcher = require('./Level objects/LevelObjectDispatcher.js');
const NULL          = require('../Engine/Engine.js').getConstants().NULL; 

function GridItem() {
    this.players = new Set();
    this.objects = [];
}

class LevelMap {
    constructor(gridStep, w, h) {
        this._realWidth = w;
        this._realHeight = h;

        this._step = gridStep;
        this._maxWidth = this.shrinkCoord(w);
        this._maxHeight = this.shrinkCoord(h);

        this._grid = [];

        var i, l = this._maxWidth * this._maxHeight;

        for (i = 0; i < l; i++) {
            this._grid[i] = new GridItem();
        }
    }

    _isInside(shrinkedX, shrinkedY) {
        return shrinkedX >= 0 && shrinkedX < this._maxWidth &&
               shrinkedY >= 0 && shrinkedY < this._maxHeight;
    }

    _getPlayersAt(x, y) {
        x = this.shrinkCoord(x);
        y = this.shrinkCoord(y);

        if (!this._isInside(x, y)) {
            return NULL;
        }

        return this._grid[x + this._maxWidth * y].players;
    }

    shrinkCoord(x) {
        return Math.floor(x/this._step);
    }

    isInside(x, y) {
        x = this.shrinkCoord(x);
        y = this.shrinkCoord(y);

        return this._isInside(x, y);
    }

    writeObject(obj) {
        const objX = this.shrinkCoord(obj.x),
              objY = this.shrinkCoord(obj.y),
              objW = this.shrinkCoord(obj.x + obj.width),
              objH = this.shrinkCoord(obj.y + obj.height);

        var i, j;
        for (j = objY; j < objH; j++) {
            for (i = objX; i < objW; i++) {
                if (this._isInside(i, j)) {
                    this._grid[i + this._maxWidth * j].objects.push(obj);
                }
            }
        }
    }

    isWalkableAt(x, y) {
        x = this.shrinkCoord(x);
        y = this.shrinkCoord(y);

        if (!this._isInside(x, y)) {
            return false;
        }

        const gridObjects = this._grid[x + this._maxWidth * y].objects;

        for (var i = 0, l = gridObjects.length; i < l; i++) {
            if (gridObjects[i].type == objDispatcher.TYPES.WALL && !gridObjects[i].hidden) {
                return false;
            }
        }

        return true;
    }

    findClosestWalkable(x, y) {
        var point = {
            x: x,
            y: y
        };

		var offsetx = 0;
        var offsety = 0;
        var precOffset = 0;

        var offsetDir1 = 0;
        var offsetDir2 = 0;
        var toBreak = false;
        
		for (var i = 0; i < this._realWidth; i += this._step) {
            if (this.isWalkableAt(x - i, y)) {
                offsetDir1 = this._step - i;
                toBreak = true;
            }

            if (this.isWalkableAt(x + i, y)) {
                offsetDir2 = i - this._step;
                toBreak = true;
            }

            if (toBreak) {
                if (Math.abs(offsetDir1) < Math.abs(offsetDir2)) {
                    offsetx = offsetDir1;
                } else {
                    offsetx = offsetDir2;
                }

                break;
            }
        }

        if (toBreak) {
            precOffset = 0;

            for (i = 0; i < this._realWidth; i++) {
                if (this.isWalkableAt(x + offsetx - i, y)) precOffset = -i;
                if (this.isWalkableAt(x + offsetx + i, y)) precOffset = i;
                if (precOffset != 0) break;
            }

            offsetx += precOffset;
        }

        offsetDir1 = 0;
        offsetDir2 = 0;
        toBreak = false;
        
		for (i = 0; i < this._realHeight; i += this._step) {
            if (this.isWalkableAt(x, y - i)) {
                offsetDir1 = this._step - i;
                toBreak = true;
            }

            if (this.isWalkableAt(x, y + i)) {
                offsetDir2 = i - this._step;
                toBreak = true;
            }

            if (toBreak) {
                if (Math.abs(offsetDir1) < Math.abs(offsetDir2)) {
                    offsety = offsetDir1;
                } else {
                    offsety = offsetDir2;
                }

                break;
            }
        }

        if (toBreak) {
            precOffset = 0;

            for (i = 0; i < this._realHeight; i++) {
                if (this.isWalkableAt(x, y + offsety - i)) precOffset = -i;
                if (this.isWalkableAt(x, y + offsety + i)) precOffset = i;
                if (precOffset != 0) break;
            }

            offsety += precOffset;
        }

		if ((offsetx == 0 && offsety != 0) || (offsetx != 0 && offsety == 0)) {
			if (offsetx == 0) {
				point.y += offsety;
			} else {
				point.x += offsetx;
            }
            
			return point;
        } 
        
		if (offsetx != 0 && offsety != 0) {
			if (Math.abs(offsetx) < Math.abs(offsety)) {
				point.x += offsetx;
			} else {
				point.y += offsety;
            }
            
			return point;
        }
        
        return NULL;
    }

    getObjectsAt(x, y) {
        x = this.shrinkCoord(x);
        y = this.shrinkCoord(y);

        if (!this._isInside(x, y)) {
            return NULL;
        }

        return this._grid[x + this._maxWidth * y].objects;
    }

    getTypedObjectsAt(x, y, type) {
        const gridObjects = this.getObjectsAt(x, y);
        var arr = [], i, l;

        if (!gridObjects) {
            return arr;
        }

        for (i = 0, l = gridObjects.length; i < l; i++) {
            if (gridObjects[i].type == type && !gridObjects[i].hidden) {
                arr.push(gridObjects[i]);
            }
        }

        return arr;
    }

    getPlayersInArea(x, y, w, h) {
        const shX = this.shrinkCoord(x),
              shY = this.shrinkCoord(y),
              shW = this.shrinkCoord(x + w),
              shH = this.shrinkCoord(y + h);

        var i, j, arr = [];

        for (j = shY; j < shH; j++) {
            for (i = shX; i < shW; i++) {
                if (!this._isInside(i, j)) {
                    continue;
                }

                let players = this._grid[i + this._maxWidth * j].players;

                if (players.size != 0) {
                    Array.prototype.push.apply(arr, Array.from(players));
                }
            }
        }  
        
        return arr;
    }

    getPlayerAmountInArea(x, y, w, h) {
        const shX = this.shrinkCoord(x),
              shY = this.shrinkCoord(y),
              shW = this.shrinkCoord(x + w),
              shH = this.shrinkCoord(y + h);

        var i, j, res = 0;

        for (j = shY; j < shH; j++) {
            for (i = shX; i < shW; i++) {
                if (!this._isInside(i, j)) {
                    continue;
                }

                res += this._grid[i + this._maxWidth * j].players.size;
            }
        }  
        
        return res;
    }

    addPlayer(player) {
        const gridPlayers = this._getPlayersAt(player.x, player.y);

        if (gridPlayers) {
            gridPlayers.add(player.id);
        }
    }

    removePlayer(player) {
        const gridPlayers = this._getPlayersAt(player.x, player.y);

        if (gridPlayers) {
            gridPlayers.delete(player.id);
        }
    }

    walkStraight(x0, y0, x1, y1) {
        if (this.shrinkCoord(x0) == this.shrinkCoord(x1) && 
            this.shrinkCoord(y0) == this.shrinkCoord(y1)) {
            return {
                x: x1,
                y: y1
            };
        }

        var a = x0;
        var b = y0;
        var c = x1;
        var d = y1;

        if (!this.isWalkableAt(a, b)) {
            return {
                x: x0,
                y: y0
            };
        }

        var g = a, e = b;

        c = c - a | 0;
        d = d - b | 0;

        var n = 0, l = 0, p = 0, k = 0;

        0 > c ? n = -1 : 0 < c && (n = 1);
        0 > d ? l = -1 : 0 < d && (l = 1);
        0 > c ? p = -1 : 0 < c && (p = 1);

        var m = Math.abs(c) | 0, h = Math.abs(d) | 0;

        m <= h && (m = Math.abs(d) | 0, h = Math.abs(c) | 0, 0 > d ? k = -1 : 0 < d && (k = 1), p = 0);
        c = m >> 1;

        for (d = 0; d <= m && this.isWalkableAt(a, b); d++) {
            g = a, e = b, c += h, c >= m ? (c -= m, a += n, b += l) : (a += p, b += k);
        }

        return {
            x: g,
            y: e
        };
    }
}

module.exports = LevelMap;