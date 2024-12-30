import { Settings } from "./Settings.js";


/**
 * @typedef {{"matrix":Number[][],"width":Number,"height":Number}} Pattern
 */
export class DefaultPattern{
    /**
     * All possible patterns that a piece can form.
     * 
     * Do not contains same patterns with different rotations!
     * @type {Pattern[]}
     */
    static patterns = [
        {
            matrix:[
                [1],
                [1],
                [1]
            ],
            width:1,
            height:3
        },
        {
            matrix:[
                [1,1],
                [0,1],
                [0,1]
            ],
            width:2,
            height:3
        },
       {
            matrix:[
                [1,1],
                [1,0],
                [1,0]
            ],
            width:2,
            height:3
        },
        
        {
            matrix:[
                [0,1,0],
                [1,1,1]
            ],
            width:3,
            height:2
        },
        {
            matrix:[
                [1,1],
                [1,1]
            ],
            width:2,
            height:2
        },
        {
            matrix:[
                [1,1,0],
                [0,1,1],

            ],
            width:3,
            height:2
        },
        {
            matrix:[
                [1],
                [1],
                [1],
                [1],
            ],
            width:1,
            height:4
        },
        {
            matrix:[
                [1,1,1],
                [1,0,0],
                [1,0,0]
            ],
            width:3,
            height:3
        },
        {
            matrix:[
                [1,1,1],
                [1,1,1],
                [1,1,1]
            ],
            width:3,
            height:3
        },
        {
            matrix:[
                [1],
            ],
            width:1,
            height:1
        }
        
    ]


    /**
     * Returns a random pattern.
     * @returns {Pattern}
     */
    static getRandomPattern(){
        let randPattern = {...this.patterns[Math.floor(Math.random() * this.patterns.length)]};
        //let randPattern = {...this.patterns[4]};
        //How many times I rotate the matrix
        let randomRotations = Math.floor(Math.random()*3) + 1;

        this.rotateMatrix(randPattern,randomRotations);

        
        return randPattern;
    }

    /**
     * Rotate a matrix by 90 degrees n times.
     * @param {Pattern} pattern 
     * @param {Number} n
     */
    static rotateMatrix(pattern,n){
        n%=4;
        for(let i = 0;i < n;++i){
            const matrix = pattern.matrix;

            //Avoid reference problems
            let blankMatrix = this.createBlankMatrix(pattern.height,pattern.width);

            for (let i = 0; i < pattern.height; ++i) {
                for (let j = 0; j < pattern.width; ++j) {
                    //Swap elements
                    blankMatrix[pattern.width - 1 - j][i] = matrix[i][j];
                }
            }

            //Reverse height and width of the matrix
            [pattern.width,pattern.height] = [pattern.height,pattern.width];
            
            pattern.matrix = blankMatrix;
        }

    }  
    

    /**
     * Create a new matrix filled with 0.
     * @param {Number} width
     * @param {Number} height
     * @returns {Number[][]}
     */
    static createBlankMatrix(width,height){

        let matrix = [];
        for(let i = 0;i < height;++i){
            matrix[i] = [];
            for(let j = 0;j < width;++j)
                matrix[i][j] = 0;
            
        }
        
        return matrix;

    }

}