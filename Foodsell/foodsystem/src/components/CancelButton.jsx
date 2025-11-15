import React, { useEffect, useState } from 'react';

// Props: createdAt (ISO string), onCancel() async function
const CancelButton = ({ createdAt, onCancel }) => {
  const end = new Date(createdAt).getTime() + 3 * 60 * 1000;
  const [remaining, setRemaining] = useState(Math.max(0, end - Date.now()));
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(Math.max(0, end - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [end]);

  if (remaining <= 0) return null;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');

  const handleClick = async () => {
    if (disabled) return;
    setDisabled(true);
    try {
      await onCancel();
    } catch (e) {
      // swallow - caller will show message
    } finally {
      setDisabled(false);
    }
  };

  return (
    <button className="cancel-button" onClick={handleClick} disabled={disabled}>
      Huỷ ({mins}:{secs})
    </button>
  );
};

export default CancelButton;
