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
        degats: 5,
        mana: 0,
        manaMax: 0
    },
    mob: {
        pv: 50,
        pvMax: 50,
        attaque: 0,
        defense: 10,
        degats: 4
    },
    portee: null,
    attaqueActuelle: 0,
    defenseActuelle: 0,
    skillsChoisis: [],
    buffsActifs: []
};

// ===== FONCTIONS UTILITAIRES =====

function lancerDe(faces)
{
    return Math.floor(Math.random() * faces) + 1;
}

function random(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMessage(message, type = 'info')
{
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const logDiv = document.getElementById('combat-log');
    if (logDiv)
        {
            const colors =
            {
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
function afficherAnimationDe(faces, callback)
{
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
        
        if (counter >= maxRolls)
        {
            clearInterval(rollInterval);
            const finalResult = lancerDe(faces);
            dice.textContent = finalResult;
            dice.style.transform = 'rotate(0deg) scale(1.5)';
            dice.classList.add('dice-final');
            
            setTimeout(() =>
            {
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
        
        if (playerPercent > 50)
        {
            playerHPBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
        }
        else if (playerPercent > 25)
        {
            playerHPBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        }
        else
        {
            playerHPBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
    updateMana()
    if (enemyHPBar && enemyHPText)
    {
        const enemyPercent = (gameState.mob.pv / gameState.mob.pvMax) * 100;
        enemyHPBar.style.width = enemyPercent + '%';
        enemyHPText.textContent = `${gameState.mob.pv} / ${gameState.mob.pvMax} PV`;
    }
}

// ===== MISE À JOUR DES BARRES DE MANA =====
function updateMana() {
    const playerManaBar = document.getElementById('player-mana-bar');
    const playerManaText = document.getElementById('player-mana-text');
    
    if (playerManaBar && playerManaText)
    {
        const manaPercent = (gameState.pnj.mana / gameState.pnj.manaMax) * 100;
        playerManaBar.style.width = manaPercent + '%';
        playerManaText.textContent = `${gameState.pnj.mana} / ${gameState.pnj.manaMax} Mana`;
        
        // Changement de couleur selon la mana
        if (manaPercent > 50)
        {
            playerManaBar.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
        }
        else if (manaPercent > 25)
        {
            playerManaBar.style.background = 'linear-gradient(90deg, #6366f1, #4f46e5)';
        }
        else
        {
            playerManaBar.style.background = 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
        }
    }
}

// ===== MISE À JOUR DES STATS AFFICHÉES =====
function updateStatsDisplay() {
    const statAttaque = document.getElementById('stat-attaque');
    const statDefense = document.getElementById('stat-defense');
    const statDegats = document.getElementById('stat-degats');
    const statMagie = document.getElementById('stat-magie');
    
    if (statAttaque) statAttaque.textContent = Math.floor(gameState.attaqueActuelle || gameState.pnj.attaque);
    if (statDefense) statDefense.textContent = Math.floor(gameState.defenseActuelle || gameState.pnj.defense);
    if (statDegats) statDegats.textContent = gameState.pnj.degats;
    if (statMagie) statMagie.textContent = gameState.pnj.magie;
}

function updateClassTitle() {
    const classTitle = document.getElementById('player-class-title');
    if (classTitle && gameState.specialisation) {
        const specialisations = getSpecialisations();
        const specData = specialisations[gameState.specialisation];
        classTitle.textContent = `${specData.icon} Vous (${specData.name})`;
    }
}


// ===== INITIALISATION DU JEU =====

function initGame() {
    const cards = document.querySelectorAll('.classe-card');
    const btnStart = document.getElementById('btnStart');

    if (cards.length > 0)
    {
        cards.forEach(card =>
        {
            card.addEventListener('click', function()
            {
                selectClass(this, cards, btnStart);
            });
        });
    }

    if (btnStart)
    {
        btnStart.addEventListener('click', function()
        {
            startGame();
        });
    }
}

// ===== SÉLECTION DE CLASSE =====

function selectClass(selectedCard, allCards, button)
{
    allCards.forEach(c => c.classList.remove('selected'));
    selectedCard.classList.add('selected');
    selectedClass = selectedCard.dataset.classe;
    
    if (button)
    {
        button.classList.add('active');
    }
    
    console.log('Classe sélectionnée:', selectedClass);
}

function getClassStats(className)
{
    const classData =
    {
        guerrier:
        {
            name: 'Guerrier',
            icon: '⚔️',
            stats:
            {
                pv: 120,
                attaque: 12,
                defense: 10,
                magie: 3,
                degats: 8
            },
            skills: [
                { 
                    nom: 'Coup puissant', 
                    icon: '💥',
                    type: 'attaque',
                    manaCost: 0,
                    description: 'Attaque physique puissante',
                    effet: (gameState) =>
                        {
                        // Jet d'attaque
                        return new Promise((resolve) =>
                            {
                            afficherAnimationDe(20, (de20) =>
                                {
                                const jetAttaque = Math.floor(gameState.attaqueActuelle) + de20 + 3; // Bonus de +3
                                logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} + 3 = ${jetAttaque}`, 'info');
                                
                                if ((jetAttaque >= gameState.mob.defense && de20 != 1) || de20 == 20)
                                {
                                    logMessage('✓ Coup puissant touche !', 'success');
                                    
                                    setTimeout(() =>
                                    {
                                        afficherAnimationDe(6, (de6) =>
                                        {
                                            const degats = gameState.pnj.degats + de6 + 5; // Bonus de dégâts
                                            gameState.mob.pv -= degats;
                                            if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                            
                                            logMessage(`Dégâts: ${degats} infligés !`, 'success');
                                            updateHP();
                                            resolve({ success: true, degats });
                                        });
                                    }, 500);
                                }
                                else
                                {
                                    logMessage('✗ Coup puissant raté !', 'danger');
                                    resolve({ success: false });
                                }
                            });
                        });
                    }
                },
                { 
                    nom: 'Bouclier', 
                    icon: '🛡️',
                    type: 'buff',
                    manaCost: 0,
                    description : 'Défense +5 pour 1 tour',
                    effet: (gameState) =>
                    {
                        ajouterBuff('Bouclier', 'defense', 5, 1);
                        return Promise.resolve({ success: true });
                    }
                },
                { 
                    nom: 'Renforcement', 
                    icon: '💪',
                    type: 'buff',
                    manaCost: 10,
                    description : 'Attaque +3 pour 3 tours (Coût: 10 mana)',
                    effet: (gameState) =>
                    {
                        ajouterBuff('Renforcement', 'attaque', 3, 3);
                        return Promise.resolve({ success: true });
    }
                }
            ]
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
            skills: [
                {
                nom: 'Flamme',
                icon: '🔥',
                type: 'magie',
                manaCost: 20,
                description: 'Attaque magique puissante (Coût: 20 mana)',
                effet: (gameState) => {
                    return new Promise((resolve) => {
                        afficherAnimationDe(20, (de20) => {
                            const jetMagie = gameState.pnj.magie + de20;
                            logMessage(`Jet de magie: ${de20} + ${gameState.pnj.magie} = ${jetMagie}`, 'info');
                            
                            if ((jetMagie >= gameState.mob.defense && de20 != 1) || de20 == 20) {
                                logMessage('✓ Flamme frappe !', 'success');
                                
                                const degats = Math.floor(gameState.pnj.magie * 1.5) + lancerDe(8);
                                gameState.mob.pv -= degats;
                                if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                
                                logMessage(`Dégâts magiques: ${degats} infligés !`, 'success');
                                updateHP();
                                resolve({ success: true, degats });
                            } else {
                                logMessage('✗ Sort raté !', 'danger');
                                resolve({ success: false });
                            }
                        });
                    });
                }
            },
                { 
                    nom: 'Protection', 
                    icon: '✨',
                    type: 'soin',
                    manaCost: 0,
                    description: "Soin basé sur la magie",
                    effet: (gameState) => {
                        const soin = Math.floor(gameState.pnj.magie / 2);
                        gameState.pnj.pv = Math.min(gameState.pnj.pv + soin, gameState.pnj.pvMax);
                        updateHP();
                        logMessage(`Récupération de ${soin} PV`, 'success');
                        return Promise.resolve({ success: true });
                    }
                }
            ]
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
            skills: [
                { 
                   nom: 'Frappe précise', 
                    icon: '🎯',
                    type: 'attaque',
                    manaCost: 0,
                    description: 'Attaque rapide et précise',
                    effet: (gameState) => {
                        return new Promise((resolve) => {
                            afficherAnimationDe(20, (de20) => {
                                const jetAttaque = Math.floor(gameState.attaqueActuelle) + de20 + 5;
                                logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} + 5 = ${jetAttaque}`, 'info');
                                
                                if ((jetAttaque >= gameState.mob.defense && de20 != 1) || de20 == 20) {
                                    logMessage('✓ Frappe sournoise réussie !', 'success');
                                    
                                    setTimeout(() => {
                                        afficherAnimationDe(8, (de8) => {
                                            const degats = gameState.pnj.degats + de8 + 3;
                                            gameState.mob.pv -= degats;
                                            if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                            
                                            logMessage(`Dégâts: ${degats} infligés !`, 'success');
                                            updateHP();
                                            resolve({ success: true, degats });
                                        });
                                    }, 500);
                                } else {
                                    logMessage('✗ Attaque ratée !', 'danger');
                                    resolve({ success: false });
                                }
                            });
                        });
                    }
                },
                { 
                    nom: 'Poison', 
                    icon: '☠️',
                    description: 'Défense ennemie -3',
                    effet: (gameState) => {
                        gameState.mob.defense -= 3;
                        return 'Défense ennemie -3';
                    }
                },
                { 
                    nom: 'Esquive', 
                    icon: '💨',
                    type: 'buff',
                    manaCost: 0,
                    description: 'Défense +6 pour 1 tour',
                    effet: (gameState) => {
                        ajouterBuff('Esquive', 'defense', 6, 1);
                        return Promise.resolve({ success: true });
                    }
                }
            ]
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
            pvMax: classStats.stats.pv,
            mana: classStats.stats.magie * 10,      // AJOUTER (10 mana par point de magie)
            manaMax: classStats.stats.magie * 10  
        };
        
        localStorage.setItem('playerClass', selectedClass);
        
        document.querySelector('.jeu').style.display = 'none';
        
        const gameArea = document.createElement('div');
        gameArea.id = 'game-area';
        gameArea.innerHTML = `
            <h3>Combat - Niveau ${gameState.niveau}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div class="hp-container">
                    <h4 style="color: #22c55e; margin-bottom: 0.5rem;">🛡️ Vous (${classStats.name})</h4>
                    
                    <!-- Barres de vie et mana -->
                    <div class="hp-bar-container">
                        <div class="hp-bar" id="player-hp-bar" style="width: 100%;"></div>
                    </div>
                    <p id="player-hp-text" class="hp-text">${gameState.pnj.pv} / ${gameState.pnj.pvMax} PV</p>
                    
                    <div class="hp-bar-container" style="margin-top: 0.5rem;">
                        <div class="mana-bar" id="player-mana-bar" style="width: 100%;"></div>
                    </div>
                    <p id="player-mana-text" class="hp-text" style="color: #3b82f6;">${gameState.pnj.mana} / ${gameState.pnj.manaMax} Mana</p>
                    
                    <!-- Statistiques du personnage -->
                    <div class="stats-container" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.3);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.8;">⚔️ Attaque:</span>
                                <span style="font-weight: bold; color: #fbbf24;" id="stat-attaque">${gameState.pnj.attaque}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.8;">🛡️ Défense:</span>
                                <span style="font-weight: bold; color: #3b82f6;" id="stat-defense">${gameState.pnj.defense}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.8;">💥 Dégâts:</span>
                                <span style="font-weight: bold; color: #ef4444;" id="stat-degats">${gameState.pnj.degats}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="opacity: 0.8;">✨ Magie:</span>
                                <span style="font-weight: bold; color: #8b5cf6;" id="stat-magie">${gameState.pnj.magie}</span>
                            </div>
                        </div>
                    </div>
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
                    <button class="action-btn" onclick="choisirPortee('longue')">
                        🏹 Longue portée<br>
                        <small>Attaque -25% | Défense +25%</small>
                    </button>
                    <button class="action-btn" onclick="choisirPortee('moyenne')">
                        ⚔️ Portée moyenne<br>
                        <small>Stats normales</small>
                    </button>
                    <button class="action-btn" onclick="choisirPortee('courte')">
                        🗡️ Courte portée<br>
                        <small>Attaque +25% | Défense -25%</small>
                    </button>
                </div>
            </div>
        `;
        
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

// ===== CHOIX DE PORTÉE =====

function choisirPortee(porteeChoisie) {
    const buttons = document.querySelectorAll('#actions-container .action-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    gameState.tour++;
    logMessage(`\n--- TOUR ${gameState.tour} ---`, 'warning');
    
    gameState.portee = porteeChoisie;
    logMessage(`Vous choisissez la ${porteeChoisie} portée`, 'info');
    
    // Calcul des stats selon la portée
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

    // Régénération de mana pour Paladin en position défensive
    if (gameState.specialisation === 'paladin' && gameState.portee === 'longue') {
        gameState.pnj.mana = Math.min(gameState.pnj.mana + 5, gameState.pnj.manaMax);
        logMessage('🛡️ Paladin : +5 mana (position défensive)', 'success');
        updateMana();
    }

    updateStatsDisplay();
    
    // Affiche la sélection des compétences
    setTimeout(() => {
        afficherSelectionSkills();
    }, 500);
}

// ===== SYSTÈME DE SPÉCIALISATION =====
function verifierSpecialisation() {
    if (gameState.niveau === 3 && selectedClass === 'guerrier' && !gameState.specialisation) {
        logMessage('\n⭐ NIVEAU 3 ATTEINT ! Choisissez votre spécialisation !', 'success');
        afficherChoixSpecialisation();
    }
}

function afficherChoixSpecialisation() {
    const actionsContainer = document.getElementById('actions-container');
    
    actionsContainer.innerHTML = `
        <h3 style="text-align: center; color: #fbbf24; margin-bottom: 1.5rem;">⚔️ SPÉCIALISATION DE GUERRIER</h3>
        <div class="actions-grid">
            <button class="action-btn spec-btn" onclick="choisirSpecialisation('paladin')">
                <div style="font-size: 3rem;">🛡️</div>
                <strong style="font-size: 1.2rem;">PALADIN</strong>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <p>+30 PV | +6 Défense | +5 Magie</p>
                    <p style="color: #22c55e;">Régénère mana en défendant</p>
                </div>
            </button>
            <button class="action-btn spec-btn" onclick="choisirSpecialisation('berserker')">
                <div style="font-size: 3rem;">⚡</div>
                <strong style="font-size: 1.2rem;">BERSERKER</strong>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <p>+20 PV | +8 Attaque | -2 Défense | +5 Dégâts</p>
                    <p style="color: #ef4444;">Gagne mana en prenant des coups</p>
                </div>
            </button>
            <button class="action-btn spec-btn" onclick="choisirSpecialisation('maitre_arme')">
                <div style="font-size: 3rem;">⚔️</div>
                <strong style="font-size: 1.2rem;">MAÎTRE D'ARMES</strong>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <p>+6 Attaque | +3 Défense | +4 Dégâts</p>
                    <p style="color: #8b5cf6;">Réduit coûts après critique</p>
                </div>
            </button>
        </div>
    `;
}

function choisirSpecialisation(spec) {
    gameState.specialisation = spec;
    const specialisations = getSpecialisations();
    const specData = specialisations[spec];
    
    logMessage(`\n✨ Vous devenez ${specData.name} !`, 'success');
    
    // Applique les bonus de stats
    gameState.pnj.pvMax += specData.bonus.pv || 0;
    gameState.pnj.pv += specData.bonus.pv || 0;
    gameState.pnj.attaque += specData.bonus.attaque || 0;
    gameState.pnj.defense += specData.bonus.defense || 0;
    gameState.pnj.magie += specData.bonus.magie || 0;
    gameState.pnj.degats += specData.bonus.degats || 0;
    
    if (specData.bonus.magie) {
        gameState.pnj.manaMax += specData.bonus.magie * 10;
        gameState.pnj.mana += specData.bonus.magie * 10;
    }
    
    logMessage(`Stats améliorées !`, 'success');
    updateHP();
    updateStatsDisplay();
    updateClassTitle();
    
    // Continue le jeu
    setTimeout(() => {
        genererEnnemi(gameState.niveau);
        nouveauTour();
    }, 1500);
}

function getSpecialisations() {
    return {
        paladin: {
            name: 'Paladin',
            icon: '🛡️',
            bonus: {
                pv: 30,
                defense: 6,
                magie: 5
            },
            skills: [
                {
                    nom: 'Coup sacré',
                    icon: '⚔️',
                    type: 'attaque',
                    // manaCost: 20,
                    description: 'Dégâts magiques + 50% bonus si ennemi < 50% PV',
                    effet: (gameState) => {
                        return new Promise((resolve) => {
                            afficherAnimationDe(20, (de20) => {
                                const jetMagie = gameState.pnj.magie + de20;
                                logMessage(`Jet de magie: ${de20} + ${gameState.pnj.magie} = ${jetMagie}`, 'info');
                                
                                if ((jetMagie >= gameState.mob.defense && de20 != 1) || de20 == 20) {
                                    logMessage('✓ Le coup sacré frappe !', 'success');
                                    
                                    setTimeout(() => {
                                        afficherAnimationDe(8, (de8) => {
                                            let degats = gameState.pnj.degats + Math.floor(gameState.pnj.magie / 2) + de8;
                                            
                                            // Bonus de 50% si l'ennemi est sous 50% PV
                                            if (gameState.mob.pv < gameState.mob.pvMax * 0.5) {
                                                degats = Math.floor(degats * 1.5);
                                                logMessage('🌟 Bonus de finition : +50% dégâts !', 'success');
                                            }
                                            
                                            gameState.mob.pv -= degats;
                                            if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                            
                                            logMessage(`Dégâts sacrés: ${degats} infligés !`, 'success');
                                            updateHP();
                                            resolve({ success: true, degats });
                                        });
                                    }, 500);
                                } else {
                                    logMessage('✗ Coup sacré raté !', 'danger');
                                    resolve({ success: false });
                                }
                            });
                        });
                    }
                },
                {
                    nom: 'Bouclier divin',
                    icon: '🛡️',
                    type: 'buff',
                    // manaCost: 15,
                    description: 'Défense +8 + réduit dégâts de 30% pour 2 tours',
                    effet: (gameState) => {
                        ajouterBuff('Bouclier divin', 'defense', 8, 2);
                        gameState.reductionDegats = 2; // Compteur de tours
                        logMessage('🛡️ Bouclier divin : Réduction de 30% des dégâts pour 2 tours', 'success');
                        return Promise.resolve({ success: true });
                    }
                },
                {
                    nom: 'Soin',
                    icon: '✨',
                    type: 'soin',
                    manaCost: 25,
                    description: 'Restaure PV (boost de 50% si PV < 50%) (Coût: 25 mana)',
                    effet: (gameState) => {
                        return new Promise((resolve) => {
                            afficherAnimationDe(6, (de6) => {
                                const pourcentageVie = gameState.pnj.pv / gameState.pnj.pvMax;
                                let soin = (gameState.pnj.magie * 3) + de6;
                                
                                // Bonus de 50% si PV < 50%
                                if (pourcentageVie < 0.5) {
                                    soin = Math.floor(soin * 1.5);
                                    logMessage('🌟 Soin de panique : +50% de soin !', 'success');
                                }
                                
                                gameState.pnj.pv = Math.min(gameState.pnj.pv + soin, gameState.pnj.pvMax);
                                updateHP();
                                logMessage(`Soin de ${soin} PV`, 'success');
                                resolve({ success: true });
                            });
                        });
                    }
                }
            ]
        },
        berserker: {
            name: 'Berserker',
            icon: '⚡',
            bonus: {
                pv: 20,
                attaque: 8,
                defense: -2,
                degats: 5
            },
            skills: [
                {
                    nom: 'Frappe violente',
                    icon: '🪓',
                    type: 'attaque',
                    manaCost: 0,
                    description: 'Gros dégâts mais -4 défense au tour suivant',
                    effet: (gameState) => {
                        return new Promise((resolve) => {
                            afficherAnimationDe(20, (de20) => {
                                const jetAttaque = Math.floor(gameState.attaqueActuelle) + de20 + 5;
                                logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} + 5 = ${jetAttaque}`, 'info');
                                
                                if ((jetAttaque >= gameState.mob.defense && de20 != 1) || de20 == 20) {
                                    logMessage('✓ Frappe violente touche !', 'success');
                                    
                                    setTimeout(() => {
                                        afficherAnimationDe(10, (de10) => {
                                            const degats = Math.floor(gameState.pnj.degats * 1.8) + de10;
                                            gameState.mob.pv -= degats;
                                            if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                            
                                            ajouterBuff('Frappe violente (malus)', 'defense', -4, 1);
                                            logMessage(`💥 Dégâts brutaux : ${degats} ! (Défense -4 au prochain tour)`, 'success');
                                            updateHP();
                                            resolve({ success: true, degats });
                                        });
                                    }, 500);
                                } else {
                                    logMessage('✗ Frappe violente ratée !', 'danger');
                                    resolve({ success: false });
                                }
                            });
                        });
                    }
                },
                {
                    nom: 'Rage',
                    icon: '🩸',
                    type: 'buff',
                    manaCost: 5,
                    description: 'Attaque +6 / Défense -3 pour 3 tours (Coût: 5 mana)',
                    effet: (gameState) => {
                        ajouterBuff('Rage (attaque)', 'attaque', 6, 3);
                        ajouterBuff('Rage (défense)', 'defense', -3, 3);
                        logMessage('🩸 Rage activée : Plus fort mais plus vulnérable !', 'success');
                        return Promise.resolve({ success: true });
                    }
                },
                {
                    nom: 'Fury',
                    icon: '🔥',
                    type: 'buff',
                    manaCost: 0,
                    description: '+2 dégâts par attaque réussie (Max: +10)',
                    effet: (gameState) => {
                        if (!gameState.furyStacks) gameState.furyStacks = 0;
                        
                        if (gameState.furyStacks < 10) {
                            gameState.furyStacks += 2;
                            ajouterBuff('Fury', 'degats', gameState.furyStacks, 999);
                            logMessage(`🔥 Fury : +${gameState.furyStacks} dégâts cumulés !`, 'success');
                        } else {
                            logMessage('🔥 Fury au maximum (+10 dégâts) !', 'warning');
                        }
                        
                        return Promise.resolve({ success: true });
                    }
                }
            ]
        },
        maitre_arme: {
            name: 'Maître d\'armes',
            icon: '⚔️',
            bonus: {
                attaque: 6,
                defense: 3,
                degats: 4
            },
            skills: [
                {
                    nom: 'Coup chirurgical',
                    icon: '🗡️',
                    type: 'attaque',
                    manaCost: 5,
                    description: 'Ignore 50% de la défense ennemie (Coût: 5 mana)',
                    effet: (gameState) => {
                        return new Promise((resolve) => {
                            afficherAnimationDe(20, (de20) => {
                                const jetAttaque = gameState.attaqueActuelle + de20;
                                const defenseReduite = Math.floor(gameState.mob.defense * 0.5);
                                
                                logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} = ${jetAttaque}`, 'info');
                                logMessage(`Défense ennemie réduite : ${gameState.mob.defense} → ${defenseReduite}`, 'info');
                                
                                if ((jetAttaque >= defenseReduite && de20 != 1) || de20 == 20) {
                                    logMessage('✓ Coup chirurgical précis !', 'success');
                                    
                                    setTimeout(() => {
                                        afficherAnimationDe(6, (de6) => {
                                            const degats = gameState.attaqueActuelle + de6;
                                            gameState.mob.pv -= degats;
                                            if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                            
                                            logMessage(`🎯 Dégâts précis : ${degats} infligés !`, 'success');
                                            updateHP();
                                            resolve({ success: true, degats });
                                        });
                                    }, 500);
                                } else {
                                    logMessage('✗ Coup chirurgical raté !', 'danger');
                                    resolve({ success: false });
                                }
                            });
                        });
                    }
                },
                {
                    nom: 'Contre-attaque',
                    icon: '🛡️',
                    type: 'buff',
                    // manaCost: 10,
                    description: 'Défense +6 + riposte automatique (Coût: 10 mana)',
                    effet: (gameState) => {
                        ajouterBuff('Contre-attaque', 'defense', 6, 1);
                        gameState.contreAttaque = true;
                        logMessage('🛡️ Prêt à contre-attaquer !', 'success');
                        return Promise.resolve({ success: true });
                    }
                },
                {
                    nom: 'Renforcement amélioré',
                    icon: '💪',
                    type: 'buff',
                    manaCost: 15,
                    description: 'Attaque +5 + 10% chance de toucher pour 4 tours (Coût: 15 mana)',
                    effet: (gameState) => {
                        ajouterBuff('Renforcement amélioré', 'attaque', 5, 4);
                        gameState.precisionBonus = 4; // Compteur de tours
                        logMessage('💪 Renforcement : +5 attaque et +10% précision pour 4 tours !', 'success');
                        return Promise.resolve({ success: true });
                    }
                }
            ]
        }
    };
}


// ===== AFFICHAGE SÉLECTION DES COMPÉTENCES =====

function afficherSelectionSkills() {
    gameState.skillsChoisis = [];
    
    let classStats = getClassStats(selectedClass);
    
    // Si le joueur a une spécialisation, utiliser ses skills
    if (gameState.specialisation) {
        const specialisations = getSpecialisations();
        classStats = {
            ...classStats,
            skills: specialisations[gameState.specialisation].skills
        };
    }
    
    const actionsContainer = document.getElementById('actions-container');
    
    actionsContainer.innerHTML = `
        <h4 style="text-align: center; margin-bottom: 1rem;">✨ Choisissez 2 actions (${gameState.skillsChoisis.length}/2)</h4>
        <div class="actions-grid" id="skills-grid">
            ${classStats.skills.map((skill, index) => {
                const cost = skill.manaCost ?? 0;
                const insufficientMana = cost > gameState.pnj.mana;
                return `
                    <button class="action-btn skill-btn" onclick="choisirSkill(${index})" ${insufficientMana ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${skill.icon}</div>
                        <strong>${skill.nom}</strong>
                        ${cost > 0 ? `<div style="color: #3b82f6; font-size: 0.8rem;">Coût: ${cost} mana</div>` : ''}
                        <br><small>${skill.description}</small>
                    </button>
                `;
            }).join('')}
        </div>
        <div style="text-align: center; margin-top: 1rem;">
            <button id="valider-skills" class="action-btn" style="opacity: 0.5; pointer-events: none;" onclick="validerSkills()">
                Valider vos actions
            </button>
        </div>
    `;
}

// ===== CHOIX D'UNE COMPÉTENCE =====

function choisirSkill(index) {
    let classStats = getClassStats(selectedClass);
    
    // Si le joueur a une spécialisation, utiliser ses skills
    if (gameState.specialisation) {
        const specialisations = getSpecialisations();
        classStats = {
            ...classStats,
            skills: specialisations[gameState.specialisation].skills
        };
    }
    
    const skillButtons = document.querySelectorAll('.skill-btn');
    const validerBtn = document.getElementById('valider-skills');
    const skill = classStats.skills[index];
    const cost = skill.manaCost ?? 0;
    
    // Si le Mana est insuffisant
    if (cost > gameState.pnj.mana) {
        logMessage('Mana insuffisante pour cette compétence !', 'warning');
        return;
    }
    
    // Si le skill est déjà sélectionné, on le désélectionne
    const skillIndex = gameState.skillsChoisis.indexOf(index);
    if (skillIndex !== -1) {
        gameState.skillsChoisis.splice(skillIndex, 1);
        skillButtons[index].classList.remove('selected-skill');
    } else {
        // Si on a déjà 2 skills, on ne peut pas en ajouter
        if (gameState.skillsChoisis.length >= 2) {
            logMessage('Vous ne pouvez choisir que 2 compétences !', 'warning');
            return;
        }
        
        gameState.skillsChoisis.push(index);
        skillButtons[index].classList.add('selected-skill');
    }
    
    // Mise à jour du titre
    const titre = document.querySelector('#actions-container h4');
    titre.textContent = `✨ Choisissez 2 actions (${gameState.skillsChoisis.length}/2)`;
    
    // Active le bouton valider si 2 skills sont sélectionnés
    if (gameState.skillsChoisis.length === 2) {
        validerBtn.style.opacity = '1';
        validerBtn.style.pointerEvents = 'auto';
        logMessage('Compétences sélectionnées ! Cliquez sur "Valider"', 'success');
    } else {
        validerBtn.style.opacity = '0.5';
        validerBtn.style.pointerEvents = 'none';
    }
}

// ===== GESTION DES BUFFS =====
function ajouterBuff(nom, stat, valeur, duree) {
    // Vérifie si le buff existe déjà
    const buffExistant = gameState.buffsActifs.find(b => b.nom === nom);
    
    if (buffExistant) {
        // Renouvelle la durée
        buffExistant.duree = duree;
        logMessage(`${nom} renouvelé pour ${duree} tours`, 'info');
    } else {
        // Ajoute un nouveau buff
        gameState.buffsActifs.push({
            nom: nom,
            stat: stat,
            valeur: valeur,
            duree: duree
        });
        logMessage(`${nom} appliqué pour ${duree} tours`, 'success');
    }
    
    appliquerBuffs();
}

function appliquerBuffs() {
    // Utilise les stats actuelles du PNJ comme base (qui incluent déjà les bonus de spécialisation)
    
    // Réinitialise les stats aux valeurs de base + portée
    if (gameState.portee === 'longue') {
        gameState.attaqueActuelle = gameState.pnj.attaque - (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense + (gameState.pnj.defense * 0.25);
    } else if (gameState.portee === 'moyenne') {
        gameState.attaqueActuelle = gameState.pnj.attaque;
        gameState.defenseActuelle = gameState.pnj.defense;
    } else if (gameState.portee === 'courte') {
        gameState.attaqueActuelle = gameState.pnj.attaque + (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense - (gameState.pnj.defense * 0.25);
    }
    
    // Les dégâts de base sont déjà stockés dans gameState.pnj.degats (incluant la spécialisation)
    // On n'a pas besoin de les recalculer depuis classStats
    
    // Applique tous les buffs actifs
    gameState.buffsActifs.forEach(buff => {
        if (buff.stat === 'attaque') {
            gameState.attaqueActuelle += buff.valeur;
        } else if (buff.stat === 'defense') {
            gameState.defenseActuelle += buff.valeur;
        } else if (buff.stat === 'degats') {
            // Note : les dégâts sont déjà dans gameState.pnj.degats
            // Les buffs s'ajoutent temporairement mais ne modifient pas la base
        }
    });
    
    updateStatsDisplay();
}

function decrementerBuffs() {
    gameState.buffsActifs = gameState.buffsActifs.filter(buff => {
        buff.duree--;
        
        if (buff.duree <= 0) {
            logMessage(`${buff.nom} a expiré`, 'warning');
            return false;
        }
        return true;
    });
    
    // Décrémente la réduction de dégâts du Paladin
    if (gameState.reductionDegats && gameState.reductionDegats > 0) {
        gameState.reductionDegats--;
        if (gameState.reductionDegats === 0) {
            logMessage('🛡️ Bouclier divin : Réduction de dégâts terminée', 'warning');
        }
    }
    
    // Décrémente le bonus de précision du Maître d'armes
    if (gameState.precisionBonus && gameState.precisionBonus > 0) {
        gameState.precisionBonus--;
        if (gameState.precisionBonus === 0) {
            logMessage('💪 Renforcement : Bonus de précision terminé', 'warning');
        }
    }
    
    appliquerBuffs();
}

function afficherBuffsActifs() {
    if (gameState.buffsActifs.length > 0) {
        logMessage('\n🌟 Buffs actifs:', 'info');
        gameState.buffsActifs.forEach(buff => {
            logMessage(`  • ${buff.nom} (${buff.duree} tours restants)`, 'info');
        });
    }
}

// ===== VALIDATION DES COMPÉTENCES =====

async function validerSkills() {
    if (gameState.skillsChoisis.length !== 2) {
        logMessage('Vous devez choisir exactement 2 compétences !', 'warning');
        return;
    }
    
    let classStats = getClassStats(selectedClass);
    
    // Si le joueur a une spécialisation, utiliser ses skills
    if (gameState.specialisation) {
        const specialisations = getSpecialisations();
        classStats = {
            ...classStats,
            skills: specialisations[gameState.specialisation].skills
        };
    }
    
    logMessage('\n🌟 Exécution des actions:', 'success');
    
    // Désactive tous les boutons
    const buttons = document.querySelectorAll('#actions-container .action-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    // Applique les effets des 2 compétences de manière séquentielle
    for (const index of gameState.skillsChoisis) {
        const skill = classStats.skills[index];
        
        // Consomme la mana
        gameState.pnj.mana -= skill.manaCost ?? 0;
        updateMana();
        
        logMessage(`\n${skill.icon} ${skill.nom}`, 'warning');
        
        // Attend que l'effet se termine
        await skill.effet(gameState);
        
        // Vérifie si l'ennemi est mort
        if (gameState.mob.pv <= 0) {
            logMessage('L\'ennemi est vaincu !', 'success');
            setTimeout(() => finDePartie(), 1500);
            return;
        }
        
        // Petit délai entre les deux actions
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Réinitialise les stats temporaires et passe au tour ennemi
    resetStatsTemporaires();
    
    setTimeout(() => tourEnnemi(), 1000);
}



// ===== RÉINITIALISATION DES STATS TEMPORAIRES =====

function resetStatsTemporaires() {
    // const classStats = getClassStats(selectedClass);
    // gameState.pnj.degats = classStats.stats.degats;
    // updateStatsDisplay();
    appliquerBuffs();
}

// ===== TOUR DE L'ENNEMI =====

function tourEnnemi() {
    logMessage('\n👹 Tour de l\'ennemi !', 'warning');
    
    afficherAnimationDe(20, (de20) => {
        const jetAttaque = gameState.mob.attaque + de20;
        
        logMessage(`Jet d'attaque: ${de20} + ${gameState.mob.attaque} = ${jetAttaque}`, 'warning');
        logMessage(`Votre défense: ${Math.floor(gameState.defenseActuelle)}`, 'info');
        
        if ((jetAttaque >= Math.floor(gameState.defenseActuelle) && de20 != 1) || de20 == 20) {
            logMessage('✓ L\'ennemi vous touche !', 'danger');
            
            setTimeout(() => {
                afficherAnimationDe(6, (de6) => {
                let degats = gameState.mob.degats + de6;
                
                logMessage(`Dégâts de base: ${gameState.mob.degats} + ${de6} = ${degats}`, 'danger');
                
                // Réduction de dégâts du Bouclier divin (Paladin) - AVANT de soustraire les PV
                if (gameState.reductionDegats && gameState.reductionDegats > 0) {
                    const degatsOriginaux = degats;
                    degats = Math.floor(degats * 0.7); // 30% de réduction
                    logMessage(`🛡️ Bouclier divin : ${degatsOriginaux} → ${degats} dégâts (-30%) !`, 'info');
                }
                
                // Applique les dégâts
                gameState.pnj.pv -= degats;
                if (gameState.pnj.pv < 0) gameState.pnj.pv = 0;
                
                logMessage(`Vous perdez ${degats} PV ! (PV restants: ${gameState.pnj.pv})`, 'danger');
                updateHP();

                // Régénération de mana pour Berserker
                if (gameState.specialisation === 'berserker') {
                    gameState.pnj.mana = Math.min(gameState.pnj.mana + 3, gameState.pnj.manaMax);
                    logMessage('⚡ Berserker : +3 mana (coups encaissés)', 'success');
                    updateMana();
                }
                                        
                    // Contre-attaque du Maître d'armes
                    if (gameState.contreAttaque) {
                        gameState.contreAttaque = false;
                        
                        setTimeout(() => {
                            afficherAnimationDe(6, (de6Riposte) => {
                                logMessage('\n⚔️ CONTRE-ATTAQUE !', 'success');
                                const riposteDegats = Math.floor(gameState.attaqueActuelle) + de6Riposte;
                                gameState.mob.pv -= riposteDegats;
                                if (gameState.mob.pv < 0) gameState.mob.pv = 0;
                                logMessage(`Riposte : ${riposteDegats} dégâts !`, 'success');
                                updateHP();
                                
                                if (gameState.mob.pv <= 0) {
                                    logMessage('L\'ennemi est vaincu par la contre-attaque !', 'success');
                                    setTimeout(() => finDePartie(), 1500);
                                    return;
                                }
                            });
                        }, 800);
                    }

                    if (gameState.pnj.pv <= 0) {
                        logMessage('Vous êtes mort...', 'danger');
                        setTimeout(() => finDePartie(), 1500);
                    } else {
                        decrementerBuffs();
                        afficherBuffsActifs();
                        nouveauTour();
                    }
                });
            }, 500);
        } else {
            logMessage('✗ L\'ennemi rate son attaque !', 'success');
            decrementerBuffs();
            afficherBuffsActifs();
            nouveauTour();
        }
    });
}

// ===== NOUVEAU TOUR =====

function nouveauTour() {
    appliquerBuffs();
    afficherEtat();
    
    const actionsContainer = document.getElementById('actions-container');
    actionsContainer.innerHTML = `
        <h4 style="text-align: center; margin-bottom: 1rem;">⚔️ Choisissez votre position</h4>
        <div class="actions-grid">
            <button class="action-btn" onclick="choisirPortee('longue')">
                🏹 Longue portée<br>
                <small>Attaque -25% | Défense +25%</small>
            </button>
            <button class="action-btn" onclick="choisirPortee('moyenne')">
                ⚔️ Portée moyenne<br>
                <small>Stats normales</small>
            </button>
            <button class="action-btn" onclick="choisirPortee('courte')">
                🗡️ Courte portée<br>
                <small>Attaque +25% | Défense -25%</small>
            </button>
        </div>
    `;
    updateStatsDisplay();
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
        
        gameState.niveau++;
        // Reset Fury du Berserker en fin de combat
        if (gameState.specialisation === 'berserker') {
            gameState.furyStacks = 0;
            logMessage('🔥 Fury réinitialisé', 'info');
        }
        logMessage(`\n⭐ NIVEAU ${gameState.niveau} !`, 'warning');
        
        // Régénère un peu de mana et PV
        gameState.pnj.mana = Math.min(gameState.pnj.mana + 20, gameState.pnj.manaMax);
        gameState.pnj.pv = Math.min(gameState.pnj.pv + 30, gameState.pnj.pvMax);
        updateHP();
        
        // Vérifie spécialisation au niveau 3
        if (gameState.niveau === 3 && selectedClass === 'guerrier' && !gameState.specialisation) {
            setTimeout(() => verifierSpecialisation(), 1500);
        } else {
            setTimeout(() => {
                genererEnnemi(gameState.niveau);
                nouveauTour();
            }, 2000);
        }
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