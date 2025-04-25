# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from profanity import check_profanity, get_profanity_response

app = FastAPI()

class TextInput(BaseModel):
    text: str

# FOR CHECKING PROFANITY
@app.post("/check_text")
async def check_text(input: TextInput):
    try:
        if check_profanity(input.text):
            response = get_profanity_response()
            return {"profanity_detected": True, "response": response}
        else:
            return {"profanity_detected": False, "message": "Text is clean."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))