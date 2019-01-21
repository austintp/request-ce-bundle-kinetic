import axios from 'axios';
import { bundle } from 'react-kinetic-core';

export const login = (username, password) =>
  axios.post(
    `${bundle.spaceLocation()}/app/login.do`,
    {
      j_username: username,
      j_password: password,
    },
    {
      __bypassAuthInterceptor: true,
    },
  );

export const ssoLoginUrl = `${bundle.spaceLocation()}/app/saml/login/alias/${bundle.spaceSlug()}`;
