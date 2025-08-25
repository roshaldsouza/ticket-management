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
    comments: [
      {
        id: '1',
        content: 'Thank you for reporting this issue. I will investigate and get back to you soon.',
        createdAt: '2024-01-15T11:00:00Z',
        user: {
          id: '2',
          name: 'Support Agent',
          email: 'support@demo.com',
          role: 'support'
        }
      }
    ]
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
    comments: [
      {
        id: '2',
        content: 'I have fixed the email notification service. Please check if you are receiving notifications now.',
        createdAt: '2024-01-15T09:00:00Z',
        user: {
          id: '2',
          name: 'Support Agent',
          email: 'support@demo.com',
          role: 'support'
        }
      }
    ],
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

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Filter tickets based on user role
    let userTickets = tickets;
    
    if (user.role === 'user') {
      userTickets = tickets.filter(t => t.createdBy.id === user.id);
    } else if (user.role === 'support') {
      userTickets = tickets.filter(t => t.assignedTo?.id === user.id || t.createdBy.id === user.id);
    }
    // Admins see all tickets

    return NextResponse.json(userTickets);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { subject, description, priority } = await request.json();

    const newTicket = {
      id: (tickets.length + 1).toString(),
      subject,
      description,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user,
      comments: []
    };

    tickets.push(newTicket);

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}