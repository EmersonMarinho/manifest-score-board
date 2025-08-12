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
            const cleanValue = value.replace(/^["']|["']$/g, '');
            envVars[key.trim()] = cleanValue;
            process.env[key.trim()] = cleanValue;
          }
        }
      });
      
      console.log(`✅ Arquivo .env carregado: ${filePath}`);
      return envVars;
    }
  } catch (error) {
    console.log(`❌ Erro ao carregar .env: ${error.message}`);
  }
  return {};
}

// Carregar variáveis de ambiente
let envVars = {};
try {
  envVars = loadEnvFile(path.join(__dirname, '../.env'));
} catch (error) {
  console.log('Arquivo .env não encontrado ou erro ao carregar');
}

// Importar o modelo Match
const mongoose = require('mongoose');

// Definir o schema do Match para o script
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

// Função para normalizar nomes (remover espaços extras, converter para lowercase)
function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Função para encontrar nomes similares
function findSimilarNames(playerNames) {
  const normalizedNames = new Map();
  const similarGroups = [];
  
  playerNames.forEach(name => {
    const normalized = normalizeName(name);
    if (!normalizedNames.has(normalized)) {
      normalizedNames.set(normalized, []);
    }
    normalizedNames.get(normalized).push(name);
  });
  
  // Agrupar nomes similares
  normalizedNames.forEach((names, normalized) => {
    if (names.length > 1) {
      similarGroups.push({
        normalized,
        names: names.sort(),
        count: names.length
      });
    }
  });
  
  return similarGroups;
}

// Função para sugerir nome padrão
function suggestStandardName(names) {
  // Priorizar nomes sem espaços extras
  const cleanNames = names.filter(name => name.trim() === name);
  if (cleanNames.length > 0) {
    return cleanNames[0];
  }
  
  // Priorizar nomes com primeira letra maiúscula
  const capitalizedNames = names.filter(name => 
    name.charAt(0) === name.charAt(0).toUpperCase() && 
    name.slice(1) === name.slice(1).toLowerCase()
  );
  if (capitalizedNames.length > 0) {
    return capitalizedNames[0];
  }
  
  // Retornar o primeiro nome
  return names[0];
}

// Função para consolidar nomes de jogadores
async function consolidatePlayerNames() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || envVars.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não configurada');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Buscar todas as partidas
    console.log('📊 Buscando dados do banco...');
    const matches = await Match.find({}).lean();
    
    // Coletar todos os nomes únicos de jogadores
    const allPlayerNames = new Set();
    matches.forEach(match => {
      match.team1Players.forEach(player => allPlayerNames.add(player.name));
      match.team2Players.forEach(player => allPlayerNames.add(player.name));
    });
    
    const playerNamesArray = Array.from(allPlayerNames);
    console.log(`📋 Total de nomes únicos encontrados: ${playerNamesArray.length}`);
    
    // Encontrar nomes similares
    console.log('🔍 Analisando nomes similares...');
    const similarGroups = findSimilarNames(playerNamesArray);
    
    if (similarGroups.length === 0) {
      console.log('✅ Nenhum nome similar encontrado!');
      return;
    }
    
    console.log(`\n📝 Grupos de nomes similares encontrados:`);
    similarGroups.forEach((group, index) => {
      console.log(`\n${index + 1}. ${group.normalized} (${group.count} variações):`);
      group.names.forEach(name => console.log(`   - "${name}"`));
      const suggested = suggestStandardName(group.names);
      console.log(`   → Nome sugerido: "${suggested}"`);
    });
    
    // Criar mapeamento de nomes
    const nameMapping = {};
    similarGroups.forEach(group => {
      const standardName = suggestStandardName(group.names);
      group.names.forEach(name => {
        if (name !== standardName) {
          nameMapping[name] = standardName;
        }
      });
    });
    
    console.log(`\n🔄 Mapeamento de nomes criado:`);
    Object.entries(nameMapping).forEach(([oldName, newName]) => {
      console.log(`   "${oldName}" → "${newName}"`);
    });
    
    // Salvar mapeamento em arquivo
    const mappingPath = path.join(__dirname, '../backups/name-mapping.json');
    const mappingData = {
      timestamp: new Date().toISOString(),
      totalMatches: matches.length,
      totalUniqueNames: playerNamesArray.length,
      similarGroups: similarGroups.length,
      mapping: nameMapping
    };
    
    fs.writeFileSync(mappingPath, JSON.stringify(mappingData, null, 2));
    console.log(`\n💾 Mapeamento salvo em: ${mappingPath}`);
    
    // Aplicar mudanças automaticamente
    console.log('\n🔄 Aplicando mudanças automaticamente...');
    await applyNameChanges(nameMapping);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Conexão com o banco fechada');
    }
  }
}

// Função para aplicar as mudanças (descomente para usar)
async function applyNameChanges(nameMapping) {
  try {
    console.log('\n🔄 Aplicando mudanças no banco de dados...');
    
    const matches = await Match.find({});
    let updatedMatches = 0;
    
    for (const match of matches) {
      let matchUpdated = false;
      
      // Atualizar team1Players
      match.team1Players.forEach(player => {
        if (nameMapping[player.name]) {
          player.name = nameMapping[player.name];
          matchUpdated = true;
        }
      });
      
      // Atualizar team2Players
      match.team2Players.forEach(player => {
        if (nameMapping[player.name]) {
          player.name = nameMapping[player.name];
          matchUpdated = true;
        }
      });
      
      if (matchUpdated) {
        await match.save();
        updatedMatches++;
      }
    }
    
    console.log(`✅ ${updatedMatches} partidas atualizadas com sucesso!`);
    console.log('🎉 Consolidação de nomes concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar mudanças:', error.message);
  }
}

// Executar o script
consolidatePlayerNames();
