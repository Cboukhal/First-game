// ===== VARIABLES GLOBALES =====
let selectedClass = null;
let gameState = {
    niveau: 1,
    tour: 0,
    pnj: {
        pv: 100,
        pvMax: 100,
        attaque: 10,
        defense: 10,
        magie: 5,
        degats: 5
    },
    mob: {
        pv: 50,
        pvMax: 50,
        attaque: 8,
        defense: 8,
        degats: 4
    },
    portee: null,
    attaqueActuelle: 0,
    defenseActuelle: 0
};

// ===== FONCTIONS UTILITAIRES =====

function lancerDe(faces) {
    return Math.floor(Math.random() * faces) + 1;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const logDiv = document.getElementById('combat-log');
    if (logDiv) {
        const colors = {
            'info': '#94a3b8',
            'success': '#22c55e',
            'danger': '#ef4444',
            'warning': '#fbbf24'
        };
        
        const p = document.createElement('p');
        p.style.color = colors[type] || colors.info;
        p.style.margin = '0.5rem 0';
        p.textContent = message;
        logDiv.appendChild(p);
        
        logDiv.scrollTop = logDiv.scrollHeight;
    }
}

// ===== ANIMATION DE DÉ =====
function afficherAnimationDe(faces, callback) {
    const diceOverlay = document.createElement('div');
    diceOverlay.id = 'dice-overlay';
    diceOverlay.innerHTML = `
        <div class="dice-container">
            <div class="dice" id="animated-dice">🎲</div>
            <p class="dice-label">Lancer de dé...</p>
        </div>
    `;
    document.body.appendChild(diceOverlay);
    
    const dice = document.getElementById('animated-dice');
    let counter = 0;
    const maxRolls = 15;
    
    const rollInterval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * faces) + 1;
        dice.textContent = randomNum;
        dice.style.transform = `rotate(${counter * 45}deg) scale(${1 + Math.sin(counter) * 0.2})`;
        counter++;
        
        if (counter >= maxRolls) {
            clearInterval(rollInterval);
            const finalResult = lancerDe(faces);
            dice.textContent = finalResult;
            dice.style.transform = 'rotate(0deg) scale(1.5)';
            dice.classList.add('dice-final');
            
            setTimeout(() => {
                diceOverlay.remove();
                callback(finalResult);
            }, 800);
        }
    }, 80);
}

// ===== MISE À JOUR DES BARRES DE VIE =====
function updateHP() {
    const playerHPBar = document.getElementById('player-hp-bar');
    const enemyHPBar = document.getElementById('enemy-hp-bar');
    const playerHPText = document.getElementById('player-hp-text');
    const enemyHPText = document.getElementById('enemy-hp-text');
    
    if (playerHPBar && playerHPText) {
        const playerPercent = (gameState.pnj.pv / gameState.pnj.pvMax) * 100;
        playerHPBar.style.width = playerPercent + '%';
        playerHPText.textContent = `${gameState.pnj.pv} / ${gameState.pnj.pvMax} PV`;
        
        // Changement de couleur selon les PV
        if (playerPercent > 50) {
            playerHPBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
        } else if (playerPercent > 25) {
            playerHPBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            playerHPBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
    
    if (enemyHPBar && enemyHPText) {
        const enemyPercent = (gameState.mob.pv / gameState.mob.pvMax) * 100;
        enemyHPBar.style.width = enemyPercent + '%';
        enemyHPText.textContent = `${gameState.mob.pv} / ${gameState.mob.pvMax} PV`;
    }
}

// ===== INITIALISATION DU JEU =====

function initGame() {
    const cards = document.querySelectorAll('.classe-card');
    const btnStart = document.getElementById('btnStart');

    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', function() {
                selectClass(this, cards, btnStart);
            });
        });
    }

    if (btnStart) {
        btnStart.addEventListener('click', function() {
            startGame();
        });
    }
}

// ===== SÉLECTION DE CLASSE =====

function selectClass(selectedCard, allCards, button) {
    allCards.forEach(c => c.classList.remove('selected'));
    selectedCard.classList.add('selected');
    selectedClass = selectedCard.dataset.classe;
    
    if (button) {
        button.classList.add('active');
    }
    
    console.log('Classe sélectionnée:', selectedClass);
}

