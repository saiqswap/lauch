import {AptosPayload, TransactionProvider} from "@/Services/Wallet/TransactionProvider";
import {WalletNotFound} from "@/Services/Wallet/errors";

export class RiseTransactionProvider extends TransactionProvider {
  async sendTransactionOnAptos(options: any, payload: AptosPayload): Promise<any> {
    try {
      if (!("rise" in window)) {
        throw new WalletNotFound();
      }
      const rise = (window as any).rise;

      return await rise.signAndSubmitTransaction(payload);
    } catch (error: any) {
      console.error(error);
      throw error;
    } finally {
      console.log("Rise submit transaction: " + payload + ", with options: " + options);
    }
  }
}
