
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'config.json');
const publicPath = path.join(__dirname, 'public');

try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let missingFiles = [];

    function checkPath(value) {
        if (typeof value === 'string' && value.startsWith('/assets/')) {
            // Remove leading slash to make it relative to root, then join with public
            const relativePath = value.substring(1);
            const fullPath = path.join(publicPath, relativePath);
            if (!fs.existsSync(fullPath)) {
                missingFiles.push(value);
            }
        } else if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                checkPath(value[key]);
            }
        } else if (Array.isArray(value)) {
            value.forEach(item => checkPath(item));
        }
    }

    checkPath(config);

    if (missingFiles.length > 0) {
        console.log("Missing files found:");
        missingFiles.forEach(f => console.log(f));
        process.exit(1);
    } else {
        console.log("All assets verification passed!");
        process.exit(0);
    }

} catch (err) {
    console.error("Error verifying assets:", err);
    process.exit(1);
}
