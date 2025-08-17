const player = mp.players.local;

const distance = 2.7; 
const height = 0.7;

let specCam = null;
let target = null;
  
global.drawStringSpectate = null;
 
mp.events.add('AdminTools:Spectate', (targetId) => { 
    if(specCam) stopSpectate();
 
    player.freezePosition(true);
    player.setAlpha(0);
    player.setInvincible(true);
  
    var interval = setInterval(() => {
        mp.players.forEach(p => { if(p.remoteId === targetId) target = p; });
        if(target) {
         
            const pos = target.position;
            const forward = target.getForwardVector();
 
            specCam = mp.cameras.new("admintools_spectate", new mp.Vector3(pos.x - forward.x * distance, pos.y - forward.y * distance, pos.z + height), new mp.Vector3(0, 0, 0), 75);
 
            specCam.pointAt(target.handle, 0, 0, 0, false);
 
            specCam.setActive(true);
            mp.game.cam.renderScriptCams(true, false, 0, true, false);

            clearInterval(interval);
        }
    }, 10);
 
    setTimeout(() => {
        if(interval) clearInterval(interval);
    }, 5000);
})
 
function stopSpectate() {
    if(specCam) {
 
        player.freezePosition(false);
        player.resetAlpha();
        player.setInvincible(false);
 
        mp.game.cam.renderScriptCams(false, false, 0, true, true);
        specCam.setActive(false);
        specCam.destroy();
        mp.game.cam.destroyAllCams(true); 

        if(drawStringSpectate != null)
        {
            drawStringSpectate.destroy();
            drawStringSpectate = null;
        }
        
        specCam = null;
        return;
    }
}
 
function updateCamPosition() {
    if(!specCam || target === null) return;

    const pos = target.position;
    const forward = target.getForwardVector();

    player.position = new mp.Vector3(pos.x, pos.y, pos.z + 50);
 
    specCam.setCoord(pos.x - forward.x * (target.vehicle ? 3 : 2.7), pos.y - forward.y * (target.vehicle ? 5 : 2.7), pos.z + (target.vehicle ? 2 : 0.7)); 
    specCam.pointAt(target.handle, 0, 0, 0, false);
}

global.fmHoursMinutesSeconds = function(seconds) {
    return [
        parseInt(seconds / 60 / 60),
        parseInt(seconds / 60 % 60),
        parseInt(seconds % 60)
    ]
    .join(":")
    .replace(/\b(\d)\b/g, "0$1")
},
 
mp.events.add('render', () => {
    if(specCam) { 
        if(mp.game.ui.isPauseMenuActive() || !mp.system.isFocused) return;
  
        updateCamPosition();
         
        if(target) 
        {
            player.position = new mp.Vector3(target.position.x, target.position.y, target.position.z + 50);
 
            let raw = JSON.parse(player.getVariable('spectatePlayer'));
    
            if(drawStringSpectate == null) {
                drawStringSpectate = mp.game.graphics.drawText(`${raw.name} (level: ${raw.level}, ${fmHoursMinutesSeconds(raw.hours)} hours)~n~Health: ${target.getHealth()}~n~Jailed: ${!raw.jailed ? 'no' : raw.jailed}~n~State: ${target.vehicle ? `In vehicle (id: ${target.vehicle.id})` : 'on foot'}`, [0.5, 0.9], { 
                    font: 0, 
                    color: [255, 255, 255, 185], 
                    scale: [0.3, 0.3], 
                    outline: true
                });
            } 
            else {
                drawStringSpectate.text = `${raw.name} (level: ${raw.level}, ${fmHoursMinutesSeconds(raw.hours)} hours)~n~Health: ${target.getHealth()}~n~Jailed: ${!raw.jailed ? 'no' : raw.jailed}~n~State: ${target.vehicle ? `In vehicle (id: ${target.vehicle.id})` : 'on foot'}`;
            }
        }
    }
}) 


mp.events.add('client::spectating:stop', () => {
    stopSpectate();

    return mp.events.callRemote("server::spectating:stop");
}); 