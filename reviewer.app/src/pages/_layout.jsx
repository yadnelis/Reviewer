import { Outlet } from "react-router"
import { NavigationBar } from "../components/NavigationBar"
import { MainMenu } from "./portal/MainMenu"
import { LogIn } from "./portal/LogIn"
import { AuthContextProvider } from "../context/AuthContext"
import { Footer } from "../components/Footer"
import { QuestionModal } from "./Review"

export const Layout = () => {
    return (
        <AuthContextProvider>
            <div className="yr-main-layout">
                <NavigationBar />
                <Outlet />
                <Footer />
            </div>
            <MainMenu/>
            <LogIn/>
            <QuestionModal />
        </AuthContextProvider>
    );
}