import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type SavedWorkout = {
  id: string;
  workout_name: string;
  workout_content: string;
  created_at: string;
}

type SavedDiet = {
  id: string;
  diet_name: string;
  diet_content: string;
  created_at: string;
};

const SavedPlans: React.FC = () => {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [diets, setDiets] = useState<SavedDiet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; content: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Usuário não autenticado.");

      const { data: workoutData, error: workoutError } = await supabase
        .from('saved_workouts')
        .select('*')
        .eq('user_id', user.id);
      if (workoutError) throw workoutError;
      setWorkouts(workoutData ? workoutData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);

      const { data: dietData, error: dietError } = await supabase
        .from('saved_diets')
        .select('*')
        .eq('user_id', user.id);
      if (dietError) throw dietError;
      setDiets(dietData ? dietData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);

    } catch (error) {
      console.error("Erro ao buscar planos salvos:", error);
      alert("Não foi possível carregar seus planos salvos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id: string, type: 'treino' | 'dieta') => {
    const tableName = type === 'treino' ? 'saved_workouts' : 'saved_diets';
    const plans = type === 'treino' ? workouts : diets;
    const plan = plans.find(p => p.id === id);

    if (!plan) {
      alert("Plano não encontrado.");
      return;
    }

    const planName = 'workout_name' in plan ? plan.workout_name : plan.diet_name;
    if (!window.confirm(`Tem certeza que deseja deletar o plano "${planName}"?`)) {
      return;
    }
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;

      alert("Plano deletado com sucesso!");
      if (type === 'treino') {
        setWorkouts(workouts.filter(w => w.id !== id));
      } else {
        setDiets(diets.filter(d => d.id !== id));
      }
      if (selectedPlan && selectedPlan.name === planName) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Erro ao deletar plano:", error);
      alert("Falha ao deletar o plano.");
    }
  };

  const renderPlanList = (plans: (SavedWorkout | SavedDiet)[], type: 'treino' | 'dieta') => {
    if (plans.length === 0) {
      if (searchTerm) {
        return <p style={{ color: '#ddd' }}>Nenhum plano encontrado para "{searchTerm}".</p>;
      }
      return <p style={{ color: '#ddd' }}>Nenhum plano salvo nesta categoria.</p>;
    }
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plans.map(plan => {
          const name = 'workout_name' in plan ? plan.workout_name : plan.diet_name;
          const content = 'workout_content' in plan ? plan.workout_content : plan.diet_content;
          return (
            <li key={plan.id} style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s ease',
            }}>
              <div onClick={() => setSelectedPlan({ name, content })} style={{ cursor: 'pointer', flex: 1 }}>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#FFD600' }}>{name}</p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#ddd', fontSize: '0.9rem' }}>Salvo em: {new Date(plan.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedPlan({ name, content })} style={{ background: '#FFD600', color: '#B71C1C', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>Visualizar</button>
                <button onClick={() => handleDelete(plan.id, type)} style={{ background: '#B71C1C', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Deletar</button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#4c1d1d', color: 'white' }}>Carregando planos...</div>;
  }

  const filteredWorkouts = workouts.filter(workout =>
    workout.workout_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDiets = diets.filter(diet =>
    diet.diet_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#4c1d1d', color: 'white', padding: '2rem', boxSizing: 'border-box' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '2rem', background: '#FFD600', color: '#B71C1C', border: 'none', borderRadius: '50px', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)' }}>
        &larr; Voltar
      </button>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#FFD600', textShadow: '1px 1px 4px rgba(0,0,0,0.5)', marginBottom: '2rem', textAlign: 'center' }}>Meus Planos Salvos</h1>

      {/* Campo de Busca */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nome do plano..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', padding: '0.75rem 1.5rem', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {workouts.length === 0 && diets.length === 0 && !searchTerm ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#FFD600' }}>Você ainda não tem planos salvos.</h2>
            <p style={{ marginTop: '0.5rem', color: '#ddd' }}>
              Vá para a tela de chat para criar seu primeiro plano de treino ou dieta com nossos especialistas de IA!
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#FFD600' }}>🏋️ Planos de Treino</h2>
              {renderPlanList(filteredWorkouts, 'treino')}
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#FFD600' }}>🍎 Planos de Dieta</h2>
              {renderPlanList(filteredDiets, 'dieta')}
            </div>
          </>
        )}
      </div>

      {selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 50 }} onClick={() => setSelectedPlan(null)}>
          <div style={{ background: '#2D0D0D', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD600' }}>{selectedPlan.name}</h3>
              <button onClick={() => setSelectedPlan(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPlan.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPlans;