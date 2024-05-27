const cron = require('node-cron');
const { sendDailyRecap } = require('./tasks/sendDailyRecap');


cron.schedule('0 */6 * * *', () => {
    sendDailyRecap()
})

module.exports = cron;