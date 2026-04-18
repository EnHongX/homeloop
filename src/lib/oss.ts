import OSS from 'ali-oss'

export enum UploadFolder {
  PRODUCTS = 'products',
  AVATARS = 'avatars',
}

const getOSSClient = (): OSS => {
  const region = process.env.OSS_REGION
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET
  const bucket = process.env.OSS_BUCKET

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error('OSS configuration is missing. Please check .env file.')
  }

  return new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
  })
}

const generateFileName = (originalName: string, folder: UploadFolder): string => {
  const ext = originalName.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${folder}/${timestamp}-${randomStr}.${ext}`
}

export const uploadToOSS = async (
  file: Buffer,
  originalName: string,
  folder: UploadFolder = UploadFolder.PRODUCTS
): Promise<string> => {
  const client = getOSSClient()
  const fileName = generateFileName(originalName, folder)
  
  const result = await client.put(fileName, file)
  
  if (process.env.OSS_CDN_DOMAIN) {
    return `${process.env.OSS_CDN_DOMAIN}/${result.name}`
  }
  
  return result.url
}

export const uploadMultipleToOSS = async (
  files: { buffer: Buffer; originalName: string }[],
  folder: UploadFolder = UploadFolder.PRODUCTS
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadToOSS(file.buffer, file.originalName, folder)
  )
  return Promise.all(uploadPromises)
}
