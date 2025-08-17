mp.objects.new("prop_elecbox_18", new mp.Vector3(-1207.1166, -324.2931, 38.0697), { rotation: new mp.Vector3(0, 0, 206.7991), alpha: 255, dimension: 0 }); 
mp.game.entity.createModelHide(-1211.1632, -334.5356, 37.9212, 1, mp.game.joaat("v_ilev_gb_vauldr"), true);  

const mickeyLocations = 
[ 
    {x: 302.03298, y: -1946.630, z: 24.612, heading: 52.0994},
    {x: 717.61480, y: -1743.379, z: 17.974, heading: 86.3623},
    {x: 1451.1132, y: -1720.770, z: 68.700, heading: 97.5751},
    {x: -1195.317, y: -1051.597, z: 2.1504, heading: 114.809}
];
 
let money_objects = [ 
    [ 
        {x: -1207.9667, y:-337.4402, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.8867, y:-337.5978, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.8545, y:-337.383,  z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.7736, y:-337.5405, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.7588, y:-337.3372, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.6783, y:-337.4948, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.6533, y:-337.2874, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.5701, y:-337.4365, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.4745, y:-337.6056, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.5819, y:-337.6667, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.6826, y:-337.7239, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.79,   y:-337.7849, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.703,  y:-337.9407, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.6023, y:-337.8835, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.4911, y:-337.8293, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.3904, y:-337.772,  z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.5516, y:-337.23,   z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.4646, y:-337.3858, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.37,   y:-337.5552, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.2792, y:-337.7178, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.4471, y:-337.1795, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.3601, y:-337.3354, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.2693, y:-337.498,  z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.1747, y:-337.6673, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.3313, y:-337.132,  z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x: -1207.2443, y:-337.2879, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x:-1207.161,   y:-337.4369, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
        {x:-1207.0664,  y:-337.6063, z:37.6097, rot: { x: 0, y: 0, z: -62.0001}},
    ], 
]
 
let rob = {
    status: false,
    timeout: null,
    moneyColected: 0,
 
    steps: [ false, false, false, false, false, false, false ],
 
    cashObjects: [],
    primeDoorOpen: null,  
    primeDoor: null, 
    primeGate: null, 
    bomb: null,  
    ped: null, 
    pedMick: null,
  
    marker: null,
    pedKey: null,
    primeGateDown: null  
}; 
    
mp.events.add("entityStreamIn", entity => {

    if(entity != null && entity.type === 'ped' && rob.ped != null && entity == rob.ped) {
       
        setTimeout(() => { 
            entity.setProofs(false, false, false, false, false, false, false, false);
            entity.setInvincible(false);
            entity.setHealth(200); 
        }, 500);     
    } 
});
 
global.IsInRange = function(x, y, z, range) {   
    return (mp.game.gameplay.getDistanceBetweenCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, parseFloat(x), parseFloat(y), parseFloat(z), false) < parseInt(range) ? true : false);
};
 
