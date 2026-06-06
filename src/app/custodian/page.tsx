import React, { useState, useMemo } from 'react';
import { CustodianUI } from './ui';
import { useStocks, useReserves } from '@/http/hooks/stocks';

const CUSTODIANS_LIST = [
  { id: "c1", name: "You", short: "ME", you: true },
  { id: "c2", name: "Mandiri Sekuritas", short: "MS" },
  { id: "c3", name: "BNI Custody", short: "BN" },
  { id: "c4", name: "KSEI Nominee", short: "KS" },
  { id: "c5", name: "Sinarmas AM", short: "SM" },
];
const SIGNATURE_THRESHOLD = 3;

type Proposal = {
  id: string;
  type: string;
  ticker: string;
  amount: number;
  note: string;
  signed: Record<string, boolean>;
  status: string;
};

function generateSeedProposals(): Proposal[] {
  return [
    { id: "p1", type: "mint", ticker: "pBBRI", amount: 50000, note: "Seed liquidity — Q2 inflow", signed: { c2: true, c3: true }, status: "pending" },
    { id: "p2", type: "redeem", ticker: "pUNVR", amount: 18000, note: "Redemption gate · KYC cleared", signed: { c4: true }, status: "pending" },
    { id: "p3", type: "mint", ticker: "pGOTO", amount: 120000, note: "Deepen GOTO pool", signed: { c2: true, c3: true, c5: true }, status: "executed" },
  ];
}

export default function CustodianPage() {
  const [proposals, setProposals] = useState(generateSeedProposals);
  const stocksQuery = useStocks();
  const reservesQuery = useReserves();

  const totalReserveValue = useMemo(() => {
    if (!reservesQuery.data || !stocksQuery.data) return 0;
    
    return stocksQuery.data.reduce((sum, token) => {
      const reserve = reservesQuery.data.find(r => r.stock.ticker === token.ticker);
      const supply = reserve ? Number(reserve.on_chain_supply) / 1e18 : 0;
      return sum + (supply * token.price);
    }, 0);
  }, [stocksQuery.data, reservesQuery.data]);

  const handleSignProposal = (proposalId: string, shouldExecute: boolean) => {
    setProposals(previousProposals => previousProposals.map(proposal => {
      if (proposal.id !== proposalId) return proposal;
      if (shouldExecute) return { ...proposal, status: "executed" };
      const updatedSignedMap = { ...proposal.signed, c1: true };
      return { ...proposal, signed: updatedSignedMap };
    }));
  };

  const pendingProposals = proposals.filter(proposal => proposal.status === "pending");
  const executedProposals = proposals.filter(proposal => proposal.status === "executed");

  return (
    <CustodianUI 
      reserveValue={totalReserveValue}
      custodiansList={CUSTODIANS_LIST}
      signatureThreshold={SIGNATURE_THRESHOLD}
      pendingProposals={pendingProposals}
      executedProposals={executedProposals}
      onSignProposal={handleSignProposal}
    />
  );
}
