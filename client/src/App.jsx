import { EthContext } from "./contexts/EthContext";
import Intro from "./components/Intro/";
import Entry from "./components/Entry/";
import Footer from "./components/Footer";
import "./App.css";
import { useState } from "react";

function App() {

  const [signer, setSigner] = useState();

  return (
    <EthContext.Provider value = {signer}>
      <div id="App" >
        <div className="container">
          <Intro setSigner={setSigner}/>
          <hr />
          <Entry />
          <hr />
          <Footer />
        </div>
      </div>
    </EthContext.Provider>
  );
}

export default App;
