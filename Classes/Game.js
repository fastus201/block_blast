import { Settings } from "./Settings.js";

import { Square } from "./Square.js";
import { Piece } from "./Piece.js";
import { ManageSquareDrag } from "./ManageSquareDrag.js";

/**
 * Game class for Block Blast.
 */
export class Game{
    /**
     * 2D array.
     * @type {Number[][]}
     */
    board;

    /**
     * Pieces that can be dragged by the user
     * @type {Piece[]}
     * 
     */
    draggablePieces = [];

    #score = 0;
    #bestScore = 0;

    /**
     * How many pieces you you can place before your combo finishes.
     */
    #comboMaxPieces = Settings.COMBO_MAXPIECES;

    /**
     * Keep track of the combo.
     */
    #comboCounter = 0;
    constructor(){
        //Put game settings in CSS
        Settings.setCSS();
        //Set Game reference
        ManageSquareDrag.game = this;
        
        //Add listener to restartButton
        document.getElementById("restartGame").addEventListener("click",this.#resetGame.bind(this));
        //Check if there already is a game to load
        let saved = this.#checkSavedGame();

        //Draw board
        this.#drawBoard(saved);
        
    }


    /**
     * Draws game board.
     * @param {Boolean} saved
     */
    #drawBoard(saved){
        
        //I chose 2 random colors to be the default to be in my board
        let randomColors = Settings.getRandomColor(2);

        let existingBoard = [];
        if(saved){
            existingBoard = this.board.map(el=>[...el]);
            
        }
        //If I do not have an existing board to create
        let board = [];
        for(let i = 0;i<Settings.HEIGHT_CELLS;++i){
            board.push([]);
            for(let j = 0;j<Settings.WIDTH_CELLS;++j){
                let color = i < Settings.HEIGHT_CELLS / 2 ? randomColors[0] : randomColors[1];
                if(saved){
                    board[i][j] = existingBoard[i][j];
                    if(existingBoard[i][j] != 0)
                        color = Settings.COLORS[existingBoard[i][j]-1];
                    else
                        color = "gray";
                }
                else
                    board[i][j] = Settings.COLORS.indexOf(color) + 1;
                let square = Square.createElement(j,i,color,"normal");

                document.getElementById("gameContainer").append(square);
            }
        }
       
        this.board = board;
        //Wait the page to be loaded
        setTimeout(() => {
            this.#removeStartPieces(existingBoard);

            //After the finish of the animation
            setTimeout(() => {
            
                //Create piece to be inserted in the board
                this.#createSelectPieces(saved);
            }, Settings.LINE_TIMEOUT * Settings.HEIGHT_CELLS);


        }, 150);
    }

    /**
     * Remove pieces on the board.
     * 
     * Called on game start.
     * 
     * It can be randon or not, if there is already a board to recreate.
     */
    #removeStartPieces(existingBoard){
        //Starting from the first row
        let row = 0;
        
