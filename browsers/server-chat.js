global.pressKeyChat = function()
{
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || global.interfaceOpened || !enums.variables.logged)
        return;
 
	if(globalBrowser)
    {  
        globalBrowser.execute(`HudComponent.openChat(${true})`);  
        mp.gui.cursor.visible = !mp.gui.cursor.visible;  
    }  
}

mp.events.add({
  
    "SendToChat" : (message, color, clasa) =>
    {   
        if(!globalBrowser)
            return;
 
        return globalBrowser.execute(`HudComponent.push('${message}', '#${color}', '${clasa}')`); 
    } 
}); 