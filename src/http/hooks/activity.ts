/**
 * activity.ts — Activity feed hooks
 *
 * Activity in PulsarFi is derived directly from on-chain stock transactions.
 * We simply re-export the relevant identifiers from swap.ts to keep things DRY
 * and give consuming screens a semantically clear import path.
 */
export {
  useStockTransactions as useActivity,
  type StockTransaction as Activity,
  transactionKeys as activityKeys,
} from './swap';
