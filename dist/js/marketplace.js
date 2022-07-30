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
exports.Marketplace = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const constant_1 = require("./constant");
const idl = __importStar(require("./types/marketplace"));
const spl_token_1 = require("@solana/spl-token");
const getPDAs_1 = require("./getPDAs");
class Marketplace {
    constructor(provider, marketplacePDA) {
        // @ts-ignore
        this.program = new anchor.Program(idl, constant_1.MARKETPLACE_PROGRAM_ID, provider);
        this.marketplacePDA = marketplacePDA;
    }
    createMarketplace(owner, mint, fees, feesDestination) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketplacePDA = yield (0, getPDAs_1.getMarketplacePDA)(owner.publicKey);
            this.marketplacePDA = marketplacePDA;
            const test1 = yield (0, getPDAs_1.getStorePDA)(marketplacePDA);
            const test2 = yield (0, getPDAs_1.getEscrowPDA)(marketplacePDA, mint);
            console.log(test2.toBase58(), "escrowPDA0000000000000");
            console.log(test1.toBase58(), "storePDA0000000000000");
            // let createdMarketplace = await this.program.account.marketplace.fetch(marketplacePDA)
            const mPDAAccount = yield this.program.provider.connection.getAccountInfo(marketplacePDA);
            if (mPDAAccount != null) {
                console.log("Already created");
                return;
            }
            const escrowPDA = yield (0, getPDAs_1.getEscrowPDA)(marketplacePDA, mint);
            const ePDAAccount = yield this.program.provider.connection.getAccountInfo(escrowPDA);
            if (ePDAAccount != null) {
                console.log("Already created");
                return;
            }
            const storePDA = yield (0, getPDAs_1.getStorePDA)(marketplacePDA);
            const sPDAAccount = yield this.program.provider.connection.getAccountInfo(storePDA);
            if (sPDAAccount != null) {
                console.log("Already created");
                return;
            }
            return yield this.program.methods.createMarketplace(mint, fees, feesDestination, owner.publicKey).accounts({
                payer: owner.publicKey,
                marketplace: marketplacePDA,
                mint,
                escrow: escrowPDA,
                // store: storePDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([owner]).rpc();
        });
    }
    createCollection(authority, name, required_metadata_signer, collection_symbol, ignore_creators, fee) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectionPDA = yield (0, getPDAs_1.getCollectionPDA)(this.marketplacePDA, collection_symbol);
            const cPDAAccount = yield this.program.provider.connection.getAccountInfo(collectionPDA);
            if (cPDAAccount != null) {
                console.log("Already created collection");
                return;
            }
            if (!fee) {
                fee = null;
            }
            return yield this.program.methods.createCollection(collection_symbol, required_metadata_signer, fee, ignore_creators).accounts({
                authority: authority.publicKey,
                marketplace: this.marketplacePDA,
                collection: collectionPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([authority]).rpc();
        });
    }
    updateCollection(authority, collectionPDA, collectionFee, collectionName, required_metadata_signer, ignore_creators) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.program.methods.updateCollection()
            if (!collectionFee) {
                collectionFee = null;
            }
            if (!collectionName) {
                collectionName = null;
            }
            if (!required_metadata_signer) {
                required_metadata_signer = null;
            }
            // if (!ignore_creators) {
            //     ignore_creators = null
            // }
            console.log(collectionFee, collectionName, required_metadata_signer, ignore_creators, "vanila");
            return yield this.program.methods.updateCollection(collectionFee, collectionName, required_metadata_signer, ignore_creators).accounts({
                authority: authority.publicKey,
                marketplace: this.marketplacePDA,
                collection: collectionPDA,
            }).signers([authority]).rpc();
        });
    }
}
exports.Marketplace = Marketplace;
//# sourceMappingURL=marketplace.js.map