import React from "react";
import lkVideo from "../styles/ext.module.css";
import { Text } from '../containers/language';

const Ext = (props) => {
    return (
        <a className={`${lkVideo.link}`} title={Text({"tid": props.title})} href={Text({"tid": props.link})} target="blank">
        </a>
    )
};

export default Ext;