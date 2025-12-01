/**
 * Mom's Milk Chat WebSocket Tester (Node.js)
 * 
 * Usage:
 *   node test-websocket.js <jwt-token> [server-url]
 * 
 * Example:
 *   node test-websocket.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   node test-websocket.js your-token http://localhost:3000
 */

const io = require('socket.io-client');
const readline = require('readline');

// Configuration
const args = process.argv.slice(2);
const JWT_TOKEN = args[0];
const SERVER_URL = args[1] || 'http://localhost:3000';

if (!JWT_TOKEN) {
    console.error('❌ Error: JWT token is required');
    console.log('\nUsage:');
    console.log('  node test-websocket.js <jwt-token> [server-url]');
    console.log('\nExample:');
    console.log('  node test-websocket.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
}

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Socket instance
let socket = null;
let isConnected = false;

// Color codes for console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function separator() {
    console.log(colors.cyan + '─'.repeat(80) + colors.reset);
}

// Connect to WebSocket
function connect() {
    info(`Connecting to ${SERVER_URL}/chat...`);
    
    socket = io(`${SERVER_URL}/chat`, {
        auth: { token: JWT_TOKEN }
    });

    // Connection events
    socket.on('connect', () => {
        isConnected = true;
        success('Connected successfully!');
        success(`Socket ID: ${socket.id}`);
        separator();
        showMenu();
    });

    socket.on('disconnect', (reason) => {
        isConnected = false;
        error(`Disconnected: ${reason}`);
    });

    socket.on('connect_error', (err) => {
        error(`Connection error: ${err.message}`);
        process.exit(1);
    });

    // Message events
    socket.on('messageSent', (data) => {
        separator();
        success('📤 Message Sent:');
        console.log(JSON.stringify(data, null, 2));
        separator();
        prompt();
    });

    socket.on('newMessage', (data) => {
        separator();
        info('📨 New Message Received:');
        console.log(JSON.stringify(data, null, 2));
        separator();
        prompt();
    });

    // Typing events
    socket.on('userTyping', (data) => {
        const status = data.isTyping ? 'typing...' : 'stopped typing';
        info(`⌨️  User ${data.userId} is ${status}`);
    });

    // Read/Delivered events
    socket.on('messagesRead', (data) => {
        success(`✓✓ Messages Read by user ${data.readBy}:`);
        console.log(`   Message IDs: ${data.messageIds.join(', ')}`);
    });

    socket.on('messagesDelivered', (data) => {
        success(`✓ Messages Delivered:`);
        console.log(`   Message IDs: ${data.messageIds.join(', ')}`);
    });

    // Error event
    socket.on('error', (err) => {
        error(`Error: ${err}`);
    });
}

// Show menu
function showMenu() {
    console.log('\n' + colors.bright + '📋 Available Commands:' + colors.reset);
    console.log('  1. Send Message');
    console.log('  2. Join Session');
    console.log('  3. Leave Session');
    console.log('  4. Start Typing');
    console.log('  5. Stop Typing');
    console.log('  6. Mark as Read');
    console.log('  7. Mark as Delivered');
    console.log('  8. Show Menu');
    console.log('  9. Disconnect');
    console.log('  0. Exit\n');
}

// Prompt user
function prompt() {
    rl.question(colors.bright + '> ' + colors.reset, handleInput);
}

// Handle user input
function handleInput(input) {
    const choice = input.trim();

    if (!isConnected && choice !== '0') {
        error('Not connected!');
        return prompt();
    }

    switch (choice) {
        case '1':
            sendMessage();
            break;
        case '2':
            joinSession();
            break;
        case '3':
            leaveSession();
            break;
        case '4':
            startTyping();
            break;
        case '5':
            stopTyping();
            break;
        case '6':
            markAsRead();
            break;
        case '7':
            markAsDelivered();
            break;
        case '8':
            showMenu();
            prompt();
            break;
        case '9':
            disconnect();
            break;
        case '0':
            exit();
            break;
        default:
            warning('Invalid choice. Type 8 to show menu.');
            prompt();
    }
}

// Command implementations
function sendMessage() {
    rl.question('Recipient ID: ', (recipientId) => {
        rl.question('Message: ', (content) => {
            if (!content) {
                warning('Message cannot be empty');
                return prompt();
            }

            const payload = {
                recipientId: parseInt(recipientId),
                content
            };

            info(`Sending message: "${content}" to user ${recipientId}`);
            socket.emit('sendMessage', payload);
            // Response will be handled by event listener
        });
    });
}

function joinSession() {
    rl.question('Session ID: ', (sessionId) => {
        const payload = { sessionId: parseInt(sessionId) };
        info(`Joining session ${sessionId}...`);
        socket.emit('joinSession', payload);
        setTimeout(prompt, 100);
    });
}

function leaveSession() {
    rl.question('Session ID: ', (sessionId) => {
        const payload = { sessionId: parseInt(sessionId) };
        info(`Leaving session ${sessionId}...`);
        socket.emit('leaveSession', payload);
        setTimeout(prompt, 100);
    });
}

function startTyping() {
    rl.question('Recipient ID: ', (recipientId) => {
        const payload = {
            recipientId: parseInt(recipientId),
            isTyping: true
        };
        info(`Started typing to user ${recipientId}`);
        socket.emit('typing', payload);
        setTimeout(prompt, 100);
    });
}

function stopTyping() {
    rl.question('Recipient ID: ', (recipientId) => {
        const payload = {
            recipientId: parseInt(recipientId),
            isTyping: false
        };
        info(`Stopped typing to user ${recipientId}`);
        socket.emit('typing', payload);
        setTimeout(prompt, 100);
    });
}

function markAsRead() {
    rl.question('Message IDs (comma-separated): ', (ids) => {
        const messageIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        
        if (messageIds.length === 0) {
            warning('No valid message IDs provided');
            return prompt();
        }

        const payload = { messageIds };
        info(`Marking messages as read: ${messageIds.join(', ')}`);
        socket.emit('markAsRead', payload);
        setTimeout(prompt, 100);
    });
}

function markAsDelivered() {
    rl.question('Message IDs (comma-separated): ', (ids) => {
        const messageIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        
        if (messageIds.length === 0) {
            warning('No valid message IDs provided');
            return prompt();
        }

        const payload = { messageIds };
        info(`Marking messages as delivered: ${messageIds.join(', ')}`);
        socket.emit('markAsDelivered', payload);
        setTimeout(prompt, 100);
    });
}

function disconnect() {
    if (socket) {
        info('Disconnecting...');
        socket.disconnect();
        socket = null;
        isConnected = false;
    }
    prompt();
}

function exit() {
    info('Goodbye!');
    if (socket) {
        socket.disconnect();
    }
    rl.close();
    process.exit(0);
}

// Start the application
console.log(colors.bright + '\n🔌 Mom\'s Milk Chat WebSocket Tester\n' + colors.reset);
console.log(`Server: ${colors.cyan}${SERVER_URL}/chat${colors.reset}`);
console.log(`Token: ${colors.yellow}${JWT_TOKEN.substring(0, 20)}...${colors.reset}\n`);
separator();

connect();
