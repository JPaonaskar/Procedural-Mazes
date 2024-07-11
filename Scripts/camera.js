// camera to make scene follow player
class Camera {
    constructor(x, y, drag) {
        this.x = x
        this.y = y
        this.drag = drag;

        this.offsetx = this.x - canvas.width/2
        this.offsety = this.y - canvas.height/2
    }

    follow(object) {
        // move towards object
        this.x += (1 - this.drag)*(object.x - this.x);
        this.y += (1 - this.drag)*(object.y - this.y);

        // calcualte offset for rendering other objects
        this.offsetx = this.x - canvas.width/2
        this.offsety = this.y - canvas.height/2
    }
}