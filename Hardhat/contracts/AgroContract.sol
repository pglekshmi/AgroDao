//SPDX-License-Identifier:MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgroContract is Ownable{
    constructor(address initialOwner)Ownable(initialOwner){}
    struct AgroData{
        
        string plant;
        address proposer;
        string date;
    }

    mapping(uint256=>AgroData) public Agro;

    function registerAgro(uint256 _id, string memory _plant,address _proposer , string memory _date ) public {
        Agro[_id] = AgroData(_plant,_proposer,_date);
    }
}