import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connection = await Connection.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean()

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  return NextResponse.json({ connection })
}

export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, aiBuildId, settings } = body

  const connection = await Connection.findOneAndUpdate(
    {
      _id: params.id,
      userId: session.user.id,
    },
    {
      ...(name && { name }),
      ...(aiBuildId && { aiBuildId }),
      ...(settings && { settings }),
    },
    { new: true }
  )

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, connection })
}

// 🔥 NOUVELLE MÉTHODE DELETE
export async function DELETE(
  req: NextRequest,
  context: any
) {
  const params = await context.params
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deletedConnection = await Connection.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!deletedConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Connection deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json({ 
      error: 'Failed to delete connection' 
    }, { status: 500 })
  }
}