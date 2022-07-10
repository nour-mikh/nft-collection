import { useEffect, useState } from 'react';
import {ethers} from 'ethers';
import NftCollection from './utils/NftCollection.json';
import './App.css';

function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x1D989b3aC5338c6485E5ff9f497AE59e3c09E713" ;

  const checkIfWalletConnected = async () => {
    const { ethereum } = window;

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // Rinkeby hex
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    if(!ethereum){
      alert("Make sure you have MetaMask Connected");
    } else{
      console.log("MetaMask is connected, ", ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if(accounts.length !== 0 ){
      console.log("Found an authorized account.");
      setCurrentAccount(accounts[0]);
      setupEventListener();

    } else {
      console.log("No authorized account found.");
    }
  }

  const connectWallet = async () => {
    const {ethereum} = window;
    try{
      if(!ethereum){
        alert("Get MetaMask");
        return false;
      }
  
      const accounts = await ethereum.request({method : 'eth_requestAccounts'});
      console.log("Found an authorized account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();

      return true;

    } catch(error){
      console.log(error);
      return false;
    }

  }

  const connectButton = () => (
    <button onClick={connectWallet}>Connect to wallet</button>
  )

  const setupEventListener = () => {
    const {ethereum} = window;

    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NftCollection.abi, signer)

        contract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch(error){
      console.log(error);
    }
  }




  const mintNFT = async () => {
    const {ethereum} = window;
    const contractAddress = "0x1D989b3aC5338c6485E5ff9f497AE59e3c09E713" ;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NftCollection.abi, signer)

        console.log("Performing transaction...")
        let nftTxn = await contract.makeNFT();
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction at: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error){
      console.log(error);
    }

  }


  useEffect(()=>{
    checkIfWalletConnected()
  },[] )

  return (
  <>
  <div id = "main-info">
    <h1 id="title">Get yourself a unique NFT Today </h1>
    {currentAccount === "" ?  connectButton() : <button onClick = {mintNFT}>Mint NFT</button>}
  </div>
  </>
  );
}

export default App;
