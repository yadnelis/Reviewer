const { useQuestions } = require("../handlers/questions_handlers.js")
const { getDB } = require("../mongo_client.js")
const { apiResult, handleRes, status } = require("../api_helpers.js")
const jwt = require('jsonwebtoken');
const moment = require("moment");
const { useAccouts } = require("../handlers/account_handler.js");
const { getToken } = require("../helpers/jwtHelpers.js");

exports.initSecurityHandler = (app, ctx) => {
    app.post('/auth/register', async (req, res) => {
        const { postAccount } = useAccouts({db: ctx});
        if(req?.body.adminSecret === process.env.ADMIN_PASS) {
            const result = await postAccount({user: req.body});
            if (result.account) {
                res.json(result.account);
            }
            else if (result.error) {
                res.status(400);
                res.send(result.error);
            }
            else {
                res.sendStatus(500);
            }
        }
        else {
            res.sendStatus(403);
        }
    });

    app.put('/auth/claims', async (req, res) => {
        const { updateClaims } = useAccouts({db: ctx});
        const creds = getToken(req);
        if(creds?.claims?.isWebsiteAdmin || req?.body?.adminSecret === process.env.ADMIN_PASS) {
            const result = await updateClaims(req.body);
            if (result?.claims) {
                const token = jwt.sign(
                    {
                        ...creds,
                        claims: result.claims
                    }, 
                    process.env.JWT,  
                );
                res.json({
                    ...result,
                    token,
                });
            }
            else if (result.error) {
                res.status(400);
                res.send(result.error);
            }
            else {
                res.sendStatus(500);
            }
        }
        else{
            return res.sendStatus(403);
        }
    });

    app.put('/auth/password', async (req, res) => {
        const { resetPassword } = useAccouts({db: ctx});
        const creds = getToken(req);

        if(creds?.claims?.isWebsiteAdmin || req?.body?.adminSecret === process.env.ADMIN_PASS) {
            const result = await resetPassword({username: req.body?.username, password: req.body?.oldPassword, newPassword: req.body?.newPassword});
            if (result?.claims) {
                res.json({success: true});
            }
            else if (result.error) {
                res.status(400);
                res.send(result);
            }
            else {
                res.sendStatus(500);
            }
        }
        else{
            return res.sendStatus(403);
        }
    });

    app.post('/auth/token', async (req, res) => {
        const { verifyCredentials } = useAccouts({db: ctx});
        const result = await verifyCredentials(req.body.username, req.body.password)
            .catch(() => {});
            
        if (result?.credentials) {
            let token = jwt.sign(
                result.credentials, 
                process.env.JWT,  
                { expiresIn: "3h" }
            );
            res.json({
                username: result.credentials.username,
                claims: result.credentials.claims,
                token: token,
                expiresIn: moment().add(3, "hours").toISOString()
            });
        }
        else if (result?.error) {
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
            let token = jwt.verify(auth, process.env.JWT);
            res.json({
                token: token,
                expiresIn: moment(token.iat * 1000).toISOString()
            })
        })

    }
}