from flask import Flask, request, jsonify
import requests
import re

app = Flask(__name__)

LLAMA_SERVER_URL = "http://localhost:8080/completion"

def call_llama(prompt, stop=["<|im_end|>", "User:", "Assistant:"]):
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

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt")
    
    reply = call_llama(prompt)
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
 "type": "personal | interest | emotional | event"
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

if __name__ == "__main__":
    app.run(port=8000)

