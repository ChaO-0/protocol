import { EncoderOverrides, ContractTxFunctionObj, BaseContract } from '@0x/base-contract';
import { BlockRange, ContractAbi, ContractArtifact, DecodedLogArgs, LogWithDecodedArgs, TxData, SupportedProvider } from 'ethereum-types';
import { BigNumber } from '@0x/utils';
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from '@0x/types';
import { Web3Wrapper } from '@0x/web3-wrapper';
export declare type ITransformERC20EventArgs = ITransformERC20QuoteSignerUpdatedEventArgs | ITransformERC20TransformedERC20EventArgs | ITransformERC20TransformerDeployerUpdatedEventArgs;
export declare enum ITransformERC20Events {
    QuoteSignerUpdated = "QuoteSignerUpdated",
    TransformedERC20 = "TransformedERC20",
    TransformerDeployerUpdated = "TransformerDeployerUpdated"
}
export interface ITransformERC20QuoteSignerUpdatedEventArgs extends DecodedLogArgs {
    quoteSigner: string;
}
export interface ITransformERC20TransformedERC20EventArgs extends DecodedLogArgs {
    taker: string;
    inputToken: string;
    outputToken: string;
    inputTokenAmount: BigNumber;
    outputTokenAmount: BigNumber;
}
export interface ITransformERC20TransformerDeployerUpdatedEventArgs extends DecodedLogArgs {
    transformerDeployer: string;
}
export declare class ITransformERC20Contract extends BaseContract {
    /**
     * @ignore
     */
    static deployedBytecode: string | undefined;
    static contractName: string;
    private readonly _methodABIIndex;
    private readonly _subscriptionManager;
    static deployFrom0xArtifactAsync(artifact: ContractArtifact | SimpleContractArtifact, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractArtifact | SimpleContractArtifact;
    }): Promise<ITransformERC20Contract>;
    static deployWithLibrariesFrom0xArtifactAsync(artifact: ContractArtifact, libraryArtifacts: {
        [libraryName: string]: ContractArtifact;
    }, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractArtifact | SimpleContractArtifact;
    }): Promise<ITransformERC20Contract>;
    static deployAsync(bytecode: string, abi: ContractAbi, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractAbi;
    }): Promise<ITransformERC20Contract>;
    /**
     * @returns      The contract ABI
     */
    static ABI(): ContractAbi;
    protected static _deployLibrariesAsync(artifact: ContractArtifact, libraryArtifacts: {
        [libraryName: string]: ContractArtifact;
    }, web3Wrapper: Web3Wrapper, txDefaults: Partial<TxData>, libraryAddresses?: {
        [libraryName: string]: string;
    }): Promise<{
        [libraryName: string]: string;
    }>;
    getFunctionSignature(methodName: string): string;
    getABIDecodedTransactionData<T>(methodName: string, callData: string): T;
    getABIDecodedReturnData<T>(methodName: string, callData: string): T;
    getSelector(methodName: string): string;
    /**
     * Internal version of `transformERC20()`. Only callable from within.
     * @param args A `TransformERC20Args` struct.
     */
    _transformERC20(args: {
        taker: string;
        inputToken: string;
        outputToken: string;
        inputTokenAmount: BigNumber;
        minOutputTokenAmount: BigNumber;
        transformations: Array<{
            deploymentNonce: number | BigNumber;
            data: string;
        }>;
        useSelfBalance: boolean;
        recipient: string;
    }): ContractTxFunctionObj<BigNumber>;
    /**
     * Deploy a new flash wallet instance and replace the current one with it.
     * Useful if we somehow break the current wallet instance.
     * Only callable by the owner.
     */
    createTransformWallet(): ContractTxFunctionObj<string>;
    /**
     * Return the optional signer for `transformERC20()` calldata.
     */
    getQuoteSigner(): ContractTxFunctionObj<string>;
    /**
     * Return the current wallet instance that will serve as the execution
     * context for transformations.
     */
    getTransformWallet(): ContractTxFunctionObj<string>;
    /**
     * Return the allowed deployer for transformers.
     */
    getTransformerDeployer(): ContractTxFunctionObj<string>;
    /**
     * Replace the optional signer for `transformERC20()` calldata.
     * Only callable by the owner.
     * @param quoteSigner The address of the new calldata signer.
     */
    setQuoteSigner(quoteSigner: string): ContractTxFunctionObj<void>;
    /**
     * Replace the allowed deployer for transformers.
     * Only callable by the owner.
     * @param transformerDeployer The address of the new trusted deployer
     *     for transformers.
     */
    setTransformerDeployer(transformerDeployer: string): ContractTxFunctionObj<void>;
    /**
     * Executes a series of transformations to convert an ERC20 `inputToken`
     * to an ERC20 `outputToken`.
     * @param inputToken The token being provided by the sender.        If
     *     `0xeee...`, ETH is implied and should be provided with the call.`
     * @param outputToken The token to be acquired by the sender.        `0xeee...`
     *     implies ETH.
     * @param inputTokenAmount The amount of `inputToken` to take from the sender.
     * @param minOutputTokenAmount The minimum amount of `outputToken` the sender
     *          must receive for the entire transformation to succeed.
     * @param transformations The transformations to execute on the token
     *     balance(s)        in sequence.
     */
    transformERC20(inputToken: string, outputToken: string, inputTokenAmount: BigNumber, minOutputTokenAmount: BigNumber, transformations: Array<{
        deploymentNonce: number | BigNumber;
        data: string;
    }>): ContractTxFunctionObj<BigNumber>;
    /**
     * Subscribe to an event type emitted by the ITransformERC20 contract.
     * @param eventName The ITransformERC20 contract event you would like to subscribe to.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
     * @param callback Callback that gets called when a log is added/removed
     * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
     * @return Subscription token used later to unsubscribe
     */
    subscribe<ArgsType extends ITransformERC20EventArgs>(eventName: ITransformERC20Events, indexFilterValues: IndexedFilterValues, callback: EventCallback<ArgsType>, isVerbose?: boolean, blockPollingIntervalMs?: number): string;
    /**
     * Cancel a subscription
     * @param subscriptionToken Subscription token returned by `subscribe()`
     */
    unsubscribe(subscriptionToken: string): void;
    /**
     * Cancels all existing subscriptions
     */
    unsubscribeAll(): void;
    /**
     * Gets historical logs without creating a subscription
     * @param eventName The ITransformERC20 contract event you would like to subscribe to.
     * @param blockRange Block range to get logs from.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
     * @return Array of logs that match the parameters
     */
    getLogsAsync<ArgsType extends ITransformERC20EventArgs>(eventName: ITransformERC20Events, blockRange: BlockRange, indexFilterValues: IndexedFilterValues): Promise<Array<LogWithDecodedArgs<ArgsType>>>;
    constructor(address: string, supportedProvider: SupportedProvider, txDefaults?: Partial<TxData>, logDecodeDependencies?: {
        [contractName: string]: ContractAbi;
    }, deployedBytecode?: string | undefined, encoderOverrides?: Partial<EncoderOverrides>);
}
//# sourceMappingURL=i_transform_erc20.d.ts.map