// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ProofOfWorkoutToken is ERC20, ERC20Burnable, Pausable, Ownable {
    using SafeMath for uint256;

    uint256 public constant MAX_SUPPLY = 42 * 10**6 * 10**18; // 42 million POW tokens.
    uint256 public constant PREMINT_SUPPLY = 18 * 10**6 * 10**18; // 18 million POW tokens preminted for the owner.
    uint256 public constant IN_GAME_SUPPLY = MAX_SUPPLY - PREMINT_SUPPLY; // 24 million POW tokens allocated to fitness quests completion, in game events
    uint256 public halvingSupply = IN_GAME_SUPPLY / 2; // The supply at which rewards are halved.
    uint256 public currentMaxRewardAmount = 5000 * 10**18; // The max supply of POW tokens that can be rewarded

    constructor() ERC20("ProofOfWorkout", "POW") {
        _mint(msg.sender, PREMINT_SUPPLY); 
    }
    
    function mintFromQuestCompletion(address to, uint256 amount) external {
        require(amount <= currentMaxRewardAmount, "Cannot mint more than current reward per transaction");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(to, amount);
        
        // Halve the reward if the total supply of the in game supply has passed the halving threshold
        if(totalSupply() - PREMINT_SUPPLY >= halvingSupply){
            currentMaxRewardAmount = currentMaxRewardAmount.div(2);
            halvingSupply = halvingSupply.div(2); 
        }
    }

    function burnFromFailure(address from) external {
        uint256 userBalance = balanceOf(from);
        // Burn 5% of tokens upon  quest failure
        uint256 burnAmount = (userBalance * 5).div(100);
        _burn(from, burnAmount);  
    }

    function getBalanceOfAddress(address walletAddress) public view returns (uint256) {
        return balanceOf(walletAddress);
    }

    function computePowTokenReward(
        uint256 _ethStaked, 
        uint256 _questDuration, 
        uint256 _difficulty
    ) public view returns (uint256) {
        uint256 powTokenReward = _ethStaked
            .div(100)
            .mul(_questDuration)
            .mul(_difficulty)
            .mul(100)
            .div(10**18);

        if (powTokenReward > currentMaxRewardAmount) {
            return currentMaxRewardAmount;
        } else {
            return powTokenReward * 10**18;
        }
    }  

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
