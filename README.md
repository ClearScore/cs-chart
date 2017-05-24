# cs-charts
Lightweight opinionated chart library (line, donut and bar charts)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]
  [![Known Vulnerabilities](https://snyk.io/test/github/ClearScore/verbose-dashboard/badge.svg)](https://snyk.io/test/github/ClearScore/verbose-dashboard)

## Installation

```bash
$ yarn add cs-charts
# or
$ npm install cs-charts
```

## Features

  * Lightweight (3kb)
  * Line Charts
  * Bar Charts
  * Animtated Donut
  * Mobile Friendly
  
## API

### csCharts(options)

Boots up the `cs-charts`, creates all the elements, builds dynamic axis and create the charts

- `options` an object that is passed to `cs-charts` on setup 

### csCharts.version

Returns the current version of `cs-charts` you are using

## Options

```js
var options = {};

var chart = new csCharts(options)
```

#### options.snap
Type: `Function`<br>
Default value: `undefined`<br>
Required: `true`

Import of your SnapSvg library

#### options.series
Type: `array`<br>
Default value: `undefined`<br>
Required: `true`

The data to plot, for more information on the data format then please check Data Object.

## Data Object

A series is presented with an `array` of `objects`.  You can have multiple series.  

```js
var series = [
    {
        name: 'My Series',
        color: '#DFDFDF',
        default: true,
        constant: true,
        parent: 'Another Series',
        label: function(){
            // format function
        },
        data: [
            // series data
        ]
    }
]
```

#### series.name
Type: `string`<br>
Required: `true`

The name of the series

#### series.color
Type: `string`<br>
Required: `true`

The colour of the series

#### series.default
Type: `boolean`<br>
Default value: `false`<br>

This sets the default line to be active on initial load.  You should only have 1 series with this attribute.  If you have more then one, its the first series found.

#### series.constant
Type: `string`<br>
Default value: `false`

When set to `true` this series will always be available even when viewing other series children.
 
### series.parent
Type: `string`<br>

Add the name of another series.  This will mean this series is hidden until the parent series is clicked.


#### series.label
Type: `function`<br>

This function provides ability to customise the label shown on the line.

```js
// Format the unix timestamp to be a readable date
label: {
    name: "visits",
    formatter: function (value) {
        const date = new Date(parseInt(value, 10)).toDateString();
        return date;
    }
}
```

#### series.data
Type: `array`<br>
Required: `true`

The array of data to be plotted.


## Docs & Community

  * [Snap SVG](http://snapsvg.io/)

## Development Guide

Below it a quick start guide to development on `cs-charts`.  The following will spawn an express app hosting the examples
intergrated using [nodemon](https://github.com/remy/nodemon).

You can use either a local build or a docker-compose build.  The docker-compose build is useful if you want to target different node versions

  Clone the Repo

```bash
$ git clone git@github.com:ProjectRogueOne/cs-charts.git
```

  Install dependecies 

```bash
$ yarn install
# or
$ npm install
```

Run the development express app

```bash
$ npm run dev
# or
$ docker-compose up
```
You should now be able to see the app on http://locahost:3000

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ yarn install
$ npm test
```

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/cs-charts.svg
[npm-url]: https://npmjs.org/package/cs-charts
[downloads-image]: https://img.shields.io/npm/dm/cs-charts.svg
[downloads-url]: https://npmjs.org/package/cs-charts
[travis-image]: https://img.shields.io/travis/ClearScore/cs-charts/master.svg
[travis-url]: https://travis-ci.org/ClearScore/cs-charts
[coveralls-image]: https://img.shields.io/coveralls/ClearScore/cs-charts/master.svg
[coveralls-url]: https://coveralls.io/r/ClearScore/cs-charts?branch=master