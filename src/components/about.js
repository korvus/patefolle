import React from "react";
import aboutStyles from "../styles/wrapper.module.css";
import aboutStylesSpecifics from "../styles/about.module.css";
import { Text } from "../containers/language";
import Title from "./title"

export default function About() {
    return <section className={aboutStyles.section}>
        <Title content="About" class="about" />
        <div className={`${aboutStyles.wrapper} ${aboutStyles.schedule} ${aboutStylesSpecifics.wrapper}`}>
            <div className={aboutStyles.main}>
                <p>
                    <Text tid="personnalUse" />
                </p>
                <p>
                    <Text tid="reactCreateApp" /> <a target="blank" href="https://github.com/korvus/patefolle">github</a>.
                </p>
                <p>
                    <a href="https://simonertel.net" target="blank"><Text tid="website" /></a>.
                </p>

            </div>
        </div>
        {/*<Text tid="madeBy" />*/}
    </section>
  }