export enum SubType {
    BOOM = 'BOOM',
    GRAVITY = 'GRAVITY',
    ROCKET = 'ROCKET',
}
export enum Turn {
    START,
    MATCH,
    END,
}
export enum Theme {
    NONE = '',
    CAKE = 'Img0_',
    FRUIT = 'Img1_',
    FISH = 'Img2_',
    CHAR = 'Img3_',
    VEHICLE = 'Img4_',
    ANIMAL = 'Img5_',
    FASHION = 'Img6_',
    SHELL = 'Img7_',
    BUTTERFLY = 'Img8_',
    DRINK = 'Img9_',
}

export function getTilePath(id: number, theme: Theme): string {
    return `sprite/AllTiles/${theme + String(id)}/spriteFrame`
}
