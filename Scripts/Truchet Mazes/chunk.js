class Chunk {
    // construct chunk (x, y, h, w are defined in numbers of tiles)
    constructor(x, y, w, h, tileSize, color, seed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tileSize = tileSize;
        this.color = color;

        // seeded random
        this.seed = seed;

        // generate
        this.generate();
    }

    connectPaths(x, y, direction) {
        // connect in direction
        if (direction == "N") {
            // break wall and move
            this.wallData[2*y][x] = 0;
        }
        else if (direction == "S" && y + 1 < this.h) {
            // break wall and move
            this.wallData[2*y+2][x] = 0;
        }
        else if (direction == "E") {
            // break wall and move
            this.wallData[2*y+1][x+1] = 0;
        }
        else if (direction == "W") {
            // break wall and move
            this.wallData[2*y+1][x] = 0;
        }
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

        // seeded random number genorator
        //let rand = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        let rand = sfc32(0x9E3779B9, Math.floor(this.x*100), Math.floor(this.y*100), this.seed);

        // break walls
        for (let row = 0; row < this.h; row++) {
            for (let column = 0; column < this.w; column++) {
                let connections = [];
                // must a connection
                connections.push(["N", "W"][Math.floor(rand()*2)])

                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////
                ///////////////////////////// AVOID DIRECTIONALITY /////////////////////////////

                // make connection
                for (let i = 0; i < connections.length; i++) {
                    this.connectPaths(column, row, connections[i]);
                }
            }
        }
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