"""
Simple test for the roadmap utility functions
"""

from roadmap_utils import detect_roadmap_domain, verify_and_enhance_roadmap_links, adjust_roadmap_for_timeframe

def test_domain_detection():
    """Test the domain detection functionality"""
    print("\n=== Testing domain detection ===")
    test_cases = [
        ("learning python programming", "technical"),
        ("how to become a team leader", "leadership"),
        ("graphic design skills", "creative")
    ]
    
    for topic, expected_domain in test_cases:
        detected = detect_roadmap_domain(topic)
        print(f"Topic: '{topic}' -> Detected: {detected}, Expected: {expected_domain}")

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
        }
    ]
    
    adjusted = adjust_roadmap_for_timeframe(sample_items, "2 weeks")
    print(f"Original description: {sample_items[0]['description']}")
    print(f"Adjusted description: {adjusted[0]['description']}")

if __name__ == "__main__":
    test_domain_detection()
    test_timeframe_adjustment()
