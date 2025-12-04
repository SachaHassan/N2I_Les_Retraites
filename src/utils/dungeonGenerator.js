// Simple Random Walk Dungeon Generator
export const TILE_TYPES = {
    WALL: 0,
    FLOOR: 1,
    EXIT: 2,
    PLAYER: 3,
    ENEMY: 4,
    ITEM: 5
};

export const generateDungeon = (width = 40, height = 25, maxSteps = 400) => {
    // Initialize grid with walls
    const grid = Array(height).fill().map(() => Array(width).fill(TILE_TYPES.WALL));

    // Start in the middle
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);
    const startPos = { x, y };

    grid[y][x] = TILE_TYPES.FLOOR;

    let steps = 0;
    const path = [{ x, y }];

    // Random Walk
    while (steps < maxSteps) {
        const direction = Math.floor(Math.random() * 4);
        let nextX = x;
        let nextY = y;

        switch (direction) {
            case 0: nextY--; break; // Up
            case 1: nextY++; break; // Down
            case 2: nextX--; break; // Left
            case 3: nextX++; break; // Right
        }

        // Check bounds (leave 1 tile border)
        if (nextX > 1 && nextX < width - 2 && nextY > 1 && nextY < height - 2) {
            x = nextX;
            y = nextY;
            if (grid[y][x] === TILE_TYPES.WALL) {
                grid[y][x] = TILE_TYPES.FLOOR;
                steps++;
                path.push({ x, y });
            }
        }
    }

    // Place Exit (furthest point roughly)
    const exitPos = path[path.length - 1];
    grid[exitPos.y][exitPos.x] = TILE_TYPES.EXIT;

    // Place some enemies
    const enemies = [];
    const enemyCount = Math.floor(maxSteps / 60); // Reduced spawn rate
    for (let i = 0; i < enemyCount; i++) {
        const randomSpot = path[Math.floor(Math.random() * path.length)];

        // Calculate distance from start
        const distFromStart = Math.abs(randomSpot.x - startPos.x) + Math.abs(randomSpot.y - startPos.y);

        // Don't place on start/exit, and ensure safe zone (distance > 8)
        if ((randomSpot.x !== startPos.x || randomSpot.y !== startPos.y) &&
            (randomSpot.x !== exitPos.x || randomSpot.y !== exitPos.y) &&
            distFromStart > 8) {
            enemies.push({ x: randomSpot.x, y: randomSpot.y, id: i, hp: 1 }); // HP reduced to 1
        }
    }

    // Place some items (Data Packets)
    const items = [];
    const itemCount = Math.floor(maxSteps / 30);
    for (let i = 0; i < itemCount; i++) {
        const randomSpot = path[Math.floor(Math.random() * path.length)];
        if ((randomSpot.x !== startPos.x || randomSpot.y !== startPos.y) &&
            (randomSpot.x !== exitPos.x || randomSpot.y !== exitPos.y)) {
            items.push({ x: randomSpot.x, y: randomSpot.y, id: i, type: 'DATA' });
        }
    }

    return { grid, startPos, enemies, items };
};
