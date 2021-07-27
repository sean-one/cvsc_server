const dotenv = require('dotenv');
const aws = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes)


dotenv.config()

const region = process.env.AWS_REGION
const bucketName = process.env.AWS_BUCKETNAME
const accessKeyId = process.env.AWS_ACCESSKEYID
const secretAccessKey = process.env.AWS_SECRETACCESSKEY

const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
})

const generateUploadURL = async () => {
    const rawBytes = await randomBytes(16)
    const imageName = rawBytes.toString('hex')

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    })

    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return uploadURL
}

module.exports = {
    generateUploadURL
}