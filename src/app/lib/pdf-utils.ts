import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Check if a message content contains an itinerary
export const containsItinerary = (content: string): boolean => {
  // First, check for the special marker
  if (content.includes("[TRAVEL_ITINERARY]")) {
    return true;
  }
  
  // Look for common itinerary indicators
  const itineraryIndicators = [
    // Day markers
    "day 1", "day 2", "day 3", "day 4", "day 5",
    "day one", "day two", "day three", "day four", "day five",
    "day-1", "day-2", "day-3", "day-4", "day-5",
    
    // Travel terms
    "itinerary", "travel plan", "schedule", "travel dates",
    "destination", "destinations", "trip to", "vacation in",
    "travel itinerary", "travel tips", "Itinerary",
    
    // Accommodation
    "accommodation", "hotel", "lodging", "stay at", "resort",
    "airbnb", "ryokan", "hostel",
    
    // Transportation
    "flight", "train", "bus", "transportation", "transit",
    "jr pass", "rail pass", "subway",
    
    // Financial
    "budget", "cost", "expense", "usd", "eur", "jpy", "$",
    
    // Activities
    "visit", "explore", "experience", "sightseeing", "tour",
    "activity", "activities",
    
    // Travel planning
    "travelers", "travellers", "people", "adults", "children",
    "family", "group",
    
    // Cities and landmarks (generic markers)
    "city", "landmark", "attraction", "museum", "temple",
    "shrine", "market", "garden", "park"
  ];

  const lowerContent = content.toLowerCase();
  
  // Check for structural markers
  const hasNumberedList = /^\s*\d+\.\s/m.test(content);
  const hasBulletPoints = /^\s*[\*\-•]\s/m.test(content);
  
  // Return true if structure and content match itinerary patterns
  return itineraryIndicators.some(indicator => lowerContent.includes(indicator.toLowerCase())) ||
         (hasNumberedList && hasBulletPoints && (lowerContent.includes('travel') || lowerContent.includes('visit')));
};

// Generate PDF from a message content element
export const generatePdfFromElement = async (element: HTMLElement, title: string = 'Travel Itinerary'): Promise<void> => {
  try {
    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Remove the [TRAVEL_ITINERARY] marker if it exists
    if (clonedElement.innerHTML.includes("[TRAVEL_ITINERARY]")) {
      clonedElement.innerHTML = clonedElement.innerHTML.replace("[TRAVEL_ITINERARY]", "");
    }
    
    // Create a wrapper with proper padding and styling
    const wrapper = document.createElement('div');
    wrapper.style.padding = '30px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.width = '800px';
    wrapper.style.fontFamily = 'Arial, sans-serif';
    
    // Move the content to the wrapper
    wrapper.innerHTML = clonedElement.innerHTML;
    
    // Apply enhanced styling to the wrapper
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
      * {
        color: black !important;
        background-color: white !important;
        border-color: #ccc !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* Add padding and margin */
      p {
        margin-bottom: 10px !important;
        line-height: 1.5 !important;
      }
      
      /* Fix numbered lists */
      ol {
        padding-left: 30px !important;
        margin-bottom: 15px !important;
        list-style-type: decimal !important;
        counter-reset: item !important;
      }
      
      ol li {
        display: block !important;
        margin-bottom: 8px !important;
        padding-left: 5px !important;
        line-height: 1.4 !important;
      }
      
      ol li::before {
        content: "" !important;
      }
      
      /* Fix bullet lists */
      ul {
        padding-left: 30px !important;
        margin-bottom: 15px !important;
        list-style-type: disc !important;
      }
      
      ul li {
        display: list-item !important;
        margin-bottom: 8px !important;
        padding-left: 5px !important;
        line-height: 1.4 !important;
      }
      
      /* Style links */
      a { 
        color: blue !important;
        text-decoration: underline !important;
      }
      
      /* Style headings */
      h1, h2, h3 {
        margin-top: 20px !important;
        margin-bottom: 10px !important;
        font-weight: bold !important;
      }
      
      /* Style strong text */
      strong { 
        font-weight: bold !important; 
      }
      
      /* Add a subtle border to the document */
      .pdf-content {
        border: 1px solid #eee !important;
        padding: 20px !important;
        background-color: white !important;
      }
    `;
    
    // Add the enhanced styles
    wrapper.appendChild(enhancedStyles);
    
    // Add a class to the content for styling
    const contentDiv = document.createElement('div');
    contentDiv.className = 'pdf-content';
    contentDiv.innerHTML = wrapper.innerHTML;
    wrapper.innerHTML = '';
    wrapper.appendChild(contentDiv);
    
    // Add a title to the PDF
    const titleDiv = document.createElement('h1');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.fontSize = '24px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '20px';
    titleDiv.innerText = title;
    contentDiv.insertBefore(titleDiv, contentDiv.firstChild);
    
    // Temporarily append to document for rendering
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    // Create canvas from the wrapper with enhanced styling
    const canvas = await html2canvas(wrapper, {
      useCORS: true,
      logging: false,
      background: '#ffffff'
    } as Record<string, unknown>);
    
    // Remove the temporary elements
    document.body.removeChild(wrapper);
    
    // Initialize PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions while maintaining aspect ratio
    const imgWidth = 190; // Slightly narrower for margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add canvas as image with proper margins
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // If content spans multiple pages
    if (imgHeight > 270) {
      let heightLeft = imgHeight;
      let position = 10; // starting position with margin
      
      // Remove title space for subsequent pages
      heightLeft -= 270;
      position += 270;
      
      // Add new pages as needed
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -position, imgWidth, imgHeight);
        heightLeft -= 270;
        position += 270;
      }
    }
    
    // Download the PDF
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Could not generate PDF. See console for details.');
  }
}; 