const express = require('express')
const bodyParser = require('body-parser')
const http = require('http');
const { initQuestionsHandler } = require("./reviwer/controllers/question_controller");
const mongoClient = require("./reviwer/mongo_client");
const { initSecurityHandler } = require('./reviwer/controllers/security_controller');

const port = process.env.PORT || 4000;
const app = express();



function setMiddleware(app)
{
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static('./clientapp/dist'));
    app.use(express.static('./public'));
    console.log('configured app middleware')
}


async function main () {
    try {
        app.use(express.static('./public'));
        
        app.get('/', (req, res) => {
            res.sendFile('app/index.html', {root: './public'});
        })
        
        app.get('/deprecated-questions', (req, res) => {
            res.sendFile('questions.json', {root: './public'});
        })

        let server = http.createServer(app);
        ctx = await mongoClient.init()
        setMiddleware(app);
        initQuestionsHandler(app, ctx);
        initSecurityHandler(app, ctx)
        console.log('Server listening on port: ' + port)
        await server.listen(port);
    }
    finally {
        // mongoClient.close();
    }
}

main().catch(console.dir);