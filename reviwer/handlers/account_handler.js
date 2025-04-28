const { scrypt, randomBytes } = require('node:crypto');

const genSalt = () => randomBytes(16).toString('hex');

const isValidPassword = (p) => {
    // return !!(p?.lenght && p?.lenght > 10);
    return true;
};

exports.useAccouts = ({ db }) => {
    const users = db.collection("accounts");
    
    const getAccountByUsername = (username) => {
        return users.findOne({_id:username});
    }
    
    const getAccountById = (id) => {
        return users.findOne({_id:id});
    }

    const getAccount = (query) => {
        return users.findOne(query);
    }
    
    const verifyCredentials = (username, password) => new Promise( (resolve, reject) => {
        if(!username || !password) {
            resolve({ error: "Missing username or password"})
        }
        users.findOne({username:username})
        .then((user) => {
            if(!user)
                resolve({ error: "User does not exist",})
            else {
                scrypt(password, user.K1, 64, (err, derivedKey) => {
                    if (err) 
                        resolve({ error: "error verifing password"});

                    if (derivedKey.toString('hex') === user.K2) 
                        resolve({credentials: {username: user.username, claims: user.claims}});
                    else 
                        resolve({ error: "wrong password"});
                });
            }
        });
    });
    
    const postAccount = ({user}) => new Promise(async (resolve, reject) => {
        if(!user || !user.username || !user.password)
            resolve({error: "invalid payload"});

        if(await users.findOne({username:user.username})) {
            resolve({ error: "username taken"});
        }

        if(!isValidPassword(user.password)) {
            resolve({ error: "invalid password"});
        }
        else {
            const salt = genSalt();
            scrypt(user.password, salt, 64, (err, derivedKey) => {
                if (err) 
                    resolve({ error: "error creating password"})

                users.insertOne({
                    username: user.username, 
                    claims: {},
                    K2: derivedKey.toString('hex'),
                    K1: salt,
                })
                .then((_) => {
                    resolve({account: {
                        username: user.username,
                        claims: {},
                    }})
                })
                .catch(() => {
                    resolve({ error: "DB error when inserting user"})
                });
            });
        }
    })

    return {
        postAccount,
        getAccountById,
        getAccount,
        getAccountByUsername,
        verifyCredentials,
    }
}
