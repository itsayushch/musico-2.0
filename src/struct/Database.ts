import { MongoClient } from 'mongodb';

class MongoDB extends MongoClient {
	public constructor() {
		super(process.env.MONGODB_URI!);
	}

	public async connect() {
		return super.connect();
	}
}

export const Database = new MongoDB();