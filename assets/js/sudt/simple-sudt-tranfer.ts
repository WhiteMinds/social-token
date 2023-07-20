import PWCore, {
  Address,
  Amount,
  AmountUnit,
  // Builder,
  SUDT,
  transformers,
} from '@lay2/pw-core'
import { getUnipassCellDeps } from '../utils'
import UnipassSigner from '../UnipassSigner'
import {
  SimpleSUDTBuilder,
  SimpleSUDTBuilderOptions,
} from './simple-sudt-builder'
import { UsdtProvider } from './sudt-provider'
import { UnipassIndexerCollector } from './unipass-indexer-collector'

export async function getBalanceEnough() {
  if (PWCore.defaultCollector) {
    const balance = await PWCore.defaultCollector.getBalance(
      PWCore.provider.address,
    )
    console.log('balance=', balance)
    // critical value .add(Builder.MIN_CHANGE) +61
    // 142(sUDT occupied) + 0.6(fee), 0.6 CKB is enough to transfer about 30,000 times
    return balance.gt(new Amount('142.6', AmountUnit.ckb))
  }
}

export async function getSimpleUSDTSignMessage(
  sudtTokenId: string,
  address: Address,
  amount: Amount,
  providerAddress: string,
) {
  console.log('getSimpleUSDTSignMessage', sudtTokenId)
  const provider = new UsdtProvider(providerAddress)

  const cellDeps = await getUnipassCellDeps()
  console.log('getSimpleUSDTSignMessage', 2)
  const lockLen = (1 + (8 + 256 * 2) * 2) * 2
  const collector = new UnipassIndexerCollector(
    process.env.CKB_INDEXER_URL as string,
  )

  console.log('getSimpleUSDTSignMessage', 3)
  const builderOption: SimpleSUDTBuilderOptions = {
    witnessArgs: {
      lock: '0x' + '0'.repeat(lockLen),
      input_type: '',
      output_type: '',
    },
    collector,
    // sender can leave a minimum of 0.1 CKB as a fee
    minimumOutputCellCapacity: new Amount('142.5'),
    // TODO: 因为 send sudt 的 fee 计算 bug 而临时调整
    feeRate: 2000,
  }

  const sudt = new SUDT(sudtTokenId)
  console.log('getSimpleUSDTSignMessage', 4)

  const builder = new SimpleSUDTBuilder(
    sudt,
    address,
    amount,
    cellDeps,
    builderOption,
  )
  console.log('getSimpleUSDTSignMessage', 5)
  console.log('builder', builder)
  const tx = await builder.build()
  console.log('tx', tx, tx.witnesses[0])
  const signer = new UnipassSigner(provider)
  console.log('signer', signer)
  const messages = signer.toMessages(tx)
  console.log('[getUsdtSignMessage-messages]', messages)
  const txObj = transformers.TransformTransaction(tx)
  const message = messages[0].message
  return { tx, txObj, message }
}
