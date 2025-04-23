const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurações
const DB_NAME = 'manifest'; // Nome do seu banco de dados
const BACKUP_DIR = path.join(__dirname, '../backups');
const DATE = new Date().toISOString().split('T')[0];

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Comando para fazer o backup
const backupCommand = `mongodump --db ${DB_NAME} --out ${path.join(BACKUP_DIR, DATE)}`;

console.log('Iniciando backup do banco de dados...');

exec(backupCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Erro ao fazer backup:', error);
    return;
  }
  if (stderr) {
    console.error('Erro:', stderr);
    return;
  }
  console.log('Backup concluído com sucesso!');
  console.log(`Backup salvo em: ${path.join(BACKUP_DIR, DATE)}`);
}); 