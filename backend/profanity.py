import requests
import random

from dotenv import load_dotenv
import os

load_dotenv()

PROFANITY_API_KEY = os.getenv("PROFANITY_API_KEY")

PROFANITY_RESPONSES = [
    "I notice your message contains inappropriate language. Could you please rephrase that more respectfully?",
    "Please keep our conversation respectful and avoid using offensive language.",
    "I'm here to help, but I'd appreciate if you could express yourself without using offensive terms.",
    "Let's maintain a positive conversation. Could you try expressing that differently?",
    "I understand you may feel strongly, but could you share your thoughts without using inappropriate language?"
]

def check_profanity(text: str) -> bool:
    api_url = f'https://api.api-ninjas.com/v1/profanityfilter?text={text}'
    response = requests.get(api_url, headers={'X-Api-Key': PROFANITY_API_KEY})
    if response.status_code == 200:
        return response.json().get("has_profanity", False)
    else:
        raise Exception(f"Profanity API error: {response.status_code}")

def get_profanity_response() -> str:
    return random.choice(PROFANITY_RESPONSES)

    