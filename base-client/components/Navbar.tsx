import React, { useEffect } from 'react'
import { ConnectWallet } from "@thirdweb-dev/react";
import { useAddress, useContractRead, useContract } from "@thirdweb-dev/react";

import Link from 'next/link'

import { abi, contractAddress } from '../constants/Token/token'


interface NavbarProps {
  linkHref: string;
  linkText: string;
}

const Navbar: React.FC<NavbarProps> = ({ linkHref, linkText }) => {
  const options = {
    injectProvider: false,
    communicationLayerPreference: 'webrtc',
  };


  const address = useAddress()
  const { contract } = useContract(contractAddress, abi);

  const { data, isLoading, error } = useContractRead(contract, "getBalanceOfAddress", [address]);

  const tokenAddress = contractAddress;
  const tokenSymbol = 'POW';
  const tokenDecimals = 18;
  const tokenImage = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fvideos%2Fmuscle-emoji&psig=AOvVaw2DK0Hhe3lo-ErwDP1NhkHH&ust=1691563045629000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKC4ysW5zIADFQAAAAAdAAAAABAY';

  const addPowToMetamask = async () => {
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress, 
            symbol: tokenSymbol, 
            decimals: tokenDecimals, 
            image: tokenImage,
          },
        },
      });
    
      if (wasAdded) {
        alert('Thanks for your interest!');
      } else {
        alert('Your loss!');
      }
    } catch (error) {
      alert(error);
    }
  }

  return (
    <nav className="flex items-center justify-between bg-black p-5">
        <Link href={'/dashboard'}>
          <span className="text-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-text font-black">Proof of Workout Protocol</span>
        </Link>
        <div className="flex items-center space-x-2">
            <div className='flex flex-col items-start justify-start'>
              <h1 className='text-[20px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-text font-bold mr-10'>
                💪 {Number(data)/1000000000000000000} POW tokens
              </h1>
              <button onClick={addPowToMetamask} className='text-white text-[12px] hover:underline hover:cursor-pointer'>Add POW into your metamask</button>
            </div>
            <Link href={linkHref}>
                <button className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-2 rounded-lg'>
                    {linkText}
                </button>
            </Link>
            
            <ConnectWallet
                theme="dark"
                className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'
            />
        </div>
    </nav>
  )
} 

export default Navbar
