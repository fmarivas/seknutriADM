require('dotenv').config()
const express = require('express')
const router = express.Router()

const User = require('../models/user')


router.get('/', (req,res) => {
	res.redirect('/users_management')
})

router.get('/:id', async (req,res,next) => {
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

module.exports = router