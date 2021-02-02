    var border;//Background Board
    var gap = 1;//Gap betwenn squares
    var cellWidth = 50;
    var disclayer;//Layer that olds the squares
    var turn = 1;
    var scoreLabel;
    var ffbut;//button for surrender
    var gameover = false;
	var AI = true;
	var moves = [];
    var AIdiff = 0;
    var pTurn;//Pass turn button
    var playerName, playerPass;
    var playerName2;
    var scoretop;
	var scorechild;
	//moves.push("a"); 
    var tiles;
    var wscore;//White's Score
    var bscore;//Black's Score
	var firstgame = true;
	var tName = 1;//Helps Check current turn
	var message;
    var AImov;
    //Buttons for game start setup
    var gameS;
    var aiSelect;
    var playerSelect;
    var aiHard;
    var aiEasy;
    var whiteSelect;
    var blackSelect;
	var aipass = false;//Verifies if the AI is passing the turn
	var hasName = false;//Check if the user as loged in
    var log;//submit Button
    var firstTurn;

    var serverUrl = "http://twserver.alunos.dcc.fc.up.pt:8140/";
    var rankingArr;
    var gameId;
    var serBoard;
    var winner;
    var loginform;
    var ffflag = false; //surrender flag
    var fnamep2 = true; //leu nome player 2;
    
    //Saves Rankings
     var topScore = [
        ["aaa", 5],
        ["aab", 4],
        ["aac", 3],
        ["aad", 2],
        ["aae", 1]
    ]
    
    
    window.onload=function()
    {
        
        scoretop = document.getElementById("box2");
		scorechild = document.createTextNode(""); //to update the highscores without messing up html later
		scoretop.prepend(scorechild);
        message = document.getElementById("messageLog");
        border = document.getElementById("border");
        
        redrawTop();

		log = document.getElementById("submitButton");
		log.addEventListener("click", function(){change_login()},false);
        
        gameS = document.getElementById("gameButton");
        gameS.addEventListener("click", gameStart);
		
		//blackSelect = document.getElementById("black");
        //blackSelect.addEventListener("click", function(){handleClicks(0)},false);

        //whiteSelect = document.getElementById("white");
        //whiteSelect.addEventListener("click", function(){handleClicks(1)},false);
		
		playerSelect = document.getElementById("player");
        playerSelect.addEventListener("click", function(){handleClicks(2)}, false);

        aiSelect = document.getElementById("ai");
        aiSelect.addEventListener("click", function(){handleClicks(3)}, false);
		        
        aiEasy = document.getElementById("easy");
        aiEasy.addEventListener("click", function(){handleClicks(4)}, false);

        aiHard = document.getElementById("hard");
        aiHard.addEventListener("click", function(){handleClicks(5)}, false);

        document.getElementById("submitButton").addEventListener("click", function () {
            register(playerName, playerPass);
            join(40, playerName, playerPass);
            turn = tName;
            firstTurn = true;
        });

        document.getElementById("NewGameB").addEventListener("click", function () {
            winner = null;
            gameover = false;
            register(playerName, playerPass);
            join(40, playerName, playerPass);
            turn = tName;
            firstTurn = true;
           
        });
        
    }

    function change_login()
    {
		playerName = document.getElementById("fname").value;
        playerPass = document.getElementById("lname").value;
        
        if(playerName.length != 0)
        {
			hasName = true;
            log.disabled = true;
            
			document.getElementById("fname").disabled = true;
			document.getElementById("lname").disabled = true;
        }

		newMessage(0);
    }

    async function join(group_num, nickname, password) {
        console.log(nickname + " Entra no join");
        const joinGame = { "group": group_num, "nick": nickname, "pass": password };
        let objeto = await fetch(serverUrl + "join", {
            method: "POST", body: JSON.stringify(joinGame)
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (myresponse) {
                if (myresponse.error) { console.log(myresponse.error); }
                else {
                    return myresponse;
                }
            })

        .catch(console.log);
        console.log(objeto);
        console.log("GameId: " + objeto.game);
        gameId = objeto.game;
        console.log("Update " + nickname)
        if(objeto.color == "dark") tName = 1;
        else tName = 2;
        update(nickname, gameId);

    }

    async function register(nickname, password) {
        const joinGame = { "nick": nickname, "pass": password }
        let objeto = await fetch(serverUrl + "register", {
            method: "POST", body: JSON.stringify(joinGame)
        })
            .catch(function (res) {
                console.log(res);
            })
    }
    
    async function update(nickname, gameId) {

        const url = serverUrl + "update?nick=" + nickname + "&game=" + gameId;
        this.source = new EventSource(url);
        this.source.onmessage = function (event) {
            if (typeof (JSON.parse(event.data).board) == "object"){
                serBoard = JSON.parse(event.data).board;

                if (fnamep2 && playerName != JSON.parse(event.data).turn) {
                    playerName2 = JSON.parse(event.data).turn;
                    fnamep2 = false;
                }

                if(playerName == JSON.parse(event.data).turn){
                    turn = tName;
                    redrawTurn();
                }
                else{
                    if(tName == 1) turn = 2;
                    else turn = 1;
                    redrawTurn();
                }
                
                for (let i = 0; i < 8; i++){
                    for (let j = 0; j < 8; j++){
                        if (serBoard[i][j] == "empty") tiles[i][j] = 0;
                        else if (serBoard[i][j] == "dark") tiles[i][j] = 1;
                        else tiles[i][j] = 2;
                    }    
                } 
            }

            if (JSON.parse(event.data).winner != null) {
                winner = JSON.parse(event.data).winner;

                if (JSON.parse(event.data).winner == playerName) {
                    console.log("Win")
                    newMessage(5);
                    //leave(playerName, playerPass, game);
                }else{
                    console.log("Lose");
                    newMessage(5);
                }
                //if(!ffflag) leave(playerName, playerPass, gameId);
            }
            else if (JSON.parse(event.data).count.dark == JSON.parse(event.data).count.light && JSON.parse(event.data).count.empty == 0){
                newMessage(14);
                gameOverOnline();
            }

            console.log("Game Turn: " + turn);
            updBoard();
            redrawScore();

            if (firstTurn) {
                newMessage(12);
                firstTurn = false;
            }

            console.log(event.data);

            /*if (JSON.parse(event.data).winner == playerName) {
                console.log("Last Leave ")
                leave(playerName, playerPass, gameId);
            }*/
        }
    }

    function gameOverOnline() {//Updates Everything and turns the surrender button into the new game button
        updBoard();
        redrawScore();
        redrawTurn();

        gameover = true;

        firstgame = false;

        if (bscore > wscore) {
            newMessage(5);
        } 
        else {
            newMessage(6);
        }

        leave(playerName, playerPass, gameId);
    }

    async function leave(nickname, password, gameId) {
        const exit = { "nick": nickname, "pass": password, "game": gameId };
        let objeto = await fetch(serverUrl + "leave", {
            method: "POST", body: JSON.stringify(exit)
        })
            .catch(function (myresponse) {
                if (myresponse.error) { console.log(myresponse.error); }
                else {
                    return myresponse;
                }
            })

        console.log(nickname + " left");
    }

    async function ranking() {
        const rank = "{}";
        let objeto = await fetch(serverUrl + "ranking", {
            method: 'POST',
            body: rank
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (myresponse) {
                if (myresponse.error) { console.log(myresponse.error); }
                else {
                    console.log(myresponse)
                    return myresponse;
                }
            })
            .catch(console.log); 
        console.log(objeto.rank.ArrRanking);
        //console.log(objeto.ranking[0]);

        
        let ran = document.getElementById("box2");
        scorechild.nodeValue = "HighScores:";
        scorechild.nodeValue += "\n"
        scorechild.nodeValue += "1: ";
        scorechild.nodeValue += (objeto.rank.ArrRanking[0].nick);
        scorechild.nodeValue += " V:";
        scorechild.nodeValue += (objeto.rank.ArrRanking[0].victories);
        scorechild.nodeValue += " L:";
        scorechild.nodeValue += (objeto.rank.ArrRanking[0].games);
        scorechild.nodeValue += "\n"
        console.log(objeto.rank.ArrRanking[1])
        for (let i = 1; i < 10; i++) {
            scorechild.nodeValue += i + 1 + ": ";
            scorechild.nodeValue += (objeto.rank.ArrRanking[i].nick);
            scorechild.nodeValue += " V: ";
            scorechild.nodeValue += (objeto.rank.ArrRanking[i].victories);
            scorechild.nodeValue += " L: ";
            scorechild.nodeValue += (objeto.rank.ArrRanking[i].games);
            scorechild.nodeValue += "\n"

        }
    }

    async function notify(nickname, password, gameId, x, y) {
        const moveInfo = { "row": x, "column": y };
        console.log(moveInfo.row + ", " + moveInfo.column);
        const joinGame = { "nick": nickname, "pass": password, "game": gameId, "move": moveInfo }
        fetch(serverUrl + "notify", {
            method: 'POST', body: JSON.stringify(joinGame)
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (myresponse) {
                if (myresponse.error) {
                    console.log(myresponse.error);
                }
                else {
                    return myresponse;
                }
            })
            .catch(console.log);
    }

    async function notify_skip(nickname, password, gameId) {
        const moveInfo = null;
        const joinGame = { "nick": nickname, "pass": password, "game": gameId, "move": moveInfo }
        await fetch(serverUrl + "notify", {
            method: 'POST', body: JSON.stringify(joinGame)
        })
            .then(function (response) {
                console.log(response);
                let res = response.json();
                console.log(typeof res)
                return res;
            })
            .then(function (myresponse) {
                if (myresponse.error) {
                    console.log(myresponse.error);
                }
                else {
                    return myresponse;
                }
            })
            .catch(console.log);
    }
    
    function handleClicks(arg)
    {
        switch(arg)
        {
			case 0:
				tName = 1;
				blackSelect.style.backgroundColor = "orange";
				whiteSelect.style.backgroundColor = "burlywood";
                break;
                
			case 1:
				tName = 2;
				whiteSelect.style.backgroundColor = "orange";
				blackSelect.style.backgroundColor = "burlywood"
                break;
                
			case 2:
				AI = false;
				playerSelect.style.backgroundColor = "orange";
				aiSelect.style.backgroundColor = "burlywood"
                break;
                
			case 3:
				AI = true;
				aiSelect.style.backgroundColor = "orange";
				playerSelect.style.backgroundColor = "burlywood"
                break;
                
			case 4:
				AIdiff = 0;
				aiEasy.style.backgroundColor = "orange";
				aiHard.style.backgroundColor = "burlywood"
                break;
                
			case 5:
				AIdiff = 1;
				aiHard.style.backgroundColor = "orange";
				aiEasy.style.backgroundColor = "burlywood"
				break;
			
			default:
				alert("Invalid handleclick event.");
		}
	}
	
    function gameStart()
    {
		
		tiles = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,2,1,0,0,0],
            [0,0,0,1,2,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ]
			
		
		if(firstgame) {
            disclayer = document.getElementById("disclayer");
            border.appendChild(disclayer);
            border.style.width = cellWidth*8 + (gap*9) + "px";
            border.style.height = cellWidth*8 + (gap*9) + "px";

            scoreLabel = document.getElementById("score");
            turnName = document.getElementById("msgBoard");

            ffbut = document.getElementById("surrender");
            ffbut.addEventListener("click", function(){surrender()}, false);
            
            pTurn = document.getElementById("PassTurn");
            pTurn.addEventListener("click", function(){passTurn()}, false);

            makeBoard();
            updBoard();
        }
        else
        {
            ffbut.textContent = "Surrender";
            
			newMessage(10);
			gameover = false;
		}
		
        formDisplay();
        redrawScore();
        redrawTurn();
		redrawTop();
        updBoard();
		
        if(AI && tName == 2)
        {
			turn = 1;
            newMessage(9);
            AImove();
        }
		gameover = false;  
    }

    function formDisplay() {
        document.getElementById("loginform").style.display = "block";
    }
     
    function newMessage(code)//Prints on the message log
    {
		let turnplayer;
			if(turn == 1) turnplayer = "Black";
            else if(turn == 2) turnplayer = "White";
            
        switch(code) 
        {
			case 0:
                if(hasName)
                {
					message.textContent += "Welcome, " + playerName + ".";
                }else
                {
					message.textContent += "Welcome to Othello!";
				}
                break;
                
			case 1:
				message.textContent += "Player " + turnplayer + " just passed the turn.";
                break;
                
			case 2:
				getPossible(turn);
				let movestr = moves.toString().split(",");
				let dispmoves = "";
				for(let i = 0; i<movestr.length; i++){
					dispmoves += "[" + movestr[i].charAt(0) + "," + movestr[i].charAt(1) + "]";
				}
				message.textContent += "Player " + turnplayer + ", you still have available moves: [" + dispmoves + "]";
                break;
                
			case 3:
				message.textContent += "Black has surrendered.";
                break;
                
			case 4:
				message.textContent += "White has surrendered.";
                break;
                
			case 5:
				message.textContent += "Game over. " + winner + "'s won\nPlease click the 'New Game' button on the left for a rematch.";
                break;
                
			case 6:
                message.textContent += "Game over. " + winner + "'s won\nPlease click the 'New Game' button on the left for a rematch.";
                break;
                
			case 7:
				message.textContent += "The AI (" + turnplayer + ") cannot move and thus passes the turn.";
                break;
                
			case 8:
				message.textContent += "The AI places a piece at " + AImov + ".";
                break;
                
			case 9:
				message.textContent += "The AI gets the first move";
                break;
                
			case 10:
                if(hasName)
                {
					message.textContent += "Starting a new game, " + playerName + ".";
                }else
                {
					message.textContent += "Starting a new game.";
				}
                break;
            case 11:
				message.textContent += "You cannot place a piece there.";
                break;
            case 12:
                message.textContent += "Match Found";
                break;
            case 13:
                message.textContent += "Not your Turn";
                break;
            case 14:
                message.textContent += "Tie";
                break;
			default:
				alert("Invalid message code");
				break;
        }
        
		message.textContent += "\r\n";
		message.scrollTop = message.scrollHeight;
		return;
	}

    function passTurn()
    {
        if(AI){
            getPossible(turn);
            
            if(moves.length == 0)
            {
                if(aipass == false) newMessage(1);
                if(turn == 1) turn = 2;
                else if(turn == 2) turn = 1;
                redrawTurn()
                
                if(AI && aipass == false)
                {
                    AImove();
                }
            }else
            {
                newMessage(2);
            }
        }
        else{
            //console.log("Tried to pass Turn");
            notify_skip(playerName, playerPass, gameId);
            updBoard();
        }
	}
	
    function surrender()//Also used to start a new game
    {
        if(AI){
            if (!gameover){
                //getHighScore();
                if (turn == 1) {
                    newMessage(3);
                    bscore = 0;
                } else if (turn == 2) {
                    newMessage(4);
                    wscore = 0;
                }

                changetopScore();
                redrawScore();
                redrawTurn();
                firstgame = false;
            }
        }
        /*else if (gameover){
            
            gameover = false;
            register(playerName, playerPass);
            join(40, playerName, playerPass);
            turn = tName;
        }*/
        else {
            console.log(playerName + "deu leave");
            ffflag = true;
            winner = playerName2;
            gameOverOnline();
        }
    }
        
    function redrawTop()//Updates the Rankings visualy
    {
		
        scorechild.nodeValue = "Highscores: \n";
        
        ranking();
    }

    function getHighScore()
    {
        bscore = 0;
        wscore = 0;
        for (let row = 0; row < 8; row++)
        {
            for (let column = 0; column < 8; column++)
            {
                let value = tiles[row][column];
                if(value == 1) bscore++;
                else if(value == 2) wscore++;
            }
        }
    }

    function makeBoard()//Creates the game board
    {
        for(let row = 0; row < 8; row++)
        {
          for(let column=0; column < 8; column++)
          {
            var square = document.createElement("div");
            square.style.position = "absolute";
            square.style.width = cellWidth + "px";
            square.style.height = cellWidth + "px";
            square.style.backgroundColor = "green";
            square.style.border = "solid"
            square.style.left = (cellWidth+gap)*column+gap + "px";
            square.style.top = (cellWidth+gap)*row+gap + "px";
			square.addEventListener("click", clickExecute.bind(null, row, column), false);
            
            border.appendChild(square);
          }
        }
    }

    function clickExecute(row, column)//Checks if a square was clicked
    {
        if (gameover) {
            return;
        }
        if(AI){
            if (gameover) {
                return;
            }
            if (tiles[row][column] != 0) {
                return;
            }
            if (canClickSpot(turn, row, column) == true) {
                let tilesAffected = changesBoard(turn, row, column);
                changeTiles(tilesAffected);
                tiles[row][column] = turn;
                if(turn == 1)
                {
                    turn = 2;
                }
                else if(turn == 2) 
                {
                    turn = 1;
                }
            	
                if(isPoss(1) == false && isPoss(2) == false)
                {
                    gameover = true;
                    gameOver();
                    updBoard();
                    redrawScore();
                    return;
                }

                if (turn == 1 && !isPoss(1) && AI) {
                    newMessage(7);
                    turn = 2;
                    return;
                } else if (turn == 2 && !isPoss(2) && AI) {
                    newMessage(7);
                    turn = 1;
                    return;
                }
                redrawTurn();
                if (AI) {
                    AImove();
                }
            }
            else {
                newMessage(11);
            } 
            
        }
        
        else{
            if (gameover) {
                return;
            }
            if (tiles[row][column] != 0) {
                return;
            }
            if (canClickSpot(turn, row, column) == true) {
                /*let tilesAffected = changesBoard(turn, row, column);
                changeTiles(tilesAffected);
                tiles[row][column] = turn;
                if(turn == 1)
                {
                    turn = 2;
                }
                else if(turn == 2) 
                {
                    turn = 1;
                }
            	
                if(isPoss(1) == false && isPoss(2) == false)
                {
                    gameover = true;
                    gameOver();
                    updBoard();
                    redrawScore();
                    return;
                }*/

                notify(playerName, playerPass, gameId, row, column);

                if (turn == 1 && !isPoss(1) && AI) {
                    newMessage(7);
                    turn = 2;
                    return;
                } else if (turn == 2 && !isPoss(2) && AI) {
                    newMessage(7);
                    turn = 1;
                    return;
                }

                if (isPoss(1) == false && isPoss(2) == false) {
                    gameover = true;
                    gameOverOnline();
                    updBoard();
                    redrawScore();
                    return;
                }

                redrawTurn();
                if (AI) {
                    AImove();
                }
            }
            else if(turn != tName){
                newMessage(13);
            }
            else {
                newMessage(11);
            } 
        }
        
    }
    
    function getPossible(t)//Gets possible Moves
    {
		moves = [];
        for(let row = 0; row < 8; row++)
        {
            for(let column=0; column < 8; column++)
            {
                let value = tiles[row][column];
                if (value == 0 && canClickSpot(t, row, column))
                {
					moves.push("" + row + column); 
                }
            }
        }
    }

    function isPoss(id)//Check if there are possible moves
    {
        for (let row = 0; row < 8; row++)
        {
            for (let column = 0; column < 8; column++)
            {
                if(canClickSpot(id, row, column))
                {
                    return true;
                }
            }
        }
        return false;
    }

    function canClickSpot(id, row, column)//Checks if a spot can be clicked by the game rules
    {
        let tilesAffected = changesBoard(id, row, column);

        if(tilesAffected.length == 0)
        {
            return false;
        } 
        else
        {
            return true;
        } 
    }

    function changesBoard(id, row, column)//Gets tiles that are affected by a move
    {
        let tilesAffected = [];

        //Right
        let couldBeAffect = [];
        let columnIte = column;
        while(columnIte < 7)
        {
            columnIte++;
            let valueAtSpot = tiles[row][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:row,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        //Left
        couldBeAffect = [];
        columnIte = column;
        while(columnIte > 0)
        {
            columnIte--;
            let valueAtSpot = tiles[row][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:row,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        //Up
        couldBeAffect = [];
        let rowIte = row;
        while(rowIte > 0)
        {
            rowIte--;
            let valueAtSpot = tiles[rowIte][column];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:column};
                couldBeAffect.push(disclocation);
            }
        }

        //Down
        couldBeAffect = [];
        rowIte = row;
        while(rowIte < 7)
        {
            rowIte++;
            let valueAtSpot = tiles[rowIte][column];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:column};
                couldBeAffect.push(disclocation);
            }
        }

        //Down-Right
        couldBeAffect = [];
        rowIte = row;
        columnIte = column;
        while(rowIte < 7 && columnIte < 7)
        {
            rowIte++;
            columnIte++;
            let valueAtSpot = tiles[rowIte][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        //Down-Left
        couldBeAffect = [];
        rowIte = row;
        columnIte = column;
        while(rowIte < 7 && columnIte > 0)
        {
            rowIte++;
            columnIte--;
            let valueAtSpot = tiles[rowIte][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        //Up-Right
        couldBeAffect = [];
        rowIte = row;
        columnIte = column;
        while(rowIte >0 && columnIte > 0)
        {
            rowIte--;
            columnIte--;
            let valueAtSpot = tiles[rowIte][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        //Up-Left
        couldBeAffect = [];
        rowIte = row;
        columnIte = column;
        while(rowIte >0 && columnIte < 7)
        {
            rowIte--;
            columnIte++;
            let valueAtSpot = tiles[rowIte][columnIte];
            if(valueAtSpot == 0 || valueAtSpot == id)
            {
                if(valueAtSpot == id){
                    tilesAffected = tilesAffected.concat(couldBeAffect);
                }
                break;
            }
            else
            {
                let disclocation = {row:rowIte,column:columnIte};
                couldBeAffect.push(disclocation);
            }
        }

        return tilesAffected;
    }

    function changeTiles(tilesAffected)//Changes the tiles
    {
        for(let i = 0; i < tilesAffected.length; i++)
        {
            let spot = tilesAffected[i];
            if(tiles[spot.row][spot.column] == 1)
            {
                tiles[spot.row][spot.column] = 2;
            }
            else{
                tiles[spot.row][spot.column] = 1
            }
        }
    }

    function updBoard()//Changes the game board to match the current state of the game
    {
        disclayer.textContent = "";
        for(let row = 0; row < 8; row++)
        {
            for(let column=0; column < 8; column++)
            {
                let value = tiles[row][column];
                if (value == 0)
                {
                    //Nothing
                }
                else
                {
                    let disc = document.createElement("div");
                    disc.style.position = "absolute";
                    disc.style.width = cellWidth - 6 + "px";
                    disc.style.height = cellWidth - 6 + "px";
                    disc.style.borderRadius = "50%";
                    disc.style.left = (cellWidth+gap)*column+gap + 3 + "px";
                    disc.style.top =  (cellWidth+gap)*row+gap + 3 + "px";
                    disc.style.zIndex = "200";
                    
                    if(value == 1) 
                    {
                        disc.style.backgroundColor = "black";
                    }
                    if(value == 2) 
                    {
                        disc.style.backgroundColor = "white";
                    }
                    disclayer.appendChild(disc);
                }
            }
        }
    }
	
    function redrawScore()//redraw the score board
    {
        let blackp = 0;
        let whitep = 0;
        let pieces;
        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                let value = tiles[row][column];
                if(value == 1) blackp++;
                else if(value == 2) whitep++;
            }
        }
        pieces = 64 - blackp - whitep;
        if(blackp < 10 && whitep < 10){
            scoreLabel.textContent = "Black:  0" + blackp + " - White:  0" + whitep + "\nPieces Left: " + pieces;
        }
        else if(blackp < 10 && whitep >= 10){
            scoreLabel.textContent = "Black:  0" + blackp + " - White:  " + whitep + "\nPieces Left: " + pieces;
        }
        else if(blackp >= 10 && whitep < 10){
            scoreLabel.textContent = "Black:  " + blackp + " - White:  0" + whitep + "\nPieces Left: " + pieces;
        }
        else scoreLabel.textContent = "Black: " + blackp + " - White: " + whitep + "\nPieces Left: " + pieces;

    }

    function redrawTurn()//Redraws the turn
    {
        if(turn == 1){
            turnName.textContent = "Black's Turn"
        }
        else if(turn == 2){
            turnName.textContent = "White's Turn"
        }
        
    }

   