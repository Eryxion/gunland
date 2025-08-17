let dmvblip = null;
let dmvcheckpoint = null; 

const dmv_route = 
[ 
    [-191.238, -2003.605, 27.443],  
    [-153.891, -2003.412, 22.706],  
    [-156.964, -1947.514, 23.907],  
    [-159.404, -1914.789, 24.790],  
    [-237.103, -1851.025, 28.938],  
    [-266.427, -1824.163, 27.875],  
    [-357.442, -1820.377, 22.696],  
    [-471.974, -1866.827, 17.798],  
    [-582.606, -1891.489, 28.483],  
    [-707.116, -1848.990, 27.024],  
    [-742.997, -1771.253, 29.152],  
    [-750.453, -1677.810, 28.358],  
    [-696.932, -1627.378, 23.504],  
    [-613.823, -1707.941, 23.898],  
    [-517.594, -1774.159, 21.129],  
    [-425.816, -1771.613, 20.465],  
    [-406.630, -1819.341, 20.924],  
    [-365.260, -1832.794, 22.296],  
    [-223.202, -1868.990, 28.599],  
    [-162.850, -1942.840, 24.246],  
    [-177.460, -2004.680, 25.605],  
    [-193.132, -1938.928, 27.442], 
    [-204.347, -1956.265, 27.442], 
];
 
mp.keys.bind(0x45, true, function() //KEY E
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    return mp.events.callRemote("server::driving::startExamen");  
});
  
mp.events.add({

    "client:driving::examen:start" : (data, option = true) =>
    {  
        mp.gui.cursor.visible = true;    
        hideDashboard(false);

        if(option)
        {
            mp.events.call("client::npc:attachCamera", JSON.stringify({x: -211.815, y: -1927.249, z: 27.769, heading: -62.784})); 
        }
  
        globalBrowser.execute(`app.trigger("showDriving", true);`);   
        return globalBrowser.execute(`DrivingComponent.open(${data}, ${option})`); 
    },
    
    "client:driving::examen:close" : () =>
    {  
        mp.gui.cursor.visible = false;    
        hideDashboard(true);
 
        mp.events.call("client::npc:detachCamera"); 
    
        return globalBrowser.execute(`app.trigger("showDriving", false);`);  
    },

    "client::driving::createCheckpoint" : (c) =>
    {
        dmvcheckpoint = mp.checkpoints.new(c == dmv_route.length - 1 ? 4 : 1, new mp.Vector3(dmv_route[c][0], dmv_route[c][1], dmv_route[c][2] - 2), 5,
        {
            direction: c != dmv_route.length - 1 ? new mp.Vector3(dmv_route[c + 1][0], dmv_route[c + 1][1], dmv_route[c + 1][2]) : null, color: [255, 255, 255, 255], visible: true, dimension: 0
        });

        dmvblip = mp.blips.new(1, new mp.Vector3(dmv_route[c][0], dmv_route[c][1], dmv_route[c][2]),
        {
            name: 'Checkpoint for DMV', scale: 1, color: 1, alpha: 255, shortRange: false, dimension: 0,
        });

        dmvblip.setRoute(true); 
    },

    "client::driving::destroyCheckpoint" : () =>
    { 
        dmvblip.setRoute(false);
        dmvblip.destroy(); 
    
        dmvcheckpoint.destroy();
        dmvcheckpoint = null; 
    },

    "playerEnterCheckpoint" : (checkpoint) =>
    { 
        if(checkpoint == dmvcheckpoint) 
        {
            return mp.events.callRemote("server::driving::enterCheckpoint");
        }
    }
}); 