const { CommandEvents, CommandRegistry } = require("../../server-global/improved-commands"); 
 
mp.events.add({   
    "playerDeath" : (player, reason, killer) => 
    { 
        if(killer != undefined && killer.group == 3 && killer.haveTarget && killer.haveTargetIs === player)
        {
            const index = serverFactions[2].contracts.findIndex(object => object.assasin === killer.name);

            if(index != -1)
            {  
                if(serverFactions[2].contracts[index].type === 'SILENT' || serverFactions[2].contracts[index].type === 'BRUTAL')
                { 
                    sendGroup(3, '800000', `${killer.name} [#${killer.id}] ${(killer.dist(player.position).toFixed(0) >= 150 && serverFactions[2].contracts[index].type === 'SILENT') || (serverFactions[2].contracts[index].type === 'BRUTAL') ? 'finished' : 'failed'} his contract on player ${player.name} [#${player.id}] (distance: ${killer.dist(player.position).toFixed(0)}m contract type: ${serverFactions[2].contracts[index].type == 'SILENT' ? '<span style="color:#ff6600;">SILENT</span>' : '<span style="color:#80aaff;">BRUTAL</span>'} price: <span style="color:#019e57;">$${formatMoney(serverFactions[2].contracts[index].price)}</span>).`)
                    killer.pushChat('800000', 'local', `Your contract on ${player.name} [#${player.id}] has been ${(killer.dist(player.position).toFixed(0) >= 150 && serverFactions[2].contracts[index].type === 'SILENT') || (serverFactions[2].contracts[index].type === 'BRUTAL') ? 'finished' : 'failed'} (distance: ${killer.dist(player.position).toFixed(0)}m contract type: ${serverFactions[2].contracts[index].type == 'SILENT' ? '<span style="color:#ff6600;">SILENT</span>' : '<span style="color:#80aaff;">BRUTAL</span>'} price: <span style="color:#019e57;">$${formatMoney(serverFactions[2].contracts[index].price)}</span>).`);
                
                    if(killer.dist(player.position).toFixed(0) >= 150 && serverFactions[2].contracts[index].type === 'SILENT')
                    {
                        killer.giveMoney(0, serverFactions[2].contracts[index].price); 
                    }

                    if(serverFactions[2].contracts[index].type === 'BRUTAL')
                    {
                        killer.giveMoney(0, serverFactions[2].contracts[index].price); 
                    } 
                } 
 
                return finishContract(killer, killer.dist(player.position).toFixed(0));
            } 
        } 
    },

    "playerQuit" : (player, exitType, reason) =>
    {
        if(player.loggedInAs) 
        { 
            const index = serverFactions[2].contracts.findIndex(object => object.name === player.name);
  
            if(index != -1 || index == undefined)
            {   
                const assasin = mp.players.toArray().find((user) => user.name === serverFactions[2].contracts[index].assasin); 
 
                if(assasin != undefined)
                { 
                    cancelContract(assasin, 0);
                }
 
                return serverFactions[2].contracts.splice(index, 1); 
            }

            if(player.haveTarget)
            {
                const haveTarget = serverFactions[2].contracts.findIndex(object => object.assasin === player.name);

                if(haveTarget != -1 || haveTarget == undefined)
                {
                    serverFactions[2].contracts[haveTarget].status = false;
                    serverFactions[2].contracts[haveTarget].assasin = '';
                }
            }
        }  
    },
  
    "server::hitman:getContract" : (player, index) =>
    {
        const user = mp.players.toArray().find((user) => user.name === serverFactions[2].contracts[index].name); 

        if(user == -1 || user == undefined)
        {
            sendNotiffication(player, 'info', 'This player left the server.');
            return player.call('client::hitman:showMenu', [JSON.stringify(serverFactions[2].contracts)]);
        }

        if(serverFactions[2].contracts[index].status)
        {
            sendNotiffication(player, 'info', 'This contract has been already in progress.'); 
            return player.call('client::hitman:showMenu', [JSON.stringify(serverFactions[2].contracts)]);
        }
 
        player.call('client::hitman:closeMenu', []);

        serverFactions[2].contracts[index].status = true;
        serverFactions[2].contracts[index].assasin = player.name;
        
        player.haveTarget = true;
        player.haveTargetIs = user;
        player.setVariable('haveTarget', true);

        player.model = mp.joaat('mp_m_bogdangoon');
 
        player.giveWeapon(mp.joaat('weapon_pistol_mk2'), 1000); 
        player.giveWeapon(mp.joaat('weapon_knife'), 1000);
        player.giveWeapon(mp.joaat('weapon_sniperrifle'), 1000);

        setFinding(player, user);
        
        player.pushChat('800000', 'local', `(Hitman):</span> Your target is ${serverFactions[2].contracts[index].name}, assassinate him as quickly as possible following the steps in the contract.`);
 
        return player.call('client::hitman:showData', [JSON.stringify({show: true, type: (serverFactions[2].contracts[index].type === 'SILENT' ? 1 : 0), eqquiped: true, assasinate: false, distance: false})]);
    },
}); 
 
