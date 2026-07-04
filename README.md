# Auto-Rickshaw Admin Panel

A complete, production-ready Admin Panel for a MERN stack ride-sharing application that exclusively operates Auto-rickshaws (Autos). Built with React + Vite, Tailwind CSS, and modern web technologies.

## Features

### 🎯 Dashboard
- Summary cards displaying Total Earnings, Completed Rides, and Pending Approvals
- Interactive bar chart showing earnings over the last 7 days
- Real-time data fetching with mock API integration

### 👥 Driver Management
- Display list of pending and active drivers
- Approve/reject pending driver applications
- View detailed driver information including:
  - Profile image
  - Phone number
  - Driving license details
  - Aadhar card number
  - Auto variant type
  - Vehicle registration number
- Real-time status updates

### 🗺️ Live Map Tracking
- Full-page Google Map with real-time driver locations
- Geofencing to restrict map viewing to authorized regions:
  - Chennai
  - Chengalpattu
  - Kanchipuram
  - Tiruvallur
- Custom auto-rickshaw markers on the map
- InfoWindow popups showing driver name and auto variant
- Active driver list sidebar with click-to-select functionality

### 🚕 Ride History
- Complete ride history with detailed information
- Display columns: Date, Customer Name, Driver Name, Auto Variant, Pickup, Drop, Fare, Status
- Filter by ride status (All, Completed, Cancelled)
- Responsive table design

### 📱 Responsive Sidebar Navigation
- Clean, modern sidebar with gradient background
- Easy navigation between all pages
- Active page highlighting
- Quick access logout button

## Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **Routing**: React Router DOM 6.20
- **HTTP Client**: Axios 1.6
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.292
- **Maps**: @react-google-maps/api 2.19
- **Post-processing**: PostCSS & Autoprefixer

## Project Structure

```
my driver admin panel/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   └── DriverModal.jsx     # Driver details modal
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard overview
│   │   ├── DriverManagement.jsx # Driver approval page
│   │   ├── LiveMap.jsx         # Real-time map tracking
│   │   └── RideHistory.jsx     # Ride history table
│   ├── services/
│   │   └── api.js              # Axios instance & config
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React DOM entry point
│   └── index.css               # Global styles
├── .env                        # Environment variables
├── .env.example                # Environment template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── index.html                  # HTML entry point
└── package.json                # Dependencies & scripts
```

## Installation

1. **Clone/Setup the Project**
   ```bash
   cd "my driver admin panel"
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Google Maps API Key:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=AIzaSyD_your_api_key_here
     ```
   - Update API base URL if your backend runs on a different port:
     ```env
     VITE_API_BASE_URL=http://localhost:5000
     ```

3. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Maps JavaScript API
   - Create an API key in the Credentials section
   - Copy the key to your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```
The app will open at `http://localhost:3000` by default.

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## API Integration

The admin panel communicates with a backend API at `http://localhost:5000`. All requests are made through the configured Axios instance in `src/services/api.js`.

### Expected API Endpoints

```
GET  /api/admin/dashboard      # Dashboard summary data
GET  /api/admin/drivers        # List of drivers
PUT  /api/admin/drivers/:id/status  # Update driver status
GET  /api/admin/live-drivers   # Real-time driver locations
GET  /api/admin/rides          # Ride history
```

### Mock Data

The application includes mock data for demonstration purposes. When actual backend APIs are implemented, replace the mock data in each page component with the corresponding API calls.

## Customization

### Styling
- Primary color: Edit `theme.colors.primary` in `tailwind.config.js`
- Fonts and spacing customization available in the same config file

### Map Configuration
- Change default center coordinates in `src/pages/LiveMap.jsx`
- Adjust map bounds for different regions
- Customize marker icons

### Components
- All components are modular and reusable
- Use Lucide React icons: https://lucide.dev/
- Tailwind CSS classes for consistent styling

## Performance Optimizations

- Code splitting with Vite
- Lazy loading of routes
- Optimized Recharts implementation
- Image lazy loading support
- Efficient state management with React hooks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

- API base URL is environment-specific
- Sensitive keys stored in `.env` (not in version control)
- CORS configured on backend as needed
- Input validation on forms (implement as needed)

## Troubleshooting

**Map not loading?**
- Verify Google Maps API key in `.env`
- Check API key has Maps JavaScript API enabled
- Ensure API key restrictions are properly set

**Vite compilation errors?**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Restart the dev server: `npm run dev`

**API requests failing?**
- Verify backend is running on `http://localhost:5000`
- Check CORS configuration on backend
- Review browser console for detailed error messages

## Future Enhancements

- User authentication & role-based access
- Advanced analytics dashboard
- Real-time notifications
- Driver rating system
- Payment integration
- Automated reporting
- Mobile app version

## Support

For issues or questions, check the browser console for detailed error messages and ensure all dependencies are properly installed.

## License

Private - Auto-Rickshaw Ride Sharing Platform