/*
Negamax function doesn't work if user plays as 'X' on 'Impossible' mode.
(The program works perfectly if user plays as 'O'.) I've tried an
enormous number of versions of the negamax function, as well as scouring
the program for other bugs that may be affecting the result, but with
little luck.

I posted the function(s) and a test suite on Stack Overflow in the hopes
of possibly getting a nudge in the right direction, though I expected
that the problem is just too complex for even a good samaritan to study
it without any real compensation. Sure enough, so far, no one has
responded.

For now, I'm leaving the program as-is in the hope that my knowledge of
algorithms will improve to the point where I can work on the negamax
function more proficiently instead of stumbling around in the dark.

Besides that central fix, I still need to implement board freezing so
the user cannot interfere during the computer's turn -- a relatively
simple task.
*/

// global variables
let result   = null,
    userTurn = null,
    winner   = null,
    winSeq   = null,
    bestMove = null,
    timer    = null,
    userNum  = null,
    compNum  = null,
    loaded   = false,
    gameOver = false;


// generate random cell num in range if num not in existing array
//-------------------------------------------------------------------\\
const randomCell = (array, nCells) => {
	let rand = Math.floor(Math.random() * nCells);
    return (array.indexOf(rand) > -1)
        ? rand
        : randomCell(array, nCells);
}//==================================================================//


// recursively alternate between players, checking best moves
//-------------------------------------------------------------------\\
const negamax = (board, player, depth, lvl, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null) || depth >= lvl) {
        return board.getWinner(userNum, compNum);
    }
    var highScore = -Infinity;
    board.available().forEach(function (move) {
        //var temp = board.copy();
        board.mark(move, player);
        var score = -negamax(board, -player, depth + 1, lvl, -β, -α);
        board.undo(move);
        if (score > highScore) { // if better cell is found
            highScore = score; // mark best score so far
            bestMove = move; // mark best move so far
            α = Math.max(α, score);
            if (α >= β) { // alpha-beta pruning
                return bestMove; // RETURN HIGHSCORE???
            }
        }
    });
    /*console.log("Depth:", depth,
                "highScore:", highScore,
                "bestMove:", bestMove,
                "α:", α,
                "β:", β);
    */
    return bestMove; // RETURN HIGHSCORE???
}//==================================================================//


let Board = function () {
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
	
    randomChoice: function (array) {
        return array[Math.floor(array.length * Math.random())];
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
    
    // return a string based on number result of the game
    num2Str: function (val) {
        return (
            val === userNum ? "User Wins!"     :
            val === compNum ? "Computer Wins!" :
            val === 0       ? "Tie Game."      :
            null
        );
    }
};


// INIT ANGULAR APP
const app = angular.module('TicTacToe', ['ngRoute', 'ngAnimate']);


// route setup
//-------------------------------------------------------------------\\
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', { templateUrl: 'intro.html', controller: 
                   'IntroCtrl'})
        .when('/game', { templateUrl: 'game.html', controller: 
                   'GameCtrl' })
        .when('/result', { templateUrl: 'result.html', controller: 
                   'ResultCtrl' });
});//================================================================//


// persist data across controllers
//-------------------------------------------------------------------\\
app.factory('Storage', function() {
    let data = {};
    
    const setTokens = (symbol) => {
        data.userToken = symbol;
        data.compToken = (symbol === 'X') ? 'O' : 'X';
    }
    const setLevel = (degree) => { data.level  = degree;  }
    const setResult = (input) => { data.result = input;   }
    const getUserToken = () =>   { return data.userToken; }
    const getCompToken = () =>   { return data.compToken; }
    const getLevel = () =>       { return data.level;     }
    const getResult = () =>      { return data.result;    }

    return {
        setTokens:    setTokens,
        setResult:    setResult,
        getUserToken: getUserToken,
        getCompToken: getCompToken,
        setLevel:     setLevel,
        getLevel:     getLevel,
        getResult:    getResult
    }
});//================================================================//


