import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

server_build_path = r"c:\Users\LENOVO\OneDrive\Desktop\Product Plus\pagecraft-product-builder\build\server\index.js"

with open(server_build_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for "TEMPLATE_MOCKS"
pos = content.find("TEMPLATE_MOCKS")
if pos != -1:
    # Let's go backwards to find the loader and links definitions
    # Usually links is defined close before loader, e.g. "const links$2 =" or "const loader$7 = async"
    # Let's find "const links" before TEMPLATE_MOCKS
    links_pos = content.rfind("const links", 0, pos)
    start = links_pos if links_pos != -1 else (pos - 1000)
    
    # Let's find where this component block ends.
    # The component usually ends with "export { Editor as default };" or "const Editor = "
    # or the next route definition which might start with styles or loader, like "const plansStyles = " or "const loader$8 = "
    # Let's search for the end of the react component, e.g., the definition of route module export:
    # "Object.defineProperty(..., { value: "Module" })" or similar.
    # Let's take 80,000 characters after start, since the original file was 57KB and build might be slightly smaller.
    end = pos + 80000
    
    chunk = content[start:end]
    
    output_path = r"c:\Users\LENOVO\OneDrive\Desktop\Product Plus\pagecraft-product-builder\scratch\editor_extracted.js"
    with open(output_path, "w", encoding="utf-8") as out_f:
        out_f.write(chunk)
    print(f"Extracted {len(chunk)} characters starting from {start} to {end} and saved to {output_path}")
else:
    print("TEMPLATE_MOCKS not found in bundle!")
