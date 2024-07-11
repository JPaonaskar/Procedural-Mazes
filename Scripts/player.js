// player class
class Player {
    constructor(x, y, r, color, a, drag) {
        // position
        this.x = x;
        this.y = y;

        // size
        this.r = r;
        
        // physics
        this.vx = 0;
        this.vy = 0;
        this.a = a;
        this.drag = drag;

        // style
        this.color = color;
    }

    render(camera) {
        // draw cicle :)
        ctx.beginPath();
        ctx.arc(this.x - camera.offsetx, this.y - camera.offsety, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    control(keys) {
        // keys to acceleration
        if (keys.includes("ArrowUp") || keys.includes("w")) {
            this.vy -= this.a;

            // teleport
            if (keys.includes("Shift")) {
                this.y -= this.r;
            }
        }
        if (keys.includes("ArrowDown") || keys.includes("s")) {
            this.vy += this.a;

            // teleport
            if (keys.includes("Shift")) {
                this.y += this.r;
            }
        }
        if (keys.includes("ArrowLeft") || keys.includes("a")) {
            this.vx -= this.a;

            // teleport
            if (keys.includes("Shift")) {
                this.x -= this.r;
            }
        }
        if (keys.includes("ArrowRight") || keys.includes("d")) {
            this.vx += this.a;

            // teleport
            if (keys.includes("Shift")) {
                this.x += this.r;
            }
        }
    }

    move() {
        // move
        this.x += this.vx;
        this.y += this.vy;

        // drag
        this.vx *= 1 - this.drag;
        this.vy *= 1 - this.drag;
    }

    collide_line(x1, y1, x2, y2) {
        // set up quadratic fromula
        const a = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
        const b = 2*(x1 - this.x)*(x2 - x1) + 2*(y1 - this.y)*(y2 - y1)
        const c = Math.pow(x1 - this.x, 2) + Math.pow(y1 - this.y, 2) - Math.pow(this.r, 2)
        const disc = Math.pow(b, 2) - 4*a*c

        // collsion "time"
        let tc = null

        // one possible collsion point
        if (disc == 0) {
            const t = -b / (2*a)

            // if on segment
            if (t >= 0 && t <= 1) {
                // save collsion "time"
                tc = t
            }
            else {
                // not colliding so exit function
                return;
            }
        }
        // two possible collision points
        else if (disc > 0) {
            const t1 = (-b + Math.sqrt(disc)) / (2*a)
            const t2 = (-b - Math.sqrt(disc)) / (2*a)

            // center case
            if ((t1 >= 0 && t1 <= 1) && (t2 >= 0 && t2 <= 1)) {
                // save collsion "time"
                tc = 0.5*(t1 + t2)
            }
            // edge case 1
            else if (t1 >= 0 && t1 <= 1) {
                // save collsion "time"
                tc = 0.5*t1
            }
            // edge case 2
            else if (t2 >= 0 && t2 <= 1) {
                // save collsion "time"
                tc = 0.5*(1 + t2)
            }
            // not colliding
            else {
                // not colliding so exit function
                return;
            }
        }
        else {
                // not colliding so exit function
            return;
        }

        // collision point
        const cx = (x2 - x1)*tc + x1
        const cy = (y2 - y1)*tc + y1

        // normal (line normal but approximates rounded caps of lines)
        const normx = this.x - cx
        const normy = this.y - cy
        const mag2Norm = Math.pow(normx, 2) + Math.pow(normy, 2)

        // project velocity on normal
        const dot = normx*this.vx + normy*this.vy

        // if velocity is towards the line
        if (dot < 0) {
            // change velocity by twice the projection on the normal
            this.vx -= 2*dot / mag2Norm * normx
            this.vy -= 2*dot / mag2Norm * normy
        }
    }
}