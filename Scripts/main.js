// get canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// tolerance for equalities
const tolerance = 0.00001

// initialize canvas size
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

// create player
let player = new Player(PLAYER_X, PLAYER_Y, PLAYER_R, PLAYER_COLOR, PLAYER_ACCEL, PLAYER_DRAG);

// create camera
let camera = new Camera(player.x, player.y, CAMERA_DRAG);

// create chunk loader
let loader = new ChunkLoader(player, CHUNK_W, CHUNK_H, TILE_SIZE, CHUNK_COLOR, RENDER_PADDING, SEED);

// game loop
function update() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update loaded chunks (load new in needed and delete un-needed)
    loader.update(player);
    
    // render player
    player.render(camera);

    // render chunks
    loader.render(camera)

    // control player
    player.control(keys);

    // collisions with chunks
    loader.collide(player)

    // move player (after collisions to avoid clipping)
    player.move();

    // move camera
    camera.follow(player)
}

// key tracker
let keys = [];

// key down
function keyDownHandler(e) {
    if (!keys.includes(e.key)) {
        // add key to keys
        keys.push(e.key);
    }
}

// key up
function keyUpHandler(e) {
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == e.key) {
            // remove key
            keys.splice(i,1);
            break;
        }
    }
}

// dynamic resizing canvas
function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    // rerender player
    player.render(camera);

    // rerender chunks
    loader.render(camera);

    // update render distance
    loader.resize();
}

// event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
window.addEventListener('resize', resizeCanvas, false);

// run update
setInterval(update, MILISECONDS_PER_FRAME);