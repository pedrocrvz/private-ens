const Registry = artifacts.require('ENSRegistry.sol');
const Registrar = artifacts.require('FIFSRegistrar.sol');
const Resolver = artifacts.require('PublicResolver.sol');

const MyContract = artifacts.require("SetStorage.sol");

const name = "mycontract";
const tld = "example";
const registerNameInENS = require("./ensutils");

module.exports = function (deployer, network, accounts) {
  const owner = accounts[0]
  deployer.deploy(MyContract, {
      from: owner
    })
    .then(async function () {
      await registerNameInENS(Registry, Registrar, Resolver, MyContract, name, tld, owner);
    })
};
