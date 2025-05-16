// verify both length, regex and format of a solana wallet address
export const isSolanaWalletAddress = (address: string) => {
    const addressLength = address.length;
    if (addressLength < 32 || addressLength > 44) {
        return false;
    }
    const solanaWalletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaWalletRegex.test(address);
}