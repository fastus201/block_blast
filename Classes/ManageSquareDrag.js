import { Settings } from "./Settings.js";

import {Piece} from "./Piece.js";

import { Game } from "./Game.js";
import { Square } from "./Square.js";

/**
 * Manage Drag.js event, the following functions are called on each event crated in Drag.js.
 * 
 * Doing this, logic remains the same for each element that I want to drag using Drag.js.
 */


export class ManageSquareDrag{
    /**
     * If this class completeley manages element movements.
     */
    static MANAGE_MOVEMENT = true;

    /**
     * Instance of Game
     * @type {Game}
     */
    static game;


    /**
     * @type {String}
     */
    #className;

    /**
     * @type {HTMLElement}
     */
    #element;

    /**
     * Current position of the piece.
     * @type {Number}
     */
    #currentX;
    /**
     * Current position of the piece.
     * @type {Number}
     */
    #currentY;
    /**
     * Piece object.
     * @type {Piece}
     */
    #piece;
    /**
     * @param {HTMLElement} element
     * @param {Piece} piece
     */
    constructor(element,piece){
        this.#element = element;
        this.#className = element.classList.item(2);
        this.#piece = piece;
    }

    /**
     * Called when the piece is first clicked by the user.
     */
    manageDragMouseDown(){
        [this.#currentX,this.#currentY] = this.#getPositionXY();

        
        //When you first click on the piece, I have to enlarge it 
        this.#affectAllSquares((/*** @type {HTMLElement}*/item)=>{
            
            if(item.classList.contains("shrink")){
                item.classList.remove("shrink");
                item.style.left = (item.offsetLeft - this.#piece.startX * Settings.CELL_SIZE * (1 - Settings.SIZE_MODIFIER)  ) + "px";
                
                item.style.top = (item.offsetTop - Settings.CELL_SIZE*2) + "px";
            }

            item.classList.add("moving");
            
        });
    }

    /**
     * Called while the piece is being move around.
     * @param {Number} deltaX How much the cursor moved to the left.
     * @param {Number} deltaY How much the cursor moved to the Top.
     */
    manageElementDrag(deltaX,deltaY){
        [this.#currentX,this.#currentY] = this.#getPositionXY();
        
        //Remove shadow
        this.#piece.removeShadows();
        //Show a shadow over the board
        this.#showShadow();

        //Check if the shadow, if placed, would destroy a line
        ManageSquareDrag.game.checkIfShadowDestroyLines(this.#piece,this.#currentX,this.#currentY);
        
      
        //I have to move all squares that form my piece
        this.#affectAllSquares((item)=>{
            item.style.left = (item.offsetLeft - deltaX) + "px";
        });
        this.#affectAllSquares((item)=>{
            item.style.top = (item.offsetTop - deltaY) + "px";
         });
            
    }

    /**
     * Called when the piece is released.
     */
    manageCloseDragElement(){
        
        //Check if the piece fits in the matrix
        let fit = ManageSquareDrag.game.checkIfPieceFitsCoords(this.#piece,this.#currentX,this.#currentY);

        //Always do:
        this.#affectAllSquares((el)=>{
            el.classList.replace("moving","shrink");
        })

        if(fit){
            this.#piece.removeShadows();
            this.#stickPieceOnBoard(this.#piece,this.#currentX,this.#currentY);
        }
        else{
            //I have to move back the piece to its original position.
            this.#moveBackPiece();

        }
        
    }


    /**
     * Move back a piece to its original position.
     */
    #moveBackPiece(){
        this.#affectAllSquares((/**@type {HTMLElement}*/element)=>{
                let x = parseInt(element.getAttribute("relative-x"));
                let y = parseInt(element.getAttribute("relative-y"));
                element.style.left = "";
                element.style.top = "";
                element.style.transition = ".15s linear";
                element.style.setProperty("--x",this.#piece.startX + x);
                element.style.setProperty("--y",this.#piece.startY + y );
                element.style.pointerEvents = "none";
                element.addEventListener("transitionend",()=>{
                    element.style.transition = "none";
                    element.style.pointerEvents = "all";

                });
                
            });
    }

      /**
     * Stick the piece on the board.
     */
    #stickPieceOnBoard(){
        this.#affectAllSquares(/**@type {HTMLElement}*/element=>{
            element.remove();
        });

        let pattern = this.#piece.pattern;
        for(let i = 0;i<pattern.height;++i){
            for(let j = 0;j<pattern.width;++j){
                if(pattern.matrix[i][j] == 1){
                    let div = Square.createElement(this.#currentX+j ,this.#currentY+i,this.#piece.color,"big");
                    div.classList.add("piece-dropped");
                    div.addEventListener("animationend",()=>{
                        div.classList.remove("piece-dropped");
                    });
                    document.getElementById("gameContainer").append(div);
                }
            }
        }
        ManageSquareDrag.game.updateBoard(this.#piece,this.#currentX,this.#currentY);


    }

    
    /**
     * Get the relative position of the piece that it is being moved (relative to the #gameContainer).
     * @returns {[Number,Number]}
     */
    #getPositionXY(){
        //Note: my piece position is relative to the nextPieceContainer
        //Note: i need the position relative to the gameContainer
        //Note: left property has the same value (the two 2 containers are vertically aligned)
        let pieceX = this.#element.offsetLeft;

        //Get the difference between offsetTop of the 2 containers
        let absoluteTopPosition = document.getElementById("nextPiecesContainer").offsetTop - document.getElementById("gameContainer").offsetTop;

        let pieceY = absoluteTopPosition + this.#element.offsetTop;
        
        //Now I need to compute the first X,Y of the piece

        //Get x and y relative to my pattern
        let relativeX = parseInt(this.#element.getAttribute("relative-x"));
        let relativeY = parseInt(this.#element.getAttribute("relative-y"));

        return [Math.round(pieceX / Settings.CELL_SIZE) - relativeX,Math.round(pieceY / Settings.CELL_SIZE) - relativeY];
    }

    /**
     * Show a shadow (if possible) where the piece can be left on the game board.
     * 
     * @returns {Booolean} If the piece can be placed.
     */
    #showShadow(){
        //Out of the board
        if(this.#currentX < 0 || this.#currentY < 0 || this.#currentX >= Settings.WIDTH_CELLS || this.#currentY >= Settings.HEIGHT_CELLS)
            return false;

        //Check if the piecePattern fits in the board
        let result = ManageSquareDrag.game.checkIfPieceFitsCoords(this.#piece,this.#currentX,this.#currentY);

        if(result){
            //Ok, I have to show the shadow
            this.#piece.createShadow(this.#currentX,this.#currentY);
        }

    }
    
    /**
     * Execute a function on each squares that forms a piece.
     * @param {Function} func 
     */
    #affectAllSquares(func){
        document.querySelectorAll("."+this.#className).forEach(item=>{
            func(item);
        });
    }


}