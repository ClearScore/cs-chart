const express = require('express');
const path = require('path');

const app = express();

app.use('/lib', express.static(path.join(__dirname, 'lib')))
app.use('/', express.static(path.join(__dirname, 'examples')))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('port', process.env.PORT || 3020);

const server = app.listen(app.get('port'), function () {
    console.log('csCharts Examples available on port ' + server.address().port);
});