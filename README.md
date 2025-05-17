# Dr.Next - Doctor Appointment System

A modern doctor appointment system built with NestJS, following Domain-Driven Design (DDD) principles.

## 🏗 Project Structure

```
src/
├── modules/
│   ├── users/                 # User management module
│   │   ├── application/      # Application layer
│   │   │   ├── commands/     # Command implementations and handlers
│   │   │   ├── queries/      # Query implementations and handlers
│   │   │   └── use-case/     # Use case orchestrators
│   │   ├── domain/           # Domain layer
│   │   │   ├── models/       # Domain entities and aggregates
│   │   │   ├── repositories/ # Repository interfaces
│   │   │   ├── services/     # Domain services
│   │   │   └── events/       # Domain events
│   │   ├── infrastructure/   # Infrastructure layer
│   │   │   ├── repositories/ # Repository implementations
│   │   │   ├── entities/     # TypeORM entities
│   │   │   └── services/     # External services (Redis, email, etc.)
│   │   └── presentation/     # Presentation layer
│   │       ├── controllers/  # API controllers
│   │       └── dtos/        # Data Transfer Objects
│   │
│   ├── doctors/              # Doctor management module
│   ├── appointments/         # Appointment management module
│   ├── availability/         # Doctor availability management
│   ├── notifications/        # Notification system
│   └── shared/              # Shared utilities and components
│
├── database/                # Database configuration and migrations
│   ├── migrations/         # Database migration files
│   ├── seeds/             # Database seed files
│   └── config/            # Database configuration files
│
├── shared/                 # Shared resources across modules
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Request/Response interceptors
│   ├── interfaces/        # Shared interfaces
│   ├── middleware/        # Custom middleware
│   ├── pipes/             # Custom pipes
│   └── utils/             # Utility functions
│
└── main.ts                # Application entry point
```

### Module Structure Details

Each module follows Clean Architecture principles with CQRS pattern:

1. **Application Layer** (`application/`)

   - `commands/`: Command handlers for write operations
   - `queries/`: Query handlers for read operations
   - `use-case/`: Business logic orchestration

2. **Domain Layer** (`domain/`)

   - `models/`: Core business entities and aggregates
   - `repositories/`: Repository interfaces defining data access contracts
   - `services/`: Pure domain logic services
   - `events/`: Domain events for event-driven architecture

3. **Infrastructure Layer** (`infrastructure/`)

   - `repositories/`: Concrete implementations of repository interfaces
   - `entities/`: TypeORM entity definitions
   - `services/`: External service integrations (Redis, email, queues)

4. **Presentation Layer** (`presentation/`)
   - `controllers/`: API endpoints and request handling
   - `dtos/`: Data Transfer Objects for request/response

### Database Directory

The `database/` directory contains all database-related configurations:

1. **Migrations** (`migrations/`)

   - Version-controlled database schema changes
   - Up and down migrations for rollback support
   - Timestamp-based naming convention

2. **Seeds** (`seeds/`)

   - Initial data population scripts
   - Test data generation
   - Environment-specific seeders

3. **Config** (`config/`)
   - Database connection configurations
   - Environment-specific settings
   - TypeORM configuration files

### Shared Directory

The `shared/` directory contains reusable components:

1. **Decorators** (`decorators/`)

   - Custom method and class decorators
   - Authentication decorators
   - Validation decorators

2. **Filters** (`filters/`)

   - Global exception filters
   - HTTP exception handlers
   - Custom error responses

3. **Guards** (`guards/`)

   - Authentication guards
   - Role-based access control
   - Request validation guards

4. **Interceptors** (`interceptors/`)

   - Request/Response transformation
   - Logging interceptors
   - Performance monitoring

5. **Middleware** (`middleware/`)

   - Request processing middleware
   - Authentication middleware
   - Logging middleware

6. **Pipes** (`pipes/`)

   - Data transformation pipes
   - Validation pipes
   - Custom data processing

7. **Utils** (`utils/`)
   - Helper functions
   - Common utilities
   - Shared constants

## 🗄 Database Schema

### Users Table

- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) (Unique)
- `password`: VARCHAR(255) (Hashed)
- `role`: ENUM('admin', 'doctor', 'patient')
- `status`: ENUM('active', 'inactive')
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### Doctors Table

- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key -> Users)
- `specialty`: VARCHAR(100)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### Availability Table

- `id`: UUID (Primary Key)
- `doctorId`: UUID (Foreign Key -> Doctors)
- `date`: DATE (YYYY-MM-DD)
- `startTime`: TIME
- `endTime`: TIME
- `isAvailable`: BOOLEAN
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### Appointments Table

- `id`: UUID (Primary Key)
- `doctorId`: UUID (Foreign Key -> Doctors)
- `patientId`: UUID (Foreign Key -> Users)
- `date`: DATE
- `startTime`: TIME
- `endTime`: TIME
- `status`: ENUM('scheduled', 'completed', 'cancelled', 'no_show')
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

## ⏰ Time Slots System

The system manages doctor availability and appointments using a flexible time slot system:

