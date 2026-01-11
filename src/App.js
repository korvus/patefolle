import React from "react";
import { LanguageProvider } from "./containers/language";
import { LeavinProvider } from "./containers/leavinChoice";
import { TimerProvider } from "./containers/timerLogic";
import Recipe from "./recipe";
import { IngredientsProvider } from "./containers/ingredients";
import "./styles/global.css";

function Home() {
  return (
    <LanguageProvider>
      <TimerProvider>
        <LeavinProvider>
          <IngredientsProvider>
            <Recipe />
          </IngredientsProvider>
        </LeavinProvider>
      </TimerProvider>
    </LanguageProvider>
  );
  // }
}

export default Home;
