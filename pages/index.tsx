import {
  Typography,
  Box,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { Web3, Contract } from 'web3';
import { useWeb3Context } from 'web3-react';
import ERC20 from '../src/abi/wrapPulse.json';

function Overview(): JSX.Element {
  const context = useWeb3Context();
  const [fromNetwork, setFromNetwork] = React.useState('');
  const [toNetwork, setToNetwork] = React.useState('');
  const [account, setAccount] = React.useState('');
  const [price, setPrice] = React.useState(1);
  const [processing, setProcessing] = React.useState(false);
  const networkData = [
    {
      name: 'PLS',
      network: 'Pulse Chain',
      chainId: '369',
      rpc: 'https://rpc.pulsechain.com',
      sendAccount: true,
    },
    {
      name: 'WPLS',
      network: 'CatColor',
      chainId: '6544',
      rpc: 'http://164.163.9.140:8545',
      sendAccount: false,
    },
  ];
  useEffect(() => {
    const handleSetAccount = async () => {
      const chainId = parseInt(
        // @ts-ignore
        await window.ethereum.request({ method: 'eth_chainId' }),
        16
      );
      if (chainId) {
        const networkConnected = networkData.find(
          (item) => item.chainId === `${chainId}`
        );
        const networkTo = networkData.find(
          (item) => item.chainId !== `${chainId}`
        );
        setFromNetwork(networkConnected?.name as string);
        setToNetwork(networkTo?.name as string);
      }
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      // @ts-ignore
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    };
    handleSetAccount();
  }, []);
  const handleChange = (event: SelectChangeEvent) => {
    setFromNetwork(event.target.value);
    const networkTo = networkData.find(
      (item) => item.name !== `${event.target.value}`
    );
    setToNetwork(networkTo?.name as string);
  };
  const handleMetaMask = async () => {
    try {
      // @ts-ignore
      if (window && window.ethereum && window.ethereum.isMetaMask) {
        const networkSearch = networkData.find(
          (item) => item.name === `${fromNetwork}`
        );
        // @ts-ignore
        const web3 = new Web3(window.ethereum);
        if (networkSearch?.sendAccount === true) {
          const balance = await web3.eth.getBalance(account);
          if (Number(balance) < Number(web3.utils.toWei(`${price}`, 'ether'))) {
            alert(`Você não tem saldo suficiente para fazer essa transação`);
            return;
          }
          const chainId = parseInt(
            // @ts-ignore
            await window.ethereum.request({ method: 'eth_chainId' }),
            16
          );

          const networkConnected = networkData.find(
            (item) => item.chainId === `${chainId}`
          );
          if (!networkConnected) {
            alert(`Esta rede que você esta conectado não é suportada`);
            return;
          }
          if (networkSearch?.chainId !== `${chainId}`) {
            alert(
              `Você esta conectado a rede ${networkConnected?.network}, você precisa estar conectado a rede ${networkSearch?.network} para fazer a troca`
            );
            return;
          }
          setProcessing(true);
          const tx = await web3.eth.sendTransaction({
            from: account,
            to: process.env.NEXT_PUBLIC_TO_ADDRESS,
            value: web3.utils.toWei(`${price}`, 'ether'),
          });
          if (tx && tx.transactionHash) {
            alert(`Transação enviada com sucesso, aguarde a confirmação`);
            const result = await axios.post(
              '/api/transaction',
              {
                hash: tx.transactionHash,
                fromNetwork: fromNetwork,
                toNetwork: toNetwork,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        } else {
          const contract = new Contract(
            ERC20,
            process.env.NEXT_PUBLIC_CONTRACT_WRAP_ADDRESS,
            web3
          );
          const [gasPrice] = await Promise.all([web3.eth.getGasPrice()]);
          const txTransfer = contract.methods.withdraw(
            // @ts-ignore
            web3.utils.toWei(`${price}`, 'ether')
          );

          const data = txTransfer.encodeABI();
          const tx = await web3.eth.sendTransaction({
            to: process.env.NEXT_PUBLIC_CONTRACT_WRAP_ADDRESS,
            from: account,
            data: data,
            gasPrice,
          });
          if (tx && tx.transactionHash) {
            alert(`Transação enviada com sucesso, aguarde a confirmação`);
            await axios.post(
              '/api/transaction',
              {
                hash: tx.transactionHash,
                fromNetwork: fromNetwork,
                toNetwork: toNetwork,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        }
        setProcessing(false);
      }
    } catch (error) {
      setProcessing(false);
      alert(error as string);
    }
  };

  return (
    <>
      <Head>
        <title>ASaiiii</title>
      </Head>
      <>
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap={'wrap'}
            minHeight="100vh">
            <Box
              sx={{
                width: 561,
                height: 393,
                borderRadius: 1,
                borderColor: 'primary.main',
                border: '1px solid',
                padding: 2,
              }}>
              <Typography
                sx={{
                  textAlign: 'center',
                  marginBottom: 2,
                }}>
                Envie tokens de uma rede para outra{'\r\n'}
              </Typography>
              <FormControl sx={{ m: 1, width: 'calc(100% - 230px)' }}>
                <TextField
                  id="outlined-basic"
                  type="number"
                  label="You Send"
                  defaultValue={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  variant="outlined"
                  sx={{
                    width: '100%',
                    borderRadius: '0px !important',
                  }}
                />
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 80 }}>
                <InputLabel id="demo-simple-select-autowidth-label">
                  Network
                </InputLabel>
                <Select
                  labelId="demo-simple-select-autowidth-label"
                  id="demo-simple-select-autowidth"
                  value={fromNetwork}
                  onChange={handleChange}
                  sx={{
                    width: 190,
                  }}
                  label="Network">
                  <MenuItem value={'PLS'}>PLS (Pulse Chain)</MenuItem>
                  <MenuItem value={'WPLS'}>WPLS (Cat Color)</MenuItem>
                </Select>
              </FormControl>
              {fromNetwork && (
                <Typography
                  sx={{
                    textAlign: 'center',
                    marginBottom: 2,
                  }}>
                  Você esta enviando{' '}
                  <strong>
                    {price}{' '}
                    {
                      networkData.find((item) => item.name === fromNetwork)
                        ?.name
                    }
                  </strong>{' '}
                  na rede{' '}
                  {
                    networkData.find((item) => item.name === fromNetwork)
                      ?.network
                  }
                  <br></br>e vai receber{' '}
                  <strong>
                    {price}{' '}
                    {
                      networkData.find((item) => item.name !== fromNetwork)
                        ?.name
                    }
                  </strong>{' '}
                  na rede{' '}
                  {
                    networkData.find((item) => item.name !== fromNetwork)
                      ?.network
                  }
                </Typography>
              )}
              <LoadingButton
                sx={{
                  width: '100%',
                }}
                loading={processing}
                onClick={handleMetaMask}
                variant="contained"
                size="large"
                color="success">
                Exchange
              </LoadingButton>
              <Box
                sx={{
                  textAlign: 'center',
                  marginTop: 2,
                }}>
                <strong>Conectado:</strong>
                <br></br>
                {'\r\n'}
                {account ? `${account}` : 'Não conectado'}
                <br></br>
                {fromNetwork} - {toNetwork}
              </Box>
            </Box>
          </Box>
        </Container>
      </>
    </>
  );
}

export default Overview;
