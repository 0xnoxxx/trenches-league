import re,sys
v6=open('v6.html',encoding='utf-8').read()
css=v6[v6.index('<style>')+7:v6.index('</style>')]
def R(old,new):
    global css
    if css.count(old)!=1: print('FAIL',repr(old[:80])); sys.exit(1)
    css=css.replace(old,new)
R('--f-stencil:"Saira Stencil One","Saira Condensed",Impact,sans-serif;','--f-stencil:"Saira Stencil One","Russo One","Saira Condensed",Impact,sans-serif;')
R('--f-ui:"Saira Condensed","Arial Narrow",sans-serif;','--f-ui:"Saira Condensed","Fira Sans Condensed","Arial Narrow",sans-serif;')
extra='''
.langsel{background:#121309;color:var(--khaki);border:1px solid #0c0d08;padding:6px 8px;font:700 13px var(--f-ui);text-transform:uppercase;letter-spacing:.03em}
.search{background:rgba(0,0,0,.35);border:1px solid #0c0d08;padding:12px 14px;color:var(--khaki);font:600 18px var(--f-ui);max-width:420px;width:100%}
.search:focus{outline:none;border-color:var(--brass)}
.lgtabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.hucum > span{display:block}
@media (max-width:720px){.langsel{padding:4px;font-size:11px;max-width:86px}}
'''
idx=css.index('@media (prefers-reduced-motion: reduce)')
css=css[:idx]+extra+css[idx:]
shell=open('_shell.html',encoding='utf-8').read().replace('/*CSS*/',css)
open('trenches-league.html','w',encoding='utf-8').write(shell)
print('built',len(shell))
