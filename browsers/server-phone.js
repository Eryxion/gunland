global.openedPhone = false;
 
global.pressKeyPhone = function()
{ 
    if(mp.players.local.isTypingInTextChat || !enums.variables.logged || profileBrowserOpened)
        return;
 
    return mp.events.callRemote('server::phone:openNow');
};
 
mp.keys.bind(0x28, false, async function() { //DOWN KEY
	 
    if(mp.players.local.isTypingInTextChat || !enums.variables.logged)
        return;
 
    if(globalBrowser)
    {
        globalBrowser.execute(`PhoneComponent.closePhone()`);  
    } 
});
 
mp.events.add({    
    'client::phone:openNow' : (settings, conversations, contacts, vehicles, locations, transactions, calls, crimes, user) =>
    {   
        if(openedPhone)
            return true;   

        openedPhone = true;
        mp.gui.cursor.visible = true;
 
        globalBrowser.execute(`app.trigger("showPhone", true);`); 
        return globalBrowser.execute(`PhoneComponent.open(${settings}, ${conversations}, ${contacts}, ${vehicles}, ${locations}, ${transactions}, ${calls}, ${openedPhone}, ${crimes}, ${user})`); 
    },

    'client::phone:closeNow' : () =>
    {   
        openedPhone = false; 
        mp.gui.cursor.visible = false;  
 
        globalBrowser.execute(`app.trigger("showPhone", false);`);  
        return mp.events.callRemote('server::phone:closeNow');
    },
  
    /*--------------------------------------------------------- [ HITMAN APPLICATION ] ---------------------------------------------------------*/  
    'client::phone::darkweb:close' : () =>
    { 
        return globalBrowser.execute(`PhoneComponent.clickBarPhone()`); 
    },
    /*------------------------------------------------------------------------------------------------------------------------------------------*/


    /*--------------------------------------------------------- [ MESSAGES APPLICATION ] -------------------------------------------------------*/  
    'client::phone::messages:openConversation:finish' : (data) =>
    { 
        return globalBrowser.execute(`PhoneComponent.openConversationFinish(${data})`); 
    }, 
    /*------------------------------------------------------------------------------------------------------------------------------------------*/
 

    /*--------------------------------------------------------- [ CONTACTS APPLICATION ] -------------------------------------------------------*/   
    'client::phone:contacts:call' : (data) =>
    {   
        const raw = JSON.parse(data);

        if(raw.status == 'incoming') 
        {
            return globalBrowser.execute(`PhoneComponent.incomingCall(${data}, ${openedPhone})`);   
        }  
    }, 
    /*------------------------------------------------------------------------------------------------------------------------------------------*/
    
    /*---------------------------------------------------------- [ CALL APPLICATION ] --------------------------------------------------------*/  
 
    'client::phone:calling:start' : (settings, conversations, contacts, vehicles, locations, transactions, calls, crimes, user) => //function for receiver caller
    { 
        globalBrowser.execute(`app.trigger("showPhone", true);`); 
        globalBrowser.execute(`PhoneComponent.open(${settings}, ${conversations}, ${contacts}, ${vehicles}, ${locations}, ${transactions}, ${calls}, ${openedPhone}, ${crimes}, ${user})`); 
  
        globalBrowser.execute(`PhoneComponent.startCallRigning()`); 
    },
  
    'client::phone:contacts:updateCall' : (data, status) =>
    {
        return globalBrowser.execute(`PhoneComponent.updateCall(${data}, ${status})`);   
    },
    /*------------------------------------------------------------------------------------------------------------------------------------------*/ 
}); 