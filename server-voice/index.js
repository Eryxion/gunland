const Use3d 		= true;
const UseAutoVolume = true;
const VoiceVol 		= 1.0; 
const MaxRange 		= 50.0;
 
let localPlayer = mp.players.local;  

var PHONE = {
    target: null,
    status: false
};
 
global.enableMicrophone = function() 
{
	if(mp.players.local.isTypingInTextChat || PHONE.status == true || !enums.variables.logged || !localPlayer.getVariable('voice'))
		return;
 
    if(mp.voiceChat.muted) 
	{
        mp.voiceChat.muted = false; 
		mp.players.local.isVoiceActive = true;

        return globalBrowser.execute(`HudComponent.mic=true;`);  
    }
}

global.disableMicrophone = function()
{
	if(mp.players.local.isTypingInTextChat || PHONE.status == true || !enums.variables.logged || !localPlayer.getVariable('voice'))
		return;
 
    if(!mp.voiceChat.muted) 
	{
        mp.voiceChat.muted = true; 
		mp.players.local.isVoiceActive = false;

        return globalBrowser.execute(`HudComponent.mic=false;`);  
    }
}
 
let g_voiceMgr =
{
	listeners: [],
	
	add: function(player)
	{
		this.listeners.push(player);
		
		player.isListening = true;		
		mp.events.callRemote("add_voice_listener", player);
 
		if(UseAutoVolume)
		{
			player.voiceAutoVolume = true;
		}
		else
		{
			player.voiceVolume = 1.0;
		}
		
		if(Use3d)
		{
			player.voice3d = true;
		} 
	},
	
	remove: function(player, notify)
	{
		let idx = this.listeners.indexOf(player);
			
		if(idx !== -1)
		{
			this.listeners.splice(idx, 1);
			
			player.isListening = false;		
			
			if(notify)
			{
				return mp.events.callRemote("remove_voice_listener", player);
			}
		} 
	}
};
 
setInterval(() =>
{ 
	let localPos = localPlayer.position;
	
	mp.players.forEachInStreamRange(player =>
	{
		if(player != localplayer && (!PHONE.target || PHONE.target != player))
		{
			if(!player.isListening && player.getVariable('voice'))
			{
				const playerPos = player.position;		
				let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);
				
				if(dist <= MaxRange)
				{
					g_voiceMgr.add(player);
				}
			}
		}
	});
 
	g_voiceMgr.listeners.forEach((player) =>
	{
		if(player.handle !== 0)
		{
			const playerPos = player.position;		
			let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);
			
			if(dist > MaxRange)
			{
				g_voiceMgr.remove(player, true);
			}
			else if(!UseAutoVolume)
			{
				player.voiceVolume = (1 - (dist / MaxRange)) * VoiceVol;
			}
		}
		else
		{  
			g_voiceMgr.remove(player, true);
		}
	});
}, 500);
 
mp.events.add({

    "playerQuit" : (player) =>
    { 
        if(player.isListening)
		{
			return g_voiceMgr.remove(player, false);
		}
    }, 
}); 
 
mp.events.add('voice.phoneCall', (target) => {
    if(!PHONE.target) 
	{
        PHONE.target = target;
        PHONE.status = true;
        mp.events.callRemote("add_voice_listener", target);
        target.voiceVolume = 5.0;
        target.voice3d = false;
        g_voiceMgr.remove(target, false);

		mp.voiceChat.muted = false;
    }
});

mp.events.add("voice.phoneStop", () => {

    if(PHONE.target) 
	{
        if(mp.players.exists(PHONE.target)) 
		{ 
            mp.events.callRemote("remove_voice_listener", PHONE.target);
        } 
	  
        PHONE.target = null;
        PHONE.status = false; 
		mp.voiceChat.muted = true;
    }
}); 