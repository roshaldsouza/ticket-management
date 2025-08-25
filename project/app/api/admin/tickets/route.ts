import { NextRequest, NextResponse } from 'next/server';

// Mock database
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Admins see all tickets
    return NextResponse.json(tickets);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}