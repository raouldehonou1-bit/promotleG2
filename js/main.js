/**
 * script.js — Moteur logique du Quiz Terminale G2
 * Auteur : Raoul DEHONOU · Informatique de Gestion
 * ──────────────────────────────────────────────────
 * Architecture :
 *   1. DATA        → Base de données JSON (questions + joueurs)
 *   2. STATE       → Objet d'état centralisé (source de vérité unique)
 *   3. SCREENS     → Gestion des transitions sans rechargement de page
 *   4. WELCOME     → Initialisation de l'écran d'accueil
 *   5. QUIZ ENGINE → Rendu et algorithme de vérification
 *   6. VERDICT     → Calcul du score final et affichage du résultat
 *   7. WHATSAPP    → Passerelle de partage via l'API WhatsApp
 *   8. UTILS       → Confettis, particules, helpers
 *   9. INIT        → Point d'entrée unique au chargement du DOM
 */

'use strict';

/* ════════════════════════════════════════════════════════
   1. DATA — Stockage centralisé (JSON)
════════════════════════════════════════════════════════ */

/**
 * @typedef  {Object} Question
 * @property {string}   q        Énoncé de la question
 * @property {string[]} options  Tableau de 4 propositions
 * @property {number}   answer   Index (0-3) de la bonne réponse dans options[]
 */

