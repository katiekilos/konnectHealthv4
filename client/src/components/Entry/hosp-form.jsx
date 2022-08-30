import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { EthContext } from '../../contexts/EthContext';
import { ethers } from 'ethers';
import { Button } from '@mui/material';
import { useState } from 'react';
import PatientData from '../../contracts/PatientData.json';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

var CryptoJS = require("crypto-js");

export default function FormPropsTextFieldsHosp(props) {

  const contractAdd = '0x8e24ec30f1DaF5Db3aA38eAC3a6801771C99fBEd';
  const signer = React.useContext(EthContext);
  const contract = new ethers.Contract(contractAdd, PatientData.abi, signer);
  const [errorIsShownNoAccess, setErrorIsShownNoAccess] = useState(false);
  const [errorIsShownNoAcct, setErrorIsShownNoAcct] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [showRecord, setShowRecord] = useState(false);

  const [patientAddress, setPatientAddress] = useState('');
  const [pulse, setPulse] = useState('');
  const [bloodO2, setBloodO2] = useState('');
  const [icd, setIcd] = useState('');


  const [addrToRetrieve, setAddrToRetrieve] = useState('');

  
  const [pulseDec, setPulseDec] = useState('');
  const [bloodO2Dec, setBloodO2Dec] = useState('');
  const [icdDec, setIcdDec] = useState('');


  const [open, setOpen] = React.useState(false);


  const handleClose = () => {
    setOpen(false);
  };
  
  const handleClick= async() => {

    //********** check permissions **********//

    if(!signer){
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedHosp();
    if(!result){
      setErrorIsShownNoAccess(current => !current);
      return;
    }


    //********** adverse events **********// 

    if(icd == "I22"){

      let inTrial = await contract.isAddrInTrial(patientAddress);

      if(inTrial){

        setOpen(true);

        const formObj = {
          icd: icd
        }
    
        const myJSON = JSON.stringify(formObj);

        const trialKey = await contract.getTrialKey();

        const ethUtil = require('ethereumjs-util');
        const sigUtil = require('@metamask/eth-sig-util');

        const advEventEnc = await ethUtil.bufferToHex(
            Buffer.from(
            JSON.stringify(
                sigUtil.encrypt({
                  publicKey: trialKey,
                  data: myJSON,
                version: 'x25519-xsalsa20-poly1305',
                })
            ),
            'utf8'
            )
        );

        contract.addAdvEvent(advEventEnc);
        console.log(advEventEnc);
      }

    }



    //********** encrypt for GP **********// 

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
      pulse: pulse,
      bloodO2: bloodO2,
      icd: icd
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



    //********* encrypt for patient ***********//

    const patientKey = await contract.getPatientKey(patientAddress);

    console.log(patientKey);

    const encryptedMessage2 = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: patientKey,
            data: myJSON,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    console.log(encryptedMessage2);

    //********** encrypt for research **********//

    const resKey = await contract.getResearchKeyHosp();

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
          console.log(encryptedMessage);
          console.log(encryptedMessage2);
          contract.addDataHosp(patientAddress, encryptedMessage, encryptedMessage2, encryptedMessage3);
        }
        )
        .catch((error) => console.log(error.message));



    await setIsShown(current => !current)

    setPatientAddress('');
    setBloodO2('');
    setPulse('');
    setIcd('');

  }

  //********** decrypt and display **********//

  const getRecord = async () => {

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedHosp();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    const acctAddr = await signer.getAddress();
    const encMess = await contract.getDataHosp(addrToRetrieve);

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
          setPulseDec(newmsg["pulse"]);
          setBloodO2Dec(newmsg["bloodO2"]);
          setIcdDec(newmsg["icd"]);
          
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

<div>

    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"ADVERSE EVENT!"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          An adverse event for your clinical trial has been reported. Please log in to view.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
    </div>



    <Divider>Patient Entry</Divider>


      <div>
        <TextField
          required
          id="outlined-required"
          label="Patient ID"
          value={patientAddress}
          onChange={(e)=>setPatientAddress(e.target.value)}
        />
        <TextField
          id="outlined-number"
          label="Pulse (bpm)"
          value={pulse}
          onChange={(e)=>setPulse(e.target.value)}
        />
        <TextField
          id="outlined-number"
          label="Blood Oxygen (mmHg)"
          value={bloodO2}
          onChange={(e)=>setBloodO2(e.target.value)}
        />
        <TextField
          id="outlined-number"
          label="ICD"
          value={icd}
          onChange={(e)=>setIcd(e.target.value)}
        />
        <br></br>
        <Button onClick={handleClick}>Submit</Button>


        {/* //=====================================================================// */}


        <Divider>Patient View</Divider>

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

        <Button onClick={getRecord}>Enter a patient address to view</Button>
      </div>


      {/* //=====================================================================// */}

      {showRecord && (

        <div>
          <p>Pulse (bpm): {pulseDec}</p>
          <p>Blood Oxygen (mmHg): {bloodO2Dec}</p>
          <p>ICD: {icdDec}</p>
        </div>

        )}


      {isShown && (
        <div>
          <Alert onClose={() => {setIsShown(current => !current)}}>Submitted!</Alert>
        </div>
      )}

      {errorIsShownNoAccess && (
        <div>
          <Alert severity="error" onClose={() => {setErrorIsShownNoAccess(current => !current)}}>Not authorised to input hospital data!</Alert>
        </div>
      )}
      <br></br>
      {errorIsShownNoAcct && (
        <div>
          <Alert severity="error" onClose={() => {setErrorIsShownNoAcct(current => !current)}}>You are not connected to an account!</Alert>
        </div>
      )}



      </div>
    </Box>
  );
}
