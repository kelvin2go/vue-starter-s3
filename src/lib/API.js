import axios from 'axios'

const API_URL = 'https://58687982-6669-4bce-a814-a159598e0227.mock.pstmn.io/api/w2/'
const OPTION = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 10000,
  baseURL: API_URL
}

const instance = axios.create(OPTION)

const API = {
  getOrder: (token) => {
    const path = 'trace/' + token
    return instance.get(path).then((data) => {
      console.log(data.data)
      console.log('--API--')
      if (data.data.order) {
        return data.data.order
      } else {
        console.log(data)
        throw new Error('Order status is currently not avaiable')
      }
    }).catch(function (error) {
      if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        // console.log(error.response.headers)
        throw error.response
      } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
        // console.log(error.request)
        throw error.request
      } else {
      // Something happened in setting up the request that triggered an Error
        // console.log('Error', error.message)
        throw error.message
      }
      // console.log(error.config)
    })
  }
}

export default API
