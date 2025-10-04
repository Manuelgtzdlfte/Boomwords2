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
    const users = userService.getUsers();
    
    // Check if username or email already exists
    if (users.find(user => user.username === username)) {
      return false; // Username taken
    }
    if (users.find(user => user.email === email)) {
      return false; // Email taken
    }
    
    const newUser: User = {
      username,
      email,
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
    const users = userService.getUsers();
    const user = users.find(u => u.username === username && u.accessKey === accessKey);
    return user || null;
  },
  
  // Get all users (for leaderboard)
  getUsers: (): User[] => {
    const usersJson = localStorage.getItem('boomwords_users');
    return usersJson ? JSON.parse(usersJson) : [];
  },
  
  // Update user high score
  updateHighScore: (username: string, score: number): boolean => {
    const users = userService.getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) return false;
    
    if (score > users[userIndex].highScore) {
      users[userIndex].highScore = score;
    }
    
    users[userIndex].gamesPlayed += 1;
    localStorage.setItem('boomwords_users', JSON.stringify(users));
    return true;
  },
  
  // Generate simple token (username + timestamp)
  generateToken: (username: string): string => {
    return btoa(JSON.stringify({
      username,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
  },
  
  // Validate token
  validateToken: (token: string): string | null => {
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.expires > Date.now()) {
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
    if (!username) return null;
    
    return JSON.parse(userData);
  },
  
  // Logout
  logout: (): void => {
    localStorage.removeItem('boomwords_current_user');
    localStorage.removeItem('boomwords_user_data');
  },
  
  // Recover password - returns access key if email exists
  recoverPassword: (email: string): string | null => {
    const users = userService.getUsers();
    const user = users.find(u => u.email === email);
    return user ? user.accessKey : null;
  },
  
  // Find user by email
  findUserByEmail: (email: string): User | null => {
    const users = userService.getUsers();
    const user = users.find(u => u.email === email);
    return user || null;
  }
};