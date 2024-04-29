function ensureFirstFactorPassed(req, res, next) {
	 console.log("Session Logged In:", req.session);  // Adicione este log para depuração
    if (req.session.loggedIn) {
        next();
    } else {
        const error = new Error("Access Denied");
        error.status = 401; // Unauthorized
        res.render('login', {errorMessage: error})
    }
}

module.exports = ensureFirstFactorPassed;
