const rpc = require("rage-rpc");

//Text chat and voice chat
mp.events.add(
{
	"add_voice_listener" : (player, target) =>
	{ 
		if(target)
		{ 
			if(player.callData.status == 'ongoing' && target.callData.status == 'ongoing')
			{
				if(player.callData.receiver == target.phoneNumber || player.callData.caller == target.info.phoneNumber) {
					player.enableVoiceTo(target);
				}
			}
			else 
			{
				return player.enableVoiceTo(target);
			} 
		}
	},

	"remove_voice_listener" : (player, target) =>
	{ 
		if(target) {
			return player.disableVoiceTo(target);
		}
	},

	"playerChat" : (player, text) =>
	{  
		if(player.info.mute > 0) 
			return sendMessage(player, 'ffffff', `You are muted, you canno't speak.`);
  
		switch(player.chatOption)
		{
			case 'local': {  
				mp.players.forEachInRange(player.position, 10, (user) => 
				{ 
					if(user.loggedInAs == true && user.dimension == player.dimension) {    
						return user.outputChatBox(`${getPlayerNameClan(player)}: !{#e6e6e6}${text}`); 
					}
				});  
				break;
			}

			case 'staff': {
				sendAdmins('ffc35a', 'staff', `${getPlayerNameClan(player, false)}: ${text}`);
				break;
			}

			case 'group': {
				sendGroup(player.info.group, '6699ff', `(G):</span> ${getPlayerNameClan(player, false)}: ${text}`);
				break;
			}
		}   
	} 
}); 
 
rpc.register('server::chat:changeSettings', (data, user) =>  
{
    try
    {
        const player = user.player; 
		const raw = JSON.parse(data);
 
		switch(raw.option)
		{
			case 'category': {
				player.chatOption = raw.result;
				break;
			}
		} 
    }
    catch(error) { console.log(error) }   
}); 
  
//Send message to admins
global.sendAdmins = function(color, category = 'local', message) 
{ 
	mp.players.forEach(user => {
		if(user.info.admin > 0 && user.loggedInAs == true) {   
			return user.call('SendToChat', [message, color, category]);
		}
	});  
} 

global.sendStaff = function(color, message) 
{
	mp.players.forEach(user => {
		if(user.info.admin > 0 || user.info.helper > 0 && user.loggedInAs == true) { 
			user.outputChatBox(`!{#${color}} ${message}`);
		}
	}); 
}
 
global.sendToAll = function(color, message) 
{
	mp.players.forEach(user => { 
		if(user.loggedInAs == true) user.outputChatBox(`!{#${color}} ${message}`);
	}); 
} 
  
global.sendLocal = function(player, color = 'fff', range, message) 
{ 
	mp.players.forEachInRange(player.position, parseInt(range), (user) => 
	{ 
		if(user.loggedInAs == true && user.dimension == player.dimension) {  
			return user.outputChatBox(`!{#${color}} ${message}`); 
		}
	}); 
}   
 
global.sendUsage = function(player, message) 
{ 
	if(player.loggedInAs == true) { 
		player.outputChatBox(`!{#009999}(Usage):!{#ffffff} ${message}`);
	}
}
 
global.sendMessage = function(player, color, message) 
{
	if(player.loggedInAs == true) {     
		player.outputChatBox(`!{#${color}} ${message}`); 
	}
}   