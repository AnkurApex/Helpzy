const fs = require('fs');

function convert(htmlFile, outFile, componentName) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!match) {
    match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  }
  let main = match ? match[1] : html;
  
  // Remove Navbar and Footer from the body if they exist in the match
  main = main.replace(/<nav[\s\S]*?<\/nav>/g, '');
  main = main.replace(/<footer[\s\S]*?<\/footer>/g, '');
  
  main = main.replace(/class=/g, 'className=');
  
  // Convert style strings to objects
  main = main.replace(/style="([^"]*)"/g, (match, styleString) => {
    if (!styleString) return 'style={{}}';
    
    const styles = styleString.split(';').filter(s => s.trim()).map(s => {
      const [key, ...valueParts] = s.split(':');
      const value = valueParts.join(':').trim();
      const camelKey = key.trim().replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      // Handle the case where the value itself might contain single quotes (like in url())
      return `${camelKey}: "${value.replace(/"/g, '\\"')}"`;
    });
    
    return `style={{ ${styles.join(', ')} }}`;
  });

  main = main.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
  
  // Fix unclosed input/img tags if they are not self closed properly
  main = main.replace(/<img(.*?)(?<!\/)>/g, '<img$1 />');
  main = main.replace(/<input(.*?)(?<!\/)>/g, '<input$1 />');
  
  fs.writeFileSync(outFile, `import Link from 'next/link';\n\nexport default function ${componentName}({ params }) {\n  return (\n    <div className="flex-grow">\n      ${main}\n    </div>\n  );\n}`);
}

convert('landing.html', 'src/app/page.js', 'Home');
convert('search.html', 'src/app/services/plumbing/page.js', 'SearchPlumbing');
convert('profile.html', 'src/app/provider/[id]/page.js', 'ProviderProfile');
convert('booking.html', 'src/app/provider/[id]/book/page.js', 'BookProvider');
convert('admin.html', 'src/app/admin/page.js', 'AdminDashboard');
convert('provider.html', 'src/app/provider/dashboard/page.js', 'ProviderDashboard');
