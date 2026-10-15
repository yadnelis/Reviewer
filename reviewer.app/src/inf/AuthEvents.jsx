import { trigger, useEvent } from "./Events";


const AuthEvents = {
    NewToken: {
        event: "newtoken"
    },
    RefreshedToken: {
        event: "refreshedtoken"
    },
    NewClaims: {
        event: "newclaims"
    },
    NewUsername: {
        event: "username"
    }
}

export const triggerNewToken = (token) => {
    trigger(AuthEvents.NewToken, token);
}

export const triggerRefreshedToken = (token) => {
    trigger(AuthEvents.RefreshedToken, token);
}

export const triggerNewClaims = (token) => {
    trigger(AuthEvents.NewClaims, token);
}

export const triggerNewUsername = (token) => {
    trigger(AuthEvents.NewUsername, token);
}

export const useAuthEvents = () => {
    return { AuthEvents, useEvent: useEvent }
}