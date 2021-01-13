import React from "react";
import { themeSummaries } from "../data/index";
import { useThematic } from "../store/thematic";
import Game from "./game";

const ListLinks = () => {
  const { updateThematic } = useThematic();
  return themeSummaries.map(([id, description, , total]) => (
    <li className="theme" key={id} onClick={() => updateThematic(id)}>
      <strong>{id}</strong>
      {` - ${description} - `}
      <small>{`${total} devinettes`}</small>
    </li>
  ));
};

function Home() {
  const { thematic } = useThematic();
  console.log("THEMATIC", thematic);
  return (
    <>
      {thematic === "home" ? (
        <>
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
        </>
      ) : (
        <Game />
      )}
    </>
  );
}

export default Home;
