const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const SetGame = require('./Set.js');
const ejs = require('ejs');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var lastRoom = 0;
var games = {};

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/game', function(req, res) {
	var roomNumber = ++lastRoom;
	games[roomNumber] = new SetGame();
	res.render('game', {roomNumber: roomNumber});
});

app.post('/game', function(req, res) {
	var roomNumber = req.body.roomNumber;
	req.session.roomNumber = roomNumber;
	res.render('game', {roomNumber: roomNumber});
});

io.on('connection', function (socket) {
	var game = null;
	var room = null;

	socket.on('init', function (roomNumber) {
		room = roomNumber;	
		socket.join(room); 
		game = games[roomNumber];
		var initial_setup = getSetupData(game);
		socket.emit('init', initial_setup);
		console.log ("Send init message");
		socket.to(room).emit("newPlayer", initial_setup['player']);
	});

	socket.on('takeSet', function(setData) {
		var player = setData['player'];
		var selectedCards = setData['selectedCards'];
		console.log(selectedCards);
		player = game.getPlayer(player);
		var newBoard = player.takeSet(selectedCards[0], selectedCards[1], selectedCards[2]);
		if (newBoard) {
			var newState = {
				'player': player.id,
				'score': player.score,
				'newBoard': newBoard
			};
			console.log(newState);
			io.in(room).emit('update', newState);
		}
		else {
			socket.emit('failedSet');
		}
	});

});

var getSetupData = function(game) {
	var initial_setup = {
		'player': null,
		'board': null,
		'scores': {},	
	};

	initial_setup['player'] = game.addNewPlayer();
	var scores = initial_setup['scores'];
	for (var i = 0; i < game.players.length; i++) {
		var player = game.players[i];
		scores[player.id] = player.score;
	}
	initial_setup['board'] = game.board.serializeBoard();
	return initial_setup;
}


server.listen(port, () => console.log(`The app is listening on port ${port}`));