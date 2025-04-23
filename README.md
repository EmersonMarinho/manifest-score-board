# MANIFEST Gaming Guild - Sistema de Estatísticas

## 🎮 Sobre o Projeto
Sistema de gerenciamento de estatísticas para a guilda MANIFEST no Black Desert Online. O projeto permite o registro e análise de partidas, estatísticas de jogadores e composições de times.

## 🚀 Tecnologias Utilizadas
- **Next.js 14** - Framework React com suporte a SSR e API Routes
- **TypeScript** - Tipagem estática para maior segurança e melhor desenvolvimento
- **MongoDB** - Banco de dados NoSQL para armazenamento flexível
- **Mongoose** - ODM para MongoDB
- **Tailwind CSS** - Framework CSS para estilização rápida e responsiva
- **Node.js** - Runtime JavaScript para scripts e automação

## 💻 Funcionalidades Principais

### 1. Sistema de Estatísticas
- Registro de partidas com detalhes completos
- Estatísticas individuais de jogadores (K/D, dano, cura, etc.)
- Análise de desempenho por jogador
- Visualização de histórico de partidas

### 2. API RESTful
- Endpoints para CRUD de partidas
- Validação de dados
- Tratamento de erros
- Respostas padronizadas

### 3. Interface Responsiva
- Design moderno e intuitivo
- Visualização de dados em gráficos
- Navegação simplificada
- Adaptação para diferentes dispositivos

### 4. Automação
- Scripts para processamento de dados
- Validação automática de informações
- Backup do banco de dados
- Importação de dados via texto

## 🛠️ Estrutura do Projeto
```
manifestwebsite/
├── app/                    # Código principal da aplicação
│   ├── api/               # Endpoints da API
│   ├── components/        # Componentes React reutilizáveis
│   ├── models/           # Modelos do MongoDB
│   └── pages/            # Páginas da aplicação
├── data/                  # Dados estáticos e backups
├── public/               # Arquivos públicos
└── scripts/              # Scripts de automação
```

## 🔧 Configuração do Ambiente

1. **Pré-requisitos**
   - Node.js 18+
   - MongoDB
   - npm ou yarn

2. **Instalação**
   ```bash
   # Clonar o repositório
   git clone [URL_DO_REPOSITÓRIO]

   # Instalar dependências
   npm install

   # Configurar variáveis de ambiente
   cp .env.example .env.local

   # Iniciar o servidor de desenvolvimento
   npm run dev
   ```

3. **Configuração do Banco de Dados**
   - Criar banco de dados MongoDB
   - Configurar string de conexão no .env.local
   - Executar scripts de inicialização

## 📊 Modelo de Dados

### Partida (Match)
```typescript
interface Match {
  date: string;
  team1: string;
  team2: string;
  result: 'Victory' | 'Defeat';
  team1Score: number;
  team2Score: number;
  team1Players: PlayerStats[];
  team2Players: PlayerStats[];
}
```

### Estatísticas do Jogador (PlayerStats)
```typescript
interface PlayerStats {
  name: string;
  kills: number;
  deaths: number;
  debuffs: number;
  damage: number;
  damageTaken: number;
  healing: number;
}
```

## 🚀 Scripts Úteis

### Processamento de Dados
```bash
# Processar dados de uma partida
node scripts/quick-submit.js

# Fazer backup do banco de dados
node scripts/backup-db.js

# Restaurar backup
node scripts/restore-db.js
```

## 🔍 Pontos de Destaque para Portfólio

1. **Arquitetura Moderna**
   - Uso de Next.js 14 com App Router
   - API Routes para backend
   - TypeScript para tipagem estática

2. **Boas Práticas**
   - Código organizado e documentado
   - Validação de dados
   - Tratamento de erros
   - Testes automatizados

3. **Recursos Técnicos**
   - Integração com MongoDB
   - Automação de processos
   - Interface responsiva
   - Visualização de dados

4. **Aspectos de DevOps**
   - Scripts de backup
   - Configuração de ambiente
   - Documentação clara
   - Versionamento com Git

## 📈 Melhorias Futuras
- [ ] Sistema de autenticação
- [ ] Dashboard administrativo
- [ ] Exportação de relatórios
- [ ] Integração com Discord
- [ ] Sistema de notificações

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