mp.keys.bind(0x45, true, function() //KEY E
{   
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    if(IsInRange(-1207.270, -323.877, 37.859, 3) && !rob.steps[0]) { 
        return rpc.callServer('server::rob::start');
    }
 
    if(rob.ped != null && IsInRange(-1214.817, -337.115, 37.780, 3) && rob.steps[0] && rob.steps[1] && !rob.steps[2] && rob.status) { 
        rob.bomb = mp.objects.new("prop_c4_final_green", new mp.Vector3(-1214.4779, -336.9837, 37.6558), { rotation: new mp.Vector3(0, 65.6001, -66.8001), alpha: 255, dimension: mp.players.local.dimension });
        rob.steps[2] = true;

        rpc.callServer('server::rob::update', JSON.stringify({index: 2}));
 
        rob.timeout = setTimeout(() => { 
            mp.game.fire.addExplosion(-1214.4779, -336.9837, 37.6558, 2, 1.0, true, false, 20);

            if(rob.bomb != null) {
                rob.bomb.destroy();
                rob.bomb = null;
            }

            if(rob.primeGate != null) {
                rob.primeGate.destroy(); 
                rob.primeGate = null;

                rob.primeGateDown = mp.objects.new("prop_ld_jail_door", new mp.Vector3(-1212.8181, -337.168, 36.8112), { rotation: new mp.Vector3(-90.4002, 0, -65.6001), alpha: 255, dimension: mp.players.local.dimension });
            }
             
            if(rob.timeout != null) {
                clearTimeout(rob.timeout);
                rob.timeout = null;
            }  

            if(rob.pedKey == null) {
                rob.pedKey = mp.labels.new("Guard key code\nUse [E] to pickup", new mp.Vector3(rob.ped.position.x, rob.ped.position.y, rob.ped.position.z - 0.4), {
                    los: false,
                    font: 0,
                    drawDistance: 4,
                    scale: 0.1,
                    dimension: mp.players.local.dimension 
                });
            } 
        }, 5000); 
        return;
    } 

    if(rob.ped != null && IsInRange(rob.ped.position.x, rob.ped.position.y, rob.ped.position.z, 2) && rob.steps[0] && rob.steps[1] && rob.steps[2] && !rob.steps[3] && rob.status) {
        mp.game.audio.playSoundFrontend(-1, "Grab_Parachute", "BASEJUMPS_SOUNDS", false);

        rob.steps[3] = true; 
        rob.marker = mp.markers.new(2, new mp.Vector3(-1210.937, -336.514, 37.781), 0.5, { color: [191, 64, 191, 255], dimension: mp.players.local.dimension });
         
        return rpc.callServer('server::rob::update', JSON.stringify({index: 3}));
    }
 
    if(IsInRange(-1210.937, -336.514, 37.781, 2) && rob.steps[0] && rob.steps[1] && rob.steps[2] && rob.steps[3] && !rob.steps[4] && rob.status) {
      
        mp.gui.cursor.visible = true;  
        hideDashboard(false); 
 
        globalBrowser.execute(`app.trigger("showRob", true);`);  
        return globalBrowser.execute(`RobComponent.changeRobPage(${2}, ${JSON.stringify(rob.steps)});`);
    }

    if(IsInRange(-1206.795, -338.031, 37.759, 2) && rob.steps[0] && rob.steps[1] && rob.steps[2] && rob.steps[3] && rob.steps[4] && !rob.steps[5] && rob.status) {
 
        if(rob.moneyColected > 28)
            return;
 
        let index = rob.moneyColected;

        if(rob.cashObjects[index]) {
            rob.cashObjects[index].destroy();
            rob.cashObjects[index] = null;
        }

        if(rob.moneyColected >= 27) {
            mp.game.graphics.startScreenEffect('BeastTransition', 5000, false);

            rob.steps[5] = true;
            rpc.callServer('server::rob::update', JSON.stringify({index: 5}));
 
            const random = Math.floor(Math.random() * mickeyLocations.length); 
            rob.pedMick = mp.peds.new(mp.game.joaat('a_m_m_afriamer_01'), new mp.Vector3(mickeyLocations[random].x, mickeyLocations[random].y, mickeyLocations[random].z), mickeyLocations[random].heading, 0);
            rob.marker = mp.blips.new(480, new mp.Vector3(mickeyLocations[random].x, mickeyLocations[random].y, mickeyLocations[random].z), 0), { name: 'Mickey Rob', color: 3, shortRange: true } 
        } 
        rob.moneyColected ++;
    }

    if(rob.pedMick != null && IsInRange(rob.pedMick.position.x, rob.pedMick.position.y, rob.pedMick.position.z, 3) && rob.steps[5]) { 
        mp.game.audio.playSoundFrontend(-1, "CONFIRM_BEEP", "HUD_MINI_GAME_SOUNDSET", false);

        return mp.events.call("client::rob:end", true);
    }
});
 
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {

    const looking = mp.game.player.getEntityIsFreeAimingAt();

    if(looking)
    {
        mp.gui.chat.push('player weapon shot');
    }
 
    if(rob.status && looking == rob.ped.handle && !rob.steps[1]) {
        const isDead = mp.game.invoke("0x5F9532F3B5CC2551", rob.ped.handle);

        if(isDead) {
            rob.steps[1] = true;
            rpc.callServer('server::rob::update', JSON.stringify({index: 1})); 
        } 
    }
});
 
