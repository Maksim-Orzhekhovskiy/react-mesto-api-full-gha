const BASE_AUTH_URL = "http://api.mesto.testo.nomoredomains.monster";

function checkResponseData(res) {
  if (!res.ok) {
    return Promise.reject(`Ошибка: ${res.status}`);
  }
  return res.json();
}

export function registration(email, password) {
  return fetch(`${BASE_AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://mesto.testo.nomoredomains.monster",
    },
    body: JSON.stringify({ email, password }),
  }).then(checkResponseData);
}

export function login(email, password) {
  return fetch(`${BASE_AUTH_URL}/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://mesto.testo.nomoredomains.monster",
    },
    body: JSON.stringify({ email, password }),
  }).then(checkResponseData);
}

export function getToken(jwt) {
  return fetch(`${BASE_AUTH_URL}/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      Origin: "https://mesto.testo.nomoredomains.monster",
    },
  }).then(checkResponseData);
}
