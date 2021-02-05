import React from "react";
import Action from "./action";

const ButtonActions = ({ visible, actions }) => {

  return <ul className={`options ${visible ? "" : "hide"}`}>
        <Action action={actions.resetWord} txt="clear" />
        <Action action={actions.solution} txt="solution" />
        <Action action={actions.jocker} txt="Jocker" />
    </ul>
};

export default ButtonActions;
