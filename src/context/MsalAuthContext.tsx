import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react'
import { MsalProvider } from '@azure/msal-react'
import axios from 'axios'
import { Configuration, PublicClientApplication } from '@azure/msal-browser'
import { PortalSettingNames } from 'src/@core/context/settingsContext'

interface MsalAuthContextType {
  hasMsalLoginActive: boolean
  pca: PublicClientApplication | null
}

const MsalAuthContext = createContext<MsalAuthContextType>({
  hasMsalLoginActive: false,
  pca: null
})

export const useMsalAuth = () => useContext(MsalAuthContext)

interface MsalAuthProviderProps {
  children: ReactNode
}

const MsalAuthProvider: React.FC<MsalAuthProviderProps> = ({ children }) => {
  const [hasMsalLoginActive, setHasMsalLoginActive] = useState<boolean>(false)
  const [pca, setPca] = useState<PublicClientApplication | null>(null)

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await axios.get(
          `/api/db_transactions/portal_settings/get?setting=${PortalSettingNames.auth_service_principal_client_id}`
        )
        const setting = response.data
        if (setting?.value_string) {
          setHasMsalLoginActive(true)
          const config: Configuration = {
            auth: {
              clientId: setting.value_string,
              authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
              redirectUri: `${process.env.NEXT_PUBLIC_URL}/login/auth-callback`
            },
            cache: {
              cacheLocation: 'sessionStorage',
              storeAuthStateInCookie: false
            }
          }
          setPca(new PublicClientApplication(config))
        } else {
          setHasMsalLoginActive(false)
        }
      } catch (error) {
        console.error('Error fetching authentication client id', error)
      }
    }

    fetchClientId()
  }, [])

  return (
    <MsalAuthContext.Provider value={{ hasMsalLoginActive, pca }}>
      {pca ? <MsalProvider instance={pca}>{children}</MsalProvider> : children}
    </MsalAuthContext.Provider>
  )
}

export default MsalAuthProvider
