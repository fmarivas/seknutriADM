require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');


class Security {
	static createSecret() {
		const secret = speakeasy.generateSecret({length: 20});
		console.log(secret); // Para debug e verificar todos os aspectos do segredo
		return secret.base32; // Retorna o segredo em formato base32 para armazenamento
	}

    // Função para gerar uma chave segura
    static generateJWTSecret() {
        return crypto.randomBytes(32).toString('hex'); // Gera uma string hexadecimal de 32 bytes
    }

    static async generateToken(email) {
		try {
			const token = await jwtUtils.generateToken({ email: email }, "1h");
			return token;
		} catch (err) {
			console.error(err);
			throw err;
		}
        
    } 
	
	static async generatePasswordHash(password) {
		const saltRounds = 10;  // Aumente o número para mais segurança, mas leva mais tempo
		try {
			const hash = await bcrypt.hash(password, saltRounds);
			return hash;
		} catch (error) {
			console.error('Error hashing password:', error);
		}
		return null;
	}	
}

// Security.generatePasswordHash('Olvinha01').then(hash => {
    // console.log('Password Hash:', hash);
// })

// require('crypto').randomBytes(32, (err, buffer) => {
  // const secret = buffer.toString('hex');
  // console.log(secret);
// });


module.exports = Security;
