import PWCore, { CHAIN_SPECS, ChainID } from '@lay2/pw-core'
import UPCore from 'up-core-test'
import UPCKB from 'up-ckb-alpha-test'

interface Url {
  NODE_URL: string
  INDEXER_URL: string
  CHAIN_ID: ChainID
}

export function getCkbEnv(): Url {
  const data: Url = {
    NODE_URL: process.env.CKB_NODE_URL || '',
    INDEXER_URL: process.env.CKB_INDEXER_URL || '',
    CHAIN_ID:
      process.env.CKB_CHAIN_ID === '0' ? ChainID.ckb : ChainID.ckb_testnet,
  }

  return data
}

// TODO: use .env
export function initSDKConfigs() {
  PWCore.chainId = ChainID.ckb
  PWCore.config = CHAIN_SPECS.Lina
  UPCore.config({
    domain: 'app.unipass.id',
  })
  UPCKB.config({
    upLockCodeHash:
      '0xd01f5152c267b7f33b9795140c2467742e8424e49ebe2331caec197f7281b60a',
    upSnapshotUrl: 'https://aggregator.unipass.id/snapshot/',
    ckbNodeUrl: process.env.CKB_NODE_URL,
    ckbIndexerUrl: process.env.CKB_INDEXER_URL,
  })
}
