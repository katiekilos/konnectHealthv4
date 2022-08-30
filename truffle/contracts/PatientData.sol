// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PatientData {

    // ---------------------------data storage-------------------------------- //

    uint public GPEntryCount = 0;
    uint public HospEntryCount = 0;
    uint public TrialEntryCount = 0;

    address addressGP = 0x44589428B907883Aa829f17a989Ce7271BD0FA41;
    address addressAdmin = 0x74d143bc67bDAAAC5544Dc8a85023bfD5Fd45381;
    address addressHospital = 0xf77019c1E6920F2a46bAe13ab1EF09A97995D2A0;
    address addressResearcher = 0x1d2FAEd1e14b05505FCAf5De88bc4853569cdF7D;
    address addressTrial = 0x8763451762DC3C146358b0EE6d46A2C224b56d28;

    string GpKey = "BFSfmzY/r8unmL5o8+oIJkDebF3lqeq6TUaw1Ty0Jl0=";
    string trialKey = "O2uYXeicOj/+xjOUuWdU8JVjQm1aMLZfDWAS0kTYCWg=";
    string hospKey = "y6I+CDV4bSn8/8xiD1qOZLv6RaAE43N+un0XEf4dnAI=";

    string resPrivKey;
    string resPrivKeyForGP;
    string resPrivKeyForHosp;
    string resPrivKeyForTrial;
    bool resKeySet = false;
    string adverseEvents;

    mapping (address=>bool) GPpermissions;

    mapping (address=>string) patientPubKeys;

    mapping(address=>string[3]) allRecords;
    mapping(address=>bool) inAllRecords;
    mapping(uint=>address) countToAddrAllRecords;
    uint public allRecordsCount = 0;


    mapping(address => string) public addrGPEntries;
    mapping(address => string) public addrGPEntriesForPatient;
    mapping(address => string) public addrGPEntriesForResearch;

    mapping(address => string) public addrHospEntries;
    mapping(address => string) public addrHospEntriesForPatient;
    mapping(address => string) public addrHospEntriesForResearch;

    mapping(address => string) public addrTrialEntries;
    mapping(address => string) public addrTrialEntriesForResearch;
    mapping(address => bool) public inTrial;

    string[] gpArray;
    string[] trialArray;
    string[] hospArray;
    string[] keys;
    string[] test;

    // ---------------------------Permissions--------------------------------- //


    function isAllowedGP() view external returns (bool){
        if(msg.sender != addressGP){
            return false;
        }
        return true;
    }

    function isAllowedHosp() view external returns (bool){
        if(msg.sender != addressHospital){
            return false;
        }
        return true;
    }

    function isAllowedTrial() view external returns (bool){
        if(msg.sender != addressTrial){
            return false;
        }
        return true;
    }

    function isAllowedResearch() view external returns (bool){
        if(msg.sender != addressResearcher){
            return false;
        }
        return true;
    }



    // ---------------------------add Data--------------------------------- //



    function addDataGP(address add, string memory gpData, string memory gpForPatient, string memory gpForRes) public{

        if(msg.sender == addressGP){

            addrGPEntries[add] = gpData;
            addrGPEntriesForPatient[add] = gpForPatient;
            addrGPEntriesForResearch[add] = gpForRes;

            allRecords[add][0] = gpForRes;
            if(!inAllRecords[add]){
                inAllRecords[add] = true;
                countToAddrAllRecords[allRecordsCount] = add;
                allRecordsCount = allRecordsCount + 1;
            }

            GPEntryCount = GPEntryCount + 1;
            gpArray.push(gpData);

        }
    }

    function addDataHosp(address add, string memory hospData, string memory hospForPatient, string memory hospForResearch) public {

        if(msg.sender == addressHospital){

            addrHospEntries[add] = hospData;
            addrHospEntriesForPatient[add] = hospForPatient;
            addrHospEntriesForResearch[add] = hospForResearch;

            allRecords[add][1] = hospForResearch;
            if(!inAllRecords[add]){
                inAllRecords[add] = true;
                countToAddrAllRecords[allRecordsCount] = add;
                allRecordsCount = allRecordsCount + 1;
            }

            HospEntryCount = HospEntryCount + 1;
            hospArray.push(hospData);

        }
    }

    function addDataTrial(address add, string memory trialData, string memory trialDataForRes) public{
        
        if(msg.sender == addressTrial){

            addrTrialEntries[add] = trialData;
            addrTrialEntriesForResearch[add] = trialDataForRes;
            inTrial[add] = true;

            allRecords[add][2] = trialDataForRes; 
            if(!inAllRecords[add]){
                inAllRecords[add] = true;
                countToAddrAllRecords[allRecordsCount] = add;
                allRecordsCount = allRecordsCount + 1;
            }

            TrialEntryCount = TrialEntryCount + 1;
            trialArray.push(trialData);

        }
    }

    function addResearchKey(string memory key, string memory gKey, string memory hKey, string memory tKey) public{
        
        if(!resKeySet){
            resKeySet = true;
            resPrivKey = key;
            resPrivKeyForGP = gKey;
            resPrivKeyForHosp = hKey;
            resPrivKeyForTrial = tKey;  
        }
        
    }

    function addAdvEvent(string memory adv) public {
        adverseEvents = adv;
    }


    // ---------------------------Get Data--------------------------------- //

    function getDataGP(address add) view external returns(string memory){
        return addrGPEntries[add]; 
    }

    function getDataGPforPatient() view external returns(string memory){
        return addrGPEntriesForPatient[msg.sender];
    }

    function getDataHosp(address add) view external returns(string memory){
        return addrHospEntries[add];
    }

    function getDataHospForPatient() view external returns(string memory){
        return addrHospEntriesForPatient[msg.sender];
    }

    function getDataTrial(address add) view external returns(string memory){
        return addrTrialEntries[add];
    }

    function getAllRecordsCount() view external returns(uint){
        return allRecordsCount;
    }

    function getAll() view external returns (string[][] memory){

        string[][] memory collection = new string[][](allRecordsCount);

        for(uint i = 0; i < allRecordsCount; i++){
            collection[i] = new string[](3);
        }

        for(uint i = 0; i < allRecordsCount; i++){
            collection[i][0] = allRecords[countToAddrAllRecords[i]][0];
            collection[i][1] = allRecords[countToAddrAllRecords[i]][1];
            collection[i][2] = allRecords[countToAddrAllRecords[i]][2];
        }

        return collection;

    }

    function getAdverseEvents() view external returns(string memory){
        return adverseEvents;
    }

    function isAddrInTrial(address add) view external returns(bool){
        if(inTrial[add]){
            return true;
        }
        return false;
    }


    // ---------------------------Share Keys--------------------------------- //

    function sharePubKeyWithGP(string memory key) public{
        patientPubKeys[msg.sender] = key;
        keys.push(key);
    }

    function getPatientKey(address add) view external returns(string memory){
        return patientPubKeys[add];
    }

    function getResearchKey() view external returns(string memory){
        return resPrivKey;
    }

    function getResearchKeyGp() view external returns(string memory){
        return resPrivKeyForGP;
    }

    function getResearchKeyHosp() view external returns(string memory){
        return resPrivKeyForHosp;
    }

    function getResearchKeyTrial() view external returns(string memory){
        return resPrivKeyForTrial;
    }

    function getGpKey() view external returns(string memory){
        return GpKey;
    }

    function getTrialKey() view external returns(string memory){
        return trialKey;
    }

    function getHospKey() view external returns(string memory){
        return hospKey;
    }
    

}