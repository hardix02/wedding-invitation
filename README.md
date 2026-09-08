# Wedding Invitation site

Open by serving over HTTP (not file://):

    cd D:\Wedding
    python -m http.server 8765
    -> http://localhost:8765/

## Personalise
Edit ONLY `js/config.js`: names, date, story, venue, WhatsApp number, event list.

## Ganesha 3D model (splash screen)
Model: "Ganesha 3D" by lucas.rvdl, CC BY 4.0 (credit shown in the page corner).
- If `assets/ganesha.glb` exists, it renders in Three.js with gold halo, parallax and a zoom-in transition.
- If missing, the page falls back to Sketchfab's official embed inside a gold circle.

To get the GLB (needs a free Sketchfab login):
  Option A: `python tools/download_ganesha.py <your Sketchfab API token>`
            (token from https://sketchfab.com/settings/password)
  Option B: On the model page click "Download 3D Model" -> glTF -> unzip ->
            save the .glb as `assets/ganesha.glb`.

## Deploy
Static files only: drop the folder on GitHub Pages, Netlify, Vercel or any host.
