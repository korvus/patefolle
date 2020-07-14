import React from "react";
import titleStyles from "../styles/title.module.css";

export default function Title(props) {
    return <h1 className={`${titleStyles.title} ${titleStyles[props.class]}`}>{props.content}</h1>
  }