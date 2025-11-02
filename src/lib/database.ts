import { supabase } from './supabase'

export const initializeDatabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from('participants').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('Database tables might not exist yet. This is normal for first setup.')
      console.log('Please run the SQL schema in your Supabase SQL editor.')
      return false
    }
    
    console.log('Database connection successful!')
    return true
  } catch (error) {
    console.error('Failed to connect to database:', error)
    return false
  }
}

export const seedDefaultData = async () => {
  try {
    // Check if default admin exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('username', 'admin')
      .single()

    if (!existingAdmin) {
      // Insert default admin
      const { error } = await supabase
        .from('admins')
        .insert({ username: 'admin', password: 'admin123' })

      if (error) {
        console.error('Failed to create default admin:', error)
        return false
      }
      
      console.log('Default admin created successfully')
    }
    
    return true
  } catch (error) {
    console.error('Failed to seed default data:', error)
    return false
  }
}