import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;

  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        progressRecord: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error('Error fetching progress:', error);
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
    const { targetLetter, tracingScore, phonemicScore, timeSpentMs } = body;

    const progress = await prisma.progressRecord.create({
      data: {
        childId,
        targetLetter,
        tracingScore,
        phonemicScore,
        timeSpentMs,
      },
    });

    return NextResponse.json({ progress }, { status: 201 });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
