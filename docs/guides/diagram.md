# EnergiWatch-MVP Architecture Diagrams

Below are comprehensive Mermaid diagrams representing the key architectures of the EnergiWatch-MVP app. These diagrams cover the main system architecture, data flow, and module relationships for clarity and ease of understanding.

---

## 1. System Architecture

```mermaid
graph TD
    %% Main components
    UI[User Interface]
    JSM[JS Modules]
    VIS[Visualization Components]
    API[API Layer]
    DB[Data Storage]
    AI[AI Generator]
    EXT[External Services]
    
    %% Detailed components
    UI1[Input Forms]
    UI2[Dashboard]
    
    JSM1[Main Module]
    JSM2[API Client]
    JSM3[Utilities]
    
    VIS1[Charts & Graphs]
    VIS2[Dashboard Components]
    
    API1[RESTful Endpoints]
    API2[Authentication]
    API3[Validation]
    
    DB1[User Data]
    DB2[Usage History]
    DB3[Configuration]
    
    AI1[Prediction Engine]
    AI2[Cost Estimation]
    
    EXT1[Weather API]
    EXT2[Fixed Tariff: 0.4562 RM/kWh]
    
    %% Relationships
    UI --- JSM
    UI --- VIS
    JSM --- API
    API --- DB
    API --- AI
    AI --- EXT
    
    UI --- UI1
    UI --- UI2
    
    JSM --- JSM1
    JSM --- JSM2
    JSM --- JSM3
    
    VIS --- VIS1
    VIS --- VIS2
    
    API --- API1
    API --- API2
    API --- API3
    
    DB --- DB1
    DB --- DB2
    DB --- DB3
    
    AI --- AI1
    AI --- AI2
    
    EXT --- EXT1
    EXT --- EXT2
    
    %% Key data flows
    JSM1 -->|User Actions| API1
    API1 -->|Data Requests| DB2
    API1 -->|Prediction Request| AI1
    AI1 -->|Weather Data| EXT1
    AI2 -->|Fixed Rate| EXT2
    API1 -->|Results| JSM2
    JSM1 -->|Update| VIS1
    
    %% Styling
    classDef frontend fill:#f9f9ff,stroke:#0066cc,stroke-width:2px,color:#000
    classDef backend fill:#f0fff0,stroke:#009900,stroke-width:2px,color:#000
    classDef external fill:#fff0f0,stroke:#cc0000,stroke-width:2px,color:#000
    
    class UI,JSM,VIS,UI1,UI2,JSM1,JSM2,JSM3,VIS1,VIS2 frontend
    class API,DB,AI,API1,API2,API3,DB1,DB2,DB3,AI1,AI2 backend
    class EXT,EXT1,EXT2 external
```

### System Architecture Diagram Explanation

This architecture diagram illustrates the complete structure of the EnergiWatch-MVP application, showing how different components interact to deliver energy consumption monitoring and cost calculation functionality.

#### Key Components

**Frontend Layer:**

- **User Interface**: The main interface that users interact with, consisting of input forms for entering consumption data and dashboards for viewing results.
- **JS Modules**: Core JavaScript modules that handle application logic, including the main module that orchestrates functionality, an API client for backend communication, and utility modules for common functions.
- **Visualization Components**: Specialized components for data presentation, including charts, graphs, and dashboard elements that display consumption data and cost calculations.

**Backend Layer:**

- **API Layer**: Handles all communication between frontend and backend, including RESTful endpoints, authentication, and data validation to ensure security and data integrity.
- **Data Storage**: Manages persistent data including user information, historical usage data, and application configuration settings.
- **AI Generator**: Provides predictive capabilities for consumption forecasting and cost estimation, but importantly uses a fixed tariff rate rather than generating variable rates.

**External Services:**

- **Weather API**: External data source for weather information that may influence energy consumption predictions.
- **Fixed Tariff Rate**: A constant rate of 0.4562 RM/kWh used for all cost calculations, which remains unchanged regardless of AI predictions.

