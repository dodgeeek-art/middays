import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;

  try {
    const badges = await prisma.badge.findMany({
      where: { childId },
      orderBy: { earnedAt: 'desc' },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;
  
  try {
    const body = await request.json();
    const { badgeName } = body;

    const badge = await prisma.badge.create({
      data: {
        childId,
        badgeName,
      },
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
