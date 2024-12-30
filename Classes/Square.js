import { Settings } from "./Settings.js";


/**
 * @typedef {import("./Settings.js").Color} Color
 */

/**
 * Represents a single square on the screen.
 */
export class Square{

    
    /**
     * Create an HTML element
     * @param {Number} x 
     * @param {Number} y 
     * @param {Color} color
     * @param {"normal" | "shrink"} size
     * @returns {HTMLElement}
     */
    static createElement(x,y,color,size){
        let div = document.createElement("div");
        div.style.setProperty("--x",x);
        div.style.setProperty("--y",y)
        div.setAttribute("data-color",color);
        div.className = "cell "+size;
        div.id = "piece"+x+"."+y;
        return div;
    }


    /**
     * Graphically remove a square from the board.
     * @param {Number} x 
     * @param {Number} y  
     */
    static destroyPiece(x,y) {
        
        let piece = document.getElementById("piece"+x+"."+y);
        if(piece == null){
            return;
        }
        let color = piece.getAttribute("data-color");

        let pieceX = x * Settings.CELL_SIZE + Settings.CELL_SIZE / 2;
        let pieceY = y * Settings.CELL_SIZE + Settings.CELL_SIZE / 2;

        //Add 30 particles
        for (let i = 0; i < Settings.PARTICLES; i++) {
            const particle = document.createElement('div');
            particle.setAttribute("data-color",color)
            particle.classList.add('particle');

            //Position particle in the center
            particle.style.left = `${pieceX - 2.5}px`;
            particle.style.top = `${pieceY - 2.5}px`;

            //Create a random movement
            const randomAngle = Math.random() * 360;
            const randomDistance = Math.random() * 100 + 30;
            const xOffset = Math.cos(randomAngle) * randomDistance;
            const yOffset = Math.sin(randomAngle) * randomDistance;

            //Move particle by setting css variables
            particle.style.setProperty('--x', `${xOffset}px`);
            particle.style.setProperty('--y', `${yOffset}px`);

            //Add to the board
            document.querySelector('#gameContainer').appendChild(particle);
            //Remove after the animation has ended
            
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }

        //And finally remove the piece
        piece.remove();
    }
}