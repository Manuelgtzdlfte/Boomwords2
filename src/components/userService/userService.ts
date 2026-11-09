// Types
export interface User {
  username: string;
  email: string;
  accessKey: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: Date;
}

// Simulated database using localStorage
export const userService = {
  // Register new user
  registerUser: (username: string, email: string, accessKey: string): boolean => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !accessKey || !accessKey.trim()) {
      return false;
    }

    const users = userService.getUsers();
    
    // Check if username or email already exists
    if (users.find(user => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return false; // Username taken
    }
    if (users.find(user => user.email.toLowerCase() === cleanEmail.toLowerCase())) {
      return false; // Email taken
    }
    
    const newUser: User = {
      username: cleanUsername,
      email: cleanEmail,
      accessKey,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date()
    };
    
    users.push(newUser);
    localStorage.setItem('boomwords_users', JSON.stringify(users));
    return true;
  },
  
  // Login user 
  loginUser: (username: string, accessKey: string): User | null => {
    const cleanUsername = username.trim();
    if (!cleanUsername || !accessKey) return null;

    const users = userService.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.accessKey === accessKey
    );
    return user || null;
  },
  
  // Get all users (for leaderboard)
  getUsers: (): User[] => {
    try {
      const usersJson = localStorage.getItem('boomwords_users');
      if (!usersJson) return [];
      const parsed = JSON.parse(usersJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  
  // Update user high score
  updateHighScore: (username: string, score: number): boolean => {
    const cleanUsername = username.trim();
    if (!cleanUsername) return false;

    const validScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const users = userService.getUsers();
    const userIndex = users.findIndex(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    
    if (userIndex === -1) return false;
    
    if (validScore > users[userIndex].highScore) {
      users[userIndex].highScore = validScore;
    }
    
    users[userIndex].gamesPlayed += 1;
    localStorage.setItem('boomwords_users', JSON.stringify(users));

    // Synchronize active session user data if it belongs to the same user
    try {
      const currentUserData = localStorage.getItem('boomwords_user_data');
      if (currentUserData) {
        const parsedCurrent: User = JSON.parse(currentUserData);
        if (
          parsedCurrent &&
          typeof parsedCurrent.username === 'string' &&
          parsedCurrent.username.toLowerCase() === cleanUsername.toLowerCase()
        ) {
          localStorage.setItem('boomwords_user_data', JSON.stringify(users[userIndex]));
        }
      }
    } catch {
      // Ignore malformed session cache
    }

    return true;
  },
  
  // Generate simple token (username + timestamp)
  generateToken: (username: string): string => {
    const payload = JSON.stringify({
      username: username.trim(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    try {
      return btoa(payload);
    } catch {
      return btoa(encodeURIComponent(payload));
    }
  },
  
  // Validate token
  validateToken: (token: string): string | null => {
    if (!token || typeof token !== 'string') return null;
    try {
      let raw = atob(token);
      if (raw.startsWith('%7B')) {
        raw = decodeURIComponent(raw);
      }
      const decoded = JSON.parse(raw);
      if (
        decoded &&
        typeof decoded.username === 'string' &&
        decoded.username.trim().length > 0 &&
        typeof decoded.expires === 'number' &&
        decoded.expires > Date.now()
      ) {
        return decoded.username;
      }
      return null;
    } catch {
      return null;
    }
  },
  
  // Save current user session
  setCurrentUser: (user: User): void => {
    const token = userService.generateToken(user.username);
    localStorage.setItem('boomwords_current_user', token);
    localStorage.setItem('boomwords_user_data', JSON.stringify(user));
  },
  
  // Get current user session
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('boomwords_current_user');
    const userData = localStorage.getItem('boomwords_user_data');
    
    if (!token || !userData) return null;
    
    const username = userService.validateToken(token);
    if (!username) {
      userService.logout();
      return null;
    }
    
    try {
      const parsedUser: User = JSON.parse(userData);
      if (!parsedUser || typeof parsedUser.username !== 'string') {
        userService.logout();
        return null;
      }
      if (parsedUser.username.toLowerCase() !== username.toLowerCase()) {
        userService.logout();
        return null;
      }

      // Sync with latest user record in storage if available
      const users = userService.getUsers();
      const latestUser = users.find(
        u => u.username.toLowerCase() === username.toLowerCase()
      );
      if (latestUser) {
        if (
          latestUser.highScore !== parsedUser.highScore ||
          latestUser.gamesPlayed !== parsedUser.gamesPlayed
        ) {
          localStorage.setItem('boomwords_user_data', JSON.stringify(latestUser));
        }
        return latestUser;
      }

      return parsedUser;
    } catch {
      userService.logout();
      return null;
    }
  },
  
  // Logout
  logout: (): void => {
    localStorage.removeItem('boomwords_current_user');
    localStorage.removeItem('boomwords_user_data');
  },
  
  // Recover password - returns access key if email exists
  recoverPassword: (email: string): string | null => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return null;
    const users = userService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    return user ? user.accessKey : null;
  },
  
  // Find user by email
  findUserByEmail: (email: string): User | null => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return null;
    const users = userService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    return user || null;
  }
};
