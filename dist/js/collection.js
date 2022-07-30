"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const constant_1 = require("./constant");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const getPDAs_1 = require("./getPDAs");
const metaplex_1 = require("./metaplex");
const js_1 = require("@metaplex/js");
const idl = __importStar(require("./types/marketplace"));
const anchor_1 = require("@project-serum/anchor");
const { Metadata } = js_1.programs.metadata;
class Collection {
    constructor(provider, marketplacePDA, collectionPDA) {
        // @ts-ignore
        this.program = new anchor.Program(idl, constant_1.MARKETPLACE_PROGRAM_ID, provider);
        this.marketplacePDA = marketplacePDA;
        this.collectionPDA = collectionPDA;
    }
    sellAssetInstruction(nftMint, sellerNftAccount, sellerDestination, price, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const programNftVaultPDA = yield (0, getPDAs_1.getNftVaultPDA)(nftMint);
            const sellOrderPDA = yield (0, getPDAs_1.getSellOrderPDA)(sellerNftAccount, price);
            const metadataPDA = yield Metadata.getPDA(nftMint);
            return yield this.program.methods.createSellOrder(price, amount, sellerDestination).accounts({
                payer: seller,
                sellerNftTokenAccount: sellerNftAccount,
                marketplace: this.marketplacePDA,
                collection: this.collectionPDA,
                mint: nftMint,
                metadata: metadataPDA,
                vault: programNftVaultPDA,
                sellOrder: sellOrderPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).instruction();
        });
    }
    sellAsset(nftMint, sellerNftAccount, sellerDestination, price, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield this.sellAssetInstruction(nftMint, sellerNftAccount, sellerDestination, price, amount, seller.publicKey);
            return this._sendInstruction(ix, [seller]);
        });
    }
    removeSellOrderInstruction(nftMint, sellerNftAccount, sellOrderPDA, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const programNftVaultPDA = yield (0, getPDAs_1.getNftVaultPDA)(nftMint);
            return yield this.program.methods.removeSellOrder(amount).accounts({
                authority: seller,
                sellerNftTokenAccount: sellerNftAccount,
                vault: programNftVaultPDA,
                sellOrder: sellOrderPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).instruction();
        });
    }
    removeSellOrder(nftMint, sellerNftAccount, sellOrderPDA, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield this.removeSellOrderInstruction(nftMint, sellerNftAccount, sellOrderPDA, amount, seller.publicKey);
            return this._sendInstruction(ix, [seller]);
        });
    }
    addToSellOrderInstruction(nftMint, sellerNftAccount, sellOrderPDA, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const programNftVaultPDA = yield (0, getPDAs_1.getNftVaultPDA)(nftMint);
            return yield this.program.methods.addQuantityToSellOrder(amount).accounts({
                authority: seller,
                sellerNftTokenAccount: sellerNftAccount,
                vault: programNftVaultPDA,
                sellOrder: sellOrderPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).instruction();
        });
    }
    addToSellOrder(nftMint, sellerNftAccount, sellOrderPDA, amount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield this.addToSellOrderInstruction(nftMint, sellerNftAccount, sellOrderPDA, amount, seller.publicKey);
            return this._sendInstruction(ix, [seller]);
        });
    }
    buyInstruction(nftMint, sellOrdersPDA, buyerNftAccount, buyerPayingAccount, wanted_quantity, buyer) {
        return __awaiter(this, void 0, void 0, function* () {
            const programNftVaultPDA = yield (0, getPDAs_1.getNftVaultPDA)(nftMint);
            const marketplaceAccount = yield this.program.account.marketplace.fetch(this.marketplacePDA);
            const metadata = yield (0, metaplex_1.getMetadata)(anchor.getProvider().connection, nftMint);
            // let metadataPDA = await Metadata.getPDA(nftMint)
            const collection = yield this.getCollection();
            const creatorsAccounts = [];
            if (!collection.ignoreCreatorFee) {
                for (const creator of metadata.data.creators) {
                    const creatorAddress = new web3_js_1.PublicKey(creator.address);
                    const creatorATA = yield (0, getPDAs_1.getAssociatedTokenAddress)(creatorAddress, marketplaceAccount.mint);
                    creatorsAccounts.push({ pubkey: creatorATA, isWritable: true, isSigner: false });
                }
            }
            const sellOrders = [];
            for (const sellOrderPDA of sellOrdersPDA) {
                const so = yield this.program.account.sellOrder.fetch(sellOrderPDA);
                sellOrders.push({ pubkey: sellOrderPDA, isWritable: true, isSigner: false });
                sellOrders.push({ pubkey: so.destination, isWritable: true, isSigner: false });
            }
            return yield this.program.methods.buy(wanted_quantity).accounts({
                buyer,
                buyerNftTokenAccount: buyerNftAccount,
                buyerPayingTokenAccount: buyerPayingAccount,
                marketplace: this.marketplacePDA,
                marketplaceDestAccount: marketplaceAccount.feesDestination,
                collection: this.collectionPDA,
                // metadata: await Metadata.getPDA(metadata.mint),
                metadata: yield Metadata.getPDA(nftMint),
                vault: programNftVaultPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            }).remainingAccounts([
                ...creatorsAccounts,
                ...sellOrders,
            ]).instruction();
        });
    }
    buy(nftMint, sellOrdersPDA, buyerNftAccount, buyerPayingAccount, wanted_quantity, buyer) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield this.buyInstruction(nftMint, sellOrdersPDA, buyerNftAccount, buyerPayingAccount, wanted_quantity, buyer.publicKey);
            return this._sendInstruction(ix, [buyer]);
        });
    }
    getCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collectionCache) {
                return this.collectionCache;
            }
            this.collectionCache = yield this.program.account.collection.fetch(this.collectionPDA);
            return this.collectionCache;
        });
    }
    _sendInstruction(ix, signers) {
        const tx = new anchor_1.web3.Transaction();
        tx.add(ix);
        return this.program.provider.send(tx, signers);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map