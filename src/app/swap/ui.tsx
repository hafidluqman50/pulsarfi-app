import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, Card, Eyebrow, Icon, Mono, ScreenHeader, TokenAvatar } from '@/components/CoreUI';
import { fmtAmt, fmtUSD, Token } from '@/lib/mockData';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

export type SwapSlot = 'pay' | 'recv';

export type SwapViewModel = {
  payToken: string;
  receiveToken: string;
  payTokenDetails: Token;
  receiveTokenDetails: Token;
  amount: string;
  pickingToken: SwapSlot | null;
  tokenSearch: string;
  pickerTokens: Token[];
  pickerTitle: string;
  slippageTolerance: number;
  isReviewing: boolean;
  swapPhase: 'idle' | 'signing' | 'success';
  isSettingsOpen: boolean;
  isNightMode: boolean;
  direction: 'buy' | 'sell';
  isSwapValid: boolean;
  isInsufficientBalance: boolean;
  payTokenBalance: number;
  userBalances: Record<string, number>;
  amountNumber: number;
  expectedOutput: number;
  usdValueOfAmount: number;
  minimumReceivedAmount: number;
  swapFeePercentage: number;
};

export type SwapActions = {
  setAmount: (value: string) => void;
  setTokenSearch: (value: string) => void;
  openPicker: (slot: SwapSlot) => void;
  closePicker: () => void;
  pickToken: (ticker: string) => void;
  setPercent: (percentage: number) => void;
  flip: () => void;
  setSlippageTolerance: (value: number) => void;
  openReview: () => void;
  closeReview: () => void;
  confirmSwap: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleNightMode: () => void;
};

