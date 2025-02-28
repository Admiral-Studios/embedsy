export default {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_APP_ID,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: `${process.env.NEXT_PUBLIC_URL}/login/auth-callback`
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
  }
}