/** @type {Question[]} */
const DATA = {

  /** Liste des prénoms de la promotion — à personnaliser */
  players: [
    'Alice Zinsou','Adélaïde','Andil lassissi','Armande','Benedicte ADANGO','Bernadette SONON','Blaise Fluvio','Cornellia','Divine',
    'Cosmaine','Marie Christelle','Elisée','Emerick Tos Boc','Jordan LAGOYE','Loriane',
    'Sylvie','Véronica','Danilo & Fils','Maïssarath','Brayan','Raoul DHN',
    'autre' // 👈 On ajoute la valeur spéciale tout à la fin
  ],

  /** URL du portfolio Netlify — remplacer avant déploiement */
  portfolioURL: 'https://raouldehonou.netlify.app/',

  /** Questions du quiz (10 questions de Sciences de Gestion) */
  questions: [
    {
      q: "Quelle est la pire phrase à entendre de la part d'un camarade juste avant d'entrer en salle d'examen ?",
      options: [
        "Tu as révisé le chapitre sur les annuités ? C'est tombé à coup sûr !",
        "Est-ce que le prof a reporté l'épreuve ?",
        "Il paraît que l'examen est super facile cette année",
        "Tu as deux calculatrices à me prêter ?"
      ],
      answer: 0
    }, 
    {
      q: "Quelle était la technique suprême pour espérer que le prof ne t'interroge pas au tableau ?",
      options: [
        "Le regarder fixement dans les yeux avec assurance",
        "Faire semblant de chercher intensément un stylo au fond de son sac",
        "Lever la main en priant pour qu'il choisisse quelqu'un d'autre",
        "Poser une question compliquée pour faire diversion"
      ],
      answer: 1
    }, 
    {
      q: "En Droit OHADA et Compta des Sociétés, lors d'une augmentation de capital, quel mécanisme juridique protège les anciens actionnaires contre la dilution de leur pouvoir en leur permettant d'acheter de nouvelles actions en priorité ?",
      options: [
        "Le Droit Préférentiel de Souscription (DPS)",
        "Le Droit d'Attribution Gratuit (DAG)",
        "La Prime d'Émission",
        "Le Vote de l'Assemblée Générale Ordinaire"
      ],
      answer: 0
    },
    {
      q: "Quelle est l'attitude typique de la classe quand la cloche sonne enfin la récréation de 10 heures ?",
      options: [
        "Attendre sagement que le professeur range ses affaires",
        "Un grand soupir collectif suivi d'une disparition instantanée",
        "Prendre de l'avance pour noter le cours suivant",
        "Aller poser des questions bonus au bureau du prof"
      ],
      answer: 1
    }, 
    {
      q: "Pour un élève de G2, qu'est-ce qui est plus stressant que de voir sa balance comptable fausse d'un seul franc ?",
      options: [
        "Rien. Absolument rien sur cette terre.",
        "Rater le début de son match de football préféré",
        "Arriver en retard au cours de Droit",
        "Oublier sa boîte de craies"
      ],
      answer: 0
    },
    {
      q: "Quel événement mineur peut provoquer une panique générale dans la classe en moins de deux secondes ?",
      options: [
        "Une coupure d'électricité en plein après-midi",
        "Le prof de Compta qui dit : 'Sortez une feuille de papier volante'",
        "Le responsable qui efface le tableau sans faire exprès",
        "L'absence surprise du prof d'Anglais"
      ],
      answer: 1
    },
    {
      q: "Quel est le seul et unique secret pour espérer survivre à la Terminale G2 avec le sourire ?",
      options: [
        "Apprendre le SYSCOHADA par cœur de la classe 1 à 9",
        "Avoir une solide bande de potes pour partager les migraines et les rires",
        "Ne jamais contredire le responsable de classe",
        "Boire trois cafés avant chaque cours d'Économie"
      ],
      answer: 1
    },
                // La fin des question blagues 
    {
      q: "Si un jour Armande, Bénédicte et Adélaïde se mettent à bavarder bruyamment en classe, quelle sera la réaction de la promo ?",
      options: [
        "Personne ne va remarquer",
        "Une panique générale, tout le monde va croire que c'est la fin du monde 😱",
        "Le prof va leur donner un prix d'excellence",
        "Raoul va enfin pouvoir se reposer et garder le silence"
      ],
      answer: 1
    },
    {
      q: "Quelle est la pire épreuve pour Jordan pendant les heures de cours intensifs ?",
      options: [
        "Calculer un coût de revient en CAGE",
        "Essayer de rester sérieux alors qu'Andil balance des vannes à côté de lui",
        "Écouter le prof de Droit parler pendant 2 heures",
        "Prêter sa calculatrice à Andil Lassissi"
      ],
      answer: 1
    },
    {
      q: "Le jour où Raoul va venir en classe et annoncer : 'Aujourd'hui, j'ai compris tout le texte d'Anglais sans tricher', quelle sera la réaction d'Andil ?",
      options: [
        "Il va applaudir sagement",
        "Il va appeler toute la promo G2 pour vérifier si Raoul n'a pas de la fièvre 🤒",
        "Il va lui demander de lui expliquer le cours",
        "Il va l'ignorer pour continuer à dormir"
      ],
      answer: 1
    },           
    {
      q: "Quelle est la plus grande surprise, limite un miracle national, qui puisse arriver en fin de trimestre ?",
      options: [
        "Que le prof de maths gene ne viens pas ",
        "Que Raoul décroche une note de 14, 15 ou 17 en Anglais",
        "Qu'Adélaïde commence à bavarder au premier rang",
        "Que la récréation dure 1 heure"
      ],
      answer: 1
    },
    {
      q: "Si on cherche les leaders incontestés du bavardage intensif au fond de la classe, on tombe direct sur :",
      options: [
        "Bénédicte et Armande",
        "Le trio de choc : Raoul, Andil Lassissi et Emerick",
        "Le délégué et le prof d'Éco",
        "Adélaïde toute seule"
      ],
      answer: 1
    },
    {
      q: "Pendant que la classe est en plein chaos et que le prof crie, qui retrouve-t-on toujours calmes et imperturbables ?",
      options: [
        "Raoul et Jordan",
        "Andil et Emerick",
        "Le groupe des sages : Adélaïde, Bénédicte et Armande",
        "La rangée du fond"
      ],
      answer: 2
    },
    {
      q: "Quelle est l'activité principale de Jordan quand le cours de Mathématique générale devient trop technique ?",
      options: [
        "Prendre des notes en quatre couleurs",
        "Sortir des vannes hyper drôles pour déconcentrer les voisins",
        "Aller s'asseoir à côté d'Armande pour être calme",
        "Résoudre l'exercice au tableau"
      ],
      answer: 1
    },
    {
      q: "Si Andil Lassissi commence à t'expliquer un calcul de mathématiques financières, tu dois t'attendre à :",
      options: [
        "Cinq minutes de formules et trente minutes de fous rires",
        "Un silence religieux dans toute la salle",
        "Une explication digne d'un professeur d'université",
        "Ce qu'il s'endorme au milieu de la phrase"
      ],
      answer: 0
    },
    {
      q: "Quel est le super-pouvoir caché de Bénédicte et Adélaïde pendant les heures de cours les plus agitées ?",
      options: [
        "Bavarder plus vite que Raoul et Emerick",
        "Garder leur calme absolu comme si elles étaient seules au monde",
        "Effacer le tableau en cachette",
        "Négocier les reports de devoirs"
      ],
      answer: 1
    },
    {
      q: "Dans l'histoire de la promo G2, qui détient le record du plus grand nombre de mots prononcés à la minute ?",
      options: [
        "Le prof de Droit",
        "Le trio infernal : Raoul, Andil et Emerick",
        "Adélaïde quand elle est en colère",
        "La vendeuse de croissants du matin à la cantine"
      ],
      answer: 1
    },
    {
      q: "Quelle phrase résume parfaitement l'ambiance de notre classe de G2 ?",
      options: [
        "Du silence, du travail et encore du silence",
        "Les rires d'Emerick et Andil au fond, le calme d'Armande au milieu",
        "Une préparation militaire sans aucun moment de pause",
        "Une classe où personne ne se parle"
      ],
      answer: 1
    },
    {
      q: "Quel est le diplôme officiel que Raoul, Andil Lassissi, Emerick et Jordan méritent de recevoir en plus du BAC ?",
      options: [
        "Le Doctorat en silence absolu",
        "La Licence de Gestion de l'ambiance et des fous rires professionnels",
        "Le prix de la timidité internationale",
        "Le certificat d'aptitude à l'Anglais littéraire"
      ],
      answer: 1
    },           
    {
      q: "En Mathématiques Financières, quelle est la formule magique pour calculer l'intérêt simple ?",
      options: [
        "I = C x t x n / 1200",
        "I = C x t x n / 36000",
        "I = C x (1 + i)^n",
        "I = Vd - Vb"
      ],
      answer: 1
    },
    {
      q: "Lors de la constitution d'une société, comment appelle-t-on les apports en argent frais ?",
      options: [
        "Les apports en nature",
        "Les apports en industrie",
        "Les apports en numéraire",
        "Les apports en compte courant"
      ],
      answer: 2
    },
    {
      q: "En Comptabilité Analytique (CAGE), comment appelle-t-on les charges qui n'entrent pas dans le calcul des coûts ?",
      options: [
        "Les charges supplétives",
        "Les charges non incorporables",
        "Les charges variables",
        "Les charges directes"
      ],
      answer: 1
    },
    {
      q: "Quel compte du SYSCOHADA révisé est utilisé pour enregistrer le Capital social ?",
      options: [
        "Le compte 101",
        "Le compte 102",
        "Le compte 161",
        "Le compte 211"
      ],
      answer: 0
    },
    {
      q: "En Droit, quelle est la sanction suprême pour une société qui n'arrive plus à payer ses dettes (cessation des paiements) ?",
      options: [
        "Le redressement judiciaire",
        "La liquidation des biens",
        "L'amende fiscale",
        "La mise en demeure"
      ],
      answer: 1
    },
    {
      q: "En Économie Générale, quel indicateur mesure la richesse totale produite par un pays comme le Bénin en une année ?",
      options: [
        "Le RNB (Revenu National Brut)",
        "L'IDH (Indice de Développement Humain)",
        "Le PIB (Produit Intérieur Brut)",
        "La Balance Commerciale"
      ],
      answer: 2
    },
    {
      q: "Quelle est la définition exacte du 'BFR' que le prof de gestion répétait tous les matins ?",
      options: [
        "Besoin de Financement Rapide",
        "Bilan Financier Réduit",
        "Besoin en Fonds de Roulement",
        "Bénéfice Réel de l'Exercice"
      ],
      answer: 2
    },
    {
      q: "En Comptabilité des Sociétés, qu'est-ce que l'Actionnaire Défaillant ?",
      options: [
        "Un actionnaire qui a perdu ses actions",
        "Un actionnaire qui ne paie pas ses appels de fonds dans les délais",
        "Un actionnaire qui refuse de voter à l'Assemblée Générale",
        "Un actionnaire qui fait faillite personnelle"
      ],
      answer: 1
    },
    {
      q: "Dans l'évaluation des stocks en CAGE, que signifie l'acronyme 'CMUP' ?",
      options: [
        "Coût Moyen Unitaire Pondéré",
        "Calcul Mensuel Unique des Prix",
        "Coût Maximum d'Utilité Publique",
        "Contrôle de la Marge Unique Produite"
      ],
      answer: 0
    },
    {
      q: "En Droit des Sociétés (OHADA), quel est le capital social minimum légal pour créer une SA (Société Anonyme) sans appel public à l'épargne ?",
      options: [
        "1 000 000 FCFA",
        "5 000 000 FCFA",
        "10 000 000 FCFA",
        "50 000 000 FCFA"
      ],
      answer: 2
    },
    {
      q: "Quelle formule utilisez-vous pour trouver la Valeur Actuelle d'un capital placé à intérêts composés ?",
      options: [
        "Vn = V0 * (1 + i)^n",
        "V0 = Vn * (1 + i)^-n",
        "I = C * t * n",
        "Vn = V0 + I"
      ],
      answer: 1
    },
    {
      q: "Dans le SYSCOHADA, à quelle classe appartiennent les comptes de charges ?",
      options: [
        "La classe 4",
        "La classe 5",
        "La classe 6",
        "La classe 7"
      ],
      answer: 2
    },
    {
      q: "En gestion budgétaire, quelle est la formule du Seuil de Rentabilité (SR) en valeur ?",
      options: [
        "Charges Fixes / Taux de Marge sur Coût Variable",
        "Chiffre d'Affaires - Charges Variables",
        "Marge sur Coût Variable / Charges Fixes",
        "Chiffre d'Affaires / Charges Fixes"
      ],
      answer: 0
    },
    {
      q: "Quel document juridique OHADA regroupe toutes les règles applicables aux commerçants et aux sociétés commerciales ?",
      options: [
        "L'Acte Uniforme",
        "Le Code Civil",
        "La Constitution du Bénin",
        "Le Code du Travail"
      ],
      answer: 0
    },
    {
      q: "En Comptabilité des Sociétés, les frais engagés pour créer l'entreprise (frais de prospection, honoraires du notaire) sont appelés :",
      options: [
        "Frais de gestion courante",
        "Frais d'établissement",
        "Charges de personnel",
        "Immobilisations corporelles"
      ],
      answer: 1
    },
    {
      q: "Quelle opération financière consiste, pour une entreprise, à vendre ses effets de commerce à la banque avant leur échéance pour obtenir du cash ?",
      options: [
        "L'amortissement",
        "Le recouvrement",
        "L'escompte commercial",
        "L'emprunt indivis"
      ],
      answer: 2
    },
    {
      q: "En Fiscalité des entreprises, quel est le taux général de la TVA appliqué au Bénin ?",
      options: [
        "15 %",
        "18 %",
        "20 %",
        "22 %"
      ],
      answer: 1
    },
            //  C"est la fin des question juste
    {
      q: "Quel document comptable retrace les flux de trésorerie d'une entreprise ?",
      options: [
        "Le compte de résultat",
        "Le bilan comptable",
        "Le registre du commerce",
        "Le tableau des flux de trésorerie"
      ],
      answer: 3
    }, 
    {
      q: "Quel outil magique était plus précieux qu'un passeport pour espérer valider ses examens de G2 ?",
      options: [
        "Le livre de relecture générale",
        "La calculatrice scientifique (Casio)",
        "Une boîte complète de bics de rechange",
        "Le gros dictionnaire du salon"
      ],
      answer: 1
    },
    {
      q: "Quand le prof d'Économie commençait sa phrase par 'En principe...', cela signifiait quoi pour la classe ?",
      options: [
        "Que le cours était enfin terminé",
        "Qu'une interrogation surprise venait de naître",
        "Que personne n'allait capter la suite du cours",
        "Qu'il s'apprêtait à raconter sa vie au quartier"
      ],
      answer: 2
    },
    {
      q: "Quelle était l'expression ou l'action préférée notre responsable pour tenter de calmer les bavardages ?",
      options: [
        "Le prefet arrive !",
        "S'il vous plaît, silence !",
        "Écrivez les bavards !",
        "Le prof est déjà au portail !"
      ],
      answer: 0
    },
    {
      q: "En Sciences de Gestion, qu'est-ce qu'un bilan comptable ?",
      options: [
        "Document listant les actifs et passifs d'une entreprise",
        "Un relevé bancaire mensuel",
        "Un contrat de travail",
        "Un plan de communication marketing"
      ],
      answer: 0
    },
    {
      q: "Quelle est la formule correcte du Chiffre d'Affaires (CA) ?",
      options: [
        "Charges × Bénéfice",
        "Prix Unitaire × Quantités Vendues",
        "Actif Total – Passif Total",
        "Recettes – Dépenses"
      ],
      answer: 1
    },
    {
      q: "Que signifie l'acronyme TVA ?",
      options: [
        "Taux de Variation des Actifs",
        "Traitement de Versement Annuel",
        "Taxe sur la Valeur Ajoutée",
        "Titre de Vente Authentifié"
      ],
      answer: 2
    },
    {
      q: "Dans un organigramme d'entreprise, que désigne le sigle PDG ?",
      options: [
        "Programmateur de Données Globales",
        "Président Directeur Général",
        "Partenaire de Distribution Géré",
        "Personnel de Direction Générale"
      ],
      answer: 1
    },
    {
      q: "Un marché oligopolistique est caractérisé par…",
      options: [
        "Un très grand nombre de vendeurs et d'acheteurs",
        "Un seul vendeur face à de nombreux acheteurs",
        "Un petit nombre de grandes entreprises dominantes",
        "L'absence totale de concurrence réglementée"
      ],
      answer: 2
    },
    {
      q: "Quelle est la différence fondamentale entre une charge fixe et une charge variable ?",
      options: [
        "La fixe est mensuelle, la variable est annuelle",
        "La fixe est matérielle, la variable est humaine",
        "La fixe est indépendante du volume de production, la variable en dépend",
        "La fixe est payée en cash, la variable par chèque"
      ],
      answer: 2
    },
    {
      q: "À quoi sert un business plan ?",
      options: [
        "À présenter un projet d'entreprise, sa stratégie et sa viabilité financière",
        "À formaliser un contrat entre deux entreprises partenaires",
        "À lister les tâches quotidiennes des employés",
        "À produire le rapport de fin d'exercice comptable"
      ],
      answer: 0
    },
    {
      q: "Parmi ces formes juridiques, laquelle n'est PAS une société commerciale reconnue ?",
      options: [
        "SARL (Société À Responsabilité Limitée)",
        "SAS (Société par Actions Simplifiée)",
        "SAR (Société À Apport Restreint)",
        "SA (Société Anonyme)"
      ],
      answer: 2
    },
    {
      q: "La valeur ajoutée d'une entreprise correspond à…",
      options: [
        "La richesse créée après déduction des consommations intermédiaires",
        "Le bénéfice net après impôts",
        "La somme totale des ventes sur l'exercice",
        "La différence entre l'actif immobilisé et le passif courant"
      ],
      answer: 0
    },
    {
      q: "Quel document comptable retrace les flux de trésorerie d'une entreprise ?",
      options: [
        "Le compte de résultat",
        "Le bilan comptable",
        "Le registre du commerce",
        "Le tableau des flux de trésorerie"
      ],
      answer: 3
    }
  ]
};

