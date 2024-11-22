import { type z } from "zod";
import { type payloadSchema, type emailControlSchema } from "./schemas";

export type PayloadSchema = z.infer<typeof payloadSchema>;
export type ControlSchema = z.infer<typeof emailControlSchema>;
