const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");
const { Op, QueryTypes } = require("sequelize");

global.dailyQuests = [ 
    {
        name: 'Prinde 5 pesti la jobul Fisherman',
        progress: 5,
        
        index: 'fisherman'
    },

    {
        name: 'Livreaza 5 colete la jobul Courier',
        progress: 5,

        index: 'courier'
    },

    {
        name: 'Mananca 3 hamburgeri de la un 24/7',
        progress: 3,

        index: 'hamburger',
    },

    {
        name: 'Munceste 3 ture la jobul Trucker',
        progress: 3,

        index: 'trucker',
    },
    
    {
        name: 'Mananca 3 pizza de la un 24/7',
        progress: 3,

        index: 'pizza',
    } 
];
 
global.updateQuestProgress = async function(player, quest) {  
    if(dailyQuests[player.info.quests[0]].index != quest && dailyQuests[player.info.quests[1]].index != quest)
        return;
  
    const indexDaily = dailyQuests[player.info.quests[0]].index === quest ? 0 : 1;
  
    if(player.info.questsProgress[indexDaily] >= dailyQuests[player.info.quests[indexDaily]].progress)
        return;
 
    player.info.questsProgress[indexDaily] ++;
  
    await Account.update({ questsProgress: JSON.stringify(player.info.questsProgress) }, { where: { id: player.info.id } }); 

    let object = { status: true, timeout: null, name: dailyQuests[player.info.quests[indexDaily]].name, progress: player.info.questsProgress[indexDaily], maxProgress: dailyQuests[player.info.quests[indexDaily]].progress }
    rpc.callBrowsers(mp.players.at(player.id), 'showQuestProgress', [JSON.stringify(object)]);

    return sendMessage(player, COLOR_ADMIN, `(Daily quest):!{#fff} ${dailyQuests[player.info.quests[indexDaily]].name} (progress ${player.info.questsProgress[indexDaily]} / ${dailyQuests[player.info.quests[indexDaily]].progress}).`);
};

global.generateDailyQuest = async function(player, message = true) {
    const randomOne = Math.floor(Math.random() * dailyQuests.length); 
    const randomTwo = Math.floor(Math.random() * dailyQuests.length); 

    player.info.quests[0] = randomOne;
    player.info.quests[1] = (randomTwo == randomOne ?  Math.floor(Math.random() * dailyQuests.length) : randomTwo); //bypass same quest protection
 
    player.info.questsProgress[0] = 0;
    player.info.questsProgress[1] = 0;
  
    await Account.update({ quests: JSON.stringify(player.info.quests), questsProgress: JSON.stringify(player.info.questsProgress) }, { where: { id: player.info.id } }); 

    if(message == true) { 
        return sendMessage(player, COLOR_ADMIN, `(Daily quest):!{#fff} * Misiunea zilei a fost resetata. Foloseste /quests pentru a vedea noile misiuni.`);
    }
};
 
 
CommandRegistry.add({
    name: "generate", 
       
    run: function (player) { 
        let questsProgress = [0, 0];
        let quests = [null, null];
 
        Account.update({ quests: JSON.stringify(quests), questsProgress: JSON.stringify(questsProgress) }, { where: { id: { [Op.gt]: 0 } }} )
    }
});

CommandRegistry.add({
    name: "updatequest", 
       
    run: function (player, _, target) { 
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        if(!target) 
            return sendUsage(player, '/updatequest [quest]'); 

        return updateQuestProgress(player, target);
    }
});