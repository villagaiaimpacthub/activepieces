/**
 * Common SOP Authentication - Reusable auth configurations for SOP pieces
 */

import { PieceAuth } from '@activepieces/pieces-framework';

/**
 * No authentication required
 */
export const sopNoAuth = PieceAuth.None();

/**
 * Basic API key authentication
 */
export const sopApiKeyAuth = PieceAuth.SecretText({
    displayName: 'API Key',
    description: 'API key for authentication',
    required: true
});

/**
 * Basic username/password authentication
 */
export const sopBasicAuth = PieceAuth.BasicAuth({
    displayName: 'Basic Authentication',
    description: 'Username and password for authentication',
    required: true
});

/**
 * Bearer token authentication
 */
export const sopBearerTokenAuth = PieceAuth.SecretText({
    displayName: 'Bearer Token',
    description: 'Bearer token for authentication',
    required: true
});

/**
 * OAuth2 authentication for general use
 */
export const sopOAuth2Auth = (config: {
    authUrl: string;
    tokenUrl: string;
    scope?: string[];
    clientId?: string;
}) => PieceAuth.OAuth2({
    displayName: 'OAuth2 Authentication',
    description: 'OAuth2 authentication for secure access',
    authUrl: config.authUrl,
    tokenUrl: config.tokenUrl,
    required: true,
    scope: config.scope || []
});

/**
 * Custom authentication for complex scenarios
 */
export const sopCustomAuth = (props: Record<string, any>) => PieceAuth.CustomAuth({
    displayName: 'Custom Authentication',
    description: 'Custom authentication configuration',
    required: true,
    props
});

/**
 * SOP System authentication (for internal SOP operations)
 */
export const sopSystemAuth = PieceAuth.CustomAuth({
    displayName: 'SOP System Authentication',
    description: 'Authentication for SOP framework internal operations',
    required: true,
    props: {
        sopApiKey: PieceAuth.SecretText({
            displayName: 'SOP API Key',
            description: 'API key for SOP framework access',
            required: true
        }),
        sopInstanceUrl: PieceAuth.ShortText({
            displayName: 'SOP Instance URL',
            description: 'URL of your SOP framework instance',
            required: true,
            defaultValue: 'https://your-sop-instance.com'
        }),
        userId: PieceAuth.ShortText({
            displayName: 'User ID',
            description: 'User ID for audit and tracking purposes',
            required: true
        })
    }
});

/**
 * LDAP/Active Directory authentication
 */
export const sopLdapAuth = PieceAuth.CustomAuth({
    displayName: 'LDAP Authentication',
    description: 'LDAP/Active Directory authentication',
    required: true,
    props: {
        ldapUrl: PieceAuth.ShortText({
            displayName: 'LDAP Server URL',
            description: 'LDAP server URL (e.g., ldap://your-domain.com)',
            required: true
        }),
        baseDn: PieceAuth.ShortText({
            displayName: 'Base DN',
            description: 'Base distinguished name for searches',
            required: true,
            placeholder: 'dc=company,dc=com'
        }),
        username: PieceAuth.ShortText({
            displayName: 'Username',
            description: 'LDAP username',
            required: true
        }),
        password: PieceAuth.SecretText({
            displayName: 'Password',
            description: 'LDAP password',
            required: true
        })
    }
});

/**
 * SAML SSO authentication
 */
export const sopSamlAuth = PieceAuth.CustomAuth({
    displayName: 'SAML SSO Authentication',
    description: 'SAML Single Sign-On authentication',
    required: true,
    props: {
        ssoUrl: PieceAuth.ShortText({
            displayName: 'SSO URL',
            description: 'SAML SSO endpoint URL',
            required: true
        }),
        entityId: PieceAuth.ShortText({
            displayName: 'Entity ID',
            description: 'SAML entity identifier',
            required: true
        }),
        certificate: PieceAuth.LongText({
            displayName: 'Certificate',
            description: 'SAML certificate (PEM format)',
            required: true
        })
    }
});

/**
 * Database authentication (for SOP data sources)
 */
export const sopDatabaseAuth = PieceAuth.CustomAuth({
    displayName: 'Database Authentication',
    description: 'Database connection authentication',
    required: true,
    props: {
        host: PieceAuth.ShortText({
            displayName: 'Host',
            description: 'Database server hostname or IP',
            required: true
        }),
        port: PieceAuth.Number({
            displayName: 'Port',
            description: 'Database server port',
            required: false,
            defaultValue: 5432
        }),
        database: PieceAuth.ShortText({
            displayName: 'Database Name',
            description: 'Name of the database',
            required: true
        }),
        username: PieceAuth.ShortText({
            displayName: 'Username',
            description: 'Database username',
            required: true
        }),
        password: PieceAuth.SecretText({
            displayName: 'Password',
            description: 'Database password',
            required: true
        }),
        ssl: PieceAuth.Checkbox({
            displayName: 'Use SSL',
            description: 'Enable SSL connection',
            required: false,
            defaultValue: true
        })
    }
});

/**
 * JWT Token authentication
 */
