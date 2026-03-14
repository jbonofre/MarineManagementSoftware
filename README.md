# moussAIllon

**Plateforme de gestion de chantier naval augmentee par l'IA.**

MoussAIllon centralise l'ensemble des metiers d'un chantier naval dans une seule application : gestion commerciale, parc nautique, stock, planification des interventions, relation client et integration de fournisseurs.

## Fonctionnalites principales

- **Gestion clients** - fiches, bateaux, moteurs, remorques, historique
- **Catalogue & parc** - bateaux, moteurs, helices, remorques, produits (neuf et occasion)
- **Ventes & facturation** - forfaits, comptoir, transactions, paiement en ligne (Stripe, PayPlug)
- **Fournisseurs** - referentiel multi-types (bateaux, moteurs, helices, produits, remorques)
- **Equipe & planning** - gestion des techniciens, planification des interventions
- **Petites annonces** - publication et gestion d'annonces
- **Espace client** - portail self-service (bateaux, factures, profil, annonces)
- **Espace technicien** - planning mobile des interventions
- **IA integree** - chat assisté (OpenAI / Anthropic), serveur MCP pour l'exploration de l'API
- **Notifications email** - alertes incidents, mots de passe, planning

## Architecture

```
moussAIllon/
├── backend/          Java 21, Quarkus 3.32, Hibernate/Panache, H2
├── chantier-ui/      React 18, TypeScript, Ant Design 6 — gestion du chantier
├── client-ui/        React 18, TypeScript, Ant Design 5 — portail client
└── technicien-ui/    React 18, TypeScript, Ant Design 5 — espace technicien
```

Les frontends communiquent avec le backend via proxy sur `http://localhost:8080`.

## Prerequis

- JDK 21
- Node.js 20+
- Maven 3.9+

## Demarrage rapide

### Backend

```bash
cd backend
mvn quarkus:dev
```

Le backend demarre sur `http://localhost:8080`.

### Frontends

```bash
# Chantier UI (port 3000)
cd chantier-ui && npm install && npm start

# Client UI (port 3000)
cd client-ui && npm install && npm start

# Technicien UI (port 3002)
cd technicien-ui && npm install && npm start
```

## Configuration

### Variables d'environnement

| Variable | Description | Defaut |
|---|---|---|
| `AI_OPENAI_API_KEY` | Cle API OpenAI | _(requis pour le chat IA)_ |
| `AI_ANTHROPIC_API_KEY` | Cle API Anthropic | _(requis pour le chat IA)_ |
| `AI_OPENAI_MODEL` | Modele OpenAI | `gpt-4o-mini` |
| `AI_ANTHROPIC_MODEL` | Modele Anthropic | `claude-haiku-4-5-20251001` |
| `STRIPE_API_KEY` | Cle API Stripe | _(requis pour paiements Stripe)_ |
| `PAYPLUG_API_KEY` | Cle API PayPlug | _(requis pour paiements PayPlug)_ |
| `MAILER_FROM` | Expediteur email | `noreply@moussaillon.local` |
| `MAILER_HOST` | Serveur SMTP | `localhost` |
| `MAILER_PORT` | Port SMTP | `1025` |
| `MAILER_MOCK` | Mode mock (pas d'envoi reel) | `true` |

### Base de donnees

Par defaut, H2 avec stockage fichier (`./data/moussaillon`). Le schema est mis a jour automatiquement au demarrage (`hibernate.schema-management.strategy=update`).

## Tests

### Backend

Tests d'integration avec Quarkus JUnit 5 et REST Assured (base H2 en memoire).

```bash
mvn -B verify -pl backend
```

Tests disponibles : `ClientResourceTest`, `UserResourceTest`, `BateauCatalogueResourceTest`.

### Frontend

Tests avec Jest et React Testing Library.

```bash
# Depuis le repertoire du frontend concerne
CI=true npm test -- --watchAll=false
```

## Integration continue

GitHub Actions (`.github/workflows/ci.yml`) — declenchement sur push et PR vers `main`.

4 jobs en parallele :

| Job | Contenu |
|---|---|
| **Backend Tests** | Build Maven + tests d'integration (JDK 21) |
| **Chantier UI Tests** | `npm ci` + tests Jest + build |
| **Client UI Tests** | `npm ci` + tests Jest + build |
| **Technicien UI Tests** | `npm ci` + tests Jest + build |

## Serveur MCP (IA)

Le backend expose un endpoint MCP JSON-RPC 2.0 sur `POST /mcp`.

### Outils exposes

| Outil | Description |
|---|---|
| `moussaillon_list_api_resources` | Liste les ressources API disponibles |
| `moussaillon_call_api_resource` | Appelle une ressource API (`GET`, `POST`, `PUT`, `DELETE`) |

### Exemples d'utilisation

**Initialisation :**

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Lister les outils :**

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

**Lister les ressources API :**

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"moussaillon_list_api_resources","arguments":{}}}'
```

**Appeler une ressource (GET avec query) :**

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"moussaillon_call_api_resource","arguments":{"method":"GET","path":"/clients/search","query":{"q":"dupont"}}}}'
```

**Appeler une ressource (POST avec body) :**

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"moussaillon_call_api_resource","arguments":{"method":"POST","path":"/clients","body":{"prenom":"Jean","nom":"Dupont","type":"PARTICULIER","email":"jean.dupont@example.com"}}}}'
```

## Chat IA

Le backend expose `POST /ai/chat`. Le frontend (`chantier-ui`) permet de choisir le provider :

- **ChatGPT** (`provider: "openai"`)
- **Claude** (`provider: "anthropic"`)

Les commandes API explicites (`GET /...`, `POST /...`) passent par MCP.

> Les cles API doivent rester cote backend uniquement — ne jamais les exposer dans le frontend.

## License

Apache 2.0 — voir [LICENSE](LICENSE) pour plus de details.

## Copyright

moussAIllon — Copyright 2025-2026 NOSE Experts
