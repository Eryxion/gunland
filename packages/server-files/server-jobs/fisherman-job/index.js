global.FISH_DATA = [  
    { name: 'Mullet Fish', price: 120 },
    { name: 'Salmon Fish', price: 400 },
    { name: 'Carp Fish',   price: 570 },  
    { name: 'Somon Fish',  price: 1000 }, 
    { name: 'Scad Fish',   price: 1200 }, 
    { name: 'Perch Fish',  price: 2500 }, 
];
  
mp.blips.new(780, new mp.Vector3(3867.532, 4464.000, 2.723), { name: 'Fish point', color: 4, shortRange: true});
mp.labels.new(`~y~Fish Point~n~~s~Use [~p~E~s~] for fish`, new mp.Vector3(3867.532, 4464.000, 2.723), { los: false, font: 0, drawDistance: 30, })

mp.blips.new(371, new mp.Vector3(3725.458, 4525.720, 22.4703), { name: 'Fish Man', color: 4, shortRange: true});
mp.peds.new(mp.joaat('s_m_m_linecook'), new mp.Vector3(3725.458, 4525.720, 22.470), {dynamic: false, frozen: true, invincible: true, heading: 176.465 });
global.fishSeller = mp.colshapes.newSphere(3725.458, 4525.720, 22.470, 3); 
mp.colshapes.newSphere(3867.532, 4464.000, 2.723, 3).atWorkPosition = 2;  
 
mp.events.add({
    "server::job:fisherman:start" : (player) => 
    { 
        if(player.working)
            return sendNotiffication(player, 'info', 'You already work at this job.');
 
        player.working = true;
        player.fishData = {};

        return sendNotiffication(player, 'success', `Work started at job Fisherman, go to fish point.`);      
    },

    "server::job:fisherman:startDrill" : async (player) =>
    {  
        if(!player.working || player.fishing || !player.IsInRange(3867.532, 4464.000, 2.723, 10))
            return;

        if(Object.keys(player.fishData).length)
            return sendNotiffication(player, 'info', 'You already have a fish, sell this at Fishing Man.');
   
        player.inAnimation = true;
        player.playAnimation("amb@world_human_stand_fishing@base", "base", 1, 49);   

        player.fishing = true; 
        createObject(player, 'prop_fishing_rod_01', player.position, player.rotation, 255, player.dimension, 57005, 0.1500, 0.0300, 0.0000, 39.0000, 58.0000, 0.0000);
           
        setTimeout(() => 
        {
            let random = Math.floor(Math.random() * FISH_DATA.length);
  
            destroyObject(player); 
            player.stopAnimation();
            player.fishing = false;
 
            sendMessage(player, 'ff9900', `(Fishing)!{#fff} You caught a ${FISH_DATA[random].name} (price: !{#00b33c}$${formatMoney(FISH_DATA[random].price)}!{#fff}).`);
            sendMessage(player, 'ff9900', `(Fishing)!{#fff} You can view this in your inventory and sell at Fish Man.`);

            updateQuestProgress(player, 'fisherman');
 
            return player.fishData = { name: FISH_DATA[random].name, price: FISH_DATA[random].price }

        }, 5000); 
    },  
});

global.openFishMenu = function(player)
{  
    if(!Object.keys(player.fishData).length)
        return sendNotiffication(player, 'error', 'Your dont have a fish', 'Fish:'); 
  
    return player.call('client::job:openMenu', [JSON.stringify({x: 3725.458, y: 4525.720, z: 22.470, heading: 176.465}), JSON.stringify({id: -1, job: serverJobs[player.info.job - 1].name, npc: 'Andrew', working: player.working, selling: true, price: player.fishData.price})]);
} 