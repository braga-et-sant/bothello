'use strict';

const crypto = require('crypto');

var x = (+new Date).toString(36);

var arRooms = [];

module.exports.ARooms = arRooms;

module.exports.ClassRoom = class room {
    constructor() {
        this.players = 1;
        this.gId = crypto.createHash('md5').update(x).digest('hex');
    }
}

module.exports.ClassPlayer = class player {
    constructor(room) {
        if (room.players === 1) {
            this.color = 'dark';
        }
        else this.color = 'light';

        this.game = room.gId;
    }
}

module.exports.checkOpenR = function checkOpenR() {

    if (arRooms.length === 0) return -1;

    for (let i = 0; i < arRooms.length; i++) {
        if (arRooms[i].players == 1) return i;
    }

    return -1;

}