import { NextRequest, NextResponse } from 'next/server';

let users = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Support Agent',
    email: 'support@demo.com',
    password: 'support123',
    role: 'support',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'John User',
    email: 'user@demo.com',
    password: 'user123',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

function getUserFromToken(token: string) {
  const userId = token.replace('mock-token-', '');
  return users.find(u => u.id === userId);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userIndex = users.findIndex(u => u.id === params.id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates = await request.json();
    users[userIndex] = { ...users[userIndex], ...updates };

    const { password: _, ...safeUser } = users[userIndex];
    return NextResponse.json(safeUser);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userIndex = users.findIndex(u => u.id === params.id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (params.id === user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    users.splice(userIndex, 1);

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}