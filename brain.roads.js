module.exports = {
    build: function () {
        // build trampelpfade :)
        var roadInterval = 300; // interval to remember and build roads
        
        // remember tile usage
        var map = Memory.mapUsage && Game.time % roadInterval != 0 ? Memory.mapUsage : {};
        for(var name in Game.creeps) {
            var pos = Game.creeps[name].pos;
            
            if (map[pos]) {
                // known position
                if (map[pos].last != name || map[pos].lastAt + 3 != Game.time) { // 3 for switching creeps
                    // creep did actually move to field
                    map[pos].count++;
                    map[pos].last = name;
                    map[pos].lastAt = Game.time;
                }
            } else {
                // new position
                map[pos] = {
                    'count': 1,
                    'position': pos,
                    'last': name,
                    'lastAt': Game.tick
                };
            }
        }
        Memory.mapUsage = map;
        
        var sortable = [];
        for (var position in Memory.mapUsage)
            sortable.push([map[position]['position'], map[position]['count']])
        
        sortable.sort(function(a, b) {
            return b[1] - a[1]; // sort desc
        })
        
        // build roads
        var constructionSites = 0;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                constructionSites += Game.rooms['W5N8'].getPositionAt(x,y).lookFor(LOOK_CONSTRUCTION_SITES).length;
            }
        }
        //console.log('Construction sites: ' + constructionSites);
        
        if (constructionSites == 0 && Game.time % roadInterval == (roadInterval - 1)) {
            console.log('Road construction check')
            var orders = 0;
            var maxOrders = 1;
            for (pos in sortable) {
                var position = sortable[pos][0];
                var roomPosition = Game.rooms[position.roomName].getPositionAt(position.x,position.y);
                var usage = sortable[pos][1] / (Game.time % roadInterval + 1);
                
                if (orders < maxOrders && roomPosition.lookFor(LOOK_STRUCTURES).length == 0) {
                    console.log('Building a road at ' + roomPosition)
                    roomPosition.createConstructionSite(STRUCTURE_ROAD);
                    orders++;
                }
            }
            
            // build shortest paths
            var structures = Game.rooms.W5N8.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_CONTROLLER;
                }
            });
            
            for (i in structures) {
                for (j in structures) {
                    if (i < j) {
                        PathFinder.use(true);
                        var currentPath = Game.rooms.W5N8.findPath(structures[i].pos, structures[j].pos, {'ignoreCreeps': true, 'ignoreRoads': false});
                        var path = Game.rooms.W5N8.findPath(structures[i].pos, structures[j].pos, {'ignoreCreeps': true, 'ignoreRoads': true});
                        
                        if (path.length < currentPath.length) {
                            // build path
                            for (step in path) {
                                var roomPosition = Game.rooms.W5N8.getPositionAt(path[step].x, path[step].y);
                                var isTooClose = step < 3 && step > path.length - 3;
                                if (roomPosition.lookFor(LOOK_STRUCTURES).length == 0 && ! isTooClose) {
                                    roomPosition.createConstructionSite(STRUCTURE_ROAD);
                                } else {
                                    // console.log('Blocked road construction at ' + roomPosition);
                                }
                                
                            }
                        }
                    }
                }
            }
            
            // destroy roads
            console.log('Road destruction check');
            var orders = 0;
            var maxOrders = 5;
            var roads = Game.rooms.W5N8.find(FIND_STRUCTURES, {'filter': (s) => s.structureType == STRUCTURE_ROAD});
            for (let road in roads) {
                if (Memory.mapUsage[roads[road].pos] == undefined && orders < maxOrders) {
                    console.log('Road deleted: ' + roads[road]);
                    roads[road].destroy();
                    orders++
                }
            }
        }
    }
};