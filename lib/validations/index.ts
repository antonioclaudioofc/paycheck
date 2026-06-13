import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(100),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Deve ser um código de cor hexadecimal válido (ex: #ffffff)",
    ),
  icon: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createTransactionSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo").max(999999999),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "A descrição é obrigatória").max(255).trim(),
  categoryId: z.string().cuid("ID de categoria inválido"),
  date: z.coerce.date(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  notes: z.string().max(1000).optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrence: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const createBudgetSchema = z.object({
  categoryId: z.string().cuid("ID de categoria inválido"),
  amount: z.number().positive("O valor deve ser positivo").max(999999999),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const createGoalSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(255),
  targetAmount: z
    .number()
    .positive("O valor da meta deve ser positivo")
    .max(999999999),
  savedAmount: z
    .number()
    .nonnegative("O valor economizado não pode ser negativo")
    .default(0),
  deadline: z.coerce.date().optional().nullable(),
  status: z
    .enum(["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"])
    .default("ACTIVE"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
