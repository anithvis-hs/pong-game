export type Paddle = {
    kind: "paddle";
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    controller: "human" | "computer";
}

export type Ball = {
    kind: "ball";
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
}

export type Wall = {
    kind: "wall";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export type Entity = Paddle | Ball | Wall;
