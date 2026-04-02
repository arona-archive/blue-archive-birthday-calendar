import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { type Auth, google } from 'googleapis';
import { rootDir } from '../constants/index.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const tokenPath = path.resolve(rootDir, 'token.json');

interface Credentials {
	installed: {
		client_secret: string;
		client_id: string;
		redirect_uris: string[];
	};
}

const parseJson = <T>(text: string): T => JSON.parse(text);

const getAuth = async (credentials: Credentials): Promise<Auth.OAuth2Client> => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	try {
		const token = process.env.GOOGLE_APIS_TOKEN;
		if (token === undefined || token === '') {
			throw new Error('token not found');
		}

		oAuth2Client.setCredentials(parseJson(token));
		return oAuth2Client;
	} catch {
		if (process.env.GITHUB_ACTIONS === 'true') {
			throw new Error('token not found');
		}

		return getAccessToken(oAuth2Client);
	}
};

const promptCode = async (): Promise<string> => {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question('Enter the code from that page here: ', (code) => {
			rl.close();
			resolve(code);
		});
	});
};

const getAccessToken = async (oAuth2Client: Auth.OAuth2Client): Promise<Auth.OAuth2Client> => {
	const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
	console.log('Authorize this app by visiting this url:', authUrl);
	const code = await promptCode();
	const token = await oAuth2Client.getToken(code);
	oAuth2Client.setCredentials(token.tokens);
	await fs.promises.writeFile(tokenPath, JSON.stringify(token.tokens));
	console.log('Token stored to', tokenPath);
	return oAuth2Client;
};

export const authorize = async (): Promise<Auth.OAuth2Client> => {
	const credentials = process.env.GOOGLE_APIS_CREDENTIALS;
	if (credentials === undefined || credentials === '') {
		throw new Error('credentials not found');
	}
	return getAuth(parseJson<Credentials>(credentials));
};
