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
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const splToken = __importStar(require("@solana/spl-token"));
const spl_token_1 = require("@solana/spl-token");
const config_1 = require("./config");
const marketplace_1 = require("./js/marketplace");
const getPDAs_1 = require("./js/getPDAs");
const collection_1 = require("./js/collection");
const CreateMarketplace = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const admin = web3_js_1.Keypair.fromSecretKey(new Uint8Array(config_1.adminWallet));
    const anchorWallet = new anchor_1.Wallet(admin);
    let provider = new anchor_1.Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });
    const marketplaceMint = new splToken.Token(provider.connection, config_1.mintPubkey, splToken.TOKEN_PROGRAM_ID, admin);
    let adminTokenAccount = yield spl_token_1.Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, marketplaceMint.publicKey, admin.publicKey);
    const adminAccountInfo = yield provider.connection.getAccountInfo(adminTokenAccount);
    if (adminAccountInfo === null) {
        yield marketplaceMint.createAssociatedTokenAccount(admin.publicKey);
        let adminNftATA = (yield marketplaceMint.getOrCreateAssociatedAccountInfo(admin.publicKey)).address;
        // console.log(adminNftATA, "adminNftATA----")
    }
    else {
        // console.log("already created.")
    }
    console.log(marketplaceMint.publicKey.toBase58(), "MarkeplaceMintPubkey");
    let marketplace = new marketplace_1.Marketplace(provider);
    yield marketplace.createMarketplace(admin, marketplaceMint.publicKey, 5, adminTokenAccount);
    let creator = new web3_js_1.PublicKey("51rWVP1Rb5fbys6wmoyuDir6yyumfCQSFcaCDef46baW");
    let symbol = new web3_js_1.PublicKey("GFYxNNQkJaGQ1sCWLP9pTeTotqeHs5CNbBRY6w4p4Ua5");
    yield marketplace.createCollection(admin, "GFYxNNQkJaGQ1sCWLP9pTeTotqeHs5CNbBRY6w4p4Ua5", creator, symbol, true);
    console.log(marketplace.marketplacePDA.toBase58(), "marketplacePDA");
    let collectionPDA = yield (0, getPDAs_1.getCollectionPDA)(marketplace.marketplacePDA, symbol);
    let collection = new collection_1.Collection(provider, marketplace.marketplacePDA, collectionPDA);
    let result = yield collection.getCollection();
    console.log(result.symbol.toBase58(), "collection");
});
const UpdateCollection = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
    const admin = web3_js_1.Keypair.fromSecretKey(new Uint8Array(config_1.adminWallet));
    const anchorWallet = new anchor_1.Wallet(admin);
    let provider = new anchor_1.Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });
    const marketplacePDA = new web3_js_1.PublicKey("HYReGTDTx5vshG1NMxHnNoDrcK8gG6XhFNDMF6A16z84");
    let marketplace = new marketplace_1.Marketplace(provider, marketplacePDA);
    let symbol = new web3_js_1.PublicKey("51rWVP1Rb5fbys6wmoyuDir6yyumfCQSFcaCDef46baW");
    let collectionPDA = yield (0, getPDAs_1.getCollectionPDA)(marketplace.marketplacePDA, symbol);
    let creator = new web3_js_1.PublicKey("51rWVP1Rb5fbys6wmoyuDir6yyumfCQSFcaCDef46baW");
    yield marketplace.updateCollection(admin, collectionPDA, null, null, creator, true);
    let collection = new collection_1.Collection(provider, marketplace.marketplacePDA, collectionPDA);
    let result = yield collection.getCollection();
    console.log("success");
    console.log(result);
});
CreateMarketplace();
// UpdateCollection();
//# sourceMappingURL=index.js.map