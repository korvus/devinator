import "./App.css";
import Home from "./components/home.js";
import { PenduContextProvider } from "./store/lang.js";
import { BrowserRouter } from "react-router-dom";
import { ThematicProvider } from "./store/thematic";

function App() {
  return (
    <BrowserRouter>
      <PenduContextProvider>
        <ThematicProvider>
          <Home />
        </ThematicProvider>
      </PenduContextProvider>
    </BrowserRouter>
  );
}

export default App;
