// Canvas-рендер геометрии меток. Различие user/algo: заливка плашки и цвет (DESIGN 2.3); тип - форма и подпись.
import type { ChartTokens } from '../theme/chartTokens';
import { CHAR_W, PILL_H, STATE_GLYPH_W, type Dash, type MarkGeometry, type Part } from './layout';

const DASH: Record<Dash, number[]> = { solid: [], dashed: [6, 4], dotted: [2, 3] };

export interface RenderStyle {
  tokens: ChartTokens;
  selected: boolean;
  /** Превью создаваемой метки: полупрозрачно. */
  ghost: boolean;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Глифы состояний (DESIGN §2.3): различаются формой, не цветом. */
function drawStateGlyph(ctx: CanvasRenderingContext2D, state: 'match' | 'missed' | 'extra', cx: number, cy: number, color: string) {
  const r = 5;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (state === 'extra') {
    ctx.rect(cx - r, cy - r, r * 2, r * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 2.5, cy - 2.5);
    ctx.lineTo(cx + 2.5, cy + 2.5);
    ctx.moveTo(cx + 2.5, cy - 2.5);
    ctx.lineTo(cx - 2.5, cy + 2.5);
    ctx.stroke();
  } else {
    if (state === 'missed') ctx.setLineDash([2, 2]);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    if (state === 'missed') {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy);
      ctx.lineTo(cx + 2.5, cy);
      ctx.moveTo(cx, cy - 2.5);
      ctx.lineTo(cx, cy + 2.5);
      ctx.stroke();
    }
    if (state === 'match') {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy);
      ctx.lineTo(cx - 0.7, cy + 2);
      ctx.lineTo(cx + 2.7, cy - 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPart(ctx: CanvasRenderingContext2D, p: Part, color: string, on: string, fill: string, algo: boolean, t: ChartTokens) {
  switch (p.t) {
    case 'seg': {
      const lw = ctx.lineWidth;
      if (p.w !== undefined) ctx.lineWidth = p.w;
      ctx.setLineDash(DASH[p.dash]);
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = lw;
      break;
    }
    case 'rect': {
      const w = p.x2 - p.x1;
      const h = p.y2 - p.y1;
      ctx.fillStyle = fill;
      ctx.fillRect(p.x1, p.y1, w, h);
      if (p.hatch) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x1, p.y1, w, h);
        ctx.clip();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        for (let x = p.x1 - h; x < p.x2; x += 7) {
          ctx.moveTo(x, p.y2);
          ctx.lineTo(x + h, p.y1);
        }
        ctx.stroke();
        ctx.restore();
      }
      if (!p.noStroke) {
        ctx.setLineDash(DASH[p.dash]);
        ctx.strokeRect(p.x1, p.y1, w, h);
        ctx.setLineDash([]);
      }
      break;
    }
    case 'glyph': {
      ctx.fillStyle = color;
      ctx.beginPath();
      const s = 6;
      if (p.g === 'tri-down') {
        ctx.moveTo(p.x - s, p.y - s * 0.8);
        ctx.lineTo(p.x + s, p.y - s * 0.8);
        ctx.lineTo(p.x, p.y + s * 0.8);
      } else if (p.g === 'tri-up') {
        ctx.moveTo(p.x - s, p.y + s * 0.8);
        ctx.lineTo(p.x + s, p.y + s * 0.8);
        ctx.lineTo(p.x, p.y - s * 0.8);
      } else if (p.g === 'arrow-up') {
        ctx.moveTo(p.x - s, p.y + 2);
        ctx.lineTo(p.x + s, p.y + 2);
        ctx.lineTo(p.x, p.y - s - 2);
      } else if (p.g === 'arrow-down') {
        ctx.moveTo(p.x - s, p.y - 2);
        ctx.lineTo(p.x + s, p.y - 2);
        ctx.lineTo(p.x, p.y + s + 2);
      } else if (p.g === 'diamond') {
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s, p.y);
      } else if (p.g === 'cross') {
        // крест из двух штрихов: контуром, без заливки
        ctx.save();
        ctx.setLineDash([]);
        ctx.lineWidth = 2.5;
        ctx.moveTo(p.x - s * 0.8, p.y - s * 0.8);
        ctx.lineTo(p.x + s * 0.8, p.y + s * 0.8);
        ctx.moveTo(p.x + s * 0.8, p.y - s * 0.8);
        ctx.lineTo(p.x - s * 0.8, p.y + s * 0.8);
        ctx.stroke();
        ctx.restore();
        break;
      } else {
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      }
      ctx.closePath();
      if (algo && p.g !== 'dot') {
        ctx.fillStyle = t.bg;
        ctx.fill();
        ctx.stroke();
      } else ctx.fill();
      break;
    }
    case 'text': {
      ctx.font = `600 11px ${t.fontSans}`;
      const gw = p.state ? STATE_GLYPH_W : 0;
      const w = Math.max(ctx.measureText(p.text).width, p.text.length * CHAR_W * 0.6) + 12 + gw;
      const x = p.x - w / 2;
      const y = p.y - PILL_H / 2;
      roundRect(ctx, x, y, w, PILL_H, 4);
      // плашка на фоне surface: читается поверх свечей в обеих темах; user - контур цвета метки, algo - толще
      ctx.fillStyle = t.bg;
      ctx.fill();
      ctx.setLineDash([]);
      ctx.lineWidth = algo ? 1.5 : 1;
      ctx.stroke();
      ctx.fillStyle = algo ? on : t.text1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x + gw / 2, p.y + 0.5);
      if (p.state) drawStateGlyph(ctx, p.state, x + 6 + 5, p.y, algo ? on : t.text1);
      break;
    }
  }
}

export function drawGeometry(ctx: CanvasRenderingContext2D, g: MarkGeometry, s: RenderStyle): void {
  const t = s.tokens;
  const algo = g.mark.author === 'algo';
  const color = algo ? t.markAlgo : t.markUser;
  const on = algo ? t.markAlgoOn : t.markUserOn;
  const fill = algo ? t.zoneFillAlgo : t.zoneFillUser;
  ctx.save();
  ctx.globalAlpha = s.ghost ? 0.6 : 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = s.selected ? 2.5 : 1.5;
  ctx.lineJoin = 'round';
  for (const p of g.parts) drawPart(ctx, p, color, on, fill, algo, t);
  ctx.restore();
  if (s.selected) {
    ctx.save();
    ctx.lineWidth = 2;
    for (const h of g.handles) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = t.bg;
      ctx.strokeStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(h.x, h.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  }
}
