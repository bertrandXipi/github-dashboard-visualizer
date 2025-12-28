# GitHub Activity Tracker

Un tableau de bord personnel pour visualiser et suivre ton activité GitHub. Toutes les données restent locales dans ton navigateur.

## Fonctionnalités

- 📊 **Dashboard** - Vue d'ensemble de ton activité quotidienne et hebdomadaire
- 📁 **Projets** - Liste de tous tes repositories avec filtres et statistiques
- 🔍 **Recherche** - Recherche dans tes commits, projets et fichiers
- 📝 **Rapports** - Génération de rapports hebdomadaires/mensuels en Markdown
- 🌙 **Thème sombre** - Support du mode clair/sombre
- 📱 **Responsive** - Fonctionne sur desktop, tablette et mobile
- 🔒 **Privé** - Toutes les données restent dans ton navigateur (LocalStorage)

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd github-dashboard-visualizer

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Configuration

### Token GitHub

Pour accéder à tes données GitHub, tu auras besoin d'un Personal Access Token :

1. Va sur [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clique sur "Generate new token (classic)"
3. Donne un nom au token (ex: "Activity Tracker")
4. Sélectionne les scopes : `repo` (pour les repos privés) ou `public_repo` (repos publics uniquement)
5. Génère et copie le token

Le token est chiffré avec AES-GCM avant d'être stocké dans le navigateur.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **UI** : shadcn/ui + Tailwind CSS
- **State** : Zustand
- **Charts** : Recharts
- **Tests** : Vitest

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linting
npm run test     # Tests
```

## Structure du projet

```
src/
├── app/           # Pages Next.js (App Router)
├── components/    # Composants React
│   ├── charts/    # Graphiques (heatmap, bar chart)
│   ├── dashboard/ # Composants du dashboard
│   ├── layout/    # Layout (sidebar, header)
│   ├── projects/  # Composants projets
│   └── ui/        # Composants shadcn/ui
├── hooks/         # Custom hooks
├── lib/           # Utilitaires
│   ├── github/    # API GitHub
│   ├── storage/   # Cache LocalStorage
│   ├── stores/    # Stores Zustand
│   └── utils/     # Fonctions utilitaires
└── types/         # Types TypeScript
```

## Licence

MIT
