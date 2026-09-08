"""
Download the Ganesha 3D model (CC-BY, by lucas.rvdl) from Sketchfab as a GLB
and place it at assets/ganesha.glb.

Sketchfab only lets logged-in users download, so you need your API token:
  1. Log in at https://sketchfab.com  (free account is fine)
  2. Open https://sketchfab.com/settings/password  ->  copy "API token"
  3. Run:   python tools/download_ganesha.py YOUR_API_TOKEN

Alternative without this script: on the model page click "Download 3D Model"
-> choose "glTF" / "Original format" -> unzip -> rename the .glb (or .gltf +
.bin + textures folder) into D:\\Wedding\\assets\\ganesha.glb
"""
import io, os, sys, json, zipfile, urllib.request

UID = "a93a83413e034b29803aed62577357c5"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    token = sys.argv[1].strip()
    req = urllib.request.Request(f"https://api.sketchfab.com/v3/models/{UID}/download",
                                 headers={"Authorization": f"Token {token}"})
    with urllib.request.urlopen(req) as r:
        info = json.load(r)
    fmt = info.get("glb") or info.get("gltf")
    if not fmt:
        print("No glb/gltf download offered:", list(info)); sys.exit(2)
    print("Downloading", fmt["size"] // 1024, "KB ...")
    data = urllib.request.urlopen(fmt["url"]).read()
    os.makedirs(OUT_DIR, exist_ok=True)
    if info.get("glb"):
        path = os.path.join(OUT_DIR, "ganesha.glb")
        open(path, "wb").write(data)
    else:
        # gltf zip: extract next to a folder and point config at the .gltf
        z = zipfile.ZipFile(io.BytesIO(data)); z.extractall(os.path.join(OUT_DIR, "ganesha"))
        gltf = [n for n in z.namelist() if n.endswith(".gltf")][0]
        path = os.path.join(OUT_DIR, "ganesha", gltf)
        print("NOTE: set ganeshaModel in js/config.js to 'assets/ganesha/%s'" % gltf)
    print("Saved:", path)

if __name__ == "__main__":
    main()
