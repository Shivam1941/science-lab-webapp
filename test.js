const VIVA_QUESTIONS = [{ q: 'Test' }];
const str = `onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, \\'&amp;\\').replace(/\\"/g, \\'&quot;\\')})"`;
console.log(str);
