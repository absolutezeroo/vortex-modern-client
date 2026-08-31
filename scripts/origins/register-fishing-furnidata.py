"""Adds the three fishing-spot classes to the deployed furnidata.

The served furnidata is hand-edited and is NOT regenerated from sources -- same rule as
external_variables -- so this appends and never rewrites. Re-running it is a no-op.
"""
import json, pathlib, shutil

from lib import paths

PATH = paths.FURNIDATA
SPOTS = [
    (8100001, "vtx_fishing_spot_park", "Infobus Park fishing spot"),
    (8100002, "vtx_fishing_spot_hana", "Port Hana fishing spot"),
    (8100003, "vtx_fishing_spot_snouthill", "Snouthill Pier fishing spot"),
    # The two remaining water tints from Origins' cast. Their names are derived from the colour --
    # Origins numbers them and names neither -- and no `fishing_zones` row points at them yet, so
    # they place and animate but are not fishable until one does.
    (8100005, "vtx_fishing_spot_lagoon", "Lagoon fishing spot"),
    (8100006, "vtx_fishing_spot_night", "Night water fishing spot"),
    # The signpost is a furni of its own -- it marks that a fishing zone is nearby, and the water
    # tiles make the zone without it. It is decoration: no logic, and it does not open the panel.
    (8100004, "vtx_fishing_sign", "Fishing zone sign"),
]

data = json.loads(PATH.read_text(encoding='utf8'))
items = data['roomitemtypes']['furnitype']
existing = {i['classname'] for i in items}
added = 0

for offer_id, classname, label in SPOTS:
    if classname in existing:
        continue
    items.append({
        "id": offer_id, "classname": classname, "name": label,
        "description": f"{classname}_desc", "revision": 59005,
        "xdim": 1, "ydim": 1, "defaultdir": 0,
        "partcolors": {"color": []},
        "offerid": offer_id, "rentofferid": -1,
        "buyout": False, "rentbuyout": False, "bc": False, "rare": False,
        "canstandon": False, "cansiton": False, "canlayon": False,
        "excludeddynamic": False, "furniline": "", "adurl": "",
        "environment": "", "customparams": "", "category": "unknown", "specialtype": 0,
    })
    added += 1

if added:
    shutil.copy2(PATH, PATH.with_suffix('.json.bak'))
    PATH.write_text(json.dumps(data), encoding='utf8')

print(f"{added} added, {len(items)} floor items now")
