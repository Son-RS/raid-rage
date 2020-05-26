// Dependencies
const Discord = require("discord.js");
const Enmap = require("enmap");

// Initialise the bot (client)
const client = new Discord.Client();

// Grab "token" property from config.json
const { token } = require("./config.json");

// Create database in memory to store user IDs when joining servers
client.newUsers = new Enmap();

// Announce in console once ready
client.once("ready", () => {
  console.log("Ready!");
});

// Listen for new members joining servers
client.on("guildMemberAdd", member => {

  // Reference to the guild object
  const guild = member.guild;

  // Create an empty array for the guild in the database if there's no value already
  client.newUsers.ensure(guild.id, []);

  // Push the most recently joined member ID to the array
  client.newUsers.push(guild.id, member.id);

  // Logic to execute once the array contains 5 new members
  if (client.newUsers.get(guild.id).length > 4) {

    // Easy reference to the array of new member IDs
    const newUsers = client.newUsers.get(guild.id);

    // Shorten to the first 6 digits of member ID for comparison 107181918809751552 => 107181
    const toCheck = newUsers.map(u => u.substring(0, 6));

    // Create empty object to store number of occurences
    const counts = {};

    // Create an array for each unique shortened member ID and list which keys it occurs in
    toCheck.forEach((x, i) => counts[x] ? counts[x].push(i) : counts[x] = [i]);

    // Number of members in the list to use as criteria for banning e.g. 3 would be 3 out of 5 members have non-unique IDs 
    const criteria = 2;

    // Sort the entries to be in order of joining
    const sorted = Object.entries(counts).sort((a, b) => a[1] > b[1])

    // Filter results to obtain any arrays with more than one member (non-unique shortened member IDs)
      .filter(s => s[1].length > criteria);

    // If there are any filtered results
    if (sorted.length > 0) {

      // For each filtered result
      sorted.forEach(g => {

        // Ban all members in the list
        g[1].forEach(i => {
          guild.members.ban(newUsers[i], {reason: "User was banned for joining in a group of accounts created at the same time."});
        });
      
      });
    
    }
  }

});

client.login(token);