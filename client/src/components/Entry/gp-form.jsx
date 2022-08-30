import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio';
import { EthContext } from '../../contexts/EthContext';
import PatientData from '../../contracts/PatientData.json';
import { ethers } from 'ethers';
import { useState } from 'react';
import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

var CryptoJS = require("crypto-js");

export default function FormPropsTextFieldsGP(props) {

  // connects to contract
  const signer = React.useContext(EthContext);
  const contractAdd = '0x8e24ec30f1DaF5Db3aA38eAC3a6801771C99fBEd';
  const contract = new ethers.Contract(contractAdd, PatientData.abi, signer);

  const [isShown, setIsShown] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [errorIsShownNoAccess, setErrorIsShownNoAccess] = useState(false);
  const [errorIsShownNoAcct, setErrorIsShownNoAcct] = useState(false);
  const [errorImposs, setErrorImposs] = useState(false);

  const [patientAddress, setPatientAddress] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [med, setMed] = useState('');
  const [sex, setSex] = useState('')
  const [smoker, setSmoker] = useState('')

  const [heightDec, setHeightDec] = useState('');
  const [weightDec, setWeightDec] = useState('');
  const [bpDec, setBpDec] = useState('');
  const [medDec, setMedDec] = useState('');
  const [sexDec, setSexDec] = useState('')
  const [smokerDec, setSmokerDec] = useState('')
  const[name, setName] = useState('');

  const [addrToRetrieve, setAddrToRetrieve] = useState('');

  //=====================================================================//


  const handleClick = async () => {

    //**********checks permissions**********//

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedGP();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    //********** encrypt for gp **********//

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
      height: height,
      weight: weight,
      bp: bp,
      med: med,
      sex: sex,
      smoker: smoker
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

    const resKey = await contract.getResearchKeyGp();
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
          contract.addDataGP(patientAddress, encryptedMessage, encryptedMessage2, encryptedMessage3);
        }
        )
        .catch((error) => console.log(error.message));


    

    await setIsShown(current => !current);

    setPatientAddress('');
    setHeight('');
    setWeight('');
    setBp('');
    setSex('');
    setSmoker('');

  }


  //=====================================================================//


  const getRecord = async () => {

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedGP();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    const acctAddr = await signer.getAddress();
    const encMess = await contract.getDataGP(addrToRetrieve);

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
          setHeightDec(newmsg["height"]);
          setWeightDec(newmsg["weight"]);
          setBpDec(newmsg["bp"]);
          setMedDec(newmsg["med"]);
          setSexDec(newmsg["sex"]);
          setSmokerDec(newmsg["smoker"]);
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


    await setShowRecord(true);
    await setIsShown(true);


  }


  //=====================================================================//


  return (

    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >

    <Divider>Patient Entry</Divider>

    <br></br>
    <br></br>


  {/* //=====================================================================// */}


    <div>
      <TextField
        required
        id="outlined-required"
        label="Patient ID"
        value={patientAddress}
        onChange={(e) => setPatientAddress(e.target.value)}
      />
      <TextField
        id="outlined-number"
        label="Height (cm)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />
      <TextField
        id="outlined-number"
        label="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <TextField
        id="outlined-number"
        label="Systolic BP (mmHg)"
        value={bp}
        onChange={(e) => setBp(e.target.value)}
      />
      <FormControl sx={{ m: 1, minWidth: 260 }}>
        <InputLabel id="demo-simple-select-helper-label">Medication</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={med}
          label="Medication"
          onChange={(e) => setMed(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>Statins</MenuItem>
          <MenuItem value={2}>Oral Conception</MenuItem>
          <MenuItem value={3}>SSRI</MenuItem>
          <MenuItem value={4}>Beta Blockers</MenuItem>
        </Select>
      </FormControl>

      <br></br>

      <FormLabel id="demo-radio-buttons-group-label">Sex (assigned at birth)</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        onClick={(e) => setSex(Boolean(Number(e.target.value)))}
      >
      <FormControlLabel value={1} control={<Radio />} label="Female" />
      <FormControlLabel value={0} control={<Radio />} label="Male" />
      </RadioGroup>

      <FormLabel id="demo-radio-buttons-group-label">Smoking status</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        onClick={(e) => setSmoker(Boolean(Number(e.target.value)))}
      >
      <FormControlLabel value={1} control={<Radio />} label="Smoker" />
      <FormControlLabel value={0} control={<Radio />} label="Non-smoker" />
      </RadioGroup>

      <Button onClick={handleClick}>Submit</Button>

    </div>


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


    {showRecord && (

      <div>
        <p>Height (cm): {heightDec}</p>
        <p>Weight (kg): {weightDec}</p>
        <p>Systolic blood pressure (mmHg): {bpDec}</p>
        <p>Medication: {name}</p>
        <p>Sex (assigned at birth): {sexDec ? "Female" : "Male"}</p>
        <p>Smoking status: {smokerDec ? "Smoker" : "Non-smoker"}</p>
      </div>

    )}


  {/* //=====================================================================// */}


    {isShown && (
      <div>
        <Alert onClose={() => { setIsShown(current => !current) }}>Submitted!</Alert>
      </div>
    )}

    {errorIsShownNoAccess && (
      <div>
        <Alert severity="error" onClose={() => { setErrorIsShownNoAccess(current => !current) }}>Not authorised to input GP data!</Alert>
      </div>
    )}

    {errorIsShownNoAcct && (
      <div>
        <Alert severity="error" onClose={() => { setErrorIsShownNoAcct(current => !current) }}>You are not connected to an account!</Alert>
      </div>
    )}

    </Box>

  );
}
