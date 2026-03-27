# Claudeland — Design Spec

## Vision
Club Penguin-inspired 2.5D browser game where each player is a Claude spirit orb. Players walk between themed rooms, chat, react with emotes, and customizam sua orbe. NPCs simulados (bots) populam as salas com falas aleatórias.

## Visual Style
- 2.5D: câmera ortográfica lateral fixa, objetos em camadas de profundidade Z
- Personagens: orbes flutuantes com glow (v1 — emissive + bloom post-processing)
- Paleta: azul marinho escuro (#1a2744) + laranja Claude (#ea580c) + cores variadas pra NPCs
- Fundo: céu sólido, edifícios/elementos em silhueta, chão plano

## Salas
| ID | Nome | Conexões |
|----|------|----------|
| plaza | Praça Central | ← Café / Praia → |
| cafe | Café do Contexto | ← Biblioteca / Plaza → |
| beach | Praia dos Tokens | ← Plaza |
| library | Biblioteca | Plaza → |

Navegação: **Biblioteca ← Café ← Praça → Praia**

## Personagem (Claude Orb)
- Esfera 3D com material emissive (glow via Bloom)
- Dois pontinhos como olhos
- Partículas menores flutuando ao redor
- Animação de flutuação (sine wave em Y)
- Sombra elíptica no chão

## Interações do Jogador
1. **Andar**: click no chão → raycast → move para posição X
2. **Chat**: input no HUD → balão aparece por 4s acima da orbe
3. **Emotes**: 6 reações (❤️ ✨ 😂 🤔 👋 🎉) que flutuam e somem
4. **Cor**: color picker com 8 cores pré-definidas
5. **Nome**: escolhido na tela de entrada

## NPCs
- Bots com cores fixas por sala, andam aleatoriamente
- A cada 5-10s falam uma frase temática da sala
- 2-3 NPCs por sala

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- @react-three/fiber + @react-three/drei + @react-three/postprocessing
- zustand (estado global)
- 100% frontend — sem backend
