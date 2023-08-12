import Navbar from '../components/Navbar'
import { contractAddress } from '../constants/QuestManager/questManager';

import { useOwnedNFTs, useContract, useAddress } from "@thirdweb-dev/react";
import NFTRenderer from '../components/NFTRenderer';
import Loading from '../components/Loading';

const Badges = () => {
    const address = useAddress();

    const { contract } = useContract(contractAddress);
    const { data: ownedItems, isLoading: ownedItemsLoading, error: ownedItemsError} = useOwnedNFTs(contract, address);

    if (!address) return <div>No wallet connected</div>
    if (ownedItemsLoading) return <div className='flex items-center justify-center h-64 rounded-lg'><Loading /></div>;
    if (!ownedItems || ownedItemsError) return <div className='flex items-center justify-center h-64 rounded-lg'>NFT not found</div>;
    

    return (
        <div className='flex flex-col min-h-screen bg-black'>
            <Navbar linkHref={'/dashboard'} linkText={'Return to dashboard'}/>

            <div className="mt-10 p-5">
                <h1 className="text-white text-4xl font-bold">Your badges</h1>
                <p className='text-gray-400 mt-2'>Badges represent the quests that you have completed in the past</p>

                <div className='mt-16'>
                    <NFTRenderer ownedItems={ownedItems as any} />
                </div>
            </div>
        </div>
    )
}

export default Badges