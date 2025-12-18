// Variables globales
let selectedClass = null;

// Fonction d'initialisation
function initGame()
{
    const cards = document.querySelectorAll('.classe-card');
    const btnStart = document.getElementById('btnStart');

    // Gestion de la sélection des classes
    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', function() {
                selectClass(this, cards, btnStart);
            });
        });
    }

    // Gestion du bouton démarrer
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            startGame();
        });
    }
}

// Fonction pour sélectionner une classe
function selectClass(selectedCard, allCards, button)
{
    // Retire la sélection de toutes les cartes
    allCards.forEach(c => c.classList.remove('selected'));
    
    // Ajoute la sélection à la carte cliquée
    selectedCard.classList.add('selected');
    
    // Stocke la classe sélectionnée
    selectedClass = selectedCard.dataset.classe;
    
    // Affiche le bouton de démarrage
    if (button) {
        button.classList.add('active');
    }
    
    console.log('Classe sélectionnée:', selectedClass);
}

// Fonction pour démarrer le jeu
function startGame()
{
    if (selectedClass)
        {
            console.log('Démarrage du jeu avec la classe:', selectedClass);
            
            // Affiche un message de confirmation
            alert(`Vous avez choisi la classe : ${selectedClass.toUpperCase()}\n\nL'aventure commence !`);
            
            // Sauvegarde la classe dans le localStorage
            localStorage.setItem('playerClass', selectedClass);
            
            // Redirige vers la page de jeu (à décommenter et adapter)
            // window.location.href = 'game.html?classe=' + selectedClass;
            
            // Ou lance directement le jeu
            // launchGameplay();
        }
    else
        {
            alert('Veuillez d\'abord sélectionner une classe !');
        }
}

// Fonction pour récupérer les stats d'une classe
function getClassStats(className)
{
    const classData = {
        guerrier:
        {
            name: 'Guerrier',
            icon: '⚔️',
            stats: {
                force: 90,
                defense: 85,
                magie: 30,
            },
            skills: ['Coup puissant', 'Bouclier', 'Sang froid']
        },
        mage:
        {
            name: 'Mage',
            icon: '🔮',
            stats: {
                force: 30,
                defense: 40,
                magie: 95,
            },
            skills: ['Flamme', 'Froid', 'Protection']
        },
        Voleur:
        {
            name: 'Voleur',
            icon: '🏹',
            stats: {
                force: 60,
                defense: 50,
                magie: 45,
            },
            skills: ['Frappe mortelle', 'Frappe multiple', 'Esquive']
        }
    };
    
    return classData[className] || null;
}

// Fonction pour récupérer la classe du joueur
function getPlayerClass() {
    return localStorage.getItem('playerClass') || selectedClass;
}

// Fonction pour lancer le gameplay (à développer)
function launchGameplay() {
    const playerClass = getPlayerClass();
    const classStats = getClassStats(playerClass);
    
    console.log('Lancement du gameplay avec:', classStats);
    
    // Ici, vous pouvez développer la logique de votre jeu
    // Exemple: initialiser le personnage, charger le premier niveau, etc.
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    console.log('Jeu initialisé !');
});


//voici mon programme
voici mon gameplay en algo (si il fait corriger n'hésite pas):
début
string deplacement;
entier PNJ_PV;
entier PNJ_MOB;
entier tour;
entier nv;

    nv = 1;
    tant que (nv !=11 || PNJ_PV !=0)
    {
        tour = 0;
        tant que (PNJ_PV != 0 || PNJ_MOB!=0)
        {
            tour++;
            écrire Tours "tour";
            écrire "Placez vous";
            écrire "Longue portée,Portée moyenne,Courte portée";
            lire deplacement;
        }
        nv++;
    }
fin