module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.state == 'FOUND_TARGET') {
            // never ever switch again
        } else {
            // move to target
            if (creep.pos.lookFor(LOOK_STRUCTURES).length > 0) {
                if (creep.pos.lookFor(LOOK_STRUCTURES)[0].structureType == STRUCTURE_CONTAINER) {
                    creep.memory.state = 'FOUND_TARGET';
                    creep.say('yes');
                }
            }
        }
        
        if (creep.memory.state == 'FOUND_TARGET') {
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            creep.harvest(source);
            creep.memory.foundTarget = true;
        } else {
            // find container without miner
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter:  (s) => {
                    return s.structureType == STRUCTURE_CONTAINER && (s.pos.lookFor(LOOK_CREEPS).length == 0 || s.pos.lookFor(LOOK_CREEPS)[0].memory.role != 'miner');
                }
            });
            
            if (targets.length == 0) {
                // find container with oldest creep
                
                var allContainers = creep.room.find(FIND_STRUCTURES, {
                    filter:  (s) => {
                        return s.structureType == STRUCTURE_CONTAINER;
                    }
                });
                
                
                if (allContainers.length > 0) {
                    var containerWithOldestMiner = _.sortBy(allContainers, (s) => {return s.pos.lookFor(LOOK_CREEPS)[0].ticksToLive;})[0];
                    targets = [containerWithOldestMiner];
                }
                
            }
            
            if (targets.length > 0) {
                var target = creep.pos.findClosestByRange(targets);
                if(creep.pos.getRangeTo(target) > 0) {
                    creep.moveTo(target);
                } else {
                    creep.memory.state = 'FOUND_TARGET';
                }
            } else {
                creep.say('target?');
            }
        }
    }
};