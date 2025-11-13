import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateReport } from '../../services/geminiService';
import Card from '../common/Card';
import { Task, Document, CalendarEvent, Report } from '../../types';
import { ArrowDownTrayIcon, TrashIcon } from '../Icons';
import { usePagination } from '../../hooks/usePagination';
import PaginationControls from '../common/PaginationControls';

type ReportType = 'daily' | 'monthly' | 'general';

const ReportsView: React.FC = () => {
  const { tasks, documents, events, reports, addReport, deleteReport } = useAppContext();
  
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [reportType, setReportType] = useState<ReportType>('general');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const {
    paginatedData: paginatedReports,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
  } = usePagination(reports, 8);


  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError('');
    setActiveReport(null);
    
    const sanitize = (item: Task | Document | CalendarEvent) => {
        const { attachment, ...rest } = item as any;
        if (attachment) {
            return { ...rest, attachment: { name: attachment.name, type: attachment.type } };
        }
        return rest;
    };
    
    let filteredTasks = tasks;
    let filteredDocuments = documents;
    let filteredEvents = events;
    let reportTitle = "Informe General";
    let periodDescription = "todos los datos históricos";

    if (reportType === 'daily') {
        const day = new Date(selectedDate);
        day.setUTCHours(0,0,0,0);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        filteredTasks = tasks.filter(t => new Date(t.dueDate) >= day && new Date(t.dueDate) < nextDay);
        filteredDocuments = documents.filter(d => new Date(d.createdAt) >= day && new Date(d.createdAt) < nextDay);
        filteredEvents = events.filter(e => new Date(e.start) >= day && new Date(e.start) < nextDay);
        
        reportTitle = `Informe Diario - ${day.toLocaleDateString()}`;
        periodDescription = `el día ${day.toLocaleDateString()}`;

    } else if (reportType === 'monthly') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        filteredTasks = tasks.filter(t => new Date(t.dueDate) >= startDate && new Date(t.dueDate) <= endDate);
        filteredDocuments = documents.filter(d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= endDate);
        filteredEvents = events.filter(e => new Date(e.start) >= startDate && new Date(e.start) <= endDate);

        reportTitle = `Informe Mensual - ${startDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;
        periodDescription = `el mes de ${startDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;
    }

    const dataToProcess = {
      tasks: filteredTasks.map(sanitize),
      documents: filteredDocuments.map(sanitize),
      events: filteredEvents.map(sanitize),
    };

    const prompt = `Por favor, genera un informe ejecutivo analizando la actividad de la oficina para ${periodDescription}.
    Si no hay datos para el período, indícalo claramente.
    --- DATOS ---
    ${JSON.stringify(dataToProcess, null, 2)}
    --- FIN DE DATOS ---
    `;
    
    try {
      const result = await generateReport(prompt);
      const newReportData = {
          title: reportTitle,
          content: result,
          generatedAt: new Date().toISOString()
      };
      const savedReport = addReport(newReportData);
      setActiveReport(savedReport);
    } catch (err) {
      setError('Ocurrió un error al generar el informe. Por favor, revisa la consola para más detalles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportReport = (report: Report) => {
    const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/ /g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este informe del historial?')) {
        if (activeReport?.id === reportId) {
            setActiveReport(null);
        }
        deleteReport(reportId);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
            <h2 className="text-xl font-bold mb-4">Generar Informe</h2>
            <div className="space-y-4">
                <div>
                    <label className="font-semibold text-sm">Tipo de Informe</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="w-full p-2 mt-1 input-field">
                        <option value="general">General</option>
                        <option value="daily">Diario</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
                {reportType === 'daily' && (
                    <div>
                        <label className="font-semibold text-sm">Seleccionar Día</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 mt-1 input-field" />
                    </div>
                )}
                {reportType === 'monthly' && (
                     <div>
                        <label className="font-semibold text-sm">Seleccionar Mes</label>
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-2 mt-1 input-field" />
                    </div>
                )}
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                        </>
                    ) : 'Generar'}
                </button>
            </div>
        </Card>
        <Card className="flex-grow flex flex-col">
            <h2 className="text-xl font-bold mb-4">Historial de Informes</h2>
            <div className="flex-grow space-y-2">
                {reports.length > 0 ? paginatedReports.map(r => (
                    <div key={r.id} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${activeReport?.id === r.id ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <div onClick={() => setActiveReport(r)} className="flex-grow">
                            <p className="font-semibold">{r.title}</p>
                            <p className="text-xs text-gray-500">{new Date(r.generatedAt).toLocaleString()}</p>
                        </div>
                         <button onClick={() => handleDeleteReport(r.id)} className="p-1 text-gray-400 hover:text-red-500 ml-2">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )) : <p className="text-center text-gray-500 text-sm py-4">No hay informes guardados.</p>}
            </div>
             {totalPages > 1 && (
                <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={nextPage}
                onPrevPage={prevPage}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                />
            )}
        </Card>
      </div>
      <div className="lg:col-span-2">
         <Card className="h-full min-h-[75vh]">
            {error && <p className="text-red-500">{error}</p>}
            
            {!activeReport && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Visor de Informes</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Selecciona una opción y genera un nuevo informe, o elige uno del historial para verlo aquí.</p>
                </div>
            )}
            
            {isLoading && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <svg aria-hidden="true" className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <p className="mt-4 text-gray-500">Analizando datos y generando el informe...</p>
                </div>
            )}

            {activeReport && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                        <div>
                            <h2 className="text-2xl font-bold">{activeReport.title}</h2>
                            <p className="text-sm text-gray-500">Generado: {new Date(activeReport.generatedAt).toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleExportReport(activeReport)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <ArrowDownTrayIcon className="w-5 h-5"/>
                            Exportar
                        </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none pt-4 overflow-y-auto flex-grow whitespace-pre-wrap">
                        {activeReport.content}
                    </div>
                </div>
            )}

         </Card>
      </div>
    </div>
  );
};

export default ReportsView;