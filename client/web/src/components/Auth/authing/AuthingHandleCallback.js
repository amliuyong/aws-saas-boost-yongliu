
import {useAuthContext} from './useAuthContext'
import {useEffect}from 'react'
import {useLocation, useHistory} from 'react-router-dom'
import authing from './config';


export function AuthingHandleCallback() {
    let location = useLocation();
    let query = new URLSearchParams(location.search);
    let code = query.get('code')
    let codeChallenge = localStorage.getItem('codeChallenge')
    let history = useHistory()
  
    const { dispatch } =  useAuthContext()
   
    useEffect(() => {
      (async () => {
        let tokenSet = await authing.getAccessTokenByCode(code, { codeVerifier: codeChallenge });
        const { access_token, id_token } = tokenSet;
        let userInfo = await authing.getUserInfoByAccessToken(tokenSet.access_token);
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('idToken', id_token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log("saved token to localStorage");
        dispatch({type: 'LOGIN', payload: userInfo})
        history.push('/');
        
      })()
    }, [])
  
    return <div>Loading...</div>
  }
  