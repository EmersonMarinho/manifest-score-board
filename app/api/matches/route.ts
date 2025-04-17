import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Match from '@/app/models/Match';

export async function GET() {
  try {
    await dbConnect();
    console.log('Fetching matches from database...');
    const matches = await Match.find({}).sort({ createdAt: -1 });
    console.log(`Found ${matches.length} matches`);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log('Creating new match with data:', data);
    
    const match = await Match.create(data);
    console.log('Match created successfully:', match);
    
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    console.log('Updating match:', _id);
    console.log('Update data:', updateData);

    const match = await Match.findByIdAndUpdate(_id, updateData, { new: true });
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    console.log('Match updated successfully:', match);
    return NextResponse.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    console.log('Deleting match:', id);
    const match = await Match.findByIdAndDelete(id);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    console.log('Match deleted successfully');
    return NextResponse.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Failed to delete match', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 