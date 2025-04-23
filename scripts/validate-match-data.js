const fs = require('fs');
const path = require('path');

function validateMatchData(matchData) {
  const errors = [];

  // Validar campos obrigatórios
  const requiredFields = ['date', 'team1', 'team2', 'result', 'team1Score', 'team2Score', 'team1Players'];
  for (const field of requiredFields) {
    if (!matchData[field]) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Validar data
  if (matchData.date && !isValidDate(matchData.date)) {
    errors.push('Data inválida');
  }

  // Validar resultado
  if (matchData.result && !['Victory', 'Defeat'].includes(matchData.result)) {
    errors.push('Resultado deve ser "Victory" ou "Defeat"');
  }

  // Validar pontuações
  if (matchData.team1Score < 0 || matchData.team2Score < 0) {
    errors.push('Pontuações não podem ser negativas');
  }

  // Validar jogadores
  if (matchData.team1Players) {
    if (!Array.isArray(matchData.team1Players)) {
      errors.push('team1Players deve ser um array');
    } else {
      matchData.team1Players.forEach((player, index) => {
        const playerErrors = validatePlayer(player);
        if (playerErrors.length > 0) {
          errors.push(`Erros no jogador ${index + 1}: ${playerErrors.join(', ')}`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validatePlayer(player) {
  const errors = [];

  // Validar campos obrigatórios do jogador
  const requiredPlayerFields = ['name', 'kills', 'deaths', 'debuffs', 'damage', 'damageTaken', 'healing'];
  for (const field of requiredPlayerFields) {
    if (player[field] === undefined || player[field] === null) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Validar valores numéricos
  if (player.kills < 0) errors.push('Kills não pode ser negativo');
  if (player.deaths < 0) errors.push('Deaths não pode ser negativo');
  if (player.debuffs < 0) errors.push('Debuffs não pode ser negativo');
  if (player.damage < 0) errors.push('Damage não pode ser negativo');
  if (player.damageTaken < 0) errors.push('DamageTaken não pode ser negativo');
  if (player.healing < 0) errors.push('Healing não pode ser negativo');

  // Validar nome
  if (player.name && typeof player.name !== 'string') {
    errors.push('Nome deve ser uma string');
  }

  return errors;
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Função principal de validação
function validateMatchFile() {
  try {
    const dataPath = path.join(__dirname, '../data/match-data.json');
    const matchData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const validation = validateMatchData(matchData);

    if (validation.isValid) {
      console.log('✅ Dados válidos!');
      return true;
    } else {
      console.error('❌ Dados inválidos:');
      validation.errors.forEach(error => console.error(`- ${error}`));
      return false;
    }
  } catch (error) {
    console.error('Erro ao validar dados:', error);
    return false;
  }
}

// Executar validação
validateMatchFile(); 