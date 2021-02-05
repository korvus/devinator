import React, { useState } from "react";
import { Text } from "../store/lang";
import { useThematic, LOCAL_STORAGE_KEY_PROGRESS } from "../store/thematic";

const Score = ({score, total}) => {

    const [tooltip, setTooltip] = useState(false);

    const { thematic } = useThematic();
    let solvedWords = 0;
    let nbSolved = 0;
    // let totalScore = 0;

    const currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS) ? localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS) : false;

    if(currentProgress){
        let existing = JSON.parse(currentProgress);
        const thematicScore = existing[thematic];

        if(!thematicScore){
            solvedWords = 0+score;
        } else {
            nbSolved = thematicScore.filter(s => s!==false).length;
            nbSolved = nbSolved === 0 ? 1 : nbSolved;
            solvedWords = thematicScore.reduce((a, c) => {
                if(c !== false){
                    return a + c
                } else {
                    return parseInt(a)
                }
            }, 0);
            // totalScore = (total*5)+5;
        }
    }
    const liveScore = solvedWords+score;

    let percent = Math.round(solvedWords*100/(nbSolved*5));
    if(solvedWords*100 === nbSolved*5) percent = 100;
    
    const classColor = Math.max(0, Math.floor(percent/10));
    
    function openTooltip(){
        setTooltip(true)
    }

    function closeTooltip(){
        setTooltip(false)
    }

    // console.log("score", percent, liveScore, nbSolved," -> ", nbSolved*5);

    return (
        <div onMouseLeave={closeTooltip} onMouseEnter={openTooltip} className={`scoreWrapper rate${classColor} ${solvedWords === 0 ? " unsolved" : ""}`}>
            <div className="score">
                <small className="label">
                    <Text tid="reussite" />
                </small>
                {solvedWords !== 0 && <div className="scoreNumber">
                        <span className="liveScore">
                            {percent}
                        </span>%
                </div>}
                <div className="displayForMobile points">
                    <b>{liveScore}pts</b> / <span>{nbSolved*5}pts</span>
                </div>
            </div>
            <div className="tooltip" style={{"display": `${tooltip ? "block" : "none"}`}} >
                <b>{liveScore}pts</b>
                <span>{nbSolved*5}pts</span>
            </div>
        </div>
    );
}

export default Score;
