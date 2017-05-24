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
import Line from "./line-chart.js";

/**
 * Module exports.
 * @public
 */

module.exports = class {

    constructor(obj) {

        this.options = obj;

        this.buildCanvas();

    }

    /**
     * get the position of a click event
     * @param event
     */
    getPosition(event) {
        let xPosition = event.clientX;
        let yPosition = event.clientY;

        yPosition -= this.container.offsetParent.offsetTop;
        this.clickPosition = {
            x: xPosition,
            y: yPosition
        };
        this.intersectionPoints = this.getIntersectionPoints(this.clickPosition);
        this.closestLine = this.lines[this.getClosestLine()];

        this.switchLines();
    }

    /**
     * get the index for the closest line to the click event
     */
    getClosestLine() {
        let difference = 9999999999;
        let closestIndex = 0;
        this.intersectionPoints.map((point, index) => {
            if (Math.abs(this.clickPosition.y - point) < difference) {
                difference = Math.abs(this.clickPosition.y - point);
                closestIndex = index;
            }
        });
        return closestIndex;
    }

    /**
     * get the intersection points for each line and a vertical line based on the current click position
     */
    getIntersectionPoints(point) {
        let points = [];
        this.lines.forEach(line => {
            line.drawIntersection(point);
            const intersect = this.options.snap.path.intersection(line.intersectionLine, line.line)[0].y;
            points.push(intersect);
        });
        return points;
    }

    /**
     * gets the biggest value of a given array
     * @param array
     */
    getBiggest() {
        invariant(this.options.series, "You have not supplied any arrays to find the biggest value.");
        this.biggestValue = 0;
        this.options.series.forEach(series => {
            series.data.forEach(value => {
                if (value[1] > this.biggestValue) {
                    this.biggestValue = value[1];
                }
            });
        });
    }

    /* --------------------------------------
     GETTERS END
     -------------------------------------- */

    /* --------------------------------------
     EVENTS START
     -------------------------------------- */

    /**
     * event listeners
     */
    addEvents() {
        this.scroll.addEventListener("click", this.containerClick.bind(this));
    }

    /**
     * click event on the container
     */
    containerClick(event) {
        this.getPosition(event);
    }

    /**
     * switch lines to closest to click
     */
    switchLines() {

        this.lines.forEach(line => {
            if (line.children !== undefined && line !== this.closestLine) {
                line.setInView();
                line.children.forEach(childLine => {
                    if (childLine === this.closestLine) {
                        return;
                    }
                    childLine.hide();
                });
            } else if (line === this.closestLine && line.children !== undefined) {
                line.setCurrent();
                line.children.forEach(childLine => {
                    childLine.setInView();
                });
            } else if (line === this.closestLine) {
                line.setCurrent();
            } else {
                line.setInView();
            }
        });
    }

    /* --------------------------------------
     EVENTS END
     -------------------------------------- */

    /* --------------------------------------
     BUILD START
     -------------------------------------- */

    /**
     * build all the lines in the current graph
     */
    buildCanvas() {

        this.scroll = document.getElementById("scroll");
        this.container = document.getElementById("canvas");
        this.snap = this.options.snap(this.container.childNodes[0]);

        this.lines = [];

        this.getBiggest();
        this.buildLines();

        this.closestLine = this.builtLines.filter(function (line) {
            return line.options && line.options.default;
        })[0];

        this.switchLines();

        this.addEvents();

    }

    /**
     * build the mentions line
     */
    buildLines() {

        this.builtLines = [];

        this.options.series.forEach((series) => {

            if (series.parent) {
                let path = this.buildPath(series);
                this.builtLines.push(path);
            }

        });

        this.options.series.forEach((series) => {

            if (!series.parent) {
                let name = series.name;

                let children = this.builtLines.filter((series) => {
                    return series.options.parent === name;
                });

                series.children = children;

                let path = this.buildPath(series);
                this.builtLines.push(path);
            }

        });

    }

    /**
     * build the specified line
     * @param options
     */
    buildPath(options) {

        const defaultValues = {
            snap: this.options.snap,
            container: "canvas",
            scroll: "scroll",
            biggestVal: this.biggestValue,
            width: 200,
            label: {
                name: options.name ? options.name : "",
                formatter: function (value) {
                    return value;
                }
            }
        };

        const newOptions = {
            ...defaultValues,
            ...options
        };

        const line = new Line(newOptions);
        this.lines.push(line);

        line.setPosition("right");

        return line;

    }

    destroyLines() {
        this.lines[0].destroy();
    }

};
