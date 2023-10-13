const { Web3 } = require("web3");
const { MongoClient } = require('mongodb');
const { schedule } = require("@netlify/functions")
const walletAddress = '0x88dC48C3B6EfcedcDac9F299D044c86329322160';
const adminPrivKey = '0x1463f8c2103170350063f544dce54ca8865e256863a594f0cfc8e1863dabb8d3';
const client = new MongoClient('mongodb://164.163.9.198/bridge?authSource=admin')


class TransactionChecker {
    sent: any[];
    address: any;
    web3: any;
    web3CatColor: any;
    adminAddress: any;
    clientPromise: any;
    client: null;
    blocInit: number;
    lastBlock: number;
    constructor(address: string) {
        this.sent = [],
        this.address = address.toLowerCase();
        this.web3 = new Web3("http://164.163.9.140:8545");
        this.web3CatColor = new Web3(new Web3.providers.HttpProvider('https://rpc.pulsechain.com'));
        this.adminAddress = this.web3CatColor.eth.accounts.privateKeyToAccount(adminPrivKey);
        this.clientPromise = client.connect();
        this.client = null;
        this.blocInit = 0;
        this.lastBlock = 0;
    }
async checkBlock() {
    this.client = await this.clientPromise;
    const db = client.db("bridge");
    let transactionExecutingHash = null;
    try {
        
        const transactions = await db
            .collection("transactions")
            .find({
                status: 'pending',
                fromNetwork: 'WPLS',
                toNetwork: 'PLS'
            })
            .toArray();
        console.log(transactions);
        for (const transaction of transactions) {
            let tx = await this.web3.eth.getTransaction(transaction.hash);
            console.log(tx);
            return;
            transactionExecutingHash = transaction.hash;
            const decoded = this.web3.eth.abi.decodeParameters(
                ["address", "uint256"],
                `0x${tx.input.substring(10)}`
            );
            tx.to = tx.from;
            tx.value = decoded[1];
            console.log(tx);
            if (tx && tx.to && this.address === tx.to.toLowerCase() && !this.sent.includes(tx.hash)) {
                // colocar como enviado
                this.sent.push(tx.hash);
                const [gasPrice] = await Promise.all([
                    this.web3CatColor.eth.getGasPrice(),
                ]);
                const txData = {
                    from: this.adminAddress.address,
                    to: tx.from,
                    value: tx.value,
                    data: tx.input,
                    gasPrice
                
                };
                const signed = await this.web3CatColor.eth.accounts.signTransaction(txData, adminPrivKey);
                await this.web3CatColor.eth.sendSignedTransaction(signed.rawTransaction);
                await db
                    .collection("transactions")
                    .updateOne({ hash: transaction.hash }, { $set: { status: 'done' } });
            }
        }
        
    } catch (error) {
        await db
            .collection("transactions")
            .updateOne({ hash: transactionExecutingHash }, { $set: { status: 'error' } });
        console.log(error)   
    }
  }
}

export const handler = schedule('* * * * *', async () => {
    try {
        const transactionChecker = new  TransactionChecker(walletAddress);
        transactionChecker.checkBlock();
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
        console.log('Build hook response:')
        return {
            statusCode: 200
          }
        
    } catch (error: any) {
        return { statusCode: 500, body: error.toString() }
    }
});
