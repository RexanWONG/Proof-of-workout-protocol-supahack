import { useContractRead, useContract } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";

import { abi, contractAddress } from '../constants/QuestManager/questManager';
import Navbar from '../components/Navbar';
import QuestLeaderboard from "../components/QuestLeaderboard";

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const Dashboard = () => {  
  const { contract } = useContract(contractAddress, abi);

  const { data, isLoading, error } = useContractRead(contract, "getQuests");
  const [listOfQuests, setListOfQuests] = useState([])

  useEffect(() => {
    if (error) {
      console.error("Failed to read contract", error);
    }

    if (!isLoading && data) {
      console.log(data)
      setListOfQuests(data);
    }
  }, [data, isLoading, error]);

    return (
      <div className={inter.className}>
        <div className='flex flex-col min-h-screen bg-black'>
          <Navbar linkHref={'/create'} linkText={'Create quest'}/>

          <div className="mt-10 p-5">
            <h1 className="text-white text-4xl font-bold p-5">Quests Board</h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">

              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-gray-400 bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Quest name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Min workout duration
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Min stake amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Max quest duration
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Min POW rewards
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Quest difficulty
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Creator
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listOfQuests.map((quest, index) => 
                    <QuestLeaderboard 
                      key={index} 
                      tokenId={Number(quest[0])}
                      name={quest[1]}
                      creator={quest[2]}
                      minWorkoutDuration={Number(quest[4])}
                      minStakeAmount={Number(quest[3])}
                      maxQuestDuration={Number(quest[6])}
                      questDifficulty={Number(quest[5])}
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    
  )
}

export default Dashboard