1. **Availability Configuration**

   - Doctors can set their availability for each day of the week
   - Each availability period has:
     - Start time
     - End time
     - Slot duration (default: 30 minutes)

2. **Slot Generation**

   - System automatically generates available slots based on:
     - Doctor's availability
     - Existing appointments
     - Slot duration

3. **Booking Rules**
   - Slots can only be booked during doctor's available hours
   - Minimum 24-hour advance booking required
   - Maximum 30-day advance booking allowed
   - No overlapping appointments allowed

## 🔍 API Filtering System

The system implements a flexible filtering mechanism for all `findAll` endpoints. Here's how it works:

### Query Parameters

```typescript
interface FilterInput {
  limit?: string; // Number of items per page (1-100, default: 10)
  page?: string; // Page number (default: 1)
  sort?: string; // Field to sort by (default: 'createdAt')
  order?: string; // Sort order ('ASC' or 'DESC', default: 'DESC')
  search?: string; // Search criteria
}
```

### Search Format

The `search` parameter uses a special format for complex queries:

```
field_operatorType=value|field_operatorType=value
```

#### Operators

- Comparison: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Text: `LIKE`, `ILIKE`
- Lists: `IN`, `NOT IN`
- Null: `IS NULL`, `IS NOT NULL`
- Range: `BETWEEN`, `NOT BETWEEN`
- Boolean: `IS TRUE`, `IS FALSE`, `IS NOT TRUE`, `IS NOT FALSE`
- Unknown: `IS UNKNOWN`, `IS NOT UNKNOWN`

#### Type Suffixes

- `S`: String
- `N`: Number
- `B`: Boolean
- `D`: Date

### Examples

1. **Basic Pagination**

```
GET /users?limit=20&page=2
```

2. **Sorting**

```
GET /users?sort=name&order=ASC
```

3. **Simple Search**

```
GET /users?search=name_likes=John
```

4. **Complex Search**

```
GET /users?search=age_gtn=18|role_ins=admin,doctor|createdAt_betweend=2024-01-01,2024-12-31
```

### Implementation Flow

1. **Request Processing**

   - Query parameters are received by the controller
   - `FilterPipe` transforms raw query parameters into `IFilter` object
   - Validation is performed on all parameters

2. **Filter Transformation**

   ```typescript
   interface IFilter {
     page: number;
     limit: number;
     search: Search[];
     sort: [string, 'ASC' | 'DESC'];
   }
   ```

3. **Query Building**

   - Base repository builds TypeORM query
   - Applies pagination, sorting, and search conditions
   - Handles complex operators and type conversions

4. **Database Query**
   - Generated SQL includes all filter conditions
   - Proper parameter binding for security
   - Efficient query execution

### Usage in Controllers

```typescript
@Get()
findAll(@Query(FilterPipe) filter: IFilter): Promise<Entity[]>
```

### Security Features

- Input validation for all parameters
- SQL injection prevention through parameter binding
- Type checking for all search values
- Maximum limit enforcement (100 items)
- Proper error handling for invalid inputs

## 🔧 Environment Variables

### Database Configuration

```env
DATABASE_URL=mysql://root:root@db:3306/dr_next
DATABASE_TEST_URL=mysql://root:root@test-db:3306/dr_next_test
```

### Redis Configuration

```env
REDIS_URL=redis://redis:6379
REDIS_TTL=3600  # Cache TTL in seconds
```

### RabbitMQ Configuration

```env
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

### JWT Configuration

```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d
```

### Application Configuration

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api
```

### Admin Configuration

```env
ADMIN_PASSWORD= admin123
ADMIN_EMAIL= admin@example.com
```

## 🐳 Docker Setup

The project uses Docker Compose for development and testing:

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up app db redis rabbitmq

# Stop all services
docker-compose down
```

### Available Services

- **App**: NestJS application (Port 3000)
- **MySQL**: Main database (Port 3306)
- **MySQL Test**: Test database (Port 3307)
- **Redis**: Cache server (Port 6379)
- **RabbitMQ**: Message broker
  - AMQP: Port 5672
  - Management UI: Port 15672 (guest/guest)

## 🚀 Development

1. **Install Dependencies**

```bash
npm install
```

2. **Run Migrations**

```bash
npm run migration:run
```

3. **Start Development Server**

```bash
npm run start:dev
```

4. **Run Tests**

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📝 API Documentation

API documentation is available at `/docs` when running the application.

## 🔐 Authentication

The system uses JWT-based authentication with the following roles:

- **Admin**: Full system access
- **Doctor**: Can manage availability and view their appointments
- **Patient**: Can book appointments and view their history

## 🔄 Caching Strategy

- Redis is used for caching:
  - Doctor availability
  - Frequently accessed data
- Cache invalidation on data updates
- Configurable TTL for different types of data

## 📨 Message Queue

RabbitMQ is used for:

- Appointment notifications
- Email notifications
- Background tasks
- System events

## 🧪 Testing

The project includes:

- Unit tests for business logic
- E2E tests for API endpoints
- Separate test database for isolation

## 📦 Dependencies

- NestJS
- TypeORM
- MySQL
- Redis
- RabbitMQ
- JWT
- Class Validator
- Class Transformer
