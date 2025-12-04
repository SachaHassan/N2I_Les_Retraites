import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UglyPage = () => {
    const [text, setText] = useState('');
    const fullText = `
    > INITIALIZING CONNECTION...
    > ERROR: UNAUTHORIZED ACCESS
    > SYSTEM LOCKED
    > HINT DETECTED:
    
    > LOOK UP TO THE SKY... TWICE.
    > LOOK DOWN TO THE ABYSS... TWICE.
    > LOOK LEFT, LOOK RIGHT.
    > LOOK LEFT, LOOK RIGHT.
    > PRESS 'B' TO BYPASS.
    > PRESS 'A' TO ACCEPT.
    
    > WAITING FOR INPUT...
    `;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            backgroundColor: '#000',
            color: '#0f0',
            fontFamily: "'Courier New', Courier, monospace",
            minHeight: '100vh',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textShadow: '0 0 5px #0f0'
        }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
                <h1 style={{ borderBottom: '2px solid #0f0', paddingBottom: '10px', marginBottom: '20px' }}>
                    HIDDEN_SNAKE_v1.0
                </h1>

                <pre style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '1.2rem',
                    minHeight: '400px'
                }}>
                    {text}
                    <span className="cursor">_</span>
                </pre>

                <div style={{ marginTop: '40px', borderTop: '1px solid #0f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        STATUS: WAITING_FOR_KEY_SEQUENCE
                    </div>
                    <Link to="/" style={{ color: '#0f0', textDecoration: 'none', border: '1px solid #0f0', padding: '5px 10px' }}>
                        &lt; ABORT_MISSION
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
                .cursor { animation: blink 1s infinite; }
                body { background-color: #000 !important; }
            `}</style>
        </div>
    );
};

export default UglyPage;
