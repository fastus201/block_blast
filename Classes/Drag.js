
/**
 * @typedef {{"manageDragMouseDown":Function,"manageElementDrag":Function,"manageCloseDragElement":Function}} EventManager 
 */


/**
 * Make element draggable.
 */
export class Drag{
    /**
     * Make an HTML element draggable.
     * @param {HTMLElement} element 
     * @param {Class} eventManager Manages drag event.
     * @param {Object} data Data to be passed to each manager.
     */
    static addDrag(element,eventManager,data) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        
        element.onmousedown = dragMouseDown;
        
        /**
         * @type {EventManager}
         */
        let manageDrag = new eventManager(element,data);
        /**
         * @description Called as soon as you click on the piece.
         * @param {Event} e Mouse event.
         */
        function dragMouseDown(e) { 
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
            
            //Calls what manageDrag has to do
            manageDrag.manageDragMouseDown();
        }
        /**
         * Called when you are moving the piece around
         * @param {Event} e Mouse event
         */
        function elementDrag(e) {   
            e = e || window.event;
            e.preventDefault();

            // calculate the new cursor position:
            //DESTRA E SINISTRA
            pos1 = pos3 - e.clientX;
            pos3 = e.clientX;
            
            //Top and bottom
            pos2 = pos4 - e.clientY;
            pos4 = e.clientY;

            if(!eventManager.MANAGE_MOVEMENT){
                element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.top = (element.offsetTop - pos2) + "px";
            }
            //Calls what manageDrag has to do
            manageDrag.manageElementDrag(pos1,pos2);

        }
        /**
         * Called when the element is released
         */
        function closeDragElement() {  
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;

            //Calls what manageDrag has to do
            manageDrag.manageCloseDragElement(pos1,pos2);
            
        }
    }
}

