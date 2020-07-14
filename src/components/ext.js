import React from "react";
import lkVideo from "../styles/ext.module.css";

export default function Ext(props) {
    return (
        <a className={`${lkVideo.link}`} title={props.title} href={props.link} target="blank">
        </a>
    )
};