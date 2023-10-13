const { Web3 } = require("web3");
const { MongoClient } = require('mongodb');
const walletAddress = process.env.WALLET_ADDRESS;
const adminPrivKey = process.env.PRIVATE_KEY;
const client = new MongoClient(process.env.URI)


// const mongoClient = new MongoClient('mongodb://164.163.9.198:27017/diddykong?authSource=admin');

// const clientPromise = mongoClient.connect();

export const handler = async (event) => {
    try {
        // const autorization = event.headers.authorization;
        // if(!autorization) {
        //     return { statusCode: 400, body: JSON.stringify({ status: false, message: 'Missing autorization' }) }
        // }
        // const isExpired = jwt.verify(autorization, 'jesuscristoeosenhor');
        // const now = Date.now().valueOf() / 1000;
        // const iatExpired = isExpired && isExpired.exp && isExpired.exp < now;
        // if(iatExpired) {
        //     return { statusCode: 400, body: JSON.stringify({ status: false, message: 'Token expired' }) }
        // }
        // const database = (await clientPromise).db('diddyKongPinball');
        // const userExists = await database.collection('users').findOne({ username: isExpired.username});
        // if(!userExists) {
        //     return { statusCode: 500, body: JSON.stringify({ status: false, message: 'User not exists' }) }
        // }
        // return { statusCode: 200, body: JSON.stringify({ status: true, message: 'User logged', address: userExists.address, username: userExists.username }) }
        return { statusCode: 200, body: JSON.stringify({ status: true, message: 'User logged', address: '0x0', username: '0x0' }) }
        
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}