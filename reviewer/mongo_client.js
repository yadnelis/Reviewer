const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;
const db = `YReviewer-${process.env.NODE_ENV.toUpperCase()}`;


const getClient = () => new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const init = async () => {
    const client = getClient();
    await client.connect()
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    let ctx = await client.db(db);
    return ctx;
}

const close = () => {
    client.close();
}

module.exports = {
    init,
    getClient,
    close,
}