#!/usr/bin/env bash
# Bump cache-busting version on css/js links, commit and push to GitHub Pages.
cd "$(dirname "$0")/.." || exit 1
python - <<'PY'
import re, time
v=str(int(time.time()))
for f in ['index.html','share.html']:
    s=open(f,encoding='utf-8').read()
    s=re.sub(r'(src|href)="(css/[^"?]+|js/[^"?]+)(\?v=\d+)?"', lambda m: f'{m.group(1)}="{m.group(2)}?v={v}"', s)
    open(f,'w',encoding='utf-8').write(s)
PY
git add -A && git commit -q -m "${1:-update}" && git push -q && echo "deployed"
