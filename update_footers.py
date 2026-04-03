import os, glob

folder = r"c:\Users\Youssef\Desktop\zzz\ZYQRA"
files = glob.glob(os.path.join(folder, "*.html"))

replacements = [
    ('<li><a href="terms.html">الشروط والأحكام</a></li>', '<li><a href="terms.html" data-i18n="nav_terms">الشروط والأحكام</a></li>'),
    ('<li><a href="privacy.html">سياسة الخصوصية</a></li>', '<li><a href="privacy.html" data-i18n="nav_privacy">سياسة الخصوصية</a></li>'),
    ('<li><a href="products.html">المنتجات الذكية</a></li>', '<li><a href="products.html" data-i18n="foo_serv_smart">المنتجات الذكية</a></li>'),
    ('<li><a href="courses.html">الدورات التعليمية</a></li>', '<li><a href="courses.html" data-i18n="foo_serv_courses">الدورات التعليمية</a></li>'),
    ('<li><a href="contact.html">الدعم الفني</a></li>', '<li><a href="contact.html" data-i18n="foo_serv_support">الدعم الفني</a></li>'),
    ('<li><a href="contact.html">الاستشارات</a></li>', '<li><a href="contact.html" data-i18n="foo_serv_consult">الاستشارات</a></li>')
]

count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        if old in new_content:
            new_content = new_content.replace(old, new)
            
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print("Updated:", os.path.basename(file))
        
print("Updated", count, "files successfully.")
