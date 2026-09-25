import re
import os
src=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
html=open(src+'index.html',encoding='utf-8').read()
css=open(src+'css/styles.css',encoding='utf-8').read()
js=open(src+'js/main.js',encoding='utf-8').read()
init=open(src+'js/theme-init.js',encoding='utf-8').read()

def ncr(s): return ''.join(c if ord(c)<128 else '&#%d;'%ord(c) for c in s)
def jsesc(s): return ''.join(c if ord(c)<128 else ('\\u%04x'%ord(c) if ord(c)<0x10000 else c) for c in s)
# CSS: quitar comentarios y cualquier caracter no ASCII
css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
css=''.join(c if ord(c)<128 else '\\%x '%ord(c) for c in css)
js=jsesc(js); init=jsesc(re.sub(r'/\*.*?\*/','',init,flags=re.S))

body=html[html.index('<body>')+6:html.index('<script src="js/main.js"')]
# atributos booleanos -> forma XML
for a in ['required','novalidate','disabled','crossorigin','defer','checked','open']:
    body=re.sub(r'(?<=\s)%s(?=[\s>/])'%a, '%s="%s"'%(a,a), body)
body=re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+);)','&amp;',body)
# seccion de entradas de Blogger antes del FAQ
blog_section='''
    <!-- ============ BLOG (entradas de Blogger) ============ -->
    <section class="section" id="blog">
      <div class="container">
        <header class="section-head reveal">
          <p class="kicker">// blog</p>
          <h2>Publicaciones y alertas forenses</h2>
          <p>Noticias, guias y alertas de ciberseguridad publicadas desde Blogger.</p>
        </header>
        <b:section class="blog-posts-area" id="main" maxwidgets="1" showaddelement="no">
          <b:widget id="Blog1" locked="true" title="Entradas del blog" type="Blog" version="2" visible="true"/>
        </b:section>
      </div>
    </section>
'''
body=body.replace('    <!-- ============ FAQ ============ -->', blog_section+'\n    <!-- ============ FAQ ============ -->')
body=ncr(body)

blog_css='''
.blog-posts-area .post-outer, .blog-posts-area .post { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-4); }
.blog-posts-area .post-title, .blog-posts-area h3.post-title { font-size: var(--text-lg); margin-bottom: var(--space-3); }
.blog-posts-area .post-title a:hover { color: var(--accent); }
.blog-posts-area .post-body, .blog-posts-area .snippet-item { color: var(--text-muted); font-size: var(--text-sm); }
.blog-posts-area img { border-radius: var(--radius-md); height: auto; }
.blog-posts-area a { color: var(--accent); }
.blog-pager { display: flex; justify-content: space-between; margin-top: var(--space-6); font-family: var(--font-mono); font-size: var(--text-sm); }
#navbar, .navbar, #Navbar1 { display: none !important; }
body .widget { margin: 0; }
'''

xml=f'''<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:version="2" class="v2" data-theme="dark" lang="es" expr:dir="data:blog.languageDirection" xmlns="http://www.w3.org/1999/xhtml" xmlns:b="http://www.google.com/2005/gml/b" xmlns:data="http://www.google.com/2005/gml/data" xmlns:expr="http://www.google.com/2005/gml/expr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#07090d" />
  <meta name="color-scheme" content="dark light" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="description" content="Laboratorio de informatica forense: peritaje digital, respuesta a incidentes, analisis de malware y hacking etico con cadena de custodia." />
  <title><data:blog.pageTitle/></title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&amp;display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;display=swap" />
  <script>//<![CDATA[
{init}
//]]></script>
  <b:skin><![CDATA[
/* VESTIGIO - Plantilla Blogger - Informatica Forense */
{css}
{blog_css}
]]></b:skin>
</head>
<body>
{body}
<script>//<![CDATA[
{js}
//]]></script>
</body>
</html>
'''
assert ']]>' not in css+js+init
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'vestigio-blogger.xml'),'w',encoding='ascii').write(xml)
print('ok', len(xml))
