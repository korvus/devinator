import React from "react";
import { themeSummaries } from "../data/index";
import { useThematic } from "../store/thematic";
import Game from "./game";
import {
  Switch,
  Link,
  Route
} from "react-router-dom";

const ListLinks = () => {
  // const { updateThematic, updateThematicProgress } = useThematic();
  // onClick={() => {updateThematic(id); updateThematicProgress(id)}}
  return themeSummaries.map(([id, description, , total]) => (
    <li className="theme" key={id}>
      <Link to={id}>
        <strong>{id}</strong>
          {` - ${description} - `}
        <small>{`${total} devinettes`}</small>
      </Link>
    </li>
  ));
};

function Home() {
  // const { thematic } = useThematic();
  return (
    <Switch>
      <Route path="/:thematic">
        <Game />
      </Route>

      <Route path="/">
        <div className="home">
            <h1>Le devinator</h1>
            <div className="contentWraper">
              <p className="presentation">
                Le but est de retrouver un mot ou un nom qui a une corrélation
                avec la description affichée au dessus. Voici les jeux thématiques
                actuellement disponible :
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

/*
    <>
      {thematic === "home" ? (
        <div className="home">
          <h1>Le devinator</h1>
          <div className="contentWraper">
            <p className="presentation">
              Le but est de retrouver un mot ou un nom qui a une corrélation
              avec la description affichée au dessus. Voici les jeux thématiques
              actuellement disponible :
            </p>
            <ul>
              <ListLinks />
            </ul>
          </div>
        </div>
      ) : (
        <Game />
      )}
    </>
*/

export default Home;
