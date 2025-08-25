import { NextRequest, NextResponse } from 'next/server';

// Mock users database - in a real app, this would be a proper database
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

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In a real app, hash this password
      role: role || 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}