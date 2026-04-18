export const templates = {
  chocolate: {
    name: 'Chocolate Template',
    description: 'Template for chocolate/restaurant business',
    template: 'chocolate',
    tabs: {
      hero: {
        label: 'Hero Section',
        type: 'section',
        fields: [
          { label: 'Tag', type: 'text', name: 'tag' },
          { label: 'Heading', type: 'text', name: 'heading' },
          { label: 'Description', type: 'textarea', name: 'description' },
          { label: 'Image', type: 'image', name: 'image' },
          { label: 'Name', type: 'text', name: 'name' },
          { label: 'Highlights', type: 'array-text', name: 'highlights', placeholder: 'Type and press Enter' },
        ],
      },
      menu: {
        label: 'Menu Section',
        type: 'section',
        fields: [
          { label: 'Tag', type: 'text', name: 'tag' },
          { label: 'Menu Heading', type: 'text', name: 'heading' },
          { label: 'Menu Description', type: 'textarea', name: 'description' },
        ],
      },
      ourStory: {
        label: 'Our Story',
        type: 'section',
        fields: [
          { label: 'Tag', type: 'text', name: 'tag' },
          { label: 'Heading', type: 'text', name: 'heading' },
          { label: 'Description', type: 'textarea', name: 'description' },
          { label: 'Highlights', type: 'array-text', name: 'highlights', placeholder: 'Type and press Enter' },
        ],
      },
      reviews: {
        label: 'People Reviews',
        type: 'section',
        fields: [
          { label: 'Tag', type: 'text', name: 'tag' },
          { label: 'Heading', type: 'text', name: 'heading' },
          { label: 'Description', type: 'textarea', name: 'description' },
        ],
      },
      address: {
        label: 'Contact / Address Section',
        type: 'section',
        fields: [
          { label: 'Tag', type: 'text', name: 'tag' },
          { label: 'Heading', type: 'text', name: 'heading' },
          { label: 'Description', type: 'textarea', name: 'description' },
          { label: 'Full Address', type: 'textarea', name: 'address' },
          { label: 'Phone', type: 'text', name: 'phone' },
          { label: 'Email', type: 'email', name: 'email' },
          { label: 'Instagram URL', type: 'text', name: 'instagram' },
        ],
      },
      footer: {
        label: 'Footer Section',
        type: 'section',
        fields: [
          { label: 'Footer Text', type: 'text', name: 'footerText' },
          { label: 'Copyright Text', type: 'text', name: 'copyright' },
          { label: 'Facebook URL', type: 'text', name: 'facebook' },
          { label: 'Instagram URL', type: 'text', name: 'instagram' },
          { label: 'Twitter URL', type: 'text', name: 'twitter' },
        ],
      },
      timings: {
        label: 'Opening Hours',
        type: 'timing-section',
        fields: [
          { label: 'Monday Open', type: 'time', name: 'mondayOpen' },
          { label: 'Monday Close', type: 'time', name: 'mondayClose' },
          { label: 'Tuesday Open', type: 'time', name: 'tuesdayOpen' },
          { label: 'Tuesday Close', type: 'time', name: 'tuesdayClose' },
          { label: 'Wednesday Open', type: 'time', name: 'wednesdayOpen' },
          { label: 'Wednesday Close', type: 'time', name: 'wednesdayClose' },
          { label: 'Thursday Open', type: 'time', name: 'thursdayOpen' },
          { label: 'Thursday Close', type: 'time', name: 'thursdayClose' },
          { label: 'Friday Open', type: 'time', name: 'fridayOpen' },
          { label: 'Friday Close', type: 'time', name: 'fridayClose' },
          { label: 'Saturday Open', type: 'time', name: 'saturdayOpen' },
          { label: 'Saturday Close', type: 'time', name: 'saturdayClose' },
          { label: 'Sunday Open', type: 'time', name: 'sundayOpen' },
          { label: 'Sunday Close', type: 'time', name: 'sundayClose' },
        ],
      },
    },
  },

  basic: {
    name: 'Basic Template',
    description: 'Simple template with enhanced sections',
    template: 'basic',
    tabs: {
      basicInfo: {
        label: 'Basic Info',
        type: 'section',
        fields: [
          { label: 'Name', type: 'text', name: 'name', placeholder: 'Enter your business/company name' },
          { label: 'Tagline', type: 'text', name: 'tagline', placeholder: 'Enter your tagline' },
          { label: 'About Us', type: 'textarea', name: 'aboutUs', placeholder: 'Tell us about your business...' },
        ],
      },
      heroSection: {
        label: 'Hero Section',
        type: 'section',
        fields: [{ label: 'Hero Image', type: 'image', name: 'heroImage' }],
      },
      gallery: {
        label: 'Gallery',
        type: 'dynamic-section',
        fields: [{ label: 'Gallery Images', type: 'dynamic-images', name: 'galleryImages' }],
      },
      contact: {
        label: 'Contact',
        type: 'section',
        fields: [
          { label: 'Email', type: 'email', name: 'email', placeholder: 'contact@example.com' },
          { label: 'Phone', type: 'text', name: 'phone', placeholder: '+1234567890' },
          { label: 'WhatsApp', type: 'text', name: 'whatsapp', placeholder: '+1234567890' },
          { label: 'Address', type: 'textarea', name: 'address', placeholder: 'Enter your full address' },
          { label: 'Google Maps Iframe', type: 'textarea', name: 'googleMaps', placeholder: 'Paste your Google Maps iframe code here' },
          { label: 'Instagram URL', type: 'text', name: 'instagram', placeholder: 'https://instagram.com/username' },
          { label: 'Facebook ID', type: 'text', name: 'facebook', placeholder: 'facebook.com/username' },
        ],
      },
      footer: {
        label: 'Footer',
        type: 'section',
        fields: [
          { label: 'Copyright Text', type: 'text', name: 'copyright', placeholder: '© 2024 Your Company' },
          { label: 'Company Name', type: 'text', name: 'companyName', placeholder: 'Your Company Name' },
          { label: 'License Information', type: 'text', name: 'license', placeholder: 'License info or registration number' },
          { label: 'Average Cost', type: 'text', name: 'averageCost', placeholder: '$$ or ₹500 for two' },
          { label: 'Opening Hours', type: 'text', name: 'openingHours', placeholder: 'Mon-Sun: 10AM - 10PM' },
          { label: 'Hours Subtitle', type: 'text', name: 'hoursSubtitle', placeholder: 'Available for delivery' },
        ],
      },
    },
  },
} as const