export function setAuthToken(token :string) {
    if(typeof window !== 'undefined') {
        sessionStorage.setItem('user', token)
        console.log("Token salvo no localStorage")
    }
}

export function getAuthToken() :string | null {
    if(typeof window !== 'undefined') {
        return sessionStorage.getItem('user')
    }
    return null
}

export function removeAuthToken() {
    if(typeof window !== 'undefined') {
        sessionStorage.removeItem('user')
        console.log("Token removido do localStorage")
    }
}