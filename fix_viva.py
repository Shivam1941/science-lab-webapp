import os

def fix_viva_buttons():
    for root, dirs, files in os.walk('experiments'):
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # The exact string that caused the issue:
                broken_str = r'onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \'&amp;\').replace(/\"/g, \'&quot;\')})"'
                
                # The correct string without backslashes before single quotes and no escaped backslash before double quote
                fixed_str = r'onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \'&amp;\').replace(/\"/g, \'&quot;\')})"'.replace(r"\'", "'").replace(r'\"', '"')
                # Wait, fixed_str should just be:
                fixed_str = r"""onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/"/g, '&quot;')})\""""
                # Actually, I should just explicitly define it without raw strings if it's confusing:
                fixed_str = 'onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \'&amp;\').replace(/\\"/g, \'&quot;\')})"'
                
                # Let's cleanly define them:
                broken_str = "onclick=\"window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \\'&amp;\\').replace(/\\\"/g, \\'&quot;\\')})\""
                fixed_str = "onclick=\"window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\\\"/g, '&quot;')})\""
                
                if broken_str in content:
                    new_content = content.replace(broken_str, fixed_str)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Fixed {path}')

if __name__ == "__main__":
    fix_viva_buttons()
