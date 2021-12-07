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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevUtilsContract = void 0;
// tslint:disable:no-consecutive-blank-lines ordered-imports align trailing-comma enum-naming
// tslint:disable:whitespace no-unbound-method no-trailing-whitespace
// tslint:disable:no-unused-variable
const base_contract_1 = require("@0x/base-contract");
const json_schemas_1 = require("@0x/json-schemas");
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const assert_1 = require("@0x/assert");
const ethers = require("ethers");
// tslint:enable:no-unused-variable
/* istanbul ignore next */
// tslint:disable:array-type
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
class DevUtilsContract extends base_contract_1.BaseContract {
    constructor(address, supportedProvider, txDefaults, logDecodeDependencies, deployedBytecode = DevUtilsContract.deployedBytecode, encoderOverrides) {
        super('DevUtils', DevUtilsContract.ABI(), address, supportedProvider, txDefaults, logDecodeDependencies, deployedBytecode, encoderOverrides);
        this._methodABIIndex = {};
        utils_1.classUtils.bindAll(this, ['_abiEncoderByFunctionSignature', 'address', '_web3Wrapper']);
        DevUtilsContract.ABI().forEach((item, index) => {
            if (item.type === 'function') {
                const methodAbi = item;
                this._methodABIIndex[methodAbi.name] = index;
            }
        });
    }
    static deployFrom0xArtifactAsync(artifact, supportedProvider, txDefaults, logDecodeDependencies, exchange_, chaiBridge_, dydxBridge_) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('txDefaults', txDefaults, json_schemas_1.schemas.txDataSchema);
            if (artifact.compilerOutput === undefined) {
                throw new Error('Compiler output not found in the artifact file');
            }
            const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
            const bytecode = artifact.compilerOutput.evm.bytecode.object;
            const abi = artifact.compilerOutput.abi;
            const logDecodeDependenciesAbiOnly = {};
            if (Object.keys(logDecodeDependencies) !== undefined) {
                for (const key of Object.keys(logDecodeDependencies)) {
                    logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
                }
            }
            return DevUtilsContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly, exchange_, chaiBridge_, dydxBridge_);
        });
    }
    static deployWithLibrariesFrom0xArtifactAsync(artifact, libraryArtifacts, supportedProvider, txDefaults, logDecodeDependencies, exchange_, chaiBridge_, dydxBridge_) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('txDefaults', txDefaults, json_schemas_1.schemas.txDataSchema);
            if (artifact.compilerOutput === undefined) {
                throw new Error('Compiler output not found in the artifact file');
            }
            const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
            const abi = artifact.compilerOutput.abi;
            const logDecodeDependenciesAbiOnly = {};
            if (Object.keys(logDecodeDependencies) !== undefined) {
                for (const key of Object.keys(logDecodeDependencies)) {
                    logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
                }
            }
            const libraryAddresses = yield DevUtilsContract._deployLibrariesAsync(artifact, libraryArtifacts, new web3_wrapper_1.Web3Wrapper(provider), txDefaults);
            const bytecode = base_contract_1.linkLibrariesInBytecode(artifact, libraryAddresses);
            return DevUtilsContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly, exchange_, chaiBridge_, dydxBridge_);
        });
    }
    static deployAsync(bytecode, abi, supportedProvider, txDefaults, logDecodeDependencies, exchange_, chaiBridge_, dydxBridge_) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isHexString('bytecode', bytecode);
            assert_1.assert.doesConformToSchema('txDefaults', txDefaults, json_schemas_1.schemas.txDataSchema);
            const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
            const constructorAbi = base_contract_1.BaseContract._lookupConstructorAbi(abi);
            [exchange_, chaiBridge_, dydxBridge_] = base_contract_1.BaseContract._formatABIDataItemList(constructorAbi.inputs, [exchange_, chaiBridge_, dydxBridge_], base_contract_1.BaseContract._bigNumberToString);
            const iface = new ethers.utils.Interface(abi);
            const deployInfo = iface.deployFunction;
            const txData = deployInfo.encode(bytecode, [exchange_, chaiBridge_, dydxBridge_]);
            const web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
            const txDataWithDefaults = yield base_contract_1.BaseContract._applyDefaultsToContractTxDataAsync(Object.assign({ data: txData }, txDefaults), web3Wrapper.estimateGasAsync.bind(web3Wrapper));
            const txHash = yield web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            utils_1.logUtils.log(`transactionHash: ${txHash}`);
            const txReceipt = yield web3Wrapper.awaitTransactionSuccessAsync(txHash);
            utils_1.logUtils.log(`DevUtils successfully deployed at ${txReceipt.contractAddress}`);
            const contractInstance = new DevUtilsContract(txReceipt.contractAddress, provider, txDefaults, logDecodeDependencies);
            contractInstance.constructorArgs = [exchange_, chaiBridge_, dydxBridge_];
            return contractInstance;
        });
    }
    /**
     * @returns      The contract ABI
     */
    static ABI() {
        const abi = [
            {
                inputs: [
                    {
                        name: 'exchange_',
                        type: 'address',
                    },
                    {
                        name: 'chaiBridge_',
                        type: 'address',
                    },
                    {
                        name: 'dydxBridge_',
                        type: 'address',
                    },
                ],
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'constructor',
            },
            {
                constant: true,
                inputs: [],
                name: 'EIP712_EXCHANGE_DOMAIN_HASH',
                outputs: [
                    {
                        name: '',
                        type: 'bytes32',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'chaiBridgeAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeAssetProxyId',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeERC1155AssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                    {
                        name: 'tokenIds',
                        type: 'uint256[]',
                    },
                    {
                        name: 'tokenValues',
                        type: 'uint256[]',
                    },
                    {
                        name: 'callbackData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeERC20AssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeERC20BridgeAssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                    {
                        name: 'bridgeAddress',
                        type: 'address',
                    },
                    {
                        name: 'bridgeData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeERC721AssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                    {
                        name: 'tokenId',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeMultiAssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'amounts',
                        type: 'uint256[]',
                    },
                    {
                        name: 'nestedAssetData',
                        type: 'bytes[]',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeStaticCallAssetData',
                outputs: [
                    {
                        name: 'assetProxyId',
                        type: 'bytes4',
                    },
                    {
                        name: 'staticCallTargetAddress',
                        type: 'address',
                    },
                    {
                        name: 'staticCallData',
                        type: 'bytes',
                    },
                    {
                        name: 'expectedReturnDataHash',
                        type: 'bytes32',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'transactionData',
                        type: 'bytes',
                    },
                ],
                name: 'decodeZeroExTransactionData',
                outputs: [
                    {
                        name: 'functionName',
                        type: 'string',
                    },
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'takerAssetFillAmounts',
                        type: 'uint256[]',
                    },
                    {
                        name: 'signatures',
                        type: 'bytes[]',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'dydxBridgeAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                    {
                        name: 'tokenIds',
                        type: 'uint256[]',
                    },
                    {
                        name: 'tokenValues',
                        type: 'uint256[]',
                    },
                    {
                        name: 'callbackData',
                        type: 'bytes',
                    },
                ],
                name: 'encodeERC1155AssetData',
                outputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                ],
                name: 'encodeERC20AssetData',
                outputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'tokenAddress',
                        type: 'address',
                    },
                    {
                        name: 'tokenId',
                        type: 'uint256',
                    },
                ],
                name: 'encodeERC721AssetData',
                outputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'amounts',
                        type: 'uint256[]',
                    },
                    {
                        name: 'nestedAssetData',
                        type: 'bytes[]',
                    },
                ],
                name: 'encodeMultiAssetData',
                outputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'staticCallTargetAddress',
                        type: 'address',
                    },
                    {
                        name: 'staticCallData',
                        type: 'bytes',
                    },
                    {
                        name: 'expectedReturnDataHash',
                        type: 'bytes32',
                    },
                ],
                name: 'encodeStaticCallAssetData',
                outputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'erc1155ProxyAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'erc20ProxyAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'erc721ProxyAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'exchangeAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'getAssetProxyAllowance',
                outputs: [
                    {
                        name: 'allowance',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'getBalance',
                outputs: [
                    {
                        name: 'balance',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'getBalanceAndAssetProxyAllowance',
                outputs: [
                    {
                        name: 'balance',
                        type: 'uint256',
                    },
                    {
                        name: 'allowance',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes[]',
                    },
                ],
                name: 'getBatchAssetProxyAllowances',
                outputs: [
                    {
                        name: 'allowances',
                        type: 'uint256[]',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes[]',
                    },
                ],
                name: 'getBatchBalances',
                outputs: [
                    {
                        name: 'balances',
                        type: 'uint256[]',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes[]',
                    },
                ],
                name: 'getBatchBalancesAndAssetProxyAllowances',
                outputs: [
                    {
                        name: 'balances',
                        type: 'uint256[]',
                    },
                    {
                        name: 'allowances',
                        type: 'uint256[]',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'addresses',
                        type: 'address[]',
                    },
                ],
                name: 'getEthBalances',
                outputs: [
                    {
                        name: '',
                        type: 'uint256[]',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'exchange',
                        type: 'address',
                    },
                ],
                name: 'getOrderHash',
                outputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'bytes',
                    },
                ],
                name: 'getOrderRelevantState',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderStatus',
                                type: 'uint8',
                            },
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'orderTakerAssetFilledAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'fillableTakerAssetAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'isValidSignature',
                        type: 'bool',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'bytes[]',
                    },
                ],
                name: 'getOrderRelevantStates',
                outputs: [
                    {
                        name: 'ordersInfo',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'orderStatus',
                                type: 'uint8',
                            },
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'orderTakerAssetFilledAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'fillableTakerAssetAmounts',
                        type: 'uint256[]',
                    },
                    {
                        name: 'isValidSignature',
                        type: 'bool[]',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'takerAddress',
                        type: 'address',
                    },
                    {
                        name: 'takerAssetFillAmount',
                        type: 'uint256',
                    },
                ],
                name: 'getSimulatedOrderMakerTransferResults',
                outputs: [
                    {
                        name: 'orderTransferResults',
                        type: 'uint8',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'takerAddress',
                        type: 'address',
                    },
                    {
                        name: 'takerAssetFillAmount',
                        type: 'uint256',
                    },
                ],
                name: 'getSimulatedOrderTransferResults',
                outputs: [
                    {
                        name: 'orderTransferResults',
                        type: 'uint8',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerAddress',
                                type: 'address',
                            },
                            {
                                name: 'takerAddress',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipientAddress',
                                type: 'address',
                            },
                            {
                                name: 'senderAddress',
                                type: 'address',
                            },
                            {
                                name: 'makerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'takerAssetAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'makerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'takerFee',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'makerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'makerFeeAssetData',
                                type: 'bytes',
                            },
                            {
                                name: 'takerFeeAssetData',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'takerAddresses',
                        type: 'address[]',
                    },
                    {
                        name: 'takerAssetFillAmounts',
                        type: 'uint256[]',
                    },
                ],
                name: 'getSimulatedOrdersTransferResults',
                outputs: [
                    {
                        name: 'orderTransferResults',
                        type: 'uint8[]',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'transaction',
                        type: 'tuple',
                        components: [
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'gasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'signerAddress',
                                type: 'address',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'exchange',
                        type: 'address',
                    },
                ],
                name: 'getTransactionHash',
                outputs: [
                    {
                        name: 'transactionHash',
                        type: 'bytes32',
                    },
                ],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: false,
                inputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'getTransferableAssetAmount',
                outputs: [
                    {
                        name: 'transferableAssetAmount',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: true,
                inputs: [
                    {
                        name: 'assetData',
                        type: 'bytes',
                    },
                ],
                name: 'revertIfInvalidAssetData',
                outputs: [],
                payable: false,
                stateMutability: 'pure',
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'staticCallProxyAddress',
                outputs: [
                    {
                        name: '',
                        type: 'address',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
        ];
        return abi;
    }
    static _deployLibrariesAsync(artifact, libraryArtifacts, web3Wrapper, txDefaults, libraryAddresses = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const links = artifact.compilerOutput.evm.bytecode.linkReferences;
            // Go through all linked libraries, recursively deploying them if necessary.
            for (const link of Object.values(links)) {
                for (const libraryName of Object.keys(link)) {
                    if (!libraryAddresses[libraryName]) {
                        // Library not yet deployed.
                        const libraryArtifact = libraryArtifacts[libraryName];
                        if (!libraryArtifact) {
                            throw new Error(`Missing artifact for linked library "${libraryName}"`);
                        }
                        // Deploy any dependent libraries used by this library.
                        yield DevUtilsContract._deployLibrariesAsync(libraryArtifact, libraryArtifacts, web3Wrapper, txDefaults, libraryAddresses);
                        // Deploy this library.
                        const linkedLibraryBytecode = base_contract_1.linkLibrariesInBytecode(libraryArtifact, libraryAddresses);
                        const txDataWithDefaults = yield base_contract_1.BaseContract._applyDefaultsToContractTxDataAsync(Object.assign({ data: linkedLibraryBytecode }, txDefaults), web3Wrapper.estimateGasAsync.bind(web3Wrapper));
                        const txHash = yield web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                        utils_1.logUtils.log(`transactionHash: ${txHash}`);
                        const { contractAddress } = yield web3Wrapper.awaitTransactionSuccessAsync(txHash);
                        utils_1.logUtils.log(`${libraryArtifact.contractName} successfully deployed at ${contractAddress}`);
                        libraryAddresses[libraryArtifact.contractName] = contractAddress;
                    }
                }
            }
            return libraryAddresses;
        });
    }
    getFunctionSignature(methodName) {
        const index = this._methodABIIndex[methodName];
        const methodAbi = DevUtilsContract.ABI()[index]; // tslint:disable-line:no-unnecessary-type-assertion
        const functionSignature = base_contract_1.methodAbiToFunctionSignature(methodAbi);
        return functionSignature;
    }
    getABIDecodedTransactionData(methodName, callData) {
        const functionSignature = this.getFunctionSignature(methodName);
        const self = this;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        const abiDecodedCallData = abiEncoder.strictDecode(callData);
        return abiDecodedCallData;
    }
    getABIDecodedReturnData(methodName, callData) {
        if (this._encoderOverrides.decodeOutput) {
            return this._encoderOverrides.decodeOutput(methodName, callData);
        }
        const functionSignature = this.getFunctionSignature(methodName);
        const self = this;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        const abiDecodedCallData = abiEncoder.strictDecodeReturnValue(callData);
        return abiDecodedCallData;
    }
    getSelector(methodName) {
        const functionSignature = this.getFunctionSignature(methodName);
        const self = this;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        return abiEncoder.getSelector();
    }
    EIP712_EXCHANGE_DOMAIN_HASH() {
        const self = this;
        const functionSignature = 'EIP712_EXCHANGE_DOMAIN_HASH()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    chaiBridgeAddress() {
        const self = this;
        const functionSignature = 'chaiBridgeAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Decode AssetProxy identifier
     * @param assetData AssetProxy-compliant asset data describing an ERC-20, ERC-
     *     721, ERC1155, or MultiAsset asset.
     * @returns The AssetProxy identifier
     */
    decodeAssetProxyId(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeAssetProxyId(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode ERC-1155 asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant asset data describing an ERC-1155 set
     *     of assets.
     * @returns The ERC-1155 AssetProxy identifier, the address of the ERC-1155 contract hosting the assets, an array of the identifiers of the assets to be traded, an array of asset amounts to be traded, and callback data.  Each element of the arrays corresponds to the same-indexed element of the other array.  Return values specified as &#x60;memory&#x60; are returned as pointers to locations within the memory of the input parameter &#x60;assetData&#x60;.
     */
    decodeERC1155AssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeERC1155AssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode ERC-20 asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant asset data describing an ERC-20 asset.
     * @returns The AssetProxy identifier, and the address of the ERC-20 contract hosting this asset.
     */
    decodeERC20AssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeERC20AssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode ERC20Bridge asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant asset data describing an ERC20Bridge
     *     asset
     * @returns The ERC20BridgeProxy identifier, the address of the ERC20 token to transfer, the address of the bridge contract, and extra data to be passed to the bridge contract.
     */
    decodeERC20BridgeAssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeERC20BridgeAssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode ERC-721 asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant asset data describing an ERC-721
     *     asset.
     * @returns The ERC-721 AssetProxy identifier, the address of the ERC-721 contract hosting this asset, and the identifier of the specific asset to be traded.
     */
    decodeERC721AssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeERC721AssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode multi-asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant data describing a multi-asset basket.
     * @returns The Multi-Asset AssetProxy identifier, an array of the amounts of the assets to be traded, and an array of the AssetProxy-compliant data describing each asset to be traded.  Each element of the arrays corresponds to the same-indexed element of the other array.
     */
    decodeMultiAssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeMultiAssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decode StaticCall asset data from the format described in the AssetProxy contract specification.
     * @param assetData AssetProxy-compliant asset data describing a StaticCall
     *     asset
     * @returns The StaticCall AssetProxy identifier, the target address of the StaticCAll, the data to be passed to the target address, and the expected Keccak-256 hash of the static call return data.
     */
    decodeStaticCallAssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'decodeStaticCallAssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    /**
     * Decodes the call data for an Exchange contract method call.
     * @param transactionData ABI-encoded calldata for an Exchange     contract
     *     method call.
     * @returns The name of the function called, and the parameters it was     given.  For single-order fills and cancels, the arrays will have     just one element.
     */
    decodeZeroExTransactionData(transactionData) {
        const self = this;
        assert_1.assert.isString('transactionData', transactionData);
        const functionSignature = 'decodeZeroExTransactionData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [transactionData]);
            },
        };
    }
    dydxBridgeAddress() {
        const self = this;
        const functionSignature = 'dydxBridgeAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Encode ERC-1155 asset data into the format described in the AssetProxy contract specification.
     * @param tokenAddress The address of the ERC-1155 contract hosting the
     *     asset(s) to be traded.
     * @param tokenIds The identifiers of the specific assets to be traded.
     * @param tokenValues The amounts of each asset to be traded.
     * @param callbackData Data to be passed to receiving contracts when a transfer
     *     is performed.
     * @returns AssetProxy-compliant asset data describing the set of assets.
     */
    encodeERC1155AssetData(tokenAddress, tokenIds, tokenValues, callbackData) {
        const self = this;
        assert_1.assert.isString('tokenAddress', tokenAddress);
        assert_1.assert.isArray('tokenIds', tokenIds);
        assert_1.assert.isArray('tokenValues', tokenValues);
        assert_1.assert.isString('callbackData', callbackData);
        const functionSignature = 'encodeERC1155AssetData(address,uint256[],uint256[],bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [
                    tokenAddress.toLowerCase(),
                    tokenIds,
                    tokenValues,
                    callbackData,
                ]);
            },
        };
    }
    /**
     * Encode ERC-20 asset data into the format described in the AssetProxy contract specification.
     * @param tokenAddress The address of the ERC-20 contract hosting the asset to
     *     be traded.
     * @returns AssetProxy-compliant data describing the asset.
     */
    encodeERC20AssetData(tokenAddress) {
        const self = this;
        assert_1.assert.isString('tokenAddress', tokenAddress);
        const functionSignature = 'encodeERC20AssetData(address)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [tokenAddress.toLowerCase()]);
            },
        };
    }
    /**
     * Encode ERC-721 asset data into the format described in the AssetProxy specification.
     * @param tokenAddress The address of the ERC-721 contract hosting the asset to
     *     be traded.
     * @param tokenId The identifier of the specific asset to be traded.
     * @returns AssetProxy-compliant asset data describing the asset.
     */
    encodeERC721AssetData(tokenAddress, tokenId) {
        const self = this;
        assert_1.assert.isString('tokenAddress', tokenAddress);
        assert_1.assert.isBigNumber('tokenId', tokenId);
        const functionSignature = 'encodeERC721AssetData(address,uint256)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [tokenAddress.toLowerCase(), tokenId]);
            },
        };
    }
    /**
     * Encode data for multiple assets, per the AssetProxy contract specification.
     * @param amounts The amounts of each asset to be traded.
     * @param nestedAssetData AssetProxy-compliant data describing each asset to be
     *     traded.
     * @returns AssetProxy-compliant data describing the set of assets.
     */
    encodeMultiAssetData(amounts, nestedAssetData) {
        const self = this;
        assert_1.assert.isArray('amounts', amounts);
        assert_1.assert.isArray('nestedAssetData', nestedAssetData);
        const functionSignature = 'encodeMultiAssetData(uint256[],bytes[])';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [amounts, nestedAssetData]);
            },
        };
    }
    /**
     * Encode StaticCall asset data into the format described in the AssetProxy contract specification.
     * @param staticCallTargetAddress Target address of StaticCall.
     * @param staticCallData Data that will be passed to staticCallTargetAddress in
     *     the StaticCall.
     * @param expectedReturnDataHash Expected Keccak-256 hash of the StaticCall
     *     return data.
     * @returns AssetProxy-compliant asset data describing the set of assets.
     */
    encodeStaticCallAssetData(staticCallTargetAddress, staticCallData, expectedReturnDataHash) {
        const self = this;
        assert_1.assert.isString('staticCallTargetAddress', staticCallTargetAddress);
        assert_1.assert.isString('staticCallData', staticCallData);
        assert_1.assert.isString('expectedReturnDataHash', expectedReturnDataHash);
        const functionSignature = 'encodeStaticCallAssetData(address,bytes,bytes32)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [
                    staticCallTargetAddress.toLowerCase(),
                    staticCallData,
                    expectedReturnDataHash,
                ]);
            },
        };
    }
    erc1155ProxyAddress() {
        const self = this;
        const functionSignature = 'erc1155ProxyAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    erc20ProxyAddress() {
        const self = this;
        const functionSignature = 'erc20ProxyAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    erc721ProxyAddress() {
        const self = this;
        const functionSignature = 'erc721ProxyAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    exchangeAddress() {
        const self = this;
        const functionSignature = 'exchangeAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Returns the number of asset(s) (described by assetData) that the corresponding AssetProxy contract is authorized to spend.  When the asset data contains multiple assets (eg for Multi-Asset), the return value indicates how many complete "baskets" of those assets may be spent by all of the corresponding AssetProxy contracts.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Details of asset, encoded per the AssetProxy contract
     *     specification.
     * @returns Number of assets (or asset baskets) that the corresponding AssetProxy is authorized to spend.
     */
    getAssetProxyAllowance(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'getAssetProxyAllowance(address,bytes)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Returns the owner's balance of the assets(s) specified in assetData.  When the asset data contains multiple assets (eg in ERC1155 or Multi-Asset), the return value indicates how many complete "baskets" of those assets are owned by owner.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Details of asset, encoded per the AssetProxy contract
     *     specification.
     * @returns Number of assets (or asset baskets) held by owner.
     */
    getBalance(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'getBalance(address,bytes)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Calls getBalance() and getAllowance() for assetData.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Details of asset, encoded per the AssetProxy contract
     *     specification.
     * @returns Number of assets (or asset baskets) held by owner, and number of assets (or asset baskets) that the corresponding AssetProxy is authorized to spend.
     */
    getBalanceAndAssetProxyAllowance(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'getBalanceAndAssetProxyAllowance(address,bytes)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Calls getAssetProxyAllowance() for each element of assetData.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Array of asset details, each encoded per the AssetProxy
     *     contract specification.
     * @returns An array of asset allowances from getAllowance(), with each element corresponding to the same-indexed element in the assetData input.
     */
    getBatchAssetProxyAllowances(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isArray('assetData', assetData);
        const functionSignature = 'getBatchAssetProxyAllowances(address,bytes[])';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Calls getBalance() for each element of assetData.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Array of asset details, each encoded per the AssetProxy
     *     contract specification.
     * @returns Array of asset balances from getBalance(), with each element corresponding to the same-indexed element in the assetData input.
     */
    getBatchBalances(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isArray('assetData', assetData);
        const functionSignature = 'getBatchBalances(address,bytes[])';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Calls getBatchBalances() and getBatchAllowances() for each element of assetData.
     * @param ownerAddress Owner of the assets specified by assetData.
     * @param assetData Array of asset details, each encoded per the AssetProxy
     *     contract specification.
     * @returns An array of asset balances from getBalance(), and an array of asset allowances from getAllowance(), with each element corresponding to the same-indexed element in the assetData input.
     */
    getBatchBalancesAndAssetProxyAllowances(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isArray('assetData', assetData);
        const functionSignature = 'getBatchBalancesAndAssetProxyAllowances(address,bytes[])';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Batch fetches ETH balances
     * @param addresses Array of addresses.
     * @returns Array of ETH balances.
     */
    getEthBalances(addresses) {
        const self = this;
        assert_1.assert.isArray('addresses', addresses);
        const functionSignature = 'getEthBalances(address[])';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [addresses]);
            },
        };
    }
    getOrderHash(order, chainId, exchange) {
        const self = this;
        assert_1.assert.isBigNumber('chainId', chainId);
        assert_1.assert.isString('exchange', exchange);
        const functionSignature = 'getOrderHash((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes),uint256,address)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [order, chainId, exchange.toLowerCase()]);
            },
        };
    }
    /**
     * Fetches all order-relevant information needed to validate if the supplied order is fillable.
     * @param order The order structure.
     * @param signature Signature provided by maker that proves the order's
     *     authenticity. `0x01` can always be provided if the signature does not
     *     need to be validated.
     * @returns The orderInfo (hash, status, and &#x60;takerAssetAmount&#x60; already filled for the given order), fillableTakerAssetAmount (amount of the order&#x27;s &#x60;takerAssetAmount&#x60; that is fillable given all on-chain state), and isValidSignature (validity of the provided signature). NOTE: If the &#x60;takerAssetData&#x60; encodes data for multiple assets, &#x60;fillableTakerAssetAmount&#x60; will represent a &quot;scaled&quot; amount, meaning it must be multiplied by all the individual asset amounts within the &#x60;takerAssetData&#x60; to get the final amount of each asset that can be filled.
     */
    getOrderRelevantState(order, signature) {
        const self = this;
        assert_1.assert.isString('signature', signature);
        const functionSignature = 'getOrderRelevantState((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes),bytes)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [order, signature]);
            },
        };
    }
    /**
     * Fetches all order-relevant information needed to validate if the supplied orders are fillable.
     * @param orders Array of order structures.
     * @param signatures Array of signatures provided by makers that prove the
     *     authenticity of the orders. `0x01` can always be provided if a signature
     *     does not need to be validated.
     * @returns The ordersInfo (array of the hash, status, and &#x60;takerAssetAmount&#x60; already filled for each order), fillableTakerAssetAmounts (array of amounts for each order&#x27;s &#x60;takerAssetAmount&#x60; that is fillable given all on-chain state), and isValidSignature (array containing the validity of each provided signature). NOTE: If the &#x60;takerAssetData&#x60; encodes data for multiple assets, each element of &#x60;fillableTakerAssetAmounts&#x60; will represent a &quot;scaled&quot; amount, meaning it must be multiplied by all the individual asset amounts within the &#x60;takerAssetData&#x60; to get the final amount of each asset that can be filled.
     */
    getOrderRelevantStates(orders, signatures) {
        const self = this;
        assert_1.assert.isArray('orders', orders);
        assert_1.assert.isArray('signatures', signatures);
        const functionSignature = 'getOrderRelevantStates((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes)[],bytes[])';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [orders, signatures]);
            },
        };
    }
    /**
     * Simulates the maker transfers within an order and returns the index of the first failed transfer.
     * @param order The order to simulate transfers for.
     * @param takerAddress The address of the taker that will fill the order.
     * @param takerAssetFillAmount The amount of takerAsset that the taker wished
     *     to fill.
     * @returns The index of the first failed transfer (or 4 if all transfers are successful).
     */
    getSimulatedOrderMakerTransferResults(order, takerAddress, takerAssetFillAmount) {
        const self = this;
        assert_1.assert.isString('takerAddress', takerAddress);
        assert_1.assert.isBigNumber('takerAssetFillAmount', takerAssetFillAmount);
        const functionSignature = 'getSimulatedOrderMakerTransferResults((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes),address,uint256)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [
                    order,
                    takerAddress.toLowerCase(),
                    takerAssetFillAmount,
                ]);
            },
        };
    }
    /**
     * Simulates all of the transfers within an order and returns the index of the first failed transfer.
     * @param order The order to simulate transfers for.
     * @param takerAddress The address of the taker that will fill the order.
     * @param takerAssetFillAmount The amount of takerAsset that the taker wished
     *     to fill.
     * @returns The index of the first failed transfer (or 4 if all transfers are successful).
     */
    getSimulatedOrderTransferResults(order, takerAddress, takerAssetFillAmount) {
        const self = this;
        assert_1.assert.isString('takerAddress', takerAddress);
        assert_1.assert.isBigNumber('takerAssetFillAmount', takerAssetFillAmount);
        const functionSignature = 'getSimulatedOrderTransferResults((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes),address,uint256)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [
                    order,
                    takerAddress.toLowerCase(),
                    takerAssetFillAmount,
                ]);
            },
        };
    }
    /**
     * Simulates all of the transfers for each given order and returns the indices of each first failed transfer.
     * @param orders Array of orders to individually simulate transfers for.
     * @param takerAddresses Array of addresses of takers that will fill each
     *     order.
     * @param takerAssetFillAmounts Array of amounts of takerAsset that will be
     *     filled for each order.
     * @returns The indices of the first failed transfer (or 4 if all transfers are successful) for each order.
     */
    getSimulatedOrdersTransferResults(orders, takerAddresses, takerAssetFillAmounts) {
        const self = this;
        assert_1.assert.isArray('orders', orders);
        assert_1.assert.isArray('takerAddresses', takerAddresses);
        assert_1.assert.isArray('takerAssetFillAmounts', takerAssetFillAmounts);
        const functionSignature = 'getSimulatedOrdersTransferResults((address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes)[],address[],uint256[])';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [orders, takerAddresses, takerAssetFillAmounts]);
            },
        };
    }
    getTransactionHash(transaction, chainId, exchange) {
        const self = this;
        assert_1.assert.isBigNumber('chainId', chainId);
        assert_1.assert.isString('exchange', exchange);
        const functionSignature = 'getTransactionHash((uint256,uint256,uint256,address,bytes),uint256,address)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [transaction, chainId, exchange.toLowerCase()]);
            },
        };
    }
    /**
     * Gets the amount of an asset transferable by the maker of an order.
     * @param ownerAddress Address of the owner of the asset.
     * @param assetData Description of tokens, per the AssetProxy contract
     *     specification.
     * @returns The amount of the asset tranferable by the owner. NOTE: If the &#x60;assetData&#x60; encodes data for multiple assets, the &#x60;transferableAssetAmount&#x60; will represent the amount of times the entire &#x60;assetData&#x60; can be transferred. To calculate the total individual transferable amounts, this scaled &#x60;transferableAmount&#x60; must be multiplied by the individual asset amounts located within the &#x60;assetData&#x60;.
     */
    getTransferableAssetAmount(ownerAddress, assetData) {
        const self = this;
        assert_1.assert.isString('ownerAddress', ownerAddress);
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'getTransferableAssetAmount(address,bytes)';
        return {
            sendTransactionAsync(txData, opts = { shouldValidate: true }) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData), this.estimateGasAsync.bind(this));
                    if (opts.shouldValidate !== false) {
                        yield this.callAsync(txDataWithDefaults);
                    }
                    return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                });
            },
            awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            estimateGasAsync(txData) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
                });
            },
            createAccessListAsync(txData, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    const txDataWithDefaults = yield self._applyDefaultsToTxDataAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, txData));
                    return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
                });
            },
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [ownerAddress.toLowerCase(), assetData]);
            },
        };
    }
    /**
     * Reverts if assetData is not of a valid format for its given proxy id.
     * @param assetData AssetProxy compliant asset data.
     */
    revertIfInvalidAssetData(assetData) {
        const self = this;
        assert_1.assert.isString('assetData', assetData);
        const functionSignature = 'revertIfInvalidAssetData(bytes)';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    let rawCallResult;
                    if (self._deployedBytecodeIfExists) {
                        rawCallResult = yield self._evmExecAsync(this.getABIEncodedTransactionData());
                    }
                    else {
                        rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    }
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, [assetData]);
            },
        };
    }
    staticCallProxyAddress() {
        const self = this;
        const functionSignature = 'staticCallProxyAddress()';
        return {
            callAsync(callData = {}, defaultBlock) {
                return __awaiter(this, void 0, void 0, function* () {
                    base_contract_1.BaseContract._assertCallParams(callData, defaultBlock);
                    const rawCallResult = yield self._performCallAsync(Object.assign({ data: this.getABIEncodedTransactionData() }, callData), defaultBlock);
                    const abiEncoder = self._lookupAbiEncoder(functionSignature);
                    base_contract_1.BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                    return abiEncoder.strictDecodeReturnValue(rawCallResult);
                });
            },
            getABIEncodedTransactionData() {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
}
exports.DevUtilsContract = DevUtilsContract;
/**
 * @ignore
 */
DevUtilsContract.deployedBytecode = '0x608060405234801561001057600080fd5b50600436106102775760003560e01c8063a5cd62ba11610160578063d186037f116100d8578063e4e6e7da1161008c578063ee18599711610071578063ee185997146105d8578063ef3bb097146105e0578063ff84e7cc146105e857610277565b8063e4e6e7da14610595578063e77286eb146105b657610277565b8063d3d862d1116100bd578063d3d862d114610540578063d469502814610553578063e25cabf71461057357610277565b8063d186037f1461051a578063d36379051461052d57610277565b8063bbb2dcf61161012f578063c82037ef11610114578063c82037ef146104dc578063ca49f47c146104e4578063d001c5dc1461050757610277565b8063bbb2dcf6146104b2578063c26cfecd146104d457610277565b8063a5cd62ba14610464578063a6627e9f14610484578063a7530f1214610497578063b43cffe11461049f57610277565b80637982653e116101f35780639baf2705116101c25780639eadc835116101a75780639eadc8351461041a578063a070cac81461043e578063a0901e511461045157610277565b80639baf2705146103fd5780639cd016051461041257610277565b80637982653e1461039657806379c9c426146103b65780637d727512146103c95780638f4ce479146103dc57610277565b80634dfdac201161024a57806363eb39921161022f57806363eb39921461033d5780636f83188e14610350578063750bdb301461037357610277565b80634dfdac20146102fd578063590aa8751461031d57610277565b806304a5618a1461027c5780630d7b7d76146102a75780632322cf76146102c857806346eb65cb146102e8575b600080fd5b61028f61028a3660046142ab565b6105f0565b60405161029e93929190614d24565b60405180910390f35b6102ba6102b5366004613d6f565b610689565b60405161029e929190614f2d565b6102db6102d6366004613d6f565b6106ab565b60405161029e9190614c01565b6102fb6102f63660046142ab565b6106d3565b005b61031061030b366004613c8a565b610757565b60405161029e9190614b59565b61033061032b366004613c6e565b6107da565b60405161029e9190614d84565b61033061034b366004613db3565b610889565b61036361035e3660046142ab565b61093c565b60405161029e9493929190614e19565b6103866103813660046142ab565b6109dc565b60405161029e9493929190614c42565b6103a96103a4366004614481565b610a6e565b60405161029e9190614e05565b6102db6103c4366004614589565b610b20565b6102db6103d7366004613d6f565b610ba1565b6103ef6103ea3660046142ab565b611497565b60405161029e929190614c1f565b61040561152a565b60405161029e9190614888565b610405611539565b61042d6104283660046142ab565b611548565b60405161029e959493929190614c7e565b6102db61044c366004614530565b6115ed565b61031061045f366004613e35565b61166e565b610477610472366004613f03565b6116e7565b60405161029e9190614a71565b610330610492366004613e0a565b6117a1565b610405611851565b6103306104ad366004613cd8565b611860565b6104c56104c03660046142ab565b611916565b60405161029e93929190614d4f565b6102db6119a6565b6104056119ac565b6104f76104f23660046142ab565b6119bb565b60405161029e9493929190614ce1565b610310610515366004613c8a565b611a4d565b6102db610528366004613d6f565b611abb565b6103a961053b366004614481565b612446565b61033061054e366004613fde565b6124a8565b6105666105613660046142ab565b6124fd565b60405161029e9190614c0a565b610586610581366004613f87565b6125a0565b60405161029e93929190614abe565b6105a86105a3366004613c8a565b6126d8565b60405161029e929190614bdc565b6105c96105c43660046144d9565b6126f1565b60405161029e93929190614ea6565b610405612960565b61040561296f565b61040561297e565b600080600073__$808f8f452496495931fd70b932e88106d9$__6304a5618a856040518263ffffffff1660e01b815260040161062c9190614d84565b60606040518083038186803b15801561064457600080fd5b505af4158015610658573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061067c9190810190614201565b9250925092509193909250565b6000806106968484610ba1565b91506106a28484611abb565b90509250929050565b60008060006106ba8585610689565b915091506106c8828261298d565b925050505b92915050565b6040517f46eb65cb00000000000000000000000000000000000000000000000000000000815273__$808f8f452496495931fd70b932e88106d9$__906346eb65cb90610723908490600401614d84565b60006040518083038186803b15801561073b57600080fd5b505af415801561074f573d6000803e3d6000fd5b505050505b50565b606060008251905080604051908082528060200260200182016040528015610789578160200160208202803883390190505b50915060005b8181146107d2576107b3858583815181106107a657fe5b6020026020010151611abb565b8382815181106107bf57fe5b602090810291909101015260010161078f565b505092915050565b6040517f590aa87500000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__9063590aa8759061082d908590600401614888565b60006040518083038186803b15801561084557600080fd5b505af4158015610859573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261088191908101906142de565b90505b919050565b6040517f63eb399200000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__906363eb3992906108e0908790879087906004016149f1565b60006040518083038186803b1580156108f857600080fd5b505af415801561090c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261093491908101906142de565b949350505050565b60608060608073__$f3880127484c626d9b3a095208b13cbf1b$__636f83188e866040518263ffffffff1660e01b81526004016109799190614d84565b60006040518083038186803b15801561099157600080fd5b505af41580156109a5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109cd919081019061434c565b93509350935093509193509193565b6000806000606073__$808f8f452496495931fd70b932e88106d9$__63750bdb30866040518263ffffffff1660e01b8152600401610a1a9190614d84565b60006040518083038186803b158015610a3257600080fd5b505af4158015610a46573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109cd9190810190614085565b600080546040517f9caa023b00000000000000000000000000000000000000000000000000000000815273__$988eef118a938b5a4e7336ebab0aae599b$__91639caa023b91610ad0916001600160a01b031690889088908890600401614a23565b60206040518083038186803b158015610ae857600080fd5b505af4158015610afc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610934919081019061432d565b600061093484610b9c6040518060400160405280600b81526020017f30782050726f746f636f6c0000000000000000000000000000000000000000008152506040518060400160405280600581526020017f332e302e3000000000000000000000000000000000000000000000000000000081525087876129a3565b6129fa565b600080610bb4838263ffffffff612a0e16565b90506001600160e01b031981167ff47261b0000000000000000000000000000000000000000000000000000000001415610c0f576000610bfb84601063ffffffff612a4716565b9050610c078186612a7a565b925050611490565b6001600160e01b031981167f02571792000000000000000000000000000000000000000000000000000000001415610e285760008073__$808f8f452496495931fd70b932e88106d9$__6304a5618a866040518263ffffffff1660e01b8152600401610c7b9190614d84565b60606040518083038186803b158015610c9357600080fd5b505af4158015610ca7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610ccb9190810190614201565b6040519194509250606091507f6352211e0000000000000000000000000000000000000000000000000000000090610d07908490602401614c01565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905060006060846001600160a01b031683604051610d82919061486c565b600060405180830381855afa9150503d8060008114610dbd576040519150601f19603f3d011682016040523d82523d6000602084013e610dc2565b606091505b50915091506000828015610dd7575081516020145b610de2576000610df3565b610df382600c63ffffffff612a4716565b9050896001600160a01b0316816001600160a01b031614610e15576000610e18565b60015b60ff169750505050505050611490565b6001600160e01b031981167fa7cb5fb70000000000000000000000000000000000000000000000000000000014156110c457600060608073__$808f8f452496495931fd70b932e88106d9$__639eadc835876040518263ffffffff1660e01b8152600401610e969190614d84565b60006040518083038186803b158015610eae57600080fd5b505af4158015610ec2573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610eea91908101906140ef565b5081519296509094509250905060005b8181146110ba57828181518110610f0d57fe5b602002602001015160001415610f22576110b2565b83516060907efdd58e00000000000000000000000000000000000000000000000000000000908b90879085908110610f5657fe5b6020026020010151604051602401610f6f929190614a58565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905060006060876001600160a01b031683604051610fea919061486c565b600060405180830381855afa9150503d8060008114611025576040519150601f19603f3d011682016040523d82523d6000602084013e61102a565b606091505b5091509150600082801561103f575081516020145b61104a57600061105b565b61105b82600063ffffffff612b7216565b9050600087868151811061106b57fe5b6020026020010151828161107b57fe5b049050806110975760009b5050505050505050505050506106cd565b8b8110806110a357508b155b156110ac57809b505b50505050505b600101610efa565b5050505050611490565b6001600160e01b031981167fc339d10a0000000000000000000000000000000000000000000000000000000014156111f7576040516060907fa85e59e4000000000000000000000000000000000000000000000000000000009061113390869060009081908190602401614d97565b60408051601f198184030181529181526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff166001600160e01b03199094169390931790925260045491519092506000916001600160a01b03169061119a90849061486c565b600060405180830381855afa9150503d80600081146111d5576040519150601f19603f3d011682016040523d82523d6000602084013e6111da565b606091505b50509050806111ea5760006111ee565b6000195b93505050611490565b6001600160e01b031981167fdc1600f30000000000000000000000000000000000000000000000000000000014156113205760008073__$808f8f452496495931fd70b932e88106d9$__63750bdb30866040518263ffffffff1660e01b81526004016112639190614d84565b60006040518083038186803b15801561127b57600080fd5b505af415801561128f573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526112b79190810190614085565b5092509250506112c5612b7e565b6001600160a01b0316826001600160a01b03161480156112f257506005546001600160a01b038281169116145b1561131957600061130a611304612b96565b88612a7a565b905061131581612bae565b9450505b5050611490565b6001600160e01b031981167f94cfcdd70000000000000000000000000000000000000000000000000000000014156114905760608073__$808f8f452496495931fd70b932e88106d9$__63bbb2dcf6866040518263ffffffff1660e01b815260040161138c9190614d84565b60006040518083038186803b1580156113a457600080fd5b505af41580156113b8573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526113e09190810190614241565b80519194509250905060005b81811461148b578381815181106113ff57fe5b60200260200101516000141561141457611483565b60006114338985848151811061142657fe5b6020026020010151610ba1565b9050600085838151811061144357fe5b6020026020010151828161145357fe5b0490508061146b5760009750505050505050506106cd565b87811080611477575087155b15611480578097505b50505b6001016113ec565b505050505b5092915050565b60008073__$808f8f452496495931fd70b932e88106d9$__638f4ce479846040518263ffffffff1660e01b81526004016114d19190614d84565b604080518083038186803b1580156114e857600080fd5b505af41580156114fc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250611520919081019061404e565b915091505b915091565b6004546001600160a01b031681565b6000546001600160a01b031681565b600080606080606073__$808f8f452496495931fd70b932e88106d9$__639eadc835876040518263ffffffff1660e01b81526004016115879190614d84565b60006040518083038186803b15801561159f57600080fd5b505af41580156115b3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526115db91908101906140ef565b939a9299509097509550909350915050565b6000610934846116696040518060400160405280600b81526020017f30782050726f746f636f6c0000000000000000000000000000000000000000008152506040518060400160405280600581526020017f332e302e3000000000000000000000000000000000000000000000000000000081525087876129a3565b612dac565b606080825160405190808252806020026020018201604052801561169c578160200160208202803883390190505b50905060005b83518114611490578381815181106116b657fe5b60200260200101516001600160a01b0316318282815181106116d457fe5b60209081029190910101526001016116a2565b6000546040517f02cffc4500000000000000000000000000000000000000000000000000000000815260609173__$988eef118a938b5a4e7336ebab0aae599b$__916302cffc459161174d916001600160a01b03909116908890889088906004016148d9565b60006040518083038186803b15801561176557600080fd5b505af4158015611779573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109349190810190613e68565b6040517fa6627e9f00000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__9063a6627e9f906117f69086908690600401614a58565b60006040518083038186803b15801561180e57600080fd5b505af4158015611822573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261184a91908101906142de565b9392505050565b6006546001600160a01b031681565b6040517fb43cffe100000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__9063b43cffe1906118b990889088908890889060040161499f565b60006040518083038186803b1580156118d157600080fd5b505af41580156118e5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261190d91908101906142de565b95945050505050565b600060608073__$808f8f452496495931fd70b932e88106d9$__63bbb2dcf6856040518263ffffffff1660e01b81526004016119529190614d84565b60006040518083038186803b15801561196a57600080fd5b505af415801561197e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261067c9190810190614241565b60075481565b6005546001600160a01b031681565b6000806060600073__$808f8f452496495931fd70b932e88106d9$__63ca49f47c866040518263ffffffff1660e01b81526004016119f99190614d84565b60006040518083038186803b158015611a1157600080fd5b505af4158015611a25573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109cd9190810190614199565b606060008251905080604051908082528060200260200182016040528015611a7f578160200160208202803883390190505b50915060005b8181146107d257611a9c8585838151811061142657fe5b838281518110611aa857fe5b6020908102919091010152600101611a85565b600080611ace838263ffffffff612a0e16565b90506001600160e01b031981167f94cfcdd7000000000000000000000000000000000000000000000000000000001415611c395760608073__$808f8f452496495931fd70b932e88106d9$__63bbb2dcf6866040518263ffffffff1660e01b8152600401611b3c9190614d84565b60006040518083038186803b158015611b5457600080fd5b505af4158015611b68573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052611b909190810190614241565b80519194509250905060005b818114611c2e57838181518110611baf57fe5b602002602001015160001415611bc457611c26565b6000611bd6898584815181106107a657fe5b90506000858381518110611be657fe5b60200260200101518281611bf657fe5b04905080611c0e5760009750505050505050506106cd565b87811080611c1a575087155b15611c23578097505b50505b600101611b9c565b506106cd9350505050565b6001600160e01b031981167ff47261b0000000000000000000000000000000000000000000000000000000001415611c9a576000611c7e84601063ffffffff612a4716565b600154909150610c0790829087906001600160a01b0316612dbb565b6001600160e01b031981167f02571792000000000000000000000000000000000000000000000000000000001415611fea5760008073__$808f8f452496495931fd70b932e88106d9$__6304a5618a866040518263ffffffff1660e01b8152600401611d069190614d84565b60606040518083038186803b158015611d1e57600080fd5b505af4158015611d32573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250611d569190810190614201565b600254604051929550909350606092507fe985e9c50000000000000000000000000000000000000000000000000000000091611da2918a916001600160a01b039091169060240161489c565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905060006060846001600160a01b031683604051611e1d919061486c565b600060405180830381855afa9150503d8060008114611e58576040519150601f19603f3d011682016040523d82523d6000602084013e611e5d565b606091505b5091509150811580611e7157508051602014155b80611e8d5750611e8881600063ffffffff612b7216565b600114155b15611fdb576040516060907f081812fc0000000000000000000000000000000000000000000000000000000090611ec8908790602401614c01565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050509050856001600160a01b031681604051611f3f919061486c565b600060405180830381855afa9150503d8060008114611f7a576040519150601f19603f3d011682016040523d82523d6000602084013e611f7f565b606091505b509093509150828015611f93575081516020145b8015611fc257506002546001600160a01b0316611fb783600c63ffffffff612a4716565b6001600160a01b0316145b611fcd576000611fd0565b60015b60ff169750506110ba565b60001996505050505050611490565b6001600160e01b031981167fa7cb5fb7000000000000000000000000000000000000000000000000000000001415612211576040517f9eadc83500000000000000000000000000000000000000000000000000000000815260009073__$808f8f452496495931fd70b932e88106d9$__90639eadc8359061206f908790600401614d84565b60006040518083038186803b15801561208757600080fd5b505af415801561209b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526120c391908101906140ef565b5050600354604051929450606093507fe985e9c5000000000000000000000000000000000000000000000000000000009261210d925089916001600160a01b03169060240161489c565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905060006060836001600160a01b031683604051612188919061486c565b600060405180830381855afa9150503d80600081146121c3576040519150601f19603f3d011682016040523d82523d6000602084013e6121c8565b606091505b50915091508180156121db575080516020145b80156121f757506121f381600063ffffffff612b7216565b6001145b612202576000612206565b6000195b955050505050611490565b6001600160e01b031981167fc339d10a00000000000000000000000000000000000000000000000000000000141561224d576000199150611490565b6001600160e01b031981167fdc1600f30000000000000000000000000000000000000000000000000000000014156114905760008073__$808f8f452496495931fd70b932e88106d9$__63750bdb30866040518263ffffffff1660e01b81526004016122b99190614d84565b60006040518083038186803b1580156122d157600080fd5b505af41580156122e5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261230d9190810190614085565b50925092505061231b612b7e565b6001600160a01b0316826001600160a01b031614801561234857506005546001600160a01b038281169116145b1561239257600061236d61235a612b96565b60055489906001600160a01b0316612dbb565b905060001981146123865761238181612bae565b61238a565b6000195b94505061243d565b6006546001600160a01b038281169116141561243d5773__$1fa048dff19b08eb02dfb6ebf13779c5bf$__630e70a03387836123cc612ec5565b6040518463ffffffff1660e01b81526004016123ea939291906148b6565b60206040518083038186803b15801561240257600080fd5b505af4158015612416573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061243a9190810190614641565b93505b50505092915050565b600080546040517f8dccde0400000000000000000000000000000000000000000000000000000000815273__$988eef118a938b5a4e7336ebab0aae599b$__91638dccde0491610ad0916001600160a01b031690889088908890600401614a23565b6040517fd3d862d100000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__9063d3d862d1906117f69086908690600401614b6c565b6040517fd469502800000000000000000000000000000000000000000000000000000000815260009073__$808f8f452496495931fd70b932e88106d9$__9063d469502890612550908590600401614d84565b60206040518083038186803b15801561256857600080fd5b505af415801561257c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506108819190810190614033565b6060806060600085519050806040519080825280602002602001820160405280156125e557816020015b6125d26136a6565b8152602001906001900390816125ca5790505b50935080604051908082528060200260200182016040528015612612578160200160208202803883390190505b5092508060405190808252806020026020018201604052801561263f578160200160208202803883390190505b50915060005b8181146126cf5761267c87828151811061265b57fe5b602002602001015187838151811061266f57fe5b60200260200101516126f1565b875188908590811061268a57fe5b6020026020010187858151811061269d57fe5b602002602001018786815181106126b057fe5b9315156020948502919091019093019290925291905252600101612645565b50509250925092565b6060806126e58484611a4d565b91506106a28484610757565b6126f96136a6565b600080546040517f9d3fa4b900000000000000000000000000000000000000000000000000000000815282916001600160a01b031690639d3fa4b990612743908890600401614eca565b60606040518083038186803b15801561275b57600080fd5b505afa15801561276f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506127939190810190614439565b85516000546040517fa12dcc6f00000000000000000000000000000000000000000000000000000000815292955090916001600160a01b039091169063a12dcc6f906127e59089908990600401614f08565b60206040518083038186803b1580156127fd57600080fd5b505afa158015612811573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506128359190810190614013565b9150600061284287612edd565b90506000612863886101800151896101400151612f0990919063ffffffff16565b1561289857612891826128878a60c001518b60800151612f2e90919063ffffffff16565b8a60a00151612f4a565b9050612905565b60c08801516128b4576128918289608001518a60a00151612f4a565b60006128c5848a61018001516106ab565b905060006128dc848b608001518c60a00151612f4a565b905060006128f3838c60c001518d60a00151612f4a565b90506128ff828261298d565b93505050505b61292961292387604001518a60a00151612f6c90919063ffffffff16565b8261298d565b945061293488612f8b565b61293d57600094505b60038651600681111561294c57fe5b1461295657600094505b5050509250925092565b6001546001600160a01b031681565b6002546001600160a01b031681565b6003546001600160a01b031681565b600081831061299c578161184a565b5090919050565b8351602094850120835193850193909320604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f815295860194909452928401929092526060830152608082015260a0902090565b600061184a82612a0985612ff2565b61306d565b60008160040183511015612a3457612a34612a2f60038551856004016130a7565b613116565b5001602001516001600160e01b03191690565b60008160140183511015612a6857612a68612a2f60048551856014016130a7565b5001601401516001600160a01b031690565b60405160009081906060906001600160a01b038616907f70a082310000000000000000000000000000000000000000000000000000000090612ac0908790602401614888565b60408051601f198184030181529181526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff166001600160e01b0319909416939093179092529051612b13919061486c565b600060405180830381855afa9150503d8060008114612b4e576040519150601f19603f3d011682016040523d82523d6000602084013e612b53565b606091505b5091509150818015612b66575080516020145b156107d2576106c88160005b600061184a838361311e565b736b175474e89094c44da98b954eedeac495271d0f90565b7306af07097c9eeb7fd685c692751d5c66db49c21590565b600080612bb9612b96565b6001600160a01b0316634ba2363a6040518163ffffffff1660e01b8152600401602060405180830381600087803b158015612bf357600080fd5b505af1158015612c07573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612c2b9190810190614311565b90506000816001600160a01b03166320aba08b6040518163ffffffff1660e01b8152600401602060405180830381600087803b158015612c6a57600080fd5b505af1158015612c7e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612ca29190810190614641565b4211612d2057816001600160a01b031663c92aecc46040518163ffffffff1660e01b8152600401602060405180830381600087803b158015612ce357600080fd5b505af1158015612cf7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612d1b9190810190614641565b612d93565b816001600160a01b0316639f678cca6040518163ffffffff1660e01b8152600401602060405180830381600087803b158015612d5b57600080fd5b505af1158015612d6f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612d939190810190614641565b9050610934816b033b2e3c9fd0803ce800000086612f4a565b600061184a82612a0985613148565b60405160009081906060906001600160a01b038716907fdd62ed3e0000000000000000000000000000000000000000000000000000000090612e03908890889060240161489c565b60408051601f198184030181529181526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff166001600160e01b0319909416939093179092529051612e56919061486c565b600060405180830381855afa9150503d8060008114612e91576040519150601f19603f3d011682016040523d82523d6000602084013e612e96565b606091505b5091509150818015612ea9575080516020145b15612ebc57612eb9816000612b72565b92505b50509392505050565b731e0447b19bb6ecfdae1e4ae1694b0c3659614e4e90565b6000806000612eeb84613201565b91509150612ef9828261298d565b925061093483856080015161298d565b60008151835114801561184a5750508051602091820120825192909101919091201490565b60008282018381101561184a5761184a612a2f60008686613414565b600061093483612f60868563ffffffff61343316565b9063ffffffff61346416565b600082821115612f8557612f85612a2f60028585613414565b50900390565b6000612f9b82610140015161348e565b8015612fbc575060c08201511580612fbc5750612fbc82610180015161348e565b8015612fd15750612fd182610160015161348e565b8015610881575060e082015115806108815750610881826101a0015161348e565b608081810151825160208085015160408087015160609788015186519685019690962082517fec69816980a3a3ca4554410e60253953e9ff375ba4536a98adfa15cc7154150881529485019590955290830191909152948101949094526001600160a01b039091169183019190915260a082015260c0902090565b6040517f19010000000000000000000000000000000000000000000000000000000000008152600281019290925260228201526042902090565b6060632800659560e01b8484846040516024016130c693929190614df7565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff166001600160e01b03199093169290921790915290509392505050565b805160208201fd5b6000816020018351101561313f5761313f612a2f60058551856020016130a7565b50016020015190565b6101408101516101608201516101808301516101a08401516000937ff80322eb8376aafb64eadf8f0d7623f22130fd9491a221e902b713cb984a75349390929091602087101561319457fe5b601f1987018051610140890180516101608b0180516101808d0180516101a08f0180519d89528c5160209d8e012087528b519b8d019b909b2084528951998c01999099208152875197909a019690962088526101e085209390945290529190529252919091529050919050565b600080600483610140015151101561321e57506000905080611525565b610140830151600090613237908263ffffffff612a0e16565b90506001600160e01b031981167fdc1600f30000000000000000000000000000000000000000000000000000000014156133e4576101408401516040517f750bdb3000000000000000000000000000000000000000000000000000000000815260009173__$808f8f452496495931fd70b932e88106d9$__9163750bdb30916132c291600401614d84565b60006040518083038186803b1580156132da57600080fd5b505af41580156132ee573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526133169190810190614085565b506006549093506001600160a01b038085169116141591506133e290505773__$1fa048dff19b08eb02dfb6ebf13779c5bf$__63d12a796086613357612ec5565b6040518363ffffffff1660e01b8152600401613374929190614edd565b60206040518083038186803b15801561338c57600080fd5b505af41580156133a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506133c49190810190614641565b6133d78660000151876101400151611abb565b935093505050611525565b505b6133f78460000151856101400151610ba1565b61340a8560000151866101400151611abb565b9250925050915091565b606063e946c1bb60e01b8484846040516024016130c693929190614dd5565b600082613442575060006106cd565b8282028284828161344f57fe5b041461184a5761184a612a2f60018686613414565b60008161347a5761347a612a2f60038585613414565b600082848161348557fe5b04949350505050565b6000602082518161349b57fe5b066004146134ab57506000610884565b60006134bd838263ffffffff612a0e16565b90506001600160e01b031981167f94cfcdd700000000000000000000000000000000000000000000000000000000146134fa576001915050610884565b6040517fbbb2dcf600000000000000000000000000000000000000000000000000000000815260609073__$808f8f452496495931fd70b932e88106d9$__9063bbb2dcf69061354d908790600401614d84565b60006040518083038186803b15801561356557600080fd5b505af4158015613579573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526135a19190810190614241565b80519093509150600090505b8181146136375760006135dd60008584815181106135c757fe5b6020026020010151612a0e90919063ffffffff16565b90506001600160e01b031981167f0257179200000000000000000000000000000000000000000000000000000000141561362e5761361b8483613643565b1561362e57600095505050505050610884565b506001016135ad565b50600195945050505050565b8151600090600183015b818110156107d25761368e85828151811061366457fe5b602002602001015186868151811061367857fe5b6020026020010151612f0990919063ffffffff16565b1561369e576001925050506106cd565b60010161364d565b6040805160608101909152806000815260006020820181905260409091015290565b80356106cd81614fd6565b80516106cd81614fd6565b600082601f8301126136ee578081fd5b81356137016136fc82614f62565b614f3b565b81815291506020808301908481018184028601820187101561372257600080fd5b60005b8481101561148b57813561373881614fd6565b84529282019290820190600101613725565b600082601f83011261375a578081fd5b81356137686136fc82614f62565b8181529150602080830190840160005b838110156137a5576137908760208435890101613939565b83526020928301929190910190600101613778565b5050505092915050565b600082601f8301126137bf578081fd5b81516137cd6136fc82614f62565b8181529150602080830190840160005b838110156137a5576137f58760208451890101613987565b835260209283019291909101906001016137dd565b600082601f83011261381a578081fd5b81356138286136fc82614f62565b8181529150602080830190840160005b838110156137a55761385087602084358901016139dc565b83526020928301929190910190600101613838565b600082601f830112613875578081fd5b81356138836136fc82614f62565b8181529150602080830190848101818402860182018710156138a457600080fd5b60005b8481101561148b578135845292820192908201906001016138a7565b600082601f8301126138d3578081fd5b81516138e16136fc82614f62565b81815291506020808301908481018184028601820187101561390257600080fd5b60005b8481101561148b57815184529282019290820190600101613905565b80516001600160e01b0319811681146106cd57600080fd5b600082601f830112613949578081fd5b81356139576136fc82614f82565b915080825283602082850101111561396e57600080fd5b8060208401602084013760009082016020015292915050565b600082601f830112613997578081fd5b81516139a56136fc82614f82565b91508082528360208285010111156139bc57600080fd5b611490816020840160208601614fa6565b8051600581106106cd57600080fd5b60006101c08083850312156139ef578182fd5b6139f881614f3b565b915050613a0583836136c8565b8152613a1483602084016136c8565b6020820152613a2683604084016136c8565b6040820152613a3883606084016136c8565b60608201526080820135608082015260a082013560a082015260c082013560c082015260e082013560e08201526101008083013581830152506101208083013581830152506101408083013567ffffffffffffffff80821115613a9a57600080fd5b613aa686838701613939565b83850152610160925082850135915080821115613ac257600080fd5b613ace86838701613939565b83850152610180925082850135915080821115613aea57600080fd5b613af686838701613939565b838501526101a0925082850135915080821115613b1257600080fd5b50613b1f85828601613939565b82840152505092915050565b60006101c0808385031215613b3e578182fd5b613b4781614f3b565b915050613b5483836136d3565b8152613b6383602084016136d3565b6020820152613b7583604084016136d3565b6040820152613b8783606084016136d3565b60608201526080820151608082015260a082015160a082015260c082015160c082015260e082015160e08201526101008083015181830152506101208083015181830152506101408083015167ffffffffffffffff80821115613be957600080fd5b613bf586838701613987565b83850152610160925082850151915080821115613c1157600080fd5b613c1d86838701613987565b83850152610180925082850151915080821115613c3957600080fd5b613c4586838701613987565b838501526101a0925082850151915080821115613c6157600080fd5b50613b1f85828601613987565b600060208284031215613c7f578081fd5b813561184a81614fd6565b60008060408385031215613c9c578081fd5b8235613ca781614fd6565b9150602083013567ffffffffffffffff811115613cc2578182fd5b613cce8582860161374a565b9150509250929050565b60008060008060808587031215613ced578182fd5b8435613cf881614fd6565b9350602085013567ffffffffffffffff80821115613d14578384fd5b613d2088838901613865565b94506040870135915080821115613d35578384fd5b613d4188838901613865565b93506060870135915080821115613d56578283fd5b50613d6387828801613939565b91505092959194509250565b60008060408385031215613d81578182fd5b8235613d8c81614fd6565b9150602083013567ffffffffffffffff811115613da7578182fd5b613cce85828601613939565b600080600060608486031215613dc7578081fd5b8335613dd281614fd6565b9250602084013567ffffffffffffffff811115613ded578182fd5b613df986828701613939565b925050604084013590509250925092565b60008060408385031215613e1c578182fd5b8235613e2781614fd6565b946020939093013593505050565b600060208284031215613e46578081fd5b813567ffffffffffffffff811115613e5c578182fd5b610934848285016136de565b60006020808385031215613e7a578182fd5b825167ffffffffffffffff811115613e90578283fd5b80840185601f820112613ea1578384fd5b80519150613eb16136fc83614f62565b8281528381019082850185850284018601891015613ecd578687fd5b8693505b84841015613ef757613ee389826139cd565b835260019390930192918501918501613ed1565b50979650505050505050565b600080600060608486031215613f17578081fd5b833567ffffffffffffffff80821115613f2e578283fd5b613f3a8783880161380a565b94506020860135915080821115613f4f578283fd5b613f5b878388016136de565b93506040860135915080821115613f70578283fd5b50613f7d86828701613865565b9150509250925092565b60008060408385031215613f99578182fd5b823567ffffffffffffffff80821115613fb0578384fd5b613fbc8683870161380a565b93506020850135915080821115613fd1578283fd5b50613cce8582860161374a565b60008060408385031215613ff0578182fd5b823567ffffffffffffffff80821115614007578384fd5b613fbc86838701613865565b600060208284031215614024578081fd5b8151801515811461184a578182fd5b600060208284031215614044578081fd5b61184a8383613921565b60008060408385031215614060578182fd5b61406a8484613921565b9150602083015161407a81614fd6565b809150509250929050565b6000806000806080858703121561409a578182fd5b84516140a581614feb565b60208601519094506140b681614fd6565b60408601519093506140c781614fd6565b606086015190925067ffffffffffffffff8111156140e3578182fd5b613d6387828801613987565b600080600080600060a08688031215614106578283fd5b6141108787613921565b9450602086015161412081614fd6565b604087015190945067ffffffffffffffff8082111561413d578485fd5b61414989838a016138c3565b9450606088015191508082111561415e578283fd5b61416a89838a016138c3565b9350608088015191508082111561417f578283fd5b5061418c88828901613987565b9150509295509295909350565b600080600080608085870312156141ae578182fd5b6141b88686613921565b935060208501516141c881614fd6565b604086015190935067ffffffffffffffff8111156141e4578283fd5b6141f087828801613987565b606096909601519497939650505050565b600080600060608486031215614215578081fd5b61421f8585613921565b9250602084015161422f81614fd6565b80925050604084015190509250925092565b600080600060608486031215614255578081fd5b835161426081614feb565b602085015190935067ffffffffffffffff8082111561427d578283fd5b614289878388016138c3565b9350604086015191508082111561429e578283fd5b50613f7d868287016137af565b6000602082840312156142bc578081fd5b813567ffffffffffffffff8111156142d2578182fd5b61093484828501613939565b6000602082840312156142ef578081fd5b815167ffffffffffffffff811115614305578182fd5b61093484828501613987565b600060208284031215614322578081fd5b815161184a81614fd6565b60006020828403121561433e578081fd5b81516005811061184a578182fd5b60008060008060808587031215614361578182fd5b845167ffffffffffffffff80821115614378578384fd5b61438488838901613987565b955060209150818701518181111561439a578485fd5b80880189601f8201126143ab578586fd5b805191506143bb6136fc83614f62565b82815284810190828601885b858110156143f0576143de8e898451880101613b2b565b845292870192908701906001016143c7565b505060408b015190985094505050508082111561440b578384fd5b614417888389016138c3565b9350606087015191508082111561442c578283fd5b50613d63878288016137af565b60006060828403121561444a578081fd5b6144546060614f3b565b825160078110614462578283fd5b8152602083810151908201526040928301519281019290925250919050565b600080600060608486031215614495578081fd5b833567ffffffffffffffff8111156144ab578182fd5b6144b7868287016139dc565b93505060208401356144c881614fd6565b929592945050506040919091013590565b600080604083850312156144eb578182fd5b823567ffffffffffffffff80821115614502578384fd5b61450e868387016139dc565b93506020850135915080821115614523578283fd5b50613cce85828601613939565b600080600060608486031215614544578081fd5b833567ffffffffffffffff81111561455a578182fd5b614566868287016139dc565b93505060208401359150604084013561457e81614fd6565b809150509250925092565b60008060006060848603121561459d578081fd5b833567ffffffffffffffff808211156145b4578283fd5b81860160a081890312156145c6578384fd5b6145d060a0614f3b565b92508035835260208101356020840152604081013560408401526145f788606083016136c8565b606084015260808101358281111561460d578485fd5b61461989828401613939565b60808501525091945050506020840135915061463885604086016136c8565b90509250925092565b600060208284031215614652578081fd5b5051919050565b6001600160a01b0316815260200190565b60006146768383614748565b505060600190565b6001600160a01b03169052565b60008282518085526020808601955080818302840101818601855b848110156146d457601f198684030189526146c283835161471c565b988401989250908301906001016146a6565b5090979650505050505050565b6000815180845260208401935060208301825b828110156147125781518652602095860195909101906001016146f4565b5093949350505050565b60008151808452614734816020860160208601614fa6565b601f01601f19169290920160200192915050565b80516007811061475457fe5b825260208181015190830152604090810151910152565b60006101c061477b84845161467e565b602083015161478d602086018261467e565b5060408301516147a0604086018261467e565b5060608301516147b3606086018261467e565b506080830151608085015260a083015160a085015260c083015160c085015260e083015160e085015261010080840151818601525061012080840151818601525061014080840151828287015261480c8387018261471c565b91505061016091508184015185820383870152614829828261471c565b925050506101808084015185830382870152614845838261471c565b9150506101a091508184015185820383870152614862828261471c565b9695505050505050565b6000825161487e818460208701614fa6565b9190910192915050565b6001600160a01b0391909116815260200190565b6001600160a01b0392831681529116602082015260400190565b6001600160a01b0393841681529183166020830152909116604082015260600190565b6000608082016001600160a01b038716835260206080818501528187516149008185614c01565b91508193508281028201838a01865b8381101561493957868303855261492783835161476b565b9486019492509085019060010161490f565b50508681036040880152809450885192506149548382614c01565b94505050818701845b8281101561497e57614970858351614659565b94509083019060010161495d565b50505050828103606084015261499481856146e1565b979650505050505050565b60006001600160a01b0386168252608060208301526149c160808301866146e1565b82810360408401526149d381866146e1565b83810360608501526149e5818661471c565b98975050505050505050565b60006001600160a01b038516825260606020830152614a13606083018561471c565b9050826040830152949350505050565b60006001600160a01b03808716835260806020840152614a46608084018761476b565b94166040830152506060015292915050565b6001600160a01b03929092168252602082015260400190565b602080825282518282018190526000918401906040840190835b81811015614ab357835160058110614a9f57fe5b835260209384019390920191600101614a8b565b509095945050505050565b60006060820160608352808651614ad58184614c01565b915060209250828801845b82811015614b0157614af384835161466a565b935090840190600101614ae0565b50505083810382850152614b1581876146e1565b84810360408601528551808252908301915082860190845b81811015614b4b578251151584529284019291840191600101614b2d565b509198975050505050505050565b60006020825261184a60208301846146e1565b600060408252614b7f60408301856146e1565b602083820381850152818551808452828401915082838202850101838801865b83811015614bcd57601f19878403018552614bbb83835161471c565b94860194925090850190600101614b9f565b50909998505050505050505050565b600060408252614bef60408301856146e1565b828103602084015261190d81856146e1565b90815260200190565b6001600160e01b031991909116815260200190565b6001600160e01b03199290921682526001600160a01b0316602082015260400190565b60006001600160e01b0319861682526001600160a01b03808616602084015280851660408401525060806060830152614862608083018461471c565b60006001600160e01b0319871682526001600160a01b038616602083015260a06040830152614cb060a08301866146e1565b8281036060840152614cc281866146e1565b8381036080850152614cd4818661471c565b9998505050505050505050565b60006001600160e01b0319861682526001600160a01b038516602083015260806040830152614d13608083018561471c565b905082606083015295945050505050565b6001600160e01b03199390931683526001600160a01b03919091166020830152604082015260600190565b60006001600160e01b03198516825260606020830152614d7260608301856146e1565b8281036040840152614862818561468b565b60006020825261184a602083018461471c565b600060808252614daa608083018761471c565b6001600160a01b03958616602084015293909416604082015260ff9190911660609091015292915050565b6060810160048510614de357fe5b938152602081019290925260409091015290565b6060810160088510614de357fe5b6020810160058310614e1357fe5b91905290565b600060808252614e2c608083018761471c565b602083820381850152818751808452828401915082838202850101838a01865b83811015614e7a57601f19878403018552614e6883835161476b565b94860194925090850190600101614e4c565b50508681036040880152614e8e818a6146e1565b9450505050508281036060840152614994818561468b565b60a08101614eb48286614748565b8360608301528215156080830152949350505050565b60006020825261184a602083018461476b565b600060408252614ef0604083018561476b565b90506001600160a01b03831660208301529392505050565b600060408252614f1b604083018561476b565b828103602084015261190d818561471c565b918252602082015260400190565b60405181810167ffffffffffffffff81118282101715614f5a57600080fd5b604052919050565b600067ffffffffffffffff821115614f78578081fd5b5060209081020190565b600067ffffffffffffffff821115614f98578081fd5b50601f01601f191660200190565b60005b83811015614fc1578181015183820152602001614fa9565b83811115614fd0576000848401525b50505050565b6001600160a01b038116811461075457600080fd5b6001600160e01b03198116811461075457600080fdfea365627a7a7231582035e812e328807b8502bbdb23eb0d94c3493497753f571da44447373be9944d316c6578706572696d656e74616cf564736f6c63430005110040';
DevUtilsContract.contractName = 'DevUtils';
// tslint:disable:max-file-line-count
// tslint:enable:no-unbound-method no-parameter-reassignment no-consecutive-blank-lines ordered-imports align
// tslint:enable:trailing-comma whitespace no-trailing-whitespace
//# sourceMappingURL=dev_utils.js.map