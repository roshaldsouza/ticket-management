import { NextRequest, NextResponse } from 'next/server';

// Mock database - same structure as other files
let tickets = [
  {
    id: '1',
    subject: 'Cannot access dashboard',
    description: 'I am unable to access my dashboard after the recent update. Getting a 404 error.',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: {
      id: '3',
      name: 'John User',
      email: 'user@demo.com',
      role: 'user'
    },
    assignedTo: {
      id: '2',
      name: 'Support Agent',
      email: 'support@demo.com',
      role: 'support'
    },
    comments: []
  },
  {
    id: '2',
    subject: 'Email notifications not working',
    description: 'I am not receiving email notifications for ticket updates.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: {
      id: '3',
      name: 'John User',
      email: 'user@demo.com',
      role: 'user'
    },
    assignedTo: {
      id: '2',
      name: 'Support Agent',
      email: 'support@demo.com',
      role: 'support'
    },
    comments: [],
    rating: 5
  }
];

let users = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@demo.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Support Agent',
    email: 'support@demo.com',
    role: 'support'
  },
  {
    id: '3',
    name: 'John User',
    email: 'user@demo.com',
    role: 'user'
  }
];

function getUserFromToken(token: string) {
  const userId = token.replace('mock-token-', '');
  return users.find(u => u.id === userId);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const ticketIndex = tickets.findIndex(t => t.id === params.id);
    const ticket = tickets[ticketIndex];

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Only the ticket creator can rate
    if (ticket.createdBy.id !== user.id) {
      return NextResponse.json({ error: 'Only ticket creator can rate' }, { status: 403 });
    }

    // Only resolved tickets can be rated
    if (ticket.status !== 'resolved') {
      return NextResponse.json({ error: 'Only resolved tickets can be rated' }, { status: 400 });
    }

    // Check if already rated
    if (ticket.rating) {
      return NextResponse.json({ error: 'Ticket already rated' }, { status: 400 });
    }

    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    tickets[ticketIndex].rating = rating;
    tickets[ticketIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({ message: 'Rating submitted successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}