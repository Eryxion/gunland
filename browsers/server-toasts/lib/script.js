let notifficationBrowser = null; 
const soundsName =
{ 
    'success': ['CONFIRM_BEEP', 'HUD_MINI_GAME_SOUNDSET'],
    'info': ['DELETE', 'HUD_DEATHMATCH_SOUNDSET'], 
    'error': ['Event_Message_Purple', 'GTAO_FM_Events_Soundset']
}
 
mp.events.add('client::hud:sendNotify', (type, text, title = 'Notify:') => 
{ 
    if(notifficationBrowser == null) 
    {
        notifficationBrowser = mp.browsers.new(`package://browsers/server-toasts/index.html`);
    }
 
    mp.game.audio.playSoundFrontend(-1, soundsName[type][0], soundsName[type][1], false);
 
    return notifficationBrowser.execute("sendNotiffication('" + type + "', '" + title + "', '" + text + "');");  
});  
 