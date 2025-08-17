global.showhud = false; 
global.server_name = 'SERVER-GAMING'
 
const localPlayer = mp.players.local; 
var hudstatus =
{ 
    street: null,
    area: null,  
    fishZone: false,
}
   
mp.events.add( 
{
    "client::hud:open" : (show, money, bank, admin, faction, hungerP, waterP, wanted, jail, keybinds, hotkeyActive, payday) =>
    {  
        globalBrowser.execute(`app.trigger("showHud", true);`);  
        globalBrowser.execute(`HudComponent.showHudData(${localPlayer.getVariable('REMOTE_ID')}, ${money}, ${bank}, ${(admin > 0) ? true : false}, ${(faction == 2) ? true : false}, ${mp.players.length}, ${JSON.stringify(server_name)}, ${hungerP}, ${waterP}, ${wanted}, ${jail}, ${keybinds}, ${hotkeyActive}, ${JSON.stringify(localPlayer.name)}, ${payday});`);  
        global.showhud = show;

        mp.game.ui.displayCash(false);
        mp.game.ui.displayAreaName(false); 
    },
 
    "client::hud:edit" : (option, value) =>
    {
        if(showhud)
        {   
            globalBrowser.execute(`HudComponent.${option}=${value};`); 
        }
    },

    "client::hud:showCursor" : (status) =>
    {
        return mp.gui.cursor.visible = status;  
    },
 
    "client::hud:editMoney" : (cash, bank) =>
    {  
        if(showhud)
        { 
            globalBrowser.execute(`HudComponent.money=${cash}; HudComponent.bank=${bank};`); 
        }
    },
 
    "player_hud_fish" : (option, status) => {  
        if(showhud) { 
            globalBrowser.execute(`HudComponent.${(option == 1) ? 'farmzone' : 'fishzone'}=${status};`); 
        }
    },
 
    "render" : () => {  
        mp.game.ui.hideHudComponentThisFrame(1); // HUD_WANTED_STARS
        mp.game.ui.hideHudComponentThisFrame(2); // HUD_WEAPON_ICON
        mp.game.ui.hideHudComponentThisFrame(3); // HUD_CASH
        mp.game.ui.hideHudComponentThisFrame(6); // HUD_VEHICLE_NAME
        mp.game.ui.hideHudComponentThisFrame(7); // HUD_AREA_NAME
        mp.game.ui.hideHudComponentThisFrame(8); // HUD_VEHICLE_CLASS
        mp.game.ui.hideHudComponentThisFrame(9); // HUD_STREET_NAME
     
 
        let getStreet = mp.game.pathfind.getStreetNameAtCoord(localPlayer.position.x, localPlayer.position.y, localPlayer.position.z, 0, 0); 
        let streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
        let crossingRoad  = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
     
        if(mp.players.local.vehicle) 
        {
            mp.game.audio.setRadioToStationName("OFF");
            mp.game.audio.setUserRadioControlEnabled(false);
        }
        
        if(globalBrowser)
        {
            if(localPlayer.vehicle && localPlayer.vehicle.getPedInSeat(-1) === localPlayer.handle)
            {     
                let streetLimit = getSpeedLimit(localPlayer.vehicle);
 
                globalBrowser.execute(`HudComponent.isVeh=true;HudComponent.speed=${(localPlayer.vehicle.getSpeed() * 3.6).toFixed(0)};HudComponent.fuel=${localPlayer.vehicle.getVariable('vehicleGass')};HudComponent.odometer=${localPlayer.vehicle.getVariable('vehicleOdometer')};HudComponent.limit=${streetLimit};`);
            } 
            else 
            {
                localPlayer.setConfigFlag(32, false);
                globalBrowser.execute(`HudComponent.isVeh=false;`);
            }
        }
     
        if(hudstatus.street != streetName || hudstatus.area != crossingRoad)
        {
            hudstatus.street = streetName;
            hudstatus.area = crossingRoad;
 
            globalBrowser.execute(`HudComponent.setStreet(${JSON.stringify(hudstatus)})`); 
        } 
    },

    "client::hud:interractShow" : (status = false, title, subtitle, data) =>
    {
        if(showhud && globalBrowser)
        {    
            if(status == false)
            {
                return globalBrowser.execute(`HudComponent.interract.status=false;`);
            }
 
            return globalBrowser.execute(`HudComponent.showInterract(${status}, ${JSON.stringify(title)}, ${subtitle}, ${data})`);
        } 
    },
  
    "client::hud:updateJail" : (time) =>
    {
        if(showhud && globalBrowser)
        {   
            return globalBrowser.execute(`HudComponent.jail=${time};`);
        } 
    }, 
 
    "client::hud:showPayday" : (data) =>
    {
        if(showhud && globalBrowser)
        {  
            return globalBrowser.execute(`HudComponent.showPayday(${data});`); 
        }
    },

    /*---------------------------------------------------[SPEEDOMETER]-------------------------------------------------*/
    "client::spedometer:showProps" : (belt, engine, locked) =>
    {
        if(showhud && globalBrowser)
        {  
            return globalBrowser.execute(`HudComponent.belt=${belt}; HudComponent.engine=${engine}; HudComponent.doors=${locked};`);   
        } 
    },
    /*-----------------------------------------------------------------------------------------------------------------*/

    "client::hud:showFinding" : (status, text) =>
    {
        return globalBrowser.execute(`HudComponent.finding=${status}; HudComponent.findingText='${text}';`);    
    }, 
});
 
global.pressKeyLock = function()
{
	if(mp.players.local.isTypingInTextChat)
	    return;

	return mp.events.callRemote('server::vehicle:changeLock'); 
}
 
global.pressKeyStartEngine = function()
{
	if(mp.players.local.isTypingInTextChat)
	    return;

    if(localPlayer.vehicle && localPlayer.vehicle.getPedInSeat(-1) !== localPlayer.handle)
        return;

	return mp.events.callRemote('server::vehicle:changeEngine'); 
}

global.pressKeyBel = function()
{
	if(mp.players.local.isTypingInTextChat)
	    return;

    if(localPlayer.vehicle) {
        let flag = !localPlayer.getConfigFlag(32, true);

        localPlayer.setConfigFlag(32, flag);
    }

	return mp.events.callRemote('server::vehicle:changeBelt'); 
}