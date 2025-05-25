"""
Test the complete roadmap generation with domain detection and timeframe adjustment
"""

import json
from agent import generate_roadmap

# Generate a roadmap with a 2-week timeframe in the technical domain
print("Generating technical roadmap with 2-week timeframe...")
tech_roadmap = generate_roadmap("learning python programming in 2 weeks")
print(f"Generated {len(tech_roadmap)} steps")

# Print the first step to check if timeframe guidance is included
print("\nFirst step title:", tech_roadmap[0]["title"])
description = tech_roadmap[0]["description"]
print("Description excerpt:", description[:100] + "..." if len(description) > 100 else description)
print("Has timeframe guidance:", "Timeframe Guidance" in description)

# Generate a roadmap for a leadership domain
print("\nGenerating leadership roadmap...")
leadership_roadmap = generate_roadmap("developing leadership skills")
print(f"Generated {len(leadership_roadmap)} steps") 

# Print the first step
print("\nFirst step title:", leadership_roadmap[0]["title"])

# Save the roadmaps to files for inspection
with open("technical_roadmap.json", "w") as f:
    json.dump(tech_roadmap, f, indent=2)
    
with open("leadership_roadmap.json", "w") as f:
    json.dump(leadership_roadmap, f, indent=2)
    
print("\nRoadmaps saved to technical_roadmap.json and leadership_roadmap.json")
