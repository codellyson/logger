// Store logs per tab
const tabLogs = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NEW_LOG' && sender.tab) {
        const tabId = sender.tab.id;
        if (!tabLogs.has(tabId)) {
            tabLogs.set(tabId, []);
        }
        tabLogs.get(tabId).push(message.log);
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Send all stored logs for this tab along with the toggle message
        const logs = tabLogs.get(tab.id) || [];
        await chrome.tabs.sendMessage(tab.id, { 
            action: "toggle",
            logs: logs 
        });
        console.log(logs)
    } catch (error) {
        // If the content script isn't ready yet, inject it
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['src/content/content_script.js']
        });
        // Try sending the message again
        await chrome.tabs.sendMessage(tab.id, { 
            action: "toggle",
            logs: tabLogs.get(tab.id) || [] 
        });
    }
});

// Clean up logs when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    tabLogs.delete(tabId);
});