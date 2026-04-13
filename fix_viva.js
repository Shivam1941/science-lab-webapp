const fs = require('fs');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if(file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir('experiments');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Non-greedy match for anything between onclick="window.VIVA_SYSTEM.open( and )"
    const newContent = content.replace(
        /onclick="window\.VIVA_SYSTEM\.open\([\s\S]*?\}\)"/g,
        'onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \'&amp;\').replace(/\\"/g, \'&quot;\')})"'
    );
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Fixed ' + file);
    }
});
