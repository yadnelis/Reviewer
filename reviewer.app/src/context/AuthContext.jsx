import { useContext, createContext, useState } from "react";
import { Children } from "react";
import SessionStore from "../inf/SessionStore";
import { useAuthEvents } from "../inf/AuthEvents";

let AuthContext = createContext({
    username: "",
    token: "",
    refreshToken: "",
    claims: {}
})

const store = new SessionStore();
const getValue = () => ({
    token: store.getToken(),
    username: store.getUsername(),
    refreshToken: store.getRefreshToken(),
    claims: store.getClaims()
})
export const AuthContextProvider = ({children, ...rest}) => {
    const [value, setValue] = useState(getValue());
    const { AuthEvents, useEvent} = useAuthEvents();

    useEvent(AuthEvents.RefreshedToken, () => setValue(getValue()))
    useEvent(AuthEvents.NewToken, () => setValue(getValue()))
    useEvent(AuthEvents.NewClaims, () => setValue(getValue()))
    useEvent(AuthEvents.NewUsername, () => setValue(getValue()))

    console.debug('auth', value)


    return <AuthContext.Provider value={value} {...rest}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext);
}