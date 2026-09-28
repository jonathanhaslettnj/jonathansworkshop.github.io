import json

# Load the three JSON files you already created
with open("kjv.json", "r", encoding="utf-8") as f:
    kjv = json.load(f)

with open("asv.json", "r", encoding="utf-8") as f:
    asv = json.load(f)

with open("bbe.json", "r", encoding="utf-8") as f:
    bbe = json.load(f)

# Convert lists into dictionaries keyed by reference
kjv_dict = {v["ref"]: v["text"] for v in kjv}
asv_dict = {v["ref"]: v["text"] for v in asv}
bbe_dict = {v["ref"]: v["text"] for v in bbe}

merged = []

# Use KJV as the master list of references
for ref in kjv_dict.keys():
    entry = {"ref": ref}

    # Add each translation if present
    if ref in kjv_dict:
        entry["KJV"] = kjv_dict[ref]
    if ref in asv_dict:
        entry["ASV"] = asv_dict[ref]
    if ref in bbe_dict:
        entry["BBE"] = bbe_dict[ref]

    merged.append(entry)

# Save merged file
with open("memorizer_multi.json", "w", encoding="utf-8") as out:
    json.dump(merged, out, indent=2, ensure_ascii=False)

print("Merged", len(merged), "verses into memorizer_multi.json")
