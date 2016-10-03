var Board = function () {
    this.wins = [
        //-------- vertical
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        //-------- horizontal
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        //-------- diagonal
        [0, 4, 8],
        [2, 4, 6]
    ];
    this.state = [
        0,0,0,
        0,0,0,
        0,0,0
    ];
};

Board.prototype = {

    // create new copy of board including current state
    copy: function () {
        let temp = new Board();
        temp.state = this.state.slice();
        return temp;
    },
    
    // place player number at index in state
    mark: function (idx, player) { this.state[idx] = player; },
    
    // neutralize variable at index in state
    undo: function (idx) { this.state[idx] = 0; },
    
    // filter unused values from array
	nonNull: function (val) { return val !== null; },
	
    // map index of all available cells
	openIndex: function (val, idx) { return (!val) ? idx : null; },
	
    // map index of all unavailable cells; player must be bound on use
	usedIndex: function (playerNum, val, idx) {
        return (val === playerNum) ? idx : null;
    },
    
	// return true if every element of array matches boolean argument
    matchAll: function (bool) {
        return this.state.every(val => Boolean(val) === bool);
    },
	
    // return indexes of unoccupied cells
    available: function () {
        return this.state
            .map(this.openIndex)
            .filter(this.nonNull);
    },
    
    // return indexes of cells occupied by either player
    occupied: function (player) {
        return this.state
           .map(this.usedIndex.bind(null, player))
           .filter(this.nonNull);
    },
    
	// return true if every element of subarray can be found in array
	isSubset: function (sub, array) {
		winSeq = sub.every(val => array.indexOf(val) > -1)
            ? sub
            : false;
	    return winSeq;
	},
	
	// return true if game state matches at least 1 win condition
	validateWin: function (state) {
		return this.wins.some(cond => this.isSubset(cond, state));
	},

    // check board & return winner if condition met
	getWinner: function (userNum, compNum) {
	    return (
	        this.validateWin(this.occupied(userNum)) ? userNum :
	        this.validateWin(this.occupied(compNum)) ? compNum :
	        this.matchAll(true) ? 0 :
	        null
	    );
	},
    
	score: function (depth) {
		if (board.getWinner(userNum, compNum) === userNum) {
	    	return depth - 10;
		} else if (board.getWinner(userNum, compNum) === compNum) {
	    	return 10 - depth; 
		} else {
			return 0;
		}
	}
};

var negamax = (board, player, depth, lvl, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null) || depth >= lvl) {
        return board.getWinner(userNum, compNum);
        // also tried:  return board.score(depth) * player;
    }
    var highScore = -Infinity;
    board.available().forEach(function (move) {
        board.mark(move, player);
        var score = -negamax(board, -player, depth + 1, lvl, -β, -α);
        board.undo(move);
        if (score > highScore) { // if better cell is found
            highScore = score; // note best score so far
            bestMove = move; // note best move so far
            α = Math.max(α, score);
            if (α >= β) { // alpha-beta pruning
                return bestMove;
            }
        }
    });
    return bestMove;
};

// initial values
//----------------------------
var expected,
	actual,
	err         = () => (expected !== actual) ? "*": "",
	board       = new Board(),
	startDepth  = 1,
	targetLevel = 9,
	inf         = Infinity,
	userNum     = -1,
	compNum     = +1;
//============================

// user: X, comp: O
// should return 1 to block user from [0, 1, 2]
// returns 5 when negamax called with compNum
// output is correct when negamax called with userNum (?!)
var scenario01 = [ userNum,    0,    userNum,
		           userNum, compNum,    0,
		           compNum,    0,       0     ];

// user: X, comp: O
// should return 6 to block user from [0, 3, 6]
// output is as expected
var scenario02 = [ userNum,    0,       0,
                   userNum, compNum,    0,
                      0,       0,       0     ];
              
// user: X, comp: O
// should return 8 to block user from [6, 7, 8]
// output is as expected
var scenario03 = [    0,       0,       0,
                      0,       0,    compNum,
                   userNum, userNum,    0     ];

// user: X, comp: O
// should return 2 to block user from [2, 4, 6]
// output is as expected
var scenario04 = [ compNum,    0,       0,
                      0,    userNum,    0,
                   userNum,    0,       0     ];

// user: X, comp: O
// should return 5 to block user from [2, 5, 8]
// returns 7 when negamax called with compNum
// output is correct when negamax called with userNum (?!)
var scenario05 = [ compNum, compNum, userNum,
                   userNum,    0,       0,
                      0,       0,    userNum  ];

// user: X, comp: O
// should return 5 to block user from [2, 5, 8]
// returns 4 when negamax called with compNum (?!)
// returns 4 when negamax called with userNum (?!)
var scenario06 = [ compNum,    0,   userNum,
                      0,       0,      0,
                      0,       0,   userNum  ];

// user: X, comp: O
// should return 4 to block user from [0, 4, 8]
// output is as expected
var scenario07 = [ userNum, compNum, compNum,
                   userNum,    0,       0,
                      0,       0,    userNum  ];

// user: X, comp: O
// should return 3 to block user from [3, 4, 5]
// returns 8 when negamax called with compNum
// output is correct when negamax called with userNum (?!)
var scenario08 = [ userNum, compNum, compNum,
                      0,    userNum, userNum,
                      0,       0,       0     ];

// user: O, comp: X
// should return 3 to block user from [3, 4, 5]
// output is as expected
var scenario09 = [ userNum, compNum, compNum,
                      0,    userNum, userNum,
                      0,       0,    compNum  ];

// user: O, comp: X
// should return 7 to win with [1, 4, 7]
// output is as expected
var scenario10 = [ compNum, compNum, userNum,
                   userNum, compNum,    0,
                   userNum,    0,       0     ];

// user: X, comp: O
// should return 1 to block user from [1, 4, 7]
// output is as expected
var scenario11 = [    0,       0,       0,
                      0,    userNum,    0,
                   compNum, userNum,    0     ];

// user: O comp: X
// should return 6 to block user from [6, 7, 8]
// output is as expected
var scenario12 = [    0,    compNum,    0,
                   userNum, compNum, compNum,
                      0,    userNum, userNum  ];
                      

//----------------------------
board.state = scenario01;
expected = 1;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(01) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario02;
expected = 6;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(02) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario03;
expected = 8;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(03) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario04;
expected = 2;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(04) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario05;
expected = 5;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(05) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario06;
expected = 5;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(06) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario07;
expected = 4;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(07) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario08;
expected = 3;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(08) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario09;
expected = 3;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(09) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario10;
expected = 7;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(10) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario11;
expected = 1;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(11) expected:', expected, ', actual:', actual, err());
//----------------------------
board.state = scenario12;
expected = 6;
actual = negamax(board, compNum, startDepth, targetLevel, -inf, inf);
console.log('(12) expected:', expected, ', actual:', actual, err());
