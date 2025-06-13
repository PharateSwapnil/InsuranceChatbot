# AWS Cloud Hosting Guide for Insurance Chatbot

## Architecture Overview

This guide covers deploying your insurance chatbot to AWS with both SQLite (simple) and PostgreSQL (scalable) options, including free tier deployment.

## Database Options

### Option 1: SQLite on AWS (Simple & Free Tier Compatible)
- **Pros**: No database service costs, simple setup, same as local development
- **Cons**: Single server limitation, no automatic backups, data loss if instance fails
- **Best For**: Development, demos, small-scale usage

### Option 2: RDS PostgreSQL (Production Ready)
- **Pros**: Managed service, automatic backups, high availability
- **Cons**: Additional cost (~$15-20/month minimum)
- **Best For**: Production applications with multiple users

## Free Tier Deployment Strategy

### AWS Free Tier Limits (12 months)
- **EC2**: 750 hours/month of t2.micro instances
- **RDS**: 750 hours/month of db.t2.micro + 20GB storage
- **Load Balancer**: NOT included in free tier
- **Route 53**: $0.50/month for hosted zone (not free)

### FREE TIER DEPLOYMENT (SQLite)
**Monthly Cost: $0 - $3**

#### Required Services:
1. **EC2 t2.micro** (FREE for 12 months)
   - 1 vCPU, 1GB RAM
   - 8GB EBS storage (FREE)
   - SQLite database file stored locally

#### Optional Services:
2. **Elastic IP** ($0 if attached to running instance)
3. **Route 53 Hosted Zone** ($0.50/month - skip for IP-based access)

### PRODUCTION DEPLOYMENT (PostgreSQL)
**Monthly Cost: $71-93**

#### Required Services:
1. **EC2 t3.medium** ($30-35/month)
2. **RDS PostgreSQL db.t3.micro** ($15-20/month)  
3. **Application Load Balancer** ($20-25/month)
4. **Route 53** ($1-3/month)
5. **CloudWatch** ($5-10/month)

## FREE TIER SQLITE DEPLOYMENT

### Phase 1: EC2 Instance Setup (FREE)

1. **Launch EC2 t2.micro Instance (FREE)**
```bash
# Create EC2 instance
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --key-name your-key-pair \
    --security-group-ids sg-web-server \
    --user-data file://sqlite-user-data.sh
```

2. **Create Security Group for Web Server**
```bash
# Create security group
aws ec2 create-security-group \
    --group-name insurance-chatbot-sg \
    --description "Security group for insurance chatbot"

# Allow HTTP and SSH access
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32
```

3. **SQLite User Data Script** (`sqlite-user-data.sh`)
```bash
#!/bin/bash
yum update -y
yum install -y git nginx

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application directory
mkdir -p /opt/insurance-chatbot
cd /opt/insurance-chatbot

# Clone your repository (replace with your repo)
git clone https://github.com/yourusername/insurance-chatbot.git .

# Install dependencies
npm install

# Build application with correct output directory
npx vite build --outDir server/public

# Create data directory for SQLite
mkdir -p /opt/insurance-chatbot/data

# Set up environment variables
cat > .env << EOF
NODE_ENV=production
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET=your_session_secret_here
EOF

# Configure Nginx as reverse proxy
cat > /etc/nginx/conf.d/insurance-chatbot.conf << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start services
systemctl enable nginx
systemctl start nginx

# Start application with PM2
pm2 start server/index.ts --name insurance-chatbot
pm2 startup
pm2 save
```

### Phase 2: SQLite Database Management

#### Viewing SQLite Data in Cloud

1. **SSH into EC2 Instance**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

2. **Install SQLite CLI Tools**
```bash
sudo yum install -y sqlite
```

3. **Access Database**
```bash
cd /opt/insurance-chatbot
sqlite3 data/insurance.db

# View tables
.tables

# Query customers
SELECT * FROM customers LIMIT 5;

# Query chat sessions
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 10;

# Exit SQLite
.quit
```

4. **Backup SQLite Database**
```bash
# Create backup
sqlite3 data/insurance.db .dump > backup-$(date +%Y%m%d).sql

# Download backup to local machine
scp -i your-key.pem ec2-user@your-ec2-ip:/opt/insurance-chatbot/backup-*.sql ./
```

1. **Check Application Status**
```bash
# Check PM2 processes
pm2 status

# View application logs
pm2 logs insurance-chatbot

# Check Nginx status
sudo systemctl status nginx
```

2. **Access Your Application**
```bash
# Get your EC2 public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Access via browser: http://YOUR_EC2_IP
# Login: sales.rep001 / abhi2024
```

---

## POSTGRESQL DEPLOYMENT (If You Want Database Scalability)

### Files to Modify for PostgreSQL

If you decide to use RDS PostgreSQL instead of SQLite, modify these files:

#### 1. **server/db.ts** (Replace entirely)
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

