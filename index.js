'use strict';

const http = require('http');
const url = require('url');
const conf = require('./conf.js');
const regi = require('./register.js');
const rank = require('./ranking.js');
const joing = require('./join.js');

var lRank = rank.ArrRanking;

lRank.sort(function (a, b) {
    return b.victories - a.victories;
});


const server = http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url, true);
    const query = parsedUrl.query;

    var clientmsg;
    var msg = "";
    var error;
    var body = '';
    var nick;
    var pass;
    var group;
    var roomselect;
    var fEntrou;

    var register = regi.ARegister;

    var rooms = joing.ARooms;

    switch (request.method) {
        case 'POST':
            request
                .on('data', (chunk) => { body += chunk; })
                .on('end', () => {

                    try {
                        clientmsg = JSON.parse(body);

                        switch (parsedUrl.pathname) {

                            case '/register':
                                error = { "error": "User registered with a different password" };
                                nick = clientmsg.nick;
                                pass = clientmsg.pass;

                                console.log("Nick: " + nick);
                                console.log("Pass: " + pass);

                                const newReg = new regi.ClassReg(nick, pass);

                                if (regi.checkNick(nick)) {
                                    register.push(newReg);
                                    msg = 'Registration completed successfully - Nick: \"' + nick + "\" Pass: \"" + pass + "\"";
                                    response.writeHead(200, conf.headers.txt);
                                }
                                else {
                                    response.writeHead(401, conf.headers.txt);
                                    msg = JSON.stringify(error);

                                }

                                console.log(register);
                                break;

                            case '/ranking':

                                response.writeHead(200, conf.headers.json);
                                msg = JSON.stringify({ rank: rank });

                                break;

                            case '/join':
                                fEntrou = 0;

                                nick = clientmsg.nick;
                                pass = clientmsg.pass;
                                group = clientmsg.group;

                                var openRoom = joing.checkOpenR();

                                if (openRoom != -1) {
                                    fEntrou = 1;
                                    rooms[openRoom].players++;
                                    roomselect = rooms[openRoom];
                                    //console.log(openRoom);


                                    const newPlayer = new joing.ClassPlayer(roomselect);


                                    msg = "Game: \"" + newPlayer.game + "\" color: \"" + newPlayer.color + "\"";

                                    response.writeHead(200, conf.headers.txt);

                                    msg = JSON.stringify({ game: newPlayer.game, color: newPlayer.color });

                                }
                                else {
                                    fEntrou = 1;

                                    const newRoom = new joing.ClassRoom();

                                    const newPlayer = new joing.ClassPlayer(newRoom);

                                    rooms.push(newRoom);

                                    msg = "Game: \"" + newPlayer.game + "\" color: \"" + newPlayer.color + "\"";

                                    response.writeHead(200, conf.headers.txt);

                                    msg = JSON.stringify({ game: newPlayer.game, color: newPlayer.color });

                                }

                                if (fEntrou === 0) {
                                    response.writeHead(400, conf.headers.text);
                                }

                                console.log(register);

                                break;

                            default:
                                response.writeHead(404, conf.headers.txt);
                                msg = "command not defined";
                                break;
                        }

                        console.log(msg);
                        response.end(msg);
                    }
                    catch (err) { console.log(err); }
                })
                .on('error', (err) => { console.log(err.message); });

        case 'GET':
            break;

        default:
            break;
    }

});
server.listen(conf.port, () => {
    console.log("Server is running at port " + conf.port + "...")
});