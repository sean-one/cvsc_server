const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESSKEYID,
        secretAccessKey: process.env.AWS_SES_SECRETACCESSKEY
    }
});

async function sendEmail(to, subject, htmlContent) {
    const params = {
        Source: 'coachellavalleysmokersclub@gmail.com', // SES verified email
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlContent
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        }
    };

    try {
        const data = await sesClient.send(new SendEmailCommand(params));
        console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendEmail };
