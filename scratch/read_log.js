import fs from 'fs';
try {
  const content = fs.readFileSync('dev_log.txt', 'utf16le');
  console.log("LOG TAIL:\n", content.split('\n').slice(-150).join('\n'));
} catch (e) {
  console.error(e);
}
