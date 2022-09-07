import { z } from "zod";

export const basicEntityValidation = z.object({
  campaignId: z.string(),
  name: z.string().min(1, "Required"),
  summary: z.string().min(1, "Required"),
  notes: z.string(),
  privateNotes: z.string(),
});
