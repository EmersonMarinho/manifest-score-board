const fs = require('fs');
const path = require('path');

// Função para processar o texto da partida
function processMatchData(text) {
  // Dividir o texto em linhas e remover linhas vazias
  const lines = text.split('\n').filter(line => line.trim());
  
  // Remover a linha de cabeçalho
  const dataLines = lines.slice(1);
  
  // Processar cada linha de dados
  const players = dataLines.map(line => {
    const [name, kd, penalties, damage, damageTaken, healing] = line.split('|').map(item => item.trim());
    const [kills, deaths] = kd.split('/').map(num => parseInt(num.trim()));
    
    return {
      name,
      kills,
      deaths,
      debuffs: parseInt(penalties),
      damage: parseInt(damage),
      damageTaken: parseInt(damageTaken),
      healing: parseInt(healing)
    };
  });

  // Criar objeto da partida
  const matchData = {
    date: new Date().toISOString().split('T')[0],
    team1: "MANIFEST",
    team2: "OPONENTE",
    result: "Victory", // Você pode ajustar isso manualmente
    team1Score: 0, // Você pode ajustar isso manualmente
    team2Score: 0, // Você pode ajustar isso manualmente
    team1Players: players
  };

  return matchData;
}

// Função para salvar os dados processados
function saveMatchData(matchData) {
  const outputPath = path.join(__dirname, '../data/match-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(matchData, null, 2));
  console.log(`Dados salvos em: ${outputPath}`);
}

// Exemplo de uso
const matchText = `Jogador | K/D | Penalidades | Dano Aplicado | Dano Recebido | Cura
RadiX | 16 / 4 | 34 | 349067 | 182978 | 139885
BARAK44 | 3 / 1 | 29 | 178610 | 88403 | 91767
Skito | 0 / 1 | 14 | 20752 | 99143 | 99536
Behe | 12 / 5 | 9 | 186527 | 153479 | 100848
Vnbz | 12 / 0 | 20 | 221902 | 148728 | 131994
Hammysz | 0 / 0 | 2 | 686 | 56574 | 61545
Miyeon | 16 / 2 | 26 | 261075 | 117377 | 107101
Lord | 11 / 5 | 18 | 174407 | 140174 | 108624
XIZO | 14 / 5 | 19 | 204489 | 158886 | 104631
RAULBIGODEZ | 13 / 3 | 34 | 269277 | 148470 | 120991`;

const matchData = processMatchData(matchText);
saveMatchData(matchData); 