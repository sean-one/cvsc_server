const dotenv = require('dotenv');
// const aws = require('aws-sdk');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');
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

async function downloadImage(url) {
    const response = await axios({
        url,
        responseType: 'arraybuffer'
    });

    return response.data;
}

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

const uploadImageS3Url = async (imageFile, folderName) => {
    try {
        const rawBytes = await randomBytes(32)
        const imageName = `${rawBytes.toString('hex')}`
        const imageKey = `${folderName}/${imageName}`
    
        const imageParams = {
            Bucket: bucketName,
            Key: imageKey,
            Body: imageFile.buffer,
            ContentType: 'image/webp',
        }
    
        const command = new PutObjectCommand(imageParams)
    
        await s3.send(command)
    
        return imageKey;
        
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error uploading image to S3:', Object.keys(error));

        // Check if error is due to invalid AWS credentials
        if (error.name === 'InvalidAccessKeyId') {
            throw new Error('aws_invalid_access_key');
        }

        // Check if error is due to missing bucket
        if (error.name === 'NoSuchBucket') {
            throw new Error('aws_invalid_bucket');
        }

        // For handling specific S3 errors, you might check error.code or error.name depending on the SDK version
        // Example for a generic catch-all error
        throw new Error('aws_upload_error');
    }
}

// takes google url from profile sign in removes the size scale saves it to s3 bucket
const processAndUploadImage = async (thirdPartyUrl) => {
    try {
        const imageUrl = thirdPartyUrl.replace(/=s\d+-c/, '=s250');

        const imageData = await downloadImage(imageUrl);
        const optimizeBuffer = await sharp(imageData)
            .resize(250, 250)
            .webp()
            .toBuffer();
        
        const s3Key = await uploadImageS3Url(optimizeBuffer, 'user-profile');

        return s3Key;
    } catch (error) {
        console.error('failed to download, process or upload image: ', error);
        throw error;
    }
}

const deleteImageS3 = async(image_key) => {
    try {

        const imageParams = {
            Bucket: bucketName,
            Key: image_key,
        }
    
        const command = new DeleteObjectCommand(imageParams)
    
        // if successful returns $metadata.httpStatusCode of 204
        await s3.send(command)

        return

    } catch (error) {
        throw new Error('aws_delete_error');
    }
}

module.exports = {
    generateUploadURL,
    uploadImageS3Url,
    processAndUploadImage,
    deleteImageS3,
}