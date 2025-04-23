const express = require('express')
const app = express()

app.get('/api', async (req, res) => {
    res.json({'users': ['userOne', 'userTwo', 'userThree']})
})

app.use(express.static('public'))

app.listen(5000, () => console.log("Server started on 5000"))