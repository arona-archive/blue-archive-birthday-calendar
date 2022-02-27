import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { google, Auth } from 'googleapis';
import { rootDir } from '../constants';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const tokenPath = path.resolve(rootDir, 'token.json');

const getAuth = async (credentials: any): Promise<Auth.OAuth2Client> => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	try {
		const token = process.env.GOOGLE_APIS_TOKEN;
		if (!token) {
			throw new Error('token not found');
		}

		oAuth2Client.setCredentials(JSON.parse(token));
		return oAuth2Client;
	} catch {
		if (process.env.GITHUB_ACTIONS === 'true') {
			throw new Error('token not found');
		}

		return getAccessToken(oAuth2Client);
	}
};

const getAccessToken = (oAuth2Client: Auth.OAuth2Client): Promise<Auth.OAuth2Client> => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve, reject) => {
		rl.question('Enter the code from that page here: ', async (code) => {
			try {
				rl.close();
				const token = await oAuth2Client.getToken(code);
				oAuth2Client.setCredentials(token.tokens);
				await fs.promises.writeFile(tokenPath, JSON.stringify(token));
				console.log('Token stored to', tokenPath);
				resolve(oAuth2Client);
			} catch (error) {
				reject(error);
			}
		});
	});
};

export const authorize = async (): Promise<Auth.OAuth2Client> => {
	const credentials = process.env.GOOGLE_APIS_CREDENTIALS;
	if (!credentials) {
		throw new Error('credentials not found');
	}
	return await getAuth(JSON.parse(credentials));
};
