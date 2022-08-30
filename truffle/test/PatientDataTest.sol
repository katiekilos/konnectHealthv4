// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../contracts/PatientData.sol";

// These files are dynamically created at test time
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract PatientDataTest {
    
    function testAddDataHosp() public {
        PatientData patientdata = PatientData(DeployedAddresses.PatientData());

        patientdata.addDataHosp(0x7F34561a29bD30aE3DF8015CD0F6105A50aA2526, true, '123', '456', '789');

        Assert.equal(patientdata.readAdd(), 0x7F34561a29bD30aE3DF8015CD0F6105A50aA2526, true, '123', '456', '789');

    }


}