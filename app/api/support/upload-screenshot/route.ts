// app/api/support/upload-screenshot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Sanitize filename function
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const ticketId = formData.get('ticketId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 })
    }

    // File validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File is too large. Maximum allowed size is 5MB.' 
      }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Allowed: JPEG, PNG, WebP.' 
      }, { status: 400 })
    }

    // Clean filename
    const originalName = file.name;
    const fileExtension = file.type.split('/')[1] || 'png';
    const sanitizedName = sanitizeFileName(originalName);
    const finalFileName = `${Date.now()}_${sanitizedName}`;
    
    // Secure file path
    const filePath = `tickets/${ticketId.replace('temp-', 'draft-')}/${finalFileName}`;
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from('support-screenshots')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError)
      return NextResponse.json({ 
        error: `Upload failed: ${uploadError.message}` 
      }, { status: 500 })
    }

    // Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from('support-screenshots')
      .getPublicUrl(filePath)
    
    const publicUrl = publicUrlData.publicUrl

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: originalName,
      size: file.size,
      path: filePath,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error while processing upload:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}