// script.js for Dynamic Quote Generator with Local Storage, JSON, Filtering, and Server Sync Simulation

// Define initial array of quote objects.
let quotes = []; // Local quotes array
let selectedCategory = 'all'; // Default filter to show all categories
let simulatedServerQuotes = []; // Array to simulate quotes on the server
const SYNC_INTERVAL = 15000; // Sync every 15 seconds
// Using posts for GET, and then for POST, JSONPlaceholder will just return the posted data
const JSONPLACEHOLDER_API_URL = 'https://jsonplaceholder.typicode.com/posts';

// --- DOM Element References ---
const quoteDisplay = document.getElementById('quoteDisplay'); // Single random quote display
const newQuoteButton = document.getElementById('newQuote'); // Button to show new quote
const newQuoteText = document.getElementById('newQuoteText'); // Input for new quote text
const newQuoteCategory = document.getElementById('newQuoteCategory'); // Input for new quote category
const exportQuotesBtn = document.getElementById('exportQuotesBtn'); // Button for exporting quotes
const importFile = document.getElementById('importFile'); // Input for importing file
const categoryFilter = document.getElementById('categoryFilter'); // Select element for filtering
const quotesListDisplay = document.getElementById('quotesListDisplay'); // Container for filtered list
const noFilteredQuotesMessage = document.getElementById('noFilteredQuotesMessage'); // Message for no filtered quotes
const syncStatusElement = document.getElementById('syncStatus'); // Element to display sync status
const syncNowBtn = document.getElementById('syncNowBtn'); // Button to trigger manual sync
const notificationArea = document.getElementById('notificationArea'); // Area for notifications

// --- Web Storage Helper Functions ---

/**
 * Generates a unique ID for a new quote using a timestamp and random string.
 * @returns {string} A unique string ID.
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Loads quotes from Local Storage and the last selected filter.
 * Initializes with default quotes if local storage is empty.
 */
function loadFromLocalStorage() {
    try {
        const storedQuotes = localStorage.getItem('quotes');
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
        } else {
            // If no quotes in local storage, initialize with default quotes and save them
            quotes = [
                { id: generateUniqueId(), text: "The only way to do great work is to love what you do.", category: "Inspiration" },
                { id: generateUniqueId(), text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
                { id: generateUniqueId(), text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
                { id: generateUniqueId(), text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
                { id: generateUniqueId(), text: "The mind is everything. What you think you become.", category: "Mindset" }
            ];
            saveToLocalStorage(); // Save these initial quotes
        }
    } catch (e) {
        console.error("Error loading quotes from local storage:", e);
        // Fallback if storage is corrupted
        quotes = [
            { id: generateUniqueId(), text: "Error loading quotes. Local storage data might be corrupted. Initializing with default quotes.", category: "Error" }
        ];
        alert("Corrupted local storage data for quotes. Initializing with default quotes.");
        saveToLocalStorage();
    }

    selectedCategory = localStorage.getItem('selectedCategory') || 'all';
}

/**
 * Saves the current 'quotes' array and 'selectedCategory' to Local Storage.
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('selectedCategory', selectedCategory);
    } catch (e) {
        console.error("Error saving to local storage:", e);
        alert("Failed to save data. Local storage might be full or inaccessible.");
    }
}

// --- Display & Filtering Functions ---

/**
 * Displays a single random quote from the 'quotes' array in the quoteDisplay section.
 */
function showRandomQuote() {
    quoteDisplay.innerHTML = '';

    const availableQuotes = quotes.length > 0 ? quotes : [
        { text: "No quotes available. Add some!", category: "Information" }
    ];

    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const randomQuote = availableQuotes[randomIndex];

    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${randomQuote.text}"`;

    const categoryParagraph = document.createElement('p');
    categoryParagraph.textContent = `- ${randomQuote.category}`;

    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categoryParagraph);
}

/**
 * Populates the category filter dropdown dynamically based on unique categories in the quotes array.
 */
function populateCategories() {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Always add 'All' option

    const uniqueCategories = new Set(quotes.map(quote => quote.category));

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Set the dropdown to the last selected filter
    categoryFilter.value = selectedCategory;
}

/**
 * Filters and displays quotes based on the selected category in the quotesListDisplay section.
 * This function is called when the category filter changes.
 */
function filterQuotes() {
    selectedCategory = categoryFilter.value;
    saveToLocalStorage(); // Persist the selected filter

    let filteredQuotes = [];
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    renderQuotesList(filteredQuotes); // Render the filtered quotes
}

/**
 * Renders a list of quotes to the quotesListDisplay container.
 * Each quote is displayed with its text, author, and a remove button.
 * @param {Array<Object>} quotesToRender The array of quote objects to display.
 */
function renderQuotesList(quotesToRender) {
    quotesListDisplay.innerHTML = '';

    if (quotesToRender.length === 0) {
        noFilteredQuotesMessage.classList.remove('hidden');
    } else {
        noFilteredQuotesMessage.classList.add('hidden');
        quotesToRender.forEach(quote => {
            const quoteItem = document.createElement('div');
            quoteItem.classList.add('quote-item');

            const quoteText = document.createElement('p');
            quoteText.classList.add('quote-text');
            quoteText.textContent = `“${quote.text}”`;

            const quoteAuthor = document.createElement('p');
            quoteAuthor.classList.add('quote-author');
            quoteAuthor.textContent = `- ${quote.author}`;

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-btn');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = `Remove "${quote.text}"`;
            removeBtn.addEventListener('click', () => removeQuote(quote.id));

            quoteItem.appendChild(quoteText);
            quoteItem.appendChild(quoteAuthor);
            quoteItem.appendChild(removeBtn);
            quotesListDisplay.appendChild(quoteItem);
        });
    }
}

// --- Add/Remove Quote Functions ---

/**
 * Adds a new quote to the 'quotes' array based on user input from the form.
 * It retrieves values from input fields, validates them, adds the new quote,
 * clears the input fields, saves to local storage, updates categories, and then refreshes displays.
 */
async function createAddQuoteForm() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        const newQuote = { id: generateUniqueId(), text: text, category: category };
        quotes.push(newQuote);

        saveToLocalStorage(); // Save updated quotes to local storage
        populateCategories(); // Update the filter dropdown in case of a new category
        filterQuotes(); // Re-filter and display the list with the new quote
        showRandomQuote(); // Update the single random quote display

        newQuoteText.value = '';
        newQuoteCategory.value = '';

        displayNotification("Quote added successfully!", "success");
        console.log("Quote added:", newQuote);

        // Simulate pushing the new quote to the server
        await pushQuoteToServer(newQuote);

    } else {
        alert("Please enter both the quote text and category to add a new quote.");
    }
}

