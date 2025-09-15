// app\api\deployment-folders\route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/db'
import { DeploymentFolder } from '@/models/DeploymentFolder'
import { Connection } from '@/models/Connection'
import mongoose from 'mongoose'

// GET - Récupérer tous les deployment folders de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Récupérer les folders avec le count de connections
    const folders = await DeploymentFolder.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(session.user.id) 
        } 
      },
      {
        $lookup: {
          from: 'connections',
          localField: '_id',
          foreignField: 'folderId',
          as: 'connections'
        }
      },
      {
        $addFields: {
          connectionCount: { $size: '$connections' }
        }
      },
      {
        $project: {
          connections: 0 // Ne pas retourner les connections complètes
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ])

    return NextResponse.json({ 
      success: true, 
      folders 
    })

  } catch (error) {
    console.error('Error fetching deployment folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment folders' }, 
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau deployment folder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' }, 
        { status: 400 }
      )
    }

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Valid color is required' }, 
        { status: 400 }
      )
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Folder name must be 50 characters or less' }, 
        { status: 400 }
      )
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: 'Description must be 200 characters or less' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Vérifier si le nom existe déjà pour cet utilisateur
    const existingFolder = await DeploymentFolder.findOne({
      userId: session.user.id,
      name: name.trim()
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A deployment folder with this name already exists' }, 
        { status: 409 }
      )
    }

    // Créer le folder
    const folder = await DeploymentFolder.create({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || '',
      color
    })

    // Retourner le folder avec connectionCount = 0
    const folderWithCount = {
      ...folder.toObject(),
      connectionCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Deployment folder created successfully',
      ...folderWithCount
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating deployment folder:', error)
    return NextResponse.json(
      { error: 'Failed to create deployment folder' }, 
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un deployment folder (et optionnellement ses connections)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('id')
    const deleteConnections = searchParams.get('deleteConnections') === 'true'

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Valid folder ID is required' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Vérifier que le folder appartient à l'utilisateur
    const folder = await DeploymentFolder.findOne({
      _id: folderId,
      userId: session.user.id
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Deployment folder not found' }, 
        { status: 404 }
      )
    }

    // Commencer une transaction
    const session_db = await mongoose.startSession()
    
    try {
      await session_db.withTransaction(async () => {
        if (deleteConnections) {
          // Supprimer toutes les connections du folder
          await Connection.deleteMany({ 
            folderId: folderId,
            userId: session.user.id 
          }).session(session_db)
        } else {
          // Déplacer les connections hors du folder (folderId = null)
          await Connection.updateMany(
            { 
              folderId: folderId,
              userId: session.user.id 
            },
            { $unset: { folderId: 1 } }
          ).session(session_db)
        }

        // Supprimer le folder
        await DeploymentFolder.findByIdAndDelete(folderId).session(session_db)
      })

      return NextResponse.json({
        success: true,
        message: `Deployment folder deleted successfully. Connections ${deleteConnections ? 'deleted' : 'moved to root'}.`
      })

    } finally {
      await session_db.endSession()
    }

  } catch (error) {
    console.error('Error deleting deployment folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete deployment folder' }, 
      { status: 500 }
    )
  }
}