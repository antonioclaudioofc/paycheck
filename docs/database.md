# Modelagem do Banco de Dados — Paycheck

Este documento detalha o modelo relacional do banco de dados do **Paycheck**, utilizando **Prisma ORM 6** e **PostgreSQL**.

---

## 1. Diagrama de Relacionamentos (ERD)

O banco de dados é composto por 7 tabelas principais que suportam a autenticação de usuários, contas externas (OAuth), sessões, transações financeiras, orçamentos e metas de economia.

```mermaid
erDiagram
    users ||--o{ accounts : "has"
    users ||--o{ sessions : "has"
    users ||--o{ transactions : "performs"
    users ||--o{ categories : "defines"
    users ||--o{ budgets : "sets"
    users ||--o{ goals : "creates"
    categories ||--o{ transactions : "classifies"
    categories ||--o{ budgets : "limits"

    users {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    accounts {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    sessions {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    categories {
        string id PK
        string userId FK
        string name
        string color
        string icon
        string type
        boolean isDefault
        datetime createdAt
    }

    transactions {
        string id PK
        string userId FK
        string categoryId FK
        decimal amount
        string type
        string description
        datetime date
        string_array tags
        boolean isRecurring
        string recurrence
        string notes
        datetime createdAt
        datetime updatedAt
    }

    budgets {
        string id PK
        string userId FK
        string categoryId FK
        decimal amount
        int month
        int year
    }

    goals {
        string id PK
        string userId FK
        string title
        decimal targetAmount
        decimal savedAmount
        datetime deadline
        string status
    }
```

---

## 2. Tabelas e Campos Relevantes

### 2.1. Usuários e Sessões (Auth.js)
As tabelas `users`, `accounts` e `sessions` são geradas de acordo com as especificações exigidas pelo adaptador do **Auth.js** para garantir conformidade e funcionamento nativo do mecanismo de login e controle de cookies de sessão.

### 2.2. Transações (`transactions`)
- **`amount`**: Representado como `Decimal(12, 2)` no PostgreSQL para evitar problemas comuns de ponto flutuante que ocorrem em campos do tipo `float` ou `double`.
- **`type`**: Enum `TransactionType` com valores `INCOME` (Receitas) ou `EXPENSE` (Despesas).
- **`tags`**: Campo do tipo array de strings `String[]` nativo do PostgreSQL, ideal para classificar transações sem a necessidade de criar uma tabela de junção N:M complexa.
- **`isRecurring` & `recurrence`**: Permite agendamento de transações repetitivas (diário, semanal, mensal ou anual).

### 2.3. Orçamentos (`budgets`)
Define limites mensais de gastos por categoria.
- Possui uma restrição de unicidade composta (`@@unique([userId, categoryId, month, year])`) para impedir que o mesmo usuário crie múltiplos orçamentos para a mesma categoria no mesmo mês/ano.

### 2.4. Metas (`goals`)
Controla o progresso de economia dos usuários.
- **`savedAmount`**: Valor já economizado para a meta (padrão: 0).
- **`status`**: Enum `GoalStatus` que define os estados `ACTIVE`, `COMPLETED`, `PAUSED` ou `CANCELLED`.

---

## 3. Índices e Otimizações de Desempenho

Para assegurar consultas rápidas mesmo com grandes volumes de transações, foram definidos índices compostos na tabela `transactions`:

1. `@@index([userId, date])`: Otimiza a renderização de extratos ordenados por data e filtros temporais.
2. `@@index([userId, type])`: Otimiza a agregação de totais de receitas e despesas no dashboard.
3. `@@index([userId, categoryId])`: Otimiza os relatórios de gastos por categoria e checagem de limites de orçamento.
