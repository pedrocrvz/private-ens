module.exports = async function registerNameInENS(
  Registry, Registrar, Resolver, MyContract, label, tld, owner
) {

  const utils = require('web3-utils');
  const hashname = require('eth-ens-namehash')

  /**
   * Name: An ENS identifier such as 'alice.eth'. We want to register and own this domain.
   * Label: An individual component of a name, such as 'alice'.
   * Node: A cryptographic hash uniquely identifying a name.
   */
  const name = `${label}.${tld}`;
  const labelhash = utils.sha3(label);
  const node = hashname.hash(name);

  /**
   * We want our domain to point to the MyContract deployed.
   * The domain will be owned by the deploying account, all transactions modifying node records
   * will have to be performed from this account
   */

  const contractAddress = MyContract.address.toLowerCase();

  /**
   * Get ENS contract instances
   */
  const registry = await Registry.at(Registry.address);
  const registrar = await Registrar.at(Registrar.address);
  const resolver = await Resolver.at(Resolver.address);

  /**
   * Register mycontract.<tld>
   */
  await registrar.register(labelhash, owner, {
    from: owner
  });

  const registryOwner = await registry.owner(node)
  if (registryOwner.toLowerCase() !== owner.toLowerCase()) {
    throw `Failed to register '${name}'`;
  } else {
    console.log(`Successfully registered '${name}' \n(label ${labelhash}, node '${node}')`);
  }

  /**
   * Set the resolver
   */
  await registry.setResolver(node, resolver.address);
  if ((await registry.resolver(node)).toLowerCase() !== resolver.address.toLowerCase()) {
    throw `Failed to set resolver for '${name}'`;
  } else {
    console.log(`Successfully set resolver for '${name}'`);
  }

  /**
   * Store the address of the deployed contract with the resolver
   */
  await resolver.setAddr(node, contractAddress);
  if ((await resolver.addr(node)).toLowerCase() !== contractAddress) {
    throw `Failed to set address in resolver for '${name}'`;
  } else {
    console.log(`Successfully set address ${contractAddress} for '${name}' in resolver`);
  }

  const hexAbi = utils.toHex(MyContract.abi); // Objects are JSON.stringified first
  await resolver.setABI(node, 0x1, hexAbi, {
    from: owner
  })
  const storedAbiString = utils.toAscii((await resolver.ABI(node, 0x1))[1]);
  if (JSON.stringify(MyContract.abi) !== storedAbiString) {
    throw `Failed to store ABI in resolver for '${name}'`;
  } else {
    console.log(`Successfully set ABI for '${name}' in resolver`);
  }
}