/**
 * Removes a quote from the 'quotes' array by its unique ID.
 * Updates local storage, categories, and displays.
 * @param {string} idToRemove The unique ID of the quote to remove.
 */
function removeQuote(idToRemove) {
    const initialQuotesLength = quotes.length;
    quotes = quotes.filter(quote => quote.id !== idToRemove);

    if (quotes.length < initialQuotesLength) {
        saveToLocalStorage(); // Save updated quotes to local storage
        populateCategories(); // Update categories dropdown (a category might become empty)
        filterQuotes(); // Re-filter and display the list
        showRandomQuote(); // Update the single random quote display in case the removed one was showing
        displayNotification("Quote removed.", "info");
        // In a real app, you would also send a DELETE request to the server here
    } else {
        displayNotification("Quote not found.", "warning");
    }
}

// --- JSON Import/Export Functions ---

/**
 * Exports all current quotes to a JSON file and triggers a download.
 */
function exportQuotesToJson() {
    if (quotes.length === 0) {
        alert("No quotes to export!");
        return;
    }
    const dataStr = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing JSON
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_quotes.json'; // Suggested file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    displayNotification('Quotes exported successfully!', "success");
}

/**
 * Imports quotes from a selected JSON file.
 * @param {Event} event The change event from the file input.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            // Basic validation: ensure imported data is an array of objects with required properties
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q === 'object' && q !== null && 'text' in q && 'category' in q)) {
                // Assign unique IDs to imported quotes if they don't have them
                const sanitizedQuotes = importedQuotes.map(q => ({
                    id: q.id || generateUniqueId(),
                    text: q.text,
                    author: q.author || 'Unknown', // Ensure author property exists for consistency
                    category: q.category
                }));
                
                // Add imported quotes to the existing array.
                quotes.push(...sanitizedQuotes);
                
                saveToLocalStorage();
                populateCategories();
                filterQuotes();
                showRandomQuote();
                displayNotification('Quotes imported successfully!', "success");
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category" properties.');
            }
        } catch (e) {
            console.error("Error parsing imported JSON or processing file:", e);
            alert('Failed to import quotes. Please ensure the file is a valid JSON format.');
            displayNotification('Failed to import quotes. Invalid file.', "error");
        } finally {
            event.target.value = ''; // Reset file input
        }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

// --- Server Sync & Conflict Resolution ---

/**
 * Fetches quotes from the simulated server (JSONPlaceholder).
 * Maps API response to the quote object format.
 * @returns {Promise<Array<Object>>} A promise that resolves with the server quotes.
 */
