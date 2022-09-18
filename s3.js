const dotenv = require('dotenv');
// const aws = require('aws-sdk');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes)


dotenv.config()

const region = process.env.AWS_REGION
const bucketName = process.env.AWS_BUCKETNAME
const accessKeyId = process.env.AWS_ACCESSKEYID
const secretAccessKey = process.env.AWS_SECRETACCESSKEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: region
});

// const s3 = new aws.S3({
//     region,
//     accessKeyId,
//     secretAccessKey,
//     signatureVersion: 'v4'
// })

const generateUploadURL = async () => {
    const rawBytes = await randomBytes(16)
    const imageName = `${rawBytes.toString('hex')}.png`

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    })

    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return uploadURL
}

const uploadImageS3Url = async (imageFile) => {
    console.log('inside image upload')
    const rawBytes = await randomBytes(32)
    const imageName = `${rawBytes.toString('hex')}`

    const imageParams = {
        Bucket: bucketName,
        Key: imageName,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
    }

    const command = new PutObjectCommand(imageParams)

    await s3.send(command)

    console.log(imageName)
    return imageName;
}

module.exports = {
    generateUploadURL,
    uploadImageS3Url
}