const { error } = require('node:console');
const { scrypt, randomBytes } = require('node:crypto');

const genSalt = () => randomBytes(16).toString('hex');

const isValidPassword = (p) => {
    // return !!(p?.length && p?.length > 10);
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

    const resetPassword = ({username, password, newPassword}) => new Promise(async (resolve, reject) => {
        if(!username || !password || !newPassword)
            resolve({error: "invalid payload"});

        const creds = await verifyCredentials(username, password)
        if(creds.error)
            resolve(creds);

        if(!isValidPassword(newPassword)) {
            resolve({ error: "invalid password"});
        }
        else {
            const salt = genSalt();
            scrypt(newPassword, salt, 64, (err, derivedKey) => {
                if (err) 
                    resolve({ error: "error creating password"})

                users.findOneAndUpdate({username}, {
                    K2: derivedKey.toString('hex'),
                    K1: salt,
                })
                .then((_) => {
                    resolve({account: {
                        username: username,
                        claims: creds?.claims,
                    }})
                })
                .catch((er) => {
                    resolve({ error: "DB error when updating user", innerError: er})
                });
            });
        }
    })
    
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

    const updateClaims = async({username, claimName, claimValue}) => {
        if(!username || !claimName || !claimValue)
            resolve({error: "invalid payload"});

        var user = await users.findOne({username})
        if(user){
            await users.findOneAndUpdate({username}, {
                "$set": {
                    ["claims."+claimName]: claimValue
                }
            }, { upsert: true });
            return {
                username: user.username,
                claims: {
                    ...user.claims,
                    [claimName]: claimValue
                }
            }
        }
        return { error: "User does not exist" }
    };

    return {
        updateClaims,
        postAccount,
        resetPassword,
        getAccountById,
        getAccount,
        getAccountByUsername,
        verifyCredentials,
    }
}
