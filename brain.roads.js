var roadInterval = 300; // interval to remember and build roads

module.exports = {
    rememberTileUsage: function() {
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
    },

    rememberShortestPaths: function() {
        // build shortest paths
        var structures = Game.rooms.W5N8.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_CONTROLLER; // structures to connect
            }
        });
        
        var shortestPathsNew = {};
        for (i in structures) {
            for (j in structures) {
                if (i < j) {
                    PathFinder.use(true);
                    var path = Game.rooms.W5N8.findPath(structures[i].pos, structures[j].pos, {'ignoreCreeps': true, 'ignoreRoads': false});
                    
                    if (! shortestPathsNew[structures[i].id]) {
                        shortestPathsNew[structures[i].id] = {};
                    }
                    
                    shortestPathsNew[structures[i].id][structures[j].id] = path;
                }
            }
        }
        
        Game.rooms.W5N8.memory.shortestPaths = shortestPathsNew;
    },

    isInShortestPath: function(x,y) {
        for (fromId in Game.rooms.W5N8.memory.shortestPaths) {
            for (toId in Game.rooms.W5N8.memory.shortestPaths[fromId]) {
                for (i in Game.rooms.W5N8.memory.shortestPaths[fromId][toId]) {
                    if (Game.rooms.W5N8.memory.shortestPaths[fromId][toId][i].x == x && Game.rooms.W5N8.memory.shortestPaths[fromId][toId][i].y == y) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    build: function () {
        // build trampelpfade :)
        var constructionSites = 0;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                constructionSites += Game.rooms['W5N8'].getPositionAt(x,y).lookFor(LOOK_CONSTRUCTION_SITES).length;
            }
        }
        
        // build shortest paths
        if (constructionSites == 0) {
            var paths = Game.rooms.W5N8.memory.shortestPaths;
            for (i in paths) {
                for (j in paths[i]) {
                    for (step in paths[i][j]) {
                        var roomPosition = Game.rooms.W5N8.getPositionAt(paths[i][j][step].x, paths[i][j][step].y);
                        
                        var isTooClose = step >= paths[i][j].length - 1; // avoid last (is the building)
                        if (roomPosition.lookFor(LOOK_STRUCTURES).length == 0 && ! isTooClose) {
                            roomPosition.createConstructionSite(STRUCTURE_ROAD);
                            return; // return to wait for next interval and build shortest paths incremental
                        } else {
                            //console.log('Blocked road construction at ' + roomPosition);
                        }
                    }
                }
            }
        }

        //console.log('Construction sites: ' + constructionSites);
        
        if (constructionSites == 0 && Game.time % roadInterval == (roadInterval - 1)) { // make sure shortest paths are done
            console.log('Road construction check')
            var orders = 0;
            var maxOrders = 0;
            
            // sort usage
            var map = Memory.mapUsage;
            var sortable = [];
            for (var position in Memory.mapUsage)
                sortable.push([map[position]['position'], map[position]['count']])
            
            sortable.sort(function(a, b) {
                return b[1] - a[1]; // sort desc
            })
            
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
            
            // destroy roads
            console.log('Road destruction check');
            var orders = 0;
            var maxOrders = 1;
            var roads = Game.rooms.W5N8.find(FIND_STRUCTURES, {'filter': (s) => s.structureType == STRUCTURE_ROAD});
            for (let road in roads) {
                if (Memory.mapUsage[roads[road].pos] == undefined && orders < maxOrders && ! this.isInShortestPath(roads[road].pos.x, roads[road].pos.y)) {
                    console.log('Road deleted: ' + roads[road]);
                    roads[road].destroy();
                    orders++
                }
            }
        }
    }
};