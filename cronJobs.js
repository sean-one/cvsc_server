const cron = require('node-cron');
const { sendDailyRecap } = require('./tasks/sendDailyRecap');
const { removePastEvents } = require('./tasks/removePastEvents');


cron.schedule('0 2 * * *', () => {
    removePastEvents()
})

cron.schedule('0 */6 * * *', () => {
    sendDailyRecap()
})

module.exports = cron;