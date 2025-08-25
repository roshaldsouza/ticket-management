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

    // Return users (excluding passwords)
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(safeUsers);

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

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In a real app, hash this
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}