/* ════════════════════════════════════════════════════════
   2. STATE — Objet d'état centralisé (source de vérité)
════════════════════════════════════════════════════════ */

const STATE = {
  playerName:    '',      // prénom sélectionné
  currentIndex:  0,       // index de la question en cours (0-based)
  score:         0,       // nombre de bonnes réponses
  answered:      false,   // verrou anti-double-clic
  preparedQs:    [],      // questions avec options mélangées
};


/** Remet l'état à zéro pour une nouvelle partie et mélange tout */
function resetState() {
  STATE.playerName   = '';
  STATE.currentIndex = 0;
  STATE.score        = 0;
  STATE.answered     = false;

  // 1. On crée une copie propre du tableau des questions pour éviter d'abîmer le DATA d'origine
  const qsCopy = [...DATA.questions];

  // 2. On mélange l'ordre des questions (Algorithme Fisher-Yates, exactement comme tu l'as fait pour les options)
  for (let i = qsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qsCopy[i], qsCopy[j]] = [qsCopy[j], qsCopy[i]];
  }

  // 3. On applique ensuite ton mélange d'options sur les questions déjà mélangées
  STATE.preparedQs = qsCopy.map(shuffleOptions);
}

/* ════════════════════════════════════════════════════════
   3. SCREENS — Transitions sans rechargement de page
════════════════════════════════════════════════════════ */

