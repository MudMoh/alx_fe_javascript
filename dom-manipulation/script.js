// script.js for Dynamic Quote Generator with Local Storage and JSON Handling

// Define initial array of quote objects.
// This array will hold quotes loaded from local storage,
// or serve as a default if local storage is empty.
let quotes = [];

// Define variables to reference DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote'); // Button to show new quote
const newQuoteText = document.getElementById('newQuoteText'); // Input for new quote text
const newQuoteCategory = document.getElementById('newQuoteCategory'); // Input for new quote category
const exportQuotesBtn = document.getElementById('exportQuotesBtn'); // Button for exporting quotes
const importFile = document.getElementById('importFile'); // Input for importing file

/**
 * Generates a unique ID for a new quote using a timestamp.
 * @returns {string} A unique string ID.
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Loads quotes from Local Storage.
 * If no quotes are found, it initializes with a default set of quotes.
 * @returns {Array<Object>} An array of quote objects.
 */
function loadQuotesFromLocalStorage() {
    try {
        const storedQuotes = localStorage.getItem('quotes');
        if (storedQuotes) {
            // Parse the JSON string back into a JavaScript array
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
            saveQuotesToLocalStorage(); // Save these initial quotes
        }
    } catch (e) {
        console.error("Error loading quotes from local storage:", e);
        // Fallback to empty array or default if storage is corrupted
        quotes = [
            { id: generateUniqueId(), text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { id: generateUniqueId(), text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
            { id: generateUniqueId(), text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
            { id: generateUniqueId(), text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { id: generateUniqueId(), text: "The mind is everything. What you think you become.", category: "Mindset" }
        ];
        alert("Corrupted local storage data. Initializing with default quotes.");
        saveQuotesToLocalStorage();
    }
    return quotes;
}

/**
 * Saves the current 'quotes' array to Local Storage.
 */
function saveQuotesToLocalStorage() {
    try {
        const quotesJson = JSON.stringify(quotes);
        localStorage.setItem('quotes', quotesJson);
    } catch (e) {
        console.error("Error saving quotes to local storage:", e);
        alert("Failed to save quotes. Local storage might be full or inaccessible.");
    }
}

/**
 * Displays a random quote from the 'quotes' array in the #quoteDisplay section.
 * It clears previous content and creates new paragraph elements for the quote text and category.
 */
function showRandomQuote() {
    // Clear any existing content in the display area
    quoteDisplay.innerHTML = '';

    if (quotes.length === 0) {
        // If there are no quotes, display a message
        const noQuoteMessage = document.createElement('p');
        noQuoteMessage.textContent = "No quotes available. Add some!";
        noQuoteMessage.style.textAlign = 'center';
        noQuoteMessage.style.fontSize = '1.2em';
        noQuoteMessage.style.color = '#555';
        quoteDisplay.appendChild(noQuoteMessage);
        return;
    }

    // Generate a random index to pick a quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Create a paragraph element for the quote text
    const quoteParagraph = document.createElement('p');
    quoteParagraph.textContent = `"${randomQuote.text}"`;
    // Apply styling from CSS (previously inline, now relying on external styles)
    // For direct DOM manipulation without external CSS, you'd set styles here:
    // quoteParagraph.style.fontSize = '1.5em';
    // quoteParagraph.style.fontWeight = 'bold';
    // quoteParagraph.style.marginBottom = '10px';
    // quoteParagraph.style.color = '#333';

    // Create a paragraph element for the quote category
    const categoryParagraph = document.createElement('p');
    categoryParagraph.textContent = `- ${randomQuote.category}`;
    // Apply styling from CSS
    // categoryParagraph.style.fontSize = '1em';
    // categoryParagraph.style.fontStyle = 'italic';
    // categoryParagraph.style.color = '#666';

    // Append the created elements to the quote display div
    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categoryParagraph);
}

/**
 * Adds a new quote to the 'quotes' array based on user input from the form.
 * It retrieves values from input fields, validates them, adds the new quote,
 * clears the input fields, saves to local storage, and then displays a new random quote.
 * This function is explicitly named createAddQuoteForm as requested by user's HTML onclick.
 */
function createAddQuoteForm() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    // Check if both input fields are filled
    if (text && category) {
        // Create a new quote object with a unique ID
        const newQuote = { id: generateUniqueId(), text: text, category: category };
        // Add the new quote to the array
        quotes.push(newQuote);

        // Save the updated quotes array to local storage
        saveQuotesToLocalStorage();

        // Clear the input fields
        newQuoteText.value = '';
        newQuoteCategory.value = '';

        // Display a new random quote immediately after adding
        showRandomQuote();

        console.log("Quote added:", newQuote);
    } else {
        // Alert the user if fields are empty
        alert("Please enter both the quote text and category to add a new quote.");
    }
}

/**
 * Exports all current quotes to a JSON file and triggers a download.
 */
function exportQuotesToJson() {
    // Get the current quotes from the active array (which is kept in sync with local storage)
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
            // Ensure importedQuotes is an array and contains objects with 'text' and 'category'
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q === 'object' && q !== null && 'text' in q && 'category' in q)) {
                // Assign unique IDs to imported quotes if they don't have them
                const sanitizedQuotes = importedQuotes.map(q => ({
                    id: q.id || generateUniqueId(), // Use existing ID or generate new
                    text: q.text,
                    category: q.category
                }));
                
                // Add imported quotes to the existing array.
                // Using spread operator (...) adds individual elements, not the array itself.
                quotes.push(...sanitizedQuotes);
                
                saveQuotesToLocalStorage(); // Save combined quotes to local storage
                showRandomQuote(); // Update display with a new random quote from the combined list
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category".');
            }
        } catch (e) {
            console.error("Error parsing imported JSON or processing file:", e);
            alert('Failed to import quotes. Please ensure the file is a valid JSON format.');
        }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesBtn.addEventListener('click', exportQuotesToJson);
// The importFile input has its onchange event handler defined directly in HTML.

// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadQuotesFromLocalStorage(); // Load quotes from local storage first
    showRandomQuote(); // Then display a random quote
});
