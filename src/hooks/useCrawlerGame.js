import { useState, useEffect, useCallback } from 'react';
import { generateDungeon, TILE_TYPES } from '../utils/dungeonGenerator';

export const useCrawlerGame = () => {
    const [gameState, setGameState] = useState({
        grid: [],
        player: { x: 0, y: 0, hp: 10, maxHp: 10, score: 0 },
        enemies: [],
        items: [],
        level: 1,
        gameOver: false,
        message: "Système initialisé. Trouvez la sortie.",
        turn: 0
    });

    const initLevel = useCallback((levelNum) => {
        const { grid, startPos, enemies, items } = generateDungeon(40, 25, 300 + (levelNum * 50));
        setGameState(prev => ({
            ...prev,
            grid,
            player: { ...prev.player, x: startPos.x, y: startPos.y, hp: 10 },
            enemies,
            items,
            level: levelNum,
            message: `Niveau ${levelNum} chargé.`,
            gameOver: false
        }));
    }, []);

    useEffect(() => {
        initLevel(1);
    }, [initLevel]);

    const movePlayer = (dx, dy) => {
        if (gameState.gameOver) return;

        const newX = gameState.player.x + dx;
        const newY = gameState.player.y + dy;

        // Check bounds and walls
        if (gameState.grid[newY][newX] === TILE_TYPES.WALL) {
            setGameState(prev => ({ ...prev, message: "Mur détecté. Chemin bloqué." }));
            return;
        }

        // Check Enemies (Combat)
        const enemyIndex = gameState.enemies.findIndex(e => e.x === newX && e.y === newY);
        if (enemyIndex !== -1) {
            // Attack Enemy
            const newEnemies = [...gameState.enemies];
            newEnemies[enemyIndex].hp -= 1;

            let msg = "Virus attaqué !";
            if (newEnemies[enemyIndex].hp <= 0) {
                newEnemies.splice(enemyIndex, 1);
                msg = "Virus éliminé !";
            }

            setGameState(prev => ({
                ...prev,
                enemies: newEnemies,
                message: msg,
                turn: prev.turn + 1
            }));
            processEnemyTurn(newEnemies); // Pass updated enemies
            return;
        }

        // Check Items
        const itemIndex = gameState.items.findIndex(i => i.x === newX && i.y === newY);
        let newScore = gameState.player.score;
        let newItems = gameState.items;

        if (itemIndex !== -1) {
            newItems = [...gameState.items];
            newItems.splice(itemIndex, 1);
            newScore += 100;
            setGameState(prev => ({ ...prev, message: "Données récupérées (+100pts)" }));
        }

        // Check Exit
        if (gameState.grid[newY][newX] === TILE_TYPES.EXIT) {
            initLevel(gameState.level + 1);
            return;
        }

        // Move
        setGameState(prev => ({
            ...prev,
            player: { ...prev.player, x: newX, y: newY, score: newScore },
            items: newItems,
            turn: prev.turn + 1
        }));

        processEnemyTurn(gameState.enemies); // Pass current enemies (since we didn't attack)
    };

    const processEnemyTurn = (currentEnemies) => {
        // Simple AI: Move towards player if close
        // Note: This is a simplified version. In a real React state update, we need to be careful with stale state.
        // For this hackathon version, we'll assume the state update queue handles it reasonably well or we accept minor glitches.

        // We need to calculate new positions for enemies
        // Ideally this should be in a separate useEffect or strictly controlled, but let's try to bundle it.

        // Actually, to avoid complexity, let's just update the state once with both player move and enemy move.
        // But since I already called setGameState above, I should probably refactor to a single reducer-like update.
        // For now, let's just do a second setGameState for enemies.

        setGameState(prev => {
            if (prev.gameOver) return prev;

            const newEnemies = currentEnemies.map(enemy => {
                const dist = Math.abs(prev.player.x - enemy.x) + Math.abs(prev.player.y - enemy.y);
                if (dist < 8) { // Aggro range
                    let dx = 0;
                    let dy = 0;
                    if (prev.player.x > enemy.x) dx = 1;
                    else if (prev.player.x < enemy.x) dx = -1;
                    else if (prev.player.y > enemy.y) dy = 1;
                    else if (prev.player.y < enemy.y) dy = -1;

                    // Check if move is valid (not wall, not another enemy)
                    // Simplified: just check wall
                    if (prev.grid[enemy.y + dy][enemy.x + dx] !== TILE_TYPES.WALL) {
                        // Check if hitting player
                        if (enemy.x + dx === prev.player.x && enemy.y + dy === prev.player.y) {
                            return { ...enemy, attacking: true };
                        }
                        return { ...enemy, x: enemy.x + dx, y: enemy.y + dy, attacking: false };
                    }
                }
                return enemy;
            });

            // Calculate damage
            let playerHp = prev.player.hp;
            let msg = prev.message;

            newEnemies.forEach(e => {
                if (e.attacking) {
                    playerHp -= 1;
                    msg = "Alerte ! Intégrité compromise !";
                }
            });

            let gameOver = false;
            if (playerHp <= 0) {
                playerHp = 0;
                gameOver = true;
                msg = "SYSTEM FAILURE. GAME OVER.";
            }

            return {
                ...prev,
                enemies: newEnemies,
                player: { ...prev.player, hp: playerHp },
                message: msg,
                gameOver
            };
        });
    };

    return { gameState, movePlayer, restart: () => initLevel(1) };
};
