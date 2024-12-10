
import { useState } from 'react';
import './index.css'

function App() {
  const [formdata,setFormdata]= useState({
    plant:'',
    proposer:'',
    date:''
  });

  function handleChange(e){
    const [name,value] = e.target;
    setFormdata((prevState)=>({...prevState,[name]:[value]}));
  }

  function handleSubmit(){
     e.preventDefault();
     
  }
  

  return (
    <>
     <h1 classname="text-red-400">AgroDAO</h1>
     <p>Give Proposals</p>
     <div>
     <form onSubmit={handleSubmit} className="grid grid-rows-3">
     <div>
      <label>Plant</label>
      <input type="text" id="plant" name="plant" onChange={handleChange}></input>
      </div>
      <div>
      <label>Your Wallet Address</label>
      <input type="text" id="proposer" name="proposer" onChange={handleChange}></input>
      </div>
      <div>
      <label>Date</label>
      <input type="date" id="date" name="date" onChange={handleChange}></input>
      </div>
      <input type='submit' value="Submit Proposal" ></input>
     </form>
     </div>
    </>
  )
}

export default App;