export function SwapUI({ vm, actions }: { vm: SwapViewModel; actions: SwapActions }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
      <ScreenHeader
        title="Swap"
        eyebrow="Trade pStocks · 0.30% pool fee"
        large
        right={
          <Pressable onPressIn={actions.openSettings} style={styles.settingsButton}>
            <Icon name="settings" size={16} color={colors.body} />
          </Pressable>
        }
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.swapStack}>
          <SwapField
            label="You pay"
            ticker={vm.payToken}
            balance={`Balance ${fmtAmt(vm.payTokenBalance)} ${vm.payToken}`}
            amountNode={
              <TextInput
                value={vm.amount}
                onChangeText={(value) => actions.setAmount(value.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.hairlineStrong}
                style={styles.amountInput}
              />
            }
            balanceDanger={vm.isInsufficientBalance}
            onPick={() => actions.openPicker('pay')}
            footerLeft={vm.usdValueOfAmount > 0 ? fmtUSD(vm.usdValueOfAmount) : '$0.00'}
            footerRight={
              <View style={styles.percentageButtonsContainer}>
                {[{ label: '25%', value: 0.25 }, { label: '50%', value: 0.5 }, { label: 'MAX', value: 1 }].map((pct) => (
                  <Pressable key={pct.label} onPress={() => actions.setPercent(pct.value)} style={styles.percentageButton}>
                    <Text style={styles.percentageButtonText}>{pct.label}</Text>
                  </Pressable>
                ))}
              </View>
            }
            colors={colors}
            styles={styles}
          />

          <SwapField
            label="You receive"
            ticker={vm.receiveToken}
            balance={`Balance ${fmtAmt(vm.userBalances[vm.receiveToken] || 0)} ${vm.receiveToken}`}
            amountNode={
              <Mono style={vm.expectedOutput > 0 ? styles.amountText : styles.amountTextEmpty} numberOfLines={1}>
                {vm.expectedOutput > 0 ? fmtAmt(vm.expectedOutput) : '0'}
              </Mono>
            }
            onPick={() => actions.openPicker('recv')}
            footerLeft={vm.expectedOutput > 0 ? fmtUSD(vm.expectedOutput * vm.receiveTokenDetails.price) : '$0.00'}
            colors={colors}
            styles={styles}
          />

          <View style={styles.flipButtonContainer}>
            <Pressable onPress={actions.flip} style={styles.flipButton}>
              <Icon name={vm.direction === 'buy' ? 'arrow-down' : 'arrow-up'} size={16} color={colors.body} />
            </Pressable>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <DetailRow k="Rate" v={`1 ${vm.payToken} = ${fmtAmt(vm.payTokenDetails.price / vm.receiveTokenDetails.price)} ${vm.receiveToken}`} mono styles={styles} />
          <DetailRow k="Pool fee (0.30%)" v={vm.amountNumber > 0 ? `-${fmtUSD(vm.usdValueOfAmount * vm.swapFeePercentage)}` : '-'} mono styles={styles} />
          <DetailRow k="Min. received" v={`${fmtAmt(vm.minimumReceivedAmount)} ${vm.receiveToken}`} mono styles={styles} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Slippage tolerance</Text>
            <View style={styles.slippageContainer}>
              {[0.1, 0.5, 1].map((sv) => (
                <Pressable
                  key={sv}
                  onPress={() => actions.setSlippageTolerance(sv)}
                  style={[
                    styles.slippageButton,
                    { backgroundColor: vm.slippageTolerance === sv ? colors.ink : 'transparent', borderColor: vm.slippageTolerance === sv ? colors.ink : colors.hairline },
                  ]}
                >
                  <Text style={[styles.slippageButtonText, { color: vm.slippageTolerance === sv ? colors.canvas : colors.body }]}>{sv}%</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 12 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button disabled={!vm.isSwapValid} onPress={actions.openReview}>
          {vm.amountNumber <= 0 ? 'Enter an amount' : vm.isInsufficientBalance ? `Insufficient ${vm.payToken}` : 'Review swap'}
        </Button>
      </View>

      <TokenSelectSheet vm={vm} actions={actions} colors={colors} styles={styles} />
      <ReviewSheet vm={vm} actions={actions} colors={colors} styles={styles} />
      <SettingsSheet vm={vm} actions={actions} colors={colors} styles={styles} />
    </View>
  );
}

function SwapField({
  label,
  ticker,
  balance,
  amountNode,
  balanceDanger,
  onPick,
  footerLeft,
  footerRight,
  colors,
  styles,
}: {
  label: string;
  ticker: string;
  balance: string;
  amountNode: React.ReactNode;
  balanceDanger?: boolean;
  onPick: () => void;
  footerLeft: string;
  footerRight?: React.ReactNode;
  colors: any;
  styles: any;
}) {
  return (
    <Card pad={0} style={styles.swapCard}>
      <View style={label === 'You pay' ? styles.payField : styles.receiveField}>
        <View style={styles.fieldHeader}>
          <Eyebrow>{label}</Eyebrow>
          <Text style={balanceDanger ? styles.insufficientBalanceText : styles.balanceText}>{balance}</Text>
        </View>
        <View style={styles.fieldInputContainer}>
          {amountNode}
          <TouchableOpacity onPressIn={onPick} activeOpacity={0.72} hitSlop={8} style={styles.tokenButton}>
            <TokenAvatar ticker={ticker} size={20} />
            <Text style={styles.tokenButtonText}>{ticker}</Text>
            <Icon name="chevron-down" size={16} color={colors.body} />
          </TouchableOpacity>
        </View>
        <View style={styles.fieldFooter}>
          <Mono style={styles.usdValueText}>{footerLeft}</Mono>
          {footerRight}
        </View>
      </View>
    </Card>
  );
}

function DetailRow({ k, v, mono, styles }: { k: string; v: string; mono?: boolean; styles: any }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{k}</Text>
      <Text style={mono ? styles.detailValue : styles.detailValueSans}>{v}</Text>
    </View>
  );
}

function TokenSelectSheet({ vm, actions, colors, styles }: { vm: SwapViewModel; actions: SwapActions; colors: any; styles: any }) {
  const renderItem = (token: Token) => {
    const balance = vm.userBalances[token.ticker] || 0;
    return (
      <TouchableOpacity key={token.ticker} onPressIn={() => actions.pickToken(token.ticker)} activeOpacity={0.7} style={styles.tokenSelectRow}>
        <TokenAvatar ticker={token.ticker} size={36} />
        <View style={styles.tokenSelectInfo}>
          <Text style={styles.tokenSelectTicker}>{token.ticker}</Text>
          <Text numberOfLines={1} style={styles.tokenSelectName}>{token.name}</Text>
        </View>
        <Mono style={[styles.tokenSelectBalance, { color: balance > 0 ? colors.ink : colors.body }]}>
          {balance > 0 ? fmtAmt(balance) : '-'}
        </Mono>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={!!vm.pickingToken} transparent animationType="fade" statusBarTranslucent onRequestClose={actions.closePicker}>
      <View style={styles.modalRoot}>
        <Pressable onPress={actions.closePicker} style={styles.modalBackdrop} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandleWrap}>
            <View style={styles.modalHandle} />
          </View>
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitle}>{vm.pickerTitle}</Text>
            <Pressable onPress={actions.closePicker} style={styles.modalClose}>
              <Icon name="x" size={16} color={colors.body} />
            </Pressable>
          </View>
          <View style={styles.tokenSearchBox}>
            <Icon name="search" size={16} color={colors.body} />
            <TextInput
              value={vm.tokenSearch}
              onChangeText={actions.setTokenSearch}
              autoCorrect={false}
              placeholder="Search ticker, sector, name"
              placeholderTextColor={colors.body}
              style={styles.tokenSearchInput}
            />
          </View>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
            <Eyebrow style={styles.sheetEyebrowFirst}>{vm.pickerTitle === 'Select stablecoin' ? 'Stablecoins' : 'Tokenized equities'}</Eyebrow>
            {vm.pickerTokens.map(renderItem)}
            {vm.pickerTokens.length === 0 && (
              <Text style={styles.emptySearchText}>No token found</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ReviewSheet({ vm, actions, colors, styles }: { vm: SwapViewModel; actions: SwapActions; colors: any; styles: any }) {
  return (
    <BottomSheet visible={vm.isReviewing} onClose={actions.closeReview} title={vm.swapPhase === 'success' ? undefined : 'Review swap'}>
      {vm.swapPhase === 'success' ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <Icon name="check" color="#fff" size={28} />
          </View>
          <Text style={styles.successTitle}>Swap complete</Text>
          <Text style={styles.successSubtitle}>
            Traded {fmtAmt(vm.amountNumber)} {vm.payToken} for <Text style={styles.successHighlight}>{fmtAmt(vm.expectedOutput)} {vm.receiveToken}</Text>
          </Text>
          <View style={styles.successMeta}>
            <Icon name="globe" size={13} color={colors.body} />
            <Text style={styles.successMetaText}>Settled in 1.8s · 0x9f...a2e1</Text>
          </View>
          <View style={styles.successDoneContainer}>
            <Button variant="ink" onPress={actions.closeReview}>Done</Button>
          </View>
        </View>
      ) : (
        <View style={{ paddingBottom: 8 }}>
          <View style={styles.reviewTokensContainer}>
            <ReviewToken ticker={vm.payToken} amount={fmtAmt(vm.amountNumber)} styles={styles} />
            <Icon name="chevron-right" color={colors.body} size={20} />
            <ReviewToken ticker={vm.receiveToken} amount={fmtAmt(vm.expectedOutput)} styles={styles} />
          </View>
          <View style={styles.reviewDetailsCard}>
            {[
              ['Rate', `1 ${vm.payToken} = ${fmtAmt(vm.payTokenDetails.price / vm.receiveTokenDetails.price)} ${vm.receiveToken}`],
              ['Value', fmtUSD(vm.usdValueOfAmount)],
              ['Pool fee', `-${fmtUSD(vm.usdValueOfAmount * vm.swapFeePercentage)}`],
              ['Min. received', `${fmtAmt(vm.minimumReceivedAmount)} ${vm.receiveToken}`],
              ['Network', 'Arbitrum · ~$0.01'],
            ].map(([label, value], index, arr) => (
              <View key={label} style={[styles.reviewDetailRow, index < arr.length - 1 && styles.reviewDetailRowBorder]}>
                <Text style={styles.reviewDetailLabel}>{label}</Text>
                <Mono style={styles.reviewDetailValue}>{value}</Mono>
              </View>
            ))}
          </View>
          <View style={styles.confirmButtonContainer}>
            <Button disabled={vm.swapPhase === 'signing'} onPress={actions.confirmSwap}>
              {vm.swapPhase === 'signing' ? 'Confirming on-chain...' : 'Confirm swap'}
            </Button>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

function ReviewToken({ ticker, amount, styles }: { ticker: string; amount: string; styles: any }) {
  return (
    <View style={styles.reviewTokenBox}>
      <TokenAvatar ticker={ticker} size={40} />
      <Mono style={styles.reviewTokenAmount}>{amount}</Mono>
      <Text style={styles.reviewTokenTicker}>{ticker}</Text>
    </View>
  );
}

function SettingsSheet({ vm, actions, colors, styles }: { vm: SwapViewModel; actions: SwapActions; colors: any; styles: any }) {
  return (
    <Modal visible={vm.isSettingsOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={actions.closeSettings}>
      <View style={styles.modalRoot}>
        <Pressable onPress={actions.closeSettings} style={styles.modalBackdrop} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandleWrap}>
            <View style={styles.modalHandle} />
          </View>
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable onPress={actions.closeSettings} style={styles.modalClose}>
              <Icon name="x" size={16} color={colors.body} />
            </Pressable>
          </View>
          <View style={styles.settingsContent}>
            <Pressable onPress={actions.toggleNightMode} style={styles.settingsRow}>
              <View>
                <Text style={styles.settingsTitle}>Night mode</Text>
                <Text style={styles.settingsSubtitle}>Toggle dark theme</Text>
              </View>
              <View style={[styles.switchTrack, vm.isNightMode && styles.switchTrackOn]}>
                <View style={[styles.switchThumb, vm.isNightMode && styles.switchThumbOn]} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
