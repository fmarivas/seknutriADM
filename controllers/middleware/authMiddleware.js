// authMiddleware.js
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        next(); // Se autenticado, continua para a próxima função na cadeia
    } else {
        res.redirect('/login'); // Se não estiver autenticado, redireciona para a página de login
    }
}

module.exports = isAuthenticated