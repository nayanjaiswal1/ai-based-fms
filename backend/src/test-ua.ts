import { UAParser } from 'ua-parser-js';

try {
    console.log('Imported UAParser:', UAParser);
    // Try usage for v2
    const parser = new UAParser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    console.log('Parser created');
    const result = parser.getResult();
    console.log('Result:', result);
} catch (error) {
    console.error('Error with new UAParser():', error);
    try {
        // Try usage for v1/commonjs
        const parser = new (UAParser as any)('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('Parser created with (as any)');
        const result = parser.getResult();
        console.log('Result:', result);
    } catch (e) {
        console.error('Error with (as any):', e);
    }
}
