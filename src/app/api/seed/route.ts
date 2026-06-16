import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    let child = await prisma.child.findFirst();
    if (!child) {
      child = await prisma.child.create({
        data: { name: 'Demo Student' },
      });
    }
    return NextResponse.json({ child }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed child' }, { status: 500 });
  }
}
