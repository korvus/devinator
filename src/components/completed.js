import React from "react";
import { useThematic } from "../store/thematic";
import { Text } from "../store/lang";
import { Link } from "react-router-dom";

const Completed = ({total}) => {
  const { thematic, reinitThematicProgress, updateThematicProgress } = useThematic();

  const refresh = () => {
    // Reset a false les mots dans le localstorage (mais ne retouche pas au state)
    reinitThematicProgress(thematic, total);
    // Update le hooks pour provoquer un refresh
    console.log("^plop");
    updateThematicProgress(thematic);
  }

  return (
    <div className="congratulation">
      <h2><Text tid="Congratulations" /></h2>
      <p>
        <Text tid="YouCompletedThe" />
        <strong>{thematic}</strong>
        <Text tid="set" />.
      </p>
      <p>
        <Link to='/'>
          <Text tid="GoBackToHome" />
        </Link> .&nbsp;
        <span onClick={refresh}>
          <Text tid="Redo" />
        </span>
      </p>
    </div>
  );
};

export default Completed;
