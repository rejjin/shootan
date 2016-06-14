"use strict";

var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'build')));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

server.listen(port, ip, function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});

var PLAYERS = [];

function getPlayerByID (id) {
    let idx = -1;
    PLAYERS.forEach(function(item, i, arr) {
        if (item.servID == id) idx = i;
    });
    return idx;
}

function deletePlayer(idx) {
    PLAYERS.remove(idx);
}

function checkDead(idx) {
    PLAYERS.forEach(function(item, i, arr) {
        if (item.hp <= 0) {
            io.sockets.json.send({event: 'is_dead', id: item.servID});
            let idx = getPlayerByID(item.servID);
            if (idx != -1) {
                deletePlayer(idx);
            }
        }
    });
}

function updatePlayer(data) {
    let idx = getPlayerByID(data.servID);
    if (idx != -1) {
        PLAYERS[idx].x = data.x;
        PLAYERS[idx].y = data.y;
        PLAYERS[idx].anim = data.anim;
        PLAYERS[idx].rotation = data.rotation;
        PLAYERS[idx].name = data.name;
        PLAYERS[idx].hp = data.hp;
        PLAYERS[idx].score = data.score;
    }
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

io.sockets.on('connection', function (socket) {
    var ID = (socket.id).toString().substr(0, 8);
    PLAYERS.push({x: 0, y: 0, anim: "idle", rotation: "0", servID: ID})
    
    socket.json.send({ 'event': 'you_connected', 'id': ID });   // YOU CONNECTED - FIRST INCOMING MESSAGE
    socket.broadcast.json.send({ 'event': 'other_connected', 'id': ID });  // SEND OTHER PLAYERS - OTHER PLAYER CONNECTED

    console.log("one connected id: " + ID );


    socket.on('message', function (msg) {
	    if (msg == "num_players") {
	        socket.json.send({ 'event': 'num_players', 'data': PLAYERS.length });
	    }

	    if (msg.event == "my_data") {
	    	socket.broadcast.json.send({'event': 'new_data', 'data': msg.data});
            updatePlayer(msg.data);
            // checkDead();
	    }

        if (msg.event == "get_data_of_all_players") {
            socket.json.send({ 'event': 'data_of_all_players', 'data': JSON.stringify(PLAYERS) })
        }

        if (msg.event == "decrease_hp") {
            io.sockets.json.send({event: 'down_hp', id: msg.id, sid: msg.sPlayer});
        }

        if (msg.event == "player_fire") {
            socket.broadcast.json.send({event: 'player_fire', id: msg.id, toX: msg.toX, toY: msg.toY});
        }

		if (msg.event == "i_killed") {
            socket.broadcast.json.send({event: 'player_killed', id: msg.id, sid: msg.sid});
            socket.broadcast.json.send({event: 'incr_score', id: msg.sid});
            
        }
  	});


  	//DISCONNECTED
    socket.on('disconnect', function () {
        let idx = getPlayerByID(ID);
    		if (idx != -1) {
            deletePlayer(idx);
        }
        console.log('user disconnected: ' + ID);
        io.sockets.json.send({ 'event': 'user_disconnect', 'id': ID });
    });

    setTimeout(function() { 
        socket.json.send({ 'event': 'data_of_all_players', 'data': JSON.stringify(PLAYERS) })
    }, 1000);
});