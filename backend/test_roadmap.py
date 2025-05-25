"""
Test script for the roadmap generation functionality in agent.py
Testing domain detection, link verification, and timeframe adjustment
"""

import json
from agent import generate_roadmap
from roadmap_utils import detect_roadmap_domain, verify_and_enhance_roadmap_links, adjust_roadmap_for_timeframe

def test_domain_detection():
    """Test the domain detection functionality"""
    print("\n=== Testing domain detection ===")
    test_cases = [
        ("learning python programming", "technical"),
        ("how to become a team leader", "leadership"),
        ("graphic design skills", "creative"),
        ("marketing strategy development", "business"),
        ("job search techniques", "job_search"),
        ("returning to work after a break", "return_to_work")
    ]
    
    for topic, expected_domain in test_cases:
        detected = detect_roadmap_domain(topic)
        print(f"Topic: '{topic}' -> Detected: {detected}, Expected: {expected_domain}, {'✓' if detected == expected_domain else '✗'}")

def test_link_verification():
    """Test the link verification functionality with a sample roadmap item"""
    print("\n=== Testing link verification ===")
    sample_items = [
        {
            "title": "Python Basics",
            "description": "Learn Python fundamentals",
            "link": "https://www.freecodecamp.org/",
            "calendar_event": "Python Learning"
        }
    ]
    
    enhanced = verify_and_enhance_roadmap_links(sample_items)
    print(f"Original link: {sample_items[0]['link']}")
    print(f"Enhanced link: {enhanced[0]['link']}")
    
def test_timeframe_adjustment():
    """Test the timeframe adjustment functionality"""
    print("\n=== Testing timeframe adjustment ===")
    sample_items = [
        {
            "title": "Step 1",
            "description": "Initial step",
            "link": "https://example.com/1",
            "calendar_event": "Step 1"
        },
        {
            "title": "Step 2",
            "description": "Second step",
            "link": "https://example.com/2",
            "calendar_event": "Step 2"
        },
        {
            "title": "Step 3",
            "description": "Third step",
            "link": "https://example.com/3",
            "calendar_event": "Step 3"
        }
    ]
    
    adjusted = adjust_roadmap_for_timeframe(sample_items, "2 weeks")
    print(f"Original description length: {len(sample_items[0]['description'])}")
    print(f"Adjusted description length: {len(adjusted[0]['description'])}")
    print("Timeframe guidance included: {'Timeframe Guidance' in adjusted[0]['description']}")

def test_full_roadmap_generation():
    """Test the complete roadmap generation pipeline"""
    print("\n=== Testing full roadmap generation ===")
    topics = [
        "learning python in 2 weeks",
        "leadership skills for new managers",
        "returning to programming after 5 years"
    ]
    
    for topic in topics:
        print(f"\nGenerating roadmap for: '{topic}'")
        try:
            result = generate_roadmap(topic)
            if result:
                print(f"✓ Successfully generated roadmap with {len(result)} steps")
                # print first item's title and check for timeframe guidance
                print(f"First step: {result[0]['title']}")
                has_timeframe = "Timeframe Guidance" in result[0]['description']
                print(f"Includes timeframe guidance: {'Yes' if has_timeframe else 'No'}")
            else:
                print("✗ Failed to generate roadmap")
        except Exception as e:
            print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    test_domain_detection()
    test_link_verification()
    test_timeframe_adjustment()
    
    # Uncomment to run the full roadmap generation test
    # test_full_roadmap_generation()
    
    print("\nAll tests completed!")
