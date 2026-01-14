import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

interface User {
    id: string;
    ad: string;
    email: string;
    password: string;
    rol: 'admin' | 'yetkili';
    aktif: boolean;
}

function getUsers(): User[] {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const content = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'E-posta ve şifre gerekli' },
                { status: 400 }
            );
        }

        const users = getUsers();
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return NextResponse.json(
                { error: 'Geçersiz e-posta veya şifre' },
                { status: 401 }
            );
        }

        if (!user.aktif) {
            return NextResponse.json(
                { error: 'Bu hesap devre dışı bırakılmış' },
                { status: 403 }
            );
        }

        // Return user info without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