function getClassStats(className) {
    const classData = {
        guerrier: {
            name: 'Guerrier',
            icon: '⚔️',
            stats: {
                pv: 120,
                attaque: 12,
                defense: 10,
                magie: 3,
                degats: 8
            },
            skills: ['Coup puissant', 'Bouclier', 'Sang froid']
        },
        mage: {
            name: 'Mage',
            icon: '🔮',
            stats: {
                pv: 80,
                attaque: 6,
                defense: 5,
                magie: 15,
                degats: 4
            },
            skills: ['Flamme', 'Coup rapide', 'Protection']
        },
        voleur: {
            name: 'Voleur',
            icon: '🗡️',
            stats: {
                pv: 100,
                attaque: 10,
                defense: 7,
                magie: 5,
                degats: 6
            },
            skills: ['Frappe mortelle', 'Frappe multiple', 'Esquive']
        }
    };
    
    return classData[className] || null;
}

// ===== DÉMARRAGE DU JEU =====

function startGame() {
    if (selectedClass) {
        console.log('Démarrage du jeu avec la classe:', selectedClass);
        
        const classStats = getClassStats(selectedClass);
        gameState.pnj = {
            ...gameState.pnj,
            ...classStats.stats,
            pvMax: classStats.stats.pv
        };
        
        localStorage.setItem('playerClass', selectedClass);
        
        // Cache l'écran de sélection
        document.querySelector('.jeu').style.display = 'none';
        
        // Crée la zone de jeu avec barres de vie
        const gameArea = document.createElement('div');
        gameArea.id = 'game-area';
        gameArea.innerHTML = `
            <h3>Combat - Niveau ${gameState.niveau}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div class="hp-container">
                    <h4 style="color: #22c55e; margin-bottom: 0.5rem;">🛡️ Vous (${classStats.name})</h4>
                    <div class="hp-bar-container">
                        <div class="hp-bar" id="player-hp-bar" style="width: 100%;"></div>
                    </div>
                    <p id="player-hp-text" class="hp-text">${gameState.pnj.pv} / ${gameState.pnj.pvMax} PV</p>
                </div>
                <div class="hp-container">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">👹 Ennemi</h4>
                    <div class="hp-bar-container">
                        <div class="hp-bar enemy-hp" id="enemy-hp-bar" style="width: 100%;"></div>
                    </div>
                    <p id="enemy-hp-text" class="hp-text">${gameState.mob.pv} / ${gameState.mob.pvMax} PV</p>
                </div>
            </div>
            
            <div id="combat-log"></div>
            
            <div id="actions-container">
                <h4 style="text-align: center; margin-bottom: 1rem;">⚔️ Choisissez votre position</h4>
                <div class="actions-grid">
                    <button class="action-btn" onclick="choisirEtAttaquer('longue')">
                        🏹 Longue portée<br>
                        <small>Attaque -25% | Défense +25%</small>
                    </button>
                    <button class="action-btn" onclick="choisirEtAttaquer('moyenne')">
                        ⚔️ Portée moyenne<br>
                        <small>Stats normales</small>
                    </button>
                    <button class="action-btn" onclick="choisirEtAttaquer('courte')">
                        🗡️ Courte portée<br>
                        <small>Attaque +25% | Défense -25%</small>
                    </button>
                </div>
            </div>
        `;
        
        // Ajoute les styles CSS
        const style = document.createElement('style');
        style.textContent = `
            #game-area {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .hp-container {
                background: rgba(0, 0, 0, 0.3);
                padding: 1rem;
                border-radius: 10px;
                border: 2px solid rgba(139, 92, 246, 0.3);
            }
            
            .hp-bar-container {
                background: rgba(0, 0, 0, 0.5);
                height: 30px;
                border-radius: 15px;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.1);
                box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
            }
            
            .hp-bar {
                height: 100%;
                background: linear-gradient(90deg, #22c55e, #16a34a);
                transition: width 0.5s ease, background 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
                position: relative;
            }
            
            .hp-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255,255,255,0.3), transparent);
                border-radius: 15px 15px 0 0;
            }
            
            .enemy-hp {
                background: linear-gradient(90deg, #ef4444, #dc2626);
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
            }
            
            .hp-text {
                text-align: center;
                margin-top: 0.5rem;
                font-weight: bold;
                font-size: 1.1rem;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            #combat-log {
                background: rgba(0, 0, 0, 0.5);
                padding: 1rem;
                border-radius: 10px;
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                margin: 2rem 0;
                border: 2px solid rgba(139, 92, 246, 0.3);
            }
            
            .actions-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }
            
            .action-btn {
                background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                color: white;
                border: 2px solid transparent;
                padding: 1.5rem 1rem;
                border-radius: 10px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
                font-weight: bold;
            }
            
            .action-btn:hover:not(:disabled) {
                border-color: #fbbf24;
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
            }
            
            .action-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .action-btn small {
                display: block;
                margin-top: 0.5rem;
                font-size: 0.8rem;
                opacity: 0.9;
                font-weight: normal;
            }
            
            #dice-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            .dice-container {
                text-align: center;
            }
            
            .dice {
                font-size: 8rem;
                animation: bounce 0.5s ease infinite;
                transition: all 0.1s ease;
                filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8));
            }
            
            .dice-final {
                animation: none !important;
                color: #fbbf24;
                filter: drop-shadow(0 0 50px rgba(251, 191, 36, 1));
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            
            .dice-label {
                color: #fbbf24;
                font-size: 1.5rem;
                margin-top: 1rem;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
            }
            
            @media (max-width: 768px) {
                .actions-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.querySelector('.environnement > div').appendChild(gameArea);
        
        launchGameplay();
    } else {
        alert('Veuillez d\'abord sélectionner une classe !');
    }
}

// ===== GAMEPLAY PRINCIPAL =====

function launchGameplay() {
    logMessage('=== DÉBUT DE L\'AVENTURE ===', 'success');
    logMessage(`Vous êtes un ${getClassStats(selectedClass).name}`, 'info');
    
    genererEnnemi(gameState.niveau);
}

// ===== GÉNÉRATION D'ENNEMI =====

function genererEnnemi(niveau) {
    gameState.mob = {
        pv: 40 + (niveau * 10),
        pvMax: 40 + (niveau * 10),
        attaque: 6 + niveau,
        defense: 6 + niveau,
        degats: 3 + niveau
    };
    
    logMessage(`Un ennemi de niveau ${niveau} apparaît !`, 'danger');
    logMessage(`PV Ennemi: ${gameState.mob.pv}`, 'info');
    updateHP();
}

// ===== GESTION DES ACTIONS DU JOUEUR =====

function choisirEtAttaquer(porteeChoisie) {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    gameState.tour++;
    logMessage(`\n--- TOUR ${gameState.tour} ---`, 'warning');
    
    gameState.portee = porteeChoisie;
    logMessage(`Vous choisissez la ${porteeChoisie} portée`, 'info');
    
    if (gameState.portee === 'longue') {
        gameState.attaqueActuelle = gameState.pnj.attaque - (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense + (gameState.pnj.defense * 0.25);
        logMessage('Attaque -25%, Défense +25%', 'info');
    } else if (gameState.portee === 'moyenne') {
        gameState.attaqueActuelle = gameState.pnj.attaque;
        gameState.defenseActuelle = gameState.pnj.defense;
        logMessage('Stats normales', 'info');
    } else {
        gameState.attaqueActuelle = gameState.pnj.attaque + (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense - (gameState.pnj.defense * 0.25);
        logMessage('Attaque +25%, Défense -25%', 'info');
    }
    
    // Lance l'animation de dé pour le tour du joueur
    setTimeout(() => {
        tourJoueur(buttons);
    }, 500);
}

// ===== TOUR DU JOUEUR =====

function tourJoueur(buttons) {
    logMessage('\n🗡️ Votre tour !', 'info');
    
    afficherAnimationDe(20, (de20) => {
        const jetAttaque = Math.floor(gameState.attaqueActuelle) + de20;
        
        logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} = ${jetAttaque}`, 'info');
        logMessage(`Défense ennemie: ${gameState.mob.defense}`, 'info');
        
        if (jetAttaque >= gameState.mob.defense) {
            logMessage('✓ Vous touchez l\'ennemi !', 'success');
            
            setTimeout(() => {
                afficherAnimationDe(6, (de6) => {
                    const degats = gameState.pnj.degats + de6;
                    
                    logMessage(`Dégâts: ${gameState.pnj.degats} + ${de6} = ${degats}`, 'success');
                    
                    gameState.mob.pv -= degats;
                    if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                    
                    logMessage(`L'ennemi perd ${degats} PV ! (PV restants: ${gameState.mob.pv})`, 'danger');
                    updateHP();
                    
                    if (gameState.mob.pv <= 0) {
                        logMessage('L\'ennemi est vaincu !', 'success');
                        setTimeout(() => finDePartie(), 1500);
                    } else {
                        setTimeout(() => tourEnnemi(buttons), 1500);
                    }
                });
            }, 500);
        } else {
            logMessage('✗ Vous ratez votre attaque !', 'danger');
            setTimeout(() => tourEnnemi(buttons), 1500);
        }
    });
}