#### Key Data Flows

1. User actions from the frontend are processed by JS modules and sent to the API layer
2. The API layer interacts with data storage to retrieve or store information
3. For predictions, the API layer invokes the AI Generator
4. The AI Generator may use weather data but always applies the fixed tariff rate of 0.4562 RM/kWh
5. Results flow back through the API to the frontend for visualization

#### Design Principles

- **Separation of Concerns**: Clear boundaries between frontend, backend, and external services
- **Modular Design**: Components are organized into logical groups that can be developed and maintained independently
- **Fixed Pricing Model**: The system uses a constant tariff rate that isn't affected by the AI generator, ensuring predictable cost calculations

---

## 2. Data Flow: Tariff Calculation (Fixed Rate)

```mermaid
flowchart TD
    %% User actions and inputs
    User1[User: Input Consumption Data]
    User2[User: View Dashboard]
    User3[User: Request Prediction]
    
    %% Frontend components
    UI1[Input Form Component]
    UI2[Dashboard Component]
    UI3[Prediction Request Form]
    UI4[Results Display Component]
    
    %% API and processing
    API1[API: Receive Consumption Data]
    API2[API: Process Dashboard Request]
    API3[API: Handle Prediction Request]
    
    %% Data sources
    DB1[(User Consumption Database)]
    DB2[(Historical Usage Database)]
    Tariff[Fixed Tariff Rate: 0.4562 RM/kWh]
    Weather[Weather Data Service - Future Addon]
    
    %% Processing components
    Calc1[Basic Calculation Engine]
    Calc2[AI Prediction Engine]
    
    %% Results
    R1[Current Usage Cost]
    R2[Historical Usage Visualization]
    R3[Predicted Future Usage]
    R4[Predicted Future Cost]
    
    %% Data flow for current consumption
    User1 -->|Enter kWh| UI1
    UI1 -->|Submit Data| API1
    API1 -->|Store| DB1
    API1 -->|Retrieve Rate| Tariff
    API1 -->|Calculate Cost| Calc1
    Calc1 -->|Cost = kWh × 0.4562| R1
    R1 -->|Return| API1
    API1 -->|Display Cost| UI4
    UI4 -->|View Result| User2
    
    %% Data flow for dashboard view
    User2 -->|Request Dashboard| UI2
    UI2 -->|Fetch Data| API2
    API2 -->|Retrieve History| DB2
    API2 -->|Retrieve Rate| Tariff
    API2 -->|Generate Visualization| R2
    R2 -->|Return| API2
    API2 -->|Display Dashboard| UI2
    UI2 -->|View Dashboard| User2
    
    %% Data flow for prediction
    User3 -->|Request Prediction| UI3
    UI3 -->|Submit Request| API3
    API3 -->|Retrieve History| DB2
    API3 -->|Fetch Weather| Weather
    API3 -->|Generate Prediction| Calc2
    API3 -->|Retrieve Rate| Tariff
    Calc2 -->|Predict Usage| R3
    R3 -->|Calculate with Fixed Rate| R4
    R4 -->|Return| API3
    API3 -->|Display Prediction| UI4
    UI4 -->|View Prediction| User3
    
    %% Styling
    classDef user fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    classDef ui fill:#bbf,stroke:#33f,stroke-width:1px,color:#000
    classDef api fill:#bfb,stroke:#3a3,stroke-width:1px,color:#000
    classDef data fill:#fbb,stroke:#a33,stroke-width:1px,color:#000
    classDef calc fill:#bff,stroke:#3aa,stroke-width:1px,color:#000
    classDef result fill:#ffb,stroke:#aa3,stroke-width:1px,color:#000
    
    class User1,User2,User3 user
    class UI1,UI2,UI3,UI4 ui
    class API1,API2,API3 api
    class DB1,DB2,Tariff,Weather data
    class Calc1,Calc2 calc
    class R1,R2,R3,R4 result
```

