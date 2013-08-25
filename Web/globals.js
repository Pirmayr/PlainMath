/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global MathJax, alert, event, accessor*/

/**
 * Determines, if the the program is running on a touch-device.
 * @returns {boolean} Program running on a touch-device?
 */
function isTouchDevice() {
    "use strict";
    if ((navigator.userAgent.match(/android 3/i)) || (navigator.userAgent.match(/honeycomb/i))) {
        return false;
    }
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Makes element with given id scrollable on a touch-device.
 * @param id Id of the element to be made scrollable.
 */
function touchScroll(id) {
    "use strict";
    var scrollStartPosY, scrollStartPosX;
    if (isTouchDevice()) {
        scrollStartPosY = 0;
        scrollStartPosX = 0;
        document.getElementById(id).addEventListener("touchstart", function (event) {
            //noinspection JSUnresolvedVariable
            scrollStartPosY = this.scrollTop + event.touches[0].pageY;
            //noinspection JSUnresolvedVariable
            scrollStartPosX = this.scrollLeft + event.touches[0].pageX;
        }, false);

        document.getElementById(id).addEventListener("touchmove", function (event) {
            //noinspection JSUnresolvedVariable
            if ((this.scrollTop < this.scrollHeight - this.offsetHeight && this.scrollTop + event.touches[0].pageY < scrollStartPosY - 5) || (this.scrollTop !== 0 && this.scrollTop + event.touches[0].pageY > scrollStartPosY + 5)) {
                event.preventDefault();
            }
            //noinspection JSUnresolvedVariable
            if ((this.scrollLeft < this.scrollWidth - this.offsetWidth && this.scrollLeft + event.touches[0].pageX < scrollStartPosX - 5) || (this.scrollLeft !== 0 && this.scrollLeft + event.touches[0].pageX > scrollStartPosX + 5)) {
                event.preventDefault();
            }
            //noinspection JSUnresolvedVariable
            this.scrollTop = scrollStartPosY - event.touches[0].pageY;
            //noinspection JSUnresolvedVariable
            this.scrollLeft = scrollStartPosX - event.touches[0].pageX;
        }, false);
    }
}
