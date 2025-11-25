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
      // Ordena os dados no cliente para garantir a consistência do tipo
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
      // Atualiza a lista localmente
      if (type === 'treino') {
        setWorkouts(workouts.filter(w => w.id !== id));
      } else {
        setDiets(diets.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar plano:", error);
      alert("Falha ao deletar o plano.");
    }
  };

  const renderPlanList = (plans: (SavedWorkout | SavedDiet)[], type: 'treino' | 'dieta') => {
    if (plans.length === 0) {
      return <p className="text-gray-500">Nenhum plano salvo.</p>;
    }
    return (
      <ul className="space-y-3">
        {plans.map(plan => {
          const name = 'workout_name' in plan ? plan.workout_name : plan.diet_name;
          const content = 'workout_content' in plan ? plan.workout_content : plan.diet_content;
          return (
            <li key={plan.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Salvo em: {new Date(plan.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedPlan({ name, content })} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm">Visualizar</button>
                <button onClick={() => handleDelete(plan.id, type)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm">Deletar</button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando planos...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        &larr; Voltar
      </button>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Meus Planos Salvos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">🏋️ Planos de Treino</h2>
          {renderPlanList(workouts, 'treino')}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">🍎 Planos de Dieta</h2>
          {renderPlanList(diets, 'dieta')}
        </div>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedPlan.name}</h3>
              <button onClick={() => setSelectedPlan(null)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPlan.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPlans;