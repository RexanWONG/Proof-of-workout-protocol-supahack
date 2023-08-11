// SPDX-License-Identifier: MIT
// Optimism Goerli : 0x1e753753141c342C865EAcf9e66d62fB603d8154
pragma solidity 0.8.17;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Counters.sol";
import "../lib/openzeppelin-contracts/contracts/utils/math/SafeMath.sol";

import { IEAS, AttestationRequest, AttestationRequestData } from "../lib/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "../lib/eas-contracts/contracts/Common.sol";

import "./OptimismProofOfWorkoutToken.sol";

contract OptimismQuestManager is ERC721, ERC721Enumerable, ERC721URIStorage, IERC721Receiver, Ownable {
    OptimismProofOfWorkoutToken _powToken;
    error InvalidEAS();
    
    using SafeMath for uint256; 
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    IEAS private immutable _eas;

    constructor(IEAS eas) ERC721("Proof of Workout Protocol Optimism", "POWP") {
        _powToken = OptimismProofOfWorkoutToken(0x1Bb3a8DcAEFECd61c9E51E29c3aA38F705f04EDC);

        if (address(eas) == address(0)) {
            revert InvalidEAS();
        }

        _eas = eas;
    } 

    uint256 public numOfQuestChallenges;

    uint256 public minPowTokensEasyDifficulty = 0;
    uint256 public minPowTokensMediumDifficulty = 1000;
    uint256 public minPowTokensHardDifficulty = 2000;

    struct Quest {
        uint256 tokenId;
        string name;
        address creator;
        uint256 minStakeAmount;
        uint256 minWorkoutDuration;
        uint256 questDifficulty;
        uint256 maxQuestDuration;
        address[] completedUsers;
    }

    struct QuestChallenges {
        uint256 challengeId;
        uint256 questTokenId;
        address submitter;
        uint256 workoutDuration;
        uint256 stakeAmount;
        uint256 startTime;
        bool completed;
        bytes32 attestationUid;
    }

    mapping(uint256 => Quest) public quests;
    mapping(uint256 => QuestChallenges) public questChallenges;

    function createQuest (
        string memory _name,
        uint256 _minWorkoutDuration, 
        uint256 _minStakeAmount,
        uint256 _questDifficulty,
        uint256 _maxQuestDuration
    ) public {   
        require(_questDifficulty == 1 || _questDifficulty == 2 || _questDifficulty == 3);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        Quest storage newQuest = quests[tokenId];

        newQuest.tokenId = tokenId;
        newQuest.name = _name;
        newQuest.creator = msg.sender;
        newQuest.minStakeAmount = _minStakeAmount;
        newQuest.minWorkoutDuration = _minWorkoutDuration;
        newQuest.questDifficulty = _questDifficulty;
        newQuest.maxQuestDuration = _maxQuestDuration;
    } 

    function startQuest(
        uint256 _questTokenId
    ) payable public {
        Quest storage quest = quests[_questTokenId];
        require(msg.value >= quest.minStakeAmount, "You must stake enough ether to begin this quest");

        uint256 userPowTokenBalance = _powToken.getBalanceOfAddress(msg.sender);
        if (quest.questDifficulty == 2) {
            require(userPowTokenBalance >= minPowTokensMediumDifficulty);
        } else if (quest.questDifficulty == 3) {
            require(userPowTokenBalance >= minPowTokensHardDifficulty);
        }

        QuestChallenges storage newQuestChallenge = questChallenges[numOfQuestChallenges];

        newQuestChallenge.challengeId = numOfQuestChallenges;
        newQuestChallenge.questTokenId = _questTokenId;
        newQuestChallenge.submitter = msg.sender;
        newQuestChallenge.stakeAmount = msg.value;
        newQuestChallenge.startTime = block.timestamp;
        newQuestChallenge.completed = false;

        numOfQuestChallenges++;
    }

    function submitQuest(
        uint256 _challengeId, 
        uint256 _activityDuration, 
        string memory _metadataURI 
    ) payable public {
        QuestChallenges storage questChallenge = questChallenges[_challengeId];
        Quest storage quest = quests[questChallenge.questTokenId];

        require(questChallenge.submitter == msg.sender, "You must be this quest challenge's challenger");
        require(block.timestamp - questChallenge.startTime <= quest.maxQuestDuration, "Time has passed, sorry");
        require(questChallenge.completed == false, "This quest challenge has been completed, sorry");

        require(_activityDuration >= quest.minWorkoutDuration, "Activity duration not long enough");

        questChallenge.workoutDuration = _activityDuration;
        questChallenge.completed = true;
        quest.completedUsers.push(msg.sender);

        uint256 powTokenReward = _powToken.computePowTokenReward(
            questChallenge.stakeAmount, 
            questChallenge.workoutDuration,  
            quest.questDifficulty  
        );

        _safeMint(msg.sender, questChallenge.challengeId);
        _setTokenURI(questChallenge.challengeId, _metadataURI);

        payable(msg.sender).transfer(questChallenge.stakeAmount);
        _powToken.mintFromQuestCompletion(msg.sender, powTokenReward);
        bytes32 attestationUid = _attestChallengeCompleted(questChallenge.challengeId);
        questChallenge.attestationUid = attestationUid;
    }

    function failQuest(uint256 _challengeId) payable public {
        QuestChallenges storage questChallenge = questChallenges[_challengeId];
        Quest storage quest = quests[questChallenge.questTokenId];

        require(questChallenge.completed == false, "Quest has been completed");
        require(block.timestamp - questChallenge.startTime >= quest.maxQuestDuration, "Quest challenge not yet over");
        require(quest.creator == msg.sender, "Only the creator of the quest can call this function");

        payable(msg.sender).transfer(questChallenge.stakeAmount/2);

        uint256 distributionAmountToEachCompletedUser = (questChallenge.stakeAmount/2).div(quest.completedUsers.length);

        for (uint256 i = 0 ; i < quest.completedUsers.length ; ++i) {
            payable(quest.completedUsers[i]).transfer(distributionAmountToEachCompletedUser);
        }

        _powToken.burnFromFailure(questChallenge.submitter);
    }

    function _attestChallengeCompleted(uint256 challengeId) private returns (bytes32) {
        return
            _eas.attest(
                AttestationRequest({
                    schema: bytes32(0x5ea93ec8eac7206ebc8ed6c8fcc1f33875a75418f808893a91d54b31248431cd),
                    data: AttestationRequestData({
                        recipient: msg.sender, 
                        expirationTime: NO_EXPIRATION_TIME, // No expiration time
                        revocable: true,
                        refUID: EMPTY_UID, // No references UI
                        data: abi.encode(challengeId), // Encode a single uint256 as a parameter to the schema
                        value: 0 // No value/ETH
                    })
                })
            );
    }

    function getQuests() public view returns (Quest[] memory) {
        Quest[] memory allQuests = new Quest[](_tokenIdCounter.current());

        for (uint256 i = 0; i < _tokenIdCounter.current(); ++i) {
            Quest storage item = quests[i];
            allQuests[i] = item;
        }
        
        return allQuests;
    }

    function getQuestChallenges() public view returns (QuestChallenges[] memory) {
        QuestChallenges[] memory allQuestChallenges = new QuestChallenges[](numOfQuestChallenges);

        for (uint256 i = 0; i < numOfQuestChallenges ; ++i) {
            QuestChallenges storage item = questChallenges[i];
            allQuestChallenges[i] = item;
        }
        
        return allQuestChallenges;
    }

    function getAttestationUidFromQuestChallenge(uint256 _challengeId) public view returns (bytes32) {
        QuestChallenges storage questChallenge = questChallenges[_challengeId];

        return questChallenge.attestationUid;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
