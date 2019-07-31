#!/usr/bin/env node

(async () => {

  // ens name to lookup is passed as the first argument to the command
  const [, , name] = process.argv;

  if (!name) {
    console.error('No name provided for lookup\nUsage: enslookup <name>')
    return;
  }

  console.log(`Name:\t\t\t${name}`);

  // load libraries
  const Web3 = require('web3');
  const ENS = require('ethereum-ens');
  const fs = require('fs');

  // connect to a network
  const provider = new Web3.providers.HttpProvider("http://localhost:8545");
  const web3 = new Web3(provider);


  //--------------- Start retrieve address process ---------------//

  //get registry address to initialize ens
  const registryAddress = 'PUT_REGISTRY_ADDRESS_HERE'
  var ens = new ENS(provider, registryAddress);


  //get contract address
  try {
    var address = await ens.resolver(name).addr();
    console.log(`Contract Address:\t${address}`);
  } catch (err) {
    console.log(err)
  }

  process.exit();
})();
