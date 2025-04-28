const { useQuestions } = require("../handlers/questions_handlers.js")
const { getDB } = require("../mongo_client.js")
const { apiResult, handleRes, status } = require("../api_helpers.js")
const jwt = require('jsonwebtoken');
const moment = require("moment");
const { useAccouts } = require("../handlers/account_handler.js")

exports.initSecurityHandler = (app, ctx) => {
    app.post('/auth/register', async (req, res) => {
        const { postAccount } = useAccouts({db: ctx});
        const result = await postAccount({user: req.body});
        if (result.account) {
            res.json(result.account);
        }
        else if (result.error) {
            res.status(500);
            res.send(result.error);
        }
        else {
            res.sendStatus(500);
        }
    });

    app.post('/auth/token', async (req, res) => {
        const { verifyCredentials } = useAccouts({db: ctx});
        const result = await verifyCredentials(req.body.username, req.body.password)
            .catch(() => {});
            
        if (result.credentials) {
            var token = jwt.sign(
                result.credentials, 
                process.env.JWT,  
                { expiresIn: "3h" }
            );
            res.json({
                token: token,
                expiresIn: moment().add(3, "hours").toISOString()
            });
        }
        else if (result.error) {
            res.status(403);
            res.send(result.error);
        }
        else {
            res.sendStatus(403);
        }
    })

    if(process.env.NODE_ENV = "dev") {
        app.get('/auth/token', async (req, res) => {
            const auth = req.headers.authorization.replace(/^(Bearer )/, '');
            var token = jwt.verify(auth, process.env.JWT);
            res.json({
                token: token,
                expiresIn: moment(token.iat * 1000).toISOString()
            })
        })

    }
}