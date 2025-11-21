import UAParser from 'ua-parser-js';

try {
    console.log('Imported UAParser:', UAParser);
    const parser = new (UAParser as any)('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    console.log('Parser created');
    const result = parser.getResult();
    console.log('Result:', result);
} catch (error) {
    console.error('Error:', error);
}
