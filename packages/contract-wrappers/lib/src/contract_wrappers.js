"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractWrappers = void 0;
const assert_1 = require("@0x/assert");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const contract_wrappers_config_schema_1 = require("./contract_wrappers_config_schema");
const coordinator_1 = require("./generated-wrappers/coordinator");
const dev_utils_1 = require("./generated-wrappers/dev_utils");
const erc20_token_1 = require("./generated-wrappers/erc20_token");
const erc721_token_1 = require("./generated-wrappers/erc721_token");
const exchange_1 = require("./generated-wrappers/exchange");
const forwarder_1 = require("./generated-wrappers/forwarder");
const i_zero_ex_1 = require("./generated-wrappers/i_zero_ex");
const staking_1 = require("./generated-wrappers/staking");
const weth9_1 = require("./generated-wrappers/weth9");
const contract_addresses_1 = require("./utils/contract_addresses");
/**
 * The ContractWrappers class contains smart contract wrappers helpful when building on 0x protocol.
 */
class ContractWrappers {
    /**
     * Instantiates a new ContractWrappers instance.
     * @param   supportedProvider    The Provider instance you would like the contract-wrappers library to use for interacting with
     *                      the Ethereum network.
     * @param   config      The configuration object. Look up the type for the description.
     * @return  An instance of the ContractWrappers class.
     */
    constructor(supportedProvider, config) {
        assert_1.assert.doesConformToSchema('config', config, contract_wrappers_config_schema_1.ContractWrappersConfigSchema);
        const txDefaults = {
            gasPrice: config.gasPrice,
        };
        this._web3Wrapper = new web3_wrapper_1.Web3Wrapper(supportedProvider, txDefaults);
        const contractsArray = [
            coordinator_1.CoordinatorContract,
            dev_utils_1.DevUtilsContract,
            erc20_token_1.ERC20TokenContract,
            erc721_token_1.ERC721TokenContract,
            exchange_1.ExchangeContract,
            forwarder_1.ForwarderContract,
            staking_1.StakingContract,
            weth9_1.WETH9Contract,
            i_zero_ex_1.IZeroExContract,
        ];
        contractsArray.forEach(contract => {
            this._web3Wrapper.abiDecoder.addABI(contract.ABI(), contract.contractName);
        });
        const contractAddresses = config.contractAddresses === undefined
            ? contract_addresses_1._getDefaultContractAddresses(config.chainId)
            : config.contractAddresses;
        this.weth9 = new weth9_1.WETH9Contract(contractAddresses.etherToken, this.getProvider());
        this.exchange = new exchange_1.ExchangeContract(contractAddresses.exchange, this.getProvider());
        this.forwarder = new forwarder_1.ForwarderContract(contractAddresses.forwarder, this.getProvider());
        this.staking = new staking_1.StakingContract(contractAddresses.stakingProxy, this.getProvider());
        this.devUtils = new dev_utils_1.DevUtilsContract(contractAddresses.devUtils, this.getProvider());
        this.coordinator = new coordinator_1.CoordinatorContract(contractAddresses.coordinator, this.getProvider());
        this.exchangeProxy = new i_zero_ex_1.IZeroExContract(contractAddresses.exchangeProxy, this.getProvider());
        this.contractAddresses = contractAddresses;
    }
    /**
     * Unsubscribes from all subscriptions for all contracts.
     */
    unsubscribeAll() {
        this.exchange.unsubscribeAll();
        this.weth9.unsubscribeAll();
    }
    /**
     * Get the provider instance currently used by contract-wrappers
     * @return  Web3 provider instance
     */
    getProvider() {
        return this._web3Wrapper.getProvider();
    }
    /**
     * Get the abi decoder instance currently used by contract-wrappers
     * @return  AbiDecoder instance
     */
    getAbiDecoder() {
        return this._web3Wrapper.abiDecoder;
    }
}
exports.ContractWrappers = ContractWrappers;
//# sourceMappingURL=contract_wrappers.js.map