import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAddress, useContractRead, useContract } from "@thirdweb-dev/react";
import { abi, contractAddress } from '../../constants/QuestManager/questManager';

import Navbar from '../../components/Navbar';
import QuestImage from '../../components/QuestImage';
import truncateEthAddress from 'truncate-eth-address';
import Link from 'next/link';
import QuestChallengesLeaderboard from '../../components/QuestChallengesLeaderboard';
import { getCurrentUnixTimestampInSeconds } from '../../utils';

const Quest = () => {
    const router = useRouter(); 
    const { tokenId } = router.query; 

    const address = useAddress();

    const { contract } = useContract(contractAddress, abi);

    const { data: quests, isLoading: isQuestsLoading, error: questsError } = useContractRead(contract, "getQuests");
    const { data: questChallenges, isLoading: isQuestChallengesLoading, error: questChallengesError } = useContractRead(contract, "getQuestChallenges");

    const [quest, setQuest] = useState([])
    const [challenges, setChallenges] = useState([])
    const [isOngoingChallenge, setIsOngoingChallenge] = useState(false)
    const [challengeId, setChallengeId] = useState(null)

    useEffect(() => {
        if (questsError || questChallengesError) {
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

        if (!isQuestChallengesLoading && questChallenges) {
            let challengeList = []
            for (let i = 0 ; i < questChallenges.length ; i++) {
                if (Number(questChallenges[i].questTokenId) === Number(tokenId)) {    
                    challengeList.push(questChallenges[i])

                    if (questChallenges[i].submitter === address && questChallenges[i].completed == false && getCurrentUnixTimestampInSeconds() - questChallenges[i].startTime <= quest[6]) {
                        setIsOngoingChallenge(true)
                        setChallengeId(questChallenges[i].challengeId)
                    }
                }


            }

            setChallenges(challengeList as [])
        }


    }, [quests, isQuestsLoading, questsError, questChallenges, isQuestChallengesLoading, questChallengesError, address, quest, tokenId]);

    return (
        <div className='flex flex-col min-h-screen bg-black'>
          <Navbar linkHref={'/dashboard'} linkText={'Back to dashboard'}/>
      
          {quest.length > 0 && (
            <div className='flex flex-row items-center justify-center gap-40'>
                <div>
                    <div className='mt-16'>
                        <QuestImage 
                            tokenId={quest[0]}
                            name={quest[1]}
                            creator={truncateEthAddress(quest[2])}
                            minStakeAmount={quest[3]/1000000000000000000}
                            maxQuestDuration={quest[6]/60}
                            minWorkoutDuration={quest[4]/60}
                            difficulty={quest[5]}
                        />

                        <h1 className='text-white text-2xl mt-5'><span className='font-bold'>{quest[1]}</span> by {truncateEthAddress(quest[2])}</h1>
                        <p className='text-gray-400'>If you complete this quest, you can mint this badge as an NFT!</p>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center'>
                    {isOngoingChallenge ? (
                        <h1 className='text-white mb-5'>You currently have an ongoing challenge</h1>
                    ) : (
                        <>
                        </>
                    )}
                    <div className='flex flex-row items-center justify-center gap-32'>
                        <div className="text-gray-500 text-[20px] flex flex-row items-center justify-center gap-3">
                            <p>Quest #{Number(quest[0])}</p> 
                        </div>

                        {isOngoingChallenge ? (
                            <Link href={`/submit/${challengeId}`}>
                                <button className="bg-white text-black hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:animate-text font-bold rounded-lg px-4 py-2">
                                    Submit your challenge!
                                </button>
                            </Link>
                        ) : (
                            <Link href={`/start/${tokenId}`}>
                                <button className="bg-white text-black hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:animate-text font-bold rounded-lg px-4 py-2">
                                    Start quest!
                                </button>
                            </Link>
                        )}
                    </div>

                    <h1 className='text-white text-2xl mt-10'>Completed users ({[quest[7]].length}) : </h1>
                    <div className="h-64 overflow-y-auto">
                        <ul>
                            {[quest[7]].map((address, index) => (
                            <li key={index} className="text-white py-2">
                                {address}
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
          )}

          <div className="mt-10 p-5">
          <h1 className="text-white text-4xl font-bold p-5">Past Challenges to this quest</h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-gray-400 bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Challenge ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Completed?
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Workout duration
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Staked amount
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Start time
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Remaining time
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Challenger
                            </th>
                            <th scope="col" className="px-6 py-3">
                                POW transfered
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {challenges.map((challenge, index) => 
                            <QuestChallengesLeaderboard 
                                key={index}
                                challengeId={Number(challenge[0])}
                                completed={challenge[6]}
                                workoutDuration={Number(challenge[3])}
                                stakedAmount={Number(challenge[4])}
                                startTime={Number(challenge[5])}
                                maxQuestDuration={Number(quest[6])}
                                challenger={challenge[2]}
                                difficulty={Number(quest[5])}
                            />
                        )}
                    </tbody>
                </table>
             </div>
          </div>
        </div>
    )
      
}

export default Quest