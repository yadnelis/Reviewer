import ReactDOM from 'react-dom'
import { Portal } from '../../lib/Portal'
import { useEffect, useRef } from 'react'
import { NavLink, useParams } from 'react-router'
import { AboutPage } from '../AboutPage'
import { ModalEvents, useEvent } from '../../inf/Events'

export const MainMenu = () => {
    const { courseNumber } = useParams();

    const ref = useRef(null)

    const show = () => {
        ref.current?.show();
    };

    const hide = () => {
        ref.current?.hide();
    };

    useEvent(ModalEvents.MainMenu.event, show)

    return ReactDOM.createPortal((
        <Portal ref={ref} type={"left"} shadow>
            <div className='d-flex flex-column mt-5 p-2 pe-5 yr-main-menu'>
                <NavLink className={"yr-menu-link"} to={'/app'} onClick={hide}>Home</NavLink>
                <NavLink className={"yr-menu-link"} to={'/app/about'} onClick={hide}>About</NavLink>
                {
                    courseNumber && (<>
                    <hr />
                        <NavLink className={"yr-menu-link"} to={`/app/course/${courseNumber}/test`} onClick={hide}>Test {courseNumber}</NavLink>
                        <NavLink className={"yr-menu-link"} to={`/app/course/${courseNumber}/review`} onClick={hide}>Review {courseNumber}</NavLink>
                    </>)
                }
            </div>
        </Portal>
    ), document.body)
}