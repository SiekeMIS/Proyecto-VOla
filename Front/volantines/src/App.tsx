import { useState, useEffect } from 'react'
import './App.css'

// Interfaces TypeScript
interface Volantin {
  id: number;
  nombre: string;
  diseño: string;
  medida: string;
  tipo_hilo: string;
  colores: string[];
  descripcion: string;
  imagen_url: string;
  fecha_creacion: string;
}

interface Opciones {
  diseños: string[];
  tipos_hilo: string[];
  colores_populares: string[];
}

function App() {
  const [volantines, setVolantines] = useState<Volantin[]>([]);
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVolantin, setEditingVolantin] = useState<Volantin | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar volantines y opciones
  useEffect(() => {
    fetchVolantines();
    fetchOpciones();
  }, []);

  const fetchVolantines = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/volantines');
      const data = await response.json();
      if (data.success) {
        setVolantines(data.volantines);
      }
    } catch (error) {
      console.error('Error fetching volantines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpciones = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/opciones');
      const data = await response.json();
      setOpciones(data);
    } catch (error) {
      console.error('Error fetching opciones:', error);
    }
  };

  // Manejar creación/edición
  const handleCreateVolantin = async (formData: any) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/volantines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        fetchVolantines(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error creating volantin:', error);
    }
  };

  const handleUpdateVolantin = async (formData: any) => {
    if (!editingVolantin) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/volantines/${editingVolantin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingVolantin(null);
        fetchVolantines(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error updating volantin:', error);
    }
  };

  const handleDeleteVolantin = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este volantín?')) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/volantines/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        if (data.success) {
          fetchVolantines(); // Recargar la lista
        }
      } catch (error) {
        console.error('Error deleting volantin:', error);
      }
    }
  };

  // Función para obtener color según el tipo de hilo
  const getHiloColor = (tipoHilo: string) => {
    const colors: { [key: string]: string } = {
      '10': '#ff6b6b',
      '4': '#4ecdc4',
      '0': '#45b7d1',
      '00': '#96ceb4',
      '000': '#feca57'
    };
    return colors[tipoHilo] || '#8395a7';
  };

  // Componente de Tarjeta de Volantín
  const VolantinCard = ({ volantin }: { volantin: Volantin }) => (
    <div className="volantin-card" style={{ borderColor: getHiloColor(volantin.tipo_hilo) }}>
      <div className="volantin-header">
        <h3 className="volantin-title">{volantin.nombre}</h3>
        <span 
          className="hilo-badge"
          style={{ backgroundColor: getHiloColor(volantin.tipo_hilo) }}
        >
          Hilo {volantin.tipo_hilo}
        </span>
      </div>
      
      <div className="volantin-details">
        <div className="detail-item">
          <span className="label">Diseño:</span>
          <span className="value">{volantin.diseño}</span>
        </div>
        <div className="detail-item">
          <span className="label">Medida:</span>
          <span className="value">{volantin.medida}</span>
        </div>
      </div>

      {volantin.colores && volantin.colores.length > 0 && (
        <div className="colores-section">
          <span className="label">Colores:</span>
          <div className="colores-list">
            {volantin.colores.map((color, index) => (
              <span 
                key={index}
                className="color-chip"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {volantin.descripcion && (
        <p className="volantin-description">{volantin.descripcion}</p>
      )}

      <div className="volantin-actions">
        <button 
          className="btn-edit"
          onClick={() => {
            setEditingVolantin(volantin);
            setShowForm(true);
          }}
        >
          ✏️ Editar
        </button>
        <button 
          className="btn-delete"
          onClick={() => handleDeleteVolantin(volantin.id)}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );

  // Componente de Formulario
  const VolantinForm = () => {
    const [formData, setFormData] = useState({
      nombre: editingVolantin?.nombre || '',
      diseño: editingVolantin?.diseño || '',
      medida: editingVolantin?.medida || '',
      tipo_hilo: editingVolantin?.tipo_hilo || '10',
      colores: editingVolantin?.colores || [],
      descripcion: editingVolantin?.descripcion || '',
      imagen_url: editingVolantin?.imagen_url || ''
    });

    const [nuevoColor, setNuevoColor] = useState('#ff6b6b');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingVolantin) {
        handleUpdateVolantin(formData);
      } else {
        handleCreateVolantin(formData);
      }
    };

    const agregarColor = () => {
      if (nuevoColor && !formData.colores.includes(nuevoColor)) {
        setFormData({
          ...formData,
          colores: [...formData.colores, nuevoColor]
        });
      }
    };

    const quitarColor = (color: string) => {
      setFormData({
        ...formData,
        colores: formData.colores.filter(c => c !== color)
      });
    };

    return (
      <div className="form-overlay">
        <form className="volantin-form" onSubmit={handleSubmit}>
          <h2>{editingVolantin ? 'Editar Volantín' : 'Nuevo Volantín'}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Volantín</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Diseño</label>
              <select
                value={formData.diseño}
                onChange={(e) => setFormData({...formData, diseño: e.target.value})}
                required
              >
                <option value="">Seleccionar diseño</option>
                {opciones?.diseños.map(diseño => (
                  <option key={diseño} value={diseño}>{diseño}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Medida</label>
              <input
                type="text"
                value={formData.medida}
                onChange={(e) => setFormData({...formData, medida: e.target.value})}
                placeholder="Ej: 40x40 cm"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Hilo</label>
              <select
                value={formData.tipo_hilo}
                onChange={(e) => setFormData({...formData, tipo_hilo: e.target.value})}
                required
              >
                {opciones?.tipos_hilo.map(tipo => (
                  <option key={tipo} value={tipo}>Hilo del {tipo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Colores</label>
            <div className="color-picker">
              <input
                type="color"
                value={nuevoColor}
                onChange={(e) => setNuevoColor(e.target.value)}
              />
              <button type="button" onClick={agregarColor} className="btn-add-color">
                + Agregar Color
              </button>
            </div>
            <div className="selected-colors">
              {formData.colores.map((color, index) => (
                <div key={index} className="selected-color">
                  <span 
                    className="color-preview"
                    style={{ backgroundColor: color }}
                  />
                  <span className="color-value">{color}</span>
                  <button 
                    type="button" 
                    onClick={() => quitarColor(color)}
                    className="btn-remove-color"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                setShowForm(false);
                setEditingVolantin(null);
              }} 
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {editingVolantin ? 'Actualizar' : 'Crear'} Volantín
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🎏 Volantines Calados</h1>
        <p>Gestiona tus diseños de volantines tradicionales</p>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Volantín
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="app-main">
        {loading ? (
          <div className="loading">Cargando volantines...</div>
        ) : volantines.length === 0 ? (
          <div className="empty-state">
            <h2>No hay volantines aún</h2>
            <p>Crea tu primer volantín haciendo clic en el botón de arriba</p>
          </div>
        ) : (
          <div className="volantines-grid">
            {volantines.map(volantin => (
              <VolantinCard key={volantin.id} volantin={volantin} />
            ))}
          </div>
        )}
      </main>

      {/* Formulario Modal */}
      {showForm && <VolantinForm />}
    </div>
  );
}

export default App;