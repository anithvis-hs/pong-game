type Entity = {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    controllable: boolean;
    velocityX: number;
    velocityY: number;
}

const objects: Entity[] = [
    { x: 200, y: 140, width: 40, height: 40, speed: 4, controllable: true, velocityX: 0, velocityY: 0 },
    { x: 50, y: 50, width: 20, height: 20, speed: 2, controllable: false, velocityX: 1, velocityY: 2 },
];

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// know whether the current key is held
const keys: Record<string, boolean> = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function clamp(value: number, min: number, max: number): number {
    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }
    return value;
}

function overlap1D(aLeft: number, aRight: number, bLeft: number, bRight: number): boolean {
    return !(aRight < bLeft || aLeft > bRight);
}

function collides(a: Entity, b: Entity): boolean {
    return overlap1D(a.x, a.x + a.width, b.x, b.x + b.width) && overlap1D(a.y, a.y + a.height, b.y, b.y + b.height);
}

function update() {
    for (const object of objects) {
        if (object.controllable) {
            if (keys["ArrowRight"]) {
                object.x += object.speed;
            }
            if (keys["ArrowLeft"]) {
                object.x -= object.speed;
            }
            if (keys["ArrowUp"]) {
                object.y -= object.speed;
            }
            if (keys["ArrowDown"]) {
                object.y += object.speed;
            }
        }

        // for the non-controllable object, update the position based on the velocity
        object.x += object.velocityX;
        object.y += object.velocityY;

        if (object.x > canvas.width - object.width) {
            object.velocityX *= -1;
        }

        if (object.x < 0) {
            object.velocityX *= -1;
        }

        if (object.y > canvas.height - object.height) {
            object.velocityY *= -1;
        }

        if (object.y < 0) {
            object.velocityY *= -1;
        }

        object.x = clamp(object.x, 0, canvas.width - object.width);
        object.y = clamp(object.y, 0, canvas.height - object.height);
    }

    if (collides(objects[0], objects[1])) {
        // compute overlapX and overlapY here, using objects[0] and objects[1]
        const overlapX = Math.min(objects[0].x + objects[0].width, objects[1].x + objects[1].width) - Math.max(objects[0].x, objects[1].x);
        const overlapY = Math.min(objects[0].y + objects[0].height, objects[1].y + objects[1].height) - Math.max(objects[0].y, objects[1].y);

        // side hit condition
        if (overlapX < overlapY) {
            // existing x logic
            objects[1].velocityX *= -1;

            if (objects[1].x + objects[1].width / 2 < objects[0].x + objects[0].width / 2) {
                objects[1].x = objects[0].x - objects[1].width; // ball on the left of the paddle
            } else {
                objects[1].x = objects[0].x + objects[0].width; // ball on the right of the paddle
            }
        } else {
            // y logic
            objects[1].velocityY *= -1;

            if (objects[1].y + objects[1].height / 2 < objects[0].y + objects[0].height / 2) {
                objects[1].y = objects[0].y - objects[1].height; // ball above the paddle
            } else {
                objects[1].y = objects[0].y + objects[0].height; // ball below the paddle
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const object of objects) {
        ctx.fillRect(object.x, object.y, object.width, object.height);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();