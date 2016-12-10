module.exports = function() {
    Creep.prototype.moveToAndHarvestNearestPowerSource = 
    function() {
        // try to pick up energy laying around
        var droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_ENERGY);
        if (droppedEnergy && droppedEnergy.pos.getRangeTo(this.pos) < 2 && this.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
            this.moveTo(droppedEnergy);
        }
        
        var containers = this.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 100;
            }
        });
        
        if (containers.length > 0) {
            // container found (preferred)
            var targetContainer = this.pos.findClosestByPath(containers);
            if (this.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetContainer);
            }
        } else {
            // no container found: find sources
            var sources = this.room.find(FIND_SOURCES_ACTIVE);
            if (sources.length == 0) {
                // no active source -> just use one
                sources = this.room.find(FIND_SOURCES);
            }
            
            // find nearest and move to it
            var source = this.pos.findClosestByPath(sources);
            
            if (! source) {
                // no path? just use nearest
                source = this.pos.findClosestByRange(sources);
            }
            
            if (this.pos.isNearTo(source)) {
                this.harvest(source);
            } else {
                this.moveTo(source);
            }
        }
    };
};