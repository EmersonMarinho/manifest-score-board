const fs = require('fs');
const path = require('path');

// Função para carregar variáveis de ambiente do arquivo .env
function loadEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const envContent = fs.readFileSync(filePath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // Remover aspas se existirem
            const cleanValue = value.replace(/^["']|["']$/g, '');
            envVars[key.trim()] = cleanValue;
            process.env[key.trim()] = cleanValue;
          }
        }
      });
      
      console.log(`✅ Arquivo .env carregado: ${filePath}`);
      console.log(`📋 Variáveis encontradas: ${Object.keys(envVars).join(', ')}`);
      return envVars;
    }
  } catch (error) {
    console.log(`❌ Erro ao carregar .env: ${error.message}`);
  }
  return {};
}

// Tentar carregar variáveis de ambiente de múltiplos locais
let envVars = {};
try {
  envVars = loadEnvFile(path.join(__dirname, '../.env'));
} catch (error) {
  console.log('Arquivo .env não encontrado ou erro ao carregar');
}

try {
  const localEnvVars = loadEnvFile(path.join(__dirname, '../.env.local'));
  envVars = { ...envVars, ...localEnvVars };
} catch (error) {
  console.log('Arquivo .env.local não encontrado ou erro ao carregar');
}

// Verificar se foi passada uma string de conexão como argumento
const args = process.argv.slice(2);
let customMongoUri = null;

if (args.length > 0) {
  if (args[0].startsWith('mongodb://') || args[0].startsWith('mongodb+srv://')) {
    customMongoUri = args[0];
    console.log('✅ String de conexão fornecida via argumento de linha de comando');
  } else {
    console.log('❌ Argumento inválido. Use: node backup-db-node.js "mongodb://sua_uri_aqui"');
    process.exit(1);
  }
}

// Importar o modelo Match
const mongoose = require('mongoose');

// Configurações
const BACKUP_DIR = path.join(__dirname, '../backups');
const DATE = new Date().toISOString().split('T')[0];
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Priorizar string de conexão customizada, depois variável de ambiente, depois conexões padrão
    let mongoUri = customMongoUri || process.env.MONGODB_URI || envVars.MONGODB_URI;
    
    if (!mongoUri) {
      // Tentar conexões padrão
      const possibleUris = [
        'mongodb://localhost:27017/manifest',
        'mongodb://127.0.0.1:27017/manifest',
        'mongodb://localhost:27017/manifest-score-board'
      ];
      
      console.log('MONGODB_URI não configurada, tentando conexões padrão...');
      
      for (const uri of possibleUris) {
        try {
          console.log(`Tentando conectar em: ${uri}`);
          await mongoose.connect(uri, { 
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000 
          });
          mongoUri = uri;
          console.log(`✅ Conectado com sucesso em: ${uri}`);
          break;
        } catch (err) {
          console.log(`❌ Falha na conexão: ${uri}`);
          continue;
        }
      }
      
      if (!mongoUri) {
        console.log('⚠️ Não foi possível conectar ao MongoDB. Fazendo backup apenas dos dados estáticos...');
        await backupStaticData();
        return;
      }
    } else {
      console.log(`🔗 Conectando usando: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('✅ Conectado ao MongoDB com sucesso!');
    }
    
    // Definir o schema do Match para o backup
    const playerStatsSchema = new mongoose.Schema({
      name: { type: String, required: true },
      kills: { type: Number, required: true, default: 0 },
      deaths: { type: Number, required: true, default: 0 },
      debuffs: { type: Number, required: true, default: 0 },
      damage: { type: Number, required: true, default: 0 },
      damageTaken: { type: Number, required: true, default: 0 },
      healing: { type: Number, required: true, default: 0 }
    }, { _id: false });

    const matchSchema = new mongoose.Schema({
      date: { type: String, required: true },
      team1: { type: String, required: true },
      team2: { type: String, required: true },
      result: { type: String, required: true, enum: ['Victory', 'Defeat'] },
      team1Score: { type: Number, required: true },
      team2Score: { type: Number, required: true },
      team1Players: [playerStatsSchema],
      team2Players: [playerStatsSchema]
    }, {
      timestamps: true,
      versionKey: false
    });

    const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
    
    // Buscar todos os dados
    console.log('Buscando dados do banco...');
    const matches = await Match.find({}).lean();
    
    // Criar objeto de backup
    const backupData = {
      timestamp: new Date().toISOString(),
      database: 'manifest',
      collections: {
        matches: matches
      },
      metadata: {
        totalMatches: matches.length,
        backupDate: DATE,
        backupTime: TIMESTAMP,
        connectionUri: mongoUri
      }
    };
    
    // Salvar backup em arquivo JSON
    const backupFileName = `backup-${DATE}-${TIMESTAMP}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup do banco concluído com sucesso!');
    console.log(`📁 Arquivo salvo em: ${backupPath}`);
    console.log(`📊 Total de partidas: ${matches.length}`);
    console.log(`🕐 Timestamp: ${backupData.timestamp}`);
    console.log(`🔗 Conexão: ${mongoUri}`);
    
    // Criar também um backup compacto (sem formatação)
    const compactBackupPath = path.join(BACKUP_DIR, `backup-compact-${DATE}-${TIMESTAMP}.json`);
    fs.writeFileSync(compactBackupPath, JSON.stringify(backupData));
    console.log(`📦 Backup compacto salvo em: ${compactBackupPath}`);
    
    // Criar um backup apenas dos dados (sem metadados)
    const dataOnlyBackupPath = path.join(BACKUP_DIR, `data-only-${DATE}-${TIMESTAMP}.json`);
    fs.writeFileSync(dataOnlyBackupPath, JSON.stringify(matches, null, 2));
    console.log(`📋 Backup apenas dos dados salvo em: ${dataOnlyBackupPath}`);
    
    // Fazer backup dos dados estáticos também
    await backupStaticData();
    
  } catch (error) {
    console.error('❌ Erro ao fazer backup do banco:', error.message);
    console.log('Tentando fazer backup dos dados estáticos...');
    await backupStaticData();
  } finally {
    // Fechar conexão
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Conexão com o banco fechada');
    }
  }
}

async function backupStaticData() {
  try {
    console.log('📁 Fazendo backup dos dados estáticos...');
    
    // Backup dos dados estáticos do projeto
    const staticDataPath = path.join(__dirname, '../app/data/matches.ts');
    if (fs.existsSync(staticDataPath)) {
      const staticData = fs.readFileSync(staticDataPath, 'utf8');
      
      const staticBackupPath = path.join(BACKUP_DIR, `static-data-${DATE}-${TIMESTAMP}.ts`);
      fs.writeFileSync(staticBackupPath, staticData);
      console.log(`📋 Dados estáticos salvos em: ${staticBackupPath}`);
    }
    
    // Backup de outros arquivos importantes
    const importantFiles = [
      '../app/models/Match.ts',
      '../app/lib/mongodb.ts',
      '../package.json',
      '../README.md'
    ];
    
    for (const file of importantFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(file);
        const backupPath = path.join(BACKUP_DIR, `${fileName}-${DATE}-${TIMESTAMP}`);
        fs.copyFileSync(filePath, backupPath);
        console.log(`📄 ${fileName} copiado para: ${backupPath}`);
      }
    }
    
    console.log('✅ Backup dos dados estáticos concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao fazer backup dos dados estáticos:', error.message);
  }
}

// Executar backup
backupDatabase();
