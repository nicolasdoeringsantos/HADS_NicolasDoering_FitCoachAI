import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from './supabaseClient';

type Workout = {
  workout_name: string;
  workout_content: string;
};

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) {
        setError("ID do treino não encontrado.");
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
        if (!data) {
          // Se não houver dados, definimos um erro para ser exibido na tela.
          throw new Error("Treino não encontrado. Verifique o ID e tente novamente.");
        }
        setWorkout(data);

      } catch (err: any) {
        setError(err.message || "Ocorreu um erro ao buscar o treino.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

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
    textAlign: 'center',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '1rem',
  };

  // Componentes para o ReactMarkdown, para estilizar tabelas, etc.
  const markdownComponents = useMemo(() => ({
    table: (props: React.ComponentProps<'table'>) => <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid #ddd`, marginTop: '0.5rem', marginBottom: '0.75rem' }} {...props} />,
    th: (props: React.ComponentProps<'th'>) => <th style={{ border: `1px solid #ddd`, background: '#f9fafb', padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.875rem' }} {...props} />,
    td: (props: React.ComponentProps<'td'>) => <td style={{ border: `1px solid #ddd`, padding: '0.5rem 0.75rem', fontSize: '0.875rem' }} {...props} />,
    ul: (props: React.ComponentProps<'ul'>) => <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1rem' }} {...props} />,
  }), []);

  if (loading) {
    return <div style={pageStyle}><p>Carregando treino...</p></div>;
  }

  if (error) {
    return <div style={pageStyle}><p style={{ color: '#ff8a8a' }}>{error}</p></div>;
  }

  return (
    <div style={pageStyle}>
      {workout ? (
        <>
          <h1 style={titleStyle}>{workout.workout_name}</h1>
          <div style={cardStyle}>
            <ReactMarkdown children={workout.workout_content} remarkPlugins={[remarkGfm]} components={markdownComponents} />
          </div>
        </>
      ) : (
        <p>Treino não encontrado.</p>
      )}

      <button onClick={() => navigate(-1)} style={{ marginTop: '2rem', backgroundColor: '#FFD600', color: '#B71C1C', border: 'none', borderRadius: '50px', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
        Voltar
      </button>
    </div>
  );
}