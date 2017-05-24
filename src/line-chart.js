/*!
 * cs-charts
 * Copyright(c) 2017 ClearScore
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 * @private
 */

import invariant from "invariant";
import Marker from "./marker.js";

/**
 * Module exports.
 * @public
 */

module.exports = class {

    constructor(obj) {

        this.options = obj;

        this.Snap = obj.snap;
        this.divContainer = obj.container;
        this.scrollContainer = obj.scroll;
        this.array = obj.data;
        this.biggestValue = obj.biggestVal;
        this.width = obj.width || 100;
        this.allow = 1;
        this.handleOffset = this.width / 2;
        this.lineString = "";
        this.color = obj.color || "#fff";
        this.labelFormatter = obj.label;
        this.children = obj.children;
        this.constant = obj.constant;

        this.drawScrollComponent();

        this.addEvents();

        this.plot();

        this.addMarker();
    }

    /**
     * destroy the line
     */
    destroy() {
        this.container.removeChild(this.container.childNodes[0]);
        if (this.marker) {
            this.marker.destroy();
        }
    }

    /**
     * set the line to the current one in view
     */
    setCurrent() {
        this.line.animate({
            strokeWidth: 2
        }, 400);
        this.bg.attr({
            fill: this.bgFill
        }, 400);
        if (this.marker) {
            this.marker.setCurrent();
        }
    }

    /**
     * set the line to a background line
     */
    setInView() {
        this.line.animate({
            strokeWidth: 1
        }, 400);
        this.bg.attr({
            fill: this.whiteFill
        }, 400);
        this.marker.hide();
    }

    /**
     * set the line to invisible
     */
    hide() {
        this.line.animate({
            strokeWidth: 0
        }, 400);
        this.bg.attr({
            fill: "none"
        }, 400);
        this.marker.hide();
    }

    /* --------------------------------------
     CHANGE LINE PROPERTIES END
     -------------------------------------- */

    /* --------------------------------------
     HELPER FUNCTIONS START
     -------------------------------------- */

    /**
     * correct the data to be the right position on the graph (within the svg element)
     * @param value
     * @param rangeA
     * @param rangeB
     * @param limit
     * @returns {*}
     */
    modulate(value, rangeA, rangeB, limit) {
        invariant(value !== undefined, "You have not supplied a value");
        invariant(rangeA, "You have not supplied a range to modulate from");
        invariant(rangeB, "You have not supplied a range to modulate to");

        if (limit === null) {
            limit = false;
        }

        const [fromLow, fromHigh] = rangeA;
        const [toLow, toHigh] = rangeB;

        const result = toLow + (((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow));

        if (limit === true) {
            if (toLow < toHigh) {
                if (result < toLow) return toLow;
                if (result > toHigh) return toHigh;
            } else {
                if (result > toLow) return toLow;
                if (result < toHigh) return toHigh;
            }
        }

        return result;
    };

    /**
     * find and correct the current value
     * @param index
     * @returns {*}
     */
    convert(index) {
        // invariant(index === undefined, "You have not supplied an index for the array to convert the value.");
        const convertedNumber = this.modulate(this.array[index][1], [0, this.biggestValue], [this.canvasHeight, 4]);
        // console.log(convertedNumber);
        return convertedNumber;
    }

    /**
     * get the mdeian value of an array
     * @param values
     * @returns {*}
     */
    median(array) {

        const arrayCopy = array.slice(0);
        const half = Math.floor(arrayCopy.length / 2);

        arrayCopy.sort(function (a, b) {
            return a[1] - b[1];
        });

        if (arrayCopy.length % 2) {
            return arrayCopy[half][1];
        }

        return (arrayCopy[half - 1][1] + arrayCopy[half][1]) / 2.0;

    }

    /**
     * convert hex colour without alpha to rgba
     * @param hex
     * @param alpha
     * @returns {*}
     */
    hexToRgb(hex, alpha) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        return result ? `rgba(${r}, ${g}, ${b}, ${alpha})` : null;
    }

    /* --------------------------------------
     HELPER FUNCTIONS END
     -------------------------------------- */

    /* --------------------------------------
     GETTERS START
     -------------------------------------- */

    /**
     * gets the scroll div
     * @param scroll
     */
    getScroll(scroll) {
        invariant(scroll, "You need to supple an svg element to get.");
        this.scroll = document.getElementById(scroll);
    }

    /**
     * gets the canvas on the page to insert the svg into
     * @param container
     */
    getCanvas(container) {
        invariant(container, "You need to supple an svg element to get.");
        this.container = document.getElementById(container);
    }

    /**
     * get the previous and next handle positions for the current node on the path
     * @param index
     * @param thisValue
     * @returns {{x1: number, y1: number, x2: *, y2: *}}
     */
    getHandles (index, thisValue) {
        // invariant(index, 'You have not supplied an index for the array to get the handles.');

        if (thisValue === null) {
            thisValue = this.convert(index);
        }

        let x1 = index * this.width - this.handleOffset;
        let x2 = index * this.width + this.handleOffset;

        const next = this.findNext(index);
        const prev = this.findPrev(index);
        console.log(next, prev);

        const prevDiffHandleOffset = prev.diff / 2;
        const nextDiffHandleOffset = next.diff / 2;
        let y1 = thisValue - nextDiffHandleOffset;
        let y2 = thisValue + nextDiffHandleOffset;

        if ((prev.diff < 0 && next.diff < 0) || (prev.diff > 0 && next.diff > 0)) {

            const handleDiff = ((prevDiffHandleOffset * next.diff) - (nextDiffHandleOffset * next.diff)) / (next.diff + prev.diff);

            y1 -= handleDiff;
            y2 += handleDiff;

            // // fixing overshoots
            // if ((next.diff > 0 && y2 > next.value) || (next.diff < 0 && y2 < next.value)) {
            //     x2 = index * this.width + ((this.handleOffset * next.diff) / (y2 - thisValue));
            //     y2 = next.value;
            // }
            // if ((prev.diff > 0 && y1 > prev.value) || (prev.diff < 0 && y1 < prev.value)) {
            //     x1 = index * this.width - ((this.handleOffset * prev.diff) / (y1 - thisValue));
            //     y1 = prev.value;
            // }

            // fixing within threshold but not overshooting
            if ((next.value - this.allow < y2) && (next.value + this.allow > y2)) {
                x2 -= this.handleOffset / 2;
                y2 -= (y2 - thisValue) / 2;
            }
            if ((prev.value - this.allow < y1) && (prev.value + this.allow > y1)) {
                x1 += this.handleOffset / 2;
                y1 += (y1 - thisValue) / 2;
            }
        }
        else {
            y1 = thisValue;
            y2 = thisValue;
        }
        // console.log({x1, y1, x2, y2});
        return {x1, y1, x2, y2};
    }

    /**
     * get the x and y coordinates of the intersection between vertical intersection line and current path
     */
    getIntersectionPoints(paths) {
        return this.snap.intersection();
    }

    /* --------------------------------------
     GETTERS END
     -------------------------------------- */

    /* --------------------------------------
     CREATE LINE START
     -------------------------------------- */

    /**
     * sets up the snap component on the chosen element
     * @param canvas
     */
    createSnapComponent(canvas) {
        invariant(canvas, "You have not supplied an element to create the snap instance.");
        let SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const parent = document.createElement("div");
        parent.appendChild(SVG);
        if (canvas.childNodes.length === 0) {
            this.contentWidth = (this.array.length - 1) * this.width;
            SVG.setAttribute("width", this.contentWidth + "px");
            SVG.setAttribute("height", "100%");
            canvas.appendChild(SVG);
        } else {
            parent.removeChild(parent.childNodes[0]);
            SVG = canvas.childNodes[0];
        }
        this.newSVG = SVG;
        this.snap = this.Snap(this.newSVG);
    }

    /**
     * plot the points to an array of strings
     */
    plotPoints() {
        this.lineString = this.array.map((value, index) => {
            const thisValue = this.convert(index);
            let next, prev, handles;

            if (index === 0) {
                next = this.findNext(index, thisValue);
                return `M0,${thisValue} C50,${thisValue + next.diff / 2} `;
            }
            if (index === this.array.length - 1) {
                prev = this.findPrev(index, thisValue);
                return `${index * this.width - this.handleOffset},${thisValue - prev.diff / 2} ${index * this.width},${thisValue}`;
            }
            handles = this.getHandles(index, thisValue);
            return `${handles.x1},${handles.y1} ${index * this.width},${thisValue} ${handles.x2},${handles.y2} `;
        });
        this.bgString = this.lineString + `V${this.canvasHeight} H0 Z`;
    }

    /**
     * draw the actual line & background onto the svg canvas, with the correct color and fill
     */
    drawLineOnCanvas() {

        this.line = this.snap.path(this.lineString);
        this.bg = this.snap.path(this.bgString);

        this.line.attr({
            stroke: this.color,
            strokeWidth: 1,
            fill: "none",
            strokeLinecap: "round"
        });

        let gradColor1 = this.hexToRgb(this.color, 0.5);
        let gradColor2 = this.hexToRgb(this.color, 0);
        let gradStop1 = 1 - this.median(this.array) / this.biggestValue;
        this.bgFill = this.snap.gradient(`l(0.5,0.4,0.5,0.8)${gradColor1}:${gradStop1}-${gradColor2}:0`);
        this.whiteFill = this.snap.gradient(`l(0.5,0.4,0.5,0.8)rgba(255,255,255,0.35):${gradStop1}-rgba(255,255,255,0):0`);
        this.bg.attr({
            fill: this.whiteFill
        });

    }

    /**
     * set the width of the scroll content to the full graph
     */
    drawScrollComponent() {
        this.getScroll(this.scrollContainer);
        console.log(this.scroll);
        this.scrollContent = this.scroll.children[0];
        console.log(this.scrollContent);
        const width = (this.array.length - 1) * this.width;
        this.scrollContent.style.width = width + "px";
    }

    /**
     * add the marker into the canvas
     */
    addMarker() {
        const markerObj = {
            Snap: this.Snap,
            array: this.array,
            svgCanvas: this.newSVG,
            container: this.container,
            scrollContainer: this.scroll,
            lastPoint: this.convert(this.array.length - 1),
            firstPoint: this.convert(0),
            color: this.color,
            snap: this.snap,
            path: this.line,
            width: this.width,
            label: this.labelFormatter
        };

        this.marker = new Marker(markerObj);
    }

    /**
     * plot and draw the current path
     */
    plot() {
        this.getCanvas(this.divContainer);
        this.createSnapComponent(this.container);

        this.canvasHeight = this.container.offsetHeight;

        this.plotPoints();

        this.drawLineOnCanvas();
    }

    /**
     * find the next value and difference between it and the current value
     * @param index
     * @param thisValue
     * @returns {{next: *, diff: number}}
     */
    findNext(index, thisValue) {
        // invariant(index, "You have not supplied an index value to find the next value in the array.");

        const value = this.convert(index + 1);
        // if (thisValue == null) {
        //     const thisValue = this.convert(index);
        // }
        const diff = value - thisValue;

        return {value, diff};
    }

    /**
     * find the previous value and difference between it and the current value
     * @param index
     * @param thisValue
     * @returns {{next: *, diff: number}}
     */
    findPrev(index, thisValue) {
        // invariant(index, "You have not supplied an index value to find the previous value in the array.");

        const value = this.convert(index - 1);
        // if (thisValue == null) {
        //     // const thisValue = this.convert(index);
        // }
        const diff = thisValue - value;

        return {value, diff};
    }

    /**
     * scroll the svg to the beginning or the end
     * @param start
     */
    setPosition(start) {
        if (start === "left") {
            return;
        }
        this.scroll.scrollLeft = (this.array.length - 1) * this.width - 0.1;
    }

    /**
     * event listeners
     */
    addEvents() {
        this.scroll.addEventListener("scroll", this.updatePosition.bind(this));
    }

    /**
     * update the position of the SVG layer
     */
    updatePosition() {
        const scrollPos = this.scroll.scrollLeft;
        this.newSVG.style.transform = `translate3d(${-scrollPos}px, 0, 0)`;
    }

    /**
     * draw the line to find the intersection
     */
    drawIntersection(point) {
        if (this.intersectionLine !== undefined) {
            this.intersectionLine.attr({
                d: `M${point.x + this.scroll.scrollLeft - this.container.offsetWidth / 2},0 V${this.canvasHeight}`
            });
        } else {
            this.intersectionLine = this.snap.path(`M${point.x + this.scroll.scrollLeft - this.container.offsetWidth / 2},0 V${this.canvasHeight}`);
        }
    }

};
