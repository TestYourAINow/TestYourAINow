import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { Announcement } from '@/models/Announcement';
import User from '@/models/User';

// GET - Fetch unseen active announcements for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const seenIds = user.seenAnnouncements || [];
    const userCreatedAt = user.createdAt || new Date(0);

    // Only show announcements created after user registration and not yet seen
    const announcements = await Announcement.find({
      isActive: true,
      createdAt: { $gt: userCreatedAt },
      _id: { $nin: seenIds }
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - Mark an announcement as seen
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { announcementId } = await req.json();
    if (!announcementId) {
      return NextResponse.json({ error: 'announcementId required' }, { status: 400 });
    }

    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { seenAnnouncements: announcementId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking announcement as seen:', error);
    return NextResponse.json({ error: 'Failed to mark as seen' }, { status: 500 });
  }
}
