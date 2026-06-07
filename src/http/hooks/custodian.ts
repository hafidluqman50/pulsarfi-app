import client, { type ApiResponse } from '../index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BaseError, ContractFunctionRevertedError, encodePacked, keccak256 } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { IDRX_ABI } from '@/lib/abi/idrx_abi';
import { PULSAR_PROTOCOL_ABI } from '@/lib/abi/pulsar_protocol_abi';
import { arbitrumSepolia } from 'wagmi/chains';

export interface CustodianStats {
  assets_under_custody_idr: string;
  mint_volume_24h_idrx: string;
  mint_count_24h: number;
  burn_count_24h: number;
  pending_requests: {
    total: number;
    mints: number;
    redeems: number;
  };
}

export interface AttestorInfo {
  name: string;
  wallet_address: string;
  type: 'approve' | 'reject';
  tx_hash?: string;
  attested_at: string | null;
}

export interface CustodianRequest {
  id: number;
  on_chain_id: number;
  kind: 'mint' | 'redeem';
  ticker: string;
  stock_name: string;
  idx_ticker: string;
  token_amount: string;
  idrx_amount?: string;
  fee_idrx?: string;
  user_address?: string;
  requester_address?: string;
  approve_initiator_address?: string;
  reject_initiator_address?: string;
  source: 'retail' | 'institutional';
  destination?: 'operator_wallet' | 'liquidity_pool';
  approval_count: number;
  reject_count: number;
  status: string;
  request_tx_hash?: string;
  attestors?: AttestorInfo[];
  created_at: string;
}

export interface CustodianRequests {
  items: CustodianRequest[];
}

export interface ReserveStock {
  id: number;
  ticker: string;
  stock_name: string;
  idx_ticker: string;
  sector?: string | null;
  contract_address?: string | null;
}

export interface ReserveEntry {
  stock: ReserveStock;
  custodian_holdings: string;
  on_chain_supply: string;
  peg_ratio: string;
  peg_status: 'pegged' | 'depegged' | 'unknown';
  last_attested_at: string;
  attestation_hash?: string | null;
}

export interface WalletVerification {
  id: number;
  wallet_address: string;
  type: 'retail' | 'institution';
  status: 'pending' | 'approved' | 'rejected';
  full_name?: string | null;
  email?: string | null;
  document_ref?: string | null;
  approval_tx_hash?: string | null;
  submitted_at: string;
  verified_at?: string | null;
  verified_by?: number | null;
}

export interface CustodianStock {
  id: number;
  ticker: string;
  stock_name: string;
  idx_ticker: string;
  sector?: string | null;
  contract_address?: string | null;
}



export interface CustodianMember {
  id: number;
  wallet_address: string;
  name: string;
  email?: string | null;
}

export async function getCustodianMembers(): Promise<CustodianMember[]> {
  const { data } = await client.get<ApiResponse<CustodianMember[]>>('/api/v1/custodian/members');
  return data.data;
}

export async function getCustodianStats(): Promise<CustodianStats> {
  const { data } = await client.get<ApiResponse<CustodianStats>>('/api/v1/custodian/stats');
  return data.data;
}

export async function getCustodianRequests(): Promise<CustodianRequests> {
  const { data } = await client.get<ApiResponse<CustodianRequests>>('/api/v1/custodian/requests');
  return data.data;
}

export async function getCustodianStocks(): Promise<CustodianStock[]> {
  const { data } = await client.get<ApiResponse<CustodianStock[]>>('/api/v1/custodian/stocks');
  return Array.isArray(data.data) ? data.data : [];
}

export async function getReserves(): Promise<ReserveEntry[]> {
  const { data } = await client.get<ApiResponse<ReserveEntry[]>>('/api/v1/public/reserves');
  return data.data;
}

export async function getWalletVerifications(): Promise<WalletVerification[]> {
  const { data } = await client.get<ApiResponse<WalletVerification[]>>('/api/v1/custodian/wallet-verifications');
  return data.data;
}

