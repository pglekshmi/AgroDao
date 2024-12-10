const { expect } = require("chai");
const { Log } = require("ethers");
const { ethers } = require("hardhat");

describe("AgroDao", function () {
  it("DAO Testing", async function () {
    //Getting the signers from simulated network. Since all accounts are open we can get more than one address
    const [owner,deleg,voter1,deleg1,voter2] = await ethers.getSigners();
    console.log(`Taking ${owner.address} as Owner`);

    //Deploying the Governance Token
    const govToken = await ethers.deployContract("GovToken", [owner]);
    await govToken.waitForDeployment();
    console.log("Token Address",govToken.target);
    

    //At the time of deployment tokens are minted to owner. Checking the balance
    let balance = await govToken.balanceOf(owner.address);
    console.log(balance);

    //Converting the ether representation to wei
    let mintAmount = await ethers.parseUnits('1000',18);
    console.log(mintAmount);
    
    //Trying to mint tokens
    await govToken.connect(owner).mint(deleg.address,mintAmount);

    //Checking the total supply
    let totalSupply = await govToken.totalSupply();
    console.log(totalSupply);

    //Deploy Timelock contract
    const timeLock = await ethers.deployContract("TimeLock", [0, [owner.address], [owner.address], owner.address]);
    timeLock.waitForDeployment();
    console.log("Timelock Contract address",timeLock.target);

    //Deploy Agro contract by setting Timelock contract as owner
    const agroC = await ethers.deployContract("AgroContract", [timeLock.target]);
    agroC.waitForDeployment();
    console.log("AgroContract address",agroC.target);
    
    
    //Deploy Governance Contract
    const govern = await ethers.deployContract("GovernContract", [govToken.target, timeLock.target, 100, 100, 4]);
    govern.waitForDeployment();

    //Setting owner are delegate
    let delegateT = await govToken.delegate(owner.address);
    await delegateT.wait(1);

    //Getting the votes of owner
    let vote = await govToken.getVotes(owner.address);
    console.log(`Voting units for ${owner.address} is ${vote}`);

    /*contract TimelockController is AccessControl, ERC721Holder, ERC1155Holder {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");*/

    const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timeLock.EXECUTOR_ROLE();

    //Granting Governance Contract role of Proposer & Executor
    await timeLock.connect(owner).grantRole(PROPOSER_ROLE, govern.target);
    await timeLock.connect(owner).grantRole(EXECUTOR_ROLE, govern.target);
    
    //Creating a contract object and building a transaction in hexadecimal representation
    const AgroObj = await ethers.getContractAt("AgroContract", agroC.target);
    const transCallData = AgroObj.interface.encodeFunctionData("registerAgro", [1,"mint",deleg1.address,"06/12/2024"]);
    console.log(`The calldata TRansaction ${transCallData}`);

    //Proposal created and now delegates can vote for Proposal
    proposeTx = await govern.propose([agroC.target], [0], [transCallData], "Proposal:The new plant for hydroponics");
    await proposeTx.wait(1);
    console.log(`Our Proposal: ${proposeTx}`);

    //ProposalCreated Event object created which can be used for queryFilter
    const efilter = await govern.filters.ProposalCreated();
    const blockNumber = proposeTx.blockNumber;
    console.log(`Proposal Blocknumber: ${blockNumber}`);

    //Get the event log and get the ProposalId from log
    const events = await govern.queryFilter(efilter, blockNumber, blockNumber);
    console.log(events[0].args.proposalId);
    let proposalID = events[0].args.proposalId;

    //Get the state of proposal
    /*enum ProposalState {
      Pending,
      Active,
      Canceled,
      Defeated,
      Succeeded,
      Queued,
      Expired,
      Executed
  }*/
    let pState = await govern.state(proposalID);
    console.log(`State of contract: ${pState}`); //0

    // After 100 blocks proposal become active
    for (i = 0; i < 110; i++) {
      await network.provider.send("evm_mine");
    }

    //Checking the proposal State
    pState = await govern.state(proposalID);
    console.log(`State of contract: ${pState}`);  //1

    //Casting vote
    let voteTx = await govern.castVoteWithReason(proposalID, 1, "Isupport");
    await voteTx.wait(1);

    //Getting the voteStatus. It will return like againt,for,absurt
    let voteStatus = await govern.proposalVotes(proposalID);
    console.log(`Vote Status: ${voteStatus}`);

    //Again checking state..Still on Active State
    pState = await govern.state(proposalID);
    console.log(`State of contract: ${pState}`);

  
    //Checking the total supply
    totalSupply = await govToken.totalSupply();
    console.log(totalSupply);



     //Setting another person as delegate
     delegateT = await govToken.delegate(deleg.address);
     await delegateT.wait(1);

    //Getting the votes of owner
    vote = await govToken.getVotes(deleg.address);
    console.log(`Voting units for ${deleg.address} is ${vote}`);

    //Again checking state..Still on Active State
    pState = await govern.state(proposalID);
    console.log(`State of contract: ${pState}`);

     //Casting vote
      voteTx = await govern.connect(deleg).castVoteWithReason(proposalID, 1, "I dont agree");
     await voteTx.wait(1);

     //Getting the voteStatus. It will return like againt,for,absurt
     const [againstVotes, forVotes, abstainVotes] = await govern.proposalVotes(proposalID);
     console.log(`Against Votes: ${againstVotes}`);
     console.log(`For Votes: ${forVotes}`);
     console.log(`Abstain Votes: ${abstainVotes}`);

    
    for (i = 0; i < 100; i++) {
      await network.provider.send("evm_mine");
    }

     //Again checking state..Still on Active State
     pState = await govern.state(proposalID);
     console.log(`State of contract: ${pState}`);

     let queueTx;
     let DescriptionHash;
 
     if (pState == 4) {

      DescriptionHash = ethers.id("Proposal:The new plant for hydroponics");

      queueTx = await govern.connect(owner).queue([agroC.target], [0], [transCallData], DescriptionHash);
      await queueTx.wait(1);
     }

     //Again checking state..Still on Active State
     pState = await govern.state(proposalID);
     console.log(`State of contract: ${pState}`);
 
     const efilter1 =  govern.filters.ProposalCreated();

     const pevent = await govern.queryFilter(efilter1, 0, queueTx.blockNumber);
     proposalID= pevent[0].args.proposalId;

     const execTx = await govern.connect(owner).execute([agroC.target],[0],[transCallData],DescriptionHash);
     await execTx.wait(1);

     //Again checking state..Still on Active State
     pState = await govern.state(proposalID);
     console.log(`State of contract: ${pState}`); 

  });
});