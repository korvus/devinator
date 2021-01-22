import React from "react";
import { useThematic } from "../store/thematic";

const Completed = ({total}) => {
  const { thematic, updateThematic, reinitThematicProgress } = useThematic();

  return (
    <div className="congratulation">
      <h2>Congratulations</h2>
      <p>
        You completed the <strong>{thematic}</strong> set.
      </p>
      <p>
        <span onClick={() => updateThematic("home")}>Go back to home</span> .&nbsp;
        <span onClick={() => reinitThematicProgress(thematic, total)}>Redo</span>
      </p>
    </div>
  );
};

export default Completed;
