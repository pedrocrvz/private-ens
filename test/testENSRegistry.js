const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

const {
  exceptions
} = require('@ensdomains/test-utils');

const ENSRegistry = artifacts.require('ENSRegistry.sol')

const tld = 'example'

contract('ENSRegistry', function (accounts) {

  const rootNode = '0x0000000000000000000000000000000000000000000000000000000000000000';

  let ens;

  beforeEach(async () => {
    ens = await ENSRegistry.new();
  });

  describe('Initial State', async () => {
    it('should set the deployer as owner of 0x0', async function () {
      assert.equal(await ens.owner(rootNode), accounts[0]);
    });

    it('should have initial ttl 0', async function () {
      assert.equal(0, await ens.ttl(rootNode));
    });
  })

  describe('Access Control', async () => {
    it('should allow ownership transfers', async () => {
      let addr = '0x0000000000000000000000000000000000001234';

      let result = await ens.setOwner('0x0', addr, {
        from: accounts[0]
      });

      assert.equal(await ens.owner('0x0'), addr)

      assert.equal(result.logs.length, 1);
      let args = result.logs[0].args;
      assert.equal(args.node, rootNode);
      assert.equal(args.owner, addr);
    });

    it('should prohibit transfers by non-owners', async () => {
      try {
        await ens.setOwner('0x1', '0x0000000000000000000000000000000000001234', {
          from: accounts[0]
        });
      } catch (error) {
        return exceptions.ensureException(error);
      }

      assert.fail('transfer did not fail');
    });

    it('should allow setting resolvers', async () => {
      let addr = '0x0000000000000000000000000000000000001234'

      let result = await ens.setResolver('0x0', addr, {
        from: accounts[0]
      });

      assert.equal(await ens.resolver('0x0'), addr);

      assert.equal(result.logs.length, 1);
      let args = result.logs[0].args;
      assert.equal(args.node, rootNode);
      assert.equal(args.resolver, addr);
    });

    it('should prevent setting resolvers by non-owners', async () => {
      try {
        await ens.setResolver('0x1', '0x0000000000000000000000000000000000001234', {
          from: accounts[0]
        });
      } catch (error) {
        return exceptions.ensureException(error);
      }

      assert.fail('setting resolver did not fail');
    });

    it('should allow setting the TTL', async () => {
      let result = await ens.setTTL('0x0', 3600, {
        from: accounts[0]
      });

      assert.equal((await ens.ttl('0x0')).toNumber(), 3600);

      assert.equal(result.logs.length, 1);
      let args = result.logs[0].args;
      assert.equal(args.node, rootNode);
      assert.equal(args.ttl.toNumber(), 3600);
    });

    it('should prevent setting the TTL by non-owners', async () => {
      try {
        await ens.setTTL('0x1', 3600, {
          from: accounts[0]
        });
      } catch (error) {
        return exceptions.ensureException(error);
      }

      assert.fail('setting resolver did not fail');
    });

    it('should allow the creation of subnodes', async () => {
      let result = await ens.setSubnodeOwner('0x0', sha3(tld), accounts[1], {
        from: accounts[0]
      });

      assert.equal(await ens.owner(namehash.hash(tld)), accounts[1]);

      assert.equal(result.logs.length, 1);
      let args = result.logs[0].args;
      assert.equal(args.node, rootNode);
      assert.equal(args.label, sha3(tld));
      assert.equal(args.owner, accounts[1]);
    });

    it('should prohibit subnode creation by non-owners', async () => {
      try {
        await ens.setSubnodeOwner(rootNode, sha3(tld), accounts[1], {
          from: accounts[1]
        });
      } catch (error) {
        return exceptions.ensureException(error);
      }

      assert.fail('setting resolver did not fail');
    });
  })
});
