// script.js for Dynamic Quote Generator with Local Storage, JSON, and Filtering

// Define initial array of quote objects.
// This array will hold quotes loaded from local storage,
// or serve as a default if local storage is empty.
let quotes = [];
let lastFilter = 'all'; // Default filter to show all categories

// Define variables to reference DOM elements
const quoteDisplay = document.getElementById('quoteDisplay'); // New ID for single quote display
const newQuoteButton = document.getElementById('newQuote'); // Button to show new quote
const newQuoteText = document.getElementById('newQuoteText'); // Input for new quote text
const newQuoteCategory = document.getElementById('newQuoteCategory'); // Input for new quote category
const exportQuotesBtn = document.getElementById('exportQuotesBtn'); // Button for exporting quotes
const importFile = document.getElementById('importFile'); // Input for importing file
const categoryFilter = document.getElementById('categoryFilter'); // New select element for filtering
const quotesListDisplay = document.getElementById('quotesListDisplay'); // New container for filtered list
const noFilteredQuotesMessage = document.getElementById('noFilteredQuotesMessage'); // Message for no filtered quotes

// --- Web Storage Helper Functions ---

/**
 * Generates a unique ID for a new quote using a timestamp and random string.
 * @returns {string} A unique string ID.
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Loads quotes from Local Storage.
 * If no quotes are found, it initializes with a default set of quotes.
 * Also loads the last selected filter.
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
        // Fallback to empty array or default if storage is corrupted
        quotes = [
            { id: generateUniqueId(), text: "Error loading quotes. Initializing with default quotes.", category: "Error" }
        ];
        alert("Corrupted local storage data for quotes. Initializing with default quotes.");
        saveToLocalStorage();
    }

    // Load last selected filter from local storage
    lastFilter = localStorage.getItem('lastFilter') || 'all';
}

/**
 * Saves the current 'quotes' array and 'lastFilter' to Local Storage.
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('lastFilter', lastFilter);
    } catch (e) {
        console.error("Error saving to local storage:", e);
        alert("Failed to save data. Local storage might be full or inaccessible.");
    }
}

// --- Display & Filtering Functions ---

/**
 * Displays a single random quote from the 'quotes' array in the random QuoteDisplay section.
 * This is separate from the filtered list display.
 */
function showRandomQuote() {
    quoteDisplay.innerHTML = ''; // Clear previous content

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
    categoryFilter.value = lastFilter;
}

/**
 * Filters and displays quotes based on the selected category in the quotesListDisplay section.
 * This function is called when the category filter changes.
 */
function filterQuotes() {
    lastFilter = categoryFilter.value; // Update the last filter
    saveToLocalStorage(); // Persist the selected filter

    let filteredQuotes = [];
    if (lastFilter === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === lastFilter);
    }

    renderQuotesList(filteredQuotes); // Render the filtered quotes
}

/**
 * Renders a list of quotes to the quotesListDisplay container.
 * Each quote is displayed with its text, author, and a remove button.
 * @param {Array<Object>} quotesToRender The array of quote objects to display.
 */
function renderQuotesList(quotesToRender) {
    quotesListDisplay.innerHTML = ''; // Clear existing list

    if (quotesToRender.length === 0) {
        noFilteredQuotesMessage.classList.remove('hidden');
    } else {
        noFilteredQuotesMessage.classList.add('hidden');
        quotesToRender.forEach(quote => {
            const quoteItem = document.createElement('div');
            quoteItem.classList.add('quote-item'); // CSS class for individual quote styling

            const quoteText = document.createElement('p');
            quoteText.classList.add('quote-text');
            quoteText.textContent = `“${quote.text}”`;

            const quoteAuthor = document.createElement('p');
            quoteAuthor.classList.add('quote-author');
            quoteAuthor.textContent = `- ${quote.author}`;

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-btn');
            removeBtn.innerHTML = '&times;'; // 'x' icon
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
function createAddQuoteForm() { // Retaining this name as requested by user's HTML onclick
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        const newQuote = { id: generateUniqueId(), text: text, category: category };
        quotes.push(newQuote);

        saveToLocalStorage(); // Save updated quotes to local storage
        populateCategories(); // Update the filter dropdown in case of a new category
        filterQuotes(); // Re-filter and display the list with the new quote
        showRandomQuote(); // Update the single random quote display

        newQuoteText.value = ''; // Clear input fields
        newQuoteCategory.value = '';

        console.log("Quote added:", newQuote);
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
    quotes = quotes.filter(quote => quote.id !== idToRemove); // Filter out the quote

    saveToLocalStorage(); // Save updated quotes to local storage
    populateCategories(); // Update categories dropdown (a category might become empty)
    filterQuotes(); // Re-filter and display the list
    showRandomQuote(); // Update the single random quote display in case the removed one was showing
}

// --- JSON Import/Export Functions ---

/**
 * Exports all current quotes to a JSON file and triggers a download.
 */
function exportQuotesToJson() {
    const dataStr = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing JSON
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_quotes.json'; // Suggested file name
    document.body.appendChild(a); // Append to body to make it clickable
    a.click(); // Programmatically click the anchor to trigger download
    document.body.removeChild(a); // Clean up the temporary anchor
    URL.revokeObjectURL(url); // Release the object URL
    alert('Quotes exported successfully!');
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
                    category: q.category
                }));
                
                quotes.push(...sanitizedQuotes); // Add imported quotes to the existing array
                
                saveToLocalStorage(); // Save combined quotes to local storage
                populateCategories(); // Update categories dropdown
                filterQuotes(); // Update displayed list with new quotes (filtered)
                showRandomQuote(); // Update random quote display
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category" properties.');
            }
        } catch (e) {
            console.error("Error parsing imported JSON or processing file:", e);
            alert('Failed to import quotes. Please ensure the file is a valid JSON format.');
        } finally {
            // Reset the file input to allow selecting the same file again if needed
            event.target.value = '';
        }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

// --- Event Listeners and Initial Load ---

// Event listener for "Show Random Quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// Event listener for "Export Quotes" button
exportQuotesBtn.addEventListener('click', exportQuotesToJson);

// The 'importFile' input has its onchange event handler defined directly in HTML.
// The 'categoryFilter' select has its onchange event handler defined directly in HTML.

// Initial setup when the page loads:
// 1. Load data from local storage
// 2. Populate the category filter dropdown
// 3. Apply the initial filter to display quotes
// 4. Display a random quote in its dedicated section
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    populateCategories();
    filterQuotes(); // Apply initial filter based on lastFilter from localStorage
    showRandomQuote();
});