/** @type {Object.<string, HTMLElement>} */
const SCREENS = {};   // rempli dans init()

/**
 * Masque l'écran actif et affiche l'écran cible.
 * @param {'screen-welcome'|'screen-quiz'|'screen-result'} id
 */
function showScreen(id) {
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[id].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ════════════════════════════════════════════════════════
   4. WELCOME — Initialisation de l'écran d'accueil
════════════════════════════════════════════════════════ */

/** Peuple le <select> avec la liste des joueurs depuis DATA.players */
function buildPlayerSelect() {
  const select = document.getElementById('name-select');
  const startBtn = document.getElementById('start-btn');
  const customContainer = document.getElementById('custom-name-container');
  const customInput = document.getElementById('custom-name-input');

  // Injecter les options dynamiquement
  DATA.players
    .slice()                   // copie pour ne pas muter le tableau source
    .sort((a, b) => {
      // Sécurité : On force l'option "autre" à rester tout en bas de la liste après le tri
      if (a === 'autre') return 1;
      if (b === 'autre') return -1;
      return a.localeCompare(b);
    })
    .forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      
      // Si c'est la valeur magique, on lui donne un joli texte
      if (name === 'autre') {
        opt.textContent = "✍️ Mon prénom n'est pas dans la liste";
      } else {
        opt.textContent = name;
      }
      select.appendChild(opt);
    });

  // Fonction centrale pour gérer l'activation du bouton de départ
  function checkInputs() {
    if (select.value === 'autre') {
      // Si "autre" est choisi, le bouton s'active si le champ texte n'est pas vide
      const textFilled = customInput.value.trim() !== '';
      startBtn.disabled = !textFilled;
      startBtn.setAttribute('aria-disabled', String(!textFilled));
    } else {
      // Sinon, il s'active si une option normale est sélectionnée
      const hasValue = select.value !== '';
      startBtn.disabled = !hasValue;
      startBtn.setAttribute('aria-disabled', String(!hasValue));
    }
  }

  // Écouteur sur la liste déroulante
  select.addEventListener('change', () => {
    if (select.value === 'autre') {
      customContainer.style.display = 'block'; // On montre le champ texte
      customInput.focus();                     // On met le curseur dedans
    } else {
      customContainer.style.display = 'none';  // On cache le champ texte
      customInput.value = '';                  // On nettoie le texte tapé
    }
    checkInputs();
  });

  // Écouteur sur le champ de saisie libre (vérification à chaque lettre tapée)
  customInput.addEventListener('input', checkInputs);

  // Lancer le quiz au clic du bouton
  startBtn.addEventListener('click', () => {
    if (!startBtn.disabled) {
      let finalName = select.value;
      
      // Si le joueur a écrit son nom lui-même, on capture sa saisie
      if (finalName === 'autre') {
        finalName = customInput.value.trim();
      }
      
      launchQuiz(finalName);
    }
  });
}

