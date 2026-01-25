# Kronos - Loja de Relógios E-commerce

Projeto de e-commerce de relógios com sistema de autenticação e gestão de roles (user/admin).

## Estrutura do Projeto

- **Frontend**: `Kronos-app/` - React com Vite
- **Backend**: `Kronos/` - Node.js com Express

## Configuração Inicial

### 1. Frontend (Kronos-app)

```bash
cd Kronos-app
npm install
```

Crie um arquivo `.env` na pasta `Kronos-app` com:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### 2. Backend (Kronos)

```bash
cd Kronos
npm install
```

Crie um arquivo `.env` na pasta `Kronos` com:

```
PORT=5000
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
```

Para iniciar o servidor:

```bash
npm run dev
```

O backend estará disponível em `http://localhost:5000`

## Base de Dados

A base de dados já está configurada no Supabase com as seguintes tabelas:

- `profiles` - Perfis de usuário com roles (user/admin)
- `products` - Produtos da loja
- `orders` - Pedidos
- `order_items` - Itens dos pedidos

O trigger `handle_new_user()` cria automaticamente um perfil com role 'user' quando um novo usuário se registra.

## Funcionalidades Implementadas

- ✅ Página Home com botões para Login e Signup
- ✅ Formulário de Signup (nome, email, password)
- ✅ Integração com Supabase Auth
- ✅ Criação automática de perfil com role 'user'
- ✅ React Router configurado

## Próximos Passos

- Implementar página de Login
- Criar página de produtos
- Implementar carrinho de compras
- Criar área administrativa
- Implementar sistema de checkout
