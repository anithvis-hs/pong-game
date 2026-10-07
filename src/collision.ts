import { Paddle, Ball, Wall, Entity } from "./entities.js";

type Hit = "left" | "right" | "above" | "below";

function overlap1D(aLeft: number, aRight: number, bLeft: number, bRight: number): boolean {
    return !(aRight < bLeft || aLeft > bRight);
}

export function collides(a: Entity, b: Entity): boolean {
    return overlap1D(a.x, a.x + a.width, b.x, b.x + b.width) && overlap1D(a.y, a.y + a.height, b.y, b.y + b.height);
}

function hitSide(obstacle: Entity, mover: Entity): Hit {
    const overlapX = Math.min(obstacle.x + obstacle.width, mover.x + mover.width) - Math.max(obstacle.x, mover.x);
    const overlapY = Math.min(obstacle.y + obstacle.height, mover.y + mover.height) - Math.max(obstacle.y, mover.y);

    if (overlapX < overlapY) {
        if (mover.x + mover.width / 2 < obstacle.x + obstacle.width / 2) {
            return "left";
        }
        return "right";
    } else {
        if (mover.y + mover.height / 2 < obstacle.y + obstacle.height / 2) {
            return "above";
        }
        return "below";
    }
}

export function resolveCollision(obstacle: Paddle | Wall, ball: Ball): void {
    const side = hitSide(obstacle, ball);
    switch (side) {
        case "left":
            ball.velocityX *= -1;
            ball.x = obstacle.x - ball.width;
            break;
        case "right":
            ball.velocityX *= -1;
            ball.x = obstacle.x + obstacle.width;
            break;
        case "above":
            ball.velocityY *= -1;
            ball.y = obstacle.y - ball.height;
            break;
        case "below":
            ball.velocityY *= -1;
            ball.y = obstacle.y + obstacle.height;
            break;
        default: {
            const unhandled: never = side;
            return unhandled;
        }
    }
}

export function pushOut(wall: Wall, paddle: Paddle): void {
    const side = hitSide(wall, paddle);
    switch (side) {
        case "left":
            paddle.x = wall.x - paddle.width;
            break;
        case "right":
            paddle.x = wall.x + wall.width;
            break;
        case "above":
            paddle.y = wall.y - paddle.height;
            break;
        case "below":
            paddle.y = wall.y + wall.height;
            break;
        default: {
            const unhandled: never = side;
            return unhandled;
        }
    }
}