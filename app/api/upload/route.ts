import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Check file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP images and MP4, WebM videos are allowed' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename with original extension
    const uniqueId = uuidv4()
    const extension = file.name.split('.').pop()
    const filename = `${uniqueId}.${extension}`

    // Create year/month based directory structure
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const uploadDir = join(process.cwd(), 'public', 'uploads', String(year), month)
    
    // Ensure directory exists
    await writeFile(join(uploadDir, filename), buffer)

    // Return the URL
    const url = `/uploads/${year}/${month}/${filename}`
    
    // If it's a video, generate a thumbnail
    let thumbnail
    if (isVideo) {
      // For now, we'll just return the video URL as thumbnail
      // In a production environment, you would generate a proper thumbnail here
      thumbnail = url
    }

    return NextResponse.json({ 
      url, 
      thumbnail,
      type: isImage ? 'image' : 'video',
      size: file.size,
      name: file.name
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 