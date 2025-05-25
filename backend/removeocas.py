# If the file is a JSON file
import json

with open('assets/locs.json', 'r') as f:
    data = json.load(f)

# If it's a dictionary with locations as values
if isinstance(data, dict):
    locations = [v for v in data.values() if isinstance(v, str)]
# If it's a list of strings
elif isinstance(data, list):
    locations = [v for v in data if isinstance(v, str)]

print(locations)