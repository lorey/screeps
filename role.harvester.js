var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // state changes
        if (creep.memory.state == 'FINDING_SOURCE' && creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE) && creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).pos.isNearTo(creep.pos)) {
            // source found: find -> mining
            creep.memory.state = 'MINING';
            creep.say('mining');
        } else if (creep.carry.energy == creep.carryCapacity) { // leaving out state if something unexpected happens
            // creep full: mining -> finding deposit
            creep.memory.state = 'FINDING_DEPOSIT';
            creep.say('deposit?');
        } else if (creep.memory.state == 'MINING' && ! creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)) {
            // sources empty: mining -> finding deposit
            creep.memory.state = 'FINDING_DEPOSIT';
            creep.say('deposit?');
        } else if(creep.memory.state == 'FINDING_DEPOSIT' && creep.carry.energy == 0) {
            // deposit found and empty
            creep.memory.state = 'FINDING_SOURCE';
            creep.say('source?');
        } else if(creep.memory.state == 'DEPOSIT' && creep.carry.energy == 0) {
            // deposit found and empty
            creep.memory.state = 'FINDING_SOURCE';
            creep.say('source?');
        } else if(creep.memory.state == undefined) {
            // new creep
            creep.memory.state = 'FINDING_SOURCE';
            creep.say('source?');
        }
        
        // tasks
        if(creep.memory.state == 'FINDING_SOURCE') {
            creep.moveToAndHarvestNearestPowerSource();
        } else if(creep.memory.state == 'MINING') {
            creep.moveToAndHarvestNearestPowerSource();
        } else if (creep.memory.state == 'FINDING_DEPOSIT' || creep.memory.state == 'DEPOSIT') {
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => s.energy < s.energyCapacity
            });
            
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
};

module.exports = roleHarvester;