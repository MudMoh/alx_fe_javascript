// script.js for Dynamic Quote Generator

// Define initial array of quote objects
// Each quote has a text and a category
const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" }
];

// Define variables to reference DOM elements based on the new HTML structure
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote'); // Button to show new quote
const newQuoteText = document.getElementById('newQuoteText'); // Input for new quote text
const newQuoteCategory = document.getElementById('newQuoteCategory'); // Input for new quote category

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
    quoteParagraph.style.fontSize = '1.5em';
    quoteParagraph.style.fontWeight = 'bold';
    quoteParagraph.style.marginBottom = '10px';
    quoteParagraph.style.color = '#333';

    // Create a paragraph element for the quote category
    const categoryParagraph = document.createElement('p');
    categoryParagraph.textContent = `- ${randomQuote.category}`;
    categoryParagraph.style.fontSize = '1em';
    categoryParagraph.style.fontStyle = 'italic';
    categoryParagraph.style.color = '#666';

    // Append the created elements to the quote display div
    quoteDisplay.appendChild(quoteParagraph);
    quoteDisplay.appendChild(categoryParagraph);
}

/**
 * Adds a new quote to the 'quotes' array based on user input.
 * It retrieves values from input fields, validates them, adds the new quote,
 * clears the input fields, and then displays a new random quote.
 */
function createAddQuoteForm() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    // Check if both input fields are filled
    if (text && category) {
        // Create a new quote object
        const newQuote = { text: text, category: category };
        // Add the new quote to the array
        quotes.push(newQuote);

        // Clear the input fields
        newQuoteText.value = '';
        newQuoteCategory.value = '';

        // Display a new random quote immediately after adding
        showRandomQuote();

        // Optional: Provide a small visual confirmation
        console.log("Quote added:", newQuote);
    } else {
        // Alert the user if fields are empty
        alert("Please enter both the quote text and category to add a new quote.");
    }
}

// Add an event listener to the "Show New Quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// Initial display of a random quote when the page loads
document.addEventListener('DOMContentLoaded', showRandomQuote);
