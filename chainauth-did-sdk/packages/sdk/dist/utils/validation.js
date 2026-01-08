import { z } from 'zod';
export const XRPLAddressSchema = z.string().regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, "Invalid XRPL address format");
export const DIDSchema = z.string().startsWith("did:chainauth:", "Invalid DID format");
export const RecoveryConfigSchema = z.object({
    signers: z.array(XRPLAddressSchema).min(1),
    quorum: z.number().int().positive()
}).refine(data => data.quorum <= data.signers.length, {
    message: "Quorum cannot be greater than the number of signers"
});
export const CredentialSchema = z.object({
    issuer: DIDSchema,
    subject: DIDSchema,
    claims: z.record(z.string(), z.any())
});
export const PaymentSchema = z.object({
    destination: XRPLAddressSchema,
    amount: z.string().regex(/^[0-9.]+$/, "Amount must be a numeric string"),
    currency: z.string().length(3).or(z.string().length(40)) // RLUSD is 40 hex chars or standard 3 char code
});
//# sourceMappingURL=validation.js.map