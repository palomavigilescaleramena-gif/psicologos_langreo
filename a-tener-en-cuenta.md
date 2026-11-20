# A tener en cuenta antes de publicar la web en psicologoslangreo.es

Escrito el 20/11/2026.

La web nueva se publicará en `https://www.psicologoslangreo.es/`, el dominio de la web antigua. Todavía no se sabe en qué alojamiento: Vercel, un hosting con cPanel u otro. Hasta saberlo no se puede preparar lo de abajo, porque cada alojamiento lo pide de una forma distinta.

## Cuando sepas dónde se va a publicar

Abre Claude Code en la carpeta `agente-webs` y escribe:

> Voy a publicar la web de Psicólogos Langreo en **[nombre del alojamiento]**. Lee `proyectos/web_psicologos_langreo_2026-10-22/a-tener-en-cuenta.md` y prepárame todo lo que pone para ese alojamiento.

La IA te preparará los archivos. Tú solo tendrás que subirlos y hacer las comprobaciones del final.

## Lo que hay que hacer

### 0. Quitar el bloqueo para Google (imprescindible)

Desde el 20/11/2026, todas las páginas llevan esta línea para que Google no indexe la web mientras está en el dominio provisional:

```html
<meta name="robots" content="noindex, nofollow"> <!-- QUITAR al publicar en psicologoslangreo.es ... -->
```

**El día que la web pase a `psicologoslangreo.es` hay que borrarla de las 14 páginas.** Si se queda puesta, Google sacará la web de sus resultados y la consulta dejará de aparecer en las búsquedas.

### 1. Redirecciones de la web antigua (lo más importante)

La web antigua tiene sus propias direcciones, y Google ya las conoce. Si al cambiar de web esas direcciones dan error, se pierde lo que la web tenía ganado en buscadores. También fallarían los enlaces que la gente tenga guardados.

Hay que redirigir cada dirección antigua a su página nueva con una **redirección 301**, que es la permanente. Esta es la tabla, sacada del mapa del sitio de la web antigua el 20/11/2026:

| Dirección antigua | Página nueva |
|---|---|
| `/quiénes-somos/` | `/pedir-ayuda-psicologos.html` |
| `/información-general/` | `/preguntas-frecuentes.html` |
| `/terapias-y-servicios/` | `/#servicios` |
| `/terapias-y-servicios/ansiedad/` | `/psicologo-ansiedad-langreo.html` |
| `/terapias-y-servicios/depresión/` | `/psicologo-depresion-langreo.html` |
| `/terapias-y-servicios/autoestima/` | `/psicologo-autoestima-langreo.html` |
| `/terapias-y-servicios/problemas-de-pareja/` | `/terapia-de-pareja-langreo.html` |
| `/terapias-y-servicios/hipnosis-clínica/` | `/hipnosis-clinica-langreo.html` |
| `/terapias-y-servicios/problemas-infantiles-o-escolares/` | `/psicologo-infantil-langreo.html` |
| `/terapias-y-servicios/problemas-infantiles-o-escolares/autorizacion-tratamiento-menores/` | `/psicologo-infantil-langreo.html#autorizacion-menores` |
| `/terapias-y-servicios/dejar-de-fumar/` | `/dejar-de-fumar-langreo.html` |
| `/tarifas/` | `/#tarifas` |
| `/contacto/` | `/escribenos.html` |
| `/cómo-llegar/` | `/#contacto` |
| `/aviso-legal-sanitario/` | `/aviso-legal.html` |
| `/aviso-legal/` | `/aviso-legal.html` |
| `/sitemap/` | `/` |

La portada (`/`) se queda igual. Las direcciones con tilde tienen que funcionar escritas con tilde y codificadas (por ejemplo `hipnosis-cl%C3%ADnica`), y con barra final y sin ella.

Si antes de publicar se cambia el nombre de alguna página nueva, hay que actualizar esta tabla.

### 2. Comprobar las direcciones de los datos estructurados

Todas las páginas llevan datos estructurados para Google y las IA (consulta, Begoña, terapias y preguntas frecuentes). Usan direcciones del tipo `https://www.psicologoslangreo.es/dejar-de-fumar-langreo.html`.

Si el alojamiento muestra las páginas sin `.html` (por ejemplo `.../dejar-de-fumar-langreo`), hay que cambiar esas direcciones dentro de los datos estructurados.

Lo mismo pasa con la etiqueta `<link rel="canonical">`. Desde el 20/11/2026 cada página la lleva justo debajo de la línea del `noindex`, y le dice a Google cuál es su dirección buena. Esa etiqueta se queda al publicar. Solo hay que cambiar su dirección si las páginas se muestran sin `.html`.

### 3. `sitemap.xml` y `robots.txt`

Están hechos desde el 20/11/2026 y van junto a `index.html`:
- **`sitemap.xml`:** es la lista de las 14 páginas que se envía a Google.
- **`robots.txt`:** deja revisar toda la web e indica dónde está esa lista.

Hay que subirlos con la web. Solo cambian si el alojamiento muestra las páginas sin `.html`, igual que en el punto 2. Si se añade o se quita alguna página, hay que actualizar el `sitemap.xml`.

### 4. Qué archivos se suben y cuáles no

Al alojamiento se suben solo los archivos `.html`, `sitemap.xml`, `robots.txt` y la carpeta `assets`. No se suben `BRIEF.md`, `ESTADO.md`, `CREDITOS.md`, este archivo ni las carpetas `materiales-cliente` y `referencias`. Son notas internas y no deben quedar públicas.

## Después de publicar

- [ ] Comprobar que ninguna página lleva ya `noindex`. Abre cualquier página, haz clic derecho, elige «Ver código fuente» y busca «noindex»: no debe aparecer.
- [ ] Abrir 3 o 4 direcciones antiguas, por ejemplo `https://www.psicologoslangreo.es/tarifas/`, y comprobar que llevan a su página nueva.
- [ ] Pasar el inicio y una terapia por la **Prueba de resultados enriquecidos** de Google (search.google.com/test/rich-results).
- [ ] En **Google Search Console**, enviar el `sitemap.xml` nuevo.
- [ ] Revisar que la ficha de Google (Perfil de Empresa) de la consulta enlaza a `https://www.psicologoslangreo.es/`.
- [ ] Mantener las redirecciones al menos un año. Lo mejor es no quitarlas nunca.

## Pendiente del cliente

- **Página de hipnosis clínica:** tiene apartados antiguos que repiten o contradicen el texto nuevo. Son «¿La hipnosis clínica es lo que vemos en la televisión?», «¿Es válida para todo el mundo?», «¿Cómo se hace una sesión?» y «¿Es efectiva?». Estamos esperando la respuesta de Begoña para saber si se quitan.
