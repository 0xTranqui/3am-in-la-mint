import { useSigner } from 'wagmi'
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ERC721Drop__factory } from '../constants/typechain'
import { EditionSaleDetails, EditionSalesConfig } from '../models/edition'
import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { AllowListEntry } from 'lib/merkle-proof'
import type { ContractTransaction } from 'ethers'

export interface ERC721DropProviderState {
  purchase: (quantity: number) => Promise<ContractTransaction | undefined>
  purchasePresale: (
    quantity: number,
    allowlistEntry?: AllowListEntry
  ) => Promise<ContractTransaction | undefined>
  updateSalesConfig: (salesConfig: EditionSalesConfig) => Promise<void>
  startPublicSale: () => Promise<void>
  userCanMint: () => Promise<boolean | undefined>
  updateMintCounters: () => void
  totalMinted?: number
  userMintedCount?: number
  fetchTotalMinted: () => Promise<number | undefined>
  fetchUserMintedCount: () => Promise<number | undefined>
  setFundsRecipient: (address: string | undefined) => Promise<boolean>
  setOwner: (address: string | undefined) => Promise<boolean>
  grantAdmin: (address: string | undefined) => Promise<boolean>
  adminMintAirdrop: (addresses: string[]) => Promise<boolean>
  revokeAdmin: (address: string | undefined) => Promise<boolean>
  isAdmin: (address: string | undefined) => Promise<boolean | undefined>
  withdraw: () => Promise<ContractTransaction | undefined>
}

export const ERC721DropContext = React.createContext<ERC721DropProviderState>(
  {} as ERC721DropProviderState
)

