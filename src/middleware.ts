import { NextResponse } from "next/server";

// Middleware para proteger rotas
// Executa em todas as requisições que correspondem ao padrão

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
    "/(api|trpc)(.*)",
  ],
};

export async function middleware(request) {
  // Em produção, leríamos o cookie httpOnly via next/headers ou server component
  // Aqui temos o padrão, mas a verificação real acontece no client ou route handlers

  // Para agora: permitir acesso, a verificação real é no route handler
  return NextResponse.next();
}