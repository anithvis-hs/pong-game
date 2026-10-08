import { Paddle, Ball, Wall, Entity } from "./entities.js";
import { collides, resolveCollision, pushOut } from "./collision.js";
import { clamp } from "./math.js";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function randomBall(): Ball {
    const size = 20;
    return {
        kind: "ball",
        x: Math.random() * (canvas.width - size),
        y: Math.random() * (canvas.height - size),
        width: size,
        height: size,
        velocityX: (60 + Math.random() * 180) * (Math.random() < 0.5 ? 1 : -1),
        velocityY: (60 + Math.random() * 180) * (Math.random() < 0.5 ? 1 : -1),
    }
}

function createBall(existing: Entity[]): Ball {
    let ball = randomBall();
    let attempts = 0;
    while (existing.some(e => collides(e, ball)) && attempts < 100) {
        ball = randomBall();
        attempts++;
    }
    if (existing.some(e => collides(e, ball))) {
        throw new Error("Failed to create a ball.");
    }
    return ball;
}

const objects: Entity[] = [
    { kind: "paddle", x: 200, y: 140, width: 40, height: 40, speed: 240 },
    { kind: "wall", x: 100, y: 100, width: 80, height: 10, color: "red" },
];

objects.push(createBall(objects));
objects.push(createBall(objects));

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

    // for the ball, update the position based on the velocity
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

    /* Collision checks */
    for (const object of objects) {
        // ball vs wall collision
        if (object.kind === "ball") {
            for (const wall of objects) {
                if (wall.kind === "wall") {
                    if (collides(wall, object)) {
                        resolveCollision(wall, object);
                    }
                }
            }
        }
    }

    // ball vs paddle collision
    for (const p of objects) {
        if (p.kind === "paddle") {
            for (const b of objects) {
                if (b.kind === "ball" && collides(p, b)) {
                    resolveCollision(p, b);
                }
            }
        }
    }

    // push out the paddle(s) from the wall (paddles against wall)
    for (const a of objects) {
        if (a.kind === "paddle") {
            for (const b of objects) {
                if (b.kind === "wall") {
                    if (collides(a, b)) {
                        pushOut(b, a);
                    }
                }
            }
        }
    }


    // ball vs ball collision
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const a = objects[i];
            const b = objects[j];
            // only if both are balls, and they collide
            if (a.kind === "ball" && b.kind === "ball" && collides(a, b)) {
                resolveCollision(a, b);
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
