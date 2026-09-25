# Metodología del proyecto

Este documento describe **cómo se construyó el sitio** (método de desarrollo) y **qué método forense comunica** a sus clientes (método de servicio). Ambos comparten el mismo principio: todo debe ser verificable.

---

## 1. Método de desarrollo

Se siguió un proceso iterativo corto en seis etapas:

```
Descubrimiento → Dirección de arte → Construcción → Seguridad → QA visual → Despliegue
```

### 1.1 Descubrimiento
- **Objetivo:** transmitir confianza técnica y seriedad legal a abogados, empresas y particulares.
- **Tensión de diseño:** "hacker" (lo técnico, la terminal) contra "perito" (lo jurídico, lo sobrio). La solución fue una base sobria y corporativa con acentos de terminal usados con moderación.

### 1.2 Dirección de arte
| Pilar | Decisión | Razón |
|---|---|---|
| Color | Negro tinta `#07090d` + verde fósforo `#33e39b` (oscuro) / verde bosque `#067a50` (claro) | Evoca la terminal sin caer en el "verde Matrix" saturado; el verde del tema claro cumple el contraste WCAG AA |
| Tipografía | Satoshi (texto) + JetBrains Mono (datos, etiquetas, terminal) | La sans aporta lo profesional; la mono se reserva para datos técnicos |
| Espaciado | Generoso, rejilla de 48 px de fondo | Sensación de laboratorio ordenado |
| Movimiento | Terminal que escribe, efecto glitch breve, revelado al hacer scroll | Solo movimientos con significado; se desactivan con `prefers-reduced-motion` |
| Imagen | Iconografía SVG propia y logo vectorial | Sin fotos de archivo, que restan credibilidad en ciberseguridad |

### 1.3 Construcción
- **HTML semántico:** `header`, `nav`, `main`, `section`, `article`, `dl` para estadísticas, `details/summary` para la FAQ.
- **CSS con tokens:** variables para color, tipografía fluida (`clamp()`), espaciado y radios. Los temas se cambian con el atributo `data-theme` en `<html>`.
- **Mobile-first y responsive:** puntos de corte en 1080, 900 y 560 px; la línea de tiempo pasa de horizontal a vertical y el menú a pantalla completa.
- **Mejora progresiva:** sin JavaScript el contenido sigue visible; las animaciones son una capa adicional.
- **JavaScript sin dependencias:** vanilla ES5+ dentro de una IIFE con `'use strict'`, sin frameworks ni CDNs de scripts.

### 1.4 Seguridad por diseño
| Capa | Medida |
|---|---|
| Documento | CSP en `<meta>`: solo scripts propios, sin `eval`, sin `object`, `base-uri 'self'` |
| Servidor | `_headers`, `vercel.json`, `.htaccess`: CSP con `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy`, `COOP` |
| DOM | La terminal se construye con `textContent` y `createElement`, nunca con `innerHTML` |
| Formulario | Validación por campo, saneamiento (etiquetas, caracteres de control), honeypot, tiempo mínimo de 3 s, límite de 1 envío por minuto |
| Enlaces | Los enlaces externos reciben `rel="noopener noreferrer"` automáticamente |
| Privacidad | El verificador SHA-256 funciona 100 % en el navegador con Web Crypto API |
| Divulgación | `/.well-known/security.txt` para reportes de vulnerabilidades (RFC 9116) |

> La validación del cliente es una primera barrera. Al conectar un backend se debe repetir la validación en el servidor y añadir token CSRF y rate limiting real.

### 1.5 QA visual
- Capturas automatizadas con Playwright a 1366 px (escritorio) y 390 px (móvil), en ambos temas.
- Verificación de ausencia de errores en consola y de desbordamiento horizontal.
- Error detectado y corregido: el `backdrop-filter` del header creaba un bloque contenedor que encerraba el menú móvil; se movió a un pseudo-elemento `::before`.

### 1.6 Despliegue y versión Blogger
- El sitio estático se despliega sin paso de build.
- `blogger/build.py` genera la plantilla XML desde los mismos archivos:
  - CSS dentro de `<b:skin><![CDATA[ ... ]]></b:skin>` sin comentarios ni caracteres no ASCII
  - JS dentro de `//<![CDATA[ ... //]]>` con caracteres especiales escapados como `\uXXXX`
  - HTML con tildes convertidas a referencias numéricas (`&#225;`) y atributos booleanos en forma XML (`required="required"`)
  - Sección `b:section` con el widget `Blog1` para las entradas
  - Validación final con un parser XML para evitar el error "la plantilla no es XML válido"

---

## 2. Método forense comunicado en el sitio

El sitio presenta un proceso en cinco fases basado en estándares reconocidos:

| Fase | Acciones | Referencia |
|---|---|---|
| 01 · Identificación | Delimitar alcance, dispositivos y fuentes de evidencia | ISO/IEC 27037 |
| 02 · Adquisición | Clonado con bloqueador de escritura, hash SHA-256 de original y copia | ISO/IEC 27037, RFC 3227 (orden de volatilidad) |
| 03 · Preservación | Almacenamiento cifrado, embalaje sellado, registro de accesos | Cadena de custodia |
| 04 · Análisis | Trabajo sobre copias, herramientas validadas, resultados reproducibles | NIST SP 800-86 |
| 05 · Informe y defensa | Dictamen comprensible, anexos con hashes, ratificación en audiencia | Práctica pericial |

Para el pentesting y el hacking ético se toma como referencia OWASP (Top 10 y guía de pruebas) y siempre se exige autorización escrita y un alcance firmado.

---

## 3. Herramientas
- Editor: Visual Studio Code
- Control de versiones: Git + GitHub
- QA: Playwright (Chromium headless)
- Generación de la plantilla Blogger: Python 3
- Hosting objetivo: GitHub Pages, Netlify, Vercel, Apache o Blogger
