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

// Fonction pour lancer un dé
function lancerDe(faces) {
    return Math.floor(Math.random() * faces) + 1;
}

// Fonction pour générer un nombre aléatoire entre min et max
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour afficher un message dans le log de combat
function logMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Vous pouvez créer une div pour afficher les messages dans le HTML
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

function getClassStats(className)
{
    const classData = {
        guerrier: {
            name: 'Guerrier',
            icon: '⚔️',
            stats: {
                pv: 120,          // ← AJOUTEZ
                attaque: 12,      // ← MODIFIEZ
                defense: 10,      // ← MODIFIEZ
                magie: 3,         // ← MODIFIEZ
                degats: 8         // ← AJOUTEZ
            },
            skills: ['Coup puissant', 'Bouclier', 'Sang froid']
        },
        mage: {
            name: 'Mage',
            icon: '🔮',
            stats: {
                pv: 80,           // ← AJOUTEZ
                attaque: 6,       // ← MODIFIEZ
                defense: 5,       // ← MODIFIEZ
                magie: 15,        // ← MODIFIEZ
                degats: 4         // ← AJOUTEZ
            },
            skills: ['Flamme', 'Coup rapide', 'Protection']
        },
        voleur: {                 // ← ATTENTION: minuscule
            name: 'Voleur',
            icon: '🗡️',          // ← CHANGEZ l'icône
            stats: {
                pv: 100,          // ← AJOUTEZ
                attaque: 10,      // ← MODIFIEZ
                defense: 7,       // ← MODIFIEZ
                magie: 5,         // ← MODIFIEZ
                degats: 6         // ← AJOUTEZ
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
        
        // Initialise le personnage avec les stats de la classe
        const classStats = getClassStats(selectedClass);
        gameState.pnj = {
            ...gameState.pnj,
            ...classStats.stats,
            pvMax: classStats.stats.pv
        };
        
        localStorage.setItem('playerClass', selectedClass);
        
        // Lance le gameplay
        launchGameplay();
    } else {
        alert('Veuillez d\'abord sélectionner une classe !');
    }
}

// ===== GAMEPLAY PRINCIPAL =====

function launchGameplay() {
    logMessage('=== DÉBUT DE L\'AVENTURE ===', 'success');
    logMessage(`Vous êtes un ${getClassStats(selectedClass).name}`, 'info');
    
    // Boucle des niveaux
    // while (gameState.niveau <= 10 && gameState.pnj.pv > 0)
    // {
    //     logMessage(`\n=== NIVEAU ${gameState.niveau} ===`, 'warning');
        
    //     // Génère un nouvel ennemi pour ce niveau
    //     genererEnnemi(gameState.niveau);
        
    //     // Combat jusqu'à la mort de l'un des deux
    //     combattre();
        
    //     // Si le joueur survit, passe au niveau suivant
    //     if (gameState.pnj.pv > 0) {
    //         logMessage(`Niveau ${gameState.niveau} terminé !`, 'success');
    //         gameState.niveau++;
            
    //         // Restaure un peu de PV entre les niveaux
    //         soignerJoueur(20);
    //     }
    // }
    genererEnnemi(gameState.niveau);
    combattre();
    
    // Fin du jeu
    finDePartie();
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
}

// ===== SYSTÈME DE COMBAT =====

function combattre() {
    gameState.tour = 0;
    
    while (gameState.pnj.pv > 0 && gameState.mob.pv > 0) {
        gameState.tour++;
        logMessage(`\n--- TOUR ${gameState.tour} ---`, 'warning');
        
        // Phase de positionnement
        choisirPortee();
        
        // Tour du joueur
        tourJoueur();
        
        // Vérifie si le mob est mort
        if (gameState.mob.pv <= 0) {
            logMessage('L\'ennemi est vaincu !', 'success');
            break;
        }
        
        // Tour de l'ennemi
        tourEnnemi();
        
        // Vérifie si le joueur est mort
        if (gameState.pnj.pv <= 0) {
            logMessage('Vous êtes mort...', 'danger');
            break;
        }
        
        // Affiche l'état actuel
        afficherEtat();
    }
}

// ===== CHOIX DE LA PORTÉE =====

function choisirPortee() {
    // Pour la démo, choix aléatoire
    // Dans votre version finale, vous demanderez au joueur
    const portees = ['longue', 'moyenne', 'courte'];
    gameState.portee = portees[random(0, 2)];
    
    logMessage(`Vous vous positionnez à ${gameState.portee} portée`, 'info');
    
    // Calcul des modificateurs selon la portée
    if (gameState.portee === 'longue') {
        gameState.attaqueActuelle = gameState.pnj.attaque - (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense + (gameState.pnj.defense * 0.25);
        logMessage('Attaque -25%, Défense +25%', 'info');
    } else if (gameState.portee === 'moyenne') {
        gameState.attaqueActuelle = gameState.pnj.attaque;
        gameState.defenseActuelle = gameState.pnj.defense;
        logMessage('Stats normales', 'info');
    } else { // courte
        gameState.attaqueActuelle = gameState.pnj.attaque + (gameState.pnj.attaque * 0.25);
        gameState.defenseActuelle = gameState.pnj.defense - (gameState.pnj.defense * 0.25);
        logMessage('Attaque +25%, Défense -25%', 'info');
    }
}

// ===== TOUR DU JOUEUR =====

function tourJoueur() {
    logMessage('\n🗡️ Votre tour !', 'info');
    
    // Lancer d'attaque (d20 + modificateur d'attaque)
    const de20 = lancerDe(20);
    const jetAttaque = Math.floor(gameState.attaqueActuelle) + de20;
    
    logMessage(`Jet d'attaque: ${de20} + ${Math.floor(gameState.attaqueActuelle)} = ${jetAttaque}`, 'info');
    logMessage(`Défense ennemie: ${gameState.mob.defense}`, 'info');
    
    // Vérifie si l'attaque touche
    if (jetAttaque >= gameState.mob.defense) {
        logMessage('✓ Vous touchez l\'ennemi !', 'success');
        
        // Calcul des dégâts (dégâts de base + d6)
        const de6 = lancerDe(6);
        const degats = gameState.pnj.degats + de6;
        
        logMessage(`Dégâts: ${gameState.pnj.degats} + ${de6} = ${degats}`, 'success');
        
        gameState.mob.pv -= degats;
        if (gameState.mob.pv < 0) gameState.mob.pv = 0;
        
        logMessage(`L'ennemi perd ${degats} PV ! (PV restants: ${gameState.mob.pv})`, 'danger');
    } else {
        logMessage('✗ Vous ratez votre attaque !', 'danger');
    }
    
    // Action bonus (à implémenter selon vos besoins)
    // actionBonus();
}

// ===== TOUR DE L'ENNEMI =====

function tourEnnemi() {
    logMessage('\n👹 Tour de l\'ennemi !', 'warning');
    
    // Lancer d'attaque (d20 + modificateur d'attaque)
    const de20 = lancerDe(20);
    const jetAttaque = gameState.mob.attaque + de20;
    
    logMessage(`Jet d'attaque: ${de20} + ${gameState.mob.attaque} = ${jetAttaque}`, 'warning');
    logMessage(`Votre défense: ${Math.floor(gameState.defenseActuelle)}`, 'info');
    
    // Vérifie si l'attaque touche
    if (jetAttaque >= Math.floor(gameState.defenseActuelle)) {
        logMessage('✓ L\'ennemi vous touche !', 'danger');
        
        // Calcul des dégâts (dégâts de base + d6)
        const de6 = lancerDe(6);
        const degats = gameState.mob.degats + de6;
        
        logMessage(`Dégâts: ${gameState.mob.degats} + ${de6} = ${degats}`, 'danger');
        
        gameState.pnj.pv -= degats;
        if (gameState.pnj.pv < 0) gameState.pnj.pv = 0;
        
        logMessage(`Vous perdez ${degats} PV ! (PV restants: ${gameState.pnj.pv})`, 'danger');
    } else {
        logMessage('✗ L\'ennemi rate son attaque !', 'success');
    }
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
}

function finDePartie() {
    if (gameState.pnj.pv > 0 && gameState.niveau > 10) {
        logMessage('\n🎉 VICTOIRE ! Vous avez terminé tous les niveaux !', 'success');
        alert('Félicitations ! Vous avez gagné !');
    } else {
        logMessage('\n💀 GAME OVER ! Vous êtes mort au niveau ' + gameState.niveau, 'danger');
        alert('Game Over ! Essayez encore ?');
    }
    
    // Réinitialise le jeu
    // resetGame();
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