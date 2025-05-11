// friendsDB.js

const friendsDB = {
    // Sample structure:
    // "WalletAddress1": ["FriendWallet1", "FriendWallet2"],
    // "WalletAddress2": ["FriendWallet1", "FriendWallet3"]
  };
  
  /**
   * Add a friend to the user's friends list.
   * @param {string} walletAddress - The wallet address of the profile.
   * @param {string} friendWallet - The wallet address of the friend to add.
   */
  export const addFriend = (walletAddress, friendWallet) => {
    if (!friendsDB[walletAddress]) {
      friendsDB[walletAddress] = [];
    }
    
    // Prevent duplicates
    if (!friendsDB[walletAddress].includes(friendWallet)) {
      friendsDB[walletAddress].push(friendWallet);
      console.log(`Added friend ${friendWallet} to ${walletAddress}'s friends list.`);
    } else {
      console.log(`${friendWallet} is already a friend of ${walletAddress}.`);
    }
  };
  
  /**
   * Get the list of friends for a given wallet address.
   * @param {string} walletAddress - The wallet address to retrieve friends for.
   * @returns {string[]} - The list of friends.
   */
  export const getFriends = (walletAddress) => {
    return friendsDB[walletAddress] || [];
  };
  
  /**
   * Display all friends for each profile.
   */
  export const displayAllProfiles = () => {
    console.log("All Profiles and Friends:");
    for (const [walletAddress, friends] of Object.entries(friendsDB)) {
      console.log(`Profile: ${walletAddress}`);
      friends.forEach(friend => console.log(`  Friend: ${friend}`));
    }
  };
  