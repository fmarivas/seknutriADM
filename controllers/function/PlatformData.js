const { conn } = require('../../models/db'); // Importando a conexão com o banco de dados

class PlatformData {
    // Contar usuários da plataforma
	static async getUserCount() {
		return new Promise((resolve, reject) => {
			// Atualiza a query para incluir uma condição WHERE
			const query = 'SELECT COUNT(*) AS count FROM users WHERE role = 0';
			conn.query(query, (err, results) => {
				if (err) {
					console.error('Erro ao contar usuários:', err);
					reject(err);
				} else {
					resolve(results[0].count); // Retorna o número de usuários comuns
				}
			});
		});
	}


    // Método para buscar logs (exemplo genérico)
    // static async getLogs() {
        // return new Promise((resolve, reject) => {
            // const query = 'SELECT * FROM logs ORDER BY created_at DESC';
            // conn.query(query, (err, results) => {
                // if (err) {
                    // console.error('Erro ao buscar logs:', err);
                    // reject(err);
                // } else {
                    // resolve(results);
                // }
            // });
        // });
    // }

    // Outros métodos para diferentes tipos de dados podem ser adicionados aqui
}

module.exports = PlatformData;
