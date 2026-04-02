import type { IText } from './localizationMetadata.js';

export interface Character {
	id: number;
	name: IText;
	birthday: string;
}
