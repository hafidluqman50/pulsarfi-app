import React, { useMemo, useCallback, useState } from 'react';
import { CustodianUI } from './ui';
import { useCustodianRequests, useCustodianMembers, useCustodianStats, useApproveMint, useApproveRedeem, useExecuteMint, useExecuteRedeem } from '@/http/hooks/custodian';
import { useAccount } from 'wagmi';
import { toast } from 'sonner-native';
import { formatUnits } from 'viem';

const SIGNATURE_THRESHOLD = 3;

export default function CustodianPage() {
  const { address } = useAccount();
  const requestsQuery = useCustodianRequests();
  const membersQuery = useCustodianMembers();
  const statsQuery = useCustodianStats();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      requestsQuery.refetch(),
      membersQuery.refetch(),
      statsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [requestsQuery, membersQuery, statsQuery]);

  const approveMint = useApproveMint();
  const approveRedeem = useApproveRedeem();
  const executeMint = useExecuteMint();
  const executeRedeem = useExecuteRedeem();

  const totalReserveValue = statsQuery.data ? Number(statsQuery.data.assets_under_custody_idr) : 0;

  const custodiansList = useMemo(() => {
    if (!membersQuery.data) return [];
    
    return membersQuery.data.map(member => ({
      id: `c${member.id}`,
      name: member.wallet_address.toLowerCase() === address?.toLowerCase() ? "You" : member.name,
      short: member.wallet_address.toLowerCase() === address?.toLowerCase() 
        ? "ME" 
        : member.name.split(' ').length > 1 
          ? (member.name.split(' ')[0][0] + member.name.split(' ')[1][0]).toUpperCase()
          : member.name.substring(0, 2).toUpperCase(),
      you: member.wallet_address.toLowerCase() === address?.toLowerCase(),
      walletAddress: member.wallet_address.toLowerCase(),
    }));
  }, [membersQuery.data, address]);

  const proposals = useMemo(() => {
    if (!requestsQuery.data?.items) return [];

    return requestsQuery.data.items.map(req => {
      const signed: Record<string, boolean> = {};
      
      req.attestors?.forEach(att => {
        if (att.type === 'approve') {
          const member = custodiansList.find(m => m.walletAddress === att.wallet_address.toLowerCase());
          if (member) {
            signed[member.id] = true;
          }
        }
      });

      return {
        id: req.on_chain_id.toString(),
        type: req.kind,
        ticker: req.ticker,
        amount: Number(formatUnits(BigInt(req.token_amount), 18)),
        note: `${req.source === 'retail' ? 'Retail' : 'Institutional'} request`,
        signed,
        status: req.status === 'executed' ? 'executed' : 'pending',
        rawRequest: req,
      };
    });
  }, [requestsQuery.data, custodiansList]);

  const handleSignProposal = async (proposalId: string, shouldExecute: boolean) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    try {
      if (shouldExecute) {
        if (proposal.type === 'mint') {
          toast.loading("Executing Mint...");
          await executeMint.mutateAsync(BigInt(proposalId));
          toast.success("Mint Executed!");
        } else {
          toast.loading("Executing Redeem...");
          await executeRedeem.mutateAsync(BigInt(proposalId));
          toast.success("Redeem Executed!");
        }
      } else {
        if (proposal.type === 'mint') {
          toast.loading("Approving Mint...");
          await approveMint.mutateAsync(BigInt(proposalId));
          toast.success("Mint Approved!");
        } else {
          toast.loading("Approving Redeem...");
          await approveRedeem.mutateAsync(BigInt(proposalId));
          toast.success("Redeem Approved!");
        }
      }
    } catch (e: any) {
      toast.error(shouldExecute ? "Execution Failed" : "Approval Failed", {
        description: e.message || "Something went wrong",
      });
    }
  };

  const pendingProposals = proposals.filter(proposal => proposal.status === "pending");
  const executedProposals = proposals.filter(proposal => proposal.status === "executed");

  return (
    <CustodianUI 
      reserveValue={totalReserveValue}
      custodiansList={custodiansList}
      signatureThreshold={SIGNATURE_THRESHOLD}
      pendingProposals={pendingProposals}
      executedProposals={executedProposals}
      onSignProposal={handleSignProposal}
      isMembersLoading={membersQuery.isLoading}
      isRequestsLoading={requestsQuery.isLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
