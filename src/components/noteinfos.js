import React, {useState} from "react";
import noteStyle from "../styles/note.module.css";

const Note = (props) => {
    const [display, setDisplay] = useState(false);

    const manageHover = () => {
        setDisplay(true);
    }

    const closeTooltip = () => {
        setDisplay(false);
    }

    const {content, align} = props;

    return (
        <div className={noteStyle.wrapperInfobulle}>
            <div role="tooltip" className={`${noteStyle.contentModal} ${display ? "" : "hide"} ${align && noteStyle[align]}`}>{content}</div>
            <div role="presentation" className={noteStyle.questionMark} onFocus={() => manageHover()} onMouseOver={() => manageHover()} onMouseLeave={() => closeTooltip()}> ? </div>
        </div>
    )
};

export default Note;