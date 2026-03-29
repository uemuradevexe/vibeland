import type { RoomId } from './roomConfig'

export const NPC_PHRASES: Record<RoomId, string[]> = {
  plaza: [
    'Olá! Meu contexto está fresco hoje! 🧠',
    'Alguém sabe onde fica o café? ☕',
    'Tokenzando tranquilo por aqui...',
    'Meus pesos estão ótimos hoje ✨',
    'Boa tarde, humano! 👋',
    'Temperatura 0.7 — perfeito!',
  ],
  cafe: [
    'Este café tem 4096 tokens de aroma ☕',
    'Lendo o contexto... muito interessante!',
    'Claude novo deve sair logo 👀',
    'Temperatura 0.0 no café, por favor',
    'RLHF me deixou assim de bom humor!',
  ],
  beach: [
    'Os tokens estão quentes hoje! 🌊',
    'Surfando na onda do RLHF 🏄',
    'Janela de contexto infinita seria legal...',
    'Que embeddings finos nessa areia!',
    'RAG & relax 😎',
  ],
  library: [
    'Este livro tem 2M de tokens!',
    'Estudando RAG para a prova 📖',
    'Shhh... processando...',
    'Encontrei um bug nos pesos! 🐛',
    'Knowledge cutoff: agora mesmo.',
  ],
  arcade: [
    'High score é meu contexto máximo! 🕹️',
    'Level up! Mais um commit hoje 🎮',
    'Esse jogo roda em 4096 FPS tokens',
    'Game over... reiniciando pesos 🔄',
    'Modo hardcore: temperatura 0.0 😤',
  ],
  garden: [
    'As flores têm embeddings lindos 🌸',
    'Plantando seeds no modelo 🌱',
    'Jardim de gradientes em flor ✨',
    'Natureza + tokens = perfeição 🌿',
    'Treino ao ar livre é o melhor! 🌞',
  ],
  rooftop: [
    'A vista daqui é de 100B parâmetros! 🏙️',
    'Neon lights e gradient descent ✨',
    'O skyline parece um tensor reshape 🌃',
    'Vento forte... atenção redistribuída! 💨',
    'Rooftop debugging é outro nível 🔭',
  ],
  dungeon: [
    'Esses gradientes estão sombrios... 🕯️',
    'Encontrei um tesouro de dados! 💰',
    'Cuidado com o overfitting das masmorras 🦇',
    'Tochas iluminando os hidden layers 🔥',
    'Dungeon crawling com backpropagation 💀',
  ],
  space: [
    'Houston, temos um NaN! 🚀',
    'Treinando no vácuo do espaço sideral 🌌',
    'O reator funciona com attention heads ⚛️',
    'Zero gravity, zero loss! 🛸',
    'Embeddings estelares detectados 🌟',
  ],
}

export function getRandomPhrase(roomId: RoomId): string {
  const phrases = NPC_PHRASES[roomId]
  return phrases[Math.floor(Math.random() * phrases.length)]
}
