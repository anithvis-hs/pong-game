import { Paddle, Ball, Wall, Entity } from "./entities.js";
import { collides, resolveCollision, pushOut } from "./collision.js";
import { clamp } from "./math.js";

const objects: Entity[] = [
    { kind: "paddle", x: 200, y: 140, width: 40, height: 40, speed: 240 },
    { kind: "ball", x: 50, y: 50, width: 20, height: 20, velocityX: 60, velocityY: 120 },
    { kind: "ball", x: 300, y: 200, width: 20, height: 20, velocityX: -120, velocityY: 60 },
    { kind: "wall", x: 100, y: 100, width: 80, height: 10, color: "red" },
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

function update(deltaTime: number) {
    const paddle = objects.find(o => o.kind === "paddle");
    if (!paddle) {
        throw new Error("Paddle not found");
    }

    if (keys["ArrowRight"]) {
        paddle.x += paddle.speed * deltaTime;
    }
    if (keys["ArrowLeft"]) {
        paddle.x -= paddle.speed * deltaTime;
    }
    if (keys["ArrowUp"]) {
        paddle.y -= paddle.speed * deltaTime;
    }
    if (keys["ArrowDown"]) {
        paddle.y += paddle.speed * deltaTime;
    }

    // for the non-controllable object, update the position based on the velocity
    for (const object of objects) {
        if (object.kind === "ball") {
            object.x += object.velocityX * deltaTime;
            object.y += object.velocityY * deltaTime;

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
        }

        object.x = clamp(object.x, 0, canvas.width - object.width);
        object.y = clamp(object.y, 0, canvas.height - object.height);
    }

    for (const object of objects) {
        if (object.kind === "ball") {
            for (const wall of objects) {
                if (wall.kind === "wall") {
                    if (collides(wall, object)) {
                        resolveCollision(wall, object);
                    }
                }
            }
            if (collides(paddle, object)) {
                resolveCollision(paddle, object);
            }
        }
    }

    // push out the paddle from the wall
    for (const wall of objects) {
        if (wall.kind === "wall") {
            if (collides(wall, paddle)) {
                pushOut(wall, paddle);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const object of objects) {
        if (object.kind === "wall") {
            ctx.fillStyle = object.color;
        } else {
            ctx.fillStyle = "black";
        }
        ctx.fillRect(object.x, object.y, object.width, object.height);
    }
}

let lastTime = 0;

function loop(now: number) {
    const deltaTime = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    update(deltaTime);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
