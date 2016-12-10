var brainCreeps = require('brain.creeps');

module.exports = function() {
    StructureSpawn.prototype.createCreepByEnergy = 
    function(energy, role) {
        var body = [];
        
        if (role == 'miner') {
            var energyLeftWithOneMove = energy - 50;
            // 5 work parts drain the source completely -> limit to 5
            var workParts = Math.min(Math.floor(energyLeftWithOneMove / 100), 5); 
            for (let i = 0; i < workParts; i++) {
                body.push(WORK);
            }
            body.push(MOVE);
        } else if (role == 'harvester' && brainCreeps.getRoleCount('miner') > 0) {
            // only move and carry (if there's a miner)
            var numberOfParts = Math.floor(energy / 100);
            
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }
        } else if (role == 'upgrader') { //TODO check for links
            body.push(MOVE);
            body.push(MOVE);
            body.push(CARRY);
            for (let i = 0; i < Math.floor(energy / 100); i++) {
                body.push(WORK);
            }
        } else {
            // generic
            var numberOfParts = Math.floor(energy / 200);
        
            for (let i = 0; i < numberOfParts; i++) {
                body.push(WORK);
            }
            
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }
        }
        
        result = this.createCreep(body, undefined, {'role': role});
        if (! _.isNumber(result)) {
            console.log('Spawned ' + role + ': ' + result);
        }
        return result;
    };
};