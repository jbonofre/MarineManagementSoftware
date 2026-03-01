# moussAIllon

Bienvenue moussAIllon !

MoussAIllon est un logiciel de gestion de chantier naval.

Il permet:
* une gestion des clients
* une gestion de parc (neuf et occasion)
* une gestion de stock de pièces et accessoires
* une gestion d'équipe et d'intervention, ainsi qu'une planification des tâches
* une intégration de systèmes tiers (annonceurs, fournisseurs, etc)

Pilotez l'ensemble des métiers d'un chantier naval via une seule applications, en simplifiant et optimisant les opérations.

# Developpement

## MCP Server (AI)

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