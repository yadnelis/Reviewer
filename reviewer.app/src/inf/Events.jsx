import { useEffect } from "react";

export const ModalEvents = {
    LogInModal:{
        event: "logInModal"
    },
    MainMenu:{
        event: "mainmenupanel"
    },
    QuestionModal:{
        event: "questionmodal"
    },
    QuestionUpdated:{
        event: "questionUpdated"
    }
} 

export const useEvent = (name, fn, dep=[]) => {
    useEffect(() => {
        document.addEventListener(name, fn)
        return () => {
            document.removeEventListener(name, fn)
        }
    }, dep);
}

export const useWindowEvent = (name, fn, dep=[]) => {
    useEffect(() => {
        window.addEventListener(name, fn)
        return () => {
            window.removeEventListener(name, fn)
        }
    }, dep);
}

const listen = (name, fn) => window.addEventListener(name, fn);
const unListen = (name, fn) => window.removeEventListener(name, fn);

export const trigger = (name, detail) => {
    document.dispatchEvent(new CustomEvent(name, {detail: detail}))
}

export const UseMainMenu = () => {
    const _trigger = () => trigger(ModalEvents.MainMenu.event);
    const subscribe = (fn) => subscribe(ModalEvents.MainMenu.event, fn);
    return [_trigger, subscribe]
}

export const UseLogInModal = () => {
    const _trigger = () => trigger(ModalEvents.LogInModal.event);
    const subscribe = (fn) => subscribe(ModalEvents.LogInModal.event, fn,);
    return [_trigger, subscribe]
}

export const UseQuestionModal = () => {
    const _trigger = ({question, _id, onSubmit}) => trigger(ModalEvents.QuestionModal.event, {question, onSubmit});
    const _subscribe = (fn) => subscribe(ModalEvents.QuestionModal.event, fn);
    return [_trigger, _subscribe]
}

export const UseQuestionUpdated = ({_id}) => {
    const _trigger = () => trigger(ModalEvents.QuestionUpdated.event+_id);
    const subscribe = (fn) => useEvent(ModalEvents.QuestionUpdated.event+_id, fn);
    const _listen = (fn) => listen(ModalEvents.QuestionUpdated.event+_id, fn);
    const _unListen = (fn) => unListen(ModalEvents.QuestionUpdated.event+_id, fn);
    
    return [_trigger, subscribe, _listen, _unListen]
}