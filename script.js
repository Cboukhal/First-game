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
        attaque: 8,
        defense: 8,
        degats: 4
    },
    portee: null,
    attaqueActuelle: 0,
    defenseActuelle: 0,
    skillsChoisis: [] // Nouvelle propriété pour les skills
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
        
        if (playerPercent > 50) {
            playerHPBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
        } else if (playerPercent > 25) {
            playerHPBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            playerHPBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
    updateMana()
    if (enemyHPBar && enemyHPText) {
        const enemyPercent = (gameState.mob.pv / gameState.mob.pvMax) * 100;
        enemyHPBar.style.width = enemyPercent + '%';
        enemyHPText.textContent = `${gameState.mob.pv} / ${gameState.mob.pvMax} PV`;
    }
}

// ===== MISE À JOUR DES BARRES DE MANA =====
function updateMana() {
    const playerManaBar = document.getElementById('player-mana-bar');
    const playerManaText = document.getElementById('player-mana-text');
    
    if (playerManaBar && playerManaText) {
        const manaPercent = (gameState.pnj.mana / gameState.pnj.manaMax) * 100;
        playerManaBar.style.width = manaPercent + '%';
        playerManaText.textContent = `${gameState.pnj.mana} / ${gameState.pnj.manaMax} Mana`;
        
        // Changement de couleur selon la mana
        if (manaPercent > 50) {
            playerManaBar.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
        } else if (manaPercent > 25) {
            playerManaBar.style.background = 'linear-gradient(90deg, #6366f1, #4f46e5)';
        } else {
            playerManaBar.style.background = 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
        }
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
            skills: [
                { 
                    nom: 'Coup puissant', 
                    icon: '💥',
                    description : 'Dégâts +5 pour ce tour',
                    effet: (gameState) => {
                        gameState.pnj.degats += 5;
                        return 'Dégâts +5 pour ce tour';
                    }
                },
                { 
                    nom: 'Bouclier', 
                    icon: '🛡️',
                    description : 'Défense +5 pour ce tour',
                    effet: (gameState) => {
                        gameState.defenseActuelle += 5;
                        return 'Défense +5 pour ce tour';
                    }
                },
                { 
                    nom: 'Renforcement', 
                    icon: '💪',
                    manaCost: 10,
                    description : 'Attaque +3 pour ce tour = 10 mana',
                    effet: (gameState) => {
                        gameState.attaqueActuelle += 3;
                        return 'Attaque +3 pour ce tour';
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
                description: "à voir",
                effet: (gameState) => {
                    const degatsBonus = gameState.pnj.magie;
                    gameState.pnj.degats += degatsBonus;
                    return `Dégâts magiques +${degatsBonus}`;
                }
                },
                { 
                    nom: 'Coup rapide', 
                    icon: '⚡',
                    description: "à voir",
                    effet: (gameState) => {
                        gameState.attaqueActuelle += 4;
                        return 'Attaque +4 pour ce tour';
                    }
                },
                { 
                    nom: 'Protection', 
                    icon: '✨',
                    description: "à voir",
                    effet: (gameState) => {
                        const soin = Math.floor(gameState.pnj.magie / 2);
                        gameState.pnj.pv = Math.min(gameState.pnj.pv + soin, gameState.pnj.pvMax);
                        updateHP();
                        return `Récupération de ${soin} PV`;
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
                    nom: 'Frappe mortelle', 
                    icon: '🎯',
                    description: 'Dégâts +7, Défense -2',
                    effet: (gameState) => {
                        gameState.pnj.degats += 7;
                        gameState.defenseActuelle -= 2;
                        return 'Dégâts +7, Défense -2';
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
                    description: 'Défense +6 pour ce tour',
                    effet: (gameState) => {
                        gameState.defenseActuelle += 6;
                        return 'Défense +6 pour ce tour';
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
                    <div class="hp-bar-container">
                        <div class="hp-bar" id="player-hp-bar" style="width: 100%;"></div>
                    </div>
                    <p id="player-hp-text" class="hp-text">${gameState.pnj.pv} / ${gameState.pnj.pvMax} PV</p>
                    
                    <!-- AJOUTER LA BARRE DE MANA -->
                    <div class="hp-bar-container" style="margin-top: 0.5rem;">
                        <div class="mana-bar" id="player-mana-bar" style="width: 100%;"></div>
                    </div>
                    <p id="player-mana-text" class="hp-text" style="color: #3b82f6;">${gameState.pnj.mana} / ${gameState.pnj.manaMax} Mana</p>
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
    
    // Affiche la sélection des compétences
    setTimeout(() => {
        afficherSelectionSkills();
    }, 500);
}

// ===== AFFICHAGE SÉLECTION DES COMPÉTENCES =====

function afficherSelectionSkills() {
    gameState.skillsChoisis = [];
    
    const classStats = getClassStats(selectedClass);
    const actionsContainer = document.getElementById('actions-container');
    
    actionsContainer.innerHTML = `
        <h4 style="text-align: center; margin-bottom: 1rem;">✨ Choisissez 2 compétences (${gameState.skillsChoisis.length}/2)</h4>
        <div class="actions-grid" id="skills-grid">
            ${classStats.skills.map((skill, index) => `
                <button class="action-btn skill-btn" onclick="choisirSkill(${index})">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${skill.icon}</div>
                    <strong>${skill.nom}</strong>
                    <br>${skill.description}
                </button>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 1rem;">
            <button id="valider-skills" class="action-btn" style="opacity: 0.5; pointer-events: none;" onclick="validerSkills()">
                Valider et Attaquer
            </button>
        </div>
    `;
}

// ===== CHOIX D'UNE COMPÉTENCE =====

function choisirSkill(index) {
    const classStats = getClassStats(selectedClass);
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
    titre.textContent = `✨ Choisissez 2 compétences (${gameState.skillsChoisis.length}/2)`;
    
    // Active le bouton valider si 2 skills sont sélectionnés
    if (gameState.skillsChoisis.length === 2) {
        validerBtn.style.opacity = '1';
        validerBtn.style.pointerEvents = 'auto';
        logMessage('Compétences sélectionnées ! Cliquez sur "Valider et Attaquer"', 'success');
    } else {
        validerBtn.style.opacity = '0.5';
        validerBtn.style.pointerEvents = 'none';
    }
}

// ===== VALIDATION DES COMPÉTENCES =====

function validerSkills() {
    if (gameState.skillsChoisis.length !== 2) {
        logMessage('Vous devez choisir exactement 2 compétences !', 'warning');
        return;
    }
    
    const classStats = getClassStats(selectedClass);
    
    logMessage('\n🌟 Application des compétences:', 'success');
    
    // Applique les effets des 2 compétences
    gameState.skillsChoisis.forEach(index => {
    const skill = classStats.skills[index];

    gameState.pnj.mana -= skill.manaCost ?? 0; // ← AJOUT
    updateMana();

    const resultat = skill.effet(gameState);
    logMessage(`${skill.icon} ${skill.nom}: ${resultat}`, 'success');
    });
    
    // Désactive tous les boutons et lance le combat
    const buttons = document.querySelectorAll('#actions-container .action-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    setTimeout(() => {
        tourJoueur();
    }, 1000);
}

// ===== TOUR DU JOUEUR =====

function tourJoueur() {
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
                        // Réinitialise les stats temporaires avant le tour ennemi
                        resetStatsTemporaires();
                        setTimeout(() => tourEnnemi(), 1500);
                    }
                });
            }, 500);
        } else {
            logMessage('✗ Vous ratez votre attaque !', 'danger');
            resetStatsTemporaires();
            setTimeout(() => tourEnnemi(), 1500);
        }
    });
}

// ===== RÉINITIALISATION DES STATS TEMPORAIRES =====

function resetStatsTemporaires() {
    const classStats = getClassStats(selectedClass);
    gameState.pnj.degats = classStats.stats.degats;
}

// ===== TOUR DE L'ENNEMI =====

function tourEnnemi() {
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
                        nouveauTour();
                    }
                });
            }, 500);
        } else {
            logMessage('✗ L\'ennemi rate son attaque !', 'success');
            nouveauTour();
        }
    });
}

// ===== NOUVEAU TOUR =====

function nouveauTour() {
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