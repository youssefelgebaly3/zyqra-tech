import os
import re

def update_logo_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match <h1>ZYQRA</h1> or <h1 class="sitename">ZYQRA</h1>
    # and replace with <h1><span>Z</span><span>Y</span><span>Q</span><span>R</span><span>A</span></h1>
    pattern = r'<h1([^>]*)>ZYQRA</h1>'
    replacement = r'<h1><span>Z</span><span>Y</span><span>Q</span><span>R</span><span>A</span></h1>'
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

def main():
    directory = r'c:\Users\Youssef\Desktop\zzz\ZYQRA'
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                update_logo_in_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
