 
let interractMenu = {}
var AxRadialMenu = 
{
    "KeepInput" : false,
    "Menus" : {
        0 : {
            "shoudclose" : false,
            "label" : "Player",
            "option": 'player',
            "icon" : "./assets/images/user.png",
            "entity": true,
            "submenu" : [
                {
                    "shoudclose" : true,
                    "label" : "Trade",
                    "submenu" : false,
                    "icon" : "./assets/images/trade.png",
                    "type" : "client",
                    "event" : "client::interract:actionPlayer",
                    "parameter" : "trade",
                },
                {
                    "shoudclose" : true,
                    "label" : "Pay",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "client::interract:actionPlayer",
                    "icon" : "./assets/images/pay.png",
                    "parameter" : "pay",
                }, 
                {
                    "shoudclose" : true,
                    "label" : "Invite group",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "client::interract:actionPlayer",
                    "icon" : "./assets/images/invite_group.png",
                    "parameter" : "invite",
                },
                {
                    "shoudclose" : true,
                    "label" : "Arrest",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "client::interract:arrestPlayer",
                    "icon" : "./assets/images/arrest.png",
                    "parameter" : "arrest",
                },
                {
                    "shoudclose" : true,
                    "label" : "Cuff",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "client::interract:cuffPlayer",
                    "icon" : "./assets/images/cuff.png",
                    "parameter" : "cuff",
                } 
            ]
        },
        1 : {
            "shoudclose" : false,
            "label" : "House",
            "option": 'house',
            "icon" : "./assets/images/home.png",
            "entity": true,
            "submenu" : [
                {
                    "shoudclose" : false,
                    "label" : "Give Keys",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "qb-houses:client:giveHouseKey",
                    "icon" : "fas fa-key"
                },
                {
                    "shoudclose" : false,
                    "label" : "Remove Key",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "qb-houses:client:removeHouseKey",
                    "icon" : "fas fa-key"
                },
                {
                    "shoudclose" : false,
                    "label" : "Toggle Lock",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "qb-houses:client:toggleDoorlock",
                    "icon" : "fas fa-key"
                },
                {
                    "shoudclose" : true,
                    "label" : "Decorate House",
                    "submenu" : false,
                    "type" : "client",
                    "event" : "qb-houses:client:decorate",
                    "icon" : "fas fa-wallet"
                },
                {
                    "shoudclose" : false,
                    "label" : "House Options",
                    "icon" : "fas fa-wallet",
                    "submenu" : [
                        {
                            "shoudclose" : false,
                            "label" : "Set Stash",
                            "submenu" : false,
                            "type" : "client",
                            "event" : "qb-houses:client:setLocation",
                            "icon" : "fas fa-wallet",
                            "parameter" : {"id" : "setstash"}
                        },
                        {
                            "shoudclose" : false,
                            "label" : "Set Wardrobe",
                            "submenu" : false,
                            "type" : "client",
                            "event" : "qb-houses:client:setLocation",
                            "icon" : "fas fa-wallet",
                            "parameter" : {"id" : "setoutift"}
                        },
                        {
                            "shoudclose" : false,
                            "label" : "Set Logout",
                            "submenu" : false,
                            "type" : "client",
                            "event" : "qb-houses:client:setLocation",
                            "icon" : "fas fa-wallet",
                            "parameter" : {"id" : "setlogout"}
                        }
                    ]
                }
            ]
        },
        2 : {
            "shoudclose" : false,
            "label" : "Work",
            "submenu" : [],
            "entity": false,
            "icon" : "./assets/images/briefcase.png",
        },
        3 : {
            "shoudclose" : false,
            "label" : "Vehicle",
            "option": 'vehicle',
            "icon" : "./assets/images/vehicle.png",
            "entity": true,
            "submenu" : [  

                {
                    "shoudclose" : true,
                    "label" : "Lock/Unlock",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "lock",
                    "icon" : "./assets/images/vehlock.png",
                },
        
                {
                    "shoudclose" : true,
                    "label" : "Light",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "light",
                    "icon" : "./assets/images/headlight.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Hood",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "hood",
                    "icon" : "./assets/images/hood.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Trunk",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "trunk",
                    "icon" : "./assets/images/trunk.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Fill vehicle",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "fill",
                    "icon" : "./assets/images/gas.png",
                }, 

                {
                    "shoudclose" : true,
                    "label" : "Windows",
                    "submenu" : false,
                    "event" : "client::interract:actionVehicle",
                    "type" : "client",
                    "parameter" : "windows",
                    "icon" : "./assets/images/window.png",
                }, 
            ]
        },
        
        4 : {
            "shoudclose" : false,
            "label" : "Emotes",
            "option": 'Emotes',
            "icon" : "./assets/images/emotions.png",
            "entity": false,
            "submenu" : [
                {
                    "shoudclose" : true,
                    "label" : "Middle Finger",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "middlefinger",
                    "type" : "client",
                    "icon" : "./assets/images/middle-finger.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Dance",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "dance",
                    "type" : "client",
                    "icon" : "./assets/images/dance.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Hands UP",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "handsup",
                    "type" : "client",
                    "icon" : "./assets/images/handsup.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Stop",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "stop",
                    "type" : "client",
                    "icon" : "./assets/images/stop.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Peace",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "peace",
                    "type" : "client",
                    "icon" : "./assets/images/peace.png",
                },
                {
                    "shoudclose" : true,
                    "label" : "Salute",
                    "submenu" : false,
                    "event" : "client::interract:actionEmote",
                    "parameter" : "salute",
                    "type" : "client",
                    "icon" : "./assets/images/salute.png",
                }
            ]
        }
    },
}

