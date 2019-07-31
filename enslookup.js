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
  require('dotenv').config()
  const Web3 = require('web3');
  const fs = require('fs');
  const hashname = require('eth-ens-namehash')

  // connect to a network
  const provider = new Web3.providers.HttpProvider("http://localhost:8545");
  const web3 = new Web3(provider);


  //--------------- Start retrieve address process ---------------//

  const registryJson = JSON.parse(fs.readFileSync('node_modules/@ensdomains/ens/build/contracts/ENSRegistry.json', 'utf8'));
  const registryAddress = 'PUT_REGISTRY_ADDRESS_HERE'
  const registry = new web3.eth.Contract(registryJson.abi, registryAddress);

  // get the resolver address
  const resolverAddress = await registry.methods.resolver(hashname.hash(name)).call()

  // if name is not set
  if (resolverAddress === '0x0000000000000000000000000000000000000000') {
    console.log('nop, does not exist');
    return;
  }

  console.log(`Resolver Address:\t${resolverAddress}`);

  //get the contract address
  const resolverJson = JSON.parse(fs.readFileSync('node_modules/@ensdomains/resolver/build/contracts/PublicResolver.json'));
  const resolver = new web3.eth.Contract(resolverJson.abi, resolverAddress);
  const contractAddress = await resolver.methods.addr(hashname.hash(name)).call()


  console.log(`Contract Address: \t${contractAddress}`);

  process.exit();
})();