        let random = existingBoard.length === 0;

        
        let timeout = setInterval(() => {
            for(let j = 0;j<Settings.WIDTH_CELLS;++j){
                if(random && Math.random() > .0){
                    Square.destroyPiece(j,row);
                    this.board[row][j] = 0;
                }
                else if(!random && existingBoard[row][j] == 0){
                    Square.destroyPiece(j,row);
                    this.board[row][j] = 0;
                }
            }
            if(++row >= Settings.HEIGHT_CELLS){
                clearInterval(timeout);
                let sameLine = this.#checkLines(this.board);
                this.#deleteFilledLines(sameLine,false);


            }
        }, Settings.LINE_TIMEOUT);

    }



    /**
     * Create draggable pieces.
     * 
     * @param {Boolean} saved
     */
    #createSelectPieces(saved){
        if(!saved){
            //Each piece shown, has to be placed inside the board
            let allPlaceAblePieces = this.#getAllPlaceAblePieces();
            this.draggablePieces = [];
            //Pick 3 random pieces from the ones that I am sure I can place inside the board
            for(let i = 0;i<Settings.NEXT_PIECES;++i){
                let piece = allPlaceAblePieces[Math.floor(Math.random()*allPlaceAblePieces.length)];
                //let piece = allPlaceAblePieces[i];
                if(piece ==undefined)
                    break;
                this.draggablePieces.push(new Piece(false,piece.pattern));
                
            }
        }
        //Get total width
        let totalWidth = 0;
        for(let i = 0;i<this.draggablePieces.length;++i)
            totalWidth+=this.draggablePieces[i].pattern.width;
            
         //To be sure, I remove nextPieces before creating them
        //Remove nextPieces
        for(let i = 0;i < Settings.NEXT_PIECES;++i){
            let squares = document.querySelectorAll(".nextPiece-"+i);
            squares.forEach(el=>{
                el.remove();
            });
        }

        //From the totalWidth, get the SIZE_MODIFIER for the nextPieces
        let ratio = Settings.WIDTH_CELLS / totalWidth;
        if(ratio < Settings.DEFAULT_SIZE_MODIFIER){
            Settings.SIZE_MODIFIER = ratio - .1;
            Settings.setCSS();
        }
        else{
            Settings.SIZE_MODIFIER = Settings.DEFAULT_SIZE_MODIFIER;
            Settings.setCSS();
        }

        //Now I have to calculate how to align the 3 pieces

        //Get how many many squares can stay in x-axis

        const maxWidthPieces = Settings.WIDTH_CELLS / Settings.SIZE_MODIFIER;

        //Get how empty space I have (measured in cells)
        const totalSpaceAvailable = maxWidthPieces - totalWidth;

        //Get how empty space has each free space
        const emptySpace = totalSpaceAvailable / (Settings.NEXT_PIECES + 1);
        
        //Get the height of the container
        let totalHeight = Settings.MAX_PATTERN_SIZE * Settings.CELL_SIZE * Settings.DEFAULT_SIZE_MODIFIER;
        

        //Keep track of how space I have occupied so far
        let currentWidth = emptySpace;

       
        for(let i = 0;i<Settings.NEXT_PIECES;++i){
            let currentPiece = this.draggablePieces[i];
            if(currentPiece == undefined)
                break;
            //Get how empty space to put on top and bottom margin
            let spaceY = ((totalHeight - (currentPiece.pattern.height * Settings.CELL_SIZE * Settings.SIZE_MODIFIER)) / 2) / (Settings.CELL_SIZE*Settings.SIZE_MODIFIER);
            
            currentPiece.createElement(currentWidth , spaceY, i);
            currentWidth+=currentPiece.pattern.width + emptySpace;

         }


         //After I've created the pieces, I add animation to "push" them under the board
        let elements = document.querySelectorAll(".hidden");
        for(let el of elements){
            let x = window.getComputedStyle(el).getPropertyValue("--x");
            el.offsetTop;
            el.classList.remove("hidden");
            el.style.transition = ".25s linear";
            el.offsetTop;
            el.style.pointerEvents = "none";
            el.style.setProperty("--x",x - Settings.WIDTH_CELLS - 2);
            el.addEventListener("transitionend",()=>{
                el.style.transition = "";
                el.style.pointerEvents ="all";
            });
        }

    }


    /**
     * Get all pieces that can be placed inside the board.
     * 
     * @returns {Piece[]}
     */
    #getAllPlaceAblePieces(){
        let pieces = Piece.getAllPieces();

        //Remove pieces that CANNOT be placed inside the board
        let newPieces = pieces.filter(el=>this.#checkIfPieceFits(el));

        return newPieces;
    }


     
    /**
     * Add squares to the board.
     * @param {Piece} piece
     * @param {Number} x 
     * @param {Number} y 
     * 
      */
    updateBoard(piece,x,y){
        let pattern = piece.pattern;
        for(let i = 0;i<pattern.height;++i){
            for(let j = 0;j<pattern.width;++j){
                if(pattern.matrix[i][j] == 1){
                    //Update game board
                    
                    this.board[y+i][x+j] = Settings.COLORS.indexOf(piece.color) + 1;
                }
            }
        }
        
        //Delete lines filled with squares
        let res = this. #checkLines(this.board);

        //I've just add a piece to the board, let's check the combo
        this.#checkForCombo(res);
        this.#deleteFilledLines(res);
        
        
        
        //Check if I have to update draggable pieces
        if(!this.#updateDraggablePieces(piece)){

            //Check if you can not place pieces anymore
            if(this.#checkForEnd()){
                //Show graphic for gameOver
                setTimeout(() => {
                    let gameOverScreen = document.getElementById("gameOverScreen");
                    
                    gameOverScreen.style.display = "block";
                }, 250);
                document.getElementById("finalScore").textContent = this.#score;
                document.getElementById("restartButton").addEventListener("click",this.#resetGame.bind(this),{once:true});     
                this.#clearGameState();

                return;
            }
        }

        //Save the state of the game in localStorage
        this.#saveGameState(); 
    }

    /**
     * Reset game.
     */
    #resetGame(){
        //Clear stats
        this.#clearGameState();
        //Remove nextPieces
        for(let i = 0;i < Settings.NEXT_PIECES;++i){
            let squares = document.querySelectorAll(".nextPiece-"+i);
            squares.forEach(el=>{
                el.remove();
            });
        }
        //Reset score
        document.getElementById("currentScore").textContent = "0";
        //Recreate board

        
        //Destroy currentPieces
        let pieces = document.querySelectorAll(".cell");
        pieces.forEach(piece=>piece.remove());

        
        this.#drawBoard(false);

       //Remove end display
       document.getElementById("gameOverScreen").style.display = "none";
    }

    /**
     * Upgrade the state of the current combo.
     * 
     * @param {[]} linesDestroyed
     */
    #checkForCombo(linesDestroyed){
        //If a line has been deleted
        if(linesDestroyed.length == 0)
            --this.#comboMaxPieces;
        else{
            this.#comboMaxPieces = Settings.COMBO_MAXPIECES;
            this.#comboCounter+=linesDestroyed.length;

            //Show the combo
            if(this.#comboCounter > 2){
                const comboMessage = document.querySelector('.combo-message');
                comboMessage.textContent = `Combo x${this.#comboCounter}`;
                comboMessage.classList.remove('hidden');
                comboMessage.style.animation = 'none';
                comboMessage.offsetWidth;
                comboMessage.style.animation = '';
            }
        }
        //I have to reset the combo
        if(this.#comboMaxPieces == 0){
            
            this.#comboMaxPieces = Settings.COMBO_MAXPIECES;
            this.#comboCounter = 0;
        }
    }

    /**
     * Check if the game has ended.
     * @returns {Boolean}
     */
    #checkForEnd(){
        //The game ends if you can not place any extra pieces that you have.

        for(let i = 0;i<this.draggablePieces.length;++i){
            
            if(this.#checkIfPieceFits(this.draggablePieces[i])){
                return false;
            }
        }
        return true;
    }
    /**
     * Check if a piece can be placed in any position of the board.
     * 
     * @param {Piece} piece
     */
    #checkIfPieceFits(piece){
        
        for(let i = 0;i < Settings.HEIGHT_CELLS;++i){
            for(let j = 0;j < Settings.WIDTH_CELLS;++j){
                //if(this.board[i][j] == 0)
                    if(this.checkIfPieceFitsCoords(piece,j,i)){
                        return true;
                    }
            }
        }

        
        return false;
    }
    /**
     * Check if a piece fits in the board, given X and Y.
     * 
     * @param {Piece} piece
     * @param {Number} x 
     * @param {Number} y
     */
    checkIfPieceFitsCoords(piece,x,y){
        for(let i = 0;i<piece.pattern.height;++i){
            for(let j = 0;j<piece.pattern.width;++j){
                if(piece.pattern.matrix[i][j] == 1){
                    if(this.board[y + i] == undefined || this.board[y + i][x + j] != 0){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Delete lines (row/column) filled with squares.
     * @param {{"type":String,line:Number}[]} array
     * @param {Boolean} animation 
     */
    #deleteFilledLines(array,animation = true){
        
        for(let line of array){
            if(line.type == "row"){
                let i = 0;
                //Before removing the pieces, I add to them an effect
                for(let j = 0;j < Settings.WIDTH_CELLS;++j){
                    if(animation){
                        document.getElementById("piece"+j+"."+line.line).classList.add("completed-line");
                        this.#updateScore(Settings.SCORE_INCREASE,false);
                    }
                    this.board[line.line][j] = 0;
                }
                //Then I start the destruction animation
                setTimeout(() => {
                    let int = setInterval(() => {
                        if(animation)
                            this.#updateScore(Settings.SCORE_INCREASE,true);
                        
                        //Remove all pieces in a row
                        Square.destroyPiece(i,line.line);
                        if(++i == Settings.WIDTH_CELLS)
                            clearInterval(int);
                    }, Settings.LINE_TIMEOUT/2);
                }, 50);
              

            }
            if(line.type == "column"){
                let i = 0;
                //Before removing the pieces, I add to them an effect
                    for(let j = 0;j < Settings.HEIGHT_CELLS;++j){
                        if(animation){
                            document.getElementById("piece"+line.line+"."+j).classList.add("completed-line");
                            this.#updateScore(Settings.SCORE_INCREASE,false);
                        }
                        this.board[j][line.line] = 0;
                    }
                //Then I add the descrution animation
                setTimeout(() => {
                    let int = setInterval(() => {
                        if(animation)
                            this.#updateScore(Settings.SCORE_INCREASE,true);
                        //Remove all pieces in a random column
                        Square.destroyPiece(line.line,i);
                        if(++i == Settings.HEIGHT_CELLS)
                            clearInterval(int);
                    }, Settings.LINE_TIMEOUT / 2);
                }, 50);
                

            }
        }

      
        
    }
    /**
     * Update draggable piece.
     * @param {Piece} piece
     * @returns {Boolean} If you have updated the pieces.
     */
    #updateDraggablePieces(piece){
        //Remove the piece from the array
        for(let i = 0;i<this.draggablePieces.length;++i)
            if(this.draggablePieces[i] == piece)
                this.draggablePieces.splice(i,1);

        //If I add to add another piece
        if(this.draggablePieces.length == 0){
            this.#createSelectPieces(false);
            return true;
        }
        return false;
    }

    /**
     * Check if there are equals rows or columns.
     * 
     * @param {Number[][]} board It may be different from the game board.
     * @returns {{"type":String,line:Number}[]}
     */
    #checkLines(board){
        let result = [];
        //Check rows
        for(let i = 0;i < Settings.HEIGHT_CELLS;++i){
            let cont = 0;
            while(cont < Settings.WIDTH_CELLS && board[i][cont] != 0)
                ++cont;
            if(cont == Settings.WIDTH_CELLS)
                result.push({"type":"row",line:i})
        }
        //Check column
        for(let i = 0;i < Settings.WIDTH_CELLS;++i){
            let cont = 0;
            while(cont < Settings.HEIGHT_CELLS && board[cont][i] != 0)
                ++cont;
            if(cont == Settings.HEIGHT_CELLS)
                result.push({"type":"column",line:i});
        }

        return result;

    }


    /**
     * Check if a shadow would destroy a line if placed at a specific point.
     * @param {Piece} piece
     * @param {Number} x
     * @param {Number} y
     */
    checkIfShadowDestroyLines(piece,x,y){
        let items = document.querySelectorAll(".completed-line")
        items.forEach(element => {
            element.classList.remove("completed-line")
        });
        if(!this.checkIfPieceFitsCoords(piece,x,y))
            return;
        let copyBoard = this.board.map(el=>[...el]);
        

         for(let i = 0;i<piece.pattern.height;++i){
            for(let j = 0;j<piece.pattern.width;++j){
                if(piece.pattern.matrix[i][j] == 1){
                    if(copyBoard[y+i] != undefined && copyBoard[y+i][x+j] != undefined)
                        copyBoard[y+i][x+j] = piece.color;
                }
            }
        }

        let array = this.#checkLines(copyBoard);
        
        for(let line of array){
            if(line.type == "row"){
                //Effect    
                for(let j = 0;j < Settings.WIDTH_CELLS;++j){
                    if(document.getElementById("piece"+j+"."+line.line) != null)
                        document.getElementById("piece"+j+"."+line.line).classList.add("completed-line");
                    else{
                        //console.log("row->",j,line.line);
                        
                        //document.getElementById("shadow"+line.line+"."+j).classList.add("completed-line");
                    }
                }
            }
            if(line.type == "column"){
                for(let j = 0;j < Settings.HEIGHT_CELLS;++j){
                    if(document.getElementById("piece"+line.line+"."+j) != null)
                        document.getElementById("piece"+line.line+"."+j).classList.add("completed-line");
                    else{
                        //console.log("column->",line.line,j);
                        
                        //document.getElementById("shadow"+j+"."+line.line).classList.add("completed-line");
                        
                    }
                }
            }
        }
    }

    /**
     * Update current score.
     * 
     * @param {Number} delta
     * @param {Boolean} graphic
     */
    #updateScore(delta,graphic){
        //Increase the base value of delta considersing the combo counter
        let increase = Math.pow(Settings.SCORE_EXPONENTIAL,this.#comboCounter);
        

        if(graphic){
            let score = parseInt(document.getElementById("currentScore").textContent);
            let newGraphicScore = score + Math.round(delta*increase);
            let currentScore = document.getElementById('currentScore');
            currentScore.textContent = newGraphicScore;

            currentScore.classList.add('score-increased');
            //Reflow
            currentScore.offsetTop;
            //Remove class
            currentScore.addEventListener("animationend",()=>{
                currentScore.classList.remove('score-increased');
            });

            //Check for bestScore
            if(newGraphicScore >= this.#bestScore){
                document.getElementById("bestScore").textContent = newGraphicScore;
            }
        }
        else{
            this.#score+= Math.round(delta*increase);
            if(this.#score > this.#bestScore)
                this.#bestScore = this.#score;
        }
    }

    /**
     * Save the current state of the game in local storage.
     */
    #saveGameState(){
        let data = {};
        data["score"] = this.#score;
        data["bestScore"] = this.#bestScore;
        data["draggablePieces"] = this.draggablePieces;
        data["board"] = this.board;
        data["comboCounter"] = this.#comboCounter;
        data["comboMaxPieces"] = this.#comboMaxPieces;

        //Save to localStorage
        localStorage.setItem("data",JSON.stringify(data));

        localStorage.setItem("bestScore",this.#bestScore);
    }

    #clearGameState(){
        
        this.#score = 0;
        this.draggablePieces.length = 0;
        this.board.length = 0;

        this.#comboCounter = 0;
        this.#comboMaxPieces = Settings.COMBO_MAXPIECES;
        localStorage.removeItem("data");
    }

    /**
     * Check for a game saved in the local storage.
     * 
     * Returns if a game has been found.
     * 
     * @returns {Boolean}
     */
    #checkSavedGame(){
        let data = localStorage.getItem("data");


        let bestScore = localStorage.getItem("bestScore") || 0;
        
        this.#bestScore = +bestScore;
        document.getElementById("bestScore").textContent = this.#bestScore;

        if(data != null){
            let dataParsed = JSON.parse(data);

            this.#score = +dataParsed["score"];
            
            document.getElementById("currentScore").textContent = this.#score;

            

            //I have to recreate Piece object
            
            for(let piece of dataParsed["draggablePieces"])
                this.draggablePieces.push(new Piece(false,piece.pattern,piece.color));
                
            this.board = dataParsed["board"];
            //Adjust size settings
            Settings.HEIGHT_CELLS = this.board.length;
            Settings.WIDTH_CELLS = this.board[0].length;


            this.#comboCounter = dataParsed["comboCounter"];
            this.#comboMaxPieces = dataParsed["comboMaxPieces"];

            return true;
        }

        return false;
        
    }
}