export const sopJwtAuth = PieceAuth.CustomAuth({
    displayName: 'JWT Token Authentication',
    description: 'JSON Web Token authentication',
    required: true,
    props: {
        token: PieceAuth.SecretText({
            displayName: 'JWT Token',
            description: 'JSON Web Token for authentication',
            required: true
        }),
        algorithm: PieceAuth.StaticDropdown({
            displayName: 'Algorithm',
            description: 'JWT signing algorithm',
            required: false,
            defaultValue: 'HS256',
            options: {
                options: [
                    { label: 'HS256', value: 'HS256' },
                    { label: 'HS384', value: 'HS384' },
                    { label: 'HS512', value: 'HS512' },
                    { label: 'RS256', value: 'RS256' },
                    { label: 'RS384', value: 'RS384' },
                    { label: 'RS512', value: 'RS512' }
                ]
            }
        }),
        secret: PieceAuth.SecretText({
            displayName: 'Secret Key',
            description: 'Secret key for JWT verification (for HMAC algorithms)',
            required: false
        }),
        publicKey: PieceAuth.LongText({
            displayName: 'Public Key',
            description: 'Public key for JWT verification (for RSA algorithms)',
            required: false
        })
    }
});

/**
 * Multi-factor authentication
 */
export const sopMfaAuth = PieceAuth.CustomAuth({
    displayName: 'Multi-Factor Authentication',
    description: 'Multi-factor authentication for enhanced security',
    required: true,
    props: {
        username: PieceAuth.ShortText({
            displayName: 'Username',
            description: 'Username for authentication',
            required: true
        }),
        password: PieceAuth.SecretText({
            displayName: 'Password',
            description: 'Password for authentication',
            required: true
        }),
        totpSecret: PieceAuth.SecretText({
            displayName: 'TOTP Secret',
            description: 'Time-based One-Time Password secret',
            required: false
        }),
        backupCodes: PieceAuth.Array({
            displayName: 'Backup Codes',
            description: 'Backup codes for MFA recovery',
            required: false
        })
    }
});

/**
 * Webhook signature authentication
 */
export const sopWebhookAuth = PieceAuth.CustomAuth({
    displayName: 'Webhook Signature Authentication',
    description: 'Webhook signature verification',
    required: true,
    props: {
        signingSecret: PieceAuth.SecretText({
            displayName: 'Signing Secret',
            description: 'Secret used to sign webhook payloads',
            required: true
        }),
        algorithm: PieceAuth.StaticDropdown({
            displayName: 'Signature Algorithm',
            description: 'Algorithm used for signature generation',
            required: false,
            defaultValue: 'sha256',
            options: {
                options: [
                    { label: 'SHA-256', value: 'sha256' },
                    { label: 'SHA-1', value: 'sha1' },
                    { label: 'MD5', value: 'md5' }
                ]
            }
        }),
        headerName: PieceAuth.ShortText({
            displayName: 'Signature Header Name',
            description: 'Name of the header containing the signature',
            required: false,
            defaultValue: 'X-Signature'
        })
    }
});

/**
 * Service account authentication (for cloud services)
 */
export const sopServiceAccountAuth = PieceAuth.CustomAuth({
    displayName: 'Service Account Authentication',
    description: 'Service account authentication for cloud services',
    required: true,
    props: {
        serviceAccountKey: PieceAuth.LongText({
            displayName: 'Service Account Key',
            description: 'Service account key (JSON format)',
            required: true
        }),
        projectId: PieceAuth.ShortText({
            displayName: 'Project ID',
            description: 'Cloud project identifier',
            required: false
        }),
        scopes: PieceAuth.Array({
            displayName: 'Scopes',
            description: 'OAuth scopes for the service account',
            required: false
        })
    }
});

/**
 * Common authentication configurations mapped by use case
 */
export const sopAuthConfigs = {
    // Basic auth types
    none: sopNoAuth,
    apiKey: sopApiKeyAuth,
    basic: sopBasicAuth,
    bearerToken: sopBearerTokenAuth,
    
    // SOP-specific auth
    sopSystem: sopSystemAuth,
    
    // Enterprise auth
    ldap: sopLdapAuth,
    saml: sopSamlAuth,
    mfa: sopMfaAuth,
    
    // Token-based auth
    jwt: sopJwtAuth,
    
    // Infrastructure auth
    database: sopDatabaseAuth,
    serviceAccount: sopServiceAccountAuth,
    
    // Integration auth
    webhook: sopWebhookAuth,
    
    // OAuth2 factories
    oauth2: sopOAuth2Auth
};

/**
 * Helper function to create OAuth2 auth for specific providers
 */
export const createSopOAuth2 = {
    google: () => sopOAuth2Auth({
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: ['openid', 'email', 'profile']
    }),
    
    microsoft: () => sopOAuth2Auth({
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: ['openid', 'email', 'profile']
    }),
    
    github: () => sopOAuth2Auth({
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: ['user:email']
    }),
    
    slack: () => sopOAuth2Auth({
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scope: ['chat:write', 'users:read']
    })
};