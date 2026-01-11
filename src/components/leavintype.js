import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import co from "../styles/quantities.module.css";
import { Text } from "../containers/language";

const Leavintype = () => {
  const { leavinType, switchTypeRatio } = useContext(leavinChoiceContext);
  // console.log("leavinType", leavinType);

  return (
    <ul className={co.listLeavin}>
      <li
        onClick={() => switchTypeRatio(0)}
        className={`${leavinType === 0 && co.leavinselected}`}
      >
        <Text tid="leavinliquid" />
      </li>
      <li
        onClick={() => switchTypeRatio(1)}
        className={`${leavinType === 1 && co.leavinselected}`}
      >
        <Text tid="leavinsolid" />
      </li>
      <li
        onClick={() => switchTypeRatio(2)}
        className={`${leavinType === 2 && co.leavinselected}`}
      >
        <Text tid="leavincustom" />
      </li>
    </ul>
  );
};

export default Leavintype;
