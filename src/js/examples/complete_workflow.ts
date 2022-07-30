import * as anchor from '@project-serum/anchor'
import { Marketplace } from '../marketplace'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getCollectionPDA, getMarketplacePDA, getSellOrderPDA } from '../getPDAs'
import { Token } from '@solana/spl-token'
import { nft_data, nft_json_url } from '../../tests/data'
import { createMint } from '../../tests/utils/utils'
import * as splToken from '@solana/spl-token'
import { Collection } from '../collection'

const provider = anchor.Provider.local('https://api.devnet.solana.com')
anchor.setProvider(provider)

async function workflow(marketplaceMint: PublicKey, nftMint: PublicKey) {
    const marketplacePDA = await getMarketplacePDA(
        anchor.Wallet.local().payer.publicKey
    )
    const marketplace = new Marketplace(provider, marketplacePDA)

    await marketplace.createMarketplace(
        anchor.Wallet.local().payer,
        marketplaceMint,
        5,
        await getAssociatedTokenAddress(
            anchor.Wallet.local().payer.publicKey,
            marketplaceMint,
        )
    )

    await marketplace.createCollection(
        anchor.Wallet.local().payer,
        'aurorian',
        anchor.Wallet.local().payer.publicKey,
        'AURY',
        true,
        2,
    )


    const collectionPDA = await getCollectionPDA(marketplace.marketplacePDA, 'AURY')
    const userNftAccount = await getAssociatedTokenAddress(anchor.Wallet.local().payer.publicKey, nftMint)
    const userTokenAccount = await getAssociatedTokenAddress(anchor.Wallet.local().payer.publicKey, marketplaceMint)

    const collection = new Collection(provider, marketplace.marketplacePDA, collectionPDA)

    const sellPrice = new anchor.BN(1000)
    const sellQuantity = new anchor.BN(1)


    await collection.sellAsset(
        nftMint,
        userNftAccount,
        userTokenAccount,
        sellPrice,
        sellQuantity,
        anchor.Wallet.local().payer
    )

    // We buy our own asset just for demonstration
    await collection.buy(
        nftMint,
        [await getSellOrderPDA(userNftAccount, sellPrice)],
        userNftAccount,
        userTokenAccount,
        sellQuantity,
        anchor.Wallet.local().payer
    )
}

async function mintMeNft(): Promise<PublicKey> {
    const data = nft_data(anchor.Wallet.local().payer.publicKey)
    const json_url = nft_json_url
    const lamports = await Token.getMinBalanceRentForExemptMint(
        provider.connection
    )
    const [mint, metadataAddr, tx] = await createMint(
        anchor.Wallet.local().payer.publicKey,
        anchor.Wallet.local().payer.publicKey,
        lamports,
        data,
        json_url
    )
    const signers = [mint, anchor.Wallet.local().payer]
    await provider.send(tx, signers)

    return mint.publicKey
}

async function setup() {
    const fromAirdropSignature = await provider.connection.requestAirdrop(
        anchor.Wallet.local().payer.publicKey,
        anchor.web3.LAMPORTS_PER_SOL,
    )
    await provider.connection.confirmTransaction(fromAirdropSignature)

    const nftMint: PublicKey = await mintMeNft()
    const marketplaceMint = await splToken.Token.createMint(
        provider.connection,
        anchor.Wallet.local().payer,
        anchor.Wallet.local().payer.publicKey,
        null,
        6,
        splToken.TOKEN_PROGRAM_ID,
    )

    const ata = await marketplaceMint.getOrCreateAssociatedAccountInfo(
        anchor.Wallet.local().payer.publicKey
    )
    await marketplaceMint.mintTo(ata.address, anchor.Wallet.local().payer, [], 1000)
    return [marketplaceMint.publicKey, nftMint]
}

(async () => {
    const [marketplaceMint, nftMint] = await setup()

    await workflow(
        marketplaceMint,
        nftMint
    )
})()
