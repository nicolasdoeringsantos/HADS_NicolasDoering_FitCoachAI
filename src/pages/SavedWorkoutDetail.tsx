import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type WorkoutDetail = {
  workout_name: string;
  workout_content: string;
};

export default function SavedWorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkoutDetail = async () => {
      if (!id) {
        setError("ID do treino não fornecido.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_workouts')
          .select('workout_name, workout_content')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Treino não encontrado.");

        setWorkout(data);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar detalhes do treino.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetail();
  }, [id]);

  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f2f4f8',
    padding: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '800px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    color: '#333',
  };

  const markdownComponents = useMemo(() => ({
    table: (props: React.ComponentProps<'table'>) => <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }} {...props} />,
    th: (props: React.ComponentProps<'th'>) => <th style={{ border: '1px solid #ddd', background: '#f9fafb', padding: '0.5rem', textAlign: 'left' }} {...props} />,
    td: (props: React.ComponentProps<'td'>) => <td style={{ border: '1px solid #ddd', padding: '0.5rem' }} {...props} />,
  }), []);

  if (loading) {
    return <div style={pageStyle}><p>Carregando detalhes do treino...</p></div>;
  }

  if (error) {
    return <div style={pageStyle}><p style={{ color: '#d00' }}>{error}</p></div>;
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#16a34a', marginTop: 0 }}>{workout?.workout_name}</h1>
        <div className="markdown-content">
          <ReactMarkdown
            children={workout?.workout_content || ''}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          />
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '2rem',
          background: '#23272f',
          color: '#fff',
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