---
title: bingolive
emoji: 🐳
colorFrom: green
colorTo: purple
sdk: static
pinned: false
tags:
  - deepsite
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

# BingoLive+

Sistema de bingo online com recursos modernos e interface intuitiva.

## Funcionalidades

- Sistema de login e cadastro
- Autenticação social (Google, Facebook, Apple)
- Interface moderna e responsiva
- Integração com Supabase para backend
- Sistema de perfil de usuário

## Tecnologias Utilizadas

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript
- Node.js
- Express.js
- Supabase
- JWT para autenticação

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/Willis1P/BingoLive-.git
cd BingoLive-
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Copie o conteúdo de `.env.example` e preencha com suas credenciais

4. Inicie o servidor:
```bash
npm run dev
```

## Estrutura do Projeto

```
BingoLive+/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── styles/
├── public/
├── index.html
├── server.js
└── package.json
```

## Como Contribuir

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.