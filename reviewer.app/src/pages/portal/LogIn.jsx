import reactDOM from 'react-dom'
import { Portal } from '../../lib/Portal'
import { useRef } from 'react'
import { ModalEvents, UseLogInModal, useEvent } from '../../inf/Events'
import { postCredentials } from '../../inf/httpClient'
import { useNavigate } from 'react-router'

export const LogIn = () => {
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const show = () => {
        modalRef.current.show()
    }

    const hide = () => {
        modalRef.current.hide()
    }


    const auth = async () => {
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        const res = await postCredentials(username, password);

        if(res?.ok) {
            hide();
            // navigate('/app/admin')
        }
        else {
            console.error(res.data)
        }
    }
    
    useEvent(ModalEvents.LogInModal.event, show, []);

    return reactDOM.createPortal((
        <Portal ref={modalRef} type={"modal"} shadow>
            <div className='yr-log-in-cont'>
                <div className='header-cont'>
                    <h2 className='title bold'>Log In</h2>
                    <p>Registration is currently not supported. Contact Yadnelis if you want permission to add questions</p>
                </div>
                <div className='inputs-cont'>
                        <label htmlFor='yr-log-in-username' className='yr-text-label yr-label'>Username:</label>
                        <input 
                            type='text' 
                            name='yr-log-in-username' 
                            id='yr-log-in-username' 
                            className='yr-text-input yr-input'
                            ref={usernameRef}
                        />
                        <label htmlFor='yr-log-in-password' className='yr-text-label yr-label'>Password:</label>
                        <input 
                            type='text' 
                            name='yr-log-in-password' 
                            id='yr-log-in-password' 
                            className='yr-text-input yr-input'
                            ref={passwordRef}
                        />
                </div>
                <div className='d-flex justify-content-end'>
                    <button className='yr-btn btn-submit btn-primary rounded p-2 px-4 yr-bg-main-2 bold' onClick={auth}>
                        Submit
                    </button>
                </div>
            </div>
        </Portal>
    ), document.body)
}