var lastThis = null;

interractMenu.Close = function()
{ 
    $('.menu').fadeOut();
    $('.hexagon').off();

    interractMenu.PreviousMenu = undefined;
    interractMenu.CurrentMenu = undefined;

    lastThis = null;

    return mp.trigger("client::interract:exit");  
}

 
function openInterractMenu()
{
    interractMenu.HomeMenu =  JSON.stringify(AxRadialMenu.Menus);
    interractMenu.PreviousMenu = undefined;
    interractMenu.CurrentMenu = undefined;
      
    return interractMenu.SetupMenu(JSON.stringify(AxRadialMenu.Menus)); 
}
 
interractMenu.SetupMenu = function(data)
{ 
    const raw = JSON.parse(data);
 
    interractMenu.CurrentMenu = data;
    interractMenu.Reset()
     
    $.each(raw, function(x, index) 
    {   
        x ++;
 
        $('#label-'+ x).html(index.label);
        $('.hex-'+ x).data(index);

        $('.i-'+ x).show(); 
        $('.i-'+ x).attr('src', index.icon);
 
        $('.hex-'+ x).click(function()
        {
            var menu = $(this).data()
            if(menu.submenu == false)
            {  
                console.log('Execute event' + menu.event);

                if(menu.event)
                {
                    mp.trigger(menu.event, menu.parameter);  
                }

                if(menu.shoudclose) 
                { 
                    interractMenu.Close()  
                }
            }
            else
            {     
                //Seteaza ID-u pentru a-i da show dupa ce selecteaza entitatea.
                lastThis = menu.submenu; 

                if(menu.entity == true)
                { 
                    $('.menu').hide();

                    mp.trigger("client::interract:selectEntity", menu.option);  
 
                    //entitySelectedShowInterract() 
                } 
                else 
                {
                    interractMenu.PreviousMenu = interractMenu.CurrentMenu;
                    interractMenu.CurrentMenu = menu.submenu;
     
                    return interractMenu.SetupMenu(JSON.stringify(menu.submenu)); 
                }  
            }
        });
    });
} 

function entitySelectedShowInterract()
{
    $('.show').hide();
 
    interractMenu.PreviousMenu = interractMenu.CurrentMenu;
    interractMenu.CurrentMenu = lastThis;

    interractMenu.SetupMenu(JSON.stringify(lastThis)); 
}
 
interractMenu.Reset = function()
{
    for (i = 0; i < 7; i++) 
    {
        $('#label-'+ i).html('')
        $('.hex-'+ i).data('') 
        
        $('.i-'+ i).hide(); 
    };
    $('.hexagon').off()
    
    $('.close').click(function()
    {  
        if(interractMenu.CurrentMenu == interractMenu.HomeMenu)
        {  
            interractMenu.Close()
        }
        else if(interractMenu.CurrentMenu == interractMenu.PreviousMenu)
        { 
            interractMenu.SetupMenu(interractMenu.HomeMenu); 
        }
        else
        {   
            interractMenu.SetupMenu(interractMenu.PreviousMenu)
        } 
    });
    
    if(interractMenu.CurrentMenu == interractMenu.HomeMenu)
    {
        $('.i-close').attr('class','i-close fa fa-times fa-2x');$('#label-close').html('Close')
    }
    else
    {
        $('.i-close').attr('class','i-close fas fa-chevron-circle-right fa-2x');$('#label-close').html('Back')
    }
 
    $('.menu').hide();
    setTimeout(function(){$('.menu').fadeIn(500)},100)
} 