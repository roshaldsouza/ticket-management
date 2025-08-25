import { NextRequest, NextResponse } from 'next/server';

// Mock database - same as in tickets/route.ts
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const ticket = tickets.find(t => t.id === params.id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'user' && ticket.createdBy.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(ticket);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const ticket = tickets.find(t => t.id === params.id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'user' && ticket.createdBy.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();

    // Update ticket
    const ticketIndex = tickets.findIndex(t => t.id === params.id);
    
    if (user.role === 'user') {
      // Users can only update subject and description
      tickets[ticketIndex] = {
        ...ticket,
        subject: updates.subject || ticket.subject,
        description: updates.description || ticket.description,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Support agents and admins can update everything
      const assignedTo = updates.assignedTo 
        ? users.find(u => u.id === updates.assignedTo) 
        : ticket.assignedTo;

      tickets[ticketIndex] = {
        ...ticket,
        ...updates,
        assignedTo,
        updatedAt: new Date().toISOString()
      };
    }

    return NextResponse.json(tickets[ticketIndex]);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}