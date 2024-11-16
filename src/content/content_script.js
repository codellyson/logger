(function() {
    const logs = [];
    const originalConsoleMethods = {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console),
        info: console.info.bind(console)
    };

    // Intercept console methods immediately
    ['log', 'error', 'warn', 'info'].forEach(method => {
        console[method] = (...args) => {
            originalConsoleMethods[method](...args);

            const formatArg = (arg) => {
                try {
                    if (arg instanceof Error) {
                        return arg.stack || arg.message;
                    }
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch {
                    return String(arg);
                }
            };

            const logEntry = {
                type: method,
                message: args.map(formatArg).join(' '),
                timestamp: Date.now()
            };

            logs.push(logEntry);
            
            // Send log to background script
            chrome.runtime.sendMessage({ type: 'NEW_LOG', log: logEntry });
            
            // If the UI is already injected, display the log
            const windowContent = document.getElementById('windowContent');
            if (windowContent) {
                displayLog(logEntry, windowContent);
            }
        };
    });

    function displayLog(log, container) {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${log.type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(log.timestamp).toLocaleTimeString();
        
        const type = document.createElement('span');
        type.className = 'type';
        type.textContent = log.type;
        
        const message = document.createElement('span');
        message.className = 'message';
        message.textContent = log.message;

        logElement.appendChild(timestamp);
        logElement.appendChild(type);
        logElement.appendChild(message);
        
        container.appendChild(logElement);
        container.scrollTop = container.scrollHeight;
    }

    function InjectExtensionUI() {
        if (document.getElementById('floatingWindow')) {
            const window = document.getElementById('floatingWindow');
            window.style.display = window.style.display === 'none' ? 'flex' : 'none';
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            #floatingWindow {
                position: fixed;
                top: 0;
                left: 0;
                width: 20vw;
                height: 100vh;
                background: rgb(0, 0, 0);
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                font-family: monospace;
            }

            .window-header {
                padding: 8px;
                background: #010101;
                border-bottom: 1px solid #333;
                cursor: move;
                user-select: none;
                color: white;
            }

            .window-content {
                padding: 12px;
                height: auto;
                overflow-y: auto;
                color: white;
            }

            .log-entry {
                margin: 4px 0;
                padding: 4px;
                border-radius: 4px;
                background: #2d2d2d;
            }

            .log-entry .timestamp {
                color: #888;
                margin-right: 8px;
            }

            .log-entry .type {
                margin-right: 8px;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 0.9em;
            }

            .log-log .type {
                background: #2a4365;
                color: #63b3ed;
            }

            .log-error .type {
                background: #742a2a;
                color: #fc8181;
            }

            .log-warn .type {
                background: #744210;
                color: #fbd38d;
            }

            .log-info .type {
                background: #234e52;
                color: #4fd1c5;
            }

            .log-entry .message {
                word-break: break-all;
            }
        `;
        document.head.appendChild(style);

        const ui = document.createElement('div');
        ui.id = 'floatingWindow';
        ui.innerHTML = `
            <div class="window-header" id="windowHeader">Console Logger</div>
            <div class="window-content" id="windowContent">
                <!-- Logs will be inserted here -->
            </div>
        `;
        
        document.body.appendChild(ui);

        // Setup dragging functionality
        const floatingWindow = document.getElementById('floatingWindow');
        const windowHeader = document.getElementById('windowHeader');
        const windowContent = document.getElementById('windowContent');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Display all stored logs
  
        logs.forEach(log => displayLog(log, windowContent));

        // Dragging functionality
        windowHeader.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === windowHeader) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, floatingWindow);
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }

    // Listen for toggle message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "toggle") {
            // If logs are provided, update our local logs array
            if (message.logs) {
                message.logs.forEach(log => {
                    if (!logs.some(existingLog => 
                        existingLog.timestamp === log.timestamp && 
                        existingLog.message === log.message
                    )) {
                        logs.push(log);
                    }
                });
            }
            InjectExtensionUI();
        }
    });
})();