import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import co from "../styles/quantities.module.css";
import { Text } from "../containers/language";

const Leavintype = (props) => {

    const { leavinType, switchTypeRatio } = useContext(leavinChoiceContext);
    // console.log("leavinType", leavinType);

    return (
            <ul className={co.listLeavin}>
                <li onClick={() => switchTypeRatio(0)} className={`${leavinType === 0 && co.leavinselected}`}>Levain liquide</li>
                <li onClick={() => switchTypeRatio(1)} className={`${leavinType === 1 && co.leavinselected}`}>Levain solide</li>
                <li onClick={() => switchTypeRatio(2)} className={`${leavinType === 2 && co.leavinselected}`}>Proportions personnalisées</li>
            </ul>
    );
}

export default Leavintype;