/** Démarre le quiz avec le prénom choisi */
function launchQuiz(name) {
  STATE.playerName = name;

  // Mettre à jour l'interface du quiz
  const avatarLetter = document.getElementById('avatar-letter');
  const playerChip = document.getElementById('player-name-chip');
  
  if (avatarLetter && name.length > 0) {
    avatarLetter.textContent = name[0].toUpperCase();
  }
  if (playerChip) {
    playerChip.textContent = name;
  }

  // Mélange les questions et réinitialise le score
  resetState();
  
  // On force l'enregistrement du nom final dans le STATE car resetState() le vide
  STATE.playerName = name;

  showScreen('screen-quiz');
  renderQuestion();
}

/* ════════════════════════════════════════════════════════
   5. QUIZ ENGINE — Rendu des questions & vérification
════════════════════════════════════════════════════════ */

/**
 * Mélange les options d'une question (algorithme Fisher-Yates)
 * et conserve la référence à la bonne réponse.
 *
 * @param   {Question} raw  Question originale depuis DATA
 * @returns {{ q: string, opts: {text:string, correct:boolean}[] }}
 */
function shuffleOptions(raw) {
  const opts = raw.options.map((text, i) => ({
    text,
    correct: i === raw.answer
  }));

  // Fisher-Yates shuffle
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  return { q: raw.q, opts };
}

