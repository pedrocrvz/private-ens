const ENSRegistry = artifacts.require('ENSRegistry');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const PublicResolver = artifacts.require('PublicResolver');

const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

contract('Workflow', function (accounts) {

  const rootNode = '0x00';

  const tld = 'example';
  const subdomain = 'test'
  const ENSAbi = JSON.parse(JSON.stringify(ENSRegistry.abi));
  const jsonAbiCode = 0x1;

  let registrar, ens, resolver;

  before(async () => {
    ens = await ENSRegistry.new();
    //new registrar to deal with subdomain
    registrar = await FIFSRegistrar.new(ens.address, namehash.hash(tld));
    await ens.setSubnodeOwner(rootNode, sha3(tld), registrar.address);
    resolver = await PublicResolver.new(ens.address);
  });


  describe('Initial Setup', function () {
    it('should register a subdomain with the registrar', async function () {
      await registrar.register(sha3(subdomain), accounts[1], {
        from: accounts[1]
      });
      assert.equal(await ens.owner(namehash.hash(`${subdomain}.${tld}`)), accounts[1]);
    });

    it('should set the resolver for that domain in the registry', async function () {
      await ens.setResolver(namehash.hash(`${subdomain}.${tld}`), resolver.address, {
        from: accounts[1]
      });
      assert.equal(resolver.address, await ens.resolver(namehash.hash(`${subdomain}.${tld}`)));
    });

    it('should set the address and abi for that domain in the resolver', async function () {
      await resolver.setAddr(namehash.hash(`${subdomain}.${tld}`), accounts[2], {
        from: accounts[1]
      });
      assert.equal(await resolver.addr(namehash.hash(`${subdomain}.${tld}`)), accounts[2]);

      const hexAbi = web3.utils.utf8ToHex(JSON.stringify(ENSAbi));
      await resolver.setABI(namehash.hash(`${subdomain}.${tld}`), jsonAbiCode, hexAbi, {
        from: accounts[1]
      })

      let result = await resolver.ABI(namehash.hash(`${subdomain}.${tld}`), jsonAbiCode);
      assert.equal(result[1], hexAbi);
      const storedAbi = JSON.parse(web3.utils.hexToUtf8(result[1]));
      assert.deepEqual(storedAbi, ENSAbi);
    });
  })

  describe('Usage', function () {
    it('should allow to lookup address and abi based only on the domain and registry address', async function () {
      const domain = `${subdomain}.${tld}`;
      const registryAddress = ens.address
      const node = namehash.hash(domain);

      const newRegistry = await ENSRegistry.at(registryAddress);
      const resolverAddress = await newRegistry.resolver(node);
      const newResolver = await PublicResolver.at(resolverAddress);

      const storedContractAddress = await newResolver.addr(node);
      const storedContractAbiHex = await newResolver.ABI(node, jsonAbiCode);
      const storedContractAbi = JSON.parse(web3.utils.hexToUtf8(storedContractAbiHex[1]));

      assert.equal(storedContractAddress, accounts[2]);
      assert.deepEqual(storedContractAbi, ENSAbi);
    });
  })

})
