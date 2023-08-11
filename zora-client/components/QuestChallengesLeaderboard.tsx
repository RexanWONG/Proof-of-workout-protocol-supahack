import truncateEthAddress from 'truncate-eth-address';

import { computePowTokenRewards, convertSecondsIntoRelativeTime, convertUnixTimestampInSecondsToHumanReadable, getCurrentUnixTimestampInSeconds } from '../utils';

interface QuestChallengesLeaderboardProps {
  challengeId: number;
  completed: boolean;
  workoutDuration: number;
  stakedAmount: number;
  startTime: number;
  maxQuestDuration: number;
  challenger: string;
  difficulty: number;
}

const QuestChallengesLeaderboard: React.FC<QuestChallengesLeaderboardProps> = ({
  challengeId,
  completed,
  workoutDuration,
  stakedAmount,
  startTime,
  maxQuestDuration,
  challenger,
  difficulty
}) => {
    const renderCompleted = () => {
        if (completed === true) {
          return <span className='text-emerald-500'>Yes!</span>
        } else if (getCurrentUnixTimestampInSeconds() <= startTime + maxQuestDuration) {
          return <span className='text-yellow-500'>In progress</span>
        } else {
          return <span className='text-red-500'>No</span>
        }
    }


    const renderWorkoutDuration = () => {
      if (workoutDuration !== 0) {
        return <span>{workoutDuration/60} mins</span>
      } else {
        return <span>N/A</span>
      }
    }

    const renderRemainingTime = () => {
      if (completed === true) {
        return <span className='text-emerald-500'>Already completed</span>
      } else if (getCurrentUnixTimestampInSeconds() <= startTime + maxQuestDuration) {
        return <span className='text-yellow-500'>{convertSecondsIntoRelativeTime((startTime + maxQuestDuration) - getCurrentUnixTimestampInSeconds())}</span>
      } else {
        return <span className='text-red-500'>Already failed</span>
      }
    }

  return (
      <tr className="bg-gray-800 border-gray-800 hover:bg-gray-800/10">
          <th scope="row" className="px-6 py-6 font-bold text-white text-[20px]">
            {challengeId}
          </th>
          <td className="px-6 py-4 text-[18px]">{renderCompleted()}</td>
          <td className="px-6 py-4 text-[18px]">{renderWorkoutDuration()}</td>
          <td className="px-6 py-4 text-[18px]">{stakedAmount/1000000000000000000} ETH</td>
          <td className="px-6 py-4 text-[18px]">{convertUnixTimestampInSecondsToHumanReadable(startTime)}</td>
          <td className="px-6 py-4 text-[18px] max-w-[150px]">{renderRemainingTime()}</td>
          <td className="px-6 py-4 text-[14px]">{truncateEthAddress(challenger)}</td>
          <td className="px-6 py-4 text-[14px]">{Math.floor(computePowTokenRewards(stakedAmount, workoutDuration, difficulty))} POW</td>
          
         
      </tr>
  ); 
};

export default QuestChallengesLeaderboard;
