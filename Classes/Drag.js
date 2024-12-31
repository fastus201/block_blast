/**
 * @typedef {{"manageDragMouseDown":Function,"manageElementDrag":Function,"manageCloseDragElement":Function}} EventManager 
 */

/**
 * Make element draggable.
 */
export class Drag {
    /**
     * Make an HTML element draggable.
     * @param {HTMLElement} element 
     * @param {Class} eventManager Manages drag event.
     * @param {Object} data Data to be passed to each manager.
     */
    static addDrag(element, eventManager, data) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;
        element.addEventListener("touchstart", dragTouchStart, { passive: false });

        /**
         * @type {EventManager}
         */
        let manageDrag = new eventManager(element, data);

        /**
         * @description Called as soon as you click or touch the element.
         * @param {MouseEvent | TouchEvent} e Event object.
         */
        function dragMouseDown(e) { 
            startDrag(e, false);
        }

        function dragTouchStart(e) {
            startDrag(e, true);
        }

        /**
         * Initialize dragging for both mouse and touch events.
         * @param {MouseEvent | TouchEvent} e Event object.
         * @param {boolean} isTouch Whether the event is from touch.
         */
        function startDrag(e, isTouch) {
            e = e || window.event;
            e.preventDefault(); // Prevent default behavior (scrolling).

            const event = isTouch ? e.touches[0] : e;

            // Get the initial cursor position:
            pos3 = event.clientX;
            pos4 = event.clientY;

            if (isTouch) {
                document.addEventListener("touchend", closeDragElement, { passive: false });
                document.addEventListener("touchmove", elementDrag, { passive: false });
            } else {
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            // Calls what manageDrag has to do
            manageDrag.manageDragMouseDown();
        }

        /**
         * Called when you are moving the piece around
         * @param {MouseEvent | TouchEvent} e Event object.
         */
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault(); // Prevent default behavior (scrolling or other gestures).

            const event = e.touches ? e.touches[0] : e;

            // Calculate the new cursor position:
            pos1 = pos3 - event.clientX;
            pos3 = event.clientX;

            pos2 = pos4 - event.clientY;
            pos4 = event.clientY;

            if (!eventManager.MANAGE_MOVEMENT) {
                element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.top = (element.offsetTop - pos2) + "px";
            }

            // Calls what manageDrag has to do
            manageDrag.manageElementDrag(pos1, pos2);
        }

        /**
         * Called when the element is released
         */
        function closeDragElement() {  
            /* Stop moving when mouse button is released: */
            document.removeEventListener("touchend", closeDragElement, { passive: false });
            document.removeEventListener("touchmove", elementDrag, { passive: false });
            document.onmouseup = null;
            document.onmousemove = null;

            // Calls what manageDrag has to do
            manageDrag.manageCloseDragElement(pos1, pos2);
        }
    }
}
