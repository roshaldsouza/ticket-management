import { NextRequest, NextResponse } from 'next/server';

// Mock users database
const users = [
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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // In a real app, you would generate a proper JWT token
    const token = `mock-token-${user.id}`;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}