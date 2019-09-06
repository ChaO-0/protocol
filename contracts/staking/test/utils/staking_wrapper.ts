import { ERC20ProxyContract } from '@0x/contracts-asset-proxy';
import { artifacts as erc20Artifacts, DummyERC20TokenContract } from '@0x/contracts-erc20';
import { LogDecoder, txDefaults } from '@0x/contracts-test-utils';
import { BigNumber, logUtils } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { Provider, TransactionReceiptWithDecodedLogs } from 'ethereum-types';
import * as _ from 'lodash';

import {
    artifacts,
    EthVaultContract,
    ReadOnlyProxyContract,
    StakingContract,
    StakingPoolRewardVaultContract,
    StakingProxyContract,
    ZrxVaultContract,
} from '../../src';

import { constants } from './constants';
import { StakeBalance } from './types';

export class StakingWrapper {
    private readonly _web3Wrapper: Web3Wrapper;
    private readonly _provider: Provider;
    private readonly _logDecoder: LogDecoder;
    private readonly _ownerAddress: string;
    private readonly _erc20ProxyContract: ERC20ProxyContract;
    private readonly _zrxTokenContract: DummyERC20TokenContract;
    private _stakingContractIfExists?: StakingContract;
    private _stakingProxyContractIfExists?: StakingProxyContract;
    private _zrxVaultContractIfExists?: ZrxVaultContract;
    private _ethVaultContractIfExists?: EthVaultContract;
    private _rewardVaultContractIfExists?: StakingPoolRewardVaultContract;
    private _readOnlyProxyContractIfExists?: ReadOnlyProxyContract;
    public static toBaseUnitAmount(amount: BigNumber | number): BigNumber {
        const decimals = 18;
        const amountAsBigNumber = typeof amount === 'number' ? new BigNumber(amount) : amount;
        const baseUnitAmount = Web3Wrapper.toBaseUnitAmount(amountAsBigNumber, decimals);
        return baseUnitAmount;
    }
    public static toFixedPoint(amount: BigNumber | number, decimals: number): BigNumber {
        const amountAsBigNumber = typeof amount === 'number' ? new BigNumber(amount) : amount;
        const scalar = Math.pow(10, decimals);
        const amountAsFixedPoint = amountAsBigNumber.times(scalar);
        return amountAsFixedPoint;
    }
    public static toFloatingPoint(amount: BigNumber | number, decimals: number): BigNumber {
        const amountAsBigNumber = typeof amount === 'number' ? new BigNumber(amount) : amount;
        const scalar = Math.pow(10, decimals);
        const amountAsFloatingPoint = amountAsBigNumber.dividedBy(scalar);
        return amountAsFloatingPoint;
    }
    public static trimFloat(amount: BigNumber | number, decimals: number): BigNumber {
        const amountAsBigNumber = typeof amount === 'number' ? new BigNumber(amount) : amount;
        const scalar = Math.pow(10, decimals);
        const amountAsFloatingPoint = amountAsBigNumber
            .multipliedBy(scalar)
            .dividedToIntegerBy(1)
            .dividedBy(scalar);
        return amountAsFloatingPoint;
    }
    constructor(
        provider: Provider,
        ownerAddres: string,
        erc20ProxyContract: ERC20ProxyContract,
        zrxTokenContract: DummyERC20TokenContract,
    ) {
        this._web3Wrapper = new Web3Wrapper(provider);
        this._provider = provider;
        const decoderArtifacts = _.merge(artifacts, erc20Artifacts);
        this._logDecoder = new LogDecoder(this._web3Wrapper, decoderArtifacts);
        this._ownerAddress = ownerAddres;
        this._erc20ProxyContract = erc20ProxyContract;
        this._zrxTokenContract = zrxTokenContract;
    }
    public getStakingContract(): StakingContract {
        this._validateDeployedOrThrow();
        return this._stakingContractIfExists as StakingContract;
    }
    public getStakingProxyContract(): StakingProxyContract {
        this._validateDeployedOrThrow();
        return this._stakingProxyContractIfExists as StakingProxyContract;
    }
    public getZrxVaultContract(): ZrxVaultContract {
        this._validateDeployedOrThrow();
        return this._zrxVaultContractIfExists as ZrxVaultContract;
    }
    public getEthVaultContract(): EthVaultContract {
        this._validateDeployedOrThrow();
        return this._ethVaultContractIfExists as EthVaultContract;
    }
    public getStakingPoolRewardVaultContract(): StakingPoolRewardVaultContract {
        this._validateDeployedOrThrow();
        return this._rewardVaultContractIfExists as StakingPoolRewardVaultContract;
    }
    public async deployAndConfigureContractsAsync(): Promise<void> {
        // deploy read-only proxy
        this._readOnlyProxyContractIfExists = await ReadOnlyProxyContract.deployFrom0xArtifactAsync(
            artifacts.ReadOnlyProxy,
            this._provider,
            txDefaults,
            artifacts,
        );
        // deploy zrx vault
        this._zrxVaultContractIfExists = await ZrxVaultContract.deployFrom0xArtifactAsync(
            artifacts.ZrxVault,
            this._provider,
            txDefaults,
            artifacts,
            this._erc20ProxyContract.address,
            this._zrxTokenContract.address,
        );
        // deploy eth vault
        this._ethVaultContractIfExists = await EthVaultContract.deployFrom0xArtifactAsync(
            artifacts.EthVault,
            this._provider,
            txDefaults,
            artifacts,
        );
        // deploy reward vault
        this._rewardVaultContractIfExists = await StakingPoolRewardVaultContract.deployFrom0xArtifactAsync(
            artifacts.StakingPoolRewardVault,
            this._provider,
            txDefaults,
            artifacts,
        );
        // set eth vault in reward vault
        await this._rewardVaultContractIfExists.setEthVault.sendTransactionAsync(
            this._ethVaultContractIfExists.address,
        );
        // configure erc20 proxy to accept calls from zrx vault
        await this._erc20ProxyContract.addAuthorizedAddress.awaitTransactionSuccessAsync(
            this._zrxVaultContractIfExists.address,
        );
        // deploy staking contract
        this._stakingContractIfExists = await StakingContract.deployFrom0xArtifactAsync(
            artifacts.Staking,
            this._provider,
            txDefaults,
            artifacts,
        );
        // deploy staking proxy
        this._stakingProxyContractIfExists = await StakingProxyContract.deployFrom0xArtifactAsync(
            artifacts.StakingProxy,
            this._provider,
            txDefaults,
            artifacts,
            this._stakingContractIfExists.address,
            this._readOnlyProxyContractIfExists.address,
        );
        // set staking proxy contract in zrx vault
        await this._zrxVaultContractIfExists.setStakingContract.awaitTransactionSuccessAsync(
            this._stakingProxyContractIfExists.address,
        );
        // set zrx vault in staking contract
        const setZrxVaultCalldata = this._stakingContractIfExists.setZrxVault.getABIEncodedTransactionData(
            this._zrxVaultContractIfExists.address,
        );
        const setZrxVaultTxData = {
            from: this._ownerAddress,
            to: this._stakingProxyContractIfExists.address,
            data: setZrxVaultCalldata,
        };
        await this._web3Wrapper.awaitTransactionSuccessAsync(
            await this._web3Wrapper.sendTransactionAsync(setZrxVaultTxData),
        );
        // set staking proxy contract in reward vault
        await this._rewardVaultContractIfExists.setStakingContract.awaitTransactionSuccessAsync(
            this._stakingProxyContractIfExists.address,
        );
        // set reward vault in staking contract
        const setStakingPoolRewardVaultCalldata = this._stakingContractIfExists.setStakingPoolRewardVault.getABIEncodedTransactionData(
            this._rewardVaultContractIfExists.address,
        );
        const setStakingPoolRewardVaultTxData = {
            from: this._ownerAddress,
            to: this._stakingProxyContractIfExists.address,
            data: setStakingPoolRewardVaultCalldata,
        };
        await this._web3Wrapper.awaitTransactionSuccessAsync(
            await this._web3Wrapper.sendTransactionAsync(setStakingPoolRewardVaultTxData),
        );
    }
    public async setReadOnlyModeAsync(readOnlyMode: boolean): Promise<TransactionReceiptWithDecodedLogs> {
        const txReceipt = await this.getStakingProxyContract().setReadOnlyMode.awaitTransactionSuccessAsync(
            readOnlyMode,
        );
        return txReceipt;
    }
    public async getEthBalanceAsync(owner: string): Promise<BigNumber> {
        const balance = this._web3Wrapper.getBalanceInWeiAsync(owner);
        return balance;
    }
    ///// STAKE /////
    public async stakeAsync(owner: string, amount: BigNumber): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().stake.getABIEncodedTransactionData(amount);
        const txReceipt = await this._executeTransactionAsync(calldata, owner);
        return txReceipt;
    }
    public async unstakeAsync(owner: string, amount: BigNumber): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().unstake.getABIEncodedTransactionData(amount);
        const txReceipt = await this._executeTransactionAsync(calldata, owner);
        return txReceipt;
    }
    public async moveStakeAsync(
        owner: string,
        _fromStatus: {
            status: number;
            poolId?: string;
        },
        _toStatus: {
            status: number;
            poolId?: string;
        },
        amount: BigNumber,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const fromStatus = {
            status: _fromStatus.status,
            poolId: _fromStatus.poolId !== undefined ? _fromStatus.poolId : constants.NIL_POOL_ID,
        };
        const toStatus = {
            status: _toStatus.status,
            poolId: _toStatus.poolId !== undefined ? _toStatus.poolId : constants.NIL_POOL_ID,
        };
        const calldata = this.getStakingContract().moveStake.getABIEncodedTransactionData(fromStatus, toStatus, amount);
        const txReceipt = await this._executeTransactionAsync(calldata, owner);
        return txReceipt;
    }
    ///// STAKE BALANCES /////
    public async getTotalStakeAsync(owner: string): Promise<BigNumber> {
        const calldata = this.getStakingContract().getTotalStake.getABIEncodedTransactionData(owner);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getTotalStake.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getActiveStakeAsync(owner: string): Promise<StakeBalance> {
        const calldata = this.getStakingContract().getActiveStake.getABIEncodedTransactionData(owner);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getActiveStake.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getInactiveStakeAsync(owner: string): Promise<StakeBalance> {
        const calldata = this.getStakingContract().getInactiveStake.getABIEncodedTransactionData(owner);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getInactiveStake.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getWithdrawableStakeAsync(owner: string): Promise<BigNumber> {
        const calldata = this.getStakingContract().getWithdrawableStake.getABIEncodedTransactionData(owner);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getWithdrawableStake.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getStakeDelegatedByOwnerAsync(owner: string): Promise<StakeBalance> {
        const calldata = this.getStakingContract().getStakeDelegatedByOwner.getABIEncodedTransactionData(owner);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getStakeDelegatedByOwner.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getStakeDelegatedToPoolByOwnerAsync(poolId: string, owner: string): Promise<StakeBalance> {
        const calldata = this.getStakingContract().getStakeDelegatedToPoolByOwner.getABIEncodedTransactionData(
            owner,
            poolId,
        );
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getStakeDelegatedToPoolByOwner.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getTotalStakeDelegatedToPoolAsync(poolId: string): Promise<StakeBalance> {
        const calldata = this.getStakingContract().getTotalStakeDelegatedToPool.getABIEncodedTransactionData(poolId);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getTotalStakeDelegatedToPool.getABIDecodedReturnData(returnData);
        return value;
    }
    ///// POOLS /////
    public async getNextStakingPoolIdAsync(): Promise<string> {
        const calldata = this.getStakingContract().getNextStakingPoolId.getABIEncodedTransactionData();
        const nextPoolId = await this._callAsync(calldata);
        return nextPoolId;
    }
    public async createStakingPoolAsync(
        operatorAddress: string,
        operatorShare: number,
        addOperatorAsMaker: boolean,
    ): Promise<string> {
        const calldata = this.getStakingContract().createStakingPool.getABIEncodedTransactionData(
            operatorShare,
            addOperatorAsMaker,
        );
        const txReceipt = await this._executeTransactionAsync(calldata, operatorAddress);
        const createStakingPoolLog = this._logDecoder.decodeLogOrThrow(txReceipt.logs[0]);
        const poolId = (createStakingPoolLog as any).args.poolId;
        return poolId;
    }
    public async joinStakingPoolAsMakerAsync(
        poolId: string,
        makerAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().joinStakingPoolAsMaker.getABIEncodedTransactionData(poolId);
        const txReceipt = await this._executeTransactionAsync(calldata, makerAddress);
        return txReceipt;
    }
    public async addMakerToStakingPoolAsync(
        poolId: string,
        makerAddress: string,
        operatorAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().addMakerToStakingPool.getABIEncodedTransactionData(
            poolId,
            makerAddress,
        );
        const txReceipt = await this._executeTransactionAsync(calldata, operatorAddress);
        return txReceipt;
    }
    public async removeMakerFromStakingPoolAsync(
        poolId: string,
        makerAddress: string,
        operatorAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().removeMakerFromStakingPool.getABIEncodedTransactionData(
            poolId,
            makerAddress,
        );
        const txReceipt = await this._executeTransactionAsync(calldata, operatorAddress);
        return txReceipt;
    }
    public async getStakingPoolIdOfMakerAsync(makerAddress: string): Promise<string> {
        const calldata = this.getStakingContract().getStakingPoolIdOfMaker.getABIEncodedTransactionData(makerAddress);
        const poolId = await this._callAsync(calldata);
        return poolId;
    }
    public async getNumberOfMakersInStakingPoolAsync(poolId: string): Promise<BigNumber> {
        const calldata = this.getStakingContract().getNumberOfMakersInStakingPool.getABIEncodedTransactionData(poolId);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getNumberOfMakersInStakingPool.getABIDecodedReturnData(returnData);
        return value;
    }
    ///// EPOCHS /////
    public async goToNextEpochAsync(): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().finalizeFees.getABIEncodedTransactionData();
        const txReceipt = await this._executeTransactionAsync(calldata, undefined, new BigNumber(0), true);
        logUtils.log(`Finalization costed ${txReceipt.gasUsed} gas`);
        return txReceipt;
    }
    public async fastForwardToNextEpochAsync(): Promise<void> {
        // increase timestamp of next block
        const epochDurationInSeconds = await this.getEpochDurationInSecondsAsync();
        await this._web3Wrapper.increaseTimeAsync(epochDurationInSeconds.toNumber());
        // mine next block
        await this._web3Wrapper.mineBlockAsync();
    }
    public async skipToNextEpochAsync(): Promise<TransactionReceiptWithDecodedLogs> {
        await this.fastForwardToNextEpochAsync();
        // increment epoch in contracts
        const txReceipt = await this.goToNextEpochAsync();
        await this._web3Wrapper.mineBlockAsync();
        return txReceipt;
    }
    public async getEpochDurationInSecondsAsync(): Promise<BigNumber> {
        const calldata = this.getStakingContract().getEpochDurationInSeconds.getABIEncodedTransactionData();
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getEpochDurationInSeconds.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getCurrentEpochStartTimeInSecondsAsync(): Promise<BigNumber> {
        const calldata = this.getStakingContract().getCurrentEpochStartTimeInSeconds.getABIEncodedTransactionData();
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getCurrentEpochStartTimeInSeconds.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getCurrentEpochEarliestEndTimeInSecondsAsync(): Promise<BigNumber> {
        const calldata = this.getStakingContract().getCurrentEpochEarliestEndTimeInSeconds.getABIEncodedTransactionData();
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getCurrentEpochEarliestEndTimeInSeconds.getABIDecodedReturnData(
            returnData,
        );
        return value;
    }
    public async getCurrentEpochAsync(): Promise<BigNumber> {
        const calldata = this.getStakingContract().getCurrentEpoch.getABIEncodedTransactionData();
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getCurrentEpoch.getABIDecodedReturnData(returnData);
        return value;
    }
    ///// PROTOCOL FEES /////
    public async payProtocolFeeAsync(
        makerAddress: string,
        payerAddress: string,
        protocolFeePaid: BigNumber,
        amount: BigNumber,
        exchangeAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().payProtocolFee.getABIEncodedTransactionData(
            makerAddress,
            payerAddress,
            protocolFeePaid,
        );
        const txReceipt = await this._executeTransactionAsync(calldata, exchangeAddress, amount);
        return txReceipt;
    }
    public async getProtocolFeesThisEpochByPoolAsync(poolId: string): Promise<BigNumber> {
        const calldata = this.getStakingContract().getProtocolFeesThisEpochByPool.getABIEncodedTransactionData(poolId);
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getProtocolFeesThisEpochByPool.getABIDecodedReturnData(returnData);
        return value;
    }
    public async getTotalProtocolFeesThisEpochAsync(): Promise<BigNumber> {
        const calldata = this.getStakingContract().getTotalProtocolFeesThisEpoch.getABIEncodedTransactionData();
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().getTotalProtocolFeesThisEpoch.getABIDecodedReturnData(returnData);
        return value;
    }
    ///// EXCHANGES /////
    public async isValidExchangeAddressAsync(exchangeAddress: string): Promise<boolean> {
        const calldata = this.getStakingContract().isValidExchangeAddress.getABIEncodedTransactionData(exchangeAddress);
        const returnData = await this._callAsync(calldata);
        const isValid = this.getStakingContract().isValidExchangeAddress.getABIDecodedReturnData(returnData);
        return isValid;
    }
    public async addExchangeAddressAsync(
        exchangeAddress: string,
        ownerAddressIfExists?: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().addExchangeAddress.getABIEncodedTransactionData(exchangeAddress);
        const ownerAddress = ownerAddressIfExists !== undefined ? ownerAddressIfExists : this._ownerAddress;
        const txReceipt = await this._executeTransactionAsync(calldata, ownerAddress);
        return txReceipt;
    }
    public async removeExchangeAddressAsync(
        exchangeAddress: string,
        ownerAddressIfExists?: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingContract().removeExchangeAddress.getABIEncodedTransactionData(exchangeAddress);
        const ownerAddress = ownerAddressIfExists !== undefined ? ownerAddressIfExists : this._ownerAddress;
        const txReceipt = await this._executeTransactionAsync(calldata, ownerAddress);
        return txReceipt;
    }
    ///// REWARDS /////
    public async computeRewardBalanceOfStakingPoolMemberAsync(poolId: string, owner: string): Promise<BigNumber> {
        const calldata = this.getStakingContract().computeRewardBalanceOfDelegator.getABIEncodedTransactionData(
            poolId,
            owner,
        );
        const returnData = await this._callAsync(calldata);
        const value = this.getStakingContract().computeRewardBalanceOfDelegator.getABIDecodedReturnData(returnData);
        return value;
    }
    ///// REWARD VAULT /////
    public async rewardVaultEnterCatastrophicFailureModeAsync(
        zeroExMultisigAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingPoolRewardVaultContract().enterCatastrophicFailure.getABIEncodedTransactionData();
        const txReceipt = await this._executeTransactionAsync(calldata, zeroExMultisigAddress);
        return txReceipt;
    }
    public async rewardVaultBalanceOfAsync(poolId: string): Promise<BigNumber> {
        const balance = await this.getStakingPoolRewardVaultContract().balanceOf.callAsync(poolId);
        return balance;
    }
    public async rewardVaultBalanceOfOperatorAsync(poolId: string): Promise<BigNumber> {
        const balance = await this.getStakingPoolRewardVaultContract().balanceOfOperator.callAsync(poolId);
        return balance;
    }
    public async rewardVaultBalanceOfMembersAsync(poolId: string): Promise<BigNumber> {
        const balance = await this.getStakingPoolRewardVaultContract().balanceOfMembers.callAsync(poolId);
        return balance;
    }
    public async rewardVaultRegisterPoolAsync(
        poolId: string,
        poolOperatorShare: number,
        stakingContractAddress: string,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const calldata = this.getStakingPoolRewardVaultContract().registerStakingPool.getABIEncodedTransactionData(
            poolId,
            poolOperatorShare,
        );
        const txReceipt = await this._executeTransactionAsync(calldata, stakingContractAddress);
        return txReceipt;
    }
    ///// ZRX VAULT /////
    public async getZrxVaultBalanceAsync(holder: string): Promise<BigNumber> {
        const balance = await this.getZrxVaultContract().balanceOf.callAsync(holder);
        return balance;
    }
    public async getZrxTokenBalanceAsync(holder: string): Promise<BigNumber> {
        const balance = await this._zrxTokenContract.balanceOf.callAsync(holder);
        return balance;
    }
    public async getZrxTokenBalanceOfZrxVaultAsync(): Promise<BigNumber> {
        const balance = await this._zrxTokenContract.balanceOf.callAsync(this.getZrxVaultContract().address);
        return balance;
    }
    private async _executeTransactionAsync(
        calldata: string,
        from?: string,
        value?: BigNumber,
        includeLogs?: boolean,
    ): Promise<TransactionReceiptWithDecodedLogs> {
        const txData = {
            from: from ? from : this._ownerAddress,
            to: this.getStakingProxyContract().address,
            data: calldata,
            gas: 3000000,
            gasPrice: 0,
            value,
        };
        const txHash = await this._web3Wrapper.sendTransactionAsync(txData);
        const txReceipt = await (includeLogs
            ? this._logDecoder.getTxWithDecodedLogsAsync(txHash)
            : this._web3Wrapper.awaitTransactionSuccessAsync(txHash));
        return txReceipt;
    }
    private async _callAsync(calldata: string, from?: string): Promise<any> {
        const txData = {
            from: from ? from : this._ownerAddress,
            to: this.getStakingProxyContract().address,
            data: calldata,
            gas: 3000000,
        };
        const returnValue = await this._web3Wrapper.callAsync(txData);
        return returnValue;
    }
    private _validateDeployedOrThrow(): void {
        if (this._stakingContractIfExists === undefined) {
            throw new Error('Staking contracts are not deployed. Call `deployStakingContracts`');
        }
    }
}
// tslint:disable-line:max-file-line-count