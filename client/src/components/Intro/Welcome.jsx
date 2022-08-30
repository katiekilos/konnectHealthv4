import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Button } from '@mui/material';
import { useState } from 'react';

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});



function Welcome(props) {

  const [isShown, setIsShown] = useState(false);

  const handleClick=async()=>{
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    props.setSigner(signer);
    console.log(provider);
    if(!signer){
      return;
    }

    await setIsShown(true);

  }
  
  return (
    <div className="welcome">
      <h1>Welcome to KonnectHealth! </h1>
      <p>
        This is a tool for ensuring the fidelity and continuity of records for 
        accurate epidemiological research.
      </p>
      
      <Button onClick={handleClick} variant="contained" >Connect Wallet</Button>

      {isShown && (
        <div>
          <p> Success! </p>
        </div>
      )}

    </div>
  );
}

export default Welcome;
