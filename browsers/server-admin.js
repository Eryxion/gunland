let reportBrowserOpened = null;

mp.events.add(
{    
    "client::report:showMenu" : () =>
    {  
        if(!reportBrowserOpened)
        {
            globalBrowser.execute(`app.trigger("showAdmin", true);`); 
 
            reportBrowserOpened = true;
            return mp.gui.cursor.visible = true;  
        } 
    },

    "client::report:closeMenu" : () =>
    { 
        globalBrowser.execute(`app.trigger("showAdmin", false);`); 
        reportBrowserOpened = false;
        return mp.gui.cursor.visible = false;   
    },

    "client::report:sendReport" : (index, reason) =>
    { 
        if(reportBrowserOpened)
        {
            reportBrowserOpened = false;
            mp.gui.cursor.visible = false;
            globalBrowser.execute(`app.trigger("showAdmin", false);`); 

            return mp.events.callRemote("server::report:sendReport", index, reason);  
        } 
    } 
});