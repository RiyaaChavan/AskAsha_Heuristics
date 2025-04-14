import datetime
from fpdf import FPDF
import googlemaps
import os
from dotenv import load_dotenv
from openai import OpenAI
import re
import unicodedata

# Load API keys from .env
load_dotenv()
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Get latitude and longitude for a place
def get_coordinates(place):
    result = gmaps.geocode(place)
    if result:
        location = result[0]["geometry"]["location"]
        return location["lat"], location["lng"]
    return None, None

# Get nearby places using a keyword
def get_places(lat, lng, keyword, radius=5000, count=10):  # Increased count to 10
    result = gmaps.places_nearby(location=(lat, lng), radius=radius, keyword=keyword)
    places = [place["name"] for place in result.get("results", [])][:count]
    
    # If we don't have enough places, fill with generic names
    while len(places) < count:
        places.append("a charming local spot")
    
    return places

# Clean markdown-style characters from text
def clean_text(text):
    # Remove markdown and other special characters
    cleaned = re.sub(r"[*#_`]", "", text)
    # Also normalize unicode characters
    return unicodedata.normalize("NFKD", cleaned).encode("ascii", "ignore").decode("ascii")

# Use GPT-4o to generate short itinerary descriptions
def generate_ai_description(day_number, main_place, hidden_place, city, budget):
    prompt = (
        f"Generate a concise and friendly travel itinerary for Day {day_number} in {city}. "
        f"The user is visiting {main_place}, and can optionally explore a hidden gem called {hidden_place}. "
        f"Limit the description to about 3 lines for the main place. Also give a separate short paragraph suggesting the hidden gem (Side Quest). "
        f"Use simple language and do not use any markdown symbols like *, **, or #. "
        f"The tone should be travel-friendly and easy to read. Budget is '{budget}', so keep that in mind. "
        f"Make it sound warm and welcoming."
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()

# PDF builder class
class ItineraryPDF(FPDF):
    def _init_(self):
        super()._init_()
        self.set_font("Helvetica", "", 14)
        self.set_auto_page_break(auto=True, margin=15)
        
    def header(self):
        # Header is printed on each page
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(0)
        self.cell(0, 10, "Personalized Sustainable Itinerary", new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(5)

    def add_day_title(self, day_num, title, date):
        # Check if we need to add a new page
        if self.get_y() > 240:
            self.add_page()
            
        # Ensure day number is explicitly included and formatted correctly
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 30, 120)
        day_title = f"Day {day_num}: {title} - {date}"
        self.cell(0, 10, day_title, new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

    def add_content(self, text):
        self.set_font("Helvetica", "", 12)
        self.set_text_color(0)
        self.multi_cell(0, 10, text)
        self.ln()

# Generate the full itinerary
def generate_itinerary(user_input):
    start_date = datetime.datetime.strptime(user_input["dateOfVisit"], "%Y-%m-%d")
    lat, lng = get_coordinates(user_input["whereTo"])
    if not lat:
        raise Exception("Invalid location")

    budget = user_input.get("budget", "low").lower()
    if budget == "high":
        main_keyword = "luxury tourist attraction"
        hidden_keyword = "exclusive hidden gems OR boutique experience"
    else:
        main_keyword = "budget tourist attraction"
        hidden_keyword = "hidden gems OR local market OR cultural"

    # Get places for the entire duration of the trip
    days_to_visit = user_input["daysOfVisit"]
    main_spots = get_places(lat, lng, main_keyword, count=days_to_visit)
    hidden_spots = get_places(lat, lng, hidden_keyword, count=days_to_visit)

    itinerary = []

    # Day 0 – arrival
    itinerary.append({
        "day_num": 0,
        "title": "Journey Begins",
        "date": start_date.strftime("%Y-%m-%d"),
        "desc": f"{user_input['name']} begins the adventure with a flight from {user_input['whereFrom']} to {user_input['whereTo']}. "
                f"After a warm check-in and good rest, the journey is ready to begin!"
    })

    # Create itinerary for each day
    for i in range(1, days_to_visit):
        date = (start_date + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        main = main_spots[i-1] if i-1 < len(main_spots) else "a charming landmark"
        hidden = hidden_spots[i-1] if i-1 < len(hidden_spots) else "a quiet local spot"
        
        ai_description = generate_ai_description(i, main, hidden, user_input["whereTo"], budget)
        
        itinerary.append({
            "day_num": i,  # Explicitly store the day number
            "title": "Exploring the Local Treasures",
            "date": date,
            "desc": ai_description
        })

    return itinerary

# Main program
def main():
    user_input = {
        "name": "John Doe",
        "numberOfPeople": 2,
        "daysOfVisit": 4,  # Changed to 10 days
        "dateOfVisit": "2025-05-15",
        "whereTo": "New York City, USA",
        "whereFrom": "Mumbai, India",
        "budget": "high"  # or "high"
    }

    itinerary = generate_itinerary(user_input)

    pdf = ItineraryPDF()
    pdf.add_page()

    for day_info in itinerary:
        # Always use the explicit day number from the itinerary
        day_num = day_info["day_num"]
        title = day_info["title"]
        date = day_info["date"]
        
        # Add the day title with its number
        pdf.add_day_title(day_num, title, date)
        
        # Process and add the description
        cleaned_desc = clean_text(day_info["desc"])
        
        if "Side Quest" in cleaned_desc:
            parts = cleaned_desc.split("Side Quest", 1)
            main_part = parts[0].strip()
            side_quest = parts[1].strip()
            
            # Add main description
            pdf.add_content(main_part)
            
            # Check if we need a new page for side quest
            if pdf.get_y() > 240:
                pdf.add_page()
                
            # Add side quest section
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 10, "Side Quest Suggestion:", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 12)
            pdf.add_content(side_quest)
        else:
            # If there's no side quest, just add the whole description
            pdf.add_content(cleaned_desc)

    output_filename = f"{user_input['name'].replace(' ', '_').lower()}_itinerary.pdf"
    pdf.output(output_filename)
    print(f"Generated PDF: {output_filename}")

if _name_ == "_main_":
    main()