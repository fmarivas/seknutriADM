const { conn } = require('./db');
const { getFile } = require('../controllers/AWSConfig');

class User {
    static findAll() {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM users', (err, results) => {
                if (err) {
					console.error(err)
					let error = new Error("DataBase Error");
					error.status = 500; // Define o status HTTP para o erro
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
	
	static async getPic(users) {
		const userPics = await Promise.all(users.map(async (user) => {
			const cleanedUrl = user.profile_pic.includes('https://seknutritionbucket.s3.amazonaws.com/')
							   ? user.profile_pic.replace('https://seknutritionbucket.s3.amazonaws.com/', '')
							   : user.profile_pic;

			if (cleanedUrl.startsWith('profile/')) {
				return getFile(cleanedUrl);  // Aqui você chama getFile para obter a URL assinada
			} else {
				return user.profile_pic;  // Retorna a URL completa se não começar com "profile/"
			}
		}));

		return userPics;
	}



}

module.exports = User;
