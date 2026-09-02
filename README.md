# 🌿 TodoList — Application Locale Épurée

Une application web locale simple, intuitive et paisible pour gérer vos tâches quotidiennes en toute sérénité.

## 🚀 Fonctionnalités

- **Gestion des tâches** : Ajout rapide, édition, cocher/décocher, suppression.
- **Organisation & Priorités** : Pastilles de priorités (*Basse*, *Moyenne*, *Haute*) avec teintes apaisantes.
- **Dates d'échéance** : Visualisation claire et rappel visuel des retards.
- **Filtres & Tri** : Filtrez (*Toutes*, *En cours*, *Terminées*, par *Priorité*) et triez selon vos préférences.
- **Stockage local JSON** : Vos données sont conservées localement dans `data/tasks.json`, facilement éditables et sauvegardables.
- **Design épuré** : Interface moderne d'inspiration nordique/zen avec animations fluides.

---

## 🛠️ Lancement Rapide

### 1. Prérequis
- Python 3.9 ou supérieur

### 2. Installation des dépendances

Ouvrez un terminal dans le dossier `TodoList` et exécutez :

```bash
pip install -r requirements.txt
```

*(Optionnel mais recommandé : créez d'abord un environnement virtuel)*
```bash
python -m venv venv
# Sur Windows :
venv\Scripts\activate
# Sur macOS/Linux :
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Démarrage de l'application

Lancez le serveur FastAPI local avec Uvicorn :

```bash
python -m uvicorn backend.main:app --reload
```

### 4. Accès à l'application

Ouvrez votre navigateur web à l'adresse suivante :

👉 **[http://localhost:8000](http://localhost:8000)**

*(La documentation interactive de l'API REST est également disponible sur [http://localhost:8000/docs](http://localhost:8000/docs))*

---

## 📁 Structure du Projet

```text
TodoList/
├── backend/
│   ├── __init__.py
│   ├── main.py          # Serveur FastAPI et routes REST
│   ├── models.py        # Modèles Pydantic de validation
│   └── storage.py       # Gestion de la persistance JSON
├── frontend/
│   ├── index.html       # Interface HTML5 sémantique
│   ├── css/
│   │   └── style.css    # Design paisible & réactif
│   └── js/
│       └── app.js       # Logique JS (Fetch API)
├── data/
│   └── tasks.json       # Stockage local automatique
├── requirements.txt     # Dépendances Python
└── README.md            # Ce guide
```
"# TodoList" 
