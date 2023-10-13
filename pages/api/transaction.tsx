import clientPromise from '../../lib/mongodb';

export default async (
  req: any,
  res: { json: (arg0: { status: string; message: string }) => void }
) => {
  try {
    const body = req.body;
    if (!body || !body.hash || !body.fromNetwork || !body.toNetwork) {
      res.json({
        status: 'error',
        message: 'Parametro inválido',
      });
      return;
    }
    const client = await clientPromise;
    const db = client.db('bridge');
    const transactionExist = await db
      .collection('transactions')
      .find({
        hash: body.hash,
      })
      .toArray();
    if (transactionExist.length) {
      res.json({
        status: 'error',
        message: 'Já cadastrado',
      });
      return;
    }
    const inserted = await db.collection('transactions').insertOne({
      hash: body.hash,
      fromNetwork: body.fromNetwork,
      toNetwork: body.toNetwork,
      status: 'pending', // done or pending
    });

    res.json({
      status: 'success',
      message: `Criado com sucesso (${inserted.insertedId})`,
    });
  } catch (e) {
    res.json({
      status: 'error',
      message: e as string,
    });
  }
};
