// chunk loader for inifinite maze
class ChunkLoader {
    constructor(player, chunkW, chunkH, tileSize, color, padding, seed) {
        // store chunk info
        this.chunkW = chunkW;
        this.chunkH = chunkH;
        this.tileSize = tileSize;
        this.color = color;

        // seeded random
        this.seed = seed;

        // offset to centeral tile of chunk
        this.tileOffsetx = -Math.floor(chunkW/2) + 0.5;
        this.tileOffsety = -Math.floor(chunkH/2) + 0.5;

        // store rendered chunks
        this.chunks = [];

        // set render distnace (must always be odd so it has a center)
        this.renderW = Math.max(2*Math.ceil(canvas.width  / (2*chunkW * tileSize) - padding), 0) + 3;
        this.renderH = Math.max(2*Math.ceil(canvas.height / (2*chunkH * tileSize) - padding), 0) + 3;
        this.padding = padding;
        console.log("Render Box: " + this.renderW + "x" + this.renderH);

        // create starting chunks
        for (let i = 0; i < this.renderH; i++) {
            for (let j = 0; j < this.renderW; j++) {
                const tileX = (j - Math.floor(this.renderW/2))*chunkW + this.tileOffsetx;
                const tileY = (i - Math.floor(this.renderH/2))*chunkH + this.tileOffsety;
                this.chunks.push(new Chunk(tileX, tileY, chunkW, chunkH, tileSize, color, this.seed));
            }
        }

        // store current centeral chunk (in tile dimentions) (top left chunk coord)
        this.centerx = 0;
        this.centery = 0;
    }

    resize() {
        // set render distnace (must always be odd so it has a center)
        const newRenderW = Math.max(2*Math.ceil(canvas.width  / (2*this.chunkW * this.tileSize) - this.padding), 0) + 3;
        const newRenderH = Math.max(2*Math.ceil(canvas.height / (2*this.chunkH * this.tileSize) - this.padding), 0) + 3;

        // if render disntace changed
        if (newRenderH != this.renderH || newRenderW != this.renderW) {
            console.log("New Render Box: " + newRenderW + "x" + newRenderH);

            // add in new chunks
            if (newRenderW > this.renderW) {
                // add chunks rows (one per change in render distance spit among each side)
                for (let i = 0; i < newRenderW - this.renderW; i++) {
                    for (let j = 0; j < this.renderH; j++) {
                        // intance tile position
                        let tileX = null;
                        let tileY = null;

                        // top
                        if (i < (newRenderW - this.renderW)/2) {
                            tileX = (i + 1 + this.centerx + Math.floor(this.renderW/2))*this.chunkW + this.tileOffsetx;
                            tileY = (j + this.centery - Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;
                        }

                        // bottom
                        else {
                            tileX = ((newRenderW - this.renderW)/2 - 1 - i + this.centerx - Math.floor(this.renderW/2))*this.chunkW + this.tileOffsetx;
                            tileY = (j + this.centery - Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;
                        }
        
                        // add to chunks
                        this.chunks.push(new Chunk(tileX, tileY, this.chunkW, this.chunkH, this.tileSize, this.color, this.seed));
                    }
                }
            }
            if (newRenderH > this.renderH) {
                // add chunks to sides
                for (let i = 0; i < newRenderH - this.renderH; i++) {
                    for (let j = 0; j < newRenderW; j++) {
                        // intance tile position
                        let tileX = null;
                        let tileY = null;

                        // top
                        if (i < (newRenderH - this.renderH)/2) {
                            tileX = (j + this.centerx - Math.floor(this.renderW/2) - (newRenderW - this.renderW)/2)*this.chunkW + this.tileOffsetx;
                            tileY = (i + 1 + this.centery + Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;
                        }

                        // bottom
                        else {
                            tileX = (j + this.centerx - Math.floor(this.renderW/2) - (newRenderW - this.renderW)/2)*this.chunkW + this.tileOffsetx;
                            tileY = ((newRenderH - this.renderH)/2 - 1 - i + this.centery - Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;
                        }
        
                        // add to chunks
                        this.chunks.push(new Chunk(tileX, tileY, this.chunkW, this.chunkH, this.tileSize, this.color, this.seed))
                    }
                }
            }
            
            // save new render distnace
            this.renderH = newRenderH;
            this.renderW = newRenderW;

            // remove far awary chunks
            this.removeChunks()

            console.log("Chunk Count:", this.chunks.length)
        }
    }

    loadChunks(dx, dy) {
        console.log("Center: (" + this.centerx + ", " + this.centery + "), Change: (" + dx + ", " + dy + ")")
        // add edge on left or right
        if (dx != 0) {
            for (let i = 0; i < this.renderH; i++) {
                const tileX = (this.centerx + dx*Math.floor(this.renderW/2))*this.chunkW + this.tileOffsetx;
                const tileY = (i + this.centery - Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;

                // add to chunks
                this.chunks.push(new Chunk(tileX, tileY, this.chunkW, this.chunkH, this.tileSize, this.color, this.seed))
            }
        }
        // add edge on top or bottom
        if (dy != 0) {
            for (let i = 0; i < this.renderW - Math.abs(dx); i++) {
                const tileX = (i + this.centerx - Math.floor(this.renderW/2) + Math.max(-dx, 0))*this.chunkW + this.tileOffsetx;
                const tileY = (this.centery + dy*Math.floor(this.renderH/2))*this.chunkH + this.tileOffsety;

                // add to chunks
                this.chunks.push(new Chunk(tileX, tileY, this.chunkW, this.chunkH, this.tileSize, this.color, this.seed))
            }
        }
    }

    removeChunks() {
        // loop through chunks (reversted order to account for the change in list length)
        for (let i = this.chunks.length - 1; i >= 0; i--) {
            const chunkx = (this.chunks[i].x - this.tileOffsetx)/this.chunkW;
            const chunky = (this.chunks[i].y - this.tileOffsety)/this.chunkH;

            // distance from centeral chunk
            const distx = chunkx - this.centerx
            const disty = chunky - this.centery
            
            // check if chunk is further than render distance
            if (distx < -Math.floor(this.renderW/2) || distx > Math.floor(this.renderW/2) || disty < -Math.floor(this.renderH/2) || disty > Math.floor(this.renderH/2)) {
                // remove chunk
                this.chunks.splice(i, 1);
            }
        }
    }

    update(player) {
        // get chunk pos player is in
        const currentChunkx = Math.floor((player.x / this.tileSize - this.tileOffsetx)/this.chunkW);
        const currentChunky = Math.floor((player.y / this.tileSize - this.tileOffsety)/this.chunkH);

        if (currentChunkx != this.centerx || currentChunky != this.centery) {
            // store change in position
            const dx = currentChunkx - this.centerx;
            const dy = currentChunky - this.centery;

            // store new center
            this.centerx = currentChunkx;
            this.centery = currentChunky;

            // load in new chunks
            this.loadChunks(dx, dy);

            // remove far off chunks
            this.removeChunks();

            console.log("Chunk Count:", this.chunks.length)
        }
    }

    render(camera) {
        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].render(camera);
        }
    }

    collide(player) {
        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].collide(player);
        }
    }
}