export async function createWalletVerification(input: FormData): Promise<WalletVerification> {
  const { data } = await client.post<ApiResponse<WalletVerification>>('/api/v1/custodian/wallet-verifications', input, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function getWalletVerificationDocumentUrl(id: number): Promise<string> {
  const { data } = await client.get<ApiResponse<{ url: string; expires_in: number }>>(`/api/v1/custodian/wallet-verifications/${id}/document-url`);
  return data.data.url;
}

export async function recordMintRequest(input: {
  on_chain_id: number;
  ticker: string;
  token_amount: string;
  idrx_amount: string;
  attestation_hash: string;
  destination: 'operator_wallet' | 'liquidity_pool';
  tx_hash: string;
}) {
  await client.post('/api/v1/custodian/mint-proposals', input);
}

export async function recordMintApproval(onChainId: number, txHash: string) {
  await client.post('/api/v1/custodian/mint-proposals/approve', { on_chain_id: onChainId, tx_hash: txHash });
}

export async function recordMintRejection(onChainId: number, txHash: string) {
  await client.post('/api/v1/custodian/mint-proposals/reject', { on_chain_id: onChainId, tx_hash: txHash });
}

export async function recordMintExecution(onChainId: number, txHash: string, contractAddress: string) {
  await client.post('/api/v1/custodian/mint-proposals/execute', { on_chain_id: onChainId, tx_hash: txHash, contract_address: contractAddress });
}

export async function recordMintRejectExecution(onChainId: number, txHash: string) {
  await client.post('/api/v1/custodian/mint-proposals/execute-reject', { on_chain_id: onChainId, tx_hash: txHash, contract_address: '' });
}

export async function recordRedeemApproval(onChainId: number, txHash: string) {
  await client.post('/api/v1/custodian/redeem-proposals/approve', { on_chain_id: onChainId, tx_hash: txHash });
}

export async function recordRedeemRejection(onChainId: number, txHash: string) {
  await client.post('/api/v1/custodian/redeem-proposals/reject', { on_chain_id: onChainId, tx_hash: txHash });
}

export async function recordRedeemExecution(onChainId: number, txHash: string, blockNumber: number) {
  await client.post('/api/v1/custodian/redeem-proposals/execute', { on_chain_id: onChainId, tx_hash: txHash, block_number: blockNumber });
}

export async function recordRedeemRejectionExecution(onChainId: number, txHash: string, blockNumber: number) {
  await client.post('/api/v1/custodian/redeem-proposals/execute-reject', { on_chain_id: onChainId, tx_hash: txHash, block_number: blockNumber });
}

const appChainId = arbitrumSepolia.id;
const PROTOCOL_ADDRESS = process.env.EXPO_PUBLIC_PULSAR_PROTOCOL_ADDRESS as `0x${string}`;
const MINT_THRESHOLD = 3;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useCustodianMembers() {
  return useQuery({
    queryKey: ['custodian', 'members'],
    queryFn: getCustodianMembers,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useCustodianStats() {
  return useQuery({
    queryKey: ['custodian', 'stats'],
    queryFn: getCustodianStats,
    refetchInterval: 30_000,
  });
}

export function useCustodianRequests() {
  return useQuery({
    queryKey: ['custodian', 'requests'],
    queryFn: getCustodianRequests,
    refetchInterval: 3_000,
  });
}

export function useCustodianStocks() {
  return useQuery({
    queryKey: ['custodian', 'stocks'],
    queryFn: getCustodianStocks,
    refetchInterval: 30_000,
  });
}

export function useReserves() {
  return useQuery({
    queryKey: ['public', 'reserves'],
    queryFn: getReserves,
    refetchInterval: 30_000,
  });
}

export function useWalletVerifications() {
  return useQuery({
    queryKey: ['custodian', 'wallet-verifications'],
    queryFn: getWalletVerifications,
    refetchInterval: 30_000,
  });
}

export function useCreateWalletVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWalletVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian'] });
    },
  });
}

export interface RequestMintParams {
  ticker: string;
  stockName: string;
  idxTicker: string;
  tokenAmount: bigint;
  idrxAmount: bigint;
  attestationHash: `0x${string}`;
}

export function buildAttestationHash(ticker: string, quantity: string, idrxAmount: bigint): `0x${string}` {
  return keccak256(encodePacked(
    ['string', 'string', 'uint256'],
    [ticker, quantity, idrxAmount]
  ));
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function ensureIdrxAllowance(params: {
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>;
  writeContractAsync: ReturnType<typeof useWriteContract>['writeContractAsync'];
  idrxAddress: `0x${string}`;
  owner: `0x${string}`;
  amount: bigint;
}) {
  if (params.amount <= BigInt(0)) return;

  const allowance = await params.publicClient.readContract({
    address: params.idrxAddress,
    abi: IDRX_ABI,
    functionName: 'allowance',
    args: [params.owner, PROTOCOL_ADDRESS],
  }) as bigint;

  if (allowance >= params.amount) return;

  const balance = await params.publicClient.readContract({
    address: params.idrxAddress,
    abi: IDRX_ABI,
    functionName: 'balanceOf',
    args: [params.owner],
  }) as bigint;

  if (balance < params.amount) {
    throw new Error(`IDRX balance is not enough for LP funding. Need ${params.amount.toString()}, balance ${balance.toString()}.`);
  }

  const hash = await params.writeContractAsync({
    address: params.idrxAddress,
    abi: IDRX_ABI,
    functionName: 'approve',
    args: [PROTOCOL_ADDRESS, params.amount],
    chainId: appChainId,
  });
  await params.publicClient.waitForTransactionReceipt({ hash });
}

interface ExecuteMintContext {
  proposalId: bigint;
  ticker: string;
  requester: `0x${string}`;
  caller: `0x${string}`;
  approvalCount: number;
  executed: boolean;
  stockAddress: `0x${string}`;
}

function formatExecuteMintError(err: unknown, context: ExecuteMintContext): string {
  if (err instanceof BaseError) {
    const revertError = err.walk((e) => e instanceof ContractFunctionRevertedError);

    if (revertError instanceof ContractFunctionRevertedError) {
      const name = revertError.data?.errorName;
      const args = revertError.data?.args ?? [];

      if (name === 'ProposalNotFound') return `Proposal #${context.proposalId.toString()} not found on-chain.`;
      if (name === 'ProposalAlreadyExecuted') return `Proposal #${context.proposalId.toString()} is already executed.`;
      if (name === 'NotRequester') return `Only requester can execute mint. Switch wallet to ${shortAddress(String(args[1] ?? context.requester))}.`;
      if (name === 'ThresholdNotMet') return `Need ${String(args[2] ?? MINT_THRESHOLD)} approvals before execute. Current ${String(args[1] ?? context.approvalCount)}/${String(args[2] ?? MINT_THRESHOLD)}.`;
    }

    if (context.requester === ZERO_ADDRESS) return `Proposal #${context.proposalId.toString()} not found on-chain.`;
    if (context.executed) return `Proposal #${context.proposalId.toString()} is already executed.`;
    if (context.requester.toLowerCase() !== context.caller.toLowerCase()) {
      return `Only requester can execute mint. Switch wallet to ${shortAddress(context.requester)}.`;
    }
    if (context.approvalCount < MINT_THRESHOLD) {
      return `Need ${MINT_THRESHOLD} approvals before execute. Current ${context.approvalCount}/${MINT_THRESHOLD}.`;
    }

    const poolStep = context.stockAddress === ZERO_ADDRESS ? `deploying ${context.ticker} pool` : `${context.ticker} liquidity`;
    return `Liquidity provisioning failed while ${poolStep}. Requester and approvals are valid; router/addLiquidity reverted without a reason.`;
  }

  return err instanceof Error ? err.message : 'executeMint simulation failed';
}

export function useRequestMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();


  return useMutation({
    mutationFn: async (params: RequestMintParams) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');


      try {
        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'requestMint',
          args: [
            params.ticker,
            params.stockName,
            params.idxTicker,
            params.tokenAmount,
            params.idrxAmount,
            params.attestationHash,
          ],
          account: address,
        });
        return writeContractAsync({ ...request, chainId: appChainId });
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'requestMint simulation failed');
      }
    },
  });
}

