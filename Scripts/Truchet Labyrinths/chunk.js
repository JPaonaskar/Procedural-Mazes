// Probabilities
const P_SLOPE_POS = 0.45; 
const P_SLOPE_NEG = 0.45;

class Chunk {
    // construct chunk (x, y, h, w are defined in numbers of tiles)
    constructor(x, y, w, h, tileSize, color, seed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tileSize = tileSize;
        this.color = color;

        this.seed = seed;

        // generate
        this.generate();
    }

    // probablity dictate walls
    generate() {
        // set size
        let rows = this.h;
        let columns = this.w;
        
        // create wall data
        this.wallData = new Array(rows);
        for (let row = 0; row < rows; row++) {
            this.wallData[row] = new Array(columns);
        }

        // fill with walls (0 = POSITIVE SLOPE, 1 = NEGITIVE SLOPE)
        let rand = sfc32(0x9E3779B9, Math.floor(this.x*100), Math.floor(this.y*100), this.seed);

        for (let row = 0; row < this.wallData.length; row++) {
            for (let column = 0; column < this.wallData[row].length; column++) {
                let num = rand();
                if (num <= P_SLOPE_POS) {
                    this.wallData[row][column] = 0;
                }
                else if (num >= 1 - P_SLOPE_NEG) {
                    this.wallData[row][column] = 1;
                }
            }
        }
    }

    render(camera) {
        // loop through wall data and generate each wall
        for (let row = 0; row < this.wallData.length; row++) {
            for (let column = 0; column < this.wallData[row].length; column++) {
                if (this.wallData[row][column] == 0) {
                    // POSITIVE SLOPE
                    const x1 = this.x + column + 1;
                    const x2 = this.x + column;
                    const y1 = this.y + row;
                    const y2 = this.y + row + 1;

                    // set line style
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;

                    // draw line :)
                    ctx.beginPath();
                    ctx.moveTo(x1*this.tileSize - camera.offsetx, y1*this.tileSize - camera.offsety);
                    ctx.lineTo(x2*this.tileSize - camera.offsetx, y2*this.tileSize - camera.offsety);
                    ctx.stroke();
                }
                else if (this.wallData[row][column] == 1) {
                    // NEGITIVE SLOPE
                    const x1 = this.x + column;
                    const x2 = this.x + column + 1;
                    const y1 = this.y + row;
                    const y2 = this.y + row + 1;

                    // set line style
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;

                    // draw line :)
                    ctx.beginPath();
                    ctx.moveTo(x1*this.tileSize - camera.offsetx, y1*this.tileSize - camera.offsety);
                    ctx.lineTo(x2*this.tileSize - camera.offsetx, y2*this.tileSize - camera.offsety);
                    ctx.stroke();
                }
            }
        }
    }

    collide(player) {
        // convert player position to row and column
        const column = Math.floor(player.x / this.tileSize - this.x)
        const row = Math.floor(player.y / this.tileSize - this.y)

        // loop though each case
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const rowi = row + i;
                const columnj = column + j;
                // if collision point is in bounds
                if (rowi >= 0 && rowi < this.h && columnj >= 0 && columnj < this.w) {
                    // collisions
                    if (this.wallData[rowi][columnj] == 0){
                        // POSITIVE SLOPE
                        const x1 = (this.x + columnj + 1)*this.tileSize;
                        const x2 = (this.x + columnj)*this.tileSize;
                        const y1 = (this.y + rowi)*this.tileSize;
                        const y2 = (this.y + rowi + 1)*this.tileSize;
                        player.collide_line(x1, y1, x2, y2);
                    }
                    if (this.wallData[rowi][columnj] == 1){
                        // NEGITIVE SLOPE
                        const x1 = (this.x + columnj)*this.tileSize;
                        const x2 = (this.x + columnj + 1)*this.tileSize;
                        const y1 = (this.y + rowi)*this.tileSize;
                        const y2 = (this.y + rowi + 1)*this.tileSize;
                        player.collide_line(x1, y1, x2, y2);
                    }
                }
            }
        }
    }
}