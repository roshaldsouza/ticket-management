import { NextRequest, NextResponse } from 'next/server';

let users = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@demo.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Support Agent',
    email: 'support@demo.com',
    role: 'support',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'John User',
    email: 'user@demo.com',
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

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Return users (excluding passwords)
    const safeUsers = users.map(({ ...user }) => user);

    return NextResponse.json(safeUsers);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}