export function useApproveMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      try {
        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'approveMint',
          args: [proposalId],
          account: address,
        });
        const txHash = await writeContractAsync({ ...request, chainId: appChainId } as any);
        await recordMintApproval(Number(proposalId), txHash);
        return txHash;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'approveMint simulation failed');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useRejectMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      try {
        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'rejectMint',
          args: [proposalId],
          account: address,
        });
        const txHash = await writeContractAsync({ ...request, chainId: appChainId } as any);
        await recordMintRejection(Number(proposalId), txHash);
        return txHash;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'rejectMint simulation failed');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useApproveRedeem() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      try {
        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'approveRedeem',
          args: [requestId],
          account: address,
        });
        const txHash = await writeContractAsync({ ...request, chainId: appChainId } as any);
        await recordRedeemApproval(Number(requestId), txHash);
        return txHash;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'approveRedeem simulation failed');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useRejectRedeem() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      try {
        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'rejectRedeem',
          args: [requestId],
          account: address,
        });
        const txHash = await writeContractAsync({ ...request, chainId: appChainId } as any);
        await recordRedeemRejection(Number(requestId), txHash);
        return txHash;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'rejectRedeem simulation failed');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useExecuteMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (proposalId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');


      const proposal = await publicClient.readContract({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'proposals',
        args: [proposalId],
      });
      const ticker = proposal[0] as string;
      const idrxAmount = proposal[4] as bigint;
      const requester = proposal[7] as `0x${string}`;
      const approvalCount = Number(proposal[8]);
      const executed = Boolean(proposal[9]);
      const stockAddress = await publicClient.readContract({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'stocks',
        args: [ticker],
      }) as `0x${string}`;

      try {
        if (idrxAmount > BigInt(0)) {
          const idrxAddress = await publicClient.readContract({
            address: PROTOCOL_ADDRESS,
            abi: PULSAR_PROTOCOL_ABI,
            functionName: 'idrx',
          }) as `0x${string}`;

          await ensureIdrxAllowance({
            publicClient,
            writeContractAsync,
            idrxAddress,
            owner: address,
            amount: idrxAmount,
          });
        }

        const { request } = await publicClient.simulateContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'executeMint',
          args: [proposalId],
          account: address,
        });

        const hash = await writeContractAsync({
          ...request,
          chainId: appChainId,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const deployedStockAddress = await publicClient.readContract({
          address: PROTOCOL_ADDRESS,
          abi: PULSAR_PROTOCOL_ABI,
          functionName: 'stocks',
          args: [ticker],
        }) as `0x${string}`;

        await recordMintExecution(Number(proposalId), hash, deployedStockAddress);
        return hash;
      } catch (err) {
        console.error('executeMint raw error:', err);
        throw new Error(formatExecuteMintError(err, {
          proposalId,
          ticker,
          requester,
          caller: address,
          approvalCount,
          executed,
          stockAddress,
        }));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useExecuteRejectMint() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');

      const hash = await writeContractAsync({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'executeRejectMint',
        args: [proposalId],
        chainId: appChainId,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await recordMintRejectExecution(Number(proposalId), hash);
      return hash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useExecuteRedeem() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      const { request } = await publicClient.simulateContract({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'executeRedeem',
        args: [requestId],
        account: address,
      });
      const hash = await writeContractAsync({ ...request, chainId: appChainId } as any);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      await recordRedeemExecution(Number(requestId), hash, Number(receipt.blockNumber));
      return hash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export function useExecuteRejectRedeem() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');

      const { request } = await publicClient.simulateContract({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'executeReject',
        args: [requestId],
        account: address,
      });
      const hash = await writeContractAsync({ ...request, chainId: appChainId } as any);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      await recordRedeemRejectionExecution(Number(requestId), hash, Number(receipt.blockNumber));
      return hash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian', 'requests'] });
    },
  });
}

export interface RecordKYCParams {
  walletAddress: `0x${string}`;
  type: 'retail' | 'institution';
  fullName: string;
  email: string;
  document: File;
}

export function useRecordKYC() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RecordKYCParams) => {
      if (!publicClient) throw new Error('Public client not ready');
      if (!address) throw new Error('Wallet not connected');


      const { request } = await publicClient.simulateContract({
        address: PROTOCOL_ADDRESS,
        abi: PULSAR_PROTOCOL_ABI,
        functionName: 'approveKYC',
        args: [params.walletAddress],
        account: address,
      });

      const hash = await writeContractAsync({ ...request, chainId: appChainId } as any);
      await publicClient.waitForTransactionReceipt({ hash });

      const body = new FormData();
      body.append('wallet_address', params.walletAddress);
      body.append('type', params.type);
      body.append('full_name', params.fullName);
      body.append('email', params.email);
      body.append('approval_tx_hash', hash);
      body.append('document', params.document);
      await createWalletVerification(body);

      return hash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['custodian'] });
    },
  });
}
