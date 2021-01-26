import React from "react";
import { Text } from "../store/lang";
import { Link } from "react-router-dom";
import LanguageSelector from "./languageSelector";

const Notfound = () => {

    return (
        <div className="contentWraper">
            <div className="menu">
                <Link to="/">
                    <Text tid="home" />
                </Link>
            </div>
            <div className="notFound">
                <div className="overflowHidden">
                    <LanguageSelector />
                </div>
                <h2>
                    <Text tid="notFound" />
                </h2>
            </div>
            <footer>
                <span
                className="lk restartAll"
                title={Text({tid: "resetEveryThing"})}
                >
                    <Text tid="resetForThematic" />
                </span>
            </footer>
        </div>
    );
}

export default Notfound;
