import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');

export { LanguageCode } from './_metadata/localizationMetadata.js';
