const boot = require('../index');
const csCharts = require('../src/cs-charts');

test('Index file to fetch correct lib', () => {
    expect(boot).toEqual(csCharts);
});