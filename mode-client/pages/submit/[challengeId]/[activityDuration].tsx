import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useAddress, useContractRead, useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { abi, contractAddress } from '../../../constants/QuestManager/questManager';

import Navbar from '../../../components/Navbar';
import QuestImage from '../../../components/QuestImage';
import truncateEthAddress from 'truncate-eth-address';

const FinalSubmitPage = () => {
  const router = useRouter(); 
  const { challengeId } = router.query; 
  const { activityDuration } = router.query; 

  const address = useAddress()
  const { contract } = useContract(contractAddress, abi);
  const { data: quests, isLoading: isQuestsLoading, error: questsError } = useContractRead(contract, "getQuests");
  const { data: questChallenges, isLoading: isQuestChallengesLoading, error: questChallengesError } = useContractRead(contract, "getQuestChallenges");

  const { mutateAsync: submitQuest } = useContractWrite(contract, "submitQuest");

  const handleSubmitQuest = async (
    challengeId: number, 
    activityDuration: number,
    metadata: string
  ) => {
    try {
      await submitQuest({ args: [
        challengeId,
        activityDuration,
        metadata
      ] });
      alert("Quest Submitted!!") 
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  const [quest, setQuest] = useState([])
  const [challenge, setChallenge] = useState([])

  const [uploadedOntoIpfs, setUploadedOntoIpfs] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [metadataURI, setMetadataURI] = useState("");
  const [contentIpfsHash, setContentIpfsHash] = useState("");

  const authorization =
    "Basic " + btoa(process.env.NEXT_PROJECT_ID + ":" + process.env.NEXT_PROJECT_SECRET_KEY).toString();

  const ipfs = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: authorization,
    },
  });

  useEffect(() => {
    if (questsError || questChallengesError) {
        console.error("Failed to read contract", questsError);
    }

    let challengeList = []
    let challengeQuestId = 0

    if (!isQuestChallengesLoading && questChallenges) {
        
        for (let i = 0 ; i < questChallenges.length ; i++) {
            if (Number(questChallenges[i].challengeId) === Number(challengeId)) {    
                challengeList.push(questChallenges[i])
                challengeQuestId = questChallenges[i].questTokenId
            }
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
    
}, [quests, isQuestsLoading, questsError, questChallenges, isQuestChallengesLoading, questChallengesError, address, challengeId]);

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setIsImageUploaded(true);
        try {
            const ipfsData = await uploadImageOntoIpfs(event.target.files[0]);
            setContentIpfsHash(ipfsData.path);
            setUploadedOntoIpfs(true);
        } catch (error) {
            console.log(error);
        }
    }
  };


  const uploadImageOntoIpfs = async (file: File) => {
    const result = await ipfs.add(file);

    console.log(result.path);

    return {
        cid: result.cid,
        path: result.path,
    };
  };


  const createMetadata = async () => {
    try {
      const metadata = {
        name: `Proof of workout protocol - ${quest[1]}`,
        image: "ipfs://" + contentIpfsHash,
      };

      const { path } = await ipfs.add(JSON.stringify(metadata));
      const metadataUri = "ipfs://" + path;

      setMetadataURI(metadataUri);
    } catch (error) {
      alert("Error with creating metadata");
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-black'>
      <Navbar linkHref={`/submit/${challengeId}`} linkText={'Back to submit page'} />

      <div className='mt-10 p-5'>
        <h1 className='text-white text-4xl font-bold'>Use this activity for submission!  Duration: {Number(activityDuration)/60} mins</h1>

        
        <div className='mt-10'>
              <div className='flex flex-row items-center justify-center gap-10 mt-10'>
                {quest.length > 0 &&
                    <div>
                      <QuestImage 
                        tokenId={quest[0]}
                        name={quest[1]}
                        creator={truncateEthAddress(quest[2])}
                        minStakeAmount={quest[3]/1000000000000000000}
                        maxQuestDuration={quest[6]/60}
                        minWorkoutDuration={quest[4]/60}
                        difficulty={quest[5]}
                      />
                    </div>
                }

                  <div className='flex flex-col items-start justify-start gap-2 text-white'>
                      <h1>
                          You can mint an NFT badge to attest that you have completed a challenge for this quest!
                      </h1>
                      <p>You also get to decide the image for the badge!  
                        If you want the badge to be like the sexy looking badge on the left, 
                        then take a screenshot of it, and drag that screenshot into the image dropbox below!
                      </p>

                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        name="file"
                        required
                        className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-10"
                      />

                      {isImageUploaded && uploadedOntoIpfs ? (
                        <div>
                          <h1 className="text-green-600 mb-2 text-center whitespace-normal flex-wrap">
                            Uploaded onto ipfs! - {contentIpfsHash}
                          </h1>
                          <button onClick={createMetadata} className="bg-white text-black hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:animate-text font-bold rounded-lg px-4 py-2 mt-2">
                            Create metadata URI
                          </button> 

                          <h1 className='text-white mt-2'>Metadata URI : {metadataURI}</h1>

                          {metadataURI &&
                            <Web3Button 
                              theme="dark"
                              contractAddress={contractAddress}
                              action={() => handleSubmitQuest(
                                Number(challengeId),
                                Number(activityDuration),
                                metadataURI
                              )}
                            >
                              Submit Quest!
                            </Web3Button>
                          }
                        </div>
                      ) : isImageUploaded ? (
                        <h1 className="text-center">Uploading onto ipfs...</h1>
                      ) : (
                        <h1 />
                      )}
                  </div>
                </div>
            </div> 
      </div>
    </div>
  )
}

export default FinalSubmitPage