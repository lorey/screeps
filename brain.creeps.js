module.exports = {
    remember: function () {
        var counts = {};
        for (creepName in Game.creeps) {
            var creep = Game.creeps[creepName]
            if (counts[creep.memory.role]) {
                counts[creep.memory.role]++;
            } else {
                counts[creep.memory.role] = 1;
            }
        }
        
        Memory.rolesCount = counts;
    },
    
    getRoleCount: function (role)
    {
        if (Memory.rolesCount[role] == undefined) {
            return 0;
        }
        
        return Memory.rolesCount[role];
    }
};