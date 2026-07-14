import os

styles_dir = r"c:\Users\ku060\Downloads\cmc-truyen-temp\frontend\src"

for root, dirs, files in os.walk(styles_dir):
    for file in files:
        if file.endswith((".css", ".scss", ".jsx", ".js")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for i, line in enumerate(f, 1):
                        if "featured-carousel-label" in line:
                            print(f"{path}:{i}: {line.strip()}")
            except Exception as e:
                pass
