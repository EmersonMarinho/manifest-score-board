const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurações
const DB_NAME = 'manifest'; // Nome do seu banco de dados
const BACKUP_DIR = path.join(__dirname, '../backups');

// Listar backups disponíveis
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(file => fs.statSync(path.join(BACKUP_DIR, file)).isDirectory())
  .sort()
  .reverse();

if (backups.length === 0) {
  console.error('Nenhum backup encontrado!');
  process.exit(1);
}

// Usar o backup mais recente
const latestBackup = backups[0];
const backupPath = path.join(BACKUP_DIR, latestBackup);

console.log(`Restaurando backup de: ${latestBackup}`);

// Comando para restaurar o backup
const restoreCommand = `mongorestore --db ${DB_NAME} --drop ${backupPath}/${DB_NAME}`;

exec(restoreCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Erro ao restaurar backup:', error);
    return;
  }
  if (stderr) {
    console.error('Erro:', stderr);
    return;
  }
  console.log('Backup restaurado com sucesso!');
}); 