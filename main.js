const express = require('express')
const bodyParser = require('body-parser')
const http = require('http');
const { initQuestionsHandler } = require("./reviewer/controllers/question_controller");
const mongoClient = require("./reviewer/mongo_client");
const { initSecurityHandler } = require('./reviewer/controllers/security_controller');
const { initCoursesHandler } = require('./reviewer/controllers/course_controller');
const { getToken } = require('./reviewer/helpers/jwtHelpers');
var cors = require('cors')

const port = process.env.PORT || 4000;
const app = express();



function setMiddleware(app)
{
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });
    app.use(bodyParser.json());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static('./clientapp/dist'));
    app.use(express.static('./public'));

    app.use((req, res, next) => {
        if(req.method !== 'GET' && req.method !== 'OPTIONS' && !req.path.startsWith("/auth/")) {
            var token = getToken(req)
            if(!token) {
                res.sendStatus(403);
            }
        }
        next();
    })
    app.use("/admin", (req, res, next) => {
        var token = getToken(req)
        if(!token) 
            res.sendStatus(403);
        else
            next();
    })

    console.log('configured app middleware')
}


async function main () {
    try {
        app.use(express.static('./public'));
        


        app.get('/status', (req, res) => {
            res.json({
                status: "alive",
            });
        })
        
        app.get('/deprecated-questions', (req, res) => {
            res.sendFile('questions.json', {root: './public'});
        })

        app.get(/app\/.*/, (req, res) => {
            res.sendFile('index.html', {root: './public'});
        })

        let server = http.createServer(app);
        ctx = await mongoClient.init()
        setMiddleware(app);
        initQuestionsHandler(app, ctx);
        initSecurityHandler(app, ctx);
        initCoursesHandler(app, ctx);
        console.log('Server listening on port: ' + port)
        await server.listen(port);
    }
    finally {
        // mongoClient.close();
    }
}

main().catch(console.dir);