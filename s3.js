const dotenv = require('dotenv');
// const aws = require('aws-sdk');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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

const deleteImageS3 = async(image_key) => {
    console.log('deleting image from s3')
    try {
        const imageParams = {
            Bucket: bucketName,
            Key: image_key,
        }
    
        const command = new DeleteObjectCommand(imageParams)
    
        const data_return = await s3.send(command)

        console.log('delete successful')
        console.log(data_return)
        console.log('============================================================')
        return data_return

    } catch (error) {
        console.log('s3 error', error)
        
    }
}

module.exports = {
    generateUploadURL,
    uploadImageS3Url,
    deleteImageS3,
}