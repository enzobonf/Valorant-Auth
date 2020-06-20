const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

require('dotenv').config()

axiosCookieJarSupport(axios);
 
const cookieJar = new tough.CookieJar();

let data = {
	'client_id': 'play-valorant-web-prod',
        'nonce': '1',
        'redirect_uri': 'https://beta.playvalorant.com/opt_in',
        'response_type': 'token id_token',
};

axios.post('https://auth.riotgames.com/api/v1/authorization', data, {jar: cookieJar, withCredentials: true})
  .then(response=> {
    
    //create an .env file at the root of the project and add these variables
    data = {
        'type': 'auth',
        'username': process.env.USER,
        'password': process.env.PASSWORD
    };
    
    axios.put('https://auth.riotgames.com/api/v1/authorization', data, {jar: cookieJar, withCredentials: true})
    .then(response=>{
      
      let uri = response.data.response.parameters.uri;
      let strTokens = uri.replace('https://beta.playvalorant.com/opt_in#', '').split('&');

      let arrayTokens = {};

      strTokens.forEach(token=>{
        arrayTokens[token.split('=')[0]] = token.split('=')[1];
      });

      console.log('Access Token:', arrayTokens.access_token)


      let headers = {
        'Authorization': `Bearer ${arrayTokens.access_token}`
      }

      axios.post('https://entitlements.auth.riotgames.com/api/token/v1', {}, {jar: cookieJar, withCredentials: true, headers})
      .then(response=>{

        let entitlements_token = response.data.entitlements_token;
        console.log('\nEntitlements Token:', entitlements_token);

        axios.post('https://auth.riotgames.com/userinfo', {}, {jar: cookieJar, withCredentials: true, headers})
        .then(response=>{

          let user_id = response.data.sub;
          console.log('\nPlayer Id:', user_id);

        });

      });

    });

  })
  .catch(error=> {
    console.log(error);
  });

