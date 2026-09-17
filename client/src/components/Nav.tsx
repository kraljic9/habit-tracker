import { Link } from "react-router-dom"
import Settings from "./Settings"
import Community from "./Community"
import Analysis from "./Analysis"

function Nav() {
    return(
        <>
            <div>
                <span></span>
                <p>Habitly</p>
            </div>

            <div>
                <div>
                        <span></span>
                        <p>Dashboard</p>
                </div>
                
                <div>
                        <span></span>
                        <p>Analysis</p>
                </div>
                
                <div>
                        <span></span>
                        <p>Community</p>
                </div>

                <div>
                        <span></span>
                        <p>Settings</p>
                </div>
            </div>
        </>
    )
}

export default Nav