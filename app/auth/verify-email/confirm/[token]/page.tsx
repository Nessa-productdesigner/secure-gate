import { VerifyEmailConfirmClient } from "./verify-email-confirm-client";

export const dynamic = "force-dynamic";

export default function VerifyEmailConfirmPage({
  params,
}: {
  params: { token: string };
}) {
  return <VerifyEmailConfirmClient token={params.token} />;
}
