import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    roles: [] as string[],
    token: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    login(username: string, token: string, roles: string[]) {
      this.username = username
      this.token = token
      this.roles = roles
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('roles', JSON.stringify(roles))
    },
    restoreFromStorage() {
      const token = localStorage.getItem('token') || ''
      const username = localStorage.getItem('username') || ''
      const roles = JSON.parse(localStorage.getItem('roles') || '[]')
      this.username = username
      this.token = token
      this.roles = roles
    },
    logout() {
      this.username = ''
      this.token = ''
      this.roles = []
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('roles')
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    }
  },
})