global.finishContract = function(player, distance)
{ 
    const index = serverFactions[2].contracts.findIndex(object => object.assasin === player.name);

    player.haveTargetIs = null;
    player.haveFinding = false;
    player.haveTarget = false;
    player.setVariable('haveTarget', false);
     
    player.removeAllWeapons(); 

    player.call('client::checkpoint:destroy', []);
    player.call('client::hud:showFinding', [false, '']);
     
    if(index != -1)
    {
        player.call('client::hitman:showData', [JSON.stringify({show: true, type: (serverFactions[2].contracts[index].type === 'SILENT' ? 1 : 0), eqquiped: true, assasinate: true, distance: (distance >= 150 ? true : false)})]);

        serverFactions[2].contracts.splice(index, 1); 
    }   
}

global.cancelContract = function(player, type)
{
    if(type == 1)
    {
        const index = serverFactions[2].contracts.findIndex(object => object.assasin === player.name);

        if(index != -1)
        {
            serverFactions[2].contracts[index].status = false;
            serverFactions[2].contracts[index].assasin = '';
        }
    }

    player.haveTargetIs = null;
    player.haveFinding = false;
    player.setVariable('haveTarget', false);
     
    player.removeAllWeapons(); 

    serverReloadCharacter(player);

    player.call('client::checkpoint:destroy', []);
    player.call('client::hud:showFinding', [false, '']);
    player.call('client::hitman:showData', [JSON.stringify({show: false, type: 0, eqquiped: true, assasinate: false, distance: false})]);

    return player.haveTarget = false;
} 
  
global.hitmanPlaceContract = function(player, target, price, type)
{
    //3 - reprezinta id-ul factiunei hitman din JSON (nu din DB)
    let date = new Date();
    let minutes = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let hours = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());

    serverFactions[2].contracts.push({name: target.name, price: price, status: false, assasin: '', type: (type ? 'SILENT' : 'BRUTAL'), time: (hours + ':' + minutes)});
 
    return sendGroup(3, 'ffb84d', `(New Contract): ${player.name} [#${player.id}] placed a ${type ? '<span style="color:#ff6600;">SILENT</span>' : '<span style="color:#80aaff;">BRUTAL</span>'} contract on ${target.name} [#${target.id}] (price: $${formatMoney(price)}).`);
}

global.hitmanGetContract = function(player)
{
    if(!Object.keys(serverFactions[2].contracts).length)
        return sendNotiffication(player, 'info', 'There is currently no contract available.');
 
    return player.call('client::hitman:showMenu', [JSON.stringify(serverFactions[2].contracts)]);
}

