pragma solidity >=0.4.21 <0.6.0;
/**
* Used for tests purposes
*/
contract SetStorage {
    uint public counter;

    constructor() public {
        counter = 0;
    }

    function setStorage(uint count) public {
        counter = count;
    }
}
