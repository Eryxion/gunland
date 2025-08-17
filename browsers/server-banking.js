let bankingOpened = false;

mp.keys.bind(0x45, true, function() //KEY E
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;
 
    return mp.events.callRemote("server::banking:open"); 
});

mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(bankingOpened)
    {
        globalBrowser.execute(`app.trigger("showBanking", false);`);   
 
        mp.gui.cursor.visible = false; 
        bankingOpened = false;
        
        return hideDashboard(true);
    }
});
 
mp.events.add({
 
    'client::banking:open' : (data) => 
    {  
        hideDashboard(false); 
        bankingOpened = true;
        
        globalBrowser.execute(`app.trigger("showBanking", true);`); 

        mp.gui.cursor.visible = true;

        return globalBrowser.execute(`BankingComponent.open(${data});`);   
    },
    
    'client:banking::finishTransaction' : (option, user, amount) =>
    {
        return mp.events.callRemote("server:banking::finishTransaction", option, user, amount);  
    }
});