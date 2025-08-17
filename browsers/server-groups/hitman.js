mp.events.add({ 
	"client::hitman:showMenu" : (data) =>
    {  
        mp.gui.cursor.visible = true;  
        hideDashboard(false);

        globalBrowser.execute(`app.trigger("showContracts", true);`); 
 
        return globalBrowser.execute(`ContractsComponent.showContracts(${data});`); 
    },

    "client::hitman:closeMenu" : () =>
    {
        mp.gui.cursor.visible = false;  
        hideDashboard(true);

        return globalBrowser.execute(`app.trigger("showContracts", false);`); 
    },

    "client::hitman:getContract" : (index) =>
    {
        return mp.events.callRemote("server::hitman:getContract", index);   
    },

    "client::hitman:showPlaceContract" : () =>
    {
        mp.gui.cursor.visible = true;  
        hideDashboard(false);

        globalBrowser.execute(`app.trigger("showContracts", true);`); 

        return globalBrowser.execute(`ContractsComponent.changePageTarget(${page});`); 
    },
  
    "client::hitman:showData" : (data) =>
    {
        return globalBrowser.execute(`HudComponent.hitman = ${data};`); 
    },
});