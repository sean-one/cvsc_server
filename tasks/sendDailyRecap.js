// tasks/sendDailyRecap.js
const { sendEmail } = require('../utils/ses.mailer');
const DB = require('../data/dbConfig')

async function sendDailyRecap() {
    try {
        const totalUsers = await DB('users').count('id as count');
        const totalBusinesses = await DB('businesses').count('id as count');
        const totalEvents = await DB('events').count('id as count');

        const newUsers = await DB('users').where('created_at', '>=', DB.raw("NOW() - INTERVAL '6 HOURS'")).count('id as count');
        const newBusinesses = await DB('businesses').where('created_at', '>=', DB.raw("NOW() - INTERVAL '6 HOURS'")).count('id as count');
        const newEvents = await DB('events').where('created_at', '>=', DB.raw("NOW() - INTERVAL '6 HOURS'")).count('id as count');

        const emailBody = `
            <html>
            <head>
                <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                }
                h2 {
                    background-color: #f4f4f4;
                    padding: 10px;
                    border-radius: 5px;
                }
                p {
                    padding: 5px 0;
                }
                .totals, .recent {
                    margin-bottom: 20px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <h2>Totals</h2>
                <div class="totals">
                    <p><strong>Users:</strong> ${totalUsers[0].count}</p>
                    <p><strong>Businesses:</strong> ${totalBusinesses[0].count}</p>
                    <p><strong>Events:</strong> ${totalEvents[0].count}</p>
                </div>
                <h2>Last 6 Hours</h2>
                <div class="recent">
                    <p><strong>New Users:</strong> ${newUsers[0].count}</p>
                    <p><strong>New Businesses:</strong> ${newBusinesses[0].count}</p>
                    <p><strong>New Events:</strong> ${newEvents[0].count}</p>
                </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail('coachellavalleysmokersclub@gmail.com', '6 Hour Recap', emailBody);
        
        console.log('Recap email sent successfully');
    
    } catch (error) {
        console.error('Error sending 6 Hour recap email:', error);
    }
}

module.exports = { sendDailyRecap };
