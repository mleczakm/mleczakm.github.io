#!/usr/bin/env python3
"""Optional social-card authoring helper. Requires Pillow and macOS system fonts."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
FONTS=Path('/System/Library/Fonts/Supplemental')

def font(name,size): return ImageFont.truetype(str(FONTS/name),size)
for lang in ('pl','en'):
    im=Image.new('RGB',(1200,630),'#f6f7f2');d=ImageDraw.Draw(im)
    ink='#202920';green='#276347'
    d.text((70,42),'m.',font=font('Georgia Bold.ttf',68),fill=green)
    d.text((165,65),'Michał Mleczko',font=font('Arial Bold.ttf',25),fill=ink)
    d.text((165,99),'SOFTWARE ARCHITECT · AI ENGINEER',font=font('Arial.ttf',13),fill=green)
    d.line((70,149,1130,149),fill='#dcdfd4',width=2)
    d.text((70,205),'Mniej rutyny.' if lang=='pl' else 'Less busywork.',font=font('Arial.ttf',77),fill=ink)
    d.text((70,298),'Więcej możliwości.' if lang=='pl' else 'More possibility.',font=font('Georgia Italic.ttf',75),fill=green)
    d.text((74,422),'AI w firmie  /  Automatyzacja  /  Szybkie strony' if lang=='pl' else 'Business AI  /  Automation  /  Fast websites',font=font('Arial.ttf',24),fill='#636d62')
    d.rounded_rectangle((865,188,1128,452),radius=32,fill='#e8eddc')
    d.ellipse((890,213,1103,426),outline='#b6c8a2',width=2)
    d.rounded_rectangle((936,259,1058,381),radius=26,fill=green)
    d.text((947,263),'m.',font=font('Georgia Bold.ttf',79),fill='#e1efc1')
    d.line((70,517,1130,517),fill='#dcdfd4',width=2)
    d.text((74,551),'mleczakm.github.io'+('/en/' if lang=='en' else ''),font=font('Arial.ttf',22),fill=green)
    d.text((895,554),'IDEA → WORKING SYSTEM',font=font('Arial.ttf',14),fill='#636d62')
    im.save(ROOT/f'assets/social-{lang}.png',optimize=True)
    print('Saved',f'assets/social-{lang}.png')
