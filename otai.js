function changetopScore()////Updates the Rankings
{
    getHighScore();
    let scr;
    if (tName == 1) {
        scr = bscore;
    }
    else if (tName == 2) {
        scr = wscore;
    }

    for (let i = 0; i < 5; i++) {
        if (scr > topScore[i][1]) {
            let tempn = topScore[i][0];
            let temps = topScore[i][1];
            topScore[i][0] = playerName;
            topScore[i][1] = scr;
            for (let j = i + 1; j < 5; j++) {
                let temp2n = topScore[j][0];
                let temp2s = topScore[j][1];
                topScore[j][0] = tempn;
                topScore[j][1] = temps;
                tempn = temp2n;
                temps = temp2s;
            }
            return;
        }
    }
}

function gameOver() {//Updates Everything and turns the surrender button into the new game button
    getHighScore();
    changetopScore();
    updBoard();
    redrawScore();
    redrawTurn();

    ffbut.textContent = "New Game";
    gameover = true;

    firstgame = false;
    if (bscore > wscore) {
        newMessage(5);
    } else {
        newMessage(6);
    }
}

function clickExecuteAI(row, column)//Handles the Squares the AI is going to Click
{
    if (tiles[row][column] != 0) {
        return;
    }

    if (canClickSpot(turn, row, column) == true) {
        let tilesAffected = changesBoard(turn, row, column);
        changeTiles(tilesAffected);
        tiles[row][column] = turn;

        if (isPoss(1) == false && isPoss(2) == false) {
            gameover = true;
            gameOver();
            return;
        }

        if (turn == 1) {
            turn = 2;
        }
        else if (turn == 2) {
            turn = 1;
        }

        if (isPoss(1) == false && isPoss(2) == false) {
            gameover = true;
            gameOver();
            return;
        }

        getPossible(turn);

        let other;
        if (moves.length == 0) {
            if (turn == 1) other = 2;
            if (turn == 2) other = 1;

            getPossible(other);

            if (moves.length == 0) {
                gameover = true;
                gameOver();
            }
        }

        updBoard();
        redrawScore();
        redrawTurn();
    }
}


function AImove() {//Choses the Square to click by the AI

    getPossible(turn);
    let other;
    if (moves.length == 0) {
        if (turn == 1) other = 2;
        if (turn == 2) other = 1;

        getPossible(other);

        if (moves.length == 0) {
            gameover = true;
            gameOver();
        } else {
            aipass = true;
            newMessage(7);
            passTurn();
            aipass = false;

            return;
        }


    }

    var myMove;
    var row;
    var column;
    if (AIdiff == 0) //random selection
    {
        myMove = Math.floor(Math.random() * moves.length);
        row = parseInt(moves[myMove].charAt(0));
        column = parseInt(moves[myMove].charAt(1));

    } else if (AIdiff == 1) //most pieces affected
    {
        let best = 0;
        let cur;

        for (let i = 0; i < moves.length; i++) {
            row = parseInt(moves[i].charAt(0));
            column = parseInt(moves[i].charAt(1));
            cur = changesBoard(turn, row, column).length;
            if (cur > best) {
                best = i;
            }
        }
        row = parseInt(moves[best].charAt(0));
        column = parseInt(moves[best].charAt(1));

    }

    AImov = "[" + row + "]" + ":" + "[" + column + "]";
    newMessage(8);
    clickExecuteAI(row, column);
}