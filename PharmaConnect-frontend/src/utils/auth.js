// User data still stored in localStorage for UI purposes only
// JWT tokens are now in httpOnly cookies (secure)
export const saveUser  = (user) => localStorage.setItem("user", JSON.stringify(user));
export const getUser   = ()     => JSON.parse(localStorage.getItem("user") || "null");
export const removeUser = ()    => localStorage.removeItem("user");

export const logout = () => {
  removeUser();
};

export const isAuthenticated = () => {
  // Check if user data exists (tokens are in httpOnly cookies)
  return !!getUser();
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};
