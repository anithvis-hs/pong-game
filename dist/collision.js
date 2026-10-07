function overlap1D(aLeft, aRight, bLeft, bRight) {
    return !(aRight < bLeft || aLeft > bRight);
}
export function collides(a, b) {
    return overlap1D(a.x, a.x + a.width, b.x, b.x + b.width) && overlap1D(a.y, a.y + a.height, b.y, b.y + b.height);
}
export function resolveCollision(paddle, ball) {
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
