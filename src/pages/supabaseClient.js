// Importa a função `createClient` da biblioteca do Supabase.
import { createClient } from '@supabase/supabase-js'

// Pega a URL e a chave anônima do Supabase das variáveis de ambiente.
// `import.meta.env` é a forma padrão do Vite para acessar variáveis de ambiente no frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verifica se as variáveis de ambiente essenciais foram definidas.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Key must be defined in .env file with VITE_ prefix");
}

// Cria e exporta uma instância única do cliente Supabase.
// Esta instância será usada em todo o aplicativo para interagir com o banco de dados e a autenticação do Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
