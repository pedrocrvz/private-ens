pragma solidity ^0.5;

import "../contracts/ENSLookUp.sol";

 // These imports are only needed for setup
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "@ensdomains/ens/contracts/FIFSRegistrar.sol";



contract TestWorkflowOnChain is ENSLookUp(DeployedAddresses.ENSRegistry()) {

    // namehash('test.example')
    bytes32 private node = 0xa365e3809a7c02758e77702836bdfb7cde9f57661175e9d40d77776cb4039f38;

    function testAddressLookup() public {
        address resolverAddrForNode = addressOf(node);
        Assert.equal(resolverAddrForNode, address(this), "Address lookup returns stored address");
    }

    function testTextLookup() public {
        string memory resolverTextForNode = textOf(node, key);
        Assert.equal(resolverTextForNode, someData, "Text lookup returns stored data");
    }

    /*
     * Setup
     */

    // 'example'
    bytes32 private tldNamehash = 0xbb0807b9d6e8c2bb1dc2b84cfacb442a45a0de252e47e1f142f56db08a3327e4;

    string private someData = "This data is stored in the resolver";
    string private key = "key";

    constructor() public {
        FIFSRegistrar registrar = FIFSRegistrar(DeployedAddresses.FIFSRegistrar());
        registrar.register(keccak256(abi.encodePacked("test")), address(this));
        ens.setResolver(node, DeployedAddresses.PublicResolver());
        Resolver(DeployedAddresses.PublicResolver()).setAddr(node, address(this));
        Resolver(DeployedAddresses.PublicResolver()).setText(node, key, someData);
    }

    function testSetup() public {
        Assert.equal(
            ens.owner(tldNamehash),
            DeployedAddresses.FIFSRegistrar(),
            "Owner of example is the registrar"
        );
        Assert.equal(
            ens.owner(node),
            address(this),
            "Owner of registered domain is this contract"
        );
        Assert.equal(
            ens.resolver(node),
            DeployedAddresses.PublicResolver(),
            "Resolver for the test.example node is set in registry"
        );
    }

}