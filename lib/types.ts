
export interface Category {
  id: string;
  name: string;
  color: string;
  type: "INCOME" | "EXPENSE";
  icon?: string | null;
}

export interface Transaction {
  id: string;
  amount: string | number;
  type: "INCOME" | "EXPENSE";
  description: string;
  date: string;
  categoryId: string;
  tags?: string[];
  notes?: string | null;
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string | null;
  };
}

export interface TransactionsResponse {
  data: Transaction[];
  nextCursor: string | null;
}

export interface Budget {
  id: string;
  amount: string | number;
  month: number;
  year: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string | null;
  };
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: string | number;
  savedAmount: string | number;
  deadline: string | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
}

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  totalSpent: number;
  percentage: number;
  severity: "warning" | "danger";
  message: string;
}
