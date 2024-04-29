function ensureFirstFactorPassed(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        const error = new Error("Access Denied");
        error.status = 401; // Unauthorized
        res.render('login', {errorMessage: error})
    }
}

module.exports = ensureFirstFactorPassed;
