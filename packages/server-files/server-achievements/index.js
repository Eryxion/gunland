const { CommandRegistry } = require("../server-global/improved-commands");  
global.achievementsData = [
    'Obtine licenta de condus',
    'Munceste la unul din joburile de pe server',
    'Achizitioneaza o masina din Showroom',
    'Devino membrul unei factiuni',
    'Achizitioneaza o casa',
    'Achizitioneaza un telefon din 24/7',
    'Devino un jucator premium'
];

global.updatePlayerAchievement = async function(player, index)
{  
    if(!index || player.info.achievements[index])
        return;
 
    player.info.achievements[index] = true;
 
    await Account.update({ achievements: JSON.stringify(player.info.achievements) }, { where: { id: player.info.id } }); 
   
    playerGiveExperience(player, getRandomArbitrary(300, 875).toFixed(0)); 
    player.giveMoney(0, getRandomArbitrary(1000, 3240).toFixed(0));  
  
    return sendNotiffication(player, 'success', `${achievementsData[index]}`, 'Achievement unlocked.');
}

CommandRegistry.add({
    name: "updateach", 
       
    run: function (player, _, achievement) {   
        return updatePlayerAchievement(player, achievement);
    }
});