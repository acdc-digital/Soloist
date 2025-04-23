<table>
  <tr>
    <td>
      <pre>
 ____        _       _     _   
/ ___|  ___ | | ___ (_)___| |_ 
\___ \ / _ \| |/ _ \| / __| __|
 ___) | (_) | | (_) | \__ \ |_ 
|____/ \___/|_|\___/|_|___/\__|
      </pre>
    </td>
  </tr>
</table>

# solo-heatMaps
Solo (Solomon Powered) heatMaps is a unique daily log. Users input a variety of objectives/ personal goals/ or unique &amp; custom requirements, and begin to fill out Daily Logs based on their experiences each day. Each day is then evaluated by Solomon (Ai) and scored from 0 (Worst-day-Ever) - 100 (Best-day-Ever). The scores are reflected in a heatmap.

#### Git Update Version Main Commands (steps)
1. git add .
2. git commit -m "Updated Soloist"
3. git push origin main

**development instructions:**   
4. git checkout -b *new-branch*   
5. git add ./ commit/ push as usual

Authetication:
```mermaid
flowchart TD
    classDef userClass fill:#e6f7ff,stroke:#1890ff,stroke-width:2px
    classDef authClass fill:#f6ffed,stroke:#52c41a,stroke-width:2px
    classDef dbClass fill:#fff7e6,stroke:#fa8c16,stroke-width:2px
    classDef appClass fill:#f9f0ff,stroke:#722ed1,stroke-width:2px
    classDef securityClass fill:#fff2f0,stroke:#f5222d,stroke-width:2px

    User([User]):::userClass
    
    subgraph "External Authentication"
        GitHub[GitHub OAuth Provider]
        Token[JWT Token]
    end
    
    subgraph "Convex Auth Layer"
        ConvexAuth[Convex Auth Service]
        Middleware[Route Middleware]
        ServerAuth[Server-side Auth]
    end
    
    subgraph "User Management"
        UserDoc[(User Document)]:::dbClass
        UserID[Unique User ID]:::dbClass
    end
    
    subgraph "Application State"
        Hooks[React Hooks]:::appClass
        Zustand[Zustand Store]:::appClass
        Context[UserContext]:::appClass
    end
    
    subgraph "Protected Resources"
        Routes[Protected Routes]:::securityClass
        API[API Access]:::securityClass
        Features[User Features]:::securityClass
    end
    
    User -->|1. Clicks Sign In| GitHub
    GitHub -->|2. Authenticates User| Token
    Token -->|3. Validates| ConvexAuth
    ConvexAuth -->|4. Creates/Updates| UserDoc
    UserDoc -->|5. Assigns| UserID
    UserID -->|6. Provides to| Hooks
    Hooks -->|7. Updates| Zustand
    Hooks -->|8. Populates| Context
    
    Context -->|9. Accesses| Routes
    Context -->|10. Authorizes| API
    Context -->|11. Enables| Features
    
    Middleware -->|Protects| Routes
    ServerAuth -->|Secures| API
    
    %% Connect the security components
    ConvexAuth -.->|Enforces| Middleware
    ConvexAuth -.->|Powers| ServerAuth
```