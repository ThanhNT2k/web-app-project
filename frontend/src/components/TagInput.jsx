import { useEffect, useState } from 'react';

import API from '../services/api';

function TagInput({ value = [], onChange }) {
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    API.tags.getAll()
      .then((res) => setAllTags(res.tags || []))
      .catch(() => setAllTags([]));
  }, []);

  const toggleTag = (name) => {
    if (value.includes(name)) {
      onChange(value.filter((t) => t !== name));
    } else {
      onChange([...value, name]);
    }
  };

  const addNewTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    if (!value.includes(name)) {
      onChange([...value, name]);
    }
    try {
      const res = await API.tags.create(name);
      if (res.tag && !allTags.find((t) => t.id === res.tag.id)) {
        setAllTags((prev) => [...prev, res.tag].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch {
      // tag may already exist locally
    }
    setNewTag('');
  };

  return (
    <div className="tag-input">
      <label className="small text-muted d-block mb-2">Thẻ (tag)</label>
      <div className="genres-grid mb-2">
        {allTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`genre-item ${value.includes(tag.name) ? 'genre-item-active' : ''}`}
            onClick={() => toggleTag(tag.name)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <div className="d-flex gap-2">
        <input
          className="form-control-cmc"
          placeholder="Tạo thẻ mới..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addNewTag();
            }
          }}
        />
        <button type="button" className="btn-cmc btn-cmc-outline" onClick={addNewTag}>
          + Thêm thẻ
        </button>
      </div>
      {value.length > 0 ? (
        <p className="small text-muted mt-2 mb-0">
          Đã chọn:
          {' '}
          {value.join(', ')}
        </p>
      ) : null}
    </div>
  );
}

export default TagInput;
