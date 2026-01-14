import DodoPayments from "dodopayments";

const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
const bearerToken = environment === "live_mode" ? process.env.DODO_API_KEY_LIVE : process.env.DODO_API_KEY_TEST;

if (!bearerToken && process.env.NODE_ENV === "production") {
  console.warn("WARNING: Dodo Payments API key is not set. Payments will fail in production.");
}

export const dodo = new DodoPayments({
  bearerToken: bearerToken || "mock_key",
  environment: environment,
});