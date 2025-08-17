global.profileBrowserOpened = false; 
const player = mp.players.local;
 
global.keys = [ 84, 75, 38, 89, 77, 90, 76, 50, 71 ];
global.KeysData = { 
    38: 0x26, 48: 0x30, 49: 0x31, 50: 0x32, 51: 0x33, 52: 0x34, 53: 0x35, 54: 0x36, 55: 0x37, 56: 0x38, 57: 0x39, 65: 0x41, 66: 0x42, 67: 0x43, 68: 0x44, 69: 0x45, 70: 0x46, 71: 0x47, 72: 0x48, 73: 0x49, 74: 0x4A, 75: 0x4B, 76: 0x4C, 77: 0x4D, 78: 0x4E, 79: 0x4F, 80: 0x50, 81: 0x51, 82: 0x52, 83: 0x53, 84: 0x54, 85: 0x55, 86: 0x56, 87: 0x57, 88: 0x58, 89: 0x59, 90: 0x5A 
};
   
//{"CHAT":{"id":84,"has":"0x54","key":"T"},"TALK":{"id":66,"has":"0x42","key":"B"},"PHONE":{"id":80,"has":"0x50","key":"P"},"INVENTORY":{"id":89,"has":"0x59","key":"Y"},"PROFILE & SETTINGS":{"id":77,"has":"0x4D","key":"M"},"PLAYERS LIST":{"id":90,"has":"0x5A","key":"Z"},"VEHICLE LOCK":{"id":76,"has":"0x4C","key":"L"},"VEHICLE ENGINE":{"id":50,"has":"0x32","key":"2"},"VEHICLE SEATBELT":{"id":71,"has":"0x47","key":"G"}}

function pressKeyProfile()
{  
    if(!profileBrowserOpened)
    {
        if(!mp.players.local.isTypingInTextChat && !mp.gui.cursor.visible) {
            mp.events.callRemote('server::profile:open');
        } 
    }
    else 
    {
        mp.events.call('client::profile:close');
    } 
}
  
mp.events.add(
{  
    "client::profile:open" : (data, settings, binds, logsf) =>
    { 
        profileBrowserOpened = true;
        mp.gui.cursor.visible = true;    
        hideDashboard(false);
 
        globalBrowser.execute(`app.trigger("showProfile", true);`); 

        return globalBrowser.execute(`ProfileComponent.open(${JSON.stringify(data)}, ${JSON.stringify(settings)}, ${binds}, ${logsf});`);   
    },

    "client::profile:close" : () =>
    {
        globalBrowser.execute(`app.trigger("showProfile", false);`); 

        mp.gui.cursor.visible = false;    
        profileBrowserOpened = false; 

        return hideDashboard(true);
    },

    "client::profile:changeVolume" : (index, value) =>
    {  
        if(index == 5) {
            player.voiceVolume = (value / 100).toFixed(2);
        }

        return mp.events.callRemote("server::profile:changeVolume", index, value);  
    },

    "client::profile:changeSetting" : (index, status) =>
    {
        if(profileBrowserOpened)
        {
            if(index == 'hotkeys')
            {
                player.hotkeys = status;
                globalBrowser.execute(`HudComponent.hotkeys=${player.hotkeys};`); 
            }
 
            return mp.events.callRemote("server::profile:changeSetting", index, status);  
        }
    },

    "client::profile:settingsApply" : (data) =>
    {
        const restult = JSON.parse(data);
  
        player.hotkeys = restult.hotkeys;
        player.newbie = restult.newbie;
        player.voice = restult.voice;
        player.radio = restult.radio;
 
        return globalBrowser.execute(`HudComponent.hotkeys=${restult.hotkeys};`);  
    },
 
    "client::keybinds:loadAll" : (one, two, three, foor, five, six, seven, eight, nine) =>
    {
        global.keys[0] = one;
        global.keys[1] = two;
        global.keys[2] = three;
        global.keys[3] = foor;
        global.keys[4] = five;
        global.keys[5] = six;
        global.keys[6] = seven;
        global.keys[7] = eight;
        global.keys[8] = nine;
 
        mp.keys.bind(KeysData[global.keys[1]], true, enableMicrophone);
        mp.keys.bind(KeysData[global.keys[1]], false, disableMicrophone);
 
        mp.keys.bind(KeysData[global.keys[0]], true, pressKeyChat);    
        mp.keys.bind(KeysData[global.keys[2]], true, pressKeyPhone);   
        mp.keys.bind(KeysData[global.keys[3]], true, pressKeyInventory);   
        mp.keys.bind(KeysData[global.keys[4]], true, pressKeyProfile);   
        mp.keys.bind(KeysData[global.keys[5]], true, pressKeyPList);   
        mp.keys.bind(KeysData[global.keys[6]], true, pressKeyLock);   
        mp.keys.bind(KeysData[global.keys[7]], true, pressKeyStartEngine);  
        mp.keys.bind(KeysData[global.keys[8]], true, pressKeyBel);  
    },
 
    "client::profile:updateKeys" : (forBind, lastIndex, key, dataHudKey) =>
    {  
        mp.keys.unbind(KeysData[lastIndex], true);  
        mp.events.call('client::profile:close');  
         
        switch(forBind)
        {
            case 'CHAT':
            {
                global.keys[0] = key;
                mp.keys.bind(KeysData[key], true, pressKeyChat);  
                break;
            } 

            case 'TALK':
            {
                global.keys[1] = key;  

                mp.keys.bind(KeysData[key], true, enableMicrophone);
                mp.keys.bind(KeysData[key], false, disableMicrophone);
                break;
            } 

            case 'PHONE':
            {
                global.keys[2] = key;
                mp.keys.bind(KeysData[key], true, pressKeyPhone);   
                break;
            } 

            case 'INVENTORY':
            {
                global.keys[3] = key;
                mp.keys.bind(KeysData[key], true, pressKeyInventory);  
                break;
            } 

            case 'PROFILE & SETTINGS':
            {
                global.keys[4] = key;
                mp.keys.bind(KeysData[key], true, pressKeyProfile);   
                break;
            } 

            case 'PLAYERS LIST':
            {
                global.keys[5] = key;
                mp.keys.bind(KeysData[key], true, pressKeyPList);  
                break;
            } 
            case 'VEHICLE LOCK':
            {
                global.keys[6] = key;
                mp.keys.bind(KeysData[key], true, pressKeyLock);  
                break;
            } 

            case 'VEHICLE ENGINE':
            {
                global.keys[7] = key;
                mp.keys.bind(KeysData[key], true, pressKeyStartEngine);  
                break;
            } 
            case 'VEHICLE SEATBELT':
            {
                global.keys[8] = key;
                mp.keys.bind(KeysData[key], true, pressKeyBel);  
                break;
            } 
        } 
        return globalBrowser.execute(`HudComponent.binds=${dataHudKey};`);
    }
}); 
 
setTimeout(() => {

    global.keys[0] = 84;
    global.keys[1] = 66;
    global.keys[2] = 38;
    global.keys[3] = 89;
    global.keys[4] = 77;
    global.keys[5] = 90;
    global.keys[6] = 76;
    global.keys[7] = 50;
    global.keys[8] = 71;

}, 1000); 