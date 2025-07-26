import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions' // ✅ CORRIGÉ
import { connectToDatabase } from '@/lib/db' // ✅ CORRIGÉ
import { Folder } from '@/models/Folder'
import { Agent } from '@/models/Agent'
import mongoose from 'mongoose'

// GET - Récupérer un folder avec ses agents
export async function GET(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folderId = params.id

    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Invalid folder ID' }, 
        { status: 400 }
      )
    }

    await connectToDatabase() // ✅ CORRIGÉ

    // Récupérer le folder
    const folder = await Folder.findOne({
      _id: folderId,
      userId: session.user.id
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' }, 
        { status: 404 }
      )
    }

    // Récupérer les agents du folder
    const agents = await Agent.find({
      folderId: folderId,
      userId: session.user.id
    }).sort({ updatedAt: -1 })

    return NextResponse.json({
      success: true,
      folder: {
        ...folder.toObject(),
        agentCount: agents.length
      },
      agents
    })

  } catch (error) {
    console.error('Error fetching folder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folder' }, 
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un folder
export async function PUT(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folderId = params.id
    const body = await request.json()
    const { name, description, color } = body

    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Invalid folder ID' }, 
        { status: 400 }
      )
    }

    // Validation
    if (name && (!name.trim() || name.length > 50)) {
      return NextResponse.json(
        { error: 'Folder name must be 1-50 characters' }, 
        { status: 400 }
      )
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: 'Description must be 200 characters or less' }, 
        { status: 400 }
      )
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Valid color is required' }, 
        { status: 400 }
      )
    }

    await connectToDatabase() // ✅ CORRIGÉ

    // Vérifier que le folder existe et appartient à l'utilisateur
    const existingFolder = await Folder.findOne({
      _id: folderId,
      userId: session.user.id
    })

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' }, 
        { status: 404 }
      )
    }

    // Si le nom change, vérifier l'unicité
    if (name && name.trim() !== existingFolder.name) {
      const duplicateFolder = await Folder.findOne({
        userId: session.user.id,
        name: name.trim(),
        _id: { $ne: folderId }
      })

      if (duplicateFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists' }, 
          { status: 409 }
        )
      }
    }

    // Mettre à jour le folder
    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (color) updateData.color = color

    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      updateData,
      { new: true }
    )

    // Compter les agents
    const agentCount = await Agent.countDocuments({
      folderId: folderId,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Folder updated successfully',
      folder: {
        ...updatedFolder?.toObject(),
        agentCount
      }
    })

  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { error: 'Failed to update folder' }, 
      { status: 500 }
    )
  }
}