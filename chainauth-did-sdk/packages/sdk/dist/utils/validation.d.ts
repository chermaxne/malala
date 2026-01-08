import { z } from 'zod';
export declare const XRPLAddressSchema: z.ZodString;
export declare const DIDSchema: z.ZodString;
export declare const RecoveryConfigSchema: z.ZodObject<{
    signers: z.ZodArray<z.ZodString>;
    quorum: z.ZodNumber;
}, z.core.$strip>;
export declare const CredentialSchema: z.ZodObject<{
    issuer: z.ZodString;
    subject: z.ZodString;
    claims: z.ZodRecord<z.ZodString, z.ZodAny>;
}, z.core.$strip>;
export declare const PaymentSchema: z.ZodObject<{
    destination: z.ZodString;
    amount: z.ZodString;
    currency: z.ZodUnion<[z.ZodString, z.ZodString]>;
}, z.core.$strip>;
