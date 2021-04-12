import React, {useContext} from "react";
import { Text, penduContext } from "../store/lang";
import { themeSummaries } from "../data/index";
import { Link } from "react-router-dom";
import Footer from "./footer.js";
import { LOCAL_STORAGE_KEY_PROGRESS } from "../store/thematic";
import LanguageSelector from "./languageSelector";

const isInStorage = (id, visible) => {
    let currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
    if(currentProgress){currentProgress = JSON.parse(currentProgress)}
    if(!currentProgress) return visible
    if(currentProgress[id] !== undefined) return true
    return visible;
}

const Solved = ({id}) => {
    let currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
    if(currentProgress){currentProgress = JSON.parse(currentProgress)}
    let percent = 0;
    let solved = 0;
    if(currentProgress && currentProgress[id]){
      solved = currentProgress[id].filter(w => w !== false).length;
      const total = currentProgress[id].length;
      percent = Math.round((Math.round(Math.round(solved)*100))/Math.round(total))/2;
    }
    return (<div title={`${solved} ${Text({tid:"solved"})}`} className="indicatorProgress">
      <span style={{'width': `${percent}px`}}></span>
    </div>);
}

const ListLinks = () => {
    const { userLanguage } = useContext(penduContext);
    const themByLang = themeSummaries.filter(({langue}) => (langue === userLanguage));
  
    return themByLang.map(({id, desc, number, visible}) => (
      <li className={`theme ${visible ? "default":"gray"}`} key={id}>
        <Link to={id}>
          <strong>{id}</strong>
            {` - ${desc} - `}
          <small>{`${number} ${Text({tid:"devinettes"})}`}</small>
          <Solved id={id} />
        </Link>
      </li>
    ));
  };

const Listall = () => {

    return (
        <div className="contentWraper">
            <div className="menu">
                <Link to="/">
                    <Text tid="home" />
                </Link>
            </div>
            <div className="listAll">
                <div className="overflowHidden">
                    <LanguageSelector />
                </div>
                <ul>
                    <ListLinks />
                </ul>
            </div>
            <Footer />
        </div>
    );
}

export default Listall;
