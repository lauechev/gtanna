const poem = `Todos adentro tenemos una gitana. Una maga sabía que conoce el camino. Solo hay que acordarnos de que existe y volver a ella. Solo hay que volver a oírla Y recordar. Gitana de manada. Manada de lobos Gitana salvaje. Intuitiva y poderosa. Gitana de recuerdos ancestrales. canal de conexión con el más allá. Aliada del sol. Hija de la luna. Niña de la selva. Corazón del mar. Tan humana como todos los dolores Y todas las angustias. Tan poderosa como todas las curas Y todos los remedios. Maestra de la nada Y curiosa hasta el límite borroso que ya deja de existir. La hacen ella su coraje, su valentía, su gracia. Alquimista de los sentires. Cuidadora de la Fuente. Creadora. Creativa. Pelo suelto color atardecer Y en sus ojos noche yace su voz Porque ella no habla tanto. Canta más. Canta aquí y allá Y en todas partes. Baila para ella y toca el tambor. Sus manos saben de música Y su voz lleva el timón. Los caballos son sus aliados Medicina mutua llevan donde van. Entregan la magia de la eternidad. La gitana no anda sola. Va en comunidad. Círculos de ascendencia y familia escogida. Q la sostienen y la llenan de vida. Gitana de gestos y canciones De consejos y razónes. Gitana de amuletos y tesoros. De pies descalzos y empantanados. Para ella no existe tiempo ni camino Camina a su propio ritmo. Con paciencia recorre los pasos q le va dictando su brujula: EL CORAZÓN.`

const allWords = poem.split(/\s+/)

interface StreamWord {
  baseArc: number
  globalIdx: number
  dx: number
  dy: number
}

export function initSpiralAnimation2(canvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const SIZE = Math.min(window.innerWidth * 0.9, 700)
  canvas.width = SIZE * dpr
  canvas.height = SIZE * dpr
  canvas.style.width = `${SIZE}px`
  canvas.style.height = `${SIZE}px`
  ctx.scale(dpr, dpr)

  const centerX = SIZE / 2
  const centerY = SIZE / 2
  const maxRadius = SIZE * 0.44
  const b = 7.5
  const wordSpacing = 55
  const scrollSpeed = 0.2

  // Dense lookup table: arc-length -> (r, theta)
  const lut: { r: number; theta: number; arc: number }[] = []
  {
    let th = 0.3
    let arc = 0
    const dth = 0.005
    while (true) {
      const r = b * th
      if (r > maxRadius + 20) break
      lut.push({ r, theta: th, arc })
      const ds = Math.sqrt(r * r + b * b) * dth
      arc += ds
      th += dth
    }
  }

  const totalArc = lut[lut.length - 1].arc

  function arcToPoint(arcLen: number) {
    if (arcLen <= 0) return { r: lut[0].r, theta: lut[0].theta }
    if (arcLen >= totalArc) return { r: lut[lut.length - 1].r, theta: lut[lut.length - 1].theta }

    let lo = 0
    let hi = lut.length - 1
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      if (lut[mid].arc <= arcLen) lo = mid
      else hi = mid
    }

    const a = lut[lo]
    const bPt = lut[hi]
    const frac = (arcLen - a.arc) / (bPt.arc - a.arc || 1)
    return {
      r: a.r + (bPt.r - a.r) * frac,
      theta: a.theta + (bPt.theta - a.theta) * frac,
    }
  }

  const spawnArc = totalArc * 0.95
  let scrollOffset = 0
  let angleOffset = 0

  // Stream of words
  const stream: StreamWord[] = []
  let globalCounter = 0

  // Fill initial spiral
  let arc = wordSpacing
  while (arc <= spawnArc) {
    stream.push({ baseArc: arc, globalIdx: globalCounter, dx: 0, dy: 0 })
    globalCounter++
    arc += wordSpacing
  }

  // Mouse tracking
  let mouseX = -1000
  let mouseY = -1000
  let mouseOver = false
  const repulsionRadius = 150
  const repulsionStrength = 600
  const maxDisplace = 40
  const easeBack = 0.92

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) * (SIZE / rect.width)
    mouseY = (e.clientY - rect.top) * (SIZE / rect.height)
  })
  canvas.addEventListener('mouseenter', () => { mouseOver = true })
  canvas.addEventListener('mouseleave', () => { mouseOver = false })

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)

    scrollOffset += scrollSpeed
    angleOffset += 0.0004

    // Spawn new words at outer edge
    while (true) {
      const lastBase = stream[stream.length - 1].baseArc
      const nextBase = lastBase + wordSpacing
      if (nextBase - scrollOffset <= spawnArc) {
        stream.push({ baseArc: nextBase, globalIdx: globalCounter, dx: 0, dy: 0 })
        globalCounter++
      } else {
        break
      }
    }

    // Remove words that have scrolled past center
    while (stream.length > 0 && stream[0].baseArc - scrollOffset <= 0) {
      stream.shift()
    }

    ctx.font = `italic 19px 'IM Fell DW Pica', serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const sw of stream) {
      const actualArc = sw.baseArc - scrollOffset
      if (actualArc <= 0 || actualArc > spawnArc + 250) continue

      const pt = arcToPoint(actualArc)
      if (pt.r > maxRadius) continue

      const th = pt.theta + angleOffset
      const word = allWords[sw.globalIdx % allWords.length]

      // Opacity based on position in spiral: low at edges, capped at 0.35
      const position = actualArc / spawnArc
      let alpha: number
      if (position < 0.12) {
        alpha = (position / 0.12) * 0.35
      } else if (position > 0.4) {
        alpha = Math.max(0.02, 1 - (position - 0.4) / 0.6)
        alpha = alpha * alpha * 0.35
      } else {
        alpha = 0.35
      }

      if (alpha <= 0.01) continue

      const baseX = centerX + pt.r * Math.cos(th)
      const baseY = centerY + pt.r * Math.sin(th)

      // Mouse repulsion
      if (mouseOver) {
        const dxMouse = baseX + sw.dx - mouseX
        const dyMouse = baseY + sw.dy - mouseY
        const dist = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
        if (dist < repulsionRadius && dist > 1) {
          const force = repulsionStrength / (dist * dist)
          sw.dx += (dxMouse / dist) * force
          sw.dy += (dyMouse / dist) * force
        }
      }

      // Ease displacement back toward 0
      sw.dx *= easeBack
      sw.dy *= easeBack

      // Clamp displacement
      const dMag = Math.sqrt(sw.dx * sw.dx + sw.dy * sw.dy)
      if (dMag > maxDisplace) {
        sw.dx = (sw.dx / dMag) * maxDisplace
        sw.dy = (sw.dy / dMag) * maxDisplace
      }

      const x = baseX + sw.dx
      const y = baseY + sw.dy

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(th + Math.PI / 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.fillText(word, 0, 0)
      ctx.restore()
    }

    requestAnimationFrame(draw)
  }

  document.fonts.ready.then(() => {
    requestAnimationFrame(draw)
  })
}
