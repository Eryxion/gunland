let localplayer = mp.players.local;
 
global.radar = {
    active: false,
    blocked: false,
    audio: true,
    camera: mp.cameras.new("gameplay"),
 
    result: []
};
 
global.streetsLimit = 
[
    "Joshua Rd", "East Joshua Road", "Marina Dr", "Alhambra Dr", "Niland Ave", "Zancudo Ave", "Armadillo Ave", "Algonquin Blvd", "Mountain View Dr", "Cholla Springs Ave", "Panorama Dr", "Lesbos Ln", "Calafia Rd", "Cassidy Trail", "Seaview Rd", "Grapeseed Main St", "Grapeseed Ave", "Joad Ln", "Union Rd", "O'Neil Way", "Sinner St", "Crosing Road LS", "Catfish View", "Paleto Blvd", "Duluoz Ave", "Procopio Dr", "Cascabel Ave", "Procopio Promenade", "Pyrite Ave", "Fort Zancudo Approach Rd", "Barbareno Rd", "Ineseno Road", "West Eclipse Blvd", "Playa Vista", "Bay City Ave", "Del Perro Fwy", "Equality Way", "Red Desert Ave", "Magellan Ave", "Sandcastle Way", "Vespucci Blvd", "Prosperity St", "San Andreas Ave", "North Rockford Dr", "South Rockford Dr", "Marathon Ave", "Boulevard Del Perro", "Cougar Ave", "Liberty St", "Bay City Incline", "Conquistador St", "Cortes St", "Vitus St", "Aguja St", "Goma St", "Melanoma St", "Palomino Ave", "Invention Ct", "Imagination Ct", "Rub St", "Tug St", "Ginger St", "Lindsay Circus", "Calais Ave", "Adam's Apple Blvd", "Alta St", "Integrity Way", "Swiss St", "Strawberry Ave", "Capital Blvd", "Crusade Rd", "Innocence Blvd", "Davis Ave", "Little Bighorn Ave", "Roy Lowenstein Blvd", "Jamestown St", "Carson Ave", "Grove St", "Brouge Ave", "Covenant Ave", "Dutch London St", "Signal St", "Elysian Fields Fwy", "Plaice Pl", "Chum St", "Chupacabra St", "Miriam Turner Overpass", "Autopia Pkwy", "Exceptionalists Way", "New Empire Way", "Runway1", "Greenwich Pkwy", "Kortz Dr", "Banham Canyon Dr", "Buen Vino Rd", "Route 68", "Zancudo Grande Valley", "Zancudo Barranca", "Galileo Rd", "Mt Vinewood Dr", "Marlowe Dr", "Milton Rd", "Kimble Hill Dr", "Normandy Dr", "Hillcrest Ave", "Hillcrest Ridge Access Rd", "North Sheldon Ave", "Lake Vinewood Dr", "Lake Vinewood Est", "Baytree Canyon Rd", "North Conker Ave", "Wild Oats Dr", "Whispymound Dr", "Didion Dr", "Cox Way", "Picture Perfect Drive", "South Mo Milton Dr", "Cockingend Dr", "Mad Wayne Thunder Dr", "Hangman Ave", "Dunstable Ln", "Dunstable Dr", "Greenwich Way", "Greenwich Pl", "Hardy Way", "Richman St", "Ace Jones Dr", "Los Santos Freeway", "Senora Rd", "Nowhere Rd", "Smoke Tree Rd", "Cholla Rd", "Cat-Claw Ave", "Senora Way", "Shank St", "Macdonald St", "Route 68 Approach", "Vinewood Park Dr", "Vinewood Blvd", "Mirror Park Blvd", "Glory Way", "Bridge St", "West Mirror Drive", "Nikola Ave", "East Mirror Dr", "Nikola Pl", "Mirror Pl", "El Rancho Blvd", "Fudge Ln", "Amarillo Vista", "Labor Pl", "El Burro Blvd", "Sustancia Rd", "South Shambles St", "Hanger Way", "Orchardville Ave", "Popular St", "Buccaneer Way", "Abattoir Ave", "Voodoo Place", "Mutiny Rd", "South Arsenal St", "Forum Dr", "Morningwood Blvd", "Dorset Dr", "Caesars Place", "Spanish Ave", "Portola Dr", "Edwood Way", "San Vitus Blvd", "Eclipse Blvd", "Gentry Lane", "Las Lagunas Blvd", "Power St", "Mt Haan Rd", "Elgin Ave", "Hawick Ave", "Meteor St", "Alta Pl", "Occupation Ave", "Carcer Way", "Eastbourne Way", "Rockford Dr", "Abe Milton Pkwy", "Laguna Pl", "Sinners Passage", "Atlee St", "Sinner St", "Supply St", "Amarillo Way", "Tower Way", "Decker St", "Tackle St", "Low Power St", "Clinton Ave", "Fenwell Pl", "Utopia Gardens", "Cavalry Blvd", "South Boulevard Del Perro", "Americano Way", "Sam Austin Dr", "East Galileo Ave", "Galileo Park", "West Galileo Ave", "Tongva Dr", "Zancudo Rd", "Movie Star Way", "Heritage Way", "Perth St", "Chianski Passage", "Lolita Ave", "Meringue Ln", "Strangeways Dr",

    //Autostrazi
    "Olympic Fwy",
    "Palomino Fwy",
    "Senora Fwy", 
    "Great Ocean Hwy", 
];
const speedLimits = {

    "Senora Fwy": 180,
    "Olympic Fwy": 180,
    "Palomino Fwy": 180,
    "Great Ocean Hwy": 180,
    "Los Santos Freeway": 180,

    "Atlee St": 90,
    "Sinner St": 90,
    "Supply St": 90,
    "Adam's Apple Blvd": 90,
    "Power St": 90,
    "Strawberry Ave": 90,  
};
 
