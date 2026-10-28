import { NextResponse, type NextRequest } from "next/server";

// Middleware para proteger rotas
// Executa em todas as requisições que correspondem ao padrão

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
    "/(api|trpc)(.*)",
  ],
};

export async function middleware(request: NextRequest) {
  // Em produção, leríamos o cookie httpOnly via next/headers ou server component
  // Aqui temos o padrão, mas a verificação real acontece no client ou route handlers

  // Exemplo de como verificar:
  // const sessionCookie = request.cookies.get("doc2b_session")?.value;
  // if (!sessionCookie) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  //
  // const validated = validateSession(sessionCookie);
  // if (!validated.valid) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // Para agora: permitir acesso, a verificação real é no route handler
  return NextResponse.next();
}