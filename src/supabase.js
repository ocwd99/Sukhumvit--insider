import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glmtwqgyiynklanurkkm.supabase.co'
const supabaseKey = 'sb_publishable_4L1YDx70UcTXXDz7VSIHYw_wYtEgro_'

export const supabase = createClient(supabaseUrl, supabaseKey)
