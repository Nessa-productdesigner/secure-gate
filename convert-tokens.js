const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./design-tokens.tokens (1).json', 'utf-8'));

const resolveValue = (val, rootObj) => {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    const pathParts = val.slice(1, -1).split('.');
    let curr = rootObj;
    for (const p of pathParts) {
      if (curr && curr[p] !== undefined) {
        curr = curr[p];
      } else {
        return val;
      }
    }
    if (curr && curr.value !== undefined) return resolveValue(curr.value, rootObj);
    if (typeof curr === 'string') return resolveValue(curr, rootObj);
    return curr;
  }
  return val;
};

const toKebabCase = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
};

const cssVariables = [];

const walk = (obj, path) => {
  if (obj && typeof obj === 'object') {
    if (obj.value !== undefined && typeof obj.value !== 'object') {
      let parts = [];
      for (let p of path) {
        p = toKebabCase(p);
        if (parts.length > 0 && (p.startsWith(parts[parts.length - 1] + '-') || p === parts[parts.length - 1])) {
          parts.pop();
        }
        parts.push(p);
      }
      const varName = `--${parts.join('-')}`;
      let resolvedValue = resolveValue(obj.value, data);
      
      // If the resolved value is a number, maybe add px
      if (typeof resolvedValue === 'number') {
        const lastPart = parts[parts.length - 1] || '';
        const needsPx = obj.type === 'dimension' || lastPart.includes('size') || lastPart.includes('spacing') || lastPart.includes('height') || lastPart.includes('indent') || lastPart.includes('radius');
        if (needsPx && resolvedValue !== 0) {
          resolvedValue = `${resolvedValue}px`;
        }
      }
      
      cssVariables.push(`  ${varName}: ${resolvedValue};`);
    } else {
      for (const k in obj) {
        if (k !== 'extensions' && k !== 'description' && k !== 'type') {
          walk(obj[k], [...path, k]);
        }
      }
    }
  }
};

// "the color system contains color roles and primitive colors and the UI will only use the color roles"
if (data.tokens) walk(data.tokens, []);
if (data.typography) walk(data.typography, []);

// Write output
const cssContent = `:root {\n${cssVariables.join('\n')}\n}\n`;
fs.writeFileSync('./design-tokens.css', cssContent);
console.log('Successfully wrote design-tokens.css with ' + cssVariables.length + ' variables.');
