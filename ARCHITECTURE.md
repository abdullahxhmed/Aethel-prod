# AETHEL - React Native Architecture Guide

## Project Structure

```
/mnt/okcomputer/output/
├── App.js                 # Main app component and navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── babel.config.js       # Babel configuration
├── ARCHITECTURE.md       # This file
├── ROADMAP.md           # Development roadmap
├── TEAM.md              # Team roles and responsibilities
├── TOOLS.md             # Tools and dependencies guide
├── /src
│   ├── /components      # Reusable UI components
│   │   ├── /common      # Shared components (buttons, cards, etc.)
│   │   ├── /map         # Map-related components
│   │   ├── /issues      # Issue-related components
│   │   └── /gamification # Gamification components
│   ├── /screens         # App screens/pages
│   │   ├── AuthScreen.js
│   │   ├── MapScreen.js
│   │   ├── ReportScreen.js
│   │   ├── ProfileScreen.js
│   │   └── IssueDetailScreen.js
│   ├── /services        # API and backend services
│   │   ├── supabase.js  # Supabase client configuration
│   │   ├── auth.js      # Authentication service
│   │   ├── issues.js    # Issue management service
│   │   └── gamification.js # Points and badges service
│   ├── /hooks           # Custom React hooks
│   ├── /utils           # Utility functions
│   ├── /assets          # Images, fonts, and static assets
│   └── /styles          # Global styles and themes
├── /backend
│   ├── /supabase        # Supabase configuration and migrations
│   │   ├── schema.sql   # Database schema
│   │   ├── policies.sql # Row Level Security policies
│   │   └── functions.sql # Database functions
│   └── /api             # Custom API endpoints if needed
└── /web-dashboard       # Municipal dashboard (React web app)
    ├── /src
    │   ├── /components
    │   ├── /pages
    │   └── /services
    └── package.json
```

## Core Components

### 1. App.js - Main Application Component
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { GamificationProvider } from './src/contexts/GamificationContext';
import AuthScreen from './src/screens/AuthScreen';
import MapScreen from './src/screens/MapScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GamificationProvider>
    </AuthProvider>
  );
}
```

### 2. Supabase Configuration
```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Authentication Service
```javascript
// src/services/auth.js
import { supabase } from './supabase';

export const authService = {
  signUp: async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getCurrentUser: () => {
    return supabase.auth.user();
  }
};
```

### 4. Issue Management Service
```javascript
// src/services/issues.js
import { supabase } from './supabase';

export const issueService = {
  createIssue: async (issueData) => {
    return await supabase.from('issues').insert(issueData);
  },
  
  getIssues: async (filters = {}) => {
    let query = supabase.from('issues').select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    return await query;
  },
  
  updateIssueStatus: async (issueId, status) => {
    return await supabase.from('issues')
      .update({ status })
      .eq('id', issueId);
  },
  
  verifyIssue: async (issueId, vote, userId) => {
    return await supabase.from('verification_votes')
      .insert({
        issue_id: issueId,
        user_id: userId,
        vote: vote
      });
  }
};
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  civic_rank TEXT DEFAULT 'New Resident',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Issues Table
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Reported' 
    CHECK (status IN ('Reported', 'In Progress', 'Resolved', 'Verified', 'Closed')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Verification Votes Table
```sql
CREATE TABLE verification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL, -- true for "fixed", false for "not fixed"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);
```

### Badges Table
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0
);
```

### User Badges Table
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

## Key Features Implementation

### 1. Issue Reporting Workflow
1. User taps "Report Issue" button
2. Camera opens for photo capture
3. User selects category from predefined list
4. GPS automatically detects location (user can adjust)
5. Optional description field
6. Submit creates new issue in database

### 2. Community Verification System
1. When issue marked as "Resolved", verification phase begins
2. Community members can vote "Yes, it's fixed" or "No, still broken"
3. After threshold votes (e.g., 3 "Yes" votes), issue becomes "Verified"
4. Users who participate in verification earn points

### 3. Gamification Engine
1. Points awarded for various actions:
   - Report issue: +10 points
   - Verify resolution: +25 points
   - First to report fixed issue: +50 points
   - Daily challenges: +20 points
2. Badges earned for milestones:
   - Pothole Patrol (10 potholes reported)
   - The Verifier (25 successful verifications)
   - Community Steward (leadership role)

### 4. Predictive Hotspots
1. Algorithm analyzes historical issue data
2. Identifies geographic areas with high problem density
3. Visualizes as heatmap overlay on map
4. Helps municipalities allocate resources proactively

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS policies
2. **Input Validation**: Client and server-side validation
3. **File Upload Security**: Image type and size restrictions
4. **Rate Limiting**: Prevent spam and abuse
5. **Privacy Protection**: Anonymous reporting options

## Performance Optimizations

1. **Image Compression**: Automatic resizing and compression
2. **Pagination**: For large issue lists
3. **Caching**: Strategic data caching
4. **Lazy Loading**: Load map markers as needed
5. **Database Indexing**: Optimized queries for common operations

This architecture provides a solid foundation for building a scalable, secure, and user-friendly civic issue resolution platform that can be implemented within the 5-day hackathon timeframe.