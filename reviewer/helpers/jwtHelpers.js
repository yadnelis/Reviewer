const jwt = require('jsonwebtoken');
const moment = require("moment");

exports.getToken = (req) => {
    if(req.headers?.authorization){
        const auth = req.headers.authorization.replace(/^(Bearer )/, '');
        var token = jwt.verify(auth, process.env.JWT);
        if(token) {
            return {
                ...token,
                expiresIn: moment(token.iat * 1000).toISOString()
            }
        }
    }
    else return null;
}