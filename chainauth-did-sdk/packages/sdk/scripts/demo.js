"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var xrpl_1 = require("xrpl");
var getExplorerUrl = function (txHash) { return "https://testnet.xrpl.org/transactions/".concat(txHash); };
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var sdk, client, _a, wallet, balance, signer1, signer2, recoveryHash, cred, issueResult, isValid, dest, paymentHash, e_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('--- ChainAuth SDK Demo ---');
                    sdk = new index_1.ChainAuthSDK({
                        xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
                        network: 'testnet'
                    });
                    return [4 /*yield*/, sdk.connect()];
                case 1:
                    _b.sent();
                    console.log('✅ Connected to Testnet');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 14, 15, 17]);
                    // 2. Setup & Fund a wallet
                    console.log('\nCreating and funding wallet...');
                    client = new xrpl_1.Client('wss://s.altnet.rippletest.net:51233');
                    return [4 /*yield*/, client.connect()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, client.fundWallet()];
                case 4:
                    _a = _b.sent(), wallet = _a.wallet, balance = _a.balance;
                    console.log("\u2705 Wallet funded: ".concat(wallet.address, " (Balance: ").concat(balance, " XRP)"));
                    console.log("   Account Explorer: https://testnet.xrpl.org/accounts/".concat(wallet.address));
                    return [4 /*yield*/, client.disconnect()];
                case 5:
                    _b.sent();
                    // 3. Test Recovery Setup
                    console.log('\n--- Testing Recovery Feature ---');
                    signer1 = xrpl_1.Wallet.generate();
                    signer2 = xrpl_1.Wallet.generate();
                    console.log("Signers generated: \n  ".concat(signer1.address, "\n  ").concat(signer2.address));
                    // Enable Recovery (SignerListSet)
                    console.log('Enabling recovery...');
                    return [4 /*yield*/, sdk.recovery.enableRecovery(wallet, [signer1.address, signer2.address], 2)];
                case 6:
                    recoveryHash = _b.sent();
                    console.log("\u2705 Recovery Enabled!");
                    console.log("   TxHash: ".concat(recoveryHash));
                    console.log("   Explorer: ".concat(getExplorerUrl(recoveryHash)));
                    // Wait for ledger closing/indexing to prevent sequence errors
                    console.log('Waiting 5s for ledger propagation...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 7:
                    _b.sent();
                    // 4. Test Credential Issuance
                    console.log('\n--- Testing Credential Feature ---');
                    cred = {
                        '@context': ['https://www.w3.org/2018/credentials/v1'],
                        id: "did:chainauth:".concat(Date.now()),
                        type: ['VerifiableCredential'],
                        issuer: "did:chainauth:".concat(wallet.address),
                        issuanceDate: new Date().toISOString(),
                        credentialSubject: { id: 'did:chainauth:recipient' },
                        proof: {}
                    };
                    console.log('Issuing credential...');
                    return [4 /*yield*/, sdk.credentials.issueCredential(wallet, cred)];
                case 8:
                    issueResult = _b.sent();
                    console.log("\u2705 Credential Anchored!");
                    console.log("   Hash: ".concat(issueResult.hash));
                    console.log("   TxHash: ".concat(issueResult.txHash));
                    console.log("   Explorer: ".concat(getExplorerUrl(issueResult.txHash)));
                    // Verify
                    console.log('Verifying credential...');
                    return [4 /*yield*/, sdk.credentials.verifyCredential(cred, issueResult.txHash)];
                case 9:
                    isValid = _b.sent();
                    console.log("\u2705 Credential Verification: ".concat(isValid));
                    // 5. Test Payment (RLUSD Simulation)
                    console.log('\n--- Testing Payment Feature ---');
                    dest = xrpl_1.Wallet.generate();
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    console.log('Attempting to send simulated RLUSD...');
                    return [4 /*yield*/, sdk.payments.sendRLUSD(wallet, '100', dest.address, wallet.address, // Self-issuing for test
                        'RLUSD')];
                case 11:
                    paymentHash = _b.sent();
                    console.log("\u2705 Payment Sent!");
                    console.log("   TxHash: ".concat(paymentHash));
                    console.log("   Explorer: ".concat(getExplorerUrl(paymentHash)));
                    return [3 /*break*/, 13];
                case 12:
                    e_1 = _b.sent();
                    console.log("\u26A0\uFE0F  Payment test expectedly failed (need TrustSet): ".concat(e_1.message));
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 17];
                case 14:
                    error_1 = _b.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, sdk.disconnect()];
                case 16:
                    _b.sent();
                    console.log('\n--- Demo Complete ---');
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
main();
