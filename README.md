
# DoseScope
> Track and monitor substances in the bloodstream.

**DoseScope** is a tracking application designed to monitor the presence of various substances, such as drugs, foods, and supplements—in the bloodstream. It provides users with interactive tools to manage intake schedules, visualize metabolization rates, and analyze health data over time. Built with Electron, React, and D3.js, DoseScope offers a robust and responsive experience.

## Installing / Getting Started

### Prerequisites

Ensure you have the following installed on your system:

1. **Node.js** (v14 or higher)
2. **npm** (v6 or higher)
3. **Electron** (v13 or higher)

### Steps to Set Up

To get DoseScope up and running locally:

```bash
# Clone the repository
git clone https://github.com/hillmatt7/DoseScope.git
cd DoseScope

# Install dependencies
npm install

# Run the development server
npm run dev
```

This will start the application in development mode, and the Electron window should open automatically.

## Features

### Core Functionality
- **Interactive Graphing**: Track and analyze substance levels over time using a responsive graphing interface powered by D3.js.
  - Pan and zoom like a graphing calculator or TradingView.
  - Hover over data points to view detailed tooltips.
- **Customizable Protocols**:
  - Create, edit, and manage intake schedules for substances.
  - Define dosage, offset, frequency, and duration with intuitive controls.
  - Include multiple substances in one protocol and compare them visually.
- **Real-Time Visualization**:
  - View and analyze metabolization rates with dynamic chart updates.
  - Overlay multiple substances to explore interactions and effects.
- **Drag-and-Drop Sidebar**:
  - A resizable and draggable sidebar for managing protocols and compounds.
- **User-Friendly Modals**:
  - Add or edit protocols and substances with streamlined modal interfaces.

### Additional Features
- **Zoom and Pan**: Navigate through detailed data using zoom and pan features.
- **Responsive Design**: The application adjusts seamlessly across screen sizes.
- **Protocol Export**: Save protocols as JSON files for easy sharing or backup.

## File Structure

### Key Files and Directories
- **`src/`**: Contains all source code for the application.
  - **`components/`**: Reusable React components (e.g., `Graph.js`, `Sidebar.js`).
  - **`styles.css`**: Contains all styling for the application.
  - **`App.js`**: Main React application logic.
- **`main.js`**: Electron main process for handling windows and IPC communication.
- **`preload.js`**: Exposes secure APIs for communication between Electron and React.
- **`webpack.config.js`**: Configures Webpack for bundling the application.
- **`dist/`**: Compiled assets for the Electron app.
- **`package.json`**: Manages dependencies and scripts for the project.

### Graphing Features
The graph is implemented using D3.js and provides:
- **Zooming and Panning**: Users can zoom in/out and pan across the chart.
- **Gridlines**: Helps users understand the context of data points.
- **Dynamic Axes**: Automatically update during zoom or pan interactions.
- **Tooltips**: Display detailed information on hover.

## Developing

To contribute to or modify DoseScope, follow these steps:

```bash
# Clone the repository
git clone https://github.com/hillmatt7/DoseScope.git
cd DoseScope

# Install dependencies
npm install

# Start the development server
npm run dev
```

This setup runs the app in development mode with hot-reloading.

### Building the Application

To create a production build of DoseScope, run:

```bash
npm run build
```

This will generate a production-ready version of the app in the `dist/` folder.

### Running Electron in Production Mode

```bash
npm start
```

This command launches the Electron application using the production build.

## Known Issues

- **Performance**: For large datasets, the graph may experience some lag during zooming and panning. Optimization efforts are ongoing.
- **Error Handling**: Ensure all inputs (e.g., dosage, frequency) are properly validated to prevent crashes.

## Contributing

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature-branch`).
5. Open a Pull Request.

Please refer to our `CONTRIBUTING.md` for detailed guidelines.

## Links

- **Project Homepage**: [DoseScope](https://github.com/hillmatt7/DoseScope)
- **Issue Tracker**: [DoseScope Issues](https://github.com/hillmatt7/DoseScope/issues)
- **Repository**: [DoseScope Repository](https://github.com/hillmatt7/DoseScope)

## Licensing

The code in this project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

