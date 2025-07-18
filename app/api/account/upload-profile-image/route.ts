// app/api/account/upload-profile-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import User from '@/models/User'
import { connectToDatabase } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Vérifications (style de ton code + plus strictes)
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

    // Nom de fichier unique (pattern de ton code)
    const fileExtension = file.type.split('/')[1]
    const filePath = `profiles/${session.user.id}_${Date.now()}.${fileExtension}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supprimer l'ancienne image si elle existe (version plus robuste)
    const existingUser = await User.findOne({ email: session.user.email })
    if (existingUser?.profileImage) {
      try {
        // Extraction du path plus sûre
        const url = new URL(existingUser.profileImage)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part === 'profile-images')
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const oldPath = pathParts.slice(bucketIndex + 1).join('/')
          
          const { error: deleteError } = await supabase.storage
            .from('profile-images')
            .remove([oldPath])
          
          if (deleteError) {
            console.error('Failed to delete old profile image:', deleteError)
            // Continue anyway, don't fail the upload
          }
        }
      } catch (urlError) {
        console.error('Error parsing old image URL:', urlError)
        // Continue anyway
      }
    }

    // Upload vers Supabase (style de ton code)
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Générer l'URL publique (style de ton code)
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)
    
    const publicUrl = publicUrlData.publicUrl

    // Sauvegarder l'URL en DB
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { profileImage: publicUrl },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      profileImage: publicUrl,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error while processing upload:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })

    if (user?.profileImage) {
      try {
        // Extraction du path plus sûre
        const url = new URL(user.profileImage)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part === 'profile-images')
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const imagePath = pathParts.slice(bucketIndex + 1).join('/')
          
          // Supprimer de Supabase Storage
          const { error: deleteError } = await supabase.storage
            .from('profile-images')
            .remove([imagePath])
          
          if (deleteError) {
            console.error('Supabase delete error:', deleteError)
            // Continue anyway, still remove from DB
          }
        }
      } catch (urlError) {
        console.error('Error parsing image URL:', urlError)
        // Continue anyway, still remove from DB
      }
    }

    // Supprimer de la DB
    await User.findOneAndUpdate(
      { email: session.user.email },
      { profileImage: null },
      { new: true }
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error while processing delete:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}