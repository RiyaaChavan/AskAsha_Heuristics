import json

with open('assets/locs.json', encoding='utf-8') as f:
    locs_data = json.load(f)

allowed_labels = [
    loc['label']
    for loc in locs_data['body']['location']
    if loc.get('active', False)
]

print(allowed_labels)


with open('assets/locs.json', 'w', encoding='utf-8') as f:
    json.dump(allowed_labels, f, ensure_ascii=False, indent=4)