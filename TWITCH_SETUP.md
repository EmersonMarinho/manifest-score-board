# Configuração da Integração com Twitch

## Como configurar as credenciais da Twitch API

### 1. Criar uma aplicação na Twitch Developer Console

1. Acesse [https://dev.twitch.tv/console](https://dev.twitch.tv/console)
2. Faça login com sua conta da Twitch
3. Clique em "Register Your Application"
4. Preencha os dados:
   - **Name**: Manifest Guild Website
   - **OAuth Redirect URLs**: `http://localhost:3000` (para desenvolvimento)
   - **Category**: Website Integration
   - **Application Type**: Web Integration

### 2. Obter as credenciais

Após criar a aplicação, você receberá:

- **Client ID**: Uma string alfanumérica
- **Client Secret**: Uma string secreta (clique em "New Secret" se necessário)

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Twitch API Credentials
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
```

### 4. Atualizar a lista de streamers

Edite o arquivo `app/components/TwitchStreams.tsx` e atualize a constante `GUILD_STREAMERS` com os nomes de usuário da Twitch dos membros da guilda:

```typescript
const GUILD_STREAMERS = [
  "vnbz",
  "radix",
  "toushiro",
  "krazor",
  "ftp",
  "behe",
  "hammysz",
  "miyeon",
  "lord",
  "xizo",
  "raulbigodez",
  // Adicione mais membros aqui
];
```

### 5. Testar a integração

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse a homepage
3. A seção "Members Live Now" deve mostrar as streams ativas dos membros

## Funcionalidades

- ✅ Mostra streams ativas dos membros da guilda
- ✅ Thumbnails das streams
- ✅ Contador de viewers
- ✅ Links diretos para as streams
- ✅ Atualização automática a cada 5 minutos
- ✅ Estados de loading e erro
- ✅ Fallback quando não há streams ativas

## Limitações da API da Twitch

- Rate limit: 800 requests por minuto
- Apenas streams ativas são retornadas
- Máximo de 100 streams por requisição
- Thumbnails têm tamanhos específicos

## Troubleshooting

### Erro "Twitch credentials not configured"

- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão corretas
- Reinicie o servidor após adicionar as variáveis

### Erro "Failed to get Twitch access token"

- Verifique se o Client ID e Secret estão corretos
- Confirme se a aplicação está ativa na Twitch Developer Console

### Nenhuma stream aparece

- Verifique se os nomes de usuário na lista estão corretos
- Confirme se os membros estão realmente fazendo stream
- Verifique se as streams são públicas
