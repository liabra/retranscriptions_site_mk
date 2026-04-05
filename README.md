# A2C Retranscriptions — Site + Espace prestataire

Site vitrine public + espace de dépôt sécurisé pour les prestataires (retranscripteurs / correcteurs).

## Stack

| Couche     | Technologie            |
|------------|------------------------|
| Frontend   | React + TypeScript + Vite |
| Routing    | React Router v6        |
| Auth       | JWT via backend A2C    |
| Deploy     | Railway                |

## Pages

| Route                         | Description                            |
|-------------------------------|----------------------------------------|
| `/`                           | Site vitrine (tarifs, méthode, contact)|
| `/espace-prestataire/login`   | Connexion prestataire                  |
| `/espace-prestataire`         | Dashboard missions + dépôt de fichiers |

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Remplir VITE_API_URL avec l'URL du backend retranscriptions_mk
npm run dev
```

## Déploiement Railway

1. Connecter ce repo à Railway
2. Ajouter la variable d'environnement : `VITE_API_URL=https://votre-backend.up.railway.app/api/v1`
3. Railway build et déploie automatiquement

## Lien avec le backend

Ce site consomme l'API du repo `liabra/retranscriptions_mk` (FastAPI).  
Les prestataires se connectent avec les mêmes identifiants que le dashboard admin.

Pour activer l'upload de fichiers côté backend, voir :  
`a2c_espace_prestataire/INTEGRATION.md` dans ce repo.
