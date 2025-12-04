import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCrawlerGame } from '../../hooks/useCrawlerGame';
import { TILE_TYPES } from '../../utils/dungeonGenerator';

const CyberCrawler = () => {
    const { gameState, movePlayer, restart } = useCrawlerGame();
    const containerRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp': movePlayer(0, -1); break;
                case 'ArrowDown': movePlayer(0, 1); break;
                case 'ArrowLeft': movePlayer(-1, 0); break;
                case 'ArrowRight': movePlayer(1, 0); break;
                case 'r': restart(); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, restart]);

    // Focus container on mount
    useEffect(() => {
        if (containerRef.current) containerRef.current.focus();
    }, []);

    const getTileChar = (type, x, y) => {
        // Check dynamic entities first
        if (gameState.player.x === x && gameState.player.y === y) return '@';
        if (gameState.enemies.some(e => e.x === x && e.y === y)) return '👾';
        if (gameState.items.some(i => i.x === x && i.y === y)) return '💾';

        switch (type) {
            case TILE_TYPES.WALL: return '#';
            case TILE_TYPES.FLOOR: return '.';
            case TILE_TYPES.EXIT: return '>';
            default: return '?';
        }
    };

    const getTileColor = (type, x, y) => {
        if (gameState.player.x === x && gameState.player.y === y) return '#0f0'; // Green Player
        if (gameState.enemies.some(e => e.x === x && e.y === y)) return '#f00'; // Red Enemy
        if (gameState.items.some(i => i.x === x && i.y === y)) return '#0ff'; // Cyan Item

        switch (type) {
            case TILE_TYPES.WALL: return '#333';
            case TILE_TYPES.FLOOR: return '#111';
            case TILE_TYPES.EXIT: return '#ff0';
            default: return '#000';
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '80vh',
                backgroundColor: '#000',
                color: '#0f0',
                fontFamily: 'monospace',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #0f0', paddingBottom: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, textShadow: '0 0 10px #0f0' }}>PIXEL GAME v1.0</h1>
                    <p style={{ margin: 0, opacity: 0.7 }}>Niveau: {gameState.level}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>INTEGRITÉ: {gameState.player.hp}/{gameState.player.maxHp}</p>
                    <p style={{ margin: 0 }}>SCORE: {gameState.player.score}</p>
                </div>
            </div>

            <div style={{
                position: 'relative',
                border: '2px solid #0f0',
                padding: '10px',
                backgroundColor: '#050505',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)'
            }}>
                {gameState.gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                    }}>
                        <h2 style={{ color: 'red', fontSize: '3rem', marginBottom: '20px' }}>GAME OVER</h2>
                        <button onClick={restart} className="btn" style={{ backgroundColor: '#0f0', color: '#000', border: 'none' }}>
                            REINITIALISER SYSTEME (R)
                        </button>
                    </div>
                )}

                {gameState.grid.map((row, y) => (
                    <div key={y} style={{ display: 'flex', lineHeight: '1' }}>
                        {row.map((tile, x) => (
                            <span
                                key={`${x}-${y}`}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    display: 'inline-flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: getTileColor(tile, x, y),
                                    backgroundColor: tile === TILE_TYPES.FLOOR ? '#0a0a0a' : 'transparent'
                                }}
                            >
                                {getTileChar(tile, x, y)}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '20px',
                width: '100%',
                maxWidth: '1000px',
                border: '1px solid #333',
                padding: '10px',
                minHeight: '60px'
            }}>
                <span style={{ color: '#0f0' }}>&gt; </span>
                <span style={{ color: '#fff' }}>{gameState.message}</span>
                <span className="animate-blink">_</span>
            </div>

            <div style={{ marginTop: '20px' }}>
                <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>[ ECHAPPER AU SYSTEME ]</Link>
            </div>

            <style>{`
        .animate-blink { animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
        </div>
    );
};

export default CyberCrawler;
