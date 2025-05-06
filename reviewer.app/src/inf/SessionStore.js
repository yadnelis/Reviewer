export default class {
    getToken = () => sessionStorage.getItem("token");
    getExpiration = () => sessionStorage.getItem("expiration");
    getRefreshToken = () => sessionStorage.getItem("refreshToken");
    getClaims = () => {
        let claims = sessionStorage.getItem("claims");
        if(claims)
            return JSON.parse(claims)
        else
            return null;
    };
    getUsername = () => sessionStorage.getItem("username");
    
    setExpiration = (value) => sessionStorage.setItem("expiration", value);
    setToken = (value) => {
        sessionStorage.setItem("token", value)
    };
    setRefreshToken = (value) => sessionStorage.setItem("refreshToken", value);
    setClaims = (value) => sessionStorage.setItem("claims", value);
    setUsername = (value) => sessionStorage.setItem("username", value);
}