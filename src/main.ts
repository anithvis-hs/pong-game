import { Paddle, Ball, Wall, Entity } from "./entities.js";
import { collides, resolveCollision, pushOut } from "./collision.js";
import { clamp } from "./math.js";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let scoreHuman = 0;
let scoreComputer = 0;
const winScore = 5;
let gameOver = false;

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

let objects: Entity[] = [
    { kind: "paddle", x: 20, y: (canvas.height - 60) / 2, width: 10, height: 60, speed: 240, controller: "human" },
    { kind: "paddle", x: canvas.width - 30, y: (canvas.height - 60) / 2, width: 10, height: 60, speed: 240, controller: "computer" },
    { kind: "wall", x: 0, y: 0, width: canvas.width, height: 10, color: "red" },
    { kind: "wall", x: 0, y: canvas.height - 10, width: canvas.width, height: 10, color: "red" },
];

objects.push(createBall(objects));

function resetGame() {
    scoreHuman = 0;
    scoreComputer = 0;
    gameOver = false;
    objects = objects.filter(o => o.kind !== "ball");
    objects.push(createBall(objects));
    const humanPaddle = objects.find((o): o is Paddle => o.kind === "paddle" && o.controller === "human");
    if (humanPaddle) {
        humanPaddle.y = (canvas.height - humanPaddle.height) / 2;
    }
    const computerPaddle = objects.find((o): o is Paddle => o.kind === "paddle" && o.controller === "computer");
    if (computerPaddle) {
        computerPaddle.y = (canvas.height - computerPaddle.height) / 2;
    }
}

// know whether the current key is held
const keys: Record<string, boolean> = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function update(deltaTime: number) {
    if (gameOver && keys["Enter"]) {
        resetGame();
    }
    if (gameOver) {
        return;
    }

    const target = objects.find(o => o.kind === "ball");

    const paddle = objects.find((o): o is Paddle => o.kind === "paddle" && o.controller === "human");
    if (!paddle) {
        throw new Error("Paddle not found");
    }
    const computerPaddle = objects.find((o): o is Paddle => o.kind === "paddle" && o.controller === "computer");
    if (target && computerPaddle) {
        // the AI paddle's if / else if goes here
        if (target.y < computerPaddle.y) {
            computerPaddle.y -= computerPaddle.speed * deltaTime;
        } else if (target.y > computerPaddle.y + computerPaddle.height) {
            computerPaddle.y += computerPaddle.speed * deltaTime;
        }
    }

    /* keyboard control for human paddle */
    // if (keys["ArrowRight"]) {
    //     paddle.x += paddle.speed * deltaTime;
    // }
    // if (keys["ArrowLeft"]) {
    //     paddle.x -= paddle.speed * deltaTime;
    // }
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
                scoreHuman++;
                object.x = (canvas.width - object.width) / 2;
                object.y = (canvas.height - object.height) / 2;
                // object.velocityX *= -1;
            }
            if (object.x < 0) {
                scoreComputer++;
                object.x = (canvas.width - object.width) / 2;
                object.y = (canvas.height - object.height) / 2;
                // object.velocityX *= -1;
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

    /* Score and game over checks */
    if (scoreHuman >= winScore || scoreComputer >= winScore) {
        gameOver = true;
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

    ctx.textAlign = "left";
    ctx.font = "18px sans-serif";
    ctx.fillText("You: " + scoreHuman, 20, 40);
    ctx.fillText("Computer: " + scoreComputer, 20, 80);

    if (gameOver) {
        ctx.textAlign = "center";
        ctx.fillText(scoreHuman >= winScore ? "You win!" : "Computer wins!", canvas.width / 2, canvas.height / 2);
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