// ===== TOUR DE L'ENNEMI =====

function tourEnnemi(buttons) {
    logMessage('\n👹 Tour de l\'ennemi !', 'warning');
    
    afficherAnimationDe(20, (de20) => {
        const jetAttaque = gameState.mob.attaque + de20;
        
        logMessage(`Jet d'attaque: ${de20} + ${gameState.mob.attaque} = ${jetAttaque}`, 'warning');
        logMessage(`Votre défense: ${Math.floor(gameState.defenseActuelle)}`, 'info');
        
        if (jetAttaque >= Math.floor(gameState.defenseActuelle)) {
            logMessage('✓ L\'ennemi vous touche !', 'danger');
            
            setTimeout(() => {
                afficherAnimationDe(6, (de6) => {
                    const degats = gameState.mob.degats + de6;
                    
                    logMessage(`Dégâts: ${gameState.mob.degats} + ${de6} = ${degats}`, 'danger');
                    
                    gameState.pnj.pv -= degats;
                    if (gameState.pnj.pv < 0) gameState.pnj.pv = 0;
                    
                    logMessage(`Vous perdez ${degats} PV ! (PV restants: ${gameState.pnj.pv})`, 'danger');
                    updateHP();
                    
                    if (gameState.pnj.pv <= 0) {
                        logMessage('Vous êtes mort...', 'danger');
                        setTimeout(() => finDePartie(), 1500);
                    } else {
                        buttons.forEach(btn => btn.disabled = false);
                        afficherEtat();
                    }
                });
            }, 500);
        } else {
            logMessage('✗ L\'ennemi rate son attaque !', 'success');
            buttons.forEach(btn => btn.disabled = false);
            afficherEtat();
        }
    });
}

