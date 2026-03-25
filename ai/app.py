from flask import Flask, request, jsonify
import requests
import re

app = Flask(__name__)

LLAMA_SERVER_URL = "http://localhost:8080/completion"

def call_llama(prompt: str, stop: list[str] = ["<|im_end|>", "User:", "Assistant:"]) -> str:
    payload = {
        "prompt": prompt,
        "n_predict": 150,
        "temperature": 0.8,
        "stop": stop,
        "top_p": 0.95,
        "repeat_penalty": 1.1,
    }
    try:
        response = requests.post(LLAMA_SERVER_URL, json=payload)
        response.raise_for_status()
        return response.json().get("content", "").strip()
    except Exception as e:
        print(f"Llama-server error: {e}")
        return "Error: AI engine is currently unavailable."

def clean_reply(text: str, character_name: str) -> str:
    text = re.sub(rf"^{character_name}:\s*", "", text, flags=re.IGNORECASE)
    
    parts = re.split(r"\n(User|AI|Assistant|System):", text, flags=re.IGNORECASE)
    cleaned = str(parts[0])
    
    cleaned = cleaned.replace("<|im_end|>", "").replace("<|im_start|>", "")
    
    last_dot = cleaned.rfind(".")
    if last_dot != -1:
        cleaned = cleaned[:last_dot + 1]
        
    return cleaned.strip()


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt")
    character_name = data.get("character_name", "Assistant")
    
    raw_reply = call_llama(prompt)
    reply = clean_reply(raw_reply, character_name)
    
    return jsonify({"reply": reply})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    message = data.get("message")

    prompt = f"""<|im_start|>system
Analyze the user's message and return JSON.
Format:
{{
  "emotion": "string",
  "intent": "string",
  "affection": number (+/-),
  "trust": number (+/-),
  "intimacy": number (+/-),
  "anger": number (+/-)
}}
Only return JSON.
<|im_end|>
<|im_start|>user
{message}
<|im_end|>
<|im_start|>assistant
"""
    result = call_llama(prompt)
    return jsonify({"analysis": result})

@app.route("/extract-memory", methods=["POST"])
def extract_memory():
    data = request.json
    message = data.get("message")

    prompt = f"""<|im_start|>system
Extract important long-term memory from this message.
If nothing important, return: NONE
If important, return JSON:
{{
 "content": "the memory",
 "type": "personal | interest | emotional | event",
 "importance": 1-5
}}
Only return JSON or NONE.
<|im_end|>
<|im_start|>user
{message}
<|im_end|>
<|im_start|>assistant
"""
    result = call_llama(prompt)
    return jsonify({"memory": result})


@app.route("/generate-greeting", methods=["POST"])
def generate_greeting():
    data = request.json
    character_name = data.get("character_name")
    personality = data.get("personality")
    emotion = data.get("emotion")
    description = data.get("description")

    prompt = f"""<|im_start|>system
You are roleplaying as {character_name}.

Character Description:
{description}

Personality:
{personality}

Current Emotion:
{emotion}

You are meeting the user for the first time.

Write a natural first message to start a conversation.
Include small actions like *smiles* or *looks at you*.

Rules:
- Stay in character
- Be engaging
- Ask a question
- 2-3 sentences
- Do NOT write your name
- Do NOT write "User:"
Only write the message.
<|im_end|>
<|im_start|>assistant
"""
    raw_reply = call_llama(prompt)
    reply = clean_reply(raw_reply, character_name)

    return jsonify({"greeting": reply})


if __name__ == "__main__":
    app.run(port=8000)

