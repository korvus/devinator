import React from "react";
import { Text } from "../store/lang";
import { getPercent } from "../utils";

const ProgressBar = ({prog}) => {

    return (
        <div className="progressBar">
          <div
            title={`${Text({
              tid: "YouSolved"
            })} ${prog.totalThematic -
                prog.unsolved} ${Text({ tid: "wordsOn" })} ${
                    prog.totalThematic
            }`}
            className="bar"
            style={{
              clipPath: `inset(0% ${getPercent(
                prog.totalThematic,
                prog.unsolved
              )} 0% 0%)`
            }}
          ></div>
        </div>
    );
}

export default ProgressBar;
