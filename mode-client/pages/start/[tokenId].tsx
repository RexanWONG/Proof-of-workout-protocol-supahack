import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useContract, useContractRead, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { ethers } from 'ethers';

import { abi, contractAddress } from '../../constants/QuestManager/questManager';
import Navbar from '../../components/Navbar';
import { computePowTokenRewards } from '../../utils';

const Start= () => {
    const router = useRouter(); 
    const { tokenId } = router.query; 

    const { contract } = useContract(contractAddress, abi);
    const { data: quests, isLoading: isQuestsLoading, error: questsError } = useContractRead(contract, "getQuests");
    const { mutateAsync: startQuest } = useContractWrite(contract, "startQuest");

    const [quest, setQuest] = useState([])
    const [inputValue, setInputValue] = useState({
        stakeAmount: 0.02, // in ether
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: event.target.value,
        }));    
    };

    const handleStartQuest = async () => {
        try {
          const stakeAmountInWei = ethers.utils.parseEther((inputValue.stakeAmount).toString());
          await startQuest(
            { 
                args: [tokenId], 
                overrides: {
                    value: stakeAmountInWei
                } 
            }
          );
          alert("Challenge started!  Go go go!")
          router.push(`/quest/${tokenId}`);
    
        } catch (error) {  
          alert(error) 
        }
      }
    
    useEffect(() => {
        if (questsError) {
        console.error("Failed to read contract", questsError);
        }

        if (!isQuestsLoading && quests) {
            for (let i = 0 ; i < quests.length ; i++) {
                if (Number(quests[i].tokenId) === Number(tokenId)) {
                    console.log(quests[i])    
                    setQuest(quests[i])
                }
            }
        }

    }, [quests, isQuestsLoading, questsError, tokenId]);

    return (
        <div className='flex flex-col min-h-screen bg-black'>
            <Navbar linkHref={`/quest/${tokenId}`} linkText={'Back to quest page'}/>

            <div className='mt-10 p-5'>
                <h1 className="text-white text-4xl font-bold">Start Quest</h1>

                <div className='text-white text-[20px] max-w-[1200px] mt-2'>
                    <ul className="list-disc list-inside">
                        <li>This quest requires you to do at least {Number(quest[4])/60} minutes of workout before {Number(quest[6])/60} minutes later</li>
                        <li>To begin, you must stake at least {Number(quest[3])/1000000000000000000} ETH. You may stake more than {Number(quest[3])/1000000000000000000} ETH</li>
                        <li>The more you stake, the more POW tokens you can potentially win!</li>
                        <li className='mt-5'>If you manage to complete the require duration of workout before time is up, you get some rewards for your hard work</li>
                        <li>Rewards : Your original staked ETH, at least {computePowTokenRewards(
                            Number(quest[3]), 
                            Number(quest[4]),
                            Number(quest[5]))} POW tokens, and an NFT badge representing this quest
                        </li>
                        <li className='mt-5'>However, if you lose, 50% of your staked 
                            ETH will be sent to the creator of the quest, and the other 
                            50% will be evenly distributed among those who completed this quest in the past 
                        </li>
                    </ul>
                </div>

                <form className='mt-16'>
                    <div className='mb-10'>
                        <label className='text-2xl text-white font-semibold'>
                            Stake amount :
                        </label>
                        <input
                            type="number"
                            onChange={handleInputChange}
                            className="border border-gray-400 bg-gray-800 text-white p-2 rounded-md w-[100px] outline-none ml-5 gradient-border"
                            name="stakeAmount"
                            value={inputValue.stakeAmount}
                        />
                        <label className='text-white ml-2'>ether</label>
                    </div>
                </form>

                <Web3Button
                        theme="dark"
                        contractAddress={contractAddress}
                        action={handleStartQuest}
                        className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'
                >
                    Start quest
                </Web3Button>
            </div>
        </div>
    )
}

export default Start