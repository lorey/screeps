var tools = {
    countRole: function(creeps, role) {
        return _.sum(creeps, (c) => c.memory.role == role);
    },
    
    clearMemory: function() {
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                delete Memory.creeps[name];
            }
        }
    }
};

module.exports = tools;