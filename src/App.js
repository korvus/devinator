import "./App.css";
import Home from "./components/home.js";
import { PenduContextProvider } from "./store/lang.js";
import { BrowserRouter } from "react-router-dom";
import { ThematicProvider } from "./store/thematic";
import { ScoreProvider } from "./store/score";

function App() {
  return (
    <BrowserRouter>
      <PenduContextProvider>
        <ThematicProvider>
          <ScoreProvider>
            <Home />
          </ScoreProvider>
        </ThematicProvider>
      </PenduContextProvider>
    </BrowserRouter>
  );
}

export default App;
