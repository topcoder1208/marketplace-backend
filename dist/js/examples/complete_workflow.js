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
const anchor = __importStar(require("@project-serum/anchor"));
const marketplace_1 = require("../marketplace");
const getPDAs_1 = require("../getPDAs");
const spl_token_1 = require("@solana/spl-token");
const data_1 = require("../../tests/data");
const utils_1 = require("../../tests/utils/utils");
const splToken = __importStar(require("@solana/spl-token"));
const collection_1 = require("../collection");
const provider = anchor.Provider.local('https://api.devnet.solana.com');
anchor.setProvider(provider);
function workflow(marketplaceMint, nftMint) {
    return __awaiter(this, void 0, void 0, function* () {
        const marketplacePDA = yield (0, getPDAs_1.getMarketplacePDA)(anchor.Wallet.local().payer.publicKey);
        const marketplace = new marketplace_1.Marketplace(provider, marketplacePDA);
        yield marketplace.createMarketplace(anchor.Wallet.local().payer, marketplaceMint, 5, yield (0, getPDAs_1.getAssociatedTokenAddress)(anchor.Wallet.local().payer.publicKey, marketplaceMint));
        yield marketplace.createCollection(anchor.Wallet.local().payer, 'aurorian', anchor.Wallet.local().payer.publicKey, 'AURY', true, 2);
        const collectionPDA = yield (0, getPDAs_1.getCollectionPDA)(marketplace.marketplacePDA, 'AURY');
        const userNftAccount = yield (0, getPDAs_1.getAssociatedTokenAddress)(anchor.Wallet.local().payer.publicKey, nftMint);
        const userTokenAccount = yield (0, getPDAs_1.getAssociatedTokenAddress)(anchor.Wallet.local().payer.publicKey, marketplaceMint);
        const collection = new collection_1.Collection(provider, marketplace.marketplacePDA, collectionPDA);
        const sellPrice = new anchor.BN(1000);
        const sellQuantity = new anchor.BN(1);
        yield collection.sellAsset(nftMint, userNftAccount, userTokenAccount, sellPrice, sellQuantity, anchor.Wallet.local().payer);
        // We buy our own asset just for demonstration
        yield collection.buy(nftMint, [yield (0, getPDAs_1.getSellOrderPDA)(userNftAccount, sellPrice)], userNftAccount, userTokenAccount, sellQuantity, anchor.Wallet.local().payer);
    });
}
function mintMeNft() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (0, data_1.nft_data)(anchor.Wallet.local().payer.publicKey);
        const json_url = data_1.nft_json_url;
        const lamports = yield spl_token_1.Token.getMinBalanceRentForExemptMint(provider.connection);
        const [mint, metadataAddr, tx] = yield (0, utils_1.createMint)(anchor.Wallet.local().payer.publicKey, anchor.Wallet.local().payer.publicKey, lamports, data, json_url);
        const signers = [mint, anchor.Wallet.local().payer];
        yield provider.send(tx, signers);
        return mint.publicKey;
    });
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const fromAirdropSignature = yield provider.connection.requestAirdrop(anchor.Wallet.local().payer.publicKey, anchor.web3.LAMPORTS_PER_SOL);
        yield provider.connection.confirmTransaction(fromAirdropSignature);
        const nftMint = yield mintMeNft();
        const marketplaceMint = yield splToken.Token.createMint(provider.connection, anchor.Wallet.local().payer, anchor.Wallet.local().payer.publicKey, null, 6, splToken.TOKEN_PROGRAM_ID);
        const ata = yield marketplaceMint.getOrCreateAssociatedAccountInfo(anchor.Wallet.local().payer.publicKey);
        yield marketplaceMint.mintTo(ata.address, anchor.Wallet.local().payer, [], 1000);
        return [marketplaceMint.publicKey, nftMint];
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const [marketplaceMint, nftMint] = yield setup();
    yield workflow(marketplaceMint, nftMint);
}))();
//# sourceMappingURL=complete_workflow.js.map