export function setAuthToken(token :string) {
    if(typeof window !== 'undefined') {
        sessionStorage.setItem('auth_token', token)
        console.log("Token salvo no localStorage")
    }
}

export function getAuthToken() :string | null {
    if(typeof window !== 'undefined') {
        return sessionStorage.getItem('auth_token')
    }
    return null
}

export function removeAuthToken() {
    if(typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_token')
        console.log("Token removido do localStorage")
    }
}