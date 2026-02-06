import crypto from 'crypto';

interface RobokassaConfig {
    merchantLogin: string;
    password1: string;
    password2: string;
    testMode: boolean;
    baseUrl: string;
}

interface PaymentParams {
    outSum: number;
    invId: number;
    description: string;
    email?: string;
    currency?: string;
    customParams?: Record<string, string>;
}

export function getConfig(): RobokassaConfig {
    return {
        merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || '',
        password1: process.env.ROBOKASSA_PASSWORD1 || '',
        password2: process.env.ROBOKASSA_PASSWORD2 || '',
        testMode: process.env.ROBOKASSA_TEST_MODE === '1',
        baseUrl: process.env.ROBOKASSA_BASE_URL || 'https://auth.robokassa.ru/Merchant/Index.aspx'
    };
}

/**
 * Generate MD5 hash for Robokassa signature
 */
function md5(str: string): string {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * Sort custom params (Shp_*) alphabetically and build string
 * Robokassa requires Shp params in alphabetical order in signature
 */
function buildShpString(customParams: Record<string, string>): string {
    const sortedKeys = Object.keys(customParams).sort();
    return sortedKeys.map(key => `${key}=${customParams[key]}`).join(':');
}

/**
 * Generate payment URL for Robokassa
 * Signature format: MerchantLogin:OutSum:InvId:Password#1:Shp_param1=value1:Shp_param2=value2 (sorted)
 */
export function generatePaymentUrl(params: PaymentParams): string {
    const config = getConfig();

    const { outSum, invId, description, email, customParams = {} } = params;

    // Build signature base string
    let signatureBase = `${config.merchantLogin}:${outSum.toFixed(2)}:${invId}:${config.password1}`;

    // Add Shp params to signature (sorted alphabetically)
    if (Object.keys(customParams).length > 0) {
        signatureBase += ':' + buildShpString(customParams);
    }

    const signature = md5(signatureBase);

    // Build URL
    const url = new URL(config.baseUrl);
    url.searchParams.set('MerchantLogin', config.merchantLogin);
    url.searchParams.set('OutSum', outSum.toFixed(2));
    url.searchParams.set('InvId', invId.toString());
    url.searchParams.set('Description', description);
    url.searchParams.set('SignatureValue', signature);

    if (email) {
        url.searchParams.set('Email', email);
    }

    // Add Shp params to URL
    for (const [key, value] of Object.entries(customParams)) {
        url.searchParams.set(key, value);
    }

    // Test mode
    if (config.testMode) {
        url.searchParams.set('IsTest', '1');
    }

    return url.toString();
}

/**
 * Verify callback signature from Robokassa (ResultURL)
 * Signature format: OutSum:InvId:Password#2:Shp_param1=value1:Shp_param2=value2 (sorted)
 */
export function verifyResultSignature(
    outSum: string,
    invId: string,
    signatureValue: string,
    customParams: Record<string, string> = {}
): boolean {
    const config = getConfig();

    // Build expected signature
    let signatureBase = `${outSum}:${invId}:${config.password2}`;

    if (Object.keys(customParams).length > 0) {
        signatureBase += ':' + buildShpString(customParams);
    }

    const expectedSignature = md5(signatureBase);

    return signatureValue.toLowerCase() === expectedSignature.toLowerCase();
}

/**
 * Verify success page signature
 * SuccessURL uses Password#1 by default (but check Robokassa settings)
 */
export function verifySuccessSignature(
    outSum: string,
    invId: string,
    signatureValue: string,
    customParams: Record<string, string> = {}
): boolean {
    const config = getConfig();

    // SuccessURL typically uses Password#1
    let signatureBase = `${outSum}:${invId}:${config.password1}`;

    if (Object.keys(customParams).length > 0) {
        signatureBase += ':' + buildShpString(customParams);
    }

    const expectedSignature = md5(signatureBase);

    return signatureValue.toLowerCase() === expectedSignature.toLowerCase();
}

export default {
    getConfig,
    generatePaymentUrl,
    verifyResultSignature,
    verifySuccessSignature
};
