import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Verifica se a senha está correta
    if (password === process.env.ADMIN_PASSWORD) {
      // Define o cookie de autenticação
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_token', process.env.ADMIN_TOKEN!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 horas
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Senha incorreta' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 