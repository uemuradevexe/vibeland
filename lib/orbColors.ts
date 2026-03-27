export const ORB_COLORS = [
  { name: 'Laranja Claude', value: '#ea580c' },
  { name: 'Roxo', value: '#7c3aed' },
  { name: 'Verde', value: '#059669' },
  { name: 'Azul', value: '#0ea5e9' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Ciano', value: '#06b6d4' },
] as const

export type OrbColor = typeof ORB_COLORS[number]['value']
