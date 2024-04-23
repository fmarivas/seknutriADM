require('dotenv').config()
const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const isAuth = require('../controllers/middleware/authMiddleware'); // Importar o middleware se estiver em um arquivo separado
const isLoggedIn = require('../controllers/middleware/firstFactor'); // Importar o middleware se estiver em um arquivo separado
const authenticator = require('../controllers/function/Authenticator')

const keygen = require('../controllers/keygen/keygen')
const NodeCache = require('node-cache')
const tokenCache = new NodeCache()

// Validadores
const loginValidators = [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
];

//GET
router.get('/auth/verify',isLoggedIn, (req,res) => {
	res.render('two-factor-auth')
})

router.get('/login', (req,res) => {
	res.render('login')
})

router.get('/recovery', (req,res) => {
	res.render('recovery')
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.redirect('/login');
    });
});

router.get('/setup-2fa', isAuth, async (req, res) => {
    const userId = req.session.user.id; // Certifique-se de que o userId está disponível na sessão
	const userEmail = req.session.user.email
    try {
        const qrCodeImageUrl = await authenticator.generateQRCode(userId, userEmail);
        res.render('setup-2fa', { qrCodeImageUrl }); // Sempre passe a variável, mesmo que null
    } catch (error) {
        console.error(error);
        res.render('setup-2fa', { qrCodeImageUrl: null, message: "Failed to generate QR Code. Please try again." });
    }
});

router.get('/get-token', async (req,res) =>{
	try{
		const userEmail = req.session.user.email;
		
		 // Verifica se o token está presente no cache para o usuário atual
		 const cachedToken = tokenCache.get(userEmail);
		 
		 if(cachedToken){
			 res.json({ token: cachedToken });
		 }else{
			const NewToken = await keygen.generateToken({email: userEmail}, '1h')
			tokenCache.set(userEmail, NewToken, 3600) 
			res.json({token: NewToken})
		 }
	}catch(err){
		console.error(err)
		res.status(500).json({ error: 'Erro interno do servidor' });
	}	
})

router.get('/:id',isAuth, async (req,res,next) => {
	const id = req.params.id
	
	const pageDetails = {
		users_management: { name: 'Usuários', icon: 'fas fa-users' },
		performance_analysis: { name: 'Desempenho', icon: 'fas fa-chart-line' },
		financial_management: { name: 'Financeiro', icon: 'fas fa-money-bill-wave' },
		error_management: { name: 'Erros', icon: 'fas fa-exclamation-circle' },
		employee_management: { name: 'Funcionários', icon: 'fas fa-user-tie' },
		customer_support: { name: 'Suporte', icon: 'fas fa-headset' }
	};
	let usersData
	let imgData
	try{
		usersData = await User.findAll()
        imgData = await User.getPic(usersData)
	}catch(err){
		console.error(err)
		let error = new Error("Erro de processamento. Tente mais tarde");
		error.status = 500; // Define o status HTTP para o erro
		next(error); // Passa o erro para o middleware de erro		
	}
	
    if (pageDetails[id]) {
        res.render('layout', {
            title: pageDetails[id].name,
            body: id,
            pageDetails: pageDetails,
            page: id,
			usersData: usersData,
			imgData: imgData,
        });
    } else {
		let error = new Error("Page not found");
		error.status = 404; // Define o status HTTP para o erro
		next(error); // Passa o erro para o middleware de erro			
    }
})


//POST
router.post('/login', loginValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Retorna para o login com mensagens de erro de validação
        return res.render('login', {
            errorMessage: errors.array().map(error => error.msg).join(' and '),
            email: req.body.email  // Manter o email preenchido
        });
    }
	
	const { email, password, rememberMe } = req.body;

    try {
        // Procurar usuário pelo email
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.render('login', { errorMessage: "Email not found." });
        }

        // Comparar senha
		const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
		if (isPasswordMatch) {
			// Definindo dados do usuário na sessão
			req.session.user = user
			
			req.session.isAuthenticated = false; // Flag para verificar se o usuário está autenticado
			req.session.loggedIn = true
			// Configurações de cookie baseadas em "remember me"
			if (rememberMe) {
				req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias
			} else {
				req.session.cookie.expires = false; // Sessão expira ao fechar o navegador
			}
			
			req.session.save(err =>{
				if(err){
					console.error("Session save error:", err);
				}
				// Redireciona para o dashboard ou painel de controle
				res.redirect('/auth/verify');	
			})
		} else {
			return res.render('login', { errorMessage: "Invalid password." });
		}
    } catch (error) {
        console.error(error);
        res.render('login', { errorMessage: "An error occurred while processing your request." });
    }	
	
});

router.post('/verify-2fa', isLoggedIn, async (req, res) => {
    const tokenParts = req.body.token;
    if (!tokenParts || !Array.isArray(tokenParts)) {
        return res.render('two-factor-auth', { errorMessage: "Invalid token data." });
    }

    const userToken = tokenParts.join('');
	
    try {
        const userSecretData = await User.getUserSecret(req.session.user.id);
		
        if (!userSecretData) {
            return res.render('two-factor-auth', { errorMessage: "No secret found for user." });
        }

        const is2faValid = await authenticator.verifyTwoFactorAuthCode(userSecretData, userToken);
        if (is2faValid) {
				req.session.isAuthenticated = true;
				req.session.loggedIn = null;

				req.session.save(err => {
					if (err) {
						console.error('Error saving session:', err);
						return res.render('two-factor-auth', { errorMessage: "An error occurred. Please try again." });
					}

					res.redirect('/users_management');
				});
            
        } else {
            return res.render('two-factor-auth', { errorMessage: "Invalid 2FA code." });
        }
    } catch (error) {
        console.error(error);
        res.render('two-factor-auth', { errorMessage: "An error occurred while verifying 2FA code." });
    }
});



module.exports = router