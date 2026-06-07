import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Eyebrow, Mono, Icon, Card, Button, fonts } from '@/components/CoreUI';
import { fmtIDRX, fmtNum } from '@/lib/mockData';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

function SkeletonPulse({ style }: { style: any }) {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, anim]} />;
}

export function CustodianUI({
  reserveValue,
  custodiansList,
  signatureThreshold,
  pendingProposals,
  executedProposals,
  onSignProposal,
  isRequestsLoading,
  isMembersLoading,
  refreshing,
  onRefresh,
}: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Vault"
        eyebrow="3-of-5 multisig · KSEI reserve"
        large
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Icon name="check" size={13} color={colors.positive} />
            <Text style={{ fontFamily: fonts.sansSemi, color: colors.positive, fontSize: 11 }}>1:1</Text>
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={colors.merah}
            colors={[colors.merah]}
          />
        }
      >
        <View style={{ paddingTop: 2 }}>
          <Card style={styles.reserveCard} pad={16}>
            <Eyebrow style={{ color: 'rgba(255,255,255,.55)' }}>Custodied reserve</Eyebrow>
            <Text style={styles.reserveValue}>{fmtIDRX(reserveValue, { min: 0, max: 0 })}</Text>
            <View style={styles.statsRow}>
              <View>
                <Mono style={[styles.statVal, { color: '#fff' }]}>8</Mono>
                <Eyebrow style={styles.statLabel}>Equities</Eyebrow>
              </View>
              <View>
                <Mono style={[styles.statVal, { color: '#fff' }]}>5</Mono>
                <Eyebrow style={styles.statLabel}>Custodians</Eyebrow>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ paddingTop: 16, paddingBottom: 6 }}>
          <Eyebrow style={{ paddingHorizontal: 18, marginBottom: 10 }}>Signing custodians</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.custodiansScroll}>
            {isMembersLoading ? (
              <>
                <View style={[styles.custodianPill, { borderColor: colors.hairline, opacity: 0.5 }]}>
                  <SkeletonPulse style={[styles.custodianDot, { backgroundColor: colors.surface2 }]} />
                  <SkeletonPulse style={{ width: 60, height: 10, backgroundColor: colors.surface2, borderRadius: 4 }} />
                </View>
                <View style={[styles.custodianPill, { borderColor: colors.hairline, opacity: 0.5 }]}>
                  <SkeletonPulse style={[styles.custodianDot, { backgroundColor: colors.surface2 }]} />
                  <SkeletonPulse style={{ width: 80, height: 10, backgroundColor: colors.surface2, borderRadius: 4 }} />
                </View>
                <View style={[styles.custodianPill, { borderColor: colors.hairline, opacity: 0.5 }]}>
                  <SkeletonPulse style={[styles.custodianDot, { backgroundColor: colors.surface2 }]} />
                  <SkeletonPulse style={{ width: 70, height: 10, backgroundColor: colors.surface2, borderRadius: 4 }} />
                </View>
              </>
            ) : (
              custodiansList.map((custodian: any) => (
                <View key={custodian.id} style={[styles.custodianPill, { borderColor: custodian.you ? colors.merah : colors.hairline }]}>
                  <View style={[styles.custodianDot, { backgroundColor: custodian.you ? colors.merah : colors.ink }]}>
                    <Text style={{ fontFamily: fonts.sansSemi, fontSize: 10, color: custodian.you ? '#fff' : colors.canvas }}>{custodian.short}</Text>
                  </View>
                  <Text style={{ fontFamily: fonts.sansSemi, color: colors.ink, fontSize: 12.5 }}>{custodian.name}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={{ paddingTop: 12, paddingBottom: 6 }}>
          <Eyebrow style={{ paddingHorizontal: 18, marginBottom: 10 }}>Pending proposals · {pendingProposals.length}</Eyebrow>
          {pendingProposals.map((proposal: any) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onSign={onSignProposal}
              custodiansList={custodiansList}
              signatureThreshold={signatureThreshold}
              colors={colors}
              styles={styles}
            />
          ))}
          {isRequestsLoading && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.sans, color: colors.body }}>Syncing on-chain requests...</Text>
            </View>
          )}
          {!isRequestsLoading && pendingProposals.length === 0 && (
            <View style={{ paddingHorizontal: 18 }}>
              <Card pad={20}>
                <Text style={{ textAlign: 'center', color: colors.body, fontFamily: fonts.sans, fontSize: 13.5 }}>
                  All proposals cleared.
                </Text>
              </Card>
            </View>
          )}
        </View>

        {executedProposals.length > 0 && (
          <View style={{ paddingTop: 10, paddingBottom: 6 }}>
            <Eyebrow style={{ paddingHorizontal: 18, marginBottom: 10 }}>Recently executed</Eyebrow>
            {executedProposals.map((proposal: any) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onSign={onSignProposal}
                custodiansList={custodiansList}
                signatureThreshold={signatureThreshold}
                colors={colors}
                styles={styles}
              />
            ))}
          </View>
        )}
        <View style={{ height: 18 }} />
      </ScrollView>
    </View>
  );
}

