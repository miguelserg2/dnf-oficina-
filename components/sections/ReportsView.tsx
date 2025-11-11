
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateReport } from '../../services/geminiService';
import Card from '../common/Card';

const ReportsView: React.FC = () => {
  const { tasks, documents, events } = useAppContext();
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError('');
    setReport('');
    
    const dataToProcess = {
      tasks,
      documents,
      events
    };

    const prompt = `Por favor, genera un informe basado en los siguientes datos de la oficina virtual:
    
    --- DATOS ---
    ${JSON.stringify(dataToProcess, null, 2)}
    --- FIN DE DATOS ---
    `;
    
    try {
      const result = await generateReport(prompt);
      setReport(result);
    } catch (err) {
      setError('Ocurrió un error al generar el informe. Por favor, revisa la consola para más detalles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Informes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Genera informes automáticos sobre la actividad de la oficina.</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            'Generar Nuevo Informe'
          )}
        </button>
      </div>

      <Card>
        {error && <p className="text-red-500">{error}</p>}
        
        {!report && !isLoading && (
            <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Listo para analizar</h3>
                <p className="text-gray-500 mt-2">Haz clic en "Generar Nuevo Informe" para obtener un resumen de la actividad de la oficina procesado por IA.</p>
            </div>
        )}
        
        {isLoading && (
            <div className="text-center py-16">
                <div role="status">
                    <svg aria-hidden="true" className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Cargando...</span>
                </div>
                <p className="mt-4 text-gray-500">Analizando datos y generando el informe...</p>
            </div>
        )}
        
        {report && (
          <div className="prose prose-lg dark:prose-invert max-w-none p-4 whitespace-pre-wrap">
            {report}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsView;
