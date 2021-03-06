import React, { useState } from 'react';
import { AppStore } from 'store';
import { Card, Button, Typography, Input } from 'components/UI';
import { useTranslation, Trans } from 'react-i18next';
import CreateWalletBtn from 'components/CreateWalletBtn';
import generateKeys from '../../utils/generateKeys';
import Squares from '../UI/Squares';
import css from './styles.module.scss';

const Setup = () => {
  const { t } = useTranslation();
  const { setScreen, setSecretKey, setDepositPublicKey } = AppStore;
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleSeedChange = e => setSeedPhrase(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    const { publicKey, secretKey } = generateKeys(seedPhrase);
    setSecretKey(secretKey);
    setDepositPublicKey(publicKey);
    setScreen('setupTwo');
  };
  return (
    <div>
      <Typography className={css.title} type="title">
        {t('get_setup_up')}
      </Typography>
      <Typography className={css.step}>
        <Trans i18nKey="step_1_of_2" />
      </Typography>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <Typography className={css.formTitle} type="cardTitle">
            {t('enter_seed_valid_phrase')}
          </Typography>
          <Input
            value={seedPhrase}
            onChange={handleSeedChange}
            placeholder={t('enter_seed_phrase')}
          />
          <Typography className={css.formHint}>
            {t('seed_phrase_reqs')}
          </Typography>
          <Button type="submit" disabled={!seedPhrase}>
            {t('connect_wallet')}
          </Button>
        </form>
      </Card>
      <CreateWalletBtn horizontal />
      <Squares />
    </div>
  );
};

export default Setup;
