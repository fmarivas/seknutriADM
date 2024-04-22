require('dotenv').config()

const express = require('express')
const path = require('path')
const routes = require('./routes/admin')
const {conn} = require('./models/db')

const mysql = require('mysql')
 
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session); 
const passport = require('passport')

const app = express()
const port = process.env.PORT ||  8000

//Guardar as sessoes
const adminSessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,  // Limpa as sessões expiradas a cada 15 minutos
  expiration: 86400000,  // Sessões expiram após 24 horas
  schema: {
    tableName: 'admin_sessions',  // Nome específico para a tabela de sessões de administradores
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, conn);
  
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: adminSessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // Uso de HTTPS
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 dias
    sameSite: 'strict'
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use(express.static(path.join(__dirname, 'public')))
app.use('/', routes)

// error
app.use((err, req, res, next) => {
    if (err.status === 403) {
        res.status(403).render('error/error403', {err}); // Assume que você tem um arquivo error403.ejs
    } else if (err.status === 404) {
        res.status(404).render('error/error404', {err}); // Pode ser redundante se você já tem um middleware 404
    } else {
        console.error(err.stack); // Log do erro no console do servidor
        res.status(500).render('error/error500', {err }); // Trata todos os outros erros como 500
    }
});

app.listen(port, () =>{
	console.log(`Server running on port ${port}`)
})