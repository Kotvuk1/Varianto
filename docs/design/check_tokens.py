#!/usr/bin/env python3
"""Проверка токенов: контраст WCAG и различимость при дальтонизме.
Читает tokens.css (hex-значения тем dark/light), печатает таблицы, код выхода 1 при нарушении.
Запуск: python3 docs/design/check_tokens.py
Симуляция: Machado et al. 2009, severity 1.0. Расстояние: CIE76 ΔE в Lab.
"""
import re, sys, itertools
from pathlib import Path

css = Path(__file__).with_name("tokens.css").read_text()

def block(selector):
    m = re.search(re.escape(selector) + r"\s*\{(.*?)\n\}", css, re.S)
    return dict(re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{6})", m.group(1)))

dark = block(":root")
light = {**dark, **block('[data-theme="light"]')}

def lin(rgb):
    return [((c/255)/12.92 if c/255 <= 0.04045 else (((c/255)+0.055)/1.055)**2.4) for c in rgb]
def rgb(h): return [int(h[i:i+2], 16) for i in (1, 3, 5)]
def lum(h):
    r, g, b = lin(rgb(h)); return 0.2126*r + 0.7152*g + 0.0722*b
def cr(a, b):
    x, y = sorted((lum(a), lum(b)), reverse=True); return (x+0.05)/(y+0.05)

M = {
 "prot": [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
 "deut": [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
 "trit": [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
}
def sim(h, k):
    l = lin(rgb(h))
    if k is None: return l
    return [min(1, max(0, sum(M[k][i][j]*l[j] for j in range(3)))) for i in range(3)]
def lab(l):
    X = [sum(m*c for m, c in zip(row, l)) for row in
         ([.4124,.3576,.1805],[.2126,.7152,.0722],[.0193,.1192,.9505])]
    X = [X[0]/.95047, X[1], X[2]/1.08883]
    f = [t**(1/3) if t > .008856 else 7.787*t+16/116 for t in X]
    return (116*f[1]-16, 500*(f[0]-f[1]), 200*(f[1]-f[2]))
def de(a, b, k=None):
    return sum((p-q)**2 for p, q in zip(lab(sim(a, k)), lab(sim(b, k))))**0.5

fail = 0
def need(ok, msg):
    global fail
    if not ok: fail += 1; print("FAIL:", msg)

for name, t in (("dark", dark), ("light", light)):
    print(f"== {name}")
    for s in ("--bg", "--surface-1", "--surface-2"):
        row = {k: cr(t[k], t[s]) for k in ("--text-1", "--text-2", "--text-3", "--mark-algo", "--border-strong")}
        print(s, {k: round(v, 2) for k, v in row.items()})
        for k in ("--text-1", "--text-2", "--text-3"): need(row[k] >= 4.5, f"{name} {k} on {s} {row[k]:.2f} < 4.5")
        need(row["--mark-algo"] >= 4.5 or s == "--surface-2" and row["--mark-algo"] >= 3, f"{name} mark-algo on {s}")
        need(row["--border-strong"] >= 3 or s == "--bg" and name == "light", f"{name} border-strong on {s} {row['--border-strong']:.2f} < 3")
    chart_bg = t["--bg"] if name == "dark" else t["--surface-1"]
    for k in ("--candle-bull", "--candle-bear"):
        need(cr(t[k], chart_bg) >= 3, f"{name} {k} on chart bg < 3")
    lr = cr(t["--candle-bull"], t["--candle-bear"])
    print(f"bull/bear luminance ratio {lr:.2f}"); need(lr >= 1.5, "bull/bear luminance ratio < 1.5")
    need(cr(t["--on-accent"], t["--accent"]) >= 4.5, "on-accent")
    keys = {"bull": "--candle-bull", "bear": "--candle-bear", "user": "--mark-user", "algo": "--mark-algo"}
    for a, b in itertools.combinations(keys, 2):
        d = [de(t[keys[a]], t[keys[b]], k) for k in (None, "prot", "deut", "trit")]
        print(f"{a}-{b}: norm {d[0]:.0f} prot {d[1]:.0f} deut {d[2]:.0f} trit {d[3]:.0f}")
        need(d[0] >= 40 and min(d) >= 15, f"{name} {a}-{b} dE {min(d):.0f}")
print("OK" if not fail else f"{fail} нарушений")
sys.exit(1 if fail else 0)
