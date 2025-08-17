global.browserShow = false;
 
global.pressKeyPList = function()
{
    if(mp.players.local.isTypingInTextChat || !enums.variables.logged || (mp.gui.cursor.visible && !browserShow))
        return;
  
    if(!browserShow) {
        return mp.events.callRemote("server::players:open");	 
    }
    
    browserShow = false;

    globalBrowser.execute(`app.trigger("showPlayers", false);`);
    hideDashboard(true);

    return mp.gui.cursor.visible = false;  
}
  
mp.events.add({
    "client::players:open" : (account, players) => {
        browserShow = true;
        mp.gui.cursor.visible = true;  
  
        hideDashboard(false);
        
        globalBrowser.execute(`app.trigger("showPlayers", true);`);
            
        return globalBrowser.execute(`PlayersComponent.showPlayersData(${account}, ${players});`); 
    } 
});  