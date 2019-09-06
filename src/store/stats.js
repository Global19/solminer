import LocalStore from 'electron-store';
import { Connection, PublicKey } from '@solana/web3.js';
import { action, observable, flow } from 'mobx';
import { DEFAULT_LAMPORTS } from '../constants';
import url from '../url';
import { Replicator } from '../replicator';
import { AppStore } from './index';

export const localStore = new LocalStore();

function isValidPublicKey(publicKey) {
  return (
    typeof publicKey === 'string' &&
    publicKey.length === 44 &&
    publicKey.match(/^[A-Za-z0-9]+$/)
  );
}

class StatsStore {
  constructor() {
    this.connection = new Connection(url);
    this.replicator = new Replicator(this.connection);
  }

  @observable stats = {
    transactionCount: 0,
    totalMined: localStore.get('totalMined', 0),
    newMined: 0,
    totalSupply: 0,
    depositMinimumLamports: localStore.get(
      'depositMinimumLamports',
      DEFAULT_LAMPORTS
    ),
    depositPublicKeyBalance: '',
  };

  clusterRestart() {
    this.replicator.clusterRestart();
    this.stats.transactionCount = 0;
    setTimeout(() => this.updateStats());
  }

  @action.bound
  updateStats = flow(function* updateStats() {
    const { transactionCount, depositMinimumLamports } = this.stats;
    const newTransactionCount = yield this.connection.getTransactionCount();

    if (newTransactionCount < transactionCount / 2) {
      this.clusterRestart();
      return;
    }

    this.stats.totalSupply = yield this.connection.getTotalSupply();
    const newMined = yield this.replicator.adjustedReplicatorBalance();
    if (newMined > depositMinimumLamports) {
      if (isValidPublicKey(AppStore.depositPublicKey)) {
        const success = yield this.replicator.depositMiningRewards(
          new PublicKey(AppStore.depositPublicKey),
          newMined
        );
        if (success) {
          this.stats.totalMined += newMined;
          localStore.set('totalMined', this.stats.totalMined);
        }
      }
    }
    if (isValidPublicKey(AppStore.depositPublicKey)) {
      const balance = yield this.connection.getBalance(
        new PublicKey(AppStore.depositPublicKey)
      );
      this.stats.depositPublicKeyBalance = `Account Balance: ${balance} lamports`;
    }
    this.stats.newMined = newMined;
    this.stats.transactionCount = newTransactionCount;
  });
}

const store = new StatsStore();

export default store;