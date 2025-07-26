import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions' // ✅ CORRIGÉ
import { connectToDatabase } from '@/lib/db' // ✅ CORRIGÉ  
import { Folder } from '@/models/Folder'
import { Agent } from '@/models/Agent'
import mongoose from 'mongoose'

// GET - Récupérer tous les folders de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase() // ✅ CORRIGÉ

    // Récupérer les folders avec le count d'agents
    const folders = await Folder.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(session.user.id) 
        } 
      },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: 'folderId',
          as: 'agents'
        }
      },
      {
        $addFields: {
          agentCount: { $size: '$agents' }
        }
      },
      {
        $project: {
          agents: 0 // Ne pas retourner les agents complets
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
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' }, 
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau folder
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

    await connectToDatabase() // ✅ CORRIGÉ

    // Vérifier si le nom existe déjà pour cet utilisateur
    const existingFolder = await Folder.findOne({
      userId: session.user.id,
      name: name.trim()
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' }, 
        { status: 409 }
      )
    }

    // Créer le folder
    const folder = await Folder.create({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || '',
      color
    })

    // Retourner le folder avec agentCount = 0
    const folderWithCount = {
      ...folder.toObject(),
      agentCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      ...folderWithCount
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' }, 
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un folder (et optionnellement ses agents)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('id')
    const deleteAgents = searchParams.get('deleteAgents') === 'true'

    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Valid folder ID is required' }, 
        { status: 400 }
      )
    }

    await connectToDatabase() // ✅ CORRIGÉ

    // Vérifier que le folder appartient à l'utilisateur
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

    // Commencer une transaction
    const session_db = await mongoose.startSession()
    
    try {
      await session_db.withTransaction(async () => {
        if (deleteAgents) {
          // Supprimer tous les agents du folder
          await Agent.deleteMany({ 
            folderId: folderId,
            userId: session.user.id 
          }).session(session_db)
        } else {
          // Déplacer les agents hors du folder (folderId = null)
          await Agent.updateMany(
            { 
              folderId: folderId,
              userId: session.user.id 
            },
            { $unset: { folderId: 1 } }
          ).session(session_db)
        }

        // Supprimer le folder
        await Folder.findByIdAndDelete(folderId).session(session_db)
      })

      return NextResponse.json({
        success: true,
        message: `Folder deleted successfully. Agents ${deleteAgents ? 'deleted' : 'moved to root'}.`
      })

    } finally {
      await session_db.endSession()
    }

  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' }, 
      { status: 500 }
    )
  }
}