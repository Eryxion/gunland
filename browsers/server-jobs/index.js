let jobMenuOpened = false; 
global.npcCam = false; 
   
global.jobPoint = 
{
    position: { x: 0, y: 0, z: 0 },
    shape: false,
    marker: -1,
    job: -1,
}
 
global.jobBlip = null;
global.jobMarker = null;
global.jobShape = null;

function getCameraOffset(pos, angle, dist) 
{ 
    angle = angle * 0.0174533;

    pos.y = pos.y + dist * Math.sin(angle);
    pos.x = pos.x + dist * Math.cos(angle);  
    return pos;
}
 
mp.keys.bind(0x45, true, function() //KEY E
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible)
        return;
 
    return mp.events.callRemote("client::job:interractJob"); 
});
 
mp.events.add({  

    "client::job:openMenu" : (position, data) =>
    {    
        if(!jobMenuOpened)
        { 
            jobMenuOpened = true;
            mp.gui.cursor.visible = true;  
            hideDashboard(false);

            mp.events.call("client::npc:attachCamera", position); 
  
            globalBrowser.execute(`app.trigger("showJobMenu", true);`); 
 
            return globalBrowser.execute(`JobMenuComponent.open(${JSON.stringify(data)})`); 
        } 
    },

    "client::npc:attachCamera" : (position) =>
    {
        position = JSON.parse(position);  

        mp.players.local.setAlpha(0);
    
        npcCam = mp.cameras.new('default', getCameraOffset(new mp.Vector3(position.x, position.y, position.z + 0.6), position.heading + 90, 1.4), new mp.Vector3(0, 0, 0), 50); 
        npcCam.pointAtCoord(position.x, position.y, position.z + 0.6);
        npcCam.setActive(true); 
        mp.game.cam.renderScriptCams(true, false, 500, true, false);
    },

    "client::npc:detachCamera" : () =>
    {
        if(npcCam)
        {
            npcCam.destroy();
            npcCam = false;  
        }

        mp.players.local.setAlpha(255);
        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 
    },

    "client::job:closeMenu" : () =>
    {   
        if(jobMenuOpened)
        {
            jobMenuOpened = false;
            mp.gui.cursor.visible = false;  
            hideDashboard(true);   
 
            if(npcCam)
            {
                npcCam.destroy();
                npcCam = false;  
            }
    
            mp.players.local.setAlpha(255);
            mp.game.cam.renderScriptCams(false, false, 3000, true, true); 
      
            return globalBrowser.execute(`app.trigger("showJobMenu", false);`); 
        } 
    },
 
    'playerEnterColshape' : (shape) => 
    { 
        try
        {
            const player = mp.players.local; 

            if(jobShape != null && jobShape == shape && jobPoint.shape)
            { 
                switch(jobPoint.job)
                {
                    case 3: 
                    {
                        if(player.vehicle)
                            return;
    
                        hideDashboard(false);
                        mp.gui.cursor.visible = true; 
 
                        global.interfaceOpened = true;
                        globalBrowser.execute(`app.trigger("showElectrician", true);`); 
                        break;
                    }
    
                    case 4: 
                    {
                        mp.events.callRemote("server::job:trucker:showCourses"); 
                        break;
                    }
    
                    default: break;
                } 
            }
        }
        catch(e) { console.log(e) } 
    },
 
    'client::job:blip:create' : (data) =>
    {
        const raw = JSON.parse(data);

        if(jobBlip != null)
        {
            jobBlip.destroy();
            jobBlip = null;
        }

        if(jobMarker != null)
        {
            jobMarker.destroy();
            jobMarker = null;
        }

        if(jobShape != null)
        {
            jobShape.destroy();
            jobShape = null;
        }

        if(raw.shape)
        {
            jobShape = mp.colshapes.newSphere(raw.position.x, raw.position.y, raw.position.z, 2.0, 0); 
        } 

        global.jobPoint = 
        {
            position: raw.position,
            shape: raw.shape,
            marker: raw.marker,
            job: raw.job,
        }

        jobMarker = mp.markers.new(raw.marker, new mp.Vector3(raw.position.x, raw.position.y, raw.position.z), (raw.job == 4 ? 3 : 1), { color: [255, 0, 255, 100], dimension: 0 });
        jobBlip = mp.blips.new(1, new mp.Vector3(raw.position.x, raw.position.y, raw.position.z), { name: 'Job Blip', color: 3, shortRange: true, scale: 1, alpha: 255 }); 
         
        return jobBlip.setRoute(true);     
    },

    'client::job:blip:destroy' : () =>
    {
        if(jobBlip != null)
        {
            jobBlip.destroy();
            jobBlip = null;
        }

        if(jobMarker != null)
        {
            jobMarker.destroy();
            jobMarker = null;
        }

        if(jobShape != null)
        {
            jobShape.destroy();
            jobShape = null;
        }

        global.jobPoint = 
        {
            position: { x: 0, y: 0, z: 0 },
            shape: false,
            marker: -1,
            job: -1,   
        }
    },

    'client::job:electrician:hide' : () =>
    {
        hideDashboard(true);
        mp.gui.cursor.visible = false; 

        global.interfaceOpened = false;
        return globalBrowser.execute(`app.trigger("showElectrician", false);`); 
    }
});

