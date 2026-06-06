import { useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { IDRX_ABI } from "@/lib/abi/idrx_abi";
import { PULSAR_STOCK_ABI } from "@/lib/abi/pulsar_stock_abi";
import type { Token } from "@/lib/mockData";

type ContractRead = {
	address: Address;
	abi: typeof IDRX_ABI | typeof PULSAR_STOCK_ABI;
	functionName: "balanceOf" | "decimals";
	args?: readonly [Address];
};

export function useWalletTokenBalanceState(tokens: Token[]): {
	balances: Record<string, number>;
	isLoading: boolean;
} {
	const { address } = useAccount();
	const idrxAddress = (process.env.EXPO_PUBLIC_IDRX_ADDRESS ||
		"0x03b53A71C5517907006EAb512A31C1eD5a56Ae64") as Address | undefined;

	const tokenContracts = useMemo(() => {
		if (!address) return [] satisfies ContractRead[];
		return tokens
			.filter(
				(token): token is Token & { contractAddress: string } =>
					token.ticker !== "IDRX" && Boolean(token.contractAddress),
			)
			.flatMap((token) => [
				{
					address: token.contractAddress as Address,
					abi: PULSAR_STOCK_ABI,
					functionName: "balanceOf",
					args: [address],
				},
				{
					address: token.contractAddress as Address,
					abi: PULSAR_STOCK_ABI,
					functionName: "decimals",
				},
			]);
	}, [address, tokens]);

	const { data: balanceReads, isLoading } = useReadContracts({
		contracts: [
			...(idrxAddress && address
				? [
						{
							address: idrxAddress,
							abi: IDRX_ABI,
							functionName: "balanceOf",
							args: [address],
						},
						{
							address: idrxAddress,
							abi: IDRX_ABI,
							functionName: "decimals",
						},
					]
				: []),
			...(address ? tokenContracts : []),
		],
		query: {
			enabled: Boolean(address && idrxAddress),
			refetchInterval: 15_000,
		},
	});

	const balances = useMemo(() => {
		if (!balanceReads || !address || !idrxAddress) return {};

		const next: Record<string, number> = {};
		const idrxBalance = balanceReads[0]?.result;
		const idrxDecimals = balanceReads[1]?.result;
		if (typeof idrxBalance === "bigint" && typeof idrxDecimals === "number") {
			next.IDRX = Number(formatUnits(idrxBalance, idrxDecimals));
		}

		let readIndex = 2;
		for (const token of tokens.filter(
			(item) => item.ticker !== "IDRX" && item.contractAddress,
		)) {
			const tokenBalance = balanceReads[readIndex]?.result;
			const tokenDecimals = balanceReads[readIndex + 1]?.result;
			if (
				typeof tokenBalance === "bigint" &&
				typeof tokenDecimals === "number"
			) {
				next[token.ticker] = Number(formatUnits(tokenBalance, tokenDecimals));
			}
			readIndex += 2;
		}

		return next;
	}, [address, balanceReads, idrxAddress, tokens]);

	return { balances, isLoading: Boolean(address && idrxAddress && isLoading) };
}
