const express = require('express')
const http = require('http');

const port = process.env.PORT || 4000;
const app = express();

async function main () {
    app.use(express.static('./public'));
    
    app.get('/', (req, res) => {
        res.sendFile('index.html', {root: './public'});
    })
    app.get('/questions', (req, res) => {
        res.sendFile('questions.json', {root: './public'});
    })
    
    
    let server = http.createServer(app);
    await server.listen(port);
}

main();