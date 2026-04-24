import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file to Cloudinary
 * @param {Object} options - Upload options
 * @param {string|Buffer} options.file - File path or buffer
 * @param {string} options.folder - Folder in Cloudinary (default: policymate)
 * @param {string} options.resourceType - Type: 'image', 'video', 'raw', 'auto' (default: 'auto')
 * @param {Object} options.tags - Tags for the asset
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadToCloudinary({ file, folder = 'policymate', resourceType = 'auto', tags = [] }) {
  try {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      tags: tags.length > 0 ? tags : undefined,
      use_filename: true,
      unique_filename: true,
    }

    // Handle different input types
    let uploadResult
    if (typeof file === 'string') {
      // File path
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions)
    } else if (Buffer.isBuffer(file)) {
      // Buffer - upload as raw
      uploadResult = await cloudinary.uploader.upload(`data:application/octet-stream;base64,${file.toString('base64')}`, {
        ...uploadOptions,
        resource_type: 'raw',
      })
    } else if (typeof file === 'object' && file.path) {
      // Multer file object
      uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions)
    } else {
      throw new Error('Invalid file format. Expected file path, buffer, or multer file object.')
    }

    return {
      success: true,
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      createdAt: uploadResult.created_at,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`)
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the asset to delete
 * @returns {Promise<Object>} - Delete result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      message: result.result,
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`)
  }
}

/**
 * Get asset details from Cloudinary
 * @param {string} publicId - The public ID of the asset
 * @returns {Promise<Object>} - Asset details
 */
export async function getCloudinaryAsset(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId)
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at,
    }
  } catch (error) {
    console.error('Cloudinary get asset error:', error)
    return null
  }
}

/**
 * List assets in a folder
 * @param {string} folder - Folder path (default: policymate)
 * @param {number} maxResults - Max results to return (default: 50)
 * @returns {Promise<Array>} - List of assets
 */
export async function listCloudinaryAssets(folder = 'policymate', maxResults = 50) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: maxResults,
    })
    return result.resources.map((resource) => ({
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
    }))
  } catch (error) {
    console.error('Cloudinary list error:', error)
    return []
  }
}

/**
 * Generate a signed URL for private assets
 * @param {string} publicId - The public ID of the asset
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {string} - Signed URL
 */
export function getSignedCloudinaryUrl(publicId, expiresIn = 3600) {
  try {
    const timestamp = Math.round(Date.now() / 1000) + expiresIn
    const signature = cloudinary.utils.api_sign_request(
      {
        public_id: publicId,
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_API_SECRET
    )
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/signature=${signature}/public_id=${publicId}`
  } catch (error) {
    console.error('Cloudinary signed URL error:', error)
    return null
  }
}

export { cloudinary }