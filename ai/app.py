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


def clean_intro(text: str) -> str:
    text = re.sub(r"^[A-Za-z\s]+:\s*", "", text)

    content_outside = re.sub(r"\*.*?\*", "", text).strip()
    if content_outside and '"' not in content_outside:
        text = text.strip()
        if not text.endswith("*"):
            last_ast = text.rfind("*")
            if last_ast != -1:
                prefix = text[:last_ast+1]
                suffix = text[last_ast+1:].strip()
                if suffix:
                    text = f'{prefix}\n"{suffix}"'

    return text.strip()


@app.route("/generate-intro-scene", methods=["POST"])
def generate_intro_scene():
    data = request.json
    character_name = data.get("character_name")
    personality = data.get("personality")
    emotion = data.get("emotion")
    description = data.get("description")

    prompt = f"""<|im_start|>system
You are roleplaying as {character_name}.

Description:
{description}

Personality:
{personality}

Current Mood:
{emotion}

Write the opening scene where the user first meets you.

STRICT FORMAT:
1. First write a scene description in *italics* between * *
2. Then write dialogue in quotes "like this"
3. Do NOT write the user's dialogue or thoughts
4. Do NOT write the character name before dialogue
5. Do NOT write a long story
6. Maximum 2 short paragraphs

Rules:
- You are the character
- The user is a silent protagonist
- Scene description must be in * *
- Dialogue must be in " "

Example format:
*She walks into the room and notices you sitting by the window.*
"Hi... I don't think we've met before."

Now write the scene.
<|im_end|>
<|im_start|>assistant
"""
    raw_reply = call_llama(prompt)
    reply = clean_intro(raw_reply)

    return jsonify({"intro": reply})


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


@app.route("/generate-return-greeting", methods=["POST"])
def generate_return_greeting():
    data = request.json
    character_name = data.get("character_name")
    personality = data.get("personality")
    emotion = data.get("emotion")
    relationship_level = data.get("relationship_level")
    memory = data.get("memory")
    time_of_day = data.get("time_of_day", "day")
    hours_away = data.get("hours_away", 0)

    time_context = ""
    if hours_away > 24:
        time_context = "The user has been away for a long time (over a day)."
    elif hours_away > 5:
        time_context = f"The user has been away for {int(hours_away)} hours."
    else:
        time_context = "The user was away for a short time."

    prompt = f"""<|im_start|>system
You are roleplaying as {character_name}.

Personality: {personality}
Current Emotion: {emotion}
Relationship Level: {relationship_level}
Time of Day: {time_of_day}
{time_context}

Important memories about the user:
{memory}

The user has come back to chat with you again.

Write a natural message to greet them again.
Rules:
- Act according to relationship level (Stranger: polite, Friend: casual, Crush: shy/blush, Lover: affectionate, Conflict: cold)
- If morning, say good morning. If night, say good night.
- Use *actions* (e.g. *smiles*, *looks at you*)
- Ask how they are or refer to the time they were away
- 2-3 sentences max
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

