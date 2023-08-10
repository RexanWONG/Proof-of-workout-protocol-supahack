import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAddress, useContractRead, useContract } from "@thirdweb-dev/react";
import { abi, contractAddress } from '../../constants/QuestManager/questManager';

import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';
 
interface Activity {
    id: number
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    sport_type: string;
    type: string;
    start_date: string;
}

interface ActivitiesResponse {
    activities: Activity[];
}
 
const Submit = () => {
    const router = useRouter(); 
    const { challengeId } = router.query; 

    const STRAVA_CLIENT_ID = process.env.NEXT_STRAVA_CLIENT_ID  
    const STRAVA_OAUTH_LINK = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=https://proof-of-workout-protocol-supahack-optimism-goerli.vercel.app/submit/${challengeId}&approval_prompt=force&scope=activity:read`
    
    const [isLoading, setIsLoading] = useState(false)
    const [activitiesList, setActivitiesList] = useState<ActivitiesResponse | null>(null);

    const hasFetched = useRef(false);

    const address = useAddress()
    const { contract } = useContract(contractAddress, abi);
    const { data: quests, isLoading: isQuestsLoading, error: questsError } = useContractRead(contract, "getQuests");
    const { data: questChallenges, isLoading: isQuestChallengesLoading, error: questChallengesError } = useContractRead(contract, "getQuestChallenges");

    const [quest, setQuest] = useState([])
    const [challenge, setChallenge] = useState([])

    useEffect(() => {
        if (questsError || questChallengesError) {
            console.error("Failed to read contract", questsError);
        }

        let challengeList = []
        let challengeQuestId = 0
        let challengeStartTime = 0

        if (!isQuestChallengesLoading && questChallenges) {
            
            for (let i = 0 ; i < questChallenges.length ; i++) {
                if (Number(questChallenges[i].challengeId) === Number(challengeId)) {    
                    challengeList.push(questChallenges[i])
                    challengeQuestId = questChallenges[i].questTokenId
                    challengeStartTime = questChallenges[i].startTime
                }
            }

            const params = new URLSearchParams(window.location.search);
            if (!hasFetched.current && params.has('code')) {
                console.log(Number(challengeStartTime))
                getActivityDetails(String(params.get('code')), Number(challengeStartTime))
                hasFetched.current = true;
            }

            setChallenge(challengeList as [])

            if (!isQuestsLoading && quests) {
                for (let i = 0 ; i < quests.length ; i++) {
                    if (Number(quests[i].tokenId) === Number(challengeQuestId)) {
                        setQuest(quests[i])
                    }
                }
            }
        }

        
    }, [quests, isQuestsLoading, questsError, questChallenges, isQuestChallengesLoading, questChallengesError, address]);

    const getActivityDetails = async (code: string, afterTimestamp: number) => {
        try {
            setIsLoading(true);
            const query = await fetch(`/api/proxy?code=${code}&after=${afterTimestamp}`);
            const response = await query.json();
            console.log(response);
            setActivitiesList({ activities: response.activities });
            setIsLoading(false);
        } catch (error) {
            alert(error);
        }
    };

    const handleActivityClick = (activityDuration: number) => {
        router.push(`/submit/${challengeId}/${activityDuration}`);
    };

    return (
        <div className='flex flex-col min-h-screen bg-black'>
            <Navbar linkHref={`/quest/${quest[0]}`} linkText={'Back to quest page'} />

            <div className='mt-10 p-5'>
                <h1 className="text-white text-4xl font-bold">Submit your challenge to the quest</h1>
                <p className='text-white mt-5'>
                    To submit your challenge, please connect to your Strava account, and pick an activity that suits the requirements of this quest
                </p>

                <a href={STRAVA_OAUTH_LINK}>
                    <button className='bg-orange-500 hover:bg-white px-5 py-2 rounded-lg mt-10'>
                        Connect Strava
                    </button>
                </a>

                <div className='mt-16'>
                    {isLoading && <p className='text-white'><Loading /></p>}
                    {activitiesList && activitiesList.activities && !isLoading && activitiesList.activities.length > 0 ? (
                        <div className='flex flex-col items-center justify-center'>
                            {activitiesList.activities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className={Number(quest[4]) > activity.moving_time ? "bg-red-500 hover:animate-pulse text-white p-4 m-2 w-full rounded-lg shadow-md" : "bg-emerald-700 hover:animate-pulse text-white p-4 m-2 w-full rounded-lg shadow-md"}
                                        onClick={() => handleActivityClick(activity.moving_time)}
                                    >
                                        <h2 className="text-2xl font-bold">{activity.name} - {activity.start_date}</h2>
                                        <p className="text-lg">ID : {activity.id}</p>
                                        <p className="text-lg">{activity.type} - {activity.sport_type}</p>
                                        <p>Distance: {activity.distance} meters</p>
                                        <p>Moving Time: {activity.moving_time} seconds</p>
                                        <p>Elapsed Time: {activity.elapsed_time} seconds</p>
                                        <p>Total Elevation Gain: {activity.total_elevation_gain} meters</p>
                                    </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-white'>No activities that happened after the start time of the challenge available</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Submit