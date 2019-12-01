var colors = {
	1:"RED",
	2:"PURPLE",
	3:"GREEN"
};

var shapes = {
	1:"DIAMOND",
	2:"SQUIGLY",
	3:"OVAL"
};

var shadings = {
	1:"EMPTY",
	2:"LINES",
	3:"FULL"
};


class Card {

	constructor(shape, number, color, shading) {
		this.shape = shape;
		this.number = number;
		this.color = color;
		this.shading = shading;
	}

	serializeCard() {
		return this.shape + "" + this.number + "" + this.color + "" + this.shading;
	}

	printCard() {
		console.log("{");
		console.log(colors[this.color]);
		console.log(shapes[this.shape]);
		console.log(shadings[this.shading]);
		console.log(this.number);
		console.log("},");
		console.log();
	}

};

class Deck {

	constructor() {
		this.cards = this.initCards();
	}

	initCards() {
		var cards = [];
		
		for (var i = 1; i < 4; i++) {
			for (var j = 1; j < 4;j++) {
				for (var k = 1; k < 4; k++) {
					for (var l = 1; l < 4; l++) {
						cards.push(new Card(i, j, k, l));
					}
				}
			}
		}

		this.shuffle(cards);
		return cards;
	}

	shuffle(cards) {
		for (var i = 0; i < cards.length; i++) {
			var randomIndex = Math.floor(Math.random() * (cards.length - i)) + i;
			var temp = cards[i];
			cards[i] = cards[randomIndex];
			cards[randomIndex] = temp;
		}
	}

	drawCard() {
		return this.cards.pop();
	}

	isEmpty() {
		return this.cards.length === 0;
	}

	printDeck() {
		for (var i = 0; i < this.cards.length; i++) {
			(this.cards[i].printCard());
		}
	}


};

class Board {

	constructor(deck) {
		this.deck = deck;
		this.board = [];

		for (var i = 0; i < 12; i++) {
				this.board[i] = deck.drawCard();
		}

		if (!this.doesSetExist()) {
			this.add3Cards();
		}
	} 

	serializeBoard() {
		var serializedBoard = [];
		for (var i = 0; i < this.board.length; i++) {
				serializedBoard.push(this.board[i].serializeCard());
				console.log(i);
		}
		return serializedBoard;
	}

	takeSet(pos1, pos2, pos3) {
		var card1 = this.board[pos1];
		var card2 = this.board[pos2];
		var card3 = this.board[pos3];

		var newCards = {};

		if (SetGame.isSet(card1, card2, card3)) {
			if (this.board.length == 15 || this.deck.isEmpty()) {
				this.board.splice(pos1, 1);
				this.board.splice(pos2, 1);
				this.board.splice(pos3, 1);
				console.log(this.board.length);

			}
			else if (this.board.length == 12) {
				this.board[pos1] = this.deck.drawCard();
				this.board[pos2] = this.deck.drawCard();
				this.board[pos3] = this.deck.drawCard();
				newCards[pos1] = this.board[pos1].serializeCard();
				newCards[pos2] = this.board[pos2].serializeCard();
				newCards[pos3] = this.board[pos3].serializeCard();
			}
			

			if (!this.doesSetExist() && !this.deck.isEmpty()) {
					this.add3Cards();
			}

			// if (this.board.length == 12) {
			// 	return newCards;
			// }
			//TODO: RETURN DELTA IF NECESSARY
			return this.serializeBoard();

		}
		else {
			return false;
		}
	}

	printBoard() {
		for (var i = 0; i < 4; i++) {
			console.log("{");
			for (var j = 0; j < 3; j++) {
				this.board[i][j].printCard();
			}
			console.log("}");
			console.log();
		}
	}

	doesSetExist() {
		for (var i = 0; i < this.board.length - 2 ; i++) {
			for (var j = i+1; j < this.board.length - 1; j++) {
				for (var k = j+1; k < this.board.length; k++) {
					if (SetGame.isSet(this.board[i], this.board[j], this.board[k])) {
						return true;
					}
				}
			}
		}

		return false;
	}

	add3Cards() {
		var extraCards = [];
		extraCards.push(this.deck.drawCard());
		extraCards.push(this.deck.drawCard());
		extraCards.push(this.deck.drawCard());
		this.board.push(...extraCards);
		return extraCards;
	}
};

class Player {
	constructor(id, board) {
		this.id = id
		this.score = 0;
		this.board = board;
	}

	addScore(scoreIncrement) {
		this.score += scoreIncrement;
	}

	takeSet(pos1, pos2, pos3) {
		var newCards = this.board.takeSet(pos1, pos2, pos3);

		if (newCards) {
			this.addScore(1);
		}

		return newCards;
	}
}

class SetGame {
	constructor() {
		this.players = [];
		this.board = new Board(new Deck());
	}

	addNewPlayer() {
		var numPlayers = this.players.length;
		this.players.push(new Player(numPlayers+1, this.board));
		return numPlayers+1;
	}

	getPlayer(player) {
		return this.players[player-1];
	}

	static isSet(card1, card2, card3) {
		var sameColor = card1.color == card2.color && card2.color == card3.color;
		var diffColor = card1.color != card2.color && card2.color != card3.color && card1.color != card3.color;
		if (!sameColor && !diffColor) return false;

		var sameShape = card1.shape == card2.shape && card2.shape == card3.shape;
		var diffShape = card1.shape != card2.shape && card2.shape != card3.shape && card1.shape != card3.shape;
		if (!sameShape && !diffShape) return false;

		var sameShading = card1.shading == card2.shading && card2.shading == card3.shading;
		var diffShading = card1.shading != card2.shading && card2.shading != card3.shading && card1.shading != card3.shading;
		if (!sameShading && !diffShading) return false;

		var sameNumber = card1.number == card2.number && card2.number == card3.number;
		var diffNumber = card1.number != card2.number && card2.number != card3.number && card1.number != card3.number;
		if (!sameNumber && !diffNumber) return false;

		return true;
	}
};

module.exports = SetGame;

