// the bucket i am using a public, so I don't need to use getSignedUrl to GET Object
// For method PUT, DELETE I will use s3.send( Command )
const BUCKET = process.env.AWS_BUCKET
const REGION = process.env.AWS_REGION
const ACCESS_KEY = process.env.AWS_ACCESS_KEY
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY
const PUBLIC_URL = process.env.AWS_PUBLIC_BUCKET_URL

const { S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY
  }
})

// PUT
async function putObjectFnc(Key, buffer) {
  try {
    const response = await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key,
      Body: buffer,
    }))
    return response
  } catch (err) {
    throw err
  }
}

// Read Object
function getObjectUrlFnc(Key) {
  return PUBLIC_URL + '/' + Key
}

// List Objects
async function getAllObjectsFnc(Prefix) {
  try {
    const response = await s3.send(new ListObjectsCommand({
      Bucket: BUCKET,
      Prefix
    }))
    if (!response.Contents) {
      response.Contents = []
    }
    return response
  } catch (err) {
    throw err
  }

}

// Delete
const s3Controller = {
  getObjectUrl: getObjectUrlFnc,
  getAllObjects: getAllObjectsFnc,
  putObject: putObjectFnc,
}


module.exports = { s3Controller }