#### 2. **server/storage.ts** (Replace SqliteStorage class)
```typescript
import { users, customers, policies, competitor_policies, chat_sessions, interaction_logs } from "@shared/schema";
import { db } from "./db";
import { eq, like, or } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db.select().from(customers).where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
        like(customers.phone, `%${query}%`)
      )
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getPolicies(): Promise<Policy[]> {
    return await db.select().from(policies);
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || undefined;
  }

  async getPoliciesByType(type: string): Promise<Policy[]> {
    return await db.select().from(policies).where(eq(policies.type, type));
  }

  async getCompetitorPolicies(): Promise<CompetitorPolicy[]> {
    return await db.select().from(competitor_policies);
  }

  async getCompetitorPoliciesByProvider(provider: string): Promise<CompetitorPolicy[]> {
    return await db.select().from(competitor_policies).where(eq(competitor_policies.provider, provider));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chat_sessions).where(eq(chat_sessions.id, id));
    return session || undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chat_sessions).values(session).returning();
    return newSession;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db.update(chat_sessions)
      .set(updates)
      .where(eq(chat_sessions.id, id))
      .returning();
    return updatedSession;
  }

  async createInteractionLog(log: InsertInteractionLog): Promise<InteractionLog> {
    const [newLog] = await db.insert(interaction_logs).values(log).returning();
    return newLog;
  }

  async getInteractionLogsByCustomer(customerId: string): Promise<InteractionLog[]> {
    return await db.select().from(interaction_logs).where(eq(interaction_logs.customer_id, customerId));
  }
}

export const storage = new DatabaseStorage();
```

#### 3. **Environment Variables** (.env)
```env
# For PostgreSQL deployment
DATABASE_URL=postgresql://admin:password@your-rds-endpoint:5432/postgres
NODE_ENV=production
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET=your_session_secret_here
```

#### 4. **Database Migration Commands**
```bash
# Push schema to PostgreSQL
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

---

## Cost Comparison

### FREE TIER (SQLite) - 12 months
- **EC2 t2.micro**: $0 (750 hours/month free)
- **EBS 8GB**: $0 (30GB free)
- **Data Transfer**: $0 (1GB free)
- **Total**: **$0/month**

### PRODUCTION (PostgreSQL) - After free tier
- **EC2 t3.medium**: $30-35/month
- **RDS db.t3.micro**: $15-20/month  
- **Load Balancer**: $20-25/month
- **Total**: **$65-80/month**

---

## Recommendation for Your Budget

**Use SQLite on EC2 t2.micro (FREE TIER)** because:
1. **Zero cost** for 12 months
2. **Same codebase** as your local development
3. **Easy backup** via SQLite file downloads
4. **Perfect for demos** and small-scale usage
5. **Simple deployment** with single EC2 instance

You can always migrate to PostgreSQL later when you have budget or need scaling.

Create `server/db-postgres.ts`:
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
```

2. **Environment Variables** (`.env.production`)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://admin:password@insurance-chatbot-db.region.rds.amazonaws.com:5432/postgres
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET=your_64_character_random_string_here
```

3. **PM2 Configuration** (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'insurance-chatbot',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Phase 4: Load Balancer & SSL

1. **Create Application Load Balancer**
```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name insurance-chatbot-alb \
    --subnets subnet-12345 subnet-67890 \
    --security-groups sg-alb-group
```

2. **Request SSL Certificate**
```bash
# Request certificate
aws acm request-certificate \
    --domain-name yourdomain.com \
    --domain-name www.yourdomain.com \
    --validation-method DNS
```

3. **Create Target Group**
```bash
# Create target group
aws elbv2 create-target-group \
    --name insurance-chatbot-targets \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-12345 \
    --health-check-path /health
```

### Phase 5: Domain & Monitoring

1. **Route 53 Configuration**
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name yourdomain.com \
    --caller-reference $(date +%s)
```

2. **CloudWatch Alarms**
```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "High-CPU-Usage" \
    --alarm-description "Alarm when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
```

## Deployment Commands

### Initial Deployment
```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to application
cd insurance-chatbot

# Set environment variables
export DATABASE_URL="postgresql://admin:password@your-rds-endpoint:5432/postgres"
export GROQ_API_KEY="your_groq_api_key"

# Build and start
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Database Migration
```bash
# Run database migrations
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

## Security Considerations

### 1. **Security Groups**
- EC2: Allow HTTP (80), HTTPS (443), SSH (22) from specific IPs
- RDS: Allow PostgreSQL (5432) only from EC2 security group
- ALB: Allow HTTP/HTTPS from anywhere

### 2. **IAM Roles**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. **Parameter Store for Secrets**
```bash
# Store API keys securely
aws ssm put-parameter \
    --name "/insurance-chatbot/groq-api-key" \
    --value "your_groq_api_key" \
    --type "SecureString"
```

## Cost Estimation (Monthly)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| EC2 t3.medium | 24/7 usage | $30-35 |
| RDS db.t3.micro | 24/7 usage | $15-20 |
| ALB | Standard usage | $20-25 |
| Route 53 | Hosted zone + queries | $1-3 |
| CloudWatch | Basic monitoring | $5-10 |
| **Total** | | **$71-93/month** |

## Scaling Options

### Auto Scaling Group
```bash
# Create launch template
aws ec2 create-launch-template \
    --launch-template-name insurance-chatbot-template \
    --launch-template-data '{
        "ImageId": "ami-0abcdef1234567890",
        "InstanceType": "t3.medium",
        "SecurityGroupIds": ["sg-ec2-group"],
        "UserData": "base64-encoded-user-data"
    }'
```

### Database Read Replicas
```bash
# Create read replica for database scaling
aws rds create-db-instance-read-replica \
    --db-instance-identifier insurance-chatbot-db-replica \
    --source-db-instance-identifier insurance-chatbot-db
```

## Monitoring & Maintenance

### Health Check Endpoint
Add to your Express app:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Log Management
```bash
# Configure PM2 logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## Backup Strategy

### Database Backups
- Automated daily backups (7-day retention)
- Weekly snapshots for long-term storage
- Point-in-time recovery enabled

### Application Backups
- Code stored in Git repository
- Environment variables in Parameter Store
- Regular AMI snapshots of EC2 instances

This setup provides a production-ready, scalable infrastructure for your insurance chatbot with proper security, monitoring, and backup procedures.