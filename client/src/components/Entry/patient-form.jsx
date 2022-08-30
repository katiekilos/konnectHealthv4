import * as React from 'react';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { EthContext } from '../../contexts/EthContext';
import { Button } from '@mui/material';
import { ethers } from 'ethers';
import PatientData from '../../contracts/PatientData.json';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';


export default function FormPropsTextFieldsPatient(props) {


  // connects to contract
  const contractAdd = '0x8e24ec30f1DaF5Db3aA38eAC3a6801771C99fBEd';
  const signer = React.useContext(EthContext);


  const [isShown, setIsShown] = useState(false);

  // fields for data entry
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [med, setMed] = useState('');
  const[name, setName] = useState('');

  const [bpH, setBpH] = useState('');
  const [pulseH, setPulseH] = useState('');
  const [codeH, setCodeH] = useState('');

  const [errorIsShownNoAcct, setErrorIsShownNoAcct] = useState(false);
  const [pubKey, setPubKey] = useState('');

  const contract= new ethers.Contract(contractAdd, PatientData.abi, signer);


  //shows the patient their data
  const handleClick=async()=>{
    if(!signer){
      setErrorIsShownNoAcct(current => !current);
      return;
    }

    const encMess = await contract.getDataGPforPatient();
    const acctAddr = await signer.getAddress();

      await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encMess, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          let newmsg = JSON.parse(decryptedMessage)
          setHeight(newmsg["height"]);
          setWeight(newmsg["weight"]);
          setBp(newmsg["bp"]);
          setMed(newmsg["med"]);

          if(newmsg["med"] == 1){
            setName("Statins");
          }else if(newmsg["med"] == 2){
            setName("Oral contraception");
          }else if(newmsg["med"] == 3){
            setName("SSRI");
          }else if(newmsg["med"] == 4){
            setName("Beta Blockers");
          }
  
        }
        )
        .catch((error) => console.log(error.message));

        const encMess2 = await contract.getDataHospForPatient();

      await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encMess2, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          let newmsg = JSON.parse(decryptedMessage)
          setBpH(newmsg["bp"]);
          setPulseH(newmsg["pulse"]);
          setCodeH(newmsg["admitCode"]);

        }
        )
        .catch((error) => console.log(error.message));

        

    await setIsShown(true);

  }


  // shares public key with other users
  const shareKey=async()=>{

    let encryptionPublicKey;
    const acctAddr = await signer.getAddress()
    await window.ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [acctAddr], // you must have access to the specified account
      })
      .then((result) => {
        encryptionPublicKey = result;
        console.log(encryptionPublicKey);
        contract.sharePubKeyWithGP(encryptionPublicKey);
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("We can't encrypt anything without the key.");
        } else {
          console.error(error);
        }
      });
    
  }


  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >


<Divider>View Records</Divider>



      <div>
        <p>
            Below you can view your GP and hospital records. You may not
            view records from clinical trials or other research studies you have participated in
            to preserve integrity of the trial(s).
        </p>
        
      <Button onClick={handleClick}>Get Records</Button>

      {isShown && (
        <div>
          <h4>Your most recent GP records:</h4>
          <p>Height (cm): {height}</p>
          <p>Weight (kg): {weight}</p>
          <p>BP (mmHg): {bp}</p>
          <p>Medication: {name}</p>

          <h4>Your most recent Hospital records:</h4>
          <p>Admission reason: {codeH}</p>
          <p>BP: {bpH}</p>
          <p>Pulse: {pulseH}</p>
          
        </div>
      )}


<Divider>Give permission</Divider>

<p>By clicking the button below, you allow healthcare professionals to enter data on your behalf. This shares your public key to ensure your data is encrypted and then viewable by you.</p>

<Button onClick={shareKey}>Share</Button>


      {errorIsShownNoAcct && (
        <div>
          <Alert severity="error" onClose={() => {setErrorIsShownNoAcct(current => !current)}}>You are not connected to an account!</Alert>
        </div>
      )}

        {/* <button onClick={props.handleClick}>Submit</button> */}
      </div>
    </Box>
  );
}
