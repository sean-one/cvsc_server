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
        await sesClient.send(new SendEmailCommand(params));
        // console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Detailed Error Logging:");
        console.error("Error sending email:", error);
        console.error("Error Stack Trace:", error.stack);
        console.error("Request Parameters:", JSON.stringify(params, null, 2));

        if (error.$metadata) {
            console.error("AWS Request ID:", error.$metadata.requestId);
            console.error("HTTP Response Status:", error.$metadata.httpStatusCode);
        }

        if (error.Code) {
            console.error("Error Code:", error.Code);
        }

        if (error.Message) {
            console.error("Error Message:", error.Message);
        }
        throw new Error('ses_failed')
    }
}

module.exports = { sendEmail };
