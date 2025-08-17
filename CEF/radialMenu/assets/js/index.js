const player = mp.players.local;

var entitySelected = null; 
let accesToSelectEntity = false;  
let entityOption = null;

let interractBrowser = null;  
 
mp.keys.bind(0x4F, true, function() { //O KEY
 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;
 
    if(interractBrowser == null)
    {
        interractBrowser = mp.browsers.new("package://CEF/radialMenu/index.html");    
    } 
 
    if(interractBrowser != null)
    {
        interractBrowser.execute(`openInterractMenu();`);

        mp.gui.cursor.visible = true;      
    }
}); 
 
mp.keys.bind(0x1B, true, function() { //ESC KEY
 
    if(mp.players.local.isTypingInTextChat)
        return;
 
    if(interractBrowser!= null)
    {
        interractBrowser.destroy();
        interractBrowser = null;

        mp.gui.cursor.visible = false;  
    } 
}); 

function reset()
{
    entityOption = null;
    entitySelected = null;

    mp.gui.cursor.visible = false; 
    accesToSelectEntity = false;
}

mp.events.add({
    "client::interract:exit" : () =>
    {   
        return reset();
    },

    "client::interract:selectEntity" : (option) => 
    { 
        if(interractBrowser)
        {
            accesToSelectEntity = true;
            entityOption = option;
 
            return mp.events.call("client::hud:sendNotify", 'info', `Please select <span style = "color: #9478ff;">${option}</span> entity.`, 'Entity:'); 
        } 
    },
 
    "click" : (x, y, upOrDown, leftOrRight, relativeX, relativeY, worldPosition, hitEntity) =>
    {
        if(accesToSelectEntity)
        {
            let camera  = mp.cameras.new("gameplay");
            let position = camera.getCoord();
        
            let hitData = mp.raycasting.testPointToPoint(position, worldPosition, mp.players.local.handle, [4, 8, 10]);
            if(hitData && entityOption != null && hitData.entity.type == entityOption) 
            {    
                entitySelected = hitData.entity;
     
                accesToSelectEntity = false;
      
                return interractBrowser.execute(`entitySelectedShowInterract();`);   
            } 
        }  
    },
 
    "client::interract:actionPlayer" : (parameter) =>
    { 
        return mp.events.callRemote("client::entity:actionPlayer", parameter, entitySelected.id);
    },

    "client::interract:actionVehicle" : (parameter) =>
    {  
        return mp.events.callRemote("client::entity:actionVehicle", parameter, entitySelected.id); 
    },

    "client::interract:actionEmote" : (parameter) =>
    {  
        return mp.events.callRemote("client::entity:actionEmote", parameter);
    },

    "client::entity:actionLHTW" : (parameter, vehicle) =>
    {
        switch(parameter)
        { 
            case 'light':
            { 
                const lightState = entitySelected.getLightsState(1, 1);
 
                if(lightState.lightsOn)
                {
                    entitySelected.setLights(1); 
                }
                else 
                {
                    entitySelected.setLights(2); 
                }

                return mp.events.call("client::hud:sendNotify", 'info', `Your headlights are now ${lightState.lightsOn == false ? 'on' : 'off'}`, 'Entity:'); 
                break;
            }

            case 'hood':
            {  
                if(entitySelected.hood)
                { 
                    entitySelected.setDoorShut(4, true);
                } 
                else 
                { 
                    entitySelected.setDoorOpen(4, false, true);
                } 

                entitySelected.hood = !entitySelected.hood;
                break;
            }

            case 'trunk':
            {
                if(entitySelected.trunk)
                { 
                    entitySelected.setDoorShut(5, true);
                } 
                else 
                { 
                    entitySelected.setDoorOpen(5, false, true);
                } 

                entitySelected.trunk = !entitySelected.trunk;
                break;
            }

            case 'fill':
            {
                break;
            }
            
            case 'windows':
            {  
                entitySelected.rollDownWindow(0);  
                break;
            }
        }
    }
}); 