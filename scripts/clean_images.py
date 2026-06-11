from PIL import Image
import os

root = os.path.dirname(__file__)
public = os.path.join(root, '..', 'public')
files = ['player1.png', 'player.png', 'player3.png']

def clean_image(path):
    im = Image.open(path).convert('RGBA')
    pix = im.load()
    w, h = im.size
    removed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            bright = (r + g + b) / 3
            if (a < 60 and bright < 100) or (a < 120 and bright < 60) or (a < 200 and bright < 35):
                pix[x, y] = (r, g, b, 0)
                removed += 1
    im.save(path)
    return removed, im

for name in files:
    path = os.path.join(public, name)
    removed, im = clean_image(path)
    alphas = [p[3] for p in im.getdata()]
    print(name, 'removed', removed, 'transparent', sum(1 for a in alphas if a == 0), 'semi', sum(1 for a in alphas if 0 < a < 255), 'opaque', sum(1 for a in alphas if a == 255))
