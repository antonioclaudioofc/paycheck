# Sistema de Rate Limiting (Token Bucket) — Paycheck

Este documento descreve o funcionamento e a arquitetura do limitador de taxa (**Rate Limiter**) implementado no **Paycheck** para proteger a aplicação contra ataques de força bruta, abuso de chamadas de API e instabilidades causadas por sobrecarga.

---

## 1. O Algoritmo Token Bucket

Optamos pelo algoritmo **Token Bucket** (Balde de Tokens) pela sua capacidade de lidar com rajadas legítimas de requisições de forma elegante, mantendo uma taxa média constante de consumo a longo prazo.

### 1.1. Funcionamento Teórico

1. **Capacidade Máxima ($C$)**: O balde possui um limite máximo de tokens que pode conter (ex: 60 tokens).
2. **Taxa de Recarga ($R$)**: Tokens são adicionados ao balde de forma contínua a uma taxa constante de $R$ tokens por segundo (ex: 1 token por segundo).
3. **Consumo**: Cada requisição de entrada tenta consumir exatamente 1 token do balde associado àquele usuário ou endereço IP.
   - Se o balde contiver **ao menos 1 token**, o token é removido e a requisição é permitida.
   - Se o balde estiver **vazio (0 tokens)**, a requisição é rejeitada imediatamente com o código HTTP **`429 Too Many Requests`**.

### 1.2. Matemática da Recarga sob Demanda

Para evitar que processos em segundo plano fiquem rodando timers constantes atualizando os baldes de todos os usuários (o que sobrecarregaria a CPU), a recarga é calculada **em tempo de execução (lazy evaluation)** quando uma nova requisição chega.

Quando uma requisição é recebida no timestamp atual ($T_{\text{atual}}$):

$$\Delta T = T_{\text{atual}} - T_{\text{ultimo\_refill}}$$

$$\text{novos\_tokens} = \Delta T \times R$$

$$\text{tokens}_{\text{disponiveis}} = \min(C, \text{tokens}_{\text{anteriores}} + \text{novos\_tokens})$$

Se $\text{tokens}_{\text{disponiveis}} \ge 1$:
- Permitir requisição.
- Atualizar estado do balde: $\text{tokens} = \text{tokens}_{\text{disponiveis}} - 1$, $T_{\text{ultimo\_refill}} = T_{\text{atual}}$.

---

## 2. Cabeçalhos HTTP de Resposta

Para manter o cliente informado sobre o estado de seu limite de requisições, o middleware injeta cabeçalhos HTTP padrão na resposta de todas as rotas protegidas:

| Cabeçalho | Descrição | Exemplo |
|-----------|-----------|---------|
| `X-RateLimit-Limit` | Capacidade máxima de requisições do balde ($C$). | `60` |
| `X-RateLimit-Remaining` | Número de tokens restantes no momento. | `45` |
| `X-RateLimit-Reset` | Timestamp Unix de quando o balde estará totalmente cheio de novo. | `1780720400` |

---

## 3. Armazenamento dos Baldes

A persistência do estado dos baldes (tokens e timestamps de última recarga) suporta duas estratégias configuráveis:

### 3.1. Local/Desenvolvimento: In-Memory LRU Cache
- Utiliza um `Map` na memória do próprio processo do Node.js.
- Para evitar vazamentos de memória (Memory Leaks), implementamos um limite máximo de chaves no mapa. Quando o mapa excede o limite, as chaves mais antigas ou menos usadas são descartadas (Least Recently Used).

### 3.2. Produção: Upstash/Redis
- Em ambientes serverless e com múltiplas instâncias da aplicação, a memória do servidor é efêmera e não é compartilhada.
- Nesse caso, o middleware se conecta a um banco de dados **Redis** centralizado para verificar e debitar tokens atomicamente de forma compartilhada entre todas as instâncias do Next.js.