/** Affiche la question courante dans le DOM */
function renderQuestion() {
  STATE.answered = false;

  const idx     = STATE.currentIndex;
  const qData   = STATE.preparedQs[idx];
  const letters = ['A', 'B', 'C', 'D'];

  // ── Compteur discret (SANS LE TOTAL POUR LE MYSTÈRE)
  document.getElementById('q-num').textContent         = `Question ${String(idx + 1).padStart(2, '0')}`;
  document.getElementById('q-text').textContent        = qData.q;
  
  document.getElementById('progress-label').textContent = `Question ${idx + 1}`;
  document.getElementById('progress-pct').textContent   = `En cours... 🤫`;
  document.getElementById('progress-fill').style.width  = `100%`;
  document.getElementById('score-display').textContent  = STATE.score;

  const progressBar = document.getElementById('progress-bar-role');
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', '100');
  }

  // ── Masquer le toast feedback
  const toast = document.getElementById('feedback-toast');
  toast.className    = 'feedback-toast';
  toast.textContent  = '';

  // 🧹 Suppression propre de l'ancienne zone d'actions pour démarrer la question à neuf
  const oldActions = document.getElementById('quiz-actions-container');
  if (oldActions) oldActions.remove();

  // ── Ré-animer la carte question
  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  requestAnimationFrame(() => { card.style.animation = ''; });

  // ── Injecter les boutons d'options
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';

  qData.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('aria-label', `Option ${letters[i]} : ${opt.text}`);
    btn.innerHTML = `<span class="option-letter" aria-hidden="true">${letters[i]}</span>${opt.text}`;
    btn.addEventListener('click', () => handleAnswer(btn, opt.correct));
    grid.appendChild(btn);
  });
}

/**
 * Algorithme de vérification du choix de l'utilisateur.
 *
 * @param {HTMLButtonElement} selectedBtn  Bouton cliqué
 * @param {boolean}           isCorrect    La proposition est-elle correcte ?
 */
function handleAnswer(selectedBtn, isCorrect) {
  if (STATE.answered) return;   // verrou anti-double-clic
  STATE.answered = true;

  const allBtns = document.querySelectorAll('.option-btn');
  const toast   = document.getElementById('feedback-toast');
  const grid    = document.getElementById('options-grid');

  // ── Désactiver tous les boutons d'options
  allBtns.forEach(btn => (btn.disabled = true));

  // ── Révéler la bonne réponse (coloration verte)
  const qData = STATE.preparedQs[STATE.currentIndex];
  allBtns.forEach((btn, i) => {
    if (qData.opts[i].correct) btn.classList.add('correct');
  });

  // ── Colorier le bouton sélectionné
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    STATE.score++;
    toast.textContent = '✅ Bonne réponse ! +1 point';
    toast.className   = 'feedback-toast correct visible';
  } else {
    selectedBtn.classList.add('wrong');
    
    // 💬 Configuration du lien WhatsApp pour la contestation en direct
    const monNumero = "2290146258392"; 
    const texteMessage = encodeURIComponent(`Salut Raoul ! Je joue à ton quiz G2 là, et je ne suis pas trop d'accord (ou j'ai un doute) sur cette question : "${qData.q}". Tu m'expliques pourquoi ? 😜`);
    const lienWhatsApp = `https://wa.me/${monNumero}?text=${texteMessage}`;

    // Injection du message et du bouton interactif WhatsApp dans le toast rouge
    toast.innerHTML = `
      ❌ Raté… La bonne réponse est en vert.<br>
      <a href="${lienWhatsApp}" target="_blank" style="color: #f59e0b; font-size: 13px; text-decoration: underline; margin-top: 5px; display: inline-block; font-weight: bold;">
        🤔 Pas d'accord ou curieux ? Clique ici pour voir avec Raoul
      </a>
    `;
    toast.className   = 'feedback-toast wrong visible';
  }

  // ⚡ CRÉATION DYNAMIQUE DE LA ZONE D'ACTIONS (Évite de toucher au HTML !)
  const actionsContainer = document.createElement('div');
  actionsContainer.id = 'quiz-actions-container';
  actionsContainer.style = 'display: flex; flex-direction: column; gap: 12px; margin-top: 25px;';

  // 1️⃣ Bouton "Question suivante"
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-primary';
  nextBtn.textContent = 'Question suivante ➡️';
  nextBtn.style = 'width: 100%; padding: 14px; font-weight: bold; font-size: 16px; cursor: pointer;';
  
  nextBtn.addEventListener('click', () => {
    STATE.currentIndex++;
    
    // 🛑 PAUSE PALIER : Arrivé à la 10e question
    if (STATE.currentIndex === 10) {
      const veutContinuer = confirm("Bravo ! Tu as complété le premier palier de 10 questions. 🎉\n\nVeux-tu t'arrêter ici et voir ton verdict, ou es-tu prêt à continuer pour les questions bonus de la promo G2 ? 🔥\n\n[Clique sur OK pour continuer / Annuler pour voir ton score]");
      
      if (!veutContinuer) {
        actionsContainer.remove();
        showVerdict();
        return;
      }
    }

    // Suite du jeu s'il reste des questions
    if (STATE.currentIndex < STATE.preparedQs.length) {
      renderQuestion();
    } else {
      actionsContainer.remove();
      showVerdict();
    }
  });

  // 2️⃣ Bouton "Abandonner & voir le verdict"
  const abortBtn = document.createElement('button');
  abortBtn.textContent = '🏳️ Abandonner & voir mon verdict';
  abortBtn.style = 'width: 100%; padding: 12px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;';
  
  abortBtn.addEventListener('click', () => {
    if (confirm("Fatigué ? Pas de souci ! Tu peux t'arrêter ici pour voir ton score actuel ainsi que mon portfolio. On y va ?")) {
      actionsContainer.remove();
      showVerdict();
    }
  });

  // On assemble les boutons dans le conteneur et on l'ajoute juste en dessous de la grille
  actionsContainer.appendChild(nextBtn);
  actionsContainer.appendChild(abortBtn);
  grid.parentNode.appendChild(actionsContainer);
}