// ===== FONCTIONS UTILITAIRES DE JEU =====

function afficherEtat() {
    logMessage(`\n📊 État du combat:`, 'info');
    logMessage(`Vous: ${gameState.pnj.pv}/${gameState.pnj.pvMax} PV`, 'info');
    logMessage(`Ennemi: ${gameState.mob.pv}/${gameState.mob.pvMax} PV`, 'info');
}

function soignerJoueur(montant) {
    gameState.pnj.pv += montant;
    if (gameState.pnj.pv > gameState.pnj.pvMax) {
        gameState.pnj.pv = gameState.pnj.pvMax;
    }
    logMessage(`Vous récupérez ${montant} PV ! (PV: ${gameState.pnj.pv}/${gameState.pnj.pvMax})`, 'success');
    updateHP();
}

function finDePartie() {
    if (gameState.pnj.pv > 0) {
        logMessage('\n🎉 VICTOIRE ! Vous avez gagné le combat !', 'success');
        alert('Félicitations ! Vous avez vaincu l\'ennemi !');
    } else {
        logMessage('\n💀 GAME OVER ! Vous êtes mort au niveau ' + gameState.niveau, 'danger');
        alert('Game Over ! Essayez encore ?');
    }
}

function resetGame() {
    gameState.niveau = 1;
    gameState.tour = 0;
    selectedClass = null;
}

// ===== INITIALISATION AU CHARGEMENT =====

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    console.log('Jeu initialisé !');
});