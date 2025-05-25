function EditableField({ value, label, onSave, className = "" }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await onSave(editedValue);
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`editable-field ${className}`}>
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className={`edit-input ${error ? 'error' : ''}`}
            disabled={isLoading}
          />
          <div className="edit-actions">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="save-btn"
            >
              {isLoading ? (
                <span className="loading-spinner">...</span>
              ) : (
                <Check size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setEditedValue(value);
                setIsEditing(false);
                setError(null);
              }}
              disabled={isLoading}
              className="cancel-btn"
            >
              <X size={16} />
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="view-mode">
          <span>{value || `No ${label} available`}</span>
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}