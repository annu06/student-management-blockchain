import { Box, Button, Chip, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWallet } from '../hooks/use-wallet';

const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const WalletConnect = () => {
  const { account, isConnected, isConnecting, error, connect, disconnect, isMetaMaskInstalled } =
    useWallet();

  if (!isMetaMaskInstalled) {
    return (
      <Typography color="error" variant="body2">
        MetaMask is not installed.{' '}
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          Install MetaMask
        </a>
      </Typography>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {isConnected ? (
        <>
          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={shorten(account as string)}
            color="success"
            variant="outlined"
          />
          <Button size="small" variant="text" color="error" onClick={disconnect}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
    </Box>
  );
};