CommandRegistry.add({
    name: "cancelhit", 
    
    run: function (player) 
    {
        if(player.info.group != 3)
            return sendNotiffication(player, 'info', 'You are not in Hitman faction.'); 

        if(!player.haveTarget)
            return sendNotiffication(player, 'info', 'You dont have a target'); 
 
        sendNotiffication(player, 'success', 'Your contract has been canceled.');

        return cancelContract(player, 1);
    }
});
 
global.setFinding = function(player, target)
{
    player.haveFinding = target;

    player.call('client::checkpoint:findPlayer', [0, target.position.x, target.position.y, target.position.z]); 
    return player.call('client::hud:showFinding', [true, `${target.name} (distance: ${player.dist(new mp.Vector3(target.position)).toFixed(0)}m)`]);
}

 

/*js

    GENERAL UPDATES

        - Schimbat meniul de interactiune cu un job
        - Acum cand apesi E la un job iti va pune o camera pe NPC-ul de acolo
        - Acum daca vehiculul de la job este distrus vei fii scos automat de la munca
        - Acum cand intri intr-o casa iti va da VirtualWorld de la ID-ul casei
        - Cand trimiti un mesaj pe chatul local doar jucatorii cu acealasi VirtualWorld ca al tau il vor vedea
        - Rezolvat un mic bug la chat
        - Acum daca mori si muncesti munca ta va fii oprita
        - Daca un jucator are un obiect atasat si se deconecteaza acesta va fii sters
        - Acum poti deschide profilul tau folosind comanda /stats
        - Rezolvat un bug la salvarea unor chestii din profil
        - Adaugat jobul "Courier":
            - Poti incepe munca la acest job apasand tasta e
            - Cand incepi munca primesti colete random (minim 1 colet maxim cate case sunt pe server)
            - Coletele trebuie livrate la case 
            - Pentru a lua un colet din masina apesi tasta 'E' iar pentru a-l preda apesi tot tasta 'E' 
            - Cand ai terminat coletele poti merge la depozit si poti lua altele folosind tasta 'E'


    FACTIONS GENERAL: 
        - Acum cand intri in raza unei factiuni iti vor aparea mici detalii pe ecran
        - Adaugata comanda /setgroup (group ID) pentru adminii level 6+
        - Jucatorii care nu au factiune nu pot intra intr-o masina de factiune
        - Cand o masina de factiune este distrusa aceasta va fii respawnata inapoi la sediu
      

    LOS SANTOS POLICE:
        - Adaugat optiunea de cuff pentru politisti (jucatorului i-se va bloca tastatura si va urmari automat politistul)
        - Adaugata optiunea de arest pentru politisti
        - Polistii se pot echipa (ON DUTY) / (OFF DUTY) in HQ si primesc skin de politist sau skinu normal (dupa caz)
        - Adaugata comanda /unjail pentru admini
        - Acum playerii din jail au un skin specific
        - Adaugata comanda /so [player] pentru a soma un jucator pe o raza de 20M

        - Adaugat 'Police Computer':
            - Poti cauta un player dupa nume si iti vor aparea mici detalii despre acesta
            - Poti suspenda licentele (driving / motorbike)
            - Poti emite un wanted pe numele acestuia
            - Poti vizualiza playerii cu wanted de pe server
            - Poti vizualiza playerii ce sunt arestati (in jail)
        
  
    HITMAN: 
        - Adaugata posibilitatea de a pune un player pe lista Hitmanilor
        - Un jucator nu poate pune contract pe un player ce este deja in lista Hitman
        - Hitmanii pot lua un contract din incinta HQ-ului
        - Acum cand tinta iese de pe server se anuleaza contractul.
        - Cand Hitmanul ia "un contract" primeste automat armele (weapon_sniperrifle / weapon_pistol_mk2 / weapon_knife)
        - Acum cand ai un contract numele tau nu va mai fii vizibil. 
        - Cand Hitmanul ia un contract va primi un skin specific
        - Daca Hitmanul are un contract si se deconecteaza contractul lui va fii adaugat pe lista
*/