mp.events.add(
{
    "client::rob:open" : (page, data) =>
    {
        if(page == 1) {
            rob.primeDoor = mp.objects.new("v_ilev_gb_vauldr", new mp.Vector3(-1211.1632, -334.5356, 37.9212), { rotation: new mp.Vector3(0, 0, -63.2001), alpha: 255, dimension: mp.players.local.dimension });
            rob.primeGate = mp.objects.new("prop_ld_jail_door", new mp.Vector3(-1214.1929, -337.3996, 37.8925), { rotation: new mp.Vector3(0, 0, -63.2001), alpha: 255, dimension: mp.players.local.dimension });
            rob.ped = mp.peds.new(mp.game.joaat('s_m_m_armoured_02'), new mp.Vector3(-1215.168, -338.254, 37.780), 14.971, mp.players.local.dimension);
        
            rob.pedMick = null;
            rob.moneyColected = 0;
        }

        mp.gui.cursor.visible = true; 
        rob.status = true;

        hideDashboard(false); 
          
        globalBrowser.execute(`app.trigger("showRob", true);`);  
        return globalBrowser.execute(`RobComponent.changeRobPage(${page}, ${data});`);
    },

    "client::rob:end" : (type) => 
    {
        rob.status = false; 
        rob.steps = [ false, false, false, false, false, false, false ];

        if(rob.bomb != null) {
            rob.bomb.destroy();
            rob.bomb = null;
        }
    
        if(rob.primeDoor != null) {
            rob.primeDoor.destroy(); 
            rob.primeDoor = null; 
        }
    
        if(rob.primeDoorOpen != null) {
            rob.primeDoorOpen.destroy(); 
            rob.primeDoorOpen = null; 
        }
    
        if(rob.primeGate != null) {
            rob.primeGate.destroy(); 
            rob.primeGate = null; 
        }
    
        if(rob.primeGateDown != null) {
            rob.primeGateDown.destroy(); 
            rob.primeGateDown = null; 
        }
         
        if(rob.timeout != null) {
            clearTimeout(rob.timeout);
            rob.timeout = null;
        }  
    
        if(rob.pedKey != null) {
            rob.pedKey.destroy(); 
            rob.pedKey = null; 
        } 
    
        if(rob.marker != null) {
            rob.marker.destroy(); 
            rob.marker = null; 
        } 
    
        if(rob.ped != null) {
            rob.ped.destroy();
            rob.ped = null;
        }

        if(rob.pedMick != null) {
            rob.pedMick.destroy();
            rob.pedMick = null;
        }
            
        mp.gui.cursor.visible = false; 
        hideDashboard(true); 

        globalBrowser.execute(`app.trigger("showRob", false);`);  
  
        return rpc.callServer('server::rob::end', type);
    },

    "client::rob:update" : (page, data, index) =>
    {
        mp.gui.cursor.visible = false;
        rob.steps[index] = true;

        hideDashboard(true);

        if(index == 4) {
            if(rob.primeDoor != null) {
                rob.primeDoor.destroy();
                rob.primeDoor = null;
            }

            if(rob.primeDoorOpen == null) {
                rob.primeDoorOpen = mp.objects.new("v_ilev_gb_vauldr", new mp.Vector3(-1211.0902, -334.5918, 37.8772), { rotation: new mp.Vector3(0, 0, 0), alpha: 255, dimension: mp.players.local.dimension });  
            }

            if(rob.marker != null) {

                rob.marker.destroy(); 
                rob.marker = mp.markers.new(1, new mp.Vector3(-1206.795, -338.031, 37.759 - 0.85), 0.8, { color: [191, 64, 191, 255], dimension: mp.players.local.dimension });

                rob.cashObjects = [];
             
                for(let index = 0; index < money_objects[0].length; index ++) {
                    rob.cashObjects[index] = mp.objects.new("bkr_prop_money_sorted_01", new mp.Vector3(money_objects[0][index].x, money_objects[0][index].y, money_objects[0][index].z), { rotation: new mp.Vector3(money_objects[0][index].rot.x, money_objects[0][index].rot.y, money_objects[0][index].rot.z), alpha: 255, dimension: mp.players.local.dimension });
                } 
            } 
        }
 
        return globalBrowser.execute(`RobComponent.changeRobPage(${page}, ${data});`);
    },

    "client::rob:updateRobHud" : (time) =>
    {
        if(globalBrowser)
        {   
            return globalBrowser.execute(`RobComponent.time=${time};`);
        } 
    }, 
});   