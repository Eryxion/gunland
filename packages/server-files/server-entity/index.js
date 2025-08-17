const animations_entity =
{
    "handsup": { dict: 'mp_bank_heist_1', name: 'guard_handsup_loop', flag: 49 }, 
    "dance": { dict: 'anim@amb@nightclub@dancers@crowddance_groups@', name: 'mi_dance_crowd_17_v2_male', flag: 39 }, 
    "peace": { dict: 'mp_player_int_upperpeace_sign', name: 'mp_player_int_peace_sign_exit', flag: 2 },
    "middlefinger": { dict: 'anim@mp_player_intcelebrationmale@finger', name: 'finger', flag: 1 },
    "stop": { dict: 'mini@strip_club@idles@bouncer@stop', name: 'stop', flag: 1 },
    "salute": { dict: 'anim@mp_player_intcelebrationmale@salute', name: 'salute', flag: 1 }, 
}

global.play_animation = function(player, dict, name, speed, flag)
{ 
    if(player.inAnimation)
        return;

    player.playAnimation(dict, name, speed, flag);

    player.inAnimation = true;
 
    setTimeout(() => {

        player.stopAnimation();

        player.inAnimation = false;

    }, 5000);
}   
 
/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------[PLAYER INTERRACT] --------------------------------------------------------------------------*/
 
mp.events.add({
    "client::entity:actionEmote" : (player, parameter) =>
    {
        player.stopAnimation();

        return play_animation(player, animations_entity[parameter].dict, animations_entity[parameter].name, 1, animations_entity[parameter].flag);
    },

    "client::entity:actionPlayer" : (player, parameter, entityID) =>
    { 
        const user = mp.players.toArray().find((index) => index.id == entityID);
 
        if(!user.loggedInAs)
            return sendNotiffication(player, 'error', 'This player is not connected.');
    
        switch(parameter)
        {
            case 'pay':
            {
                if(player.info.money < 5000)
                    return sendNotiffication(player, 'error', 'You dont have 5.000$');
    
                player.giveMoney(1, 5000); 
                sendNotiffication(player, 'success', `You pay 5.000$ to ${user.name}.`);
    
                user.giveMoney(1, 5000); 
                sendNotiffication(user, 'success', `You received 5.000$ from ${user.name}.`);
                break;
            }
    
            case 'invite':
            {   
                sendMessage(player, 'fff', `debug ${user.name}`);
 
                user.call("client::dashboard:inviteFaction", [player.id, JSON.stringify(player.name), JSON.stringify(serverFactions[player.info.group - 1].name)])
                break;
            }
    
            case 'trade':
            {
                break;
            }
        } 
    }, 

    "client::entity:actionVehicle" : (player, parameter, entityID) =>
    {
        const vehicle = mp.vehicles.toArray().find((index) => index.id == entityID);

        if(vehicle.params.user != player)
            return sendNotiffication(player, 'error', 'This vehicle is not created for you.');
 
        switch(parameter)
        {
            case 'lock':
            {
                vehicle.locked = !vehicle.locked;

                sendNotiffication(player, 'success', `This vehicle is now ${vehicle.locked == true ? 'locked' : 'unlocked'}`);
                break;
            }

            case 'light':
            {
                player.call("client::entity:actionLHTW", [parameter]);
                break;
            }

            case 'hood':
            {
                player.call("client::entity:actionLHTW", [parameter]);
                break;
            }

            case 'trunk':
            {
                player.call("client::entity:actionLHTW", [parameter]);
                break;
            }

            case 'fill':
            {
                startPetrolBrowser(player, vehicle);
                break;
            }
            
            case 'windows':
            { 
                player.call("client::entity:actionLHTW", [parameter]);
                break;
            }
        } 
    }
}); 