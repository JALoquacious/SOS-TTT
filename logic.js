// global variables
let result    = null,
    userTurn  = null,
    winner    = null,
    winSeq    = null,
    gameOver  = false,
    bestMove  = 4;

const userNum = +1
      compNum = -1


// generate random cell num in range if num not in existing array
//-------------------------------------------------------------------\\
const randomCell = (array, nCells) => {
	let rand = Math.floor(Math.random() * nCells);
    return (array.indexOf(rand) < 0)
        ? rand
        : randomCell(array, nCells);
}//==================================================================//


// recursively alternate between players, checking best moves
//-------------------------------------------------------------------\\

// VERSION 5: works faster, but glitchy, especially if user is 'O'
const negamax = (board, player, depth, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null) || depth === 7) {
        return board.getWinner(userNum, compNum);
    }
    else {
        var highScore = -Infinity;
        board.available().forEach(function (move) {
            var temp = board.copy();
            temp.mark(move, player);
            var score = -negamax(temp, -player, depth + 1, -β, -α);
            //board.undo(move);
            if (score > highScore) { // if better cell is found
                highScore = score; // mark best score so far
                bestMove = move; // mark best move so far
                α = Math.max(α, score);
                if (α >= β) { // alpha-beta pruning
                    return bestMove;
                }
            }
        });
    }
    console.log("Depth:", depth,
                "highScore:", highScore,
                "bestMove:", bestMove,
                "α:", α,
                "β:", β);
    return bestMove;
}//==================================================================//

/*
// VERSION 4 (too much recursion error; won't even start running)
const negamax = (board, player, depth, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null)) {//  || depth === 6
        return board.getWinner(userNum, compNum);
    }
    var children = board.available();
    if (userTurn) {
        children.forEach(function (child) {
            var score = negamax(board, -player, depth + 1, α, β);
            if (score > α) { α = score; }
            if (α >= β) { return α; }
        });
        return α;
    }
    else {
        children.forEach(function (child) {
            var score = negamax(board, -player, depth + 1, α, β);
            if (score < β) { β = score; }
            if (α >= β) { return β; }
        });
        return β;
    }
}
*/

/*
// VERSION 3 (too much recursion error; won't even start running)
const negamax = (board, player, depth, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null)) {//  || depth === 6
        return board.getWinner(userNum, compNum);
    }
    if (player === userNum) {
        board.available().forEach(function (move) {
            α = Math.max(α, negamax(board, depth + 1, α, β, -player));
            if (β >= α) {
                return α;
            }
            return α;
        });
    }
    else {
        board.available().forEach(function (move) {
            β = Math.min(α, negamax(board, depth + 1, α, β, -player));
            if (β >= α) {
                return β;
            }
            return β;
        });
    }
}
*/

/*
//VERSION 2 (completely unpredictable behavior; faster than v1)
const negamax = (board, player, depth, α, β) => {
    if ((board.getWinner(userNum, compNum) !== null)) {//  || depth === 6
        return board.getWinner(userNum, compNum);
    }
    var bestRank = -Infinity;
    //var bestMove = 4;
    board.available().forEach(function (move) {
        board.mark(move, player);
        α = Math.max(α, -negamax(board, -player, depth + 1, -β, -α));
        //bestRank = Math.max(bestRank, rank);
        //α = Math.max(α, rank);
        board.undo(move);
        if (α >= β) {
            bestMove = move;
            console.log("depth alpha beta best", depth, α, β, bestRank);
            return bestMove;
        }
    });
    //console.log("Depth:", depth);
    //console.log("RETURNED BEST RANK VALUE IS:", bestRank);
    console.log("RETURNED BEST MOVE VALUE IS:", bestMove);
    return bestMove;
}
*/

/*
// VERSION 1 (used to work; very slow; doesn't always switch turns)
const negamax = (board, player, depth) => {
    if ((board.getWinner(userNum, compNum) !== null)) {//  || depth === 6
        return board.getWinner(userNum, compNum);
    }
    else {
        var highScore = -Infinity;
        board.available().forEach(function (move) {
            board.mark(move, player);
            let score = -negamax(board, -player, depth + 1);
            board.undo(move);
            if (score > highScore) {
                highScore = score;
                bestMove = move;
            }
            //highScore = Math.max(score, highScore);
        });
    }
    console.log("Depth:", depth);
    console.log("RETURNED HIGHSCORE VALUE IS:", highScore);
    console.log("RETURNED BEST MOVE VALUE IS:", bestMove);
    return bestMove;
}
*/

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
        //1,0,0,
        //0,0,0,
        //0,0,-1
        
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
    
    // retrieve level from factory
    $scope.level = Storage.getLevel();
    
    // generate 1 dimension of board for use in Angular loop
    $scope.dimension = Array.from(new Array(3), (x, i) => i);
    
    // variable must be non-scoped or AImove will misfire
    userTurn = ($scope.userToken === 'X') ? true : false;
    
    // add token class & text to selected div
    $scope.setActive = function (board, tile, token) {
        let item = angular.element(document.querySelector(`#${tile}`)),
            cell = Number(/\d/.exec(tile)[0]), // extract digit
            num  = (userTurn) ? userNum : compNum;
        console.log("setting cell:", cell);
        item.text(token);
        item.addClass(token);
        board.mark(cell, num);
        console.log("game state:", $scope.game.state); // DEBUG
        winner = board.num2Str(board.getWinner(userNum, compNum));
        console.log("winner:", winner);
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
        //$timeout(function () {
        while (!board.matchAll(true) && !userTurn && !gameOver) {
            if(board.matchAll(false)) {
                $scope.setActive(board,
                                 "cell" +
                                 board.randomChoice([0, 2, 4, 6, 8]),
                                 $scope.compToken);
            } else {
                $scope.setActive(board,
                                 "cell" + negamax(board,
                                                  compNum,
                                                  1,
                                                  -Infinity,
                                                  +Infinity),
                                 $scope.compToken);
            }
                
        }
        //}, 750);
    }
    
    angular.element(document).ready(function () { // wait for page load
        $scope.game = new Board();
        $timeout(function () {
            $scope.AImove($scope.game);
        }, 750);
        
        // seeds a couple initial board values to shorten loop
        // must remember to initialize board state to these values
        ///////////////////////////////////////////////////////////////
        //let sq0 = angular.element(document.querySelector('#cell0'));
        //let sq8 = angular.element(document.querySelector('#cell8'));
        //sq0.addClass('X'); sq0.text('X');
        //sq8.addClass('O'); sq8.text('O');
        ///////////////////////////////////////////////////////////////
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
        $scope.reset = true;
        result   = null,
        userTurn = null,
        winSeq   = null,
        gameOver = false,
        Storage.data = {};
        $timeout(function () {
            $location.path('/');
        }, 1000);
    }
    $scope.result = Storage.getResult();
});
//===================================================================//
    
// END ANGULAR APP