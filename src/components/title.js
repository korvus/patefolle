import React from "react";
import titleStyles from "../styles/title.module.css";
import { Text } from '../containers/language';

export default function Title(props) {
    return <h1 className={`${titleStyles.title} ${titleStyles[props.class]}`}>
      <Text tid={props.content} />
    </h1>
  }