/* ════════════════════════════════════════════════════════
   6. VERDICT — Calcul du résultat final
════════════════════════════════════════════════════════ */

/**
 * Paliers de verdict dynamiques basés sur le pourcentage de bonnes réponses.
 * S'adapte automatiquement, que le jeu s'arrête à 10 ou à 50 questions !
 */
const VERDICTS = [
  {
    // 90% de bonnes réponses ou plus (ex: 9/10 ou 45/50)
    minPct: 90,
    label: '🏆 Génie de la G2',
    badgeStyle: 'background:rgba(245,158,11,.15);border:1px solid var(--gold);color:var(--gold);',
    message: name => `Incroyable ${name} ! Tu domines les Sciences de Gestion. La G2 est fière de toi 🔥`,
    confetti: true
  },
  {
    // 70% de bonnes réponses ou plus (ex: 7/10 ou 35/50)
    minPct: 70,
    label: '⭐ Excellent !',
    badgeStyle: 'background:rgba(124,58,237,.15);border:1px solid var(--accent2);color:var(--accent2);',
    message: name => `Très belle performance ${name} ! Tu maîtrises bien les fondamentaux de la gestion. Bravo 👏`,
    confetti: true
  },
  {
    // 50% de bonnes réponses ou plus (ex: 5/10 ou 25/50)
    minPct: 50,
    label: '👍 Bien joué',
    badgeStyle: 'background:rgba(16,185,129,.12);border:1px solid var(--green);color:var(--green);',
    message: name => `Pas mal ${name} ! Tu as la moyenne — encore un peu de révision et tu seras au top 💪`,
    confetti: false
  },
  {
    // Moins de 50%
    minPct: 0,
    label: '📚 Continue d\'apprendre',
    badgeStyle: 'background:rgba(107,107,138,.15);border:1px solid var(--muted);color:var(--muted);',
    message: name => `${name}, chaque erreur est une leçon. Rejoue et remonte le score — tu peux le faire ! 🎯`,
    confetti: false
  }
];

