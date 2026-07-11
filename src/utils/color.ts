function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const bigint = parseInt(full, 16)
  const r = ((bigint >> 16) & 255) / 255
  const g = ((bigint >> 8) & 255) / 255
  const b = (bigint & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = (((h % 360) + 360) % 360) / 360
  const ss = Math.min(100, Math.max(0, s)) / 100
  const ll = Math.min(100, Math.max(0, l)) / 100
  if (ss === 0) {
    const v = ll * 255
    return rgbToHex(v, v, v)
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
  const p = 2 * ll - q
  const hue2rgb = (t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  return rgbToHex(hue2rgb(hh + 1 / 3) * 255, hue2rgb(hh) * 255, hue2rgb(hh - 1 / 3) * 255)
}

import type { CSSProperties } from 'react'
import type { Brand } from '@/types'

export interface DerivedPalette {
  escuro: string
  pale: string
  texto: string
  accento: string
}

/** Deriva um tema completo (escuro/pale/texto/accento) a partir de uma única cor principal escolhida pelo admin. */
export function derivePalette(hex: string): DerivedPalette {
  const [h, s, l] = hexToHsl(hex)
  const clamp = (n: number) => Math.min(100, Math.max(0, n))
  return {
    escuro: hslToHex(h, clamp(s + 5), clamp(l - 18)),
    pale: hslToHex(h, clamp(s * 0.35), 94),
    texto: hslToHex(h, clamp(s + 5), clamp(l - 22)),
    accento: hslToHex(h, clamp(s + 8), clamp(l + 14)),
  }
}

/** Estilo inline para o badge de marca quando ela não tem `badgeClass` fixa (marcas criadas pelo admin). */
export function brandBadgeStyle(brand: Brand): CSSProperties | undefined {
  if (brand.badgeClass) return undefined
  const { pale, texto } = derivePalette(brand.cor)
  return { background: pale, color: texto }
}

/** Estilo inline para um badge a partir de uma cor só (ex.: prioridade/status configurados em
 * Listas Suspensas) — fundo claro derivado da cor, texto na cor cheia. */
export function badgeStyleFromColor(cor: string): CSSProperties {
  return { background: derivePalette(cor).pale, color: cor }
}
