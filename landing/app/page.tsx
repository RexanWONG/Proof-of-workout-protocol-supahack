import LandingDescription from '@/components/LandingDescription'

export default function Home() {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen bg-black text-white'>
        <div className='text-center max-w-[1000px]'>
            <LandingDescription />

            <div className='flex flex-row items-center justify-center gap-16'>
                <a href={'https://proof-of-workout-protocol-supahack-optimism-goerli.vercel.app'} target='_blank' rel='noopener noreferrer'>
                  <button className='bg-white hover:bg-red-500 px-5 py-3 rounded-lg'>
                      <h1 className='text-black font-bold'>
                        Launch on Optimism Goerli
                      </h1>
                  </button>
                </a>
                <a href={'https://proof-of-workout-protocol-supahack-base-goerli.vercel.app'} target='_blank' rel='noopener noreferrer'>
                  <button className='bg-white hover:bg-blue-500 px-5 py-3 rounded-lg'>
                      <h1 className='text-black font-bold'>
                        Launch on Base Goerli
                      </h1>
                  </button>
                </a>

                <a href={'/dashboard'} target='_blank' rel='noopener noreferrer'>
                  <button className='bg-white hover:bg-purple-500 hover:animate-text px-5 py-3 rounded-lg'>
                      <h1 className='text-black font-bold'>
                        Launch on Zora
                      </h1>
                  </button>
                </a>

                <a href={'/dashboard'} target='_blank' rel='noopener noreferrer'>
                  <button className='bg-white hover:bg-yellow-500 hover:animate-text px-5 py-3 rounded-lg'>
                      <h1 className='text-black font-bold'>
                        Launch on Mode
                      </h1>
                  </button>
                </a>
            </div>

            <p className='text-white mt-16'>Note : Ethereum attestation services (eas) are only avaliable on Optimism and Base</p>
        </div>
    </div>
  )
}
