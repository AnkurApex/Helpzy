const fs = require('fs');
const html = fs.readFileSync('home.html', 'utf8');
const match = html.match(/tailwind\.config = (\{[\s\S]*?\})\s*</);

if (match) {
  let configStr = match[1];
  configStr = configStr.replace(/"Inter"/g, '"var(--font-inter)"');
  configStr = configStr.replace(/"Manrope"/g, '"var(--font-manrope)"');
  let fullConfig = `/** @type {import('tailwindcss').Config} */\nexport default ${configStr};\n`;
  fs.writeFileSync('tailwind.config.js', fullConfig);
  console.log('tailwind.config.js generated');
} else {
  console.log('No tailwind config found');
}
