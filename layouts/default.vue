<template>
  <div id="tok" :class="$route.name">
    <div v-if="loading" id="tok-loading"><span class="loader"></span></div>
    <Header />
    <Nuxt class="tok-page" />
  </div>
</template>
<script>
import PWCore, {
  IndexerCollector,
  Amount,
  AmountUnit,
  Script,
} from '@lay2/pw-core'
import UPCore from 'up-core-test'
import UPCKB from 'up-ckb-alpha-test'
import { getCkbEnv, initSDKConfigs } from '~/assets/js/config'
import { UnipassV3Provider } from '~/assets/js/UnipassV3Provider.ts'
import Header from '~/components/header.vue'

// TODO: move to main.ts
initSDKConfigs()

export default {
  components: { Header },
  provide() {
    return {
      reload: this.reload,
      loadAssets: this.loadAssets,
    }
  },
  data() {
    return {
      name: this.$route.query.name,
      loading: true,
    }
  },
  mounted() {
    this.init()
    if (this.$route.query.console !== undefined) {
      // eslint-disable-next-line
      new window.VConsole()
    }
  },
  methods: {
    t_(key) {
      return this.$t('default.' + key)
    },
    reload() {
      this.Sea.localStorage('provider', '')
      this.Sea.localStorage('pendingList', '')
      this.Sea.localStorage('signData', '')
      window.location.reload()
    },
    async init() {
      const provider = this.Sea.localStorage('provider')
      if (provider) {
        this.$store.state.provider = provider
        await this.PWCore(provider)
        this.loading = false
      } else {
        await this.login()
      }
    },
    async login() {
      UPCore.initPop()
      const account = await UPCore.connect({ email: true })
      const address = UPCKB.getCKBAddress(account.username)
      const provider = {
        email: account.email,
        address: address.toCKBAddress(),
        username: account.username,
      }
      this.Sea.localStorage('provider', provider)
      this.init()
    },
    async PWCore(provider) {
      const url = getCkbEnv()
      // TODO: move to initSDKConfigs?
      PWCore.chainId = url.CHAIN_ID
      await new PWCore(url.NODE_URL).init(
        new UnipassV3Provider(
          provider.username,
          // TODO: from .env or UPCKB config
          '0xd01f5152c267b7f33b9795140c2467742e8424e49ebe2331caec197f7281b60a',
        ),
        new IndexerCollector(url.INDEXER_URL),
        url.CHAIN_ID,
      )
      this.loadAssets()
    },
    async loadAssets() {
      const addressHash = PWCore.provider.address.toLockScript().toHash()
      this.$store.state.lockHash = addressHash
      const res = await this.$axios({
        url: '/cell/assets',
        params: {
          lockHash: addressHash,
        },
      })
      if (res.code === 200) {
        const rawAssets = res.data.assets
        const assets = []
        for (const e of rawAssets) {
          if (e.symbol === 'DAO') {
            continue
          }
          // if (e.symbol === 'CKB') {
          //   continue
          // }
          const capacity = new Amount(e.capacity, AmountUnit.shannon)
          let typeScript = null
          if (e.typeScript) {
            typeScript = new Script(
              e.typeScript.codeHash,
              e.typeScript.args,
              e.typeScript.hashType,
            )
          }
          assets.push({
            ...e,
            capacity,
            sudtAmount: new Amount(e.sudtAmount, AmountUnit.shannon),
            typeScript,
          })
        }
        this.$store.state.assets = assets
        if (this.name) {
          const asset = assets.find((e) => e.symbol === this.name)
          if (!asset) {
            this.$router.replace('/')
          }
        }
      } else {
        this.$message.error(this.t_('AssetFailed'))
      }
    },
  },
}
</script>
<style lang="stylus">
#tok {
  background: #F6F7FB;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 20px;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;

  // https://vineethtrv.github.io/loader/
  > #tok-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: rgba(255, 255, 255, 0.84);
    display: flex;
    align-items: center;
    justify-content: center;

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: inline-block;
      border-top: 3px solid var(--primary);
      border-right: 3px solid transparent;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
  }

  > .tok-page {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}

#tok.send {
  background: #FFFFFF;
}
</style>
