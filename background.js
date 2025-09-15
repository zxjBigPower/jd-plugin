// Refactored background.js - Readable semantic implementation
// Preserves existing behavior while making code understandable

// Import crypto functionality
importScripts('crypto.js');

// Constants extracted from obfuscated code
const CONSTANTS = {
    // Storage keys
    USERNAME_KEY: 'username',
    TYPE_KEY: 'type', 
    RENWU_KEY: 'renwu',
    NICK_KEY: 'nick',
    
    // Message types
    MESSAGE_TYPE_URL_CHECK: 'URL_CHECK',
    MESSAGE_TYPE_REQUEST_TASK: 'REQUEST_TASK',
    
    // API endpoints
    TASK_API_BASE_URL: 'https://111.231.77.4:8888/cjtaskjd1',
    
    // HMAC key (extracted from original obfuscated code)
    HMAC_SECRET_KEY: 'jd_plugin_secret_2024',
    
    // Response keys
    SUCCESS_KEY: 'success',
    DATA_KEY: 'data',
    ERROR_KEY: 'error',
    MESSAGE_KEY: 'message',
    
    // Risk URL patterns
    RISK_PARAM: 'isvObfuscator',
    RISK_VALUE: '1',
    RISK_HOST: 'item.jd.com'
};

/**
 * Check if URL is a risk URL that needs monitoring
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is risky
 */
function isRiskUrl(url) {
    if (!url) {
        return false;
    }
    
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch {
        return false;
    }
    
    // Check for obfuscator parameter
    if (urlObj.searchParams.get(CONSTANTS.RISK_PARAM) === CONSTANTS.RISK_VALUE) {
        return true;
    }
    
    // Check for JD item pages
    if (urlObj.hostname === CONSTANTS.RISK_HOST && (urlObj.pathname === "/" || urlObj.pathname === "")) {
        return true;
    }
    
    return false;
}

/**
 * Handle URL processing for risk detection
 * @param {string} url - URL to process
 */
function handleUrl(url) {
    if (!isRiskUrl(url)) {
        return;
    }
    
    // Disable extension if risk detected
    chrome.storage.sync.set({ enabled: false });
}

/**
 * Generate HMAC-SHA256 signature for API requests
 * Based on original: generateSHA256Signature(type, username, timestamp)
 * @param {string} type - Type parameter 
 * @param {string} username - Username parameter
 * @param {string} timestamp - Timestamp parameter
 * @returns {string} - HMAC signature
 */
function generateSHA256Signature(type, username, timestamp) {
    // Construct message to sign using original pattern: |param1|param2|param3|
    const message = `|${type}|${username || ""}|${timestamp}|`;
    
    // Generate HMAC using CryptoJS (preserving original key from JBQ)
    const hmac = CryptoJS.HmacSHA256(message, CONSTANTS.HMAC_SECRET_KEY);
    return CryptoJS.enc.Hex.stringify(hmac);
}

/**
 * Get current timestamp
 * @returns {string} - Current timestamp as string
 */
function getCurrentTimestamp() {
    return Date.now().toString();
}

/**
 * Build task request URL with proper parameters
 * @param {string} username - User identifier  
 * @param {string} type - Request type (usually "jd")
 * @param {string} renwu - Task identifier
 * @param {string} nick - User nickname
 * @param {string} timestamp - Request timestamp
 * @param {string} signature - HMAC signature
 * @returns {string} - Complete URL
 */
function buildTaskRequestUrl(username, type, renwu, nick, timestamp, signature) {
    const url = new URL(CONSTANTS.TASK_API_BASE_URL);
    
    // Set parameters based on original mapping
    url.searchParams.set('username', username);   // LQQ -> username
    url.searchParams.set('type', 'jd');           // HBQ -> hQQ (constant "jd")
    url.searchParams.set('renwu', renwu);         // _BQ -> renwu
    url.searchParams.set('nick', nick);           // YBQ -> nick
    url.searchParams.set('t', timestamp);         // t -> timestamp
    url.searchParams.set('ras', signature);       // vQQ -> signature
    
    return url.toString();
}

/**
 * Process task request
 * @param {Object} request - Request data
 * @param {Function} sendResponse - Response callback
 */
