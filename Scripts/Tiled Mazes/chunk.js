// maze chunk class
class Chunk {
    // construct chunk (x, y, h, w are defined in numbers of tiles)
    constructor(x, y, w, h, tileSize, color, seed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tileSize = tileSize;
        this.color = color;

        // seed for random generator
        this.seed = seed;

        // generate
        this.generate();
    }

    spiralSearch(array, x0, y0, targetVal) {
        // spiral search for unexplored tile
        let x = x0;
        let y = y0;
        let d = 0; // 0 = RIGHT, 1 = DOWN, 2 = LEFT, 3 = UP
        let s = 1; // chain size

        // largest distance to edge (to make sure the entire maze boundry is covered)
        const dist = Math.max(x, y, this.w-x-1, this.h-y-1);

        // begin search (for number of step out from center) (Alternates from WS and WN)
        for (let i = 0; i < 2*dist+1; i++) {
            // loop twice (chains are the same size twice)
            for (let j = 0; j < 2; j++) {
                // step across chain
                for (let k = 0; k < s; k++) {
                    // move in direction
                    if (d == 0) {
                        x++;
                    }
                    else if (d == 1) {
                        y++;
                    }
                    else if (d == 2) {
                        x--;
                    }
                    else if (d == 3) {
                        y--;
                    }

                    // check if in bounds
                    if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
                        // check for value
                        if (array[y][x] == targetVal) {
                            return [x, y];
                        }
                    }
                }
                // change direction
                d = (d + 1) % 4;
            }
            // increase chain size
            s++;
        }
        // could not find value in array
        return null;
    }

    getNeighbors(x, y, array, value) {
        // store size
        const h = array.length;
        const w = array[0].length;

        // check neighbors
        let neighbors = [];
        if (y - 1 >= 0 && array[y-1][x] == value) {
            neighbors.push("N");
        }
        if (y + 1 < h && array[y+1][x] == value) {
            neighbors.push("S");
        }
        if (x - 1 >= 0 && array[y][x-1] == value) {
            neighbors.push("L");
        }
        if (x + 1 < w && array[y][x+1] == value) {
            neighbors.push("R");
        }
        // return found neighbors
        return neighbors;
    }

    connectPaths(px, py, direction) {
        // connect in direction
        if (direction == "N") {
            // break wall and move
            this.wallData[2*py][px] = 0;
            py -= 1;
        }
        else if (direction == "S") {
            // break wall and move
            this.wallData[2*py+2][px] = 0;
            py += 1;
        }
        else if (direction == "L") {
            // break wall and move
            this.wallData[2*py+1][px] = 0;
            px -= 1;
        }
        else if (direction == "R") {
            // break wall and move
            this.wallData[2*py+1][px+1] = 0;
            px += 1;
        }
        // return moved pointer
        return [px, py];
    }

    // depth of field search to generate chunk
    generate() {
        // set size
        let rows = 2*this.h;
        let columns = this.w;
        
        // create wall data
        this.wallData = new Array(rows);
        for (let row = 0; row < rows; row++) {
            this.wallData[row] = new Array(columns);

            // fill with walls (1s)
            for (let column = 0; column < this.wallData[row].length; column++) {
                this.wallData[row][column] = 1;
            }
        }

        // stored explored tiles
        let explored = new Array(this.h);
        for (let row = 0; row < this.h; row++) {
            explored[row] = new Array(this.w);
        }

        // pointer to keep track of position
        let pointerx = Math.floor(this.w / 2);
        let pointery = Math.floor(this.h / 2);

        // random number generator
        let rand = sfc32(0x9E3779B9, Math.floor(this.x*100), Math.floor(this.y*100), this.seed);

        // loop and explore every tile
        for (let i = 0; i < this.w*this.h-1; i++) {
            // mark as explored
            explored[pointery][pointerx] = 1;

            // check neighbors
            const neighbors = this.getNeighbors(pointerx, pointery, explored, undefined);

            // if there are no neighbors to move to
            if (neighbors.length == 0) {
                // do spiral seach to find new unexplored point
                const newPointer = this.spiralSearch(explored, pointerx, pointery, undefined);
                
                // set pointer to new position
                pointerx = newPointer[0];
                pointery = newPointer[1];

                // get explored neighbors
                const neighbors = this.getNeighbors(pointerx, pointery, explored, 1);
                
                // pick random explored neighbor
                let dir = neighbors[Math.floor(rand()*neighbors.length)];
                
                // make connection to explored neigbor
                this.connectPaths(pointerx, pointery, dir);
            }

            // pick random neighbor
            let dir = neighbors[Math.floor(rand()*neighbors.length)];
            
            // make connection in direction dir and move to that point
            const newPointer = this.connectPaths(pointerx, pointery, dir);
                
            // set pointer to new position
            pointerx = newPointer[0];
            pointery = newPointer[1];
        }

        // add connection to the left
        this.wallData[2*Math.floor(rand()*this.h) + 1][0] = -1;
        
        // add connection above
        this.wallData[0][Math.floor(rand()*this.w)] = -1;
    }

    render(camera) {
        // loop through wall data and generate each wall
        for (let row = 0; row < this.wallData.length; row++) {
            for (let column = 0; column < this.wallData[row].length; column++) {
                // if wall
                if (this.wallData[row][column] == 1) {
                    // horizontal walls
                    if (row % 2 == 0) {
                        // points
                        const x1 = this.x + column;
                        const x2 = this.x + column + 1;
                        const y = this.y + 0.5*row;

                        // set line style
                        ctx.strokeStyle = this.color;
                        ctx.lineWidth = 2;

                        // draw line :)
                        ctx.beginPath();
                        ctx.moveTo(x1*this.tileSize - camera.offsetx, y*this.tileSize - camera.offsety);
                        ctx.lineTo(x2*this.tileSize - camera.offsetx, y*this.tileSize - camera.offsety);
                        ctx.stroke();
                    }

                    // vertical walls
                    else if (row % 2 == 1) {
                        // points
                        const x = this.x + column;
                        const y1 = this.y + 0.5*row - 0.5;
                        const y2 = this.y + 0.5*row + 0.5;

                        // set line style
                        ctx.strokeStyle = this.color;
                        ctx.lineWidth = 2;

                        // draw line :)
                        ctx.beginPath();
                        ctx.moveTo(x*this.tileSize - camera.offsetx, y1*this.tileSize - camera.offsety);
                        ctx.lineTo(x*this.tileSize - camera.offsetx, y2*this.tileSize - camera.offsety);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    getNeighboringWalls(x, y) {
        // check neighbors
        let neighbors = [];
        if (y >= 0 && y < this.h && x >= 0 && x < this.w) {
            if (this.wallData[2*y][x] == 1) {
                neighbors.push("N");
            }
        }
        if (y >= -1 && y + 1 < this.h && x >= 0 && x < this.w) {
            if (this.wallData[2*y+2][x] == 1) {
                neighbors.push("S");
            }
        }
        if (y >= 0 && y < this.h && x >= 0 && x < this.w) {
            if (this.wallData[2*y+1][x] == 1) {
                neighbors.push("L");
            }
        }
        if (y >= 0 && y < this.h && x >= -1 && x + 1 < this.w) {
            if (this.wallData[2*y+1][x+1] == 1) {
               neighbors.push("R");
            }
        }
        // return found neighbors
        return neighbors;
    }

    collide(player) {
        // convert player position to row and column
        const column = Math.floor(player.x / this.tileSize - this.x)
        const row = Math.floor(player.y / this.tileSize - this.y)

        // create collisions for neiboring tiles (accounts for current tile too)
        const dRow = [1, -1, 0, 0]
        const dColumn= [0, 0, 1, -1]

        // loop though each case
        for (let i = 0; i < 4; i++) {
            const rowi = row + dRow[i];
            const columni = column + dColumn[i];
            // if collision point is in bounds
            if (rowi >= -1 && rowi <= this.h && columni >= -1 && columni <= this.w) {
                // get neighboring walls
                const neighboringWalls = this.getNeighboringWalls(columni, rowi);
                
                // collisions
                if (neighboringWalls.includes("N")){
                    const x1 = (this.x + columni)*this.tileSize;
                    const x2 = (this.x + columni + 1)*this.tileSize;
                    const y = (this.y + rowi)*this.tileSize;
                    player.collide_line(x1, y, x2, y);
                }
                if (neighboringWalls.includes("S")){
                    const x1 = (this.x + columni)*this.tileSize;
                    const x2 = (this.x + columni + 1)*this.tileSize;
                    const y = (this.y + rowi + 1)*this.tileSize;
                    player.collide_line(x1, y, x2, y);
                }
                if (neighboringWalls.includes("L")){
                    const x = (this.x + columni)*this.tileSize;
                    const y1 = (this.y + rowi)*this.tileSize;
                    const y2 = (this.y + rowi + 1)*this.tileSize;
                    player.collide_line(x, y1, x, y2);
                }
                if (neighboringWalls.includes("R")){
                    const x = (this.x + columni + 1)*this.tileSize;
                    const y1 = (this.y + rowi)*this.tileSize;
                    const y2 = (this.y + rowi + 1)*this.tileSize;
                    player.collide_line(x, y1, x, y2);
                }
            }
        }
    }
}