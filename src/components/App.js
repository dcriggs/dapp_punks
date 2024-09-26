import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

// IMG
import preview from '../preview.png';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Loading from './Loading';
import Whitelist from './Whitelist';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNFT] = useState(null)

  const [account, setAccount] = useState(null)
  const [owner, setOwner] = useState(null)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const [lastMintedTokenId, setLastMintedTokenId] = useState('');
  const [userMintedTokens, setUserMintedTokens] = useState([]);

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Initiate contract
    const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
    setNFT(nft)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch Countdown
    const allowMintingOn = await nft.allowMintingOn()
    setRevealTime(allowMintingOn.toString() + '000')

    // Fetch maxSupply
    setMaxSupply(await nft.maxSupply())

    // Fetch totalSupply
    setTotalSupply(await nft.totalSupply())

    // Fetch cost
    setCost(await nft.cost())

    // Fetch account balance
    setBalance(await nft.balanceOf(account))

    // Fetch contract owner
    setOwner(await nft.owner())

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  useEffect(() => {
    async function getLastMintedTokenId() {
      if (nft && account) {
        // Get the total number of tokens minted by the user
        const tokenCount = await nft.balanceOf(account);

        // Iterate to find the last minted token ID
        let lastTokenId = ethers.constants.Zero;
        for (let i = tokenCount - 1; i >= 0; i--) {
          const tokenId = await nft.tokenOfOwnerByIndex(account, i);
          lastTokenId = tokenId;
          // Assuming you want to find the very last minted token ID
          break;
        }

        setLastMintedTokenId(lastTokenId.toString());
      }
    }

    async function getUserMintedTokens() {
      if (nft && account) {
        const tokenCount = await nft.balanceOf(account);
        const tokens = [];

        for (let i = 0; i < tokenCount; i++) {
          const tokenId = await nft.tokenOfOwnerByIndex(account, i);
          tokens.push(tokenId.toString());
        }

        setUserMintedTokens(tokens);
      }
    }

    getLastMintedTokenId();
    getUserMintedTokens();
  }, [nft, account]);

  return (
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Dawson's Dapp Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
              {balance > 0 ? (
                <div className='text-center'>
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${lastMintedTokenId.toString()}.png`}
                    alt="Open Punk"
                    width="400px"
                    height="400px"
                  />
                </div>
              ) : (
                <img src={preview} alt="" />
              )}
            </Col>

            <Col>
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                setIsLoading={setIsLoading}
              />
            </Col>
          </Row>
          <Row>
            {balance > 0 && (
              <div>
                <h3 className="text-center">User Minted Tokens:</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {userMintedTokens.map((tokenId, index) => (
                    <img
                      key={index}
                      src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenId}.png`}
                      alt={`Token ID ${tokenId}`}
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Row>
          <Row>
            {owner === account && (
              <Container>
                <br />
                <h3 className="text-center">Contract Admin Functions (Owner Only)</h3>
                <Whitelist
                  provider={provider}
                  nft={nft}
                  setIsLoading={setIsLoading}
                />
              </Container>
            )}
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
