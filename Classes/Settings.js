/**
 * @typedef {"red"|"green"|"yellow"|"purple"|"orange"|"blue"} Color
 */


/**
 * Class that contains game settings.
 */
export class Settings{
    
    /**
     * Board width (in number of cells).
     */
    static WIDTH_CELLS = 8;
    /**
     * Board height (in number).
     */
    static HEIGHT_CELLS = 8;

    /**
     * Cell size (in pxs)
     */
    static CELL_SIZE = 60;
    
    /**
     * Max value that CELL_SIZE can have
     * 
     */
    static MAX_CELL_SIZE = 70;
    /**
     * Array of colors that the pieces may have.
     * @type {Color[]}
     */
    static COLORS = ["red","green","yellow","purple","orange","blue"];

    /**
     * How many pieces to be placed you can visualize
     */
    static NEXT_PIECES = 3;

    /**
     * Size of all pattern matrix.
     */
    static MAX_PATTERN_SIZE = 4;

    
    /**
     * Default value for SIZE_MODIFIER
     */
    static DEFAULT_SIZE_MODIFIER = 0.7

    /**
     * Size of smaller squares.
     */
    static SIZE_MODIFIER = this.DEFAULT_SIZE_MODIFIER;
    /**
     * Time spent for animate each line destruction.
     */
    static LINE_TIMEOUT = 65;

    /**
     * Number of particles spawned when a square is destroyed.
     */
    static PARTICLES = 5;

    /**
     * How much you get for each squared destroyed.
     */
    static SCORE_INCREASE = 10;

    /**
     * How many pieces you can place without losing the combo.
     */
    static COMBO_MAXPIECES = 4;

    /**
     * Exponential increase of the score. (score+= SCORE_INCREASE*SCORE_EXPONENTIAL^COMBO)
     */
    static SCORE_EXPONENTIAL = 1.4;

    /**
     * Set static const as css variables.
     */
    static setCSS(){
        document.querySelector(":root").style.setProperty("--WIDTH_CELLS",this.WIDTH_CELLS);
        document.querySelector(":root").style.setProperty("--HEIGHT_CELLS",this.HEIGHT_CELLS);
        document.querySelector(":root").style.setProperty("--CELL_SIZE",this.CELL_SIZE);
        document.querySelector(":root").style.setProperty("--SIZE_MODIFIER",this.SIZE_MODIFIER);
        document.querySelector(":root").style.setProperty("--DEFAULT_SIZE_MODIFIER",this.DEFAULT_SIZE_MODIFIER);

        document.querySelector(":root").style.setProperty("--MAX_PATTERN_SIZE",this.MAX_PATTERN_SIZE);
    }

    /**
     * Get a random color chosen between possible colors that a piece can get.
     * @param {Number} number Numbers of colors that you need
     * @returns { Color | Color[]}
     */
    static getRandomColor(number=1){
        if(number == 1)
            return this.COLORS[Math.floor(Math.random()* this.COLORS.length) ];

        //You may want more than 1 color
        let colors = [...this.COLORS];

        for(let i = 0;i<this.COLORS.length - number;++i){
            let randIndex = Math.floor(Math.random() * this.COLORS.length);
            colors.splice(randIndex,1);
        }
        return colors;
    }

}