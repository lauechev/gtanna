const WORDS = [
  'Aliada',
  'del',
  'sol',
  '·',
  'Hija',
  'de',
  'la',
  'luna',
  '·',
  'Niña',
  'de',
  'la',
  'selva',
  '·',
  'Corazón',
  'del',
  'mar',
  '·',
]

interface WordParticle {
  angle: number
  radius: number
  speed: number
  word: string
  brightness: number
  flickerSpeed: number
}

export function initSpiralAnimation(canvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const SIZE = Math.min(window.innerWidth * 0.85, 700)
  canvas.width = SIZE * dpr
  canvas.height = SIZE * dpr
  canvas.style.width = `${SIZE}px`
  canvas.style.height = `${SIZE}px`
  ctx.scale(dpr, dpr)

  const centerX = SIZE / 2
  const centerY = SIZE / 2
  const maxRadius = SIZE * 0.44
  const minRadius = SIZE * 0.08

  const NUM_ARMS = 2
  const WORDS_PER_ARM = 40
  const particles: WordParticle[] = []
  let wordIdx = 0

  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const armOffset = (arm / NUM_ARMS) * Math.PI * 2

    for (let i = 0; i < WORDS_PER_ARM; i++) {
      const t = i / WORDS_PER_ARM
      const baseAngle = t * Math.PI * 3.5 + armOffset
      const scatter = (Math.random() - 0.5) * 0.5
      const radiusScatter = (Math.random() - 0.5) * 12

      const radius = minRadius + t * (maxRadius - minRadius) + radiusScatter
      const angle = baseAngle + scatter

      particles.push({
        angle,
        radius,
        speed: 0.0003 + Math.random() * 0.0004,
        word: WORDS[wordIdx % WORDS.length],
        brightness: 0.3 + Math.random() * 0.7,
        flickerSpeed: 0.15 + Math.random() * 0.5,
      })
      wordIdx++
    }
  }

  // Scattered background words
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = minRadius + Math.random() * (maxRadius - minRadius)
    particles.push({
      angle,
      radius,
      speed: 0.0001 + Math.random() * 0.0002,
      word: WORDS[wordIdx % WORDS.length],
      brightness: 0.15 + Math.random() * 0.35,
      flickerSpeed: 0.1 + Math.random() * 0.4,
    })
    wordIdx++
  }

  function draw(timestamp: number) {
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)

    for (const p of particles) {
      p.angle += p.speed
      const flicker = 0.5 + 0.5 * Math.sin(timestamp * 0.001 * p.flickerSpeed + p.angle * 3)
      const alpha = p.brightness * flicker

      const x = centerX + p.radius * Math.cos(p.angle)
      const y = centerY + p.radius * Math.sin(p.angle) * 0.85

      if (x < -10 || x > SIZE + 10 || y < -10 || y > SIZE + 10) continue

      const t = p.radius / maxRadius
      const r = Math.round(180 + 75 * (1 - t))
      const g = Math.round(200 + 55 * (1 - t))
      const b = Math.round(220 + 35 * (1 - t))

      const fontSize = 14 + (1 - t) * 6
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.font = `italic ${fontSize}px 'IM Fell DW Pica', serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.word, x, y)
    }

    requestAnimationFrame(draw)
  }

  document.fonts.ready.then(() => {
    requestAnimationFrame(draw)
  })
}
