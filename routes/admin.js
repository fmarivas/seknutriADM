require('dotenv').config()
const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const isAuth = require('../controllers/middleware/authMiddleware'); // Importar o middleware se estiver em um arquivo separado
const isLoggedIn = require('../controllers/middleware/firstFactor'); // Importar o middleware se estiver em um arquivo separado
const authenticator = require('../controllers/function/Authenticator')
const PlatformData = require('../controllers/function/PlatformData')

const keygen = require('../controllers/keygen/keygen')
const NodeCache = require('node-cache')
const tokenCache = new NodeCache()

const passport = require('passport');
// Validadores
const loginValidators = [
    check('email').isEmail().withMessage('Enter a valid email address'),
];

//GET
router.get('/login', (req,res) => {
	res.render('login')
})

// Rota para renderizar a autenticação de dois fatores
router.get('/verify', (req, res) => {
	console.log(req.session)
	res.json({user: req.user, session: req.session})
    // if (!req.session.loggedIn) {  // Garante que o usuário está autenticado
        // return res.redirect('/login');
    // }
    // res.render('two-factor-auth', { user: req.user });
});

router.get('/', (req,res) => {
	res.redirect('/login')
})

router.get('/recovery', (req,res) => {
	res.render('recovery')
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
		res.clearCookie(process.env.SESSION_NAME)
        res.redirect('/login');
    });
});

router.get('/setup-2fa', isAuth, async (req, res) => {
    const userId = req.user.id; // Certifique-se de que o userId está disponível na sessão
	const userEmail = req.user.email
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
		const userEmail = req.user.email;
		
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

router.get('/count-users', async (req, res) => {
    try {
        const userCount = await PlatformData.getUserCount();
        res.json({ totalUsers: userCount });
    } catch (err) {
        console.error('Erro na rota /count-users:', err);
        res.status(500).send('Erro ao obter a contagem de usuários');
    }
});

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
			adminData: req.user,
			imgData: imgData,
        });
    } else {
		let error = new Error("Page not found");
		error.status = 404; // Define o status HTTP para o erro
		next(error); // Passa o erro para o middleware de erro			
    }
})


//POST
router.post('/login', loginValidators, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Se usar connect-flash ou flash similar para mensagens de erro
            req.flash('error', {errorMessage: info.message});
            return res.redirect('/login');	
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.loggedIn = true;  // Passou pelo primeiro fator
            req.session.isAuthenticated = false; 
			
            if (req.body.rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;  // 30 dias
            } else {
                req.session.cookie.expires = false;  // Expira ao fechar o navegador
            }
			console.log('Session before redirect: ', req.session)
            return res.redirect('/verify');
        });
    })(req, res, next);
});


router.post('/verify-2fa', async (req, res) => {
    const tokenParts = req.body.token;
	
    if (!tokenParts || !Array.isArray(tokenParts)) {
        return res.render('two-factor-auth', { errorMessage: "Invalid token data." });
    }

    const userToken = tokenParts.join('');
	
    try {
        const userSecretData = await User.getUserSecret(req.user.id);
		
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
			req.flash('error', 'Invalid 2FA code.');
            return res.render('two-factor-auth', { errorMessage: "Invalid 2FA code." });
        }
    } catch (error) {
        console.error(error);
        res.render('two-factor-auth', { errorMessage: "An error occurred while verifying 2FA code." });
    }
});


router.post('/delete-user', isAuth, async (req, res) => {
    const userId = req.body.userId;
	const userEmail = req.session.user.email
	const token = tokenCache.get(userEmail)
	
	if(!userId){
		return res.status(400).json({message: 'Id do usuario não encontrado'})
	}
	if(!token){
		return res.status(401).json({ message: 'Token não encontrado.' });
	}	
	
    try{
		const deleteUser = await User.deleteUserData(userId)
		res.json(deleteUser)
	}catch(err){
		console.error(err)
		return res.status(500).json({ message: 'Erro ao deletar usuario. Tente mais tarde' });
	}
});


module.exports = router