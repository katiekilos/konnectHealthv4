import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio';
import { Button } from '@mui/material';
import { useState } from 'react';
import { EthContext } from '../../contexts/EthContext';
import { ethers } from 'ethers';
import PatientData from '../../contracts/PatientData.json';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
var CryptoJS = require("crypto-js");


export default function FormPropsTextFieldsTrial(props) {

  // connects to contract
  const contractAdd = '0x8e24ec30f1DaF5Db3aA38eAC3a6801771C99fBEd';
  const signer = React.useContext(EthContext);
  const contract = new ethers.Contract(contractAdd, PatientData.abi, signer);

  // data fields
  const [isShown, setIsShown] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const [drug, setDrug] = useState('');
  const [lowDose, setlowDose] = useState('');
  const [chol, setChol] = useState('');
  const [errorIsShownNoAccess, setErrorIsShownNoAccess] = useState(false);
  const [errorIsShownNoAcct, setErrorIsShownNoAcct] = useState(false);
  const [addrToRetrieve, setAddrToRetrieve] = useState('');
  const [updateChol, setUpdateChol] = useState('');
  const [showRecord, setShowRecord] = useState(false);
  const [showEvent, setShowEvent] = useState(false);

  const [drugDec, setDrugDec] = useState('');
  const [lowDoseDec, setLowDoseDec] = useState('');
  const [cholDec, setCholDec] = useState('');
  const [advEvent, setAdvEvent] = useState('');

  // displays any adverse events that have been reported to the trial
  const getAdverseEvents = async() => {
    if(!signer){
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedTrial();
    if(!result){
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    const acctAddr = await signer.getAddress();
    const encMess = await contract.getAdverseEvents();

    console.log(encMess);

      await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encMess, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          let newmsg = JSON.parse(decryptedMessage)
          setAdvEvent(newmsg["icd"]);
          console.log(newmsg["icd"]);
        }
        )
        .catch((error) => console.log(error.message));


    await setShowEvent(true);


  }
  
  // enters trial data
  const handleClick= async() => {
    if(!signer){
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedTrial();
    if(!result){
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    //********** encrypt for trial **********//

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
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("We can't encrypt anything without the key.");
        } else {
          console.error(error);
        }
      });

    const ethUtil = require('ethereumjs-util');
    const sigUtil = require('@metamask/eth-sig-util');

    const formObj = {
      group: drug, 
      dose: lowDose, 
      ldl: chol
    }

    const myJSON = JSON.stringify(formObj);

    const encryptedMessage = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: encryptionPublicKey,
            data: myJSON,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    console.log(encryptedMessage);

    //********** encrypt for research **********//

    const resKey = await contract.getResearchKeyTrial();

    console.log(resKey);

    await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [resKey, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          // let newmsg = JSON.parse(decryptedMessage)
          const encryptedMessage3 = CryptoJS.AES.encrypt(myJSON, decryptedMessage).toString();
          console.log(encryptedMessage3);
          contract.addDataTrial(patientAddress, encryptedMessage, encryptedMessage3);
        }
        )
        .catch((error) => console.log(error.message));

        
    await setIsShown(current => !current);
    setChol('');
    setPatientAddress('');
    // console.log(await contract.displayInfo(patientAddress));

  }


  // views trial data
  const getRecord = async () => {

    if(!signer){
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedTrial();
    if(!result){
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    const acctAddr = await signer.getAddress();
    const encMess = await contract.getDataTrial(addrToRetrieve);

    console.log(encMess);
    console.log(addrToRetrieve);

      await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encMess, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          let newmsg = JSON.parse(decryptedMessage)
          setDrugDec(newmsg["group"]);
          setLowDoseDec(newmsg["dose"]);
          setCholDec(newmsg["ldl"]);

        }
        )
        .catch((error) => console.log(error.message));


    await setShowRecord(true);
    await setIsShown(true);


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

{/* //=====================================================================// */}

<Divider>Trial Entry</Divider>

      <div>
        <TextField
          required
          id="outlined-required"
          label="Patient ID"
          value={patientAddress}
          onChange={(e)=>setPatientAddress(e.target.value)}
        />
        <br></br>
        
        <FormLabel id="demo-radio-buttons-group-label">Group</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          onClick={(e)=>setDrug(Boolean(Number(e.target.value)))}
        >
          <FormControlLabel value={1} control={<Radio />} label="Experimental" />
          <FormControlLabel value={0} control={<Radio />} label="Control" />
        </RadioGroup>
        <FormLabel id="demo-radio-buttons-group-label">Dose</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          onClick={(e)=>setlowDose(Boolean(Number(e.target.value)))}
        >
          <FormControlLabel value={1} control={<Radio />} label=".5" />
          <FormControlLabel value={0} control={<Radio />} label="1" />
        </RadioGroup>

        <TextField
          required
          id="outlined-required"
          label="LDL (mg/dL)"
          value={chol}
          onChange={(e)=>setChol(e.target.value)}
        />

        <br></br>

        <Button onClick={handleClick}>Submit</Button>

        {/* //=====================================================================// */}

        <Divider>Patient Record View</Divider>
      <br></br>

      <div>
        <TextField
          required
          id="outlined-required"
          label="Patient ID"
          value={addrToRetrieve}
          onChange={(e) => setAddrToRetrieve(e.target.value)}
        />

        <div></div>

        <Button onClick={getRecord} >Enter a patient address to view</Button>
      </div>

      



        {/* //=====================================================================// */}

        {/* <Divider>Existing Trial Entry</Divider>
        <br></br>

        <div>
        <TextField
          required
          id="outlined-required"
          label="Patient ID"
          value={addrToRetrieve}
          onChange={(e) => setAddrToRetrieve(e.target.value)}
        />
        <TextField
          required
          id="outlined-required"
          label="New Chol"
          value={updateChol}
          onChange={(e) => setUpdateChol(e.target.value)}
        />

        <div></div>

        <Button onClick={getRecord} >Submit</Button>
      </div> */}

      {showRecord && (

      <div>
        <p>Drug: {drugDec ? "experimental" : "control"}</p>
        <p>Low Dose: {lowDoseDec ? "0.5 dose" : "1.0 dose "}</p>
        <p>LDL: {cholDec} </p>
      </div>

      )}

      {/* //=====================================================================// */}

      <Divider>Get Adverse Events</Divider>

      <p>Check for real-time updates on potential clinical trial adverse events reporting</p>

      <Button onClick={getAdverseEvents} >Check</Button>


      {showEvent && (

        <div>
          <p>{advEvent}</p>
        </div>

        )}


       {/* //=====================================================================// */}


      {isShown && (
        <div>
          <Alert onClose={() => {setIsShown(current => !current)}}>Submitted!</Alert>
        </div>
      )}

      {errorIsShownNoAcct && (
        <div>
          <Alert severity="error" onClose={() => {setErrorIsShownNoAcct(current => !current)}}>You are not connected to an account!</Alert>
        </div>
      )}
      {errorIsShownNoAccess && (
        <div>
          <Alert severity="error" onClose={() => {setErrorIsShownNoAccess(current => !current)}}>Not authorised to input trial data!</Alert>
        </div>
      )}

      </div>
    </Box>
  );
}