const getLookingAtEntity = () => {
	 
    let position = radar.camera.getCoord();
    let direction = radar.camera.getDirection();
    let farAway = new mp.Vector3(direction.x * 120 + position.x, direction.y * 120 + position.y, direction.z * 120 + position.z);
    let object = mp.raycasting.testPointToPoint(position, farAway, [16] [2]);
    
    if(object && object.entity.model) {
        if(object.entity.isAVehicle()) { 
            return object.entity
        }
    }
  
	return null;
}

radar.Open = function() {
    if(radar.active) return;
     
    radar.active = true;
    return mp.events.add("render", radar.Render); 
};

radar.Close = function() { 
    radar.active = false;
    return mp.events.remove("render", radar.Render);
};
  
radar.Toggle = function() {

    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    if(!radar.active) { 
        radar.Open();
    }
    else { 
        radar.Close(); 
    }
};

// /givegun 0 weapon_marksmanpistol 1000
global.getSpeedLimit = function(entity)
{
    let getStreet = mp.game.pathfind.getStreetNameAtCoord(entity.position.x, entity.position.y, entity.position.z, 0, 0); 
    let streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); 
      
    return (global.streetsLimit.includes(streetName) ? speedLimits[streetName] : 0);
} 

radar.Render = function() { 
    if(!radar.active || localplayer.weapon != 3696079510 /* && radar.blocked || localplayer.weapon != 3696079510*/) return; //3696079510 = weapon_marksmanpistol

    const entity = getLookingAtEntity();
    const looking = mp.game.player.getEntityIsFreeAimingAt();
   
    if(entity != null && looking != null && entity != localplayer) 
    {   
        let speed = (entity.getSpeed() * 3.6).toFixed(0); 
        let speedLimit = getSpeedLimit(entity);
 
        let string = { 
            status: true,  
            speed: (entity.getSpeed() * 3.6).toFixed(0), 
            vehicle: mp.game.vehicle.getDisplayNameFromVehicleModel(entity.model), 
            distance: mp.game.gameplay.getDistanceBetweenCoords(localplayer.position.x, localplayer.position.y, localplayer.position.z, entity.position.x, entity.position.y, entity.position.z, true).toFixed(2)  
        }
 
        globalBrowser.execute(`HudComponent.updatePistolRadar(${JSON.stringify(string)}); HudComponent.limit=${speedLimit};`);     
   
        if(speed > 0 && speed >= speedLimit && speedLimit > 0) { 
            
            mp.game.audio.playSoundFrontend(-1, "5_Second_Timer", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS", false); 
            mp.gui.cursor.visible = true;
            
            const driver = mp.players.toArray().find((user) => user.vehicle === entity); 

            radar.blocked = true;
            radar.result = 
            {
                vehicle: entity,
                driver: (driver != undefined ? driver : undefined),
                speed: speed,
                limit: speedLimit
            } 
 
            return radar.blocked = true;
        }

        radar.blocked = false; 
    } 

    if(!radar.blocked) {
        globalBrowser.execute(`HudComponent.radar.status=${looking != null && entity != null ? true : false};`);   
    }
};
   
mp.events.add("client::radar:open", function() {
	return radar.Toggle(); 
});

mp.events.add("client::radar:close", function() {
	return radar.Close(); 
});
 
mp.events.add("client::radar:unblock", function() {
	
    radar.blocked = false;
    radar.result = []; 

    mp.gui.cursor.visible = false;  
});

rpc.register('GET_RADAR_DATA', () => 
{
    return radar.result;
});  