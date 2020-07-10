const jwt = require('jsonwebtoken');


exports.required = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenDecode = jwt.verify(token, process.env.JWT_KEY);
        req.user = tokenDecode;
        next();
    } catch (error) {
        return res.status(401).json({mensagem:'Falha na autenticação'});
    }
};

exports.optional = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenDecode = jwt.verify(token, process.env.JWT_KEY);
        req.user = tokenDecode;
        next();
    } catch (error) {
        return res.status(401).json({mensagem:'Falha na autenticação'});
    }
};