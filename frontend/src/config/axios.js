import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;
//const USER_ID = process.env.USER_ID
// const baseURL = 'http://localhost:4000';
const USER_ID = 'SUB_1';

console.log('baseURL: ' + baseURL);
console.log('USER_ID: ' + USER_ID);

const axiosClient = axios.create({
  baseURL,
  headers: {
    'x-user-id': USER_ID,
  },
});

export default axiosClient;