// controller for intro view
//-------------------------------------------------------------------\\
app.controller('IntroCtrl',
               function ($scope, $timeout, $location, Storage) {

    $scope.setTokens = (symbol) => {
        Storage.setTokens(symbol);
    }
    
    $scope.setLevel = (number) => {
        Storage.setLevel(number);
        $timeout(function () {
                $location.path('/game');
            }, 1000);
    }
});//================================================================//


// controller for game view
//-------------------------------------------------------------------\\
app.controller('GameCtrl',
               function ($scope, $location, $timeout, Storage) {
    
    // retrieve token from factory
    $scope.userToken = Storage.getUserToken();
    
    // set computer token to opposite of user selection
    $scope.compToken = Storage.getCompToken();
    
    // generate 1 dimension of board for use in Angular loop
    $scope.dimension = Array.from(new Array(3), (v, i) => i);
    
    // retrieve level from factory; multiply by length of dimension
    $scope.level = Storage.getLevel() * $scope.dimension.length;
    
    // variable must be non-scoped or AImove will misfire
    userTurn = ($scope.userToken === 'X') ? true : false;
    userNum = -1;
    compNum = -userNum;
    
    // add token class & text to selected div
    $scope.setActive = function (board, tile, token) {
        let item = angular.element(document.querySelector(`#${tile}`)),
            cell = Number(/\d/.exec(tile)[0]), // extract digit
            num  = (userTurn) ? userNum : compNum;
        console.log(userTurn ? "USER" : "COMP", "setting cell:", cell);
        item.text(token);
        item.addClass(token);
        board.mark(cell, num);
        winner = board.num2Str(board.getWinner(userNum, compNum));
        if (winner) {
            // if winSeq, highlight winning cells; else do nothing
            (winSeq || [undefined]).forEach(cellNum => {
                angular.element(
                    document.querySelector(`#cell${cellNum}`))
                        .removeClass('X O')
                        .addClass('win-seq')
            });
            gameOver = true;
            Storage.setResult(winner);
            let b = angular.element(document.querySelector('.board'));
            b.addClass('rotate');
            $timeout(function () {
                $location.path('/result');
            }, 7000);
        }
        userTurn = !userTurn; // toggle
    }
    
    $scope.AImove = function (board) {
        console.log("level is:", $scope.level);
        $timeout.cancel(timer);
        $timeout(function () {
            while (!board.matchAll(true) && !userTurn && !gameOver) {
                if(board.matchAll(false)) {
                    $scope.setActive(board,
                                     "cell" +
                                     board.randomChoice([0, 2, 4, 6, 8]),
                                     $scope.compToken);
                } else {
                    console.log('USERNUM:', userNum);
                    let dimen = Math.pow($scope.dimension.length, 2),
                        stage = ($scope.level <= $scope.dimension.length)
                            ? randomCell(board.available(), dimen)
                            : negamax(board,
                                      compNum,
                                      1,
                                      $scope.level,
                                      -Infinity,
                                      +Infinity);
                    $scope.setActive(board,
                                     "cell" + stage,
                                     $scope.compToken);
                }

            }
        }, 750);
        console.log("post-AImove game state:", $scope.game.state); // DEBUG
    }
    
    angular.element(document).ready(function () { // wait for page load
        // angular's ready method doesn't wait properly
        if (!loaded) {
            $scope.game = new Board();
                $scope.AImove($scope.game);
                loaded = true;
        }
    });
});
//===================================================================//


// controller for result view
//-------------------------------------------------------------------\\
app.controller('ResultCtrl',
               function ($scope, $timeout, $location, Storage) {
    $scope.resetAll = function () {
        let item = angular.element(document.querySelector(`.${'cell'}`));
        item.removeClass('rotate X O');
        result   = null,
        userTurn = null,
        winner   = null,
        winSeq   = null,
        bestMove = null,
        timer    = null,
        loaded   = false,
        gameOver = false;
        Storage.data = {};
        $timeout(function () {
            $location.path('/');
        }, 1000);
    }
    $scope.result = Storage.getResult();
});
//===================================================================//
    
// END ANGULAR APP