function ERC721DropContractProvider({
  children,
  erc721DropAddress,
}: {
  erc721DropAddress: string
  children?: ReactNode
}) {
  const { data: signer } = useSigner()
  const [userMintedCount, setUserMintedCount] = useState<number>()
  const [totalMinted, setTotalMinted] = useState<number>()
  const [saleDetails, setSaleDetails] = useState<EditionSaleDetails>()
  const drop = useMemo(
    () => (signer ? new ERC721Drop__factory(signer).attach(erc721DropAddress) : null),
    [signer, erc721DropAddress]
  )

  useEffect(() => {
    ;(async () => {
      if (!drop || !signer?.getAddress) {
        return
      }
      const config = (await drop.saleDetails()) as unknown

      setSaleDetails(config as EditionSaleDetails)
    })()
  }, [drop, saleDetails, signer])

  const purchase = useCallback(
    async (quantity: number) => {
      if (!drop || !signer?.getAddress || !saleDetails) return
      const tx = await drop.purchase(quantity, {
        value: (saleDetails.publicSalePrice as BigNumber).mul(BigNumber.from(quantity)),
      })
      return tx
    },
    [drop, signer, saleDetails]
  )

  const purchasePresale = useCallback(
    async (quantity: number, allowlistEntry?: AllowListEntry) => {
      if (!drop || !allowlistEntry || !signer?.getAddress) return
      const tx = await drop.purchasePresale(
        quantity,
        allowlistEntry.maxCount,
        allowlistEntry.price,
        allowlistEntry.proof,
        {
          value: (allowlistEntry.price as BigNumber).mul(BigNumber.from(quantity)),
        }
      )
      return tx
    },
    [drop, signer]
  )

  const isAdmin = useCallback(
    async (address: string | undefined) => {
      if (!drop || !address) return false
      return await drop.isAdmin(address)
    },
    [drop]
  )

  const setFundsRecipient = useCallback(
    async (address: string | undefined) => {
      if (!drop || !address) return false
      const tx = await drop.setFundsRecipient(address)
      await tx.wait(2)
      return true
    },
    [drop]
  )

  const setOwner = useCallback(
    async (address: string | undefined) => {
      if (!drop || !address) return false
      const tx = await drop.setOwner(address)
      await tx.wait(2)
      return true
    },
    [drop]
  )

  const grantAdmin = useCallback(
    async (address: string | undefined) => {
      if (!drop || !address) return false
      const adminRole = await drop.DEFAULT_ADMIN_ROLE()
      const tx = await drop.grantRole(adminRole, address)
      await tx.wait(2)
      return true
    },
    [drop]
  )

  const revokeAdmin = useCallback(
    async (address: string | undefined) => {
      if (!drop || !address) return false
      const adminRole = await drop.DEFAULT_ADMIN_ROLE()
      const tx = await drop.revokeRole(adminRole, address)
      await tx.wait(2)
      return true
    },
    [drop]
  )

  const adminMintAirdrop = useCallback(
    async (addresses: string[]) => {
      if (!drop || !addresses) return false
      const tx = await drop.adminMintAirdrop(addresses)
      await tx.wait()
      return true
    },
    [drop]
  )

  const updateSalesConfig = useCallback(
    async (config: EditionSalesConfig) => {
      if (!drop) return

      const tx = await drop.setSaleConfiguration(
        config.publicSalePrice,
        config.maxSalePurchasePerAddress,
        config.publicSaleStart,
        config.publicSaleEnd,
        config.presaleStart,
        config.presaleEnd,
        config.presaleMerkleRoot
      )

      await tx.wait(2)

      const updatedConfig = (await drop.saleDetails()) as unknown
      setSaleDetails(updatedConfig as EditionSaleDetails)
    },
    [drop]
  )

  const startPublicSale = useCallback(async () => {
    if (!saleDetails) {
      return
    }

    await updateSalesConfig({
      ...(saleDetails as EditionSaleDetails),
      publicSaleStart: BigNumber.from(Math.round(Date.now() / 1000).toString()),
      // MAX UINT64
      publicSaleEnd: BigNumber.from('18446744073709551615'),
      maxSalePurchasePerAddress: BigNumber.from(3),
      // For example, 0.01 eth price
      publicSalePrice: parseEther('0.01'),
    })
  }, [saleDetails, updateSalesConfig])

  const userCanMint = async () => {
    if (!signer || !drop || !saleDetails) {
      return undefined
    }
    const address = await signer?.getAddress()
    return (
      (await drop.mintedPerAddress(address)).totalMints.lt(
        saleDetails.maxSalePurchasePerAddress
      ) && saleDetails.totalMinted.lt(saleDetails.maxSupply)
    )
  }

  const updateMintCounters = async () => {
    const userMintedCount = await fetchUserMintedCount()
    const totalMinted = await fetchTotalMinted()
    if (userMintedCount) setUserMintedCount(userMintedCount)
    if (totalMinted) setTotalMinted(totalMinted)
  }

  const fetchUserMintedCount = async () => {
    if (!drop || !signer.getAddress) {
      return undefined
    }
    const address = await signer?.getAddress()
    return address ? (await drop.mintedPerAddress(address)).totalMints.toNumber() : undefined
  }

  const fetchTotalMinted = async () => {
    if (!drop || !signer?.getAddress) {
      return undefined
    }
    return (await drop.totalSupply()).toNumber()
  }

  const withdraw = useCallback(async () => {
    if (!signer || !drop) {
      console.error('missing signer or drop instance', signer, drop)
      return
    }
    const tx = await drop.withdraw()
    return tx
  }, [signer, drop])

  return (
    <ERC721DropContext.Provider
      value={{
        purchase,
        purchasePresale,
        isAdmin,
        setFundsRecipient,
        setOwner,
        grantAdmin,
        revokeAdmin,
        adminMintAirdrop,
        updateSalesConfig,
        startPublicSale,
        userCanMint,
        updateMintCounters,
        totalMinted,
        userMintedCount,
        fetchTotalMinted,
        fetchUserMintedCount,
        withdraw,
      }}
    >
      {children}
    </ERC721DropContext.Provider>
  )
}

export default ERC721DropContractProvider

export const useERC721DropContract = () => useContext(ERC721DropContext)
