from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

chatbot = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    max_new_tokens=120,
    temperature=0.9,
    do_sample=True
)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt")

    result = chatbot(prompt)[0]["generated_text"]

    reply = result[len(prompt):].strip()

    if "User:" in reply:
        reply = reply.split("User:")[0].strip()

    return jsonify({"reply": reply})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    message = data.get("message")

    prompt = f"""
Analyze the user's message and return JSON.

Message: "{message}"

Return in this format:
{{
  "emotion": "",
  "intent": "",
  "affection": 0,
  "trust": 0,
  "intimacy": 0,
  "anger": 0
}}

Only return JSON.
"""

    result = chatbot(prompt)[0]["generated_text"]
    json_text = result[len(prompt):].strip()

    return jsonify({"analysis": json_text})

@app.route("/extract-memory", methods=["POST"])
def extract_memory():
    data = request.json
    message = data.get("message")

    prompt = f"""
Extract important long-term memory from this message.

Message: "{message}"

If nothing important, return: NONE

If important, return JSON:
{{
 "content": "",
 "type": "personal | interest | emotional | event"
}}
Only return JSON or NONE.
"""

    result = chatbot(prompt)[0]["generated_text"]
    reply = result[len(prompt):].strip()

    return jsonify({"memory": reply})

if __name__ == "__main__":
    app.run(port=8000)
