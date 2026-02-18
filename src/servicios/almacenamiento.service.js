const TOKEN_KEY = "token_campesena";
const REFRESH_KEY = "refresh";
const USER_KEY = "usuario";

export const eliminarToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const obtenerToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};