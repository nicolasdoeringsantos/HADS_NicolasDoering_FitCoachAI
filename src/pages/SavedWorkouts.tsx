import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

type SavedWorkout = {
  id: string;
  workout_name: string;
  created_at: string;
};

export default function SavedWorkouts() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");

        const { data, error } = await supabase
          .from('saved_workouts')
          .select('id, workout_name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Garante que 'workouts' seja sempre um array, mesmo se 'data' for null.
        setWorkouts(data || []);

      } catch (err: any) {
        setError(err.message || "Ocorreu um erro ao buscar os treinos.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#4c1d1d',
    color: 'white',
    padding: '2rem',
    paddingTop: '80px',
    fontFamily: 'system-ui, sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
    color: '#FFD600',
    textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
    marginBottom: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background 0.2s ease',
  };

  if (loading) {
    return <div style={pageStyle}><p>Carregando treinos...</p></div>;
  }

  if (error) {
    return <div style={pageStyle}><p style={{ color: '#ff8a8a' }}>{error}</p></div>;
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Meus Treinos Salvos</h1>

      {workouts.length === 0 ? (
        <p>Você ainda não salvou nenhum treino. Crie um no chat com o Personal Trainer AI!</p>
      ) : (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              style={cardStyle}
              onClick={() => navigate(`/meus-treinos/${workout.id}`)}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(0,0,0,0.25)"; }}
            >
              <h3 style={{ margin: 0, color: '#FFD600' }}>{workout.workout_name}</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#ddd', fontSize: '0.9rem' }}>
                Salvo em: {new Date(workout.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '2rem',
          backgroundColor: '#FFD600',
          color: '#B71C1C',
          border: 'none',
          borderRadius: '50px',
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Voltar
      </button>
    </div>
  );
}