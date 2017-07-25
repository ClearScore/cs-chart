const boot = require('../index');

test('Index file to fetch correct lib', () => {
    expect(boot).toEqual(csCharts);
});