import React, {Component} from "react";
import noteStyle from "./note.module.css";

class Note extends Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false
        };
    }

    manageHover = () => {
        this.setState({display: true});
    }

    closeTooltip = () => {
        this.setState({display: false});
    }

    /* {/*onMouseLeave={() => this.closeTooltip()}} */
    render() {
        const {content, align} = this.props;
        const {display} = this.state;
        return (<div className={noteStyle.wrapperInfobulle}>
            <div role="tooltip" className={`${noteStyle.contentModal} ${display ? "" : "hide"} ${align && noteStyle[align]}`}>{content}</div>
            <div role="presentation" className={noteStyle.questionMark} onFocus={() => this.manageHover()} onMouseOver={() => this.manageHover()} onMouseLeave={() => this.closeTooltip()}> ? </div>
        </div>)
    }
};

export default Note;