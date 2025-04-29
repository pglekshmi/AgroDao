import { id, Interface,ethers,network } from "ethers";
import { useState,useEffect } from "react";
import agroAbi from './assets/AgroContract.json';
import governAbi from './assets/GovernContract.json';
import tokenAbi from './assets/GovToken.json';
import lockAbi from './assets/TimeLock.json';
import address from './assets/deployedAddresses.json';

function App(){
    const [formData,setFormData]= useState({
                                                plant:'',
                                                date:''
                                            });

    
    const [count,setCount]= useState(1);
    const [proposer,setProposer]= useState();
    const [signerT,setSignerT] = useState();
    const [transData,setTransdata]=useState();
    const [blockNumber,setBlockNumber]= useState(0);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const eventTopic = id('ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)')
    const iface = new Interface(governAbi.abi);
   
    

    useEffect(()=>{
        let eventLog=[]
        console.log(blockNumber);
        
        const handleEvent=async()=>{
            console.log("hello");
            
            const signer = await provider.getSigner();
            const govern = new ethers.Contract(address.GovernorContractAddr,governAbi.abi, signer);

        const logResponse = await provider.getLogs({
            fromBlock:blockNumber,
            toBlock:blockNumber,
            address:address.GovernorContractAddr,
            topics:[eventTopic]
        })
        console.log("ji",logResponse);
        logResponse.forEach((log)=>{
            eventLog.push(iface.parseLog(log))
        });
        console.log(eventLog[0].args.proposalId);
        const ID = Number(eventLog[0].args.proposalId) ;
        console.log(ID);
        const pState = await govern.state(eventLog[0].args.proposalId);
        console.log(`State of contract: ${pState}`); 
        
    }
     handleEvent();   

    },[blockNumber]);

    // async function generateBlock(){

    // for (let i = 0; i < 110; i++) {
    //     await network.provider.send("evm_mine");
    //   }
    // }
    
    
    async function connectToMetamask(){
        console.log("Connected....");
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log(provider);
        const signer = await provider.getSigner();
        setProposer(signer.address)
        alert(`Connected to ${signer.address}`);
        
        
    }

    function handleChange(e){
        
        const {name,value}= e.target;
        // const value = e.target.value;
        console.log(name);
        
        
        setFormData((prevState)=>({...prevState,[name]:value}));
        console.log(formData);
        }

        async function handleSubmit(e){
            e.preventDefault();
            console.log("hi");
            // setSignerT( new ethers.JsonRpcProvider("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"));
            // count++;
            // setCount(count);
            const provider = new ethers.BrowserProvider(window.ethereum);
            console.log(provider);
            const signer = await provider.getSigner();
            
            
            const agroInstance = new ethers.Contract(address.AgroAddr,agroAbi.abi, signer);
            console.log(formData.plant);
            // console.log(("Signer address",signerT));
            
            const trans = agroInstance.interface.encodeFunctionData("registerAgro",[1,formData.plant,signer.address,formData.date]);
            setTransdata(trans);
            
            
            // console.log(transData);
            // console.log(("Signer address",signerT));
            
            
            // const instance = new ethers.Contract(address.GovernorContractAddr,governAbi.abi,signer);

            // const agroPropose = await instance.propose()

        }
        async function handleProposal(){
            console.log(transData);
            const provider = new ethers.BrowserProvider(window.ethereum);
            console.log(provider);
            const signer = await provider.getSigner();
            console.log(signer.address);
            
            const instance = new ethers.Contract(address.GovernorContractAddr,governAbi.abi,signer);
            console.log(instance);
            

            const agroPropose = await instance.propose([address.AgroAddr],[0],[transData],"Proposal:The new plant for hydroponics");
            await agroPropose.wait();
            console.log("HI");
            
            // JSON.stringify(agroPropose);
            // console.log(`Our Proposal: ${agroPropose}`);
          
            let agror =JSON.stringify(agroPropose);
            let agroRecept = JSON.parse(agror);
            
            console.log(agroRecept.hash);
            let txRec = await provider.getTransactionReceipt(agroRecept.hash);
            const txData= JSON.stringify(txRec);
             txRec = JSON.parse(txData)

            console.log(txRec.blockNumber);
            setBlockNumber(txRec.blockNumber);
            console.log(blockNumber);
            
            
           
            
            // console.log(`Proposal Blocknumber: ${blockNumber}`);
        }

    return(
        <div>
            <h1>AgroDao</h1>
            <input type="button" onClick={connectToMetamask}  value="Connect To Metamask"></input>
        
         <p>Give Proposals</p>
         <div>
         <form onSubmit={handleSubmit} >
         <div>
          <label>Plant</label>
          <input type="text" id="plant" name="plant" onChange={handleChange} ></input>
          </div>
          <div>
          <label>Date</label>
          <input type="date" id="date" name="date" onChange={handleChange}></input>
          </div>
          <input type='submit' value="Submit to Proposer" ></input>
         </form>

         </div>
         <input type="button" onClick={handleProposal} value="Submit Proposal" ></input>
         </div>
    )
}

export default App;