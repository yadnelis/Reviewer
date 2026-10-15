import { Link } from "react-router"
import { NavLink } from "react-router"
import { UseLogInModal, UseMainMenu } from "../inf/Events"

export const NavigationBar = () => {
    const [triggerMainMenu] = UseMainMenu();
    const [triggerLogInModal] = UseLogInModal();


    return ( <div className={`yr-nav-cont`}>
        <nav className={`yr-navbar`}>
            <button className="yr-main-menu-button bi bi-list rounded btn-secondary" onClick={triggerMainMenu}/>
            <Link to={"/app"}><h1 className="app-name m-0"><span className="staple">Y</span>Reviewer</h1></Link>
            <button className="yr-log-in bi bi-person rounded btn-secondary" onClick={triggerLogInModal}/>
        </nav>
    </div>
    )
}