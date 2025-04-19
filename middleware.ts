import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verifica se a rota é uma rota de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permite acesso à página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Verifica se existe um token de autenticação válido
    const authToken = request.cookies.get('admin_token')
    
    if (!authToken) {
      // Redireciona para a página de login se não estiver autenticado
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verifica se o token é válido
    const isValidToken = validateToken(authToken.value)
    
    if (!isValidToken) {
      // Redireciona para a página de login se o token for inválido
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Função para validar o token
function validateToken(token: string): boolean {
  return token === process.env.ADMIN_TOKEN
}

// Configuração das rotas que o middleware deve interceptar
export const config = {
  matcher: '/admin/:path*',
} 