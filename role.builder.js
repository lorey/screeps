var roleDefault = require('role.repairer');

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if(creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                var target = _.sortBy(targets, t => {return creep.pos.getRangeTo(t.pos);})[0];
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                roleDefault.run(creep);
            }
        }
        else {
            // get energy
            creep.moveToAndHarvestNearestPowerSource();
        }
    }
};

module.exports = roleBuilder;