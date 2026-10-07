"use strict";
const objects = [
    { x: 200, y: 140, width: 40, height: 40, speed: 4, controllable: true, velocityX: 0, velocityY: 0 },
    { x: 50, y: 50, width: 20, height: 20, speed: 2, controllable: false, velocityX: 1, velocityY: 2 },
    { x: 300, y: 200, width: 20, height: 20, speed: 2, controllable: false, velocityX: -2, velocityY: 1 },
];
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// know whether the current key is held
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
function clamp(value, min, max) {
    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }
    return value;
}
function overlap1D(aLeft, aRight, bLeft, bRight) {
    return !(aRight < bLeft || aLeft > bRight);
}
function collides(a, b) {
    return overlap1D(a.x, a.x + a.width, b.x, b.x + b.width) && overlap1D(a.y, a.y + a.height, b.y, b.y + b.height);
}
function resolveCollision(paddle, ball) {
    const overlapX = Math.min(paddle.x + paddle.width, ball.x + ball.width) - Math.max(paddle.x, ball.x);
    const overlapY = Math.min(paddle.y + paddle.height, ball.y + ball.height) - Math.max(paddle.y, ball.y);
    if (overlapX < overlapY) {
        ball.velocityX *= -1;
        if (ball.x + ball.width / 2 < paddle.x + paddle.width / 2) {
            ball.x = paddle.x - ball.width; // ball on the left of the paddle
        }
        else {
            ball.x = paddle.x + paddle.width; // ball on the right of the paddle
        }
    }
    else {
        ball.velocityY *= -1;
        if (ball.y + ball.height / 2 < paddle.y + paddle.height / 2) {
            ball.y = paddle.y - ball.height; // ball above the paddle
        }
        else {
            ball.y = paddle.y + paddle.height; // ball below the paddle
        }
    }
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
    for (const object of objects) {
        if (!object.controllable) {
            if (collides(objects[0], object)) {
                resolveCollision(objects[0], object);
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
