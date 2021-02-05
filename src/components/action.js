import React from "react";
import { Text } from "../store/lang";

const Action = ({ action, txt }) => {

  return (
    <li>
      <button onClick={action}>
        <Text tid={txt} />
      </button>
    </li>
  );
};

export default Action;
