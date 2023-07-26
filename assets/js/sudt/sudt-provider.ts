import { Provider, Platform, AddressType, Address } from '@lay2/pw-core'

export class UsdtProvider extends Provider {
  constructor(addressStr: string) {
    super(Platform.ckb)
    this.address = new Address(addressStr, AddressType.ckb)
  }

  // eslint-disable-next-line
  async init(): Promise<UsdtProvider> {
    return new Promise((resolve) => {
      resolve(this)
    })
  }

  sign(message: string): Promise<string> {
    console.log('[UnipassProvider] message to sign', message)
    return new Promise((resolve) => resolve(''))
  }

  close() {
    console.log('do nothing')
  }
}