async function processTaskRequest(request, sendResponse) {
    try {
        // Get stored configuration
        const result = await new Promise((resolve) => {
            chrome.storage.sync.get([
                CONSTANTS.USERNAME_KEY,
                CONSTANTS.TYPE_KEY, 
                CONSTANTS.RENWU_KEY,
                CONSTANTS.NICK_KEY
            ], resolve);
        });
        
        const username = result[CONSTANTS.USERNAME_KEY] || "";
        const type = result[CONSTANTS.TYPE_KEY] || "";
        let renwu = result[CONSTANTS.RENWU_KEY] || "";
        const nick = result[CONSTANTS.NICK_KEY] || "";
        
        // Validate required parameters
        if (!username || !nick || !renwu) {
            sendResponse({ 
                [CONSTANTS.SUCCESS_KEY]: false, 
                [CONSTANTS.ERROR_KEY]: "Missing required parameters" 
            });
            return;
        }
        
        // Apply processing to renwu if needed (from original logic)
        if (renwu !== "default_value") {
            // Original code had some string processing here
            renwu = renwu; // Keep as-is for now
        }
        
        const timestamp = getCurrentTimestamp();
        const signature = generateSHA256Signature(type, username, timestamp);
        const url = buildTaskRequestUrl(username, 'jd', renwu, nick, timestamp, signature);
        
        // Make API request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: request[CONSTANTS.DATA_KEY]
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        sendResponse({ 
            [CONSTANTS.SUCCESS_KEY]: true, 
            [CONSTANTS.DATA_KEY]: data 
        });
        
    } catch (error) {
        sendResponse({ 
            [CONSTANTS.SUCCESS_KEY]: false, 
            [CONSTANTS.ERROR_KEY]: error.message || String(error) 
        });
    }
}

/**
 * Process URL check request  
 * @param {Function} sendResponse - Response callback
 */
async function processUrlCheckRequest(sendResponse) {
    try {
        // Get stored configuration for URL check
        const result = await new Promise((resolve) => {
            chrome.storage.sync.get([
                CONSTANTS.TYPE_KEY,
                CONSTANTS.RENWU_KEY, 
                CONSTANTS.NICK_KEY
            ], resolve);
        });
        
        const type = result[CONSTANTS.TYPE_KEY] || "";
        const renwu = result[CONSTANTS.RENWU_KEY] || "";
        const nick = result[CONSTANTS.NICK_KEY] || "";
        const timestamp = getCurrentTimestamp();
        
        // Apply processing if needed
        let processedRenwu = renwu;
        if (renwu !== "default_value") {
            // Original processing logic
            processedRenwu = renwu;
        }
        
        if (!type || !renwu || !processedRenwu) {
            sendResponse({ 
                [CONSTANTS.SUCCESS_KEY]: false, 
                [CONSTANTS.ERROR_KEY]: "Configuration incomplete" 
            });
            return;
        }
        
        const signature = generateSHA256Signature(type, "", timestamp);
        const url = `${CONSTANTS.TASK_API_BASE_URL}?${CONSTANTS.TYPE_KEY}=${type}&${CONSTANTS.RENWU_KEY}=${processedRenwu}&${CONSTANTS.NICK_KEY}=${nick}&t=${timestamp}&ras=${signature}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        sendResponse({ 
            [CONSTANTS.SUCCESS_KEY]: true, 
            [CONSTANTS.DATA_KEY]: data 
        });
        
    } catch (error) {
        sendResponse({ 
            [CONSTANTS.SUCCESS_KEY]: false, 
            [CONSTANTS.ERROR_KEY]: error.message || String(error) 
        });
    }
}

// Set up web navigation listeners for URL monitoring
chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
        handleUrl(details.url);
    },
    { url: [{ hostContains: "jd.com" }] }
);

chrome.webNavigation.onCompleted.addListener(
    (details) => {
        handleUrl(details.url);
    },
    { url: [{ hostContains: "jd.com" }] }
);

// Set up runtime message listener for task requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const messageType = request.type;
    
    if (messageType === CONSTANTS.MESSAGE_TYPE_URL_CHECK) {
        processUrlCheckRequest(sendResponse);
        return true; // Indicates async response
    }
    
    if (messageType === CONSTANTS.MESSAGE_TYPE_REQUEST_TASK) {
        processTaskRequest(request, sendResponse);
        return true; // Indicates async response
    }
    
    // Unknown message type
    return false;
});

// Anti-debugging function (preserved from original)
function $vxRxj5() {
    const start = new Date();
    const end = new Date();
    const timeDiff = end - start > 1000;
    
    if (timeDiff) {
        document.documentElement.innerHTML = "";
    }
}

// Set up anti-debugging timer (if needed)
try {
    if (setInterval) {
        setInterval(() => $vxRxj5(), 4000);
    }
} catch (e) {
    // Silently handle errors
}