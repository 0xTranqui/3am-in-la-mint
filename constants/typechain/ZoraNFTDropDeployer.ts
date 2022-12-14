/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers'
import type { FunctionFragment, Result, EventFragment } from '@ethersproject/abi'
import type { Listener, Provider } from '@ethersproject/providers'
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common'

export interface ZoraNFTDropDeployerInterface extends utils.Interface {
  functions: {
    'createDrop(address,string,string,address,uint16,uint64,string,string)': FunctionFragment
  }

  getFunction(nameOrSignatureOrTopic: 'createDrop'): FunctionFragment

  encodeFunctionData(
    functionFragment: 'createDrop',
    values: [string, string, string, string, BigNumberish, BigNumberish, string, string]
  ): string

  decodeFunctionResult(functionFragment: 'createDrop', data: BytesLike): Result

  events: {
    'DeployedNewContract(address,address)': EventFragment
  }

  getEvent(nameOrSignatureOrTopic: 'DeployedNewContract'): EventFragment
}

export interface DeployedNewContractEventObject {
  from: string
  newContract: string
}
export type DeployedNewContractEvent = TypedEvent<
  [string, string],
  DeployedNewContractEventObject
>

export type DeployedNewContractEventFilter = TypedEventFilter<DeployedNewContractEvent>

export interface ZoraNFTDropDeployer extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this
  attach(addressOrName: string): this
  deployed(): Promise<this>

  interface: ZoraNFTDropDeployerInterface

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>
  listeners(eventName?: string): Array<Listener>
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this
  removeAllListeners(eventName?: string): this
  off: OnEvent<this>
  on: OnEvent<this>
  once: OnEvent<this>
  removeListener: OnEvent<this>

  functions: {
    createDrop(
      owner: string,
      name: string,
      symbol: string,
      fundsRecipient: string,
      royaltyBPS: BigNumberish,
      editionSize: BigNumberish,
      metadataURIBase: string,
      metadataContractURI: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>
  }

  createDrop(
    owner: string,
    name: string,
    symbol: string,
    fundsRecipient: string,
    royaltyBPS: BigNumberish,
    editionSize: BigNumberish,
    metadataURIBase: string,
    metadataContractURI: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>

  callStatic: {
    createDrop(
      owner: string,
      name: string,
      symbol: string,
      fundsRecipient: string,
      royaltyBPS: BigNumberish,
      editionSize: BigNumberish,
      metadataURIBase: string,
      metadataContractURI: string,
      overrides?: CallOverrides
    ): Promise<string>
  }

  filters: {
    'DeployedNewContract(address,address)'(
      from?: string | null,
      newContract?: string | null
    ): DeployedNewContractEventFilter
    DeployedNewContract(
      from?: string | null,
      newContract?: string | null
    ): DeployedNewContractEventFilter
  }

  estimateGas: {
    createDrop(
      owner: string,
      name: string,
      symbol: string,
      fundsRecipient: string,
      royaltyBPS: BigNumberish,
      editionSize: BigNumberish,
      metadataURIBase: string,
      metadataContractURI: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>
  }

  populateTransaction: {
    createDrop(
      owner: string,
      name: string,
      symbol: string,
      fundsRecipient: string,
      royaltyBPS: BigNumberish,
      editionSize: BigNumberish,
      metadataURIBase: string,
      metadataContractURI: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>
  }
}
