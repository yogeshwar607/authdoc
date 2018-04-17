var DocAuth = artifacts.require("./DocAuth.sol");
var ECVerify = artifacts.require("./ECVerify.sol");

module.exports = function(deployer) {
  //deployer.deploy(ECVerify);
  //deployer.link(ECVerify, DocAuth);
  deployer.deploy(DocAuth);
};


// Deploy A, then deploy B, passing in A's newly deployed address
// deployer.deploy(A).then(function() {
//   return deployer.deploy(B, A.address);
// });