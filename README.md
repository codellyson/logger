# Console Overlay Extension

A browser extension that provides a draggable console overlay window to monitor console logs, errors, warnings, and info messages in real-time.

## Features

- Floating, draggable console window that stays on top of web pages
- Captures all console output (`log`, `error`, `warn`, `info`)
- Preserves original console functionality while adding overlay display
- Timestamps for each log entry
- Color-coded log types for easy identification
- Scrollable log history
- Real-time log updates

## How It Works

The extension works by:

1. Storing original console methods before any modifications
2. Creating a queue system to capture logs before UI initialization
3. Intercepting console calls to both:
   - Execute original console functionality
   - Display logs in the overlay window
4. Providing a draggable UI interface for viewing logs

## Implementation Details

The extension uses:
- DOM manipulation for the overlay UI
- Event listeners for drag functionality
- JSON stringification for object logging
- Timestamp tracking for each log entry
- CSS styling for visual differentiation of log types

## Usage

Once installed, the console overlay will automatically appear on web pages. You can:
- Drag the overlay window by its header to reposition it
- View logs in real-time as they occur
- Scroll through log history
- Distinguish between different types of logs through color coding

## Technical Notes

- All original console functionality is preserved
- Logs are formatted for readability
- Objects are stringified for display
- Error handling is in place for non-stringifiable objects
