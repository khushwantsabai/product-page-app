import json

log_path = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\185136c7-ba2a-4f07-b77d-2f97e5ddbf46\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            # Check if this step is a write_to_file or replace_file_content call to the editor route
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                func_name = tc.get("function")
                args = tc.get("args", {})
                target = args.get("TargetFile") or args.get("Target")
                if target and "app.editor.$id.tsx" in target:
                    print(f"Line {idx}, Step {data.get('step_index')}, Function {func_name}")
                    # Let's save it
                    with open(f"C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\185136c7-ba2a-4f07-b77d-2f97e5ddbf46\\scratch\\tool_call_{idx}.json", "w", encoding="utf-8") as out_f:
                        json.dump(tc, out_f, indent=2)
        except Exception as e:
            pass
