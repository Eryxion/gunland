const { CommandRegistry } = require("../server-global/improved-commands"); 

CommandRegistry.add({
    name: "scenario", 
      
    beforeRun: function (player) {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        return true;
    },
    run: function (player, _, scenario) {
 
        return player.call('client::server::playScenario', [scenario]); 
    }
});  
 
CommandRegistry.add({
    name: "object", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        return true;
    },
    run: function (player) 
    { 
        player.playAnimation("anim@heists@box_carry@", "idle", 4.0, 49);  
  
        return createObject(player, 'v_res_filebox01', player.position, player.rotation, 255, player.dimension, 0, -0.0500,  0.3800, 0.2300, -2.0000, 1.0000, 0.0000);
    }
});  

global.destroyObject = function(player)
{
    if(player.createdObject)
    {
        player.setVariable('attachedObjectID', null);

        player.createdObject.destroy();
        player.createdObject = null;
    }
}
 
global.createObject = function(player, model, position, rotation, alpha, dimension, bonne, offsetX, offsetY, offsetZ, rotX, rotY, rotZ)
{  
    player.createdObject = mp.objects.new(model, new mp.Vector3(position.x, position.y, position.z - 10), { rotation: rotation, alpha: alpha, dimension: dimension });
  
    player.setVariable("attachedObject", JSON.stringify({object: player.createdObject, Model: model, Bone: bonne, offsetX: offsetX, offsetY: offsetY, offsetZ: offsetZ, rotX: rotX, rotY: rotY, rotZ: rotZ}));
 
    player.call('attachObjectPula', [player]);

    return player.setVariable("attachedObjectID", player.createdObject);
} 