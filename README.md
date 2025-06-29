# alx_fe_javascript
Key Changes and How it Works:

quotes Array: The JavaScript now maintains a quotes array directly in memory. This array holds JavaScript objects, each with text and category properties. This means quotes are not saved to local storage and will reset if you close the browser tab.

DOM Element References: The JavaScript variables quoteDisplay, newQuoteButton, newQuoteText, and newQuoteCategory are now correctly linked to the new HTML elements' ids.

showRandomQuote() Function:

This function selects a random quote from the quotes array.

It dynamically creates <p> elements for the quote text and its category.

It then appends these elements to the quoteDisplay div, making the quote visible on the page.

It also handles the case where the quotes array might be empty.

addQuote() Function:

This function is called when the "Add Quote" button (with onclick="addQuote()") is clicked.

It retrieves the values from the newQuoteText and newQuoteCategory input fields.

It performs a basic validation to ensure both fields are not empty.

If valid, it creates a new quote object and pushes it into the quotes array.

It then clears the input fields and immediately calls showRandomQuote() to update the displayed quote (it will show a new random quote from the now-updated list).

Event Listeners:

The newQuoteButton (the "Show New Quote" button) now has an addEventListener to call showRandomQuote() when clicked.

The "Add Quote" button uses an inline onclick="addQuote()" as specified in your HTML.

Initial Load: document.addEventListener('DOMContentLoaded', showRandomQuote); ensures that a random quote is displayed as soon as the page finishes loading.

I've also included some basic inline CSS in the HTML to give the application a cleaner and more user-friendly appearance, including responsive adjustments.