function ProposalCard({ proposal, onSign, custodiansList, signatureThreshold, colors, styles }: any) {
  const currentSignaturesCount = Object.values(proposal.signed).filter(Boolean).length;
  const hasUserSigned = !!proposal.signed.c1;
  const isExecuted = proposal.status === 'executed';
  const isReadyToExecute = currentSignaturesCount >= signatureThreshold;
  const isMintType = proposal.type === 'mint';

  return (
    <Card style={[styles.proposalCard, { opacity: isExecuted ? 0.62 : 1 }]} pad={15}>
      <View style={styles.pRow1}>
        <View style={[styles.pIconBox, { backgroundColor: isMintType ? colors.merahSoft : colors.surface2, borderColor: colors.hairline }]}>
          <Icon name={isMintType ? 'arrow-down' : 'arrow-up'} size={18} color={isMintType ? colors.merah : colors.ink} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.pTitle}>{isMintType ? 'Mint' : 'Redeem'} {fmtNum(proposal.amount, 0)} {proposal.ticker}</Text>
          <Text style={styles.pNote}>{proposal.note}</Text>
        </View>
        {isExecuted && <Eyebrow style={{ color: colors.positive }}>✓ Done</Eyebrow>}
      </View>

      <View style={styles.pRow2}>
        <View style={styles.signerPips}>
          {custodiansList.map((custodian: any) => {
            const hasSigned = !!proposal.signed[custodian.id];
            return (
              <View key={custodian.id} style={[styles.pip, { backgroundColor: hasSigned ? colors.ink : colors.surface2, borderColor: hasSigned ? colors.ink : colors.hairline }]}>
                <Text style={[styles.pipText, { color: hasSigned ? colors.canvas : colors.body }]}>{custodian.short}</Text>
              </View>
            );
          })}
        </View>
        <Mono style={{ fontSize: 12.5, fontWeight: '700', color: isReadyToExecute ? colors.positive : colors.body }}>
          {currentSignaturesCount}/{signatureThreshold} signed
        </Mono>
      </View>

      <View style={styles.pProgressBg}>
        <View style={{ height: '100%', width: `${Math.min(100, (currentSignaturesCount / signatureThreshold) * 100)}%`, backgroundColor: isReadyToExecute ? colors.positive : colors.merah }} />
      </View>

      {!isExecuted && (
        isReadyToExecute ? (
          <Button variant="ink" onPress={() => onSign(proposal.id, true)} icon={<Icon name="check" color="#fff" size={16} />}>
            Execute {isMintType ? 'mint' : 'redeem'}
          </Button>
        ) : hasUserSigned ? (
          <Button variant="surface" disabled>Awaiting co-signers...</Button>
        ) : (
          <Button variant="accent" onPress={() => onSign(proposal.id, false)} icon={<Icon name="check" color="#fff" size={16} />}>
            Co-sign as custodian
          </Button>
        )
      )}
    </Card>
  );
}
