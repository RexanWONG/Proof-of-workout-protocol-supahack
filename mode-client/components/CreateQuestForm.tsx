import { useState } from 'react';
import { Web3Button } from "@thirdweb-dev/react";
import { ChangeEvent } from 'react';

import { convertSecondsToMinutes } from '../utils';
import { ethers } from 'ethers';

interface CreateQuestFormProps {
    contractAddress: string;
    web3ButtonText: string;
    web3ButtonFunction: (
        name: string,
        minWorkoutDuration: number,
        minStakeAmount: ethers.BigNumber,
        questDifficulty: number,
        maxQuestDuration: number
    ) => void;
}

const CreateQuestForm: React.FC<CreateQuestFormProps> = ({ contractAddress, web3ButtonText, web3ButtonFunction }) => {

    const [inputValue, setInputValue] = useState({
        name: "",
        minWorkoutDuration: 0,
        minStakeAmount: 0.02, // in ether
        questDifficulty: 1, // in seconds
        maxQuestDuration: 10, // in seconds
    });


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: event.target.value,
        }));    
    };

    const setMinStakeAmount = (amount: number) => {
        setInputValue((prevFormData) => ({
            ...prevFormData,
            minStakeAmount: amount,
        }));
    }

    const setDifficulty = (difficulty: number) => {
        setInputValue((prevFormData) => ({
            ...prevFormData,
            questDifficulty: difficulty,
        }));
    }

    const setMaxQuestDuration = (duration: number) => {
        setInputValue((prevFormData) => ({
            ...prevFormData,
            maxQuestDuration: duration,
        }));
    }

    const setMinWorkoutDuration = (duration: number) => {
        setInputValue((prevFormData) => ({
            ...prevFormData,
            minWorkoutDuration: duration,
        }));
    }

    return (
        <div className='flex flex-row items-center justify-center gap-20'>
            <div className='flex flex-col'>
                <div>
                    <form className='mt-16'>
                        <div className='mb-10'>
                            <label className='text-2xl text-white font-semibold'>
                                Quest name
                            </label>
                            <input
                                type="text"
                                onChange={handleInputChange}
                                className="border border-gray-400 bg-gray-800 text-white p-2 rounded-md w-full outline-none mt-2 gradient-border"
                                placeholder="workout for 30 mins!"
                                name="name"
                                value={inputValue.name}
                            />
                        </div>

                        <div className='mb-10'>
                            <label className='text-2xl text-white font-semibold'>
                                Quest min stake amount 
                            </label>
                            <div className='flex flex-row gap-5 mt-5'>
                                <button type="button" onClick={() => setMinStakeAmount(0.02)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        0.02 ETH
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setMinStakeAmount(0.4)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        0.4 ETH
                                    </h1>
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col mb-10'>
                            <label className='text-2xl text-white font-semibold'>
                                Quest difficulty
                            </label>
                            <div className='flex flex-row gap-5 mt-5'>
                                <button type="button" onClick={() => setDifficulty(1)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        1 - EASY
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setDifficulty(2)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        2 - MEDIUM
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setDifficulty(3)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        3 - HARD
                                    </h1>
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col mb-10'>
                            <label className='text-2xl text-white font-semibold'>
                                Maximum quest duration 
                            </label>
                            <div className='flex flex-row gap-5 mt-5'>
                                <button type="button" onClick={() => setMaxQuestDuration(10)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        10 SECS
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setMaxQuestDuration(36000)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        10 HOURS 
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setMaxQuestDuration(172800)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        2 DAYS 
                                    </h1>
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col mb-10'>
                            <label className='text-2xl text-white font-semibold'>
                                Minimum workout duration 
                            </label>
                            <div className='flex flex-row gap-5 mt-5'>
                                <button type="button" onClick={() => setMinWorkoutDuration(10)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        10 SECS
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setMinWorkoutDuration(2400)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        40 MINS 
                                    </h1>
                                </button>
                                <button type="button" onClick={() => setMinWorkoutDuration(4140)} className='bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                                    <h1 className='text-black font-bold'>
                                        69 MINS 
                                    </h1>
                                </button>
                            </div>
                        </div>
                    </form>
                </div> 
            </div>
            <div className='items-start justify-start p-10'>
                <div>
                    <h1 className='text-4xl text-white font-bold mb-5'>Summary</h1>
                    <div className='text-2xl text-white font-thin'>
                        <p>
                            <span className='text-white font-bold'>
                                Quest name : {""}
                            </span>
                            {inputValue.name}
                        </p>

                        <p className='mt-2'>
                            <span className='text-white font-bold'>
                                Quest min stake amount : {""}
                            </span>
                            {inputValue.minStakeAmount} ETH
                        </p>

                        <p className='mt-2'>
                            <span className='text-white font-bold'>
                                Quest Difficulty : {""}
                            </span>
                            {inputValue.questDifficulty}
                        </p>

                        <p className='mt-2'>
                            <span className='text-white font-bold'>
                                Max quest duration : {""}
                            </span>
                            {convertSecondsToMinutes(inputValue.maxQuestDuration)} mins
                        </p>

                        <p className='mt-2'>
                            <span className='text-white font-bold'>
                                Min workout duration : {""}
                            </span>
                            {convertSecondsToMinutes(inputValue.minWorkoutDuration)} mins
                        </p>
                    </div>

                </div>

                <div className='mt-10'>
                    <Web3Button
                        theme="dark"
                        contractAddress={contractAddress}
                        action={() => web3ButtonFunction(
                            inputValue.name,
                            inputValue.minWorkoutDuration,
                            ethers.utils.parseEther(String(inputValue.minStakeAmount)),
                            inputValue.questDifficulty,
                            inputValue.maxQuestDuration
                        )}
                    >
                        {web3ButtonText}
                    </Web3Button>
                </div>
            </div>
        </div>
    )
}

export default CreateQuestForm;
