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

    brainCreeps.remember();
    brainWalls.remember();
    
    if (brainCreeps.getRoleCount('harvester') < 2) {
        console.log('DANGER: too few harvesters')
        console.log('converting all upgraders')
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'upgrader') {
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
            'min': Math.max(8 - 2 * containerCount, 1)
        },
        'upgrader': {
            'min': 1 // default later on
        },
        'repairer': { //defaults to upgrader
            'min': 1
        },
        'builder': { // defaults to repairers
            'min': 3 
        },
        'wallrepairer': { // defaults to repairer
            'min': 1
        },
        'miner': {
            'min': 2 * containerCount // one for backup
        }
    };
    
    // stats
    if (Game.time % 60 == 0) {
        console.log('------------------------------');
        for (role in roles) {
            console.log(role + ': ' + brainCreeps.getRoleCount(role) + '/' + roles[role]['min']);
        }
        console.log('------------------------------');
    }
    
    if (brainCreeps.getRoleCount('harvester') == 0) {
        // create smallest harvester to start again ASAP
        Game.spawns.Spawn1.createCreepByEnergy(200, 'harvester');
    }
    
    if (brainCreeps.getRoleCount('upgrader') == 0) {
        // create smallest upgrader to start again ASAP
        Game.spawns.Spawn1.createCreepByEnergy(200, 'upgrader');
    }
    
    var buildOrder = [
        'harvester',
        'upgrader',
        'miner',
        'repairer',
        'builder',
        'wallrepairer',
        'upgrader'
    ];
    var roleToBuild = 'upgrader';
    for (let i in buildOrder) {
        var role = buildOrder[i];
        if (brainCreeps.getRoleCount(role) < roles[role]['min']) {
            roleToBuild = role;
            break; // exit loop
        }
    }
    
    var energyLevel = Math.max(Game.spawns.Spawn1.room.energyCapacityAvailable - 300, 300); // remove spawn energy as this takes too long
    Game.spawns.Spawn1.createCreepByEnergy(energyLevel, roleToBuild);
    
    brainExtensions.build();
    brainRoads.build();
}