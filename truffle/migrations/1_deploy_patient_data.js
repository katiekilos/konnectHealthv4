const PatientData = artifacts.require("PatientData");

module.exports = function (deployer) {
  deployer.deploy(PatientData);
};
