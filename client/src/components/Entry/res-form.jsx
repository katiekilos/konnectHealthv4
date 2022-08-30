import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { CSVLink, CSVDownload } from 'react-csv';
import { getIcapAddress } from 'ethers/lib/utils';
import { EthContext } from '../../contexts/EthContext';
import { ethers } from 'ethers';
import { useState } from 'react';
import PatientData from '../../contracts/PatientData.json';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
var CryptoJS = require("crypto-js");




export default function ResSelect(props) {

  // connects to contract
  const contractAdd = '0x8e24ec30f1DaF5Db3aA38eAC3a6801771C99fBEd';
  const signer = React.useContext(EthContext);
  const contract = new ethers.Contract(contractAdd, PatientData.abi, signer);

  // show pop ups
  const [errorIsShownNoAccess, setErrorIsShownNoAccess] = useState(false);
  const [errorIsShownNoAcct, setErrorIsShownNoAcct] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // records
  const [patientRecordH, setPatientRecordH] = useState({ sex: "", bp: "", pulse: "", admit: "" });
  const [patientRecordG, setPatientRecordG] = useState([]);
  const csvHeaders = ['anonID', 'ht (cm)', 'wt (kg)', 'hypertensive', 'statins', 'oral contraception', 'SSRI',
  'Beta blockers','icd','myocardial infarction', 'group', 'smoker', 'cancer', 'ACM', 'afib'];

  const [csvData, setCsvData] = useState([]);

  const [key, setKey] = useState('');

  const [pvalue, setPvalue] = useState('');
  const [chiSq, setChiSq] = useState('');
  const [exposure, setExposure] = useState('');
  const [outcome, setOutcome] = useState('');



  // do hypothesis test
  const chiSquared = async () =>{

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedResearch();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    setChiSq('');
    setPvalue('');

    const encKey = await contract.getResearchKey();
    const acctAddr = await signer.getAddress();

    let decKey;
    await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encKey, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          decKey = decryptedMessage;
        }
        )
        .catch((error) => console.log(error.message));


    const rows = [];
    const encMess = await contract.getAll();

    const count = await contract.getAllRecordsCount();

    let onOCandMI = 0;
    let onOCandNo = 0;
    let noOCandMI = 0;
    let noOCandNo = 0;

      for(let i = 0; i < count; i++){
        let decryptedData = {
          height: null,
          weight: null,
          bp: null,
          med: null,
          sex: null,
          smoker: null
        }
        let decryptedData2 = {
          pulse: null,
          bloodO2: null,
          icd: null
        }
        let decryptedData3 = {
          group: null, 
          dose: null, 
          ldl: null
        }
        if(encMess[i][0]){
          const bytes = CryptoJS.AES.decrypt(encMess[i][0], decKey);
          decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData);
        }
        if(encMess[i][1]){
          const bytes2 = CryptoJS.AES.decrypt(encMess[i][1], decKey);
          decryptedData2 = JSON.parse(bytes2.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData2);
        }
        if(encMess[i][2]){
          const bytes3 = CryptoJS.AES.decrypt(encMess[i][2], decKey);
          decryptedData3 = JSON.parse(bytes3.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData3);
        }

        if(decryptedData.med == exposure){
          if(decryptedData2.icd == 'I22'){
            onOCandMI = onOCandMI + 1;
          }else{
            onOCandNo = onOCandNo + 1;
          }
        }else{
          if(decryptedData2.icd == 'I22'){
            noOCandMI = noOCandMI + 1;
          }else{
            noOCandNo = noOCandNo + 1;
          }
        }



      }


      console.log(onOCandMI);
      console.log(onOCandNo);
      console.log(noOCandMI);
      console.log(noOCandNo);



      let n = onOCandMI + onOCandNo + noOCandMI + noOCandNo;
      let onOCandMIexp = ((onOCandMI + onOCandNo) * (onOCandMI + noOCandMI)) / n;
      let onOCandNoExp = ((onOCandMI + onOCandNo) * (onOCandNo + noOCandNo)) / n;
      let noOCandMIexp = ((noOCandMI + noOCandNo) * (noOCandMI + onOCandMI)) / n;
      let noOCandNoExp = ((noOCandMI + noOCandNo) * (noOCandNo + onOCandNo)) / n;
      console.log(onOCandMIexp);
      console.log(onOCandNoExp);
      console.log(noOCandMIexp);
      console.log(noOCandNoExp);

      let chiSqVal = ((onOCandMI - onOCandMIexp) * (onOCandMI - onOCandMIexp)) / onOCandMIexp;
      chiSqVal = chiSqVal + ((onOCandNo - onOCandNoExp) * (onOCandNo - onOCandNoExp)) / onOCandNoExp;
      chiSqVal = chiSqVal + ((noOCandMI - noOCandMIexp) * (noOCandMI - noOCandMIexp)) / noOCandMIexp;
      chiSqVal = chiSqVal + ((noOCandNo - noOCandNoExp) * (noOCandNo - noOCandNoExp)) / noOCandNoExp;

      if(chiSqVal >= 3.84){
        setPvalue(true);
      }else{
        setPvalue(false);
      }

    setChiSq(chiSqVal);

    setShowResult(true);
    
  }



  // generate data 
  const handleClick = async () => {

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedResearch();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    const encKey = await contract.getResearchKey();
    const acctAddr = await signer.getAddress();

    let decKey;
    await window.ethereum
        .request({
          method: 'eth_decrypt',
          params: [encKey, acctAddr],
        })
        .then((decryptedMessage) => {
          console.log('The decrypted message is:', decryptedMessage)
          decKey = decryptedMessage;
        }
        )
        .catch((error) => console.log(error.message));


    const rows = [];

      
      const encMess = await contract.getAll();
  
      // console.log(encMess[0]);
      // const bytes = CryptoJS.AES.decrypt(encMess[0][0], decKey);
      // const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      // console.log(decryptedData);
      // const bytes2 = CryptoJS.AES.decrypt(encMess[0][1], decKey);
      // const decryptedData2 = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      // console.log(decryptedData2);
      // if(encMess[0][3]){
      //   const bytes3 = CryptoJS.AES.decrypt(encMess[0][2], decKey);
      // const decryptedData3 = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      // console.log(decryptedData3);
      // }
      
      const count = await contract.getAllRecordsCount();

      for(let i = 0; i < count; i++){
        let decryptedData = {
          height: null,
          weight: null,
          bp: null,
          med: null,
          sex: null,
          smoker: null
        }
        let decryptedData2 = {
          pulse: null,
          bloodO2: null,
          icd: null
        }
        let decryptedData3 = {
          group: null, 
          dose: null, 
          ldl: null
        }
        if(encMess[i][0]){
          const bytes = CryptoJS.AES.decrypt(encMess[i][0], decKey);
          decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData);
        }
        if(encMess[i][1]){
          const bytes2 = CryptoJS.AES.decrypt(encMess[i][1], decKey);
          decryptedData2 = JSON.parse(bytes2.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData2);
        }
        if(encMess[i][2]){
          const bytes3 = CryptoJS.AES.decrypt(encMess[i][2], decKey);
          decryptedData3 = JSON.parse(bytes3.toString(CryptoJS.enc.Utf8));
          console.log(decryptedData3);
        }
        rows.push({
                anonID: i,
                'ht (cm)': decryptedData.height,
                'wt (kg)':decryptedData.weight,
                'hypertensive': decryptedData.bp > 140 ? 1 : 0,
                'statins': decryptedData.med == 1 ? 1 : 0,
                'oral contraception': decryptedData.med == 2 ? 1 : 0,
                'SSRI': decryptedData.med == 3 ? 1 : 0,
                'Beta blockers': decryptedData.med == 4 ? 1 : 0,
                'icd': decryptedData2.icd,
                'myocardial infarction': decryptedData2.icd == 'I22' ? 1 : 0,
                'pulse': decryptedData2.pulse,
                'bloodO2': decryptedData2.bloodO2,
                'group': decryptedData3.group ? 1 : 0
              });
      }

    setCsvData(rows);

    setShowLink(current => !current);


  }


  // set key
  const submitKey = async () => {

    if (!signer) {
      setErrorIsShownNoAcct(current => !current);
      return;
    }
    const result = await contract.isAllowedResearch();
    if (!result) {
      setErrorIsShownNoAccess(current => !current);
      return;
    }

    let resKey;
    const acctAddr = await signer.getAddress()
    await window.ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [acctAddr], // you must have access to the specified account
      })
      .then((result) => {
        resKey = result;
        console.log(resKey);
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("We can't encrypt anything without the key.");
        } else {
          console.error(error);
        }
      });

    const gpKey = await contract.getGpKey();
    const trialKey = await contract.getTrialKey();
    const hospKey = await contract.getHospKey();

    const ethUtil = require('ethereumjs-util');
    const sigUtil = require('@metamask/eth-sig-util');


    const encryptedMessage1 = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: resKey,
            data: key,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    const encryptedMessage2 = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: gpKey,
            data: key,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    const encryptedMessage3 = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: hospKey,
            data: key,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    const encryptedMessage4 = await ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: trialKey,
            data: key,
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );

    await contract.addResearchKey(encryptedMessage1, encryptedMessage2, encryptedMessage3, encryptedMessage4);


    setKey('');
  }






  return (
    <Box sx={{ minWidth: 120 }}>

<Divider>Set Your Secret Key</Divider>

<br></br>

      <div>
        <TextField
          required
          id="outlined-required"
          label="Key entry"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <div></div>

        <Button onClick={submitKey} >Submit </Button>
      </div>



<Divider>Tools</Divider>



      <p>
        Export a pseudo-anonymised dataset across GP, hospital, and
        trial data for research. KonnectHealth has an immutable 
        record of transactions between patients and the above institutions and therefore matches
        on transaction addresses are of high confidence and can be generated immediately. 
      </p>
      <p>Data will be returned as a CSV.</p>
      <Button onClick={handleClick}>Generate</Button>

      <br></br>
      <br></br>
      {showLink && (
        <div>
          <CSVLink data={csvData} headers={csvHeaders} >Download me</CSVLink>
        </div>
      )}


      <p>Or without viewing any information, run an epidemilogical hypothesis test of 
        association. Choose the exposure and outcome of interest.</p>

        <FormControl sx={{ m: 1, minWidth: 260 }}>
        <InputLabel id="demo-simple-select-helper-label">Exposure</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={exposure}
          label="Exposure"
          onChange={(e) => setExposure(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem> 
          <MenuItem value={2}>Oral contraception</MenuItem>
          <MenuItem value={1}>Statins</MenuItem>
        </Select>
      </FormControl>


      <FormControl sx={{ m: 1, minWidth: 260 }}>
        <InputLabel id="demo-simple-select-helper-label">Outcome</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={outcome}
          label="Outcome"
          onChange={(e) => setOutcome(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>Myocardial infarction I-22</MenuItem>
          <MenuItem value={2}>Ischaemic stroke I-8</MenuItem>
          <MenuItem value={2}>Pneumonia J129</MenuItem>
        </Select>
      </FormControl>

        <Button onClick={chiSquared}>Run Test</Button>

        {showResult && (
        <div>
          <p>The association between {exposure == 1 ? "Oral contraception" : "Statins"} and 
            myocardial infarction has a 
            chi squared value of {chiSq} {pvalue ? "which is statistically significant (p < 0.05)" : "which is not statistically significant (p > 0.05)"}
          </p>
        </div>
      )}


      {errorIsShownNoAccess && (
        <div>
          <Alert severity="error" onClose={() => { setErrorIsShownNoAccess(current => !current) }}>Not authorised to retrieve research data!</Alert>
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