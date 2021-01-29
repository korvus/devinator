import React, {useContext} from "react";
import { themeSummaries } from "../data/index";
import { Text, penduContext } from "../store/lang";
import Game from "./game";
import { Switch, Link, Route } from "react-router-dom";
import Notfound from "./notfound.js";
import { LOCAL_STORAGE_KEY_PROGRESS } from "../store/thematic";
import LanguageSelector from "./languageSelector";

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

const isInStorage = (id, visible) => {
  let currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
  if(currentProgress){currentProgress = JSON.parse(currentProgress)}
  if(!currentProgress) return visible
  if(currentProgress[id] !== undefined) return true
  return visible;
}

const ListLinks = () => {
  const { userLanguage } = useContext(penduContext);
  const themByLang = themeSummaries.filter(({langue}) => (langue === userLanguage));

  return themByLang.map(({id, desc, number, visible}) => (
    <li className={`theme ${visible ? "default":"gray"}`} style={{"display":`${isInStorage(id, visible) ? "block":"none"}`}} key={id}>
      <Link to={id}>
        <strong>{id}</strong>
          {` - ${desc} - `}
        <small>{`${number} ${Text({tid:"devinettes"})}`}</small>
        <Solved id={id} />
      </Link>
    </li>
  ));
};

function Home() {

  return (
    <Switch>
      <Route path="/notfound">
        <Notfound />
      </Route>

      <Route path="/:thematic">
        <Game />
      </Route>

      <Route path="/">
        <div className="home">
            <h1>
              <Text tid="titre" />
            </h1>
            <div className="contentWraper">
              <LanguageSelector />
              <p className="presentation">
                <Text tid="descApp" />
              </p>
              <ul>
                <ListLinks />
              </ul>
            </div>
          </div>
      </Route>
    </Switch>
    );
}

export default Home;