### Data Flow Diagram Explanation

This data flow diagram illustrates the three primary user journeys in the EnergiWatch-MVP application and how data moves through the system for each scenario. The diagram emphasizes the consistent use of the fixed tariff rate across all calculations.

#### User Journeys

**1. Current Consumption Calculation:**

- User enters their consumption data in kilowatt-hours (kWh)
- The system retrieves the fixed tariff rate of 0.4562 RM/kWh
- A simple calculation multiplies consumption by the fixed rate
- Results are displayed to the user showing their current usage cost

**2. Dashboard View:**

- User requests to view their energy usage dashboard
- The system retrieves historical usage data and the fixed tariff rate
- Visualizations are generated showing usage patterns and associated costs
- The dashboard is displayed to the user with all relevant information

**3. Future Usage Prediction:**

- User requests a prediction of future energy usage and costs
- The system retrieves historical data and relevant weather information (from planned future Weather Data Service)
- The AI prediction engine generates usage forecasts
- Importantly, cost calculations always use the fixed tariff rate of 0.4562 RM/kWh
- Predicted usage and costs are displayed to the user

#### Flow Components

- **User Interface Components**: Forms for data input and components for displaying results
- **API Endpoints**: Specialized endpoints for handling different types of requests
- **Data Sources**: User data, historical data, weather data, and the fixed tariff rate
- **Calculation Engines**: Basic calculation for current usage and AI-powered prediction for future usage
- **Result Types**: Current costs, historical visualizations, and future predictions

#### Important Notes

- Across all flows, the tariff rate remains constant at 0.4562 RM/kWh. This fixed rate is used for both current calculations and future predictions, ensuring consistent and predictable cost estimates for users regardless of the AI prediction capabilities.
- The Weather Data Service shown in the diagram is marked as a future addon and is not yet implemented in the current codebase. When implemented, it will enhance prediction accuracy by incorporating weather patterns into the AI model.

---

## 3. Module Relationships

```mermaid
graph TD
    main.js
      ├── ui.js
      │   ├── chartUtils.js
      │   └── recommendations.js
      ├── state.js
      ├── storage.js
      ├── logic.js
      │   └── aiService.js
      ├── eventHandlers.js
      ├── logger.js (Optional)
      └── data.js (Optional)
```

### Module Relationships Diagram Explanation

This diagram illustrates the relationships between the JavaScript modules that make up the EnergiWatch-MVP application. It shows the dependency structure and how the modules interact with each other.

#### Module Functions

- **main.js**: The entry point of the application that orchestrates the overall functionality by coordinating other modules.
- **ui.js**: Manages the user interface components, handling user inputs and displaying results.
- **logic.js**: Contains the business logic for energy consumption calculations and tariff application.
- **data.js**: Manages data structures and transformations for the application.
- **state.js**: Handles application state management across components.
- **storage.js**: Provides functionality for data persistence and retrieval.
- **aiService.js**: Interfaces with AI prediction capabilities while maintaining fixed tariff rates.
- **eventHandlers.js**: Manages user interactions and event processing.
- **logger.js**: Provides logging functionality throughout the application.

#### Dependency Structure

- The **main.js** module serves as the application entry point, coordinating UI, logic, and event handling.
- The **ui.js** module depends on state and data modules to render and update the interface.
- The **logic.js** module contains the core business logic, including the fixed tariff calculations.
- The **data.js** module provides structured data access to other modules.
- The **aiService.js** module handles predictions while ensuring the fixed tariff rate is applied.

#### Implementation Note

The fixed tariff rate of 0.4562 RM/kWh is implemented in the **logic.js** module as a constant value, ensuring it's consistently applied across all calculations in the application. This architectural decision ensures that the tariff rate remains constant regardless of any AI-generated predictions.

---

> **Note:**
>
> - The tariff rate is fixed at 0.4562 RM/kWh and is not affected by the AI generator.
> - The diagrams are kept spacious and organized for readability.
