import React, { useEffect } from "react";
import { useThematic } from "../store/thematic";
import { Text } from "../store/lang";
import { Link } from "react-router-dom";
import { Hint } from "../utils/index";

const Completed = ({ total }) => {
  const {
    thematic,
    reinitThematicProgress,
    getAllAnswers,
    answers,
    updateThematicProgress,
  } = useThematic();

  const refresh = () => {
    // Reset a false les mots dans le localstorage (mais ne retouche pas au state)
    reinitThematicProgress(thematic, total);
    // Update le hooks pour provoquer un refresh
    updateThematicProgress(thematic);
  };

  useEffect(() => {
    getAllAnswers(thematic);
  }, [getAllAnswers, thematic]);

  return (
    <div className="congratulation">
      <h2>
        <Text tid="Congratulations" />
      </h2>
      <p>
        <Text tid="YouCompletedThe" />
        <strong>{thematic}</strong>
        <Text tid="set" />.
      </p>
      <p>
        <Link to="/">
          <Text tid="GoBackToHome" />
        </Link>{" "}
        .&nbsp;
        <span onClick={refresh}>
          <Text tid="Redo" />
        </span>
      </p>
      <div>
        <table className="recap">
          <tbody>
            {(() => {
              let container = [];
              let i = 0;
              for (const property in answers) {
                i++;
                container.push(
                  <tr key={i}>
                    <td><Hint wordhint={property} /></td>
                    <td>{answers[property].nom}</td>
                  </tr>
                );
              }
              return container;
            })()}
          </tbody>
          <thead>
            <tr>
              <th><Text tid="hint" /></th>
              <th><Text tid="solutions" /></th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

export default Completed;
