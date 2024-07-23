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
      const signer = await provider.getSigner();
      const transaction = await nft.connect(signer).mint(1, { value: cost });
      await transaction.wait();
    } catch {
      window.alert('User rejected or transaction reverted');
    }

    setIsLoading(true);
  };

  return (
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      {isWaiting ? (
        <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
      ) : isWhitelisted ? (
        <Form.Group>
          <Button variant="primary" type="submit" style={{ width: '100%' }}>
            Mint
          </Button>
        </Form.Group>
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
