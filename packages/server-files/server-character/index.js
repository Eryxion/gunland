const { CommandRegistry } = require("../server-global/improved-commands"); 
const spawn_character = 
{ 
    position: new mp.Vector3(402.8664, -996.4108, -99.00027),
    heading: -185.0, 
};
  
CommandRegistry.add({
    name: "startc", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player) 
    { 
        player.position = spawn_character.position;
        player.heading = spawn_character.heading;
        player.dimension = (player.id + 1); 
        player.model = mp.joaat('mp_m_freemode_01');
    
        return player.call('client::character:openMenu', []);  
    }
});
 
mp.events.add({

    "server::character:save" : async (player, chData, features, apperance) => 
    { 
        player.loggedInAs = true;    
        player.setVariable('REMOTE_ID', player.id);	 

        mp.events.call("server:inventory::loading", player, player.info.id);  
        mp.events.call("server::personalVehicles:load", player); 
        loadPlayerMessages(player);
        
        player.spawn(new mp.Vector3(-61.349, -792.933, 44.225)); 
        player.heading = parseFloat(-41.017); 
        player.dimension = 0; 
 
        freezePlayer(player, false);
  
        player.callData = { 
            caller: '', receiver: '', input: '', time: 0, status: 'no call' 
        }; 

        player.info.clan = {
            id: 0, tag: 0, rank: 0, permissions: [false,false,false]  
        };

        player.info.wanted = {
            level: 0, time: 0, reporters: [], reasons: []
        };

        player.info.tatoos = [];
        player.setVariable('tatoos', JSON.stringify(player.info.tatoos));

        player.info.quests = [null, null];
        player.info.questsProgress = [0, 0];
        player.info.achievements = [0, 0, 0, 0, 0, 0, 0]; 
 
        player.info.playerBinds = { 
            "CHAT":{"id":84,"has":"0x54","key":"T"},"TALK":{"id":66,"has":"0x42","key":"B"},"PHONE":{"id":38,"has":"0x26","key":"UP"},"INVENTORY":{"id":89,"has":"0x59","key":"Y"},"PROFILE & SETTINGS":{"id":77,"has":"0x4D","key":"M"},"PLAYERS LIST":{"id":90,"has":"0x5A","key":"Z"},"VEHICLE LOCK":{"id":76,"has":"0x4C","key":"L"},"VEHICLE ENGINE":{"id":50,"has":"0x32","key":"2"},"VEHICLE SEATBELT":{"id":71,"has":"0x47","key":"G"}
        };

        player.info.phoneSettings = { 
            wallpaper: 0, airplane: false, ignoreCalls: true, ignore: false, ringtone: 0, photo: player.info.photo 
        };

        player.info.playerSettings = {
            hotkeys: true,
            newbie: true,
            voice: true,
            radio: true,
            radioVolume: 100,
            voiceVolume: 100
        };
        
        player.info.characterData = { 
            general: JSON.parse(chData), 
            appearance: JSON.parse(apperance), 
            features: JSON.parse(features) 
        };
 
        sendMessage(player, `8080ff`, `(Server):!{#fff} Welcome to the server !{#8080ff}${player.name} [${player.id}]!{#fffffff}.`); 
        sendMessage(player, '8080ff', `(Server):!{#fff} A checkpoint was placed at Driving School LS.`);
        sendMessage(player, '8080ff', `(Server):!{#fff} If you want to get driver licence go to marker.`);
         
        setPlayerCheckpoint(player, -210.487, -1926.465, 27.769, null); 
        await generateDailyQuest(player, false);
        await loadAccount(player);

        player.call("client::hud:open", [true, player.info.money, player.info.bank, player.info.admin, player.info.group, player.info.hungry, player.info.thirst, JSON.stringify(player.info.wanted), player.info.jail, JSON.stringify(player.info.playerBinds), player.info.playerSettings.hotkeys, player.info.payday]);
   
        await Account.update({ socialclub: player.socialClub, photo: player.info.photo.toString(), status: 1, registered: curentTimestamp(), clan: player.info.clan, phoneSettings: player.info.phoneSettings, characterData: player.info.characterData, playerSettings: player.info.playerSettings, playerBinds: player.info.playerBinds, wanted: player.info.wanted }, { where: { id: player.info.id } }); 
    } 
});  

global.startPlayerCreator = function(player)
{    
    if(Object.keys(player.info.characterData).length)
    { 
        player.call('client::character:applyData', [JSON.stringify(player.info.characterData['general']), JSON.stringify(player.info.characterData['appearance']), JSON.stringify(player.info.characterData['features'])]); 
     
        return setTimeout(() => { reloadPlayerClothes(player) }, 1000); 
    }
   
    showPlayerCursor(player, true);
 
    setTimeout(() => { 
        player.position = spawn_character.position;
        player.heading = spawn_character.heading;
        player.dimension = (player.id + 1);   
        player.info.photo = 'https://i.imgur.com/DP7NqWU.png';

        player.call('client::character:openMenu', []);   
    }, 200); 
}  