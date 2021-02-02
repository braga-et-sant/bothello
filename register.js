'use strict';

var arRegister = [];
module.exports.ClassReg = class Register {
    constructor(nick, pass) {
        this.nick = nick;
        this.pass = pass;
    }
}

module.exports.checkNick = function checkNick(newNick) {

    if (arRegister.length === 0) return true;

    for (let i = 0; i < arRegister.length; i++) {
        if (newNick === arRegister[i].nick) return false;
    }

    return true;
}

module.exports.ARegister = arRegister;