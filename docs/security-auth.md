# Segurança e Autenticação — Paycheck

Este documento descreve as políticas de segurança e a estratégia de autenticação baseada em rotação de sessões do **Paycheck**.

---

## 1. Estratégia de Autenticação (Auth.js v5)

O Paycheck utiliza a biblioteca **Auth.js v5** (anteriormente conhecida como NextAuth.js) para gerenciar o fluxo de login de forma segura. O sistema suporta dois modos de entrada:

1. **Credenciais Locais (E-mail/Senha)**:
   - As senhas nunca são salvas em texto puro.
   - São hasheadas utilizando o algoritmo **bcrypt** com um fator de custo (salts) de `12 rounds` para impedir ataques de dicionário e rainbow tables.
2. **Provedor Externo (Google OAuth)**:
   - Integração com provedor de identidade do Google para login rápido e seguro, sem necessidade de armazenamento de senhas locais.

---

## 2. JWT Session Expiry & Rotation (Expiração e Rotação a cada 1 Hora)

Como medida crítica de segurança para prevenir o **Session Hijacking** (roubo de cookies/credenciais de sessão), implementamos uma política rígida de expiração e rotação de JSON Web Tokens (JWT) a cada **1 hora (3600 segundos)**.

### 2.1. Como funciona o fluxo de expiração
- Ao fazer login com sucesso, um token JWT criptografado é gerado com validade máxima de 1 hora (`maxAge: 3600`).
- Este token é enviado ao navegador do usuário em um cookie seguro configurado com as seguintes flags de proteção:
  - **`HttpOnly`**: Bloqueia o acesso ao cookie via scripts executados no navegador (evita roubo por vulnerabilidades XSS).
  - **`Secure`**: Força o tráfego do cookie apenas sob conexões criptografadas (HTTPS).
  - **`SameSite=Lax`**: Mitiga ataques do tipo Cross-Site Request Forgery (CSRF).

### 2.2. Fluxo de Rotação de Tokens (Refresh Token Rotation)
Para evitar que o usuário seja desconectado abruptamente a cada 60 minutos enquanto estiver utilizando ativamente a aplicação, implementamos um fluxo de atualização automática:

1. **Validação**: Cada chamada feita às rotas da API ou carregamento de páginas passa pelo Middleware. O Middleware inspeciona o campo `exp` (timestamp de expiração) do JWT.
2. **Refazer a Rotação**:
   - Se o token expirar em **menos de 15 minutos** (limiar de refresh) e o usuário estiver ativo, o Auth.js no servidor gera um novo JWT assinado com uma nova data de validade de +1 hora e atualiza o cookie do cliente.
   - Se o token passar do limite de 1 hora sem nenhuma atividade do usuário, a sessão é declarada inválida, o cookie é limpo e o usuário é redirecionado para a tela de `/login`.

---

## 3. Isolamento e Ownership de Dados

Uma das maiores falhas de segurança em sistemas multi-inquilino (multi-tenant) é a falta de isolamento adequado de dados. No Paycheck, aplicamos as seguintes regras obrigatórias de segurança no código:

1. **Obtenção do Identificador do Usuário**:
   - O `userId` é extraído **estritamente da sessão segura decodificada no servidor** (via `auth()` do Auth.js).
   - Nunca confiamos em IDs de usuário ou emails enviados via corpo da requisição HTTP (body), parâmetros de URL (query params) ou cabeçalhos modificáveis.
2. **Filtro de Consulta**:
   - Toda e qualquer operação de leitura, atualização ou exclusão no banco de dados filtra obrigatoriamente por `userId`.
   - Exemplo de exclusão segura:
     ```typescript
     prisma.transaction.deleteMany({
       where: {
         id: transactionId,
         userId: session.user.id
       }
     })
     ```
