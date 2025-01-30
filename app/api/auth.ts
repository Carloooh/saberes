// import { NextRequest, NextResponse } from 'next/server';
// import db from '@/db/db';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const SECRET = process.env.JWT_SECRET || 'secreto';

// // 🔹 Login
// export async function POST(req: NextRequest) {
//     const { email, password } = await req.json();
//     const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

//     if (!user || !bcrypt.compareSync(password, user.password)) {
//         return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
//     }

//     const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
//     return NextResponse.json({ token, user });
// }

// // 🔹 Obtener sesión
// export async function GET(req: NextRequest) {
//     const token = req.cookies.get('auth-token');
//     if (!token) return NextResponse.json({ user: null });

//     try {
//         const decoded = jwt.verify(token, SECRET);
//         return NextResponse.json({ user: decoded });
//     } catch {
//         return NextResponse.json({ user: null });
//     }
// }
