import './App.css';
import Home from './components/home.js';
import { PenduContextProvider } from './store/index.js';

function App() {

  return (
    <PenduContextProvider>
      <Home />
    </PenduContextProvider>
  );
}

export default App;
