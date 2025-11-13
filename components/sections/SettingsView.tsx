
import React from 'react';
import JSZip from 'jszip';
import { useAppContext } from '../../context/AppContext';
import { Theme, AppState } from '../../types';
import Card from '../common/Card';
import { SunIcon, MoonIcon, ComputerDesktopIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, ArchiveBoxArrowDownIcon } from '../Icons';
import { base64ToUint8Array } from '../../utils/fileUtils';


const SettingsView: React.FC = () => {
    const { theme, setTheme, tasks, documents, events, reports, loadStateFromFile } = useAppContext();

    const handleExport = () => {
        try {
            const stateToExport: AppState = { tasks, documents, events, reports, theme };
            const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(stateToExport, null, 2))}`;
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "dnf-oficina-virtual-datos.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Ocurrió un error al exportar los datos.");
        }
    };

    const handleExportZip = async () => {
        try {
            const zip = new JSZip();

            // 1. Add JSON data
            const stateToExport: AppState = { tasks, documents, events, reports, theme };
            zip.file("data.json", JSON.stringify(stateToExport, null, 2));

            // 2. Add attachments
            const attachmentsFolder = zip.folder("adjuntos");
            if(attachmentsFolder) {
                const allItems = [...tasks, ...documents, ...events];
                allItems.forEach(item => {
                    if (item.attachment) {
                        try {
                            const fileData = base64ToUint8Array(item.attachment.content);
                            // Avoid name collisions by prefixing with item id
                            const fileName = `${item.id}-${item.attachment.name}`;
                            attachmentsFolder.file(fileName, fileData);
                        } catch (e) {
                            console.error(`Error decoding or adding attachment for item ${item.id}:`, e);
                        }
                    }
                });
            }

            // 3. Generate and download ZIP
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", url);
            downloadAnchorNode.setAttribute("download", `dnf-oficina-virtual-backup-${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error exporting ZIP data:", error);
            alert("Ocurrió un error al exportar el backup completo.");
        }
    };


    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string.");
                
                const importedState = JSON.parse(text);
                
                if ('tasks' in importedState && 'documents' in importedState && 'events' in importedState && 'theme' in importedState) {
                    if (window.confirm("¿Estás seguro de que quieres importar estos datos? Se sobrescribirá toda la información actual guardada en este navegador.")) {
                        loadStateFromFile(importedState as AppState);
                        alert("Datos importados con éxito. La aplicación se actualizará con la nueva información.");
                    }
                } else {
                    throw new Error("Invalid data structure in JSON file.");
                }
            } catch (error) {
                console.error("Error importing data:", error);
                alert("Error al importar el archivo. Asegúrate de que es un archivo de datos válido de DNF.");
            } finally {
                event.target.value = '';
            }
        };
        reader.onerror = () => {
            alert("Error al leer el archivo.");
        };
        reader.readAsText(file);
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    };
    
    const themeOptions: {name: Theme, icon: React.ReactNode, label: string}[] = [
        { name: 'light', icon: <SunIcon className="w-5 h-5"/>, label: "Claro" },
        { name: 'dark', icon: <MoonIcon className="w-5 h-5"/>, label: "Oscuro" },
        { name: 'system', icon: <ComputerDesktopIcon className="w-5 h-5"/>, label: "Sistema" },
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ajustes</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona la apariencia y los datos de tu aplicación.</p>
            </div>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Apariencia</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Selecciona un tema para la interfaz.</p>
                <div className="flex flex-col sm:flex-row gap-2 rounded-lg p-1 bg-gray-200 dark:bg-gray-700 w-full sm:w-min">
                    {themeOptions.map(option => (
                        <button
                            key={option.name}
                            onClick={() => handleThemeChange(option.name)}
                            className={`flex items-center justify-center capitalize p-2 rounded-md w-full sm:w-28 transition-colors ${
                                theme === option.name ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                            }`}
                        >
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                        </button>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Gestión de Datos</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Guarda una copia de seguridad de todos tus datos en un archivo JSON o importa datos desde un archivo. La información se guarda únicamente en tu navegador.
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label
                            htmlFor="import-file-input"
                            title="Importar Datos (JSON)"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer text-center"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5" />
                            <span>Importar JSON</span>
                            <input
                                type="file"
                                id="import-file-input"
                                className="hidden"
                                accept=".json,application/json"
                                onChange={handleImport}
                            />
                        </label>

                        <button
                            onClick={handleExport}
                            title="Exportar Solo Datos (JSON)"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Exportar JSON</span>
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={handleExportZip}
                            title="Exportar Backup Completo (ZIP con Datos y Adjuntos)"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
                        >
                            <ArchiveBoxArrowDownIcon className="w-6 h-6" />
                            <span className="font-semibold">Exportar Backup Completo (ZIP)</span>
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2">Recomendado. Incluye todos los datos y archivos adjuntos.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsView;