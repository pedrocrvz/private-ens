# ENS Contracts

## Networks

Name | Node JSON-RPC Endpoint | Description
---------|----------|---------
development | http://127.0.0.1:8545 | To use with Ganache.


## Unit Tests

To perform unit tests on `development` network:

```shellscript
truffle test
```

## LookUp

To perform lookup of a name use the enslookup or enslookup_ethens (which uses ethereum-ens library to resolve the name) script available in this directory.
"SetStorage.sol" can be deployed as an example with name "mycontract.example".
To perform LookUp of the name execute:

```shellscript
node enslookup mycontract.example
or
node enslookup_ethens mycontract.example
```

## Quickstart

```shellscript
truffle migrate --reset --network NETWORK
node enslookup mycontract.example
```

### Docs

[ENS Documentation](https://github.com/ensdomains/docs)
