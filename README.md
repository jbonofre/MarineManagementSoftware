# moussAIllon

Bienvenue moussAIllon !

MoussAIllon est un logiciel de gestion de chantier naval.

Il permet:
* une gestion des clients
* une gestion de parc (neuf et occasion)
* une gestion de stock de pièces et accessoires
* une gestion d'équipe et d'intervention, ainsi qu'une planification des tâches
* une intégration de systèmes tiers (annonceurs, fournisseurs, etc)

Pilotez l'ensemble des métiers d'un chantier naval via une seule application, en simplifiant et optimisant les opérations.

# Architecture

Le projet est composé de 4 modules:

| Module | Technologie | Description |
|---|---|---|
| `backend` | Java 21, Quarkus 3.32, Hibernate/Panache, H2 | API REST, persistance, intégrations IA et paiement |
| `chantier-ui` | React 18, TypeScript, Ant Design 6 | Interface de gestion du chantier naval |
| `client-ui` | React 18, TypeScript, Ant Design 5 | Espace client (portail) |
| `technicien-ui` | React 18, TypeScript, Ant Design 5 | Espace technicien (planning, interventions) |

Les frontends communiquent avec le backend via proxy sur `http://localhost:8080`.

# Developpement

## Prerequis

- JDK 21
- Node.js 20+
- Maven 3.9+

## Lancer le backend

```bash
cd backend
mvn quarkus:dev
```

Le backend demarre sur `http://localhost:8080`.

## Lancer les frontends

```bash
# Chantier UI (port 3000)
cd chantier-ui && npm install && npm start

# Client UI (port 3000)
cd client-ui && npm install && npm start

# Technicien UI (port 3002)
cd technicien-ui && npm install && npm start
```

# Tests

## Backend

Les tests d'integration backend utilisent Quarkus JUnit 5 et REST Assured. Ils testent les endpoints REST avec une base H2 en memoire.

```bash
# Lancer les tests backend
mvn -B verify -pl backend
```

Tests disponibles:
- `ClientResourceTest` - CRUD clients, recherche, suppression
- `UserResourceTest` - authentification, changement de mot de passe, CRUD utilisateurs
- `BateauCatalogueResourceTest` - CRUD catalogue bateaux, recherche

## Frontend

Les tests frontend utilisent Jest (via react-scripts) et React Testing Library.

```bash
# Lancer les tests d'un frontend (depuis son repertoire)
cd chantier-ui && npm test

# Lancer les tests en mode CI (sans watch)
CI=true npm test -- --watchAll=false
```

Tests disponibles:
- `chantier-ui/src/app.test.tsx` - rendu conditionnel login/workspace
- `client-ui/src/app.test.tsx` - rendu conditionnel login/dashboard
- `technicien-ui/src/app.test.tsx` - rendu conditionnel login/planning

# Integration continue (CI)

Le projet utilise GitHub Actions (`.github/workflows/ci.yml`). La CI se declenche sur chaque push et pull request vers `main`.

Elle execute 4 jobs en parallele:

| Job | Description |
|---|---|
| **Backend Tests** | Build Maven + tests d'integration Quarkus (JDK 21) |
| **Chantier UI Tests** | `npm ci` + tests Jest + build React |
| **Client UI Tests** | `npm ci` + tests Jest + build React |
| **Technicien UI Tests** | `npm ci` + tests Jest + build React |

Les caches Maven et npm sont actives pour accelerer les builds.

# MCP Server (AI)

Le backend expose un endpoint MCP JSON-RPC sur `POST /mcp`.

Base URL locale:

`http://localhost:8080/mcp`

## Prerequis

- Lancer le backend Quarkus (JDK 21).
- Envoyer les requetes MCP en JSON-RPC 2.0 sur l'endpoint `POST /mcp`.

## Exemple 1: initialize

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'
```

## Exemple 2: tools/list

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

## Exemple 3: tools/call -> moussaillon_list_api_resources

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "moussaillon_list_api_resources",
      "arguments": {}
    }
  }'
```

## Exemple 4: tools/call -> moussaillon_call_api_resource (GET avec query)

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "moussaillon_call_api_resource",
      "arguments": {
        "method": "GET",
        "path": "/clients/search",
        "query": {
          "q": "dupont"
        }
      }
    }
  }'
```

## Exemple 5: tools/call -> moussaillon_call_api_resource (POST avec body)

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "moussaillon_call_api_resource",
      "arguments": {
        "method": "POST",
        "path": "/clients",
        "body": {
          "prenom": "Jean",
          "nom": "Dupont",
          "type": "PARTICULIER",
          "email": "jean.dupont@example.com"
        }
      }
    }
  }'
```

## Outils MCP exposes

- `moussaillon_list_api_resources`: liste les racines d'API autorisees depuis `net.nanthrax.moussaillon.services`.
- `moussaillon_call_api_resource`: appelle une ressource API existante (methodes supportees: `GET`, `POST`, `PUT`, `DELETE`) avec filtrage par whitelist de chemins.

## IA Chat (ChatGPT / Claude)

Le backend expose `POST /ai/chat` et le frontend `home.tsx` permet de choisir le provider:

- `ChatGPT (OpenAI)` (`provider: "openai"`)
- `Claude (Anthropic)` (`provider: "anthropic"`)

Configuration backend (variables d'environnement recommandees):

```bash
export AI_OPENAI_API_KEY="sk-..."
export AI_ANTHROPIC_API_KEY="sk-ant-..."
export AI_OPENAI_MODEL="gpt-4o-mini"
export AI_ANTHROPIC_MODEL="claude-3-5-haiku-latest"
```

Notes:

- Gardez les cles API uniquement cote backend (jamais dans le frontend).
- Les commandes API explicites (`GET /...`, `POST /...`) continuent de passer par MCP.

# License

Apache 2.0 - See LICENSE for more information.

# Copyright

moussAIllon
Copyright 2025-2026 NOSE Experts
