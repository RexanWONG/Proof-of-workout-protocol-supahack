import React from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const LandingDescription = () => {
  return (
    <div className={inter.className}>
        <h1 className='text-8xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-text mb-4'>
            Proof of Workout Protocol <span className='text-white'>💪</span>
        </h1>
        <p className='text-[34px] text-white mb-6'>
            Incentivizing anons to touch grass 🍀
        </p>
        <p className='text-[20px] text-gray-400 mb-12'>
            POWP is designed to motivate and reward physical fitness through a gamified system of quests and token-based incentives. 
            By staking Ether and earning POW tokens, users are incentivized to complete fitness challenges, share their achievements, 
            and challenge others in a fitness-oriented social network.
        </p>
    </div>
  )
}

export default LandingDescription