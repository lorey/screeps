require('prototype.spawn')();
require('prototype.creep')();

var brainCreeps = require('brain.creeps');
var brainExtensions = require('brain.extensions');
var brainRoads = require('brain.roads');
var brainWalls = require('brain.walls');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallrepairer');
var tools = require('tools');

module.exports.loop = function () {
    tools.clearMemory();

    brainRoads.rememberShortestPaths();
    brainRoads.rememberTileUsage();
    brainCreeps.remember();
    brainWalls.remember();
    
    if (brainCreeps.getRoleCount('harvester') == 0) {
        console.log('DANGER: no harvesters')
        console.log('converting others')
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == 'builder' || creep.memory.role == 'repairer' || creep.memory.role == 'wallrepairer') {
                creep.memory.role = 'harvester';
                break; // wait until next round
            }
        }
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'wallrepairer') {
            roleWallRepairer.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        
    }
    
    var towers = Game.rooms.W5N8.find(FIND_STRUCTURES, {'filter': (s) => s.structureType == STRUCTURE_TOWER})
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
        }
    }
    
    containerCount = Game.rooms['W5N8'].find(FIND_STRUCTURES, {
        filter: (s) => {return s.structureType == STRUCTURE_CONTAINER}
    }).length;
    var roles = {
        'harvester': {
            'min': Math.max(8 - 3 * containerCount, 2),
            'max': Math.max(8 - 3 * containerCount, 2)
        },
        'upgrader': {
            'min': 1,
            'max': 3
        },
        'repairer': { //defaults to upgrader
            'min': 1,
            'max': 1
        },
        'builder': { // defaults to repairers
            'min': 1,
            'max': 3
        },
        'wallrepairer': { // defaults to repairer
            'min': 0,
            'max': 1
        },
        'miner': {
            'min': containerCount + 1, // one for backup
            'max': 2 * containerCount // one for backup for each
        }
    };
    
    // stats
    if (Game.time % 10 == 0) {
        console.log('------------------------------');
        for (role in roles) {
            console.log(role + ': ' + roles[role]['min'] + '/' + brainCreeps.getRoleCount(role) + '/' + roles[role]['max']);
        }
        console.log('------------------------------');
    }
    
    if (brainCreeps.getRoleCount('harvester') == 0) {
        // create smallest harvester to start again ASAP
        Game.spawns.Spawn1.createCreepByEnergy(200, 'harvester');
    }
    
    var buildOrder = [
        'harvester',
        'miner',
        'repairer',
        'builder',
        'wallrepairer',
        'upgrader'
    ];
    var roleToBuild;
    
    // check mins
    for (let i in buildOrder) {
        var role = buildOrder[i];
        if (brainCreeps.getRoleCount(role) < roles[role]['min']) {
            roleToBuild = role;
            break; // exit loop
        }
    }
    
    // check max
    for (let i in buildOrder) {
        var role = buildOrder[i];
        if (roleToBuild == undefined && brainCreeps.getRoleCount(role) < roles[role]['max']) {
            roleToBuild = role;
            break; // exit loop
        }
    }
    
    if (roleToBuild != undefined) {
        var energyLevel = Math.max(Game.spawns.Spawn1.room.energyCapacityAvailable - 300, 300); // remove spawn energy as this takes too long
        Game.spawns.Spawn1.createCreepByEnergy(energyLevel, roleToBuild);
    } else if (Game.spawns.Spawn1.room.energyCapacityAvailable == Game.spawns.Spawn1.room.energyAvailable && Game.time % 10 == 0){
        console.log('nothing to build');
    }
    
    
    brainExtensions.build();
    brainRoads.build();
}