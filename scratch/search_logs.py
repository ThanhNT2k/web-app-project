with open(r"c:\Users\ku060\Downloads\cmc-truyen-temp\frontend\src\styles\main.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
count = 0
for i, line in enumerate(lines, 1):
    if "storyqq-meta-grid" in line or "storyqq-stat-card" in line:
        found = True
        count = 0
    if found:
        print(f"{i}: {line}", end="")
        count += 1
        if count > 80:  # print up to 80 lines after a match
            found = False
