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
exports.getStorePDA = exports.getAssociatedTokenAddress = exports.getSellOrderPDA = exports.getNftVaultPDA = exports.getCollectionPDA = exports.getEscrowPDA = exports.getMarketplacePDA = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const constant_1 = require("./constant");
const spl_token_1 = require("@solana/spl-token");
const getMarketplacePDA = (owner) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('MARKETPLACE'),
        owner.toBuffer()
    ], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getMarketplacePDA = getMarketplacePDA;
const getEscrowPDA = (marketplacePDA, marketplaceMint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('MARKETPLACE'),
        marketplacePDA.toBuffer(),
        marketplaceMint.toBuffer(),
        Buffer.from('ESCROW'),
    ], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getEscrowPDA = getEscrowPDA;
const getCollectionPDA = (marketplacePDA, symbol) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('MARKETPLACE'),
        symbol.toBuffer(),
        marketplacePDA.toBuffer(),
    ], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getCollectionPDA = getCollectionPDA;
const getNftVaultPDA = (nftMint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('MARKETPLACE'), Buffer.from('vault'), nftMint.toBuffer()], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getNftVaultPDA = getNftVaultPDA;
const getSellOrderPDA = (sellerTokenAccount, price) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('MARKETPLACE'),
        sellerTokenAccount.toBuffer(),
        Buffer.from(price.toString())
    ], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getSellOrderPDA = getSellOrderPDA;
const getAssociatedTokenAddress = (addr, mint) => __awaiter(void 0, void 0, void 0, function* () {
    return yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, addr, false);
});
exports.getAssociatedTokenAddress = getAssociatedTokenAddress;
const getStorePDA = (marketplacePDA) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from("MARKETPLACE"),
        marketplacePDA.toBuffer(),
        Buffer.from("store"),
    ], constant_1.MARKETPLACE_PROGRAM_ID))[0];
});
exports.getStorePDA = getStorePDA;
//# sourceMappingURL=getPDAs.js.map