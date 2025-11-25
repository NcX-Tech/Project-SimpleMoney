# SimpleMoney

Aplicativo web para gerenciamento financeiro pessoal, desenvolvido com React e Next.js.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Next.js 14** - Framework React com App Router
- **Tailwind CSS** - Framework CSS utilitário
- **Tanstack Query** - Gerenciamento de estado do servidor e cache
- **Zustand** - Gerenciamento de estado global leve e simples
- **Lucide React** - Biblioteca de ícones

## 📋 Requisitos Técnicos Implementados

✅ **Frontend:**
- React/Next.js com roteamento (Next.js App Router)
- CSS profissional com Tailwind CSS
- Tanstack Query para gerenciamento de dados
- Zustand para gerenciamento de estado global

## 🎨 Telas Implementadas

1. **Tela de Carregamento** (`/`) - Tela inicial com logo e animação
2. **Tela de Login** (`/login`) - Autenticação de usuários
3. **Tela de Registro** (`/register`) - Criação de nova conta
4. **Tela de Recuperação de Senha** (`/forgot-password`) - Recuperação de senha via email

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Project-SimpleMoney
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:3000` no navegador

## 📁 Estrutura do Projeto

```
Project-SimpleMoney/
├── app/                    # Páginas e rotas (Next.js App Router)
│   ├── layout.jsx         # Layout raiz da aplicação
│   ├── page.jsx           # Página inicial (Loading)
│   ├── providers.jsx      # Providers (Tanstack Query)
│   ├── globals.css        # Estilos globais
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── forgot-password/   # Página de recuperação de senha
├── components/            # Componentes reutilizáveis
│   └── ui/                # Componentes de UI
│       ├── Button.jsx     # Botão reutilizável
│       ├── Input.jsx      # Input reutilizável
│       ├── Checkbox.jsx   # Checkbox reutilizável
│       └── Select.jsx     # Select reutilizável
├── lib/                   # Utilitários e configurações
│   └── store.js           # Store Zustand (estado global)
└── public/                # Arquivos estáticos
```

## 🎯 Funcionalidades

- ✅ Autenticação de usuários (simulada)
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Design responsivo (Mobile e Desktop)
- ✅ Persistência de estado no localStorage
- ✅ Validação de formulários
- ✅ Feedback visual de carregamento

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🔧 Configuração

O projeto utiliza:
- **Tailwind CSS** para estilização
- **Zustand** com persist middleware para estado global
- **Tanstack Query** para gerenciamento de dados do servidor
- **Next.js App Router** para roteamento

## 📱 Responsividade

O projeto foi desenvolvido priorizando Desktop, mas é totalmente responsivo para dispositivos móveis, utilizando as classes do Tailwind CSS com breakpoints (`sm:`, `md:`, `lg:`).

## 🎨 Paleta de Cores

- **Primary (Roxo)**: `#9333ea` - Cor principal do SimpleMoney
- **Gray**: Tons de cinza para textos e backgrounds
- **White**: Backgrounds e elementos claros

## 📄 Licença

MIT License - veja o arquivo LICENSE para mais detalhes.
