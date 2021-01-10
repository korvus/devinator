import { Fragment, useState, useEffect, useContext} from "react";
import { total } from '../data/index.js';
import { penduContext } from '../store/index';
import Game from "./game.js";



const getNumber = async (setLinks, setThematic, thematic, links) => {
    const ifAlreadyChoosen = localStorage.getItem("pendable-place");
    // console.log("check if looping");
    if(ifAlreadyChoosen && ifAlreadyChoosen!=="" && ifAlreadyChoosen!=="home"){
        // Si dejà présent dans le storage
        setThematic(ifAlreadyChoosen);
    } else {        localStorage.setItem("pendable-place", "home");
        setThematic("home");
        const jsonByTheme = [];
        for(let i= 0; i < total.length; i++){
            let nbRow = await import(`../data/${total[i][0]}.json`);
            jsonByTheme.push(Object.keys(nbRow).length);
        }
        if(JSON.stringify(jsonByTheme)!==JSON.stringify(links)){
            setLinks(jsonByTheme);
        }
        // Links setted
    }
}

const ListLinks = (props) => {
    const links = [];
    for(let i= 0; i < props.list.length; i++){
        links.push(
            <li 
                className="theme"
                key={i}
                onClick={() => props.setThematic(total[i][0])}
            >
                <strong>{total[i][0]}</strong>{` - ${total[i][1]} - `}<small>{`${props.list[i]} devinettes`}</small>
            </li>
        );
  }
  return <Fragment>{links}</Fragment>;
}


function Home() {
    const {thematic, setThematic} = useContext(penduContext);
    const [links, setLinks] = useState([]);

    useEffect(() => getNumber(setLinks, setThematic, thematic, links), [links, thematic]);

    return (
        <Fragment>
            {thematic === "home" ? 
                <Fragment><h1>Le devinator</h1>
                    <div className="contentWraper">
                        <p className="presentation">
                            Le but est de retrouver un mot ou un nom qui a une corrélation avec la description affichée au dessus. 
                            Voici les jeux thématiques actuellement disponible : 
                        </p>
                        <ul>
                            <ListLinks list={links} setThematic={setThematic} />
                        </ul>
                    </div>
                </Fragment>
            :
                <Game />
            }
        </Fragment>
    );
}

export default Home;
