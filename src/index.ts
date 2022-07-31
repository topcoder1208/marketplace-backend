import { Wallet, Provider, Program } from '@project-serum/anchor';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js'

import * as splToken from '@solana/spl-token';
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { adminWallet, mintPubkey } from './config'

import { Marketplace } from './js/marketplace';
import { getCollectionPDA, getMarketplacePDA, getEscrowPDA } from './js/getPDAs'
import { Collection } from "./js/collection";

const CreateMarketplace = async () => {
    const connection = new Connection(clusterApiUrl("devnet"));

    const admin = Keypair.fromSecretKey(new Uint8Array(adminWallet));
    const anchorWallet = new Wallet(admin);

    let provider = new Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });

    const marketplaceMint = new splToken.Token(
        provider.connection,
        mintPubkey,
        splToken.TOKEN_PROGRAM_ID,
        admin
    );

    let adminTokenAccount = await Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, marketplaceMint.publicKey, admin.publicKey);
    const adminAccountInfo = await provider.connection.getAccountInfo(adminTokenAccount)
    if (adminAccountInfo === null) {
        await marketplaceMint.createAssociatedTokenAccount(
            admin.publicKey,
        );
        let adminNftATA = (await marketplaceMint.getOrCreateAssociatedAccountInfo(admin.publicKey)).address
        // console.log(adminNftATA, "adminNftATA----")
    } else {
        // console.log("already created.")
    }


    console.log(marketplaceMint.publicKey.toBase58(), "MarkeplaceMintPubkey")

    let marketplace = new Marketplace(provider);
    await marketplace.createMarketplace(admin, marketplaceMint.publicKey, 5, adminTokenAccount)

    let creator = new PublicKey("5VYKujK4C59nB8mD9ZjidF1zpQdVWPC7SietFos6yJFj");  // candy machine id
    let symbol = new PublicKey("5VYKujK4C59nB8mD9ZjidF1zpQdVWPC7SietFos6yJFj");

    await marketplace.createCollection(admin, creator, symbol, true)

    console.log(marketplace.marketplacePDA.toBase58(), "marketplacePDA");

    let collectionPDA = await getCollectionPDA(marketplace.marketplacePDA, symbol);
    let collection = new Collection(provider, marketplace.marketplacePDA, collectionPDA);
    let result = await collection.getCollection();

    console.log(result.symbol.toBase58(), "collection");

}

const UpdateCollection = async () => {

    const connection = new Connection(clusterApiUrl("devnet"));

    const admin = Keypair.fromSecretKey(new Uint8Array(adminWallet));
    const anchorWallet = new Wallet(admin);

    let provider = new Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });

    const marketplacePDA = new PublicKey("F4wMQYWFz2RHNZJ1m6pMKuKmdAzaW2oDJqEQmpeSQA2b");
    let marketplace = new Marketplace(provider, marketplacePDA);

    let symbol = new PublicKey("5VYKujK4C59nB8mD9ZjidF1zpQdVWPC7SietFos6yJFj");
    let collectionPDA = await getCollectionPDA(marketplace.marketplacePDA, symbol);

    let creator = new PublicKey("5VYKujK4C59nB8mD9ZjidF1zpQdVWPC7SietFos6yJFj");

    await marketplace.updateCollection(admin, collectionPDA, null, null, creator, true)

    let collection = new Collection(provider, marketplace.marketplacePDA, collectionPDA);
    let result = await collection.getCollection();

    console.log("success")
    console.log(result);
}

const createCollection = async () => {
    const connection = new Connection(clusterApiUrl("devnet"));

    const admin = Keypair.fromSecretKey(new Uint8Array(adminWallet));
    const anchorWallet = new Wallet(admin);

    let provider = new Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });

    const marketplaceMint = new splToken.Token(
        provider.connection,
        mintPubkey,
        splToken.TOKEN_PROGRAM_ID,
        admin
    );

    let symbol = new PublicKey("9KWfWmPsmGokcBsKZ9Ub8ZMLitW5sqQaeNbjiHP4qu6D"); // candy machine
    let creator = new PublicKey("9KWfWmPsmGokcBsKZ9Ub8ZMLitW5sqQaeNbjiHP4qu6D");

    let marketplace = new Marketplace(provider);
    const marketplacePDA = new PublicKey('F4wMQYWFz2RHNZJ1m6pMKuKmdAzaW2oDJqEQmpeSQA2b');

    marketplace.marketplacePDA = marketplacePDA;

    await marketplace.createCollection(admin, creator, symbol, true)

    let collectionPDA = await getCollectionPDA(marketplacePDA, symbol);
    let collection = new Collection(provider, marketplacePDA, collectionPDA);
    let result = await collection.getCollection();

    console.log(result.symbol.toBase58(), "collection");
}

// CreateMarketplace();
// UpdateCollection();
createCollection();
