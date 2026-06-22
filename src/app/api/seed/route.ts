import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_CHILD_ID = 'demo-child';

export async function POST() {
  try {
    const child = await prisma.child.upsert({
      where: { id: DEMO_CHILD_ID },
      update: { name: 'Demo Student' },
      create: { id: DEMO_CHILD_ID, name: 'Demo Student' },
    });
    return NextResponse.json({ child }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed child' }, { status: 500 });
  }
}
