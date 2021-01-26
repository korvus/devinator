import "./App.css";
import Home from "./components/home.js";
import { PenduContextProvider } from "./store/lang.js";
import { ThematicProvider } from "./store/thematic";

function App() {
  return (
    <PenduContextProvider>
      <ThematicProvider>
        <Home />
      </ThematicProvider>
    </PenduContextProvider>
  );
}

export default App;
