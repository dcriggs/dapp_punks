import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json';

// Config: Import your network config here
import config from '../config.json';

const Mint = ({ provider, nft, cost, setIsLoading }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [mintAmount, setMintAmount] = useState(0);
  // _mintAmount > 0 && _mintAmount <= 5

  useEffect(() => {
    const checkWhitelist = async () => {
      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(config[31337].nft.address, NFT_ABI, signer);
        const address = await signer.getAddress();
        const whitelisted = await contract.isWhitelisted(address);
        setIsWhitelisted(whitelisted);
      } catch (error) {
        console.error('Error checking whitelist:', error);
      }
    };

    checkWhitelist();
  }, [provider]);

  const mintHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      // Validate mint amount
      if (mintAmount > 0 && mintAmount <= 5) {
        const signer = await provider.getSigner();
        const transaction = await nft.connect(signer).mint(mintAmount, { value: cost * mintAmount });
        await transaction.wait();
        window.alert('Tokens minted successfully!');
      } else {
        throw new Error('Mint amount must be greater than zero and less than or equal to five');
      }
    } catch (error) {
      console.error('Error minting tokens:', error.message);
      window.alert('Failed to mint tokens: ' + error.message);
    }

    setIsWaiting(false);
  };

  return (
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      {isWaiting ? (
        <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
      ) : isWhitelisted ? (
        <>
          <Form.Group>
            <Form.Control
              type="number"
              placeholder="Enter Token ID"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <Button variant="primary" type="submit" style={{ width: '100%' }}>
              Mint
            </Button>
          </Form.Group>
        </>
      ) : (
        <Form.Group>
          <Button variant="warning" disabled style={{ width: '100%' }}>
            Not Whitelisted
          </Button>
        </Form.Group>
      )}
    </Form>
  );
};

export default Mint;
