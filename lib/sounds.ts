// Procedural sounds via Web Audio API — no audio files needed
// All playback is user-triggered, so autoplay policy is never an issue.

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function toggleMute(): boolean {
  muted = !muted
  return muted
}

export function isMuted(): boolean {
  return muted
}

// Short "tick" when clicking to move
export function playMove() {
  if (muted) return
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain); gain.connect(c.destination)
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(300, c.currentTime)
  gain.gain.setValueAtTime(0.06, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07)
  osc.start(); osc.stop(c.currentTime + 0.07)
}

// Rising tone when sending a chat message
export function playChat() {
  if (muted) return
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain); gain.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(660, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1320, c.currentTime + 0.15)
  gain.gain.setValueAtTime(0.12, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
  osc.start(); osc.stop(c.currentTime + 0.3)
}

// Two-note chime when using an emote
export function playEmote() {
  if (muted) return
  const c = getCtx()
  const notes = [523, 784]  // C5, G5
  notes.forEach((freq, i) => {
    const t = c.currentTime + i * 0.12
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc.start(t); osc.stop(t + 0.25)
  })
}

// Filtered noise swoosh when changing rooms
export function playRoomChange() {
  if (muted) return
  const c = getCtx()
  const bufLen = Math.floor(c.sampleRate * 0.4)
  const buf = c.createBuffer(1, bufLen, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(600, c.currentTime)
  filter.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.4)
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.25, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4)
  src.connect(filter); filter.connect(gain); gain.connect(c.destination)
  src.start()
}

// Ascending arpeggio for token reward
export function playTokenReward() {
  if (muted) return
  const c = getCtx()
  const notes = [523, 659, 784, 1047]  // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = c.currentTime + i * 0.08
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.start(t); osc.stop(t + 0.2)
  })
}
