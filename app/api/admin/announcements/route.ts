import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { Announcement } from '@/models/Announcement';
import User from '@/models/User';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = 'sango_ks@hotmail.com';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === ADMIN_EMAIL;
}

// GET - All announcements (admin)
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ announcements });
}

// POST - Create announcement
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, message, type, imageUrl, imageLayout } = await req.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
  }

  await connectToDatabase();
  const announcement = await Announcement.create({ title: title.trim(), message: message.trim(), type: type || 'update', imageUrl: imageUrl || '', imageLayout: imageLayout || 'thumbnail', isActive: true });
  return NextResponse.json({ success: true, announcement }, { status: 201 });
}

// PATCH - Toggle active / update
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, isActive } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await Announcement.findByIdAndUpdate(id, { isActive }, { new: true });
  return NextResponse.json({ success: true, announcement: updated });
}

// DELETE - Delete announcement and clean up from users
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await connectToDatabase();
  const announcement = await Announcement.findById(id).lean() as any;

  // Delete image from Supabase if it exists
  if (announcement?.imageUrl) {
    try {
      const url = new URL(announcement.imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((p: string) => p === 'announcements');
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const imagePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from('announcements').remove([imagePath]);
      }
    } catch {
      // Don't block deletion if image cleanup fails
    }
  }

  await Announcement.findByIdAndDelete(id);

  // Clean up from all users' seenAnnouncements
  await User.updateMany(
    { seenAnnouncements: id },
    { $pull: { seenAnnouncements: id } }
  );

  return NextResponse.json({ success: true });
}
