# ActivePieces SOP Tool

A comprehensive Standard Operating Procedures (SOP) management system built on ActivePieces, providing organizations with powerful tools to create, manage, execute, and audit their operational procedures.

![SOP Tool Overview](./images/sop-overview.png)

## 🎯 Overview

The ActivePieces SOP Tool transforms your organization's operational procedures into executable, auditable, and scalable workflows. It combines the power of ActivePieces' workflow automation with specialized SOP management features.

### Key Features

- **📚 Template Library**: Pre-built SOP templates for common business processes
- **🔄 Workflow Execution**: Convert SOPs into executable workflows with automated steps
- **📊 Real-time Monitoring**: Track SOP execution progress and performance metrics
- **🔍 Comprehensive Audit**: Complete audit trails for compliance and quality assurance
- **👥 Team Collaboration**: Multi-user support with role-based permissions
- **📈 Analytics & Reporting**: Detailed insights into SOP performance and adoption
- **🔗 Integration Ready**: Connect with existing business systems and tools

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- At least 2GB RAM and 2GB disk space
- Node.js 20+ (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd activepieces-sop-tool
   ```

2. **Run the deployment script**
   ```bash
   ./deploy-sop.sh
   ```

3. **Access the application**
   - Dashboard: http://localhost:8080
   - API: http://localhost:3000

The deployment script will:
- Generate secure keys automatically
- Set up all required services (PostgreSQL, Redis, etc.)
- Initialize the database with sample templates
- Configure monitoring and backup (optional)

## 📖 Documentation

### User Guides
- [Getting Started Guide](./user-guide/getting-started.md)
- [Creating SOPs](./user-guide/creating-sops.md)
- [Using Templates](./user-guide/using-templates.md)
- [Managing Executions](./user-guide/managing-executions.md)
- [Analytics and Reporting](./user-guide/analytics.md)

### Administrator Guides
- [Installation and Setup](./admin-guide/installation.md)
- [Configuration](./admin-guide/configuration.md)
- [User Management](./admin-guide/user-management.md)
- [System Monitoring](./admin-guide/monitoring.md)
- [Backup and Recovery](./admin-guide/backup-recovery.md)

### Developer Documentation
- [API Reference](./api-reference/README.md)
- [Custom Piece Development](./developer-guide/custom-pieces.md)
- [Integration Guide](./developer-guide/integrations.md)
- [Deployment Guide](./developer-guide/deployment.md)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/UI)    │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SOP Engine    │
                       │   (Workflow     │
                       │   Execution)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Audit System  │    │   Cache Layer   │
                       │   (Logging)     │    │   (Redis)       │
                       └─────────────────┘    └─────────────────┘
```

### Core Components

1. **SOP Framework**: Custom ActivePieces pieces for SOP-specific operations
2. **Template System**: Pre-built and custom SOP templates
3. **Execution Engine**: Workflow execution with state management
4. **Audit System**: Comprehensive logging and compliance tracking
5. **Analytics Engine**: Performance metrics and reporting
6. **Integration Layer**: Connect with external systems

## 🔧 Configuration

### Environment Variables

Key configuration options (see `.env.sop.example` for complete list):

```bash
# Basic Configuration
AP_FRONTEND_URL=http://localhost:8080
AP_POSTGRES_DATABASE=activepieces_sop
AP_POSTGRES_PASSWORD=your_secure_password

# SOP-Specific Settings
SOP_TEMPLATE_CACHE_TTL=3600
SOP_MAX_FILE_SIZE=52428800
SOP_AUDIT_LOG_ENABLED=true
SOP_ENABLE_TEMPLATE_SHARING=true

# Security
SOP_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
SOP_ENABLE_RATE_LIMITING=true
```

### Feature Flags

Enable/disable specific features:

- `SOP_ENABLE_TEMPLATE_SHARING`: Allow template sharing between users
- `SOP_ENABLE_ADVANCED_SEARCH`: Enable advanced search capabilities
- `SOP_ENABLE_BULK_OPERATIONS`: Allow bulk operations on SOPs
- `SOP_ENABLE_APPROVAL_WORKFLOWS`: Enable approval workflows
- `SOP_ENABLE_RECURRING_SOPS`: Allow recurring SOP schedules

## 📊 Monitoring

The system includes comprehensive monitoring capabilities:

### Health Checks
- **API Health**: `GET /health`
- **Database Health**: Connection and query performance
- **Cache Health**: Redis connectivity and performance

### Metrics
- SOP execution rates and success rates
- Template usage statistics
- User activity metrics
- System performance metrics

### Logging
- Audit logs for all SOP activities
- Error logs with stack traces
- Performance logs for optimization
- Security logs for access control

## 🔒 Security

### Authentication and Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for integrations
- Session management with secure cookies

### Data Protection
- Encryption at rest and in transit
- Secure key management
- Input validation and sanitization
- SQL injection protection
- XSS protection

### Compliance
- Comprehensive audit trails
- Data retention policies
- GDPR compliance features
- SOX compliance support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development environment**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

### Code Style

- TypeScript for all code
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: https://docs.activepieces.com/sop-tool
- **Community**: https://community.activepieces.com
- **Issues**: https://github.com/activepieces/activepieces/issues
- **Email**: support@activepieces.com

## 🙏 Acknowledgments

- Built on [ActivePieces](https://activepieces.com)
- Powered by [Node.js](https://nodejs.org) and [React](https://reactjs.org)
- Database by [PostgreSQL](https://postgresql.org)
- Caching by [Redis](https://redis.io)

---

**Note**: This is an enterprise-grade SOP management system. For production deployment, ensure proper security configurations and regular backups.