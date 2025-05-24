export interface User {
  id?: number
  email: string
  password?: string
  date_of_birth?: Date
  is_admin: boolean
  is_blocked: boolean
}
