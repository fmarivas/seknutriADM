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

//Sentry configuration
const Sentry = require('@sentry/node');

Sentry.init({
	dsn: process.env.SENTRY_DSN,
})

app.use((req, res, next) => {
    if (req.session && req.session.user) {
        Sentry.configureScope((scope) => {
            scope.setUser({
                id: req.session.user.id,
                email: req.session.user.email
            });
        });
    }
    next();
});



const cors = require('cors');
app.use(cors()); // Isso permite todas as origens, ajuste conforme necessário para produção

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
  saveUninitialized: false,
  store: adminSessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // Uso de HTTPS
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 dias
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
	proxy: true,
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
    // Envia o erro para o Sentry
    Sentry.captureException(err);

    // Processamento de erros específicos por status
    if (err.status === 403) {
        res.status(403).render('error/error403', {err}); // Assume que você tem um arquivo error403.ejs
    } else if (err.status === 404) {
        res.status(404).render('error/error404', {err}); // Pode ser redundante se você já tem um middleware 404
    } else {
        console.error(err.stack); // Log do erro no console do servidor
        res.status(500).render('error/error500', {err}); // Trata todos os outros erros como 500
    }
});

app.use(Sentry.Handlers.errorHandler())

app.listen(port, () =>{
	console.log(`Server running on port ${port}`)
})