async function fetchQuotesFromServer() {
    try {
        syncStatusElement.textContent = "Fetching server data...";
        // For fetching, we just append a limit
        const response = await fetch(`${JSONPLACEHOLDER_API_URL}?_limit=10`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map JSONPlaceholder posts to our quote format
        simulatedServerQuotes = data.map(post => ({
            id: `server-${post.id}`, // Prefix ID to avoid conflict with local timestamp IDs
            text: post.title,
            author: `User ${post.userId}`, // Use userId as author
            category: "Server" // Assign a generic category or derive from body/title
        }));
        syncStatusElement.textContent = "Server data fetched.";
        return simulatedServerQuotes;
    } catch (error) {
        console.error("Error fetching server quotes:", error);
        syncStatusElement.textContent = "Error fetching server data.";
        displayNotification("Failed to fetch server data. Check console.", "error");
        return [];
    }
}

/**
 * Simulates pushing a new quote to the server using a POST request.
 * JSONPlaceholder will accept the POST and return the data, but won't persist it.
 * @param {Object} quote The quote object to push.
 */
async function pushQuoteToServer(quote) {
    try {
        console.log("Attempting to push quote to server:", quote);
        const response = await fetch(JSONPLACEHOLDER_API_URL, {
            method: 'POST', // Specifies the HTTP method as POST
            headers: {
                'Content-Type': 'application/json', // Indicates that the body is JSON
            },
            body: JSON.stringify({ // Converts the quote object to a JSON string for the request body
                title: quote.text, // Map to JSONPlaceholder's 'title'
                body: quote.category, // Map to JSONPlaceholder's 'body'
                userId: 1, // A static user ID for the mock API
                localId: quote.id // Keep local ID for reference if needed
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Quote successfully pushed to server (simulated):", responseData);
        displayNotification("Quote pushed to server (simulated)!", "info");
    } catch (error) {
        console.error("Error pushing quote to server:", error);
        displayNotification("Failed to push quote to server. Check console.", "error");
    }
}


/**
 * Syncs local quotes with simulated server quotes using "server wins" strategy.
 * Local additions are kept. Server updates overwrite local.
 */
async function syncQuotes() { // Renamed from syncData
    syncStatusElement.textContent = "Syncing...";
    displayNotification("Starting sync with server...", "info");

    const serverData = await fetchQuotesFromServer();

    if (serverData.length === 0 && quotes.length === 0) {
        syncStatusElement.textContent = "Sync complete. No data to sync.";
        displayNotification("Sync complete. No data.", "info");
        return;
    }

    let conflictsResolved = 0;
    let newServerQuotesAdded = 0;

    // Create a map for quick lookup of local quotes by ID
    const localQuotesMap = new Map(quotes.map(q => [q.id, q]));

    // 1. Process server data: Add new server quotes, overwrite conflicting local quotes
    serverData.forEach(serverQuote => {
        if (localQuotesMap.has(serverQuote.id)) {
            const localQuote = localQuotesMap.get(serverQuote.id);
            // Simple content comparison to detect conflict
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category || localQuote.author !== serverQuote.author) {
                // Conflict: Server wins
                localQuotesMap.set(serverQuote.id, serverQuote);
                conflictsResolved++;
                console.log(`Conflict resolved for ID ${serverQuote.id}: Server version taken.`, {local: localQuote, server: serverQuote});
            }
        } else {
            // New quote from server
            localQuotesMap.set(serverQuote.id, serverQuote);
            newServerQuotesAdded++;
        }
    });

    // Convert map back to array. This naturally handles overwrites.
    quotes = Array.from(localQuotesMap.values());

    // Save the merged data to local storage
    saveToLocalStorage();
    populateCategories(); // Update categories dropdown
    filterQuotes(); // Update filtered list display
    showRandomQuote(); // Update random quote display

    let syncMessage = "Quotes synced with server!"; // Start with the new desired message
    if (conflictsResolved > 0 || newServerQuotesAdded > 0) {
        syncMessage += ` ${newServerQuotesAdded} new quotes, ${conflictsResolved} conflicts resolved (server won).`;
        displayNotification(syncMessage, "success");
    } else {
        syncMessage += " No changes detected.";
        displayNotification(syncMessage, "info");
    }
    syncStatusElement.textContent = syncMessage;
    console.log("Quotes after sync:", quotes);
}

/**
 * Displays a temporary notification message to the user.
 * @param {string} message The message to display.
 * @param {string} type The type of notification (info, success, warning, error).
 */
function displayNotification(message, type = 'info') {
    notificationArea.textContent = message;
    notificationArea.className = `notification show ${type}`; // Add type class for styling
    setTimeout(() => {
        notificationArea.classList.remove('show');
        // Optional: Clear message after fade out
        setTimeout(() => notificationArea.textContent = '', 500);
    }, 5000); // Display for 5 seconds
}

// --- Event Listeners and Initial Load ---

// Event listener for "Show Random Quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// Event listener for "Export Quotes" button
exportQuotesBtn.addEventListener('click', exportQuotesToJson);

// Event listener for "Sync Now" button
syncNowBtn.addEventListener('click', syncQuotes); // Updated function call

// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    loadFromLocalStorage(); // Load local quotes first
    populateCategories(); // Populate filter based on local quotes
    filterQuotes(); // Apply initial filter
    showRandomQuote(); // Display a random quote

    // Perform an initial sync on load
    await syncQuotes(); // Updated function call

    // Start periodic sync after initial load
    setInterval(syncQuotes, SYNC_INTERVAL); // Updated function call
});
