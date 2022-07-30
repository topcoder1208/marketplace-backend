import * as anchor from '@project-serum/anchor'
import { Marketplace as MarketplaceDefinition } from './types/marketplace'
import { MARKETPLACE_PROGRAM_ID } from './constant'
import * as idl from './types/marketplace'

import { Keypair, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getCollectionPDA, getMarketplacePDA, getEscrowPDA, getStorePDA } from './getPDAs'

export class Marketplace {
    program: anchor.Program<MarketplaceDefinition>
    marketplacePDA: PublicKey
    marketplace: Marketplace

    constructor(provider: anchor.Provider, marketplacePDA?: PublicKey) {
        // @ts-ignore
        this.program = new anchor.Program(idl, MARKETPLACE_PROGRAM_ID, provider,)
        this.marketplacePDA = marketplacePDA
    }

    async createMarketplace(
        owner: Keypair,
        mint: PublicKey,
        fees: number,
        feesDestination: PublicKey,
    ): Promise<string> {
        const marketplacePDA = await getMarketplacePDA(owner.publicKey)
        this.marketplacePDA = marketplacePDA

        const test1 = await getStorePDA(marketplacePDA);
        const test2 = await getEscrowPDA(marketplacePDA, mint);

        console.log(test2.toBase58(), "escrowPDA0000000000000");
        // console.log(test1.toBase58(), "storePDA0000000000000");
        // let createdMarketplace = await this.program.account.marketplace.fetch(marketplacePDA)

        const mPDAAccount = await this.program.provider.connection.getAccountInfo(marketplacePDA);
        if (mPDAAccount != null) {
            console.log("Already created")
            return;
        }

        const escrowPDA = await getEscrowPDA(marketplacePDA, mint)
        const ePDAAccount = await this.program.provider.connection.getAccountInfo(escrowPDA);
        if (ePDAAccount != null) {
            console.log("Already created")
            return;
        }

        let [storePDA, store_nonce] = await getStorePDA(this.marketplacePDA);
        const sPDAAccount = await this.program.provider.connection.getAccountInfo(storePDA);
        if (sPDAAccount != null) {
            console.log("Already created")
            return;
        }

       

        return await this.program.methods.createMarketplace(mint, fees, feesDestination, owner.publicKey).accounts(
            {
                payer: owner.publicKey,
                marketplace: marketplacePDA,
                mint,
                escrow: escrowPDA,
                // store: storePDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }
        ).signers([owner]).rpc();
    }

    async createCollection(
        authority: Keypair,
        required_metadata_signer: PublicKey,
        collection_symbol: PublicKey,
        ignore_creators: boolean,
        fee?: number,
    ): Promise<string> {

        const collectionPDA = await getCollectionPDA(this.marketplacePDA, collection_symbol);
        const cPDAAccount = await this.program.provider.connection.getAccountInfo(collectionPDA);
        if (cPDAAccount != null) {
            console.log("Already created collection")
            return;
        }
        if (!fee) {
            fee = null
        }
        
        return await this.program.methods.createCollection(collection_symbol, required_metadata_signer, fee, ignore_creators).accounts(
            {
                authority: authority.publicKey,
                marketplace: this.marketplacePDA,
                collection: collectionPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([authority]).rpc()
    }

    async updateCollection(
        authority: Keypair,
        collectionPDA: PublicKey,
        collectionFee?: number,
        collectionName?: PublicKey,
        required_metadata_signer?: PublicKey,
        ignore_creators?: boolean
    ) {
        // this.program.methods.updateCollection()
        if (!collectionFee) {
            collectionFee = null
        }
        if (!collectionName) {
            collectionName = null
        }
        if (!required_metadata_signer) {
            required_metadata_signer = null
        }
        // if (!ignore_creators) {
        //     ignore_creators = null
        // }

        console.log(collectionFee, collectionName, required_metadata_signer, ignore_creators, "vanila")

        return await this.program.methods.updateCollection(collectionFee, collectionName, required_metadata_signer, ignore_creators).accounts({
            authority: authority.publicKey,
            marketplace: this.marketplacePDA,
            collection: collectionPDA,
        },
        ).signers([authority]).rpc()
    }
}
