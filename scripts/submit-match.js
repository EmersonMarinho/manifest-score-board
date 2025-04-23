const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { validateMatchData } = require('./validate-match-data');

async function submitMatch() {
  try {
    // Ler os dados processados
    const dataPath = path.join(__dirname, '../data/match-data.json');
    const matchData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Validar dados antes de enviar
    const validation = validateMatchData(matchData);
    if (!validation.isValid) {
      console.error('❌ Dados inválidos:');
      validation.errors.forEach(error => console.error(`- ${error}`));
      return;
    }

    // Confirmar com o usuário
    console.log('\nDados da partida:');
    console.log(`Data: ${matchData.date}`);
    console.log(`Time 1: ${matchData.team1}`);
    console.log(`Time 2: ${matchData.team2}`);
    console.log(`Resultado: ${matchData.result}`);
    console.log(`Placar: ${matchData.team1Score} x ${matchData.team2Score}`);
    console.log(`Número de jogadores: ${matchData.team1Players.length}`);

    // Enviar para a API
    const response = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('\n✅ Partida enviada com sucesso:', result);
  } catch (error) {
    console.error('Erro ao enviar partida:', error);
  }
}

submitMatch(); 