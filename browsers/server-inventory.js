let inventoryOpened = false;
 
mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(inventoryOpened)
    {
        globalBrowser.execute(`app.trigger("showInventory", false);`);   
 
        mp.gui.cursor.visible = false; 
        inventoryOpened = false;
        
        return hideDashboard(true);
    }
});
 
global.pressKeyInventory = function()
{
    if(!mp.players.local.isTypingInTextChat && !mp.gui.cursor.visible && !inventoryOpened)
	{  
        return mp.events.callRemote("server:inventory::open"); 
	}  
}
 
mp.events.add( 
{
    'client:inventory::open' : (data, attacheds, nearbys) =>
    { 
        hideDashboard(false);
        mp.gui.cursor.visible = true;
        inventoryOpened = true;

        globalBrowser.execute(`app.trigger("showInventory", true);`);   
      
        return globalBrowser.execute(`InventoryComponent.openInventory(${data}, ${attacheds}, ${nearbys})`); 
    } 
}); 