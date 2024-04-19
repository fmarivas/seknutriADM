require('dotenv').config();
const mysql = require('mysql');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost', // Host do banco de dados (padrão: 'localhost')
  user: process.env.DB_USER || 'root', // Nome de usuário do banco de dados (padrão: 'root')
  password: process.env.DB_PASSWORD || '', // Senha do banco de dados (padrão: vazio)
  database: process.env.DB_NAME || 'db_nutrisekhmet' // Nome do banco de dados (padrão: 'db_nutrisekhmet')
};

const conn = mysql.createConnection(dbConfig)

conn.connect((err) =>{
	if(err){
		console.error(err)
		return;
	}
});

module.exports= {
	conn
}