/** Affiche l'écran de verdict avec le score final et la carte développeur */
function showVerdict() {
  // On récupère l'index de la question où le joueur s'est arrêté comme total
  const totalJoué = STATE.currentIndex > 0 ? STATE.currentIndex : 1;
  const score     = STATE.score;
  const playerName = STATE.playerName;

  // ⚡ FONCTION DE PARTAGE WHATSAPP INTÉGRÉE
  function shareOnWhatsApp(finalScore, totalQuestions) {
    // URL de ton portfolio ou site
    const lienMonSite = "https://raouldehonou.netlify.app/"; 
    
    // Un texte fun qui pousse explicitement l'étudiant à choisir le groupe de la promo !
    const texteA_Partager = `📢 [À PARTAGER DANS LE GROUPE G2 !] 📢\n\nLes gars, je viens de tester le Quiz de la promo G2 créé par Raoul. 🎉\n\nMon verdict : ${finalScore}/${totalQuestions} ! 🔥\n\nFranchement, allez tester pour voir si vous maîtrisez la Compta, le Droit et le SYSCOHADA ou si vous allez valider par la foi ! 😂👇\n${lienMonSite}`;
    
    // Version encodée pour l'URL
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(texteA_Partager)}`;
    
    // Ouverture automatique
    window.open(urlWhatsApp, '_blank');
  }

  // Sécurité pour l'affichage de l'écran (gère 'screen-result' ou 'screen-verdict' selon ton HTML)
  if (document.getElementById('screen-result')) {
    showScreen('screen-result');
  } else if (document.getElementById('screen-verdict')) {
    showScreen('screen-verdict');
  }

  // Calcul du pourcentage exact de réussite sur les questions jouées
  const pct = Math.round((score / totalJoué) * 100);

  // ── Anneau de score (conic-gradient via CSS custom property)
  const ring = document.getElementById('score-ring');
  if (ring) {
    ring.style.setProperty('--ring-pct', `${pct}%`);
  }
  
  const finalScoreNum = document.getElementById('final-score-num');
  if (finalScoreNum) {
    finalScoreNum.textContent = `${score}/${totalJoué}`;
  }

  // ── Sélectionner le verdict approprié en fonction du pourcentage
  let verdict = VERDICTS.find(v => pct >= v.minPct);
  if (!verdict) verdict = VERDICTS[VERDICTS.length - 1]; // Sécurité ultime

  const badgeEl = document.getElementById('verdict-badge');
  const msgEl   = document.getElementById('verdict-msg');
  
  if (badgeEl) {
    badgeEl.textContent  = verdict.label;
    badgeEl.style.cssText = verdict.badgeStyle;
  }
  if (msgEl) {
    msgEl.textContent     = verdict.message(playerName);
  }

  // Lancement des confettis si disponibles
  if (verdict.confetti && typeof launchConfetti === 'function') {
    launchConfetti();
  } else if (verdict.confetti && typeof confetti === 'function') {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }

  // ── Bouton WhatsApp : brancher notre fonction intégrée avec le score réel capturé
  const waBtn = document.getElementById('wa-btn');
  if (waBtn) {
    waBtn.onclick = () => shareOnWhatsApp(score, totalJoué);
  }
}


/* ════════════════════════════════════════════════════════
   7. WHATSAPP — Passerelle de partage
════════════════════════════════════════════════════════ */
/**
 * Fabrique un texte personnalisé adapté au mode mystère et ouvre l'API WhatsApp.
 *
 * @param {number} score  Score obtenu
 * @param {number} total  Nombre total de questions
 */
function shareOnWhatsApp(score, total) {
  const name  = STATE.playerName;
  const emoji = score >= 12 ? '🏆' : score >= 8 ? '⭐' : score >= 5 ? '👍' : '📚';

  const text = [
    `${emoji} Défi Souvenirs & Gestion — Terminale G2`,
    ``,
    `*${name}* a accepté le défi sans savoir ce qui l'attendait... 🤫`,
    `Résultat des courses : *${score} bonnes réponses* au compteur ! 🔥`,
    ``,
    `Tu penses pouvoir faire mieux et débloquer la surprise ? Découvre ton score ici 👇`,
    DATA.portfolioURL,
    ``,
    `— Développé par Raoul DEHONOU`
  ].join('\n');

  // encodeURIComponent garantit un lien valide même avec accents et sauts de ligne
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ════════════════════════════════════════════════════════
   8. UTILS — Helpers divers
════════════════════════════════════════════════════════ */

/** Génère les particules flottantes en arrière-plan */
function buildParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `--dur: ${6 + Math.random() * 8}s`,
      `--delay: ${Math.random() * 8}s`,
      `--dx: ${(Math.random() - 0.5) * 100}px`
    ].join(';');
    container.appendChild(p);
  }
}

/** Lance une pluie de confettis colorés */
function launchConfetti() {
  const COLORS = ['#7c3aed','#a855f7','#f59e0b','#10b981','#f0f0f8','#ef4444','#3b82f6'];
  const TOTAL  = 90;

  for (let i = 0; i < TOTAL; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';

    const size = 6 + Math.random() * 7;
    el.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `background: ${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
      `width: ${size}px`,
      `height: ${size}px`,
      `border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}`,
      `--dur: ${1.4 + Math.random() * 2}s`,
      `--delay: ${Math.random() * 1.2}s`,
      `--dx: ${(Math.random() - 0.5) * 220}px`
    ].join(';');

    document.body.appendChild(el);
    // Nettoyage automatique après la fin de l'animation
    setTimeout(() => el.remove(), 4000);
  }
}

/** Réinitialise le quiz et revient à l'écran d'accueil */
function restartQuiz() {
  document.getElementById('name-select').value = '';
  const startBtn = document.getElementById('start-btn');
  startBtn.disabled = true;
  startBtn.setAttribute('aria-disabled', 'true');
  showScreen('screen-welcome');
}


/* ════════════════════════════════════════════════════════
   9. INIT — Point d'entrée unique (DOM ready)
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Référencer tous les écrans
  SCREENS['screen-welcome'] = document.getElementById('screen-welcome');
  SCREENS['screen-quiz']    = document.getElementById('screen-quiz');
  SCREENS['screen-result']  = document.getElementById('screen-result');

  // ── Construire les particules de fond
  buildParticles();

  // ── Initialiser la liste des joueurs dans le <select>
  buildPlayerSelect();

  // ── Bouton "Rejouer" sur l'écran verdict
  document.getElementById('retry-btn').addEventListener('click', restartQuiz);

  // ── Bouton Portfolio
  document.getElementById('portfolio-btn').addEventListener('click', () => {
    window.open(DATA.portfolioURL, '_blank', 'noopener,noreferrer');
  });

  console.info('%c🎓 Quiz G2 initialisé avec succès', 'color:#a855f7;font-weight:bold;');
});
