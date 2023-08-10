import CreateQuestForm from '../components/CreateQuestForm';
import Navbar from '../components/Navbar';

import { useContractWrite, useContract } from "@thirdweb-dev/react";
import { abi, contractAddress } from '../constants/QuestManager/questManager'
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

const Create = () => {
  const router = useRouter(); 
  const { contract } = useContract(contractAddress, abi);

  const { mutateAsync: createQuest } = useContractWrite(contract, "createQuest");

  const handleCreateQuest = async (
    name: string,
    minWorkoutDuration: number,
    minStakeAmount: ethers.BigNumber,
    questDifficulty: number,
    maxQuestDuration: number
  ) => {
    try {
      const data = await createQuest({ args: [
        name, 
        minWorkoutDuration, 
        minStakeAmount, 
        questDifficulty, 
        maxQuestDuration
      ] });
      alert("Quest Created!") 
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='min-h-screen bg-black'>
        <Navbar linkHref={'/dashboard'} linkText={'Back to home'}/> 
        <div className='flex flex-col items-start justify-start p-10'>
          <h1 className='text-4xl text-white font-bold'>Create Quest</h1>

          <CreateQuestForm 
            contractAddress={contractAddress}
            web3ButtonText={'Create quest!'}
            web3ButtonFunction={handleCreateQuest}
          />
        </div>
    </div>
  )
}

export default Create