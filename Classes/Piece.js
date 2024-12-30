import { DefaultPattern } from "./DefaultPattern.js";
import { Settings } from "./Settings.js";
import {Square} from "./Square.js";
import { Drag } from "./Drag.js";
import { ManageSquareDrag } from "./ManageSquareDrag.js";

/**
 * @typedef {import("./Settings.js").Color} Color
 * @typedef {import("./DefaultPattern.js").Pattern} Pattern
 */

export class Piece{
    
    /**
     * How are squared located
     * @type {Pattern}
     */
    pattern;
    /**
     * @type {String}
     */
    color;
    
    /**
     * @type {Number}
     */
    startX;
    /**
     * @type {Number}
     */
    startY;
    constructor(random=true,pattern,color=""){
        /**
        * By default, each Piece is randomly created
        */
        if(random)
            this.pattern = DefaultPattern.getRandomPattern();
        else{
            this.pattern = pattern;
        }
        if(color.length == 0)
            this.color = Settings.getRandomColor();
        else
            this.color = color;
    }


    /**
     * Get all possible pieces.
     * @returns {Piece[]}
     */
    static getAllPieces(){
        let result = [];
        for(let i = 0;i < DefaultPattern.patterns.length;++i){
            for(let j = 0;j < 4;++j){
                let pattern = {...DefaultPattern.patterns[i]};

                DefaultPattern.rotateMatrix(pattern,j);
                
                result.push(new Piece(false,pattern));
            }
        }

        
        return result;

    }

    /**
     * Create an HTML element
     * @param {Number} startX 
     * @param {Number} startY 
     * @param {Numner} contPiece
     */
    createElement(startX,startY,contPiece){
        this.startX = startX;
        this.startY = startY;

        //Piece are created with shrink mode actived
        for(let i = 0;i < this.pattern.height;++i){
            for(let j = 0;j < this.pattern.width;++j){
                if(this.pattern.matrix[i][j] == 1){
                    let div = Square.createElement(startX+j + Settings.WIDTH_CELLS + 2,startY+i,this.color,"shrink");
                    //I do not an id for the Piece
                    div.removeAttribute("id");
                    //To get the relative position of the square (relative to the piece pattern)
                    div.setAttribute("relative-x",j);
                    div.setAttribute("relative-y",i);

                    //Adjust class (for smaller squares)
                    div.classList.add("nextPiece-"+contPiece,"hidden");

                    //Make element draggable
                    Drag.addDrag(div,ManageSquareDrag,this);
                    document.getElementById("nextPiecesContainer").append(div)
                }
            }

        }
    }

    /**
     * Create a shadow of the piece.
     * @param {Number} startX
     * @param {Number} startY
     */
    createShadow(startX,startY){
        //Container is always the same
        let container = document.getElementById("gameContainer");

        for(let i = 0;i<this.pattern.height;++i){
            for(let j = 0;j<this.pattern.width;++j){
                if(this.pattern.matrix[i][j] == 1){
                    if(document.getElementById("shadow"+(startY+i)+"."+(startX + j)) == null){

                        let div = document.createElement("div");
                        div.className = "shadow";
                        
                        div.setAttribute("data-color",this.color)
                        div.id = "shadow"+(startY+i)+"."+(startX + j);
                        div.style.setProperty("--x",startX +j);
                        div.style.setProperty("--y",startY+ i);
                        container.append(div);
                    }
                }
            }
        }

    }

    /**
     * Remove all the shadow of a piece.
     */
    removeShadows(){
        let el = document.querySelectorAll(".shadow");
        for(let element of el)
            element.remove();
    }



   
}

