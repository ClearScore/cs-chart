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

/**
 * Module exports.
 * @public
 */

module.exports = class {

    /**
     * constructor of the Marker
     * @param obj
     */
    constructor(obj) {

        this.Snap = obj.Snap;
        this.array = obj.array;
        this.canvas = obj.svgCanvas;
        this.container = obj.container;
        this.scrollContainer = obj.scrollContainer;
        this.color = obj.color;
        this.snap = obj.snap;
        this.line = obj.path;
        this.lastPoint = obj.lastPoint;
        this.firstPoint = obj.firstPoint;
        this.width = obj.width;
        this.screenWidth = this.scrollContainer.offsetWidth;
        this.labelFormatter = obj.label;

        this.buildPoint();
        this.buildMarkerContent();

        this.buildVerticalLine();

        this.addEvents();
    }

    destroy() {
        this.point.parentNode.removeChild(this.point);
    }

    /**
     * set the marker to the current one in view
     */
    setCurrent() {
        this.point.classList.add("inView");
    }

    /**
     * set the marker to invisible
     */
    hide() {
        this.point.classList.remove("inView");
    }

    /* --------------------------------------
     BUILD MARKER START
     -------------------------------------- */

    /**
     * build the marker point to follow the line
     */
    buildPoint() {

        this.point = document.createElement("div");
        this.point.className = "point";

        const middleCircle = document.createElement("div");
        const center = document.createElement("div");

        middleCircle.className = "middle circle";
        this.point.appendChild(middleCircle);

        center.className = "center circle";
        center.style.backgroundColor = this.color;
        this.point.appendChild(center);

        this.markerContainer = this.container.parentElement;
        this.markerContainer.style.position = "relative";
        this.container.parentNode.appendChild(this.point);
    }

    /**
     * build the label name -- default: "@Mentions"
     */
    buildLabelName() {
        this.label = document.createElement("div");
        this.label.className = "label name";
        this.label.innerHTML = "@Mentions";
        this.point.appendChild(this.label);
    }

    /**
     * build the data label - -default: "67"
     */
    buildLabelData() {
        this.data = document.createElement("div");
        this.data.className = "label data";
        this.data.innerHTML = "67";
        this.point.appendChild(this.data);
    }

    /**
     * build the marker labels
     */
    buildMarkerContent() {
        this.buildLabelName();
        this.buildLabelData();
    }

    /**
     * build the vertical line in snap that will intersect with the path
     */
    buildVerticalLine() {
        this.vertLine = this.snap.path(`M0,0 V${this.container.offsetHeight}`);
    }

    /* --------------------------------------
     BUILD MARKER END
     -------------------------------------- */

    /* --------------------------------------
     INTERACTIONS START
     -------------------------------------- */

    /**
     * update the position of the vertical line based on the current scroll position
     */
    updateVerticalLine() {
        this.vertLine.attr({
            d: `M${this.scrollPos},0 V${this.container.offsetHeight}`
        });
    }

    /**
     * get the intersection points between the vertical line and the path
     */
    getIntersection() {
        this.intersection = this.Snap.path.intersection(this.vertLine, this.line);
        this.intersectionPoint = this.intersection[0] ? this.intersection[0] : this.intersectionPoint;
    }

    /**
     * update the position of the marker point based on scroll position
     */
    updatePoint() {
        this.getIntersection();
        this.contentWidth = this.scrollContainer.childNodes[0].offsetWidth;

        const maxRight = this.contentWidth;
        // const origLeft = this.screenWidth / 2 - 12;

        let topPos, leftPos;

        topPos = this.intersectionPoint ? this.intersectionPoint.y - 12 : this.lastPoint ? this.lastPoint - 12 : 0;
        // leftPos = this.intersectionPoint ? this.intersectionPoint.x - 12 + "px" : "0px";
        leftPos = this.screenWidth / 2 - 12;

        this.point.style.transform = `translate3d(${leftPos}px, ${topPos}px, 0)`;

        if (this.scrollPos <= 0) {
            topPos = this.firstPoint - 12;
            leftPos = this.screenWidth / 2 - 12 - this.scrollPos;
            this.point.style.transform = `translate3d(${leftPos}px, ${topPos}px, 0)`;
        } else if (this.scrollPos >= maxRight) {
            topPos = this.lastPoint - 12;
            leftPos = this.screenWidth / 2 - 12 - (this.scrollPos - maxRight);
            this.point.style.transform = `translate3d(${leftPos}px, ${topPos}px, 0)`;
        }
    }

    updateValues() {
        this.findNearestPoint();
    }

    /**
     * update the position of the intersection && marker
     */
    updatePosition() {
        this.scrollPos = this.scrollContainer.scrollLeft;
        this.updateVerticalLine();
        this.updatePoint();
        this.updateValues();
        requestAnimationFrame(this.updatePoint.bind(this));
    };

    /* --------------------------------------
     INTERACTIONS END
     -------------------------------------- */

    /**
     * event listeners
     */
    addEvents() {
        this.scrollPos = this.scrollContainer.scrollLeft;
        this.scrollContainer.addEventListener("scroll", this.updatePosition.bind(this));
    }

    /* --------------------------------------
     HELPER FUNCTIONS START
     -------------------------------------- */

    roundNearest(number, nearest) {
        invariant(number, "You have not provided a number to round");
        invariant(nearest, "You have not provided a nearest value to round to.");
        return Math.round(number / nearest) * nearest;
    }

    /**
     * find the nearest point to the current scroll position, and change the label data to match
     */
    findNearestPoint() {
        const nearestMonth = this.roundNearest(this.scrollPos, this.width);
        const index = nearestMonth / this.width;
        const date = this.labelFormatter.formatter(this.array[index]);
        this.label.innerHTML = date;
        const data = this.array[index][1];
        this.data.innerHTML = data + `<span style="font-size: 0.6em;"> ${this.labelFormatter.name}</span>`;
    }

    /* --------------------------------------
     HELPER FUNCTIONS END
     -------------------------------------- */

};
