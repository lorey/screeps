module.exports = {
    build: function () {
        var constructionSites = 0;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                constructionSites += Game.rooms['W5N8'].getPositionAt(x,y).lookFor(LOOK_CONSTRUCTION_SITES).length;
            }
        }
        
        var canBuildExtensions = constructionSites == 0;
        if (canBuildExtensions) {
            var starts = Game.rooms.W5N8.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_CONTAINER;
                }
            });
            
            var end = Game.rooms.W5N8.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_CONTROLLER;
                }
            })[0];
            
            PathFinder.use(true);
            paths = [];
            for (i in starts) {
                paths.push(Game.rooms.W5N8.findPath(starts[i].pos, end.pos, {'ignoreCreeps': true, 'ignoreRoads': false}));
            }
            
            // go along path and check if theres room in adjacent roompositions
            for (let i = 2; true; i++) { // start a little away from container to leave room
                for (pathIndex in paths) { // start with each part beginning synchronously
                    var path = paths[pathIndex];
                    
                    // current step: { x: 10, y: 5, dx: 1,  dy: 0, direction: RIGHT }
                    var step = path[i];
                    if (step == undefined) {
                        continue; // skip this iteration
                    }
                    
                    //console.log('Checking extension sites for ' + step.x+','+step.y);
                    
                    // check fields to all sides
                    for (let x = -1; x <= 1; x++) { 
                        for (let y = -1; y <= 1; y++) {
                            //console.log('* ' + (step.x + x), ','+ (step.y + y));
                            if (Game.rooms.W5N8.lookForAt(LOOK_STRUCTURES, step.x + x, step.y + y).length == 0 && Game.rooms.W5N8.lookForAt(LOOK_TERRAIN, step.x + x, step.y + y) != 'wall') {
                                Game.rooms.W5N8.createConstructionSite(step.x + x, step.y + y, STRUCTURE_EXTENSION);
                                return; // stop until next round
                            }
                        }
                    }
                }
            }
        }
    }
};