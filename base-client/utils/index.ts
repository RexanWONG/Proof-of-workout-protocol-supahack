export const formatBalance = (rawBalance: string) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2)
    return balance
}

export const convertSecondsToMinutes = (seconds: number) => {
    return seconds / 60;
}

export const computePowTokenRewards = (
    eth_staked: number,
    duration: number,
    difficulty: number
) => {
    const powTokenReward = ((eth_staked/100) * duration * (difficulty * 100))/(1000000000000000000)

    if (powTokenReward > 5000) {
        return 5000
    } else {
        return powTokenReward;
    }   
}

export const getCurrentUnixTimestampInSeconds = () => {
    return Math.floor(Date.now() / 1000); 
}

export const convertUnixTimestampInSecondsToHumanReadable = (timestamp: number) => {
    const date = new Date(timestamp * 1000); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const convertSecondsIntoRelativeTime = (seconds: number) => {
    if (seconds < 0) {
      return "Time cannot be in the past!";
    }
  
    const timeUnits = [
      { unit: "day", duration: 86400 },
      { unit: "hour", duration: 3600 },
      { unit: "minute", duration: 60 },
      { unit: "second", duration: 1 },
    ];
  
    let result = "";
    let remainingSeconds = seconds;
  
    for (const { unit, duration } of timeUnits) {
      if (remainingSeconds >= duration) {
        const unitCount = Math.floor(remainingSeconds / duration);
        remainingSeconds %= duration;
        result += `${unitCount} ${unit}${unitCount > 1 ? "s" : ""}, `;
      }
    }
  
    // Remove trailing comma and space
    result = result.slice(0, -2);
  
    return result + " later.";
}

export const convertHumanReadableToBlockTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
}
  
  
  
  