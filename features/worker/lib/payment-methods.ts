import type { WorkerPaymentAccount } from "@/features/worker/types/worker-portal";

export type MomoProviderTab = "MTN_MOMO" | "ORANGE_MONEY";

export type ProviderPaymentSlot = {
  accountId: string | null;
  phone: string;
  isPrimary: boolean;
};

export type PaymentMethodsFormState = {
  activeProvider: MomoProviderTab;
  mtn: ProviderPaymentSlot;
  orange: ProviderPaymentSlot;
};

function isOrangeProvider(provider?: string | null) {
  return String(provider ?? "").toLowerCase().includes("orange");
}

export function paymentMethodsFromProfile(accounts: WorkerPaymentAccount[] = []): PaymentMethodsFormState {
  const mtnAccount = accounts.find((a) => !isOrangeProvider(a.provider));
  const orangeAccount = accounts.find((a) => isOrangeProvider(a.provider));
  const primary = accounts.find((a) => a.isPrimary);

  const mtn: ProviderPaymentSlot = {
    accountId: mtnAccount?.id ?? null,
    phone: mtnAccount?.phoneNumber ?? mtnAccount?.phone ?? "",
    isPrimary: primary ? !isOrangeProvider(primary.provider) : false,
  };
  const orange: ProviderPaymentSlot = {
    accountId: orangeAccount?.id ?? null,
    phone: orangeAccount?.phoneNumber ?? orangeAccount?.phone ?? "",
    isPrimary: primary ? isOrangeProvider(primary.provider) : false,
  };

  const activeProvider: MomoProviderTab =
    primary && isOrangeProvider(primary.provider) ? "ORANGE_MONEY" : "MTN_MOMO";

  return { activeProvider, mtn, orange };
}

export function activePaymentSlot(state: PaymentMethodsFormState): ProviderPaymentSlot {
  return state.activeProvider === "MTN_MOMO" ? state.mtn : state.orange;
}

export function updateActivePaymentSlot(
  state: PaymentMethodsFormState,
  patch: Partial<ProviderPaymentSlot>,
): PaymentMethodsFormState {
  const key = state.activeProvider === "MTN_MOMO" ? "mtn" : "orange";
  return { ...state, [key]: { ...state[key], ...patch } };
}

export function switchPaymentProvider(
  state: PaymentMethodsFormState,
  provider: MomoProviderTab,
  phoneDraft: string,
): PaymentMethodsFormState {
  const withPhone = updateActivePaymentSlot(state, { phone: phoneDraft });
  return { ...withPhone, activeProvider: provider };
}
