import { Game } from "./Classes/Game.js";
import { Settings } from "./Classes/Settings.js";

window.onload = () =>{
    manageMeasures();

    new Game();
 
}

/**
 * Manages Settings size to work for every display.
 */
function manageMeasures() {
    
    //Leave space between content and borders (0.8)
    let width = window.innerWidth * 0.8;
    let height = window.innerHeight * 0.8;

    //Get probably cellSize based on height and width

    let probCellSizeHeight = height/(3 + Settings.HEIGHT_CELLS + Settings.MAX_PATTERN_SIZE*Settings.DEFAULT_SIZE_MODIFIER); 

    let probCellSizeWidth = (width/ Settings.WIDTH_CELLS);


    console.log(width,height);
    
    
    let smaller = Math.min(probCellSizeHeight,probCellSizeWidth);


    if(smaller <= Settings.MAX_CELL_SIZE ){
        Settings.CELL_SIZE = smaller;
        Settings.setCSS();
    }
}

window.onresize = manageMeasures;

/**
 * Get total height of your containers.
 * @param {Number} size
 */
function getContentHeight(size) {
    return size * 2 + Settings.HEIGHT_CELLS*size+Settings.MAX_PATTERN_SIZE * size * Settings.DEFAULT_SIZE_MODIFIER; 
}

/**
 * Get total width of your containers
 * @param {Number} size 
 */
function getContentWidth(size) {
    return Settings.WIDTH_CELLS*size;
}