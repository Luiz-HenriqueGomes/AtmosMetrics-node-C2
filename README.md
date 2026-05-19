# AtmosMetrics API 🌦️

API REST completa para gerenciamento de estações meteorológicas e leitura de métricas atmosféricas (temperatura, umidade e qualidade do ar).

## Domínio Escolhido

**Sistema de Monitoramento Atmosférico** — Permite que usuários registrem estações meteorológicas e adicionem leituras de sensores. Conta com sistema de autenticação JWT, autorização por roles (USER/ADMIN) e controle de propriedade.

## Entidades e Relacionamentos

```
User (1) ──── (N) Station (1) ──── (N) Reading
```

| Entidade | Campos | Relacionamento |
|----------|--------|----------------|
| **User** | id, name, email, password, role, createdAt | Possui N Stations |
| **Station** | id, name, location, isActive, userId | Pertence a 1 User, possui N Readings |
| **Reading** | id, temperature, humidity, airQuality, timestamp, stationId | Pertence a 1 Station |

## Stack Tecnológica

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Banco de dados:** SQLite
- **Autenticação:** JWT (jsonwebtoken) + bcrypt
- **Validação:** Zod
- **Testes:** Vitest + Supertest
- **Documentação API:** Swagger (OpenAPI 3.0)

## Instalação e Configuração

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd atmosmetrics-node

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Rodar as migrations do banco de dados
npx prisma migrate dev

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## Documentação da API (Swagger)

Acesse `http://localhost:3000/api-docs` para visualizar a documentação interativa da API.

## Endpoints

### Auth
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Login (retorna JWT) | ❌ |
| GET | `/api/auth/me` | Dados do usuário autenticado | ✅ |

### Stations
| Método | Rota | Descrição | Auth | Role |
|--------|------|-----------|------|------|
| POST | `/api/stations` | Criar estação | ✅ | USER |
| GET | `/api/stations` | Listar minhas estações | ✅ | USER |
| GET | `/api/stations/all` | Listar TODAS estações | ✅ | ADMIN |
| GET | `/api/stations/:id` | Buscar por ID (com leituras) | ✅ | USER |
| PUT | `/api/stations/:id` | Atualizar estação (dono) | ✅ | USER |
| DELETE | `/api/stations/:id` | Deletar estação (dono) | ✅ | USER |

### Readings
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/readings` | Criar leitura | ✅ |
| GET | `/api/readings/station/:stationId` | Leituras por estação | ✅ |
| GET | `/api/readings/:id` | Buscar por ID (com estação) | ✅ |

## Exemplos de Requisições (curl)

### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@email.com", "password": "senha123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@email.com", "password": "senha123"}'
```

### Dados do usuário autenticado
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Criar estação
```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"name": "Estação Centro", "location": "São Paulo - SP"}'
```

### Criar leitura
```bash
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"temperature": 25.5, "humidity": 60, "airQuality": 42, "stationId": "ID_DA_ESTACAO"}'
```

### Buscar estação por ID (com leituras)
```bash
curl http://localhost:3000/api/stations/ID_DA_ESTACAO \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes com relatório de cobertura
npm run coverage
```

### Estrutura dos testes
- **Unitários (15 testes):** helpers de senha, helpers de token, validações Zod
- **Integração (28 testes):** auth (register, login, me, 401), stations (CRUD, ownership, admin), readings (CRUD, ownership, include)

## Autorização

- **USER** (padrão): pode gerenciar suas próprias estações e leituras
- **ADMIN**: pode acessar todas as estações de todos os usuários via `GET /api/stations/all`
- **Controle de propriedade**: usuários só podem editar/deletar recursos que criaram

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão com o SQLite | `file:./dev.db` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | `minha-chave-secreta` |
| `PORT` | Porta do servidor | `3000` |
