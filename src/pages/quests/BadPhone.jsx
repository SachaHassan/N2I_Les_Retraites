import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const BadPhone = () => {
    // Phone State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const wheelRef = useRef(null);

    // Address State
    const [address, setAddress] = useState('');
    const [keyMapping, setKeyMapping] = useState({});

    // PIN State
    const [pin, setPin] = useState(['', '', '', '']);
    const [scatteredNumbers, setScatteredNumbers] = useState([]);

    // Validation State
    const [validatedCards, setValidatedCards] = useState(new Set());
    const [showSuccess, setShowSuccess] = useState(false);

    // --- Phone Logic ---
    const segments = 10;
    const segmentAngle = 360 / segments;

    const spinWheel = () => {
        if (isSpinning) return;
        setIsSpinning(true);

        const extraSpins = 5;
        const randomDegree = Math.floor(Math.random() * 360);
        const newRotation = rotation + (360 * extraSpins) + randomDegree;

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            calculateResult(newRotation);
        }, 4000);
    };

    const calculateResult = (rot) => {
        let angle = rot % 360;
        if (angle < 0) angle += 360;
        const index = Math.floor(angle / 36);
        const number = index % 10;
        setPhoneNumber(prev => prev + number);
    };

    // --- Address Logic ---
    useEffect(() => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
        const chars = alphabet.split('');
        const shuffled = [...chars];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const mapping = {};
        for (let i = 0; i < chars.length; i++) {
            mapping[chars[i]] = shuffled[i];
        }
        setKeyMapping(mapping);
    }, []);

    const handleAddressKeyDown = (e) => {
        if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        const char = e.key;
        if (keyMapping[char]) {
            setAddress(prev => prev + keyMapping[char]);
        }
    };

    // --- PIN Logic ---
    const generatePinNumbers = () => {
        const newNumbers = [];
        for (let i = 0; i < 20; i++) {
            newNumbers.push({
                id: Math.random().toString(36).substr(2, 9),
                value: Math.floor(Math.random() * 10),
                x: Math.random() * (window.innerWidth - 50),
                y: Math.random() * (window.innerHeight - 50)
            });
        }
        setScatteredNumbers(newNumbers);
    };

    const handleDragStart = (e, num) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(num));
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;
        const num = JSON.parse(data);

        const newPin = [...pin];
        newPin[index] = num.value;
        setPin(newPin);

        // Remove from scattered
        setScatteredNumbers(prev => prev.filter(n => n.id !== num.id));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // --- Validation ---
    const validateCard = (cardId) => {
        if (cardId === 'card-phone' && phoneNumber.length !== 10) {
            alert("Le numéro de téléphone doit faire exactement 10 chiffres !");
            return;
        }

        setValidatedCards(prev => {
            const newSet = new Set(prev);
            newSet.add(cardId);
            if (newSet.size === 3) {
                setTimeout(() => setShowSuccess(true), 500);
            }
            return newSet;
        });
    };

    const isCardValidated = (id) => validatedCards.has(id);

    return (
        <div style={{ minHeight: '80vh', padding: '20px', backgroundColor: '#f0f2f5', fontFamily: "'Inter', sans-serif" }}>
            <Link to="/" style={{ display: 'block', marginBottom: '20px', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>← Retour</Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

                {/* Phone Card */}
                <div style={{
                    background: isCardValidated('card-phone') ? '#f0fdf4' : 'white',
                    border: isCardValidated('card-phone') ? '1px solid #22c55e' : '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    pointerEvents: isCardValidated('card-phone') ? 'none' : 'auto',
                    opacity: isCardValidated('card-phone') ? 0.8 : 1
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '5px', color: '#111827' }}>Numéro de téléphone</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '20px' }}>Tournez la roue pour composer.</p>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input type="text" readOnly value={phoneNumber} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                        <button onClick={() => setPhoneNumber('')} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>Effacer</button>
                    </div>

                    <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto 20px' }}>
                        {/* Pointer */}
                        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #ef4444', zIndex: 20 }}></div>

                        {/* Wheel */}
                        <div ref={wheelRef} style={{
                            width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #e5e7eb',
                            position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                            transform: `rotate(-${rotation}deg)`,
                            background: 'conic-gradient(#ef4444 0deg 36deg, #0f172a 36deg 72deg, #ef4444 72deg 108deg, #0f172a 108deg 144deg, #ef4444 144deg 180deg, #0f172a 180deg 216deg, #ef4444 216deg 252deg, #0f172a 252deg 288deg, #ef4444 288deg 324deg, #0f172a 324deg 360deg)'
                        }}>
                            {[...Array(10)].map((_, i) => (
                                <div key={i} style={{
                                    position: 'absolute', top: 0, left: '50%', height: '50%', width: '40px', marginLeft: '-20px',
                                    transformOrigin: 'bottom center', transform: `rotate(${i * 36 + 18}deg)`,
                                    display: 'flex', justifyContent: 'center', paddingTop: '10px', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', pointerEvents: 'none'
                                }}>
                                    {i}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={spinWheel} disabled={isSpinning} style={{ width: '100%', padding: '10px', background: '#0f172a', color: 'white', borderRadius: '6px', border: 'none', cursor: isSpinning ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
                        TOURNER LA ROUE
                    </button>
                    <button onClick={() => validateCard('card-phone')} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                        Valider mes informations
                    </button>
                </div>

                {/* Address Card */}
                <div style={{
                    background: isCardValidated('card-address') ? '#f0fdf4' : 'white',
                    border: isCardValidated('card-address') ? '1px solid #22c55e' : '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    pointerEvents: isCardValidated('card-address') ? 'none' : 'auto',
                    opacity: isCardValidated('card-address') ? 0.8 : 1
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '5px', color: '#111827' }}>Adresse Postale</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '20px' }}>Tapez votre adresse (Clavier aléatoire).</p>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '5px' }}>Votre adresse</label>
                        <input
                            type="text"
                            value={address}
                            onKeyDown={handleAddressKeyDown}
                            onChange={() => { }} // Controlled by onKeyDown
                            placeholder="Entrez votre adresse..."
                            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>Attention : Les touches de votre clavier ont été mélangées.</p>
                    </div>

                    <button onClick={() => validateCard('card-address')} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', marginTop: 'auto' }}>
                        Valider mes informations
                    </button>
                </div>

                {/* PIN Card */}
                <div style={{
                    background: isCardValidated('card-pin') ? '#f0fdf4' : 'white',
                    border: isCardValidated('card-pin') ? '1px solid #22c55e' : '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    pointerEvents: isCardValidated('card-pin') ? 'none' : 'auto',
                    opacity: isCardValidated('card-pin') ? 0.8 : 1
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '5px', color: '#111827' }}>Code PIN</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '20px' }}>Glissez les chiffres dans les cases.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                        {pin.map((digit, i) => (
                            <div
                                key={i}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragOver={handleDragOver}
                                style={{
                                    width: '50px', height: '50px', border: '2px dashed #d1d5db', borderRadius: '6px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold',
                                    background: digit ? '#eff6ff' : '#f9fafb', borderColor: digit ? '#3b82f6' : '#d1d5db'
                                }}
                            >
                                {digit}
                            </div>
                        ))}
                    </div>

                    <button onClick={generatePinNumbers} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}>
                        Générer des chiffres
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>Cliquez pour faire apparaître des chiffres aléatoirement sur l'écran.</p>

                    <button onClick={() => validateCard('card-pin')} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                        Valider mes informations
                    </button>
                </div>
            </div>

            {/* Scattered Numbers */}
            {scatteredNumbers.map(num => (
                <div
                    key={num.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, num)}
                    style={{
                        position: 'fixed', left: num.x, top: num.y,
                        width: '40px', height: '40px', background: '#0f172a', color: 'white', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold',
                        cursor: 'grab', zIndex: 100, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {num.value}
                </div>
            ))}

            {/* Success Modal */}
            {showSuccess && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: '#16a34a' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Félicitations !</h2>
                        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Vous avez tout rempli avec succès (et beaucoup de patience).</p>
                        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Recommencer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BadPhone;
