/**
 * @file recommendations.js
 * @description Functions for displaying AI-generated recommendations, loading states, and error messages in the UI.
 */

/**
 * Display recommendations in the UI
 * @param {string} text - Markdown formatted recommendation text
 */
export function displayRecommendations(text) {
    console.log("[DEBUG] displayRecommendations:", text);
    const recommendations = document.getElementById("recommendations");
    
    // Parse markdown to HTML using marked.js (from CDN)
    const html = window.marked ? window.marked.parse(text) : text;
    
    // Apply enhanced styling to the recommendations container
    recommendations.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 shadow-inner prose dark:prose-invert prose-sm max-w-none">
            ${html}
        </div>
    `;

    // This will run after the DOM has been updated with the new content
    setTimeout(() => {
        // Find and enhance important points with better styling
        const recommendationsDiv = recommendations.querySelector('div');
        if (recommendationsDiv) {
            const paragraphs = recommendationsDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
                // Add subtle background to paragraphs that contain important keywords
                if (p.textContent.match(/important|recommend|significant|suggest|consider/i)) {
                    p.classList.add('bg-yellow-50', 'dark:bg-yellow-900', 'p-2', 'rounded', 'border-l-4', 'border-yellow-400');
                }
            });
            
            // Style headings
            const headings = recommendationsDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => {
                h.classList.add('font-bold', 'mt-4', 'mb-2');
            });
            
            // Style lists
            const lists = recommendationsDiv.querySelectorAll('ul, ol');
            lists.forEach(list => {
                list.classList.add('list-disc', 'pl-6', 'my-2', 'space-y-1');
            });
            
            // Style blockquotes
            const blockquotes = recommendationsDiv.querySelectorAll('blockquote');
            blockquotes.forEach(blockquote => {
                blockquote.classList.add('border-l-4', 'border-gray-300', 'pl-4', 'my-2', 'text-gray-600', 'dark:text-gray-300');
            });
        }
    }, 100);
}

/**
 * Show a loading state for recommendations
 */
export function showRecommendationsLoading() {
    const recommendations = document.getElementById("recommendations");
    if (recommendations) {
        recommendations.innerHTML = `
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-600 dark:text-gray-300">Generating recommendations...</span>
            </div>
        `;
    }
}

/**
 * Show an error state for recommendations
 * @param {string} message - Error message to display
 */
export function showRecommendationsError(message = "Failed to load recommendations") {
    const recommendations = document.getElementById("recommendations");
    if (recommendations) {
        recommendations.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                        <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>${message}</p>
                        </div>
                        <div class="mt-4">
                            <button type="button" class="rounded-md bg-red-50 dark:bg-red-900/30 px-2 py-1.5 text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 dark:focus:ring-offset-red-900/30" onclick="window.location.reload()">
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
