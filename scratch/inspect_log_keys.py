import json

log_path = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\185136c7-ba2a-4f07-b77d-2f97e5ddbf46\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        data = json.loads(line)
        # Let's inspect step 178 or 221
        if data.get("step_index") in [178, 221, 969]:
            print(f"--- Step {data.get('step_index')} ---")
            print(list(data.keys()))
            for key in ["type", "source", "status", "content"]:
                if key in data:
                    val = str(data[key])
                    print(f"  {key}: {val[:300]}...")
            if "tool_calls" in data:
                print(f"  tool_calls: {str(data['tool_calls'])[:300]}...")
            if "toolCalls" in data:
                print(f"  toolCalls: {str(data['toolCalls'])[:300]}...")
            print()
