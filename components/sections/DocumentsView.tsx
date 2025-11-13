import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Document } from '../../types';
import Card from '../common/Card';
import { PlusIcon, PencilIcon, TrashIcon, PaperClipIcon, XIcon, ClockIcon } from '../Icons';
import { fileToBase64 } from '../../utils/fileUtils';
import { useAutosave } from '../../hooks/useAutosave';
import AutosaveIndicator from '../common/AutosaveIndicator';
import { usePagination } from '../../hooks/usePagination';
import PaginationControls from '../common/PaginationControls';
import VersionHistoryModal from '../common/VersionHistoryModal';

const DocumentsView: React.FC = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useAppContext();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Document> & { tagsString?: string }>({});
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const {
    paginatedData: paginatedDocuments,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
  } = usePagination(documents, 10);

  const handleSaveCallback = useCallback(async (dataToSave: Partial<Document> & { tagsString?: string }) => {
    if (!dataToSave.title || !dataToSave.author || !dataToSave.content) return;
    
    const docDataBase = { ...dataToSave, tags: dataToSave.tagsString?.split(',').map(t => t.trim()).filter(Boolean) || [] };
    delete docDataBase.tagsString;

    if (docDataBase.id) { // It's an existing document
        const docToUpdate = { ...docDataBase, updatedAt: new Date().toISOString() };
        updateDocument(docToUpdate as Document);
    } else { // It's a new document
        const newDoc = addDocument(docDataBase as Omit<Document, 'id' | 'createdAt' | 'updatedAt'>);
        // Update local form state with the new ID so subsequent saves are updates
        setFormData(prev => ({
            ...prev,
            id: newDoc.id,
            createdAt: newDoc.createdAt,
            updatedAt: newDoc.updatedAt,
        }));
        setSelectedDoc(newDoc); // Also update the main selectedDoc
    }
  }, [addDocument, updateDocument]);

  const [saveStatus, saveNow] = useAutosave({ data: formData, onSave: handleSaveCallback, interval: 2000 });

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setFormData({ ...doc, tagsString: doc.tags?.join(', ') || '' });
    setIsEditing(false);
  };

  const handleNewDoc = () => {
    const newDocTemplate = { title: '', author: '', content: '', documentNumber: '', attachment: undefined, startTime: '', endTime: '', category: '', tagsString: '' };
    setSelectedDoc(null);
    setFormData(newDocTemplate);
    setIsEditing(true);
  };

  const handleDelete = (docId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      deleteDocument(docId);
      setSelectedDoc(null);
      setIsEditing(false);
      setFormData({});
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const content = await fileToBase64(file);
      setFormData(prev => ({ ...prev, attachment: { name: file.name, type: file.type, content } }));
    }
  };
  
  const handleCloseEditor = () => {
      setIsEditing(false);
      if(selectedDoc) {
          handleSelectDoc(selectedDoc);
      } else {
          setFormData({});
      }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
        <div className="md:col-span-1 flex flex-col gap-4">
          <button
            onClick={handleNewDoc}
            className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Documento
          </button>
          <Card className="flex-grow flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Documentos</h2>
            <ul className="flex-grow">
              {paginatedDocuments.map(doc => (
                <li
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${selectedDoc?.id === doc.id && !isEditing ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <p className="font-semibold">{doc.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Por: {doc.author}</p>
                </li>
              ))}
              {documents.length === 0 && <p className="text-gray-500 text-center py-4">No hay documentos.</p>}
            </ul>
            {documents.length > 0 && <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              canGoNext={canGoNext}
              canGoPrev={canGoPrev}
            />}
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full overflow-y-auto">
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); saveNow(); }} className="space-y-4">
                <h2 className="text-2xl font-bold">{formData.id ? 'Editando Documento' : 'Nuevo Documento'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Título</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 w-full p-2 input-field" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Autor (Nombre)</label>
                    <input type="text" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} className="mt-1 w-full p-2 input-field" required/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Número de Documento</label>
                      <input type="text" value={formData.documentNumber || ''} onChange={e => setFormData({...formData, documentNumber: e.target.value})} className="mt-1 w-full p-2 input-field"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Categoría</label>
                      <input type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 w-full p-2 input-field"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Etiquetas (separadas por coma)</label>
                    <input type="text" value={formData.tagsString || ''} onChange={e => setFormData({...formData, tagsString: e.target.value})} className="mt-1 w-full p-2 input-field"/>
                  </div>
                
                <div>
                  <label className="block text-sm font-medium">Hora (de - hasta)</label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                      <input type="time" value={formData.startTime || ''} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-2 input-field"/>
                      <input type="time" value={formData.endTime || ''} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-2 input-field"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Descripción (Contenido)</label>
                  <textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} rows={10} className="mt-1 w-full p-2 input-field" required></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Adjuntar archivo</label>
                    {formData.attachment ? (
                      <div className="flex items-center gap-2 text-sm">
                          <PaperClipIcon className="w-5 h-5 text-gray-500"/>
                          <span>{formData.attachment.name}</span>
                          <button type="button" onClick={() => setFormData({...formData, attachment: undefined})} className="text-red-500 hover:text-red-700">
                            <XIcon className="w-4 h-4"/>
                          </button>
                      </div>
                    ) : (
                      <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    )}
                </div>

                <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
                  <button type="button" onClick={saveNow} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar ahora</button>
                  <button type="button" onClick={handleCloseEditor} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cerrar</button>
                  <AutosaveIndicator status={saveStatus} />
                </div>
              </form>
            ) : selectedDoc ? (
              <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{selectedDoc.title}</h2>
                        <p className="text-sm text-gray-500 mb-2">Por {selectedDoc.author} - Última mod.: {new Date(selectedDoc.updatedAt || selectedDoc.createdAt).toLocaleString()}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          {selectedDoc.documentNumber && <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded">Doc #: {selectedDoc.documentNumber}</p>}
                          {selectedDoc.category && <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded">Cat: {selectedDoc.category}</p>}
                          {selectedDoc.startTime && selectedDoc.endTime && <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded">Hora: {selectedDoc.startTime} - {selectedDoc.endTime}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsHistoryModalOpen(true)} title="Ver historial" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><ClockIcon className="w-5 h-5"/></button>
                        <button onClick={() => setIsEditing(true)} title="Editar" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(selectedDoc.id)} title="Eliminar" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                    </div>
                </div>

                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedDoc.tags.map(tag => (
                            <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{tag}</span>
                        ))}
                    </div>
                )}
                
                <hr className="my-4 dark:border-gray-700"/>
                
                {selectedDoc.attachment && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Archivo Adjunto</h3>
                      <a href={selectedDoc.attachment.content} download={selectedDoc.attachment.name} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline">
                          <PaperClipIcon className="w-5 h-5"/>
                          <span>{selectedDoc.attachment.name}</span>
                      </a>
                    </div>
                )}
                
                <h3 className="font-semibold mb-2">Contenido</h3>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  {selectedDoc.content}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Selecciona un documento para verlo o crea uno nuevo.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      {isHistoryModalOpen && selectedDoc && (
        <VersionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            history={selectedDoc.history || []}
            currentContent={selectedDoc.content}
            documentTitle={selectedDoc.title}
        />
      )}
    </>
  );
};

export default DocumentsView;