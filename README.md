# Manifest Score Board

Aplicação web para acompanhamento de estatísticas de GvG (Guild vs Guild) do jogo Black Desert Online.

## 🚀 Funcionalidades

- **Upload de Screenshots**: Extração automática de dados de resultados de GvG através de screenshots
- **Estatísticas Detalhadas**: 
  - Histórico completo de partidas
  - Estatísticas por jogador
  - Comparação entre guilds rivais
  - Gráficos de desempenho
- **Leaderboard**: Ranking de jogadores baseado em diferentes métricas
- **Área Administrativa**: Gerenciamento de dados e configurações

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - Recharts (gráficos)
- **Backend**:
  - Python (OCR e processamento de imagens)
  - FastAPI
  - MongoDB (armazenamento de dados)

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- Python (v3.9 ou superior)
- MongoDB
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/EmersonMarinho/manifest-score-board.git
cd manifest-score-board
```

2. Instale as dependências do frontend:
```bash
npm install
# ou
yarn install
```

3. Instale as dependências do backend:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. Inicie o servidor de desenvolvimento:
```bash
# Terminal 1 - Frontend
npm run dev
# ou
yarn dev

# Terminal 2 - Backend
cd backend
python main.py
```

## 📁 Estrutura do Projeto

```
manifest-score-board/
├── app/                    # Frontend Next.js
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   └── styles/            # Estilos globais
├── backend/               # Backend Python
│   ├── api/              # Endpoints da API
│   ├── models/           # Modelos de dados
│   └── utils/            # Utilitários
└── public/               # Arquivos estáticos
```

## 📊 Funcionalidades Principais

### Upload de Screenshots
- Suporte para diferentes formatos de imagem
- Extração automática de dados como:
  - Nomes das guilds
  - Pontuações
  - Estatísticas dos jogadores
  - Resultado da partida

### Estatísticas de Rivalidade
- Comparação detalhada com guilds rivais
- Histórico de partidas
- Gráficos de desempenho
- Estatísticas por jogador
- Top performers

### Leaderboard
- Ranking por diferentes métricas:
  - K/D Ratio
  - Total de kills
  - Dano causado
  - Debuffs aplicados
  - Taxa de vitória

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Adicionar mais tipos de gráficos e visualizações
- [ ] Melhorar a precisão do OCR
- [ ] Adicionar suporte para mais formatos de screenshot
- [ ] Implementar notificações para novas partidas

## 📞 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.
