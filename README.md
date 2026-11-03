# Invitación de boda · Carla & Andrés

Web estática (HTML + CSS + JS sin dependencias) pensada para móvil. Todo lo que se publica está en `public/`.

## Probar en local

```
npm run dev        # sirve public/ en http://localhost:3000
```

Enlaces directos a cada diapositiva: `/#3` cuenta atrás, `/#6` confirmación, `/#7` música…

## Publicar en Cloudflare Pages

- Opción rápida: Cloudflare → Workers & Pages → Create → Pages → *Upload assets* → arrastrar la carpeta `public/`.
- Opción CLI: `npx wrangler pages deploy public --project-name=boda-carla-andres`

Después, cambiar en `public/index.html` la URL de `og:image` (`https://TU-DOMINIO.pages.dev/og.jpg`) por el dominio real para que WhatsApp muestre la vista previa.

## Música de fondo

```
npm run audio -- "C:/ruta/a/la/cancion.mp3"
```

Genera `public/audio/cancion.m4a` comprimida. Para que empiece en un segundo concreto (p. ej. el estribillo), cambiar `data-inicio="0"` en la etiqueta `<audio>` de `index.html`. Sin ese archivo la web funciona igual y el botón de música no aparece.

## Cambiar fotos

Las originales están en `../Fotos invitación`. Tras sustituir alguna, regenerar las WebP:

```
npm install
npm run images
```

La correspondencia foto → archivo está al principio de `scripts/build-images.js`.
