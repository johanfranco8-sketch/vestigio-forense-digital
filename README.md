# VESTIGIO · Informática Forense Digital

Sitio web profesional para un laboratorio de **informática forense, respuesta a incidentes y hacking ético**. Diseño premium con estética de terminal, tema claro/oscuro, diseño responsivo y medidas de seguridad aplicadas desde el código y el servidor.

Incluye dos versiones del mismo diseño:

| Versión | Ubicación | Uso |
|---|---|---|
| Sitio estático (HTML + CSS + JS) | raíz del repositorio | GitHub Pages, Netlify, Vercel, Apache |
| Plantilla Blogger (XML válido, sin caracteres especiales) | `blogger/vestigio-blogger.xml` | Blogger → Tema → Restaurar |

## Características

- Hero con terminal animada que simula una adquisición forense con verificación de hash
- 8 servicios: forense de computadores, móviles, DFIR, peritaje judicial, malware, pentesting, OSINT y recuperación de datos
- Metodología en 5 fases alineada con ISO/IEC 27037
- **Verificador SHA-256 local** (Web Crypto API): el archivo nunca sale del equipo del usuario
- Casos anonimizados, FAQ accesible con `<details>`, formulario con validación
- Tema claro/oscuro con detección de preferencia del sistema
- Mobile-first, `prefers-reduced-motion`, navegación por teclado y enlace "saltar al contenido"

## Estructura

```
├── index.html              Página principal
├── css/styles.css          Estilos y tokens de diseño (temas dark/light)
├── js/theme-init.js        Aplica el tema antes del primer render
├── js/main.js              Interfaz, verificador hash, validación del formulario
├── favicon.svg             Logo vectorial
├── _headers                Cabeceras de seguridad (Netlify / Cloudflare Pages)
├── vercel.json             Cabeceras de seguridad (Vercel)
├── .htaccess               Cabeceras + HTTPS forzado (Apache)
├── robots.txt
├── .well-known/security.txt
├── blogger/
│   ├── vestigio-blogger.xml   Plantilla lista para Blogger
│   └── build.py               Genera el XML a partir del sitio estático
└── docs/
    ├── METODOLOGIA.md         Método de trabajo usado en el proyecto
    └── ENFOQUE-COMERCIAL.md   Modelo de negocio, público y estrategia
```

## Despliegue rápido

**GitHub Pages:** Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`.
> En cuentas gratuitas GitHub Pages requiere que el repositorio sea público.

**Netlify / Vercel:** importar el repositorio; no requiere build. Las cabeceras de `_headers` o `vercel.json` se aplican automáticamente.

**Blogger:** Tema → flecha junto a *Personalizar* → *Restaurar* → subir `blogger/vestigio-blogger.xml`.
Si modificas el sitio, regenera la plantilla con:

```bash
python3 blogger/build.py
```

## Antes de publicar

- Reemplazar teléfono, correo, huella PGP, estadísticas y casos por datos reales
- Conectar el formulario a un endpoint HTTPS (Formspree, Netlify Forms o backend propio) y añadir su dominio a `connect-src` y `form-action` del CSP
- Actualizar `Expires` y `Contact` en `.well-known/security.txt`

## Documentación

- [Metodología del proyecto](docs/METODOLOGIA.md)
- [Enfoque comercial](docs/ENFOQUE-COMERCIAL.md)

## Licencia

Código bajo licencia MIT. Textos, marca y logotipo "VESTIGIO" de uso ilustrativo.
