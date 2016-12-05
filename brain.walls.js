module.exports = {
    remember: function () {
        //somehow saving for longer than 1 causes a bug
        var walls = Game.rooms.W5N8.find(FIND_STRUCTURES, {'filter': (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
        var wall_hits = 0;
        for (let wall in walls) {
            wall_hits += walls[wall].hits;
        }
        wall_hits_avg = wall_hits / walls.length;
        Memory.wallsToImprove = walls.filter((w) => {return w.hits < (wall_hits_avg + 1)});
        Memory.wallsToRepair = walls.filter((w) => {return w.hits < (0.75 * wall_hits_avg + 1)});
        
        if (Memory.wallsToRepair.length > 0 && Game.time % 10 == 0) {
            console.log(Memory.wallsToRepair.length + ' walls/ramparts to repair');
        }
    }
};