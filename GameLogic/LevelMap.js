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
        this._maxWidth = this._shrinkCoord(w);
        this._maxHeight = this._shrinkCoord(h);

        this._grid = [];

        var i, l = this._maxWidth * this._maxHeight,
            item = new GridItem();

        for (i = 0; i < l; i++) {
            this._grid[i] = item;
        }
    }

    _isInside(shrinkedX, shrinkedY) {
        return shrinkedX >= 0 && shrinkedX < this._maxWidth &&
               shrinkedY >= 0 && shrinkedY < this._maxHeight;
    }

    _getPlayersAt(x, y) {
        x = this._shrinkCoord(x);
        y = this._shrinkCoord(y);

        if (!this._isInside(x, y)) {
            return NULL;
        }

        return this._grid[x + this._maxWidth * y].players;
    }

    _shrinkCoord(x) {
        return Math.floor(x/this._step);
    }

    isInside(x, y) {
        x = this._shrinkCoord(x);
        y = this._shrinkCoord(y);

        return this._isInside(x, y);
    }

    writeObject(obj) {
        const objX = this._shrinkCoord(obj.x),
              objY = this._shrinkCoord(obj.y),
              objW = this._shrinkCoord(obj.x + obj.width),
              objH = this._shrinkCoord(obj.y + obj.height);

        const item = new GridItem();
        item.objects.push(obj);

        const objectsAddingMap = new Map();

        var i, j;
        for (j = objY; j < objH; j++) {
            for (i = objX; i < objW; i++) {
                if (this._isInside(i, j)) {
                    let cell = this._grid[i + this._maxWidth * j];

                    if (cell.objects.length > 0) {

                        if (objectsAddingMap.has(cell.objects)) {
                            this._grid[i + this._maxWidth * j] = objectsAddingMap.get(cell.objects);
                        } else {
                            let newItem = new GridItem();
                    
                            Array.prototype.push.apply(newItem.objects, cell.objects);
                            newItem.objects.push(obj);
                            objectsAddingMap.set(cell.objects, newItem);

                            this._grid[i + this._maxWidth * j] = newItem;
                        }

                    } else {
                        this._grid[i + this._maxWidth * j] = item;
                    }
                }
            }
        }
    }

    isWalkableAt(x, y) {
        x = this._shrinkCoord(x);
        y = this._shrinkCoord(y);

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
        x = this._shrinkCoord(x);
        y = this._shrinkCoord(y);

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

    isDifferentCells(x0, y0, x1, y1) {
        x0 = this._shrinkCoord(x0);
        y0 = this._shrinkCoord(y0);
        x1 = this._shrinkCoord(x1);
        y1 = this._shrinkCoord(y1);

        if (!this._isInside(x0, y0) || !this._isInside(x1, y1)) {
            return false;
        }

        return this._grid[x0 + this._maxWidth * y0] != this._grid[x1 + this._maxWidth * y1];
    }

    getPlayersInArea(x, y, w, h) {
        const shX = this._shrinkCoord(x),
              shY = this._shrinkCoord(y),
              shW = this._shrinkCoord(x + w),
              shH = this._shrinkCoord(y + h);

        var i, j, arr = [];

        const visitedSet = new WeakSet();

        for (j = shY; j < shH; j++) {
            for (i = shX; i < shW; i++) {
                let coord = i + this._maxWidth * j;
                
                if (!this._isInside(i, j) || visitedSet.has(this._grid[coord])) {
                    continue;
                }

                let players = this._grid[coord].players;

                if (players.size != 0) {
                    Array.prototype.push.apply(arr, Array.from(players));
                }

                visitedSet.add(this._grid[coord]);
            }
        }  
        
        return arr;
    }

    getPlayerAmountInArea(x, y, w, h) {
        const shX = this._shrinkCoord(x),
              shY = this._shrinkCoord(y),
              shW = this._shrinkCoord(x + w),
              shH = this._shrinkCoord(y + h);

        var i, j, res = 0;

        const visitedSet = new WeakSet();

        for (j = shY; j < shH; j++) {
            for (i = shX; i < shW; i++) {
                let coord = i + this._maxWidth * j;

                if (!this._isInside(i, j) || visitedSet.has(this._grid[coord])) {
                    continue;
                }

                res += this._grid[coord].players.size;

                visitedSet.add(this._grid[coord]);
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
        if (this._shrinkCoord(x0) == this._shrinkCoord(x1) && 
            this._shrinkCoord(y0) == this._shrinkCoord(y1)) {
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