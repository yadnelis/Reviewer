import axios from "axios";
import SessionStore from "./SessionStore";
import { triggerNewClaims, triggerNewToken, triggerNewUsername } from "./AuthEvents";
import { redirect } from "react-router";

const store = new SessionStore();

const httpsClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  validateStatus: (status) => status > 0 && status < 600
//   headers: {'Access-Control-Allow-Origin': '*'}
});

const tokenize = (config = {}) => {
    const token = store.getToken();
    if (token) {
        if(config.headers) {
            config.headers.Authorization = `Bearer ` + token;
        }
        else {
            config.headers = {
                Authorization: `Bearer ` + token,
            }
        }
    }
};


const attachMeta = (res) => {
     if(res.status >= 500) {
            res.serverError = true;
            res.clientError = false;
            res.ok = false
    }
    else if(res.status >= 400) {
            res.serverError = false;
            res.clientError = true;
            res.ok = false
    }
    else if(res.status >= 200) {
            res.serverError = false;
            res.clientError = false;
            res.ok = true;
    }
    else {
            res.serverError = false;
            res.clientError = false;
            res.ok = false;
    }
    return res
}


export const get = async (url, config = {}) => {
    tokenize(config);
    return await httpsClient.get(url, config)
    .then((res) => attachMeta(res))
    .catch(res => res);
}

export const remove = async (url, config = {}) => {
    tokenize(config);
    return await httpsClient.delete(url, config)
    .then((res) => attachMeta(res))
    .catch(res => res);
}

export const post = async (url, data, config = {}) => {
    tokenize(config);
    if(config.headers) {
        config.headers["Content-Type"] = `application/json`;
    }
    else {
        config.headers = {
            "Content-Type": `application/json`,
        }
    }
    return await httpsClient.post(url, data, config)
    .then(res => attachMeta(res))
    .catch(res => console.error(res))
}

export const put = async (url, data, config = {}) => {
    tokenize(config);
    return await httpsClient.put(url, data, config)
    .then((res) => attachMeta(res))
    .catch(res => res);
}

export const patch = async (url, data, config = {}) => {
    tokenize(config);
    return await httpsClient.patch(url, data, config)
    .then((res) => attachMeta(res))
    .catch(res => res);
}



export const postCredentials = async (username, password) => {
    const res = await post('/auth/token', {
        username,
        password
    });

    const data = res?.data;
    
    if(data?.token) {
        store.setToken(data.token)
        triggerNewToken(data);
        if(data?.refreshToken) {
            store.setRefreshToken(data.refreshToken)
        }
        
        if(data?.expiresIn) {
            store.setExpiration(data.expiresIn)
        }
    }


    if(data?.claims && JSON.stringify(data.claims) != store.getClaims()) {
        store.setClaims(JSON.stringify(data.claims))
        triggerNewClaims(data?.claims);
    }
    

    if(data?.username && store.getUsername() !== data?.username) {
        store.setUsername(data.username)
        triggerNewUsername(data?.username);
    }


    return res;
}

export const refreshToken = async () => {
    const res = await post('/auth/refresh-token', {
        refreshToken: store.getRefreshToken(),
    });

    const data = res.data;

    if(data?.token) {
        store.setToken(data.token)
        triggerNewToken(data);
        if(data?.refreshToken) {
            store.setRefreshToken(data.refreshToken)
        }
        
        if(data?.expiresIn) {
            store.setExpiration(data.expiresIn)
        }
    }

    if(data?.claims) {
        store.setClaims(data.claims)
        triggerNewClaims(data?.claims);
    }
    

    if(data?.username) {
        store.setUsername(data.username)
        triggerNewUsername(data?.username);
    }

    return redirect
}

